// Applies a save blob to `data`, then runs saveVersion migrations for maps/skills.

let onLoad = {
    STAR_TYPES: ["bronze", "silver", "gold"],

    countUnlockedSkills: function(unlockedSkills) {
        let n = 0;
        const keys = Object.keys(unlockedSkills || {});
        for (let i = 0; i < keys.length; i++) {
            if (unlockedSkills[keys[i]]) {
                n++;
            }
        }
        return n;
    },

    applyResearchTaskRequired: function(lib) {
        if (!lib) {
            return;
        }
        const curveLen = Array.isArray(lib.researchCoinCosts) ? lib.researchCoinCosts.length : 0;
        const prev = lib.researchTaskRequired || 0;
        const progress = lib.researchTaskProgress || 0;
        engine.syncScrollArchivesResearchCost(lib);
        const next = lib.researchTaskRequired || 0;
        if (curveLen <= 1 && prev > 0 && next > 0 && progress > 0 && prev !== next) {
            lib.researchTaskProgress = progress * (next / prev);
        }
    },

    returnSkillStarsToPool: function(skill) {
        if (!skill || !skill.stars) {
            return;
        }
        const pool = data.progress.stars;
        for (let i = 0; i < onLoad.STAR_TYPES.length; i++) {
            const t = onLoad.STAR_TYPES[i];
            if (skill.stars[t]) {
                skill.stars[t] = false;
                pool[t] = (pool[t] || 0) + 1;
            }
        }
    },

    removeOneStarFromEconomy: function(starType) {
        const pool = data.progress.stars;
        if ((pool[starType] || 0) > 0) {
            pool[starType]--;
            return;
        }
        const sks = data.progress.skills || {};
        const keys = Object.keys(sks);
        for (let i = 0; i < keys.length; i++) {
            const sk = sks[keys[i]];
            if (sk && sk.stars && sk.stars[starType]) {
                sk.stars[starType] = false;
                return;
            }
        }
    },

    collectMapShardSkillKeys: function(mapDef) {
        const out = {};
        const zoneShards = mapDef.zoneShards || [];
        for (let i = 0; i < zoneShards.length; i++) {
            const sh = zoneShards[i];
            if (sh && sh.key) {
                out[sh.key] = true;
            }
        }
        const zones = mapDef.zones || [];
        for (let zi = 0; zi < zones.length; zi++) {
            const sh = zones[zi].skillShard;
            if (sh && sh.key) {
                out[sh.key] = true;
            }
        }
        return out;
    },

    wipeMapProgressForVersion: function(mapDef) {
        const mapKey = mapDef.key;
        const workers = (data.progress.mapWorkersFound && data.progress.mapWorkersFound[mapKey]) || 0;
        const stars = (data.progress.mapStars && data.progress.mapStars[mapKey]) || {};

        if (data.progress.mapStars) {
            delete data.progress.mapStars[mapKey];
        }
        if (data.progress.mapWorkersFound) {
            delete data.progress.mapWorkersFound[mapKey];
        }
        if (data.progress.mapClearProgress) {
            delete data.progress.mapClearProgress[mapKey];
        }

        if (!data.progress.kitsune) {
            data.progress.kitsune = { total: 2 };
        }
        data.progress.kitsune.total = Math.max(0, (data.progress.kitsune.total || 0) - workers);

        for (let i = 0; i < onLoad.STAR_TYPES.length; i++) {
            const t = onLoad.STAR_TYPES[i];
            if (stars[t]) {
                onLoad.removeOneStarFromEconomy(t);
            }
        }

        const shardKeys = onLoad.collectMapShardSkillKeys(mapDef);
        const sks = data.progress.skills || {};
        const keys = Object.keys(shardKeys);
        for (let si = 0; si < keys.length; si++) {
            const sk = sks[keys[si]];
            if (sk) {
                sk.shards = 0;
            }
        }
    },

    wipeSkillProgressForVersion: function(skillKey) {
        const sk = data.progress.skills[skillKey];
        onLoad.returnSkillStarsToPool(sk);
        data.progress.skills[skillKey] = skills.createFreshSkillState(skillKey);
    },

    renameSkillKey: function(oldKey, newKey) {
        if (!oldKey || !newKey || oldKey === newKey) {
            return;
        }
        const sks = data.progress.skills || {};
        if (sks[oldKey]) {
            if (!sks[newKey]) {
                sks[newKey] = sks[oldKey];
                sks[newKey].key = newKey;
                const def = skills._byKey[newKey];
                if (def && def.name) {
                    sks[newKey].name = def.name;
                }
            }
            delete sks[oldKey];
        }
        const lib = data.progress.base && data.progress.base.scrollArchives;
        if (lib && lib.unlockedSkills) {
            if (lib.unlockedSkills[oldKey]) {
                lib.unlockedSkills[newKey] = true;
            }
            delete lib.unlockedSkills[oldKey];
        }
        if (lib && lib.researchChoices) {
            for (let i = 0; i < lib.researchChoices.length; i++) {
                if (lib.researchChoices[i] === oldKey) {
                    lib.researchChoices[i] = newKey;
                }
            }
        }
        if (lib && lib.selectedResearchChoice === oldKey) {
            lib.selectedResearchChoice = newKey;
        }
        if (data.progress.selectedSkillDetailKey === oldKey) {
            data.progress.selectedSkillDetailKey = newKey;
        }
        if (data.battle && data.battle.runSkillTalentStart && data.battle.runSkillTalentStart[oldKey] !== undefined) {
            if (data.battle.runSkillTalentStart[newKey] === undefined) {
                data.battle.runSkillTalentStart[newKey] = data.battle.runSkillTalentStart[oldKey];
            }
            delete data.battle.runSkillTalentStart[oldKey];
        }
    },

    ensureAllSkillStates: function() {
        if (!data.progress.skills) {
            data.progress.skills = {};
        }
        for (let i = 0; i < skills.keysInOrder.length; i++) {
            const k = skills.keysInOrder[i];
            if (!data.progress.skills[k]) {
                data.progress.skills[k] = skills.createFreshSkillState(k);
            } else {
                const def = skills._byKey[k];
                if (def) {
                    data.progress.skills[k].key = k;
                    data.progress.skills[k].name = def.name;
                }
            }
        }
    },

    applySaveVersionMigrations: function(loadedSaveVersion) {
        onLoad.renameSkillKey("fakeTearDrops", "applyTearDrops");
        onLoad.ensureAllSkillStates();
        if (data.battle) {
            if (data.battle.applyTearDropsAccMs === undefined || data.battle.applyTearDropsAccMs === null) {
                data.battle.applyTearDropsAccMs = data.battle.fakeTearDropsSecondAccMs || 0;
            }
            delete data.battle.fakeTearDropsSecondAccMs;
        }
        data.progress.mapDefinitions = mapData.getDefaultMaps();
        const maps = data.progress.mapDefinitions;
        for (let mi = 0; mi < maps.length; mi++) {
            const map = maps[mi];
            const mapVer = map.version !== undefined ? map.version : 0;
            if (loadedSaveVersion < mapVer) {
                onLoad.wipeMapProgressForVersion(map);
            }
        }

        const lib = data.progress.base.scrollArchives;
        let wipedUnlockedCount = 0;
        for (let si = 0; si < skills.keysInOrder.length; si++) {
            const skillKey = skills.keysInOrder[si];
            const def = skills._byKey[skillKey];
            const skillVer = def && def.version !== undefined ? def.version : 0;
            if (loadedSaveVersion >= skillVer) {
                continue;
            }
            const wasUnlocked = !!(lib.unlockedSkills && lib.unlockedSkills[skillKey]);
            onLoad.wipeSkillProgressForVersion(skillKey);
            if (wasUnlocked) {
                delete lib.unlockedSkills[skillKey];
                wipedUnlockedCount++;
            }
        }

        if (wipedUnlockedCount > 0) {
            lib.researchesToChoose = (lib.researchesToChoose || 0) + wipedUnlockedCount;
            lib.researchChoices = [];
            lib.selectedResearchChoice = "";
        }
        onLoad.applyResearchTaskRequired(lib);

        if ((lib.researchesToChoose || 0) > 0 && (!lib.researchChoices || !lib.researchChoices.length)) {
            engine.rollScrollArchivesResearchChoices();
        }
        onLoad.syncKitsuneTotalFromRescues();
    },

    /** Rescues used to update the map counter without adding workers. Raise the pool to match. */
    syncKitsuneTotalFromRescues: function() {
        if (!data.progress.kitsune) {
            data.progress.kitsune = { total: 2 };
        }
        const found = data.progress.mapWorkersFound || {};
        const foundKeys = Object.keys(found);
        let rescued = 0;
        for (let i = 0; i < foundKeys.length; i++) {
            rescued += found[foundKeys[i]] || 0;
        }
        const torii = data.progress.base && data.progress.base.torii;
        const calls = (torii && torii.callForAllyBought) || 0;
        const expected = 2 + calls + rescued;
        if ((data.progress.kitsune.total || 0) < expected) {
            data.progress.kitsune.total = expected;
        }
    },

    handleLoad: function(data, toLoad) {
        const loadedSaveVersion = toLoad.saveVersion !== undefined && toLoad.saveVersion !== null
            ? toLoad.saveVersion
            : 0;

        data.gameState = toLoad.gameState ?? "default";
        data.lastVisit = toLoad.lastVisit ?? Date.now();
        data.resetCount = toLoad.resetCount ?? 1;

        data.currentGameState = toLoad.currentGameState ?? initials.currentGameState();
        if (data.currentGameState.pendingOfflineMs === undefined || data.currentGameState.pendingOfflineMs === null) {
            data.currentGameState.pendingOfflineMs = 0;
        }
        if (!data.currentGameState.offlineShardBank || typeof data.currentGameState.offlineShardBank !== "object") {
            data.currentGameState.offlineShardBank = {};
        }
        data.gameSettings = toLoad.gameSettings ?? initials.gameSettings();
        data.progress = toLoad.progress ?? initials.progress();
        data.battle = toLoad.battle ?? initials.battle();
        onLoad.renameSkillKey("fakeTearDrops", "applyTearDrops");
        onLoad.ensureAllSkillStates();
        if (data.battle && (data.battle.applyTearDropsAccMs === undefined || data.battle.applyTearDropsAccMs === null)) {
            data.battle.applyTearDropsAccMs = data.battle.fakeTearDropsSecondAccMs || 0;
            delete data.battle.fakeTearDropsSecondAccMs;
        }

        initialize.initializeBaseContentNotify();
        initialize.initializeBambooForest();
        initialize.initializeScrollArchives();
        initialize.initializeInn();
        initialize.initializeManaBuildings();
        initialize.initializeHiddenSpring();
        initialize.initializeFireLaunchers();
        initialize.initializeOkami();
        initialize.initializeFoxDen();
        initialize.initializeMapRevealed();
        initialize.initializeAtelier();
        initialize.initializeGarden();
        initialize.initializeBonfire();
        initialize.initializeMageTower();
        initialize.initializeShrine();
        initialize.initializeCistern();
        initialize.initializeNoodleBar();
        initialize.initializePond();
        initialize.initializeMine();
        initialize.initializePathSegments();

        onLoad.applySaveVersionMigrations(loadedSaveVersion);
        data.saveVersion = CODE_SAVE_VERSION;

        if (!data.battle.cloneAttributePlan) {
            data.battle.cloneAttributePlan = engine.copyAttributePlan(data.progress.attributePlan);
        }
        if (data.progress.highestLevelReached === undefined || data.progress.highestLevelReached === null) {
            data.progress.highestLevelReached = 0;
        }
        engine.noteHighestLevelReached(data.battle.levelState && data.battle.levelState.level);
        initialize.applyPlanForCurrentLevel();
        initialize.calcPlayerStats(false);
    },
    afterLoad: function() {
        createView.initializeDisplay();
        createView.fixUiAfterLoad();
        view.updateView();
        if (typeof events !== "undefined" && events.syncHideMaxedToggleFromSave) {
            events.syncHideMaxedToggleFromSave();
        }
        debug();
    }
};
