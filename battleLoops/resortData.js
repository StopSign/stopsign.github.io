/**
 * Static copy and layout-shaped config for Base building panels (see viewCreate.generateBasePanelsHtml).
 * DOM ids derive from building segment + upgrade `key`; purchase flow uses events.buyUpgrade + cost / onBuy.
 */

var resortData = {
    workerPowerSiteKeys: [],
    bonfireClasses: ["condescension", "scold", "mockery"],

    /** All map building keys (resort buttons; order does not affect gameplay). */
    baseBuildingOrder: [
        "hiddenSpring", "torii", "stonePile", "bambooForest", "mine",
        "foxDen", "chapel", "inn", "bar", "laundry", "cistern",
        "scrollArchives", "garden", "atelier", "bonfire", "market", "mage_tower"
    ],
    /** Display names for map buildings (labels via getScopeDisplayName). */
    baseBuildingDisplayNames: {
        hiddenSpring: "Hidden Spring",
        torii: "Zenko Torii Gate",
        stonePile: "Stone Pile",
        bambooForest: "Bamboo Forest",
        mine: "Mine",
        foxDen: "Fox Den",
        chapel: "Chapel",
        inn: "Tatami Inn",
        bar: "Bar",
        laundry: "Laundry Basins",
        cistern: "Cistern",
        scrollArchives: "Scroll Archives",
        garden: "Rock Garden",
        atelier: "Atelier",
        bonfire: "Bonfire",
        market: "Market",
        mage_tower: "The Orb"
    },

    /** Class buy costs + per-level growth (saved class lives in `data.progress`). */
    bonfireClassDefs: {
        none: { key: "none", name: "None", buyCostCoins: 0, perLevel: { str: 1, con: 1, spd: 0 } },
        condescension: { key: "condescension", name: "Condescension", buyCostCoins: 500, perLevel: { str: 1, con: 2, spd: 0 } },
        scold: { key: "scold", name: "Scold", buyCostCoins: 500, perLevel: { str: 1, con: 1, spd: 1 } },
        mockery: { key: "mockery", name: "Mockery", buyCostCoins: 500, perLevel: { str: 2, con: 1, spd: 0 } }
    },

    /** Per-building construction costs (wood/stone delivered by Fox Den carriers). */
    foxDenConstructionCosts: {
        torii: { wood: 2, stone: 2 },
        inn: { wood: 4, stone: 6 },
        garden: { wood: 0, stone: 10 },
        atelier: { wood: 10, stone: 0 },
        bonfire: { wood: 10, stone: 10 },
        scrollArchives: { wood: 20, stone: 10 },
        cistern: { wood: 0, stone: 100 },
        bar: { wood: 999, stone: 999 },
        laundry: { wood: 999, stone: 999 },
        market: { wood: 999, stone: 999 },
        mage_tower: { wood: 999, stone: 999 }
    },

    /** Map slot positions for Fox Den construction / carrier targets (matches .resort-building-* CSS). */
    foxDenMapSlots: {
        torii: { left: 334, top: 662 },
        inn: { left: 140, top: 490 },
        bonfire: { left: "88%", bottom: 12 },
        garden: { left: "71%", bottom: 59 },
        atelier: { left: "74%", bottom: 192 },
        cistern: { left: "80%", bottom: 290 },
        scrollArchives: { left: "61%", bottom: 270 },
        bar: { left: "30%", bottom: 203 },
        laundry: { left: "11%", bottom: 293 },
        market: { left: "5%", bottom: 9 },
        mage_tower: { left: "45%", bottom: 143 }
    },

    defaultMapRevealedState: {
        hiddenSpring: false,
        mine: false,
        spiritSlots: false
    },

    kitsuneCarryCapacity: 1,

    getKitsuneCarryCapacity: function() {
        const base = resortData.kitsuneCarryCapacity || 1;
        const w = data.progress.base && data.progress.base.atelier;
        const bought = w && w.basketsBought ? w.basketsBought : 0;
        return base + bought;
    },

    foxDenCarrierSpawnMinMs: 500,

    bambooForestConfig: {
        defaultBaseWood: 10,
        cutPowerRequired: 10,
        harvestBaseRate: 1,
        cellGrowFullMs: 120000,
        capacityStepFactor: 0.8,
        stalkCount: 4,
        rowCount: 3,
        plantSpiritMax: 4
    },

    /** Copied into saved `data.progress.base.foxDen.unlocks` for new games. */
    defaultFoxDenUnlocksState: {
        torii: false,
        inn: false,
        bar: false,
        laundry: false,
        cistern: false,
        scrollArchives: false,
        garden: false,
        atelier: false,
        bonfire: false,
        market: false,
        mage_tower: false
    },

    /** Sites with a pinned worker dock at the bottom of baseBuildingInfo. */
    workerDockSiteKeys: ["torii", "laundry", "bambooForest", "foxDen"],

    /** Copied into saved `data.progress.base.resources` for new games. */
    defaultBaseResources: {
        stone: 0
    },

    /** Building unlock rows (Fox Den panel). Only data fields; DOM ids auto: base_foxDen_<key>_* */
    foxDenUnlockOrder: ["torii", "inn", "garden", "atelier", "bonfire", "cistern", "scrollArchives", "bar", "laundry", "market", "mage_tower"],
    foxDenUnlockDefs: {
        torii: { label: "Zenko Torii Gate", description: "Welcome guests to the resort." },
        inn: { label: "Tatami Inn", description: "Lodging for guests who pass through the torii gate." },
        bar: { label: "Bar", description: "Host guests for rumors and chat." },
        laundry: { label: "Laundry Basins", description: "Refresh rooms after guests leave." },
        cistern: { label: "Cistern", description: "Collect water from droplets." },
        scrollArchives: { label: "Scroll Archives", description: "Research skills one category at a time." },
        garden: { label: "Rock Garden", description: "Automation, so you can go outside." },
        atelier: { label: "Atelier", description: "Upgrades for the different buildings." },
        bonfire: { label: "Bonfire", description: "Stare at the fire and contemplate how to protect what's yours." },
        market: { label: "Market", description: "Trading hall (content not implemented yet)." },
        mage_tower: { label: "The Orb", description: "Arcane ateliers to be added later." }
    },

    costToParts: function(cost) {
        const c = cost || {};
        const parts = [];
        if ((c.coins || 0) > 0) parts.push(`${intToStringRound(c.coins)} coins`);
        if ((c.starBeads || 0) > 0) parts.push(`${intToStringRound(c.starBeads)} Star Beads`);
        if ((c.wood || 0) > 0) parts.push(`${intToStringRound(c.wood)} wood`);
        if ((c.stone || 0) > 0) parts.push(`${intToStringRound(c.stone)} stone`);
        return parts;
    },

    planToBuildFromCost: function(costOrGetter) {
        const c = typeof costOrGetter === "function" ? costOrGetter() : costOrGetter;
        const parts = resortData.costToParts(c);
        return `Plan to build for [${parts.join(", ")}]`;
    },

    getFoxDenConstructionCost: function(unlockKey) {
        const costs = resortData.foxDenConstructionCosts || {};
        return costs[unlockKey] ? Object.assign({}, costs[unlockKey]) : { wood: 0, stone: 0 };
    },

    getConstructionRemainingLabel: function(site) {
        if (!site || !site.required) {
            return "";
        }
        const parts = [];
        const keys = ["wood", "stone"];
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            const req = site.required[k] || 0;
            const del = (site.delivered && site.delivered[k]) || 0;
            const rem = Math.max(0, req - del);
            if (rem > 0) {
                parts.push(`${intToStringRound(rem)} ${k}`);
            }
        }
        if (!parts.length) {
            return "Complete";
        }
        return parts.join(", ") + " to add";
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
            gather: { wood: c.wood || 0, stone: c.stone || 0 },
            weave: { coins: c.coins || 0, starBeads: c.starBeads || 0 }
        };
    },

    isCoinOrBeadOnlyCost: function(cost) {
        const split = resortData.splitGatherWeaveCost(cost);
        const g = split.gather;
        return (g.wood || 0) <= 0 && (g.stone || 0) <= 0
            && ((split.weave.coins || 0) > 0 || (split.weave.starBeads || 0) > 0);
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
        const base = data.progress.base;
        const res = base.resources;
        const c = cost || {};
        if ((c.coins || 0) > data.progress.coins) return false;
        if ((c.starBeads || 0) > (data.progress.starBeads || 0)) return false;
        if ((c.wood || 0) > ((base.bambooForest && base.bambooForest.wood) || 0)) return false;
        if ((c.stone || 0) > ((base.stonePile && base.stonePile.stone) || 0)) return false;
        return true;
    },

    deductCost: function(cost) {
        const base = data.progress.base;
        const res = base.resources;
        const c = cost || {};
        data.progress.coins -= (c.coins || 0);
        data.progress.starBeads = (data.progress.starBeads || 0) - (c.starBeads || 0);
        if ((c.wood || 0) > 0 && base.bambooForest) {
            base.bambooForest.wood = Math.max(0, (base.bambooForest.wood || 0) - (c.wood || 0));
        }
        if ((c.stone || 0) > 0 && base.stonePile) {
            base.stonePile.stone = Math.max(0, (base.stonePile.stone || 0) - (c.stone || 0));
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

    bonfireBuyBtn: function(classKey) {
        return `base_bonfire_${classKey}_buy_btn`;
    },

    bonfireSwitchBtn: function(classKey) {
        return `base_bonfire_${classKey}_switch_btn`;
    },

    /** Mine gear + workers panel (also drives progress caches). */
    workerSitePanelOrder: [],

    /** Element ids: base_<building>_<suffix>_btn (assign +/++/>>> and unassign -/--/<< for adjustWorkers). ScrollArchives uses the same suffixes. */
    workerAdjustIncrBtnSuffixes: ["assign_one", "assign_ten", "assign_all"],
    workerAdjustDecrBtnSuffixes: ["unassign_one", "unassign_ten", "unassign_all"],

    /** Sites with `assignedWorkers` in saved base state (data-driven worker totals). */
    workerAssignmentSiteKeys: ["torii", "laundry", "bambooForest", "foxDen", "scrollArchives"],

    /** Sites where Okami can be assigned (replaces manual action buttons). */
    okamiAssignableSiteKeys: ["torii", "laundry", "bambooForest", "foxDen", "scrollArchives"],

    defaultWeavingTime: 5,
    defaultWeavingTimeIncrease: 1,

    pathConfig: {
        segmentStep: 38,
        semiCircleSegmentCount: 2,
        okamiTravelSpeed: 35,
        storeRockAmount: 2,
        initialState: "Large Rocks",
        clearedState: "Clear"
    },

    okamiConfig: {
        baseExpToLevel: 200,
        expAdditiveStep: 40,
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
                        const seg = engine.getPathSegmentData(idx);
                        return !!(seg && seg.state === "Large Rocks");
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
                        const seg = engine.getPathSegmentData(idx);
                        return !!(seg && seg.state === "Clear" && !seg.hasRailing);
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
                    description: "Build stairs so the Okami moves another 50% faster along this path section (stacks with railing).",
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
                        const seg = engine.getPathSegmentData(idx);
                        return !!(seg && seg.state === "Clear" && seg.hasRailing && !seg.hasStairs);
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
                        return { starBeads: 100 };
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
                        return resortData.canAffordCost({ starBeads: 100 });
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
                        const seg = engine.getPathSegmentData(idx);
                        return !!(seg && seg.state === "Clear" && seg.hasStairs && !seg.hasLanterns);
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
            upgradesOrder: ["callForAlly", "addQueuePosts", "growPlantSpirit"],
            upgrades: {
                callForAlly: {
                    key: "call_for_ally",
                    name: "Call for Ally",
                    description: "Weave a call that draws an ally to the gate - +1 Kitsune.",
                    weavingTime: 20,
                    weavingTimeIncreaseAdd: 20,
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
                addQueuePosts: {
                    key: "add_queue_posts",
                    name: "Add Queue Posts",
                    description: "Add posts so more visitors can wait at the gate.",
                    getCost: function() {
                        const bought = (data.progress.base.torii.queuePostsBought || 0);
                        return { wood: 3 + bought * 3 };
                    },
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.torii.queuePostsBought || 0;
                    },
                    maxPurchases: 3,
                    rowVisible: function() {
                        const rh = data.progress.base.foxDen;
                        const torii = data.progress.base.torii;
                        return !!(rh && rh.unlocks && rh.unlocks.torii) && (torii.queuePostsBought || 0) < 3;
                    },
                    canBuy: function() {
                        const torii = data.progress.base.torii;
                        return (torii.queuePostsBought || 0) < 3;
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
                },
                growPlantSpirit: {
                    key: "grow_plant_spirit",
                    name: "Nurture Plant Spirit",
                    description: "Nurture a plant spirit to strengthen a bamboo stalk.",
                    weavingTime: 30,
                    weavingTimeIncreaseAdd: 60,
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
                        return !!(rh && rh.unlocks && rh.unlocks.torii)
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
                }
            }
        },
        chapel: {
            description: "The Chapel blesses your journey.",
            progressDefaults: {
                autoRetryEnabled: false,
                growthBlessingUnlocked: false,
                plannedGrowthBlessingUnlocked: false
            },
            upgradesOrder: ["growthBlessing", "autoRetry", "plannedGrowthBlessing"],
            upgrades: {
                growthBlessing: {
                    key: "growth",
                    name: "Blessing of Growth",
                    description: "Gain exp and levels.",
                    cost: { coins: 10 },
                    canBuy: function() {
                        return !data.progress.base.chapel.growthBlessingUnlocked;
                    },
                    onBuy: function() {
                        data.progress.base.chapel.growthBlessingUnlocked = true;
                    },
                    extraInfo: function() {
                        return "";
                    },
                    rowVisible: function() {
                        return !data.progress.base.chapel.growthBlessingUnlocked;
                    }
                },
                autoRetry: {
                    key: "retry",
                    name: "Automatic retry",
                    description: "Automatically try again after death.",
                    cost: { coins: 20 },
                    canBuy: function() {
                        return !data.progress.base.chapel.autoRetryEnabled;
                    },
                    onBuy: function() {
                        const c = data.progress.base.chapel;
                        c.autoRetryEnabled = true;
                        if (data.battle && data.battle.state === "dead") {
                            data.progress.autoRetryCountdownSec = 10;
                        }
                    },
                    extraInfo: function() {
                        return "";
                    },
                    rowVisible: function() {
                        return !data.progress.base.chapel.autoRetryEnabled;
                    }
                },
                plannedGrowthBlessing: {
                    key: "planned",
                    name: "Blessing of Planned Growth",
                    description: "Gain attribute points and spend them from your plan on level-up.",
                    cost: { coins: 300 },
                    canBuy: function() {
                        return !data.progress.base.chapel.plannedGrowthBlessingUnlocked;
                    },
                    onBuy: function() {
                        data.progress.base.chapel.plannedGrowthBlessingUnlocked = true;
                    },
                    extraInfo: function() {
                        return "";
                    },
                    rowVisible: function() {
                        return !data.progress.base.chapel.plannedGrowthBlessingUnlocked;
                    }
                }
            }
        },

        foxDen: {
            description: "Plan and build resort structures with gathered wood and stone.",
            progressDefaults: {
                assignedWorkers: 0,
                gearSets: 1
            }
        },

        bambooForest: {
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
                stalks: null
            }
        },

        hiddenSpring: {
            description: "A quiet spring above the resort where spirits gather.",
            upgradesOrder: ["assembleEarthSpirit", "gatherWaterSpirit", "sparkFireSpirit"],
            upgrades: {
                assembleEarthSpirit: {
                    key: "earthSpirit",
                    name: "Assemble Earth Spirit",
                    description: "Summon an earth spirit for the Mine (or Hidden Spring if the Mine is full) and reveal the Mine.",
                    weavingTime: 5,
                    weavingTimeIncrease: 1,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.hiddenSpring.earthSpiritsBought || 0;
                    },
                    getCost: function() {
                        return { starBeads: engine.getSpiritCost("earth") };
                    },
                    canBuy: function() {
                        const hs = data.progress.base.hiddenSpring;
                        if (!hs || (hs.earthSpiritsBought || 0) >= engine.getHiddenSpringSpiritSlotMax()) {
                            return false;
                        }
                        return resortData.canAffordCost({ starBeads: engine.getSpiritCost("earth") });
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
                gatherWaterSpirit: {
                    key: "waterSpirit",
                    name: "Gather Water Spirit",
                    description: "Summon a water spirit for the Hidden Spring.",
                    weavingTime: 5,
                    weavingTimeIncrease: 1,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.hiddenSpring.waterSpiritsBought || 0;
                    },
                    getCost: function() {
                        return { starBeads: engine.getSpiritCost("water") };
                    },
                    canBuy: function() {
                        if (!engine.isCisternBuiltFromFoxDen()) {
                            return false;
                        }
                        const hs = data.progress.base.hiddenSpring;
                        if (!hs || (hs.waterSpiritsBought || 0) >= engine.getHiddenSpringSpiritSlotMax()) {
                            return false;
                        }
                        return resortData.canAffordCost({ starBeads: engine.getSpiritCost("water") });
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
                        return { starBeads: engine.getSpiritCost("fire") };
                    },
                    canBuy: function() {
                        const hs = data.progress.base.hiddenSpring;
                        if (!hs || (hs.fireSpiritsBought || 0) >= engine.getHiddenSpringSpiritSlotMax()) {
                            return false;
                        }
                        return resortData.canAffordCost({ starBeads: engine.getSpiritCost("fire") });
                    },
                    onBuy: function() {
                        engine.assembleSpiritFromPurchase("fire");
                    },
                    getMaxPurchases: function() {
                        return engine.getHiddenSpringSpiritSlotMax();
                    },
                    rowVisible: function() {
                        const hs = data.progress.base.hiddenSpring;
                        return (hs.fireSpiritsBought || 0) < engine.getHiddenSpringSpiritSlotMax();
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
            progressDefaults: {
                guests: [],
                guestLog: [],
                guestIdCounter: 1,
                furnitureBought: 0,
                decorationBought: 0,
                addRoomBought: 0,
                restfulnessPerSecond: 1
            },
            upgradesOrder: ["addFurniture", "addDecoration", "addRoom"],
            upgrades: {
                addFurniture: {
                    key: "add_furniture",
                    name: "Add Furniture",
                    description: "Comfortable furnishings let guests rest longer (+5s per upgrade).",
                    getCost: function() {
                        const bought = (data.progress.base.inn.furnitureBought || 0);
                        return { wood: 3 + bought * 3 };
                    },
                    weavingTime: 20,
                    weavingTimeIncreaseAdd: 20,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.inn.furnitureBought || 0;
                    },
                    canBuy: function() {
                        return (data.progress.base.inn.furnitureBought || 0) < 4;
                    },
                    onBuy: function() {
                        data.progress.base.inn.furnitureBought = (data.progress.base.inn.furnitureBought || 0) + 1;
                    },
                    maxPurchases: 4,
                    upgradeSoldOut: function() {
                        return (data.progress.base.inn.furnitureBought || 0) >= 4;
                    },
                    soldOutButtonLabel: "Max furniture",
                    rowVisible: function() {
                        return (data.progress.base.inn.furnitureBought || 0) < 4;
                    }
                },
                addDecoration: {
                    key: "add_decoration",
                    name: "Add Decoration",
                    description: "Beautiful decor helps guests recover restfulness faster (+0.5/s per upgrade).",
                    getCost: function() {
                        const bought = (data.progress.base.inn.decorationBought || 0);
                        return { stone: 6 + bought * 6 };
                    },
                    weavingTime: 20,
                    weavingTimeIncrease: 20,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.inn.decorationBought || 0;
                    },
                    canBuy: function() {
                        return (data.progress.base.inn.decorationBought || 0) < 4;
                    },
                    onBuy: function() {
                        data.progress.base.inn.decorationBought = (data.progress.base.inn.decorationBought || 0) + 1;
                    },
                    maxPurchases: 4,
                    upgradeSoldOut: function() {
                        return (data.progress.base.inn.decorationBought || 0) >= 4;
                    },
                    soldOutButtonLabel: "Max decoration",
                    rowVisible: function() {
                        return (data.progress.base.inn.decorationBought || 0) < 4;
                    }
                },
                addRoom: {
                    key: "add_room",
                    name: "Add Room",
                    description: "Add another tatami room for Zenko guests.",
                    getCost: function() {
                        const bought = (data.progress.base.inn.addRoomBought || 0);
                        return { wood: 6 + bought * 6 };
                    },
                    weavingTime: 60,
                    weavingTimeIncrease: 60,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.inn.addRoomBought || 0;
                    },
                    canBuy: function() {
                        return (data.progress.base.inn.addRoomBought || 0) < 3;
                    },
                    onBuy: function() {
                        data.progress.base.inn.addRoomBought = (data.progress.base.inn.addRoomBought || 0) + 1;
                        engine.syncInnRoomCounts();
                    },
                    maxPurchases: 3,
                    upgradeSoldOut: function() {
                        return (data.progress.base.inn.addRoomBought || 0) >= 3;
                    },
                    soldOutButtonLabel: "Max rooms",
                    rowVisible: function() {
                        return (data.progress.base.inn.addRoomBought || 0) < 3;
                    }
                }
            }
        },

        bonfire: {
            currentStatusRowId: "base_bonfire_current",
            upgradesOrder: ["condescension", "scold", "mockery"],
            upgrades: {
                condescension: {
                    key: "condescension",
                    getCost: function() {
                        return { coins: initialize.getClassDef("condescension").buyCostCoins || 500 };
                    },
                    canBuy: function() {
                        return !data.progress.unlockedClasses.condescension;
                    },
                    onBuy: function() {
                        data.progress.unlockedClasses.condescension = true;
                    }
                },
                scold: {
                    key: "scold",
                    getCost: function() {
                        return { coins: initialize.getClassDef("scold").buyCostCoins || 500 };
                    },
                    canBuy: function() {
                        return !data.progress.unlockedClasses.scold;
                    },
                    onBuy: function() {
                        data.progress.unlockedClasses.scold = true;
                    }
                },
                mockery: {
                    key: "mockery",
                    getCost: function() {
                        return { coins: initialize.getClassDef("mockery").buyCostCoins || 500 };
                    },
                    canBuy: function() {
                        return !data.progress.unlockedClasses.mockery;
                    },
                    onBuy: function() {
                        data.progress.unlockedClasses.mockery = true;
                    }
                }
            }
        },

        scrollArchives: {
            limits: {
                gearBaseCost: { coins: 10, stone: 0 },
                gearCostIncrease: { coins: 10, stone: 5 }
            },
            progressDefaults: {
                unlockedSkills: {},
                skillResearch: {},
                assignedWorkers: 0,
                gearSets: 0,
                researchPerWorkerPerSecond: 1
            },
            upgradesOrder: ["researchDesk"],
            upgrades: {
                researchDesk: {
                    key: "desk",
                    name: "Research desk",
                    description: "Each desk lets you assign one researcher to the skill queue.",
                    progressCostPurchase: true,
                    canBuy: function() {
                        return true;
                    },
                    extraInfo: function() {
                        const c = resortData.computedProgressGearPurchaseCost("scrollArchives");
                        return `Next desk: ${intToStringRound(c.coins || 0)} coins, ${intToStringRound(c.stone || 0)} stone`;
                    }
                }
            },
            queueNote: "Skills are researched one at a time in order.",
            emptySkillsId: "base_scrollArchives_empty",
            emptySkillsText: "All skills researched."
        },

        atelier: {
            limits: {
                barRoomTierMax: 7,
                barRoomBaseCoins: 500,
                barRoomBaseStone: 50,
                barRoomCoinsStep: 100,
                barRoomStoneStep: 10
            },
            progressDefaults: {
                barRoomUpgradesBought: 0,
                sandalBuilt: false,
                basketsBought: 0,
                improvePathsBought: 0,
                organizeOrdersBought: 0
            },
            upgradesOrder: ["improvePaths", "organizeOrders", "makeBaskets", "barRoomExpansion", "spareSandals"],
            upgrades: {
                improvePaths: {
                    key: "improve_paths",
                    name: "Improve Paths",
                    description: "Material carriers move 10% faster per upgrade when delivering wood or stone to planned buildings.",
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
                    description: "Fox Den carriers can juggle one more gather or build order at a time (max 3).",
                    getCost: function() {
                        const n = data.progress.base.atelier.organizeOrdersBought || 0;
                        return { stone: 5 + 5 * n };
                    },
                    weavingTime: 10,
                    weavingTimeIncrease: 10,
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
                makeBaskets: {
                    key: "make_baskets",
                    name: "Make Baskets",
                    description: "Weave carrying baskets so Fox Den kitsune haul +1 wood or stone per trip.",
                    getCost: function() {
                        const bought = data.progress.base.atelier.basketsBought || 0;
                        return { wood: 20 + bought * 20, stone: 2 + bought * 2 };
                    },
                    weavingTime: 20,
                    weavingTimeIncrease: 20,
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
                barRoomExpansion: {
                    key: "room",
                    name: "Inn room expansion",
                    description: "Adds another guest slot at the Inn.",
                    getCost: function() {
                        const w = data.progress.base.atelier;
                        const L = resortData.buildings.atelier.limits;
                        const bought = w.barRoomUpgradesBought || 0;
                        return {
                            coins: L.barRoomBaseCoins + bought * L.barRoomCoinsStep,
                            stone: L.barRoomBaseStone + bought * L.barRoomStoneStep
                        };
                    },
                    canBuy: function() {
                        const max = resortData.buildings.atelier.limits.barRoomTierMax;
                        return (data.progress.base.atelier.barRoomUpgradesBought || 0) < max;
                    },
                    onBuy: function() {
                        const w = data.progress.base.atelier;
                        w.barRoomUpgradesBought = (w.barRoomUpgradesBought || 0) + 1;
                    },
                    getMaxPurchases: function() {
                        return resortData.buildings.atelier.limits.barRoomTierMax;
                    },
                    getPurchaseCount: function() {
                        return data.progress.base.atelier.barRoomUpgradesBought || 0;
                    },
                    rowVisible: function(hideMaxed) {
                        const max = resortData.buildings.atelier.limits.barRoomTierMax;
                        const roomMaxed = (data.progress.base.atelier.barRoomUpgradesBought || 0) >= max;
                        return !(hideMaxed && roomMaxed);
                    },
                    upgradeSoldOut: function() {
                        const max = resortData.buildings.atelier.limits.barRoomTierMax;
                        return (data.progress.base.atelier.barRoomUpgradesBought || 0) >= max;
                    },
                    soldOutButtonLabel: "Bought"
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
                        return !(hideMaxed && data.progress.base.atelier.sandalBuilt);
                    },
                    upgradeSoldOut: function() {
                        return !!data.progress.base.atelier.sandalBuilt;
                    },
                    soldOutButtonLabel: "Built"
                }
            }
        },

        garden: {
            progressDefaults: {
                arrangementOfRemembranceUnlocked: false,
                arrangementOfRotationUnlocked: false,
                arrangementOfAppraisalUnlocked: false,
                arrangementOfReviewUnlocked: false,
                autoWeaveOnGatherComplete: true,
                autoWeaveCheapestReady: true,
                smartHarvestUnlocked: false
            },
            introMuted: "Automation for an easy life, so you can go outside.",
            upgradesOrder: ["arrangementOfRotation", "arrangementOfRemembrance", "arrangementOfAppraisal", "arrangementOfReview", "smartHarvest"],
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
                    description: "When a gather job is ready, auto-weave it if Okami is idle or assigned to a building (not weaving).",
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
                smartHarvest: {
                    key: "smartHarvest",
                    name: "Smart Harvest",
                    description: "Intruders Cleared stays at 100% until you choose Start harvest on the map; that begins the respawn timer and a foraging run.",
                    cost: { coins: 50, wood: 10 },
                    canBuy: function() {
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
                        return !data.progress.base.garden.smartHarvestUnlocked;
                    }
                }
            },
            emptyPlaceholderId: "base_garden_empty",
            emptyPlaceholderText: "All Rock Garden upgrades bought."
        },

        market: {
            mutedPlaceholder: "Market upgrades are not implemented yet."
        },

        mage_tower: {
            mutedPlaceholder: "Mage Tower upgrades are not implemented yet."
        }
    },

    foxDenUnlockGetDef: function(unlockKey) {
        const th = data.progress.base.foxDen;
        const meta = resortData.foxDenUnlockDefs[unlockKey];
        return {
            unlockKey: unlockKey,
            label: meta && meta.label ? meta.label : unlockKey,
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
            meta: meta
        };
    }
};

/** Flattened Resort Hall building-tab rows for UI helpers. */
resortData.foxDenUnlocks = resortData.foxDenUnlockOrder.map(function(k) {
    const m = resortData.foxDenUnlockDefs[k] || {};
    return { key: k, label: m.label || k, description: m.description || "" };
});

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
    if (resortData.baseBuildingDisplayNames[scopeKey]) {
        return resortData.baseBuildingDisplayNames[scopeKey];
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
