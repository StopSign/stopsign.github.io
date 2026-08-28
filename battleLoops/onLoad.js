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

    computeResearchTaskRequired: function(completedCount) {
        let req = 10;
        for (let i = 0; i < completedCount; i++) {
            req = Math.floor(req * 1.5 + 5);
        }
        return req;
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

    applySaveVersionMigrations: function(loadedSaveVersion) {
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
            const completed = onLoad.countUnlockedSkills(lib.unlockedSkills) + (lib.researchesToChoose || 0);
            lib.researchTaskRequired = onLoad.computeResearchTaskRequired(completed);
            lib.researchesToChoose = (lib.researchesToChoose || 0) + wipedUnlockedCount;
            lib.researchChoices = [];
            lib.selectedResearchChoice = "";
        }

        if ((lib.researchesToChoose || 0) > 0 && (!lib.researchChoices || !lib.researchChoices.length)) {
            engine.rollScrollArchivesResearchChoices();
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
        data.gameSettings = toLoad.gameSettings ?? initials.gameSettings();
        data.progress = toLoad.progress ?? initials.progress();
        data.battle = toLoad.battle ?? initials.battle();

        initialize.initializeBaseContentNotify();
        initialize.initializeBambooForest();
        initialize.initializeScrollArchives();
        initialize.initializeInn();
        initialize.initializeHiddenSpring();
        initialize.initializeFireLaunchers();
        initialize.initializeOkami();
        initialize.initializeFoxDen();
        initialize.initializeMapRevealed();
        initialize.initializeAtelier();
        initialize.initializeGarden();
        initialize.initializeCistern();
        initialize.initializeMine();
        initialize.initializePathSegments();

        onLoad.applySaveVersionMigrations(loadedSaveVersion);
        data.saveVersion = CODE_SAVE_VERSION;

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
