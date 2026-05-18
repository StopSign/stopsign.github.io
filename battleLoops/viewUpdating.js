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
    menuCacheByTab: {},
};


let view = {
    updateViewAtFrame: function() { //This is the main view update function that is run once per frame
        view.renderBattlefield();

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
    updateGlobals: function() { //updates user-facing UI
        const isForaging = (data.battle.mode || "combat") === "foraging";
        const rd = data.battle.player.sandalAttackDamage !== undefined
            ? data.battle.player.sandalAttackDamage
            : Math.max(1, roundNearestDecimals(data.battle.player.attackDamage * 1.5, 1));
        const hasSandal = !!(data.progress.base && data.progress.base.workshop && data.progress.base.workshop.sandalBuilt);
        const regenPerSec = data.battle.player.regenPerSecond || 0;
        const fmtDmg1 = function(x) {
            return roundNearestDecimals(x, 1).toFixed(1);
        };
        const maxHpInt = Math.round(data.battle.player.maxHp || 0);
        const p = data.battle.player;
        const hpCur = p.hp;
        const lowHp = maxHpInt < 100;
        const hpLineText = lowHp
            ? `HP ${Math.max(0, roundNearestDecimals(hpCur, 1)).toFixed(1)}/${maxHpInt}`
            : `HP ${Math.round(hpCur)}/${maxHpInt}`;
        view.updateVal("playerStatHpLine", hpLineText);
        if (isForaging) {
            view.updateVal("playerStatDmgLine", `Harvest ${fmtDmg1(p.attackDamage)}`);
        } else {
            view.updateVal("playerStatDmgLine", hasSandal
                ? `Slap ${fmtDmg1(p.attackDamage)} · Sandal ${fmtDmg1(rd)}`
                : `Slap ${fmtDmg1(p.attackDamage)}`);
        }
        const twEff = skills.getSkillEffect("toughness_warrior");
        const armorFlat = twEff.toughnessArmorFlat !== undefined ? round2(twEff.toughnessArmorFlat) : 0;
        const secondaryParts = [];
        if (regenPerSec > 0) {
            secondaryParts.push(`Regen ${roundNearestDecimals(regenPerSec, 2).toFixed(2)}/s`);
        }
        if (armorFlat > 0) {
            secondaryParts.push(`Armor ${armorFlat} flat`);
        }
        view.updateVal("playerBattleHudSecondary", secondaryParts.length ? secondaryParts.join(" · ") : "-");
        const hpPct = Math.max(0, Math.min(100, (data.battle.player.hp / data.battle.player.maxHp) * 100));
        view.updateVal("playerTokenHpLayer", `linear-gradient(to top, #2ad15f ${hpPct}%, #0f3a1d ${hpPct}%)`, "style.background");
        const runClock = (data.battle.elapsedMs || 0) / 1000;
        const chapel = data.progress.base.chapel;
        const growthUnlocked = chapel.growthBlessingUnlocked;
        const plannedGrowthUnlocked = chapel.plannedGrowthBlessingUnlocked;
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
            tierStarClass = "skill-star-bronze";
            tierStarFilled = !!starProg.bronze;
            tierStarTitle = "Bronze cycle";
        }
        const sym = tierStarFilled ? "★" : "☆";
        const starHtml = `<span class="wave-info-star-inline skill-star-btn ${tierStarClass}${tierStarFilled ? " skill-star-filled" : ""}" title="${tierStarTitle}">${sym}</span>`;
        let waveHtml = `<div class="wave-info-time-row">${starHtml}<span class="wave-info-time-label">Time ${round1(runClock)}s</span></div>`;
        if ((data.battle.transitionCountdownMs || 0) > 0) {
            const sec = Math.ceil(data.battle.transitionCountdownMs / 1000);
            waveHtml += `<div>${data.battle.transitionMessage} (${sec}s)</div>`;
        }
        const zones = data.battle.activeZones || [];
        for (let i = 0; i < zones.length; i++) {
            const z = zones[i];
            const rm = z.remainingSpawnMs !== undefined ? z.remainingSpawnMs : 0;
            const spawnTail = rm > 25 ? ` | ${round1(rm / 1000)}s to spawn last` : "";
            const expInfo = growthUnlocked ? ` | exp ${round2(z.exp)}` : "";
            const shardPart = z.shardInfo ? ` | ${z.shardInfo}` : "";
            waveHtml += `<div>${z.name} | Difficulty x${round2(z.difficulty)} | gold ${round2(z.gold)}${expInfo} | ${intToStringRound(z.remainingEnemies)} left${spawnTail}${shardPart}</div>`;
        }
        if (viewData.prevValues.waveInfoHtml !== waveHtml) {
            viewData.cached.waveInfo.innerHTML = waveHtml;
            viewData.prevValues.waveInfoHtml = waveHtml;
        }
        const showOverlay = (data.battle.state === "dead" || data.battle.state === "completed") ? "flex" : "none";
        view.updateVal("deathOverlay", showOverlay, "style.display");
        const killGold = Math.max(0, data.battle.runGoldFromKills || 0);
        const talentEl = viewData.cached.deathTalentDetails;
        if (data.battle.state === "completed") {
            view.updateVal("deathTitle", "Map completed!");
            view.updateVal("deathSummary", `Bonus gold: ${intToStringRound(data.battle.completionBonusGold || 0)} | Time ${round1(runClock)}s | Level ${data.battle.levelState.level} | Kills ${data.battle.enemiesKilled} | Gold ${intToStringRound(killGold)}`);
            if (talentEl) {
                talentEl.innerHTML = "";
            }
        } else if (data.battle.state === "dead") {
            view.updateVal("deathTitle", "The clone has dispersed (no mana)");
            const retryTxt = (data.progress.base && data.progress.base.chapel && data.progress.base.chapel.autoRetryEnabled)
                ? ` | Retry in ${Math.max(0, data.progress.autoRetryCountdownSec || 0)}s`
                : "";
            view.updateVal("deathSummary", `Time ${round1(runClock)}s | Level ${data.battle.levelState.level} | Kills ${data.battle.enemiesKilled} | Gold ${intToStringRound(killGold)}${retryTxt}`);
            if (talentEl) {
                talentEl.innerHTML = view.buildDeathTalentSummaryHtml();
            }
        } else {
            view.updateVal("deathSummary", "");
            if (talentEl) {
                talentEl.innerHTML = "";
            }
        }
        createView.updateLayoutMeasurements();
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
        const hasActiveClassMenu = ["warrior", "rogue", "hunter"].indexOf(currentClsMenu) >= 0;
        let skillsTabNow = data.progress.selectedSkillsTab || "combat";
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

        view.updateVal("baseGoldText", (Math.round((data.progress.gold || 0) * 10) / 10).toFixed(1));

        const ls = data.battle.levelState;
        const chapel = data.progress.base.chapel;
        const growthUnlocked = chapel.growthBlessingUnlocked;
        const plannedGrowthUnlocked = chapel.plannedGrowthBlessingUnlocked;
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
        const levelPct = ls.expToLevel > 0 ? Math.max(0, Math.min(100, (ls.exp / ls.expToLevel) * 100)) : 0;
        view.updateVal("levelTabExpFill", `${levelPct}%`, "style.width");
        view.updateVal("attributePointsText", ls.unassignedPoints, "textContent", 1);
        view.updateVal("levelingPointsWrap", plannedGrowthUnlocked ? "" : "none", "style.display");
        view.updateVal("levelingAssignButtons", plannedGrowthUnlocked ? "" : "none", "style.display");
        view.updateVal("attributePlanTitle", plannedGrowthUnlocked ? "" : "none", "style.display");
        view.updateVal("attributePlanList", plannedGrowthUnlocked ? "" : "none", "style.display");
        view.updateVal("strText", ls.levelStr + ls.skillStrBonus, "textContent", 1);
        view.updateVal("conText", ls.levelCon + ls.skillConBonus, "textContent", 1);
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
        const starPool = data.progress.stars || { bronze: 0, silver: 0, gold: 0 };
        const starLine = `<span class="star-bronze">★</span>: ${starPool.bronze || 0} | <span class="star-silver">★</span>: ${starPool.silver || 0} | <span class="star-gold">★</span>: ${starPool.gold || 0}`;
        view.updateVal("combatStarsInventory", showStarInventory ? "" : "none", "style.display");
        if (showStarInventory) {
            view.updateVal("combatStarsInventory", starLine, "innerHTML");
        }

        const hasSandal = !!(data.progress.base && data.progress.base.workshop && data.progress.base.workshop.sandalBuilt);
        const classSandalLocked = (data.progress.currentClassKey || "none") === "rogue";
        const sandalToggle = viewData.cached.sandalAttackToggle;
        if (sandalToggle) {
            const want = !!(data.progress.sandalAttackEnabled && hasSandal && !classSandalLocked);
            if (sandalToggle.checked !== want) {
                sandalToggle.checked = want;
            }
            sandalToggle.disabled = classSandalLocked;
        }
        view.updateVal("sandalAttackLockText", classSandalLocked ? "Rogue cannot use sandal attacks." : "");
        view.updateVal("sandalAttackWrap", (hasSandal && !isForaging) ? "" : "none", "style.display");
        const p = data.battle.player;
        const lsMult = data.battle.levelState || {};
        const conTotal = (lsMult.levelCon || 0) + (lsMult.skillConBonus || 0);
        const strTotal = (lsMult.levelStr || 0) + (lsMult.skillStrBonus || 0);
        const gc = gameData.battle.combat;
        const cdCfg = gameData.battle.cooldowns;
        const forgeAtk = data.progress.base && data.progress.base.smith ? (data.progress.base.smith.attackUpgradesBought || 0) : 0;
        const forgeArmor = data.progress.base && data.progress.base.smith ? (data.progress.base.smith.armorUpgradesBought || 0) : 0;
        const fortInner = skills.getSkillEffect("endurance").enduranceBaseHpInnerBonus || 0;
        const tenB = skills.getSkillEffect("tenacity").tenacityHpInnerBonus || 0;
        const tenFlatScaled = Math.ceil((2 * tenB) * (1 + conTotal / gc.conStrStatDivisor));
        const forceFlatStats = roundNearestDecimals(skills.getSkillEffect("force").slapFlatBeforeStr || 0, 2);
        const wisMult = roundNearestDecimals(skills.getSkillEffect("wisdom").wisdomCharacterExpMultiplier || 1, 2);
        const greedMult = roundNearestDecimals(skills.getSkillEffect("greed").greedKillGoldMultiplier || 1, 2);
        view.updateVal("statsHpText", `${intToStringRound(p.maxHp)} HP`);
        view.updateVal("statsHpTip", `Base inner HP: +${gc.baseHpInner}<br>Endurance: +${fortInner}<br>Tenacity: +${tenB} inner, +${tenFlatScaled} current (2× inner × Con)<br>Forge basic armor: +${forgeArmor * gc.smithArmorHpPerUpgrade}<br>Con multiplier: +${Math.round(conTotal * (100 / gc.conStrStatDivisor))}%`, "innerHTML");
        view.updateVal("statsRegenText", `${round2(p.regenPerSecond || 0)}/s`);
        view.updateVal("statsRegenTip", "From Recovery skill level (HP/s).", "innerHTML");
        view.updateVal("statsAttackText", `${roundNearestDecimals(p.attackDamage, 1).toFixed(1)} dmg`);
        view.updateVal("statsAttackTip", `Base slap: ${gc.baseSlapDamage}<br>Force (before Str): +${forceFlatStats}<br>Forge firmer slap: +${forgeAtk}<br>Strength multiplier: +${Math.round(strTotal * (100 / gc.conStrStatDivisor))}%`, "innerHTML");
        const twEff = skills.getSkillEffect("toughness_warrior");
        const armorFlat = twEff.toughnessArmorFlat !== undefined ? round2(twEff.toughnessArmorFlat) : 0;
        view.updateVal("statsArmorText", `${round2(armorFlat)} flat`);
        view.updateVal("statsArmorTip", `Warrior Toughness: +${round2(armorFlat)} flat damage reduction`, "innerHTML");
        view.updateVal("statsSlapText", `${round2((p.attackCooldownMs || 0) / 1000)}s`);
        const alaEff = skills.getSkillEffect("alacrity");
        const alaLv = alaEff.alacrityEffectiveLevel || 0;
        view.updateVal("statsSlapTip", `Base: ${round2(cdCfg.slapBaseMs / 1000)}s<br>Alacrity reduction: ${alaLv * cdCfg.alacritySlapReductionPerLevelMs} ms<br>Floor: ${round2(cdCfg.slapFloorMs / 1000)}s`, "innerHTML");
        view.updateVal("statsSandalText", hasSandal ? `${round2((p.sandalAttackCooldownMs || 0) / 1000)}s` : "Locked");
        view.updateVal("statsSandalTip", hasSandal ? `Base: ${round2(cdCfg.sandalBaseMs / 1000)}s<br>Alacrity reduction: ${alaLv * cdCfg.alacritySandalReductionPerLevelMs} ms<br>Floor: ${round2(cdCfg.sandalFloorMs / 1000)}s` : "Requires Spare sandal upgrade", "innerHTML");

        const current = data.progress.currentMapKey;
        const smartHarvestOn = !!(data.progress.base && data.progress.base.garden && data.progress.base.garden.smartHarvestUnlocked);
        const clsMenu = data.progress.currentClassKey || "none";
        const hasClassForTravel = ["warrior", "rogue", "hunter"].indexOf(clsMenu) >= 0;
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
        for (let i = 0; i < mapDefs.length; i++) {
            const map = mapDefs[i];
            const reqClass = map.requiredClassKey || "";
            const classAllowed = !reqClass || reqClass === clsMenu;
            const unlocked = mapData.isMapUnlocked(map, data.progress);
            view.updateVal(`travel_card_${map.key}`, classAllowed ? "" : "none", "style.display");
            const onThisMap = current === map.key;
            view.updateVal(`mapButton_${map.key}`, onThisMap ? "none" : "", "style.display");
            if (!onThisMap) {
                view.updateVal(`mapButton_${map.key}`, "Clear the Grounds", "textContent");
            }
            view.updateVal(`mapButton_${map.key}`, onThisMap || !classAllowed || !unlocked, "disabled");
            view.updateVal(`mapActionCurrent_${map.key}`, onThisMap ? "" : "none", "style.display");
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
                if (onThisMap) {
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
            const shardSummary = mapData.getMapShardSummaryText(map, data.progress.skills);
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
            if (typeof u.upgradeSoldOut === "function" && u.upgradeSoldOut()) {
                return u.soldOutButtonLabel || "Bought";
            }
            const costGetter = typeof u.getCost === "function"
                ? u.getCost
                : function() {
                    return townData.resolveCost(u, buildingSegment);
                };
            return townData.buyForFromCost(costGetter);
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
            const bcfg = townData.buildings[buildingSegment];
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
                const slug = townData.slug(u);
                const rowEl = townData.idRow(buildingSegment, slug);
                const btnEl = townData.idBtn(buildingSegment, slug);
                const extraEl = townData.idExtra(buildingSegment, slug);
                if (typeof u.rowVisible === "function") {
                    view.updateVal(rowEl, u.rowVisible(hideMx) ? "" : "none", "style.display");
                }
                if (typeof u.extraInfo === "function") {
                    view.updateVal(extraEl, u.extraInfo());
                }
                const btnText = typeof o.buyButtonText === "function" ? o.buyButtonText(pk, u) : soldOutOrBuyLabel(u, buildingSegment);
                view.updateVal(btnEl, btnText);
                if (typeof o.buttonDisabled === "function") {
                    view.updateVal(btnEl, o.buttonDisabled(pk, u), "disabled");
                }
            }
        };
        const syncWorkerAdjustButtonsDisabled = function(buildingSegment, canAssignMore, canUnassign) {
            let ai;
            for (ai = 0; ai < townData.workerAdjustIncrBtnSuffixes.length; ai++) {
                const sfx = townData.workerAdjustIncrBtnSuffixes[ai];
                view.updateVal(`base_${buildingSegment}_${sfx}_btn`, !canAssignMore, "disabled");
            }
            for (ai = 0; ai < townData.workerAdjustDecrBtnSuffixes.length; ai++) {
                const sfx = townData.workerAdjustDecrBtnSuffixes[ai];
                view.updateVal(`base_${buildingSegment}_${sfx}_btn`, !canUnassign, "disabled");
            }
        };
        const syncWorkerGearSitePanel = function(siteKey) {
            const bcfg = townData.buildings[siteKey];
            const ws = bcfg.workers;
            const bslot = base[siteKey];
            const gearKey = ws.gearKey || "gear";
            const gearUp = bcfg.upgrades[gearKey];
            view.updateVal(`base_${siteKey}_row`, ws.panelStatusRowHtml(res, base));
            const aWorkers = bslot.assignedWorkers || 0;
            const gSets = bslot.gearSets || 0;
            view.updateVal(`base_${siteKey}_workers_label`, `Workers: ${aWorkers}/${gSets} gear`);
            if (gearUp) {
                const nextGearCost = townData.resolveCost(gearUp, siteKey);
                view.updateVal(townData.idBtn(siteKey, gearUp.key), townData.buyForFromCost(nextGearCost));
                view.updateVal(townData.idExtra(siteKey, gearUp.key), `Next: ${townData.costToParts(nextGearCost).join(", ")}`);
            }
            const canAssignGear = (bslot.assignedWorkers || 0) < (bslot.gearSets || 0) && engine.getAvailableWorkers() > 0;
            const canUnassignGear = (bslot.assignedWorkers || 0) > 0;
            syncWorkerAdjustButtonsDisabled(siteKey, canAssignGear, canUnassignGear);
            const manualUnlock = (bslot.assignedWorkers || 0) > 0;
            view.updateVal(ws.manualBtnId, manualUnlock ? "" : "none", "style.display");
            view.updateVal(ws.manualCdWrapId, manualUnlock ? "" : "none", "style.display");
            view.updateVal(ws.manualCdTextId, "none", "style.display");
            view.updateVal(ws.manualBtnId, (bslot.manualCooldownMs || 0) > 0, "disabled");
            view.updateVal(ws.manualCdFillId, `${cdPct(bslot.manualCooldownMs)}%`, "style.width");
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

    updateBasePanelBuildingSelection: function(selected) {
        for (let i = 0; i < townData.baseBuildingOrder.length; i++) {
            const key = townData.baseBuildingOrder[i];
            const id = `baseBuilding_${key}`;
            const isActive = key === selected;
            view.updateVal(id, isActive, "classList.toggle", "base-building-selected");
        }
    },

    /** Mine/smith/claypit/kiln: workerPower (40 = one unit); map + panel bars or completion rate when workers > 40. */
    updateBasePanelWorkerProgressBars: function(base) {
        const WP_CAP = 40;
        const wpk = townData.workerPowerSiteKeys || [];
        let si;
        for (si = 0; si < wpk.length; si++) {
            const siteKey = wpk[si];
            const ws = townData.buildings[siteKey].workers;
            if (!ws || !ws.panelProgressFillId || !ws.panelProgressWrapId) {
                continue;
            }
            const slot = base[siteKey];
            const w = slot.assignedWorkers || 0;
            const wp = slot.workerPower || 0;
            const mapRateId = `base_${siteKey}_map_prod_rate`;
            const panelTextId = `base_${siteKey}_worker_prod_text`;
            const panelWrapId = `base_${siteKey}_worker_prod_wrap`;
            const panelFillId = `base_${siteKey}_worker_prog_fill`;
            const ratePerSec = w / WP_CAP;
            if (w <= 0) {
                view.updateVal(ws.panelProgressWrapId, "none", "style.display");
                view.updateVal(ws.panelProgressFillId, "0%", "style.width");
                view.updateVal(mapRateId, "none", "style.display");
                view.updateVal(panelWrapId, "none", "style.display");
                view.updateVal(panelTextId, "");
                continue;
            }
            const showRateOnly = w > WP_CAP;
            if (showRateOnly) {
                const rateTxt = `${round2(ratePerSec)}/s`;
                view.updateVal(ws.panelProgressWrapId, "none", "style.display");
                view.updateVal(mapRateId, rateTxt);
                view.updateVal(mapRateId, "", "style.display");
                view.updateVal(panelWrapId, "none", "style.display");
                view.updateVal(panelTextId, rateTxt);
            } else {
                const pct = Math.max(0, Math.min(100, (wp / WP_CAP) * 100));
                view.updateVal(ws.panelProgressFillId, `${pct}%`, "style.width");
                view.updateVal(ws.panelProgressWrapId, "", "style.display");
                view.updateVal(mapRateId, "none", "style.display");
                view.updateVal(panelWrapId, "", "style.display");
                view.updateVal(panelFillId, `${pct}%`, "style.width");
                view.updateVal(panelTextId, `Worker power ${round1(wp)} / ${WP_CAP}`);
            }
        }
        for (si = 0; si < townData.workerSitePanelOrder.length; si++) {
            const siteKey = townData.workerSitePanelOrder[si];
            if ((townData.workerPowerSiteKeys || []).indexOf(siteKey) >= 0) {
                continue;
            }
            const ws = townData.buildings[siteKey].workers;
            if (ws.panelProgressFillId && ws.panelProgressWrapId) {
                const pct = Math.max(0, Math.min(100, ((base[siteKey].progress || 0)) * 100));
                view.updateVal(ws.panelProgressFillId, `${pct}%`, "style.width");
                const manualSiteUnlocked = (base[siteKey].assignedWorkers || 0) > 0;
                view.updateVal(ws.panelProgressWrapId, manualSiteUnlocked ? 1 : 0, "style.opacity");
            }
        }
    },

    /** Generic: travel-map manual shortcut visibility from garden upgrade keys. */
    updateBasePanelMapManualShortcuts: function(base) {
        let si;
        const gKeys = townData.gardenMapManualUpgradeKeys || [];
        for (si = 0; si < gKeys.length; si++) {
            const gk = gKeys[si];
            view.updateVal(`mapManualBtn_${gk}`, townData.mapManualShortcutVisible(gk, base) ? "inline-block" : "none", "style.display");
        }
    },

    /** Generic: resource strip + global worker counts. */
    updateBaseResourceStrip: function(res) {
        view.updateVal("base_res_ore", res.ironOre, "textContent", "floor");
        view.updateVal("base_res_stone", res.stone, "textContent", "floor");
        view.updateVal("base_res_logs", res.logs || 0, "textContent", "floor");
        view.updateVal("base_res_bar", res.ironBar, "textContent", "floor");
        view.updateVal("base_res_bricks", res.bricks, "textContent", "floor");
        view.updateVal("base_res_lumber", res.lumber || 0, "textContent", "floor");
        let totalWorkers = engine.getTotalFoundWorkers();
        view.updateVal("baseWorkersAssigned", totalWorkers - engine.getTotalAssignedWorkers(), "textContent", 1);
        view.updateVal("baseWorkersFound", totalWorkers, "textContent", 1);
    },

    updateBasePanelChapel: function(t) {
        const chapelDef = townData.buildings.chapel;
        t.refreshOrderedPurchasables("chapel", chapelDef.upgradesOrder, { hideMaxed: t.hideMaxed });
    },

    updateBasePanelTownHall: function(base, t) {
        const townhall = base.townhall;
        const unlocks = townhall.unlocks;
        const thTab = data.progress.selectedTownHallTab;
        view.updateVal("base_townhall_buildings_wrap", thTab === "buildings" ? "" : "none", "style.display");
        view.updateVal("base_townhall_upgrades_wrap", thTab === "town_upgrades" ? "" : "none", "style.display");
        for (let i = 0; i < townData.townhallUnlockOrder.length; i++) {
            const uk = townData.townhallUnlockOrder[i];
            const bought = !!unlocks[uk];
            const slot = townData.townhallUnlockGetDef(uk);
            const rowId = townData.idRow("townhall", uk);
            const btnId = townData.idBtn("townhall", uk);
            view.updateVal(rowId, bought ? "none" : "", "style.display");
            const parts = townData.costToParts(townData.resolveCost(slot));
            view.updateVal(btnId, bought ? "Bought" : (parts.length ? t.buyFor(parts) : t.buyFor(["0 gold"])));
            view.updateVal(btnId, bought, "disabled");
            view.updateVal(`base_townhall_extra_${uk}`, "");
        }
        t.refreshOrderedPurchasables("townhall", townData.buildings.townhall.upgradesOrder, t.soldOutUpgradeRowOpts(false, "townhall"));
        const subNotify = (data.progress.baseContentNotify && data.progress.baseContentNotify.subtab) || {};
        const thLbl = { buildings: "Buildings", town_upgrades: "Town Upgrades" };
        const sth = ["buildings", "town_upgrades"];
        for (let ti = 0; ti < sth.length; ti++) {
            const st = sth[ti];
            const need = !!subNotify["townhall_" + st];
            const btnId = st === "buildings" ? "townhallTab_buildings" : "townhallTab_town_upgrades";
            const tel = viewData.cached[btnId];
            view.updateVal(btnId, thLbl[st] + (need ? " (!)" : ""), "textContent");
            if (tel) {
                tel.classList.toggle("tab-button--notify", !!need);
            }
            view.updateVal(btnId, thTab === st ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
        }
    },

    /** Hide building buttons / panels by town hall unlocks. */
    updateBasePanelUnlockVisibility: function(buildingVisibleFn) {
        for (let i = 0; i < townData.baseBuildingOrder.length; i++) {
            const k = townData.baseBuildingOrder[i];
            view.updateVal(`baseBuilding_${k}`, buildingVisibleFn(k) ? "" : "none", "style.display");
            view.updateVal(`basePanel_${k}`, (buildingVisibleFn(k) && k === data.progress.selectedBaseBuilding) ? "" : "none", "style.display");
        }
    },

    updateBasePanelGuild: function() {
        const unlocked = data.progress.unlockedClasses || {};
        const currentClass = data.progress.currentClassKey || "none";
        const pendingClass = data.progress.pendingClassKey || "";
        const classSwitchCooldownMs = Math.max(0, data.progress.classSwitchCooldownMs || 0);
        const classSwitchCooldownTxt = classSwitchCooldownMs > 0 ? ` | Class switch cooldown: ${Math.ceil(classSwitchCooldownMs / 1000)}s` : "";
        const guildTxt = pendingClass
            ? `Current class: ${initialize.getClassDef(currentClass).name} | Pending switch: ${initialize.getClassDef(pendingClass).name} (applies on Try Again)${classSwitchCooldownTxt}`
            : `Current class: ${initialize.getClassDef(currentClass).name}${classSwitchCooldownTxt}`;
        view.updateVal("base_guild_current", guildTxt);
        for (let ci = 0; ci < townData.guildClasses.length; ci++) {
            const ck = townData.guildClasses[ci];
            const isUnlocked = !!unlocked[ck];
            const buyId = townData.guildBuyBtn(ck);
            const switchId = townData.guildSwitchBtn(ck);
            const gUp = townData.buildings.guild.upgrades[ck];
            view.updateVal(buyId, isUnlocked ? "Bought" : townData.buyForFromCost(() => townData.resolveCost(gUp)));
            view.updateVal(buyId, isUnlocked, "disabled");
            view.updateVal(`base_guild_extra_${ck}`, "");
            const isCurrent = currentClass === ck;
            const isPending = pendingClass === ck;
            view.updateVal(switchId, isPending ? "Switching..." : (isCurrent ? "Current" : "Switch"));
            view.updateVal(switchId, !isUnlocked || isCurrent || isPending || classSwitchCooldownMs > 0, "disabled");
        }
    },

    /** Generic: mine / smith / claypit / kiln / lumbermill gear + manual rows. */
    updateBasePanelWorkerSites: function(t) {
        let si;
        for (si = 0; si < townData.workerSitePanelOrder.length; si++) {
            t.syncWorkerGearSitePanel(townData.workerSitePanelOrder[si]);
        }
    },

    updateBasePanelSmith: function(t) {
        t.refreshOrderedPurchasables("smith", townData.buildings.smith.upgradesAfterWorkersOrder, t.soldOutUpgradeRowOpts(t.hideMaxed, "smith"));
    },

    updateBasePanelInn: function(base, t) {
        const inn = base.inn;
        const maxGuests = typeof engine.getInnGuestCapacity === "function" ? engine.getInnGuestCapacity() : 3;
        t.refreshOrderedPurchasables("inn", townData.buildings.inn.upgradesOrder, { hideMaxed: t.hideMaxed });
        view.updateVal("base_inn_open_row", inn.openForGuests ? "" : "none", "style.display");
        view.updateVal("base_inn_next_row", inn.openForGuests ? "" : "none", "style.display");
        view.updateVal("base_inn_adv_btn", inn.openForGuests ? "" : "none", "style.display");
        view.updateVal("base_inn_adv_cd_wrap", inn.openForGuests ? "" : "none", "style.display");
        view.updateVal("base_inn_adv_cd_text", "none", "style.display");
        view.updateVal("base_inn_adv_cd_fill", `${t.cdPct(inn.advertiseCooldownMs)}%`, "style.width");
        view.updateVal("base_inn_adv_btn", (inn.advertiseCooldownMs || 0) > 0, "disabled");
        view.updateVal("base_inn_open_row", "Open for guests: active");
        view.updateVal("base_inn_next_row", `Guests ${inn.guests.length}/${maxGuests} · Next guest in ${Math.ceil(Math.max(0, inn.nextGuestTimerMs) / 1000)}s`);
        for (let gi = 0; gi < 10; gi++) {
            const guest = inn.guests[gi];
            view.updateVal(`base_inn_guest_wrap_${gi}`, guest ? "" : "none", "style.display");
            if (guest) {
                const skillName = guest.skillKey && data.progress.skills[guest.skillKey] ? data.progress.skills[guest.skillKey].name : "Nothing to tell you";
                view.updateVal(`base_inn_guest_name_${gi}`, `${guest.archetype} · ${skillName}`);
                view.updateVal(`base_inn_guest_chat_${gi}`, !!guest.isChatting, "disabled");
                view.updateVal(`base_inn_guest_fill_${gi}`, `${Math.max(0, Math.min(100, (guest.chatProgress || 0) * 100))}%`, "style.width");
                const btn = viewData.cached[`base_inn_guest_chat_${gi}`];
                if (btn) {
                    btn.dataset.guestId = guest.id;
                }
            }
        }
        view.updateVal("base_inn_empty", inn.openForGuests && !inn.guests.length ? "" : "none", "style.display");
    },

    updateBasePanelLibrary: function(base, t) {
        let libTab = data.progress.selectedLibraryTab || "combat";
        const currentCls = data.progress.currentClassKey || "none";
        const hasActiveClass = ["warrior", "rogue", "hunter"].indexOf(currentCls) >= 0;
        if (libTab === "class" && !hasActiveClass) {
            libTab = "combat";
            data.progress.selectedLibraryTab = "combat";
        }
        if (libTab === "foraging" && !events.foragingSkillsUnlocked()) {
            libTab = "combat";
            data.progress.selectedLibraryTab = "combat";
        }
        const lib = base.library || {};
        const libWorkers = lib.assignedWorkers || 0;
        const libDesks = lib.gearSets || 0;
        view.updateVal("base_library_workers_label", `Researchers: ${libWorkers}/${libDesks} desks · Queue top-down by priority`);
        t.refreshOrderedPurchasables("library", townData.buildings.library.upgradesOrder, {});
        const canLibAssign = libWorkers < libDesks && engine.getAvailableWorkers() > 0;
        const canLibUnassign = libWorkers > 0;
        t.syncWorkerAdjustButtonsDisabled("library", canLibAssign, canLibUnassign);
        let activeResearch = null;
        for (let i = 0; i < skills.keysInOrder.length; i++) {
            const key = skills.keysInOrder[i];
            const rs = lib.skillResearch && lib.skillResearch[key] ? lib.skillResearch[key] : null;
            if (rs && rs.purchased && !rs.researched && !rs.paused) {
                activeResearch = rs;
                break;
            }
        }
        const libPct = activeResearch && (activeResearch.required || 0) > 0
            ? Math.max(0, Math.min(100, ((activeResearch.progress || 0) / activeResearch.required) * 100))
            : 0;
        view.updateVal("baseLibraryProgressFill", `${libPct}%`, "style.width");
        view.updateVal("baseLibraryProgressWrap", activeResearch ? 1 : 0, "style.opacity");
        let shownLibraryRows = 0;
        for (let i = 0; i < skills.keysInOrder.length; i++) {
            const k = skills.keysInOrder[i];
            const sk = data.progress.skills[k];
            const unlockG = skills.getSkillUnlockCostGold(k);
            const researchReq = skills.getSkillresearchRequired(k);
            const cat = (sk && sk.category) || "combat";
            if (cat !== libTab) {
                view.updateVal(`base_library_row_${k}`, "none", "style.display");
                continue;
            }
            const dSk = skills._byKey[k];
            if (dSk && dSk.classKey && (!hasActiveClass || dSk.classKey !== currentCls)) {
                view.updateVal(`base_library_row_${k}`, "none", "style.display");
                continue;
            }
            const innUnlocked = !!(base.townhall && base.townhall.unlocks && base.townhall.unlocks.inn);
            if (k === "gossip" && !innUnlocked) {
                view.updateVal(`base_library_row_${k}`, "none", "style.display");
                continue;
            }
            const unlocked = !!(lib.unlockedSkills && lib.unlockedSkills[k]);
            const rs = lib.skillResearch && lib.skillResearch[k] ? lib.skillResearch[k] : null;
            const purchased = !!(rs && rs.purchased);
            const researched = !!(rs && rs.researched) || unlocked;
            const showRow = !researched;
            if (showRow) {
                shownLibraryRows++;
            }
            view.updateVal(`base_library_row_${k}`, showRow ? "" : "none", "style.display");
            const buyGold = unlockG;
            const reqResearch = researchReq;
            if (!purchased) {
                view.updateVal(`base_library_btn_${k}`, "", "style.display");
                view.updateVal(`base_library_btn_${k}`, t.buyFor([`${intToStringRound(buyGold)} gold`]));
                view.updateVal(`base_library_btn_${k}`, false, "disabled");
                view.updateVal(`base_library_progress_${k}`, `Research required: ${intToStringRound(reqResearch)}`);
                view.updateVal(`base_library_pause_${k}`, "none", "style.display");
            } else {
                const p = rs.progress || 0;
                const r = rs.required || reqResearch;
                const paused = !!rs.paused;
                view.updateVal(`base_library_btn_${k}`, "none", "style.display");
                view.updateVal(`base_library_progress_${k}`, `${paused ? "[Paused] " : ""}${intToStringRound(p)} / ${intToStringRound(r)} research`);
                view.updateVal(`base_library_pause_${k}`, paused ? "Resume" : "Pause");
                view.updateVal(`base_library_pause_${k}`, "", "style.display");
            }
        }
        view.updateVal("base_library_empty", shownLibraryRows ? "none" : "", "style.display");
        const libLbl = { combat: "Combat", town: "Town", foraging: "Foraging", class: "Class" };
        const slt = ["combat", "town", "foraging", "class"];
        for (let li = 0; li < slt.length; li++) {
            const st = slt[li];
            const btnId = "libraryTab_" + st;
            if (st === "class" && !hasActiveClass) {
                view.updateVal(btnId, "none", "style.display");
                continue;
            }
            if (st === "foraging" && !events.foragingSkillsUnlocked()) {
                view.updateVal(btnId, "none", "style.display");
                continue;
            }
            view.updateVal(btnId, "", "style.display");
            view.updateVal(btnId, libLbl[st], "textContent");
            view.updateVal(btnId, libTab === st ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
        }
    },

    updateBasePanelWorkshop: function(t) {
        t.refreshOrderedPurchasables("workshop", townData.buildings.workshop.upgradesOrder, t.soldOutUpgradeRowOpts(t.hideMaxed, "workshop"));
    },

    updateBasePanelGarden: function(base, t) {
        const g = base.garden || {};
        let shownGarden = 0;
        const gardenManualOrder = townData.buildings.garden.upgradesOrder;
        for (let i = 0; i < gardenManualOrder.length; i++) {
            const rk = gardenManualOrder[i];
            const mk = townData.gardenManualMapKey(rk);
            let bought = !!(mk && g[mk]);
            if (rk === "smartHarvest") {
                bought = !!g.smartHarvestUnlocked;
            }
            const rowVis = townData.buildings.garden.upgrades[rk] && typeof townData.buildings.garden.upgrades[rk].rowVisible === "function"
                ? townData.buildings.garden.upgrades[rk].rowVisible()
                : true;
            const show = rowVis && !(t.hideMaxed && bought);
            if (show) {
                shownGarden++;
            }
            const grId = townData.idRow("garden", rk);
            const gbId = townData.idBtn("garden", rk);
            const gExId = townData.idExtra("garden", rk);
            view.updateVal(grId, show ? "" : "none", "style.display");
            const gUp = townData.buildings.garden.upgrades[rk];
            view.updateVal(gbId, bought ? "Bought" : (gUp ? townData.buyForFromCost(() => townData.resolveCost(gUp)) : t.buyFor(["200 gold"])));
            view.updateVal(gbId, bought, "disabled");
            view.updateVal(gExId, "");
        }
        view.updateVal("base_garden_empty", shownGarden ? "none" : "", "style.display");
    },

    updateBasePanel: function() {
        const base = data.progress.base;
        let selected = data.progress.selectedBaseBuilding;
        if (townData.baseBuildingOrder.indexOf(selected) < 0) {
            selected = "chapel";
            data.progress.selectedBaseBuilding = selected;
        }
        this.updateBasePanelBuildingSelection(selected);

        const res = base.resources;
        const hideMaxed = !!(data.progress.options && data.progress.options.hideMaxedUpgrades);
        const t = this._basePanelPurchasingTools(base, res, hideMaxed);

        this.updateBasePanelWorkerProgressBars(base);
        this.updateBasePanelMapManualShortcuts(base);
        this.updateBaseResourceStrip(res);

        const unlocks = base.townhall.unlocks;
        const buildingVisible = function(key) {
            if (key === "chapel" || key === "townhall") {
                return true;
            }
            return !!unlocks[key];
        };

        this.updateBasePanelChapel(t);
        this.updateBasePanelTownHall(base, t);
        this.updateBasePanelUnlockVisibility(buildingVisible);
        if (!buildingVisible(data.progress.selectedBaseBuilding)) {
            data.progress.selectedBaseBuilding = "chapel";
        }

        this.updateBasePanelGuild();
        this.updateBasePanelWorkerSites(t);
        this.updateBasePanelSmith(t);
        this.updateBasePanelInn(base, t);
        this.updateBasePanelLibrary(base, t);
        this.updateBasePanelWorkshop(t);
        this.updateBasePanelGarden(base, t);

        view.refreshBaseBuildingNotifications();
    },
    refreshBaseBuildingNotifications: function() {
        const nb = (data.progress.baseContentNotify && data.progress.baseContentNotify.building) || {};
        const buildingVisible = function(key) {
            const unl = data.progress.base.townhall.unlocks;
            if (key === "chapel" || key === "townhall") {
                return true;
            }
            return !!(unl && unl[key]);
        };
        for (let bi = 0; bi < townData.baseBuildingOrder.length; bi++) {
            const k = townData.baseBuildingOrder[bi];
            if (!buildingVisible(k)) {
                continue;
            }
            const need = !!nb[k];
            const label = townData.baseBuildingDisplayNames[k] + (need ? " (!)" : "");
            const bel = viewData.cached[`baseBuilding_${k}`];
            view.updateVal(`baseBuilding_${k}`, label, "textContent");
            if (bel) {
                bel.classList.toggle("base-building-label--notify", !!need);
            }
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
            html += `<div class="history-row">#${i + 1}: Time ${round1(run.survivedSeconds)}s | Level ${lvl} | Kills ${kills} | Gold ${intToStringRound(run.goldGained)}</div>`;
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
        const hasActiveClass = ["warrior", "rogue", "hunter"].indexOf(currentCls) >= 0;
        let msg = "";
        if (tab === "class") {
            msg = hasActiveClass ? "Buy class skills in the Library." : "Choose a class at the Guild to see class skills here.";
        } else if (tab === "foraging") {
            msg = "No foraging skills unlocked yet. Visit the Library in Base.";
        } else {
            const label = tab === "town" ? "town" : "combat";
            msg = `No ${label} skills unlocked yet. Visit the Library in Base.`;
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
        const intMultOthers = skillKey !== "integration" ? skills.getIntegrationExpMultiplierForOthers() : 1;
        const expPerTrigger = skills.expGainForSkillTrigger(skill, 1) * intMultOthers;
        const expPct = Math.min(100, Math.max(0, (skill.exp / skill.expToLevel) * 100));
        const talPct = Math.min(100, Math.max(0, (skill.talent / skill.talentToLevel) * 100));
        const tipsVal = skill.tips || 0;
        const innUnlockedFromTownHall = !!(data.progress.base && data.progress.base.townhall && data.progress.base.townhall.unlocks && data.progress.base.townhall.unlocks.inn);
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
        if (innUnlockedFromTownHall) {
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
        view.updateVal("skillInfo_tips_row", innUnlockedFromTownHall ? "" : "none", "style.display");
        view.updateVal("skillInfo_tips_text", `${round1(tipsVal)}`);
        view.updateVal("skillInfo_tips_mults", `· Tips effect ×${parts.tipsMult.toFixed(4)}`);
        view.updateVal("skillInfo_combined_mults", `×${parts.combinedMult.toFixed(4)}`);
        if (skills.isSkillUnlocked("integration")) {
            view.updateVal("skillInfo_integration_mult", `×${skills.getIntegrationExpMultiplierForOthers().toFixed(4)}`);
            view.updateVal("skillInfo_integration_row", "", "style.display");
        } else {
            view.updateVal("skillInfo_integration_row", "none", "style.display");
        }
        view.updateVal("skillInfo_flavor", skills.getSkillFlavorText(skillKey));
    },
    updateSkillSubTabs: function() {
        const tab = data.progress.selectedSkillsTab || "combat";
        view.updateVal("skillSubTab_combat", tab === "combat" ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
        view.updateVal("skillSubTab_town", tab === "town" ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
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
            const atkName = (cls === "warrior" && (data.battle.classPowerA || 0) >= 1000) ? "Power slap" : "Slap";
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
            const sandalOn = !!(data.progress.sandalAttackEnabled && data.progress.base && data.progress.base.workshop && data.progress.base.workshop.sandalBuilt && (data.progress.currentClassKey || "none") !== "rogue");
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
            const currentHp = data.battle.player ? data.battle.player.hp : 0;
            const prevHp = viewData.prevValues.playerPulsePrevHp !== undefined ? viewData.prevValues.playerPulsePrevHp : currentHp;
            const takingDamageNow = currentHp < prevHp;
            viewData.prevValues.playerPulsePrevHp = currentHp;
            const movingForward = pushPx > 0;
            movePulse.classList.toggle("move-pulse-active", movingForward && !takingDamageNow);
        }
        if (lvlFill && lvlLabel) {
            const chapel = data.progress.base && data.progress.base.chapel;
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
            if (cls === "warrior") {
                view.updateVal("playerClassBarALabel", `Power strike ${intToStringRound(a)} / 1000`);
                view.updateVal("playerClassBarBLabel", `Block ${intToStringRound(b)} / 1000`);
            } else if (cls === "hunter") {
                view.updateVal("playerClassBarALabel", `Multistrike ${intToStringRound(a)} / 1000`);
                const retreatTxt = (data.battle.classRetreatMs || 0) > 0 ? ` (retreat ${round1((data.battle.classRetreatMs || 0) / 1000)}s)` : "";
                view.updateVal("playerClassBarBLabel", `Tactical retreat ${intToStringRound(b)} / 1000${retreatTxt}`);
            } else if (cls === "rogue") {
                const dashTxt = data.battle.rogueDashActive ? " (active)" : "";
                view.updateVal("playerClassBarALabel", `Dash ${intToStringRound(a)} / 1000${dashTxt}`);
                const flurryTxt = (data.battle.rogueFlurryMs || 0) > 0 ? ` (flurry ${round1((data.battle.rogueFlurryMs || 0) / 1000)}s)` : "";
                view.updateVal("playerClassBarBLabel", `Flurry strike ${intToStringRound(b)} / 1000${flurryTxt}`);
            }
        }
    },
    updateTabButtons: function(activeTab) {
        const tabs = events.mainMenuTabOrder();
        for (let i = 0; i < tabs.length; i++) {
            const id = `tabButton_${tabs[i]}`;
            const isActive = tabs[i] === activeTab;
            view.updateVal(id, isActive ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
        }
    },
    updateCompactLayout: function() {
        /** Switch to two-tab layout 20px sooner than the old 1400px breakpoint; optional full opt-out via options. */
        const compactBreakpointPx = 1420;
        const forceWide = !!(data.progress.options && data.progress.options.disableCompactLayout);
        const compactOn = !forceWide && window.innerWidth < compactBreakpointPx;
        const pane = data.progress.compactViewPane || "menus";
        view.updateVal("compactViewTabs", compactOn ? "flex" : "none", "style.display");
        view.updateVal("menuColumn", !compactOn || pane === "menus" ? "" : "none", "style.display");
        view.updateVal("battleColumn", !compactOn || pane === "battle" ? "" : "none", "style.display");
        view.updateVal("compactPane_menus", pane === "menus" ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
        view.updateVal("compactPane_battle", pane === "battle" ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
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
            if (data.battle.state === "running") {
                renderY = (intruder.prevYPx !== undefined) ? (intruder.prevYPx + ((intruder.yPx - intruder.prevYPx) * alpha)) : intruder.yPx;
            } else {
                intruder.prevYPx = intruder.yPx;
            }
            intruderEl.style.width = `${intruder.sizePx}px`;
            intruderEl.style.height = `${intruder.sizePx}px`;
            intruderEl.style.left = `${leftPx}px`;
            intruderEl.style.top = `${renderY}px`;
            const hpPct = Math.max(0, intruder.hp / intruder.maxHp) * 100;
            const shapeLayer = intruderEl.querySelector(".intruder-shape-layer");
            if (shapeLayer) {
                const isForageUnit = intruder.intruderType === "tree" || intruder.intruderType === "bush" || intruder.intruderType === "ore_vein";
                shapeLayer.classList.toggle("intruder-token-lecher", intruder.intruderType === "lecher");
                if (isForageUnit) {
                    const fill = intruder.intruderType === "tree" ? "#6f4e37" : (intruder.intruderType === "bush" ? "#3f7d3f" : "#737373");
                    shapeLayer.style.clipPath = "none";
                    shapeLayer.style.border = "1px solid #2d2d2d";
                    shapeLayer.style.background = fill;
                } else {
                    shapeLayer.style.background = "";
                }
            }
            const hpLayer = intruderEl.querySelector(".intruder-hp-layer");
            if (hpLayer) {
                if (intruder.intruderType === "lecher") {
                    hpLayer.style.background = `linear-gradient(to top, #4da3ff ${hpPct}%, #0d1d3a ${hpPct}%)`;
                } else {
                    hpLayer.style.background = `linear-gradient(to top, #ff2d2d ${hpPct}%, #2a0e0e ${hpPct}%)`;
                }
            }
            const hpLine = intruderEl.querySelector(".intruder-stat-hp");
            const dmgLine = intruderEl.querySelector(".intruder-stat-dmg");
            const atkFill = intruderEl.querySelector(".intruder-stat-atk-fill");
            if (hpLine) {
                const lowHp = (intruder.maxHp || 0) < 100;
                if (lowHp) {
                    const cur = Math.max(0, roundNearestDecimals(intruder.hp, 1));
                    const mxInt = Math.round(Math.max(0, intruder.maxHp || 0));
                    hpLine.textContent = `HP ${cur.toFixed(1)}/${mxInt}`;
                } else {
                    hpLine.textContent = `HP ${Math.round(intruder.hp)}/${intruder.maxHp}`;
                }
            }
            if (dmgLine) {
                dmgLine.textContent = `Dmg ${intruder.attackDamage}`;
            }
            if (atkFill) {
                if ((data.battle.mode || "combat") === "foraging") {
                    atkFill.style.width = "0%";
                    const atkWrap = intruderEl.querySelector(".intruder-stat-atk-wrap");
                    if (atkWrap) atkWrap.style.display = "none";
                } else {
                    const atkWrap = intruderEl.querySelector(".intruder-stat-atk-wrap");
                    if (atkWrap) atkWrap.style.display = "";
                const cd = intruder.intruderType === "lecher" ? (intruder.attackCooldownMs * 2) : intruder.attackCooldownMs;
                const canCharge = intruder.intruderType === "lecher" ? (!!intruder.lecherReady || !!intruder.inRange) : !!intruder.inRange;
                const remain = Math.max(0, Math.min(cd, intruder.attackTimerMs || 0));
                const atkBarPct = canCharge
                    ? (100 - Math.max(0, Math.min(100, (remain / cd) * 100)))
                    : 0;
                atkFill.style.width = `${atkBarPct}%`;
                }
            }
        }
        view.consumeLineFxQueue();
        view.renderRangeMarkers();
        view.updatePlayerBattleBars();

        const activeKeys = Object.keys(viewData.activeIntruderElements);
        for (let i = 0; i < activeKeys.length; i++) {
            const intruderId = parseInt(activeKeys[i], 10);
            if (!activeIds[intruderId]) {
                view.releaseIntruderElement(intruderId);
            }
        }
    },
    renderRangeMarkers: function() {
        const root = viewData.cached.rangeMarkers;
        if (!root) {
            return;
        }
        const bh = viewData.layout.battlefieldHeightPx || gameData.battle.battlefieldHeightPx || 500;
        const playerTop = viewData.layout.playerTopPx || (bh - 65);
        let html = "";
        let dist = 0;
        while ((playerTop - dist) >= 0) {
            html += `<div class="range-marker-line" style="top:${Math.round(playerTop - dist)}px;"><span class="range-marker-label">${dist} ft</span></div>`;
            dist += 100;
        }
        if (viewData.prevValues.rangeMarkersHtml !== html) {
            root.innerHTML = html;
            viewData.prevValues.rangeMarkersHtml = html;
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
        } else {
            intruderEl = document.createElement("div");
            intruderEl.className = "intruder-token";
            const shapeLayer = document.createElement("div");
            shapeLayer.className = "intruder-shape-layer";
            const hpLayer = document.createElement("div");
            hpLayer.className = "intruder-hp-layer";
            const overlay = document.createElement("div");
            overlay.className = "intruder-overlay";
            const hpLine = document.createElement("div");
            hpLine.className = "intruder-stat-hp";
            const dmgLine = document.createElement("div");
            dmgLine.className = "intruder-stat-dmg";
            const atkWrap = document.createElement("div");
            atkWrap.className = "intruder-stat-atk-wrap";
            const atkFill = document.createElement("div");
            atkFill.className = "intruder-stat-atk-fill";
            atkWrap.appendChild(atkFill);
            overlay.appendChild(hpLine);
            overlay.appendChild(dmgLine);
            overlay.appendChild(atkWrap);
            shapeLayer.appendChild(hpLayer);
            intruderEl.appendChild(shapeLayer);
            intruderEl.appendChild(overlay);
        }
        intruderEl.style.display = "block";
        return intruderEl;
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
    updateVal: function(id, newVal, type="textContent", sigFigs) {
        const el = viewData.cached[id];
        if (!el) {
            return;
        }
        if(!viewData.prevValues[id]) {
            viewData.prevValues[id] = {};
        }
        let prevValue = viewData.prevValues[id];

        const typeKey = `lastValue_${type}`;
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
