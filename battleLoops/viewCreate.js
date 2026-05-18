
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
        const mapsPane = document.getElementById("travelPane_maps");
        const chPane = document.getElementById("travelPane_challenges");
        const maps = data.progress.mapDefinitions;
        let htmlMaps = "";
        let htmlCh = "";
        for (let i = 0; i < maps.length; i++) {
            const m = maps[i];
            const classReq = m.requiredClassKey ? ` · ${m.requiredClassKey.charAt(0).toUpperCase() + m.requiredClassKey.slice(1)} only` : "";
            const cardHtml = `
                <div class="travel-card" id="travel_card_${m.key}">
                    <div class="travel-card-head">
                        <div class="travel-map-name"><span class="travel-map-stars-inline"><span id="mapStar_${m.key}_bronze" class="skill-star-btn skill-star-bronze">☆</span><span id="mapStar_${m.key}_silver" class="skill-star-btn skill-star-silver">☆</span><span id="mapStar_${m.key}_gold" class="skill-star-btn skill-star-gold">☆</span></span> ${m.name}<span class="muted-text">${classReq}</span></div>
                        <div class="row-buttons travel-map-actions">
                            <button id="mapButton_${m.key}" class="tab-button" onclick="events.changeMap('${m.key}')">Clear the Grounds</button>
                            ${m.requiredClassKey ? "" : `<button id="mapSmartHarvestStart_${m.key}" class="tab-button" onclick="events.startHarvestCountdownAndForage('${m.key}')" style="display:none">Start harvest</button><button id="mapHarvestButton_${m.key}" class="tab-button" onclick="events.startHarvest('${m.key}')" style="display:none">Harvest Resources</button>`}
                            <span id="mapActionCurrent_${m.key}" class="travel-map-current-label muted-text" style="display:none">Current</span>
                        </div>
                    </div>
                    <div id="mapShardSummary_${m.key}" class="travel-map-shards muted-text" style="display:none"></div>
                    <div class="travel-map-meta">
                        <div>Difficulty: <span id="mapDifficulty_${m.key}"></span></div>
                        <div># Waves: <span id="mapWaves_${m.key}"></span></div>
                        <div>Time for Last Spawn: <span id="mapTime_${m.key}"></span></div>
                        <div>Workers Rescued: <span id="mapWorkers_${m.key}"></span></div>
                    </div>
                    <div class="muted-text">${m.description || ""}</div>
                    <div class="base-row">Intruders Cleared: <span id="mapClearStatus_${m.key}">0%</span></div>
                    <div class="prog-track skill-prog-mini travel-map-clear-fill"><div id="mapClearFill_${m.key}" class="prog-fill prog-fill-skill"></div></div>
                </div>
            `;
            if (m.requiredClassKey) {
                htmlCh += cardHtml;
            } else {
                htmlMaps += cardHtml;
            }
        }
        mapsPane.innerHTML = htmlMaps;
        chPane.innerHTML = htmlCh;
    },
    createBaseInfoElements: function() {
        const root = document.getElementById("baseBuildingInfo");
        const td = townData.buildings;
        let skillRowsHtml = "";
        for (let i = 0; i < skills.keysInOrder.length; i++) {
            const k = skills.keysInOrder[i];
            const nm = data.progress.skills[k] ? data.progress.skills[k].name : k;
            const classKey = (skills._byKey[k] && skills._byKey[k].classKey) ? skills._byKey[k].classKey : "";
            const className = classKey ? (classKey.charAt(0).toUpperCase() + classKey.slice(1)) : "";
            const classNote = className ? ` - ${className}` : "";
            skillRowsHtml += `<div id="base_library_row_${k}" class="base-library-row base-upgrade-row"><div class="base-upgrade-text"><div id="base_library_name_${k}" class="base-upgrade-name">${nm}${classNote}</div><div id="base_library_desc_${k}" class="muted-text base-skill-short">${skills.getSkillShortDescription(k)}</div><div id="base_library_progress_${k}" class="muted-text"></div></div><div class="base-upgrade-actions"><button id="base_library_btn_${k}" class="tab-button" onclick="events.buyLibrarySkill('${k}')">Buy for</button><button id="base_library_pause_${k}" class="tab-button" onclick="events.toggleLibraryResearchPause('${k}')">Pause</button></div></div>`;
        }
        let guestRowsHtml = "";
        for (let gi = 0; gi < 10; gi++) {
            guestRowsHtml += `<div id="base_inn_guest_wrap_${gi}" class="base-guest-wrap"><div class="base-guest-row"><div id="base_inn_guest_name_${gi}"></div><button id="base_inn_guest_chat_${gi}" class="tab-button">Chat</button></div><div class="base-mini-progress base-guest-progress"><div id="base_inn_guest_fill_${gi}" class="base-mini-progress-fill"></div></div></div>`;
        }

        const makePanelShell = function(key, titleText, innerHtml) {
            return `<div id="basePanel_${key}" class="base-info-section"><div class="base-info-title">${titleText}</div>${innerHtml}</div>`;
        };

        const htmlStaticPanelDescription = function(buildingKey, text) {
            if (!text) {
                return "";
            }
            return `<div id="base_${buildingKey}_desc" class="base-row">${text}</div>`;
        };

        const upgradePurchaseRowHtml = function(panelScope, upgradePropKey, u) {
            const slug = townData.slug(u);
            const wc = u.wrapClass ? ` ${u.wrapClass}` : "";
            const rowId = townData.idRow(panelScope, slug);
            const btnId = townData.idBtn(panelScope, slug);
            const extraId = townData.idExtra(panelScope, slug);
            const name = u.name || "";
            const desc = u.description || "";
            return `<div id="${rowId}" class="base-library-row base-upgrade-row${wc}"><div class="base-upgrade-text"><div class="base-upgrade-name">${name}</div><div class="muted-text base-skill-short">${desc}</div><div id="${extraId}" class="muted-text"></div></div><button id="${btnId}" class="tab-button" onclick="events.buyUpgrade('${panelScope}','${upgradePropKey}')">Buy for</button></div>`;
        };

        const htmlOrderedUpgradeKeys = function(bcfg, panelScope, keys) {
            let h = "";
            for (let oi = 0; oi < keys.length; oi++) {
                const pk = keys[oi];
                const ud = bcfg.upgrades[pk];
                if (ud) {
                    h += upgradePurchaseRowHtml(panelScope, pk, ud);
                }
            }
            return h;
        };

        const htmlWorkerBlock = function(buildingKey, w, extraAfterWorkers) {
            const rowId = `base_${buildingKey}_row`;
            const p = `'${buildingKey}'`;
            const gk = w.gearKey || "gear";
            const gearUp = townData.buildings[buildingKey] && townData.buildings[buildingKey].upgrades && townData.buildings[buildingKey].upgrades[gk];
            const gslug = gearUp && gearUp.key ? gearUp.key : "gear";
            const gearExtraId = townData.idExtra(buildingKey, gslug);
            const gearBtnId = townData.idBtn(buildingKey, gslug);
            const workerPowerRow = (townData.workerPowerSiteKeys || []).indexOf(buildingKey) >= 0
                ? `<div class="base-row base-worker-power-row"><span id="base_${buildingKey}_worker_prod_text" class="muted-text"></span><div id="base_${buildingKey}_worker_prod_wrap" class="prog-track skill-prog-mini"><div id="base_${buildingKey}_worker_prog_fill" class="prog-fill prog-fill-skill"></div></div></div>`
                : "";
            return `
                <div id="${rowId}" class="base-row"></div>
                <div class="base-library-row base-upgrade-row">
                    <div class="base-upgrade-text">
                        <div class="base-upgrade-name">${w.gearName}</div>
                        <div class="muted-text base-skill-short">${w.gearDescription}</div>
                        <div id="${gearExtraId}" class="muted-text"></div>
                    </div>
                    <button id="${gearBtnId}" class="tab-button" onclick="events.buyUpgrade('${buildingKey}','${gk}')">Buy for</button>
                </div>
                <div class="base-worker-assign-row"><button id="base_${buildingKey}_unassign_all_btn" class="tab-button" onclick="events.adjustWorkers(${p}, 'all_dec')"><<</button><button id="base_${buildingKey}_unassign_ten_btn" class="tab-button" onclick="events.adjustWorkers(${p}, 'ten_dec')">--</button><button id="base_${buildingKey}_unassign_one_btn" class="tab-button" onclick="events.adjustWorkers(${p}, 'one_dec')">-</button><span class="base-worker-cap-label">Assign Workers</span><button id="base_${buildingKey}_assign_one_btn" class="tab-button" onclick="events.adjustWorkers(${p}, 'one_inc')">+</button><button id="base_${buildingKey}_assign_ten_btn" class="tab-button" onclick="events.adjustWorkers(${p}, 'ten_inc')">++</button><button id="base_${buildingKey}_assign_all_btn" class="tab-button" onclick="events.adjustWorkers(${p}, 'all_inc')">>></button><span id="base_${buildingKey}_workers_label" class="base-worker-cap-label muted-text"></span></div>
                <button id="${w.manualBtnId}" class="tab-button base-manual-btn" onclick="${w.manualOnclick}">${w.manualLabel}<div id="${w.manualCdWrapId}" class="base-mini-progress base-manual-cd"><div id="${w.manualCdFillId}" class="base-mini-progress-fill"></div></div></button>
                <div id="${w.manualCdTextId}" class="muted-text"></div>
                ${workerPowerRow}
                ${extraAfterWorkers || ""}
            `;
        };

        const htmlTownHallUnlockRows = function() {
            let h = "";
            for (let ui = 0; ui < townData.townhallUnlockOrder.length; ui++) {
                const k = townData.townhallUnlockOrder[ui];
                const defMeta = townData.townhallUnlockDefs[k];
                const desc = defMeta && defMeta.description ? defMeta.description : "";
                const label = defMeta && defMeta.label ? defMeta.label : k;
                const rowId = townData.idRow("townhall", k);
                const btnId = townData.idBtn("townhall", k);
                h += `<div id="${rowId}" class="base-library-row base-upgrade-row"><div class="base-upgrade-text"><div class="base-upgrade-name">${label}</div><div class="muted-text base-skill-short">${desc}</div><div id="base_townhall_extra_${k}" class="muted-text"></div></div><button id="${btnId}" class="tab-button" onclick="events.buyUpgrade('townhallUnlock','${k}')">Buy for</button></div>`;
            }
            return h;
        };

        const htmlGuildClassRows = function() {
            let h = "";
            for (let ci = 0; ci < townData.guildClasses.length; ci++) {
                const ck = townData.guildClasses[ci];
                const d = initialize.getClassDef(ck);
                const rowId = townData.idRow("guild", ck);
                h += `<div id="${rowId}" class="base-library-row base-upgrade-row"><div class="base-upgrade-text"><div class="base-upgrade-name">${d.name}</div><div class="muted-text base-skill-short">+${d.perLevel.str} Str, +${d.perLevel.con} Con, +${d.perLevel.spd} Spd per level</div><div id="base_guild_extra_${ck}" class="muted-text"></div></div><div class="base-upgrade-actions"><button id="${townData.guildBuyBtn(ck)}" class="tab-button" onclick="events.buyUpgrade('guild','${ck}')">Buy</button><button id="${townData.guildSwitchBtn(ck)}" class="tab-button" onclick="events.queueClassSwitch('${ck}')">Switch</button></div></div>`;
            }
            return h;
        };

        const htmlGardenManualRows = function() {
            const gcfg = townData.buildings.garden;
            return htmlOrderedUpgradeKeys(gcfg, "garden", gcfg.upgradesOrder);
        };

        const htmlLibraryDeskOnly = function(libCfg) {
            return upgradePurchaseRowHtml("library", "researchDesk", libCfg.upgrades.researchDesk);
        };

        const buildBuildingPanel = function(buildingKey) {
            const titleText = townData.baseBuildingDisplayNames[buildingKey] || buildingKey;
            const cfg = td[buildingKey];
            if (buildingKey === "market" || buildingKey === "mage_tower") {
                return makePanelShell(buildingKey, titleText, `<div class="base-row muted-text">${cfg.mutedPlaceholder}</div>`);
            }
            if (!cfg) {
                return "";
            }
            if (buildingKey === "chapel") {
                const ccfg = td.chapel;
                return makePanelShell(buildingKey, titleText,
                    htmlStaticPanelDescription(buildingKey, ccfg.description) + htmlOrderedUpgradeKeys(ccfg, buildingKey, ccfg.upgradesOrder));
            }
            if (buildingKey === "townhall") {
                const tcfg = td.townhall;
                const hireRow = htmlOrderedUpgradeKeys(tcfg, buildingKey, tcfg.upgradesOrder);
                return makePanelShell(buildingKey, titleText,
                    htmlStaticPanelDescription(buildingKey, tcfg.description)
                    + `<div class="row-buttons"><button id="townhallTab_buildings" class="tab-button" onclick="events.switchTownHallTab('buildings')">Buildings</button><button id="townhallTab_town_upgrades" class="tab-button" onclick="events.switchTownHallTab('town_upgrades')">Town Upgrades</button></div>`
                    + `<div id="base_townhall_buildings_wrap">${htmlTownHallUnlockRows()}</div>`
                    + `<div id="base_townhall_upgrades_wrap">${hireRow}</div>`);
            }
            if (cfg.workers && buildingKey === "smith") {
                const after = htmlOrderedUpgradeKeys(cfg, buildingKey, cfg.upgradesAfterWorkersOrder);
                return makePanelShell(buildingKey, titleText, htmlWorkerBlock(buildingKey, cfg.workers, after));
            }
            if (cfg.workers) {
                return makePanelShell(buildingKey, titleText, htmlWorkerBlock(buildingKey, cfg.workers, ""));
            }
            if (buildingKey === "inn") {
                const icfg = td.inn;
                const adv = icfg.advertiseAction;
                return makePanelShell(buildingKey, titleText,
                    htmlOrderedUpgradeKeys(icfg, buildingKey, icfg.upgradesOrder)
                    + `<div id="${icfg.statusRowIds.openActive}" class="base-row"></div><div id="${icfg.statusRowIds.nextGuest}" class="base-row"></div>`
                    + `<button id="${adv.btnId}" class="tab-button base-manual-btn" onclick="${adv.onclick}">${adv.label}<div id="${adv.cdWrapId}" class="base-mini-progress base-manual-cd"><div id="${adv.cdFillId}" class="base-mini-progress-fill"></div></div></button>`
                    + `<div id="${adv.cdTextId}" class="muted-text"></div><div id="${icfg.emptyGuestsId}" class="muted-text">${icfg.emptyGuestsText}</div>${guestRowsHtml}`);
            }
            if (buildingKey === "guild") {
                return makePanelShell(buildingKey, titleText, `<div id="${cfg.currentStatusRowId}" class="base-row"></div>${htmlGuildClassRows()}`);
            }
            if (buildingKey === "library") {
                const libCfg = td.library;
                return makePanelShell(buildingKey, titleText,
                    htmlLibraryDeskOnly(libCfg)
                    + `<div class="base-worker-assign-row"><button id="base_library_unassign_all_btn" class="tab-button" onclick="events.adjustWorkers('library', 'all_dec')"><<</button><button id="base_library_unassign_ten_btn" class="tab-button" onclick="events.adjustWorkers('library', 'ten_dec')">--</button><button id="base_library_unassign_one_btn" class="tab-button" onclick="events.adjustWorkers('library', 'one_dec')">-</button><span class="base-worker-cap-label">Assign Workers</span><button id="base_library_assign_one_btn" class="tab-button" onclick="events.adjustWorkers('library', 'one_inc')">+</button><button id="base_library_assign_ten_btn" class="tab-button" onclick="events.adjustWorkers('library', 'ten_inc')">++</button><button id="base_library_assign_all_btn" class="tab-button" onclick="events.adjustWorkers('library', 'all_inc')">>></button><span id="base_library_workers_label" class="base-worker-cap-label muted-text"></span></div>`
                    + `<div id="base_library_queue_note" class="base-row muted-text">${libCfg.queueNote}</div>`
                    + `<div class="row-buttons"><button id="libraryTab_combat" class="tab-button" onclick="events.switchLibraryTab('combat')">Combat</button><button id="libraryTab_town" class="tab-button" onclick="events.switchLibraryTab('town')">Town</button><button id="libraryTab_foraging" class="tab-button" onclick="events.switchLibraryTab('foraging')">Foraging</button><button id="libraryTab_class" class="tab-button" onclick="events.switchLibraryTab('class')">Class</button></div>`
                    + `<div id="${libCfg.emptySkillsId}" class="muted-text">${libCfg.emptySkillsText}</div>${skillRowsHtml}`);
            }
            if (buildingKey === "workshop") {
                return makePanelShell(buildingKey, titleText, htmlOrderedUpgradeKeys(td.workshop, buildingKey, td.workshop.upgradesOrder));
            }
            if (buildingKey === "garden") {
                const gcfg = td.garden;
                return makePanelShell(buildingKey, titleText,
                    `<div class="base-row muted-text">${gcfg.introMuted}</div>${htmlGardenManualRows()}<div id="${gcfg.emptyPlaceholderId}" class="muted-text">${gcfg.emptyPlaceholderText}</div>`);
            }
            return "";
        };

        let panelsHtml = "";
        const panelOrder = townData.baseBuildingOrder.slice();
        for (let pi = 0; pi < panelOrder.length; pi++) {
            panelsHtml += buildBuildingPanel(panelOrder[pi]);
        }

        root.innerHTML = `
            <div id="base_resource_strip" class="base-resource-strip">
                <span>Clay <span id="base_res_stone"></span></span>
                <span>Ore <span id="base_res_ore"></span></span>
                <span>Logs <span id="base_res_logs"></span></span>
                <span>|</span>
                <span>Bricks <span id="base_res_bricks"></span></span>
                <span>Bars <span id="base_res_bar"></span></span>
                <span>Lumber <span id="base_res_lumber"></span></span>
            </div>
            ${panelsHtml}
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
        events.showSelectedBaseBuildingPanels(data.progress.selectedBaseBuilding || "chapel");
    },
    /** One-time on load: 40% skill rows + 60% Skill Info panel. Visibility via view.updateSkillsListVisibility. */
    createSkillElements: function() {
        const skillsList = document.getElementById("skillsList");
        const innUnlockedFromTownHall = !!(data.progress.base && data.progress.base.townhall && data.progress.base.townhall.unlocks && data.progress.base.townhall.unlocks.inn);
        const tipsRowHiddenStyle = innUnlockedFromTownHall ? "" : " style=\"display:none\"";
        let col = `<div id="skillsListColumn" class="skills-list-column"><div id="skillsListEmpty" class="muted-text skills-list-empty" style="display:none"></div>`;
        for (let i = 0; i < skills.keysInOrder.length; i++) {
            const key = skills.keysInOrder[i];
            const skill = data.progress.skills[key];
            col += `
                <div class="skill-row skill-block" id="skill_wrap_${key}" data-skill-key="${key}" onclick="events.selectSkillForDetail('${key}', event)">
                    <div class="skill-row-head">
                        <div class="skill-row-head-left">
                            <div class="skill-row-name" id="skill_${key}_name">${skill.name}</div>
                            <div class="skill-row-lvl-talent" id="skill_${key}_lvl_talent">Lvl ${skill.level} · Talent ${skill.talentLevel}</div>
                        </div>
                        <div id="skill_${key}_stars_controls" class="skill-stars-controls skill-stars-row-compact skill-row-stars-right" onclick="event.stopPropagation()">
                            <button id="skill_${key}_star_bronze" class="skill-star-btn skill-panel-star-btn skill-star-bronze" onclick="events.toggleSkillStar('${key}', 'bronze')">☆</button>
                            <button id="skill_${key}_star_silver" class="skill-star-btn skill-panel-star-btn skill-star-silver" onclick="events.toggleSkillStar('${key}', 'silver')">☆</button>
                            <button id="skill_${key}_star_gold" class="skill-star-btn skill-panel-star-btn skill-star-gold" onclick="events.toggleSkillStar('${key}', 'gold')">☆</button>
                        </div>
                    </div>
                    <div class="skill-row-bars">
                        <div class="prog-track skill-prog-mini skill-prog-row-full"><div id="skill_${key}_exp_fill" class="prog-fill prog-fill-skill"></div></div>
                        <div class="prog-track skill-prog-mini skill-prog-row-full"><div id="skill_${key}_talent_fill" class="prog-fill prog-fill-talent"></div></div>
                    </div>
                </div>
            `;
        }
        col += `</div>`;
        const aside = `
            <aside id="skillInfoPanel" class="skill-info-aside">
                <div id="skillInfo_title" class="skill-info-title"></div>
                <div class="skill-current-wrap" id="skillInfo_current_wrap"><div id="skillInfo_current" class="skill-current muted-text"></div></div>
                <div class="skill-reward" id="skillInfo_reward"></div>
                <div class="skill-trigger" id="skillInfo_trigger"></div>
                <div class="skill-trigger" id="skillInfo_tips_rarity"></div>
                <div class="skill-exp-on-trigger" id="skillInfo_exp_on_trigger"></div>
                <div class="prog-label-row skill-exp-row">Skill exp: <span id="skillInfo_exp_text"></span> <span class="skill-exp-mults" id="skillInfo_exp_mults"></span></div>
                <div class="prog-track skill-prog-mini skill-info-prog"><div id="skillInfo_exp_fill" class="prog-fill prog-fill-skill"></div></div>
                <div class="prog-label-row">Talent: <span id="skillInfo_talent_text"></span></div>
                <div class="prog-track skill-prog-mini skill-info-prog"><div id="skillInfo_talent_fill" class="prog-fill prog-fill-talent"></div></div>
                <div id="skillInfo_star_effect_row" class="prog-label-row">Star effect: <span id="skillInfo_star_effect"></span></div>
                <div id="skillInfo_tips_row" class="prog-label-row skill-exp-row"${tipsRowHiddenStyle}>Tips: <span id="skillInfo_tips_text"></span> <span class="skill-exp-mults" id="skillInfo_tips_mults"></span></div>
                <div class="prog-label-row">Combined exp mult: <span id="skillInfo_combined_mults"></span></div>
                <div id="skillInfo_integration_row" class="prog-label-row" style="display:none">Integration mult: <span id="skillInfo_integration_mult"></span></div>
                <div id="skillInfo_flavor" class="skill-info-flavor"></div>
            </aside>
        `;
        skillsList.className = "skills-tab-layout";
        skillsList.innerHTML = col + aside;
        createView.queueCache(
            "skillsListColumn", "skillsListEmpty", "skillInfoPanel",
            "skillInfo_title", "skillInfo_current_wrap", "skillInfo_current", "skillInfo_reward", "skillInfo_trigger", "skillInfo_tips_rarity", "skillInfo_exp_on_trigger",
            "skillInfo_exp_text", "skillInfo_exp_mults", "skillInfo_exp_fill",
            "skillInfo_talent_text", "skillInfo_talent_fill",
            "skillInfo_star_effect_row", "skillInfo_star_effect",
            "skillInfo_tips_row", "skillInfo_tips_text", "skillInfo_tips_mults",
            "skillInfo_combined_mults", "skillInfo_integration_row", "skillInfo_integration_mult", "skillInfo_flavor"
        );
        for (let i = 0; i < skills.keysInOrder.length; i++) {
            const key = skills.keysInOrder[i];
            createView.queueCache(
                `skill_wrap_${key}`,
                `skill_${key}_name`, `skill_${key}_lvl_talent`,
                `skill_${key}_exp_fill`, `skill_${key}_talent_fill`,
                `skill_${key}_stars_controls`, `skill_${key}_star_bronze`, `skill_${key}_star_silver`, `skill_${key}_star_gold`
            );
        }
    },
    setStaticDimensions: function() {
        const battlefield = document.getElementById("battlefield");
        const battlefieldWrap = document.getElementById("battlefieldWrap");
        const gd = gameData.battle;
        battlefieldWrap.style.width = "690px";
        battlefield.style.width = "100%";
        const innerH = gd.battlefieldHeightPx;
        battlefield.style.height = `${innerH + 2}px`;
    },
    showCurrentTab: function() {
        const allTabs = ["base", "leveling", "stats", "skills", "travel", "history", "options"];
        const tabs = events.mainMenuTabOrder();
        const requestedTab = data.battle.currentTab || "base";
        const tab = tabs.indexOf(requestedTab) >= 0 ? requestedTab : "base";
        if (tab !== requestedTab) {
            data.battle.currentTab = tab;
        }
        for (let i = 0; i < allTabs.length; i++) {
            const key = allTabs[i];
            const pane = document.getElementById(`tabPane_${key}`);
            const shouldShow = (tabs.indexOf(key) >= 0) && key === tab;
            pane.style.display = shouldShow ? "block" : "none";
        }
    },

    setAllCaches: function() {
        //uses createView.queueCache("<element ID>") for elements created in index.html

        createView.queueCache(
            "mainLayout", "battlefieldWrap", "battlefield", "battleEndRunBtn", "waveInfo", "rangeMarkers", "attackLines", "playerStack", "playerToken", "playerTokenHpLayer", "playerStatHpLine", "playerStatDmgLine", "playerMovePulse",
            "playerAttackBarFill", "playerAttackBarLabel", "playerSandalBarTrack", "playerSandalBarFill", "playerSandalBarLabel",
            "playerClassBarA", "playerClassBarALabel", "playerClassBarAFill", "playerClassBarB", "playerClassBarBLabel", "playerClassBarBFill",
            "playerLevelBar", "playerLevelBarFill", "playerLevelBarLabel",
            "playerBattleHudSecondary", "deathOverlay", "deathTitle", "deathSummary", "deathTalentDetails", "menuContent", "menuColumn", "battleColumn", "tabButton_base", "tabButton_leveling", "tabButton_stats", "tabButton_skills", "tabButton_travel", "tabButton_history", "tabButton_options",
            "baseGoldText", "baseWorkersAssigned", "baseWorkersFound", "baseBuildingInfo",
            "base_resource_strip", "base_res_ore", "base_res_stone", "base_res_logs", "base_res_bar", "base_res_bricks", "base_res_lumber",
            "base_chapel_retry_row", "base_chapel_retry_btn", "base_chapel_retry_extra",
            "base_chapel_growth_row", "base_chapel_growth_btn", "base_chapel_growth_extra",
            "base_chapel_planned_row", "base_chapel_planned_btn", "base_chapel_planned_extra",
            "basePanel_chapel", "basePanel_townhall", "basePanel_mine", "basePanel_smith", "basePanel_inn", "basePanel_guild", "basePanel_market", "basePanel_mage_tower", "basePanel_library", "basePanel_claypit", "basePanel_kiln", "basePanel_lumbermill", "basePanel_workshop", "basePanel_garden",
            "base_townhall_desc", "townhallTab_buildings", "townhallTab_town_upgrades", "base_townhall_buildings_wrap", "base_townhall_upgrades_wrap",
            "base_townhall_hire_row", "base_townhall_hire_btn", "base_townhall_hire_extra",
            "base_chapel_desc", "base_mine_row", "base_mine_gear_btn", "base_mine_gear_extra", "base_mine_assign_one_btn", "base_mine_assign_ten_btn", "base_mine_assign_all_btn", "base_mine_unassign_one_btn", "base_mine_unassign_ten_btn", "base_mine_unassign_all_btn", "base_mine_workers_label", "base_mine_manual_btn", "base_mine_cd_wrap", "base_mine_cd_fill", "base_mine_cd_text",
            "base_smith_row", "base_smith_gear_btn", "base_smith_gear_extra", "base_smith_assign_one_btn", "base_smith_assign_ten_btn", "base_smith_assign_all_btn", "base_smith_unassign_one_btn", "base_smith_unassign_ten_btn", "base_smith_unassign_all_btn", "base_smith_workers_label", "base_smith_manual_btn", "base_smith_cd_wrap", "base_smith_cd_fill", "base_smith_cd_text",
            "base_smith_attack_row", "base_smith_attack_btn", "base_smith_attack_extra", "base_smith_armor_row", "base_smith_armor_btn", "base_smith_armor_extra",
            "base_inn_openGuests_row", "base_inn_openGuests_btn", "base_inn_openGuests_extra", "base_inn_open_row", "base_inn_next_row", "base_inn_adv_btn", "base_inn_adv_cd_wrap", "base_inn_adv_cd_fill", "base_inn_adv_cd_text", "base_inn_empty",
            "base_guild_current",
            "base_guild_extra_warrior", "base_guild_extra_rogue", "base_guild_extra_hunter",
            "base_guild_warrior_row", "base_guild_rogue_row", "base_guild_hunter_row",
            "base_guild_warrior_buy_btn", "base_guild_warrior_switch_btn", "base_guild_rogue_buy_btn", "base_guild_rogue_switch_btn", "base_guild_hunter_buy_btn", "base_guild_hunter_switch_btn",
            "base_library_empty", "base_library_workers_label", "base_library_desk_row", "base_library_desk_btn", "base_library_desk_extra",
            "base_library_assign_one_btn", "base_library_assign_ten_btn", "base_library_assign_all_btn", "base_library_unassign_one_btn", "base_library_unassign_ten_btn", "base_library_unassign_all_btn",
            "base_claypit_row", "base_claypit_gear_btn", "base_claypit_gear_extra", "base_claypit_assign_one_btn", "base_claypit_assign_ten_btn", "base_claypit_assign_all_btn", "base_claypit_unassign_one_btn", "base_claypit_unassign_ten_btn", "base_claypit_unassign_all_btn", "base_claypit_workers_label", "base_claypit_manual_btn", "base_claypit_cd_wrap", "base_claypit_cd_fill", "base_claypit_cd_text",
            "base_kiln_row", "base_kiln_gear_btn", "base_kiln_gear_extra", "base_kiln_assign_one_btn", "base_kiln_assign_ten_btn", "base_kiln_assign_all_btn", "base_kiln_unassign_one_btn", "base_kiln_unassign_ten_btn", "base_kiln_unassign_all_btn", "base_kiln_workers_label", "base_kiln_manual_btn", "base_kiln_cd_wrap", "base_kiln_cd_fill", "base_kiln_cd_text",
            "base_lumbermill_row", "base_lumbermill_gear_btn", "base_lumbermill_gear_extra", "base_lumbermill_assign_one_btn", "base_lumbermill_assign_ten_btn", "base_lumbermill_assign_all_btn", "base_lumbermill_unassign_one_btn", "base_lumbermill_unassign_ten_btn", "base_lumbermill_unassign_all_btn", "base_lumbermill_workers_label", "base_lumbermill_manual_btn", "base_lumbermill_cd_wrap", "base_lumbermill_cd_fill", "base_lumbermill_cd_text",
            "base_workshop_room_row", "base_workshop_room_btn", "base_workshop_room_extra",
            "base_workshop_sandal_row", "base_workshop_sandal_btn", "base_workshop_sandal_extra",
            "base_garden_smartHarvest_row", "base_garden_smartHarvest_btn", "base_garden_smartHarvest_extra",
            "base_garden_inn_row", "base_garden_inn_btn", "base_garden_inn_extra", "base_garden_mine_row", "base_garden_mine_btn", "base_garden_mine_extra",
            "base_garden_smith_row", "base_garden_smith_btn", "base_garden_smith_extra",
            "base_garden_claypit_row", "base_garden_claypit_btn", "base_garden_claypit_extra",
            "base_garden_kiln_row", "base_garden_kiln_btn", "base_garden_kiln_extra", "base_garden_empty",
            "baseBuilding_chapel", "baseBuilding_townhall", "baseBuilding_smith", "baseBuilding_inn", "baseBuilding_guild", "baseBuilding_market", "baseBuilding_garden", "baseBuilding_workshop", "baseBuilding_mage_tower", "baseBuilding_mine", "baseBuilding_library", "baseBuilding_claypit", "baseBuilding_kiln", "baseBuilding_lumbermill",
            "baseMineProgressWrap", "baseMineProgressFill", "base_mine_map_prod_rate", "base_mine_worker_prod_text", "base_mine_worker_prod_wrap", "base_mine_worker_prog_fill",
            "baseSmithProgressWrap", "baseSmithProgressFill", "base_smith_map_prod_rate", "base_smith_worker_prod_text", "base_smith_worker_prod_wrap", "base_smith_worker_prog_fill",
            "baseClaypitProgressWrap", "baseClaypitProgressFill", "base_claypit_map_prod_rate", "base_claypit_worker_prod_text", "base_claypit_worker_prod_wrap", "base_claypit_worker_prog_fill",
            "baseKilnProgressWrap", "baseKilnProgressFill", "base_kiln_map_prod_rate", "base_kiln_worker_prod_text", "base_kiln_worker_prod_wrap", "base_kiln_worker_prog_fill",
            "baseLibraryProgressWrap", "baseLibraryProgressFill",
            "mapManualBtn_inn", "mapManualBtn_mine", "mapManualBtn_smith", "mapManualBtn_claypit", "mapManualBtn_kiln",
            "levelText", "levelExpText", "levelTabExpFill", "attributePointsText", "strText", "conText", "spdText", "soulText", "currentClassText", "classPerLevelText", "attributePlanList", "levelingPointsWrap", "levelingAssignButtons", "attributePlanTitle", "statsHpText", "statsHpTip", "statsRegenText", "statsRegenTip", "statsAttackText", "statsAttackTip", "statsArmorText", "statsArmorTip", "statsSlapText", "statsSlapTip", "statsSandalText", "statsSandalTip",
            "travelPane_maps", "travelPane_challenges", "travelSubTab_maps", "travelSubTab_challenges", "skillsList", "historyList",
            "sandalAttackToggle", "sandalAttackWrap", "sandalAttackLockText", "manualSaveButton", "hideMaxedUpgradesToggle", "disableCompactLayoutToggle", "skillSubTab_combat", "skillSubTab_town", "skillSubTab_foraging", "skillSubTab_class", "libraryTab_combat", "libraryTab_town", "libraryTab_foraging", "libraryTab_class",
            "combatStarsInventory", "compactViewTabs", "compactPane_menus", "compactPane_battle"
        );
        const maps = data.progress.mapDefinitions;
        for (let mi = 0; mi < maps.length; mi++) {
            const m = maps[mi];
            const mk = m.key;
            createView.queueCache(`travel_card_${mk}`, `mapButton_${mk}`, `mapActionCurrent_${mk}`, `mapShardSummary_${mk}`, `mapDifficulty_${mk}`, `mapWaves_${mk}`, `mapTime_${mk}`, `mapStar_${mk}_bronze`, `mapStar_${mk}_silver`, `mapStar_${mk}_gold`, `mapWorkers_${mk}`, `mapClearStatus_${mk}`, `mapClearFill_${mk}`);
            /* Class-only maps omit harvest / smart-harvest controls in HTML - do not queue those ids. */
            if (!m.requiredClassKey) {
                createView.queueCache(`mapSmartHarvestStart_${mk}`, `mapHarvestButton_${mk}`);
            }
        }
        for (let gi = 0; gi < 10; gi++) {
            createView.queueCache(`base_inn_guest_wrap_${gi}`, `base_inn_guest_name_${gi}`, `base_inn_guest_chat_${gi}`, `base_inn_guest_fill_${gi}`);
        }
        for (let si = 0; si < skills.keysInOrder.length; si++) {
            const sk = skills.keysInOrder[si];
            createView.queueCache(`base_library_row_${sk}`, `base_library_name_${sk}`, `base_library_desc_${sk}`, `base_library_progress_${sk}`, `base_library_btn_${sk}`, `base_library_pause_${sk}`);
        }
        for (let tui = 0; tui < townData.townhallUnlockOrder.length; tui++) {
            const kx = townData.townhallUnlockOrder[tui];
            createView.queueCache(`base_townhall_extra_${kx}`, townData.idRow("townhall", kx), townData.idBtn("townhall", kx));
        }
        createView.clearCacheQueue();
        createView.updateLayoutMeasurements();
    },
    syncBattlefieldLayoutFromDom: function() {
        const gd = gameData.battle;
        viewData.layout.battlefieldWidthPx = gd.battlefieldWidthPx;
        viewData.layout.battlefieldHeightPx = gd.battlefieldHeightPx;
        const bh = viewData.layout.battlefieldHeightPx;
        if (gd.playerSlapLineYPx !== null && gd.playerSlapLineYPx !== undefined) {
            viewData.layout.playerTopPx = gd.playerSlapLineYPx;
        } else {
            const fromBottom = gd.playerSlapOffsetFromBottomPx !== undefined ? gd.playerSlapOffsetFromBottomPx : 182;
            viewData.layout.playerTopPx = Math.max(0, bh - fromBottom);
        }
    },
    updateLayoutMeasurements: function() {
        createView.syncBattlefieldLayoutFromDom();
        const menuCol = viewData.cached.menuColumn;
        const battleCol = viewData.cached.battleColumn;
        const infoPanel = viewData.cached.baseBuildingInfo;
        if (menuCol && battleCol) {
            if (battleCol.style.display !== "none") {
                const battleHeight = battleCol.offsetHeight;
                menuCol.style.maxHeight = `${battleHeight}px`;
                if (infoPanel) {
                    const infoTop = infoPanel.getBoundingClientRect().top;
                    const menuTop = menuCol.getBoundingClientRect().top;
                    const usedHeight = Math.max(0, infoTop - menuTop);
                    const available = Math.max(120, Math.floor(battleHeight - usedHeight - 28));
                    infoPanel.style.maxHeight = `${available}px`;
                }
            } else {
                menuCol.style.maxHeight = "";
                if (infoPanel) {
                    infoPanel.style.maxHeight = "";
                }
            }
        }
    },
    clearCacheQueue: function() {
        for(let id of idsToCache) {
            const el = document.getElementById(id);
            viewData.cached[id] = el;
            /* New DOM nodes reuse ids; drop coalescing state so the next updateVal pass repaints. */
            delete viewData.prevValues[id];
        }
        idsToCache = [];
    },
    queueCache: function() {
        Array.prototype.push.apply(idsToCache, arguments);
    }
}