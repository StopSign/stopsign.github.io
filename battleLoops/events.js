//Contains functions that happen based on user action, or triggers

let events = {
    toggleSkipButtons: function(disable) {
        const ids = ['skipTime1', 'skipTime10', 'skipTime60'];
        for (let id of ids) {
            let btn = document.getElementById(id);
            if (btn) {
                btn.style.backgroundColor = disable ? "grey" : "darkblue";
                btn.style.pointerEvents = disable ? "none" : "auto";
            }
        }
    },
    tryAgain: function() {
        initialize.resetBattleFromSeed();
    },
    switchTab: function(tabKey) {
        data.battle.currentTab = tabKey;
        createView.showCurrentTab();
    },
    assignAttribute: function(attributeKey) {
        const worked = engine.applyAttributePoint(attributeKey, true);
        if (!worked) {
            return;
        }
    },
    clearAttributePlan: function() {
        data.progress.attributePlan = [];
        initialize.applyPlanForCurrentLevel();
        initialize.applyConToPlayer(false);
    },
    changeMap: function(mapKey) {
        if (mapKey === data.progress.currentMapKey) {
            return;
        }
        data.progress.currentMapKey = mapKey;
        const mapDef = initialize.getCurrentMapDefinition();
        initialize.resetSkillRunProgress();
        initialize.startFreshBattle(mapDef.seed, mapKey);
    },
    setRangedAttackEnabled: function(enabled) {
        data.progress.rangedAttackEnabled = !!enabled;
        const el = viewData.cached.rangedAttackToggle || document.getElementById("rangedAttackToggle");
        if (el) {
            el.checked = data.progress.rangedAttackEnabled;
        }
    },
    setGearVariant: function(slotKey, variant) {
        if (!data.progress.gear || !data.progress.gear.slots || !data.progress.gear.slots[slotKey]) {
            return;
        }
        const v = String(variant);
        if (v !== "light" && v !== "medium" && v !== "heavy") {
            return;
        }
        data.progress.gear.slots[slotKey].variant = v;
        initialize.applyConToPlayer(false);
    },
    toggleSkillWrap: function(skillKey) {
        const wrap = document.getElementById(`skill_wrap_${skillKey}`);
        if (!wrap) {
            return;
        }
        wrap.classList.toggle("skill-block--expanded");
    },
    upgradeGearSlot: function(slotKey) {
        if (!data.progress.gear || !data.progress.gear.slots || !data.progress.gear.slots[slotKey]) {
            return;
        }
        const st = data.progress.gear.slots[slotKey];
        const lv = st.level || 0;
        const cost = gameData.getGearUpgradeCost(lv);
        if (data.progress.gold < cost) {
            return;
        }
        data.progress.gold -= cost;
        st.level = lv + 1;
        initialize.applyConToPlayer(false);
    }
}