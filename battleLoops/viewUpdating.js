let viewData = {
    cached: {}, //contains the elements that are being iterated over and updated regularly,
    prevValues: {},
    scheduled: [],
    layout: {
        battlefieldHeightPx: 718,
        battlefieldWidthPx: 688,
        playerTopPx: 536
    },
    enemyElementPool: [],
    activeEnemyElements: {},
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
        if (!data.battle || !viewData.cached.playerHpText) {
            return;
        }
        const rd = data.battle.player.rangedAttackDamage !== undefined ? data.battle.player.rangedAttackDamage : Math.floor(data.battle.player.attackDamage * 1.5);
        const hasBow = !!(data.progress.base && data.progress.base.workshop && data.progress.base.workshop.bowBuilt);
        const recLv = (skills.isSkillUnlocked("recovery") && data.progress.skills.recovery) ? data.progress.skills.recovery.level : 0;
        const regenStr = recLv > 0 ? ` | Regen ${(recLv * 0.25).toFixed(2)}/s` : "";
        view.updateVal("playerHpText", `${intToString(data.battle.player.hp, 3)} / ${intToString(data.battle.player.maxHp, 3)} | Melee ${intToString(data.battle.player.attackDamage, 3)}${hasBow ? ` | Ranged ${intToString(rd, 3)}` : ""}${regenStr}`);
        const hpPct = Math.max(0, Math.min(100, (data.battle.player.hp / data.battle.player.maxHp) * 100));
        view.updateVal("playerToken", `linear-gradient(to top, #2ad15f ${hpPct}%, #0f3a1d ${hpPct}%)`, "style.background");
        const runClock = (data.battle.elapsedMs || 0) / 1000;
        let waveHtml = `<div>Time ${round1(runClock)}s</div>`;
        if ((data.battle.transitionCountdownMs || 0) > 0) {
            const sec = Math.ceil(data.battle.transitionCountdownMs / 1000);
            waveHtml += `<div>${data.battle.transitionMessage} (${sec}s)</div>`;
        }
        const zones = data.battle.activeZones || [];
        for (let i = 0; i < zones.length; i++) {
            const z = zones[i];
            const rm = z.remainingSpawnMs !== undefined ? z.remainingSpawnMs : 0;
            const spawnTail = rm > 25 ? ` | ${round1(rm / 1000)}s to spawn last` : "";
            waveHtml += `<div>${z.name} | Difficulty x${round2(z.difficulty)} | gold ${round2(z.gold)} | exp ${round2(z.exp)} | ${intToStringRound(z.remainingEnemies)} left${spawnTail}</div>`;
        }
        if (viewData.prevValues.waveInfoHtml !== waveHtml) {
            viewData.cached.waveInfo.innerHTML = waveHtml;
            viewData.prevValues.waveInfoHtml = waveHtml;
        }
        const showOverlay = (data.battle.state === "dead" || data.battle.state === "completed") ? "flex" : "none";
        view.updateVal("deathOverlay", showOverlay, "style.display");
        const runGold = Math.max(0, data.progress.gold - data.battle.runStartGold - (data.battle.completionBonusGold || 0));
        const talentEl = viewData.cached.deathTalentDetails;
        if (data.battle.state === "completed") {
            view.updateVal("deathTitle", "Map completed!");
            view.updateVal("deathSummary", `Bonus gold: ${intToStringRound(data.battle.completionBonusGold || 0)} | Time ${round1(runClock)}s | Level ${data.battle.levelState.level} | Kills ${data.battle.enemiesKilled} | Gold ${intToStringRound(runGold)}`);
            if (talentEl) {
                talentEl.innerHTML = "";
            }
        } else if (data.battle.state === "dead") {
            view.updateVal("deathTitle", "You Died");
            const retryTxt = (data.progress.base && data.progress.base.chapel && data.progress.base.chapel.autoRetryEnabled)
                ? ` | Retry in ${Math.max(0, data.progress.autoRetryCountdownSec || 0)}s`
                : "";
            view.updateVal("deathSummary", `Time ${round1(runClock)}s | Level ${data.battle.levelState.level} | Kills ${data.battle.enemiesKilled} | Gold ${intToStringRound(runGold)}${retryTxt}`);
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
        if (!start || !skills) {
            return "";
        }
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
        const activeTab = data.battle.currentTab || "leveling";
        view.updateTabButtons(activeTab);
        view.updateBasePanel();
        view.updateSkillSubTabs();
        const hideMaxedToggle = viewData.cached.hideMaxedUpgradesToggle;
        if (hideMaxedToggle) {
            const wantHide = !!(data.progress.options && data.progress.options.hideMaxedUpgrades);
            if (hideMaxedToggle.checked !== wantHide) {
                hideMaxedToggle.checked = wantHide;
            }
        }
        const disableCompactToggle = viewData.cached.disableCompactLayoutToggle;
        if (disableCompactToggle) {
            const wantOff = !!(data.progress.options && data.progress.options.disableCompactLayout);
            if (disableCompactToggle.checked !== wantOff) {
                disableCompactToggle.checked = wantOff;
            }
        }

        view.updateVal("baseGoldText", intToStringRound(data.progress.gold));

        const ls = data.battle.levelState;
        const classDef = initialize.getCurrentClassDef();
        view.updateVal("currentClassText", classDef.name);
        view.updateVal("classPerLevelText", initialize.getClassPerLevelText(classDef.key));
        view.updateVal("levelText", ls.level, "textContent", 1);
        view.updateVal("levelExpText", `${intToString(ls.exp, 3)} / ${intToString(ls.expToLevel, 3)}`);
        const levelPct = ls.expToLevel > 0 ? Math.max(0, Math.min(100, (ls.exp / ls.expToLevel) * 100)) : 0;
        view.updateVal("levelTabExpFill", `${levelPct}%`, "style.width");
        view.updateVal("attributePointsText", ls.unassignedPoints, "textContent", 1);
        view.updateVal("strText", ls.levelStr + ls.skillStrBonus, "textContent", 1);
        view.updateVal("conText", ls.levelCon + ls.skillConBonus, "textContent", 1);
        view.updateVal("spdText", ls.levelSpd || 0, "textContent", 1);
        view.updateVal("soulText", ls.levelSoul || 0, "textContent", 1);
        view.renderAttributePlanList();

        const skillKeys = skills.getSkillKeysByCategory(data.progress.skills, data.progress.selectedSkillsTab || "combat");
        for (let i = 0; i < skillKeys.length; i++) {
            view.updateSkillCard(skillKeys[i]);
        }
        const boughtClasses = data.progress.unlockedClasses || {};
        const hasBoughtClass = !!(boughtClasses.warrior || boughtClasses.rogue || boughtClasses.hunter);
        const selectedSkillTab = data.progress.selectedSkillsTab || "combat";
        if (selectedSkillTab === "class" && !hasBoughtClass) {
            data.progress.selectedSkillsTab = "combat";
        }
        view.updateVal("skillSubTab_class", hasBoughtClass ? "" : "none", "style.display");
        const isCombatSkillsTab = (data.progress.selectedSkillsTab || "combat") === "combat";
        const starPool = data.progress.stars || { bronze: 0, silver: 0, gold: 0 };
        const starLine = `<span class="star-bronze">★</span>: ${starPool.bronze || 0} | <span class="star-silver">★</span>: ${starPool.silver || 0} | <span class="star-gold">★</span>: ${starPool.gold || 0}`;
        view.updateVal("combatStarsInventory", isCombatSkillsTab ? "" : "none", "style.display");
        if (isCombatSkillsTab) {
            view.updateVal("combatStarsInventory", starLine, "innerHTML");
        }

        const hasBow = !!(data.progress.base && data.progress.base.workshop && data.progress.base.workshop.bowBuilt);
        const classRangedLocked = (data.progress.currentClassKey || "none") === "rogue";
        const rangedToggle = viewData.cached.rangedAttackToggle;
        if (rangedToggle) {
            const want = !!(data.progress.rangedAttackEnabled && hasBow && !classRangedLocked);
            if (rangedToggle.checked !== want) {
                rangedToggle.checked = want;
            }
            rangedToggle.disabled = classRangedLocked;
        }
        view.updateVal("rangedAttackLockText", classRangedLocked ? "Rogue cannot use ranged attacks." : "");
        view.updateVal("rangedAttackWrap", hasBow ? "" : "none", "style.display");
        const p = data.battle.player;
        const lsMult = data.battle.levelState || {};
        const forgeAtk = data.progress.base && data.progress.base.smith ? (data.progress.base.smith.attackUpgradesBought || 0) : 0;
        const forgeArmor = data.progress.base && data.progress.base.smith ? (data.progress.base.smith.armorUpgradesBought || 0) : 0;
        const fortLvl = data.battle.fort && data.battle.fort.con ? data.battle.fort.con.level || 0 : 0;
        const conTotal = (lsMult.levelCon || 0) + (lsMult.skillConBonus || 0);
        const strTotal = (lsMult.levelStr || 0) + (lsMult.skillStrBonus || 0);
        view.updateVal("statsHpText", `${intToStringRound(p.maxHp)} HP`);
        view.updateVal("statsHpTip", `Base: +20<br>Fortify: +${fortLvl}<br>Forge basic armor: +${forgeArmor * 5}<br>Con multiplier: +${Math.round(conTotal * 10)}%`, "innerHTML");
        view.updateVal("statsRegenText", `${round2(p.regenPerSecond || 0)}/s`);
        view.updateVal("statsRegenTip", "Base regen: +0.50/s", "innerHTML");
        view.updateVal("statsAttackText", `${intToStringRound(p.attackDamage)} dmg`);
        view.updateVal("statsAttackTip", `Base: +8<br>Forge better blade: +${forgeAtk}<br>Strength multiplier: +${Math.round(strTotal * 10)}%`, "innerHTML");
        const armorFlat = (skills.isSkillUnlocked("toughness_warrior") && data.progress.skills.toughness_warrior)
            ? round2((data.progress.skills.toughness_warrior.level || 0) * 0.25)
            : 0;
        view.updateVal("statsArmorText", `${round2(armorFlat)} flat`);
        view.updateVal("statsArmorTip", `Warrior Toughness: +${round2(armorFlat)} flat damage reduction`, "innerHTML");
        view.updateVal("statsMeleeText", `${round2((p.attackCooldownMs || 0) / 1000)}s`);
        const alaLv = (skills.isSkillUnlocked("alacrity") && data.progress.skills.alacrity) ? (data.progress.skills.alacrity.level || 0) : 0;
        view.updateVal("statsMeleeTip", `Base: 2.00s<br>Alacrity reduction: ${alaLv * 10} ms<br>Floor: 0.40s`, "innerHTML");
        view.updateVal("statsRangedText", hasBow ? `${round2((p.rangedAttackCooldownMs || 0) / 1000)}s` : "Locked");
        view.updateVal("statsRangedTip", hasBow ? `Base: 4.00s<br>Alacrity reduction: ${alaLv * 20} ms<br>Floor: 0.80s` : "Requires Make bow upgrade", "innerHTML");

        const current = data.progress.currentMapKey;

        const mapDefs = data.progress.mapDefinitions || [];
        for (let i = 0; i < mapDefs.length; i++) {
            const map = mapDefs[i];
            const reqClass = map.requiredClassKey || "";
            const classAllowed = !reqClass || reqClass === (data.progress.currentClassKey || "none");
            view.updateVal(`travel_card_${map.key}`, classAllowed ? "" : "none", "style.display");
            view.updateVal(`mapButton_${map.key}`, current === map.key ? "Current" : "Travel", "textContent");
            view.updateVal(`mapButton_${map.key}`, current === map.key || !classAllowed, "disabled");
            view.updateVal(`mapDifficulty_${map.key}`, `x${round2(map.baseDifficulty || 1)}`);
            view.updateVal(`mapWaves_${map.key}`, (map.zones || []).length, "textContent", 1);
            view.updateVal(`mapTime_${map.key}`, `${round1((map.totalDurationMs || 0) / 1000)}s`);
            const workersFound = (data.progress.mapWorkersFound && data.progress.mapWorkersFound[map.key]) || 0;
            const workersMax = ((map.zones || []).length * 6) || 0;
            view.updateVal(`mapWorkers_${map.key}`, `${workersFound}/${workersMax}`);
            const stars = (data.progress.mapStars && data.progress.mapStars[map.key]) || {};
            view.updateVal(`mapStar_${map.key}_bronze`, stars.bronze ? "★" : "☆");
            view.updateVal(`mapStar_${map.key}_silver`, stars.silver ? "★" : "☆");
            view.updateVal(`mapStar_${map.key}_gold`, stars.gold ? "★" : "☆");
        }

        view.updateHistoryList();
        view.updateCompactLayout();
    },
    updateBasePanel: function() {
        const base = data.progress.base;
        if (!base) {
            return;
        }
        let selected = data.progress.selectedBaseBuilding;
        if (baseBuildingKeys.indexOf(selected) < 0) {
            selected = "chapel";
            data.progress.selectedBaseBuilding = selected;
        }
        for (let i = 0; i < baseBuildingKeys.length; i++) {
            const key = baseBuildingKeys[i];
            const id = `baseBuilding_${key}`;
            const isActive = key === selected;
            view.updateVal(id, isActive, "classList.toggle", "base-building-selected");
        }
        const minePct = Math.max(0, Math.min(100, (base.mine.progress || 0) * 100));
        const smithPct = Math.max(0, Math.min(100, (base.smith.progress || 0) * 100));
        const lumbermillPct = Math.max(0, Math.min(100, (base.lumbermill.progress || 0) * 100));
        const sawmillPct = Math.max(0, Math.min(100, (base.sawmill.progress || 0) * 100));
        const mineUnlocked = (base.mine.assignedWorkers || 0) > 0;
        const smithUnlocked = (base.smith.assignedWorkers || 0) > 0;
        const lumbermillUnlocked = (base.lumbermill.assignedWorkers || 0) > 0;
        const sawmillUnlocked = (base.sawmill.assignedWorkers || 0) > 0;
        view.updateVal("baseMineProgressFill", `${minePct}%`, "style.width");
        view.updateVal("baseSmithProgressFill", `${smithPct}%`, "style.width");
        view.updateVal("baseLumbermillProgressFill", `${lumbermillPct}%`, "style.width");
        view.updateVal("baseSawmillProgressFill", `${sawmillPct}%`, "style.width");
        view.updateVal("baseMineProgressWrap", mineUnlocked ? "" : "none", "style.display");
        view.updateVal("baseSmithProgressWrap", smithUnlocked ? "" : "none", "style.display");
        view.updateVal("baseLumbermillProgressWrap", lumbermillUnlocked ? "" : "none", "style.display");
        view.updateVal("baseSawmillProgressWrap", sawmillUnlocked ? "" : "none", "style.display");
        const garden = base.garden || {};
        view.updateVal("mapManualBtn_inn", garden.mapManualInn && !!base.inn.openForGuests ? "inline-block" : "none", "style.display");
        view.updateVal("mapManualBtn_mine", garden.mapManualMine && mineUnlocked ? "inline-block" : "none", "style.display");
        view.updateVal("mapManualBtn_smith", garden.mapManualSmith && smithUnlocked ? "inline-block" : "none", "style.display");
        view.updateVal("mapManualBtn_lumbermill", garden.mapManualLumbermill && lumbermillUnlocked ? "inline-block" : "none", "style.display");
        view.updateVal("mapManualBtn_sawmill", garden.mapManualSawmill && sawmillUnlocked ? "inline-block" : "none", "style.display");

        const res = base.resources;
        const hideMaxed = !!(data.progress.options && data.progress.options.hideMaxedUpgrades);
        view.updateVal("base_res_ore", res.ironOre, "textContent", "floor");
        view.updateVal("base_res_bar", res.ironBar, "textContent", "floor");
        view.updateVal("base_res_logs", res.stone, "textContent", "floor");
        view.updateVal("base_res_lumber", res.cutStone, "textContent", "floor");
        view.updateVal("baseWorkersAssigned", engine.getAvailableWorkers(), "textContent", 1);
        view.updateVal("baseWorkersFound", engine.getTotalFoundWorkers(), "textContent", 1);

        const cdPct = function(ms) {
            const remain = Math.max(0, ms || 0);
            return Math.max(0, Math.min(100, (1 - (remain / 10000)) * 100));
        };
        view.updateVal("base_chapel_desc", "The Chapel blesses your journey.");
        view.updateVal("base_chapel_upgrade_btn", base.chapel.autoRetryEnabled ? "none" : "", "style.display");
        const unlocked = data.progress.unlockedClasses || {};
        const currentClass = data.progress.currentClassKey || "none";
        const pendingClass = data.progress.pendingClassKey || "";
        const guildTxt = pendingClass
            ? `Current class: ${initialize.getClassDef(currentClass).name} | Pending switch: ${initialize.getClassDef(pendingClass).name} (applies on Try Again)`
            : `Current class: ${initialize.getClassDef(currentClass).name}`;
        view.updateVal("base_guild_current", guildTxt);
        const classes = ["warrior", "rogue", "hunter"];
        for (let ci = 0; ci < classes.length; ci++) {
            const ck = classes[ci];
            const isUnlocked = !!unlocked[ck];
            const buyId = `base_guild_btn_buy_${ck}`;
            const switchId = `base_guild_btn_switch_${ck}`;
            view.updateVal(buyId, isUnlocked ? "Bought" : `Buy (${initialize.getClassDef(ck).buyCostGold}g)`);
            view.updateVal(buyId, isUnlocked, "disabled");
            const isCurrent = currentClass === ck;
            const isPending = pendingClass === ck;
            view.updateVal(switchId, isPending ? "Switching..." : (isCurrent ? "Current" : "Switch"));
            view.updateVal(switchId, !isUnlocked || isCurrent || isPending, "disabled");
        }

        view.updateVal("base_mine_row", `Iron Ore: ${intToStringRound(res.ironOre)}`);
        const mineA = base.mine.assignedWorkers || 0;
        const mineG = base.mine.gearSets || 0;
        view.updateVal("base_mine_workers_label", `Workers: ${mineA}/${mineG} gear`);
        view.updateVal("base_mine_hire_btn", `Buy mining gear (${intToStringRound(base.mine.nextGearGoldCost)} gold, ${intToStringRound(base.mine.nextGearBarsCost)} bars)`);
        view.updateVal("base_mine_assign_btn", (base.mine.assignedWorkers || 0) >= (base.mine.gearSets || 0) || engine.getAvailableWorkers() <= 0, "disabled");
        view.updateVal("base_mine_unassign_btn", (base.mine.assignedWorkers || 0) <= 0, "disabled");
        view.updateVal("base_mine_manual_btn", mineUnlocked ? "" : "none", "style.display");
        view.updateVal("base_mine_cd_wrap", mineUnlocked ? "" : "none", "style.display");
        view.updateVal("base_mine_cd_text", "none", "style.display");
        view.updateVal("base_mine_manual_btn", (base.mine.manualCooldownMs || 0) > 0, "disabled");
        view.updateVal("base_mine_cd_fill", `${cdPct(base.mine.manualCooldownMs)}%`, "style.width");

        const maxedSmithAttack = (base.smith.attackUpgradesBought || 0) >= 10;
        view.updateVal("base_smith_row", `Iron Ore: ${intToStringRound(res.ironOre)} | Iron Bar: ${intToStringRound(res.ironBar)}`);
        const smA = base.smith.assignedWorkers || 0;
        const smG = base.smith.gearSets || 0;
        view.updateVal("base_smith_workers_label", `Workers: ${smA}/${smG} gear`);
        view.updateVal("base_smith_hire_btn", `Buy smelting gear (${intToStringRound(base.smith.nextGearGoldCost)} gold, ${intToStringRound(base.smith.nextGearBarsCost)} bars)`);
        view.updateVal("base_smith_assign_btn", (base.smith.assignedWorkers || 0) >= (base.smith.gearSets || 0) || engine.getAvailableWorkers() <= 0, "disabled");
        view.updateVal("base_smith_unassign_btn", (base.smith.assignedWorkers || 0) <= 0, "disabled");
        view.updateVal("base_smith_manual_btn", smithUnlocked ? "" : "none", "style.display");
        view.updateVal("base_smith_cd_wrap", smithUnlocked ? "" : "none", "style.display");
        view.updateVal("base_smith_cd_text", "none", "style.display");
        view.updateVal("base_smith_manual_btn", (base.smith.manualCooldownMs || 0) > 0, "disabled");
        view.updateVal("base_smith_cd_fill", `${cdPct(base.smith.manualCooldownMs)}%`, "style.width");
        view.updateVal("base_smith_attack_row", `Forge better blade: ${base.smith.attackUpgradesBought}/10 (+1 base attack each)`);
        view.updateVal("base_smith_attack_btn", `Forge better blade (${base.smith.nextAttackUpgradeCostBars} Iron Bars)`);
        view.updateVal("base_smith_attack_btn", maxedSmithAttack, "disabled");
        view.updateVal("base_smith_attack_btn", hideMaxed && maxedSmithAttack ? "none" : "", "style.display");
        const smithArmorMaxed = (base.smith.armorUpgradesBought || 0) >= 6;
        view.updateVal("base_smith_armor_row", `Forge basic armor: ${base.smith.armorUpgradesBought || 0}/6 (+5 base HP each)`);
        view.updateVal("base_smith_armor_btn", "Forge basic armor (30 Iron Bars)");
        view.updateVal("base_smith_armor_btn", smithArmorMaxed, "disabled");
        view.updateVal("base_smith_armor_btn", hideMaxed && smithArmorMaxed ? "none" : "", "style.display");

        const inn = base.inn;
        const maxGuests = typeof engine.getInnGuestCapacity === "function" ? engine.getInnGuestCapacity() : 3;
        view.updateVal("base_inn_open_btn", inn.openForGuests ? "none" : "", "style.display");
        view.updateVal("base_inn_open_row", inn.openForGuests ? "" : "none", "style.display");
        view.updateVal("base_inn_next_row", inn.openForGuests ? "" : "none", "style.display");
        view.updateVal("base_inn_adv_btn", inn.openForGuests ? "" : "none", "style.display");
        view.updateVal("base_inn_adv_cd_wrap", inn.openForGuests ? "" : "none", "style.display");
        view.updateVal("base_inn_adv_cd_text", "none", "style.display");
        view.updateVal("base_inn_adv_cd_fill", `${cdPct(inn.advertiseCooldownMs)}%`, "style.width");
        view.updateVal("base_inn_adv_btn", (inn.advertiseCooldownMs || 0) > 0, "disabled");
        view.updateVal("base_inn_open_row", "Open for guests: active");
        view.updateVal("base_inn_next_row", `Guests ${inn.guests.length}/${maxGuests} · Next guest in ${Math.ceil(Math.max(0, inn.nextGuestTimerMs) / 1000)}s`);
        for (let gi = 0; gi < 10; gi++) {
            const g = inn.guests[gi];
            view.updateVal(`base_inn_guest_wrap_${gi}`, g ? "" : "none", "style.display");
            if (g) {
                const skillName = g.skillKey && data.progress.skills[g.skillKey] ? data.progress.skills[g.skillKey].name : "Nothing to tell you";
                view.updateVal(`base_inn_guest_name_${gi}`, `${g.archetype} · ${skillName}`);
                view.updateVal(`base_inn_guest_chat_${gi}`, !!g.isChatting, "disabled");
                view.updateVal(`base_inn_guest_fill_${gi}`, `${Math.max(0, Math.min(100, (g.chatProgress || 0) * 100))}%`, "style.width");
                const btn = viewData.cached[`base_inn_guest_chat_${gi}`];
                if (btn) {
                    btn.dataset.guestId = g.id;
                }
            }
        }
        view.updateVal("base_inn_empty", inn.openForGuests && !inn.guests.length ? "" : "none", "style.display");

        const libTab = data.progress.selectedLibraryTab || "combat";
        view.updateVal("libraryTab_combat", libTab === "combat" ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
        view.updateVal("libraryTab_town", libTab === "town" ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
        view.updateVal("libraryTab_class", libTab === "class" ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
        const lib = base.library || {};
        const libWorkers = lib.assignedWorkers || 0;
        const libDesks = lib.gearSets || 0;
        view.updateVal("base_library_workers_label", `Researchers: ${libWorkers}/${libDesks} desks · Queue top-down by priority`);
        view.updateVal("base_library_desk_btn", `Buy desk (${intToStringRound(lib.nextGearGoldCost || 0)} gold, ${intToStringRound(lib.nextGearStoneCost || 0)} cut stone)`);
        view.updateVal("base_library_assign_btn", libWorkers >= libDesks || engine.getAvailableWorkers() <= 0, "disabled");
        view.updateVal("base_library_unassign_btn", libWorkers <= 0, "disabled");
        let shownLibraryRows = 0;
        for (let i = 0; i < skills.keysInOrder.length; i++) {
            const k = skills.keysInOrder[i];
            const sk = data.progress.skills[k];
            const cat = (sk && sk.category) || "combat";
            if (cat !== libTab) {
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
            const buyGold = skills.getSkillUnlockCostGold(k);
            const reqResearch = buyGold * skills.getSkillResearchCostMultiplier(k);
            if (!purchased) {
                view.updateVal(`base_library_btn_${k}`, `Buy (${buyGold} gold)`);
                view.updateVal(`base_library_btn_${k}`, false, "disabled");
                view.updateVal(`base_library_progress_${k}`, `Research required: ${intToStringRound(reqResearch)}`);
                view.updateVal(`base_library_pause_${k}`, "none", "style.display");
            } else {
                const p = rs.progress || 0;
                const r = rs.required || reqResearch;
                const paused = !!rs.paused;
                view.updateVal(`base_library_btn_${k}`, "Bought");
                view.updateVal(`base_library_btn_${k}`, true, "disabled");
                view.updateVal(`base_library_progress_${k}`, `${paused ? "[Paused] " : ""}${intToStringRound(p)} / ${intToStringRound(r)} research`);
                view.updateVal(`base_library_pause_${k}`, paused ? "Resume" : "Pause");
                view.updateVal(`base_library_pause_${k}`, "", "style.display");
            }
        }
        view.updateVal("base_library_empty", shownLibraryRows ? "none" : "", "style.display");

        view.updateVal("base_lumbermill_row", `Stone: ${intToStringRound(res.stone)}`);
        const lmA = base.lumbermill.assignedWorkers || 0;
        const lmG = base.lumbermill.gearSets || 0;
        view.updateVal("base_lumbermill_workers_label", `Workers: ${lmA}/${lmG} gear`);
        view.updateVal("base_lumbermill_hire_btn", `Buy quarry gear (${intToStringRound(base.lumbermill.nextGearGoldCost)} gold, ${intToStringRound(base.lumbermill.nextGearBarsCost)} bars)`);
        view.updateVal("base_lumbermill_assign_btn", (base.lumbermill.assignedWorkers || 0) >= (base.lumbermill.gearSets || 0) || engine.getAvailableWorkers() <= 0, "disabled");
        view.updateVal("base_lumbermill_unassign_btn", (base.lumbermill.assignedWorkers || 0) <= 0, "disabled");
        view.updateVal("base_lumbermill_manual_btn", lumbermillUnlocked ? "" : "none", "style.display");
        view.updateVal("base_lumbermill_cd_wrap", lumbermillUnlocked ? "" : "none", "style.display");
        view.updateVal("base_lumbermill_cd_text", "none", "style.display");
        view.updateVal("base_lumbermill_manual_btn", (base.lumbermill.manualCooldownMs || 0) > 0, "disabled");
        view.updateVal("base_lumbermill_cd_fill", `${cdPct(base.lumbermill.manualCooldownMs)}%`, "style.width");

        view.updateVal("base_sawmill_row", `Stone: ${intToStringRound(res.stone)} | Cut Stone: ${intToStringRound(res.cutStone)}`);
        const swA = base.sawmill.assignedWorkers || 0;
        const swG = base.sawmill.gearSets || 0;
        view.updateVal("base_sawmill_workers_label", `Workers: ${swA}/${swG} gear`);
        view.updateVal("base_sawmill_hire_btn", `Buy cutting gear (${intToStringRound(base.sawmill.nextGearGoldCost)} gold, ${intToStringRound(base.sawmill.nextGearBarsCost)} bars)`);
        view.updateVal("base_sawmill_assign_btn", (base.sawmill.assignedWorkers || 0) >= (base.sawmill.gearSets || 0) || engine.getAvailableWorkers() <= 0, "disabled");
        view.updateVal("base_sawmill_unassign_btn", (base.sawmill.assignedWorkers || 0) <= 0, "disabled");
        view.updateVal("base_sawmill_manual_btn", sawmillUnlocked ? "" : "none", "style.display");
        view.updateVal("base_sawmill_cd_wrap", sawmillUnlocked ? "" : "none", "style.display");
        view.updateVal("base_sawmill_cd_text", "none", "style.display");
        view.updateVal("base_sawmill_manual_btn", (base.sawmill.manualCooldownMs || 0) > 0, "disabled");
        view.updateVal("base_sawmill_cd_fill", `${cdPct(base.sawmill.manualCooldownMs)}%`, "style.width");

        const w = base.workshop;
        const roomMaxed = (w.innRoomUpgradesBought || 0) >= 7;
        view.updateVal("base_workshop_row", `Inn rooms added: ${w.innRoomUpgradesBought || 0}/7`);
        view.updateVal("base_workshop_room_btn", `Add room to Inn (${intToStringRound(w.innRoomNextGoldCost)} gold, ${intToStringRound(w.innRoomNextLumberCost)} cut stone)`);
        view.updateVal("base_workshop_room_btn", roomMaxed, "disabled");
        view.updateVal("base_workshop_room_btn", hideMaxed && roomMaxed ? "none" : "", "style.display");
        view.updateVal("base_workshop_bow_btn", w.bowBuilt ? "Bow complete" : "Make bow (200 gold, 20 cut stone)");
        view.updateVal("base_workshop_bow_btn", !!w.bowBuilt, "disabled");
        view.updateVal("base_workshop_bow_btn", hideMaxed && w.bowBuilt ? "none" : "", "style.display");

        const g = base.garden || {};
        const rows = [
            { row: "base_garden_row_inn", btn: "base_garden_btn_inn", bought: !!g.mapManualInn, kind: "inn" },
            { row: "base_garden_row_mine", btn: "base_garden_btn_mine", bought: !!g.mapManualMine, kind: "mine" },
            { row: "base_garden_row_smith", btn: "base_garden_btn_smith", bought: !!g.mapManualSmith, kind: "smith" },
            { row: "base_garden_row_lumbermill", btn: "base_garden_btn_lumbermill", bought: !!g.mapManualLumbermill, kind: "lumbermill" },
            { row: "base_garden_row_sawmill", btn: "base_garden_btn_sawmill", bought: !!g.mapManualSawmill, kind: "sawmill" }
        ];
        let shownGarden = 0;
        for (let i = 0; i < rows.length; i++) {
            const r = rows[i];
            const show = !(hideMaxed && r.bought);
            if (show) {
                shownGarden++;
            }
            view.updateVal(r.row, show ? "" : "none", "style.display");
            view.updateVal(r.btn, r.bought ? "Bought" : "Buy (200 gold)");
            view.updateVal(r.btn, r.bought, "disabled");
        }
        view.updateVal("base_garden_empty", shownGarden ? "none" : "", "style.display");
    },
    renderAttributePlanList: function() {
        const el = viewData.cached.attributePlanList;
        if (!el) {
            return;
        }
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
        if (!el) {
            return;
        }
        const runs = data.progress.runHistory || [];
        let html = "";
        for (let i = 0; i < runs.length; i++) {
            const run = runs[i];
            html += `<div class="history-row">#${i + 1}: ${round1(run.survivedSeconds)}s | Gold ${intToStringRound(run.goldGained)} | ${round2(run.goldPerSecond)}/s</div>`;
        }
        if (!html) {
            html = "<div class=\"muted-text\">No runs yet.</div>";
        }
        if (viewData.prevValues.historyHtml !== html) {
            el.innerHTML = html;
            viewData.prevValues.historyHtml = html;
        }
    },
    updateSkillCard: function(skillKey) {
        const skill = data.progress.skills[skillKey];
        if (!skill) {
            return;
        }
        const parts = skills.skillExpGainParts(skill);
        const expPerTrigger = skills.expGainForSkillTrigger(skill, 1);
        const expPct = Math.min(100, Math.max(0, (skill.exp / skill.expToLevel) * 100));
        const talPct = Math.min(100, Math.max(0, (skill.talent / skill.talentToLevel) * 100));
        const tipsVal = skill.tips || 0;
        view.updateVal(`skill_${skillKey}_headline`, `${skill.name} - Lvl ${skill.level} - Talent ${skill.talentLevel}${tipsVal > 0 ? ` - Tips ${round1(tipsVal)}` : ""}`);
        view.updateVal(`skill_${skillKey}_reward`, skills.getSkillRewardText(skillKey, skill));
        view.updateVal(`skill_${skillKey}_trigger`, skills.getSkillTriggerDescription(skillKey));
        const g = skills.getSkillGuestInfo(skillKey);
        view.updateVal(`skill_${skillKey}_tips_rarity`, `Tips rarity: ${g && g.rarity ? g.rarity : 1}/10`);
        view.updateVal(`skill_${skillKey}_exp_on_trigger`, `Exp on trigger (base 1): ${round2(expPerTrigger)}`);
        view.updateVal(`skill_${skillKey}_exp_mults`, `· Skill level ×${parts.levelMult.toFixed(4)}`);
        view.updateVal(`skill_${skillKey}_exp_text`, `${round1(skill.exp)} / ${round1(skill.expToLevel)}`);
        view.updateVal(`skill_${skillKey}_exp_fill`, `${expPct}%`, "style.width");
        view.updateVal(`skill_${skillKey}_talent_text`, `${round1(skill.talent)} / ${round1(skill.talentToLevel)} (Lv ${skill.talentLevel}) · exp ×${parts.talentMult.toFixed(4)}`);
        view.updateVal(`skill_${skillKey}_talent_fill`, `${talPct}%`, "style.width");
        const starMult = parts.starMult || 1;
        view.updateVal(`skill_${skillKey}_star_effect_row`, starMult > 1 ? "" : "none", "style.display");
        view.updateVal(`skill_${skillKey}_star_effect`, `×${starMult.toFixed(4)}`);
        view.updateVal(`skill_${skillKey}_tips_effect_row`, tipsVal > 0 ? "" : "none", "style.display");
        view.updateVal(`skill_${skillKey}_tips_row`, tipsVal > 0 ? "" : "none", "style.display");
        view.updateVal(`skill_${skillKey}_tips_effect`, `×${parts.tipsMult.toFixed(4)}`);
        view.updateVal(`skill_${skillKey}_tips_text`, tipsVal, "textContent", 3);
        view.updateVal(`skill_${skillKey}_combined_mults`, `×${parts.combinedMult.toFixed(4)}`);
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
    updateSkillSubTabs: function() {
        const tab = data.progress.selectedSkillsTab || "combat";
        view.updateVal("skillSubTab_combat", tab === "combat" ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
        view.updateVal("skillSubTab_town", tab === "town" ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
        view.updateVal("skillSubTab_class", tab === "class" ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
    },
    updatePlayerBattleBars: function() {
        const p = data.battle.player;
        const ls = data.battle.levelState;
        const atkFill = viewData.cached.playerAttackBarFill;
        const atkLabel = viewData.cached.playerAttackBarLabel;
        const rngFill = viewData.cached.playerRangedBarFill;
        const rngTrack = viewData.cached.playerRangedBarTrack;
        const rngLabel = viewData.cached.playerRangedBarLabel;
        const lvlFill = viewData.cached.playerLevelBarFill;
        const lvlLabel = viewData.cached.playerLevelBarLabel;
        const classAWrap = viewData.cached.playerClassBarA;
        const classAWrapFill = viewData.cached.playerClassBarAFill;
        const classALabel = viewData.cached.playerClassBarALabel;
        const classBWrap = viewData.cached.playerClassBarB;
        const classBWrapFill = viewData.cached.playerClassBarBFill;
        const classBLabel = viewData.cached.playerClassBarBLabel;
        if (atkFill && atkLabel) {
            const cd = typeof engine.getEffectiveMeleeCooldownMs === "function" ? engine.getEffectiveMeleeCooldownMs() : p.attackCooldownMs;
            const atkRemain = Math.max(0, p.attackTimerMs);
            const atkPct = 100 - Math.max(0, Math.min(100, (atkRemain / cd) * 100));
            atkFill.style.width = `${atkPct}%`;
            const atkElapsed = cd - atkRemain;
            const cls = data.progress.currentClassKey || "none";
            const atkName = (cls === "warrior" && (data.battle.classPowerA || 0) >= 1000) ? "Power strike" : "Melee attack";
            view.updateVal("playerAttackBarLabel", `${atkName} ${intToString(atkElapsed, 3)} / ${intToString(cd, 3)} ms`);
        }
        if (rngFill && rngLabel) {
            if (data.battle.state !== "running") {
                rngFill.style.width = "0%";
                rngLabel.textContent = "\u2014";
            } else {
            const pushPx = typeof engine.getEnemyPushBonusPxPerSecond === "function"
                ? engine.getEnemyPushBonusPxPerSecond()
                : gameData.battle.idlePushBonusPxPerSecond;
            const timeRate = typeof engine.getBattleTimeRateMultiplier === "function"
                ? engine.getBattleTimeRateMultiplier()
                : 1;
            const rangedOn = !!(data.progress.rangedAttackEnabled && data.progress.base && data.progress.base.workshop && data.progress.base.workshop.bowBuilt && (data.progress.currentClassKey || "none") !== "rogue");
            const idlePush = pushPx > 0;
            if (rangedOn) {
                if (rngTrack) {
                    rngTrack.style.display = "";
                }
                if (timeRate > 1) {
                    rngFill.style.width = "100%";
                    view.updateVal("playerRangedBarLabel", `Battle time x${round2(timeRate)} (no visible enemies)`);
                } else {
                    const rcd = typeof engine.getEffectiveRangedCooldownMs === "function" ? engine.getEffectiveRangedCooldownMs() : (p.rangedAttackCooldownMs || 4000);
                    const rRemain = Math.max(0, p.rangedAttackTimerMs || 0);
                    const rPct = 100 - Math.max(0, Math.min(100, (rRemain / rcd) * 100));
                    rngFill.style.width = `${rPct}%`;
                    const rElapsed = rcd - rRemain;
                    view.updateVal("playerRangedBarLabel", `Ranged attack ${intToString(rElapsed, 3)} / ${intToString(rcd, 3)} ms`);
                }
            } else if (idlePush) {
                if (rngTrack) {
                    rngTrack.style.display = "none";
                }
                rngFill.style.width = "0%";
                view.updateVal("playerRangedBarLabel", `Move speed +${intToString(pushPx, 3)}/s`);
            } else {
                if (rngTrack) {
                    rngTrack.style.display = "none";
                }
                rngFill.style.width = "0%";
                view.updateVal("playerRangedBarLabel", "Enemy in range");
            }
            }
        }
        const movePulse = viewData.cached.playerMovePulse;
        if (movePulse) {
            const pushPx = typeof engine.getEnemyPushBonusPxPerSecond === "function"
                ? engine.getEnemyPushBonusPxPerSecond()
                : 0;
            const currentHp = data.battle.player ? data.battle.player.hp : 0;
            const prevHp = viewData.prevValues.playerPulsePrevHp !== undefined ? viewData.prevValues.playerPulsePrevHp : currentHp;
            const takingDamageNow = currentHp < prevHp;
            viewData.prevValues.playerPulsePrevHp = currentHp;
            const movingForward = pushPx > 0;
            movePulse.classList.toggle("move-pulse-active", movingForward && !takingDamageNow);
        }
        if (lvlFill && lvlLabel) {
            const lvlPct = ls.expToLevel > 0 ? Math.max(0, Math.min(100, (ls.exp / ls.expToLevel) * 100)) : 0;
            lvlFill.style.width = `${lvlPct}%`;
            view.updateVal("playerLevelBarLabel", `Level ${intToString(ls.level, 3)} — ${intToString(ls.exp, 3)} / ${intToString(ls.expToLevel, 3)} exp`);
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
        const tabs = ["base", "leveling", "stats", "skills", "travel", "history", "options"];
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
        if (!viewData.cached.battlefield) {
            return;
        }
        createView.syncBattlefieldLayoutFromDom();
        const activeIds = {};
        const battlefield = viewData.cached.battlefield;
        const lm = engine.getBattleLaneMetrics();
        const alpha = data.gameSettings.renderAlpha ?? 1;

        for (let i = 0; i < data.battle.enemies.length; i++) {
            const enemy = data.battle.enemies[i];
            if (!engine.enemyIntersectsBattlefield(enemy)) {
                continue;
            }
            const enemyId = enemy.id;
            activeIds[enemyId] = true;
            let enemyEl = viewData.activeEnemyElements[enemyId];
            if (!enemyEl) {
                enemyEl = view.acquireEnemyElement();
                enemyEl.id = `enemy_${enemyId}`;
                viewData.activeEnemyElements[enemyId] = enemyEl;
                battlefield.appendChild(enemyEl);
            }
            const laneCenter = lm.inset + (enemy.lane + 0.5) * lm.laneWidth;
            const leftPx = Math.round(laneCenter - (enemy.sizePx / 2));
            let renderY = enemy.yPx;
            if (data.battle.state === "running") {
                renderY = (enemy.prevYPx !== undefined) ? (enemy.prevYPx + ((enemy.yPx - enemy.prevYPx) * alpha)) : enemy.yPx;
            } else {
                enemy.prevYPx = enemy.yPx;
            }
            enemyEl.style.width = `${enemy.sizePx}px`;
            enemyEl.style.height = `${enemy.sizePx}px`;
            enemyEl.style.left = `${leftPx}px`;
            enemyEl.style.top = `${renderY}px`;
            enemyEl.classList.toggle("enemy-token-ranged", enemy.enemyType === "ranged");
            const hpPct = Math.max(0, enemy.hp / enemy.maxHp) * 100;
            const hpLayer = enemyEl.querySelector(".enemy-hp-layer");
            if (hpLayer) {
                if (enemy.enemyType === "ranged") {
                    hpLayer.style.background = `linear-gradient(to top, #4da3ff ${hpPct}%, #0d1d3a ${hpPct}%)`;
                } else {
                    hpLayer.style.background = `linear-gradient(to top, #ff2d2d ${hpPct}%, #2a0e0e ${hpPct}%)`;
                }
            }
            const hpLine = enemyEl.querySelector(".enemy-stat-hp");
            const dmgLine = enemyEl.querySelector(".enemy-stat-dmg");
            const atkFill = enemyEl.querySelector(".enemy-stat-atk-fill");
            if (hpLine) {
                hpLine.textContent = `${Math.ceil(enemy.hp)}/${enemy.maxHp}`;
            }
            if (dmgLine) {
                dmgLine.textContent = `Dmg ${enemy.attackDamage}`;
            }
            if (atkFill) {
                const cd = enemy.enemyType === "ranged" ? (enemy.attackCooldownMs * 2) : enemy.attackCooldownMs;
                const canCharge = enemy.enemyType === "ranged" ? (!!enemy.rangedReady || !!enemy.inRange) : !!enemy.inRange;
                const remain = Math.max(0, Math.min(cd, enemy.attackTimerMs || 0));
                const atkBarPct = canCharge
                    ? (100 - Math.max(0, Math.min(100, (remain / cd) * 100)))
                    : 0;
                atkFill.style.width = `${atkBarPct}%`;
            }
        }
        view.consumeLineFxQueue();
        view.updatePlayerBattleBars();

        const activeKeys = Object.keys(viewData.activeEnemyElements);
        for (let i = 0; i < activeKeys.length; i++) {
            const enemyId = parseInt(activeKeys[i], 10);
            if (!activeIds[enemyId]) {
                view.releaseEnemyElement(enemyId);
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
        if (seg.kind === "ranged") {
            el.className = "attack-line-fx-anim attack-line-ranged";
        } else if (seg.kind === "enemy_ranged") {
            el.className = "attack-line-fx-anim attack-line-enemy-ranged";
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
    acquireEnemyElement: function() {
        let enemyEl = null;
        if (viewData.enemyElementPool.length > 0) {
            enemyEl = viewData.enemyElementPool.pop();
        } else {
            enemyEl = document.createElement("div");
            enemyEl.className = "enemy-token";
            const hpLayer = document.createElement("div");
            hpLayer.className = "enemy-hp-layer";
            const overlay = document.createElement("div");
            overlay.className = "enemy-overlay";
            const hpLine = document.createElement("div");
            hpLine.className = "enemy-stat-hp";
            const dmgLine = document.createElement("div");
            dmgLine.className = "enemy-stat-dmg";
            const atkWrap = document.createElement("div");
            atkWrap.className = "enemy-stat-atk-wrap";
            const atkFill = document.createElement("div");
            atkFill.className = "enemy-stat-atk-fill";
            atkWrap.appendChild(atkFill);
            overlay.appendChild(hpLine);
            overlay.appendChild(dmgLine);
            overlay.appendChild(atkWrap);
            enemyEl.appendChild(hpLayer);
            enemyEl.appendChild(overlay);
        }
        enemyEl.style.display = "block";
        return enemyEl;
    },
    releaseEnemyElement: function(enemyId) {
        const enemyEl = viewData.activeEnemyElements[enemyId];
        if (!enemyEl) {
            return;
        }
        enemyEl.style.display = "none";
        enemyEl.removeAttribute("id");
        if (enemyEl.parentElement) {
            enemyEl.parentElement.removeChild(enemyEl);
        }
        viewData.enemyElementPool.push(enemyEl);
        delete viewData.activeEnemyElements[enemyId];
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
            viewData.updateVal(scheduled.id, scheduled.value, scheduled.type);
        }
        viewData.scheduled = [];
    },
    updateVal: function(id, newVal, type="textContent", sigFigs) {
        const el = viewData.cached[id];
        if(!viewData.prevValues[id]) {
            viewData.prevValues[id] = {};
        }
        let prevValue = viewData.prevValues[id];
        if (!el) {
            console.log("Element of id " + id + " does not exist.");
            console.log(new Error().stack);
            return;
        }

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
