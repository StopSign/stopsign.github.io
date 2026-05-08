
let engine = {
    /** Playable band for lanes (`inset`, `laneWidth`) — uses `viewData.layout.battlefieldWidthPx` / `gameData.battle`, not DOM measurements. */
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

        createView.syncBattlefieldLayoutFromDom();

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
        engine.updateEnemyMovement(tickMs);
        engine.updateCurrentZoneInfo();
        if (data.battle.mode !== "foraging") {
            engine.updateFortitudeWaveTracking();
            engine.updateRecoveryEachSecond(tickMs);
            engine.updatePassiveSkillExp(tickMs);
            engine.updateClassEffects(tickMs);
        } else {
            engine.updateForagingPassiveSkillExp(tickMs);
        }
        engine.updateTargeting();
        engine.updatePlayerAttack(tickMs);
        if (data.battle.mode !== "foraging") {
            engine.updateRangedAttack(tickMs);
            engine.updateEnemyAttacks(tickMs);
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
    addMapClearProgressForKill: function(mapKey) {
        const state = engine.getMapClearState(mapKey);
        state.pct = Math.min(100, state.pct + 0.5);
        if (state.pct >= 100 && state.activeMs <= 0) {
            state.activeMs = 120000;
        }
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
                st.pct = Math.max(0, Math.min(100, (st.activeMs / 120000) * 100));
            }
        }
    },
    isMapHarvestReady: function(mapKey) {
        const st = engine.getMapClearState(mapKey);
        return (st.pct >= 100 || st.activeMs > 0) && st.activeMs > 0;
    },
    getRangedEnemyStopY: function(playerTopY, battleHeight) {
        return playerTopY - 200;
    },
    isLaneSpotOccupied: function(targetLane, yPx, sizePx, skipEnemyId) {
        for (let i = 0; i < data.battle.enemies.length; i++) {
            const e = data.battle.enemies[i];
            if (!e.alive || e.id === skipEnemyId || e.lane !== targetLane) {
                continue;
            }
            if (Math.abs(e.yPx - yPx) < Math.max(sizePx, e.sizePx)) {
                return true;
            }
        }
        return false;
    },
    tryMeleeLaneShift: function(enemy) {
        const centerLane = Math.floor(gameData.battle.laneCount / 2);
        const options = [enemy.lane - 1, enemy.lane + 1];
        options.sort(function(a, b) {
            return Math.abs(a - centerLane) - Math.abs(b - centerLane);
        });
        for (let i = 0; i < options.length; i++) {
            const lane = options[i];
            if (lane < 0 || lane >= gameData.battle.laneCount) {
                continue;
            }
            if (engine.isLaneSpotOccupied(lane, enemy.yPx, enemy.sizePx, enemy.id)) {
                continue;
            }
            enemy.lane = lane;
            enemy.blockedByRangedMs = 0;
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
            const travelSpd = gd.enemyTravelSpeedPxPerSecond;
            const spacingPx = rows.length > 1 ? Math.max(0, z.distanceBetweenUnits || 0) : 0;
            for (let ri = 0; ri < rows.length; ri++) {
                const row = rows[ri];
                row.lane = Math.floor(laneRng() * gd.laneCount);
                // Combat battlefield units are 20% smaller (visual + collision footprint).
                row.sizeLaneFill = gd.enemySizeLaneFill * 0.8;
                row.speedPxPerSecond = travelSpd;
                row.attackCooldownMs = gd.enemyAttackCooldownMs;
                row.attackTimerMs = gd.enemyAttackCooldownMs;
                const enemyId = data.battle.enemyIdCounter;
                data.battle.enemyIdCounter++;
                const enemySize = Math.floor(lm.laneWidth * row.sizeLaneFill);
                const maxHp = Math.max(1, Math.round(row.rawHp !== undefined ? row.rawHp : row.maxHp));
                const attackDamage = Math.max(1, Math.round(row.rawDamage !== undefined ? row.rawDamage : row.attackDamage));
                const yPx = -enemySize - ri * spacingPx;
                data.battle.enemies.push({
                    id: enemyId,
                    lane: row.lane,
                    spawnTimeMs: z.startTimeMs,
                    zoneIndex: row.zoneIndex,
                    enemyType: row.enemyType || "melee",
                    yPx: yPx,
                    prevYPx: yPx,
                    sizePx: enemySize,
                    hp: maxHp,
                    maxHp: maxHp,
                    speedPxPerSecond: row.speedPxPerSecond * spdMult,
                    attackDamage: attackDamage,
                    attackCooldownMs: row.attackCooldownMs,
                    attackTimerMs: row.attackTimerMs,
                    gain: row.gain,
                    expBase: row.expBase !== undefined ? row.expBase : 1,
                    inRange: false,
                    rangedReady: false,
                    alive: true,
                    hasEnteredMeleeQueue: false,
                    blockedByRangedMs: 0
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
                const enemyId = data.battle.enemyIdCounter++;
                const lane = (gi + ri) % gd.laneCount;
                const enemySize = kind === "tree" ? Math.floor(lm.laneWidth * 0.35) : Math.floor(lm.laneWidth * 0.28);
                const yPx = -enemySize - (ri * spacingPx);
                const staminaCost = kind === "tree" ? 2 : (kind === "ore_vein" ? 3 : 1);
                data.battle.enemies.push({
                    id: enemyId,
                    lane: lane,
                    spawnTimeMs: 0,
                    zoneIndex: nextIndex,
                    forageIndex: nextIndex,
                    enemyType: kind,
                    yPx: yPx,
                    prevYPx: yPx,
                    sizePx: enemySize,
                    hp: maxHp,
                    maxHp: maxHp,
                    speedPxPerSecond: 0,
                    attackDamage: 0,
                    attackCooldownMs: 0,
                    attackTimerMs: 0,
                    gain: z.rewardAmount || 1,
                    rewardResource: z.rewardResource || "logs",
                    expBase: z.expBasePerEnemy !== undefined ? z.expBasePerEnemy : 1,
                    inRange: false,
                    rangedReady: false,
                    alive: true,
                    hasEnteredMeleeQueue: false,
                    blockedByRangedMs: 0,
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
    updateEnemyMovement: function(tickMs) {
        const battleHeight = viewData.layout.battlefieldHeightPx || 500;
        const playerTopY = viewData.layout.playerTopPx || (battleHeight - 65);
        const deltaSeconds = tickMs / 1000;
        const pushBonus = engine.getEnemyPushBonusPxPerSecond();
        if ((data.battle.mode || "combat") === "foraging" && pushBonus > 0) {
            data.battle.forageMoveAccumPx = (data.battle.forageMoveAccumPx || 0) + (pushBonus * deltaSeconds);
        }
        const laneBuckets = [];
        for (let l = 0; l < gameData.battle.laneCount; l++) {
            laneBuckets[l] = [];
        }
        for (let i = 0; i < data.battle.enemies.length; i++) {
            const enemy = data.battle.enemies[i];
            if (enemy.alive) {
                laneBuckets[enemy.lane].push(enemy);
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
                const enemy = laneEnemies[j];
                enemy.prevYPx = enemy.yPx;
                const dy = (enemy.speedPxPerSecond + pushBonus) * deltaSeconds;
                let tentativeY = enemy.yPx + dy;
                if (enemy.enemyType === "ranged") {
                    const wasReady = !!enemy.rangedReady;
                    const stopY = engine.getRangedEnemyStopY(playerTopY, battleHeight);
                    if (j === laneEnemies.length - 1) {
                        const baseDy = enemy.speedPxPerSecond * deltaSeconds;
                        const pushDy = pushBonus * deltaSeconds;
                        let baseY = enemy.yPx;
                        if (baseY < stopY) {
                            baseY = Math.min(stopY, baseY + baseDy);
                        }
                        tentativeY = baseY + pushDy;
                        if (tentativeY + enemy.sizePx >= playerTopY) {
                            enemy.yPx = playerTopY - enemy.sizePx;
                            enemy.inRange = true;
                            if (!enemy.hasEnteredMeleeQueue) {
                                enemy.hasEnteredMeleeQueue = true;
                                data.battle.meleeQueue.push(enemy.id);
                            }
                        } else {
                            enemy.yPx = tentativeY;
                            enemy.inRange = false;
                        }
                        enemy.rangedReady = enemy.inRange || (enemy.yPx >= stopY);
                        if (!wasReady && enemy.rangedReady) {
                            enemy.attackTimerMs = enemy.attackCooldownMs * 2;
                        }
                    } else {
                        const below = laneEnemies[j + 1];
                        const maxY = below.yPx - enemy.sizePx;
                        if (tentativeY > maxY) {
                            tentativeY = maxY;
                        }
                        enemy.yPx = tentativeY;
                        enemy.inRange = false;
                        enemy.rangedReady = false;
                    }
                    continue;
                }
                if (j === laneEnemies.length - 1) {
                    if (tentativeY + enemy.sizePx >= playerTopY) {
                        enemy.yPx = playerTopY - enemy.sizePx;
                        enemy.inRange = true;
                        if (!enemy.hasEnteredMeleeQueue) {
                            enemy.hasEnteredMeleeQueue = true;
                            data.battle.meleeQueue.push(enemy.id);
                        }
                    } else {
                        enemy.yPx = tentativeY;
                        enemy.inRange = false;
                    }
                } else {
                    const below = laneEnemies[j + 1];
                    const maxY = below.yPx - enemy.sizePx;
                    const blockedByRanged = below.enemyType === "ranged" && !below.inRange && tentativeY > maxY;
                    if (tentativeY > maxY) {
                        tentativeY = maxY;
                    }
                    enemy.yPx = tentativeY;
                    enemy.inRange = false;
                    if (blockedByRanged) {
                        enemy.blockedByRangedMs = (enemy.blockedByRangedMs || 0) + tickMs;
                        if (enemy.blockedByRangedMs >= 500) {
                            if (!engine.tryMeleeLaneShift(enemy)) {
                                enemy.blockedByRangedMs = 0;
                            }
                        }
                    } else {
                        enemy.blockedByRangedMs = 0;
                    }
                }
            }
        }
        if ((data.progress.currentClassKey || "none") === "hunter" && (data.battle.classRetreatMs || 0) > 0) {
            const spd = data.battle.levelState.levelSpd || 0;
            const retreatRate = (gameData.battle.enemyTravelSpeedPxPerSecond + gameData.battle.idlePushBonusPxPerSecond) * (1 + (spd * 0.1));
            const retreatDy = retreatRate * deltaSeconds;
            for (let i = 0; i < data.battle.enemies.length; i++) {
                const enemy = data.battle.enemies[i];
                if (!enemy.alive) continue;
                enemy.yPx = Math.max(-enemy.sizePx, enemy.yPx - retreatDy);
                if (enemy.yPx + enemy.sizePx < playerTopY) {
                    enemy.inRange = false;
                    if (enemy.enemyType === "ranged") {
                        enemy.rangedReady = false;
                    }
                }
            }
        }
    },
    updateTargeting: function() {
        const nextQueue = [];
        for (let i = 0; i < data.battle.meleeQueue.length; i++) {
            const queued = engine.findEnemyById(data.battle.meleeQueue[i]);
            if (queued && queued.alive && queued.inRange) {
                nextQueue.push(queued.id);
            }
        }
        data.battle.meleeQueue = nextQueue;
        if (data.battle.activeTargetId !== null) {
            const existingTarget = engine.findEnemyById(data.battle.activeTargetId);
            if (existingTarget && existingTarget.alive && existingTarget.inRange) {
                return;
            }
            data.battle.activeTargetId = null;
        }
        for (let i = 0; i < data.battle.meleeQueue.length; i++) {
            const enemyId = data.battle.meleeQueue[i];
            const candidate = engine.findEnemyById(enemyId);
            if (candidate && candidate.alive) {
                data.battle.activeTargetId = candidate.id;
                return;
            }
        }
    },
    getAlacrityCooldownReductionMs: function() {
        const s = data.progress.skills.alacrity;
        if (!s || !skills.isSkillUnlocked("alacrity")) {
            return 0;
        }
        const cap = s.maxLevel !== undefined ? s.maxLevel : 1000;
        return Math.min(s.level, cap);
    },
    getEffectiveMeleeCooldownMs: function() {
        return Math.max(400, 2000 - (engine.getAlacrityCooldownReductionMs() * 10));
    },
    getEffectiveRangedCooldownMs: function() {
        return Math.max(800, 4000 - (engine.getAlacrityCooldownReductionMs() * 20));
    },
    getUnlockedSkillLevel: function(skillKey) {
        if (!skills.isSkillUnlocked(skillKey)) {
            return 0;
        }
        const s = data.progress.skills[skillKey];
        return s ? (s.level || 0) : 0;
    },
    getMeleeRechargeMultiplier: function() {
        const prep = data.progress.skills.preparation;
        const prepLv = prep ? prep.level : 0;
        if (engine.anyEnemyInMeleeRange()) {
            return 1;
        }
        let mult = 1 + (0.02 * prepLv);
        if ((data.progress.currentClassKey || "none") === "rogue" && (data.battle.rogueFlurryMs || 0) > 0) {
            const spd = data.battle.levelState.levelSpd || 0;
            mult *= (1 + (spd * 0.1));
        }
        return mult;
    },
    syncPlayerCooldownFields: function() {
        const p = data.battle.player;
        p.attackCooldownMs = engine.getEffectiveMeleeCooldownMs();
        p.rangedAttackCooldownMs = engine.getEffectiveRangedCooldownMs();
    },
    updateFortitudeWaveTracking: function() {
        if (data.battle.state !== "running") {
            return;
        }
        const map = initialize.getCurrentMapDefinition();
        if (!map || !map.zones) return;
        let primaryName = null;
        for (let i = 0; i < map.zones.length; i++) {
            if (engine.getRemainingEnemiesForZone(i) <= 0) {
                continue;
            }
            primaryName = map.zones[i].name;
            break;
        }
        const prev = data.battle.prevZoneNameForFortitude;
        if (prev !== null && primaryName !== null && prev !== primaryName) {
            engine.onSkillTrigger("fortitude", 1);
        }
        data.battle.prevZoneNameForFortitude = primaryName;
    },
    updateRecoveryEachSecond: function(tickMs) {
        if (data.battle.recoverySecondAccMs === undefined) {
            data.battle.recoverySecondAccMs = 0;
        }
        data.battle.recoverySecondAccMs += tickMs;
        while (data.battle.recoverySecondAccMs >= 1000) {
            data.battle.recoverySecondAccMs -= 1000;
            const recLv = engine.getUnlockedSkillLevel("recovery");
            if (recLv > 0) {
                const p = data.battle.player;
                p.hp = Math.min(p.maxHp, p.hp + recLv * 0.25);
            }
            engine.onSkillTrigger("recovery", 1);
        }
    },
    updatePassiveSkillExp: function(tickMs) {
        const sec = tickMs / 1000;
        if (!engine.anyEnemyInMeleeRange()) {
            engine.onSkillTrigger("preparation", sec);
        }
        let inMelee = 0;
        for (let i = 0; i < data.battle.enemies.length; i++) {
            const e = data.battle.enemies[i];
            if (e.alive && e.inRange) {
                inMelee++;
            }
        }
        if (inMelee > 1) {
            engine.onSkillTrigger("adrenaline", (inMelee - 1) * sec);
        }
        const cls = data.progress.currentClassKey || "none";
        if (cls === "rogue") {
            engine.addClassBarProgress("B", 100 * sec);
        } else if (cls === "hunter") {
            engine.addClassBarProgress("B", 50 * inMelee * sec);
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
        if (data.battle.rogueDashActive && engine.anyEnemyInMeleeRange()) {
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
        p.attackTimerMs -= tickMs * engine.getMeleeRechargeMultiplier();
        if (p.attackTimerMs > 0) {
            return;
        }
        if (data.battle.activeTargetId === null) {
            p.attackTimerMs = 0;
            return;
        }
        const target = engine.findEnemyById(data.battle.activeTargetId);
        if (!target || !target.alive || !target.inRange) {
            p.attackTimerMs = 0;
            return;
        }
        engine.enqueueMeleeLineFx(target);
        if ((data.battle.mode || "combat") === "foraging") {
            const staminaCost = target.staminaCost || 1;
            if (data.battle.player.hp <= 0 || data.battle.player.hp < staminaCost) {
                data.battle.player.hp = 0;
                return;
            }
            data.battle.player.hp = Math.max(0, data.battle.player.hp - staminaCost);
            let harvestDamage = data.battle.player.attackDamage;
            const techLv = skills.isSkillUnlocked("technique") && data.progress.skills.technique ? (data.progress.skills.technique.level || 0) : 0;
            harvestDamage += techLv;
            if (!target.firstHitTaken) {
                const planningLv = skills.isSkillUnlocked("planning") && data.progress.skills.planning ? (data.progress.skills.planning.level || 0) : 0;
                harvestDamage *= (1 + (planningLv * 0.1));
                target.firstHitTaken = true;
            }
            target.hp -= Math.max(1, Math.round(harvestDamage));
            p.attackTimerMs = engine.getEffectiveMeleeCooldownMs() + Math.min(0, p.attackTimerMs);
            engine.onSkillTrigger("technique", 1);
            if (target.hp <= 0) {
                target.hp = 0;
                target.alive = false;
                data.battle.activeTargetId = null;
                engine.removeEnemyFromMeleeQueue(target.id);
                engine.onEnemyKilled(target);
            }
            return;
        }
        let meleeDamage = data.battle.player.attackDamage;
        const executeLv = engine.getUnlockedSkillLevel("execute");
        if (executeLv > 0 && target.hp <= (target.maxHp * 0.5)) {
            meleeDamage *= 1 + (executeLv * 0.05);
            engine.onSkillTrigger("execute", 1);
        }
        const sneakLv = engine.getUnlockedSkillLevel("sneak_attack");
        const priorHits = target.timesHitByPlayer || 0;
        if (sneakLv > 0 && priorHits === 0) {
            meleeDamage *= 1 + (sneakLv * 0.1);
        }
        const exploitLv = engine.getUnlockedSkillLevel("exploit");
        const prevTarget = data.battle.lastPlayerHitEnemyId || 0;
        const streak = (prevTarget === target.id) ? ((data.battle.lastPlayerHitStreak || 0) + 1) : 1;
        if (exploitLv > 0 && streak >= 2) {
            meleeDamage += (streak - 1) * exploitLv;
        }
        let isPowerStrike = false;
        if (cls === "warrior" && (data.battle.classPowerA || 0) >= 1000) {
            data.battle.classPowerA -= 1000;
            meleeDamage *= 2;
            isPowerStrike = true;
        }
        if (cls === "rogue" && (data.battle.classPowerB || 0) >= 1000) {
            data.battle.classPowerB -= 1000;
            data.battle.rogueFlurryMs = 2000;
        }
        meleeDamage = Math.max(1, Math.round(meleeDamage));
        target.hp -= meleeDamage;
        data.battle.lastPlayerHitEnemyId = target.id;
        data.battle.lastPlayerHitStreak = streak;
        target.timesHitByPlayer = priorHits + 1;
        if (sneakLv > 0 && priorHits === 0) {
            engine.onSkillTrigger("sneak_attack", 1);
        }
        if (exploitLv > 0 && priorHits > 0) {
            engine.onSkillTrigger("exploit", 1);
        }
        const cd = engine.getEffectiveMeleeCooldownMs();
        p.attackTimerMs = cd + Math.min(0, p.attackTimerMs);
        if (!isPowerStrike) {
            if (cls === "warrior") engine.addClassBarProgress("A", 100);
            if (cls === "hunter") engine.addClassBarProgress("A", 100);
        } else {
            engine.onSkillTrigger("cleave", 1);
            engine.applyWarriorCleave(target, meleeDamage);
        }
        engine.onSkillTrigger("finesse", 1);
        engine.onSkillTrigger("alacrity", 1);
        if (target.hp <= 0) {
            target.hp = 0;
            target.alive = false;
            data.battle.activeTargetId = null;
            engine.removeEnemyFromMeleeQueue(target.id);
            engine.onEnemyKilled(target);
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
            zones.push({
                index: i,
                name: z.name,
                remainingSpawnMs: Math.max(0, lastSpawnT - elapsed),
                difficulty: (map.baseDifficulty || 1) * cr.ratio * tierMult,
                remainingEnemies: rem,
                gold: engine.goldAwardFromEnemyGain(cr.perEnemyGain),
                exp: engine.expAwardFromEnemyExpBase(cr.expBasePerEnemy)
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
    updateEnemyAttacks: function(tickMs) {
        for (let i = 0; i < data.battle.enemies.length; i++) {
            const enemy = data.battle.enemies[i];
            const canAttack = enemy.enemyType === "ranged" ? (!!enemy.rangedReady || !!enemy.inRange) : !!enemy.inRange;
            if (!enemy.alive || !canAttack) {
                continue;
            }
            enemy.attackTimerMs -= tickMs;
            if (enemy.attackTimerMs <= 0) {
                const enemyCd = enemy.enemyType === "ranged" ? (enemy.attackCooldownMs * 2) : enemy.attackCooldownMs;
                enemy.attackTimerMs += enemyCd;
                if (enemy.enemyType === "ranged") {
                    engine.pushEnemyRangedLineFx(enemy);
                }
                const endLv = engine.getUnlockedSkillLevel("endurance");
                const dmgMultiplier = 1 / (1 + (endLv * 0.05));
                let incoming = enemy.attackDamage * dmgMultiplier;
                const armorFlat = engine.getUnlockedSkillLevel("toughness_warrior") * 0.25;
                incoming = Math.max(0, incoming - armorFlat);
                if ((data.progress.currentClassKey || "none") === "warrior" && (data.battle.classPowerB || 0) >= 1000) {
                    data.battle.classPowerB -= 1000;
                    incoming *= 0.5;
                    engine.onSkillTrigger("second_wind", 1);
                    const secondWindHeal = engine.getUnlockedSkillLevel("second_wind");
                    if (secondWindHeal > 0) {
                        data.battle.player.hp = Math.min(data.battle.player.maxHp, data.battle.player.hp + secondWindHeal);
                    }
                }
                if (incoming > 0 && (data.progress.currentClassKey || "none") === "warrior" && enemy.enemyType !== "ranged") {
                    engine.addClassBarProgress("B", 200);
                    const thorns = engine.getUnlockedSkillLevel("thorns");
                    if (thorns > 0) {
                        enemy.hp -= thorns;
                    }
                }
                data.battle.player.hp -= incoming;
                engine.onSkillTrigger("endurance", 1);
                engine.onSkillTrigger("toughness_warrior", enemy.enemyType === "ranged" ? 0 : 1);
                engine.onSkillTrigger("thorns", (incoming > 0 && enemy.enemyType !== "ranged") ? 1 : 0);
                if (data.battle.player.hp < 0) {
                    data.battle.player.hp = 0;
                }
                if (enemy.hp <= 0) {
                    enemy.hp = 0;
                    enemy.alive = false;
                    if (data.battle.activeTargetId === enemy.id) {
                        data.battle.activeTargetId = null;
                    }
                    engine.removeEnemyFromMeleeQueue(enemy.id);
                    engine.onEnemyKilled(enemy);
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
                data.battle.enemyPool.availableIds.push(data.battle.enemies[i].id);
                delete data.battle.enemyPool.inUseIds[data.battle.enemies[i].id];
            }
        }
        data.battle.enemies = survivors;
    },
    checkMapCompletion: function() {
        if (data.battle.state !== "running") {
            return;
        }
        if ((data.battle.mode || "combat") === "foraging") {
            const st = engine.getMapClearState(data.progress.currentMapKey);
            if ((st.activeMs || 0) <= 0) {
                engine.saveRunHistoryIfNeeded();
                data.battle.state = "completed";
                data.gameSettings.stop = true;
            }
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
    onEnemyKilled: function(enemy) {
        const chapel = data.progress.base && data.progress.base.chapel;
        const growthUnlocked = !!(chapel && chapel.growthBlessingUnlocked);
        if ((data.battle.mode || "combat") === "foraging") {
            const res = data.progress.base && data.progress.base.resources;
            if (res) {
                const key = enemy.rewardResource || "logs";
                const amount = Math.ceil((enemy.gain || 1) * (initialize.getCurrentMapDefinition().baseDifficulty || 1));
                if (res[key] === undefined) {
                    res[key] = 0;
                }
                res[key] += amount;
            }
            if (growthUnlocked) {
                data.battle.levelState.exp += (enemy.expBase !== undefined ? enemy.expBase : 1);
            }
            data.battle.enemiesKilled++;
            engine.onSkillTrigger("quick_rest", 1);
            const qr = skills.isSkillUnlocked("quick_rest") && data.progress.skills.quick_rest ? (data.progress.skills.quick_rest.level || 0) : 0;
            if (qr > 0) {
                data.battle.player.hp = Math.min(data.battle.player.maxHp, data.battle.player.hp + (qr * 0.25));
            }
            if (growthUnlocked) {
                engine.resolveLevelUps();
            }
            return;
        }
        const gain = enemy.gain || 1;
        const expBase = enemy.expBase !== undefined ? enemy.expBase : 1;
        const expGain = engine.expAwardFromEnemyExpBase(expBase);
        const goldGain = engine.goldAwardFromEnemyGain(gain);
        data.progress.gold += goldGain;
        if (growthUnlocked) {
            data.battle.levelState.exp += expGain;
        }
        data.battle.enemiesKilled++;
        engine.addMapClearProgressForKill(data.progress.currentMapKey);
        engine.onSkillTrigger("wisdom", 1);
        engine.onSkillTrigger("greed", 1);
        engine.onSkillTrigger("scavenger", Math.sqrt(Math.max(0, goldGain)));
        if (data.battle.state === "running") {
            engine.updateCurrentZoneInfo();
        }
        if ((data.progress.currentClassKey || "none") === "rogue") {
            engine.addClassBarProgress("A", 300);
        }
        if (growthUnlocked) {
            engine.resolveLevelUps();
        }
    },
    /** Matches `onEnemyKilled`: wisdom scales exp from zone `expBase`. */
    expAwardFromEnemyExpBase: function(expBase) {
        const wisdomLevel = data.progress.skills.wisdom ? data.progress.skills.wisdom.level : 0;
        const b = expBase !== undefined ? expBase : 1;
        return b * Math.pow(1.1, wisdomLevel);
    },
    /** Matches `onEnemyKilled`: scavenger flat + greedy gold multiplier over stored zone gain. */
    goldAwardFromEnemyGain: function(storedGain) {
        const greedLevel = data.progress.skills.greed ? data.progress.skills.greed.level : 0;
        const scavLevel = data.progress.skills.scavenger ? data.progress.skills.scavenger.level : 0;
        const gain = storedGain !== undefined ? storedGain : 1;
        const baseGoldPart = gain + scavLevel;
        return baseGoldPart * Math.pow(1.05, greedLevel);
    },
    resolveLevelUps: function() {
        const chapel = data.progress.base && data.progress.base.chapel;
        const growthUnlocked = !!(chapel && chapel.growthBlessingUnlocked);
        const plannedGrowthUnlocked = !!(chapel && chapel.plannedGrowthBlessingUnlocked);
        if (!growthUnlocked) {
            return;
        }
        while (data.battle.levelState.exp >= data.battle.levelState.expToLevel) {
            data.battle.levelState.exp -= data.battle.levelState.expToLevel;
            data.battle.levelState.level++;
            const cls = initialize.getCurrentClassDef();
            data.battle.levelState.levelStr += cls.perLevel.str || 0;
            data.battle.levelState.levelCon += cls.perLevel.con || 0;
            data.battle.levelState.levelSpd += cls.perLevel.spd || 0;
            data.battle.levelState.expToLevel = Math.floor(data.battle.levelState.expToLevel * 1.35);
            if (plannedGrowthUnlocked) {
                const nextLevel = data.battle.levelState.level;
                const planned = engine.getPlanEntryForLevel(nextLevel);
                if (planned) {
                    engine.applyAttributePoint(planned.attribute, false);
                } else {
                    data.battle.levelState.unassignedPoints++;
                }
                const discLv = data.progress.skills.discipline ? data.progress.skills.discipline.level : 0;
                data.battle.levelState.unassignedPoints += discLv;
                engine.onSkillTrigger("discipline", 1);
            }
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
    anyEnemyInMeleeRange: function() {
        for (let i = 0; i < data.battle.enemies.length; i++) {
            const e = data.battle.enemies[i];
            if (e.alive && e.inRange) {
                return true;
            }
        }
        return false;
    },
    anyEnemyInPlayerRange: function() {
        const rangedOn = !!(data.progress.rangedAttackEnabled && data.progress.base && data.progress.base.workshop && data.progress.base.workshop.bowBuilt);
        for (let i = 0; i < data.battle.enemies.length; i++) {
            const e = data.battle.enemies[i];
            if (!e.alive) {
                continue;
            }
            if (e.inRange) {
                return true;
            }
            if (rangedOn && engine.enemyIntersectsBattlefield(e)) {
                return true;
            }
        }
        return false;
    },
    anyEnemyVisible: function() {
        for (let i = 0; i < data.battle.enemies.length; i++) {
            const e = data.battle.enemies[i];
            if (e.alive && engine.enemyIntersectsBattlefield(e)) {
                return true;
            }
        }
        return false;
    },
    meleeAttackReady: function() {
        return data.battle.player.attackTimerMs <= 0;
    },
    idleAutoPhase: function() {
        return !engine.anyEnemyInPlayerRange() && engine.meleeAttackReady();
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
    getEnemyPushBonusPxPerSecond: function() {
        if (engine.anyEnemyInPlayerRange() || engine.countAliveEnemies() === 0) {
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
            if (clearState.pct >= 100 && (clearState.activeMs || 0) <= 0) {
                clearState.activeMs = 120000;
            }
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
        data.battle.meleeQueue = [];
        data.battle.activeTargetId = null;
        data.battle.player.attackTimerMs = 0;
        data.battle.player.rangedAttackTimerMs = 0;
        data.battle.prevZoneNameForFortitude = null;
    },
    /** True if the enemy token overlaps the battlefield clip rect (may be partially outside); used for draw and range checks while simulating all enemies. */
    enemyIntersectsBattlefield: function(enemy) {
        const lm = engine.getBattleLaneMetrics();
        const bw = lm.battleWidth;
        const bh = viewData.layout.battlefieldHeightPx || gameData.battle.battlefieldHeightPx || 500;
        const cx = lm.inset + (enemy.lane + 0.5) * lm.laneWidth;
        const half = enemy.sizePx / 2;
        const left = cx - half;
        const right = cx + half;
        const top = enemy.yPx;
        const bottom = enemy.yPx + enemy.sizePx;
        const horizOk = right > 0 && left < bw;
        const vertOk = bottom > 0 && top < bh;
        return horizOk && vertOk;
    },
    getRangedDamageTarget: function() {
        let best = null;
        let bestBottom = -Infinity;
        for (let i = 0; i < data.battle.enemies.length; i++) {
            const e = data.battle.enemies[i];
            if (!e.alive || !engine.enemyIntersectsBattlefield(e)) {
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
    pushEnemyRangedLineFx: function(attacker) {
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
            kind: "enemy_ranged"
        });
    },
    enqueueMeleeLineFx: function(target) {
        engine.pushAttackLineFx(target, "melee");
    },
    enqueueRangedLineFx: function(target) {
        engine.pushAttackLineFx(target, "ranged");
    },
    updateRangedAttack: function(tickMs) {
        if (data.battle.state !== "running") {
            return;
        }
        if (!engine.idleAutoPhase() || engine.countAliveEnemies() === 0) {
            return;
        }
        if (!(data.progress.rangedAttackEnabled && data.progress.base && data.progress.base.workshop && data.progress.base.workshop.bowBuilt)) {
            return;
        }
        if ((data.progress.currentClassKey || "none") === "rogue") {
            return;
        }
        const p = data.battle.player;
        p.rangedAttackTimerMs -= tickMs;
        if (p.rangedAttackTimerMs > 0) {
            return;
        }
        const rt = engine.getRangedDamageTarget();
        if (!rt) {
            p.rangedAttackTimerMs = 0;
            return;
        }
        const cls = data.progress.currentClassKey || "none";
        let rangedDamage = p.rangedAttackDamage;
        const sneakLv = engine.getUnlockedSkillLevel("sneak_attack");
        const priorHits = rt.timesHitByPlayer || 0;
        if (sneakLv > 0 && priorHits === 0) {
            rangedDamage *= 1 + (sneakLv * 0.1);
        }
        const exploitLv = engine.getUnlockedSkillLevel("exploit");
        const prevTarget = data.battle.lastPlayerHitEnemyId || 0;
        const streak = (prevTarget === rt.id) ? ((data.battle.lastPlayerHitStreak || 0) + 1) : 1;
        if (exploitLv > 0 && streak >= 2) {
            rangedDamage += (streak - 1) * exploitLv;
        }
        rangedDamage = Math.max(1, Math.round(rangedDamage));
        rt.hp -= rangedDamage;
        data.battle.lastPlayerHitEnemyId = rt.id;
        data.battle.lastPlayerHitStreak = streak;
        rt.timesHitByPlayer = priorHits + 1;
        if (sneakLv > 0 && priorHits === 0) {
            engine.onSkillTrigger("sneak_attack", 1);
        }
        if (exploitLv > 0 && priorHits > 0) {
            engine.onSkillTrigger("exploit", 1);
        }
        const impactLv = engine.getUnlockedSkillLevel("impact");
        if (impactLv > 0) {
            const battleHeight = viewData.layout.battlefieldHeightPx || 500;
            const playerTopY = viewData.layout.playerTopPx || (battleHeight - 65);
            const line300FtY = playerTopY - 300;
            const enemyBottomPast300 = (rt.yPx + rt.sizePx) >= line300FtY;
            if (enemyBottomPast300) {
                engine.onSkillTrigger("impact", 1);
            }
            const knockbackPx = rt.speedPxPerSecond * 0.1 * impactLv;
            rt.yPx = Math.max(-rt.sizePx, rt.yPx - knockbackPx);
            rt.inRange = false;
        }
        if (cls === "hunter" && (data.battle.classPowerA || 0) >= 1000) {
            const t2 = engine.getSecondRangedDamageTarget(rt.id);
            if (t2) {
                data.battle.classPowerA -= 1000;
                t2.hp -= rangedDamage;
                engine.enqueueRangedLineFx(t2);
                if (t2.hp <= 0) {
                    t2.hp = 0;
                    t2.alive = false;
                    if (data.battle.activeTargetId === t2.id) data.battle.activeTargetId = null;
                    engine.removeEnemyFromMeleeQueue(t2.id);
                    engine.onEnemyKilled(t2);
                    engine.onSkillTrigger("longshot", 1);
                }
            }
        }
        engine.enqueueRangedLineFx(rt);
        const rcd = engine.getEffectiveRangedCooldownMs();
        p.rangedAttackTimerMs = rcd + Math.min(0, p.rangedAttackTimerMs);
        if (cls === "hunter") {
            engine.addClassBarProgress("A", 200);
        }
        engine.onSkillTrigger("finesse", 1);
        engine.onSkillTrigger("alacrity", 1);
        if (rt.hp <= 0) {
            rt.hp = 0;
            rt.alive = false;
            if (data.battle.activeTargetId === rt.id) {
                data.battle.activeTargetId = null;
            }
            engine.removeEnemyFromMeleeQueue(rt.id);
            engine.onEnemyKilled(rt);
            engine.onSkillTrigger("longshot", 1);
        }
    },
    applyWarriorCleave: function(primaryTarget, dealtDamage) {
        const cleaveLv = engine.getUnlockedSkillLevel("cleave");
        if (cleaveLv <= 0 || dealtDamage <= 0) {
            return;
        }
        const splash = Math.max(1, Math.floor(dealtDamage * (cleaveLv * 0.1)));
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
            e.hp -= splash;
            if (e.hp <= 0) {
                e.hp = 0;
                e.alive = false;
                if (data.battle.activeTargetId === e.id) {
                    data.battle.activeTargetId = null;
                }
                engine.removeEnemyFromMeleeQueue(e.id);
                engine.onEnemyKilled(e);
            }
        }
    },
    removeEnemyFromMeleeQueue: function(enemyId) {
        const q = data.battle.meleeQueue;
        const next = [];
        for (let i = 0; i < q.length; i++) {
            if (q[i] !== enemyId) {
                next.push(q[i]);
            }
        }
        data.battle.meleeQueue = next;
    },
    getSecondRangedDamageTarget: function(excludeId) {
        for (let i = 0; i < data.battle.enemies.length; i++) {
            const e = data.battle.enemies[i];
            if (!e.alive || e.id === excludeId || !engine.enemyIntersectsBattlefield(e)) continue;
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
        const gain = skills.expGainForSkillTrigger(skill, amount);
        skill.exp += gain;
        skill.talent += gain * 0.1;
        skill.triggerCount += amount;
        while (skill.exp >= skill.expToLevel && (!skill.maxLevel || skill.level < skill.maxLevel)) {
            skill.exp -= skill.expToLevel;
            skill.level++;
            skill.expToLevel = Math.ceil(skill.expToLevel * 1.2);
            engine.onSkillLevelUp(skill);
        }
        while (skill.talent >= skill.talentToLevel) {
            skill.talent -= skill.talentToLevel;
            skill.talentLevel++;
            skill.talentToLevel = Math.ceil(skill.talentToLevel * 1.05);
        }
    },
    onSkillLevelUp: function(skill) {
        if (skill.affectedStat === "str") {
            data.battle.levelState.skillStrBonus++;
            initialize.calcPlayerStats(false);
        } else if (skill.affectedStat === "con") {
            data.battle.levelState.skillConBonus++;
            initialize.calcPlayerStats(false);
        } else if (skill.key === "alacrity") {
            engine.syncPlayerCooldownFields();
        } else if (skill.key === "fortitude") {
            initialize.calcPlayerStats(false);
        } else if (skill.key === "finesse" || skill.key === "longshot") {
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
        const runGold = Math.max(0, data.progress.gold - data.battle.runStartGold);
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
    findEnemyById: function(enemyId) {
        for (let i = 0; i < data.battle.enemies.length; i++) {
            if (data.battle.enemies[i].id === enemyId) {
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
            base.mine.progress += ((base.mine.assignedWorkers || 0) / 20) * sec;
            const madeOre = Math.floor(base.mine.progress);
            if (madeOre > 0) {
                base.mine.progress -= madeOre;
                res.ironOre += madeOre;
            }
        }

        if ((base.smith.assignedWorkers || 0) > 0 && res.ironOre > 0) {
            base.smith.progress += ((base.smith.assignedWorkers || 0) / 20) * sec;
            const potentialBars = Math.floor(base.smith.progress);
            if (potentialBars > 0) {
                const barsMade = Math.min(potentialBars, res.ironOre);
                if (barsMade > 0) {
                    base.smith.progress -= barsMade;
                    res.ironOre -= barsMade;
                    res.ironBar += barsMade;
                }
            }
        }

        if ((base.claypit.assignedWorkers || 0) > 0) {
            base.claypit.progress += ((base.claypit.assignedWorkers || 0) / 20) * sec;
            const madeStone = Math.floor(base.claypit.progress);
            if (madeStone > 0) {
                base.claypit.progress -= madeStone;
                res.stone += madeStone;
            }
        }

        if ((base.kiln.assignedWorkers || 0) > 0 && res.stone > 0) {
            base.kiln.progress += ((base.kiln.assignedWorkers || 0) / 20) * sec;
            const potentialBricks = Math.floor(base.kiln.progress);
            if (potentialBricks > 0) {
                const cutMade = Math.min(potentialBricks, res.stone);
                if (cutMade > 0) {
                    base.kiln.progress -= cutMade;
                    res.stone -= cutMade;
                    res.bricks += cutMade;
                }
            }
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
        const g = data.progress.skills.gossip;
        if (!g || !skills.isSkillUnlocked("gossip")) {
            return 1;
        }
        const lv = Math.min(99, g.level || 0);
        return 1 / (1 - (lv / 100));
    },
    getManualActionCooldownSpeedMultiplier: function() {
        const s = data.progress.skills.interfere;
        if (!s || !skills.isSkillUnlocked("interfere")) {
            return 1;
        }
        const lv = Math.min(99, s.level || 0);
        return 1 / (1 - (lv / 100));
    },
    getManualActionRewardMultiplier: function() {
        const s = data.progress.skills.interfere;
        if (!s || !skills.isSkillUnlocked("interfere")) {
            return 1;
        }
        return 1 + ((s.talentLevel || 0) * 0.1);
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
        progressRef.progress += (addSec / 20);
        cooldownRef.manualCooldownMs = 10000;
        engine.onSkillTrigger("interfere", 1);
        return true;
    },
    getTotalAssignedWorkers: function() {
        const b = data.progress.base;
        if (!b) return 0;
        return (b.mine.assignedWorkers || 0) + (b.smith.assignedWorkers || 0) + (b.claypit.assignedWorkers || 0) + (b.kiln.assignedWorkers || 0) + (b.lumbermill.assignedWorkers || 0) + (b.library.assignedWorkers || 0);
    },
    getTotalFoundWorkers: function() {
        const mw = data.progress.mapWorkersFound || {};
        const keys = Object.keys(mw);
        let total = 0;
        for (let i = 0; i < keys.length; i++) total += mw[keys[i]] || 0;
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
        const gossip = data.progress.skills.gossip;
        let bonus = 1;
        if (gossip && skills.isSkillUnlocked("gossip")) {
            bonus += (gossip.talentLevel || 0) * 0.1;
        }
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
        if (!lib || (lib.assignedWorkers || 0) <= 0) {
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
        createView.createSkillElements();
        createView.clearCacheQueue();
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
            if (!gi) {
                continue;
            }
            const r = Math.max(1, gi.rarity || 1);
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
