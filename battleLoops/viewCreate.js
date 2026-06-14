
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
                        <div class="travel-map-name"><span class="travel-map-stars-inline"><span id="mapStar_${m.key}_bronze" class="skill-star-btn skill-star-bronze">☆</span><span id="mapStar_${m.key}_silver" class="skill-star-btn skill-star-silver">☆</span><span id="mapStar_${m.key}_coins" class="skill-star-btn skill-star-coins">☆</span></span> ${m.name}<span class="muted-text">${classReq}</span></div>
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
                        <div>Kitsune Rescued: <span id="mapWorkers_${m.key}"></span></div>
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
        const guestRoot = document.getElementById("guestsList");
        const earthSlots = document.getElementById("spiritSlots_earth");
        const waterSlots = document.getElementById("spiritSlots_water");
        const fireSlots = document.getElementById("spiritSlots_fire");
        const pebblePool = document.getElementById("pebbleMapPool");
        const assignOkamiBtn = function(siteKey) {
            return `<button id="base_${siteKey}_assign_okami_btn" class="tab-button assign-okami-btn" onclick="events.assignOkami('${siteKey}')">Assign Okami</button>`;
        };
        const foxDenUnlockRowsHtml = function() {
            let h = "";
            for (let ui = 0; ui < resortData.foxDenUnlockOrder.length; ui++) {
                const k = resortData.foxDenUnlockOrder[ui];
                const defMeta = resortData.foxDenUnlockDefs[k];
                const desc = defMeta && defMeta.description ? defMeta.description : "";
                const label = defMeta && defMeta.label ? defMeta.label : k;
                const rowId = resortData.idRow("foxDen", k);
                const btnId = resortData.idBtn("foxDen", k);
                h += `<div id="${rowId}" class="base-scrollArchives-row base-upgrade-row"><div class="base-upgrade-text"><div class="base-upgrade-name">${label}</div><div class="muted-text base-skill-short">${desc}</div><div id="base_foxDen_extra_${k}" class="muted-text"></div></div><button id="${btnId}" class="tab-button" onclick="events.buyUpgrade('foxDenUnlock','${k}')">Plan to build</button></div>`;
            }
            return h;
        };
        const workerControls = function(siteKey) {
            const p = `'${siteKey}'`;
            return `
                <div class="base-worker-assign-row">
                    <button id="base_${siteKey}_unassign_all_btn" class="tab-button" onclick="events.adjustWorkers(${p}, 'all_dec')"><<</button>
                    <button id="base_${siteKey}_unassign_ten_btn" class="tab-button" onclick="events.adjustWorkers(${p}, 'ten_dec')">--</button>
                    <button id="base_${siteKey}_unassign_one_btn" class="tab-button" onclick="events.adjustWorkers(${p}, 'one_dec')">-</button>
                    <span class="base-worker-cap-label">Assign Kitsune</span>
                    <button id="base_${siteKey}_assign_one_btn" class="tab-button" onclick="events.adjustWorkers(${p}, 'one_inc')">+</button>
                    <button id="base_${siteKey}_assign_ten_btn" class="tab-button" onclick="events.adjustWorkers(${p}, 'ten_inc')">++</button>
                    <button id="base_${siteKey}_assign_all_btn" class="tab-button" onclick="events.adjustWorkers(${p}, 'all_inc')">>></button>
                    <span id="base_${siteKey}_workers_label" class="base-worker-cap-label muted-text"></span>
                </div>
                <div class="base-row base-worker-power-row">
                    <span id="base_${siteKey}_worker_prod_text" class="muted-text"></span>
                    <div id="base_${siteKey}_worker_prod_wrap" class="prog-track skill-prog-mini">
                        <div id="base_${siteKey}_worker_prog_fill" class="prog-fill prog-fill-skill worker-prog-fill-instant"></div>
                    </div>
                </div>
                ${assignOkamiBtn(siteKey)}
            `;
        };
        const resortUpgradeRowsHtml = function(scopeKey) {
            const cfg = resortData.buildings[scopeKey];
            if (!cfg || !cfg.upgradesOrder) {
                return "";
            }
            const order = cfg.upgradesOrder || [];
            let h = "";
            let first = true;
            for (let oi = 0; oi < order.length; oi++) {
                const pk = order[oi];
                const ud = cfg.upgrades[pk];
                if (!ud) {
                    continue;
                }
                if (first) {
                    h += `<div class="base-upgrade-divider"></div>`;
                    first = false;
                }
                const slug = resortData.slug(ud);
                const rowId = resortData.idRow(scopeKey, slug);
                const btnId = resortData.idBtn(scopeKey, slug);
                const extraId = resortData.idExtra(scopeKey, slug);
                h += `<div id="${rowId}" class="base-scrollArchives-row base-upgrade-row"><div class="base-upgrade-text"><div class="base-upgrade-name">${ud.name || ""}</div><div class="muted-text base-skill-short">${ud.description || ""}</div><div id="${extraId}" class="muted-text"></div></div><button id="${btnId}" class="tab-button" onclick="events.buyUpgrade('${scopeKey}','${pk}')">Buy for</button></div>`;
            }
            return h;
        };
        const bonfireClassRowsHtml = function() {
            let h = "";
            for (let ci = 0; ci < resortData.bonfireClasses.length; ci++) {
                const ck = resortData.bonfireClasses[ci];
                const d = initialize.getClassDef(ck);
                const rowId = resortData.idRow("bonfire", ck);
                h += `<div id="${rowId}" class="base-scrollArchives-row base-upgrade-row"><div class="base-upgrade-text"><div class="base-upgrade-name">${d.name}</div><div class="muted-text base-skill-short">+${d.perLevel.str} Str, +${d.perLevel.con} Con, +${d.perLevel.spd} Spd per level</div><div id="base_bonfire_extra_${ck}" class="muted-text"></div></div><div class="base-upgrade-actions"><button id="${resortData.bonfireBuyBtn(ck)}" class="tab-button" onclick="events.buyUpgrade('bonfire','${ck}')">Buy</button><button id="${resortData.bonfireSwitchBtn(ck)}" class="tab-button" onclick="events.queueClassSwitch('${ck}')">Switch</button></div></div>`;
            }
            return h;
        };
        const workerDockHtml = function() {
            const keys = resortData.workerDockSiteKeys || [];
            let h = "";
            for (let wi = 0; wi < keys.length; wi++) {
                const sk = keys[wi];
                h += `<div id="workerDock_${sk}" class="base-info-worker-dock-section" style="display:none">${workerControls(sk)}</div>`;
            }
            return h;
        };

        if (root) {
            root.innerHTML = `
                <button type="button" id="baseBuildingInfoClose" class="base-info-close-btn" title="Close" onclick="events.closeBaseBuildingInfo()">×</button>
                <div id="baseBuildingInfoScroll" class="base-info-scroll">
                <div id="resortInfo_empty" class="resort-info-section resort-info-visible"></div>
                <div id="resortInfo_hiddenSpring" class="resort-info-section">
                    <div class="base-info-title">Hidden Spring</div>
                    <div class="base-row muted-text">A quiet spring above the resort where spirits gather.</div>
                    ${resortUpgradeRowsHtml("hiddenSpring")}
                </div>
                <div id="resortInfo_spirit" class="resort-info-section">
                    <div id="spiritInfoTitle" class="base-info-title">Spirit</div>
                    <div class="base-row">Level: <span id="spiritInfoLevel"></span></div>
                    <div class="base-row">Spirit power: <span id="spiritInfoPower"></span></div>
                    <div class="base-row">Exp: <span id="spiritInfoExp"></span>/<span id="spiritInfoExpReq"></span></div>
                    <div id="spiritInfoEarthExtras">
                        <div class="base-row">Pebbles active: <span id="spiritInfoPebbles"></span>/2</div>
                    </div>
                    <div id="spiritInfoWaterExtras" style="display:none">
                        <div class="base-row">Water volume: <span id="spiritInfoWaterVolume"></span></div>
                        <div class="base-row">Heat: <span id="spiritInfoHeat"></span></div>
                        <div class="base-row">Essence: <span id="spiritInfoEssence"></span></div>
                        <div class="base-row">Infusion: <span id="spiritInfoInfusion"></span></div>
                    </div>
                    <div id="spiritInfoFireExtras" style="display:none">
                        <div id="spiritInfoFireNote" class="base-row muted-text"></div>
                    </div>
                    <div id="spiritInfoPlantExtras" style="display:none">
                        <div class="base-row">Bamboo column: <span id="spiritInfoPlantColumn"></span></div>
                        <div class="base-row muted-text">Plant spirits gain 1 exp each time a wood segment regrows in their bamboo column.</div>
                    </div>
                    <div id="spiritInfoTaskWrap">
                        <div id="spiritInfoTaskText" class="base-row base-gap-top"></div>
                        <div class="prog-track skill-prog-mini"><div id="spiritInfoTaskFill" class="prog-fill prog-fill-skill"></div></div>
                    </div>
                </div>
                <div id="resortInfo_torii" class="resort-info-section">
                    <div class="base-info-title">Zenko Torii Gate</div>
                    <div class="base-row muted-text">Invites visitors the resort. They move to the Inn if possible.</div>
                    <div class="base-row">Visitors at the gate: <span id="toriiVisitorsWaiting"></span>/<span id="toriiVisitorsMax"></span></div>
                    <div class="base-row">Next visitor: <span id="toriiNextVisitor"></span></div>
                    <div id="toriiNextVisitorProgressWrap" class="base-mini-progress torii-next-visitor-progress" style="display:none"><div id="toriiNextVisitorProgressFill" class="base-mini-progress-fill"></div></div>
                    ${resortUpgradeRowsHtml("torii")}
                </div>
                <div id="resortInfo_inn" class="resort-info-section">
                    <div class="base-info-title">Tatami Inn</div>
                    <div class="base-row">
                        <div>Rooms available: <span id="innRoomsAvailable"></span></div>
                        <div>Rooms occupied: <span id="innRoomsOccupied"></span></div>
                        <div>Guests gain +<span id="innRestfulnessPerSecond"></span>/s restfulness while occupying a room.</div>
                    </div>
                    <div class="base-row muted-text">Zenko guests settle in for 5s, then rest for <span id="innRestDurationText">5</span>s before leaving the inn.</div>
                    ${resortUpgradeRowsHtml("inn")}
                    <div class="resort-info-grid">
                    </div>
                </div>
                <div id="resortInfo_bar" class="resort-info-section">
                    <div class="base-info-title">Bar</div>
                    <div class="base-row muted-text">Host guests for rumors and chat.</div>
                </div>
                <div id="resortInfo_laundry" class="resort-info-section">
                    <div class="base-info-title">Laundry Basins</div>
                    <div class="base-row muted-text">Refreshes rooms after guests leave. (Effects coming soon.)</div>
                </div>
                <div id="resortInfo_path" class="resort-info-section">
                    <div class="base-info-title">Clear Debris</div>
                    <div class="base-row">State: <span id="pathSegmentStateText"></span></div>
                    ${resortUpgradeRowsHtml("path")}
                </div>
                <div id="resortInfo_stonePile" class="resort-info-section">
                    <div class="base-info-title">Stone Pile</div>
                    <div class="base-row muted-text">Holds stone.</div>
                    <div class="base-row">Stone: <span id="stonePileInfoValue"></span></div>
                </div>
                <div id="resortInfo_garden" class="resort-info-section">
                    <div class="base-info-title">Rock Garden</div>
                    <div class="base-row muted-text">Automation for an easy life, so you can go outside.</div>
                    <div id="gardenAppraisalAuto_row" class="base-row" style="display:none"><label><input type="checkbox" id="gardenAppraisalAuto_chk" checked onchange="events.toggleGardenAutoWeaveOnGather(this.checked)"> Arrangement of Appraisal — auto-weave ready gather jobs when Okami is idle or at a building</label></div>
                    <div id="gardenReviewAuto_row" class="base-row" style="display:none"><label><input type="checkbox" id="gardenReviewAuto_chk" checked onchange="events.toggleGardenAutoWeaveCheapestReady(this.checked)"> Arrangement of Review — periodically auto-weave the ready upgrade with the shortest weave time</label></div>
                    ${resortUpgradeRowsHtml("garden")}
                </div>
                <div id="resortInfo_atelier" class="resort-info-section">
                    <div class="base-info-title">Atelier</div>
                    <div class="base-row muted-text">Upgrades for the different buildings.</div>
                    ${resortUpgradeRowsHtml("atelier")}
                </div>
                <div id="resortInfo_bonfire" class="resort-info-section">
                    <div class="base-info-title">Bonfire</div>
                    <div class="base-row muted-text">Stare at the fire and contemplate how to protect what's yours.</div>
                    <div id="base_bonfire_current" class="base-row"></div>
                    ${bonfireClassRowsHtml()}
                </div>
                <div id="resortInfo_bambooForest" class="resort-info-section">
                    <div class="base-info-title">Bamboo Forest</div>
                    <div class="base-row muted-text">Harvest bamboo for construction wood.</div>
                    <div class="base-row">Chips: <span id="bambooForestInfoChips"></span> <span class="muted-text"> -> 10 Chips become 1 Wood -> </span> Wood: <span id="bambooForestInfoWood"></span></div>
                    <div class="base-row">Chop Power: <span id="bambooChopPower"></span> <span class="muted-text">Gain Chop Power per assigned Kitsune</span></div>
                    <div class="base-row muted-text">Select which stalk to cut. One bamboo segment takes 2 minutes to fully grow. Bamboo grows when not being harvested.</div>
                    <div id="bambooStalkGrid" class="bamboo-stalk-grid"></div>
                    <div id="bambooCutRow" class="bamboo-harvest-row"></div>
                    <div id="bambooStatusRow" class="bamboo-status-row"></div>
                    <div id="bambooBaseWoodRow" class="bamboo-base-wood-row"></div>
                    <div id="bambooTagline_row" class="base-row muted-text bamboo-tagline" style="display:none">Bamboo grows stronger only when fully cut</div>
                    <div id="bambooAutoRotate_row" class="base-row" style="display:none"><label><input type="checkbox" id="bambooAutoRotate_chk" checked onchange="events.toggleBambooAutoRotate(this.checked)"> Auto-rotate harvest to next stalk</label></div>
                </div>
                <div id="resortInfo_foxDen" class="resort-info-section">
                    <div class="base-info-title">Fox Den</div>
                    <div class="base-row muted-text">Plan buildings and send kitsune to deliver materials. Buildings are prioritized over upgrades.</div>
                    <div class="base-row">Wood: <span id="foxDenInfoWood"></span></div>
                    ${foxDenUnlockRowsHtml()}
                </div>
                <div id="resortInfo_cistern" class="resort-info-section">
                    <div class="base-info-title">Cistern</div>
                    <div class="base-row muted-text">Collects water from droplets.</div>
                    <div class="base-row">Stored water: <span id="cisternInfoWater"></span></div>
                    <div class="base-row">Essence: <span id="cisternInfoEssence"></span></div>
                </div>
                <div id="resortInfo_mine" class="resort-info-section">
                    <div class="mine-info-header">
                        <div class="base-info-title">Mine</div>
                        <span id="mineStatusText" class="mine-status-inline muted-text"></span>
                    </div>
                    <div class="mine-depth-row"><button id="mineDepthLeftBtn" class="tab-button" onclick="events.changeMineDepth(-1)">←</button><span>depth <span id="mineDepthText"></span> | <span id="mineDepthClears"></span>/10</span><button id="mineDepthRightBtn" class="tab-button" onclick="events.changeMineDepth(1)">→</button></div>
                    <div class="mine-info-body">
                        <div id="mineGrid" class="mine-grid"></div>
                        <div class="mine-info-side">
                            <div class="resort-info-grid mine-resource-grid">
                                <div>Dirt: <span id="mineDirtText"></span></div>
                                <div>Stone: <span id="mineStoneText"></span></div>
                                <div>Assigned spirit level: <span id="mineAssignedLevelText"></span></div>
                            </div>
                            <div id="minePlayProgressWrap" class="prog-track skill-prog-mini mine-play-progress"><div id="minePlayProgressFill" class="prog-fill prog-fill-skill"></div></div>
                        </div>
                    </div>
                </div>
                </div>
                <div id="baseBuildingInfoWorkerDock" class="base-info-worker-dock" style="display:none">
                    ${workerDockHtml()}
                </div>
            `;
        }
        if (guestRoot) {
            let guestLogRows = "";
            for (let gli = 0; gli < 5; gli++) {
                guestLogRows += `<div id="guestLogRow_${gli}" class="guest-log-row" style="display:none"><span id="guestLogRow_${gli}_text"></span></div>`;
            }
            let guestRows = "";
            for (let gi = 0; gi < 10; gi++) {
                guestRows += `<div id="guestRow_${gi}" class="guest-list-row" style="display:none">The <b id="guestRow_${gi}_type"></b> is currently <b id="guestRow_${gi}_state"></b> for the next <b id="guestRow_${gi}_time"></b>. <span id="guestRow_${gi}_rest_text"></span><b id="guestRow_${gi}_restfulness"></b> <span id="guestRow_${gi}_rest_end"></span>.</div>`;
            }
            guestRoot.innerHTML = `
                <div class="guest-log-section">
                    <div class="guest-section-title">Guest Log</div>
                    <div id="guestLogList" class="guest-log-list">${guestLogRows}</div>
                </div>
                <div class="guest-current-section">
                    <div class="guest-section-title">Current Guests</div>
                    <div id="guestCurrentList" class="guest-current-list">${guestRows}</div>
                </div>
            `;
        }
        const slotHtml = function(kind, location, count) {
            let h = "";
            for (let i = 0; i < count; i++) {
                h += `<div id="spiritSlot_${location}_${kind}_${i}" class="spirit-slot spirit-slot-${kind}" onclick="events.clickSpiritSlot('${kind}', '${location}', ${i})"></div>`;
            }
            return h;
        };
        if (earthSlots) earthSlots.innerHTML = slotHtml("earth", "hiddenSpring", 3);
        if (waterSlots) waterSlots.innerHTML = slotHtml("water", "hiddenSpring", 3);
        if (fireSlots) fireSlots.innerHTML = slotHtml("fire", "hiddenSpring", 3);
        const mineEarthSlots = document.getElementById("spiritSlots_mine_earth");
        if (mineEarthSlots) mineEarthSlots.innerHTML = slotHtml("earth", "mine", 3);
        const bambooPlantSlots = document.getElementById("spiritSlots_bambooForest_plant");
        if (bambooPlantSlots) bambooPlantSlots.innerHTML = slotHtml("plant", "bambooForest", 4);
        const bambooStalkGrid = document.getElementById("bambooStalkGrid");
        const bambooCutRow = document.getElementById("bambooCutRow");
        const bambooStatusRow = document.getElementById("bambooStatusRow");
        const bambooBaseWoodRow = document.getElementById("bambooBaseWoodRow");
        if (bambooStalkGrid && bambooCutRow && bambooStatusRow && bambooBaseWoodRow) {
            const cfg = resortData.bambooForestConfig;
            const stalkCount = cfg.stalkCount || 4;
            const rowCount = cfg.rowCount || 3;
            let gridH = "";
            let cutH = "";
            let statusH = "";
            let baseWoodH = "";
            for (let si = 0; si < stalkCount; si++) {
                gridH += `<div class="bamboo-stalk-col" id="bambooStalkCol_${si}">`;
                for (let ri = rowCount - 1; ri >= 0; ri--) {
                    gridH += `<div class="bamboo-cell-wrap" id="bambooCellWrap_${si}_${ri}">`
                        + `<div class="bamboo-cell-rail bamboo-cell-rail-left"></div>`
                        + `<div class="bamboo-cell-body" id="bambooCell_${si}_${ri}">`
                        + `<div class="bamboo-cell-fill" id="bambooCellFill_${si}_${ri}"></div>`
                        + `<div class="bamboo-cell-label" id="bambooCellLabel_${si}_${ri}"></div>`
                        + `</div>`
                        + `<div class="bamboo-cell-rail bamboo-cell-rail-right"></div>`
                        + `</div>`;
                }
                gridH += `</div>`;
                cutH += `<button type="button" id="bambooCutBtn_${si}" class="tab-button bamboo-cut-btn" onclick="events.toggleBambooCut(${si})">Cut</button>`;
                statusH += `<div id="bambooStatus_${si}" class="bamboo-status-text muted-text"></div>`;
                baseWoodH += `<div class="bamboo-base-wood-col"><span class="muted-text">Base Chips</span> <span id="bambooBaseWood_${si}"></span></div>`;
            }
            bambooStalkGrid.innerHTML = gridH;
            bambooCutRow.innerHTML = cutH;
            bambooStatusRow.innerHTML = statusH;
            bambooBaseWoodRow.innerHTML = baseWoodH;
        }
        if (pebblePool) {
            let h = "";
            for (let i = 0; i < 12; i++) {
                h += `<div id="pebbleToken_${i}" class="pebble-token" style="display:none"></div>`;
            }
            h += `<div id="okamiTravelToken" class="okami-travel-token" style="display:none"><img class="okami-travel-tail" src="img/foxTail.svg" alt="" draggable="false"></div>`;
            h += `<div id="okamiPathWeaveToken" class="okami-path-weave-token" style="display:none"><img class="okami-path-weave-tail" src="img/foxTail.svg" alt="" draggable="false"></div>`;
            for (let ci = 0; ci < 8; ci++) {
                h += `<div id="foxDenCarrier_${ci}" class="fox-den-carrier-token" style="display:none"><img class="fox-den-carrier-img" src="img/foxWorker.svg" alt="" draggable="false"></div>`;
            }
            pebblePool.innerHTML = h;
        }
        createView.buildPathSegmentSvgLayers();
        createView.buildFoxDenMapSlots();
        const mineGrid = document.getElementById("mineGrid");
        if (mineGrid) {
            let h = "";
            for (let i = 0; i < 25; i++) {
                h += `<div id="mineBlock_${i}" class="mine-block"><div id="mineBlockFill_${i}" class="mine-block-fill"></div></div>`;
            }
            mineGrid.innerHTML = h;
        }
        return;
        const td = resortData.buildings;
        let skillRowsHtml = "";
        for (let i = 0; i < skills.keysInOrder.length; i++) {
            const k = skills.keysInOrder[i];
            const nm = data.progress.skills[k] ? data.progress.skills[k].name : k;
            const classKey = (skills._byKey[k] && skills._byKey[k].classKey) ? skills._byKey[k].classKey : "";
            const className = classKey ? (classKey.charAt(0).toUpperCase() + classKey.slice(1)) : "";
            const classNote = className ? ` - ${className}` : "";
            skillRowsHtml += `<div id="base_scrollArchives_row_${k}" class="base-scrollArchives-row base-upgrade-row"><div class="base-upgrade-text"><div id="base_scrollArchives_name_${k}" class="base-upgrade-name">${nm}${classNote}</div><div id="base_scrollArchives_desc_${k}" class="muted-text base-skill-short">${skills.getSkillShortDescription(k)}</div><div id="base_scrollArchives_progress_${k}" class="muted-text"></div></div><div class="base-upgrade-actions"><button id="base_scrollArchives_btn_${k}" class="tab-button" onclick="events.buyScrollArchivesSkill('${k}')">Buy for</button><button id="base_scrollArchives_pause_${k}" class="tab-button" onclick="events.toggleScrollArchivesResearchPause('${k}')">Pause</button></div></div>`;
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
            const slug = resortData.slug(u);
            const wc = u.wrapClass ? ` ${u.wrapClass}` : "";
            const rowId = resortData.idRow(panelScope, slug);
            const btnId = resortData.idBtn(panelScope, slug);
            const extraId = resortData.idExtra(panelScope, slug);
            const name = u.name || "";
            const desc = u.description || "";
            return `<div id="${rowId}" class="base-scrollArchives-row base-upgrade-row${wc}"><div class="base-upgrade-text"><div class="base-upgrade-name">${name}</div><div class="muted-text base-skill-short">${desc}</div><div id="${extraId}" class="muted-text"></div></div><button id="${btnId}" class="tab-button" onclick="events.buyUpgrade('${panelScope}','${upgradePropKey}')">Buy for</button></div>`;
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
            const gearUp = resortData.buildings[buildingKey] && resortData.buildings[buildingKey].upgrades && resortData.buildings[buildingKey].upgrades[gk];
            const gslug = gearUp && gearUp.key ? gearUp.key : "gear";
            const gearExtraId = resortData.idExtra(buildingKey, gslug);
            const gearBtnId = resortData.idBtn(buildingKey, gslug);
            const workerPowerRow = (resortData.workerPowerSiteKeys || []).indexOf(buildingKey) >= 0
                ? `<div class="base-row base-worker-power-row"><span id="base_${buildingKey}_worker_prod_text" class="muted-text"></span><div id="base_${buildingKey}_worker_prod_wrap" class="prog-track skill-prog-mini"><div id="base_${buildingKey}_worker_prog_fill" class="prog-fill prog-fill-skill"></div></div></div>`
                : "";
            return `
                <div id="${rowId}" class="base-row"></div>
                <div class="base-scrollArchives-row base-upgrade-row">
                    <div class="base-upgrade-text">
                        <div class="base-upgrade-name">${w.gearName}</div>
                        <div class="muted-text base-skill-short">${w.gearDescription}</div>
                        <div id="${gearExtraId}" class="muted-text"></div>
                    </div>
                    <button id="${gearBtnId}" class="tab-button" onclick="events.buyUpgrade('${buildingKey}','${gk}')">Buy for</button>
                </div>
                <div class="base-worker-assign-row"><button id="base_${buildingKey}_unassign_all_btn" class="tab-button" onclick="events.adjustWorkers(${p}, 'all_dec')"><<</button><button id="base_${buildingKey}_unassign_ten_btn" class="tab-button" onclick="events.adjustWorkers(${p}, 'ten_dec')">--</button><button id="base_${buildingKey}_unassign_one_btn" class="tab-button" onclick="events.adjustWorkers(${p}, 'one_dec')">-</button><span class="base-worker-cap-label">Assign Kitsune</span><button id="base_${buildingKey}_assign_one_btn" class="tab-button" onclick="events.adjustWorkers(${p}, 'one_inc')">+</button><button id="base_${buildingKey}_assign_ten_btn" class="tab-button" onclick="events.adjustWorkers(${p}, 'ten_inc')">++</button><button id="base_${buildingKey}_assign_all_btn" class="tab-button" onclick="events.adjustWorkers(${p}, 'all_inc')">>></button><span id="base_${buildingKey}_workers_label" class="base-worker-cap-label muted-text"></span></div>
                <button id="base_${buildingKey}_assign_okami_btn" class="tab-button assign-okami-btn" onclick="events.assignOkami('${buildingKey}')">Assign Okami</button>
                ${workerPowerRow}
                ${extraAfterWorkers || ""}
            `;
        };

        const htmlFoxDenUnlockRows = function() {
            let h = "";
            for (let ui = 0; ui < resortData.foxDenUnlockOrder.length; ui++) {
                const k = resortData.foxDenUnlockOrder[ui];
                const defMeta = resortData.foxDenUnlockDefs[k];
                const desc = defMeta && defMeta.description ? defMeta.description : "";
                const label = defMeta && defMeta.label ? defMeta.label : k;
                const rowId = resortData.idRow("foxDen", k);
                const btnId = resortData.idBtn("foxDen", k);
                h += `<div id="${rowId}" class="base-scrollArchives-row base-upgrade-row"><div class="base-upgrade-text"><div class="base-upgrade-name">${label}</div><div class="muted-text base-skill-short">${desc}</div><div id="base_foxDen_extra_${k}" class="muted-text"></div></div><button id="${btnId}" class="tab-button" onclick="events.buyUpgrade('foxDenUnlock','${k}')">Buy for</button></div>`;
            }
            return h;
        };

        const htmlBonfireClassRows = function() {
            let h = "";
            for (let ci = 0; ci < resortData.bonfireClasses.length; ci++) {
                const ck = resortData.bonfireClasses[ci];
                const d = initialize.getClassDef(ck);
                const rowId = resortData.idRow("bonfire", ck);
                h += `<div id="${rowId}" class="base-scrollArchives-row base-upgrade-row"><div class="base-upgrade-text"><div class="base-upgrade-name">${d.name}</div><div class="muted-text base-skill-short">+${d.perLevel.str} Str, +${d.perLevel.con} Con, +${d.perLevel.spd} Spd per level</div><div id="base_bonfire_extra_${ck}" class="muted-text"></div></div><div class="base-upgrade-actions"><button id="${resortData.bonfireBuyBtn(ck)}" class="tab-button" onclick="events.buyUpgrade('bonfire','${ck}')">Buy</button><button id="${resortData.bonfireSwitchBtn(ck)}" class="tab-button" onclick="events.queueClassSwitch('${ck}')">Switch</button></div></div>`;
            }
            return h;
        };

        const htmlGardenManualRows = function() {
            const gcfg = resortData.buildings.garden;
            return htmlOrderedUpgradeKeys(gcfg, "garden", gcfg.upgradesOrder);
        };

        const htmlScrollArchivesDeskOnly = function(libCfg) {
            return upgradePurchaseRowHtml("scrollArchives", "researchDesk", libCfg.upgrades.researchDesk);
        };

        const buildBuildingPanel = function(buildingKey) {
            const titleText = resortData.getScopeDisplayName(buildingKey);
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
            if (buildingKey === "foxDen") {
                const tcfg = td.foxDen;
                return makePanelShell(buildingKey, titleText,
                    htmlStaticPanelDescription(buildingKey, tcfg.description)
                    + htmlFoxDenUnlockRows());
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
            if (buildingKey === "bonfire") {
                return makePanelShell(buildingKey, titleText, `<div id="${cfg.currentStatusRowId}" class="base-row"></div>${htmlBonfireClassRows()}`);
            }
            if (buildingKey === "scrollArchives") {
                const libCfg = td.scrollArchives;
                return makePanelShell(buildingKey, titleText,
                    htmlScrollArchivesDeskOnly(libCfg)
                    + `<div class="base-worker-assign-row"><button id="base_scrollArchives_unassign_all_btn" class="tab-button" onclick="events.adjustWorkers('scrollArchives', 'all_dec')"><<</button><button id="base_scrollArchives_unassign_ten_btn" class="tab-button" onclick="events.adjustWorkers('scrollArchives', 'ten_dec')">--</button><button id="base_scrollArchives_unassign_one_btn" class="tab-button" onclick="events.adjustWorkers('scrollArchives', 'one_dec')">-</button><span class="base-worker-cap-label">Assign Kitsune</span><button id="base_scrollArchives_assign_one_btn" class="tab-button" onclick="events.adjustWorkers('scrollArchives', 'one_inc')">+</button><button id="base_scrollArchives_assign_ten_btn" class="tab-button" onclick="events.adjustWorkers('scrollArchives', 'ten_inc')">++</button><button id="base_scrollArchives_assign_all_btn" class="tab-button" onclick="events.adjustWorkers('scrollArchives', 'all_inc')">>></button><span id="base_scrollArchives_workers_label" class="base-worker-cap-label muted-text"></span></div>`
                    + `<div id="base_scrollArchives_queue_note" class="base-row muted-text">${libCfg.queueNote}</div>`
                    + `<div class="row-buttons"><button id="scrollArchivesTab_combat" class="tab-button" onclick="events.switchScrollArchivesTab('combat')">Combat</button><button id="scrollArchivesTab_resort" class="tab-button" onclick="events.switchScrollArchivesTab('resort')">Resort</button><button id="scrollArchivesTab_foraging" class="tab-button" onclick="events.switchScrollArchivesTab('foraging')">Foraging</button><button id="scrollArchivesTab_class" class="tab-button" onclick="events.switchScrollArchivesTab('class')">Class</button></div>`
                    + `<div id="${libCfg.emptySkillsId}" class="muted-text">${libCfg.emptySkillsText}</div>${skillRowsHtml}`);
            }
            if (buildingKey === "atelier") {
                return makePanelShell(buildingKey, titleText, htmlOrderedUpgradeKeys(td.atelier, buildingKey, td.atelier.upgradesOrder));
            }
            if (buildingKey === "garden") {
                const gcfg = td.garden;
                return makePanelShell(buildingKey, titleText,
                    `<div class="base-row muted-text">${gcfg.introMuted}</div>${htmlGardenManualRows()}<div id="${gcfg.emptyPlaceholderId}" class="muted-text">${gcfg.emptyPlaceholderText}</div>`);
            }
            return "";
        };

        let panelsHtml = "";
        const panelOrder = resortData.baseBuildingOrder.slice();
        for (let pi = 0; pi < panelOrder.length; pi++) {
            panelsHtml += buildBuildingPanel(panelOrder[pi]);
        }

        root.innerHTML = `
            <div id="base_resource_strip" class="base-resource-strip">
                <span>Stone <span id="base_res_stone"></span></span>
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
        events.showSelectedBaseBuildingPanels(data.progress.selectedBaseBuilding || "");
    },
    /** One-time on load: 40% skill rows + 60% Skill Info panel. Visibility via view.updateSkillsListVisibility. */
    createSkillElements: function() {
        const skillsList = document.getElementById("skillsList");
        const innUnlockedFromFoxDen = !!(data.progress.base && data.progress.base.foxDen && data.progress.base.foxDen.unlocks && data.progress.base.foxDen.unlocks.inn);
        const tipsRowHiddenStyle = innUnlockedFromFoxDen ? "" : " style=\"display:none\"";
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
                            <button id="skill_${key}_star_coins" class="skill-star-btn skill-panel-star-btn skill-star-coins" onclick="events.toggleSkillStar('${key}', 'coins')">☆</button>
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
                `skill_${key}_stars_controls`, `skill_${key}_star_bronze`, `skill_${key}_star_silver`, `skill_${key}_star_coins`
            );
        }
    },
    setStaticDimensions: function() {
        const menuColumn = document.getElementById("menuColumn");
        const battleColumn = document.getElementById("battleColumn");
        const battlefield = document.getElementById("battlefield");
        const battlefieldWrap = document.getElementById("battlefieldWrap");
        const gd = gameData.battle;
        if (menuColumn) {
            menuColumn.style.height = "800px";
        }
        if (battleColumn) {
            battleColumn.style.height = "800px";
        }
        battlefieldWrap.style.width = "690px";
        battlefield.style.width = "100%";
        const innerH = gd.battlefieldHeightPx;
        battlefield.style.height = `${innerH + 2}px`;
    },
    showCurrentTab: function() {
        const allTabs = ["base", "guests", "leveling", "stats", "skills", "travel", "history", "options"];
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
            "mainLayout", "gameColumnsRow", "gameProgressBars", "okamiProgressBar", "manaProgressBar", "manaFill", "manaAmount", "manaCap", "manaRate",
            "battlefieldWrap", "battlefield", "battleHud", "battleEndRunBtn", "waveInfo", "rangeMarkers", "attackLines", "playerStack", "playerToken", "playerTokenHpLayer", "playerStatHpLine", "playerStatDmgLine", "playerMovePulse",
            "playerAttackBarFill", "playerAttackBarLabel", "playerSandalBarTrack", "playerSandalBarFill", "playerSandalBarLabel",
            "playerClassBarA", "playerClassBarALabel", "playerClassBarAFill", "playerClassBarB", "playerClassBarBLabel", "playerClassBarBFill",
            "playerLevelBar", "playerLevelBarFill", "playerLevelBarLabel",
            "playerBattleHudSecondary", "deathOverlay", "deathTitle", "deathSummary", "deathTalentDetails", "menuContent", "menuColumn", "battleColumn", "tabButton_base", "tabButton_guests", "tabButton_leveling", "tabButton_stats", "tabButton_skills", "tabButton_travel", "tabButton_history", "tabButton_options",
            "okamiTailLabel", "okamiLevelText", "okamiExpText", "okamiExpFill", "okamiSpiritStrands", "okamiStateDisplay", "okamiInspirationBonus",
            "baseCoinsText", "baseStarBeadsText", "basePaneTitleStarBeads", "basePaneTitleCoins", "baseWorkersAssigned", "baseWorkersFound", "baseBuildingInfo", "baseBuildingInfoScroll", "baseBuildingInfoWorkerDock", "guestsList",
            "resortInfo_empty", "resortInfo_hiddenSpring", "resortInfo_spirit", "resortInfo_torii", "resortInfo_inn", "resortInfo_bar", "resortInfo_laundry", "resortInfo_path", "resortInfo_stonePile", "resortInfo_bambooForest", "resortInfo_garden", "resortInfo_atelier", "resortInfo_bonfire", "resortInfo_foxDen", "resortInfo_cistern", "resortInfo_mine",
            "gardenAppraisalAuto_row", "gardenAppraisalAuto_chk", "gardenReviewAuto_row", "gardenReviewAuto_chk",
            "foxDenMapDisplay", "innRestDurationText",
            "bambooForestInfoChips", "bambooForestInfoWood", "foxDenInfoWood", "bambooForestMapDisplay",
            "base_bambooForest_assign_one_btn", "base_bambooForest_assign_ten_btn", "base_bambooForest_assign_all_btn", "base_bambooForest_unassign_one_btn", "base_bambooForest_unassign_ten_btn", "base_bambooForest_unassign_all_btn", "base_bambooForest_workers_label", "base_bambooForest_worker_prod_text", "base_bambooForest_worker_prod_wrap", "base_bambooForest_worker_prog_fill", "base_bambooForest_assign_okami_btn",
            "base_foxDen_assign_one_btn", "base_foxDen_assign_ten_btn", "base_foxDen_assign_all_btn", "base_foxDen_unassign_one_btn", "base_foxDen_unassign_ten_btn", "base_foxDen_unassign_all_btn", "base_foxDen_workers_label", "base_foxDen_assign_okami_btn",
            "baseBuilding_bambooForest", "baseBuilding_foxDen", "okamiTravelToken",
            "pathSegmentStateText", "base_path_remove_rocks_row", "base_path_remove_rocks_btn", "base_path_remove_rocks_extra", "base_path_add_railing_row", "base_path_add_railing_btn", "base_path_add_railing_extra", "base_torii_call_for_ally_row", "base_torii_call_for_ally_btn", "base_torii_call_for_ally_extra", "okamiTravelToken", "okamiPathWeaveToken",
            "baseBuildingInfoClose",
            "base_hiddenSpring_earthSpirit_row", "base_hiddenSpring_earthSpirit_btn", "base_hiddenSpring_earthSpirit_extra",
            "base_hiddenSpring_waterSpirit_row", "base_hiddenSpring_waterSpirit_btn", "base_hiddenSpring_waterSpirit_extra",
            "base_hiddenSpring_fireSpirit_row", "base_hiddenSpring_fireSpirit_btn", "base_hiddenSpring_fireSpirit_extra",
            "spiritInfoTitle", "spiritInfoLevel", "spiritInfoPower", "spiritInfoExp", "spiritInfoExpReq",
            "spiritInfoEarthExtras", "spiritInfoWaterExtras", "spiritInfoFireExtras", "spiritInfoPlantExtras", "spiritInfoTaskWrap",
            "spiritInfoPebbles", "spiritInfoWaterVolume", "spiritInfoHeat", "spiritInfoEssence", "spiritInfoInfusion", "spiritInfoFireNote", "spiritInfoPlantColumn",
            "spiritInfoTaskText", "spiritInfoTaskFill",
            "cisternInfoWater", "cisternInfoEssence",
            "toriiVisitorsWaiting", "toriiVisitorsMax", "toriiNextVisitor", "toriiNextVisitorProgressWrap", "toriiNextVisitorProgressFill", "okamiInspirationHint",
            "debugSpeedPanel", "debugSpeed_x3", "debugSpeed_x10",
            "innRoomsAvailable", "innRoomsOccupied", "innRestfulnessPerSecond",
            "stonePileInfoValue", "stonePileMapValue", "toriiMapDisplay", "innMapDisplay",
            "mapToriiProgressWrap", "mapToriiProgressFill", "mapLaundryProgressWrap", "mapLaundryProgressFill",
            "mineDepthLeftBtn", "mineDepthRightBtn", "mineDepthText", "mineDepthClears", "mineStatusText", "mineGrid", "mineDirtText", "mineStoneText", "mineAssignedLevelText", "minePlayProgressWrap", "minePlayProgressFill",
            "base_torii_assign_one_btn", "base_torii_assign_ten_btn", "base_torii_assign_all_btn", "base_torii_unassign_one_btn", "base_torii_unassign_ten_btn", "base_torii_unassign_all_btn", "base_torii_workers_label", "base_torii_worker_prod_text", "base_torii_worker_prod_wrap", "base_torii_worker_prog_fill",
            "base_laundry_assign_one_btn", "base_laundry_assign_ten_btn", "base_laundry_assign_all_btn", "base_laundry_unassign_one_btn", "base_laundry_unassign_ten_btn", "base_laundry_unassign_all_btn", "base_laundry_workers_label", "base_laundry_worker_prod_text", "base_laundry_worker_prod_wrap", "base_laundry_worker_prog_fill",
            "base_resource_strip", "base_res_stone",
            "base_chapel_retry_row", "base_chapel_retry_btn", "base_chapel_retry_extra",
            "base_chapel_growth_row", "base_chapel_growth_btn", "base_chapel_growth_extra",
            "base_chapel_planned_row", "base_chapel_planned_btn", "base_chapel_planned_extra",
            "basePanel_chapel", "basePanel_foxDen", "basePanel_mine", "basePanel_inn", "basePanel_bonfire", "basePanel_market", "basePanel_mage_tower", "basePanel_scrollArchives", "basePanel_atelier", "basePanel_garden",
            "base_foxDen_desc",
            "base_foxDen_hire_row", "base_foxDen_hire_btn", "base_foxDen_hire_extra",
            "base_chapel_desc", "base_mine_row", "base_mine_gear_btn", "base_mine_gear_extra", "base_mine_assign_one_btn", "base_mine_assign_ten_btn", "base_mine_assign_all_btn", "base_mine_unassign_one_btn", "base_mine_unassign_ten_btn", "base_mine_unassign_all_btn", "base_mine_workers_label", "base_mine_manual_btn", "base_mine_cd_wrap", "base_mine_cd_fill", "base_mine_cd_text",
            "base_inn_openGuests_row", "base_inn_openGuests_btn", "base_inn_openGuests_extra", "base_inn_open_row", "base_inn_next_row", "base_inn_adv_btn", "base_inn_adv_cd_wrap", "base_inn_adv_cd_fill", "base_inn_adv_cd_text", "base_inn_empty",
            "base_bonfire_current",
            "base_bonfire_extra_condescension", "base_bonfire_extra_scold", "base_bonfire_extra_mockery",
            "base_bonfire_condescension_row", "base_bonfire_scold_row", "base_bonfire_mockery_row",
            "base_bonfire_condescension_buy_btn", "base_bonfire_condescension_switch_btn", "base_bonfire_scold_buy_btn", "base_bonfire_scold_switch_btn", "base_bonfire_mockery_buy_btn", "base_bonfire_mockery_switch_btn",
            "base_scrollArchives_empty", "base_scrollArchives_workers_label", "base_scrollArchives_desk_row", "base_scrollArchives_desk_btn", "base_scrollArchives_desk_extra",
            "base_scrollArchives_assign_one_btn", "base_scrollArchives_assign_ten_btn", "base_scrollArchives_assign_all_btn", "base_scrollArchives_unassign_one_btn", "base_scrollArchives_unassign_ten_btn", "base_scrollArchives_unassign_all_btn",
            "base_garden_smartHarvest_row", "base_garden_smartHarvest_btn", "base_garden_smartHarvest_extra", "base_garden_empty",
            "baseBuilding_hiddenSpring", "baseBuilding_torii", "baseBuilding_inn", "baseBuilding_bar", "baseBuilding_laundry", "baseBuilding_stonePile", "baseBuilding_cistern", "baseBuilding_mine",
            "baseBuilding_chapel", "baseBuilding_foxDen", "baseBuilding_bonfire", "baseBuilding_market", "baseBuilding_garden", "baseBuilding_atelier", "baseBuilding_mage_tower", "baseBuilding_mine", "baseBuilding_scrollArchives",
            "baseMineProgressWrap", "baseMineProgressFill", "base_mine_map_prod_rate", "base_mine_worker_prod_text", "base_mine_worker_prod_wrap", "base_mine_worker_prog_fill",
            "baseScrollArchivesProgressWrap", "baseScrollArchivesProgressFill",
            "levelText", "levelExpText", "levelTabExpFill", "attributePointsText", "strText", "conText", "spdText", "soulText", "currentClassText", "classPerLevelText", "attributePlanList", "levelingPointsWrap", "levelingAssignButtons", "attributePlanTitle", "statsHpText", "statsHpTip", "statsRegenText", "statsRegenTip", "statsAttackText", "statsAttackTip", "statsArmorText", "statsArmorTip", "statsSlapText", "statsSlapTip", "statsSandalText", "statsSandalTip",
            "travelPane_maps", "travelPane_challenges", "travelSubTab_maps", "travelSubTab_challenges", "skillsList", "historyList",
            "sandalAttackToggle", "sandalAttackWrap", "sandalAttackLockText", "manualSaveButton", "hideMaxedUpgradesToggle", "disableCompactLayoutToggle", "skillSubTab_combat", "skillSubTab_resort", "skillSubTab_foraging", "skillSubTab_class", "scrollArchivesTab_combat", "scrollArchivesTab_resort", "scrollArchivesTab_foraging", "scrollArchivesTab_class",
            "combatStarsInventory", "compactViewTabs", "compactPane_menus", "compactPane_battle"
        );
        const maps = data.progress.mapDefinitions;
        for (let mi = 0; mi < maps.length; mi++) {
            const m = maps[mi];
            const mk = m.key;
            createView.queueCache(`travel_card_${mk}`, `mapButton_${mk}`, `mapActionCurrent_${mk}`, `mapShardSummary_${mk}`, `mapDifficulty_${mk}`, `mapWaves_${mk}`, `mapTime_${mk}`, `mapStar_${mk}_bronze`, `mapStar_${mk}_silver`, `mapStar_${mk}_coins`, `mapWorkers_${mk}`, `mapClearStatus_${mk}`, `mapClearFill_${mk}`);
            /* Class-only maps omit harvest / smart-harvest controls in HTML - do not queue those ids. */
            if (!m.requiredClassKey) {
                createView.queueCache(`mapSmartHarvestStart_${mk}`, `mapHarvestButton_${mk}`);
            }
        }
        for (let gi = 0; gi < 10; gi++) {
            createView.queueCache(`base_inn_guest_wrap_${gi}`, `base_inn_guest_name_${gi}`, `base_inn_guest_chat_${gi}`, `base_inn_guest_fill_${gi}`);
            createView.queueCache(`guestRow_${gi}`, `guestRow_${gi}_type`, `guestRow_${gi}_state`, `guestRow_${gi}_time`, `guestRow_${gi}_rest_text`, `guestRow_${gi}_restfulness`, `guestRow_${gi}_rest_end`);
        }
        for (let gli = 0; gli < 5; gli++) {
            createView.queueCache(`guestLogRow_${gli}`, `guestLogRow_${gli}_text`);
        }
        for (let si = 0; si < 3; si++) {
            createView.queueCache(`spiritSlot_hiddenSpring_earth_${si}`, `spiritSlot_hiddenSpring_water_${si}`, `spiritSlot_hiddenSpring_fire_${si}`);
        }
        for (let si = 0; si < 3; si++) {
            createView.queueCache(`spiritSlot_mine_earth_${si}`);
        }
        createView.queueCache("spiritSlots_bambooForest_plant");
        for (let bpi = 0; bpi < 4; bpi++) {
            createView.queueCache(`spiritSlot_bambooForest_plant_${bpi}`);
        }
        for (let pi = 0; pi < 12; pi++) {
            createView.queueCache(`pebbleToken_${pi}`);
        }
        const bfcfg = resortData.bambooForestConfig;
        const bStalks = bfcfg.stalkCount || 4;
        const bRows = bfcfg.rowCount || 3;
        createView.queueCache("bambooChopPower", "bambooAutoRotate_row", "bambooTagline_row");
        for (let bsi = 0; bsi < bStalks; bsi++) {
            createView.queueCache(`bambooCutBtn_${bsi}`, `bambooStatus_${bsi}`, `bambooBaseWood_${bsi}`);
            for (let bri = 0; bri < bRows; bri++) {
                createView.queueCache(`bambooCell_${bsi}_${bri}`, `bambooCellFill_${bsi}_${bri}`, `bambooCellLabel_${bsi}_${bri}`);
            }
        }
        if (typeof engine.getResortPathSegmentSpecs === "function") {
            const pathSpecs = engine.getResortPathSegmentSpecs();
            for (let psi = 0; psi < pathSpecs.length; psi++) {
                createView.queueCache(`baseBuilding_path_${psi}`);
            }
        }
        for (let fui = 0; fui < resortData.foxDenUnlockOrder.length; fui++) {
            const fk = resortData.foxDenUnlockOrder[fui];
            createView.queueCache(`foxDenSlot_${fk}`, `foxDenSlotPct_${fk}`);
        }
        for (let ci = 0; ci < 8; ci++) {
            createView.queueCache(`foxDenCarrier_${ci}`);
        }
        for (let wdi = 0; wdi < (resortData.workerDockSiteKeys || []).length; wdi++) {
            const wsk = resortData.workerDockSiteKeys[wdi];
            createView.queueCache(
                `workerDock_${wsk}`,
                `base_${wsk}_assign_one_btn`, `base_${wsk}_assign_ten_btn`, `base_${wsk}_assign_all_btn`,
                `base_${wsk}_unassign_one_btn`, `base_${wsk}_unassign_ten_btn`, `base_${wsk}_unassign_all_btn`,
                `base_${wsk}_workers_label`, `base_${wsk}_assign_okami_btn`
            );
            createView.queueCache(`base_${wsk}_worker_prod_text`, `base_${wsk}_worker_prod_wrap`, `base_${wsk}_worker_prog_fill`);
        }
        const resortBuildingKeys = Object.keys(resortData.buildings || {});
        for (let rbi = 0; rbi < resortBuildingKeys.length; rbi++) {
            const rbk = resortBuildingKeys[rbi];
            const rbcfg = resortData.buildings[rbk];
            if (!rbcfg || !rbcfg.upgrades) {
                continue;
            }
            const rorder = rbcfg.upgradesOrder || Object.keys(rbcfg.upgrades);
            for (let roi = 0; roi < rorder.length; roi++) {
                const rpk = rorder[roi];
                const rud = rbcfg.upgrades[rpk];
                if (!rud || !rud.key) {
                    continue;
                }
                const rslug = resortData.slug(rud);
                createView.queueCache(
                    resortData.idRow(rbk, rslug),
                    resortData.idExtra(rbk, rslug),
                    resortData.idBtn(rbk, rslug)
                );
            }
        }
        for (let bi = 0; bi < 25; bi++) {
            createView.queueCache(`mineBlock_${bi}`, `mineBlockFill_${bi}`);
        }
        for (let si = 0; si < skills.keysInOrder.length; si++) {
            const sk = skills.keysInOrder[si];
            createView.queueCache(`base_scrollArchives_row_${sk}`, `base_scrollArchives_name_${sk}`, `base_scrollArchives_desc_${sk}`, `base_scrollArchives_progress_${sk}`, `base_scrollArchives_btn_${sk}`, `base_scrollArchives_pause_${sk}`);
        }
        for (let tui = 0; tui < resortData.foxDenUnlockOrder.length; tui++) {
            const kx = resortData.foxDenUnlockOrder[tui];
            createView.queueCache(`base_foxDen_extra_${kx}`, resortData.idRow("foxDen", kx), resortData.idBtn("foxDen", kx));
        }
        createView.clearCacheQueue();
        createView.cacheBuildingNotifyLabels();
        createView.updateLayoutMeasurements();
        createView.buildStaticRangeMarkers();
        if (typeof engine.syncResortPathDom === "function") {
            engine.syncResortPathDom();
        }
        if (typeof view.updatePathSegmentHighlight === "function") {
            view.updatePathSegmentHighlight(null);
        }
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
    /** Range markers are fixed from gameData layout; built once, not updated per frame. */
    buildStaticRangeMarkers: function() {
        createView.syncBattlefieldLayoutFromDom();
        const root = document.getElementById("rangeMarkers");
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
        root.innerHTML = html;
    },
    updateLayoutMeasurements: function() {
        createView.syncBattlefieldLayoutFromDom();
        const menuCol = viewData.cached.menuColumn;
        const battleCol = viewData.cached.battleColumn;
        const infoPanel = viewData.cached.baseBuildingInfo;
        if (menuCol && battleCol) {
            const compactBreakpointPx = 1420;
            const forceWide = !!(data.progress.options && data.progress.options.disableCompactLayout);
            const compactOn = !forceWide && window.innerWidth < compactBreakpointPx;
            const battleVisible = !compactOn && data.progress && data.progress.battleUnlocked && window.getComputedStyle(battleCol).display !== "none";
            if (battleVisible) {
                menuCol.style.maxHeight = `${battleCol.offsetHeight}px`;
            } else {
                menuCol.style.maxHeight = "";
            }
        }
    },
    buildFoxDenMapSlots: function() {
        const pool = document.getElementById("foxDenMapSlotPool");
        if (!pool) {
            return;
        }
        const order = resortData.foxDenUnlockOrder || [];
        let h = "";
        for (let i = 0; i < order.length; i++) {
            const k = order[i];
            h += `<div id="foxDenSlot_${k}" class="fox-den-map-slot" style="display:none"><img class="fox-den-build-art" src="img/build.svg" alt="" draggable="false"><span id="foxDenSlotPct_${k}" class="resort-building-display"></span></div>`;
        }
        pool.innerHTML = h;
    },
    buildPathSegmentSvgLayers: function() {
        const hitLayer = document.getElementById("pathSegmentHitLayer");
        const highlightLayer = document.getElementById("pathSegmentHighlightLayer");
        const trackLayer = document.getElementById("pathSegmentTrackLayer");
        const hollowLayer = document.getElementById("pathSegmentHollowLayer");
        if (!hitLayer || !highlightLayer || !trackLayer || !hollowLayer || typeof engine.getResortPathSegmentSpecs !== "function") {
            return;
        }
        const specs = engine.getResortPathSegmentSpecs();
        const svgNs = "http://www.w3.org/2000/svg";
        hitLayer.innerHTML = "";
        highlightLayer.innerHTML = "";
        trackLayer.innerHTML = "";
        hollowLayer.innerHTML = "";
        for (let i = 0; i < specs.length; i++) {
            const d = engine.getPathSegmentSvgSubpath(i);
            const trackPath = document.createElementNS(svgNs, "path");
            trackPath.id = `pathSegmentTrack_${i}`;
            trackPath.setAttribute("d", d);
            trackPath.setAttribute("class", "path-seg-track path-seg-track-tier-rocks");
            trackPath.setAttribute("fill", "none");
            trackPath.setAttribute("pointer-events", "none");
            trackLayer.appendChild(trackPath);
            const hollowPath = document.createElementNS(svgNs, "path");
            hollowPath.id = `pathSegmentHollow_${i}`;
            hollowPath.setAttribute("d", d);
            hollowPath.setAttribute("class", "path-seg-hollow path-seg-hollow-tier-rocks");
            hollowPath.setAttribute("fill", "none");
            hollowPath.setAttribute("pointer-events", "none");
            hollowLayer.appendChild(hollowPath);
            const hitPath = document.createElementNS(svgNs, "path");
            hitPath.setAttribute("d", d);
            hitPath.setAttribute("class", "path-seg-hit");
            hitPath.setAttribute("data-segment-index", String(i));
            hitPath.setAttribute("fill", "none");
            hitPath.setAttribute("stroke", "transparent");
            hitPath.setAttribute("stroke-width", "18");
            hitPath.setAttribute("pointer-events", "stroke");
            hitLayer.appendChild(hitPath);
            const hiPath = document.createElementNS(svgNs, "path");
            hiPath.id = `pathSegmentHighlight_${i}`;
            hiPath.setAttribute("d", d);
            hiPath.setAttribute("class", "path-seg-highlight");
            hiPath.setAttribute("fill", "none");
            hiPath.setAttribute("stroke-width", "6");
            hiPath.setAttribute("pointer-events", "none");
            highlightLayer.appendChild(hiPath);
        }
        events.bindPathSegmentSvgHandlers();
        events.bindBaseMapRightClick();
        events.bindBaseBuildingInfoDismiss();
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
    cacheBuildingNotifyLabels: function() {
        let bi;
        for (bi = 0; bi < resortData.baseBuildingOrder.length; bi++) {
            const k = resortData.baseBuildingOrder[bi];
            const bel = viewData.cached["baseBuilding_" + k];
            if (!bel) {
                continue;
            }
            const labelEl = bel.querySelector(".resort-building-label-text");
            if (!labelEl) {
                continue;
            }
            const cacheKey = "baseBuildingNotifyLabel_" + k;
            viewData.cached[cacheKey] = labelEl;
            delete viewData.prevValues[cacheKey];
        }
    },
    queueCache: function() {
        Array.prototype.push.apply(idsToCache, arguments);
    }
}