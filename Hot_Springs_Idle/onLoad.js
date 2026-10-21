// Applies a save blob to `data`, then runs saveFix migrations after initialize.

let onLoad = {
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

    removeUnknownSkillStates: function() {
        if (!data.progress.skills) {
            return;
        }
        const sks = data.progress.skills;
        const keys = Object.keys(sks);
        const lib = data.progress.base && data.progress.base.scrollArchives;
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            if (skills._byKey[k]) {
                continue;
            }
            skills.returnSkillStarsToPool(sks[k]);
            delete sks[k];
            if (lib && lib.unlockedSkills) {
                delete lib.unlockedSkills[k];
            }
            if (lib && lib.researchChoices) {
                lib.researchChoices = lib.researchChoices.filter(function(choice) {
                    return choice !== k;
                });
            }
            if (lib && lib.selectedResearchChoice === k) {
                lib.selectedResearchChoice = null;
            }
            if (data.progress.selectedEquippedSkillKey === k) {
                data.progress.selectedEquippedSkillKey = "";
            }
            if (data.progress.selectedLibrarySkillKey === k) {
                data.progress.selectedLibrarySkillKey = "";
            }
            if (data.progress.selectedSkillDetailKey === k) {
                data.progress.selectedSkillDetailKey = "";
            }
            if (data.battle && data.battle.runSkillTalentStart) {
                delete data.battle.runSkillTalentStart[k];
            }
        }
    },

    ensureAllSkillStates: function() {
        if (!data.progress.skills) {
            data.progress.skills = {};
        }
        onLoad.removeUnknownSkillStates();
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
                if (data.progress.skills[k].grouping === undefined || data.progress.skills[k].grouping === null) {
                    data.progress.skills[k].grouping = 0;
                }
            }
        }
        onLoad.ensureSkillEquipState();
    },

    ensureSkillEquipState: function() {
        if (!data.progress) {
            return;
        }
        const tab = data.progress.selectedSkillsTab;
        if (tab === "combat" || tab === "foraging" || tab === "class" || tab === "resort" || !tab) {
            data.progress.selectedSkillsTab = "equipped";
        }
        if (typeof data.progress.selectedEquippedSkillKey !== "string") {
            data.progress.selectedEquippedSkillKey = "";
        }
        if (typeof data.progress.selectedLibrarySkillKey !== "string") {
            data.progress.selectedLibrarySkillKey = "";
        }
        // Migrate legacy shared selection into the two independent keys once.
        if (typeof data.progress.selectedSkillDetailKey === "string" && data.progress.selectedSkillDetailKey) {
            const legacy = data.progress.selectedSkillDetailKey;
            if (!data.progress.selectedEquippedSkillKey && skills.isSkillEquipped(legacy)) {
                data.progress.selectedEquippedSkillKey = legacy;
            }
            if (!data.progress.selectedLibrarySkillKey && skills.getLibrarySkillKeys().indexOf(legacy) >= 0) {
                data.progress.selectedLibrarySkillKey = legacy;
            }
            data.progress.selectedSkillDetailKey = "";
        }
        delete data.progress.selectedSkillDetailKey;
        skills.ensureSkillEquip();
        // Existing saves start with empty slots (do not auto-equip).
        skills.tickUnequipCharges(Date.now());
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
        if (data.gameSettings.prestigePackOpen === undefined || data.gameSettings.prestigePackOpen === null) {
            data.gameSettings.prestigePackOpen = false;
        }
        // Debug pause / x3 / x10 should not persist across loads
        data.gameSettings.gameSpeed = 1;
        data.gameSettings.debugSpeedMultiplier = 0;
        data.gameSettings.stop = false;
        if (data.gameSettings.offlineProgressMode !== "catchUp" && data.gameSettings.offlineProgressMode !== "pauseBonus") {
            data.gameSettings.offlineProgressMode = "catchUp";
        }
        // Bonus x2 stays on across load when bank remains; otherwise force off
        if (!data.currentGameState.bonusTime || data.currentGameState.bonusTime <= 0) {
            data.currentGameState.bonusTime = 0;
            data.gameSettings.bonusSpeed = 1;
        } else if ((data.gameSettings.bonusSpeed || 1) > 1) {
            // Mutually exclusive with debug speeds (already cleared above)
            data.gameSettings.bonusSpeed = 2;
        } else {
            data.gameSettings.bonusSpeed = 1;
        }
        if (typeof BONUS_TIME_CAP_MS !== "undefined" && data.currentGameState.bonusTime > BONUS_TIME_CAP_MS) {
            data.currentGameState.bonusTime = BONUS_TIME_CAP_MS;
        }

        data.progress = toLoad.progress ?? initials.progress();
        data.battle = toLoad.battle ?? initials.battle();
        data.tutorialToasts = Array.isArray(toLoad.tutorialToasts) ? toLoad.tutorialToasts.slice() : [];
        if (typeof toasts !== "undefined" && toasts.ensureStates) {
            toasts.ensureStates();
        }

        initialize.useStableSeeds = true;
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

        saveFix.runAfterInitialize(loadedSaveVersion);
        initialize.useStableSeeds = false;
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
        if (typeof events !== "undefined" && events.restorePrestigePackOverlay) {
            events.restorePrestigePackOverlay();
        }
        if (typeof toasts !== "undefined" && toasts.create) {
            toasts.create();
            toasts.check();
        }
        debug();
    }
};
