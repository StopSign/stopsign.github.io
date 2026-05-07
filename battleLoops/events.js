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
                data.progress.rangedAttackEnabled = false;
            }
            const mapDef = initialize.getCurrentMapDefinition();
            const reqClass = mapDef && mapDef.requiredClassKey ? mapDef.requiredClassKey : "";
            if (reqClass && reqClass !== data.progress.currentClassKey) {
                data.progress.currentMapKey = "map_1";
            }
        }
        initialize.resetBattleFromSeed();
    },
    switchTab: function(tabKey) {
        const validTabs = ["base", "leveling", "stats", "skills", "travel", "history", "options"];
        data.battle.currentTab = validTabs.indexOf(tabKey) >= 0 ? tabKey : "leveling";
        createView.showCurrentTab();
    },
    setHideMaxedUpgrades: function(enabled) {
        data.progress.options.hideMaxedUpgrades = !!enabled;
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
        const valid = ["combat", "town", "class"];
        data.progress.selectedSkillsTab = valid.indexOf(tabKey) >= 0 ? tabKey : "combat";
        createView.createSkillElements();
        createView.clearCacheQueue();
    },
    switchLibraryTab: function(tabKey) {
        const valid = ["combat", "town", "class"];
        data.progress.selectedLibraryTab = valid.indexOf(tabKey) >= 0 ? tabKey : "combat";
    },
    switchCompactPane: function(paneKey) {
        const valid = ["menus", "battle"];
        data.progress.compactViewPane = valid.indexOf(paneKey) >= 0 ? paneKey : "menus";
        view.updateCompactLayout();
        createView.updateLayoutMeasurements();
    },
    selectBaseBuilding: function(buildingKey) {
        if (baseBuildingKeys.indexOf(buildingKey) < 0) {
            return;
        }
        data.progress.selectedBaseBuilding = buildingKey;
        events.showSelectedBaseBuildingPanels(buildingKey);
    },
    showSelectedBaseBuildingPanels: function(buildingKey) {
        const keys = ["chapel", "mine", "smith", "inn", "guild", "library", "lumbermill", "sawmill", "workshop", "garden"];
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            view.updateVal(`basePanel_${k}`, k === buildingKey ? "" : "none", "style.display");
        }
    },
    spendGoldIfPossible: function(cost) {
        if (data.progress.gold < cost) {
            return false;
        }
        data.progress.gold -= cost;
        return true;
    },
    buyChapelAutoRetry: function() {
        const base = data.progress.base;
        if (!base || base.chapel.autoRetryEnabled) {
            return;
        }
        if (!events.spendGoldIfPossible(50)) {
            return;
        }
        base.chapel.autoRetryEnabled = true;
        if (data.battle && data.battle.state === "dead") {
            data.progress.autoRetryCountdownSec = 10;
        }
    },
    buyInnOpenForGuests: function() {
        const inn = data.progress.base.inn;
        if (inn.openForGuests) {
            return;
        }
        if (!events.spendGoldIfPossible(100)) {
            return;
        }
        inn.openForGuests = true;
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
    buyMineMiner: function() { events.buyWorkerGear("mine"); },
    manualMine: function() {
        engine.applyManualProgressBoost("mine");
    },
    buySmithSmelter: function() { events.buyWorkerGear("smith"); },
    manualSmelt: function() {
        engine.applyManualProgressBoost("smith");
    },
    buySmithAttackUpgrade: function() {
        const smith = data.progress.base.smith;
        const res = data.progress.base.resources;
        if (smith.attackUpgradesBought >= 10) {
            return;
        }
        const cost = smith.nextAttackUpgradeCostBars;
        if (res.ironBar < cost) {
            return;
        }
        res.ironBar -= cost;
        smith.attackUpgradesBought++;
        smith.nextAttackUpgradeCostBars += 20;
        initialize.calcPlayerStats(false);
    },
    buySmithArmorUpgrade: function() {
        const smith = data.progress.base.smith;
        const res = data.progress.base.resources;
        if (smith.armorUpgradesBought >= 6) {
            return;
        }
        if (res.ironBar < 30) {
            return;
        }
        res.ironBar -= 30;
        smith.armorUpgradesBought++;
        initialize.calcPlayerStats(false);
    },
    buyWorkshopBow: function() {
        const w = data.progress.base.workshop;
        const res = data.progress.base.resources;
        if (w.bowBuilt) {
            return;
        }
        if (data.progress.gold < 200 || res.cutStone < 20) {
            return;
        }
        data.progress.gold -= 200;
        res.cutStone -= 20;
        w.bowBuilt = true;
        data.progress.rangedAttackEnabled = true;
    },
    buyLibrarySkill: function(skillKey) {
        if (skills.keysInOrder.indexOf(skillKey) < 0) {
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
            required: cost * skills.getSkillResearchCostMultiplier(skillKey)
        };
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
    buyLibraryDesk: function() {
        const lib = data.progress.base && data.progress.base.library;
        const res = data.progress.base && data.progress.base.resources;
        if (!lib || !res) {
            return;
        }
        if (data.progress.gold < (lib.nextGearGoldCost || 0)) {
            return;
        }
        if (res.cutStone < (lib.nextGearStoneCost || 0)) {
            return;
        }
        data.progress.gold -= (lib.nextGearGoldCost || 0);
        res.cutStone -= (lib.nextGearStoneCost || 0);
        lib.gearSets = (lib.gearSets || 0) + 1;
        lib.nextGearGoldCost = (lib.nextGearGoldCost || 10) + 10;
        lib.nextGearStoneCost = (lib.nextGearStoneCost || 0) + 5;
    },
    buyClass: function(classKey) {
        const d = initialize.getClassDef(classKey);
        if (!d || d.key === "none") return;
        if (data.progress.unlockedClasses[classKey]) return;
        if (!events.spendGoldIfPossible(d.buyCostGold || 500)) return;
        data.progress.unlockedClasses[classKey] = true;
    },
    queueClassSwitch: function(classKey) {
        if (!data.progress.unlockedClasses[classKey]) return;
        if (data.progress.currentClassKey === classKey) return;
        data.progress.pendingClassKey = classKey;
    },
    buyLumberjack: function() { events.buyWorkerGear("lumbermill"); },
    manualLumber: function() {
        engine.applyManualProgressBoost("lumbermill");
    },
    buySawmillWorker: function() { events.buyWorkerGear("sawmill"); },
    manualSaw: function() {
        engine.applyManualProgressBoost("sawmill");
    },
    buyWorkshopInnRoom: function() {
        const w = data.progress.base.workshop;
        if (!w || w.innRoomUpgradesBought >= 7) {
            return;
        }
        const res = data.progress.base.resources;
        if (data.progress.gold < w.innRoomNextGoldCost || res.cutStone < w.innRoomNextLumberCost) {
            return;
        }
        data.progress.gold -= w.innRoomNextGoldCost;
        res.cutStone -= w.innRoomNextLumberCost;
        w.innRoomUpgradesBought++;
        w.innRoomNextGoldCost += 100;
        w.innRoomNextLumberCost += 10;
    },
    buyWorkerGear: function(kind) {
        const b = data.progress.base && data.progress.base[kind];
        const res = data.progress.base && data.progress.base.resources;
        if (!b || !res) return;
        if (data.progress.gold < (b.nextGearGoldCost || 0)) return;
        if (res.ironBar < (b.nextGearBarsCost || 0)) return;
        data.progress.gold -= (b.nextGearGoldCost || 0);
        res.ironBar -= (b.nextGearBarsCost || 0);
        b.gearSets = (b.gearSets || 0) + 1;
        b.nextGearGoldCost = (b.nextGearGoldCost || 20) + 10;
        b.nextGearBarsCost = (b.nextGearBarsCost || 0) + 2;
    },
    assignWorker: function(kind) {
        if (!engine.tryAssignWorker(kind)) return;
    },
    unassignWorker: function(kind) {
        if (!engine.tryUnassignWorker(kind)) return;
    },
    buyGardenMapManual: function(kind) {
        const g = data.progress.base.garden;
        const map = {
            inn: "mapManualInn",
            mine: "mapManualMine",
            smith: "mapManualSmith",
            lumbermill: "mapManualLumbermill",
            sawmill: "mapManualSawmill"
        };
        const key = map[kind];
        if (!key || g[key]) {
            return;
        }
        if (!events.spendGoldIfPossible(200)) {
            return;
        }
        g[key] = true;
    },
    assignAttribute: function(attributeKey) {
        const worked = engine.applyAttributePoint(attributeKey, true);
        if (!worked) {
            return;
        }
    },
    clearAttributePlan: function() {
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
        const reqClass = target.requiredClassKey || "";
        if (reqClass && reqClass !== (data.progress.currentClassKey || "none")) {
            return;
        }
        data.progress.currentMapKey = mapKey;
        const travelSeed = Math.floor(Math.random() * 0x7fffffff) + 1;
        initialize.resetSkillRunProgress();
        initialize.startFreshBattle(travelSeed, mapKey);
    },
    setRangedAttackEnabled: function(enabled) {
        const hasBow = !!(data.progress.base && data.progress.base.workshop && data.progress.base.workshop.bowBuilt);
        const classLocked = (data.progress.currentClassKey || "none") === "rogue";
        data.progress.rangedAttackEnabled = (hasBow && !classLocked) ? !!enabled : false;
        const el = viewData.cached.rangedAttackToggle || document.getElementById("rangedAttackToggle");
        if (el) {
            el.checked = data.progress.rangedAttackEnabled;
        }
    },
    toggleSkillWrap: function(skillKey) {
        const wrap = document.getElementById(`skill_wrap_${skillKey}`);
        if (!wrap) {
            return;
        }
        wrap.classList.toggle("skill-block--expanded");
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
            return;
        }
        if ((data.progress.stars[starType] || 0) <= 0) {
            return;
        }
        data.progress.stars[starType]--;
        sk.stars[starType] = true;
    }
}