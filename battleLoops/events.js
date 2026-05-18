//Contains functions that happen based on user action, or triggers

let events = {
    toggleSkipButtons: function(disable) {
        const ids = ['skipTime1', 'skipTime10', 'skipTime60'];
        for (let id of ids) {
            let btn = document.getElementById(id);
            if (btn) {
                btn.style.backgroundColor = disable ? "grey" : "darkblue";
                btn.style.pointerEvents = disable ? "none" : "auto";
            }
        }
    },
    tryAgain: function() {
        if (data.progress.pendingClassKey) {
            data.progress.currentClassKey = data.progress.pendingClassKey;
            data.progress.pendingClassKey = "";
            if (data.progress.currentClassKey === "rogue") {
                data.progress.sandalAttackEnabled = false;
            }
            const mapDef = initialize.getCurrentMapDefinition();
            const reqClass = mapDef && mapDef.requiredClassKey ? mapDef.requiredClassKey : "";
            if (reqClass && reqClass !== data.progress.currentClassKey) {
                data.progress.currentMapKey = "map_1";
            }
        }
        initialize.resetBattleFromSeed();
    },
    endRunNow: function() {
        if (!data.battle || data.battle.state !== "running") {
            return;
        }
        data.battle.player.hp = 0;
        engine.checkLossCondition();
    },
    skillsTabUnlocked: function() {
        const th = data.progress.base && data.progress.base.townhall;
        return !!(th && th.unlocks && th.unlocks.library);
    },
    /** Foraging skills / Library foraging tab unlock with Lumber mill */
    foragingSkillsUnlocked: function() {
        const th = data.progress.base && data.progress.base.townhall;
        return !!(th && th.unlocks && th.unlocks.lumbermill);
    },
    mainMenuTabOrder: function() {
        const tabs = ["base", "stats", "skills", "travel", "history", "options"];
        const chapel = data.progress.base && data.progress.base.chapel;
        if (chapel && chapel.growthBlessingUnlocked) {
            tabs.splice(1, 0, "leveling");
        }
        if (!events.skillsTabUnlocked()) {
            const ix = tabs.indexOf("skills");
            if (ix >= 0) tabs.splice(ix, 1);
        }
        return tabs;
    },
    switchTab: function(tabKey) {
        const validTabs = events.mainMenuTabOrder();
        data.battle.currentTab = validTabs.indexOf(tabKey) >= 0 ? tabKey : "base";
        createView.showCurrentTab();
        createView.updateLayoutMeasurements();
    },
    markNewBaseContent: function(buildingKey, optionalTownHallSubtab) {
        if (!data.progress.baseContentNotify) {
            data.progress.baseContentNotify = { building: {}, subtab: {} };
        }
        if (!data.progress.baseContentNotify.building) {
            data.progress.baseContentNotify.building = {};
        }
        if (!data.progress.baseContentNotify.subtab) {
            data.progress.baseContentNotify.subtab = {};
        }
        if (buildingKey) {
            data.progress.baseContentNotify.building[buildingKey] = true;
        }
        if (optionalTownHallSubtab) {
            data.progress.baseContentNotify.subtab["townhall_" + optionalTownHallSubtab] = true;
        }
    },
    setHideMaxedUpgrades: function(enabled) {
        data.progress.options.hideMaxedUpgrades = !!enabled;
        if (typeof view !== "undefined" && view.updateBasePanel) {
            view.updateBasePanel();
        }
    },
    /** Sync hide-maxed checkbox from save (call after DOM caches exist; not per-frame). */
    syncHideMaxedToggleFromSave: function() {
        const el = viewData.cached.hideMaxedUpgradesToggle || document.getElementById("hideMaxedUpgradesToggle");
        if (el) {
            el.checked = !!(data.progress.options && data.progress.options.hideMaxedUpgrades);
        }
    },
    setDisableCompactLayout: function(enabled) {
        if (!data.progress.options) {
            data.progress.options = {};
        }
        data.progress.options.disableCompactLayout = !!enabled;
        view.updateCompactLayout();
        createView.updateLayoutMeasurements();
    },
    switchSkillsTab: function(tabKey) {
        const valid = ["combat", "town", "foraging", "class"];
        let t = valid.indexOf(tabKey) >= 0 ? tabKey : "combat";
        if (t === "foraging" && !events.foragingSkillsUnlocked()) {
            t = "combat";
        }
        data.progress.selectedSkillsTab = t;
        view.updateSkillsListVisibility(t);
        // User changed sub-tab: clear selection so the right panel is hidden.
        data.progress.selectedSkillDetailKey = "";
        view.applySkillDetailSelectionHighlight();
        view.updateSkillInfoPanel();
        createView.updateLayoutMeasurements();
    },
    /** Skills tab: show detail in right panel; star row clicks do not select. */
    selectSkillForDetail: function(skillKey, ev) {
        if (ev && ev.target && ev.target.closest && ev.target.closest(".skill-stars-controls")) {
            return;
        }
        if (!skills.isSkillUnlocked(skillKey)) {
            return;
        }
        const tab = data.progress.selectedSkillsTab || "combat";
        const list = skills.getSkillKeysByCategory(data.progress.skills, tab);
        if (list.indexOf(skillKey) < 0) {
            return;
        }
        // Clicking the selected skill again toggles it off.
        if (data.progress.selectedSkillDetailKey === skillKey) {
            data.progress.selectedSkillDetailKey = "";
        } else {
            data.progress.selectedSkillDetailKey = skillKey;
        }
        view.applySkillDetailSelectionHighlight();
        view.updateSkillInfoPanel();
    },
    switchLibraryTab: function(tabKey) {
        const valid = ["combat", "town", "foraging", "class"];
        let t = valid.indexOf(tabKey) >= 0 ? tabKey : "combat";
        if (t === "foraging" && !events.foragingSkillsUnlocked()) {
            t = "combat";
        }
        data.progress.selectedLibraryTab = t;
    },
    switchTownHallTab: function(tabKey) {
        const valid = ["buildings", "town_upgrades"];
        data.progress.selectedTownHallTab = valid.indexOf(tabKey) >= 0 ? tabKey : "buildings";
        if (data.progress.baseContentNotify && data.progress.baseContentNotify.subtab) {
            delete data.progress.baseContentNotify.subtab["townhall_" + data.progress.selectedTownHallTab];
        }
    },
    switchCompactPane: function(paneKey) {
        const valid = ["menus", "battle"];
        data.progress.compactViewPane = valid.indexOf(paneKey) >= 0 ? paneKey : "menus";
        view.updateCompactLayout();
        createView.updateLayoutMeasurements();
    },
    selectBaseBuilding: function(buildingKey) {
        if (townData.baseBuildingOrder.indexOf(buildingKey) < 0) {
            return;
        }
        data.progress.selectedBaseBuilding = buildingKey;
        if (data.progress.baseContentNotify && data.progress.baseContentNotify.building) {
            delete data.progress.baseContentNotify.building[buildingKey];
        }
        events.showSelectedBaseBuildingPanels(buildingKey);
    },
    showSelectedBaseBuildingPanels: function(buildingKey) {
        for (let i = 0; i < townData.baseBuildingOrder.length; i++) {
            const k = townData.baseBuildingOrder[i];
            view.updateVal(`basePanel_${k}`, k === buildingKey ? "" : "none", "style.display");
        }
    },
    buyUpgrade: function(scopeKey, upgradeKey) {
        if (scopeKey === "townhallUnlock") {
            const slot = townData.townhallUnlockGetDef(upgradeKey);
            if (!slot.canBuy()) {
                return;
            }
            const cost = townData.resolveCost(slot);
            if (!townData.canAffordCost(cost)) {
                return;
            }
            townData.deductCost(cost);
            slot.onBuy();
            return;
        }
        const bcfg = townData.buildings[scopeKey];
        const up = bcfg.upgrades[upgradeKey];
        if (up.canBuy && !up.canBuy()) {
            return;
        }
        const cost = townData.resolveCost(up, scopeKey);
        if (!townData.canAffordCost(cost)) {
            return;
        }
        townData.deductCost(cost);
        if (up.progressCostPurchase) {
            townData.applyProgressCostPurchase(scopeKey);
        } else if (up.onBuy) {
            up.onBuy();
        }
    },
    spendGoldIfPossible: function(cost) {
        if (typeof isDebug !== "undefined" && isDebug) {
            return true;
        }
        if (data.progress.gold < cost) {
            return false;
        }
        data.progress.gold -= cost;
        return true;
    },
    advertiseInn: function() {
        engine.applyManualAdvertise();
    },
    chatInnGuest: function(guestId) {
        const inn = data.progress.base.inn;
        const guests = inn.guests || [];
        for (let i = 0; i < guests.length; i++) {
            if (guests[i].id === guestId) {
                if (!guests[i].isChatting) {
                    guests[i].isChatting = true;
                    guests[i].chatProgress = 0;
                }
                return;
            }
        }
    },
    buyMineMiner: function() {
        events.buyUpgrade("mine", "gear");
    },
    manualMine: function() {
        engine.applyManualProgressBoost("mine");
    },
    buySmithSmelter: function() {
        events.buyUpgrade("smith", "gear");
    },
    manualSmelt: function() {
        engine.applyManualProgressBoost("smith");
    },
    buyLibrarySkill: function(skillKey) {
        if (skills.keysInOrder.indexOf(skillKey) < 0) {
            return;
        }
        const dSk = skills._byKey[skillKey];
        const cls = data.progress.currentClassKey || "none";
        if (dSk && dSk.classKey && (cls === "none" || cls !== dSk.classKey)) {
            return;
        }
        const lib = data.progress.base.library;
        const rs = lib.skillResearch[skillKey];
        if ((rs && rs.purchased) || lib.unlockedSkills[skillKey]) {
            return;
        }
        const cost = skills.getSkillUnlockCostGold(skillKey);
        if (!events.spendGoldIfPossible(cost)) {
            return;
        }
        lib.skillResearch[skillKey] = {
            purchased: true,
            researched: false,
            paused: false,
            progress: 0,
            required: skills.getSkillresearchRequired(skillKey)
        };
        if (typeof isDebug !== "undefined" && isDebug) {
            const r = lib.skillResearch[skillKey];
            r.progress = r.required || 0;
            r.researched = true;
            lib.unlockedSkills[skillKey] = true;
        }
    },
    toggleLibraryResearchPause: function(skillKey) {
        const lib = data.progress.base && data.progress.base.library;
        if (!lib || !lib.skillResearch || !lib.skillResearch[skillKey]) {
            return;
        }
        const rs = lib.skillResearch[skillKey];
        if (rs.researched) {
            return;
        }
        rs.paused = !rs.paused;
    },
    queueClassSwitch: function(classKey) {
        if (!data.progress.unlockedClasses[classKey]) return;
        if (data.progress.currentClassKey === classKey) return;
        if ((data.progress.classSwitchCooldownMs || 0) > 0) return;
        data.progress.pendingClassKey = classKey;
        data.progress.classSwitchCooldownMs = 300000;
    },
    buyLumberjack: function() {
        events.buyUpgrade("claypit", "gear");
    },
    manualLumber: function() {
        engine.applyManualProgressBoost("claypit");
    },
    buyKilnWorker: function() {
        events.buyUpgrade("kiln", "gear");
    },
    manualSaw: function() {
        engine.applyManualProgressBoost("kiln");
    },
    manualWood: function() {
        engine.applyManualProgressBoost("lumbermill");
    },
    assignWorker: function(kind) {
        if (!engine.tryAssignWorker(kind)) return;
    },
    unassignWorker: function(kind) {
        if (!engine.tryUnassignWorker(kind)) return;
    },
    adjustWorkers: function(kind, mode) {
        if (!mode) return;
        if (mode === "one_inc") {
            engine.tryAssignWorker(kind);
            return;
        }
        if (mode === "one_dec") {
            engine.tryUnassignWorker(kind);
            return;
        }
        if (mode === "ten_inc") {
            for (let i = 0; i < 10; i++) {
                if (!engine.tryAssignWorker(kind)) break;
            }
            return;
        }
        if (mode === "ten_dec") {
            for (let i = 0; i < 10; i++) {
                if (!engine.tryUnassignWorker(kind)) break;
            }
            return;
        }
        if (mode === "all_inc") {
            while (engine.tryAssignWorker(kind)) {}
            return;
        }
        if (mode === "all_dec") {
            while (engine.tryUnassignWorker(kind)) {}
        }
    },
    assignAttribute: function(attributeKey) {
        const chapel = data.progress.base && data.progress.base.chapel;
        if (!chapel || !chapel.plannedGrowthBlessingUnlocked) {
            return;
        }
        const worked = engine.applyAttributePoint(attributeKey, true);
        if (!worked) {
            return;
        }
    },
    clearAttributePlan: function() {
        const chapel = data.progress.base && data.progress.base.chapel;
        if (!chapel || !chapel.plannedGrowthBlessingUnlocked) {
            return;
        }
        data.progress.attributePlan = [];
        initialize.applyPlanForCurrentLevel();
        initialize.calcPlayerStats(false);
    },
    changeMap: function(mapKey) {
        if (mapKey === data.progress.currentMapKey) {
            return;
        }
        const defs = data.progress.mapDefinitions || [];
        let target = null;
        for (let i = 0; i < defs.length; i++) {
            if (defs[i].key === mapKey) {
                target = defs[i];
                break;
            }
        }
        if (!target) {
            return;
        }
        if (!mapData.isMapUnlocked(target, data.progress)) {
            return;
        }
        const reqClass = target.requiredClassKey || "";
        if (reqClass && reqClass !== (data.progress.currentClassKey || "none")) {
            return;
        }
        data.progress.currentMapKey = mapKey;
        const travelSeed = Math.floor(Math.random() * 0x7fffffff) + 1;
        initialize.resetSkillRunProgress();
        initialize.startFreshBattle(travelSeed, mapKey);
    },
    switchTravelSubTab: function(which) {
        data.progress.selectedTravelSubTab = which === "challenges" ? "challenges" : "maps";
        const cls = data.progress.currentClassKey || "none";
        if (cls === "none") {
            data.progress.selectedTravelSubTab = "maps";
        }
        if (typeof view !== "undefined" && view.updateMenuNumbers) {
            view.updateMenuNumbers();
        }
    },
    startHarvest: function(mapKey) {
        const defs = data.progress.mapDefinitions || [];
        let target = null;
        for (let i = 0; i < defs.length; i++) {
            if (defs[i].key === mapKey) {
                target = defs[i];
                break;
            }
        }
        if (!target || target.requiredClassKey) {
            return;
        }
        if (!mapData.isMapUnlocked(target, data.progress)) {
            return;
        }
        if (!engine.isMapHarvestReady(mapKey)) {
            return;
        }
        data.progress.currentMapKey = mapKey;
        initialize.startFreshBattle(Math.floor(Math.random() * 0x7fffffff) + 1, mapKey);
        data.battle.mode = "foraging";
        initialize.calcPlayerStats(true);
    },
    /** Smart Harvest: from 100% cleared (no countdown yet), start the 120s window and begin foraging. */
    startHarvestCountdownAndForage: function(mapKey) {
        const g = data.progress.base && data.progress.base.garden;
        if (!g || !g.smartHarvestUnlocked) {
            return;
        }
        const defs = data.progress.mapDefinitions || [];
        let target = null;
        for (let i = 0; i < defs.length; i++) {
            if (defs[i].key === mapKey) {
                target = defs[i];
                break;
            }
        }
        if (!target || target.requiredClassKey) {
            return;
        }
        if (!mapData.isMapUnlocked(target, data.progress)) {
            return;
        }
        const st = engine.getMapClearState(mapKey);
        if ((st.pct || 0) < 100 || (st.activeMs || 0) > 0) {
            return;
        }
        st.activeMs = gameData.battle.mapHarvestRespawnDurationMs;
        events.startHarvest(mapKey);
    },
    setSandalAttackEnabled: function(enabled) {
        const hasSandal = !!(data.progress.base && data.progress.base.workshop && data.progress.base.workshop.sandalBuilt);
        const classLocked = (data.progress.currentClassKey || "none") === "rogue";
        data.progress.sandalAttackEnabled = (hasSandal && !classLocked) ? !!enabled : false;
        const el = viewData.cached.sandalAttackToggle || document.getElementById("sandalAttackToggle");
        if (el) {
            el.checked = data.progress.sandalAttackEnabled;
        }
    },
    toggleSkillStar: function(skillKey, starType) {
        const valid = { bronze: true, silver: true, gold: true };
        if (!valid[starType]) {
            return;
        }
        const sk = data.progress.skills && data.progress.skills[skillKey];
        const cat = sk ? (sk.category || "combat") : "combat";
        if (!sk || (cat !== "combat" && cat !== "class")) {
            return;
        }
        if (!sk.stars) {
            sk.stars = { bronze: false, silver: false, gold: false };
        }
        const currentlyAssigned = !!sk.stars[starType];
        if (currentlyAssigned) {
            sk.stars[starType] = false;
            data.progress.stars[starType] = (data.progress.stars[starType] || 0) + 1;
            if (typeof view !== "undefined") {
                view.updateSkillRowCompact(skillKey);
                if (data.progress.selectedSkillDetailKey === skillKey) {
                    view.updateSkillInfoPanel();
                }
            }
            return;
        }
        if ((data.progress.stars[starType] || 0) <= 0) {
            return;
        }
        data.progress.stars[starType]--;
        sk.stars[starType] = true;
        if (typeof view !== "undefined") {
            view.updateSkillRowCompact(skillKey);
            if (data.progress.selectedSkillDetailKey === skillKey) {
                view.updateSkillInfoPanel();
            }
        }
    }
}