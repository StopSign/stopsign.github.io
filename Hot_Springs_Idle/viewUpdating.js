let viewData = {
    cached: {}, //contains the elements that are being iterated over and updated regularly,
    prevValues: {},
    scheduled: [],
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
        if (data.progress && data.progress.showBattle) {
            view.renderBattlefield();
        }
        // Global progress bars (okami/mana/divinity) — always on
        view.updateOkamiPanel();
        // Map-only DOM (baseResortMap carriers / okami sprites / weaving) — skip when base map not visible
        if (view.isResortMapVisible()) {
            view.updateActiveWeavingButtons();
            view.updateOkamiMapVisuals();
            view.updateFoxDenCarriers();
            view.updateBonfireCarriers();
            view.updateCisternCarriers();
            view.updateInnCarriers();
            view.updateMarketCarriers();
        }
        view.updateBuyableUpgradesOverlay(false);

        view.updateScheduled(); //Updates UI things that were scheduled from data code
    },
    updateView: function() { //Updates half as much as above, for passive updates to save a little
        if (!viewData.cached.mainLayout) {
            createView.initializeDisplay();
        }
        createView.showCurrentTab();
        view.updateMenuNumbers();
        view.updateGlobals();
    },
    updateViewOnSecond: function() { //Updates once a second

    },
    updateEtaText: function(id, remain, rate) {
        if (rate > 0 && remain > 0) {
            view.updateVal(id, remain / rate, "textContent", "time");
        } else {
            view.updateVal(id, "—");
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
    formatWaveShardInfoLine: function(sh) {
        if (!sh || !sh.key) {
            return "";
        }
        const tierMult = mapData.getShardLootTierMultiplier(data.battle.mapTier || 0);
        return mapData.formatShardInfoLine(sh, tierMult, engine.getShardLootChanceMultiplier());
    },
    updateWaveInfoPanel: function(runClock, growthUnlocked) {
        if (!viewData.cached.waveInfo || viewData.cached.waveInfo.dataset.waveInfoBuilt !== "1") {
            createView.createWaveInfoStructure();
            createView.queueCache("waveInfoTimeRow", "waveInfoStar", "waveInfoTimeLabel", "waveInfoTransition", "waveInfoZoneShards", "waveInfoZones");
            for (let wzi = 0; wzi < createView.waveInfoZoneSlotCount; wzi++) {
                createView.queueCache(`waveInfoZone_${wzi}`);
            }
            for (let wsi = 0; wsi < createView.waveInfoZoneShardSlotCount; wsi++) {
                createView.queueCache(`waveInfoZoneShard_${wsi}`);
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
        const zoneShards = (mapDef && mapDef.zoneShards) || [];
        const shardSlotCount = createView.waveInfoZoneShardSlotCount;
        let anyZoneShard = false;
        const collectShardsLevel = (data.progress.base && data.progress.base.scrollArchives
            && data.progress.base.scrollArchives.collectShardsLevel) || 0;
        const showZoneShards = collectShardsLevel >= 1;
        for (let si = 0; si < shardSlotCount; si++) {
            const sh = zoneShards[si];
            if (!showZoneShards || !sh) {
                view.updateVal(`waveInfoZoneShard_${si}`, "none", "style.display");
                continue;
            }
            anyZoneShard = true;
            view.updateVal(`waveInfoZoneShard_${si}`, "", "style.display");
            view.updateVal(`waveInfoZoneShard_${si}`, view.formatWaveShardInfoLine(sh));
        }
        view.updateVal("waveInfoZoneShards", anyZoneShard ? "" : "none", "style.display");
        const zones = data.battle.activeZones || [];
        const zoneSlotCount = createView.waveInfoZoneSlotCount;
        for (let i = 0; i < zoneSlotCount; i++) {
            const z = zones[i];
            if (!z) {
                view.updateVal(`waveInfoZone_${i}`, "none", "style.display");
                continue;
            }
            const rm = z.remainingSpawnMs !== undefined ? z.remainingSpawnMs : 0;
            const spawnTail = rm > 25 ? ` | ${round1(rm / 1000)}s to spawn last` : "";
            const expInfo = growthUnlocked ? ` | exp ${round2(z.exp)}` : "";
            const shardPart = z.shardInfo ? ` | ${z.shardInfo}` : "";
            const line = `${z.name} | Difficulty x${round2(z.difficulty)} | coins ${round2(z.coins)}${expInfo} | ${intToStringRound(z.remainingEnemies)} left${spawnTail}${shardPart}`;
            view.updateVal(`waveInfoZone_${i}`, "", "style.display");
            view.updateVal(`waveInfoZone_${i}`, line, "innerHTML");
        }
    },
    updatePlayerStatDmgLine: function() {
        const isForaging = (data.battle.mode || "combat") === "foraging";
        const p = data.battle.player;
        const fmtDmg1 = function(x) {
            return roundNearestDecimals(x, 1).toFixed(1);
        };
        if (isForaging) {
            view.updateVal("playerStatDmgLine", `Harvest ${fmtDmg1(p.attackDamage)}`);
            return;
        }
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
    updateGlobals: function() { //updates user-facing UI
        const showBattle = !!(data.progress && data.progress.showBattle);
        const battleState = data.battle.state;
        const isDone = battleState === "dead" || battleState === "completed";
        const runClock = (data.battle.cloneAliveMs !== undefined ? data.battle.cloneAliveMs : (data.battle.elapsedMs || 0)) / 1000;
        if (showBattle) {
            const regenPerSec = data.battle.player.regenPerSecond || 0;
            const maxAudInt = Math.round(data.battle.player.maxAud || 0);
            const p = data.battle.player;
            const audCur = p.aud;
            const lowAud = maxAudInt < 100;
            const audLineText = lowAud
                ? `${Math.max(0, roundNearestDecimals(audCur, 1)).toFixed(1)}/${maxAudInt} Aud`
                : `${Math.round(audCur)}/${maxAudInt} Aud`;
            view.updateVal("playerStatAudLine", audLineText);
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
            if (battleState === "completed") {
                view.updateVal("deathSummary", `Bonus coins: ${intToStringRound(data.battle.completionBonusCoins || 0)} | Time ${round1Fixed(runClock)}s | Level ${data.battle.levelState.level} | Kills ${data.battle.enemiesKilled} | Coins ${intToStringRound(killCoins)}${retryTxt}`, "innerHTML");
            } else {
                view.updateVal("deathSummary", `Time ${round1Fixed(runClock)}s | Level ${data.battle.levelState.level} | Kills ${data.battle.enemiesKilled} | Coins ${intToStringRound(killCoins)}${retryTxt}`, "innerHTML");
            }
            view.updateVal("deathManaBonus", `+${manaBonus} base mana capacity`);
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
        const activeTab = data.battle.currentTab || "base";
        view.updateTabButtons(activeTab);

        // Battle HUD chrome (outside tab panes)
        const isForaging = (data.battle.mode || "combat") === "foraging";
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
        view.updateVal("sandalAttackWrap", (hasSandal && !isForaging) ? "" : "none", "style.display");

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
        const currentClsMenu = data.progress.currentClassKey || "none";
        const hasActiveClassMenu = ["condescend", "scold", "mock"].indexOf(currentClsMenu) >= 0;
        let skillsTabNow = data.progress.selectedSkillsTab || "combat";
        if (skillsTabNow === "resort") {
            skillsTabNow = "combat";
        }
        if (skillsTabNow === "foraging") {
            skillsTabNow = "combat";
        }
        if (skillsTabNow === "class" && !hasActiveClassMenu) {
            skillsTabNow = "combat";
        }
        data.progress.selectedSkillsTab = skillsTabNow;
        if (typeof data.progress.selectedSkillDetailKey !== "string") {
            data.progress.selectedSkillDetailKey = "";
        }
        view.updateSkillSubTabs();
        view.updateSkillsListVisibility(skillsTabNow);
        view.syncSelectedSkillDetailKey(skillsTabNow);
        view.applySkillDetailSelectionHighlight();
        const skillKeys = skills.getSkillKeysByCategory(data.progress.skills, skillsTabNow);
        for (let i = 0; i < skillKeys.length; i++) {
            view.updateSkillRowCompact(skillKeys[i]);
        }
        view.updateSkillInfoPanel();
        view.updateVal("skillSubTab_class", hasActiveClassMenu ? "" : "none", "style.display");
        const showStarInventory = skillsTabNow === "combat" || skillsTabNow === "class";
        const starPool = data.progress.stars;
        const starLine = `<span class="star-bronze">★</span>: ${starPool.bronze} | <span class="star-silver">★</span>: ${starPool.silver} | <span class="star-gold">★</span>: ${starPool.gold}`;
        view.updateVal("combatStarsInventory", showStarInventory ? "" : "none", "style.display");
        if (showStarInventory) {
            view.updateVal("combatStarsCounts", starLine, "innerHTML");
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
        view.updateVal("attributePlanHighest", `Highest: ${data.progress.highestLevelReached || 0}`);
        view.updateVal("attributePlanPending", engine.hasPendingAttributePlanChanges() ? "" : "none", "style.display");
        const shockEffUi = skills.getSkillEffect("shockValue");
        const windfallEffUi = skills.getSkillEffect("windfallSwagger");
        const adaptationEffUi = skills.getSkillEffect("adaptation");
        const savageLessonsEffUi = skills.getSkillEffect("savageLessons");
        let strDisplay = (ls.levelStr || 0) + (ls.skillStrBonus || 0);
        if (skills.isSkillUnlocked("shockValue")) {
            strDisplay += shockEffUi.bonusStr || 0;
        }
        let conDisplay = (ls.levelCon || 0) + (ls.skillConBonus || 0);
        if (skills.isSkillUnlocked("windfallSwagger")) {
            conDisplay += windfallEffUi.bonusCon || 0;
        }
        view.updateVal("strText", strDisplay, "textContent", 1);
        view.updateVal("conText", conDisplay, "textContent", 1);
        let strStatTip = "Brutality - +10% damage per point.<br>Damage is always rounded up.";
        if (skills.isSkillUnlocked("savageLessons")) {
            strStatTip += `<br>Savage Lessons: +${savageLessonsEffUi.bonusStr || 0} Bru from skill levels`;
        }
        if (skills.isSkillUnlocked("shockValue")) {
            strStatTip += `<br>Shock Value: +${shockEffUi.bonusStr || 0} Bru from skill level`;
        }
        view.updateVal("strStatTip", strStatTip, "innerHTML");
        let conStatTip = "Confidence - +10% current and max Aud per point";
        if (skills.isSkillUnlocked("adaptation")) {
            conStatTip += `<br>Adaptation: +${adaptationEffUi.bonusCon || 0} Con from skill levels`;
        }
        if (skills.isSkillUnlocked("windfallSwagger")) {
            conStatTip += `<br>Windfall Swagger: +${windfallEffUi.bonusCon || 0} Con from skill level`;
        }
        view.updateVal("conStatTip", conStatTip, "innerHTML");
        view.updateVal("spdText", ls.levelSpd || 0, "textContent", 1);
        view.updateVal("soulText", engine.getCloneSoulLevel(), "textContent", 1);
        const soulLv = engine.getCloneSoulLevel();
        const ringSoul = engine.getMarketAnchoringRingBought();
        view.updateVal("soulStatTip", `Soul - +3% skill exp per level (additive) and +10% character exp per level (additive).<br>Anchoring Ring: +${ringSoul} Soul.<br>Current: +${soulLv * 3}% skill exp, +${soulLv * 10}% character exp.`, "innerHTML");
        view.renderAttributePlanList();
    },
    updateStatsTab: function() {
        const p = data.battle.player;
        const lsMult = data.battle.levelState || {};
        let conTotal = (lsMult.levelCon || 0) + (lsMult.skillConBonus || 0);
        let strTotal = (lsMult.levelStr || 0) + (lsMult.skillStrBonus || 0);
        const shockEffStats = skills.getSkillEffect("shockValue");
        const windfallEffStats = skills.getSkillEffect("windfallSwagger");
        const validationEffStats = skills.getSkillEffect("validation");
        if (skills.isSkillUnlocked("shockValue")) {
            strTotal += shockEffStats.bonusStr || 0;
        }
        if (skills.isSkillUnlocked("windfallSwagger")) {
            conTotal += windfallEffStats.bonusCon || 0;
        }
        const gc = gameData.battle.combat;
        const cdCfg = gameData.battle.cooldowns;
        const fortInner = skills.getSkillEffect("shameless").baseAudBonus || 0;
        const tenB = skills.getSkillEffect("corneredEgo").audInnerBonus || 0;
        const wisMult = roundNearestDecimals(skills.getSkillEffect("hindsight").characterExpMultiplier || 1, 2);
        const greedMult = roundNearestDecimals(skills.getSkillEffect("extortion").killCoinsMultiplier || 1, 2);
        const shamelessResearched = skills.isSkillResearchComplete("shameless");
        const corneredResearched = skills.isSkillResearchComplete("corneredEgo");
        const forceResearched = skills.isSkillResearchComplete("force");
        const alacrityResearched = skills.isSkillResearchComplete("alacrity");
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
        const audBaseLines = [];
        let audBaseSum = 0;
        audBaseLines.push(`Base Aud: +${gc.baseAudInner}`);
        audBaseSum += gc.baseAudInner;
        if (cardAud) {
            audBaseLines.push(`Base Audacity: +${cardAud}`);
            audBaseSum += cardAud;
        }
        if (shamelessResearched) {
            audBaseLines.push(`Shameless: +${fortInner}`);
            audBaseSum += fortInner;
        }
        const corneredAmt = corneredResearched ? tenB : 0;
        if (corneredResearched) {
            const corneredCurrent = corneredAmt * 2;
            audBaseLines.push(`Cornered Ego: +${corneredAmt} base, +${corneredCurrent} current`);
            audBaseSum += corneredAmt + corneredCurrent;
        }
        let valAud = 0;
        if (skills.isSkillUnlocked("validation")) {
            valAud = engine.getValidationAudFromKills();
            const valCap = validationEffStats.audCap || 0;
            const valCur = validationEffStats.currentAudOnMaxIncrease || 0;
            audBaseLines.push(`Validation: +${valAud} max Aud from kills (cap ${valCap}); +${valCur} current Aud when max increases from a kill`);
            audBaseSum += valAud;
        }
        let padAud = 0;
        if (skills.isSkillUnlocked("paddingResume")) {
            const padEffUi = skills.getSkillEffect("paddingResume");
            padAud = padEffUi.audBonus || 0;
            audBaseLines.push(`Padding the Resume: +${padAud} (${padEffUi.audPerCharLevel || 0} per character level)`);
            audBaseSum += padAud;
        }
        audBaseLines.push(`Total base: ${audBaseSum}`);
        const shamelessAmt = shamelessResearched ? fortInner : 0;
        const baseInner = (gc.baseAudInner + cardAud) * densMult + shamelessAmt + corneredAmt;
        const multipliedAud = Math.ceil(baseInner * conMult) + Math.ceil((corneredAmt * 2) * conMult) + valAud + padAud;
        const finalAud = Math.max(1, multipliedAud);
        const audMultExtra = finalAud - audBaseSum;
        const audEffective = audBaseSum > 0 ? finalAud / audBaseSum : 1;
        const audMultLines = [];
        if (runDensity > 0) {
            audMultLines.push(`Dense Clones: ×${roundNearestDecimals(densMult, 2)} (+${Math.round(runDensity * 10)}% to base Aud)`);
        }
        if (growthUnlocked || conTotal > 0) {
            audMultLines.push(`Confidence: ×${roundNearestDecimals(conMult, 2)} (+${Math.round(conTotal * (100 / statDiv))}%)`);
        }
        const audExtraText = audMultExtra > 0 ? ` (+${audMultExtra} Aud)` : "";
        audMultLines.push(`Total multiplier effect: ×${roundNearestDecimals(audEffective, 2)}${audExtraText}`);
        const audTip = audBaseLines.join("<br>") + "<br><br>" + audMultLines.join("<br>");
        view.updateVal("statsAudText", `${intToStringRound(p.maxAud)} Aud`);
        view.updateVal("statsAudTip", audTip, "innerHTML");
        const regenVal = p.regenPerSecond || 0;
        view.updateVal("statsRegenText", `${round2(regenVal)}/s`);
        view.updateVal("statsRegenTip", "From Self-Affirmations skill level (Aud/s).", "innerHTML");
        view.updateVal("statsRegenCard", regenVal > 0 ? "" : "none", "style.display");
        const forceRaw = forceResearched ? (skills.getSkillEffect("force").baseDamage || 0) : 0;
        const mcRaw = (skills.isSkillUnlocked("mainCharacter") && typeof engine.getMainCharacterFlatDamage === "function")
            ? engine.getMainCharacterFlatDamage() : 0;
        const ppRaw = (skills.isSkillUnlocked("peerPressure") && typeof engine.getPeerPressureFlatDamage === "function")
            ? engine.getPeerPressureFlatDamage() : 0;
        const attackBaseLines = [];
        const attackBaseSum = gc.baseSlapDamage + cardSlap + forceRaw + mcRaw + ppRaw;
        attackBaseLines.push(`Base slap: +${gc.baseSlapDamage}`);
        if (cardSlap) {
            attackBaseLines.push(`Base ego damage: +${roundNearestDecimals(cardSlap, 2)}`);
        }
        if (forceResearched) {
            attackBaseLines.push(`Force (base): +${roundNearestDecimals(forceRaw, 2)}`);
        }
        if (skills.isSkillUnlocked("mainCharacter")) {
            const vis = typeof engine.countVisibleIntruders === "function" ? engine.countVisibleIntruders() : 0;
            attackBaseLines.push(`Main Character: +${roundNearestDecimals(mcRaw, 2)} from ${vis} visible ${vis === 1 ? "enemy" : "enemies"}`);
        }
        if (skills.isSkillUnlocked("peerPressure")) {
            const inSlap = typeof engine.countIntrudersInSlapRange === "function" ? engine.countIntrudersInSlapRange() : 0;
            attackBaseLines.push(`Peer Pressure: +${roundNearestDecimals(ppRaw, 2)} from ${inSlap} in slap range`);
        }
        attackBaseLines.push(`Total base: ${roundNearestDecimals(attackBaseSum, 2)}`);
        let afterAttack = ((gc.baseSlapDamage + cardSlap) * densMult + forceRaw) * strMult + mcRaw + ppRaw;
        const attackMultLines = [];
        if (runDensity > 0) {
            attackMultLines.push(`Dense Clones: ×${roundNearestDecimals(densMult, 2)} (+${Math.round(runDensity * 10)}% base ego damage)`);
        }
        if (growthUnlocked || strTotal > 0) {
            attackMultLines.push(`Brutality: ×${roundNearestDecimals(strMult, 2)} (+${Math.round(strTotal * (100 / statDiv))}%)`);
        }
        if (skills.isSkillUnlocked("bitterRivalry")) {
            const brPct = skills.getSkillEffect("bitterRivalry").damagePercentPerSecond || 0;
            let brLine = `Bitter Rivalry: +${round2(brPct)}% damage per second an enemy is in slap range`;
            const brTarget = typeof engine.findIntruderById === "function"
                ? engine.findIntruderById(data.battle.activeTargetId)
                : null;
            if (brTarget && brTarget.alive) {
                const brSecs = brTarget.bitterRivalrySeconds || 0;
                const brFactor = 1 + (brPct / 100) * brSecs;
                brLine += ` (current target ×${roundNearestDecimals(brFactor, 2)})`;
                if (brSecs > 0) {
                    afterAttack *= brFactor;
                }
            }
            attackMultLines.push(brLine);
        }
        if (skills.isSkillUnlocked("highHorse") && typeof engine.isPlayerAboveHalfAud === "function" && engine.isPlayerAboveHalfAud()) {
            const hhFrac = skills.getSkillEffect("highHorse").damageBonusFraction || 0;
            attackMultLines.push(`High Horse: ×${roundNearestDecimals(1 + hhFrac, 2)} (+${roundNearestDecimals(hhFrac * 100, 1)}% while above half Aud)`);
            afterAttack *= (1 + hhFrac);
        }
        if (skills.isSkillUnlocked("underdog") && typeof engine.isPlayerAtOrBelowAudFraction === "function" && engine.isPlayerAtOrBelowAudFraction(0.5)) {
            const udFrac = skills.getSkillEffect("underdog").damageBonusFraction || 0;
            attackMultLines.push(`Underdog: ×${roundNearestDecimals(1 + udFrac, 2)} (+${roundNearestDecimals(udFrac * 100, 1)}% at or below half Aud)`);
            afterAttack *= (1 + udFrac);
        }
        if (skills.isSkillUnlocked("crowdWork")) {
            const visNow = typeof engine.countVisibleIntruders === "function" ? engine.countVisibleIntruders() : 0;
            if (visNow >= 4) {
                const cwFrac = skills.getSkillEffect("crowdWork").damageBonusFraction || 0;
                attackMultLines.push(`Crowd Work: ×${roundNearestDecimals(1 + cwFrac, 2)} (+${roundNearestDecimals(cwFrac * 100, 1)}% with ${visNow} visible)`);
                afterAttack *= (1 + cwFrac);
            }
        }
        if (skills.isSkillUnlocked("marathonEgo")) {
            const mePct = skills.getSkillEffect("marathonEgo").damagePercentPerTenSec || 0;
            const tens = Math.floor((data.battle.cloneAliveMs || 0) / 10000);
            const meFactor = 1 + (mePct / 100) * tens;
            attackMultLines.push(`Marathon Ego: ×${roundNearestDecimals(meFactor, 2)} (+${round2(mePct * tens)}% from ${tens * 10}s)`);
            afterAttack *= meFactor;
        }
        const atkExtra = afterAttack - attackBaseSum;
        const atkEffective = attackBaseSum > 0 ? afterAttack / attackBaseSum : 1;
        const atkExtraText = Math.abs(atkExtra) >= 0.05 ? ` (${atkExtra > 0 ? "+" : ""}${roundNearestDecimals(atkExtra, 2)} ego dmg)` : "";
        attackMultLines.push(`Total multiplier effect: ×${roundNearestDecimals(atkEffective, 2)}${atkExtraText}`);
        const attackTip = attackBaseLines.join("<br>") + "<br><br>" + attackMultLines.join("<br>");
        view.updateVal("statsAttackText", `${roundNearestDecimals(p.attackDamage, 1).toFixed(1)} ego dmg`);
        view.updateVal("statsAttackTip", attackTip, "innerHTML");
        const twEff = skills.getSkillEffect("toughness_condescend");
        const tsEff = skills.getSkillEffect("thickSkin");
        const toughnessArmor = twEff.armorFlat !== undefined ? twEff.armorFlat : 0;
        const thickSkinArmor = tsEff.armorFlat || 0;
        const armorFlat = toughnessArmor + thickSkinArmor;
        view.updateVal("statsArmorText", `${round2(armorFlat)} flat`);
        let armorTip = "";
        if (skills.isSkillUnlocked("toughness_condescend")) {
            armorTip += `Condescend Toughness: +${round2(toughnessArmor)} flat damage reduction`;
        }
        if (skills.isSkillUnlocked("thickSkin")) {
            if (armorTip) {
                armorTip += "<br>";
            }
            armorTip += `Thick Skin: +${round2(thickSkinArmor)} flat damage reduction`;
        }
        if (!armorTip) {
            armorTip = "Flat damage reduction";
        }
        view.updateVal("statsArmorTip", armorTip, "innerHTML");
        view.updateVal("statsArmorCard", armorFlat > 0 ? "" : "none", "style.display");
        view.updateVal("statsSlapText", `${round2((p.attackCooldownMs || 0) / 1000)}s`);
        const alaEff = skills.getSkillEffect("alacrity");
        const alaLv = alaEff.effectiveLevel || 0;
        let slapTip = `Base: ${round2(cdCfg.slapBaseMs / 1000)}s`;
        if (alacrityResearched) {
            slapTip += `<br>Alacrity reduction: ${alaLv * cdCfg.alacritySlapReductionPerLevelMs} ms`;
        }
        const glovesMs = engine.getMarketMysticalGlovesBought() * 100;
        slapTip += `<br>Mystical Gloves: -${glovesMs} ms`;
        slapTip += `<br>Floor: ${round2(cdCfg.slapFloorMs / 1000)}s`;
        view.updateVal("statsSlapTip", slapTip, "innerHTML");
        view.updateVal("statsSandalText", hasSandal ? `${round2((p.sandalAttackCooldownMs || 0) / 1000)}s` : "Locked");
        view.updateVal("statsSandalTip", hasSandal ? `Base: ${round2(cdCfg.sandalBaseMs / 1000)}s<br>Alacrity reduction: ${alaLv * cdCfg.alacritySandalReductionPerLevelMs} ms<br>Floor: ${round2(cdCfg.sandalFloorMs / 1000)}s` : "Requires Spare sandal upgrade", "innerHTML");
        view.updateVal("statsSandalCard", hasSandal ? "" : "none", "style.display");
    },
    updateTravelTab: function() {
        const harvestForageOn = events.harvestForageUnlocked();
        const smartHarvestOn = !!(data.progress.base && data.progress.base.garden && data.progress.base.garden.smartHarvestUnlocked);
        const clsMenu = data.progress.currentClassKey || "none";
        const hasClassForTravel = ["condescend", "scold", "mock", "shun"].indexOf(clsMenu) >= 0;
        const selectedTravel = data.progress.selectedTravelMapKey || data.progress.currentMapKey;
        view.updateCloneCostDisplays();
        const bfTravel = data.progress.base && data.progress.base.bonfire;
        const ventingUnlocked = !!(bfTravel && bfTravel.startWithFullManaUnlocked);
        view.updateVal("travelVentingSurplus_row", ventingUnlocked ? "" : "none", "style.display");
        if (ventingUnlocked) {
            const ventChk = viewData.cached.travelVentingSurplus_chk;
            if (ventChk) {
                ventChk.checked = bfTravel.startWithFullManaEnabled !== false;
            }
        }
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
        const current = data.progress.currentMapKey;
        for (let i = 0; i < mapDefs.length; i++) {
            const map = mapDefs[i];
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
            view.updateVal(`mapClearWrap_${map.key}`, harvestForageOn && !reqClass ? "" : "none", "style.display");
            const clearState = engine.getMapClearState(map.key);
            const isCountingDown = (clearState.activeMs || 0) > 0;
            const statusText = isCountingDown
                ? `Cleared for Harvest. Intruders respawn in ${Math.ceil(clearState.activeMs / 1000)}s`
                : `${round1(clearState.pct || 0)}%`;
            view.updateVal(`mapClearStatus_${map.key}`, statusText);
            view.updateVal(`mapClearFill_${map.key}`, `${Math.max(0, Math.min(100, clearState.pct || 0))}%`, "style.width");
            const harvestId = `mapHarvestButton_${map.key}`;
            const smartStartId = `mapSmartHarvestStart_${map.key}`;
            if (!reqClass) {
                if (!harvestForageOn) {
                    view.updateVal(harvestId, "none", "style.display");
                    view.updateVal(smartStartId, "none", "style.display");
                } else {
                    view.updateVal(harvestId, isCountingDown ? "" : "none", "style.display");
                    view.updateVal(harvestId, "Harvest Resources", "textContent");
                    const harvestReady = engine.isMapHarvestReady(map.key);
                    view.updateVal(harvestId, !harvestReady, "disabled");
                }
                const showStart = !onThisMap && smartHarvestOn && !isCountingDown && (clearState.pct || 0) >= 100;
                view.updateVal(smartStartId, showStart ? "" : "none", "style.display");
            } else {
                /* No harvest/smart-harvest elements for class-restricted maps - not cached. */
            }
            const shardLootMult = engine.getShardLootChanceMultiplier();
            const shardSummary = shardLootMult > 0 ? mapData.getMapShardSummaryText(map, data.progress.skills, shardLootMult) : "";
            if (shardSummary) {
                view.updateVal(`mapShardSummary_${map.key}`, shardSummary, "textContent");
                view.updateVal(`mapShardSummary_${map.key}`, "", "style.display");
            } else {
                view.updateVal(`mapShardSummary_${map.key}`, "none", "style.display");
            }
            view.updateVal(`mapDifficulty_${map.key}`, `x${round2(map.baseDifficulty || 1)}`);
            view.updateVal(`mapWaves_${map.key}`, (map.zones || []).length, "textContent", 1);
            view.updateVal(`mapTime_${map.key}`, `${round1Fixed((map.totalDurationMs || 0) / 1000)}s`);
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
    },
    updateHistoryTab: function() {
        view.updateHistoryList();
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
        const playSec = (data.currentGameState && data.currentGameState.secondsPassed) || 0;
        view.updateVal("playTimeClock", playSec, "textContent", "time");
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
                    return typeof u.upgradeSoldOut === "function" && u.upgradeSoldOut();
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
                if (typeof u.rowVisible === "function") {
                    let show = u.rowVisible(hideMx);
                    if (buildingSegment !== "path"
                        && typeof u.upgradeSoldOut === "function" && u.upgradeSoldOut()) {
                        show = !hideMx;
                    }
                    view.updateVal(rowEl, show ? "" : "none", "style.display");
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

    updateBasePanelBonfire: function() {
        view.updateCloneCostDisplays();
        const bf = data.progress.base.bonfire;
        const garden = data.progress.base && data.progress.base.garden;
        const fireTendingUnlocked = !!(garden && garden.arrangementOfFireTendingUnlocked);
        view.updateVal("bonfireFireTending_row", fireTendingUnlocked ? "" : "none", "style.display");
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
        const autoRetryUnlocked = !!bf.autoRetryUnlocked;
        view.updateVal("bonfireAutoRetry_row", autoRetryUnlocked ? "" : "none", "style.display");
        if (autoRetryUnlocked) {
            const retryChk = viewData.cached.bonfireAutoRetry_chk || document.getElementById("bonfireAutoRetry_chk");
            if (retryChk) {
                retryChk.checked = !!bf.autoRetryEnabled;
            }
        }
        const startWithFullManaUnlocked = !!bf.startWithFullManaUnlocked;
        view.updateVal("bonfireStartWithFullMana_row", startWithFullManaUnlocked ? "" : "none", "style.display");
        if (startWithFullManaUnlocked) {
            const fullManaChk = viewData.cached.bonfireStartWithFullMana_chk || document.getElementById("bonfireStartWithFullMana_chk");
            if (fullManaChk) {
                fullManaChk.checked = bf.startWithFullManaEnabled !== false;
            }
        }
        const flameTended = !!bf.tendTheFlameUnlocked;
        const marketBuilt = engine.isMarketBuilt();
        view.updateVal("bonfireWoodCarry_row", flameTended ? "" : "none", "style.display");
        if (flameTended) {
            view.updateVal("bonfireWoodCarryLabel", marketBuilt ? "Wood/Coal carry" : "Wood carry");
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
        view.updateVal("bonfireCoal_row", marketBuilt ? "" : "none", "style.display");
        if (marketBuilt) {
            view.updateVal("bonfireCoalText", intToStringRound(engine.getMarketGoodAmount("coal")));
        }
        const hs = data.progress.base && data.progress.base.hiddenSpring;
        const sparkBought = ((hs && hs.fireSpiritsBought) || 0) >= 1;
        view.updateVal("bonfireFireSpiritPower_row", sparkBought ? "" : "none", "style.display");
        if (sparkBought) {
            view.updateVal("bonfireFireSpiritPower", engine.getBonfireAssignedFireSpiritPowerTotal());
        }
        const showHeatFormula = !!bf.tendTheFlameUnlocked && sparkBought;
        view.updateVal("bonfireFireSpiritHeat_row", showHeatFormula ? "" : "none", "style.display");
        if (showHeatFormula) {
            view.updateVal("bonfireFireSpiritHeat_row", "Fire spirits: √(excess heat / 10) / 10 exp/s (excess = heat − assigned fire spirit power)");
        }
        const t = view._basePanelPurchasingTools(data.progress.base, null, data.progress.options.hideMaxedUpgrades);
        t.refreshOrderedPurchasables("bonfire", resortData.buildings.bonfire.upgradesOrder, { hideMaxed: t.hideMaxed });
        this.updateResortWorkerControls("bonfire", (bf.assignedWorkers || 0) > 0 || engine.getOkami().assignedBuildingKey === "bonfire");
    },

    updateBasePanelShrine: function() {
        view.updateCloneCostDisplays();
        view.updateShrineProgressDisplays();
        if (typeof engine.updateShrineMilestones === "function") {
            engine.updateShrineMilestones();
        }
        const shrine = data.progress.base.shrine || {};
        const shrineBuilt = engine.isShrineBuilt();
        const selected = shrine.selectedClassKey || "none";
        view.updateVal("shrinePrestigeHeading", shrineBuilt ? "" : "none", "style.display");
        view.updateVal("shrineClassSelectRow", shrineBuilt ? "" : "none", "style.display");
        view.updateVal("shrineClassRow", shrineBuilt ? "" : "none", "style.display");
        view.updateVal("shrineMoveMountainRow", shrineBuilt ? "" : "none", "style.display");
        view.updateVal("shrinePrestigeNote", shrineBuilt ? "" : "none", "style.display");
        view.updateVal("shrinePacksSection", shrineBuilt ? "" : "none", "style.display");
        const classLocked = selected !== "none";
        for (let ci = 0; ci < bonfireClassOrder.length; ci++) {
            const ck = bonfireClassOrder[ci];
            view.updateVal(`shrine_class_btn_${ck}`, selected === ck, "classList.toggle", "shrine-class-btn--selected");
            view.updateVal(`shrine_class_btn_${ck}`, classLocked && selected === ck, "classList.toggle", "shrine-class-btn--demo-locked");
        }
        view.updateVal("shrineMoveMountainRow", classLocked, "classList.toggle", "shrine-move-row--locked");
        view.updateVal("shrineClassDemoNote", shrineBuilt && classLocked ? "" : "none", "style.display");
        if (typeof events !== "undefined" && events.syncShrineMoveControls) {
            events.syncShrineMoveControls();
        }
        view.updateShrinePackDisplays();
        const tShrine = view._basePanelPurchasingTools(data.progress.base, null, data.progress.options.hideMaxedUpgrades);
        tShrine.refreshOrderedPurchasables("shrine", (resortData.buildings.shrine && resortData.buildings.shrine.upgradesOrder) || [], { hideMaxed: tShrine.hideMaxed });
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

    updateBasePanelScrollArchives: function(base, t) {
        const lib = base.scrollArchives;
        this.updateResortWorkerControls("scrollArchives", engine.getScrollArchivesResearchRate() > 0);
        const researchRate = engine.getScrollArchivesResearchRate();
        const literacyBought = engine.getLiteracyLessonsBought();
        const gainedRate = literacyBought > 0 ? researchRate * engine.getLiteracyResearchMultiplier() : researchRate;
        const progress = lib.researchTaskProgress || 0;
        const required = lib.researchTaskRequired || 10;
        const remain = Math.max(0, required - progress);
        view.updateVal("scrollArchivesResearchProgressText", round1Fixed(progress));
        view.updateVal("scrollArchivesResearchRequiredText", round1Fixed(required));
        view.updateVal("scrollArchivesResearchPaused_row", lib.researchPaused ? "" : "none", "style.display");
        if (!lib.researchPaused && gainedRate > 0 && remain > 0) {
            view.updateEtaText("scrollArchivesResearchEtaText", remain, gainedRate);
        } else {
            view.updateVal("scrollArchivesResearchEtaText", "—");
        }
        const toChoose = lib.researchesToChoose || 0;
        view.updateVal("scrollArchivesResearchesToChoose", toChoose);
        view.updateVal("scrollArchivesChoicesWrap", toChoose > 0 ? "" : "none", "style.display");
        view.updateVal("base_scrollArchives_row_finish_research", toChoose > 0 ? "" : "none", "style.display");
        const choices = lib.researchChoices || [];
        for (let ci = 0; ci < 3; ci++) {
            const skillKey = choices[ci];
            const colId = `scrollArchivesChoice_${ci}`;
            if (!skillKey) {
                view.updateVal(colId, "none", "style.display");
                view.updateVal(`scrollArchivesChoiceShard_${ci}`, "none", "style.display");
                view.updateVal(`scrollArchivesChoiceTips_${ci}`, "none", "style.display");
                continue;
            }
            const sk = data.progress.skills[skillKey];
            view.updateVal(colId, "", "style.display");
            view.updateVal(`scrollArchivesChoiceType_${ci}`, sk ? sk.name : skillKey);
            view.updateVal(`scrollArchivesChoiceDesc_${ci}`, skills.wrapBuffNamesInHtml(skills.getSkillShortDescription(skillKey)), "innerHTML");
            view.updateVal(`scrollArchivesChoiceShard_${ci}`, engine.skillHasShardOnTravelableMap(skillKey) ? "" : "none", "style.display");
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
        t.refreshOrderedPurchasables("scrollArchives", ["collectShards"], { hideMaxed: t.hideMaxed });
    },

    updateBasePanelAtelier: function(t) {
        const atelier = data.progress.base && data.progress.base.atelier ? data.progress.base.atelier : {};
        const showOreBars = engine.isBringOreToAtelierUnlocked();
        view.updateVal("atelierOreBars_row", showOreBars ? "" : "none", "style.display");
        view.updateVal("atelierInfoOre", atelier.ore || 0, "textContent", "floor");
        view.updateVal("atelierInfoBars", atelier.bars || 0, "textContent", "floor");
        t.refreshOrderedPurchasables("atelier", resortData.buildings.atelier.upgradesOrder, t.soldOutUpgradeRowOpts(t.hideMaxed, "atelier"));
        if (viewData.cached.base_atelier_sandal_row) {
            view.updateVal("base_atelier_sandal_row", "none", "style.display");
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
        if (siteKey === "mage_tower") {
            view.updateVal(`base_${siteKey}_worker_prod_wrap`, "none", "style.display");
            const units = engine.getOrbWorkerUnits();
            const expRate = engine.getOrbExpGainPerSecond();
            const manaRate = engine.getEffectiveManaRatePerSecond();
            let orbProdText = `Workers for Orb exp: ${units} (+${units * 20}% exp) | Exp: ${round2(expRate)}/s | Mana: ${round2(manaRate)}/s`;
            if (okamiHere) {
                orbProdText += ` | Inspiration x${round2(engine.getOkamiInspirationBonus())} on mana`;
            }
            view.updateVal(`base_${siteKey}_worker_prod_text`, orbProdText);
            return;
        }
        if (siteKey === "foxDen") {
            view.updateVal(`base_${siteKey}_worker_prod_wrap`, "none", "style.display");
            const okamiFox = engine.getOkami();
            const okamiHereFox = okamiFox.assignedBuildingKey === "foxDen";
            const carrierCount = assigned + (okamiHereFox ? 1 : 0);
            const workerSpeedFox = engine.getFoxDenCarrierSpeed({ isOkami: false });
            const okamiSpeedFox = engine.getFoxDenCarrierSpeed({ isOkami: true });
            let foxProdText = `Carriers assigned: ${carrierCount} | Carrier speed: ${round1(workerSpeedFox)}`;
            if (okamiHereFox) {
                foxProdText += ` | Okami speed: ${round1(okamiSpeedFox)}`;
            }
            view.updateVal(`base_${siteKey}_worker_prod_text`, foxProdText);
            return;
        }
        if (siteKey === "scrollArchives") {
            const lib = base.scrollArchives;
            const researcherCount = assigned + (okamiHere ? 1 : 0);
            const researchRate = engine.getScrollArchivesResearchRate();
            const literacyBought = engine.getLiteracyLessonsBought();
            const gainedRate = literacyBought > 0 ? researchRate * engine.getLiteracyResearchMultiplier() : researchRate;
            const progress = lib.researchTaskProgress || 0;
            const required = lib.researchTaskRequired || 10;
            const remain = Math.max(0, required - progress);
            const pct = required > 0 ? Math.max(0, Math.min(100, (progress / required) * 100)) : 0;
            let prodText = `Researchers: ${researcherCount} | Research speed: ${round1(gainedRate)}/s`;
            if (okamiHere) {
                prodText += ` (${round1(engine.getOkamiInspirationBonus())}× from inspiration)`;
            }
            const etaText = (!lib.researchPaused && gainedRate > 0 && remain > 0)
                ? secondsToTime(remain / gainedRate)
                : "—";
            prodText += `<br>Research: ${round1Fixed(progress)} / ${round1(required)} · ETA: ${etaText} (${round1(researchRate)} coins/s, ${round1(researchRate * 3)} star beads/s, ${round1(researchRate * 10)} mana/s)`;
            if (lib.researchPaused) {
                prodText += "<br>Paused - need more coins, star beads, or mana";
            }
            if ((lib.researchesToChoose || 0) > 0) {
                prodText += `<br>Researches to choose: ${lib.researchesToChoose}`;
            }
            view.updateVal(`base_${siteKey}_worker_prod_wrap`, "", "style.display");
            view.updateVal(`base_${siteKey}_worker_prod_text`, prodText, "innerHTML");
            view.updateVal(`base_${siteKey}_worker_prog_fill`, `${pct}%`, "style.width");
            return;
        }
        if (siteKey === "bonfire") {
            const okamiBonfire = engine.getOkami();
            const okamiHereBonfire = okamiBonfire.assignedBuildingKey === "bonfire";
            const carrierCount = assigned + (okamiHereBonfire ? 1 : 0);
            const workerSpeedBonfire = engine.getBonfireCarrierSpeed({ isOkami: false });
            const okamiSpeedBonfire = engine.getBonfireCarrierSpeed({ isOkami: true });
            const heatDisp = bonfire.getHeatDisplay();
            const heatPct = bonfire.getHeatBarFillPercent(heatDisp.heat);
            const prodText = `Carriers assigned: ${carrierCount} | Carrier speed: ${round1(workerSpeedBonfire)} | Okami speed: ${round1(okamiSpeedBonfire)}<br>Heat: ${round1(heatDisp.heat)} / ${round1(heatDisp.nextThreshold)} | Mana Gain Bonus: ${heatDisp.bonusLabel}`;
            view.updateVal(`base_${siteKey}_worker_prod_wrap`, "", "style.display");
            view.updateVal(`base_${siteKey}_worker_prod_text`, prodText, "innerHTML");
            view.updateVal(`base_${siteKey}_worker_prog_fill`, `${heatPct}%`, "style.width");
            return;
        }
        if (siteKey === "market") {
            const carrierCount = engine.getMarketCarrierCapacity();
            const workerSpeedMarket = engine.getMarketCarrierSpeed({ isOkami: false });
            const allowed = engine.getMarketAllowedHaulResources();
            let prodText = `Haulers assigned: ${carrierCount} | Carrier speed: ${round1(workerSpeedMarket)}`;
            if (okamiHere) {
                prodText += ` | Okami speed: ${round1(engine.getMarketCarrierSpeed({ isOkami: true }))}`;
            }
            prodText += `<br>${allowed.length ? `Hauling: ${allowed.join(", ")}` : "No resources allowed - check a box to start hauling"}`;
            prodText += ` | Credit rate: ${round1(engine.getMarketCreditPerSecond())}/s`;
            view.updateVal(`base_${siteKey}_worker_prod_wrap`, "none", "style.display");
            view.updateVal(`base_${siteKey}_worker_prod_text`, prodText, "innerHTML");
            return;
        }
        if (siteKey === "inn") {
            const okamiInn = engine.getOkami();
            const okamiHereInn = okamiInn.assignedBuildingKey === "inn";
            const carrierCount = assigned + (okamiHereInn ? 1 : 0);
            const workerSpeed = engine.getInnCarrierSpeed({ isOkami: false });
            const okamiSpeed = engine.getInnCarrierSpeed({ isOkami: true });
            const inn = base.inn;
            const hot = inn.hotWater || 0;
            const hotCap = engine.getInnHotWaterCapacity();
            let prodText = `Carriers assigned: ${carrierCount} | Carrier speed: ${round1(workerSpeed)}`;
            if (okamiHereInn) {
                prodText += ` | Okami speed: ${round1(okamiSpeed)}`;
            }
            prodText += `<br>Hot Water: ${round1(hot)} / ${hotCap}`;
            if (!engine.isCisternWaterHotEnoughForOnsen()) {
                prodText += " (Cistern water must be above 40C)";
            }
            view.updateVal(`base_${siteKey}_worker_prod_wrap`, "", "style.display");
            view.updateVal(`base_${siteKey}_worker_prod_text`, prodText, "innerHTML");
            view.updateVal(`base_${siteKey}_worker_prog_fill`, hotCap > 0 ? `${Math.round((hot / hotCap) * 100)}%` : "0%", "style.width");
            return;
        }
        if (siteKey === "cistern") {
            const okamiCistern = engine.getOkami();
            const okamiHereCistern = okamiCistern.assignedBuildingKey === "cistern";
            const carrierCount = assigned + (okamiHereCistern ? 1 : 0);
            const workerSpeed = engine.getCisternCarrierSpeed({ isOkami: false });
            const okamiSpeed = engine.getCisternCarrierSpeed({ isOkami: true });
            const inn = base.inn;
            const hot = inn.hotWater || 0;
            const hotCap = engine.getInnHotWaterCapacity();
            let prodText = `Carriers assigned: ${carrierCount} | Carrier speed: ${round1(workerSpeed)}`;
            if (okamiHereCistern) {
                prodText += ` | Okami speed: ${round1(okamiSpeed)}`;
            }
            if (engine.isInnOnsenConverted()) {
                prodText += `<br>Onsen Hot Water: ${round1(hot)} / ${hotCap}`;
                if (!engine.isCisternWaterHotEnoughForOnsen()) {
                    prodText += " (Cistern water must be above 40C)";
                }
            }
            view.updateVal(`base_${siteKey}_worker_prod_wrap`, "", "style.display");
            view.updateVal(`base_${siteKey}_worker_prod_text`, prodText, "innerHTML");
            view.updateVal(`base_${siteKey}_worker_prog_fill`, hotCap > 0 ? `${Math.round((hot / hotCap) * 100)}%` : "0%", "style.width");
            return;
        }
        let pct = required > 0 ? Math.max(0, Math.min(100, ((slot.workerPower || 0) / required) * 100)) : 0;
        view.updateVal(`base_${siteKey}_worker_prod_wrap`, "", "style.display");
        const power = round1(slot.workerPower || 0);
        const rateStr = round1(workRate);
        let prodText;
        if (siteKey === "torii") {
            const canReduce = workRate > 0;
            const reduceSec = engine.getToriiWorkerTimerReduceSeconds();
            const reducingPerSec = required > 0 && canReduce ? (reduceSec * workRate) / required : 0;
            const reduceSecStr = (Math.abs(reduceSec - Math.round(reduceSec)) < 1e-9) ? String(Math.round(reduceSec)) : round1(reduceSec);
            prodText = required > 0
                ? `Worker Power: ${rateStr} |  On complete, reduce next visitor by ${reduceSecStr}s<br>${power}/${required} to complete | Reducing ${round2(reducingPerSec)}/s`
                : `Worker Power: ${rateStr}`;
        } else if (siteKey === "bambooForest") {
            const bambooRate = engine.getBambooCutWorkerRate();
            const chopPower = engine.getBambooChopPower();
            const bambooRateStr = round1(bambooRate);
            const canComplete = bambooRate > 0;
            const woodPerSec = required > 0 && canComplete ? (bambooRate / required) * chopPower : 0;
            const woodPerSecStr = round2(woodPerSec);
            prodText = required > 0
                ? `Worker Power: ${bambooRateStr} | ${power}/${required} to complete | ~${woodPerSecStr}/s`
                : `Worker Power: ${bambooRateStr} | ~${woodPerSecStr}/s`;
            workRate = bambooRate;
            pct = required > 0 && canComplete ? Math.max(0, Math.min(100, ((slot.workerPower || 0) / required) * 100)) : 0;
        } else {
            const canComplete = workRate > 0 && (siteKey !== "laundry" || productive);
            const completionsPerSec = required > 0 && canComplete ? workRate / required : 0;
            const completionsStr = round2(completionsPerSec);
            prodText = required > 0
                ? `Worker Power: ${rateStr} | ${power}/${required} to complete | ${completionsStr}/s`
                : `Worker Power: ${rateStr} | ${completionsStr}/s`;
        }
        view.updateVal(`base_${siteKey}_worker_prog_fill`, `${pct}%`, "style.width");
        view.updateVal(`base_${siteKey}_worker_prod_text`, prodText, "innerHTML");
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
        const earthBought = !!((hs && hs.earthSpiritsBought) || 0);
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
                view.updateVal(`foxDenSlot_${uk}`, view.gpuTranslate(pos.x, pos.y, "translate(-50%, -50%)"), "style.transform");
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
            view.updateVal(elId, carrier ? "" : "none", "style.display");
            if (carrier) {
                const route = engine.getCarrierRoutePoints(carrier);
                const p = carrier.progress || 0;
                const x = route.fromX + (route.toX - route.fromX) * p;
                const y = route.fromY + (route.toY - route.fromY) * p;
                view.updateVal(elId, view.gpuTranslate(x, y, "translate(-50%, -50%)"), "style.transform");
                const el = viewData.cached[elId];
                if (el) {
                    const img = el.querySelector(".fox-den-carrier-img");
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
            view.updateVal(elId, carrier ? "" : "none", "style.display");
            if (carrier) {
                const route = engine.getCarrierRoutePoints(carrier);
                const p = carrier.progress || 0;
                const x = route.fromX + (route.toX - route.fromX) * p;
                const y = route.fromY + (route.toY - route.fromY) * p;
                view.updateVal(elId, view.gpuTranslate(x, y, "translate(-50%, -50%)"), "style.transform");
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
            view.updateVal(elId, carrier ? "" : "none", "style.display");
            if (carrier) {
                const route = engine.getCarrierRoutePoints(carrier);
                const p = carrier.progress || 0;
                const x = route.fromX + (route.toX - route.fromX) * p;
                const y = route.fromY + (route.toY - route.fromY) * p;
                view.updateVal(elId, view.gpuTranslate(x, y, "translate(-50%, -50%)"), "style.transform");
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
                view.updateVal(`cisternCarrier_${ci}`, "none", "style.display");
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
            view.updateVal(elId, carrier ? "" : "none", "style.display");
            if (carrier) {
                const route = engine.getCarrierRoutePoints(carrier);
                const p = carrier.progress || 0;
                const x = route.fromX + (route.toX - route.fromX) * p;
                const y = route.fromY + (route.toY - route.fromY) * p;
                view.updateVal(elId, view.gpuTranslate(x, y, "translate(-50%, -50%)"), "style.transform");
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
                view.updateVal(`innCarrier_${ci}`, "none", "style.display");
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
            view.updateVal(elId, carrier ? "" : "none", "style.display");
            if (carrier) {
                const route = engine.getCarrierRoutePoints(carrier);
                const p = carrier.progress || 0;
                const x = route.fromX + (route.toX - route.fromX) * p;
                const y = route.fromY + (route.toY - route.fromY) * p;
                view.updateVal(elId, view.gpuTranslate(x, y, "translate(-50%, -50%)"), "style.transform");
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
        const researchRate = typeof engine.getScrollArchivesResearchRate === "function" ? engine.getScrollArchivesResearchRate() : 0;
        const researching = researchRate > 0 && lib && !lib.researchPaused;
        const drain = researching ? researchRate * 10 : 0;
        view.updateVal("manaRateArchiveDrain", researching ? ` (-${round1Fixed(drain)}/s)` : "");
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
        const divinity = data.progress.divinity || { amount: 0, capacity: 100000 };
        const cap = divinity.capacity || 100000;
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
        view.updateVal(`${buildingKey}ManaExplain_row`, visible ? "" : "none", "style.display");
        if (buildingKey === "inn" && visible) {
            const bonus = engine.getInnGentleLightsRestfulnessBonus();
            view.updateVal(`${buildingKey}ManaExplain_row`, `Gentle Lights use 5 mana/s per occupied room and grant +${bonus} restfulness/s while mana is available. Fill Mana weaves Okami to transfer global mana into this reservoir.`);
        }
        if (buildingKey === "stonePile" && visible) {
            const batch = engine.getStoneDuplicatorBatch();
            const costText = batch.stone === 1 ? "100 mana" : "10 stone and 500 mana";
            const resultText = batch.stone === 1
                ? "one unduplicated stone into two duplicated stone"
                : `${batch.stone} unduplicated stone into ${batch.stone * 2} duplicated stone`;
            view.updateVal(`${buildingKey}ManaExplain_row`, `Every 10 seconds, uses ${costText} to turn ${resultText}. Fill Mana weaves Okami to transfer global mana into this reservoir.`);
        }
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
            view.updateVal("orbBaseManaCloneBonusText", `(+${bonusBase} + ${dens} = ${totalBonus} base mana per clone dispersal)`);
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
            view.updateVal(btnId, "Exchange 1000 coins for 1000 credits in 40 threads to weave.");
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
        view.updateVal("shrineDivinityRateText", round2(engine.getShrineDivinityRate()));
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
            let opacity = 0;
            if (progress >= 1) {
                opacity = 0.2 + 0.8 * ((progress - 1) / Math.max(1, roadCap - 1));
            }
            if (line._dirtRoadOpacity !== opacity) {
                line._dirtRoadOpacity = opacity;
                line.setAttribute("stroke-opacity", String(opacity));
            }
            if (hotspot) {
                const showTip = progress > 0;
                hotspot.style.display = showTip ? "" : "none";
                if (showTip) {
                    const remainMs = Math.max(0, 30000 - (road.decayAccMs || 0));
                    hotspot._dirtRoadTipHtml = `${progress} / ${roadCap}<br>+${round1(progress * 0.5)}% speed<br>${Math.ceil(remainMs / 1000)}s to next decrease`;
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
        tip.style.top = `${mapY + 12}px`;
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
        view.updateMapBuildingManaBar("inn", "mapInnManaProgressWrap", "mapInnManaProgressFill");
        view.updateMapBuildingManaBar("torii", "mapToriiManaProgressWrap", "mapToriiManaProgressFill");
        view.updateMapWaterBar(engine.isToriiDrinkingBowlUnlocked(), torii.water || 0, engine.getToriiWaterCapacity(), "mapToriiWaterProgressWrap", "mapToriiWaterProgressFill");
        view.updateMapWaterBar(engine.isInnOnsenConverted(), inn.hotWater || 0, engine.getInnHotWaterCapacity(), "mapInnWaterProgressWrap", "mapInnWaterProgressFill");
        const noodleBar = base.noodleBar || {};
        view.updateMapWaterBar(engine.isNoodleBarBuilt(), noodleBar.hotWater || 0, engine.getNoodleBarHotWaterCapacity(), "mapNoodleWaterProgressWrap", "mapNoodleWaterProgressFill");
        view.updateMapWaterBar(engine.isNoodleBarBuilt(), Math.min(100, noodleBar.tipProgress || 0), 100, "mapNoodleTipProgressWrap", "mapNoodleTipProgressFill");
        view.updateMapBuildingManaBar("stonePile", "mapStonePileManaProgressWrap", "mapStonePileManaProgressFill");
        view.updateMapBuildingManaBar("hiddenSpring", "mapHiddenSpringManaProgressWrap", "mapHiddenSpringManaProgressFill");
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
        view.updateVal("marketCarryAmountText", resortData.getKitsuneCarryCapacity());
        view.updateMarketProgressDisplays();
        setChk("marketAllowStone_chk", market.allowStone);
        setChk("marketAllowWood_chk", market.allowWood);
        setChk("marketAllowBars_chk", market.allowBars);
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
                const costHtml = resortData.formatCostAmountHtml(td.creditCost, "credit", "Credit");
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
        view.updateVal("noodleBarEatRestBonusText", engine.getNoodleEatRestBonus());
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
                    view.updateVal(`noodleTipSkill_${i}_shard`, "none", "style.display");
                    continue;
                }
                const skill = data.progress.skills && data.progress.skills[key];
                view.updateVal(`noodleTipSkill_${i}_shard`, engine.skillHasShardOnTravelableMap(key) ? "" : "none", "style.display");
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
    },
    updateBasePanelMageTower: function(t) {
        const orb = data.progress.base.mage_tower;
        this.updateResortWorkerControls("mage_tower", engine.getOrbExpGainPerSecond() > 0 || engine.getOkami().assignedBuildingKey === "mage_tower");
        view.updateOrbProgressDisplays();
        t.refreshOrderedPurchasables("mage_tower", resortData.buildings.mage_tower.upgradesOrder, { hideMaxed: t.hideMaxed });
    },
    updateBambooForestInfo: function() {
        const bf = data.progress.base.bambooForest;
        view.updateVal("bambooForestInfoChips", bf.chips || 0, "textContent", "floor");
        view.updateVal("bambooForestInfoWood", bf.wood || 0, "textContent", "floor");
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
        for (let pi = 0; pi < 12; pi++) {
            const pebble = pebbles[pi];
            const pid = `pebbleToken_${pi}`;
            const pAmtId = `pebbleTokenAmt_${pi}`;
            view.updateVal(pid, pebble ? "" : "none", "style.display");
            view.updateVal(pAmtId, pebble ? "" : "none", "style.display");
            if (pebble && engine.getResortPathPosition) {
                const pos = engine.getResortPathPosition(pebble.pathProgress || 0);
                view.updateVal(pid, view.gpuTranslate(pos.x - 4, pos.y - 4), "style.transform");
                view.updateVal(pid, engine.earthSpiritColors[pebble.colorIndex || 0], "style.backgroundColor");
                view.updateVal(pid, engine.earthSpiritColors[pebble.colorIndex || 0], "style.borderColor");
                view.updateVal(pAmtId, pebble ? engine.formatPebblePayloadLabel(pebble) : "", "textContent");
                view.updateVal(pAmtId, view.gpuTranslate(pos.x, pos.y + 8, "translateX(-50%)"), "style.transform");
            }
        }
        const droplets = base.droplets || [];
        for (let di = 0; di < 12; di++) {
            const droplet = droplets[di];
            const did = `dropletToken_${di}`;
            const dAmtBelow = `dropletTokenAmtBelow_${di}`;
            const dAmtTop = `dropletTokenAmtTop_${di}`;
            view.updateVal(did, droplet ? "" : "none", "style.display");
            view.updateVal(dAmtBelow, droplet ? "" : "none", "style.display");
            view.updateVal(dAmtTop, droplet ? "" : "none", "style.display");
            if (droplet && engine.getResortPathPosition) {
                const dpos = engine.getResortPathPosition(droplet.pathProgress || 0);
                view.updateVal(did, view.gpuTranslate(dpos.x - 5, dpos.y - 5), "style.transform");
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
                view.updateVal(dAmtBelow, view.gpuTranslate(dpos.x, dpos.y + 10, "translateX(-50%)"), "style.transform");
                const essDisp = round2(droplet.essence || 0);
                const topLabel = essDisp > 1
                    ? `${essDisp}E`
                    : `${round1(droplet.heat || 0)}C`;
                view.updateVal(dAmtTop, topLabel, "textContent");
                view.updateVal(dAmtTop, view.gpuTranslate(dpos.x, dpos.y - 18, "translateX(-50%)"), "style.transform");
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
        const projectiles = (fl && fl.projectiles) || [];
        for (let pi = 0; pi < 8; pi++) {
            const pid = `fireLauncherProjectile_${pi}`;
            const p = pi < projectiles.length ? projectiles[pi] : null;
            view.updateVal(pid, p ? "" : "none", "style.display");
            if (!p) {
                continue;
            }
            const t = Math.min(1, (p.progress || 0) / (p.durationMs || 1050));
            const x = (p.fromX || 0) + ((p.toX || 0) - (p.fromX || 0)) * t;
            const y = (p.fromY || 0) + ((p.toY || 0) - (p.fromY || 0)) * t;
            const size = p.sizePx || 28;
            const half = size / 2;
            view.updateVal(pid, `${size}px`, "style.width");
            view.updateVal(pid, `${size}px`, "style.height");
            view.updateVal(pid, view.gpuTranslate(x - half, y - half), "style.transform");
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
            const diam = (pulse.rangePx || 0) * 2;
            view.updateVal(aid, view.gpuTranslate(pulse.x, pulse.y, "translate(-50%, -50%)"), "style.transform");
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
        const intervalSec = def.intervalMs / 1000;
        const intervalStr = intervalSec >= 1 ? intervalSec.toFixed(1) : intervalSec.toFixed(2);
        const rangePx = Math.round(engine.getFireLauncherRangePx(key));
        const heatPerStrike = engine.getFireLauncherHeatPerStrike(key);
        const rangeBonusPct = engine.getFireLauncherRangeBonusPct(key);
        const heatBonusPct = engine.getFireLauncherHeatBonusPct(key);
        view.updateVal("fireLauncherInfoTitle", def.name);
        view.updateVal("fireLauncherInfoType", attackLabel);
        view.updateVal("fireLauncherInfoEmbers", round1Fixed(state ? state.embers || 0 : 0));
        view.updateVal("fireLauncherInfoEmbersCap", engine.getFireLauncherMaxEmbers(key));
        view.updateVal("fireLauncherInfoEmbersRequire", spirit ? "none" : "", "style.display");
        view.updateVal("fireLauncherInfoRange", rangePx);
        view.updateVal("fireLauncherInfoRangeBonus", rangeBonusPct > 0 ? ` (+${rangeBonusPct}%)` : "");
        view.updateVal("fireLauncherInfoInterval", intervalStr);
        view.updateVal("fireLauncherInfoEmberCost", def.emberCost);
        const heatText = def.attackType === "aoe"
            ? `${round2(heatPerStrike)}C (all in range)`
            : `${round2(heatPerStrike)}C`;
        view.updateVal("fireLauncherInfoHeat", heatText);
        view.updateVal("fireLauncherInfoHeatBonus", heatBonusPct > 0 ? ` (+${heatBonusPct}%)` : "");
        view.updateVal("fireLauncherInfoExp", round2(heatPerStrike / 5));
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
        view.updateVal("spiritInfoTrainingNote", atTraining ? "" : "none", "style.display");
        if (atTraining && engine.getSpiritTrainingCardEffects) {
            const trainFx = engine.getSpiritTrainingCardEffects();
            view.updateVal("spiritTrainingMinManaText", roundNearestDecimals(trainFx.cost, 2));
            view.updateVal("spiritTrainingCostText", roundNearestDecimals(trainFx.cost, 2));
            view.updateVal("spiritTrainingDurationText", roundNearestDecimals(trainFx.durationMs / 1000, 2));
            view.updateVal("spiritTrainingExpText", roundNearestDecimals(trainFx.exp, 2));
            view.updateVal("spiritTrainingGainText", roundNearestDecimals(trainFx.training, 2));
        }
        view.updateVal("spiritInfoExp", round2(spirit.exp || 0));
        view.updateVal("spiritInfoExpReq", round2(spirit.expToLevel || 15));
        view.updateVal("spiritInfoExpNote", kind === "earth" || kind === "water" || kind === "fire" || kind === "plant" ? "(×1.8/lvl)" : "", "textContent");
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
            view.updateVal("spiritInfoPebbleCarry", engine.getEarthSpiritPebbleCarryAmount(spirit));
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
                const spiritDroplets = engine.getDropletsForSpirit(spirit.id);
                if (spiritDroplets.length > 0) {
                    const droplet = spiritDroplets[0];
                    view.updateVal("spiritInfoWaterVolume", `${round2(droplet.waterVolume || 0)}L`);
                    view.updateVal("spiritInfoHeat", `${round1Fixed(droplet.heat || 0)}C`);
                    view.updateVal("spiritInfoEssence", round2(droplet.essence || 0));
                    view.updateVal("spiritInfoTaskText", "droplet active");
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
                    view.updateVal("spiritInfoTaskText", task.text);
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
                data.progress.selectedFireLauncherKey = launcherKey;
                view.updateVal("spiritInfoFireLauncherExtras", "", "style.display");
                view.updateVal("spiritInfoFireLauncherName", def ? def.name : "Fire Launcher");
                view.updateVal("spiritInfoFireLauncherEmbers", round1Fixed(embers));
                view.updateVal("spiritInfoFireLauncherEmbersCap", maxEmbers);
                if (def) {
                    const intervalSec = def.intervalMs / 1000;
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
                    ? `Powering ${def.name} (+${round2(regenRate)} embers/s).`
                    : "Assigned to fire launcher.");
                view.updateVal("spiritInfoTaskText", `charging embers (${round1Fixed(embers)}/${maxEmbers})`);
                const pct = Math.max(0, Math.min(100, (embers / maxEmbers) * 100));
                view.updateVal("spiritInfoTaskFill", `${pct}%`, "style.width");
            } else if (loc === "atelier" && engine.isAtelierForgeBuilt()) {
                const batchSize = engine.getForgeSmeltBatch(spirit);
                const forgeLevel = engine.getLargerForgeBought();
                const pct = Math.max(0, Math.min(100, ((spirit.forgeTimerMs || 0) / 60000) * 100));
                const forgeNote = forgeLevel > 0
                    ? `Smelting ceil(√spirit power × ${round2(1 + 0.5 * forgeLevel)}) = ${batchSize} ore into bars every 60s. +50% per Larger Forge, rounded up. Exp = bars × 3.`
                    : `Smelting floor(√spirit power) = ${batchSize} ore into bars every 60s. Exp = bars × 3.`;
                view.updateVal("spiritInfoFireNote", forgeNote);
                view.updateVal("spiritInfoTaskText", `Forging bars (${batchSize} ore / 60s)`);
                view.updateVal("spiritInfoTaskFill", `${pct}%`, "style.width");
            } else if (loc === "bonfire") {
                const excessHeat = engine.getBonfireExcessHeatForExp();
                const expRate = excessHeat > 0 ? round2(Math.sqrt(excessHeat / 10) / 10) : 0;
                const heat = (data.progress.base.bonfire && data.progress.base.bonfire.heat) || 0;
                view.updateVal("spiritInfoFireNote", excessHeat > 0
                    ? `Warming by the bonfire (+${expRate} exp/s from heat above spirit baseline).`
                    : (heat > 0 ? "Warming by the bonfire (no excess heat for exp)." : "Warming by the bonfire (no heat yet)."));
                view.updateVal("spiritInfoTaskText", excessHeat > 0 ? `gaining exp (+${expRate}/s)` : "waiting for heat");
                const pct = excessHeat > 0 ? 100 : 0;
                view.updateVal("spiritInfoTaskFill", `${pct}%`, "style.width");
            } else {
                view.updateVal("spiritInfoFireNote", "Assign to the Bonfire, Atelier forge, or a fire launcher.");
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
            if (engine.canSpiritTrain(spirit)) {
                view.updateVal("spiritInfoTaskProgressWrap", "", "style.display");
                const ms = spirit.trainingTimerMs || 0;
                const pct = Math.max(0, Math.min(100, (ms / 60000) * 100));
                view.updateVal("spiritInfoTaskText", `Training (${round1Fixed(ms / 1000)}/60s)`);
                view.updateVal("spiritInfoTaskFill", `${pct}%`, "style.width");
            } else {
                view.updateVal("spiritInfoTaskProgressWrap", "none", "style.display");
                view.updateVal("spiritInfoTaskText", "");
            }
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
        const cleared = engine.isMineCleared();
        view.updateVal("mineStatusText", cleared ? "Playing in the Dirt" : "Mining...");
        view.updateVal("mineDirtText", mine.resources.dirt, "textContent", 2);
        view.updateVal("mineStoneText", mine.resources.stone, "textContent", 2);
        const oreMined = !!(data.progress.base.hiddenSpring && data.progress.base.hiddenSpring.oreMined);
        view.updateVal("mineOreRow", oreMined ? "" : "none", "style.display");
        if (oreMined) {
            view.updateVal("mineOreText", round2(mine.resources.ore || 0));
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
    },
    updateBuyableUpgradesOverlay: function(forceList) {
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
        if (!forceList && !events._buyableTooltipOpen) {
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
                    if (typeof u.upgradeSoldOut === "function" && u.upgradeSoldOut()) {
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
            view.updateVal("toriiWaterReq_row", bowl ? "" : "none", "style.display");
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
                    if (typeof u.upgradeSoldOut === "function" && u.upgradeSoldOut()) {
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
            view.updateVal("innOnsenTempReq_row", onsen ? "" : "none", "style.display");
            view.updateVal("innOnsenSoak_row", onsen ? "" : "none", "style.display");
            view.updateVal("innOnsenPondExplain_row", onsen && engine.isPondBuiltFromFoxDen() ? "" : "none", "style.display");
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
            view.updateVal("pathSegmentStateText", stateText);
            const showNextPathBtn = !!(seg && seg.state !== "Large Rocks" && pathIdx > 0);
            view.updateVal("base_path_select_next_row", showNextPathBtn ? "" : "none", "style.display");
            const t = view._basePanelPurchasingTools(base, null, false);
            const pathOpts = Object.assign({}, t.soldOutUpgradeRowOpts(false, "path"), {
                buyButtonText: function(pk, u) {
                    const weaveUi = pathIdx !== undefined && pathIdx !== null
                        ? engine.getPathUpgradeWeaveUi(pathIdx, pk) : null;
                    if (weaveUi) {
                        return weaveUi.label;
                    }
                    if (typeof u.upgradeSoldOut === "function" && u.upgradeSoldOut()) {
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
                    if (typeof u.upgradeSoldOut === "function" && u.upgradeSoldOut()) {
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
            const t = view._basePanelPurchasingTools(base, null, false);
            this.updateBasePanelScrollArchives(base, t);
        } else if (selected === "cistern") {
            const cistern = base.cistern || {};
            const maxCap = engine.getCisternMaxCapacity();
            const curVol = cistern.waterVolume || 0;
            view.updateVal("cisternInfoWater", `${round2(curVol)}L`);
            view.updateVal("cisternInfoTemperature", `${round1Fixed(cistern.temperature || 0)}C`);
            const launcherBuilt = !!((base.atelier && base.atelier.fireLaunchersBought) >= 1);
            view.updateVal("cisternInfoEssence_row", launcherBuilt ? "" : "none", "style.display");
            if (launcherBuilt) {
                view.updateVal("cisternInfoEssence", round2(cistern.essence || 0));
            }
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
            const pondBuilt = engine.isPondBuiltFromFoxDen();
            view.updateVal("cisternEmptyHalf_btn", pondBuilt ? "" : "none", "style.display");
            view.updateVal("cisternEmptyHalf_btn", !pondBuilt || (cistern.waterVolume || 0) <= 0, "disabled");
            const tCistern = view._basePanelPurchasingTools(base, null, data.progress.options.hideMaxedUpgrades);
            tCistern.refreshOrderedPurchasables("cistern", resortData.buildings.cistern.upgradesOrder, { hideMaxed: tCistern.hideMaxed });
            if (engine.cisternWorkersRevealed()) {
                this.updateResortWorkerControls("cistern", engine.cisternHasAssignedCarriers());
            }
        } else if (selected === "pond") {
            const pond = base.pond || {};
            view.updateVal("pondInfoWater", `${round2(pond.waterVolume || 0)}L`);
            const wellRate = engine.getWishingWellWaterRate ? engine.getWishingWellWaterRate() : 0;
            const drainText = `-${round2(engine.getPondForestDrainPerSecond())} L/s`;
            view.updateVal("pondWishingWellRate", wellRate > 0 ? `+${wellRate} L/s | ${drainText}` : drainText);
            const pondWater = pond.waterVolume || 0;
            const pondExp = pondWater > 0 ? round2(Math.sqrt(pondWater) / 50) : 0;
            view.updateVal("pondWaterSpiritExp", pondWater > 0 ? `√(water)/50 = ${pondExp}/s` : `√(water)/50 = 0/s`);
            view.updateVal("pondSendWater_row", "none", "style.display");
            if (viewData.cached.base_pond_pipes_to_forest_row) {
                view.updateVal("base_pond_pipes_to_forest_row", "none", "style.display");
            }
            const tPond = view._basePanelPurchasingTools(base, null, data.progress.options.hideMaxedUpgrades);
            tPond.refreshOrderedPurchasables("pond", resortData.buildings.pond.upgradesOrder, { hideMaxed: tPond.hideMaxed });
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
        view.updateVal("bambooForestMapDisplay", `${resortData.resourceIconHtml("wood")} ${intToStringRound((base.bambooForest && base.bambooForest.wood) || 0)}`, "innerHTML");
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
                travelEl.style.transform = view.gpuTranslate(pos.x - 8, pos.y - 8);
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
                    weaveTokenEl.style.transform = view.gpuTranslate(pos.x, pos.y, "translate(-100%, -50%)");
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
            applyNotifyLabel(k, need);
        }
    },
    renderAttributePlanList: function() {
        const el = viewData.cached.attributePlanList;
        const plan = (data.progress.attributePlan || []).slice().sort(function(a, b) { return a.level - b.level; });
        const attrLabel = function(key) {
            if (key === "str") {
                return "Bru";
            }
            if (key === "con") {
                return "Con";
            }
            if (key === "spd") {
                return "Spd";
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
        let html = `<div class="history-row history-header"><span>Map</span><span>Duration</span><span>Level</span><span>Kills</span><span>${resortData.resourceIconHtml("coins")} Coins</span><span>Okami Exp</span><span>Density</span></div>`;
        if (!runs.length) {
            html += `<div class="muted-text">No runs yet.</div>`;
        }
        for (let i = 0; i < runs.length; i++) {
            const run = runs[i];
            const lvl = run.level !== undefined ? run.level : 0;
            const kills = run.kills !== undefined ? run.kills : 0;
            const mapName = run.mapKey ? view.getMapDisplayName(run.mapKey) : "—";
            const okamiExp = run.okamiExpGained !== undefined ? run.okamiExpGained : 0;
            const density = run.cloneDensity !== undefined && run.cloneDensity !== null ? run.cloneDensity : "—";
            let starHtml = "";
            if (run.starCleared === "bronze" || run.starCleared === "silver" || run.starCleared === "gold") {
                starHtml = ` <span class="history-duration-star skill-star-${run.starCleared} skill-star-filled">★</span>`;
            }
            html += `<div class="history-entry"><div class="history-row"><span title="${mapName}">${mapName}</span><span>${round1(run.survivedSeconds)}s${starHtml}</span><span>${lvl}</span><span>${kills}</span><span>${intToStringRound(run.coinsGained)}</span><span>${round2(okamiExp)}</span><span>${density}</span></div>`;
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
            const shardRows = run.shardRows || [];
            if (shardRows.length > 0) {
                html += `<div class="history-shards muted-text">Shards Gained: ${shardRows.join(" | ")}</div>`;
            } else if ((run.shardsGained || 0) > 0) {
                html += `<div class="history-shards muted-text">Shards Gained: ${intToStringRound(run.shardsGained)}</div>`;
            }
            html += `</div>`;
        }
        if (viewData.prevValues.historyHtml !== html) {
            el.innerHTML = html;
            viewData.prevValues.historyHtml = html;
        }
    },
    /** Show/hide static skill cards for the active Skills sub-tab; toggle empty-state row. */
    updateSkillsListVisibility: function(selectedTab) {
        const tab = selectedTab !== undefined && selectedTab !== null ? selectedTab : (data.progress.selectedSkillsTab || "combat");
        const list = skills.getSkillKeysByCategory(data.progress.skills, tab);
        const visible = {};
        for (let i = 0; i < list.length; i++) {
            visible[list[i]] = true;
        }
        for (let i = 0; i < skills.keysInOrder.length; i++) {
            const k = skills.keysInOrder[i];
            const wrap = viewData.cached[`skill_wrap_${k}`];
            if (wrap) {
                wrap.style.display = visible[k] ? "" : "none";
            }
        }
        view.applySkillListSort();
        const emptyEl = viewData.cached.skillsListEmpty;
        if (!emptyEl) {
            return;
        }
        if (list.length > 0) {
            emptyEl.style.display = "none";
            return;
        }
        emptyEl.style.display = "block";
        const currentCls = data.progress.currentClassKey || "none";
        const hasActiveClass = ["condescend", "scold", "mock"].indexOf(currentCls) >= 0;
        let msg = "";
        if (tab === "class") {
            msg = hasActiveClass ? "Buy class skills in the Scroll Archives." : "Choose a class at the Bonfire to see class skills here.";
        } else if (tab === "foraging") {
            msg = "No foraging skills unlocked yet. Visit the Scroll Archives in Base.";
        } else {
            msg = "No combat skills unlocked yet. Visit the Scroll Archives in Base.";
        }
        emptyEl.textContent = msg;
    },
    applySkillListSort: function() {
        const column = viewData.cached.skillsListColumn;
        if (!column) {
            return;
        }
        const sortMode = data.progress.skillListSort;
        const sort = sortMode === "talent" || sortMode === "alpha" || sortMode === "tips" || sortMode === "grouping" || sortMode === "shards"
            ? sortMode
            : "oldest";
        const oldestRadio = viewData.cached.skillSortOldest;
        const talentRadio = viewData.cached.skillSortTalent;
        const alphaRadio = viewData.cached.skillSortAlpha;
        const tipsRadio = viewData.cached.skillSortTips;
        const groupingRadio = viewData.cached.skillSortGrouping;
        const shardsRadio = viewData.cached.skillSortShards;
        if (oldestRadio) {
            oldestRadio.checked = sort === "oldest";
        }
        if (talentRadio) {
            talentRadio.checked = sort === "talent";
        }
        if (alphaRadio) {
            alphaRadio.checked = sort === "alpha";
        }
        if (tipsRadio) {
            tipsRadio.checked = sort === "tips";
        }
        if (groupingRadio) {
            groupingRadio.checked = sort === "grouping";
        }
        if (shardsRadio) {
            shardsRadio.checked = sort === "shards";
        }
        const unlocked = (data.progress.base && data.progress.base.scrollArchives && data.progress.base.scrollArchives.unlockedSkills) || {};
        const unlockIndex = {};
        const unlockKeys = Object.keys(unlocked);
        for (let ui = 0; ui < unlockKeys.length; ui++) {
            unlockIndex[unlockKeys[ui]] = ui;
        }
        const keys = skills.keysInOrder.slice();
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
            } else if (sort === "shards") {
                const ha = (sa && sa.shards) || 0;
                const hb = (sb && sb.shards) || 0;
                if (hb !== ha) {
                    return hb - ha;
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
        const current = [];
        for (let ci = 0; ci < column.children.length; ci++) {
            const child = column.children[ci];
            if (child.id && child.id.indexOf("skill_wrap_") === 0) {
                current.push(child.getAttribute("data-skill-key"));
            }
        }
        let same = current.length === keys.length;
        for (let si = 0; same && si < keys.length; si++) {
            if (current[si] !== keys[si]) {
                same = false;
            }
        }
        if (same) {
            return;
        }
        for (let ki = 0; ki < keys.length; ki++) {
            const wrap = viewData.cached[`skill_wrap_${keys[ki]}`];
            if (wrap) {
                column.appendChild(wrap);
            }
        }
        const emptyEl = viewData.cached.skillsListEmpty;
        if (emptyEl) {
            column.insertBefore(emptyEl, column.firstChild);
        }
    },
    syncSelectedSkillDetailKey: function(tab) {
        const t = tab !== undefined && tab !== null ? tab : (data.progress.selectedSkillsTab || "combat");
        const list = skills.getSkillKeysByCategory(data.progress.skills, t);
        if (!list.length) {
            data.progress.selectedSkillDetailKey = "";
            return;
        }
        const sel = data.progress.selectedSkillDetailKey;
        // Keep the explicit "no selection" state so the panel can be hidden.
        if (sel === undefined || sel === null) {
            data.progress.selectedSkillDetailKey = "";
            return;
        }
        if (sel === "") {
            return;
        }
        if (list.indexOf(sel) < 0) {
            data.progress.selectedSkillDetailKey = list[0];
        }
    },
    applySkillDetailSelectionHighlight: function() {
        const sel = data.progress.selectedSkillDetailKey;
        for (let i = 0; i < skills.keysInOrder.length; i++) {
            const k = skills.keysInOrder[i];
            const wrap = viewData.cached[`skill_wrap_${k}`];
            if (wrap) {
                wrap.classList.toggle("skill-row--selected", k === sel);
            }
        }
    },
    /** Left column: name row, stars + lvl/talent row, stacked exp/talent bars. */
    updateSkillRowCompact: function(skillKey) {
        const skill = data.progress.skills[skillKey];
        if (!skill) {
            return;
        }
        const expPct = Math.min(100, Math.max(0, (skill.exp / skill.expToLevel) * 100));
        const talPct = Math.min(100, Math.max(0, (skill.talent / skill.talentToLevel) * 100));
        view.updateVal(`skill_${skillKey}_name`, skill.name);
        view.updateVal(`skill_${skillKey}_lvl_talent`, `Lvl ${skill.level} · Talent ${skill.talentLevel}`);
        view.updateVal(`skill_${skillKey}_exp_fill`, `${expPct}%`, "style.width");
        view.updateVal(`skill_${skillKey}_talent_fill`, `${talPct}%`, "style.width");
        const cat = skill.category || "combat";
        const starEligible = (cat === "combat" || cat === "class");
        view.updateVal(`skill_${skillKey}_stars_controls`, starEligible ? "" : "none", "style.display");
        if (starEligible) {
            const stars = skill.stars || {};
            view.updateVal(`skill_${skillKey}_star_bronze`, stars.bronze ? "★" : "☆");
            view.updateVal(`skill_${skillKey}_star_silver`, stars.silver ? "★" : "☆");
            view.updateVal(`skill_${skillKey}_star_gold`, stars.gold ? "★" : "☆");
            view.updateVal(`skill_${skillKey}_star_bronze`, !!stars.bronze, "classList.toggle", "skill-star-filled");
            view.updateVal(`skill_${skillKey}_star_silver`, !!stars.silver, "classList.toggle", "skill-star-filled");
            view.updateVal(`skill_${skillKey}_star_gold`, !!stars.gold, "classList.toggle", "skill-star-filled");
        }
    },
    /** Right column: detail for data.progress.selectedSkillDetailKey (generic ids). */
    updateSkillInfoPanel: function() {
        const tab = data.progress.selectedSkillsTab || "combat";
        const list = skills.getSkillKeysByCategory(data.progress.skills, tab);
        if (data.progress.selectedSkillDetailKey === undefined || data.progress.selectedSkillDetailKey === null) {
            data.progress.selectedSkillDetailKey = "";
        }
        if (!list.length) {
            view.updateVal("skillInfoPanel", "none", "style.display");
            view.updateVal("skillInfo_title", "");
            view.updateVal("skillInfo_current", "", "innerHTML");
            view.updateVal("skillInfo_current_wrap", "none", "style.display");
            view.updateVal("skillInfo_reward", "", "innerHTML");
            view.updateVal("skillInfo_trigger", "");
            view.updateVal("skillInfo_exp_on_trigger", "");
            view.updateVal("skillInfo_initial_exp_shards", "");
            view.updateVal("skillInfo_exp_mults", "");
            view.updateVal("skillInfo_exp_text", "");
            view.updateVal("skillInfo_exp_fill", "0%", "style.width");
            view.updateVal("skillInfo_talent_text", "");
            view.updateVal("skillInfo_talent_fill", "0%", "style.width");
            view.updateVal("skillInfo_star_effect_row", "none", "style.display");
            view.updateVal("skillInfo_tips_row", "none", "style.display");
            view.updateVal("skillInfo_combined_mults", "");
            view.updateVal("skillInfo_integration_row", "none", "style.display");
            view.updateVal("skillInfo_integration_mult", "");
            view.updateVal("skillInfo_flavor", "");
            return;
        }
        const skillKey = data.progress.selectedSkillDetailKey;
        if (!skillKey) {
            view.updateVal("skillInfoPanel", "none", "style.display");
            view.updateVal("skillInfo_title", "");
            view.updateVal("skillInfo_current", "", "innerHTML");
            view.updateVal("skillInfo_current_wrap", "none", "style.display");
            view.updateVal("skillInfo_integration_row", "none", "style.display");
            view.updateVal("skillInfo_flavor", "");
            return;
        }
        if (list.indexOf(skillKey) < 0) {
            view.updateVal("skillInfoPanel", "none", "style.display");
            view.updateVal("skillInfo_current", "", "innerHTML");
            view.updateVal("skillInfo_current_wrap", "none", "style.display");
            view.updateVal("skillInfo_integration_row", "none", "style.display");
            view.updateVal("skillInfo_flavor", "");
            return;
        }
        view.updateVal("skillInfoPanel", "", "style.display");
        const skill = data.progress.skills[skillKey];
        const parts = skills.skillExpGainParts(skill);
        const intMultOthers = typeof skills.getOtherSkillExpMultiplier === "function"
            ? skills.getOtherSkillExpMultiplier(skillKey)
            : (skillKey !== "echoChamber" ? skills.getEchoChamberExpMultiplierForOthers() : 1);
        const soulMult = engine.getSoulSkillExpMultiplier();
        const expPerTrigger = skills.expGainForSkillTrigger(skill, 1) * intMultOthers * soulMult;
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
        view.updateVal("skillInfo_exp_on_trigger", `Exp on trigger: ${round2(expPerTrigger)}`);
        view.updateVal("skillInfo_initial_exp_shards", `Initial exp from shards: ${intToStringRound(skill.shards || 0)}`);
        view.updateVal("skillInfo_exp_mults", `· Skill level ×${parts.levelMult.toFixed(4)}`);
        view.updateVal("skillInfo_exp_text", `${round1Fixed(skill.exp)} / ${round1Fixed(skill.expToLevel)}`);
        view.updateVal("skillInfo_exp_fill", `${expPct}%`, "style.width");
        view.updateVal("skillInfo_talent_text", `${round1Fixed(skill.talent)} / ${round1Fixed(skill.talentToLevel)} (Lv ${skill.talentLevel}) · exp ×${parts.talentMult.toFixed(4)}`);
        view.updateVal("skillInfo_talent_fill", `${talPct}%`, "style.width");
        const starMult = parts.starMult || 1;
        view.updateVal("skillInfo_star_effect_row", starMult > 1 ? "" : "none", "style.display");
        view.updateVal("skillInfo_star_effect", `×${starMult.toFixed(4)}`);
        view.updateVal("skillInfo_tips_row", tipsVal > 0 ? "" : "none", "style.display");
        view.updateVal("skillInfo_tips_text", `${tipsVal}, Tip Exp Bonus: x${parts.tipsMult.toFixed(2)}`);
        view.updateVal("skillInfo_tips_mults", "");
        const showOtherSkillMult = (skills.isSkillUnlocked("echoChamber") && skillKey !== "echoChamber")
            || (skills.isSkillUnlocked("studyGroup") && skillKey !== "studyGroup");
        if (showOtherSkillMult) {
            view.updateVal("skillInfo_integration_mult", `×${intMultOthers.toFixed(4)}`);
            view.updateVal("skillInfo_integration_row", "", "style.display");
        } else {
            view.updateVal("skillInfo_integration_row", "none", "style.display");
        }
        // Combined includes Echo Chamber / Study Group for other skills; each is excluded from its own bonus.
        view.updateVal("skillInfo_combined_mults", `×${(parts.combinedMult * intMultOthers).toFixed(4)}`);
        view.updateVal("skillInfo_flavor", skills.getSkillFlavorText(skillKey), "innerHTML");
    },
    updateSkillSubTabs: function() {
        const tab = data.progress.selectedSkillsTab || "combat";
        view.updateVal("skillSubTab_combat", tab === "combat" ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
        view.updateVal("skillSubTab_foraging", "none", "style.display");
        view.updateVal("skillSubTab_class", tab === "class" ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
    },
    updatePlayerBattleBars: function() {
        const p = data.battle.player;
        const isForaging = (data.battle.mode || "combat") === "foraging";
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
            if (isForaging) {
                if (rngTrack) {
                    rngTrack.style.display = "none";
                }
                rngFill.style.width = "0%";
                view.updateVal("playerSandalBarLabel", "Foraging");
            } else {
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
    updateCardBonusesTab: function() {
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
    updateTabButtons: function(activeTab) {
        const tabs = events.mainMenuTabOrder();
        const allTabs = ["base", "guests", "leveling", "stats", "skills", "travel", "history", "cardBonuses", "options"];
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
            const posKey = `${leftPx}|${Math.round(renderY)}`;
            if (renderCache.sizeKey !== sizeKey) {
                intruderEl.style.width = `${intruder.sizePx}px`;
                intruderEl.style.height = `${intruder.sizePx}px`;
                renderCache.sizeKey = sizeKey;
            }
            if (renderCache.posKey !== posKey) {
                intruderEl.style.transform = view.gpuTranslate(leftPx, renderY);
                renderCache.posKey = posKey;
            }
            const shapeLayer = intruderEl.querySelector(".intruder-shape-layer");
            if (shapeLayer) {
                const isForageUnit = intruder.intruderType === "tree" || intruder.intruderType === "bush" || intruder.intruderType === "ore_vein";
                const lecherOn = intruder.intruderType === "lecher";
                const spriteImg = shapeLayer.querySelector(".intruder-sprite-img");
                if (spriteImg) {
                    if (isForageUnit) {
                        if (renderCache.spriteSrc) {
                            spriteImg.style.display = "none";
                            renderCache.spriteSrc = null;
                        }
                    } else {
                        const spriteSrc = lecherOn ? "img/lecher.svg" : "img/scoundrel.svg";
                        if (renderCache.spriteSrc !== spriteSrc) {
                            spriteImg.src = spriteSrc;
                            spriteImg.style.display = "";
                            renderCache.spriteSrc = spriteSrc;
                        }
                    }
                }
                if (renderCache.lecherOn !== lecherOn) {
                    shapeLayer.classList.toggle("intruder-token-lecher", lecherOn);
                    renderCache.lecherOn = lecherOn;
                }
                if (isForageUnit) {
                    const fill = intruder.intruderType === "tree" ? "#6f4e37" : (intruder.intruderType === "bush" ? "#3f7d3f" : "#737373");
                    const forageKey = `${intruder.intruderType}|${fill}`;
                    if (renderCache.forageKey !== forageKey) {
                        shapeLayer.style.clipPath = "none";
                        shapeLayer.style.border = "1px solid #2d2d2d";
                        shapeLayer.style.background = fill;
                        renderCache.forageKey = forageKey;
                    }
                } else if (renderCache.forageKey) {
                    shapeLayer.style.background = "";
                    renderCache.forageKey = null;
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
                const lowAud = (intruder.maxAud || 0) < 100;
                let audText;
                if (lowAud) {
                    const cur = Math.max(0, roundNearestDecimals(intruder.aud, 1));
                    const mxInt = Math.round(Math.max(0, intruder.maxAud || 0));
                    audText = `${cur.toFixed(1)}/${mxInt} Aud`;
                } else {
                    audText = `${Math.round(intruder.aud)}/${intruder.maxAud} Aud`;
                }
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
                const foraging = (data.battle.mode || "combat") === "foraging";
                if (foraging) {
                    if (renderCache.atkMode !== "foraging") {
                        atkFill.style.width = "0%";
                        const atkWrap = intruderEl.querySelector(".intruder-stat-atk-wrap");
                        if (atkWrap) {
                            atkWrap.style.display = "none";
                        }
                        renderCache.atkMode = "foraging";
                        renderCache.atkWidth = "0%";
                    }
                } else {
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
    consumeLineFxQueue: function() {
        const q = data.battle.lineFxQueue;
        const linesRoot = viewData.cached.attackLines;
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
        const transform = view.gpuTranslate(x, y, flip ? "scaleX(-1)" : "scaleX(1)");
        if (el.style.transform !== transform) {
            el.style.transform = transform;
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
        const raisingDifficulty = (data.battle.transitionCountdownMs || 0) > 0 && !data.battle.endRunAfterCountdown;
        if (!viewData.intruderAttackGfxRender.length) {
            viewData.intruderAttackGfxRender = [];
        }
        for (let i = 0; i < els.length; i++) {
            const el = els[i];
            let render = viewData.intruderAttackGfxRender[i];
            if (!render) {
                render = viewData.intruderAttackGfxRender[i] = { active: false, kind: "", transform: "", opacity: "" };
            }
            const slot = slots[i];
            if (raisingDifficulty || !slot || !slot.active) {
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
            const transform = view.gpuTranslate(x - half, y - half);
            const opacityText = String(Math.round(Math.max(0, opacity) * 1000) / 1000);
            if (!render.active) {
                el.style.display = "block";
                render.active = true;
            }
            if (render.kind !== kind) {
                el.src = kind === "leer" ? "img/leer.svg" : "img/wink.svg";
                render.kind = kind;
            }
            if (render.transform !== transform) {
                el.style.transform = transform;
                render.transform = transform;
            }
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
        const raisingDifficulty = (data.battle.transitionCountdownMs || 0) > 0 && !data.battle.endRunAfterCountdown;
        if (raisingDifficulty) {
            view.applySlapHandImg(outerEl, false, 0, 0, false);
            view.applySlapHandImg(sideEl, false, 0, 0, false);
            view.applySlapHandImg(innerEl, false, 0, 0, false);
            cache.pose = "hidden";
            return;
        }
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
                render = viewData.slapDmgRender[i] = { active: false, text: "", opacity: "", transform: "" };
            }
            if (!slot || !slot.active) {
                if (render.active) {
                    el.style.display = "none";
                    render.active = false;
                }
                continue;
            }
            const motion = view.floatHoldThenRise(slot.elapsedMs, slot.x, slot.y);
            const text = view.formatSlapDamageText(slot.damage);
            const opacity = motion.opacity;
            const transform = motion.transform;
            if (!render.active) {
                el.style.display = "block";
                render.active = true;
            }
            if (render.text !== text) {
                el.textContent = text;
                render.text = text;
            }
            if (render.opacity !== opacity) {
                el.style.opacity = opacity;
                render.opacity = opacity;
            }
            if (render.transform !== transform) {
                el.style.transform = transform;
                render.transform = transform;
            }
        }
    },
    floatHoldThenRise: function(elapsedMs, x, y) {
        const holdMs = engine.FLOAT_HOLD_MS || 500;
        const riseMs = engine.FLOAT_RISE_MS || 1500;
        const risePx = engine.FLOAT_RISE_PX || 28;
        if (elapsedMs <= holdMs) {
            return { opacity: "1", transform: view.gpuTranslate(x, y, "translate(-50%, 0px)") };
        }
        const t = Math.max(0, Math.min(1, (elapsedMs - holdMs) / riseMs));
        return {
            opacity: String(1 - t),
            transform: view.gpuTranslate(x, y, `translate(-50%, ${Math.round(-risePx * t)}px)`)
        };
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
                render = viewData.playerFloatRender[i] = { active: false, text: "", opacity: "", transform: "", cls: "" };
            }
            if (!slot || !slot.active) {
                if (render.active) {
                    el.style.display = "none";
                    render.active = false;
                }
                continue;
            }
            const motion = view.floatHoldThenRise(slot.elapsedMs, slot.x, slot.y);
            const text = slot.text || "";
            const opacity = motion.opacity;
            const transform = motion.transform;
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
            if (render.opacity !== opacity) {
                el.style.opacity = opacity;
                render.opacity = opacity;
            }
            if (render.transform !== transform) {
                el.style.transform = transform;
                render.transform = transform;
            }
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

    spawnInnBeadFloat: function(beads) {
        if (document.hidden || (typeof isProcessingOffline !== "undefined" && isProcessingOffline)) {
            return;
        }
        if (!view.isResortMapVisible()) {
            return;
        }
        const innBtn = viewData.cached.baseBuilding_inn || document.getElementById("baseBuilding_inn");
        if (!innBtn) {
            return;
        }
        const amount = Math.round(Number(beads) || 0);
        const el = document.createElement("div");
        el.className = "inn-bead-float hypervisible";
        const label = Math.abs(amount) >= 10000 ? intToStringRound(amount) : String(amount);
        el.textContent = `+${label}`;
        const beadX = (Math.random() - 0.5) * 50;
        const beadY = (Math.random() - 0.5) * 50;
        el.style.setProperty("--inn-bead-x", `${beadX}px`);
        el.style.setProperty("--inn-bead-y", `${beadY}px`);
        el.addEventListener("animationend", function() {
            el.remove();
        });
        innBtn.appendChild(el);
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
        const open = !!(data.gameSettings && data.gameSettings.prestigePackOpen && session && session.active);
        overlay.style.display = open ? "flex" : "none";
        if (!open) {
            return;
        }
        const summary = session.phase === "summary";
        view.updateVal("prestigePackColumns", summary ? "none" : "", "style.display");
        view.updateVal("prestigePackCards", summary ? "none" : "", "style.display");
        view.updateVal("prestigePackError", summary ? "none" : "", "style.display");
        view.updateVal("prestigePackActionBtn", summary ? "none" : "", "style.display");
        view.updateVal("prestigePackSummary", "flex", "style.display");
        view.updateVal("prestigeFinishBtn", summary ? "" : "none", "style.display");
        const summaryEl = viewData.cached.prestigePackSummary || document.getElementById("prestigePackSummary");
        const lines = shrineCards.sessionBonusLines(session.gained || []);
        let summaryHtml = "";
        for (let bi = 0; bi < lines.length; bi++) {
            summaryHtml += `<div>${view.escapeHtml(lines[bi])}</div>`;
        }
        if (summary) {
            const talentAdd = (typeof skills !== "undefined" && skills.unlockedTalentLevelTotal)
                ? skills.unlockedTalentLevelTotal() : 0;
            summaryHtml += `<div class="prestige-pack-summary-sep"></div>`;
            summaryHtml += `<div>Divinity max: +${talentAdd}</div>`;
            summaryHtml += `<div class="muted-text">From the total talent levels of unlocked skills.</div>`;
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

        let typeKey = `lastValue_${type}`;
        if (type === "classList.toggle" && sigFigs) {
            typeKey = `lastValue_${type}.${sigFigs}`;
        }
        let lastVal = prevValue[typeKey] ?? null;
        // let lastVal = null;

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
