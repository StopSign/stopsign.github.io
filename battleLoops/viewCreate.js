
let idsToCache = [];

let createView = {
    initializeDisplay: function() {
        createView.setStaticDimensions();
        createView.createSkillElements();
        createView.createGearElements();
        createView.showCurrentTab();
        createView.setAllCaches(); //happens after generation
    },
    createSkillElements: function() {
        const skillsList = document.getElementById("skillsList");
        if (!skillsList) {
            return;
        }
        const skillKeys = skills.getSkillKeysInDisplayOrder(data.progress.skills);
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
                    <div class="skill-exp-on-trigger" id="skill_${key}_exp_on_trigger"></div>
                    <div class="prog-label-row skill-exp-row">Skill exp: <span id="skill_${key}_exp_text"></span> <span class="skill-exp-mults" id="skill_${key}_exp_mults"></span></div>
                    <div class="prog-label-row">Talent: <span id="skill_${key}_talent_text"></span></div>
                    </div>
                </div>
            `;
        }
        skillsList.innerHTML = html;
        for (let i = 0; i < skillKeys.length; i++) {
            const key = skillKeys[i];
            createView.queueCache(
                `skill_${key}_headline`, `skill_${key}_reward`, `skill_${key}_trigger`, `skill_${key}_exp_on_trigger`,
                `skill_${key}_exp_mults`, `skill_${key}_exp_text`, `skill_${key}_exp_fill`,
                `skill_${key}_talent_text`, `skill_${key}_talent_fill`
            );
        }
    },
    createGearElements: function() {
        const root = document.getElementById("gearSlots");
        if (!root || !gameData.gearSlotOrder) {
            return;
        }
        const order = gameData.gearSlotOrder;
        const variants = gameData.gearVariants;
        let html = "";
        for (let i = 0; i < order.length; i++) {
            const slot = order[i];
            const title = gameData.gearSlotTitles[slot] || slot;
            html += `<div class="gear-slot-block">`;
            html += `<div class="gear-slot-title"><b>${title}</b></div>`;
            html += `<div class="gear-variant-row">`;
            for (let j = 0; j < variants.length; j++) {
                const v = variants[j];
                const vid = `gear_btn_${slot}_${v}`;
                const lab = gameData.gearVariantLabels[v];
                html += `<button type="button" class="gear-var-btn" id="${vid}" onclick="events.setGearVariant('${slot}','${v}')">${lab}</button>`;
            }
            html += `</div>`;
            html += `<div class="gear-slot-meta">Level <span id="gear_slot_${slot}_lvl"></span> · `;
            html += `Effects (at full stats): <span id="gear_slot_${slot}_fxraw"></span></div>`;
            html += `<div class="gear-req-line">Req: <span id="gear_slot_${slot}_req"></span> · Eff: <span id="gear_slot_${slot}_eff"></span></div>`;
            html += `<div class="gear-upgrade-row"><button type="button" class="tab-button gear-upgrade-btn" id="gear_up_${slot}" onclick="events.upgradeGearSlot('${slot}')">Upgrade</button> `;
            html += `<span class="gear-cost" id="gear_slot_${slot}_cost"></span></div>`;
            html += `</div>`;
        }
        root.innerHTML = html;
        for (let i2 = 0; i2 < order.length; i2++) {
            const slot2 = order[i2];
            for (let j2 = 0; j2 < variants.length; j2++) {
                createView.queueCache(`gear_btn_${slot2}_${variants[j2]}`);
            }
            createView.queueCache(
                `gear_slot_${slot2}_lvl`, `gear_slot_${slot2}_fxraw`, `gear_slot_${slot2}_req`,
                `gear_slot_${slot2}_eff`, `gear_slot_${slot2}_cost`, `gear_up_${slot2}`
            );
        }
    },
    setStaticDimensions: function() {
        const battlefield = document.getElementById("battlefield");
        const battlefieldWrap = document.getElementById("battlefieldWrap");
        const initialBattleHeight = Math.floor(window.innerHeight * 0.5 * 1.8);
        battlefield.style.height = `${initialBattleHeight}px`;
        const approxBattleCol = Math.max(320, window.innerWidth - 680 - 40);
        const staticBattleWidth = Math.floor(approxBattleCol * 0.7);
        battlefieldWrap.style.width = `${staticBattleWidth}px`;
    },
    showCurrentTab: function() {
        const tab = data.battle.currentTab || "gear";
        const tabs = ["gear", "leveling", "skills", "travel", "history"];
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
            "mainLayout", "battlefieldWrap", "battlefield", "waveInfo", "attackLines", "playerStack", "playerToken",
            "playerAttackBarFill", "playerAttackBarLabel", "playerRangedBarFill", "playerRangedBarLabel",
            "playerLevelBarFill", "playerLevelBarLabel",
            "playerHpText", "deathOverlay", "deathTitle", "deathSummary", "deathTalentDetails", "menuContent", "menuColumn", "battleColumn", "tabButton_gear", "tabButton_leveling", "tabButton_skills", "tabButton_travel", "tabButton_history",
            "goldText", "gearSummaryLine", "levelText", "levelExpText", "levelTabExpFill", "attributePointsText", "strText", "conText", "spdText", "soulText", "attributePlanList",
            "mapButton_map_1", "mapButton_map_2", "mapDifficulty_map_1", "mapDifficulty_map_2", "skillsList", "historyList",
            "rangedAttackToggle"
        );
        createView.clearCacheQueue();
        createView.updateLayoutMeasurements();
    },
    updateLayoutMeasurements: function() {
        const battlefield = viewData.cached.battlefield;
        const player = viewData.cached.playerToken;
        if (!battlefield || !player) {
            return;
        }
        viewData.layout.battlefieldHeightPx = battlefield.clientHeight;
        viewData.layout.battlefieldWidthPx = battlefield.clientWidth;
        const fieldRect = battlefield.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();
        viewData.layout.playerTopPx = playerRect.top - fieldRect.top;
        const menuCol = viewData.cached.menuColumn;
        const battleCol = viewData.cached.battleColumn;
        if (menuCol && battleCol) {
            menuCol.style.maxHeight = `${battleCol.offsetHeight}px`;
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