let viewData = {
    cached: {}, //contains the elements that are being iterated over and updated regularly,
    prevValues: {},
    typeKeyCache: Object.create(null),
    gpuPosCache: Object.create(null),
    displayCache: Object.create(null),
    scheduled: [],
    skillListSearch: "",
    layout: {
        battlefieldHeightPx: 718,
        battlefieldWidthPx: 688,
        playerTopPx: 536
    },
    intruderElementPool: [],
    activeIntruderElements: {},
    intruderRenderCache: {},
    guestRowSnapshots: [],
    guestRowByGuestId: {},
    guestRowFreeSlots: [],
    guestLogSnapshots: [],
    pebbleTokenById: {},
    pebbleTokenFreeSlots: [],
    dropletTokenById: {},
    dropletTokenFreeSlots: [],
    pathTokenPoolsReady: false,
    menuCacheByTab: {},
    pathSegmentHoverIndex: null,
    lastMapBuildingSelection: "",
    fireLauncherAoeLastId: {},
    slapDmgElements: [],
    playerFloatElements: [],
    intruderAttackGfxElements: [],
    intruderAttackGfxRender: [],
    slapFxRender: {
        pose: "none",
        x: null,
        y: null,
        outerFlip: null,
        sideFlip: null,
        innerFlip: null
    },
    slapDmgRender: [],
    playerFloatRender: [],
    deathOverlayFilled: false,
    prestigeSelection: [],
    prestigePackError: "",
    packOverlayOpen: false,
    spiritInfoCollapsedCompact: false,
    spiritDrag: {
        pointerId: null,
        pending: false,
        active: false,
        suppressClick: false,
        spiritId: null,
        startX: 0,
        startY: 0,
        ghostEl: null
    }
};


let view = {
    updateViewAtFrame: function() { //This is the main view update function that is run once per frame
        // Only paint the battlefield when it is on-screen; still drain FX queues while unlocked but hidden.
        if (view.isBattleVisible()) {
            view.renderBattlefield();
        } else if (data.progress && data.progress.showBattle) {
            view.consumeLineFxQueue();
        }
        // Map-only DOM (baseResortMap carriers / okami sprites / weaving) - skip when base map not visible
        if (view.isResortMapVisible()) {
            view.updateActiveWeavingButtons();
            view.updateOkamiMapVisuals();
            view.updateFoxDenCarriers();
            view.updateBonfireCarriers();
            view.updateCisternCarriers();
            view.updateInnCarriers();
            view.updateMarketCarriers();
            view.updatePathTokenPositions();
            view.updateFireLauncherProjectilePositions();
            view.updateAtelierWheel();
        }
        if (events._buyableTooltipOpen) {
            view.updateBuyableUpgradesOverlay(true);
        }

        view.updateScheduled(); //Updates UI things that were scheduled from data code
    },
    updateView: function() { //Updates half as much as above, for passive updates to save a little
        if (!viewData.cached.mainLayout) {
            createView.initializeDisplay();
        }
        createView.showCurrentTab();
        view.updateMenuNumbers();
        view.syncOpenPackSession();
        view.updateGlobals();
        // Progress bars (okami/mana/divinity) - 10 Hz is enough
        view.updateOkamiPanel();
    },
    updateViewOnSecond: function() { //Updates once a second
        if (!events._buyableTooltipOpen) {
            view.updateBuyableUpgradesOverlay(false);
        }
        view.updateScribingsEta();
    },
    updateEtaText: function(id, remain, rate) {
        if (rate > 0 && remain > 0) {
            view.updateVal(id, remain / rate, "textContent", "time");
        } else {
            view.updateVal(id, "-");
        }
    },
    setFoxTravelMirror: function(img, goingEast) {
        if (!img) {
            return;
        }
        img.classList.toggle("fox-travel-mirror", !!goingEast);
        img.classList.remove("okami-tail-mirror");
    },
    getCarrierSprite: function(carrier, fallbackResource) {
        if (carrier && carrier.isOkami) {
            return "img/foxTail.svg";
        }
        const sprites = {
            mana: "img/foxWorker_mana.svg",
            wood: "img/foxWorker_wood.svg",
            hardwood: "img/foxWorker_wood.svg",
            stone: "img/foxWorker_stone.svg",
            water: "img/foxWorker_water.svg",
            bars: "img/foxWorker_bars.svg",
            coal: "img/foxWorker_coal.svg"
        };
        const resourceType = (carrier && carrier.resourceType) || fallbackResource;
        return sprites[resourceType] || "img/foxWorker.svg";
    },
    refreshBattleUiNow: function() {
        view.updateGlobals();
        view.updateCompactLayout();
    },
    updateWaveInfoPanel: function(runClock, growthUnlocked) {
        if (!viewData.cached.waveInfo || viewData.cached.waveInfo.dataset.waveInfoBuilt !== "1") {
            createView.createWaveInfoStructure();
            createView.queueCache("waveInfoTimeRow", "waveInfoStar", "waveInfoTimeLabel", "waveInfoTransition", "waveInfoZoneShards", "waveInfoZones");
            for (let wzi = 0; wzi < createView.waveInfoZoneSlotCount; wzi++) {
                createView.queueCache(`waveInfoZone_${wzi}`);
            }
            createView.clearCacheQueue();
        }
        const battleMapKey = data.progress.currentMapKey;
        const tier = data.battle.mapTier || 0;
        const starProg = (data.progress.mapStars && data.progress.mapStars[battleMapKey]) || {};
        let tierStarClass = "skill-star-bronze";
        let tierStarFilled = false;
        let tierStarTitle = "Bronze cycle";
        if (tier >= 2) {
            tierStarClass = "skill-star-gold";
            tierStarFilled = !!starProg.gold;
            tierStarTitle = "Gold cycle";
        } else if (tier >= 1) {
            tierStarClass = "skill-star-silver";
            tierStarFilled = !!starProg.silver;
            tierStarTitle = "Silver cycle";
        } else {
            tierStarFilled = !!starProg.bronze;
            tierStarTitle = "Bronze cycle";
        }
        const starClass = `wave-info-star-inline skill-star-btn ${tierStarClass}${tierStarFilled ? " skill-star-filled" : ""}`;
        view.updateVal("waveInfoStar", starClass, "className");
        view.updateVal("waveInfoStar", tierStarTitle, "title");
        view.updateVal("waveInfoStar", tierStarFilled ? "★" : "☆");
        view.updateVal("waveInfoTimeLabel", `Time ${round1Fixed(runClock)}s`);
        const transitioning = (data.battle.transitionCountdownMs || 0) > 0;
        if (transitioning) {
            const sec = Math.ceil(data.battle.transitionCountdownMs / 1000);
            view.updateVal("waveInfoTransition", `${data.battle.transitionMessage} (${sec}s)`);
            view.updateVal("waveInfoTransition", "", "style.display");
        } else {
            view.updateVal("waveInfoTransition", "none", "style.display");
        }
        const mapDef = (data.battle.mode || "combat") === "combat" ? initialize.getCurrentMapDefinition() : null;
        const showZoneShards = engine.isShardLootUnlocked() && !!mapDef;
        if (showZoneShards) {
            const amt = mapData.getMapShardDropAmount(mapDef);
            view.updateVal("waveInfoZoneShards", `Shard Drop Amount: ${intToString(amt, 2)}`);
            view.updateVal("waveInfoZoneShards", "", "style.display");
        } else {
            view.updateVal("waveInfoZoneShards", "none", "style.display");
        }
        const zones = data.battle.activeZones || [];
        const zoneSlotCount = createView.waveInfoZoneSlotCount;
        for (let i = 0; i < zoneSlotCount; i++) {
            const z = zones[i];
            if (!z) {
                view.updateVal(`waveInfoZone_${i}`, "none", "style.display");
                continue;
            }
            const expInfo = growthUnlocked ? ` | exp ${round2(z.exp)}` : "";
            const shardPct = showZoneShards
                ? ` | ${round1((z.shardDropChance || 0) * 100)}% shards`
                : "";
            const line = `${z.name} | Difficulty x${round2(z.difficulty)} | coins ${round2(z.coins)}${expInfo} | ${intToStringRound(z.remainingEnemies)} left${shardPct}`;
            view.updateVal(`waveInfoZone_${i}`, "", "style.display");
            view.updateVal(`waveInfoZone_${i}`, line, "innerHTML");
        }
    },
    formatAudLine: function(aud, maxAud) {
        const maxAudText = intToString(maxAud || 0, 1);
        const lowAud = maxAudText < 100;
        return lowAud
            ? `${round1Fixed(aud)}/${maxAudText} Aud`
            : `${intToString(aud, 1)}/${maxAudText} Aud`;
    },
    updatePlayerStatDmgLine: function() {
        const p = data.battle.player;
        const fmtDmg1 = function(x) {
            return roundNearestDecimals(x, 1).toFixed(1);
        };
        const hasSandal = !!(data.progress.base && data.progress.base.atelier && data.progress.base.atelier.sandalBuilt);
        const slapDmg = typeof engine.getDisplayedSlapDamage === "function"
            ? engine.getDisplayedSlapDamage()
            : p.attackDamage;
        const sandalDmg = typeof engine.getDisplayedSandalDamage === "function"
            ? engine.getDisplayedSandalDamage()
            : (p.sandalAttackDamage !== undefined
                ? p.sandalAttackDamage
                : Math.max(1, roundNearestDecimals(p.attackDamage * 1.5, 1)));
        view.updateVal("playerStatDmgLine", hasSandal
            ? `Slap ${fmtDmg1(slapDmg)} · Sandal ${fmtDmg1(sandalDmg)}`
            : `Slap ${fmtDmg1(slapDmg)}`);
    },
    syncBonfireRetryCheckboxes: function() {
        const bf = data.progress.base && data.progress.base.bonfire;
        if (!bf) {
            return;
        }
        const rows = [
            ["bonfireAutoRetry_row", "bonfireAutoRetry_chk", !!bf.autoRetryUnlocked, !!bf.autoRetryEnabled],
            ["bonfireStartWithFullMana_row", "bonfireStartWithFullMana_chk", !!bf.startWithFullManaUnlocked, bf.startWithFullManaEnabled !== false],
            ["deathAutoRetry_row", "deathAutoRetry_chk", !!bf.autoRetryUnlocked, !!bf.autoRetryEnabled],
            ["deathStartWithFullMana_row", "deathStartWithFullMana_chk", !!bf.startWithFullManaUnlocked, bf.startWithFullManaEnabled !== false]
        ];
        for (let i = 0; i < rows.length; i++) {
            const rowId = rows[i][0];
            const chkId = rows[i][1];
            view.updateVal(rowId, rows[i][2] ? "" : "none", "style.display");
            if (!rows[i][2]) {
                continue;
            }
            const chk = viewData.cached[chkId] || document.getElementById(chkId);
            if (chk) {
                chk.checked = rows[i][3];
            }
        }
    },
    updateGlobals: function() { //updates user-facing UI
        const showBattle = !!(data.progress && data.progress.showBattle);
        const battleState = data.battle.state;
        const isDone = battleState === "dead" || battleState === "completed";
        const runClock = (data.battle.cloneAliveMs !== undefined ? data.battle.cloneAliveMs : (data.battle.elapsedMs || 0)) / 1000;
        if (showBattle) {
            const regenPerSec = data.battle.player.regenPerSecond || 0;
            view.updateVal("playerStatAudLine", view.formatAudLine(data.battle.player.aud, data.battle.player.maxAud));
            view.updatePlayerStatDmgLine();
            const twEff = skills.getSkillEffect("toughness_condescend");
            const armorFlat = twEff.armorFlat !== undefined ? round2(twEff.armorFlat) : 0;
            const secondaryParts = [];
            if (regenPerSec > 0) {
                secondaryParts.push(`Regen ${roundNearestDecimals(regenPerSec, 2).toFixed(2)}/s`);
            }
            if (armorFlat > 0) {
                secondaryParts.push(`Armor ${armorFlat} flat`);
            }
            view.updateVal("playerBattleHudSecondary", secondaryParts.length ? secondaryParts.join(" · ") : "-");
            const audPct = Math.max(0, Math.min(100, (data.battle.player.aud / data.battle.player.maxAud) * 100));
            const audScale = Math.round((audPct / 100) * 1000) / 1000;
            view.updateVal("playerTokenAudFill", `scaleY(${audScale})`, "style.transform");
            const cloutEntry = data.battle.buffs && data.battle.buffs.byKey && data.battle.buffs.byKey.clout;
            const clout = cloutEntry ? (cloutEntry.stacks || 0) : 0;
            const maxAudForBarrier = Math.max(1, data.battle.player.maxAud || 1);
            const barrierPct = Math.max(0, Math.min(1, clout / maxAudForBarrier));
            const barrierScale = Math.round(barrierPct * 1000) / 1000;
            view.updateVal("playerTokenBarrierFill", `scaleY(${barrierScale})`, "style.transform");
            if (clout > 0) {
                view.updateVal("playerStatCloutLine", intToString(clout, 2));
                view.updateVal("playerStatCloutLine", "", "style.display");
            } else {
                view.updateVal("playerStatCloutLine", "none", "style.display");
            }
            const growthUnlocked = bonfire.isGrowthBlessingUnlocked();
            view.updateWaveInfoPanel(runClock, growthUnlocked);
        }
        view.updateVal("deathOverlay", isDone ? "flex" : "none", "style.display");
        if (isDone) {
            const killCoins = Math.max(0, data.battle.runCoinsFromKills || 0);
            const manaBonus = engine.getManaCapacityBonusPerCloneDispersal();
            if (battleState === "completed") {
                view.updateVal("deathTitle", "Map completed!");
            } else {
                view.updateVal("deathTitle", "The clone has dispersed in embarrasment (no Aud)");
            }
            const retryTxt = (data.progress.autoRetryCountdownSec || 0) > 0
                ? ` | Retry in ${Math.max(0, data.progress.autoRetryCountdownSec || 0)}s`
                : "";
            const shardsTxt = ` | Shards ${round1(data.battle.runShardsGained || 0)}`;
            if (battleState === "completed") {
                view.updateVal("deathSummary", `Bonus coins: ${intToStringRound(data.battle.completionBonusCoins || 0)} | Time ${round1Fixed(runClock)}s | Level ${data.battle.levelState.level} | Kills ${data.battle.enemiesKilled} | Coins ${intToStringRound(killCoins)}${shardsTxt}${retryTxt}`, "innerHTML");
            } else {
                view.updateVal("deathSummary", `Time ${round1Fixed(runClock)}s | Level ${data.battle.levelState.level} | Kills ${data.battle.enemiesKilled} | Coins ${intToStringRound(killCoins)}${shardsTxt}${retryTxt}`, "innerHTML");
            }
            view.updateVal("deathManaBonus", `+${round1(manaBonus)} base mana capacity`);
            const runSettings = data.battle.cloneRunSettings;
            if (bonfire.isApplyLiveSettingsToNextClone()) {
                const livePlan = bonfire.getCreateClonePlan();
                const canRetry = bonfire.canAffordCreateClone() && !livePlan.blocked;
                const retryLabel = bonfire.cloneLiveSettingsDifferFromStored()
                    ? "Try Again with changed settings"
                    : "Try Again with the same settings";
                view.updateVal("tryAgainButton", `${retryLabel} - ${bonfire.formatCloneCostHtml(livePlan.manaCost)}`, "innerHTML");
                view.updateVal("tryAgainButton", !canRetry, "disabled");
            } else if (runSettings) {
                const retryMana = runSettings.manaCost || bonfire.getCloneManaCostFromSnapshot(runSettings.cloneDensity);
                const canRetry = bonfire.canAffordRetryWithStoredSettings();
                view.updateVal("tryAgainButton", `Try Again with the same settings - ${bonfire.formatCloneCostHtml(retryMana)}`, "innerHTML");
                view.updateVal("tryAgainButton", !canRetry, "disabled");
            } else {
                view.updateVal("tryAgainButton", "Try Again?");
                view.updateVal("tryAgainButton", false, "disabled");
            }
            view.updateVal("deathTalentDetails", view.buildDeathTalentSummaryHtml(), "innerHTML");
            view.syncBonfireRetryCheckboxes();
            viewData.deathOverlayFilled = true;
        } else if (viewData.deathOverlayFilled) {
            view.updateVal("deathSummary", "");
            view.updateVal("deathManaBonus", "");
            view.updateVal("deathTalentDetails", "", "innerHTML");
            viewData.deathOverlayFilled = false;
        }
        view.updateDebugSpeedButtons();
    },
    updateDebugSpeedButtons: function() {
        const panel = viewData.cached.debugSpeedPanel;
        if (!panel) {
            return;
        }
        const gs = data.gameSettings || {};
        const bonusMs = (data.currentGameState && data.currentGameState.bonusTime) || 0;
        const showDebug = typeof isDebug !== "undefined" && isDebug;
        const showBonus = bonusMs > 0;
        const show = showDebug || showBonus;
        panel.style.display = show ? "" : "none";

        const x3 = viewData.cached.debugSpeed_x3;
        const x10 = viewData.cached.debugSpeed_x10;
        if (x3) {
            x3.style.display = showDebug ? "" : "none";
            x3.classList.toggle("debug-speed-active", showDebug && (gs.debugSpeedMultiplier || 0) === 3);
        }
        if (x10) {
            x10.style.display = showDebug ? "" : "none";
            x10.classList.toggle("debug-speed-active", showDebug && (gs.debugSpeedMultiplier || 0) === 10);
        }

        const bonusLabel = viewData.cached.bonusSpeedLabel || document.getElementById("bonusSpeedLabel");
        const bonusRemaining = viewData.cached.bonusSpeedRemaining || document.getElementById("bonusSpeedRemaining");
        const bonusBtn = viewData.cached.bonusSpeed_x2 || document.getElementById("bonusSpeed_x2");
        if (bonusLabel) {
            bonusLabel.style.display = showBonus ? "" : "none";
        }
        if (bonusRemaining) {
            bonusRemaining.textContent = showBonus
                ? secondsToTime(Math.floor(bonusMs / 1000))
                : "";
        }
        if (bonusBtn) {
            bonusBtn.style.display = showBonus ? "" : "none";
            bonusBtn.classList.toggle("debug-speed-active", showBonus && (gs.bonusSpeed || 1) === 2);
        }

        if ((gs.bonusSpeed || 1) > 1 && bonusMs <= 0) {
            gs.bonusSpeed = 1;
            if (bonusBtn) {
                bonusBtn.classList.toggle("debug-speed-active", false);
            }
        }
    },
    buildDeathTalentSummaryHtml: function() {
        const start = data.battle.runSkillTalentStart || {};
        const skills = data.progress.skills;
        const keys = Object.keys(skills);
        const rows = [];
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            const sk = skills[k];
            const t0 = start[k] !== undefined ? start[k] : 0;
            const t1 = sk.talentLevel || 0;
            if (t1 > t0) {
                rows.push(`<div class="death-talent-row">${sk.name} talent ${t0}→${t1}</div>`);
            }
        }
        if (!rows.length) {
            return "";
        }
        return `<div class="death-talent-title">Talent this run</div>${rows.join("")}`;
    },
    updateMenuNumbers: function() {
        if (!bonfire.isGrowthBlessingUnlocked() && data.battle.currentTab === "leveling") {
            data.battle.currentTab = "base";
            createView.showCurrentTab();
        }
        if (!events.skillsTabUnlocked() && data.battle.currentTab === "skills") {
            data.battle.currentTab = "base";
            createView.showCurrentTab();
        }
        const tabOrder = events.mainMenuTabOrder();
        if (data.battle.currentTab === "prestige" && tabOrder.indexOf("prestige") < 0) {
            data.battle.currentTab = tabOrder.indexOf("cardBonuses") >= 0 ? "cardBonuses" : "base";
            createView.showCurrentTab();
        }
        const activeTab = data.battle.currentTab || "base";
        view.updateTabButtons(activeTab);

        // Battle HUD chrome (outside tab panes)
        const hasSandal = !!(data.progress.base && data.progress.base.atelier && data.progress.base.atelier.sandalBuilt);
        const classSandalLocked = (data.progress.currentClassKey || "none") === "scold";
        const sandalToggle = viewData.cached.sandalAttackToggle;
        if (sandalToggle) {
            const want = !!(data.progress.sandalAttackEnabled && hasSandal && !classSandalLocked);
            if (sandalToggle.checked !== want) {
                sandalToggle.checked = want;
            }
            sandalToggle.disabled = classSandalLocked;
        }
        view.updateVal("sandalAttackLockText", classSandalLocked ? "Scold cannot use sandal attacks." : "");
        view.updateVal("sandalAttackWrap", hasSandal ? "" : "none", "style.display");

        if (activeTab === "base") {
            view.updateBaseTab();
        } else if (activeTab === "skills") {
            view.updateSkillsTab();
        } else if (activeTab === "leveling") {
            view.updateLevelingTab();
        } else if (activeTab === "stats") {
            view.updateStatsTab();
        } else if (activeTab === "travel") {
            view.updateTravelTab();
        } else if (activeTab === "history") {
            view.updateHistoryTab();
        } else if (activeTab === "guests") {
            view.updateGuestsTab();
        } else if (activeTab === "cardBonuses") {
            view.updateCardBonusesTab();
        } else if (activeTab === "prestige") {
            view.updatePrestigeTab();
        } else if (activeTab === "options") {
            view.updateOptionsTab();
        }
        // Keep the open building info panel live even when another menu tab is selected.
        if (activeTab !== "base" && data.progress && data.progress.selectedBaseBuilding) {
            view.updateBasePanel();
        }
    },
    updateBaseTab: function() {
        view.updateBasePanel();
    },
    updateSkillsTab: function() {
        skills.ensureSkillEquip();
        skills.ensureSkillLoadouts();
        let skillsTabNow = data.progress.selectedSkillsTab || "equipped";
        if (skillsTabNow !== "equipped" && skillsTabNow !== "library") {
            skillsTabNow = "equipped";
        }
        data.progress.selectedSkillsTab = skillsTabNow;
        if (typeof data.progress.selectedEquippedSkillKey !== "string") {
            data.progress.selectedEquippedSkillKey = "";
        }
        if (typeof data.progress.selectedLibrarySkillKey !== "string") {
            data.progress.selectedLibrarySkillKey = "";
        }
        view.updateSkillSubTabs();
        view.updateSkillLoadoutButtons();
        view.updateSkillEquipSlots();
        view.updateSkillsShardSlotProgress();
        const starPool = data.progress.stars;
        const starLine = `<span class="star-bronze">★</span>: ${starPool.bronze} | <span class="star-silver">★</span>: ${starPool.silver} | <span class="star-gold">★</span>: ${starPool.gold}`;
        view.updateVal("combatStarsInventory", "", "style.display");
        view.updateVal("combatStarsCounts", starLine, "innerHTML");
        view.updateVal("skillsTotalTalentLevel", String(skills.getTotalTalentLevel()));
        if (skillsTabNow === "library") {
            view.updateVal("skillsEquippedPane", "none", "style.display");
            view.updateVal("skillsLibraryPane", "", "style.display");
            view.updateSkillsListVisibility("library");
            view.syncSelectedSkillDetailKey("library");
            view.applySkillDetailSelectionHighlight();
            view.updateLibrarySkillInfoPanel();
        } else {
            view.updateVal("skillsEquippedPane", "", "style.display");
            view.updateVal("skillsLibraryPane", "none", "style.display");
            view.syncSelectedSkillDetailKey("equipped");
            view.applySkillDetailSelectionHighlight();
            view.updateSkillInfoPanel();
        }
    },
    updateLevelingTab: function() {
        const ls = data.battle.levelState;
        const plannedGrowthUnlocked = bonfire.isPlannedGrowthUnlocked();
        const classDef = initialize.getCurrentClassDef();
        view.updateVal("currentClassText", classDef.name);
        view.updateVal("classPerLevelText", initialize.getClassPerLevelText(classDef.key));
        view.updateVal("levelText", ls.level, "textContent", 1);
        view.updateVal("levelExpText", `${intToString(ls.exp, 3)} / ${intToString(ls.expToLevel, 3)}`);
        const levelPct = ls.expToLevel > 0 ? Math.max(0, Math.min(100, (ls.exp / ls.expToLevel) * 100)) : 0;
        view.updateVal("levelTabExpFill", `${levelPct}%`, "style.width");
        view.updateVal("attributePointsText", ls.unassignedPoints, "textContent", 1);
        view.updateVal("levelingPointsWrap", plannedGrowthUnlocked ? "" : "none", "style.display");
        view.updateVal("levelingAssignButtons", plannedGrowthUnlocked ? "" : "none", "style.display");
        view.updateVal("attributePlanTitle", plannedGrowthUnlocked ? "" : "none", "style.display");
        view.updateVal("attributePlanList", plannedGrowthUnlocked ? "" : "none", "style.display");
        view.updateVal("attributePlanHighest", `Highest Achieved: ${data.progress.highestLevelReached || 0}, Plan Until: ${engine.getPlanLevelCap()}`);
        view.updateVal("attributePlanPending", engine.hasPendingAttributePlanChanges() ? "" : "none", "style.display");
        const shockEffUi = skills.getSkillEffect("shockValue");
        const windfallEffUi = skills.getSkillEffect("windfallSwagger");
        const adaptationEffUi = skills.getSkillEffect("adaptation");
        const savageLessonsEffUi = skills.getSkillEffect("savageLessons");
        let strDisplay = (ls.levelStr || 0) + (ls.skillStrBonus || 0);
        if (skills.isSkillUnlocked("shockValue")) {
            strDisplay += shockEffUi.bonusStr || 0;
        }
        if (skills.isSkillUnlocked("savageLessons")) {
            strDisplay += savageLessonsEffUi.bonusStr || 0;
        }
        let conDisplay = ls.levelCon || 0;
        if (skills.isSkillUnlocked("windfallSwagger")) {
            conDisplay += windfallEffUi.bonusCon || 0;
        }
        if (skills.isSkillUnlocked("adaptation")) {
            conDisplay += adaptationEffUi.bonusCon || 0;
        }
        view.updateVal("strText", strDisplay, "textContent", 1);
        view.updateVal("conText", conDisplay, "textContent", 1);
        let strStatTip = "Brutality - +10% damage per point.<br>Damage is always rounded up.";
        if (skills.isSkillEquipped("savageLessons")) {
            strStatTip += `<br>Savage Lessons: +${savageLessonsEffUi.bonusStr || 0} Bru from skill levels`;
        }
        if (skills.isSkillEquipped("shockValue")) {
            strStatTip += `<br>Shock Value: +${shockEffUi.bonusStr || 0} Bru from skill level`;
        }
        view.updateVal("strStatTip", strStatTip, "innerHTML");
        let conStatTip = "Confidence - +10% max Audacity per point. +10% healing per point. +5% Clout gain per point.";
        if (skills.isSkillEquipped("adaptation")) {
            conStatTip += `<br>Adaptation: +${adaptationEffUi.bonusCon || 0} Con from skill levels`;
        }
        if (skills.isSkillEquipped("windfallSwagger")) {
            conStatTip += `<br>Windfall Swagger: +${windfallEffUi.bonusCon || 0} Con from skill level`;
        }
        view.updateVal("conStatTip", conStatTip, "innerHTML");
        const chaPts = ls.levelSpd || 0;
        view.updateVal("spdText", chaPts, "textContent", 1);
        const chaCoinFactor = 1 + chaPts * 0.05;
        const chaWaveFactor = engine.getCharismaWaveFactor(chaPts);
        const cloutGainPct = (conDisplay + chaPts) * 5;
        view.updateVal("chaStatTip", `Charisma - enemies move 5% faster towards you per point.<br>+5% coins per point, multiplied with other coin bonuses.<br>+5% Clout gain per point.<br>Each point leaves 95% of the remaining time until a wave, and 95% of the spacing inside a wave.<br>Current: enemies +${chaPts * 5}% speed, coins x${roundNearestDecimals(chaCoinFactor, 2)}, Clout gain +${cloutGainPct}% (with Confidence), waves x${roundNearestDecimals(chaWaveFactor, 2)}.`, "innerHTML");
        view.updateVal("soulText", engine.getCloneSoulLevel(), "textContent", 1);
        const soulLv = engine.getCloneSoulLevel();
        const ringSoul = engine.getMarketAnchoringRingBought();
        let soulStatTip = `Soul - +3% skill exp per level (additive) and +10% character exp per level (additive).<br>Anchoring Ring: +${ringSoul} Soul.`;
        if (skills.isSkillEquipped("soulSearching")) {
            const soulSearchingSoul = skills.getSkillEffect("soulSearching").bonusSoul || 0;
            soulStatTip += `<br>Soul Searching: +${soulSearchingSoul} Soul from skill levels`;
        }
        if (skills.isSkillEquipped("vicarious")) {
            const vicariousSoul = skills.getSkillEffect("vicarious").bonusSoul || 0;
            soulStatTip += `<br>Vicarious: +${vicariousSoul} Soul from skill level`;
        }
        soulStatTip += `<br>Current: +${soulLv * 3}% skill exp, +${soulLv * 10}% character exp.`;
        view.updateVal("soulStatTip", soulStatTip, "innerHTML");
        view.renderAttributePlanList();
        if (typeof createView !== "undefined" && createView.refreshInfoButtonPanel) {
            createView.refreshInfoButtonPanel("tabPane_leveling");
        }
    },
    updateStatsTab: function() {
        const p = data.battle.player;
        const lsMult = data.battle.levelState || {};
        let conTotal = lsMult.levelCon || 0;
        let strTotal = (lsMult.levelStr || 0) + (lsMult.skillStrBonus || 0);
        const shockEffStats = skills.getSkillEffect("shockValue");
        const windfallEffStats = skills.getSkillEffect("windfallSwagger");
        const adaptationEffStats = skills.getSkillEffect("adaptation");
        const savageEffStats = skills.getSkillEffect("savageLessons");
        const validationEffStats = skills.getSkillEffect("validation");
        if (skills.isSkillUnlocked("shockValue")) {
            strTotal += shockEffStats.bonusStr || 0;
        }
        if (skills.isSkillUnlocked("savageLessons")) {
            strTotal += savageEffStats.bonusStr || 0;
        }
        if (skills.isSkillUnlocked("windfallSwagger")) {
            conTotal += windfallEffStats.bonusCon || 0;
        }
        if (skills.isSkillUnlocked("adaptation")) {
            conTotal += adaptationEffStats.bonusCon || 0;
        }
        const gc = gameData.battle.combat;
        const cdCfg = gameData.battle.cooldowns;
        const shamelessEffStats = skills.getSkillEffect("shameless");
        const fortInner = shamelessEffStats.baseAudBonus || 0;
        const shamelessRecover = shamelessEffStats.audRecoverBonus || 0;
        const tenB = skills.getSkillEffect("corneredEgo").audInnerBonus || 0;
        const mountingAudUi = skills.getSkillEffect("mountingEgo").baseAudBonus || 0;
        const bravadoMultUi = skills.getSkillEffect("bravado").maxAudMultiplier || 1;
        const wisMult = roundNearestDecimals(skills.getSkillEffect("hindsight").characterExpMultiplier || 1, 2);
        const greedMult = roundNearestDecimals(skills.getSkillEffect("extortion").killCoinsMultiplier || 1, 2);
        const shamelessEquipped = skills.isSkillEquipped("shameless");
        const corneredEquipped = skills.isSkillEquipped("corneredEgo");
        const forceEquipped = skills.isSkillEquipped("force");
        const alacrityEquipped = skills.isSkillEquipped("alacrity");
        const growthUnlocked = bonfire.isGrowthBlessingUnlocked();
        const hasSandal = !!(data.progress.base && data.progress.base.atelier && data.progress.base.atelier.sandalBuilt);
        const runDensity = (data.battle && data.battle.cloneDensity) || 0;
        const cardEffStats = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? shrineCards.getAggregatedEffects() : {};
        const cardAud = cardEffStats.baseAudFlat || 0;
        const cardSlap = cardEffStats.baseSlapFlat || 0;
        const densMult = (typeof bonfire !== "undefined" && bonfire.getCloneDensityStatMult)
            ? bonfire.getCloneDensityStatMult(runDensity) : (1 + runDensity * 0.1);
        const statDiv = gc.conStrStatDivisor;
        const conMult = 1 + (conTotal / statDiv);
        const strMult = 1 + (strTotal / statDiv);
        const columnAud = (typeof skills.columnReward === "function") ? (skills.columnReward("defense").value || 0) : 0;
        const columnSlap = (typeof skills.columnReward === "function") ? (skills.columnReward("offense").value || 0) : 0;
        // Tip mirrors ((base + foundation + cards + column) x density x sturdiness + skill Aud) x Confidence x Bravado
        const foundationAud = engine.getCloneFoundationAudFlat();
        const sturdinessMult = engine.getContemplateSturdinessMult();
        const audBaseLines = [];
        let densBaseSum = gc.baseAudInner + foundationAud + cardAud + columnAud;
        audBaseLines.push(`Base Audacity: +${intToString(gc.baseAudInner, 2, true)}`);
        if (foundationAud) {
            audBaseLines.push(`Build upon Clone Foundation: +${intToString(foundationAud, 2, true)}`);
        }
        if (cardAud) {
            audBaseLines.push(`Card Audacity: +${intToString(cardAud, 2, true)}`);
        }
        if (columnAud) {
            audBaseLines.push(`Column talent: +${intToString(columnAud, 2, true)}`);
        }
        const baseAfterMult = densBaseSum * densMult * sturdinessMult;
        if (runDensity > 0) {
            audBaseLines.push(`Dense Clones: x${intToString(densMult, 2, true)} of base → +${intToString(densBaseSum * densMult, 2, true)}`);
        }
        if (sturdinessMult !== 1) {
            audBaseLines.push(`Contemplate Sturdiness: x${intToString(sturdinessMult, 2, true)} of base → +${intToString(baseAfterMult, 2, true)}`);
        }
        const skillAudLines = [];
        let skillAudSum = 0;
        if (shamelessEquipped) {
            skillAudLines.push(`Shameless: +${intToString(fortInner, 2, true)} max`);
            skillAudSum += fortInner;
        }
        const corneredAmt = corneredEquipped ? tenB : 0;
        if (corneredEquipped) {
            const corneredRecover = skills.getSkillEffect("corneredEgo").audRecoverBonus || 0;
            skillAudLines.push(`Cornered Ego: +${intToString(corneredAmt, 2, true)} max`);
            skillAudSum += corneredAmt;
        }
        if (skills.isSkillEquipped("mountingEgo")) {
            skillAudLines.push(`Mounting Ego: +${intToString(mountingAudUi, 2, true)} max Aud`);
            skillAudSum += mountingAudUi;
        }
        let valAud = 0;
        if (skills.isSkillEquipped("validation")) {
            valAud = skillEngine.getValidationAudFromKills();
            const valCap = validationEffStats.audCap || 0;
            const valCur = validationEffStats.currentAudOnMaxIncrease || 0;
            skillAudLines.push(`Validation: +${intToString(valAud, 2, true)} max Aud from kills (cap ${intToString(valCap, 2, true)})`);
            skillAudSum += valAud;
        }
        let padAud = 0;
        if (skills.isSkillEquipped("paddingResume")) {
            const padEffUi = skills.getSkillEffect("paddingResume");
            padAud = padEffUi.audBonus || 0;
            skillAudLines.push(`Padding the Resume: +${intToString(padAud, 2, true)} (${intToString(padEffUi.audPerCharLevel || 0, 2, true)} per character level)`);
            skillAudSum += padAud;
        }
        const preConSum = baseAfterMult + skillAudSum;
        const afterDensityLine = `After base multipliers + skills: ${intToString(preConSum, 2, true)}`;
        if (skillAudLines.length) {
            skillAudLines.push(`Total from skills: ${intToString(skillAudSum, 2, true)}`);
            skillAudLines.push(afterDensityLine);
        } else {
            audBaseLines.push(afterDensityLine);
        }
        const finalAud = Math.max(1, Math.ceil(preConSum * conMult * bravadoMultUi));
        const audEffective = preConSum > 0 ? finalAud / preConSum : 1;
        const audMultLines = [];
        if (growthUnlocked || conTotal > 0) {
            audMultLines.push(`Confidence: x${intToString(conMult, 2, true)}`);
        }
        if (bravadoMultUi !== 1) {
            audMultLines.push(`Bravado: x${intToString(bravadoMultUi, 3, true)}`);
        }
        audMultLines.push(`Total multiplier effect: x${intToString(audEffective, 2, true)}`);
        const audTipParts = [audBaseLines.join("<br>")];
        if (skillAudLines.length) {
            audTipParts.push(skillAudLines.join("<br>"));
        }
        audTipParts.push(audMultLines.join("<br>"));
        const audTip = audTipParts.join("<br><br>");
        view.updateVal("statsAudText", `${intToString(p.maxAud, 2, true)} Aud`);
        view.updateVal("statsAudTip", audTip, "innerHTML");
        view.updateHealingStat();
        view.updateFlatBlockStat();
        view.updateCloutStat();
        const forceRaw = forceEquipped ? (skills.getSkillEffect("force").baseDamage || 0) : 0;
        const mcRaw = (skills.isSkillEquipped("mainCharacter") && typeof skillEngine.getMainCharacterFlatDamage === "function")
            ? skillEngine.getMainCharacterFlatDamage() : 0;
        const sadismRaw = (skills.isSkillEquipped("sadism") && typeof skillEngine.getSadismFlatDamage === "function")
            ? skillEngine.getSadismFlatDamage() : 0;
        const slowBurnRaw = (skills.isSkillEquipped("slowBurn") && typeof skillEngine.getSlowBurnFlatDamage === "function")
            ? skillEngine.getSlowBurnFlatDamage() : 0;
        const attackBaseLines = [];
        const denseSlapUi = (gc.baseSlapDamage + cardSlap + columnSlap) * densMult;
        const skillFlatSum = forceRaw + mcRaw + sadismRaw + slowBurnRaw;
        const attackPreBru = denseSlapUi + skillFlatSum;
        attackBaseLines.push(`Base Shame Attack: +${intToString(gc.baseSlapDamage, 2, true)}`);
        if (cardSlap) {
            attackBaseLines.push(`Card Shame Attack: +${intToString(cardSlap, 2, true)}`);
        }
        if (columnSlap) {
            attackBaseLines.push(`Column talent: +${intToString(columnSlap, 2, true)}`);
        }
        if (runDensity > 0) {
            attackBaseLines.push(`Dense Clones: x${intToString(densMult, 2, true)} of base → +${intToString(denseSlapUi, 2, true)}<br>`);
        }
        if (forceEquipped) {
            attackBaseLines.push(`Force (flat): +${intToString(forceRaw, 2, true)}`);
        }
        if (skills.isSkillEquipped("mainCharacter")) {
            const vis = typeof engine.countVisibleIntruders === "function" ? engine.countVisibleIntruders() : 0;
            attackBaseLines.push(`Main Character: +${intToString(mcRaw, 2, true)} from ${intToString(vis, 2, true)} visible ${vis === 1 ? "enemy" : "enemies"}`);
        }
        if (skills.isSkillEquipped("sadism")) {
            attackBaseLines.push(`Sadism (flat): +${intToString(sadismRaw, 2, true)}`);
        }
        if (skills.isSkillEquipped("slowBurn")) {
            const sbSecs = (data.battle && data.battle.slowBurnSeconds) || 0;
            attackBaseLines.push(`Slow Burn (flat): +${intToString(slowBurnRaw, 2, true)} after ${intToString(sbSecs, 2, true)}s in slap range`);
        }
        attackBaseLines.push(`After density + flats: ${intToString(attackPreBru, 2, true)}`);
        // Same path as the Slap line: stored attack already has Brutality on density + Force,
        // then the other flats get Brutality, then the always-on multipliers.
        let afterAttack = (p.attackDamage || 0) + (mcRaw + sadismRaw + slowBurnRaw) * strMult;
        const attackMultLines = [];
        if (growthUnlocked || strTotal > 0) {
            attackMultLines.push(`Brutality: x${intToString(strMult, 2, true)}`);
        }
        if (skills.isSkillEquipped("highHorse") && typeof engine.isPlayerAtMaxAud === "function" && engine.isPlayerAtMaxAud()) {
            const hhFrac = skills.getSkillEffect("highHorse").damageBonusFraction || 0;
            attackMultLines.push(`High Horse: x${intToString(1 + hhFrac, 2, true)}`);
            afterAttack *= (1 + hhFrac);
        }
        if (skills.isSkillEquipped("underdog") && typeof engine.isPlayerAtMaxAud === "function" && !engine.isPlayerAtMaxAud()) {
            const udFrac = skills.getSkillEffect("underdog").damageBonusFraction || 0;
            attackMultLines.push(`Underdog: x${intToString(1 + udFrac, 2, true)}`);
            afterAttack *= (1 + udFrac);
        }
        if (skills.isSkillEquipped("peerPressure")) {
            const ppFrac = (typeof skillEngine.getPeerPressureDamageBonusFraction === "function")
                ? skillEngine.getPeerPressureDamageBonusFraction() : 0;
            const closeNow = (typeof engine.countVisibleIntrudersCloserThan === "function")
                ? engine.countVisibleIntrudersCloserThan(200) : 0;
            if (ppFrac > 0) {
                attackMultLines.push(`Peer Pressure: x${intToString(1 + ppFrac, 2, true)} from ${intToString(closeNow, 2, true)} closer than 200 ft)`);
                afterAttack *= (1 + ppFrac);
            }
        }
        if (skills.isSkillEquipped("crowdWork")) {
            const cwFrac = (typeof skillEngine.getCrowdWorkDamageBonusFraction === "function")
                ? skillEngine.getCrowdWorkDamageBonusFraction() : 0;
            const visNow = typeof engine.countVisibleIntruders === "function" ? engine.countVisibleIntruders() : 0;
            if (cwFrac > 0) {
                attackMultLines.push(`Crowd Work: x${intToString(1 + cwFrac, 2, true)} (+${intToString(cwFrac * 100, 2, true)}% from ${intToString(visNow, 2, true)} visible)`);
                afterAttack *= (1 + cwFrac);
            }
        }
        if (skills.isSkillEquipped("marathonEgo")) {
            const mePct = skills.getSkillEffect("marathonEgo").damagePercentPerTenSec || 0;
            const tens = Math.floor((data.battle.cloneAliveMs || 0) / 10000);
            const meFactor = 1 + (mePct / 100) * tens;
            attackMultLines.push(`Marathon Ego: x${intToString(meFactor, 2, true)} from ${intToString(tens * 10, 2, true)}s)`);
            afterAttack *= meFactor;
        }
        const maliceMult = (typeof engine.getMaliceDamageMultiplier === "function")
            ? engine.getMaliceDamageMultiplier() : 1;
        if (maliceMult !== 1) {
            const malicePct = (maliceMult - 1) * 100;
            attackMultLines.push(`Malice: x${intToString(maliceMult, 2, true)}`);
            afterAttack *= maliceMult;
        }
        const furyMult = (typeof engine.getFuryDamageMultiplier === "function")
            ? engine.getFuryDamageMultiplier() : 1;
        if (furyMult !== 1) {
            const furyPct = (furyMult - 1) * 100;
            const furyStacks = (furyMult - 1) * 100;
            attackMultLines.push(`Fury: x${intToString(furyMult, 2, true)} from ${intToString(furyStacks, 2, true)} ${furyStacks === 1 ? "stack" : "stacks"})`);
            afterAttack *= furyMult;
        }
        const atkEffective = attackPreBru > 0 ? afterAttack / attackPreBru : 1;
        attackMultLines.push(`Total multiplier effect: x${intToString(atkEffective, 2, true)}`);
        const attackTip = attackBaseLines.join("<br>") + "<br><br>" + attackMultLines.join("<br>");
        const shownAttack = (typeof engine.getDisplayedSlapDamage === "function")
            ? engine.getDisplayedSlapDamage()
            : Math.max(1, roundNearestDecimals(afterAttack, 1));
        view.updateVal("statsAttackText", `${intToString(shownAttack, 2, true)} ego dmg`);
        view.updateVal("statsAttackTip", attackTip, "innerHTML");
        const twEff = skills.getSkillEffect("toughness_condescend");
        const tsEff = skills.getSkillEffect("thickSkin");
        const toughnessArmor = twEff.armorFlat !== undefined ? twEff.armorFlat : 0;
        const thickSkinArmor = tsEff.armorFlat || 0;
        const armorFlat = toughnessArmor + thickSkinArmor;
        view.updateVal("statsArmorText", `${intToString(armorFlat, 2, true)} flat`);
        let armorTip = "";
        if (skills.isSkillEquipped("toughness_condescend")) {
            armorTip += `Condescend Toughness: +${intToString(toughnessArmor, 2, true)} flat damage reduction`;
        }
        if (skills.isSkillEquipped("thickSkin")) {
            if (armorTip) {
                armorTip += "<br>";
            }
            armorTip += `Thick Skin: +${intToString(thickSkinArmor, 2, true)} flat damage reduction`;
        }
        if (!armorTip) {
            armorTip = "Flat damage reduction";
        }
        view.updateVal("statsArmorTip", armorTip, "innerHTML");
        view.updateVal("statsArmorCard", armorFlat > 0 ? "" : "none", "style.display");
        view.updateVal("statsSlapText", `${intToString((p.attackCooldownMs || 0) / 1000, 2, true)}s`);
        const alaEff = skills.getSkillEffect("alacrity");
        const alaLv = alaEff.effectiveLevel || 0;
        let slapTip = `Base: ${intToString(cdCfg.slapBaseMs / 1000, 2, true)}s`;
        if (alacrityEquipped) {
            slapTip += `<br>Alacrity reduction: ${intToString(alaLv * cdCfg.alacritySlapReductionPerLevelMs, 2, true)} ms`;
        }
        const glovesMs = engine.getMarketMysticalGlovesBought() * 100;
        slapTip += `<br>Mystical Gloves: -${intToString(glovesMs, 2, true)} ms`;
        slapTip += `<br>Floor: ${intToString(cdCfg.slapFloorMs / 1000, 2, true)}s`;
        view.updateVal("statsSlapTip", slapTip, "innerHTML");
        view.updateVal("statsSandalText", hasSandal ? `${intToString((p.sandalAttackCooldownMs || 0) / 1000, 2, true)}s` : "Locked");
        let sandalTip = "Requires Spare sandal upgrade";
        if (hasSandal) {
            sandalTip = `Base: ${intToString(cdCfg.sandalBaseMs / 1000, 2, true)}s`;
            if (alacrityEquipped) {
                sandalTip += `<br>Alacrity reduction: ${intToString(alaLv * cdCfg.alacritySandalReductionPerLevelMs, 2, true)} ms`;
            }
            sandalTip += `<br>Floor: ${intToString(cdCfg.sandalFloorMs / 1000, 2, true)}s`;
        }
        view.updateVal("statsSandalTip", sandalTip, "innerHTML");
        view.updateVal("statsSandalCard", hasSandal ? "" : "none", "style.display");
        view.updateExtraCoinsDroppedStat();
    },
    updateHealingStat: function() {
        const bySkill = (data.battle && data.battle.healBySkill) || {};
        const order = (data.battle && data.battle.healSkillOrder) || [];
        let total = 0;
        const lines = [];
        const seen = {};
        for (let i = 0; i < order.length; i++) {
            const key = order[i];
            seen[key] = true;
            const amt = bySkill[key] || 0;
            if (!(amt > 0)) {
                continue;
            }
            total += amt;
            const sk = data.progress.skills && data.progress.skills[key];
            const name = (sk && sk.name) || key;
            lines.push(`${name}: ${intToString(amt, 2, true)}`);
        }
        const extraKeys = Object.keys(bySkill);
        for (let j = 0; j < extraKeys.length; j++) {
            const key = extraKeys[j];
            if (seen[key]) {
                continue;
            }
            const amt = bySkill[key] || 0;
            if (!(amt > 0)) {
                continue;
            }
            total += amt;
            const sk = data.progress.skills && data.progress.skills[key];
            const name = (sk && sk.name) || key;
            lines.push(`${name}: ${intToString(amt, 2, true)}`);
        }
        view.updateVal("statsHealingText", intToString(total, 2, true));
        view.updateVal("statsHealingTip", lines.length ? lines.join("<br>") : "No healing this battle.", "innerHTML");
    },
    updateFlatBlockStat: function() {
        const bySkill = (data.battle && data.battle.flatBlockBySkill) || {};
        const order = (data.battle && data.battle.flatBlockSkillOrder) || [];
        let total = 0;
        const lines = [];
        const seen = {};
        for (let i = 0; i < order.length; i++) {
            const key = order[i];
            seen[key] = true;
            const amt = bySkill[key] || 0;
            if (!(amt > 0)) {
                continue;
            }
            total += amt;
            const sk = data.progress.skills && data.progress.skills[key];
            const name = (sk && sk.name) || key;
            lines.push(`${name}: ${intToString(amt, 2, true)}`);
        }
        const extraKeys = Object.keys(bySkill);
        for (let j = 0; j < extraKeys.length; j++) {
            const key = extraKeys[j];
            if (seen[key]) {
                continue;
            }
            const amt = bySkill[key] || 0;
            if (!(amt > 0)) {
                continue;
            }
            total += amt;
            const sk = data.progress.skills && data.progress.skills[key];
            const name = (sk && sk.name) || key;
            lines.push(`${name}: ${intToString(amt, 2, true)}`);
        }
        view.updateVal("statsFlatBlockText", intToString(total, 2, true));
        view.updateVal("statsFlatBlockTip", lines.length ? lines.join("<br>") : "No flat armor blocked damage this battle.", "innerHTML");
    },
    updateCloutStat: function() {
        const bySkill = (data.battle && data.battle.cloutBySkill) || {};
        const order = (data.battle && data.battle.cloutSkillOrder) || [];
        let total = 0;
        const lines = [];
        const seen = {};
        for (let i = 0; i < order.length; i++) {
            const key = order[i];
            seen[key] = true;
            const amt = bySkill[key] || 0;
            if (!(amt > 0)) {
                continue;
            }
            total += amt;
            const sk = data.progress.skills && data.progress.skills[key];
            const name = (sk && sk.name) || key;
            lines.push(`${name}: ${intToString(amt, 2, true)}`);
        }
        const extraKeys = Object.keys(bySkill);
        for (let j = 0; j < extraKeys.length; j++) {
            const key = extraKeys[j];
            if (seen[key]) {
                continue;
            }
            const amt = bySkill[key] || 0;
            if (!(amt > 0)) {
                continue;
            }
            total += amt;
            const sk = data.progress.skills && data.progress.skills[key];
            const name = (sk && sk.name) || key;
            lines.push(`${name}: ${intToString(amt, 2, true)}`);
        }
        const lost = (data.battle && data.battle.cloutLostToCap) || 0;
        const real = Math.max(0, total - lost);
        const lostText = intToString(lost, 2, true);
        let tip = lines.join("<br>");
        if (lostText !== "0.0" && lostText !== "0.00") {
            tip += (tip ? "<br><br>" : "") + `${lostText} Clout lost to reaching the max`;
        }
        view.updateVal("statsCloutCard", total > 0 ? "" : "none", "style.display");
        view.updateVal("statsCloutText", intToString(real, 2, true));
        view.updateVal("statsCloutTip", tip || "No Clout this battle.", "innerHTML");
    },
    updateExtraCoinsDroppedStat: function() {
        const column = (typeof skills.columnReward === "function") ? (skills.columnReward("utility").value || 0) : 0;
        const cardEffects = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? shrineCards.getAggregatedEffects() : {};
        const gEff = skills.getSkillEffect("extortion");
        const greed = gEff.killCoinsMultiplier !== undefined ? gEff.killCoinsMultiplier : 1;
        const cardAdd = cardEffects.intruderCoinAdd || 0;
        const coinMult = engine.intruderCoinMultiplier();
        const extraPct = (coinMult - 1) * 100;
        const bySkill = (data.battle && data.battle.extraCoinsBySkill) || {};
        const order = (data.battle && data.battle.extraCoinsSkillOrder) || [];
        const extraCoinSourceName = function(key) {
            if (key === "cardCoinDrop") {
                return "Card Coin Drop";
            }
            if (key === "outrage") {
                return "Outrage";
            }
            const sk = data.progress.skills && data.progress.skills[key];
            return (sk && sk.name) || key;
        };
        let total = 0;
        const lines = [];
        const seen = {};
        for (let i = 0; i < order.length; i++) {
            const key = order[i];
            seen[key] = true;
            const amt = bySkill[key] || 0;
            if (!(amt > 0)) {
                continue;
            }
            total += amt;
            lines.push(`${extraCoinSourceName(key)}: ${intToString(amt, 2, true)}`);
        }
        const extraKeys = Object.keys(bySkill);
        for (let j = 0; j < extraKeys.length; j++) {
            const key = extraKeys[j];
            if (seen[key]) {
                continue;
            }
            const amt = bySkill[key] || 0;
            if (!(amt > 0)) {
                continue;
            }
            total += amt;
            lines.push(`${extraCoinSourceName(key)}: ${intToString(amt, 2, true)}`);
        }
        const multLines = [];
        if (column) {
            multLines.push(`Utility column: +${intToString(column, 2, true)}% coins`);
        }
        if (greed !== 1) {
            multLines.push(`Extortion: x${intToString(greed, 2, true)}`);
        }
        if (cardAdd) {
            multLines.push(`Intruder coin cards: +${intToString(cardAdd * 100, 2, true)}%`);
        }
        const chaPts = engine.getCharismaPoints();
        if (chaPts) {
            multLines.push(`Charisma: x${intToString(1 + chaPts * 0.05, 2, true)} coins`);
        }
        let tip = lines.join("<br>");
        if (multLines.length) {
            tip += (tip ? "<br><br>" : "") + multLines.join("<br>");
        }
        view.updateVal("statsExtraCoinsText", `+${intToString(total, 2, true)}, and +${intToString(extraPct, 2, true)}%`);
        view.updateVal("statsExtraCoinsTip", tip || "Extra coins on intruder drops.", "innerHTML");
    },
    updateTravelTab: function() {
        const clsMenu = data.progress.currentClassKey || "none";
        const hasClassForTravel = ["condescend", "scold", "mock", "shun"].indexOf(clsMenu) >= 0;
        const selectedTravel = data.progress.selectedTravelMapKey || data.progress.currentMapKey;
        view.updateCloneCostDisplays();
        let travelSub = data.progress.selectedTravelSubTab || "maps";
        if (!hasClassForTravel && travelSub === "challenges") {
            travelSub = "maps";
            data.progress.selectedTravelSubTab = "maps";
        }
        view.updateVal("travelSubTab_challenges", hasClassForTravel ? "" : "none", "style.display");
        const mapsActive = travelSub === "maps" || !hasClassForTravel;
        view.updateVal("travelSubTab_maps", mapsActive ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
        view.updateVal("travelSubTab_challenges", hasClassForTravel && travelSub === "challenges" ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
        view.updateVal("travelPane_maps", travelSub === "maps" || !hasClassForTravel ? "" : "none", "style.display");
        view.updateVal("travelPane_challenges", travelSub === "challenges" && hasClassForTravel ? "" : "none", "style.display");

        const mapDefs = data.progress.mapDefinitions || [];
        const authoredMaps = mapData.getDefaultMaps();
        const authoredByKey = Object.create(null);
        for (let ai = 0; ai < authoredMaps.length; ai++) {
            authoredByKey[authoredMaps[ai].key] = authoredMaps[ai];
        }
        const current = data.progress.currentMapKey;
        for (let i = 0; i < mapDefs.length; i++) {
            const map = mapDefs[i];
            const authored = authoredByKey[map.key] || map;
            if (authored.coinDropAmount !== undefined) {
                map.coinDropAmount = authored.coinDropAmount;
            }
            if (authored.shardDropAmount !== undefined) {
                map.shardDropAmount = authored.shardDropAmount;
            }
            const reqClass = map.requiredClassKey || "";
            const classAllowed = !reqClass;
            const unlocked = mapData.isMapUnlocked(map, data.progress);
            const showCard = classAllowed && unlocked;
            view.updateVal(`travel_card_${map.key}`, showCard ? "" : "none", "style.display");
            const onThisMap = current === map.key;
            const selected = selectedTravel === map.key;
            const radioEl = viewData.cached[`travelRadio_${map.key}`];
            if (radioEl) {
                radioEl.checked = selected;
                radioEl.disabled = !classAllowed || !unlocked;
            }
            view.updateVal(`mapActionCurrent_${map.key}`, onThisMap ? "" : "none", "style.display");
            view.updateVal(`mapDifficulty_${map.key}`, `x${round2(map.baseDifficulty || 1)}`);
            view.updateVal(`mapWaves_${map.key}`, (map.zones || []).length, "textContent", 1);
            view.updateVal(`mapTotalUnits_${map.key}`, mapData.getMapTotalEnemies(map), "textContent", 1);
            view.updateVal(`mapShardDrop_${map.key}`, intToString(mapData.getMapShardDropAmount(map), 2));
            const workersFound = (data.progress.mapWorkersFound && data.progress.mapWorkersFound[map.key]) || 0;
            const workersMax = 6;
            view.updateVal(`mapWorkers_${map.key}`, `${workersFound}/${workersMax}`);
            const stars = (data.progress.mapStars && data.progress.mapStars[map.key]) || {};
            view.updateVal(`mapStar_${map.key}_bronze`, stars.bronze ? "★" : "☆");
            view.updateVal(`mapStar_${map.key}_silver`, stars.silver ? "★" : "☆");
            view.updateVal(`mapStar_${map.key}_gold`, stars.gold ? "★" : "☆");
            view.updateVal(`mapStar_${map.key}_bronze`, !!stars.bronze, "classList.toggle", "skill-star-filled");
            view.updateVal(`mapStar_${map.key}_silver`, !!stars.silver, "classList.toggle", "skill-star-filled");
            view.updateVal(`mapStar_${map.key}_gold`, !!stars.gold, "classList.toggle", "skill-star-filled");
        }
        const garden = (data.progress.base && data.progress.base.garden) || {};
        const shrine = (data.progress.base && data.progress.base.shrine) || {};
        const showTourBtn = !!garden.arrangementOfNavigationUnlocked;
        view.updateVal("travelTryEveryMapBtn", showTourBtn ? "" : "none", "style.display");
        const showSkip = !!garden.arrangementOfGoldenNavigationUnlocked;
        const showRepeat = !!garden.arrangementOfCyclicNavigationUnlocked;
        const showEndGold = !!garden.arrangementOfGoldenRestUnlocked;
        view.updateVal("travelTourOptionsRow", (showSkip || showRepeat || showEndGold) ? "" : "none", "style.display");
        view.updateVal("travelSkipCompleted_row", showSkip ? "" : "none", "style.display");
        view.updateVal("travelRepeatCycle_row", showRepeat ? "" : "none", "style.display");
        view.updateVal("travelEndOnLastGold_row", showEndGold ? "" : "none", "style.display");
        const skipChk = document.getElementById("travelSkipCompleted_chk");
        const repeatChk = document.getElementById("travelRepeatCycle_chk");
        const endChk = document.getElementById("travelEndOnLastGold_chk");
        if (skipChk) {
            skipChk.checked = !!shrine.mapTourSkipCompleted;
        }
        if (repeatChk) {
            repeatChk.checked = !!shrine.mapTourRepeat;
        }
        if (endChk) {
            endChk.checked = !!shrine.mapTourEndOnLastGold;
        }
        const tour = engine.ensureMapTour();
        const waiting = !!(tour.active && tour.waitingForMana);
        let tourLabel = "Try Every Map Once";
        if (waiting) {
            tourLabel = "Waiting for mana";
        } else if (showSkip && shrine.mapTourSkipCompleted) {
            tourLabel = "Try Every Incomplete Map Once";
        }
        view.updateVal("travelTryEveryMapBtn", tourLabel);
        view.updateVal("travelTourStatusRow", tour.active ? "" : "none", "style.display");
        view.updateVal("travelTourStatusText", tour.active ? engine.tourStatusText() : "");
        if (typeof createView !== "undefined" && createView.refreshInfoButtonPanel) {
            createView.refreshInfoButtonPanel("tabPane_travel");
        }
    },
    updateHistoryTab: function() {
        const history = (data.progress && data.progress.prestigeHistory) || [];
        const showSubs = history.length > 0;
        view.updateVal("historySubTabs", showSubs ? "" : "none", "style.display");
        let sub = (data.progress && data.progress.selectedHistorySubTab) || "combat";
        if (!showSubs || sub !== "prestige") {
            sub = "combat";
        }
        view.updateVal("historySubTab_combat", sub === "combat" ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
        view.updateVal("historySubTab_prestige", sub === "prestige" ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
        view.updateVal("historyPane_combat", sub === "combat" ? "" : "none", "style.display");
        view.updateVal("historyPane_prestige", sub === "prestige" ? "" : "none", "style.display");
        view.updateHistoryList();
        view.updatePrestigeHistoryList();
    },
    updateGuestsTab: function() {
        view.updateGuestsList();
    },
    updateOptionsTab: function() {
        const disableCompactToggle = viewData.cached.disableCompactLayoutToggle;
        if (disableCompactToggle) {
            const wantOff = !!(data.progress.options && data.progress.options.disableCompactLayout);
            if (disableCompactToggle.checked !== wantOff) {
                disableCompactToggle.checked = wantOff;
            }
        }
        const playHistory = (data.progress && data.progress.prestigeHistory) || [];
        const prestiged = playHistory.length > 0;
        const playSec = prestiged
            ? ((data.progress && data.progress.secondsThisResort) || 0)
            : ((data.currentGameState && data.currentGameState.secondsPassed) || 0);
        view.updateVal("playTimeThisLabel", prestiged ? "Time played this prestige: " : "Time played: ");
        view.updateVal("playTimeClock", playSec, "textContent", "time");
        view.updateVal("playTimeTotalRow", prestiged ? "" : "none", "style.display");
        if (prestiged) {
            view.updateVal("playTimeTotalClock", (data.progress && data.progress.secondsPlayedTotal) || 0, "textContent", "time");
        }
    },

    /** Shared upgrade-row helpers for updateBasePanel. */
    _basePanelPurchasingTools: function(base, res, hideMaxed) {
        const buyFor = function(parts) {
            return `Buy for [${parts.join(", ")}]`;
        };
        const cdPct = function(ms) {
            const remain = Math.max(0, ms || 0);
            return Math.max(0, Math.min(100, (1 - (remain / 10000)) * 100));
        };
        const soldOutOrBuyLabel = function(u, buildingSegment) {
            return resortData.getUpgradeButtonLabel(u, buildingSegment);
        };
        const soldOutUpgradeRowOpts = function(hideMx, segmentForCost) {
            return {
                hideMaxed: hideMx,
                buyButtonText: function(pk, u) {
                    return soldOutOrBuyLabel(u, segmentForCost);
                },
                buttonDisabled: function(pk, u) {
                    return resortData.isUpgradeSoldOut(u);
                }
            };
        };
        const refreshOrderedPurchasables = function(buildingSegment, orderKeys, opts) {
            const o = opts || {};
            const bcfg = resortData.buildings[buildingSegment];
            if (!bcfg || !bcfg.upgrades) {
                return;
            }
            const hideMx = !!o.hideMaxed;
            for (let opi = 0; opi < orderKeys.length; opi++) {
                const pk = orderKeys[opi];
                const u = bcfg.upgrades[pk];
                if (!u || !u.key) {
                    continue;
                }
                const slug = resortData.slug(u);
                const rowEl = resortData.idRow(buildingSegment, slug);
                const btnEl = resortData.idBtn(buildingSegment, slug);
                const extraEl = resortData.idExtra(buildingSegment, slug);
                let show = false;
                if (!u.revealLater) {
                    show = resortData.isUpgradeRowVisible(u, hideMx);
                    if (resortData.isUpgradeSoldOut(u)) {
                        show = !hideMx;
                    }
                }
                view.updateVal(rowEl, show ? "" : "none", "style.display");
                if (u.autobuy) {
                    const autoRowId = `base_${buildingSegment}_autobuy_${slug}_row`;
                    const showAuto = typeof u.autobuyVisible === "function" && u.autobuyVisible();
                    view.updateVal(autoRowId, showAuto ? "" : "none", "style.display");
                    if (showAuto && typeof u.isAutobuyChecked === "function") {
                        const autoChk = viewData.cached[`base_${buildingSegment}_autobuy_${slug}_chk`];
                        if (autoChk) {
                            autoChk.checked = !!u.isAutobuyChecked();
                        }
                    }
                }
                view.updateVal(extraEl, resortData.insertResourceIcons(resortData.getUpgradeExtraText(u, buildingSegment) || ""), "innerHTML");
                if (typeof u.description === "function") {
                    view.updateVal(`base_${buildingSegment}_desc_${slug}`, u.description(), "innerHTML");
                }
                let btnText = typeof o.buyButtonText === "function" ? o.buyButtonText(pk, u) : soldOutOrBuyLabel(u, buildingSegment);
                let btnDisabled = typeof o.buttonDisabled === "function" ? o.buttonDisabled(pk, u) : false;
                let weaveMode = false;
                let weavePct = null;
                let pausedMode = false;
                let readyMode = false;
                let lockedMode = false;
                let queueBlocked = false;
                if (buildingSegment !== "path") {
                    const purchaseUi = engine.getUpgradePurchaseUi(buildingSegment, pk);
                    if (purchaseUi) {
                        btnText = purchaseUi.label;
                        btnDisabled = purchaseUi.disabled;
                        weaveMode = purchaseUi.mode === "weaving" || purchaseUi.mode === "weavePaused";
                        weavePct = purchaseUi.pct;
                        pausedMode = purchaseUi.mode === "paused" || purchaseUi.mode === "weavePaused";
                        readyMode = purchaseUi.mode === "ready";
                        lockedMode = purchaseUi.mode === "locked";
                        queueBlocked = !!purchaseUi.queueBlocked;
                    }
                } else {
                    const weaveUi = engine.getUpgradeWeaveUi(buildingSegment, pk);
                    if (weaveUi) {
                        btnText = weaveUi.label;
                        btnDisabled = weaveUi.disabled;
                        // Keep the ::before progress fill visible while paused (same as other buildings).
                        weaveMode = true;
                        weavePct = weaveUi.pct;
                        pausedMode = weaveUi.mode === "paused";
                    }
                }
                view.updateVal(btnEl, btnText, "innerHTML");
                view.updateVal(btnEl, btnDisabled, "disabled");
                const btnNode = viewData.cached[btnEl];
                if (btnNode) {
                    btnNode.classList.toggle("upgrade-btn-weaving", weaveMode);
                    btnNode.classList.toggle("upgrade-btn-paused", pausedMode);
                    btnNode.classList.toggle("upgrade-btn-ready", readyMode);
                    btnNode.classList.toggle("upgrade-btn-locked", lockedMode);
                    btnNode.classList.toggle("upgrade-btn-queue-full", queueBlocked);
                    if (weaveMode && weavePct !== null && weavePct !== undefined) {
                        btnNode.style.setProperty("--weave-pct", `${weavePct}%`);
                    } else {
                        btnNode.style.removeProperty("--weave-pct");
                    }
                }
            }
        };
        return {
            hideMaxed,
            buyFor,
            cdPct,
            soldOutOrBuyLabel,
            soldOutUpgradeRowOpts,
            refreshOrderedPurchasables
        };
    },

    syncMapBuildingSelection: function(selectedKey) {
        const selected = selectedKey || "";
        const prevSynced = viewData.lastMapBuildingSelection || "";
        const forceToggleUpdate = function(id, on) {
            if (!viewData.cached[id]) {
                return;
            }
            const prevCache = viewData.prevValues[id];
            if (prevCache) {
                delete prevCache["lastValue_classList.toggle"];
            }
            view.updateVal(id, on, "classList.toggle", "base-building-selected");
        };
        if (prevSynced && prevSynced !== selected) {
            forceToggleUpdate(`baseBuilding_${prevSynced}`, false);
        }
        if (selected && selected !== prevSynced) {
            forceToggleUpdate(`baseBuilding_${selected}`, true);
        }
        viewData.lastMapBuildingSelection = selected;
        for (let i = 0; i < resortData.baseBuildingOrder.length; i++) {
            const key = resortData.baseBuildingOrder[i];
            if (key === selected || key === prevSynced) {
                continue;
            }
            if (!viewData.cached[`baseBuilding_${key}`]) {
                continue;
            }
            view.updateVal(`baseBuilding_${key}`, false, "classList.toggle", "base-building-selected");
        }
    },

    updateBasePanelFoxDen: function(base, t) {
        const foxDen = base.foxDen;
        const unlocks = foxDen.unlocks;
        const garden = base.garden || {};
        const manaOrdersUnlocked = !!garden.arrangementOfManaOrdersUnlocked;
        view.updateVal("foxDenManaOrders_row", manaOrdersUnlocked ? "" : "none", "style.display");
        view.updateVal("foxDenCarryMana_row", manaOrdersUnlocked ? "" : "none", "style.display");
        if (manaOrdersUnlocked) {
            const manaChk = document.getElementById("foxDenManaOrders_chk");
            if (manaChk) {
                manaChk.checked = !!foxDen.manaOrdersEnabled;
            }
        }
        const showAutoRocks = !!garden.arrangementOfPathMakingUnlocked && !engine.isMapElementRevealed("hiddenSpring");
        view.updateVal("foxDenAutoClearRocks_row", showAutoRocks ? "" : "none", "style.display");
        if (showAutoRocks) {
            const rocksChk = document.getElementById("foxDenAutoClearRocks_chk");
            if (rocksChk) {
                rocksChk.checked = !!foxDen.autoClearPathRocks;
            }
        }
        const showAutoRailings = !!garden.arrangementOfRailingSafetyUnlocked && !engine.allPathSegmentsHaveUpgrade("railing");
        view.updateVal("foxDenAutoAddRailings_row", showAutoRailings ? "" : "none", "style.display");
        if (showAutoRailings) {
            const railingChk = document.getElementById("foxDenAutoAddRailings_chk");
            if (railingChk) {
                railingChk.checked = !!foxDen.autoAddPathRailings;
            }
        }
        const showAutoStairs = !!garden.arrangementOfStepBuildingUnlocked && !engine.allPathSegmentsHaveUpgrade("stairs");
        view.updateVal("foxDenAutoAddStairs_row", showAutoStairs ? "" : "none", "style.display");
        if (showAutoStairs) {
            const stairsChk = document.getElementById("foxDenAutoAddStairs_chk");
            if (stairsChk) {
                stairsChk.checked = !!foxDen.autoAddPathStairs;
            }
        }
        const showAutoLanterns = !!garden.arrangementOfLanternPlacingUnlocked && !engine.allPathSegmentsHaveUpgrade("lanterns");
        view.updateVal("foxDenAutoAddLanterns_row", showAutoLanterns ? "" : "none", "style.display");
        if (showAutoLanterns) {
            const lanternsChk = document.getElementById("foxDenAutoAddLanterns_chk");
            if (lanternsChk) {
                lanternsChk.checked = !!foxDen.autoAddPathLanterns;
            }
        }
        const pathWait = engine.getFoxDenAutoPathWaitInfo();
        const waitText = pathWait && pathWait.text ? pathWait.text : "";
        view.updateVal("foxDenAutoAddRailings_wait", pathWait && pathWait.jobType === "addRailing" ? waitText : "");
        view.updateVal("foxDenAutoAddStairs_wait", pathWait && pathWait.jobType === "addStairs" ? waitText : "");
        view.updateVal("foxDenAutoAddLanterns_wait", pathWait && pathWait.jobType === "addLanterns" ? waitText : "");
        view.updateVal("foxDenCarry_resource", resortData.getKitsuneCarryCapacity());
        view.updateVal("foxDenCarry_mana", resortData.getManaCarryAmount());
        this.updateResortWorkerControls("foxDen", (foxDen.assignedWorkers || 0) > 0 || engine.getOkami().assignedBuildingKey === "foxDen");
        for (let i = 0; i < resortData.getFoxDenUnlockOrder().length; i++) {
            const uk = resortData.getFoxDenUnlockOrder()[i];
            const bought = !!unlocks[uk];
            const site = foxDen.constructionSites && foxDen.constructionSites[uk];
            const building = site && site.status === "building";
            const rowId = resortData.idRow("foxDen", uk);
            const btnId = resortData.idBtn("foxDen", uk);
            const rowVisible = !bought && engine.isFoxDenUnlockRowVisible(uk);
            view.updateVal(rowId, rowVisible ? "" : "none", "style.display");
            const btnNode = viewData.cached[btnId];
            if (bought) {
                view.updateVal(btnId, "Built", "innerHTML");
                view.updateVal(btnId, true, "disabled");
                if (btnNode) {
                    btnNode.classList.remove("upgrade-btn-queue-full");
                }
            } else if (building) {
                const queueBlocked = !!(site.paused && !engine.canResumeFoxDenJob());
                view.updateVal(btnId, engine.getBuildingGatherButtonLabel(uk), "innerHTML");
                view.updateVal(btnId, queueBlocked, "disabled");
                if (btnNode) {
                    btnNode.classList.toggle("upgrade-btn-paused", !!site.paused);
                    btnNode.classList.toggle("upgrade-btn-queue-full", queueBlocked);
                }
            } else {
                const slot = resortData.foxDenUnlockGetDef(uk);
                const cost = slot.getCost();
                const split = resortData.splitGatherWeaveCost(cost);
                const queueFull = !engine.canEnqueueFoxDenJob();
                view.updateVal(btnId, resortData.planToBuildFromCost(cost), "innerHTML");
                view.updateVal(btnId, !resortData.canAffordCost(split.weave) || queueFull, "disabled");
                if (btnNode) {
                    btnNode.classList.toggle("upgrade-btn-queue-full", queueFull);
                }
            }
            if (building) {
                view.updateVal(`base_foxDen_extra_${uk}`, `${resortData.getConstructionPercent(site)}% delivered`);
            } else {
                view.updateVal(`base_foxDen_extra_${uk}`, "");
            }
        }
        const queueCount = engine.getFoxDenQueuedJobCount();
        const queueMax = engine.getFoxDenQueueMax();
        view.updateVal("foxDenMapDisplay", `${queueCount}/${queueMax}`);
    },

    /** Hide building buttons / panels by resort hall unlocks. */
    updateBasePanelUnlockVisibility: function(buildingVisibleFn) {
        for (let i = 0; i < resortData.baseBuildingOrder.length; i++) {
            const k = resortData.baseBuildingOrder[i];
            if (viewData.cached[`baseBuilding_${k}`]) {
                view.updateVal(`baseBuilding_${k}`, buildingVisibleFn(k) ? "" : "none", "style.display");
            }
            if (viewData.cached[`basePanel_${k}`]) {
                view.updateVal(`basePanel_${k}`, (buildingVisibleFn(k) && k === data.progress.selectedBaseBuilding) ? "" : "none", "style.display");
            }
        }
    },

    getMapDisplayName: function(mapKey) {
        const defs = (data.progress && data.progress.mapDefinitions) || [];
        for (let i = 0; i < defs.length; i++) {
            if (defs[i].key === mapKey) {
                return `[${i + 1}] ${defs[i].name || mapKey || ""}`;
            }
        }
        return mapKey || "";
    },
    updateCloneCostDisplays: function() {
        const plan = bonfire.getCreateClonePlan();
        const costHtml = bonfire.formatCloneCostHtml(plan.manaCost);
        const canAfford = bonfire.canAffordCreateClone();
        view.updateVal("base_bonfire_mana_cost", costHtml, "innerHTML");
        view.updateVal("travelBonfireManaCost", costHtml, "innerHTML");
        view.updateVal("base_bonfire_clone_btn", !canAfford, "classList.toggle", "bonfire-clone-btn--unaffordable");
        view.updateVal("travelBonfireLaunchBtn", !canAfford, "classList.toggle", "bonfire-clone-btn--unaffordable");
        const stored = data.battle && data.battle.cloneRunSettings;
        const applyLive = bonfire.isApplyLiveSettingsToNextClone();
        const settingsDensity = applyLive ? bonfire.getCloneDensity() : (stored ? (stored.cloneDensity || 0) : 0);
        const settingsMapKey = applyLive
            ? (data.progress.selectedTravelMapKey || data.progress.currentMapKey)
            : ((stored && stored.mapKey) || data.progress.currentMapKey);
        view.updateVal("bonfireCloneSettings_density", settingsDensity);
        view.updateVal("bonfireCloneSettings_map", view.getMapDisplayName(settingsMapKey));
        const bfSettings = data.progress.base && data.progress.base.bonfire;
        const densityUnlocked = !!(bfSettings && bfSettings.denseClonesUnlocked);
        view.updateVal("bonfireCloneSettings_row", densityUnlocked ? "" : "none", "style.display");
        view.updateVal("bonfireApplyLiveSettings_row", densityUnlocked ? "" : "none", "style.display");
        view.updateVal("base_bonfire_clone_prefix", (bonfire.isApplyLiveSettingsToNextClone() && bonfire.cloneLiveSettingsDifferFromStored())
            ? "Change setting and create a clone for"
            : "Create a clone for");
        const applyChk = viewData.cached.bonfireApplyLiveSettings_chk || document.getElementById("bonfireApplyLiveSettings_chk");
        if (applyChk) {
            applyChk.checked = bonfire.isApplyLiveSettingsToNextClone();
        }
        view.updateVal("bonfireDenseClones_row", densityUnlocked ? "" : "none", "style.display");
        if (densityUnlocked) {
            const dens = bonfire.getCloneDensity();
            const maxDens = bonfire.getMaxCloneDensity();
            view.updateVal("bonfireDenseClones_value", dens);
            const atMin = dens <= 0;
            const atMax = dens >= maxDens;
            view.updateVal("bonfireDenseClones_dec_all", atMin, "disabled");
            view.updateVal("bonfireDenseClones_dec_ten", atMin, "disabled");
            view.updateVal("bonfireDenseClones_dec_one", atMin, "disabled");
            view.updateVal("bonfireDenseClones_inc_one", atMax, "disabled");
            view.updateVal("bonfireDenseClones_inc_ten", atMax, "disabled");
            view.updateVal("bonfireDenseClones_inc_all", atMax, "disabled");
        }
    },

    updateBonfireKilnPanel: function(bf) {
        const kiln = !!bf.kilnBuilt;
        view.updateVal("bonfireSubTabs", kiln ? "" : "none", "style.display");
        view.updateVal("baseBuilding_bonfire", kiln, "classList.toggle", "has-kiln");
        const tab = kiln && bf.kilnSubTab === "kiln" ? "kiln" : "clone";
        view.updateVal("bonfireSubTab_clone", tab === "clone" ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
        view.updateVal("bonfireSubTab_kiln", tab === "kiln" ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
        if (!kiln) {
            view.updateVal("bonfireClonePane", "", "style.display");
            view.updateVal("bonfireKilnPane", "", "style.display");
            view.updateVal("bonfireKilnControls", "none", "style.display");
            view.updateVal("bonfireUpgradesPane", "", "style.display");
            return;
        }
        const showKiln = tab === "kiln";
        view.updateVal("bonfireClonePane", showKiln ? "none" : "", "style.display");
        view.updateVal("bonfireKilnPane", showKiln ? "" : "none", "style.display");
        view.updateVal("bonfireKilnControls", showKiln ? "" : "none", "style.display");
        view.updateVal("bonfireUpgradesPane", showKiln ? "none" : "", "style.display");
        if (!showKiln) {
            return;
        }
        const heatCapEl = viewData.cached.bonfireKilnHeatCap;
        if (heatCapEl && document.activeElement !== heatCapEl) {
            const cap = engine.bonfireKilnNumber(bf.kilnHeatCap);
            heatCapEl.value = cap === null ? "" : cap;
        }
        const rows = engine.ensureBonfireKilnPriority(bf);
        const list = viewData.cached.bonfirePriorityList;
        if (list && !events._bonfireDragKey) {
            const want = rows.map(function(row) { return row.key; }).join(",");
            const have = Array.prototype.map.call(list.children, function(el) {
                return el.getAttribute("data-priority-key");
            }).join(",");
            if (want !== have) {
                for (let i = 0; i < rows.length; i++) {
                    const el = viewData.cached["bonfirePriority_" + rows[i].key];
                    if (el) {
                        list.appendChild(el);
                    }
                }
            }
        }
        const heatMult = engine.getBonfireHeatCardMultiplier ? engine.getBonfireHeatCardMultiplier() : 1;
        const woodHeat = bonfireConfig.heatPerWood * heatMult;
        const heatText = {
            coal: roundNearestDecimals(woodHeat * bonfireConfig.heatPerCoalMult, 2) + " heat",
            wood: roundNearestDecimals(woodHeat, 2) + " heat",
            hardwood: "",
            charcoalPit: roundNearestDecimals(50 * heatMult, 2) + " heat"
        };
        for (let r = 0; r < rows.length; r++) {
            const row = rows[r];
            const rowEl = viewData.cached["bonfirePriority_" + row.key];
            if (rowEl) {
                rowEl.classList.toggle("kiln-priority-row--off", !row.use);
            }
            const useEl = viewData.cached["bonfirePriorityUse_" + row.key];
            if (useEl) {
                useEl.checked = row.use !== false;
            }
            view.updateVal("bonfirePriorityHeat_" + row.key, heatText[row.key] || "");
            if (row.key === "wood" || row.key === "hardwood") {
                const keepEl = viewData.cached["bonfireKeep_" + row.key];
                if (keepEl && document.activeElement !== keepEl) {
                    const keep = engine.bonfireKilnNumber(row.keep);
                    keepEl.value = keep === null ? "" : keep;
                }
            }
        }
        view.updateVal("bonfireKilnHardwood", intToStringRound(bf.kilnHardwood || 0));
        const stopEl = viewData.cached.bonfireHardwoodStop;
        if (stopEl && document.activeElement !== stopEl) {
            const stop = engine.bonfireKilnNumber(bf.hardwoodStopAt);
            stopEl.value = stop === null ? "" : stop;
        }
        const action = engine.pickBonfireKilnAction(bf);
        const pitActive = !!(action && action.type === "charcoalPit") || (bf.charcoalPitProgressMs || 0) > 0;
        view.updateVal("bonfireCharcoalPitProg", pitActive ? "" : "none", "style.display");
        if (pitActive) {
            const dur = engine.getCharcoalPitDurationMs();
            const pct = dur > 0 ? Math.max(0, Math.min(100, ((bf.charcoalPitProgressMs || 0) / dur) * 100)) : 0;
            view.updateVal("bonfireCharcoalPitFill", pct + "%", "style.width");
        }
        view.updateVal("bonfirePitWood", intToStringRound(bf.charcoalPitWood || 0));
        view.updateVal("bonfireCharcoalRate", intToStringRound(engine.getCharcoalProductionAmount(bf)));
        view.updateVal("bonfireCharcoalStock", intToStringRound(bf.charcoal || 0));
        const requireEl = viewData.cached.bonfireCharcoalRequire;
        if (requireEl) {
            requireEl.classList.toggle("kiln-require-unmet", (bf.heat || 0) < 400 || (bf.mana || 0) < 100);
        }
    },
    updateBasePanelBonfire: function() {
        view.updateCloneCostDisplays();
        const bf = data.progress.base.bonfire;
        const kiln = !!bf.kilnBuilt;
        view.updateBonfireKilnPanel(bf);
        const garden = data.progress.base && data.progress.base.garden;
        const fireTendingUnlocked = !!(garden && garden.arrangementOfFireTendingUnlocked);
        view.updateVal("bonfireFireTending_row", (!kiln && fireTendingUnlocked) ? "" : "none", "style.display");
        if (fireTendingUnlocked) {
            const fireChk = document.getElementById("bonfireFireTending_chk");
            if (fireChk) {
                fireChk.checked = bf.fireTendingEnabled !== false;
            }
            const capEl = viewData.cached.bonfireFireTending_cap || document.getElementById("bonfireFireTending_cap");
            if (capEl && document.activeElement !== capEl) {
                capEl.value = bf.fireTendingHeatCap !== undefined ? bf.fireTendingHeatCap : 55;
            }
        }
        view.syncBonfireRetryCheckboxes();
        const flameTended = !!bf.tendTheFlameUnlocked;
        const marketBuilt = engine.isMarketBuilt();
        view.updateVal("bonfireWoodCarry_row", flameTended ? "" : "none", "style.display");
        if (flameTended) {
            view.updateVal("bonfireWoodCarryLabel", marketBuilt ? "Burnable Resource Carry" : "Wood Carry");
            view.updateVal("bonfireWoodCarry", resortData.getKitsuneWoodCarryAmount());
        }
        view.updateVal("bonfireHeatPerFuel_row", flameTended ? "" : "none", "style.display");
        if (flameTended) {
            const heatMult = engine.getBonfireHeatCardMultiplier ? engine.getBonfireHeatCardMultiplier() : 1;
            const heatWood = bonfireConfig.heatPerWood * heatMult;
            view.updateVal("bonfireHeatPerWood", roundNearestDecimals(heatWood, 2));
            view.updateVal("bonfireHeatPerCoalPart", marketBuilt ? "" : "none", "style.display");
            if (marketBuilt) {
                view.updateVal("bonfireHeatPerCoal", roundNearestDecimals(heatWood * bonfireConfig.heatPerCoalMult, 2));
            }
        }
        view.updateVal("bonfireCoal_row", (marketBuilt || kiln) ? "" : "none", "style.display");
        view.updateVal("bonfireCoalPart", marketBuilt ? "" : "none", "style.display");
        if (marketBuilt) {
            view.updateVal("bonfireCoalText", intToStringRound(engine.getMarketGoodAmount("coal")));
        }
        view.updateVal("bonfireAshSep", (marketBuilt && kiln) ? "" : "none", "style.display");
        view.updateVal("bonfireAshPart", kiln ? "" : "none", "style.display");
        if (kiln) {
            view.updateVal("bonfireAshText", intToStringRound(bf.ash || 0));
        }
        const hs = data.progress.base && data.progress.base.hiddenSpring;
        const sparkBought = ((hs && hs.fireSpiritsBought) || 0) >= 1;
        view.updateVal("bonfireFireSpiritPower_row", sparkBought ? "" : "none", "style.display");
        if (sparkBought) {
            view.updateVal("bonfireFireSpiritPower", engine.getBonfireAssignedFireSpiritPowerTotal());
        }
        const t = view._basePanelPurchasingTools(data.progress.base, null, data.progress.options.hideMaxedUpgrades);
        t.refreshOrderedPurchasables("bonfire", resortData.buildings.bonfire.upgradesOrder, { hideMaxed: t.hideMaxed });
        this.updateResortWorkerControls("bonfire", (bf.assignedWorkers || 0) > 0 || engine.getOkami().assignedBuildingKey === "bonfire");
        if (typeof createView !== "undefined" && createView.refreshInfoButtonPanel) {
            createView.refreshInfoButtonPanel("resortInfo_bonfire");
        }
    },

    updateBasePanelShrine: function() {
        view.updateCloneCostDisplays();
        view.updateShrineProgressDisplays();
        if (typeof engine.updateShrineMilestones === "function") {
            engine.updateShrineMilestones();
        }
        view.updateShrineClassControls();
        view.updateShrinePackDisplays();
        const tShrine = view._basePanelPurchasingTools(data.progress.base, null, data.progress.options.hideMaxedUpgrades);
        tShrine.refreshOrderedPurchasables("shrine", (resortData.buildings.shrine && resortData.buildings.shrine.upgradesOrder) || [], { hideMaxed: tShrine.hideMaxed });
        if (typeof createView !== "undefined" && createView.refreshInfoButtonPanel) {
            createView.refreshInfoButtonPanel("resortInfo_shrine");
        }
    },

    updateShrinePackDisplays: function() {
        const shrine = data.progress.base && data.progress.base.shrine;
        if (!shrine || !engine.isShrineBuilt()) {
            return;
        }
        const packs = shrine.packs || {};
        view.updateVal("shrinePackCommonCount", packs.common || 0, "textContent", "floor");
        view.updateVal("shrinePackRareCount", packs.rare || 0, "textContent", "floor");
        view.updateVal("shrinePackEpicCount", packs.epic || 0, "textContent", "floor");

        const ms = shrine.milestones || {};
        const setCapped = function(id, progress, thresholds, claimedMap) {
            const fill = engine.getFixedMilestoneFillPct(progress, thresholds);
            view.updateVal(`shrineMs_${id}_fill`, `${fill}%`, "style.width");
            let allClaimed = thresholds.length > 0;
            for (let i = 0; i < thresholds.length; i++) {
                const claimed = !!claimedMap[String(thresholds[i])];
                if (!claimed) {
                    allClaimed = false;
                }
                view.updateVal(`shrineMs_${id}_icon_${i}`, claimed, "classList.toggle", "shrine-pack-icon--claimed");
                view.updateVal(`shrineMs_${id}_icon_${i}`, claimed, "classList.toggle", "shrine-pack-icon--spent");
            }
            view.updateVal(`shrineMs_${id}_check`, allClaimed ? "visible" : "hidden", "style.visibility");
        };
        setCapped("shrineLevel", engine.getShrineContinuousLevelProgress(), engine.shrineLevelMilestoneThresholds, ms.shrineLevelClaimed || {});
        setCapped("totalStars", engine.getTotalEarnedStarsCount(), [5, 10, 15, 20, 25, 30], ms.totalStarsClaimed || {});
        const okami = engine.getOkami();
        setCapped("okamiLevel", (okami && okami.level) || 0, [10, 20, 30, 40, 50, 60, 70, 80], ms.okamiLevelClaimed || {});

        const setEscalating = function(id, current, req) {
            const need = Math.max(1, req || 1);
            const cur = Math.max(0, current || 0);
            const pct = Math.max(0, Math.min(100, (cur / need) * 100));
            view.updateVal(`shrineMs_${id}_fill`, `${pct}%`, "style.width");
            view.updateVal(`shrineMs_${id}_progress`, `${intToStringRound(cur)} / ${intToStringRound(need)}`);
            const completed = engine.getShrineRepeatingCompletedCount(id);
            const timesWord = completed === 1 ? "time" : "times";
            view.updateVal(`shrineMs_${id}_completed`, ` · completed ${intToStringRound(completed)} ${timesWord}`);
            const rarity = engine.getShrineEscalatingRarity(id, need);
            view.updateVal(`shrineMs_${id}_icon`, `img/${rarity}.svg`, "src");
        };

        const market = data.progress.base && data.progress.base.market;
        setEscalating("marketLevel", (market && market.level) || 0, ms.marketLevelReq || 4);
        setEscalating("depthReached", engine.getMineHighestDepthReached(), ms.depthReachedReq || 10);
        const orb = data.progress.base && data.progress.base.mage_tower;
        setEscalating("orbLevel", (orb && orb.level) || 0, ms.orbLevelReq || 35);
        setEscalating("essenceMade", data.progress.essenceMade || 0, ms.essenceMadeReq || 10000);
        setEscalating("maxMana", engine.getManaCapacity(), ms.maxManaReq || 200000);
        const divinity = data.progress.divinity;
        setEscalating("divinityAmount", (divinity && divinity.amount) || 0, ms.divinityAmountReq || 30000);
        setEscalating("totalGoldStars", engine.getTotalEarnedGoldStars(), ms.totalGoldStarsReq || 1);
        view.updateVal("shrineMs_buildShrine_check", ms.buildShrineClaimed ? "visible" : "hidden", "style.visibility");
        view.updateVal("shrineMs_buildShrine_icon", !!ms.buildShrineClaimed, "classList.toggle", "shrine-pack-icon--claimed");
    },

    updateBasePanelInn: function(base, t) {
        const inn = base.inn;
        t.refreshOrderedPurchasables("inn", resortData.buildings.inn.upgradesOrder, { hideMaxed: t.hideMaxed });
        engine.syncInnRoomCounts();
        view.updateVal("innRoomsAvailable", inn.roomsAvailable || 0);
        view.updateVal("innRoomsOccupied", inn.roomsOccupied || 0);
        view.updateVal("innRestfulnessPerSecond", engine.getInnRestfulnessPerSecond());
    },

    updateScribingsEta: function() {
        if (!viewData.cached.scribingsEtaText || typeof engine.getScribingsChainEtaSeconds !== "function") {
            return;
        }
        const lib = engine.ensureInscriptionState();
        viewData.scribingsEtaPrimed = true;
        if (!lib) {
            view.updateVal("scribingsEtaText", "-");
            return;
        }
        const seconds = engine.getScribingsChainEtaSeconds(lib);
        if (seconds === null) {
            view.updateVal("scribingsEtaText", "-");
        } else {
            view.updateVal("scribingsEtaText", seconds, "textContent", "time");
        }
    },
    updateScrollArchivesInscriptions: function() {
        const lib = engine.ensureInscriptionState();
        if (!lib) {
            return;
        }
        const tab = data.progress.selectedScrollArchivesSubTab === "research" ? "research" : "find";
        view.updateVal("scrollArchivesSubTab_find", tab === "find" ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
        view.updateVal("scrollArchivesSubTab_research", tab === "research" ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
        view.updateVal("scrollArchivesSubTab_research", `Research - ${intToStringRound(lib.researchesToChoose || 0)}`);
        view.updateVal("scrollArchivesFindPane", tab === "find" ? "" : "none", "style.display");
        view.updateVal("scrollArchivesResearchPane", tab === "research" ? "" : "none", "style.display");
        const scribingsNeed = lib.scribingsRequired || 300;
        const scribingsHave = lib.scribings || 0;
        const scribingsPct = scribingsNeed > 0 ? Math.max(0, Math.min(100, (scribingsHave / scribingsNeed) * 100)) : 0;
        view.updateVal("scribingsAmountText", scribingsHave, "textContent", 1);
        view.updateVal("scribingsRequiredText", scribingsNeed, "textContent", 1);
        view.updateVal("scribingsProgressFill", `${scribingsPct}%`, "style.width");
        if (!viewData.scribingsEtaPrimed) {
            view.updateScribingsEta();
        }
        const defs = engine.INSCRIPTION_ROWS;
        const rowLimit = engine.getInscriptionRowLimit();
        const unlockedThrough = lib.inscriptionUnlockedThrough || 0;
        const selected = lib.selectedInscription || "strokes";
        for (let i = 0; i < defs.length; i++) {
            const def = defs[i];
            if (i > rowLimit) {
                view.updateVal(`inscriptionRow_${def.key}`, "none", "style.display");
                continue;
            }
            const row = lib.inscriptions[def.key];
            const assignable = i <= unlockedThrough;
            const preview = i === unlockedThrough + 1;
            view.updateVal(`inscriptionRow_${def.key}`, assignable || preview ? "" : "none", "style.display");
            const btn = viewData.cached[`inscriptionAssign_${def.key}`];
            if (btn) {
                btn.disabled = !assignable;
                btn.classList.toggle("upgrade-btn-ready", assignable && selected === def.key);
            }
            const need = row.required || def.progressStart;
            const pct = need > 0 ? Math.max(0, Math.min(100, ((row.progress || 0) / need) * 100)) : 0;
            view.updateVal(`inscriptionFill_${def.key}`, `${pct}%`, "style.width");
            view.updateVal(`inscriptionProg_${def.key}`, row.progress || 0, "textContent", 1);
            view.updateVal(`inscriptionProgNeed_${def.key}`, need, "textContent", 1);
            view.updateVal(`inscriptionActual_${def.key}`, row.actual || 0, "textContent", 3);
            view.updateVal(`inscriptionBought_${def.key}`, row.bought || 0, "textContent", 2);
            view.updateVal(`inscriptionRate_${def.key}`, `+${intToStringRound(def.rateNum)}/${intToStringRound(def.rateDen)}s ${def.product} each`);
            let inscriptionOut = engine.inscriptionRate(def) * (row.actual || 0) * engine.getSturdyShelvesOutputMultiplier();
            if (def.key === "strokes") {
                inscriptionOut *= engine.getInfuseScribingsMultiplier();
            }
            view.updateVal(`inscriptionOutput_${def.key}`, `+${intToString(inscriptionOut, 3)}/s`);
            view.updateVal(`inscriptionReq_${def.key}`, need, "textContent", 3);
            const unit = engine.getInscriptionUnitCost(def);
            view.updateVal(`inscriptionCoins_${def.key}`, unit.coins, "textContent", 3);
            view.updateVal(`inscriptionBeads_${def.key}`, unit.beads, "textContent", 3);
            view.updateVal(`inscriptionMana_${def.key}`, unit.mana, "textContent", 3);
            view.updateVal(`inscriptionLock_${def.key}`, preview ? "" : "none", "style.display");
        }
    },
    updateBasePanelScrollArchives: function(base, t) {
        const lib = engine.ensureInscriptionState() || base.scrollArchives;
        this.updateResortWorkerControls("scrollArchives", engine.getScrollArchivesResearchRate() > 0);
        view.updateScrollArchivesInscriptions();
        const mapStars = engine.countAchievedMapStarsByType();
        const costPct = intToString(engine.getScrollArchivesBronzeResearchCostMult() * 100, 2);
        const speedPct = intToString(engine.getScrollArchivesSilverResearchSpeedMult() * 100, 2);
        const gainPct = intToString(engine.getScrollArchivesGoldResearchGainMult() * 100, 2);
        view.updateVal("scrollArchivesStarEffects_row",
            `<span class="star-bronze">★</span>: ${intToStringRound(mapStars.bronze)} cost ${costPct}% | `
            + `<span class="star-silver">★</span>: ${intToStringRound(mapStars.silver)} speed ${speedPct}% | `
            + `<span class="star-gold">★</span>: ${intToStringRound(mapStars.gold)} gain ${gainPct}%`,
            "innerHTML");
        const toChoose = lib.researchesToChoose || 0;
        view.updateVal("scrollArchivesChoicesWrap", toChoose > 0 ? "" : "none", "style.display");
        view.updateVal("base_scrollArchives_row_finish_research", toChoose > 0 ? "" : "none", "style.display");
        const choices = lib.researchChoices || [];
        for (let ci = 0; ci < 3; ci++) {
            const skillKey = choices[ci];
            const colId = `scrollArchivesChoice_${ci}`;
            if (!skillKey) {
                view.updateVal(colId, "none", "style.display");
                view.updateVal(`scrollArchivesChoiceTips_${ci}`, "none", "style.display");
                view.updateVal(`scrollArchivesChoiceSlotCat_${ci}`, "none", "style.display");
                const emptyCol = viewData.cached[colId];
                if (emptyCol) {
                    emptyCol.classList.remove("scroll-archives-choice-col--offense", "scroll-archives-choice-col--defense", "scroll-archives-choice-col--utility");
                }
                continue;
            }
            const sk = data.progress.skills[skillKey];
            const slotCat = skills.getSlotCategory(skillKey);
            const colEl = viewData.cached[colId];
            if (colEl) {
                colEl.classList.toggle("scroll-archives-choice-col--offense", slotCat === "offense");
                colEl.classList.toggle("scroll-archives-choice-col--defense", slotCat === "defense");
                colEl.classList.toggle("scroll-archives-choice-col--utility", slotCat === "utility");
            }
            view.updateVal(colId, "", "style.display");
            if (slotCat) {
                const catLabel = slotCat.charAt(0).toUpperCase() + slotCat.slice(1);
                view.updateVal(`scrollArchivesChoiceSlotCat_${ci}`, "", "style.display");
                view.updateVal(`scrollArchivesChoiceSlotCat_${ci}`, catLabel);
                const catLabelEl = viewData.cached[`scrollArchivesChoiceSlotCat_${ci}`];
                if (catLabelEl) {
                    catLabelEl.className = `scroll-archives-choice-slot-cat scroll-archives-choice-slot-cat--${slotCat}`;
                }
            } else {
                view.updateVal(`scrollArchivesChoiceSlotCat_${ci}`, "none", "style.display");
            }
            view.updateVal(`scrollArchivesChoiceType_${ci}`, sk ? sk.name : skillKey);
            view.updateVal(`scrollArchivesChoiceDesc_${ci}`, skills.wrapBuffNamesInHtml(skills.getSkillShortDescription(skillKey)), "innerHTML");
            const choiceTips = sk ? (sk.tips || 0) : 0;
            view.updateVal(`scrollArchivesChoiceTips_${ci}`, choiceTips > 0 ? "" : "none", "style.display");
            view.updateVal(`scrollArchivesChoiceTips_${ci}`, choiceTips > 0 ? `${choiceTips} tips` : "");
            const radio = document.getElementById(`scrollArchivesChoiceRadio_${ci}`);
            if (radio) {
                radio.checked = lib.selectedResearchChoice === skillKey;
            }
        }
        const weaveSec = engine.getScrollArchivesFinishWeaveSeconds();
        view.updateVal("base_scrollArchives_extra_finish_research", toChoose > 0
            ? `${Math.ceil(weaveSec)} threads to weave`
            : "");
        const purchaseUi = engine.getUpgradePurchaseUi("scrollArchives", "finishResearch");
        const btnEl = viewData.cached.base_scrollArchives_finish_research_btn;
        if (purchaseUi && btnEl) {
            view.updateVal("base_scrollArchives_finish_research_btn", purchaseUi.label, "innerHTML");
            view.updateVal("base_scrollArchives_finish_research_btn", purchaseUi.disabled, "disabled");
            btnEl.classList.toggle("upgrade-btn-paused", purchaseUi.mode === "weavePaused");
            btnEl.classList.toggle("upgrade-btn-weaving", purchaseUi.mode === "weaving" || purchaseUi.mode === "weavePaused");
            if (purchaseUi.mode === "weaving" || purchaseUi.mode === "weavePaused") {
                if (purchaseUi.pct !== null && purchaseUi.pct !== undefined) {
                    btnEl.style.setProperty("--weave-pct", `${purchaseUi.pct}%`);
                }
            } else {
                btnEl.style.removeProperty("--weave-pct");
            }
        }
        const archivesOrder = resortData.buildings.scrollArchives.upgradesOrder || [];
        const archivesPurchases = [];
        for (let aoi = 0; aoi < archivesOrder.length; aoi++) {
            if (archivesOrder[aoi] !== "finishResearch") {
                archivesPurchases.push(archivesOrder[aoi]);
            }
        }
        t.refreshOrderedPurchasables("scrollArchives", archivesPurchases, { hideMaxed: t.hideMaxed });
        if (typeof createView !== "undefined" && createView.refreshInfoButtonPanel) {
            createView.refreshInfoButtonPanel("resortInfo_scrollArchives");
        }
    },

    updateBasePanelAtelier: function(t) {
        const atelier = data.progress.base && data.progress.base.atelier ? data.progress.base.atelier : {};
        const showOreBars = engine.isBringOreToAtelierUnlocked();
        view.updateVal("atelierOreBars_row", showOreBars ? "" : "none", "style.display");
        view.updateVal("atelierInfoOre", atelier.ore || 0, "textContent", "floor");
        view.updateVal("atelierInfoBars", atelier.bars || 0, "textContent", "floor");
        t.refreshOrderedPurchasables("atelier", resortData.buildings.atelier.upgradesOrder, t.soldOutUpgradeRowOpts(t.hideMaxed, "atelier"));
        if (!engine.isDrophammerDebugEnabled()) {
            view.updateVal("base_atelier_unlock_drophammer_row", "none", "style.display");
        }
        const tabsOn = engine.isDrophammerUnlocked();
        let sub = data.progress.selectedAtelierSubTab || "atelier";
        if (!tabsOn || (sub !== "atelier" && sub !== "dropHammer")) {
            sub = "atelier";
        }
        view.updateVal("atelierSubTabs", tabsOn ? "" : "none", "style.display");
        view.updateVal("atelierSubTab_atelier", !tabsOn || sub === "atelier" ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
        view.updateVal("atelierSubTab_dropHammer", tabsOn && sub === "dropHammer" ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
        view.updateVal("atelierPane_atelier", !tabsOn || sub === "atelier" ? "" : "none", "style.display");
        view.updateVal("atelierPane_dropHammer", tabsOn && sub === "dropHammer" ? "" : "none", "style.display");
        if (viewData.cached.base_atelier_sandal_row) {
            view.updateVal("base_atelier_sandal_row", "none", "style.display");
        }
    },
    updateAtelierWheel: function() {
        const unlocked = engine.isDrophammerUnlocked();
        view.updateVal("baseBuilding_atelier", unlocked, "classList.toggle", "has-drophammer");
        const wheel = viewData.cached.atelierMapWheel;
        if (!wheel) {
            return;
        }
        if (!unlocked) {
            if (wheel._spinAnim) {
                wheel._spinAnim.pause();
            }
            return;
        }
        const deg = engine.getAtelierWheelDegreesPerSecond();
        if (!wheel._spinAnim) {
            wheel._spinAnim = wheel.animate(
                [
                    { transform: "rotate(0deg) scaleX(-1)" },
                    { transform: "rotate(360deg) scaleX(-1)" }
                ],
                { duration: 6000, iterations: Infinity, easing: "linear" }
            );
        }
        const paused = !!(data.gameSettings && data.gameSettings.stop);
        if (paused || !(deg > 0)) {
            wheel._spinAnim.pause();
            return;
        }
        const playback = deg / 60;
        if (Math.abs(wheel._spinAnim.playbackRate - playback) > 0.001) {
            wheel._spinAnim.playbackRate = playback;
        }
        if (wheel._spinAnim.playState !== "running") {
            wheel._spinAnim.play();
        }
    },

    /** Reorder upgrade rows once. Called only when that building's info is opened. */
    sortBuildingUpgradeRows: function(scopeKey, resourceKey) {
        const cfg = resortData.buildings[scopeKey];
        if (!cfg || !cfg.upgrades || !cfg.upgradesOrder) {
            return;
        }
        const order = cfg.upgradesOrder;
        const entries = [];
        let parent = null;
        let firstRow = null;
        for (let i = 0; i < order.length; i++) {
            const pk = order[i];
            const u = cfg.upgrades[pk];
            if (!u || !u.key) {
                continue;
            }
            const rowId = resortData.idRow(scopeKey, resortData.slug(u));
            const row = viewData.cached[rowId] || document.getElementById(rowId);
            if (!row || !row.parentNode) {
                continue;
            }
            if (!parent) {
                parent = row.parentNode;
            }
            if (row.parentNode !== parent) {
                continue;
            }
            if (!firstRow || (row.compareDocumentPosition(firstRow) & Node.DOCUMENT_POSITION_FOLLOWING)) {
                firstRow = row;
            }
            const cost = resortData.upgradeCost(u);
            const hasAmount = !!(cost && Object.prototype.hasOwnProperty.call(cost, resourceKey)
                && cost[resourceKey] !== null && cost[resourceKey] !== undefined);
            entries.push({
                row: row,
                amount: hasAmount ? cost[resourceKey] : null,
                weave: resortData.getUpgradeWeavingBaseSeconds(u, scopeKey),
                index: i
            });
        }
        if (!parent || !firstRow || entries.length < 2) {
            return;
        }
        entries.sort(function(a, b) {
            const aMissing = a.amount === null;
            const bMissing = b.amount === null;
            if (aMissing !== bMissing) {
                return aMissing ? 1 : -1;
            }
            if (!aMissing && a.amount !== b.amount) {
                return a.amount - b.amount;
            }
            if (a.weave !== b.weave) {
                return a.weave - b.weave;
            }
            return a.index - b.index;
        });
        let cursor = firstRow;
        for (let ei = 0; ei < entries.length; ei++) {
            parent.insertBefore(entries[ei].row, cursor);
            cursor = entries[ei].row.nextSibling;
        }
    },

    updateBasePanelGarden: function(base, t) {
        const g = base.garden || {};
        view.updateVal("gardenAppraisalAuto_row", g.arrangementOfAppraisalUnlocked ? "" : "none", "style.display");
        view.updateVal("gardenReviewAuto_row", g.arrangementOfReviewUnlocked ? "" : "none", "style.display");
        view.updateVal("gardenReviewPaused_row", g.arrangementOfReviewUnlocked ? "" : "none", "style.display");
        const appraisalChk = viewData.cached.gardenAppraisalAuto_chk;
        if (appraisalChk && appraisalChk.checked !== !!g.autoWeaveOnGatherComplete) {
            appraisalChk.checked = !!g.autoWeaveOnGatherComplete;
        }
        const reviewChk = viewData.cached.gardenReviewAuto_chk;
        if (reviewChk && reviewChk.checked !== !!g.autoWeaveCheapestReady) {
            reviewChk.checked = !!g.autoWeaveCheapestReady;
        }
        const reviewPausedChk = viewData.cached.gardenReviewPaused_chk;
        if (reviewPausedChk && reviewPausedChk.checked !== !!g.autoWeaveIncludePausedWeaves) {
            reviewPausedChk.checked = !!g.autoWeaveIncludePausedWeaves;
        }
        view.updateVal("gardenManaReserve_row", g.arrangementOfManaReserveUnlocked ? "" : "none", "style.display");
        const reserveChk = viewData.cached.gardenManaReserve_chk;
        if (reserveChk && reserveChk.checked !== !!g.reserveCloneManaForAutobuy) {
            reserveChk.checked = !!g.reserveCloneManaForAutobuy;
        }
        if (g.arrangementOfManaReserveUnlocked) {
            const reserved = (typeof bonfire !== "undefined" && bonfire.getCreateClonePlan)
                ? bonfire.getCreateClonePlan().manaCost
                : 0;
            view.updateVal("gardenManaReserve_label", `Don't count mana equal to the current clone's cost for mana autobuy (${formatNumber(reserved)} mana)`);
        }
        t.refreshOrderedPurchasables("garden", resortData.buildings.garden.upgradesOrder, { hideMaxed: t.hideMaxed });
    },

    updateResortWorkerControls: function(siteKey, productive) {
        const base = data.progress.base;
        const slot = base && base[siteKey];
        if (!slot) {
            return;
        }
        const assigned = slot.assignedWorkers || 0;
        let workRate = engine.getSiteEffectiveWorkerRate(siteKey);
        view.updateVal(`base_${siteKey}_workers_label`, `Kitsune: ${assigned}`);
        const canAssign = engine.getAvailableWorkers() > 0;
        const canUnassign = assigned > 0;
        const inc = resortData.workerAdjustIncrBtnSuffixes || [];
        const dec = resortData.workerAdjustDecrBtnSuffixes || [];
        for (let i = 0; i < inc.length; i++) {
            view.updateVal(`base_${siteKey}_${inc[i]}_btn`, !canAssign, "disabled");
        }
        for (let i = 0; i < dec.length; i++) {
            view.updateVal(`base_${siteKey}_${dec[i]}_btn`, !canUnassign, "disabled");
        }
        const okami = engine.getOkami();
        const okamiHere = okami.assignedBuildingKey === siteKey;
        view.updateVal(`base_${siteKey}_assign_okami_btn`, okamiHere ? "Unassign Okami" : "Assign Okami");
        view.updateVal(`base_${siteKey}_assign_okami_btn`, okamiHere, "classList.toggle", "assign-okami-btn-active");
        let required = 30;
        if (siteKey === "torii") {
            required = slot.visitorDrawPowerRequired || 30;
        } else if (siteKey === "laundry") {
            required = slot.cleanPowerRequired || 30;
        } else if (siteKey === "bambooForest") {
            required = resortData.bambooForestConfig.cutPowerRequired;
        } else if (siteKey === "foxDen") {
            required = 0;
        } else if (siteKey === "scrollArchives") {
            required = 0;
        } else if (siteKey === "mage_tower") {
            required = 0;
        }
        const wpt = `base_${siteKey}_wpt`;
        if (siteKey === "mage_tower") {
            view.updateVal(`base_${siteKey}_worker_prod_wrap`, "none", "style.display");
            const units = engine.getOrbWorkerUnits();
            view.updateVal(`${wpt}_units`, units);
            view.updateVal(`${wpt}_units_pct`, units * 20);
            view.updateVal(`${wpt}_exp`, round2(engine.getOrbExpGainPerSecond()));
            view.updateVal(`${wpt}_mana`, round2(engine.getEffectiveManaRatePerSecond()));
            view.updateVal(`${wpt}_okami_wrap`, okamiHere ? "" : "none", "style.display");
            if (okamiHere) {
                view.updateVal(`${wpt}_okami`, round2(engine.getOkamiInspirationBonus()));
            }
            return;
        }
        if (siteKey === "foxDen") {
            view.updateVal(`base_${siteKey}_worker_prod_wrap`, "none", "style.display");
            const okamiHereFox = engine.getOkami().assignedBuildingKey === "foxDen";
            view.updateVal(`${wpt}_carriers`, assigned + (okamiHereFox ? 1 : 0));
            view.updateVal(`${wpt}_speed`, round1(engine.getFoxDenCarrierSpeed({ isOkami: false })));
            view.updateVal(`${wpt}_okami_wrap`, okamiHereFox ? "" : "none", "style.display");
            if (okamiHereFox) {
                view.updateVal(`${wpt}_okami_speed`, round1(engine.getFoxDenCarrierSpeed({ isOkami: true })));
            }
            return;
        }
        if (siteKey === "scrollArchives") {
            const lib = engine.ensureInscriptionState() || base.scrollArchives;
            const researcherCount = assigned + (okamiHere ? 1 : 0);
            const spend = engine.getInscriptionSpendPerSecond();
            const speed = engine.getInscriptionProgressPerSecond();
            const def = engine.getSelectedInscriptionDef(lib);
            const row = lib.inscriptions && lib.inscriptions[def.key];
            const need = row ? (row.required || def.progressStart) : def.progressStart;
            const remain = Math.max(0, need - ((row && row.progress) || 0));
            view.updateVal(`${wpt}_researchers`, researcherCount, "textContent", 2);
            view.updateVal(`${wpt}_speed`, speed, "textContent", 3);
            view.updateVal(`${wpt}_next_name`, def.name);
            view.updateEtaText(`${wpt}_next_eta`, remain, lib.researchPaused ? 0 : speed);
            view.updateVal(`${wpt}_okami_wrap`, okamiHere ? "" : "none", "style.display");
            if (okamiHere) {
                view.updateVal(`${wpt}_okami`, engine.getOkamiInspirationBonus(), "textContent", 3);
            }
            view.updateVal(`${wpt}_cost_coins`, spend.coins, "textContent", 3);
            view.updateVal(`${wpt}_cost_beads`, spend.beads, "textContent", 3);
            view.updateVal(`${wpt}_cost_mana`, spend.mana, "textContent", 3);
            view.updateVal(`${wpt}_paused`, lib.researchPaused ? "" : "none", "style.display");
            view.updateVal(`base_${siteKey}_worker_prod_wrap`, "none", "style.display");
            return;
        }
        if (siteKey === "bonfire") {
            const okamiHereBonfire = engine.getOkami().assignedBuildingKey === "bonfire";
            const heatDisp = bonfire.getHeatDisplay();
            const heatPct = bonfire.getHeatBarFillPercent(heatDisp.heat);
            view.updateVal(`${wpt}_carriers`, assigned + (okamiHereBonfire ? 1 : 0));
            view.updateVal(`${wpt}_speed`, round1(engine.getBonfireCarrierSpeed({ isOkami: false })));
            view.updateVal(`${wpt}_okami_speed`, round1(engine.getBonfireCarrierSpeed({ isOkami: true })));
            view.updateVal(`${wpt}_heat`, round1(heatDisp.heat));
            view.updateVal(`${wpt}_heat_next`, round1(heatDisp.nextThreshold));
            view.updateVal(`${wpt}_heat_bonus`, heatDisp.bonusLabel);
            view.updateVal(`base_${siteKey}_worker_prod_wrap`, "", "style.display");
            view.updateVal(`base_${siteKey}_worker_prog_fill`, `${heatPct}%`, "style.width");
            return;
        }
        if (siteKey === "market") {
            const allowed = engine.getMarketAllowedHaulResources();
            const hasHaul = allowed.length > 0;
            view.updateVal(`${wpt}_carriers`, engine.getMarketCarrierCapacity());
            view.updateVal(`${wpt}_speed`, round1(engine.getMarketCarrierSpeed({ isOkami: false })));
            view.updateVal(`${wpt}_okami_wrap`, okamiHere ? "" : "none", "style.display");
            if (okamiHere) {
                view.updateVal(`${wpt}_okami_speed`, round1(engine.getMarketCarrierSpeed({ isOkami: true })));
            }
            view.updateVal(`${wpt}_haul_list_wrap`, hasHaul ? "" : "none", "style.display");
            view.updateVal(`${wpt}_haul_empty`, hasHaul ? "none" : "", "style.display");
            if (hasHaul) {
                view.updateVal(`${wpt}_haul_list`, allowed.join(", "));
            }
            view.updateVal(`${wpt}_credit`, round1(engine.getMarketCreditPerSecond()));
            view.updateVal(`base_${siteKey}_worker_prod_wrap`, "none", "style.display");
            return;
        }
        if (siteKey === "cistern") {
            const okamiHereCistern = engine.getOkami().assignedBuildingKey === "cistern";
            const inn = base.inn;
            const hot = inn.hotWater || 0;
            const hotCap = engine.getInnHotWaterCapacity();
            const onsen = engine.isInnOnsenConverted();
            view.updateVal(`${wpt}_carriers`, assigned + (okamiHereCistern ? 1 : 0));
            view.updateVal(`${wpt}_speed`, round1(engine.getCisternCarrierSpeed({ isOkami: false })));
            view.updateVal(`${wpt}_okami_wrap`, okamiHereCistern ? "" : "none", "style.display");
            if (okamiHereCistern) {
                view.updateVal(`${wpt}_okami_speed`, round1(engine.getCisternCarrierSpeed({ isOkami: true })));
            }
            view.updateVal(`${wpt}_hot_wrap`, onsen ? "" : "none", "style.display");
            if (onsen) {
                view.updateVal(`${wpt}_hot`, round1(hot));
                view.updateVal(`${wpt}_hot_cap`, hotCap);
                view.updateVal(`${wpt}_hot_note`, engine.isCisternWaterHotEnoughForOnsen() ? "none" : "", "style.display");
            }
            view.updateVal(`base_${siteKey}_worker_prod_wrap`, "", "style.display");
            view.updateVal(`base_${siteKey}_worker_prog_fill`, hotCap > 0 ? `${Math.round((hot / hotCap) * 100)}%` : "0%", "style.width");
            return;
        }
        let pct = required > 0 ? Math.max(0, Math.min(100, ((slot.workerPower || 0) / required) * 100)) : 0;
        view.updateVal(`base_${siteKey}_worker_prod_wrap`, "", "style.display");
        const power = round1(slot.workerPower || 0);
        if (siteKey === "torii") {
            const canReduce = workRate > 0;
            const reduceSec = engine.getToriiWorkerTimerReduceSeconds();
            const reducingPerSec = required > 0 && canReduce ? (reduceSec * workRate) / required : 0;
            const reduceSecStr = (Math.abs(reduceSec - Math.round(reduceSec)) < 1e-9) ? String(Math.round(reduceSec)) : round1(reduceSec);
            view.updateVal(`${wpt}_rate`, round1(workRate));
            view.updateVal(`${wpt}_reduce_wrap`, required > 0 ? "" : "none", "style.display");
            view.updateVal(`${wpt}_progress_wrap`, required > 0 ? "" : "none", "style.display");
            if (required > 0) {
                view.updateVal(`${wpt}_reduce_sec`, reduceSecStr);
                view.updateVal(`${wpt}_power`, power);
                view.updateVal(`${wpt}_required`, required);
                view.updateVal(`${wpt}_reducing`, round2(reducingPerSec));
            }
        } else if (siteKey === "bambooForest") {
            const bambooRate = engine.getBambooCutWorkerRate();
            const chipsPerChop = engine.getBambooChipsPerChop();
            const canComplete = bambooRate > 0;
            const woodPerSec = required > 0 && canComplete ? (bambooRate / required) * chipsPerChop : 0;
            view.updateVal(`${wpt}_rate`, round1(bambooRate));
            view.updateVal(`${wpt}_complete_wrap`, required > 0 ? "" : "none", "style.display");
            if (required > 0) {
                view.updateVal(`${wpt}_power`, power);
                view.updateVal(`${wpt}_required`, required);
            }
            view.updateVal(`${wpt}_per_sec`, round2(woodPerSec));
            pct = required > 0 && canComplete ? Math.max(0, Math.min(100, ((slot.workerPower || 0) / required) * 100)) : 0;
        } else {
            const canComplete = workRate > 0 && (siteKey !== "laundry" || productive);
            const completionsPerSec = required > 0 && canComplete ? workRate / required : 0;
            view.updateVal(`${wpt}_rate`, round1(workRate));
            view.updateVal(`${wpt}_complete_wrap`, required > 0 ? "" : "none", "style.display");
            if (required > 0) {
                view.updateVal(`${wpt}_power`, power);
                view.updateVal(`${wpt}_required`, required);
            }
            view.updateVal(`${wpt}_per_sec`, round2(completionsPerSec));
        }
        view.updateVal(`base_${siteKey}_worker_prog_fill`, `${pct}%`, "style.width");
    },
    updateMapRevealVisibility: function() {
        const hsRevealed = engine.isMapElementRevealed("hiddenSpring");
        const mineRevealed = engine.isMapElementRevealed("mine");
        const slotsRevealed = engine.isMapElementRevealed("spiritSlots");
        const hsBtn = viewData.cached.baseBuilding_hiddenSpring;
        if (hsBtn) {
            hsBtn.classList.toggle("map-building-locked", !hsRevealed);
            hsBtn.classList.toggle("resort-building-map-btn", hsRevealed);
            const label = hsBtn.querySelector(".resort-building-label-text");
            if (label) {
                label.classList.toggle("map-reveal-hidden", !hsRevealed);
            }
        }
        view.updateVal("baseBuilding_mine", mineRevealed ? "" : "none", "style.display");
        const hs = data.progress.base.hiddenSpring;
        const waterBought = !!((hs && hs.waterSpiritsBought) || 0);
        const earthBought = engine.hasFirstEarthSpirit();
        view.updateVal("spiritSlots_earth", (slotsRevealed && earthBought) ? "" : "none", "style.display");
        view.updateVal("spiritSlots_water", (slotsRevealed && waterBought) ? "" : "none", "style.display");
        view.updateVal("spiritSlots_spiritTraining", engine.isSpiritTrainingSpotBought() ? "" : "none", "style.display");
        const mineEarthGrid = document.getElementById("spiritSlots_mine_earth");
        if (mineEarthGrid) {
            mineEarthGrid.style.display = mineRevealed ? "" : "none";
        }
    },
    updateFoxDenConstructionMap: function() {
        const rh = data.progress.base.foxDen;
        const unlocks = rh.unlocks || {};
        const order = resortData.getFoxDenUnlockOrder();
        const mapProgressKeys = {
            torii: "mapToriiProgressWrap",
            laundry: "mapLaundryProgressWrap",
            mage_tower: "mapOrbProgressWrap",
            shrine: "mapShrineProgressWrap",
            market: "mapMarketProgressWrap"
        };
        for (let i = 0; i < order.length; i++) {
            const uk = order[i];
            const site = rh.constructionSites[uk];
            const building = site && site.status === "building";
            const unlocked = !!unlocks[uk];
            const pos = engine.getFoxDenMapSlotPosition(uk)
            view.updateVal(`foxDenSlot_${uk}`, building ? "" : "none", "style.display");
            if (building) {
                view.setGpuPosById(`foxDenSlot_${uk}`, pos.x, pos.y, false);
                view.updateVal(`foxDenSlotPct_${uk}`, `${resortData.getConstructionPercent(site)}%`);
                view.bindConstructionSlotTip(uk);
            }
            const mapBtnKey = `baseBuilding_${uk}`;
            const mapBtn = viewData.cached[mapBtnKey];
            if (mapBtn) {
                const showUnlockedBtn = unlocked && !building;
                if (showUnlockedBtn) {
                    mapBtn.style.display = "";
                    mapBtn.classList.remove("map-building-layout-hidden");
                } else if (building) {
                    mapBtn.style.display = "";
                    mapBtn.classList.add("map-building-layout-hidden");
                } else {
                    mapBtn.style.display = "none";
                    mapBtn.classList.remove("map-building-layout-hidden");
                }
            }
            const progressKey = mapProgressKeys[uk];
            if (progressKey) {
                view.updateVal(progressKey, unlocked && !building ? "" : "none", "style.display");
            }
        }
        view.refreshConstructionMouseTip();
    },
    updateFoxDenCarriers: function() {
        const rh = data.progress.base.foxDen;
        const carriers = rh.constructionCarriers || [];
        for (let cj = 0; cj < carriers.length; cj++) {
            if (carriers[cj].displaySlot === undefined || carriers[cj].displaySlot === null) {
                carriers[cj].displaySlot = engine.getFreeCarrierDisplaySlot(rh);
            }
        }
        for (let ci = 0; ci < 8; ci++) {
            const elId = `foxDenCarrier_${ci}`;
            let carrier = null;
            for (let cj = 0; cj < carriers.length; cj++) {
                if (carriers[cj].displaySlot === ci) {
                    carrier = carriers[cj];
                    break;
                }
            }
            view.setDisplayById(elId, !!carrier);
            if (carrier) {
                const el = viewData.cached[elId];
                const img = el ? el.querySelector(".fox-den-carrier-img") : null;
                if (carrier.haulPhase === "onPath") {
                    const pos = engine.getResortPathPosition(carrier.pathProgress || 0);
                    view.setGpuPosById(elId, pos.x, pos.y, false);
                    if (img) {
                        img.src = view.getCarrierSprite(carrier);
                        const east = engine.getPathTravelDirectionEast(carrier.pathProgress || 0, -1);
                        view.setFoxTravelMirror(img, east);
                    }
                } else {
                    const route = engine.getCarrierRoutePoints(carrier);
                    const p = carrier.progress || 0;
                    const x = route.fromX + (route.toX - route.fromX) * p;
                    const y = route.fromY + (route.toY - route.fromY) * p;
                    view.setGpuPosById(elId, x, y, false);
                    if (img) {
                        img.src = view.getCarrierSprite(carrier);
                        view.setFoxTravelMirror(img, route.toX > route.fromX);
                    }
                }
            }
        }
    },
    updateBonfireCarriers: function() {
        const bf = data.progress.base.bonfire;
        const carriers = bf.woodCarriers || [];
        for (let cj = 0; cj < carriers.length; cj++) {
            if (carriers[cj].displaySlot === undefined || carriers[cj].displaySlot === null) {
                carriers[cj].displaySlot = engine.getFreeBonfireCarrierDisplaySlot(bf);
            }
        }
        for (let ci = 0; ci < 8; ci++) {
            const elId = `bonfireCarrier_${ci}`;
            let carrier = null;
            for (let cj = 0; cj < carriers.length; cj++) {
                if (carriers[cj].displaySlot === ci) {
                    carrier = carriers[cj];
                    break;
                }
            }
            view.setDisplayById(elId, !!carrier);
            if (carrier) {
                const route = engine.getCarrierRoutePoints(carrier);
                const p = carrier.progress || 0;
                const x = route.fromX + (route.toX - route.fromX) * p;
                const y = route.fromY + (route.toY - route.fromY) * p;
                view.setGpuPosById(elId, x, y, false);
                const el = viewData.cached[elId];
                if (el) {
                    const img = el.querySelector(".bonfire-carrier-img");
                    if (img) {
                        img.src = view.getCarrierSprite(carrier);
                        view.setFoxTravelMirror(img, route.toX > route.fromX);
                    }
                }
            }
        }
    },
    updateMarketCarriers: function() {
        const market = data.progress.base.market;
        const carriers = (market && market.creditCarriers) || [];
        for (let cj = 0; cj < carriers.length; cj++) {
            if (carriers[cj].displaySlot === undefined || carriers[cj].displaySlot === null) {
                carriers[cj].displaySlot = engine.getFreeMarketCarrierDisplaySlot(market);
            }
        }
        for (let ci = 0; ci < 8; ci++) {
            const elId = `marketCarrier_${ci}`;
            let carrier = null;
            for (let cj = 0; cj < carriers.length; cj++) {
                if (carriers[cj].displaySlot === ci) {
                    carrier = carriers[cj];
                    break;
                }
            }
            view.setDisplayById(elId, !!carrier);
            if (carrier) {
                const route = engine.getCarrierRoutePoints(carrier);
                const p = carrier.progress || 0;
                const x = route.fromX + (route.toX - route.fromX) * p;
                const y = route.fromY + (route.toY - route.fromY) * p;
                view.setGpuPosById(elId, x, y, false);
                const el = viewData.cached[elId];
                if (el) {
                    const img = el.querySelector(".market-carrier-img");
                    if (img) {
                        img.src = view.getCarrierSprite(carrier);
                        view.setFoxTravelMirror(img, route.toX > route.fromX);
                    }
                }
            }
        }
    },
    updateCisternCarriers: function() {
        const cistern = data.progress.base.cistern;
        if (!engine.cisternWorkersRevealed()) {
            for (let ci = 0; ci < 8; ci++) {
                view.setDisplayById(`cisternCarrier_${ci}`, false);
            }
            return;
        }
        const carriers = cistern.waterCarriers || [];
        for (let cj = 0; cj < carriers.length; cj++) {
            if (carriers[cj].displaySlot === undefined || carriers[cj].displaySlot === null) {
                carriers[cj].displaySlot = engine.getFreeCisternCarrierDisplaySlot(cistern);
            }
        }
        for (let ci = 0; ci < 8; ci++) {
            const elId = `cisternCarrier_${ci}`;
            let carrier = null;
            for (let cj = 0; cj < carriers.length; cj++) {
                if (carriers[cj].displaySlot === ci) {
                    carrier = carriers[cj];
                    break;
                }
            }
            view.setDisplayById(elId, !!carrier);
            if (carrier) {
                const route = engine.getCarrierRoutePoints(carrier);
                const p = carrier.progress || 0;
                const x = route.fromX + (route.toX - route.fromX) * p;
                const y = route.fromY + (route.toY - route.fromY) * p;
                view.setGpuPosById(elId, x, y, false);
                const el = viewData.cached[elId];
                if (el) {
                    const img = el.querySelector(".cistern-carrier-img");
                    if (img) {
                        img.src = view.getCarrierSprite(carrier, "water");
                        view.setFoxTravelMirror(img, route.toX > route.fromX);
                    }
                }
            }
        }
    },
    updateInnCarriers: function() {
        const inn = data.progress.base.inn;
        if (!engine.isInnOnsenConverted()) {
            for (let ci = 0; ci < 8; ci++) {
                view.setDisplayById(`innCarrier_${ci}`, false);
            }
            return;
        }
        const carriers = inn.waterCarriers || [];
        for (let cj = 0; cj < carriers.length; cj++) {
            if (carriers[cj].displaySlot === undefined || carriers[cj].displaySlot === null) {
                carriers[cj].displaySlot = engine.getFreeInnCarrierDisplaySlot(inn);
            }
        }
        for (let ci = 0; ci < 8; ci++) {
            const elId = `innCarrier_${ci}`;
            let carrier = null;
            for (let cj = 0; cj < carriers.length; cj++) {
                if (carriers[cj].displaySlot === ci) {
                    carrier = carriers[cj];
                    break;
                }
            }
            view.setDisplayById(elId, !!carrier);
            if (carrier) {
                const route = engine.getCarrierRoutePoints(carrier);
                const p = carrier.progress || 0;
                const x = route.fromX + (route.toX - route.fromX) * p;
                const y = route.fromY + (route.toY - route.fromY) * p;
                view.setGpuPosById(elId, x, y, false);
                const el = viewData.cached[elId];
                if (el) {
                    const img = el.querySelector(".inn-carrier-img");
                    if (img) {
                        img.src = view.getCarrierSprite(carrier, "water");
                        view.setFoxTravelMirror(img, route.toX > route.fromX);
                    }
                }
            }
        }
    },
    updateOkamiPanel: function() {
        const okami = engine.getOkami();
        const tails = engine.getOkamiTails();
        const expNeed = engine.getOkamiExpToLevel();
        const expPct = expNeed > 0 ? Math.max(0, Math.min(100, ((okami.exp || 0) / expNeed) * 100)) : 0;
        view.updateVal("okamiTailLabel", `${engine.getOkamiTailLabel(tails)} Tail`);
        view.updateVal("okamiLevelText", okami.level || 0, "textContent", "floor");
        const cloneRunning = data.battle && data.battle.state === "running";
        if (cloneRunning) {
            const pending = data.battle.pendingOkamiExp || 0;
            view.updateVal("okamiExpText", `${round2(okami.exp || 0)} (+${round2(pending)}) / ${round2(expNeed)}`);
        } else {
            view.updateVal("okamiExpText", `${round2(okami.exp || 0)} / ${round2(expNeed)}`);
        }
        view.updateVal("okamiExpFill", `${expPct}%`, "style.width");
        view.updateVal("okamiSpiritStrands", round2(engine.getOkamiSpiritStrands()));
        const strandsNext = engine.getOkamiSpiritStrands((okami.level || 0) + 1);
        const strandsCur = engine.getOkamiSpiritStrands(okami.level || 0);
        view.updateVal("okamiSpiritStrandsNext", ` (+${round2(strandsNext - strandsCur)} next level)`);
        view.updateVal("okamiStateDisplay", engine.getOkamiStateDisplayText());
        view.updateVal("okamiInspirationBonus", `x${round2(engine.getOkamiInspirationBonus())}`);
        const perLvl = resortData.okamiConfig.inspirationBonusPerLevel || 0.02;
        view.updateVal("okamiInspirationHint", `(+${perLvl}/level)`);
        const stateEl = viewData.cached.okamiStateDisplay;
        if (stateEl) {
            stateEl.classList.toggle("okami-state-clickable", engine.isOkamiStateClickable());
        }
        view.updateManaBar();
        view.updateDivinityBar();
    },
    updateManaBar: function() {
        const unlocked = engine.isManaUnlocked();
        view.updateVal("manaProgressBar", unlocked ? "" : "none", "style.display");
        if (!unlocked) {
            return;
        }
        const mana = data.progress.mana;
        const cap = engine.getManaCapacity();
        const amount = Math.floor(mana.amount || 0);
        const rate = engine.getEffectiveManaRatePerSecond();
        const pct = cap > 0 ? Math.max(0, Math.min(100, (amount / cap) * 100)) : 0;
        view.updateVal("manaFill", `${pct}%`, "style.width");
        view.updateVal("manaAmount", amount, "textContent", "floor");
        view.updateVal("manaCap", cap, "textContent", "manaCap");
        view.updateVal("manaRate", round1Fixed(rate), "textContent");
        const lib = data.progress.base && data.progress.base.scrollArchives;
        const spend = (typeof engine.getInscriptionSpendPerSecond === "function") ? engine.getInscriptionSpendPerSecond() : null;
        const researching = !!(spend && spend.mana > 0 && lib && !lib.researchPaused);
        const drain = researching ? spend.mana : 0;
        view.updateVal("manaRateArchiveDrain", researching ? ` (-${intToString(drain, 3)}/s)` : "");
        const remainMana = Math.max(0, cap - amount);
        const netRate = rate - drain;
        view.updateEtaText("manaEtaText", remainMana, netRate);
    },
    updateDivinityBar: function() {
        const unlocked = engine.isShrineBuilt();
        view.updateVal("divinityProgressBar", unlocked ? "" : "none", "style.display");
        if (!unlocked) {
            return;
        }
        const divinity = data.progress.divinity || { amount: 0, capacity: 50000 };
        const cap = (divinity.capacity === undefined || divinity.capacity === null) ? 50000 : divinity.capacity;
        const amount = Math.floor(divinity.amount || 0);
        const rate = engine.getShrineDivinityRate();
        const pct = cap > 0 ? Math.max(0, Math.min(100, (amount / cap) * 100)) : 0;
        view.updateVal("divinityFill", `${pct}%`, "style.width");
        view.updateVal("divinityAmount", amount, "textContent", "floor");
        view.updateVal("divinityCap", cap, "textContent", "floor");
        view.updateVal("divinityRate", round1Fixed(rate), "textContent");
    },
    updateBuildingManaRow: function(buildingKey) {
        const visible = engine.isBuildingManaRowVisible(buildingKey);
        view.updateVal(`${buildingKey}ManaRow`, visible ? "" : "none", "style.display");
        const garden = data.progress.base && data.progress.base.garden;
        const showCarrier = visible && buildingKey !== "hiddenSpring" && !!(garden && garden.arrangementOfManaOrdersUnlocked);
        view.updateVal(`${buildingKey}AllowCarriersMana_row`, showCarrier ? "" : "none", "style.display");
        if (showCarrier) {
            const b = data.progress.base[buildingKey];
            const chk = viewData.cached[`${buildingKey}AllowCarriersMana_chk`] || document.getElementById(`${buildingKey}AllowCarriersMana_chk`);
            if (chk && b && chk.checked !== !!b.allowCarriersBringMana) {
                chk.checked = !!b.allowCarriersBringMana;
            }
        }
        const btnId = `${buildingKey}FillMana_btn`;
        const btnNode = viewData.cached[btnId];
        const weaveUi = engine.getUpgradeWeaveUi(buildingKey, "fillMana");
        if (!visible) {
            if (btnNode) {
                btnNode.classList.remove("upgrade-btn-weaving", "upgrade-btn-paused");
                btnNode.style.removeProperty("--weave-pct");
            }
            return;
        }
        const st = engine.getBuildingManaState(buildingKey);
        const manaAmt = Math.floor(st ? st.mana : 0);
        const manaCap = st ? st.capacity : engine.getBuildingManaCapacityFallback(buildingKey);
        const manaPct = manaCap > 0 ? Math.max(0, Math.min(100, (manaAmt / manaCap) * 100)) : 0;
        view.updateVal(`${buildingKey}ManaAmount`, manaAmt, "textContent", "floor");
        view.updateVal(`${buildingKey}ManaCap`, manaCap, "textContent", "floor");
        view.updateVal(`${buildingKey}ManaFill`, `${manaPct}%`, "style.width");
        const canFill = engine.canStartFillMana(buildingKey);
        const idleLabel = buildingKey === "hiddenSpring" ? "Send Mana Clone" : "Fill Mana";
        view.updateVal(btnId, (!canFill && !weaveUi) || !!(weaveUi && weaveUi.disabled), "disabled");
        if (weaveUi) {
            view.updateVal(btnId, weaveUi.label);
        } else {
            view.updateVal(btnId, idleLabel);
        }
        if (btnNode) {
            const weaving = !!weaveUi;
            btnNode.classList.toggle("upgrade-btn-weaving", weaving);
            btnNode.classList.toggle("upgrade-btn-paused", !!(weaveUi && weaveUi.mode === "paused"));
            if (weaving && weaveUi.pct !== null && weaveUi.pct !== undefined) {
                btnNode.style.setProperty("--weave-pct", `${weaveUi.pct}%`);
            } else {
                btnNode.style.removeProperty("--weave-pct");
            }
        }
    },
    syncAllowCarriersWaterCheckbox: function(buildingKey, waterVisible) {
        const show = !!waterVisible && engine.isWaterOrdersUnlocked();
        view.updateVal(`${buildingKey}AllowCarriersWater_row`, show ? "" : "none", "style.display");
        if (!show) {
            return;
        }
        const b = data.progress.base && data.progress.base[buildingKey];
        if (b && b.allowCarriersBringWater === undefined) {
            b.allowCarriersBringWater = true;
        }
        const chk = viewData.cached[`${buildingKey}AllowCarriersWater_chk`] || document.getElementById(`${buildingKey}AllowCarriersWater_chk`);
        if (chk && b && chk.checked !== !!b.allowCarriersBringWater) {
            chk.checked = !!b.allowCarriersBringWater;
        }
    },
    updateCollectStoneButton: function() {
        const btnId = "hiddenSpringCollectStone_btn";
        const btnNode = viewData.cached[btnId];
        const ui = engine.getCollectStoneTravelUi();
        view.updateVal(btnId, !!(ui && ui.disabled), "disabled");
        if (ui) {
            view.updateVal(btnId, ui.label);
        } else {
            view.updateVal(btnId, `Collect ${engine.getCollectStoneAmount()} Stone`);
        }
        if (btnNode) {
            const showing = !!ui;
            btnNode.classList.toggle("upgrade-btn-weaving", showing);
            btnNode.classList.toggle("upgrade-btn-paused", !!(ui && ui.mode === "paused"));
            if (showing && ui.pct !== null && ui.pct !== undefined) {
                btnNode.style.setProperty("--weave-pct", `${ui.pct}%`);
            } else {
                btnNode.style.removeProperty("--weave-pct");
            }
        }
    },
    updateMapWaterBar: function(show, current, capacity, wrapId, fillId) {
        if (!show || !(capacity > 0)) {
            view.updateVal(wrapId, "none", "style.display");
            return;
        }
        const pct = Math.max(0, Math.min(100, ((current || 0) / capacity) * 100));
        view.updateVal(wrapId, "", "style.display");
        view.updateVal(fillId, `${pct}%`, "style.width");
    },
    updateMapBuildingManaBar: function(buildingKey, wrapId, fillId) {
        const st = engine.getBuildingManaState(buildingKey);
        if (st) {
            const pct = st.capacity > 0
                ? Math.max(0, Math.min(100, (st.mana / st.capacity) * 100))
                : 0;
            view.updateVal(wrapId, "", "style.display");
            view.updateVal(fillId, `${pct}%`, "style.width");
        } else {
            view.updateVal(wrapId, "none", "style.display");
        }
    },
    updateOrbProgressDisplays: function() {
        const orb = data.progress.base && data.progress.base.mage_tower;
        const unlocked = engine.isManaUnlocked();
        if (!orb || !unlocked) {
            view.updateVal("mapOrbProgressWrap", "none", "style.display");
            return;
        }
        const level = orb.level || 0;
        const exp = orb.exp || 0;
        const expToLevel = orb.expToLevel || 200;
        const pct = expToLevel > 0 ? Math.max(0, Math.min(100, (exp / expToLevel) * 100)) : 0;
        view.updateVal("orbLevelText", level, "textContent", "floor");
        view.updateVal("orbExpText", Math.round(exp), "textContent", 1);
        view.updateVal("orbExpToLevelText", Math.round(expToLevel), "textContent", 1);
        view.updateVal("orbExpFill", `${pct}%`, "style.width");
        view.updateVal("orbManaRateText", round2(engine.getEffectiveManaRatePerSecond()));
        view.updateVal("orbBaseManaText", intToStringRound(engine.getManaBaseCapacity()));
        const bonusBase = (resortData.manaCapacityBonusPerCloneDispersal !== undefined)
            ? resortData.manaCapacityBonusPerCloneDispersal : 10;
        const bfOrb = data.progress.base && data.progress.base.bonfire;
        if (bfOrb && bfOrb.lingeringDensityUnlocked) {
            const dens = typeof bonfire !== "undefined" && bonfire.getCloneDensity
                ? bonfire.getCloneDensity() : (bfOrb.cloneDensity || 0);
            const totalBonus = bonusBase + dens;
            const bondTxt = bfOrb.bondGrowthUnlocked ? ", +10% per 10s alive" : "";
            view.updateVal("orbBaseManaCloneBonusText", `(+${bonusBase} + ${dens} = ${totalBonus} base mana per clone dispersal${bondTxt})`);
        } else {
            view.updateVal("orbBaseManaCloneBonusText", `(+${engine.getManaCapacityBonusPerCloneDispersal()} base mana per clone dispersal)`);
        }
        view.updateVal("orbExpRateText", round2(engine.getOrbExpGainPerSecond()));
        const remainExp = Math.max(0, expToLevel - exp);
        const orbRate = engine.getOrbExpGainPerSecond();
        view.updateEtaText("orbExpEtaText", remainExp, orbRate);
        view.updateVal("mageTowerMapDisplay", `Lvl ${level}`, "textContent");
        view.updateVal("mapOrbProgressFill", `${pct}%`, "style.width");
    },
    updateMarketExchangeButton: function() {
        const btnId = "marketExchangeCredit_btn";
        const btnNode = viewData.cached[btnId];
        const weaveUi = engine.getUpgradeWeaveUi("market", "exchangeCredit");
        const canStart = engine.canStartExchangeCredit();
        view.updateVal(btnId, (!canStart && !weaveUi) || !!(weaveUi && weaveUi.disabled), "disabled");
        if (weaveUi) {
            let remainMs = 0;
            const weaving = data.progress.weaving;
            if (weaving && weaving.active && weaving.active.scopeKey === "market" && weaving.active.upgradeKey === "exchangeCredit") {
                remainMs = weaving.active.remainMs || 0;
            } else {
                const paused = engine.getPausedWeavingEntry("market", "exchangeCredit");
                remainMs = paused ? (paused.remainMs || 0) : 0;
            }
            const time = secondsToTime(remainMs / 1000);
            const label = weaveUi.mode === "paused"
                ? `Paused, finished in ${time}`
                : `Exchanging, finished in ${time}`;
            view.updateVal(btnId, label);
        } else {
            view.updateVal(btnId, "Exchange 1000 coins for 1000 credits in 80 threads to weave.");
        }
        if (btnNode) {
            const weaving = !!weaveUi;
            btnNode.classList.toggle("upgrade-btn-weaving", weaving);
            btnNode.classList.toggle("upgrade-btn-paused", !!(weaveUi && weaveUi.mode === "paused"));
            if (weaving && weaveUi.pct !== null && weaveUi.pct !== undefined) {
                btnNode.style.setProperty("--weave-pct", `${weaveUi.pct}%`);
            } else {
                btnNode.style.removeProperty("--weave-pct");
            }
        }
    },
    updateMarketProgressDisplays: function() {
        const market = data.progress.base && data.progress.base.market;
        const unlocked = engine.isMarketBuilt();
        if (!market || !unlocked) {
            view.updateVal("mapMarketProgressWrap", "none", "style.display");
            return;
        }
        const level = market.level || 0;
        const exp = market.exp || 0;
        const expToLevel = market.expToLevel || 30000;
        const pct = expToLevel > 0 ? Math.max(0, Math.min(100, (exp / expToLevel) * 100)) : 0;
        view.updateVal("marketLevelText", level, "textContent", "floor");
        view.updateVal("marketExpText", Math.round(exp), "textContent", "floor");
        view.updateVal("marketExpToLevelText", Math.round(expToLevel), "textContent", "floor");
        view.updateVal("marketExpFill", `${pct}%`, "style.width");
        view.updateVal("marketMapDisplay", `Lvl ${level} | ${resortData.resourceIconHtml("credit")} ${intToStringRound(market.credit || 0)}`, "innerHTML");
        view.updateVal("mapMarketProgressFill", `${pct}%`, "style.width");
    },
    updateShrineProgressDisplays: function() {
        const shrine = data.progress.base && data.progress.base.shrine;
        const unlocked = engine.isShrineBuilt();
        if (!shrine || !unlocked) {
            view.updateVal("mapShrineProgressWrap", "none", "style.display");
            return;
        }
        const level = shrine.level || 0;
        const exp = shrine.exp || 0;
        const expToLevel = shrine.expToLevel || 10000;
        const pct = expToLevel > 0 ? Math.max(0, Math.min(100, (exp / expToLevel) * 100)) : 0;
        view.updateVal("shrineLevelText", level, "textContent", "floor");
        view.updateVal("shrineExpText", Math.round(exp), "textContent", 1);
        view.updateVal("shrineExpToLevelText", Math.round(expToLevel), "textContent", 1);
        view.updateVal("shrineExpFill", `${pct}%`, "style.width");
        view.updateVal("shrineKarmaRateText", round2(engine.getShrineKarmaRate()));
        view.updateVal("shrineDivinityMultText", engine.getShrineDivinityMultiplier());
        view.updateVal("shrineDivinityRateText", round2(engine.getShrineDivinityRate()));
        view.updateEtaText("shrineExpEtaText", Math.max(0, expToLevel - exp), engine.getShrineKarmaRate());
        view.updateVal("shrineMapDisplay", `Lvl ${level}`, "textContent");
        view.updateVal("mapShrineProgressWrap", "", "style.display");
        view.updateVal("mapShrineProgressFill", `${pct}%`, "style.width");
    },
    updateDirtRoadLayer: function() {
        const svg = viewData.cached.dirtRoadLayer || document.getElementById("dirtRoadLayer");
        if (!svg) {
            return;
        }
        const hoverLayer = viewData.cached.dirtRoadHoverLayer || document.getElementById("dirtRoadHoverLayer");
        const unlocked = typeof engine.isDirtRoadsUnlocked === "function" && engine.isDirtRoadsUnlocked();
        const roads = unlocked && typeof engine.getDirtRoads === "function" ? engine.getDirtRoads() : [];
        if (!viewData.dirtRoadLineEls) {
            viewData.dirtRoadLineEls = {};
        }
        if (!viewData.dirtRoadHoverEls) {
            viewData.dirtRoadHoverEls = {};
        }
        if (!unlocked) {
            const mouseTip = viewData.cached.dirtRoadMouseTip || document.getElementById("dirtRoadMouseTip");
            if (mouseTip) {
                mouseTip.style.display = "none";
            }
        }
        if (!viewData.dirtRoadCoordsLocked) {
            svg.removeAttribute("viewBox");
            svg.setAttribute("preserveAspectRatio", "none");
            viewData.dirtRoadCoordsLocked = true;
        }
        const svgNs = "http://www.w3.org/2000/svg";
        const activeRoadKeys = {};
        for (let i = 0; i < roads.length; i++) {
            const road = roads[i];
            const key = engine.getDirtRoadKey(road.fromKey, road.toKey);
            if (!key || key === "|") {
                continue;
            }
            activeRoadKeys[key] = true;
            let line = viewData.dirtRoadLineEls[key];
            let hotspot = viewData.dirtRoadHoverEls[key];
            const from = engine.getMapBuildingPosition(road.fromKey);
            const to = engine.getMapBuildingPosition(road.toKey);
            if (!line) {
                line = document.createElementNS(svgNs, "line");
                line.setAttribute("class", "dirt-road-line");
                svg.appendChild(line);
                viewData.dirtRoadLineEls[key] = line;
            }
            const x1 = String(Math.round(from.x));
            const y1 = String(Math.round(from.y));
            const x2 = String(Math.round(to.x));
            const y2 = String(Math.round(to.y));
            if (line.getAttribute("x1") !== x1) {
                line.setAttribute("x1", x1);
            }
            if (line.getAttribute("y1") !== y1) {
                line.setAttribute("y1", y1);
            }
            if (line.getAttribute("x2") !== x2) {
                line.setAttribute("x2", x2);
            }
            if (line.getAttribute("y2") !== y2) {
                line.setAttribute("y2", y2);
            }
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const len = Math.max(1, Math.hypot(dx, dy));
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            if (!hotspot && hoverLayer) {
                hotspot = document.createElement("div");
                hotspot.className = "dirt-road-hotspot";
                const hit = document.createElement("div");
                hit.className = "dirt-road-hotspot-hit";
                hit.style.transformOrigin = "left center";
                hotspot.appendChild(hit);
                hoverLayer.appendChild(hotspot);
                viewData.dirtRoadHoverEls[key] = hotspot;
                view.bindDirtRoadTipEvents(hit);
            }
            if (hotspot) {
                const left = `${Math.round(from.x)}px`;
                const top = `${Math.round(from.y)}px`;
                if (hotspot.style.left !== left) {
                    hotspot.style.left = left;
                }
                if (hotspot.style.top !== top) {
                    hotspot.style.top = top;
                }
                const hit = hotspot.firstElementChild;
                if (hit) {
                    const width = `${len}px`;
                    const transform = `translate(0, -50%) rotate(${angle}deg)`;
                    if (hit.style.width !== width) {
                        hit.style.width = width;
                    }
                    if (hit.style.transform !== transform) {
                        hit.style.transform = transform;
                    }
                }
            }
            const roadCap = engine.getDirtRoadMaxProgress();
            const progress = Math.max(0, Math.min(roadCap, road.progress || 0));
            const opacity = engine.getRoadProgressOpacity(progress);
            if (line._dirtRoadOpacity !== opacity) {
                line._dirtRoadOpacity = opacity;
                line.setAttribute("stroke-opacity", String(opacity));
            }
            if (hotspot) {
                const showTip = progress > 0;
                hotspot.style.display = showTip ? "" : "none";
                if (showTip) {
                    hotspot._dirtRoadTipHtml = engine.getRoadProgressTipHtml(progress, road.decayAccMs);
                }
            }
        }
        const staleLineKeys = Object.keys(viewData.dirtRoadLineEls);
        for (let si = 0; si < staleLineKeys.length; si++) {
            const staleKey = staleLineKeys[si];
            if (activeRoadKeys[staleKey]) {
                continue;
            }
            const staleLine = viewData.dirtRoadLineEls[staleKey];
            if (staleLine && staleLine.parentNode) {
                staleLine.parentNode.removeChild(staleLine);
            }
            delete viewData.dirtRoadLineEls[staleKey];
        }
        const staleHoverKeys = Object.keys(viewData.dirtRoadHoverEls);
        for (let hi = 0; hi < staleHoverKeys.length; hi++) {
            const staleKey = staleHoverKeys[hi];
            if (activeRoadKeys[staleKey]) {
                continue;
            }
            const staleHover = viewData.dirtRoadHoverEls[staleKey];
            if (staleHover && staleHover.parentNode) {
                staleHover.parentNode.removeChild(staleHover);
            }
            delete viewData.dirtRoadHoverEls[staleKey];
        }
    },
    updatePathSegmentRoads: function() {
        const els = viewData.pathSegRoadEls;
        if (!els || !els.length) {
            return;
        }
        for (let i = 0; i < els.length; i++) {
            const el = els[i];
            if (!el) {
                continue;
            }
            const seg = engine.getPathSegmentData(i);
            const opacity = engine.getRoadProgressOpacity(seg && seg.roadProgress);
            if (el._roadOpacity !== opacity) {
                el._roadOpacity = opacity;
                el.setAttribute("stroke-opacity", String(opacity));
            }
        }
    },
    updatePondForestStream: function() {
        const svg = viewData.cached.pondForestStream;
        const path = viewData.cached.pondForestStreamPath;
        if (!svg || !path) {
            return;
        }
        const visible = typeof engine.isPondBuiltFromFoxDen === "function" && engine.isPondBuiltFromFoxDen();
        view.updateVal("pondForestStream", visible ? "" : "none", "style.display");
        if (!visible) {
            return;
        }
        const from = engine.getMapBuildingPosition("pond");
        const to = engine.getMapBuildingPosition("bambooForest");
        if (!from || !to) {
            return;
        }
        const sig = `${Math.round(from.x)},${Math.round(from.y)},${Math.round(to.x)},${Math.round(to.y)}`;
        if (path._streamSig !== sig) {
            path._streamSig = sig;
            path.setAttribute("d", view.buildPondForestStreamPath(from, to));
        }
        const width = String(engine.getPondForestStreamWidthPx());
        if (path.getAttribute("stroke-width") !== width) {
            path.setAttribute("stroke-width", width);
        }
    },
    buildPondForestStreamPath: function(from, to) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const amplitude = 14;
        const cycles = 2;
        const steps = 16;
        const pts = [];
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const envelope = Math.sin(Math.PI * t);
            const offset = Math.sin(t * Math.PI * 2 * cycles) * amplitude * envelope;
            pts.push({
                x: from.x + dx * t + nx * offset,
                y: from.y + dy * t + ny * offset
            });
        }
        let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i === 0 ? 0 : i - 1];
            const p1 = pts[i];
            const p2 = pts[i + 1];
            const p3 = pts[i + 2 < pts.length ? i + 2 : pts.length - 1];
            const c1x = p1.x + (p2.x - p0.x) / 6;
            const c1y = p1.y + (p2.y - p0.y) / 6;
            const c2x = p2.x - (p3.x - p1.x) / 6;
            const c2y = p2.y - (p3.y - p1.y) / 6;
            d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
        }
        return d;
    },
    bindFoxDenQueueTip: function() {
        const btn = viewData.cached.baseBuilding_foxDen || document.getElementById("baseBuilding_foxDen");
        if (!btn || btn._foxDenTipBound) {
            return;
        }
        btn._foxDenTipBound = true;
        btn.addEventListener("mouseenter", function(e) {
            view.showFoxDenQueueTip();
            view.positionFoxDenQueueTip(e);
        });
        btn.addEventListener("mousemove", function(e) {
            view.positionFoxDenQueueTip(e);
        });
        btn.addEventListener("mouseleave", function() {
            const tip = viewData.cached.foxDenQueueTip || document.getElementById("foxDenQueueTip");
            if (tip) {
                tip.style.display = "none";
            }
        });
    },
    getFoxDenQueueTipHtml: function() {
        const rh = data.progress.base && data.progress.base.foxDen;
        if (!rh) {
            return "";
        }
        const lines = [];
        for (let i = 0; i < rh.jobQueue.length; i++) {
            const jobKey = rh.jobQueue[i];
            const unlockKey = engine.parseBuildingJobKey(jobKey);
            if (unlockKey) {
                const site = rh.constructionSites && rh.constructionSites[unlockKey];
                if (!site || site.status !== "building") {
                    continue;
                }
                const def = resortData.foxDenUnlockGetDef(unlockKey);
                let name = "Building " + ((def && def.label) || unlockKey);
                if (site.paused) {
                    name += " (paused)";
                }
                lines.push(name);
                continue;
            }
            const job = rh.upgradeGatherJobs && rh.upgradeGatherJobs[jobKey];
            if (!job || job.status !== "gathering") {
                continue;
            }
            const parsed = engine.parseUpgradeGatherJobKey(jobKey);
            const up = parsed ? engine.getUpgradeDef(parsed.scopeKey, parsed.upgradeKey) : null;
            const upgradeName = (up && (up.name || up.label)) || jobKey;
            const buildingName = parsed ? resortData.getScopeDisplayName(parsed.scopeKey) : "";
            let name = buildingName ? `${upgradeName} in ${buildingName}` : upgradeName;
            if (job.paused) {
                name += " (paused)";
            }
            lines.push(name);
        }
        if (!lines.length) {
            return "";
        }
        const numbered = [];
        for (let n = 0; n < lines.length; n++) {
            numbered.push(`${n + 1}. ${lines[n]}`);
        }
        return "Fox Den Queue<br>" + numbered.join("<br>");
    },
    showFoxDenQueueTip: function() {
        const tip = viewData.cached.foxDenQueueTip || document.getElementById("foxDenQueueTip");
        if (!tip) {
            return;
        }
        const html = view.getFoxDenQueueTipHtml();
        if (!html) {
            tip.style.display = "none";
            return;
        }
        if (tip._foxDenTipHtml !== html) {
            tip._foxDenTipHtml = html;
            tip.innerHTML = html;
        }
        tip.style.display = "block";
    },
    positionFoxDenQueueTip: function(e) {
        const map = viewData.cached.baseResortMap || document.getElementById("baseResortMap");
        const tip = viewData.cached.foxDenQueueTip || document.getElementById("foxDenQueueTip");
        if (!map || !tip || tip.style.display === "none" || !e) {
            return;
        }
        const rect = map.getBoundingClientRect();
        let left = e.clientX - rect.left + 12;
        const top = e.clientY - rect.top + 12;
        const maxLeft = Math.max(4, rect.width - tip.offsetWidth - 4);
        if (left < 4) {
            left = 4;
        } else if (left > maxLeft) {
            left = maxLeft;
        }
        tip.style.left = `${left}px`;
        tip.style.top = `${Math.max(4, top)}px`;
    },
    refreshFoxDenQueueTip: function() {
        const tip = viewData.cached.foxDenQueueTip || document.getElementById("foxDenQueueTip");
        if (!tip || tip.style.display === "none") {
            return;
        }
        view.showFoxDenQueueTip();
    },
    positionResortMapMouseTip: function(tip, e) {
        const map = viewData.cached.baseResortMap || document.getElementById("baseResortMap");
        if (!map || !tip || !e) {
            return;
        }
        const rect = map.getBoundingClientRect();
        const mapX = e.clientX - rect.left;
        const mapY = e.clientY - rect.top;
        let pondX = 439;
        const pond = viewData.cached.baseBuilding_pond || document.getElementById("baseBuilding_pond");
        if (pond) {
            const pondRect = pond.getBoundingClientRect();
            if (pondRect.width > 0) {
                pondX = pondRect.left - rect.left;
            }
        }
        let left = mapX + 12;
        if (mapX > pondX) {
            left = mapX - tip.offsetWidth - 12;
        }
        const maxLeft = Math.max(4, rect.width - tip.offsetWidth - 4);
        if (left < 4) {
            left = 4;
        } else if (left > maxLeft) {
            left = maxLeft;
        }
        tip.style.left = `${left}px`;
        let top = mapY + 12;
        const tipH = tip.offsetHeight || 0;
        if (top + tipH > rect.height - 4) {
            top = mapY - tipH - 12;
        }
        const maxTop = Math.max(4, rect.height - tipH - 4);
        if (top < 4) {
            top = 4;
        } else if (top > maxTop) {
            top = maxTop;
        }
        tip.style.top = `${top}px`;
    },
    bindDirtRoadTipEvents: function(hit) {
        if (!hit || hit._dirtRoadTipBound) {
            return;
        }
        hit._dirtRoadTipBound = true;
        hit.addEventListener("mousemove", function(e) {
            const tip = viewData.cached.dirtRoadMouseTip || document.getElementById("dirtRoadMouseTip");
            const hotspot = hit.parentElement;
            if (!tip || !hotspot) {
                return;
            }
            const html = hotspot._dirtRoadTipHtml || "";
            if (tip._dirtRoadTipHtml !== html) {
                tip._dirtRoadTipHtml = html;
                tip.innerHTML = html;
            }
            tip.style.display = "block";
            view.positionResortMapMouseTip(tip, e);
        });
        hit.addEventListener("mouseleave", function() {
            const tip = viewData.cached.dirtRoadMouseTip || document.getElementById("dirtRoadMouseTip");
            if (tip) {
                tip.style.display = "none";
            }
        });
    },
    getConstructionSiteTipHtml: function(unlockKey) {
        const site = engine.getFoxDenConstructionSite(unlockKey);
        if (!site || site.status !== "building") {
            return "";
        }
        const def = resortData.foxDenUnlockGetDef(unlockKey);
        const name = (def && def.label) || unlockKey;
        const progress = resortData.collectedProgressLabel(site.delivered, site.required);
        const paused = site.paused ? " (paused)" : "";
        return `${name}${paused}<br>${progress}`;
    },
    bindConstructionSlotTip: function(unlockKey) {
        const slot = viewData.cached[`foxDenSlot_${unlockKey}`] || document.getElementById(`foxDenSlot_${unlockKey}`);
        if (!slot || slot._constructionTipBound) {
            return;
        }
        slot._constructionTipBound = true;
        slot._constructionUnlockKey = unlockKey;
        slot.addEventListener("mousemove", function(e) {
            const tip = viewData.cached.constructionMouseTip || document.getElementById("constructionMouseTip");
            if (!tip) {
                return;
            }
            const key = slot._constructionUnlockKey;
            const html = view.getConstructionSiteTipHtml(key);
            if (!html) {
                tip.style.display = "none";
                tip._constructionUnlockKey = null;
                return;
            }
            tip._constructionUnlockKey = key;
            if (tip._constructionTipHtml !== html) {
                tip._constructionTipHtml = html;
                tip.innerHTML = html;
            }
            tip.style.display = "block";
            view.positionResortMapMouseTip(tip, e);
        });
        slot.addEventListener("mouseleave", function() {
            const tip = viewData.cached.constructionMouseTip || document.getElementById("constructionMouseTip");
            if (tip) {
                tip.style.display = "none";
                tip._constructionUnlockKey = null;
            }
        });
    },
    refreshConstructionMouseTip: function() {
        const tip = viewData.cached.constructionMouseTip || document.getElementById("constructionMouseTip");
        if (!tip || tip.style.display === "none" || !tip._constructionUnlockKey) {
            return;
        }
        const html = view.getConstructionSiteTipHtml(tip._constructionUnlockKey);
        if (!html) {
            tip.style.display = "none";
            tip._constructionUnlockKey = null;
            return;
        }
        if (tip._constructionTipHtml !== html) {
            tip._constructionTipHtml = html;
            tip.innerHTML = html;
        }
    },
    updateResortMapProgressBars: function() {
        const base = data.progress.base || {};
        const torii = base.torii || {};
        const laundry = base.laundry || {};
        const inn = base.inn || {};
        const laundryReq = laundry.cleanPowerRequired || 30;
        const toriiBuilt = !!(base.foxDen && base.foxDen.unlocks && base.foxDen.unlocks.torii);
        const toriiGateFull = (torii.visitorsWaiting || 0) >= (torii.maxVisitors || 2);
        const toriiInterval = engine.getToriiVisitorIntervalMs();
        const toriiVisitorPct = toriiBuilt && !toriiGateFull && toriiInterval > 0
            ? Math.max(0, Math.min(100, (1 - (Math.max(0, torii.nextVisitorTimerMs || 0) / toriiInterval)) * 100))
            : 0;
        const laundryProductive = false;
        view.updateVal("mapToriiProgressWrap", toriiBuilt && !toriiGateFull ? "" : "none", "style.display");
        view.updateVal("mapToriiProgressFill", `${toriiVisitorPct}%`, "style.width");
        view.updateVal("mapLaundryProgressWrap", laundryProductive ? "" : "none", "style.display");
        view.updateVal("mapLaundryProgressFill", `${Math.max(0, Math.min(100, ((laundry.workerPower || 0) / laundryReq) * 100))}%`, "style.width");
        view.updateOrbProgressDisplays();
        view.updateShrineProgressDisplays();
        view.updateMarketProgressDisplays();
        view.updateDirtRoadLayer();
        view.updatePathSegmentRoads();
        view.updatePondForestStream();
        view.updateMapBuildingManaBar("inn", "mapInnManaProgressWrap", "mapInnManaProgressFill");
        view.updateMapBuildingManaBar("torii", "mapToriiManaProgressWrap", "mapToriiManaProgressFill");
        view.updateMapWaterBar(engine.isToriiDrinkingBowlUnlocked(), torii.water || 0, engine.getToriiWaterCapacity(), "mapToriiWaterProgressWrap", "mapToriiWaterProgressFill");
        view.updateMapWaterBar(engine.isInnOnsenConverted(), inn.hotWater || 0, engine.getInnHotWaterCapacity(), "mapInnWaterProgressWrap", "mapInnWaterProgressFill");
        const noodleBar = base.noodleBar || {};
        view.updateMapWaterBar(engine.isNoodleBarBuilt(), noodleBar.hotWater || 0, engine.getNoodleBarHotWaterCapacity(), "mapNoodleWaterProgressWrap", "mapNoodleWaterProgressFill");
        view.updateMapWaterBar(engine.isNoodleBarBuilt(), Math.min(100, noodleBar.tipProgress || 0), 100, "mapNoodleTipProgressWrap", "mapNoodleTipProgressFill");
        view.updateMapBuildingManaBar("stonePile", "mapStonePileManaProgressWrap", "mapStonePileManaProgressFill");
        view.updateMapBuildingManaBar("hiddenSpring", "mapHiddenSpringManaProgressWrap", "mapHiddenSpringManaProgressFill");
        view.updateMapBuildingManaBar("bonfire", "mapBonfireManaProgressWrap", "mapBonfireManaProgressFill");
        const manaKeys = engine.getBuildingManaKeys();
        for (let mi = 0; mi < manaKeys.length; mi++) {
            view.updateBuildingManaRow(manaKeys[mi]);
        }
        view.updateBuildingManaRow("hiddenSpring");
        view.updateCollectStoneButton();
    },
    updateBasePanelMarket: function(t) {
        const market = data.progress.base.market;
        if (!market) {
            return;
        }
        const setChk = function(id, on) {
            const el = viewData.cached[id] || document.getElementById(id);
            if (el) {
                el.checked = !!on;
            }
        };
        view.updateVal("marketCreditText", intToStringRound(market.credit || 0));
        view.updateMarketProgressDisplays();
        setChk("marketAllowStone_chk", market.allowStone);
        setChk("marketAllowWood_chk", market.allowWood);
        setChk("marketAllowHardwood_chk", market.allowHardwood);
        setChk("marketAllowBars_chk", market.allowBars);
        view.updateVal("marketAllowHardwood_wrap", engine.isGrowHardwoodBought() ? "" : "none", "style.display");
        const haulOrder = resortData.marketHaulResourceOrder || [];
        const keepOn = !!(data.progress.base.garden && data.progress.base.garden.arrangementOfResourceProtectionUnlocked);
        for (let hi = 0; hi < haulOrder.length; hi++) {
            const haulKey = haulOrder[hi];
            view.updateVal("marketHaulCredit_" + haulKey, engine.getMarketCreditPerUnit(haulKey), "textContent", "floor");
            view.updateVal("marketHaulKeep_" + haulKey + "_wrap", keepOn ? "" : "none", "style.display");
            const keepEl = document.getElementById("marketHaulKeep_" + haulKey);
            if (keepOn && keepEl && document.activeElement !== keepEl) {
                keepEl.value = engine.getShrineHaulKeep(haulKey);
            }
        }
        const garden = data.progress.base.garden || {};
        const repeatUnlocked = !!garden.arrangementOfPaperMoneyUnlocked;
        view.updateVal("marketRepeatExchange_row", repeatUnlocked ? "" : "none", "style.display");
        if (repeatUnlocked) {
            setChk("marketRepeatExchange_chk", market.repeatExchangeWhenReady);
        }
        view.updateMarketExchangeButton();
        this.updateResortWorkerControls("market", engine.getMarketCarrierCapacity() > 0);
        t.refreshOrderedPurchasables("market", resortData.buildings.market.upgradesOrder, { hideMaxed: t.hideMaxed });

        const traders = engine.getMarketTraderCount();
        view.updateVal("base_market_traders_workers_label", `Traders: ${traders}`);
        const canAssign = engine.getAvailableWorkers() > 0;
        const incSuffixes = resortData.workerAdjustIncrBtnSuffixes || [];
        const decSuffixes = resortData.workerAdjustDecrBtnSuffixes || [];
        for (let i = 0; i < incSuffixes.length; i++) {
            view.updateVal(`base_market_traders_${incSuffixes[i]}_btn`, !canAssign, "disabled");
        }
        for (let i = 0; i < decSuffixes.length; i++) {
            view.updateVal(`base_market_traders_${decSuffixes[i]}_btn`, traders <= 0, "disabled");
        }
        view.updateVal("marketTradeStatus_row", engine.getMarketTradeStatusText(), "innerHTML");
        view.updateVal("marketDemandTax_row", engine.getMarketDemandTaxText(), "innerHTML");

        const thresholdsUnlocked = !!garden.arrangementOfTraderResponsibilityUnlocked;
        const active = market.activeTrade;
        const pausedTrades = (typeof engine.ensureMarketPausedTrades === "function")
            ? engine.ensureMarketPausedTrades()
            : (market.pausedTrades || {});
        const order = resortData.marketTradesOrder || [];
        for (let ti = 0; ti < order.length; ti++) {
            const tk = order[ti];
            const td = resortData.marketTrades[tk];
            if (!td) {
                continue;
            }
            const built = !td.requiresBuilding || !!(data.progress.base.foxDen && data.progress.base.foxDen.unlocks && data.progress.base.foxDen.unlocks[td.requiresBuilding]);
            view.updateVal(`marketTrade_${tk}_row`, built ? "" : "none", "style.display");
            if (!built) {
                continue;
            }
            const requiredLevel = td.minMarketLevel || 0;
            const levelOk = engine.getMarketLevel() >= requiredLevel;
            const rowNode = viewData.cached[`marketTrade_${tk}_row`];
            if (rowNode) {
                rowNode.classList.toggle("market-trade-locked", !levelOk);
            }
            setChk(`marketTrade_${tk}_chk`, levelOk && market.tradeEnabled[tk]);
            view.updateVal(`marketTrade_${tk}_chk`, !levelOk, "disabled");
            view.updateVal(`marketTrade_${tk}_stock`, `${intToStringRound(market[tk] || 0)} ${td.name.toLowerCase()}`);
            const paused = pausedTrades && pausedTrades[tk];
            if (!levelOk) {
                view.updateVal(`marketTrade_${tk}_extra`, `Unlocks at Market level ${requiredLevel}`);
            } else {
                const baseCredit = td.creditCost || 0;
                const taxedCredit = engine.getMarketTradeCreditCost ? engine.getMarketTradeCreditCost(tk) : baseCredit;
                const costHtml = taxedCredit !== baseCredit
                    ? `${intToStringRound(baseCredit)} → ${resortData.formatCostAmountHtml(taxedCredit, "credit", "Credit")}`
                    : resortData.formatCostAmountHtml(baseCredit, "credit", "Credit");
                const baseSec = engine.getMarketTradeBaseSeconds
                    ? engine.getMarketTradeBaseSeconds(tk)
                    : (td.seconds || 0);
                const baseSecStr = roundNearestDecimals(baseSec, 2);
                let extra = `Cost: [${costHtml}] &middot; ${baseSecStr}s base`;
                if (traders > 0) {
                    extra += ` (${round1(engine.getMarketTradeDurationMs(tk) / 1000)}s with ${traders})`;
                }
                if (paused) {
                    extra += " &middot; paused, credit already paid";
                }
                view.updateVal(`marketTrade_${tk}_extra`, extra, "innerHTML");
            }
            view.updateVal(`marketTrade_${tk}_threshold_row`, thresholdsUnlocked && levelOk ? "" : "none", "style.display");
            if (thresholdsUnlocked) {
                const thrEl = viewData.cached[`marketTrade_${tk}_threshold`] || document.getElementById(`marketTrade_${tk}_threshold`);
                if (thrEl && document.activeElement !== thrEl) {
                    thrEl.value = (market.tradeThresholds && market.tradeThresholds[tk]) || 0;
                }
            }
            const progTrade = (active && active.key === tk) ? active : paused;
            const showProg = !!(progTrade && progTrade.totalMs > 0);
            view.updateVal(`marketTrade_${tk}_prog_wrap`, showProg ? "" : "none", "style.display");
            if (showProg) {
                const pct = Math.max(0, Math.min(100, (1 - (progTrade.remainMs / progTrade.totalMs)) * 100));
                view.updateVal(`marketTrade_${tk}_prog_fill`, `${pct}%`, "style.width");
            }
        }
        if (typeof createView !== "undefined" && createView.refreshInfoButtonPanel) {
            createView.refreshInfoButtonPanel("resortInfo_market");
        }
    },
    updateBasePanelNoodleBar: function(t) {
        const bar = data.progress.base.noodleBar;
        const market = data.progress.base.market;
        if (!bar) {
            return;
        }
        view.updateVal("noodleBarNoodlesText", intToStringRound((market && market.driedNoodles) || 0));
        const noodleCap = engine.getNoodleBarHotWaterCapacity();
        const noodleWater = bar.hotWater || 0;
        view.updateVal("noodleBarHotWaterText", `Hot Water: ${round1Fixed(noodleWater)}/${noodleCap}`);
        view.updateVal("noodleBarHotWaterFill", noodleCap > 0 ? `${Math.max(0, Math.min(100, (noodleWater / noodleCap) * 100))}%` : "0%", "style.width");
        view.syncAllowCarriersWaterCheckbox("noodleBar", engine.isNoodleBarBuilt());
        view.updateVal("noodleBarGuestsEatingText", engine.countGuestsEatingNoodles(), "textContent", "floor");
        const shown = Math.min(100, Math.max(0, bar.tipProgress || 0));
        view.updateVal("noodleTipProgressText", round1Fixed(shown));
        view.updateVal("noodleTipProgressFill", `${shown}%`, "style.width");
        view.updateVal("noodleTipLast_row", bar.lastTipText || "");
        view.updateVal("noodleTipLast_row", bar.lastTipText ? "" : "none", "style.display");

        const pool = engine.getNoodleTipSkillPool();
        const topicsReady = pool.length >= 5;
        view.updateVal("noodleTipLocked_row", topicsReady ? "none" : "", "style.display");
        view.updateVal("noodleTipControls", topicsReady ? "" : "none", "style.display");
        if (topicsReady) {
            const remain = bar.topicCooldownRemainMs || 0;
            const cooling = remain > 0;
            const btn = viewData.cached.noodleTopicBtn;
            if (btn) {
                btn.classList.toggle("upgrade-btn-weaving", cooling);
                if (cooling) {
                    const pct = Math.max(0, Math.min(100, (1 - remain / 3600000) * 100));
                    btn.style.setProperty("--weave-pct", `${pct}%`);
                } else {
                    btn.style.removeProperty("--weave-pct");
                }
            }
            const cost = engine.getNoodleTopicCost();
            const affordable = (data.progress.coins || 0) >= cost;
            const shownCost = cost >= 10000 ? intToStringRound(cost) : cost;
            const costHtml = `${resortData.resourceIconHtml("coins")} <span class="cost-amt ${affordable ? "cost-amt-affordable" : "cost-amt-unaffordable"}">${shownCost}</span> coins`;
            if (cooling) {
                view.updateVal("noodleTopicBtn", `Discussing... ready again in ${secondsToTime(remain / 1000)} for ${costHtml}`, "innerHTML");
            } else {
                view.updateVal("noodleTopicBtn", `Change Conversation Topics for ${costHtml}`, "innerHTML");
            }
            view.updateVal("noodleTopicBtn", cooling, "disabled");

            const offered = bar.offeredSkillKeys || [];
            view.updateVal("noodleTipSelectHint", offered.length ? "" : "none", "style.display");
            for (let i = 0; i < 5; i++) {
                const key = offered[i];
                view.updateVal(`noodleTipSkill_${i}`, key ? "" : "none", "style.display");
                if (!key) {
                    continue;
                }
                const skill = data.progress.skills && data.progress.skills[key];
                view.updateVal(`noodleTipSkill_${i}_name`, engine.getNoodleSkillDisplayName(key));
                view.updateVal(`noodleTipSkill_${i}_desc`, skills.wrapBuffNamesInHtml(skills.getSkillShortDescription(key)), "innerHTML");
                view.updateVal(`noodleTipSkill_${i}_tips`, `Talent: ${(skill && skill.talentLevel) || 0} | Tips: ${(skill && skill.tips) || 0}`);
                const radio = viewData.cached[`noodleTipSkill_${i}_radio`];
                if (radio) {
                    radio.value = key;
                    radio.disabled = false;
                    radio.checked = bar.selectedTipSkillKey === key;
                }
            }
        }
        t.refreshOrderedPurchasables("noodleBar", resortData.buildings.noodleBar.upgradesOrder, { hideMaxed: t.hideMaxed });
        if (typeof createView !== "undefined" && createView.refreshInfoButtonPanel) {
            createView.refreshInfoButtonPanel("resortInfo_noodleBar");
        }
    },
    updateBasePanelMageTower: function(t) {
        const orb = data.progress.base.mage_tower;
        this.updateResortWorkerControls("mage_tower", engine.getOrbExpGainPerSecond() > 0 || engine.getOkami().assignedBuildingKey === "mage_tower");
        view.updateOrbProgressDisplays();
        t.refreshOrderedPurchasables("mage_tower", resortData.buildings.mage_tower.upgradesOrder, { hideMaxed: t.hideMaxed });
        if (typeof createView !== "undefined" && createView.refreshInfoButtonPanel) {
            createView.refreshInfoButtonPanel("resortInfo_mage_tower");
        }
    },
    updateBambooForestInfo: function() {
        const bf = data.progress.base.bambooForest;
        view.updateVal("bambooForestInfoChips", bf.chips || 0, "textContent", "floor");
        view.updateVal("bambooForestInfoWood", bf.wood || 0, "textContent", "floor");
        view.updateVal("bambooForestInfoTitle", engine.getBambooForestDisplayName());
        const hardwoodOn = engine.isGrowHardwoodBought();
        view.updateVal("bambooForestHardwood_row", hardwoodOn ? "" : "none", "style.display");
        view.updateVal("bambooSwitchRow", hardwoodOn ? "" : "none", "style.display");
        view.updateVal("bambooTypeRow", hardwoodOn ? "" : "none", "style.display");
        if (hardwoodOn) {
            view.updateVal("bambooForestInfoHardwoodChips", bf.hardwoodChips || 0, "textContent", "floor");
            view.updateVal("bambooForestInfoHardwood", bf.hardwood || 0, "textContent", "floor");
        }
        view.updateVal("bambooChopPower", engine.getBambooChopPower());
        const pond = data.progress.base.pond;
        const pondBuilt = typeof engine.isPondBuiltFromFoxDen === "function" && engine.isPondBuiltFromFoxDen();
        view.updateVal("bambooForestWater_row", pondBuilt ? "" : "none", "style.display");
        if (pondBuilt) {
            view.updateVal("bambooForestWaterText", `${round1Fixed(bf.water || 0)}L`);
        }
        const marketBuiltForest = engine.isMarketBuilt();
        view.updateVal("bambooForestFertilizer_row", marketBuiltForest ? "" : "none", "style.display");
        if (marketBuiltForest) {
            view.updateVal("bambooForestFertilizerText", round1Fixed(engine.getMarketGoodAmount("fertilizer")));
        }
        const torii = data.progress.base && data.progress.base.torii;
        view.updateVal("bambooTagline_row", (torii && (torii.plantSpiritsBought || 0) > 0) ? "" : "none", "style.display");
        const stalkCount = bf.stalkCount || 4;
        const rowCount = bf.rowCount || 3;
        const active = bf.activeHarvestStalk;
        const garden = data.progress.base && data.progress.base.garden;
        const rotateUnlocked = !!(garden && garden.arrangementOfRotationUnlocked);
        view.updateVal("bambooAutoRotate_row", rotateUnlocked ? "" : "none", "style.display");
        if (rotateUnlocked) {
            const chk = document.getElementById("bambooAutoRotate_chk");
            if (chk && chk.checked !== !!bf.autoRotateHarvest) {
                chk.checked = !!bf.autoRotateHarvest;
            }
        }
        for (let si = 0; si < stalkCount; si++) {
            const stalk = bf.stalks[si];
            view.updateVal(`bambooCutBtn_${si}`, active === si, "classList.toggle", "bamboo-cut-active");
            view.updateVal(`bambooType_${si}`, stalk && stalk.type === "hardwood" ? "Hardwood" : "Bamboo");
            let statusText;
            if (active === si && engine.getBambooChopPower() > 0) {
                statusText = "Harvesting";
            } else {
                statusText = `Growing ${engine.getBambooStalkGrowthPercent(stalk)}%`;
            }
            view.updateVal(`bambooStatus_${si}`, statusText);
            view.updateVal(`bambooBaseWood_${si}`, round2(engine.getBambooStalkDisplayBaseWood(si)));
            for (let ri = 0; ri < rowCount; ri++) {
                const cell = stalk.cells[ri];
                const cap = cell.capacity || 1;
                const lumber = cell.lumber || 0;
                const fillPct = Math.max(0, Math.min(100, (lumber / cap) * 100));
                const fillId = `bambooCellFill_${si}_${ri}`;
                const labelId = `bambooCellLabel_${si}_${ri}`;
                view.updateVal(labelId, `${Math.floor(lumber)}/${cap}`);
                view.updateVal(fillId, cell.color || "#4a9a4a", "style.backgroundColor");
                view.updateVal(fillId, `${fillPct}%`, "style.height");
            }
        }
        if (typeof createView !== "undefined" && createView.refreshInfoButtonPanel) {
            createView.refreshInfoButtonPanel("resortInfo_bambooForest");
        }
    },
    updateSpiritSlotAppearance: function(slotId, spirit, selectedSpiritId) {
        const emptyBg = "rgba(8, 12, 18, 0.35)";
        const el = viewData.cached[slotId];
        const isSelected = !!(spirit && spirit.id === selectedSpiritId);
        if (el) {
            el.classList.toggle("spirit-slot-selected", isSelected);
        }
        const range = el && el.querySelector(".fire-launcher-range");
        if (range) {
            let labelEl = el.querySelector(".spirit-slot-level");
            if (!labelEl) {
                labelEl = document.createElement("span");
                labelEl.className = "spirit-slot-level";
                el.insertBefore(labelEl, el.firstChild);
            }
            const label = spirit ? String(spirit.level || 1) : "";
            if (labelEl.textContent !== label) {
                labelEl.textContent = label;
            }
        } else {
            view.updateVal(slotId, spirit ? String(spirit.level || 1) : "", "textContent");
        }
        view.updateVal(slotId, spirit ? engine.getSpiritColor(spirit) : emptyBg, "style.backgroundColor");
        view.updateVal(slotId, !!spirit, "classList.toggle", "spirit-slot-filled");
    },
    updateResortMapTokens: function() {
        const base = data.progress.base || {};
        const selectedSpiritId = data.progress.selectedSpiritId;
        const springSlotMax = engine.getHiddenSpringSpiritSlotMax();
        const trainingSpirit = engine.getSpiritAtLocation("spiritTraining", 0);
        view.updateSpiritSlotAppearance("spiritSlot_spiritTraining_any_0", trainingSpirit, selectedSpiritId);
        for (let ki = 0; ki < 2; ki++) {
            const kind = ki === 0 ? "earth" : "water";
            for (let si = 0; si < springSlotMax; si++) {
                const slotId = `spiritSlot_hiddenSpring_${kind}_${si}`;
                const spirit = engine.getSpiritAtLocation("hiddenSpring", si, kind);
                view.updateSpiritSlotAppearance(slotId, spirit, selectedSpiritId);
            }
        }
        for (let mi = 0; mi < 3; mi++) {
            const slotId = `spiritSlot_mine_earth_${mi}`;
            const spirit = engine.getSpiritAtLocation("mine", mi, "earth");
            view.updateSpiritSlotAppearance(slotId, spirit, selectedSpiritId);
        }
        const torii = base.torii || {};
        const plantSlotsVisible = (torii.plantSpiritsBought || 0) > 0;
        view.updateVal("spiritSlots_bambooForest_plant", plantSlotsVisible ? "" : "none", "style.display");
        for (let psi = 0; psi < resortData.bambooForestConfig.stalkCount; psi++) {
            const slotId = `spiritSlot_bambooForest_plant_${psi}`;
            const pSpirit = engine.getSpiritAtLocation("bambooForest", psi, "plant");
            view.updateSpiritSlotAppearance(slotId, pSpirit, selectedSpiritId);
        }
        const pondBuilt = engine.isPondBuiltFromFoxDen();
        view.updateVal("spiritSlots_pond_water", pondBuilt ? "" : "none", "style.display");
        for (let pwi = 0; pwi < engine.getPondWaterSpiritSlotMax(); pwi++) {
            const pondSlotId = `spiritSlot_pond_water_${pwi}`;
            const wSpirit = engine.getSpiritAtLocation("pond", pwi, "water");
            view.updateSpiritSlotAppearance(pondSlotId, wSpirit, selectedSpiritId);
        }
        const hs = base.hiddenSpring || {};
        const fireSlotsVisible = (hs.fireSpiritsBought || 0) > 0;
        view.updateVal("spiritSlots_bonfire_fire", fireSlotsVisible ? "" : "none", "style.display");
        for (let bfi = 0; bfi < engine.getBonfireFireSpiritSlotMax(); bfi++) {
            const bonfireSlotId = `spiritSlot_bonfire_fire_${bfi}`;
            const fSpirit = engine.getSpiritAtLocation("bonfire", bfi, "fire");
            view.updateSpiritSlotAppearance(bonfireSlotId, fSpirit, selectedSpiritId);
        }
        const forgeBuilt = engine.isAtelierForgeBuilt();
        view.updateVal("spiritSlots_atelier_fire", forgeBuilt ? "" : "none", "style.display");
        for (let afi = 0; afi < engine.getAtelierFireSpiritSlotMax(); afi++) {
            const atelierSlotId = `spiritSlot_atelier_fire_${afi}`;
            const aSpirit = engine.getSpiritAtLocation("atelier", afi, "fire");
            view.updateSpiritSlotAppearance(atelierSlotId, aSpirit, selectedSpiritId);
        }
        const pebbles = base.pebbles || [];
        const pebbleSlots = view.syncPathTokenPool(
            pebbles, viewData.pebbleTokenById, viewData.pebbleTokenFreeSlots, "pebbleIdCounter"
        );
        for (let pi = 0; pi < 12; pi++) {
            const pebble = pebbleSlots[pi];
            const pid = `pebbleToken_${pi}`;
            const pAmtId = `pebbleTokenAmt_${pi}`;
            view.updateVal(pid, pebble ? "" : "none", "style.display");
            view.updateVal(pAmtId, pebble ? "" : "none", "style.display");
            if (pebble) {
                view.updateVal(pid, engine.earthSpiritColors[pebble.colorIndex || 0], "style.backgroundColor");
                view.updateVal(pid, engine.earthSpiritColors[pebble.colorIndex || 0], "style.borderColor");
                view.updateVal(pAmtId, engine.formatPebblePayloadLabel(pebble), "textContent");
            }
        }
        const droplets = base.droplets || [];
        const dropletSlots = view.syncPathTokenPool(
            droplets, viewData.dropletTokenById, viewData.dropletTokenFreeSlots, "dropletIdCounter"
        );
        for (let di = 0; di < 12; di++) {
            const droplet = dropletSlots[di];
            const did = `dropletToken_${di}`;
            const dAmtBelow = `dropletTokenAmtBelow_${di}`;
            const dAmtTop = `dropletTokenAmtTop_${di}`;
            view.updateVal(did, droplet ? "" : "none", "style.display");
            view.updateVal(dAmtBelow, droplet ? "" : "none", "style.display");
            view.updateVal(dAmtTop, droplet ? "" : "none", "style.display");
            if (droplet) {
                const innerId = `dropletTokenInner_${di}`;
                let fill = "#4a9fd4";
                if (droplet.hitFlashAt) {
                    const elapsed = Date.now() - droplet.hitFlashAt;
                    if (elapsed < 2000) {
                        const t = elapsed < 500 ? 0 : (elapsed - 500) / 1500;
                        const r = Math.round(224 + (74 - 224) * t);
                        const g = Math.round(64 + (159 - 64) * t);
                        const b = Math.round(64 + (212 - 64) * t);
                        fill = `rgb(${r},${g},${b})`;
                    }
                }
                view.updateVal(innerId, fill, "style.backgroundColor");
                view.updateVal(dAmtBelow, `${intToStringRound(droplet.waterVolume || 0)}L`, "textContent");
                view.updateVal(dAmtTop, `${round1(droplet.heat || 0)}C`, "textContent");
            }
        }
        view.updateFireLauncherMap();
    },
    updateFireLauncherMap: function() {
        const builtCount = engine.getFireLauncherBuiltCount();
        const defs = engine.getFireLauncherPlatformDefs();
        const selectedSpiritId = data.progress.selectedSpiritId;
        const selectedLauncherKey = data.progress.selectedFireLauncherKey;
        const fl = data.progress.base.fireLaunchers;
        for (let i = 0; i < defs.length; i++) {
            const def = defs[i];
            const lk = def.key;
            const built = i < builtCount;
            const wrapId = `fireLauncher_${lk}_wrap`;
            const rangeId = `fireLauncher_${lk}_range`;
            const emberFillId = `fireLauncher_${lk}_emberFill`;
            const slotId = `spiritSlot_fireLauncher_${lk}_0`;
            view.updateVal(wrapId, built ? "" : "none", "style.display");
            if (!built) {
                continue;
            }
            const spirit = engine.getFireLauncherAssignedSpirit(lk);
            view.updateSpiritSlotAppearance(slotId, spirit, selectedSpiritId);
            const state = engine.getFireLauncherPlatformState(lk);
            const embers = state ? (state.embers || 0) : 0;
            const maxEmbers = engine.getFireLauncherMaxEmbers(lk);
            const emberPct = Math.max(0, Math.min(100, (embers / maxEmbers) * 100));
            view.updateVal(emberFillId, `${emberPct}%`, "style.width");
            const rangePx = Math.round(engine.getFireLauncherRangePx(lk));
            const diam = rangePx * 2;
            view.updateVal(rangeId, `${diam}px`, "style.width");
            view.updateVal(rangeId, `${diam}px`, "style.height");
            const wrapEl = viewData.cached[wrapId];
            if (wrapEl) {
                wrapEl.classList.toggle("fire-launcher-range-visible", selectedLauncherKey === lk);
            }
        }
        const pulses = (fl && fl.aoePulses) || [];
        for (let ai = 0; ai < 8; ai++) {
            const aid = `fireLauncherAoe_${ai}`;
            const pulse = ai < pulses.length ? pulses[ai] : null;
            view.updateVal(aid, pulse ? "" : "none", "style.display");
            if (!pulse) {
                viewData.fireLauncherAoeLastId[ai] = null;
                continue;
            }
            const diam = Math.round(pulse.rangePx || 0) * 2;
            const pulseCenter = engine.getFireLauncherSlotCenter(pulse.platformKey);
            view.setGpuPosById(aid, pulseCenter.x, pulseCenter.y, false);
            view.updateVal(aid, `${diam}px`, "style.width");
            view.updateVal(aid, `${diam}px`, "style.height");
            const el = viewData.cached[aid];
            if (el && viewData.fireLauncherAoeLastId[ai] !== pulse.id) {
                el.style.animation = "none";
                requestAnimationFrame(function() {
                    if (viewData.fireLauncherAoeLastId[ai] === pulse.id) {
                        el.style.animation = "";
                    }
                });
                viewData.fireLauncherAoeLastId[ai] = pulse.id;
            }
        }
    },
    updateFireLauncherInfo: function(platformKey) {
        const key = platformKey || data.progress.selectedFireLauncherKey;
        if (!key || !engine.isFireLauncherPlatformBuilt(key)) {
            return;
        }
        const def = engine.getFireLauncherPlatformDef(key);
        const state = engine.getFireLauncherPlatformState(key);
        const spirit = engine.getFireLauncherAssignedSpirit(key);
        if (!def) {
            return;
        }
        const attackLabel = def.attackType === "aoe" ? "Burst (AOE)" : "Projectile";
        const intervalSec = engine.getFireLauncherIntervalMs(key) / 1000;
        const intervalStr = intervalSec >= 1 ? intervalSec.toFixed(1) : intervalSec.toFixed(2);
        const rangePx = Math.round(engine.getFireLauncherRangePx(key));
        const heatPerStrike = engine.getFireLauncherHeatPerStrike(key);
        const rangeBonusPct = engine.getFireLauncherRangeBonusPct(key);
        const heatBonusPct = engine.getFireLauncherHeatBonusPct(key);
        const speedBonusPct = engine.getFireLauncherAttackSpeedBonusPct(key);
        view.updateVal("fireLauncherInfoTitle", def.name);
        view.updateVal("fireLauncherInfoType", attackLabel);
        view.updateVal("fireLauncherInfoEmbers", round1Fixed(state ? state.embers || 0 : 0));
        view.updateVal("fireLauncherInfoEmbersCap", engine.getFireLauncherMaxEmbers(key));
        view.updateVal("fireLauncherInfoEmbersRequire", spirit ? "none" : "", "style.display");
        view.updateVal("fireLauncherInfoRange", rangePx);
        view.updateVal("fireLauncherInfoRangeBonus", rangeBonusPct > 0 ? ` (+${rangeBonusPct}%)` : "");
        view.updateVal("fireLauncherInfoInterval", intervalStr);
        view.updateVal("fireLauncherInfoIntervalBonus", speedBonusPct > 0 ? ` (+${speedBonusPct}% speed)` : "");
        view.updateVal("fireLauncherInfoEmberCost", def.emberCost);
        const heatText = def.attackType === "aoe"
            ? `${round2(heatPerStrike)}C (all in range)`
            : `${round2(heatPerStrike)}C`;
        view.updateVal("fireLauncherInfoHeat", heatText);
        view.updateVal("fireLauncherInfoHeatBonus", heatBonusPct > 0 ? ` (+${heatBonusPct}%)` : "");
        view.updateVal("fireLauncherInfoExp", round2(engine.getFireLauncherExpPerDroplet(key)));
        view.updateVal("fireLauncherInfoExpPerSec", round2(engine.getFireLauncherExpPerSec(key)));
        view.updateVal("fireLauncherInfoSpirit", spirit
            ? `${engine.getSpiritDisplayName(spirit)} (Lv ${spirit.level || 1})`
            : "Unassigned");
        const showPriority = def.attackType !== "aoe" && engine.isArrangementOfTargetPriorityUnlocked();
        view.updateVal("fireLauncherTargetPriority_row", showPriority ? "" : "none", "style.display");
        if (showPriority) {
            const showHeat = engine.isArrangementOfHeatTargetingUnlocked();
            view.updateVal("fireLauncherTarget_coldest_label", showHeat ? "" : "none", "style.display");
            view.updateVal("fireLauncherTarget_hottest_label", showHeat ? "" : "none", "style.display");
            const mode = engine.getFireLauncherTargetMode(state);
            const radioIds = ["default", "closest", "furthest", "coldest", "hottest"];
            for (let ri = 0; ri < radioIds.length; ri++) {
                const rid = `fireLauncherTarget_${radioIds[ri]}`;
                const radioEl = viewData.cached[rid] || document.getElementById(rid);
                if (radioEl) {
                    radioEl.checked = mode === radioIds[ri];
                }
            }
        }
        const t = view._basePanelPurchasingTools(data.progress.base, null, data.progress.options.hideMaxedUpgrades);
        const launcherScopes = ["fireLauncher_pathMid", "fireLauncher_pathLower", "fireLauncher_bendTop"];
        for (let si = 0; si < launcherScopes.length; si++) {
            const scopeKey = launcherScopes[si];
            const bcfg = resortData.buildings[scopeKey];
            if (!bcfg || !bcfg.upgradesOrder) {
                continue;
            }
            t.refreshOrderedPurchasables(scopeKey, bcfg.upgradesOrder, { hideMaxed: t.hideMaxed });
            const platformKey = engine.parseFireLauncherScopeKey(scopeKey);
            view.updateVal(`fireLauncherUpgrades_${platformKey}`, platformKey === key ? "" : "none", "style.display");
        }
    },
    updateGuestLog: function() {
        const inn = data.progress.base && data.progress.base.inn;
        const entries = (inn && inn.guestLog) || [];
        if (!viewData.guestLogSnapshots.length) {
            for (let gli = 0; gli < 5; gli++) {
                viewData.guestLogSnapshots[gli] = {
                    row: viewData.cached[`guestLogRow_${gli}`],
                    text: viewData.cached[`guestLogRow_${gli}_text`],
                    snap: null
                };
            }
        }
        for (let gli = 0; gli < 5; gli++) {
            const rowRef = viewData.guestLogSnapshots[gli];
            if (!rowRef || !rowRef.row) {
                continue;
            }
            const entry = entries[gli];
            if (!entry) {
                if (rowRef.row.style.display !== "none") {
                    rowRef.row.style.display = "none";
                }
                rowRef.snap = null;
                continue;
            }
            if (rowRef.row.style.display === "none") {
                rowRef.row.style.display = "";
            }
            const guestType = entry.type || "wanderer";
            let nextSnap = entry.isRepeat
                ? `A ${guestType} at Room ${entry.room}`
                : `A ${guestType} stayed at Room ${entry.room} and left after ${entry.staySeconds} seconds, giving ${entry.starBeads} star beads for resting well.`;
            if (entry.extraText) {
                nextSnap += entry.extraText;
            }
            if (rowRef.snap !== nextSnap) {
                if (rowRef.text) {
                    rowRef.text.innerHTML = resortData.insertResourceIcons(nextSnap);
                }
                rowRef.snap = nextSnap;
            }
        }
    },
    updateGuestItineraryPanel: function() {
        const innBuilt = engine.isInnBuiltFromFoxDen();
        view.updateVal("guestItinerarySection", innBuilt ? "" : "none", "style.display");
        if (!innBuilt) {
            return;
        }
        const lines = engine.getGuestItineraryPanelLines();
        for (let li = 0; li < 5; li++) {
            if (li >= lines.length) {
                view.updateVal(`guestItineraryLine_${li}`, "none", "style.display");
                continue;
            }
            view.updateVal(`guestItineraryLine_${li}`, lines[li] || "", "textContent");
            view.updateVal(`guestItineraryLine_${li}`, "", "style.display");
        }
        const range = engine.getExpectedGuestStarBeadsRange();
        view.updateVal("guestStarBeadsMin", round1Fixed(range.min));
        view.updateVal("guestStarBeadsMax", round1Fixed(range.max));
        const cap = engine.getInnRestDurationSeconds();
        const allowed = engine.getInnRestAllowedSeconds();
        const restShown = Math.abs(allowed - Math.round(allowed)) < 1e-6 ? String(Math.round(allowed)) : round1Fixed(allowed);
        view.updateVal("guestRestLabel", `Rest for ${restShown}s`);
        const dial = viewData.cached.guestRestDial || document.getElementById("guestRestDial");
        if (dial) {
            const dialMax = Math.max(5, cap);
            dial.min = "5";
            dial.max = String(dialMax);
            if (document.activeElement !== dial) {
                dial.value = String(Math.max(5, Math.min(dialMax, allowed)));
            }
        }
    },
    updateGuestsList: function() {
        const guests = (data.progress.base && data.progress.base.inn && data.progress.base.inn.guests) || [];
        const phrases = [
            "They have rested",
            "They have confronted",
            "They have found peace with",
            "They have let go of"
        ];
        const endings = [
            "of their cares away",
            "of their fears",
            "of their mistakes",
            "of their regrets"
        ];
        const guestRowByGuestId = viewData.guestRowByGuestId;
        const guestRowFreeSlots = viewData.guestRowFreeSlots;
        if (!viewData.guestRowSnapshots.length) {
            for (let gi = 0; gi < 10; gi++) {
                viewData.guestRowSnapshots[gi] = {
                    row: viewData.cached[`guestRow_${gi}`],
                    type: viewData.cached[`guestRow_${gi}_type`],
                    state: viewData.cached[`guestRow_${gi}_state`],
                    time: viewData.cached[`guestRow_${gi}_time`],
                    restText: viewData.cached[`guestRow_${gi}_rest_text`],
                    restfulness: viewData.cached[`guestRow_${gi}_restfulness`],
                    restEnd: viewData.cached[`guestRow_${gi}_rest_end`],
                    snap: null
                };
                guestRowFreeSlots.push(gi);
            }
        }
        const activeGuestIds = {};
        for (let gi = 0; gi < guests.length; gi++) {
            activeGuestIds[guests[gi].id] = true;
        }
        for (const guestIdKey in guestRowByGuestId) {
            if (!activeGuestIds[guestIdKey]) {
                const slot = guestRowByGuestId[guestIdKey];
                const rowRef = viewData.guestRowSnapshots[slot];
                if (rowRef && rowRef.row && rowRef.row.style.display !== "none") {
                    rowRef.row.style.display = "none";
                }
                if (rowRef) {
                    rowRef.snap = null;
                }
                guestRowFreeSlots.push(slot);
                delete guestRowByGuestId[guestIdKey];
            }
        }
        for (let gi = 0; gi < guests.length; gi++) {
            const guest = guests[gi];
            const guestId = guest.id;
            let slot = guestRowByGuestId[guestId];
            if (slot === undefined) {
                slot = guestRowFreeSlots.length ? guestRowFreeSlots.pop() : undefined;
                if (slot === undefined) {
                    continue;
                }
                guestRowByGuestId[guestId] = slot;
            }
            const rowRef = viewData.guestRowSnapshots[slot];
            if (!rowRef || !rowRef.row) {
                continue;
            }
            if (rowRef.row.style.display === "none") {
                rowRef.row.style.display = "";
            }
            const ix = guest.restTextIndex % phrases.length;
            const nextSnap = {
                type: guest.type,
                state: engine.getGuestItineraryStepLabel(guest.itineraryStep || "settleIn"),
                time: `${Math.ceil(Math.max(0, guest.timeToNext || 0))}s`,
                restText: `${phrases[ix]} `,
                restfulness: round1(guest.restfulness || 0),
                restEnd: endings[ix]
            };
            const prev = rowRef.snap;
            if (!prev || prev.type !== nextSnap.type) {
                if (rowRef.type) {
                    rowRef.type.textContent = nextSnap.type;
                }
            }
            if (!prev || prev.state !== nextSnap.state) {
                if (rowRef.state) {
                    rowRef.state.textContent = nextSnap.state;
                }
            }
            if (!prev || prev.time !== nextSnap.time) {
                if (rowRef.time) {
                    rowRef.time.textContent = nextSnap.time;
                }
            }
            if (!prev || prev.restText !== nextSnap.restText) {
                if (rowRef.restText) {
                    rowRef.restText.textContent = nextSnap.restText;
                }
            }
            if (!prev || prev.restfulness !== nextSnap.restfulness) {
                if (rowRef.restfulness) {
                    rowRef.restfulness.textContent = nextSnap.restfulness;
                }
            }
            if (!prev || prev.restEnd !== nextSnap.restEnd) {
                if (rowRef.restEnd) {
                    rowRef.restEnd.textContent = nextSnap.restEnd;
                }
            }
            rowRef.snap = nextSnap;
        }
        this.updateGuestItineraryPanel();
        this.updateGuestLog();
    },
    syncSpiritNameEditor: function(spirit) {
        const editing = !!(spirit && viewData.spiritNameEdit && viewData.spiritNameEdit.spiritId === spirit.id);
        view.updateVal("spiritInfoTitle", editing ? "none" : "", "style.display");
        view.updateVal("spiritInfoRenameBtn", editing ? "none" : "", "style.display");
        view.updateVal("spiritInfoNameInput", editing ? "" : "none", "style.display");
    },
    updateSpiritInfo: function() {
        const spirit = engine.getSpiritById(data.progress.selectedSpiritId);
        this.updateResortMapTokens();
        if (viewData.spiritNameEdit && (!spirit || viewData.spiritNameEdit.spiritId !== spirit.id)) {
            events.finishSpiritRename();
        }
        if (!spirit) {
            return;
        }
        const kind = spirit.kind || "earth";
        view.updateVal("spiritInfoTitle", engine.getSpiritDisplayName(spirit));
        view.syncSpiritNameEditor(spirit);
        view.updateVal("spiritInfoLevel", spirit.level || 1);
        view.updateVal("spiritInfoPower", round2(spirit.spiritPower || 1));
        const nextPowerInc = engine.getSpiritPowerNextIncrease(spirit.level || 1);
        view.updateVal("spiritInfoPowerNote", kind === "earth" || kind === "water" || kind === "fire" || kind === "plant" ? `(+${nextPowerInc} on lvl)` : "", "textContent");
        const trainingBought = engine.isSpiritTrainingSpotBought();
        const atTraining = engine.isSpiritAtTrainingSpot(spirit);
        view.updateVal("spiritInfoTrainingRow", trainingBought ? "" : "none", "style.display");
        view.updateVal("spiritInfoTraining", round1Fixed(spirit.training || 0));
        if (atTraining) {
            const trainGain = engine.getSpiritTrainingCardEffects().training;
            view.updateVal("spiritInfoTrainingGain", ` (+${round1Fixed(trainGain)})`);
        } else {
            view.updateVal("spiritInfoTrainingGain", "");
        }
        view.updateVal("spiritInfoExp", round2(spirit.exp || 0));
        view.updateVal("spiritInfoExpReq", round2(spirit.expToLevel || 15));
        const expBonusPct = Math.round((engine.getTeachFromExperienceExpMult(spirit) - 1) * 100);
        view.updateVal("spiritInfoExpBonus", expBonusPct > 0 ? `(+${expBonusPct}%)` : "");
        view.updateVal("spiritInfoEarthExtras", kind === "earth" ? "" : "none", "style.display");
        view.updateVal("spiritInfoWaterExtras", kind === "water" ? "" : "none", "style.display");
        view.updateVal("spiritInfoFireExtras", kind === "fire" ? "" : "none", "style.display");
        view.updateVal("spiritInfoFireLauncherExtras", "none", "style.display");
        view.updateVal("spiritInfoPlantExtras", kind === "plant" ? "" : "none", "style.display");
        view.updateVal("spiritInfoTaskWrap", (kind === "plant") ? "none" : "", "style.display");
        if (kind === "earth") {
            const pebbleMax = engine.getEarthSpiritPebbleMax();
            view.updateVal("spiritInfoPebbles", engine.countPebblesForSpirit(spirit.id));
            view.updateVal("spiritInfoPebblesMax", pebbleMax);
            view.updateVal("spiritInfoPebbleCarry", engine.formatEarthSpiritPebbleCarry(spirit));
            const atHiddenSpring = (spirit.location || "hiddenSpring") === "hiddenSpring";
            const priorityUnlocked = engine.isArrangementOfPriorityUnlocked();
            const diggingUnlocked = engine.isArrangementOfDiggingUnlocked();
            view.updateVal("spiritInfoPrioritizeOreRow", priorityUnlocked && atHiddenSpring ? "" : "none", "style.display");
            if (priorityUnlocked && atHiddenSpring) {
                const oreChk = viewData.cached.spiritInfoPrioritizeOre_chk;
                if (oreChk) {
                    oreChk.checked = !!spirit.prioritizeOre;
                }
            }
            view.updateVal("spiritInfoAutoReturnMineRow", diggingUnlocked ? "" : "none", "style.display");
            if (diggingUnlocked) {
                const digChk = viewData.cached.spiritInfoAutoReturnMine_chk;
                if (digChk) {
                    digChk.checked = spirit.autoReturnToMine !== false;
                }
            }
            const spiritPebbles = engine.getPebblesForSpirit(spirit.id);
            if (spiritPebbles.length > 0) {
                const etaLines = [];
                for (let pei = 0; pei < spiritPebbles.length; pei++) {
                    const peb = spiritPebbles[pei];
                    const etaSec = engine.estimatePebbleTravelSeconds(peb);
                    const payload = engine.formatPebblePayloadLabel(peb);
                    const label = payload ? `Pebble ${pei + 1} (${payload})` : `Pebble ${pei + 1}`;
                    etaLines.push(`${label} ETA: ${secondsToTime(etaSec)}`);
                }
                view.updateVal("spiritInfoPebbleEtas", etaLines.join("<br>"), "innerHTML");
                view.updateVal("spiritInfoPebbleEtas", "", "style.display");
            } else {
                view.updateVal("spiritInfoPebbleEtas", "none", "style.display");
                view.updateVal("spiritInfoPebbleEtas", "", "innerHTML");
            }
            if (atHiddenSpring) {
                view.updateVal("spiritInfoTaskProgressWrap", "", "style.display");
                const task = engine.getEarthSpiritPebbleTaskInfo(spirit);
                view.updateVal("spiritInfoTaskText", task.text);
                view.updateVal("spiritInfoTaskFill", `${task.pct}%`, "style.width");
            } else if (spirit.location === "mine") {
                view.updateVal("spiritInfoTaskProgressWrap", "none", "style.display");
                view.updateVal("spiritInfoTaskText", engine.isMineCleared() ? "Playing in the Dirt" : "Mining...");
            }
        } else if (kind === "water") {
            view.updateVal("spiritInfoPebbleEtas", "none", "style.display");
            const atHiddenSpringWater = (spirit.location || "hiddenSpring") === "hiddenSpring";
            const spacingUnlocked = engine.isArrangementOfRhythmicDropletsUnlocked();
            view.updateVal("spiritInfoEqualSpacingRow", spacingUnlocked && atHiddenSpringWater ? "" : "none", "style.display");
            if (spacingUnlocked && atHiddenSpringWater) {
                const spacingChk = viewData.cached.spiritInfoEqualSpacing_chk;
                if (spacingChk) {
                    const hsSpacing = data.progress.base.hiddenSpring;
                    spacingChk.checked = !!(hsSpacing && hsSpacing.equalDropletSpacing);
                }
            }
            if (spirit.location === "pond") {
                view.updateVal("spiritInfoWaterVolume", "-");
                view.updateVal("spiritInfoHeat", "-");
                view.updateVal("spiritInfoEssence", "-");
                view.updateVal("spiritInfoDropletEtas", "none", "style.display");
                view.updateVal("spiritInfoDropletEtas", "", "innerHTML");
                view.updateVal("spiritInfoTaskProgressWrap", "none", "style.display");
                const pond = data.progress.base.pond || {};
                const pondWater = pond.waterVolume || 0;
                const expRate = pondWater > 0 ? round2(Math.sqrt(pondWater) / 50) : 0;
                view.updateVal("spiritInfoTaskText", pondWater > 0
                    ? `playing at pond (+${expRate} exp/s)`
                    : "playing at pond (pond is empty)");
            } else {
                view.updateVal("spiritInfoTaskProgressWrap", "", "style.display");
                const waterExpPerSec = round2(engine.getWaterSpiritDropletExpPerSec(spirit));
                const spiritDroplets = engine.getDropletsForSpirit(spirit.id);
                if (spiritDroplets.length > 0) {
                    const droplet = spiritDroplets[0];
                    view.updateVal("spiritInfoWaterVolume", `${round2(droplet.waterVolume || 0)}L`);
                    view.updateVal("spiritInfoHeat", `${round1Fixed(droplet.heat || 0)}C`);
                    view.updateVal("spiritInfoEssence", round2(droplet.essence || 0));
                    view.updateVal("spiritInfoTaskText", `droplet active (+${waterExpPerSec} exp/s)`);
                    view.updateVal("spiritInfoTaskFill", "100%", "style.width");
                    const dEtaLines = [];
                    for (let dei = 0; dei < spiritDroplets.length; dei++) {
                        const drop = spiritDroplets[dei];
                        const dEta = engine.estimateDropletTravelSeconds(drop);
                        const volLabel = `${intToStringRound(drop.waterVolume || 0)}L`;
                        const label = spiritDroplets.length > 1
                            ? `Droplet ${dei + 1} (${volLabel})`
                            : `Droplet (${volLabel})`;
                        dEtaLines.push(`${label} ETA: ${secondsToTime(dEta)}`);
                    }
                    view.updateVal("spiritInfoDropletEtas", dEtaLines.join("<br>"), "innerHTML");
                    view.updateVal("spiritInfoDropletEtas", "", "style.display");
                } else {
                    const formingVol = engine.getWaterDropletVolumeForSpirit(spirit);
                    view.updateVal("spiritInfoWaterVolume", `${round2(formingVol)}L`);
                    view.updateVal("spiritInfoHeat", "-");
                    view.updateVal("spiritInfoEssence", "-");
                    const task = engine.getWaterSpiritDropletTaskInfo(spirit);
                    view.updateVal("spiritInfoTaskText", `${task.text} (+${waterExpPerSec} exp/s)`);
                    view.updateVal("spiritInfoTaskFill", `${task.pct}%`, "style.width");
                    view.updateVal("spiritInfoDropletEtas", "none", "style.display");
                    view.updateVal("spiritInfoDropletEtas", "", "innerHTML");
                }
            }
        } else if (kind === "fire") {
            view.updateVal("spiritInfoTaskProgressWrap", "", "style.display");
            const loc = spirit.location || "bonfire";
            if (engine.isFireSpiritOnLauncher(spirit)) {
                const launcherKey = engine.getFireLauncherKeyForSpirit(spirit);
                const def = engine.getFireLauncherPlatformDef(launcherKey);
                const state = engine.getFireLauncherPlatformState(launcherKey);
                const maxEmbers = engine.getFireLauncherMaxEmbers(launcherKey);
                const embers = state ? (state.embers || 0) : 0;
                const regenRate = (engine.getEffectiveSpiritPower(spirit) || 1)
                    * engine.getFireLauncherEmberRegenMult(launcherKey);
                const launcherExpPerSec = round2(engine.getFireLauncherExpPerSec(launcherKey));
                data.progress.selectedFireLauncherKey = launcherKey;
                view.updateVal("spiritInfoFireLauncherExtras", "", "style.display");
                view.updateVal("spiritInfoFireLauncherName", def ? def.name : "Fire Launcher");
                view.updateVal("spiritInfoFireLauncherEmbers", round1Fixed(embers));
                view.updateVal("spiritInfoFireLauncherEmbersCap", maxEmbers);
                if (def) {
                    const intervalSec = engine.getFireLauncherIntervalMs(launcherKey) / 1000;
                    const intervalStr = intervalSec >= 1 ? intervalSec.toFixed(1) : intervalSec.toFixed(2);
                    const attackLabel = def.attackType === "aoe" ? "burst" : "projectile";
                    const rangePx = Math.round(engine.getFireLauncherRangePx(launcherKey));
                    const heatPerStrike = engine.getFireLauncherHeatPerStrike(launcherKey);
                    view.updateVal("spiritInfoFireLauncherStats",
                        `Range ${rangePx}px · ${intervalStr}s ${attackLabel} · ${def.emberCost} embers · ${round2(heatPerStrike)}C heat`);
                } else {
                    view.updateVal("spiritInfoFireLauncherStats", "");
                }
                view.updateVal("spiritInfoFireNote", def
                    ? `Powering ${def.name} (+${round2(regenRate)} embers/s, +${launcherExpPerSec} exp/s).`
                    : `+${launcherExpPerSec} exp/s`);
                view.updateVal("spiritInfoTaskText", `charging embers (${round1Fixed(embers)}/${maxEmbers}) · +${launcherExpPerSec} exp/s`);
                const pct = Math.max(0, Math.min(100, (embers / maxEmbers) * 100));
                view.updateVal("spiritInfoTaskFill", `${pct}%`, "style.width");
            } else if (loc === "atelier" && engine.isAtelierForgeBuilt()) {
                const batchSize = engine.getForgeSmeltBatch(spirit);
                const forgeExpPerSec = round2(engine.getAtelierForgeExpPerSec(spirit));
                const pct = Math.max(0, Math.min(100, ((spirit.forgeTimerMs || 0) / 60000) * 100));
                view.updateVal("spiritInfoFireNote", `Smelting ${batchSize} ore / 60s, +${forgeExpPerSec} exp/s`);
                view.updateVal("spiritInfoTaskText", `Forging bars (${batchSize} ore / 60s, +${forgeExpPerSec} exp/s)`);
                view.updateVal("spiritInfoTaskFill", `${pct}%`, "style.width");
            } else if (loc === "bonfire") {
                const excessHeat = engine.getBonfireExcessHeatForExp();
                const expRate = excessHeat > 0 ? round2(Math.sqrt(excessHeat / 10) / 10) : 0;
                view.updateVal("spiritInfoFireNote", `+${expRate} exp/s`);
                view.updateVal("spiritInfoTaskText", excessHeat > 0 ? `gaining exp (+${expRate}/s)` : "waiting for heat");
                const pct = excessHeat > 0 ? 100 : 0;
                view.updateVal("spiritInfoTaskFill", `${pct}%`, "style.width");
            } else {
                view.updateVal("spiritInfoFireNote", "");
                view.updateVal("spiritInfoTaskProgressWrap", "none", "style.display");
            }
        } else if (kind === "plant") {
            const col = (spirit.location === "bambooForest") ? ((spirit.slot || 0) + 1) : "-";
            view.updateVal("spiritInfoPlantColumn", col);
            view.updateVal("spiritInfoPlantChipsBonus", `Increases bamboo base chips by +${round2(engine.getEffectiveSpiritPower(spirit) || 1)}`);
        }
        if (atTraining) {
            view.updateVal("spiritInfoTaskWrap", "", "style.display");
            view.updateVal("spiritInfoFireNote", "");
            const trainExpPerSec = round2(engine.getSpiritTrainingExpPerSec());
            const taskEl = viewData.cached.spiritInfoTaskText;
            if (engine.canSpiritTrain(spirit)) {
                view.updateVal("spiritInfoTaskProgressWrap", "", "style.display");
                const ms = spirit.trainingTimerMs || 0;
                const durationMs = Math.max(1, engine.getSpiritTrainingDurationMs());
                const pct = Math.max(0, Math.min(100, (ms / durationMs) * 100));
                view.updateVal("spiritInfoTaskText", `Training (${round1Fixed(ms / 1000)}/${roundNearestDecimals(durationMs / 1000, 2)}s, +${trainExpPerSec} exp/s)`);
                view.updateVal("spiritInfoTaskFill", `${pct}%`, "style.width");
                if (taskEl) {
                    taskEl.classList.remove("muted-text");
                }
            } else {
                view.updateVal("spiritInfoTaskProgressWrap", "none", "style.display");
                view.updateVal("spiritInfoTaskText", `+${trainExpPerSec} exp/s (waiting - need mana and training below spirit power)`);
                if (taskEl) {
                    taskEl.classList.add("muted-text");
                }
            }
        } else {
            const taskEl = viewData.cached.spiritInfoTaskText;
            if (taskEl) {
                taskEl.classList.remove("muted-text");
            }
        }
        if (typeof createView !== "undefined" && createView.refreshInfoButtonPanel) {
            createView.refreshInfoButtonPanel("resortInfo_spirit");
        }
    },
    updateMineInfo: function() {
        const mine = data.progress.base.mine;
        const depth = mine.currentDepth || 0;
        const clears = (mine.clearsByDepth && mine.clearsByDepth[depth]) || 0;
        view.updateVal("mineDepthText", depth);
        view.updateVal("mineDepthClears", clears);
        const readyConsumed = !!(mine.readyConsumedByDepth && mine.readyConsumedByDepth[depth]);
        const showReady = clears >= 10 && !readyConsumed;
        view.updateVal("mineDepthReady", showReady ? "" : "none", "style.display");
        view.updateVal("mineDepthLeftBtn", depth > 0 ? "" : "none", "style.display");
        view.updateVal("mineDepthRightBtn", clears >= 10 ? "" : "none", "style.display");
        const spelunking = engine.isArrangementOfSpelunkingUnlocked();
        view.updateVal("mineAutoDepth_row", spelunking ? "" : "none", "style.display");
        if (spelunking) {
            const depthChk = viewData.cached.mineAutoDepth_chk;
            if (depthChk) {
                depthChk.checked = !!mine.autoIncreaseDepth;
            }
        }
        const cleared = engine.isMineCleared();
        view.updateVal("mineStatusText", cleared ? "Playing in the Dirt" : "Mining...");
        view.updateVal("mineDirtText", mine.resources.dirt, "textContent", 2);
        view.updateVal("mineStoneText", mine.resources.stone, "textContent", 2);
        const oreMined = !!(data.progress.base.hiddenSpring && data.progress.base.hiddenSpring.oreMined);
        view.updateVal("mineOreRow", oreMined ? "" : "none", "style.display");
        if (oreMined) {
            view.updateVal("mineOreText", (mine.resources.ore || 0), "textContent", 2);
        }
        view.updateVal("minePrioritizeOreRow", "none", "style.display");
        view.updateVal("mineAssignedLevelText", engine.getMineSpiritLevelTotal());
        const beamBonus = engine.getMineshaftBeamsBought() * 20;
        const powerText = beamBonus > 0
            ? `${round2(engine.getMineSpiritPower())} (+${beamBonus}%)`
            : `${round2(engine.getMineSpiritPower())}`;
        view.updateVal("mineSpiritPowerText", powerText);
        view.updateVal("mineClearEtaText", engine.getMineClearEtaText());
        view.updateVal("minePlayBlock", cleared ? "" : "none", "style.display");
        view.updateVal("minePlayProgressFill", `${Math.max(0, Math.min(100, ((mine.playTimerMs || 0) / 5000) * 100))}%`, "style.width");
        if (cleared) {
            const playSpirits = engine.getMineSpiritList();
            const dirtSpent = Math.min(mine.resources.dirt || 0, engine.getMinePlayDirtPerCycle());
            const xpEach = playSpirits.length > 0 ? dirtSpent / playSpirits.length : 0;
            const playBonusPct = Math.round((engine.getPlayPitDirtMultiplier() - 1) * 100);
            const playBonusText = playBonusPct > 0 ? ` (+${playBonusPct}%)` : "";
            view.updateVal("minePlayProgressDetail", `${round2(dirtSpent)} dirt every 5s${playBonusText}, ${round2(xpEach)} exp per earth spirit`);
        }
        if (!viewData.mineBlockRenderCache) {
            viewData.mineBlockRenderCache = [];
        }
        const blocks = mine.blocks || [];
        for (let i = 0; i < 25; i++) {
            const block = blocks[i];
            if (!block) {
                continue;
            }
            const pct = block.maxAud > 0 ? Math.max(0, Math.min(100, ((block.aud || 0) / block.maxAud) * 100)) : 0;
            const heightStr = `${pct}%`;
            const className = `mine-block-fill ${block.type}`;
            const prev = viewData.mineBlockRenderCache[i];
            const fillEl = viewData.cached[`mineBlockFill_${i}`];
            if (!fillEl) {
                continue;
            }
            if (!prev || prev.height !== heightStr) {
                fillEl.style.height = heightStr;
            }
            if (!prev || prev.className !== className) {
                fillEl.className = className;
            }
            viewData.mineBlockRenderCache[i] = { height: heightStr, className: className };
        }
        if (typeof createView !== "undefined" && createView.refreshInfoButtonPanel) {
            createView.refreshInfoButtonPanel("resortInfo_mine");
        }
    },
    // includeTip=true: refresh count + tip list (hover / RAF while open).
    // includeTip=false: count + wrap visibility only (1 Hz while tip closed).
    updateBuyableUpgradesOverlay: function(includeTip) {
        if (!data.progress || !data.progress.base) {
            return;
        }
        const garden = data.progress.base.garden;
        const unlocked = !!(garden && garden.arrangementOfShoppingUnlocked);
        view.updateVal("baseBuyableWrap", unlocked ? "" : "none", "style.display");
        if (!unlocked) {
            return;
        }
        const list = engine.listBuyableUpgrades();
        view.updateVal("baseBuyableCount", list.length);
        if (!includeTip) {
            return;
        }
        const tip = viewData.cached.baseBuyableTooltipList || document.getElementById("baseBuyableTooltipList");
        if (!tip) {
            return;
        }
        if (!list.length) {
            tip.innerHTML = `<div class="kitsune-assign-tip-row muted-text">None</div>`;
            return;
        }
        let html = "";
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            html += `<div class="kitsune-assign-tip-row buyable-tip-row"><span class="buyable-tip-building">${item.building}</span><span class="buyable-tip-name">${item.name}</span><span class="buyable-tip-cost">${item.costText}</span></div>`;
        }
        tip.innerHTML = resortData.insertResourceIcons(html);
    },
    updateBasePanel: function() {
        if (typeof events.syncBaseContentNotifications === "function") {
            events.syncBaseContentNotifications();
        }
        const base = data.progress.base;
        const selected = data.progress.selectedBaseBuilding || "";
        if (viewData.spiritNameEdit && selected !== "spirit") {
            events.finishSpiritRename();
        }
        if (typeof events.applyBaseBuildingInfoOverlay === "function") {
            events.applyBaseBuildingInfoOverlay(selected);
        }
        view.updateVal("baseCoinsText", data.progress.coins, "textContent", "floor");
        view.updateVal("baseStarBeadsText", data.progress.starBeads, "textContent", "floor");
        const essenceAmt = (base.cistern && base.cistern.essence) || 0;
        view.updateVal("basePaneTitleEssence", essenceAmt > 0 ? "" : "none", "style.display");
        if (essenceAmt > 0) {
            view.updateVal("baseEssenceText", round2(essenceAmt));
        }
                view.updateVal("baseWorkersAssigned", engine.getAvailableWorkers(), "textContent", 1);
        view.updateVal("baseWorkersFound", engine.getTotalFoundWorkers(), "textContent", 1);
        view.updateVal("basePaneTitleStarBeads", engine.isInnBuiltFromFoxDen() ? "" : "none", "style.display");
        view.updateVal("basePaneTitleCoins", "", "style.display");
        const foxQueueCount = engine.getFoxDenQueuedJobCount();
        const foxQueueMax = engine.getFoxDenQueueMax();
        view.updateVal("foxDenMapDisplay", `${foxQueueCount}/${foxQueueMax}`);
        view.bindFoxDenQueueTip();
        view.refreshFoxDenQueueTip();

        view.syncMapBuildingSelection(selected);
        view.updateMapRevealVisibility();

        if (selected === "hiddenSpring") {
            const t = view._basePanelPurchasingTools(base, null, data.progress.options.hideMaxedUpgrades);
            const hsOpts = Object.assign({}, t.soldOutUpgradeRowOpts(t.hideMaxed, "hiddenSpring"), {
                buttonDisabled: function(pk, u) {
                    if (resortData.isUpgradeSoldOut(u)) {
                        return true;
                    }
                    if (typeof u.canBuy === "function") {
                        return !u.canBuy();
                    }
                    return false;
                }
            });
            t.refreshOrderedPurchasables("hiddenSpring", resortData.buildings.hiddenSpring.upgradesOrder, hsOpts);
            view.updateBuildingManaRow("hiddenSpring");
            view.updateCollectStoneButton();
            const selfSufficient = engine.isArrangementOfSelfSufficiencyUnlocked();
            view.updateVal("hiddenSpringAssignOkami_btn", selfSufficient ? "" : "none", "style.display");
            if (selfSufficient) {
                const okamiHere = !!engine.getOkami().repeatCollectStone;
                view.updateVal("hiddenSpringAssignOkami_btn", okamiHere ? "Unassign Okami" : "Assign Okami");
                view.updateVal("hiddenSpringAssignOkami_btn", okamiHere, "classList.toggle", "assign-okami-btn-active");
            }
            const showAutoRefill = selfSufficient && engine.isSpiritTrainingSpotBought();
            view.updateVal("hiddenSpringAutoRefill_row", showAutoRefill ? "" : "none", "style.display");
            if (showAutoRefill) {
                const refillChk = viewData.cached.hiddenSpringAutoRefill_chk;
                const hsState = base.hiddenSpring;
                if (refillChk && hsState) {
                    refillChk.checked = !!hsState.autoRefillMana;
                }
            }
            if (typeof createView !== "undefined" && createView.refreshInfoButtonPanel) {
                createView.refreshInfoButtonPanel("resortInfo_hiddenSpring");
            }
        } else if (selected === "spirit") {
            this.updateSpiritInfo();
        } else if (selected === "fireLauncher") {
            this.updateFireLauncherInfo();
        } else if (selected === "torii") {
            const torii = base.torii;
            const inn = base.inn;
            const roomsAvailable = inn.roomsAvailable || 0;
            const toriiRate = engine.getSiteEffectiveWorkerRate("torii");
            const toriiBuilt = !!(base.foxDen && base.foxDen.unlocks && base.foxDen.unlocks.torii);
            const toriiGateFull = (torii.visitorsWaiting || 0) >= (torii.maxVisitors || 2);
            const toriiInterval = engine.getToriiVisitorIntervalMs();
            const toriiVisitorPct = toriiBuilt && !toriiGateFull && toriiInterval > 0
                ? Math.max(0, Math.min(100, (1 - (Math.max(0, torii.nextVisitorTimerMs || 0) / toriiInterval)) * 100))
                : 0;
            view.updateVal("toriiVisitorsWaiting", torii.visitorsWaiting || 0);
            view.updateVal("toriiVisitorsMax", torii.maxVisitors || 2);
            view.updateVal("toriiNextVisitor", !toriiBuilt ? "Not built" : (toriiGateFull ? "Gate full" : `${Math.ceil(Math.max(0, torii.nextVisitorTimerMs || 0) / 1000)}s`));
            const avgArrivalSec = engine.getToriiAverageVisitorArrivalSeconds();
            const arrivalGuests = engine.getToriiArrivalGuestCount();
            view.updateVal("toriiAvgVisitorArrival", toriiBuilt
                ? ` (avg ${round1(avgArrivalSec)}s for ${arrivalGuests})`
                : "");
            view.updateVal("toriiNextVisitorProgressWrap", toriiBuilt && !toriiGateFull ? "" : "none", "style.display");
            view.updateVal("toriiNextVisitorProgressFill", `${toriiVisitorPct}%`, "style.width");
            const bowl = engine.isToriiDrinkingBowlUnlocked();
            const toriiWaterCap = engine.getToriiWaterCapacity();
            view.updateVal("toriiWater_row", bowl ? "" : "none", "style.display");
            view.syncAllowCarriersWaterCheckbox("torii", bowl);
            if (bowl) {
                const toriiWater = torii.water || 0;
                view.updateVal("toriiWaterText", `Hot Water: ${round1Fixed(toriiWater)}/${toriiWaterCap}`);
                view.updateVal("toriiWaterFill", toriiWaterCap > 0 ? `${Math.max(0, Math.min(100, (toriiWater / toriiWaterCap) * 100))}%` : "0%", "style.width");
            }
            this.updateResortWorkerControls("torii", toriiRate > 0);
            const tTorii = view._basePanelPurchasingTools(base, null, data.progress.options.hideMaxedUpgrades);
            const toriiUpgOpts = Object.assign({}, tTorii.soldOutUpgradeRowOpts(tTorii.hideMaxed, "torii"), {
                buttonDisabled: function(pk, u) {
                    if (resortData.isUpgradeSoldOut(u)) {
                        return true;
                    }
                    if (typeof u.canBuy === "function") {
                        return !u.canBuy();
                    }
                    return false;
                }
            });
            tTorii.refreshOrderedPurchasables("torii", resortData.buildings.torii.upgradesOrder, toriiUpgOpts);
            view.updateBuildingManaRow("torii");
            if (typeof createView !== "undefined" && createView.refreshInfoButtonPanel) {
                createView.refreshInfoButtonPanel("resortInfo_torii");
            }
        } else if (selected === "inn") {
            const inn = base.inn;
            engine.syncInnRoomCounts();
            const tInn = view._basePanelPurchasingTools(base, null, data.progress.options.hideMaxedUpgrades);
            const innName = engine.getInnDisplayName();
            view.updateVal("innInfoTitle", innName);
            view.updateVal("innMapLabelText", innName);
            view.updateVal("innRoomsAvailable", inn.roomsAvailable || 0);
            view.updateVal("innRoomsOccupied", inn.roomsOccupied || 0);
            let restRate = engine.getInnRestfulnessPerSecond();
            if (engine.canInnGentleLightsApply(1)) {
                restRate += engine.getInnGentleLightsRestfulnessBonus();
            }
            view.updateVal("innRestfulnessPerSecond", restRate);
            view.updateBuildingManaRow("inn");
            const onsen = engine.isInnOnsenConverted();
            view.updateVal("innHotWater_row", onsen ? "" : "none", "style.display");
            view.syncAllowCarriersWaterCheckbox("inn", onsen);
            view.updateVal("innOnsenSoak_row", onsen ? "" : "none", "style.display");
            if (onsen) {
                const hot = inn.hotWater || 0;
                const hotCap = engine.getInnHotWaterCapacity();
                view.updateVal("innHotWaterText", `Hot Water: ${round1Fixed(hot)}/${hotCap}`);
                view.updateVal("innHotWaterFill", hotCap > 0 ? `${Math.max(0, Math.min(100, (hot / hotCap) * 100))}%` : "0%", "style.width");
            }
            const marketBuiltInn = engine.isMarketBuilt();
            view.updateVal("innSoap_row", marketBuiltInn ? "" : "none", "style.display");
            if (marketBuiltInn) {
                view.updateVal("innSoapText", intToStringRound(engine.getMarketGoodAmount("soap")));
            }
            const towelsVisible = marketBuiltInn && engine.getMarketLevel() >= 2;
            view.updateVal("innTowels_row", towelsVisible ? "" : "none", "style.display");
            if (towelsVisible) {
                view.updateVal("innTowelsText", intToStringRound(engine.getMarketGoodAmount("towels")));
            }
            const innPathBuilt = !!(inn && inn.pondPathBuilt);
            view.updateVal("innGuestsVisitPond_row", innPathBuilt ? "" : "none", "style.display");
            if (innPathBuilt) {
                const innChk = document.getElementById("innGuestsVisitPond_chk");
                if (innChk) {
                    innChk.checked = inn.guestsVisitPond !== false;
                }
            }
            tInn.refreshOrderedPurchasables("inn", resortData.buildings.inn.upgradesOrder, { hideMaxed: tInn.hideMaxed });
            if (typeof createView !== "undefined" && createView.refreshInfoButtonPanel) {
                createView.refreshInfoButtonPanel("resortInfo_inn");
            }
        } else if (selected === "laundry") {
            this.updateResortWorkerControls("laundry", false);
        } else if (selected === "path") {
            const pathIdx = data.progress.selectedPathSegmentIndex;
            const seg = pathIdx !== undefined && pathIdx !== null ? engine.getPathSegmentData(pathIdx) : null;
            let stateText = seg ? seg.state : "";
            if (seg && seg.hasRailing) {
                stateText += " (Railing)";
            }
            if (seg && seg.hasStairs) {
                stateText += " (Stairs)";
            }
            if (seg && seg.hasLanterns) {
                stateText += " (Lanterns)";
            }
            if (seg && seg.hasReinforcedStairs) {
                stateText += " (Reinforced Stairs)";
            }
            view.updateVal("pathSegmentStateText", stateText);
            const roadTip = engine.getPathSegmentRoadTipHtml(pathIdx);
            view.updateVal("pathSegmentRoadRow", roadTip ? "" : "none", "style.display");
            view.updateVal("pathSegmentRoadRow", roadTip, "innerHTML");
            const showNextPathBtn = !!(seg && seg.state !== "Large Rocks" && pathIdx > 0);
            view.updateVal("base_path_select_next_row", showNextPathBtn ? "" : "none", "style.display");
            const t = view._basePanelPurchasingTools(base, null, data.progress.options.hideMaxedUpgrades);
            const pathOpts = Object.assign({}, t.soldOutUpgradeRowOpts(t.hideMaxed, "path"), {
                buyButtonText: function(pk, u) {
                    const weaveUi = pathIdx !== undefined && pathIdx !== null
                        ? engine.getPathUpgradeWeaveUi(pathIdx, pk) : null;
                    if (weaveUi) {
                        return weaveUi.label;
                    }
                    if (resortData.isUpgradeSoldOut(u)) {
                        return u.soldOutButtonLabel || "Cleared";
                    }
                    if (pk === "removeRocks") {
                        return "Remove Rocks";
                    }
                    return t.soldOutOrBuyLabel(u, "path");
                },
                buttonDisabled: function(pk, u) {
                    const weaveUi = pathIdx !== undefined && pathIdx !== null
                        ? engine.getPathUpgradeWeaveUi(pathIdx, pk) : null;
                    if (weaveUi) {
                        return weaveUi.disabled;
                    }
                    if (resortData.isUpgradeSoldOut(u)) {
                        return true;
                    }
                    if (typeof u.canBuy === "function") {
                        return !u.canBuy();
                    }
                    return false;
                }
            });
            t.refreshOrderedPurchasables("path", resortData.buildings.path.upgradesOrder, pathOpts);
        } else if (selected === "stonePile") {
            const pile = base.stonePile || {};
            const duplicator = !!pile.stoneDuplicatorUnlocked;
            view.updateVal("stonePileInfoValue", pile.stone || 0, "textContent", "floor");
            view.updateVal("stonePileDupedStone_row", duplicator ? "" : "none", "style.display");
            if (duplicator) {
                view.updateVal("stonePileDupedStoneValue", pile.dupedStone || 0, "textContent", "floor");
            }
            view.updateBuildingManaRow("stonePile");
            const dupeWrapOn = duplicator;
            view.updateVal("stonePileDupeProgressWrap", dupeWrapOn ? "" : "none", "style.display");
            view.updateVal("stonePileDupeIntervalText", dupeWrapOn ? "" : "none", "style.display");
            if (dupeWrapOn) {
                const intervalMs = engine.getStoneDuplicatorIntervalMs ? engine.getStoneDuplicatorIntervalMs() : 10000;
                const remain = pile.dupeTimerMs === undefined || pile.dupeTimerMs === null ? intervalMs : pile.dupeTimerMs;
                const pct = intervalMs > 0
                    ? Math.max(0, Math.min(100, (1 - (Math.max(0, remain) / intervalMs)) * 100))
                    : 100;
                view.updateVal("stonePileDupeProgressFill", `${pct}%`, "style.width");
                const everySec = roundNearestDecimals(intervalMs / 1000, 2);
                view.updateVal("stonePileDupeIntervalText", `every ${everySec}s`);
            }
            const garden = base.garden || {};
            const showUndup = !!(garden.arrangementOfDoubledStoneUnlocked && duplicator);
            view.updateVal("stonePileAllowUnduplicated_row", showUndup ? "" : "none", "style.display");
            if (showUndup) {
                const undupChk = viewData.cached.stonePileAllowUnduplicated_chk || document.getElementById("stonePileAllowUnduplicated_chk");
                if (undupChk && undupChk.checked !== (pile.allowUnduplicatedStone !== false)) {
                    undupChk.checked = pile.allowUnduplicatedStone !== false;
                }
            }
            const tPile = view._basePanelPurchasingTools(base, null, data.progress.options.hideMaxedUpgrades);
            tPile.refreshOrderedPurchasables("stonePile", resortData.buildings.stonePile.upgradesOrder, { hideMaxed: tPile.hideMaxed });
            if (typeof createView !== "undefined" && createView.refreshInfoButtonPanel) {
                createView.refreshInfoButtonPanel("resortInfo_stonePile");
            }
        } else if (selected === "bambooForest") {
            this.updateBambooForestInfo();
            this.updateResortWorkerControls("bambooForest", (engine.getBambooCutWorkerRate() || 0) > 0);
            const tBamboo = view._basePanelPurchasingTools(base, null, data.progress.options.hideMaxedUpgrades);
            tBamboo.refreshOrderedPurchasables("bambooForest", resortData.buildings.bambooForest.upgradesOrder, { hideMaxed: tBamboo.hideMaxed });
        } else if (selected === "foxDen") {
            const t = view._basePanelPurchasingTools(base, null, false);
            this.updateBasePanelFoxDen(base, t);
        } else if (selected === "garden") {
            const t = view._basePanelPurchasingTools(base, null, data.progress.options.hideMaxedUpgrades);
            this.updateBasePanelGarden(base, t);
        } else if (selected === "atelier") {
            const t = view._basePanelPurchasingTools(base, null, data.progress.options.hideMaxedUpgrades);
            this.updateBasePanelAtelier(t);
        } else if (selected === "mage_tower") {
            const t = view._basePanelPurchasingTools(base, null, data.progress.options.hideMaxedUpgrades);
            this.updateBasePanelMageTower(t);
        } else if (selected === "market") {
            const t = view._basePanelPurchasingTools(base, null, data.progress.options.hideMaxedUpgrades);
            this.updateBasePanelMarket(t);
        } else if (selected === "noodleBar") {
            const t = view._basePanelPurchasingTools(base, null, data.progress.options.hideMaxedUpgrades);
            this.updateBasePanelNoodleBar(t);
        } else if (selected === "bonfire") {
            this.updateBasePanelBonfire();
        } else if (selected === "shrine") {
            this.updateBasePanelShrine();
        } else if (selected === "scrollArchives") {
            const t = view._basePanelPurchasingTools(base, null, data.progress.options.hideMaxedUpgrades);
            this.updateBasePanelScrollArchives(base, t);
        } else if (selected === "cistern") {
            const cistern = base.cistern || {};
            const maxCap = engine.getCisternMaxCapacity();
            const curVol = cistern.waterVolume || 0;
            view.updateVal("cisternInfoWater", `${round2(curVol)}L`);
            view.updateVal("cisternInfoTemperature", `${round1Fixed(cistern.temperature || 0)}C`);
            view.updateVal("cisternInfoCapacity", `${round2(curVol)}/${round2(maxCap)}L`);
            const wellCoins = engine.getWishingWellCoinRate ? engine.getWishingWellCoinRate() : 0;
            view.updateVal("cisternWishingWell_row", wellCoins > 0 ? "" : "none", "style.display");
            view.updateVal("cisternWishingWellCoins", wellCoins > 0 ? wellCoins.toFixed(1) : "");
            const waterCarryVisible = engine.cisternWorkersRevealed();
            view.updateVal("cisternWaterCarry_row", waterCarryVisible ? "" : "none", "style.display");
            if (waterCarryVisible) {
                view.updateVal("cisternWaterCarry", resortData.getCisternWaterCarryAmount());
            }
            const garden = base.garden || {};
            const thirstUnlocked = !!garden.arrangementOfThirstUnlocked;
            view.updateVal("cisternRefuseWater_row", thirstUnlocked ? "" : "none", "style.display");
            if (thirstUnlocked) {
                const refuseChk = viewData.cached.cisternRefuseWater_chk || document.getElementById("cisternRefuseWater_chk");
                if (refuseChk) {
                    refuseChk.checked = !!cistern.refuseIncomingWater;
                }
            }
            const hotWaterUnlocked = !!garden.arrangementOfHotWaterUnlocked;
            view.updateVal("cisternReplaceHotWater_row", hotWaterUnlocked ? "" : "none", "style.display");
            if (hotWaterUnlocked) {
                const hotChk = document.getElementById("cisternReplaceHotWater_chk");
                if (hotChk) {
                    hotChk.checked = !!cistern.replaceWithHotterWater;
                }
            }
            const viscosityUnlocked = !!garden.arrangementOfViscosityUnlocked;
            view.updateVal("cisternViscosity_row", viscosityUnlocked ? "" : "none", "style.display");
            if (viscosityUnlocked) {
                const visChk = viewData.cached.cisternViscosity_chk || document.getElementById("cisternViscosity_chk");
                if (visChk) {
                    visChk.checked = cistern.waterSpiritsUsePathSpeed !== false;
                }
            }
            view.updateVal("cisternEmptyHalf_btn", (cistern.waterVolume || 0) <= 0, "disabled");
            const tCistern = view._basePanelPurchasingTools(base, null, data.progress.options.hideMaxedUpgrades);
            tCistern.refreshOrderedPurchasables("cistern", resortData.buildings.cistern.upgradesOrder, { hideMaxed: tCistern.hideMaxed });
            if (engine.cisternWorkersRevealed()) {
                this.updateResortWorkerControls("cistern", engine.cisternHasAssignedCarriers());
            }
            if (typeof createView !== "undefined" && createView.refreshInfoButtonPanel) {
                createView.refreshInfoButtonPanel("resortInfo_cistern");
            }
        } else if (selected === "pond") {
            const pond = base.pond || {};
            view.updateVal("pondInfoWater", `${round2(pond.waterVolume || 0)}L`);
            const wellRate = engine.getWishingWellWaterRate ? engine.getWishingWellWaterRate() : 0;
            const drainText = `-${round2(engine.getPondForestDrainPerSecond())} L/s`;
            view.updateVal("pondWishingWellRate", wellRate > 0 ? `+${wellRate} L/s | ${drainText}` : drainText);
            const pondWater = pond.waterVolume || 0;
            const pondExp = pondWater > 0 ? round2(Math.sqrt(pondWater) / 50) : 0;
            const showPondExp = createView.hasAnyWaterSpirit();
            view.updateVal("pondWaterSpiritExp_row", showPondExp ? "" : "none", "style.display");
            view.updateVal("pondWaterSpiritExp", `${pondExp}/s`);
            view.updateVal("pondSendWater_row", "none", "style.display");
            if (viewData.cached.base_pond_pipes_to_forest_row) {
                view.updateVal("base_pond_pipes_to_forest_row", "none", "style.display");
            }
            const tPond = view._basePanelPurchasingTools(base, null, data.progress.options.hideMaxedUpgrades);
            tPond.refreshOrderedPurchasables("pond", resortData.buildings.pond.upgradesOrder, { hideMaxed: tPond.hideMaxed });
            if (typeof createView !== "undefined" && createView.refreshInfoButtonPanel) {
                createView.refreshInfoButtonPanel("resortInfo_pond");
            }
        } else if (selected === "mine") {
            this.updateMineInfo();
            const tMine = view._basePanelPurchasingTools(base, null, data.progress.options.hideMaxedUpgrades);
            tMine.refreshOrderedPurchasables("mine", resortData.buildings.mine.upgradesOrder, { hideMaxed: tMine.hideMaxed });
        }

        const torii = base.torii || {};
        const inn = base.inn || {};
        const innCap = engine.getTatamiInnRoomCapacity ? engine.getTatamiInnRoomCapacity() : 2;
        const pile = base.stonePile || {};
        const stoneIcon = resortData.resourceIconHtml("stone");
        if (pile.stoneDuplicatorUnlocked) {
            view.updateVal("stonePileMapValue", `${stoneIcon} ${intToStringRound(pile.stone || 0)} | ${intToStringRound(Math.floor(pile.dupedStone || 0))}`, "innerHTML");
        } else {
            view.updateVal("stonePileMapValue", `${stoneIcon} ${intToStringRound(pile.stone || 0)}`, "innerHTML");
        }
        const atelier = base.atelier || {};
        const atelierOre = atelier.ore || 0;
        const atelierBars = atelier.bars || 0;
        view.updateVal("atelierMapDisplay", data.progress.base.hiddenSpring.bringOreToAtelierUnlocked
            ? `${resortData.resourceIconHtml("ore")} ${intToStringRound(atelierOre)} | ${resortData.resourceIconHtml("bars")} ${intToStringRound(atelierBars)}`
            : "", "innerHTML");
        const forest = base.bambooForest || {};
        const woodMap = `${resortData.resourceIconHtml("wood")} ${intToStringRound(forest.wood || 0)}`;
        view.updateVal("bambooForestMapDisplay", engine.isGrowHardwoodBought()
            ? `${woodMap} | ${resortData.resourceIconHtml("hardwood")} ${intToStringRound(forest.hardwood || 0)}`
            : woodMap, "innerHTML");
        const bonfire = base.bonfire || {};
        view.updateVal("bonfireMapDisplay", bonfire.kilnBuilt
            ? `${resortData.resourceIconHtml("ash")} ${intToStringRound(bonfire.ash || 0)}`
            : "", "innerHTML");
        view.updateVal("bonfireMapDisplay", bonfire.kilnBuilt ? "" : "none", "style.display");
        view.updateVal("toriiMapDisplay", `${torii.visitorsWaiting || 0}/${torii.maxVisitors || 2}`);
        view.updateVal("innMapDisplay", `${inn.roomsOccupied || 0}/${innCap}`);
        view.updateVal("innMapLabelText", engine.getInnDisplayName());
        view.updateVal("baseBuilding_inn", engine.isInnOnsenConverted(), "classList.toggle", "is-onsen");
        const cistern = base.cistern || {};
        const cisternBuilt = engine.isCisternBuiltFromFoxDen();
        view.updateVal("cisternMapValue", cisternBuilt
            ? `${round2(cistern.waterVolume || 0)}L | ${round1(cistern.temperature || 0)}C`
            : "", "textContent");
        this.refreshBaseBuildingNotifications();
        this.updateResortMapProgressBars();
        this.updateResortMapTokens();
        this.updateFoxDenConstructionMap();
    },
    updatePathSegmentHighlight: function(hoverIndex) {
        if (hoverIndex !== undefined) {
            viewData.pathSegmentHoverIndex = hoverIndex;
        }
        const specs = engine.getResortPathSegmentSpecs();
        const selIdx = data.progress.selectedBaseBuilding === "path" ? data.progress.selectedPathSegmentIndex : null;
        const hoverIdx = viewData.pathSegmentHoverIndex;
        const pathDebug = typeof showPathDebug !== "undefined" && showPathDebug;
        if (!viewData.pathHighlightSig) {
            viewData.pathHighlightSig = [];
        }
        const prev = viewData.pathHighlightSig;
        const next = [];
        let changed = prev.length !== specs.length;
        let revealChanged = changed;
        for (let i = 0; i < specs.length; i++) {
            const revealed = engine.isPathSegmentRevealed(i);
            const accessible = pathDebug || engine.isPathSegmentAccessible(i);
            let mode = "";
            if (selIdx === i) {
                mode = "s";
            } else if (hoverIdx === i && accessible) {
                mode = "h";
            }
            const sig = (revealed ? "1" : "0") + (accessible ? "a" : "") + mode + (pathDebug ? "d" : "");
            next.push(sig);
            if (prev[i] !== sig) {
                changed = true;
                if ((prev[i] || "").charAt(0) !== sig.charAt(0) || ((prev[i] || "").indexOf("d") >= 0) !== (sig.indexOf("d") >= 0)) {
                    revealChanged = true;
                }
            }
        }
        if (!changed) {
            return;
        }
        if (revealChanged) {
            engine.syncResortPathDom();
        }
        const hiEls = viewData.pathSegHighlightEls || [];
        const hitEls = viewData.pathSegHitEls || [];
        for (let i = 0; i < specs.length; i++) {
            if (prev[i] === next[i]) {
                continue;
            }
            const hiEl = hiEls[i] || document.getElementById(`pathSegmentHighlight_${i}`);
            if (!hiEl) {
                next[i] = "";
                continue;
            }
            const hitEl = hitEls[i] || document.querySelector(`.path-seg-hit[data-segment-index="${i}"]`);
            const sig = next[i];
            const prevSig = prev[i] || "";
            const visualsSame = prevSig.charAt(0) === sig.charAt(0)
                && (prevSig.indexOf("a") >= 0) === (sig.indexOf("a") >= 0)
                && (prevSig.indexOf("d") >= 0) === (sig.indexOf("d") >= 0);
            if (!visualsSame) {
                const showSeg = sig.charAt(0) === "1" ? "" : "none";
                hiEl.style.display = showSeg;
                if (hitEl) {
                    hitEl.style.display = showSeg;
                    hitEl.style.pointerEvents = sig.indexOf("a") >= 0 ? "stroke" : "none";
                }
                if (sig.indexOf("d") >= 0) {
                    hiEl.style.stroke = `hsl(${(i * 53) % 360}, 75%, 58%)`;
                } else if (prevSig.indexOf("d") >= 0) {
                    hiEl.style.stroke = "";
                }
            }
            hiEl.classList.remove("path-seg-hover", "path-seg-selected");
            if (sig.indexOf("s") >= 0) {
                hiEl.classList.add("path-seg-selected");
            } else if (sig.indexOf("h") >= 0) {
                hiEl.classList.add("path-seg-hover");
            }
        }
        viewData.pathHighlightSig = next;
    },
    updateOkamiMapVisuals: function() {
        const visual = engine.getOkamiMapVisual();
        let si;
        for (si = 0; si < resortData.baseBuildingOrder.length; si++) {
            const key = resortData.baseBuildingOrder[si];
            const btn = viewData.cached[`baseBuilding_${key}`];
            if (!btn) {
                continue;
            }
            const tail = btn.querySelector(".okami-site-tail");
            if (tail) {
                tail.classList.toggle("okami-site-tail-visible", visual.mode === "site" && visual.siteKey === key);
            }
        }
        const specs = engine.getResortPathSegmentSpecs();
        for (si = 0; si < specs.length; si++) {
            const assignKey = engine.getPathSegmentAssignmentKey(si);
            const btn = viewData.cached[`baseBuilding_path_${si}`];
            if (!btn) {
                continue;
            }
            const tail = btn.querySelector(".okami-site-tail");
            if (tail) {
                tail.classList.toggle("okami-site-tail-visible", visual.mode === "site" && visual.siteKey === assignKey);
            }
        }
        const travelEl = viewData.cached.okamiTravelToken;
        if (travelEl) {
            if (visual.mode === "travel") {
                const pos = engine.getResortPathPosition(visual.pathProgress || 0);
                travelEl.style.display = "";
                view.setGpuPos(travelEl, pos.x - 8, pos.y - 8, viewData.gpuPosCache.okamiTravelToken || (viewData.gpuPosCache.okamiTravelToken = {}), false);
                const img = travelEl.querySelector(".okami-travel-tail");
                if (img) {
                    img.classList.toggle("fox-travel-mirror", !!visual.east);
                    img.classList.remove("okami-tail-mirror");
                }
            } else {
                travelEl.style.display = "none";
            }
        }
        const weaveTokenEl = viewData.cached.okamiPathWeaveToken;
        if (weaveTokenEl) {
            if (visual.mode === "pathWeaving") {
                const specs = engine.getResortPathSegmentSpecs();
                const spec = specs[visual.segmentIndex];
                const pos = spec ? engine.getResortPathPosition(spec.midDist) : null;
                if (pos) {
                    weaveTokenEl.style.display = "";
                    view.setGpuPos(weaveTokenEl, pos.x, pos.y, viewData.gpuPosCache.okamiPathWeaveToken || (viewData.gpuPosCache.okamiPathWeaveToken = {}), false);
                } else {
                    weaveTokenEl.style.display = "none";
                }
            } else {
                weaveTokenEl.style.display = "none";
            }
        }
    },
    updateFoxDenGatherButtons: function() {
        const rh = data.progress.base.foxDen;
        for (let i = 0; i < resortData.getFoxDenUnlockOrder().length; i++) {
            const uk = resortData.getFoxDenUnlockOrder()[i];
            const btnId = resortData.idBtn("foxDen", uk);
            if (!viewData.cached[btnId]) {
                continue;
            }
            const site = rh.constructionSites && rh.constructionSites[uk];
            if (!site || site.status !== "building") {
                continue;
            }
            const queueBlocked = !!(site.paused && !engine.canResumeFoxDenJob());
            view.updateVal(btnId, engine.getBuildingGatherButtonLabel(uk), "innerHTML");
            view.updateVal(btnId, queueBlocked, "disabled");
            const btnNode = viewData.cached[btnId];
            if (btnNode) {
                btnNode.classList.toggle("upgrade-btn-paused", !!site.paused);
                btnNode.classList.toggle("upgrade-btn-queue-full", queueBlocked);
            }
        }
        const jobKeys = Object.keys(rh.upgradeGatherJobs);
        for (let ui = 0; ui < jobKeys.length; ui++) {
            const jobKey = jobKeys[ui];
            const parsed = engine.parseUpgradeGatherJobKey(jobKey);
            if (!parsed) {
                continue;
            }
            const up = engine.getUpgradeDef(parsed.scopeKey, parsed.upgradeKey);
            if (!up || !up.key) {
                continue;
            }
            const btnEl = resortData.idBtn(parsed.scopeKey, up.key);
            if (!viewData.cached[btnEl]) {
                continue;
            }
            const purchaseUi = engine.getUpgradePurchaseUi(parsed.scopeKey, parsed.upgradeKey);
            if (!purchaseUi || purchaseUi.mode === "weaving" || purchaseUi.mode === "soldOut") {
                continue;
            }
            view.updateVal(btnEl, purchaseUi.label, "innerHTML");
            view.updateVal(btnEl, purchaseUi.disabled, "disabled");
            const btnNode = viewData.cached[btnEl];
            if (btnNode) {
                btnNode.classList.toggle("upgrade-btn-paused", purchaseUi.mode === "paused" || purchaseUi.mode === "weavePaused");
                btnNode.classList.toggle("upgrade-btn-ready", purchaseUi.mode === "ready");
                btnNode.classList.toggle("upgrade-btn-weaving", purchaseUi.mode === "weavePaused");
                btnNode.classList.toggle("upgrade-btn-queue-full", !!purchaseUi.queueBlocked);
                if (purchaseUi.mode === "weavePaused" && purchaseUi.pct !== null && purchaseUi.pct !== undefined) {
                    btnNode.style.setProperty("--weave-pct", `${purchaseUi.pct}%`);
                }
            }
        }
    },
    updateActiveWeavingButtons: function() {
        const pathIdx = data.progress.selectedPathSegmentIndex;
        if (pathIdx !== undefined && pathIdx !== null) {
            const pathUpgrades = resortData.buildings.path.upgradesOrder || [];
            for (let pui = 0; pui < pathUpgrades.length; pui++) {
                const pk = pathUpgrades[pui];
                const weaveUi = engine.getPathUpgradeWeaveUi(pathIdx, pk);
                const up = resortData.buildings.path.upgrades[pk];
                const btnEl = up && up.key ? resortData.idBtn("path", up.key) : "";
                const btnNode = btnEl ? viewData.cached[btnEl] : null;
                if (!btnNode) {
                    continue;
                }
                if (weaveUi) {
                    view.updateVal(btnEl, weaveUi.label, "innerHTML");
                    view.updateVal(btnEl, weaveUi.disabled, "disabled");
                    btnNode.classList.toggle("upgrade-btn-weaving", true);
                    btnNode.classList.toggle("upgrade-btn-paused", weaveUi.mode === "paused");
                    btnNode.style.setProperty("--weave-pct", `${weaveUi.pct}%`);
                } else {
                    btnNode.classList.remove("upgrade-btn-weaving", "upgrade-btn-paused");
                    btnNode.style.removeProperty("--weave-pct");
                }
            }
        }
        const weaving = data.progress.weaving;
        const entries = [];
        if (weaving && weaving.active) {
            entries.push(weaving.active);
        }
        const pausedEntries = engine.getAllPausedWeavingEntries();
        for (let pi = 0; pi < pausedEntries.length; pi++) {
            entries.push(pausedEntries[pi]);
        }
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            if (entry.scopeKey === "market" && entry.upgradeKey === "exchangeCredit") {
                continue;
            }
            let btnEl = "";
            if (entry.scopeKey === "foxDenUnlock") {
                btnEl = resortData.idBtn("foxDen", entry.upgradeKey);
            } else {
                const up = engine.getUpgradeDef(entry.scopeKey, entry.upgradeKey);
                if (!up || !up.key) {
                    continue;
                }
                btnEl = resortData.idBtn(entry.scopeKey, up.key);
            }
            const weaveUi = engine.getUpgradeWeaveUi(entry.scopeKey, entry.upgradeKey);
            if (!weaveUi) {
                continue;
            }
            view.updateVal(btnEl, weaveUi.label, "innerHTML");
            view.updateVal(btnEl, weaveUi.disabled, "disabled");
            const btnNode = viewData.cached[btnEl];
            if (btnNode) {
                const isPaused = weaveUi.mode === "paused";
                // Keep upgrade-btn-weaving on while paused so the ::before progress fill stays visible.
                btnNode.classList.toggle("upgrade-btn-weaving", true);
                btnNode.classList.toggle("upgrade-btn-paused", isPaused);
                btnNode.classList.toggle("upgrade-btn-ready", false);
                btnNode.style.setProperty("--weave-pct", `${weaveUi.pct}%`);
            }
        }
        this.updateFoxDenGatherButtons();
        this.updateCollectStoneButton();
    },
    flashFoxDenQueueFull: function() {
        const el = viewData.cached.foxDenMapDisplay;
        if (!el) {
            return;
        }
        if (el._foxDenQueueFlashEnd) {
            el.removeEventListener("animationend", el._foxDenQueueFlashEnd);
            el._foxDenQueueFlashEnd = null;
        }
        el.classList.remove("fox-den-queue-flash");
        void el.offsetWidth;
        const onEnd = function() {
            el.classList.remove("fox-den-queue-flash");
            el.removeEventListener("animationend", onEnd);
            el._foxDenQueueFlashEnd = null;
        };
        el._foxDenQueueFlashEnd = onEnd;
        el.addEventListener("animationend", onEnd);
        el.classList.add("fox-den-queue-flash");
    },
    refreshBaseBuildingNotifications: function() {
        const nb = data.progress.baseContentNotify.building;
        const rh = data.progress.base && data.progress.base.foxDen;
        const unlocks = rh && rh.unlocks ? rh.unlocks : {};
        const applyNotifyLabel = function(btnKey, need) {
            const btnId = "baseBuilding_" + btnKey;
            if (!viewData.cached[btnId]) {
                return;
            }
            const labelId = "baseBuildingNotifyLabel_" + btnKey;
            const badgeId = "baseBuildingNotifyBadge_" + btnKey;
            if (viewData.cached[labelId]) {
                const baseLabel = resortData.getScopeDisplayName(btnKey);
                view.updateVal(labelId, baseLabel, "textContent");
            }
            if (viewData.cached[badgeId]) {
                view.updateVal(badgeId, need ? "" : "none", "style.display");
            }
            view.updateVal(btnId, !!need, "classList.toggle", "base-building-label--notify");
        };
        const buildingVisible = function(key) {
            if (key === "foxDen") {
                return true;
            }
            return !!(unlocks && unlocks[key]);
        };
        for (let bi = 0; bi < resortData.baseBuildingOrder.length; bi++) {
            const k = resortData.baseBuildingOrder[bi];
            let showNotify = false;
            if (k === "hiddenSpring" || k === "stonePile" || k === "bambooForest" || k === "foxDen") {
                if (k === "hiddenSpring") {
                    showNotify = engine.isMapElementRevealed("hiddenSpring");
                } else {
                    showNotify = true;
                }
            } else if (buildingVisible(k)) {
                showNotify = true;
            }
            if (!showNotify) {
                continue;
            }
            let need = !!nb[k];
            if (k === "hiddenSpring") {
                need = need && engine.isMapElementRevealed("hiddenSpring");
            }
            if (k === "cistern") {
                need = need || engine.shouldShowCisternWaterNotify();
            }
            if (k === data.progress.selectedBaseBuilding) {
                need = false;
            }
            applyNotifyLabel(k, need);
        }
    },
    renderAttributePlanList: function() {
        const el = viewData.cached.attributePlanList;
        const plan = (data.progress.attributePlan || []).slice().sort(function(a, b) { return a.level - b.level; });
        const attrLabel = function(key) {
            if (key === "str") {
                return "Brutality";
            }
            if (key === "con") {
                return "Confidence";
            }
            if (key === "spd") {
                return "Charisma";
            }
            if (key === "soul") {
                return "Soul";
            }
            return key;
        };
        let html = "";
        let i = 0;
        while (i < plan.length) {
            const start = plan[i];
            let endIdx = i;
            while (endIdx + 1 < plan.length
                && plan[endIdx + 1].level === plan[endIdx].level + 1
                && plan[endIdx + 1].attribute === start.attribute) {
                endIdx++;
            }
            const end = plan[endIdx];
            const rangeLabel = start.level === end.level
                ? `Lvl ${start.level} is + ${attrLabel(start.attribute)}`
                : `Lvl ${start.level} - ${end.level} is + ${attrLabel(start.attribute)}`;
            html += `<div class="plan-item"><button type="button" class="tab-button plan-item-remove" onclick="events.removeAttributePlanRange(${start.level}, ${end.level})">X</button><span>${rangeLabel}</span></div>`;
            i = endIdx + 1;
        }
        if (!html) {
            html = "<span class=\"muted-text\">No plan yet</span>";
        }
        if (viewData.prevValues.attributePlanHtml !== html) {
            el.innerHTML = html;
            viewData.prevValues.attributePlanHtml = html;
        }
    },
    updateHistoryList: function() {
        const el = viewData.cached.historyList;
        const runs = data.progress.runHistory || [];
        let html = `<div class="history-row history-header"><span>Map</span><span>Duration</span><span>Level</span><span>Kills</span><span>${resortData.resourceIconHtml("coins")} Coins</span><span>Shards</span><span>Okami Exp</span><span>Density</span></div>`;
        if (!runs.length) {
            html += `<div class="muted-text">No runs yet.</div>`;
        }
        for (let i = 0; i < runs.length; i++) {
            const run = runs[i];
            const lvl = run.level !== undefined ? run.level : 0;
            const kills = run.kills !== undefined ? run.kills : 0;
            const mapName = run.mapKey ? view.getMapDisplayName(run.mapKey) : "-";
            const okamiExp = run.okamiExpGained !== undefined ? run.okamiExpGained : 0;
            const density = run.cloneDensity !== undefined && run.cloneDensity !== null ? run.cloneDensity : "-";
            let starHtml = "";
            if (run.starCleared === "bronze" || run.starCleared === "silver" || run.starCleared === "gold") {
                starHtml = ` <span class="history-duration-star skill-star-${run.starCleared} skill-star-filled">★</span>`;
            }
            html += `<div class="history-entry"><div class="history-row"><span title="${mapName}">${mapName}</span><span>${round1(run.survivedSeconds)}s${starHtml}</span><span>${lvl}</span><span>${kills}</span><span>${intToStringRound(run.coinsGained)}</span><span>${round1(run.shardsGained || 0)}</span><span>${round2(okamiExp)}</span><span>${density}</span></div>`;
            const talents = run.talentRows || [];
            if (talents.length > 0) {
                const talentText = talents.map(function(row) {
                    const legacy = String(row).match(/^(.*) talent (\d+)->(\d+)$/);
                    if (legacy) {
                        return `${legacy[1]} talent +${Number(legacy[3]) - Number(legacy[2])}`;
                    }
                    return row;
                }).join(" | ");
                html += `<div class="history-talent muted-text">Talent Levels: ${talentText}</div>`;
            }
            html += `</div>`;
        }
        if (viewData.prevValues.historyHtml !== html) {
            el.innerHTML = html;
            viewData.prevValues.historyHtml = html;
        }
    },
    prestigeHistoryPackCount: function(run, source) {
        const totalKey = source === "bought" ? "boughtPacks" : "milestonePacks";
        if (run && typeof run[totalKey] === "number") {
            return Math.max(0, Math.floor(run[totalKey]));
        }
        const cardsKey = source === "bought" ? "boughtCards" : "milestoneCards";
        const unopenedKey = source === "bought" ? "unopenedBought" : "unopenedMilestone";
        const cards = run && run[cardsKey];
        let n = Array.isArray(cards) ? cards.length : 0;
        const unopened = (run && run[unopenedKey]) || {};
        n += Math.floor(unopened.common || 0) + Math.floor(unopened.rare || 0) + Math.floor(unopened.epic || 0);
        return n;
    },
    updatePrestigeHistoryList: function() {
        const el = viewData.cached.prestigeHistoryList;
        if (!el) {
            return;
        }
        const runs = (data.progress && data.progress.prestigeHistory) || [];
        let html = "";
        if (!runs.length) {
            html = `<div class="muted-text">No prestiges yet.</div>`;
        }
        for (let i = 0; i < runs.length; i++) {
            const run = runs[i];
            const number = runs.length - i;
            html += `<div class="history-prestige-entry">`;
            html += `<div class="history-prestige-title">Prestige ${number}</div>`;
            html += `<div class="history-prestige-line">Time taken: ${secondsToTime(run.seconds || 0)}</div>`;
            html += `<div class="history-prestige-row"><span>Packs received from milestones: ${view.prestigeHistoryPackCount(run, "milestone")}</span><span>Packs bought: ${view.prestigeHistoryPackCount(run, "bought")}</span></div>`;
            html += `<div class="history-prestige-row"><span>Total talent levels: ${Math.floor(run.talentLevels || 0)}</span><span>Total stars: ${Math.floor(run.totalStars || 0)}</span></div>`;
            html += `<div class="history-prestige-row"><span>Okami level: ${Math.floor(run.okamiLevel || 0)}</span><span>Total spirit level: ${Math.floor(run.spiritLevels || 0)}</span></div>`;
            html += `</div>`;
        }
        if (viewData.prevValues.prestigeHistoryHtml !== html) {
            el.innerHTML = html;
            viewData.prevValues.prestigeHistoryHtml = html;
        }
    },
    stripHtmlForSearch: function(html) {
        return String(html == null ? "" : html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    },
    skillMatchesListSearch: function(skillKey, queryLower) {
        if (!queryLower) {
            return true;
        }
        const skill = data.progress.skills && data.progress.skills[skillKey];
        if (!skill) {
            return false;
        }
        const name = String(skill.name || "").toLowerCase();
        if (name.indexOf(queryLower) >= 0) {
            return true;
        }
        const slotCat = skills.getSlotCategory(skillKey);
        if (slotCat && (slotCat.indexOf(queryLower) >= 0 || queryLower === slotCat)) {
            return true;
        }
        const reward = view.stripHtmlForSearch(skills.getSkillRewardText(skillKey, skill)).toLowerCase();
        if (reward.indexOf(queryLower) >= 0) {
            return true;
        }
        const trigger = view.stripHtmlForSearch(skills.getSkillTriggerDescription(skillKey)).toLowerCase();
        return trigger.indexOf(queryLower) >= 0;
    },
    getSortedLibrarySkillKeys: function() {
        const sortMode = data.progress.skillListSort;
        const sort = sortMode === "talent" || sortMode === "alpha" || sortMode === "tips" || sortMode === "grouping"
            ? sortMode
            : "oldest";
        const unlocked = (data.progress.base && data.progress.base.scrollArchives && data.progress.base.scrollArchives.unlockedSkills) || {};
        const unlockIndex = {};
        const unlockKeys = Object.keys(unlocked);
        for (let ui = 0; ui < unlockKeys.length; ui++) {
            unlockIndex[unlockKeys[ui]] = ui;
        }
        const keys = skills.getLibrarySkillKeys().slice();
        keys.sort(function(a, b) {
            const sa = data.progress.skills[a];
            const sb = data.progress.skills[b];
            if (sort === "talent") {
                const ta = (sa && sa.talentLevel) || 0;
                const tb = (sb && sb.talentLevel) || 0;
                if (tb !== ta) {
                    return tb - ta;
                }
                const pa = sa && sa.talentToLevel ? (sa.talent || 0) / sa.talentToLevel : 0;
                const pb = sb && sb.talentToLevel ? (sb.talent || 0) / sb.talentToLevel : 0;
                if (pb !== pa) {
                    return pb - pa;
                }
            } else if (sort === "alpha") {
                const na = (sa && sa.name) || a;
                const nb = (sb && sb.name) || b;
                const cmp = na.localeCompare(nb);
                if (cmp !== 0) {
                    return cmp;
                }
            } else if (sort === "tips") {
                const ta = (sa && sa.tips) || 0;
                const tb = (sb && sb.tips) || 0;
                if (tb !== ta) {
                    return tb - ta;
                }
            } else if (sort === "grouping") {
                const ga = (sa && sa.grouping) || 0;
                const gb = (sb && sb.grouping) || 0;
                if (ga !== gb) {
                    return ga - gb;
                }
            } else {
                const ia = unlockIndex[a];
                const ib = unlockIndex[b];
                const aMissing = ia === undefined;
                const bMissing = ib === undefined;
                if (aMissing !== bMissing) {
                    return aMissing ? 1 : -1;
                }
                if (!aMissing && ia !== ib) {
                    return ia - ib;
                }
            }
            const na = (sa && sa.name) || a;
            const nb = (sb && sb.name) || b;
            return na.localeCompare(nb);
        });
        return keys;
    },
    flashSkillEquipFail: function(el) {
        if (!el) {
            return;
        }
        el.classList.remove("skill-equip-fail-flash");
        void el.offsetWidth;
        el.classList.add("skill-equip-fail-flash");
        setTimeout(function() {
            el.classList.remove("skill-equip-fail-flash");
        }, 450);
    },
    updateSkillsShardSlotProgress: function() {
        engine.ensureShardProgress();
        const unlocked = engine.isShardLootUnlocked();
        const cost = data.progress.nextSkillSlotShardCost;
        const have = data.progress.shards || 0;
        if (!unlocked) {
            view.updateVal("skillsShardSlotProgressLabel", "Research Collect Shards to unlock");
            view.updateVal("skillsShardSlotProgressFill", "0%", "style.width");
            return;
        }
        const shown = Math.floor(have);
        const pct = cost > 0 ? Math.max(0, Math.min(100, (have / cost) * 100)) : 0;
        const shardRate = engine.getCloneShardRatePerSecond();
        const shardRemain = Math.max(0, cost - have);
        const shardEta = shardRate > 0 && shardRemain > 0 ? secondsToTime(shardRemain / shardRate) : "-";
        view.updateVal("skillsShardSlotProgressLabel", `${intToString(shown, 1)} / ${intToString(Math.floor(cost), 1)} Shards until next Skill Slot | ETA: ${shardEta}`);
        view.updateVal("skillsShardSlotProgressFill", `${pct}%`, "style.width");
    },
    updateSkillLoadoutButtons: function() {
        const loadouts = skills.ensureSkillLoadouts();
        if (!loadouts) {
            return;
        }
        const selected = skills.getSelectedSkillLoadoutIndex();
        const hasSelection = selected !== null;
        for (let i = 0; i < skills.LOADOUT_COUNT; i++) {
            const id = "skillLoadoutBtn_" + i;
            view.updateVal(id, i === selected ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
            view.updateVal(id, !!loadouts[i], "classList.toggle", "skill-loadout-btn--filled");
        }
        view.updateVal("skillLoadoutSave", !hasSelection, "disabled");
        view.updateVal("skillLoadoutLoad", !hasSelection, "disabled");
        view.updateVal("skillLoadoutClear", !hasSelection, "disabled");
    },
    /** Mark skills and stars Load would remove. Call from load, and from loadout, equip, and star events. */
    refreshSkillLoadoutRemovalMarks: function() {
        const idx = skills.getSelectedSkillLoadoutIndex();
        const marks = idx === null ? null : skills.predictLoadoutRemovals(idx);
        const removeSkills = (marks && marks.skills) || {};
        const removeStars = (marks && marks.stars) || {};
        const eq = skills.ensureSkillEquip();
        if (!eq) {
            return;
        }
        const views = ["equipped", "library"];
        for (let vi = 0; vi < views.length; vi++) {
            const viewName = views[vi];
            for (let c = 0; c < skills.SLOT_COLUMNS.length; c++) {
                const column = skills.SLOT_COLUMNS[c];
                const arr = eq.slots[column] || [];
                for (let i = 0; i < arr.length; i++) {
                    const key = arr[i];
                    const idPrefix = `skillSlot_${viewName}_${column}_${i}`;
                    const slotEl = viewData.cached[idPrefix];
                    if (slotEl) {
                        slotEl.classList.toggle("skill-equip-slot--loadout-remove", !!(key && removeSkills[key]));
                    }
                    if (viewName !== "equipped") {
                        continue;
                    }
                    const starMarks = (key && removeStars[key]) || {};
                    for (let s = 0; s < skills.STAR_TYPES.length; s++) {
                        const starType = skills.STAR_TYPES[s];
                        const starEl = viewData.cached[`${idPrefix}_star_${starType}`];
                        if (starEl) {
                            starEl.classList.toggle("skill-star-btn--loadout-remove", !!starMarks[starType]);
                        }
                    }
                }
            }
        }
    },
    columnTalentRewardPhrase: function(column, value) {
        if (column === "offense") {
            return `+${value} base slap damage (multiplied by density)`;
        }
        if (column === "defense") {
            return `+${value} base Audacity (multiplied by density)`;
        }
        if (column === "utility") {
            return `+${value}% coins`;
        }
        return `+${value}% skill exp`;
    },
    updateColumnTalentTitle: function(viewName, column) {
        if (typeof skills.columnReward !== "function") {
            return;
        }
        const reward = skills.columnReward(column);
        const label = createView._skillSlotColumnLabel(column);
        const shown = (column === "any" || column === "utility") ? `+${reward.value}%` : `+${reward.value}`;
        view.updateVal(`skillSlotColumnTitleText_${viewName}_${column}`, `${label}: ${shown}`);
        const tip = `${reward.total} equipped talent. ${view.columnTalentRewardPhrase(column, reward.value)}.<br>Next at ${reward.nextAt} talent: ${view.columnTalentRewardPhrase(column, reward.nextValue)}.`;
        view.updateVal(`skillSlotColumnTitleTip_${viewName}_${column}`, tip, "innerHTML");
    },
    positionColumnTalentTip: function(el) {
        if (!el || !el.querySelector) {
            return;
        }
        const tip = el.querySelector(".showthis");
        if (!tip) {
            return;
        }
        const rect = el.getBoundingClientRect();
        const margin = 8;
        const width = 260;
        let left = rect.left;
        if (left + width > window.innerWidth - margin) {
            left = Math.max(margin, window.innerWidth - margin - width);
        }
        if (left < margin) {
            left = margin;
        }
        tip.style.left = left + "px";
        tip.style.top = (rect.bottom + 4) + "px";
    },
    positionSkillSlotTip: function(el) {
        if (!el || !el.querySelector) {
            return;
        }
        const tip = el.querySelector(".skill-slot-hover");
        if (!tip) {
            return;
        }
        const rect = el.getBoundingClientRect();
        const panel = document.getElementById("tabPane_skills");
        const panelRect = panel ? panel.getBoundingClientRect() : null;
        const bounds = panelRect && panelRect.width > 0 ? panelRect : {
            left: 8,
            top: 8,
            right: window.innerWidth - 8,
            bottom: window.innerHeight - 8
        };
        const margin = 8;
        const tipW = tip.offsetWidth || 220;
        const tipH = tip.offsetHeight || 48;
        let left = rect.left;
        let top = rect.bottom + 4;
        if (left + tipW > bounds.right - margin) {
            left = rect.left - tipW - 4;
        }
        if (top + tipH > bounds.bottom - margin) {
            top = rect.top - tipH - 4;
        }
        const minLeft = bounds.left + margin;
        const minTop = bounds.top + margin;
        const maxLeft = Math.max(minLeft, bounds.right - margin - tipW);
        const maxTop = Math.max(minTop, bounds.bottom - margin - tipH);
        if (left < minLeft) {
            left = minLeft;
        } else if (left > maxLeft) {
            left = maxLeft;
        }
        if (top < minTop) {
            top = minTop;
        } else if (top > maxTop) {
            top = maxTop;
        }
        tip.style.left = left + "px";
        tip.style.top = top + "px";
    },
    positionLevelingStatTip: function(el) {
        if (!el || !el.querySelector) {
            return;
        }
        const tip = el.querySelector(".showthis");
        if (!tip) {
            return;
        }
        const rect = el.getBoundingClientRect();
        const margin = 8;
        const width = 280;
        let left = rect.left;
        if (left + width > window.innerWidth - margin) {
            left = Math.max(margin, window.innerWidth - margin - width);
        }
        if (left < margin) {
            left = margin;
        }
        tip.style.left = left + "px";
        tip.style.top = (rect.bottom + 4) + "px";
    },
    updateSkillEquipSlots: function() {
        const eq = skills.ensureSkillEquip();
        if (!eq) {
            return;
        }
        let anyFilled = false;
        const views = ["equipped", "library"];
        for (let vi = 0; vi < views.length; vi++) {
            const viewName = views[vi];
            const compact = viewName === "library";
            for (let c = 0; c < skills.SLOT_COLUMNS.length; c++) {
                const column = skills.SLOT_COLUMNS[c];
                view.updateColumnTalentTitle(viewName, column);
                const arr = eq.slots[column] || [];
                for (let i = 0; i < arr.length; i++) {
                    const key = arr[i];
                    const idPrefix = `skillSlot_${viewName}_${column}_${i}`;
                    const emptyEl = viewData.cached[`${idPrefix}_empty`];
                    const filledEl = viewData.cached[`${idPrefix}_filled`];
                    const slotEl = viewData.cached[idPrefix];
                    if (key) {
                        anyFilled = true;
                        const skill = data.progress.skills[key];
                        const slotCat = skills.getSlotCategory(key);
                        if (emptyEl) {
                            emptyEl.style.display = "none";
                        }
                        if (filledEl) {
                            filledEl.style.display = "";
                            const filledCls = `skill-equip-slot-filled showthat skill-equip-slot-filled--${slotCat || "any"}`;
                            if (filledEl.className !== filledCls) {
                                filledEl.className = filledCls;
                            }
                        }
                        if (slotEl) {
                            const selKey = viewName === "library"
                                ? data.progress.selectedLibrarySkillKey
                                : data.progress.selectedEquippedSkillKey;
                            slotEl.classList.toggle("skill-equip-slot--selected", !!key && key === selKey);
                        }
                        view.updateVal(`${idPrefix}_name`, skill ? skill.name : key);
                        const shortDesc = view.escapeHtml(skills.getSkillShortDescription(key) || "");
                        const currentFx = skills.skillEffectUiSummary(key, skill) || "";
                        view.updateVal(`${idPrefix}_tip`, `<div>${shortDesc}</div><div class="skill-current">${currentFx}</div>`, "innerHTML");
                        if (compact) {
                            view.updateVal(`${idPrefix}_talent`, skill ? `Talent ${skill.talentLevel}` : "");
                        } else {
                            view.updateVal(`${idPrefix}_meta`, skill ? `Lvl ${skill.level} · Talent ${skill.talentLevel}` : "");
                            const expPct = skill ? Math.min(100, Math.max(0, (skill.exp / skill.expToLevel) * 100)) : 0;
                            const talPct = skill ? Math.min(100, Math.max(0, (skill.talent / skill.talentToLevel) * 100)) : 0;
                            view.updateVal(`${idPrefix}_exp_fill`, `${expPct}%`, "style.width");
                            view.updateVal(`${idPrefix}_talent_fill`, `${talPct}%`, "style.width");
                            const stars = (skill && skill.stars) || {};
                            view.updateVal(`${idPrefix}_star_bronze`, stars.bronze ? "★" : "☆");
                            view.updateVal(`${idPrefix}_star_silver`, stars.silver ? "★" : "☆");
                            view.updateVal(`${idPrefix}_star_gold`, stars.gold ? "★" : "☆");
                            view.updateVal(`${idPrefix}_star_bronze`, !!stars.bronze, "classList.toggle", "skill-star-filled");
                            view.updateVal(`${idPrefix}_star_silver`, !!stars.silver, "classList.toggle", "skill-star-filled");
                            view.updateVal(`${idPrefix}_star_gold`, !!stars.gold, "classList.toggle", "skill-star-filled");
                        }
                    } else {
                        if (emptyEl) {
                            emptyEl.style.display = "";
                        }
                        if (filledEl) {
                            filledEl.style.display = "none";
                        }
                        if (slotEl) {
                            slotEl.classList.remove("skill-equip-slot--selected");
                        }
                    }
                }
            }
        }
        view.updateVal("skillsEquippedEmptyCta", anyFilled ? "none" : "", "style.display");
    },
    /** Sort and filter the library first, then place that sequence into the two columns. */
    updateSkillsListVisibility: function(selectedTab) {
        const tab = selectedTab !== undefined && selectedTab !== null ? selectedTab : (data.progress.selectedSkillsTab || "equipped");
        if (tab !== "library") {
            return;
        }
        const list = skills.getLibrarySkillKeys();
        const queryLower = String(viewData.skillListSearch || "").trim().toLowerCase();
        const visibleSet = {};
        for (let i = 0; i < list.length; i++) {
            const k = list[i];
            if (view.skillMatchesListSearch(k, queryLower)) {
                visibleSet[k] = true;
            }
        }
        const sortedAll = view.getSortedLibrarySkillKeys();
        const orderedVisible = [];
        for (let s = 0; s < sortedAll.length; s++) {
            if (visibleSet[sortedAll[s]]) {
                orderedVisible.push(sortedAll[s]);
            }
        }
        const leftCol = viewData.cached.skillsLibraryColLeft;
        const rightCol = viewData.cached.skillsLibraryColRight;
        const orderSig = orderedVisible.join(",");
        const needReorder = viewData.libraryListOrderSig !== orderSig;
        if (needReorder) {
            viewData.libraryListOrderSig = orderSig;
            const host = viewData.cached.skillsLibraryRowsHost;
            for (let i = 0; i < skills.keysInOrder.length; i++) {
                const k = skills.keysInOrder[i];
                if (visibleSet[k]) {
                    continue;
                }
                const wrap = viewData.cached[`skill_wrap_${k}`];
                if (!wrap) {
                    continue;
                }
                wrap.style.display = "none";
                if (host && wrap.parentElement !== host) {
                    host.appendChild(wrap);
                }
            }
            if (leftCol && rightCol) {
                for (let oi = 0; oi < orderedVisible.length; oi++) {
                    const wrap = viewData.cached[`skill_wrap_${orderedVisible[oi]}`];
                    if (!wrap) {
                        continue;
                    }
                    const targetCol = (oi % 2 === 0) ? leftCol : rightCol;
                    targetCol.appendChild(wrap);
                    wrap.style.display = "";
                }
            }
        } else {
            for (let oi = 0; oi < orderedVisible.length; oi++) {
                const wrap = viewData.cached[`skill_wrap_${orderedVisible[oi]}`];
                if (wrap && wrap.style.display === "none") {
                    wrap.style.display = "";
                }
            }
            for (let i = 0; i < skills.keysInOrder.length; i++) {
                const k = skills.keysInOrder[i];
                if (visibleSet[k]) {
                    continue;
                }
                const wrap = viewData.cached[`skill_wrap_${k}`];
                if (wrap && wrap.style.display !== "none") {
                    wrap.style.display = "none";
                }
            }
        }
        for (let oi = 0; oi < orderedVisible.length; oi++) {
            const k = orderedVisible[oi];
            const skill = data.progress.skills[k];
            const def = skills._byKey[k];
            view.updateVal(`skill_${k}_name`, skill ? skill.name : k);
            view.updateVal(`skill_${k}_talent_only`, skill ? `Talent ${skill.talentLevel}` : "");
            view.updateVal(`skill_${k}_class_tag`, (def && def.category === "class") ? "" : "none", "style.display");
            view.updateVal(`skill_${k}_equipped_badge`, skills.isSkillEquipped(k) ? "" : "none", "style.display");
        }
        view.syncSkillLockIcons();
        view.updateVal("skillsLibraryResearchedTitle", `Researched Skills - Showing: ${orderedVisible.length}`);
        view.applySkillListSortRadiosOnly();
        const emptyEl = viewData.cached.skillsListEmpty;
        if (!emptyEl) {
            return;
        }
        if (orderedVisible.length > 0) {
            emptyEl.style.display = "none";
            return;
        }
        emptyEl.style.display = "block";
        if (list.length > 0 && queryLower) {
            emptyEl.textContent = `No skills match “${String(viewData.skillListSearch || "").trim()}”.`;
            return;
        }
        emptyEl.textContent = "No classified skills researched yet. Visit the Scroll Archives in Base.";
    },
// Temporary patch fragment - applied by script then deleted.
    applySkillListSortRadiosOnly: function() {
        const sortMode = data.progress.skillListSort;
        const sort = sortMode === "talent" || sortMode === "alpha" || sortMode === "tips" || sortMode === "grouping"
            ? sortMode
            : "oldest";
        const map = {
            oldest: viewData.cached.skillSortOldest,
            talent: viewData.cached.skillSortTalent,
            alpha: viewData.cached.skillSortAlpha,
            tips: viewData.cached.skillSortTips,
            grouping: viewData.cached.skillSortGrouping
        };
        const keys = Object.keys(map);
        for (let i = 0; i < keys.length; i++) {
            const radio = map[keys[i]];
            if (radio) {
                radio.checked = keys[i] === sort;
            }
        }
    },
    applySkillListSort: function() {
        view.applySkillListSortRadiosOnly();
        if ((data.progress.selectedSkillsTab || "equipped") === "library") {
            view.updateSkillsListVisibility("library");
        }
    },
    syncSelectedSkillDetailKey: function() {
        if (typeof data.progress.selectedEquippedSkillKey !== "string") {
            data.progress.selectedEquippedSkillKey = "";
        }
        if (typeof data.progress.selectedLibrarySkillKey !== "string") {
            data.progress.selectedLibrarySkillKey = "";
        }
        if (data.progress.selectedEquippedSkillKey
            && !skills.isSkillEquipped(data.progress.selectedEquippedSkillKey)) {
            data.progress.selectedEquippedSkillKey = "";
        }
        if (data.progress.selectedLibrarySkillKey) {
            const list = skills.getLibrarySkillKeys();
            if (list.indexOf(data.progress.selectedLibrarySkillKey) < 0) {
                data.progress.selectedLibrarySkillKey = "";
            }
        }
    },
    applySkillDetailSelectionHighlight: function() {
        const libSel = data.progress.selectedLibrarySkillKey || "";
        const eqSel = data.progress.selectedEquippedSkillKey || "";
        for (let i = 0; i < skills.keysInOrder.length; i++) {
            const k = skills.keysInOrder[i];
            const wrap = viewData.cached[`skill_wrap_${k}`];
            if (wrap) {
                wrap.classList.toggle("skill-row--selected", k === libSel);
            }
        }
        const eq = skills.ensureSkillEquip();
        if (eq) {
            const views = ["equipped", "library"];
            for (let vi = 0; vi < views.length; vi++) {
                const viewName = views[vi];
                const selKey = viewName === "library" ? libSel : eqSel;
                for (let c = 0; c < skills.SLOT_COLUMNS.length; c++) {
                    const column = skills.SLOT_COLUMNS[c];
                    const arr = eq.slots[column] || [];
                    for (let i = 0; i < arr.length; i++) {
                        const slotEl = viewData.cached[`skillSlot_${viewName}_${column}_${i}`];
                        if (slotEl) {
                            slotEl.classList.toggle("skill-equip-slot--selected", !!arr[i] && arr[i] === selKey);
                        }
                    }
                }
            }
        }
    },
    updateLibraryInfoOverlaySide: function() {
        const panel = viewData.cached.skillInfoPanelLibrary;
        if (!panel) {
            return;
        }
        const side = viewData.libraryInfoOverlaySide || "right";
        panel.classList.toggle("skills-library-info-overlay--left", side === "left");
        panel.classList.toggle("skills-library-info-overlay--right", side === "right");
    },
    /** Equipped tab: full detail for selected equipped skill. */
    updateSkillInfoPanel: function() {
        if (typeof data.progress.selectedEquippedSkillKey !== "string") {
            data.progress.selectedEquippedSkillKey = "";
        }
        const skillKey = data.progress.selectedEquippedSkillKey;
        const skill = (skillKey && skills.isSkillEquipped(skillKey)) ? data.progress.skills[skillKey] : null;
        const pane = viewData.cached.skillsEquippedPane;
        if (pane) {
            pane.classList.toggle("skills-equipped-pane--no-selection", !skill);
        }
        if (!skill) {
            view.updateVal("skillInfoPanel", "none", "style.display");
            return;
        }
        view.updateVal("skillInfoPanel", "", "style.display");
        const parts = skills.skillExpGainParts(skill);
        const equippedMult = typeof skills.equippedSkillExpMultiplier === "function"
            ? skills.equippedSkillExpMultiplier(skillKey)
            : (typeof skills.getOtherSkillExpMultiplier === "function"
                ? skills.getOtherSkillExpMultiplier(skillKey)
                : (skillKey !== "echoChamber" ? skills.getEchoChamberExpMultiplierForOthers() : 1));
        const soulMult = engine.getSoulSkillExpMultiplier();
        const expPerTrigger = skills.expGainForSkillTrigger(skill, 1) * equippedMult * soulMult;
        const expPct = Math.min(100, Math.max(0, (skill.exp / skill.expToLevel) * 100));
        const talPct = Math.min(100, Math.max(0, (skill.talent / skill.talentToLevel) * 100));
        const tipsVal = skill.tips || 0;
        view.updateVal("skillInfo_title", skill.name);
        const groupingInput = viewData.cached.skillInfo_grouping;
        if (groupingInput && document.activeElement !== groupingInput) {
            const grouping = Math.max(0, Math.min(99, Math.floor(Number(skill.grouping) || 0)));
            if (groupingInput.value !== String(grouping)) {
                groupingInput.value = String(grouping);
            }
        }
        const sum = skills.skillEffectUiSummary(skillKey, skill);
        if (sum) {
            view.updateVal("skillInfo_current", sum, "innerHTML");
            view.updateVal("skillInfo_current_wrap", "", "style.display");
        } else {
            view.updateVal("skillInfo_current", "", "innerHTML");
            view.updateVal("skillInfo_current_wrap", "none", "style.display");
        }
        view.updateVal("skillInfo_reward", skills.getSkillRewardText(skillKey, skill), "innerHTML");
        view.updateVal("skillInfo_trigger", skills.getSkillTriggerDescription(skillKey), "innerHTML");
        const def = skills._byKey[skillKey];
        const baseSkillExp = def && def.initialExpToLevel !== undefined ? def.initialExpToLevel : 5;
        const baseTalentExp = def && def.initialTalentToLevel !== undefined ? def.initialTalentToLevel : 10;
        view.updateVal("skillInfo_base_exp", `Base Skill Exp: ${baseSkillExp}, Base Talent Exp: ${baseTalentExp}`);
        view.updateVal("skillInfo_exp_on_trigger", `Exp on trigger: ${round2(expPerTrigger)}`);
        view.updateVal("skillInfo_exp_mults", `· Skill level x${parts.levelMult.toFixed(4)}`);
        view.updateVal("skillInfo_exp_text", `${round1Fixed(skill.exp)} / ${round1Fixed(skill.expToLevel)}`);
        view.updateVal("skillInfo_exp_fill", `${expPct}%`, "style.width");
        view.updateVal("skillInfo_talent_text", `${round1Fixed(skill.talent)} / ${round1Fixed(skill.talentToLevel)} (Lv ${skill.talentLevel}) · exp x${parts.talentMult.toFixed(4)}`);
        view.updateVal("skillInfo_talent_fill", `${talPct}%`, "style.width");
        const starMult = parts.starMult || 1;
        view.updateVal("skillInfo_star_effect_row", starMult > 1 ? "" : "none", "style.display");
        view.updateVal("skillInfo_star_effect", `x${starMult.toFixed(4)}`);
        view.updateVal("skillInfo_tips_row", tipsVal > 0 ? "" : "none", "style.display");
        view.updateVal("skillInfo_tips_text", `${tipsVal}, Tip Exp Bonus: x${parts.tipsMult.toFixed(2)}`);
        view.updateVal("skillInfo_tips_mults", "");
        const showOtherSkillMult = equippedMult > 1.0000001;
        if (showOtherSkillMult) {
            view.updateVal("skillInfo_integration_mult", `x${equippedMult.toFixed(4)}`);
            view.updateVal("skillInfo_integration_row", "", "style.display");
        } else {
            view.updateVal("skillInfo_integration_row", "none", "style.display");
        }
        view.updateVal("skillInfo_combined_mults", `x${(parts.combinedMult * equippedMult).toFixed(4)}`);
        view.updateVal("skillInfo_flavor", skills.getSkillFlavorText(skillKey), "innerHTML");
    },
    updateLibrarySkillInfoPanel: function() {
        if (typeof data.progress.selectedLibrarySkillKey !== "string") {
            data.progress.selectedLibrarySkillKey = "";
        }
        const skillKey = data.progress.selectedLibrarySkillKey;
        if (!skillKey || skills.getLibrarySkillKeys().indexOf(skillKey) < 0) {
            view.updateVal("skillInfoPanelLibrary", "none", "style.display");
            return;
        }
        const skill = data.progress.skills[skillKey];
        if (!skill) {
            view.updateVal("skillInfoPanelLibrary", "none", "style.display");
            return;
        }
        view.updateVal("skillInfoPanelLibrary", "", "style.display");
        view.updateLibraryInfoOverlaySide();
        const parts = skills.skillExpGainParts(skill);
        const talPct = Math.min(100, Math.max(0, (skill.talent / skill.talentToLevel) * 100));
        const tipsVal = skill.tips || 0;
        view.updateVal("libSkillInfo_title", skill.name);
        const groupingInput = viewData.cached.libSkillInfo_grouping;
        if (groupingInput && document.activeElement !== groupingInput) {
            const grouping = Math.max(0, Math.min(99, Math.floor(Number(skill.grouping) || 0)));
            if (groupingInput.value !== String(grouping)) {
                groupingInput.value = String(grouping);
            }
        }
        view.updateVal("libSkillInfo_reward", skills.getSkillRewardText(skillKey, skill), "innerHTML");
        view.updateVal("libSkillInfo_trigger", skills.getSkillTriggerDescription(skillKey), "innerHTML");
        const def = skills._byKey[skillKey];
        const baseSkillExp = def && def.initialExpToLevel !== undefined ? def.initialExpToLevel : 5;
        const baseTalentExp = def && def.initialTalentToLevel !== undefined ? def.initialTalentToLevel : 10;
        view.updateVal("libSkillInfo_base_exp", `Base Skill Exp: ${baseSkillExp}, Base Talent Exp: ${baseTalentExp}`);
        view.updateVal("libSkillInfo_talent_text", `${round1Fixed(skill.talent)} / ${round1Fixed(skill.talentToLevel)} (Lv ${skill.talentLevel}) · exp x${parts.talentMult.toFixed(4)}`);
        view.updateVal("libSkillInfo_talent_fill", `${talPct}%`, "style.width");
        view.updateVal("libSkillInfo_tips_row", tipsVal > 0 ? "" : "none", "style.display");
        view.updateVal("libSkillInfo_tips_text", `${tipsVal}, Tip Exp Bonus: x${parts.tipsMult.toFixed(2)}`);
        view.updateVal("libSkillInfo_unequipBtn", skills.isSkillEquipped(skillKey) ? "" : "none", "style.display");
        const echoesBought = engine.getSkillEchoesBought();
        const lib = data.progress.base && data.progress.base.scrollArchives;
        const lockedKeys = (lib && lib.lockedSkillKeys) || [];
        const isLocked = lockedKeys.indexOf(skillKey) >= 0;
        view.updateVal("libSkillInfo_lockBtn", echoesBought >= 1 ? "" : "none", "style.display");
        view.updateVal("libSkillInfo_lockBtn", isLocked ? "Unlock" : "Lock");
        view.updateVal("libSkillInfo_lockBtn", !isLocked && lockedKeys.length >= echoesBought, "disabled");
        view.syncSkillLockIcons();
    },
    syncSkillLockIcons: function() {
        const lib = data.progress.base && data.progress.base.scrollArchives;
        const lockedKeys = (lib && lib.lockedSkillKeys) || [];
        for (let i = 0; i < skills.keysInOrder.length; i++) {
            const key = skills.keysInOrder[i];
            view.updateVal(`skill_${key}_lock`, lockedKeys.indexOf(key) >= 0 ? "" : "none", "style.display");
        }
    },
    updateSkillSubTabs: function() {
        const tab = data.progress.selectedSkillsTab || "equipped";
        view.updateVal("skillSubTab_equipped", tab === "equipped" ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
        view.updateVal("skillSubTab_library", tab === "library" ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
    },
    updatePlayerBattleBars: function() {
        const p = data.battle.player;
        const ls = data.battle.levelState;
        const atkFill = viewData.cached.playerAttackBarFill;
        const atkLabel = viewData.cached.playerAttackBarLabel;
        const rngFill = viewData.cached.playerSandalBarFill;
        const rngTrack = viewData.cached.playerSandalBarTrack;
        const rngLabel = viewData.cached.playerSandalBarLabel;
        const lvlFill = viewData.cached.playerLevelBarFill;
        const lvlLabel = viewData.cached.playerLevelBarLabel;
        const classAWrap = viewData.cached.playerClassBarA;
        const classAWrapFill = viewData.cached.playerClassBarAFill;
        const classALabel = viewData.cached.playerClassBarALabel;
        const classBWrap = viewData.cached.playerClassBarB;
        const classBWrapFill = viewData.cached.playerClassBarBFill;
        const classBLabel = viewData.cached.playerClassBarBLabel;
        if (atkFill && atkLabel) {
            const cd = typeof engine.getEffectiveSlapCooldownMs === "function" ? engine.getEffectiveSlapCooldownMs() : p.attackCooldownMs;
            const atkRemain = Math.max(0, p.attackTimerMs);
            const atkPct = 100 - Math.max(0, Math.min(100, (atkRemain / cd) * 100));
            atkFill.style.width = `${atkPct}%`;
            const atkElapsed = cd - atkRemain;
            const cls = data.progress.currentClassKey || "none";
            const atkName = (cls === "condescend" && (data.battle.classPowerA || 0) >= 1000) ? "Power slap" : "Slap";
            view.updateVal("playerAttackBarLabel", `${atkName} ${Math.round(atkElapsed)} / ${Math.round(cd)} ms`);
        }
        if (rngFill && rngLabel) {
            if (data.battle.state !== "running") {
                rngFill.style.width = "0%";
                rngLabel.textContent = "\u2014";
            } else {
                const pushPx = typeof engine.getIntruderPushBonusPxPerSecond === "function"
                    ? engine.getIntruderPushBonusPxPerSecond()
                    : gameData.battle.idlePushBonusPxPerSecond;
                const timeRate = typeof engine.getBattleTimeRateMultiplier === "function"
                    ? engine.getBattleTimeRateMultiplier()
                    : 1;
                const sandalOn = !!(data.progress.sandalAttackEnabled && data.progress.base && data.progress.base.atelier && data.progress.base.atelier.sandalBuilt && (data.progress.currentClassKey || "none") !== "scold");
                const idlePush = pushPx > 0;
                if (sandalOn) {
                    if (rngTrack) {
                        rngTrack.style.display = "";
                    }
                    if (timeRate > 1) {
                        rngFill.style.width = "100%";
                        view.updateVal("playerSandalBarLabel", `Battle time x${round2(timeRate)} (no visible enemies)`);
                    } else {
                        const rcd = typeof engine.getEffectiveSandalCooldownMs === "function" ? engine.getEffectiveSandalCooldownMs() : (p.sandalAttackCooldownMs || 4000);
                        const rRemain = Math.max(0, p.sandalAttackTimerMs || 0);
                        const rPct = 100 - Math.max(0, Math.min(100, (rRemain / rcd) * 100));
                        rngFill.style.width = `${rPct}%`;
                        const rElapsed = rcd - rRemain;
                        view.updateVal("playerSandalBarLabel", `Sandal attack ${intToString(rElapsed, 3)} / ${intToString(rcd, 3)} ms`);
                    }
                } else if (idlePush) {
                    if (rngTrack) {
                        rngTrack.style.display = "none";
                    }
                    rngFill.style.width = "0%";
                    view.updateVal("playerSandalBarLabel", `Move speed +${intToString(pushPx, 3)} ft/s`);
                } else {
                    if (rngTrack) {
                        rngTrack.style.display = "none";
                    }
                    rngFill.style.width = "0%";
                    view.updateVal("playerSandalBarLabel", "Intruder in range");
                }
            }
        }
        const movePulse = viewData.cached.playerMovePulse;
        if (movePulse) {
            const pushPx = typeof engine.getIntruderPushBonusPxPerSecond === "function"
                ? engine.getIntruderPushBonusPxPerSecond()
                : 0;
            const currentAud = data.battle.player ? data.battle.player.aud : 0;
            const prevAud = viewData.prevValues.playerPulsePrevAud !== undefined ? viewData.prevValues.playerPulsePrevAud : currentAud;
            const takingDamageNow = currentAud < prevAud;
            viewData.prevValues.playerPulsePrevAud = currentAud;
            const movingForward = pushPx > 0;
            movePulse.classList.toggle("move-pulse-active", movingForward && !takingDamageNow);
        }
        view.updatePlayerStatDmgLine();
        if (lvlFill && lvlLabel) {
            const chapel = data.progress.base && data.progress.base.bonfire;
            const growthUnlocked = !!(chapel && chapel.growthBlessingUnlocked);
            view.updateVal("playerLevelBar", growthUnlocked ? "" : "none", "style.display");
            const lvlPct = ls.expToLevel > 0 ? Math.max(0, Math.min(100, (ls.exp / ls.expToLevel) * 100)) : 0;
            lvlFill.style.width = `${lvlPct}%`;
            view.updateVal("playerLevelBarLabel", `Level ${intToString(ls.level, 1)} | ${intToString(ls.exp, 3)} / ${intToString(ls.expToLevel, 3)} exp`);
        }
        const cls = data.progress.currentClassKey || "none";
        const showClassBars = cls !== "none";
        view.updateVal("playerClassBarA", showClassBars ? "" : "none", "style.display");
        view.updateVal("playerClassBarB", showClassBars ? "" : "none", "style.display");
        if (showClassBars && classAWrapFill && classBWrapFill && classALabel && classBLabel) {
            const a = data.battle.classPowerA || 0;
            const b = data.battle.classPowerB || 0;
            const aPct = Math.max(0, Math.min(100, (a / 1000) * 100));
            const bPct = Math.max(0, Math.min(100, (b / 1000) * 100));
            classAWrapFill.style.width = `${aPct}%`;
            classBWrapFill.style.width = `${bPct}%`;
            if (cls === "condescend") {
                view.updateVal("playerClassBarALabel", `Power strike ${intToStringRound(a)} / 1000`);
                view.updateVal("playerClassBarBLabel", `Block ${intToStringRound(b)} / 1000`);
            } else if (cls === "mock") {
                view.updateVal("playerClassBarALabel", `Multistrike ${intToStringRound(a)} / 1000`);
                const retreatTxt = (data.battle.classRetreatMs || 0) > 0 ? ` (retreat ${round1((data.battle.classRetreatMs || 0) / 1000)}s)` : "";
                view.updateVal("playerClassBarBLabel", `Tactical retreat ${intToStringRound(b)} / 1000${retreatTxt}`);
            } else if (cls === "scold") {
                const dashTxt = data.battle.scoldDashActive ? " (active)" : "";
                view.updateVal("playerClassBarALabel", `Dash ${intToStringRound(a)} / 1000${dashTxt}`);
                const flurryTxt = (data.battle.scoldFlurryMs || 0) > 0 ? ` (flurry ${round1((data.battle.scoldFlurryMs || 0) / 1000)}s)` : "";
                view.updateVal("playerClassBarBLabel", `Flurry strike ${intToStringRound(b)} / 1000${flurryTxt}`);
            }
        }
    },
    updateCardsSubTabs: function() {
        let tab = data.progress.selectedCardsSubTab || "get";
        if (tab !== "get" && tab !== "bonuses") {
            tab = "get";
        }
        data.progress.selectedCardsSubTab = tab;
        view.updateVal("cardsSubTab_get", tab === "get" ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
        view.updateVal("cardsSubTab_bonuses", tab === "bonuses" ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
        view.updateVal("cardsPane_get", tab === "get" ? "" : "none", "style.display");
        view.updateVal("cardsPane_bonuses", tab === "bonuses" ? "" : "none", "style.display");
    },
    updateBuyCardButton: function() {
        if (typeof shrineCards !== "undefined" && shrineCards.buyCardOddsText) {
            view.updateVal("shrineBuyCardOdds", shrineCards.buyCardOddsText());
        }
        const cost = { divinity: (typeof shrineCards !== "undefined" && shrineCards.buyPackDivinityCost) || 30000 };
        const label = resortData.buyForFromCost(cost);
        const afford = resortData.canAffordCost(cost);
        view.updateVal("shrineBuyCardBtn", label, "innerHTML");
        view.updateVal("shrineBuyCardBtn", !afford, "disabled");
        const btn = viewData.cached.shrineBuyCardBtn;
        if (btn) {
            btn.classList.toggle("upgrade-btn-ready", afford);
        }
    },
    updateOpenPacksButton: function() {
        const shrine = data.progress.base && data.progress.base.shrine;
        const session = shrine && shrine.prestigeSession;
        const active = !!(session && session.active);
        const unfinished = active && session.phase !== "summary";
        const resumable = unfinished && !viewData.packOverlayOpen;
        const packs = shrine && typeof shrineCards !== "undefined" ? shrineCards.totalPacks(shrine) : 0;
        view.updateVal("shrineOpenPacksBtn", resumable ? "Resume Opening Packs" : "Open Packs");
        view.updateVal("shrineOpenPacksBtn", !resumable && packs < 1, "disabled");
    },
    updateShrineClassControls: function() {
        const shrine = (data.progress.base && data.progress.base.shrine) || {};
        const selected = shrine.selectedClassKey || "none";
        const showClass = typeof isDebug !== "undefined" && !!isDebug;
        view.updateVal("shrineClassDebugBlock", showClass ? "" : "none", "style.display");
        const classLocked = selected !== "none";
        if (typeof bonfireClassOrder !== "undefined") {
            for (let ci = 0; ci < bonfireClassOrder.length; ci++) {
                const ck = bonfireClassOrder[ci];
                view.updateVal(`shrine_class_btn_${ck}`, selected === ck, "classList.toggle", "shrine-class-btn--selected");
                view.updateVal(`shrine_class_btn_${ck}`, classLocked && selected === ck, "classList.toggle", "shrine-class-btn--demo-locked");
            }
        }
        view.updateVal("shrineClassDemoNote", showClass && classLocked ? "" : "none", "style.display");
        view.updateLegendPanel();
        if (typeof events !== "undefined" && events.syncShrineMoveControls) {
            events.syncShrineMoveControls();
        }
    },
    updateLegendPanel: function() {
        const written = Math.max(0, Math.floor((data.progress && data.progress.legendsWritten) || 0));
        const nextNumber = written + 1;
        const req = shrineCards.legendStarRequirement(written);
        const stars = engine.getTotalEarnedStarsCount();
        const hasNext = shrineCards.hasNextLegend(written);
        const ready = stars >= req && hasNext;
        const legendText = function(n) {
            return String(shrineCards.legendEffectText(n))
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\n/g, "<br>");
        };
        view.updateVal("legendRequirementPrefix", `Write Legend ${nextNumber}: ${req} Stars, `);
        view.updateVal("legendCurrentStars", `Current Stars: ${stars}`);
        view.updateVal("legendCurrentStars", stars >= req, "classList.toggle", "legend-current-stars--ready");
        view.updateVal("legendCurrentStars", stars < req, "classList.toggle", "legend-current-stars--short");
        view.updateVal("legendStarWarning", stars >= req ? "none" : "", "style.display");
        view.updateVal("legendWipWarning", hasNext ? "none" : "", "style.display");
        const gain = (typeof engine.getCombatPrestigeMaxDivinityGain === "function")
            ? engine.getCombatPrestigeMaxDivinityGain()
            : 0;
        view.updateVal("legendMaxDivinityGainValue", gain, "textContent", "floor");
        view.updateVal("legendPenalty_row", engine.getLegendPenaltyText(), "textContent");
        const parts = [];
        parts.push(`<div class="legend-card ${ready ? "legend-card--ready" : "legend-card--short"}"><div class="legend-card-title">Legend ${nextNumber}</div><div class="legend-card-text">${legendText(nextNumber)}</div></div>`);
        for (let n = written; n >= 1; n--) {
            parts.push(`<div class="legend-card legend-card--written"><div class="legend-card-title">Legend ${n}</div><div class="legend-card-text">${legendText(n)}</div></div>`);
        }
        view.updateVal("legendList", parts.join(""), "innerHTML");
    },
    syncOpenPackSession: function() {
        if (!viewData.packOverlayOpen) {
            return;
        }
        const shrine = data.progress.base && data.progress.base.shrine;
        const session = shrine && shrine.prestigeSession;
        if (!session || !session.active) {
            viewData.packOverlayOpen = false;
            view.renderPrestigePackPanel();
            return;
        }
        if (session.phase === "summary" && shrineCards.nextUnopenedPackRarity(shrine)) {
            events.openNextPrestigePack(shrine, session);
            saving.save();
        }
        view.renderPrestigePackPanel();
    },
    updateCardBonusesTab: function() {
        view.updateCardsSubTabs();
        view.updateBuyCardButton();
        view.updateOpenPacksButton();
        view.updateShrinePackDisplays();
        const list = viewData.cached.cardBonusesList || document.getElementById("cardBonusesList");
        const emptyEl = viewData.cached.cardBonusesEmpty || document.getElementById("cardBonusesEmpty");
        if (!list) {
            return;
        }
        if (typeof shrineCards === "undefined") {
            if (emptyEl) {
                emptyEl.style.display = "";
            }
            list.innerHTML = "";
            return;
        }
        const keys = shrineCards.getReceivedKeys();
        if (!keys.length) {
            if (emptyEl) {
                emptyEl.style.display = "";
            }
            list.innerHTML = "";
            return;
        }
        if (emptyEl) {
            emptyEl.style.display = "none";
        }
        const rarityImgs = {
            common: "img/common.svg",
            rare: "img/rare.svg",
            epic: "img/epic.svg"
        };
        const rarityLabels = {
            common: "C",
            rare: "R",
            epic: "E"
        };
        let html = "";
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const def = shrineCards._byKey[key];
            if (!def) {
                continue;
            }
            html += `<div class="card-bonuses-row" data-card-key="${key}">`;
            html += `<div class="card-bonuses-rarities">`;
            for (let ri = 0; ri < shrineCards.rarityOrder.length; ri++) {
                const rarity = shrineCards.rarityOrder[ri];
                if (def.rarity[rarity] === undefined) {
                    html += `<span class="card-bonuses-rarity card-bonuses-rarity--empty"></span>`;
                    continue;
                }
                const owned = shrineCards.getOwned(key, rarity);
                const max = def.rarity[rarity];
                const maxText = shrineCards.formatMax(max);
                html += `<span class="card-bonuses-rarity card-bonuses-rarity--${rarity}">`;
                html += `<img class="shrine-pack-icon" src="${rarityImgs[rarity]}" alt="${rarity}" draggable="false">`;
                html += `<span class="card-bonuses-rarity-count">${rarityLabels[rarity]} ${owned}/${maxText}</span>`;
                html += `</span>`;
            }
            html += `</div>`;
            html += `<div class="card-bonuses-bonus-text">${shrineCards.getRowBonusText(key)}</div>`;
            html += `</div>`;
        }
        if (list.innerHTML !== html) {
            list.innerHTML = html;
        }
    },
    updatePrestigeTab: function() {
        view.updateShrineClassControls();
    },
    updateTabButtons: function(activeTab) {
        const tabs = events.mainMenuTabOrder();
        const allTabs = ["base", "guests", "leveling", "stats", "skills", "travel", "history", "cardBonuses", "prestige", "options"];
        const notify = data.progress.baseContentNotify;
        for (let i = 0; i < allTabs.length; i++) {
            const tabKey = allTabs[i];
            const id = `tabButton_${tabKey}`;
            const isVisible = tabs.indexOf(tabKey) >= 0;
            const isActive = tabKey === activeTab;
            view.updateVal(id, isVisible ? "" : "none", "style.display");
            view.updateVal(id, isActive ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
            if (isVisible && tabKey !== "base" && tabKey !== "options" && !notify.tabSeen[tabKey]) {
                if (!notify.tab[tabKey]) {
                    events.markTabNotify(tabKey);
                }
            }
            const badgeId = "tabNotifyBadge_" + tabKey;
            const needTabNotify = !!(notify.tab && notify.tab[tabKey]);
            if (viewData.cached[badgeId]) {
                view.updateVal(badgeId, needTabNotify ? "" : "none", "style.display");
            }
            view.updateVal(id, needTabNotify, "classList.toggle", "tab-button--notify");
        }
        let packLabel = "Cards";
        if (typeof shrineCards !== "undefined" && engine.isShrineBuilt && engine.isShrineBuilt()) {
            const shrine = data.progress.base && data.progress.base.shrine;
            const packs = shrineCards.totalPacks(shrine);
            if (packs >= 1) {
                packLabel = `Cards (${packs})`;
            }
        }
        view.setTabButtonLabel("cardBonuses", packLabel);
        let skillsLabel = "Skills";
        if (typeof skills !== "undefined" && skills.countEmptyEquipSlots) {
            const emptySlots = skills.countEmptyEquipSlots();
            if (emptySlots >= 1) {
                skillsLabel = `Skills (${emptySlots})`;
            }
        }
        view.setTabButtonLabel("skills", skillsLabel);
    },
    setTabButtonLabel: function(tabKey, text) {
        const btn = viewData.cached["tabButton_" + tabKey] || document.getElementById("tabButton_" + tabKey);
        if (!btn) {
            return;
        }
        let label = btn.querySelector(".tab-button-label");
        if (!label) {
            label = document.createElement("span");
            label.className = "tab-button-label";
            const textNodes = [];
            for (let i = 0; i < btn.childNodes.length; i++) {
                if (btn.childNodes[i].nodeType === 3 && btn.childNodes[i].textContent.trim()) {
                    textNodes.push(btn.childNodes[i]);
                }
            }
            if (textNodes.length) {
                btn.insertBefore(label, textNodes[0]);
                for (let t = 0; t < textNodes.length; t++) {
                    textNodes[t].remove();
                }
            } else {
                btn.insertBefore(label, btn.firstChild);
            }
        }
        if (label.textContent !== text) {
            label.textContent = text;
        }
    },
    repositionBaseBuildingInfo: function() {
        const panel = viewData.cached.baseBuildingInfo;
        if (!panel) {
            return;
        }
        const compactBreakpointPx = 1420;
        const forceWide = !!(data.progress.options && data.progress.options.disableCompactLayout);
        const compactOn = !forceWide && window.innerWidth < compactBreakpointPx;
        if (compactOn) {
            const menuContent = viewData.cached.menuContent;
            if (menuContent && panel.parentElement !== menuContent) {
                menuContent.appendChild(panel);
            }
            panel.classList.remove("base-info-on-battle");
            panel.classList.add("base-info-on-menu");
        } else {
            const battleCol = viewData.cached.battleColumn;
            if (battleCol && panel.parentElement !== battleCol) {
                battleCol.appendChild(panel);
            }
            panel.classList.remove("base-info-on-menu");
            panel.classList.add("base-info-on-battle");
        }
    },
    updateWorkerDockVisibility: function() {
        const dock = viewData.cached.baseBuildingInfoWorkerDock;
        const selected = data.progress && data.progress.selectedBaseBuilding;
        const keys = resortData.workerDockSiteKeys || [];
        let anyVisible = false;
        for (let i = 0; i < keys.length; i++) {
            const sk = keys[i];
            let show = selected === sk;
            if (sk === "cistern" && !engine.cisternWorkersRevealed()) {
                show = false;
            }
            if (sk === "inn" && !engine.isInnOnsenConverted()) {
                show = false;
            }
            if (sk === "bonfire" && !engine.isBonfireTendTheFlameUnlocked()) {
                show = false;
            }
            if (sk === "market" && !engine.isMarketBuilt()) {
                show = false;
            }
            if (sk === "scrollArchives") {
                const sectionOnly = viewData.cached[`workerDock_${sk}`] || document.getElementById(`workerDock_${sk}`);
                if (sectionOnly) {
                    sectionOnly.style.display = selected === sk ? "" : "none";
                }
                continue;
            }
            const sectionEl = viewData.cached[`workerDock_${sk}`] || document.getElementById(`workerDock_${sk}`);
            if (sectionEl) {
                sectionEl.style.display = show ? "" : "none";
            }
            if (show) {
                anyVisible = true;
            }
        }
        if (dock) {
            dock.style.display = anyVisible ? "" : "none";
        }
    },
    updateBattleVisibility: function() {
        const showBattle = !!(data.progress && data.progress.showBattle);
        view.updateVal("battlefieldWrap", showBattle ? "" : "none", "style.display");
        view.updateVal("battleHud", showBattle ? "" : "none", "style.display");
    },
    syncSpiritInfoCompactCollapse: function() {
        const infoPanel = viewData.cached.baseBuildingInfo;
        const toggle = viewData.cached.baseBuildingInfoHideToggle;
        const infoType = data.progress
            ? (data.progress.selectedResortInfoType || data.progress.selectedBaseBuilding || "")
            : "";
        const isSpirit = infoType === "spirit" && !!data.progress.selectedSpiritId;
        const forceWide = !!(data.progress && data.progress.options && data.progress.options.disableCompactLayout);
        const compactOn = !forceWide && window.innerWidth < 1420;
        const showToggle = compactOn && isSpirit;
        const collapsed = showToggle && !!viewData.spiritInfoCollapsedCompact;
        if (toggle) {
            toggle.style.display = showToggle ? "" : "none";
            toggle.textContent = collapsed ? "Show Info" : "Hide Info";
            toggle.title = collapsed ? "Show Info" : "Hide Info";
        }
        if (infoPanel) {
            infoPanel.classList.toggle("base-info-has-hide-toggle", showToggle && !collapsed);
            infoPanel.classList.toggle("base-info-spirit-collapsed", collapsed);
        }
    },
    updateBaseBuildingInfoLayout: function() {
        const selected = !!(data.progress && data.progress.selectedBaseBuilding);
        const infoPanel = viewData.cached.baseBuildingInfo;
        view.repositionBaseBuildingInfo();
        if (infoPanel) {
            infoPanel.style.display = selected ? "flex" : "none";
        }
        view.updateWorkerDockVisibility();
        view.syncSpiritInfoCompactCollapse();
    },
    /** True when baseResortMap (carriers/okami/weaving) is on-screen. Matches updateCompactLayout menuColumn rules. */
    isResortMapVisible: function() {
        if ((data.battle.currentTab || "base") !== "base") {
            return false;
        }
        const compactBreakpointPx = 1420;
        const forceWide = !!(data.progress.options && data.progress.options.disableCompactLayout);
        const compactOn = !forceWide && window.innerWidth < compactBreakpointPx;
        if (!compactOn) {
            return true;
        }
        const selected = !!(data.progress && data.progress.selectedBaseBuilding);
        if (selected) {
            return true;
        }
        const showBattle = !!(data.progress && data.progress.showBattle);
        if (!showBattle) {
            return true;
        }
        const pane = data.progress.compactViewPane || "menus";
        return pane === "menus";
    },
    /** True when the battle column/battlefield is on-screen. Matches updateCompactLayout battleColumn rules. */
    isBattleVisible: function() {
        if (!(data.progress && data.progress.showBattle)) {
            return false;
        }
        const compactBreakpointPx = 1420;
        const forceWide = !!(data.progress.options && data.progress.options.disableCompactLayout);
        const compactOn = !forceWide && window.innerWidth < compactBreakpointPx;
        if (!compactOn) {
            return true;
        }
        if (data.progress.selectedBaseBuilding) {
            return false;
        }
        const pane = data.progress.compactViewPane || "menus";
        return pane === "battle";
    },
    updateCompactLayout: function() {
        view.updateBattleVisibility();
        const showBattle = !!(data.progress && data.progress.showBattle);
        const selected = !!(data.progress && data.progress.selectedBaseBuilding);
        const showBattleColumn = showBattle || selected;
        const compactBreakpointPx = 1420;
        const forceWide = !!(data.progress.options && data.progress.options.disableCompactLayout);
        const compactOn = !forceWide && window.innerWidth < compactBreakpointPx;
        const pane = data.progress.compactViewPane || "menus";

        view.updateVal("compactViewTabs", compactOn && showBattle ? "flex" : "none", "style.display");
        if (compactOn) {
            if (selected) {
                view.updateVal("menuColumn", "", "style.display");
                view.updateVal("battleColumn", "none", "style.display");
            } else if (showBattle) {
                view.updateVal("menuColumn", pane === "menus" ? "" : "none", "style.display");
                view.updateVal("battleColumn", pane === "battle" ? "" : "none", "style.display");
            } else {
                view.updateVal("menuColumn", "", "style.display");
                view.updateVal("battleColumn", "none", "style.display");
            }
        } else {
            view.updateVal("menuColumn", "", "style.display");
            view.updateVal("battleColumn", showBattleColumn ? "" : "none", "style.display");
        }
        view.updateVal("compactPane_menus", pane === "menus" ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
        view.updateVal("compactPane_battle", pane === "battle" ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
        view.updateBaseBuildingInfoLayout();
    },
    renderBattlefield: function() {
        createView.syncBattlefieldLayoutFromDom();
        const activeIds = {};
        const battlefield = viewData.cached.battlefield;
        const lm = engine.getBattleLaneMetrics();
        const alpha = data.gameSettings.renderAlpha ?? 1;

        for (let i = 0; i < data.battle.enemies.length; i++) {
            const intruder = data.battle.enemies[i];
            if (!engine.intruderIntersectsBattlefield(intruder)) {
                continue;
            }
            const intruderId = intruder.id;
            activeIds[intruderId] = true;
            let intruderEl = viewData.activeIntruderElements[intruderId];
            if (!intruderEl) {
                intruderEl = view.acquireIntruderElement();
                intruderEl.id = `intruder_${intruderId}`;
                viewData.activeIntruderElements[intruderId] = intruderEl;
                battlefield.appendChild(intruderEl);
            }
            const laneCenter = lm.inset + (intruder.lane + 0.5) * lm.laneWidth;
            const leftPx = Math.round(laneCenter - (intruder.sizePx / 2));
            let renderY = intruder.yPx;
            if (data.battle.state === "running" && !data.gameSettings.stop) {
                renderY = (intruder.prevYPx !== undefined) ? (intruder.prevYPx + ((intruder.yPx - intruder.prevYPx) * alpha)) : intruder.yPx;
            } else {
                intruder.prevYPx = intruder.yPx;
            }
            const audPct = Math.max(0, intruder.aud / intruder.maxAud) * 100;
            let renderCache = viewData.intruderRenderCache[intruderId];
            if (!renderCache) {
                renderCache = viewData.intruderRenderCache[intruderId] = {};
            }
            const sizeKey = `${intruder.sizePx}`;
            if (renderCache.sizeKey !== sizeKey) {
                intruderEl.style.width = `${intruder.sizePx}px`;
                intruderEl.style.height = `${intruder.sizePx}px`;
                renderCache.sizeKey = sizeKey;
            }
            view.setGpuPos(intruderEl, leftPx, Math.round(renderY), renderCache, false);
            const shapeLayer = intruderEl.querySelector(".intruder-shape-layer");
            if (shapeLayer) {
                const lecherOn = intruder.intruderType === "lecher";
                const spriteImg = shapeLayer.querySelector(".intruder-sprite-img");
                if (spriteImg) {
                    const spriteSrc = lecherOn ? "img/lecher.svg" : "img/scoundrel.svg";
                    if (renderCache.spriteSrc !== spriteSrc) {
                        spriteImg.src = spriteSrc;
                        spriteImg.style.display = "";
                        renderCache.spriteSrc = spriteSrc;
                    }
                }
                if (renderCache.lecherOn !== lecherOn) {
                    shapeLayer.classList.toggle("intruder-token-lecher", lecherOn);
                    renderCache.lecherOn = lecherOn;
                }
            }
            const audLayer = view.ensureIntruderAudFill(intruderEl);
            if (audLayer) {
                const lecherAud = intruder.intruderType === "lecher";
                const audScale = Math.round(Math.max(0, Math.min(1, audPct / 100)) * 1000) / 1000;
                const audKey = `${lecherAud ? 1 : 0}|${audScale}`;
                if (renderCache.audKey !== audKey) {
                    audLayer.classList.toggle("intruder-aud-lecher", lecherAud);
                    const audFill = audLayer.querySelector(".intruder-aud-fill");
                    if (audFill) {
                        audFill.style.transform = `scaleY(${audScale})`;
                    }
                    renderCache.audKey = audKey;
                }
            }
            const audLine = intruderEl.querySelector(".intruder-stat-aud");
            const dmgLine = intruderEl.querySelector(".intruder-stat-dmg");
            const atkFill = intruderEl.querySelector(".intruder-stat-atk-fill");
            if (audLine) {
                const audText = view.formatAudLine(intruder.aud, intruder.maxAud);
                if (renderCache.audText !== audText) {
                    audLine.textContent = audText;
                    renderCache.audText = audText;
                }
            }
            if (dmgLine) {
                const dmgText = (intruder.intruderType === "lecher" ? `Leer ` : `Wink `) + `${intruder.attackDamage}`;
                if (renderCache.dmgText !== dmgText) {
                    dmgLine.textContent = dmgText;
                    renderCache.dmgText = dmgText;
                }
            }
            if (atkFill) {
                const atkWrap = intruderEl.querySelector(".intruder-stat-atk-wrap");
                if (renderCache.atkMode !== "combat") {
                    if (atkWrap) {
                        atkWrap.style.display = "";
                    }
                    renderCache.atkMode = "combat";
                }
                const cd = intruder.intruderType === "lecher" ? (intruder.attackCooldownMs * 2) : intruder.attackCooldownMs;
                const canCharge = intruder.intruderType === "lecher" ? (!!intruder.lecherReady || !!intruder.inRange) : !!intruder.inRange;
                const remain = Math.max(0, Math.min(cd, intruder.attackTimerMs || 0));
                const atkBarPct = canCharge
                    ? (100 - Math.max(0, Math.min(100, (remain / cd) * 100)))
                    : 0;
                const atkWidth = `${atkBarPct}%`;
                if (renderCache.atkWidth !== atkWidth) {
                    atkFill.style.width = atkWidth;
                    renderCache.atkWidth = atkWidth;
                }
            }
        }
        view.consumeLineFxQueue();
        view.renderIntruderAttackFx();
        view.renderSlapFx();
        view.renderPlayerFloats();
        view.renderBattleBuffs();
        view.updatePlayerBattleBars();

        const activeKeys = Object.keys(viewData.activeIntruderElements);
        for (let i = 0; i < activeKeys.length; i++) {
            const intruderId = parseInt(activeKeys[i], 10);
            if (!activeIds[intruderId]) {
                view.releaseIntruderElement(intruderId);
            }
        }
    },
    renderBattleBuffs: function() {
        if (typeof engine.getBattleBuffDisplayList !== "function") {
            return;
        }
        const list = engine.getBattleBuffDisplayList();
        const activeByKey = {};
        for (let i = 0; i < list.length; i++) {
            activeByKey[list[i].key] = list[i];
            activeByKey[list[i].key].order = i;
        }
        for (let i = 0; i < BATTLE_BUFF_KEYS.length; i++) {
            const key = BATTLE_BUFF_KEYS[i];
            const entry = activeByKey[key];
            const slotId = `playerBuffSlot_${key}`;
            if (entry) {
                view.updateVal(slotId, "", "style.display");
                view.updateVal(slotId, entry.order, "style.order");
                const trText = entry.topRight || "";
                view.updateVal(`${slotId}_tr`, trText, "textContent");
                view.updateVal(`${slotId}_tr`, trText ? "" : "none", "style.display");
                view.updateVal(`${slotId}_br`, entry.bottomRight || "", "textContent");
                view.updateVal(`${slotId}_tip`, entry.tooltipHtml, "innerHTML");
            } else {
                view.updateVal(slotId, "none", "style.display");
            }
        }
    },
    clearAttackLineFx: function() {
        const linesRoot = viewData.cached.attackLines;
        if (linesRoot) {
            while (linesRoot.firstChild) {
                linesRoot.removeChild(linesRoot.firstChild);
            }
        }
        if (data.battle && data.battle.lineFxQueue) {
            data.battle.lineFxQueue.length = 0;
        }
    },
    consumeLineFxQueue: function() {
        const q = data.battle.lineFxQueue;
        const linesRoot = viewData.cached.attackLines;
        if (!view.isBattleVisible()) {
            // Drain queue + drop any paused animation nodes so they don't burst when Battle is shown.
            view.clearAttackLineFx();
            return;
        }
        if (!q || !q.length || !linesRoot) {
            return;
        }
        while (q.length > 0) {
            const seg = q.shift();
            view.spawnAttackLineFx(seg, linesRoot);
        }
    },
    formatSlapDamageText: function(damage) {
        const v = roundNearestDecimals(damage, 1);
        if (typeof intToString === "function" && Math.abs(v) >= 10000) {
            return intToString(v, 1);
        }
        return v.toFixed(1);
    },
    applySlapHandImg: function(el, visible, x, y, flip) {
        if (!el) {
            return;
        }
        const display = visible ? "block" : "none";
        if (el.style.display !== display) {
            el.style.display = display;
        }
        if (!visible) {
            return;
        }
        let cache = el.__gpuPos;
        if (!cache) {
            cache = el.__gpuPos = {};
        }
        view.setGpuPos(el, x, y, cache, false);
        const sx = flip ? -1 : 1;
        if (cache._sx !== sx) {
            cache._sx = sx;
            el.style.setProperty("--sx", sx);
        }
    },
    renderIntruderAttackFx: function() {
        const els = viewData.intruderAttackGfxElements;
        if (!els || !els.length) {
            return;
        }
        const fx = typeof engine.ensureIntruderAttackFx === "function" ? engine.ensureIntruderAttackFx() : (data.battle && data.battle.intruderAttackFx);
        const slots = (fx && fx.slots) || [];
        const half = ((typeof engine !== "undefined" && engine.INTRUDER_ATTACK_GFX_SIZE_PX) ? engine.INTRUDER_ATTACK_GFX_SIZE_PX : 42) / 2;
        if (!viewData.intruderAttackGfxRender.length) {
            viewData.intruderAttackGfxRender = [];
        }
        for (let i = 0; i < els.length; i++) {
            const el = els[i];
            let render = viewData.intruderAttackGfxRender[i];
            if (!render) {
                render = viewData.intruderAttackGfxRender[i] = { active: false, kind: "", opacity: "" };
            }
            const slot = slots[i];
            if (!slot || !slot.active) {
                if (render.active) {
                    el.style.display = "none";
                    render.active = false;
                }
                continue;
            }
            let x = slot.x;
            let y = slot.y;
            let opacity = slot.opacity;
            if (data.battle.state === "running" && !data.gameSettings.stop) {
                const alpha = data.gameSettings.renderAlpha ?? 1;
                const px = slot.prevX !== undefined ? slot.prevX : slot.x;
                const py = slot.prevY !== undefined ? slot.prevY : slot.y;
                const po = slot.prevOpacity !== undefined ? slot.prevOpacity : slot.opacity;
                x = px + ((slot.x - px) * alpha);
                y = py + ((slot.y - py) * alpha);
                opacity = po + ((slot.opacity - po) * alpha);
            }
            const kind = slot.kind === "leer" ? "leer" : "wink";
            const opacityText = String(Math.round(Math.max(0, opacity) * 1000) / 1000);
            if (!render.active) {
                el.style.display = "block";
                render.active = true;
            }
            if (render.kind !== kind) {
                el.src = kind === "leer" ? "img/leer.svg" : "img/wink.svg";
                render.kind = kind;
            }
            view.setGpuPos(el, x - half, y - half, render, false);
            if (render.opacity !== opacityText) {
                el.style.opacity = opacityText;
                render.opacity = opacityText;
            }
        }
    },
    renderSlapFx: function() {
        const fx = typeof engine.ensureSlapFx === "function" ? engine.ensureSlapFx() : (data.battle && data.battle.slapFx);
        const outerEl = viewData.cached.slapHandOuter;
        const sideEl = viewData.cached.slapHandSide;
        const innerEl = viewData.cached.slapHandInner;
        if (!fx || !outerEl || !sideEl || !innerEl) {
            return;
        }
        const cache = viewData.slapFxRender;
        const phase = fx.phase || "idle";
        const pose = phase === "windup" ? "outer" : (phase === "side" ? "side" : (phase === "inner" ? "inner" : "none"));
        let x = fx.x || 0;
        let y = fx.y || 0;
        if (pose !== "none" && data.battle.state === "running" && !data.gameSettings.stop) {
            const alpha = data.gameSettings.renderAlpha ?? 1;
            const px = fx.prevX !== undefined ? fx.prevX : fx.x;
            const py = fx.prevY !== undefined ? fx.prevY : fx.y;
            x = px + ((fx.x - px) * alpha);
            y = py + ((fx.y - py) * alpha);
        }
        const dir = fx.dir || 1;
        const outerFlip = dir === 1;
        const followFlip = dir === -1;
        if (cache.pose !== pose || cache.x !== x || cache.y !== y || cache.outerFlip !== outerFlip || cache.sideFlip !== followFlip) {
            view.applySlapHandImg(outerEl, pose === "outer", x, y, outerFlip);
            view.applySlapHandImg(sideEl, pose === "side", x, y, followFlip);
            view.applySlapHandImg(innerEl, pose === "inner", x, y, followFlip);
            cache.pose = pose;
            cache.x = x;
            cache.y = y;
            cache.outerFlip = outerFlip;
            cache.sideFlip = followFlip;
            cache.innerFlip = followFlip;
        }
        const dmgEls = viewData.slapDmgElements;
        if (!dmgEls || !dmgEls.length || !fx.dmgSlots) {
            return;
        }
        if (!viewData.slapDmgRender.length) {
            viewData.slapDmgRender = [];
        }
        for (let i = 0; i < dmgEls.length; i++) {
            const el = dmgEls[i];
            const slot = fx.dmgSlots[i];
            let render = viewData.slapDmgRender[i];
            if (!render) {
                render = viewData.slapDmgRender[i] = { active: false, text: "", opacity: "" };
            }
            if (!slot || !slot.active) {
                if (render.active) {
                    el.style.display = "none";
                    render.active = false;
                }
                continue;
            }
            const text = view.formatSlapDamageText(slot.damage);
            if (!render.active) {
                el.style.display = "block";
                render.active = true;
            }
            if (render.text !== text) {
                el.textContent = text;
                render.text = text;
            }
            view.applyFloatMotion(el, render, slot.elapsedMs, slot.x, slot.y);
        }
    },
    applyFloatMotion: function(el, render, elapsedMs, x, y) {
        const holdMs = engine.FLOAT_HOLD_MS || 500;
        const riseMs = engine.FLOAT_RISE_MS || 1500;
        const risePx = engine.FLOAT_RISE_PX || 28;
        let rise = 0;
        let opacity = 1;
        if (elapsedMs > holdMs) {
            const t = Math.max(0, Math.min(1, (elapsedMs - holdMs) / riseMs));
            rise = Math.round(-risePx * t);
            opacity = 1 - t;
        }
        view.setGpuPos(el, x, y, render, false);
        if (render._rise !== rise) {
            render._rise = rise;
            el.style.setProperty("--rise", rise);
        }
        if (render.opacity !== opacity) {
            el.style.opacity = opacity;
            render.opacity = opacity;
        }
    },
    renderPlayerFloats: function() {
        const els = viewData.playerFloatElements;
        const fx = data.battle && data.battle.playerFloatFx;
        if (!els || !els.length || !fx || !fx.slots) {
            return;
        }
        if (!viewData.playerFloatRender.length) {
            viewData.playerFloatRender = [];
        }
        for (let i = 0; i < els.length; i++) {
            const el = els[i];
            const slot = fx.slots[i];
            let render = viewData.playerFloatRender[i];
            if (!render) {
                render = viewData.playerFloatRender[i] = { active: false, text: "", opacity: "", cls: "" };
            }
            if (!slot || !slot.active) {
                if (render.active) {
                    el.style.display = "none";
                    render.active = false;
                }
                continue;
            }
            const text = slot.text || "";
            const cls = slot.kind === "hurt"
                ? "slap-dmg-num hypervisible float-aud-hurt"
                : "slap-dmg-num hypervisible float-aud-gain";
            if (!render.active) {
                el.style.display = "block";
                render.active = true;
            }
            if (render.cls !== cls) {
                el.className = cls;
                render.cls = cls;
            }
            if (render.text !== text) {
                el.textContent = text;
                render.text = text;
            }
            view.applyFloatMotion(el, render, slot.elapsedMs, slot.x, slot.y);
        }
    },
    spawnAttackLineFx: function(seg, parent) {
        const dx = seg.x2 - seg.x1;
        const dy = seg.y2 - seg.y1;
        const length = Math.sqrt((dx * dx) + (dy * dy));
        if (length < 1) {
            return;
        }
        if (seg.kind === "slap") {
            return;
        }
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const el = document.createElement("div");
        if (seg.kind === "sandal") {
            el.className = "attack-line-fx-anim attack-line-sandal";
        } else if (seg.kind === "lecher_strike") {
            el.className = "attack-line-fx-anim attack-line-intruder-sandal";
        } else {
            el.className = "attack-line-fx-anim";
        }
        el.style.width = `${length}px`;
        el.style.transform = view.gpuTranslate(seg.x1, seg.y1, `translateY(-50%) rotate(${angle}deg)`);
        parent.appendChild(el);
        el.addEventListener("animationend", function() {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        }, { once: true });
    },
    spawnKillRewardFloater: function(centerXPx, topYPx, lines) {
        if (document.hidden || (typeof isProcessingOffline !== "undefined" && isProcessingOffline)) {
            return;
        }
        if (!view.isBattleVisible()) {
            return;
        }
        const battlefield = viewData.cached.battlefield;
        if (!battlefield || !lines || !lines.length) {
            return;
        }
        const el = document.createElement("div");
        el.className = "kill-reward-floater";
        el.innerHTML = lines.map(function(s) {
            return `<div class="kill-reward-floater-line">${resortData.insertResourceIcons(s)}</div>`;
        }).join("");
        el.style.left = `${Math.round(centerXPx)}px`;
        el.style.top = `${Math.round(topYPx)}px`;
        battlefield.appendChild(el);
        el.addEventListener("animationend", function() {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        }, { once: true });
    },
    acquireIntruderElement: function() {
        let intruderEl = null;
        if (viewData.intruderElementPool.length > 0) {
            intruderEl = viewData.intruderElementPool.pop();
            view.ensureIntruderOverlayLayout(intruderEl);
        } else {
            intruderEl = document.createElement("div");
            intruderEl.className = "intruder-token";
            const shapeLayer = document.createElement("div");
            shapeLayer.className = "intruder-shape-layer";
            const spriteImg = document.createElement("img");
            spriteImg.className = "intruder-sprite-img";
            spriteImg.alt = "";
            spriteImg.draggable = false;
            const audLayer = document.createElement("div");
            audLayer.className = "intruder-aud-layer";
            const audFill = document.createElement("div");
            audFill.className = "intruder-aud-fill";
            audLayer.appendChild(audFill);
            const overlay = document.createElement("div");
            overlay.className = "intruder-overlay";
            const audLine = document.createElement("div");
            audLine.className = "intruder-stat-aud";
            const bottomGroup = document.createElement("div");
            bottomGroup.className = "intruder-stat-bottom";
            const dmgLine = document.createElement("div");
            dmgLine.className = "intruder-stat-dmg";
            const atkWrap = document.createElement("div");
            atkWrap.className = "intruder-stat-atk-wrap";
            const atkFill = document.createElement("div");
            atkFill.className = "intruder-stat-atk-fill";
            atkWrap.appendChild(atkFill);
            bottomGroup.appendChild(dmgLine);
            bottomGroup.appendChild(atkWrap);
            overlay.appendChild(audLine);
            overlay.appendChild(bottomGroup);
            shapeLayer.appendChild(spriteImg);
            shapeLayer.appendChild(audLayer);
            intruderEl.appendChild(shapeLayer);
            intruderEl.appendChild(overlay);
        }
        view.ensureIntruderAudFill(intruderEl);
        intruderEl.style.left = "0px";
        intruderEl.style.top = "0px";
        intruderEl.style.display = "block";
        return intruderEl;
    },
    ensureIntruderAudFill: function(intruderEl) {
        if (!intruderEl) {
            return null;
        }
        let audLayer = intruderEl.querySelector(".intruder-aud-layer");
        if (!audLayer) {
            const shapeLayer = intruderEl.querySelector(".intruder-shape-layer");
            if (!shapeLayer) {
                return null;
            }
            audLayer = document.createElement("div");
            audLayer.className = "intruder-aud-layer";
            shapeLayer.appendChild(audLayer);
        }
        if (!audLayer.querySelector(".intruder-aud-fill")) {
            const audFill = document.createElement("div");
            audFill.className = "intruder-aud-fill";
            audLayer.appendChild(audFill);
        }
        return audLayer;
    },
    ensureIntruderOverlayLayout: function(intruderEl) {
        if (!intruderEl) {
            return;
        }
        const overlay = intruderEl.querySelector(".intruder-overlay");
        if (!overlay || overlay.querySelector(".intruder-stat-bottom")) {
            return;
        }
        const audLine = overlay.querySelector(".intruder-stat-aud");
        const dmgLine = overlay.querySelector(".intruder-stat-dmg");
        const atkWrap = overlay.querySelector(".intruder-stat-atk-wrap");
        if (!dmgLine && !atkWrap) {
            return;
        }
        const bottomGroup = document.createElement("div");
        bottomGroup.className = "intruder-stat-bottom";
        if (dmgLine) {
            bottomGroup.appendChild(dmgLine);
        }
        if (atkWrap) {
            bottomGroup.appendChild(atkWrap);
        }
        if (audLine) {
            overlay.insertBefore(bottomGroup, audLine.nextSibling);
        } else {
            overlay.appendChild(bottomGroup);
        }
    },
    releaseIntruderElement: function(intruderId) {
        const intruderEl = viewData.activeIntruderElements[intruderId];
        if (!intruderEl) {
            return;
        }
        intruderEl.style.display = "none";
        intruderEl.removeAttribute("id");
        if (intruderEl.parentElement) {
            intruderEl.parentElement.removeChild(intruderEl);
        }
        viewData.intruderElementPool.push(intruderEl);
        delete viewData.activeIntruderElements[intruderId];
        delete viewData.intruderRenderCache[intruderId];
    },

    formatGainAmount: function(amount) {
        const n = Math.abs(Number(amount) || 0);
        if (n >= 10000) {
            return intToStringRound(n);
        }
        return String(round2(n));
    },
    spawnBuildingGainFloat: function(buildingId, html, color) {
        if (document.hidden || (typeof isProcessingOffline !== "undefined" && isProcessingOffline)) {
            return;
        }
        if (!view.isResortMapVisible()) {
            return;
        }
        const host = viewData.cached[buildingId] || document.getElementById(buildingId);
        if (!host || !html) {
            return;
        }
        const el = document.createElement("div");
        el.className = "inn-bead-float hypervisible";
        el.innerHTML = html;
        if (color) {
            el.style.color = color;
        }
        const beadX = (Math.random() - 0.5) * 50;
        const beadY = (Math.random() - 0.5) * 50;
        el.style.setProperty("--inn-bead-x", `${beadX}px`);
        el.style.setProperty("--inn-bead-y", `${beadY}px`);
        el.addEventListener("animationend", function() {
            el.remove();
        });
        host.appendChild(el);
    },
    spawnResourceFloat: function(buildingId, resourceKey, amount, color) {
        const n = Number(amount) || 0;
        if (!(n > 0)) {
            return;
        }
        const icon = resortData.resourceIconHtml(resourceKey);
        view.spawnBuildingGainFloat(buildingId, `+${icon}${view.formatGainAmount(n)}`, color);
    },
    spawnInnBeadFloat: function(beads) {
        const amount = Math.round(Number(beads) || 0);
        view.spawnResourceFloat("baseBuilding_inn", "starBeads", amount, "#17edfd");
    },
    spawnCisternGainFloat: function(waterGain, essenceGain) {
        const water = Number(waterGain) || 0;
        const essence = Number(essenceGain) || 0;
        if (!(water > 0) && !(essence > 0)) {
            return;
        }
        const essenceHtml = `${resortData.resourceIconHtml("essence")}<span style="color:#db0042">${view.formatGainAmount(essence)}</span>`;
        if (water > 0 && essence > 0) {
            const html = `<span style="color:#7ec8e3">${view.formatGainAmount(water)}L</span> | ${essenceHtml}`;
            view.spawnBuildingGainFloat("baseBuilding_cistern", html, "#cdd6f4");
            return;
        }
        if (water > 0) {
            view.spawnBuildingGainFloat("baseBuilding_cistern", `${view.formatGainAmount(water)}L`, "#7ec8e3");
            return;
        }
        view.spawnBuildingGainFloat("baseBuilding_cistern", essenceHtml, "#db0042");
    },
    spawnNoodleTipFloat: function(skillName) {
        if (document.hidden || (typeof isProcessingOffline !== "undefined" && isProcessingOffline)) {
            return;
        }
        if (!view.isResortMapVisible()) {
            return;
        }
        const noodleBtn = viewData.cached.baseBuilding_noodleBar || document.getElementById("baseBuilding_noodleBar");
        if (!noodleBtn || !skillName) {
            return;
        }
        const el = document.createElement("div");
        el.className = "noodle-tip-float hypervisible";
        el.textContent = `+${skillName} Tip`;
        const slot = noodleBtn.querySelectorAll(".noodle-tip-float").length % 5;
        const offsets = [0, -14, 14, -28, 28];
        el.style.setProperty("--noodle-tip-x", `${offsets[slot]}px`);
        el.addEventListener("animationend", function() {
            el.remove();
        });
        noodleBtn.appendChild(el);
    },

    //helpers
    scheduleUpdate: function(elementId, value, type) {
        if (typeof isProcessingOffline !== "undefined" && isProcessingOffline) {
            return;
        }
        viewData.scheduled.push({
            id:elementId,
            value:value,
            type:type
        })
    },
    updateScheduled: function() { //Comes from async processes in data, like onComplete
        for(let scheduled of viewData.scheduled) {
            view.updateVal(scheduled.id, scheduled.value, scheduled.type);
        }
        viewData.scheduled = [];
    },
    invalidateFormattedNumberCache: function() {
        const pv = viewData.prevValues;
        for (const id in pv) {
            if (pv[id]) {
                delete pv[id].lastValue_textContent;
                delete pv[id].lastValue_innerHTML;
            }
        }
    },
    renderPrestigePackPanel: function() {
        const overlay = viewData.cached.prestigePackOverlay || document.getElementById("prestigePackOverlay");
        if (!overlay) {
            return;
        }
        const shrine = data.progress.base && data.progress.base.shrine;
        const session = shrine && shrine.prestigeSession;
        const open = !!(viewData.packOverlayOpen && session && session.active);
        overlay.style.display = open ? "flex" : "none";
        if (!open) {
            return;
        }
        const summary = session.phase === "summary";
        view.updateVal("prestigePackColumns", summary ? "none" : "", "style.display");
        view.updateVal("prestigePackCards", summary ? "none" : "", "style.display");
        view.updateVal("prestigePackError", summary ? "none" : "", "style.display");
        view.updateVal("prestigePackActionBtn", summary ? "none" : "", "style.display");
        view.updateVal("prestigePackAutoChoose", summary ? "none" : "flex", "style.display");
        const autoChk = viewData.cached.prestigePackAutoChoose_chk || document.getElementById("prestigePackAutoChoose_chk");
        if (autoChk) {
            const wantAuto = !!(data.progress.options && data.progress.options.autoChoosePackCards);
            if (autoChk.checked !== wantAuto) {
                autoChk.checked = wantAuto;
            }
        }
        view.updateVal("prestigePackSummary", "flex", "style.display");
        view.updateVal("prestigeFinishBtn", summary ? "" : "none", "style.display");
        const summaryEl = viewData.cached.prestigePackSummary || document.getElementById("prestigePackSummary");
        const lines = shrineCards.sessionBonusLines(session.gained || []);
        let summaryHtml = "";
        for (let bi = 0; bi < lines.length; bi++) {
            summaryHtml += `<div>${view.escapeHtml(lines[bi])}</div>`;
        }
        if (summaryEl && summaryEl.innerHTML !== summaryHtml) {
            summaryEl.innerHTML = summaryHtml;
        }
        if (summary) {
            return;
        }
        const packs = shrine.packs || {};
        const rarities = ["common", "rare", "epic"];
        let countsHtml = "";
        for (let i = 0; i < rarities.length; i++) {
            const rarity = rarities[i];
            const n = packs[rarity] || 0;
            countsHtml += `<div class="prestige-pack-count-row"><img class="shrine-pack-icon" src="img/${rarity}.svg" alt="" draggable="false"><span>x${n}</span></div>`;
        }
        const countsEl = viewData.cached.prestigePackCounts || document.getElementById("prestigePackCounts");
        if (countsEl && countsEl.innerHTML !== countsHtml) {
            countsEl.innerHTML = countsHtml;
        }
        const previewRarity = (session.openPack && session.openPack.rarity) || session.previewRarity;
        const previewEl = viewData.cached.prestigePackPreview || document.getElementById("prestigePackPreview");
        const oddsEl = viewData.cached.prestigePackOdds || document.getElementById("prestigePackOdds");
        const packDef = previewRarity && shrineCards.packDefs[previewRarity];
        if (previewEl) {
            const imgHtml = packDef ? `<img src="img/${previewRarity}.svg" alt="" draggable="false">` : "";
            if (previewEl.innerHTML !== imgHtml) {
                previewEl.innerHTML = imgHtml;
            }
        }
        if (oddsEl) {
            const oddsHtml = packDef ? packDef.oddsHtml : "";
            if (oddsEl.innerHTML !== oddsHtml) {
                oddsEl.innerHTML = oddsHtml;
            }
        }
        const cardsEl = viewData.cached.prestigePackCards || document.getElementById("prestigePackCards");
        let cardsHtml = "";
        const openPack = session.openPack;
        const selected = viewData.prestigeSelection || [];
        if (openPack && openPack.cards) {
            for (let i = 0; i < openPack.cards.length; i++) {
                const card = openPack.cards[i];
                const def = shrineCards._byKey[card.key];
                const name = def ? def.name : card.key;
                let effect = "";
                if (def && def.effectText) {
                    try {
                        effect = def.effectText(card.rarity) || "";
                    } catch (err) {
                        effect = "";
                    }
                }
                const border = shrineCards.rarityBorder[card.rarity] || "#9fb6d5";
                const bg = shrineCards.rarityBackground[card.rarity] || "rgba(159, 182, 213, 0.5)";
                const selClass = selected.indexOf(i) >= 0 ? " prestige-pack-card--selected" : "";
                const max = def && def.rarity ? def.rarity[card.rarity] : -1;
                let maxHtml = "";
                if (typeof max === "number" && max !== -1) {
                    const owned = shrineCards.getOwned(card.key, card.rarity);
                    maxHtml = `<div class="prestige-pack-card-max">${owned}/${max}</div>`;
                }
                cardsHtml += `<button type="button" class="prestige-pack-card${selClass}" style="border-color:${border};background:${bg}" onclick="events.selectPrestigeCard(${i})"><div class="prestige-pack-card-name">${view.escapeHtml(name)}</div><div class="prestige-pack-card-effect">${view.escapeHtml(effect)}</div>${maxHtml}</button>`;
            }
        }
        if (cardsEl && cardsEl.innerHTML !== cardsHtml) {
            cardsEl.innerHTML = cardsHtml;
        }
        const errEl = viewData.cached.prestigePackError || document.getElementById("prestigePackError");
        if (errEl) {
            errEl.textContent = viewData.prestigePackError || "";
        }
        const btn = viewData.cached.prestigePackActionBtn || document.getElementById("prestigePackActionBtn");
        if (btn) {
            btn.textContent = shrineCards.actionButtonLabel(session, shrine);
        }
    },
    escapeHtml: function(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    },
    gpuTranslate: function(x, y, extra) {
        const t = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
        return extra ? `${t} ${extra}` : t;
    },
    gpuTranslateSubpixel: function(x, y, extra) {
        const t = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        return extra ? `${t} ${extra}` : t;
    },
    setGpuPos: function(el, x, y, cache, subpixel) {
        if (!el) {
            return;
        }
        const rx = subpixel ? (Math.round(x * 10) / 10) : Math.round(x);
        const ry = subpixel ? (Math.round(y * 10) / 10) : Math.round(y);
        if (cache && cache._tx === rx && cache._ty === ry) {
            return;
        }
        if (cache) {
            cache._tx = rx;
            cache._ty = ry;
        }
        // Use the individual `translate` property (compositor-friendly) instead of
        // custom --tx/--ty inside `transform`, which forces main-thread style work each move.
        el.style.translate = `${rx}px ${ry}px`;
    },
    setGpuPosById: function(id, x, y, subpixel) {
        const el = viewData.cached[id];
        if (!el) {
            return;
        }
        let cache = viewData.gpuPosCache[id];
        if (!cache) {
            cache = viewData.gpuPosCache[id] = {};
        }
        view.setGpuPos(el, x, y, cache, !!subpixel);
    },
    setDisplayById: function(id, show) {
        const el = viewData.cached[id];
        if (!el) {
            return;
        }
        let cache = viewData.displayCache[id];
        if (!cache) {
            cache = viewData.displayCache[id] = {};
        }
        const display = show ? "" : "none";
        if (cache.display === display) {
            return;
        }
        cache.display = display;
        el.style.display = display;
    },
    setSizeById: function(id, sizePx) {
        const el = viewData.cached[id];
        if (!el) {
            return;
        }
        let cache = viewData.displayCache[id];
        if (!cache) {
            cache = viewData.displayCache[id] = {};
        }
        if (cache.sizePx === sizePx) {
            return;
        }
        cache.sizePx = sizePx;
        const sizeStr = sizePx + "px";
        el.style.width = sizeStr;
        el.style.height = sizeStr;
    },
    renderLerpAlpha: function() {
        if (data.gameSettings && data.gameSettings.stop) {
            return 1;
        }
        let a = 1;
        const tps = data.gameSettings && data.gameSettings.ticksPerSecond;
        if (typeof lastTickTime === "number" && lastTickTime > 0 && tps) {
            const tickInterval = 1000 / tps;
            a = Math.max(0, Math.min(1, (performance.now() - lastTickTime) / tickInterval));
        } else if (data.gameSettings && data.gameSettings.renderAlpha !== undefined && data.gameSettings.renderAlpha !== null) {
            a = data.gameSettings.renderAlpha;
        }
        return a;
    },
    pathTokenVisualProgress: function(token) {
        const current = token.pathProgress || 0;
        const prev = token.prevPathProgress;
        if (prev === undefined || prev === null) {
            return current;
        }
        const a = view.renderLerpAlpha();
        return prev + ((current - prev) * a);
    },
    projectileVisualProgress: function(projectile) {
        const current = projectile.progress || 0;
        const prev = projectile.prevProgress;
        if (prev === undefined || prev === null) {
            return current;
        }
        const a = view.renderLerpAlpha();
        return prev + ((current - prev) * a);
    },
    updateFireLauncherProjectilePositions: function() {
        const fl = data.progress && data.progress.base && data.progress.base.fireLaunchers;
        const projectiles = (fl && fl.projectiles) || [];
        const paused = !!(data.gameSettings && data.gameSettings.stop);
        for (let pi = 0; pi < 8; pi++) {
            const pid = `fireLauncherProjectile_${pi}`;
            const p = pi < projectiles.length ? projectiles[pi] : null;
            view.setDisplayById(pid, !!p);
            if (!p) {
                continue;
            }
            if (paused) {
                p.prevProgress = p.progress || 0;
            }
            const t = Math.min(1, view.projectileVisualProgress(p) / (p.durationMs || 1050));
            const x = (p.fromX || 0) + ((p.toX || 0) - (p.fromX || 0)) * t;
            const y = (p.fromY || 0) + ((p.toY || 0) - (p.fromY || 0)) * t;
            const size = p.sizePx || 28;
            const half = size / 2;
            view.setSizeById(pid, size);
            view.setGpuPosById(pid, x - half, y - half, true);
        }
    },
    ensurePathTokenPools: function() {
        if (viewData.pathTokenPoolsReady) {
            return;
        }
        for (let i = 0; i < 12; i++) {
            viewData.pebbleTokenFreeSlots.push(i);
            viewData.dropletTokenFreeSlots.push(i);
        }
        viewData.pathTokenPoolsReady = true;
    },
    // Bind DOM token slots by stable item id so array compaction on completion
    // does not reassign labels/colors across remaining path tokens mid-frame.
    syncPathTokenPool: function(items, byId, freeSlots, idCounterKey) {
        view.ensurePathTokenPools();
        const base = data.progress && data.progress.base;
        const activeIds = {};
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item) {
                continue;
            }
            if (item.id == null && base) {
                item.id = base[idCounterKey] || 1;
                base[idCounterKey] = (base[idCounterKey] || 1) + 1;
            }
            activeIds[String(item.id)] = true;
        }
        for (const idKey in byId) {
            if (!activeIds[idKey]) {
                freeSlots.push(byId[idKey]);
                delete byId[idKey];
            }
        }
        const slots = new Array(12);
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item) {
                continue;
            }
            const idKey = String(item.id);
            let slot = byId[idKey];
            if (slot === undefined) {
                slot = freeSlots.length ? freeSlots.pop() : undefined;
                if (slot === undefined) {
                    continue;
                }
                byId[idKey] = slot;
            }
            slots[slot] = item;
        }
        return slots;
    },
    updatePathTokenPositions: function() {
        const base = data.progress && data.progress.base;
        if (!base || !engine.getResortPathPosition) {
            return;
        }
        const paused = !!(data.gameSettings && data.gameSettings.stop);
        const pebbles = base.pebbles || [];
        const pebbleSlots = view.syncPathTokenPool(
            pebbles, viewData.pebbleTokenById, viewData.pebbleTokenFreeSlots, "pebbleIdCounter"
        );
        for (let pi = 0; pi < 12; pi++) {
            const pebble = pebbleSlots[pi];
            const pid = `pebbleToken_${pi}`;
            const pAmtId = `pebbleTokenAmt_${pi}`;
            const show = !!pebble;
            view.setDisplayById(pid, show);
            view.setDisplayById(pAmtId, show);
            if (!pebble) {
                continue;
            }
            if (paused) {
                pebble.prevPathProgress = pebble.pathProgress || 0;
            }
            const pos = engine.getResortPathPosition(view.pathTokenVisualProgress(pebble));
            view.setGpuPosById(pid, pos.x - 4, pos.y - 4, true);
            view.setGpuPosById(pAmtId, pos.x, pos.y + 8, true);
        }
        const droplets = base.droplets || [];
        const dropletSlots = view.syncPathTokenPool(
            droplets, viewData.dropletTokenById, viewData.dropletTokenFreeSlots, "dropletIdCounter"
        );
        for (let di = 0; di < 12; di++) {
            const droplet = dropletSlots[di];
            const did = `dropletToken_${di}`;
            const dAmtBelow = `dropletTokenAmtBelow_${di}`;
            const dAmtTop = `dropletTokenAmtTop_${di}`;
            const show = !!droplet;
            view.setDisplayById(did, show);
            view.setDisplayById(dAmtBelow, show);
            view.setDisplayById(dAmtTop, show);
            if (!droplet) {
                continue;
            }
            if (paused) {
                droplet.prevPathProgress = droplet.pathProgress || 0;
            }
            const dpos = engine.getResortPathPosition(view.pathTokenVisualProgress(droplet));
            view.setGpuPosById(did, dpos.x - 5, dpos.y - 5, true);
            view.setGpuPosById(dAmtBelow, dpos.x, dpos.y + 10, true);
            view.setGpuPosById(dAmtTop, dpos.x, dpos.y - 18, true);
        }
    },
    updateVal: function(id, newVal, type="textContent", sigFigs) {
        const el = viewData.cached[id];
        if (!el) {
            console.log("Missing: " + id)
            return;
        }
        if(!viewData.prevValues[id]) {
            viewData.prevValues[id] = {};
        }
        let prevValue = viewData.prevValues[id];

        const tkCache = viewData.typeKeyCache;
        let typeKey;
        if (type === "classList.toggle" && sigFigs) {
            const ck = type + "." + sigFigs;
            typeKey = tkCache[ck] || (tkCache[ck] = "lastValue_" + ck);
        } else {
            typeKey = tkCache[type] || (tkCache[type] = "lastValue_" + type);
        }
        let lastVal = prevValue[typeKey] ?? null;

        if (lastVal !== newVal) {
            if (type.includes(".")) {
                const [firstKey, secondKey] = type.split(".");
                if (firstKey === "classList" && secondKey === "toggle") {
                    const className = sigFigs;
                    if (className) {
                        el.classList.toggle(className, !!newVal);
                    }
                } else if (el[firstKey] && el[firstKey][secondKey] !== undefined) {
                    el[firstKey][secondKey] = newVal;
                }
            } else {
                if(sigFigs && sigFigs !== "none") {
                    if(sigFigs === "time") {
                        el[type] = secondsToTime(newVal);
                    } else if(sigFigs === "floor") {
                        el[type] = intToStringRound(newVal);
                    } else if(sigFigs === "manaCap") {
                        el[type] = intToStringManaCap(newVal);
                    } else {
                        el[type] = intToString(newVal, sigFigs);
                    }
                } else {
                    let writeVal = newVal;
                    if (type === "innerHTML" && typeof newVal === "string" && typeof resortData !== "undefined" && resortData.insertResourceIcons) {
                        writeVal = resortData.insertResourceIcons(newVal);
                    }
                    el[type] = writeVal;
                }
            }

            prevValue[typeKey] = newVal;
        }
    },
}
