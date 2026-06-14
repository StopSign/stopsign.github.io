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
            if (data.progress.currentClassKey === "scold") {
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
        const th = data.progress.base && data.progress.base.foxDen;
        return !!(th && th.unlocks && th.unlocks.scrollArchives);
    },
    guestsTabUnlocked: function() {
        const rh = data.progress.base && data.progress.base.foxDen;
        return !!(rh && rh.unlocks && rh.unlocks.inn);
    },
    /** Foraging skills / ScrollArchives foraging tab unlock with Scroll Archives */
    foragingSkillsUnlocked: function() {
        return events.skillsTabUnlocked();
    },
    mainMenuTabOrder: function() {
        if (!(data.progress && data.progress.battleUnlocked)) {
            const preTabs = ["base", "options"];
            if (events.guestsTabUnlocked()) {
                preTabs.splice(2, 0, "guests");
            }
            return preTabs;
        }
        const tabs = ["base", "stats", "skills", "travel", "history", "options"];
        if (events.guestsTabUnlocked()) {
            tabs.splice(2, 0, "guests");
        }
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
    markNewBaseContent: function(buildingKey, optionalFoxDenSubtab) {
        if (!data.progress.baseContentNotify) {
            data.progress.baseContentNotify = { building: {}, subtab: {}, upgradeSeen: {} };
        }
        if (!data.progress.baseContentNotify.building) {
            data.progress.baseContentNotify.building = {};
        }
        if (!data.progress.baseContentNotify.subtab) {
            data.progress.baseContentNotify.subtab = {};
        }
        if (!data.progress.baseContentNotify.upgradeSeen) {
            data.progress.baseContentNotify.upgradeSeen = {};
        }
        if (buildingKey) {
            data.progress.baseContentNotify.building[buildingKey] = true;
        }
        if (optionalFoxDenSubtab) {
            data.progress.baseContentNotify.subtab["foxDen_" + optionalFoxDenSubtab] = true;
        }
    },
    ensureBaseContentNotify: function() {
        if (!data.progress.baseContentNotify) {
            data.progress.baseContentNotify = { building: {}, subtab: {}, upgradeSeen: {} };
        }
        if (!data.progress.baseContentNotify.upgradeSeen) {
            data.progress.baseContentNotify.upgradeSeen = {};
        }
        return data.progress.baseContentNotify;
    },
    markScopeUpgradesSeen: function(scopeKey) {
        const notify = events.ensureBaseContentNotify();
        const seen = notify.upgradeSeen;
        const bcfg = resortData.buildings[scopeKey];
        if (bcfg && bcfg.upgrades) {
            const order = bcfg.upgradesOrder || Object.keys(bcfg.upgrades);
            for (let i = 0; i < order.length; i++) {
                const pk = order[i];
                const u = bcfg.upgrades[pk];
                if (!u) {
                    continue;
                }
                const visible = typeof u.rowVisible === "function" ? u.rowVisible() : true;
                if (visible) {
                    seen[scopeKey + ":" + pk] = true;
                }
            }
        }
        if (scopeKey === "foxDen") {
            const rh = data.progress.base && data.progress.base.foxDen;
            const unlocks = rh && rh.unlocks ? rh.unlocks : {};
            const unlockOrder = resortData.foxDenUnlockOrder || [];
            for (let ui = 0; ui < unlockOrder.length; ui++) {
                const uk = unlockOrder[ui];
                if (!unlocks[uk]) {
                    seen["foxDenUnlock:" + uk] = true;
                }
            }
        }
    },
    syncBaseContentNotifications: function() {
        const notify = events.ensureBaseContentNotify();
        const seen = notify.upgradeSeen;
        const rh = data.progress.base && data.progress.base.foxDen;
        const unlocks = rh && rh.unlocks ? rh.unlocks : {};
        const unlockOrder = resortData.foxDenUnlockOrder || [];
        for (let ui = 0; ui < unlockOrder.length; ui++) {
            const uk = unlockOrder[ui];
            if (!unlocks[uk]) {
                const seenKey = "foxDenUnlock:" + uk;
                if (!seen[seenKey]) {
                    events.markNewBaseContent("foxDen");
                    const hasMapButton = !!resortData.baseBuildingDisplayNames[uk];
                    if (hasMapButton) {
                        events.markNewBaseContent(uk === "scrollArchives" ? "scrollArchives" : uk);
                    }
                }
            }
        }
        const upgradeScopes = ["torii", "hiddenSpring", "inn", "path", "chapel", "garden", "atelier", "bonfire", "scrollArchives"];
        for (let si = 0; si < upgradeScopes.length; si++) {
            const scopeKey = upgradeScopes[si];
            const bcfg = resortData.buildings[scopeKey];
            if (!bcfg || !bcfg.upgrades) {
                continue;
            }
            const order = bcfg.upgradesOrder || Object.keys(bcfg.upgrades);
            for (let oi = 0; oi < order.length; oi++) {
                const pk = order[oi];
                const u = bcfg.upgrades[pk];
                if (!u) {
                    continue;
                }
                const visible = typeof u.rowVisible === "function" ? u.rowVisible() : true;
                const soldOut = typeof u.upgradeSoldOut === "function" && u.upgradeSoldOut();
                const canBuy = typeof u.canBuy === "function" ? u.canBuy() : true;
                const seenKey = scopeKey + ":" + pk;
                if (visible && !soldOut && canBuy && !seen[seenKey]) {
                    const notifyKey = scopeKey === "scrollArchives" ? "scrollArchives" : scopeKey;
                    events.markNewBaseContent(notifyKey);
                }
            }
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
        const valid = ["combat", "resort", "foraging", "class"];
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
    switchScrollArchivesTab: function(tabKey) {
        const valid = ["combat", "resort", "foraging", "class"];
        let t = valid.indexOf(tabKey) >= 0 ? tabKey : "combat";
        if (t === "foraging" && !events.foragingSkillsUnlocked()) {
            t = "combat";
        }
        data.progress.selectedScrollArchivesTab = t;
    },
    switchCompactPane: function(paneKey) {
        const valid = ["menus", "battle"];
        data.progress.compactViewPane = valid.indexOf(paneKey) >= 0 ? paneKey : "menus";
        view.updateCompactLayout();
        createView.updateLayoutMeasurements();
    },
    bindBaseBuildingInfoDismiss: function() {
        if (document._baseBuildingInfoDismissBound) {
            return;
        }
        document._baseBuildingInfoDismissBound = true;
        document.addEventListener("click", function(e) {
            if (!data.progress || !data.progress.selectedBaseBuilding) {
                return;
            }
            const panel = viewData.cached.baseBuildingInfo || document.getElementById("baseBuildingInfo");
            if (!panel || panel.style.display === "none") {
                return;
            }
            if (panel.contains(e.target)) {
                return;
            }
            if (e.target.closest(".base-building-label, .resort-building-map-btn, .resort-building-label, .path-seg-hit, .spirit-slot, .spirit-slot-btn, .mine-block-btn")) {
                return;
            }
            events.closeBaseBuildingInfo();
        });
    },
    bindBaseMapRightClick: function() {
        const map = document.getElementById("baseResortMap");
        if (!map || map._rightClickBound) {
            return;
        }
        map._rightClickBound = true;
        map.addEventListener("contextmenu", function(e) {
            const path = e.target.closest(".path-seg-hit");
            if (path) {
                e.preventDefault();
                const idx = parseInt(path.getAttribute("data-segment-index"), 10);
                if (!isNaN(idx)) {
                    events.rightClickPathSegment(idx);
                }
                return;
            }
            const btn = e.target.closest(".base-building-label, .resort-building-map-btn");
            if (!btn || !btn.id || btn.id.indexOf("baseBuilding_") !== 0) {
                return;
            }
            const key = btn.id.slice("baseBuilding_".length);
            if (key === "path" || key === "hiddenSpring") {
                return;
            }
            e.preventDefault();
            events.rightClickBaseBuilding(key);
        });
    },
    rightClickBaseBuilding: function(buildingKey) {
        const alreadySelected = data.progress.selectedBaseBuilding === buildingKey && !data.progress.selectedSpiritId;
        if (!alreadySelected) {
            events.selectBaseBuilding(buildingKey);
        }
        const keys = resortData.okamiAssignableSiteKeys || [];
        if (keys.indexOf(buildingKey) >= 0) {
            events.assignOkami(buildingKey);
        }
    },
    rightClickPathSegment: function(segmentIndex) {
        if (!engine.isPathSegmentAccessible(segmentIndex)) {
            return;
        }
        const alreadySelected = data.progress.selectedBaseBuilding === "path"
            && data.progress.selectedPathSegmentIndex === segmentIndex
            && !data.progress.selectedSpiritId;
        if (!alreadySelected) {
            events.selectBaseBuilding("path", segmentIndex);
        }
        data.progress.selectedPathSegmentIndex = segmentIndex;
        const nextKey = engine.getNextPathUpgradeKey(segmentIndex);
        if (nextKey) {
            events.buyUpgrade("path", nextKey);
        }
    },
    bindPathSegmentSvgHandlers: function() {
        const hitLayer = document.getElementById("pathSegmentHitLayer");
        if (!hitLayer || hitLayer._pathSegBound) {
            return;
        }
        hitLayer._pathSegBound = true;
        hitLayer.addEventListener("click", function(e) {
            const path = e.target.closest(".path-seg-hit");
            if (!path) {
                return;
            }
            const idx = parseInt(path.getAttribute("data-segment-index"), 10);
            if (!isNaN(idx)) {
                events.selectBaseBuilding("path", idx);
            }
        });
        hitLayer.addEventListener("mouseover", function(e) {
            const path = e.target.closest(".path-seg-hit");
            if (!path) {
                return;
            }
            const idx = parseInt(path.getAttribute("data-segment-index"), 10);
            if (!isNaN(idx)) {
                view.updatePathSegmentHighlight(idx);
            }
        });
        hitLayer.addEventListener("mouseout", function(e) {
            if (!e.relatedTarget || !hitLayer.contains(e.relatedTarget)) {
                view.updatePathSegmentHighlight(null);
            }
        });
    },
    selectBaseBuilding: function(buildingKey, pathSegmentIndex) {
        if (buildingKey === "path") {
            const idx = pathSegmentIndex;
            if (idx === undefined || idx === null || isNaN(idx)) {
                return;
            }
            if (!engine.isPathSegmentAccessible(idx)) {
                return;
            }
            if (data.progress.selectedBaseBuilding === "path" && data.progress.selectedPathSegmentIndex === idx && !data.progress.selectedSpiritId) {
                data.progress.selectedBaseBuilding = "";
                data.progress.selectedPathSegmentIndex = null;
                data.progress.selectedResortInfoType = "";
                events.showSelectedBaseBuildingPanels("");
                return;
            }
            data.progress.selectedSpiritId = null;
            data.progress.selectedBaseBuilding = "path";
            data.progress.selectedPathSegmentIndex = idx;
            data.progress.selectedResortInfoType = "path";
            if (data.progress.baseContentNotify && data.progress.baseContentNotify.building) {
                delete data.progress.baseContentNotify.building.path;
            }
            events.markScopeUpgradesSeen("path");
            events.showSelectedBaseBuildingPanels("path");
            return;
        }
        if (buildingKey && engine.isFoxDenConstructionActive(buildingKey)) {
            return;
        }
        if (buildingKey === "hiddenSpring" && !engine.isMapElementRevealed("hiddenSpring")) {
            return;
        }
        if (buildingKey === "mine" && !engine.isMapElementRevealed("mine")) {
            return;
        }
        if (resortData.baseBuildingOrder.indexOf(buildingKey) < 0) {
            return;
        }
        if (data.progress.selectedBaseBuilding === buildingKey && !data.progress.selectedSpiritId) {
            data.progress.selectedBaseBuilding = "";
            data.progress.selectedPathSegmentIndex = null;
            data.progress.selectedResortInfoType = "";
            events.showSelectedBaseBuildingPanels("");
            return;
        }
        data.progress.selectedSpiritId = null;
        data.progress.selectedPathSegmentIndex = null;
        data.progress.selectedBaseBuilding = buildingKey;
        data.progress.selectedResortInfoType = buildingKey;
        if (data.progress.baseContentNotify && data.progress.baseContentNotify.building) {
            delete data.progress.baseContentNotify.building[buildingKey];
        }
        events.markScopeUpgradesSeen(buildingKey);
        events.showSelectedBaseBuildingPanels(buildingKey);
    },
    applyBaseBuildingInfoOverlay: function(buildingKey) {
        const infoPanel = viewData.cached.baseBuildingInfo || document.getElementById("baseBuildingInfo");
        if (infoPanel) {
            infoPanel.classList.remove("info-overlay-top", "info-overlay-bottom");
        }
        view.updateBaseBuildingInfoLayout();
    },
    showSelectedBaseBuildingPanels: function(buildingKey) {
        const resortInfoExtras = ["spirit", "path"];
        events.applyBaseBuildingInfoOverlay(buildingKey);
        for (let ri = 0; ri < resortData.baseBuildingOrder.length; ri++) {
            const rk = resortData.baseBuildingOrder[ri];
            if (viewData.cached[`resortInfo_${rk}`]) {
                view.updateVal(`resortInfo_${rk}`, rk === buildingKey ? "block" : "none", "style.display");
            }
        }
        for (let ei = 0; ei < resortInfoExtras.length; ei++) {
            const ek = resortInfoExtras[ei];
            view.updateVal(`resortInfo_${ek}`, ek === buildingKey ? "block" : "none", "style.display");
        }
        if (!buildingKey || buildingKey === "spirit" || buildingKey === "path") {
            view.syncMapBuildingSelection("");
        } else {
            view.syncMapBuildingSelection(buildingKey);
        }
        view.updatePathSegmentHighlight(buildingKey === "path" ? viewData.pathSegmentHoverIndex : null);
        view.updateVal("resortInfo_empty", buildingKey ? "none" : "block", "style.display");
        view.updateCompactLayout();
        if (buildingKey === "spirit") {
            view.updateResortMapTokens();
        }
        if (buildingKey && (buildingKey === "spirit" || buildingKey === "path" || viewData.cached[`resortInfo_${buildingKey}`])) {
            return;
        }
        for (let i = 0; i < resortData.baseBuildingOrder.length; i++) {
            const k = resortData.baseBuildingOrder[i];
            if (viewData.cached[`basePanel_${k}`]) {
                view.updateVal(`basePanel_${k}`, k === buildingKey ? "" : "none", "style.display");
            }
        }
        if (typeof view.updateBasePanel === "function") {
            view.updateBasePanel();
        }
    },
    toggleDebugGameSpeed: function(multiplier) {
        if (typeof isDebug === "undefined" || !isDebug) {
            return;
        }
        const gs = data.gameSettings;
        const current = gs.debugSpeedMultiplier || 0;
        if (current === multiplier) {
            gs.gameSpeed = 1;
            gs.debugSpeedMultiplier = 0;
        } else {
            gs.gameSpeed = multiplier;
            gs.debugSpeedMultiplier = multiplier;
        }
        view.updateDebugSpeedButtons();
    },
    buyUpgrade: function(scopeKey, upgradeKey) {
        if (scopeKey === "path") {
            const segIdx = data.progress.selectedPathSegmentIndex;
            if (segIdx === undefined || segIdx === null) {
                return;
            }
            const pathWeaveKeys = resortData.buildings.path.upgradesOrder || [];
            let weaveUi = null;
            for (let pwi = 0; pwi < pathWeaveKeys.length; pwi++) {
                const ui = engine.getPathUpgradeWeaveUi(segIdx, pathWeaveKeys[pwi]);
                if (ui && ui.label === "Resume") {
                    weaveUi = ui;
                    break;
                }
            }
            if (weaveUi && weaveUi.label === "Resume") {
                engine.resumePathJobForSegment(segIdx);
                return;
            }
            if (weaveUi && weaveUi.disabled) {
                return;
            }
            const up = engine.getUpgradeDef("path", upgradeKey);
            if (!up || (up.canBuy && !up.canBuy())) {
                return;
            }
            if (upgradeKey !== "removeRocks") {
                const cost = typeof up.getCost === "function" ? up.getCost() : (up.cost || {});
                if (!resortData.canAffordCost(cost)) {
                    return;
                }
                resortData.deductCost(cost);
            }
            engine.startPathSegmentJob(segIdx, upgradeKey);
            return;
        }
        if (scopeKey === "foxDenUnlock") {
            const rh = data.progress.base.foxDen;
            if (rh.unlocks[upgradeKey]) {
                return;
            }
            const site = rh.constructionSites && rh.constructionSites[upgradeKey];
            if (site && site.status === "building") {
                if (site.paused && !engine.canResumeFoxDenJob()) {
                    view.flashFoxDenQueueFull();
                    return;
                }
                engine.toggleBuildingGatherPause(upgradeKey);
                return;
            }
            if (!engine.canEnqueueFoxDenJob()) {
                view.flashFoxDenQueueFull();
                return;
            }
            engine.planFoxDenConstruction(upgradeKey);
            return;
        }
        const bcfg = resortData.buildings[scopeKey];
        const up = bcfg && bcfg.upgrades && bcfg.upgrades[upgradeKey];
        if (!up) {
            return;
        }
        if (up.instantPurchase) {
            if (up.canBuy && !up.canBuy()) {
                return;
            }
            const cost = resortData.resolveCost(up, scopeKey);
            if (!resortData.canAffordCost(cost)) {
                return;
            }
            resortData.deductCost(cost);
            if (up.onBuy) {
                up.onBuy();
            }
            return;
        }
        const purchaseUi = engine.getUpgradePurchaseUi(scopeKey, upgradeKey);
        if (!purchaseUi) {
            return;
        }
        if (purchaseUi.mode === "weaving" || purchaseUi.mode === "soldOut") {
            return;
        }
        if (purchaseUi.mode === "weavePaused") {
            engine.resumeWeaving(scopeKey, upgradeKey);
            return;
        }
        if (purchaseUi.mode === "idle") {
            if (purchaseUi.disabled) {
                return;
            }
            if (!engine.canEnqueueFoxDenJob()) {
                view.flashFoxDenQueueFull();
                return;
            }
            engine.enqueueUpgradeGather(scopeKey, upgradeKey);
            return;
        }
        if (purchaseUi.mode === "paused") {
            if (!engine.canResumeFoxDenJob()) {
                view.flashFoxDenQueueFull();
                return;
            }
            engine.toggleUpgradeGatherPause(scopeKey, upgradeKey);
            return;
        }
        if (purchaseUi.mode === "ready") {
            engine.startUpgradeWeave(scopeKey, upgradeKey);
        }
    },
    assignOkami: function(buildingKey) {
        const keys = resortData.okamiAssignableSiteKeys || [];
        if (keys.indexOf(buildingKey) < 0) {
            return;
        }
        if (engine.isOkamiWeaving()) {
            return;
        }
        const okami = engine.getOkami();
        if (okami.assignedBuildingKey === buildingKey) {
            okami.assignedBuildingKey = "";
            if (buildingKey === "foxDen") {
                engine.syncFoxDenCarriersToWorkforce();
            }
            if (buildingKey === "bambooForest") {
                engine.clearBambooCutIfNoWorkers();
            }
            return;
        }
        const prevAssign = okami.assignedBuildingKey;
        if (prevAssign === "foxDen" && buildingKey !== "foxDen") {
            okami.assignedBuildingKey = "";
            engine.syncFoxDenCarriersToWorkforce();
        }
        if (okami.pathJob && !okami.pathJob.paused) {
            engine.pauseOkamiPathJob();
        }
        okami.assignedBuildingKey = buildingKey;
        okami.lastAssignedBuildingKey = buildingKey;
        if (prevAssign === "bambooForest" && buildingKey !== "bambooForest") {
            engine.clearBambooCutIfNoWorkers();
        }
        if (buildingKey === "foxDen") {
            engine.syncFoxDenCarriersToWorkforce();
        }
    },
    goToOkamiAssignment: function() {
        const okami = engine.getOkami();
        if (!okami.assignedBuildingKey || (data.progress.weaving && data.progress.weaving.active)) {
            return;
        }
        const pathIdx = engine.parsePathAssignmentKey(okami.assignedBuildingKey);
        events.switchTab("base");
        if (pathIdx !== null) {
            if (data.progress.selectedBaseBuilding === "path" && data.progress.selectedPathSegmentIndex === pathIdx && !data.progress.selectedSpiritId) {
                return;
            }
            events.selectBaseBuilding("path", pathIdx);
            return;
        }
        if (data.progress.selectedBaseBuilding === okami.assignedBuildingKey && !data.progress.selectedSpiritId) {
            return;
        }
        events.selectBaseBuilding(okami.assignedBuildingKey);
    },
    buyAssembleEarthSpirit: function() {
        events.buyUpgrade("hiddenSpring", "assembleEarthSpirit");
    },
    closeBaseBuildingInfo: function() {
        data.progress.selectedBaseBuilding = "";
        data.progress.selectedPathSegmentIndex = null;
        data.progress.selectedSpiritId = null;
        data.progress.selectedResortInfoType = "";
        events.showSelectedBaseBuildingPanels("");
    },
    clickSpiritSlot: function(kind, location, slotIndex) {
        if (kind !== "earth" && kind !== "water" && kind !== "fire" && kind !== "plant") {
            return;
        }
        if (kind === "plant" && location !== "bambooForest") {
            return;
        }
        if (kind !== "earth" && kind !== "plant" && location !== "hiddenSpring") {
            return;
        }
        const selected = engine.getSpiritById(data.progress.selectedSpiritId);
        const occupant = engine.getSpiritAtLocation(location, slotIndex, kind);
        const canMoveKind = selected && selected.kind === kind && (
            (kind === "plant" && location === "bambooForest") ||
            (kind === "earth" && (location === "hiddenSpring" || location === "mine")) ||
            ((kind === "water" || kind === "fire") && location === "hiddenSpring")
        );
        const isSameSlot = selected
            && (selected.location || (kind === "plant" ? "bambooForest" : "hiddenSpring")) === location
            && (selected.slot || 0) === slotIndex;
        if (canMoveKind && !isSameSlot) {
            engine.moveSelectedSpiritTo(location, slotIndex);
            data.progress.selectedBaseBuilding = "spirit";
            data.progress.selectedResortInfoType = "spirit";
            events.showSelectedBaseBuildingPanels("spirit");
            view.updateSpiritInfo();
            view.updateResortMapTokens();
            return;
        }
        if (occupant) {
            data.progress.selectedSpiritId = occupant.id;
            data.progress.selectedBaseBuilding = "spirit";
            data.progress.selectedResortInfoType = "spirit";
            events.showSelectedBaseBuildingPanels("spirit");
            view.updateSpiritInfo();
            view.updateResortMapTokens();
        }
    },
    toggleBambooCut: function(stalkIndex) {
        engine.toggleBambooCut(stalkIndex);
    },
    toggleGardenAutoWeaveOnGather: function(checked) {
        const g = data.progress.base && data.progress.base.garden;
        if (g) {
            g.autoWeaveOnGatherComplete = !!checked;
        }
    },
    toggleGardenAutoWeaveCheapestReady: function(checked) {
        const g = data.progress.base && data.progress.base.garden;
        if (g) {
            g.autoWeaveCheapestReady = !!checked;
        }
    },
    toggleBambooAutoRotate: function(checked) {
        const bf = engine.ensureBambooForestState();
        if (bf) {
            bf.autoRotateHarvest = !!checked;
        }
    },
    changeMineDepth: function(delta) {
        engine.changeMineDepth(delta);
    },
    spendCoinsIfPossible: function(cost) {
        if (data.progress.coins < cost) {
            return false;
        }
        data.progress.coins -= cost;
        return true;
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
    buyScrollArchivesSkill: function(skillKey) {
        if (skills.keysInOrder.indexOf(skillKey) < 0) {
            return;
        }
        const dSk = skills._byKey[skillKey];
        const cls = data.progress.currentClassKey || "none";
        if (dSk && dSk.classKey && (cls === "none" || cls !== dSk.classKey)) {
            return;
        }
        const lib = data.progress.base.scrollArchives;
        const rs = lib.skillResearch[skillKey];
        if ((rs && rs.purchased) || lib.unlockedSkills[skillKey]) {
            return;
        }
        const cost = skills.getSkillUnlockCostCoins(skillKey);
        if (!events.spendCoinsIfPossible(cost)) {
            return;
        }
        lib.skillResearch[skillKey] = {
            purchased: true,
            researched: false,
            paused: false,
            progress: 0,
            required: skills.getSkillresearchRequired(skillKey)
        };
    },
    toggleScrollArchivesResearchPause: function(skillKey) {
        const lib = data.progress.base && data.progress.base.scrollArchives;
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
    /** Smart Forage: from 100% cleared (no countdown yet), start the 120s window and begin foraging. */
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
        const hasSandal = !!(data.progress.base && data.progress.base.atelier && data.progress.base.atelier.sandalBuilt);
        const classLocked = (data.progress.currentClassKey || "none") === "scold";
        data.progress.sandalAttackEnabled = (hasSandal && !classLocked) ? !!enabled : false;
        const el = viewData.cached.sandalAttackToggle || document.getElementById("sandalAttackToggle");
        if (el) {
            el.checked = data.progress.sandalAttackEnabled;
        }
    },
    toggleSkillStar: function(skillKey, starType) {
        const valid = { bronze: true, silver: true, coins: true };
        if (!valid[starType]) {
            return;
        }
        const sk = data.progress.skills && data.progress.skills[skillKey];
        const cat = sk ? (sk.category || "combat") : "combat";
        if (!sk || (cat !== "combat" && cat !== "class")) {
            return;
        }
        if (!sk.stars) {
            sk.stars = { bronze: false, silver: false, coins: false };
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