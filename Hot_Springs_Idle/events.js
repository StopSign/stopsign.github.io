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
        if (bonfire.isApplyLiveSettingsToNextClone()) {
            bonfire.startNextClone();
            return;
        }
        if (data.battle && data.battle.cloneRunSettings) {
            if (!bonfire.retryWithStoredSettings()) {
                return;
            }
            return;
        }
        initialize.resetBattleFromSeed();
    },
    endRunNow: function() {
        if (!data.battle || data.battle.state !== "running") {
            return;
        }
        data.battle.player.aud = 0;
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
    /** Foraging skills / Scroll Archives foraging tab unlock with Scroll Archives */
    foragingSkillsUnlocked: function() {
        return events.skillsTabUnlocked();
    },
    /** Map harvest / intruder-clear forage - unlock condition TBD */
    harvestForageUnlocked: function() {
        return false;
    },
    markTabNotify: function(tabKey) {
        data.progress.baseContentNotify.tab[tabKey] = true;
    },
    markTabSeen: function(tabKey) {
        const notify = data.progress.baseContentNotify;
        delete notify.tab[tabKey];
        notify.tabSeen[tabKey] = true;
    },
    setNumberType: function(numberType) {
        const valid = ["numberSuffix", "scientific", "engineering"];
        if (valid.indexOf(numberType) < 0) {
            return;
        }
        data.gameSettings.numberType = numberType;
        if (typeof view !== "undefined" && view.invalidateFormattedNumberCache) {
            view.invalidateFormattedNumberCache();
        }
    },
    syncNumberTypeRadiosFromSettings: function() {
        const t = (data.gameSettings && data.gameSettings.numberType) || "numberSuffix";
        const ids = { numberSuffix: "numberTypeSuffix", scientific: "numberTypeScientific", engineering: "numberTypeEngineering" };
        for (const k in ids) {
            const el = document.getElementById(ids[k]);
            if (el) {
                el.checked = k === t;
            }
        }
    },
    setOfflineProgressMode: function(mode) {
        const valid = ["catchUp", "pauseBonus"];
        if (valid.indexOf(mode) < 0) {
            return;
        }
        data.gameSettings.offlineProgressMode = mode;
        if (typeof view !== "undefined" && view.updateOptionsTab) {
            view.updateOptionsTab();
        }
    },
    syncOfflineProgressModeRadiosFromSettings: function() {
        const t = (data.gameSettings && data.gameSettings.offlineProgressMode) || "catchUp";
        const ids = { catchUp: "offlineModeCatchUp", pauseBonus: "offlineModePauseBonus" };
        for (const k in ids) {
            const el = document.getElementById(ids[k]);
            if (el) {
                el.checked = k === t;
            }
        }
    },
    mainMenuTabOrder: function() {
        if (!(data.progress && data.progress.battleUnlocked)) {
            const preTabs = ["base", "options"];
            if (events.guestsTabUnlocked()) {
                preTabs.splice(2, 0, "guests");
            }
            if (data.progress.hasMovedToNewMountain) {
                const optIx = preTabs.indexOf("options");
                if (optIx >= 0) {
                    preTabs.splice(optIx, 0, "cardBonuses");
                }
            }
            return preTabs;
        }
        const tabs = ["base", "stats", "skills", "travel", "history", "options"];
        if (events.guestsTabUnlocked()) {
            tabs.splice(2, 0, "guests");
        }
        const bf = data.progress.base && data.progress.base.bonfire;
        if (bf && bf.growthBlessingUnlocked) {
            tabs.splice(1, 0, "leveling");
        }
        if (!events.skillsTabUnlocked()) {
            const ix = tabs.indexOf("skills");
            if (ix >= 0) tabs.splice(ix, 1);
        }
        if (data.progress.hasMovedToNewMountain) {
            const optIx = tabs.indexOf("options");
            if (optIx >= 0) {
                tabs.splice(optIx, 0, "cardBonuses");
            }
        }
        return tabs;
    },
    switchTab: function(tabKey) {
        const validTabs = events.mainMenuTabOrder();
        data.battle.currentTab = validTabs.indexOf(tabKey) >= 0 ? tabKey : "base";
        events.markTabSeen(tabKey);
        createView.showCurrentTab();
        view.updateCompactLayout();
        createView.updateLayoutMeasurements();
        if (typeof view !== "undefined" && view.updateMenuNumbers) {
            view.updateMenuNumbers();
        }
    },
    markNewBaseContent: function(buildingKey, optionalFoxDenSubtab) {
        const notify = data.progress.baseContentNotify;
        if (buildingKey) {
            notify.building[buildingKey] = true;
        }
        if (optionalFoxDenSubtab) {
            notify.subtab["foxDen_" + optionalFoxDenSubtab] = true;
        }
    },
    markScopeUpgradesSeen: function(scopeKey) {
        const notify = data.progress.baseContentNotify;
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
    },
    /** Fox Den badge only when a plan row goes from hidden to visible. */
    syncFoxDenRevealNotifications: function() {
        const rh = data.progress.base && data.progress.base.foxDen;
        const unlocks = rh && rh.unlocks ? rh.unlocks : {};
        const order = resortData.getFoxDenUnlockOrder();
        const prev = events._foxDenPlanRowShown;
        if (!prev) {
            events._foxDenPlanRowShown = {};
            for (let i = 0; i < order.length; i++) {
                const uk = order[i];
                events._foxDenPlanRowShown[uk] = !!unlocks[uk] || !!engine.isFoxDenUnlockRowVisible(uk);
            }
            return;
        }
        let revealed = false;
        for (let i = 0; i < order.length; i++) {
            const uk = order[i];
            const built = !!unlocks[uk];
            const shown = !built && !!engine.isFoxDenUnlockRowVisible(uk);
            if (shown && !prev[uk]) {
                revealed = true;
            }
            prev[uk] = shown || built;
        }
        if (revealed) {
            events.markNewBaseContent("foxDen");
        }
    },
    syncBaseContentNotifications: function() {
        const notify = data.progress.baseContentNotify;
        const seen = notify.upgradeSeen;
        events.syncFoxDenRevealNotifications();
        const upgradeScopes = ["torii", "hiddenSpring", "inn", "path", "garden", "atelier", "bonfire", "bambooForest"];
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
                const seenKey = scopeKey + ":" + pk;
                if (visible && !soldOut && !seen[seenKey]) {
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
    toggleVentingSurplus: function(enabled) {
        const bf = data.progress.base && data.progress.base.bonfire;
        if (bf) {
            bf.startWithFullManaEnabled = !!enabled;
        }
        if (typeof engine !== "undefined" && engine.syncPostBattleCloneCountdown) {
            engine.syncPostBattleCloneCountdown();
        }
    },
    setBuyableTooltipOpen: function(open) {
        events._buyableTooltipOpen = !!open;
        if (open && typeof view !== "undefined" && view.updateBuyableUpgradesOverlay) {
            view.updateBuyableUpgradesOverlay(true);
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
    setSkillListSort: function(mode) {
        if (mode !== "oldest" && mode !== "talent" && mode !== "alpha" && mode !== "tips" && mode !== "grouping" && mode !== "shards") {
            return;
        }
        data.progress.skillListSort = mode;
        view.applySkillListSort();
    },
    setSkillGrouping: function(inputEl, commit) {
        const key = data.progress.selectedSkillDetailKey;
        const sk = key && data.progress.skills && data.progress.skills[key];
        if (!sk || !inputEl) {
            return;
        }
        const digits = String(inputEl.value == null ? "" : inputEl.value).replace(/\D/g, "");
        if (digits === "") {
            if (commit) {
                sk.grouping = 0;
                inputEl.value = "0";
            }
            return;
        }
        let n = parseInt(digits, 10);
        if (!isFinite(n) || n < 0) {
            n = 0;
        }
        if (n > 99) {
            n = 99;
        }
        sk.grouping = n;
        const shown = String(n);
        if (commit || inputEl.value !== shown) {
            inputEl.value = shown;
        }
        if (data.progress.skillListSort === "grouping" && typeof view !== "undefined" && view.applySkillListSort) {
            view.applySkillListSort();
        }
    },
    switchSkillsTab: function(tabKey) {
        const valid = ["combat", "foraging", "class"];
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
    selectScrollResearchChoice: function(choiceIndex) {
        const lib = data.progress.base.scrollArchives;
        const choices = lib.researchChoices || [];
        const skillKey = choices[choiceIndex];
        if (!skillKey) {
            return;
        }
        lib.selectedResearchChoice = skillKey;
        const selected = data.progress.selectedResortInfoType || data.progress.selectedBaseBuilding || "";
        if (selected === "scrollArchives") {
            const base = data.progress.base;
            const t = view._basePanelPurchasingTools(base, null, false);
            view.updateBasePanelScrollArchives(base, t);
        }
    },
    switchCompactPane: function(paneKey) {
        const valid = ["menus", "battle"];
        data.progress.compactViewPane = valid.indexOf(paneKey) >= 0 ? paneKey : "menus";
        view.updateCompactLayout();
        createView.updateLayoutMeasurements();
    },
    clickEventHitsElement: function(e, el) {
        if (!el) {
            return false;
        }
        const path = typeof e.composedPath === "function" ? e.composedPath() : [];
        for (let i = 0; i < path.length; i++) {
            if (path[i] === el) {
                return true;
            }
        }
        return !!(e.target && el.contains(e.target));
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
            if (events.clickEventHitsElement(e, panel)) {
                return;
            }
            // Opening assignment via the Okami status link must not count as an outside click.
            if (e.target && e.target.closest && e.target.closest("#okamiStateDisplay")) {
                return;
            }
            const forceWide = !!(data.progress.options && data.progress.options.disableCompactLayout);
            const compactOn = !forceWide && window.innerWidth < 1420;
            if (compactOn) {
                const menuColumn = viewData.cached.menuColumn || document.getElementById("menuColumn");
                if (!events.clickEventHitsElement(e, menuColumn)) {
                    return;
                }
                const t = e.target;
                if (t && t.closest && (
                    t.closest(".resort-building-map-btn")
                    || t.closest(".resort-building-hidden-spring")
                    || t.closest(".path-seg-hit")
                    || t.closest(".spirit-slot")
                    || t.closest(".spirit-slot-grid")
                    || t.closest(".fire-launcher-wrap")
                )) {
                    return;
                }
                events.closeBaseBuildingInfo();
                return;
            }
            const battlefieldWrap = viewData.cached.battlefieldWrap || document.getElementById("battlefieldWrap");
            const battleHud = viewData.cached.battleHud || document.getElementById("battleHud");
            if (events.clickEventHitsElement(e, battlefieldWrap) || events.clickEventHitsElement(e, battleHud)) {
                events.closeBaseBuildingInfo();
                return;
            }
            const gameColumnsRow = viewData.cached.gameColumnsRow || document.getElementById("gameColumnsRow");
            if (events.clickEventHitsElement(e, gameColumnsRow)) {
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
        map.addEventListener("click", function(e) {
            if (!e.shiftKey) {
                return;
            }
            const btn = e.target.closest(".base-building-label, .resort-building-map-btn");
            if (!btn || !btn.id || btn.id.indexOf("baseBuilding_") !== 0) {
                return;
            }
            const key = btn.id.slice("baseBuilding_".length);
            if (key === "path") {
                return;
            }
            const workerKeys = resortData.workerAssignmentSiteKeys || [];
            if (workerKeys.indexOf(key) < 0) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            events.shiftClickBaseBuilding(key);
        }, true);
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
            if (key === "path") {
                return;
            }
            e.preventDefault();
            events.rightClickBaseBuilding(key, e.shiftKey);
        });
    },
    bindSpiritSlotDrag: function() {
        const map = document.getElementById("baseResortMap");
        if (!map || map._spiritDragBound) {
            return;
        }
        map._spiritDragBound = true;
        if (!viewData.spiritDrag.ghostEl) {
            const ghost = document.createElement("div");
            ghost.id = "spiritDragGhost";
            ghost.style.position = "fixed";
            ghost.style.width = "22px";
            ghost.style.height = "22px";
            ghost.style.boxSizing = "border-box";
            ghost.style.pointerEvents = "none";
            ghost.style.zIndex = "10000";
            ghost.style.display = "none";
            ghost.style.alignItems = "center";
            ghost.style.justifyContent = "center";
            ghost.style.fontSize = "10px";
            ghost.style.lineHeight = "1";
            ghost.style.color = "#fff7ed";
            ghost.style.textShadow = "0 1px 2px #000";
            ghost.style.opacity = "0.9";
            document.body.appendChild(ghost);
            viewData.spiritDrag.ghostEl = ghost;
        }
        map.addEventListener("pointerdown", events.onSpiritSlotPointerDown);
    },
    readSpiritSlotTarget: function(el) {
        const slotEl = el && el.closest ? el.closest(".spirit-slot") : null;
        if (!slotEl) {
            return null;
        }
        const kind = slotEl.getAttribute("data-spirit-kind");
        const location = slotEl.getAttribute("data-spirit-location");
        const slotIndex = parseInt(slotEl.getAttribute("data-spirit-slot"), 10);
        if (!kind || !location || isNaN(slotIndex)) {
            return null;
        }
        return { el: slotEl, kind: kind, location: location, slotIndex: slotIndex };
    },
    getSpiritInSlotTarget: function(target) {
        if (target.location === "spiritTraining" || target.kind === "any") {
            return engine.getSpiritAtLocation("spiritTraining", target.slotIndex);
        }
        return engine.getSpiritAtLocation(target.location, target.slotIndex, target.kind);
    },
    consumeSpiritDragClickSuppress: function() {
        if (!viewData.spiritDrag.suppressClick) {
            return false;
        }
        viewData.spiritDrag.suppressClick = false;
        return true;
    },
    refreshSpiritSelectionUi: function() {
        const spirit = engine.getSpiritById(data.progress.selectedSpiritId);
        data.progress.selectedBaseBuilding = "spirit";
        data.progress.selectedResortInfoType = "spirit";
        data.progress.selectedFireLauncherKey = engine.getFireLauncherKeyForSpirit(spirit);
        events.refreshBaseBuildingPanels();
        view.updateSpiritInfo();
        view.updateResortMapTokens();
    },
    onSpiritSlotPointerDown: function(e) {
        if (e.button !== 0) {
            return;
        }
        const target = events.readSpiritSlotTarget(e.target);
        if (!target) {
            return;
        }
        const spirit = events.getSpiritInSlotTarget(target);
        if (!spirit) {
            return;
        }
        const drag = viewData.spiritDrag;
        drag.pending = true;
        drag.active = false;
        drag.pointerId = e.pointerId;
        drag.spiritId = spirit.id;
        drag.startX = e.clientX;
        drag.startY = e.clientY;
        window.addEventListener("pointermove", events.onSpiritSlotPointerMove);
        window.addEventListener("pointerup", events.onSpiritSlotPointerUp);
        window.addEventListener("pointercancel", events.onSpiritSlotPointerUp);
    },
    onSpiritSlotPointerMove: function(e) {
        const drag = viewData.spiritDrag;
        if (!drag.pending && !drag.active) {
            return;
        }
        if (drag.pointerId !== null && e.pointerId !== drag.pointerId) {
            return;
        }
        const dx = e.clientX - drag.startX;
        const dy = e.clientY - drag.startY;
        if (!drag.active) {
            if ((dx * dx + dy * dy) < 25) {
                return;
            }
            const spirit = engine.getSpiritById(drag.spiritId);
            if (!spirit) {
                events.endSpiritSlotDrag();
                return;
            }
            drag.active = true;
            data.progress.selectedSpiritId = spirit.id;
            events.refreshSpiritSelectionUi();
            const ghost = drag.ghostEl;
            ghost.style.display = "flex";
            ghost.style.backgroundColor = engine.getSpiritColor(spirit);
            ghost.style.border = spirit.kind === "earth" ? "1px solid #8a5a2b"
                : (spirit.kind === "water" ? "1px solid #4da3ff"
                    : (spirit.kind === "fire" ? "1px solid #ff8a3d"
                        : (spirit.kind === "plant" ? "1px solid #4a9a4a" : "1px solid #fff")));
            ghost.textContent = String(spirit.level || 1);
        }
        const ghost = drag.ghostEl;
        ghost.style.left = (e.clientX - 11) + "px";
        ghost.style.top = (e.clientY - 11) + "px";
        e.preventDefault();
    },
    onSpiritSlotPointerUp: function(e) {
        const drag = viewData.spiritDrag;
        if (drag.pointerId !== null && e.pointerId !== drag.pointerId) {
            return;
        }
        if (!drag.active) {
            events.endSpiritSlotDrag();
            return;
        }
        const dropEl = document.elementFromPoint(e.clientX, e.clientY);
        const target = events.readSpiritSlotTarget(dropEl);
        const spirit = engine.getSpiritById(drag.spiritId);
        let moved = false;
        if (spirit && target) {
            const sameKindOk = target.kind === "any" || target.kind === spirit.kind;
            if (sameKindOk) {
                data.progress.selectedSpiritId = spirit.id;
                moved = !!engine.moveSelectedSpiritTo(target.location, target.slotIndex);
            }
        }
        events.endSpiritSlotDrag();
        drag.suppressClick = true;
        setTimeout(function() {
            drag.suppressClick = false;
        }, 500);
        if (moved) {
            events.refreshSpiritSelectionUi();
        }
    },
    endSpiritSlotDrag: function() {
        const drag = viewData.spiritDrag;
        drag.pending = false;
        drag.active = false;
        drag.pointerId = null;
        drag.spiritId = null;
        if (drag.ghostEl) {
            drag.ghostEl.style.display = "none";
            drag.ghostEl.textContent = "";
        }
        window.removeEventListener("pointermove", events.onSpiritSlotPointerMove);
        window.removeEventListener("pointerup", events.onSpiritSlotPointerUp);
        window.removeEventListener("pointercancel", events.onSpiritSlotPointerUp);
    },
    shiftClickBaseBuilding: function(buildingKey) {
        const alreadySelected = data.progress.selectedBaseBuilding === buildingKey && !data.progress.selectedSpiritId;
        if (!alreadySelected) {
            events.selectBaseBuilding(buildingKey);
        }
        events.adjustWorkers(buildingKey, "one_inc");
    },
    rightClickBaseBuilding: function(buildingKey, shiftKey) {
        const alreadySelected = data.progress.selectedBaseBuilding === buildingKey && !data.progress.selectedSpiritId;
        if (!alreadySelected) {
            events.selectBaseBuilding(buildingKey);
        }
        if (buildingKey === "hiddenSpring") {
            events.startCollectStone();
            return;
        }
        if (shiftKey) {
            const workerKeys = resortData.workerAssignmentSiteKeys || [];
            if (workerKeys.indexOf(buildingKey) >= 0) {
                events.adjustWorkers(buildingKey, "one_dec");
            }
            return;
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
    selectNextPathSegment: function() {
        if (data.progress.selectedBaseBuilding !== "path") {
            return;
        }
        const idx = data.progress.selectedPathSegmentIndex;
        if (idx === undefined || idx === null || idx <= 0) {
            return;
        }
        const seg = engine.getPathSegmentData(idx);
        if (!seg || seg.state === "Large Rocks") {
            return;
        }
        events.openBaseBuilding("path", idx - 1);
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
            if (events.isBaseBuildingSelected("path", idx)) {
                events.clearBaseBuildingSelection();
                return;
            }
            events.openBaseBuilding("path", idx);
            return;
        }
        if (!events.canOpenBaseBuilding(buildingKey)) {
            return;
        }
        if (events.isBaseBuildingSelected(buildingKey)) {
            events.clearBaseBuildingSelection();
            return;
        }
        events.openBaseBuilding(buildingKey);
    },
    isBaseBuildingSelected: function(buildingKey, pathSegmentIndex) {
        if (buildingKey === "path") {
            return data.progress.selectedBaseBuilding === "path"
                && data.progress.selectedPathSegmentIndex === pathSegmentIndex
                && !data.progress.selectedSpiritId;
        }
        return data.progress.selectedBaseBuilding === buildingKey && !data.progress.selectedSpiritId;
    },
    canOpenBaseBuilding: function(buildingKey) {
        if (!buildingKey || buildingKey === "spirit") {
            return !!buildingKey;
        }
        if (buildingKey === "path") {
            return true;
        }
        if (engine.isFoxDenConstructionActive(buildingKey)) {
            return false;
        }
        if (buildingKey === "hiddenSpring" && !engine.isMapElementRevealed("hiddenSpring")) {
            return false;
        }
        if (buildingKey === "mine" && !engine.isMapElementRevealed("mine")) {
            return false;
        }
        return resortData.baseBuildingOrder.indexOf(buildingKey) >= 0;
    },
    clearShrineMoveConfirm: function() {
        const chk = viewData.cached.shrineMoveConfirm_chk || document.getElementById("shrineMoveConfirm_chk");
        if (chk) {
            chk.checked = false;
        }
        const btn = viewData.cached.shrineMoveMountainBtn || document.getElementById("shrineMoveMountainBtn");
        if (btn) {
            btn.disabled = true;
        }
    },
    clearBaseBuildingSelection: function() {
        events.finishSpiritRename();
        const wasShrine = data.progress.selectedBaseBuilding === "shrine"
            || data.progress.selectedResortInfoType === "shrine";
        data.progress.selectedBaseBuilding = "";
        data.progress.selectedPathSegmentIndex = null;
        data.progress.selectedResortInfoType = "";
        data.progress.selectedSpiritId = null;
        data.progress.selectedFireLauncherKey = null;
        if (wasShrine) {
            events.clearShrineMoveConfirm();
        }
        events.refreshBaseBuildingPanels();
    },
    openBaseBuilding: function(buildingKey, pathSegmentIndex) {
        events.finishSpiritRename();
        const prevBuilding = data.progress.selectedBaseBuilding || "";
        if (prevBuilding === "shrine" && buildingKey !== "shrine") {
            events.clearShrineMoveConfirm();
        }
        if (buildingKey === "path") {
            const idx = pathSegmentIndex;
            if (idx === undefined || idx === null || isNaN(idx)) {
                return;
            }
            if (!engine.isPathSegmentAccessible(idx)) {
                return;
            }
            data.progress.selectedSpiritId = null;
            data.progress.selectedFireLauncherKey = null;
            data.progress.selectedBaseBuilding = "path";
            data.progress.selectedPathSegmentIndex = idx;
            data.progress.selectedResortInfoType = "path";
            delete data.progress.baseContentNotify.building.path;
            events.markScopeUpgradesSeen("path");
        } else {
            if (!events.canOpenBaseBuilding(buildingKey)) {
                return;
            }
            data.progress.selectedSpiritId = null;
            data.progress.selectedFireLauncherKey = null;
            data.progress.selectedPathSegmentIndex = null;
            data.progress.selectedBaseBuilding = buildingKey;
            data.progress.selectedResortInfoType = buildingKey;
            delete data.progress.baseContentNotify.building[buildingKey];
            if (buildingKey !== "spirit") {
                events.markScopeUpgradesSeen(buildingKey);
            }
        }
        events.refreshBaseBuildingPanels();
    },
    applyBaseBuildingInfoOverlay: function(buildingKey) {
        const infoPanel = viewData.cached.baseBuildingInfo || document.getElementById("baseBuildingInfo");
        if (infoPanel) {
            infoPanel.classList.remove("info-overlay-top", "info-overlay-bottom");
        }
        view.updateBaseBuildingInfoLayout();
    },
    refreshBaseBuildingPanels: function() {
        const buildingKey = data.progress.selectedResortInfoType || data.progress.selectedBaseBuilding || "";
        const resortInfoExtras = ["spirit", "path", "fireLauncher"];
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
        if (buildingKey === "fireLauncher") {
            view.updateFireLauncherInfo();
            view.updateResortMapTokens();
        }
        if (typeof view.updateBasePanel === "function") {
            view.updateBasePanel();
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
    },
    /** @deprecated Use refreshBaseBuildingPanels, openBaseBuilding, or clearBaseBuildingSelection */
    showSelectedBaseBuildingPanels: function(buildingKey) {
        if (!buildingKey) {
            events.clearBaseBuildingSelection();
            return;
        }
        events.openBaseBuilding(buildingKey, buildingKey === "path" ? data.progress.selectedPathSegmentIndex : null);
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
            gs.bonusSpeed = 1;
        }
        view.updateDebugSpeedButtons();
    },
    toggleBonusGameSpeed: function(multiplier) {
        const gs = data.gameSettings;
        const bonusMs = (data.currentGameState && data.currentGameState.bonusTime) || 0;
        const current = gs.bonusSpeed || 1;
        if (current === multiplier) {
            gs.bonusSpeed = 1;
        } else {
            if (bonusMs <= 0) {
                gs.bonusSpeed = 1;
                view.updateDebugSpeedButtons();
                return;
            }
            gs.bonusSpeed = multiplier;
            gs.gameSpeed = 1;
            gs.debugSpeedMultiplier = 0;
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
        if (purchaseUi.mode === "soldOut") {
            return;
        }
        if (purchaseUi.mode === "weaving") {
            engine.pauseActiveWeaving(scopeKey, upgradeKey);
            return;
        }
        if (purchaseUi.mode === "weavePaused") {
            engine.resumeWeaving(scopeKey, upgradeKey);
            return;
        }
        if (purchaseUi.mode === "directWeaveReady") {
            if (purchaseUi.disabled) {
                return;
            }
            if (up.canBuy && !up.canBuy()) {
                return;
            }
            engine.startWeaving(scopeKey, upgradeKey, up);
            return;
        }
        if (purchaseUi.mode === "idle") {
            if (purchaseUi.disabled) {
                return;
            }
            const cost = resortData.resolveCost(up, scopeKey);
            if (!resortData.isWeaveOnlyCost(cost) && !engine.canEnqueueFoxDenJob()) {
                view.flashFoxDenQueueFull();
                return;
            }
            engine.enqueueUpgradeGather(scopeKey, upgradeKey);
            return;
        }
        if (purchaseUi.mode === "gathering") {
            engine.toggleUpgradeGatherPause(scopeKey, upgradeKey);
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
        if (buildingKey === "bonfire" && !engine.isBonfireTendTheFlameUnlocked()) {
            return;
        }
        if (buildingKey === "cistern" && !engine.cisternWorkersRevealed()) {
            return;
        }
        const okami = engine.getOkami();
        if (okami.assignedBuildingKey === buildingKey) {
            okami.assignedBuildingKey = "";
            if (buildingKey === "foxDen") {
                engine.syncFoxDenCarriersToWorkforce();
            }
            if (buildingKey === "bonfire") {
                engine.syncBonfireCarriersToWorkforce();
            }
            if (buildingKey === "cistern") {
                engine.syncCisternCarriersToWorkforce();
            }
            if (buildingKey === "inn") {
                engine.syncInnCarriersToWorkforce();
            }
            if (buildingKey === "market") {
                engine.syncMarketCarriersToWorkforce();
            }
            return;
        }
        const prevAssign = okami.assignedBuildingKey;
        if (prevAssign === "foxDen" && buildingKey !== "foxDen") {
            okami.assignedBuildingKey = "";
            engine.syncFoxDenCarriersToWorkforce();
        }
        if (prevAssign === "bonfire" && buildingKey !== "bonfire") {
            okami.assignedBuildingKey = "";
            engine.syncBonfireCarriersToWorkforce();
        }
        if (prevAssign === "cistern" && buildingKey !== "cistern") {
            okami.assignedBuildingKey = "";
            engine.syncCisternCarriersToWorkforce();
        }
        if (prevAssign === "inn" && buildingKey !== "inn") {
            okami.assignedBuildingKey = "";
            engine.syncInnCarriersToWorkforce();
        }
        if (prevAssign === "market" && buildingKey !== "market") {
            okami.assignedBuildingKey = "";
            engine.syncMarketCarriersToWorkforce();
        }
        if (engine.isOkamiWeaving()) {
            engine.pauseAnyActiveWeaving();
        }
        if (okami.pathJob && !okami.pathJob.paused) {
            engine.pauseOkamiPathJob();
        }
        okami.assignedBuildingKey = buildingKey;
        engine.rememberOkamiWorkerSite(buildingKey);
        if (buildingKey === "foxDen") {
            engine.syncFoxDenCarriersToWorkforce();
        }
        if (buildingKey === "bonfire") {
            engine.syncBonfireCarriersToWorkforce();
        }
        if (buildingKey === "cistern") {
            engine.syncCisternCarriersToWorkforce();
        }
        if (buildingKey === "inn") {
            engine.syncInnCarriersToWorkforce();
        }
        if (buildingKey === "market") {
            engine.syncMarketCarriersToWorkforce();
        }
    },
    goToOkamiAssignment: function(e) {
        if (e && typeof e.stopPropagation === "function") {
            e.stopPropagation();
        }
        const okami = engine.getOkami();
        if (!okami.assignedBuildingKey) {
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
        events.clearBaseBuildingSelection();
    },
    toggleSpiritInfoCollapsed: function() {
        viewData.spiritInfoCollapsedCompact = !viewData.spiritInfoCollapsedCompact;
        if (viewData.spiritInfoCollapsedCompact) {
            events.finishSpiritRename();
        }
        view.syncSpiritInfoCompactCollapse();
    },
    clickSpiritTrainingSlot: function() {
        if (events.consumeSpiritDragClickSuppress()) {
            return;
        }
        if (!engine.isSpiritTrainingSpotBought()) {
            return;
        }
        const selected = engine.getSpiritById(data.progress.selectedSpiritId);
        const occupant = engine.getSpiritAtLocation("spiritTraining", 0);
        const refresh = function() {
            data.progress.selectedBaseBuilding = "spirit";
            data.progress.selectedResortInfoType = "spirit";
            data.progress.selectedFireLauncherKey = engine.getFireLauncherKeyForSpirit(
                engine.getSpiritById(data.progress.selectedSpiritId)
            );
            events.refreshBaseBuildingPanels();
            view.updateSpiritInfo();
            view.updateResortMapTokens();
        };
        if (!selected) {
            if (occupant) {
                data.progress.selectedSpiritId = occupant.id;
                refresh();
            }
            return;
        }
        const isSameSlot = (selected.location || "") === "spiritTraining" && (selected.slot || 0) === 0;
        if (isSameSlot) {
            refresh();
            return;
        }
        if (!occupant) {
            engine.moveSelectedSpiritTo("spiritTraining", 0);
            refresh();
            return;
        }
        if (occupant.id === selected.id) {
            refresh();
            return;
        }
        if (occupant.kind !== selected.kind) {
            return;
        }
        engine.moveSelectedSpiritTo("spiritTraining", 0);
        refresh();
    },
    clickSpiritSlot: function(kind, location, slotIndex) {
        if (events.consumeSpiritDragClickSuppress()) {
            return;
        }
        if (kind !== "earth" && kind !== "water" && kind !== "fire" && kind !== "plant") {
            return;
        }
        if (kind === "plant" && location !== "bambooForest") {
            return;
        }
        if (kind === "water" && location !== "hiddenSpring" && location !== "pond") {
            return;
        }
        if (kind === "fire" && location !== "bonfire" && location !== "atelier" && location.indexOf("fireLauncher_") !== 0) {
            return;
        }
        if (kind === "earth" && location !== "hiddenSpring" && location !== "mine") {
            return;
        }
        const selected = engine.getSpiritById(data.progress.selectedSpiritId);
        const occupant = engine.getSpiritAtLocation(location, slotIndex, kind);
        const canMoveKind = selected && selected.kind === kind && (
            (kind === "plant" && location === "bambooForest") ||
            (kind === "earth" && (location === "hiddenSpring" || location === "mine")) ||
            (kind === "water" && (location === "hiddenSpring" || location === "pond")) ||
            (kind === "fire" && (location === "bonfire" || location === "atelier" || location.indexOf("fireLauncher_") === 0))
        );
        const defaultLoc = kind === "plant" ? "bambooForest" : (kind === "fire" ? "bonfire" : "hiddenSpring");
        const isSameSlot = selected
            && (selected.location || defaultLoc) === location
            && (selected.slot || 0) === slotIndex;
        if (occupant && (!selected || occupant.id !== selected.id)) {
            data.progress.selectedSpiritId = occupant.id;
            data.progress.selectedBaseBuilding = "spirit";
            data.progress.selectedResortInfoType = "spirit";
            data.progress.selectedFireLauncherKey = engine.getFireLauncherKeyForSpirit(occupant);
            events.refreshBaseBuildingPanels();
            view.updateSpiritInfo();
            view.updateResortMapTokens();
            return;
        }
        if (canMoveKind && !isSameSlot && !occupant) {
            engine.moveSelectedSpiritTo(location, slotIndex);
            data.progress.selectedBaseBuilding = "spirit";
            data.progress.selectedResortInfoType = "spirit";
            data.progress.selectedFireLauncherKey = location.indexOf("fireLauncher_") === 0
                ? engine.parseFireLauncherLocation(location) : null;
            events.refreshBaseBuildingPanels();
            view.updateSpiritInfo();
            view.updateResortMapTokens();
            return;
        }
        if (occupant) {
            data.progress.selectedSpiritId = occupant.id;
            data.progress.selectedBaseBuilding = "spirit";
            data.progress.selectedResortInfoType = "spirit";
            data.progress.selectedFireLauncherKey = engine.getFireLauncherKeyForSpirit(occupant);
            events.refreshBaseBuildingPanels();
            view.updateSpiritInfo();
            view.updateResortMapTokens();
        }
    },
    clickFireLauncher: function(platformKey) {
        if (!engine.isFireLauncherPlatformBuilt(platformKey)) {
            return;
        }
        events.finishSpiritRename();
        data.progress.selectedFireLauncherKey = platformKey;
        data.progress.selectedSpiritId = null;
        data.progress.selectedBaseBuilding = "fireLauncher";
        data.progress.selectedResortInfoType = "fireLauncher";
        events.refreshBaseBuildingPanels();
        view.updateFireLauncherInfo();
        view.updateResortMapTokens();
    },
    selectAssignedFireLauncher: function() {
        const spirit = engine.getSpiritById(data.progress.selectedSpiritId);
        const platformKey = engine.getFireLauncherKeyForSpirit(spirit);
        if (!platformKey) {
            return;
        }
        events.clickFireLauncher(platformKey);
    },
    clickFireLauncherSlot: function(platformKey) {
        if (events.consumeSpiritDragClickSuppress()) {
            return;
        }
        if (!engine.isFireLauncherPlatformBuilt(platformKey)) {
            return;
        }
        const location = engine.getFireLauncherLocationKey(platformKey);
        const occupant = engine.getSpiritAtLocation(location, 0, "fire");
        const selected = engine.getSpiritById(data.progress.selectedSpiritId);
        if (occupant && (!selected || occupant.id !== selected.id)) {
            data.progress.selectedSpiritId = occupant.id;
            data.progress.selectedFireLauncherKey = platformKey;
            data.progress.selectedBaseBuilding = "spirit";
            data.progress.selectedResortInfoType = "spirit";
            events.refreshBaseBuildingPanels();
            view.updateSpiritInfo();
            view.updateResortMapTokens();
            return;
        }
        if (selected && selected.kind === "fire") {
            const oldLoc = selected.location || "bonfire";
            const isSame = oldLoc === location && (selected.slot || 0) === 0;
            if (!isSame) {
                engine.moveSelectedSpiritTo(location, 0);
                data.progress.selectedFireLauncherKey = platformKey;
                data.progress.selectedBaseBuilding = "spirit";
                data.progress.selectedResortInfoType = "spirit";
                events.refreshBaseBuildingPanels();
                view.updateSpiritInfo();
                view.updateResortMapTokens();
                return;
            }
        }
        if (occupant) {
            data.progress.selectedSpiritId = occupant.id;
            data.progress.selectedFireLauncherKey = platformKey;
            data.progress.selectedBaseBuilding = "spirit";
            data.progress.selectedResortInfoType = "spirit";
            events.refreshBaseBuildingPanels();
            view.updateSpiritInfo();
            view.updateResortMapTokens();
        } else {
            events.clickFireLauncher(platformKey);
        }
    },
    toggleBambooCut: function(stalkIndex) {
        engine.toggleBambooCut(stalkIndex);
    },
    toggleBonfireFireTending: function(checked) {
        const bf = data.progress.base && data.progress.base.bonfire;
        if (bf) {
            bf.fireTendingEnabled = !!checked;
        }
    },
    toggleBonfireApplyLiveSettings: function(checked) {
        const bf = data.progress.base && data.progress.base.bonfire;
        if (bf) {
            bf.applyLiveSettingsToNextClone = !!checked;
        }
        if (typeof view !== "undefined" && view.updateCloneCostDisplays) {
            view.updateCloneCostDisplays();
        }
    },
    toggleBonfireAutoRetry: function(checked) {
        const bf = data.progress.base && data.progress.base.bonfire;
        if (!bf) {
            return;
        }
        bf.autoRetryEnabled = !!checked;
        if (typeof engine !== "undefined" && engine.syncPostBattleCloneCountdown) {
            engine.syncPostBattleCloneCountdown();
        }
    },
    setBonfireFireTendingCap: function(value) {
        const bf = data.progress.base && data.progress.base.bonfire;
        if (!bf) {
            return;
        }
        const n = parseInt(value, 10);
        if (!isNaN(n) && n >= 0) {
            bf.fireTendingHeatCap = n;
        }
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
    toggleGardenAutoWeaveIncludePaused: function(checked) {
        const g = data.progress.base && data.progress.base.garden;
        if (g) {
            g.autoWeaveIncludePausedWeaves = !!checked;
        }
    },
    toggleFoxDenManaOrders: function(checked) {
        const rh = data.progress.base && data.progress.base.foxDen;
        if (rh) {
            rh.manaOrdersEnabled = !!checked;
        }
    },
    toggleFoxDenAutoClearPathRocks: function(checked) {
        const rh = data.progress.base && data.progress.base.foxDen;
        if (rh) {
            rh.autoClearPathRocks = !!checked;
        }
    },
    toggleFoxDenAutoAddPathRailings: function(checked) {
        const rh = data.progress.base && data.progress.base.foxDen;
        if (rh) {
            rh.autoAddPathRailings = !!checked;
        }
    },
    toggleFoxDenAutoAddPathStairs: function(checked) {
        const rh = data.progress.base && data.progress.base.foxDen;
        if (rh) {
            rh.autoAddPathStairs = !!checked;
        }
    },
    toggleFoxDenAutoAddPathLanterns: function(checked) {
        const rh = data.progress.base && data.progress.base.foxDen;
        if (rh) {
            rh.autoAddPathLanterns = !!checked;
        }
    },
    startFillMana: function(buildingKey) {
        if (buildingKey === "hiddenSpring") {
            const cloneUi = engine.getManaCloneTravelUi();
            if (cloneUi) {
                if (cloneUi.mode === "paused") {
                    engine.resumeManaCloneJob();
                }
                return;
            }
        }
        const weaveUi = engine.getUpgradeWeaveUi(buildingKey, "fillMana");
        if (weaveUi) {
            if (weaveUi.mode === "paused") {
                engine.resumeWeaving(buildingKey, "fillMana");
            } else {
                engine.pauseActiveWeaving(buildingKey, "fillMana");
            }
            return;
        }
        engine.startFillMana(buildingKey);
    },
    startCollectStone: function() {
        const ui = engine.getCollectStoneTravelUi();
        if (ui) {
            if (ui.mode === "paused") {
                engine.resumeCollectStoneJob();
            }
            return;
        }
        engine.startCollectStone();
    },
    toggleBuildingAllowCarriersMana: function(buildingKey, checked) {
        const b = data.progress.base && data.progress.base[buildingKey];
        if (b) {
            b.allowCarriersBringMana = !!checked;
        }
    },
    toggleBuildingAllowCarriersWater: function(buildingKey, checked) {
        const b = data.progress.base && data.progress.base[buildingKey];
        if (b) {
            b.allowCarriersBringWater = !!checked;
        }
    },
    toggleStonePileAllowUnduplicated: function(checked) {
        const pile = data.progress.base && data.progress.base.stonePile;
        if (pile) {
            pile.allowUnduplicatedStone = !!checked;
        }
    },
    startExchangeCredit: function() {
        const weaveUi = engine.getUpgradeWeaveUi("market", "exchangeCredit");
        if (weaveUi) {
            if (weaveUi.mode === "paused") {
                engine.resumeWeaving("market", "exchangeCredit");
            } else {
                engine.pauseActiveWeaving("market", "exchangeCredit");
            }
            return;
        }
        engine.startExchangeCredit();
    },
    toggleMarketRepeatExchange: function(checked) {
        const market = data.progress.base && data.progress.base.market;
        if (market) {
            market.repeatExchangeWhenReady = !!checked;
        }
    },
    toggleMarketHaulResource: function(resourceType, checked) {
        const market = data.progress.base && data.progress.base.market;
        if (!market) {
            return;
        }
        const field = resourceType === "stone" ? "allowStone"
            : resourceType === "wood" ? "allowWood"
            : resourceType === "bars" ? "allowBars"
            : null;
        if (!field) {
            return;
        }
        market[field] = !!checked;
        if (!checked) {
            engine.cancelMarketCarriers(function(carrier) {
                return carrier.resourceType === resourceType;
            });
        }
    },
    toggleMarketTrade: function(tradeKey, checked) {
        const market = data.progress.base && data.progress.base.market;
        if (!market || !resortData.marketTrades[tradeKey]) {
            return;
        }
        if (!market.tradeEnabled) {
            market.tradeEnabled = {};
        }
        market.tradeEnabled[tradeKey] = !!checked;
    },
    setMarketTradeThreshold: function(tradeKey, value) {
        const market = data.progress.base && data.progress.base.market;
        if (!market || !resortData.marketTrades[tradeKey]) {
            return;
        }
        if (!market.tradeThresholds) {
            market.tradeThresholds = {};
        }
        const parsed = Math.max(0, Math.floor(Number(value) || 0));
        market.tradeThresholds[tradeKey] = parsed;
    },
    changeNoodleConversationTopics: function() {
        engine.changeNoodleConversationTopics();
    },
    selectNoodleTipSkill: function(skillKey) {
        engine.selectNoodleTipSkill(skillKey);
    },
    refreshKitsuneAssignmentTooltip: function() {
        const list = document.getElementById("kitsuneAssignTooltipList");
        if (!list) {
            return;
        }
        const keys = resortData.workerAssignmentSiteKeys || [];
        let html = "";
        for (let i = 0; i < keys.length; i++) {
            const sk = keys[i];
            const slot = data.progress.base && data.progress.base[sk];
            const n = slot && slot.assignedWorkers ? slot.assignedWorkers : 0;
            if (n <= 0) {
                continue;
            }
            html += `<div class="kitsune-assign-tip-row">${resortData.getScopeDisplayName(sk)}: ${n}</div>`;
        }
        const traders = data.progress.base && data.progress.base.market && data.progress.base.market.assignedTraders
            ? data.progress.base.market.assignedTraders : 0;
        if (traders > 0) {
            html += `<div class="kitsune-assign-tip-row">Market Traders: ${traders}</div>`;
        }
        if (!html) {
            html = `<div class="kitsune-assign-tip-row muted-text">None assigned</div>`;
        }
        list.innerHTML = html;
    },
    toggleBambooAutoRotate: function(checked) {
        const bf = data.progress.base.bambooForest;
        bf.autoRotateHarvest = !!checked;
    },
    toggleInnGuestsVisitPond: function(checked) {
        const inn = data.progress.base && data.progress.base.inn;
        if (inn) {
            inn.guestsVisitPond = !!checked;
        }
    },
    togglePondSendWaterToForest: function(checked) {
        const pond = data.progress.base && data.progress.base.pond;
        if (pond) {
            pond.sendWaterToBambooForest = !!checked;
        }
    },
    toggleCisternReplaceWithHotterWater: function(checked) {
        const cistern = data.progress.base && data.progress.base.cistern;
        if (cistern) {
            cistern.replaceWithHotterWater = !!checked;
        }
    },
    toggleCisternRefuseIncomingWater: function(checked) {
        const cistern = data.progress.base && data.progress.base.cistern;
        if (cistern) {
            cistern.refuseIncomingWater = !!checked;
        }
    },
    toggleCisternWaterSpiritsUsePathSpeed: function(checked) {
        const cistern = data.progress.base && data.progress.base.cistern;
        if (cistern) {
            cistern.waterSpiritsUsePathSpeed = !!checked;
        }
    },
    setFireLauncherTargetMode: function(mode) {
        const key = data.progress.selectedFireLauncherKey;
        if (!key) {
            return;
        }
        const state = engine.getFireLauncherPlatformState(key);
        if (!state) {
            return;
        }
        const allowed = {
            default: true,
            closest: true,
            furthest: true,
            coldest: true,
            hottest: true
        };
        if (!allowed[mode]) {
            return;
        }
        if (mode !== "default" && !engine.isArrangementOfTargetPriorityUnlocked()) {
            return;
        }
        if ((mode === "coldest" || mode === "hottest") && !engine.isArrangementOfHeatTargetingUnlocked()) {
            return;
        }
        state.targetMode = mode;
    },
    emptyHalfCistern: function() {
        engine.emptyHalfCistern();
    },
    changeMineDepth: function(delta) {
        engine.changeMineDepth(delta);
    },
    toggleMinePrioritizeOre: function(checked) {
        if (!engine.isArrangementOfPriorityUnlocked()) {
            return;
        }
        data.progress.base.mine.prioritizeOre = !!checked;
    },
    toggleSpiritPrioritizeOre: function(checked) {
        if (!engine.isArrangementOfPriorityUnlocked()) {
            return;
        }
        const spirit = engine.getSpiritById(data.progress.selectedSpiritId);
        if (!spirit || spirit.kind !== "earth") {
            return;
        }
        spirit.prioritizeOre = !!checked;
    },
    toggleSpiritAutoReturnToMine: function(checked) {
        if (!engine.isArrangementOfDiggingUnlocked()) {
            return;
        }
        const spirit = engine.getSpiritById(data.progress.selectedSpiritId);
        if (!spirit || spirit.kind !== "earth") {
            return;
        }
        spirit.autoReturnToMine = !!checked;
    },
    beginSpiritRename: function() {
        const spirit = engine.getSpiritById(data.progress.selectedSpiritId);
        if (!spirit) {
            return;
        }
        if (viewData.spiritNameEdit && viewData.spiritNameEdit.spiritId !== spirit.id) {
            events.finishSpiritRename();
        }
        if (viewData.spiritNameEdit && viewData.spiritNameEdit.spiritId === spirit.id) {
            return;
        }
        const input = viewData.cached.spiritInfoNameInput;
        if (!input) {
            return;
        }
        viewData.spiritNameEdit = { spiritId: spirit.id };
        input.value = engine.getSpiritDisplayName(spirit);
        view.syncSpiritNameEditor(spirit);
        input.focus();
        if (input.select) {
            input.select();
        }
    },
    filterSpiritNameInput: function(el) {
        if (!el) {
            return;
        }
        const edit = viewData.spiritNameEdit;
        const spirit = edit ? engine.getSpiritById(edit.spiritId) : null;
        if (spirit && el.value === engine.getSpiritDefaultName(spirit)) {
            return;
        }
        const cleaned = engine.sanitizeSpiritName(el.value);
        if (el.value === cleaned) {
            return;
        }
        const start = el.selectionStart || 0;
        const before = engine.sanitizeSpiritName(el.value.slice(0, start)).length;
        el.value = cleaned;
        if (el.setSelectionRange) {
            el.setSelectionRange(before, before);
        }
    },
    spiritNameInputKeydown: function(e) {
        if (!e || e.key !== "Enter") {
            return;
        }
        e.preventDefault();
        events.finishSpiritRename();
    },
    finishSpiritRename: function() {
        const edit = viewData.spiritNameEdit;
        if (!edit) {
            return;
        }
        const input = viewData.cached.spiritInfoNameInput;
        const spirit = engine.getSpiritById(edit.spiritId);
        const raw = input ? input.value : "";
        viewData.spiritNameEdit = null;
        if (input) {
            input.value = "";
            if (document.activeElement === input) {
                input.blur();
            }
        }
        if (spirit) {
            engine.renameSpirit(spirit, raw);
        }
        const showing = engine.getSpiritById(data.progress.selectedSpiritId);
        if (showing) {
            view.updateVal("spiritInfoTitle", engine.getSpiritDisplayName(showing));
        } else if (spirit) {
            view.updateVal("spiritInfoTitle", engine.getSpiritDisplayName(spirit));
        }
        view.syncSpiritNameEditor(showing);
    },
    spendCoinsIfPossible: function(cost) {
        if (data.progress.coins < cost) {
            return false;
        }
        data.progress.coins -= cost;
        return true;
    },
    startBonfireClone: function() {
        if (bonfire.startNextClone(data.progress.selectedTravelMapKey || data.progress.currentMapKey)) {
            events.closeBaseBuildingInfo();
        }
    },
    adjustCloneDensity: function(mode) {
        const bf = data.progress.base.bonfire;
        if (!bf.denseClonesUnlocked) {
            return;
        }
        const cur = bonfire.getCloneDensity();
        const max = bonfire.getMaxCloneDensity();
        let next = cur;
        if (mode === "one_inc") {
            next = cur + 1;
        } else if (mode === "one_dec") {
            next = cur - 1;
        } else if (mode === "ten_inc") {
            next = cur + 10;
        } else if (mode === "ten_dec") {
            next = cur - 10;
        } else if (mode === "all_inc") {
            next = max;
        } else if (mode === "all_dec") {
            next = 0;
        }
        bf.cloneDensity = bonfire.clampCloneDensity(next);
        view.updateCloneCostDisplays();
    },
    startTravelWithBonfireSettings: function() {
        bonfire.startNextClone(data.progress.selectedTravelMapKey);
    },
    goToBonfire: function() {
        events.switchTab("base");
        events.openBaseBuilding("bonfire");
        view.updateBasePanelBonfire();
    },
    selectTravelMap: function(mapKey) {
        data.progress.selectedTravelMapKey = mapKey;
    },
    selectShrineClass: function(classKey) {
        const shrine = data.progress.base && data.progress.base.shrine;
        if (!shrine) {
            return;
        }
        shrine.selectedClassKey = classKey || "none";
        view.updateBasePanelShrine();
    },
    syncShrineMoveControls: function() {
        const shrine = data.progress.base && data.progress.base.shrine;
        const classLocked = !!(shrine && (shrine.selectedClassKey || "none") !== "none");
        const chk = viewData.cached.shrineMoveConfirm_chk || document.getElementById("shrineMoveConfirm_chk");
        const btn = viewData.cached.shrineMoveMountainBtn || document.getElementById("shrineMoveMountainBtn");
        const err = viewData.cached.shrineMovePackError || document.getElementById("shrineMovePackError");
        if (chk) {
            chk.disabled = classLocked;
            if (classLocked) {
                chk.checked = false;
            }
        }
        const checked = !!(chk && chk.checked);
        const noPacks = !shrine || shrineCards.totalPacks(shrine) < 1;
        if (btn) {
            btn.disabled = classLocked || !checked || noPacks;
        }
        if (err) {
            err.style.display = (checked && noPacks && !classLocked) ? "" : "none";
        }
    },
    toggleShrineMoveConfirm: function() {
        events.syncShrineMoveControls();
    },
    moveToNewMountain: function() {
        const shrine = data.progress.base && data.progress.base.shrine;
        if (!shrine || (shrine.selectedClassKey || "none") !== "none") {
            return;
        }
        if (data.gameSettings && data.gameSettings.prestigePackOpen) {
            return;
        }
        const chk = viewData.cached.shrineMoveConfirm_chk || document.getElementById("shrineMoveConfirm_chk");
        if (!chk || !chk.checked) {
            return;
        }
        if (shrineCards.totalPacks(shrine) < 1) {
            events.syncShrineMoveControls();
            return;
        }
        chk.checked = false;
        events.syncShrineMoveControls();
        data.progress.hasMovedToNewMountain = true;
        if (typeof createView !== "undefined" && createView.showCurrentTab) {
            createView.showCurrentTab();
        }
        if (typeof view !== "undefined" && view.updateTabButtons) {
            view.updateTabButtons(data.battle.currentTab || "base");
        }
        shrine.prestigeSession = shrineCards.createPrestigeSession(shrine);
        data.gameSettings.prestigePackOpen = true;
        viewData.prestigeSelection = [];
        viewData.prestigePackError = "";
        saving.save();
        view.renderPrestigePackPanel();
    },
    openNextPrestigePack: function(shrine, session) {
        const rarity = shrineCards.nextUnopenedPackRarity(shrine);
        if (!rarity) {
            return false;
        }
        if (!shrine.packs) {
            shrine.packs = { common: 0, rare: 0, epic: 0 };
        }
        shrine.packs[rarity] = Math.max(0, (shrine.packs[rarity] || 0) - 1);
        engine.ensureSavedSeed(shrine, "packSeed", "packOpen");
        session.openPack = {
            rarity: rarity,
            cards: shrineCards.rollPackCards(rarity, function() {
                return engine.nextSeededFloat(shrine, "packSeed");
            })
        };
        session.previewRarity = rarity;
        session.phase = "choose";
        viewData.prestigeSelection = [];
        viewData.prestigePackError = "";
        return true;
    },
    selectPrestigeCard: function(index) {
        const shrine = data.progress.base && data.progress.base.shrine;
        const session = shrine && shrine.prestigeSession;
        if (!session || !session.active || session.phase === "summary" || !session.openPack) {
            return;
        }
        const cards = session.openPack.cards || [];
        if (index < 0 || index >= cards.length) {
            return;
        }
        if (!viewData.prestigeSelection) {
            viewData.prestigeSelection = [];
        }
        const sel = viewData.prestigeSelection;
        const at = sel.indexOf(index);
        const need = shrineCards.packDefs[session.openPack.rarity].choose;
        if (at >= 0) {
            sel.splice(at, 1);
        } else {
            sel.push(index);
            while (sel.length > need) {
                sel.shift();
            }
        }
        if (sel.length === need) {
            viewData.prestigePackError = "";
        }
        view.renderPrestigePackPanel();
    },
    prestigePackAction: function() {
        const shrine = data.progress.base && data.progress.base.shrine;
        const session = shrine && shrine.prestigeSession;
        if (!session || !session.active || session.phase === "summary") {
            return;
        }
        if (!session.openPack) {
            events.openNextPrestigePack(shrine, session);
            saving.save();
            view.renderPrestigePackPanel();
            return;
        }
        const need = shrineCards.packDefs[session.openPack.rarity].choose;
        const sel = viewData.prestigeSelection || [];
        if (sel.length !== need) {
            viewData.prestigePackError = need === 1 ? "Select 1 card." : "Select " + need + " cards.";
            view.renderPrestigePackPanel();
            return;
        }
        for (let i = 0; i < sel.length; i++) {
            const card = session.openPack.cards[sel[i]];
            if (!card) {
                continue;
            }
            shrineCards.grant(card.key, card.rarity, 1);
            session.gained.push({ key: card.key, rarity: card.rarity });
        }
        if (typeof view !== "undefined" && view.updateCardBonusesTab) {
            view.updateCardBonusesTab();
        }
        viewData.prestigeSelection = [];
        viewData.prestigePackError = "";
        if (shrineCards.nextUnopenedPackRarity(shrine)) {
            events.openNextPrestigePack(shrine, session);
        } else {
            session.phase = "summary";
            session.openPack = null;
        }
        saving.save();
        view.renderPrestigePackPanel();
    },
    finishPrestige: function() {
        const progress = data.progress;
        const shrine = progress.base && progress.base.shrine;
        const cards = shrine && shrine.cards ? structuredClone(shrine.cards) : null;
        const tipsBySkill = {};
        const oldSkills = progress.skills || {};
        const skillKeys = Object.keys(oldSkills);
        for (let i = 0; i < skillKeys.length; i++) {
            const tips = oldSkills[skillKeys[i]] && oldSkills[skillKeys[i]].tips || 0;
            if (tips > 0) {
                tipsBySkill[skillKeys[i]] = tips;
            }
        }
        const oldArchives = progress.base && progress.base.scrollArchives;
        const researchSeed = oldArchives && typeof oldArchives.researchSeed === "number" ? oldArchives.researchSeed : null;
        const packSeed = shrine && typeof shrine.packSeed === "number" ? shrine.packSeed : null;
        const talentAdd = skills.unlockedTalentLevelTotal();
        const oldCap = (progress.divinity && progress.divinity.capacity) || 100000;
        const newCap = oldCap + talentAdd;
        const prevOptions = progress.options || {};
        const hideMaxed = prevOptions.hideMaxedUpgrades;
        const disableCompact = prevOptions.disableCompactLayout;

        data.progress = initials.progress();
        data.battle = initials.battle();
        data.currentGameState = initials.currentGameState();
        data.battle.currentTab = "base";
        initialize.rebuildFreshRun();

        if (hideMaxed !== undefined) {
            data.progress.options.hideMaxedUpgrades = !!hideMaxed;
        }
        if (disableCompact !== undefined) {
            data.progress.options.disableCompactLayout = !!disableCompact;
        }
        data.progress.hasMovedToNewMountain = true;
        const newShrine = data.progress.base.shrine;
        if (cards) {
            newShrine.cards = cards;
        }
        newShrine.prestigeSession = null;
        initialize.initializeShrine();
        if (researchSeed !== null && data.progress.base.scrollArchives) {
            data.progress.base.scrollArchives.researchSeed = researchSeed;
        }
        if (packSeed !== null) {
            newShrine.packSeed = packSeed;
        }
        const newSkills = data.progress.skills || {};
        const tipKeys = Object.keys(tipsBySkill);
        for (let ti = 0; ti < tipKeys.length; ti++) {
            const key = tipKeys[ti];
            if (newSkills[key]) {
                newSkills[key].tips = tipsBySkill[key];
            }
        }
        data.progress.divinity.amount = 0;
        data.progress.divinity.capacity = newCap;
        if (typeof shrineCards !== "undefined" && shrineCards.invalidateAggregatedEffects) {
            shrineCards.invalidateAggregatedEffects();
        }
        initialize.calcPlayerStats(false);
        if (typeof shrineCards !== "undefined" && shrineCards.applyPrestigeStartBonuses) {
            shrineCards.applyPrestigeStartBonuses();
        }

        data.gameSettings.prestigePackOpen = false;
        data.gameSettings.stop = false;
        data.battle.currentTab = "base";
        events.clearShrineMoveConfirm();
        events.closeBaseBuildingInfo();
        if (typeof createView !== "undefined" && createView.showCurrentTab) {
            createView.showCurrentTab();
        }
        engine._pathDomSig = [];
        viewData.pathHighlightSig = [];
        if (typeof engine.syncResortPathDom === "function") {
            engine.syncResortPathDom();
        }
        if (typeof view !== "undefined") {
            if (view.updateTabButtons) {
                view.updateTabButtons("base");
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
            if (view.updateViewAtFrame) {
                view.updateViewAtFrame();
            }
            if (view.renderBattlefield) {
                view.renderBattlefield();
            }
            if (view.renderPrestigePackPanel) {
                view.renderPrestigePackPanel();
            }
        }
        saving.save();
    },
    restorePrestigePackOverlay: function() {
        const shrine = data.progress.base && data.progress.base.shrine;
        const session = shrine && shrine.prestigeSession;
        if (session && session.active) {
            data.gameSettings.prestigePackOpen = true;
            viewData.prestigeSelection = [];
            viewData.prestigePackError = "";
            view.renderPrestigePackPanel();
            return;
        }
        if (data.gameSettings) {
            data.gameSettings.prestigePackOpen = false;
        }
        if (typeof view !== "undefined" && view.renderPrestigePackPanel) {
            view.renderPrestigePackPanel();
        }
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
        const bf = data.progress.base && data.progress.base.bonfire;
        if (!bf || !bf.plannedGrowthBlessingUnlocked) {
            return;
        }
        engine.addAttributePlanEntry(attributeKey);
    },
    removeAttributePlanRange: function(startLevel, endLevel) {
        const bf = data.progress.base && data.progress.base.bonfire;
        if (!bf || !bf.plannedGrowthBlessingUnlocked) {
            return;
        }
        engine.removeAttributePlanRange(startLevel, endLevel);
    },
    clearAttributePlan: function() {
        const bf = data.progress.base && data.progress.base.bonfire;
        if (!bf || !bf.plannedGrowthBlessingUnlocked) {
            return;
        }
        data.progress.attributePlan = [];
    },
    changeMap: function(mapKey) {
        data.progress.selectedTravelMapKey = mapKey;
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
        if (!events.harvestForageUnlocked()) {
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
        if (!events.harvestForageUnlocked()) {
            return;
        }
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
            data.progress.stars[starType]++;
            if (typeof view !== "undefined") {
                view.updateSkillRowCompact(skillKey);
                if (data.progress.selectedSkillDetailKey === skillKey) {
                    view.updateSkillInfoPanel();
                }
            }
            return;
        }
        if (data.progress.stars[starType] <= 0) {
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