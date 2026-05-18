
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
    runTownTick: function(elapsedMs) {
        engine.updateTownTimers(elapsedMs);
        engine.updateMapClearProgressTimers(elapsedMs);
        engine.updateManualActionCooldowns(elapsedMs);
        engine.updateBaseProduction(elapsedMs);
        engine.updateInnGuests(elapsedMs);
        engine.updateLibraryResearch(elapsedMs);
    },
    updateTownTimers: function(elapsedMs) {
        if (!data.progress) {
            return;
        }
        data.progress.classSwitchCooldownMs = Math.max(0, (data.progress.classSwitchCooldownMs || 0) - elapsedMs);
    },
    gameTick: function() {
        data.gameSettings.ticksForSeconds++;

        const tickMs = 1000 / data.gameSettings.ticksPerSecond;
        engine.runTownTick(tickMs);
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
        if ((data.progress.currentClassKey || "none") === "hunter" && (data.battle.classRetreatMs || 0) > 0) {
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
        if ((data.progress.currentClassKey || "none") === "rogue" && (data.battle.rogueFlurryMs || 0) > 0) {
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
        if (cls === "rogue") {
            engine.addClassBarProgress("B", 100 * sec);
        } else if (cls === "hunter") {
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
        if ((data.battle.rogueFlurryMs || 0) > 0) {
            data.battle.rogueFlurryMs = Math.max(0, data.battle.rogueFlurryMs - tickMs);
        }
        if ((data.progress.currentClassKey || "none") === "rogue" && (data.battle.classPowerA || 0) >= 1000 && !data.battle.rogueDashActive) {
            data.battle.classPowerA -= 1000;
            data.battle.rogueDashActive = true;
        }
        if (data.battle.rogueDashActive && engine.anyIntruderInSlapRange()) {
            data.battle.rogueDashActive = false;
        }
        if ((data.progress.currentClassKey || "none") === "hunter" && (data.battle.classPowerB || 0) >= 1000 && (data.battle.classRetreatMs || 0) <= 0) {
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
        if (cls === "warrior" && (data.battle.classPowerA || 0) >= 1000) {
            data.battle.classPowerA -= 1000;
            slapDamage *= 2;
            isPowerStrike = true;
        }
        if (cls === "rogue" && (data.battle.classPowerB || 0) >= 1000) {
            data.battle.classPowerB -= 1000;
            data.battle.rogueFlurryMs = 2000;
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
            if (cls === "warrior") engine.addClassBarProgress("A", 100);
            if (cls === "hunter") engine.addClassBarProgress("A", 100);
        } else {
            engine.onSkillTrigger("cleave", 1);
            engine.applyWarriorCleave(target, slapDamage);
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
                gold: 0,
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
                gold: engine.goldAwardFromIntruderGain(cr.perIntruderGain),
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
                const tEff = skills.getSkillEffect("toughness_warrior");
                const armorFlat = tEff.toughnessArmorFlat || 0;
                incoming = Math.max(0, incoming - armorFlat);
                if ((data.progress.currentClassKey || "none") === "warrior" && (data.battle.classPowerB || 0) >= 1000) {
                    data.battle.classPowerB -= 1000;
                    incoming *= 0.5;
                    engine.onSkillTrigger("second_wind", 1);
                    const swEff = skills.getSkillEffect("second_wind");
                    const secondWindHeal = swEff.secondWindBlockHeal || 0;
                    if (secondWindHeal > 0) {
                        data.battle.player.hp = Math.min(data.battle.player.maxHp, data.battle.player.hp + secondWindHeal);
                    }
                }
                if (incoming > 0 && (data.progress.currentClassKey || "none") === "warrior" && intruder.intruderType !== "lecher") {
                    engine.addClassBarProgress("B", 200);
                    const thEff = skills.getSkillEffect("thorns");
                    const thorns = thEff.thornsRetaliationDamage || 0;
                    if (thorns > 0) {
                        intruder.hp -= thorns;
                    }
                }
                data.battle.player.hp -= incoming;
                engine.onSkillTrigger("fortitude", 1);
                engine.onSkillTrigger("toughness_warrior", intruder.intruderType === "lecher" ? 0 : 1);
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
        if ((data.progress.currentClassKey || "none") !== "warrior") {
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
        const goldGain = engine.goldAwardFromIntruderGain(gain);
        data.progress.gold += goldGain;
        data.battle.runGoldFromKills = (data.battle.runGoldFromKills || 0) + goldGain;
        if (growthUnlocked) {
            data.battle.levelState.exp += expGain;
        }
        data.battle.enemiesKilled++;
        const shardDrop = engine.trySkillShardDropOnKill(intruder);
        engine.addMapClearProgressForKill(data.progress.currentMapKey);
        engine.onSkillTrigger("wisdom", 1);
        engine.onSkillTrigger("greed", 1);
        engine.onSkillTrigger("scavenger", Math.sqrt(Math.max(0, goldGain)));
        if (data.battle.state === "running") {
            engine.updateCurrentZoneInfo();
        }
        if (typeof view !== "undefined" && view.spawnKillRewardFloater) {
            const pos = engine.getKillFloaterScreenPosition(intruder);
            const parts = [
                `${intToStringRound(goldGain)} gold`,
                growthUnlocked ? `+${round1(expGain)} exp` : "+0 exp"
            ];
            if (shardDrop) {
                parts.push(`+${shardDrop.gain} ${shardDrop.name}`);
            }
            view.spawnKillRewardFloater(pos.x, pos.y, parts);
        }
        if ((data.progress.currentClassKey || "none") === "rogue") {
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
    /** Matches `onIntruderKilled`: scavenger flat + greedy gold multiplier over stored zone gain. */
    goldAwardFromIntruderGain: function(storedGain) {
        const gain = storedGain !== undefined ? storedGain : 1;
        const sEff = skills.getSkillEffect("scavenger");
        const gEff = skills.getSkillEffect("greed");
        const scavFlat = sEff.scavengerKillGoldFlatPerKill || 0;
        const baseGoldPart = gain + scavFlat;
        const greedMult = gEff.greedKillGoldMultiplier !== undefined ? gEff.greedKillGoldMultiplier : 1;
        return baseGoldPart * greedMult;
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
        const sandalOn = !!(data.progress.sandalAttackEnabled && data.progress.base && data.progress.base.workshop && data.progress.base.workshop.sandalBuilt);
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
        if ((data.progress.currentClassKey || "none") === "rogue" && data.battle.rogueDashActive) {
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
        if ((data.progress.currentClassKey || "none") === "rogue" && data.battle.rogueDashActive) {
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
            data.progress.mapStars[mapKey] = { bronze: false, silver: false, gold: false };
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
        if (!stars.gold) {
            stars.gold = true;
            data.progress.stars.gold = (data.progress.stars.gold || 0) + 1;
            engine.grantWorkersForMapStar(mapKey, 3);
            addStarClearProgress(25);
        }
        data.battle.transitionMessage = "Gold star received! Map complete.";
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
        if (!(data.progress.sandalAttackEnabled && data.progress.base && data.progress.base.workshop && data.progress.base.workshop.sandalBuilt)) {
            return;
        }
        if ((data.progress.currentClassKey || "none") === "rogue") {
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
        if (cls === "hunter" && (data.battle.classPowerA || 0) >= 1000) {
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
        if (cls === "hunter") {
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
    applyWarriorCleave: function(primaryTarget, dealtDamage) {
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
        const runGold = Math.max(0, data.battle.runGoldFromKills || 0);
        const runGoldPerSecond = runSeconds > 0 ? runGold / runSeconds : 0;
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
            goldGained: runGold,
            goldPerSecond: runGoldPerSecond,
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
        const base = data.progress.base;
        if (!base) {
            return;
        }
        const sec = tickMs / 1000;
        const res = base.resources;

        if ((base.mine.assignedWorkers || 0) > 0) {
            let wp = base.mine.workerPower || 0;
            wp += (base.mine.assignedWorkers || 0) * sec;
            while (wp >= 40) {
                wp -= 40;
                res.ironOre += 1;
            }
            base.mine.workerPower = wp;
        }

        if ((base.smith.assignedWorkers || 0) > 0 && res.ironOre > 0) {
            let wp = base.smith.workerPower || 0;
            wp += (base.smith.assignedWorkers || 0) * sec;
            while (wp >= 40 && res.ironOre > 0) {
                wp -= 40;
                res.ironOre -= 1;
                res.ironBar += 1;
            }
            base.smith.workerPower = wp;
        }

        if ((base.claypit.assignedWorkers || 0) > 0) {
            let wp = base.claypit.workerPower || 0;
            wp += (base.claypit.assignedWorkers || 0) * sec;
            while (wp >= 40) {
                wp -= 40;
                res.stone += 1;
            }
            base.claypit.workerPower = wp;
        }

        if ((base.kiln.assignedWorkers || 0) > 0 && res.stone > 0) {
            let wp = base.kiln.workerPower || 0;
            wp += (base.kiln.assignedWorkers || 0) * sec;
            while (wp >= 40 && res.stone > 0) {
                wp -= 40;
                res.stone -= 1;
                res.bricks += 1;
            }
            base.kiln.workerPower = wp;
        }
        if ((base.lumbermill.assignedWorkers || 0) > 0 && res.logs > 0) {
            base.lumbermill.progress += ((base.lumbermill.assignedWorkers || 0) / 20) * sec;
            const potentialLumber = Math.floor(base.lumbermill.progress);
            if (potentialLumber > 0) {
                const lumberMade = Math.min(potentialLumber, res.logs);
                if (lumberMade > 0) {
                    base.lumbermill.progress -= lumberMade;
                    res.logs -= lumberMade;
                    res.lumber += lumberMade;
                }
            }
        }
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
                inn.guests.push(engine.rollInnGuest());
            }
        }
        const chatSpeed = engine.getInnChatSpeedMultiplier();
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
    getInnChatSpeedMultiplier: function() {
        const e = skills.getSkillEffect("gossip");
        return e.gossipChatSpeedMult !== undefined ? e.gossipChatSpeedMult : 1;
    },
    getManualActionCooldownSpeedMultiplier: function() {
        const e = skills.getSkillEffect("interfere");
        return e.interfereManualCdSpeedMult !== undefined ? e.interfereManualCdSpeedMult : 1;
    },
    getManualActionRewardMultiplier: function() {
        const e = skills.getSkillEffect("interfere");
        return e.interfereManualRewardMult !== undefined ? e.interfereManualRewardMult : 1;
    },
    getInnGuestCapacity: function() {
        const w = data.progress.base && data.progress.base.workshop;
        const extra = w ? (w.innRoomUpgradesBought || 0) : 0;
        return 3 + extra;
    },
    updateManualActionCooldowns: function(tickMs) {
        const b = data.progress.base;
        if (!b) {
            return;
        }
        const cdMult = engine.getManualActionCooldownSpeedMultiplier();
        const dec = tickMs * cdMult;
        b.mine.manualCooldownMs = Math.max(0, (b.mine.manualCooldownMs || 0) - dec);
        b.smith.manualCooldownMs = Math.max(0, (b.smith.manualCooldownMs || 0) - dec);
        b.claypit.manualCooldownMs = Math.max(0, (b.claypit.manualCooldownMs || 0) - dec);
        b.kiln.manualCooldownMs = Math.max(0, (b.kiln.manualCooldownMs || 0) - dec);
        b.lumbermill.manualCooldownMs = Math.max(0, (b.lumbermill.manualCooldownMs || 0) - dec);
        b.inn.advertiseCooldownMs = Math.max(0, (b.inn.advertiseCooldownMs || 0) - dec);
    },
    applyManualProgressBoost: function(kind) {
        const b = data.progress.base;
        if (!b) {
            return false;
        }
        let workerCount = 0;
        let cooldownRef = null;
        let progressRef = null;
        if (kind === "mine") {
            workerCount = b.mine.assignedWorkers || 0;
            cooldownRef = b.mine;
            progressRef = b.mine;
        } else if (kind === "smith") {
            workerCount = b.smith.assignedWorkers || 0;
            cooldownRef = b.smith;
            progressRef = b.smith;
        } else if (kind === "claypit") {
            workerCount = b.claypit.assignedWorkers || 0;
            cooldownRef = b.claypit;
            progressRef = b.claypit;
        } else if (kind === "kiln") {
            workerCount = b.kiln.assignedWorkers || 0;
            cooldownRef = b.kiln;
            progressRef = b.kiln;
        } else if (kind === "lumbermill") {
            workerCount = b.lumbermill.assignedWorkers || 0;
            cooldownRef = b.lumbermill;
            progressRef = b.lumbermill;
        } else {
            return false;
        }
        if ((cooldownRef.manualCooldownMs || 0) > 0) {
            return false;
        }
        if (workerCount <= 0) {
            return false;
        }
        const rewardMult = engine.getManualActionRewardMultiplier();
        const addSec = 5 * workerCount * rewardMult;
        if (kind === "mine" || kind === "smith" || kind === "claypit" || kind === "kiln") {
            progressRef.workerPower = (progressRef.workerPower || 0) + 5 * workerCount * rewardMult;
        } else {
            progressRef.progress += (addSec / 20);
        }
        cooldownRef.manualCooldownMs = 10000;
        engine.onSkillTrigger("interfere", 1);
        return true;
    },
    getTotalAssignedWorkers: function() {
        const b = data.progress.base;
        if (!b) return 0;
        return b.mine.assignedWorkers +
            b.smith.assignedWorkers +
            b.claypit.assignedWorkers +
            b.kiln.assignedWorkers +
            b.lumbermill.assignedWorkers +
            b.library.assignedWorkers;
    },
    getTotalFoundWorkers: function() {
        const mw = data.progress.mapWorkersFound;
        const keys = Object.keys(mw);
        let total = 0;
        for (let i = 0; i < keys.length; i++) total += mw[keys[i]] || 0;
        const tu = data.progress.base && data.progress.base.townhall && data.progress.base.townhall.townUpgrades;
        const hireLocalCount = tu ? tu.hireLocalBought || 0 : 0;
        total += Math.min(2, Math.max(0, hireLocalCount));
        return total;
    },
    getAvailableWorkers: function() {
        return Math.max(0, engine.getTotalFoundWorkers() - engine.getTotalAssignedWorkers());
    },
    tryAssignWorker: function(kind) {
        const b = data.progress.base && data.progress.base[kind];
        if (!b) return false;
        if ((b.assignedWorkers || 0) >= (b.gearSets || 0)) return false;
        if (engine.getAvailableWorkers() <= 0) return false;
        b.assignedWorkers = (b.assignedWorkers || 0) + 1;
        return true;
    },
    tryUnassignWorker: function(kind) {
        const b = data.progress.base && data.progress.base[kind];
        if (!b) return false;
        if ((b.assignedWorkers || 0) <= 0) return false;
        b.assignedWorkers--;
        return true;
    },
    applyManualAdvertise: function() {
        const inn = data.progress.base && data.progress.base.inn;
        if (!inn || !inn.openForGuests || (inn.advertiseCooldownMs || 0) > 0) {
            return false;
        }
        const rewardMult = engine.getManualActionRewardMultiplier();
        inn.nextGuestTimerMs = Math.max(0, inn.nextGuestTimerMs - (5000 * rewardMult));
        inn.advertiseCooldownMs = 10000;
        engine.onSkillTrigger("interfere", 1);
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
        const lib = data.progress.base && data.progress.base.library;
        if (!lib || !lib.skillResearch) {
            return "";
        }
        const categories = ["combat", "town", "foraging", "class"];
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
    updateLibraryResearch: function(tickMs) {
        const lib = data.progress.base && data.progress.base.library;
        if (!lib || !lib.skillResearch) {
            return;
        }
        if (typeof isDebug !== "undefined" && isDebug) {
            const categories = ["combat", "town", "foraging", "class"];
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
                    rs.progress = rs.required || 0;
                    rs.researched = true;
                    lib.unlockedSkills[k] = true;
                }
            }
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
    rollInnGuest: function() {
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
