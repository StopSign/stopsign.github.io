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
};


let view = {
    updateViewAtFrame: function() { //This is the main view update function that is run once per frame
        view.renderBattlefield();
        view.updateActiveWeavingButtons();
        view.updateOkamiPanel();
        view.updateOkamiMapVisuals();
        view.updateFoxDenCarriers();
        view.updateBonfireCarriers();
        view.updateCisternCarriers();
        view.updateInnCarriers();

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
        const starEl = viewData.cached.waveInfoStar;
        if (starEl) {
            starEl.className = `wave-info-star-inline skill-star-btn ${tierStarClass}${tierStarFilled ? " skill-star-filled" : ""}`;
            starEl.title = tierStarTitle;
            starEl.textContent = tierStarFilled ? "★" : "☆";
        }
        view.updateVal("waveInfoTimeLabel", `Time ${round1(runClock)}s`);
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
        for (let si = 0; si < shardSlotCount; si++) {
            const sh = zoneShards[si];
            if (!sh) {
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
            view.updateVal(`waveInfoZone_${i}`, line);
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
        const armorFlat = twEff.toughnessArmorFlat !== undefined ? round2(twEff.toughnessArmorFlat) : 0;
        const secondaryParts = [];
        if (regenPerSec > 0) {
            secondaryParts.push(`Regen ${roundNearestDecimals(regenPerSec, 2).toFixed(2)}/s`);
        }
        if (armorFlat > 0) {
            secondaryParts.push(`Armor ${armorFlat} flat`);
        }
        view.updateVal("playerBattleHudSecondary", secondaryParts.length ? secondaryParts.join(" · ") : "-");
        const audPct = Math.max(0, Math.min(100, (data.battle.player.aud / data.battle.player.maxAud) * 100));
        view.updateVal("playerTokenAudLayer", `linear-gradient(to top, #2ad15f ${audPct}%, #0f3a1d ${audPct}%)`, "style.background");
        const runClock = (data.battle.elapsedMs || 0) / 1000;
        const growthUnlocked = bonfire.isGrowthBlessingUnlocked();
        view.updateWaveInfoPanel(runClock, growthUnlocked);
        const showOverlay = (data.battle.state === "dead" || data.battle.state === "completed") ? "flex" : "none";
        view.updateVal("deathOverlay", showOverlay, "style.display");
        const killCoins = Math.max(0, data.battle.runCoinsFromKills || 0);
        const talentEl = viewData.cached.deathTalentDetails;
        if (data.battle.state === "completed") {
            view.updateVal("deathTitle", "Map completed!");
            view.updateVal("deathSummary", `Bonus coins: ${intToStringRound(data.battle.completionBonusCoins || 0)} | Time ${round1(runClock)}s | Level ${data.battle.levelState.level} | Kills ${data.battle.enemiesKilled} | Coins ${intToStringRound(killCoins)}`);
            if (talentEl) {
                talentEl.innerHTML = "";
            }
        } else if (data.battle.state === "dead") {
            view.updateVal("deathTitle", "The clone has dispersed in embarrasment (no Aud)");
            const retryTxt = bonfire.isAutoRetryEnabled()
                ? ` | Retry in ${Math.max(0, data.progress.autoRetryCountdownSec || 0)}s`
                : "";
            view.updateVal("deathSummary", `Time ${round1(runClock)}s | Level ${data.battle.levelState.level} | Kills ${data.battle.enemiesKilled} | Coins ${intToStringRound(killCoins)}${retryTxt}`);
            const runSettings = data.battle.cloneRunSettings;
            if (runSettings) {
                const retryCost = runSettings.manaCost || bonfire.getCloneManaCostFromSnapshot(runSettings.classKey, runSettings.modifiers);
                const canRetry = engine.isManaUnlocked() && (data.progress.mana.amount || 0) >= retryCost;
                view.updateVal("tryAgainButton", `Try Again with the same settings - ${intToStringRound(retryCost)} Mana`);
                view.updateVal("tryAgainButton", !canRetry, "disabled");
            } else {
                view.updateVal("tryAgainButton", "Try Again?");
                view.updateVal("tryAgainButton", false, "disabled");
            }
            if (talentEl) {
                talentEl.innerHTML = view.buildDeathTalentSummaryHtml();
            }
        } else {
            view.updateVal("deathSummary", "");
            if (talentEl) {
                talentEl.innerHTML = "";
            }
        }
        view.updateDebugSpeedButtons();
        createView.updateLayoutMeasurements();
    },
    updateDebugSpeedButtons: function() {
        const panel = viewData.cached.debugSpeedPanel;
        if (!panel) {
            return;
        }
        const show = typeof isDebug !== "undefined" && isDebug;
        panel.style.display = show ? "" : "none";
        if (!show) {
            return;
        }
        const gs = data.gameSettings || {};
        const active = gs.debugSpeedMultiplier || 0;
        const x3 = viewData.cached.debugSpeed_x3;
        const x10 = viewData.cached.debugSpeed_x10;
        if (x3) {
            x3.classList.toggle("debug-speed-active", active === 3);
        }
        if (x10) {
            x10.classList.toggle("debug-speed-active", active === 10);
        }
    },
    buildDeathTalentSummaryHtml: function() {
        const start = data.battle.runSkillTalentStart;
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
        const activeTab = data.battle.currentTab || "base";
        view.updateTabButtons(activeTab);
        view.updateBasePanel();
        const currentClsMenu = data.progress.currentClassKey || "none";
        const hasActiveClassMenu = ["condescend", "scold", "mock"].indexOf(currentClsMenu) >= 0;
        let skillsTabNow = data.progress.selectedSkillsTab || "combat";
        if (skillsTabNow === "resort") {
            skillsTabNow = "combat";
        }
        if (skillsTabNow === "foraging" && !events.foragingSkillsUnlocked()) {
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
        const disableCompactToggle = viewData.cached.disableCompactLayoutToggle;
        if (disableCompactToggle) {
            const wantOff = !!(data.progress.options && data.progress.options.disableCompactLayout);
            if (disableCompactToggle.checked !== wantOff) {
                disableCompactToggle.checked = wantOff;
            }
        }

        view.updateVal("baseCoinsText", (Math.round((data.progress.coins || 0) * 10) / 10).toFixed(1));

        const ls = data.battle.levelState;
        const growthUnlocked = bonfire.isGrowthBlessingUnlocked();
        const plannedGrowthUnlocked = bonfire.isPlannedGrowthUnlocked();
        const classDef = initialize.getCurrentClassDef();
        view.updateVal("currentClassText", classDef.name);
        view.updateVal("classPerLevelText", initialize.getClassPerLevelText(classDef.key));
        view.updateVal("tabButton_leveling", growthUnlocked ? "" : "none", "style.display");
        if (!growthUnlocked && data.battle.currentTab === "leveling") {
            data.battle.currentTab = "base";
            createView.showCurrentTab();
        }
        const skillsUnlocked = events.skillsTabUnlocked();
        view.updateVal("tabButton_skills", skillsUnlocked ? "" : "none", "style.display");
        if (!skillsUnlocked && data.battle.currentTab === "skills") {
            data.battle.currentTab = "base";
            createView.showCurrentTab();
        }
        view.updateVal("levelText", ls.level, "textContent", 1);
        view.updateVal("levelExpText", `${intToString(ls.exp, 3)} / ${intToString(ls.expToLevel, 3)}`);
        const playSec = (data.currentGameState && data.currentGameState.secondsPassed) || 0;
        view.updateVal("playTimeClock", playSec, "textContent", "time");
        const levelPct = ls.expToLevel > 0 ? Math.max(0, Math.min(100, (ls.exp / ls.expToLevel) * 100)) : 0;
        view.updateVal("levelTabExpFill", `${levelPct}%`, "style.width");
        view.updateVal("attributePointsText", ls.unassignedPoints, "textContent", 1);
        view.updateVal("levelingPointsWrap", plannedGrowthUnlocked ? "" : "none", "style.display");
        view.updateVal("levelingAssignButtons", plannedGrowthUnlocked ? "" : "none", "style.display");
        view.updateVal("attributePlanTitle", plannedGrowthUnlocked ? "" : "none", "style.display");
        view.updateVal("attributePlanList", plannedGrowthUnlocked ? "" : "none", "style.display");
        const shockEffUi = skills.getSkillEffect("shockValue");
        const windfallEffUi = skills.getSkillEffect("windfallSwagger");
        const validationEffUi = skills.getSkillEffect("validation");
        const adaptationEffUi = skills.getSkillEffect("adaptation");
        let strDisplay = (ls.levelStr || 0) + (ls.skillStrBonus || 0);
        if (skills.isSkillUnlocked("shockValue")) {
            strDisplay += shockEffUi.shockValueBonusStr || 0;
        }
        let conDisplay = (ls.levelCon || 0) + (ls.skillConBonus || 0);
        if (skills.isSkillUnlocked("windfallSwagger")) {
            conDisplay += windfallEffUi.windfallBonusCon || 0;
        }
        if (skills.isSkillUnlocked("validation")) {
            conDisplay += Math.min(data.battle.enemiesKilled || 0, validationEffUi.validationConCap || 0);
        }
        view.updateVal("strText", strDisplay, "textContent", 1);
        view.updateVal("conText", conDisplay, "textContent", 1);
        let strStatTip = "Brutality - +10% damage per point.<br>Damage is always rounded up.";
        if (skills.isSkillUnlocked("adaptation")) {
            strStatTip += `<br>Adaptation: +${adaptationEffUi.adaptationBonusStr || 0} Bru from skill levels`;
        }
        if (skills.isSkillUnlocked("shockValue")) {
            strStatTip += `<br>Shock Value: +${shockEffUi.shockValueBonusStr || 0} Bru from skill level`;
        }
        if (skills.isSkillUnlocked("bitterRivalry")) {
            strStatTip += `<br>Bitter Rivalry: +${ls.bitterRivalryStrBonus || 0} Bru from character level-ups this run`;
        }
        view.updateVal("strStatTip", strStatTip, "innerHTML");
        let conStatTip = "Confidence - +10% current and max Aud per point";
        if (skills.isSkillUnlocked("adaptation")) {
            conStatTip += `<br>Adaptation: +${adaptationEffUi.adaptationBonusCon || 0} Con from skill levels`;
        }
        if (skills.isSkillUnlocked("windfallSwagger")) {
            conStatTip += `<br>Windfall Swagger: +${windfallEffUi.windfallBonusCon || 0} Con from skill level`;
        }
        if (skills.isSkillUnlocked("validation")) {
            const valCon = Math.min(data.battle.enemiesKilled || 0, validationEffUi.validationConCap || 0);
            conStatTip += `<br>Validation: +${valCon} Con from kills (cap ${validationEffUi.validationConCap || 0})`;
        }
        view.updateVal("conStatTip", conStatTip, "innerHTML");
        view.updateVal("spdText", ls.levelSpd || 0, "textContent", 1);
        view.updateVal("soulText", ls.levelSoul || 0, "textContent", 1);
        view.renderAttributePlanList();

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
            view.updateVal("combatStarsInventory", starLine, "innerHTML");
        }

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
        const p = data.battle.player;
        const lsMult = data.battle.levelState || {};
        let conTotal = (lsMult.levelCon || 0) + (lsMult.skillConBonus || 0);
        let strTotal = (lsMult.levelStr || 0) + (lsMult.skillStrBonus || 0);
        const shockEffStats = skills.getSkillEffect("shockValue");
        const windfallEffStats = skills.getSkillEffect("windfallSwagger");
        const validationEffStats = skills.getSkillEffect("validation");
        if (skills.isSkillUnlocked("shockValue")) {
            strTotal += shockEffStats.shockValueBonusStr || 0;
        }
        if (skills.isSkillUnlocked("windfallSwagger")) {
            conTotal += windfallEffStats.windfallBonusCon || 0;
        }
        if (skills.isSkillUnlocked("validation")) {
            conTotal += Math.min(data.battle.enemiesKilled || 0, validationEffStats.validationConCap || 0);
        }
        const gc = gameData.battle.combat;
        const cdCfg = gameData.battle.cooldowns;
        const fortInner = skills.getSkillEffect("shameless").enduranceBaseAudInnerBonus || 0;
        const tenB = skills.getSkillEffect("corneredEgo").tenacityAudInnerBonus || 0;
        const tenFlatScaled = Math.ceil((2 * tenB) * (1 + conTotal / gc.conStrStatDivisor));
        const forceFlatStats = roundNearestDecimals(skills.getSkillEffect("force").slapFlatBeforeStr || 0, 2);
        const wisMult = roundNearestDecimals(skills.getSkillEffect("hindsight").wisdomCharacterExpMultiplier || 1, 2);
        const greedMult = roundNearestDecimals(skills.getSkillEffect("extortion").greedKillCoinsMultiplier || 1, 2);
        const shamelessResearched = skills.isSkillResearchComplete("shameless");
        const corneredResearched = skills.isSkillResearchComplete("corneredEgo");
        const forceResearched = skills.isSkillResearchComplete("force");
        const alacrityResearched = skills.isSkillResearchComplete("alacrity");
        let audTip = `Base inner Aud: +${gc.baseAudInner}`;
        if (shamelessResearched) {
            audTip += `<br>Shameless: +${fortInner}`;
        }
        if (corneredResearched) {
            audTip += `<br>Cornered Ego: +${tenB} inner, +${tenFlatScaled} current (2× inner × Con)`;
        }
        if (skills.isSkillUnlocked("adaptation")) {
            audTip += `<br>Adaptation: +${skills.getSkillEffect("adaptation").adaptationBonusCon || 0} Con from skill levels`;
        }
        if (skills.isSkillUnlocked("windfallSwagger")) {
            audTip += `<br>Windfall Swagger: +${windfallEffStats.windfallBonusCon || 0} Con from skill level`;
        }
        if (skills.isSkillUnlocked("validation")) {
            const valCon = Math.min(data.battle.enemiesKilled || 0, validationEffStats.validationConCap || 0);
            audTip += `<br>Validation: +${valCon} Con from kills (cap ${validationEffStats.validationConCap || 0})`;
        }
        if (growthUnlocked) {
            audTip += `<br>Confidence multiplier: +${Math.round(conTotal * (100 / gc.conStrStatDivisor))}%`;
        }
        view.updateVal("statsAudText", `${intToStringRound(p.maxAud)} Aud`);
        view.updateVal("statsAudTip", audTip, "innerHTML");
        const regenVal = p.regenPerSecond || 0;
        view.updateVal("statsRegenText", `${round2(regenVal)}/s`);
        view.updateVal("statsRegenTip", "From Self-Affirmations skill level (Aud/s).", "innerHTML");
        view.updateVal("statsRegenCard", regenVal > 0 ? "" : "none", "style.display");
        let attackTip = `Base slap: ${gc.baseSlapDamage}`;
        if (forceResearched) {
            attackTip += `<br>Force (before Bru): +${forceFlatStats}`;
        }
        if (skills.isSkillUnlocked("mainCharacter")) {
            const mcFlat = typeof engine.getMainCharacterFlatDamage === "function" ? engine.getMainCharacterFlatDamage() : 0;
            const vis = typeof engine.countVisibleIntruders === "function" ? engine.countVisibleIntruders() : 0;
            attackTip += `<br>Main Character: +${roundNearestDecimals(mcFlat, 2)} from ${vis} visible ${vis === 1 ? "enemy" : "enemies"}`;
        }
        if (skills.isSkillUnlocked("adaptation")) {
            attackTip += `<br>Adaptation: +${skills.getSkillEffect("adaptation").adaptationBonusStr || 0} Bru from skill levels`;
        }
        if (skills.isSkillUnlocked("shockValue")) {
            attackTip += `<br>Shock Value: +${shockEffStats.shockValueBonusStr || 0} Bru from skill level`;
        }
        if (skills.isSkillUnlocked("bitterRivalry")) {
            attackTip += `<br>Bitter Rivalry: +${lsMult.bitterRivalryStrBonus || 0} Bru from character level-ups this run`;
        }
        if (growthUnlocked) {
            attackTip += `<br>Brutality multiplier: +${Math.round(strTotal * (100 / gc.conStrStatDivisor))}%`;
        }
        view.updateVal("statsAttackText", `${roundNearestDecimals(p.attackDamage, 1).toFixed(1)} ego dmg`);
        view.updateVal("statsAttackTip", attackTip, "innerHTML");
        const twEff = skills.getSkillEffect("toughness_condescend");
        const armorFlat = twEff.toughnessArmorFlat !== undefined ? round2(twEff.toughnessArmorFlat) : 0;
        view.updateVal("statsArmorText", `${round2(armorFlat)} flat`);
        view.updateVal("statsArmorTip", `Condescend Toughness: +${round2(armorFlat)} flat damage reduction`, "innerHTML");
        view.updateVal("statsArmorCard", armorFlat > 0 ? "" : "none", "style.display");
        view.updateVal("statsSlapText", `${round2((p.attackCooldownMs || 0) / 1000)}s`);
        const alaEff = skills.getSkillEffect("alacrity");
        const alaLv = alaEff.alacrityEffectiveLevel || 0;
        let slapTip = `Base: ${round2(cdCfg.slapBaseMs / 1000)}s`;
        if (alacrityResearched) {
            slapTip += `<br>Alacrity reduction: ${alaLv * cdCfg.alacritySlapReductionPerLevelMs} ms`;
        }
        slapTip += `<br>Floor: ${round2(cdCfg.slapFloorMs / 1000)}s`;
        view.updateVal("statsSlapTip", slapTip, "innerHTML");
        view.updateVal("statsSandalText", hasSandal ? `${round2((p.sandalAttackCooldownMs || 0) / 1000)}s` : "Locked");
        view.updateVal("statsSandalTip", hasSandal ? `Base: ${round2(cdCfg.sandalBaseMs / 1000)}s<br>Alacrity reduction: ${alaLv * cdCfg.alacritySandalReductionPerLevelMs} ms<br>Floor: ${round2(cdCfg.sandalFloorMs / 1000)}s` : "Requires Spare sandal upgrade", "innerHTML");
        view.updateVal("statsSandalCard", hasSandal ? "" : "none", "style.display");

        const harvestForageOn = events.harvestForageUnlocked();
        const smartHarvestOn = !!(data.progress.base && data.progress.base.garden && data.progress.base.garden.smartHarvestUnlocked);
        const clsMenu = data.progress.currentClassKey || "none";
        const hasClassForTravel = ["condescend", "scold", "mock", "shun"].indexOf(clsMenu) >= 0;
        const selectedTravel = data.progress.selectedTravelMapKey || data.progress.currentMapKey;
        const manaCost = bonfire.getCloneManaCost();
        const canAfford = bonfire.canAffordClone();
        view.updateVal("travelBonfireManaCost", intToStringRound(manaCost));
        view.updateVal("travelBonfireLaunchBtn", !canAfford, "classList.toggle", "bonfire-clone-btn--unaffordable");
        const gardenTravel = data.progress.base && data.progress.base.garden;
        const ventingUnlocked = !!(gardenTravel && gardenTravel.arrangementOfVentingSurplusUnlocked);
        view.updateVal("travelVentingSurplus_row", ventingUnlocked ? "" : "none", "style.display");
        if (ventingUnlocked) {
            const ventChk = viewData.cached.travelVentingSurplus_chk;
            if (ventChk) {
                ventChk.checked = gardenTravel.ventingSurplusEnabled !== false;
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

        const bfState = data.progress.base && data.progress.base.bonfire;
        const appliedBonfireClass = (bfState && bfState.appliedClassKey) || "none";
        const mapDefs = data.progress.mapDefinitions || [];
        const current = data.progress.currentMapKey;
        for (let i = 0; i < mapDefs.length; i++) {
            const map = mapDefs[i];
            const reqClass = map.requiredClassKey || "";
            const classAllowed = !reqClass || reqClass === appliedBonfireClass;
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
            view.updateVal(`mapTime_${map.key}`, `${round1((map.totalDurationMs || 0) / 1000)}s`);
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

        view.updateHistoryList();
        view.updateCompactLayout();
    },

    /** Shared upgrade-row + worker UI helpers for updateBasePanel. */
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
                view.updateVal(extraEl, resortData.getUpgradeExtraText(u, buildingSegment));
                let btnText = typeof o.buyButtonText === "function" ? o.buyButtonText(pk, u) : soldOutOrBuyLabel(u, buildingSegment);
                let btnDisabled = typeof o.buttonDisabled === "function" ? o.buttonDisabled(pk, u) : false;
                let weaveMode = false;
                let weavePct = null;
                let pausedMode = false;
                let readyMode = false;
                if (buildingSegment !== "path") {
                    const purchaseUi = engine.getUpgradePurchaseUi(buildingSegment, pk);
                    if (purchaseUi) {
                        btnText = purchaseUi.label;
                        btnDisabled = purchaseUi.disabled;
                        weaveMode = purchaseUi.mode === "weaving" || purchaseUi.mode === "weavePaused";
                        weavePct = purchaseUi.pct;
                        pausedMode = purchaseUi.mode === "paused" || purchaseUi.mode === "weavePaused";
                        readyMode = purchaseUi.mode === "ready";
                    }
                } else {
                    const weaveUi = engine.getUpgradeWeaveUi(buildingSegment, pk);
                    if (weaveUi) {
                        btnText = weaveUi.label;
                        btnDisabled = weaveUi.disabled;
                        weaveMode = true;
                        weavePct = weaveUi.pct;
                    }
                }
                view.updateVal(btnEl, btnText);
                view.updateVal(btnEl, btnDisabled, "disabled");
                const btnNode = viewData.cached[btnEl];
                if (btnNode) {
                    btnNode.classList.toggle("upgrade-btn-weaving", weaveMode);
                    btnNode.classList.toggle("upgrade-btn-paused", pausedMode);
                    btnNode.classList.toggle("upgrade-btn-ready", readyMode);
                    if (weaveMode && weavePct !== null && weavePct !== undefined) {
                        btnNode.style.setProperty("--weave-pct", `${weavePct}%`);
                    } else {
                        btnNode.style.removeProperty("--weave-pct");
                    }
                }
            }
        };
        const syncWorkerAdjustButtonsDisabled = function(buildingSegment, canAssignMore, canUnassign) {
            let ai;
            for (ai = 0; ai < resortData.workerAdjustIncrBtnSuffixes.length; ai++) {
                const sfx = resortData.workerAdjustIncrBtnSuffixes[ai];
                view.updateVal(`base_${buildingSegment}_${sfx}_btn`, !canAssignMore, "disabled");
            }
            for (ai = 0; ai < resortData.workerAdjustDecrBtnSuffixes.length; ai++) {
                const sfx = resortData.workerAdjustDecrBtnSuffixes[ai];
                view.updateVal(`base_${buildingSegment}_${sfx}_btn`, !canUnassign, "disabled");
            }
        };
        const syncWorkerGearSitePanel = function(siteKey) {
            const bcfg = resortData.buildings[siteKey];
            const ws = bcfg.workers;
            const bslot = base[siteKey];
            const gearKey = ws.gearKey || "gear";
            const gearUp = bcfg.upgrades[gearKey];
            view.updateVal(`base_${siteKey}_row`, ws.panelStatusRowHtml(res, base));
            const aWorkers = bslot.assignedWorkers || 0;
            const gSets = bslot.gearSets || 0;
            view.updateVal(`base_${siteKey}_workers_label`, `Kitsune: ${aWorkers}/${gSets} gear`);
            if (gearUp) {
                const nextGearCost = resortData.resolveCost(gearUp, siteKey);
                view.updateVal(resortData.idBtn(siteKey, gearUp.key), resortData.buyForFromCost(nextGearCost));
                view.updateVal(resortData.idExtra(siteKey, gearUp.key), `Next: ${resortData.costToParts(nextGearCost).join(", ")}`);
            }
            const canAssignGear = (bslot.assignedWorkers || 0) < (bslot.gearSets || 0) && engine.getAvailableWorkers() > 0;
            const canUnassignGear = (bslot.assignedWorkers || 0) > 0;
            syncWorkerAdjustButtonsDisabled(siteKey, canAssignGear, canUnassignGear);
            const okami = engine.getOkami();
            const okamiHere = okami.assignedBuildingKey === siteKey;
            view.updateVal(`base_${siteKey}_assign_okami_btn`, okamiHere ? "Unassign Okami" : "Assign Okami");
            view.updateVal(`base_${siteKey}_assign_okami_btn`, okamiHere, "classList.toggle", "assign-okami-btn-active");
        };
        return {
            hideMaxed,
            buyFor,
            cdPct,
            soldOutOrBuyLabel,
            soldOutUpgradeRowOpts,
            refreshOrderedPurchasables,
            syncWorkerAdjustButtonsDisabled,
            syncWorkerGearSitePanel
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
        if (manaOrdersUnlocked) {
            const manaChk = document.getElementById("foxDenManaOrders_chk");
            if (manaChk) {
                manaChk.checked = !!foxDen.manaOrdersEnabled;
            }
        }
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
            if (bought) {
                view.updateVal(btnId, "Built");
                view.updateVal(btnId, true, "disabled");
            } else if (building) {
                view.updateVal(btnId, engine.getBuildingGatherButtonLabel(uk));
                view.updateVal(btnId, false, "disabled");
                const btnNode = viewData.cached[btnId];
                if (btnNode) {
                    btnNode.classList.toggle("upgrade-btn-paused", !!site.paused);
                }
            } else {
                const slot = resortData.foxDenUnlockGetDef(uk);
                const cost = slot.getCost();
                const split = resortData.splitGatherWeaveCost(cost);
                view.updateVal(btnId, resortData.planToBuildFromCost(cost));
                view.updateVal(btnId, !resortData.canAffordCost(split.weave), "disabled");
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

    updateBasePanelBonfire: function() {
        const manaCost = bonfire.getCloneManaCost();
        const canAfford = bonfire.canAffordClone();
        view.updateVal("base_bonfire_mana_cost", intToStringRound(manaCost));
        view.updateVal("travelBonfireManaCost", intToStringRound(manaCost));
        view.updateVal("base_bonfire_clone_btn", !canAfford, "classList.toggle", "bonfire-clone-btn--unaffordable");
        view.updateVal("travelBonfireLaunchBtn", !canAfford, "classList.toggle", "bonfire-clone-btn--unaffordable");
        const currentClass = data.progress.currentClassKey || "none";
        view.updateVal("base_bonfire_current", `Current class: ${initialize.getClassDef(currentClass).name}`);
        const bf = data.progress.base.bonfire;
        const rh = data.progress.base && data.progress.base.foxDen;
        const mageTowerBuilt = !!(rh && rh.unlocks && rh.unlocks.mage_tower);
        view.updateVal("bonfireClassSelectRow", mageTowerBuilt ? "" : "none", "style.display");
        view.updateVal("bonfirePickerLayout", mageTowerBuilt ? "" : "none", "style.display");
        const garden = data.progress.base && data.progress.base.garden;
        const fireTendingUnlocked = !!(garden && garden.arrangementOfFireTendingUnlocked);
        view.updateVal("bonfireFireTending_row", fireTendingUnlocked ? "" : "none", "style.display");
        if (fireTendingUnlocked) {
            const fireChk = document.getElementById("bonfireFireTending_chk");
            if (fireChk) {
                fireChk.checked = bf.fireTendingEnabled !== false;
            }
            view.updateVal("bonfireFireTending_cap", bf.fireTendingHeatCap !== undefined ? bf.fireTendingHeatCap : 52);
        }
        for (let ci = 0; ci < bonfireClassOrder.length; ci++) {
            const ck = bonfireClassOrder[ci];
            const btnId = `bonfire_class_btn_${ck}`;
            const selected = bf.selectedClassKey === ck;
            const applied = bf.appliedClassKey === ck;
            view.updateVal(btnId, selected, "classList.toggle", "bonfire-pick-btn--selected");
            view.updateVal(btnId, applied, "classList.toggle", "bonfire-pick-btn--applied");
        }
        for (let mi = 0; mi < bonfireModifierOrder.length; mi++) {
            const mk = bonfireModifierOrder[mi];
            const btnId = `bonfire_mod_btn_${mk}`;
            const selected = bf.selectedModifierKey === mk;
            const applied = bonfire.isModifierApplied(mk);
            view.updateVal(btnId, selected, "classList.toggle", "bonfire-pick-btn--selected");
            view.updateVal(btnId, applied, "classList.toggle", "bonfire-pick-btn--applied");
        }
        let infoHtml = "";
        if (bf.selectedClassKey) {
            const d = bonfire.getClassDef(bf.selectedClassKey);
            const applied = bonfire.isClassApplied(bf.selectedClassKey);
            const pl = d.perLevel || {};
            const bonusParts = [];
            if (pl.str) bonusParts.push(`+${pl.str} Bru`);
            if (pl.con) bonusParts.push(`+${pl.con} Con`);
            if (pl.spd) bonusParts.push(`+${pl.spd} Spd`);
            const manaMult = d.manaCostMult || bonfireConfig.classManaMult;
            infoHtml = `<div class="bonfire-info-name">${d.name}</div><div class="muted-text">${d.description || ""}</div><div class="muted-text">${bonusParts.join(", ")} per level</div><div class="muted-text">Clone mana cost: x${round2(manaMult)}</div><button type="button" class="tab-button" onclick="events.bonfireApplySelection(event)">${applied ? "Unapply" : "Apply"}</button>`;
        } else if (bf.selectedModifierKey) {
            const d = bonfire.getModifierDef(bf.selectedModifierKey);
            const applied = bonfire.isModifierApplied(bf.selectedModifierKey);
            const manaMult = d.manaCostMult || bonfireConfig.modifierManaMult;
            infoHtml = `<div class="bonfire-info-name">${d.name}</div><div class="muted-text">${d.description || ""}</div><div class="muted-text">Clone mana cost: x${round2(manaMult)}</div><button type="button" class="tab-button" onclick="events.bonfireApplySelection(event)">${applied ? "Unapply" : "Apply"}</button>`;
        }
        const infoEl = viewData.cached.base_bonfire_info_panel;
        if (infoEl && viewData.prevValues.base_bonfire_info_html !== infoHtml) {
            viewData.prevValues.base_bonfire_info_html = infoHtml;
            const nextHtml = infoHtml;
            queueMicrotask(function() {
                if (infoEl && viewData.prevValues.base_bonfire_info_html === nextHtml) {
                    infoEl.innerHTML = nextHtml;
                }
            });
        }
        const t = view._basePanelPurchasingTools(data.progress.base, null, data.progress.options.hideMaxedUpgrades);
        t.refreshOrderedPurchasables("bonfire", resortData.buildings.bonfire.upgradesOrder, { hideMaxed: t.hideMaxed });
        this.updateResortWorkerControls("bonfire", (bf.assignedWorkers || 0) > 0 || engine.getOkami().assignedBuildingKey === "bonfire");
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
                continue;
            }
            const sk = data.progress.skills[skillKey];
            view.updateVal(colId, "", "style.display");
            view.updateVal(`scrollArchivesChoiceType_${ci}`, sk ? sk.name : skillKey);
            view.updateVal(`scrollArchivesChoiceDesc_${ci}`, skills.getSkillShortDescription(skillKey));
            view.updateVal(`scrollArchivesChoiceShard_${ci}`, engine.skillHasShardOnTravelableMap(skillKey) ? "" : "none", "style.display");
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
            view.updateVal("base_scrollArchives_finish_research_btn", purchaseUi.label);
            view.updateVal("base_scrollArchives_finish_research_btn", purchaseUi.disabled, "disabled");
            btnEl.classList.toggle("upgrade-btn-paused", purchaseUi.mode === "weavePaused");
            btnEl.classList.toggle("upgrade-btn-weaving", purchaseUi.mode === "weaving");
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
        t.refreshOrderedPurchasables("atelier", resortData.buildings.atelier.upgradesOrder, t.soldOutUpgradeRowOpts(t.hideMaxed, "atelier"));
    },

    updateBasePanelGarden: function(base, t) {
        const g = base.garden || {};
        view.updateVal("gardenAppraisalAuto_row", g.arrangementOfAppraisalUnlocked ? "" : "none", "style.display");
        view.updateVal("gardenReviewAuto_row", g.arrangementOfReviewUnlocked ? "" : "none", "style.display");
        const appraisalChk = viewData.cached.gardenAppraisalAuto_chk;
        if (appraisalChk && appraisalChk.checked !== !!g.autoWeaveOnGatherComplete) {
            appraisalChk.checked = !!g.autoWeaveOnGatherComplete;
        }
        const reviewChk = viewData.cached.gardenReviewAuto_chk;
        if (reviewChk && reviewChk.checked !== !!g.autoWeaveCheapestReady) {
            reviewChk.checked = !!g.autoWeaveCheapestReady;
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
            required = slot.karmaCheckPowerRequired || 30;
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
            let orbProdText = `Workers for Orb exp: ${units} (x${round2(Math.pow(1.1, units))} exp) | Exp: ${round2(expRate)}/s | Mana: ${round2(manaRate)}/s`;
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
            const progress = lib.researchTaskProgress || 0;
            const required = lib.researchTaskRequired || 10;
            const pct = required > 0 ? Math.max(0, Math.min(100, (progress / required) * 100)) : 0;
            let prodText = `Researchers: ${researcherCount} | Research speed: ${round1(researchRate)}/s`;
            if (okamiHere) {
                prodText += ` (${round1(engine.getOkamiInspirationBonus())}× from inspiration)`;
            }
            if (researchRate > 0) {
                prodText += `<br>Research: ${round1(progress)} / ${round1(required)} (${round1(researchRate)} coins/s, ${round1(researchRate * 2)} star beads/s)`;
            }
            if (lib.researchPaused) {
                prodText += "<br>Paused - need more coins or star beads";
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
            const reducingPerSec = required > 0 && canReduce ? (5 * workRate) / required : 0;
            prodText = required > 0
                ? `Worker Power: ${rateStr} |  On complete, reduce next visitor by 5s<br>${power}/${required} to complete | Reducing ${round2(reducingPerSec)}/s`
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
        view.updateVal("spiritSlots_earth", slotsRevealed ? "" : "none", "style.display");
        view.updateVal("spiritSlots_water", (slotsRevealed && waterBought) ? "" : "none", "style.display");
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
            mage_tower: "mapOrbProgressWrap"
        };
        for (let i = 0; i < order.length; i++) {
            const uk = order[i];
            const site = rh.constructionSites[uk];
            const building = site && site.status === "building";
            const unlocked = !!unlocks[uk];
            const pos = engine.getFoxDenMapSlotPosition(uk)
            view.updateVal(`foxDenSlot_${uk}`, building ? "" : "none", "style.display");
            if (building) {
                view.updateVal(`foxDenSlot_${uk}`, `${Math.round(pos.x)}px`, "style.left");
                view.updateVal(`foxDenSlot_${uk}`, `${Math.round(pos.y)}px`, "style.top");
                view.updateVal(`foxDenSlotPct_${uk}`, `${resortData.getConstructionPercent(site)}%`);
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
                const p = carrier.progress || 0;
                const x = carrier.fromX + (carrier.toX - carrier.fromX) * p;
                const y = carrier.fromY + (carrier.toY - carrier.fromY) * p;
                view.updateVal(elId, `${Math.round(x - 16)}px`, "style.left");
                view.updateVal(elId, `${Math.round(y - 16)}px`, "style.top");
                const el = viewData.cached[elId];
                if (el) {
                    const img = el.querySelector(".fox-den-carrier-img");
                    if (img) {
                        img.src = carrier.isOkami ? "img/foxTail.svg" : "img/foxWorker.svg";
                        img.classList.toggle("okami-tail-mirror", carrier.isOkami && carrier.toX < carrier.fromX);
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
                const p = carrier.progress || 0;
                const x = carrier.fromX + (carrier.toX - carrier.fromX) * p;
                const y = carrier.fromY + (carrier.toY - carrier.fromY) * p;
                view.updateVal(elId, `${Math.round(x - 16)}px`, "style.left");
                view.updateVal(elId, `${Math.round(y - 16)}px`, "style.top");
                const el = viewData.cached[elId];
                if (el) {
                    const img = el.querySelector(".bonfire-carrier-img");
                    if (img) {
                        img.src = carrier.isOkami ? "img/foxTail.svg" : "img/foxWorker.svg";
                        img.classList.toggle("okami-tail-mirror", carrier.isOkami && carrier.toX < carrier.fromX);
                    }
                }
            }
        }
    },
    updateCisternCarriers: function() {
        const cistern = data.progress.base.cistern;
        if (!engine.isInnOnsenConverted()) {
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
                const p = carrier.progress || 0;
                const x = carrier.fromX + (carrier.toX - carrier.fromX) * p;
                const y = carrier.fromY + (carrier.toY - carrier.fromY) * p;
                view.updateVal(elId, `${Math.round(x - 16)}px`, "style.left");
                view.updateVal(elId, `${Math.round(y - 16)}px`, "style.top");
                const el = viewData.cached[elId];
                if (el) {
                    const img = el.querySelector(".cistern-carrier-img");
                    if (img) {
                        img.src = carrier.isOkami ? "img/foxTail.svg" : "img/foxWorker.svg";
                        img.classList.toggle("okami-tail-mirror", carrier.isOkami && carrier.toX < carrier.fromX);
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
                const p = carrier.progress || 0;
                const x = carrier.fromX + (carrier.toX - carrier.fromX) * p;
                const y = carrier.fromY + (carrier.toY - carrier.fromY) * p;
                view.updateVal(elId, `${Math.round(x - 16)}px`, "style.left");
                view.updateVal(elId, `${Math.round(y - 16)}px`, "style.top");
                const el = viewData.cached[elId];
                if (el) {
                    const img = el.querySelector(".inn-carrier-img");
                    if (img) {
                        img.src = carrier.isOkami ? "img/foxTail.svg" : "img/foxWorker.svg";
                        img.classList.toggle("okami-tail-mirror", carrier.isOkami && carrier.toX < carrier.fromX);
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
        const strandsNext = engine.getOkamiSpiritStrands(okami.level + 1);
        const strandsCur = engine.getOkamiSpiritStrands(okami.level);
        if (strandsNext > strandsCur) {
            view.updateVal("okamiSpiritStrandsNext", ` (+${round2(strandsNext - strandsCur)} next level)`, "textContent");
        } else {
            view.updateVal("okamiSpiritStrandsNext", ` (+${round2(strandsNext)} next level)`, "textContent");
        }
        view.updateVal("okamiSpiritStrandsNext", "", "style.display");
        view.updateVal("okamiStateDisplay", engine.getOkamiStateDisplayText());
        view.updateVal("okamiInspirationBonus", `x${round2(engine.getOkamiInspirationBonus())}`);
        const perLvl = resortData.okamiConfig.inspirationBonusPerLevel || 0.02;
        view.updateVal("okamiInspirationHint", `(+${perLvl}/level)`);
        const stateEl = viewData.cached.okamiStateDisplay;
        if (stateEl) {
            stateEl.classList.toggle("okami-state-clickable", engine.isOkamiStateClickable());
        }
        view.updateManaBar();
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
        view.updateVal("manaRate", round1(rate), "textContent");
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
        const expToLevel = orb.expToLevel || 100;
        const pct = expToLevel > 0 ? Math.max(0, Math.min(100, (exp / expToLevel) * 100)) : 0;
        view.updateVal("orbLevelText", level, "textContent", "floor");
        view.updateVal("orbExpText", Math.round(exp), "textContent");
        view.updateVal("orbExpToLevelText", Math.round(expToLevel), "textContent");
        view.updateVal("orbExpFill", `${pct}%`, "style.width");
        view.updateVal("orbManaRateText", round2(engine.getEffectiveManaRatePerSecond()));
        view.updateVal("orbExpRateText", round2(engine.getOrbExpGainPerSecond()));
        view.updateVal("mageTowerMapDisplay", `Lvl ${level}`, "textContent");
        view.updateVal("mapOrbProgressFill", `${pct}%`, "style.width");
    },
    updateResortMapProgressBars: function() {
        const base = data.progress.base || {};
        const torii = base.torii || {};
        const laundry = base.laundry || {};
        const inn = base.inn || {};
        const laundryReq = laundry.cleanPowerRequired || 30;
        const toriiBuilt = !!(base.foxDen && base.foxDen.unlocks && base.foxDen.unlocks.torii);
        const toriiGateFull = (torii.visitorsWaiting || 0) >= (torii.maxVisitors || 2);
        const toriiInterval = torii.visitorIntervalMs || 60000;
        const toriiVisitorPct = toriiBuilt && !toriiGateFull && toriiInterval > 0
            ? Math.max(0, Math.min(100, (1 - (Math.max(0, torii.nextVisitorTimerMs || 0) / toriiInterval)) * 100))
            : 0;
        const laundryProductive = false;
        view.updateVal("mapToriiProgressWrap", toriiBuilt && !toriiGateFull ? "" : "none", "style.display");
        view.updateVal("mapToriiProgressFill", `${toriiVisitorPct}%`, "style.width");
        view.updateVal("mapLaundryProgressWrap", laundryProductive ? "" : "none", "style.display");
        view.updateVal("mapLaundryProgressFill", `${Math.max(0, Math.min(100, ((laundry.workerPower || 0) / laundryReq) * 100))}%`, "style.width");
        view.updateOrbProgressDisplays();
        const innManaState = engine.getBuildingManaState("inn");
        if (innManaState) {
            const pct = innManaState.capacity > 0
                ? Math.max(0, Math.min(100, (innManaState.mana / innManaState.capacity) * 100))
                : 0;
            view.updateVal("mapInnManaProgressWrap", "", "style.display");
            view.updateVal("mapInnManaProgressFill", `${pct}%`, "style.width");
        } else {
            view.updateVal("mapInnManaProgressWrap", "none", "style.display");
        }
    },
    updateBasePanelMageTower: function(t) {
        const orb = data.progress.base.mage_tower;
        this.updateResortWorkerControls("mage_tower", engine.getOrbExpGainPerSecond() > 0 || engine.getOkami().assignedBuildingKey === "mage_tower");
        view.updateOrbProgressDisplays();
        t.refreshOrderedPurchasables("mage_tower", resortData.buildings.mage_tower.upgradesOrder);
    },
    updateBambooForestInfo: function() {
        const bf = data.progress.base.bambooForest;
        view.updateVal("bambooForestInfoChips", bf.chips || 0, "textContent", "floor");
        view.updateVal("bambooForestInfoWood", bf.wood || 0, "textContent", "floor");
        view.updateVal("bambooChopPower", engine.getBambooChopPower());
        const pond = data.progress.base.pond;
        view.updateVal("bambooForestWater_row", pond.pipesToForestUnlocked ? "" : "none", "style.display");
        if (pond.pipesToForestUnlocked) {
            view.updateVal("bambooForestWaterText", `${round1(bf.water || 0)}L`);
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
            if (active === si) {
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
        view.updateVal(slotId, spirit ? String(spirit.level || 1) : "", "textContent");
        view.updateVal(slotId, spirit ? engine.getSpiritColor(spirit) : emptyBg, "style.backgroundColor");
        view.updateVal(slotId, !!spirit, "classList.toggle", "spirit-slot-filled");
    },
    updateResortMapTokens: function() {
        const base = data.progress.base || {};
        const selectedSpiritId = data.progress.selectedSpiritId;
        const springSlotMax = engine.getHiddenSpringSpiritSlotMax();
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
                view.updateVal(pid, `${Math.round(pos.x - 4)}px`, "style.left");
                view.updateVal(pid, `${Math.round(pos.y - 4)}px`, "style.top");
                view.updateVal(pid, engine.earthSpiritColors[pebble.colorIndex || 0], "style.backgroundColor");
                view.updateVal(pid, engine.earthSpiritColors[pebble.colorIndex || 0], "style.borderColor");
                view.updateVal(pAmtId, pebble ? engine.formatPebblePayloadLabel(pebble) : "", "textContent");
                view.updateVal(pAmtId, `${Math.round(pos.x)}px`, "style.left");
                view.updateVal(pAmtId, `${Math.round(pos.y + 8)}px`, "style.top");
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
                view.updateVal(did, `${Math.round(dpos.x - 5)}px`, "style.left");
                view.updateVal(did, `${Math.round(dpos.y - 5)}px`, "style.top");
                view.updateVal(dAmtBelow, `${intToStringRound(droplet.waterVolume || 0)}L`, "textContent");
                view.updateVal(dAmtBelow, `${Math.round(dpos.x)}px`, "style.left");
                view.updateVal(dAmtBelow, `${Math.round(dpos.y + 10)}px`, "style.top");
                const essDisp = round2(droplet.essence || 0);
                const topLabel = essDisp > 1
                    ? `${essDisp}E`
                    : `${round1(droplet.heat || 0)}C`;
                view.updateVal(dAmtTop, topLabel, "textContent");
                view.updateVal(dAmtTop, `${Math.round(dpos.x)}px`, "style.left");
                view.updateVal(dAmtTop, `${Math.round(dpos.y - 18)}px`, "style.top");
            }
        }
        view.updateFireLauncherMap();
    },
    updateFireLauncherMap: function() {
        const builtCount = engine.getFireLauncherBuiltCount();
        const defs = engine.getFireLauncherPlatformDefs();
        const selectedSpiritId = data.progress.selectedSpiritId;
        const selectedLauncherKey = data.progress.selectedFireLauncherKey;
        const maxEmbers = resortData.fireLauncherMaxEmbers || 100;
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
            const emberPct = Math.max(0, Math.min(100, (embers / maxEmbers) * 100));
            view.updateVal(emberFillId, `${emberPct}%`, "style.width");
            const rangePx = def.rangePx || 0;
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
            const t = Math.min(1, (p.progress || 0) / (p.durationMs || 350));
            const x = (p.fromX || 0) + ((p.toX || 0) - (p.fromX || 0)) * t;
            const y = (p.fromY || 0) + ((p.toY || 0) - (p.fromY || 0)) * t;
            view.updateVal(pid, `${Math.round(x - 7)}px`, "style.left");
            view.updateVal(pid, `${Math.round(y - 7)}px`, "style.top");
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
            view.updateVal(aid, `${Math.round(pulse.x)}px`, "style.left");
            view.updateVal(aid, `${Math.round(pulse.y)}px`, "style.top");
            view.updateVal(aid, `${diam}px`, "style.width");
            view.updateVal(aid, `${diam}px`, "style.height");
            const el = viewData.cached[aid];
            if (el && viewData.fireLauncherAoeLastId[ai] !== pulse.id) {
                el.style.animation = "none";
                void el.offsetWidth;
                el.style.animation = "";
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
        view.updateVal("fireLauncherInfoTitle", def.name);
        view.updateVal("fireLauncherInfoType", attackLabel);
        view.updateVal("fireLauncherInfoEmbers", round1(state ? state.embers || 0 : 0));
        view.updateVal("fireLauncherInfoRange", def.rangePx);
        view.updateVal("fireLauncherInfoInterval", intervalStr);
        view.updateVal("fireLauncherInfoEmberCost", def.emberCost);
        view.updateVal("fireLauncherInfoHeat", def.attackType === "aoe"
            ? `${def.heatPerStrike} (all in range)`
            : String(def.heatPerStrike));
        view.updateVal("fireLauncherInfoSpirit", spirit
            ? `Fire Spirit #${spirit.id} (Lv ${spirit.level || 1})`
            : "Unassigned");
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
            const nextSnap = `A ${guestType} stayed at Room ${entry.room} and left after ${entry.staySeconds} seconds, giving ${entry.starBeads} star beads for resting well.`;
            if (rowRef.snap !== nextSnap) {
                if (rowRef.text) {
                    rowRef.text.textContent = nextSnap;
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
        for (let li = 0; li < 4; li++) {
            if (li >= lines.length) {
                view.updateVal(`guestItineraryLine_${li}`, "none", "style.display");
                continue;
            }
            view.updateVal(`guestItineraryLine_${li}`, lines[li] || "", "textContent");
            view.updateVal(`guestItineraryLine_${li}`, "", "style.display");
        }
        const range = engine.getExpectedGuestStarBeadsRange();
        view.updateVal("guestStarBeadsMin", round1(range.min));
        view.updateVal("guestStarBeadsMax", round1(range.max));
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
    updateSpiritInfo: function() {
        const spirit = engine.getSpiritById(data.progress.selectedSpiritId);
        this.updateResortMapTokens();
        if (!spirit) {
            return;
        }
        const kind = spirit.kind || "earth";
        const kindLabel = kind.charAt(0).toUpperCase() + kind.slice(1);
        view.updateVal("spiritInfoTitle", `${kindLabel} Spirit #${spirit.id}`);
        view.updateVal("spiritInfoLevel", spirit.level || 1);
        view.updateVal("spiritInfoPower", round2(spirit.spiritPower || 1));
        const nextPowerInc = engine.getSpiritPowerNextIncrease(spirit.level || 1);
        view.updateVal("spiritInfoPowerNote", kind === "earth" || kind === "water" || kind === "fire" || kind === "plant" ? `(+${nextPowerInc} on lvl)` : "", "textContent");
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
            const atHiddenSpring = (spirit.location || "hiddenSpring") === "hiddenSpring";
            const priorityUnlocked = engine.isArrangementOfPriorityUnlocked();
            view.updateVal("spiritInfoPrioritizeOreRow", priorityUnlocked && atHiddenSpring ? "" : "none", "style.display");
            if (priorityUnlocked && atHiddenSpring) {
                const oreChk = viewData.cached.spiritInfoPrioritizeOre_chk;
                if (oreChk) {
                    oreChk.checked = !!spirit.prioritizeOre;
                }
            }
            if (atHiddenSpring) {
                view.updateVal("spiritInfoTaskProgressWrap", "", "style.display");
                const task = engine.getEarthSpiritPebbleTaskInfo(spirit);
                view.updateVal("spiritInfoTaskText", task.text);
                view.updateVal("spiritInfoTaskFill", `${task.pct}%`, "style.width");
            } else if (spirit.location === "mine") {
                view.updateVal("spiritInfoTaskProgressWrap", "none", "style.display");
                view.updateVal("spiritInfoTaskText", engine.isMineCleared() ? "playing in the dirt" : "Mining...");
            }
        } else if (kind === "water") {
            if (spirit.location === "pond") {
                view.updateVal("spiritInfoWaterVolume", "-");
                view.updateVal("spiritInfoHeat", "-");
                view.updateVal("spiritInfoEssence", "-");
                view.updateVal("spiritInfoTaskProgressWrap", "none", "style.display");
                const pond = data.progress.base.pond || {};
                const pondWater = pond.waterVolume || 0;
                const expRate = pondWater > 0 ? round2(Math.sqrt(pondWater)) : 0;
                view.updateVal("spiritInfoTaskText", pondWater > 0
                    ? `playing at pond (+${expRate} exp/s)`
                    : "playing at pond (pond is empty)");
            } else {
                view.updateVal("spiritInfoTaskProgressWrap", "", "style.display");
                const droplet = engine.getDropletForSpirit(spirit.id);
                if (droplet) {
                    view.updateVal("spiritInfoWaterVolume", `${round2(droplet.waterVolume || 0)}L`);
                    view.updateVal("spiritInfoHeat", `${round1(droplet.heat || 0)}C`);
                    view.updateVal("spiritInfoEssence", round2(droplet.essence || 0));
                    view.updateVal("spiritInfoTaskText", "droplet active");
                    view.updateVal("spiritInfoTaskFill", "100%", "style.width");
                } else {
                    const formingVol = engine.getWaterDropletVolumeForSpirit(spirit);
                    view.updateVal("spiritInfoWaterVolume", `${round2(formingVol)}L`);
                    view.updateVal("spiritInfoHeat", "-");
                    view.updateVal("spiritInfoEssence", "-");
                    const task = engine.getWaterSpiritDropletTaskInfo(spirit);
                    view.updateVal("spiritInfoTaskText", task.text);
                    view.updateVal("spiritInfoTaskFill", `${task.pct}%`, "style.width");
                }
            }
        } else if (kind === "fire") {
            view.updateVal("spiritInfoTaskProgressWrap", "", "style.display");
            const loc = spirit.location || "bonfire";
            if (engine.isFireSpiritOnLauncher(spirit)) {
                const launcherKey = engine.getFireLauncherKeyForSpirit(spirit);
                const def = engine.getFireLauncherPlatformDef(launcherKey);
                const state = engine.getFireLauncherPlatformState(launcherKey);
                const maxEmbers = resortData.fireLauncherMaxEmbers || 100;
                const embers = state ? (state.embers || 0) : 0;
                data.progress.selectedFireLauncherKey = launcherKey;
                view.updateVal("spiritInfoFireLauncherExtras", "", "style.display");
                view.updateVal("spiritInfoFireLauncherName", def ? def.name : "Fire Launcher");
                view.updateVal("spiritInfoFireLauncherEmbers", round1(embers));
                if (def) {
                    const intervalSec = def.intervalMs / 1000;
                    const intervalStr = intervalSec >= 1 ? intervalSec.toFixed(1) : intervalSec.toFixed(2);
                    const attackLabel = def.attackType === "aoe" ? "burst" : "projectile";
                    view.updateVal("spiritInfoFireLauncherStats",
                        `Range ${def.rangePx}px · ${intervalStr}s ${attackLabel} · ${def.emberCost} embers · ${def.heatPerStrike} heat`);
                } else {
                    view.updateVal("spiritInfoFireLauncherStats", "");
                }
                view.updateVal("spiritInfoFireNote", def
                    ? `Powering ${def.name} (+${round2(spirit.spiritPower || 1)} embers/s).`
                    : "Assigned to fire launcher.");
                view.updateVal("spiritInfoTaskText", `charging embers (${round1(embers)}/${maxEmbers})`);
                const pct = Math.max(0, Math.min(100, (embers / maxEmbers) * 100));
                view.updateVal("spiritInfoTaskFill", `${pct}%`, "style.width");
            } else if (loc === "atelier" && engine.isAtelierForgeBuilt()) {
                const batchSize = Math.ceil(spirit.spiritPower || 1);
                const pct = Math.max(0, Math.min(100, ((spirit.forgeTimerMs || 0) / 20000) * 100));
                view.updateVal("spiritInfoFireNote", `Smelting up to ${batchSize} ore into bars every 20s.`);
                view.updateVal("spiritInfoTaskText", `Forging bars (${batchSize} ore / 20s)`);
                view.updateVal("spiritInfoTaskFill", `${pct}%`, "style.width");
            } else if (loc === "bonfire") {
                const excessHeat = engine.getBonfireExcessHeatForExp();
                const expRate = excessHeat > 0 ? round2(Math.sqrt(excessHeat / 10)) : 0;
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
            view.updateVal("spiritInfoPlantChipsBonus", `Increases bamboo base chips by +${round2(spirit.spiritPower || 1)}`);
        }
    },
    updateMineInfo: function() {
        const mine = data.progress.base.mine;
        const depth = mine.currentDepth || 0;
        const clears = (mine.clearsByDepth && mine.clearsByDepth[depth]) || 0;
        view.updateVal("mineDepthText", depth);
        view.updateVal("mineDepthClears", clears);
        view.updateVal("mineDepthLeftBtn", depth > 0 ? "" : "none", "style.display");
        view.updateVal("mineDepthRightBtn", clears >= 10 ? "" : "none", "style.display");
        const cleared = engine.isMineCleared();
        view.updateVal("mineStatusText", cleared ? "playing in the dirt" : "Mining...");
        view.updateVal("mineDirtText", mine.resources.dirt, "textContent", 2);
        view.updateVal("mineStoneText", mine.resources.stone, "textContent", 2);
        const oreMined = !!(data.progress.base.hiddenSpring && data.progress.base.hiddenSpring.oreMined);
        view.updateVal("mineOreRow", oreMined ? "" : "none", "style.display");
        if (oreMined) {
            view.updateVal("mineOreText", round2(mine.resources.ore || 0));
        }
        view.updateVal("minePrioritizeOreRow", "none", "style.display");
        view.updateVal("mineAssignedLevelText", engine.getMineSpiritLevelTotal());
        view.updateVal("minePlayProgressWrap", cleared ? "" : "none", "style.display");
        view.updateVal("minePlayProgressFill", `${Math.max(0, Math.min(100, ((mine.playTimerMs || 0) / 5000) * 100))}%`, "style.width");
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
    updateBasePanel: function() {
        if (typeof events.syncBaseContentNotifications === "function") {
            events.syncBaseContentNotifications();
        }
        const base = data.progress.base;
        const selected = data.progress.selectedBaseBuilding || "";
        if (typeof events.applyBaseBuildingInfoOverlay === "function") {
            events.applyBaseBuildingInfoOverlay(selected);
        }
        view.updateVal("baseCoinsText", (Math.round((data.progress.coins || 0) * 10) / 10).toFixed(1));
        view.updateVal("baseStarBeadsText", data.progress.starBeads || 0, "textContent", "floor");
                view.updateVal("baseWorkersAssigned", engine.getAvailableWorkers(), "textContent", 1);
        view.updateVal("baseWorkersFound", engine.getTotalFoundWorkers(), "textContent", 1);
        view.updateVal("basePaneTitleStarBeads", engine.isInnBuiltFromFoxDen() ? "" : "none", "style.display");
        view.updateVal("basePaneTitleCoins", "", "style.display");
        const foxQueueCount = engine.getFoxDenQueuedJobCount();
        const foxQueueMax = engine.getFoxDenQueueMax();
        view.updateVal("foxDenMapDisplay", `${foxQueueCount}/${foxQueueMax}`);

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
            const toriiInterval = torii.visitorIntervalMs || 60000;
            const toriiVisitorPct = toriiBuilt && !toriiGateFull && toriiInterval > 0
                ? Math.max(0, Math.min(100, (1 - (Math.max(0, torii.nextVisitorTimerMs || 0) / toriiInterval)) * 100))
                : 0;
            view.updateVal("toriiVisitorsWaiting", torii.visitorsWaiting || 0);
            view.updateVal("toriiVisitorsMax", torii.maxVisitors || 2);
            view.updateVal("toriiNextVisitor", !toriiBuilt ? "Not built" : (toriiGateFull ? "Gate full" : `${Math.ceil(Math.max(0, torii.nextVisitorTimerMs || 0) / 1000)}s`));
            view.updateVal("toriiNextVisitorProgressWrap", toriiBuilt && !toriiGateFull ? "" : "none", "style.display");
            view.updateVal("toriiNextVisitorProgressFill", `${toriiVisitorPct}%`, "style.width");
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
        } else if (selected === "inn") {
            const inn = base.inn;
            engine.syncInnRoomCounts();
            const tInn = view._basePanelPurchasingTools(base, null, data.progress.options.hideMaxedUpgrades);
            const innName = engine.getInnDisplayName();
            view.updateVal("innInfoTitle", innName);
            view.updateVal("innMapLabelText", innName);
            view.updateVal("innRoomsAvailable", inn.roomsAvailable || 0);
            view.updateVal("innRoomsOccupied", inn.roomsOccupied || 0);
            const lightsOn = engine.isInnGentleLightsUnlocked();
            let restRate = engine.getInnRestfulnessPerSecond();
            if (lightsOn && (inn.mana || 0) > 0 && (inn.roomsOccupied || 0) > 0) {
                restRate += 2;
            }
            view.updateVal("innRestfulnessPerSecond", restRate);
            view.updateVal("innManaRow", lightsOn ? "" : "none", "style.display");
            view.updateVal("innManaExplain_row", lightsOn ? "" : "none", "style.display");
            if (lightsOn) {
                const manaAmt = Math.floor(inn.mana || 0);
                const manaCap = inn.manaCapacity || 100;
                const manaPct = manaCap > 0 ? Math.max(0, Math.min(100, (manaAmt / manaCap) * 100)) : 0;
                view.updateVal("innManaAmount", manaAmt, "textContent", "floor");
                view.updateVal("innManaCap", manaCap, "textContent", "floor");
                view.updateVal("innManaFill", `${manaPct}%`, "style.width");
                const canFill = engine.canStartInnFillMana();
                const weaveUi = engine.getUpgradeWeaveUi("inn", "fillMana");
                view.updateVal("innFillMana_btn", !canFill && !weaveUi, "disabled");
                if (weaveUi) {
                    view.updateVal("innFillMana_btn", weaveUi.label);
                    view.updateVal("innFillMana_btn", weaveUi.mode === "paused", "classList.toggle", "upgrade-btn-paused");
                } else if (canFill) {
                    const sec = round1(engine.getInnFillManaDeficit() / 50);
                    view.updateVal("innFillMana_btn", `Fill Mana (${sec}s)`);
                } else {
                    view.updateVal("innFillMana_btn", "Fill Mana");
                }
            }
            const onsen = engine.isInnOnsenConverted();
            view.updateVal("innHotWater_row", onsen ? "" : "none", "style.display");
            view.updateVal("innOnsenTempReq_row", onsen ? "" : "none", "style.display");
            if (onsen) {
                view.updateVal("innHotWaterText", `${round1(inn.hotWater || 0)}/${engine.getInnHotWaterCapacity()}`);
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
            view.updateVal("stonePileInfoValue", base.stonePile.stone || 0, "textContent", "floor");
        } else if (selected === "bambooForest") {
            this.updateBambooForestInfo();
            this.updateResortWorkerControls("bambooForest", (engine.getBambooCutWorkerRate() || 0) > 0);
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
        } else if (selected === "bonfire") {
            this.updateBasePanelBonfire();
        } else if (selected === "scrollArchives") {
            const t = view._basePanelPurchasingTools(base, null, false);
            this.updateBasePanelScrollArchives(base, t);
        } else if (selected === "cistern") {
            const cistern = base.cistern || {};
            const maxCap = engine.getCisternMaxCapacity();
            const curVol = cistern.waterVolume || 0;
            view.updateVal("cisternInfoWater", `${round2(curVol)}L`);
            view.updateVal("cisternInfoTemperature", `${round1(cistern.temperature || 0)}C`);
            view.updateVal("cisternInfoCapacity", `${round2(curVol)}/${round2(maxCap)}L`);
            view.updateVal("cisternInfoEssence", round2(cistern.essence || 0));
            const garden = base.garden || {};
            const hotWaterUnlocked = !!garden.arrangementOfHotWaterUnlocked;
            view.updateVal("cisternReplaceHotWater_row", hotWaterUnlocked ? "" : "none", "style.display");
            if (hotWaterUnlocked) {
                const hotChk = document.getElementById("cisternReplaceHotWater_chk");
                if (hotChk) {
                    hotChk.checked = !!cistern.replaceWithHotterWater;
                }
            }
            const canEmptyHalf = (cistern.waterVolume || 0) > 0 || (cistern.essence || 0) > 0;
            view.updateVal("cisternEmptyHalf_btn", canEmptyHalf ? "" : "none", "style.display");
            view.updateVal("cisternEmptyHalf_btn", !canEmptyHalf, "disabled");
            const tCistern = view._basePanelPurchasingTools(base, null, data.progress.options.hideMaxedUpgrades);
            tCistern.refreshOrderedPurchasables("cistern", resortData.buildings.cistern.upgradesOrder, { hideMaxed: tCistern.hideMaxed });
            if (engine.isInnOnsenConverted()) {
                this.updateResortWorkerControls("cistern", engine.cisternHasAssignedCarriers());
            }
        } else if (selected === "pond") {
            const pond = base.pond || {};
            view.updateVal("pondInfoWater", `${round2(pond.waterVolume || 0)}L`);
            const pipesUnlocked = !!pond.pipesToForestUnlocked;
            view.updateVal("pondSendWater_row", pipesUnlocked ? "" : "none", "style.display");
            if (pipesUnlocked) {
                const pondChk = document.getElementById("pondSendWater_chk");
                if (pondChk) {
                    pondChk.checked = pond.sendWaterToBambooForest !== false;
                }
            }
            const tPond = view._basePanelPurchasingTools(base, null, data.progress.options.hideMaxedUpgrades);
            tPond.refreshOrderedPurchasables("pond", resortData.buildings.pond.upgradesOrder, { hideMaxed: tPond.hideMaxed });
        } else if (selected === "mine") {
            this.updateMineInfo();
        }

        const torii = base.torii || {};
        const inn = base.inn || {};
        const innCap = engine.getTatamiInnRoomCapacity ? engine.getTatamiInnRoomCapacity() : 2;
        view.updateVal("stonePileMapValue", base.stonePile.stone || 0, "textContent", "floor");
        const atelier = base.atelier || {};
        const atelierOre = atelier.ore || 0;
        const atelierBars = atelier.bars || 0;
        view.updateVal("atelierMapDisplay", (atelierOre > 0 || atelierBars > 0)
            ? `${intToStringRound(atelierOre)} | ${intToStringRound(atelierBars)}`
            : "", "textContent");
        view.updateVal("bambooForestMapDisplay", (base.bambooForest && base.bambooForest.wood) || 0, "textContent", "floor");
        view.updateVal("toriiMapDisplay", `${torii.visitorsWaiting || 0}/${torii.maxVisitors || 2}`);
        view.updateVal("innMapDisplay", `${inn.roomsOccupied || 0}/${innCap}`);
        view.updateVal("innMapLabelText", engine.getInnDisplayName());
        const cistern = base.cistern || {};
        const cisternBuilt = engine.isCisternBuiltFromFoxDen();
        view.updateVal("cisternMapValue", cisternBuilt
            ? `${round2(cistern.waterVolume || 0)}L | ${round1(cistern.temperature || 0)}C`
            : "", "textContent");
        this.refreshBaseBuildingNotifications();
        this.updateResortMapProgressBars();
        this.updateResortMapTokens();
        this.updatePathSegmentHighlight();
        this.updateFoxDenConstructionMap();
        this.updateFoxDenCarriers();
        this.updateCisternCarriers();
        this.updateInnCarriers();
        this.updateGuestsList();
        this.updateOkamiPanel();
        this.updateActiveWeavingButtons();
    },
    updatePathSegmentHighlight: function(hoverIndex) {
        if (hoverIndex !== undefined) {
            viewData.pathSegmentHoverIndex = hoverIndex;
        }
        const specs = engine.getResortPathSegmentSpecs();
        const selIdx = data.progress.selectedBaseBuilding === "path" ? data.progress.selectedPathSegmentIndex : null;
        const hoverIdx = viewData.pathSegmentHoverIndex;
        engine.syncResortPathDom();
        for (let i = 0; i < specs.length; i++) {
            const hiEl = document.getElementById(`pathSegmentHighlight_${i}`);
            const hitEl = document.querySelector(`.path-seg-hit[data-segment-index="${i}"]`);
            if (!hiEl) {
                continue;
            }
            const pathDebug = typeof showPathDebug !== "undefined" && showPathDebug;
            const revealed = engine.isPathSegmentRevealed(i);
            const accessible = pathDebug || engine.isPathSegmentAccessible(i);
            const showSeg = revealed ? "" : "none";
            hiEl.style.display = showSeg;
            if (hitEl) {
                hitEl.style.display = showSeg;
                hitEl.style.pointerEvents = accessible ? "stroke" : "none";
            }
            if (pathDebug) {
                hiEl.style.stroke = `hsl(${(i * 53) % 360}, 75%, 58%)`;
            } else {
                hiEl.style.stroke = "";
            }
            hiEl.classList.remove("path-seg-hover", "path-seg-selected");
            if (selIdx === i) {
                hiEl.classList.add("path-seg-selected");
            } else if (hoverIdx === i && accessible) {
                hiEl.classList.add("path-seg-hover");
            }
        }
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
                travelEl.style.left = `${Math.round(pos.x - 8)}px`;
                travelEl.style.top = `${Math.round(pos.y - 8)}px`;
                const img = travelEl.querySelector(".okami-travel-tail");
                if (img) {
                    img.classList.toggle("okami-tail-mirror", !visual.east);
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
                    weaveTokenEl.style.left = `${Math.round(pos.x)}px`;
                    weaveTokenEl.style.top = `${Math.round(pos.y)}px`;
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
            view.updateVal(btnId, engine.getBuildingGatherButtonLabel(uk));
            view.updateVal(btnId, false, "disabled");
            const btnNode = viewData.cached[btnId];
            if (btnNode) {
                btnNode.classList.toggle("upgrade-btn-paused", !!site.paused);
            }
        }
        const queue = rh.upgradeGatherQueue || [];
        for (let ui = 0; ui < queue.length; ui++) {
            const jobKey = queue[ui];
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
            view.updateVal(btnEl, purchaseUi.label);
            view.updateVal(btnEl, purchaseUi.disabled, "disabled");
            const btnNode = viewData.cached[btnEl];
            if (btnNode) {
                btnNode.classList.toggle("upgrade-btn-paused", purchaseUi.mode === "paused" || purchaseUi.mode === "weavePaused");
                btnNode.classList.toggle("upgrade-btn-ready", purchaseUi.mode === "ready");
                btnNode.classList.toggle("upgrade-btn-weaving", purchaseUi.mode === "weavePaused");
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
                    view.updateVal(btnEl, weaveUi.label);
                    view.updateVal(btnEl, weaveUi.disabled, "disabled");
                    btnNode.classList.toggle("upgrade-btn-weaving", weaveUi.mode === "weaving" || weaveUi.mode === "travel" || weaveUi.mode === "store" || weaveUi.mode === "return");
                    btnNode.style.setProperty("--weave-pct", `${weaveUi.pct}%`);
                } else {
                    btnNode.classList.remove("upgrade-btn-weaving");
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
            view.updateVal(btnEl, weaveUi.label);
            view.updateVal(btnEl, weaveUi.disabled, "disabled");
            const btnNode = viewData.cached[btnEl];
            if (btnNode) {
                const isPaused = weaveUi.mode === "paused";
                btnNode.classList.toggle("upgrade-btn-weaving", !isPaused);
                btnNode.classList.toggle("upgrade-btn-paused", isPaused);
                btnNode.classList.toggle("upgrade-btn-ready", false);
                btnNode.style.setProperty("--weave-pct", `${weaveUi.pct}%`);
            }
        }
        this.updateFoxDenGatherButtons();
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
        const plan = data.progress.attributePlan.slice().sort(function(a, b) { return a.level - b.level; });
        let html = "";
        let currentGroup = null;
        for (let i = 0; i < plan.length; i++) {
            const entry = plan[i];
            if (!currentGroup) {
                currentGroup = { start: entry.level, end: entry.level, attribute: entry.attribute };
            } else if (currentGroup.attribute === entry.attribute && entry.level === currentGroup.end + 1) {
                currentGroup.end = entry.level;
            } else {
                const levelText = currentGroup.start === currentGroup.end ? `Lvl ${currentGroup.start}` : `Lvl ${currentGroup.start}-${currentGroup.end}`;
                html += `<span class="plan-item">${levelText}, + ${currentGroup.attribute.toUpperCase()}</span>`;
                currentGroup = { start: entry.level, end: entry.level, attribute: entry.attribute };
            }
        }
        if (currentGroup) {
            const levelText = currentGroup.start === currentGroup.end ? `Lvl ${currentGroup.start}` : `Lvl ${currentGroup.start}-${currentGroup.end}`;
            html += `<span class="plan-item">${levelText}, + ${currentGroup.attribute.toUpperCase()}</span>`;
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
        let html = "";
        for (let i = 0; i < runs.length; i++) {
            const run = runs[i];
            const lvl = run.level !== undefined ? run.level : 0;
            const kills = run.kills !== undefined ? run.kills : 0;
            html += `<div class="history-row">#${i + 1}: Time ${round1(run.survivedSeconds)}s | Level ${lvl} | Kills ${kills} | Coins ${intToStringRound(run.coinsGained)}</div>`;
            const talents = run.talentRows || [];
            if (talents.length > 0) {
                html += `<div class="history-row muted-text">Talent this run: ${talents.join(" | ")}</div>`;
            }
        }
        if (!html) {
            html = "<div class=\"muted-text\">No runs yet.</div>";
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
            view.updateVal("skillInfo_tips_rarity", "none", "style.display");
            view.updateVal("skillInfo_exp_on_trigger", "");
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
        const intMultOthers = skillKey !== "echoChamber" ? skills.getEchoChamberExpMultiplierForOthers() : 1;
        const expPerTrigger = skills.expGainForSkillTrigger(skill, 1) * intMultOthers;
        const expPct = Math.min(100, Math.max(0, (skill.exp / skill.expToLevel) * 100));
        const talPct = Math.min(100, Math.max(0, (skill.talent / skill.talentToLevel) * 100));
        const tipsVal = skill.tips || 0;
        const tipsUnlocked = engine.isSkillTipsUnlocked();
        view.updateVal("skillInfo_title", skill.name);
        const sum = skills.skillEffectUiSummary(skillKey, skill);
        if (sum) {
            view.updateVal("skillInfo_current", sum, "innerHTML");
            view.updateVal("skillInfo_current_wrap", "", "style.display");
        } else {
            view.updateVal("skillInfo_current", "", "innerHTML");
            view.updateVal("skillInfo_current_wrap", "none", "style.display");
        }
        view.updateVal("skillInfo_reward", skills.getSkillRewardText(skillKey, skill), "innerHTML");
        view.updateVal("skillInfo_trigger", skills.getSkillTriggerDescription(skillKey));
        if (tipsUnlocked) {
            const g = skills.getSkillGuestInfo(skillKey);
            view.updateVal("skillInfo_tips_rarity", `Tips rarity: ${g && g.rarity ? g.rarity : 1}`);
            view.updateVal("skillInfo_tips_rarity", "", "style.display");
        } else {
            view.updateVal("skillInfo_tips_rarity", "", "textContent");
            view.updateVal("skillInfo_tips_rarity", "none", "style.display");
        }
        view.updateVal("skillInfo_exp_on_trigger", `Exp on trigger: ${round2(expPerTrigger)}`);
        view.updateVal("skillInfo_exp_mults", `· Skill level ×${parts.levelMult.toFixed(4)}`);
        view.updateVal("skillInfo_exp_text", `${round1(skill.exp)} / ${round1(skill.expToLevel)}`);
        view.updateVal("skillInfo_exp_fill", `${expPct}%`, "style.width");
        view.updateVal("skillInfo_talent_text", `${round1(skill.talent)} / ${round1(skill.talentToLevel)} (Lv ${skill.talentLevel}) · exp ×${parts.talentMult.toFixed(4)}`);
        view.updateVal("skillInfo_talent_fill", `${talPct}%`, "style.width");
        const starMult = parts.starMult || 1;
        view.updateVal("skillInfo_star_effect_row", starMult > 1 ? "" : "none", "style.display");
        view.updateVal("skillInfo_star_effect", `×${starMult.toFixed(4)}`);
        view.updateVal("skillInfo_tips_row", tipsUnlocked ? "" : "none", "style.display");
        view.updateVal("skillInfo_tips_text", `${round1(tipsVal)}`);
        view.updateVal("skillInfo_tips_mults", `· Tips effect ×${parts.tipsMult.toFixed(4)}`);
        view.updateVal("skillInfo_combined_mults", `×${parts.combinedMult.toFixed(4)}`);
        if (skills.isSkillUnlocked("echoChamber")) {
            view.updateVal("skillInfo_integration_mult", `×${skills.getEchoChamberExpMultiplierForOthers().toFixed(4)}`);
            view.updateVal("skillInfo_integration_row", "", "style.display");
        } else {
            view.updateVal("skillInfo_integration_row", "none", "style.display");
        }
        view.updateVal("skillInfo_flavor", skills.getSkillFlavorText(skillKey));
    },
    updateSkillSubTabs: function() {
        const tab = data.progress.selectedSkillsTab || "combat";
        view.updateVal("skillSubTab_combat", tab === "combat" ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
        if (!events.foragingSkillsUnlocked()) {
            view.updateVal("skillSubTab_foraging", "none", "style.display");
        } else {
            view.updateVal("skillSubTab_foraging", "", "style.display");
            view.updateVal("skillSubTab_foraging", tab === "foraging" ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
        }
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
    updateTabButtons: function(activeTab) {
        const tabs = events.mainMenuTabOrder();
        const allTabs = ["base", "guests", "leveling", "stats", "skills", "travel", "history", "options"];
        const tabLabels = {
            base: "Resort", guests: "Guests", leveling: "Leveling", stats: "Stats",
            skills: "Skills", travel: "Travel", history: "History", options: "Options"
        };
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
            const btnEl = viewData.cached[id];
            const label = tabLabels[tabKey] || tabKey;
            if (btnEl) {
                const textNode = Array.from(btnEl.childNodes).find(function(n) { return n.nodeType === Node.TEXT_NODE; });
                if (textNode) {
                    textNode.textContent = label;
                } else if (!btnEl.querySelector(".tab-notify-badge")) {
                    btnEl.insertBefore(document.createTextNode(label), btnEl.firstChild);
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
            if (sk === "cistern" && !engine.isInnOnsenConverted()) {
                show = false;
            }
            if (sk === "inn" && !engine.isInnOnsenConverted()) {
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
    updateBaseBuildingInfoLayout: function() {
        const selected = !!(data.progress && data.progress.selectedBaseBuilding);
        const infoPanel = viewData.cached.baseBuildingInfo;
        const compactBreakpointPx = 1420;
        const forceWide = !!(data.progress.options && data.progress.options.disableCompactLayout);
        const compactOn = !forceWide && window.innerWidth < compactBreakpointPx;
        view.repositionBaseBuildingInfo();
        if (infoPanel) {
            infoPanel.style.display = selected ? "flex" : "none";
        }
        view.updateWorkerDockVisibility();
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
                intruderEl.style.left = `${leftPx}px`;
                intruderEl.style.top = `${renderY}px`;
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
            const audLayer = intruderEl.querySelector(".intruder-aud-layer");
            if (audLayer) {
                const audBg = intruder.intruderType === "lecher"
                    ? `linear-gradient(to top, #4da3ff ${audPct}%, #0d1d3a ${audPct}%)`
                    : `linear-gradient(to top, #6b21a8 ${audPct}%, #1a0a2e ${audPct}%)`;
                if (renderCache.audBg !== audBg) {
                    audLayer.style.background = audBg;
                    renderCache.audBg = audBg;
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
    spawnAttackLineFx: function(seg, parent) {
        const dx = seg.x2 - seg.x1;
        const dy = seg.y2 - seg.y1;
        const length = Math.sqrt((dx * dx) + (dy * dy));
        if (length < 1) {
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
        el.style.left = `${seg.x1}px`;
        el.style.top = `${seg.y1}px`;
        el.style.width = `${length}px`;
        el.style.transform = `translateY(-50%) rotate(${angle}deg)`;
        parent.appendChild(el);
        el.addEventListener("animationend", function() {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        }, { once: true });
    },
    spawnKillRewardFloater: function(centerXPx, topYPx, lines) {
        const battlefield = viewData.cached.battlefield;
        if (!battlefield || !lines || !lines.length) {
            return;
        }
        const el = document.createElement("div");
        el.className = "kill-reward-floater";
        el.innerHTML = lines.map(function(s) {
            return `<div class="kill-reward-floater-line">${s}</div>`;
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
        intruderEl.style.display = "block";
        return intruderEl;
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

    //helpers
    scheduleUpdate: function(elementId, value, type) {
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
                    el[type] = newVal;
                }
            }

            prevValue[typeKey] = newVal;
        }
    },
}
