
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
        if(data.gameSettings.stop) {
            return;
        }
        data.gameSettings.ticksForSeconds++;

        const tickMs = 1000 / data.gameSettings.ticksPerSecond;
        engine.runResortTick(tickMs);
        engine.runBattleTick(tickMs);
    },
    runBattleTick: function(tickMs) {
        if (data.battle.state !== "running") {
            return;
        }
        if (data.battle.cloneAliveMs === undefined) {
            data.battle.cloneAliveMs = data.battle.elapsedMs || 0;
        }
        const dt = tickMs * engine.getBattleTimeRateMultiplier();
        data.battle.cloneAliveMs += dt;
        if (engine.updateMapTransitionCountdown(tickMs)) {
            if (data.battle.endRunAfterCountdown || (data.battle.transitionCountdownMs || 0) <= 0) {
                return;
            }
        }
        data.battle.elapsedMs += dt;

        engine.spawnZonesForTime();
        engine.updateIntruderMovement(tickMs);
        engine.updateCurrentZoneInfo();
        skillEngine.applyTriggerTicks(tickMs);
        skillEngine.updateSelfAffirmationsEachSecond(tickMs);
        skillEngine.updateStagePresence(tickMs);
        skillEngine.updateSeetheEachSecond(tickMs);
        skillEngine.updateApplyTearDropsEachSecond(tickMs);
        skillEngine.updateBitterRivalryInRange(tickMs);
        skillEngine.updateNumbingCrowdsEachSecond(tickMs);
        skillEngine.updateSlowBurn(tickMs);
        skillEngine.updateRighteousRant(tickMs);
        skillEngine.updateHeckled(tickMs);
        skillEngine.updateReflection(tickMs);
        skillEngine.updateRubbernecking(tickMs);
        skillEngine.updateRunningTab(tickMs);
        skillEngine.updateCombatSkillPeriodics(tickMs);
        engine.updateClassEffects(tickMs);
        engine.updateTargeting();
        engine.updatePlayerAttack(tickMs);
        engine.updateSlapFx(tickMs);
        engine.updatePlayerFloats(tickMs);
        engine.updateBattleBuffs(tickMs);
        engine.updateSandalAttack(tickMs);
        engine.updateIntruderAttacks(tickMs);
        engine.updateIntruderAttackFx(tickMs);
        engine.cleanupDeadEnemies();
        engine.checkMapCompletion();
        engine.checkLossCondition();
    },
    getSandalIntruderStopY: function(playerTopY, battleHeight) {
        return playerTopY - 250;
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
        engine.ensureZoneSpawnSchedule();
        const spacingScale = engine.getCharismaWaveFactor();
        for (let i = 0; i < map.zones.length; i++) {
            if (data.battle.zoneSpawnedInCycle[i]) {
                continue;
            }
            if (data.battle.elapsedMs < data.battle.zoneSpawnAtMs[i]) {
                continue;
            }
            const z = map.zones[i];
            const rows = mapData.createZoneSpawnRows(map, i, tierMult);
            const laneSeedBase = (data.battle.generatedFromSeed || data.battle.seed || 1337);
            const laneRng = gameData.seededRandomFactory((laneSeedBase + ((i + 1) * 92821)) >>> 0);
            const lm = engine.getBattleLaneMetrics();
            const chaMult = engine.getCharismaMoveMultiplier();
            const travelSpd = gd.intruderTravelSpeedPxPerSecond;
            const spacingPx = rows.length > 1 ? Math.max(0, (z.distanceBetweenUnits || 0) * spacingScale) : 0;
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
                const maxAud = Math.max(1, Math.round(row.rawAud !== undefined ? row.rawAud : row.maxAud));
                const attackDamage = Math.max(1, Math.round(row.rawDamage !== undefined ? row.rawDamage : row.attackDamage));
                const yPx = -intruderSize - ri * spacingPx;
                data.battle.enemies.push({
                    id: intruderId,
                    lane: row.lane,
                    spawnTimeMs: data.battle.zoneSpawnAtMs[i],
                    zoneIndex: row.zoneIndex,
                    intruderType: row.intruderType || "scoundrel",
                    yPx: yPx,
                    prevYPx: yPx,
                    sizePx: intruderSize,
                    aud: maxAud,
                    maxAud: maxAud,
                    speedPxPerSecond: row.speedPxPerSecond * chaMult,
                    attackDamage: attackDamage,
                    attackCooldownMs: row.attackCooldownMs,
                    attackTimerMs: row.attackTimerMs,
                    gain: row.gain,
                    expBase: row.expBase !== undefined ? row.expBase : 1,
                    inRange: false,
                    lecherReady: false,
                    alive: true,
                    hasEnteredSlapQueue: false,
                    blockedByLecherMs: 0,
                    hasAttackedPlayer: false,
                    insultFatigueStacks: 0,
                    playerAttackCount: 0
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
    grantWorkersForMapStar: function(mapKey, amount) {
        if (!mapKey || !amount || amount <= 0) return;
        if (!data.progress.mapWorkersFound) data.progress.mapWorkersFound = {};
        if (data.progress.mapWorkersFound[mapKey] === undefined) data.progress.mapWorkersFound[mapKey] = 0;
        const maxWorkers = 6;
        const before = data.progress.mapWorkersFound[mapKey];
        const after = Math.min(maxWorkers, before + amount);
        data.progress.mapWorkersFound[mapKey] = after;
        const gained = after - before;
        if (gained <= 0) {
            return;
        }
        if (!data.progress.kitsune) {
            data.progress.kitsune = { total: 2 };
        }
        data.progress.kitsune.total = (data.progress.kitsune.total || 0) + gained;
    },
    ensureMapStarsEver: function() {
        if (!data.progress || data.progress.mapStarsEver) {
            return;
        }
        const ever = {};
        const current = data.progress.mapStars || {};
        const keys = Object.keys(current);
        for (let i = 0; i < keys.length; i++) {
            const stars = current[keys[i]] || {};
            ever[keys[i]] = {
                bronze: !!stars.bronze,
                silver: !!stars.silver,
                gold: !!stars.gold
            };
        }
        data.progress.mapStarsEver = ever;
    },
    rememberMapStarEver: function(mapKey, tier) {
        if (!mapKey || !tier) {
            return;
        }
        engine.ensureMapStarsEver();
        if (!data.progress.mapStarsEver[mapKey]) {
            data.progress.mapStarsEver[mapKey] = { bronze: false, silver: false, gold: false };
        }
        data.progress.mapStarsEver[mapKey][tier] = true;
    },
    hasMapStarEver: function(mapKey, tier) {
        engine.ensureMapStarsEver();
        const ever = data.progress.mapStarsEver[mapKey];
        return !!(ever && ever[tier]);
    },
    absorbMapStarsIntoEver: function() {
        engine.ensureMapStarsEver();
        const current = data.progress.mapStars || {};
        const keys = Object.keys(current);
        for (let i = 0; i < keys.length; i++) {
            const stars = current[keys[i]] || {};
            if (stars.bronze) {
                engine.rememberMapStarEver(keys[i], "bronze");
            }
            if (stars.silver) {
                engine.rememberMapStarEver(keys[i], "silver");
            }
            if (stars.gold) {
                engine.rememberMapStarEver(keys[i], "gold");
            }
        }
    },
    claimMapStar: function(mapKey, tier, workerAmount) {
        if (!mapKey || !tier) {
            return;
        }
        engine.ensureMapStarsEver();
        if (!data.progress.mapStars) {
            data.progress.mapStars = {};
        }
        if (!data.progress.mapStars[mapKey]) {
            data.progress.mapStars[mapKey] = { bronze: false, silver: false, gold: false };
        }
        const stars = data.progress.mapStars[mapKey];
        if (stars[tier]) {
            return;
        }
        const already = engine.hasMapStarEver(mapKey, tier);
        stars[tier] = true;
        if (!data.progress.stars) {
            data.progress.stars = { bronze: 0, silver: 0, gold: 0 };
        }
        data.progress.stars[tier] = (data.progress.stars[tier] || 0) + 1;
        engine.rememberMapStarEver(mapKey, tier);
        if (!already) {
            engine.grantWorkersForMapStar(mapKey, workerAmount);
        }
    },
    getCombatPrestigeMaxDivinityGain: function() {
        const talentTotal = (typeof skills !== "undefined" && skills.unlockedTalentLevelTotal)
            ? skills.unlockedTalentLevelTotal()
            : 0;
        return Math.floor(Math.pow(Math.max(0, talentTotal), 1.2));
    },
    /** Show a multiplier or a per-second rate without trailing zeros, including small decay rates. */
    formatPenaltyFigure: function(n) {
        if (!(n > 0)) {
            return "0";
        }
        const nearestInt = Math.round(n);
        if (Math.abs(n - nearestInt) < 1e-4) {
            return String(nearestInt);
        }
        let places = 4;
        if (n < 0.01) {
            places = Math.min(8, Math.ceil(-Math.log10(n)) + 1);
        }
        let text = roundNearestDecimals(n, places).toFixed(places);
        text = text.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
        return text || "0";
    },
    getLegendPenaltyExtra: function() {
        return Math.max(0, (data.progress && data.progress.legendPenaltyExtra) || 0);
    },
    getLegendManaCost: function() {
        const base = (typeof shrineCards !== "undefined" && shrineCards.legendManaCost) || 100000;
        return Math.round(base * (1 + engine.getLegendPenaltyExtra()));
    },
    getLegendPenaltyText: function() {
        const extra = engine.getLegendPenaltyExtra();
        const mult = 1 + extra;
        const rate = extra * 0.00003;
        return `Legend Penalty: x${engine.formatPenaltyFigure(mult)} mana cost, decreasing by ${engine.formatPenaltyFigure(rate)}/s. Increases by +2000% per prestige, and decays over time.`;
    },
    addLegendPenaltyForPrestige: function() {
        if (!data.progress) {
            return;
        }
        data.progress.legendPenaltyExtra = engine.getLegendPenaltyExtra() + 20;
    },
    /** Extra above ×1 falls by 0.003% of itself per second. */
    decayLegendPenalty: function(tickMs) {
        if (!data.progress || !(tickMs > 0)) {
            return;
        }
        const extra = data.progress.legendPenaltyExtra || 0;
        if (!(extra > 0)) {
            data.progress.legendPenaltyExtra = 0;
            return;
        }
        let next = extra * Math.exp(-0.00003 * (tickMs / 1000));
        if (!(next > 1e-6)) {
            next = 0;
        }
        data.progress.legendPenaltyExtra = next;
    },
    cancelOrbPrestigeWeaves: function() {
        const weaving = engine.getWeavingState();
        const upgradeKeys = ["expandOrb", "spinCurrents"];
        const active = weaving.active;
        if (active && active.scopeKey === "mage_tower" && upgradeKeys.indexOf(active.upgradeKey) >= 0) {
            weaving.active = null;
            engine.restoreOkamiAfterWeaveOrPath();
        }
        if (weaving.paused) {
            for (let i = 0; i < upgradeKeys.length; i++) {
                delete weaving.paused[engine.getWeavingJobKey("mage_tower", upgradeKeys[i])];
            }
        }
    },
    performCombatPrestige: function() {
        const cost = engine.getLegendManaCost();
        if (typeof resortData === "undefined" || !resortData.canAffordCost({ mana: cost })) {
            return false;
        }
        resortData.deductCost({ mana: cost });
        const starTotal = engine.getTotalEarnedStarsCount();
        engine.endCloneRun("dead", { skipManaBonus: true, skipRetry: true });
        if (!data.progress.divinity) {
            data.progress.divinity = { amount: 0, capacity: 0 };
        }
        data.progress.divinity.capacity = (data.progress.divinity.capacity || 0) + engine.getCombatPrestigeMaxDivinityGain();
        const written = Math.max(0, Math.floor(data.progress.legendsWritten || 0));
        const req = shrineCards.legendStarRequirement(written);
        if (starTotal >= req && shrineCards.hasNextLegend(written)) {
            data.progress.legendsWritten = written + 1;
        }
        engine.applyCombatPrestigeResets();
        if (typeof shrineCards !== "undefined" && shrineCards.applyFinishedLegends) {
            shrineCards.applyFinishedLegends();
        }
        if (typeof initialize !== "undefined" && initialize.calcPlayerStats) {
            initialize.calcPlayerStats(false);
        }
        engine.addLegendPenaltyForPrestige();
        if (typeof saving !== "undefined" && saving.save) {
            saving.save();
        }
        return true;
    },
    isKeptPrestigeWorkScope: function(scopeKey) {
        return scopeKey === "shrine" || scopeKey === "path" || (typeof scopeKey === "string" && scopeKey.indexOf("path_") === 0);
    },
    buildPrestigeHistoryEntry: function() {
        const progress = data.progress || {};
        engine.ensurePrestigeRunPacks();
        const runPacks = progress.prestigeRunPacks || {};
        let seconds = progress.secondsThisResort;
        if (typeof seconds !== "number") {
            seconds = (data.currentGameState && data.currentGameState.secondsPassed) || 0;
        }
        const okami = progress.okami || {};
        return {
            seconds: Math.max(0, Math.floor(seconds)),
            talentLevels: (typeof skills !== "undefined" && skills.unlockedTalentLevelTotal) ? skills.unlockedTalentLevelTotal() : 0,
            totalStars: engine.getTotalEarnedStarsCount(),
            okamiLevel: Math.floor(okami.level || 0),
            spiritLevels: engine.getSpiritTotalLevels(),
            milestonePacks: Math.max(0, Math.floor(runPacks.milestone || 0)),
            boughtPacks: Math.max(0, Math.floor(runPacks.bought || 0))
        };
    },
    applyCombatPrestigeResets: function() {
        const progress = data.progress;
        const base = (progress && progress.base) || {};
        const historyEntry = engine.buildPrestigeHistoryEntry();
        const prestigeHistory = (progress.prestigeHistory || []).slice();
        prestigeHistory.unshift(historyEntry);

        const shrine = base.shrine ? structuredClone(base.shrine) : null;
        if (shrine) {
            if (!shrine.milestones) {
                shrine.milestones = {};
            }
            const ms = shrine.milestones;
            ms.totalStarsClaimed = {};
            ms.okamiLevelClaimed = {};
            ms.depthReachedReq = 10;
            ms.orbLevelReq = 35;
            ms.maxManaReq = 200000;
            ms.totalGoldStarsReq = 1;
            ms.marketLevelReq = 4;
            ms.essenceMadeReq = 10000;
            shrine.selectedClassKey = "none";
            if (shrine.prestigeSession && shrine.prestigeSession.openPack) {
                shrine.prestigeSession.openPack.source = "carried";
            }
        }

        const fox = base.foxDen || {};
        const shrineUnlock = !!(fox.unlocks && fox.unlocks.shrine);
        const shrineSite = (!shrineUnlock && fox.constructionSites && fox.constructionSites.shrine)
            ? structuredClone(fox.constructionSites.shrine)
            : null;
        const keptJobs = {};
        const oldJobs = fox.upgradeGatherJobs || {};
        const oldJobKeys = Object.keys(oldJobs);
        for (let ji = 0; ji < oldJobKeys.length; ji++) {
            const job = oldJobs[oldJobKeys[ji]];
            if (job && engine.isKeptPrestigeWorkScope(job.scopeKey)) {
                keptJobs[oldJobKeys[ji]] = structuredClone(job);
            }
        }
        const keptQueue = [];
        const oldQueue = fox.jobQueue || [];
        for (let qi = 0; qi < oldQueue.length; qi++) {
            const key = oldQueue[qi];
            if (key === engine.getBuildingJobKey("shrine")) {
                if (shrineSite && shrineSite.status === "building") {
                    keptQueue.push(key);
                }
                continue;
            }
            const parsed = engine.parseUpgradeGatherJobKey(key);
            if (parsed && engine.isKeptPrestigeWorkScope(parsed.scopeKey) && keptJobs[key]) {
                keptQueue.push(key);
            }
        }
        const autoClearPathRocks = !!fox.autoClearPathRocks;
        const autoAddPathRailings = !!fox.autoAddPathRailings;
        const autoAddPathStairs = !!fox.autoAddPathStairs;
        const autoAddPathLanterns = !!fox.autoAddPathLanterns;

        const garden = base.garden || {};
        const pathMaking = !!garden.arrangementOfPathMakingUnlocked;
        const railingSafety = !!garden.arrangementOfRailingSafetyUnlocked;
        const stepBuilding = !!garden.arrangementOfStepBuildingUnlocked;
        const lanternPlacing = !!garden.arrangementOfLanternPlacingUnlocked;

        const pathSegments = base.pathSegments ? structuredClone(base.pathSegments) : null;
        const okami = progress.okami || {};
        const keptPathJob = engine.isPathSegmentUpgradeJob(okami.pathJob) ? structuredClone(okami.pathJob) : null;
        const keptPausedPath = {};
        const pausedPath = okami.pausedPathJobs || {};
        const pausedPathKeys = Object.keys(pausedPath);
        for (let pi = 0; pi < pausedPathKeys.length; pi++) {
            const pausedJob = pausedPath[pausedPathKeys[pi]];
            if (engine.isPathSegmentUpgradeJob(pausedJob)) {
                keptPausedPath[pausedPathKeys[pi]] = structuredClone(pausedJob);
            }
        }
        const isPathAssign = function(key) {
            return typeof key === "string" && key.indexOf("path_") === 0;
        };
        const assignedBuildingKey = isPathAssign(okami.assignedBuildingKey) ? okami.assignedBuildingKey : "";
        const lastAssignedBuildingKey = isPathAssign(okami.lastAssignedBuildingKey) ? okami.lastAssignedBuildingKey : "";
        const resumePath = okami.resumePathAfterWeaveSegmentIndex;

        const weaving = progress.weaving || {};
        let keptActive = null;
        if (weaving.active && engine.isKeptPrestigeWorkScope(weaving.active.scopeKey)) {
            keptActive = structuredClone(weaving.active);
        }
        const keptPaused = {};
        const pausedWeaves = weaving.paused;
        if (pausedWeaves && typeof pausedWeaves === "object" && !Array.isArray(pausedWeaves)) {
            if (pausedWeaves.scopeKey !== undefined && pausedWeaves.upgradeKey !== undefined) {
                if (engine.isKeptPrestigeWorkScope(pausedWeaves.scopeKey)) {
                    keptPaused[pausedWeaves.scopeKey + ":" + pausedWeaves.upgradeKey] = structuredClone(pausedWeaves);
                }
            } else {
                const weaveKeys = Object.keys(pausedWeaves);
                for (let wi = 0; wi < weaveKeys.length; wi++) {
                    const entry = pausedWeaves[weaveKeys[wi]];
                    if (entry && engine.isKeptPrestigeWorkScope(entry.scopeKey)) {
                        keptPaused[weaveKeys[wi]] = structuredClone(entry);
                    }
                }
            }
        }

        const tips = {};
        const oldSkills = progress.skills || {};
        const skillKeys = Object.keys(oldSkills);
        for (let si = 0; si < skillKeys.length; si++) {
            const sk = oldSkills[skillKeys[si]];
            const tipCount = (sk && sk.tips) || 0;
            if (tipCount > 0) {
                tips[skillKeys[si]] = tipCount;
            }
        }
        const oldLib = base.scrollArchives || {};
        const lockedSkillKeys = (oldLib.lockedSkillKeys || []).slice();
        const oldInscriptions = oldLib.inscriptions ? structuredClone(oldLib.inscriptions) : null;

        const legendsWritten = Math.max(0, Math.floor(progress.legendsWritten || 0));
        const legendPenaltyExtra = progress.legendPenaltyExtra || 0;
        const divinity = progress.divinity
            ? { amount: progress.divinity.amount || 0, capacity: progress.divinity.capacity || 0 }
            : { amount: 0, capacity: 50000 };
        const prevOptions = progress.options || {};
        const hideMaxed = prevOptions.hideMaxedUpgrades;
        const disableCompact = prevOptions.disableCompactLayout;
        const autoChoosePackCards = prevOptions.autoChoosePackCards;
        const bonusTime = (data.currentGameState && data.currentGameState.bonusTime) || 0;
        const secondsPlayedTotal = typeof progress.secondsPlayedTotal === "number" ? progress.secondsPlayedTotal : 0;

        data.progress = initials.progress();
        data.battle = initials.battle();
        data.battle.currentTab = "history";
        data.currentGameState = initials.currentGameState();
        data.currentGameState.bonusTime = bonusTime;
        initialize.rebuildFreshRun();

        if (hideMaxed !== undefined) {
            data.progress.options.hideMaxedUpgrades = !!hideMaxed;
        }
        if (disableCompact !== undefined) {
            data.progress.options.disableCompactLayout = !!disableCompact;
        }
        if (autoChoosePackCards !== undefined) {
            data.progress.options.autoChoosePackCards = !!autoChoosePackCards;
        }
        data.progress.legendsWritten = legendsWritten;
        data.progress.legendPenaltyExtra = legendPenaltyExtra;
        data.progress.divinity = divinity;
        data.progress.divinityCapReduced50k = true;
        data.progress.extraKitsuneApplied = 0;
        data.progress.prestigeHistory = prestigeHistory;
        data.progress.selectedHistorySubTab = "prestige";
        data.progress.secondsThisResort = 0;
        data.progress.secondsPlayedTotal = secondsPlayedTotal;
        data.progress.prestigeRunCards = { milestone: [], bought: [] };
        data.progress.prestigeRunPacks = { milestone: 0, bought: 0 };

        if (shrine) {
            data.progress.base.shrine = shrine;
        }
        const rh = data.progress.base.foxDen;
        if (rh) {
            if (!rh.unlocks) {
                rh.unlocks = {};
            }
            if (shrineUnlock) {
                rh.unlocks.shrine = true;
            }
            if (shrineSite) {
                if (!rh.constructionSites) {
                    rh.constructionSites = {};
                }
                rh.constructionSites.shrine = shrineSite;
            }
            const keptJobKeys = Object.keys(keptJobs);
            for (let kji = 0; kji < keptJobKeys.length; kji++) {
                rh.upgradeGatherJobs[keptJobKeys[kji]] = keptJobs[keptJobKeys[kji]];
            }
            if (!rh.jobQueue) {
                rh.jobQueue = [];
            }
            for (let kqi = 0; kqi < keptQueue.length; kqi++) {
                if (rh.jobQueue.indexOf(keptQueue[kqi]) < 0) {
                    rh.jobQueue.push(keptQueue[kqi]);
                }
            }
            rh.autoClearPathRocks = autoClearPathRocks;
            rh.autoAddPathRailings = autoAddPathRailings;
            rh.autoAddPathStairs = autoAddPathStairs;
            rh.autoAddPathLanterns = autoAddPathLanterns;
        }
        const newGarden = data.progress.base.garden;
        if (newGarden) {
            if (pathMaking) {
                newGarden.arrangementOfPathMakingUnlocked = true;
            }
            if (railingSafety) {
                newGarden.arrangementOfRailingSafetyUnlocked = true;
            }
            if (stepBuilding) {
                newGarden.arrangementOfStepBuildingUnlocked = true;
            }
            if (lanternPlacing) {
                newGarden.arrangementOfLanternPlacingUnlocked = true;
            }
        }
        if (pathSegments) {
            data.progress.base.pathSegments = pathSegments;
            initialize.initializePathSegments();
            engine.checkMapRevealTriggers();
        }
        const newOkami = engine.getOkami();
        newOkami.pausedPathJobs = keptPausedPath;
        if (keptPathJob) {
            newOkami.pathJob = keptPathJob;
            if (!keptPathJob.paused && keptPathJob.segmentIndex !== undefined && keptPathJob.segmentIndex !== null) {
                newOkami.assignedBuildingKey = engine.getPathSegmentAssignmentKey(keptPathJob.segmentIndex);
            }
        }
        if (!newOkami.assignedBuildingKey && assignedBuildingKey) {
            newOkami.assignedBuildingKey = assignedBuildingKey;
        }
        if (lastAssignedBuildingKey) {
            newOkami.lastAssignedBuildingKey = lastAssignedBuildingKey;
        }
        if (resumePath !== undefined && resumePath !== null) {
            newOkami.resumePathAfterWeaveSegmentIndex = resumePath;
        }
        data.progress.weaving = { active: keptActive, paused: keptPaused };

        const newSkills = data.progress.skills || {};
        const tipKeys = Object.keys(tips);
        for (let ti = 0; ti < tipKeys.length; ti++) {
            if (newSkills[tipKeys[ti]]) {
                newSkills[tipKeys[ti]].tips = tips[tipKeys[ti]];
            }
        }
        const newLib = data.progress.base.scrollArchives;
        if (newLib) {
            newLib.inscriptionMigrated = true;
            newLib.lockedSkillKeys = lockedSkillKeys;
            newLib.unlockedSkills = {};
            for (let li = 0; li < lockedSkillKeys.length; li++) {
                if (skills._byKey[lockedSkillKeys[li]]) {
                    newLib.unlockedSkills[lockedSkillKeys[li]] = true;
                }
            }
            if (oldInscriptions) {
                newLib.inscriptions = oldInscriptions;
            }
            engine.resetInscriptionsForPrestige(newLib);
        }

        engine.seedCarriedPackSources();
        initialize.initializeShrine();
        if (typeof shrineCards !== "undefined" && shrineCards.applyPrestigeStartBonuses) {
            shrineCards.applyPrestigeStartBonuses();
        }
        engine.grantEarthAffinitySpirit();
        const archives = data.progress.base && data.progress.base.scrollArchives;
        if (archives && (archives.researchesToChoose || 0) > 0 && !(archives.researchChoices && archives.researchChoices.length)) {
            engine.rollScrollArchivesResearchChoices();
        }

        data.battle.currentTab = "history";
        if (typeof events !== "undefined" && events.closeBaseBuildingInfo) {
            events.closeBaseBuildingInfo();
        }
        if (typeof events !== "undefined" && events.clearShrineMoveConfirm) {
            events.clearShrineMoveConfirm();
        }
        if (typeof createView !== "undefined" && createView.createSkillElements) {
            createView.createSkillElements();
            if (createView.clearCacheQueue) {
                createView.clearCacheQueue();
            }
        }
        engine._pathDomSig = [];
        if (typeof engine.syncResortPathDom === "function") {
            engine.syncResortPathDom();
        }
        if (typeof createView !== "undefined" && createView.showCurrentTab) {
            createView.showCurrentTab();
        }
        if (typeof view !== "undefined") {
            if (view.updateTabButtons) {
                view.updateTabButtons(data.battle.currentTab);
            }
            if (view.updatePathSegmentHighlight) {
                view.updatePathSegmentHighlight(null);
            }
            if (view.updateDirtRoadLayer) {
                view.updateDirtRoadLayer();
            }
            if (view.updateView) {
                view.updateView();
            }
            if (view.renderBattlefield) {
                view.renderBattlefield();
            }
        }
    },
    updateIntruderMovement: function(tickMs) {
        const battleHeight = viewData.layout.battlefieldHeightPx || 500;
        const playerTopY = viewData.layout.playerTopPx || (battleHeight - 65);
        const deltaSeconds = tickMs / 1000;
        const pushBonus = engine.getIntruderPushBonusPxPerSecond();
        const stackGap = gameData.battle.intruderStackGapPx || 0;
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
                        const maxY = below.yPx - intruder.sizePx - stackGap;
                        const baseDy = intruder.speedPxPerSecond * deltaSeconds;
                        const pushDy = pushBonus * deltaSeconds;
                        let baseY = intruder.yPx;
                        if (baseY < stopY) {
                            baseY = Math.min(stopY, baseY + baseDy);
                        }
                        let nextY = baseY + pushDy;
                        if (nextY > maxY) {
                            nextY = maxY;
                        }
                        const blockedByFront = (baseY + pushDy) > maxY && baseY < stopY;
                        if (nextY + intruder.sizePx >= playerTopY) {
                            intruder.yPx = Math.min(nextY, playerTopY - intruder.sizePx);
                            intruder.inRange = true;
                            if (!intruder.hasEnteredSlapQueue) {
                                intruder.hasEnteredSlapQueue = true;
                                data.battle.slapQueue.push(intruder.id);
                            }
                        } else {
                            intruder.yPx = nextY;
                            intruder.inRange = false;
                        }
                        intruder.lecherReady = intruder.inRange || (intruder.yPx >= stopY);
                        if (!wasReady && intruder.lecherReady) {
                            intruder.attackTimerMs = intruder.attackCooldownMs * 2;
                        }
                        if (blockedByFront) {
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
                    const maxY = below.yPx - intruder.sizePx - stackGap;
                    const blockedByFront = tentativeY > maxY;
                    if (tentativeY > maxY) {
                        tentativeY = maxY;
                    }
                    intruder.yPx = tentativeY;
                    intruder.inRange = false;
                    if (blockedByFront) {
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
        if ((data.progress.currentClassKey || "none") === "mock" && (data.battle.classRetreatMs || 0) > 0) {
            const retreatRate = (gameData.battle.intruderTravelSpeedPxPerSecond + gameData.battle.idlePushBonusPxPerSecond) * engine.getCharismaMoveMultiplier();
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
    getEffectiveSlapCooldownMs: function() {
        const cd = gameData.battle.cooldowns;
        const alacrity = skillEngine.getAlacrityCooldownReductionMs() * cd.alacritySlapReductionPerLevelMs;
        const gloves = engine.getMarketMysticalGlovesBought() * 100;
        return Math.max(cd.slapFloorMs, cd.slapBaseMs - alacrity - gloves);
    },
    getEffectiveSandalCooldownMs: function() {
        const cd = gameData.battle.cooldowns;
        return Math.max(cd.sandalFloorMs, cd.sandalBaseMs - (skillEngine.getAlacrityCooldownReductionMs() * cd.alacritySandalReductionPerLevelMs));
    },
    getSlapRechargeMultiplier: function() {
        const pEff = skills.getSkillEffect("preparation");
        const prepBonus = pEff.idleRechargeFraction || 0;
        let mult = 1;
        if (engine.anyIntruderInSlapRange()) {
            return mult;
        }
        mult *= (1 + prepBonus);
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
        const sec = tickMs / 1000;
        let inSlap = 0;
        for (let i = 0; i < data.battle.enemies.length; i++) {
            const e = data.battle.enemies[i];
            if (e.alive && e.inRange) {
                inSlap++;
            }
        }
        const cls = data.progress.currentClassKey || "none";
        if (cls === "scold") {
            engine.addClassBarProgress("B", 100 * sec);
        } else if (cls === "mock") {
            engine.addClassBarProgress("B", 50 * inSlap * sec);
        }
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
        if ((data.progress.currentClassKey || "none") === "mock" && (data.battle.classPowerB || 0) >= 1000 && (data.battle.classRetreatMs || 0) <= 0) {
            data.battle.classPowerB -= 1000;
            data.battle.classRetreatMs = 3000;
        }
    },
    updatePlayerAttack: function(tickMs) {
        const p = data.battle.player;
        const cls = data.progress.currentClassKey || "none";
        engine.maybeStartSlapWindup(tickMs);
        p.attackTimerMs -= tickMs * engine.getSlapRechargeMultiplier();
        if (p.attackTimerMs > 0) {
            return;
        }
        if (data.battle.activeTargetId === null) {
            p.attackTimerMs = 0;
            engine.cancelSlapWindupIfNeeded();
            return;
        }
        const target = engine.findIntruderById(data.battle.activeTargetId);
        if (!target || !target.alive || !target.inRange) {
            p.attackTimerMs = 0;
            engine.cancelSlapWindupIfNeeded();
            return;
        }
        let slapDamage = data.battle.player.attackDamage;
        const exEff = skills.getSkillEffect("execute");
        const executeFrac = exEff.lowAudBonusFraction || 0;
        const applyExecute = executeFrac > 0 && target.aud <= (target.maxAud * 0.5);
        const snEff = skills.getSkillEffect("sneak_attack");
        const sneakFrac = snEff.firstHitDamageBonusFraction || 0;
        const priorHits = target.timesHitByPlayer || 0;
        const xpEff = skills.getSkillEffect("exploit");
        const exploitStep = xpEff.flatDamagePerConsecutiveStep || 0;
        const prevTarget = data.battle.lastPlayerHitIntruderId || 0;
        const streak = (prevTarget === target.id) ? ((data.battle.lastPlayerHitStreak || 0) + 1) : 1;
        let exploitFlat = 0;
        if (exploitStep > 0 && streak >= 2) {
            exploitFlat = (streak - 1) * exploitStep;
        }
        let isPowerStrike = false;
        if (cls === "condescend" && (data.battle.classPowerA || 0) >= 1000) {
            data.battle.classPowerA -= 1000;
            isPowerStrike = true;
        }
        if (cls === "scold" && (data.battle.classPowerB || 0) >= 1000) {
            data.battle.classPowerB -= 1000;
            data.battle.scoldFlurryMs = 2000;
        }
        // ((base+cards)xdensity + Force + other flats) x Brutality x damage mults
        slapDamage = engine.applyCombatOutgoingDamage(slapDamage, target, {
            consumeFury: true,
            flatBonus: exploitFlat
        });
        if (applyExecute) {
            slapDamage *= 1 + executeFrac;
        }
        if (sneakFrac > 0 && priorHits === 0) {
            slapDamage *= 1 + sneakFrac;
        }
        if (isPowerStrike) {
            slapDamage *= 2;
        }
        slapDamage = Math.max(1, roundNearestDecimals(slapDamage, 1));
        slapDamage *= bonfire.getCombatDamageMultiplier();
        slapDamage = Math.max(1, roundNearestDecimals(slapDamage, 1));
        skillEngine.addCombatOutgoingHitSkillExp(target, priorHits);
        const audBeforeSlap = target.aud;
        target.aud -= slapDamage;
        engine.onSlapImpact(target, slapDamage);
        skills.fireTrigger("onAttackLogDamage", { damage: slapDamage });
        data.battle.lastPlayerHitIntruderId = target.id;
        data.battle.lastPlayerHitStreak = streak;
        target.timesHitByPlayer = priorHits + 1;
        if (priorHits === 0) {
            skills.fireTrigger("onFirstHit");
        }
        const cd = engine.cooldownAfterOutrageSpend(engine.getEffectiveSlapCooldownMs(), target);
        p.attackTimerMs = cd + Math.min(0, p.attackTimerMs);
        if (!isPowerStrike) {
            if (cls === "condescend") engine.addClassBarProgress("A", 100);
            if (cls === "mock") engine.addClassBarProgress("A", 100);
        } else {
            skills.fireTrigger("onPowerStrike");
            skillEngine.applyCondescendCleave(target, slapDamage);
        }
        skills.fireTrigger("onAttack");
        skills.fireTrigger("onSlap");
        const pickpocketBase = skills.getSkillEffect("pickpocket").attackCoins || 0;
        const pickpocketCoins = pickpocketBase * engine.intruderCoinMultiplier();
        if (pickpocketCoins > 0) {
            engine.grantBattleCoins(pickpocketCoins);
            engine.noteSkillExtraCoins("pickpocket", pickpocketCoins);
        }
        if (target.aud <= 0) {
            target.aud = 0;
            target.alive = false;
            data.battle.activeTargetId = null;
            engine.removeIntruderFromSlapQueue(target.id);
            engine.onIntruderKilled(target, {
                __OVERKILL__BoostKind: "slap",
                overkillDamage: Math.max(0, slapDamage - audBeforeSlap)
            });
        }
    },
    updateCurrentZoneInfo: function() {
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
            const scheduled = data.battle.zoneSpawnAtMs && data.battle.zoneSpawnAtMs[i];
            const lastSpawnT = scheduled !== undefined && scheduled !== null
                ? scheduled
                : mapData.getZoneLastSpawnTimeMs(z);
            let shardDropChance = 0;
            if (engine.isShardLootUnlocked()) {
                shardDropChance = Math.min(1, mapData.getZoneShardDropChance(map, i, data.battle.mapTier || 0));
            }
            zones.push({
                index: i,
                name: z.name,
                remainingSpawnMs: Math.max(0, lastSpawnT - elapsed),
                difficulty: (map.baseDifficulty || 1) * cr.ratio * (tierMult.combat || 1),
                remainingEnemies: rem,
                coins: engine.coinsAwardFromIntruderGain(cr.perIntruderGain),
                exp: engine.expDisplayFromIntruderExpBase(cr.expBasePerIntruder),
                shardDropChance: shardDropChance
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
                intruder.playerAttackCount = (intruder.playerAttackCount || 0) + 1;
                if (intruder.intruderType === "lecher") {
                    engine.pushIntruderSandalLineFx(intruder);
                    engine.spawnLeerGfx(intruder);
                } else if ((intruder.intruderType || "scoundrel") === "scoundrel") {
                    engine.spawnWinkGfx(intruder);
                }
                // Order: (1) Clout on raw, (2) flat (Insult Fatigue + Armor), (3) multipliers
                const rawIncoming = Math.max(0, intruder.attackDamage || 0);
                const atOrBelowHalfBeforeHit = engine.isPlayerAtOrBelowAudFraction(0.5);
                let incoming = engine.applyCloutToIncomingDamage(rawIncoming);
                const cloutEntry = battleBuffs.getState().byKey.clout;
                const cloutConsumed = cloutEntry ? (cloutEntry.lastNegation || 0) : 0;
                const beforeFatigue = incoming;
                incoming = skillEngine.applyInsultFatigueFlat(intruder, incoming, rawIncoming);
                const fatigueBlocked = Math.max(0, beforeFatigue - incoming);
                if (fatigueBlocked > 0) {
                    engine.noteBattleFlatBlock("insultFatigue", fatigueBlocked);
                }
                const armorEff = skills.getSkillEffect("toughness_condescend");
                const thickArmor = skills.getSkillEffect("thickSkin").armorFlat || 0;
                const toughnessArmor = armorEff.armorFlat || 0;
                const armorFlat = toughnessArmor + thickArmor;
                const armorBlocked = Math.min(armorFlat, Math.max(0, incoming));
                if (armorBlocked > 0 && armorFlat > 0) {
                    if (toughnessArmor > 0) {
                        engine.noteBattleFlatBlock("toughness_condescend", armorBlocked * toughnessArmor / armorFlat);
                    }
                    if (thickArmor > 0) {
                        engine.noteBattleFlatBlock("thickSkin", armorBlocked * thickArmor / armorFlat);
                    }
                }
                incoming = Math.max(0, incoming - armorFlat);
                const endEff = skills.getSkillEffect("aboveItAll");
                const dmgMultiplier = endEff.incomingDamageMultiplier !== undefined ? endEff.incomingDamageMultiplier : 1;
                incoming *= dmgMultiplier;
                if (atOrBelowHalfBeforeHit) {
                    const sulEff = skills.getSkillEffect("stiffUpperLip");
                    const sulMult = sulEff.incomingDamageMultiplier;
                    if (sulMult !== undefined) {
                        incoming *= sulMult;
                    }
                }
                incoming *= bonfire.getCombatDamageMultiplier();
                if ((data.progress.currentClassKey || "none") === "condescend" && (data.battle.classPowerB || 0) >= 1000) {
                    data.battle.classPowerB -= 1000;
                    incoming *= 0.5;
                    skills.fireTrigger("onBlock");
                    const swEff = skills.getSkillEffect("second_wind");
                    const secondWindHeal = swEff.blockHeal || 0;
                    if (secondWindHeal > 0) {
                        engine.grantPlayerCurrentAudGain(secondWindHeal * engine.getConfidenceMultiplier(), "second_wind");
                    }
                }
                incoming = engine.applyIncomingDamageBeforeClout(incoming);
                const audLost = Math.max(0, incoming);
                const shownIncoming = cloutConsumed + audLost;
                const damageApplied = shownIncoming > 0;
                if (damageApplied && (data.progress.currentClassKey || "none") === "condescend" && intruder.intruderType !== "lecher") {
                    engine.addClassBarProgress("B", 200);
                    const thEff = skills.getSkillEffect("thorns");
                    const thorns = thEff.retaliationDamage || 0;
                    if (thorns > 0) {
                        intruder.aud -= thorns;
                    }
                }
                const audBeforeHit = data.battle.player.aud;
                engine.spawnPlayerHurtFloat(intruder, shownIncoming);
                data.battle.player.aud -= audLost;
                intruder.hasAttackedPlayer = true;
                if (damageApplied) {
                    intruder.insultFatigueStacks = (intruder.insultFatigueStacks || 0) + 1;
                }
                if (skills.isSkillUnlocked("brokenRecord")) {
                    const brEff = skills.getSkillEffect("brokenRecord");
                    const ms = brEff.desensitizedMsPerLevel || 0;
                    if (ms > 0) {
                        engine.addDesensitizedStack(ms);
                    }
                }
                skills.fireTrigger("onIntruderAttack");
                if ((intruder.playerAttackCount || 0) >= 2) {
                    skills.fireTrigger("onIntruderAttackAgain");
                }
                if (damageApplied) {
                    skills.fireTrigger("onTakeDamage");
                    if (skills.isSkillUnlocked("temper")) {
                        const tEff = skills.getSkillEffect("temper");
                        const maliceAmt = tEff.malicePerLevel || 0;
                        if (maliceAmt > 0) {
                            engine.addMalice(maliceAmt);
                        }
                    }
                    if (skills.isSkillUnlocked("hotTake")) {
                        const htEff = skills.getSkillEffect("hotTake");
                        const outrageAmt = htEff.outragePerHit || 0;
                        if (outrageAmt > 0) {
                            engine.addOutrage(outrageAmt);
                        }
                    }
                    if (skills.isSkillUnlocked("socialArmor")) {
                        const closeCount = engine.countVisibleIntrudersCloserThan(200);
                        if (closeCount > 0) {
                            const saEff = skills.getSkillEffect("socialArmor");
                            const clout = (saEff.cloutPerCloseEnemy || 0) * closeCount;
                            if (clout > 0) {
                                engine.addCloutStacks(clout, "socialArmor");
                            }
                        }
                    }
                }
                if (data.battle.player.aud < 0) {
                    data.battle.player.aud = 0;
                }
                if (data.battle.player.aud < audBeforeHit) {
                    engine.consumeFakeTearsOnAudacityLoss();
                }
                if (damageApplied) {
                    skillEngine.onPlayerTookDamage();
                }
                if (intruder.aud <= 0) {
                    intruder.aud = 0;
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
        if ((data.battle.transitionCountdownMs || 0) > 0) {
            return;
        }
        const map = initialize.getCurrentMapDefinition();
        const allSpawned = data.battle.zoneSpawnedInCycle && data.battle.zoneSpawnedInCycle.length
            ? data.battle.zoneSpawnedInCycle.every(function(v) { return !!v; })
            : false;
        const noneAlive = data.battle.enemies.length === 0;
        const cycleDone = data.battle.elapsedMs >= engine.getScheduledCycleEndMs(map);
        if (!allSpawned || !noneAlive || !cycleDone) {
            return;
        }
        engine.beginTierTransition();
    },
    checkLossCondition: function() {
        if (data.battle.player.aud > 0) {
            return;
        }
        engine.endCloneRun("dead");
    },
    endCloneRun: function(reason, opts) {
        opts = opts || {};
        if (!data.battle || data.battle.state !== "running") {
            if (opts.skipRetry) {
                data.progress.autoRetryCountdownSec = 0;
            }
            return;
        }
        engine.saveRunHistoryIfNeeded();
        engine.noteHighestLevelReached(data.battle.levelState && data.battle.levelState.level);
        data.battle.state = reason === "completed" ? "completed" : "dead";
        data.battle.intruderAttackFx = engine.createEmptyIntruderAttackFx();
        data.battle.transitionCountdownMs = 0;
        data.battle.transitionMessage = "";
        data.battle.endRunAfterCountdown = false;
        if ((data.battle.pendingOkamiExp || 0) > 0) {
            const okami = engine.getOkami();
            okami.exp = (okami.exp || 0) + engine.getPendingOkamiExpWithSoul();
            data.battle.pendingOkamiExp = 0;
        }
        engine.applyOkamiLevelUps();
        if (!opts.skipManaBonus && typeof bonfire !== "undefined" && bonfire.grantRunEndManaCapacityBonus) {
            bonfire.grantRunEndManaCapacityBonus();
        }
        engine.beginPostBattleCloneCountdown();
        if (opts.skipRetry || engine.isMapTourActive()) {
            data.progress.autoRetryCountdownSec = 0;
        }
        if (engine.isMapTourActive() && !opts.tourHandoff) {
            engine.onTourMapFinished(data.battle.state === "completed" ? "completed" : "dead");
        }
    },
    beginPostBattleCloneCountdown: function() {
        if (!data.battle || (data.battle.state !== "dead" && data.battle.state !== "completed")) {
            data.progress.autoRetryCountdownSec = 0;
            return;
        }
        if (typeof isProcessingOffline !== "undefined" && isProcessingOffline) {
            data.progress.autoRetryCountdownSec = 0;
            return;
        }
        const want = bonfire.isAutoRetryEnabled() || bonfire.isStartWithFullManaEnabled();
        data.progress.autoRetryCountdownSec = want
            ? (data.battle.state === "completed" ? 5 : 10)
            : 0;
    },
    syncPostBattleCloneCountdown: function() {
        if (engine.isMapTourActive()) {
            data.progress.autoRetryCountdownSec = 0;
            return;
        }
        if (!data.battle || (data.battle.state !== "dead" && data.battle.state !== "completed")) {
            return;
        }
        const want = bonfire.isAutoRetryEnabled() || bonfire.isStartWithFullManaEnabled();
        if (!want) {
            data.progress.autoRetryCountdownSec = 0;
            return;
        }
        if ((data.progress.autoRetryCountdownSec || 0) <= 0) {
            data.progress.autoRetryCountdownSec = data.battle.state === "completed" ? 5 : 10;
        }
    },
    ensureMapTour: function() {
        if (!data.progress.mapTour || typeof data.progress.mapTour !== "object") {
            data.progress.mapTour = {
                active: false,
                returnMapKey: "",
                tried: {},
                pendingMapKey: "",
                waitingForMana: false,
                countdownSec: 0
            };
        }
        const tour = data.progress.mapTour;
        if (!tour.tried || typeof tour.tried !== "object") {
            tour.tried = {};
        }
        return tour;
    },
    isMapTourActive: function() {
        const tour = data.progress && data.progress.mapTour;
        return !!(tour && tour.active);
    },
    isMapTourSkipCompleted: function() {
        return engine.isMapTourOptionOn("arrangementOfGoldenNavigationUnlocked", "mapTourSkipCompleted");
    },
    isMapTourRepeat: function() {
        return engine.isMapTourOptionOn("arrangementOfCyclicNavigationUnlocked", "mapTourRepeat");
    },
    isMapTourEndOnLastGold: function() {
        return engine.isMapTourOptionOn("arrangementOfGoldenRestUnlocked", "mapTourEndOnLastGold");
    },
    mapHasGoldStar: function(mapKey) {
        const stars = data.progress.mapStars && data.progress.mapStars[mapKey];
        return !!(stars && stars.gold);
    },
    isTourMapCandidate: function(mapDef) {
        if (!mapDef || mapData.isChallengeMap(mapDef) || mapDef.requiredClassKey) {
            return false;
        }
        return mapData.isMapUnlocked(mapDef, data.progress);
    },
    previewTourMapList: function() {
        const defs = data.progress.mapDefinitions || [];
        const skipGold = engine.isMapTourSkipCompleted();
        const out = [];
        for (let i = 0; i < defs.length; i++) {
            const def = defs[i];
            if (!engine.isTourMapCandidate(def)) {
                continue;
            }
            if (skipGold && engine.mapHasGoldStar(def.key)) {
                continue;
            }
            out.push(def.key);
        }
        return out;
    },
    listRemainingTourMaps: function() {
        const tour = engine.ensureMapTour();
        const defs = data.progress.mapDefinitions || [];
        const skipGold = engine.isMapTourSkipCompleted();
        const out = [];
        for (let i = 0; i < defs.length; i++) {
            const def = defs[i];
            if (!engine.isTourMapCandidate(def) || tour.tried[def.key]) {
                continue;
            }
            if (skipGold && engine.mapHasGoldStar(def.key)) {
                continue;
            }
            out.push(def.key);
        }
        return out;
    },
    pickNextTourMap: function() {
        const tour = engine.ensureMapTour();
        let list = engine.listRemainingTourMaps();
        if (!list.length && engine.isMapTourRepeat()) {
            tour.tried = {};
            list = engine.listRemainingTourMaps();
        }
        return list.length ? list[0] : "";
    },
    tourMapsRemainingCount: function() {
        const tour = engine.ensureMapTour();
        let n = engine.listRemainingTourMaps().length;
        const current = data.progress.currentMapKey;
        const running = data.battle && data.battle.state === "running" && current && tour.tried[current];
        if (running) {
            n += 1;
        }
        return n;
    },
    tourStatusText: function() {
        const tour = engine.ensureMapTour();
        if (!tour.active) {
            return "";
        }
        const nameKey = tour.waitingForMana ? (tour.pendingMapKey || data.progress.currentMapKey) : data.progress.currentMapKey;
        const name = (typeof view !== "undefined" && view.getMapDisplayName)
            ? view.getMapDisplayName(nameKey)
            : (nameKey || "");
        const left = engine.tourMapsRemainingCount();
        if (tour.waitingForMana) {
            return `Tour: waiting to start ${name} · ${left} left`;
        }
        if ((tour.countdownSec || 0) > 0) {
            return `Tour: next map in ${tour.countdownSec}s · ${left} left`;
        }
        return `Tour: ${name} · ${left} left`;
    },
    tryStartTourMap: function(mapKey) {
        const tour = engine.ensureMapTour();
        if (!mapKey) {
            engine.finishMapTour();
            return false;
        }
        const ok = bonfire.startCloneWithTravelRule(mapKey);
        if (ok) {
            tour.tried[mapKey] = true;
            tour.pendingMapKey = mapKey;
            tour.waitingForMana = false;
            tour.countdownSec = 0;
            data.progress.selectedTravelMapKey = mapKey;
            return true;
        }
        tour.pendingMapKey = mapKey;
        tour.waitingForMana = true;
        tour.countdownSec = 0;
        return false;
    },
    onTourMapFinished: function(reason) {
        const tour = engine.ensureMapTour();
        if (!tour.active) {
            return;
        }
        data.progress.autoRetryCountdownSec = 0;
        tour.waitingForMana = false;
        tour.pendingMapKey = "";
        tour.countdownSec = reason === "completed" ? 5 : 10;
    },
    advanceTourAfterCountdown: function() {
        const tour = engine.ensureMapTour();
        if (!tour.active) {
            return;
        }
        if (data.battle && data.battle.state === "running") {
            return;
        }
        const next = engine.pickNextTourMap();
        if (!next) {
            engine.finishMapTour();
            return;
        }
        engine.tryStartTourMap(next);
    },
    tickMapTour: function() {
        const tour = data.progress && data.progress.mapTour;
        if (!tour || !tour.active) {
            return;
        }
        data.progress.autoRetryCountdownSec = 0;
        if ((tour.countdownSec || 0) > 0) {
            tour.countdownSec -= 1;
            if (tour.countdownSec > 0) {
                return;
            }
            engine.advanceTourAfterCountdown();
            return;
        }
        if (tour.waitingForMana) {
            engine.advanceTourAfterCountdown();
        }
    },
    pickTourDestination: function() {
        const tour = engine.ensureMapTour();
        if (engine.isMapTourEndOnLastGold()) {
            const defs = data.progress.mapDefinitions || [];
            for (let i = defs.length - 1; i >= 0; i--) {
                const def = defs[i];
                if (engine.isTourMapCandidate(def) && engine.mapHasGoldStar(def.key)) {
                    return def.key;
                }
            }
        }
        return tour.returnMapKey || data.progress.currentMapKey || data.progress.selectedTravelMapKey || "";
    },
    finishMapTour: function() {
        const tour = engine.ensureMapTour();
        const dest = engine.pickTourDestination();
        tour.active = false;
        tour.waitingForMana = false;
        tour.countdownSec = 0;
        tour.pendingMapKey = "";
        tour.tried = {};
        if (!dest) {
            return;
        }
        data.progress.selectedTravelMapKey = dest;
        data.progress.currentMapKey = dest;
        if (data.battle && data.battle.cloneRunSettings) {
            data.battle.cloneRunSettings.mapKey = dest;
        }
        bonfire.startCloneWithTravelRule(dest);
    },
    startMapTour: function() {
        const garden = data.progress.base && data.progress.base.garden;
        if (!garden || !garden.arrangementOfNavigationUnlocked) {
            return;
        }
        const tour = engine.ensureMapTour();
        if (tour.active) {
            engine.restartMapTour();
            return;
        }
        const list = engine.previewTourMapList();
        if (!list.length) {
            return;
        }
        tour.returnMapKey = data.progress.currentMapKey || data.progress.selectedTravelMapKey || "";
        tour.tried = {};
        tour.active = true;
        tour.waitingForMana = false;
        tour.countdownSec = 0;
        tour.pendingMapKey = "";
        if (data.battle && data.battle.state === "running") {
            engine.endCloneRun("dead", { skipRetry: true, tourHandoff: true });
        }
        engine.tryStartTourMap(list[0]);
    },
    restartMapTour: function() {
        const tour = engine.ensureMapTour();
        const returnKey = tour.returnMapKey || data.progress.currentMapKey || "";
        tour.tried = {};
        const list = engine.previewTourMapList();
        if (!list.length) {
            tour.active = false;
            tour.waitingForMana = false;
            tour.countdownSec = 0;
            tour.pendingMapKey = "";
            tour.returnMapKey = returnKey;
            return;
        }
        tour.active = true;
        tour.returnMapKey = returnKey;
        tour.waitingForMana = false;
        tour.countdownSec = 0;
        tour.pendingMapKey = "";
        if (data.battle && data.battle.state === "running") {
            engine.endCloneRun("dead", { skipRetry: true, tourHandoff: true });
        }
        engine.tryStartTourMap(list[0]);
    },
    stopMapTour: function() {
        const tour = engine.ensureMapTour();
        if (!tour.active) {
            return;
        }
        tour.active = false;
        if (data.battle && data.battle.state === "running") {
            engine.endCloneRun("dead", { skipRetry: true, tourHandoff: true });
        }
        engine.finishMapTour();
    },
    addPendingOkamiExpFromClone: function(expGain) {
        if (!expGain) {
            return;
        }
        const cardAdd = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().okamiExpAdd || 0) : 0;
        const legendMult = engine.getLegendOkamiExpMultiplier();
        data.battle.pendingOkamiExp = (data.battle.pendingOkamiExp || 0) + expGain * 0.01 * (1 + cardAdd) * legendMult;
    },
    getCloneSoulLevel: function() {
        const assigned = (data.battle && data.battle.levelState && data.battle.levelState.levelSoul) || 0;
        const soulSearching = (typeof skills !== "undefined")
            ? (skills.getSkillEffect("soulSearching").bonusSoul || 0) : 0;
        const vicarious = (typeof skills !== "undefined")
            ? (skills.getSkillEffect("vicarious").bonusSoul || 0) : 0;
        return assigned + engine.getMarketAnchoringRingBought() + soulSearching + vicarious;
    },
    getPendingOkamiExpWithSoul: function() {
        return (data.battle && data.battle.pendingOkamiExp) || 0;
    },
    getSoulSkillExpMultiplier: function() {
        return 1 + 0.03 * engine.getCloneSoulLevel();
    },
    onIntruderKilled: function(intruder, opts) {
        const growthUnlocked = bonfire.isGrowthBlessingUnlocked();
        const gain = intruder.gain || 1;
        const expBase = intruder.expBase !== undefined ? intruder.expBase : 1;
        const expGain = engine.expAwardFromIntruderExpBase(expBase);
        const coinsGain = engine.coinsAwardFromIntruderGain(gain);
        engine.noteCoinAwardSample(1, gain);
        engine.grantBattleCoins(coinsGain);
        engine.noteSkillExtraCoins("nickelAndDime", engine.nickelExtraCoins(1));
        engine.noteSkillExtraCoins("cardCoinDrop", engine.cardCoinDropExtra(1));
        const tabCoins = skillEngine.payRunningTabBank(intruder);
        const splashCoins = skillEngine.applySecondhandEmbarrassmentCoins(intruder);
        engine.addPendingOkamiExpFromClone(expGain);
        if (growthUnlocked) {
            engine.addCloneLevelExp(expGain);
        }
        data.battle.enemiesKilled++;
        const shardDrop = engine.trySkillShardDropOnKill(intruder);
        skills.fireTrigger("onKill");
        if (skills.isSkillUnlocked("publicApology")) {
            const paEff = skills.getSkillEffect("publicApology");
            const heal = paEff.audPerKill || 0;
            if (heal > 0) {
                engine.grantPlayerCurrentAudGain(heal * engine.getConfidenceMultiplier(), "publicApology");
            }
        }
        if (engine.isPlayerAboveHalfAud()) {
            skills.fireTrigger("onKillAboveHalf");
            if (skills.isSkillUnlocked("bloodRush")) {
                const brEff = skills.getSkillEffect("bloodRush");
                const maliceAmt = brEff.malicePerLevel || 0;
                if (maliceAmt > 0) {
                    engine.addMalice(maliceAmt);
                }
            }
        }
        const overkillDamage = (opts && opts.overkillDamage) || 0;
        skills.fireTrigger("onKillLogOverkill", { overkillDamage: overkillDamage });
        // Validation fills its cap only on removals after that cap exists. Equal recover
        // covers the +5 max. The additional heal is the skill level (Confidence, not Narcissism).
        const validationHeal = skillEngine.applyValidationKillProgress();
        initialize.calcPlayerStats(false);
        if (validationHeal > 0) {
            engine.grantPlayerCurrentAudGain(validationHeal * engine.getConfidenceMultiplier(), "validation");
        }
        if (data.battle.state === "running") {
            engine.updateCurrentZoneInfo();
        }
        if (typeof view !== "undefined" && view.spawnKillRewardFloater) {
            const pos = engine.getKillFloaterScreenPosition(intruder);
            const expDisplay = expGain * engine.getLevelingExpCardMultiplier();
            const totalCoins = coinsGain + (splashCoins || 0) + (tabCoins || 0);
            const parts = [
                `${intToStringRound(totalCoins)} coins`,
                `+${round1(expDisplay)} exp`
            ];
            if (shardDrop) {
                parts.push(`+${round1(shardDrop.gain)} Shards`);
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
            skillEngine.applyOverkillAttackProgressAfterKill(opts.__OVERKILL__BoostKind);
        }
    },
    /** log2 or log10 of a positive trigger amount. Values at or below 1 grant no exp. */
    positiveLog: function(value, base) {
        if (!(value > 1)) {
            return 0;
        }
        return base === 10 ? Math.log10(value) : Math.log2(value);
    },
    /** Matches `onIntruderKilled`: hindsight, Experience Hog, and Soul scale exp from zone `expBase`. */
    expAwardFromIntruderExpBase: function(expBase) {
        const b = expBase !== undefined ? expBase : 1;
        return b * skillEngine.getCharacterExpMultiplier();
    },
    /** Wave/floater display: skill/Soul award x Leveling Exp shrine card (matches `addCloneLevelExp`). */
    expDisplayFromIntruderExpBase: function(expBase) {
        return engine.expAwardFromIntruderExpBase(expBase) * engine.getLevelingExpCardMultiplier();
    },
    /** Extortion x intruder-coin cards x Charisma x Utility column. Charisma is +5% per point, multiplied with the other bonuses. Flat bonuses are multiplied by this on a normal drop. */
    intruderCoinMultiplier: function() {
        const gEff = skills.getSkillEffect("extortion");
        const greedMult = gEff.killCoinsMultiplier !== undefined ? gEff.killCoinsMultiplier : 1;
        const cardAdd = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().intruderCoinAdd || 0) : 0;
        const utilityPct = (typeof skills.columnReward === "function") ? (skills.columnReward("utility").value || 0) : 0;
        // Extortion and intruder-coin cards multiply. Charisma is +5% per point with itself, then multiplies that product. Utility column is a percent on the same product.
        const shrine = data.progress.base && data.progress.base.shrine;
        const neighborBought = (shrine && shrine.richerNeighborsBought) || 0;
        const neighborMult = neighborBought > 0 ? Math.pow(1.1, neighborBought) : 1;
        return greedMult * (1 + cardAdd) * (1 + 0.05 * engine.getCharismaPoints()) * (1 + utilityPct / 100) * neighborMult;
    },
    /**
     * Weighted coin-award events during a run, so offline can step coin rates.
     * equiv is 1 for a kill, 0.25 for Outrage, the banked fraction for Running Tab,
     * and the splash fraction for Secondhand Embarrassment.
     */
    noteCoinAwardSample: function(equiv, preFlatGain) {
        if (!data.battle || !(equiv > 0)) {
            return;
        }
        data.battle.coinAwardEquiv = (data.battle.coinAwardEquiv || 0) + equiv;
        data.battle.coinPreFlatGainSum = (data.battle.coinPreFlatGainSum || 0) + (preFlatGain || 0) * equiv;
    },
    /** Matches `onIntruderKilled`: Nickel and Dime and More Coin Drop flats, then the coin multiplier (including Utility percent) over stored zone gain. */
    coinsAwardFromIntruderGain: function(storedGain) {
        const gain = storedGain !== undefined ? storedGain : 1;
        const scavFlat = skillEngine.getKillCoinsFlatBonus();
        const baseCoinsPart = gain + scavFlat;
        return baseCoinsPart * engine.intruderCoinMultiplier();
    },
    /** Nickel and Dime's flat after the coin multiplier. scale is 1 on a kill and 0.25 on an Outrage payout. The intruder's base drop is not included. */
    nickelExtraCoins: function(scale) {
        const nickel = skills.getSkillEffect("nickelAndDime").killCoinsFlat || 0;
        if (!(nickel > 0)) {
            return 0;
        }
        const scaleN = scale === undefined ? 1 : scale;
        return nickel * engine.intruderCoinMultiplier() * scaleN;
    },
    /** More Coin Drop card's flat after the coin multiplier. scale is 1 on a kill and 0.25 on an Outrage payout. The intruder's base drop is not included. */
    cardCoinDropExtra: function(scale) {
        const cardFlat = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().killCoinsFlatAdd || 0) : 0;
        if (!(cardFlat > 0)) {
            return 0;
        }
        const scaleN = scale === undefined ? 1 : scale;
        return cardFlat * engine.intruderCoinMultiplier() * scaleN;
    },
    noteSkillExtraCoins: function(skillKey, amount) {
        if (!data.battle || !skillKey || !(amount > 0)) {
            return;
        }
        if (!data.battle.extraCoinsBySkill) {
            data.battle.extraCoinsBySkill = {};
        }
        if (!data.battle.extraCoinsSkillOrder) {
            data.battle.extraCoinsSkillOrder = [];
        }
        if (data.battle.extraCoinsSkillOrder.indexOf(skillKey) < 0) {
            data.battle.extraCoinsSkillOrder.push(skillKey);
        }
        data.battle.extraCoinsBySkill[skillKey] = (data.battle.extraCoinsBySkill[skillKey] || 0) + amount;
    },
    /**
     * Award coins and grant 0.5 skill exp to coin-gain triggers when amount > 0.
     * Retail Therapy also adds its Desensitized stack on each grant.
     * opts.countRunKills (default true): add to battle runCoinsFromKills.
     */
    grantBattleCoins: function(amount, opts) {
        const gain = amount || 0;
        if (!(gain > 0)) {
            return 0;
        }
        const o = opts || {};
        data.progress.coins = (data.progress.coins || 0) + gain;
        if (o.countRunKills !== false && data.battle) {
            data.battle.runCoinsFromKills = (data.battle.runCoinsFromKills || 0) + gain;
        }
        skills.fireTrigger("onCoins");
        if (skills.isSkillUnlocked("retailTherapy")) {
            const rtEff = skills.getSkillEffect("retailTherapy");
            const desMs = rtEff.desensitizedMsPerLevel || 0;
            if (desMs > 0) {
                engine.addDesensitizedStack(desMs);
            }
        }
        return gain;
    },
    SKILL_SLOT_UNLOCK_CYCLE: ["any", "offense", "defense", "utility"],
    DEFAULT_NEXT_SKILL_SLOT_SHARD_COST: 10,
    SKILL_SLOT_SHARD_COST_GROWTH: 2,
    SKILL_SLOT_SHARD_COST_GROWTH_LATE: 3,
    /** Extra slots bought before this still grow at 2×. The next one is 3× that price, then keeps tripling. */
    SKILL_SLOT_SHARD_COST_LATE_AFTER: 12,

    /** Next slot cost from the base and how many extra slots are already unlocked. */
    getNextSkillSlotShardCost: function(unlockIndex) {
        const idx = Math.max(0, unlockIndex || 0);
        const base = engine.DEFAULT_NEXT_SKILL_SLOT_SHARD_COST;
        const early = engine.SKILL_SLOT_SHARD_COST_GROWTH;
        const lateAfter = engine.SKILL_SLOT_SHARD_COST_LATE_AFTER;
        if (idx < lateAfter) {
            return base * Math.pow(early, idx);
        }
        const atSwitch = base * Math.pow(early, lateAfter - 1);
        return atSwitch * Math.pow(engine.SKILL_SLOT_SHARD_COST_GROWTH_LATE, idx - (lateAfter - 1));
    },

    syncNextSkillSlotShardCost: function() {
        if (!data.progress) {
            return;
        }
        const idx = data.progress.skillSlotUnlockIndex || 0;
        data.progress.nextSkillSlotShardCost = engine.getNextSkillSlotShardCost(idx);
    },

    ensureShardProgress: function() {
        if (!data.progress) {
            return;
        }
        if (data.progress.shards === undefined || data.progress.shards === null) {
            data.progress.shards = 0;
        }
        if (data.progress.skillSlotUnlockIndex === undefined || data.progress.skillSlotUnlockIndex === null) {
            data.progress.skillSlotUnlockIndex = 0;
        }
        engine.syncNextSkillSlotShardCost();
    },

    /** Collect Shards level → amount multiplier (0 if locked). L1 = x1, L2 = x1.3, … */
    getShardLootAmountMultiplier: function() {
        const lv = (data.progress.base && data.progress.base.scrollArchives && data.progress.base.scrollArchives.collectShardsLevel) || 0;
        if (lv <= 0) {
            return 0;
        }
        return Math.pow(1.3, lv - 1);
    },
    /** @deprecated Use getShardLootAmountMultiplier; kept for call-site migration. */
    getShardLootChanceMultiplier: function() {
        return engine.getShardLootAmountMultiplier();
    },
    isShardLootUnlocked: function() {
        return engine.getShardLootAmountMultiplier() > 0;
    },

    /** Grant global shards and process skill-slot unlocks. Returns gain applied. */
    grantShards: function(amount) {
        if (!amount || amount <= 0) {
            return 0;
        }
        engine.ensureShardProgress();
        data.progress.shards = (data.progress.shards || 0) + amount;
        if (data.battle) {
            data.battle.runShardsGained = (data.battle.runShardsGained || 0) + amount;
        }
        if (typeof isProcessingOffline !== "undefined" && isProcessingOffline
            && typeof offline !== "undefined" && offline.gains) {
            offline.gains.shards = (offline.gains.shards || 0) + amount;
        }
        engine.processShardSkillSlotUnlocks();
        return amount;
    },

    processShardSkillSlotUnlocks: function() {
        engine.ensureShardProgress();
        skills.ensureSkillEquip();
        const cycle = engine.SKILL_SLOT_UNLOCK_CYCLE;
        let unlockedAny = false;
        while ((data.progress.shards || 0) >= data.progress.nextSkillSlotShardCost) {
            data.progress.shards -= data.progress.nextSkillSlotShardCost;
            const col = cycle[data.progress.skillSlotUnlockIndex % cycle.length];
            data.progress.skillSlotUnlockIndex++;
            engine.syncNextSkillSlotShardCost();
            const eq = data.progress.skillEquip;
            if (!eq.slots[col]) {
                eq.slots[col] = [];
            }
            eq.slots[col].push(null);
            unlockedAny = true;
            if (typeof createView !== "undefined" && createView.appendSkillEquipSlot) {
                createView.appendSkillEquipSlot(col, eq.slots[col].length - 1);
            }
        }
        return unlockedAny;
    },

    /** Roll shard drop for one kill. Returns { gain } or null. */
    trySkillShardDropOnKill: function(intruder) {
        if ((data.battle.mode || "combat") !== "combat" || !intruder) {
            return null;
        }
        if (!engine.isShardLootUnlocked()) {
            return null;
        }
        const map = initialize.getCurrentMapDefinition();
        if (!map || !map.zones || intruder.zoneIndex === undefined || intruder.zoneIndex === null) {
            return null;
        }
        const zi = intruder.zoneIndex;
        if (!map.zones[zi]) {
            return null;
        }
        const p = Math.min(1, mapData.getZoneShardDropChance(map, zi, data.battle.mapTier || 0));
        if (Math.random() >= p) {
            return null;
        }
        const gain = mapData.getMapShardDropAmount(map);
        if (!(gain > 0)) {
            return null;
        }
        engine.grantShards(gain);
        return { gain: gain };
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
        const growthUnlocked = bonfire.isGrowthBlessingUnlocked();
        const plannedGrowthUnlocked = bonfire.isPlannedGrowthUnlocked();
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
            engine.noteHighestLevelReached(ls.level);
            const cls = initialize.getCurrentClassDef();
            ls.levelStr += cls.perLevel.str || 0;
            ls.levelCon += cls.perLevel.con || 0;
            ls.levelSpd += cls.perLevel.spd || 0;
            ls.expToLevelBase *= 1.35;
            ls.expToLevel = Math.max(1, Math.round(ls.expToLevelBase));
            if (plannedGrowthUnlocked) {
                const nextLevel = ls.level;
                const planned = engine.getPlanEntryForLevel(nextLevel, engine.getActiveCloneAttributePlan());
                if (planned) {
                    engine.applyAttributePoint(planned.attribute);
                } else {
                    ls.unassignedPoints++;
                }
            }
            skills.fireTrigger("onCloneLevel");
            if (skills.isSkillUnlocked("levelHeaded")) {
                const lhEff = skills.getSkillEffect("levelHeaded");
                const desMs = lhEff.desensitizedMsPerLevel || 0;
                if (desMs > 0) {
                    for (let lh = 0; lh < 5; lh++) {
                        engine.addDesensitizedStack(desMs);
                    }
                }
            }
            initialize.calcPlayerStats(false);
        }
    },
    copyAttributePlan: function(plan) {
        const src = plan || [];
        const out = [];
        for (let i = 0; i < src.length; i++) {
            out.push({
                level: src[i].level,
                attribute: src[i].attribute
            });
        }
        return out;
    },
    getActiveCloneAttributePlan: function() {
        if (data.battle && data.battle.cloneAttributePlan) {
            return data.battle.cloneAttributePlan;
        }
        return data.progress.attributePlan || [];
    },
    attributePlanSignature: function(plan) {
        const list = engine.copyAttributePlan(plan).sort(function(a, b) {
            return a.level - b.level;
        });
        const parts = [];
        for (let i = 0; i < list.length; i++) {
            parts.push(list[i].level + ":" + list[i].attribute);
        }
        return parts.join(",");
    },
    hasPendingAttributePlanChanges: function() {
        return engine.attributePlanSignature(data.progress.attributePlan)
            !== engine.attributePlanSignature(engine.getActiveCloneAttributePlan());
    },
    noteHighestLevelReached: function(level) {
        const n = level || 0;
        if (n > (data.progress.highestLevelReached || 0)) {
            data.progress.highestLevelReached = n;
        }
    },
    getPlanEntryForLevel: function(level, plan) {
        const list = plan || [];
        for (let i = 0; i < list.length; i++) {
            if (list[i].level === level) {
                return list[i];
            }
        }
        return null;
    },
    getPlanLevelCap: function() {
        return (data.progress.highestLevelReached || 0) + 10;
    },
    getNextUnplannedLevel: function() {
        const maxLevel = engine.getPlanLevelCap();
        const plan = data.progress.attributePlan || [];
        for (let lvl = 1; lvl <= maxLevel; lvl++) {
            if (!engine.getPlanEntryForLevel(lvl, plan)) {
                return lvl;
            }
        }
        return null;
    },
    addAttributePlanEntry: function(attributeKey) {
        const plannedGrowthUnlocked = bonfire.isPlannedGrowthUnlocked();
        if (!plannedGrowthUnlocked) {
            return false;
        }
        if (attributeKey !== "str" && attributeKey !== "con" && attributeKey !== "spd" && attributeKey !== "soul") {
            return false;
        }
        const assignLevel = engine.getNextUnplannedLevel();
        if (assignLevel === null) {
            return false;
        }
        data.progress.attributePlan.push({
            level: assignLevel,
            attribute: attributeKey
        });
        return true;
    },
    removeAttributePlanEntry: function(level) {
        return engine.removeAttributePlanRange(level, level);
    },
    removeAttributePlanRange: function(startLevel, endLevel) {
        const plan = data.progress.attributePlan || [];
        const start = Math.min(startLevel, endLevel);
        const end = Math.max(startLevel, endLevel);
        const removed = end - start + 1;
        const next = [];
        let found = false;
        for (let i = 0; i < plan.length; i++) {
            const entry = plan[i];
            if (entry.level >= start && entry.level <= end) {
                found = true;
                continue;
            }
            if (entry.level > end) {
                next.push({ level: entry.level - removed, attribute: entry.attribute });
            } else {
                next.push({ level: entry.level, attribute: entry.attribute });
            }
        }
        data.progress.attributePlan = next;
        return found;
    },
    applyAttributePoint: function(attributeKey) {
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
    countIntrudersInSlapRange: function() {
        let count = 0;
        for (let i = 0; i < data.battle.enemies.length; i++) {
            const e = data.battle.enemies[i];
            if (e.alive && e.inRange) {
                count++;
            }
        }
        return count;
    },
    isPlayerAboveHalfAud: function() {
        return engine.getPlayerAudRatio() > 0.5;
    },
    getPlayerAudRatio: function() {
        const p = data.battle.player;
        return (p.aud || 0) / Math.max(1, p.maxAud || 1);
    },
    isPlayerAtOrBelowAudFraction: function(frac) {
        return engine.getPlayerAudRatio() <= frac;
    },
    isPlayerBelowAudFraction: function(frac) {
        return engine.getPlayerAudRatio() < frac;
    },
    isPlayerAtMaxAud: function() {
        const p = data.battle.player;
        return (p.aud || 0) >= Math.max(1, p.maxAud || 1);
    },
    isPlayerMovingForward: function() {
        return engine.getIntruderPushBonusPxPerSecond() > 0;
    },
    getLevelingExpCardMultiplier: function() {
        const cardAdd = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().levelingExpAdd || 0) : 0;
        return 1 + cardAdd;
    },
    addCloneLevelExp: function(amount) {
        if (!amount || amount <= 0) {
            return;
        }
        data.battle.levelState.exp += amount * engine.getLevelingExpCardMultiplier();
    },
    grantCloneCharacterExp: function(amount) {
        if (!amount || amount <= 0) {
            return;
        }
        const granted = amount * skillEngine.getCharacterExpMultiplier();
        engine.addPendingOkamiExpFromClone(granted);
        if (bonfire.isGrowthBlessingUnlocked()) {
            engine.addCloneLevelExp(granted);
            engine.resolveLevelUps();
        }
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
    updateBattleBuffs: function(tickMs) {
        battleBuffs.tick(tickMs);
    },
    addFuryStacks: function(amount) {
        battleBuffs.addFuryStacks(amount);
    },
    addDesensitizedStack: function(durationMs) {
        battleBuffs.addDesensitizedStack(durationMs);
    },
    addOutrage: function(amount) {
        battleBuffs.addOutrage(amount);
    },
    /**
     * If Outrage is at least 10, spend 10, set this attack's cooldown to 75%, and pay 25% of the
     * target's kill coins through the normal coin-gain trigger.
     */
    cooldownAfterOutrageSpend: function(cooldownMs, intruder) {
        if (!engine.trySpendOutrage()) {
            return cooldownMs;
        }
        const stored = intruder && intruder.gain !== undefined ? intruder.gain : 1;
        engine.noteCoinAwardSample(0.25, stored);
        const coins = engine.coinsAwardFromIntruderGain(stored) * 0.25;
        if (coins > 0) {
            engine.grantBattleCoins(coins);
            engine.noteSkillExtraCoins("outrage", stored * engine.intruderCoinMultiplier() * 0.25);
            engine.noteSkillExtraCoins("nickelAndDime", engine.nickelExtraCoins(0.25));
            engine.noteSkillExtraCoins("cardCoinDrop", engine.cardCoinDropExtra(0.25));
        }
        return cooldownMs * 0.75;
    },
    trySpendOutrage: function() {
        return battleBuffs.trySpendOutrage();
    },
    addMalice: function(amount) {
        battleBuffs.addMalice(amount);
    },
    addFakeTears: function(amount) {
        battleBuffs.addFakeTears(amount);
    },
    /**
     * Confidence and Charisma each add 5% Clout gain per point. The percents add together.
     * sourceKey records the full boosted grant. Whatever the max-Audacity cap refuses is counted as lost.
     */
    addCloutStacks: function(amount, sourceKey) {
        if (!amount || amount <= 0) {
            return 0;
        }
        const boosted = amount * engine.getCloutGainMultiplier();
        const gained = battleBuffs.addCloutStacks(boosted);
        engine.noteBattleClout(sourceKey, boosted, gained);
        return gained;
    },
    getBattleBuffDisplayList: function() {
        return battleBuffs.getDisplayList(battleBuffs.getState());
    },
    consumeFuryOnAttack: function() {
        return battleBuffs.consumeFuryOnAttack();
    },
    getFuryDamageMultiplier: function() {
        return battleBuffs.getFuryDamageMultiplier();
    },
    getDisplayedSlapDamage: function() {
        let dmg = data.battle.player.attackDamage || 0;
        dmg = engine.applyCombatOutgoingDamage(dmg, null, { consumeFury: false });
        dmg *= engine.getFuryDamageMultiplier();
        return Math.max(1, roundNearestDecimals(dmg, 1));
    },
    getDisplayedSandalDamage: function() {
        const p = data.battle.player;
        let dmg = p.sandalAttackDamage !== undefined
            ? p.sandalAttackDamage
            : Math.max(1, roundNearestDecimals(p.attackDamage * 1.5, 1));
        dmg = engine.applyCombatOutgoingDamage(dmg, null, { consumeFury: false });
        return Math.max(1, roundNearestDecimals(dmg, 1));
    },
    getDesensitizedIncomingMultiplier: function() {
        return battleBuffs.getDesensitizedIncomingMultiplier();
    },
    consumeMaliceOnAttack: function() {
        return battleBuffs.consumeMaliceOnAttack();
    },
    getMaliceDamageMultiplier: function() {
        return battleBuffs.getMaliceDamageMultiplier();
    },
    getFakeTearsDamageMultiplier: function() {
        return battleBuffs.getFakeTearsDamageMultiplier();
    },
    consumeFakeTearsOnAudacityLoss: function() {
        battleBuffs.consumeFakeTearsOnAudacityLoss();
    },
    applyCloutToIncomingDamage: function(damageAfterOtherMitigation) {
        return battleBuffs.applyCloutToIncomingDamage(damageAfterOtherMitigation);
    },
    applyBattleBuffsToOutgoingDamage: function(damage, opts) {
        let out = Math.max(0, damage || 0);
        if (opts && opts.consumeFury) {
            out *= engine.consumeFuryOnAttack();
            out *= engine.consumeMaliceOnAttack();
        } else {
            out *= engine.getMaliceDamageMultiplier();
        }
        return out;
    },
    applyIncomingDamageBeforeClout: function(incoming) {
        let out = Math.max(0, incoming || 0);
        out *= engine.getDesensitizedIncomingMultiplier();
        out *= engine.getFakeTearsDamageMultiplier();
        return Math.max(0, out);
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
    countVisibleIntruders: function() {
        let n = 0;
        for (let i = 0; i < data.battle.enemies.length; i++) {
            const e = data.battle.enemies[i];
            if (e.alive && engine.intruderIntersectsBattlefield(e)) {
                n++;
            }
        }
        return n;
    },
    countVisibleIntrudersFurtherThan: function(rangePx) {
        const battleHeight = viewData.layout.battlefieldHeightPx || gameData.battle.battlefieldHeightPx || 500;
        const playerTopY = viewData.layout.playerTopPx || (battleHeight - 65);
        let n = 0;
        for (let i = 0; i < data.battle.enemies.length; i++) {
            const e = data.battle.enemies[i];
            if (!e.alive || !engine.intruderIntersectsBattlefield(e)) {
                continue;
            }
            const dist = playerTopY - (e.yPx + (e.sizePx || 0));
            if (dist > rangePx) {
                n++;
            }
        }
        return n;
    },
    countVisibleIntrudersCloserThan: function(rangePx) {
        const battleHeight = viewData.layout.battlefieldHeightPx || gameData.battle.battlefieldHeightPx || 500;
        const playerTopY = viewData.layout.playerTopPx || (battleHeight - 65);
        let n = 0;
        for (let i = 0; i < data.battle.enemies.length; i++) {
            const e = data.battle.enemies[i];
            if (!e.alive || !engine.intruderIntersectsBattlefield(e)) {
                continue;
            }
            const dist = playerTopY - (e.yPx + (e.sizePx || 0));
            if (dist < rangePx) {
                n++;
            }
        }
        return n;
    },
    getBrutalityMultiplier: function() {
        const ls = data.battle.levelState || {};
        let totalStr = (ls.levelStr || 0) + (ls.skillStrBonus || 0);
        totalStr += skills.getSkillEffect("shockValue").bonusStr || 0;
        totalStr += skills.getSkillEffect("savageLessons").bonusStr || 0;
        const div = gameData.battle.combat.conStrStatDivisor || 10;
        return 1 + totalStr / div;
    },
    /** Same Confidence total as max Audacity: level Con + Windfall Swagger + Adaptation. */
    getConfidencePoints: function() {
        const ls = data.battle && data.battle.levelState;
        if (!ls) {
            return 0;
        }
        let totalCon = ls.levelCon || 0;
        totalCon += skills.getSkillEffect("windfallSwagger").bonusCon || 0;
        totalCon += skills.getSkillEffect("adaptation").bonusCon || 0;
        return totalCon;
    },
    getConfidenceMultiplier: function() {
        const div = (gameData.battle.combat && gameData.battle.combat.conStrStatDivisor) || 10;
        return 1 + engine.getConfidencePoints() / div;
    },
    /** +5% per Confidence and +5% per Charisma, added together. */
    getCloutGainMultiplier: function() {
        return 1 + 0.05 * (engine.getConfidencePoints() + engine.getCharismaPoints());
    },
    /** Remember the Audacity that actually landed this battle. Amount is already past the max-Aud clamp. */
    noteBattleHeal: function(skillKey, amount) {
        if (!data.battle || !skillKey || !(amount > 0)) {
            return;
        }
        if (!data.battle.healBySkill) {
            data.battle.healBySkill = {};
        }
        if (!data.battle.healSkillOrder) {
            data.battle.healSkillOrder = [];
        }
        if (data.battle.healSkillOrder.indexOf(skillKey) < 0) {
            data.battle.healSkillOrder.push(skillKey);
        }
        data.battle.healBySkill[skillKey] = (data.battle.healBySkill[skillKey] || 0) + amount;
    },
    /** Flat armor that actually reduced incoming damage, after Clout and other earlier reductions. */
    noteBattleFlatBlock: function(skillKey, amount) {
        if (!data.battle || !skillKey || !(amount > 0)) {
            return;
        }
        if (!data.battle.flatBlockBySkill) {
            data.battle.flatBlockBySkill = {};
        }
        if (!data.battle.flatBlockSkillOrder) {
            data.battle.flatBlockSkillOrder = [];
        }
        if (data.battle.flatBlockSkillOrder.indexOf(skillKey) < 0) {
            data.battle.flatBlockSkillOrder.push(skillKey);
        }
        data.battle.flatBlockBySkill[skillKey] = (data.battle.flatBlockBySkill[skillKey] || 0) + amount;
    },
    /**
     * supposed is the full grant after Confidence and Charisma.
     * gained is what stuck under the max-Audacity cap. The rest is Clout lost to the cap.
     */
    noteBattleClout: function(skillKey, supposed, gained) {
        if (!data.battle || !skillKey || !(supposed > 0)) {
            return;
        }
        if (!data.battle.cloutBySkill) {
            data.battle.cloutBySkill = {};
        }
        if (!data.battle.cloutSkillOrder) {
            data.battle.cloutSkillOrder = [];
        }
        if (data.battle.cloutSkillOrder.indexOf(skillKey) < 0) {
            data.battle.cloutSkillOrder.push(skillKey);
        }
        data.battle.cloutBySkill[skillKey] = (data.battle.cloutBySkill[skillKey] || 0) + supposed;
        const lost = Math.max(0, supposed - (gained || 0));
        if (lost > 0) {
            data.battle.cloutLostToCap = (data.battle.cloutLostToCap || 0) + lost;
        }
    },
    /**
     * Add current Audacity, clamped to max. amount is the final heal (flat heals already include Confidence).
     * sourceKey records the real delta on the Healed card.
     */
    grantPlayerCurrentAudGain: function(amount, sourceKey) {
        if (!amount || amount <= 0) {
            return 0;
        }
        const p = data.battle.player;
        const before = p.aud;
        p.aud = Math.min(p.maxAud, p.aud + amount);
        const gained = Math.max(0, p.aud - before);
        if (gained > 0) {
            engine.spawnAudGainFloat(gained, "right");
            engine.noteBattleHeal(sourceKey, gained);
        }
        return gained;
    },
    applyCombatOutgoingDamage: function(baseDamage, target, opts) {
        // baseDamage is already ((base + cards) x density + Force) x Brutality.
        // Extra flats (MC, Sadism, Repeat Offender, Exploit, …) also get Brutality,
        // then skill / buff / card damage multipliers apply.
        const o = opts || {};
        let out = Math.max(0, baseDamage || 0);
        const flatExtra = skillEngine.getCombatOutgoingFlatBonus(target, o);
        if (flatExtra) {
            out += flatExtra * engine.getBrutalityMultiplier();
        }
        if (target) {
            out = skillEngine.applyGrudgeOutgoingMultiplier(out, target);
            out = skillEngine.applyBitterRivalryOutgoingMultiplier(out, target);
            out = skillEngine.applyClosingArgumentOutgoingMultiplier(out, target);
        }
        out = skillEngine.applyHighHorseOutgoingMultiplier(out);
        out = skillEngine.applyUnderdogOutgoingMultiplier(out);
        out = skillEngine.applyPeerPressureOutgoingMultiplier(out);
        out = skillEngine.applyCrowdWorkOutgoingMultiplier(out);
        out = skillEngine.applyMarathonEgoOutgoingMultiplier(out);
        out = engine.applyBattleBuffsToOutgoingDamage(out, o);
        return out;
    },
    getCharismaPoints: function() {
        const ls = data.battle && data.battle.levelState;
        return (ls && ls.levelSpd) || 0;
    },
    /** Enemies approach 5% faster per Charisma. */
    getCharismaMoveMultiplier: function() {
        return 1 + engine.getCharismaPoints() * 0.05;
    },
    /**
     * Each Charisma point leaves 95% of the remaining wave wait and of the spacing inside a wave.
     * At 40s with a wave due at 60s, going from 0 to 10 Charisma sets that wave to about 52s.
     */
    getCharismaWaveFactor: function(points) {
        const cha = points === undefined || points === null ? engine.getCharismaPoints() : points;
        if (!cha) {
            return 1;
        }
        return Math.pow(0.95, cha);
    },
    ensureZoneSpawnSchedule: function() {
        const map = initialize.getCurrentMapDefinition();
        if (!map || !map.zones) {
            return;
        }
        const zones = map.zones;
        const schedule = data.battle.zoneSpawnAtMs;
        const valid = schedule && schedule.length === zones.length;
        if (!valid) {
            const next = [];
            for (let i = 0; i < zones.length; i++) {
                next.push(zones[i].startTimeMs || 0);
            }
            data.battle.zoneSpawnAtMs = next;
            data.battle.charismaSpawnScheduleCha = 0;
        }
        engine.applyCharismaToSpawnSchedule();
    },
    applyCharismaToSpawnSchedule: function() {
        const cha = engine.getCharismaPoints();
        const prev = data.battle.charismaSpawnScheduleCha || 0;
        if (prev === cha) {
            return;
        }
        const factor = Math.pow(0.95, cha - prev);
        const elapsed = data.battle.elapsedMs || 0;
        const schedule = data.battle.zoneSpawnAtMs || [];
        const spawned = data.battle.zoneSpawnedInCycle || [];
        for (let i = 0; i < schedule.length; i++) {
            if (spawned[i]) {
                continue;
            }
            const remaining = schedule[i] - elapsed;
            schedule[i] = elapsed + remaining * factor;
        }
        engine.tightenLiveWaveSpacing(factor);
        data.battle.charismaSpawnScheduleCha = cha;
    },
    /** Pull each live wave's trailing units toward its front by the Charisma spacing factor. */
    tightenLiveWaveSpacing: function(factor) {
        if (!(factor > 0) || factor === 1) {
            return;
        }
        const enemies = data.battle.enemies || [];
        const fronts = {};
        for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            if (!e.alive) {
                continue;
            }
            const zi = e.zoneIndex;
            if (fronts[zi] === undefined || e.yPx > fronts[zi]) {
                fronts[zi] = e.yPx;
            }
        }
        for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            if (!e.alive) {
                continue;
            }
            const front = fronts[e.zoneIndex];
            const gap = front - e.yPx;
            if (gap <= 0) {
                continue;
            }
            e.yPx = front - gap * factor;
            e.prevYPx = e.yPx;
        }
    },
    getScheduledCycleEndMs: function(map) {
        const schedule = data.battle.zoneSpawnAtMs;
        if (!schedule || !schedule.length) {
            return mapData.getMapTotalDurationMs(map);
        }
        let end = 0;
        for (let i = 0; i < schedule.length; i++) {
            if (schedule[i] > end) {
                end = schedule[i];
            }
        }
        return end;
    },
    getIntruderPushBonusPxPerSecond: function() {
        if (engine.anyIntruderInPlayerRange() || engine.countAliveEnemies() === 0) {
            return 0;
        }
        let out = gameData.battle.idlePushBonusPxPerSecond * engine.getCharismaMoveMultiplier();
        if ((data.progress.currentClassKey || "none") === "scold" && data.battle.scoldDashActive) {
            out *= 10;
        }
        return out;
    },
    getBattleTimeRateMultiplier: function() {
        if (!engine.areActiveZonesCleared()) {
            return 1;
        }
        // Charisma no longer speeds the wave clock. Scold Dash still does, while the field is empty.
        let out = 1;
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
            if (data.battle.endRunAfterCountdown) {
                engine.endCloneRun("completed");
            } else {
                engine.restartMapCycle(data.battle.nextTierAfterCountdown || 0);
            }
        }
        return true;
    },
    beginTierTransition: function() {
        const map = initialize.getCurrentMapDefinition();
        const mapKey = map ? map.key : data.progress.currentMapKey;
        const tier = data.battle.mapTier || 0;
        if (tier === 0) {
            data.battle.runStarCleared = "bronze";
            engine.claimMapStar(mapKey, "bronze", 1);
            data.battle.transitionMessage = "Bronze star received! Raising difficulty...";
            data.battle.nextTierAfterCountdown = 1;
            data.battle.endRunAfterCountdown = false;
            data.battle.transitionCountdownMs = 3000;
            engine.idleSlapHand();
            return;
        }
        if (tier === 1) {
            data.battle.runStarCleared = "silver";
            engine.claimMapStar(mapKey, "silver", 2);
            data.battle.transitionMessage = "Silver star received! Raising difficulty...";
            data.battle.nextTierAfterCountdown = 2;
            data.battle.endRunAfterCountdown = false;
            data.battle.transitionCountdownMs = 3000;
            engine.idleSlapHand();
            return;
        }
        data.battle.runStarCleared = "gold";
        engine.claimMapStar(mapKey, "gold", 3);
        data.battle.transitionMessage = "Gold star received! Map complete.";
        data.battle.nextTierAfterCountdown = 0;
        data.battle.endRunAfterCountdown = true;
        data.battle.transitionCountdownMs = 5000;
    },
    restartMapCycle: function(nextTier) {
        data.battle.mapTier = nextTier || 0;
        data.battle.elapsedMs = 0;
        data.battle.zoneSpawnedInCycle = [];
        data.battle.zoneRewardGrantedInCycle = [];
        data.battle.zoneSpawnAtMs = null;
        data.battle.charismaSpawnScheduleCha = null;
        const map = initialize.getCurrentMapDefinition();
        for (let i = 0; i < map.zones.length; i++) {
            data.battle.zoneSpawnedInCycle.push(false);
            data.battle.zoneRewardGrantedInCycle.push(false);
        }
        data.battle.activeZones = [];
        data.battle.transitionCountdownMs = 0;
        data.battle.transitionMessage = "";
        data.battle.nextTierAfterCountdown = 0;
        data.battle.endRunAfterCountdown = false;
        data.battle.enemies = [];
        data.battle.slapQueue = [];
        data.battle.activeTargetId = null;
        data.battle.slapFx = engine.createEmptySlapFx();
        data.battle.intruderAttackFx = engine.createEmptyIntruderAttackFx();
        data.battle.player.attackTimerMs = 0;
        data.battle.player.sandalAttackTimerMs = 0;
        data.battle.shamelessExpAccMs = 0;
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
        if (document.hidden) {
            return;
        }
        // Hidden battle column pauses CSS animations → lines never remove; skip FX off-screen.
        if (typeof view !== "undefined" && view.isBattleVisible && !view.isBattleVisible()) {
            return;
        }
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
        if (document.hidden || !attacker) {
            return;
        }
        if (typeof view !== "undefined" && view.isBattleVisible && !view.isBattleVisible()) {
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
    SLAP_HAND_SIZE_PX: 42,
    SLAP_WINDUP_TRAVEL_PX: 63,
    SLAP_WINDUP_MS: 300,
    SLAP_SIDE_MS: 200,
    SLAP_INNER_MS: 300,
    SLAP_DMG_MS: 2000,
    SLAP_DMG_SLOTS: 8,
    INTRUDER_ATTACK_FX_SLOTS: 12,
    INTRUDER_ATTACK_GFX_SIZE_PX: 42,
    WINK_SPEED_PX: 230,
    LEER_SPEED_PX: 90,
    createEmptySlapFx: function() {
        const slots = [];
        for (let i = 0; i < engine.SLAP_DMG_SLOTS; i++) {
            slots.push({ active: false, x: 0, y: 0, damage: 0, elapsedMs: 0 });
        }
        return {
            phase: "idle",
            dir: 1,
            targetId: null,
            windupAtPlayer: false,
            x: 0,
            y: 0,
            prevX: 0,
            prevY: 0,
            vx: 0,
            startX: 0,
            hitX: 0,
            travelPx: engine.SLAP_WINDUP_TRAVEL_PX,
            phaseElapsedMs: 0,
            windupPending: false,
            middleFromLeft: false,
            vxInner0: 0,
            innerStartX: 0,
            dmgSlots: slots
        };
    },
    ensureSlapFx: function() {
        if (!data.battle) {
            return null;
        }
        const fx = data.battle.slapFx;
        if (!fx || !Array.isArray(fx.dmgSlots) || fx.dmgSlots.length !== engine.SLAP_DMG_SLOTS) {
            data.battle.slapFx = engine.createEmptySlapFx();
        }
        return data.battle.slapFx;
    },
    idleSlapHand: function() {
        const fx = engine.ensureSlapFx();
        if (!fx) {
            return;
        }
        fx.phase = "idle";
        fx.windupPending = false;
        fx.windupAtPlayer = false;
        fx.targetId = null;
        fx.vx = 0;
        fx.phaseElapsedMs = 0;
    },
    cancelSlapWindupIfNeeded: function() {
        const fx = engine.ensureSlapFx();
        // Keep player-anchored windup running when slap is ready but no target yet.
        if (fx && fx.phase === "windup" && !fx.windupAtPlayer) {
            engine.idleSlapHand();
        }
    },
    getSlapTargetBox: function(intruder) {
        const lm = engine.getBattleLaneMetrics();
        const laneCenter = lm.inset + (intruder.lane + 0.5) * lm.laneWidth;
        const half = (intruder.sizePx || 0) / 2;
        const left = laneCenter - half;
        const handSize = engine.SLAP_HAND_SIZE_PX;
        return {
            left: left,
            right: left + (intruder.sizePx || 0),
            handY: intruder.yPx + half - (handSize / 2) + 4
        };
    },
    getSlapPlayerBox: function(dir) {
        const handSize = engine.SLAP_HAND_SIZE_PX;
        const gap = 6;
        // dir 1 = slap travels right (hand on player's left); dir -1 = travels left (hand on right).
        const d = dir === -1 ? -1 : 1;
        const anchor = engine.getPlayerAvatarFloatAnchor();
        if (anchor) {
            const left = d === 1
                ? (anchor.left - gap - handSize)
                : (anchor.left + anchor.width + gap);
            return {
                left: left,
                right: left + handSize,
                handY: anchor.top + (anchor.height / 2) - (handSize / 2)
            };
        }
        const bw = (typeof viewData !== "undefined" && viewData.layout && viewData.layout.battlefieldWidthPx)
            || (gameData.battle && gameData.battle.battlefieldWidthPx)
            || 690;
        const playerTop = (typeof viewData !== "undefined" && viewData.layout && viewData.layout.playerTopPx) || 0;
        const tokenSize = 58;
        const centerX = bw / 2;
        const left = d === 1
            ? (centerX - (tokenSize / 2) - gap - handSize)
            : (centerX + (tokenSize / 2) + gap);
        return {
            left: left,
            right: left + handSize,
            handY: playerTop + (tokenSize / 2) - (handSize / 2)
        };
    },
    getClosestIntruderToPlayer: function() {
        const enemies = data.battle && data.battle.enemies;
        if (!enemies || !enemies.length) {
            return null;
        }
        const battleHeight = (typeof viewData !== "undefined" && viewData.layout && viewData.layout.battlefieldHeightPx)
            || (gameData.battle && gameData.battle.battlefieldHeightPx)
            || 500;
        const playerTopY = (typeof viewData !== "undefined" && viewData.layout && viewData.layout.playerTopPx)
            || (battleHeight - 65);
        let best = null;
        let bestDist = Infinity;
        for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            if (!e || !e.alive) {
                continue;
            }
            // Distance from enemy bottom edge to the player slap line (smaller = closer).
            const dist = playerTopY - (e.yPx + (e.sizePx || 0));
            if (!best || dist < bestDist || (dist === bestDist && e.id < best.id)) {
                best = e;
                bestDist = dist;
            }
        }
        return best;
    },
    /** Next slap dir for a lane without consuming the middle-lane toggle. */
    peekSlapDirForLane: function(lane) {
        const fx = engine.ensureSlapFx();
        if (lane <= 2) {
            return -1;
        }
        if (lane >= 4) {
            return 1;
        }
        // Matches what the next resolveSlapDir(middle) call will return.
        return (fx && fx.middleFromLeft) ? -1 : 1;
    },
    resolvePlayerSlapHoldDir: function() {
        const closest = engine.getClosestIntruderToPlayer();
        if (closest) {
            return engine.peekSlapDirForLane(closest.lane);
        }
        const fx = engine.ensureSlapFx();
        return (fx && fx.dir === -1) ? -1 : 1;
    },
    getSlapWindupXs: function(box, dir) {
        const travel = engine.SLAP_WINDUP_TRAVEL_PX;
        const handSize = engine.SLAP_HAND_SIZE_PX;
        const hitX = dir === 1 ? box.left : (box.right - handSize);
        const startX = dir === 1 ? (hitX - travel) : (hitX + travel);
        return { startX: startX, hitX: hitX, travel: travel };
    },
    resolveSlapDir: function(lane) {
        const fx = engine.ensureSlapFx();
        if (lane <= 2) {
            return -1;
        }
        if (lane >= 4) {
            return 1;
        }
        fx.middleFromLeft = !fx.middleFromLeft;
        return fx.middleFromLeft ? 1 : -1;
    },
    slapWindupPeakSpeed: function(travelPx) {
        const D = travelPx || engine.SLAP_WINDUP_TRAVEL_PX;
        const Tsec = engine.SLAP_WINDUP_MS / 1000;
        return (4 * D) / (3 * Tsec);
    },
    slapWindupVelocity: function(fx, elapsedMs) {
        const dir = fx.dir || 1;
        const peak = engine.slapWindupPeakSpeed(fx.travelPx);
        const T = engine.SLAP_WINDUP_MS;
        if (elapsedMs <= T) {
            const u = elapsedMs / T;
            return dir * peak * (0.5 + 0.5 * u);
        }
        return dir * peak;
    },
    slapWindupX: function(fx, elapsedMs) {
        const dir = fx.dir || 1;
        const D = fx.travelPx || engine.SLAP_WINDUP_TRAVEL_PX;
        const T = engine.SLAP_WINDUP_MS;
        const peak = engine.slapWindupPeakSpeed(D);
        if (elapsedMs <= T) {
            const u = elapsedMs / T;
            return fx.startX + dir * D * ((2 / 3) * u + (1 / 3) * u * u);
        }
        return fx.hitX + dir * peak * ((elapsedMs - T) / 1000);
    },
    startSlapWindup: function(target) {
        const fx = engine.ensureSlapFx();
        if (!fx) {
            return;
        }
        let box;
        let dir;
        if (target) {
            box = engine.getSlapTargetBox(target);
            dir = engine.resolveSlapDir(target.lane);
            fx.targetId = target.id;
            fx.windupAtPlayer = false;
        } else {
            dir = engine.resolvePlayerSlapHoldDir();
            box = engine.getSlapPlayerBox(dir);
            if (!box) {
                return;
            }
            fx.targetId = null;
            fx.windupAtPlayer = true;
        }
        const xs = engine.getSlapWindupXs(box, dir);
        const startX = xs.startX;
        const hitX = xs.hitX;
        fx.phase = "windup";
        fx.dir = dir;
        fx.startX = startX;
        fx.hitX = hitX;
        fx.travelPx = xs.travel;
        // Player hold: park still at the contact pose. Enemy windup: travel from start.
        if (fx.windupAtPlayer) {
            fx.x = hitX;
            fx.prevX = hitX;
            fx.vx = 0;
        } else {
            fx.x = startX;
            fx.prevX = startX;
            fx.vx = dir * engine.slapWindupPeakSpeed(xs.travel) * 0.5;
        }
        fx.y = box.handY;
        fx.prevY = box.handY;
        fx.phaseElapsedMs = 0;
        fx.windupPending = true;
        fx.vxInner0 = 0;
        fx.innerStartX = fx.x;
    },
    getSlapWindupTarget: function() {
        if (data.battle.activeTargetId === null) {
            return null;
        }
        const target = engine.findIntruderById(data.battle.activeTargetId);
        if (!target || !target.alive || !target.inRange) {
            return null;
        }
        return target;
    },
    maybeStartSlapWindup: function(tickMs) {
        const fx = engine.ensureSlapFx();
        if (!fx) {
            return;
        }
        const p = data.battle.player;
        if (fx.phase === "windup") {
            const liveTarget = engine.getSlapWindupTarget();
            if (fx.windupAtPlayer) {
                // Only shift into an enemy windup while the slap is still charging.
                // If already ready, keep the held pose; impact will snap to the enemy.
                if (liveTarget && (p.attackTimerMs || 0) > 0) {
                    engine.startSlapWindup(liveTarget);
                }
            } else {
                const windupTarget = engine.findIntruderById(fx.targetId);
                if (!windupTarget || !windupTarget.alive || !windupTarget.inRange) {
                    if (liveTarget) {
                        engine.startSlapWindup(liveTarget);
                    } else {
                        engine.startSlapWindup(null);
                    }
                }
            }
        }
        if (fx.windupPending) {
            return;
        }
        const target = engine.getSlapWindupTarget();
        const recharge = Math.max(1e-9, engine.getSlapRechargeMultiplier());
        const remainReal = (p.attackTimerMs || 0) / recharge;
        const willLandThisTick = (p.attackTimerMs || 0) - tickMs * recharge <= 0;
        if (target) {
            if (willLandThisTick || remainReal > engine.SLAP_WINDUP_MS) {
                return;
            }
            engine.startSlapWindup(target);
            return;
        }
        // No enemy in range: show a still hand beside the player once within the windup window
        // (including while slap is ready and waiting).
        if (remainReal > engine.SLAP_WINDUP_MS && (p.attackTimerMs || 0) > 0) {
            return;
        }
        engine.startSlapWindup(null);
    },
    spawnSlapDamageFx: function(x, y, damage) {
        if (typeof view === "undefined" || !view.isBattleVisible || !view.isBattleVisible()) {
            return;
        }
        const fx = engine.ensureSlapFx();
        if (!fx) {
            return;
        }
        let slot = null;
        let oldest = 0;
        for (let i = 0; i < fx.dmgSlots.length; i++) {
            if (!fx.dmgSlots[i].active) {
                slot = fx.dmgSlots[i];
                break;
            }
            if (fx.dmgSlots[i].elapsedMs > fx.dmgSlots[oldest].elapsedMs) {
                oldest = i;
            }
        }
        if (!slot) {
            slot = fx.dmgSlots[oldest];
        }
        slot.active = true;
        slot.x = x;
        slot.y = y;
        slot.damage = damage;
        slot.elapsedMs = 0;
    },
    PLAYER_FLOAT_MS: 2000,
    FLOAT_HOLD_MS: 500,
    FLOAT_RISE_MS: 1500,
    FLOAT_RISE_PX: 28,
    PLAYER_FLOAT_SLOTS: 12,
    createEmptyPlayerFloatFx: function() {
        const slots = [];
        for (let i = 0; i < engine.PLAYER_FLOAT_SLOTS; i++) {
            slots.push({ active: false, x: 0, y: 0, text: "", kind: "", elapsedMs: 0 });
        }
        return { slots: slots };
    },
    ensurePlayerFloatFx: function() {
        if (!data.battle) {
            return null;
        }
        const fx = data.battle.playerFloatFx;
        if (!fx || !Array.isArray(fx.slots) || fx.slots.length !== engine.PLAYER_FLOAT_SLOTS) {
            data.battle.playerFloatFx = engine.createEmptyPlayerFloatFx();
        }
        return data.battle.playerFloatFx;
    },
    formatPlayerFloatText: function(amount, gain) {
        if (typeof view === "undefined" || typeof view.formatSlapDamageText !== "function") {
            return "";
        }
        if (gain) {
            if (!(amount > 0)) {
                return "";
            }
            const gainBody = view.formatSlapDamageText(amount);
            if (!gainBody || gainBody === "0.0" || gainBody === "-0.0") {
                return "";
            }
            return "+" + gainBody;
        }
        if (!(amount >= 0)) {
            return "";
        }
        const body = view.formatSlapDamageText(amount);
        return body || "";
    },
    getPlayerAvatarFloatAnchor: function() {
        const layer = document.getElementById("slapFxLayer");
        const wrap = document.getElementById("playerAvatarWrap");
        if (!layer || !wrap) {
            return null;
        }
        const layerRect = layer.getBoundingClientRect();
        const wrapRect = wrap.getBoundingClientRect();
        if (wrapRect.width <= 0 || wrapRect.height <= 0) {
            return null;
        }
        const left = wrapRect.left - layerRect.left;
        const top = wrapRect.top - layerRect.top;
        return {
            left: left,
            top: top,
            width: wrapRect.width,
            height: wrapRect.height,
            centerX: left + (wrapRect.width / 2)
        };
    },
    spawnPlayerFloatSlot: function(x, y, text, kind) {
        if (typeof view === "undefined" || !view.isBattleVisible || !view.isBattleVisible()) {
            return;
        }
        const fx = engine.ensurePlayerFloatFx();
        if (!fx || !text) {
            return;
        }
        let slot = null;
        let oldest = 0;
        for (let i = 0; i < fx.slots.length; i++) {
            if (!fx.slots[i].active) {
                slot = fx.slots[i];
                break;
            }
            if (fx.slots[i].elapsedMs > fx.slots[oldest].elapsedMs) {
                oldest = i;
            }
        }
        if (!slot) {
            slot = fx.slots[oldest];
        }
        slot.active = true;
        slot.x = x;
        slot.y = y;
        slot.text = text;
        slot.kind = kind;
        slot.elapsedMs = 0;
    },
    spawnAudGainFloat: function(amount, side) {
        if (!data.battle || data.battle.state !== "running") {
            return;
        }
        const text = engine.formatPlayerFloatText(amount, true);
        const anchor = engine.getPlayerAvatarFloatAnchor();
        if (!text || !anchor) {
            return;
        }
        const y0 = anchor.top + ((anchor.height - 50) / 2);
        const x0 = side === "left" ? (anchor.left - 50) : (anchor.left + anchor.width);
        engine.spawnPlayerFloatSlot(x0 + (Math.random() * 50), y0 + (Math.random() * 50), text, "gain");
    },
    spawnPlayerHurtFloat: function(intruder, amount) {
        if (!data.battle || data.battle.state !== "running" || !intruder) {
            return;
        }
        const text = engine.formatPlayerFloatText(Math.max(0, amount || 0), false);
        if (!text) {
            return;
        }
        const lm = engine.getBattleLaneMetrics();
        const x = lm.inset + ((intruder.lane || 0) + 0.5) * lm.laneWidth;
        const y = (intruder.yPx || 0) + (intruder.sizePx || 0);
        engine.spawnPlayerFloatSlot(x, y, text, "hurt");
    },
    updatePlayerFloats: function(tickMs) {
        const fx = engine.ensurePlayerFloatFx();
        if (!fx) {
            return;
        }
        for (let i = 0; i < fx.slots.length; i++) {
            const slot = fx.slots[i];
            if (!slot.active) {
                continue;
            }
            slot.elapsedMs += tickMs;
            if (slot.elapsedMs >= engine.PLAYER_FLOAT_MS) {
                slot.active = false;
            }
        }
    },
    onSlapImpact: function(target, damage) {
        const fx = engine.ensureSlapFx();
        if (!fx || !target) {
            return;
        }
        const box = engine.getSlapTargetBox(target);
        const travel = engine.SLAP_WINDUP_TRAVEL_PX;
        const impactSpeed = engine.slapWindupPeakSpeed(travel);
        // Player-anchored windup must snap to the enemy on impact; side/inner stay as usual.
        if (fx.phase !== "windup" || fx.windupAtPlayer) {
            const dir = engine.resolveSlapDir(target.lane);
            const xs = engine.getSlapWindupXs(box, dir);
            fx.dir = dir;
            fx.targetId = target.id;
            fx.x = xs.hitX;
            fx.prevX = xs.hitX;
            fx.y = box.handY;
            fx.prevY = box.handY;
            fx.vx = dir * impactSpeed;
            fx.startX = xs.startX;
            fx.hitX = xs.hitX;
            fx.travelPx = xs.travel;
        } else {
            fx.vx = engine.slapWindupVelocity(fx, fx.phaseElapsedMs);
        }
        fx.phase = "side";
        fx.phaseElapsedMs = 0;
        fx.windupPending = false;
        fx.windupAtPlayer = false;
        const contactX = fx.dir === 1 ? box.left : box.right;
        engine.spawnSlapDamageFx(contactX, fx.y, damage);
    },
    updateSlapFx: function(tickMs) {
        const fx = engine.ensureSlapFx();
        if (!fx) {
            return;
        }
        const dt = tickMs / 1000;
        if (fx.phase === "windup") {
            if (fx.windupAtPlayer) {
                const dir = engine.resolvePlayerSlapHoldDir();
                fx.dir = dir;
                const box = engine.getSlapPlayerBox(dir);
                if (!box) {
                    engine.idleSlapHand();
                } else {
                    const xs = engine.getSlapWindupXs(box, dir);
                    fx.prevX = fx.x;
                    fx.prevY = fx.y;
                    fx.hitX = xs.hitX;
                    fx.startX = xs.startX;
                    fx.x = xs.hitX;
                    fx.y = box.handY;
                    fx.vx = 0;
                }
            } else {
                const windupTarget = engine.findIntruderById(fx.targetId);
                if (!windupTarget || !windupTarget.alive || !windupTarget.inRange) {
                    const liveTarget = engine.getSlapWindupTarget();
                    if (liveTarget) {
                        engine.startSlapWindup(liveTarget);
                    } else {
                        engine.startSlapWindup(null);
                    }
                } else {
                    fx.prevX = fx.x;
                    fx.prevY = fx.y;
                    fx.phaseElapsedMs += tickMs;
                    fx.x = engine.slapWindupX(fx, fx.phaseElapsedMs);
                    fx.vx = engine.slapWindupVelocity(fx, fx.phaseElapsedMs);
                    fx.y = engine.getSlapTargetBox(windupTarget).handY;
                }
            }
        } else if (fx.phase === "side") {
            fx.prevX = fx.x;
            fx.prevY = fx.y;
            fx.phaseElapsedMs += tickMs;
            fx.x += fx.vx * dt;
            if (fx.phaseElapsedMs >= engine.SLAP_SIDE_MS) {
                fx.phase = "inner";
                fx.phaseElapsedMs = 0;
                fx.vxInner0 = fx.vx;
                fx.innerStartX = fx.x;
            }
        } else if (fx.phase === "inner") {
            fx.prevX = fx.x;
            fx.prevY = fx.y;
            fx.phaseElapsedMs += tickMs;
            const t = Math.min(fx.phaseElapsedMs, engine.SLAP_INNER_MS) / 1000;
            const innerDur = engine.SLAP_INNER_MS / 1000;
            const v0 = fx.vxInner0;
            const ax = innerDur > 0 ? (-0.5 * v0 / innerDur) : 0;
            fx.x = fx.innerStartX + v0 * t + 0.5 * ax * t * t;
            fx.vx = v0 + ax * t;
            if (fx.phaseElapsedMs >= engine.SLAP_INNER_MS) {
                engine.idleSlapHand();
            }
        }
        for (let i = 0; i < fx.dmgSlots.length; i++) {
            const slot = fx.dmgSlots[i];
            if (!slot.active) {
                continue;
            }
            slot.elapsedMs += tickMs;
            if (slot.elapsedMs >= engine.SLAP_DMG_MS) {
                slot.active = false;
            }
        }
    },
    createEmptyIntruderAttackFx: function() {
        const slots = [];
        const n = engine.INTRUDER_ATTACK_FX_SLOTS || 12;
        for (let i = 0; i < n; i++) {
            slots.push({
                active: false,
                kind: "",
                seq: 0,
                x: 0,
                y: 0,
                prevX: 0,
                prevY: 0,
                opacity: 1,
                prevOpacity: 1,
                vx: 0,
                vy: 0,
                startX: 0,
                startY: 0,
                destX: 0,
                destY: 0,
                elapsedMs: 0,
                durationMs: 0
            });
        }
        return { seq: 0, slots: slots };
    },
    ensureIntruderAttackFx: function() {
        if (!data.battle) {
            return null;
        }
        const fx = data.battle.intruderAttackFx;
        const n = engine.INTRUDER_ATTACK_FX_SLOTS;
        if (!fx || !Array.isArray(fx.slots) || fx.slots.length !== n) {
            data.battle.intruderAttackFx = engine.createEmptyIntruderAttackFx();
        }
        return data.battle.intruderAttackFx;
    },
    getPlayerImageCenter: function() {
        const lm = engine.getBattleLaneMetrics();
        const bh = viewData.layout.battlefieldHeightPx || 500;
        const pt = viewData.layout.playerTopPx || (bh - 65);
        return { x: lm.battleWidth / 2, y: pt + 24 };
    },
    getIntruderImageCenter: function(intruder) {
        const lm = engine.getBattleLaneMetrics();
        return {
            x: lm.inset + (intruder.lane + 0.5) * lm.laneWidth,
            y: intruder.yPx + (intruder.sizePx / 2)
        };
    },
    getScoundrelWinkOrigin: function(intruder) {
        const center = engine.getIntruderImageCenter(intruder);
        const size = intruder.sizePx || 0;
        const left = center.x - (size / 2);
        const t = Math.random();
        return {
            x: left + size * (0.25 + (0.5 * t)),
            y: intruder.yPx + (size * 0.25)
        };
    },
    acquireIntruderAttackSlot: function() {
        const fx = engine.ensureIntruderAttackFx();
        if (!fx) {
            return null;
        }
        let slot = null;
        let oldest = 0;
        for (let i = 0; i < fx.slots.length; i++) {
            if (!fx.slots[i].active) {
                slot = fx.slots[i];
                break;
            }
            if (fx.slots[i].seq < fx.slots[oldest].seq) {
                oldest = i;
            }
        }
        if (!slot) {
            slot = fx.slots[oldest];
        }
        fx.seq = (fx.seq || 0) + 1;
        slot.seq = fx.seq;
        slot.active = true;
        slot.elapsedMs = 0;
        slot.opacity = 1;
        slot.prevOpacity = 1;
        return slot;
    },
    spawnWinkGfx: function(intruder) {
        if (!intruder) {
            return;
        }
        const origin = engine.getScoundrelWinkOrigin(intruder);
        const center = engine.getIntruderImageCenter(intruder);
        const player = engine.getPlayerImageCenter();
        const destX = (center.x + player.x) / 2;
        const destY = (center.y + player.y) / 2;
        const dist = Math.hypot(destX - origin.x, destY - origin.y);
        if (dist < 1) {
            return;
        }
        const slot = engine.acquireIntruderAttackSlot();
        if (!slot) {
            return;
        }
        const durationMs = (2 * dist / engine.WINK_SPEED_PX) * 1000;
        slot.kind = "wink";
        slot.x = origin.x;
        slot.y = origin.y;
        slot.prevX = origin.x;
        slot.prevY = origin.y;
        slot.startX = origin.x;
        slot.startY = origin.y;
        slot.destX = destX;
        slot.destY = destY;
        slot.vx = 0;
        slot.vy = 0;
        slot.durationMs = durationMs;
        slot.elapsedMs = 0;
        slot.opacity = 1;
        slot.prevOpacity = 1;
    },
    spawnLeerGfx: function(intruder) {
        if (!intruder) {
            return;
        }
        const center = engine.getIntruderImageCenter(intruder);
        const player = engine.getPlayerImageCenter();
        const midX = (center.x + player.x) / 2;
        const midY = (center.y + player.y) / 2;
        const halfDist = Math.hypot(midX - center.x, midY - center.y);
        const toPlayer = Math.hypot(player.x - center.x, player.y - center.y);
        if (halfDist < 1 || toPlayer < 1) {
            return;
        }
        const slot = engine.acquireIntruderAttackSlot();
        if (!slot) {
            return;
        }
        const eyeY = intruder.yPx + ((intruder.sizePx || 0) * 0.25);
        const winkDist = Math.hypot(midX - center.x, midY - eyeY);
        const winkMs = (2 * Math.max(winkDist, halfDist) / engine.WINK_SPEED_PX) * 1000;
        slot.kind = "leer";
        slot.x = center.x;
        slot.y = center.y;
        slot.prevX = center.x;
        slot.prevY = center.y;
        slot.startX = center.x;
        slot.startY = center.y;
        slot.destX = player.x;
        slot.destY = player.y;
        slot.vx = ((player.x - center.x) / toPlayer) * engine.LEER_SPEED_PX;
        slot.vy = ((player.y - center.y) / toPlayer) * engine.LEER_SPEED_PX;
        slot.durationMs = winkMs * 2;
        slot.elapsedMs = 0;
        slot.opacity = 1;
        slot.prevOpacity = 1;
    },
    updateIntruderAttackFx: function(tickMs) {
        const fx = engine.ensureIntruderAttackFx();
        if (!fx) {
            return;
        }
        const dt = tickMs / 1000;
        for (let i = 0; i < fx.slots.length; i++) {
            const slot = fx.slots[i];
            if (!slot.active) {
                continue;
            }
            slot.prevX = slot.x;
            slot.prevY = slot.y;
            slot.prevOpacity = slot.opacity;
            slot.elapsedMs += tickMs;
            const duration = slot.durationMs > 0 ? slot.durationMs : 1;
            const u = Math.min(1, slot.elapsedMs / duration);
            if (slot.kind === "wink") {
                const along = u * (2 - u);
                slot.x = slot.startX + ((slot.destX - slot.startX) * along);
                slot.y = slot.startY + ((slot.destY - slot.startY) * along);
            } else {
                slot.x += slot.vx * dt;
                slot.y += slot.vy * dt;
            }
            slot.opacity = 1 - u;
            if (u >= 1) {
                slot.active = false;
            }
        }
    },
    enqueueSlapLineFx: function(target) {
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
        const sneakFracR = snEffR.firstHitDamageBonusFraction || 0;
        const priorHits = rt.timesHitByPlayer || 0;
        const xpEffR = skills.getSkillEffect("exploit");
        const exploitStepR = xpEffR.flatDamagePerConsecutiveStep || 0;
        const prevTarget = data.battle.lastPlayerHitIntruderId || 0;
        const streak = (prevTarget === rt.id) ? ((data.battle.lastPlayerHitStreak || 0) + 1) : 1;
        let exploitFlatR = 0;
        if (exploitStepR > 0 && streak >= 2) {
            exploitFlatR = (streak - 1) * exploitStepR;
        }
        sandalDamage = engine.applyCombatOutgoingDamage(sandalDamage, rt, {
            consumeFury: true,
            flatBonus: exploitFlatR
        });
        if (sneakFracR > 0 && priorHits === 0) {
            sandalDamage *= 1 + sneakFracR;
        }
        sandalDamage = Math.max(1, roundNearestDecimals(sandalDamage, 1));
        sandalDamage *= bonfire.getCombatDamageMultiplier();
        sandalDamage = Math.max(1, roundNearestDecimals(sandalDamage, 1));
        skillEngine.addCombatOutgoingHitSkillExp(rt, priorHits);
        const audBeforeSandal = rt.aud;
        rt.aud -= sandalDamage;
        skills.fireTrigger("onAttackLogDamage", { damage: sandalDamage });
        data.battle.lastPlayerHitIntruderId = rt.id;
        data.battle.lastPlayerHitStreak = streak;
        rt.timesHitByPlayer = priorHits + 1;
        if (priorHits === 0) {
            skills.fireTrigger("onFirstHit");
        }
        const imEff = skills.getSkillEffect("impact");
        const impactTravel = imEff.knockbackTravelSeconds || 0;
        const battleHeight = viewData.layout.battlefieldHeightPx || 500;
        const playerTopY = viewData.layout.playerTopPx || (battleHeight - 65);
        const line300FtY = playerTopY - 300;
        if ((rt.yPx + rt.sizePx) >= line300FtY) {
            skills.fireTrigger("onSandalUpperHalf");
        }
        if (impactTravel > 0) {
            const knockbackPx = rt.speedPxPerSecond * impactTravel;
            rt.yPx = Math.max(-rt.sizePx, rt.yPx - knockbackPx);
            rt.inRange = false;
        }
        if (cls === "mock" && (data.battle.classPowerA || 0) >= 1000) {
            const t2 = engine.getSecondSandalDamageTarget(rt.id);
            if (t2) {
                data.battle.classPowerA -= 1000;
                const audBeforeT2 = t2.aud;
                t2.aud -= sandalDamage;
                engine.enqueueSandalLineFx(t2);
                skills.fireTrigger("onAttackLogDamage", { damage: sandalDamage });
                if (t2.aud <= 0) {
                    t2.aud = 0;
                    t2.alive = false;
                    if (data.battle.activeTargetId === t2.id) data.battle.activeTargetId = null;
                    engine.removeIntruderFromSlapQueue(t2.id);
                    engine.onIntruderKilled(t2, {
                        __OVERKILL__BoostKind: "sandal",
                        overkillDamage: Math.max(0, sandalDamage - audBeforeT2)
                    });
                    skills.fireTrigger("onSandalKill");
                }
            }
        }
        engine.enqueueSandalLineFx(rt);
        const rcd = engine.cooldownAfterOutrageSpend(engine.getEffectiveSandalCooldownMs(), rt);
        p.sandalAttackTimerMs = rcd + Math.min(0, p.sandalAttackTimerMs);
        if (cls === "mock") {
            engine.addClassBarProgress("A", 200);
        }
        skills.fireTrigger("onAttack");
        if (rt.aud <= 0) {
            rt.aud = 0;
            rt.alive = false;
            if (data.battle.activeTargetId === rt.id) {
                data.battle.activeTargetId = null;
            }
            engine.removeIntruderFromSlapQueue(rt.id);
            engine.onIntruderKilled(rt, {
                __OVERKILL__BoostKind: "sandal",
                overkillDamage: Math.max(0, sandalDamage - audBeforeSandal)
            });
            skills.fireTrigger("onSandalKill");
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
    addSkillExp: function(skillKey, amount) {
        if (!amount || amount <= 0) {
            return;
        }
        if (!skills.isSkillUnlocked(skillKey)) {
            return;
        }
        if (!skills.isSkillEquipped(skillKey)) {
            return;
        }
        const d = skills._byKey[skillKey];
        if (d && d.classKey && d.classKey !== (data.progress.currentClassKey || "none")) {
            return;
        }
        const skill = data.progress.skills[skillKey];
        if (skill.maxLevel !== undefined && skill.level >= skill.maxLevel) {
            return;
        }
        const gainBase = skills.expGainForSkillTrigger(skill, amount);
        const intMult = typeof skills.equippedSkillExpMultiplier === "function"
            ? skills.equippedSkillExpMultiplier(skillKey)
            : (typeof skills.getOtherSkillExpMultiplier === "function"
                ? skills.getOtherSkillExpMultiplier(skillKey)
                : (skillKey !== "echoChamber" ? skills.getEchoChamberExpMultiplierForOthers() : 1));
        const soulMult = engine.getSoulSkillExpMultiplier();
        const gain = gainBase * intMult * soulMult;
        const slotForColumn = skills.findSkillEquipSlot(skillKey);
        const trackColumnReward = slotForColumn && (slotForColumn.column === "offense" || slotForColumn.column === "defense");
        const offenseRewardBefore = trackColumnReward ? (skills.columnReward("offense").value || 0) : 0;
        const defenseRewardBefore = trackColumnReward ? (skills.columnReward("defense").value || 0) : 0;
        const cardEff = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? shrineCards.getAggregatedEffects() : {};
        const skillCardAdd = cardEff.skillExpAdd || 0;
        const talentCardAdd = cardEff.talentExpAdd || 0;
        skill.exp += gain * (1 + skillCardAdd);
        skill.talent += gain * 0.1 * (1 + talentCardAdd);
        skill.triggerCount += amount;
        const initTal = d.initialTalentToLevel !== undefined ? d.initialTalentToLevel : 10;
        while (skill.exp >= skill.expToLevel && (!skill.maxLevel || skill.level < skill.maxLevel)) {
            skill.exp -= skill.expToLevel;
            skill.level++;
            skill.expToLevel = skills.getExpToLevel(skillKey, skill.level);
            engine.onSkillLevelUp(skill);
        }
        while (skill.talent >= skill.talentToLevel) {
            skill.talent -= skill.talentToLevel;
            skill.talentLevel++;
            skill.talentToLevel = skill.talentToLevel * 1.05;
        }
        if (trackColumnReward) {
            const offenseRewardAfter = skills.columnReward("offense").value || 0;
            const defenseRewardAfter = skills.columnReward("defense").value || 0;
            if (offenseRewardAfter !== offenseRewardBefore || defenseRewardAfter !== defenseRewardBefore) {
                initialize.calcPlayerStats(false);
            }
        }
    },
    onSkillLevelUp: function(skill) {
        const def = skills._byKey[skill.key];
        const cat = def && def.category ? def.category : "combat";
        if (cat === "combat" || cat === "class") {
            skills.fireTrigger("onOtherSkillLevel", { excludeKey: skill.key });
        }
        if (skill.key === "recognition" && skills.isSkillUnlocked("recognition")) {
            const recEff = skills.getSkillEffect("recognition");
            const cloutGain = recEff.cloutPerLevel || 0;
            if (cloutGain > 0) {
                engine.addCloutStacks(cloutGain, "recognition");
            }
        }
        if (skill.key === "adrenaline") {
            data.battle.levelState.skillStrBonus++;
            initialize.calcPlayerStats(false);
        } else if (skill.key === "no_skill_yet") {
            data.battle.levelState.skillConBonus++;
            initialize.calcPlayerStats(false);
        } else if (skill.key === "alacrity") {
            engine.syncPlayerCooldownFields();
        } else if (skill.key === "shameless" || skill.key === "corneredEgo") {
            // Equal recover covers the max rise. Extra heal is 3 x the new level, and is not boosted by Narcissism.
            initialize.calcPlayerStats(false, { extraCurrentOnMaxRise: 3 * (skill.level || 0), healSource: skill.key });
        } else if (skill.key === "force" || skill.key === "longshot") {
            initialize.calcPlayerStats(false);
        } else if (skill.key === "windfallSwagger" || skill.key === "shockValue" || skill.key === "validation" || skill.key === "paddingResume" || skill.key === "adaptation" || skill.key === "savageLessons" || skill.key === "mountingEgo" || skill.key === "bravado") {
            initialize.calcPlayerStats(false);
        }
    },
    /** Shards/s implied by the last history run, if the clone is still on that map. */
    getCloneShardRatePerSecond: function() {
        const history = (data.progress && data.progress.runHistory) || [];
        const run = history[0];
        if (!run) {
            return 0;
        }
        const settings = data.battle && data.battle.cloneRunSettings;
        const cloneMap = settings && settings.mapKey;
        if (!cloneMap || run.mapKey !== cloneMap) {
            return 0;
        }
        const seconds = Number(run.survivedSeconds) || 0;
        if (!(seconds > 0)) {
            return 0;
        }
        const maps = (data.progress && data.progress.mapDefinitions) || [];
        let map = null;
        for (let i = 0; i < maps.length; i++) {
            if (maps[i] && maps[i].key === run.mapKey) {
                map = maps[i];
                break;
            }
        }
        if (!map) {
            return 0;
        }
        const zones = map.zones || [];
        let enemyCount = 0;
        for (let z = 0; z < zones.length; z++) {
            enemyCount += Math.max(0, zones[z].totalEnemies || 0);
        }
        if (!(enemyCount > 0)) {
            return 0;
        }
        const amount = mapData.getMapShardDropAmount(map);
        if (!(amount > 0)) {
            return 0;
        }
        const sumDiff = mapData.getMapZoneDifficultySum(map);
        if (!(sumDiff > 0)) {
            return 0;
        }
        let remaining = Math.max(0, run.kills || 0);
        if (!(remaining > 0)) {
            return 0;
        }
        let expected = 0;
        for (let tier = 0; tier < 3 && remaining > 0; tier++) {
            const pool = mapData.getMapShardChancePool(tier);
            for (let zi = 0; zi < zones.length && remaining > 0; zi++) {
                const zone = zones[zi];
                const enemies = Math.max(0, zone.totalEnemies || 0);
                if (!(enemies > 0)) {
                    continue;
                }
                const taken = Math.min(remaining, enemies);
                const waveShare = Math.max(0, zone.difficulty || 0) / sumDiff;
                expected += pool * waveShare * (taken / enemies) * amount;
                remaining -= taken;
            }
        }
        if (!(expected > 0)) {
            return 0;
        }
        return expected / seconds;
    },
    saveRunHistoryIfNeeded: function() {
        if (data.battle.historyLogged) {
            return;
        }
        const runSeconds = (data.battle.cloneAliveMs !== undefined ? data.battle.cloneAliveMs : (data.battle.elapsedMs || 0)) / 1000;
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
                talentRows.push(`${sk.name} talent +${t1 - t0}`);
            }
        }
        const mapKey = (data.battle.cloneRunSettings && data.battle.cloneRunSettings.mapKey) || data.progress.currentMapKey || "";
        const cloneDensity = data.battle.cloneDensity !== undefined && data.battle.cloneDensity !== null
            ? data.battle.cloneDensity
            : ((data.battle.cloneRunSettings && data.battle.cloneRunSettings.cloneDensity) || 0);
        data.progress.runHistory.unshift({
            mapKey: mapKey,
            survivedSeconds: runSeconds,
            coinsGained: runCoins,
            coinsPerSecond: runCoinsPerSecond,
            level: runLevel,
            kills: runKills,
            talentRows: talentRows,
            shardsGained: data.battle.runShardsGained || 0,
            okamiExpGained: engine.getPendingOkamiExpWithSoul(),
            cloneDensity: cloneDensity,
            starCleared: data.battle.runStarCleared || null
        });
        if (data.progress.runHistory.length > 30) {
            data.progress.runHistory = data.progress.runHistory.slice(0, 30);
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
        engine.decayLegendPenalty(tickMs);
        const base = data.progress.base;
        if (!base) {
            return;
        }
        engine.updateToriiVisitors(tickMs);
        engine.admitWaitingToriiVisitors();
        engine.updateToriiVisitorDraw(tickMs);
        engine.updateStonePileDuplication(tickMs);
        engine.updateNoodleBar(tickMs);
        engine.updateZenkoGuests(tickMs);
        engine.updateLaundryBasins(tickMs);
        engine.updateMine(tickMs);
        engine.updateEarthSpirits(tickMs);
        engine.updateWaterSpirits(tickMs);
        engine.updatePebbles(tickMs);
        engine.updateInnWaterCarriers(tickMs);
        engine.updateCisternWaterCarriers(tickMs);
        engine.updateDroplets(tickMs);
        engine.updateFireSpirits(tickMs);
        engine.updateFireLaunchers(tickMs);
        engine.updatePondWaterSpirits(tickMs);
        engine.updateWishingWellWater(tickMs);
        engine.updateWishingWellCoins(tickMs);
        engine.updatePondWaterTransfer(tickMs);
        engine.updateOkamiPathJob(tickMs);
        engine.updateSpiritTraining(tickMs);
        engine.updateBambooForest(tickMs);
        engine.updateFoxDenConstruction(tickMs);
        engine.updateBonfireHeatDecay();
        engine.updateBonfireWoodCarriers(tickMs);
        engine.updateBonfireKiln(tickMs);
        engine.updateMarketCreditCarriers(tickMs);
        engine.updateMarketTrades(tickMs);
        engine.updateDirtRoads(tickMs);
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
        const secondFloor = inn && inn.secondFloorRoomsBought ? inn.secondFloorRoomsBought : 0;
        return 1 + bought + secondFloor;
    },
    getInnRestDurationSeconds: function() {
        const inn = data.progress.base && data.progress.base.inn;
        const furniture = inn && inn.furnitureBought ? inn.furnitureBought : 0;
        const cardAdd = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().innRestDurationFlat || 0) : 0;
        return 5 + furniture * 3 + cardAdd;
    },
    getInnRestAllowedSeconds: function() {
        const cap = engine.getInnRestDurationSeconds();
        const inn = data.progress.base && data.progress.base.inn;
        if (!inn || inn.restPinnedToMax !== false || inn.restSecondsAllowed === undefined || inn.restSecondsAllowed === null) {
            return cap;
        }
        const saved = Number(inn.restSecondsAllowed);
        if (!isFinite(saved)) {
            return cap;
        }
        return Math.max(5, Math.min(cap, Math.round(saved)));
    },
    getInnReinforceJointsMaxPurchases: function() {
        return 3;
    },
    getInnFurnitureBaseMaxPurchases: function() {
        return 5;
    },
    getInnAddRoomBaseMaxPurchases: function() {
        return 2;
    },
    getInnFurnitureMaxPurchases: function() {
        const inn = data.progress.base.inn;
        const reinforced = inn.reinforceJointsBought || 0;
        return engine.getInnFurnitureBaseMaxPurchases() + reinforced;
    },
    getInnAddRoomMaxPurchases: function() {
        const inn = data.progress.base.inn;
        const reinforced = inn.reinforceJointsBought || 0;
        return engine.getInnAddRoomBaseMaxPurchases() + reinforced;
    },
    getInnFurnitureAbsoluteMaxPurchases: function() {
        return engine.getInnFurnitureMaxPurchases();
    },
    getInnAddRoomAbsoluteMaxPurchases: function() {
        return engine.getInnAddRoomMaxPurchases();
    },
    isInnOnsenConverted: function() {
        return !!data.progress.base.inn.onsenConverted;
    },
    getInnDisplayName: function() {
        return engine.isInnOnsenConverted() ? "Tatami Onsen" : "Tatami Inn";
    },
    getInnHotWaterCapacity: function() {
        const inn = data.progress.base && data.progress.base.inn;
        const base = (inn && inn.hotWaterCapacity) || 500;
        const cistern = data.progress.base && data.progress.base.cistern;
        const bonus = ((cistern && cistern.reinforceOnsenCapacityBought) || 0) * 1000;
        return base + bonus;
    },
    isInnHotWaterFull: function() {
        const inn = data.progress.base.inn;
        return (inn.hotWater || 0) >= engine.getInnHotWaterCapacity();
    },
    isCisternWaterHotEnoughForOnsen: function() {
        const cistern = data.progress.base && data.progress.base.cistern;
        return !!cistern && (cistern.temperature || 0) > 40 && (cistern.waterVolume || 0) > 0;
    },
    isToriiDrinkingBowlUnlocked: function() {
        const torii = data.progress.base && data.progress.base.torii;
        return !!(torii && torii.drinkingBowlUnlocked);
    },
    getToriiWaterCapacity: function() {
        if (!engine.isToriiDrinkingBowlUnlocked()) {
            return 0;
        }
        const cistern = data.progress.base && data.progress.base.cistern;
        const bonus = ((cistern && cistern.reinforceToriiCapacityBought) || 0) * 700;
        return 200 + bonus;
    },
    isToriiWaterFull: function() {
        const cap = engine.getToriiWaterCapacity();
        if (cap <= 0) {
            return true;
        }
        const torii = data.progress.base && data.progress.base.torii;
        return !!torii && (torii.water || 0) >= cap;
    },
    getToriiVisitorWaterCost: function() {
        return 50;
    },
    /** Cistern workers haul to the onsen, or to the Torii once the drinking bowl is placed. */
    cisternWorkersRevealed: function() {
        return engine.isInnOnsenConverted() || engine.isToriiDrinkingBowlUnlocked();
    },
    cisternHasAssignedCarriers: function() {
        if (!engine.cisternWorkersRevealed()) {
            return false;
        }
        const cistern = data.progress.base.cistern;
        const okami = engine.getOkami();
        return (cistern.assignedWorkers || 0) > 0 || okami.assignedBuildingKey === "cistern";
    },
    /** Sinks that still need water (not full). Used for idle notify even when temp blocks delivery. */
    getWaterDeliverySinksNeedingWater: function() {
        const sinks = [];
        const pushSink = function(sink) {
            const inbound = engine.getCisternInboundWater(sink.key);
            if ((sink.current || 0) + inbound >= (sink.capacity || 0)) {
                return;
            }
            sinks.push(sink);
        };
        if (engine.isInnOnsenConverted() && !engine.isInnHotWaterFull()) {
            const inn = data.progress.base.inn;
            pushSink({
                key: "inn",
                tempMin: 40,
                current: inn.hotWater || 0,
                capacity: engine.getInnHotWaterCapacity()
            });
        }
        if (engine.isNoodleBarBuilt() && !engine.isNoodleBarHotWaterFull()) {
            const bar = data.progress.base.noodleBar;
            pushSink({
                key: "noodleBar",
                tempMin: 65,
                current: bar.hotWater || 0,
                capacity: engine.getNoodleBarHotWaterCapacity()
            });
        }
        if (engine.isToriiDrinkingBowlUnlocked() && !engine.isToriiWaterFull()) {
            const torii = data.progress.base.torii;
            pushSink({
                key: "torii",
                tempMin: 26,
                tempMinInclusive: true,
                current: torii.water || 0,
                capacity: engine.getToriiWaterCapacity()
            });
        }
        return sinks;
    },
    isWaterOrdersUnlocked: function() {
        const garden = data.progress.base && data.progress.base.garden;
        return !!(garden && garden.arrangementOfWaterOrdersUnlocked);
    },
    isBuildingAllowingWaterCarriers: function(buildingKey) {
        if (!engine.isWaterOrdersUnlocked()) {
            return true;
        }
        const b = data.progress.base && data.progress.base[buildingKey];
        if (!b || b.allowCarriersBringWater === undefined) {
            return true;
        }
        return !!b.allowCarriersBringWater;
    },
    getCisternInboundWater: function(targetKey) {
        const cistern = data.progress.base && data.progress.base.cistern;
        const carriers = (cistern && cistern.waterCarriers) || [];
        let sum = 0;
        for (let i = 0; i < carriers.length; i++) {
            const dest = carriers[i].targetKey || "inn";
            if (dest === targetKey) {
                sum += carriers[i].amount || 0;
            }
        }
        if (targetKey === "inn") {
            const inn = data.progress.base && data.progress.base.inn;
            const innCarriers = (inn && inn.waterCarriers) || [];
            for (let j = 0; j < innCarriers.length; j++) {
                sum += innCarriers[j].amount || 0;
            }
        }
        return sum;
    },
    /**
     * Valid water delivery targets: temperature first, then lowest stored-plus-inbound liters.
     * Room left is capacity minus stored minus inbound (water already on carriers to that sink).
     * Prefer sinks that can take a full carrier load; otherwise allow partial top-offs.
     */
    getWaterDeliveryTargets: function() {
        const cistern = data.progress.base && data.progress.base.cistern;
        if (!cistern || (cistern.waterVolume || 0) <= 0) {
            return [];
        }
        const temp = cistern.temperature || 0;
        const sinks = engine.getWaterDeliverySinksNeedingWater();
        const fullLoad = Math.min(resortData.getCisternWaterCarryAmount(), cistern.waterVolume || 0);
        const fullTargets = [];
        const partialTargets = [];
        for (let i = 0; i < sinks.length; i++) {
            const sink = sinks[i];
            const min = sink.tempMin;
            const hotEnough = sink.tempMinInclusive ? temp >= min : temp > min;
            if (!hotEnough || !engine.isBuildingAllowingWaterCarriers(sink.key)) {
                continue;
            }
            const stored = sink.current || 0;
            const inbound = engine.getCisternInboundWater(sink.key);
            const room = (sink.capacity || 0) - stored - inbound;
            if (room <= 0) {
                continue;
            }
            sink.scheduled = stored + inbound;
            sink.room = room;
            if (room >= fullLoad) {
                fullTargets.push(sink);
            } else {
                partialTargets.push(sink);
            }
        }
        const targets = fullTargets.length ? fullTargets : partialTargets;
        targets.sort(function(a, b) {
            return (a.scheduled || 0) - (b.scheduled || 0);
        });
        return targets;
    },
    shouldShowCisternWaterNotify: function() {
        if (!engine.cisternWorkersRevealed() || !engine.cisternHasAssignedCarriers()) {
            return false;
        }
        const cistern = data.progress.base && data.progress.base.cistern;
        if (!cistern) {
            return false;
        }
        const temp = cistern.temperature || 0;
        const sinks = engine.getWaterDeliverySinksNeedingWater();
        let allowedNeeding = false;
        let anyHotEnough = false;
        for (let i = 0; i < sinks.length; i++) {
            if (!engine.isBuildingAllowingWaterCarriers(sinks[i].key)) {
                continue;
            }
            allowedNeeding = true;
            const min = sinks[i].tempMin;
            const hotEnough = sinks[i].tempMinInclusive ? temp >= min : temp > min;
            if (hotEnough) {
                anyHotEnough = true;
            }
        }
        return allowedNeeding && !anyHotEnough;
    },
    innHasAssignedCarriers: function() {
        if (!engine.isInnOnsenConverted()) {
            return false;
        }
        const inn = data.progress.base.inn;
        const okami = engine.getOkami();
        return (inn.assignedWorkers || 0) > 0 || okami.assignedBuildingKey === "inn";
    },
    shouldShowInnHotWaterNotify: function() {
        if (!engine.isInnOnsenConverted() || !engine.innHasAssignedCarriers()) {
            return false;
        }
        if (engine.isInnHotWaterFull()) {
            return false;
        }
        return !engine.isCisternWaterHotEnoughForOnsen();
    },
    getInnSoakHotWaterCost: function() {
        return 50;
    },
    canGuestStartSoak: function() {
        const inn = data.progress.base.inn;
        return !!(engine.isInnOnsenConverted() && (inn.hotWater || 0) >= engine.getInnSoakHotWaterCost());
    },
    createStokeFireSpirit: function() {
        const hs = data.progress.base && data.progress.base.hiddenSpring;
        if (!hs) {
            return false;
        }
        const placement = engine.findSpiritPlacementSlot("fire");
        if (!placement) {
            return false;
        }
        if (!hs.spirits) {
            hs.spirits = [];
        }
        if (!hs.spiritIdCounter) {
            hs.spiritIdCounter = 1;
        }
        const spirit = {
            id: hs.spiritIdCounter++,
            kind: "fire",
            colorIndex: (hs.spirits.length) % 8,
            level: 1,
            exp: 0,
            expToLevel: 15,
            spiritPower: 1,
            training: 0,
            trainingTimerMs: 0,
            location: placement.location,
            slot: placement.slot,
            forgeTimerMs: 0
        };
        hs.spirits.push(spirit);
        return true;
    },
    getInnRestfulnessPerSecond: function() {
        const inn = data.progress.base && data.progress.base.inn;
        const base = inn ? (inn.restfulnessPerSecond || 1) : 1;
        const decoration = inn && inn.decorationBought ? inn.decorationBought : 0;
        const cardAdd = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().innRestfulnessPerSecFlat || 0) : 0;
        return base + decoration * 0.5 + cardAdd;
    },
    isInnGentleLightsUnlocked: function() {
        const inn = data.progress.base && data.progress.base.inn;
        return !!(inn && inn.gentleLightsUnlocked);
    },
    getInnGentleLightsRestfulnessBonus: function() {
        const inn = data.progress.base && data.progress.base.inn;
        const shaped = inn && inn.shapedLampsBought ? inn.shapedLampsBought : 0;
        return 2 + shaped;
    },
    canInnGentleLightsApply: function(sec) {
        if (!engine.isInnGentleLightsUnlocked() || sec <= 0) {
            return false;
        }
        const inn = data.progress.base && data.progress.base.inn;
        if (!inn) {
            return false;
        }
        const occupied = (inn.guests || []).filter(function(g) { return !!g.room; }).length;
        if (occupied <= 0) {
            return false;
        }
        return (inn.mana || 0) >= occupied * 5 * sec;
    },
    getBuildingManaKeys: function() {
        return (resortData.manaBuildingKeys && resortData.manaBuildingKeys.slice()) || ["inn"];
    },
    isBuildingManaUnlocked: function(buildingKey) {
        const base = data.progress.base;
        if (!base) {
            return false;
        }
        if (buildingKey === "inn") {
            return engine.isInnBuiltFromFoxDen() && engine.isInnGentleLightsUnlocked();
        }
        if (buildingKey === "torii") {
            const rh = base.foxDen;
            const torii = base.torii;
            return !!(rh && rh.unlocks && rh.unlocks.torii && torii && torii.enticingLightsUnlocked);
        }
        if (buildingKey === "stonePile") {
            return !!(base.stonePile && base.stonePile.stoneDuplicatorUnlocked);
        }
        if (buildingKey === "hiddenSpring") {
            return !!(base.hiddenSpring && base.hiddenSpring.spiritTrainingSpotBought);
        }
        if (buildingKey === "bonfire") {
            return !!(base.bonfire && base.bonfire.kilnBuilt);
        }
        const b = base[buildingKey];
        return !!(b && b.manaUnlocked);
    },
    isBuildingManaRowVisible: function(buildingKey) {
        return engine.isBuildingManaUnlocked(buildingKey);
    },
    getBuildingManaState: function(buildingKey) {
        if (!engine.isBuildingManaUnlocked(buildingKey)) {
            return null;
        }
        const b = data.progress.base[buildingKey];
        if (!b) {
            return null;
        }
        const mana = b.mana || 0;
        const capacity = engine.getBuildingManaCapacity(buildingKey);
        const missing = Math.max(0, capacity - mana);
        return {
            key: buildingKey,
            mana: mana,
            capacity: capacity,
            missing: missing,
            missingPct: capacity > 0 ? missing / capacity : 0,
            allowCarriersBringMana: !!b.allowCarriersBringMana
        };
    },
    listManaNeedyBuildings: function() {
        const keys = engine.getBuildingManaKeys();
        const out = [];
        for (let i = 0; i < keys.length; i++) {
            const st = engine.getBuildingManaState(keys[i]);
            if (st && st.missing > 0) {
                out.push(st);
            }
        }
        return out;
    },
    deliverManaToBuilding: function(buildingKey, amount) {
        const amt = Math.max(0, amount || 0);
        if (amt <= 0 || !engine.isBuildingManaUnlocked(buildingKey)) {
            return 0;
        }
        const b = data.progress.base[buildingKey];
        if (!b) {
            return 0;
        }
        const cap = engine.getBuildingManaCapacity(buildingKey);
        const space = Math.max(0, cap - (b.mana || 0));
        const added = Math.min(space, amt);
        b.mana = (b.mana || 0) + added;
        return added;
    },
    enableCarriersBringManaOnAllBuildings: function() {
        const keys = engine.getBuildingManaKeys();
        const base = data.progress.base;
        if (!base) {
            return;
        }
        for (let i = 0; i < keys.length; i++) {
            const b = base[keys[i]];
            if (b) {
                b.allowCarriersBringMana = true;
            }
        }
    },
    getGlobalManaAmount: function() {
        const globalMana = data.progress.mana;
        return (globalMana && globalMana.amount) || 0;
    },
    getSendManaCloneCost: function() {
        return 2000;
    },
    getFillManaDeficit: function(buildingKey) {
        const st = engine.getBuildingManaState(buildingKey);
        return st ? st.missing : 0;
    },
    getFillManaFillAmount: function(buildingKey) {
        const deficit = engine.getFillManaDeficit(buildingKey);
        const globalAmt = engine.getGlobalManaAmount();
        if (buildingKey === "hiddenSpring") {
            const hs = data.progress.base && data.progress.base.hiddenSpring;
            if (hs && hs.sendManaCloneCargo && hs.sendManaCloneCargo.depositAmount !== undefined) {
                return hs.sendManaCloneCargo.depositAmount;
            }
            return Math.min(deficit, Math.max(0, globalAmt - engine.getSendManaCloneCost()));
        }
        const b = data.progress.base && data.progress.base[buildingKey];
        if (b && b.pendingFillManaDeposit) {
            return b.pendingFillManaDeposit;
        }
        return Math.min(deficit, globalAmt);
    },
    canStartFillMana: function(buildingKey) {
        if (!engine.isBuildingManaUnlocked(buildingKey)) {
            return false;
        }
        if (engine.getFillManaDeficit(buildingKey) <= 0) {
            return false;
        }
        if (buildingKey === "hiddenSpring") {
            const hs = data.progress.base && data.progress.base.hiddenSpring;
            if (hs && hs.sendManaCloneCargo) {
                return false;
            }
            if (engine.getGlobalManaAmount() <= engine.getSendManaCloneCost()) {
                return false;
            }
            if (engine.getFillManaFillAmount("hiddenSpring") <= 0) {
                return false;
            }
            if (engine.getManaCloneJob() || engine.getPausedManaCloneJob()) {
                return false;
            }
        } else {
            const b = data.progress.base && data.progress.base[buildingKey];
            if (b && b.pendingFillManaDeposit) {
                return false;
            }
        }
        return engine.getFillManaFillAmount(buildingKey) > 0;
    },
    getFillManaWeaveSeconds: function(buildingKey) {
        const weaving = data.progress.weaving;
        if (weaving && weaving.active && weaving.active.scopeKey === buildingKey && weaving.active.upgradeKey === "fillMana"
            && weaving.active.fillManaSeconds !== undefined) {
            return weaving.active.fillManaSeconds;
        }
        const paused = engine.getPausedWeavingEntry(buildingKey, "fillMana");
        if (paused && paused.fillManaSeconds !== undefined) {
            return paused.fillManaSeconds;
        }
        if (data.progress._pendingFillManaSeconds !== undefined) {
            return data.progress._pendingFillManaSeconds;
        }
        return engine.getFillManaFillAmount(buildingKey) / 200;
    },
    startFillMana: function(buildingKey) {
        if (buildingKey === "hiddenSpring") {
            return engine.startSendManaClone();
        }
        if (!engine.canStartFillMana(buildingKey)) {
            return false;
        }
        const b = data.progress.base[buildingKey];
        if (!b) {
            return false;
        }
        const amount = engine.getFillManaFillAmount(buildingKey);
        const globalMana = data.progress.mana;
        if (amount <= 0 || !globalMana) {
            return false;
        }
        globalMana.amount = Math.max(0, (globalMana.amount || 0) - amount);
        b.pendingFillManaDeposit = amount;
        data.progress._pendingFillManaSeconds = amount / 200;
        const up = engine.getUpgradeDef(buildingKey, "fillMana");
        const ok = engine.startWeaving(buildingKey, "fillMana", up);
        delete data.progress._pendingFillManaSeconds;
        if (!ok) {
            globalMana.amount = (globalMana.amount || 0) + amount;
            b.pendingFillManaDeposit = 0;
            return false;
        }
        return true;
    },
    completeFillMana: function(buildingKey) {
        if (!engine.isBuildingManaUnlocked(buildingKey)) {
            return;
        }
        const b = data.progress.base[buildingKey];
        if (!b) {
            return;
        }
        if (buildingKey === "hiddenSpring") {
            const cargo = b.sendManaCloneCargo;
            const transfer = cargo && cargo.depositAmount ? cargo.depositAmount : 0;
            const cap = engine.getBuildingManaCapacity(buildingKey);
            if (transfer > 0) {
                b.mana = Math.min(cap, (b.mana || 0) + transfer);
            }
            b.sendManaCloneCargo = null;
            return;
        }
        const cap = engine.getBuildingManaCapacity(buildingKey);
        const space = Math.max(0, cap - (b.mana || 0));
        let transfer = 0;
        if (b.pendingFillManaDeposit) {
            transfer = Math.min(space, b.pendingFillManaDeposit);
            b.pendingFillManaDeposit = 0;
        } else {
            const globalMana = data.progress.mana;
            const avail = (globalMana && globalMana.amount) || 0;
            transfer = Math.min(space, avail);
            if (transfer > 0 && globalMana) {
                globalMana.amount = Math.max(0, avail - transfer);
            }
        }
        if (transfer > 0) {
            b.mana = (b.mana || 0) + transfer;
        }
    },
    getTotalStone: function() {
        const pile = data.progress.base && data.progress.base.stonePile;
        if (!pile) {
            return 0;
        }
        return (pile.stone || 0) + (pile.dupedStone || 0);
    },
    isStoneCarryUnduplicatedAllowed: function() {
        const pile = data.progress.base && data.progress.base.stonePile;
        return !pile || pile.allowUnduplicatedStone !== false;
    },
    deductStone: function(amount, opts) {
        const pile = data.progress.base && data.progress.base.stonePile;
        const taken = { duped: 0, raw: 0 };
        if (!pile) {
            return taken;
        }
        let left = Math.floor(Math.max(0, amount || 0));
        const takeFrom = function(field, key) {
            const n = Math.min(left, Math.floor(pile[field] || 0));
            if (n > 0) {
                pile[field] = (pile[field] || 0) - n;
                taken[key] += n;
                left -= n;
            }
        };
        takeFrom("dupedStone", "duped");
        if (!opts || opts.allowUnduplicated !== false) {
            takeFrom("stone", "raw");
        }
        return taken;
    },
    refundStone: function(amount, stoneTaken) {
        const pile = data.progress.base && data.progress.base.stonePile;
        if (!pile) {
            return;
        }
        if (stoneTaken) {
            const dupedBack = (stoneTaken.duped || 0) + (stoneTaken.used || 0);
            pile.dupedStone = (pile.dupedStone || 0) + dupedBack;
            pile.stone = (pile.stone || 0) + (stoneTaken.raw || 0);
            return;
        }
        pile.stone = (pile.stone || 0) + Math.max(0, amount || 0);
    },
    getStoneDuplicatorBatch: function() {
        const market = data.progress.base && data.progress.base.market;
        if (market && market.improveStoneDuplicatorBought) {
            return { stone: 10, mana: 500 };
        }
        return { stone: 1, mana: 100 };
    },
    getStoneDuplicatorIntervalMs: function() {
        const cardAdd = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().stoneDupeSpeedAdd || 0) : 0;
        return 10000 / (1 + cardAdd);
    },
    updateStonePileDuplication: function(tickMs) {
        const pile = data.progress.base && data.progress.base.stonePile;
        if (!pile || !pile.stoneDuplicatorUnlocked) {
            return;
        }
        const intervalMs = engine.getStoneDuplicatorIntervalMs();
        if (pile.dupeTimerMs === undefined || pile.dupeTimerMs === null) {
            pile.dupeTimerMs = intervalMs;
        }
        pile.dupeTimerMs -= tickMs;
        while (pile.dupeTimerMs <= 0) {
            const batch = engine.getStoneDuplicatorBatch();
            if ((pile.stone || 0) >= batch.stone && (pile.mana || 0) >= batch.mana) {
                pile.mana -= batch.mana;
                pile.stone -= batch.stone;
                pile.dupedStone = (pile.dupedStone || 0) + batch.stone * 2;
            }
            pile.dupeTimerMs += intervalMs;
        }
    },
    applyInnGentleLightsTick: function(sec) {
        if (!engine.canInnGentleLightsApply(sec)) {
            return 0;
        }
        const inn = data.progress.base.inn;
        const occupied = (inn.guests || []).filter(function(g) { return !!g.room; }).length;
        inn.mana = Math.max(0, (inn.mana || 0) - occupied * 5 * sec);
        return engine.getInnGentleLightsRestfulnessBonus();
    },
    getInnTowelRestfulnessBonus: function() {
        return 100;
    },
    /** Additive Star Bead bonus from one soak: +30%, or +60% with soap. */
    getInnSoakBeadBonusAdd: function(usedSoap) {
        return usedSoap ? 0.60 : 0.30;
    },
    /** Multiplier form of soak bonus (1.30 / 1.60). */
    getInnSoakBeadMultiplier: function(usedSoap) {
        return 1 + engine.getInnSoakBeadBonusAdd(usedSoap);
    },
    getStarBeadCardMultiplier: function() {
        const cardAdd = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().starBeadAdd || 0) : 0;
        return 1 + cardAdd;
    },
    getVisitorRepetitionChance: function() {
        if (typeof shrineCards === "undefined" || !shrineCards.getAggregatedEffects) {
            return 0;
        }
        return shrineCards.getAggregatedEffects().visitorRepetitionChance || 0;
    },
    getExpectedGuestStarBeadsRange: function() {
        const R = engine.getInnRestfulnessPerSecond();
        const settleSec = engine.getGuestItineraryStepDuration("settleIn");
        const restSec = engine.getGuestItineraryStepDuration("rest");
        let minBeads = (settleSec + restSec) * R;
        let maxSec = settleSec + restSec;
        let maxBeads = minBeads;
        if (engine.isPondBuiltFromFoxDen() && engine.getPondAssignedWaterSpiritLevelSum() > 0) {
            const pondSec = engine.getGuestItineraryStepDuration("watchWaterSpirits");
            maxSec += pondSec;
            maxBeads += pondSec * R;
        }
        const canSoak = engine.canGuestStartSoak();
        if (canSoak) {
            maxSec += 5;
            maxBeads += 5 * (R + 0.5);
        }
        if (engine.canGuestEatNoodles()) {
            const eatSec = engine.getNoodleEatDurationSeconds();
            maxSec += eatSec;
            maxBeads += eatSec * (R + engine.getNoodleEatRestBonus());
        }
        if (engine.isInnGentleLightsUnlocked() && ((data.progress.base.inn && data.progress.base.inn.mana) || 0) >= 1) {
            maxBeads += engine.getInnGentleLightsRestfulnessBonus() * maxSec;
        }
        let maxSoakBonusAdd = 0;
        if (canSoak) {
            if (engine.getMarketGoodAmount("towels") >= 1) {
                maxBeads += engine.getInnTowelRestfulnessBonus();
            }
            const hasSoap = engine.getMarketGoodAmount("soap") >= 1;
            maxSoakBonusAdd = engine.getInnSoakBeadBonusAdd(hasSoap);
            if (engine.getVisitorRepetitionChance() > 0) {
                maxSec += settleSec + restSec;
                maxBeads += (settleSec + restSec) * R;
                if (engine.isPondBuiltFromFoxDen() && engine.getPondAssignedWaterSpiritLevelSum() > 0) {
                    const pondSec2 = engine.getGuestItineraryStepDuration("watchWaterSpirits");
                    maxBeads += pondSec2 * R;
                }
                maxBeads += 5 * (R + 0.5);
                if (engine.getMarketGoodAmount("towels") >= 2) {
                    maxBeads += engine.getInnTowelRestfulnessBonus();
                }
                if (engine.getMarketGoodAmount("soap") >= 2) {
                    maxSoakBonusAdd += engine.getInnSoakBeadBonusAdd(true);
                } else if (hasSoap) {
                    maxSoakBonusAdd += engine.getInnSoakBeadBonusAdd(false);
                }
            }
            maxBeads *= (1 + maxSoakBonusAdd);
        }
        const starMult = engine.getStarBeadCardMultiplier();
        minBeads *= starMult;
        maxBeads *= starMult;
        return { min: minBeads, max: maxBeads };
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
    getToriiVisitorIntervalMs: function() {
        const torii = data.progress.base && data.progress.base.torii;
        if (!torii) {
            return 60000;
        }
        const adMult = engine.getMarketAdvertisingIntervalMultiplier();
        let interval = torii.visitorIntervalMs || 60000;
        if (torii.enticingLightsUnlocked && (torii.mana || 0) > 0) {
            interval = 30000;
        }
        interval *= adMult;
        return interval;
    },
    /** Real seconds until the next arrival event, with mana, advertising, and worker timer reduction. */
    getToriiAverageVisitorArrivalSeconds: function() {
        const torii = data.progress.base && data.progress.base.torii;
        const intervalSec = engine.getToriiVisitorIntervalMs() / 1000;
        const workRate = engine.getSiteEffectiveWorkerRate("torii");
        const required = (torii && torii.visitorDrawPowerRequired) || 30;
        const reduceSec = engine.getToriiWorkerTimerReduceSeconds();
        const reducingPerSec = required > 0 && workRate > 0 ? (reduceSec * workRate) / required : 0;
        return intervalSec / (1 + reducingPerSec);
    },
    getToriiArrivalGuestCount: function() {
        const torii = data.progress.base && data.progress.base.torii;
        if (engine.isToriiDrinkingBowlUnlocked() && torii && (torii.water || 0) >= engine.getToriiVisitorWaterCost()) {
            return 2;
        }
        return 1;
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
        const prevInterval = torii._appliedVisitorIntervalMs || engine.getToriiVisitorIntervalMs();
        if (torii.enticingLightsUnlocked) {
            const cost = 10 * (tickMs / 1000);
            if ((torii.mana || 0) >= cost) {
                torii.mana -= cost;
            } else {
                torii.mana = 0;
            }
        }
        const intervalMs = engine.getToriiVisitorIntervalMs();
        if (prevInterval > 0 && intervalMs !== prevInterval) {
            torii.nextVisitorTimerMs = (torii.nextVisitorTimerMs || 0) * (intervalMs / prevInterval);
        }
        torii._appliedVisitorIntervalMs = intervalMs;
        if ((torii.nextVisitorTimerMs || 0) > intervalMs) {
            torii.nextVisitorTimerMs = intervalMs;
        }
        torii.nextVisitorTimerMs -= tickMs;
        engine.processToriiVisitorTimerRollover();
    },
    processToriiVisitorTimerRollover: function() {
        const torii = data.progress.base && data.progress.base.torii;
        if (!torii) {
            return;
        }
        const maxVisitors = torii.maxVisitors || 2;
        let armed = false;
        while ((torii.nextVisitorTimerMs || 0) <= 0 && (torii.visitorsWaiting || 0) < maxVisitors) {
            const spots = maxVisitors - (torii.visitorsWaiting || 0);
            const cost = engine.getToriiVisitorWaterCost();
            let arriving = 1;
            if (engine.isToriiDrinkingBowlUnlocked() && spots >= 2 && (torii.water || 0) >= cost) {
                arriving = 2;
                torii.water = round1((torii.water || 0) - cost);
            }
            torii.visitorsWaiting = (torii.visitorsWaiting || 0) + arriving;
            const intervalMs = engine.getToriiVisitorIntervalMs();
            torii.nextVisitorTimerMs += intervalMs;
            torii._appliedVisitorIntervalMs = intervalMs;
            armed = true;
        }
        if (armed && (torii.visitorsWaiting || 0) >= maxVisitors) {
            const parkedMs = engine.getToriiVisitorIntervalMs();
            torii.nextVisitorTimerMs = parkedMs;
            torii._appliedVisitorIntervalMs = parkedMs;
        }
    },
    isInnBuiltFromFoxDen: function() {
        const rh = data.progress.base && data.progress.base.foxDen;
        return !!(rh && rh.unlocks && rh.unlocks.inn);
    },
    /** Skill Info tips UI; true once the tips upgrade is bought (upgrade not added yet). */
    isSkillTipsUnlocked: function() {
        const inn = data.progress.base && data.progress.base.inn;
        return !!(inn && inn.tipsUpgradeBought);
    },
    isBonfireBuiltFromFoxDen: function() {
        const rh = data.progress.base && data.progress.base.foxDen;
        return !!(rh && rh.unlocks && rh.unlocks.bonfire);
    },
    isCisternBuiltFromFoxDen: function() {
        const rh = data.progress.base && data.progress.base.foxDen;
        return !!(rh && rh.unlocks && rh.unlocks.cistern);
    },
    isPondBuiltFromFoxDen: function() {
        const rh = data.progress.base && data.progress.base.foxDen;
        return !!(rh && rh.unlocks && rh.unlocks.pond);
    },
    getCisternMaxCapacity: function() {
        const cistern = data.progress.base.cistern;
        const bought = cistern.capacityBought || 0;
        let cap = 100;
        for (let n = 1; n <= bought; n++) {
            cap += 10 * n * (n + 1) / 2;
        }
        return cap;
    },
    emptyHalfCistern: function() {
        const cistern = data.progress.base && data.progress.base.cistern;
        if (!cistern) {
            return false;
        }
        const half = (cistern.waterVolume || 0) * 0.5;
        if (half <= 0) {
            return false;
        }
        cistern.waterVolume = half;
        engine.addWaterToPond(half);
        return true;
    },
    addWaterToPond: function(liters) {
        if (liters <= 0) {
            return;
        }
        const pond = data.progress.base && data.progress.base.pond;
        if (!pond) {
            return;
        }
        pond.waterVolume = (pond.waterVolume || 0) + liters;
    },
    getWishingWellWaterRate: function() {
        const pond = data.progress.base && data.progress.base.pond;
        const bought = pond && pond.wishingWellBought ? pond.wishingWellBought : 0;
        let rate = 0;
        if (bought >= 2) {
            rate = 5;
        } else if (bought >= 1) {
            rate = 1;
        }
        if (rate <= 0) {
            return 0;
        }
        const cardAdd = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().waterPumpAdd || 0) : 0;
        return rate * (1 + cardAdd);
    },
    updateWishingWellWater: function(tickMs) {
        if (!engine.isPondBuiltFromFoxDen()) {
            return;
        }
        const rate = engine.getWishingWellWaterRate();
        if (rate <= 0) {
            return;
        }
        engine.addWaterToPond(rate * (tickMs / 1000));
    },
    getWishingWellCoinRate: function() {
        const cistern = data.progress.base && data.progress.base.cistern;
        const bought = cistern && cistern.wishingWellBought ? cistern.wishingWellBought : 0;
        let rate = 0;
        if (bought >= 1) {
            rate += 0.1;
        }
        if (bought >= 2) {
            rate += 1;
        }
        const cardAdd = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().wishingWellCoinAdd || 0) : 0;
        rate *= (1 + cardAdd);
        return Math.round(rate * 100) / 100;
    },
    updateWishingWellCoins: function(tickMs) {
        if (!engine.isCisternBuiltFromFoxDen() || tickMs <= 0) {
            return;
        }
        const rate = engine.getWishingWellCoinRate();
        if (rate <= 0) {
            return;
        }
        data.progress.coins = (data.progress.coins || 0) + rate * (tickMs / 1000);
    },
    isCisternRefusingWater: function() {
        const garden = data.progress.base && data.progress.base.garden;
        const cistern = data.progress.base && data.progress.base.cistern;
        return !!(garden && garden.arrangementOfThirstUnlocked && cistern && cistern.refuseIncomingWater);
    },
    refundCisternWater: function(liters) {
        if (liters <= 0) {
            return;
        }
        if (engine.isCisternRefusingWater()) {
            engine.addWaterToPond(liters);
            return;
        }
        const cistern = data.progress.base && data.progress.base.cistern;
        if (!cistern) {
            return;
        }
        cistern.waterVolume = round1((cistern.waterVolume || 0) + liters);
    },
    addWaterToCistern: function(liters, tempC) {
        if (liters <= 0) {
            return;
        }
        if (engine.isCisternRefusingWater()) {
            engine.addWaterToPond(liters);
            return;
        }
        const cistern = data.progress.base.cistern;
        const maxCap = engine.getCisternMaxCapacity();
        const oldVol = cistern.waterVolume || 0;
        const room = Math.max(0, maxCap - oldVol);
        const accepted = Math.min(liters, room);
        const overflow = liters - accepted;
        if (accepted > 0) {
            const incomingTemp = tempC !== undefined && tempC !== null ? tempC : 0;
            if (oldVol + accepted > 0) {
                cistern.temperature = ((oldVol * (cistern.temperature || 0)) + (accepted * incomingTemp)) / (oldVol + accepted);
            } else {
                cistern.temperature = incomingTemp;
            }
            cistern.waterVolume = oldVol + accepted;
        }
        if (overflow > 0) {
            engine.addWaterToPond(overflow);
        }
    },
    dumpCisternToPond: function() {
        const cistern = data.progress.base && data.progress.base.cistern;
        if (!cistern || (cistern.waterVolume || 0) <= 0) {
            return;
        }
        engine.addWaterToPond(cistern.waterVolume || 0);
        cistern.waterVolume = 0;
        cistern.temperature = 0;
    },
    canGuestsVisitPond: function() {
        if (!engine.isPondBuiltFromFoxDen()) {
            return false;
        }
        const inn = data.progress.base && data.progress.base.inn;
        return !!(inn && inn.pondPathBuilt && inn.guestsVisitPond);
    },
    getPondAssignedWaterSpiritLevelSum: function() {
        const spirits = (data.progress.base && data.progress.base.hiddenSpring && data.progress.base.hiddenSpring.spirits) || [];
        let sum = 0;
        for (let i = 0; i < spirits.length; i++) {
            const s = spirits[i];
            if (s.kind === "water" && s.location === "pond") {
                sum += s.level || 1;
            }
        }
        return sum;
    },
    shouldGuestWatchPond: function() {
        return engine.canGuestsVisitPond() && engine.getPondAssignedWaterSpiritLevelSum() > 0;
    },
    getGuestItineraryStepDuration: function(stepKey) {
        if (stepKey === "settleIn") {
            const cfg = resortData.innGuestItinerary || {};
            return cfg.settleInSeconds !== undefined ? cfg.settleInSeconds : 5;
        }
        if (stepKey === "watchWaterSpirits") {
            return engine.getPondAssignedWaterSpiritLevelSum();
        }
        if (stepKey === "rest") {
            return engine.getInnRestAllowedSeconds();
        }
        if (stepKey === "soakHotSprings") {
            return 5;
        }
        if (stepKey === "eatNoodles") {
            return engine.getNoodleEatDurationSeconds();
        }
        return 0;
    },
    getGuestItineraryStepLabel: function(stepKey) {
        if (stepKey === "settleIn") {
            return "Settle in";
        }
        if (stepKey === "watchWaterSpirits") {
            return "Watch Water Spirits Play";
        }
        if (stepKey === "soakHotSprings") {
            return "Soak in Hot Bath";
        }
        if (stepKey === "eatNoodles") {
            return "Eat Noodles";
        }
        if (stepKey === "rest") {
            return "Rest";
        }
        return stepKey || "";
    },
    getGuestItineraryPanelLines: function() {
        const settleSec = engine.getGuestItineraryStepDuration("settleIn");
        const pondSec = engine.getGuestItineraryStepDuration("watchWaterSpirits");
        const lines = [
            `Settle in for ${settleSec}s`
        ];
        if (engine.isPondBuiltFromFoxDen()) {
            lines.push(`Watch Water Spirits Play for ${pondSec}s - requires Water Spirits in the Pond`);
        }
        if (engine.isInnOnsenConverted()) {
            const beadPct = Math.round((engine.getInnSoakBeadMultiplier(false) - 1) * 100);
            let soakLine = `Soak in Hot Bath for 5s (+0.5 restfulness/s, +${beadPct}% Star Beads)`;
            if (engine.isMarketBuilt()) {
                const soapPct = Math.round((engine.getInnSoakBeadMultiplier(true) - 1) * 100);
                soakLine = `Soak in Hot Bath for 5s (+0.5 restfulness/s, +${beadPct}% Star Beads, +${soapPct}% with soap)`;
            }
            lines.push(soakLine);
        }
        if (engine.isNoodleBarBuilt()) {
            lines.push(`Eat Noodles for ${engine.getNoodleEatDurationSeconds()}s (+${engine.getNoodleEatRestBonus()} restfulness/s) - Requires 100L hot water and 1 Dried Noodle`);
        }
        return lines;
    },
    getGuestItineraryStepBeforeRest: function() {
        if (engine.canGuestStartSoak()) {
            return "soakHotSprings";
        }
        if (engine.canGuestEatNoodles()) {
            return "eatNoodles";
        }
        return "rest";
    },
    getGuestItineraryNextStep: function(stepKey) {
        if (stepKey === "settleIn") {
            return engine.shouldGuestWatchPond() ? "watchWaterSpirits" : engine.getGuestItineraryStepBeforeRest();
        }
        if (stepKey === "watchWaterSpirits") {
            return engine.getGuestItineraryStepBeforeRest();
        }
        if (stepKey === "soakHotSprings") {
            return engine.canGuestEatNoodles() ? "eatNoodles" : "rest";
        }
        if (stepKey === "eatNoodles") {
            return "rest";
        }
        return null;
    },
    transitionGuestItineraryStep: function(guest, completedStep) {
        const inn = data.progress.base.inn;
        let nextStep = engine.getGuestItineraryNextStep(completedStep);
        if (nextStep === "soakHotSprings") {
            if (!engine.canGuestStartSoak()) {
                nextStep = engine.canGuestEatNoodles() ? "eatNoodles" : "rest";
            } else {
                inn.hotWater = Math.max(0, (inn.hotWater || 0) - engine.getInnSoakHotWaterCost());
                guest.completedHotSoak = true;
                guest.usedSoap = engine.tryConsumeMarketGood("soap", 1);
                guest.usedTowel = engine.tryConsumeMarketGood("towels", 1);
                if (guest.usedSoap) {
                    guest.everUsedSoap = true;
                }
                if (guest.usedTowel) {
                    guest.everUsedTowel = true;
                    guest.restfulness = (guest.restfulness || 0) + engine.getInnTowelRestfulnessBonus();
                }
                guest.soakBeadBonusAdd = (guest.soakBeadBonusAdd || 0) + engine.getInnSoakBeadBonusAdd(guest.usedSoap);
            }
        }
        if (nextStep === "eatNoodles") {
            if (!engine.tryBeginGuestEatNoodles()) {
                nextStep = "rest";
            } else {
                guest.ateNoodles = true;
                guest.everAteNoodles = true;
            }
        }
        guest.itineraryStep = nextStep;
        if (nextStep) {
            guest.timeToNext = Math.max(0, guest.timeToNext || 0) + engine.getGuestItineraryStepDuration(nextStep);
        }
    },
    updatePondWaterSpirits: function(tickMs) {
        if (!engine.isPondBuiltFromFoxDen()) {
            return;
        }
        const pond = data.progress.base.pond;
        const water = pond.waterVolume || 0;
        if (water <= 0) {
            return;
        }
        const expPerSec = Math.sqrt(water) / 50;
        const spirits = (data.progress.base.hiddenSpring && data.progress.base.hiddenSpring.spirits) || [];
        const sec = tickMs / 1000;
        for (let i = 0; i < spirits.length; i++) {
            const s = spirits[i];
            if (s.kind === "water" && s.location === "pond") {
                engine.grantSpiritExp(s, expPerSec * sec);
            }
        }
    },
    getPondForestDrainPerSecond: function() {
        const pond = data.progress.base && data.progress.base.pond;
        const avail = (pond && pond.waterVolume) || 0;
        if (avail <= 0) {
            return 0;
        }
        return avail * 0.001;
    },
    getPondForestStreamWidthPx: function() {
        if (typeof debugPondStreamMaxWidth !== "undefined" && debugPondStreamMaxWidth) {
            return 15;
        }
        const rate = engine.getPondForestDrainPerSecond();
        if (!(rate >= 5)) {
            return 2;
        }
        const steps = Math.floor(Math.log(rate / 5) / Math.log(1.5) + 1e-9) + 1;
        return Math.min(15, 2 + steps);
    },
    getAtelierWheelDegreesPerSecond: function() {
        if (!engine.isDrophammerUnlocked()) {
            return 0;
        }
        if (typeof debugPondStreamMaxWidth !== "undefined" && debugPondStreamMaxWidth) {
            return 40;
        }
        const rate = engine.getPondForestDrainPerSecond();
        if (!(rate > 5)) {
            return 4;
        }
        const steps = Math.log(rate / 5) / Math.log(1.5);
        return Math.min(40, 4 + 4 * steps);
    },
    updatePondWaterTransfer: function(tickMs) {
        if (!engine.isPondBuiltFromFoxDen()) {
            return;
        }
        const pond = data.progress.base.pond;
        const avail = pond.waterVolume || 0;
        if (avail <= 0) {
            return;
        }
        const sec = tickMs / 1000;
        const transfer = Math.min(avail, engine.getPondForestDrainPerSecond() * sec);
        if (transfer <= 0) {
            return;
        }
        pond.waterVolume = avail - transfer;
        const bf = data.progress.base.bambooForest;
        bf.water = (bf.water || 0) + transfer;
    },
    isOkamiWeaving: function() {
        return !!(data.progress.weaving && data.progress.weaving.active);
    },
    isOkamiWorkerSite: function(buildingKey) {
        const keys = resortData.okamiAssignableSiteKeys || [];
        return keys.indexOf(buildingKey) >= 0;
    },
    rememberOkamiWorkerSite: function(buildingKey) {
        if (engine.isOkamiWorkerSite(buildingKey)) {
            engine.getOkami().lastAssignedBuildingKey = buildingKey;
        }
    },
    syncOkamiWorkerSite: function(buildingKey) {
        if (buildingKey === "foxDen") {
            engine.syncFoxDenCarriersToWorkforce();
        } else if (buildingKey === "bonfire") {
            engine.syncBonfireCarriersToWorkforce();
        } else if (buildingKey === "cistern") {
            engine.syncCisternCarriersToWorkforce();
        } else if (buildingKey === "inn") {
            engine.syncInnCarriersToWorkforce();
        } else if (buildingKey === "market") {
            engine.syncMarketCarriersToWorkforce();
        }
    },
    isPathSegmentUpgradeJob: function(job) {
        return !!(job
            && job.segmentIndex !== undefined
            && job.segmentIndex !== null
            && !engine.isManaCloneJob(job)
            && !engine.isCollectStoneJob(job));
    },
    unassignOkamiForWeaving: function() {
        const okami = engine.getOkami();
        if (okami.assignedBuildingKey) {
            const prev = okami.assignedBuildingKey;
            engine.rememberOkamiWorkerSite(prev);
            okami.assignedBuildingKey = "";
            engine.syncOkamiWorkerSite(prev);
        }
        if (okami.pathJob && !okami.pathJob.paused) {
            const pathUpgrade = engine.isPathSegmentUpgradeJob(okami.pathJob);
            const segIdx = pathUpgrade ? okami.pathJob.segmentIndex : null;
            engine.pauseOkamiPathJob();
            const garden = data.progress.base && data.progress.base.garden;
            if (pathUpgrade && garden && garden.arrangementOfRemembranceUnlocked) {
                okami.resumePathAfterWeaveSegmentIndex = segIdx;
            }
        }
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
    updateToriiVisitorDraw: function(tickMs) {
        const torii = data.progress.base && data.progress.base.torii;
        if (!torii) {
            return;
        }
        const toriiRate = engine.getSiteEffectiveWorkerRate("torii");
        if (toriiRate <= 0) {
            return;
        }
        torii.workerPower = (torii.workerPower || 0) + toriiRate * (tickMs / 1000);
        const required = torii.visitorDrawPowerRequired || 30;
        while (torii.workerPower >= required) {
            torii.workerPower -= required;
            const reduceMs = 5000 + ((typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
                ? (shrineCards.getAggregatedEffects().toriiWorkerTimerReduceMs || 0) : 0);
            torii.nextVisitorTimerMs = (torii.nextVisitorTimerMs || 0) - reduceMs;
            engine.processToriiVisitorTimerRollover();
        }
    },
    getToriiWorkerTimerReduceSeconds: function() {
        const cardMs = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().toriiWorkerTimerReduceMs || 0) : 0;
        return 5 + cardMs / 1000;
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
            itineraryStep: "settleIn",
            timeToNext: engine.getGuestItineraryStepDuration("settleIn"),
            restfulness: 0,
            staySeconds: 0,
            restTextIndex: guestId % 4
        };
        inn.guestIdCounter = (inn.guestIdCounter || 1) + 1;
        inn.guests.push(guest);
        engine.syncInnRoomCounts();
        return guest;
    },
    pushInnGuestLogEntry: function(room, starBeads, staySeconds, guestType, usedSoap, usedTowel, ateNoodles, extraPrefix) {
        const inn = data.progress.base && data.progress.base.inn;
        if (!inn) {
            return;
        }
        const used = [];
        if (usedSoap) {
            used.push("soap");
        }
        if (usedTowel) {
            used.push("a towel");
        }
        let extraText = extraPrefix || "";
        if (used.length) {
            extraText += ` They used ${used.join(" and ")}.`;
        }
        if (ateNoodles) {
            extraText += " They ate noodles.";
        }
        inn.guestLog.unshift({
            room: room,
            starBeads: round2(starBeads),
            staySeconds: Math.max(0, Math.round(staySeconds || 0)),
            type: guestType || "wanderer",
            usedSoap: !!usedSoap,
            usedTowel: !!usedTowel,
            ateNoodles: !!ateNoodles,
            extraText: extraText
        });
        if (inn.guestLog.length > 5) {
            inn.guestLog.length = 5;
        }
    },
    pushInnGuestRepeatLogEntry: function(guest) {
        const inn = data.progress.base && data.progress.base.inn;
        if (!inn || !guest) {
            return;
        }
        const guestType = guest.type || "wanderer";
        const room = guest.room;
        inn.guestLog.unshift({
            room: room,
            starBeads: 0,
            staySeconds: Math.max(0, Math.round(guest.staySeconds || 0)),
            type: guestType,
            usedSoap: !!(guest.everUsedSoap || guest.usedSoap),
            usedTowel: !!(guest.everUsedTowel || guest.usedTowel),
            ateNoodles: !!(guest.everAteNoodles || guest.ateNoodles),
            isRepeat: true,
            extraText: " They decided they weren't ready to leave and started their visit over."
        });
        if (inn.guestLog.length > 5) {
            inn.guestLog.length = 5;
        }
    },
    restartGuestItineraryForRepetition: function(guest) {
        guest.hasRepeatedStay = true;
        guest.completedHotSoak = false;
        guest.usedSoap = false;
        guest.usedTowel = false;
        guest.ateNoodles = false;
        guest.itineraryStep = "settleIn";
        guest.timeToNext = engine.getGuestItineraryStepDuration("settleIn");
        engine.pushInnGuestRepeatLogEntry(guest);
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
        const baseRestRate = engine.getInnRestfulnessPerSecond();
        const lightsBonus = engine.applyInnGentleLightsTick(sec);
        for (let i = 0; i < inn.guests.length; i++) {
            const guest = inn.guests[i];
            const step = guest.itineraryStep || "settleIn";
            if (guest.room) {
                guest.staySeconds += sec;
                const earnSec = Math.min(sec, Math.max(0, guest.timeToNext));
                let earnRate = baseRestRate + lightsBonus;
                if (step === "soakHotSprings") {
                    earnRate += 0.5;
                }
                if (step === "eatNoodles") {
                    earnRate += engine.getNoodleEatRestBonus();
                }
                if (step === "watchWaterSpirits") {
                    const pond = data.progress.base && data.progress.base.pond;
                    earnRate += ((pond && pond.wetlandBoardwalkBought) || 0) * 5;
                }
                guest.restfulness += earnRate * earnSec;
            }
            guest.timeToNext -= sec;
            if (guest.timeToNext <= 0 && step === "settleIn") {
                engine.transitionGuestItineraryStep(guest, "settleIn");
                nextGuests.push(guest);
            } else if (guest.timeToNext <= 0 && step === "watchWaterSpirits") {
                engine.transitionGuestItineraryStep(guest, "watchWaterSpirits");
                nextGuests.push(guest);
            } else if (guest.timeToNext <= 0 && step === "soakHotSprings") {
                engine.transitionGuestItineraryStep(guest, "soakHotSprings");
                nextGuests.push(guest);
            } else if (guest.timeToNext <= 0 && step === "eatNoodles") {
                engine.transitionGuestItineraryStep(guest, "eatNoodles");
                nextGuests.push(guest);
            } else if (guest.timeToNext <= 0 && step === "rest") {
                const canRepeat = !guest.hasRepeatedStay && Math.random() < engine.getVisitorRepetitionChance();
                if (canRepeat) {
                    engine.restartGuestItineraryForRepetition(guest);
                    nextGuests.push(guest);
                } else {
                    let restfulness = Math.max(0, guest.restfulness || 0);
                    const soakAdd = guest.soakBeadBonusAdd || 0;
                    if (soakAdd > 0) {
                        restfulness *= (1 + soakAdd);
                    } else if (guest.completedHotSoak) {
                        restfulness *= engine.getInnSoakBeadMultiplier(guest.usedSoap);
                    }
                    restfulness *= engine.getStarBeadCardMultiplier();
                    const beads = round2(restfulness);
                    if (beads > 0) {
                        data.progress.starBeads = round2((data.progress.starBeads || 0) + beads);
                    }
                    engine.pushInnGuestLogEntry(
                        guest.room,
                        beads,
                        guest.staySeconds,
                        guest.type,
                        !!(guest.everUsedSoap || guest.usedSoap),
                        !!(guest.everUsedTowel || guest.usedTowel),
                        !!(guest.everAteNoodles || guest.ateNoodles)
                    );
                    if (typeof view !== "undefined" && view.spawnInnBeadFloat) {
                        view.spawnInnBeadFloat(beads);
                    }
                }
            } else {
                nextGuests.push(guest);
            }
        }
        inn.guests = nextGuests;
        engine.syncInnRoomCounts();
    },
    updateLaundryBasins: function(tickMs) {
    },
    isBringOreToAtelierUnlocked: function() {
        const hs = data.progress.base && data.progress.base.hiddenSpring;
        return !!(hs && hs.bringOreToAtelierUnlocked);
    },
    isArrangementOfPriorityUnlocked: function() {
        const garden = data.progress.base && data.progress.base.garden;
        return !!(garden && garden.arrangementOfPriorityUnlocked);
    },
    isArrangementOfTargetPriorityUnlocked: function() {
        const garden = data.progress.base && data.progress.base.garden;
        return !!(garden && garden.arrangementOfTargetPriorityUnlocked);
    },
    isArrangementOfHeatTargetingUnlocked: function() {
        const garden = data.progress.base && data.progress.base.garden;
        return !!(garden && garden.arrangementOfHeatTargetingUnlocked);
    },
    isArrangementOfSpelunkingUnlocked: function() {
        const garden = data.progress.base && data.progress.base.garden;
        return !!(garden && garden.arrangementOfSpelunkingUnlocked);
    },
    isArrangementOfSelfSufficiencyUnlocked: function() {
        const garden = data.progress.base && data.progress.base.garden;
        return !!(garden && garden.arrangementOfSelfSufficiencyUnlocked);
    },
    isArrangementOfRhythmicDropletsUnlocked: function() {
        const garden = data.progress.base && data.progress.base.garden;
        return !!(garden && garden.arrangementOfRhythmicDropletsUnlocked);
    },
    isEqualDropletSpacingEnabled: function() {
        const hs = data.progress.base && data.progress.base.hiddenSpring;
        return engine.isArrangementOfRhythmicDropletsUnlocked() && !!(hs && hs.equalDropletSpacing);
    },
    getHiddenSpringWaterSpirits: function() {
        const hs = data.progress.base && data.progress.base.hiddenSpring;
        if (!hs || !hs.spirits) {
            return [];
        }
        const list = [];
        for (let i = 0; i < hs.spirits.length; i++) {
            const spirit = hs.spirits[i];
            if (spirit.kind === "water" && (spirit.location || "hiddenSpring") === "hiddenSpring") {
                list.push(spirit);
            }
        }
        list.sort(engine.compareSpiritSpawnPriority);
        return list;
    },
    getEqualDropletSpacingIntervalMs: function(count) {
        const n = count || 0;
        if (n <= 0) {
            return 0;
        }
        const tSec = engine.estimatePathTravelSeconds(0, engine.getDropletTravelSpeedOpts());
        return (tSec * 1000) / n;
    },
    isArrangementOfDiggingUnlocked: function() {
        const garden = data.progress.base && data.progress.base.garden;
        return !!(garden && garden.arrangementOfDiggingUnlocked);
    },
    isBonfireTendTheFlameUnlocked: function() {
        const bf = data.progress.base && data.progress.base.bonfire;
        return !!(bf && bf.tendTheFlameUnlocked);
    },
    findEmptyEarthMineSlot: function() {
        for (let si = 0; si < 3; si++) {
            if (!engine.getSpiritAtLocation("mine", si, "earth")) {
                return si;
            }
        }
        return -1;
    },
    isAtelierForgeBuilt: function() {
        const atelier = data.progress.base && data.progress.base.atelier;
        return !!(atelier && atelier.forgeBuilt);
    },
    isDrophammerDebugEnabled: function() {
        return typeof showDrophammer !== "undefined" && !!showDrophammer;
    },
    isDrophammerUnlocked: function() {
        const atelier = data.progress.base && data.progress.base.atelier;
        // return !!(engine.isDrophammerDebugEnabled() && atelier && atelier.drophammerUnlocked);
        return !!(engine.isDrophammerDebugEnabled());
    },
    getBonfireFireSpiritSlotMax: function() {
        return 3;
    },
    getAtelierFireSpiritSlotMax: function() {
        return 3;
    },
    getBonfireAssignedFireSpiritPowerTotal: function() {
        const spirits = (data.progress.base && data.progress.base.hiddenSpring && data.progress.base.hiddenSpring.spirits) || [];
        let total = 0;
        for (let i = 0; i < spirits.length; i++) {
            const s = spirits[i];
            if (s.kind === "fire" && s.location === "bonfire") {
                total += engine.getEffectiveSpiritPower(s);
            }
        }
        return total;
    },
    earthPebbleFormMs: 5000,
    earthPebbleGlobalGapMs: 1000,
    waterDropletFormMs: 5000,
    waterDropletGlobalGapMs: 3000,
    compareSpiritSpawnPriority: function(a, b) {
        const levelDiff = (b.level || 1) - (a.level || 1);
        if (levelDiff !== 0) {
            return levelDiff;
        }
        return (a.id || 0) - (b.id || 0);
    },
    getEarthSpiritPebbleTaskInfo: function(spirit) {
        const pebbleMax = engine.getEarthSpiritPebbleMax();
        const active = engine.countPebblesForSpirit(spirit.id);
        if (active >= pebbleMax) {
            return { text: "Pebbles Moving", pct: 0 };
        }
        if (!engine.canEarthSpiritLoadPebble(spirit)) {
            return { text: "Waiting for materials", pct: 0 };
        }
        const formMs = engine.earthPebbleFormMs;
        const cooldown = spirit.pebbleCooldownMs || 0;
        if (cooldown > 0) {
            return {
                text: "creating pebble",
                pct: Math.max(0, Math.min(100, (1 - (cooldown / formMs)) * 100))
            };
        }
        const hs = data.progress.base.hiddenSpring;
        const ready = engine.getEarthSpiritsReadyToSpawnPebbles();
        if (!ready.length || ready[0].id !== spirit.id || hs.pebbleGlobalCooldownMs > 0) {
            return { text: "Waiting for room", pct: 0 };
        }
        return { text: "creating pebble", pct: 100 };
    },
    getEarthSpiritsReadyToSpawnPebbles: function() {
        const base = data.progress.base;
        const hs = base && base.hiddenSpring;
        if (!hs || !hs.spirits) {
            return [];
        }
        const pebbleMax = engine.getEarthSpiritPebbleMax();
        const ready = [];
        for (let i = 0; i < hs.spirits.length; i++) {
            const spirit = hs.spirits[i];
            if (spirit.kind !== "earth" || (spirit.location || "hiddenSpring") !== "hiddenSpring") {
                continue;
            }
            if (engine.countPebblesForSpirit(spirit.id) >= pebbleMax) {
                continue;
            }
            if (!engine.canEarthSpiritLoadPebble(spirit)) {
                continue;
            }
            if ((spirit.pebbleCooldownMs || 0) > 0) {
                continue;
            }
            ready.push(spirit);
        }
        ready.sort(engine.compareSpiritSpawnPriority);
        return ready;
    },
    getWaterSpiritDropletTaskInfo: function(spirit) {
        if (engine.getDropletForSpirit(spirit.id)) {
            return { text: "droplet active", pct: 100 };
        }
        const formMs = engine.waterDropletFormMs;
        const cooldown = spirit.dropletCooldownMs || 0;
        if (cooldown > 0) {
            return {
                text: "forming droplet",
                pct: Math.max(0, Math.min(100, (1 - (cooldown / formMs)) * 100))
            };
        }
        const hs = data.progress.base.hiddenSpring;
        if (engine.isEqualDropletSpacingEnabled() && (spirit.location || "hiddenSpring") === "hiddenSpring") {
            const ordered = engine.getHiddenSpringWaterSpirits();
            const n = ordered.length;
            let index = -1;
            for (let i = 0; i < n; i++) {
                if (ordered[i].id === spirit.id) {
                    index = i;
                    break;
                }
            }
            if (index > 0 && n > 1) {
                const intervalMs = engine.getEqualDropletSpacingIntervalMs(n);
                const elapsed = hs.equalSpacingElapsedMs || 0;
                const cycleId = hs.equalSpacingCycleId || 0;
                const spawnedThisCycle = cycleId > 0 && spirit.equalSpacingCycleId === cycleId;
                const phaseReady = !!(hs.equalSpacingCycleActive) && !spawnedThisCycle && elapsed >= index * intervalMs;
                if (!phaseReady) {
                    return { text: "waiting for spacing", pct: 100 };
                }
            }
            return { text: "forming droplet", pct: 100 };
        }
        const ready = engine.getWaterSpiritsReadyToSpawnDroplets();
        if (!ready.length || ready[0].id !== spirit.id || hs.dropletGlobalCooldownMs > 0) {
            return { text: "Waiting for room", pct: 0 };
        }
        return { text: "forming droplet", pct: 0 };
    },
    getWaterSpiritsReadyToSpawnDroplets: function() {
        const base = data.progress.base;
        const hs = base && base.hiddenSpring;
        if (!hs || !hs.spirits) {
            return [];
        }
        const ready = [];
        for (let i = 0; i < hs.spirits.length; i++) {
            const spirit = hs.spirits[i];
            if (spirit.kind !== "water" || (spirit.location || "hiddenSpring") !== "hiddenSpring") {
                continue;
            }
            if (engine.getDropletForSpirit(spirit.id)) {
                continue;
            }
            if ((spirit.dropletCooldownMs || 0) > 0) {
                continue;
            }
            ready.push(spirit);
        }
        ready.sort(engine.compareSpiritSpawnPriority);
        return ready;
    },
    getBambooSprinkleOreMultiplier: function() {
        const atelier = data.progress.base && data.progress.base.atelier;
        const bought = atelier && atelier.sprinkleOreBought ? atelier.sprinkleOreBought : 0;
        return Math.pow(1.1, bought);
    },
    getBambooForestBaseChips: function() {
        const cfg = resortData.bambooForestConfig;
        const base = cfg.defaultBaseWood || 10;
        const cardAdd = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().bambooBaseChipsFlat || 0) : 0;
        return base + cardAdd;
    },
    getBambooInfuseSoilMultiplier: function() {
        const bf = data.progress.base.bambooForest;
        const n = bf.infuseSoilBought || 0;
        if (n <= 0) {
            return 1;
        }
        return 1 + 0.2 * n + 0.025 * n * (n - 1);
    },
    getBambooStalkComputedBaseChips: function(stalkIndex) {
        let chips = engine.getBambooForestBaseChips();
        const spirit = engine.getBambooStalkSpirit(stalkIndex);
        if (spirit) {
            chips += Math.ceil(engine.getEffectiveSpiritPower(spirit) || 1);
        }
        let result = Math.floor(chips * engine.getBambooInfuseSoilMultiplier() * engine.getBambooSprinkleOreMultiplier());
        const bf = data.progress.base && data.progress.base.bambooForest;
        const stalk = bf && bf.stalks && bf.stalks[stalkIndex];
        if (stalk && stalk.type === "hardwood") {
            result *= 5;
        }
        return result;
    },
    refreshBambooForestBaseChips: function() {
        const bf = data.progress.base && data.progress.base.bambooForest;
        if (!bf || !bf.stalks) {
            return;
        }
        for (let si = 0; si < bf.stalks.length; si++) {
            bf.stalks[si].baseWood = engine.getBambooStalkComputedBaseChips(si);
            engine.refreshBambooStalkCapacities(bf.stalks[si]);
        }
    },
    getMagicLoomSpiritStrandMultiplier: function() {
        const atelier = data.progress.base && data.progress.base.atelier;
        const bought = atelier && atelier.magicLoomsBought ? atelier.magicLoomsBought : 0;
        return Math.pow(1.1, bought);
    },
    getFireLauncherPlatformDefs: function() {
        return resortData.fireLauncherPlatformDefs || [];
    },
    getFireLauncherPlatformDef: function(key) {
        const defs = engine.getFireLauncherPlatformDefs();
        for (let i = 0; i < defs.length; i++) {
            if (defs[i].key === key) {
                return defs[i];
            }
        }
        return null;
    },
    getFireLauncherUpgradeBought: function(platformKey, field) {
        const state = engine.getFireLauncherPlatformState(platformKey);
        if (!state || !field) {
            return 0;
        }
        return state[field] || 0;
    },
    incrementFireLauncherUpgrade: function(platformKey, field) {
        const state = engine.getFireLauncherPlatformState(platformKey);
        if (!state || !field) {
            return;
        }
        state[field] = (state[field] || 0) + 1;
    },
    getFireLauncherScopeKey: function(platformKey) {
        return "fireLauncher_" + platformKey;
    },
    parseFireLauncherScopeKey: function(scopeKey) {
        if (!scopeKey || scopeKey.indexOf("fireLauncher_") !== 0) {
            return null;
        }
        return scopeKey.slice("fireLauncher_".length);
    },
    getFireLauncherRangeBonusPct: function(platformKey) {
        if (platformKey === "pathMid") {
            return 20 * engine.getFireLauncherUpgradeBought("pathMid", "ironSightsBought");
        }
        if (platformKey === "bendTop") {
            return 10 * engine.getFireLauncherUpgradeBought("bendTop", "hotIronsBought");
        }
        return 0;
    },
    getFireLauncherHeatBonusPct: function(platformKey) {
        if (platformKey === "pathMid") {
            return 10 * engine.getFireLauncherUpgradeBought("pathMid", "ironSightsBought");
        }
        if (platformKey === "pathLower") {
            return 25 * engine.getFireLauncherUpgradeBought("pathLower", "fireFlingersBought");
        }
        if (platformKey === "bendTop") {
            return 20 * engine.getFireLauncherUpgradeBought("bendTop", "hotIronsBought");
        }
        return 0;
    },
    getFireLauncherRangePx: function(platformKey) {
        const def = engine.getFireLauncherPlatformDef(platformKey);
        const base = (def && def.rangePx) || 0;
        return base * (1 + engine.getFireLauncherRangeBonusPct(platformKey) / 100);
    },
    getFireLauncherHeatPerStrike: function(platformKey) {
        const def = engine.getFireLauncherPlatformDef(platformKey);
        const base = (def && def.heatPerStrike) || 0;
        return base * (1 + engine.getFireLauncherHeatBonusPct(platformKey) / 100);
    },
    getFireLauncherMaxEmbers: function(defOrKey) {
        const key = typeof defOrKey === "string" ? defOrKey
            : (defOrKey && defOrKey.key ? defOrKey.key : null);
        const def = typeof defOrKey === "string" ? engine.getFireLauncherPlatformDef(defOrKey) : defOrKey;
        const base = (def && def.maxEmbers) ? def.maxEmbers : 1000;
        if (!key) {
            return base;
        }
        return base + 1000 * engine.getFireLauncherUpgradeBought(key, "firePitBought");
    },
    getFireLauncherEmberRegenMult: function(platformKey) {
        return 1 + 0.25 * engine.getFireLauncherUpgradeBought(platformKey, "woodPitBought");
    },
    isPathHaulScope: function(scopeKey) {
        return scopeKey === "mine" || !!engine.parseFireLauncherScopeKey(scopeKey);
    },
    getPathHaulStopProgress: function(scopeKey) {
        if (scopeKey === "mine") {
            return 0;
        }
        const platformKey = engine.parseFireLauncherScopeKey(scopeKey);
        const fromBottom = platformKey === "pathLower" ? 6 : platformKey === "pathMid" ? 21 : platformKey === "bendTop" ? 45 : 0;
        if (!fromBottom) {
            return 0;
        }
        const specs = engine.getResortPathSegmentSpecs();
        const idx = specs.length - fromBottom;
        if (idx < 0 || !specs[idx]) {
            return 0;
        }
        return specs[idx].startDist;
    },
    getUpgradeGatherDeliverMapKey: function(scopeKey) {
        if (engine.isPathHaulScope(scopeKey)) {
            return "pathEnd";
        }
        return scopeKey;
    },
    getFireLauncherProjectileDurationMs: function(def) {
        return (def && def.projectileDurationMs) ? def.projectileDurationMs : 1050;
    },
    getDropletTravelSpeedOpts: function() {
        return {
            baseSpeed: 35 * 1.5,
            getSegmentMult: engine.getDropletPathSegmentSpeedMultiplier,
            maxProgress: engine.getResortPathTotalDistance()
        };
    },
    getDropletPredictedPathProgress: function(droplet, durationMs) {
        return engine.advancePathProgress(droplet.pathProgress || 0, (durationMs || 0) / 1000, 1, engine.getDropletTravelSpeedOpts());
    },
    wouldDropletFinishPathDuringFlight: function(droplet, durationMs) {
        const total = engine.getResortPathTotalDistance();
        return engine.getDropletPredictedPathProgress(droplet, durationMs) >= total - 1e-9;
    },
    getFireLauncherPlatformIndex: function(key) {
        const defs = engine.getFireLauncherPlatformDefs();
        for (let i = 0; i < defs.length; i++) {
            if (defs[i].key === key) {
                return i;
            }
        }
        return -1;
    },
    getFireLauncherLocationKey: function(platformKey) {
        return "fireLauncher_" + platformKey;
    },
    parseFireLauncherLocation: function(location) {
        if (!location || location.indexOf("fireLauncher_") !== 0) {
            return null;
        }
        return location.slice("fireLauncher_".length);
    },
    getFireLauncherBuiltCount: function() {
        return data.progress.base.fireLaunchers.builtCount || 0;
    },
    isFireLauncherPlatformBuilt: function(platformKey) {
        const idx = engine.getFireLauncherPlatformIndex(platformKey);
        if (idx < 0) {
            return false;
        }
        return engine.getFireLauncherBuiltCount() > idx;
    },
    getFireLauncherPlatformState: function(platformKey) {
        return data.progress.base.fireLaunchers.platforms[platformKey] || null;
    },
    getFireLauncherAssignedSpirit: function(platformKey) {
        return engine.getSpiritAtLocation(engine.getFireLauncherLocationKey(platformKey), 0, "fire");
    },
    getFireLauncherPlatformMapPos: function(platformKey) {
        const def = engine.getFireLauncherPlatformDef(platformKey);
        if (def && def.mapPos) {
            return { x: def.mapPos.x, y: def.mapPos.y };
        }
        return { x: 0, y: 0 };
    },
    getFireLauncherSlotCenter: function(platformKey) {
        const fallback = engine.getFireLauncherPlatformMapPos(platformKey);
        if (typeof document === "undefined") {
            return fallback;
        }
        const slot = document.getElementById("spiritSlot_fireLauncher_" + platformKey + "_0");
        const map = document.getElementById("baseResortMap");
        if (!slot || !map) {
            return fallback;
        }
        const sr = slot.getBoundingClientRect();
        const mr = map.getBoundingClientRect();
        if (sr.width <= 0 || sr.height <= 0) {
            return fallback;
        }
        return {
            x: (sr.left + sr.width / 2) - mr.left - (map.clientLeft || 0),
            y: (sr.top + sr.height / 2) - mr.top - (map.clientTop || 0)
        };
    },
    getDropletMapPosition: function(droplet) {
        if (!droplet) {
            return null;
        }
        return engine.getResortPathPosition(droplet.pathProgress || 0);
    },
    getPixelDistance: function(ax, ay, bx, by) {
        const dx = bx - ax;
        const dy = by - ay;
        return Math.sqrt(dx * dx + dy * dy);
    },
    getDropletsInPixelRange: function(px, py, rangePx) {
        const droplets = (data.progress.base && data.progress.base.droplets) || [];
        const out = [];
        for (let i = 0; i < droplets.length; i++) {
            const d = droplets[i];
            const pos = engine.getDropletMapPosition(d);
            if (!pos) {
                continue;
            }
            if (engine.getPixelDistance(px, py, pos.x, pos.y) <= rangePx) {
                out.push(d);
            }
        }
        return out;
    },
    getNearestDropletInPixelRange: function(px, py, rangePx, opts) {
        const droplets = engine.getDropletsInPixelRange(px, py, rangePx);
        if (!droplets.length) {
            return null;
        }
        const skipPathEnd = opts && opts.skipPathEndDuringMs;
        let best = null;
        let bestDist = Infinity;
        for (let i = 0; i < droplets.length; i++) {
            const d = droplets[i];
            if (skipPathEnd !== undefined && engine.wouldDropletFinishPathDuringFlight(d, skipPathEnd)) {
                continue;
            }
            const pos = engine.getDropletMapPosition(d);
            if (!pos) {
                continue;
            }
            const dist = engine.getPixelDistance(px, py, pos.x, pos.y);
            if (dist < bestDist) {
                bestDist = dist;
                best = d;
            }
        }
        return best;
    },
    getDropletById: function(dropletId) {
        const droplets = (data.progress.base && data.progress.base.droplets) || [];
        for (let i = 0; i < droplets.length; i++) {
            if (droplets[i].id === dropletId) {
                return droplets[i];
            }
        }
        return null;
    },
    getFireLauncherTargetMode: function(state) {
        return (state && state.targetMode) || "default";
    },
    getDropletCombinedHeatEssence: function(droplet) {
        if (!droplet) {
            return 0;
        }
        return (droplet.heat || 0) + (droplet.essence || 0);
    },
    isFireLauncherDropletBetter: function(candidate, current, mode, px, py) {
        if (!current) {
            return true;
        }
        const candProg = candidate.pathProgress || 0;
        const curProg = current.pathProgress || 0;
        if (mode === "closest") {
            const candPos = engine.getDropletMapPosition(candidate);
            const curPos = engine.getDropletMapPosition(current);
            const candDist = candPos ? engine.getPixelDistance(px, py, candPos.x, candPos.y) : Infinity;
            const curDist = curPos ? engine.getPixelDistance(px, py, curPos.x, curPos.y) : Infinity;
            if (candDist !== curDist) {
                return candDist < curDist;
            }
            return candProg > curProg;
        }
        if (mode === "coldest") {
            const candScore = engine.getDropletCombinedHeatEssence(candidate);
            const curScore = engine.getDropletCombinedHeatEssence(current);
            if (candScore !== curScore) {
                return candScore < curScore;
            }
            return candProg > curProg;
        }
        if (mode === "hottest") {
            const candScore = engine.getDropletCombinedHeatEssence(candidate);
            const curScore = engine.getDropletCombinedHeatEssence(current);
            if (candScore !== curScore) {
                return candScore > curScore;
            }
            return candProg > curProg;
        }
        return candProg > curProg;
    },
    pickBestFireLauncherDroplet: function(droplets, mode, px, py, durationMs) {
        let best = null;
        for (let i = 0; i < droplets.length; i++) {
            const d = droplets[i];
            if (engine.wouldDropletFinishPathDuringFlight(d, durationMs)) {
                continue;
            }
            if (engine.isFireLauncherDropletBetter(d, best, mode, px, py)) {
                best = d;
            }
        }
        return best;
    },
    pickFireLauncherTarget: function(platformKey, def, pos, durationMs) {
        const state = engine.getFireLauncherPlatformState(platformKey);
        if (!state) {
            return { droplet: null, wasted: false };
        }
        const mode = engine.getFireLauncherTargetMode(state);
        const inRange = engine.getDropletsInPixelRange(pos.x, pos.y, engine.getFireLauncherRangePx(platformKey));
        if (mode === "default") {
            const lockId = state.lockedDropletId;
            if (lockId !== undefined && lockId !== null) {
                const locked = engine.getDropletById(lockId);
                if (!locked) {
                    state.lockedDropletId = null;
                    return { droplet: null, wasted: true };
                }
                let stillInRange = false;
                for (let i = 0; i < inRange.length; i++) {
                    if (inRange[i].id === lockId) {
                        stillInRange = true;
                        break;
                    }
                }
                if (stillInRange && engine.wouldDropletFinishPathDuringFlight(locked, durationMs)) {
                    state.lockedDropletId = null;
                    return { droplet: locked, wasted: true };
                }
                if (stillInRange) {
                    return { droplet: locked, wasted: false };
                }
                state.lockedDropletId = null;
            }
            const acquired = engine.pickBestFireLauncherDroplet(inRange, "furthest", pos.x, pos.y, durationMs);
            state.lockedDropletId = acquired ? acquired.id : null;
            return { droplet: acquired, wasted: false };
        }
        const picked = engine.pickBestFireLauncherDroplet(inRange, mode, pos.x, pos.y, durationMs);
        return { droplet: picked, wasted: false };
    },
    applyFireLauncherHeat: function(droplet, heat) {
        if (!droplet) {
            return;
        }
        droplet.hitFlashAt = Date.now();
        if (heat <= 0) {
            return;
        }
        engine.addHeatToDroplet(droplet.id, heat);
    },
    grantFireLauncherStrikeExp: function(platformKey) {
        const amount = engine.getFireLauncherExpPerDroplet(platformKey);
        if (amount <= 0) {
            return;
        }
        engine.grantSpiritExp(engine.getFireLauncherAssignedSpirit(platformKey), amount);
    },
    spawnFireLauncherProjectile: function(platformKey, targetDroplet, heatPerStrike, durationMs) {
        const fl = data.progress.base.fireLaunchers;
        const from = engine.getFireLauncherPlatformMapPos(platformKey);
        const flightMs = durationMs || 1050;
        const predicted = engine.getDropletPredictedPathProgress(targetDroplet, flightMs);
        const to = engine.getResortPathPosition(predicted);
        if (!to) {
            return;
        }
        const def = engine.getFireLauncherPlatformDef(platformKey);
        fl.projectiles.push({
            id: (fl.projectileIdCounter || 1),
            platformKey: platformKey,
            dropletId: targetDroplet.id,
            heatPerStrike: heatPerStrike,
            fromX: from.x,
            fromY: from.y,
            toX: to.x,
            toY: to.y,
            progress: 0,
            prevProgress: 0,
            durationMs: flightMs,
            sizePx: (def && def.projectileSizePx) ? def.projectileSizePx : 28
        });
        fl.projectileIdCounter = (fl.projectileIdCounter || 1) + 1;
    },
    spawnFireLauncherAoePulse: function(platformKey, rangePx) {
        const fl = data.progress.base.fireLaunchers;
        const pos = engine.getFireLauncherSlotCenter(platformKey);
        fl.aoePulses.push({
            id: (fl.aoePulseIdCounter || 1),
            platformKey: platformKey,
            x: pos.x,
            y: pos.y,
            rangePx: rangePx,
            remainMs: 500
        });
        fl.aoePulseIdCounter = (fl.aoePulseIdCounter || 1) + 1;
    },
    updateFireLauncherProjectiles: function(tickMs) {
        const fl = data.progress.base.fireLaunchers;
        const next = [];
        for (let i = 0; i < fl.projectiles.length; i++) {
            const p = fl.projectiles[i];
            p.prevProgress = p.progress || 0;
            p.progress = p.prevProgress + tickMs;
            if (p.progress >= (p.durationMs || 1050)) {
                const droplets = (data.progress.base && data.progress.base.droplets) || [];
                for (let di = 0; di < droplets.length; di++) {
                    if (droplets[di].id === p.dropletId) {
                        const strikeHeat = p.heatPerStrike || 0;
                        engine.applyFireLauncherHeat(droplets[di], strikeHeat);
                        engine.grantFireLauncherStrikeExp(p.platformKey);
                        break;
                    }
                }
            } else {
                next.push(p);
            }
        }
        fl.projectiles = next;
        const aoeNext = [];
        for (let ai = 0; ai < fl.aoePulses.length; ai++) {
            const pulse = fl.aoePulses[ai];
            pulse.remainMs = (pulse.remainMs || 0) - tickMs;
            if (pulse.remainMs > 0) {
                aoeNext.push(pulse);
            }
        }
        fl.aoePulses = aoeNext;
    },
    updateFireLaunchers: function(tickMs) {
        const fl = data.progress.base.fireLaunchers;
        const dtSec = tickMs / 1000;
        const defs = engine.getFireLauncherPlatformDefs();
        const builtCount = engine.getFireLauncherBuiltCount();
        for (let i = 0; i < builtCount && i < defs.length; i++) {
            const def = defs[i];
            const pk = def.key;
            const state = engine.getFireLauncherPlatformState(pk);
            if (!state) {
                continue;
            }
            const maxEmbers = engine.getFireLauncherMaxEmbers(pk);
            const spirit = engine.getFireLauncherAssignedSpirit(pk);
            const rangePx = engine.getFireLauncherRangePx(pk);
            const heatPerStrike = engine.getFireLauncherHeatPerStrike(pk);
            if (spirit) {
                const regen = (engine.getEffectiveSpiritPower(spirit) || 1) * engine.getFireLauncherEmberRegenMult(pk);
                state.embers = Math.min(maxEmbers, (state.embers || 0) + regen * dtSec);
            }
            state.attackTimerMs = (state.attackTimerMs || 0) + tickMs;
            if (!spirit || (state.embers || 0) < (def.emberCost || 0)) {
                continue;
            }
            if (state.attackTimerMs < (def.intervalMs || 1000)) {
                continue;
            }
            const pos = def.attackType === "aoe"
                ? engine.getFireLauncherSlotCenter(pk)
                : engine.getFireLauncherPlatformMapPos(pk);
            if (def.attackType === "aoe") {
                const roundedRange = Math.round(rangePx);
                const inRange = engine.getDropletsInPixelRange(pos.x, pos.y, roundedRange);
                if (!inRange.length) {
                    continue;
                }
                state.embers -= def.emberCost || 0;
                state.attackTimerMs = 0;
                for (let ri = 0; ri < inRange.length; ri++) {
                    engine.applyFireLauncherHeat(inRange[ri], heatPerStrike);
                    engine.grantFireLauncherStrikeExp(pk);
                }
                engine.spawnFireLauncherAoePulse(pk, roundedRange);
            } else {
                const durationMs = engine.getFireLauncherProjectileDurationMs(def);
                const pick = engine.pickFireLauncherTarget(pk, def, pos, durationMs);
                if (pick.wasted) {
                    state.embers -= def.emberCost || 0;
                    state.attackTimerMs = 0;
                    if (pick.droplet) {
                        engine.spawnFireLauncherProjectile(pk, pick.droplet, heatPerStrike, durationMs);
                    }
                    continue;
                }
                if (!pick.droplet) {
                    continue;
                }
                state.embers -= def.emberCost || 0;
                state.attackTimerMs = 0;
                engine.spawnFireLauncherProjectile(pk, pick.droplet, heatPerStrike, durationMs);
            }
        }
        engine.updateFireLauncherProjectiles(tickMs);
    },
    isFireSpiritOnLauncher: function(spirit) {
        if (!spirit || spirit.kind !== "fire") {
            return false;
        }
        return !!engine.parseFireLauncherLocation(spirit.location || "");
    },
    getFireLauncherKeyForSpirit: function(spirit) {
        if (!spirit) {
            return null;
        }
        return engine.parseFireLauncherLocation(spirit.location || "");
    },
    allocatePebbleLoad: function(capacity, stoneAvail, oreAvail, oreFirst) {
        let stone = 0;
        let ore = 0;
        let rem = capacity;
        if (oreFirst) {
            ore = Math.min(rem, oreAvail);
            rem -= ore;
            stone = Math.min(rem, stoneAvail);
        } else {
            stone = Math.min(rem, stoneAvail);
            rem -= stone;
            ore = Math.min(rem, oreAvail);
        }
        return { stone: stone, ore: ore };
    },
    getPebblePayloadStone: function(pebble) {
        if (!pebble) {
            return 0;
        }
        if (pebble.payloadStone !== undefined) {
            return pebble.payloadStone || 0;
        }
        return pebble.payload || 0;
    },
    getPebblePayloadOre: function(pebble) {
        if (!pebble) {
            return 0;
        }
        return pebble.payloadOre || 0;
    },
    formatPebblePayloadLabel: function(pebble) {
        const stone = engine.applyEchoedShelving(engine.getPebblePayloadStone(pebble));
        const ore = engine.getPebblePayloadOre(pebble);
        if (stone > 0 && ore > 0) {
            return `${intToStringRound(stone)}S | ${intToStringRound(ore)}O`;
        }
        if (stone > 0) {
            return `${intToStringRound(stone)}S`;
        }
        if (ore > 0) {
            return `${intToStringRound(ore)}O`;
        }
        return "";
    },
    canEarthSpiritLoadPebble: function(spirit) {
        const base = data.progress.base;
        if (!spirit || !base || !base.mine || !base.mine.resources) {
            return false;
        }
        const capacity = engine.getEarthSpiritPebbleCarryAmount(spirit);
        const stoneAvail = base.mine.resources.stone || 0;
        const oreUnlocked = engine.isBringOreToAtelierUnlocked();
        const oreAvail = oreUnlocked ? (base.mine.resources.ore || 0) : 0;
        if (oreUnlocked) {
            if (stoneAvail + oreAvail <= 0) {
                return false;
            }
            const oreFirst = engine.isArrangementOfPriorityUnlocked() && spirit.prioritizeOre;
            const load = engine.allocatePebbleLoad(capacity, stoneAvail, oreAvail, oreFirst);
            return (load.stone + load.ore) > 0;
        }
        return stoneAvail > 0;
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
    hardwoodCellColors: [
        "#5c3a1e", "#6b4423", "#7a5230", "#8b5a2b",
        "#4a2f1a", "#6f4e37", "#8d6e63", "#a67c52"
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
    randomStalkCellColor: function(stalk) {
        const palette = stalk && stalk.type === "hardwood" ? engine.hardwoodCellColors : engine.bambooCellColors;
        return palette[Math.floor(Math.random() * palette.length)];
    },
    isGrowHardwoodBought: function() {
        const bf = data.progress.base && data.progress.base.bambooForest;
        return !!((bf && bf.growHardwoodBought) || 0);
    },
    getBambooForestDisplayName: function() {
        return engine.isGrowHardwoodBought() ? "Forest" : "Bamboo Forest";
    },
    getHiddenSpringSpiritSlotMax: function() {
        const hs = data.progress.base && data.progress.base.hiddenSpring;
        return hs ? (hs.spiritMax || 3) : 3;
    },
    getPebblePayBought: function() {
        const mine = data.progress.base && data.progress.base.mine;
        return (mine && mine.pebblePayBought) || 0;
    },
    applyPebblePay: function(amount) {
        const n = engine.getPebblePayBought();
        if (n <= 0 || amount <= 0) {
            return amount;
        }
        return Math.ceil(amount * (1 + 0.2 * n));
    },
    getMineshaftBeamsBought: function() {
        const mine = data.progress.base && data.progress.base.mine;
        return (mine && mine.mineshaftBeamsBought) || 0;
    },
    getEarthSpiritPebbleCarryAmount: function(spirit) {
        const power = engine.getEffectiveSpiritPower(spirit);
        const base = Math.floor(Math.sqrt(power));
        return engine.applyPebblePay(base);
    },
    formatEarthSpiritPebbleCarry: function(spirit) {
        const raw = engine.getEarthSpiritPebbleCarryAmount(spirit);
        const stone = engine.applyEchoedShelving(raw);
        if (stone === raw) {
            return raw + " stone/ore";
        }
        return stone + " stone / " + raw + " ore";
    },
    getEarthSpiritPebbleMax: function() {
        const hs = data.progress.base && data.progress.base.hiddenSpring;
        const bought = hs ? (hs.pebbleCapacityBought || 0) : 0;
        return 1 + bought;
    },
    getPondWaterSpiritSlotMax: function() {
        return 3;
    },
    getWaterDropletCapacityMultiplier: function() {
        const hs = data.progress.base && data.progress.base.hiddenSpring;
        const bought = hs ? (hs.carryingCapacityBought || 0) : 0;
        return Math.pow(1.5, bought);
    },
    getWaterDropletVolumeForSpirit: function(spirit) {
        return Math.ceil((engine.getEffectiveSpiritPower(spirit) || 1) * engine.getWaterDropletCapacityMultiplier() / 2);
    },
    findWaterSpiritPlacementSlot: function() {
        const pondMax = engine.getPondWaterSpiritSlotMax();
        if (engine.isPondBuiltFromFoxDen()) {
            for (let si = 0; si < pondMax; si++) {
                if (!engine.getSpiritAtLocation("pond", si, "water")) {
                    return { location: "pond", slot: si };
                }
            }
        }
        const slotMax = engine.getHiddenSpringSpiritSlotMax();
        for (let si = 0; si < slotMax; si++) {
            if (!engine.getSpiritAtLocation("hiddenSpring", si, "water")) {
                return { location: "hiddenSpring", slot: si };
            }
        }
        return null;
    },
    assembleWaterSpiritFromWishingWell: function() {
        const hs = data.progress.base && data.progress.base.hiddenSpring;
        if (!hs) {
            return false;
        }
        const placement = engine.findWaterSpiritPlacementSlot();
        if (!placement) {
            return false;
        }
        if (!hs.spirits) {
            hs.spirits = [];
        }
        if (!hs.spiritIdCounter) {
            hs.spiritIdCounter = 1;
        }
        let waterCount = 0;
        for (let i = 0; i < hs.spirits.length; i++) {
            if (hs.spirits[i].kind === "water") {
                waterCount++;
            }
        }
        const spirit = {
            id: hs.spiritIdCounter++,
            kind: "water",
            colorIndex: waterCount % 8,
            level: 1,
            exp: 0,
            expToLevel: 15,
            spiritPower: 1,
            training: 0,
            trainingTimerMs: 0,
            location: placement.location,
            slot: placement.slot
        };
        if (placement.location === "hiddenSpring") {
            spirit.dropletCooldownMs = 5000;
        }
        hs.spirits.push(spirit);
        return true;
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
        if (kind === "fire") {
            const bonfireMax = engine.getBonfireFireSpiritSlotMax();
            for (let si = 0; si < bonfireMax; si++) {
                if (!engine.getSpiritAtLocation("bonfire", si, "fire")) {
                    return { location: "bonfire", slot: si };
                }
            }
            if (engine.isAtelierForgeBuilt()) {
                const atelierMax = engine.getAtelierFireSpiritSlotMax();
                for (let si = 0; si < atelierMax; si++) {
                    if (!engine.getSpiritAtLocation("atelier", si, "fire")) {
                        return { location: "atelier", slot: si };
                    }
                }
            }
            return null;
        }
        if (kind === "water") {
            for (let si = 0; si < slotMax; si++) {
                if (!engine.getSpiritAtLocation("hiddenSpring", si, "water")) {
                    return { location: "hiddenSpring", slot: si };
                }
            }
            if (engine.isPondBuiltFromFoxDen()) {
                const pondMax = engine.getPondWaterSpiritSlotMax();
                for (let psi = 0; psi < pondMax; psi++) {
                    if (!engine.getSpiritAtLocation("pond", psi, "water")) {
                        return { location: "pond", slot: psi };
                    }
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
        const max = kind === "fire" ? 4 : engine.getHiddenSpringSpiritSlotMax();
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
            data.progress.base.mapRevealed.mine = true;
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
            training: 0,
            trainingTimerMs: 0,
            location: placement.location,
            slot: placement.slot
        };
        if (kind === "earth") {
            spirit.pebbleCooldownMs = 5000;
            spirit.autoReturnToMine = true;
        } else if (kind === "water") {
            if (placement.location === "hiddenSpring") {
                spirit.dropletCooldownMs = 5000;
            }
        } else if (kind === "fire") {
            spirit.forgeTimerMs = 0;
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
    findExtraSpiritPlacementSlot: function(kind) {
        if (kind === "plant") {
            const stalkCount = resortData.bambooForestConfig.stalkCount || 4;
            for (let si = 0; si < stalkCount; si++) {
                if (!engine.getSpiritAtLocation("bambooForest", si, "plant")) {
                    return { location: "bambooForest", slot: si };
                }
            }
            return null;
        }
        if (kind === "fire") {
            const existing = engine.findSpiritPlacementSlot("fire");
            if (existing) {
                return existing;
            }
            const defs = engine.getFireLauncherPlatformDefs();
            for (let i = 0; i < defs.length; i++) {
                const platformKey = defs[i].key;
                if (!engine.isFireLauncherPlatformBuilt(platformKey)) {
                    continue;
                }
                const location = engine.getFireLauncherLocationKey(platformKey);
                if (!engine.getSpiritAtLocation(location, 0, "fire")) {
                    return { location: location, slot: 0 };
                }
            }
            return null;
        }
        return engine.findSpiritPlacementSlot(kind);
    },
    assembleExtraSpirit: function(kind) {
        const hs = data.progress.base && data.progress.base.hiddenSpring;
        if (!hs || !kind) {
            return false;
        }
        const placement = engine.findExtraSpiritPlacementSlot(kind);
        if (!placement) {
            return false;
        }
        if (!hs.spirits) {
            hs.spirits = [];
        }
        if (!hs.spiritIdCounter) {
            hs.spiritIdCounter = 1;
        }
        let kindCount = 0;
        for (let i = 0; i < hs.spirits.length; i++) {
            if (hs.spirits[i].kind === kind) {
                kindCount++;
            }
        }
        const spirit = {
            id: hs.spiritIdCounter++,
            kind: kind,
            colorIndex: kindCount % 8,
            level: 1,
            exp: 0,
            expToLevel: 15,
            spiritPower: 1,
            training: 0,
            trainingTimerMs: 0,
            location: placement.location,
            slot: placement.slot
        };
        if (kind === "earth") {
            spirit.pebbleCooldownMs = 5000;
            spirit.autoReturnToMine = true;
            if (data.progress.base.mapRevealed) {
                data.progress.base.mapRevealed.mine = true;
            }
        } else if (kind === "water") {
            if (placement.location === "hiddenSpring") {
                spirit.dropletCooldownMs = 5000;
            }
        } else if (kind === "fire") {
            spirit.forgeTimerMs = 0;
        }
        hs.spirits.push(spirit);
        return true;
    },
    assemblePlantSpiritFromPurchase: function() {
        const hs = data.progress.base && data.progress.base.hiddenSpring;
        const torii = data.progress.base && data.progress.base.torii;
        const purchaseMax = engine.getNurturePlantSpiritMax();
        if (!hs || !torii || (torii.plantSpiritsBought || 0) >= purchaseMax) {
            return false;
        }
        if (!hs.spirits) {
            hs.spirits = [];
        }
        let slot = -1;
        for (let si = 0; si < resortData.bambooForestConfig.stalkCount; si++) {
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
            training: 0,
            trainingTimerMs: 0,
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
        const upgradeKey = kind === "earth" ? "assembleEarthSpirit"
            : (kind === "water" ? "gatherWaterSpirit" : "sparkFireSpirit");
        const up = resortData.buildings.hiddenSpring.upgrades[upgradeKey];
        if (!up || (up.canBuy && !up.canBuy())) {
            return false;
        }
        const cost = up.getCost();
        if (!resortData.canAffordCost(cost)) {
            return false;
        }
        if (!engine.assembleSpiritFromPurchase(kind)) {
            return false;
        }
        resortData.deductCost(cost);
        return true;
    },
    getEffectiveSpiritPower: function(spirit) {
        if (!spirit) {
            return 0;
        }
        const power = spirit.spiritPower || 0;
        return power + Math.min(spirit.training || 0, power);
    },
    /** Assumed continuous forge exp/s when always smelting (batch x 3 / 60s). */
    getAtelierForgeExpPerSec: function(spirit) {
        const batch = engine.getForgeSmeltBatch(spirit);
        return (batch * 3) / 60;
    },
    /** Exp granted per droplet hit on a fire launcher. */
    getFireLauncherExpPerDroplet: function(platformKey) {
        const def = engine.getFireLauncherPlatformDef(platformKey);
        if (def && def.expPerHit != null) {
            return def.expPerHit;
        }
        return engine.getFireLauncherHeatPerStrike(platformKey) / 5;
    },
    /** Assumed continuous exp/s while always firing (one droplet hit per interval). */
    getFireLauncherExpPerSec: function(platformKey) {
        const def = engine.getFireLauncherPlatformDef(platformKey);
        const intervalMs = (def && def.intervalMs) || 1000;
        if (intervalMs <= 0) {
            return 0;
        }
        return engine.getFireLauncherExpPerDroplet(platformKey) / (intervalMs / 1000);
    },
    /** Assumed continuous droplet delivery exp/s: volume / full-path travel time. */
    getWaterSpiritDropletExpPerSec: function(spirit) {
        const volume = engine.getWaterDropletVolumeForSpirit(spirit);
        const travelSec = engine.estimatePathTravelSeconds(0, engine.getDropletTravelSpeedOpts());
        if (!(travelSec > 0)) {
            return 0;
        }
        return volume / travelSec;
    },
    /** Assumed continuous training-spot exp/s from card effects. */
    getSpiritTrainingExpPerSec: function() {
        const trainFx = engine.getSpiritTrainingCardEffects();
        const durationMs = trainFx.durationMs || 0;
        if (durationMs <= 0) {
            return 0;
        }
        return (trainFx.exp || 0) / (durationMs / 1000);
    },
    isSpiritAtTrainingSpot: function(spirit) {
        return !!(spirit && spirit.location === "spiritTraining");
    },
    leaveSpiritTrainingIfNeeded: function(spirit, destLocation) {
        if (!spirit) {
            return;
        }
        if (spirit.location === "spiritTraining" && destLocation !== "spiritTraining") {
            spirit.trainingTimerMs = 0;
        }
    },
    getSpiritTrainingCardEffects: function() {
        if (typeof shrineCards === "undefined" || !shrineCards.getAggregatedEffects) {
            return {
                cost: 500,
                durationMs: 60000,
                exp: 60,
                training: 0.1
            };
        }
        const card = shrineCards.getAggregatedEffects();
        const baseCost = 500 + (card.hiddenSpringPowerCostFlat || 0);
        const reduction = card.hiddenSpringManaCostReductionAdd || 0;
        return {
            cost: baseCost * (1 - reduction),
            durationMs: 60000 - (card.hiddenSpringDurationReduceMs || 0),
            exp: 60 + (card.hiddenSpringPowerExpFlat || 0),
            training: 0.1 + (card.hiddenSpringPowerTrainingFlat || 0)
        };
    },
    getSpiritTrainingManaCost: function() {
        return engine.getSpiritTrainingCardEffects().cost;
    },
    getSpiritTrainingDurationMs: function() {
        return engine.getSpiritTrainingCardEffects().durationMs;
    },
    canSpiritTrain: function(spirit) {
        if (!engine.isSpiritAtTrainingSpot(spirit) || !engine.isSpiritTrainingSpotBought()) {
            return false;
        }
        const hs = data.progress.base.hiddenSpring;
        const need = engine.getSpiritTrainingManaCost();
        if (!hs || (hs.mana || 0) < need) {
            return false;
        }
        return true;
    },
    updateSpiritTraining: function(tickMs) {
        if (!engine.isSpiritTrainingSpotBought()) {
            return;
        }
        const spirit = engine.getSpiritAtLocation("spiritTraining", 0);
        if (!spirit) {
            return;
        }
        if (!engine.canSpiritTrain(spirit)) {
            return;
        }
        const trainFx = engine.getSpiritTrainingCardEffects();
        spirit.trainingTimerMs = (spirit.trainingTimerMs || 0) + tickMs;
        const durationMs = trainFx.durationMs;
        if (spirit.trainingTimerMs < durationMs) {
            return;
        }
        spirit.trainingTimerMs = 0;
        const hs = data.progress.base.hiddenSpring;
        hs.mana = Math.max(0, (hs.mana || 0) - trainFx.cost);
        engine.grantSpiritExp(spirit, trainFx.exp);
        spirit.training = round1((spirit.training || 0) + trainFx.training);
    },
    sanitizeSpiritName: function(raw) {
        return String(raw == null ? "" : raw).replace(/[^a-zA-Z0-9]/g, "").slice(0, 24);
    },
    getSpiritDefaultName: function(spirit) {
        if (!spirit) {
            return "Spirit";
        }
        const kind = spirit.kind || "earth";
        const kindLabel = kind.charAt(0).toUpperCase() + kind.slice(1);
        return kindLabel + " Spirit #" + spirit.id;
    },
    getSpiritDisplayName: function(spirit) {
        if (!spirit) {
            return "Spirit";
        }
        const custom = engine.sanitizeSpiritName(spirit.name);
        if (custom) {
            return custom;
        }
        return engine.getSpiritDefaultName(spirit);
    },
    renameSpirit: function(spirit, raw) {
        if (!spirit) {
            return;
        }
        const text = String(raw == null ? "" : raw);
        if (text === engine.getSpiritDefaultName(spirit)) {
            delete spirit.name;
            return;
        }
        const cleaned = engine.sanitizeSpiritName(text);
        if (!cleaned) {
            delete spirit.name;
            return;
        }
        spirit.name = cleaned;
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
        if (location === "spiritTraining") {
            if (slotIndex !== 0 || !engine.isSpiritTrainingSpotBought()) {
                return false;
            }
            const trainingOccupant = engine.getSpiritAtLocation("spiritTraining", 0);
            if (trainingOccupant && trainingOccupant.id !== selected.id && trainingOccupant.kind !== selected.kind) {
                return false;
            }
        }
        if (selected.kind === "plant") {
            return engine.movePlantSpiritTo(location, slotIndex);
        }
        if (selected.kind === "earth") {
            if (location !== "hiddenSpring" && location !== "mine" && location !== "spiritTraining") {
                return false;
            }
            if (location === "mine" && slotIndex >= 3) {
                return false;
            }
            const fromHidden = (selected.location || "hiddenSpring") === "hiddenSpring";
            const occupant = location === "spiritTraining"
                ? engine.getSpiritAtLocation(location, slotIndex)
                : engine.getSpiritAtLocation(location, slotIndex, "earth");
            if (occupant && occupant.id !== selected.id) {
                const oldLocation = selected.location || "hiddenSpring";
                const oldSlot = selected.slot || 0;
                engine.leaveSpiritTrainingIfNeeded(occupant, oldLocation);
                occupant.location = oldLocation;
                occupant.slot = oldSlot;
                if (oldLocation !== "hiddenSpring") {
                    engine.recallPebblesForSpirit(occupant.id);
                }
            }
            engine.leaveSpiritTrainingIfNeeded(selected, location);
            selected.location = location;
            selected.slot = slotIndex;
            if (fromHidden && location !== "hiddenSpring") {
                engine.recallPebblesForSpirit(selected.id);
            }
            return true;
        }
        if (selected.kind === "water") {
            return engine.moveWaterSpiritTo(location, slotIndex);
        }
        if (selected.kind === "fire") {
            return engine.moveFireSpiritTo(location, slotIndex);
        }
        return false;
    },
    moveFireSpiritTo: function(location, slotIndex) {
        const selected = engine.getSpiritById(data.progress.selectedSpiritId);
        if (!selected || selected.kind !== "fire") {
            return false;
        }
        const bonfireMax = engine.getBonfireFireSpiritSlotMax();
        const atelierMax = engine.getAtelierFireSpiritSlotMax();
        if (location === "bonfire") {
            if (slotIndex < 0 || slotIndex >= bonfireMax) {
                return false;
            }
        } else if (location === "atelier") {
            if (!engine.isAtelierForgeBuilt() || slotIndex < 0 || slotIndex >= atelierMax) {
                return false;
            }
        } else if (location.indexOf("fireLauncher_") === 0) {
            const platformKey = engine.parseFireLauncherLocation(location);
            if (!platformKey || slotIndex !== 0 || !engine.isFireLauncherPlatformBuilt(platformKey)) {
                return false;
            }
        } else if (location === "spiritTraining") {
            if (slotIndex !== 0 || !engine.isSpiritTrainingSpotBought()) {
                return false;
            }
        } else {
            return false;
        }
        const oldLocation = selected.location || "bonfire";
        const oldSlot = selected.slot || 0;
        const occupant = location === "spiritTraining"
            ? engine.getSpiritAtLocation(location, slotIndex)
            : engine.getSpiritAtLocation(location, slotIndex, "fire");
        if (occupant && occupant.id !== selected.id) {
            engine.leaveSpiritTrainingIfNeeded(occupant, oldLocation);
            occupant.location = oldLocation;
            occupant.slot = oldSlot;
            if (oldLocation === "atelier") {
                occupant.forgeTimerMs = occupant.forgeTimerMs || 0;
            }
        }
        engine.leaveSpiritTrainingIfNeeded(selected, location);
        selected.location = location;
        selected.slot = slotIndex;
        if (location === "atelier") {
            selected.forgeTimerMs = selected.forgeTimerMs || 0;
        }
        return true;
    },
    moveWaterSpiritTo: function(location, slotIndex) {
        const selected = engine.getSpiritById(data.progress.selectedSpiritId);
        if (!selected || selected.kind !== "water") {
            return false;
        }
        const pondMax = engine.getPondWaterSpiritSlotMax();
        if (location === "pond") {
            if (!engine.isPondBuiltFromFoxDen() || slotIndex < 0 || slotIndex >= pondMax) {
                return false;
            }
        } else if (location === "spiritTraining") {
            if (slotIndex !== 0 || !engine.isSpiritTrainingSpotBought()) {
                return false;
            }
        } else if (location !== "hiddenSpring") {
            return false;
        } else if (slotIndex >= engine.getHiddenSpringSpiritSlotMax()) {
            return false;
        }
        const oldLocation = selected.location || "hiddenSpring";
        const oldSlot = selected.slot || 0;
        const occupant = location === "spiritTraining"
            ? engine.getSpiritAtLocation(location, slotIndex)
            : engine.getSpiritAtLocation(location, slotIndex, "water");
        if (occupant && occupant.id !== selected.id) {
            engine.leaveSpiritTrainingIfNeeded(occupant, oldLocation);
            occupant.location = oldLocation;
            occupant.slot = oldSlot;
            if (oldLocation === "hiddenSpring") {
                engine.recallDropletsForSpirit(occupant.id);
            }
        }
        if (oldLocation === "hiddenSpring" && location !== "hiddenSpring") {
            engine.recallDropletsForSpirit(selected.id);
        }
        engine.leaveSpiritTrainingIfNeeded(selected, location);
        selected.location = location;
        selected.slot = slotIndex;
        return true;
    },
    movePlantSpiritTo: function(location, slotIndex) {
        const selected = engine.getSpiritById(data.progress.selectedSpiritId);
        if (!selected || selected.kind !== "plant") {
            return false;
        }
        if (location === "spiritTraining") {
            if (slotIndex !== 0 || !engine.isSpiritTrainingSpotBought()) {
                return false;
            }
        } else if (location !== "bambooForest" || slotIndex < 0 || slotIndex >= resortData.bambooForestConfig.stalkCount) {
            return false;
        }
        const oldLocation = selected.location || "bambooForest";
        const oldSlot = selected.slot || 0;
        const occupant = location === "spiritTraining"
            ? engine.getSpiritAtLocation(location, slotIndex)
            : engine.getSpiritAtLocation(location, slotIndex, "plant");
        if (occupant && occupant.id !== selected.id) {
            engine.leaveSpiritTrainingIfNeeded(occupant, oldLocation);
            occupant.location = oldLocation;
            occupant.slot = oldSlot;
            if (oldLocation === "bambooForest") {
                engine.applyBambooSpiritRemoved(oldSlot);
            }
        }
        if (oldLocation === "bambooForest" && (location !== "bambooForest" || oldSlot !== slotIndex)) {
            engine.applyBambooSpiritRemoved(oldSlot);
        }
        engine.leaveSpiritTrainingIfNeeded(selected, location);
        selected.location = location;
        selected.slot = slotIndex;
        if (location === "bambooForest") {
            engine.refreshBambooForestBaseChips();
        }
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
                    base.mine.resources = { dirt: 0, stone: 0, ore: 0 };
                }
                base.mine.resources.stone = (base.mine.resources.stone || 0) + engine.getPebblePayloadStone(pebble);
                base.mine.resources.ore = (base.mine.resources.ore || 0) + engine.getPebblePayloadOre(pebble);
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
        amount *= engine.getTeachFromExperienceExpMult(spirit);
        if (amount <= 0) {
            return;
        }
        spirit.exp = (spirit.exp || 0) + amount;
        spirit.expToLevel = spirit.expToLevel || 15;
        while (spirit.exp >= spirit.expToLevel) {
            spirit.exp -= spirit.expToLevel;
            spirit.level = (spirit.level || 1) + 1;
            spirit.expToLevel = Math.round(spirit.expToLevel * 1.8);
            spirit.spiritPower = engine.getSpiritPowerForLevel(spirit.level);
        }
    },
    getTeachFromExperienceExpMult: function(spirit) {
        const orb = data.progress.base && data.progress.base.mage_tower;
        if (!orb || !(orb.teachFromExperienceBought > 0) || !spirit) {
            return 1;
        }
        const orbLevel = orb.level || 0;
        if (orbLevel <= 0) {
            return 1;
        }
        const spiritLevel = (spirit.level === undefined || spirit.level === null) ? 1 : spirit.level;
        const bonus = Math.max(0, Math.min(1, (orbLevel - spiritLevel) / orbLevel));
        return 1 + bonus;
    },
    getBuildUponCloneFoundationBought: function() {
        const bonfire = data.progress.base && data.progress.base.bonfire;
        return (bonfire && bonfire.buildUponCloneFoundationBought) || 0;
    },
    getCloneFoundationAudFlat: function() {
        return engine.getBuildUponCloneFoundationBought() * 5;
    },
    getContemplateSturdinessBought: function() {
        const bonfire = data.progress.base && data.progress.base.bonfire;
        return (bonfire && bonfire.contemplateSturdinessBought) || 0;
    },
    getContemplateSturdinessMult: function() {
        return Math.pow(1.1, engine.getContemplateSturdinessBought());
    },
    getSpiritPowerForLevel: function(level) {
        const n = Math.max(1, Math.floor(level || 1));
        return 1 + (n * (n - 1) / 2);
    },
    getSpiritPowerNextIncrease: function(level) {
        return Math.max(1, Math.floor(level || 1));
    },
    updateEarthSpirits: function(tickMs) {
        const hs = data.progress.base.hiddenSpring;
        const pebbleMax = engine.getEarthSpiritPebbleMax();
        const formMs = engine.earthPebbleFormMs;
        hs.pebbleGlobalCooldownMs = Math.max(0, hs.pebbleGlobalCooldownMs - tickMs);
        for (let i = 0; i < hs.spirits.length; i++) {
            const spirit = hs.spirits[i];
            if (spirit.kind !== "earth" || (spirit.location || "hiddenSpring") !== "hiddenSpring") {
                continue;
            }
            if (engine.countPebblesForSpirit(spirit.id) >= pebbleMax) {
                continue;
            }
            if (!engine.canEarthSpiritLoadPebble(spirit)) {
                continue;
            }
            spirit.pebbleCooldownMs = Math.max(0, (spirit.pebbleCooldownMs || 0) - tickMs);
        }
        const ready = engine.getEarthSpiritsReadyToSpawnPebbles();
        if (ready.length && hs.pebbleGlobalCooldownMs <= 0) {
            const spirit = ready[0];
            if (engine.createPebbleForSpirit(spirit.id)) {
                spirit.pebbleCooldownMs = formMs;
                hs.pebbleGlobalCooldownMs = engine.earthPebbleGlobalGapMs;
            }
        }
        if (engine.isArrangementOfDiggingUnlocked()) {
            for (let di = 0; di < hs.spirits.length; di++) {
                const spirit = hs.spirits[di];
                if (spirit.kind !== "earth" || (spirit.location || "hiddenSpring") !== "hiddenSpring") {
                    continue;
                }
                if (spirit.autoReturnToMine === false) {
                    continue;
                }
                if (engine.canEarthSpiritLoadPebble(spirit)) {
                    continue;
                }
                if (engine.countPebblesForSpirit(spirit.id) > 0) {
                    continue;
                }
                const slot = engine.findEmptyEarthMineSlot();
                if (slot < 0) {
                    continue;
                }
                engine.leaveSpiritTrainingIfNeeded(spirit, "mine");
                spirit.location = "mine";
                spirit.slot = slot;
            }
        }
    },
    countPebblesForSpirit: function(spiritId) {
        return engine.getPebblesForSpirit(spiritId).length;
    },
    getPebblesForSpirit: function(spiritId) {
        const pebbles = (data.progress.base && data.progress.base.pebbles) || [];
        const out = [];
        for (let i = 0; i < pebbles.length; i++) {
            if (pebbles[i].spiritId === spiritId) {
                out.push(pebbles[i]);
            }
        }
        return out;
    },
    getDropletsForSpirit: function(spiritId) {
        const droplets = (data.progress.base && data.progress.base.droplets) || [];
        const out = [];
        for (let i = 0; i < droplets.length; i++) {
            if (droplets[i].spiritId === spiritId) {
                out.push(droplets[i]);
            }
        }
        return out;
    },
    createPebbleForSpirit: function(spiritId) {
        const base = data.progress.base;
        const spirit = engine.getSpiritById(spiritId);
        const capacity = engine.getEarthSpiritPebbleCarryAmount(spirit);
        if (engine.countPebblesForSpirit(spiritId) >= engine.getEarthSpiritPebbleMax()) {
            return false;
        }
        if (!base.mine || !base.mine.resources) {
            return false;
        }
        const oreUnlocked = engine.isBringOreToAtelierUnlocked();
        const oreFirst = oreUnlocked && engine.isArrangementOfPriorityUnlocked()
            && spirit.prioritizeOre;
        const stoneAvail = base.mine.resources.stone || 0;
        const oreAvail = oreUnlocked ? (base.mine.resources.ore || 0) : 0;
        let loadStone = 0;
        let loadOre = 0;
        if (oreUnlocked) {
            if ((stoneAvail + oreAvail) <= 0) {
                return false;
            }
            const load = engine.allocatePebbleLoad(capacity, stoneAvail, oreAvail, oreFirst);
            loadStone = load.stone;
            loadOre = load.ore;
        } else {
            if (stoneAvail <= 0) {
                return false;
            }
            loadStone = Math.min(capacity, stoneAvail);
        }
        if (loadStone + loadOre <= 0) {
            return false;
        }
        base.mine.resources.stone -= loadStone;
        base.mine.resources.ore = (base.mine.resources.ore || 0) - loadOre;
        if (!base.pebbles) {
            base.pebbles = [];
        }
        base.pebbles.push({
            id: base.pebbleIdCounter || 1,
            spiritId: spiritId,
            payloadStone: loadStone,
            payloadOre: loadOre,
            colorIndex: spirit ? (spirit.colorIndex || 0) : 0,
            pathProgress: 0,
            prevPathProgress: 0
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
        const distance = engine.getResortPathTotalDistance();
        const dtSec = tickMs / 1000;
        const speedOpts = engine.getPebbleTravelSpeedOpts();
        const next = [];
        for (let i = 0; i < pebbles.length; i++) {
            const pebble = pebbles[i];
            pebble.prevPathProgress = pebble.pathProgress || 0;
            pebble.pathProgress = engine.advancePathProgress(pebble.prevPathProgress, dtSec, 1, speedOpts);
            if (pebble.pathProgress >= distance) {
                const stoneAmt = engine.applyEchoedShelving(engine.getPebblePayloadStone(pebble));
                const oreAmt = engine.getPebblePayloadOre(pebble);
                if (stoneAmt > 0) {
                    base.stonePile.stone = (base.stonePile.stone || 0) + stoneAmt;
                    if (typeof view !== "undefined" && view.spawnResourceFloat) {
                        view.spawnResourceFloat("baseBuilding_stonePile", "stone", stoneAmt, "#949494");
                    }
                }
                if (oreAmt > 0) {
                    if (!base.atelier) {
                        base.atelier = { ore: 0, bars: 0 };
                    }
                    base.atelier.ore = (base.atelier.ore || 0) + oreAmt;
                    if (typeof view !== "undefined" && view.spawnResourceFloat) {
                        view.spawnResourceFloat("baseBuilding_atelier", "ore", oreAmt, "#d66a40");
                    }
                }
            } else {
                next.push(pebble);
            }
        }
        base.pebbles = next;
    },
    getBonfireExcessHeatForExp: function() {
        const heat = (data.progress.base.bonfire && data.progress.base.bonfire.heat) || 0;
        const protectedHeat = engine.getBonfireAssignedFireSpiritPowerTotal();
        return Math.max(0, heat - protectedHeat);
    },
    updateFireSpirits: function(tickMs) {
        const base = data.progress.base;
        const hs = base && base.hiddenSpring;
        if (!hs || !hs.spirits) {
            return;
        }
        const atelier = base.atelier || {};
        const excessHeat = engine.getBonfireExcessHeatForExp();
        const heatExpRate = excessHeat > 0 ? Math.sqrt(excessHeat / 10) / 10 : 0;
        const dtSec = tickMs / 1000;
        const forgeCycleMs = 60000;
        for (let i = 0; i < hs.spirits.length; i++) {
            const spirit = hs.spirits[i];
            if (spirit.kind !== "fire") {
                continue;
            }
            const loc = spirit.location || "bonfire";
            if (engine.isFireSpiritOnLauncher(spirit)) {
                continue;
            }
            if (loc === "bonfire" && heatExpRate > 0) {
                engine.grantSpiritExp(spirit, heatExpRate * dtSec);
            } else if (loc === "atelier" && engine.isAtelierForgeBuilt()) {
                if ((atelier.ore || 0) > 0) {
                    spirit.forgeTimerMs = (spirit.forgeTimerMs || 0) + tickMs;
                    while (spirit.forgeTimerMs >= forgeCycleMs && (atelier.ore || 0) > 0) {
                        spirit.forgeTimerMs -= forgeCycleMs;
                        const batchSize = engine.getForgeSmeltBatch(spirit);
                        const toProcess = Math.min(batchSize, atelier.ore || 0);
                        if (toProcess <= 0) {
                            break;
                        }
                        atelier.ore -= toProcess;
                        atelier.bars = (atelier.bars || 0) + toProcess;
                        engine.grantSpiritExp(spirit, toProcess * 3);
                    }
                }
                if ((atelier.ore || 0) <= 0) {
                    spirit.forgeTimerMs = (spirit.forgeTimerMs || 0) % forgeCycleMs;
                }
            }
        }
    },
    recallDropletsForSpirit: function(spiritId) {
        const base = data.progress.base;
        if (!base || !base.droplets) {
            return;
        }
        const next = [];
        for (let i = 0; i < base.droplets.length; i++) {
            if (base.droplets[i].spiritId !== spiritId) {
                next.push(base.droplets[i]);
            }
        }
        base.droplets = next;
    },
    completeDropletDelivery: function(d) {
        if (!d) {
            return;
        }
        const spirit = engine.getSpiritById(d.spiritId);
        if (spirit) {
            engine.grantSpiritExp(spirit, d.waterVolume || 0);
        }
        if (engine.isCisternBuiltFromFoxDen()) {
            const cistern = data.progress.base.cistern;
            const dropletVol = d.waterVolume || 0;
            const dropletHeat = d.heat || 0;
            const stored = cistern.waterVolume || 0;
            const atCapacity = stored >= engine.getCisternMaxCapacity();
            if (!engine.isCisternRefusingWater() && cistern.replaceWithHotterWater && atCapacity && dropletHeat > (cistern.temperature || 0)) {
                const dumpVol = Math.min(dropletVol, stored);
                if (dumpVol > 0) {
                    engine.addWaterToPond(dumpVol);
                    cistern.waterVolume = (cistern.waterVolume || 0) - dumpVol;
                    if (cistern.waterVolume <= 0) {
                        cistern.waterVolume = 0;
                        cistern.temperature = 0;
                    }
                }
            }
            const deliveredHeat = Math.min(dropletHeat, 100);
            const volBeforeAdd = cistern.waterVolume || 0;
            const room = engine.isCisternRefusingWater() ? 0 : Math.max(0, engine.getCisternMaxCapacity() - volBeforeAdd);
            const waterGain = Math.min(dropletVol, room);
            engine.addWaterToCistern(dropletVol, deliveredHeat);
            const essenceGain = Math.max(0, dropletHeat - 100) + (d.essence || 0);
            cistern.essence = (cistern.essence || 0) + essenceGain;
            if (essenceGain > 0) {
                data.progress.essenceMade = (data.progress.essenceMade || 0) + essenceGain;
            }
            if (typeof view !== "undefined" && view.spawnCisternGainFloat) {
                view.spawnCisternGainFloat(waterGain, essenceGain);
            }
        }
        const base = data.progress.base;
        const next = [];
        for (let i = 0; i < (base.droplets || []).length; i++) {
            if (base.droplets[i].id !== d.id) {
                next.push(base.droplets[i]);
            }
        }
        base.droplets = next;
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
        if (!spirit || spirit.kind !== "water") {
            return false;
        }
        if (!base.droplets) {
            base.droplets = [];
        }
        if (engine.getDropletForSpirit(spiritId)) {
            return false;
        }
        const volume = engine.getWaterDropletVolumeForSpirit(spirit);
        base.droplets.push({
            id: base.dropletIdCounter || 1,
            spiritId: spiritId,
            waterVolume: volume,
            heat: 50,
            essence: 0,
            pathProgress: 0,
            prevPathProgress: 0
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
            d.heat = (d.heat || 0) + add;
            return true;
        }
        return false;
    },
    updateWaterSpirits: function(tickMs) {
        const hs = data.progress.base.hiddenSpring;
        const formMs = engine.waterDropletFormMs;
        hs.dropletGlobalCooldownMs = Math.max(0, hs.dropletGlobalCooldownMs - tickMs);
        for (let i = 0; i < hs.spirits.length; i++) {
            const spirit = hs.spirits[i];
            if (spirit.kind !== "water" || (spirit.location || "hiddenSpring") !== "hiddenSpring") {
                continue;
            }
            if (engine.getDropletForSpirit(spirit.id)) {
                continue;
            }
            spirit.dropletCooldownMs = Math.max(0, (spirit.dropletCooldownMs || 0) - tickMs);
        }
        if (engine.isEqualDropletSpacingEnabled()) {
            engine.updateEqualDropletSpacing(hs, formMs, tickMs);
            return;
        }
        const ready = engine.getWaterSpiritsReadyToSpawnDroplets();
        if (ready.length && hs.dropletGlobalCooldownMs <= 0) {
            const spirit = ready[0];
            if (engine.createDropletForSpirit(spirit.id)) {
                spirit.dropletCooldownMs = formMs;
                hs.dropletGlobalCooldownMs = engine.waterDropletGlobalGapMs;
            }
        }
    },
    updateEqualDropletSpacing: function(hs, formMs, tickMs) {
        const ordered = engine.getHiddenSpringWaterSpirits();
        const n = ordered.length;
        if (!n) {
            return;
        }
        if (hs.equalSpacingCycleActive) {
            hs.equalSpacingElapsedMs = (hs.equalSpacingElapsedMs || 0) + tickMs;
        }
        const intervalMs = engine.getEqualDropletSpacingIntervalMs(n);
        for (let i = 0; i < n; i++) {
            const spirit = ordered[i];
            if (engine.getDropletForSpirit(spirit.id)) {
                continue;
            }
            if ((spirit.dropletCooldownMs || 0) > 0) {
                continue;
            }
            if (i === 0) {
                const nextId = (hs.equalSpacingCycleId || 0) + 1;
                if (engine.createDropletForSpirit(spirit.id)) {
                    hs.equalSpacingCycleId = nextId;
                    hs.equalSpacingElapsedMs = 0;
                    hs.equalSpacingCycleActive = true;
                    spirit.dropletCooldownMs = formMs;
                    spirit.equalSpacingCycleId = nextId;
                }
                continue;
            }
            if (!hs.equalSpacingCycleActive) {
                continue;
            }
            const cycleId = hs.equalSpacingCycleId || 0;
            if (spirit.equalSpacingCycleId === cycleId) {
                continue;
            }
            if ((hs.equalSpacingElapsedMs || 0) < i * intervalMs) {
                continue;
            }
            if (engine.createDropletForSpirit(spirit.id)) {
                spirit.dropletCooldownMs = formMs;
                spirit.equalSpacingCycleId = cycleId;
            }
        }
    },
    updateDroplets: function(tickMs) {
        const base = data.progress.base;
        const droplets = base && base.droplets;
        if (!droplets || !droplets.length) {
            return;
        }
        const distance = engine.getResortPathTotalDistance();
        const sec = tickMs / 1000;
        const speedOpts = engine.getDropletTravelSpeedOpts();
        const next = [];
        for (let i = 0; i < droplets.length; i++) {
            const d = droplets[i];
            const heat = d.heat || 0;
            if (heat > 0) {
                d.heat = Math.max(0, heat - (heat * 0.02 * sec));
            }
            d.prevPathProgress = d.pathProgress || 0;
            d.pathProgress = engine.advancePathProgress(d.prevPathProgress, sec, 1, speedOpts);
            if (d.pathProgress >= distance) {
                engine.completeDropletDelivery(d);
            } else {
                next.push(d);
            }
        }
        base.droplets = next;
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
        if (seg.hasReinforcedStairs) {
            return "reinforced";
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
        return jobType === "addRailing" || jobType === "addStairs" || jobType === "addLanterns" || jobType === "reinforcedStairs";
    },
    pathJobUsesHalfSpeedTo: function(jobType) {
        return jobType === "addRailing" || jobType === "addStairs" || jobType === "reinforcedStairs";
    },
    pathJobUsesHalfSpeedReturn: function(jobType) {
        return jobType === "collectStone";
    },
    syncResortPathDom: function() {
        const specs = engine.getResortPathSegmentSpecs();
        if (!engine._pathDomSig) {
            engine._pathDomSig = [];
        }
        const prev = engine._pathDomSig;
        const next = [];
        let changed = prev.length !== specs.length || !engine._pathDomGlobalsApplied;
        for (let i = 0; i < specs.length; i++) {
            const sig = (engine.isPathSegmentRevealed(i) ? "1" : "0") + "|" + engine.getPathSegmentVisualTier(i);
            next.push(sig);
            if (prev[i] !== sig) {
                changed = true;
            }
        }
        if (!changed) {
            return;
        }
        if (!engine._pathDomGlobalsApplied) {
            const globalTrack = document.querySelector(".resort-path-track");
            const globalHollow = document.querySelector(".resort-path-hollow");
            if (globalTrack) {
                globalTrack.setAttribute("d", "");
            }
            if (globalHollow) {
                globalHollow.setAttribute("d", "");
            }
            const end = engine.getResortPathEnd();
            viewData.layout.pathEndX = end.x;
            viewData.layout.pathEndY = end.y;
            const map = document.getElementById("baseResortMap");
            if (map && end) {
                map.style.setProperty("--path-end-x", `${Math.round(end.x)}px`);
                map.style.setProperty("--path-end-y", `${Math.round(end.y)}px`);
                engine._pathDomGlobalsApplied = true;
            }
        }
        for (let i = 0; i < specs.length; i++) {
            if (prev[i] === next[i]) {
                continue;
            }
            const trackEl = document.getElementById(`pathSegmentTrack_${i}`);
            const hollowEl = document.getElementById(`pathSegmentHollow_${i}`);
            if (!trackEl || !hollowEl) {
                next[i] = "";
                continue;
            }
            const revealed = next[i].charAt(0) === "1";
            const tier = next[i].slice(2);
            const d = engine.getPathSegmentSvgSubpath(i);
            trackEl.setAttribute("d", d);
            hollowEl.setAttribute("d", d);
            const dashedTier = tier === "rocks";
            const showTrack = revealed ? "" : "none";
            const showHollow = revealed && !dashedTier ? "" : "none";
            trackEl.style.display = showTrack;
            hollowEl.style.display = showHollow;
            trackEl.setAttribute("class", `path-seg-track path-seg-track-tier-${tier}`);
            hollowEl.setAttribute("class", `path-seg-hollow path-seg-hollow-tier-${tier}`);
            if (dashedTier) {
                trackEl.setAttribute("pathLength", "100");
                trackEl.setAttribute("stroke-dasharray", "14 10");
            } else {
                trackEl.removeAttribute("pathLength");
                trackEl.removeAttribute("stroke-dasharray");
            }
            hollowEl.removeAttribute("pathLength");
            hollowEl.removeAttribute("stroke-dasharray");
        }
        engine._pathDomSig = next;
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
    getPathSegmentData: function(segmentIndex) {
        const segs = data.progress.base.pathSegments;
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
        return engine.getNextPathSegmentNeedingJob("removeRocks");
    },
    getNextPathSegmentNeedingJob: function(jobType) {
        const last = engine.getLastPathSegmentIndex();
        for (let i = last; i >= 0; i--) {
            if (!engine.isPathSegmentAccessible(i)) {
                continue;
            }
            if (engine.canStartPathSegmentJob(i, jobType)) {
                return i;
            }
        }
        return null;
    },
    allPathSegmentsHaveUpgrade: function(kind) {
        const segs = data.progress.base && data.progress.base.pathSegments;
        if (!segs || segs.length <= 0) {
            return false;
        }
        for (let i = 0; i < segs.length; i++) {
            if (kind === "railing" && !segs[i].hasRailing) {
                return false;
            }
            if (kind === "stairs" && !segs[i].hasStairs) {
                return false;
            }
            if (kind === "lanterns" && !segs[i].hasLanterns) {
                return false;
            }
        }
        return true;
    },
    isAtelierBuiltFromFoxDen: function() {
        const rh = data.progress.base && data.progress.base.foxDen;
        return !!(rh && rh.unlocks && rh.unlocks.atelier);
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
        let speed = cfg.okamiTravelSpeed !== undefined ? cfg.okamiTravelSpeed : 35;
        const cardAdd = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().okamiPathSpeedAdd || 0) : 0;
        return speed * (1 + cardAdd);
    },
    getOkamiPathJob: function() {
        const okami = engine.getOkami();
        return okami.pathJob || null;
    },
    isManaCloneJob: function(job) {
        return !!(job && job.jobType === "sendManaClone");
    },
    getManaCloneJob: function() {
        const job = engine.getOkamiPathJob();
        return engine.isManaCloneJob(job) ? job : null;
    },
    getPausedManaCloneJob: function() {
        const okami = engine.getOkami();
        return okami.pausedManaCloneJob || null;
    },
    isSpiritTrainingSpotBought: function() {
        const hs = data.progress.base && data.progress.base.hiddenSpring;
        return !!(hs && hs.spiritTrainingSpotBought);
    },
    snapshotManaCloneJob: function(job) {
        if (!engine.isManaCloneJob(job)) {
            return null;
        }
        const phase = job.paused ? (job.pausedPhase || job.phase) : job.phase;
        const pathProgress = job.paused && job.pausedPathProgress !== undefined
            ? job.pausedPathProgress
            : job.pathProgress;
        return {
            jobType: "sendManaClone",
            phase: phase,
            pathProgress: pathProgress,
            targetProgress: job.targetProgress !== undefined ? job.targetProgress : 0,
            depositAmount: job.depositAmount || 0,
            paused: false
        };
    },
    storePausedManaCloneJob: function(job) {
        const snap = engine.snapshotManaCloneJob(job);
        if (!snap) {
            return;
        }
        engine.getOkami().pausedManaCloneJob = snap;
    },
    beginManaCloneWeaving: function(job) {
        const okami = engine.getOkami();
        const hs = data.progress.base && data.progress.base.hiddenSpring;
        const deposit = (job && job.depositAmount !== undefined)
            ? job.depositAmount
            : ((hs && hs.sendManaCloneCargo && hs.sendManaCloneCargo.depositAmount) || 0);
        okami.pathJob = null;
        if (okami.assignedBuildingKey === "hiddenSpring") {
            okami.assignedBuildingKey = "";
        }
        if (hs) {
            hs.sendManaCloneCargo = { depositAmount: deposit };
        }
        data.progress._pendingFillManaSeconds = deposit / 200;
        const up = engine.getUpgradeDef("hiddenSpring", "fillMana");
        engine.startWeaving("hiddenSpring", "fillMana", up);
        delete data.progress._pendingFillManaSeconds;
    },
    resumeManaCloneJob: function() {
        engine.interruptOkamiForPathJob();
        const okami = engine.getOkami();
        const stored = okami.pausedManaCloneJob;
        const active = okami.pathJob;
        if (active && engine.isManaCloneJob(active) && active.paused) {
            active.paused = false;
            active.phase = active.pausedPhase || active.phase;
            active.pathProgress = active.pausedPathProgress !== undefined ? active.pausedPathProgress : active.pathProgress;
            delete active.pausedPhase;
            delete active.pausedPathProgress;
            okami.assignedBuildingKey = "hiddenSpring";
            return true;
        }
        if (!stored) {
            return false;
        }
        if (active) {
            engine.pauseActivePathJobToStorage();
        }
        okami.pathJob = Object.assign({ paused: false }, stored);
        okami.pausedManaCloneJob = null;
        okami.assignedBuildingKey = "hiddenSpring";
        return true;
    },
    startSendManaClone: function() {
        const okami = engine.getOkami();
        if (okami.pausedManaCloneJob || (okami.pathJob && engine.isManaCloneJob(okami.pathJob) && okami.pathJob.paused)) {
            return engine.resumeManaCloneJob();
        }
        if (!engine.canStartFillMana("hiddenSpring")) {
            return false;
        }
        const hs = data.progress.base.hiddenSpring;
        const deposit = engine.getFillManaFillAmount("hiddenSpring");
        if (deposit <= 0) {
            return false;
        }
        const cloneCost = engine.getSendManaCloneCost();
        const totalCost = cloneCost + deposit;
        const globalMana = data.progress.mana;
        const avail = engine.getGlobalManaAmount();
        if (avail < totalCost) {
            return false;
        }
        engine.rememberOkamiWorkerSite(okami.assignedBuildingKey);
        engine.interruptOkamiForPathJob();
        if (okami.pathJob) {
            engine.pauseActivePathJobToStorage();
        }
        if (globalMana) {
            globalMana.amount = Math.max(0, avail - totalCost);
        }
        hs.sendManaCloneCargo = { depositAmount: deposit };
        const totalDist = engine.getResortPathTotalDistance();
        okami.assignedBuildingKey = "hiddenSpring";
        okami.pathJob = {
            jobType: "sendManaClone",
            phase: "travelingTo",
            pathProgress: totalDist,
            targetProgress: 0,
            paused: false,
            depositAmount: deposit
        };
        return true;
    },
    getManaCloneTravelUi: function() {
        const okami = engine.getOkami();
        const job = engine.getManaCloneJob();
        const stored = okami.pausedManaCloneJob;
        const totalDist = engine.getResortPathTotalDistance();
        const travelPct = function(pathProgress) {
            const span = Math.max(0.001, totalDist);
            return Math.max(0, Math.min(100, ((totalDist - (pathProgress || 0)) / span) * 100));
        };
        if (job && !job.paused && job.phase === "travelingTo") {
            return { mode: "travel", label: "Traveling", pct: travelPct(job.pathProgress), disabled: true };
        }
        if (job && job.paused) {
            const p = job.pausedPathProgress !== undefined ? job.pausedPathProgress : job.pathProgress;
            return { mode: "paused", label: "Resume", pct: travelPct(p), disabled: false };
        }
        if (stored) {
            return { mode: "paused", label: "Resume", pct: travelPct(stored.pathProgress), disabled: false };
        }
        return null;
    },
    isCollectStoneJob: function(job) {
        return !!(job && job.jobType === "collectStone");
    },
    getCollectStoneJob: function() {
        const job = engine.getOkamiPathJob();
        return engine.isCollectStoneJob(job) ? job : null;
    },
    getPausedCollectStoneJob: function() {
        const okami = engine.getOkami();
        return okami.pausedCollectStoneJob || null;
    },
    getCollectStoneAmount: function() {
        const cfg = resortData.pathConfig || {};
        let amt = cfg.collectStoneAmount !== undefined ? cfg.collectStoneAmount : 4;
        const hs = data.progress.base && data.progress.base.hiddenSpring;
        if (hs && hs.learnTheBestStonesUnlocked) {
            amt += engine.getTotalEarthSpiritLevel();
        }
        const cardAdd = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().okamiStoneAdd || 0) : 0;
        if (cardAdd) {
            amt = Math.ceil(amt * (1 + cardAdd) - 1e-9);
        }
        return engine.applyEchoedShelving(amt);
    },
    getTotalEarthSpiritLevel: function() {
        const spirits = (data.progress.base && data.progress.base.hiddenSpring && data.progress.base.hiddenSpring.spirits) || [];
        let sum = 0;
        for (let i = 0; i < spirits.length; i++) {
            if (spirits[i].kind === "earth") {
                sum += spirits[i].level || 1;
            }
        }
        return sum;
    },
    getCollectStoneDurationMs: function() {
        const cfg = resortData.pathConfig || {};
        return cfg.collectStoneDurationMs !== undefined ? cfg.collectStoneDurationMs : 5000;
    },
    snapshotCollectStoneJob: function(job) {
        if (!engine.isCollectStoneJob(job)) {
            return null;
        }
        const phase = job.paused ? (job.pausedPhase || job.phase) : job.phase;
        const pathProgress = job.paused && job.pausedPathProgress !== undefined
            ? job.pausedPathProgress
            : job.pathProgress;
        const collectRemainMs = job.paused && job.pausedCollectRemainMs !== undefined
            ? job.pausedCollectRemainMs
            : (job.collectRemainMs || 0);
        return {
            jobType: "collectStone",
            phase: phase,
            pathProgress: pathProgress,
            targetProgress: job.targetProgress !== undefined ? job.targetProgress : 0,
            collectRemainMs: collectRemainMs,
            collectTotalMs: job.collectTotalMs || engine.getCollectStoneDurationMs(),
            paused: false
        };
    },
    storePausedCollectStoneJob: function(job) {
        const snap = engine.snapshotCollectStoneJob(job);
        if (!snap) {
            return;
        }
        engine.getOkami().pausedCollectStoneJob = snap;
    },
    beginCollectStoneWait: function(job) {
        engine.refillHiddenSpringManaFromCollectStone();
        const totalMs = engine.getCollectStoneDurationMs();
        job.phase = "collecting";
        job.collectRemainMs = totalMs;
        job.collectTotalMs = totalMs;
        job.pathProgress = job.targetProgress;
    },
    resumeCollectStoneJob: function() {
        engine.interruptOkamiForPathJob();
        const okami = engine.getOkami();
        const stored = okami.pausedCollectStoneJob;
        const active = okami.pathJob;
        if (active && engine.isCollectStoneJob(active) && active.paused) {
            active.paused = false;
            active.phase = active.pausedPhase || active.phase;
            active.pathProgress = active.pausedPathProgress !== undefined ? active.pausedPathProgress : active.pathProgress;
            if (active.pausedCollectRemainMs !== undefined) {
                active.collectRemainMs = active.pausedCollectRemainMs;
            }
            delete active.pausedPhase;
            delete active.pausedPathProgress;
            delete active.pausedCollectRemainMs;
            okami.assignedBuildingKey = "hiddenSpring";
            return true;
        }
        if (!stored) {
            return false;
        }
        if (active) {
            engine.pauseActivePathJobToStorage();
        }
        okami.pathJob = Object.assign({ paused: false }, stored);
        okami.pausedCollectStoneJob = null;
        okami.assignedBuildingKey = "hiddenSpring";
        return true;
    },
    startCollectStone: function() {
        const okami = engine.getOkami();
        if (okami.pausedCollectStoneJob || (okami.pathJob && engine.isCollectStoneJob(okami.pathJob) && okami.pathJob.paused)) {
            return engine.resumeCollectStoneJob();
        }
        if (okami.pathJob && engine.isCollectStoneJob(okami.pathJob) && !okami.pathJob.paused) {
            return false;
        }
        engine.rememberOkamiWorkerSite(okami.assignedBuildingKey);
        engine.interruptOkamiForPathJob();
        if (okami.pathJob) {
            engine.pauseActivePathJobToStorage();
        }
        const totalDist = engine.getResortPathTotalDistance();
        okami.assignedBuildingKey = "hiddenSpring";
        okami.pathJob = {
            jobType: "collectStone",
            phase: "travelingTo",
            pathProgress: totalDist,
            targetProgress: 0,
            paused: false,
            collectRemainMs: 0,
            collectTotalMs: engine.getCollectStoneDurationMs()
        };
        return true;
    },
    refillHiddenSpringManaFromCollectStone: function() {
        if (!engine.isArrangementOfSelfSufficiencyUnlocked() || !engine.isSpiritTrainingSpotBought()) {
            return;
        }
        const hs = data.progress.base && data.progress.base.hiddenSpring;
        if (!hs || !hs.autoRefillMana) {
            return;
        }
        const cap = engine.getBuildingManaCapacity("hiddenSpring");
        const current = hs.mana || 0;
        const deficit = Math.max(0, cap - current);
        if (deficit <= 0 || !data.progress.mana) {
            return;
        }
        const take = Math.min(deficit, data.progress.mana.amount || 0);
        if (take <= 0) {
            return;
        }
        data.progress.mana.amount = Math.max(0, (data.progress.mana.amount || 0) - take);
        hs.mana = Math.min(cap, current + take);
    },
    completeCollectStone: function() {
        const pile = data.progress.base.stonePile;
        const gained = engine.getCollectStoneAmount();
        pile.stone = (pile.stone || 0) + gained;
        if (gained > 0 && typeof view !== "undefined" && view.spawnResourceFloat) {
            view.spawnResourceFloat("baseBuilding_stonePile", "stone", gained, "#949494");
        }
        const okami = engine.getOkami();
        okami.pathJob = null;
        okami.pausedCollectStoneJob = null;
        if (okami.repeatCollectStone && engine.isArrangementOfSelfSufficiencyUnlocked()) {
            okami.assignedBuildingKey = "hiddenSpring";
            engine.startCollectStone();
            return;
        }
        if (okami.assignedBuildingKey === "hiddenSpring") {
            okami.assignedBuildingKey = "";
        }
        engine.restoreOkamiAfterWeaveOrPath();
    },
    getCollectStoneTravelUi: function() {
        const okami = engine.getOkami();
        const job = engine.getCollectStoneJob();
        const stored = okami.pausedCollectStoneJob;
        const totalDist = engine.getResortPathTotalDistance();
        const travelPct = function(pathProgress) {
            const span = Math.max(0.001, totalDist);
            return Math.max(0, Math.min(100, ((totalDist - (pathProgress || 0)) / span) * 100));
        };
        const returnPct = function(pathProgress) {
            const span = Math.max(0.001, totalDist);
            return Math.max(0, Math.min(100, ((pathProgress || 0) / span) * 100));
        };
        const collectPct = function(remain, total) {
            if (!total) {
                return 0;
            }
            return Math.max(0, Math.min(100, (1 - (remain / total)) * 100));
        };
        const pausedUi = function(j) {
            if (j.phase === "collecting") {
                return { mode: "paused", label: "Resume", pct: collectPct(j.collectRemainMs, j.collectTotalMs), disabled: false };
            }
            if (j.phase === "returning") {
                return { mode: "paused", label: "Resume", pct: returnPct(j.pathProgress), disabled: false };
            }
            return { mode: "paused", label: "Resume", pct: travelPct(j.pathProgress), disabled: false };
        };
        if (job && !job.paused) {
            if (job.phase === "travelingTo") {
                return { mode: "travel", label: "Traveling", pct: travelPct(job.pathProgress), disabled: true };
            }
            if (job.phase === "collecting") {
                return { mode: "collect", label: "Collecting", pct: collectPct(job.collectRemainMs, job.collectTotalMs), disabled: true };
            }
            if (job.phase === "returning") {
                return { mode: "return", label: "Returning", pct: returnPct(job.pathProgress), disabled: true };
            }
        }
        if (job && job.paused) {
            const p = job.pausedPathProgress !== undefined ? job.pausedPathProgress : job.pathProgress;
            const remain = job.pausedCollectRemainMs !== undefined ? job.pausedCollectRemainMs : job.collectRemainMs;
            return pausedUi({
                phase: job.pausedPhase || job.phase,
                pathProgress: p,
                collectRemainMs: remain,
                collectTotalMs: job.collectTotalMs
            });
        }
        if (stored) {
            return pausedUi(stored);
        }
        return null;
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
        let mult = 1;
        if (seg && seg.hasLanterns) {
            mult *= 1.2;
        }
        if (seg && seg.hasReinforcedStairs) {
            mult *= 1.2;
        }
        return mult;
    },
    getDropletPathSegmentSpeedMultiplier: function(segmentIndex) {
        const garden = data.progress.base && data.progress.base.garden;
        if (garden && garden.arrangementOfViscosityUnlocked) {
            const cistern = data.progress.base.cistern;
            if (cistern && cistern.waterSpiritsUsePathSpeed === false) {
                return 1;
            }
        }
        const seg = engine.getPathSegmentData(segmentIndex);
        return seg && seg.hasLanterns ? 1.2 : 1;
    },
    getOkamiPathSegmentSpeedMultForIndex: function(segmentIndex) {
        const seg = engine.getPathSegmentData(segmentIndex);
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
        if (seg.hasReinforcedStairs) {
            mult *= 1.2;
        }
        return mult;
    },
    getOkamiPathSegmentSpeedMult: function(pathProgress) {
        return engine.getOkamiPathSegmentSpeedMultForIndex(
            engine.getPathSegmentIndexAtProgress(pathProgress)
        );
    },
    /** Seconds remaining to reach maxProgress from pathProgress, honoring per-segment speed mults. */
    estimatePathTravelSeconds: function(pathProgress, opts) {
        const o = opts || {};
        const baseSpeed = o.baseSpeed;
        const getSegmentMult = o.getSegmentMult;
        if (!baseSpeed || !getSegmentMult) {
            return 0;
        }
        const totalDist = engine.getResortPathTotalDistance();
        const maxP = o.maxProgress !== undefined ? o.maxProgress : totalDist;
        let p = Math.max(0, Math.min(maxP, pathProgress || 0));
        if (p >= maxP - 1e-9) {
            return 0;
        }
        const specs = engine.getResortPathSegmentSpecs();
        let timeSec = 0;
        const maxSteps = specs.length + 2;
        for (let step = 0; step < maxSteps && p < maxP - 1e-9; step++) {
            const segIdx = engine.getPathSegmentIndexAtProgress(p);
            const spec = specs[segIdx];
            if (!spec) {
                break;
            }
            const mult = getSegmentMult(segIdx);
            const speed = baseSpeed * mult;
            if (speed <= 0) {
                return Infinity;
            }
            const end = Math.min(spec.endDist, maxP);
            let toEdge = end - p;
            if (toEdge <= 1e-9) {
                p = Math.min(maxP, spec.endDist + 1e-9);
                continue;
            }
            timeSec += toEdge / speed;
            p = end;
            if (p >= maxP - 1e-9) {
                break;
            }
            p = Math.min(maxP, end + 1e-9);
        }
        return timeSec;
    },
    getPebbleTravelSpeedOpts: function() {
        return {
            baseSpeed: 35,
            getSegmentMult: engine.getPathSegmentSpeedMultiplier,
            maxProgress: engine.getResortPathTotalDistance()
        };
    },
    estimatePebbleTravelSeconds: function(pebble) {
        if (!pebble) {
            return 0;
        }
        return engine.estimatePathTravelSeconds(pebble.pathProgress || 0, engine.getPebbleTravelSpeedOpts());
    },
    estimateDropletTravelSeconds: function(droplet) {
        if (!droplet) {
            return 0;
        }
        return engine.estimatePathTravelSeconds(droplet.pathProgress || 0, engine.getDropletTravelSpeedOpts());
    },
    /** Integrate pathProgress over dtSec, applying per-segment speed mult at each boundary crossed. */
    advancePathProgress: function(pathProgress, dtSec, direction, opts) {
        if (!dtSec || dtSec <= 0) {
            return pathProgress || 0;
        }
        const baseSpeed = opts.baseSpeed;
        const getSegmentMult = opts.getSegmentMult;
        const totalDist = engine.getResortPathTotalDistance();
        const minP = opts.minProgress !== undefined ? opts.minProgress : 0;
        const maxP = opts.maxProgress !== undefined ? opts.maxProgress : totalDist;
        let remaining = dtSec;
        let p = Math.max(minP, Math.min(maxP, pathProgress || 0));
        const specs = engine.getResortPathSegmentSpecs();
        const maxSteps = specs.length + 2;
        for (let step = 0; step < maxSteps && remaining > 0; step++) {
            const segIdx = engine.getPathSegmentIndexAtProgress(p);
            const spec = specs[segIdx];
            if (!spec) {
                break;
            }
            const mult = getSegmentMult(segIdx);
            const speed = baseSpeed * mult;
            if (speed <= 0) {
                break;
            }
            let toEdge = direction > 0 ? (spec.endDist - p) : (p - spec.startDist);
            if (toEdge <= 1e-9) {
                if (direction > 0) {
                    if (p >= maxP - 1e-9) {
                        break;
                    }
                    p = Math.min(maxP, spec.endDist + 1e-9);
                    continue;
                }
                if (p <= minP + 1e-9) {
                    break;
                }
                p = Math.max(minP, spec.startDist - 1e-9);
                continue;
            }
            const timeToEdge = toEdge / speed;
            if (timeToEdge <= remaining) {
                p += direction * toEdge;
                remaining -= timeToEdge;
            } else {
                p += direction * speed * remaining;
                remaining = 0;
            }
            p = Math.max(minP, Math.min(maxP, p));
        }
        return p;
    },
    getPathTravelDirectionEast: function(pathProgress, direction) {
        const eps = 0.5;
        const dir = direction < 0 ? -1 : 1;
        const total = engine.getResortPathTotalDistance();
        const p = Math.max(0, Math.min(total, pathProgress || 0));
        const p0 = engine.getResortPathPosition(p);
        const p1 = engine.getResortPathPosition(Math.max(0, Math.min(total, p + dir * eps)));
        return p1.x >= p0.x;
    },
    clearPausedPathJob: function(segmentIndex) {
        delete data.progress.okami.pausedPathJobs[segmentIndex];
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
        const paused = data.progress.okami.pausedPathJobs;
        paused[snap.segmentIndex] = snap;
    },
    pauseActivePathJobToStorage: function() {
        const okami = engine.getOkami();
        const job = okami.pathJob;
        if (!job) {
            return;
        }
        if (engine.isManaCloneJob(job)) {
            engine.storePausedManaCloneJob(job);
            okami.pathJob = null;
            if (okami.assignedBuildingKey === "hiddenSpring") {
                okami.assignedBuildingKey = "";
            }
            return;
        }
        if (engine.isCollectStoneJob(job)) {
            engine.storePausedCollectStoneJob(job);
            okami.pathJob = null;
            if (okami.assignedBuildingKey === "hiddenSpring") {
                okami.assignedBuildingKey = "";
            }
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
        if (engine.pauseAnyActiveWeaving()) {
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
        engine.interruptOkamiForPathJob();
        const okami = engine.getOkami();
        const paused = data.progress.okami.pausedPathJobs;
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
        if (seg.state === "Clear" && seg.hasLanterns && !seg.hasReinforcedStairs) {
            return "reinforcedStairs";
        }
        return null;
    },
    restoreOkamiAfterWeaveOrPath: function() {
        const okami = engine.getOkami();
        if (okami.assignedBuildingKey) {
            return;
        }
        const resumeIdx = okami.resumePathAfterWeaveSegmentIndex;
        if (resumeIdx !== undefined && resumeIdx !== null) {
            okami.resumePathAfterWeaveSegmentIndex = null;
            if (engine.resumePathJobForSegment(resumeIdx)) {
                return;
            }
        }
        const garden = data.progress.base.garden;
        const site = okami.lastAssignedBuildingKey;
        if (!engine.isOkamiWorkerSite(site)) {
            return;
        }
        if (garden.arrangementOfRemembranceUnlocked) {
            okami.assignedBuildingKey = site;
            engine.syncOkamiWorkerSite(site);
            if (site === "hiddenSpring" && okami.repeatCollectStone && engine.isArrangementOfSelfSufficiencyUnlocked()) {
                engine.startCollectStone();
            }
            return;
        }
        if (site === "foxDen" && engine.foxDenPathAutoShouldReturnOkami()) {
            okami.assignedBuildingKey = "foxDen";
            engine.syncOkamiWorkerSite("foxDen");
        }
    },
    getPathUpgradeJobCost: function(jobType) {
        const up = resortData.buildings.path.upgrades[jobType];
        if (!up) {
            return {};
        }
        return typeof up.getCost === "function" ? up.getCost() : (up.cost || {});
    },
    getMissingCostWaitText: function(cost) {
        const c = cost || {};
        const base = data.progress.base;
        const missing = [];
        if ((c.wood || 0) > ((base.bambooForest && base.bambooForest.wood) || 0)) {
            missing.push("wood");
        }
        if ((c.starBeads || 0) > (data.progress.starBeads || 0)) {
            missing.push("star beads");
        }
        if ((c.stone || 0) > engine.getTotalStone()) {
            missing.push("stone");
        }
        if ((c.bars || 0) > ((base.atelier && base.atelier.bars) || 0)) {
            missing.push("bars");
        }
        if ((c.ore || 0) > ((base.atelier && base.atelier.ore) || 0)) {
            missing.push("ore");
        }
        if ((c.coins || 0) > (data.progress.coins || 0)) {
            missing.push("coins");
        }
        if (missing.length <= 0) {
            return "";
        }
        if (missing.length === 1) {
            return "Waiting for " + missing[0];
        }
        return "Waiting for " + missing.slice(0, -1).join(", ") + " and " + missing[missing.length - 1];
    },
    listFoxDenAutoPathJobTypes: function() {
        const rh = data.progress.base.foxDen;
        const garden = data.progress.base.garden;
        const jobs = [];
        if (garden.arrangementOfPathMakingUnlocked && rh.autoClearPathRocks
            && !engine.isMapElementRevealed("hiddenSpring")) {
            jobs.push("removeRocks");
        }
        if (garden.arrangementOfRailingSafetyUnlocked && rh.autoAddPathRailings
            && !engine.allPathSegmentsHaveUpgrade("railing")) {
            jobs.push("addRailing");
        }
        if (garden.arrangementOfStepBuildingUnlocked && rh.autoAddPathStairs
            && !engine.allPathSegmentsHaveUpgrade("stairs")) {
            jobs.push("addStairs");
        }
        if (garden.arrangementOfLanternPlacingUnlocked && rh.autoAddPathLanterns
            && !engine.allPathSegmentsHaveUpgrade("lanterns")) {
            jobs.push("addLanterns");
        }
        return jobs;
    },
    foxDenPathAutoShouldReturnOkami: function() {
        const jobs = engine.listFoxDenAutoPathJobTypes();
        for (let i = 0; i < jobs.length; i++) {
            if (engine.getNextPathSegmentNeedingJob(jobs[i]) !== null) {
                return true;
            }
        }
        return false;
    },
    getFoxDenAutoPathWaitInfo: function() {
        const jobs = engine.listFoxDenAutoPathJobTypes();
        for (let i = 0; i < jobs.length; i++) {
            const jobType = jobs[i];
            const idx = engine.getNextPathSegmentNeedingJob(jobType);
            if (idx === null) {
                continue;
            }
            const paused = data.progress.okami.pausedPathJobs;
            if (paused && paused[idx]) {
                return null;
            }
            if (jobType === "removeRocks") {
                return null;
            }
            const cost = engine.getPathUpgradeJobCost(jobType);
            if (resortData.canAffordCost(cost)) {
                return null;
            }
            return {
                jobType: jobType,
                text: engine.getMissingCostWaitText(cost)
            };
        }
        return null;
    },
    tryStartFoxDenOkamiAutoPathJob: function(jobType) {
        const idx = engine.getNextPathSegmentNeedingJob(jobType);
        if (idx === null) {
            return false;
        }
        const paused = data.progress.okami.pausedPathJobs;
        if (paused && paused[idx]) {
            return engine.resumePathJobForSegment(idx);
        }
        if (jobType !== "removeRocks") {
            const cost = engine.getPathUpgradeJobCost(jobType);
            if (!resortData.canAffordCost(cost)) {
                return false;
            }
            resortData.deductCost(cost);
        }
        return engine.startPathSegmentJob(idx, jobType);
    },
    tryFoxDenOkamiAutoPathJobs: function() {
        const rh = data.progress.base.foxDen;
        const wf = engine.getFoxDenFreeWorkforce(rh);
        if (!wf.okamiFree) {
            return false;
        }
        const jobs = engine.listFoxDenAutoPathJobTypes();
        for (let i = 0; i < jobs.length; i++) {
            if (engine.tryStartFoxDenOkamiAutoPathJob(jobs[i])) {
                return true;
            }
            const idx = engine.getNextPathSegmentNeedingJob(jobs[i]);
            if (idx !== null) {
                return false;
            }
        }
        return false;
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
        if (jobType === "reinforcedStairs") {
            return seg.state === "Clear" && seg.hasLanterns && !seg.hasReinforcedStairs;
        }
        return false;
    },
    startPathSegmentJob: function(segmentIndex, jobType) {
        if (!engine.canStartPathSegmentJob(segmentIndex, jobType)) {
            return false;
        }
        const okami = engine.getOkami();
        const paused = data.progress.okami.pausedPathJobs;
        if (paused[segmentIndex]) {
            engine.interruptOkamiForPathJob();
            return engine.resumePathJobForSegment(segmentIndex);
        }
        const job = okami.pathJob;
        if (job && job.segmentIndex === segmentIndex && !job.paused) {
            return false;
        }
        engine.rememberOkamiWorkerSite(okami.assignedBuildingKey);
        engine.interruptOkamiForPathJob();
        // Path interrupting path: abandon the previous path upgrade (do not chain back to it).
        okami.resumePathAfterWeaveSegmentIndex = null;
        if (job) {
            if (engine.isPathSegmentUpgradeJob(job)) {
                const oldIdx = job.segmentIndex;
                okami.pathJob = null;
                if (engine.parsePathAssignmentKey(okami.assignedBuildingKey) === oldIdx) {
                    okami.assignedBuildingKey = "";
                }
                engine.clearPausedPathJob(oldIdx);
            } else {
                engine.pauseActivePathJobToStorage();
            }
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
        const storeAmt = engine.applyEchoedShelving((resortData.pathConfig && resortData.pathConfig.storeRockAmount) || 5);
        if (base && base.stonePile) {
            base.stonePile.stone = (base.stonePile.stone || 0) + storeAmt;
            if (storeAmt > 0 && typeof view !== "undefined" && view.spawnResourceFloat) {
                view.spawnResourceFloat("baseBuilding_stonePile", "stone", storeAmt, "#949494");
            }
        }
        const okami = engine.getOkami();
        okami.pathJob = null;
        engine.clearPausedPathJob(segmentIndex);
        if (engine.parsePathAssignmentKey(okami.assignedBuildingKey) === segmentIndex) {
            okami.assignedBuildingKey = "";
        }
        if (engine.parsePathAssignmentKey(okami.lastAssignedBuildingKey) === segmentIndex) {
            okami.lastAssignedBuildingKey = "";
        }
        engine.restoreOkamiAfterWeaveOrPath();
        engine.checkMapRevealTriggers();
        engine.syncResortPathDom();
        if (typeof view !== "undefined" && view.updatePathSegmentHighlight) {
            view.updatePathSegmentHighlight();
        }
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
            } else if (jobType === "reinforcedStairs") {
                seg.hasReinforcedStairs = true;
            }
        }
        const okami = engine.getOkami();
        okami.pathJob = null;
        engine.clearPausedPathJob(segmentIndex);
        if (engine.parsePathAssignmentKey(okami.assignedBuildingKey) === segmentIndex) {
            okami.assignedBuildingKey = "";
        }
        if (engine.parsePathAssignmentKey(okami.lastAssignedBuildingKey) === segmentIndex) {
            okami.lastAssignedBuildingKey = "";
        }
        engine.restoreOkamiAfterWeaveOrPath();
        engine.syncResortPathDom();
    },
    completePathAddRailing: function(segmentIndex) {
        engine.completePathReturnJob(segmentIndex, "addRailing");
    },
    isMapElementRevealed: function(key) {
        const revealed = data.progress.base.mapRevealed;
        if (key === "spiritSlots") {
            return !!revealed.spiritSlots || !!revealed.hiddenSpring;
        }
        return !!revealed[key];
    },
    checkMapRevealTriggers: function() {
        const revealed = data.progress.base.mapRevealed;
        const segs = data.progress.base.pathSegments;
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
    getBuildingJobKey: function(unlockKey) {
        return "building:" + unlockKey;
    },
    parseBuildingJobKey: function(jobKey) {
        if (!jobKey || jobKey.indexOf("building:") !== 0) {
            return null;
        }
        return jobKey.slice("building:".length);
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
    enqueueFoxDenJob: function(jobKey) {
        const queue = data.progress.base.foxDen.jobQueue;
        if (queue.indexOf(jobKey) < 0) {
            queue.push(jobKey);
        }
    },
    removeFoxDenJob: function(jobKey) {
        const queue = data.progress.base.foxDen.jobQueue;
        const qi = queue.indexOf(jobKey);
        if (qi >= 0) {
            queue.splice(qi, 1);
        }
    },
    moveFoxDenJobToFront: function(jobKey) {
        const queue = data.progress.base.foxDen.jobQueue;
        const qi = queue.indexOf(jobKey);
        if (qi >= 0) {
            queue.splice(qi, 1);
        }
        queue.unshift(jobKey);
    },
    getFoxDenQueueMax: function() {
        const w = data.progress.base && data.progress.base.atelier;
        const level = w.organizeOrdersBought || 0;
        const cardAdd = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().foxDenQueueFlat || 0) : 0;
        return 2 + level + cardAdd;
    },
    getFoxDenQueuedJobCount: function() {
        const rh = data.progress.base.foxDen;
        let count = 0;
        for (let qi = 0; qi < rh.jobQueue.length; qi++) {
            const jobKey = rh.jobQueue[qi];
            const unlockKey = engine.parseBuildingJobKey(jobKey);
            if (unlockKey) {
                const site = rh.constructionSites[unlockKey];
                if (site && site.status === "building" && !site.paused) {
                    count++;
                }
                continue;
            }
            const job = rh.upgradeGatherJobs[jobKey];
            if (job && !job.paused && job.status === "gathering") {
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
        const rh = data.progress.base.foxDen;
        const next = [];
        for (let i = 0; i < rh.constructionCarriers.length; i++) {
            const c = rh.constructionCarriers[i];
            const cKey = c.jobKey || (c.unlockKey ? engine.getBuildingJobKey(c.unlockKey) : "");
            if (cKey === jobKey) {
                engine.refundConstructionResource(c.resourceType, c.amount || 0, c.stoneTaken);
            } else {
                next.push(c);
            }
        }
        rh.constructionCarriers = next;
    },
    pauseBuildingGather: function(unlockKey) {
        const rh = data.progress.base.foxDen;
        const site = rh.constructionSites[unlockKey];
        if (!site || site.status !== "building" || site.paused) {
            return false;
        }
        site.paused = true;
        engine.cancelCarriersForJob(engine.getBuildingJobKey(unlockKey));
        return true;
    },
    resumeBuildingGather: function(unlockKey) {
        const rh = data.progress.base.foxDen;
        const site = rh.constructionSites[unlockKey];
        if (!site || site.status !== "building" || !site.paused) {
            return false;
        }
        if (!engine.canResumeFoxDenJob()) {
            return false;
        }
        site.paused = false;
        engine.moveFoxDenJobToFront(engine.getBuildingJobKey(unlockKey));
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
        const keys = resortData.gatherResourceKeys;
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            if (((site.delivered && site.delivered[k]) || 0) < (site.required[k] || 0)) {
                return false;
            }
        }
        return true;
    },
    checkUpgradeGatherJobComplete: function(jobKey) {
        const rh = data.progress.base.foxDen;
        const job = rh.upgradeGatherJobs[jobKey];
        if (!job || job.status !== "gathering") {
            return;
        }
        if (!engine.isUpgradeGatherSiteComplete(job)) {
            return;
        }
        job.status = "ready";
        engine.removeFoxDenJob(jobKey);
        engine.tryAutoWeaveOnGatherReady(jobKey);
    },
    isOkamiBusyWithPathWork: function() {
        const okami = engine.getOkami();
        const job = okami.pathJob;
        if (job && !job.paused) {
            return true;
        }
        if (engine.parsePathAssignmentKey(okami.assignedBuildingKey || "") !== null) {
            return true;
        }
        return false;
    },
    isOkamiIdleOrAtBuilding: function() {
        if (engine.isOkamiWeaving()) {
            return false;
        }
        if (engine.isOkamiBusyWithPathWork()) {
            return false;
        }
        return true;
    },
    isOkamiRepeatGatheringStone: function() {
        const okami = engine.getOkami();
        const job = okami.pathJob;
        return !!(okami.repeatCollectStone
            && okami.assignedBuildingKey === "hiddenSpring"
            && engine.isCollectStoneJob(job)
            && !job.paused);
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
        if (!engine.isOkamiIdleOrAtBuilding()) {
            return;
        }
        engine.startUpgradeWeave(parsed.scopeKey, parsed.upgradeKey);
    },
    updateArrangementOfReview: function(tickMs) {
        const rh = data.progress.base.foxDen;
        rh._reviewWeaveAccumMs = (rh._reviewWeaveAccumMs || 0) + tickMs;
        if (rh._reviewWeaveAccumMs < 5000) {
            return;
        }
        rh._reviewWeaveAccumMs = 0;
        const garden = data.progress.base && data.progress.base.garden;
        if (!garden || !garden.arrangementOfReviewUnlocked || !garden.autoWeaveCheapestReady) {
            return;
        }
        if (!engine.isOkamiIdleOrAtBuilding() && !engine.isOkamiRepeatGatheringStone()) {
            return;
        }
        const jobKeys = Object.keys(rh.upgradeGatherJobs);
        let best = null;
        let bestSec = Infinity;
        for (let ui = 0; ui < jobKeys.length; ui++) {
            const jobKey = jobKeys[ui];
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
        if (garden.autoWeaveIncludePausedWeaves) {
            const pausedEntries = engine.getAllPausedWeavingEntries();
            for (let pi = 0; pi < pausedEntries.length; pi++) {
                const entry = pausedEntries[pi];
                const sec = (entry.remainMs || 0) / 1000;
                if (sec < bestSec) {
                    bestSec = sec;
                    best = { scopeKey: entry.scopeKey, upgradeKey: entry.upgradeKey, pausedWeave: true };
                }
            }
        }
        if (best) {
            if (best.pausedWeave) {
                engine.resumeWeaving(best.scopeKey, best.upgradeKey);
            } else {
                engine.startUpgradeWeave(best.scopeKey, best.upgradeKey);
            }
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
        const rh = data.progress.base.foxDen;
        const jobKey = engine.getUpgradeGatherJobKey(scopeKey, upgradeKey);
        if (rh.upgradeGatherJobs[jobKey]) {
            return false;
        }
        const cost = resortData.resolveCost(up, scopeKey);
        const split = resortData.splitGatherWeaveCost(cost);
        const weaveOnly = resortData.isWeaveOnlyCost(cost);
        if (!weaveOnly && !engine.canEnqueueFoxDenJob()) {
            return false;
        }
        const weaveCost = Object.assign({}, split.weave);
        const hasWeaveCost = resortData.hasWeaveCost(weaveCost);
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
            delivered: resortData.emptyGatherDelivered(),
            weaveCost: { coins: 0, starBeads: 0, mana: 0, credit: 0, divinity: 0, essence: 0 },
            weaveCostPaid: hasWeaveCost,
            paused: false,
            status: "gathering"
        };
        if (engine.isUpgradeGatherSiteComplete(job)) {
            job.status = "ready";
        }
        rh.upgradeGatherJobs[jobKey] = job;
        if (job.status === "gathering") {
            engine.applyInstantSameBuildingGatherForJob(jobKey);
        }
        if (job.status === "gathering") {
            engine.enqueueFoxDenJob(jobKey);
        }
        if (job.status === "ready") {
            engine.tryAutoWeaveOnGatherReady(jobKey);
        }
        return true;
    },
    tryAutobuyUpgrades: function() {
        const rh = data.progress.base && data.progress.base.foxDen;
        if (!rh || !rh.upgradeGatherJobs) {
            return;
        }
        const buildings = resortData.buildings;
        if (!buildings) {
            return;
        }
        const scopeKeys = Object.keys(buildings);
        const garden = data.progress.base && data.progress.base.garden;
        const reserveCloneMana = !!(garden && garden.reserveCloneManaForAutobuy);
        let reservedMana = 0;
        if (reserveCloneMana && typeof bonfire !== "undefined" && bonfire.getCreateClonePlan) {
            reservedMana = bonfire.getCreateClonePlan().manaCost || 0;
        }
        let weaverTaken = !!(engine.getWeavingState().active);
        for (let si = 0; si < scopeKeys.length; si++) {
            const scopeKey = scopeKeys[si];
            const cfg = buildings[scopeKey];
            if (!cfg || !cfg.upgrades || !cfg.upgradesOrder) {
                continue;
            }
            let orderKeys = cfg.upgradesOrder;
            if (reserveCloneMana) {
                orderKeys = orderKeys.slice();
                const manaSlots = [];
                for (let oi = 0; oi < orderKeys.length; oi++) {
                    const candidate = cfg.upgrades[orderKeys[oi]];
                    if (!candidate || !candidate.autobuy) {
                        continue;
                    }
                    const candidateCost = resortData.resolveCost(candidate);
                    if (!candidateCost || !(candidateCost.mana > 0)) {
                        continue;
                    }
                    manaSlots.push({ index: oi, key: orderKeys[oi], mana: candidateCost.mana });
                }
                if (manaSlots.length > 1) {
                    const sortedSlots = manaSlots.slice().sort(function(a, b) {
                        if (a.mana !== b.mana) {
                            return a.mana - b.mana;
                        }
                        return a.index - b.index;
                    });
                    for (let s = 0; s < manaSlots.length; s++) {
                        orderKeys[manaSlots[s].index] = sortedSlots[s].key;
                    }
                }
            }
            for (let ui = 0; ui < orderKeys.length; ui++) {
                const upgradeKey = orderKeys[ui];
                const up = cfg.upgrades[upgradeKey];
                if (!up || !up.autobuy) {
                    continue;
                }
                if (typeof up.autobuyVisible === "function" && !up.autobuyVisible()) {
                    continue;
                }
                if (typeof up.isAutobuyChecked !== "function" || !up.isAutobuyChecked()) {
                    continue;
                }
                const active = engine.getWeavingState().active;
                if (active && active.scopeKey === scopeKey && active.upgradeKey === upgradeKey) {
                    continue;
                }
                if (engine.getPausedWeavingEntry(scopeKey, upgradeKey)) {
                    continue;
                }
                let job = engine.getUpgradeGatherJob(scopeKey, upgradeKey);
                if (!job) {
                    if (up.canBuy && !up.canBuy()) {
                        continue;
                    }
                    const cost = resortData.resolveCost(up, scopeKey);
                    if (reserveCloneMana && cost && (cost.mana || 0) > 0) {
                        const manaHave = (data.progress.mana && data.progress.mana.amount) || 0;
                        if ((cost.mana || 0) > Math.max(0, manaHave - reservedMana)) {
                            continue;
                        }
                    }
                    if (!resortData.canAffordCost(cost)) {
                        continue;
                    }
                    if (!engine.enqueueUpgradeGather(scopeKey, upgradeKey)) {
                        continue;
                    }
                    job = engine.getUpgradeGatherJob(scopeKey, upgradeKey);
                    if (engine.getWeavingState().active) {
                        weaverTaken = true;
                    }
                }
                if (job && job.status === "ready" && !weaverTaken) {
                    if (engine.startUpgradeWeave(scopeKey, upgradeKey)) {
                        weaverTaken = true;
                    }
                }
            }
        }
    },
    pauseUpgradeGather: function(scopeKey, upgradeKey) {
        const rh = data.progress.base.foxDen;
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
        const rh = data.progress.base.foxDen;
        const jobKey = engine.getUpgradeGatherJobKey(scopeKey, upgradeKey);
        const job = rh.upgradeGatherJobs[jobKey];
        if (!job || job.status !== "gathering" || !job.paused) {
            return false;
        }
        if (!engine.canResumeFoxDenJob()) {
            return false;
        }
        job.paused = false;
        engine.moveFoxDenJobToFront(jobKey);
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
        const rh = data.progress.base.foxDen;
        return rh.upgradeGatherJobs[engine.getUpgradeGatherJobKey(scopeKey, upgradeKey)] || null;
    },
    removeUpgradeGatherJob: function(scopeKey, upgradeKey) {
        const rh = data.progress.base.foxDen;
        const jobKey = engine.getUpgradeGatherJobKey(scopeKey, upgradeKey);
        delete rh.upgradeGatherJobs[jobKey];
        engine.removeFoxDenJob(jobKey);
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
            if (resortData.hasWeaveCost(weaveCost)) {
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
        if (resortData.isUpgradeSoldOut(up)) {
            return { label: up.soldOutButtonLabel || "Bought", disabled: true, mode: "soldOut" };
        }
        /* lockedLabel shows an unmet requirement on the button instead of hiding the row. */
        if (typeof up.lockedLabel === "function") {
            const lockedText = up.lockedLabel();
            if (lockedText) {
                return { label: lockedText, disabled: true, mode: "locked" };
            }
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
        if (up.directWeave) {
            if (up.canBuy && !up.canBuy()) {
                return { label: "Choose Research", disabled: true, mode: "idle" };
            }
            return {
                label: `Weave`,
                disabled: false,
                mode: "directWeaveReady"
            };
        }
        const job = engine.getUpgradeGatherJob(scopeKey, upgradeKey);
        if (job) {
            if (job.status === "ready") {
                return { label: "Ready for Weave", disabled: false, mode: "ready" };
            }
            const label = resortData.collectedProgressLabel(job.delivered, job.required);
            const queueBlocked = !!(job.paused && !engine.canResumeFoxDenJob());
            return {
                label: job.paused ? `Paused · ${label}` : label,
                disabled: queueBlocked,
                queueBlocked: queueBlocked,
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
        const weaveOnly = resortData.isWeaveOnlyCost(cost);
        const queueBlocked = !weaveOnly && !engine.canEnqueueFoxDenJob();
        return {
            label: resortData.gatherLabelFromCost(costGetter),
            disabled: !affordWeave || queueBlocked,
            queueBlocked: queueBlocked,
            mode: "idle"
        };
    },
    isBuyableUpgradeBuildingOpen: function(buildingKey) {
        if (buildingKey === "path") {
            return true;
        }
        const bdef = resortData.buildings[buildingKey];
        if (!bdef) {
            return false;
        }
        if (buildingKey === "hiddenSpring") {
            return engine.isMapElementRevealed("hiddenSpring");
        }
        if (bdef.constructionCost) {
            const rh = data.progress.base && data.progress.base.foxDen;
            return !!(rh && rh.unlocks && rh.unlocks[buildingKey]);
        }
        return true;
    },
    listBuyableUpgrades: function() {
        const out = [];
        const buildings = resortData.buildings || {};
        const keys = Object.keys(buildings);
        for (let i = 0; i < keys.length; i++) {
            const buildingKey = keys[i];
            const bcfg = buildings[buildingKey];
            if (!bcfg || !bcfg.upgrades || !engine.isBuyableUpgradeBuildingOpen(buildingKey)) {
                continue;
            }
            const order = bcfg.upgradesOrder || Object.keys(bcfg.upgrades);
            for (let ui = 0; ui < order.length; ui++) {
                const upgradeKey = order[ui];
                const up = bcfg.upgrades[upgradeKey];
                if (!up || up.directWeave || upgradeKey === "fillMana") {
                    continue;
                }
                if (!resortData.isUpgradeRowVisible(up)) {
                    continue;
                }
                if (resortData.isUpgradeSoldOut(up)) {
                    continue;
                }
                if (typeof up.canBuy === "function" && !up.canBuy()) {
                    continue;
                }
                const cost = typeof up.getCost === "function" ? up.getCost() : resortData.resolveCost(up);
                const parts = resortData.costToParts(cost);
                if (!parts.length) {
                    continue;
                }
                if (!resortData.canAffordCost(cost)) {
                    continue;
                }
                const purchaseUi = engine.getUpgradePurchaseUi(buildingKey, upgradeKey);
                if (!purchaseUi || purchaseUi.mode !== "idle" || purchaseUi.disabled) {
                    continue;
                }
                out.push({
                    name: up.name || upgradeKey,
                    costText: parts.join(", "),
                    building: bcfg.label || buildingKey
                });
            }
        }
        out.sort(function(a, b) {
            const buildingCmp = (a.building || "").localeCompare(b.building || "");
            if (buildingCmp !== 0) {
                return buildingCmp;
            }
            return (a.name || "").localeCompare(b.name || "");
        });
        return out;
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
    getFoxDenConstructionSite: function(unlockKey) {
        const rh = data.progress.base.foxDen;
        return rh.constructionSites[unlockKey] || null;
    },
    isFoxDenConstructionActive: function(unlockKey) {
        const site = engine.getFoxDenConstructionSite(unlockKey);
        return !!(site && site.status === "building");
    },
    planFoxDenConstruction: function(unlockKey) {
        const rh = data.progress.base.foxDen;
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
        const split = resortData.splitGatherWeaveCost(cost);
        const weaveCost = split.weave;
        const hasWeaveCost = resortData.hasWeaveCost(weaveCost);
        if (hasWeaveCost && !resortData.canAffordCost(weaveCost)) {
            return false;
        }
        if (hasWeaveCost) {
            resortData.deductCost(weaveCost);
        }
        rh.constructionSites[unlockKey] = {
            status: "building",
            paused: false,
            required: Object.assign({}, split.gather),
            delivered: resortData.emptyGatherDelivered(),
            weaveCostPaid: hasWeaveCost
        };
        engine.enqueueFoxDenJob(engine.getBuildingJobKey(unlockKey));
        return true;
    },
    completeFoxDenConstruction: function(unlockKey) {
        const rh = data.progress.base.foxDen;
        rh.unlocks[unlockKey] = true;
        const site = rh.constructionSites[unlockKey];
        if (site) {
            site.status = "complete";
        }
        engine.removeFoxDenJob(engine.getBuildingJobKey(unlockKey));
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
    },
    isDirtRoadsUnlocked: function() {
        const a = data.progress.base && data.progress.base.atelier;
        return !!(a && a.formDirtRoadsUnlocked);
    },
    getDirtRoads: function() {
        const base = data.progress.base;
        if (!base) {
            return [];
        }
        if (!base.dirtRoads) {
            base.dirtRoads = [];
        }
        return base.dirtRoads;
    },
    getDirtRoadKey: function(fromKey, toKey) {
        const a = fromKey || "";
        const b = toKey || "";
        return a < b ? `${a}|${b}` : `${b}|${a}`;
    },
    getDirtRoadSortedKeys: function(fromKey, toKey) {
        const a = fromKey || "";
        const b = toKey || "";
        if (a < b) {
            return { fromKey: a, toKey: b };
        }
        return { fromKey: b, toKey: a };
    },
    getDirtRoad: function(fromKey, toKey) {
        if (!fromKey || !toKey) {
            return null;
        }
        const key = engine.getDirtRoadKey(fromKey, toKey);
        const roads = engine.getDirtRoads();
        for (let i = 0; i < roads.length; i++) {
            const r = roads[i];
            if (engine.getDirtRoadKey(r.fromKey, r.toKey) === key) {
                return r;
            }
        }
        return null;
    },
    ensureDirtRoad: function(fromKey, toKey) {
        if (!engine.isDirtRoadsUnlocked() || !fromKey || !toKey || fromKey === toKey) {
            return null;
        }
        let road = engine.getDirtRoad(fromKey, toKey);
        if (road) {
            return road;
        }
        const sorted = engine.getDirtRoadSortedKeys(fromKey, toKey);
        road = {
            fromKey: sorted.fromKey,
            toKey: sorted.toKey,
            progress: 0,
            decayAccMs: 0
        };
        engine.getDirtRoads().push(road);
        return road;
    },
    getDirtRoadMaxProgress: function() {
        const atelier = data.progress.base && data.progress.base.atelier;
        const bought = (atelier && atelier.improveDirtRoadsBought) || 0;
        const cardAdd = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().dirtRoadMaxProgressFlat || 0) : 0;
        return 100 + 20 * bought + cardAdd;
    },
    getDirtRoadProgressPerDelivery: function() {
        const atelier = data.progress.base && data.progress.base.atelier;
        return (atelier && atelier.sprinkleOreOnRoadsBought) ? 2 : 1;
    },
    getDirtRoadSpeedMult: function(fromKey, toKey) {
        const road = engine.getDirtRoad(fromKey, toKey);
        const cap = engine.getDirtRoadMaxProgress();
        const progress = road ? Math.max(0, Math.min(cap, road.progress || 0)) : 0;
        return 1 + 0.005 * progress;
    },
    getRoadProgressSpeedMult: function(progress) {
        const cap = engine.getDirtRoadMaxProgress();
        const p = Math.max(0, Math.min(cap, progress || 0));
        return 1 + 0.005 * p;
    },
    getRoadProgressOpacity: function(progress) {
        const cap = engine.getDirtRoadMaxProgress();
        const p = Math.max(0, Math.min(cap, progress || 0));
        if (p < 1) {
            return 0;
        }
        return 0.2 + 0.8 * ((p - 1) / Math.max(1, cap - 1));
    },
    getRoadProgressTipHtml: function(progress, decayAccMs) {
        const cap = engine.getDirtRoadMaxProgress();
        const p = Math.max(0, Math.min(cap, progress || 0));
        if (p <= 0) {
            return "";
        }
        const remainMs = Math.max(0, 30000 - (decayAccMs || 0));
        return `${p} / ${cap}<br>+${round1(p * 0.5)}% speed<br>${Math.ceil(remainMs / 1000)}s to next decrease`;
    },
    getPathSegmentRoadTipHtml: function(segmentIndex) {
        const seg = engine.getPathSegmentData(segmentIndex);
        if (!seg || (seg.roadProgress || 0) <= 0) {
            return "";
        }
        return engine.getRoadProgressTipHtml(seg.roadProgress, seg.roadDecayAccMs);
    },
    getPathSegmentRoadSpeedMult: function(segmentIndex) {
        if (!engine.isDirtRoadsUnlocked()) {
            return 1;
        }
        const seg = engine.getPathSegmentData(segmentIndex);
        return engine.getRoadProgressSpeedMult(seg && seg.roadProgress);
    },
    addPathSegmentRoadProgress: function(segmentIndex) {
        if (!engine.isDirtRoadsUnlocked()) {
            return;
        }
        const seg = engine.getPathSegmentData(segmentIndex);
        if (!seg) {
            return;
        }
        const prev = seg.roadProgress || 0;
        seg.roadProgress = Math.min(engine.getDirtRoadMaxProgress(), prev + engine.getDirtRoadProgressPerDelivery());
        if (prev <= 0 && seg.roadProgress > 0) {
            seg.roadDecayAccMs = 0;
        }
    },
    creditPathSegmentsCrossed: function(before, after) {
        if (!engine.isDirtRoadsUnlocked()) {
            return;
        }
        const specs = engine.getResortPathSegmentSpecs();
        for (let i = 0; i < specs.length; i++) {
            const start = specs[i].startDist;
            if (start < before - 1e-6 && start >= after - 1e-6) {
                engine.addPathSegmentRoadProgress(i);
            }
        }
    },
    decayRoadRecord: function(record, progressKey, decayKey, tickMs) {
        if ((record[progressKey] || 0) <= 0) {
            record[progressKey] = 0;
            record[decayKey] = 0;
            return;
        }
        record[decayKey] = (record[decayKey] || 0) + (tickMs || 0);
        while ((record[progressKey] || 0) > 0 && record[decayKey] >= 30000) {
            record[decayKey] -= 30000;
            record[progressKey] = (record[progressKey] || 0) - 1;
        }
        if ((record[progressKey] || 0) <= 0) {
            record[progressKey] = 0;
            record[decayKey] = 0;
        }
    },
    getCarrierRoadSpeedMult: function(carrier) {
        return (carrier && carrier.roadSpeedMult) || 1;
    },
    applyDirtRoadOnSpawn: function(carrier, fromKey, toKey) {
        if (!carrier) {
            return;
        }
        carrier.fromKey = fromKey;
        carrier.toKey = toKey;
        if (!engine.isDirtRoadsUnlocked() || !fromKey || !toKey) {
            carrier.roadSpeedMult = 1;
            return;
        }
        engine.ensureDirtRoad(fromKey, toKey);
        carrier.roadSpeedMult = engine.getDirtRoadSpeedMult(fromKey, toKey);
    },
    addDirtRoadProgress: function(fromKey, toKey) {
        if (!engine.isDirtRoadsUnlocked() || !fromKey || !toKey) {
            return;
        }
        const road = engine.ensureDirtRoad(fromKey, toKey);
        if (!road) {
            return;
        }
        const prev = road.progress || 0;
        road.progress = Math.min(engine.getDirtRoadMaxProgress(), prev + engine.getDirtRoadProgressPerDelivery());
        if (prev <= 0 && road.progress > 0) {
            road.decayAccMs = 0;
        }
    },
    updateDirtRoads: function(tickMs) {
        if (!engine.isDirtRoadsUnlocked()) {
            return;
        }
        const roads = engine.getDirtRoads();
        const step = tickMs || 0;
        for (let i = 0; i < roads.length; i++) {
            engine.decayRoadRecord(roads[i], "progress", "decayAccMs", step);
        }
        const segs = data.progress.base && data.progress.base.pathSegments;
        if (!segs) {
            return;
        }
        for (let si = 0; si < segs.length; si++) {
            if (segs[si]) {
                engine.decayRoadRecord(segs[si], "roadProgress", "roadDecayAccMs", step);
            }
        }
    },
    getConstructionSourceBuildingKey: function(resourceType) {
        if (resourceType === "wood" || resourceType === "hardwood") {
            return "bambooForest";
        }
        if (resourceType === "stone") {
            return "stonePile";
        }
        if (resourceType === "bars" || resourceType === "ore") {
            return "atelier";
        }
        if (resourceType === "mana") {
            return "mage_tower";
        }
        return "foxDen";
    },
    getOkamiPathTravelBaseSpeed: function(holdingMaterials) {
        const X = engine.getOkamiTravelSpeed();
        return holdingMaterials ? X * 0.5 : X;
    },
    getOkamiPathTravelSpeed: function(holdingMaterials, pathProgress) {
        let speed = engine.getOkamiPathTravelBaseSpeed(holdingMaterials);
        if (pathProgress !== undefined && pathProgress !== null) {
            speed *= engine.getOkamiPathSegmentSpeedMult(pathProgress);
        }
        return speed;
    },
    getConstructionResourceInFlight: function(jobKey, resourceType) {
        const rh = data.progress.base.foxDen;
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
        const rh = data.progress.base.foxDen;
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
                    engine.refundConstructionResource(c.resourceType, c.amount || 0, c.stoneTaken);
                }
            } else if (removeIds[c.id]) {
                engine.refundConstructionResource(c.resourceType, c.amount || 0, c.stoneTaken);
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
        if (resourceType === "hardwood") {
            return (base.bambooForest && base.bambooForest.hardwood) || 0;
        }
        if (resourceType === "stone") {
            const pile = base.stonePile;
            if (!pile) {
                return 0;
            }
            return (pile.dupedStone || 0)
                + (engine.isStoneCarryUnduplicatedAllowed() ? (pile.stone || 0) : 0);
        }
        if (resourceType === "bars") {
            return (base.atelier && base.atelier.bars) || 0;
        }
        if (resourceType === "ore") {
            return (base.atelier && base.atelier.ore) || 0;
        }
        if (resourceType === "mana") {
            return (data.progress.mana && data.progress.mana.amount) || 0;
        }
        return 0;
    },
    deductConstructionResource: function(resourceType, amount) {
        const base = data.progress.base;
        const amt = resourceType === "stone"
            ? Math.floor(Math.max(0, amount || 0))
            : Math.max(0, amount || 0);
        if (resourceType === "wood" && base.bambooForest) {
            base.bambooForest.wood = Math.max(0, (base.bambooForest.wood || 0) - amt);
            return null;
        }
        if (resourceType === "hardwood" && base.bambooForest) {
            base.bambooForest.hardwood = Math.max(0, (base.bambooForest.hardwood || 0) - amt);
            return null;
        }
        if (resourceType === "stone") {
            return engine.deductStone(amt, {
                allowUnduplicated: engine.isStoneCarryUnduplicatedAllowed()
            });
        }
        if (resourceType === "bars" && base.atelier) {
            base.atelier.bars = Math.max(0, (base.atelier.bars || 0) - amt);
            return null;
        }
        if (resourceType === "ore" && base.atelier) {
            base.atelier.ore = Math.max(0, (base.atelier.ore || 0) - amt);
            return null;
        }
        if (resourceType === "mana" && data.progress.mana) {
            data.progress.mana.amount = Math.max(0, (data.progress.mana.amount || 0) - amt);
            return null;
        }
        return null;
    },
    refundConstructionResource: function(resourceType, amount, stoneTaken) {
        const base = data.progress.base;
        const amt = Math.max(0, amount || 0);
        if (resourceType === "wood" && base.bambooForest) {
            base.bambooForest.wood = (base.bambooForest.wood || 0) + amt;
        } else if (resourceType === "hardwood" && base.bambooForest) {
            base.bambooForest.hardwood = (base.bambooForest.hardwood || 0) + amt;
        } else if (resourceType === "stone") {
            engine.refundStone(amt, stoneTaken);
        } else if (resourceType === "bars" && base.atelier) {
            base.atelier.bars = (base.atelier.bars || 0) + amt;
        } else if (resourceType === "ore" && base.atelier) {
            base.atelier.ore = (base.atelier.ore || 0) + amt;
        } else if (resourceType === "mana" && data.progress.mana) {
            data.progress.mana.amount = (data.progress.mana.amount || 0) + amt;
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
    getFoxDenJobDeliverMapKey: function(jobKey, site) {
        const unlockKey = engine.parseBuildingJobKey(jobKey);
        if (unlockKey) {
            return unlockKey;
        }
        if (site && site.scopeKey) {
            return engine.getUpgradeGatherDeliverMapKey(site.scopeKey);
        }
        const parsed = engine.parseUpgradeGatherJobKey(jobKey);
        if (parsed) {
            return engine.getUpgradeGatherDeliverMapKey(parsed.scopeKey);
        }
        return null;
    },
    isSameBuildingGatherResource: function(resourceType, deliverMapKey) {
        return !!deliverMapKey && engine.getConstructionSourceBuildingKey(resourceType) === deliverMapKey;
    },
    applyInstantSameBuildingGatherForJob: function(jobKey) {
        const rh = data.progress.base.foxDen;
        const unlockKey = engine.parseBuildingJobKey(jobKey);
        let site = null;
        if (unlockKey) {
            site = rh.constructionSites[unlockKey];
            if (!site || site.status !== "building" || site.paused) {
                return false;
            }
        } else {
            site = rh.upgradeGatherJobs[jobKey];
            if (!site || site.status !== "gathering" || site.paused) {
                return false;
            }
        }
        const deliverMapKey = engine.getFoxDenJobDeliverMapKey(jobKey, site);
        if (!deliverMapKey) {
            return false;
        }
        const types = resortData.gatherResourceKeys;
        let transferred = false;
        for (let i = 0; i < types.length; i++) {
            const t = types[i];
            if (!engine.isSameBuildingGatherResource(t, deliverMapKey)) {
                continue;
            }
            const stillNeeded = engine.getConstructionStillNeeded(site, jobKey, t);
            if (stillNeeded <= 0) {
                continue;
            }
            const stock = engine.getConstructionResourceAvailable(t);
            if (stock <= 0) {
                continue;
            }
            const amount = Math.floor(Math.min(stillNeeded, stock));
            if (amount <= 0) {
                continue;
            }
            engine.deductConstructionResource(t, amount);
            site.delivered[t] = (site.delivered[t] || 0) + amount;
            transferred = true;
        }
        if (!transferred) {
            return false;
        }
        if (unlockKey) {
            if (engine.isUpgradeGatherSiteComplete(site)) {
                engine.completeFoxDenConstruction(unlockKey);
            }
        } else {
            engine.checkUpgradeGatherJobComplete(jobKey);
        }
        return true;
    },
    tryInstantSameBuildingGatherTransfers: function() {
        const rh = data.progress.base.foxDen;
        const queue = (rh.jobQueue || []).slice();
        for (let i = 0; i < queue.length; i++) {
            engine.applyInstantSameBuildingGatherForJob(queue[i]);
        }
    },
    getFoxDenResourcePriority: function(site, jobKey, allowed) {
        if (!site || !site.required) {
            return null;
        }
        const deliverMapKey = engine.getFoxDenJobDeliverMapKey(jobKey, site);
        const carryCap = resortData.getKitsuneCarryCapacity();
        const types = resortData.gatherResourceKeys;
        let best = null;
        for (let i = 0; i < types.length; i++) {
            const t = types[i];
            if (allowed && !allowed[t]) {
                continue;
            }
            if (engine.isSameBuildingGatherResource(t, deliverMapKey)) {
                continue;
            }
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
            const amount = Math.floor(Math.min(carryCap, stillNeeded, stock));
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
    getFoxDenSpawnTargetForJobKey: function(rh, jobKey, allowed) {
        const unlockKey = engine.parseBuildingJobKey(jobKey);
        if (unlockKey) {
            const site = rh.constructionSites[unlockKey];
            if (!site || site.status !== "building" || site.paused) {
                return null;
            }
            const priority = engine.getFoxDenResourcePriority(site, jobKey, allowed);
            if (!priority) {
                return null;
            }
            return {
                jobKey: jobKey,
                mapKey: unlockKey,
                site: site,
                resourceType: priority.resourceType,
                stillNeeded: priority.stillNeeded,
                amount: priority.amount
            };
        }
        const job = rh.upgradeGatherJobs[jobKey];
        if (!job || job.status !== "gathering" || job.paused) {
            return null;
        }
        const priority = engine.getFoxDenResourcePriority(job, jobKey, allowed);
        if (!priority) {
            return null;
        }
        return {
            jobKey: jobKey,
            mapKey: engine.getUpgradeGatherDeliverMapKey(job.scopeKey),
            site: job,
            resourceType: priority.resourceType,
            stillNeeded: priority.stillNeeded,
            amount: priority.amount
        };
    },
    getFoxDenSpawnTarget: function(rh, resourceFilter) {
        const manaOnly = resourceFilter === "mana";
        const allowed = resourceFilter && typeof resourceFilter === "object" ? resourceFilter : null;
        if (!manaOnly) {
            for (let oi = 0; oi < rh.jobQueue.length; oi++) {
                const target = engine.getFoxDenSpawnTargetForJobKey(rh, rh.jobQueue[oi], allowed);
                if (target) {
                    return target;
                }
            }
            if (allowed) {
                return null;
            }
        }
        return engine.getFoxDenManaSpawnTarget(rh);
    },
    getFoxDenManaSpawnTarget: function(rh) {
        if (!rh || !rh.manaOrdersEnabled) {
            return null;
        }
        const garden = data.progress.base && data.progress.base.garden;
        if (!garden || !garden.arrangementOfManaOrdersUnlocked) {
            return null;
        }
        const carry = resortData.getManaCarryAmount();
        const globalAvail = engine.getConstructionResourceAvailable("mana");
        if (globalAvail < carry) {
            return null;
        }
        const needy = engine.listManaNeedyBuildings();
        let best = null;
        let bestMissingPct = -1;
        let bestStillMissing = 0;
        for (let i = 0; i < needy.length; i++) {
            const st = needy[i];
            if (!st.allowCarriersBringMana) {
                continue;
            }
            const inFlight = engine.getConstructionResourceInFlight("mana:" + st.key, "mana");
            const stillMissing = Math.max(0, st.missing - inFlight);
            if (stillMissing <= carry) {
                continue;
            }
            const missingPct = st.capacity > 0 ? stillMissing / st.capacity : 0;
            if (!best || missingPct > bestMissingPct) {
                best = st;
                bestMissingPct = missingPct;
                bestStillMissing = stillMissing;
            }
        }
        if (!best) {
            return null;
        }
        return {
            jobKey: "mana:" + best.key,
            mapKey: best.key,
            site: null,
            resourceType: "mana",
            stillNeeded: bestStillMissing,
            amount: Math.min(carry, globalAvail),
            isManaDelivery: true
        };
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
    measureMapBuildingFromDom: function(buildingKey) {
        const mapBtnId = "baseBuilding_" + buildingKey;
        const el = viewData.cached[mapBtnId] || document.getElementById(mapBtnId);
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
        const art = el.querySelector(".resort-building-art");
        const target = (art && art.getBoundingClientRect().width > 0) ? art : el;
        const mr = map.getBoundingClientRect();
        const er = target.getBoundingClientRect();
        if (needsLayout) {
            el.style.display = prevDisplay;
            el.style.visibility = prevVisibility;
            el.style.pointerEvents = prevPointer;
        }
        if (mr.width <= 0 || mr.height <= 0 || er.width <= 0 || er.height <= 0) {
            return null;
        }
        return {
            x: er.left - mr.left - map.clientLeft + er.width * 0.5,
            y: er.top - mr.top - map.clientTop + er.height * 0.5
        };
    },
    measureFoxDenMapSlotFromDom: function(unlockKey) {
        return engine.measureMapBuildingFromDom(unlockKey);
    },
    cacheMapBuildingPositions: function() {
        if (viewData.mapBuildingPositionsLocked) {
            return;
        }
        const map = document.getElementById("baseResortMap");
        if (!map) {
            return;
        }
        const basePane = document.getElementById("tabPane_base");
        const prevPaneDisplay = basePane ? basePane.style.display : "";
        if (basePane && window.getComputedStyle(basePane).display === "none") {
            basePane.style.display = "block";
        }
        if (map.clientWidth <= 0 || map.clientHeight <= 0) {
            if (basePane) {
                basePane.style.display = prevPaneDisplay;
            }
            if (typeof createView !== "undefined" && createView.showCurrentTab) {
                createView.showCurrentTab();
            }
            return;
        }
        if (!viewData.mapBuildingPositions) {
            viewData.mapBuildingPositions = {};
        }
        const keys = resortData.baseBuildingOrder || [];
        let expected = 0;
        let measuredCount = 0;
        for (let ki = 0; ki < keys.length; ki++) {
            const el = document.getElementById("baseBuilding_" + keys[ki]);
            if (!el) {
                continue;
            }
            expected++;
            const measured = engine.measureMapBuildingFromDom(keys[ki]);
            if (measured) {
                viewData.mapBuildingPositions[keys[ki]] = measured;
                measuredCount++;
            }
        }
        if (expected > 0 && measuredCount === expected) {
            viewData.mapBuildingPositionsLocked = true;
        }
        if (basePane) {
            basePane.style.display = prevPaneDisplay;
        }
        if (typeof createView !== "undefined" && createView.showCurrentTab) {
            createView.showCurrentTab();
        }
    },
    getCarrierRoutePoints: function(carrier) {
        const fromLive = carrier && carrier.fromKey ? engine.getMapBuildingPosition(carrier.fromKey) : null;
        const toLive = carrier && carrier.toKey ? engine.getMapBuildingPosition(carrier.toKey) : null;
        return {
            fromX: fromLive ? fromLive.x : ((carrier && carrier.fromX) || 0),
            fromY: fromLive ? fromLive.y : ((carrier && carrier.fromY) || 0),
            toX: toLive ? toLive.x : ((carrier && carrier.toX) || 0),
            toY: toLive ? toLive.y : ((carrier && carrier.toY) || 0)
        };
    },
    getMapBuildingPosition: function(buildingKey) {
        if (buildingKey === "pathEnd") {
            return engine.getResortPathEnd();
        }
        if (!viewData.mapBuildingPositionsLocked) {
            engine.cacheMapBuildingPositions();
        }
        const cached = viewData.mapBuildingPositions && viewData.mapBuildingPositions[buildingKey];
        if (cached) {
            return cached;
        }
        if (buildingKey === "bambooForest" || buildingKey === "stonePile") {
            const end = engine.getResortPathEnd();
            const offY = buildingKey === "bambooForest" ? 125 : 18;
            return { x: Math.round(end.x - 9), y: Math.round(end.y + offY) };
        }
        const slot = resortData.getBuildingMapSlot(buildingKey);
        const dims = engine.getResortMapDimensions();
        return resortData.resolveMapSlotCenter(slot, dims.w, dims.h);
    },
    getFoxDenMapSlotPosition: function(unlockKey) {
        return engine.getMapBuildingPosition(unlockKey);
    },
    isFoxDenUnlockRowVisible: function(unlockKey) {
        const rh = data.progress.base && data.progress.base.foxDen;
        const unlocks = rh && rh.unlocks ? rh.unlocks : {};
        if (unlockKey === "atelier") {
            return !!unlocks.inn;
        }
        if (unlockKey === "mage_tower") {
            const torii = data.progress.base && data.progress.base.torii;
            return !!unlocks.inn && !!(torii && (torii.plantSpiritsBought || 0) > 0);
        }
        if (unlockKey === "bonfire") {
            return !!unlocks.mage_tower
                && engine.hasManaCapacityForCost(resortData.getFoxDenConstructionCost("bonfire"));
        }
        if (unlockKey === "shrine") {
            return !!unlocks.market;
        }
        if (unlockKey === "market") {
            return engine.isInnOnsenConverted();
        }
        if (unlockKey === "noodleBar") {
            return engine.isMarketCookingEquipmentBought();
        }
        if (unlockKey === "laundry") {
            return false;
        }
        if (unlockKey === "scrollArchives") {
            return !!(data.progress && data.progress.battleUnlocked) && !!unlocks.bonfire;
        }
        if (unlockKey === "cistern") {
            return engine.hasFirstEarthSpirit();
        }
        if (unlockKey === "pond") {
            return !!unlocks.cistern;
        }
        return true;
    },
    getConstructionSourcePosition: function(resourceType) {
        if (resourceType === "wood" || resourceType === "hardwood") {
            return engine.getMapBuildingPosition("bambooForest");
        }
        if (resourceType === "stone") {
            return engine.getMapBuildingPosition("stonePile");
        }
        if (resourceType === "bars") {
            return engine.getMapBuildingPosition("atelier");
        }
        if (resourceType === "ore") {
            return engine.getMapBuildingPosition("atelier");
        }
        if (resourceType === "mana") {
            return engine.getMapBuildingPosition("mage_tower");
        }
        return engine.getMapBuildingPosition("foxDen");
    },
    getCarrierSpeedCardMultiplier: function() {
        const cardAdd = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().carrierSpeedAdd || 0) : 0;
        return 1 + cardAdd;
    },
    getBonfireHeatCardMultiplier: function() {
        const cardAdd = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().bonfireHeatAdd || 0) : 0;
        return 1 + cardAdd;
    },
    getFoxDenCarrierSpeed: function(carrier) {
        const okami = engine.getOkami();
        const okamiHere = okami.assignedBuildingKey === "foxDen";
        const workerSpeed = resortData.foxDenCarrierSpeed;
        if (carrier.isOkami) {
            let speed = workerSpeed * 2;
            if (okamiHere) {
                speed *= engine.getOkamiInspirationBonus();
            }
            return speed * engine.getCarrierRoadSpeedMult(carrier) * engine.getCarrierSpeedCardMultiplier();
        }
        let speed = workerSpeed;
        if (okamiHere) {
            speed *= engine.getOkamiInspirationBonus();
        }
        return speed * engine.getCarrierRoadSpeedMult(carrier) * engine.getCarrierSpeedCardMultiplier();
    },
    getFoxDenPathHaulBaseSpeed: function(carrier) {
        let speed = engine.getOkamiTravelSpeed() / 4;
        if (carrier && carrier.isOkami) {
            speed *= 2;
        }
        const okami = engine.getOkami();
        if (okami.assignedBuildingKey === "foxDen") {
            speed *= engine.getOkamiInspirationBonus();
        }
        return speed * engine.getCarrierSpeedCardMultiplier();
    },
    getFoxDenPathHaulSegmentMult: function(segmentIndex) {
        return engine.getOkamiPathSegmentSpeedMultForIndex(segmentIndex) * engine.getPathSegmentRoadSpeedMult(segmentIndex);
    },
    deliverFoxDenCarrierLoad: function(rh, c) {
        const jobKey = c.jobKey || (c.unlockKey ? engine.getBuildingJobKey(c.unlockKey) : "");
        if (jobKey.indexOf("building:") === 0) {
            const unlockKey = jobKey.slice("building:".length);
            const site = rh.constructionSites[unlockKey];
            if (site && site.delivered) {
                site.delivered[c.resourceType] = (site.delivered[c.resourceType] || 0) + (c.amount || 0);
            }
            let complete = true;
            if (site && site.required) {
                const keys = resortData.gatherResourceKeys;
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
        } else if (jobKey.indexOf("mana:") === 0) {
            const buildingKey = jobKey.slice("mana:".length);
            engine.deliverManaToBuilding(buildingKey, c.amount || 0);
        }
    },
    cancelFoxDenCarriers: function() {
        const rh = data.progress.base.foxDen;
        for (let i = 0; i < rh.constructionCarriers.length; i++) {
            const c = rh.constructionCarriers[i];
            engine.refundConstructionResource(c.resourceType, c.amount || 0, c.stoneTaken);
        }
        rh.constructionCarriers = [];
    },
    trySpawnFoxDenCarrier: function(resourceFilter) {
        const rh = data.progress.base.foxDen;
        const wf = engine.getFoxDenFreeWorkforce(rh);
        if (wf.freeWorkers <= 0 && !wf.okamiFree) {
            return false;
        }
        const target = engine.getFoxDenSpawnTarget(rh, resourceFilter);
        if (!target) {
            return false;
        }
        const unit = engine.pickFoxDenCarrierUnit(rh);
        if (!unit) {
            return false;
        }
        const resourceType = target.resourceType;
        const amount = target.amount;
        if (target.isManaDelivery) {
            if (amount <= 0 || engine.getConstructionResourceAvailable("mana") < amount) {
                return false;
            }
            const fromM = engine.getConstructionSourcePosition("mana");
            const toM = engine.getMapBuildingPosition(target.mapKey);
            const dxM = toM.x - fromM.x;
            const dyM = toM.y - fromM.y;
            const distM = Math.sqrt(dxM * dxM + dyM * dyM) || 1;
            engine.deductConstructionResource("mana", amount);
            const manaCarrier = {
                id: rh.carrierIdCounter || 1,
                jobKey: target.jobKey,
                unlockKey: target.mapKey,
                resourceType: "mana",
                amount: amount,
                isOkami: unit.spawnOkami,
                progress: 0,
                displaySlot: engine.getFreeCarrierDisplaySlot(rh),
                fromX: fromM.x,
                fromY: fromM.y,
                toX: toM.x,
                toY: toM.y,
                totalDist: distM
            };
            engine.applyDirtRoadOnSpawn(manaCarrier, engine.getConstructionSourceBuildingKey("mana"), target.mapKey);
            rh.constructionCarriers.push(manaCarrier);
            rh.carrierIdCounter = (rh.carrierIdCounter || 1) + 1;
            return "mana";
        }
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
        const taken = engine.deductConstructionResource(resourceType, amount);
        const gatherCarrier = {
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
            totalDist: dist,
            stoneTaken: resourceType === "stone" ? taken : undefined
        };
        if (target.mapKey === "pathEnd") {
            gatherCarrier.haulPhase = "toPathEnd";
        }
        engine.applyDirtRoadOnSpawn(gatherCarrier, engine.getConstructionSourceBuildingKey(resourceType), target.mapKey);
        rh.constructionCarriers.push(gatherCarrier);
        rh.carrierIdCounter = (rh.carrierIdCounter || 1) + 1;
        return resourceType;
    },
    updateFoxDenConstruction: function(tickMs) {
        const rh = data.progress.base.foxDen;
        engine.tryInstantSameBuildingGatherTransfers();
        const assigned = rh.assignedWorkers || 0;
        const okami = engine.getOkami();
        if (assigned <= 0 && okami.assignedBuildingKey !== "foxDen") {
            engine.syncFoxDenCarriersToWorkforce();
            return;
        }
        const next = [];
        for (let i = 0; i < rh.constructionCarriers.length; i++) {
            const c = rh.constructionCarriers[i];
            if (c.haulPhase === "onPath") {
                const parsed = engine.parseUpgradeGatherJobKey(c.jobKey);
                const stop = engine.getPathHaulStopProgress(parsed && parsed.scopeKey);
                const before = (c.pathProgress === undefined || c.pathProgress === null)
                    ? engine.getResortPathTotalDistance()
                    : c.pathProgress;
                c.pathProgress = engine.advancePathProgress(before, tickMs / 1000, -1, {
                    baseSpeed: engine.getFoxDenPathHaulBaseSpeed(c),
                    getSegmentMult: engine.getFoxDenPathHaulSegmentMult,
                    minProgress: stop,
                    maxProgress: engine.getResortPathTotalDistance()
                });
                engine.creditPathSegmentsCrossed(before, c.pathProgress);
                if (c.pathProgress <= stop + 1e-4) {
                    engine.deliverFoxDenCarrierLoad(rh, c);
                } else {
                    next.push(c);
                }
                continue;
            }
            const speed = engine.getFoxDenCarrierSpeed(c);
            c.progress = (c.progress || 0) + (speed * (tickMs / 1000)) / (c.totalDist || 1);
            if (c.progress >= 1) {
                engine.addDirtRoadProgress(c.fromKey, c.toKey);
                if (c.haulPhase === "toPathEnd") {
                    c.haulPhase = "onPath";
                    c.pathProgress = engine.getResortPathTotalDistance();
                    next.push(c);
                } else {
                    engine.deliverFoxDenCarrierLoad(rh, c);
                }
            } else {
                next.push(c);
            }
        }
        rh.constructionCarriers = next;
        engine.tryFoxDenOkamiAutoPathJobs();
        engine.updateArrangementOfReview(tickMs);
        const minGap = (resortData.foxDenCarrierSpawnMinMs !== undefined) ? resortData.foxDenCarrierSpawnMinMs : 500;
        const soloKeys = ["stone", "bars", "ore"];
        if (!rh._carrierGapMsByResource) {
            rh._carrierGapMsByResource = {};
        }
        const gapByResource = rh._carrierGapMsByResource;
        const tickKeys = soloKeys.concat(["forest"]);
        for (let gi = 0; gi < tickKeys.length; gi++) {
            const resKey = tickKeys[gi];
            if (gapByResource[resKey] === undefined) {
                gapByResource[resKey] = rh._sinceLastCarrierMs || 0;
            }
            gapByResource[resKey] += tickMs;
        }
        let keepSpawningMaterials = true;
        while (keepSpawningMaterials) {
            const allowed = {};
            let anyReady = false;
            for (let gi = 0; gi < soloKeys.length; gi++) {
                const resKey = soloKeys[gi];
                if ((gapByResource[resKey] || 0) >= minGap) {
                    allowed[resKey] = true;
                    anyReady = true;
                }
            }
            if ((gapByResource.forest || 0) >= minGap) {
                allowed.wood = true;
                allowed.hardwood = true;
                anyReady = true;
            }
            if (!anyReady) {
                break;
            }
            const spawnedRes = engine.trySpawnFoxDenCarrier(allowed);
            if (!spawnedRes || !allowed[spawnedRes]) {
                keepSpawningMaterials = false;
            } else if (spawnedRes === "wood" || spawnedRes === "hardwood") {
                gapByResource.forest = 0;
            } else {
                gapByResource[spawnedRes] = 0;
            }
        }
        rh._sinceLastCarrierMs = (rh._sinceLastCarrierMs || 0) + tickMs;
        if (rh._sinceLastCarrierMs >= minGap) {
            if (engine.trySpawnFoxDenCarrier("mana")) {
                rh._sinceLastCarrierMs = 0;
            }
        }
    },
    getBonfireCarrierSpeed: function(carrier) {
        const okami = engine.getOkami();
        const okamiHere = okami.assignedBuildingKey === "bonfire";
        const workerSpeed = resortData.foxDenCarrierSpeed;
        if (carrier.isOkami) {
            let speed = workerSpeed * 2;
            if (okamiHere) {
                speed *= engine.getOkamiInspirationBonus();
            }
            return speed * engine.getCarrierRoadSpeedMult(carrier) * engine.getCarrierSpeedCardMultiplier();
        }
        let speed = workerSpeed;
        if (okamiHere) {
            speed *= engine.getOkamiInspirationBonus();
        }
        return speed * engine.getCarrierRoadSpeedMult(carrier) * engine.getCarrierSpeedCardMultiplier();
    },
    getInnCarrierSpeed: function(carrier) {
        const okami = engine.getOkami();
        const okamiHere = okami.assignedBuildingKey === "inn";
        const workerSpeed = resortData.foxDenCarrierSpeed;
        if (carrier.isOkami) {
            let speed = workerSpeed * 2;
            if (okamiHere) {
                speed *= engine.getOkamiInspirationBonus();
            }
            return speed * engine.getCarrierRoadSpeedMult(carrier);
        }
        let speed = workerSpeed;
        if (okamiHere) {
            speed *= engine.getOkamiInspirationBonus();
        }
        return speed * engine.getCarrierRoadSpeedMult(carrier);
    },
    getFreeBonfireCarrierDisplaySlot: function(bf) {
        const used = {};
        const carriers = bf.woodCarriers || [];
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
    getBonfireCarrierCapacity: function() {
        const bf = data.progress.base.bonfire;
        let cap = bf.assignedWorkers || 0;
        const okami = engine.getOkami();
        if (okami.assignedBuildingKey === "bonfire") {
            cap += 1;
        }
        return cap;
    },
    getBonfireCarriersInFlight: function() {
        const bf = data.progress.base.bonfire;
        return (bf.woodCarriers || []).length;
    },
    refundBonfireCarrierFuel: function(carrier) {
        if (!carrier) {
            return;
        }
        if (carrier.resourceType === "coal") {
            const market = data.progress.base && data.progress.base.market;
            if (market) {
                market.coal = (market.coal || 0) + (carrier.amount || 0);
            }
            return;
        }
        if (carrier.resourceType === "hardwood") {
            engine.refundForestHardwood(carrier.amount || 0);
            return;
        }
        engine.refundConstructionResource("wood", carrier.amount || 0);
    },
    cancelBonfireCarriers: function() {
        const bf = data.progress.base.bonfire;
        const carriers = bf.woodCarriers || [];
        for (let i = 0; i < carriers.length; i++) {
            engine.refundBonfireCarrierFuel(carriers[i]);
        }
        bf.woodCarriers = [];
    },
    syncBonfireCarriersToWorkforce: function() {
        const bf = data.progress.base.bonfire;
        const assigned = bf.assignedWorkers || 0;
        const okami = engine.getOkami();
        const okamiHere = okami.assignedBuildingKey === "bonfire";
        if (assigned <= 0 && !okamiHere) {
            engine.cancelBonfireCarriers();
            return;
        }
        const workerCarriers = [];
        for (let i = 0; i < (bf.woodCarriers || []).length; i++) {
            const c = bf.woodCarriers[i];
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
        for (let ci = 0; ci < (bf.woodCarriers || []).length; ci++) {
            const c = bf.woodCarriers[ci];
            if (c.isOkami) {
                if (okamiHere) {
                    next.push(c);
                } else {
                    engine.refundBonfireCarrierFuel(c);
                }
            } else if (removeIds[c.id]) {
                engine.refundBonfireCarrierFuel(c);
            } else {
                next.push(c);
            }
        }
        bf.woodCarriers = next;
    },
    defaultBonfireKilnPriority: function() {
        return [
            { key: "coal", use: true },
            { key: "wood", use: true, keep: null },
            { key: "hardwood", use: true, keep: null },
            { key: "charcoalPit", use: true }
        ];
    },
    ensureBonfireKilnPriority: function(bf) {
        if (!bf) {
            return [];
        }
        const known = { coal: true, wood: true, hardwood: true, charcoalPit: true };
        const defaults = engine.defaultBonfireKilnPriority();
        const have = {};
        const next = [];
        const cur = bf.kilnPriority || [];
        for (let i = 0; i < cur.length; i++) {
            const row = cur[i];
            if (!row || !known[row.key] || have[row.key]) {
                continue;
            }
            have[row.key] = true;
            if (row.use === undefined) {
                row.use = true;
            }
            next.push(row);
        }
        for (let d = 0; d < defaults.length; d++) {
            if (!have[defaults[d].key]) {
                next.push(defaults[d]);
            }
        }
        bf.kilnPriority = next;
        return next;
    },
    completeBuildKiln: function() {
        const bf = data.progress.base && data.progress.base.bonfire;
        if (!bf) {
            return;
        }
        bf.kilnBuilt = true;
        bf.mana = bf.mana || 0;
        bf.manaCapacity = 40000;
        if (bf.kilnHardwood === undefined || bf.kilnHardwood === null) {
            bf.kilnHardwood = 0;
        }
        if (bf.charcoalPitWood === undefined || bf.charcoalPitWood === null) {
            bf.charcoalPitWood = 0;
        }
        if (bf.charcoal === undefined || bf.charcoal === null) {
            bf.charcoal = 0;
        }
        if (bf.ash === undefined || bf.ash === null) {
            bf.ash = 0;
        }
        if (bf.fireTendingEnabled === false) {
            bf.kilnHeatCap = null;
        } else if (bf.kilnHeatCap === undefined) {
            bf.kilnHeatCap = bf.fireTendingHeatCap !== undefined && bf.fireTendingHeatCap !== null
                ? bf.fireTendingHeatCap
                : 55;
        }
        engine.ensureBonfireKilnPriority(bf);
    },
    bonfireKilnNumber: function(value) {
        if (value === null || value === undefined || value === "") {
            return null;
        }
        const n = Number(value);
        if (isNaN(n)) {
            return null;
        }
        return n;
    },
    bonfireKilnHeatBlocksFuel: function(bf) {
        const cap = engine.bonfireKilnNumber(bf && bf.kilnHeatCap);
        if (cap === null) {
            return false;
        }
        return (bf.heat || 0) >= cap;
    },
    bonfireKeepBlocks: function(stock, keep, carry) {
        const n = engine.bonfireKilnNumber(keep);
        if (n === null) {
            return false;
        }
        return stock < n + carry;
    },
    getForestHardwood: function() {
        const forest = data.progress.base && data.progress.base.bambooForest;
        return (forest && forest.hardwood) || 0;
    },
    deductForestHardwood: function(amount) {
        const forest = data.progress.base && data.progress.base.bambooForest;
        const amt = Math.max(0, amount || 0);
        if (!forest || (forest.hardwood || 0) < amt) {
            return false;
        }
        forest.hardwood = (forest.hardwood || 0) - amt;
        return true;
    },
    refundForestHardwood: function(amount) {
        const forest = data.progress.base && data.progress.base.bambooForest;
        if (!forest) {
            return;
        }
        forest.hardwood = (forest.hardwood || 0) + Math.max(0, amount || 0);
    },
    getBonfirePriorityRow: function(bf, key) {
        const rows = engine.ensureBonfireKilnPriority(bf);
        for (let i = 0; i < rows.length; i++) {
            if (rows[i].key === key) {
                return rows[i];
            }
        }
        return null;
    },
    pickBonfireKilnAction: function(bf) {
        if (!bf || !bf.kilnBuilt) {
            return null;
        }
        const rows = engine.ensureBonfireKilnPriority(bf);
        const woodCarry = resortData.getKitsuneWoodCarryAmount();
        const foxCarry = resortData.getKitsuneCarryCapacity();
        const heatBlocked = engine.bonfireKilnHeatBlocksFuel(bf);
        const market = data.progress.base && data.progress.base.market;
        const coalAvail = engine.isMarketBuilt() ? ((market && market.coal) || 0) : 0;
        const woodAvail = engine.getConstructionResourceAvailable("wood");
        const hardwoodAvail = engine.getForestHardwood();
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (!row.use) {
                continue;
            }
            if (row.key === "coal") {
                if (heatBlocked || coalAvail < woodCarry) {
                    continue;
                }
                return { type: "coal", carry: woodCarry, fromKey: "market" };
            }
            if (row.key === "wood") {
                if (heatBlocked || woodAvail < woodCarry || engine.bonfireKeepBlocks(woodAvail, row.keep, woodCarry)) {
                    continue;
                }
                return { type: "wood", carry: woodCarry, fromKey: "bambooForest" };
            }
            if (row.key === "hardwood") {
                const stop = engine.bonfireKilnNumber(bf.hardwoodStopAt);
                if (hardwoodAvail < foxCarry || engine.bonfireKeepBlocks(hardwoodAvail, row.keep, foxCarry)) {
                    continue;
                }
                if (stop !== null && (bf.kilnHardwood || 0) > stop) {
                    continue;
                }
                return { type: "hardwood", carry: foxCarry, fromKey: "bambooForest" };
            }
            if (row.key === "charcoalPit") {
                if ((bf.kilnHardwood || 0) <= 0 || engine.getBonfireCarrierCapacity() <= 0) {
                    continue;
                }
                return { type: "charcoalPit" };
            }
        }
        return null;
    },
    getCharcoalPitDurationMs: function() {
        const okami = engine.getOkami();
        if (okami.assignedBuildingKey === "bonfire") {
            const bonus = engine.getOkamiInspirationBonus();
            if (bonus > 0) {
                return 5000 / bonus;
            }
        }
        return 5000;
    },
    getCharcoalProductionAmount: function(bf) {
        if (!bf) {
            return 0;
        }
        const pit = Math.max(0, bf.charcoalPitWood || 0);
        const woodPull = Math.floor(Math.sqrt(pit));
        const made = Math.floor(woodPull / 10);
        if (made < 1 || pit < made * 10) {
            return 0;
        }
        if ((bf.heat || 0) < 400 || (bf.mana || 0) < 100) {
            return 0;
        }
        return made;
    },
    runBonfireCharcoalSecond: function(bf) {
        const made = engine.getCharcoalProductionAmount(bf);
        if (made >= 1) {
            bf.charcoalPitWood = (bf.charcoalPitWood || 0) - made * 10;
            bf.charcoal = (bf.charcoal || 0) + made;
            bf.ash = (bf.ash || 0) + made;
            bf.mana = Math.max(0, (bf.mana || 0) - 100);
        }
        const heatPer = 50 * engine.getBonfireHeatCardMultiplier();
        const cap = engine.bonfireKilnNumber(bf.kilnHeatCap);
        let burned = 0;
        while (burned < 5 && (bf.charcoal || 0) >= 1) {
            if (cap !== null && (bf.heat || 0) >= cap) {
                break;
            }
            bf.charcoal -= 1;
            bf.heat = (bf.heat || 0) + heatPer;
            burned++;
        }
    },
    updateBonfireKiln: function(tickMs) {
        const bf = data.progress.base && data.progress.base.bonfire;
        if (!bf || !bf.kilnBuilt) {
            return;
        }
        const action = engine.pickBonfireKilnAction(bf);
        if (action && action.type === "charcoalPit") {
            const dur = Math.max(1, engine.getCharcoalPitDurationMs());
            bf.charcoalPitProgressMs = (bf.charcoalPitProgressMs || 0) + (tickMs || 0);
            let pitGuard = 0;
            while (bf.charcoalPitProgressMs >= dur && pitGuard < 100000) {
                bf.charcoalPitProgressMs -= dur;
                const batch = resortData.getKitsuneWoodCarryAmount() * engine.getBonfireCarrierCapacity();
                const moved = Math.min(bf.kilnHardwood || 0, Math.max(0, batch));
                if (moved <= 0) {
                    bf.charcoalPitProgressMs = 0;
                    break;
                }
                bf.kilnHardwood = (bf.kilnHardwood || 0) - moved;
                bf.charcoalPitWood = (bf.charcoalPitWood || 0) + moved;
                pitGuard++;
            }
        }
        bf._charcoalAccMs = (bf._charcoalAccMs || 0) + (tickMs || 0);
        let guard = 0;
        while (bf._charcoalAccMs >= 1000 && guard < 100000) {
            bf._charcoalAccMs -= 1000;
            engine.runBonfireCharcoalSecond(bf);
            guard++;
        }
    },
    getBonfireSpawnUnit: function(bf) {
        const okami = engine.getOkami();
        const okamiHere = okami.assignedBuildingKey === "bonfire";
        const workersOnly = bf.assignedWorkers || 0;
        let workerCarriersInFlight = 0;
        let okamiCarriersInFlight = 0;
        const carriersInFlight = bf.woodCarriers || [];
        for (let ci = 0; ci < carriersInFlight.length; ci++) {
            if (carriersInFlight[ci].isOkami) {
                okamiCarriersInFlight++;
            } else {
                workerCarriersInFlight++;
            }
        }
        const freeWorkers = Math.max(0, workersOnly - workerCarriersInFlight);
        const okamiFree = okamiHere && okamiCarriersInFlight < 1;
        if (freeWorkers <= 0 && !okamiFree) {
            return null;
        }
        if (freeWorkers > 0 && !okamiFree) {
            return { isOkami: false };
        }
        if (okamiFree && freeWorkers <= 0) {
            return { isOkami: true };
        }
        const okamiSpeed = engine.getBonfireCarrierSpeed({ isOkami: true });
        const workerSpeed = engine.getBonfireCarrierSpeed({ isOkami: false });
        return { isOkami: okamiSpeed >= workerSpeed };
    },
    spawnBonfireCarrier: function(bf, resourceType, amount, fromKey) {
        const from = engine.getFoxDenMapSlotPosition(fromKey);
        const to = engine.getFoxDenMapSlotPosition("bonfire");
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const unit = engine.getBonfireSpawnUnit(bf);
        if (!unit) {
            return false;
        }
        if (!bf.woodCarriers) {
            bf.woodCarriers = [];
        }
        if (resourceType === "coal") {
            const market = data.progress.base && data.progress.base.market;
            if (!market) {
                return false;
            }
            market.coal = Math.max(0, (market.coal || 0) - amount);
        } else if (resourceType === "hardwood") {
            if (!engine.deductForestHardwood(amount)) {
                return false;
            }
        } else if (!engine.deductConstructionResource) {
            return false;
        } else {
            engine.deductConstructionResource("wood", amount);
        }
        const carrier = {
            id: bf.carrierIdCounter || 1,
            amount: amount,
            resourceType: resourceType,
            isOkami: unit.isOkami,
            progress: 0,
            displaySlot: engine.getFreeBonfireCarrierDisplaySlot(bf),
            fromX: from.x,
            fromY: from.y,
            toX: to.x,
            toY: to.y,
            totalDist: dist
        };
        engine.applyDirtRoadOnSpawn(carrier, fromKey, "bonfire");
        bf.woodCarriers.push(carrier);
        bf.carrierIdCounter = (bf.carrierIdCounter || 1) + 1;
        return true;
    },
    trySpawnBonfireKilnCarrier: function(bf) {
        const action = engine.pickBonfireKilnAction(bf);
        if (!action || action.type === "charcoalPit") {
            return false;
        }
        return engine.spawnBonfireCarrier(bf, action.type, action.carry, action.fromKey);
    },
    trySpawnBonfireWoodCarrier: function() {
        const bf = data.progress.base.bonfire;
        const capacity = engine.getBonfireCarrierCapacity();
        if (capacity <= 0) {
            return false;
        }
        if (engine.getBonfireCarriersInFlight() >= capacity) {
            return false;
        }
        if (bf.kilnBuilt) {
            return engine.trySpawnBonfireKilnCarrier(bf);
        }
        const garden = data.progress.base && data.progress.base.garden;
        if (garden && garden.arrangementOfFireTendingUnlocked) {
            if (bf.fireTendingEnabled !== false && bf.heat >= bf.fireTendingHeatCap) {
                return false;
            }
        }
        const carry = resortData.getKitsuneWoodCarryAmount();
        const market = data.progress.base && data.progress.base.market;
        const coalAvail = engine.isMarketBuilt() ? ((market && market.coal) || 0) : 0;
        const useCoal = coalAvail >= carry;
        const woodAvail = engine.getConstructionResourceAvailable("wood");
        if (!useCoal && woodAvail < carry) {
            return false;
        }
        const okami = engine.getOkami();
        const okamiHere = okami.assignedBuildingKey === "bonfire";
        const workersOnly = bf.assignedWorkers || 0;
        let workerCarriersInFlight = 0;
        let okamiCarriersInFlight = 0;
        const carriersInFlight = bf.woodCarriers || [];
        for (let ci = 0; ci < carriersInFlight.length; ci++) {
            if (carriersInFlight[ci].isOkami) {
                okamiCarriersInFlight++;
            } else {
                workerCarriersInFlight++;
            }
        }
        const freeWorkers = Math.max(0, workersOnly - workerCarriersInFlight);
        const okamiFree = okamiHere && okamiCarriersInFlight < 1;
        if (freeWorkers <= 0 && !okamiFree) {
            return false;
        }
        let isOkami = false;
        if (freeWorkers > 0 && !okamiFree) {
            isOkami = false;
        } else if (okamiFree && freeWorkers <= 0) {
            isOkami = true;
        } else {
            const okamiSpeed = engine.getBonfireCarrierSpeed({ isOkami: true });
            const workerSpeed = engine.getBonfireCarrierSpeed({ isOkami: false });
            isOkami = okamiSpeed >= workerSpeed;
        }
        const fromKey = useCoal ? "market" : "bambooForest";
        const from = engine.getFoxDenMapSlotPosition(fromKey);
        const to = engine.getFoxDenMapSlotPosition("bonfire");
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (useCoal) {
            market.coal = Math.max(0, (market.coal || 0) - carry);
        } else {
            engine.deductConstructionResource("wood", carry);
        }
        const woodCarrier = {
            id: bf.carrierIdCounter || 1,
            amount: carry,
            resourceType: useCoal ? "coal" : "wood",
            isOkami: isOkami,
            progress: 0,
            displaySlot: engine.getFreeBonfireCarrierDisplaySlot(bf),
            fromX: from.x,
            fromY: from.y,
            toX: to.x,
            toY: to.y,
            totalDist: dist
        };
        engine.applyDirtRoadOnSpawn(woodCarrier, fromKey, "bonfire");
        bf.woodCarriers.push(woodCarrier);
        bf.carrierIdCounter = (bf.carrierIdCounter || 1) + 1;
        return true;
    },
    updateBonfireHeatDecay: function() {
        const bf = data.progress.base && data.progress.base.bonfire;
        if (!bf) {
            return;
        }
        const protectedHeat = engine.getBonfireAssignedFireSpiritPowerTotal();
        const heat = bf.heat || 0;
        const rate = bonfireConfig.heatDecayPerTick;
        if (protectedHeat <= 0 && heat <= 0) {
            return;
        }
        if (heat > protectedHeat) {
            const decayable = heat - protectedHeat;
            bf.heat = protectedHeat + decayable * (1 - rate);
        } else if (heat < protectedHeat) {
            const growable = protectedHeat - heat;
            bf.heat = heat + growable * (1 - rate);
        }
    },
    updateBonfireWoodCarriers: function(tickMs) {
        const bf = data.progress.base.bonfire;
        const assigned = bf.assignedWorkers || 0;
        const okami = engine.getOkami();
        if (assigned <= 0 && okami.assignedBuildingKey !== "bonfire") {
            engine.syncBonfireCarriersToWorkforce();
            return;
        }
        const carriers = bf.woodCarriers || [];
        if (!carriers.length && engine.getBonfireCarrierCapacity() <= 0) {
            return;
        }
        const next = [];
        for (let i = 0; i < carriers.length; i++) {
            const c = carriers[i];
            const speed = engine.getBonfireCarrierSpeed(c);
            c.progress = (c.progress || 0) + (speed * (tickMs / 1000)) / (c.totalDist || 1);
            if (c.progress >= 1) {
                engine.addDirtRoadProgress(c.fromKey, c.toKey);
                if (c.resourceType === "hardwood") {
                    bf.kilnHardwood = (bf.kilnHardwood || 0) + (c.amount || 0);
                } else {
                    const heatPer = bonfireConfig.heatPerWood * (c.resourceType === "coal" ? bonfireConfig.heatPerCoalMult : 1) * engine.getBonfireHeatCardMultiplier();
                    bf.heat = (bf.heat || 0) + (c.amount || 0) * heatPer;
                }
            } else {
                next.push(c);
            }
        }
        bf.woodCarriers = next;
        bf._sinceLastBonfireCarrierMs = (bf._sinceLastBonfireCarrierMs || 0) + tickMs;
        const minGap = resortData.foxDenCarrierSpawnMinMs || 500;
        if (bf._sinceLastBonfireCarrierMs >= minGap) {
            if (engine.trySpawnBonfireWoodCarrier()) {
                bf._sinceLastBonfireCarrierMs = 0;
            }
        }
    },
    getMarketCarrierSpeed: function(carrier) {
        const okami = engine.getOkami();
        const okamiHere = okami.assignedBuildingKey === "market";
        const workerSpeed = resortData.foxDenCarrierSpeed;
        let speed = carrier.isOkami ? workerSpeed * 2 : workerSpeed;
        if (okamiHere) {
            speed *= engine.getOkamiInspirationBonus();
        }
        return speed * engine.getCarrierRoadSpeedMult(carrier) * engine.getCarrierSpeedCardMultiplier();
    },
    getFreeMarketCarrierDisplaySlot: function(market) {
        const used = {};
        const carriers = market.creditCarriers || [];
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
    getMarketCarrierCapacity: function() {
        const market = data.progress.base.market;
        if (!market) {
            return 0;
        }
        let cap = market.assignedWorkers || 0;
        const okami = engine.getOkami();
        if (okami.assignedBuildingKey === "market") {
            cap += 1;
        }
        return cap;
    },
    getMarketCarriersInFlight: function() {
        const market = data.progress.base.market;
        return ((market && market.creditCarriers) || []).length;
    },
    getMarketAllowedHaulResources: function() {
        const market = data.progress.base.market;
        const out = [];
        if (!market) {
            return out;
        }
        const order = resortData.marketHaulResourceOrder || [];
        for (let i = 0; i < order.length; i++) {
            const rt = order[i];
            const field = rt === "stone" ? "allowStone"
                : rt === "wood" ? "allowWood"
                : rt === "hardwood" ? "allowHardwood"
                : rt === "bars" ? "allowBars"
                : null;
            if (rt === "hardwood" && !engine.isGrowHardwoodBought()) {
                continue;
            }
            if (field && market[field]) {
                out.push(rt);
            }
        }
        return out;
    },
    getMarketCreditPerUnit: function(resourceType) {
        const rates = resortData.marketCreditPerResource || {};
        let rate = rates[resourceType] || 0;
        if (engine.isTradingContractsBought()) {
            rate *= 2;
        }
        if (engine.isDealMakingBought()) {
            rate *= Math.max(1, engine.getMarketLevel());
        }
        return rate;
    },
    getMarketHaulKeepAmount: function(resourceType) {
        const garden = data.progress.base && data.progress.base.garden;
        if (!garden || !garden.arrangementOfResourceProtectionUnlocked) {
            return 0;
        }
        return engine.getShrineHaulKeep(resourceType);
    },
    /** Round-robin over the allowed resources, skipping any that cannot fill a whole trip. */
    pickMarketHaulResource: function() {
        const market = data.progress.base.market;
        const allowed = engine.getMarketAllowedHaulResources();
        if (!market || !allowed.length) {
            return null;
        }
        const carry = resortData.getKitsuneCarryCapacity();
        const start = (market.nextHaulResourceIndex || 0) % allowed.length;
        for (let step = 0; step < allowed.length; step++) {
            const idx = (start + step) % allowed.length;
            const rt = allowed[idx];
            const keep = engine.getMarketHaulKeepAmount(rt);
            if (engine.getConstructionResourceAvailable(rt) >= carry + keep) {
                market.nextHaulResourceIndex = (idx + 1) % allowed.length;
                return rt;
            }
        }
        return null;
    },
    /** Rough credit/s for the panel readout; assumes every carrier keeps making round trips. */
    getMarketCreditPerSecond: function() {
        const market = data.progress.base.market;
        const allowed = engine.getMarketAllowedHaulResources();
        const capacity = engine.getMarketCarrierCapacity();
        if (!market || !allowed.length || capacity <= 0) {
            return 0;
        }
        const carry = resortData.getKitsuneCarryCapacity();
        let creditSum = 0;
        let distSum = 0;
        for (let i = 0; i < allowed.length; i++) {
            const rt = allowed[i];
            creditSum += engine.getMarketCreditPerUnit(rt) * carry;
            const from = engine.getConstructionSourcePosition(rt);
            const to = engine.getFoxDenMapSlotPosition("market");
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            distSum += Math.sqrt(dx * dx + dy * dy) || 1;
        }
        const avgCredit = creditSum / allowed.length;
        const avgDist = distSum / allowed.length;
        const speed = engine.getMarketCarrierSpeed({ isOkami: false });
        if (speed <= 0 || avgDist <= 0) {
            return 0;
        }
        const tripSeconds = avgDist / speed;
        return (avgCredit / tripSeconds) * capacity;
    },
    trySpawnMarketCreditCarrier: function() {
        const market = data.progress.base.market;
        if (!market || !engine.isMarketBuilt()) {
            return false;
        }
        const capacity = engine.getMarketCarrierCapacity();
        if (capacity <= 0 || engine.getMarketCarriersInFlight() >= capacity) {
            return false;
        }
        const okami = engine.getOkami();
        const okamiHere = okami.assignedBuildingKey === "market";
        const workersOnly = market.assignedWorkers || 0;
        let workerCarriersInFlight = 0;
        let okamiCarriersInFlight = 0;
        const inFlight = market.creditCarriers || [];
        for (let ci = 0; ci < inFlight.length; ci++) {
            if (inFlight[ci].isOkami) {
                okamiCarriersInFlight++;
            } else {
                workerCarriersInFlight++;
            }
        }
        let isOkami = false;
        if (workerCarriersInFlight < workersOnly) {
            isOkami = false;
        } else if (okamiHere && okamiCarriersInFlight < 1) {
            isOkami = true;
        } else {
            return false;
        }
        const resourceType = engine.pickMarketHaulResource();
        if (!resourceType) {
            return false;
        }
        const carry = resortData.getKitsuneCarryCapacity();
        const sourceKey = engine.getConstructionSourceBuildingKey(resourceType);
        const from = engine.getConstructionSourcePosition(resourceType);
        const to = engine.getFoxDenMapSlotPosition("market");
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const stoneTaken = engine.deductConstructionResource(resourceType, carry);
        const carrier = {
            id: market.carrierIdCounter || 1,
            resourceType: resourceType,
            amount: carry,
            isOkami: isOkami,
            progress: 0,
            displaySlot: engine.getFreeMarketCarrierDisplaySlot(market),
            fromX: from.x,
            fromY: from.y,
            toX: to.x,
            toY: to.y,
            totalDist: dist,
            stoneTaken: resourceType === "stone" ? stoneTaken : undefined
        };
        engine.applyDirtRoadOnSpawn(carrier, sourceKey, "market");
        market.creditCarriers.push(carrier);
        market.carrierIdCounter = (market.carrierIdCounter || 1) + 1;
        return true;
    },
    /** Refund and drop every in-flight hauler matching the predicate (all of them when omitted). */
    cancelMarketCarriers: function(predicate) {
        const market = data.progress.base && data.progress.base.market;
        if (!market) {
            return;
        }
        const carriers = market.creditCarriers || [];
        const next = [];
        for (let i = 0; i < carriers.length; i++) {
            const c = carriers[i];
            if (!predicate || predicate(c)) {
                engine.refundConstructionResource(c.resourceType, c.amount || 0, c.stoneTaken);
            } else {
                next.push(c);
            }
        }
        market.creditCarriers = next;
    },
    syncMarketCarriersToWorkforce: function() {
        const market = data.progress.base && data.progress.base.market;
        if (!market) {
            return;
        }
        const assigned = market.assignedWorkers || 0;
        const okami = engine.getOkami();
        const okamiHere = okami.assignedBuildingKey === "market";
        if (assigned <= 0 && !okamiHere) {
            engine.cancelMarketCarriers();
            return;
        }
        const workerCarriers = [];
        for (let i = 0; i < (market.creditCarriers || []).length; i++) {
            const c = market.creditCarriers[i];
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
        engine.cancelMarketCarriers(function(c) {
            if (c.isOkami) {
                return !okamiHere;
            }
            return !!removeIds[c.id];
        });
    },
    updateMarketCreditCarriers: function(tickMs) {
        const market = data.progress.base && data.progress.base.market;
        if (!market || !engine.isMarketBuilt()) {
            return;
        }
        const assigned = market.assignedWorkers || 0;
        const okami = engine.getOkami();
        if (assigned <= 0 && okami.assignedBuildingKey !== "market") {
            engine.syncMarketCarriersToWorkforce();
            return;
        }
        const carriers = market.creditCarriers || [];
        if (!carriers.length && engine.getMarketCarrierCapacity() <= 0) {
            return;
        }
        const next = [];
        for (let i = 0; i < carriers.length; i++) {
            const c = carriers[i];
            const speed = engine.getMarketCarrierSpeed(c);
            c.progress = (c.progress || 0) + (speed * (tickMs / 1000)) / (c.totalDist || 1);
            if (c.progress >= 1) {
                engine.addDirtRoadProgress(c.fromKey, c.toKey);
                const credit = (c.amount || 0) * engine.getMarketCreditPerUnit(c.resourceType);
                market.credit = (market.credit || 0) + credit;
                engine.grantMarketExp(credit);
            } else {
                next.push(c);
            }
        }
        market.creditCarriers = next;
        market._sinceLastMarketCarrierMs = (market._sinceLastMarketCarrierMs || 0) + tickMs;
        const minGap = resortData.foxDenCarrierSpawnMinMs || 500;
        if (market._sinceLastMarketCarrierMs >= minGap) {
            if (engine.trySpawnMarketCreditCarrier()) {
                market._sinceLastMarketCarrierMs = 0;
            }
        }
    },
    getMarketTraderCount: function() {
        const market = data.progress.base && data.progress.base.market;
        return (market && market.assignedTraders) || 0;
    },
    getMarketDemandTaxExtra: function() {
        const market = data.progress.base && data.progress.base.market;
        return Math.max(0, (market && market.demandTaxExtra) || 0);
    },
    getMarketTradeCreditCost: function(tradeKey) {
        const td = resortData.marketTrades[tradeKey];
        if (!td) {
            return 0;
        }
        return Math.round((td.creditCost || 0) * (1 + engine.getMarketDemandTaxExtra()));
    },
    getMarketDemandTaxText: function() {
        const extra = engine.getMarketDemandTaxExtra();
        const mult = 1 + extra;
        const rate = extra * 0.001;
        return `<span class="muted-text">Demand Tax: x</span>${round3Fixed(mult)}<span class="muted-text"> price, decreasing by </span>${engine.formatPenaltyFigure(rate)}<span class="muted-text">/s (+0.1 per trade)</span>`;
    },
    /** Extra above ×1 falls by 0.1% of itself per second. */
    decayMarketDemandTax: function(tickMs) {
        const market = data.progress.base && data.progress.base.market;
        if (!market || !(tickMs > 0)) {
            return;
        }
        const extra = market.demandTaxExtra || 0;
        if (!(extra > 0)) {
            market.demandTaxExtra = 0;
            return;
        }
        let next = extra * Math.exp(-0.001 * (tickMs / 1000));
        if (!(next > 1e-6)) {
            next = 0;
        }
        market.demandTaxExtra = next;
    },
    getMarketTradeBaseSeconds: function(tradeKey) {
        const td = resortData.marketTrades[tradeKey];
        if (!td) {
            return 0;
        }
        const reduce = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().marketTradeDurationReduceSec || 0) : 0;
        return Math.max(0, (td.seconds || 0) - reduce);
    },
    /** Trade time is static: spirit strands never shorten it, but each Trader divides it. */
    getMarketTradeDurationMs: function(tradeKey) {
        const td = resortData.marketTrades[tradeKey];
        if (!td) {
            return 0;
        }
        const traders = Math.max(1, engine.getMarketTraderCount());
        return (engine.getMarketTradeBaseSeconds(tradeKey) * 1000) / traders;
    },
    isMarketTradeUnlocked: function(tradeKey) {
        const td = resortData.marketTrades[tradeKey];
        if (!td) {
            return false;
        }
        if (td.requiresBuilding) {
            const rh = data.progress.base && data.progress.base.foxDen;
            if (!rh || !rh.unlocks || !rh.unlocks[td.requiresBuilding]) {
                return false;
            }
        }
        return engine.getMarketLevel() >= (td.minMarketLevel || 0);
    },
    ensureMarketPausedTrades: function() {
        const market = data.progress.base && data.progress.base.market;
        if (!market) {
            return null;
        }
        if (!market.pausedTrades || typeof market.pausedTrades !== "object") {
            market.pausedTrades = {};
        }
        // Migrate legacy in-place paused activeTrade into pausedTrades.
        const active = market.activeTrade;
        if (active && active.paused) {
            market.pausedTrades[active.key] = {
                key: active.key,
                totalMs: active.totalMs || 0,
                remainMs: Math.max(0, active.remainMs || 0)
            };
            market.activeTrade = null;
        }
        return market.pausedTrades;
    },
    getPausedMarketTrade: function(tradeKey) {
        const paused = engine.ensureMarketPausedTrades();
        return (paused && paused[tradeKey]) || null;
    },
    /** A trade can start/resume when enabled, unlocked, under stock threshold, and affordable (or already paid). */
    isMarketTradeAvailable: function(tradeKey) {
        const market = data.progress.base && data.progress.base.market;
        const td = resortData.marketTrades[tradeKey];
        if (!market || !td || !engine.isMarketTradeUnlocked(tradeKey)) {
            return false;
        }
        if (!(market.tradeEnabled && market.tradeEnabled[tradeKey])) {
            return false;
        }
        const garden = data.progress.base.garden;
        if (garden && garden.arrangementOfTraderResponsibilityUnlocked) {
            const threshold = (market.tradeThresholds && market.tradeThresholds[tradeKey]) || 0;
            if (threshold > 0 && (market[tradeKey] || 0) >= threshold) {
                return false;
            }
        }
        if (engine.getPausedMarketTrade(tradeKey)) {
            return true;
        }
        return resortData.canAffordCost({ credit: engine.getMarketTradeCreditCost(tradeKey) });
    },
    pickNextMarketTrade: function() {
        const market = data.progress.base && data.progress.base.market;
        const order = resortData.marketTradesOrder || [];
        if (!market || !order.length) {
            return null;
        }
        const start = (market.nextTradeIndex || 0) % order.length;
        for (let step = 0; step < order.length; step++) {
            const idx = (start + step) % order.length;
            const tk = order[idx];
            if (engine.isMarketTradeAvailable(tk)) {
                market.nextTradeIndex = (idx + 1) % order.length;
                return tk;
            }
        }
        return null;
    },
    getMarketTradeStatusText: function() {
        const market = data.progress.base && data.progress.base.market;
        if (!market) {
            return "";
        }
        if (engine.getMarketTraderCount() <= 0) {
            return "No Traders assigned.";
        }
        const active = market.activeTrade;
        if (active) {
            const td = resortData.marketTrades[active.key];
            const name = td ? td.name : active.key;
            return `Buying ${name}: ${round1(Math.max(0, active.remainMs) / 1000)}s left.`;
        }
        const paused = engine.ensureMarketPausedTrades();
        const pausedKeys = paused ? Object.keys(paused) : [];
        if (pausedKeys.length) {
            const names = [];
            for (let i = 0; i < pausedKeys.length; i++) {
                const td = resortData.marketTrades[pausedKeys[i]];
                names.push(td ? td.name : pausedKeys[i]);
            }
            return `Paused: ${names.join(", ")} (credit paid; resumes when re-enabled). Traders are idle or on another trade.`;
        }
        return "Traders are idle - enable a trade they can afford.";
    },
    /** A started trade keeps its paid Credit; it pauses rather than refunds when disabled. */
    canMarketTradeContinue: function(tradeKey) {
        const market = data.progress.base && data.progress.base.market;
        if (!market || engine.getMarketTraderCount() <= 0) {
            return false;
        }
        if (!engine.isMarketTradeUnlocked(tradeKey)) {
            return false;
        }
        return !!(market.tradeEnabled && market.tradeEnabled[tradeKey]);
    },
    pauseActiveMarketTrade: function() {
        const market = data.progress.base && data.progress.base.market;
        const active = market && market.activeTrade;
        if (!active) {
            return;
        }
        const paused = engine.ensureMarketPausedTrades();
        paused[active.key] = {
            key: active.key,
            totalMs: active.totalMs || 0,
            remainMs: Math.max(0, active.remainMs || 0)
        };
        market.activeTrade = null;
    },
    resumeMarketTrade: function(tradeKey) {
        const market = data.progress.base && data.progress.base.market;
        const paused = engine.getPausedMarketTrade(tradeKey);
        if (!market || !paused) {
            return false;
        }
        let totalMs = paused.totalMs || 0;
        let remainMs = Math.max(0, paused.remainMs || 0);
        const retimedTotal = engine.getMarketTradeDurationMs(tradeKey);
        if (retimedTotal > 0 && totalMs > 0 && retimedTotal !== totalMs) {
            remainMs = remainMs * (retimedTotal / totalMs);
            totalMs = retimedTotal;
        }
        market.activeTrade = {
            key: tradeKey,
            totalMs: totalMs,
            remainMs: remainMs,
            paused: false
        };
        delete market.pausedTrades[tradeKey];
        return true;
    },
    startMarketTrade: function(tradeKey) {
        const market = data.progress.base && data.progress.base.market;
        const td = resortData.marketTrades[tradeKey];
        if (!market || !td) {
            return false;
        }
        if (engine.resumeMarketTrade(tradeKey)) {
            return true;
        }
        const creditCost = engine.getMarketTradeCreditCost(tradeKey);
        const cost = { credit: creditCost };
        if (!resortData.canAffordCost(cost)) {
            return false;
        }
        resortData.deductCost(cost);
        if (engine.isMarketTradingExperienceBought()) {
            engine.grantMarketExp(creditCost);
        }
        const totalMs = engine.getMarketTradeDurationMs(tradeKey);
        market.activeTrade = {
            key: tradeKey,
            totalMs: totalMs,
            remainMs: totalMs,
            paused: false
        };
        return true;
    },
    completeMarketTrade: function() {
        const market = data.progress.base && data.progress.base.market;
        const active = market && market.activeTrade;
        if (!active) {
            return;
        }
        const td = resortData.marketTrades[active.key];
        if (td) {
            const cardAdd = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
                ? (shrineCards.getAggregatedEffects().marketTradeYieldAdd || 0) : 0;
            const yieldAmt = Math.ceil((td.yieldAmount || 0) * (1 + cardAdd));
            market[active.key] = (market[active.key] || 0) + yieldAmt;
        }
        market.activeTrade = null;
        const paused = engine.ensureMarketPausedTrades();
        if (paused && paused[active.key]) {
            delete paused[active.key];
        }
        market.demandTaxExtra = engine.getMarketDemandTaxExtra() + 0.1;
    },
    updateMarketTrades: function(tickMs) {
        const market = data.progress.base && data.progress.base.market;
        if (!market || !engine.isMarketBuilt()) {
            return;
        }
        engine.decayMarketDemandTax(tickMs);
        if (!market.tradeEnabled) {
            market.tradeEnabled = {};
        }
        engine.ensureMarketPausedTrades();
        const active = market.activeTrade;
        if (active) {
            if (!engine.canMarketTradeContinue(active.key)) {
                engine.pauseActiveMarketTrade();
            } else {
                /* Re-time the remainder when the Trader count changes mid-trade. */
                const totalMs = engine.getMarketTradeDurationMs(active.key);
                if (totalMs > 0 && active.totalMs > 0 && totalMs !== active.totalMs) {
                    active.remainMs = active.remainMs * (totalMs / active.totalMs);
                    active.totalMs = totalMs;
                }
                active.paused = false;
                active.remainMs -= tickMs;
                if (active.remainMs <= 0) {
                    engine.completeMarketTrade();
                } else {
                    return;
                }
            }
        }
        if (engine.getMarketTraderCount() <= 0) {
            return;
        }
        const nextKey = engine.pickNextMarketTrade();
        if (nextKey) {
            engine.startMarketTrade(nextKey);
        }
    },
    getFreeInnCarrierDisplaySlot: function(inn) {
        const used = {};
        const carriers = inn.waterCarriers || [];
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
    getInnCarrierCapacity: function() {
        if (!engine.isInnOnsenConverted()) {
            return 0;
        }
        const inn = data.progress.base.inn;
        let cap = inn.assignedWorkers || 0;
        const okami = engine.getOkami();
        if (okami.assignedBuildingKey === "inn") {
            cap += 1;
        }
        return cap;
    },
    getInnCarriersInFlight: function() {
        return data.progress.base.inn.waterCarriers.length;
    },
    cancelInnCarriers: function() {
        const inn = data.progress.base.inn;
        const carriers = inn.waterCarriers || [];
        for (let i = 0; i < carriers.length; i++) {
            engine.refundCisternWater(carriers[i].amount || 0);
        }
        inn.waterCarriers = [];
    },
    syncInnCarriersToWorkforce: function() {
        if (!engine.isInnOnsenConverted()) {
            return;
        }
        const inn = data.progress.base.inn;
        const assigned = inn.assignedWorkers || 0;
        const okami = engine.getOkami();
        const okamiHere = okami.assignedBuildingKey === "inn";
        if (assigned <= 0 && !okamiHere) {
            engine.cancelInnCarriers();
            return;
        }
        const workerCarriers = [];
        for (let i = 0; i < (inn.waterCarriers || []).length; i++) {
            const c = inn.waterCarriers[i];
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
        for (let ci = 0; ci < (inn.waterCarriers || []).length; ci++) {
            const c = inn.waterCarriers[ci];
            if (c.isOkami) {
                if (okamiHere) {
                    next.push(c);
                } else {
                    engine.refundCisternWater(c.amount || 0);
                }
            } else if (removeIds[c.id]) {
                engine.refundCisternWater(c.amount || 0);
            } else {
                next.push(c);
            }
        }
        inn.waterCarriers = next;
    },
    trySpawnInnWaterCarrier: function() {
        if (!engine.isInnOnsenConverted()) {
            return false;
        }
        const inn = data.progress.base.inn;
        const capacity = engine.getInnCarrierCapacity();
        if (capacity <= 0) {
            return false;
        }
        if (engine.getInnCarriersInFlight() >= capacity) {
            return false;
        }
        if (engine.isInnHotWaterFull()) {
            return false;
        }
        if (!engine.isCisternWaterHotEnoughForOnsen()) {
            return false;
        }
        const cistern = data.progress.base.cistern || {};
        const carryCap = resortData.getKitsuneWaterCarryAmount();
        const room = engine.getInnHotWaterCapacity() - (inn.hotWater || 0) - engine.getCisternInboundWater("inn");
        const amount = Math.min(carryCap, cistern.waterVolume || 0, room);
        if (amount <= 0) {
            return false;
        }
        const okami = engine.getOkami();
        const okamiHere = okami.assignedBuildingKey === "inn";
        const workersBusy = engine.getInnCarriersInFlight();
        const workersOnly = inn.assignedWorkers || 0;
        let isOkami = false;
        if (okamiHere && workersBusy >= workersOnly) {
            isOkami = true;
        } else if (workersBusy >= workersOnly) {
            return false;
        }
        const from = engine.getMapBuildingPosition("cistern");
        const to = engine.getMapBuildingPosition("inn");
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        cistern.waterVolume = round1(Math.max(0, (cistern.waterVolume || 0) - amount));
        const innCarrier = {
            id: inn.carrierIdCounter || 1,
            resourceType: "water",
            amount: amount,
            isOkami: isOkami,
            progress: 0,
            displaySlot: engine.getFreeInnCarrierDisplaySlot(inn),
            fromX: from.x,
            fromY: from.y,
            toX: to.x,
            toY: to.y,
            totalDist: dist
        };
        engine.applyDirtRoadOnSpawn(innCarrier, "cistern", "inn");
        inn.waterCarriers.push(innCarrier);
        inn.carrierIdCounter = (inn.carrierIdCounter || 1) + 1;
        return true;
    },
    updateInnWaterCarriers: function(tickMs) {
        if (!engine.isInnOnsenConverted()) {
            return;
        }
        const inn = data.progress.base.inn;
        const assigned = inn.assignedWorkers || 0;
        const okami = engine.getOkami();
        if (assigned <= 0 && okami.assignedBuildingKey !== "inn") {
            engine.syncInnCarriersToWorkforce();
            return;
        }
        const carriers = inn.waterCarriers || [];
        if (!carriers.length && engine.getInnCarrierCapacity() <= 0) {
            return;
        }
        const next = [];
        for (let i = 0; i < carriers.length; i++) {
            const c = carriers[i];
            const speed = engine.getInnCarrierSpeed(c);
            c.progress = (c.progress || 0) + (speed * (tickMs / 1000)) / (c.totalDist || 1);
            if (c.progress >= 1) {
                engine.addDirtRoadProgress(c.fromKey, c.toKey);
                const cap = engine.getInnHotWaterCapacity();
                inn.hotWater = Math.min(cap, (inn.hotWater || 0) + (c.amount || 0));
            } else {
                next.push(c);
            }
        }
        inn.waterCarriers = next;
        inn._sinceLastInnCarrierMs = (inn._sinceLastInnCarrierMs || 0) + tickMs;
        const minGap = resortData.foxDenCarrierSpawnMinMs || 500;
        if (inn._sinceLastInnCarrierMs >= minGap) {
            if (engine.trySpawnInnWaterCarrier()) {
                inn._sinceLastInnCarrierMs = 0;
            }
        }
    },
    getFreeCisternCarrierDisplaySlot: function(cistern) {
        const used = {};
        const carriers = cistern.waterCarriers || [];
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
    getCisternCarrierCapacity: function() {
        if (!engine.cisternWorkersRevealed()) {
            return 0;
        }
        const cistern = data.progress.base.cistern;
        let cap = cistern.assignedWorkers || 0;
        const okami = engine.getOkami();
        if (okami.assignedBuildingKey === "cistern") {
            cap += 1;
        }
        return cap;
    },
    getCisternCarriersInFlight: function() {
        return (data.progress.base.cistern.waterCarriers || []).length;
    },
    getCisternCarrierSpeed: function(carrier) {
        const okami = engine.getOkami();
        const okamiHere = okami.assignedBuildingKey === "cistern";
        const workerSpeed = resortData.foxDenCarrierSpeed;
        if (carrier.isOkami) {
            let speed = workerSpeed * 2;
            if (okamiHere) {
                speed *= engine.getOkamiInspirationBonus();
            }
            return speed * engine.getCarrierRoadSpeedMult(carrier) * engine.getCarrierSpeedCardMultiplier();
        }
        let speed = workerSpeed;
        if (okamiHere) {
            speed *= engine.getOkamiInspirationBonus();
        }
        return speed * engine.getCarrierRoadSpeedMult(carrier) * engine.getCarrierSpeedCardMultiplier();
    },
    cancelCisternCarriers: function() {
        const cistern = data.progress.base.cistern;
        const carriers = cistern.waterCarriers || [];
        for (let i = 0; i < carriers.length; i++) {
            engine.refundCisternWater(carriers[i].amount || 0);
        }
        cistern.waterCarriers = [];
    },
    syncCisternCarriersToWorkforce: function() {
        if (!engine.cisternWorkersRevealed()) {
            return;
        }
        const cistern = data.progress.base.cistern;
        const assigned = cistern.assignedWorkers || 0;
        const okami = engine.getOkami();
        const okamiHere = okami.assignedBuildingKey === "cistern";
        if (assigned <= 0 && !okamiHere) {
            engine.cancelCisternCarriers();
            return;
        }
        const workerCarriers = [];
        for (let i = 0; i < (cistern.waterCarriers || []).length; i++) {
            const c = cistern.waterCarriers[i];
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
        for (let ci = 0; ci < (cistern.waterCarriers || []).length; ci++) {
            const c = cistern.waterCarriers[ci];
            if (c.isOkami) {
                if (okamiHere) {
                    next.push(c);
                } else {
                    engine.refundCisternWater(c.amount || 0);
                }
            } else if (removeIds[c.id]) {
                engine.refundCisternWater(c.amount || 0);
            } else {
                next.push(c);
            }
        }
        cistern.waterCarriers = next;
    },
    deliverCisternWaterToTarget: function(targetKey, amount) {
        const amt = amount || 0;
        let accepted = 0;
        if (targetKey === "inn") {
            const inn = data.progress.base.inn;
            const cap = engine.getInnHotWaterCapacity();
            const room = Math.max(0, cap - (inn.hotWater || 0));
            accepted = Math.min(amt, room);
            inn.hotWater = (inn.hotWater || 0) + accepted;
        } else if (targetKey === "noodleBar") {
            const bar = data.progress.base.noodleBar;
            if (bar) {
                const cap = engine.getNoodleBarHotWaterCapacity();
                const room = Math.max(0, cap - (bar.hotWater || 0));
                accepted = Math.min(amt, room);
                bar.hotWater = round1((bar.hotWater || 0) + accepted);
            }
        } else if (targetKey === "torii") {
            const torii = data.progress.base.torii;
            if (torii) {
                const cap = engine.getToriiWaterCapacity();
                const room = Math.max(0, cap - (torii.water || 0));
                accepted = Math.min(amt, room);
                torii.water = round1((torii.water || 0) + accepted);
            }
        }
        const leftover = amt - accepted;
        if (leftover > 0) {
            const cistern = data.progress.base && data.progress.base.cistern;
            engine.addWaterToCistern(leftover, (cistern && cistern.temperature) || 0);
        }
    },
    trySpawnCisternWaterCarrier: function() {
        if (!engine.cisternWorkersRevealed()) {
            return false;
        }
        const cistern = data.progress.base.cistern;
        const capacity = engine.getCisternCarrierCapacity();
        if (capacity <= 0) {
            return false;
        }
        if (engine.getCisternCarriersInFlight() >= capacity) {
            return false;
        }
        const targets = engine.getWaterDeliveryTargets();
        if (!targets.length) {
            return false;
        }
        const target = targets[0];
        const carryCap = resortData.getCisternWaterCarryAmount();
        const amount = Math.min(carryCap, cistern.waterVolume || 0, target.room);
        if (amount <= 0) {
            return false;
        }
        const okami = engine.getOkami();
        const okamiHere = okami.assignedBuildingKey === "cistern";
        const workersBusy = engine.getCisternCarriersInFlight();
        const workersOnly = cistern.assignedWorkers || 0;
        let isOkami = false;
        if (okamiHere && workersBusy >= workersOnly) {
            isOkami = true;
        } else if (workersBusy >= workersOnly) {
            return false;
        }
        const from = engine.getMapBuildingPosition("cistern");
        const to = engine.getMapBuildingPosition(target.key);
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        cistern.waterVolume = round1(Math.max(0, (cistern.waterVolume || 0) - amount));
        const cisternCarrier = {
            id: cistern.carrierIdCounter || 1,
            targetKey: target.key,
            resourceType: "water",
            amount: amount,
            isOkami: isOkami,
            progress: 0,
            displaySlot: engine.getFreeCisternCarrierDisplaySlot(cistern),
            fromX: from.x,
            fromY: from.y,
            toX: to.x,
            toY: to.y,
            totalDist: dist
        };
        engine.applyDirtRoadOnSpawn(cisternCarrier, "cistern", target.key);
        cistern.waterCarriers.push(cisternCarrier);
        cistern.carrierIdCounter = (cistern.carrierIdCounter || 1) + 1;
        return true;
    },
    updateCisternWaterCarriers: function(tickMs) {
        if (!engine.cisternWorkersRevealed()) {
            return;
        }
        const cistern = data.progress.base.cistern;
        const assigned = cistern.assignedWorkers || 0;
        const okami = engine.getOkami();
        if (assigned <= 0 && okami.assignedBuildingKey !== "cistern") {
            engine.syncCisternCarriersToWorkforce();
            return;
        }
        const carriers = cistern.waterCarriers || [];
        if (!carriers.length && engine.getCisternCarrierCapacity() <= 0) {
            return;
        }
        const next = [];
        for (let i = 0; i < carriers.length; i++) {
            const c = carriers[i];
            const speed = engine.getCisternCarrierSpeed(c);
            c.progress = (c.progress || 0) + (speed * (tickMs / 1000)) / (c.totalDist || 1);
            if (c.progress >= 1) {
                engine.addDirtRoadProgress(c.fromKey, c.toKey);
                engine.deliverCisternWaterToTarget(c.targetKey || "inn", c.amount || 0);
            } else {
                next.push(c);
            }
        }
        cistern.waterCarriers = next;
        cistern._sinceLastCisternCarrierMs = (cistern._sinceLastCisternCarrierMs || 0) + tickMs;
        const minGap = resortData.foxDenCarrierSpawnMinMs || 500;
        if (cistern._sinceLastCisternCarrierMs >= minGap) {
            if (engine.trySpawnCisternWaterCarrier()) {
                cistern._sinceLastCisternCarrierMs = 0;
            }
        }
    },
    createBambooStalk: function(rowCount, baseWood, stalkType) {
        const cfg = resortData.bambooForestConfig;
        const stalk = {
            type: stalkType === "hardwood" ? "hardwood" : "bamboo",
            baseWood: baseWood !== undefined ? baseWood : engine.getBambooForestBaseChips(),
            cells: []
        };
        for (let ri = 0; ri < rowCount; ri++) {
            const capacity = engine.getBambooCellCapacity(stalk, ri);
            stalk.cells.push({
                lumber: capacity,
                capacity: capacity,
                color: engine.randomStalkCellColor(stalk),
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
        return engine.getBambooStalkComputedBaseChips(stalkIndex);
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
        const bf = data.progress.base.bambooForest;
        const kitsune = bf.assignedWorkers || 0;
        const atelier = data.progress.base && data.progress.base.atelier;
        const axeBonus = (atelier && atelier.betterAxesBought) || 0;
        const sharperBonus = (atelier && atelier.sharperAxesBought) || 0;
        const okami = engine.getOkami();
        const okamiHere = okami.assignedBuildingKey === "bambooForest";
        const cutters = kitsune + (okamiHere ? 1 : 0);
        const cardAdd = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().chopPowerAdd || 0) : 0;
        const echoed = Math.pow(1.5, engine.getEchoedAxeBought());
        const raw = cutters * (1 + axeBonus) * (1 + 0.5 * sharperBonus) * (1 + cardAdd) * echoed;
        return Math.ceil(raw - 1e-9);
    },
    getBambooCutWorkerRate: function() {
        const bf = data.progress.base.bambooForest;
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
        const bf = data.progress.base.bambooForest;
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
    switchBambooStalkType: function(stalkIndex) {
        if (!engine.isGrowHardwoodBought()) {
            return;
        }
        const bf = data.progress.base && data.progress.base.bambooForest;
        if (!bf || !bf.stalks) {
            return;
        }
        const max = bf.stalkCount || 4;
        if (stalkIndex < 0 || stalkIndex >= max) {
            return;
        }
        const stalk = bf.stalks[stalkIndex];
        if (!stalk || !stalk.cells) {
            return;
        }
        stalk.type = stalk.type === "hardwood" ? "bamboo" : "hardwood";
        for (let ri = 0; ri < stalk.cells.length; ri++) {
            stalk.cells[ri].lumber = 0;
            stalk.cells[ri].growthRemainMs = 0;
        }
        stalk.baseWood = engine.getBambooStalkComputedBaseChips(stalkIndex);
        engine.refreshBambooStalkCapacities(stalk);
        for (let ri = 0; ri < stalk.cells.length; ri++) {
            stalk.cells[ri].color = engine.randomStalkCellColor(stalk);
        }
        if (bf.activeHarvestStalk === stalkIndex) {
            bf.activeHarvestStalk = null;
        }
    },
    applyBambooSpiritRemoved: function(stalkIndex) {
        const bf = data.progress.base.bambooForest;
        if (!bf.stalks || stalkIndex < 0 || stalkIndex >= bf.stalks.length) {
            return;
        }
        const stalk = bf.stalks[stalkIndex];
        let baseWood = Math.floor(engine.getBambooForestBaseChips() * engine.getBambooInfuseSoilMultiplier() * engine.getBambooSprinkleOreMultiplier());
        if (stalk.type === "hardwood") {
            baseWood *= 5;
        }
        stalk.baseWood = baseWood;
        engine.refreshBambooStalkCapacities(stalk);
        for (let ri = 0; ri < stalk.cells.length; ri++) {
            stalk.cells[ri].growthRemainMs = 0;
        }
    },
    resetBambooForestForPrestige: function() {
        const bf = data.progress.base && data.progress.base.bambooForest;
        if (!bf || !bf.stalks) {
            return;
        }
        for (let si = 0; si < bf.stalks.length; si++) {
            const stalk = bf.stalks[si];
            if (!stalk || !stalk.cells) {
                continue;
            }
            stalk.baseWood = engine.getBambooStalkComputedBaseChips(si);
            for (let ri = 0; ri < stalk.cells.length; ri++) {
                const cell = stalk.cells[ri];
                cell.lumber = 0;
                cell.growthRemainMs = 0;
                cell.color = engine.randomStalkCellColor(stalk);
            }
            engine.refreshBambooStalkCapacities(stalk);
        }
    },
    completeBambooStalkHarvest: function(bf, stalkIndex) {
        const stalk = bf.stalks[stalkIndex];
        stalk.baseWood = engine.getBambooStalkComputedBaseChips(stalkIndex);
        engine.refreshBambooStalkCapacities(stalk);
        for (let ri = 0; ri < stalk.cells.length; ri++) {
            const cell = stalk.cells[ri];
            cell.lumber = 0;
            cell.growthRemainMs = 0;
            cell.color = engine.randomStalkCellColor(stalk);
        }
        const garden = data.progress.base && data.progress.base.garden;
        const rotateOn = garden && garden.arrangementOfRotationUnlocked && bf.autoRotateHarvest;
        if (rotateOn) {
            const max = bf.stalkCount || 4;
            bf.activeHarvestStalk = (stalkIndex + 1) % max;
        } else {
            bf.activeHarvestStalk = null;
            engine.maybeFlagBambooHarvestNotify();
        }
    },
    maybeFlagBambooHarvestNotify: function() {
        const bf = data.progress.base.bambooForest;
        const kitsune = bf.assignedWorkers || 0;
        const okami = engine.getOkami();
        const okamiHere = okami.assignedBuildingKey === "bambooForest";
        if (kitsune <= 0 && !okamiHere) {
            return;
        }
        if (bf.activeHarvestStalk !== null && bf.activeHarvestStalk !== undefined) {
            return;
        }
        const garden = data.progress.base && data.progress.base.garden;
        if (garden && garden.arrangementOfRotationUnlocked && bf.autoRotateHarvest) {
            return;
        }
        if (data.progress.selectedBaseBuilding === "bambooForest" && !data.progress.selectedSpiritId) {
            return;
        }
        events.markNewBaseContent("bambooForest");
    },
    convertBambooChipsToWood: function(bf) {
        if (!bf) {
            return;
        }
        let gained = 0;
        while ((bf.chips || 0) >= 10) {
            bf.chips -= 10;
            bf.wood = (bf.wood || 0) + 1;
            gained++;
        }
        if (gained > 0 && typeof view !== "undefined" && view.spawnResourceFloat) {
            view.spawnResourceFloat("baseBuilding_bambooForest", "wood", gained, "#e1aa14");
        }
        let hardwoodGained = 0;
        while ((bf.hardwoodChips || 0) >= 50) {
            bf.hardwoodChips -= 50;
            bf.hardwood = (bf.hardwood || 0) + 1;
            hardwoodGained++;
        }
        if (hardwoodGained > 0 && typeof view !== "undefined" && view.spawnResourceFloat) {
            view.spawnResourceFloat("baseBuilding_bambooForest", "hardwood", hardwoodGained, "#a67c52");
        }
    },
    rotateBambooHarvestIfColumnEmpty: function(bf) {
        const garden = data.progress.base && data.progress.base.garden;
        if (!(garden && garden.arrangementOfRotationUnlocked && bf.autoRotateHarvest)) {
            return;
        }
        if (!bf.stalks) {
            return;
        }
        const start = bf.activeHarvestStalk;
        if (start === null || start === undefined) {
            return;
        }
        const max = bf.stalkCount || bf.stalks.length || 4;
        if (engine.getBambooCutTopCellIndex(bf.stalks[start]) >= 0) {
            return;
        }
        for (let step = 1; step < max; step++) {
            const next = (start + step) % max;
            if (engine.getBambooCutTopCellIndex(bf.stalks[next]) >= 0) {
                bf.activeHarvestStalk = next;
                return;
            }
        }
    },
    resolveBambooChop: function(stalk, mutate) {
        if (!stalk || !stalk.cells) {
            return 0;
        }
        let power = engine.getBambooChopPower();
        if (power <= 0) {
            return 0;
        }
        const carry = engine.isPowerfulChopsBought();
        let ri = engine.getBambooCutTopCellIndex(stalk);
        let chips = 0;
        while (ri >= 0 && power > 0) {
            const cell = stalk.cells[ri];
            const lumber = cell.lumber || 0;
            if (lumber <= 0) {
                ri--;
                continue;
            }
            const taken = Math.min(power, lumber);
            chips += taken;
            if (mutate) {
                cell.lumber = lumber - taken;
                if (cell.lumber <= 0) {
                    cell.lumber = 0;
                    cell.color = engine.randomStalkCellColor(stalk);
                    cell.growthRemainMs = 0;
                }
            }
            if (!carry) {
                break;
            }
            const unused = power - taken;
            if (unused <= 0) {
                break;
            }
            power = Math.floor(unused * 0.5);
            ri--;
        }
        return chips;
    },
    getBambooChipsPerChop: function() {
        const power = engine.getBambooChopPower();
        if (!engine.isPowerfulChopsBought()) {
            return power;
        }
        const bf = data.progress.base && data.progress.base.bambooForest;
        if (!bf || bf.activeHarvestStalk === null || bf.activeHarvestStalk === undefined || !bf.stalks) {
            return power;
        }
        const stalk = bf.stalks[bf.activeHarvestStalk];
        if (!stalk) {
            return power;
        }
        return engine.resolveBambooChop(stalk, false);
    },
    bambooChopActiveStalk: function(bf) {
        engine.rotateBambooHarvestIfColumnEmpty(bf);
        const stalkIndex = bf.activeHarvestStalk;
        if (stalkIndex === null || stalkIndex === undefined || !bf.stalks) {
            return;
        }
        const stalk = bf.stalks[stalkIndex];
        const chopped = engine.resolveBambooChop(stalk, true);
        if (chopped <= 0) {
            return;
        }
        if (stalk.type === "hardwood") {
            bf.hardwoodChips = (bf.hardwoodChips || 0) + chopped;
        } else {
            bf.chips = (bf.chips || 0) + chopped;
        }
        engine.convertBambooChipsToWood(bf);
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
    },
    updateBambooStalkGrowth: function(bf, stalkIndex, tickMs) {
        if (bf.activeHarvestStalk === stalkIndex && engine.getBambooChopPower() > 0) {
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
        const fullMs = cfg.cellGrowFullMs;
        const spirit = engine.getBambooStalkSpirit(stalkIndex);
        const cell = stalk.cells[growIndex];
        const cap = cell.capacity || 1;
        let lumber = cell.lumber || 0;
        if (lumber >= cap) {
            return;
        }
        const msPerWood = fullMs / cap;
        const hasWater = (bf.water || 0) >= 1;
        const hasFertilizer = engine.getMarketGoodAmount("fertilizer") > 0;
        // Segment fill time is cellGrowFullMs / this multiplier, so chip count does not change it. Hardwood is 5 minutes.
        const growthMult = (stalk.type === "hardwood" ? 0.4 : 1) * (hasWater ? 2 : 1) * (hasFertilizer ? 2 : 1);
        cell.growthRemainMs = (cell.growthRemainMs || 0) + tickMs * growthMult;
        while (cell.growthRemainMs >= msPerWood && lumber < cap) {
            if (hasWater && (bf.water || 0) < 1) {
                break;
            }
            if (hasFertilizer && engine.getMarketGoodAmount("fertilizer") < 0.1) {
                break;
            }
            cell.growthRemainMs -= msPerWood;
            lumber++;
            cell.lumber = lumber;
            if ((bf.water || 0) >= 1) {
                bf.water = round1(Math.max(0, (bf.water || 0) - 1));
            }
            if (hasFertilizer) {
                engine.tryConsumeMarketGood("fertilizer", 0.1);
            }
            if (spirit) {
                engine.grantSpiritExp(spirit, stalk.type === "hardwood" ? 0.25 : 1);
            }
        }
    },
    updateBambooForest: function(tickMs) {
        const bf = data.progress.base.bambooForest;
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
        const dtSec = tickMs / 1000;
        const okamiSegmentMult = function(segIdx) {
            return engine.getOkamiPathSegmentSpeedMultForIndex(segIdx);
        };
        if (job.phase === "travelingTo") {
            const holding = engine.pathJobUsesHalfSpeedTo(jobType);
            job.pathProgress = engine.advancePathProgress(job.pathProgress, dtSec, -1, {
                baseSpeed: engine.getOkamiPathTravelBaseSpeed(holding),
                getSegmentMult: okamiSegmentMult,
                minProgress: job.targetProgress,
                maxProgress: totalDist
            });
            if (job.pathProgress <= job.targetProgress) {
                job.pathProgress = job.targetProgress;
                if (engine.isManaCloneJob(job)) {
                    engine.beginManaCloneWeaving(job);
                } else if (engine.isCollectStoneJob(job)) {
                    engine.beginCollectStoneWait(job);
                } else {
                    engine.beginPathSegmentWeaving(job);
                }
            }
            return;
        }
        if (job.phase === "collecting") {
            job.collectRemainMs = Math.max(0, (job.collectRemainMs || 0) - tickMs);
            if (job.collectRemainMs <= 0) {
                job.phase = "returning";
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
            job.pathProgress = engine.advancePathProgress(job.pathProgress, dtSec, 1, {
                baseSpeed: engine.getOkamiPathTravelBaseSpeed(true),
                getSegmentMult: okamiSegmentMult,
                minProgress: job.targetProgress,
                maxProgress: totalDist
            });
            if (job.pathProgress >= totalDist) {
                job.pathProgress = totalDist;
                engine.completePathRemoveRocks(job.segmentIndex);
            }
            return;
        }
        if (job.phase === "returning") {
            const holdingReturn = engine.pathJobUsesHalfSpeedReturn(jobType);
            job.pathProgress = engine.advancePathProgress(job.pathProgress, dtSec, 1, {
                baseSpeed: engine.getOkamiPathTravelBaseSpeed(holdingReturn),
                getSegmentMult: okamiSegmentMult,
                minProgress: job.targetProgress,
                maxProgress: totalDist
            });
            if (job.pathProgress >= totalDist) {
                job.pathProgress = totalDist;
                if (engine.isCollectStoneJob(job)) {
                    engine.completeCollectStone();
                } else {
                    engine.completePathReturnJob(job.segmentIndex, jobType);
                }
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
        if (engine.parseFireLauncherScopeKey(scopeKey)) {
            return "atelier";
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
        if (job && !job.paused && (job.phase === "travelingTo" || job.phase === "storingRocks" || job.phase === "returning" || job.phase === "collecting")) {
            const travelDir = job.phase === "travelingTo" ? -1 : 1;
            const east = !engine.getPathTravelDirectionEast(job.pathProgress, travelDir);
            return {
                mode: "travel",
                pathProgress: job.pathProgress,
                east: east
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
            const rh = data.progress.base.foxDen;
            const okamiCarrier = (rh.constructionCarriers || []).some(function(c) { return c.isOkami; });
            if (okamiCarrier) {
                return { mode: "none" };
            }
        }
        if (assignKey === "bonfire") {
            const bf = data.progress.base.bonfire;
            const okamiCarrier = (bf.woodCarriers || []).some(function(c) { return c.isOkami; });
            if (okamiCarrier) {
                return { mode: "none" };
            }
        }
        if (assignKey === "market") {
            const market = data.progress.base.market;
            const okamiCarrier = ((market && market.creditCarriers) || []).some(function(c) { return c.isOkami; });
            if (okamiCarrier) {
                return { mode: "none" };
            }
        }
        return { mode: "site", siteKey: assignKey };
    },
    getMineStoneCount: function(depth) {
        return Math.min(5, Math.floor((depth || 0) / 2) + 1);
    },
    getMineOreCount: function(depth) {
        return Math.min(5, Math.floor(((depth || 0) + 2) / 5));
    },
    createMineBlocksForDepth: function(depth) {
        const d = depth || 0;
        const hpMult = Math.pow(1.9, d);
        const hpByType = { dirt: 15, stone: 100, ore: 500 };
        const makeBlock = function(type) {
            const maxAud = hpByType[type] * hpMult;
            return { type: type, aud: maxAud, maxAud: maxAud };
        };
        const pickUnique = function(available, count) {
            const pool = available.slice();
            const out = [];
            const n = Math.min(count, pool.length);
            for (let i = 0; i < n; i++) {
                const slot = Math.floor(Math.random() * pool.length);
                out.push(pool[slot]);
                pool.splice(slot, 1);
            }
            return out;
        };
        const blocks = [];
        const allIdx = [];
        for (let i = 0; i < 25; i++) {
            blocks.push(makeBlock("dirt"));
            allIdx.push(i);
        }
        const stoneIdx = pickUnique(allIdx, engine.getMineStoneCount(d));
        const stoneSet = {};
        for (let s = 0; s < stoneIdx.length; s++) {
            blocks[stoneIdx[s]] = makeBlock("stone");
            stoneSet[stoneIdx[s]] = true;
        }
        const dirtIdx = [];
        for (let i = 0; i < 25; i++) {
            if (!stoneSet[i]) {
                dirtIdx.push(i);
            }
        }
        const oreIdx = pickUnique(dirtIdx, engine.getMineOreCount(d));
        for (let o = 0; o < oreIdx.length; o++) {
            blocks[oreIdx[o]] = makeBlock("ore");
        }
        return blocks;
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
            total += engine.getEffectiveSpiritPower(spirits[i]) || 1;
        }
        return total * (1 + 0.2 * engine.getMineshaftBeamsBought());
    },
    getMineRemainingAud: function() {
        const mine = data.progress.base && data.progress.base.mine;
        const blocks = (mine && mine.blocks) || [];
        let total = 0;
        for (let i = 0; i < blocks.length; i++) {
            total += Math.max(0, blocks[i].aud || 0);
        }
        return total;
    },
    getMineClearEtaText: function() {
        if (engine.isMineCleared()) {
            return "Cleared";
        }
        const power = engine.getMineSpiritPower();
        if (power <= 0) {
            return "No spirits assigned";
        }
        return secondsToTime(engine.getMineRemainingAud() / power);
    },
    getMineSpiritLevelTotal: function() {
        const spirits = engine.getMineSpiritList();
        let total = 0;
        for (let i = 0; i < spirits.length; i++) {
            total += spirits[i].level || 1;
        }
        return total;
    },
    getPlayPitBought: function() {
        const mine = data.progress.base && data.progress.base.mine;
        return (mine && mine.playPitBought) || 0;
    },
    /** Same growth as Infuse Soil: +20%, then each purchase adds 5% more than the last. */
    getPlayPitDirtMultiplier: function() {
        const n = engine.getPlayPitBought();
        if (n <= 0) {
            return 1;
        }
        return 1 + 0.2 * n + 0.025 * n * (n - 1);
    },
    getMinePlayDirtPerCycle: function() {
        return engine.getMineSpiritLevelTotal() * engine.getPlayPitDirtMultiplier();
    },
    getMineFirstActiveBlock: function() {
        const mine = data.progress.base.mine;
        for (let i = 0; i < mine.blocks.length; i++) {
            if ((mine.blocks[i].aud || 0) > 0) {
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
        if (blockType === "ore") {
            const oreGain = depth >= 3 ? 10 * Math.pow(2, depth - 3) : 0;
            mine.resources.ore = (mine.resources.ore || 0) + oreGain;
            const hs = data.progress.base && data.progress.base.hiddenSpring;
            if (hs && !hs.oreMined) {
                hs.oreMined = true;
            }
            return;
        }
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
            const dealt = Math.min(block.aud || 0, remaining);
            block.aud -= dealt;
            remaining -= dealt;
            if (block.aud <= 0) {
                block.aud = 0;
                engine.grantMineBlockReward(mine, block.type);
            }
        }
    },
    updateMine: function(tickMs) {
        const mine = data.progress.base.mine;
        engine.tryAutoIncreaseMineDepth();
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
            engine.checkMineDepthReadyNotify(d);
            return;
        }
        mine.playTimerMs = (mine.playTimerMs || 0) + tickMs;
        while (mine.playTimerMs >= 5000 && (mine.resources.dirt || 0) > 0) {
            mine.playTimerMs -= 5000;
            const spirits = engine.getMineSpiritList();
            const remove = Math.min(mine.resources.dirt || 0, engine.getMinePlayDirtPerCycle());
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
                engine.checkMineDepthReadyNotify(d);
            }
        }
    },
    changeMineDepth: function(delta) {
        const mine = data.progress.base.mine;
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
        if (delta > 0) {
            if (!mine.readyConsumedByDepth) {
                mine.readyConsumedByDepth = {};
            }
            mine.readyConsumedByDepth[current] = true;
        }
        mine.currentDepth = target;
        if (mine.clearsByDepth[target] === undefined) {
            mine.clearsByDepth[target] = 0;
        }
        mine.blocks = engine.createMineBlocksForDepth(target);
        mine.playTimerMs = 0;
        return true;
    },
    tryAutoIncreaseMineDepth: function() {
        const mine = data.progress.base && data.progress.base.mine;
        if (!mine || !mine.autoIncreaseDepth) {
            return;
        }
        const depth = mine.currentDepth || 0;
        if ((mine.clearsByDepth[depth] || 0) < 10) {
            return;
        }
        if (mine.readyConsumedByDepth && mine.readyConsumedByDepth[depth]) {
            return;
        }
        engine.changeMineDepth(1);
    },
    checkMineDepthReadyNotify: function(depth) {
        const mine = data.progress.base && data.progress.base.mine;
        if (!mine) {
            return;
        }
        if ((mine.clearsByDepth[depth] || 0) < 10) {
            return;
        }
        if (!mine.readyNotifySeenByDepth) {
            mine.readyNotifySeenByDepth = {};
        }
        if (mine.readyNotifySeenByDepth[depth]) {
            return;
        }
        const consumed = mine.readyConsumedByDepth || {};
        if (consumed[depth]) {
            return;
        }
        mine.readyNotifySeenByDepth[depth] = true;
        if (typeof events !== "undefined" && events.markNewBaseContent) {
            events.markNewBaseContent("mine");
        }
    },
    getBuildingManaCapacityFallback: function(buildingKey) {
        return buildingKey === "hiddenSpring" ? 40000 : 4000;
    },
    getBuildingManaCapacity: function(buildingKey) {
        const b = data.progress.base && data.progress.base[buildingKey];
        let cap = (b && b.manaCapacity) || engine.getBuildingManaCapacityFallback(buildingKey);
        if (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects) {
            const card = shrineCards.getAggregatedEffects();
            let add = 0;
            if (buildingKey === "torii") {
                add = card.toriiManaCapacityAdd || 0;
            } else if (buildingKey === "stonePile") {
                add = card.stonePileManaCapacityAdd || 0;
            } else if (buildingKey === "inn") {
                add = card.innManaCapacityAdd || 0;
            } else if (buildingKey === "hiddenSpring") {
                add = card.hiddenSpringManaCapacityAdd || 0;
            }
            cap *= (1 + add);
        }
        return cap;
    },
    hasManaCapacityForCost: function(cost) {
        const need = (cost && cost.mana) || 0;
        if (need <= 0) {
            return true;
        }
        return engine.getManaCapacity() >= need;
    },
    getOrbBuildWallsBought: function() {
        const orb = data.progress.base && data.progress.base.mage_tower;
        return (orb && orb.buildWallsBought) || 0;
    },
    getOrbBuildStairsBought: function() {
        const orb = data.progress.base && data.progress.base.mage_tower;
        return (orb && orb.buildStairsBought) || 0;
    },
    getOrbBuildFloorBought: function() {
        const orb = data.progress.base && data.progress.base.mage_tower;
        return (orb && orb.buildFloorBought) || 0;
    },
    getOrbMaxFloors: function() {
        const cardAdd = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().higherMaxOrbFloorsFlat || 0) : 0;
        return 2 + cardAdd + engine.getOrbHeightBought();
    },
    getOrbBuildWallsMax: function() {
        return 4 + 4 * engine.getOrbBuildFloorBought();
    },
    getOrbBuildStairsMax: function() {
        return Math.min(Math.floor(engine.getOrbBuildWallsBought() / 4), engine.getOrbMaxFloors());
    },
    getOrbBuildFloorMax: function() {
        return Math.min(engine.getOrbBuildStairsBought(), engine.getOrbMaxFloors());
    },
    getOrbFloorBonusMultiplier: function() {
        return 1 + 0.1 * engine.getOrbBuildFloorBought();
    },
    getManaCapacityBonusPerCloneDispersal: function(aliveMsOpt) {
        const base = (resortData.manaCapacityBonusPerCloneDispersal !== undefined)
            ? resortData.manaCapacityBonusPerCloneDispersal : 10;
        const bf = data.progress.base && data.progress.base.bonfire;
        let amount = base;
        if (bf && bf.lingeringDensityUnlocked) {
            let dens = 0;
            if (data.battle && (data.battle.state === "running" || data.battle.state === "dead" || data.battle.state === "completed")) {
                dens = data.battle.cloneDensity || 0;
            } else if (typeof bonfire !== "undefined" && bonfire.getCloneDensity) {
                dens = bonfire.getCloneDensity();
            } else {
                dens = bf.cloneDensity || 0;
            }
            amount = base + dens;
        }
        if (bf && bf.bondGrowthUnlocked) {
            let aliveMs = aliveMsOpt;
            if (aliveMs === undefined || aliveMs === null) {
                if (data.battle && (data.battle.state === "running" || data.battle.state === "dead" || data.battle.state === "completed")) {
                    aliveMs = data.battle.cloneAliveMs !== undefined ? data.battle.cloneAliveMs : (data.battle.elapsedMs || 0);
                } else {
                    aliveMs = 0;
                }
            }
            const tens = Math.floor(Math.max(0, aliveMs) / 10000);
            if (tens > 0) {
                amount = amount * (1 + 0.1 * tens);
            }
        }
        const cardAdd = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().manaPerDeadCloneAdd || 0) : 0;
        return amount * (1 + cardAdd);
    },
    getManaBaseCapacity: function() {
        const mana = data.progress.mana;
        const base = (resortData.manaBaseCapacity !== undefined) ? resortData.manaBaseCapacity : 1000;
        return base + (mana.capacityBonus || 0);
    },
    getManaCapacity: function() {
        const orb = data.progress.base && data.progress.base.mage_tower;
        const expandBought = (orb && orb.expandOrbBought) || 0;
        const cardAdd = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().manaCapacityAdd || 0) : 0;
        return engine.getManaBaseCapacity() * Math.pow(1.1, expandBought) * engine.getOrbFloorBonusMultiplier() * (1 + cardAdd);
    },
    isManaUnlocked: function() {
        const rh = data.progress.base && data.progress.base.foxDen;
        return !!(rh && rh.unlocks && rh.unlocks.mage_tower);
    },
    hasManaOrderPrerequisite: function() {
        const base = data.progress.base;
        if (!base) {
            return false;
        }
        const inn = base.inn;
        const pile = base.stonePile;
        const torii = base.torii;
        return !!(inn && inn.gentleLightsUnlocked)
            || !!(pile && pile.stoneDuplicatorUnlocked)
            || !!(torii && torii.enticingLightsUnlocked);
    },
    isShrineBuilt: function() {
        const rh = data.progress.base && data.progress.base.foxDen;
        return !!(rh && rh.unlocks && rh.unlocks.shrine);
    },
    isPrepareToWriteLegendBought: function() {
        const shrine = data.progress.base && data.progress.base.shrine;
        return !!(shrine && shrine.prepareToWriteLegendBought);
    },
    isMarketBuilt: function() {
        const rh = data.progress.base && data.progress.base.foxDen;
        return !!(rh && rh.unlocks && rh.unlocks.market);
    },
    isNoodleBarBuilt: function() {
        const rh = data.progress.base && data.progress.base.foxDen;
        return !!(rh && rh.unlocks && rh.unlocks.noodleBar);
    },
    getNoodleBarHotWaterCapacity: function() {
        const bar = data.progress.base && data.progress.base.noodleBar;
        const base = (bar && bar.hotWaterCapacity) || 1000;
        const cistern = data.progress.base && data.progress.base.cistern;
        const bonus = ((cistern && cistern.reinforceNoodleCapacityBought) || 0) * 1500;
        return base + bonus;
    },
    isNoodleBarHotWaterFull: function() {
        const bar = data.progress.base && data.progress.base.noodleBar;
        if (!bar) {
            return true;
        }
        return (bar.hotWater || 0) >= engine.getNoodleBarHotWaterCapacity();
    },
    getNoodleCrossTalkBought: function() {
        const bar = data.progress.base && data.progress.base.noodleBar;
        return (bar && bar.crossTalkBought) || 0;
    },
    getNoodleCrossTalkChance: function() {
        return engine.getNoodleCrossTalkBought() * 0.1;
    },
    getNoodleComfyStoolsBought: function() {
        const bar = data.progress.base && data.progress.base.noodleBar;
        return (bar && bar.comfyStoolsBought) || 0;
    },
    getNoodleEatRestBonus: function() {
        return 10 + 5 * engine.getNoodleComfyStoolsBought();
    },
    getNoodleSturdyWallsBought: function() {
        const bar = data.progress.base && data.progress.base.noodleBar;
        return (bar && bar.sturdyWallsBought) || 0;
    },
    getNoodleEatDurationSeconds: function() {
        return 10 + 2 * engine.getNoodleSturdyWallsBought();
    },
    getNoodleTrophyDecorationsBought: function() {
        const bar = data.progress.base && data.progress.base.noodleBar;
        return (bar && bar.trophyDecorationsBought) || 0;
    },
    getNoodleTopicCost: function() {
        const bar = data.progress.base && data.progress.base.noodleBar;
        const presses = (bar && bar.topicPresses) || 0;
        const div = Math.pow(2, engine.getNoodleTrophyDecorationsBought());
        return round2(presses * 50000 / div);
    },
    canGuestEatNoodles: function() {
        const bar = data.progress.base && data.progress.base.noodleBar;
        const market = data.progress.base && data.progress.base.market;
        if (!engine.isNoodleBarBuilt() || !bar || !market) {
            return false;
        }
        return (bar.hotWater || 0) >= 100 && (market.driedNoodles || 0) >= 1;
    },
    tryBeginGuestEatNoodles: function() {
        const bar = data.progress.base && data.progress.base.noodleBar;
        const market = data.progress.base && data.progress.base.market;
        if (!engine.canGuestEatNoodles() || !bar || !market) {
            return false;
        }
        bar.hotWater = round1(Math.max(0, (bar.hotWater || 0) - 100));
        market.driedNoodles = Math.max(0, (market.driedNoodles || 0) - 1);
        return true;
    },
    countGuestsEatingNoodles: function() {
        const inn = data.progress.base && data.progress.base.inn;
        const guests = (inn && inn.guests) || [];
        let n = 0;
        for (let i = 0; i < guests.length; i++) {
            if (guests[i].itineraryStep === "eatNoodles") {
                n++;
            }
        }
        return n;
    },
    getNoodleTipSkillPool: function() {
        const lib = data.progress.base && data.progress.base.scrollArchives;
        const unlocked = (lib && lib.unlockedSkills) || {};
        const out = [];
        const keys = Object.keys(unlocked);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (!unlocked[key]) {
                continue;
            }
            const def = skills._byKey[key];
            if (!def) {
                continue;
            }
            if (def.category === "combat" || def.category === "class") {
                out.push(key);
            }
        }
        return out;
    },
    getNoodleSkillDisplayName: function(skillKey) {
        const skill = data.progress.skills && data.progress.skills[skillKey];
        if (skill && skill.name) {
            return skill.name;
        }
        const def = skills._byKey[skillKey];
        return (def && def.name) || skillKey;
    },
    resolveNoodleTipIfReady: function() {
        const bar = data.progress.base && data.progress.base.noodleBar;
        if (!bar || !bar.selectedTipSkillKey || (bar.tipProgress || 0) < 100) {
            return;
        }
        const selected = bar.selectedTipSkillKey;
        engine.grantTipToSkill(selected, 1);
        let line = `${engine.getNoodleSkillDisplayName(selected)} gained a tip.`;
        let extraName = "";
        const others = (bar.offeredSkillKeys || []).filter(function(key) {
            return key !== selected;
        });
        if (engine.getNoodleCrossTalkChance() > 0 && others.length && Math.random() < engine.getNoodleCrossTalkChance()) {
            const extra = others[Math.floor(Math.random() * others.length)];
            engine.grantTipToSkill(extra, 1);
            extraName = engine.getNoodleSkillDisplayName(extra);
            line = `${engine.getNoodleSkillDisplayName(selected)} gained a tip. Cross-Talk also tipped ${extraName}.`;
        }
        bar.lastTipText = line;
        bar.tipProgress = 0;
        if (typeof view !== "undefined" && view.spawnNoodleTipFloat) {
            view.spawnNoodleTipFloat(engine.getNoodleSkillDisplayName(selected));
            if (extraName) {
                view.spawnNoodleTipFloat(extraName);
            }
        }
    },
    changeNoodleConversationTopics: function() {
        const bar = data.progress.base && data.progress.base.noodleBar;
        if (!bar || !engine.isNoodleBarBuilt() || (bar.topicCooldownRemainMs || 0) > 0) {
            return false;
        }
        const pool = engine.getNoodleTipSkillPool();
        if (pool.length < 5) {
            return false;
        }
        const cost = engine.getNoodleTopicCost();
        if ((data.progress.coins || 0) < cost) {
            return false;
        }
        data.progress.coins -= cost;
        bar.topicPresses = (bar.topicPresses || 0) + 1;
        bar.topicCooldownRemainMs = 3600000;
        const bag = pool.slice();
        const picked = [];
        while (picked.length < 5 && bag.length) {
            const idx = Math.floor(Math.random() * bag.length);
            picked.push(bag.splice(idx, 1)[0]);
        }
        bar.offeredSkillKeys = picked;
        bar.selectedTipSkillKey = picked[0];
        engine.resolveNoodleTipIfReady();
        return true;
    },
    selectNoodleTipSkill: function(skillKey) {
        const bar = data.progress.base && data.progress.base.noodleBar;
        if (!bar) {
            return;
        }
        const offered = bar.offeredSkillKeys || [];
        if (offered.indexOf(skillKey) < 0) {
            return;
        }
        bar.selectedTipSkillKey = skillKey;
        engine.resolveNoodleTipIfReady();
    },
    updateNoodleBar: function(tickMs) {
        const bar = data.progress.base && data.progress.base.noodleBar;
        if (!bar || !engine.isNoodleBarBuilt()) {
            return;
        }
        if ((bar.topicCooldownRemainMs || 0) > 0) {
            bar.topicCooldownRemainMs = Math.max(0, bar.topicCooldownRemainMs - tickMs);
        }
        const eating = engine.countGuestsEatingNoodles();
        if (eating > 0) {
            const inn = data.progress.base.inn;
            const innCount = (inn && inn.guests) ? inn.guests.length : 0;
            const rate = (0.3 + innCount * 0.2 + eating * 0.5) / 3;
            bar.tipProgress = (bar.tipProgress || 0) + rate * (tickMs / 1000);
        }
        if (bar.selectedTipSkillKey) {
            engine.resolveNoodleTipIfReady();
        } else if ((bar.tipProgress || 0) > 100) {
            bar.tipProgress = 100;
        }
    },
    getMarketLevel: function() {
        const market = data.progress.base && data.progress.base.market;
        return (market && market.level) || 0;
    },
    applyMarketLevelUps: function() {
        const market = data.progress.base && data.progress.base.market;
        if (!market) {
            return;
        }
        while (market.expToLevel > 0 && market.exp >= market.expToLevel) {
            market.exp -= market.expToLevel;
            market.level = (market.level || 0) + 1;
            market.expToLevel = market.expToLevel * 4;
        }
    },
    grantMarketExp: function(amount) {
        const market = data.progress.base && data.progress.base.market;
        if (!market || !(amount > 0)) {
            return;
        }
        const cardAdd = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().marketExpAdd || 0) : 0;
        market.exp = (market.exp || 0) + amount * (1 + cardAdd);
        engine.applyMarketLevelUps();
    },
    getMarketMysticalGlovesBought: function() {
        const market = data.progress.base && data.progress.base.market;
        return (market && market.mysticalGlovesBought) || 0;
    },
    /** One pair to start, one more per Market level, hard capped at 3. */
    getMarketMysticalGlovesMax: function() {
        return Math.min(3, 1 + engine.getMarketLevel());
    },
    getMarketAnchoringRingBought: function() {
        const market = data.progress.base && data.progress.base.market;
        return (market && market.anchoringRingBought) || 0;
    },
    /** Three to start, three more per Market level, hard capped at 12. */
    getMarketAnchoringRingMax: function() {
        return Math.min(12, 3 + 3 * engine.getMarketLevel());
    },
    isMarketCookingEquipmentBought: function() {
        const market = data.progress.base && data.progress.base.market;
        return !!(market && market.cookingEquipmentBought);
    },
    isMarketTradingExperienceBought: function() {
        const market = data.progress.base && data.progress.base.market;
        return !!(market && market.tradingExperienceBought);
    },
    getMarketBuyAdvertisingBought: function() {
        const market = data.progress.base && data.progress.base.market;
        return (market && market.buyAdvertisingBought) || 0;
    },
    getMarketAdvertisingIntervalMultiplier: function() {
        return Math.pow(0.95, engine.getMarketBuyAdvertisingBought());
    },
    canStartExchangeCredit: function() {
        if (!engine.isMarketBuilt()) {
            return false;
        }
        return (data.progress.coins || 0) >= 1000;
    },
    isExchangeRepeatWhenReadyEnabled: function() {
        const garden = data.progress.base && data.progress.base.garden;
        const market = data.progress.base && data.progress.base.market;
        return !!(garden && garden.arrangementOfPaperMoneyUnlocked && market && market.repeatExchangeWhenReady);
    },
    tryAutoRepeatExchangeCredit: function() {
        if (!engine.isExchangeRepeatWhenReadyEnabled() || !engine.canStartExchangeCredit()) {
            return false;
        }
        return engine.startExchangeCredit();
    },
    startExchangeCredit: function() {
        if (!engine.canStartExchangeCredit()) {
            return false;
        }
        data.progress.coins = Math.max(0, (data.progress.coins || 0) - 1000);
        const up = engine.getUpgradeDef("market", "exchangeCredit");
        const ok = engine.startWeaving("market", "exchangeCredit", up);
        if (!ok) {
            data.progress.coins = (data.progress.coins || 0) + 1000;
            return false;
        }
        return true;
    },
    completeExchangeCredit: function() {
        const market = data.progress.base && data.progress.base.market;
        if (!market) {
            return;
        }
        market.credit = (market.credit || 0) + 1000;
        engine.grantMarketExp(1000);
    },
    getLiteracyLessonsBought: function() {
        const market = data.progress.base && data.progress.base.market;
        return (market && market.literacyLessonsBought) || 0;
    },
    getLiteracyLessonsMax: function() {
        return 3 + 3 * Math.max(0, engine.getMarketLevel() - 2);
    },
    getLiteracyResearchMultiplier: function() {
        return Math.pow(1.2, engine.getLiteracyLessonsBought());
    },
    isForgingInstructionsBought: function() {
        const market = data.progress.base && data.progress.base.market;
        return !!(market && market.forgingInstructionsBought);
    },
    isLauncherDesignsBought: function() {
        const market = data.progress.base && data.progress.base.market;
        return !!(market && market.launcherDesignsBought);
    },
    getArsonistJournalsBought: function() {
        const market = data.progress.base && data.progress.base.market;
        return (market && market.arsonistJournalsBought) || 0;
    },
    getLostScrollsBought: function() {
        const market = data.progress.base && data.progress.base.market;
        return (market && market.lostScrollsBought) || 0;
    },
    getLostScrollsMax: function() {
        return 1 + Math.max(0, engine.getMarketLevel() - 3);
    },
    getLargerForgeBought: function() {
        const atelier = data.progress.base && data.progress.base.atelier;
        return (atelier && atelier.largerForgeBought) || 0;
    },
    getForgeSmeltBatch: function(spirit) {
        const power = engine.getEffectiveSpiritPower(spirit) || 1;
        const root = Math.sqrt(power);
        const n = engine.getLargerForgeBought();
        if (n <= 0) {
            return Math.floor(root);
        }
        return Math.ceil(root * (1 + 0.5 * n));
    },
    getMarketGoodAmount: function(tradeKey) {
        const market = data.progress.base && data.progress.base.market;
        if (!market || !engine.isMarketBuilt()) {
            return 0;
        }
        return market[tradeKey] || 0;
    },
    /** Spend a stocked trade good; returns false and changes nothing when short. */
    tryConsumeMarketGood: function(tradeKey, amount) {
        const market = data.progress.base && data.progress.base.market;
        const need = amount || 0;
        if (!market || !engine.isMarketBuilt() || need <= 0) {
            return false;
        }
        if ((market[tradeKey] || 0) < need) {
            return false;
        }
        market[tradeKey] = round2((market[tradeKey] || 0) - need);
        return true;
    },
    getEarnedSkillStarCounts: function() {
        const pool = (data.progress && data.progress.stars) || {};
        let bronze = Math.max(0, Math.floor(pool.bronze || 0));
        let silver = Math.max(0, Math.floor(pool.silver || 0));
        let gold = Math.max(0, Math.floor(pool.gold || 0));
        const skills = (data.progress && data.progress.skills) || {};
        const keys = Object.keys(skills);
        for (let i = 0; i < keys.length; i++) {
            const stars = skills[keys[i]] && skills[keys[i]].stars;
            if (!stars) {
                continue;
            }
            if (stars.bronze) {
                bronze++;
            }
            if (stars.silver) {
                silver++;
            }
            if (stars.gold) {
                gold++;
            }
        }
        return { bronze: bronze, silver: silver, gold: gold };
    },
    getShrineStarScore: function() {
        const c = engine.getEarnedSkillStarCounts();
        return c.bronze + 2 * c.silver + 4 * c.gold;
    },
    getTotalEarnedStarsCount: function() {
        const c = engine.getEarnedSkillStarCounts();
        return c.bronze + c.silver + c.gold;
    },
    getTotalEarnedGoldStars: function() {
        return engine.getEarnedSkillStarCounts().gold;
    },
    getTotalTalentLevels: function() {
        const skills = (data.progress && data.progress.skills) || {};
        const keys = Object.keys(skills);
        let sum = 0;
        for (let i = 0; i < keys.length; i++) {
            sum += Math.floor((skills[keys[i]] && skills[keys[i]].talentLevel) || 0);
        }
        return sum;
    },
    getShrineContinuousLevelProgress: function() {
        const shrine = data.progress.base && data.progress.base.shrine;
        if (!shrine) {
            return 0;
        }
        const level = shrine.level || 0;
        const exp = shrine.exp || 0;
        const need = shrine.expToLevel || 10000;
        const frac = need > 0 ? Math.max(0, Math.min(1, exp / need)) : 0;
        return level + frac;
    },
    getMineHighestDepthReached: function() {
        const mine = data.progress.base && data.progress.base.mine;
        if (!mine) {
            return 0;
        }
        let maxD = Math.floor(mine.currentDepth || 0);
        const clears = mine.clearsByDepth || {};
        const keys = Object.keys(clears);
        for (let i = 0; i < keys.length; i++) {
            const d = parseInt(keys[i], 10);
            if (!isNaN(d) && d > maxD) {
                maxD = d;
            }
        }
        return maxD;
    },
    ensurePackSourceQueues: function() {
        const progress = data.progress;
        if (!progress) {
            return { common: [], rare: [], epic: [] };
        }
        if (!progress.packSourceQueues) {
            progress.packSourceQueues = { common: [], rare: [], epic: [] };
        }
        const queues = progress.packSourceQueues;
        if (!Array.isArray(queues.common)) {
            queues.common = [];
        }
        if (!Array.isArray(queues.rare)) {
            queues.rare = [];
        }
        if (!Array.isArray(queues.epic)) {
            queues.epic = [];
        }
        return queues;
    },
    notePackSource: function(rarity, source) {
        if (rarity !== "common" && rarity !== "rare" && rarity !== "epic") {
            return;
        }
        engine.ensurePackSourceQueues()[rarity].push(source || "milestone");
    },
    shiftPackSource: function(rarity) {
        const list = engine.ensurePackSourceQueues()[rarity];
        if (!list || !list.length) {
            return "carried";
        }
        return list.shift();
    },
    legacyRunPackTotal: function(source) {
        const progress = data.progress || {};
        const cards = progress.prestigeRunCards || {};
        const list = source === "bought" ? cards.bought : cards.milestone;
        let n = Array.isArray(list) ? list.length : 0;
        const queues = progress.packSourceQueues || {};
        const rarities = ["common", "rare", "epic"];
        for (let i = 0; i < rarities.length; i++) {
            const queued = queues[rarities[i]] || [];
            for (let j = 0; j < queued.length; j++) {
                if (queued[j] === source) {
                    n++;
                }
            }
        }
        const shrine = progress.base && progress.base.shrine;
        const openPack = shrine && shrine.prestigeSession && shrine.prestigeSession.openPack;
        if (openPack && openPack.source === source) {
            n++;
        }
        return n;
    },
    ensurePrestigeRunPacks: function() {
        const progress = data.progress;
        if (!progress) {
            return;
        }
        const packs = progress.prestigeRunPacks;
        if (packs && typeof packs.milestone === "number" && typeof packs.bought === "number") {
            return;
        }
        progress.prestigeRunPacks = {
            milestone: engine.legacyRunPackTotal("milestone"),
            bought: engine.legacyRunPackTotal("bought")
        };
    },
    ensureSecondsPlayedTotal: function() {
        const progress = data.progress;
        if (!progress || typeof progress.secondsPlayedTotal === "number") {
            return;
        }
        let total = 0;
        const history = progress.prestigeHistory || [];
        for (let i = 0; i < history.length; i++) {
            total += Math.max(0, Math.floor((history[i] && history[i].seconds) || 0));
        }
        let current = progress.secondsThisResort;
        if (typeof current !== "number") {
            current = (data.currentGameState && data.currentGameState.secondsPassed) || 0;
        }
        progress.secondsPlayedTotal = total + Math.max(0, Math.floor(current));
    },
    seedCarriedPackSources: function() {
        const shrine = data.progress.base && data.progress.base.shrine;
        const packs = (shrine && shrine.packs) || {};
        const queues = { common: [], rare: [], epic: [] };
        const rarities = ["common", "rare", "epic"];
        for (let i = 0; i < rarities.length; i++) {
            const rarity = rarities[i];
            const count = Math.max(0, Math.floor(packs[rarity] || 0));
            for (let c = 0; c < count; c++) {
                queues[rarity].push("carried");
            }
        }
        data.progress.packSourceQueues = queues;
    },
    grantShrinePack: function(rarity, source) {
        const shrine = data.progress.base && data.progress.base.shrine;
        if (!shrine) {
            return;
        }
        if (!shrine.packs) {
            shrine.packs = { common: 0, rare: 0, epic: 0 };
        }
        if (rarity !== "common" && rarity !== "rare" && rarity !== "epic") {
            return;
        }
        shrine.packs[rarity] = (shrine.packs[rarity] || 0) + 1;
        const src = source || "milestone";
        engine.ensurePrestigeRunPacks();
        engine.notePackSource(rarity, src);
        if (src === "milestone" || src === "bought") {
            data.progress.prestigeRunPacks[src] = Math.max(0, Math.floor(data.progress.prestigeRunPacks[src] || 0)) + 1;
        }
    },
    shrineLevelMilestoneThresholds: [1, 3, 6, 10, 15, 21, 27],
    shrineLevelMilestonePacks: ["common", "common", "common", "rare", "rare", "epic", "epic"],
    getFixedMilestoneFillPct: function(progress, thresholds) {
        const n = thresholds.length;
        if (n === 0) {
            return 0;
        }
        if (progress <= 0) {
            return 0;
        }
        if (progress >= thresholds[n - 1]) {
            return 100;
        }
        const pos = function(i) {
            return ((i + 1) / n) * 100;
        };
        if (progress < thresholds[0]) {
            return (progress / thresholds[0]) * pos(0);
        }
        for (let i = 0; i < n - 1; i++) {
            if (progress < thresholds[i + 1]) {
                const t0 = thresholds[i];
                const t1 = thresholds[i + 1];
                const frac = (t1 > t0) ? (progress - t0) / (t1 - t0) : 1;
                return pos(i) + frac * (pos(i + 1) - pos(i));
            }
        }
        return 100;
    },
    getShrineKarmaRate: function() {
        if (!engine.isShrineBuilt()) {
            return 0;
        }
        const okami = engine.getOkami();
        const okamiLevel = (okami && okami.level) || 0;
        const tails = engine.getOkamiTails(okamiLevel);
        let rate = (engine.getTotalTalentLevels() * engine.getShrineStarScore() * engine.getSpiritTotalLevels() * okamiLevel * tails) / 10000000;
        if (engine.isKarmaStackingBought()) {
            rate *= Math.pow(2, engine.getLegendsWritten());
        }
        return rate;
    },
    getShrineEscalatingRarity: function(id, req) {
        if (id === "marketLevel") {
            return req === 4 ? "common" : "rare";
        }
        if (id === "depthReached") {
            return (req === 10 || req === 12) ? "common" : "rare";
        }
        if (id === "orbLevel") {
            return "rare";
        }
        if (id === "divinityAmount") {
            if (req === 30000) {
                return "common";
            }
            if (req === 60000) {
                return "rare";
            }
            return "epic";
        }
        if (id === "totalGoldStars") {
            return req <= 3 ? "rare" : "epic";
        }
        return "rare";
    },
    getShrineRepeatingMilestoneSpec: function(id) {
        if (id === "marketLevel") {
            return {
                reqKey: "marketLevelReq",
                start: 4,
                bump: function(r) { return r + 1; },
                rarity: function(r) { return engine.getShrineEscalatingRarity("marketLevel", r); }
            };
        }
        if (id === "depthReached") {
            return {
                reqKey: "depthReachedReq",
                start: 10,
                bump: function(r) { return r === 10 ? 12 : r + 3; },
                rarity: function(r) { return engine.getShrineEscalatingRarity("depthReached", r); }
            };
        }
        if (id === "orbLevel") {
            return {
                reqKey: "orbLevelReq",
                start: 35,
                bump: function(r) { return r + 5; },
                rarity: function(r) { return engine.getShrineEscalatingRarity("orbLevel", r); }
            };
        }
        if (id === "essenceMade") {
            return {
                reqKey: "essenceMadeReq",
                start: 10000,
                bump: function(r) { return r * 10; },
                rarity: "rare"
            };
        }
        if (id === "maxMana") {
            return {
                reqKey: "maxManaReq",
                start: 200000,
                bump: function(r) { return Math.round(r * 1.5); },
                rarity: "rare"
            };
        }
        if (id === "divinityAmount") {
            return {
                reqKey: "divinityAmountReq",
                start: 30000,
                bump: function(r) {
                    if (r === 30000) {
                        return 60000;
                    }
                    if (r === 60000) {
                        return 100000;
                    }
                    return Math.round(r * 1.3);
                },
                rarity: function(r) { return engine.getShrineEscalatingRarity("divinityAmount", r); }
            };
        }
        if (id === "totalGoldStars") {
            return {
                reqKey: "totalGoldStarsReq",
                start: 1,
                bump: function(r) { return r + 2; },
                rarity: function(r) { return engine.getShrineEscalatingRarity("totalGoldStars", r); }
            };
        }
        return null;
    },
    getShrineRepeatingCompletedCount: function(id) {
        const spec = engine.getShrineRepeatingMilestoneSpec(id);
        if (!spec) {
            return 0;
        }
        const shrine = data.progress.base && data.progress.base.shrine;
        const ms = (shrine && shrine.milestones) || {};
        const target = ms[spec.reqKey];
        if (typeof target !== "number") {
            return 0;
        }
        let req = spec.start;
        let count = 0;
        while (req < target && count < 10000) {
            const next = spec.bump(req);
            if (!(next > req)) {
                break;
            }
            req = next;
            count++;
        }
        return count;
    },
    updateShrineMilestones: function() {
        if (!engine.isShrineBuilt()) {
            return;
        }
        const shrine = data.progress.base && data.progress.base.shrine;
        if (!shrine) {
            return;
        }
        if (!shrine.milestones) {
            shrine.milestones = {};
        }
        const ms = shrine.milestones;
        if (!ms.shrineLevelClaimed) {
            ms.shrineLevelClaimed = {};
        }
        if (!ms.totalStarsClaimed) {
            ms.totalStarsClaimed = {};
        }
        if (!ms.okamiLevelClaimed) {
            ms.okamiLevelClaimed = {};
        }
        if (ms.marketLevelReq === undefined || ms.marketLevelReq === null) {
            ms.marketLevelReq = 4;
        }
        if (ms.depthReachedReq === undefined || ms.depthReachedReq === null) {
            ms.depthReachedReq = 10;
        }
        if (ms.orbLevelReq === undefined || ms.orbLevelReq === null) {
            ms.orbLevelReq = 35;
        }
        if (ms.essenceMadeReq === undefined || ms.essenceMadeReq === null) {
            ms.essenceMadeReq = 10000;
        }
        if (ms.maxManaReq === undefined || ms.maxManaReq === null) {
            ms.maxManaReq = 200000;
        }
        if (ms.divinityAmountReq === undefined || ms.divinityAmountReq === null) {
            ms.divinityAmountReq = 30000;
        }
        if (ms.totalGoldStarsReq === undefined || ms.totalGoldStarsReq === null) {
            ms.totalGoldStarsReq = 1;
        }
        if (!ms.milestoneCurveMigrated) {
            if (ms.depthReachedReq === 12) {
                ms.depthReachedReq = 10;
            }
            if (ms.orbLevelReq === 40) {
                ms.orbLevelReq = 35;
            }
            if (ms.divinityAmountReq === 100000) {
                ms.divinityAmountReq = 30000;
            }
            const goldReq = ms.totalGoldStarsReq;
            if (typeof goldReq === "number" && goldReq !== 1 && (goldReq - 1) % 3 === 0) {
                const lastClaimed = goldReq - 3;
                let next = 1;
                while (next <= lastClaimed) {
                    next += 2;
                }
                ms.totalGoldStarsReq = next;
            }
            ms.milestoneCurveMigrated = true;
        }

        const claimFixed = function(claimedKey, progress, thresholds, packs) {
            if (!ms[claimedKey]) {
                ms[claimedKey] = {};
            }
            const claimed = ms[claimedKey];
            for (let i = 0; i < thresholds.length; i++) {
                const t = thresholds[i];
                const key = String(t);
                if (!claimed[key] && progress >= t) {
                    claimed[key] = true;
                    engine.grantShrinePack(packs[i]);
                }
            }
        };

        if (!ms.shrineLevelThresholdsV2) {
            const claimedLevels = ms.shrineLevelClaimed;
            const oldThresholds = [1, 2, 4, 7, 11, 16, 22];
            const newThresholds = engine.shrineLevelMilestoneThresholds;
            const levelProgress = engine.getShrineContinuousLevelProgress();
            for (let si = 0; si < newThresholds.length; si++) {
                const oldKey = String(oldThresholds[si]);
                const newKey = String(newThresholds[si]);
                if (claimedLevels[oldKey] && levelProgress >= newThresholds[si]) {
                    claimedLevels[newKey] = true;
                }
                if (oldKey !== newKey) {
                    delete claimedLevels[oldKey];
                }
            }
            ms.shrineLevelThresholdsV2 = true;
        }

        claimFixed("shrineLevelClaimed", engine.getShrineContinuousLevelProgress(), engine.shrineLevelMilestoneThresholds, engine.shrineLevelMilestonePacks);
        claimFixed("totalStarsClaimed", engine.getTotalEarnedStarsCount(), [5, 10, 15, 20, 25, 30], ["common", "common", "common", "rare", "rare", "epic"]);
        const okami = engine.getOkami();
        claimFixed("okamiLevelClaimed", (okami && okami.level) || 0, [10, 20, 30, 40, 50, 60, 70, 80], ["common", "common", "rare", "rare", "epic", "epic", "epic", "epic"]);

        const claimEscalating = function(cur, reqKey, bumpFn, rarity) {
            if (ms[reqKey] === undefined || ms[reqKey] === null) {
                return;
            }
            let guard = 0;
            while (cur >= ms[reqKey] && guard < 100) {
                const rarityNow = typeof rarity === "function" ? rarity(ms[reqKey]) : rarity;
                engine.grantShrinePack(rarityNow);
                ms[reqKey] = bumpFn(ms[reqKey]);
                guard++;
            }
        };

        const claimRepeating = function(id, cur) {
            const spec = engine.getShrineRepeatingMilestoneSpec(id);
            if (!spec) {
                return;
            }
            claimEscalating(cur, spec.reqKey, spec.bump, spec.rarity);
        };

        const market = data.progress.base && data.progress.base.market;
        claimRepeating("marketLevel", (market && market.level) || 0);
        claimRepeating("depthReached", engine.getMineHighestDepthReached());

        const orb = data.progress.base && data.progress.base.mage_tower;
        claimRepeating("orbLevel", (orb && orb.level) || 0);
        claimRepeating("essenceMade", data.progress.essenceMade || 0);
        claimRepeating("maxMana", engine.getManaCapacity());

        const divinity = data.progress.divinity;
        claimRepeating("divinityAmount", (divinity && divinity.amount) || 0);
        claimRepeating("totalGoldStars", engine.getTotalEarnedGoldStars());

        if (!ms.buildShrineClaimed) {
            ms.buildShrineClaimed = true;
            engine.grantShrinePack("epic");
        }
    },
    getLegendsWritten: function() {
        return Math.max(0, Math.floor((data.progress && data.progress.legendsWritten) || 0));
    },
    getLegendOkamiExpMultiplier: function() {
        return engine.getLegendsWritten() >= 2 ? 1.5 : 1;
    },
    getShrineUpgradeBought: function(field) {
        const shrine = data.progress.base && data.progress.base.shrine;
        return (shrine && shrine[field]) || 0;
    },
    getShardEchoesBought: function() {
        return engine.getShrineUpgradeBought("shardEchoesBought");
    },
    getArtAppreciationBought: function() {
        return engine.getShrineUpgradeBought("artAppreciationBought");
    },
    getLanguageEchoesBought: function() {
        return engine.getShrineUpgradeBought("languageEchoesBought");
    },
    getSkillEchoesBought: function() {
        return engine.getShrineUpgradeBought("skillEchoesBought");
    },
    getSpiritWeavingEchoesBought: function() {
        return engine.getShrineUpgradeBought("spiritWeavingEchoesBought");
    },
    isKarmaStackingBought: function() {
        return engine.getShrineUpgradeBought("karmaStackingBought") > 0;
    },
    isPowerfulChopsBought: function() {
        return engine.getShrineUpgradeBought("powerfulChopsBought") > 0;
    },
    isAxeEchoesBought: function() {
        return engine.getShrineUpgradeBought("axeEchoesBought") > 0;
    },
    isShelvingEchoesBought: function() {
        return engine.getShrineUpgradeBought("shelvingEchoesBought") > 0;
    },
    isPlantAffinityBought: function() {
        return engine.getShrineUpgradeBought("plantAffinityBought") > 0;
    },
    isEarthAffinityBought: function() {
        return engine.getShrineUpgradeBought("earthAffinityBought") > 0;
    },
    isHardenBambooBought: function() {
        return engine.getShrineUpgradeBought("hardenBambooBought") > 0;
    },
    isScribingInfusionsBought: function() {
        return engine.getShrineUpgradeBought("scribingInfusionsBought") > 0;
    },
    isShardsFoundBought: function() {
        return engine.getShrineUpgradeBought("shardsFoundBought") > 0;
    },
    isTradingContractsBought: function() {
        return engine.getShrineUpgradeBought("tradingContractsBought") > 0;
    },
    isResourceProtectionBought: function() {
        return engine.getShrineUpgradeBought("resourceProtectionBought") > 0;
    },
    isDealMakingBought: function() {
        return engine.getShrineUpgradeBought("dealMakingBought") > 0;
    },
    getOrbHeightBought: function() {
        return engine.getShrineUpgradeBought("orbHeightBought");
    },
    isSkyAppreciationBought: function() {
        return engine.getShrineUpgradeBought("skyAppreciationBought") > 0;
    },
    getShrineHaulKeep: function(resourceType) {
        const shrine = data.progress.base && data.progress.base.shrine;
        const field = resourceType === "stone" ? "haulKeepStone"
            : resourceType === "wood" ? "haulKeepWood"
            : resourceType === "hardwood" ? "haulKeepHardwood"
            : resourceType === "bars" ? "haulKeepBars"
            : "";
        if (!shrine || !field) {
            return 0;
        }
        return Math.max(0, Math.floor(shrine[field] || 0));
    },
    setShrineHaulKeep: function(resourceType, value) {
        const shrine = data.progress.base && data.progress.base.shrine;
        const field = resourceType === "stone" ? "haulKeepStone"
            : resourceType === "wood" ? "haulKeepWood"
            : resourceType === "hardwood" ? "haulKeepHardwood"
            : resourceType === "bars" ? "haulKeepBars"
            : "";
        if (!shrine || !field) {
            return;
        }
        shrine[field] = Math.max(0, Math.floor(Number(value) || 0));
    },
    isMapTourOptionOn: function(arrangementField, shrineField) {
        const garden = data.progress.base && data.progress.base.garden;
        const shrine = data.progress.base && data.progress.base.shrine;
        return !!(garden && garden[arrangementField] && shrine && shrine[shrineField]);
    },
    countPlantSpirits: function() {
        const hs = data.progress.base && data.progress.base.hiddenSpring;
        const spirits = (hs && hs.spirits) || [];
        let n = 0;
        for (let i = 0; i < spirits.length; i++) {
            if (spirits[i] && spirits[i].kind === "plant") {
                n++;
            }
        }
        return n;
    },
    getNurturePlantSpiritMax: function() {
        const cfg = resortData.bambooForestConfig || {};
        const base = (cfg.plantSpiritMax || 3) + (engine.isPlantAffinityBought() ? 1 : 0);
        const torii = data.progress.base && data.progress.base.torii;
        const bought = (torii && torii.plantSpiritsBought) || 0;
        const slots = cfg.stalkCount || 4;
        const free = Math.max(0, slots - engine.countPlantSpirits());
        return Math.min(base, bought + free);
    },
    hasFirstEarthSpirit: function() {
        const hs = data.progress.base && data.progress.base.hiddenSpring;
        if (!hs) {
            return false;
        }
        return (hs.earthSpiritsBought || 0) > 0 || !!hs.earthAffinityGranted;
    },
    grantEarthAffinitySpirit: function() {
        const shrine = data.progress.base && data.progress.base.shrine;
        const hs = data.progress.base && data.progress.base.hiddenSpring;
        if (!shrine || !hs || !shrine.earthAffinityBought || hs.earthAffinityGranted) {
            return;
        }
        if (!engine.assembleExtraSpirit("earth")) {
            return;
        }
        hs.earthAffinityGranted = true;
    },
    getInfuseScribingsBought: function() {
        const lib = data.progress.base && data.progress.base.scrollArchives;
        return (lib && lib.infuseScribingsBought) || 0;
    },
    getInfuseScribingsMultiplier: function() {
        return Math.pow(1.5, engine.getInfuseScribingsBought());
    },
    getEchoedAxeBought: function() {
        const bf = data.progress.base && data.progress.base.bambooForest;
        return (bf && bf.echoedAxeBought) || 0;
    },
    getEchoedShelvingBought: function() {
        const pile = data.progress.base && data.progress.base.stonePile;
        return (pile && pile.echoedShelvingBought) || 0;
    },
    applyEchoedShelving: function(amount) {
        const n = Math.max(0, amount || 0);
        const bought = engine.getEchoedShelvingBought();
        if (bought <= 0) {
            return n;
        }
        return Math.ceil(n * Math.pow(1.25, bought) - 1e-9);
    },
    getCollectShardsMax: function() {
        return 5 + engine.getShardEchoesBought();
    },
    getLanguageEchoesMax: function() {
        return Math.min(10, engine.getLegendsWritten());
    },
    collectShardsPurchaseInProgress: function() {
        const rh = data.progress.base && data.progress.base.foxDen;
        if (rh && rh.upgradeGatherJobs && engine.getUpgradeGatherJob("scrollArchives", "collectShards")) {
            return true;
        }
        if (!data.progress.weaving) {
            return false;
        }
        const weaving = engine.getWeavingState();
        const active = weaving.active;
        if (active && active.scopeKey === "scrollArchives" && active.upgradeKey === "collectShards") {
            return true;
        }
        return !!engine.getPausedWeavingEntry("scrollArchives", "collectShards");
    },
    cancelCollectShardsInProgress: function() {
        const rh = data.progress.base && data.progress.base.foxDen;
        if (rh && rh.upgradeGatherJobs && rh.jobQueue) {
            const jobKey = engine.getUpgradeGatherJobKey("scrollArchives", "collectShards");
            if (rh.upgradeGatherJobs[jobKey]) {
                engine.removeUpgradeGatherJob("scrollArchives", "collectShards");
            }
        }
        if (!data.progress.weaving) {
            return;
        }
        const weaving = engine.getWeavingState();
        const key = engine.getWeavingJobKey("scrollArchives", "collectShards");
        if (weaving.active && weaving.active.scopeKey === "scrollArchives" && weaving.active.upgradeKey === "collectShards") {
            weaving.active = null;
        }
        if (weaving.paused && weaving.paused[key]) {
            delete weaving.paused[key];
        }
    },
    refundCollectShardsAboveCap: function() {
        const lib = data.progress.base && data.progress.base.scrollArchives;
        if (!lib) {
            return;
        }
        const max = engine.getCollectShardsMax();
        const refundIndex = function(n) {
            const mult = Math.pow(2, n);
            data.progress.coins = (data.progress.coins || 0) + 800 * mult;
            data.progress.starBeads = (data.progress.starBeads || 0) + 1000 * mult;
        };
        const level = lib.collectShardsLevel || 0;
        if (engine.collectShardsPurchaseInProgress() && level >= max) {
            refundIndex(level);
            engine.cancelCollectShardsInProgress();
        }
        const current = lib.collectShardsLevel || 0;
        if (current > max) {
            for (let n = max; n < current; n++) {
                refundIndex(n);
            }
            lib.collectShardsLevel = max;
        }
    },
    getShrineDivinityMultiplier: function() {
        return engine.getLegendsWritten() >= 1 ? 2 : 1;
    },
    getShrineDivinityRate: function() {
        if (!engine.isShrineBuilt()) {
            return 0;
        }
        const shrine = data.progress.base && data.progress.base.shrine;
        return ((shrine && shrine.level) || 0) * 0.1 * engine.getShrineDivinityMultiplier();
    },
    applyShrineLevelUps: function() {
        const shrine = data.progress.base && data.progress.base.shrine;
        if (!shrine) {
            return;
        }
        while (shrine.expToLevel > 0 && shrine.exp >= shrine.expToLevel) {
            shrine.exp -= shrine.expToLevel;
            shrine.level = (shrine.level || 0) + 1;
            shrine.expToLevel = shrine.expToLevel * 1.5;
        }
    },
    updateShrineKarmaPerSecond: function() {
        if (!engine.isShrineBuilt()) {
            return;
        }
        const shrine = data.progress.base && data.progress.base.shrine;
        if (!shrine) {
            return;
        }
        shrine.exp = (shrine.exp || 0) + engine.getShrineKarmaRate();
        engine.applyShrineLevelUps();
    },
    updateDivinityPerSecond: function() {
        if (!engine.isShrineBuilt()) {
            return;
        }
        const divinity = data.progress.divinity;
        if (!divinity) {
            return;
        }
        const cap = (divinity.capacity === undefined || divinity.capacity === null) ? 50000 : divinity.capacity;
        const rate = engine.getShrineDivinityRate();
        divinity.amount = Math.min(cap, (divinity.amount || 0) + rate);
    },
    getSpiritTotalLevels: function() {
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
    getOrbWorkerUnits: function() {
        const orb = data.progress.base && data.progress.base.mage_tower;
        if (!orb) {
            return 0;
        }
        let units = orb.assignedWorkers || 0;
        const okami = engine.getOkami();
        if (okami.assignedBuildingKey === "mage_tower") {
            units += 1;
        }
        return units;
    },
    getOrbExpGainPerSecond: function() {
        if (!engine.isManaUnlocked()) {
            return 0;
        }
        const base = engine.getSpiritTotalLevels();
        const units = engine.getOrbWorkerUnits();
        const walls = engine.getOrbBuildWallsBought();
        const stairs = engine.getOrbBuildStairsBought();
        const cardAdd = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().orbExpAdd || 0) : 0;
        return base * (1 + 0.2 * units) * (1 + 0.1 * walls) * (1 + 0.2 * stairs) * (1 + cardAdd);
    },
    getOrbSpinCurrentsMultiplier: function() {
        const orb = data.progress.base && data.progress.base.mage_tower;
        const n = (orb && orb.spinCurrentsBought) || 0;
        return Math.pow(1.05, n);
    },
    getEffectiveManaRatePerSecond: function() {
        if (!engine.isManaUnlocked()) {
            return 0;
        }
        const orb = data.progress.base && data.progress.base.mage_tower;
        let rate = (orb && orb.level) || 0;
        rate *= engine.getOrbSpinCurrentsMultiplier();
        if (typeof bonfire !== "undefined") {
            const bf = data.progress.base.bonfire;
            rate *= bonfire.getManaGainBonusMultiplier((bf && bf.heat) || 0);
        }
        const okami = engine.getOkami();
        if (okami.assignedBuildingKey === "mage_tower") {
            rate *= engine.getOkamiInspirationBonus();
        }
        rate *= engine.getOrbFloorBonusMultiplier();
        const cardAdd = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().manaRegenAdd || 0) : 0;
        rate *= (1 + cardAdd);
        return rate;
    },
    updateOrbExpPerSecond: function() {
        if (!engine.isManaUnlocked()) {
            return;
        }
        const orb = data.progress.base.mage_tower;
        orb.exp = (orb.exp || 0) + engine.getOrbExpGainPerSecond();
        while (orb.expToLevel > 0 && orb.exp >= orb.expToLevel) {
            orb.exp -= orb.expToLevel;
            orb.level = orb.level + 1;
            orb.expToLevel = orb.expToLevel * 1.4;
        }
    },
    updateManaPerSecond: function() {
        if (!engine.isManaUnlocked()) {
            return;
        }
        engine.updateOrbExpPerSecond();
        const mana = data.progress.mana;
        const cap = engine.getManaCapacity();
        const prevAmount = mana.amount || 0;
        const rate = engine.getEffectiveManaRatePerSecond();
        mana.amount = Math.min(cap, prevAmount + rate);
        engine.tryStartWhenFullMana();
    },
    tryStartWhenFullMana: function() {
        if (typeof isProcessingOffline !== "undefined" && isProcessingOffline) {
            return;
        }
        const bf = data.progress.base && data.progress.base.bonfire;
        if (!bf || !bonfire.isStartWithFullManaEnabled()) {
            return;
        }
        if ((data.progress.autoRetryCountdownSec || 0) > 0) {
            return;
        }
        if (!data.battle || !data.battle.cloneRunSettings || data.battle.state === "running") {
            return;
        }
        if (!bonfire.isManaFull()) {
            return;
        }
        if (engine.isMapTourActive()) {
            return;
        }
        if (typeof bonfire !== "undefined" && bonfire.canAffordCreateClone()) {
            bonfire.startNextClone();
        }
    },
    getOkami: function() {
        return data.progress.okami;
    },
    applyOkamiLevelUps: function() {
        const okami = engine.getOkami();
        if (!okami) {
            return;
        }
        let need = engine.getOkamiExpToLevel();
        while (need > 0 && (okami.exp || 0) >= need) {
            okami.exp -= need;
            okami.level = (okami.level || 0) + 1;
            need = engine.getOkamiExpToLevel();
        }
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
        const tailMult = Math.pow(1.5, Math.max(0, tails - 1));
        const lvl = level !== undefined && level !== null ? level : engine.getOkami().level;
        const levelMult = 1 + 0.2 * (lvl || 0);
        const cardAdd = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().spiritStrandsAdd || 0) : 0;
        const echoMult = Math.pow(1.3, engine.getSpiritWeavingEchoesBought());
        return tailMult * levelMult * engine.getMagicLoomSpiritStrandMultiplier() * (1 + cardAdd) * echoMult;
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
            if (a.scopeKey === "hiddenSpring" && a.upgradeKey === "fillMana") {
                return "Sending Mana Clone";
            }
            return `Weaving ${a.upgradeName} at the ${a.buildingName}`;
        }
        const okami = engine.getOkami();
        const job = okami.pathJob;
        if (job && !job.paused) {
            const jobType = job.jobType || "removeRocks";
            if (engine.isManaCloneJob(job) && job.phase === "travelingTo") {
                return "Sending Mana Clone";
            }
            if (job.phase === "collecting") {
                return "Collecting";
            }
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
                if (jobType === "reinforcedStairs") {
                    return "Weaving reinforced stairs";
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
        const okami = engine.getOkami();
        const weaving = data.progress.weaving;
        if (weaving && weaving.active && !okami.assignedBuildingKey) {
            return false;
        }
        const job = okami.pathJob;
        if (job && !job.paused && (job.phase === "travelingTo" || job.phase === "storingRocks" || job.phase === "collecting"
            || (engine.isCollectStoneJob(job) && job.phase === "returning"))) {
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
        let rate;
        if (okami.assignedBuildingKey !== siteKey) {
            rate = kitsune;
        } else {
            rate = 1 + kitsune * engine.getOkamiInspirationBonus();
        }
        if (siteKey === "torii") {
            const torii = data.progress.base && data.progress.base.torii;
            const shiny = (torii && torii.shinyServiceBought) || 0;
            rate *= 1 + 0.25 * shiny;
        }
        return rate;
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
    applySpiritStrandMultiplierToWeavingTimers: function(oldMult, newMult) {
        if (!oldMult || !newMult || oldMult === newMult) {
            return;
        }
        const ratio = oldMult / newMult;
        const weaving = engine.getWeavingState();
        const paused = weaving.paused;
        const keys = Object.keys(paused);
        for (let i = 0; i < keys.length; i++) {
            const entry = paused[keys[i]];
            if (!entry) {
                continue;
            }
            entry.remainMs = Math.max(0, (entry.remainMs || 0) * ratio);
            entry.totalMs = Math.max(0, (entry.totalMs || 0) * ratio);
        }
    },
    pauseWeavingEntry: function(entry) {
        if (!entry) {
            return;
        }
        const weaving = engine.getWeavingState();
        const key = engine.getWeavingJobKey(entry.scopeKey, entry.upgradeKey);
        weaving.paused[key] = Object.assign({}, entry);
    },
    pauseActiveWeaving: function(scopeKey, upgradeKey) {
        const weaving = engine.getWeavingState();
        if (!weaving.active) {
            return false;
        }
        if (weaving.active.scopeKey !== scopeKey || weaving.active.upgradeKey !== upgradeKey) {
            return false;
        }
        engine.pauseWeavingEntry(weaving.active);
        weaving.active = null;
        return true;
    },
    pauseAnyActiveWeaving: function() {
        const weaving = engine.getWeavingState();
        if (!weaving.active) {
            return false;
        }
        engine.pauseWeavingEntry(weaving.active);
        weaving.active = null;
        return true;
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
        engine.unassignOkamiForWeaving();
        const weaving = engine.getWeavingState();
        const totalMs = resortData.getUpgradeWeavingSeconds(up, scopeKey) * 1000;
        const entry = {
            scopeKey: scopeKey,
            upgradeKey: upgradeKey,
            remainMs: totalMs,
            totalMs: totalMs,
            upgradeName: up.name || upgradeKey,
            buildingName: resortData.getScopeDisplayName(scopeKey)
        };
        if (upgradeKey === "fillMana" && data.progress._pendingFillManaSeconds !== undefined) {
            entry.fillManaSeconds = data.progress._pendingFillManaSeconds;
        }
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
        engine.unassignOkamiForWeaving();
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
        const wasExchangeCredit = active.scopeKey === "market" && active.upgradeKey === "exchangeCredit";
        if (active.scopeKey === "foxDenUnlock") {
            const slot = resortData.foxDenUnlockGetDef(active.upgradeKey);
            if (slot && slot.onBuy) {
                slot.onBuy();
            }
        } else {
            const up = engine.getUpgradeDef(active.scopeKey, active.upgradeKey);
            if (up && up.onBuy) {
                up.onBuy();
            }
        }
        weaving.active = null;
        if (wasExchangeCredit && engine.tryAutoRepeatExchangeCredit()) {
            return;
        }
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
        if (scopeKey === "hiddenSpring" && upgradeKey === "fillMana") {
            const cloneUi = engine.getManaCloneTravelUi();
            if (cloneUi) {
                return cloneUi;
            }
        }
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
                disabled: false
            };
        }
        const pausedEntry = engine.getPausedWeavingEntry(scopeKey, upgradeKey);
        if (pausedEntry) {
            const pct = pausedEntry.totalMs > 0
                ? Math.max(0, Math.min(100, (1 - (pausedEntry.remainMs / pausedEntry.totalMs)) * 100))
                : 0;
            return {
                mode: "paused",
                label: `Paused · ${Math.ceil(pausedEntry.remainMs / 1000)}s remaining`,
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
        /* Market Traders draw from the same pool but are counted separately from its haulers. */
        total += (b.market && b.market.assignedTraders) || 0;
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
        if (kind === "market_traders") {
            const market = data.progress.base && data.progress.base.market;
            if (!market || !engine.isMarketBuilt()) return false;
            if (engine.getAvailableWorkers() <= 0) return false;
            market.assignedTraders = (market.assignedTraders || 0) + 1;
            return true;
        }
        const b = data.progress.base && data.progress.base[kind];
        if (!b) return false;
        if (kind === "bonfire" && !engine.isBonfireTendTheFlameUnlocked()) {
            return false;
        }
        if (kind === "market" && !engine.isMarketBuilt()) {
            return false;
        }
        if (kind === "cistern" && !engine.cisternWorkersRevealed()) {
            return false;
        }
        if (kind === "inn" && !engine.isInnOnsenConverted()) {
            return false;
        }
        if (engine.getAvailableWorkers() <= 0) return false;
        b.assignedWorkers = (b.assignedWorkers || 0) + 1;
        return true;
    },
    tryUnassignWorker: function(kind) {
        if (kind === "market_traders") {
            const market = data.progress.base && data.progress.base.market;
            if (!market || (market.assignedTraders || 0) <= 0) return false;
            market.assignedTraders--;
            return true;
        }
        const b = data.progress.base && data.progress.base[kind];
        if (!b) return false;
        if ((b.assignedWorkers || 0) <= 0) return false;
        b.assignedWorkers--;
        if (kind === "foxDen") {
            engine.syncFoxDenCarriersToWorkforce();
        }
        if (kind === "bonfire") {
            engine.syncBonfireCarriersToWorkforce();
        }
        if (kind === "market") {
            engine.syncMarketCarriersToWorkforce();
        }
        if (kind === "cistern") {
            engine.syncCisternCarriersToWorkforce();
        }
        if (kind === "inn") {
            engine.syncInnCarriersToWorkforce();
        }
        return true;
    },
    grantTipToSkill: function(skillKey, baseAmount) {
        const skill = data.progress.skills[skillKey];
        if (!skill) {
            return;
        }
        skill.tips = (skill.tips || 0) + baseAmount;
    },
    getScrollArchivesResearchRate: function() {
        const lib = data.progress.base.scrollArchives;
        const kitsune = lib.assignedWorkers || 0;
        const okami = engine.getOkami();
        const okamiHere = okami.assignedBuildingKey === "scrollArchives";
        if (kitsune <= 0 && !okamiHere) {
            return 0;
        }
        const perWorker = lib.researchPerWorkerPerSecond || 1;
        let rate = perWorker * (kitsune + (okamiHere ? 1 : 0));
        if (okamiHere) {
            rate *= engine.getOkamiInspirationBonus();
        }
        const cardAdd = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().researchSpeedAdd || 0) : 0;
        rate *= (1 + cardAdd);
        rate *= engine.getScrollArchivesSilverResearchSpeedMult();
        return rate;
    },
    getNextSkillResearchTargetKey: function() {
        return "";
    },
    countAchievedStars: function() {
        const byType = engine.countAchievedMapStarsByType();
        return byType.bronze + byType.silver + byType.gold;
    },
    countAchievedMapStarsByType: function() {
        const mapStars = data.progress.mapStars || {};
        const keys = Object.keys(mapStars);
        let bronze = 0;
        let silver = 0;
        let gold = 0;
        for (let i = 0; i < keys.length; i++) {
            const stars = mapStars[keys[i]];
            if (!stars) {
                continue;
            }
            if (stars.bronze) {
                bronze++;
            }
            if (stars.silver) {
                silver++;
            }
            if (stars.gold) {
                gold++;
            }
        }
        return { bronze: bronze, silver: silver, gold: gold };
    },
    getScrollArchivesBronzeResearchCostMult: function() {
        return Math.pow(0.9, engine.countAchievedMapStarsByType().bronze);
    },
    getScrollArchivesSilverResearchSpeedMult: function() {
        return Math.pow(1.1, engine.countAchievedMapStarsByType().silver);
    },
    getScrollArchivesGoldResearchGainMult: function() {
        return Math.pow(1.1, engine.countAchievedMapStarsByType().gold);
    },
    getWorkspaceFurnitureBought: function() {
        const lib = data.progress.base && data.progress.base.scrollArchives;
        return (lib && lib.workspaceFurnitureBought) || 0;
    },
    getWorkspaceFurnitureResearchCostMult: function() {
        return Math.pow(0.9, engine.getWorkspaceFurnitureBought());
    },
    getScrollArchivesFinishWeaveSeconds: function() {
        const lib = data.progress.base.scrollArchives;
        const unlocked = onLoad.countUnlockedSkills(lib.unlockedSkills);
        return 20 + 10 * Math.max(0, unlocked);
    },
    isScrollArchivesSkillViable: function(skillKey) {
        const lib = data.progress.base.scrollArchives;
        if (lib.unlockedSkills && lib.unlockedSkills[skillKey]) {
            return false;
        }
        const sk = data.progress.skills[skillKey];
        if (!sk) {
            return false;
        }
        const dSk = skills._byKey[skillKey];
        if (!dSk || dSk.category !== "combat") {
            return false;
        }
        const currentCls = data.progress.currentClassKey || "none";
        const hasActiveClass = ["condescend", "scold", "mock"].indexOf(currentCls) >= 0;
        if (dSk.classKey) {
            if (!hasActiveClass || dSk.classKey !== currentCls) {
                return false;
            }
        }
        return true;
    },
    getScrollArchivesViableSkillPool: function() {
        const pool = [];
        for (let i = 0; i < skills.keysInOrder.length; i++) {
            const k = skills.keysInOrder[i];
            if (engine.isScrollArchivesSkillViable(k)) {
                pool.push(k);
            }
        }
        return pool;
    },
    getTravelableMapDefinitions: function() {
        const mapDefs = (data.progress && data.progress.mapDefinitions) || [];
        const out = [];
        for (let i = 0; i < mapDefs.length; i++) {
            const map = mapDefs[i];
            const reqClass = map.requiredClassKey || "";
            if (!reqClass && mapData.isMapUnlocked(map, data.progress)) {
                out.push(map);
            }
        }
        return out;
    },
    /** True if player has at least one unlocked skill in the given slotCategory. */
    hasUnlockedSkillInSlotCategory: function(slotCategory) {
        const unlocked = data.progress.base && data.progress.base.scrollArchives
            && data.progress.base.scrollArchives.unlockedSkills;
        if (!unlocked || !slotCategory) {
            return false;
        }
        const keys = Object.keys(unlocked);
        for (let i = 0; i < keys.length; i++) {
            if (unlocked[keys[i]] && skills.getSlotCategory(keys[i]) === slotCategory) {
                return true;
            }
        }
        return false;
    },
    deriveStableSeed: function(salt) {
        const p = data.progress || {};
        const gs = data.currentGameState || {};
        const lib = p.base && p.base.scrollArchives;
        const shrine = p.base && p.base.shrine;
        const unlocked = lib && lib.unlockedSkills ? Object.keys(lib.unlockedSkills).sort().join(",") : "";
        const text = [
            salt,
            data.lastVisit || 0,
            data.resetCount || 0,
            gs.secondsPassed || 0,
            p.coins || 0,
            p.starBeads || 0,
            (shrine && shrine.level) || 0,
            (shrine && shrine.exp) || 0,
            unlocked
        ].join("|");
        let seed = hashIt(text) >>> 0;
        if (!seed) {
            seed = 1;
        }
        return seed;
    },
    ensureSavedSeed: function(holder, key, salt) {
        if (!holder) {
            return 1;
        }
        const cur = holder[key];
        if (typeof cur === "number" && isFinite(cur) && cur >= 0) {
            holder[key] = cur >>> 0;
            return holder[key];
        }
        let seed;
        if (typeof initialize !== "undefined" && initialize.useStableSeeds) {
            seed = engine.deriveStableSeed(salt);
        } else {
            seed = (Math.floor(Math.random() * 0x7fffffff) + 1) >>> 0;
        }
        if (!seed) {
            seed = 1;
        }
        const archives = data.progress && data.progress.base && data.progress.base.scrollArchives;
        const shrine = data.progress && data.progress.base && data.progress.base.shrine;
        const other = salt === "packOpen" ? (archives && archives.researchSeed) : (shrine && shrine.packSeed);
        if (typeof other === "number" && seed === (other >>> 0)) {
            seed = (seed + 1) >>> 0;
            if (!seed) {
                seed = 1;
            }
        }
        holder[key] = seed;
        return seed;
    },
    nextSeededFloat: function(holder, key) {
        let state = (typeof holder[key] === "number" ? holder[key] : 1) >>> 0;
        state = (1664525 * state + 1013904223) >>> 0;
        holder[key] = state;
        return state / 4294967296;
    },
    shuffleArrayInPlace: function(arr, rng) {
        const random = rng || Math.random;
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            const tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }
        return arr;
    },
    rollScrollArchivesResearchChoices: function() {
        const lib = data.progress.base.scrollArchives;
        engine.ensureSavedSeed(lib, "researchSeed", "scrollArchives");
        const rand = function() {
            return engine.nextSeededFloat(lib, "researchSeed");
        };
        const viable = engine.getScrollArchivesViableSkillPool();
        let pool = viable;
        const forceCats = ["offense", "defense", "utility"];
        let forcingOpeningCategory = false;
        for (let fi = 0; fi < forceCats.length; fi++) {
            const cat = forceCats[fi];
            if (engine.hasUnlockedSkillInSlotCategory(cat)) {
                continue;
            }
            const catPool = [];
            for (let vi = 0; vi < viable.length; vi++) {
                if (skills.getSlotCategory(viable[vi]) === cat) {
                    catPool.push(viable[vi]);
                }
            }
            if (catPool.length > 0) {
                pool = catPool;
                forcingOpeningCategory = true;
                break;
            }
            // No remaining skills in this category to research - treat as satisfied and continue.
        }
        const choices = [];
        if (!forcingOpeningCategory) {
            const counts = { offense: 0, defense: 0, utility: 0 };
            const unlocked = lib.unlockedSkills || {};
            const unlockedKeys = Object.keys(unlocked);
            for (let ui = 0; ui < unlockedKeys.length; ui++) {
                if (!unlocked[unlockedKeys[ui]]) {
                    continue;
                }
                const unlockedCat = skills.getSlotCategory(unlockedKeys[ui]);
                if (counts[unlockedCat] !== undefined) {
                    counts[unlockedCat]++;
                }
            }
            let leastCount = Infinity;
            const tied = [];
            for (let ti = 0; ti < forceCats.length; ti++) {
                const tiedCat = forceCats[ti];
                if (counts[tiedCat] < leastCount) {
                    leastCount = counts[tiedCat];
                    tied.length = 0;
                    tied.push(tiedCat);
                } else if (counts[tiedCat] === leastCount) {
                    tied.push(tiedCat);
                }
            }
            const leastCat = tied[Math.floor(rand() * tied.length)];
            const leastPool = [];
            for (let li = 0; li < pool.length; li++) {
                if (skills.getSlotCategory(pool[li]) === leastCat) {
                    leastPool.push(pool[li]);
                }
            }
            if (leastPool.length > 0) {
                const forced = leastPool[Math.floor(rand() * leastPool.length)];
                choices.push(forced);
                const rest = [];
                for (let ri = 0; ri < pool.length; ri++) {
                    if (pool[ri] !== forced) {
                        rest.push(pool[ri]);
                    }
                }
                pool = rest;
            }
        }
        engine.shuffleArrayInPlace(pool, rand);
        const alreadyChosen = {};
        for (let ai = 0; ai < choices.length; ai++) {
            alreadyChosen[choices[ai]] = true;
        }
        for (let pi = 0; pi < pool.length && choices.length < 3; pi++) {
            const pick = pool[pi];
            if (alreadyChosen[pick]) {
                continue;
            }
            alreadyChosen[pick] = true;
            choices.push(pick);
        }
        if (!forcingOpeningCategory && choices.length > 1) {
            engine.shuffleArrayInPlace(choices, rand);
        }
        lib.researchChoices = choices;
        lib.selectedResearchChoice = "";
        return lib.researchChoices;
    },
    onScrollArchivesResearchTaskComplete: function(lib) {
        const before = lib.researchesToChoose || 0;
        engine.migrateInscriptionResearchGrant(lib);
        if ((lib.researchesToChoose || 0) > before) {
            events.markNewBaseContent("scrollArchives");
        }
    },
    completeScrollArchivesResearchChoice: function() {
        const lib = data.progress.base.scrollArchives;
        const key = lib.selectedResearchChoice;
        if (!key) {
            return false;
        }
        lib.unlockedSkills[key] = true;
        if (typeof skills !== "undefined" && skills.tryAutoEquip) {
            skills.tryAutoEquip(key);
        }
        lib.researchesToChoose = Math.max(0, (lib.researchesToChoose || 0) - 1);
        lib.selectedResearchChoice = "";
        lib.researchChoices = [];
        if ((lib.researchesToChoose || 0) > 0) {
            engine.rollScrollArchivesResearchChoices();
        }
        return true;
    },
    get INSCRIPTION_ROWS() {
        const building = resortData.buildings && resortData.buildings.scrollArchives;
        return (building && building.inscriptionRows) || [];
    },
    inscriptionIndex: function(key) {
        const defs = engine.INSCRIPTION_ROWS;
        for (let i = 0; i < defs.length; i++) {
            if (defs[i].key === key) {
                return i;
            }
        }
        return -1;
    },
    getInscriptionRowLimit: function() {
        const defs = engine.INSCRIPTION_ROWS;
        let clausesIndex = 0;
        for (let i = 0; i < defs.length; i++) {
            if (defs[i].key === "clauses") {
                clausesIndex = i;
                break;
            }
        }
        return Math.min(clausesIndex, Math.max(0, defs.length - 1));
    },
    inscriptionRate: function(def) {
        return def.rateNum / def.rateDen;
    },
    syncInscriptionRequirement: function(row, def) {
        const base = def.progressStart;
        if (row.progressBase === base && row.required > 0) {
            return;
        }
        const nextRequired = base * Math.pow(1.1, row.bought || 0);
        if (row.required > 0) {
            row.progress = (row.progress || 0) * (nextRequired / row.required);
        }
        row.required = nextRequired;
        row.progressBase = base;
    },
    ensureInscriptionState: function() {
        const lib = data.progress.base && data.progress.base.scrollArchives;
        if (!lib) {
            return null;
        }
        const firstTime = !lib.inscriptionMigrated;
        if (!lib.inscriptions) {
            lib.inscriptions = {};
        }
        const defs = engine.INSCRIPTION_ROWS;
        for (let i = 0; i < defs.length; i++) {
            const key = defs[i].key;
            if (!lib.inscriptions[key]) {
                lib.inscriptions[key] = {
                    actual: 0,
                    bought: 0,
                    progress: 0,
                    required: defs[i].progressStart,
                    progressBase: defs[i].progressStart
                };
            } else {
                const row = lib.inscriptions[key];
                if (row.actual === undefined || row.actual === null) {
                    row.actual = 0;
                }
                if (row.bought === undefined || row.bought === null) {
                    row.bought = 0;
                }
                if (row.progress === undefined || row.progress === null) {
                    row.progress = 0;
                }
                engine.syncInscriptionRequirement(row, defs[i]);
            }
        }
        if (lib.scribings === undefined || lib.scribings === null) {
            lib.scribings = 0;
        }
        if (!(lib.scribingsRequired > 0)) {
            lib.scribingsRequired = 300;
        }
        if (lib.scribingsCompleted === undefined || lib.scribingsCompleted === null) {
            lib.scribingsCompleted = 0;
        }
        if (lib.inscriptionSecondMs === undefined || lib.inscriptionSecondMs === null) {
            lib.inscriptionSecondMs = 0;
        }
        if (lib.inscriptionUnlockedThrough === undefined || lib.inscriptionUnlockedThrough === null) {
            lib.inscriptionUnlockedThrough = 0;
        }
        if (!lib.selectedInscription) {
            lib.selectedInscription = "strokes";
        }
        if (firstTime) {
            engine.migrateInscriptionResearchGrant(lib);
            lib.inscriptionMigrated = true;
        }
        engine.refreshInscriptionUnlock(lib);
        const selectedIndex = engine.inscriptionIndex(lib.selectedInscription);
        if (selectedIndex < 0 || selectedIndex > (lib.inscriptionUnlockedThrough || 0)) {
            lib.selectedInscription = "strokes";
        }
        return lib;
    },
    migrateInscriptionResearchGrant: function(lib) {
        const unlocked = (typeof onLoad !== "undefined" && onLoad.countUnlockedSkills)
            ? onLoad.countUnlockedSkills(lib.unlockedSkills)
            : 0;
        const owned = unlocked + (lib.researchesToChoose || 0);
        const freeN = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().freeResearchLevelsFlat || 0)
            : 0;
        const lost = engine.getLostScrollsBought();
        const newSystem = (lib.scribingsCompleted || 0) + freeN + lost;
        if (newSystem > owned) {
            lib.researchesToChoose = (lib.researchesToChoose || 0) + (newSystem - owned);
            if ((lib.researchesToChoose || 0) > 0 && !(lib.researchChoices && lib.researchChoices.length)) {
                engine.rollScrollArchivesResearchChoices();
            }
        }
    },
    refreshInscriptionUnlock: function(lib) {
        const defs = engine.INSCRIPTION_ROWS;
        const maxIndex = engine.getInscriptionRowLimit();
        let through = Math.max(0, lib.inscriptionUnlockedThrough || 0);
        if (through > maxIndex) {
            through = maxIndex;
        }
        while (through < maxIndex && through + 1 < defs.length) {
            const prev = lib.inscriptions[defs[through].key];
            if (prev && (prev.bought || 0) >= 10) {
                through++;
            } else {
                break;
            }
        }
        lib.inscriptionUnlockedThrough = through;
    },
    getSelectedInscriptionDef: function(lib) {
        const defs = engine.INSCRIPTION_ROWS;
        const key = (lib && lib.selectedInscription) || "strokes";
        for (let i = 0; i < defs.length; i++) {
            if (defs[i].key === key) {
                return defs[i];
            }
        }
        return defs[0];
    },
    getInscriptionUnitCost: function(def) {
        const mult = engine.getScrollArchivesBronzeResearchCostMult() * engine.getWorkspaceFurnitureResearchCostMult();
        return {
            coins: def.coins * mult,
            beads: def.beads * mult,
            mana: def.mana * mult
        };
    },
    getInscriptionSpendPerSecond: function() {
        const lib = engine.ensureInscriptionState();
        const spendRate = engine.getScrollArchivesResearchRate();
        const unit = engine.getInscriptionUnitCost(engine.getSelectedInscriptionDef(lib));
        return {
            coins: unit.coins * spendRate,
            beads: unit.beads * spendRate,
            mana: unit.mana * spendRate
        };
    },
    getInscriptionProgressPerSecond: function() {
        return engine.getScrollArchivesResearchRate()
            * engine.getLiteracyResearchMultiplier()
            * engine.getScrollArchivesGoldResearchGainMult();
    },
    resetInscriptionsForPrestige: function(lib) {
        if (!lib) {
            return;
        }
        engine.ensureInscriptionState();
        const defs = engine.INSCRIPTION_ROWS;
        const keepN = Math.max(0, Math.min(defs.length, engine.getLanguageEchoesBought()));
        const kept = [];
        for (let i = 0; i < keepN; i++) {
            const row = lib.inscriptions[defs[i].key];
            kept.push({
                bought: row.bought || 0,
                progress: row.progress || 0,
                required: row.required > 0 ? row.required : defs[i].progressStart
            });
        }
        for (let i = 0; i < defs.length; i++) {
            lib.inscriptions[defs[i].key] = {
                actual: 0,
                bought: 0,
                progress: 0,
                required: defs[i].progressStart,
                progressBase: defs[i].progressStart
            };
        }
        for (let i = 0; i < kept.length; i++) {
            const snap = kept[i];
            const def = defs[i];
            lib.inscriptions[def.key] = {
                actual: snap.bought,
                bought: snap.bought,
                progress: snap.progress,
                required: snap.required,
                progressBase: def.progressStart
            };
        }
        lib.inscriptionUnlockedThrough = 0;
        lib.selectedInscription = "strokes";
        lib.scribings = 0;
        lib.scribingsRequired = 300;
        lib.scribingsCompleted = 0;
        lib.inscriptionSecondMs = 0;
        engine.refreshInscriptionUnlock(lib);
        const selectedIndex = engine.inscriptionIndex(lib.selectedInscription);
        if (selectedIndex < 0 || selectedIndex > (lib.inscriptionUnlockedThrough || 0)) {
            lib.selectedInscription = "strokes";
        }
    },
    applyInscriptionFrame: function(lib, elapsedMs) {
        const sec = (elapsedMs || 0) / 1000;
        if (sec <= 0) {
            return;
        }
        const spendRate = engine.getScrollArchivesResearchRate();
        const progressRate = engine.getInscriptionProgressPerSecond();
        const def = engine.getSelectedInscriptionDef(lib);
        const row = lib.inscriptions[def.key];
        if (!row) {
            return;
        }
        if (spendRate > 0) {
            const unit = engine.getInscriptionUnitCost(def);
            const coinCost = unit.coins * spendRate * sec;
            const beadCost = unit.beads * spendRate * sec;
            const manaCost = unit.mana * spendRate * sec;
            const coins = data.progress.coins || 0;
            const beads = data.progress.starBeads || 0;
            const manaAmt = (data.progress.mana && data.progress.mana.amount) || 0;
            const shortCoins = coins < coinCost;
            const shortBeads = beads < beadCost;
            const shortMana = manaAmt < manaCost;
            if (shortCoins || shortBeads || shortMana) {
                if (!lib.researchPaused) {
                    lib.researchPaused = true;
                    if (shortCoins || shortBeads) {
                        events.markNewBaseContent("scrollArchives");
                    }
                }
            } else {
                lib.researchPaused = false;
                data.progress.coins -= coinCost;
                data.progress.starBeads -= beadCost;
                if (data.progress.mana) {
                    data.progress.mana.amount = manaAmt - manaCost;
                }
                row.progress = (row.progress || 0) + progressRate * sec;
                let guard = 0;
                while (row.progress >= row.required && row.required > 0 && guard < 10000) {
                    row.progress -= row.required;
                    row.bought = (row.bought || 0) + 1;
                    row.actual = (row.actual || 0) + 1;
                    row.required = row.required * 1.1;
                    guard++;
                }
            }
        } else if (lib.researchPaused) {
            lib.researchPaused = false;
        }
        engine.refreshInscriptionUnlock(lib);
    },
    getSturdyShelvesBought: function() {
        const lib = data.progress.base && data.progress.base.scrollArchives;
        return (lib && lib.sturdyShelvesBought) || 0;
    },
    getSturdyShelvesOutputMultiplier: function() {
        return Math.pow(1.3, engine.getSturdyShelvesBought());
    },
    scribingsGainedAfterTicks: function(lib, ticks) {
        const defs = engine.INSCRIPTION_ROWS;
        const M = Math.floor(ticks);
        if (!lib || !lib.inscriptions || !defs.length || M <= 0) {
            return 0;
        }
        const mult = engine.getSturdyShelvesOutputMultiplier();
        const strokeMult = engine.getInfuseScribingsMultiplier();
        let term = engine.inscriptionRate(defs[0]) * M * mult;
        const first = lib.inscriptions[defs[0].key];
        let gain = ((first && first.actual) || 0) * term * strokeMult;
        const rowCount = Math.min(defs.length, engine.getInscriptionRowLimit() + 1);
        for (let k = 1; k < rowCount; k++) {
            const stepsLeft = M - k;
            if (stepsLeft <= 0) {
                break;
            }
            term *= engine.inscriptionRate(defs[k]) * stepsLeft / (k + 1) * mult;
            const row = lib.inscriptions[defs[k].key];
            gain += ((row && row.actual) || 0) * term;
        }
        return gain;
    },
    getScribingsChainEtaSeconds: function(lib) {
        if (!lib || !lib.inscriptions) {
            return null;
        }
        const remain = (lib.scribingsRequired || 0) - (lib.scribings || 0);
        if (!(remain > 0)) {
            return null;
        }
        const defs = engine.INSCRIPTION_ROWS;
        let producing = false;
        const rowCount = Math.min(defs.length, engine.getInscriptionRowLimit() + 1);
        for (let i = 0; i < rowCount; i++) {
            const row = lib.inscriptions[defs[i].key];
            if (row && row.actual > 0) {
                producing = true;
                break;
            }
        }
        if (!producing) {
            return null;
        }
        const cap = 1e15;
        let hi = 1;
        while (hi < cap && engine.scribingsGainedAfterTicks(lib, hi) < remain) {
            const next = hi * 2;
            hi = next > cap ? cap : next;
        }
        if (engine.scribingsGainedAfterTicks(lib, hi) < remain) {
            return null;
        }
        let lo = 0;
        while (lo + 1 < hi) {
            const mid = Math.floor(lo + (hi - lo) / 2);
            if (engine.scribingsGainedAfterTicks(lib, mid) >= remain) {
                hi = mid;
            } else {
                lo = mid;
            }
        }
        const untilNextTick = Math.max(0, 1000 - (lib.inscriptionSecondMs || 0)) / 1000;
        return untilNextTick + Math.max(0, hi - 1);
    },
    runInscriptionProduction: function(lib) {
        const defs = engine.INSCRIPTION_ROWS;
        const rowCount = Math.min(defs.length, engine.getInscriptionRowLimit() + 1);
        const snap = [];
        for (let i = 0; i < rowCount; i++) {
            snap.push(lib.inscriptions[defs[i].key].actual || 0);
        }
        const shelfMult = engine.getSturdyShelvesOutputMultiplier();
        const strokeMult = engine.getInfuseScribingsMultiplier();
        lib.scribings = (lib.scribings || 0) + snap[0] * engine.inscriptionRate(defs[0]) * shelfMult * strokeMult;
        for (let i = 1; i < rowCount; i++) {
            const above = lib.inscriptions[defs[i - 1].key];
            above.actual = (above.actual || 0) + snap[i] * engine.inscriptionRate(defs[i]) * shelfMult;
        }
        let sGuard = 0;
        while ((lib.scribings || 0) >= lib.scribingsRequired && lib.scribingsRequired > 0 && sGuard < 10000) {
            lib.scribings -= lib.scribingsRequired;
            lib.scribingsRequired *= 3;
            lib.scribingsCompleted = (lib.scribingsCompleted || 0) + 1;
            engine.onScrollArchivesResearchTaskComplete(lib);
            sGuard++;
        }
    },
    updateScrollArchivesResearch: function(tickMs) {
        const lib = engine.ensureInscriptionState();
        if (!lib) {
            return;
        }
        const elapsed = tickMs || 0;
        engine.applyInscriptionFrame(lib, elapsed);
        lib.inscriptionSecondMs = (lib.inscriptionSecondMs || 0) + elapsed;
        let guard = 0;
        while (lib.inscriptionSecondMs >= 1000 && guard < 100000) {
            lib.inscriptionSecondMs -= 1000;
            engine.runInscriptionProduction(lib);
            guard++;
        }
    }
}
