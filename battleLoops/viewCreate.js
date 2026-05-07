
let idsToCache = [];

let createView = {
    _resizeBound: false,
    initializeDisplay: function() {
        createView.setStaticDimensions();
        if (!createView._resizeBound) {
            createView._resizeBound = true;
            window.addEventListener("resize", function() {
                createView.setStaticDimensions();
                view.updateCompactLayout();
                createView.updateLayoutMeasurements();
            });
        }
        createView.createSkillElements();
        createView.createBaseInfoElements();
        createView.createTravelElements();
        createView.showCurrentTab();
        createView.setAllCaches(); //happens after generation
    },
    createTravelElements: function() {
        const root = document.getElementById("travelMapsList");
        if (!root) {
            return;
        }
        const maps = data.progress.mapDefinitions || [];
        let html = "";
        for (let i = 0; i < maps.length; i++) {
            const m = maps[i];
            const classReq = m.requiredClassKey ? ` · ${m.requiredClassKey.charAt(0).toUpperCase() + m.requiredClassKey.slice(1)} only` : "";
            html += `
                <div class="travel-card" id="travel_card_${m.key}">
                    <div class="travel-card-head">
                        <div class="travel-map-name">${m.name}<span class="muted-text">${classReq}</span></div>
                        <button id="mapButton_${m.key}" class="tab-button" onclick="events.changeMap('${m.key}')">Travel</button>
                    </div>
                    <div class="travel-map-meta">
                        <div>Difficulty: <span id="mapDifficulty_${m.key}"></span></div>
                        <div># Waves: <span id="mapWaves_${m.key}"></span></div>
                        <div>Total time: <span id="mapTime_${m.key}"></span></div>
                        <div>Workers: <span id="mapWorkers_${m.key}"></span></div>
                    </div>
                    <div class="travel-map-stars">
                        <span id="mapStar_${m.key}_bronze" class="skill-star-btn skill-star-bronze">☆</span>
                        <span id="mapStar_${m.key}_silver" class="skill-star-btn skill-star-silver">☆</span>
                        <span id="mapStar_${m.key}_gold" class="skill-star-btn skill-star-gold">☆</span>
                    </div>
                </div>
            `;
        }
        root.innerHTML = html;
    },
    createBaseInfoElements: function() {
        const root = document.getElementById("baseBuildingInfo");
        if (!root) {
            return;
        }
        const skillRows = [];
        for (let i = 0; i < skills.keysInOrder.length; i++) {
            const k = skills.keysInOrder[i];
            const nm = data.progress.skills[k] ? data.progress.skills[k].name : k;
            const classKey = (skills._byKey[k] && skills._byKey[k].classKey) ? skills._byKey[k].classKey : "";
            const className = classKey ? (classKey.charAt(0).toUpperCase() + classKey.slice(1)) : "";
            const classNote = className ? ` - ${className}` : "";
            skillRows.push(`<div id="base_library_row_${k}" class="base-library-row"><div><div id="base_library_name_${k}">${nm}${classNote}</div><div id="base_library_desc_${k}" class="muted-text base-skill-short">${skills.getSkillShortDescription(k)}</div><div id="base_library_progress_${k}" class="muted-text"></div></div><button id="base_library_btn_${k}" class="tab-button" onclick="events.buyLibrarySkill('${k}')">Buy</button><button id="base_library_pause_${k}" class="tab-button" onclick="events.toggleLibraryResearchPause('${k}')">Pause</button></div>`);
        }
        const guestRows = [];
        for (let i = 0; i < 10; i++) {
            guestRows.push(`<div id="base_inn_guest_wrap_${i}" class="base-guest-wrap"><div class="base-guest-row"><div id="base_inn_guest_name_${i}"></div><button id="base_inn_guest_chat_${i}" class="tab-button">Chat</button></div><div class="base-mini-progress base-guest-progress"><div id="base_inn_guest_fill_${i}" class="base-mini-progress-fill"></div></div></div>`);
        }
        root.innerHTML = `
            <div id="base_resource_strip" class="base-resource-strip">
                <span>Ore <span id="base_res_ore"></span></span>
                <span>Stone <span id="base_res_logs"></span></span>
                <span>|</span>
                <span>Bars <span id="base_res_bar"></span></span>
                <span>Cut Stone <span id="base_res_lumber"></span></span>
            </div>
            <div id="basePanel_chapel" class="base-info-section">
                <div class="base-info-title">Chapel</div><div id="base_chapel_desc" class="base-row"></div><button id="base_chapel_upgrade_btn" class="tab-button" onclick="events.buyChapelAutoRetry()">Enable auto-try again (50 gold)</button>
            </div>
            <div id="basePanel_mine" class="base-info-section">
                <div class="base-info-title">Mine</div><div id="base_mine_row" class="base-row"></div>
                <div class="base-building-hire-row"><button id="base_mine_hire_btn" class="tab-button base-hire-full" onclick="events.buyWorkerGear('mine')">Buy mining gear</button></div>
                <div class="base-worker-assign-row"><button id="base_mine_assign_btn" class="tab-button" onclick="events.assignWorker('mine')">Assign worker</button><button id="base_mine_unassign_btn" class="tab-button" onclick="events.unassignWorker('mine')">Unassign worker</button><span id="base_mine_workers_label" class="base-worker-cap-label muted-text"></span></div>
                <button id="base_mine_manual_btn" class="tab-button base-manual-btn" onclick="events.manualMine()">Press to strike vein (+5s × assigned workers)<div id="base_mine_cd_wrap" class="base-mini-progress base-manual-cd"><div id="base_mine_cd_fill" class="base-mini-progress-fill"></div></div></button>
                <div id="base_mine_cd_text" class="muted-text"></div>
            </div>
            <div id="basePanel_smith" class="base-info-section">
                <div class="base-info-title">Smith</div><div id="base_smith_row" class="base-row"></div>
                <div class="base-building-hire-row"><button id="base_smith_hire_btn" class="tab-button base-hire-full" onclick="events.buyWorkerGear('smith')">Buy smelting gear</button></div>
                <div class="base-worker-assign-row"><button id="base_smith_assign_btn" class="tab-button" onclick="events.assignWorker('smith')">Assign worker</button><button id="base_smith_unassign_btn" class="tab-button" onclick="events.unassignWorker('smith')">Unassign worker</button><span id="base_smith_workers_label" class="base-worker-cap-label muted-text"></span></div>
                <button id="base_smith_manual_btn" class="tab-button base-manual-btn" onclick="events.manualSmelt()">Press to stoke forge (+5s × assigned workers)<div id="base_smith_cd_wrap" class="base-mini-progress base-manual-cd"><div id="base_smith_cd_fill" class="base-mini-progress-fill"></div></div></button>
                <div id="base_smith_cd_text" class="muted-text"></div>
                <div id="base_smith_attack_row" class="base-row base-gap-top"></div><button id="base_smith_attack_btn" class="tab-button" onclick="events.buySmithAttackUpgrade()">Upgrade attack</button>
                <div id="base_smith_armor_row" class="base-row"></div><button id="base_smith_armor_btn" class="tab-button" onclick="events.buySmithArmorUpgrade()">Forge basic armor</button>
            </div>
            <div id="basePanel_inn" class="base-info-section">
                <div class="base-info-title">Inn</div><button id="base_inn_open_btn" class="tab-button" onclick="events.buyInnOpenForGuests()">Open for guests (100 gold)</button>
                <div id="base_inn_open_row" class="base-row"></div><div id="base_inn_next_row" class="base-row"></div>
                <button id="base_inn_adv_btn" class="tab-button base-manual-btn" onclick="events.advertiseInn()">Press to advertise (-5s guest timer)<div id="base_inn_adv_cd_wrap" class="base-mini-progress base-manual-cd"><div id="base_inn_adv_cd_fill" class="base-mini-progress-fill"></div></div></button>
                <div id="base_inn_adv_cd_text" class="muted-text"></div>
                <div id="base_inn_empty" class="muted-text">No guests currently.</div>${guestRows.join("")}
            </div>
            <div id="basePanel_guild" class="base-info-section">
                <div class="base-info-title">Guild</div>
                <div id="base_guild_current" class="base-row"></div>
                <div class="base-library-row"><span>Warrior: +1 Str, +2 Con, +0 Spd/level</span><button id="base_guild_btn_buy_warrior" class="tab-button" onclick="events.buyClass('warrior')">Buy (500g)</button><button id="base_guild_btn_switch_warrior" class="tab-button" onclick="events.queueClassSwitch('warrior')">Switch</button></div>
                <div class="base-library-row"><span>Rogue: +1 Str, +1 Con, +1 Spd/level</span><button id="base_guild_btn_buy_rogue" class="tab-button" onclick="events.buyClass('rogue')">Buy (500g)</button><button id="base_guild_btn_switch_rogue" class="tab-button" onclick="events.queueClassSwitch('rogue')">Switch</button></div>
                <div class="base-library-row"><span>Hunter: +2 Str, +1 Con, +0 Spd/level</span><button id="base_guild_btn_buy_hunter" class="tab-button" onclick="events.buyClass('hunter')">Buy (500g)</button><button id="base_guild_btn_switch_hunter" class="tab-button" onclick="events.queueClassSwitch('hunter')">Switch</button></div>
            </div>
            <div id="basePanel_library" class="base-info-section"><div class="base-info-title">Library</div><div class="row-buttons"><button id="libraryTab_combat" class="tab-button" onclick="events.switchLibraryTab('combat')">Combat</button><button id="libraryTab_town" class="tab-button" onclick="events.switchLibraryTab('town')">Town</button><button id="libraryTab_class" class="tab-button" onclick="events.switchLibraryTab('class')">Class</button></div><div class="base-building-hire-row"><button id="base_library_desk_btn" class="tab-button base-hire-full" onclick="events.buyLibraryDesk()">Buy desk</button></div><div class="base-worker-assign-row"><button id="base_library_assign_btn" class="tab-button" onclick="events.assignWorker('library')">Assign worker</button><button id="base_library_unassign_btn" class="tab-button" onclick="events.unassignWorker('library')">Unassign worker</button><span id="base_library_workers_label" class="base-worker-cap-label muted-text"></span></div><div id="base_library_queue_note" class="base-row muted-text">Skills are researched one at a time: Combat > Town > Class.</div><div id="base_library_empty" class="muted-text">All skills researched.</div>${skillRows.join("")}</div>
            <div id="basePanel_lumbermill" class="base-info-section">
                <div class="base-info-title">Quarry</div><div id="base_lumbermill_row" class="base-row"></div>
                <div class="base-building-hire-row"><button id="base_lumbermill_hire_btn" class="tab-button base-hire-full" onclick="events.buyWorkerGear('lumbermill')">Buy quarry gear</button></div>
                <div class="base-worker-assign-row"><button id="base_lumbermill_assign_btn" class="tab-button" onclick="events.assignWorker('lumbermill')">Assign worker</button><button id="base_lumbermill_unassign_btn" class="tab-button" onclick="events.unassignWorker('lumbermill')">Unassign worker</button><span id="base_lumbermill_workers_label" class="base-worker-cap-label muted-text"></span></div>
                <button id="base_lumbermill_manual_btn" class="tab-button base-manual-btn" onclick="events.manualLumber()">Press to quarry stone (+5s × assigned workers)<div id="base_lumbermill_cd_wrap" class="base-mini-progress base-manual-cd"><div id="base_lumbermill_cd_fill" class="base-mini-progress-fill"></div></div></button>
                <div id="base_lumbermill_cd_text" class="muted-text"></div>
            </div>
            <div id="basePanel_sawmill" class="base-info-section">
                <div class="base-info-title">Stonecutter</div><div id="base_sawmill_row" class="base-row"></div>
                <div class="base-building-hire-row"><button id="base_sawmill_hire_btn" class="tab-button base-hire-full" onclick="events.buyWorkerGear('sawmill')">Buy cutting gear</button></div>
                <div class="base-worker-assign-row"><button id="base_sawmill_assign_btn" class="tab-button" onclick="events.assignWorker('sawmill')">Assign worker</button><button id="base_sawmill_unassign_btn" class="tab-button" onclick="events.unassignWorker('sawmill')">Unassign worker</button><span id="base_sawmill_workers_label" class="base-worker-cap-label muted-text"></span></div>
                <button id="base_sawmill_manual_btn" class="tab-button base-manual-btn" onclick="events.manualSaw()">Press to cut stone (+5s × assigned workers)<div id="base_sawmill_cd_wrap" class="base-mini-progress base-manual-cd"><div id="base_sawmill_cd_fill" class="base-mini-progress-fill"></div></div></button>
                <div id="base_sawmill_cd_text" class="muted-text"></div>
            </div>
            <div id="basePanel_workshop" class="base-info-section"><div class="base-info-title">Workshop</div><div id="base_workshop_row" class="base-row"></div><button id="base_workshop_room_btn" class="tab-button" onclick="events.buyWorkshopInnRoom()">Add room to Inn</button><button id="base_workshop_bow_btn" class="tab-button" onclick="events.buyWorkshopBow()">Make bow</button></div>
            <div id="basePanel_garden" class="base-info-section"><div class="base-info-title">Garden</div><div class="base-row">Cultivate shortcuts to place manual buttons on the map.</div>
                <div id="base_garden_row_inn" class="base-library-row"><span>Add map button: Advertise (Inn)</span><button id="base_garden_btn_inn" class="tab-button" onclick="events.buyGardenMapManual('inn')">Buy</button></div>
                <div id="base_garden_row_mine" class="base-library-row"><span>Add map button: Mine</span><button id="base_garden_btn_mine" class="tab-button" onclick="events.buyGardenMapManual('mine')">Buy</button></div>
                <div id="base_garden_row_smith" class="base-library-row"><span>Add map button: Smelt (Smith)</span><button id="base_garden_btn_smith" class="tab-button" onclick="events.buyGardenMapManual('smith')">Buy</button></div>
                <div id="base_garden_row_lumbermill" class="base-library-row"><span>Add map button: Quarry (Quarry)</span><button id="base_garden_btn_lumbermill" class="tab-button" onclick="events.buyGardenMapManual('lumbermill')">Buy</button></div>
                <div id="base_garden_row_sawmill" class="base-library-row"><span>Add map button: Cut (Stonecutter)</span><button id="base_garden_btn_sawmill" class="tab-button" onclick="events.buyGardenMapManual('sawmill')">Buy</button></div>
                <div id="base_garden_empty" class="muted-text">All map manual button upgrades bought.</div>
            </div>
        `;
        for (let i = 0; i < 10; i++) {
            const btn = root.querySelector(`#base_inn_guest_chat_${i}`);
            if (btn) {
                btn.addEventListener("click", function() {
                    const gid = parseInt(this.dataset.guestId || "0", 10);
                    if (gid > 0) {
                        events.chatInnGuest(gid);
                    }
                });
            }
        }
    },
    fixUiAfterLoad: function() {
        if (events && events.showSelectedBaseBuildingPanels) {
            events.showSelectedBaseBuildingPanels(data.progress.selectedBaseBuilding || "chapel");
        }
    },
    createSkillElements: function() {
        const skillsList = document.getElementById("skillsList");
        if (!skillsList) {
            return;
        }
        const tab = data.progress.selectedSkillsTab || "combat";
        const skillKeys = skills.getSkillKeysByCategory(data.progress.skills, tab);
        if (!skillKeys.length) {
            if (tab === "class") {
                skillsList.innerHTML = `<div class="muted-text">Buy class skills in the Library.</div>`;
            } else {
                const label = tab === "town" ? "town" : "combat";
                skillsList.innerHTML = `<div class="muted-text">No ${label} skills unlocked yet. Visit the Library in Base.</div>`;
            }
            return;
        }
        let html = "";
        for (let i = 0; i < skillKeys.length; i++) {
            const key = skillKeys[i];
            const skill = data.progress.skills[key];
            html += `
                <div class="skill-block" id="skill_wrap_${key}">
                    <div class="skill-block-head" onclick="events.toggleSkillWrap('${key}')">
                        <span class="skill-head-main" id="skill_${key}_headline">${skill.name} - Lvl ${skill.level}</span>
                        <span class="skill-expand-hint">▸</span>
                    </div>
                    <div class="skill-bars-always">
                        <div class="prog-track skill-prog-mini"><div id="skill_${key}_exp_fill" class="prog-fill prog-fill-skill"></div></div>
                        <div class="prog-track skill-prog-mini"><div id="skill_${key}_talent_fill" class="prog-fill prog-fill-talent"></div></div>
                    </div>
                    <div class="skill-details">
                    <div class="skill-reward" id="skill_${key}_reward"></div>
                    <div class="skill-trigger" id="skill_${key}_trigger"></div>
                    <div class="skill-trigger" id="skill_${key}_tips_rarity"></div>
                    <div class="skill-exp-on-trigger" id="skill_${key}_exp_on_trigger"></div>
                    <div class="prog-label-row skill-exp-row">Skill exp: <span id="skill_${key}_exp_text"></span> <span class="skill-exp-mults" id="skill_${key}_exp_mults"></span></div>
                    <div class="prog-label-row">Talent: <span id="skill_${key}_talent_text"></span></div>
                    <div id="skill_${key}_star_effect_row" class="prog-label-row">Star effect: <span id="skill_${key}_star_effect"></span></div>
                    <div id="skill_${key}_tips_effect_row" class="prog-label-row">Tips effect: <span id="skill_${key}_tips_effect"></span></div>
                    <div id="skill_${key}_tips_row" class="prog-label-row">Tips: <span id="skill_${key}_tips_text"></span></div>
                    <div class="prog-label-row">Combined exp mult: <span id="skill_${key}_combined_mults"></span></div>
                    <div id="skill_${key}_stars_controls" class="skill-stars-controls">
                        <button id="skill_${key}_star_bronze" class="skill-star-btn skill-star-bronze" onclick="events.toggleSkillStar('${key}', 'bronze')">☆</button>
                        <button id="skill_${key}_star_silver" class="skill-star-btn skill-star-silver" onclick="events.toggleSkillStar('${key}', 'silver')">☆</button>
                        <button id="skill_${key}_star_gold" class="skill-star-btn skill-star-gold" onclick="events.toggleSkillStar('${key}', 'gold')">☆</button>
                    </div>
                    </div>
                </div>
            `;
        }
        skillsList.innerHTML = html;
        for (let i = 0; i < skillKeys.length; i++) {
            const key = skillKeys[i];
            createView.queueCache(
                `skill_${key}_headline`, `skill_${key}_reward`, `skill_${key}_trigger`, `skill_${key}_tips_rarity`, `skill_${key}_exp_on_trigger`,
                `skill_${key}_exp_mults`, `skill_${key}_exp_text`, `skill_${key}_exp_fill`,
                `skill_${key}_talent_text`, `skill_${key}_talent_fill`,
                `skill_${key}_star_effect_row`, `skill_${key}_star_effect`,
                `skill_${key}_tips_row`, `skill_${key}_tips_text`, `skill_${key}_tips_effect_row`, `skill_${key}_tips_effect`,
                `skill_${key}_combined_mults`, `skill_${key}_stars_controls`, `skill_${key}_star_bronze`, `skill_${key}_star_silver`, `skill_${key}_star_gold`
            );
        }
    },
    setStaticDimensions: function() {
        const battlefield = document.getElementById("battlefield");
        const battlefieldWrap = document.getElementById("battlefieldWrap");
        if (!battlefield || !battlefieldWrap || !gameData || !gameData.battle) {
            return;
        }
        const gd = gameData.battle;
        battlefieldWrap.style.width = "690px";
        battlefield.style.width = "100%";
        const innerH = gd.battlefieldHeightPx || 718;
        battlefield.style.height = `${innerH + 2}px`;
    },
    showCurrentTab: function() {
        const tabs = ["base", "leveling", "stats", "skills", "travel", "history", "options"];
        const requestedTab = data.battle.currentTab || "leveling";
        const tab = tabs.indexOf(requestedTab) >= 0 ? requestedTab : "leveling";
        if (tab !== requestedTab) {
            data.battle.currentTab = tab;
        }
        for (let i = 0; i < tabs.length; i++) {
            const pane = document.getElementById(`tabPane_${tabs[i]}`);
            if (pane) {
                pane.style.display = tabs[i] === tab ? "block" : "none";
            }
        }
    },

    setAllCaches: function() {
        //uses createView.queueCache("<element ID>") for elements created in index.html

        createView.queueCache(
            "mainLayout", "battlefieldWrap", "battlefield", "waveInfo", "attackLines", "playerStack", "playerToken", "playerMovePulse",
            "playerAttackBarFill", "playerAttackBarLabel", "playerRangedBarTrack", "playerRangedBarFill", "playerRangedBarLabel",
            "playerClassBarA", "playerClassBarALabel", "playerClassBarAFill", "playerClassBarB", "playerClassBarBLabel", "playerClassBarBFill",
            "playerLevelBarFill", "playerLevelBarLabel",
            "playerHpText", "deathOverlay", "deathTitle", "deathSummary", "deathTalentDetails", "menuContent", "menuColumn", "battleColumn", "tabButton_base", "tabButton_leveling", "tabButton_stats", "tabButton_skills", "tabButton_travel", "tabButton_history", "tabButton_options",
            "baseGoldText", "baseWorkersAssigned", "baseWorkersFound", "baseBuildingInfo",
            "base_resource_strip", "base_res_ore", "base_res_bar", "base_res_logs", "base_res_lumber", "base_chapel_upgrade_btn",
            "basePanel_chapel", "basePanel_mine", "basePanel_smith", "basePanel_inn", "basePanel_guild", "basePanel_library", "basePanel_lumbermill", "basePanel_sawmill", "basePanel_workshop", "basePanel_garden",
            "base_chapel_desc", "base_mine_row", "base_mine_hire_btn", "base_mine_assign_btn", "base_mine_unassign_btn", "base_mine_workers_label", "base_mine_manual_btn", "base_mine_cd_wrap", "base_mine_cd_fill", "base_mine_cd_text",
            "base_smith_row", "base_smith_hire_btn", "base_smith_assign_btn", "base_smith_unassign_btn", "base_smith_workers_label", "base_smith_manual_btn", "base_smith_cd_wrap", "base_smith_cd_fill", "base_smith_cd_text", "base_smith_attack_row", "base_smith_attack_btn", "base_smith_armor_row", "base_smith_armor_btn",
            "base_inn_open_btn", "base_inn_open_row", "base_inn_next_row", "base_inn_adv_btn", "base_inn_adv_cd_wrap", "base_inn_adv_cd_fill", "base_inn_adv_cd_text", "base_inn_empty",
            "base_guild_current", "base_guild_btn_buy_warrior", "base_guild_btn_switch_warrior", "base_guild_btn_buy_rogue", "base_guild_btn_switch_rogue", "base_guild_btn_buy_hunter", "base_guild_btn_switch_hunter",
            "base_library_empty", "base_library_workers_label", "base_library_desk_btn", "base_library_assign_btn", "base_library_unassign_btn",
            "base_lumbermill_row", "base_lumbermill_hire_btn", "base_lumbermill_assign_btn", "base_lumbermill_unassign_btn", "base_lumbermill_workers_label", "base_lumbermill_manual_btn", "base_lumbermill_cd_wrap", "base_lumbermill_cd_fill", "base_lumbermill_cd_text",
            "base_sawmill_row", "base_sawmill_hire_btn", "base_sawmill_assign_btn", "base_sawmill_unassign_btn", "base_sawmill_workers_label", "base_sawmill_manual_btn", "base_sawmill_cd_wrap", "base_sawmill_cd_fill", "base_sawmill_cd_text",
            "base_workshop_row", "base_workshop_room_btn", "base_workshop_bow_btn",
            "base_garden_row_inn", "base_garden_row_mine", "base_garden_row_smith", "base_garden_row_lumbermill", "base_garden_row_sawmill",
            "base_garden_btn_inn", "base_garden_btn_mine", "base_garden_btn_smith", "base_garden_btn_lumbermill", "base_garden_btn_sawmill", "base_garden_empty",
            "baseBuilding_chapel", "baseBuilding_smith", "baseBuilding_inn", "baseBuilding_guild", "baseBuilding_market", "baseBuilding_garden", "baseBuilding_workshop", "baseBuilding_mage_tower", "baseBuilding_mine", "baseBuilding_library", "baseBuilding_lumbermill", "baseBuilding_sawmill",
            "baseMineProgressWrap", "baseMineProgressFill", "baseSmithProgressWrap", "baseSmithProgressFill", "baseLumbermillProgressWrap", "baseLumbermillProgressFill", "baseSawmillProgressWrap", "baseSawmillProgressFill",
            "mapManualBtn_inn", "mapManualBtn_mine", "mapManualBtn_smith", "mapManualBtn_lumbermill", "mapManualBtn_sawmill",
            "levelText", "levelExpText", "levelTabExpFill", "attributePointsText", "strText", "conText", "spdText", "soulText", "currentClassText", "classPerLevelText", "attributePlanList", "statsHpText", "statsHpTip", "statsRegenText", "statsRegenTip", "statsAttackText", "statsAttackTip", "statsArmorText", "statsArmorTip", "statsMeleeText", "statsMeleeTip", "statsRangedText", "statsRangedTip",
            "travelMapsList", "skillsList", "historyList",
            "rangedAttackToggle", "rangedAttackWrap", "rangedAttackLockText", "hideMaxedUpgradesToggle", "disableCompactLayoutToggle", "skillSubTab_combat", "skillSubTab_town", "skillSubTab_class", "libraryTab_combat", "libraryTab_town", "libraryTab_class",
            "combatStarsInventory", "compactViewTabs", "compactPane_menus", "compactPane_battle"
        );
        const maps = data.progress.mapDefinitions || [];
        for (let mi = 0; mi < maps.length; mi++) {
            const mk = maps[mi].key;
            createView.queueCache(`travel_card_${mk}`, `mapButton_${mk}`, `mapDifficulty_${mk}`, `mapWaves_${mk}`, `mapTime_${mk}`, `mapStar_${mk}_bronze`, `mapStar_${mk}_silver`, `mapStar_${mk}_gold`, `mapWorkers_${mk}`);
        }
        for (let gi = 0; gi < 10; gi++) {
            createView.queueCache(`base_inn_guest_wrap_${gi}`, `base_inn_guest_name_${gi}`, `base_inn_guest_chat_${gi}`, `base_inn_guest_fill_${gi}`);
        }
        for (let si = 0; si < skills.keysInOrder.length; si++) {
            const sk = skills.keysInOrder[si];
            createView.queueCache(`base_library_row_${sk}`, `base_library_name_${sk}`, `base_library_desc_${sk}`, `base_library_progress_${sk}`, `base_library_btn_${sk}`, `base_library_pause_${sk}`);
        }
        createView.clearCacheQueue();
        createView.updateLayoutMeasurements();
    },
    syncBattlefieldLayoutFromDom: function() {
        if (!gameData || !gameData.battle) {
            return;
        }
        const gd = gameData.battle;
        viewData.layout.battlefieldWidthPx = gd.battlefieldWidthPx || 688;
        viewData.layout.battlefieldHeightPx = gd.battlefieldHeightPx || 718;
        const bh = viewData.layout.battlefieldHeightPx;
        if (gd.playerMeleeLineYPx !== null && gd.playerMeleeLineYPx !== undefined) {
            viewData.layout.playerTopPx = gd.playerMeleeLineYPx;
        } else {
            const fromBottom = gd.playerMeleeOffsetFromBottomPx !== undefined ? gd.playerMeleeOffsetFromBottomPx : 182;
            viewData.layout.playerTopPx = Math.max(0, bh - fromBottom);
        }
    },
    updateLayoutMeasurements: function() {
        createView.syncBattlefieldLayoutFromDom();
        const battlefield = viewData.cached.battlefield;
        if (!battlefield) {
            return;
        }
        const menuCol = viewData.cached.menuColumn;
        const battleCol = viewData.cached.battleColumn;
        if (menuCol && battleCol) {
            if (battleCol.style.display !== "none") {
                menuCol.style.maxHeight = `${battleCol.offsetHeight}px`;
            } else {
                menuCol.style.maxHeight = "";
            }
        }
    },
    clearCacheQueue: function() {
        for(let id of idsToCache) {
            viewData.cached[id] = document.getElementById(id);
        }
        idsToCache = [];
    },
    queueCache: function() {
        Array.prototype.push.apply(idsToCache, arguments);
    }
}