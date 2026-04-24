
let engine = {
    gameTick: function() {
        data.gameSettings.ticksForSeconds++;

        if (data.battle.state !== "running") {
            return;
        }

        const tickMs = 1000 / data.gameSettings.ticksPerSecond;
        data.battle.elapsedMs += tickMs;

        engine.spawnEnemiesFromData();
        engine.updateEnemyMovement(tickMs);
        engine.updateCurrentZoneInfo();
        engine.updateFortitudeWaveTracking();
        engine.updateRecoveryEachSecond(tickMs);
        engine.updatePassiveSkillExp(tickMs);
        engine.updateTargeting();
        engine.updatePlayerAttack(tickMs);
        engine.updateRangedAttack(tickMs);
        engine.updateEnemyAttacks(tickMs);
        engine.cleanupDeadEnemies();
        engine.checkMapCompletion();
        engine.checkLossCondition();
    },
    spawnEnemiesFromData: function() {
        while (data.battle.enemySpawnCursor < data.battle.spawnDataQueue.length) {
            const row = data.battle.spawnDataQueue[data.battle.enemySpawnCursor];
            if (row.spawnTimeMs > data.battle.elapsedMs) {
                break;
            }
            const enemyId = data.battle.enemyIdCounter;
            data.battle.enemyIdCounter++;
            const battleWidth = viewData.layout.battlefieldWidthPx || 500;
            const laneWidth = battleWidth / gameData.battle.laneCount;
            const enemySize = Math.floor(laneWidth * row.sizeLaneFill);
            const spdMult = 1 + ((data.battle.levelState && data.battle.levelState.levelSpd) || 0) * 0.1;
            data.battle.enemies.push({
                id: enemyId,
                lane: row.lane,
                spawnTimeMs: row.spawnTimeMs,
                yPx: -enemySize,
                prevYPx: -enemySize,
                sizePx: enemySize,
                hp: row.hp,
                maxHp: row.maxHp,
                speedPxPerSecond: row.speedPxPerSecond * spdMult,
                attackDamage: row.attackDamage,
                attackCooldownMs: row.attackCooldownMs,
                attackTimerMs: row.attackTimerMs,
                gain: row.gain,
                inRange: false,
                alive: true,
                hasEnteredMeleeQueue: false
            });
            if (data.battle.enemySpawnCursor === 0) {
                data.battle.enemies[data.battle.enemies.length - 1].gain = 1;
            }
            data.battle.enemySpawnCursor++;
        }
    },
    updateEnemyMovement: function(tickMs) {
        const battleHeight = viewData.layout.battlefieldHeightPx || 500;
        const playerTopY = viewData.layout.playerTopPx || (battleHeight - 65);
        const deltaSeconds = tickMs / 1000;
        const pushBonus = engine.getEnemyPushBonusPxPerSecond();
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
                    if (tentativeY > maxY) {
                        tentativeY = maxY;
                    }
                    enemy.yPx = tentativeY;
                    enemy.inRange = false;
                }
            }
        }
    },
    updateTargeting: function() {
        if (data.battle.activeTargetId !== null) {
            const existingTarget = engine.findEnemyById(data.battle.activeTargetId);
            if (existingTarget && existingTarget.alive) {
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
        if (!s) {
            return 0;
        }
        const cap = s.maxLevel !== undefined ? s.maxLevel : 1000;
        return Math.min(s.level, cap);
    },
    getEffectiveMeleeCooldownMs: function() {
        return Math.max(200, 2000 - engine.getAlacrityCooldownReductionMs());
    },
    getEffectiveRangedCooldownMs: function() {
        return Math.max(200, 4000 - engine.getAlacrityCooldownReductionMs());
    },
    getMeleeRechargeMultiplier: function() {
        const prep = data.progress.skills.preparation;
        const prepLv = prep ? prep.level : 0;
        if (engine.anyEnemyInMeleeRange()) {
            return 1;
        }
        return 1 + (0.02 * prepLv);
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
        const z = gameData.getZoneForTime(map, data.battle.elapsedMs);
        const name = z ? z.name : null;
        const prev = data.battle.prevZoneNameForFortitude;
        if (prev !== null && name !== null && prev !== name) {
            engine.onSkillTrigger("fortitude", 1);
        }
        data.battle.prevZoneNameForFortitude = name;
    },
    updateRecoveryEachSecond: function(tickMs) {
        if (data.battle.recoverySecondAccMs === undefined) {
            data.battle.recoverySecondAccMs = 0;
        }
        data.battle.recoverySecondAccMs += tickMs;
        while (data.battle.recoverySecondAccMs >= 1000) {
            data.battle.recoverySecondAccMs -= 1000;
            const rec = data.progress.skills.recovery;
            const recLv = rec ? rec.level : 0;
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
    },
    updatePlayerAttack: function(tickMs) {
        const p = data.battle.player;
        p.attackTimerMs -= tickMs * engine.getMeleeRechargeMultiplier();
        if (p.attackTimerMs > 0) {
            return;
        }
        if (data.battle.activeTargetId === null) {
            p.attackTimerMs = 0;
            return;
        }
        const target = engine.findEnemyById(data.battle.activeTargetId);
        if (!target || !target.alive) {
            p.attackTimerMs = 0;
            return;
        }
        engine.enqueueMeleeLineFx(target);
        target.hp -= data.battle.player.attackDamage;
        const cd = engine.getEffectiveMeleeCooldownMs();
        p.attackTimerMs = cd + Math.min(0, p.attackTimerMs);
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
        const map = initialize.getCurrentMapDefinition();
        data.battle.activeZones = gameData.getActiveZonesForTime(map, data.battle.elapsedMs);
    },
    updateEnemyAttacks: function(tickMs) {
        for (let i = 0; i < data.battle.enemies.length; i++) {
            const enemy = data.battle.enemies[i];
            if (!enemy.alive || !enemy.inRange) {
                continue;
            }
            enemy.attackTimerMs -= tickMs;
            if (enemy.attackTimerMs <= 0) {
                enemy.attackTimerMs += enemy.attackCooldownMs;
                const toughLv = data.progress.skills.toughness ? data.progress.skills.toughness.level : 0;
                const dmgMultiplier = 1 / (1 + (toughLv * 0.05));
                data.battle.player.hp -= enemy.attackDamage * dmgMultiplier;
                engine.onSkillTrigger("toughness", 1);
                if (data.battle.player.hp < 0) {
                    data.battle.player.hp = 0;
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
        const allSpawned = data.battle.enemySpawnCursor >= data.battle.spawnDataQueue.length;
        const noneAlive = data.battle.enemies.length === 0;
        if (!allSpawned || !noneAlive) {
            return;
        }
        const runGold = Math.max(0, data.progress.gold - data.battle.runStartGold);
        const bonus = runGold * 2;
        data.progress.gold += bonus;
        data.battle.completionBonusGold = bonus;
        data.battle.state = "completed";
        data.gameSettings.stop = true;
    },
    checkLossCondition: function() {
        if (data.battle.player.hp > 0) {
            return;
        }
        engine.saveRunHistoryIfNeeded();
        data.battle.state = "dead";
        data.gameSettings.stop = true;
    },
    onEnemyKilled: function(enemy) {
        const gain = enemy.gain || 1;
        const wisdomLevel = data.progress.skills.wisdom ? data.progress.skills.wisdom.level : 0;
        const greedLevel = data.progress.skills.greed ? data.progress.skills.greed.level : 0;
        const scavLevel = data.progress.skills.scavenger ? data.progress.skills.scavenger.level : 0;
        const expGain = gain * Math.pow(1.1, wisdomLevel);
        const baseGoldPart = (gain * gain) + scavLevel;
        const goldGain = baseGoldPart * Math.pow(1.05, greedLevel);
        data.progress.gold += goldGain;
        data.battle.levelState.exp += expGain;
        data.battle.enemiesKilled++;
        engine.onSkillTrigger("wisdom", 1);
        engine.onSkillTrigger("greed", 1);
        engine.onSkillTrigger("scavenger", Math.sqrt(Math.max(0, goldGain)));
        engine.resolveLevelUps();
    },
    resolveLevelUps: function() {
        while (data.battle.levelState.exp >= data.battle.levelState.expToLevel) {
            data.battle.levelState.exp -= data.battle.levelState.expToLevel;
            data.battle.levelState.level++;
            data.battle.levelState.levelStr++;
            data.battle.levelState.levelCon++;
            data.battle.levelState.expToLevel = Math.floor(data.battle.levelState.expToLevel * 1.35);
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
            initialize.applyConToPlayer(false);
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
        initialize.applyConToPlayer(false);
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
    meleeAttackReady: function() {
        return data.battle.player.attackTimerMs <= 0;
    },
    idleAutoPhase: function() {
        return !engine.anyEnemyInMeleeRange() && engine.meleeAttackReady();
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
        if (data.progress.rangedAttackEnabled) {
            return 0;
        }
        if (!engine.idleAutoPhase() || engine.countAliveEnemies() === 0) {
            return 0;
        }
        const spd = data.battle.levelState.levelSpd || 0;
        const spdMult = 1 + (spd * 0.1);
        return gameData.battle.idlePushBonusPxPerSecond * spdMult;
    },
    enemyFullyInsideBattlefield: function(enemy) {
        const bw = viewData.layout.battlefieldWidthPx || 500;
        const bh = viewData.layout.battlefieldHeightPx || 500;
        const laneWidth = bw / gameData.battle.laneCount;
        const cx = (enemy.lane + 0.5) * laneWidth;
        const half = enemy.sizePx / 2;
        const left = cx - half;
        const right = cx + half;
        const top = enemy.yPx;
        const bottom = enemy.yPx + enemy.sizePx;
        return left >= 0 && right <= bw && top >= 0 && bottom <= bh;
    },
    getRangedDamageTarget: function() {
        let best = null;
        let bestBottom = -Infinity;
        for (let i = 0; i < data.battle.enemies.length; i++) {
            const e = data.battle.enemies[i];
            if (!e.alive || !engine.enemyFullyInsideBattlefield(e)) {
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
        const bw = viewData.layout.battlefieldWidthPx || 500;
        const bh = viewData.layout.battlefieldHeightPx || 500;
        const pt = viewData.layout.playerTopPx || (bh - 65);
        const laneWidth = bw / gameData.battle.laneCount;
        const x1 = bw / 2;
        const y1 = pt + 24;
        const x2 = (target.lane + 0.5) * laneWidth;
        const y2 = target.yPx + (target.sizePx / 2);
        data.battle.lineFxQueue.push({
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
            kind: kind
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
        if (!data.progress.rangedAttackEnabled) {
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
        rt.hp -= p.rangedAttackDamage;
        engine.enqueueRangedLineFx(rt);
        const rcd = engine.getEffectiveRangedCooldownMs();
        p.rangedAttackTimerMs = rcd + Math.min(0, p.rangedAttackTimerMs);
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
    onSkillTrigger: function(skillKey, amount) {
        const skill = data.progress.skills[skillKey];
        if (!skill) {
            return;
        }
        if (skill.maxLevel !== undefined && skill.level >= skill.maxLevel) {
            return;
        }
        const gain = skills.expGainForSkillTrigger(skill, amount);
        skill.exp += gain;
        skill.talent += gain;
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
            initialize.applyConToPlayer(false);
        } else if (skill.affectedStat === "con") {
            data.battle.levelState.skillConBonus++;
            initialize.applyConToPlayer(false);
        } else if (skill.key === "alacrity") {
            engine.syncPlayerCooldownFields();
        } else if (skill.key === "fortitude") {
            initialize.applyConToPlayer(false);
        }
    },
    saveRunHistoryIfNeeded: function() {
        if (data.battle.historyLogged) {
            return;
        }
        const runSeconds = data.battle.elapsedMs / 1000;
        const runGold = Math.max(0, data.progress.gold - data.battle.runStartGold);
        const runGoldPerSecond = runSeconds > 0 ? runGold / runSeconds : 0;
        data.progress.runHistory.unshift({
            survivedSeconds: runSeconds,
            goldGained: runGold,
            goldPerSecond: runGoldPerSecond
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
    }
}
