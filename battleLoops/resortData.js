/**
 * Static copy and layout-shaped config for Base building panels (see viewCreate.generateBasePanelsHtml).
 * DOM ids derive from building segment + upgrade `key`; purchase flow uses events.buyUpgrade + cost / onBuy.
 */

var resortData = {
    workerPowerSiteKeys: [],
    bonfireClasses: ["condescend", "mock", "scold", "shun"],

    /** All map building keys (resort buttons; order does not affect gameplay). */
    baseBuildingOrder: [
        "hiddenSpring", "torii", "stonePile", "bambooForest", "mine",
        "foxDen", "inn", "bar", "laundry",
        "scrollArchives", "cistern", "pond", "garden", "atelier", "bonfire", "market", "mage_tower"
    ],

    /** Class buy costs + per-level growth (saved class lives in `data.progress`). */
    bonfireClassDefs: {
        none: { key: "none", name: "None", perLevel: { str: 1, con: 1, spd: 0 } }
    },

    defaultMapRevealedState: {
        hiddenSpring: false,
        mine: false,
        spiritSlots: false
    },

    kitsuneCarryCapacity: 1,
    manaCarryAmount: 5,

    attributeDisplay: {
        str: { short: "Bru", name: "Brutality" },
        con: { short: "Con", name: "Confidence" },
        spd: { short: "Spd", name: "Speed" },
        soul: { short: "Soul", name: "Soul" }
    },

    formatAttributeShort: function(key) {
        const d = resortData.attributeDisplay[key];
        return d ? d.short : key;
    },

    getKitsuneCarryCapacity: function() {
        const base = resortData.kitsuneCarryCapacity || 1;
        const w = data.progress.base && data.progress.base.atelier;
        const bought = w && w.basketsBought ? w.basketsBought : 0;
        return base + bought;
    },

    getManaCarryAmount: function() {
        const base = resortData.manaCarryAmount !== undefined ? resortData.manaCarryAmount : 5;
        const a = data.progress.base && data.progress.base.atelier;
        const bought = a && a.manaStorageCharmsBought ? a.manaStorageCharmsBought : 0;
        return base + bought * 5;
    },

    foxDenCarrierSpawnMinMs: 1000,
    foxDenCarrierSpeed: 15,

    innGuestItinerary: {
        settleInSeconds: 5,
        stepOrder: ["settleIn", "watchWaterSpirits", "rest"]
    },

    bambooForestConfig: {
        defaultBaseWood: 10,
        cutPowerRequired: 10,
        harvestBaseRate: 1,
        cellGrowFullMs: 120000,
        capacityStepFactor: 0.8,
        stalkCount: 4,
        rowCount: 3,
        plantSpiritMax: 3
    },

    fireLauncherMaxEmbers: 100,
    fireLauncherPlatformDefs: [
        {
            key: "pathMid",
            name: "Long-Range Launcher",
            attackType: "projectile",
            rangePx: 180,
            intervalMs: 2000,
            emberCost: 20,
            heatPerStrike: 5
        },
        {
            key: "bendTop",
            name: "Burst Launcher",
            attackType: "aoe",
            rangePx: 45,
            intervalMs: 1000,
            emberCost: 15,
            heatPerStrike: 5
        },
        {
            key: "pathLower",
            name: "Ember Launcher",
            attackType: "projectile",
            rangePx: 90,
            intervalMs: 200,
            emberCost: 5,
            heatPerStrike: 1
        }
    ],

    /** Copied into saved `data.progress.base.resources` for new games. */
    defaultBaseResources: {
        stone: 0
    },

    /** Sites with a pinned worker dock at the bottom of baseBuildingInfo. */
    workerDockSiteKeys: ["torii", "laundry", "bambooForest", "foxDen", "bonfire", "cistern", "scrollArchives",  "mage_tower"],

    /** Base mana capacity before Expand Orb multipliers and battle bonuses. */
    manaBaseCapacity: 1000,

    costToParts: function(cost) {
        const c = cost || {};
        const parts = [];
        if ((c.coins || 0) > 0) parts.push(`${intToStringRound(c.coins)} coins`);
        if ((c.starBeads || 0) > 0) parts.push(`${intToStringRound(c.starBeads)} Star Beads`);
        if ((c.mana || 0) > 0) parts.push(`${intToStringRound(c.mana)} mana`);
        if ((c.wood || 0) > 0) parts.push(`${intToStringRound(c.wood)} wood`);
        if ((c.stone || 0) > 0) parts.push(`${intToStringRound(c.stone)} stone`);
        if ((c.ore || 0) > 0) parts.push(`${intToStringRound(c.ore)} ore`);
        if ((c.bars || 0) > 0) parts.push(`${intToStringRound(c.bars)} bars`);
        return parts;
    },

    planToBuildFromCost: function(costOrGetter) {
        const c = typeof costOrGetter === "function" ? costOrGetter() : costOrGetter;
        const parts = resortData.costToParts(c);
        return `Plan to build for [${parts.join(", ")}]`;
    },

    getFoxDenConstructionCost: function(unlockKey) {
        const bdef = resortData.buildings[unlockKey];
        return bdef && bdef.constructionCost ? Object.assign({}, bdef.constructionCost) : { wood: 0, stone: 0 };
    },

    getFoxDenUnlockOrder: function() {
        const keys = Object.keys(resortData.buildings || {});
        const pairs = [];
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            const bdef = resortData.buildings[k];
            if (bdef && bdef.foxDenUnlockOrder !== undefined) {
                pairs.push({ key: k, order: bdef.foxDenUnlockOrder });
            }
        }
        pairs.sort(function(a, b) { return a.order - b.order; });
        return pairs.map(function(p) { return p.key; });
    },

    getDefaultFoxDenUnlocksState: function() {
        const state = {};
        const order = resortData.getFoxDenUnlockOrder();
        for (let i = 0; i < order.length; i++) {
            state[order[i]] = false;
        }
        return state;
    },

    getBuildingMapSlot: function(buildingKey) {
        const bdef = resortData.buildings[buildingKey];
        return bdef && bdef.mapSlot ? bdef.mapSlot : null;
    },

    getConstructionPercent: function(site) {
        if (!site || !site.required) {
            return 0;
        }
        let total = 0;
        let done = 0;
        const keys = ["wood", "stone"];
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            const req = site.required[k] || 0;
            total += req;
            done += Math.min(req, (site.delivered && site.delivered[k]) || 0);
        }
        return total > 0 ? Math.round((done / total) * 100) : 0;
    },

    resolveCost: function(def, buildingSegment) {
        if (def.progressCostPurchase && buildingSegment && data.progress.base[buildingSegment]) {
            return resortData.computedProgressGearPurchaseCost(buildingSegment);
        }
        if (typeof def.getCost === "function") {
            return def.getCost();
        }
        if (def.cost !== undefined) {
            return def.cost;
        }
    },

    addCostDelta: function(current, delta) {
        const keys = ["coins", "wood", "stone", "starBeads"];
        const out = {};
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            const a = current && current[k] !== undefined ? current[k] : 0;
            const b = delta && delta[k] !== undefined ? delta[k] : 0;
            if ((current && Object.prototype.hasOwnProperty.call(current, k)) || (delta && Object.prototype.hasOwnProperty.call(delta, k))) {
                out[k] = a + b;
            }
        }
        return Object.keys(out).length ? out : (current || {});
    },

    /** Multiply each cost component by a non-negative integer (gear tier scaling). */
    scaleCostDelta: function(delta, n) {
        const keys = ["coins", "wood", "stone", "starBeads"];
        const nn = Math.max(0, n | 0);
        const out = {};
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            if (delta && Object.prototype.hasOwnProperty.call(delta, k)) {
                out[k] = (delta[k] || 0) * nn;
            }
        }
        return Object.keys(out).length ? out : {};
    },

    /** Next gear/desk purchase price from resortData.limits + saved gearSets only. */
    computedProgressGearPurchaseCost: function(siteKey) {
        const bdef = resortData.buildings[siteKey];
        const lim = bdef && bdef.limits;
        const slot = data.progress.base[siteKey];
        if (!lim || !lim.gearBaseCost || !slot) {
            return {};
        }
        const n = slot.gearSets || 0;
        return resortData.addCostDelta(lim.gearBaseCost, resortData.scaleCostDelta(lim.gearCostIncrease, n));
    },

    /** After purchase of a worker desk / research desk tier (gearSets only is saved). */
    applyProgressCostPurchase: function(siteKey) {
        const b = data.progress.base[siteKey];
        b.gearSets = (b.gearSets || 0) + 1;
    },

    buyForFromCost: function(costOrGetter) {
        const c = typeof costOrGetter === "function" ? costOrGetter() : costOrGetter;
        const parts = resortData.costToParts(c);
        if (!parts.length) {
            return "Start upgrade";
        }
        return `Buy for [${parts.join(", ")}]`;
    },

    splitGatherWeaveCost: function(cost) {
        const c = cost || {};
        return {
            gather: { wood: c.wood || 0, stone: c.stone || 0, bars: c.bars || 0 },
            weave: { coins: c.coins || 0, starBeads: c.starBeads || 0, mana: c.mana || 0 }
        };
    },

    hasWeaveCost: function(weaveCost) {
        const w = weaveCost || {};
        return (w.coins || 0) > 0 || (w.starBeads || 0) > 0 || (w.mana || 0) > 0;
    },

    isCoinOrBeadOnlyCost: function(cost) {
        const split = resortData.splitGatherWeaveCost(cost);
        const g = split.gather;
        return (g.wood || 0) <= 0 && (g.stone || 0) <= 0 && (g.bars || 0) <= 0
            && resortData.hasWeaveCost(split.weave);
    },

    gatherLabelFromCost: function(costOrGetter) {
        const c = typeof costOrGetter === "function" ? costOrGetter() : costOrGetter;
        const parts = resortData.costToParts(c);
        if (!parts.length) {
            return "Start upgrade";
        }
        if (resortData.isCoinOrBeadOnlyCost(c)) {
            return `Buy [${parts.join(", ")}]`;
        }
        return `Gather [${parts.join(", ")}]`;
    },

    collectedProgressLabel: function(delivered, required) {
        const parts = [];
        const stoneDel = (delivered && delivered.stone) || 0;
        const stoneReq = (required && required.stone) || 0;
        const woodDel = (delivered && delivered.wood) || 0;
        const woodReq = (required && required.wood) || 0;
        if (stoneReq > 0) {
            parts.push(`${intToStringRound(stoneDel)}/${intToStringRound(stoneReq)} stone`);
        }
        if (woodReq > 0) {
            parts.push(`${intToStringRound(woodDel)}/${intToStringRound(woodReq)} wood`);
        }
        const barsDel = (delivered && delivered.bars) || 0;
        const barsReq = (required && required.bars) || 0;
        if (barsReq > 0) {
            parts.push(`${intToStringRound(barsDel)}/${intToStringRound(barsReq)} bars`);
        }
        if (parts.length === 0) {
            return "Ready for Weave";
        }
        return `Collected [${parts.join(", ")}]`;
    },

    upgradeUsesWeaving: function(upgradeDef) {
        if (!upgradeDef || upgradeDef.instantPurchase) {
            return false;
        }
        if (upgradeDef.weavingTime !== undefined
            || upgradeDef.weavingTimeIncrease !== undefined
            || upgradeDef.weavingTimeIncreaseAdd !== undefined
            || typeof upgradeDef.getWeavingPurchaseIndex === "function") {
            return true;
        }
        return resortData.getUpgradeMaxPurchases(upgradeDef) !== null;
    },

    getUpgradePurchaseCount: function(upgradeDef) {
        if (!upgradeDef) {
            return 0;
        }
        if (typeof upgradeDef.getPurchaseCount === "function") {
            return upgradeDef.getPurchaseCount();
        }
        if (typeof upgradeDef.getWeavingPurchaseIndex === "function") {
            return upgradeDef.getWeavingPurchaseIndex();
        }
        return 0;
    },

    getUpgradeMaxPurchases: function(upgradeDef) {
        if (!upgradeDef) {
            return null;
        }
        if (typeof upgradeDef.getMaxPurchases === "function") {
            return upgradeDef.getMaxPurchases();
        }
        if (upgradeDef.maxPurchases !== undefined) {
            return upgradeDef.maxPurchases;
        }
        return null;
    },

    getUpgradeMaxPurchaseExtra: function(upgradeDef) {
        const max = resortData.getUpgradeMaxPurchases(upgradeDef);
        if (max === null || max <= 1) {
            return "";
        }
        if (typeof upgradeDef.upgradeSoldOut === "function" && upgradeDef.upgradeSoldOut()) {
            return "";
        }
        const bought = resortData.getUpgradePurchaseCount(upgradeDef);
        return `${bought}/${max} bought`;
    },

    getUpgradeButtonLabel: function(upgradeDef, scopeKey) {
        if (typeof upgradeDef.upgradeSoldOut === "function" && upgradeDef.upgradeSoldOut()) {
            return upgradeDef.soldOutButtonLabel || "Bought";
        }
        const costGetter = typeof upgradeDef.getCost === "function"
            ? upgradeDef.getCost
            : function() {
                return resortData.resolveCost(upgradeDef, scopeKey);
            };
        return resortData.buyForFromCost(costGetter);
    },

    getUpgradeExtraText: function(upgradeDef, scopeKey) {
        const parts = [];
        if (resortData.upgradeUsesWeaving(upgradeDef)) {
            parts.push(resortData.getWeavingThreadsExtra(upgradeDef, scopeKey));
        }
        const maxExtra = resortData.getUpgradeMaxPurchaseExtra(upgradeDef);
        if (maxExtra) {
            parts.push(maxExtra);
        } else if (typeof upgradeDef.extraInfo === "function") {
            const info = upgradeDef.extraInfo();
            if (info) {
                parts.push(info);
            }
        }
        return parts.join(" | ");
    },

    canAffordCost: function(cost) {
        if (typeof debugAtelierUpgradesFree !== "undefined" && debugAtelierUpgradesFree) {
            return true;
        }
        const base = data.progress.base;
        const res = base.resources;
        const c = cost || {};
        if ((c.coins || 0) > data.progress.coins) return false;
        if ((c.starBeads || 0) > (data.progress.starBeads || 0)) return false;
        if ((c.mana || 0) > ((data.progress.mana && data.progress.mana.amount) || 0)) return false;
        if ((c.wood || 0) > ((base.bambooForest && base.bambooForest.wood) || 0)) return false;
        if ((c.stone || 0) > ((base.stonePile && base.stonePile.stone) || 0)) return false;
        if ((c.ore || 0) > ((base.atelier && base.atelier.ore) || 0)) return false;
        if ((c.bars || 0) > ((base.atelier && base.atelier.bars) || 0)) return false;
        return true;
    },

    deductCost: function(cost) {
        if (typeof debugAtelierUpgradesFree !== "undefined" && debugAtelierUpgradesFree) {
            return;
        }
        const base = data.progress.base;
        const res = base.resources;
        const c = cost || {};
        data.progress.coins -= (c.coins || 0);
        data.progress.starBeads = (data.progress.starBeads || 0) - (c.starBeads || 0);
        if ((c.mana || 0) > 0 && data.progress.mana) {
            data.progress.mana.amount = Math.max(0, (data.progress.mana.amount || 0) - (c.mana || 0));
        }
        if ((c.wood || 0) > 0 && base.bambooForest) {
            base.bambooForest.wood = Math.max(0, (base.bambooForest.wood || 0) - (c.wood || 0));
        }
        if ((c.stone || 0) > 0 && base.stonePile) {
            base.stonePile.stone = Math.max(0, (base.stonePile.stone || 0) - (c.stone || 0));
        }
        if ((c.ore || 0) > 0 && base.atelier) {
            base.atelier.ore = Math.max(0, (base.atelier.ore || 0) - (c.ore || 0));
        }
        if ((c.bars || 0) > 0 && base.atelier) {
            base.atelier.bars = Math.max(0, (base.atelier.bars || 0) - (c.bars || 0));
        }
    },

    slug: function(up) {
        return up.key;
    },

    /** ids: base_<building>_<upgradeKey>_row | _extra | _btn */
    idRow: function(buildingSegment, upgradeKeySlug) {
        return `base_${buildingSegment}_${upgradeKeySlug}_row`;
    },

    idExtra: function(buildingSegment, upgradeKeySlug) {
        return `base_${buildingSegment}_${upgradeKeySlug}_extra`;
    },

    idBtn: function(buildingSegment, upgradeKeySlug) {
        return `base_${buildingSegment}_${upgradeKeySlug}_btn`;
    },

    /** Mine gear + workers panel (also drives progress caches). */
    workerSitePanelOrder: [],

    /** Element ids: base_<building>_<suffix>_btn (assign +/++/>>> and unassign -/--/<< for adjustWorkers). Scroll Archives uses the same suffixes. */
    workerAdjustIncrBtnSuffixes: ["assign_one", "assign_ten", "assign_all"],
    workerAdjustDecrBtnSuffixes: ["unassign_one", "unassign_ten", "unassign_all"],

    /** Sites with `assignedWorkers` in saved base state (data-driven worker totals). */
    workerAssignmentSiteKeys: ["torii", "laundry", "bambooForest", "foxDen", "scrollArchives", "bonfire", "cistern", "mage_tower"],

    /** Sites where Okami can be assigned (replaces manual action buttons). */
    okamiAssignableSiteKeys: ["torii", "laundry", "bambooForest", "foxDen", "scrollArchives", "bonfire", "cistern", "mage_tower"],

    defaultWeavingTime: 5,
    defaultWeavingTimeIncrease: 1,

    pathConfig: {
        segmentStep: 38,
        semiCircleSegmentCount: 2,
        okamiTravelSpeed: 70,
        storeRockAmount: 2,
        initialState: "Large Rocks",
        clearedState: "Clear"
    },

    okamiConfig: {
        baseExpToLevel: 20,
        expAdditiveStep: 4,
        expTierMultipliers: [1, 6, 36],
        tailsPerTier: 1,
        baseInspirationBonus: 1.2,
        inspirationBonusPerLevel: 0.02
    },

    buildings: {
        path: {
            upgradesOrder: ["removeRocks", "addRailing", "addStairs", "addLanterns"],
            upgrades: {
                removeRocks: {
                    key: "remove_rocks",
                    name: "Remove Rocks",
                    description: "Clear debris from this path section, retrieving 2 stone.",
                    cost: {},
                    weavingTime: 5,
                    weavingTimeIncrease: 1,
                    canBuy: function() {
                        const idx = data.progress.selectedPathSegmentIndex;
                        if (idx === undefined || idx === null) {
                            return false;
                        }
                        if (!engine.isPathSegmentAccessible(idx)) {
                            return false;
                        }
                        const seg = engine.getPathSegmentData(idx);
                        if (!seg || seg.state !== "Large Rocks") {
                            return false;
                        }
                        const job = engine.getOkamiPathJob();
                        if (job && job.segmentIndex !== idx) {
                            return false;
                        }
                        if (job && job.segmentIndex === idx && !job.paused) {
                            return false;
                        }
                        return true;
                    },
                    upgradeSoldOut: function() {
                        const idx = data.progress.selectedPathSegmentIndex;
                        if (idx === undefined || idx === null) {
                            return true;
                        }
                        const seg = engine.getPathSegmentData(idx);
                        return !seg || seg.state !== "Large Rocks";
                    },
                    soldOutButtonLabel: "Cleared",
                    onBuy: function() {
                        return true;
                    },
                    rowVisible: function() {
                        const idx = data.progress.selectedPathSegmentIndex;
                        if (idx === undefined || idx === null) {
                            return false;
                        }
                        return engine.getNextPathUpgradeKey(idx) === "removeRocks";
                    },
                    extraInfo: function() {
                        const idx = data.progress.selectedPathSegmentIndex;
                        const job = engine.getOkamiPathJob();
                        if (!job || job.segmentIndex !== idx || (job.jobType && job.jobType !== "removeRocks")) {
                            return "";
                        }
                        if (job.paused && (job.pausedPhase === "travelingTo" || job.pausedPhase === "storingRocks")) {
                            return "Paused en route";
                        }
                        if (!job.paused && job.phase === "travelingTo") {
                            return "Traveling to";
                        }
                        if (!job.paused && job.phase === "storingRocks") {
                            return "Storing Rocks";
                        }
                        return "";
                    }
                },
                addRailing: {
                    key: "add_railing",
                    name: "Add Railing",
                    description: "Install a railing so the Okami moves 50% faster along this path section.",
                    getCost: function() {
                        return { wood: 2 };
                    },
                    weavingTime: 5,
                    weavingTimeIncrease: 1,
                    canBuy: function() {
                        const idx = data.progress.selectedPathSegmentIndex;
                        if (idx === undefined || idx === null) {
                            return false;
                        }
                        if (!engine.isPathSegmentAccessible(idx)) {
                            return false;
                        }
                        const seg = engine.getPathSegmentData(idx);
                        if (!seg || seg.state !== "Clear" || seg.hasRailing) {
                            return false;
                        }
                        const job = engine.getOkamiPathJob();
                        if (job && job.segmentIndex === idx && !job.paused) {
                            return false;
                        }
                        return resortData.canAffordCost({ wood: 2 });
                    },
                    upgradeSoldOut: function() {
                        const idx = data.progress.selectedPathSegmentIndex;
                        if (idx === undefined || idx === null) {
                            return true;
                        }
                        const seg = engine.getPathSegmentData(idx);
                        return !seg || seg.state !== "Clear" || !!seg.hasRailing;
                    },
                    soldOutButtonLabel: "Railing added",
                    onBuy: function() {
                        return true;
                    },
                    rowVisible: function() {
                        const idx = data.progress.selectedPathSegmentIndex;
                        if (idx === undefined || idx === null) {
                            return false;
                        }
                        return engine.getNextPathUpgradeKey(idx) === "addRailing";
                    },
                    extraInfo: function() {
                        const idx = data.progress.selectedPathSegmentIndex;
                        const job = engine.getOkamiPathJob();
                        if (!job || job.segmentIndex !== idx || job.jobType !== "addRailing") {
                            return "";
                        }
                        if (job.paused && (job.pausedPhase === "travelingTo" || job.pausedPhase === "returning")) {
                            return "Paused en route";
                        }
                        if (!job.paused && job.phase === "travelingTo") {
                            return "Traveling to section";
                        }
                        if (!job.paused && job.phase === "returning") {
                            return "Returning";
                        }
                        return "";
                    }
                },
                addStairs: {
                    key: "add_stairs",
                    name: "Add Stairs",
                    description: "Build stairs so the Okami moves another 50% faster along this path section (stacks additively with railing).",
                    getCost: function() {
                        return { wood: 5 };
                    },
                    weavingTime: 10,
                    weavingTimeIncrease: 1,
                    canBuy: function() {
                        const idx = data.progress.selectedPathSegmentIndex;
                        if (idx === undefined || idx === null) {
                            return false;
                        }
                        if (!engine.isPathSegmentAccessible(idx)) {
                            return false;
                        }
                        const seg = engine.getPathSegmentData(idx);
                        if (!seg || seg.state !== "Clear" || !seg.hasRailing || seg.hasStairs) {
                            return false;
                        }
                        const job = engine.getOkamiPathJob();
                        if (job && job.segmentIndex === idx && !job.paused) {
                            return false;
                        }
                        return resortData.canAffordCost({ wood: 5 });
                    },
                    upgradeSoldOut: function() {
                        const idx = data.progress.selectedPathSegmentIndex;
                        if (idx === undefined || idx === null) {
                            return true;
                        }
                        const seg = engine.getPathSegmentData(idx);
                        return !seg || seg.state !== "Clear" || !seg.hasRailing || !!seg.hasStairs;
                    },
                    soldOutButtonLabel: "Stairs added",
                    onBuy: function() {
                        return true;
                    },
                    rowVisible: function() {
                        const idx = data.progress.selectedPathSegmentIndex;
                        if (idx === undefined || idx === null) {
                            return false;
                        }
                        return engine.getNextPathUpgradeKey(idx) === "addStairs";
                    },
                    extraInfo: function() {
                        const idx = data.progress.selectedPathSegmentIndex;
                        const job = engine.getOkamiPathJob();
                        if (!job || job.segmentIndex !== idx || job.jobType !== "addStairs") {
                            return "";
                        }
                        if (job.paused && (job.pausedPhase === "travelingTo" || job.pausedPhase === "returning")) {
                            return "Paused en route";
                        }
                        if (!job.paused && job.phase === "travelingTo") {
                            return "Traveling to section";
                        }
                        if (!job.paused && job.phase === "returning") {
                            return "Returning";
                        }
                        return "";
                    }
                },
                addLanterns: {
                    key: "add_lanterns",
                    name: "Add Lanterns",
                    description: "Hang lanterns so all travelers move 20% faster along this path section.",
                    getCost: function() {
                        return { starBeads: 30, wood: 10 };
                    },
                    weavingTime: 10,
                    weavingTimeIncrease: 1,
                    canBuy: function() {
                        const idx = data.progress.selectedPathSegmentIndex;
                        if (idx === undefined || idx === null) {
                            return false;
                        }
                        if (!engine.isPathSegmentAccessible(idx)) {
                            return false;
                        }
                        const seg = engine.getPathSegmentData(idx);
                        if (!seg || seg.state !== "Clear" || !seg.hasStairs || seg.hasLanterns) {
                            return false;
                        }
                        const job = engine.getOkamiPathJob();
                        if (job && job.segmentIndex === idx && !job.paused) {
                            return false;
                        }
                        return resortData.canAffordCost({ starBeads: 30, wood: 10 });
                    },
                    upgradeSoldOut: function() {
                        const idx = data.progress.selectedPathSegmentIndex;
                        if (idx === undefined || idx === null) {
                            return true;
                        }
                        const seg = engine.getPathSegmentData(idx);
                        return !seg || seg.state !== "Clear" || !seg.hasStairs || !!seg.hasLanterns;
                    },
                    soldOutButtonLabel: "Lanterns added",
                    onBuy: function() {
                        return true;
                    },
                    rowVisible: function() {
                        const idx = data.progress.selectedPathSegmentIndex;
                        if (idx === undefined || idx === null) {
                            return false;
                        }
                        return engine.getNextPathUpgradeKey(idx) === "addLanterns";
                    },
                    extraInfo: function() {
                        const idx = data.progress.selectedPathSegmentIndex;
                        const job = engine.getOkamiPathJob();
                        if (!job || job.segmentIndex !== idx || job.jobType !== "addLanterns") {
                            return "";
                        }
                        if (job.paused && (job.pausedPhase === "travelingTo" || job.pausedPhase === "returning")) {
                            return "Paused en route";
                        }
                        if (!job.paused && job.phase === "travelingTo") {
                            return "Traveling to section";
                        }
                        if (!job.paused && job.phase === "returning") {
                            return "Returning";
                        }
                        return "";
                    }
                }
            }
        },

        torii: {
            label: "Zenko Torii Gate",
            description: "Welcome guests to the resort.",
            mapSlot: { left: 334, top: 662 },
            constructionCost: { wood: 2, stone: 2 },
            foxDenUnlockOrder: 0,
            upgradesOrder: ["callForAlly", "growPlantSpirit", "addQueuePosts"],
            upgrades: {
                callForAlly: {
                    key: "call_for_ally",
                    name: "Call for Ally",
                    description: "Weave a call that draws an ally to the gate: +1 Kitsune.",
                    weavingTime: 10,
                    weavingTimeIncreaseAdd: 10,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.torii.callForAllyBought || 0;
                    },
                    getCost: function() {
                        const bought = data.progress.base.torii.callForAllyBought || 0;
                        return { coins: 5 * Math.pow(2, bought) };
                    },
                    rowVisible: function() {
                        const rh = data.progress.base.foxDen;
                        const torii = data.progress.base.torii;
                        return !!(rh && rh.unlocks && rh.unlocks.torii) && (torii.callForAllyBought || 0) < 8;
                    },
                    canBuy: function() {
                        const torii = data.progress.base.torii;
                        const bought = torii.callForAllyBought || 0;
                        return bought < 8 && resortData.canAffordCost({ coins: 5 * Math.pow(2, bought) });
                    },
                    onBuy: function() {
                        data.progress.base.torii.callForAllyBought = (data.progress.base.torii.callForAllyBought || 0) + 1;
                        if (!data.progress.kitsune) {
                            data.progress.kitsune = { total: 2 };
                        }
                        data.progress.kitsune.total = (data.progress.kitsune.total || 0) + 1;
                    },
                    maxPurchases: 8,
                    upgradeSoldOut: function() {
                        return (data.progress.base.torii.callForAllyBought || 0) >= 8;
                    },
                    soldOutButtonLabel: "Max calls"
                },
                growPlantSpirit: {
                    key: "grow_plant_spirit",
                    name: "Nurture Plant Spirit",
                    description: "Nurture a plant spirit to strengthen a bamboo stalk.",
                    weavingTime: 20,
                    weavingTimeIncreaseAdd: 40,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.torii.plantSpiritsBought || 0;
                    },
                    getCost: function() {
                        const bought = data.progress.base.torii.plantSpiritsBought || 0;
                        return { starBeads: 50 * Math.pow(10, bought) };
                    },
                    canBuy: function() {
                        const torii = data.progress.base.torii;
                        const max = resortData.bambooForestConfig.plantSpiritMax || 4;
                        const bought = torii.plantSpiritsBought || 0;
                        return bought < max
                            && resortData.canAffordCost({ starBeads: 50 * Math.pow(10, bought) });
                    },
                    onBuy: function() {
                        engine.assemblePlantSpiritFromPurchase();
                    },
                    rowVisible: function() {
                        const rh = data.progress.base.foxDen;
                        const torii = data.progress.base.torii;
                        const max = resortData.bambooForestConfig.plantSpiritMax || 4;
                        return !!(rh && rh.unlocks && rh.unlocks.inn)
                            && (torii.plantSpiritsBought || 0) < max;
                    },
                    getMaxPurchases: function() {
                        return resortData.bambooForestConfig.plantSpiritMax || 4;
                    },
                    upgradeSoldOut: function() {
                        const torii = data.progress.base.torii;
                        const max = resortData.bambooForestConfig.plantSpiritMax || 4;
                        return (torii.plantSpiritsBought || 0) >= max;
                    },
                    soldOutButtonLabel: "Max spirits"
                },
                addQueuePosts: {
                    key: "add_queue_posts",
                    name: "Add Queue Posts",
                    description: "Add posts so more visitors can wait at the gate.",
                    weavingTime: 60,
                    weavingTimeIncrease: 2,
                    getCost: function() {
                        const bought = (data.progress.base.torii.queuePostsBought || 0);
                        return { wood: 40 * Math.pow(2, bought) };
                    },
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.torii.queuePostsBought || 0;
                    },
                    maxPurchases: 3,
                    rowVisible: function() {
                        const torii = data.progress.base.torii;
                        return engine.isInnOnsenConverted() && (torii.queuePostsBought || 0) < 3;
                    },
                    canBuy: function() {
                        const torii = data.progress.base.torii;
                        const bought = torii.queuePostsBought || 0;
                        return bought < 3 && resortData.canAffordCost({ wood: 40 * Math.pow(2, bought) });
                    },
                    onBuy: function() {
                        const torii = data.progress.base.torii;
                        torii.queuePostsBought = (torii.queuePostsBought || 0) + 1;
                        torii.maxVisitors = (torii.maxVisitors || 2) + 1;
                    },
                    upgradeSoldOut: function() {
                        const torii = data.progress.base.torii;
                        return (torii.queuePostsBought || 0) >= 3;
                    },
                    soldOutButtonLabel: "Max posts"
                }
            }
        },
        bonfire: {
            label: "Bonfire",
            description: "Stare at the fire and contemplate how to protect what's yours.",
            mapSlot: { left: "88%", bottom: 12 },
            constructionCost: { wood: 40, stone: 10, mana: 1000 },
            foxDenUnlockOrder: 5,
            progressDefaults: {
                heat: 0,
                woodCarriers: [],
                carrierIdCounter: 1,
                assignedWorkers: 0,
                gearSets: 1,
                selectedClassKey: null,
                selectedModifierKey: null,
                appliedClassKey: null,
                appliedModifiers: {},
                autoRetryEnabled: false,
                growthBlessingUnlocked: false,
                plannedGrowthBlessingUnlocked: false,
                fireTendingEnabled: true,
                fireTendingHeatCap: 52,
                stokeFireSpiritBought: 0
            },
            upgradesOrder: ["autoRetry", "growthBlessing", "plannedGrowthBlessing", "stokeFireSpirit"],
            upgrades: {
                autoRetry: {
                    key: "retry",
                    name: "Automatic Retry",
                    description: "Automatically try again after death if you can afford the clone mana cost.",
                    cost: { starBeads: 600, coins: 50 },
                    weavingTime: 60,
                    canBuy: function() {
                        return !data.progress.base.bonfire.autoRetryEnabled;
                    },
                    onBuy: function() {
                        const b = data.progress.base.bonfire;
                        b.autoRetryEnabled = true;
                        if (data.battle && data.battle.state === "dead") {
                            data.progress.autoRetryCountdownSec = 10;
                        }
                    },
                    extraInfo: function() {
                        return "";
                    },
                    rowVisible: function() {
                        return !data.progress.base.bonfire.autoRetryEnabled;
                    },
                    upgradeSoldOut: function() {
                        return !!data.progress.base.bonfire.autoRetryEnabled;
                    },
                    soldOutButtonLabel: "Enabled"
                },
                growthBlessing: {
                    key: "growth",
                    name: "Blessing of Growth",
                    description: "Clones gain exp and levels, which give stats. 1% of clone's exp transfers to Okami on death.",
                    cost: { starBeads: 1000, coins: 100 },
                    weavingTime: 60,
                    canBuy: function() {
                        return !data.progress.base.bonfire.growthBlessingUnlocked;
                    },
                    onBuy: function() {
                        data.progress.base.bonfire.growthBlessingUnlocked = true;
                    },
                    extraInfo: function() {
                        return "";
                    },
                    rowVisible: function() {
                        return !data.progress.base.bonfire.growthBlessingUnlocked;
                    },
                    upgradeSoldOut: function() {
                        return !!data.progress.base.bonfire.growthBlessingUnlocked;
                    },
                    soldOutButtonLabel: "Blessed"
                },
                plannedGrowthBlessing: {
                    key: "planned",
                    name: "Blessing of Planned Growth",
                    description: "Gain attribute points to spend when the clone levels, and create a plan to automate the assigning.",
                    cost: { starBeads: 3000, coins: 500 },
                    weavingTime: 200,
                    canBuy: function() {
                        return !data.progress.base.bonfire.plannedGrowthBlessingUnlocked;
                    },
                    onBuy: function() {
                        data.progress.base.bonfire.plannedGrowthBlessingUnlocked = true;
                    },
                    extraInfo: function() {
                        return "";
                    },
                    rowVisible: function() {
                        return !data.progress.base.bonfire.plannedGrowthBlessingUnlocked;
                    },
                    upgradeSoldOut: function() {
                        return !!data.progress.base.bonfire.plannedGrowthBlessingUnlocked;
                    },
                    soldOutButtonLabel: "Blessed"
                },
                stokeFireSpirit: {
                    key: "stoke_fire_spirit",
                    name: "Stoke Fire Spirit",
                    description: "Adds a fire spirit at the Bonfire (or Atelier forge if the Bonfire is full).",
                    getCost: function() {
                        const n = data.progress.base.bonfire.stokeFireSpiritBought || 0;
                        const mult = Math.pow(2, n);
                        return { bars: 10 * mult, starBeads: 2000 * mult };
                    },
                    weavingTime: 180,
                    weavingTimeIncrease: 2,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.bonfire.stokeFireSpiritBought || 0;
                    },
                    canBuy: function() {
                        const bf = data.progress.base.bonfire;
                        const n = bf && bf.stokeFireSpiritBought ? bf.stokeFireSpiritBought : 0;
                        if (!engine.isAtelierForgeBuilt() || n >= 3) {
                            return false;
                        }
                        const mult = Math.pow(2, n);
                        return resortData.canAffordCost({ bars: 10 * mult, starBeads: 2000 * mult });
                    },
                    onBuy: function() {
                        const bf = data.progress.base.bonfire;
                        bf.stokeFireSpiritBought = (bf.stokeFireSpiritBought || 0) + 1;
                        engine.createStokeFireSpirit();
                    },
                    maxPurchases: 3,
                    upgradeSoldOut: function() {
                        return (data.progress.base.bonfire.stokeFireSpiritBought || 0) >= 3;
                    },
                    soldOutButtonLabel: "Max stoked",
                    rowVisible: function() {
                        const bf = data.progress.base.bonfire;
                        return engine.isAtelierForgeBuilt() && (bf.stokeFireSpiritBought || 0) < 3;
                    }
                }
            }
        },

        foxDen: {
            label: "Fox Den",
            description: "Plan and build resort structures with gathered wood and stone.",
            progressDefaults: {
                assignedWorkers: 0,
                gearSets: 1
            }
        },

        bambooForest: {
            label: "Bamboo Forest",
            description: "Cut bamboo for construction wood.",
            progressDefaults: {
                assignedWorkers: 0,
                gearSets: 1,
                workerPower: 0,
                wood: 0,
                chips: 0,
                rowCount: 3,
                stalkCount: 4,
                activeHarvestStalk: null,
                autoRotateHarvest: false,
                stalks: null,
                water: 0
            }
        },

        cistern: {
            label: "Cistern",
            description: "Collect water from droplets.",
            mapSlot: { left: "80%", bottom: 290 },
            constructionCost: { wood: 0, stone: 40 },
            foxDenUnlockOrder: 7,
            progressDefaults: {
                capacityBought: 0,
                replaceWithHotterWater: false,
                assignedWorkers: 0,
                gearSets: 1,
                waterCarriers: [],
                carrierIdCounter: 1
            },
            upgradesOrder: ["increaseCapacity"],
            upgrades: {
                increaseCapacity: {
                    key: "increase_capacity",
                    name: "Increase Capacity",
                    description: "Increases cistern maximum capacity (scaling per upgrade).",
                    getCost: function() {
                        const bought = (data.progress.base.cistern.capacityBought || 0);
                        return { stone: 20 + bought * 20 };
                    },
                    weavingTime: 10,
                    weavingTimeIncrease: 10,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.cistern.capacityBought || 0;
                    },
                    canBuy: function() {
                        return (data.progress.base.cistern.capacityBought || 0) < 99;
                    },
                    onBuy: function() {
                        data.progress.base.cistern.capacityBought = (data.progress.base.cistern.capacityBought || 0) + 1;
                    },
                    maxPurchases: 99,
                    upgradeSoldOut: function() {
                        return (data.progress.base.cistern.capacityBought || 0) >= 99;
                    },
                    soldOutButtonLabel: "Max capacity",
                    rowVisible: function() {
                        return (data.progress.base.cistern.capacityBought || 0) < 99;
                    },
                    extraInfo: function() {
                        const bought = data.progress.base.cistern.capacityBought || 0;
                        const nextN = bought + 1;
                        const addL = 10 * (nextN * nextN - 1) / 2;
                        const nextMax = engine.getCisternMaxCapacity() + addL;
                        return `Next: +${intToStringRound(addL)}L → ${round2(nextMax)}L max`;
                    }
                }
            }
        },

        pond: {
            label: "Pond",
            description: "Overflow basin for extra water; water spirits can play here.",
            mapSlot: { left: "66%", bottom: 270 },
            constructionCost: { wood: 100, stone: 50 },
            foxDenUnlockOrder: 8,
            progressDefaults: {
                pipesToForestUnlocked: false,
                sendWaterToBambooForest: false,
                wishingWellBought: 0
            },
            upgradesOrder: ["pipesToForest", "buildWishingWell"],
            upgrades: {
                pipesToForest: {
                    key: "pipes_to_forest",
                    name: "Pipes to the Forest",
                    description: "Send water from the pond to the Bamboo Forest (1% per second when enabled).",
                    cost: { wood: 30 },
                    weavingTime: 120,
                    canBuy: function() {
                        const p = data.progress.base.pond;
                        return !(p && p.pipesToForestUnlocked);
                    },
                    onBuy: function() {
                        const p = data.progress.base.pond;
                        p.pipesToForestUnlocked = true;
                        p.sendWaterToBambooForest = true;
                    },
                    rowVisible: function() {
                        const p = data.progress.base.pond;
                        return !(p && p.pipesToForestUnlocked);
                    },
                    upgradeSoldOut: function() {
                        const p = data.progress.base.pond;
                        return !!(p && p.pipesToForestUnlocked);
                    },
                    soldOutButtonLabel: "Piped"
                },
                buildWishingWell: {
                    key: "build_wishing_well",
                    name: "Build Wishing Well",
                    description: "Summon a water spirit at the pond (or Hidden Spring if the pond is full).",
                    getCost: function() {
                        const bought = (data.progress.base.pond.wishingWellBought || 0);
                        return {
                            coins: 200 * Math.pow(10, bought),
                            stone: 50 * Math.pow(10, bought)
                        };
                    },
                    weavingTime: 200,
                    weavingTimeIncrease: 5,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.pond.wishingWellBought || 0;
                    },
                    canBuy: function() {
                        const pond = data.progress.base.pond;
                        return engine.isPondBuiltFromFoxDen()
                            && (pond.wishingWellBought || 0) < 2
                            && !!engine.findWaterSpiritPlacementSlot();
                    },
                    onBuy: function() {
                        const pond = data.progress.base.pond;
                        pond.wishingWellBought = (pond.wishingWellBought || 0) + 1;
                        engine.assembleWaterSpiritFromWishingWell();
                    },
                    getMaxPurchases: function() {
                        return 2;
                    },
                    upgradeSoldOut: function() {
                        return (data.progress.base.pond.wishingWellBought || 0) >= 2;
                    },
                    soldOutButtonLabel: "Well built",
                    rowVisible: function() {
                        const pond = data.progress.base.pond;
                        return engine.isPondBuiltFromFoxDen()
                            && (pond.wishingWellBought || 0) < 2
                            && !!engine.findWaterSpiritPlacementSlot();
                    }
                }
            }
        },

        hiddenSpring: {
            label: "Hidden Spring",
            description: "A quiet spring above the resort where spirits gather.",
            upgradesOrder: ["assembleEarthSpirit", "expandPebbleCapacity", "gatherWaterSpirit", "carryingCapacity", "bringOreToAtelier", "sparkFireSpirit"],
            upgrades: {
                assembleEarthSpirit: {
                    key: "earthSpirit",
                    name: "Assemble Earth Spirit",
                    description: "Summon an earth spirit for the Mine (or Hidden Spring if the Mine is full) and reveal the Mine.",
                    weavingTime: 60,
                    weavingTimeIncrease: 2,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.hiddenSpring.earthSpiritsBought || 0;
                    },
                    getCost: function() {
                        const bought = data.progress.base.hiddenSpring.earthSpiritsBought || 0;
                        return { starBeads: 100 * Math.pow(10, bought) };
                    },
                    canBuy: function() {
                        const hs = data.progress.base.hiddenSpring;
                        return !!(hs && (hs.earthSpiritsBought || 0) < engine.getHiddenSpringSpiritSlotMax());
                    },
                    onBuy: function() {
                        engine.assembleSpiritFromPurchase("earth");
                    },
                    getMaxPurchases: function() {
                        return engine.getHiddenSpringSpiritSlotMax();
                    },
                    rowVisible: function() {
                        const hs = data.progress.base.hiddenSpring;
                        return (hs.earthSpiritsBought || 0) < engine.getHiddenSpringSpiritSlotMax();
                    },
                    upgradeSoldOut: function() {
                        const hs = data.progress.base.hiddenSpring;
                        return (hs.earthSpiritsBought || 0) >= engine.getHiddenSpringSpiritSlotMax();
                    },
                    soldOutButtonLabel: "Max assembled"
                },
                expandPebbleCapacity: {
                    key: "pebble_capacity",
                    name: "Earth Minion Training",
                    description: "Earth spirits can carry one more pebble at a time.",
                    getCost: function() {
                        const bought = data.progress.base.hiddenSpring.pebbleCapacityBought || 0;
                        return { starBeads: 800 * Math.pow(10, bought) };
                    },
                    weavingTime: 60,
                    weavingTimeIncrease: 2,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.hiddenSpring.pebbleCapacityBought || 0;
                    },
                    canBuy: function() {
                        const hs = data.progress.base.hiddenSpring;
                        return (hs.earthSpiritsBought || 0) > 0
                            && (hs.pebbleCapacityBought || 0) < 2;
                    },
                    onBuy: function() {
                        data.progress.base.hiddenSpring.pebbleCapacityBought =
                            (data.progress.base.hiddenSpring.pebbleCapacityBought || 0) + 1;
                    },
                    getMaxPurchases: function() {
                        return 2;
                    },
                    upgradeSoldOut: function() {
                        return (data.progress.base.hiddenSpring.pebbleCapacityBought || 0) >= 2;
                    },
                    soldOutButtonLabel: "Max capacity",
                    extraInfo: function() {
                        const max = engine.getEarthSpiritPebbleMax();
                        return `Pebble capacity: ${max}`;
                    },
                    rowVisible: function() {
                        const hs = data.progress.base.hiddenSpring;
                        return (hs.earthSpiritsBought || 0) > 0
                            && (hs.pebbleCapacityBought || 0) < 2;
                    }
                },
                gatherWaterSpirit: {
                    key: "waterSpirit",
                    name: "Gather Water Spirit",
                    description: "Summon a water spirit for the Hidden Spring.",
                    weavingTime: 90,
                    weavingTimeIncrease: 2,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.hiddenSpring.waterSpiritsBought || 0;
                    },
                    getCost: function() {
                        const bought = data.progress.base.hiddenSpring.waterSpiritsBought || 0;
                        return { starBeads: 200 * Math.pow(10, bought) };
                    },
                    canBuy: function() {
                        if (!engine.isCisternBuiltFromFoxDen()) {
                            return false;
                        }
                        const hs = data.progress.base.hiddenSpring;
                        return !!(hs && (hs.waterSpiritsBought || 0) < engine.getHiddenSpringSpiritSlotMax());
                    },
                    onBuy: function() {
                        engine.assembleSpiritFromPurchase("water");
                    },
                    getMaxPurchases: function() {
                        return engine.getHiddenSpringSpiritSlotMax();
                    },
                    rowVisible: function() {
                        if (!engine.isCisternBuiltFromFoxDen()) {
                            return false;
                        }
                        const hs = data.progress.base.hiddenSpring;
                        return (hs.waterSpiritsBought || 0) < engine.getHiddenSpringSpiritSlotMax();
                    },
                    upgradeSoldOut: function() {
                        const hs = data.progress.base.hiddenSpring;
                        return (hs.waterSpiritsBought || 0) >= engine.getHiddenSpringSpiritSlotMax();
                    },
                    soldOutButtonLabel: "Max gathered"
                },
                carryingCapacity: {
                    key: "carrying_capacity",
                    name: "Carrying capacity",
                    description: "Water spirits carry more water per droplet (×2 per upgrade).",
                    getCost: function() {
                        const bought = data.progress.base.hiddenSpring.carryingCapacityBought || 0;
                        return { starBeads: 1200 * Math.pow(2, bought) };
                    },
                    weavingTime: 60,
                    weavingTimeIncrease: 2,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.hiddenSpring.carryingCapacityBought || 0;
                    },
                    canBuy: function() {
                        const hs = data.progress.base.hiddenSpring;
                        if (!hs || (hs.waterSpiritsBought || 0) < 1
                            || (hs.carryingCapacityBought || 0) >= 4) {
                            return false;
                        }
                        const bought = hs.carryingCapacityBought || 0;
                        return resortData.canAffordCost({ starBeads: 600 * Math.pow(2, bought) });
                    },
                    onBuy: function() {
                        data.progress.base.hiddenSpring.carryingCapacityBought =
                            (data.progress.base.hiddenSpring.carryingCapacityBought || 0) + 1;
                    },
                    getMaxPurchases: function() {
                        return 4;
                    },
                    upgradeSoldOut: function() {
                        return (data.progress.base.hiddenSpring.carryingCapacityBought || 0) >= 4;
                    },
                    soldOutButtonLabel: "Max capacity",
                    extraInfo: function() {
                        const mult = engine.getWaterDropletCapacityMultiplier();
                        return `Droplet capacity: ×${mult}`;
                    },
                    rowVisible: function() {
                        const hs = data.progress.base.hiddenSpring;
                        return (hs.waterSpiritsBought || 0) > 0
                            && (hs.carryingCapacityBought || 0) < 4;
                    }
                },
                bringOreToAtelier: {
                    key: "bring_ore_to_atelier",
                    name: "Bring Ore to Atelier",
                    description: "Earth spirits carry ore as well as stone from the mine to the resort.",
                    cost: { starBeads: 1500 },
                    weavingTime: 120,
                    weavingTimeIncrease: 0,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.hiddenSpring.bringOreToAtelierUnlocked ? 1 : 0;
                    },
                    canBuy: function() {
                        const hs = data.progress.base.hiddenSpring;
                        return !!(hs && hs.oreMined && !hs.bringOreToAtelierUnlocked
                            && resortData.canAffordCost({ starBeads: 1500 }));
                    },
                    onBuy: function() {
                        data.progress.base.hiddenSpring.bringOreToAtelierUnlocked = true;
                    },
                    rowVisible: function() {
                        const hs = data.progress.base.hiddenSpring;
                        return !!(hs && hs.oreMined && !hs.bringOreToAtelierUnlocked);
                    },
                    upgradeSoldOut: function() {
                        return !!data.progress.base.hiddenSpring.bringOreToAtelierUnlocked;
                    },
                    soldOutButtonLabel: "Arranged"
                },
                sparkFireSpirit: {
                    key: "fireSpirit",
                    name: "Spark Fire Spirit",
                    description: "Summon a fire spirit for the Hidden Spring.",
                    weavingTime: 5,
                    weavingTimeIncrease: 1,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.hiddenSpring.fireSpiritsBought || 0;
                    },
                    getCost: function() {
                        const bought = data.progress.base.hiddenSpring.fireSpiritsBought || 0;
                        return { starBeads: 2000 * Math.pow(10, bought) };
                    },
                    canBuy: function() {
                        const hs = data.progress.base.hiddenSpring;
                        return !!(hs && hs.bringOreToAtelierUnlocked
                            && (hs.fireSpiritsBought || 0) < engine.getHiddenSpringSpiritSlotMax());
                    },
                    onBuy: function() {
                        engine.assembleSpiritFromPurchase("fire");
                    },
                    getMaxPurchases: function() {
                        return engine.getHiddenSpringSpiritSlotMax();
                    },
                    rowVisible: function() {
                        const hs = data.progress.base.hiddenSpring;
                        return !!(hs && hs.bringOreToAtelierUnlocked
                            && (hs.fireSpiritsBought || 0) < engine.getHiddenSpringSpiritSlotMax());
                    },
                    upgradeSoldOut: function() {
                        const hs = data.progress.base.hiddenSpring;
                        return (hs.fireSpiritsBought || 0) >= engine.getHiddenSpringSpiritSlotMax();
                    },
                    soldOutButtonLabel: "Max sparked"
                }
            }
        },

        mine: {
            label: "Mine",
            limits: {
                gearBaseCost: { coins: 20, bars: 0 },
                gearCostIncrease: { coins: 10, bars: 2 }
            },
            progressDefaults: {
                assignedWorkers: 0,
                gearSets: 0,
                progress: 0,
                workerPower: 0,
                manualCooldownMs: 0
            },
            workers: {
                gearKey: "gear",
                gearName: "Mining gear",
                gearDescription: "Assign workers for passive ore",
                panelProgressFillId: "baseMineProgressFill",
                panelProgressWrapId: "baseMineProgressWrap",
                panelStatusRowHtml: function(res) {
                    return `Iron Ore: ${intToStringRound(res.ironOre)}`;
                },
                manualOnclick: "events.manualMine()",
                manualLabel: "Press to strike vein (+5s × assigned workers)",
                manualBtnId: "base_mine_manual_btn",
                manualCdWrapId: "base_mine_cd_wrap",
                manualCdFillId: "base_mine_cd_fill",
                manualCdTextId: "base_mine_cd_text"
            },
            upgradesOrder: ["gear"],
            upgrades: {
                gear: {
                    key: "gear",
                    progressCostPurchase: true,
                    canBuy: function() {
                        return true;
                    }
                }
            }
        },

        inn: {
            label: "Tatami Inn",
            description: "Lodging for guests who pass through the torii gate.",
            mapSlot: { left: 140, top: 490 },
            constructionCost: { wood: 4, stone: 6 },
            foxDenUnlockOrder: 1,
            progressDefaults: {
                guests: [],
                guestLog: [],
                guestIdCounter: 1,
                furnitureBought: 0,
                decorationBought: 0,
                addRoomBought: 0,
                reinforceJointsBought: 0,
                restfulnessPerSecond: 1,
                pondPathBuilt: false,
                guestsVisitPond: false,
                onsenConverted: false,
                hotWater: 0,
                hotWaterCapacity: 20,
                waterCarriers: [],
                carrierIdCounter: 1,
                assignedWorkers: 0,
                gearSets: 1,
                mana: 0,
                manaCapacity: 100,
                gentleLightsUnlocked: false
            },
            upgradesOrder: ["addFurniture", "addDecoration", "addRoom", "buildPathToPond", "reinforceJoints", "convertToOnsen", "createGentleLights", "fillMana"],
            upgrades: {
                addFurniture: {
                    key: "add_furniture",
                    name: "Add Furniture",
                    description: "Comfortable furnishings let guests rest longer (+5s per upgrade).",
                    getCost: function() {
                        const bought = (data.progress.base.inn.furnitureBought || 0);
                        return { wood: 3 + bought * 3 };
                    },
                    weavingTime: 10,
                    weavingTimeIncreaseAdd: 10,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.inn.furnitureBought || 0;
                    },
                    canBuy: function() {
                        return (data.progress.base.inn.furnitureBought || 0) < engine.getInnFurnitureMaxPurchases();
                    },
                    onBuy: function() {
                        data.progress.base.inn.furnitureBought = (data.progress.base.inn.furnitureBought || 0) + 1;
                    },
                    maxPurchases: 7,
                    upgradeSoldOut: function() {
                        return (data.progress.base.inn.furnitureBought || 0) >= engine.getInnFurnitureMaxPurchases();
                    },
                    soldOutButtonLabel: "Max furniture",
                    rowVisible: function() {
                        return (data.progress.base.inn.furnitureBought || 0) < engine.getInnFurnitureMaxPurchases();
                    }
                },
                addDecoration: {
                    key: "add_decoration",
                    name: "Add Decoration",
                    description: "Beautiful decor helps guests gain restfulness faster (+0.5/s per upgrade).",
                    getCost: function() {
                        const bought = data.progress.base.inn.decorationBought
                        return { stone: 6 + bought * 6, coins: bought * 20 };
                    },
                    weavingTime: 20,
                    weavingTimeIncrease: 2,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.inn.decorationBought;
                    },
                    canBuy: function() {
                        return data.progress.base.inn.decorationBought < 4;
                    },
                    onBuy: function() {
                        data.progress.base.inn.decorationBought++;
                    },
                    maxPurchases: 4,
                    upgradeSoldOut: function() {
                        return data.progress.base.inn.decorationBought >= 4;
                    },
                    soldOutButtonLabel: "Max decoration",
                    rowVisible: function() {
                        return data.progress.base.inn.decorationBought < 4;
                    }
                },
                addRoom: {
                    key: "add_room",
                    name: "Add Room",
                    description: "Add another tatami room for Zenko guests.",
                    getCost: function() {
                        const bought = (data.progress.base.inn.addRoomBought || 0);
                        return { wood: 30 + bought * 30 };
                    },
                    weavingTime: 60,
                    weavingTimeIncrease: 60,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.inn.addRoomBought || 0;
                    },
                    canBuy: function() {
                        return (data.progress.base.inn.addRoomBought || 0) < engine.getInnAddRoomMaxPurchases();
                    },
                    onBuy: function() {
                        data.progress.base.inn.addRoomBought = (data.progress.base.inn.addRoomBought || 0) + 1;
                        engine.syncInnRoomCounts();
                    },
                    maxPurchases: 6,
                    upgradeSoldOut: function() {
                        return (data.progress.base.inn.addRoomBought || 0) >= engine.getInnAddRoomMaxPurchases();
                    },
                    soldOutButtonLabel: "Max rooms",
                    rowVisible: function() {
                        return engine.isInnOnsenConverted()
                            && (data.progress.base.inn.addRoomBought || 0) < engine.getInnAddRoomMaxPurchases();
                    }
                },
                buildPathToPond: {
                    key: "build_path_to_pond",
                    name: "Build path to pond",
                    description: "Guests can visit the pond to watch water spirits play (when enabled).",
                    cost: { stone: 10 },
                    weavingTime: 30,
                    canBuy: function() {
                        const inn = data.progress.base.inn;
                        return engine.isPondBuiltFromFoxDen() && !(inn && inn.pondPathBuilt);
                    },
                    onBuy: function() {
                        const inn = data.progress.base.inn;
                        inn.pondPathBuilt = true;
                        inn.guestsVisitPond = true;
                    },
                    rowVisible: function() {
                        const inn = data.progress.base.inn;
                        return engine.isPondBuiltFromFoxDen() && !(inn && inn.pondPathBuilt);
                    },
                    upgradeSoldOut: function() {
                        const inn = data.progress.base.inn;
                        return !!(inn && inn.pondPathBuilt);
                    },
                    soldOutButtonLabel: "Path built"
                },
                reinforceJoints: {
                    key: "reinforce_joints",
                    name: "Reinforce Joints",
                    description: "Strengthen the inn frame. Each purchase raises Add Room and Add Furniture maximums by +1.",
                    getCost: function() {
                        const n = data.progress.base.inn.reinforceJointsBought || 0;
                        const mult = Math.pow(2, n);
                        return { bars: 10 * mult, coins: 50 * mult };
                    },
                    weavingTime: 120,
                    weavingTimeIncrease: 2,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.inn.reinforceJointsBought || 0;
                    },
                    canBuy: function() {
                        const n = data.progress.base.inn.reinforceJointsBought || 0;
                        if (n >= 3) {
                            return false;
                        }
                        const mult = Math.pow(2, n);
                        return resortData.canAffordCost({ bars: 10 * mult, coins: 50 * mult });
                    },
                    onBuy: function() {
                        data.progress.base.inn.reinforceJointsBought = (data.progress.base.inn.reinforceJointsBought || 0) + 1;
                    },
                    maxPurchases: 3,
                    upgradeSoldOut: function() {
                        return (data.progress.base.inn.reinforceJointsBought || 0) >= 3;
                    },
                    soldOutButtonLabel: "Max reinforced",
                    rowVisible: function() {
                        if (!engine.isAtelierForgeBuilt()) {
                            return false;
                        }
                        return (data.progress.base.inn.reinforceJointsBought || 0) < 3;
                    }
                },
                convertToOnsen: {
                    key: "convert_to_onsen",
                    name: "Convert to Onsen",
                    description: "Convert the Tatami Inn into a Tatami Onsen with hot spring soaking. Assign water carriers at the Cistern to deliver hot water.",
                    cost: { bars: 20, stone: 100 },
                    weavingTime: 600,
                    canBuy: function() {
                        const inn = data.progress.base.inn;
                        return !!(inn && (inn.reinforceJointsBought || 0) >= 1 && !inn.onsenConverted
                            && resortData.canAffordCost({ bars: 20, stone: 100 }));
                    },
                    onBuy: function() {
                        const inn = data.progress.base.inn;
                        inn.onsenConverted = true;
                    },
                    rowVisible: function() {
                        const inn = data.progress.base.inn;
                        return !!(inn && (inn.reinforceJointsBought || 0) >= 1 && !inn.onsenConverted);
                    },
                    upgradeSoldOut: function() {
                        const inn = data.progress.base.inn;
                        return !!(inn && inn.onsenConverted);
                    },
                    soldOutButtonLabel: "Converted"
                },
                createGentleLights: {
                    key: "create_gentle_lights",
                    name: "Create Gentle Lights",
                    description: "Light the inn with soft mana lamps. Uses 1 mana/s per occupied room and grants +2 restfulness/s while mana is available.",
                    cost: { wood: 10, mana: 500 },
                    weavingTime: 30,
                    canBuy: function() {
                        const inn = data.progress.base.inn;
                        const rh = data.progress.base.foxDen;
                        return !!(inn && !inn.gentleLightsUnlocked && rh && rh.unlocks && rh.unlocks.mage_tower
                            && resortData.canAffordCost({ wood: 10, mana: 500 }));
                    },
                    onBuy: function() {
                        data.progress.base.inn.gentleLightsUnlocked = true;
                    },
                    rowVisible: function() {
                        const inn = data.progress.base.inn;
                        const rh = data.progress.base.foxDen;
                        return !!(rh && rh.unlocks && rh.unlocks.mage_tower && inn && !inn.gentleLightsUnlocked);
                    },
                    upgradeSoldOut: function() {
                        return !!(data.progress.base.inn && data.progress.base.inn.gentleLightsUnlocked);
                    },
                    soldOutButtonLabel: "Built"
                },
                fillMana: {
                    key: "fill_mana",
                    name: "Fill Mana",
                    description: "Okami channels global mana into the inn reservoir.",
                    directWeave: true,
                    cost: {},
                    canBuy: function() {
                        return engine.canStartInnFillMana();
                    },
                    onBuy: function() {
                        engine.completeInnFillMana();
                    },
                    rowVisible: function() {
                        return false;
                    }
                }
            }
        },


        scrollArchives: {
            label: "Scroll Archives",
            description: "Research combat skills with assigned kitsune.",
            mapSlot: { left: "61%", bottom: 270 },
            constructionCost: { wood: 40, stone: 0, coins: 50 },
            foxDenUnlockOrder: 6,
            progressDefaults: {
                unlockedSkills: {},
                assignedWorkers: 0,
                researchPerWorkerPerSecond: 1,
                researchTaskRequired: 10,
                researchTaskProgress: 0,
                researchPaused: false,
                researchesToChoose: 0,
                finishWeaveCostQueue: [],
                researchChoices: [],
                selectedResearchChoice: "",
                collectShardsLevel: 0
            },
            upgradesOrder: ["finishResearch", "collectShards"],
            upgrades: {
                finishResearch: {
                    key: "finish_research",
                    name: "Finish Research",
                    description: "Weave the selected scroll into your skills.",
                    directWeave: true,
                    cost: {},
                    canBuy: function() {
                        const lib = data.progress.base.scrollArchives;
                        return (lib.researchesToChoose || 0) > 0 && !!lib.selectedResearchChoice;
                    },
                    onBuy: function() {
                        engine.completeScrollArchivesResearchChoice();
                    },
                    rowVisible: function() {
                        return (data.progress.base.scrollArchives.researchesToChoose || 0) > 0;
                    }
                },
                collectShards: {
                    key: "collect_shards",
                    name: "Collect Shards",
                    description: "Reveal shard loot info on travel maps. Each level doubles shard drop chance. Shards give default exp to created clones for their skill.",
                    getCost: function() {
                        const n = data.progress.base.scrollArchives.collectShardsLevel || 0;
                        const mult = Math.pow(2, n);
                        return { coins: 300 * mult, starBeads: 600 * mult };
                    },
                    weavingTime: 120,
                    weavingTimeIncreaseAdd: 120,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.scrollArchives.collectShardsLevel || 0;
                    },
                    canBuy: function() {
                        return !!(data.progress && data.progress.showBattle);
                    },
                    onBuy: function() {
                        data.progress.base.scrollArchives.collectShardsLevel = (data.progress.base.scrollArchives.collectShardsLevel || 0) + 1;
                    },
                    extraInfo: function() {
                        const lv = data.progress.base.scrollArchives.collectShardsLevel || 0;
                        if (lv <= 0) {
                            return "Unlocks shard summary on maps";
                        }
                        return `Shard loot chance: x${Math.pow(2, lv - 1)}`;
                    },
                    rowVisible: function() {
                        return !!(data.progress && data.progress.showBattle);
                    }
                }
            }
        },

        atelier: {
            label: "Atelier",
            description: "Upgrades for the different buildings.",
            mapSlot: { left: "74%", bottom: 192 },
            constructionCost: { wood: 10, stone: 0 },
            foxDenUnlockOrder: 3,
            progressDefaults: {
                sandalBuilt: false,
                basketsBought: 0,
                improvePathsBought: 0,
                organizeOrdersBought: 0,
                manaStorageCharmsBought: 0,
                betterAxesBought: 0,
                magicLoomsBought: 0,
                sprinkleOreBought: 0,
                forgeBuilt: false,
                fireLaunchersBought: 0,
                ore: 0,
                bars: 0
            },
            upgradesOrder: ["organizeOrders", "betterAxes", "makeBaskets", "magicLooms", "createMetalFireLauncher", "improvePaths", "manaStorageCharms", "addForge", "spareSandals", "sprinkleOre"],
            upgrades: {
                magicLooms: {
                    key: "magic_looms",
                    name: "Magic Looms",
                    description: "Enchant the looms so Okami weaves faster. Spirit strands increase x1.1 per purchase (compounding).",
                    getCost: function() {
                        const n = data.progress.base.atelier.magicLoomsBought || 0;
                        const mult = Math.pow(2, n);
                        return { wood: 5 * mult, starBeads: 40 * mult };
                    },
                    weavingTime: 10,
                    weavingTimeIncrease: 2,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.atelier.magicLoomsBought || 0;
                    },
                    canBuy: function() {
                        const n = data.progress.base.atelier.magicLoomsBought || 0;
                        const mult = Math.pow(2, n);
                        return resortData.canAffordCost({ wood: 5 * mult, starBeads: 40 * mult });
                    },
                    onBuy: function() {
                        const oldMult = engine.getMagicLoomSpiritStrandMultiplier();
                        const newMult = oldMult * 1.1;
                        engine.applySpiritStrandMultiplierToWeavingTimers(oldMult, newMult);
                        data.progress.base.atelier.magicLoomsBought = (data.progress.base.atelier.magicLoomsBought || 0) + 1;
                    },
                    extraInfo: function() {
                        const n = data.progress.base.atelier.magicLoomsBought || 0;
                        const strands = engine.getOkamiSpiritStrands();
                        return `Spirit strands: ${round2(strands)} (x${round2(Math.pow(1.1, n))})`;
                    },
                    rowVisible: function() {
                        return true;
                    }
                },
                addForge: {
                    key: "add_forge",
                    name: "Add Forge",
                    description: "Build a forge below the Atelier where fire spirits smelt ore into bars.",
                    cost: { stone: 30 },
                    weavingTime: 240,
                    weavingTimeIncrease: 0,
                    canBuy: function() {
                        const a = data.progress.base.atelier;
                        const hs = data.progress.base.hiddenSpring;
                        return !!(a && hs && hs.oreMined && !a.forgeBuilt && resortData.canAffordCost({ stone: 30 }));
                    },
                    onBuy: function() {
                        data.progress.base.atelier.forgeBuilt = true;
                    },
                    rowVisible: function() {
                        const a = data.progress.base.atelier;
                        const hs = data.progress.base.hiddenSpring;
                        return !!(a && hs && hs.oreMined && !a.forgeBuilt && data.progress.base.hiddenSpring.bringOreToAtelierUnlocked);
                    },
                    upgradeSoldOut: function() {
                        return !!data.progress.base.atelier.forgeBuilt;
                    },
                    soldOutButtonLabel: "Forged"
                },
                createMetalFireLauncher: {
                    key: "create_metal_fire_launcher",
                    name: "Create Metal Fire Launcher",
                    description: "Install a fire launcher platform along the path. Each purchase adds one platform (up to 3).",
                    getCost: function() {
                        const n = data.progress.base.atelier.fireLaunchersBought || 0;
                        const mult = Math.pow(2, n);
                        return { bars: 20 * mult };
                    },
                    weavingTime: 150,
                    weavingTimeIncrease: 2,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.atelier.fireLaunchersBought || 0;
                    },
                    canBuy: function() {
                        const a = data.progress.base.atelier;
                        const n = a && a.fireLaunchersBought ? a.fireLaunchersBought : 0;
                        if (!a || !a.forgeBuilt || n >= 3) {
                            return false;
                        }
                        const mult = Math.pow(2, n);
                        return resortData.canAffordCost({ bars: 20 * mult });
                    },
                    onBuy: function() {
                        const a = data.progress.base.atelier;
                        a.fireLaunchersBought = (a.fireLaunchersBought || 0) + 1;
                        data.progress.base.fireLaunchers.builtCount = a.fireLaunchersBought;
                    },
                    maxPurchases: 3,
                    upgradeSoldOut: function() {
                        return (data.progress.base.atelier.fireLaunchersBought || 0) >= 3;
                    },
                    soldOutButtonLabel: "All built",
                    rowVisible: function() {
                        const a = data.progress.base.atelier;
                        return !!(a && a.forgeBuilt && (a.fireLaunchersBought || 0) < 3);
                    }
                },
                improvePaths: {
                    key: "improve_paths",
                    name: "Improve Paths",
                    description: "Material carriers move 10% faster per upgrade when delivering resources.",
                    getCost: function() {
                        const n = (data.progress.base.atelier.improvePathsBought || 0);
                        return { wood: 10 * Math.pow(2, n) };
                    },
                    weavingTime: 20,
                    weavingTimeIncrease: 2,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.atelier.improvePathsBought || 0;
                    },
                    canBuy: function() {
                        return true;
                    },
                    onBuy: function() {
                        data.progress.base.atelier.improvePathsBought = (data.progress.base.atelier.improvePathsBought || 0) + 1;
                    },
                    rowVisible: function() {
                        return true;
                    }
                },
                organizeOrders: {
                    key: "organize_orders",
                    name: "Organize Orders",
                    description: "Fox Den can queue one more gather or build order.",
                    getCost: function() {
                        const n = data.progress.base.atelier.organizeOrdersBought || 0;
                        return { stone: 5 + 5 * n };
                    },
                    weavingTime: 10,
                    weavingTimeIncrease: 5,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.atelier.organizeOrdersBought || 0;
                    },
                    canBuy: function() {
                        const n = data.progress.base.atelier.organizeOrdersBought || 0;
                        return n < 3;
                    },
                    onBuy: function() {
                        data.progress.base.atelier.organizeOrdersBought = (data.progress.base.atelier.organizeOrdersBought || 0) + 1;
                    },
                    maxPurchases: 3,
                    upgradeSoldOut: function() {
                        const n = data.progress.base.atelier.organizeOrdersBought || 0;
                        return n >= 3;
                    },
                    soldOutButtonLabel: "Max orders",
                    rowVisible: function() {
                        return true;
                    }
                },
                manaStorageCharms: {
                    key: "mana_storage_charms",
                    name: "Mana Storage Charms",
                    description: "Enchant kitsune baskets to carry +5 mana per trip when delivering mana orders.",
                    cost: { stone: 50, wood: 100, mana: 2000 },
                    weavingTime: 120,
                    maxPurchases: 4,
                    canBuy: function() {
                        const n = data.progress.base.atelier.manaStorageCharmsBought || 0;
                        return n < 4 && resortData.canAffordCost({ stone: 50, wood: 100, mana: 2000 });
                    },
                    onBuy: function() {
                        data.progress.base.atelier.manaStorageCharmsBought = (data.progress.base.atelier.manaStorageCharmsBought || 0) + 1;
                    },
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.atelier.manaStorageCharmsBought || 0;
                    },
                    upgradeSoldOut: function() {
                        return (data.progress.base.atelier.manaStorageCharmsBought || 0) >= 4;
                    },
                    soldOutButtonLabel: "Max charms",
                    rowVisible: function() {
                        const inn = data.progress.base && data.progress.base.inn;
                        const n = data.progress.base.atelier.manaStorageCharmsBought || 0;
                        return !!(inn && inn.gentleLightsUnlocked && n < 4);
                    },
                    extraInfo: function() {
                        const n = data.progress.base.atelier.manaStorageCharmsBought || 0;
                        return `Mana carry: ${resortData.getManaCarryAmount()} (${n}/4)`;
                    }
                },
                makeBaskets: {
                    key: "make_baskets",
                    name: "Make Baskets",
                    description: "Weave carrying baskets so Fox Den kitsune haul +1 wood or stone per trip.",
                    getCost: function() {
                        const bought = data.progress.base.atelier.basketsBought || 0;
                        return { wood: 20 + bought * 20, stone: 4 + bought * 4 };
                    },
                    weavingTime: 30,
                    weavingTimeIncreaseAdd: 30,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.atelier.basketsBought || 0;
                    },
                    canBuy: function() {
                        return true;
                    },
                    onBuy: function() {
                        data.progress.base.atelier.basketsBought = (data.progress.base.atelier.basketsBought || 0) + 1;
                    },
                    extraInfo: function() {
                        const bought = data.progress.base.atelier.basketsBought || 0;
                        const cap = resortData.getKitsuneCarryCapacity();
                        return `Carry ${cap} per trip (${bought} woven)`;
                    },
                    rowVisible: function() {
                        return true;
                    }
                },
                betterAxes: {
                    key: "better_axes",
                    name: "Better Axes",
                    description: "Each kitsune chopping bamboo gains +1 chop power per upgrade.",
                    getCost: function() {
                        const n = data.progress.base.atelier.betterAxesBought || 0;
                        return { wood: 20 + n * 40, stone: 10 + n * 20 };
                    },
                    weavingTime: 45,
                    weavingTimeIncreaseAdd: 45,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.atelier.betterAxesBought || 0;
                    },
                    canBuy: function() {
                        return (data.progress.base.atelier.betterAxesBought || 0) < 4;
                    },
                    onBuy: function() {
                        data.progress.base.atelier.betterAxesBought = (data.progress.base.atelier.betterAxesBought || 0) + 1;
                    },
                    maxPurchases: 4,
                    upgradeSoldOut: function() {
                        return (data.progress.base.atelier.betterAxesBought || 0) >= 4;
                    },
                    soldOutButtonLabel: "Max axes",
                    extraInfo: function() {
                        const n = data.progress.base.atelier.betterAxesBought || 0;
                        return `+${n} chop power per kitsune`;
                    },
                    rowVisible: function() {
                        return true;
                    }
                },
                spareSandals: {
                    key: "sandal",
                    name: "Collect Spare Sandals",
                    description: "Unlocks sandal attacks to strike enemies at range.",
                    cost: { coins: 1000, wood: 200 },
                    weavingTime: 120,
                    weavingTimeIncrease: 1,
                    canBuy: function() {
                        return !data.progress.base.atelier.sandalBuilt;
                    },
                    onBuy: function() {
                        data.progress.base.atelier.sandalBuilt = true;
                        data.progress.sandalAttackEnabled = true;
                    },
                    extraInfo: function() {
                        return "";
                    },
                    rowVisible: function(hideMaxed) {
                        if (!(data.progress && data.progress.showBattle)) {
                            return false;
                        }
                        return !(hideMaxed && data.progress.base.atelier.sandalBuilt);
                    },
                    upgradeSoldOut: function() {
                        return !!data.progress.base.atelier.sandalBuilt;
                    },
                    soldOutButtonLabel: "Built"
                },
                sprinkleOre: {
                    key: "sprinkle_ore",
                    name: "Sprinkle Ore",
                    description: "Scatter ore dust through the bamboo forest, raising base chips x1.1 per purchase (compounding). Plant spirit bonuses are unchanged.",
                    getCost: function() {
                        const n = data.progress.base.atelier.sprinkleOreBought || 0;
                        const mult = Math.pow(2, n);
                        return { ore: 10 * mult, starBeads: 400 * mult };
                    },
                    weavingTime: 150,
                    weavingTimeIncrease: 2,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.atelier.sprinkleOreBought || 0;
                    },
                    canBuy: function() {
                        const n = data.progress.base.atelier.sprinkleOreBought || 0;
                        const mult = Math.pow(2, n);
                        return resortData.canAffordCost({ ore: 10 * mult, starBeads: 400 * mult });
                    },
                    onBuy: function() {
                        data.progress.base.atelier.sprinkleOreBought = (data.progress.base.atelier.sprinkleOreBought || 0) + 1;
                        engine.refreshBambooForestBaseChips();
                    },
                    extraInfo: function() {
                        const n = data.progress.base.atelier.sprinkleOreBought || 0;
                        const chips = engine.getBambooForestBaseChips();
                        return `Base chips: ${round2(chips)} (x${round2(Math.pow(1.1, n))})`;
                    },
                    rowVisible: function() {
                        return engine.isBringOreToAtelierUnlocked();
                    }
                }
            }
        },

        garden: {
            label: "Rock Garden",
            description: "Automation, so you can go outside.",
            mapSlot: { left: "71%", bottom: 59 },
            constructionCost: { wood: 0, stone: 10 },
            foxDenUnlockOrder: 2,
            progressDefaults: {
                arrangementOfRemembranceUnlocked: false,
                arrangementOfRotationUnlocked: false,
                arrangementOfAppraisalUnlocked: false,
                arrangementOfReviewUnlocked: false,
                arrangementOfFireTendingUnlocked: false,
                arrangementOfHotWaterUnlocked: false,
                arrangementOfVentingSurplusUnlocked: false,
                ventingSurplusEnabled: false,
                arrangementOfPriorityUnlocked: false,
                arrangementOfManaOrdersUnlocked: false,
                autoWeaveOnGatherComplete: true,
                autoWeaveCheapestReady: true,
                smartHarvestUnlocked: false
            },
            introMuted: "Automation for an easy life, so you can go outside.",
            upgradesOrder: ["arrangementOfRotation", "arrangementOfRemembrance", "arrangementOfAppraisal", "arrangementOfPriority", "arrangementOfReview", "arrangementOfFireTending", "arrangementOfHotWater", "arrangementOfVentingSurplus", "arrangementOfManaOrders", "smartHarvest"],
            upgrades: {
                arrangementOfRotation: {
                    key: "arrangement_of_rotation",
                    name: "Arrangement of Rotation",
                    description: "When a bamboo stalk is fully cut, auto-start harvesting the next stalk.",
                    cost: { stone: 10 },
                    weavingTime: 30,
                    weavingTimeIncrease: 1,
                    canBuy: function() {
                        const g = data.progress.base.garden;
                        return !(g && g.arrangementOfRotationUnlocked);
                    },
                    onBuy: function() {
                        data.progress.base.garden.arrangementOfRotationUnlocked = true;
                        const bf = data.progress.base.bambooForest;
                        if (bf) {
                            bf.autoRotateHarvest = true;
                        }
                    },
                    rowVisible: function() {
                        const g = data.progress.base.garden;
                        return !(g && g.arrangementOfRotationUnlocked);
                    },
                    upgradeSoldOut: function() {
                        const g = data.progress.base.garden;
                        return !!(g && g.arrangementOfRotationUnlocked);
                    },
                    soldOutButtonLabel: "Arranged"
                },
                arrangementOfRemembrance: {
                    key: "arrangement_of_remembrance",
                    name: "Arrangement of Remembrance",
                    description: "After weaving, the Okami returns to her previous non-weaving assignment.",
                    cost: { stone: 10 },
                    weavingTime: 30,
                    weavingTimeIncrease: 1,
                    canBuy: function() {
                        const g = data.progress.base.garden;
                        return !(g && g.arrangementOfRemembranceUnlocked);
                    },
                    onBuy: function() {
                        data.progress.base.garden.arrangementOfRemembranceUnlocked = true;
                    },
                    rowVisible: function() {
                        const g = data.progress.base.garden;
                        return !(g && g.arrangementOfRemembranceUnlocked);
                    },
                    upgradeSoldOut: function() {
                        const g = data.progress.base.garden;
                        return !!(g && g.arrangementOfRemembranceUnlocked);
                    },
                    soldOutButtonLabel: "Arranged"
                },
                arrangementOfAppraisal: {
                    key: "arrangement_of_appraisal",
                    name: "Arrangement of Appraisal",
                    description: "When an upgrade has its materials collected, auto-start weaving it if the Okami is not already weaving something.",
                    cost: { stone: 10 },
                    weavingTime: 30,
                    weavingTimeIncrease: 1,
                    canBuy: function() {
                        const g = data.progress.base.garden;
                        return !(g && g.arrangementOfAppraisalUnlocked);
                    },
                    onBuy: function() {
                        const g = data.progress.base.garden;
                        g.arrangementOfAppraisalUnlocked = true;
                        if (g.autoWeaveOnGatherComplete === undefined) {
                            g.autoWeaveOnGatherComplete = true;
                        }
                    },
                    rowVisible: function() {
                        const g = data.progress.base.garden;
                        return !(g && g.arrangementOfAppraisalUnlocked);
                    },
                    upgradeSoldOut: function() {
                        const g = data.progress.base.garden;
                        return !!(g && g.arrangementOfAppraisalUnlocked);
                    },
                    soldOutButtonLabel: "Arranged"
                },
                arrangementOfPriority: {
                    key: "arrangement_of_priority",
                    name: "Arrangement of Priority",
                    description: "Unlock a Mine option to have earth spirits prioritize ore over stone when loading pebbles.",
                    cost: { stone: 30 },
                    weavingTime: 150,
                    weavingTimeIncrease: 0,
                    canBuy: function() {
                        const g = data.progress.base.garden;
                        const hs = data.progress.base.hiddenSpring;
                        return !!(hs && hs.bringOreToAtelierUnlocked && !(g && g.arrangementOfPriorityUnlocked)
                            && resortData.canAffordCost({ stone: 30 }));
                    },
                    onBuy: function() {
                        data.progress.base.garden.arrangementOfPriorityUnlocked = true;
                    },
                    rowVisible: function() {
                        const g = data.progress.base.garden;
                        const hs = data.progress.base.hiddenSpring;
                        return !!(hs && hs.bringOreToAtelierUnlocked && !(g && g.arrangementOfPriorityUnlocked));
                    },
                    upgradeSoldOut: function() {
                        const g = data.progress.base.garden;
                        return !!(g && g.arrangementOfPriorityUnlocked);
                    },
                    soldOutButtonLabel: "Arranged"
                },
                arrangementOfReview: {
                    key: "arrangement_of_review",
                    name: "Arrangement of Review",
                    description: "Every few seconds, auto-weave any ready upgrade with the shortest weave time.",
                    cost: { stone: 20 },
                    weavingTime: 120,
                    weavingTimeIncrease: 1,
                    canBuy: function() {
                        const g = data.progress.base.garden;
                        return !!(g && g.arrangementOfAppraisalUnlocked) && !(g && g.arrangementOfReviewUnlocked);
                    },
                    onBuy: function() {
                        const g = data.progress.base.garden;
                        g.arrangementOfReviewUnlocked = true;
                        if (g.autoWeaveCheapestReady === undefined) {
                            g.autoWeaveCheapestReady = true;
                        }
                    },
                    rowVisible: function() {
                        const g = data.progress.base.garden;
                        return !!(g && g.arrangementOfAppraisalUnlocked) && !(g && g.arrangementOfReviewUnlocked);
                    },
                    upgradeSoldOut: function() {
                        const g = data.progress.base.garden;
                        return !!(g && g.arrangementOfReviewUnlocked);
                    },
                    soldOutButtonLabel: "Arranged"
                },
                arrangementOfFireTending: {
                    key: "arrangement_of_fire_tending",
                    name: "Arrangement of Fire Tending",
                    description: "Adds a Bonfire heat cap control. When enabled, carriers only bring wood while heat stays below the set value.",
                    cost: { stone: 10 },
                    weavingTime: 30,
                    weavingTimeIncrease: 1,
                    canBuy: function() {
                        const g = data.progress.base.garden;
                        return !(g && g.arrangementOfFireTendingUnlocked);
                    },
                    onBuy: function() {
                        const g = data.progress.base.garden;
                        g.arrangementOfFireTendingUnlocked = true;
                        const bf = data.progress.base.bonfire;
                        if (bf) {
                            bf.fireTendingEnabled = true;
                            bf.fireTendingHeatCap = 52;
                        }
                    },
                    rowVisible: function() {
                        const g = data.progress.base.garden;
                        return engine.isBonfireBuiltFromFoxDen()
                            && !(g && g.arrangementOfFireTendingUnlocked);
                    },
                    upgradeSoldOut: function() {
                        const g = data.progress.base.garden;
                        return !!(g && g.arrangementOfFireTendingUnlocked);
                    },
                    soldOutButtonLabel: "Arranged"
                },
                arrangementOfHotWater: {
                    key: "arrangement_of_hot_water",
                    name: "Arrangement of Hot Water",
                    description: "Unlocks a Cistern option to replace cooler stored water when hotter droplets arrive.",
                    cost: { stone: 100 },
                    weavingTime: 600,
                    canBuy: function() {
                        const hs = data.progress.base.hiddenSpring;
                        const g = data.progress.base.garden;
                        return (hs.fireSpiritsBought || 0) >= 1
                            && !(g && g.arrangementOfHotWaterUnlocked);
                    },
                    onBuy: function() {
                        data.progress.base.garden.arrangementOfHotWaterUnlocked = true;
                    },
                    rowVisible: function() {
                        const hs = data.progress.base.hiddenSpring;
                        const g = data.progress.base.garden;
                        return (hs.fireSpiritsBought || 0) >= 1
                            && !(g && g.arrangementOfHotWaterUnlocked);
                    },
                    upgradeSoldOut: function() {
                        const g = data.progress.base.garden;
                        return !!(g && g.arrangementOfHotWaterUnlocked);
                    },
                    soldOutButtonLabel: "Arranged"
                },
                arrangementOfVentingSurplus: {
                    key: "arrangement_of_venting_surplus",
                    name: "Arrangement of Venting Surplus",
                    description: "Adds a Travel option to automatically retry with the same settings when mana reaches its cap.",
                    cost: { stone: 50, starBeads: 2000 },
                    weavingTime: 150,
                    weavingTimeIncrease: 0,
                    canBuy: function() {
                        const hs = data.progress.base.hiddenSpring;
                        const g = data.progress.base.garden;
                        return (hs.earthSpiritsBought || 0) > 0
                            && !(g && g.arrangementOfVentingSurplusUnlocked);
                    },
                    onBuy: function() {
                        const g = data.progress.base.garden;
                        g.arrangementOfVentingSurplusUnlocked = true;
                        g.ventingSurplusEnabled = true;
                    },
                    rowVisible: function() {
                        const hs = data.progress.base.hiddenSpring;
                        const g = data.progress.base.garden;
                        return (hs.earthSpiritsBought || 0) > 0
                            && !(g && g.arrangementOfVentingSurplusUnlocked);
                    },
                    upgradeSoldOut: function() {
                        const g = data.progress.base.garden;
                        return !!(g && g.arrangementOfVentingSurplusUnlocked);
                    },
                    soldOutButtonLabel: "Arranged"
                },
                arrangementOfManaOrders: {
                    key: "arrangement_of_mana_orders",
                    name: "Arrangement of Mana Orders",
                    description: "When Fox Den kitsune have no build or upgrade gathers left, they deliver mana from the Orb to buildings missing mana (last priority).",
                    cost: { stone: 60 },
                    weavingTime: 120,
                    canBuy: function() {
                        const g = data.progress.base.garden;
                        return !(g && g.arrangementOfManaOrdersUnlocked) && resortData.canAffordCost({ stone: 60 });
                    },
                    onBuy: function() {
                        data.progress.base.garden.arrangementOfManaOrdersUnlocked = true;
                        const rh = data.progress.base.foxDen;
                        if (rh) {
                            rh.manaOrdersEnabled = true;
                        }
                    },
                    rowVisible: function() {
                        const g = data.progress.base.garden;
                        return !(g && g.arrangementOfManaOrdersUnlocked);
                    },
                    upgradeSoldOut: function() {
                        const g = data.progress.base.garden;
                        return !!(g && g.arrangementOfManaOrdersUnlocked);
                    },
                    soldOutButtonLabel: "Arranged"
                },
                smartHarvest: {
                    key: "smartHarvest",
                    name: "Smart Harvest",
                    description: "Intruders Cleared stays at 100% until you choose Start harvest on the map; that begins the respawn timer and a foraging run.",
                    cost: { coins: 50, stone: 20 },
                    weavingTime: 240,
                    canBuy: function() {
                        if (typeof events !== "undefined" && events.harvestForageUnlocked && !events.harvestForageUnlocked()) {
                            return false;
                        }
                        const g = data.progress.base.garden;
                        return !(g && g.smartHarvestUnlocked);
                    },
                    onBuy: function() {
                        data.progress.base.garden.smartHarvestUnlocked = true;
                    },
                    extraInfo: function() {
                        return "";
                    },
                    rowVisible: function() {
                        if (typeof events !== "undefined" && events.harvestForageUnlocked && !events.harvestForageUnlocked()) {
                            return false;
                        }
                        return !data.progress.base.garden.smartHarvestUnlocked;
                    }
                }
            },
            emptyPlaceholderId: "base_garden_empty",
            emptyPlaceholderText: "All Rock Garden upgrades bought."
        },

        stonePile: {
            label: "Stone Pile"
        },

        bar: {
            label: "Bar",
            description: "Host guests for rumors and chat.",
            mapSlot: { left: "30%", bottom: 203 },
            constructionCost: { wood: 999, stone: 999 },
            foxDenUnlockOrder: 9,
            mutedPlaceholder: "Bar upgrades are not implemented yet."
        },

        laundry: {
            label: "Laundry Basins",
            description: "Refresh rooms after guests leave.",
            mapSlot: { left: "11%", bottom: 293 },
            constructionCost: { wood: 999, stone: 999 },
            foxDenUnlockOrder: 10,
            mutedPlaceholder: "Laundry upgrades are not implemented yet."
        },

        market: {
            label: "Market",
            description: "Trading hall (content not implemented yet).",
            mapSlot: { left: "5%", bottom: 9 },
            constructionCost: { wood: 100, stone: 0, coins:300 },
            foxDenUnlockOrder: 11,
            mutedPlaceholder: "Market upgrades are not implemented yet."
        },

        mage_tower: {
            label: "The Orb",
            description: "Gain exp from spirit total levels; generates mana equal to its level.",
            mapSlot: { left: "45%", bottom: 143 },
            constructionCost: { wood: 10, stone: 20 },
            foxDenUnlockOrder: 4,
            progressDefaults: {
                level: 0,
                exp: 0,
                expToLevel: 100,
                expandOrbBought: 0,
                spinCurrentsBought: 0,
                increaseInnManaCapacityBought: 0,
                assignedWorkers: 0,
                gearSets: 1
            },
            upgradesOrder: ["expandOrb", "spinCurrents", "increaseInnManaCapacity"],
            upgrades: {
                expandOrb: {
                    key: "expand_orb",
                    name: "Expand Orb",
                    description: "Widen the Orb's reservoir. Each level multiplies maximum mana capacity by x1.1 (compounding).",
                    getCost: function() {
                        const n = (data.progress.base.mage_tower && data.progress.base.mage_tower.expandOrbBought) || 0;
                        return { mana: Math.round(500 * Math.pow(1.25, n)) };
                    },
                    weavingTime: 10,
                    weavingTimeIncreaseAdd: 5,
                    getWeavingPurchaseIndex: function() {
                        return (data.progress.base.mage_tower && data.progress.base.mage_tower.expandOrbBought) || 0;
                    },
                    canBuy: function() {
                        const n = (data.progress.base.mage_tower && data.progress.base.mage_tower.expandOrbBought) || 0;
                        return resortData.canAffordCost({ mana: Math.round(500 * Math.pow(1.25, n)) });
                    },
                    onBuy: function() {
                        const orb = data.progress.base.mage_tower;
                        orb.expandOrbBought = (orb.expandOrbBought || 0) + 1;
                    },
                    extraInfo: function() {
                        const n = (data.progress.base.mage_tower && data.progress.base.mage_tower.expandOrbBought) || 0;
                        const mult = Math.pow(1.1, n);
                        return `Capacity multiplier: x${round2(mult)} (${n} purchased)`;
                    }
                },
                spinCurrents: {
                    key: "spin_currents",
                    name: "Spin Currents",
                    description: "Stir the Orb's inner currents. Each level multiplies mana gain rate by x1.05 (compounding).",
                    getCost: function() {
                        const n = (data.progress.base.mage_tower && data.progress.base.mage_tower.spinCurrentsBought) || 0;
                        return { mana: Math.round(600 * Math.pow(1.25, n)) };
                    },
                    weavingTime: 20,
                    weavingTimeIncreaseAdd: 5,
                    getWeavingPurchaseIndex: function() {
                        return (data.progress.base.mage_tower && data.progress.base.mage_tower.spinCurrentsBought) || 0;
                    },
                    canBuy: function() {
                        const n = (data.progress.base.mage_tower && data.progress.base.mage_tower.spinCurrentsBought) || 0;
                        return resortData.canAffordCost({ mana: Math.round(600 * Math.pow(1.25, n)) });
                    },
                    onBuy: function() {
                        const orb = data.progress.base.mage_tower;
                        orb.spinCurrentsBought = (orb.spinCurrentsBought || 0) + 1;
                    },
                    extraInfo: function() {
                        const n = (data.progress.base.mage_tower && data.progress.base.mage_tower.spinCurrentsBought) || 0;
                        const mult = Math.pow(1.05, n);
                        return `Mana gain multiplier: x${round2(mult)} (${n} purchased)`;
                    }
                },
                increaseInnManaCapacity: {
                    key: "increase_inn_mana_capacity",
                    name: "Increase Inn's Capacity",
                    description: "Expand the Tatami Inn's mana reservoir by +50 per purchase (up to 4 times).",
                    cost: { mana: 400, wood: 10 },
                    weavingTime: 20,
                    maxPurchases: 4,
                    canBuy: function() {
                        const n = (data.progress.base.mage_tower && data.progress.base.mage_tower.increaseInnManaCapacityBought) || 0;
                        return n < 4 && resortData.canAffordCost({ mana: 400, wood: 10 });
                    },
                    onBuy: function() {
                        const orb = data.progress.base.mage_tower;
                        const inn = data.progress.base.inn;
                        orb.increaseInnManaCapacityBought = (orb.increaseInnManaCapacityBought || 0) + 1;
                        inn.manaCapacity = (inn.manaCapacity || 100) + 50;
                    },
                    getWeavingPurchaseIndex: function() {
                        return (data.progress.base.mage_tower && data.progress.base.mage_tower.increaseInnManaCapacityBought) || 0;
                    },
                    rowVisible: function() {
                        const inn = data.progress.base && data.progress.base.inn;
                        return !!(inn && inn.gentleLightsUnlocked);
                    },
                    upgradeSoldOut: function() {
                        return ((data.progress.base.mage_tower && data.progress.base.mage_tower.increaseInnManaCapacityBought) || 0) >= 4;
                    },
                    soldOutButtonLabel: "Max capacity",
                    extraInfo: function() {
                        const n = (data.progress.base.mage_tower && data.progress.base.mage_tower.increaseInnManaCapacityBought) || 0;
                        const cap = (data.progress.base.inn && data.progress.base.inn.manaCapacity) || 100;
                        return `Inn mana capacity: ${intToStringRound(cap)} (${n}/4)`;
                    }
                }
            }
        }
    },

    foxDenUnlockGetDef: function(unlockKey) {
        const th = data.progress.base.foxDen;
        const bdef = resortData.buildings[unlockKey];
        return {
            unlockKey: unlockKey,
            label: bdef && bdef.label ? bdef.label : unlockKey,
            getCost: function() {
                return resortData.getFoxDenConstructionCost(unlockKey);
            },
            canBuy: function() {
                if (th.unlocks[unlockKey]) {
                    return false;
                }
                const site = th.constructionSites && th.constructionSites[unlockKey];
                return !(site && site.status === "building");
            },
            onBuy: function() {
                engine.completeFoxDenConstruction(unlockKey);
            },
            meta: bdef
        };
    }
};

/** Carrier / construction-slot center from a map slot ({ left, bottom } or { left, top }). */
resortData.resolveMapSlotCenter = function(slot, mapW, mapH) {
    if (!slot) {
        return { x: 300, y: 300 };
    }
    const w = mapW || 690;
    const h = mapH || 690;
    let x = w * 0.5;
    if (slot.left !== undefined) {
        if (typeof slot.left === "string" && slot.left.indexOf("%") >= 0) {
            x = w * parseFloat(slot.left, 10) / 100;
            x += 20;
        } else {
            x = Number(slot.left);
        }
    }
    let y = h * 0.5;
    if (slot.bottom !== undefined) {
        y = h - slot.bottom - 38;
    } else if (slot.top !== undefined) {
        y = slot.top;
    }
    return { x: Math.round(x), y: Math.round(y) };
};

resortData.getScopeDisplayName = function(scopeKey) {
    if (scopeKey && scopeKey.indexOf("path_") === 0) {
        const idx = parseInt(scopeKey.slice(5), 10);
        if (!isNaN(idx)) {
            return `Path Section ${idx + 1}`;
        }
    }
    if (scopeKey === "path") {
        return "Path";
    }
    if (scopeKey === "inn") {
        return engine.getInnDisplayName();
    }
    const bdef = resortData.buildings[scopeKey];
    if (bdef && bdef.label) {
        return bdef.label;
    }
    return scopeKey;
};

resortData.getUpgradeWeavingPurchaseIndex = function(upgradeDef, scopeKey) {
    if (!upgradeDef) {
        return 0;
    }
    if (typeof upgradeDef.getWeavingPurchaseIndex === "function") {
        return upgradeDef.getWeavingPurchaseIndex();
    }
    if (upgradeDef.progressCostPurchase && scopeKey && data.progress.base[scopeKey]) {
        return data.progress.base[scopeKey].gearSets || 0;
    }
    return 0;
};

resortData.getUpgradeWeavingBaseSeconds = function(upgradeDef, scopeKey) {
    if (scopeKey === "scrollArchives" && upgradeDef && upgradeDef.key === "finish_research") {
        return engine.getScrollArchivesFinishWeaveSeconds();
    }
    if (scopeKey === "inn" && upgradeDef && upgradeDef.key === "fill_mana") {
        return engine.getInnFillManaWeaveSeconds();
    }
    const baseTime = upgradeDef.weavingTime !== undefined ? upgradeDef.weavingTime : resortData.defaultWeavingTime;
    const purchaseIndex = resortData.getUpgradeWeavingPurchaseIndex(upgradeDef, scopeKey);
    if (upgradeDef.weavingTimeIncreaseAdd !== undefined) {
        return baseTime + purchaseIndex * upgradeDef.weavingTimeIncreaseAdd;
    }
    const increase = upgradeDef.weavingTimeIncrease !== undefined ? upgradeDef.weavingTimeIncrease : resortData.defaultWeavingTimeIncrease;
    return baseTime * Math.pow(increase, purchaseIndex);
};

resortData.getWeavingThreadsExtra = function(upgradeDef, scopeKey) {
    const sec = resortData.getUpgradeWeavingBaseSeconds(upgradeDef, scopeKey);
    return `${Math.ceil(sec)} threads to weave`;
};

resortData.getUpgradeWeavingSeconds = function(upgradeDef, scopeKey) {
    const strands = engine.getOkamiSpiritStrands();
    return resortData.getUpgradeWeavingBaseSeconds(upgradeDef, scopeKey) / Math.max(1, strands);
};

resortData.iterWorkerAssignmentSites = function(callback) {
    const keys = resortData.workerAssignmentSiteKeys || [];
    for (let i = 0; i < keys.length; i++) {
        callback(keys[i], data.progress.base && data.progress.base[keys[i]]);
    }
};
