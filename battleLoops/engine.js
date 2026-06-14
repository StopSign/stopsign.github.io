
let engine = {
    /** Playable band for lanes (`inset`, `laneWidth`) - uses `viewData.layout.battlefieldWidthPx` / `gameData.battle`, not DOM measurements. */
    getBattleLaneMetrics: function() {
        const gd = gameData.battle;
        const bw = Math.max(1, Number(viewData.layout.battlefieldWidthPx) || gd.battlefieldWidthPx || 1);
        let insetRaw = gd.laneHorizontalInsetPx !== undefined ? gd.laneHorizontalInsetPx : 0;
        const maxInset = Math.floor(bw * 0.2);
        const inset = Math.min(Math.max(0, insetRaw), maxInset);
        const playable = Math.max(1, bw - 2 * inset);
        const n = gd.laneCount;
        const laneWidth = playable / n;
        return { battleWidth: bw, playableWidth: playable, laneWidth, inset, laneCount: n };
    },
    runResortTick: function(elapsedMs) {
        engine.updateResortTimers(elapsedMs);
        engine.updateMapClearProgressTimers(elapsedMs);
        engine.updateBaseProduction(elapsedMs);
        engine.updateZenkoResort(elapsedMs);
        engine.updateScrollArchivesResearch(elapsedMs);
    },
    updateResortTimers: function(elapsedMs) {
        if (!data.progress) {
            return;
        }
        data.progress.classSwitchCooldownMs = Math.max(0, (data.progress.classSwitchCooldownMs || 0) - elapsedMs);
    },
    gameTick: function() {
        data.gameSettings.ticksForSeconds++;

        const tickMs = 1000 / data.gameSettings.ticksPerSecond;
        engine.runResortTick(tickMs);
        if (data.battle.state !== "running") {
            return;
        }
        if (engine.updateMapTransitionCountdown(tickMs)) {
            return;
        }
        data.battle.elapsedMs += tickMs * engine.getBattleTimeRateMultiplier();

        if (data.battle.mode === "foraging") {
            engine.spawnForageZonesForTime();
        } else {
            engine.spawnZonesForTime();
        }
        engine.updateIntruderMovement(tickMs);
        engine.updateCurrentZoneInfo();
        if (data.battle.mode !== "foraging") {
            engine.updateEnduranceSkillExp(tickMs);
            engine.updateRecoveryEachSecond(tickMs);
            engine.updatePassiveSkillExp(tickMs);
            engine.updateClassEffects(tickMs);
        } else {
            engine.updateForagingPassiveSkillExp(tickMs);
        }
        engine.updateTargeting();
        engine.updatePlayerAttack(tickMs);
        if (data.battle.mode !== "foraging") {
            engine.updateSandalAttack(tickMs);
            engine.updateIntruderAttacks(tickMs);
        }
        engine.cleanupDeadEnemies();
        engine.checkMapCompletion();
        engine.checkLossCondition();
    },
    getMapClearState: function(mapKey) {
        if (!data.progress.mapClearProgress) {
            data.progress.mapClearProgress = {};
        }
        if (!data.progress.mapClearProgress[mapKey]) {
            data.progress.mapClearProgress[mapKey] = { pct: 0, activeMs: 0 };
        }
        return data.progress.mapClearProgress[mapKey];
    },
    gardenSmartHarvestBlocksAutoCountdown: function() {
        const g = data.progress.base && data.progress.base.garden;
        return !!(g && g.smartHarvestUnlocked);
    },
    maybeStartHarvestRespawnCountdown: function(mapKey) {
        const state = engine.getMapClearState(mapKey);
        if (state.pct < 100 || (state.activeMs || 0) > 0) {
            return;
        }
        if (engine.gardenSmartHarvestBlocksAutoCountdown()) {
            return;
        }
        state.activeMs = gameData.battle.mapHarvestRespawnDurationMs;
    },
    addMapClearProgressForKill: function(mapKey) {
        const state = engine.getMapClearState(mapKey);
        state.pct = Math.min(100, state.pct + 0.5);
        engine.maybeStartHarvestRespawnCountdown(mapKey);
    },
    updateMapClearProgressTimers: function(tickMs) {
        const states = data.progress.mapClearProgress || {};
        const keys = Object.keys(states);
        for (let i = 0; i < keys.length; i++) {
            const st = states[keys[i]];
            if (!st || st.activeMs <= 0) continue;
            st.activeMs = Math.max(0, st.activeMs - tickMs);
            if (st.activeMs <= 0) {
                st.pct = 0;
            } else {
                st.pct = Math.max(0, Math.min(100, (st.activeMs / gameData.battle.mapHarvestRespawnDurationMs) * 100));
            }
        }
    },
    isMapHarvestReady: function(mapKey) {
        const st = engine.getMapClearState(mapKey);
        return (st.pct >= 100 || st.activeMs > 0) && st.activeMs > 0;
    },
    getSandalIntruderStopY: function(playerTopY, battleHeight) {
        return playerTopY - 200;
    },
    isLaneSpotOccupied: function(targetLane, yPx, sizePx, skipIntruderId) {
        for (let i = 0; i < data.battle.enemies.length; i++) {
            const e = data.battle.enemies[i];
            if (!e.alive || e.id === skipIntruderId || e.lane !== targetLane) {
                continue;
            }
            if (Math.abs(e.yPx - yPx) < Math.max(sizePx, e.sizePx)) {
                return true;
            }
        }
        return false;
    },
    trySlapLaneShift: function(intruder) {
        const centerLane = Math.floor(gameData.battle.laneCount / 2);
        const options = [intruder.lane - 1, intruder.lane + 1];
        options.sort(function(a, b) {
            return Math.abs(a - centerLane) - Math.abs(b - centerLane);
        });
        for (let i = 0; i < options.length; i++) {
            const lane = options[i];
            if (lane < 0 || lane >= gameData.battle.laneCount) {
                continue;
            }
            if (engine.isLaneSpotOccupied(lane, intruder.yPx, intruder.sizePx, intruder.id)) {
                continue;
            }
            intruder.lane = lane;
            intruder.blockedByLecherMs = 0;
            return true;
        }
        return false;
    },
    spawnZonesForTime: function() {
        const map = initialize.getCurrentMapDefinition();
        if (!map || !map.zones) {
            return;
        }
        const tierMult = mapData.getTierDifficultyMultiplier(data.battle.mapTier || 0);
        const gd = gameData.battle;
        for (let i = 0; i < map.zones.length; i++) {
            if (data.battle.zoneSpawnedInCycle[i]) {
                continue;
            }
            if (data.battle.elapsedMs < map.zones[i].startTimeMs) {
                continue;
            }
            const z = map.zones[i];
            const rows = mapData.createZoneSpawnRows(map, i, tierMult);
            const laneSeedBase = (data.battle.generatedFromSeed || data.battle.seed || 1337);
            const laneRng = gameData.seededRandomFactory((laneSeedBase + ((i + 1) * 92821)) >>> 0);
            const lm = engine.getBattleLaneMetrics();
            const spdMult = 1 + ((data.battle.levelState && data.battle.levelState.levelSpd) || 0) * 0.1;
            const travelSpd = gd.intruderTravelSpeedPxPerSecond;
            const spacingPx = rows.length > 1 ? Math.max(0, z.distanceBetweenUnits || 0) : 0;
            for (let ri = 0; ri < rows.length; ri++) {
                const row = rows[ri];
                row.lane = Math.floor(laneRng() * gd.laneCount);
                // Combat battlefield units are 20% smaller (visual + collision footprint).
                row.sizeLaneFill = gd.intruderSizeLaneFill * 0.8;
                row.speedPxPerSecond = travelSpd;
                row.attackCooldownMs = gd.intruderAttackCooldownMs;
                row.attackTimerMs = gd.intruderAttackCooldownMs;
                const intruderId = data.battle.intruderIdCounter;
                data.battle.intruderIdCounter++;
                const intruderSize = Math.floor(lm.laneWidth * row.sizeLaneFill);
                const maxHp = Math.max(1, Math.round(row.rawHp !== undefined ? row.rawHp : row.maxHp));
                const attackDamage = Math.max(1, Math.round(row.rawDamage !== undefined ? row.rawDamage : row.attackDamage));
                const yPx = -intruderSize - ri * spacingPx;
                data.battle.enemies.push({
                    id: intruderId,
                    lane: row.lane,
                    spawnTimeMs: z.startTimeMs,
                    zoneIndex: row.zoneIndex,
                    intruderType: row.intruderType || "scoundrel",
                    yPx: yPx,
                    prevYPx: yPx,
                    sizePx: intruderSize,
                    hp: maxHp,
                    maxHp: maxHp,
                    speedPxPerSecond: row.speedPxPerSecond * spdMult,
                    attackDamage: attackDamage,
                    attackCooldownMs: row.attackCooldownMs,
                    attackTimerMs: row.attackTimerMs,
                    gain: row.gain,
                    expBase: row.expBase !== undefined ? row.expBase : 1,
                    inRange: false,
                    lecherReady: false,
                    alive: true,
                    hasEnteredSlapQueue: false,
                    blockedByLecherMs: 0
                });
            }
            data.battle.zoneSpawnedInCycle[i] = true;
            if (!data.battle.zoneRewardGrantedInCycle) {
                data.battle.zoneRewardGrantedInCycle = [];
            }
            if (data.battle.zoneRewardGrantedInCycle[i] === undefined) {
                data.battle.zoneRewardGrantedInCycle[i] = false;
            }
        }
    },
    spawnForageZonesForTime: function() {
        const map = initialize.getCurrentMapDefinition();
        const zones = map && map.forageZones ? map.forageZones : [];
        if (!zones.length) {
            return;
        }
        const gd = gameData.battle;
        const lm = engine.getBattleLaneMetrics();
        const grouped = {};
        for (let i = 0; i < zones.length; i++) {
            const idx = Math.max(0, zones[i].index || 0);
            if (!grouped[idx]) grouped[idx] = [];
            grouped[idx].push(zones[i]);
        }
        const indexes = Object.keys(grouped).map(function(v) { return parseInt(v, 10); }).sort(function(a, b) { return a - b; });
        let nextIndex = -1;
        for (let i = 0; i < indexes.length; i++) {
            const idx = indexes[i];
            if (data.battle.forageIndexSpawned[idx]) continue;
            nextIndex = idx;
            break;
        }
        if (nextIndex < 0) return;
        let hasEarlierAlive = false;
        for (let i = 0; i < indexes.length; i++) {
            const idx = indexes[i];
            if (idx >= nextIndex) break;
            for (let j = 0; j < data.battle.enemies.length; j++) {
                const e = data.battle.enemies[j];
                if (e.alive && e.forageIndex === idx) {
                    hasEarlierAlive = true;
                    break;
                }
            }
            if (hasEarlierAlive) break;
        }
        if (hasEarlierAlive) return;
        const spawnGroup = grouped[nextIndex] || [];
        for (let gi = 0; gi < spawnGroup.length; gi++) {
            const z = spawnGroup[gi];
            const spacingPx = Math.max(0, z.distanceBetweenUnits || 0);
            for (let ri = 0; ri < Math.max(1, z.totalEnemies || 1); ri++) {
                const kind = z.unitType || "tree";
                const prevCount = data.battle.forageKindSpawnCounts[kind] || 0;
                data.battle.forageKindSpawnCounts[kind] = prevCount + 1;
                const hpScale = Math.pow(1.05, prevCount);
                const maxHp = Math.max(1, Math.ceil((z.baseHp || 10) * hpScale));
                const intruderId = data.battle.intruderIdCounter++;
                const lane = (gi + ri) % gd.laneCount;
                const intruderSize = kind === "tree" ? Math.floor(lm.laneWidth * 0.35) : Math.floor(lm.laneWidth * 0.28);
                const yPx = -intruderSize - (ri * spacingPx);
                const staminaCost = kind === "tree" ? 2 : (kind === "ore_vein" ? 3 : 1);
                data.battle.enemies.push({
                    id: intruderId,
                    lane: lane,
                    spawnTimeMs: 0,
                    zoneIndex: nextIndex,
                    forageIndex: nextIndex,
                    intruderType: kind,
                    yPx: yPx,
                    prevYPx: yPx,
                    sizePx: intruderSize,
                    hp: maxHp,
                    maxHp: maxHp,
                    speedPxPerSecond: 0,
                    attackDamage: 0,
                    attackCooldownMs: 0,
                    attackTimerMs: 0,
                    gain: z.rewardAmount || 1,
                    rewardResource: z.rewardResource || "logs",
                    expBase: z.expBasePerIntruder !== undefined ? z.expBasePerIntruder : 1,
                    inRange: false,
                    lecherReady: false,
                    alive: true,
                    hasEnteredSlapQueue: false,
                    blockedByLecherMs: 0,
                    staminaCost: staminaCost,
                    firstHitTaken: false
                });
            }
        }
        data.battle.forageIndexSpawned[nextIndex] = true;
    },
    grantWorkersForMapStar: function(mapKey, amount) {
        if (!mapKey || !amount || amount <= 0) return;
        if (!data.progress.mapWorkersFound) data.progress.mapWorkersFound = {};
        if (data.progress.mapWorkersFound[mapKey] === undefined) data.progress.mapWorkersFound[mapKey] = 0;
        const maxWorkers = 6;
        data.progress.mapWorkersFound[mapKey] = Math.min(maxWorkers, data.progress.mapWorkersFound[mapKey] + amount);
    },
    updateIntruderMovement: function(tickMs) {
        const battleHeight = viewData.layout.battlefieldHeightPx || 500;
        const playerTopY = viewData.layout.playerTopPx || (battleHeight - 65);
        const deltaSeconds = tickMs / 1000;
        const pushBonus = engine.getIntruderPushBonusPxPerSecond();
        if ((data.battle.mode || "combat") === "foraging" && pushBonus > 0) {
            data.battle.forageMoveAccumPx = (data.battle.forageMoveAccumPx || 0) + (pushBonus * deltaSeconds);
        }
        const laneBuckets = [];
        for (let l = 0; l < gameData.battle.laneCount; l++) {
            laneBuckets[l] = [];
        }
        for (let i = 0; i < data.battle.enemies.length; i++) {
            const intruder = data.battle.enemies[i];
            if (intruder.alive) {
                laneBuckets[intruder.lane].push(intruder);
            }
        }
        for (let lane = 0; lane < gameData.battle.laneCount; lane++) {
            const laneEnemies = laneBuckets[lane];
            if (laneEnemies.length === 0) {
                continue;
            }
            laneEnemies.sort(function(a, b) {
                if (a.yPx !== b.yPx) {
                    return a.yPx - b.yPx;
                }
                return a.id - b.id;
            });
            for (let j = laneEnemies.length - 1; j >= 0; j--) {
                const intruder = laneEnemies[j];
                intruder.prevYPx = intruder.yPx;
                const dy = (intruder.speedPxPerSecond + pushBonus) * deltaSeconds;
                let tentativeY = intruder.yPx + dy;
                if (intruder.intruderType === "lecher") {
                    const wasReady = !!intruder.lecherReady;
                    const stopY = engine.getSandalIntruderStopY(playerTopY, battleHeight);
                    if (j === laneEnemies.length - 1) {
                        const baseDy = intruder.speedPxPerSecond * deltaSeconds;
                        const pushDy = pushBonus * deltaSeconds;
                        let baseY = intruder.yPx;
                        if (baseY < stopY) {
                            baseY = Math.min(stopY, baseY + baseDy);
                        }
                        tentativeY = baseY + pushDy;
                        if (tentativeY + intruder.sizePx >= playerTopY) {
                            intruder.yPx = playerTopY - intruder.sizePx;
                            intruder.inRange = true;
                            if (!intruder.hasEnteredSlapQueue) {
                                intruder.hasEnteredSlapQueue = true;
                                data.battle.slapQueue.push(intruder.id);
                            }
                        } else {
                            intruder.yPx = tentativeY;
                            intruder.inRange = false;
                        }
                        intruder.lecherReady = intruder.inRange || (intruder.yPx >= stopY);
                        if (!wasReady && intruder.lecherReady) {
                            intruder.attackTimerMs = intruder.attackCooldownMs * 2;
                        }
                    } else {
                        const below = laneEnemies[j + 1];
                        const maxY = below.yPx - intruder.sizePx;
                        if (tentativeY > maxY) {
                            tentativeY = maxY;
                        }
                        intruder.yPx = tentativeY;
                        intruder.inRange = false;
                        intruder.lecherReady = false;
                    }
                    continue;
                }
                if (j === laneEnemies.length - 1) {
                    if (tentativeY + intruder.sizePx >= playerTopY) {
                        intruder.yPx = playerTopY - intruder.sizePx;
                        intruder.inRange = true;
                        if (!intruder.hasEnteredSlapQueue) {
                            intruder.hasEnteredSlapQueue = true;
                            data.battle.slapQueue.push(intruder.id);
                        }
                    } else {
                        intruder.yPx = tentativeY;
                        intruder.inRange = false;
                    }
                } else {
                    const below = laneEnemies[j + 1];
                    const maxY = below.yPx - intruder.sizePx;
                    const blockedByLecher = below.intruderType === "lecher" && !below.inRange && tentativeY > maxY;
                    if (tentativeY > maxY) {
                        tentativeY = maxY;
                    }
                    intruder.yPx = tentativeY;
                    intruder.inRange = false;
                    if (blockedByLecher) {
                        intruder.blockedByLecherMs = (intruder.blockedByLecherMs || 0) + tickMs;
                        if (intruder.blockedByLecherMs >= 500) {
                            if (!engine.trySlapLaneShift(intruder)) {
                                intruder.blockedByLecherMs = 0;
                            }
                        }
                    } else {
                        intruder.blockedByLecherMs = 0;
                    }
                }
            }
        }
        if ((data.progress.currentClassKey || "none") === "mockery" && (data.battle.classRetreatMs || 0) > 0) {
            const spd = data.battle.levelState.levelSpd || 0;
            const retreatRate = (gameData.battle.intruderTravelSpeedPxPerSecond + gameData.battle.idlePushBonusPxPerSecond) * (1 + (spd * 0.1));
            const retreatDy = retreatRate * deltaSeconds;
            for (let i = 0; i < data.battle.enemies.length; i++) {
                const intruder = data.battle.enemies[i];
                if (!intruder.alive) continue;
                intruder.yPx = Math.max(-intruder.sizePx, intruder.yPx - retreatDy);
                if (intruder.yPx + intruder.sizePx < playerTopY) {
                    intruder.inRange = false;
                    if (intruder.intruderType === "lecher") {
                        intruder.lecherReady = false;
                    }
                }
            }
        }
    },
    updateTargeting: function() {
        const nextQueue = [];
        for (let i = 0; i < data.battle.slapQueue.length; i++) {
            const queued = engine.findIntruderById(data.battle.slapQueue[i]);
            if (queued && queued.alive && queued.inRange) {
                nextQueue.push(queued.id);
            }
        }
        data.battle.slapQueue = nextQueue;
        if (data.battle.activeTargetId !== null) {
            const existingTarget = engine.findIntruderById(data.battle.activeTargetId);
            if (existingTarget && existingTarget.alive && existingTarget.inRange) {
                return;
            }
            data.battle.activeTargetId = null;
        }
        for (let i = 0; i < data.battle.slapQueue.length; i++) {
            const intruderId = data.battle.slapQueue[i];
            const candidate = engine.findIntruderById(intruderId);
            if (candidate && candidate.alive) {
                data.battle.activeTargetId = candidate.id;
                return;
            }
        }
    },
    getAlacrityCooldownReductionMs: function() {
        const e = skills.getSkillEffect("alacrity");
        return e.alacrityEffectiveLevel || 0;
    },
    getEffectiveSlapCooldownMs: function() {
        const cd = gameData.battle.cooldowns;
        return Math.max(cd.slapFloorMs, cd.slapBaseMs - (engine.getAlacrityCooldownReductionMs() * cd.alacritySlapReductionPerLevelMs));
    },
    getEffectiveSandalCooldownMs: function() {
        const cd = gameData.battle.cooldowns;
        return Math.max(cd.sandalFloorMs, cd.sandalBaseMs - (engine.getAlacrityCooldownReductionMs() * cd.alacritySandalReductionPerLevelMs));
    },
    getUnlockedSkillLevel: function(skillKey) {
        if (!skills.isSkillUnlocked(skillKey)) {
            return 0;
        }
        const s = data.progress.skills[skillKey];
        return s ? (s.level || 0) : 0;
    },
    getSlapRechargeMultiplier: function() {
        const pEff = skills.getSkillEffect("preparation");
        const prepBonus = pEff.preparationIdleRechargeFraction || 0;
        if (engine.anyIntruderInSlapRange()) {
            return 1;
        }
        let mult = 1 + prepBonus;
        if ((data.progress.currentClassKey || "none") === "scold" && (data.battle.scoldFlurryMs || 0) > 0) {
            const spd = data.battle.levelState.levelSpd || 0;
            mult *= (1 + (spd * 0.1));
        }
        return mult;
    },
    syncPlayerCooldownFields: function() {
        const p = data.battle.player;
        p.attackCooldownMs = engine.getEffectiveSlapCooldownMs();
        p.sandalAttackCooldownMs = engine.getEffectiveSandalCooldownMs();
    },
    /** Endurance skill exp: every 10s of combat time; exp = √(current HP) per trigger. */
    updateEnduranceSkillExp: function(tickMs) {
        if (!skills.isSkillUnlocked("endurance")) {
            return;
        }
        const dt = tickMs * engine.getBattleTimeRateMultiplier();
        if (data.battle.enduranceExpAccMs === undefined || data.battle.enduranceExpAccMs === null) {
            data.battle.enduranceExpAccMs = 0;
        }
        data.battle.enduranceExpAccMs += dt;
        while (data.battle.enduranceExpAccMs >= 10000) {
            data.battle.enduranceExpAccMs -= 10000;
            const p = data.battle.player;
            const amt = Math.sqrt(Math.max(0, p.hp || 0));
            engine.onSkillTrigger("endurance", amt);
        }
    },
    updateRecoveryEachSecond: function(tickMs) {
        if (data.battle.recoverySecondAccMs === undefined) {
            data.battle.recoverySecondAccMs = 0;
        }
        data.battle.recoverySecondAccMs += tickMs;
        while (data.battle.recoverySecondAccMs >= 1000) {
            data.battle.recoverySecondAccMs -= 1000;
            const p = data.battle.player;
            const rEff = skills.getSkillEffect("recovery");
            const regen = rEff.recoveryHpPerSec || 0;
            if (regen > 0) {
                p.hp = Math.min(p.maxHp, p.hp + regen);
            }
            engine.onSkillTrigger("recovery", 1);
            if (skills.isSkillUnlocked("tenacity")) {
                const mx = Math.max(1, p.maxHp || 1);
                if (p.hp < mx * 0.5) {
                    engine.onSkillTrigger("tenacity", 1);
                }
            }
        }
    },
    updatePassiveSkillExp: function(tickMs) {
        const sec = tickMs / 1000;
        if (!engine.anyIntruderInSlapRange()) {
            engine.onSkillTrigger("preparation", sec);
        }
        let inSlap = 0;
        for (let i = 0; i < data.battle.enemies.length; i++) {
            const e = data.battle.enemies[i];
            if (e.alive && e.inRange) {
                inSlap++;
            }
        }
        if (inSlap > 1) {
            engine.onSkillTrigger("adrenaline", (inSlap - 1) * sec);
        }
        const cls = data.progress.currentClassKey || "none";
        if (cls === "scold") {
            engine.addClassBarProgress("B", 100 * sec);
        } else if (cls === "mockery") {
            engine.addClassBarProgress("B", 50 * inSlap * sec);
        }
    },
    updateForagingPassiveSkillExp: function(tickMs) {
        const sec = tickMs / 1000;
        engine.onSkillTrigger("breathing", sec);
        const planningStepPx = 50;
        const moved = data.battle.forageMoveAccumPx || 0;
        if (moved >= planningStepPx) {
            const triggers = Math.floor(moved / planningStepPx);
            data.battle.forageMoveAccumPx = moved - (triggers * planningStepPx);
            engine.onSkillTrigger("planning", triggers);
        }
    },
    addClassBarProgress: function(which, amount) {
        const key = which === "A" ? "classPowerA" : "classPowerB";
        const cur = data.battle[key] || 0;
        if (cur >= 1000) {
            return;
        }
        data.battle[key] = cur + amount;
    },
    consumeClassBar: function(which) {
        const key = which === "A" ? "classPowerA" : "classPowerB";
        if ((data.battle[key] || 0) < 1000) return false;
        data.battle[key] -= 1000;
        return true;
    },
    updateClassEffects: function(tickMs) {
        if ((data.battle.classRetreatMs || 0) > 0) {
            data.battle.classRetreatMs = Math.max(0, data.battle.classRetreatMs - tickMs);
        }
        if ((data.battle.scoldFlurryMs || 0) > 0) {
            data.battle.scoldFlurryMs = Math.max(0, data.battle.scoldFlurryMs - tickMs);
        }
        if ((data.progress.currentClassKey || "none") === "scold" && (data.battle.classPowerA || 0) >= 1000 && !data.battle.scoldDashActive) {
            data.battle.classPowerA -= 1000;
            data.battle.scoldDashActive = true;
        }
        if (data.battle.scoldDashActive && engine.anyIntruderInSlapRange()) {
            data.battle.scoldDashActive = false;
        }
        if ((data.progress.currentClassKey || "none") === "mockery" && (data.battle.classPowerB || 0) >= 1000 && (data.battle.classRetreatMs || 0) <= 0) {
            data.battle.classPowerB -= 1000;
            data.battle.classRetreatMs = 3000;
        }
    },
    updatePlayerAttack: function(tickMs) {
        const p = data.battle.player;
        const cls = data.progress.currentClassKey || "none";
        p.attackTimerMs -= tickMs * engine.getSlapRechargeMultiplier();
        if (p.attackTimerMs > 0) {
            return;
        }
        if (data.battle.activeTargetId === null) {
            p.attackTimerMs = 0;
            return;
        }
        const target = engine.findIntruderById(data.battle.activeTargetId);
        if (!target || !target.alive || !target.inRange) {
            p.attackTimerMs = 0;
            return;
        }
        engine.enqueueSlapLineFx(target);
        if ((data.battle.mode || "combat") === "foraging") {
            const staminaCost = target.staminaCost || 1;
            if (data.battle.player.hp <= 0 || data.battle.player.hp < staminaCost) {
                data.battle.player.hp = 0;
                return;
            }
            data.battle.player.hp = Math.max(0, data.battle.player.hp - staminaCost);
            let harvestDamage = data.battle.player.attackDamage;
            const tch = skills.getSkillEffect("technique");
            harvestDamage += tch.techniqueHarvestDamageFlat || 0;
            if (!target.firstHitTaken) {
                const pln = skills.getSkillEffect("planning");
                const planFrac = pln.planningFirstHitDamageBonusFraction || 0;
                harvestDamage *= (1 + planFrac);
                target.firstHitTaken = true;
            }
            target.hp -= Math.max(1, roundNearestDecimals(harvestDamage, 1));
            p.attackTimerMs = engine.getEffectiveSlapCooldownMs() + Math.min(0, p.attackTimerMs);
            engine.onSkillTrigger("technique", 1);
            if (target.hp <= 0) {
                target.hp = 0;
                target.alive = false;
                data.battle.activeTargetId = null;
                engine.removeIntruderFromSlapQueue(target.id);
                engine.onIntruderKilled(target);
            }
            return;
        }
        let slapDamage = data.battle.player.attackDamage;
        const exEff = skills.getSkillEffect("execute");
        const executeFrac = exEff.executeLowHpBonusFraction || 0;
        if (executeFrac > 0 && target.hp <= (target.maxHp * 0.5)) {
            slapDamage *= 1 + executeFrac;
            engine.onSkillTrigger("execute", 1);
        }
        const snEff = skills.getSkillEffect("sneak_attack");
        const sneakFrac = snEff.sneakFirstHitDamageBonusFraction || 0;
        const priorHits = target.timesHitByPlayer || 0;
        if (sneakFrac > 0 && priorHits === 0) {
            slapDamage *= 1 + sneakFrac;
        }
        const xpEff = skills.getSkillEffect("exploit");
        const exploitStep = xpEff.exploitFlatDamagePerConsecutiveStep || 0;
        const prevTarget = data.battle.lastPlayerHitIntruderId || 0;
        const streak = (prevTarget === target.id) ? ((data.battle.lastPlayerHitStreak || 0) + 1) : 1;
        if (exploitStep > 0 && streak >= 2) {
            slapDamage += (streak - 1) * exploitStep;
        }
        let isPowerStrike = false;
        if (cls === "condescension" && (data.battle.classPowerA || 0) >= 1000) {
            data.battle.classPowerA -= 1000;
            slapDamage *= 2;
            isPowerStrike = true;
        }
        if (cls === "scold" && (data.battle.classPowerB || 0) >= 1000) {
            data.battle.classPowerB -= 1000;
            data.battle.scoldFlurryMs = 2000;
        }
        slapDamage = Math.max(1, roundNearestDecimals(slapDamage, 1));
        const hpBeforeSlap = target.hp;
        target.hp -= slapDamage;
        data.battle.lastPlayerHitIntruderId = target.id;
        data.battle.lastPlayerHitStreak = streak;
        target.timesHitByPlayer = priorHits + 1;
        if (skills.isSkillUnlocked("overkill")) {
            const over = Math.max(0, slapDamage - hpBeforeSlap);
            engine.onSkillTrigger("overkill", Math.sqrt(over));
        }
        if (sneakFrac > 0 && priorHits === 0) {
            engine.onSkillTrigger("sneak_attack", 1);
        }
        if (exploitStep > 0 && priorHits > 0) {
            engine.onSkillTrigger("exploit", 1);
        }
        const cd = engine.getEffectiveSlapCooldownMs();
        p.attackTimerMs = cd + Math.min(0, p.attackTimerMs);
        if (!isPowerStrike) {
            if (cls === "condescension") engine.addClassBarProgress("A", 100);
            if (cls === "mockery") engine.addClassBarProgress("A", 100);
        } else {
            engine.onSkillTrigger("cleave", 1);
            engine.applyCondescensionCleave(target, slapDamage);
        }
        engine.onSkillTrigger("force", 1);
        engine.onSkillTrigger("alacrity", 1);
        if (target.hp <= 0) {
            target.hp = 0;
            target.alive = false;
            data.battle.activeTargetId = null;
            engine.removeIntruderFromSlapQueue(target.id);
            engine.onIntruderKilled(target, { __OVERKILL__BoostKind: "slap" });
        }
    },
    updateCurrentZoneInfo: function() {
        if ((data.battle.mode || "combat") === "foraging") {
            const zones = [];
            let alive = 0;
            for (let i = 0; i < data.battle.enemies.length; i++) {
                if (data.battle.enemies[i].alive) alive++;
            }
            zones.push({
                index: 0,
                name: "Foraging",
                remainingSpawnMs: 0,
                difficulty: initialize.getCurrentMapDefinition().baseDifficulty || 1,
                remainingEnemies: alive,
                coins: 0,
                exp: 0
            });
            data.battle.activeZones = zones;
            return;
        }
        const map = initialize.getCurrentMapDefinition();
        const zones = [];
        if (!map || !map.zones) {
            data.battle.activeZones = zones;
            return;
        }
        const tierMult = mapData.getTierDifficultyMultiplier(data.battle.mapTier || 0);
        const elapsed = data.battle.elapsedMs;
        for (let i = 0; i < map.zones.length; i++) {
            const rem = engine.getRemainingEnemiesForZone(i);
            if (rem <= 0) {
                continue;
            }
            const z = map.zones[i];
            const cr = mapData.computeZoneCombatAndRewards(map, i, tierMult);
            const lastSpawnT = mapData.getZoneLastSpawnTimeMs(z);
            let shardInfo = "";
            if (z.skillShard && skills._byKey[z.skillShard.key]) {
                const found = (data.battle.zoneShardRunCounts && data.battle.zoneShardRunCounts[i]) || 0;
                const mx = z.skillShard.max || 0;
                shardInfo = `${skills._byKey[z.skillShard.key].name} ${found}/${mx}`;
            }
            zones.push({
                index: i,
                name: z.name,
                remainingSpawnMs: Math.max(0, lastSpawnT - elapsed),
                difficulty: (map.baseDifficulty || 1) * cr.ratio * (tierMult.combat || 1),
                remainingEnemies: rem,
                coins: engine.coinsAwardFromIntruderGain(cr.perIntruderGain),
                exp: engine.expAwardFromIntruderExpBase(cr.expBasePerIntruder),
                shardInfo: shardInfo
            });
        }
        data.battle.activeZones = zones;
    },
    getRemainingEnemiesForZone: function(zoneIndex) {
        let alive = 0;
        for (let i = 0; i < data.battle.enemies.length; i++) {
            const e = data.battle.enemies[i];
            if (e.alive && e.zoneIndex === zoneIndex) {
                alive++;
            }
        }
        return alive;
    },
    updateIntruderAttacks: function(tickMs) {
        for (let i = 0; i < data.battle.enemies.length; i++) {
            const intruder = data.battle.enemies[i];
            const canAttack = intruder.intruderType === "lecher" ? (!!intruder.lecherReady || !!intruder.inRange) : !!intruder.inRange;
            if (!intruder.alive || !canAttack) {
                continue;
            }
            intruder.attackTimerMs -= tickMs;
            if (intruder.attackTimerMs <= 0) {
                const intruderCd = intruder.intruderType === "lecher" ? (intruder.attackCooldownMs * 2) : intruder.attackCooldownMs;
                intruder.attackTimerMs += intruderCd;
                if (intruder.intruderType === "lecher") {
                    engine.pushIntruderSandalLineFx(intruder);
                }
                const endEff = skills.getSkillEffect("fortitude");
                const dmgMultiplier = endEff.fortitudeIncomingDamageMultiplier !== undefined ? endEff.fortitudeIncomingDamageMultiplier : 1;
                let incoming = intruder.attackDamage * dmgMultiplier;
                const tEff = skills.getSkillEffect("toughness_condescension");
                const armorFlat = tEff.toughnessArmorFlat || 0;
                incoming = Math.max(0, incoming - armorFlat);
                if ((data.progress.currentClassKey || "none") === "condescension" && (data.battle.classPowerB || 0) >= 1000) {
                    data.battle.classPowerB -= 1000;
                    incoming *= 0.5;
                    engine.onSkillTrigger("second_wind", 1);
                    const swEff = skills.getSkillEffect("second_wind");
                    const secondWindHeal = swEff.secondWindBlockHeal || 0;
                    if (secondWindHeal > 0) {
                        data.battle.player.hp = Math.min(data.battle.player.maxHp, data.battle.player.hp + secondWindHeal);
                    }
                }
                if (incoming > 0 && (data.progress.currentClassKey || "none") === "condescension" && intruder.intruderType !== "lecher") {
                    engine.addClassBarProgress("B", 200);
                    const thEff = skills.getSkillEffect("thorns");
                    const thorns = thEff.thornsRetaliationDamage || 0;
                    if (thorns > 0) {
                        intruder.hp -= thorns;
                    }
                }
                data.battle.player.hp -= incoming;
                engine.onSkillTrigger("fortitude", 1);
                engine.onSkillTrigger("toughness_condescension", intruder.intruderType === "lecher" ? 0 : 1);
                engine.onSkillTrigger("thorns", (incoming > 0 && intruder.intruderType !== "lecher") ? 1 : 0);
                if (data.battle.player.hp < 0) {
                    data.battle.player.hp = 0;
                }
                if (intruder.hp <= 0) {
                    intruder.hp = 0;
                    intruder.alive = false;
                    if (data.battle.activeTargetId === intruder.id) {
                        data.battle.activeTargetId = null;
                    }
                    engine.removeIntruderFromSlapQueue(intruder.id);
                    engine.onIntruderKilled(intruder);
                }
            }
        }
    },
    cleanupDeadEnemies: function() {
        const survivors = [];
        for (let i = 0; i < data.battle.enemies.length; i++) {
            if (data.battle.enemies[i].alive) {
                survivors.push(data.battle.enemies[i]);
            } else {
                data.battle.intruderPool.availableIds.push(data.battle.enemies[i].id);
                delete data.battle.intruderPool.inUseIds[data.battle.enemies[i].id];
            }
        }
        data.battle.enemies = survivors;
    },
    checkMapCompletion: function() {
        if (data.battle.state !== "running") {
            return;
        }
        if ((data.battle.mode || "combat") === "foraging") {
            return;
        }
        const map = initialize.getCurrentMapDefinition();
        const allSpawned = data.battle.zoneSpawnedInCycle && data.battle.zoneSpawnedInCycle.length
            ? data.battle.zoneSpawnedInCycle.every(function(v) { return !!v; })
            : false;
        const noneAlive = data.battle.enemies.length === 0;
        const cycleDone = data.battle.elapsedMs >= mapData.getMapTotalDurationMs(map);
        if (!allSpawned || !noneAlive || !cycleDone) {
            return;
        }
        engine.beginTierTransition();
    },
    checkLossCondition: function() {
        if (data.battle.player.hp > 0) {
            return;
        }
        engine.saveRunHistoryIfNeeded();
        data.battle.state = "dead";
        const chapel = data.progress.base && data.progress.base.chapel;
        data.progress.autoRetryCountdownSec = chapel && chapel.autoRetryEnabled ? 10 : 0;
        data.gameSettings.stop = true;
    },
    applyOverkillAttackProgressAfterKill: function(kind) {
        if ((data.progress.currentClassKey || "none") !== "condescension") {
            return;
        }
        if (!skills.isSkillUnlocked("overkill")) {
            return;
        }
        const sk = data.progress.skills.overkill;
        const lv = sk ? (sk.level || 0) : 0;
        if (lv <= 0) {
            return;
        }
        const p = data.battle.player;
        const cd = kind === "sandal" ? engine.getEffectiveSandalCooldownMs() : engine.getEffectiveSlapCooldownMs();
        const floorMs = kind === "sandal" ? gameData.battle.cooldowns.sandalFloorMs : gameData.battle.cooldowns.slapFloorMs;
        const maxSkip = Math.max(0, cd - floorMs);
        const want = 50 * lv;
        const applied = Math.min(want, maxSkip);
        if (applied <= 0) {
            return;
        }
        if (kind === "sandal") {
            p.sandalAttackTimerMs = Math.max(0, (p.sandalAttackTimerMs || 0) - applied);
        } else {
            p.attackTimerMs = Math.max(0, (p.attackTimerMs || 0) - applied);
        }
    },
    onIntruderKilled: function(intruder, opts) {
        const chapel = data.progress.base && data.progress.base.chapel;
        const growthUnlocked = !!(chapel && chapel.growthBlessingUnlocked);
        if ((data.battle.mode || "combat") === "foraging") {
            const res = data.progress.base && data.progress.base.resources;
            if (res) {
                const key = intruder.rewardResource || "logs";
                const amount = Math.ceil((intruder.gain || 1) * (initialize.getCurrentMapDefinition().baseDifficulty || 1));
                if (res[key] === undefined) {
                    res[key] = 0;
                }
                res[key] += amount;
            }
            if (growthUnlocked) {
                data.battle.levelState.exp += (intruder.expBase !== undefined ? intruder.expBase : 1);
            }
            data.battle.enemiesKilled++;
            engine.onSkillTrigger("quick_rest", 1);
            const qrEff = skills.getSkillEffect("quick_rest");
            const qr = qrEff.quickRestStaminaPerGather || 0;
            if (qr > 0) {
                data.battle.player.hp = Math.min(data.battle.player.maxHp, data.battle.player.hp + qr);
            }
            if (growthUnlocked) {
                engine.resolveLevelUps();
            }
            return;
        }
        const gain = intruder.gain || 1;
        const expBase = intruder.expBase !== undefined ? intruder.expBase : 1;
        const expGain = engine.expAwardFromIntruderExpBase(expBase);
        const coinsGain = engine.coinsAwardFromIntruderGain(gain);
        data.progress.coins += coinsGain;
        data.battle.runCoinsFromKills = (data.battle.runCoinsFromKills || 0) + coinsGain;
        if (growthUnlocked) {
            data.battle.levelState.exp += expGain;
        }
        data.battle.enemiesKilled++;
        const shardDrop = engine.trySkillShardDropOnKill(intruder);
        engine.addMapClearProgressForKill(data.progress.currentMapKey);
        engine.onSkillTrigger("wisdom", 1);
        engine.onSkillTrigger("greed", 1);
        engine.onSkillTrigger("scavenger", Math.sqrt(Math.max(0, coinsGain)));
        if (data.battle.state === "running") {
            engine.updateCurrentZoneInfo();
        }
        if (typeof view !== "undefined" && view.spawnKillRewardFloater) {
            const pos = engine.getKillFloaterScreenPosition(intruder);
            const parts = [
                `${intToStringRound(coinsGain)} coins`,
                growthUnlocked ? `+${round1(expGain)} exp` : "+0 exp"
            ];
            if (shardDrop) {
                parts.push(`+${shardDrop.gain} ${shardDrop.name}`);
            }
            view.spawnKillRewardFloater(pos.x, pos.y, parts);
        }
        if ((data.progress.currentClassKey || "none") === "scold") {
            engine.addClassBarProgress("A", 300);
        }
        if (growthUnlocked) {
            engine.resolveLevelUps();
        }
        if (opts && opts.__OVERKILL__BoostKind) {
            engine.applyOverkillAttackProgressAfterKill(opts.__OVERKILL__BoostKind);
        }
    },
    /** Matches `onIntruderKilled`: wisdom scales exp from zone `expBase`. */
    expAwardFromIntruderExpBase: function(expBase) {
        const b = expBase !== undefined ? expBase : 1;
        const e = skills.getSkillEffect("wisdom");
        const mult = e.wisdomCharacterExpMultiplier !== undefined ? e.wisdomCharacterExpMultiplier : 1;
        return b * mult;
    },
    /** Matches `onIntruderKilled`: scavenger flat + greedy coins multiplier over stored zone gain. */
    coinsAwardFromIntruderGain: function(storedGain) {
        const gain = storedGain !== undefined ? storedGain : 1;
        const sEff = skills.getSkillEffect("scavenger");
        const gEff = skills.getSkillEffect("greed");
        const scavFlat = sEff.scavengerKillCoinsFlatPerKill || 0;
        const baseCoinsPart = gain + scavFlat;
        const greedMult = gEff.greedKillCoinsMultiplier !== undefined ? gEff.greedKillCoinsMultiplier : 1;
        return baseCoinsPart * greedMult;
    },
    initZoneShardRunCounts: function() {
        const map = initialize.getCurrentMapDefinition();
        data.battle.zoneShardRunCounts = [];
        if (!map || !map.zones) {
            return;
        }
        for (let i = 0; i < map.zones.length; i++) {
            data.battle.zoneShardRunCounts.push(0);
        }
    },
    /** Skill exp only (no talent); uses same exp multipliers as triggers including Integration. */
    addSkillExpFromShardsOnly: function(skillKey, amount) {
        if (!amount || amount <= 0) {
            return;
        }
        if (!skills.isSkillUnlocked(skillKey)) {
            return;
        }
        const d = skills._byKey[skillKey];
        const mode = data.battle.mode || "combat";
        const cat = d && d.category ? d.category : "combat";
        if (mode === "foraging" && cat !== "foraging") {
            return;
        }
        if (mode !== "foraging" && cat === "foraging") {
            return;
        }
        if (d && d.classKey && d.classKey !== (data.progress.currentClassKey || "none")) {
            return;
        }
        const skill = data.progress.skills[skillKey];
        if (!skill) {
            return;
        }
        if (skill.maxLevel !== undefined && skill.level >= skill.maxLevel) {
            return;
        }
        const gainBase = skills.expGainForSkillTrigger(skill, amount);
        const intMult = skillKey !== "integration" ? skills.getIntegrationExpMultiplierForOthers() : 1;
        const gain = gainBase * intMult;
        skill.exp += gain;
        const initExp = d.initialExpToLevel !== undefined ? d.initialExpToLevel : 5;
        while (skill.exp >= skill.expToLevel && (!skill.maxLevel || skill.level < skill.maxLevel)) {
            skill.exp -= skill.expToLevel;
            skill.level++;
            skill.expToLevel = initExp * Math.pow(skill.level, 1.2);
            engine.onSkillLevelUp(skill);
        }
    },
    applySkillShardExpOnBattleStart: function() {
        const sks = data.progress.skills;
        if (!sks) {
            return;
        }
        const keys = Object.keys(sks);
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            const sk = sks[k];
            const n = sk && sk.shards !== undefined ? sk.shards : 0;
            if (n <= 0) {
                continue;
            }
            engine.addSkillExpFromShardsOnly(k, n);
            sk.shards = 0;
        }
    },
    trySkillShardDropOnKill: function(intruder) {
        if ((data.battle.mode || "combat") !== "combat" || !intruder) {
            return null;
        }
        const map = initialize.getCurrentMapDefinition();
        if (!map || !map.zones || intruder.zoneIndex === undefined || intruder.zoneIndex === null) {
            return null;
        }
        const z = map.zones[intruder.zoneIndex];
        if (!z || !z.skillShard) {
            return null;
        }
        const sh = z.skillShard;
        if (!skills._byKey[sh.key]) {
            return null;
        }
        const counts = data.battle.zoneShardRunCounts;
        const zi = intruder.zoneIndex;
        if (!counts || zi < 0 || zi >= counts.length) {
            return null;
        }
        if (counts[zi] >= (sh.max || 0)) {
            return null;
        }
        const tier = data.battle.mapTier || 0;
        const chanceMult = tier >= 2 ? 10 : (tier >= 1 ? 3 : 1);
        const p = Math.min(0.999, (sh.chance || 0) * chanceMult);
        if (Math.random() >= p) {
            return null;
        }
        if (!skills.isSkillUnlocked(sh.key)) {
            return null;
        }
        const room = (sh.max || 0) - counts[zi];
        const gain = Math.min(sh.gain || 1, room);
        if (gain <= 0) {
            return null;
        }
        counts[zi] += gain;
        const target = data.progress.skills[sh.key];
        if (target) {
            target.shards = (target.shards || 0) + gain;
        }
        return { gain: gain, name: skills._byKey[sh.key].name, key: sh.key };
    },
    getKillFloaterScreenPosition: function(intruder) {
        const lm = engine.getBattleLaneMetrics();
        const laneCenter = lm.inset + (intruder.lane + 0.5) * lm.laneWidth;
        const leftPx = Math.round(laneCenter - (intruder.sizePx / 2));
        const cx = leftPx + intruder.sizePx / 2;
        const cy = intruder.yPx + intruder.sizePx / 2;
        return { x: cx, y: cy };
    },
    resolveLevelUps: function() {
        const chapel = data.progress.base && data.progress.base.chapel;
        const growthUnlocked = !!(chapel && chapel.growthBlessingUnlocked);
        const plannedGrowthUnlocked = !!(chapel && chapel.plannedGrowthBlessingUnlocked);
        if (!growthUnlocked) {
            return;
        }
        const ls = data.battle.levelState;
        if (ls.expToLevelBase === undefined || ls.expToLevelBase === null) {
            ls.expToLevelBase = ls.expToLevel || gameData.battle.levelStartingExpToLevel;
        }
        while (ls.exp >= ls.expToLevel) {
            ls.exp -= ls.expToLevel;
            ls.level++;
            const cls = initialize.getCurrentClassDef();
            ls.levelStr += cls.perLevel.str || 0;
            ls.levelCon += cls.perLevel.con || 0;
            ls.levelSpd += cls.perLevel.spd || 0;
            ls.expToLevelBase *= 1.35;
            ls.expToLevel = Math.max(1, Math.round(ls.expToLevelBase));
            if (plannedGrowthUnlocked) {
                const nextLevel = ls.level;
                const planned = engine.getPlanEntryForLevel(nextLevel);
                if (planned) {
                    engine.applyAttributePoint(planned.attribute, false);
                } else {
                    ls.unassignedPoints++;
                }
            }
            engine.onSkillTrigger("adaptation", 1);
            initialize.calcPlayerStats(false);
        }
    },
    getPlanEntryForLevel: function(level) {
        for (let i = 0; i < data.progress.attributePlan.length; i++) {
            if (data.progress.attributePlan[i].level === level) {
                return data.progress.attributePlan[i];
            }
        }
        return null;
    },
    getNextUnplannedLevel: function() {
        const maxLevel = data.battle.levelState.level;
        for (let lvl = 1; lvl <= maxLevel; lvl++) {
            if (!engine.getPlanEntryForLevel(lvl)) {
                return lvl;
            }
        }
        return null;
    },
    applyAttributePoint: function(attributeKey, shouldRecordPlan) {
        const chapel = data.progress.base && data.progress.base.chapel;
        const plannedGrowthUnlocked = !!(chapel && chapel.plannedGrowthBlessingUnlocked);
        if (!plannedGrowthUnlocked) {
            return false;
        }
        if (data.battle.levelState.unassignedPoints <= 0 && shouldRecordPlan) {
            return false;
        }
        if (attributeKey === "str") {
            data.battle.levelState.levelStr++;
        } else if (attributeKey === "con") {
            data.battle.levelState.levelCon++;
        } else if (attributeKey === "spd") {
            data.battle.levelState.levelSpd++;
        } else if (attributeKey === "soul") {
            data.battle.levelState.levelSoul++;
        } else {
            return false;
        }
        if (shouldRecordPlan) {
            const assignLevel = engine.getNextUnplannedLevel();
            if (assignLevel === null) {
                return false;
            }
            data.battle.levelState.unassignedPoints--;
            data.progress.attributePlan.push({
                level: assignLevel,
                attribute: attributeKey
            });
        }
        initialize.calcPlayerStats(false);
        return true;
    },
    anyIntruderInSlapRange: function() {
        for (let i = 0; i < data.battle.enemies.length; i++) {
            const e = data.battle.enemies[i];
            if (e.alive && e.inRange) {
                return true;
            }
        }
        return false;
    },
    anyIntruderInPlayerRange: function() {
        const sandalOn = !!(data.progress.sandalAttackEnabled && data.progress.base && data.progress.base.atelier && data.progress.base.atelier.sandalBuilt);
        for (let i = 0; i < data.battle.enemies.length; i++) {
            const e = data.battle.enemies[i];
            if (!e.alive) {
                continue;
            }
            if (e.inRange) {
                return true;
            }
            if (sandalOn && engine.intruderIntersectsBattlefield(e)) {
                return true;
            }
        }
        return false;
    },
    anyIntruderVisible: function() {
        for (let i = 0; i < data.battle.enemies.length; i++) {
            const e = data.battle.enemies[i];
            if (e.alive && engine.intruderIntersectsBattlefield(e)) {
                return true;
            }
        }
        return false;
    },
    slapAttackReady: function() {
        return data.battle.player.attackTimerMs <= 0;
    },
    idleAutoPhase: function() {
        return !engine.anyIntruderInPlayerRange() && engine.slapAttackReady();
    },
    countAliveEnemies: function() {
        let n = 0;
        for (let i = 0; i < data.battle.enemies.length; i++) {
            if (data.battle.enemies[i].alive) {
                n++;
            }
        }
        return n;
    },
    getIntruderPushBonusPxPerSecond: function() {
        if (engine.anyIntruderInPlayerRange() || engine.countAliveEnemies() === 0) {
            return 0;
        }
        const spd = data.battle.levelState.levelSpd || 0;
        const spdMult = 1 + (spd * 0.1);
        let out = gameData.battle.idlePushBonusPxPerSecond * spdMult;
        if ((data.progress.currentClassKey || "none") === "scold" && data.battle.scoldDashActive) {
            out *= 10;
        }
        return out;
    },
    getBattleTimeRateMultiplier: function() {
        if ((data.battle.mode || "combat") === "foraging") {
            return 1;
        }
        if (!engine.areActiveZonesCleared()) {
            return 1;
        }
        const spd = data.battle.levelState.levelSpd || 0;
        let out = 1 + (spd * 0.1);
        if ((data.progress.currentClassKey || "none") === "scold" && data.battle.scoldDashActive) {
            out *= 10;
        }
        return out;
    },
    areActiveZonesCleared: function() {
        const map = initialize.getCurrentMapDefinition();
        if (!map || !map.zones) {
            return false;
        }
        for (let zi = 0; zi < map.zones.length; zi++) {
            if (engine.getRemainingEnemiesForZone(zi) <= 0) {
                continue;
            }
            for (let j = 0; j < data.battle.enemies.length; j++) {
                const e = data.battle.enemies[j];
                if (e.alive && e.zoneIndex === zi) {
                    return false;
                }
            }
        }
        return true;
    },
    updateMapTransitionCountdown: function(tickMs) {
        if ((data.battle.transitionCountdownMs || 0) <= 0) {
            return false;
        }
        data.battle.transitionCountdownMs = Math.max(0, data.battle.transitionCountdownMs - tickMs);
        if (data.battle.transitionCountdownMs <= 0) {
            engine.restartMapCycle(data.battle.nextTierAfterCountdown || 0);
        }
        return true;
    },
    beginTierTransition: function() {
        const map = initialize.getCurrentMapDefinition();
        const mapKey = map ? map.key : data.progress.currentMapKey;
        const clearState = engine.getMapClearState(mapKey);
        const addStarClearProgress = function(pct) {
            clearState.pct = Math.min(100, (clearState.pct || 0) + pct);
            engine.maybeStartHarvestRespawnCountdown(mapKey);
        };
        if (!data.progress.mapStars[mapKey]) {
            data.progress.mapStars[mapKey] = { bronze: false, silver: false, coins: false };
        }
        const stars = data.progress.mapStars[mapKey];
        const tier = data.battle.mapTier || 0;
        if (tier === 0) {
            if (!stars.bronze) {
                stars.bronze = true;
                data.progress.stars.bronze = (data.progress.stars.bronze || 0) + 1;
                engine.grantWorkersForMapStar(mapKey, 1);
                addStarClearProgress(10);
            }
            data.battle.transitionMessage = "Bronze star received! Raising difficulty...";
            data.battle.nextTierAfterCountdown = 1;
            data.battle.transitionCountdownMs = 5000;
            return;
        }
        if (tier === 1) {
            if (!stars.silver) {
                stars.silver = true;
                data.progress.stars.silver = (data.progress.stars.silver || 0) + 1;
                engine.grantWorkersForMapStar(mapKey, 2);
                addStarClearProgress(15);
            }
            data.battle.transitionMessage = "Silver star received! Raising difficulty...";
            data.battle.nextTierAfterCountdown = 2;
            data.battle.transitionCountdownMs = 5000;
            return;
        }
        if (!stars.coins) {
            stars.coins = true;
            data.progress.stars.coins = (data.progress.stars.coins || 0) + 1;
            engine.grantWorkersForMapStar(mapKey, 3);
            addStarClearProgress(25);
        }
        data.battle.transitionMessage = "Coins star received! Map complete.";
        data.battle.nextTierAfterCountdown = 0;
        data.battle.transitionCountdownMs = 5000;
    },
    restartMapCycle: function(nextTier) {
        data.battle.mapTier = nextTier || 0;
        data.battle.elapsedMs = 0;
        data.battle.zoneSpawnedInCycle = [];
        data.battle.zoneRewardGrantedInCycle = [];
        const map = initialize.getCurrentMapDefinition();
        for (let i = 0; i < map.zones.length; i++) {
            data.battle.zoneSpawnedInCycle.push(false);
            data.battle.zoneRewardGrantedInCycle.push(false);
        }
        data.battle.activeZones = [];
        data.battle.transitionCountdownMs = 0;
        data.battle.transitionMessage = "";
        data.battle.nextTierAfterCountdown = 0;
        data.battle.enemies = [];
        data.battle.slapQueue = [];
        data.battle.activeTargetId = null;
        data.battle.player.attackTimerMs = 0;
        data.battle.player.sandalAttackTimerMs = 0;
        data.battle.enduranceExpAccMs = 0;
        engine.initZoneShardRunCounts();
    },
    /** True if the intruder token overlaps the battlefield clip rect (may be partially outside); used for draw and range checks while simulating all enemies. */
    intruderIntersectsBattlefield: function(intruder) {
        const lm = engine.getBattleLaneMetrics();
        const bw = lm.battleWidth;
        const bh = viewData.layout.battlefieldHeightPx || gameData.battle.battlefieldHeightPx || 500;
        const cx = lm.inset + (intruder.lane + 0.5) * lm.laneWidth;
        const half = intruder.sizePx / 2;
        const left = cx - half;
        const right = cx + half;
        const top = intruder.yPx;
        const bottom = intruder.yPx + intruder.sizePx;
        const horizOk = right > 0 && left < bw;
        const vertOk = bottom > 0 && top < bh;
        return horizOk && vertOk;
    },
    getSandalDamageTarget: function() {
        let best = null;
        let bestBottom = -Infinity;
        for (let i = 0; i < data.battle.enemies.length; i++) {
            const e = data.battle.enemies[i];
            if (!e.alive || !engine.intruderIntersectsBattlefield(e)) {
                continue;
            }
            const bottom = e.yPx + e.sizePx;
            if (bottom > bestBottom) {
                bestBottom = bottom;
                best = e;
            }
        }
        return best;
    },
    pushAttackLineFx: function(target, kind) {
        if (!data.battle.lineFxQueue) {
            data.battle.lineFxQueue = [];
        }
        const lm = engine.getBattleLaneMetrics();
        const bw = lm.battleWidth;
        const bh = viewData.layout.battlefieldHeightPx || 500;
        const pt = viewData.layout.playerTopPx || (bh - 65);
        const x1 = bw / 2;
        const y1 = pt + 24;
        const x2 = lm.inset + (target.lane + 0.5) * lm.laneWidth;
        const y2 = target.yPx + (target.sizePx / 2);
        data.battle.lineFxQueue.push({
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
            kind: kind
        });
    },
    pushIntruderSandalLineFx: function(attacker) {
        if (!attacker) {
            return;
        }
        if (!data.battle.lineFxQueue) {
            data.battle.lineFxQueue = [];
        }
        const lm = engine.getBattleLaneMetrics();
        const bw = lm.battleWidth;
        const bh = viewData.layout.battlefieldHeightPx || 500;
        const pt = viewData.layout.playerTopPx || (bh - 65);
        const x1 = lm.inset + (attacker.lane + 0.5) * lm.laneWidth;
        const y1 = attacker.yPx + (attacker.sizePx / 2);
        const x2 = bw / 2;
        const y2 = pt + 24;
        data.battle.lineFxQueue.push({
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
            kind: "lecher_strike"
        });
    },
    enqueueSlapLineFx: function(target) {
        engine.pushAttackLineFx(target, "slap");
    },
    enqueueSandalLineFx: function(target) {
        engine.pushAttackLineFx(target, "sandal");
    },
    updateSandalAttack: function(tickMs) {
        if (data.battle.state !== "running") {
            return;
        }
        if (!engine.idleAutoPhase() || engine.countAliveEnemies() === 0) {
            return;
        }
        if (!(data.progress.sandalAttackEnabled && data.progress.base && data.progress.base.atelier && data.progress.base.atelier.sandalBuilt)) {
            return;
        }
        if ((data.progress.currentClassKey || "none") === "scold") {
            return;
        }
        const p = data.battle.player;
        p.sandalAttackTimerMs -= tickMs;
        if (p.sandalAttackTimerMs > 0) {
            return;
        }
        const rt = engine.getSandalDamageTarget();
        if (!rt) {
            p.sandalAttackTimerMs = 0;
            return;
        }
        const cls = data.progress.currentClassKey || "none";
        let sandalDamage = p.sandalAttackDamage;
        const snEffR = skills.getSkillEffect("sneak_attack");
        const sneakFracR = snEffR.sneakFirstHitDamageBonusFraction || 0;
        const priorHits = rt.timesHitByPlayer || 0;
        if (sneakFracR > 0 && priorHits === 0) {
            sandalDamage *= 1 + sneakFracR;
        }
        const xpEffR = skills.getSkillEffect("exploit");
        const exploitStepR = xpEffR.exploitFlatDamagePerConsecutiveStep || 0;
        const prevTarget = data.battle.lastPlayerHitIntruderId || 0;
        const streak = (prevTarget === rt.id) ? ((data.battle.lastPlayerHitStreak || 0) + 1) : 1;
        if (exploitStepR > 0 && streak >= 2) {
            sandalDamage += (streak - 1) * exploitStepR;
        }
        sandalDamage = Math.max(1, roundNearestDecimals(sandalDamage, 1));
        const hpBeforeSandal = rt.hp;
        rt.hp -= sandalDamage;
        data.battle.lastPlayerHitIntruderId = rt.id;
        data.battle.lastPlayerHitStreak = streak;
        rt.timesHitByPlayer = priorHits + 1;
        if (skills.isSkillUnlocked("overkill")) {
            const overR = Math.max(0, sandalDamage - hpBeforeSandal);
            engine.onSkillTrigger("overkill", Math.sqrt(overR));
        }
        if (sneakFracR > 0 && priorHits === 0) {
            engine.onSkillTrigger("sneak_attack", 1);
        }
        if (exploitStepR > 0 && priorHits > 0) {
            engine.onSkillTrigger("exploit", 1);
        }
        const imEff = skills.getSkillEffect("impact");
        const impactTravel = imEff.impactKnockbackTravelSeconds || 0;
        if (impactTravel > 0) {
            const battleHeight = viewData.layout.battlefieldHeightPx || 500;
            const playerTopY = viewData.layout.playerTopPx || (battleHeight - 65);
            const line300FtY = playerTopY - 300;
            const intruderBottomPast300 = (rt.yPx + rt.sizePx) >= line300FtY;
            if (intruderBottomPast300) {
                engine.onSkillTrigger("impact", 1);
            }
            const knockbackPx = rt.speedPxPerSecond * impactTravel;
            rt.yPx = Math.max(-rt.sizePx, rt.yPx - knockbackPx);
            rt.inRange = false;
        }
        if (cls === "mockery" && (data.battle.classPowerA || 0) >= 1000) {
            const t2 = engine.getSecondSandalDamageTarget(rt.id);
            if (t2) {
                data.battle.classPowerA -= 1000;
                const hpBeforeT2 = t2.hp;
                t2.hp -= sandalDamage;
                engine.enqueueSandalLineFx(t2);
                if (t2.hp <= 0) {
                    if (skills.isSkillUnlocked("overkill")) {
                        engine.onSkillTrigger("overkill", Math.sqrt(Math.max(0, sandalDamage - hpBeforeT2)));
                    }
                    t2.hp = 0;
                    t2.alive = false;
                    if (data.battle.activeTargetId === t2.id) data.battle.activeTargetId = null;
                    engine.removeIntruderFromSlapQueue(t2.id);
                    engine.onIntruderKilled(t2, { __OVERKILL__BoostKind: "sandal" });
                    engine.onSkillTrigger("longshot", 1);
                }
            }
        }
        engine.enqueueSandalLineFx(rt);
        const rcd = engine.getEffectiveSandalCooldownMs();
        p.sandalAttackTimerMs = rcd + Math.min(0, p.sandalAttackTimerMs);
        if (cls === "mockery") {
            engine.addClassBarProgress("A", 200);
        }
        engine.onSkillTrigger("force", 1);
        engine.onSkillTrigger("alacrity", 1);
        if (rt.hp <= 0) {
            rt.hp = 0;
            rt.alive = false;
            if (data.battle.activeTargetId === rt.id) {
                data.battle.activeTargetId = null;
            }
            engine.removeIntruderFromSlapQueue(rt.id);
            engine.onIntruderKilled(rt, { __OVERKILL__BoostKind: "sandal" });
            engine.onSkillTrigger("longshot", 1);
        }
    },
    applyCondescensionCleave: function(primaryTarget, dealtDamage) {
        const clEff = skills.getSkillEffect("cleave");
        const splashFrac = clEff.cleaveSplashFraction || 0;
        if (splashFrac <= 0 || dealtDamage <= 0) {
            return;
        }
        const splash = Math.max(1, Math.floor(dealtDamage * splashFrac));
        const toHit = [];
        for (let i = 0; i < data.battle.enemies.length; i++) {
            const e = data.battle.enemies[i];
            if (!e.alive || !e.inRange || e.id === primaryTarget.id) {
                continue;
            }
            if (e.lane === primaryTarget.lane - 1 || e.lane === primaryTarget.lane + 1) {
                toHit.push(e);
            }
        }
        let behind = null;
        let bestDelta = Infinity;
        for (let i = 0; i < data.battle.enemies.length; i++) {
            const e = data.battle.enemies[i];
            if (!e.alive || e.id === primaryTarget.id || e.lane !== primaryTarget.lane) {
                continue;
            }
            if (e.yPx < primaryTarget.yPx) {
                const d = primaryTarget.yPx - e.yPx;
                if (d < bestDelta) {
                    bestDelta = d;
                    behind = e;
                }
            }
        }
        if (behind) {
            toHit.push(behind);
        }
        for (let i = 0; i < toHit.length; i++) {
            const e = toHit[i];
            const hpBeforeSplash = e.hp;
            e.hp -= splash;
            if (e.hp <= 0) {
                if (skills.isSkillUnlocked("overkill")) {
                    engine.onSkillTrigger("overkill", Math.sqrt(Math.max(0, splash - hpBeforeSplash)));
                }
                e.hp = 0;
                e.alive = false;
                if (data.battle.activeTargetId === e.id) {
                    data.battle.activeTargetId = null;
                }
                engine.removeIntruderFromSlapQueue(e.id);
                engine.onIntruderKilled(e, { __OVERKILL__BoostKind: "slap" });
            }
        }
    },
    removeIntruderFromSlapQueue: function(intruderId) {
        const q = data.battle.slapQueue;
        const next = [];
        for (let i = 0; i < q.length; i++) {
            if (q[i] !== intruderId) {
                next.push(q[i]);
            }
        }
        data.battle.slapQueue = next;
    },
    getSecondSandalDamageTarget: function(excludeId) {
        for (let i = 0; i < data.battle.enemies.length; i++) {
            const e = data.battle.enemies[i];
            if (!e.alive || e.id === excludeId || !engine.intruderIntersectsBattlefield(e)) continue;
            return e;
        }
        return null;
    },
    onSkillTrigger: function(skillKey, amount) {
        if (!amount || amount <= 0) {
            return;
        }
        if (!skills.isSkillUnlocked(skillKey)) {
            return;
        }
        const d = skills._byKey[skillKey];
        const mode = data.battle.mode || "combat";
        const cat = d && d.category ? d.category : "combat";
        if (mode === "foraging" && cat !== "foraging") {
            return;
        }
        if (mode !== "foraging" && cat === "foraging") {
            return;
        }
        if (d && d.classKey && d.classKey !== (data.progress.currentClassKey || "none")) {
            return;
        }
        const skill = data.progress.skills[skillKey];
        if (!skill) {
            return;
        }
        if (skill.maxLevel !== undefined && skill.level >= skill.maxLevel) {
            return;
        }
        const gainBase = skills.expGainForSkillTrigger(skill, amount);
        const intMult = skillKey !== "integration" ? skills.getIntegrationExpMultiplierForOthers() : 1;
        const gain = gainBase * intMult;
        skill.exp += gain;
        skill.talent += gain * 0.1;
        skill.triggerCount += amount;
        const initExp = d.initialExpToLevel !== undefined ? d.initialExpToLevel : 5;
        const initTal = d.initialTalentToLevel !== undefined ? d.initialTalentToLevel : 10;
        while (skill.exp >= skill.expToLevel && (!skill.maxLevel || skill.level < skill.maxLevel)) {
            skill.exp -= skill.expToLevel;
            skill.level++;
            skill.expToLevel = initExp * Math.pow(skill.level, 1.2);
            engine.onSkillLevelUp(skill);
        }
        while (skill.talent >= skill.talentToLevel) {
            skill.talent -= skill.talentToLevel;
            skill.talentLevel++;
            skill.talentToLevel = skill.talentToLevel * 1.05;
        }
    },
    onSkillLevelUp: function(skill) {
        const def = skills._byKey[skill.key];
        const cat = def && def.category ? def.category : "combat";
        if (skill.key !== "integration" && (cat === "combat" || cat === "class")) {
            engine.onSkillTrigger("integration", 1);
        }
        if (skill.key === "adaptation") {
            data.battle.levelState.skillStrBonus++;
            data.battle.levelState.skillConBonus++;
            initialize.calcPlayerStats(false);
        } else if (skill.affectedStat === "str") {
            data.battle.levelState.skillStrBonus++;
            initialize.calcPlayerStats(false);
        } else if (skill.affectedStat === "con") {
            data.battle.levelState.skillConBonus++;
            initialize.calcPlayerStats(false);
        } else if (skill.key === "alacrity") {
            engine.syncPlayerCooldownFields();
        } else if (skill.key === "endurance") {
            initialize.calcPlayerStats(false);
        } else if (skill.key === "tenacity") {
            initialize.calcPlayerStats(false);
        } else if (skill.key === "force" || skill.key === "longshot") {
            initialize.calcPlayerStats(false);
        } else if (skill.key === "technique" || skill.key === "breathing") {
            initialize.calcPlayerStats(false);
        }
    },
    saveRunHistoryIfNeeded: function() {
        if (data.battle.historyLogged) {
            return;
        }
        const runSeconds = data.battle.elapsedMs / 1000;
        const runCoins = Math.max(0, data.battle.runCoinsFromKills || 0);
        const runCoinsPerSecond = runSeconds > 0 ? runCoins / runSeconds : 0;
        const runLevel = data.battle.levelState ? (data.battle.levelState.level || 0) : 0;
        const runKills = data.battle.enemiesKilled || 0;
        const talentRows = [];
        const start = data.battle.runSkillTalentStart || {};
        const progressSkills = data.progress.skills || {};
        const keys = Object.keys(progressSkills);
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            const sk = progressSkills[k];
            const t0 = start[k] !== undefined ? start[k] : 0;
            const t1 = sk && sk.talentLevel ? sk.talentLevel : 0;
            if (t1 > t0) {
                talentRows.push(`${sk.name} talent ${t0}->${t1}`);
            }
        }
        data.progress.runHistory.unshift({
            survivedSeconds: runSeconds,
            coinsGained: runCoins,
            coinsPerSecond: runCoinsPerSecond,
            level: runLevel,
            kills: runKills,
            talentRows: talentRows
        });
        if (data.progress.runHistory.length > 10) {
            data.progress.runHistory = data.progress.runHistory.slice(0, 10);
        }
        data.battle.historyLogged = true;
    },
    findIntruderById: function(intruderId) {
        for (let i = 0; i < data.battle.enemies.length; i++) {
            if (data.battle.enemies[i].id === intruderId) {
                return data.battle.enemies[i];
            }
        }
        return null;
    },
    updateBaseProduction: function(tickMs) {
    },
    updateZenkoResort: function(tickMs) {
        const base = data.progress.base;
        if (!base) {
            return;
        }
        engine.updateToriiVisitors(tickMs);
        engine.admitWaitingToriiVisitors();
        engine.updateToriiKarmaCheck(tickMs);
        engine.updateZenkoGuests(tickMs);
        engine.updateLaundryBasins(tickMs);
        engine.updateMine(tickMs);
        engine.updateEarthSpirits(tickMs);
        engine.updateWaterSpirits(tickMs);
        engine.updatePebbles(tickMs);
        engine.updateDroplets(tickMs);
        engine.updateOkamiPathJob(tickMs);
        engine.updateBambooForest(tickMs);
        engine.updateFoxDenConstruction(tickMs);
        engine.updateWeaving(tickMs);
        engine.syncInnRoomCounts();
    },
    syncInnRoomCounts: function() {
        const inn = data.progress.base && data.progress.base.inn;
        if (!inn) {
            return;
        }
        const cap = engine.getTatamiInnRoomCapacity();
        const occupied = (inn.guests || []).length;
        inn.roomsOccupied = occupied;
        inn.roomsAvailable = Math.max(0, cap - occupied);
    },
    getTatamiInnRoomCapacity: function() {
        const inn = data.progress.base && data.progress.base.inn;
        const bought = inn && inn.addRoomBought ? inn.addRoomBought : 0;
        return 1 + bought;
    },
    getInnRestDurationSeconds: function() {
        const inn = data.progress.base && data.progress.base.inn;
        const furniture = inn && inn.furnitureBought ? inn.furnitureBought : 0;
        return 5 + furniture * 5;
    },
    getInnRestfulnessPerSecond: function() {
        const inn = data.progress.base && data.progress.base.inn;
        const base = inn ? (inn.restfulnessPerSecond || 1) : 1;
        const decoration = inn && inn.decorationBought ? inn.decorationBought : 0;
        return base + decoration * 0.5;
    },
    getNextAvailableInnRoom: function() {
        const inn = data.progress.base && data.progress.base.inn;
        if (!inn) {
            return null;
        }
        const cap = engine.getTatamiInnRoomCapacity();
        const used = {};
        const guests = inn.guests || [];
        for (let i = 0; i < guests.length; i++) {
            used[guests[i].room] = true;
        }
        for (let room = 1; room <= cap; room++) {
            if (!used[room]) {
                return room;
            }
        }
        return null;
    },
    updateToriiVisitors: function(tickMs) {
        const rh = data.progress.base && data.progress.base.foxDen;
        if (!rh || !rh.unlocks || !rh.unlocks.torii) {
            return;
        }
        const torii = data.progress.base.torii;
        if (!torii) {
            return;
        }
        if ((torii.visitorsWaiting || 0) >= (torii.maxVisitors || 2)) {
            return;
        }
        torii.nextVisitorTimerMs -= tickMs;
        while (torii.nextVisitorTimerMs <= 0 && (torii.visitorsWaiting || 0) < (torii.maxVisitors || 2)) {
            torii.visitorsWaiting = (torii.visitorsWaiting || 0) + 1;
            torii.nextVisitorTimerMs += torii.visitorIntervalMs || 60000;
        }
        if ((torii.visitorsWaiting || 0) >= (torii.maxVisitors || 2)) {
            torii.nextVisitorTimerMs = torii.visitorIntervalMs || 60000;
        }
    },
    isInnBuiltFromFoxDen: function() {
        const rh = data.progress.base && data.progress.base.foxDen;
        return !!(rh && rh.unlocks && rh.unlocks.inn);
    },
    isBonfireBuiltFromFoxDen: function() {
        const rh = data.progress.base && data.progress.base.foxDen;
        return !!(rh && rh.unlocks && rh.unlocks.bonfire);
    },
    isCisternBuiltFromFoxDen: function() {
        const rh = data.progress.base && data.progress.base.foxDen;
        return !!(rh && rh.unlocks && rh.unlocks.cistern);
    },
    isOkamiWeaving: function() {
        return !!(data.progress.weaving && data.progress.weaving.active);
    },
    admitWaitingToriiVisitors: function() {
        if (!engine.isInnBuiltFromFoxDen()) {
            return;
        }
        const torii = data.progress.base && data.progress.base.torii;
        const inn = data.progress.base && data.progress.base.inn;
        if (!torii || !inn) {
            return;
        }
        while ((torii.visitorsWaiting || 0) > 0) {
            engine.syncInnRoomCounts();
            if ((inn.roomsAvailable || 0) <= 0) {
                break;
            }
            const guest = engine.createZenkoGuest();
            if (!guest) {
                break;
            }
            torii.visitorsWaiting--;
        }
    },
    updateToriiKarmaCheck: function(tickMs) {
        const torii = data.progress.base && data.progress.base.torii;
        if (!torii) {
            return;
        }
        const toriiRate = engine.getSiteEffectiveWorkerRate("torii");
        if (toriiRate <= 0) {
            return;
        }
        torii.workerPower = (torii.workerPower || 0) + toriiRate * (tickMs / 1000);
        const required = torii.karmaCheckPowerRequired || 30;
        while (torii.workerPower >= required) {
            torii.workerPower -= required;
            torii.nextVisitorTimerMs = Math.max(0, (torii.nextVisitorTimerMs || 0) - 5000);
        }
    },
    createZenkoGuest: function() {
        if (!engine.isInnBuiltFromFoxDen()) {
            return null;
        }
        const inn = data.progress.base && data.progress.base.inn;
        if (!inn) {
            return null;
        }
        const room = engine.getNextAvailableInnRoom();
        if (room === null) {
            return null;
        }
        const guestId = inn.guestIdCounter || 1;
        const guest = {
            id: guestId,
            type: "wanderer",
            room: room,
            state: "settling in",
            timeToNext: 5,
            restfulness: 0,
            staySeconds: 0,
            restTextIndex: guestId % 4
        };
        inn.guestIdCounter = (inn.guestIdCounter || 1) + 1;
        inn.guests.push(guest);
        engine.syncInnRoomCounts();
        return guest;
    },
    pushInnGuestLogEntry: function(room, starBeads, staySeconds, guestType) {
        const inn = data.progress.base && data.progress.base.inn;
        if (!inn) {
            return;
        }
        inn.guestLog.unshift({
            room: room,
            starBeads: round2(starBeads),
            staySeconds: Math.max(0, Math.round(staySeconds || 0)),
            type: guestType || "wanderer"
        });
        if (inn.guestLog.length > 5) {
            inn.guestLog.length = 5;
        }
    },
    updateZenkoGuests: function(tickMs) {
        if (!engine.isInnBuiltFromFoxDen()) {
            return;
        }
        const inn = data.progress.base && data.progress.base.inn;
        if (!inn) {
            return;
        }
        const sec = tickMs / 1000;
        const nextGuests = [];
        const restRate = engine.getInnRestfulnessPerSecond();
        for (let i = 0; i < inn.guests.length; i++) {
            const guest = inn.guests[i];
            if (guest.room) {
                guest.staySeconds += sec;
                const earnSec = Math.min(sec, Math.max(0, guest.timeToNext));
                guest.restfulness += restRate * earnSec;
            }
            guest.timeToNext -= sec;
            if (guest.timeToNext <= 0 && guest.state === "settling in") {
                guest.state = "resting";
                guest.timeToNext = Math.max(0, guest.timeToNext) + engine.getInnRestDurationSeconds();
                nextGuests.push(guest);
            } else if (guest.timeToNext <= 0 && guest.state === "resting") {
                const beads = round2(Math.max(0, guest.restfulness || 0));
                if (beads > 0) {
                    data.progress.starBeads = round2((data.progress.starBeads || 0) + beads);
                }
                engine.pushInnGuestLogEntry(guest.room, beads, guest.staySeconds, guest.type);
            } else {
                nextGuests.push(guest);
            }
        }
        inn.guests = nextGuests;
        engine.syncInnRoomCounts();
    },
    updateLaundryBasins: function(tickMs) {
    },
    getSpiritCost: function(kind) {
        const hs = data.progress.base && data.progress.base.hiddenSpring;
        const boughtKey = kind + "SpiritsBought";
        const bought = hs ? (hs[boughtKey] || 0) : 0;
        const baseCost = hs ? (hs.spiritCostBase || hs.earthSpiritCostBase || 50) : 50;
        const mult = hs ? (hs.spiritCostMult || hs.earthSpiritCostMult || 10) : 10;
        return baseCost * Math.pow(mult, bought);
    },
    getEarthSpiritCost: function() {
        return engine.getSpiritCost("earth");
    },
    getWaterSpiritCost: function() {
        return engine.getSpiritCost("water");
    },
    getFireSpiritCost: function() {
        return engine.getSpiritCost("fire");
    },
    earthSpiritColors: [
        "#7a4f2a", "#8a5a2b", "#9a6632", "#a8733a",
        "#6f4324", "#80502c", "#93603a", "#b17a45"
    ],
    waterSpiritColors: [
        "#2a6f9e", "#357eb0", "#408ec2", "#4b9ed4",
        "#24638c", "#2f72a0", "#3a81b4", "#4590c8"
    ],
    fireSpiritColors: [
        "#b84a2a", "#c75a35", "#d66a40", "#e57a4b",
        "#a33f22", "#b24f2d", "#c15f38", "#d06f43"
    ],
    plantSpiritColors: [
        "#3d7a3d", "#4a8f4a", "#57a457", "#64b964",
        "#2f6b2f", "#3c803c", "#499549", "#56aa56"
    ],
    bambooCellColors: [
        "#2d6a2d", "#3a7d3a", "#4a9a4a", "#5cb85c",
        "#358835", "#42a042", "#6ecf6e", "#88d888"
    ],
    getSpiritColor: function(spirit) {
        if (!spirit) {
            return "#888";
        }
        let palette = engine.earthSpiritColors;
        if (spirit.kind === "water") {
            palette = engine.waterSpiritColors;
        } else if (spirit.kind === "fire") {
            palette = engine.fireSpiritColors;
        } else if (spirit.kind === "plant") {
            palette = engine.plantSpiritColors;
        }
        return palette[spirit.colorIndex || 0] || palette[0];
    },
    randomBambooCellColor: function() {
        const palette = engine.bambooCellColors;
        return palette[Math.floor(Math.random() * palette.length)];
    },
    getHiddenSpringSpiritSlotMax: function() {
        const hs = data.progress.base && data.progress.base.hiddenSpring;
        return hs ? (hs.spiritMax || 3) : 3;
    },
    findSpiritPlacementSlot: function(kind) {
        const slotMax = engine.getHiddenSpringSpiritSlotMax();
        if (kind === "earth") {
            for (let si = 0; si < 3; si++) {
                if (!engine.getSpiritAtLocation("mine", si, "earth")) {
                    return { location: "mine", slot: si };
                }
            }
            for (let si = 0; si < slotMax; si++) {
                if (!engine.getSpiritAtLocation("hiddenSpring", si, "earth")) {
                    return { location: "hiddenSpring", slot: si };
                }
            }
            return null;
        }
        for (let si = 0; si < slotMax; si++) {
            if (!engine.getSpiritAtLocation("hiddenSpring", si, kind)) {
                return { location: "hiddenSpring", slot: si };
            }
        }
        return null;
    },
    assembleSpiritFromPurchase: function(kind) {
        const hs = data.progress.base && data.progress.base.hiddenSpring;
        if (!hs || !kind) {
            return false;
        }
        const boughtKey = kind + "SpiritsBought";
        const max = engine.getHiddenSpringSpiritSlotMax();
        if ((hs[boughtKey] || 0) >= max) {
            return false;
        }
        const boughtIndex = hs[boughtKey] || 0;
        const placement = engine.findSpiritPlacementSlot(kind);
        if (!placement) {
            return false;
        }
        hs[boughtKey] = boughtIndex + 1;
        if (kind === "earth" && hs.earthSpiritsBought === 1) {
            engine.ensureMapRevealed().mine = true;
        }
        if (!hs.spiritIdCounter) {
            hs.spiritIdCounter = 1;
        }
        const spirit = {
            id: hs.spiritIdCounter++,
            kind: kind,
            colorIndex: boughtIndex % 8,
            level: 1,
            exp: 0,
            expToLevel: 15,
            spiritPower: 1,
            location: placement.location,
            slot: placement.slot
        };
        if (kind === "earth") {
            spirit.pebbleCooldownMs = 5000;
        } else if (kind === "water") {
            spirit.dropletCooldownMs = 5000;
        }
        hs.spirits.push(spirit);
        return true;
    },
    assembleEarthSpiritFromPurchase: function() {
        return engine.assembleSpiritFromPurchase("earth");
    },
    assembleWaterSpiritFromPurchase: function() {
        return engine.assembleSpiritFromPurchase("water");
    },
    assembleFireSpiritFromPurchase: function() {
        return engine.assembleSpiritFromPurchase("fire");
    },
    assemblePlantSpiritFromPurchase: function() {
        const hs = data.progress.base && data.progress.base.hiddenSpring;
        const torii = data.progress.base && data.progress.base.torii;
        const cfg = resortData.bambooForestConfig;
        const max = cfg.plantSpiritMax || 4;
        if (!hs || !torii || (torii.plantSpiritsBought || 0) >= max) {
            return false;
        }
        let slot = -1;
        for (let si = 0; si < max; si++) {
            if (!engine.getSpiritAtLocation("bambooForest", si, "plant")) {
                slot = si;
                break;
            }
        }
        if (slot < 0) {
            return false;
        }
        torii.plantSpiritsBought = (torii.plantSpiritsBought || 0) + 1;
        if (!hs.spiritIdCounter) {
            hs.spiritIdCounter = 1;
        }
        const bought = torii.plantSpiritsBought - 1;
        const spirit = {
            id: hs.spiritIdCounter++,
            kind: "plant",
            colorIndex: bought % 8,
            level: 1,
            exp: 0,
            expToLevel: 15,
            spiritPower: 1,
            location: "bambooForest",
            slot: slot
        };
        hs.spirits.push(spirit);
        return true;
    },
    buyAssembleEarthSpirit: function() {
        return engine.buySpirit("earth");
    },
    buySpirit: function(kind) {
        const hs = data.progress.base && data.progress.base.hiddenSpring;
        const boughtKey = kind + "SpiritsBought";
        if (!hs || (hs[boughtKey] || 0) >= engine.getHiddenSpringSpiritSlotMax()) {
            return false;
        }
        const cost = engine.getSpiritCost(kind);
        if ((data.progress.starBeads || 0) < cost) {
            return false;
        }
        data.progress.starBeads -= cost;
        return engine.assembleSpiritFromPurchase(kind);
    },
    getSpiritById: function(spiritId) {
        const spirits = (data.progress.base && data.progress.base.hiddenSpring && data.progress.base.hiddenSpring.spirits) || [];
        for (let i = 0; i < spirits.length; i++) {
            if (spirits[i].id === spiritId) {
                return spirits[i];
            }
        }
        return null;
    },
    getSpiritAtLocation: function(location, slotIndex, kind) {
        const spirits = (data.progress.base && data.progress.base.hiddenSpring && data.progress.base.hiddenSpring.spirits) || [];
        for (let i = 0; i < spirits.length; i++) {
            const s = spirits[i];
            if (kind && s.kind !== kind) {
                continue;
            }
            if ((s.location || "hiddenSpring") === location && (s.slot || 0) === slotIndex) {
                return s;
            }
        }
        return null;
    },
    moveSelectedSpiritTo: function(location, slotIndex) {
        const selected = engine.getSpiritById(data.progress.selectedSpiritId);
        if (!selected) {
            return false;
        }
        if (selected.kind === "plant") {
            return engine.movePlantSpiritTo(location, slotIndex);
        }
        if (selected.kind === "earth") {
            if (location !== "hiddenSpring" && location !== "mine") {
                return false;
            }
            if (location === "mine" && slotIndex >= 3) {
                return false;
            }
            const fromHidden = (selected.location || "hiddenSpring") === "hiddenSpring";
            const occupant = engine.getSpiritAtLocation(location, slotIndex, "earth");
            if (occupant && occupant.id !== selected.id) {
                const oldLocation = selected.location || "hiddenSpring";
                const oldSlot = selected.slot || 0;
                occupant.location = oldLocation;
                occupant.slot = oldSlot;
                if (oldLocation !== "hiddenSpring") {
                    engine.recallPebblesForSpirit(occupant.id);
                }
            }
            selected.location = location;
            selected.slot = slotIndex;
            if (fromHidden && location !== "hiddenSpring") {
                engine.recallPebblesForSpirit(selected.id);
            }
            return true;
        }
        if (selected.kind === "water" || selected.kind === "fire") {
            if (location !== "hiddenSpring") {
                return false;
            }
            const oldSlot = selected.slot || 0;
            const occupant = engine.getSpiritAtLocation("hiddenSpring", slotIndex, selected.kind);
            if (occupant && occupant.id !== selected.id) {
                occupant.slot = oldSlot;
            }
            selected.location = "hiddenSpring";
            selected.slot = slotIndex;
            return true;
        }
        return false;
    },
    movePlantSpiritTo: function(location, slotIndex) {
        const selected = engine.getSpiritById(data.progress.selectedSpiritId);
        if (!selected || selected.kind !== "plant") {
            return false;
        }
        const cfg = resortData.bambooForestConfig;
        const max = cfg.plantSpiritMax || 4;
        if (location !== "bambooForest" || slotIndex < 0 || slotIndex >= max) {
            return false;
        }
        const oldLocation = selected.location || "bambooForest";
        const oldSlot = selected.slot || 0;
        const occupant = engine.getSpiritAtLocation(location, slotIndex, "plant");
        if (occupant && occupant.id !== selected.id) {
            occupant.location = oldLocation;
            occupant.slot = oldSlot;
            if (oldLocation === "bambooForest") {
                engine.applyBambooSpiritRemoved(oldSlot);
            }
        }
        if (oldLocation === "bambooForest" && (location !== "bambooForest" || oldSlot !== slotIndex)) {
            engine.applyBambooSpiritRemoved(oldSlot);
        }
        selected.location = location;
        selected.slot = slotIndex;
        return true;
    },
    recallPebblesForSpirit: function(spiritId) {
        const base = data.progress.base;
        const pebbles = base && base.pebbles ? base.pebbles : [];
        const next = [];
        for (let i = 0; i < pebbles.length; i++) {
            const pebble = pebbles[i];
            if (pebble.spiritId === spiritId) {
                if (!base.mine.resources) {
                    base.mine.resources = { dirt: 0, stone: 0 };
                }
                base.mine.resources.stone = (base.mine.resources.stone || 0) + (pebble.payload || 0);
            } else {
                next.push(pebble);
            }
        }
        base.pebbles = next;
    },
    grantSpiritExp: function(spirit, amount) {
        if (!spirit || amount <= 0) {
            return;
        }
        spirit.exp = (spirit.exp || 0) + amount;
        spirit.expToLevel = spirit.expToLevel || 15;
        while (spirit.exp >= spirit.expToLevel) {
            spirit.exp -= spirit.expToLevel;
            spirit.level = (spirit.level || 1) + 1;
            spirit.expToLevel *= 2;
            spirit.spiritPower = (spirit.spiritPower || 1) * 1.5;
        }
    },
    updateEarthSpirits: function(tickMs) {
        const base = data.progress.base;
        const hs = base && base.hiddenSpring;
        if (!hs || !hs.spirits) {
            return;
        }
        for (let i = 0; i < hs.spirits.length; i++) {
            const spirit = hs.spirits[i];
            if (spirit.kind !== "earth" || (spirit.location || "hiddenSpring") !== "hiddenSpring") {
                continue;
            }
            const active = engine.countPebblesForSpirit(spirit.id);
            if (active >= 2) {
                continue;
            }
            const payload = spirit.spiritPower || 1;
            if (!base.mine || !base.mine.resources || (base.mine.resources.stone || 0) < payload) {
                continue;
            }
            spirit.pebbleCooldownMs = Math.max(0, (spirit.pebbleCooldownMs || 0) - tickMs);
            if (spirit.pebbleCooldownMs <= 0) {
                engine.createPebbleForSpirit(spirit.id);
                spirit.pebbleCooldownMs = 5000;
            }
        }
    },
    countPebblesForSpirit: function(spiritId) {
        const pebbles = (data.progress.base && data.progress.base.pebbles) || [];
        let count = 0;
        for (let i = 0; i < pebbles.length; i++) {
            if (pebbles[i].spiritId === spiritId) {
                count++;
            }
        }
        return count;
    },
    createPebbleForSpirit: function(spiritId) {
        const base = data.progress.base;
        const spirit = engine.getSpiritById(spiritId);
        const payload = spirit ? (spirit.spiritPower || 1) : 1;
        if (!base.mine || !base.mine.resources || (base.mine.resources.stone || 0) < payload) {
            return false;
        }
        base.mine.resources.stone -= payload;
        if (!base.pebbles) {
            base.pebbles = [];
        }
        base.pebbles.push({
            id: base.pebbleIdCounter || 1,
            spiritId: spiritId,
            payload: payload,
            colorIndex: spirit ? (spirit.colorIndex || 0) : 0,
            pathProgress: 0
        });
        base.pebbleIdCounter = (base.pebbleIdCounter || 1) + 1;
        return true;
    },
    updatePebbles: function(tickMs) {
        const base = data.progress.base;
        const pebbles = base && base.pebbles;
        if (!pebbles) {
            return;
        }
        const speed = 35;
        const distance = engine.getResortPathTotalDistance();
        const next = [];
        for (let i = 0; i < pebbles.length; i++) {
            const pebble = pebbles[i];
            const segIdx = engine.getPathSegmentIndexAtProgress(pebble.pathProgress || 0);
            const segMult = engine.getPathSegmentSpeedMultiplier(segIdx);
            pebble.pathProgress = (pebble.pathProgress || 0) + (speed * segMult * (tickMs / 1000));
            if (pebble.pathProgress >= distance) {
                base.stonePile.stone = (base.stonePile.stone || 0) + (pebble.payload || 1);
            } else {
                next.push(pebble);
            }
        }
        base.pebbles = next;
    },
    getDropletForSpirit: function(spiritId) {
        const droplets = (data.progress.base && data.progress.base.droplets) || [];
        for (let i = 0; i < droplets.length; i++) {
            if (droplets[i].spiritId === spiritId) {
                return droplets[i];
            }
        }
        return null;
    },
    createDropletForSpirit: function(spiritId) {
        const base = data.progress.base;
        const spirit = engine.getSpiritById(spiritId);
        if (!spirit || spirit.kind !== "water" || engine.getDropletForSpirit(spiritId)) {
            return false;
        }
        if (!base.droplets) {
            base.droplets = [];
        }
        const power = spirit.spiritPower || 1;
        base.droplets.push({
            id: base.dropletIdCounter || 1,
            spiritId: spiritId,
            waterVolume: power,
            heat: 60,
            essence: 0,
            infusion: 0
        });
        base.dropletIdCounter = (base.dropletIdCounter || 1) + 1;
        return true;
    },
    addHeatToDroplet: function(dropletId, amount) {
        const droplets = (data.progress.base && data.progress.base.droplets) || [];
        for (let i = 0; i < droplets.length; i++) {
            const d = droplets[i];
            if (d.id !== dropletId) {
                continue;
            }
            const add = Math.max(0, amount || 0);
            const heat = d.heat || 0;
            const room = Math.max(0, 100 - heat);
            const toHeat = Math.min(room, add);
            d.heat = heat + toHeat;
            d.infusion = (d.infusion || 0) + (add - toHeat);
            return true;
        }
        return false;
    },
    updateWaterSpirits: function(tickMs) {
        const base = data.progress.base;
        const hs = base && base.hiddenSpring;
        if (!hs || !hs.spirits) {
            return;
        }
        for (let i = 0; i < hs.spirits.length; i++) {
            const spirit = hs.spirits[i];
            if (spirit.kind !== "water" || (spirit.location || "hiddenSpring") !== "hiddenSpring") {
                continue;
            }
            if (engine.getDropletForSpirit(spirit.id)) {
                continue;
            }
            spirit.dropletCooldownMs = Math.max(0, (spirit.dropletCooldownMs || 0) - tickMs);
            if (spirit.dropletCooldownMs <= 0) {
                engine.createDropletForSpirit(spirit.id);
                spirit.dropletCooldownMs = 5000;
            }
        }
    },
    updateDroplets: function(tickMs) {
        const droplets = (data.progress.base && data.progress.base.droplets) || [];
        const sec = tickMs / 1000;
        for (let i = 0; i < droplets.length; i++) {
            const d = droplets[i];
            const heat = d.heat || 0;
            if (heat > 0) {
                d.heat = Math.max(0, heat - (heat * 0.01 * sec));
            }
        }
    },
    getResortPathPoints: function() {
        const N = 34;
        const X = 380;
        const halfN = N * 0.5 * 1.2;
        const arcCx = 369;
        const arcCy = 84;
        const segs = [
            { type: "arc", cx: arcCx, cy: arcCy, r: N, from: Math.PI, to: Math.PI / 2 }
        ];
        let x = arcCx;
        let y = arcCy + N;
        let onRight = true;
        const lineTo = function(x2, y2) {
            segs.push({ type: "line", x1: x, y1: y, x2: x2, y2: y2 });
            x = x2;
            y = y2;
        };
        const semiDown = function(r, rightSide) {
            const cx = x;
            const cy = y + r;
            segs.push({
                type: "arc",
                cx: cx,
                cy: cy,
                r: r,
                from: -Math.PI / 2,
                to: Math.PI / 2,
                reverseX: !rightSide
            });
            y = y + (2 * r);
        };
        const quarterDownRight = function(r) {
            const cx = x;
            const cy = y + r;
            segs.push({ type: "arc", cx: cx, cy: cy, r: r, from: -Math.PI / 2, to: 0 });
            x = x + r;
            y = y + r;
        };
        lineTo(x + (0.2 * X), y);
        semiDown(halfN, true);
        const rowWidths = [0.6, 0.8, 1.0, 1.2];
        const segmentStep = engine.getResortPathSegmentStep();
        for (let ri = 0; ri < rowWidths.length; ri++) {
            let w = rowWidths[ri] * X;
            if (ri === rowWidths.length - 1) {
                w -= segmentStep;
            }
            if (onRight) {
                lineTo(x - w, y);
            } else {
                lineTo(x + w, y);
            }
            if (ri === rowWidths.length - 1) {
                quarterDownRight(2 * N);
            } else {
                semiDown(halfN, !onRight);
            }
            onRight = !onRight;
        }
        const pathDropY = 20;
        for (let si = 0; si < segs.length; si++) {
            const seg = segs[si];
            if (seg.type === "line") {
                seg.y1 += pathDropY;
                seg.y2 += pathDropY;
            } else if (seg.type === "arc") {
                seg.cy += pathDropY;
            }
        }
        return segs;
    },
    getResortPathEnd: function() {
        return engine.getResortPathPosition(engine.getResortPathTotalDistance());
    },
    segmentsToSvgPath: function(segs) {
        let d = "";
        for (let i = 0; i < segs.length; i++) {
            const s = segs[i];
            if (s.type === "line") {
                if (!d) {
                    d = `M ${Math.round(s.x1)} ${Math.round(s.y1)}`;
                }
                d += ` L ${Math.round(s.x2)} ${Math.round(s.y2)}`;
            } else if (s.type === "arc") {
                const xSign = s.reverseX ? -1 : 1;
                const sx = s.cx + xSign * Math.cos(s.from) * s.r;
                const sy = s.cy + Math.sin(s.from) * s.r;
                if (!d) {
                    d = `M ${Math.round(sx)} ${Math.round(sy)}`;
                }
                const ex = s.cx + xSign * Math.cos(s.to) * s.r;
                const ey = s.cy + Math.sin(s.to) * s.r;
                const largeArc = Math.abs(s.to - s.from) > Math.PI ? 1 : 0;
                let sweep = s.to > s.from ? 1 : 0;
                if (s.reverseX) {
                    sweep = 1 - sweep;
                }
                d += ` A ${s.r} ${s.r} 0 ${largeArc} ${sweep} ${Math.round(ex)} ${Math.round(ey)}`;
            }
        }
        return d;
    },
    getPathSegmentVisualTier: function(segmentIndex) {
        const seg = engine.getPathSegmentData(segmentIndex);
        if (!seg || seg.state !== "Clear") {
            return "rocks";
        }
        if (seg.hasLanterns) {
            return "lanterns";
        }
        if (seg.hasStairs) {
            return "stairs";
        }
        if (seg.hasRailing) {
            return "railing";
        }
        return "clear";
    },
    pathJobReturnsAfterWeave: function(jobType) {
        return jobType === "addRailing" || jobType === "addStairs" || jobType === "addLanterns";
    },
    pathJobUsesHalfSpeedTo: function(jobType) {
        return jobType === "addRailing" || jobType === "addStairs";
    },
    syncResortPathDom: function() {
        const globalTrack = document.querySelector(".resort-path-track");
        const globalHollow = document.querySelector(".resort-path-hollow");
        if (globalTrack) {
            globalTrack.setAttribute("d", "");
        }
        if (globalHollow) {
            globalHollow.setAttribute("d", "");
        }
        const specs = engine.getResortPathSegmentSpecs();
        for (let i = 0; i < specs.length; i++) {
            const trackEl = document.getElementById(`pathSegmentTrack_${i}`);
            const hollowEl = document.getElementById(`pathSegmentHollow_${i}`);
            if (!trackEl || !hollowEl) {
                continue;
            }
            const revealed = engine.isPathSegmentRevealed(i);
            const d = engine.getPathSegmentSvgSubpath(i);
            trackEl.setAttribute("d", d);
            hollowEl.setAttribute("d", d);
            const tier = engine.getPathSegmentVisualTier(i);
            const dashedTier = tier === "rocks" || tier === "stairs";
            const showTrack = revealed ? "" : "none";
            const showHollow = revealed && !dashedTier ? "" : "none";
            trackEl.style.display = showTrack;
            hollowEl.style.display = showHollow;
            trackEl.setAttribute("class", `path-seg-track path-seg-track-tier-${tier}`);
            hollowEl.setAttribute("class", `path-seg-hollow path-seg-hollow-tier-${tier}`);
            if (dashedTier) {
                trackEl.setAttribute("pathLength", "100");
                trackEl.setAttribute("stroke-dasharray", tier === "rocks" ? "14 10" : "20 8");
            } else {
                trackEl.removeAttribute("pathLength");
                trackEl.removeAttribute("stroke-dasharray");
            }
            hollowEl.removeAttribute("pathLength");
            hollowEl.removeAttribute("stroke-dasharray");
        }
        const end = engine.getResortPathEnd();
        viewData.layout.pathEndX = end.x;
        viewData.layout.pathEndY = end.y;
        const map = document.getElementById("baseResortMap");
        if (map && end) {
            map.style.setProperty("--path-end-x", `${Math.round(end.x)}px`);
            map.style.setProperty("--path-end-y", `${Math.round(end.y)}px`);
        }
    },
    getResortPathTotalDistance: function() {
        const segs = engine.getResortPathPoints();
        let total = 0;
        for (let i = 0; i < segs.length; i++) {
            const s = segs[i];
            if (s.type === "line") {
                total += Math.sqrt(Math.pow(s.x2 - s.x1, 2) + Math.pow(s.y2 - s.y1, 2));
            } else if (s.type === "arc") {
                total += Math.abs(s.to - s.from) * s.r;
            } else if (s.type === "bezier") {
                total += engine.getBezierLength(s);
            }
        }
        return total;
    },
    getBezierPoint: function(s, t) {
        const mt = 1 - t;
        return {
            x: mt * mt * mt * s.x1 + 3 * mt * mt * t * s.c1x + 3 * mt * t * t * s.c2x + t * t * t * s.x2,
            y: mt * mt * mt * s.y1 + 3 * mt * mt * t * s.c1y + 3 * mt * t * t * s.c2y + t * t * t * s.y2
        };
    },
    getBezierLength: function(s) {
        let len = 0;
        let prev = { x: s.x1, y: s.y1 };
        for (let i = 1; i <= 20; i++) {
            const p = engine.getBezierPoint(s, i / 20);
            len += Math.sqrt(Math.pow(p.x - prev.x, 2) + Math.pow(p.y - prev.y, 2));
            prev = p;
        }
        return len;
    },
    getResortPathPosition: function(distance) {
        const segs = engine.getResortPathPoints();
        let remaining = Math.max(0, distance || 0);
        for (let i = 0; i < segs.length; i++) {
            const s = segs[i];
            const seg = s.type === "line"
                ? Math.sqrt(Math.pow(s.x2 - s.x1, 2) + Math.pow(s.y2 - s.y1, 2))
                : (s.type === "arc" ? Math.abs(s.to - s.from) * s.r : engine.getBezierLength(s));
            if (remaining <= seg) {
                const t = seg > 0 ? remaining / seg : 0;
                if (s.type === "line") {
                    return {
                        x: s.x1 + (s.x2 - s.x1) * t,
                        y: s.y1 + (s.y2 - s.y1) * t
                    };
                }
                if (s.type === "bezier") {
                    return engine.getBezierPoint(s, t);
                }
                const angle = s.from + (s.to - s.from) * t;
                const xSign = s.reverseX ? -1 : 1;
                return {
                    x: s.cx + xSign * Math.cos(angle) * s.r,
                    y: s.cy + Math.sin(angle) * s.r
                };
            }
            remaining -= seg;
        }
        const last = segs[segs.length - 1];
        if (last && last.type === "line") {
            return { x: last.x2, y: last.y2 };
        }
        if (last && last.type === "arc") {
            const xSign = last.reverseX ? -1 : 1;
            return {
                x: last.cx + xSign * Math.cos(last.to) * last.r,
                y: last.cy + Math.sin(last.to) * last.r
            };
        }
        return { x: 580, y: 322 };
    },
    getResortPathSegmentStep: function() {
        const cfg = resortData.pathConfig || {};
        return cfg.segmentStep !== undefined ? cfg.segmentStep : 38;
    },
    getResortPathSegmentSpecs: function() {
        if (engine._pathSegmentSpecsCache) {
            return engine._pathSegmentSpecsCache;
        }
        const step = engine.getResortPathSegmentStep();
        const semiParts = (resortData.pathConfig && resortData.pathConfig.semiCircleSegmentCount) || 2;
        const geomSegs = engine.getResortPathPoints();
        const specs = [];
        let distCursor = 0;
        for (let gi = 0; gi < geomSegs.length; gi++) {
            const s = geomSegs[gi];
            let segLen = 0;
            if (s.type === "line") {
                segLen = Math.sqrt(Math.pow(s.x2 - s.x1, 2) + Math.pow(s.y2 - s.y1, 2));
                const chunks = [];
                let pos = 0;
                while (pos < segLen - 0.001) {
                    chunks.push(Math.min(step, segLen - pos));
                    pos += chunks[chunks.length - 1];
                }
                if (chunks.length > 1 && chunks[chunks.length - 1] < step - 0.001) {
                    chunks[chunks.length - 2] += chunks.pop();
                }
                let chunkPos = 0;
                for (let ci = 0; ci < chunks.length; ci++) {
                    const chunk = chunks[ci];
                    specs.push({
                        index: specs.length,
                        startDist: distCursor + chunkPos,
                        endDist: distCursor + chunkPos + chunk,
                        midDist: distCursor + chunkPos + (chunk * 0.5)
                    });
                    chunkPos += chunk;
                }
            } else if (s.type === "arc") {
                segLen = Math.abs(s.to - s.from) * s.r;
                const isSemi = Math.abs(Math.abs(s.to - s.from) - Math.PI) < 0.01;
                const parts = isSemi ? semiParts : Math.max(1, Math.ceil(segLen / step));
                const partLen = segLen / parts;
                for (let p = 0; p < parts; p++) {
                    specs.push({
                        index: specs.length,
                        startDist: distCursor + (p * partLen),
                        endDist: distCursor + ((p + 1) * partLen),
                        midDist: distCursor + ((p + 0.5) * partLen)
                    });
                }
            }
            distCursor += segLen;
        }
        engine._pathSegmentSpecsCache = specs;
        return specs;
    },
    ensurePathSegments: function() {
        const base = data.progress.base;
        const specs = engine.getResortPathSegmentSpecs();
        if (!base.pathSegments || base.pathSegments.length !== specs.length) {
            const prev = base.pathSegments || [];
            base.pathSegments = [];
            for (let i = 0; i < specs.length; i++) {
                if (prev[i] && prev[i].state) {
                    base.pathSegments.push({
                        state: prev[i].state,
                        hasRailing: !!prev[i].hasRailing,
                        hasStairs: !!prev[i].hasStairs,
                        hasLanterns: !!prev[i].hasLanterns
                    });
                } else {
                    base.pathSegments.push({
                        state: "Large Rocks",
                        hasRailing: false,
                        hasStairs: false,
                        hasLanterns: false
                    });
                }
            }
        }
        return base.pathSegments;
    },
    getPathSegmentData: function(segmentIndex) {
        const segs = engine.ensurePathSegments();
        return segs[segmentIndex] || null;
    },
    getLastPathSegmentIndex: function() {
        const specs = engine.getResortPathSegmentSpecs();
        return specs.length > 0 ? specs.length - 1 : 0;
    },
    isPathSegmentRevealed: function(segmentIndex) {
        const idx = segmentIndex | 0;
        const last = engine.getLastPathSegmentIndex();
        if (idx < 0 || idx > last) {
            return false;
        }
        if (typeof showPathDebug !== "undefined" && showPathDebug) {
            return true;
        }
        if (idx === last) {
            return true;
        }
        const next = engine.getPathSegmentData(idx + 1);
        return !!(next && next.state === "Clear");
    },
    isPathSegmentAccessible: function(segmentIndex) {
        const idx = segmentIndex | 0;
        const last = engine.getLastPathSegmentIndex();
        if (idx < 0 || !engine.isPathSegmentRevealed(idx)) {
            return false;
        }
        if (idx === last) {
            return true;
        }
        const next = engine.getPathSegmentData(idx + 1);
        return !!(next && next.state === "Clear");
    },
    getRevealedPathSvgD: function() {
        const specs = engine.getResortPathSegmentSpecs();
        let d = "";
        let prevRevealed = false;
        for (let i = 0; i < specs.length; i++) {
            if (!engine.isPathSegmentRevealed(i)) {
                prevRevealed = false;
                continue;
            }
            const sub = engine.getPathSegmentSvgSubpath(i);
            if (!sub) {
                prevRevealed = false;
                continue;
            }
            if (d && prevRevealed) {
                d += sub.replace(/^M\s*[\d.-]+\s*[\d.-]+/, "");
            } else {
                d = d ? `${d} ${sub}` : sub;
            }
            prevRevealed = true;
        }
        return d;
    },
    getNextAccessiblePathSegment: function() {
        const last = engine.getLastPathSegmentIndex();
        for (let i = last; i >= 0; i--) {
            if (!engine.isPathSegmentAccessible(i)) {
                continue;
            }
            const seg = engine.getPathSegmentData(i);
            if (seg && seg.state !== "Clear") {
                return i;
            }
        }
        return null;
    },
    getResortPathSvgSubpathByDistance: function(startDist, endDist) {
        const geomSegs = engine.getResortPathPoints();
        let distCursor = 0;
        let d = "";
        const appendLine = function(x1, y1, x2, y2) {
            if (!d) {
                d = `M ${Math.round(x1)} ${Math.round(y1)}`;
            }
            d += ` L ${Math.round(x2)} ${Math.round(y2)}`;
        };
        const appendArc = function(s, angleFrom, angleTo) {
            const xSign = s.reverseX ? -1 : 1;
            const sx = s.cx + xSign * Math.cos(angleFrom) * s.r;
            const sy = s.cy + Math.sin(angleFrom) * s.r;
            const ex = s.cx + xSign * Math.cos(angleTo) * s.r;
            const ey = s.cy + Math.sin(angleTo) * s.r;
            if (!d) {
                d = `M ${Math.round(sx)} ${Math.round(sy)}`;
            }
            const largeArc = Math.abs(angleTo - angleFrom) > Math.PI ? 1 : 0;
            let sweep = angleTo > angleFrom ? 1 : 0;
            if (s.reverseX) {
                sweep = 1 - sweep;
            }
            d += ` A ${s.r} ${s.r} 0 ${largeArc} ${sweep} ${Math.round(ex)} ${Math.round(ey)}`;
        };
        for (let gi = 0; gi < geomSegs.length; gi++) {
            const s = geomSegs[gi];
            let segLen = 0;
            if (s.type === "line") {
                segLen = Math.sqrt(Math.pow(s.x2 - s.x1, 2) + Math.pow(s.y2 - s.y1, 2));
            } else if (s.type === "arc") {
                segLen = Math.abs(s.to - s.from) * s.r;
            } else if (s.type === "bezier") {
                segLen = engine.getBezierLength(s);
            }
            const segStart = distCursor;
            const segEnd = distCursor + segLen;
            if (endDist <= segStart) {
                break;
            }
            if (startDist >= segEnd) {
                distCursor = segEnd;
                continue;
            }
            const localStart = Math.max(0, startDist - segStart);
            const localEnd = Math.min(segLen, endDist - segStart);
            if (s.type === "line") {
                const t0 = segLen > 0 ? localStart / segLen : 0;
                const t1 = segLen > 0 ? localEnd / segLen : 0;
                appendLine(
                    s.x1 + (s.x2 - s.x1) * t0,
                    s.y1 + (s.y2 - s.y1) * t0,
                    s.x1 + (s.x2 - s.x1) * t1,
                    s.y1 + (s.y2 - s.y1) * t1
                );
            } else if (s.type === "arc") {
                const a0 = s.from + (s.to - s.from) * (segLen > 0 ? localStart / segLen : 0);
                const a1 = s.from + (s.to - s.from) * (segLen > 0 ? localEnd / segLen : 0);
                appendArc(s, a0, a1);
            } else if (s.type === "bezier") {
                const steps = 12;
                const t0 = segLen > 0 ? localStart / segLen : 0;
                const t1 = segLen > 0 ? localEnd / segLen : 0;
                const p0 = engine.getBezierPoint(s, t0);
                if (!d) {
                    d = `M ${Math.round(p0.x)} ${Math.round(p0.y)}`;
                }
                for (let si = 1; si <= steps; si++) {
                    const t = t0 + ((t1 - t0) * (si / steps));
                    const p = engine.getBezierPoint(s, t);
                    d += ` L ${Math.round(p.x)} ${Math.round(p.y)}`;
                }
            }
            distCursor = segEnd;
        }
        return d;
    },
    getPathSegmentSvgSubpath: function(segmentIndex) {
        const specs = engine.getResortPathSegmentSpecs();
        const spec = specs[segmentIndex];
        if (!spec) {
            return "";
        }
        return engine.getResortPathSvgSubpathByDistance(spec.startDist, spec.endDist);
    },
    getPathSegmentAssignmentKey: function(segmentIndex) {
        return `path_${segmentIndex}`;
    },
    parsePathAssignmentKey: function(assignmentKey) {
        if (!assignmentKey || assignmentKey.indexOf("path_") !== 0) {
            return null;
        }
        const idx = parseInt(assignmentKey.slice(5), 10);
        return isNaN(idx) ? null : idx;
    },
    getOkamiTravelSpeed: function() {
        const cfg = resortData.pathConfig || {};
        return cfg.okamiTravelSpeed !== undefined ? cfg.okamiTravelSpeed : 35;
    },
    getOkamiPathJob: function() {
        const okami = engine.getOkami();
        return okami.pathJob || null;
    },
    getPathSegmentTargetProgress: function(segmentIndex) {
        const specs = engine.getResortPathSegmentSpecs();
        const spec = specs[segmentIndex];
        return spec ? spec.midDist : 0;
    },
    getPathSegmentIndexAtProgress: function(pathProgress) {
        const specs = engine.getResortPathSegmentSpecs();
        const p = Math.max(0, pathProgress || 0);
        for (let i = 0; i < specs.length; i++) {
            const spec = specs[i];
            if (p >= spec.startDist && p < spec.endDist) {
                return i;
            }
        }
        return specs.length > 0 ? specs.length - 1 : 0;
    },
    getPathSegmentSpeedMultiplier: function(segmentIndex) {
        const seg = engine.getPathSegmentData(segmentIndex);
        return seg && seg.hasLanterns ? 1.2 : 1;
    },
    getOkamiPathSegmentSpeedMult: function(pathProgress) {
        const segIdx = engine.getPathSegmentIndexAtProgress(pathProgress);
        const seg = engine.getPathSegmentData(segIdx);
        if (!seg) {
            return 1;
        }
        let mult = 1;
        if (seg.hasRailing) {
            mult += 0.5;
        }
        if (seg.hasStairs) {
            mult += 0.5;
        }
        if (seg.hasLanterns) {
            mult *= 1.2;
        }
        return mult;
    },
    getPathTravelDirectionEast: function(pathProgress) {
        const eps = 0.5;
        const total = engine.getResortPathTotalDistance();
        const p0 = engine.getResortPathPosition(Math.max(0, Math.min(total, pathProgress)));
        const p1 = engine.getResortPathPosition(Math.max(0, Math.min(total, pathProgress + eps)));
        return p1.x >= p0.x;
    },
    ensurePausedPathJobs: function() {
        const okami = engine.getOkami();
        if (!okami.pausedPathJobs) {
            okami.pausedPathJobs = {};
        }
        return okami.pausedPathJobs;
    },
    clearPausedPathJob: function(segmentIndex) {
        const paused = engine.ensurePausedPathJobs();
        delete paused[segmentIndex];
    },
    snapshotPathJob: function(job) {
        if (!job) {
            return null;
        }
        const phase = job.paused ? (job.pausedPhase || job.phase) : job.phase;
        const pathProgress = job.paused && job.pausedPathProgress !== undefined
            ? job.pausedPathProgress
            : job.pathProgress;
        const weaveRemainMs = job.paused && job.pausedWeaveRemainMs !== undefined
            ? job.pausedWeaveRemainMs
            : (job.weaveRemainMs || 0);
        return {
            jobType: job.jobType,
            segmentIndex: job.segmentIndex,
            phase: phase,
            pathProgress: pathProgress,
            targetProgress: job.targetProgress,
            weaveRemainMs: weaveRemainMs,
            weaveTotalMs: job.weaveTotalMs || 0
        };
    },
    storePausedPathJob: function(job) {
        const snap = engine.snapshotPathJob(job);
        if (!snap) {
            return;
        }
        const paused = engine.ensurePausedPathJobs();
        paused[snap.segmentIndex] = snap;
    },
    pauseActivePathJobToStorage: function() {
        const okami = engine.getOkami();
        const job = okami.pathJob;
        if (!job) {
            return;
        }
        engine.storePausedPathJob(job);
        okami.pathJob = null;
        if (engine.parsePathAssignmentKey(okami.assignedBuildingKey) === job.segmentIndex) {
            okami.assignedBuildingKey = "";
        }
    },
    interruptOkamiForPathJob: function() {
        const okami = engine.getOkami();
        const weaving = data.progress.weaving;
        if (weaving && weaving.active) {
            engine.pauseWeavingEntry(weaving.active);
            weaving.active = null;
            okami.assignedBuildingKey = "";
        }
        if (okami.assignedBuildingKey === "foxDen") {
            okami.assignedBuildingKey = "";
            engine.syncFoxDenCarriersToWorkforce();
        } else if (okami.assignedBuildingKey && engine.parsePathAssignmentKey(okami.assignedBuildingKey) === null) {
            okami.assignedBuildingKey = "";
        }
    },
    resumePathJobForSegment: function(segmentIndex) {
        const okami = engine.getOkami();
        const paused = engine.ensurePausedPathJobs();
        const stored = paused[segmentIndex];
        const active = okami.pathJob;
        if (active && active.segmentIndex === segmentIndex && active.paused) {
            active.paused = false;
            active.phase = active.pausedPhase || active.phase;
            active.pathProgress = active.pausedPathProgress !== undefined ? active.pausedPathProgress : active.pathProgress;
            if (active.phase === "weaving" && active.pausedWeaveRemainMs !== undefined) {
                active.weaveRemainMs = active.pausedWeaveRemainMs;
            }
            delete active.pausedPhase;
            delete active.pausedPathProgress;
            delete active.pausedWeaveRemainMs;
            okami.assignedBuildingKey = engine.getPathSegmentAssignmentKey(segmentIndex);
            return true;
        }
        if (!stored) {
            return false;
        }
        if (active && active.segmentIndex !== segmentIndex) {
            engine.pauseActivePathJobToStorage();
        }
        okami.pathJob = Object.assign({ paused: false }, stored);
        delete paused[segmentIndex];
        okami.assignedBuildingKey = engine.getPathSegmentAssignmentKey(segmentIndex);
        return true;
    },
    getNextPathUpgradeKey: function(segmentIndex) {
        const seg = engine.getPathSegmentData(segmentIndex);
        if (!seg) {
            return null;
        }
        if (seg.state === "Large Rocks") {
            return "removeRocks";
        }
        if (seg.state === "Clear" && !seg.hasRailing) {
            return "addRailing";
        }
        if (seg.state === "Clear" && seg.hasRailing && !seg.hasStairs) {
            return "addStairs";
        }
        if (seg.state === "Clear" && seg.hasStairs && !seg.hasLanterns) {
            return "addLanterns";
        }
        return null;
    },
    restoreOkamiAfterWeaveOrPath: function() {
        const okami = engine.getOkami();
        const garden = data.progress.base && data.progress.base.garden;
        if (garden && garden.arrangementOfRemembranceUnlocked && okami.lastAssignedBuildingKey) {
            okami.assignedBuildingKey = okami.lastAssignedBuildingKey;
            if (okami.assignedBuildingKey === "foxDen") {
                engine.syncFoxDenCarriersToWorkforce();
            }
        } else {
            okami.assignedBuildingKey = "";
        }
    },
    canStartPathSegmentJob: function(segmentIndex, jobType) {
        const seg = engine.getPathSegmentData(segmentIndex);
        if (!seg) {
            return false;
        }
        if (jobType === "removeRocks") {
            return seg.state === "Large Rocks";
        }
        if (jobType === "addRailing") {
            return seg.state === "Clear" && !seg.hasRailing;
        }
        if (jobType === "addStairs") {
            return seg.state === "Clear" && seg.hasRailing && !seg.hasStairs;
        }
        if (jobType === "addLanterns") {
            return seg.state === "Clear" && seg.hasStairs && !seg.hasLanterns;
        }
        return false;
    },
    startPathSegmentJob: function(segmentIndex, jobType) {
        if (!engine.canStartPathSegmentJob(segmentIndex, jobType)) {
            return false;
        }
        const okami = engine.getOkami();
        const paused = engine.ensurePausedPathJobs();
        if (paused[segmentIndex]) {
            engine.interruptOkamiForPathJob();
            return engine.resumePathJobForSegment(segmentIndex);
        }
        const job = okami.pathJob;
        if (job && job.segmentIndex === segmentIndex && !job.paused) {
            return false;
        }
        if (okami.assignedBuildingKey && engine.parsePathAssignmentKey(okami.assignedBuildingKey) === null) {
            okami.lastAssignedBuildingKey = okami.assignedBuildingKey;
        }
        engine.interruptOkamiForPathJob();
        if (job) {
            engine.pauseActivePathJobToStorage();
        }
        const totalDist = engine.getResortPathTotalDistance();
        const target = engine.getPathSegmentTargetProgress(segmentIndex);
        okami.assignedBuildingKey = engine.getPathSegmentAssignmentKey(segmentIndex);
        okami.pathJob = {
            jobType: jobType,
            segmentIndex: segmentIndex,
            phase: "travelingTo",
            pathProgress: totalDist,
            targetProgress: target,
            paused: false,
            weaveRemainMs: 0,
            weaveTotalMs: 0
        };
        return true;
    },
    startPathRemoveRocks: function(segmentIndex) {
        return engine.startPathSegmentJob(segmentIndex, "removeRocks");
    },
    startPathAddRailing: function(segmentIndex) {
        return engine.startPathSegmentJob(segmentIndex, "addRailing");
    },
    pauseOkamiPathJob: function() {
        engine.pauseActivePathJobToStorage();
    },
    resumeOkamiPathJob: function(segmentIndex) {
        const okami = engine.getOkami();
        const idx = segmentIndex !== undefined && segmentIndex !== null
            ? segmentIndex
            : (okami.pathJob ? okami.pathJob.segmentIndex : null);
        if (idx === null || idx === undefined) {
            return false;
        }
        return engine.resumePathJobForSegment(idx);
    },
    beginPathSegmentWeaving: function(job) {
        const upgradeKey = job.jobType || "removeRocks";
        const up = resortData.buildings.path.upgrades[upgradeKey];
        const totalMs = resortData.getUpgradeWeavingSeconds(up, "path") * 1000;
        job.phase = "weaving";
        job.weaveRemainMs = totalMs;
        job.weaveTotalMs = totalMs;
        job.pathProgress = job.targetProgress;
    },
    completePathRemoveRocks: function(segmentIndex) {
        const base = data.progress.base;
        const seg = engine.getPathSegmentData(segmentIndex);
        if (seg) {
            seg.state = "Clear";
        }
        const storeAmt = (resortData.pathConfig && resortData.pathConfig.storeRockAmount) || 5;
        if (base && base.stonePile) {
            base.stonePile.stone = (base.stonePile.stone || 0) + storeAmt;
        }
        const okami = engine.getOkami();
        okami.pathJob = null;
        engine.clearPausedPathJob(segmentIndex);
        engine.restoreOkamiAfterWeaveOrPath();
        engine.checkMapRevealTriggers();
        engine.syncResortPathDom();
    },
    completePathReturnJob: function(segmentIndex, jobType) {
        const seg = engine.getPathSegmentData(segmentIndex);
        if (seg) {
            if (jobType === "addRailing") {
                seg.hasRailing = true;
            } else if (jobType === "addStairs") {
                seg.hasStairs = true;
            } else if (jobType === "addLanterns") {
                seg.hasLanterns = true;
            }
        }
        const okami = engine.getOkami();
        okami.pathJob = null;
        engine.clearPausedPathJob(segmentIndex);
        engine.restoreOkamiAfterWeaveOrPath();
        engine.syncResortPathDom();
    },
    completePathAddRailing: function(segmentIndex) {
        engine.completePathReturnJob(segmentIndex, "addRailing");
    },
    ensureMapRevealed: function() {
        const base = data.progress.base;
        if (!base.mapRevealed) {
            base.mapRevealed = Object.assign({}, resortData.defaultMapRevealedState);
        }
        return base.mapRevealed;
    },
    isMapElementRevealed: function(key) {
        const revealed = engine.ensureMapRevealed();
        if (key === "spiritSlots") {
            return !!revealed.spiritSlots || !!revealed.hiddenSpring;
        }
        return !!revealed[key];
    },
    checkMapRevealTriggers: function() {
        const revealed = engine.ensureMapRevealed();
        const segs = engine.ensurePathSegments();
        let allClear = segs.length > 0;
        for (let i = 0; i < segs.length; i++) {
            if (segs[i].state !== "Clear") {
                allClear = false;
                break;
            }
        }
        if (allClear) {
            revealed.hiddenSpring = true;
            revealed.spiritSlots = true;
        }
    },
    ensureFoxDenConstruction: function() {
        const rh = data.progress.base.foxDen;
        if (!rh.constructionQueue) {
            rh.constructionQueue = [];
        }
        if (!rh.constructionSites) {
            rh.constructionSites = {};
        }
        if (!rh.constructionCarriers) {
            rh.constructionCarriers = [];
        }
        if (!rh.upgradeGatherJobs) {
            rh.upgradeGatherJobs = {};
        }
        if (!rh.upgradeGatherQueue) {
            rh.upgradeGatherQueue = [];
        }
        if (rh._reviewWeaveAccumMs === undefined) {
            rh._reviewWeaveAccumMs = 0;
        }
        if (rh.lastCarrierSpawnMs === undefined) {
            rh.lastCarrierSpawnMs = 0;
        }
        if (rh.assignedWorkers === undefined) {
            rh.assignedWorkers = 0;
        }
        for (let ci = 0; ci < rh.constructionCarriers.length; ci++) {
            const c = rh.constructionCarriers[ci];
            if (!c.jobKey && c.unlockKey) {
                c.jobKey = engine.getBuildingJobKey(c.unlockKey);
            }
        }
        const siteKeys = Object.keys(rh.constructionSites || {});
        for (let si = 0; si < siteKeys.length; si++) {
            const site = rh.constructionSites[siteKeys[si]];
            if (site && site.paused === undefined) {
                site.paused = false;
            }
        }
        return rh;
    },
    getBuildingJobKey: function(unlockKey) {
        return "building:" + unlockKey;
    },
    getUpgradeGatherJobKey: function(scopeKey, upgradeKey) {
        return "upgrade:" + scopeKey + ":" + upgradeKey;
    },
    parseUpgradeGatherJobKey: function(jobKey) {
        if (!jobKey || jobKey.indexOf("upgrade:") !== 0) {
            return null;
        }
        const rest = jobKey.slice("upgrade:".length);
        const colon = rest.indexOf(":");
        if (colon < 0) {
            return null;
        }
        return { scopeKey: rest.slice(0, colon), upgradeKey: rest.slice(colon + 1) };
    },
    getFoxDenQueueMax: function() {
        const w = data.progress.base && data.progress.base.atelier;
        const level = w.organizeOrdersBought || 0;
        return 2 + level;
    },
    getFoxDenQueuedJobCount: function() {
        const rh = engine.ensureFoxDenConstruction();
        let count = 0;
        for (let qi = 0; qi < rh.constructionQueue.length; qi++) {
            const key = rh.constructionQueue[qi];
            const site = rh.constructionSites[key];
            if (site && site.status === "building" && !site.paused) {
                count++;
            }
        }
        const queue = rh.upgradeGatherQueue || [];
        for (let ui = 0; ui < queue.length; ui++) {
            const job = rh.upgradeGatherJobs[queue[ui]];
            if (job && !job.paused && (job.status === "gathering" || job.status === "ready")) {
                count++;
            }
        }
        return count;
    },
    canEnqueueFoxDenJob: function() {
        return engine.getFoxDenQueuedJobCount() < engine.getFoxDenQueueMax();
    },
    canResumeFoxDenJob: function() {
        return engine.canEnqueueFoxDenJob();
    },
    cancelCarriersForJob: function(jobKey) {
        const rh = engine.ensureFoxDenConstruction();
        const next = [];
        for (let i = 0; i < rh.constructionCarriers.length; i++) {
            const c = rh.constructionCarriers[i];
            const cKey = c.jobKey || (c.unlockKey ? engine.getBuildingJobKey(c.unlockKey) : "");
            if (cKey === jobKey) {
                engine.refundConstructionResource(c.resourceType, c.amount || 0);
            } else {
                next.push(c);
            }
        }
        rh.constructionCarriers = next;
    },
    pauseBuildingGather: function(unlockKey) {
        const rh = engine.ensureFoxDenConstruction();
        const site = rh.constructionSites[unlockKey];
        if (!site || site.status !== "building" || site.paused) {
            return false;
        }
        site.paused = true;
        engine.cancelCarriersForJob(engine.getBuildingJobKey(unlockKey));
        return true;
    },
    resumeBuildingGather: function(unlockKey) {
        const rh = engine.ensureFoxDenConstruction();
        const site = rh.constructionSites[unlockKey];
        if (!site || site.status !== "building" || !site.paused) {
            return false;
        }
        if (!engine.canResumeFoxDenJob()) {
            return false;
        }
        site.paused = false;
        return true;
    },
    toggleBuildingGatherPause: function(unlockKey) {
        const site = engine.getFoxDenConstructionSite(unlockKey);
        if (!site || site.status !== "building") {
            return false;
        }
        if (site.paused) {
            return engine.resumeBuildingGather(unlockKey);
        }
        return engine.pauseBuildingGather(unlockKey);
    },
    isUpgradeGatherSiteComplete: function(site) {
        if (!site || !site.required) {
            return true;
        }
        const keys = ["wood", "stone"];
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            if ((site.delivered[k] || 0) < (site.required[k] || 0)) {
                return false;
            }
        }
        return true;
    },
    checkUpgradeGatherJobComplete: function(jobKey) {
        const rh = engine.ensureFoxDenConstruction();
        const job = rh.upgradeGatherJobs[jobKey];
        if (!job || job.status !== "gathering") {
            return;
        }
        if (!engine.isUpgradeGatherSiteComplete(job)) {
            return;
        }
        job.status = "ready";
        engine.tryAutoWeaveOnGatherReady(jobKey);
    },
    tryAutoWeaveOnGatherReady: function(jobKey) {
        const parsed = engine.parseUpgradeGatherJobKey(jobKey);
        if (!parsed) {
            return;
        }
        const garden = data.progress.base && data.progress.base.garden;
        if (!garden || !garden.arrangementOfAppraisalUnlocked || !garden.autoWeaveOnGatherComplete) {
            return;
        }
        if (engine.isOkamiWeaving()) {
            return;
        }
        engine.startUpgradeWeave(parsed.scopeKey, parsed.upgradeKey);
    },
    updateArrangementOfReview: function(tickMs) {
        const rh = engine.ensureFoxDenConstruction();
        rh._reviewWeaveAccumMs = (rh._reviewWeaveAccumMs || 0) + tickMs;
        if (rh._reviewWeaveAccumMs < 5000) {
            return;
        }
        rh._reviewWeaveAccumMs = 0;
        const garden = data.progress.base && data.progress.base.garden;
        if (!garden || !garden.arrangementOfReviewUnlocked || !garden.autoWeaveCheapestReady) {
            return;
        }
        if (engine.isOkamiWeaving()) {
            return;
        }
        const queue = rh.upgradeGatherQueue || [];
        let best = null;
        let bestSec = Infinity;
        for (let ui = 0; ui < queue.length; ui++) {
            const jobKey = queue[ui];
            const job = rh.upgradeGatherJobs[jobKey];
            if (!job || job.status !== "ready") {
                continue;
            }
            const parsed = engine.parseUpgradeGatherJobKey(jobKey);
            if (!parsed) {
                continue;
            }
            const up = engine.getUpgradeDef(parsed.scopeKey, parsed.upgradeKey);
            if (!up) {
                continue;
            }
            const sec = resortData.getUpgradeWeavingSeconds(up, parsed.scopeKey);
            if (sec < bestSec) {
                bestSec = sec;
                best = parsed;
            }
        }
        if (best) {
            engine.startUpgradeWeave(best.scopeKey, best.upgradeKey);
        }
    },
    enqueueUpgradeGather: function(scopeKey, upgradeKey) {
        const up = engine.getUpgradeDef(scopeKey, upgradeKey);
        if (!up) {
            return false;
        }
        if (up.canBuy && !up.canBuy()) {
            return false;
        }
        const rh = engine.ensureFoxDenConstruction();
        const jobKey = engine.getUpgradeGatherJobKey(scopeKey, upgradeKey);
        if (rh.upgradeGatherJobs[jobKey]) {
            return false;
        }
        if (!engine.canEnqueueFoxDenJob()) {
            return false;
        }
        const cost = resortData.resolveCost(up, scopeKey);
        const split = resortData.splitGatherWeaveCost(cost);
        const weaveCost = Object.assign({}, split.weave);
        const hasWeaveCost = (weaveCost.coins || 0) > 0 || (weaveCost.starBeads || 0) > 0;
        if (hasWeaveCost) {
            if (!resortData.canAffordCost(weaveCost)) {
                return false;
            }
            resortData.deductCost(weaveCost);
        }
        const job = {
            scopeKey: scopeKey,
            upgradeKey: upgradeKey,
            required: Object.assign({}, split.gather),
            delivered: { wood: 0, stone: 0 },
            weaveCost: { coins: 0, starBeads: 0 },
            weaveCostPaid: hasWeaveCost,
            paused: false,
            status: "gathering"
        };
        if (engine.isUpgradeGatherSiteComplete(job)) {
            job.status = "ready";
        }
        rh.upgradeGatherJobs[jobKey] = job;
        rh.upgradeGatherQueue.push(jobKey);
        if (job.status === "ready") {
            engine.tryAutoWeaveOnGatherReady(jobKey);
        }
        return true;
    },
    pauseUpgradeGather: function(scopeKey, upgradeKey) {
        const rh = engine.ensureFoxDenConstruction();
        const jobKey = engine.getUpgradeGatherJobKey(scopeKey, upgradeKey);
        const job = rh.upgradeGatherJobs[jobKey];
        if (!job || job.status !== "gathering" || job.paused) {
            return false;
        }
        job.paused = true;
        engine.cancelCarriersForJob(jobKey);
        return true;
    },
    resumeUpgradeGather: function(scopeKey, upgradeKey) {
        const rh = engine.ensureFoxDenConstruction();
        const jobKey = engine.getUpgradeGatherJobKey(scopeKey, upgradeKey);
        const job = rh.upgradeGatherJobs[jobKey];
        if (!job || job.status !== "gathering" || !job.paused) {
            return false;
        }
        if (!engine.canResumeFoxDenJob()) {
            return false;
        }
        job.paused = false;
        return true;
    },
    toggleUpgradeGatherPause: function(scopeKey, upgradeKey) {
        const job = engine.getUpgradeGatherJob(scopeKey, upgradeKey);
        if (!job || job.status !== "gathering") {
            return false;
        }
        if (job.paused) {
            return engine.resumeUpgradeGather(scopeKey, upgradeKey);
        }
        return engine.pauseUpgradeGather(scopeKey, upgradeKey);
    },
    getUpgradeGatherJob: function(scopeKey, upgradeKey) {
        const rh = engine.ensureFoxDenConstruction();
        return rh.upgradeGatherJobs[engine.getUpgradeGatherJobKey(scopeKey, upgradeKey)] || null;
    },
    removeUpgradeGatherJob: function(scopeKey, upgradeKey) {
        const rh = engine.ensureFoxDenConstruction();
        const jobKey = engine.getUpgradeGatherJobKey(scopeKey, upgradeKey);
        delete rh.upgradeGatherJobs[jobKey];
        const qi = rh.upgradeGatherQueue.indexOf(jobKey);
        if (qi >= 0) {
            rh.upgradeGatherQueue.splice(qi, 1);
        }
    },
    startUpgradeWeave: function(scopeKey, upgradeKey) {
        const job = engine.getUpgradeGatherJob(scopeKey, upgradeKey);
        if (!job || job.status !== "ready") {
            return false;
        }
        const up = engine.getUpgradeDef(scopeKey, upgradeKey);
        if (!up) {
            return false;
        }
        const weaveCost = job.weaveCost || {};
        if (!job.weaveCostPaid) {
            if (!resortData.canAffordCost(weaveCost)) {
                return false;
            }
            if ((weaveCost.coins || 0) > 0 || (weaveCost.starBeads || 0) > 0) {
                resortData.deductCost(weaveCost);
            }
        }
        engine.removeUpgradeGatherJob(scopeKey, upgradeKey);
        engine.startWeaving(scopeKey, upgradeKey, up);
        return true;
    },
    getUpgradePurchaseUi: function(scopeKey, upgradeKey) {
        const up = engine.getUpgradeDef(scopeKey, upgradeKey);
        if (!up) {
            return null;
        }
        if (typeof up.upgradeSoldOut === "function" && up.upgradeSoldOut()) {
            return { label: up.soldOutButtonLabel || "Bought", disabled: true, mode: "soldOut" };
        }
        const weaveUi = engine.getUpgradeWeaveUi(scopeKey, upgradeKey);
        if (weaveUi) {
            return {
                label: weaveUi.label,
                disabled: weaveUi.disabled,
                mode: weaveUi.mode === "paused" ? "weavePaused" : "weaving",
                pct: weaveUi.pct
            };
        }
        const job = engine.getUpgradeGatherJob(scopeKey, upgradeKey);
        if (job) {
            if (job.status === "ready") {
                return { label: "Ready for Weave", disabled: false, mode: "ready" };
            }
            const label = resortData.collectedProgressLabel(job.delivered, job.required);
            return {
                label: job.paused ? `Paused · ${label}` : label,
                disabled: false,
                mode: job.paused ? "paused" : "gathering"
            };
        }
        if (up.canBuy && !up.canBuy()) {
            const costGetter = typeof up.getCost === "function"
                ? up.getCost
                : function() { return resortData.resolveCost(up, scopeKey); };
            return {
                label: resortData.gatherLabelFromCost(costGetter),
                disabled: true,
                mode: "idle"
            };
        }
        const costGetter = typeof up.getCost === "function"
            ? up.getCost
            : function() { return resortData.resolveCost(up, scopeKey); };
        const cost = typeof up.getCost === "function" ? up.getCost() : resortData.resolveCost(up, scopeKey);
        const split = resortData.splitGatherWeaveCost(cost);
        const affordWeave = resortData.canAffordCost(split.weave);
        return {
            label: resortData.gatherLabelFromCost(costGetter),
            disabled: !affordWeave,
            mode: "idle"
        };
    },
    getBuildingGatherButtonLabel: function(unlockKey) {
        const site = engine.getFoxDenConstructionSite(unlockKey);
        if (!site || site.status !== "building") {
            const slot = resortData.foxDenUnlockGetDef(unlockKey);
            return resortData.planToBuildFromCost(slot.getCost);
        }
        const label = resortData.collectedProgressLabel(site.delivered, site.required);
        return site.paused ? `Paused · ${label}` : label;
    },
    clearBambooCutIfNoWorkers: function() {
        const bf = engine.ensureBambooForestState();
        if (!bf) {
            return;
        }
        if (bf.activeHarvestStalk === null || bf.activeHarvestStalk === undefined) {
            return;
        }
        const assigned = bf.assignedWorkers || 0;
        const okami = engine.getOkami();
        const okamiHere = okami.assignedBuildingKey === "bambooForest";
        if (assigned <= 0 && !okamiHere) {
            bf.activeHarvestStalk = null;
        }
    },
    getFoxDenConstructionSite: function(unlockKey) {
        const rh = engine.ensureFoxDenConstruction();
        return rh.constructionSites[unlockKey] || null;
    },
    isFoxDenConstructionActive: function(unlockKey) {
        const site = engine.getFoxDenConstructionSite(unlockKey);
        return !!(site && site.status === "building");
    },
    planFoxDenConstruction: function(unlockKey) {
        const rh = engine.ensureFoxDenConstruction();
        if (!engine.isFoxDenUnlockRowVisible(unlockKey)) {
            return false;
        }
        if (rh.unlocks[unlockKey]) {
            return false;
        }
        const existing = rh.constructionSites[unlockKey];
        if (existing && existing.status === "building") {
            return false;
        }
        if (!engine.canEnqueueFoxDenJob()) {
            return false;
        }
        const cost = resortData.getFoxDenConstructionCost(unlockKey);
        rh.constructionSites[unlockKey] = {
            status: "building",
            paused: false,
            required: { wood: cost.wood || 0, stone: cost.stone || 0 },
            delivered: { wood: 0, stone: 0 }
        };
        if (rh.constructionQueue.indexOf(unlockKey) < 0) {
            rh.constructionQueue.push(unlockKey);
        }
        return true;
    },
    completeFoxDenConstruction: function(unlockKey) {
        const rh = engine.ensureFoxDenConstruction();
        rh.unlocks[unlockKey] = true;
        const site = rh.constructionSites[unlockKey];
        if (site) {
            site.status = "complete";
        }
        const qi = rh.constructionQueue.indexOf(unlockKey);
        if (qi >= 0) {
            rh.constructionQueue.splice(qi, 1);
        }
        if (unlockKey === "torii") {
            const torii = data.progress.base.torii;
            if (torii) {
                torii.nextVisitorTimerMs = torii.visitorIntervalMs || 60000;
            }
        }
        if (unlockKey === "inn") {
            engine.admitWaitingToriiVisitors();
        }
        events.markNewBaseContent(unlockKey);
        const order = resortData.foxDenUnlockOrder || [];
        const builtIdx = order.indexOf(unlockKey);
        if (builtIdx >= 0) {
            for (let ni = builtIdx + 1; ni < order.length; ni++) {
                if (!rh.unlocks[order[ni]]) {
                    events.markNewBaseContent(order[ni]);
                    events.markNewBaseContent("foxDen");
                    break;
                }
            }
        }
    },
    getImprovePathsSpeedMult: function() {
        const w = data.progress.base && data.progress.base.atelier;
        const level = w.improvePathsBought || 0;
        return 1 + level * 0.1;
    },
    getOkamiPathTravelSpeed: function(holdingMaterials, pathProgress) {
        const X = engine.getOkamiTravelSpeed();
        const base = holdingMaterials ? X * 0.5 : X;
        let speed = base * engine.getImprovePathsSpeedMult();
        if (pathProgress !== undefined && pathProgress !== null) {
            speed *= engine.getOkamiPathSegmentSpeedMult(pathProgress);
        }
        return speed;
    },
    getConstructionResourceInFlight: function(jobKey, resourceType) {
        const rh = engine.ensureFoxDenConstruction();
        let sum = 0;
        for (let i = 0; i < rh.constructionCarriers.length; i++) {
            const c = rh.constructionCarriers[i];
            const cKey = c.jobKey || (c.unlockKey ? engine.getBuildingJobKey(c.unlockKey) : "");
            if (cKey === jobKey && c.resourceType === resourceType) {
                sum += c.amount || 0;
            }
        }
        return sum;
    },
    getFreeCarrierDisplaySlot: function(rh) {
        const used = {};
        const carriers = rh.constructionCarriers || [];
        for (let i = 0; i < carriers.length; i++) {
            if (carriers[i].displaySlot !== undefined && carriers[i].displaySlot !== null) {
                used[carriers[i].displaySlot] = true;
            }
        }
        for (let s = 0; s < 8; s++) {
            if (!used[s]) {
                return s;
            }
        }
        return 0;
    },
    syncFoxDenCarriersToWorkforce: function() {
        const rh = engine.ensureFoxDenConstruction();
        const assigned = rh.assignedWorkers || 0;
        const okami = engine.getOkami();
        const okamiHere = okami.assignedBuildingKey === "foxDen";
        if (assigned <= 0 && !okamiHere) {
            engine.cancelFoxDenCarriers();
            return;
        }
        const workerCarriers = [];
        for (let i = 0; i < rh.constructionCarriers.length; i++) {
            const c = rh.constructionCarriers[i];
            if (!c.isOkami) {
                workerCarriers.push(c);
            }
        }
        const removeIds = {};
        if (workerCarriers.length > assigned) {
            const sorted = workerCarriers.slice().sort(function(a, b) {
                return (a.progress || 0) - (b.progress || 0);
            });
            const excess = workerCarriers.length - assigned;
            for (let ri = 0; ri < excess; ri++) {
                removeIds[sorted[ri].id] = true;
            }
        }
        const next = [];
        for (let ci = 0; ci < rh.constructionCarriers.length; ci++) {
            const c = rh.constructionCarriers[ci];
            if (c.isOkami) {
                if (okamiHere) {
                    next.push(c);
                } else {
                    engine.refundConstructionResource(c.resourceType, c.amount || 0);
                }
            } else if (removeIds[c.id]) {
                engine.refundConstructionResource(c.resourceType, c.amount || 0);
            } else {
                next.push(c);
            }
        }
        rh.constructionCarriers = next;
    },
    getConstructionResourceAvailable: function(resourceType) {
        const base = data.progress.base;
        if (resourceType === "wood") {
            return (base.bambooForest && base.bambooForest.wood) || 0;
        }
        if (resourceType === "stone") {
            return (base.stonePile && base.stonePile.stone) || 0;
        }
        return 0;
    },
    deductConstructionResource: function(resourceType, amount) {
        const base = data.progress.base;
        const amt = Math.max(0, amount || 0);
        if (resourceType === "wood" && base.bambooForest) {
            base.bambooForest.wood = Math.max(0, (base.bambooForest.wood || 0) - amt);
        } else if (resourceType === "stone" && base.stonePile) {
            base.stonePile.stone = Math.max(0, (base.stonePile.stone || 0) - amt);
        }
    },
    refundConstructionResource: function(resourceType, amount) {
        const base = data.progress.base;
        const amt = Math.max(0, amount || 0);
        if (resourceType === "wood" && base.bambooForest) {
            base.bambooForest.wood = (base.bambooForest.wood || 0) + amt;
        } else if (resourceType === "stone" && base.stonePile) {
            base.stonePile.stone = (base.stonePile.stone || 0) + amt;
        }
    },
    getConstructionSiteRemaining: function(site, resourceType) {
        if (!site || !site.required) {
            return 0;
        }
        const req = site.required[resourceType] || 0;
        const del = (site.delivered && site.delivered[resourceType]) || 0;
        return Math.max(0, req - del);
    },
    getConstructionStillNeeded: function(site, jobKey, resourceType) {
        if (!site || !site.required) {
            return 0;
        }
        const required = site.required[resourceType] || 0;
        const delivered = (site.delivered && site.delivered[resourceType]) || 0;
        const inFlight = jobKey ? engine.getConstructionResourceInFlight(jobKey, resourceType) : 0;
        return Math.max(0, required - delivered - inFlight);
    },
    getFoxDenCarrierCounts: function(rh) {
        let workerCarriers = 0;
        let okamiCarriers = 0;
        const carriers = rh.constructionCarriers || [];
        for (let i = 0; i < carriers.length; i++) {
            if (carriers[i].isOkami) {
                okamiCarriers++;
            } else {
                workerCarriers++;
            }
        }
        return { workerCarriers: workerCarriers, okamiCarriers: okamiCarriers };
    },
    getFoxDenFreeWorkforce: function(rh) {
        const assigned = rh.assignedWorkers || 0;
        const counts = engine.getFoxDenCarrierCounts(rh);
        const okami = engine.getOkami();
        const okamiHere = okami.assignedBuildingKey === "foxDen";
        return {
            freeWorkers: Math.max(0, assigned - counts.workerCarriers),
            okamiFree: okamiHere && counts.okamiCarriers === 0,
            okamiHere: okamiHere
        };
    },
    getFoxDenResourcePriority: function(site, jobKey) {
        if (!site || !site.required) {
            return null;
        }
        const carryCap = resortData.getKitsuneCarryCapacity();
        const types = ["wood", "stone"];
        let best = null;
        for (let i = 0; i < types.length; i++) {
            const t = types[i];
            const required = site.required[t] || 0;
            if (required <= 0) {
                continue;
            }
            const delivered = (site.delivered && site.delivered[t]) || 0;
            const inFlight = engine.getConstructionResourceInFlight(jobKey, t);
            const stillNeeded = engine.getConstructionStillNeeded(site, jobKey, t);
            if (stillNeeded <= 0) {
                continue;
            }
            const stock = engine.getConstructionResourceAvailable(t);
            if (stock <= 0) {
                continue;
            }
            const amount = Math.min(carryCap, stillNeeded, stock);
            if (amount <= 0 || delivered + inFlight + amount > required) {
                continue;
            }
            const pctRemaining = stillNeeded / required;
            if (!best
                || pctRemaining > best.pctRemaining
                || (pctRemaining === best.pctRemaining && stillNeeded > best.stillNeeded)) {
                best = {
                    resourceType: t,
                    stillNeeded: stillNeeded,
                    pctRemaining: pctRemaining,
                    amount: amount
                };
            }
        }
        return best;
    },
    pickFoxDenCarrierUnit: function(rh) {
        const wf = engine.getFoxDenFreeWorkforce(rh);
        if (wf.freeWorkers <= 0 && !wf.okamiFree) {
            return null;
        }
        if (wf.freeWorkers > 0 && !wf.okamiFree) {
            return { spawnOkami: false };
        }
        if (wf.okamiFree && wf.freeWorkers <= 0) {
            return { spawnOkami: true };
        }
        const okamiSpeed = engine.getFoxDenCarrierSpeed({ isOkami: true });
        const workerSpeed = engine.getFoxDenCarrierSpeed({ isOkami: false });
        return { spawnOkami: okamiSpeed >= workerSpeed };
    },
    getFoxDenSpawnTarget: function(rh) {
        for (let qi = 0; qi < rh.constructionQueue.length; qi++) {
            const key = rh.constructionQueue[qi];
            const site = rh.constructionSites[key];
            if (!site || site.status !== "building" || site.paused) {
                continue;
            }
            const jobKey = engine.getBuildingJobKey(key);
            const priority = engine.getFoxDenResourcePriority(site, jobKey);
            if (priority) {
                return {
                    jobKey: jobKey,
                    mapKey: key,
                    site: site,
                    resourceType: priority.resourceType,
                    stillNeeded: priority.stillNeeded,
                    amount: priority.amount
                };
            }
        }
        const uQueue = rh.upgradeGatherQueue || [];
        for (let ui = 0; ui < uQueue.length; ui++) {
            const jobKey = uQueue[ui];
            const job = rh.upgradeGatherJobs[jobKey];
            if (!job || job.status !== "gathering" || job.paused) {
                continue;
            }
            const priority = engine.getFoxDenResourcePriority(job, jobKey);
            if (priority) {
                return {
                    jobKey: jobKey,
                    mapKey: job.scopeKey,
                    site: job,
                    resourceType: priority.resourceType,
                    stillNeeded: priority.stillNeeded,
                    amount: priority.amount
                };
            }
        }
        return null;
    },
    getResortMapDimensions: function() {
        const map = document.getElementById("baseResortMap");
        let w = 690;
        let h = 690;
        if (map) {
            const rect = map.getBoundingClientRect();
            if (rect.width > 0) {
                w = rect.width;
            }
            if (rect.height > 0) {
                h = rect.height;
            }
        }
        return { w: w, h: h };
    },
    measureFoxDenMapSlotFromDom: function(unlockKey) {
        const mapBtnId = "baseBuilding_" + unlockKey;
        const el = viewData.cached[mapBtnId];
        const map = document.getElementById("baseResortMap");
        if (!el || !map) {
            return null;
        }
        const prevDisplay = el.style.display;
        const prevVisibility = el.style.visibility;
        const prevPointer = el.style.pointerEvents;
        const needsLayout = prevDisplay === "none";
        if (needsLayout) {
            el.style.display = "";
            el.style.visibility = "hidden";
            el.style.pointerEvents = "none";
        }
        const mr = map.getBoundingClientRect();
        const er = el.getBoundingClientRect();
        if (needsLayout) {
            el.style.display = prevDisplay;
            el.style.visibility = prevVisibility;
            el.style.pointerEvents = prevPointer;
        }
        if (mr.width <= 0 || mr.height <= 0 || er.width <= 0 || er.height <= 0) {
            return null;
        }
        return {
            x: er.left - mr.left + er.width * 0.5,
            y: er.top - mr.top + er.height * 0.8 - 25
        };
    },
    getFoxDenMapSlotPosition: function(unlockKey) {
        const measured = engine.measureFoxDenMapSlotFromDom(unlockKey);
        if (measured) {
            return measured;
        }
        const slot = resortData.foxDenMapSlots && resortData.foxDenMapSlots[unlockKey];
        const dims = engine.getResortMapDimensions();
        return resortData.resolveMapSlotCenter(slot, dims.w, dims.h);
    },
    isFoxDenUnlockRowVisible: function(unlockKey) {
        const rh = data.progress.base && data.progress.base.foxDen;
        const unlocks = rh && rh.unlocks ? rh.unlocks : {};
        if (unlockKey === "atelier" || unlockKey === "bonfire") {
            return !!unlocks.inn;
        }
        if (unlockKey === "scrollArchives") {
            return !!unlocks.bonfire;
        }
        if (unlockKey === "cistern") {
            const hs = data.progress.base && data.progress.base.hiddenSpring;
            return (hs && (hs.earthSpiritsBought || 0) > 0);
        }
        return true;
    },
    getConstructionSourcePosition: function(resourceType) {
        if (resourceType === "wood") {
            const el = viewData.cached.baseBuilding_bambooForest;
            if (el) {
                const map = document.getElementById("baseResortMap");
                if (map) {
                    const mr = map.getBoundingClientRect();
                    const er = el.getBoundingClientRect();
                    return { x: er.left - mr.left + er.width * 0.5, y: er.top - mr.top + er.height * 0.8 - 25 };
                }
            }
            const end = engine.getResortPathEnd();
            return { x: end.x, y: end.y + 100 };
        }
        if (resourceType === "stone") {
            const el = viewData.cached.baseBuilding_stonePile;
            if (el) {
                const map = document.getElementById("baseResortMap");
                if (map) {
                    const mr = map.getBoundingClientRect();
                    const er = el.getBoundingClientRect();
                    return { x: er.left - mr.left + er.width * 0.5, y: er.top - mr.top + er.height * 0.8 - 25 };
                }
            }
            const end = engine.getResortPathEnd();
            return { x: end.x, y: end.y + 25 };
        }
        const el = viewData.cached.baseBuilding_foxDen;
        if (el) {
            const map = document.getElementById("baseResortMap");
            if (map) {
                const mr = map.getBoundingClientRect();
                const er = el.getBoundingClientRect();
                return { x: er.left - mr.left + er.width * 0.5, y: er.top - mr.top + er.height * 0.5 };
            }
        }
        return { x: 334, y: 40 };
    },
    getFoxDenCarrierSpeed: function(carrier) {
        if (carrier.isOkami) {
            return engine.getOkamiPathTravelSpeed(true);
        }
        const X = engine.getOkamiTravelSpeed();
        const okami = engine.getOkami();
        const okamiHere = okami.assignedBuildingKey === "foxDen";
        let speed = X * 0.25;
        if (okamiHere) {
            speed *= engine.getOkamiInspirationBonus();
        }
        return speed * engine.getImprovePathsSpeedMult();
    },
    cancelFoxDenCarriers: function() {
        const rh = engine.ensureFoxDenConstruction();
        for (let i = 0; i < rh.constructionCarriers.length; i++) {
            const c = rh.constructionCarriers[i];
            engine.refundConstructionResource(c.resourceType, c.amount || 0);
        }
        rh.constructionCarriers = [];
    },
    trySpawnFoxDenCarrier: function() {
        const rh = engine.ensureFoxDenConstruction();
        const wf = engine.getFoxDenFreeWorkforce(rh);
        if (wf.freeWorkers <= 0 && !wf.okamiFree) {
            return false;
        }
        const target = engine.getFoxDenSpawnTarget(rh);
        if (!target) {
            return false;
        }
        const unit = engine.pickFoxDenCarrierUnit(rh);
        if (!unit) {
            return false;
        }
        const resourceType = target.resourceType;
        const amount = target.amount;
        const site = target.site;
        const delivered = (site.delivered && site.delivered[resourceType]) || 0;
        const required = (site.required && site.required[resourceType]) || 0;
        const inFlight = engine.getConstructionResourceInFlight(target.jobKey, resourceType);
        if (amount <= 0 || delivered + inFlight + amount > required) {
            return false;
        }
        const from = engine.getConstructionSourcePosition(resourceType);
        const to = engine.getFoxDenMapSlotPosition(target.mapKey);
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        engine.deductConstructionResource(resourceType, amount);
        rh.constructionCarriers.push({
            id: rh.carrierIdCounter || 1,
            jobKey: target.jobKey,
            unlockKey: target.mapKey,
            resourceType: resourceType,
            amount: amount,
            isOkami: unit.spawnOkami,
            progress: 0,
            displaySlot: engine.getFreeCarrierDisplaySlot(rh),
            fromX: from.x,
            fromY: from.y,
            toX: to.x,
            toY: to.y,
            totalDist: dist
        });
        rh.carrierIdCounter = (rh.carrierIdCounter || 1) + 1;
        return true;
    },
    updateFoxDenConstruction: function(tickMs) {
        const rh = engine.ensureFoxDenConstruction();
        const assigned = rh.assignedWorkers || 0;
        const okami = engine.getOkami();
        if (assigned <= 0 && okami.assignedBuildingKey !== "foxDen") {
            engine.syncFoxDenCarriersToWorkforce();
            return;
        }
        const next = [];
        for (let i = 0; i < rh.constructionCarriers.length; i++) {
            const c = rh.constructionCarriers[i];
            const speed = engine.getFoxDenCarrierSpeed(c);
            c.progress = (c.progress || 0) + (speed * (tickMs / 1000)) / (c.totalDist || 1);
            if (c.progress >= 1) {
                const jobKey = c.jobKey || (c.unlockKey ? engine.getBuildingJobKey(c.unlockKey) : "");
                if (jobKey.indexOf("building:") === 0) {
                    const unlockKey = jobKey.slice("building:".length);
                    const site = rh.constructionSites[unlockKey];
                    if (site && site.delivered) {
                        site.delivered[c.resourceType] = (site.delivered[c.resourceType] || 0) + (c.amount || 0);
                    }
                    let complete = true;
                    if (site && site.required) {
                        const keys = ["wood", "stone"];
                        for (let ki = 0; ki < keys.length; ki++) {
                            const k = keys[ki];
                            if ((site.delivered[k] || 0) < (site.required[k] || 0)) {
                                complete = false;
                                break;
                            }
                        }
                    }
                    if (complete) {
                        engine.completeFoxDenConstruction(unlockKey);
                    }
                } else if (jobKey.indexOf("upgrade:") === 0) {
                    const job = rh.upgradeGatherJobs[jobKey];
                    if (job && job.delivered) {
                        job.delivered[c.resourceType] = (job.delivered[c.resourceType] || 0) + (c.amount || 0);
                    }
                    engine.checkUpgradeGatherJobComplete(jobKey);
                }
            } else {
                next.push(c);
            }
        }
        rh.constructionCarriers = next;
        engine.updateArrangementOfReview(tickMs);
        rh._sinceLastCarrierMs = (rh._sinceLastCarrierMs || 0) + tickMs;
        const minGap = (resortData.foxDenCarrierSpawnMinMs !== undefined) ? resortData.foxDenCarrierSpawnMinMs : 500;
        if (rh._sinceLastCarrierMs >= minGap) {
            if (engine.trySpawnFoxDenCarrier()) {
                rh._sinceLastCarrierMs = 0;
            }
        }
    },
    ensureBambooForestState: function() {
        const base = data.progress.base;
        if (!base) {
            return null;
        }
        if (!base.bambooForest) {
            base.bambooForest = Object.assign({}, resortData.buildings.bambooForest.progressDefaults);
        }
        const bf = base.bambooForest;
        if (bf.chips === undefined) {
            bf.chips = 0;
        }
        const cfg = resortData.bambooForestConfig;
        const stalkCount = bf.stalkCount || cfg.stalkCount || 4;
        const rowCount = bf.rowCount || cfg.rowCount || 3;
        bf.stalkCount = stalkCount;
        bf.rowCount = rowCount;
        if (!bf.stalks || bf.stalks.length !== stalkCount) {
            bf.stalks = [];
            for (let si = 0; si < stalkCount; si++) {
                bf.stalks.push(engine.createBambooStalk(rowCount));
            }
        }
        for (let sj = 0; sj < bf.stalks.length; sj++) {
            const stalk = bf.stalks[sj];
            if (!stalk.cells || stalk.cells.length !== rowCount) {
                bf.stalks[sj] = engine.createBambooStalk(rowCount, stalk.baseWood);
            } else {
                engine.refreshBambooStalkCapacities(stalk);
            }
        }
        return bf;
    },
    createBambooStalk: function(rowCount, baseWood) {
        const cfg = resortData.bambooForestConfig;
        const stalk = {
            baseWood: baseWood !== undefined ? baseWood : cfg.defaultBaseWood,
            cells: []
        };
        for (let ri = 0; ri < rowCount; ri++) {
            const capacity = engine.getBambooCellCapacity(stalk, ri);
            stalk.cells.push({
                lumber: capacity,
                capacity: capacity,
                color: engine.randomBambooCellColor(),
                growthRemainMs: 0
            });
        }
        return stalk;
    },
    getBambooCellCapacity: function(stalk, rowIndex) {
        const cfg = resortData.bambooForestConfig;
        const baseWood = stalk.baseWood || cfg.defaultBaseWood;
        const factor = cfg.capacityStepFactor || 0.8;
        if (rowIndex <= 0) {
            return baseWood;
        }
        const belowCap = engine.getBambooCellCapacity(stalk, rowIndex - 1);
        return Math.min(baseWood, Math.min(belowCap - 1, Math.floor(belowCap * factor)));
    },
    getBambooLowestGrowingCellIndex: function(stalk) {
        if (!stalk || !stalk.cells) {
            return -1;
        }
        for (let ri = 0; ri < stalk.cells.length; ri++) {
            const cell = stalk.cells[ri];
            if ((cell.lumber || 0) < (cell.capacity || 1)) {
                return ri;
            }
        }
        return -1;
    },
    refreshBambooStalkCapacities: function(stalk) {
        if (!stalk || !stalk.cells) {
            return;
        }
        for (let ri = 0; ri < stalk.cells.length; ri++) {
            const cell = stalk.cells[ri];
            const newCap = engine.getBambooCellCapacity(stalk, ri);
            const lumber = cell.lumber || 0;
            if (lumber > newCap) {
                cell.capacity = lumber;
            } else {
                cell.capacity = newCap;
            }
        }
    },
    getBambooStalkSpirit: function(stalkIndex) {
        return engine.getSpiritAtLocation("bambooForest", stalkIndex, "plant");
    },
    getBambooStalkDisplayBaseWood: function(stalkIndex) {
        const bf = engine.ensureBambooForestState();
        if (!bf || !bf.stalks || stalkIndex < 0 || stalkIndex >= bf.stalks.length) {
            const cfg = resortData.bambooForestConfig;
            return cfg.defaultBaseWood;
        }
        const cfg = resortData.bambooForestConfig;
        const spirit = engine.getBambooStalkSpirit(stalkIndex);
        if (spirit) {
            return (cfg.defaultBaseWood) + Math.ceil(spirit.spiritPower || 1);
        }
        const stalk = bf.stalks[stalkIndex];
        return stalk.baseWood || cfg.defaultBaseWood;
    },
    getBambooCutTopCellIndex: function(stalk) {
        if (!stalk || !stalk.cells) {
            return -1;
        }
        for (let ri = stalk.cells.length - 1; ri >= 0; ri--) {
            if ((stalk.cells[ri].lumber || 0) > 0) {
                return ri;
            }
        }
        return -1;
    },
    getBambooChopPower: function() {
        const bf = engine.ensureBambooForestState();
        if (!bf) {
            return 0;
        }
        const kitsune = bf.assignedWorkers || 0;
        const kitsunePower = kitsune;
        const okami = engine.getOkami();
        const okamiHere = okami.assignedBuildingKey === "bambooForest";
        return kitsunePower + (okamiHere ? engine.getOkamiSpiritStrands() : 0);
    },
    getBambooCutWorkerRate: function() {
        const bf = engine.ensureBambooForestState();
        if (!bf) {
            return 0;
        }
        if (bf.activeHarvestStalk === null || bf.activeHarvestStalk === undefined) {
            return 0;
        }
        const kitsune = bf.assignedWorkers || 0;
        const okami = engine.getOkami();
        const okamiHere = okami.assignedBuildingKey === "bambooForest";
        if (kitsune <= 0 && !okamiHere) {
            return 0;
        }
        const cfg = resortData.bambooForestConfig;
        let rate = cfg.harvestBaseRate || 1;
        if (okamiHere) {
            rate *= engine.getOkamiInspirationBonus();
        }
        return rate;
    },
    getBambooStalkGrowthPercent: function(stalk) {
        if (!stalk || !stalk.cells) {
            return 100;
        }
        const ri = engine.getBambooLowestGrowingCellIndex(stalk);
        if (ri < 0) {
            return 100;
        }
        const cell = stalk.cells[ri];
        const cap = cell.capacity || 1;
        const lumber = cell.lumber || 0;
        return Math.floor((lumber / cap) * 100);
    },
    toggleBambooCut: function(stalkIndex) {
        const bf = engine.ensureBambooForestState();
        if (!bf) {
            return;
        }
        const max = bf.stalkCount || 4;
        if (stalkIndex < 0 || stalkIndex >= max) {
            return;
        }
        if (bf.activeHarvestStalk === stalkIndex) {
            bf.activeHarvestStalk = null;
        } else {
            bf.activeHarvestStalk = stalkIndex;
        }
    },
    applyBambooSpiritRemoved: function(stalkIndex) {
        const bf = engine.ensureBambooForestState();
        if (!bf || !bf.stalks || stalkIndex < 0 || stalkIndex >= bf.stalks.length) {
            return;
        }
        const cfg = resortData.bambooForestConfig;
        const stalk = bf.stalks[stalkIndex];
        stalk.baseWood = cfg.defaultBaseWood;
        engine.refreshBambooStalkCapacities(stalk);
        for (let ri = 0; ri < stalk.cells.length; ri++) {
            stalk.cells[ri].growthRemainMs = 0;
        }
    },
    completeBambooStalkHarvest: function(bf, stalkIndex) {
        const cfg = resortData.bambooForestConfig;
        const stalk = bf.stalks[stalkIndex];
        const spirit = engine.getBambooStalkSpirit(stalkIndex);
        let newBase = cfg.defaultBaseWood || 1;
        if (spirit) {
            newBase += Math.ceil(spirit.spiritPower || 1);
        }
        stalk.baseWood = newBase;
        engine.refreshBambooStalkCapacities(stalk);
        for (let ri = 0; ri < stalk.cells.length; ri++) {
            const cell = stalk.cells[ri];
            cell.lumber = 0;
            cell.growthRemainMs = 0;
            cell.color = engine.randomBambooCellColor();
        }
        const garden = data.progress.base && data.progress.base.garden;
        const rotateOn = garden && garden.arrangementOfRotationUnlocked && bf.autoRotateHarvest;
        if (rotateOn) {
            const max = bf.stalkCount || 4;
            bf.activeHarvestStalk = (stalkIndex + 1) % max;
        } else {
            bf.activeHarvestStalk = null;
        }
    },
    convertBambooChipsToWood: function(bf) {
        if (!bf) {
            return;
        }
        while ((bf.chips || 0) >= 10) {
            bf.chips -= 10;
            bf.wood = (bf.wood || 0) + 1;
        }
    },
    bambooChopActiveStalk: function(bf) {
        const stalkIndex = bf.activeHarvestStalk;
        if (stalkIndex === null || stalkIndex === undefined || !bf.stalks) {
            return;
        }
        const stalk = bf.stalks[stalkIndex];
        const cellIndex = engine.getBambooCutTopCellIndex(stalk);
        if (cellIndex < 0) {
            return;
        }
        const cell = stalk.cells[cellIndex];
        const chopPower = engine.getBambooChopPower();
        const chopped = Math.min(chopPower, cell.lumber || 0);
        if (chopped <= 0) {
            return;
        }
        cell.lumber -= chopped;
        bf.chips = (bf.chips || 0) + chopped;
        engine.convertBambooChipsToWood(bf);
        if (cell.lumber <= 0) {
            cell.lumber = 0;
            cell.color = engine.randomBambooCellColor();
            cell.growthRemainMs = 0;
            let allEmpty = true;
            for (let ri = 0; ri < stalk.cells.length; ri++) {
                if ((stalk.cells[ri].lumber || 0) > 0) {
                    allEmpty = false;
                    break;
                }
            }
            if (allEmpty) {
                engine.completeBambooStalkHarvest(bf, stalkIndex);
            }
        }
    },
    updateBambooStalkGrowth: function(bf, stalkIndex, tickMs) {
        if (bf.activeHarvestStalk === stalkIndex) {
            return;
        }
        const stalk = bf.stalks[stalkIndex];
        if (!stalk || !stalk.cells) {
            return;
        }
        const growIndex = engine.getBambooLowestGrowingCellIndex(stalk);
        if (growIndex < 0) {
            return;
        }
        const cfg = resortData.bambooForestConfig;
        const fullMs = cfg.cellGrowFullMs || 120000;
        const spirit = engine.getBambooStalkSpirit(stalkIndex);
        const cell = stalk.cells[growIndex];
        const cap = cell.capacity || 1;
        let lumber = cell.lumber || 0;
        if (lumber >= cap) {
            return;
        }
        const msPerWood = fullMs / cap;
        cell.growthRemainMs = (cell.growthRemainMs || 0) + tickMs;
        while (cell.growthRemainMs >= msPerWood && lumber < cap) {
            cell.growthRemainMs -= msPerWood;
            lumber++;
            cell.lumber = lumber;
            if (spirit) {
                engine.grantSpiritExp(spirit, 1);
            }
        }
    },
    updateBambooForest: function(tickMs) {
        const bf = engine.ensureBambooForestState();
        if (!bf) {
            return;
        }
        const rate = engine.getBambooCutWorkerRate();
        if (rate > 0) {
            bf.workerPower = (bf.workerPower || 0) + rate * (tickMs / 1000);
        }
        const required = resortData.bambooForestConfig.cutPowerRequired;
        while (bf.workerPower >= required && rate > 0) {
            bf.workerPower -= required;
            engine.bambooChopActiveStalk(bf);
        }
        const stalkCount = bf.stalkCount || 4;
        for (let si = 0; si < stalkCount; si++) {
            engine.updateBambooStalkGrowth(bf, si, tickMs);
        }
    },
    updateOkamiPathJob: function(tickMs) {
        const okami = engine.getOkami();
        const job = okami.pathJob;
        if (!job || job.paused) {
            return;
        }
        const totalDist = engine.getResortPathTotalDistance();
        const jobType = job.jobType || "removeRocks";
        if (job.phase === "travelingTo") {
            const holding = engine.pathJobUsesHalfSpeedTo(jobType);
            const speed = engine.getOkamiPathTravelSpeed(holding, job.pathProgress);
            job.pathProgress -= speed * (tickMs / 1000);
            if (job.pathProgress <= job.targetProgress) {
                job.pathProgress = job.targetProgress;
                engine.beginPathSegmentWeaving(job);
            }
            return;
        }
        if (job.phase === "weaving") {
            job.weaveRemainMs = Math.max(0, job.weaveRemainMs - tickMs);
            if (job.weaveRemainMs <= 0) {
                job.phase = engine.pathJobReturnsAfterWeave(jobType) ? "returning" : "storingRocks";
            }
            return;
        }
        if (job.phase === "storingRocks") {
            job.pathProgress += engine.getOkamiPathTravelSpeed(true, job.pathProgress) * (tickMs / 1000);
            if (job.pathProgress >= totalDist) {
                job.pathProgress = totalDist;
                engine.completePathRemoveRocks(job.segmentIndex);
            }
            return;
        }
        if (job.phase === "returning") {
            job.pathProgress += engine.getOkamiPathTravelSpeed(false, job.pathProgress) * (tickMs / 1000);
            if (job.pathProgress >= totalDist) {
                job.pathProgress = totalDist;
                engine.completePathReturnJob(job.segmentIndex, jobType);
            }
        }
    },
    getPathSegmentWeaveUi: function(segmentIndex) {
        const okami = engine.getOkami();
        const job = okami.pathJob;
        if (!job || job.segmentIndex !== segmentIndex) {
            const stored = okami.pausedPathJobs && okami.pausedPathJobs[segmentIndex];
            if (stored) {
                let pct = 0;
                if (stored.phase === "weaving" && stored.weaveTotalMs > 0) {
                    pct = Math.max(0, Math.min(100, (1 - (stored.weaveRemainMs / stored.weaveTotalMs)) * 100));
                }
                return { mode: "paused", label: "Resume", pct: pct, disabled: false };
            }
            return null;
        }
        const jobType = job.jobType || "removeRocks";
        if (job.paused) {
            if (job.pausedPhase === "travelingTo" || job.pausedPhase === "storingRocks" || job.pausedPhase === "returning") {
                return { mode: "paused", label: "Resume", pct: 0, disabled: false };
            }
            if (job.pausedPhase === "weaving") {
                const pct = job.weaveTotalMs > 0 ? Math.max(0, Math.min(100, (1 - ((job.pausedWeaveRemainMs || job.weaveRemainMs) / job.weaveTotalMs)) * 100)) : 0;
                return { mode: "paused", label: "Resume", pct: pct, disabled: false };
            }
            return { mode: "paused", label: "Resume", pct: 0, disabled: false };
        }
        const totalDist = engine.getResortPathTotalDistance();
        if (job.phase === "travelingTo") {
            const span = Math.max(0.001, totalDist - job.targetProgress);
            const pct = Math.max(0, Math.min(100, ((totalDist - job.pathProgress) / span) * 100));
            return { mode: "travel", label: "Traveling to…", pct: pct, disabled: true };
        }
        if (job.phase === "weaving") {
            const pct = job.weaveTotalMs > 0 ? Math.max(0, Math.min(100, (1 - (job.weaveRemainMs / job.weaveTotalMs)) * 100)) : 0;
            return { mode: "weaving", label: `Weaving in ${Math.ceil(job.weaveRemainMs / 1000)}s`, pct: pct, disabled: true };
        }
        if (job.phase === "storingRocks") {
            const span = Math.max(0.001, totalDist - job.targetProgress);
            const pct = Math.max(0, Math.min(100, ((job.pathProgress - job.targetProgress) / span) * 100));
            return { mode: "store", label: "Storing Rocks…", pct: pct, disabled: true };
        }
        if (job.phase === "returning") {
            const span = Math.max(0.001, totalDist - job.targetProgress);
            const pct = Math.max(0, Math.min(100, ((job.pathProgress - job.targetProgress) / span) * 100));
            return { mode: "return", label: "Returning…", pct: pct, disabled: true };
        }
        return null;
    },
    getPathUpgradeWeaveUi: function(segmentIndex, upgradeKey) {
        const ui = engine.getPathSegmentWeaveUi(segmentIndex);
        if (!ui) {
            return null;
        }
        const okami = engine.getOkami();
        let jobType = null;
        if (okami.pathJob && okami.pathJob.segmentIndex === segmentIndex) {
            jobType = okami.pathJob.jobType || "removeRocks";
        } else if (okami.pausedPathJobs && okami.pausedPathJobs[segmentIndex]) {
            jobType = okami.pausedPathJobs[segmentIndex].jobType || "removeRocks";
        }
        if (!jobType) {
            return null;
        }
        if (jobType !== upgradeKey) {
            return null;
        }
        return ui;
    },
    getWeavingMapSiteKey: function(scopeKey) {
        if (!scopeKey) {
            return "";
        }
        if (scopeKey === "foxDen" || scopeKey === "foxDenUnlock") {
            return "foxDen";
        }
        if (resortData.baseBuildingDisplayNames[scopeKey]) {
            return scopeKey;
        }
        return scopeKey;
    },
    getOkamiMapVisual: function() {
        const okami = engine.getOkami();
        const weaving = data.progress.weaving;
        if (weaving && weaving.active) {
            const siteKey = engine.getWeavingMapSiteKey(weaving.active.scopeKey);
            if (siteKey) {
                return { mode: "site", siteKey: siteKey };
            }
        }
        const job = okami.pathJob;
        const assignIdx = engine.parsePathAssignmentKey(okami.assignedBuildingKey);
        if (job && (job.phase === "weaving" || (job.paused && job.pausedPhase === "weaving"))
            && assignIdx === job.segmentIndex) {
            return { mode: "pathWeaving", segmentIndex: job.segmentIndex };
        }
        if (job && !job.paused && (job.phase === "travelingTo" || job.phase === "storingRocks" || job.phase === "returning")) {
            return {
                mode: "travel",
                pathProgress: job.pathProgress,
                east: engine.getPathTravelDirectionEast(job.pathProgress)
            };
        }
        const assignKey = okami.assignedBuildingKey;
        if (!assignKey) {
            return { mode: "none" };
        }
        if (job && job.paused && (job.pausedPhase === "travelingTo" || job.pausedPhase === "storingRocks" || job.pausedPhase === "returning")) {
            return { mode: "none" };
        }
        if (assignKey === "foxDen") {
            const rh = engine.ensureFoxDenConstruction();
            const okamiCarrier = (rh.constructionCarriers || []).some(function(c) { return c.isOkami; });
            if (okamiCarrier) {
                return { mode: "none" };
            }
        }
        return { mode: "site", siteKey: assignKey };
    },
    createMineBlocksForDepth: function(depth) {
        const types = [
            "dirt", "dirt", "stone", "dirt", "stone",
            "dirt", "dirt", "stone", "dirt", "stone",
            "dirt", "stone", "dirt", "dirt", "stone",
            "dirt", "dirt", "stone", "stone", "dirt",
            "stone", "dirt", "dirt", "dirt", "stone"
        ];
        const hpMult = Math.pow(1.9, depth || 0);
        const hpByType = { dirt: 10, stone: 30 };
        const blocks = [];
        for (let i = 0; i < types.length; i++) {
            const type = types[i];
            const maxHp = hpByType[type] * hpMult;
            blocks.push({
                type: type,
                hp: maxHp,
                maxHp: maxHp
            });
        }
        return blocks;
    },
    ensureMineState: function() {
        const mine = data.progress.base && data.progress.base.mine;
        if (!mine) {
            return null;
        }
        if (!mine.resources) {
            mine.resources = { dirt: 0, stone: 0 };
        }
        if (!mine.clearsByDepth) {
            mine.clearsByDepth = { 0: 0 };
        }
        if (mine.currentDepth === undefined) {
            mine.currentDepth = 0;
        }
        if (!mine.blocks) {
            mine.blocks = engine.createMineBlocksForDepth(mine.currentDepth || 0);
        }
        return mine;
    },
    getMineSpiritList: function() {
        const spirits = (data.progress.base && data.progress.base.hiddenSpring && data.progress.base.hiddenSpring.spirits) || [];
        const out = [];
        for (let i = 0; i < spirits.length; i++) {
            if (spirits[i].location === "mine") {
                out.push(spirits[i]);
            }
        }
        return out;
    },
    getMineSpiritPower: function() {
        const spirits = engine.getMineSpiritList();
        let total = 0;
        for (let i = 0; i < spirits.length; i++) {
            total += spirits[i].spiritPower || 1;
        }
        return total;
    },
    getMineSpiritLevelTotal: function() {
        const spirits = engine.getMineSpiritList();
        let total = 0;
        for (let i = 0; i < spirits.length; i++) {
            total += spirits[i].level || 1;
        }
        return total;
    },
    getMineFirstActiveBlock: function() {
        const mine = engine.ensureMineState();
        if (!mine || !mine.blocks) {
            return null;
        }
        for (let i = 0; i < mine.blocks.length; i++) {
            if ((mine.blocks[i].hp || 0) > 0) {
                return mine.blocks[i];
            }
        }
        return null;
    },
    isMineCleared: function() {
        return !engine.getMineFirstActiveBlock();
    },
    grantMineBlockReward: function(mine, blockType) {
        const depth = mine.currentDepth || 0;
        const gain = Math.pow(2, depth);
        mine.resources[blockType] = (mine.resources[blockType] || 0) + gain;
    },
    damageMineBlocks: function(mine, damage) {
        let remaining = damage;
        while (remaining > 0) {
            const block = engine.getMineFirstActiveBlock();
            if (!block) {
                break;
            }
            const dealt = Math.min(block.hp || 0, remaining);
            block.hp -= dealt;
            remaining -= dealt;
            if (block.hp <= 0) {
                block.hp = 0;
                engine.grantMineBlockReward(mine, block.type);
            }
        }
    },
    updateMine: function(tickMs) {
        const mine = engine.ensureMineState();
        if (!mine) {
            return;
        }
        const power = engine.getMineSpiritPower();
        if (power <= 0) {
            return;
        }
        if (!engine.isMineCleared()) {
            mine.playTimerMs = 0;
            engine.damageMineBlocks(mine, power * (tickMs / 1000));
            return;
        }
        const dirt = mine.resources.dirt || 0;
        if (dirt <= 0) {
            const d = mine.currentDepth || 0;
            mine.clearsByDepth[d] = (mine.clearsByDepth[d] || 0) + 1;
            mine.blocks = engine.createMineBlocksForDepth(d);
            mine.playTimerMs = 0;
            return;
        }
        mine.playTimerMs = (mine.playTimerMs || 0) + tickMs;
        while (mine.playTimerMs >= 5000 && (mine.resources.dirt || 0) > 0) {
            mine.playTimerMs -= 5000;
            const spirits = engine.getMineSpiritList();
            const remove = Math.min(mine.resources.dirt || 0, engine.getMineSpiritLevelTotal());
            mine.resources.dirt -= remove;
            if (spirits.length > 0 && remove > 0) {
                const xpEach = remove / spirits.length;
                for (let i = 0; i < spirits.length; i++) {
                    engine.grantSpiritExp(spirits[i], xpEach);
                }
            }
            if ((mine.resources.dirt || 0) <= 0) {
                const d = mine.currentDepth || 0;
                mine.clearsByDepth[d] = (mine.clearsByDepth[d] || 0) + 1;
                mine.blocks = engine.createMineBlocksForDepth(d);
                mine.playTimerMs = 0;
            }
        }
    },
    changeMineDepth: function(delta) {
        const mine = engine.ensureMineState();
        if (!mine) {
            return false;
        }
        const current = mine.currentDepth || 0;
        const target = current + delta;
        if (target < 0) {
            return false;
        }
        if (delta > 0 && (mine.clearsByDepth[current] || 0) < 10) {
            return false;
        }
        if (delta < 0 && current <= 0) {
            return false;
        }
        mine.currentDepth = target;
        if (mine.clearsByDepth[target] === undefined) {
            mine.clearsByDepth[target] = 0;
        }
        mine.blocks = engine.createMineBlocksForDepth(target);
        mine.playTimerMs = 0;
        return true;
    },
    updateInnGuests: function(tickMs) {
        const inn = data.progress.base && data.progress.base.inn;
        if (!inn) {
            return;
        }
        const maxGuests = engine.getInnGuestCapacity();
        if (inn.openForGuests && inn.guests.length < maxGuests) {
            inn.nextGuestTimerMs -= tickMs;
            while (inn.nextGuestTimerMs <= 0 && inn.guests.length < maxGuests) {
                inn.nextGuestTimerMs += 60000;
                inn.guests.push(engine.rollBarGuest());
            }
        }
        const chatSpeed = engine.getBarChatSpeedMultiplier();
        const nextGuests = [];
        for (let i = 0; i < inn.guests.length; i++) {
            const g = inn.guests[i];
            if (g.isChatting) {
                g.chatProgress = (g.chatProgress || 0) + ((tickMs / 10000) * chatSpeed);
                if (g.chatProgress >= 1) {
                    if (g.skillKey) {
                        engine.grantTipToSkill(g.skillKey, 1);
                        engine.onSkillTrigger("gossip", 1);
                    }
                    continue;
                }
            }
            nextGuests.push(g);
        }
        inn.guests = nextGuests;
    },
    getBarChatSpeedMultiplier: function() {
        const e = skills.getSkillEffect("gossip");
        return e.gossipChatSpeedMult !== undefined ? e.gossipChatSpeedMult : 1;
    },
    getInnGuestCapacity: function() {
        const w = data.progress.base && data.progress.base.atelier;
        const extra = w ? (w.barRoomUpgradesBought || 0) : 0;
        return 3 + extra;
    },
    ensureManaState: function() {
        if (!data.progress.mana) {
            data.progress.mana = { amount: 0 };
        }
        return data.progress.mana;
    },
    getManaCapacity: function() {
        return 10000;
    },
    isManaUnlocked: function() {
        const torii = data.progress.base && data.progress.base.torii;
        return (torii && (torii.plantSpiritsBought || 0) > 0);
    },
    getSpiritManaRatePerSecond: function() {
        const spirits = (data.progress.base && data.progress.base.hiddenSpring && data.progress.base.hiddenSpring.spirits) || [];
        let sum = 0;
        for (let i = 0; i < spirits.length; i++) {
            const kind = spirits[i].kind;
            if (kind === "plant" || kind === "earth" || kind === "water" || kind === "fire") {
                sum += Math.floor(spirits[i].level || 1);
            }
        }
        return sum;
    },
    updateManaPerSecond: function() {
        if (!engine.isManaUnlocked()) {
            return;
        }
        const mana = engine.ensureManaState();
        const rate = engine.getSpiritManaRatePerSecond();
        const cap = engine.getManaCapacity();
        mana.amount = Math.min(cap, Math.floor((mana.amount || 0) + rate));
    },
    getOkami: function() {
        if (!data.progress.okami) {
            data.progress.okami = { level: 0, exp: 0, assignedBuildingKey: "", lastAssignedBuildingKey: "", pathJob: null, pausedPathJobs: {} };
        }
        if (data.progress.okami.pathJob === undefined) {
            data.progress.okami.pathJob = null;
        }
        if (!data.progress.okami.pausedPathJobs) {
            data.progress.okami.pausedPathJobs = {};
        }
        if (data.progress.okami.lastAssignedBuildingKey === undefined) {
            data.progress.okami.lastAssignedBuildingKey = "";
        }
        return data.progress.okami;
    },
    getOkamiTails: function(level) {
        const lvl = level !== undefined && level !== null ? level : engine.getOkami().level;
        const tier = Math.floor(lvl / 10);
        return 1 + tier;
    },
    getOkamiTailLabel: function(tails) {
        const labels = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
        return labels[tails] || String(tails);
    },
    getOkamiSpiritStrands: function(level) {
        const tails = engine.getOkamiTails(level);
        return (tails * (tails + 1)) / 2;
    },
    getOkamiExpToLevel: function(level) {
        const cfg = resortData.okamiConfig;
        const lvl = level !== undefined && level !== null ? level : engine.getOkami().level;
        const tier = Math.floor(lvl / 10);
        const within = lvl % 10;
        const tierMult = (cfg.expTierMultipliers && cfg.expTierMultipliers[tier]) || Math.pow(6, tier);
        return tierMult * (cfg.baseExpToLevel + cfg.expAdditiveStep * within);
    },
    getOkamiInspirationBonus: function(level) {
        const cfg = resortData.okamiConfig;
        const lvl = level !== undefined && level !== null ? level : engine.getOkami().level;
        return cfg.baseInspirationBonus + cfg.inspirationBonusPerLevel * lvl;
    },
    getOkamiStateDisplayText: function() {
        const weaving = data.progress.weaving;
        if (weaving && weaving.active) {
            const a = weaving.active;
            return `Weaving ${a.upgradeName} at the ${a.buildingName}`;
        }
        const okami = engine.getOkami();
        const job = okami.pathJob;
        if (job && !job.paused) {
            const jobType = job.jobType || "removeRocks";
            if (job.phase === "travelingTo") {
                return "Traveling";
            }
            if (job.phase === "weaving") {
                if (jobType === "addRailing") {
                    return "Weaving railing";
                }
                if (jobType === "addStairs") {
                    return "Weaving stairs";
                }
                if (jobType === "addLanterns") {
                    return "Weaving lanterns";
                }
                return "Weaving Remove Rocks";
            }
            if (job.phase === "storingRocks") {
                return "Storing Rocks";
            }
            if (job.phase === "returning") {
                return "Returning";
            }
        }
        if (job && job.paused) {
            return "Paused";
        }
        if (okami.assignedBuildingKey === "foxDen") {
            return "Working at the Fox Den";
        }
        if (okami.assignedBuildingKey) {
            return `Working at the ${resortData.getScopeDisplayName(okami.assignedBuildingKey)}`;
        }
        return "Idling";
    },
    isOkamiStateClickable: function() {
        const weaving = data.progress.weaving;
        if (weaving && weaving.active) {
            return false;
        }
        const okami = engine.getOkami();
        const job = okami.pathJob;
        if (job && !job.paused && (job.phase === "travelingTo" || job.phase === "storingRocks")) {
            return false;
        }
        return !!(okami.assignedBuildingKey);
    },
    getSiteEffectiveWorkerRate: function(siteKey) {
        const slot = data.progress.base && data.progress.base[siteKey];
        if (!slot) {
            return 0;
        }
        const kitsune = slot.assignedWorkers || 0;
        const okami = engine.getOkami();
        if (okami.assignedBuildingKey !== siteKey) {
            return kitsune;
        }
        return 1 + kitsune * engine.getOkamiInspirationBonus();
    },
    getWeavingJobKey: function(scopeKey, upgradeKey) {
        return scopeKey + ":" + upgradeKey;
    },
    getWeavingState: function() {
        if (!data.progress.weaving) {
            data.progress.weaving = { active: null, paused: {} };
        }
        const weaving = data.progress.weaving;
        if (!weaving.paused || typeof weaving.paused !== "object" || Array.isArray(weaving.paused)) {
            weaving.paused = {};
        } else if (weaving.paused.scopeKey !== undefined && weaving.paused.upgradeKey !== undefined) {
            const legacyKey = engine.getWeavingJobKey(weaving.paused.scopeKey, weaving.paused.upgradeKey);
            weaving.paused = { [legacyKey]: weaving.paused };
        }
        return weaving;
    },
    getPausedWeavingEntry: function(scopeKey, upgradeKey) {
        const weaving = engine.getWeavingState();
        return weaving.paused[engine.getWeavingJobKey(scopeKey, upgradeKey)] || null;
    },
    getAllPausedWeavingEntries: function() {
        const weaving = engine.getWeavingState();
        const out = [];
        const keys = Object.keys(weaving.paused);
        for (let i = 0; i < keys.length; i++) {
            if (weaving.paused[keys[i]]) {
                out.push(weaving.paused[keys[i]]);
            }
        }
        return out;
    },
    pauseWeavingEntry: function(entry) {
        if (!entry) {
            return;
        }
        const weaving = engine.getWeavingState();
        const key = engine.getWeavingJobKey(entry.scopeKey, entry.upgradeKey);
        weaving.paused[key] = Object.assign({}, entry);
    },
    getUpgradeDef: function(scopeKey, upgradeKey) {
        if (scopeKey === "foxDenUnlock") {
            return resortData.foxDenUnlockGetDef(upgradeKey);
        }
        if (scopeKey === "path") {
            const bcfg = resortData.buildings.path;
            return bcfg && bcfg.upgrades ? bcfg.upgrades[upgradeKey] : null;
        }
        const bcfg = resortData.buildings[scopeKey];
        return bcfg && bcfg.upgrades ? bcfg.upgrades[upgradeKey] : null;
    },
    startWeaving: function(scopeKey, upgradeKey, upgradeDef) {
        const up = upgradeDef || engine.getUpgradeDef(scopeKey, upgradeKey);
        if (!up) {
            return false;
        }
        const okami = engine.getOkami();
        if (okami.assignedBuildingKey) {
            okami.lastAssignedBuildingKey = okami.assignedBuildingKey;
        }
        if (okami.assignedBuildingKey === "foxDen") {
            engine.syncFoxDenCarriersToWorkforce();
        }
        if (okami.pathJob && !okami.pathJob.paused) {
            engine.pauseOkamiPathJob();
        }
        okami.assignedBuildingKey = "";
        const weaving = engine.getWeavingState();
        const totalMs = resortData.getUpgradeWeavingSeconds(up, scopeKey) * 1000;
        const entry = {
            scopeKey: scopeKey,
            upgradeKey: upgradeKey,
            remainMs: totalMs,
            totalMs: totalMs,
            upgradeName: up.name || upgradeKey,
            buildingName: resortData.getScopeDisplayName(scopeKey),
            progressCostPurchase: !!up.progressCostPurchase
        };
        if (weaving.active) {
            engine.pauseWeavingEntry(weaving.active);
        }
        weaving.active = entry;
        return true;
    },
    resumeWeaving: function(scopeKey, upgradeKey) {
        const weaving = engine.getWeavingState();
        const key = engine.getWeavingJobKey(scopeKey, upgradeKey);
        const entry = weaving.paused[key];
        if (!entry) {
            return false;
        }
        const okami = engine.getOkami();
        if (okami.assignedBuildingKey) {
            okami.lastAssignedBuildingKey = okami.assignedBuildingKey;
        }
        if (okami.assignedBuildingKey === "foxDen") {
            engine.syncFoxDenCarriersToWorkforce();
        }
        if (okami.pathJob && !okami.pathJob.paused) {
            engine.pauseOkamiPathJob();
        }
        okami.assignedBuildingKey = "";
        if (weaving.active) {
            engine.pauseWeavingEntry(weaving.active);
        }
        weaving.active = Object.assign({}, entry);
        delete weaving.paused[key];
        return true;
    },
    completeWeaving: function() {
        const weaving = engine.getWeavingState();
        const active = weaving.active;
        if (!active) {
            return;
        }
        if (active.scopeKey === "foxDenUnlock") {
            const slot = resortData.foxDenUnlockGetDef(active.upgradeKey);
            if (slot && slot.onBuy) {
                slot.onBuy();
            }
        } else {
            const up = engine.getUpgradeDef(active.scopeKey, active.upgradeKey);
            if (up) {
                if (up.progressCostPurchase) {
                    resortData.applyProgressCostPurchase(active.scopeKey);
                } else if (up.onBuy) {
                    up.onBuy();
                }
            }
        }
        weaving.active = null;
        engine.restoreOkamiAfterWeaveOrPath();
    },
    updateWeaving: function(tickMs) {
        const weaving = engine.getWeavingState();
        if (!weaving.active) {
            return;
        }
        weaving.active.remainMs = Math.max(0, weaving.active.remainMs - tickMs);
        if (weaving.active.remainMs <= 0) {
            engine.completeWeaving();
        }
    },
    getUpgradeWeaveUi: function(scopeKey, upgradeKey) {
        if (scopeKey === "path") {
            const segIdx = data.progress.selectedPathSegmentIndex;
            if (segIdx !== undefined && segIdx !== null) {
                return engine.getPathUpgradeWeaveUi(segIdx, upgradeKey);
            }
            const job = engine.getOkamiPathJob();
            if (job) {
                return engine.getPathUpgradeWeaveUi(job.segmentIndex, upgradeKey);
            }
            return null;
        }
        const weaving = engine.getWeavingState();
        if (weaving.active && weaving.active.scopeKey === scopeKey && weaving.active.upgradeKey === upgradeKey) {
            const a = weaving.active;
            const pct = a.totalMs > 0 ? Math.max(0, Math.min(100, (1 - (a.remainMs / a.totalMs)) * 100)) : 0;
            return {
                mode: "active",
                label: `Weaving in ${Math.ceil(a.remainMs / 1000)}s`,
                pct: pct,
                disabled: true
            };
        }
        const pausedEntry = engine.getPausedWeavingEntry(scopeKey, upgradeKey);
        if (pausedEntry) {
            const pct = pausedEntry.totalMs > 0
                ? Math.max(0, Math.min(100, (1 - (pausedEntry.remainMs / pausedEntry.totalMs)) * 100))
                : 0;
            return {
                mode: "paused",
                label: `Paused, ${Math.ceil(pausedEntry.remainMs / 1000)}s remain`,
                pct: pct,
                disabled: false
            };
        }
        return null;
    },
    getTotalAssignedWorkers: function() {
        const b = data.progress.base;
        if (!b) {
            return 0;
        }
        let total = 0;
        resortData.iterWorkerAssignmentSites(function(siteKey, slot) {
            if (slot) {
                total += slot.assignedWorkers || 0;
            }
        });
        return total;
    },
    getTotalFoundWorkers: function() {
        const kitsune = data.progress.kitsune;
        if (kitsune && kitsune.total !== undefined) {
            return kitsune.total || 0;
        }
        return 2;
    },
    getAvailableWorkers: function() {
        return Math.max(0, engine.getTotalFoundWorkers() - engine.getTotalAssignedWorkers());
    },
    tryAssignWorker: function(kind) {
        const b = data.progress.base && data.progress.base[kind];
        if (!b) return false;
        if (engine.getAvailableWorkers() <= 0) return false;
        b.assignedWorkers = (b.assignedWorkers || 0) + 1;
        return true;
    },
    tryUnassignWorker: function(kind) {
        const b = data.progress.base && data.progress.base[kind];
        if (!b) return false;
        if ((b.assignedWorkers || 0) <= 0) return false;
        b.assignedWorkers--;
        if (kind === "foxDen") {
            engine.syncFoxDenCarriersToWorkforce();
        }
        if (kind === "bambooForest") {
            engine.clearBambooCutIfNoWorkers();
        }
        return true;
    },
    grantTipToSkill: function(skillKey, baseAmount) {
        const skill = data.progress.skills[skillKey];
        if (!skill) {
            return;
        }
        const gEff = skills.getSkillEffect("gossip");
        const tipTalent = gEff.gossipTipBonusFromTalent || 0;
        const bonus = 1 + tipTalent;
        skill.tips = (skill.tips || 0) + (baseAmount * bonus);
    },
    getNextSkillResearchTargetKey: function() {
        const lib = data.progress.base && data.progress.base.scrollArchives;
        if (!lib || !lib.skillResearch) {
            return "";
        }
        const categories = ["combat", "resort", "foraging", "class"];
        for (let ci = 0; ci < categories.length; ci++) {
            const cat = categories[ci];
            for (let i = 0; i < skills.keysInOrder.length; i++) {
                const k = skills.keysInOrder[i];
                const sk = data.progress.skills[k];
                if (!sk || (sk.category || "combat") !== cat) {
                    continue;
                }
                const rs = lib.skillResearch[k];
                if (!rs || !rs.purchased || rs.researched || rs.paused) {
                    continue;
                }
                return k;
            }
        }
        return "";
    },
    updateScrollArchivesResearch: function(tickMs) {
        const lib = data.progress.base && data.progress.base.scrollArchives;
        if (!lib || !lib.skillResearch) {
            return;
        }
        if ((lib.assignedWorkers || 0) <= 0) {
            return;
        }
        const targetKey = engine.getNextSkillResearchTargetKey();
        if (!targetKey) {
            return;
        }
        const rs = lib.skillResearch[targetKey];
        if (!rs) {
            return;
        }
        const rate = (lib.researchPerWorkerPerSecond || 1) * (lib.assignedWorkers || 0);
        rs.progress = (rs.progress || 0) + (rate * (tickMs / 1000));
        if ((rs.progress || 0) < (rs.required || 0)) {
            return;
        }
        rs.progress = rs.required || rs.progress || 0;
        rs.researched = true;
        lib.unlockedSkills[targetKey] = true;
    },
    rollBarGuest: function() {
        const baseGuests = [
            { archetype: "Traveling Merchant", rarity: 0, skillKey: null },
            { archetype: "Wandering Bard", rarity: 0, skillKey: null },
            { archetype: "Quiet Pilgrim", rarity: 0, skillKey: null }
        ];
        const unlocked = [];
        let rarityTotal = 0;
        for (let i = 0; i < skills.keysInOrder.length; i++) {
            const k = skills.keysInOrder[i];
            if (!skills.isSkillUnlocked(k)) {
                continue;
            }
            const gi = skills.getSkillGuestInfo(k);
            const r = Math.max(1, gi.rarity);
            unlocked.push({ skillKey: k, archetype: gi.archetype, rarity: r });
            rarityTotal += r;
        }
        const inn = data.progress.base.inn;
        const roll = Math.floor(Math.random() * 100) + 1;
        const cap = Math.min(100, rarityTotal);
        let picked = null;
        if (roll <= cap) {
            const weightedRoll = Math.floor(Math.random() * Math.max(1, rarityTotal)) + 1;
            let cursor = 0;
            for (let i = 0; i < unlocked.length; i++) {
                cursor += unlocked[i].rarity;
                if (weightedRoll <= cursor) {
                    picked = unlocked[i];
                    break;
                }
            }
        }
        const id = inn.guestIdCounter++;
        if (!picked) {
            const basePick = baseGuests[Math.floor(Math.random() * baseGuests.length)];
            return {
                id: id,
                archetype: basePick.archetype,
                rarity: 0,
                skillKey: null,
                isChatting: false,
                chatProgress: 0
            };
        }
        return {
            id: id,
            archetype: picked.archetype,
            rarity: picked.rarity,
            skillKey: picked.skillKey,
            isChatting: false,
            chatProgress: 0
        };
    }
}
