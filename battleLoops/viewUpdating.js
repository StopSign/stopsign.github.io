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
};


let view = {
    updateViewAtFrame: function() { //This is the main view update function that is run once per frame
        view.renderBattlefield();
        view.updateActiveWeavingButtons();
        view.updateOkamiPanel();
        view.updateOkamiMapVisuals();
        view.updateFoxDenCarriers();

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
        const hasSandal = !!(data.progress.base && data.progress.base.atelier && data.progress.base.atelier.sandalBuilt);
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
        const twEff = skills.getSkillEffect("toughness_condescension");
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
            tierStarClass = "skill-star-coins";
            tierStarFilled = !!starProg.coins;
            tierStarTitle = "Coins cycle";
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
            waveHtml += `<div>${z.name} | Difficulty x${round2(z.difficulty)} | coins ${round2(z.coins)}${expInfo} | ${intToStringRound(z.remainingEnemies)} left${spawnTail}${shardPart}</div>`;
        }
        if (viewData.prevValues.waveInfoHtml !== waveHtml) {
            viewData.cached.waveInfo.innerHTML = waveHtml;
            viewData.prevValues.waveInfoHtml = waveHtml;
        }
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
            view.updateVal("deathTitle", "The clone has dispersed (no mana)");
            const retryTxt = (data.progress.base && data.progress.base.chapel && data.progress.base.chapel.autoRetryEnabled)
                ? ` | Retry in ${Math.max(0, data.progress.autoRetryCountdownSec || 0)}s`
                : "";
            view.updateVal("deathSummary", `Time ${round1(runClock)}s | Level ${data.battle.levelState.level} | Kills ${data.battle.enemiesKilled} | Coins ${intToStringRound(killCoins)}${retryTxt}`);
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
        const hasActiveClassMenu = ["condescension", "scold", "mockery"].indexOf(currentClsMenu) >= 0;
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

        view.updateVal("baseCoinsText", (Math.round((data.progress.coins || 0) * 10) / 10).toFixed(1));

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
        const starPool = data.progress.stars || { bronze: 0, silver: 0, coins: 0 };
        const starLine = `<span class="star-bronze">★</span>: ${starPool.bronze || 0} | <span class="star-silver">★</span>: ${starPool.silver || 0} | <span class="star-coins">★</span>: ${starPool.coins || 0}`;
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
        const conTotal = (lsMult.levelCon || 0) + (lsMult.skillConBonus || 0);
        const strTotal = (lsMult.levelStr || 0) + (lsMult.skillStrBonus || 0);
        const gc = gameData.battle.combat;
        const cdCfg = gameData.battle.cooldowns;
        const fortInner = skills.getSkillEffect("endurance").enduranceBaseHpInnerBonus || 0;
        const tenB = skills.getSkillEffect("tenacity").tenacityHpInnerBonus || 0;
        const tenFlatScaled = Math.ceil((2 * tenB) * (1 + conTotal / gc.conStrStatDivisor));
        const forceFlatStats = roundNearestDecimals(skills.getSkillEffect("force").slapFlatBeforeStr || 0, 2);
        const wisMult = roundNearestDecimals(skills.getSkillEffect("wisdom").wisdomCharacterExpMultiplier || 1, 2);
        const greedMult = roundNearestDecimals(skills.getSkillEffect("greed").greedKillCoinsMultiplier || 1, 2);
        view.updateVal("statsHpText", `${intToStringRound(p.maxHp)} HP`);
        view.updateVal("statsHpTip", `Base inner HP: +${gc.baseHpInner}<br>Endurance: +${fortInner}<br>Tenacity: +${tenB} inner, +${tenFlatScaled} current (2× inner × Con)<br>Con multiplier: +${Math.round(conTotal * (100 / gc.conStrStatDivisor))}%`, "innerHTML");
        view.updateVal("statsRegenText", `${round2(p.regenPerSecond || 0)}/s`);
        view.updateVal("statsRegenTip", "From Recovery skill level (HP/s).", "innerHTML");
        view.updateVal("statsAttackText", `${roundNearestDecimals(p.attackDamage, 1).toFixed(1)} dmg`);
        view.updateVal("statsAttackTip", `Base slap: ${gc.baseSlapDamage}<br>Force (before Str): +${forceFlatStats}<br>Strength multiplier: +${Math.round(strTotal * (100 / gc.conStrStatDivisor))}%`, "innerHTML");
        const twEff = skills.getSkillEffect("toughness_condescension");
        const armorFlat = twEff.toughnessArmorFlat !== undefined ? round2(twEff.toughnessArmorFlat) : 0;
        view.updateVal("statsArmorText", `${round2(armorFlat)} flat`);
        view.updateVal("statsArmorTip", `Condescension Toughness: +${round2(armorFlat)} flat damage reduction`, "innerHTML");
        view.updateVal("statsSlapText", `${round2((p.attackCooldownMs || 0) / 1000)}s`);
        const alaEff = skills.getSkillEffect("alacrity");
        const alaLv = alaEff.alacrityEffectiveLevel || 0;
        view.updateVal("statsSlapTip", `Base: ${round2(cdCfg.slapBaseMs / 1000)}s<br>Alacrity reduction: ${alaLv * cdCfg.alacritySlapReductionPerLevelMs} ms<br>Floor: ${round2(cdCfg.slapFloorMs / 1000)}s`, "innerHTML");
        view.updateVal("statsSandalText", hasSandal ? `${round2((p.sandalAttackCooldownMs || 0) / 1000)}s` : "Locked");
        view.updateVal("statsSandalTip", hasSandal ? `Base: ${round2(cdCfg.sandalBaseMs / 1000)}s<br>Alacrity reduction: ${alaLv * cdCfg.alacritySandalReductionPerLevelMs} ms<br>Floor: ${round2(cdCfg.sandalFloorMs / 1000)}s` : "Requires Spare sandal upgrade", "innerHTML");

        const current = data.progress.currentMapKey;
        const smartHarvestOn = !!(data.progress.base && data.progress.base.garden && data.progress.base.garden.smartHarvestUnlocked);
        const clsMenu = data.progress.currentClassKey || "none";
        const hasClassForTravel = ["condescension", "scold", "mockery"].indexOf(clsMenu) >= 0;
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
            view.updateVal(`mapStar_${map.key}_coins`, stars.coins ? "★" : "☆");
            view.updateVal(`mapStar_${map.key}_bronze`, !!stars.bronze, "classList.toggle", "skill-star-filled");
            view.updateVal(`mapStar_${map.key}_silver`, !!stars.silver, "classList.toggle", "skill-star-filled");
            view.updateVal(`mapStar_${map.key}_coins`, !!stars.coins, "classList.toggle", "skill-star-filled");
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
                    view.updateVal(rowEl, u.rowVisible(hideMx) ? "" : "none", "style.display");
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
            view.updateVal(`base_${siteKey}_assign_okami_btn`, engine.isOkamiWeaving(), "disabled");
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

    /** Mine: workerPower (40 = one unit); map + panel bars or completion rate when workers > 40. */
    updateBasePanelWorkerProgressBars: function(base) {
        const WP_CAP = 40;
        const wpk = resortData.workerPowerSiteKeys || [];
        let si;
        for (si = 0; si < wpk.length; si++) {
            const siteKey = wpk[si];
            const ws = resortData.buildings[siteKey].workers;
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
                view.updateVal(panelTextId, `Kitsune power ${round1(wp)} / ${WP_CAP}`);
            }
        }
        for (si = 0; si < resortData.workerSitePanelOrder.length; si++) {
            const siteKey = resortData.workerSitePanelOrder[si];
            if ((resortData.workerPowerSiteKeys || []).indexOf(siteKey) >= 0) {
                continue;
            }
            const ws = resortData.buildings[siteKey].workers;
            if (ws.panelProgressFillId && ws.panelProgressWrapId) {
                const pct = Math.max(0, Math.min(100, ((base[siteKey].progress || 0)) * 100));
                view.updateVal(ws.panelProgressFillId, `${pct}%`, "style.width");
                const manualSiteUnlocked = (base[siteKey].assignedWorkers || 0) > 0;
                view.updateVal(ws.panelProgressWrapId, manualSiteUnlocked ? 1 : 0, "style.opacity");
            }
        }
    },

    /** Generic: resource strip + global worker counts. */
    updateBaseResourceStrip: function(res) {
        view.updateVal("base_res_stone", res.stone, "textContent", "floor");
        let totalWorkers = engine.getTotalFoundWorkers();
        view.updateVal("baseWorkersAssigned", totalWorkers - engine.getTotalAssignedWorkers(), "textContent", 1);
        view.updateVal("baseWorkersFound", totalWorkers, "textContent", 1);
    },

    updateBasePanelChapel: function(t) {
        const chapelDef = resortData.buildings.chapel;
        t.refreshOrderedPurchasables("chapel", chapelDef.upgradesOrder, { hideMaxed: t.hideMaxed });
    },

    updateBasePanelFoxDen: function(base, t) {
        const foxDen = base.foxDen;
        const unlocks = foxDen.unlocks;
        view.updateVal("foxDenInfoWood", (base.bambooForest && base.bambooForest.wood) || 0, "textContent", "floor");
        this.updateResortWorkerControls("foxDen", (foxDen.assignedWorkers || 0) > 0 || engine.getOkami().assignedBuildingKey === "foxDen");
        for (let i = 0; i < resortData.foxDenUnlockOrder.length; i++) {
            const uk = resortData.foxDenUnlockOrder[i];
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
                view.updateVal(btnId, resortData.planToBuildFromCost(slot.getCost));
                view.updateVal(btnId, false, "disabled");
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
        const unlocked = data.progress.unlockedClasses || {};
        const currentClass = data.progress.currentClassKey || "none";
        const pendingClass = data.progress.pendingClassKey || "";
        const classSwitchCooldownMs = Math.max(0, data.progress.classSwitchCooldownMs || 0);
        const classSwitchCooldownTxt = classSwitchCooldownMs > 0 ? ` | Class switch cooldown: ${Math.ceil(classSwitchCooldownMs / 1000)}s` : "";
        const bonfireTxt = pendingClass
            ? `Current class: ${initialize.getClassDef(currentClass).name} | Pending switch: ${initialize.getClassDef(pendingClass).name} (applies on Try Again)${classSwitchCooldownTxt}`
            : `Current class: ${initialize.getClassDef(currentClass).name}${classSwitchCooldownTxt}`;
        view.updateVal("base_bonfire_current", bonfireTxt);
        for (let ci = 0; ci < resortData.bonfireClasses.length; ci++) {
            const ck = resortData.bonfireClasses[ci];
            const isUnlocked = !!unlocked[ck];
            const buyId = resortData.bonfireBuyBtn(ck);
            const switchId = resortData.bonfireSwitchBtn(ck);
            const gUp = resortData.buildings.bonfire.upgrades[ck];
            view.updateVal(buyId, isUnlocked ? "Bought" : resortData.buyForFromCost(() => resortData.resolveCost(gUp)));
            view.updateVal(buyId, isUnlocked, "disabled");
            view.updateVal(`base_bonfire_extra_${ck}`, "");
            const isCurrent = currentClass === ck;
            const isPending = pendingClass === ck;
            view.updateVal(switchId, isPending ? "Switching..." : (isCurrent ? "Current" : "Switch"));
            view.updateVal(switchId, !isUnlocked || isCurrent || isPending || classSwitchCooldownMs > 0, "disabled");
        }
    },

    updateBasePanelInn: function(base, t) {
        const inn = base.inn;
        t.refreshOrderedPurchasables("inn", resortData.buildings.inn.upgradesOrder, { hideMaxed: t.hideMaxed });
        engine.syncInnRoomCounts();
        view.updateVal("innRoomsAvailable", inn.roomsAvailable || 0);
        view.updateVal("innRoomsOccupied", inn.roomsOccupied || 0);
        view.updateVal("innRestfulnessPerSecond", engine.getInnRestfulnessPerSecond());
        view.updateVal("innRestDurationText", engine.getInnRestDurationSeconds());
    },

    updateBasePanelScrollArchives: function(base, t) {
        let libTab = data.progress.selectedScrollArchivesTab || "combat";
        const currentCls = data.progress.currentClassKey || "none";
        const hasActiveClass = ["condescension", "scold", "mockery"].indexOf(currentCls) >= 0;
        if (libTab === "class" && !hasActiveClass) {
            libTab = "combat";
            data.progress.selectedScrollArchivesTab = "combat";
        }
        if (libTab === "foraging" && !events.foragingSkillsUnlocked()) {
            libTab = "combat";
            data.progress.selectedScrollArchivesTab = "combat";
        }
        const lib = base.scrollArchives || {};
        const libWorkers = lib.assignedWorkers || 0;
        const libDesks = lib.gearSets || 0;
        view.updateVal("base_scrollArchives_workers_label", `Researchers: ${libWorkers}/${libDesks} desks · Queue top-down by priority`);
        t.refreshOrderedPurchasables("scrollArchives", resortData.buildings.scrollArchives.upgradesOrder, {});
        const canLibAssign = libWorkers < libDesks && engine.getAvailableWorkers() > 0;
        const canLibUnassign = libWorkers > 0;
        t.syncWorkerAdjustButtonsDisabled("scrollArchives", canLibAssign, canLibUnassign);
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
        view.updateVal("baseScrollArchivesProgressFill", `${libPct}%`, "style.width");
        view.updateVal("baseScrollArchivesProgressWrap", activeResearch ? 1 : 0, "style.opacity");
        let shownScrollArchivesRows = 0;
        for (let i = 0; i < skills.keysInOrder.length; i++) {
            const k = skills.keysInOrder[i];
            const sk = data.progress.skills[k];
            const unlockG = skills.getSkillUnlockCostCoins(k);
            const researchReq = skills.getSkillresearchRequired(k);
            const cat = (sk && sk.category) || "combat";
            if (cat !== libTab) {
                view.updateVal(`base_scrollArchives_row_${k}`, "none", "style.display");
                continue;
            }
            const dSk = skills._byKey[k];
            if (dSk && dSk.classKey && (!hasActiveClass || dSk.classKey !== currentCls)) {
                view.updateVal(`base_scrollArchives_row_${k}`, "none", "style.display");
                continue;
            }
            const innUnlocked = !!(base.foxDen && base.foxDen.unlocks && base.foxDen.unlocks.inn);
            if (k === "gossip" && !innUnlocked) {
                view.updateVal(`base_scrollArchives_row_${k}`, "none", "style.display");
                continue;
            }
            const unlocked = !!(lib.unlockedSkills && lib.unlockedSkills[k]);
            const rs = lib.skillResearch && lib.skillResearch[k] ? lib.skillResearch[k] : null;
            const purchased = !!(rs && rs.purchased);
            const researched = !!(rs && rs.researched) || unlocked;
            const showRow = !researched;
            if (showRow) {
                shownScrollArchivesRows++;
            }
            view.updateVal(`base_scrollArchives_row_${k}`, showRow ? "" : "none", "style.display");
            const buyCoins = unlockG;
            const reqResearch = researchReq;
            if (!purchased) {
                view.updateVal(`base_scrollArchives_btn_${k}`, "", "style.display");
                view.updateVal(`base_scrollArchives_btn_${k}`, t.buyFor([`${intToStringRound(buyCoins)} coins`]));
                view.updateVal(`base_scrollArchives_btn_${k}`, false, "disabled");
                view.updateVal(`base_scrollArchives_progress_${k}`, `Research required: ${intToStringRound(reqResearch)}`);
                view.updateVal(`base_scrollArchives_pause_${k}`, "none", "style.display");
            } else {
                const p = rs.progress || 0;
                const r = rs.required || reqResearch;
                const paused = !!rs.paused;
                view.updateVal(`base_scrollArchives_btn_${k}`, "none", "style.display");
                view.updateVal(`base_scrollArchives_progress_${k}`, `${paused ? "[Paused] " : ""}${intToStringRound(p)} / ${intToStringRound(r)} research`);
                view.updateVal(`base_scrollArchives_pause_${k}`, paused ? "Resume" : "Pause");
                view.updateVal(`base_scrollArchives_pause_${k}`, "", "style.display");
            }
        }
        view.updateVal("base_scrollArchives_empty", shownScrollArchivesRows ? "none" : "", "style.display");
        const libLbl = { combat: "Combat", resort: "Resort", foraging: "Foraging", class: "Class" };
        const slt = ["combat", "resort", "foraging", "class"];
        for (let li = 0; li < slt.length; li++) {
            const st = slt[li];
            const btnId = "scrollArchivesTab_" + st;
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
        view.updateVal(`base_${siteKey}_assign_okami_btn`, engine.isOkamiWeaving(), "disabled");
        let required = 30;
        if (siteKey === "torii") {
            required = slot.karmaCheckPowerRequired || 30;
        } else if (siteKey === "laundry") {
            required = slot.cleanPowerRequired || 30;
        } else if (siteKey === "bambooForest") {
            required = resortData.bambooForestConfig.cutPowerRequired;
        } else if (siteKey === "foxDen") {
            required = 0;
        }
        if (siteKey === "foxDen") {
            view.updateVal(`base_${siteKey}_worker_prod_wrap`, "none", "style.display");
            const okamiFox = engine.getOkami();
            const okamiHereFox = okamiFox.assignedBuildingKey === "foxDen";
            const carrierCount = assigned + (okamiHereFox ? 1 : 0);
            const workerSpeedFox = engine.getFoxDenCarrierSpeed({ isOkami: false });
            const okamiSpeedFox = engine.getFoxDenCarrierSpeed({ isOkami: true });
            const foxProdText = `Carriers assigned: ${carrierCount} | Carrier speed: ${round1(workerSpeedFox)} | Okami speed: ${round1(okamiSpeedFox)}`;
            view.updateVal(`base_${siteKey}_worker_prod_text`, foxProdText);
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
        const spiritGrids = ["spiritSlots_earth", "spiritSlots_water", "spiritSlots_fire"];
        for (let gi = 0; gi < spiritGrids.length; gi++) {
            const grid = document.getElementById(spiritGrids[gi]);
            if (grid) {
                grid.style.display = slotsRevealed ? "" : "none";
            }
        }
        const mineEarthGrid = document.getElementById("spiritSlots_mine_earth");
        if (mineEarthGrid) {
            mineEarthGrid.style.display = mineRevealed ? "" : "none";
        }
    },
    updateFoxDenConstructionMap: function() {
        const rh = engine.ensureFoxDenConstruction();
        const unlocks = rh.unlocks || {};
        const order = resortData.foxDenUnlockOrder || [];
        const mapProgressKeys = {
            torii: "mapToriiProgressWrap",
            laundry: "mapLaundryProgressWrap"
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
        const rh = engine.ensureFoxDenConstruction();
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
    updateOkamiPanel: function() {
        const okami = engine.getOkami();
        const tails = engine.getOkamiTails();
        const expNeed = engine.getOkamiExpToLevel();
        const expPct = expNeed > 0 ? Math.max(0, Math.min(100, ((okami.exp || 0) / expNeed) * 100)) : 0;
        view.updateVal("okamiTailLabel", `${engine.getOkamiTailLabel(tails)} Tail`);
        view.updateVal("okamiLevelText", okami.level || 0, "textContent", "floor");
        view.updateVal("okamiExpText", `${round2(okami.exp || 0)} / ${round2(expNeed)}`);
        view.updateVal("okamiExpFill", `${expPct}%`, "style.width");
        view.updateVal("okamiSpiritStrands", engine.getOkamiSpiritStrands());
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
        const mana = engine.ensureManaState();
        const cap = engine.getManaCapacity();
        const amount = Math.floor(mana.amount || 0);
        const rate = engine.getSpiritManaRatePerSecond();
        const pct = cap > 0 ? Math.max(0, Math.min(100, (amount / cap) * 100)) : 0;
        view.updateVal("manaFill", `${pct}%`, "style.width");
        view.updateVal("manaAmount", amount, "textContent", "floor");
        view.updateVal("manaCap", cap, "textContent", "floor");
        view.updateVal("manaRate", rate, "textContent", "floor");
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
    },
    updateBambooForestInfo: function() {
        const bf = engine.ensureBambooForestState();
        if (!bf) {
            return;
        }
        view.updateVal("bambooForestInfoChips", bf.chips || 0, "textContent", "floor");
        view.updateVal("bambooForestInfoWood", bf.wood || 0, "textContent", "floor");
        view.updateVal("bambooChopPower", engine.getBambooChopPower());
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
            view.updateVal(`bambooBaseWood_${si}`, engine.getBambooStalkDisplayBaseWood(si));
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
        const slotKinds = ["earth", "water", "fire"];
        const springSlotMax = engine.getHiddenSpringSpiritSlotMax();
        for (let ki = 0; ki < slotKinds.length; ki++) {
            const kind = slotKinds[ki];
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
        for (let psi = 0; psi < 4; psi++) {
            const slotId = `spiritSlot_bambooForest_plant_${psi}`;
            const pSpirit = engine.getSpiritAtLocation("bambooForest", psi, "plant");
            view.updateSpiritSlotAppearance(slotId, pSpirit, selectedSpiritId);
        }
        const pebbles = base.pebbles || [];
        for (let pi = 0; pi < 12; pi++) {
            const pebble = pebbles[pi];
            const pid = `pebbleToken_${pi}`;
            view.updateVal(pid, pebble ? "" : "none", "style.display");
            if (pebble && engine.getResortPathPosition) {
                const pos = engine.getResortPathPosition(pebble.pathProgress || 0);
                view.updateVal(pid, `${Math.round(pos.x - 4)}px`, "style.left");
                view.updateVal(pid, `${Math.round(pos.y - 4)}px`, "style.top");
                view.updateVal(pid, engine.earthSpiritColors[pebble.colorIndex || 0], "style.backgroundColor");
                view.updateVal(pid, engine.earthSpiritColors[pebble.colorIndex || 0], "style.borderColor");
            }
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
            const nextSnap = `A ${guestType} stayed at Room ${entry.room} and left after ${entry.staySeconds} seconds, giving ${entry.starBeads} star beads for resting well.`;
            if (rowRef.snap !== nextSnap) {
                if (rowRef.text) {
                    rowRef.text.textContent = nextSnap;
                }
                rowRef.snap = nextSnap;
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
                state: guest.state || "",
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
        view.updateVal("spiritInfoExp", round2(spirit.exp || 0));
        view.updateVal("spiritInfoExpReq", round2(spirit.expToLevel || 15));
        view.updateVal("spiritInfoEarthExtras", kind === "earth" ? "" : "none", "style.display");
        view.updateVal("spiritInfoWaterExtras", kind === "water" ? "" : "none", "style.display");
        view.updateVal("spiritInfoFireExtras", kind === "fire" ? "" : "none", "style.display");
        view.updateVal("spiritInfoPlantExtras", kind === "plant" ? "" : "none", "style.display");
        view.updateVal("spiritInfoTaskWrap", (kind === "fire" || kind === "plant") ? "none" : "", "style.display");
        if (kind === "earth") {
            view.updateVal("spiritInfoPebbles", engine.countPebblesForSpirit(spirit.id));
            if ((spirit.location || "hiddenSpring") === "hiddenSpring") {
                const active = engine.countPebblesForSpirit(spirit.id);
                const mineStone = data.progress.base.mine.resources ? (data.progress.base.mine.resources.stone || 0) : 0;
                const canCreate = active < 2 && mineStone >= (spirit.spiritPower || 1);
                view.updateVal("spiritInfoTaskText", canCreate ? "creating pebble" : (active >= 2 ? "pebbles active" : "waiting for stone"));
                const pct = canCreate ? Math.max(0, Math.min(100, (1 - ((spirit.pebbleCooldownMs || 0) / 5000)) * 100)) : 0;
                view.updateVal("spiritInfoTaskFill", `${pct}%`, "style.width");
            } else if (spirit.location === "mine") {
                view.updateVal("spiritInfoTaskText", engine.isMineCleared() ? "playing in the dirt" : "Mining...");
                view.updateVal("spiritInfoTaskFill", engine.isMineCleared() ? `${Math.max(0, Math.min(100, ((data.progress.base.mine.playTimerMs || 0) / 5000) * 100))}%` : "100%", "style.width");
            }
        } else if (kind === "water") {
            const droplet = engine.getDropletForSpirit(spirit.id);
            if (droplet) {
                view.updateVal("spiritInfoWaterVolume", round2(droplet.waterVolume || 0));
                view.updateVal("spiritInfoHeat", `${round1(droplet.heat || 0)}C`);
                view.updateVal("spiritInfoEssence", round2(droplet.essence || 0));
                view.updateVal("spiritInfoInfusion", round2(droplet.infusion || 0));
                view.updateVal("spiritInfoTaskText", "droplet active");
                view.updateVal("spiritInfoTaskFill", "100%", "style.width");
            } else {
                view.updateVal("spiritInfoWaterVolume", "—");
                view.updateVal("spiritInfoHeat", "—");
                view.updateVal("spiritInfoEssence", "—");
                view.updateVal("spiritInfoInfusion", "—");
                view.updateVal("spiritInfoTaskText", "forming droplet");
                const pct = Math.max(0, Math.min(100, (1 - ((spirit.dropletCooldownMs || 0) / 5000)) * 100));
                view.updateVal("spiritInfoTaskFill", `${pct}%`, "style.width");
            }
        } else if (kind === "fire") {
            view.updateVal("spiritInfoFireNote", "This spirit has no duties yet.");
        } else if (kind === "plant") {
            const col = (spirit.location === "bambooForest") ? ((spirit.slot || 0) + 1) : "—";
            view.updateVal("spiritInfoPlantColumn", col);
        }
    },
    updateMineInfo: function() {
        const mine = engine.ensureMineState();
        if (!mine) {
            return;
        }
        const depth = mine.currentDepth || 0;
        const clears = (mine.clearsByDepth && mine.clearsByDepth[depth]) || 0;
        view.updateVal("mineDepthText", depth);
        view.updateVal("mineDepthClears", clears);
        view.updateVal("mineDepthLeftBtn", depth > 0 ? "" : "none", "style.display");
        view.updateVal("mineDepthRightBtn", clears >= 10 ? "" : "none", "style.display");
        const cleared = engine.isMineCleared();
        view.updateVal("mineStatusText", cleared ? "playing in the dirt" : "Mining...");
        view.updateVal("mineDirtText", round2(mine.resources.dirt || 0));
        view.updateVal("mineStoneText", round2(mine.resources.stone || 0));
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
            const pct = block.maxHp > 0 ? Math.max(0, Math.min(100, ((block.hp || 0) / block.maxHp) * 100)) : 0;
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
            const t = view._basePanelPurchasingTools(base, null, false);
            const hsOpts = Object.assign({}, t.soldOutUpgradeRowOpts(false, "hiddenSpring"), {
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
            const tTorii = view._basePanelPurchasingTools(base, null, false);
            const toriiUpgOpts = Object.assign({}, tTorii.soldOutUpgradeRowOpts(false, "torii"), {
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
            const tInn = view._basePanelPurchasingTools(base, null, false);
            view.updateVal("innRoomsAvailable", inn.roomsAvailable || 0);
            view.updateVal("innRoomsOccupied", inn.roomsOccupied || 0);
            view.updateVal("innRestfulnessPerSecond", engine.getInnRestfulnessPerSecond());
            view.updateVal("innRestDurationText", engine.getInnRestDurationSeconds());
            tInn.refreshOrderedPurchasables("inn", resortData.buildings.inn.upgradesOrder, {});
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
        } else if (selected === "bonfire") {
            this.updateBasePanelBonfire();
        } else if (selected === "scrollArchives") {
            const t = view._basePanelPurchasingTools(base, null, false);
            this.updateBasePanelScrollArchives(base, t);
        } else if (selected === "cistern") {
            const cistern = base.cistern || {};
            view.updateVal("cisternInfoWater", round2(cistern.waterVolume || 0));
            view.updateVal("cisternInfoEssence", round2(cistern.essence || 0));
        } else if (selected === "mine") {
            this.updateMineInfo();
        }

        const torii = base.torii || {};
        const inn = base.inn || {};
        const innCap = engine.getTatamiInnRoomCapacity ? engine.getTatamiInnRoomCapacity() : 2;
        view.updateVal("stonePileMapValue", base.stonePile.stone || 0, "textContent", "floor");
        view.updateVal("bambooForestMapDisplay", (base.bambooForest && base.bambooForest.wood) || 0, "textContent", "floor");
        view.updateVal("toriiMapDisplay", `${torii.visitorsWaiting || 0}/${torii.maxVisitors || 2}`);
        view.updateVal("innMapDisplay", `${inn.roomsOccupied || 0}/${innCap}`);
        this.refreshBaseBuildingNotifications();
        this.updateResortMapProgressBars();
        this.updateResortMapTokens();
        this.updatePathSegmentHighlight();
        this.updateFoxDenConstructionMap();
        this.updateFoxDenCarriers();
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
        const rh = engine.ensureFoxDenConstruction();
        for (let i = 0; i < resortData.foxDenUnlockOrder.length; i++) {
            const uk = resortData.foxDenUnlockOrder[i];
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
        const nb = (data.progress.baseContentNotify && data.progress.baseContentNotify.building) || {};
        const rh = data.progress.base && data.progress.base.foxDen;
        const unlocks = rh && rh.unlocks ? rh.unlocks : {};
        const applyNotifyLabel = function(btnKey, need) {
            const btnId = "baseBuilding_" + btnKey;
            if (!viewData.cached[btnId]) {
                return;
            }
            const labelId = "baseBuildingNotifyLabel_" + btnKey;
            if (viewData.cached[labelId]) {
                const baseLabel = resortData.getScopeDisplayName(btnKey);
                view.updateVal(labelId, baseLabel + (need ? " (!)" : ""), "textContent");
            }
            view.updateVal(btnId, !!need, "classList.toggle", "base-building-label--notify");
        };
        const buildingVisible = function(key) {
            if (key === "chapel" || key === "foxDen") {
                return true;
            }
            return !!(unlocks && unlocks[key]);
        };
        for (let bi = 0; bi < resortData.baseBuildingOrder.length; bi++) {
            const k = resortData.baseBuildingOrder[bi];
            let showNotify = false;
            if (k === "hiddenSpring" || k === "stonePile" || k === "bambooForest" || k === "foxDen") {
                showNotify = true;
            } else if (buildingVisible(k)) {
                showNotify = true;
            }
            if (!showNotify) {
                continue;
            }
            let need = !!nb[k];
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
        const hasActiveClass = ["condescension", "scold", "mockery"].indexOf(currentCls) >= 0;
        let msg = "";
        if (tab === "class") {
            msg = hasActiveClass ? "Buy class skills in the ScrollArchives." : "Choose a class at the Bonfire to see class skills here.";
        } else if (tab === "foraging") {
            msg = "No foraging skills unlocked yet. Visit the ScrollArchives in Base.";
        } else {
            const label = tab === "resort" ? "resort" : "combat";
            msg = `No ${label} skills unlocked yet. Visit the ScrollArchives in Base.`;
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
            view.updateVal(`skill_${skillKey}_star_coins`, stars.coins ? "★" : "☆");
            view.updateVal(`skill_${skillKey}_star_bronze`, !!stars.bronze, "classList.toggle", "skill-star-filled");
            view.updateVal(`skill_${skillKey}_star_silver`, !!stars.silver, "classList.toggle", "skill-star-filled");
            view.updateVal(`skill_${skillKey}_star_coins`, !!stars.coins, "classList.toggle", "skill-star-filled");
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
        const innUnlockedFromFoxDen = !!(data.progress.base && data.progress.base.foxDen && data.progress.base.foxDen.unlocks && data.progress.base.foxDen.unlocks.inn);
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
        if (innUnlockedFromFoxDen) {
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
        view.updateVal("skillInfo_tips_row", innUnlockedFromFoxDen ? "" : "none", "style.display");
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
        view.updateVal("skillSubTab_resort", tab === "resort" ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
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
            const atkName = (cls === "condescension" && (data.battle.classPowerA || 0) >= 1000) ? "Power slap" : "Slap";
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
            if (cls === "condescension") {
                view.updateVal("playerClassBarALabel", `Power strike ${intToStringRound(a)} / 1000`);
                view.updateVal("playerClassBarBLabel", `Block ${intToStringRound(b)} / 1000`);
            } else if (cls === "mockery") {
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
        for (let i = 0; i < allTabs.length; i++) {
            const tabKey = allTabs[i];
            const id = `tabButton_${tabKey}`;
            const isVisible = tabs.indexOf(tabKey) >= 0;
            const isActive = tabKey === activeTab;
            view.updateVal(id, isVisible ? "" : "none", "style.display");
            view.updateVal(id, isActive ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
        }
    },
    repositionBaseBuildingInfo: function() {
        const panel = viewData.cached.baseBuildingInfo;
        const menuContent = viewData.cached.menuContent;
        const battleCol = viewData.cached.battleColumn;
        if (!panel) {
            return;
        }
        const compactBreakpointPx = 1420;
        const forceWide = !!(data.progress.options && data.progress.options.disableCompactLayout);
        const compactOn = !forceWide && window.innerWidth < compactBreakpointPx;
        const targetParent = compactOn ? menuContent : battleCol;
        if (targetParent && panel.parentElement !== targetParent) {
            targetParent.appendChild(panel);
        }
        panel.classList.toggle("base-info-on-menu", compactOn);
        panel.classList.toggle("base-info-on-battle", !compactOn);
    },
    updateWorkerDockVisibility: function() {
        const dock = viewData.cached.baseBuildingInfoWorkerDock;
        const selected = data.progress && data.progress.selectedBaseBuilding;
        const keys = resortData.workerDockSiteKeys || [];
        let anyVisible = false;
        for (let i = 0; i < keys.length; i++) {
            const sk = keys[i];
            const show = selected === sk;
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
        if (!compactOn) {
            view.updateVal("battlefieldWrap", selected ? "none" : "", "style.display");
            view.updateVal("battleHud", selected ? "none" : "", "style.display");
        }
    },
    updateCompactLayout: function() {
        const selected = !!(data.progress && data.progress.selectedBaseBuilding);
        if (!(data.progress && data.progress.battleUnlocked)) {
            const compactBreakpointPx = 1420;
            const forceWide = !!(data.progress.options && data.progress.options.disableCompactLayout);
            const compactOn = !forceWide && window.innerWidth < compactBreakpointPx;
            view.updateVal("compactViewTabs", "none", "style.display");
            view.updateVal("menuColumn", "", "style.display");
            if (compactOn && selected) {
                view.updateVal("battleColumn", "none", "style.display");
            } else {
                view.updateVal("battleColumn", selected ? "" : "none", "style.display");
            }
            view.updateBaseBuildingInfoLayout();
            return;
        }
        view.updateBaseBuildingInfoLayout();
        /** Switch to two-tab layout 20px sooner than the old 1400px breakpoint; optional full opt-out via options. */
        const compactBreakpointPx = 1420;
        const forceWide = !!(data.progress.options && data.progress.options.disableCompactLayout);
        const compactOn = !forceWide && window.innerWidth < compactBreakpointPx;
        const pane = data.progress.compactViewPane || "menus";
        view.updateVal("compactViewTabs", compactOn ? "flex" : "none", "style.display");
        if (compactOn && selected) {
            view.updateVal("menuColumn", "", "style.display");
            view.updateVal("battleColumn", "none", "style.display");
        } else {
            view.updateVal("menuColumn", !compactOn || pane === "menus" ? "" : "none", "style.display");
            view.updateVal("battleColumn", !compactOn || pane === "battle" ? "" : "none", "style.display");
        }
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
            const hpPct = Math.max(0, intruder.hp / intruder.maxHp) * 100;
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
            const hpLayer = intruderEl.querySelector(".intruder-hp-layer");
            if (hpLayer) {
                const hpBg = intruder.intruderType === "lecher"
                    ? `linear-gradient(to top, #4da3ff ${hpPct}%, #0d1d3a ${hpPct}%)`
                    : `linear-gradient(to top, #ff2d2d ${hpPct}%, #2a0e0e ${hpPct}%)`;
                if (renderCache.hpBg !== hpBg) {
                    hpLayer.style.background = hpBg;
                    renderCache.hpBg = hpBg;
                }
            }
            const hpLine = intruderEl.querySelector(".intruder-stat-hp");
            const dmgLine = intruderEl.querySelector(".intruder-stat-dmg");
            const atkFill = intruderEl.querySelector(".intruder-stat-atk-fill");
            if (hpLine) {
                const lowHp = (intruder.maxHp || 0) < 100;
                let hpText;
                if (lowHp) {
                    const cur = Math.max(0, roundNearestDecimals(intruder.hp, 1));
                    const mxInt = Math.round(Math.max(0, intruder.maxHp || 0));
                    hpText = `HP ${cur.toFixed(1)}/${mxInt}`;
                } else {
                    hpText = `HP ${Math.round(intruder.hp)}/${intruder.maxHp}`;
                }
                if (renderCache.hpText !== hpText) {
                    hpLine.textContent = hpText;
                    renderCache.hpText = hpText;
                }
            }
            if (dmgLine) {
                const dmgText = `Dmg ${intruder.attackDamage}`;
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
        view.updatePlayerBattleBars();

        const activeKeys = Object.keys(viewData.activeIntruderElements);
        for (let i = 0; i < activeKeys.length; i++) {
            const intruderId = parseInt(activeKeys[i], 10);
            if (!activeIds[intruderId]) {
                view.releaseIntruderElement(intruderId);
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
