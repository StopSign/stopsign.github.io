/**
 * Bonfire class definitions, clone mana cost, heat bonuses, and combat start.
 */

var bonfireConfig = {
    baseCloneManaCost: 1000,
    densityManaPerLevel: 500,
    densityStatBonusPerLevel: 0.1,
    heatDecayPerTick: 0.0005,
    heatPerWood: 10,
    heatPerCoalMult: 5,
    heatBonusThreshold: 50,
    heatBonusThresholdStep: 1.5,
    heatBonusMultStart: 1.2,
    heatBonusMultStep: 1.05
};

var bonfireClassDefs = {
    none: {
        key: "none",
        name: "Classless",
        shortLabel: "Classless",
        image: "img/default.svg",
        description: "No class selected.",
        perLevel: { str: 1, con: 1, spd: 0 }
    },
    condescend: {
        key: "condescend",
        name: "Condescend",
        shortLabel: "Condescend",
        image: "img/condescend.svg",
        description: "Placeholder - look down on intruders with icy superiority. +1 Con per level.",
        perLevel: { str: 0, con: 1, spd: 0 }
    },
    mock: {
        key: "mock",
        name: "Mock",
        shortLabel: "Mock",
        image: "img/mock.svg",
        description: "Placeholder - ridicule foes until they falter. +1 Bru per level.",
        perLevel: { str: 1, con: 0, spd: 0 }
    },
    scold: {
        key: "scold",
        name: "Scold",
        shortLabel: "Scold",
        image: "img/scold.svg",
        description: "Placeholder - berate intruders into hesitation. +1 Spd per level.",
        perLevel: { str: 0, con: 0, spd: 1 }
    },
    shun: {
        key: "shun",
        name: "Shun",
        shortLabel: "Shun",
        image: "img/shun.svg",
        description: "Placeholder - exile threats from your presence. +1 Con per level.",
        perLevel: { str: 0, con: 1, spd: 0 }
    }
};

var bonfireClassOrder = ["none", "condescend", "mock", "scold", "shun"];

var bonfire = {
    grantRunEndManaCapacityBonus: function() {
        const inc = engine.getManaCapacityBonusPerCloneDispersal();
        data.progress.mana.capacityBonus = (data.progress.mana.capacityBonus || 0) + inc;
    },

    getClassKeys: function() {
        return bonfireClassOrder.slice();
    },

    getClassDef: function(classKey) {
        if (classKey === "none") {
            return bonfireClassDefs.none || resortData.bonfireClassDefs.none;
        }
        return bonfireClassDefs[classKey] || null;
    },

    getCloneManaCostFromSnapshot: function(density) {
        const dens = Math.max(0, density || 0);
        const reduction = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
            ? (shrineCards.getAggregatedEffects().cloneBaseCostReduction || 0) : 0;
        const raw = (bonfireConfig.baseCloneManaCost - reduction) + dens * (bonfireConfig.densityManaPerLevel || 500);
        return Math.max(0, Math.round(raw));
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
        let n = 0;
        while (n < orbLevelCap && bonfire.getCloneManaCostFromSnapshot(n + 1) < cap) {
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

    formatCloneCostText: function(manaCost) {
        return `${intToStringRound(manaCost)} mana`;
    },

    /** Upgrade-parity HTML: green when affordable, red when over mana capacity. */
    formatCloneCostHtml: function(manaCost) {
        return resortData.formatCostAmountHtml(manaCost, "mana", "mana");
    },

    getEffectiveClonePlan: function() {
        const density = bonfire.getCloneDensity();
        return {
            classKey: "none",
            manaCost: bonfire.getCloneManaCostFromSnapshot(density),
            blocked: false,
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
        return false;
    },

    getCloneManaCost: function() {
        return bonfire.getCloneManaCostFromSnapshot(bonfire.getCloneDensity());
    },

    canAffordClone: function() {
        if (!engine.isManaUnlocked()) {
            return false;
        }
        const plan = bonfire.getEffectiveClonePlan();
        const mana = data.progress.mana;
        return (mana.amount || 0) >= plan.manaCost;
    },

    canAffordRetryWithStoredSettings: function() {
        if (!engine.isManaUnlocked()) {
            return false;
        }
        const settings = data.battle && data.battle.cloneRunSettings;
        const cost = settings
            ? (settings.manaCost || bonfire.getCloneManaCostFromSnapshot(settings.cloneDensity))
            : bonfire.getCloneManaCost();
        const mana = data.progress.mana;
        return (mana.amount || 0) >= cost;
    },

    isApplyLiveSettingsToNextClone: function() {
        const bf = data.progress.base && data.progress.base.bonfire;
        return !!(bf && bf.applyLiveSettingsToNextClone);
    },

    shouldUseLiveCloneSettings: function() {
        const bf = data.progress.base && data.progress.base.bonfire;
        if (!bf || !bf.denseClonesUnlocked) {
            return true;
        }
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
            classKey: "none",
            manaCost: settings.manaCost || bonfire.getCloneManaCostFromSnapshot(settings.cloneDensity),
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
        if (typeof isProcessingOffline !== "undefined" && isProcessingOffline) {
            return false;
        }
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
        const reqClass = target.requiredClassKey || "";
        if (reqClass && reqClass !== "none") {
            return false;
        }
        const cost = plan.manaCost;
        const mana = data.progress.mana;
        if ((mana.amount || 0) < cost) {
            return false;
        }
        mana.amount = Math.max(0, (mana.amount || 0) - cost);

        data.progress.currentClassKey = "none";
        data.progress.battleUnlocked = true;
        data.progress.showBattle = true;
        data.progress.currentMapKey = targetKey;
        const travelSeed = Math.floor(Math.random() * 0x7fffffff) + 1;
        initialize.resetSkillRunProgress();
        initialize.startFreshBattle(travelSeed, targetKey);
        data.battle.bonfireModifiers = {};
        data.battle.cloneDensity = plan.cloneDensity || 0;
        initialize.calcPlayerStats(true);
        data.battle.cloneRunSettings = {
            classKey: "none",
            mapKey: targetKey,
            manaCost: cost,
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
        const cost = settings.manaCost || bonfire.getCloneManaCostFromSnapshot(settings.cloneDensity);
        const density = settings.cloneDensity || 0;
        const mana = data.progress.mana;
        if ((mana.amount || 0) < cost) {
            return false;
        }
        mana.amount = Math.max(0, (mana.amount || 0) - cost);
        data.progress.currentClassKey = "none";
        const currentSeed = data.battle.generatedFromSeed || data.battle.seed || 1337;
        const nextResetCount = (data.battle.resetCount || 0) + 1;
        initialize.resetSkillRunProgress();
        initialize.startFreshBattle(currentSeed, settings.mapKey || data.progress.currentMapKey);
        data.battle.bonfireModifiers = {};
        data.battle.cloneDensity = density;
        initialize.calcPlayerStats(true);
        data.battle.cloneRunSettings = {
            classKey: "none",
            mapKey: settings.mapKey || data.progress.currentMapKey,
            manaCost: cost,
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
