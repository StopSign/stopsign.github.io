/**
 * Bonfire class/modifier definitions, clone mana cost, heat bonuses, and combat start.
 */

var bonfireConfig = {
    baseCloneManaCost: 1000,
    classManaMult: 2,
    modifierManaMult: 1.2,
    heatDecayPerTick: 0.0005,
    heatPerWood: 10,
    heatBonusThreshold: 50,
    heatBonusThresholdStep: 1.5,
    heatBonusMultStart: 1.2,
    heatBonusMultStep: 1.05,
    spotlightDamageMult: 1.3
};

var bonfireClassDefs = {
    condescend: {
        key: "condescend",
        name: "Condescend",
        shortLabel: "Condescend",
        image: "img/condescend.svg",
        manaCostMult: 2,
        description: "Placeholder - look down on intruders with icy superiority. +1 Con per level.",
        perLevel: { str: 0, con: 1, spd: 0 }
    },
    mock: {
        key: "mock",
        name: "Mock",
        shortLabel: "Mock",
        image: "img/mock.svg",
        manaCostMult: 2,
        description: "Placeholder - ridicule foes until they falter. +1 Bru per level.",
        perLevel: { str: 1, con: 0, spd: 0 }
    },
    scold: {
        key: "scold",
        name: "Scold",
        shortLabel: "Scold",
        image: "img/scold.svg",
        manaCostMult: 2,
        description: "Placeholder - berate intruders into hesitation. +1 Spd per level.",
        perLevel: { str: 0, con: 0, spd: 1 }
    },
    shun: {
        key: "shun",
        name: "Shun",
        shortLabel: "Shun",
        image: "img/shun.svg",
        manaCostMult: 2,
        description: "Placeholder - exile threats from your presence. +1 Con per level.",
        perLevel: { str: 0, con: 1, spd: 0 }
    }
};

var bonfireModifierDefs = {
    spotlight: {
        key: "spotlight",
        name: "Spotlight",
        image: "img/spotlight.svg",
        manaCostMult: 1.2,
        classless: true,
        description: "All damage you deal and all damage you receive is increased by 30%."
    }
};

var bonfireClassOrder = ["condescend", "mock", "scold", "shun"];
var bonfireModifierOrder = ["spotlight"];

var bonfire = {
    grantCombatStartManaCapacityBonus: function() {
        const inc = data.progress.manaCapacityBonusPerCombatStart || 1;
        data.progress.mana.capacityBonus = (data.progress.mana.capacityBonus || 0) + inc;
    },

    getClassKeys: function() {
        return bonfireClassOrder.slice();
    },

    getModifierKeys: function() {
        return bonfireModifierOrder.slice();
    },

    getClassDef: function(classKey) {
        if (classKey === "none") {
            return resortData.bonfireClassDefs.none;
        }
        return bonfireClassDefs[classKey] || null;
    },

    getModifierDef: function(modKey) {
        return bonfireModifierDefs[modKey] || null;
    },

    isClassApplied: function(classKey) {
        const bf = data.progress.base.bonfire;
        return bf.appliedClassKey === classKey;
    },

    isModifierApplied: function(modKey) {
        const bf = data.progress.base.bonfire;
        return !!(bf.appliedModifiers && bf.appliedModifiers[modKey]);
    },

    selectClass: function(classKey) {
        const bf = data.progress.base.bonfire;
        if (bf.selectedClassKey === classKey) {
            bf.selectedClassKey = null;
        } else {
            bf.selectedClassKey = classKey;
            bf.selectedModifierKey = null;
        }
    },

    selectModifier: function(modKey) {
        const bf = data.progress.base.bonfire;
        if (bf.selectedModifierKey === modKey) {
            bf.selectedModifierKey = null;
        } else {
            bf.selectedModifierKey = modKey;
            bf.selectedClassKey = null;
        }
    },

    applyCurrentSelection: function() {
        const bf = data.progress.base.bonfire;
        if (bf.selectedClassKey) {
            if (bf.appliedClassKey === bf.selectedClassKey) {
                bf.appliedClassKey = null;
            } else {
                bf.appliedClassKey = bf.selectedClassKey;
            }
            return;
        }
        if (bf.selectedModifierKey) {
            const mk = bf.selectedModifierKey;
            if (!bf.appliedModifiers) {
                bf.appliedModifiers = {};
            }
            bf.appliedModifiers[mk] = !bf.appliedModifiers[mk];
            if (!bf.appliedModifiers[mk]) {
                delete bf.appliedModifiers[mk];
            }
        }
    },

    getCloneManaCostFromSnapshot: function(classKey, modifiers) {
        let cost = bonfireConfig.baseCloneManaCost;
        if (classKey && classKey !== "none") {
            const cd = bonfire.getClassDef(classKey);
            cost *= (cd && cd.manaCostMult) || bonfireConfig.classManaMult;
        }
        const mods = modifiers || {};
        for (let i = 0; i < bonfireModifierOrder.length; i++) {
            const mk = bonfireModifierOrder[i];
            if (mods[mk]) {
                const md = bonfire.getModifierDef(mk);
                cost *= (md && md.manaCostMult) || bonfireConfig.modifierManaMult;
            }
        }
        return Math.round(cost);
    },

    getCloneManaCost: function() {
        const bf = data.progress.base.bonfire;
        return bonfire.getCloneManaCostFromSnapshot(bf.appliedClassKey, bf.appliedModifiers);
    },

    canAffordClone: function() {
        if (!engine.isManaUnlocked()) {
            return false;
        }
        const mana = data.progress.mana;
        return (mana.amount || 0) >= bonfire.getCloneManaCost();
    },

    canAffordRetryWithStoredSettings: function() {
        if (!engine.isManaUnlocked()) {
            return false;
        }
        const settings = data.battle && data.battle.cloneRunSettings;
        const cost = settings
            ? (settings.manaCost || bonfire.getCloneManaCostFromSnapshot(settings.classKey, settings.modifiers))
            : bonfire.getCloneManaCost();
        const mana = data.progress.mana;
        return (mana.amount || 0) >= cost;
    },

    getAppliedModifiersSnapshot: function() {
        const bf = data.progress.base.bonfire;
        return Object.assign({}, bf.appliedModifiers || {});
    },

    isGrowthBlessingUnlocked: function() {
        const bf = data.progress.base.bonfire;
        return !!bf.growthBlessingUnlocked;
    },

    isPlannedGrowthUnlocked: function() {
        const bf = data.progress.base.bonfire;
        return !!bf.plannedGrowthBlessingUnlocked;
    },

    isAutoRetryEnabled: function() {
        const bf = data.progress.base.bonfire;
        return !!bf.autoRetryEnabled;
    },

    getNextHeatThreshold: function(heat) {
        const start = bonfireConfig.heatBonusThreshold;
        if (heat <= start) {
            return start;
        }
        let threshold = start;
        while (heat > threshold) {
            threshold *= bonfireConfig.heatBonusThresholdStep;
        }
        return threshold;
    },

    getManaGainBonusMultiplier: function(heat) {
        const start = bonfireConfig.heatBonusThreshold;
        if (heat <= start) {
            return 1;
        }
        let threshold = start * bonfireConfig.heatBonusThresholdStep;
        let mult = bonfireConfig.heatBonusMultStart;
        while (heat > threshold) {
            threshold *= bonfireConfig.heatBonusThresholdStep;
            mult *= bonfireConfig.heatBonusMultStep;
        }
        return mult;
    },

    getHeatDisplay: function() {
        const bf = data.progress.base.bonfire;
        const heat = bf.heat || 0;
        const nextThreshold = bonfire.getNextHeatThreshold(heat);
        const bonusMult = bonfire.getManaGainBonusMultiplier(heat);
        const bonusLabel = bonusMult > 1 ? `x${round2(bonusMult)}` : "x1";
        return { heat: heat, nextThreshold: nextThreshold, bonusLabel: bonusLabel };
    },

    getHeatBarFillPercent: function(heat) {
        const start = bonfireConfig.heatBonusThreshold;
        const h = heat || 0;
        if (h <= 0) {
            return 0;
        }
        if (h <= start) {
            return Math.max(0, Math.min(100, (h / start) * 100));
        }
        let prevThreshold = start;
        let nextThreshold = start * bonfireConfig.heatBonusThresholdStep;
        while (h > nextThreshold) {
            prevThreshold = nextThreshold;
            nextThreshold *= bonfireConfig.heatBonusThresholdStep;
        }
        const span = nextThreshold - prevThreshold;
        if (span <= 0) {
            return 100;
        }
        return Math.max(0, Math.min(100, ((h - prevThreshold) / span) * 100));
    },

    getCombatDamageMultiplier: function() {
        const mods = data.battle && data.battle.bonfireModifiers;
        if (mods && mods.spotlight) {
            return bonfireConfig.spotlightDamageMult;
        }
        return 1;
    },

    startCloneCombat: function(mapKey) {
        if (!bonfire.canAffordClone()) {
            return false;
        }
        const targetKey = mapKey || data.progress.selectedTravelMapKey || data.progress.currentMapKey;
        const defs = data.progress.mapDefinitions || [];
        let target = null;
        for (let i = 0; i < defs.length; i++) {
            if (defs[i].key === targetKey) {
                target = defs[i];
                break;
            }
        }
        if (!target || !mapData.isMapUnlocked(target, data.progress)) {
            return false;
        }
        const bf = data.progress.base.bonfire;
        const appliedClass = bf.appliedClassKey || "none";
        const reqClass = target.requiredClassKey || "";
        if (reqClass && reqClass !== appliedClass) {
            return false;
        }
        const modifierSnapshot = bonfire.getAppliedModifiersSnapshot();
        const cost = bonfire.getCloneManaCostFromSnapshot(appliedClass, modifierSnapshot);
        const mana = data.progress.mana;
        mana.amount = Math.max(0, (mana.amount || 0) - cost);
        bonfire.grantCombatStartManaCapacityBonus();

        data.progress.currentClassKey = appliedClass;
        if (appliedClass === "scold") {
            data.progress.sandalAttackEnabled = false;
        }
        data.progress.battleUnlocked = true;
        data.progress.showBattle = true;
        data.progress.currentMapKey = targetKey;
        const travelSeed = Math.floor(Math.random() * 0x7fffffff) + 1;
        initialize.resetSkillRunProgress();
        initialize.startFreshBattle(travelSeed, targetKey);
        data.battle.bonfireModifiers = modifierSnapshot;
        data.battle.cloneRunSettings = {
            classKey: appliedClass,
            modifiers: Object.assign({}, modifierSnapshot),
            mapKey: targetKey,
            manaCost: cost
        };
        data.battle.pendingOkamiExp = 0;
        data.progress.autoRetryCountdownSec = 0;
        return true;
    },

    retryWithStoredSettings: function() {
        const settings = data.battle && data.battle.cloneRunSettings;
        if (!settings) {
            return false;
        }
        if (!engine.isManaUnlocked()) {
            return false;
        }
        const cost = settings.manaCost || bonfire.getCloneManaCostFromSnapshot(settings.classKey, settings.modifiers);
        const mana = data.progress.mana;
        if ((mana.amount || 0) < cost) {
            return false;
        }
        mana.amount = Math.max(0, (mana.amount || 0) - cost);
        bonfire.grantCombatStartManaCapacityBonus();
        const classKey = settings.classKey || "none";
        data.progress.currentClassKey = classKey;
        if (classKey === "scold") {
            data.progress.sandalAttackEnabled = false;
        }
        const modifierSnapshot = Object.assign({}, settings.modifiers || {});
        const currentSeed = data.battle.generatedFromSeed || data.battle.seed || 1337;
        const nextResetCount = (data.battle.resetCount || 0) + 1;
        initialize.resetSkillRunProgress();
        initialize.startFreshBattle(currentSeed, settings.mapKey || data.progress.currentMapKey);
        data.battle.bonfireModifiers = modifierSnapshot;
        data.battle.cloneRunSettings = {
            classKey: classKey,
            modifiers: modifierSnapshot,
            mapKey: settings.mapKey || data.progress.currentMapKey,
            manaCost: cost
        };
        data.battle.resetCount = nextResetCount;
        data.progress.autoRetryCountdownSec = 0;
        data.progress.showBattle = true;
        data.gameSettings.stopAll = false;
        return true;
    }
};
