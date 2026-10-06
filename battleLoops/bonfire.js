/**
 * Bonfire class/modifier definitions, clone mana cost, heat bonuses, and combat start.
 */

var bonfireConfig = {
    baseCloneManaCost: 1000,
    classDivinityCost: 5000,
    densityManaPerLevel: 500,
    densityStatBonusPerLevel: 0.1,
    modifierManaMult: 1.2,
    heatDecayPerTick: 0.0005,
    heatPerWood: 10,
    heatPerCoalMult: 5,
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
    grantRunEndManaCapacityBonus: function() {
        const inc = engine.getManaCapacityBonusPerCloneDispersal();
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

    getCloneManaCostFromSnapshot: function(classKey, modifiers, density) {
        const dens = Math.max(0, density || 0);
        let cost = bonfireConfig.baseCloneManaCost + dens * (bonfireConfig.densityManaPerLevel || 500);
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

    getCloneDensity: function() {
        const bf = data.progress.base.bonfire;
        if (!bf.denseClonesUnlocked) {
            return 0;
        }
        return bonfire.clampCloneDensity(bf.cloneDensity || 0);
    },

    getMaxCloneDensity: function() {
        if (!engine.isManaUnlocked()) {
            return 0;
        }
        const orb = data.progress.base && data.progress.base.mage_tower;
        const orbLevelCap = Math.floor(((orb && orb.level) || 0) / 2);
        const cap = engine.getManaCapacity();
        const bf = data.progress.base.bonfire;
        const mods = bf.appliedModifiers || {};
        const classKey = bf.appliedClassKey || "none";
        let n = 0;
        while (n < orbLevelCap && bonfire.getCloneManaCostFromSnapshot(classKey, mods, n + 1) < cap) {
            n++;
        }
        return n;
    },

    clampCloneDensity: function(n) {
        const v = Math.max(0, Math.floor(n || 0));
        return Math.min(v, bonfire.getMaxCloneDensity());
    },

    getCloneDensityStatMult: function(density) {
        const d = Math.max(0, density || 0);
        return 1 + d * (bonfireConfig.densityStatBonusPerLevel || 0.1);
    },

    getCloneDivinityCost: function() {
        return bonfireConfig.classDivinityCost || 5000;
    },

    formatCloneCostText: function(manaCost, divinityCost) {
        let text = `${intToStringRound(manaCost)} mana`;
        if ((divinityCost || 0) > 0) {
            text += `, ${intToStringRound(divinityCost)} divinity`;
        }
        return text;
    },

    getEffectiveClonePlan: function() {
        const bf = data.progress.base && data.progress.base.bonfire;
        const appliedClass = (bf && bf.appliedClassKey) || "none";
        const appliedMods = bonfire.getAppliedModifiersSnapshot();
        const useClass = appliedClass && appliedClass !== "none";
        const shrine = data.progress.base && data.progress.base.shrine;
        const allowBypass = !!(shrine && shrine.allowClasslessWithoutDivinity);
        const divinityAmt = (data.progress.divinity && data.progress.divinity.amount) || 0;
        const classDivinityCost = useClass ? bonfire.getCloneDivinityCost() : 0;
        let classKey = appliedClass;
        let modifiers = appliedMods;
        let divinityCost = 0;
        let blocked = false;
        if (useClass) {
            if (divinityAmt >= classDivinityCost) {
                divinityCost = classDivinityCost;
            } else if (allowBypass) {
                classKey = "none";
                modifiers = {};
                divinityCost = 0;
            } else {
                divinityCost = classDivinityCost;
                blocked = true;
            }
        }
        const density = bonfire.getCloneDensity();
        return {
            classKey: classKey,
            modifiers: modifiers,
            manaCost: bonfire.getCloneManaCostFromSnapshot(classKey, modifiers, density),
            divinityCost: divinityCost,
            blocked: blocked,
            cloneDensity: density
        };
    },

    cloneLiveSettingsDifferFromStored: function() {
        const stored = data.battle && data.battle.cloneRunSettings;
        if (!stored) {
            return false;
        }
        const plan = bonfire.getEffectiveClonePlan();
        if ((plan.cloneDensity || 0) !== (stored.cloneDensity || 0)) {
            return true;
        }
        const liveMap = data.progress.selectedTravelMapKey || data.progress.currentMapKey;
        if ((liveMap || "") !== (stored.mapKey || data.progress.currentMapKey || "")) {
            return true;
        }
        if ((plan.classKey || "none") !== (stored.classKey || "none")) {
            return true;
        }
        const liveMods = plan.modifiers || {};
        const storedMods = stored.modifiers || {};
        const seen = {};
        const liveKeys = Object.keys(liveMods);
        for (let i = 0; i < liveKeys.length; i++) {
            seen[liveKeys[i]] = true;
            if (!!liveMods[liveKeys[i]] !== !!storedMods[liveKeys[i]]) {
                return true;
            }
        }
        const storedKeys = Object.keys(storedMods);
        for (let i = 0; i < storedKeys.length; i++) {
            if (!seen[storedKeys[i]] && storedMods[storedKeys[i]]) {
                return true;
            }
        }
        return false;
    },

    getCloneManaCost: function() {
        const bf = data.progress.base.bonfire;
        return bonfire.getCloneManaCostFromSnapshot(bf.appliedClassKey, bf.appliedModifiers, bonfire.getCloneDensity());
    },

    canAffordClone: function() {
        if (!engine.isManaUnlocked()) {
            return false;
        }
        const plan = bonfire.getEffectiveClonePlan();
        if (plan.blocked) {
            return false;
        }
        const mana = data.progress.mana;
        if ((mana.amount || 0) < plan.manaCost) {
            return false;
        }
        if ((plan.divinityCost || 0) > 0) {
            const divinity = data.progress.divinity;
            if (((divinity && divinity.amount) || 0) < plan.divinityCost) {
                return false;
            }
        }
        return true;
    },

    canAffordRetryWithStoredSettings: function() {
        if (!engine.isManaUnlocked()) {
            return false;
        }
        const settings = data.battle && data.battle.cloneRunSettings;
        const cost = settings
            ? (settings.manaCost || bonfire.getCloneManaCostFromSnapshot(settings.classKey, settings.modifiers, settings.cloneDensity))
            : bonfire.getCloneManaCost();
        const mana = data.progress.mana;
        if ((mana.amount || 0) < cost) {
            return false;
        }
        const divinityCost = settings ? (settings.divinityCost || 0) : 0;
        if (divinityCost > 0) {
            const divinity = data.progress.divinity;
            if (((divinity && divinity.amount) || 0) < divinityCost) {
                return false;
            }
        }
        return true;
    },

    isApplyLiveSettingsToNextClone: function() {
        const bf = data.progress.base && data.progress.base.bonfire;
        return !!(bf && bf.applyLiveSettingsToNextClone);
    },

    shouldUseLiveCloneSettings: function() {
        if (bonfire.isApplyLiveSettingsToNextClone()) {
            return true;
        }
        return !(data.battle && data.battle.cloneRunSettings);
    },

    getCreateClonePlan: function() {
        if (bonfire.shouldUseLiveCloneSettings()) {
            return bonfire.getEffectiveClonePlan();
        }
        const settings = data.battle.cloneRunSettings;
        return {
            classKey: settings.classKey || "none",
            modifiers: settings.modifiers || {},
            manaCost: settings.manaCost || bonfire.getCloneManaCostFromSnapshot(settings.classKey, settings.modifiers, settings.cloneDensity),
            divinityCost: settings.divinityCost || 0,
            blocked: false,
            cloneDensity: settings.cloneDensity || 0
        };
    },

    canAffordCreateClone: function() {
        if (bonfire.shouldUseLiveCloneSettings()) {
            return bonfire.canAffordClone();
        }
        return bonfire.canAffordRetryWithStoredSettings();
    },

    startNextClone: function(mapKey) {
        if (bonfire.shouldUseLiveCloneSettings()) {
            return bonfire.startCloneCombat(mapKey);
        }
        return bonfire.retryWithStoredSettings();
    },

    isStartWithFullManaEnabled: function() {
        const bf = data.progress.base && data.progress.base.bonfire;
        return !!(bf && bf.startWithFullManaUnlocked && bf.startWithFullManaEnabled);
    },

    isManaFull: function() {
        if (!engine.isManaUnlocked()) {
            return false;
        }
        const mana = data.progress.mana;
        const cap = engine.getManaCapacity();
        return !!(mana && cap > 0 && (mana.amount || 0) >= cap);
    },

    tryPostBattleCloneSpawn: function() {
        if (!data.battle || data.battle.state === "running") {
            return false;
        }
        const canAfford = bonfire.canAffordCreateClone();
        if (bonfire.isAutoRetryEnabled() && canAfford) {
            return bonfire.startNextClone();
        }
        if (bonfire.isStartWithFullManaEnabled() && bonfire.isManaFull() && canAfford) {
            return bonfire.startNextClone();
        }
        return false;
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
        return !!(bf.autoRetryUnlocked && bf.autoRetryEnabled);
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
        const plan = bonfire.getEffectiveClonePlan();
        if (plan.blocked) {
            return false;
        }
        const appliedClass = plan.classKey || "none";
        const reqClass = target.requiredClassKey || "";
        if (reqClass && reqClass !== appliedClass) {
            return false;
        }
        const modifierSnapshot = Object.assign({}, plan.modifiers || {});
        const cost = plan.manaCost;
        const divinityCost = plan.divinityCost || 0;
        const mana = data.progress.mana;
        if ((mana.amount || 0) < cost) {
            return false;
        }
        if (divinityCost > 0) {
            const divinity = data.progress.divinity;
            if (!divinity || (divinity.amount || 0) < divinityCost) {
                return false;
            }
            divinity.amount = Math.max(0, (divinity.amount || 0) - divinityCost);
        }
        mana.amount = Math.max(0, (mana.amount || 0) - cost);

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
        data.battle.cloneDensity = plan.cloneDensity || 0;
        initialize.calcPlayerStats(true);
        data.battle.cloneRunSettings = {
            classKey: appliedClass,
            modifiers: Object.assign({}, modifierSnapshot),
            mapKey: targetKey,
            manaCost: cost,
            divinityCost: divinityCost,
            cloneDensity: plan.cloneDensity || 0
        };
        data.battle.pendingOkamiExp = 0;
        data.progress.autoRetryCountdownSec = 0;
        if (typeof view !== "undefined" && view.refreshBattleUiNow) {
            view.refreshBattleUiNow();
        }
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
        const cost = settings.manaCost || bonfire.getCloneManaCostFromSnapshot(settings.classKey, settings.modifiers, settings.cloneDensity);
        const divinityCost = settings.divinityCost || 0;
        const density = settings.cloneDensity || 0;
        const mana = data.progress.mana;
        if ((mana.amount || 0) < cost) {
            return false;
        }
        if (divinityCost > 0) {
            const divinity = data.progress.divinity;
            if (((divinity && divinity.amount) || 0) < divinityCost) {
                return false;
            }
            divinity.amount = Math.max(0, (divinity.amount || 0) - divinityCost);
        }
        mana.amount = Math.max(0, (mana.amount || 0) - cost);
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
        data.battle.cloneDensity = density;
        initialize.calcPlayerStats(true);
        data.battle.cloneRunSettings = {
            classKey: classKey,
            modifiers: modifierSnapshot,
            mapKey: settings.mapKey || data.progress.currentMapKey,
            manaCost: cost,
            divinityCost: divinityCost,
            cloneDensity: density
        };
        data.battle.resetCount = nextResetCount;
        data.progress.autoRetryCountdownSec = 0;
        data.progress.showBattle = true;
        data.gameSettings.stopAll = false;
        if (typeof view !== "undefined" && view.refreshBattleUiNow) {
            view.refreshBattleUiNow();
        }
        return true;
    }
};
