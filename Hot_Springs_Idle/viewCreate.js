
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
        createView.createBattleBuffSlots();
        createView.createSlapFxElements();
        createView.createPlayerFloatElements();
        createView.createIntruderAttackGfxElements();
        createView.createWaveInfoStructure();
        createView.createBaseInfoElements();
        createView.createTravelElements();
        createView.createInfoButtons();
        createView.showCurrentTab();
        createView.setAllCaches(); //happens after generation
    },
    /**
     * Adds a ? info button to the top-right of the element with the given id.
     * Click opens a panel with htmlText; the next click anywhere closes it.
     * Optional x sets the CSS right offset in px (default 4).
     */
    /**
     * Click opens a panel with htmlText; the next click anywhere closes it.
     * Optional x sets the CSS right offset in px (default 4).
     * If htmlText is a function, it is called whenever the panel opens and when
     * createView.refreshInfoButtonPanel(id) runs while open.
     */
    createInfoButton: function(id, htmlText, x) {
        const el = document.getElementById(id);
        if (!el) {
            return;
        }
        const existing = el.querySelector(".info-button-wrap");
        if (existing && existing.parentNode === el) {
            existing.remove();
        }
        const computedPos = window.getComputedStyle(el).position;
        if (computedPos === "static") {
            el.style.position = "relative";
        }
        const rightPx = x == null ? 4 : x;
        const wrap = document.createElement("div");
        wrap.className = "info-button-wrap";
        wrap.style.right = rightPx + "px";
        wrap.dataset.infoButtonFor = id;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "info-button";
        btn.textContent = "?";
        btn.setAttribute("aria-label", "Info");
        const panel = document.createElement("div");
        panel.className = "info-button-panel";
        const resolveHtml = function() {
            return typeof htmlText === "function" ? htmlText() : htmlText;
        };
        panel.innerHTML = resolveHtml();
        wrap._infoResolveHtml = resolveHtml;
        wrap._infoPanel = panel;
        const closePanel = function() {
            wrap.classList.remove("info-button-open");
            document.removeEventListener("click", onDocClick);
        };
        const onDocClick = function() {
            closePanel();
        };
        btn.addEventListener("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (wrap.classList.contains("info-button-open")) {
                closePanel();
                return;
            }
            panel.innerHTML = resolveHtml();
            wrap.classList.add("info-button-open");
            // Next click anywhere closes; defer so this click does not.
            setTimeout(function() {
                document.addEventListener("click", onDocClick);
            }, 0);
        });
        wrap.appendChild(btn);
        wrap.appendChild(panel);
        el.appendChild(wrap);
    },
    refreshInfoButtonPanel: function(id) {
        const el = document.getElementById(id);
        if (!el) {
            return;
        }
        const wrap = el.querySelector(".info-button-wrap");
        if (!wrap || !wrap.classList.contains("info-button-open") || !wrap._infoResolveHtml || !wrap._infoPanel) {
            return;
        }
        wrap._infoPanel.innerHTML = wrap._infoResolveHtml();
    },
    getScrollArchivesInfoHtml: function() {
        const stars = (typeof engine !== "undefined" && engine.countAchievedMapStarsByType)
            ? engine.countAchievedMapStarsByType()
            : { bronze: 0, silver: 0, gold: 0 };
        const bronzeMult = (typeof engine !== "undefined" && engine.getScrollArchivesBronzeResearchCostMult)
            ? engine.getScrollArchivesBronzeResearchCostMult() : 1;
        const silverMult = (typeof engine !== "undefined" && engine.getScrollArchivesSilverResearchSpeedMult)
            ? engine.getScrollArchivesSilverResearchSpeedMult() : 1;
        const goldMult = (typeof engine !== "undefined" && engine.getScrollArchivesGoldResearchGainMult)
            ? engine.getScrollArchivesGoldResearchGainMult() : 1;
        const bronzeStar = `<span class="skill-star-btn skill-star-bronze skill-star-filled">★</span>`;
        const silverStar = `<span class="skill-star-btn skill-star-silver skill-star-filled">★</span>`;
        const goldStar = `<span class="skill-star-btn skill-star-gold skill-star-filled">★</span>`;
        return "<p>Assign researchers to generate research progress. When a research task completes, you get 3 skill choices - select one and weave it with Finish Research to unlock that skill.</p>"
            + `<p>Each ${bronzeStar} reduces research cost by 10%. Total effect with ${stars.bronze} ${bronzeStar}: ${round1Fixed(bronzeMult * 100)}%</p>`
            + `<p>Each ${silverStar} increases research speed by 10%. Total effect with ${stars.silver} ${silverStar}: ${round1Fixed(silverMult * 100)}%</p>`
            + `<p>Each ${goldStar} increases research gain by 10% (does not raise cost). Total effect with ${stars.gold} ${goldStar}: ${round1Fixed(goldMult * 100)}%</p>`;
    },
    createInfoButtons: function() {
        createView.createInfoButton(
            "baseBuildingInfoScroll",
            function() {
                return createView.getScrollArchivesInfoHtml();
            },
            56
        );
        createView.createInfoButton(
            "tabPane_skills",
            "<p>Stars are gained by progressing far enough in a map. They can be assigned and unassigned freely. Each star assigned to a skill multiplies that skill's exp gain by x1.5 (stacks multiplicatively).</p>"
            + "<p><strong>Equipped / Library:</strong> Skills are Offense (red), Defense (green), or Utility (light blue). Equip them into matching slots, or into an Any slot. The Equipped and Library slot columns stay in sync.</p>"
            + "<p><strong>Drag and drop:</strong> Drag skills between compatible slots to rearrange or swap (same column, or typed ↔ Any when the skill fits). Dragging from the Library list onto a specific slot equips into that slot only if it is empty and compatible. Invalid drops do nothing.</p>"
            + "<p><strong>Equip:</strong> From Library skill info, Equip places the skill in the first free matching-category slot, then Any if needed.</p>"
            + "<p><strong>Unequip:</strong> Costs one Unequip Skill Charge. Resets that skill's level and exp to 0, returns assigned stars to your pool, and stops its battle effect immediately. Talent and tips are kept. Charges refill one every 60 minutes (including while offline).</p>"
        );
        createView.createInfoButton(
            "tabPane_stats",
            "<p><strong>Audacity order:</strong> ((Base Aud + card Base Audacity) x Dense Clones + Aud) x Confidence.</p>"
            + "<p><strong>Max Aud recover:</strong> Whenever max Aud increases, recover an equal amount of current Audacity (+max and +current)."
            + "<p><strong>Ego Damage order:</strong> (Base slap + card Base Ego Damage) x Dense Clones, then + flat ego damage from skills, then x Brutality, then x damage multipliers from skills, buffs, and cards.</p>"
            + "<p><strong>Damage reduction order:</strong> (1) Clout absorbs raw incoming damage, (2) flat reduction (Insult Fatigue capped at 50% of raw attack, then Armor and other flats with no such cap), (3) multiplier reductions from skills, buffs, and class.</p>"
        );
    },
    waveInfoZoneSlotCount: 12,
    createWaveInfoStructure: function() {
        const root = document.getElementById("waveInfo");
        if (!root || root.dataset.waveInfoBuilt === "1") {
            return;
        }
        root.dataset.waveInfoBuilt = "1";
        let h = "";
        h += `<div id="waveInfoTimeRow" class="wave-info-time-row"><span id="waveInfoStar" class="wave-info-star-inline skill-star-btn skill-star-bronze" title="Bronze cycle">☆</span><span id="waveInfoTimeLabel" class="wave-info-time-label">Time 0s</span></div>`;
        h += `<div id="waveInfoTransition" style="display:none"></div>`;
        h += `<div id="waveInfoZoneShards" class="wave-info-zone-shard" style="display:none">Shard Drop Amount: 0</div>`;
        h += `<div id="waveInfoZones">`;
        for (let zi = 0; zi < createView.waveInfoZoneSlotCount; zi++) {
            h += `<div id="waveInfoZone_${zi}" class="wave-info-zone-row" style="display:none"></div>`;
        }
        h += `</div>`;
        root.innerHTML = h;
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
                        <div class="travel-map-name"><span class="travel-map-stars-inline"><span id="mapStar_${m.key}_bronze" class="skill-star-btn skill-star-bronze">☆</span><span id="mapStar_${m.key}_silver" class="skill-star-btn skill-star-silver">☆</span><span id="mapStar_${m.key}_gold" class="skill-star-btn skill-star-gold">☆</span></span> [${i + 1}] ${m.name}<span class="muted-text">${classReq}</span></div>
                        <div class="row-buttons travel-map-actions">
                            <label class="travel-map-radio"><input type="radio" name="travelMapSelect" id="travelRadio_${m.key}" onclick="events.selectTravelMap('${m.key}')"> Travel here</label>
                            <span id="mapActionCurrent_${m.key}" class="travel-map-current-label muted-text" style="display:none">Current</span>
                        </div>
                    </div>
                    <div class="travel-map-meta">
                        <div>Difficulty: <span id="mapDifficulty_${m.key}"></span></div>
                        <div># Waves: <span id="mapWaves_${m.key}"></span></div>
                        <div>Shard Drop Amount: <span id="mapShardDrop_${m.key}"></span></div>
                        <div>Kitsune Rescued: <span id="mapWorkers_${m.key}"></span></div>
                    </div>
                    <div class="muted-text">${resortData.insertResourceIcons(m.description || "")}</div>
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
        const bonfireFireSlots = document.getElementById("spiritSlots_bonfire_fire");
        const atelierFireSlots = document.getElementById("spiritSlots_atelier_fire");
        const pebblePool = document.getElementById("pebbleMapPool");
        const assignOkamiBtn = function(siteKey) {
            return `<button id="base_${siteKey}_assign_okami_btn" class="tab-button assign-okami-btn" onclick="events.assignOkami('${siteKey}')">Assign Okami</button>`;
        };
        const foxDenUnlockRowsHtml = function() {
            let h = "";
            const unlockOrder = resortData.getFoxDenUnlockOrder();
            for (let ui = 0; ui < unlockOrder.length; ui++) {
                const k = unlockOrder[ui];
                const bdef = resortData.buildings[k];
                const desc = bdef && bdef.description ? bdef.description : "";
                const label = bdef && bdef.label ? bdef.label : k;
                const rowId = resortData.idRow("foxDen", k);
                const btnId = resortData.idBtn("foxDen", k);
                h += `<div id="${rowId}" class="base-scrollArchives-row base-upgrade-row"><div class="base-upgrade-text"><div class="base-upgrade-name">${label}</div><div class="muted-text base-skill-short">${resortData.insertResourceIcons(desc)}</div><div id="base_foxDen_extra_${k}" class="muted-text"></div></div><button id="${btnId}" class="tab-button" onclick="events.buyUpgrade('foxDenUnlock','${k}')">Plan to build</button></div>`;
            }
            return h;
        };
        const workerProdTextHtml = function(siteKey) {
            const id = `base_${siteKey}`;
            const coinIcon = resortData.resourceIconHtml("coins");
            const beadIcon = resortData.resourceIconHtml("starBeads");
            const manaIcon = resortData.resourceIconHtml("mana");
            const creditIcon = resortData.resourceIconHtml("credit");
            if (siteKey === "mage_tower") {
                return `<span id="${id}_worker_prod_text">Workers for Orb exp: <span id="${id}_wpt_units"></span> (+<span id="${id}_wpt_units_pct"></span>% exp) | Exp: <span id="${id}_wpt_exp"></span>/s | ${manaIcon} Mana: <span id="${id}_wpt_mana"></span>/s<span id="${id}_wpt_okami_wrap" style="display:none"> | Inspiration x<span id="${id}_wpt_okami"></span> on mana</span></span>`;
            }
            if (siteKey === "foxDen") {
                return `<span id="${id}_worker_prod_text">Carriers assigned: <span id="${id}_wpt_carriers"></span> | Carrier speed: <span id="${id}_wpt_speed"></span><span id="${id}_wpt_okami_wrap" style="display:none"> | Okami speed: <span id="${id}_wpt_okami_speed"></span></span></span>`;
            }
            if (siteKey === "scrollArchives") {
                return `<span id="${id}_worker_prod_text">Researchers: <span id="${id}_wpt_researchers"></span> | Research speed: <span id="${id}_wpt_speed"></span>/s<span id="${id}_wpt_okami_wrap" class="muted-text" style="display:none"> (<span id="${id}_wpt_okami"></span>x from inspiration)</span><br>Research: <span id="${id}_wpt_progress"></span> / <span id="${id}_wpt_required"></span> · ETA: <span id="${id}_wpt_eta"></span><br><span id="${id}_wpt_cost_line" class="muted-text">(<span id="${id}_wpt_cost_coins"></span> ${coinIcon} coins/s, <span id="${id}_wpt_cost_beads"></span> ${beadIcon} star beads/s, <span id="${id}_wpt_cost_mana"></span> ${manaIcon} mana/s)</span><span id="${id}_wpt_paused" class="muted-text" style="display:none"><br>Paused - need more ${coinIcon} coins, ${beadIcon} star beads, or ${manaIcon} mana</span><span id="${id}_wpt_choose_wrap" style="display:none"><br>Researches to choose: <span id="${id}_wpt_choose"></span></span></span>`;
            }
            if (siteKey === "bonfire") {
                return `<span id="${id}_worker_prod_text">Carriers assigned: <span id="${id}_wpt_carriers"></span> | Carrier speed: <span id="${id}_wpt_speed"></span> | Okami speed: <span id="${id}_wpt_okami_speed"></span><br>Heat: <span id="${id}_wpt_heat"></span> / <span id="${id}_wpt_heat_next"></span> | Mana Gain Bonus: <span id="${id}_wpt_heat_bonus"></span></span>`;
            }
            if (siteKey === "market") {
                return `<span id="${id}_worker_prod_text">Haulers assigned: <span id="${id}_wpt_carriers"></span> | Carrier speed: <span id="${id}_wpt_speed"></span><span id="${id}_wpt_okami_wrap" style="display:none"> | Okami speed: <span id="${id}_wpt_okami_speed"></span></span><br><span id="${id}_wpt_haul_list_wrap">Hauling: <span id="${id}_wpt_haul_list"></span></span><span id="${id}_wpt_haul_empty" class="muted-text" style="display:none">No resources allowed - check a box to start hauling</span> | ${creditIcon} Credit rate: <span id="${id}_wpt_credit"></span>/s</span>`;
            }
            if (siteKey === "cistern") {
                return `<span id="${id}_worker_prod_text">Carriers assigned: <span id="${id}_wpt_carriers"></span> | Carrier speed: <span id="${id}_wpt_speed"></span><span id="${id}_wpt_okami_wrap" style="display:none"> | Okami speed: <span id="${id}_wpt_okami_speed"></span></span><span id="${id}_wpt_hot_wrap" style="display:none"><br>Onsen Hot Water: <span id="${id}_wpt_hot"></span> / <span id="${id}_wpt_hot_cap"></span><span id="${id}_wpt_hot_note" class="muted-text" style="display:none"> (Cistern water must be above 40C)</span></span></span>`;
            }
            if (siteKey === "torii") {
                return `<span id="${id}_worker_prod_text">Worker Power: <span id="${id}_wpt_rate"></span><span id="${id}_wpt_reduce_wrap" class="muted-text" style="display:none"> | On complete, reduce next visitor by <span id="${id}_wpt_reduce_sec"></span>s</span><span id="${id}_wpt_progress_wrap" style="display:none"><br><span id="${id}_wpt_power"></span>/<span id="${id}_wpt_required"></span> <span class="muted-text">to complete</span> | Reducing <span id="${id}_wpt_reducing"></span>/s</span></span>`;
            }
            if (siteKey === "bambooForest") {
                return `<span id="${id}_worker_prod_text">Worker Power: <span id="${id}_wpt_rate"></span><span id="${id}_wpt_complete_wrap" style="display:none"> | <span id="${id}_wpt_power"></span>/<span id="${id}_wpt_required"></span> <span class="muted-text">to complete</span></span> | ~<span id="${id}_wpt_per_sec"></span>/s</span>`;
            }
            return `<span id="${id}_worker_prod_text">Worker Power: <span id="${id}_wpt_rate"></span><span id="${id}_wpt_complete_wrap" style="display:none"> | <span id="${id}_wpt_power"></span>/<span id="${id}_wpt_required"></span> <span class="muted-text">to complete</span></span> | <span id="${id}_wpt_per_sec"></span>/s</span>`;
        };
        const workerControls = function(siteKey) {
            const p = `'${siteKey}'`;
            const bonfireProg = siteKey === "bonfire";
            const progWrapClass = bonfireProg
                ? "prog-track bonfire-worker-prog-wrap"
                : "prog-track skill-prog-mini";
            const progFillClass = bonfireProg
                ? "prog-fill prog-fill-bonfire-heat worker-prog-fill-instant"
                : "prog-fill prog-fill-skill worker-prog-fill-instant";
            return `
                <div class="base-worker-assign-row">
                    <button id="base_${siteKey}_unassign_all_btn" class="tab-button" onclick="events.adjustWorkers(${p}, 'all_dec')"><<</button>
                    <button id="base_${siteKey}_unassign_ten_btn" class="tab-button" onclick="events.adjustWorkers(${p}, 'ten_dec')">--</button>
                    <button id="base_${siteKey}_unassign_one_btn" class="tab-button" onclick="events.adjustWorkers(${p}, 'one_dec')">-</button>
                    <span class="base-worker-cap-label">Assign ${resortData.resourceIconHtml("kitsune")} Kitsune</span>
                    <button id="base_${siteKey}_assign_one_btn" class="tab-button" onclick="events.adjustWorkers(${p}, 'one_inc')">+</button>
                    <button id="base_${siteKey}_assign_ten_btn" class="tab-button" onclick="events.adjustWorkers(${p}, 'ten_inc')">++</button>
                    <button id="base_${siteKey}_assign_all_btn" class="tab-button" onclick="events.adjustWorkers(${p}, 'all_inc')">>></button>
                    <span id="base_${siteKey}_workers_label" class="base-worker-cap-label muted-text"></span>
                </div>
                <div class="base-row base-worker-power-row">
                    ${workerProdTextHtml(siteKey)}
                    <div id="base_${siteKey}_worker_prod_wrap" class="${progWrapClass}">
                        <div id="base_${siteKey}_worker_prog_fill" class="${progFillClass}"></div>
                    </div>
                </div>
                ${assignOkamiBtn(siteKey)}
            `;
        };
        const resortUpgradeRowsHtml = function(scopeKey, excludeKeys, opts) {
            const cfg = resortData.buildings[scopeKey];
            if (!cfg || !cfg.upgradesOrder) {
                return "";
            }
            const order = cfg.upgradesOrder || [];
            const exclude = excludeKeys || [];
            let h = "";
            let first = true;
            for (let oi = 0; oi < order.length; oi++) {
                const pk = order[oi];
                if (exclude.indexOf(pk) >= 0) {
                    continue;
                }
                const ud = cfg.upgrades[pk];
                if (!ud) {
                    continue;
                }
                if (first) {
                    if (!(opts && opts.skipDivider)) {
                        h += `<div class="base-upgrade-divider"></div>`;
                    }
                    first = false;
                }
                const slug = resortData.slug(ud);
                const rowId = resortData.idRow(scopeKey, slug);
                const btnId = resortData.idBtn(scopeKey, slug);
                const extraId = resortData.idExtra(scopeKey, slug);
                const descId = `base_${scopeKey}_desc_${slug}`;
                const descText = typeof ud.description === "function" ? ud.description() : (ud.description || "");
                h += `<div id="${rowId}" class="base-scrollArchives-row base-upgrade-row"><div class="base-upgrade-text"><div class="base-upgrade-name">${ud.name || ""}</div><div id="${descId}" class="muted-text base-skill-short">${resortData.insertResourceIcons(descText)}</div><div id="${extraId}" class="muted-text"></div></div><button id="${btnId}" class="tab-button" onclick="events.buyUpgrade('${scopeKey}','${pk}')">Buy for</button></div>`;
            }
            return h;
        };
        const buildingManaRowHtml = function(buildingKey, explainText) {
            return `
                    <div id="${buildingKey}ManaRow" class="base-row building-mana-row" style="display:none">
                        <button type="button" id="${buildingKey}FillMana_btn" class="tab-button" onclick="events.startFillMana('${buildingKey}')">Fill Mana</button>
                        <div id="${buildingKey}ManaProgressWrap" class="prog-track game-progress-track building-mana-prog-track">
                            <div id="${buildingKey}ManaFill" class="prog-fill prog-fill-mana"></div>
                            <div class="game-progress-bar-label">Mana: <span id="${buildingKey}ManaAmount" class="game-progress-bold">0</span>/<span id="${buildingKey}ManaCap" class="game-progress-bold">1000</span></div>
                        </div>
                    </div>
                    <div id="${buildingKey}AllowCarriersMana_row" class="base-row" style="display:none"><label><input type="checkbox" id="${buildingKey}AllowCarriersMana_chk" onchange="events.toggleBuildingAllowCarriersMana('${buildingKey}', this.checked)"> Allow carriers to bring mana</label></div>
                    ${explainText ? `<div id="${buildingKey}ManaExplain_row" class="base-row muted-text" style="display:none">${explainText}</div>` : ""}`;
        };
        const htmlBonfirePanel = function() {
            return `
                <div id="bonfireCloneSettings_row" class="base-row muted-text" style="display:none">Current settings: <span id="bonfireCloneSettings_map"></span> · Density <span id="bonfireCloneSettings_density">0</span></div>
                <button type="button" id="base_bonfire_clone_btn" class="tab-button bonfire-clone-btn" onclick="events.startBonfireClone()"><span id="base_bonfire_clone_prefix">Create a clone for</span> <span id="base_bonfire_mana_cost">0 mana</span></button>
                <div id="bonfireApplyLiveSettings_row" class="base-row" style="display:none"><label><input type="checkbox" id="bonfireApplyLiveSettings_chk" onchange="events.toggleBonfireApplyLiveSettings(this.checked)"> Apply setting changes to the next clone</label></div>
                <div id="bonfireDenseClones_row" class="base-row" style="display:none">
                    <div class="base-worker-assign-row">
                        <button type="button" id="bonfireDenseClones_dec_all" class="tab-button" onclick="events.adjustCloneDensity('all_dec')"><<</button>
                        <button type="button" id="bonfireDenseClones_dec_ten" class="tab-button" onclick="events.adjustCloneDensity('ten_dec')">--</button>
                        <button type="button" id="bonfireDenseClones_dec_one" class="tab-button" onclick="events.adjustCloneDensity('one_dec')">-</button>
                        <span class="base-worker-cap-label">Density <span id="bonfireDenseClones_value">0</span></span>
                        <button type="button" id="bonfireDenseClones_inc_one" class="tab-button" onclick="events.adjustCloneDensity('one_inc')">+</button>
                        <button type="button" id="bonfireDenseClones_inc_ten" class="tab-button" onclick="events.adjustCloneDensity('ten_inc')">++</button>
                        <button type="button" id="bonfireDenseClones_inc_all" class="tab-button" onclick="events.adjustCloneDensity('all_inc')">>></button>
                    </div>
                    <div class="muted-text">Each density adds 500 base mana cost and +10% base Aud and ego damage. Max is half the Orb level, if affordable.</div>
                </div>
                <div id="bonfireAutoRetry_row" class="base-row" style="display:none">
                    <label><input type="checkbox" id="bonfireAutoRetry_chk" onchange="events.toggleBonfireAutoRetry(this.checked)"> Retry after the clone disperses</label>
                </div>
                <div id="bonfireStartWithFullMana_row" class="base-row" style="display:none">
                    <label><input type="checkbox" id="bonfireStartWithFullMana_chk" onchange="events.toggleVentingSurplus(this.checked)"> Start when full Mana</label>
                </div>
                <div id="bonfireFireTending_row" class="base-row" style="display:none">
                    <label><input type="checkbox" id="bonfireFireTending_chk" checked onchange="events.toggleBonfireFireTending(this.checked)"> Only bring wood or coal while heat is below</label>
                    <input type="number" id="bonfireFireTending_cap" class="bonfire-fire-tending-cap" min="0" step="1" value="55" onchange="events.setBonfireFireTendingCap(this.value)">
                    <span class="muted-text">Assigned carriers skip trips when heat is at or above this value.</span>
                </div>
                <div id="bonfireFireSpiritPower_row" class="base-row" style="display:none">Assigned fire spirit power (base + training): <span id="bonfireFireSpiritPower">0</span></div>
                <div id="bonfireFireSpiritHeat_row" class="base-row muted-text" style="display:none"></div>
                <div id="bonfireWoodCarry_row" class="base-row" style="display:none"><span id="bonfireWoodCarryLabel">Wood carry</span>: <span id="bonfireWoodCarry"></span> per trip</div>
                <div id="bonfireHeatPerFuel_row" class="base-row" style="display:none">1 wood gives <span id="bonfireHeatPerWood"></span> heat<span id="bonfireHeatPerCoalPart" style="display:none"> | 1 coal gives <span id="bonfireHeatPerCoal"></span> heat</span></div>
                <div id="bonfireCoal_row" class="base-row" style="display:none">Coal: <span id="bonfireCoalText">0</span> <span class="muted-text">Carriers bring coal from the Market before wood. Each coal gives 5x the heat of wood.</span></div>
                ${resortUpgradeRowsHtml("bonfire")}
            `;
        };
        const htmlShrineMilestoneHeading = function(text, split) {
            return `<div class="shrine-milestone-heading${split ? " shrine-milestone-heading--split" : ""}">${text}</div>`;
        };
        const htmlShrineFixedMilestone = function(id, name, thresholds, packImgs) {
            let markers = "";
            let ticks = "";
            let values = "";
            const n = thresholds.length;
            for (let i = 0; i < n; i++) {
                const left = ((i + 1) / n) * 100;
                markers += `<div class="shrine-milestone-marker" style="left:${left}%"><img id="shrineMs_${id}_icon_${i}" class="shrine-pack-icon shrine-milestone-pack-icon" src="${packImgs[i]}" alt="" draggable="false"></div>`;
                ticks += `<div class="shrine-milestone-tick" style="left:${left}%"><span class="shrine-milestone-tick-line"></span></div>`;
                values += `<div class="shrine-milestone-value" style="left:${left}%">${thresholds[i]}</div>`;
            }
            return `<div class="shrine-milestone shrine-milestone-capped" id="shrineMs_${id}_wrap">
                <div class="shrine-milestone-name">${name} <span id="shrineMs_${id}_check" class="shrine-milestone-check" style="visibility:hidden">&#10003;</span></div>
                <div class="shrine-milestone-markers">${markers}</div>
                <div class="shrine-milestone-bar">
                    <div class="prog-track shrine-milestone-track"><div id="shrineMs_${id}_fill" class="prog-fill prog-fill-milestone"></div></div>
                    <div class="shrine-milestone-ticks">${ticks}</div>
                </div>
                <div class="shrine-milestone-values">${values}</div>
            </div>`;
        };
        const htmlShrineEscalatingMilestone = function(id, name, packImg) {
            return `<div class="shrine-milestone" id="shrineMs_${id}_wrap">
                <div class="shrine-milestone-name">${name} <span class="muted-text" id="shrineMs_${id}_progress">0 / 0</span><span class="muted-text" id="shrineMs_${id}_completed"></span></div>
                <div class="shrine-milestone-markers"><div class="shrine-milestone-marker" style="left:100%"><img id="shrineMs_${id}_icon" class="shrine-pack-icon shrine-milestone-pack-icon" src="${packImg}" alt="" draggable="false"></div></div>
                <div class="prog-track shrine-milestone-track"><div id="shrineMs_${id}_fill" class="prog-fill prog-fill-milestone"></div></div>
            </div>`;
        };
        const htmlShrineOnceMilestone = function(id, name, packImg) {
            return `<div class="shrine-milestone shrine-milestone-once" id="shrineMs_${id}_wrap">
                <div class="shrine-milestone-name">${name}</div>
                <div class="shrine-milestone-once-reward">
                    <img id="shrineMs_${id}_icon" class="shrine-pack-icon shrine-milestone-pack-icon" src="${packImg}" alt="" draggable="false">
                    <span id="shrineMs_${id}_check" class="shrine-milestone-check" style="visibility:hidden">&#10003;</span>
                </div>
            </div>`;
        };
        const htmlShrinePanel = function() {
            let classBtns = "";
            for (let ci = 0; ci < bonfireClassOrder.length; ci++) {
                const ck = bonfireClassOrder[ci];
                const d = bonfire.getClassDef(ck);
                classBtns += `<button type="button" id="shrine_class_btn_${ck}" class="shrine-class-btn" onclick="events.selectShrineClass('${ck}')"><img class="bonfire-pick-img" src="${d.image}" alt="" draggable="false"><span class="bonfire-pick-label">${d.shortLabel}</span></button>`;
            }
            const commonImg = "img/common.svg";
            const rareImg = "img/rare.svg";
            const epicImg = "img/epic.svg";
            const shrineLevelPacks = engine.shrineLevelMilestonePacks.map(function(rarity) { return `img/${rarity}.svg`; });
            const starPacks = [commonImg, commonImg, commonImg, rareImg, rareImg, epicImg];
            const okamiPacks = [commonImg, commonImg, rareImg, rareImg, epicImg, epicImg, epicImg, epicImg];
            return `
                <div class="base-row muted-text">Karma/s = (total talent levels x star score x total spirit levels x Okami level x Okami tails) / 10,000,000. Star score is bronze + 2xsilver + 4xgold. Okami gains a tail every 10 levels.<br>Each shrine level grants +0.1 divinity/s.</div>
                <div class="base-row">Karma: <span id="shrineKarmaRateText">0</span>/s<span class="game-progress-sep">|</span>Divinity: <span id="shrineDivinityRateText">0</span>/s</div>
                <div id="shrineExpProgressWrap" class="prog-track orb-exp-prog-track">
                    <div id="shrineExpFill" class="prog-fill prog-fill-karma"></div>
                    <div class="game-progress-bar-label">Level <span id="shrineLevelText" class="game-progress-bold">0</span><span class="game-progress-sep">|</span>Karma <span id="shrineExpText" class="game-progress-bold">0</span> / <span id="shrineExpToLevelText" class="game-progress-bold">10000</span></div>
                </div>
                <div id="shrinePacksSection" class="shrine-packs-section">
                    <div id="shrinePackStrip" class="shrine-pack-strip">
                        <span class="shrine-pack-strip-item"><img class="shrine-pack-icon" src="${commonImg}" alt="" draggable="false"> Common Packs: <span id="shrinePackCommonCount">0</span></span>
                        <span class="shrine-pack-strip-item"><img class="shrine-pack-icon" src="${rareImg}" alt="" draggable="false"> Rare Packs: <span id="shrinePackRareCount">0</span></span>
                        <span class="shrine-pack-strip-item"><img class="shrine-pack-icon" src="${epicImg}" alt="" draggable="false"> Epic Packs: <span id="shrinePackEpicCount">0</span></span>
                    </div>
                    <div id="shrineMilestonesList" class="shrine-milestones-list">
                        ${htmlShrineMilestoneHeading("Capped Milestones", false)}
                        ${htmlShrineFixedMilestone("shrineLevel", "Shrine Level", engine.shrineLevelMilestoneThresholds, shrineLevelPacks)}
                        ${htmlShrineFixedMilestone("totalStars", "Total Stars", [5, 10, 15, 20, 25, 30], starPacks)}
                        ${htmlShrineFixedMilestone("okamiLevel", "Okami Level", [10, 20, 30, 40, 50, 60, 70, 80], okamiPacks)}
                        ${htmlShrineMilestoneHeading("Repeating Milestones", true)}
                        ${htmlShrineEscalatingMilestone("marketLevel", "Market Level", commonImg)}
                        ${htmlShrineEscalatingMilestone("depthReached", "Depth Reached", commonImg)}
                        ${htmlShrineEscalatingMilestone("orbLevel", "Orb Level", commonImg)}
                        ${htmlShrineEscalatingMilestone("essenceMade", "Essence Made in this Resort", rareImg)}
                        ${htmlShrineEscalatingMilestone("maxMana", "Max Mana", rareImg)}
                        ${htmlShrineEscalatingMilestone("divinityAmount", "Divinity Amount", commonImg)}
                        ${htmlShrineEscalatingMilestone("totalGoldStars", "Total Gold Stars", rareImg)}
                        ${htmlShrineMilestoneHeading("One Time Milestones", true)}
                        ${htmlShrineOnceMilestone("buildShrine", "Build Shrine", epicImg)}
                    </div>
                </div>
                <div id="shrinePrestigeHeading">
                    <div class="base-upgrade-divider"></div>
                    <div class="base-info-title">Prestige</div>
                </div>
                <div id="shrineClassSelectRow" class="base-row">Select a class:</div>
                <div id="shrineClassRow" class="shrine-class-row">${classBtns}</div>
                <div id="shrinePrestigeNote" class="base-row muted-text">Moving to a new mountain resets the resort to a fresh start. Divinity max increases by the total talent levels of unlocked skills. Card bonuses, noodle bar tips, and that Divinity max are kept.</div>
                <div id="shrineMoveMountainRow" class="base-row shrine-move-row">
                    <label class="shrine-move-confirm"><input type="checkbox" id="shrineMoveConfirm_chk" onchange="events.toggleShrineMoveConfirm(this.checked)"> Confirm</label>
                    <button type="button" id="shrineMoveMountainBtn" class="tab-button" onclick="events.moveToNewMountain()" disabled>Move to a new Mountain (Prestige)</button>
                </div>
                <div id="shrineMovePackError" class="shrine-move-pack-error" style="display:none">At least 1 pack is required.</div>
                <div id="shrineClassDemoNote" class="shrine-class-demo-note" style="display:none">Other classes not available in the demo. They will be available in the Steam version (WIP)!</div>
                ${resortUpgradeRowsHtml("shrine", null, { skipDivider: true })}
            `;
        };
        const scrollArchivesChoicesHtml = function() {
            let choiceCols = "";
            for (let ci = 0; ci < 3; ci++) {
                choiceCols += `<div id="scrollArchivesChoice_${ci}" class="scroll-archives-choice-col" style="display:none"><div id="scrollArchivesChoiceSlotCat_${ci}" class="scroll-archives-choice-slot-cat" style="display:none"></div><div id="scrollArchivesChoiceType_${ci}" class="muted-text scroll-archives-choice-type"></div><div id="scrollArchivesChoiceDesc_${ci}" class="base-skill-short scroll-archives-choice-desc"></div><div id="scrollArchivesChoiceTips_${ci}" class="muted-text scroll-archives-choice-tips" style="display:none"></div><label class="scroll-archives-choice-select"><input type="radio" name="scrollArchivesResearchPick" id="scrollArchivesChoiceRadio_${ci}" onchange="events.selectScrollResearchChoice(${ci})"> Select</label></div>`;
            }
            return choiceCols;
        };
        const htmlScrollArchivesPanel = function() {
            return `
                <div class="base-row">Research: <span id="scrollArchivesResearchProgressText">0</span> / <span id="scrollArchivesResearchRequiredText">10</span><span class="game-progress-sep">|</span>ETA: <span id="scrollArchivesResearchEtaText">-</span></div>
                <div id="scrollArchivesStarEffects_row" class="base-row muted-text"></div>
                <div id="scrollArchivesResearchPaused_row" class="base-row muted-text" style="display:none">Paused - need more coins, star beads, or mana</div>
                <div class="base-row">Choose Research: <span id="scrollArchivesResearchesToChoose">0</span></div>
                <div id="scrollArchivesChoicesWrap" style="display:none">
                    <div class="scroll-archives-choices-grid">${scrollArchivesChoicesHtml()}</div>
                    <div id="base_scrollArchives_row_finish_research" class="base-scrollArchives-row base-upgrade-row">
                        <div class="base-upgrade-text">
                            <div class="base-upgrade-name">Finish Research</div>
                            <div id="base_scrollArchives_extra_finish_research" class="muted-text"></div>
                        </div>
                        <button id="base_scrollArchives_finish_research_btn" class="tab-button" onclick="events.buyUpgrade('scrollArchives','finishResearch')">Finish Research</button>
                    </div>
                </div>
                ${resortUpgradeRowsHtml("scrollArchives", ["finishResearch"])}
            `;
        };
        const htmlMarketTradeRows = function() {
            const order = resortData.marketTradesOrder || [];
            let h = "";
            for (let ti = 0; ti < order.length; ti++) {
                const tk = order[ti];
                const td = resortData.marketTrades[tk];
                if (!td) {
                    continue;
                }
                h += `
                    <div id="marketTrade_${tk}_row" class="base-scrollArchives-row base-upgrade-row">
                        <div class="base-upgrade-text">
                            <div class="base-upgrade-name"><label><input type="checkbox" id="marketTrade_${tk}_chk" onchange="events.toggleMarketTrade('${tk}', this.checked)"> ${td.name}</label></div>
                            <div class="muted-text base-skill-short">Buys ${td.yieldAmount} ${td.name.toLowerCase()} per trade. ${td.note || ""}</div>
                            <div id="marketTrade_${tk}_threshold_row" class="base-row" style="display:none">Only buy while below <input type="number" id="marketTrade_${tk}_threshold" class="market-trade-threshold" min="0" step="1" value="0" onchange="events.setMarketTradeThreshold('${tk}', this.value)"> <span class="muted-text">(0 means no limit)</span></div>
                            <div id="marketTrade_${tk}_extra" class="muted-text"></div>
                        </div>
                        <div class="market-trade-side">
                            <div id="marketTrade_${tk}_stock" class="market-trade-stock"></div>
                            <div id="marketTrade_${tk}_prog_wrap" class="prog-track skill-prog-mini market-trade-prog" style="display:none"><div id="marketTrade_${tk}_prog_fill" class="prog-fill prog-fill-market-exp"></div></div>
                        </div>
                    </div>`;
            }
            return h;
        };
        const htmlMarketHaulToggles = function() {
            const credit = resortData.resourceIconHtml("credit");
            const order = resortData.marketHaulResourceOrder || [];
            const rates = resortData.marketCreditPerResource || {};
            const names = { stone: "Stone", wood: "Wood", bars: "Bars" };
            let h = "";
            for (let hi = 0; hi < order.length; hi++) {
                const key = order[hi];
                const idKey = key.charAt(0).toUpperCase() + key.slice(1);
                const name = names[key] || key;
                h += `<label><input type="checkbox" id="marketAllow${idKey}_chk" onchange="events.toggleMarketHaulResource('${key}', this.checked)"> ${name} (${rates[key] || 0} ${credit})</label> `;
            }
            return h;
        };
        const htmlMarketPanel = function() {
            const credit = resortData.resourceIconHtml("credit");
            return `
                <div class="base-row muted-text">Assigned Kitsune haul goods here and sell them for Credit. Credit is only spent at the Market. Each Credit gained is 1 Market exp.</div>
                <div class="base-row">${credit} Credit: <span id="marketCreditText"></span></div>
                <div id="marketExpProgressWrap" class="prog-track orb-exp-prog-track">
                    <div id="marketExpFill" class="prog-fill prog-fill-market-exp"></div>
                    <div class="game-progress-bar-label">Level <span id="marketLevelText" class="game-progress-bold">0</span><span class="game-progress-sep">|</span><span id="marketExpText" class="game-progress-bold">0</span> / <span id="marketExpToLevelText" class="game-progress-bold">30000</span></div>
                </div>
                <div class="base-row">
                    <button type="button" id="marketExchangeCredit_btn" class="tab-button" onclick="events.startExchangeCredit()">Exchange 1000 coins for 1000 credits</button>
                    <label id="marketRepeatExchange_row" style="display:none"><input type="checkbox" id="marketRepeatExchange_chk" onchange="events.toggleMarketRepeatExchange(this.checked)"> Repeat when ready</label>
                </div>
                <div class="base-row">Allow resources:
                    ${htmlMarketHaulToggles()}
                </div>
                <div class="base-row muted-text">Haulers carry <span id="marketCarryAmountText"></span> per trip, alternate between the allowed resources, and only leave when the full amount is available.</div>
                ${resortUpgradeRowsHtml("market")}
                <div class="base-upgrade-divider"></div>
                <div class="base-info-title">Market Resources</div>
                <div class="base-row muted-text">Traders buy these on their own; the Okami cannot buy them. Trade time is fixed and is not shortened by spirit strands. Each extra Trader divides the time. Traders rotate between selected trades. Unchecking a trade in progress pauses it (credit stays spent) and the trader moves to the next checked trade.</div>
                <div class="base-worker-assign-row">
                    <button id="base_market_traders_unassign_all_btn" class="tab-button" onclick="events.adjustWorkers('market_traders', 'all_dec')"><<</button>
                    <button id="base_market_traders_unassign_ten_btn" class="tab-button" onclick="events.adjustWorkers('market_traders', 'ten_dec')">--</button>
                    <button id="base_market_traders_unassign_one_btn" class="tab-button" onclick="events.adjustWorkers('market_traders', 'one_dec')">-</button>
                    <span class="base-worker-cap-label">Assign ${resortData.resourceIconHtml("kitsune")} Traders</span>
                    <button id="base_market_traders_assign_one_btn" class="tab-button" onclick="events.adjustWorkers('market_traders', 'one_inc')">+</button>
                    <button id="base_market_traders_assign_ten_btn" class="tab-button" onclick="events.adjustWorkers('market_traders', 'ten_inc')">++</button>
                    <button id="base_market_traders_assign_all_btn" class="tab-button" onclick="events.adjustWorkers('market_traders', 'all_inc')">>></button>
                    <span id="base_market_traders_workers_label" class="base-worker-cap-label muted-text"></span>
                </div>
                <div id="marketTradeStatus_row" class="base-row muted-text"></div>
                ${htmlMarketTradeRows()}
            `;
        };
        const htmlNoodleTipRows = function() {
            let h = "";
            for (let ni = 0; ni < 5; ni++) {
                h += `
                    <div id="noodleTipSkill_${ni}" class="noodle-tip-skill" style="display:none">
                        <div class="noodle-tip-skill-header">
                            <label class="noodle-tip-skill-label"><input type="radio" name="noodleTipSkill" id="noodleTipSkill_${ni}_radio" onchange="events.selectNoodleTipSkill(this.value)"> <span id="noodleTipSkill_${ni}_name"></span></label>
                            <span id="noodleTipSkill_${ni}_tips" class="muted-text noodle-tip-skill-meta"></span>
                        </div>
                        <div id="noodleTipSkill_${ni}_desc" class="muted-text base-skill-short"></div>
                    </div>`;
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
                <div id="baseBuildingInfoHeaderBtns" class="base-info-header-btns">
                    <button type="button" id="baseBuildingInfoHideToggle" class="base-info-hide-btn" title="Hide Info" style="display:none" onclick="events.toggleSpiritInfoCollapsed()">Hide Info</button>
                    <button type="button" id="baseBuildingInfoClose" class="base-info-close-btn" title="Close" onclick="events.closeBaseBuildingInfo()">x</button>
                </div>
                <div id="baseBuildingInfoScroll" class="base-info-scroll">
                <div id="resortInfo_empty" class="resort-info-section resort-info-visible"></div>
                <div id="resortInfo_hiddenSpring" class="resort-info-section">
                    <div class="base-info-title">Hidden Spring</div>
                    <div class="base-row muted-text">A quiet spring above the resort where spirits gather.</div>
                    <div id="hiddenSpringCollectStone_row" class="base-row">
                        <button type="button" id="hiddenSpringCollectStone_btn" class="tab-button" onclick="events.startCollectStone()">Collect 4 Stone</button>
                    </div>
                    ${buildingManaRowHtml("hiddenSpring", "Send Mana Clone costs 2000 mana plus the amount that will be deposited (up to Hidden Spring's remaining capacity). This takes concentration from the Okami.")}
                    ${resortUpgradeRowsHtml("hiddenSpring")}
                </div>
                <div id="resortInfo_spirit" class="resort-info-section">
                    <div class="base-info-title spirit-info-name-row">
                        <span id="spiritInfoTitle">Spirit</span>
                        <button type="button" id="spiritInfoRenameBtn" class="spirit-rename-btn" title="Rename" aria-label="Rename spirit" onclick="events.beginSpiritRename()"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg></button>
                        <input type="text" id="spiritInfoNameInput" class="spirit-rename-input" maxlength="32" autocomplete="off" spellcheck="false" style="display:none" oninput="events.filterSpiritNameInput(this)" onkeydown="events.spiritNameInputKeydown(event)">
                    </div>
                    <div class="base-row">Level: <span id="spiritInfoLevel"></span></div>
                    <div class="base-row">Spirit power: <span id="spiritInfoPower"></span> <span id="spiritInfoPowerNote" class="muted-text"></span></div>
                    <div id="spiritInfoTrainingRow" class="base-row" style="display:none">Spirit Training: <span id="spiritInfoTraining"></span></div>
                    <div id="spiritInfoTrainingNote" class="base-row muted-text" style="display:none">Assigned to the Spirit Training Spot. When Hidden Spring has at least <span id="spiritTrainingMinManaText">500</span> mana and Spirit Training is below Spirit Power, trains for <span id="spiritTrainingDurationText">60</span>s, then spends <span id="spiritTrainingCostText">500</span> Hidden Spring mana to gain <span id="spiritTrainingExpText">60</span> exp and +<span id="spiritTrainingGainText">0.1</span> training. Training cannot exceed Spirit Power. Training adds to Spirit Power for all effects.</div>
                    <div class="base-row">Exp: <span id="spiritInfoExp"></span>/<span id="spiritInfoExpReq"></span> <span id="spiritInfoExpNote" class="muted-text">(x1.8/lvl)</span></div>
                    <div id="spiritInfoEarthExtras">
                        <div class="base-row">Pebbles active: <span id="spiritInfoPebbles"></span>/<span id="spiritInfoPebblesMax"></span></div>
                        <div class="base-row">Pebble carry: <span id="spiritInfoPebbleCarry"></span> stone/ore <span class="muted-text">floor(√effective spirit power), +20% per Pebble Pay, rounded up</span></div>
                        <div id="spiritInfoPebbleEtas" class="base-row" style="display:none"></div>
                        <div class="base-row muted-text">The Earth Spirit can be assigned to the Mine to get Exp and valuable resources, or it can be assigned to the Hidden Spring to create pebbles along the path and send the resources to the resort.</div>
                        <div id="spiritInfoPrioritizeOreRow" class="base-row" style="display:none"><label><input type="checkbox" id="spiritInfoPrioritizeOre_chk" onchange="events.toggleSpiritPrioritizeOre(this.checked)"> Prioritize ore over stone</label></div>
                        <div id="spiritInfoAutoReturnMineRow" class="base-row" style="display:none"><label><input type="checkbox" id="spiritInfoAutoReturnMine_chk" checked onchange="events.toggleSpiritAutoReturnToMine(this.checked)"> Return to the Mine when there is no stone or ore to send as pebbles</label></div>
                    </div>
                    <div id="spiritInfoWaterExtras" style="display:none">
                        <div class="base-row">Water volume: <span id="spiritInfoWaterVolume"></span></div>
                        <div class="base-row">Heat: <span id="spiritInfoHeat"></span></div>
                        <div class="base-row">Essence: <span id="spiritInfoEssence"></span></div>
                        <div id="spiritInfoEqualSpacingRow" class="base-row" style="display:none"><label><input type="checkbox" id="spiritInfoEqualSpacing_chk" onchange="events.toggleEqualDropletSpacing(this.checked)"> Create droplets with equal spacing</label></div>
                        <div id="spiritInfoDropletEtas" class="base-row" style="display:none"></div>
                    </div>
                    <div id="spiritInfoFireExtras" style="display:none">
                        <div id="spiritInfoFireNote" class="base-row muted-text"></div>
                        <div id="spiritInfoFireLauncherExtras" style="display:none">
                            <div class="base-row">Launcher: <span id="spiritInfoFireLauncherName"></span></div>
                            <div class="base-row">Embers: <span id="spiritInfoFireLauncherEmbers"></span>/<span id="spiritInfoFireLauncherEmbersCap"></span></div>
                            <div class="base-row muted-text" id="spiritInfoFireLauncherStats"></div>
                            <div class="base-row"><button type="button" id="spiritInfoSelectLauncher_btn" class="tab-button" onclick="events.selectAssignedFireLauncher()">Select Launcher</button></div>
                        </div>
                    </div>
                    <div id="spiritInfoPlantExtras" style="display:none">
                        <div class="base-row">Bamboo column: <span id="spiritInfoPlantColumn"></span></div>
                        <div class="base-row" id="spiritInfoPlantChipsBonus"></div>
                        <div class="base-row muted-text">Plant spirits gain 1 exp each time a chip regrows in their assigned bamboo column. They add their effective spirit power (base + training) to the base chips of the bamboo.</div>
                    </div>
                    <div id="spiritInfoTaskWrap">
                        <div id="spiritInfoTaskText" class="base-row base-gap-top"></div>
                        <div id="spiritInfoTaskProgressWrap" class="prog-track skill-prog-mini"><div id="spiritInfoTaskFill" class="prog-fill prog-fill-skill"></div></div>
                    </div>
                </div>
                <div id="resortInfo_torii" class="resort-info-section">
                    <div class="base-info-title">Zenko Torii Gate</div>
                    <div class="base-row muted-text">Invites visitors the resort. They move to the Inn if possible.</div>
                    <div class="base-row">Visitors at the gate: <span id="toriiVisitorsWaiting"></span>/<span id="toriiVisitorsMax"></span></div>
                    <div class="base-row">Next visitor: <span id="toriiNextVisitor"></span><span id="toriiAvgVisitorArrival" class="muted-text"></span></div>
                    <div id="toriiNextVisitorProgressWrap" class="base-mini-progress torii-next-visitor-progress" style="display:none"><div id="toriiNextVisitorProgressFill" class="base-mini-progress-fill"></div></div>
                    ${buildingManaRowHtml("torii", "Enticing Lights use 10 mana/s to make visitors arrive every 30 seconds instead of 60 while the gate is not full. Fill Mana weaves Okami to transfer global mana into this reservoir.")}
                    <div id="toriiWater_row" class="base-row" style="display:none">
                        <div class="prog-track game-progress-track water-prog-track">
                            <div id="toriiWaterFill" class="prog-fill prog-fill-water"></div>
                            <div id="toriiWaterText" class="game-progress-bar-label">Hot Water: 0/200</div>
                        </div>
                    </div>
                    <div id="toriiAllowCarriersWater_row" class="base-row" style="display:none"><label><input type="checkbox" id="toriiAllowCarriersWater_chk" onchange="events.toggleBuildingAllowCarriersWater('torii', this.checked)"> Allow carriers to bring water</label></div>
                    <div id="toriiWaterReq_row" class="base-row muted-text" style="display:none">Requires 50L of water of at least 26C. When a visitor arrives and the gate can hold two, two visitors arrive and 50L is spent.</div>
                    ${resortUpgradeRowsHtml("torii")}
                </div>
                <div id="resortInfo_inn" class="resort-info-section">
                    <div id="innInfoTitle" class="base-info-title">Tatami Inn</div>
                    ${buildingManaRowHtml("inn", "Gentle Lights use 5 mana/s per occupied room and grant +2 restfulness/s while mana is available. Fill Mana weaves Okami to transfer global mana into this reservoir.")}
                    <div class="base-row">
                        <div>Rooms available: <span id="innRoomsAvailable"></span></div>
                        <div>Rooms occupied: <span id="innRoomsOccupied"></span></div>
                        <div>Guests gain +<span id="innRestfulnessPerSecond"></span>/s restfulness while occupying a room.</div>
                    </div>
                    <div id="innHotWater_row" class="base-row" style="display:none">
                        <div class="prog-track game-progress-track water-prog-track">
                            <div id="innHotWaterFill" class="prog-fill prog-fill-water"></div>
                            <div id="innHotWaterText" class="game-progress-bar-label">Hot Water: 0/500</div>
                        </div>
                    </div>
                    <div id="innAllowCarriersWater_row" class="base-row" style="display:none"><label><input type="checkbox" id="innAllowCarriersWater_chk" onchange="events.toggleBuildingAllowCarriersWater('inn', this.checked)"> Allow carriers to bring water</label></div>
                    <div id="innSoap_row" class="base-row" style="display:none">Soap: <span id="innSoapText">0</span> <span class="muted-text">A hot bath uses one soap and doubles the Star Bead bonus from that soak (30% becomes 60%).</span></div>
                    <div id="innTowels_row" class="base-row" style="display:none">Towels: <span id="innTowelsText">0</span> <span class="muted-text">A hot bath uses one towel and grants +100 restfulness.</span></div>
                    <div id="innOnsenTempReq_row" class="base-row muted-text" style="display:none">Requires 50L of water of at least 40C</div>
                    <div id="innOnsenSoak_row" class="base-row muted-text" style="display:none">Soaking lasts 5s and adds +0.5 restfulness/s, and spends 50L.</div>
                    <div id="innOnsenPondExplain_row" class="base-row muted-text" style="display:none">Pond visit lasts a number of seconds equal to the total level of water spirits assigned to the Pond; guests keep gaining restfulness at the inn rate during that time.</div>
                    <div class="base-row muted-text">Check the Guest tab for the itinerary.</div>
                    <div id="innGuestsVisitPond_row" class="base-row" style="display:none"><label><input type="checkbox" id="innGuestsVisitPond_chk" checked onchange="events.toggleInnGuestsVisitPond(this.checked)"> Allow guests to visit the pond</label></div>
                    ${resortUpgradeRowsHtml("inn")}
                    <div class="resort-info-grid">
                    </div>
                </div>
                <div id="resortInfo_noodleBar" class="resort-info-section">
                    <div class="base-info-title">Noodle Bar</div>
                    <div class="base-row muted-text">Guests stop here to eat before they rest. Their talk fills the tip bar.</div>
                    <div class="base-row">Dried Noodles: <span id="noodleBarNoodlesText">0</span></div>
                    <div id="noodleBarHotWater_row" class="base-row">
                        <div class="prog-track game-progress-track water-prog-track">
                            <div id="noodleBarHotWaterFill" class="prog-fill prog-fill-water"></div>
                            <div id="noodleBarHotWaterText" class="game-progress-bar-label">Hot Water: 0/1000</div>
                        </div>
                    </div>
                    <div id="noodleBarAllowCarriersWater_row" class="base-row" style="display:none"><label><input type="checkbox" id="noodleBarAllowCarriersWater_chk" onchange="events.toggleBuildingAllowCarriersWater('noodleBar', this.checked)"> Allow carriers to bring water</label></div>
                    <div id="noodleBarWaterReq_row" class="base-row muted-text">Requires 100L of 65C</div>
                    <div id="noodleBarEatExplain_row" class="base-row muted-text">If water is there, a guest will eat noodles for 10s, gaining +<span id="noodleBarEatRestBonusText">10</span>/s restfulness.</div>
                    <div id="noodleBarGuestsEating_row" class="base-row">Guests Eating: <span id="noodleBarGuestsEatingText">0</span></div>
                    <div id="noodleTipProgressWrap" class="prog-track orb-exp-prog-track">
                        <div id="noodleTipProgressFill" class="prog-fill prog-fill-noodle-tip"></div>
                        <div class="game-progress-bar-label">Tip Progress: <span id="noodleTipProgressText">0</span>/100%</div>
                    </div>
                    <div id="noodleTipRateExplain_row" class="base-row muted-text">The more guests there are, and the more eating at the noodle bar, the more they will talk, giving higher tip progress %.</div>
                    <div id="noodleTipLast_row" class="base-row muted-text"></div>
                    <div class="base-info-title">Tip System</div>
                    <div id="noodleTipLocked_row" class="base-row muted-text">Tips require at least 5 skills researched</div>
                    <div id="noodleTipControls" style="display:none">
                        <div id="noodleTipSystemExplain_row" class="base-row muted-text">Randomly select 5 skills for listening to tips, and when Tip Progress is complete, the selected skill gets 1 tip, increasing its skill exp by 1% per tip (additive).</div>
                        <button type="button" id="noodleTopicBtn" class="tab-button" onclick="events.changeNoodleConversationTopics()">Change Conversation Topics for 0 coins</button>
                        ${htmlNoodleTipRows()}
                        <div id="noodleTipSelectHint" class="base-row muted-text" style="display:none">Select which skill to apply the tip to</div>
                    </div>
                    ${resortUpgradeRowsHtml("noodleBar")}
                </div>
                <div id="resortInfo_laundry" class="resort-info-section">
                    <div class="base-info-title">Laundry Basins</div>
                    <div class="base-row muted-text">Refreshes rooms after guests leave. (Effects coming soon.)</div>
                </div>
                <div id="resortInfo_path" class="resort-info-section">
                    <div class="base-info-title">Clear Debris</div>
                    <div class="base-row">State: <span id="pathSegmentStateText"></span></div>
                    <div id="base_path_select_next_row" class="base-row" style="display:none">
                        <button type="button" id="base_path_select_next_btn" class="tab-button" onclick="events.selectNextPathSegment()">Select Next Path Segment</button>
                    </div>
                    ${resortUpgradeRowsHtml("path")}
                </div>
                <div id="resortInfo_stonePile" class="resort-info-section">
                    <div class="base-info-title">Stone Pile</div>
                    <div class="base-row muted-text">Holds stone.</div>
                    ${buildingManaRowHtml("stonePile", "Every 10 seconds, uses 100 mana to turn one unduplicated stone into two duplicated stone. Fill Mana weaves Okami to transfer global mana into this reservoir.")}
                    <div id="stonePileDupeProgressWrap" class="base-mini-progress stone-pile-dupe-progress" style="display:none"><div id="stonePileDupeProgressFill" class="base-mini-progress-fill"></div></div>
                    <div id="stonePileDupeIntervalText" class="base-row muted-text" style="display:none">every 10s</div>
                    <div class="base-row">${resortData.resourceIconHtml("stone")} Stone: <span id="stonePileInfoValue"></span></div>
                    <div id="stonePileDupedStone_row" class="base-row" style="display:none">Duplicated stone: <span id="stonePileDupedStoneValue"></span></div>
                    <div id="stonePileAllowUnduplicated_row" class="base-row" style="display:none"><label><input type="checkbox" id="stonePileAllowUnduplicated_chk" checked onchange="events.toggleStonePileAllowUnduplicated(this.checked)"> Allow carriers to use unduplicated stone</label></div>
                    ${resortUpgradeRowsHtml("stonePile")}
                </div>
                <div id="resortInfo_garden" class="resort-info-section">
                    <div class="base-info-title">Rock Garden</div>
                    <div class="base-row muted-text">Automation for an easy life, so you can go outside.</div>
                    <div id="gardenAppraisalAuto_row" class="base-row" style="display:none"><label><input type="checkbox" id="gardenAppraisalAuto_chk" checked onchange="events.toggleGardenAutoWeaveOnGather(this.checked)"> Arrangement of Appraisal - when an upgrade has gathered all its resources, assign the Okami, if she is idle or at a building.</label></div>
                    <div id="gardenReviewAuto_row" class="base-row" style="display:none"><label><input type="checkbox" id="gardenReviewAuto_chk" checked onchange="events.toggleGardenAutoWeaveCheapestReady(this.checked)"> Arrangement of Review - periodically auto-weave the ready upgrade with the shortest weave time</label></div>
                    <div id="gardenReviewPaused_row" class="base-row" style="display:none"><label><input type="checkbox" id="gardenReviewPaused_chk" onchange="events.toggleGardenAutoWeaveIncludePaused(this.checked)"> Also include weaving-paused upgrades in Arrangement of Review</label></div>
                    ${resortUpgradeRowsHtml("garden")}
                </div>
                <div id="resortInfo_atelier" class="resort-info-section">
                    <div class="base-info-title">Atelier</div>
                    <div class="base-row muted-text">Upgrades for the different buildings.</div>
                    <div id="atelierOreBars_row" style="display:none">
                        <div class="base-row">${resortData.resourceIconHtml("ore")} Ore: <span id="atelierInfoOre"></span></div>
                        <div class="base-row">${resortData.resourceIconHtml("bars")} Bars: <span id="atelierInfoBars"></span></div>
                    </div>
                    ${resortUpgradeRowsHtml("atelier")}
                </div>
                <div id="resortInfo_mage_tower" class="resort-info-section">
                    <div class="base-info-title">The Orb</div>
                    <div class="base-row muted-text">Gains exp each second equal to the total levels of all spirits. Each assigned Kitsune (and Okami) increases Orb exp gain by 20%. Mana gain per second equals Orb level; Bonfire heat and Spin Currents multiply that rate. When Okami is assigned here, her inspiration bonus also multiplies mana generation (but not the worker exp bonus).</div>
                    <div class="base-row">Mana generation: <span id="orbManaRateText"></span>/s</div>
                    <div class="base-row">Base Mana: <span id="orbBaseManaText"></span> <span id="orbBaseManaCloneBonusText" class="muted-text"></span></div>
                    <div class="base-row">Exp gain: <span id="orbExpRateText"></span>/s from spirit levels · ETA: <span id="orbExpEtaText"></span></div>
                    <div id="orbExpProgressWrap" class="prog-track orb-exp-prog-track">
                        <div id="orbExpFill" class="prog-fill prog-fill-orb-exp"></div>
                        <div class="game-progress-bar-label">Level <span id="orbLevelText" class="game-progress-bold">0</span><span class="game-progress-sep">|</span><span id="orbExpText" class="game-progress-bold">0</span> / <span id="orbExpToLevelText" class="game-progress-bold">20</span></div>
                    </div>
                    ${resortUpgradeRowsHtml("mage_tower")}
                </div>
                <div id="resortInfo_bonfire" class="resort-info-section">
                    <div class="base-info-title">Bonfire</div>
                    <div class="base-row muted-text">Stare at the fire and contemplate how to protect what's yours.</div>
                    ${htmlBonfirePanel()}
                </div>
                <div id="resortInfo_shrine" class="resort-info-section">
                    <div class="base-info-title">Shrine</div>
                    ${htmlShrinePanel()}
                </div>
                <div id="resortInfo_scrollArchives" class="resort-info-section">
                    <div class="base-info-title">Scroll Archives</div>
                    ${htmlScrollArchivesPanel()}
                </div>
                <div id="resortInfo_bambooForest" class="resort-info-section">
                    <div class="base-info-title">Bamboo Forest</div>
                    <div class="base-row muted-text">Harvest bamboo for construction wood.</div>
                    <div class="base-row">Chips: <span id="bambooForestInfoChips"></span> <span class="muted-text"> -> 10 Chips become 1 Wood -> </span> ${resortData.resourceIconHtml("wood")} Wood: <span id="bambooForestInfoWood"></span></div>
                    <div class="base-row">Chop Power: <span id="bambooChopPower"></span> <span class="muted-text">Gain Chop Power per assigned Kitsune or Okami</span></div>
                    <div id="bambooForestWater_row" class="base-row" style="display:none">Water: <span id="bambooForestWaterText"></span> <span class="muted-text">Bamboo grows twice as fast when water is available. 1L is used for every 1 chip regrown.</span></div>
                    <div id="bambooForestFertilizer_row" class="base-row" style="display:none">Fertilizer: <span id="bambooForestFertilizerText"></span> <span class="muted-text">Bamboo grows twice as fast when fertilizer is available. 1 is used for every 10 chips regrown.</span></div>
                    <div class="base-row muted-text">Select which stalk to cut. One bamboo segment takes 2 minutes to fully grow. Bamboo grows when not being harvested.</div>
                    <div id="bambooStalkGrid" class="bamboo-stalk-grid"></div>
                    <div id="bambooCutRow" class="bamboo-harvest-row"></div>
                    <div id="bambooStatusRow" class="bamboo-status-row"></div>
                    <div id="bambooBaseWoodRow" class="bamboo-base-wood-row"></div>
                    <div id="bambooTagline_row" class="base-row muted-text bamboo-tagline" style="display:none">Bamboo grows stronger only when fully cut</div>
                    <div id="bambooAutoRotate_row" class="base-row" style="display:none"><label><input type="checkbox" id="bambooAutoRotate_chk" checked onchange="events.toggleBambooAutoRotate(this.checked)"> Auto-rotate harvest to next stalk</label></div>
                    ${resortUpgradeRowsHtml("bambooForest")}
                </div>
                <div id="resortInfo_foxDen" class="resort-info-section">
                    <div class="base-info-title">Fox Den</div>
                    <div class="base-row muted-text">Plan buildings and send kitsune to deliver materials. Buildings are prioritized over upgrades.</div>
                    <div id="foxDenManaOrders_row" class="base-row" style="display:none"><label><input type="checkbox" id="foxDenManaOrders_chk" onchange="events.toggleFoxDenManaOrders(this.checked)"> Arrangement of Mana Orders - deliver mana from the Orb when no other gather/build orders remain</label></div>
                    <div id="foxDenAutoClearRocks_row" class="base-row" style="display:none"><label><input type="checkbox" id="foxDenAutoClearRocks_chk" onchange="events.toggleFoxDenAutoClearPathRocks(this.checked)"> Assigned Okami will automatically clear the next Rocks</label></div>
                    <div id="foxDenAutoAddRailings_row" class="base-row" style="display:none"><label><input type="checkbox" id="foxDenAutoAddRailings_chk" onchange="events.toggleFoxDenAutoAddPathRailings(this.checked)"> Assigned Okami will automatically add Railings on the next path that needs it</label> <span id="foxDenAutoAddRailings_wait" class="muted-text"></span></div>
                    <div id="foxDenAutoAddStairs_row" class="base-row" style="display:none"><label><input type="checkbox" id="foxDenAutoAddStairs_chk" onchange="events.toggleFoxDenAutoAddPathStairs(this.checked)"> Assigned Okami will automatically add Stairs on the next path that needs it</label> <span id="foxDenAutoAddStairs_wait" class="muted-text"></span></div>
                    <div id="foxDenAutoAddLanterns_row" class="base-row" style="display:none"><label><input type="checkbox" id="foxDenAutoAddLanterns_chk" onchange="events.toggleFoxDenAutoAddPathLanterns(this.checked)"> Assigned Okami will automatically add Lanterns on the next path that needs it</label> <span id="foxDenAutoAddLanterns_wait" class="muted-text"></span></div>
                    <div class="base-row">Resources: <span id="foxDenCarry_resource"></span> per trip</div>
                    <div id="foxDenCarryMana_row" class="base-row" style="display:none">Mana: <span id="foxDenCarry_mana"></span> per trip</div>
                    ${foxDenUnlockRowsHtml()}
                </div>
                <div id="resortInfo_cistern" class="resort-info-section">
                    <div class="base-info-title">Cistern</div>
                    <div class="base-row muted-text">Collects water from droplets.</div>
                    <div class="base-row">Stored water: <span id="cisternInfoWater"></span></div>
                    <div class="base-row">Temperature: <span id="cisternInfoTemperature"></span></div>
                    <div class="base-row">Capacity: <span id="cisternInfoCapacity"></span></div>
                    <div id="cisternWishingWell_row" class="base-row" style="display:none">Wishing well: +<span id="cisternWishingWellCoins"></span> coins/s</div>
                    <div id="cisternWaterCarry_row" class="base-row" style="display:none">Water carry: <span id="cisternWaterCarry"></span>L per trip</div>
                    <div id="cisternReplaceHotWater_row" class="base-row" style="display:none"><label><input type="checkbox" id="cisternReplaceHotWater_chk" onchange="events.toggleCisternReplaceWithHotterWater(this.checked)"> Replace with hotter water</label></div>
                    <div id="cisternRefuseWater_row" class="base-row" style="display:none"><label><input type="checkbox" id="cisternRefuseWater_chk" onchange="events.toggleCisternRefuseIncomingWater(this.checked)"> Dump incoming water to the Pond</label></div>
                    <div id="cisternViscosity_row" class="base-row" style="display:none"><label><input type="checkbox" id="cisternViscosity_chk" checked onchange="events.toggleCisternWaterSpiritsUsePathSpeed(this.checked)"> Water spirits use path speed bonuses</label></div>
                    <div class="base-row"><button id="cisternEmptyHalf_btn" class="tab-button" style="display:none" onclick="events.emptyHalfCistern()">Empty Half to Pond</button></div>
                    ${resortUpgradeRowsHtml("cistern")}
                </div>
                <div id="resortInfo_pond" class="resort-info-section">
                    <div class="base-info-title">Pond</div>
                    <div class="base-row muted-text">Overflow basin for extra water.</div>
                    <div class="base-row">Water: <span id="pondInfoWater"></span> <span id="pondWishingWellRate" class="muted-text"></span></div>
                    <div class="base-row">Water spirit exp: <span id="pondWaterSpiritExp"></span></div>
                    <div id="pondSendWater_row" class="base-row" style="display:none"><label><input type="checkbox" id="pondSendWater_chk" checked onchange="events.togglePondSendWaterToForest(this.checked)"> Send water to bamboo forest</label></div>
                    ${resortUpgradeRowsHtml("pond")}
                </div>
                <div id="resortInfo_market" class="resort-info-section">
                    <div class="base-info-title">Market</div>
                    ${htmlMarketPanel()}
                </div>
                <div id="resortInfo_fireLauncher" class="resort-info-section">
                    <div id="fireLauncherInfoTitle" class="base-info-title">Fire Launcher</div>
                    <div class="base-row">Type: <span id="fireLauncherInfoType"></span></div>
                    <div class="base-row">Embers: <span id="fireLauncherInfoEmbers"></span>/<span id="fireLauncherInfoEmbersCap"></span> <span id="fireLauncherInfoEmbersRequire" style="display:none;font-weight:bold">Requires Fire Spirit to operate</span></div>
                    <div class="base-row">Range: <span id="fireLauncherInfoRange"></span>px<span id="fireLauncherInfoRangeBonus" class="muted-text"></span></div>
                    <div class="base-row">Attack interval: <span id="fireLauncherInfoInterval"></span>s</div>
                    <div class="base-row">Ember cost: <span id="fireLauncherInfoEmberCost"></span></div>
                    <div class="base-row">Heat per strike: <span id="fireLauncherInfoHeat"></span><span id="fireLauncherInfoHeatBonus" class="muted-text"></span></div>
                    <div class="base-row">Exp per droplet: <span id="fireLauncherInfoExp"></span></div>
                    <div class="base-row">Exp/s: <span id="fireLauncherInfoExpPerSec"></span> <span class="muted-text">(assumes always firing, per droplet hit)</span></div>
                    <div class="base-row">Assigned: <span id="fireLauncherInfoSpirit"></span></div>
                    <div id="fireLauncherTargetPriority_row" class="base-row fire-launcher-target-radios" style="display:none">
                        Target:
                        <label><input type="radio" name="fireLauncherTargetMode" id="fireLauncherTarget_default" value="default" checked onclick="events.setFireLauncherTargetMode('default')"> Default</label>
                        <label><input type="radio" name="fireLauncherTargetMode" id="fireLauncherTarget_closest" value="closest" onclick="events.setFireLauncherTargetMode('closest')"> Closest</label>
                        <label><input type="radio" name="fireLauncherTargetMode" id="fireLauncherTarget_furthest" value="furthest" onclick="events.setFireLauncherTargetMode('furthest')"> Furthest Along</label>
                        <label id="fireLauncherTarget_coldest_label" style="display:none"><input type="radio" name="fireLauncherTargetMode" id="fireLauncherTarget_coldest" value="coldest" onclick="events.setFireLauncherTargetMode('coldest')"> Coldest</label>
                        <label id="fireLauncherTarget_hottest_label" style="display:none"><input type="radio" name="fireLauncherTargetMode" id="fireLauncherTarget_hottest" value="hottest" onclick="events.setFireLauncherTargetMode('hottest')"> Hottest</label>
                    </div>
                    <div id="fireLauncherUpgrades_pathMid" style="display:none">${resortUpgradeRowsHtml("fireLauncher_pathMid")}</div>
                    <div id="fireLauncherUpgrades_pathLower" style="display:none">${resortUpgradeRowsHtml("fireLauncher_pathLower")}</div>
                    <div id="fireLauncherUpgrades_bendTop" style="display:none">${resortUpgradeRowsHtml("fireLauncher_bendTop")}</div>
                </div>
                <div id="resortInfo_mine" class="resort-info-section">
                    <div class="mine-info-header">
                        <div class="base-info-title">Mine</div>
                        <span id="mineStatusText" class="mine-status-inline muted-text"></span>
                    </div>
                    <div class="mine-depth-row"><button id="mineDepthLeftBtn" class="tab-button" onclick="events.changeMineDepth(-1)">←</button><span>Depth <span id="mineDepthText"></span> | <span id="mineDepthClears"></span>/10 <span id="mineDepthReady" class="mine-depth-ready" style="display:none">Ready</span></span><button id="mineDepthRightBtn" class="tab-button" onclick="events.changeMineDepth(1)">→</button></div>
                    <div class="base-row muted-text">
                    Each depth level increases rewards by x2, difficulty by x1.9.<br>
                    Earth Spirits mine faster equal to their Spirit Power.<br>
                    When a Mine Grid is finished, Earth Spirits play in the dirt, taking the total spirit level of dirt and splitting the exp gain among the assigned earth spirits.<br>
                    There is 1 more stone per 2 depth, up to 5 stone. Ore is found at depth 3, and 1 more ore is found per 5 depth, up to 5 ore.
                    </div>
                    <div class="mine-info-body">
                        <div class="mine-grid-row">
                            <div id="mineGrid" class="mine-grid"></div>
                            <div class="mine-info-side">
                                <div class="resort-info-grid mine-resource-grid">
                                    <div>Dirt: <span id="mineDirtText"></span></div>
                                    <div>Stone: <span id="mineStoneText"></span></div>
                                    <div id="mineOreRow" style="display:none">Ore: <span id="mineOreText"></span></div>
                                    <div>Assigned spirit level: <span id="mineAssignedLevelText"></span></div>
                                    <div>Spirit power: <span id="mineSpiritPowerText"></span></div>
                                    <div>Clear time: <span id="mineClearEtaText"></span></div>
                                </div>
                            </div>
                        </div>
                        ${resortUpgradeRowsHtml("mine")}
                        <div id="minePrioritizeOreRow" class="base-row" style="display:none"><label><input type="checkbox" id="minePrioritizeOre_chk" onchange="events.toggleMinePrioritizeOre(this.checked)"> Prioritize ore over stone</label></div>
                        <div id="minePlayBlock" class="mine-play-block" style="display:none">
                            <div class="mine-play-label">Play in Dirt</div>
                            <div id="minePlayProgressDetail" class="muted-text mine-play-detail"></div>
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
                guestRows += `<div id="guestRow_${gi}" class="guest-list-row" style="display:none">The <b id="guestRow_${gi}_type"></b> is doing <b id="guestRow_${gi}_state"></b> for the next <b id="guestRow_${gi}_time"></b>. <span id="guestRow_${gi}_rest_text"></span><b id="guestRow_${gi}_restfulness"></b> <span id="guestRow_${gi}_rest_end"></span>.</div>`;
            }
            guestRoot.innerHTML = `
                <div id="guestItinerarySection" class="guest-itinerary-section" style="display:none">
                    <div class="guest-section-title">Guest Itinerary</div>
                    <div id="guestItineraryPanel" class="guest-itinerary-panel">
                        <div id="guestItineraryLine_0" class="guest-itinerary-line"></div>
                        <div id="guestItineraryLine_1" class="guest-itinerary-line"></div>
                        <div id="guestItineraryLine_2" class="guest-itinerary-line"></div>
                        <div id="guestItineraryLine_3" class="guest-itinerary-line"></div>
                        <div id="guestItineraryLine_4" class="guest-itinerary-line"></div>
                    </div>
                    <div id="guestStarBeadsRange" class="guest-itinerary-line">Expected <img class="inline-res-icon" src="img/starBead.svg" alt="" draggable="false">Star Beads: <span id="guestStarBeadsMin">0</span> – <span id="guestStarBeadsMax">0</span></div>
                    <div id="guestStarBeadsRangeNote" class="muted-text guest-itinerary-line">Max assumes resources hold for the whole stay.</div>
                </div>
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
                h += `<div id="spiritSlot_${location}_${kind}_${i}" class="spirit-slot spirit-slot-${kind}" data-spirit-kind="${kind}" data-spirit-location="${location}" data-spirit-slot="${i}" onclick="events.clickSpiritSlot('${kind}', '${location}', ${i})"></div>`;
            }
            return h;
        };
        if (earthSlots) earthSlots.innerHTML = slotHtml("earth", "hiddenSpring", 3);
        if (waterSlots) waterSlots.innerHTML = slotHtml("water", "hiddenSpring", 3);
        if (bonfireFireSlots) bonfireFireSlots.innerHTML = slotHtml("fire", "bonfire", 3);
        if (atelierFireSlots) atelierFireSlots.innerHTML = slotHtml("fire", "atelier", 3);
        const mineEarthSlots = document.getElementById("spiritSlots_mine_earth");
        if (mineEarthSlots) mineEarthSlots.innerHTML = slotHtml("earth", "mine", 3);
        const bambooPlantSlots = document.getElementById("spiritSlots_bambooForest_plant");
        const pondWaterSlots = document.getElementById("spiritSlots_pond_water");
        if (bambooPlantSlots) bambooPlantSlots.innerHTML = slotHtml("plant", "bambooForest", resortData.bambooForestConfig.stalkCount);
        if (pondWaterSlots) pondWaterSlots.innerHTML = slotHtml("water", "pond", 3);
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
                h += `<div id="pebbleTokenAmt_${i}" class="path-token-amount-label hyperVisible" style="display:none"></div>`;
                h += `<div id="dropletToken_${i}" class="droplet-token" style="display:none"><div id="dropletTokenInner_${i}" class="droplet-token-inner"></div></div>`;
                h += `<div id="dropletTokenAmtBelow_${i}" class="path-token-amount-label hyperVisible" style="display:none"></div>`;
                h += `<div id="dropletTokenAmtTop_${i}" class="path-token-amount-label hyperVisible" style="display:none"></div>`;
            }
            h += `<div id="okamiTravelToken" class="okami-travel-token" style="display:none"><img class="okami-travel-tail" src="img/foxTail.svg" alt="" draggable="false"></div>`;
            h += `<div id="okamiPathWeaveToken" class="okami-path-weave-token" style="display:none"><img class="okami-path-weave-tail" src="img/foxTail.svg" alt="" draggable="false"></div>`;
            for (let ci = 0; ci < 8; ci++) {
                h += `<div id="foxDenCarrier_${ci}" class="fox-den-carrier-token" style="display:none"><img class="fox-den-carrier-img" src="img/foxWorker.svg" alt="" draggable="false"></div>`;
            }
            for (let bi = 0; bi < 8; bi++) {
                h += `<div id="bonfireCarrier_${bi}" class="fox-den-carrier-token bonfire-carrier-token" style="display:none"><img class="bonfire-carrier-img fox-den-carrier-img" src="img/foxWorker.svg" alt="" draggable="false"></div>`;
            }
            for (let ii = 0; ii < 8; ii++) {
                h += `<div id="innCarrier_${ii}" class="fox-den-carrier-token inn-carrier-token" style="display:none"><img class="inn-carrier-img fox-den-carrier-img" src="img/foxWorker.svg" alt="" draggable="false"></div>`;
            }
            for (let cci = 0; cci < 8; cci++) {
                h += `<div id="cisternCarrier_${cci}" class="fox-den-carrier-token cistern-carrier-token" style="display:none"><img class="cistern-carrier-img fox-den-carrier-img" src="img/foxWorker.svg" alt="" draggable="false"></div>`;
            }
            for (let mci = 0; mci < 8; mci++) {
                h += `<div id="marketCarrier_${mci}" class="fox-den-carrier-token market-carrier-token" style="display:none"><img class="market-carrier-img fox-den-carrier-img" src="img/foxWorker.svg" alt="" draggable="false"></div>`;
            }
            for (let fi = 0; fi < 8; fi++) {
                h += `<div id="fireLauncherProjectile_${fi}" class="fire-launcher-projectile" style="display:none"><img src="img/fire.svg" alt="" draggable="false"></div>`;
                h += `<div id="fireLauncherAoe_${fi}" class="fire-launcher-aoe-pulse" style="display:none"></div>`;
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
    },
    fixUiAfterLoad: function() {
        events.refreshBaseBuildingPanels();
        if (typeof events.syncNumberTypeRadiosFromSettings === "function") {
            events.syncNumberTypeRadiosFromSettings();
        }
        if (typeof events.syncOfflineProgressModeRadiosFromSettings === "function") {
            events.syncOfflineProgressModeRadiosFromSettings();
        }
        if (typeof engine.cacheMapBuildingPositions === "function") {
            engine.cacheMapBuildingPositions();
        }
    },
    _skillSlotColumnLabel: function(col) {
        if (col === "offense") return "Offense";
        if (col === "defense") return "Defense";
        if (col === "utility") return "Utility";
        return "Any";
    },
    _buildSkillEquipSlotHtml: function(viewName, column, index, compact) {
        const idPrefix = `skillSlot_${viewName}_${column}_${index}`;
        const catClass = `skill-equip-slot--${column}`;
        let filled = "";
        if (compact) {
            filled = `
                <div id="${idPrefix}_filled" class="skill-equip-slot-filled" style="display:none" draggable="true"
                    ondragstart="events.skillEquipDragStart(event, '${viewName}', '${column}', ${index})"
                    onclick="events.selectSkillSlotSkill('${viewName}', '${column}', ${index}, event)">
                    <div class="skill-equip-slot-name" id="${idPrefix}_name"></div>
                    <div class="skill-equip-slot-talent" id="${idPrefix}_talent"></div>
                </div>`;
        } else {
            filled = `
                <div id="${idPrefix}_filled" class="skill-equip-slot-filled" style="display:none" draggable="true"
                    ondragstart="events.skillEquipDragStart(event, '${viewName}', '${column}', ${index})"
                    onclick="events.selectSkillSlotSkill('${viewName}', '${column}', ${index}, event)">
                    <div class="skill-equip-slot-name" id="${idPrefix}_name"></div>
                    <div id="${idPrefix}_stars" class="skill-stars-controls skill-stars-row-compact skill-equip-slot-stars">
                        <button id="${idPrefix}_star_bronze" class="skill-star-btn skill-panel-star-btn skill-star-bronze" onclick="event.stopPropagation(); events.toggleEquippedSlotStar('${column}', ${index}, 'bronze')">☆</button>
                        <button id="${idPrefix}_star_silver" class="skill-star-btn skill-panel-star-btn skill-star-silver" onclick="event.stopPropagation(); events.toggleEquippedSlotStar('${column}', ${index}, 'silver')">☆</button>
                        <button id="${idPrefix}_star_gold" class="skill-star-btn skill-panel-star-btn skill-star-gold" onclick="event.stopPropagation(); events.toggleEquippedSlotStar('${column}', ${index}, 'gold')">☆</button>
                    </div>
                    <div class="skill-equip-slot-meta" id="${idPrefix}_meta"></div>
                    <div class="skill-row-bars">
                        <div class="prog-track skill-prog-mini skill-prog-row-full"><div id="${idPrefix}_exp_fill" class="prog-fill prog-fill-skill"></div></div>
                        <div class="prog-track skill-prog-mini skill-prog-row-full"><div id="${idPrefix}_talent_fill" class="prog-fill prog-fill-talent"></div></div>
                    </div>
                </div>`;
        }
        return `
            <div id="${idPrefix}" class="skill-equip-slot ${catClass}" data-column="${column}" data-index="${index}" data-view="${viewName}"
                ondragover="events.skillSlotDragOver(event)" ondragleave="events.skillSlotDragLeave(event)" ondrop="events.skillSlotDrop(event)">
                <div id="${idPrefix}_empty" class="skill-equip-slot-empty">Empty</div>
                ${filled}
            </div>`;
    },
    _buildSkillSlotColumnsHtml: function(viewName, compact) {
        const cols = skills.SLOT_COLUMNS;
        let html = `<div id="skillsSlots_${viewName}" class="skills-slot-columns${compact ? " skills-slot-columns--compact" : ""}">`;
        for (let c = 0; c < cols.length; c++) {
            const col = cols[c];
            const arr = data.progress.skillEquip && data.progress.skillEquip.slots
                ? data.progress.skillEquip.slots[col]
                : null;
            const count = Array.isArray(arr) ? arr.length : (col === "any" ? 0 : 1);
            html += `<div class="skills-slot-column skills-slot-column--${col}" data-column="${col}">`;
            const bonusSuffix = col === "any" ? ": +0%" : ": +0";
            html += `<div id="skillSlotColumnTitle_${viewName}_${col}" class="skills-slot-column-title showthat" onmouseenter="view.positionColumnTalentTip(this)">`;
            html += `<span id="skillSlotColumnTitleText_${viewName}_${col}">${createView._skillSlotColumnLabel(col)}${bonusSuffix}</span>`;
            html += `<div id="skillSlotColumnTitleTip_${viewName}_${col}" class="showthis skills-column-talent-tip"></div>`;
            html += `</div>`;
            for (let i = 0; i < count; i++) {
                html += createView._buildSkillEquipSlotHtml(viewName, col, i, compact);
            }
            html += `</div>`;
        }
        html += `</div>`;
        return html;
    },
    /** Append one new equip slot DOM for both Equipped and Library views after a shard unlock. */
    appendSkillEquipSlot: function(column, index) {
        const views = ["equipped", "library"];
        for (let vi = 0; vi < views.length; vi++) {
            const viewName = views[vi];
            const compact = viewName === "library";
            const host = document.querySelector(`#skillsSlots_${viewName} .skills-slot-column--${column}`);
            if (!host) {
                continue;
            }
            const tmp = document.createElement("div");
            tmp.innerHTML = createView._buildSkillEquipSlotHtml(viewName, column, index, compact);
            const slotEl = tmp.firstElementChild;
            if (slotEl) {
                host.appendChild(slotEl);
                const idPrefix = `skillSlot_${viewName}_${column}_${index}`;
                createView.queueCache(
                    idPrefix, `${idPrefix}_empty`, `${idPrefix}_filled`, `${idPrefix}_name`,
                    `${idPrefix}_stars`, `${idPrefix}_star_bronze`, `${idPrefix}_star_silver`, `${idPrefix}_star_gold`,
                    `${idPrefix}_meta`, `${idPrefix}_exp_fill`, `${idPrefix}_talent_fill`, `${idPrefix}_talent`
                );
            }
        }
        if (typeof createView.clearCacheQueue === "function") {
            createView.clearCacheQueue();
        }
    },
    /** One-time on load: Equipped + Library skill panes. */
    createSkillElements: function() {
        const skillsList = document.getElementById("skillsList");
        if (!skillsList) {
            return;
        }
        skills.ensureSkillEquip();
        const tipsUnlocked = engine.isSkillTipsUnlocked();
        const tipsHiddenStyle = tipsUnlocked ? "" : " style=\"display:none\"";

        const equippedInfo = `
            <aside id="skillInfoPanel" class="skill-info-aside skills-equipped-info-panel" style="display:none">
                <div class="skill-info-title-row">
                    <button type="button" id="skillInfo_unequipBtn" class="tab-button skills-unequip-btn-inline" onclick="events.unequipSelectedSkill()">Unequip</button>
                    <div id="skillInfo_title" class="skill-info-title"></div>
                    <label class="skill-grouping-label">Grouping: <input type="number" id="skillInfo_grouping" class="skill-grouping-input" min="0" max="99" step="1" inputmode="numeric" value="0" oninput="events.setSkillGrouping(this)" onchange="events.setSkillGrouping(this, true)"></label>
                </div>
                <div class="skill-current-wrap" id="skillInfo_current_wrap"><div id="skillInfo_current" class="skill-current"></div></div>
                <div class="skill-reward" id="skillInfo_reward"></div>
                <div class="skill-trigger" id="skillInfo_trigger"></div>
                <div class="skill-base-exp" id="skillInfo_base_exp"></div>
                <div class="skill-exp-on-trigger" id="skillInfo_exp_on_trigger"></div>
                <div class="prog-label-row skill-exp-row">Skill exp: <span id="skillInfo_exp_text"></span> <span class="skill-exp-mults" id="skillInfo_exp_mults"></span></div>
                <div class="prog-track skill-prog-mini skill-info-prog"><div id="skillInfo_exp_fill" class="prog-fill prog-fill-skill"></div></div>
                <div class="prog-label-row">Talent: <span id="skillInfo_talent_text"></span></div>
                <div class="prog-track skill-prog-mini skill-info-prog"><div id="skillInfo_talent_fill" class="prog-fill prog-fill-talent"></div></div>
                <div id="skillInfo_star_effect_row" class="prog-label-row">Star effect: <span id="skillInfo_star_effect"></span></div>
                <div id="skillInfo_tips_row" class="prog-label-row skill-exp-row"${tipsHiddenStyle}>Tips: <span id="skillInfo_tips_text"></span> <span class="skill-exp-mults" id="skillInfo_tips_mults"></span></div>
                <div id="skillInfo_integration_row" class="prog-label-row" style="display:none">Exp mult from Equipped Skills: <span id="skillInfo_integration_mult"></span></div>
                <div class="prog-label-row">Combined exp mult: <span id="skillInfo_combined_mults"></span></div>
                <div id="skillInfo_flavor" class="skill-info-flavor"></div>
            </aside>`;

        const libraryInfo = `
            <aside id="skillInfoPanelLibrary" class="skill-info-aside skills-library-info-overlay" style="display:none">
                <div class="skill-info-title-row">
                    <div id="libSkillInfo_title" class="skill-info-title"></div>
                    <label class="skill-grouping-label">Grouping: <input type="number" id="libSkillInfo_grouping" class="skill-grouping-input" min="0" max="99" step="1" inputmode="numeric" value="0" oninput="events.setSkillGrouping(this)" onchange="events.setSkillGrouping(this, true)"></label>
                </div>
                <div class="skill-reward" id="libSkillInfo_reward"></div>
                <div class="skill-trigger" id="libSkillInfo_trigger"></div>
                <div class="skill-base-exp" id="libSkillInfo_base_exp"></div>
                <div class="prog-label-row">Talent: <span id="libSkillInfo_talent_text"></span></div>
                <div class="prog-track skill-prog-mini skill-info-prog"><div id="libSkillInfo_talent_fill" class="prog-fill prog-fill-talent"></div></div>
                <div id="libSkillInfo_tips_row" class="prog-label-row skill-exp-row"${tipsHiddenStyle}>Tips: <span id="libSkillInfo_tips_text"></span></div>
                <div id="libSkillInfo_equipError" class="skills-equip-error" style="display:none"></div>
                <div class="skills-equip-row">
                    <button type="button" id="libSkillInfo_equipBtn" class="tab-button" onclick="events.equipSelectedLibrarySkill()">Equip</button>
                </div>
            </aside>`;

        let libraryRows = "";
        for (let i = 0; i < skills.keysInOrder.length; i++) {
            const key = skills.keysInOrder[i];
            const skill = data.progress.skills[key];
            const def = skills._byKey[key];
            const slotCat = def && def.slotCategory ? def.slotCategory : "";
            const isClass = (def && def.category === "class") || (skill && skill.category === "class");
            const borderClass = slotCat ? `skill-row--slot-${slotCat}` : "";
            const catLabel = slotCat ? (slotCat.charAt(0).toUpperCase() + slotCat.slice(1)) : "";
            const catStampClass = slotCat ? `scroll-archives-choice-slot-cat scroll-archives-choice-slot-cat--${slotCat}` : "scroll-archives-choice-slot-cat";
            libraryRows += `
                <div class="skill-row skill-block skill-library-row ${borderClass}" id="skill_wrap_${key}" data-skill-key="${key}" draggable="true"
                    ondragstart="events.librarySkillDragStart(event, '${key}')"
                    onclick="events.selectLibrarySkillForDetail('${key}', event)" style="display:none">
                    <div class="skill-row-head">
                        <div class="skill-row-head-left">
                            <div class="skill-row-name" id="skill_${key}_name">${skill.name}</div>
                            <div class="skill-library-talent-row">
                                <span id="skill_${key}_slot_cat" class="${catStampClass}" style="${slotCat ? "" : "display:none"}">${catLabel}</span>
                                <div class="skill-row-lvl-talent" id="skill_${key}_talent_only">Talent ${skill.talentLevel}</div>
                            </div>
                        </div>
                        <div class="skill-library-row-tags">
                            <span id="skill_${key}_class_tag" class="skill-class-tag" style="${isClass ? "" : "display:none"}">Class</span>
                            <span id="skill_${key}_equipped_badge" class="skill-equipped-badge" style="display:none">Equipped</span>
                        </div>
                    </div>
                </div>`;
        }

        const sortRadios = `
            <div id="skillSortRadios" class="skill-sort-radios">
                <div class="skill-sort-row">
                    <label><input type="radio" name="skillListSort" id="skillSortOldest" value="oldest" checked onchange="events.setSkillListSort('oldest')"> Sort by Oldest</label>
                    <label><input type="radio" name="skillListSort" id="skillSortTalent" value="talent" onchange="events.setSkillListSort('talent')"> Sort by Talent</label>
                    <label><input type="radio" name="skillListSort" id="skillSortAlpha" value="alpha" onchange="events.setSkillListSort('alpha')"> Sort Alphabetically</label>
                </div>
                <div class="skill-sort-row">
                    <label><input type="radio" name="skillListSort" id="skillSortTips" value="tips" onchange="events.setSkillListSort('tips')"> Sort by Tips</label>
                    <label><input type="radio" name="skillListSort" id="skillSortGrouping" value="grouping" onchange="events.setSkillListSort('grouping')"> Sort by Grouping</label>
                </div>
            </div>`;

        skillsList.className = "skills-tab-layout skills-tab-layout--equip";
        skillsList.innerHTML = `
            <div id="skillsEquippedPane" class="skills-equipped-pane">
                ${createView._buildSkillSlotColumnsHtml("equipped", false)}
                <div id="skillsEquippedEmptyCta" class="muted-text skills-equipped-empty-cta" style="display:none">Equip skills from the Library tab</div>
                <div id="skillsEquippedInfoWrap" class="skills-equipped-info-wrap">${equippedInfo}</div>
            </div>
            <div id="skillsLibraryPane" class="skills-library-pane" style="display:none">
                ${createView._buildSkillSlotColumnsHtml("library", true)}
                <div id="skillsLibraryListArea" class="skills-library-list-area">
                    <div class="skills-library-separator"></div>
                    <div id="skillsLibraryResearchedTitle" class="skills-library-researched-title">Researched Skills</div>
                    <div id="skillsListSearchRow" class="skills-list-search-row">
                        <input type="search" id="skillsListSearch" class="skills-list-search" placeholder="Search skills…" autocomplete="off" spellcheck="false" oninput="events.setSkillListSearch(this.value)">
                    </div>
                    ${sortRadios}
                    <div id="skillsLibraryTwoCol" class="skills-library-two-col">
                        <div id="skillsLibraryColsScroll" class="skills-library-cols-scroll">
                            <div id="skillsLibraryColLeft" class="skills-library-col"></div>
                            <div id="skillsLibraryColRight" class="skills-library-col"></div>
                        </div>
                        ${libraryInfo}
                    </div>
                    <div id="skillsListEmpty" class="muted-text skills-list-empty" style="display:none"></div>
                    <div id="skillsLibraryRowsHost" style="display:none">${libraryRows}</div>
                </div>
            </div>`;

        const cacheIds = [
            "skillsEquippedPane", "skillsLibraryPane", "skillsEquippedEmptyCta", "skillsEquippedInfoWrap",
            "skillsSlots_equipped", "skillsSlots_library", "skillsLibraryResearchedTitle",
            "skillsLibraryListArea", "skillsLibraryTwoCol", "skillsLibraryColsScroll", "skillsLibraryColLeft", "skillsLibraryColRight",
            "skillsLibraryRowsHost", "skillsListSearchRow", "skillsListSearch", "skillsListEmpty",
            "skillSortRadios", "skillSortOldest", "skillSortTalent", "skillSortAlpha", "skillSortTips", "skillSortGrouping",
            "skillInfoPanel", "skillInfo_title", "skillInfo_grouping", "skillInfo_current_wrap", "skillInfo_current",
            "skillInfo_reward", "skillInfo_trigger", "skillInfo_base_exp", "skillInfo_exp_on_trigger",
            "skillInfo_exp_text", "skillInfo_exp_mults", "skillInfo_exp_fill",
            "skillInfo_talent_text", "skillInfo_talent_fill",
            "skillInfo_star_effect_row", "skillInfo_star_effect",
            "skillInfo_tips_row", "skillInfo_tips_text", "skillInfo_tips_mults",
            "skillInfo_combined_mults", "skillInfo_integration_row", "skillInfo_integration_mult", "skillInfo_flavor",
            "skillInfo_unequipBtn",
            "skillInfoPanelLibrary", "libSkillInfo_title", "libSkillInfo_grouping", "libSkillInfo_reward", "libSkillInfo_trigger",
            "libSkillInfo_base_exp", "libSkillInfo_talent_text", "libSkillInfo_talent_fill", "libSkillInfo_tips_row", "libSkillInfo_tips_text",
            "libSkillInfo_equipError", "libSkillInfo_equipBtn",
            "combatStarsInventory", "combatStarsCounts", "skillsTotalTalentLevelWrap", "skillsTotalTalentLevel", "unequipChargesText",
            "skillSubTab_equipped", "skillSubTab_library"
        ];
        createView.queueCache.apply(createView, cacheIds);

        const views = ["equipped", "library"];
        for (let vi = 0; vi < views.length; vi++) {
            const viewName = views[vi];
            const compact = viewName === "library";
            for (let c = 0; c < skills.SLOT_COLUMNS.length; c++) {
                const column = skills.SLOT_COLUMNS[c];
                createView.queueCache(
                    `skillSlotColumnTitle_${viewName}_${column}`,
                    `skillSlotColumnTitleText_${viewName}_${column}`,
                    `skillSlotColumnTitleTip_${viewName}_${column}`
                );
                const count = (data.progress.skillEquip.slots[column] || [null]).length;
                for (let i = 0; i < count; i++) {
                    const idPrefix = `skillSlot_${viewName}_${column}_${i}`;
                    if (compact) {
                        createView.queueCache(idPrefix, `${idPrefix}_empty`, `${idPrefix}_filled`, `${idPrefix}_name`, `${idPrefix}_talent`);
                    } else {
                        createView.queueCache(
                            idPrefix, `${idPrefix}_empty`, `${idPrefix}_filled`, `${idPrefix}_name`, `${idPrefix}_meta`,
                            `${idPrefix}_stars`, `${idPrefix}_star_bronze`, `${idPrefix}_star_silver`, `${idPrefix}_star_gold`,
                            `${idPrefix}_exp_fill`, `${idPrefix}_talent_fill`
                        );
                    }
                }
            }
        }
        for (let i = 0; i < skills.keysInOrder.length; i++) {
            const key = skills.keysInOrder[i];
            createView.queueCache(
                `skill_wrap_${key}`, `skill_${key}_name`, `skill_${key}_talent_only`, `skill_${key}_slot_cat`,
                `skill_${key}_class_tag`, `skill_${key}_equipped_badge`
            );
        }
    },
    createBattleBuffSlots: function() {
        const row = document.getElementById("playerBuffRow");
        if (!row || row.dataset.buffSlotsBuilt === "1") {
            return;
        }
        row.dataset.buffSlotsBuilt = "1";
        for (let i = 0; i < BATTLE_BUFF_KEYS.length; i++) {
            const key = BATTLE_BUFF_KEYS[i];
            const def = battleBuffDefs[key];
            const slotEl = document.createElement("div");
            slotEl.id = `playerBuffSlot_${key}`;
            slotEl.className = "player-buff-slot showthat";
            slotEl.style.display = "none";
            const imgEl = document.createElement("img");
            imgEl.className = "player-buff-icon";
            imgEl.src = def.img;
            imgEl.alt = def.label;
            imgEl.draggable = false;
            const trEl = document.createElement("div");
            trEl.id = `playerBuffSlot_${key}_tr`;
            trEl.className = "hypervisible player-buff-num-tr";
            trEl.style.display = "none";
            const brEl = document.createElement("div");
            brEl.id = `playerBuffSlot_${key}_br`;
            brEl.className = "hypervisible player-buff-num-br";
            const tipEl = document.createElement("div");
            tipEl.id = `playerBuffSlot_${key}_tip`;
            tipEl.className = "showthis player-buff-tooltip";
            slotEl.appendChild(imgEl);
            slotEl.appendChild(trEl);
            slotEl.appendChild(brEl);
            slotEl.appendChild(tipEl);
            row.appendChild(slotEl);
        }
    },
    createSlapFxElements: function() {
        const layer = document.getElementById("slapFxLayer");
        if (!layer || layer.dataset.slapFxBuilt === "1") {
            return;
        }
        layer.dataset.slapFxBuilt = "1";
        const slotCount = (typeof engine !== "undefined" && engine.SLAP_DMG_SLOTS) ? engine.SLAP_DMG_SLOTS : 8;
        viewData.slapDmgElements = [];
        for (let i = 0; i < slotCount; i++) {
            const el = document.createElement("div");
            el.id = `slapDmg_${i}`;
            el.className = "slap-dmg-num hypervisible";
            el.style.display = "none";
            layer.appendChild(el);
            viewData.slapDmgElements.push(el);
            createView.queueCache(`slapDmg_${i}`);
        }
    },
    createPlayerFloatElements: function() {
        const layer = document.getElementById("slapFxLayer");
        if (!layer || layer.dataset.playerFloatBuilt === "1") {
            return;
        }
        layer.dataset.playerFloatBuilt = "1";
        const slotCount = (typeof engine !== "undefined" && engine.PLAYER_FLOAT_SLOTS) ? engine.PLAYER_FLOAT_SLOTS : 12;
        viewData.playerFloatElements = [];
        viewData.playerFloatRender = [];
        for (let i = 0; i < slotCount; i++) {
            const el = document.createElement("div");
            el.id = `playerFloat_${i}`;
            el.className = "slap-dmg-num hypervisible float-aud-gain";
            el.style.display = "none";
            layer.appendChild(el);
            viewData.playerFloatElements.push(el);
            viewData.playerFloatRender.push({ active: false, text: "", opacity: "", transform: "", cls: "" });
        }
    },
    createIntruderAttackGfxElements: function() {
        const layer = document.getElementById("slapFxLayer");
        if (!layer || layer.dataset.intruderAttackGfxBuilt === "1") {
            return;
        }
        layer.dataset.intruderAttackGfxBuilt = "1";
        const slotCount = (typeof engine !== "undefined" && engine.INTRUDER_ATTACK_FX_SLOTS) ? engine.INTRUDER_ATTACK_FX_SLOTS : 12;
        const before = document.getElementById("slapHandOuter");
        viewData.intruderAttackGfxElements = [];
        viewData.intruderAttackGfxRender = [];
        for (let i = 0; i < slotCount; i++) {
            const el = document.createElement("img");
            el.id = `intruderAttackGfx_${i}`;
            el.className = "intruder-attack-gfx";
            el.alt = "";
            el.draggable = false;
            el.style.display = "none";
            if (before && before.parentNode === layer) {
                layer.insertBefore(el, before);
            } else {
                layer.appendChild(el);
            }
            viewData.intruderAttackGfxElements.push(el);
            viewData.intruderAttackGfxRender.push({
                active: false,
                kind: "",
                transform: "",
                opacity: ""
            });
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
        const allTabs = ["base", "guests", "leveling", "stats", "skills", "travel", "history", "cardBonuses", "options"];
        const tabs = events.mainMenuTabOrder();
        const requestedTab = data.battle.currentTab || "base";
        const tab = tabs.indexOf(requestedTab) >= 0 ? requestedTab : "base";
        if (tab !== requestedTab) {
            data.battle.currentTab = tab;
        }
        for (let i = 0; i < allTabs.length; i++) {
            const key = allTabs[i];
            const paneId = `tabPane_${key}`;
            if (!viewData.cached[paneId]) {
                viewData.cached[paneId] = document.getElementById(paneId);
            }
            const shouldShow = (tabs.indexOf(key) >= 0) && key === tab;
            const paneDisplay = !shouldShow ? "none" : (key === "skills" ? "flex" : "block");
            view.updateVal(paneId, paneDisplay, "style.display");
        }
    },

    setAllCaches: function() {
        //uses createView.queueCache("<element ID>") for elements created in index.html

        createView.queueCache(
            "mainLayout", "gameColumnsRow", "gameProgressBars", "okamiProgressBar", "manaProgressBar", "manaFill", "manaAmount", "manaCap", "manaRate", "manaRateArchiveDrain", "manaEtaText",
            "divinityProgressBar", "divinityFill", "divinityAmount", "divinityCap", "divinityRate",
            "battlefieldWrap", "battlefield", "battleHud", "battleEndRunBtn", "waveInfo", "waveInfoTimeRow", "waveInfoStar", "waveInfoTimeLabel", "waveInfoTransition", "waveInfoZoneShards", "waveInfoZones", "rangeMarkers", "attackLines", "slapFxLayer", "slapHandOuter", "slapHandSide", "slapHandInner", "playerBuffRow", "playerStack", "playerToken", "playerTokenAudLayer", "playerTokenAudFill", "playerStatAudLine", "playerStatDmgLine", "playerMovePulse",
            "playerAttackBarFill", "playerAttackBarLabel", "playerSandalBarTrack", "playerSandalBarFill", "playerSandalBarLabel",
            "playerClassBarA", "playerClassBarALabel", "playerClassBarAFill", "playerClassBarB", "playerClassBarBLabel", "playerClassBarBFill",
            "playerLevelBar", "playerLevelBarFill", "playerLevelBarLabel",
            "playerBattleHudSecondary", "deathOverlay", "deathTitle", "deathManaBonus", "deathSummary", "deathTalentDetails", "tryAgainButton", "menuContent", "menuColumn", "battleColumn", "tabButton_base", "tabButton_guests", "tabButton_leveling", "tabButton_stats", "tabButton_skills", "tabButton_travel", "tabButton_history", "tabButton_cardBonuses", "tabButton_options", "cardBonusesList", "cardBonusesEmpty",
            "okamiTailLabel", "okamiLevelText", "okamiExpText", "okamiExpFill", "okamiSpiritStrands", "okamiSpiritStrandsNext", "okamiStateDisplay", "okamiInspirationBonus",
            "baseCoinsText", "baseStarBeadsText", "baseEssenceText", "basePaneTitleEssence", "basePaneTitleStarBeads", "basePaneTitleCoins", "baseWorkersAssigned", "baseWorkersFound", "baseBuyableWrap", "baseBuyableCount", "baseBuyableTooltipList", "baseBuildingInfo", "baseBuildingInfoScroll", "baseBuildingInfoWorkerDock", "guestsList",
            "resortInfo_empty", "resortInfo_hiddenSpring", "resortInfo_spirit", "resortInfo_fireLauncher", "resortInfo_torii", "resortInfo_inn", "resortInfo_noodleBar", "resortInfo_laundry", "resortInfo_path", "resortInfo_stonePile", "resortInfo_bambooForest", "resortInfo_garden", "resortInfo_atelier", "resortInfo_mage_tower", "resortInfo_bonfire", "resortInfo_shrine", "resortInfo_scrollArchives", "resortInfo_foxDen", "resortInfo_cistern", "resortInfo_pond", "resortInfo_mine", "resortInfo_market",
            "gardenAppraisalAuto_row", "gardenAppraisalAuto_chk", "gardenReviewAuto_row", "gardenReviewAuto_chk", "gardenReviewPaused_row", "gardenReviewPaused_chk",
            "foxDenMapDisplay",
            "bambooForestInfoChips", "bambooForestInfoWood", "bambooForestMapDisplay",
            "base_bambooForest_assign_one_btn", "base_bambooForest_assign_ten_btn", "base_bambooForest_assign_all_btn", "base_bambooForest_unassign_one_btn", "base_bambooForest_unassign_ten_btn", "base_bambooForest_unassign_all_btn", "base_bambooForest_workers_label", "base_bambooForest_worker_prod_text", "base_bambooForest_worker_prod_wrap", "base_bambooForest_worker_prog_fill", "base_bambooForest_assign_okami_btn",
            "base_foxDen_assign_one_btn", "base_foxDen_assign_ten_btn", "base_foxDen_assign_all_btn", "base_foxDen_unassign_one_btn", "base_foxDen_unassign_ten_btn", "base_foxDen_unassign_all_btn", "base_foxDen_workers_label", "base_foxDen_assign_okami_btn",
            "baseBuilding_bambooForest", "baseBuilding_foxDen", "okamiTravelToken", "dirtRoadLayer", "dirtRoadHoverLayer", "dirtRoadMouseTip", "constructionMouseTip", "foxDenQueueTip", "baseResortMap",
            "pathSegmentStateText", "base_path_select_next_row", "base_path_select_next_btn", "base_path_remove_rocks_row", "base_path_remove_rocks_btn", "base_path_remove_rocks_extra", "base_path_add_railing_row", "base_path_add_railing_btn", "base_path_add_railing_extra", "base_torii_call_for_ally_row", "base_torii_call_for_ally_btn", "base_torii_call_for_ally_extra", "okamiTravelToken", "okamiPathWeaveToken",
            "baseBuildingInfoClose", "baseBuildingInfoHideToggle", "baseBuildingInfoHeaderBtns",
            "base_hiddenSpring_earthSpirit_row", "base_hiddenSpring_earthSpirit_btn", "base_hiddenSpring_earthSpirit_extra",
            "base_hiddenSpring_waterSpirit_row", "base_hiddenSpring_waterSpirit_btn", "base_hiddenSpring_waterSpirit_extra",
            "base_hiddenSpring_fireSpirit_row", "base_hiddenSpring_fireSpirit_btn", "base_hiddenSpring_fireSpirit_extra",
            "spiritInfoTitle", "spiritInfoRenameBtn", "spiritInfoNameInput", "spiritInfoLevel", "spiritInfoPower", "spiritInfoPowerNote", "spiritInfoTrainingRow", "spiritInfoTraining", "spiritInfoTrainingNote", "spiritTrainingMinManaText", "spiritTrainingDurationText", "spiritTrainingCostText", "spiritTrainingExpText", "spiritTrainingGainText", "spiritInfoExp", "spiritInfoExpReq", "spiritInfoExpNote",
            "spiritInfoEarthExtras", "spiritInfoWaterExtras", "spiritInfoFireExtras", "spiritInfoFireLauncherExtras", "spiritInfoPlantExtras", "spiritInfoTaskWrap",
            "spiritInfoPebbles", "spiritInfoPebblesMax", "spiritInfoPebbleCarry", "spiritInfoPebbleEtas", "spiritInfoPrioritizeOreRow", "spiritInfoPrioritizeOre_chk", "spiritInfoAutoReturnMineRow", "spiritInfoAutoReturnMine_chk", "spiritInfoWaterVolume", "spiritInfoHeat", "spiritInfoEssence", "spiritInfoEqualSpacingRow", "spiritInfoEqualSpacing_chk", "spiritInfoDropletEtas", "spiritInfoFireNote",
            "spiritInfoFireLauncherName", "spiritInfoFireLauncherEmbers", "spiritInfoFireLauncherEmbersCap", "spiritInfoFireLauncherStats", "spiritInfoSelectLauncher_btn", "spiritInfoPlantColumn", "spiritInfoPlantChipsBonus",
            "spiritInfoTaskText", "spiritInfoTaskProgressWrap", "spiritInfoTaskFill",
            "cisternInfoWater", "cisternInfoTemperature", "cisternInfoCapacity", "cisternWaterCarry_row", "cisternWaterCarry", "cisternWishingWell_row", "cisternWishingWellCoins",
            "cisternReplaceHotWater_row", "cisternReplaceHotWater_chk", "cisternRefuseWater_row", "cisternRefuseWater_chk", "cisternViscosity_row", "cisternViscosity_chk", "cisternEmptyHalf_btn",
            "pondInfoWater", "pondWishingWellRate", "pondWaterSpiritExp", "pondSendWater_row",
            "bambooForestWater_row", "bambooForestWaterText", "bambooForestFertilizer_row", "bambooForestFertilizerText",
            "base_bambooForest_infuse_soil_row", "base_bambooForest_infuse_soil_btn", "base_bambooForest_infuse_soil_extra",
            "toriiVisitorsWaiting", "toriiVisitorsMax", "toriiNextVisitor", "toriiAvgVisitorArrival", "toriiNextVisitorProgressWrap", "toriiNextVisitorProgressFill", "toriiWater_row", "toriiWaterFill", "toriiWaterText", "toriiAllowCarriersWater_row", "toriiAllowCarriersWater_chk", "toriiWaterReq_row", "okamiInspirationHint",
            "debugSpeedPanel", "debugSpeed_x3", "debugSpeed_x10", "bonusSpeedLabel", "bonusSpeedRemaining", "bonusSpeed_x2",
            "offlineProcessingOverlay", "offlineProcessingLabel", "offlineProcessingFill", "offlineProcessingEta", "offlineProcessingSummary", "offlineProcessingDismiss",
            "innRoomsAvailable", "innRoomsOccupied", "innRestfulnessPerSecond", "innInfoTitle", "innHotWater_row", "innHotWaterFill", "innHotWaterText", "innAllowCarriersWater_row", "innAllowCarriersWater_chk", "innSoap_row", "innSoapText", "innTowels_row", "innTowelsText", "innOnsenTempReq_row", "innOnsenSoak_row", "innOnsenPondExplain_row", "innMapLabelText", "innGuestsVisitPond_row",
            "innManaRow", "innFillMana_btn", "innManaProgressWrap", "innManaFill", "innManaAmount", "innManaCap", "innManaExplain_row",
            "innAllowCarriersMana_row", "innAllowCarriersMana_chk",
            "toriiManaRow", "toriiFillMana_btn", "toriiManaProgressWrap", "toriiManaFill", "toriiManaAmount", "toriiManaCap", "toriiManaExplain_row",
            "toriiAllowCarriersMana_row", "toriiAllowCarriersMana_chk",
            "stonePileManaRow", "stonePileFillMana_btn", "stonePileManaProgressWrap", "stonePileManaFill", "stonePileManaAmount", "stonePileManaCap", "stonePileManaExplain_row",
            "stonePileAllowCarriersMana_row", "stonePileAllowCarriersMana_chk",
            "hiddenSpringCollectStone_row", "hiddenSpringCollectStone_btn",
            "hiddenSpringManaRow", "hiddenSpringFillMana_btn", "hiddenSpringManaProgressWrap", "hiddenSpringManaFill", "hiddenSpringManaAmount", "hiddenSpringManaCap", "hiddenSpringManaExplain_row",
            "hiddenSpringAllowCarriersMana_row", "hiddenSpringAllowCarriersMana_chk",
            "stonePileDupeProgressWrap", "stonePileDupeProgressFill", "stonePileDupeIntervalText", "stonePileDupedStone_row", "stonePileDupedStoneValue", "stonePileAllowUnduplicated_row", "stonePileAllowUnduplicated_chk",
            "foxDenManaOrders_row", "foxDenManaOrders_chk",
            "foxDenAutoClearRocks_row", "foxDenAutoClearRocks_chk",
            "foxDenAutoAddRailings_row", "foxDenAutoAddRailings_chk", "foxDenAutoAddRailings_wait",
            "foxDenAutoAddStairs_row", "foxDenAutoAddStairs_chk", "foxDenAutoAddStairs_wait",
            "foxDenAutoAddLanterns_row", "foxDenAutoAddLanterns_chk", "foxDenAutoAddLanterns_wait",
            "foxDenCarry_resource", "foxDenCarryMana_row", "foxDenCarry_mana",
            "mapInnManaProgressWrap", "mapInnManaProgressFill",
            "mapInnWaterProgressWrap", "mapInnWaterProgressFill",
            "mapNoodleTipProgressWrap", "mapNoodleTipProgressFill",
            "mapNoodleWaterProgressWrap", "mapNoodleWaterProgressFill",
            "mapToriiManaProgressWrap", "mapToriiManaProgressFill",
            "mapToriiWaterProgressWrap", "mapToriiWaterProgressFill",
            "mapStonePileManaProgressWrap", "mapStonePileManaProgressFill",
            "mapHiddenSpringManaProgressWrap", "mapHiddenSpringManaProgressFill",
            "guestStarBeadsRange", "guestStarBeadsMin", "guestStarBeadsMax", "guestStarBeadsRangeNote",
            "kitsuneAssignTooltip", "kitsuneAssignTooltipList",
            "stonePileInfoValue", "stonePileMapValue", "atelierMapDisplay", "atelierOreBars_row", "atelierInfoOre", "atelierInfoBars", "toriiMapDisplay", "innMapDisplay", "cisternMapValue", "mageTowerMapDisplay", "shrineMapDisplay",
            "mapToriiProgressWrap", "mapToriiProgressFill", "mapLaundryProgressWrap", "mapLaundryProgressFill", "mapOrbProgressWrap", "mapOrbProgressFill", "mapShrineProgressWrap", "mapShrineProgressFill",
            "orbExpProgressWrap", "orbExpFill", "orbLevelText", "orbExpText", "orbExpToLevelText", "orbManaRateText", "orbBaseManaText", "orbBaseManaCloneBonusText", "orbExpRateText", "orbExpEtaText",
            "marketMapDisplay", "mapMarketProgressWrap", "mapMarketProgressFill",
            "marketExpProgressWrap", "marketExpFill", "marketLevelText", "marketExpText", "marketExpToLevelText", "marketCreditText", "marketCarryAmountText", "marketTradeStatus_row",
            "marketAllowStone_chk", "marketAllowWood_chk", "marketAllowBars_chk", "marketExchangeCredit_btn",
            "marketRepeatExchange_row", "marketRepeatExchange_chk",
            "base_market_traders_assign_one_btn", "base_market_traders_assign_ten_btn", "base_market_traders_assign_all_btn", "base_market_traders_unassign_one_btn", "base_market_traders_unassign_ten_btn", "base_market_traders_unassign_all_btn", "base_market_traders_workers_label",
            "base_mage_tower_assign_one_btn", "base_mage_tower_assign_ten_btn", "base_mage_tower_assign_all_btn", "base_mage_tower_unassign_one_btn", "base_mage_tower_unassign_ten_btn", "base_mage_tower_unassign_all_btn", "base_mage_tower_workers_label", "base_mage_tower_worker_prod_text", "base_mage_tower_worker_prod_wrap", "base_mage_tower_worker_prog_fill", "base_mage_tower_assign_okami_btn",
            "fireLauncherInfoTitle", "fireLauncherInfoType", "fireLauncherInfoEmbers", "fireLauncherInfoEmbersCap", "fireLauncherInfoEmbersRequire", "fireLauncherInfoRange", "fireLauncherInfoRangeBonus", "fireLauncherInfoInterval",
            "fireLauncherInfoEmberCost", "fireLauncherInfoHeat", "fireLauncherInfoHeatBonus", "fireLauncherInfoExp", "fireLauncherInfoExpPerSec", "fireLauncherInfoSpirit",
            "fireLauncherUpgrades_pathMid", "fireLauncherUpgrades_pathLower", "fireLauncherUpgrades_bendTop",
            "fireLauncherTargetPriority_row", "fireLauncherTarget_default", "fireLauncherTarget_closest", "fireLauncherTarget_furthest",
            "fireLauncherTarget_coldest", "fireLauncherTarget_hottest", "fireLauncherTarget_coldest_label", "fireLauncherTarget_hottest_label",
            "mineDepthLeftBtn", "mineDepthRightBtn", "mineDepthText", "mineDepthClears", "mineDepthReady", "mineStatusText", "mineGrid", "mineDirtText", "mineStoneText", "mineOreRow", "mineOreText", "minePrioritizeOreRow", "minePrioritizeOre_chk", "mineAssignedLevelText", "mineSpiritPowerText", "mineClearEtaText", "minePlayBlock", "minePlayProgressDetail", "minePlayProgressWrap", "minePlayProgressFill",
            "base_torii_assign_one_btn", "base_torii_assign_ten_btn", "base_torii_assign_all_btn", "base_torii_unassign_one_btn", "base_torii_unassign_ten_btn", "base_torii_unassign_all_btn", "base_torii_workers_label", "base_torii_worker_prod_text", "base_torii_worker_prod_wrap", "base_torii_worker_prog_fill",
            "base_laundry_assign_one_btn", "base_laundry_assign_ten_btn", "base_laundry_assign_all_btn", "base_laundry_unassign_one_btn", "base_laundry_unassign_ten_btn", "base_laundry_unassign_all_btn", "base_laundry_workers_label", "base_laundry_worker_prod_text", "base_laundry_worker_prod_wrap", "base_laundry_worker_prog_fill",
            "base_resource_strip", "base_res_stone",
            "basePanel_foxDen", "basePanel_mine", "basePanel_inn", "basePanel_bonfire", "basePanel_market", "basePanel_mage_tower", "basePanel_scrollArchives", "basePanel_atelier", "basePanel_garden",
            "base_foxDen_desc",
            "base_foxDen_hire_row", "base_foxDen_hire_btn", "base_foxDen_hire_extra",
            "base_inn_openGuests_row", "base_inn_openGuests_btn", "base_inn_openGuests_extra", "base_inn_open_row", "base_inn_next_row", "base_inn_adv_btn", "base_inn_adv_cd_wrap", "base_inn_adv_cd_fill", "base_inn_adv_cd_text", "base_inn_empty",
            "base_bonfire_clone_btn", "base_bonfire_clone_prefix", "base_bonfire_mana_cost", "bonfireCloneSettings_row", "bonfireCloneSettings_map", "bonfireCloneSettings_density",
            "bonfireApplyLiveSettings_row", "bonfireApplyLiveSettings_chk",
            "shrinePrestigeHeading", "shrineClassSelectRow", "shrineClassRow", "shrinePrestigeNote", "shrineMoveMountainRow", "shrineMoveConfirm_chk", "shrineMoveMountainBtn", "shrineMovePackError", "shrineClassDemoNote",
            "shrineKarmaRateText", "shrineDivinityRateText",
            "shrineExpProgressWrap", "shrineExpFill", "shrineLevelText", "shrineExpText", "shrineExpToLevelText",
            "shrinePacksSection", "shrinePackStrip", "shrinePackCommonCount", "shrinePackRareCount", "shrinePackEpicCount",
            "prestigePackOverlay", "prestigePackPanel", "prestigePackTitle", "prestigePackColumns", "prestigePackCounts", "prestigePackPreview", "prestigePackOdds", "prestigePackCards", "prestigePackError", "prestigePackActionBtn", "prestigePackSummary", "prestigeFinishBtn",
            "shrineMilestonesList",
            "shrineMs_shrineLevel_fill", "shrineMs_shrineLevel_check", "shrineMs_totalStars_fill", "shrineMs_totalStars_check",
            "shrineMs_okamiLevel_fill", "shrineMs_okamiLevel_check",
            "shrineMs_marketLevel_fill", "shrineMs_marketLevel_progress", "shrineMs_marketLevel_completed", "shrineMs_marketLevel_icon",
            "shrineMs_depthReached_fill", "shrineMs_depthReached_progress", "shrineMs_depthReached_completed", "shrineMs_depthReached_icon",
            "shrineMs_orbLevel_fill", "shrineMs_orbLevel_progress", "shrineMs_orbLevel_completed", "shrineMs_orbLevel_icon",
            "shrineMs_essenceMade_fill", "shrineMs_essenceMade_progress", "shrineMs_essenceMade_completed", "shrineMs_essenceMade_icon",
            "shrineMs_maxMana_fill", "shrineMs_maxMana_progress", "shrineMs_maxMana_completed", "shrineMs_maxMana_icon",
            "shrineMs_divinityAmount_fill", "shrineMs_divinityAmount_progress", "shrineMs_divinityAmount_completed", "shrineMs_divinityAmount_icon",
            "shrineMs_totalGoldStars_fill", "shrineMs_totalGoldStars_progress", "shrineMs_totalGoldStars_completed", "shrineMs_totalGoldStars_icon",
            "shrineMs_buildShrine_icon", "shrineMs_buildShrine_check",
            "bonfireDenseClones_row", "bonfireDenseClones_value",
            "bonfireDenseClones_dec_all", "bonfireDenseClones_dec_ten", "bonfireDenseClones_dec_one",
            "bonfireDenseClones_inc_one", "bonfireDenseClones_inc_ten", "bonfireDenseClones_inc_all",
            "bonfireAutoRetry_row", "bonfireAutoRetry_chk",
            "bonfireStartWithFullMana_row", "bonfireStartWithFullMana_chk",
            "bonfireFireTending_row", "bonfireFireTending_cap", "bonfireFireSpiritPower_row", "bonfireFireSpiritPower", "bonfireFireSpiritHeat_row", "bonfireWoodCarry_row", "bonfireWoodCarryLabel", "bonfireWoodCarry", "bonfireHeatPerFuel_row", "bonfireHeatPerWood", "bonfireHeatPerCoalPart", "bonfireHeatPerCoal", "bonfireCoal_row", "bonfireCoalText",
            "base_bonfire_growth_row", "base_bonfire_growth_btn", "base_bonfire_growth_extra",
            "base_bonfire_retry_row", "base_bonfire_retry_btn", "base_bonfire_retry_extra",
            "base_bonfire_dense_clones_row", "base_bonfire_dense_clones_btn", "base_bonfire_dense_clones_extra",
            "base_bonfire_planned_row", "base_bonfire_planned_btn", "base_bonfire_planned_extra",
            "base_bonfire_assign_one_btn", "base_bonfire_assign_ten_btn", "base_bonfire_assign_all_btn", "base_bonfire_unassign_one_btn", "base_bonfire_unassign_ten_btn", "base_bonfire_unassign_all_btn", "base_bonfire_workers_label", "base_bonfire_worker_prod_text", "base_bonfire_worker_prod_wrap", "base_bonfire_worker_prog_fill", "base_bonfire_assign_okami_btn",
            "scrollArchivesResearchProgressText", "scrollArchivesResearchRequiredText", "scrollArchivesResearchEtaText", "scrollArchivesResearchPaused_row",
            "scrollArchivesResearchesToChoose", "scrollArchivesChoicesWrap",
            "base_scrollArchives_row_finish_research", "base_scrollArchives_extra_finish_research", "base_scrollArchives_finish_research_btn",
            "base_garden_empty",
            "baseBuilding_hiddenSpring", "baseBuilding_torii", "baseBuilding_shrine", "baseBuilding_inn", "baseBuilding_noodleBar", "baseBuilding_laundry", "baseBuilding_stonePile", "baseBuilding_cistern", "baseBuilding_pond", "baseBuilding_mine",
            "baseBuilding_foxDen", "baseBuilding_bonfire", "baseBuilding_market", "baseBuilding_garden", "baseBuilding_atelier", "baseBuilding_mage_tower", "baseBuilding_scrollArchives",
            "levelText", "levelExpText", "levelTabExpFill", "attributePointsText", "strText", "conText", "spdText", "chaStatTip", "soulText", "soulStatTip", "strStatTip", "conStatTip", "currentClassText", "classPerLevelText", "attributePlanList", "levelingPointsWrap", "levelingAssignButtons", "attributePlanTitle", "attributePlanHighest", "attributePlanPending", "statsAudText", "statsAudTip", "statsRegenCard", "statsRegenText", "statsRegenTip", "statsAttackText", "statsAttackTip", "statsArmorCard", "statsArmorText", "statsArmorTip", "statsSlapText", "statsSlapTip", "statsSandalText", "statsSandalTip", "statsExtraCoinsCard", "statsExtraCoinsText", "statsExtraCoinsTip",
            "travelPane_maps", "travelPane_challenges", "travelSubTab_maps", "travelSubTab_challenges", "travelBonfireLaunchBtn", "travelGoBonfireBtn", "travelBonfireManaCost", "travelVentingSurplus_row", "travelVentingSurplus_chk", "skillsList", "historyList",
            "sandalAttackToggle", "sandalAttackWrap", "sandalAttackLockText", "manualSaveButton", "saveToFileRow", "saveToFileButton", "importFromFileButton", "hideMaxedUpgradesToggle", "disableCompactLayoutToggle", "numberTypeSuffix", "numberTypeScientific", "numberTypeEngineering", "offlineModeCatchUp", "offlineModePauseBonus", "statsSandalCard", "playTimeClock", "levelingPlayStats",             "skillSubTab_equipped", "skillSubTab_library", "unequipChargesText",
            "skillsShardSlotProgressWrap", "skillsShardSlotProgressTrack", "skillsShardSlotProgressFill", "skillsShardSlotProgressLabel",
            "combatStarsInventory", "combatStarsCounts", "compactViewTabs", "compactPane_menus", "compactPane_battle"
        );
        const maps = data.progress.mapDefinitions;
        for (let mi = 0; mi < maps.length; mi++) {
            const m = maps[mi];
            const mk = m.key;
            createView.queueCache(`travel_card_${mk}`, `travelRadio_${mk}`, `mapActionCurrent_${mk}`, `mapDifficulty_${mk}`, `mapWaves_${mk}`, `mapShardDrop_${mk}`, `mapStar_${mk}_bronze`, `mapStar_${mk}_silver`, `mapStar_${mk}_gold`, `mapWorkers_${mk}`);
        }
        for (let gi = 0; gi < 10; gi++) {
            createView.queueCache(`base_inn_guest_wrap_${gi}`, `base_inn_guest_name_${gi}`, `base_inn_guest_chat_${gi}`, `base_inn_guest_fill_${gi}`);
            createView.queueCache(`guestRow_${gi}`, `guestRow_${gi}_type`, `guestRow_${gi}_state`, `guestRow_${gi}_time`, `guestRow_${gi}_rest_text`, `guestRow_${gi}_restfulness`, `guestRow_${gi}_rest_end`);
        }
        for (let gli = 0; gli < 5; gli++) {
            createView.queueCache(`guestLogRow_${gli}`, `guestLogRow_${gli}_text`);
        }
        const marketTradeKeys = resortData.marketTradesOrder || [];
        for (let mti = 0; mti < marketTradeKeys.length; mti++) {
            const mtk = marketTradeKeys[mti];
            createView.queueCache(
                `marketTrade_${mtk}_row`, `marketTrade_${mtk}_chk`, `marketTrade_${mtk}_extra`,
                `marketTrade_${mtk}_threshold_row`, `marketTrade_${mtk}_threshold`,
                `marketTrade_${mtk}_stock`, `marketTrade_${mtk}_prog_wrap`, `marketTrade_${mtk}_prog_fill`
            );
        }
        createView.queueCache(
            "noodleBarNoodlesText", "noodleBarHotWater_row", "noodleBarHotWaterFill", "noodleBarHotWaterText", "noodleBarAllowCarriersWater_row", "noodleBarAllowCarriersWater_chk", "noodleBarWaterReq_row", "noodleBarEatExplain_row", "noodleBarEatRestBonusText",
            "noodleBarGuestsEating_row", "noodleBarGuestsEatingText",
            "noodleTipProgressWrap", "noodleTipProgressFill", "noodleTipProgressText", "noodleTipRateExplain_row", "noodleTipLast_row",
            "noodleTipLocked_row", "noodleTipControls", "noodleTipSystemExplain_row", "noodleTopicBtn", "noodleTipSelectHint"
        );
        for (let nti = 0; nti < 5; nti++) {
            createView.queueCache(
                `noodleTipSkill_${nti}`, `noodleTipSkill_${nti}_radio`, `noodleTipSkill_${nti}_name`,
                `noodleTipSkill_${nti}_desc`, `noodleTipSkill_${nti}_tips`
            );
        }
        createView.queueCache(
            "guestItinerarySection", "guestItineraryPanel",
            "guestItineraryLine_0", "guestItineraryLine_1", "guestItineraryLine_2", "guestItineraryLine_3", "guestItineraryLine_4"
        );
        for (let si = 0; si < 3; si++) {
            createView.queueCache(`spiritSlot_hiddenSpring_earth_${si}`, `spiritSlot_hiddenSpring_water_${si}`);
        }
        for (let si = 0; si < 3; si++) {
            createView.queueCache(`spiritSlot_mine_earth_${si}`, `spiritSlot_bonfire_fire_${si}`, `spiritSlot_atelier_fire_${si}`);
        }
        const launcherDefs = resortData.fireLauncherPlatformDefs || [];
        for (let li = 0; li < launcherDefs.length; li++) {
            const lk = launcherDefs[li].key;
            createView.queueCache(
                `fireLauncher_${lk}_wrap`, `fireLauncher_${lk}_range`, `fireLauncher_${lk}_emberFill`,
                `spiritSlot_fireLauncher_${lk}_0`
            );
        }
        for (let fi = 0; fi < 8; fi++) {
            createView.queueCache(`fireLauncherProjectile_${fi}`, `fireLauncherAoe_${fi}`);
        }
        createView.queueCache("spiritSlots_earth", "spiritSlots_water", "spiritSlots_bambooForest_plant", "spiritSlots_pond_water", "spiritSlots_bonfire_fire", "spiritSlots_atelier_fire", "spiritSlots_spiritTraining", "spiritSlot_spiritTraining_any_0");
        const pondSlotMax = engine.getPondWaterSpiritSlotMax();
        for (let bpi = 0; bpi < resortData.bambooForestConfig.stalkCount; bpi++) {
            createView.queueCache(`spiritSlot_bambooForest_plant_${bpi}`);
        }
        for (let pwi = 0; pwi < pondSlotMax; pwi++) {
            createView.queueCache(`spiritSlot_pond_water_${pwi}`);
        }
        for (let pi = 0; pi < 12; pi++) {
            createView.queueCache(`pebbleToken_${pi}`, `pebbleTokenAmt_${pi}`, `dropletToken_${pi}`, `dropletTokenInner_${pi}`, `dropletTokenAmtBelow_${pi}`, `dropletTokenAmtTop_${pi}`);
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
        for (let bci = 0; bci < bonfireClassOrder.length; bci++) {
            createView.queueCache(`shrine_class_btn_${bonfireClassOrder[bci]}`);
        }
        for (let sli = 0; sli < 7; sli++) {
            createView.queueCache(`shrineMs_shrineLevel_icon_${sli}`);
        }
        for (let sti = 0; sti < 6; sti++) {
            createView.queueCache(`shrineMs_totalStars_icon_${sti}`);
        }
        for (let oli = 0; oli < 8; oli++) {
            createView.queueCache(`shrineMs_okamiLevel_icon_${oli}`);
        }
        if (typeof engine.getResortPathSegmentSpecs === "function") {
            const pathSpecs = engine.getResortPathSegmentSpecs();
            for (let psi = 0; psi < pathSpecs.length; psi++) {
                createView.queueCache(`baseBuilding_path_${psi}`);
            }
        }
        for (let fui = 0; fui < resortData.getFoxDenUnlockOrder().length; fui++) {
            const fk = resortData.getFoxDenUnlockOrder()[fui];
            createView.queueCache(`foxDenSlot_${fk}`, `foxDenSlotPct_${fk}`);
        }
        for (let ci = 0; ci < 8; ci++) {
            createView.queueCache(`foxDenCarrier_${ci}`);
            createView.queueCache(`bonfireCarrier_${ci}`);
            createView.queueCache(`innCarrier_${ci}`);
            createView.queueCache(`cisternCarrier_${ci}`);
            createView.queueCache(`marketCarrier_${ci}`);
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
            const prodEl = document.getElementById(`base_${wsk}_worker_prod_text`);
            if (prodEl) {
                const nested = prodEl.querySelectorAll("[id]");
                for (let ni = 0; ni < nested.length; ni++) {
                    createView.queueCache(nested[ni].id);
                }
            }
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
                    resortData.idBtn(rbk, rslug),
                    `base_${rbk}_desc_${rslug}`
                );
            }
        }
        for (let bi = 0; bi < 25; bi++) {
            createView.queueCache(`mineBlock_${bi}`, `mineBlockFill_${bi}`);
        }
        for (let wzi = 0; wzi < createView.waveInfoZoneSlotCount; wzi++) {
            createView.queueCache(`waveInfoZone_${wzi}`);
        }
        for (let ci = 0; ci < 3; ci++) {
            createView.queueCache(`scrollArchivesChoice_${ci}`, `scrollArchivesChoiceSlotCat_${ci}`, `scrollArchivesChoiceType_${ci}`, `scrollArchivesChoiceDesc_${ci}`, `scrollArchivesChoiceTips_${ci}`, `scrollArchivesChoiceRadio_${ci}`);
        }
        createView.queueCache("base_scrollArchives_row_finish_research", "base_scrollArchives_extra_finish_research", "base_scrollArchives_finish_research_btn");
        for (let tui = 0; tui < resortData.getFoxDenUnlockOrder().length; tui++) {
            const kx = resortData.getFoxDenUnlockOrder()[tui];
            createView.queueCache(`base_foxDen_extra_${kx}`, resortData.idRow("foxDen", kx), resortData.idBtn("foxDen", kx));
        }
        for (let bi = 0; bi < BATTLE_BUFF_KEYS.length; bi++) {
            const bk = BATTLE_BUFF_KEYS[bi];
            createView.queueCache(`playerBuffSlot_${bk}`, `playerBuffSlot_${bk}_tr`, `playerBuffSlot_${bk}_br`, `playerBuffSlot_${bk}_tip`);
        }
        createView.clearCacheQueue();
        createView.cacheBuildingNotifyLabels();
        createView.ensureTabNotifyBadges();
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
            const battleVisible = !compactOn && !!(data.progress && (data.progress.showBattle || data.progress.selectedBaseBuilding)) && window.getComputedStyle(battleCol).display !== "none";
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
        const order = resortData.getFoxDenUnlockOrder();
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
        viewData.pathSegHighlightEls = [];
        viewData.pathSegHitEls = [];
        viewData.pathHighlightSig = null;
        engine._pathDomSig = null;
        engine._pathDomGlobalsApplied = false;
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
            viewData.pathSegHitEls[i] = hitPath;
            const hiPath = document.createElementNS(svgNs, "path");
            hiPath.id = `pathSegmentHighlight_${i}`;
            hiPath.setAttribute("d", d);
            hiPath.setAttribute("class", "path-seg-highlight");
            hiPath.setAttribute("fill", "none");
            hiPath.setAttribute("stroke-width", "6");
            hiPath.setAttribute("pointer-events", "none");
            highlightLayer.appendChild(hiPath);
            viewData.pathSegHighlightEls[i] = hiPath;
        }
        events.bindPathSegmentSvgHandlers();
        events.bindBaseMapRightClick();
        events.bindBaseBuildingInfoDismiss();
        events.bindSpiritSlotDrag();
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
            const baseLabel = resortData.getScopeDisplayName(k);
            labelEl.textContent = baseLabel;
            let badge = bel.querySelector(".resort-building-notify-badge");
            if (!badge) {
                badge = document.createElement("span");
                badge.className = "resort-building-notify-badge";
                badge.textContent = "!";
                badge.style.display = "none";
                bel.appendChild(badge);
            }
            viewData.cached["baseBuildingNotifyBadge_" + k] = badge;
            delete viewData.prevValues["baseBuildingNotifyBadge_" + k];
        }
    },
    ensureTabNotifyBadges: function() {
        const tabLabels = {
            base: "Resort", guests: "Guests", leveling: "Leveling", stats: "Stats",
            skills: "Skills", travel: "Travel", history: "History", cardBonuses: "Card Bonuses", options: "Options"
        };
        for (const tabKey in tabLabels) {
            const btnId = "tabButton_" + tabKey;
            const btn = document.getElementById(btnId);
            if (!btn) {
                continue;
            }
            if (!btn.dataset.tabLabel) {
                btn.dataset.tabLabel = tabLabels[tabKey];
            }
            let badge = btn.querySelector(".tab-notify-badge");
            if (!badge) {
                badge = document.createElement("span");
                badge.className = "tab-notify-badge";
                badge.textContent = "!";
                badge.style.display = "none";
                btn.appendChild(badge);
            }
            viewData.cached["tabNotifyBadge_" + tabKey] = badge;
            delete viewData.prevValues["tabNotifyBadge_" + tabKey];
        }
    },
    queueCache: function() {
        Array.prototype.push.apply(idsToCache, arguments);
    }
}