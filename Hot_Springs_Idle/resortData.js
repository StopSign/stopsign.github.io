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
        "foxDen", "inn", "garden", "atelier", "mage_tower", "bonfire",
        "scrollArchives", "cistern", "pond",  "market", "shrine", "noodleBar", "laundry"
    ],

    /** Class buy costs + per-level growth (saved class lives in `data.progress`). */
    bonfireClassDefs: {
        none: { key: "none", name: "Classless", shortLabel: "Classless", image: "img/default.svg", perLevel: { str: 1, con: 1, spd: 0 } }
    },

    defaultMapRevealedState: {
        hiddenSpring: false,
        mine: false,
        spiritSlots: false
    },

    kitsuneCarryCapacity: 1,
    kitsuneWaterCarryAmount: 50,
    kitsuneWoodCarryAmount: 1,
    manaCarryAmount: 50,
    manaBuildingKeys: ["inn", "torii", "stonePile"],

    attributeDisplay: {
        str: { short: "Bru", name: "Brutality" },
        con: { short: "Con", name: "Confidence" },
        spd: { short: "Spd", name: "Speed" },
        soul: { short: "Soul", name: "Soul" }
    },

    getKitsuneCarryCapacity: function() {
        const bought = (data.progress.base && data.progress.base.atelier && data.progress.base.atelier.basketsBought) || 0;
        return fibonacci(bought + 1);
    },

    getManaCarryAmount: function() {
        const base = resortData.manaCarryAmount !== undefined ? resortData.manaCarryAmount : 5;
        const a = data.progress.base && data.progress.base.atelier;
        const bought = a && a.manaStorageCharmsBought ? a.manaStorageCharmsBought : 0;
        return base + bought * 50;
    },
    getKitsuneWaterCarryAmount: function() {
        return resortData.kitsuneWaterCarryAmount !== undefined ? resortData.kitsuneWaterCarryAmount : 50;
    },
    getCisternWaterCarryAmount: function() {
        const base = resortData.kitsuneWaterCarryAmount !== undefined ? resortData.kitsuneWaterCarryAmount : 50;
        const a = data.progress.base && data.progress.base.atelier;
        const bought = a && a.bucketsBought ? a.bucketsBought : 0;
        return base + bought * 50;
    },
    getKitsuneWoodCarryAmount: function() {
        const bought = (data.progress && data.progress.base && data.progress.base.market
            && data.progress.base.market.arsonistJournalsBought) || 0;
        return fibonacci(bought + 1);
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

    fireLauncherPlatformDefs: [
        {
            key: "pathMid",
            name: "Long-Range Launcher",
            attackType: "projectile",
            rangePx: 90,
            intervalMs: 2000,
            emberCost: 200,
            heatPerStrike: 3,
            maxEmbers: 1000,
            projectileDurationMs: 1050,
            mapPos: { x: 325, y: 242 }
        },
        {
            key: "bendTop",
            name: "Burst Launcher",
            attackType: "aoe",
            rangePx: 45,
            intervalMs: 1000,
            emberCost: 300,
            heatPerStrike: 10,
            maxEmbers: 1000,
            mapPos: { x: 428, y: 159 }
        },
        {
            key: "pathLower",
            name: "Ember Launcher",
            attackType: "projectile",
            rangePx: 72,
            intervalMs: 200,
            emberCost: 50,
            heatPerStrike: 1,
            maxEmbers: 1000,
            projectileDurationMs: 1050,
            projectileSizePx: 14,
            mapPos: { x: 446, y: 283 }
        }
    ],

    /** Copied into saved `data.progress.base.resources` for new games. */
    defaultBaseResources: {
        stone: 0
    },

    /** Sites with a pinned worker dock at the bottom of baseBuildingInfo. */
    workerDockSiteKeys: ["torii", "laundry", "bambooForest", "foxDen", "bonfire", "cistern", "scrollArchives",  "mage_tower", "market"],

    /** Credit paid per unit of each haulable resource delivered to the Market. */
    marketCreditPerResource: { stone: 5, wood: 3, bars: 10 },
    marketHaulResourceOrder: ["stone", "wood", "bars"],

    /** Market Resources trades bought by assigned Traders. Order drives round-robin. */
    marketTradesOrder: ["fertilizer", "coal", "soap", "towels", "driedNoodles"],
    marketTrades: {
        fertilizer: {
            key: "fertilizer",
            name: "Fertilizer",
            creditCost: 50,
            seconds: 30,
            yieldAmount: 100,
            note: "Bamboo grows twice as fast while fertilizer is available."
        },
        coal: {
            key: "coal",
            name: "Coal",
            creditCost: 100,
            seconds: 30,
            yieldAmount: 20,
            note: "Bonfire carriers bring coal before wood; each coal gives 5x the heat."
        },
        soap: {
            key: "soap",
            name: "Soap",
            creditCost: 100,
            seconds: 30,
            yieldAmount: 10,
            note: "A hot bath uses one soap to double its Star Bead bonus (30% becomes 60%)."
        },
        towels: {
            key: "towels",
            name: "Towels",
            creditCost: 200,
            seconds: 30,
            yieldAmount: 5,
            minMarketLevel: 2,
            note: "A hot bath uses one towel for +100 restfulness."
        },
        driedNoodles: {
            key: "driedNoodles",
            name: "Dried Noodles",
            creditCost: 100,
            seconds: 30,
            yieldAmount: 10,
            requiresBuilding: "noodleBar",
            note: "Guests eat these at the Noodle Bar."
        }
    },

    /** Base mana capacity before Expand Orb multipliers and battle bonuses. */
    manaBaseCapacity: 1000,
    manaCapacityBonusPerCloneDispersal: 10,

    resourceIconHtml: function(key) {
        const src = key === "starBeads" ? "img/starBead.svg"
            : key === "kitsune" ? "img/foxWorker.svg"
            : key === "wood" ? "img/wood.svg"
            : key === "stone" ? "img/stone.svg"
            : key === "ore" ? "img/ore.svg"
            : key === "bars" ? "img/bars.svg"
            : key === "mana" ? "img/mana.svg"
            : key === "credit" ? "img/credit.svg"
            : "img/coins.svg";
        return `<img class="inline-res-icon" src="${src}" alt="" draggable="false">`;
    },
    insertResourceIcons: function(html) {
        if (html === undefined || html === null || html === "") {
            return html;
        }
        const rules = [
            { re: /\b[Ss]tar [Bb]eads\b/g, file: "starBead.svg", key: "starBeads" },
            { re: /\b[Cc]oins\b/g, file: "coins.svg", key: "coins" },
            { re: /\b[Mm]ana\b/g, file: "mana.svg", key: "mana" },
            { re: /\b[Cc]redit\b/g, file: "credit.svg", key: "credit" }
        ];
        const tags = [];
        let s = String(html).replace(/<[^>]*>/g, function(tag) {
            tags.push(tag);
            return "\u0000" + (tags.length - 1) + "\u0000";
        });
        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];
            s = s.replace(rule.re, function(word, offset, whole) {
                const prev = whole.slice(0, offset).match(/\u0000(\d+)\u0000\s*$/);
                if (prev && tags[Number(prev[1])].indexOf(rule.file) !== -1) {
                    return word;
                }
                return resortData.resourceIconHtml(rule.key) + " " + word;
            });
        }
        return s.replace(/\u0000(\d+)\u0000/g, function(_, n) {
            return tags[Number(n)];
        });
    },
    ownedAmountForCostKey: function(key) {
        const base = data.progress && data.progress.base ? data.progress.base : {};
        if (key === "coins") {
            return data.progress.coins || 0;
        }
        if (key === "starBeads") {
            return data.progress.starBeads || 0;
        }
        if (key === "mana") {
            return (data.progress.mana && data.progress.mana.amount) || 0;
        }
        if (key === "wood") {
            return (base.bambooForest && base.bambooForest.wood) || 0;
        }
        if (key === "stone") {
            if (typeof engine !== "undefined" && engine.isStoneCarryUnduplicatedAllowed && !engine.isStoneCarryUnduplicatedAllowed() && engine.getConstructionResourceAvailable) {
                return engine.getConstructionResourceAvailable("stone");
            }
            return typeof engine !== "undefined" && engine.getTotalStone ? engine.getTotalStone() : 0;
        }
        if (key === "ore") {
            return (base.atelier && base.atelier.ore) || 0;
        }
        if (key === "bars") {
            return (base.atelier && base.atelier.bars) || 0;
        }
        if (key === "credit") {
            const credit = (base.market && base.market.credit) || 0;
            return credit + (resortData.coinsCountForCredit() ? (data.progress.coins || 0) : 0);
        }
        if (key === "divinity") {
            return (data.progress.divinity && data.progress.divinity.amount) || 0;
        }
        return 0;
    },
    /** Coins never cover a Credit cost. */
    coinsCountForCredit: function() {
        return false;
    },
    formatCostAmountHtml: function(amount, key, label) {
        const owned = resortData.ownedAmountForCostKey(key);
        let cls = owned >= amount ? " cost-amt-affordable" : "";
        if (key === "mana" && typeof engine !== "undefined" && engine.getManaCapacity && amount > engine.getManaCapacity()) {
            cls = " cost-amt-unaffordable";
        }
        const icon = (key === "coins" || key === "starBeads" || key === "wood" || key === "stone" || key === "ore" || key === "bars" || key === "mana" || key === "credit")
            ? " " + resortData.resourceIconHtml(key)
            : "";
        return `<span class="cost-amt${cls}">${intToStringRound(amount)}</span>${icon} ${label}`;
    },
    formatCollectedPartHtml: function(delivered, required, key, label) {
        const remaining = Math.max(0, required - delivered);
        const owned = resortData.ownedAmountForCostKey(key);
        const cls = owned >= remaining ? " cost-amt-affordable" : "";
        const icon = (key === "wood" || key === "stone" || key === "ore" || key === "bars")
            ? " " + resortData.resourceIconHtml(key)
            : "";
        return `${intToStringRound(delivered)}/<span class="cost-amt${cls}">${intToStringRound(required)}</span>${icon} ${label}`;
    },

    costToParts: function(cost) {
        const c = cost || {};
        const parts = [];
        if ((c.bars || 0) > 0) parts.push(resortData.formatCostAmountHtml(c.bars, "bars", "bars"));
        if ((c.ore || 0) > 0) parts.push(resortData.formatCostAmountHtml(c.ore, "ore", "ore"));
        if ((c.stone || 0) > 0) parts.push(resortData.formatCostAmountHtml(c.stone, "stone", "stone"));
        if ((c.wood || 0) > 0) parts.push(resortData.formatCostAmountHtml(c.wood, "wood", "wood"));
        if ((c.coins || 0) > 0) parts.push(resortData.formatCostAmountHtml(c.coins, "coins", "coins"));
        if ((c.starBeads || 0) > 0) parts.push(resortData.formatCostAmountHtml(c.starBeads, "starBeads", "Star Beads"));
        if ((c.mana || 0) > 0) parts.push(resortData.formatCostAmountHtml(c.mana, "mana", "mana"));
        if ((c.credit || 0) > 0) parts.push(resortData.formatCostAmountHtml(c.credit, "credit", "Credit"));
        if ((c.divinity || 0) > 0) parts.push(resortData.formatCostAmountHtml(c.divinity, "divinity", "divinity"));
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
        const order = resortData.baseBuildingOrder || [];
        const out = [];
        for (let i = 0; i < order.length; i++) {
            const k = order[i];
            const bdef = resortData.buildings[k];
            if (bdef && bdef.constructionCost) {
                out.push(k);
            }
        }
        return out;
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
        const keys = resortData.gatherResourceKeys;
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            const req = site.required[k] || 0;
            total += req;
            done += Math.min(req, (site.delivered && site.delivered[k]) || 0);
        }
        return total > 0 ? Math.round((done / total) * 100) : 0;
    },

    resolveCost: function(def) {
        if (typeof def.getCost === "function") {
            return def.getCost();
        }
        if (def.cost !== undefined) {
            return def.cost;
        }
    },

    buyForFromCost: function(costOrGetter) {
        const c = typeof costOrGetter === "function" ? costOrGetter() : costOrGetter;
        const parts = resortData.costToParts(c);
        if (!parts.length) {
            return "Start upgrade";
        }
        return `Buy for [${parts.join(", ")}]`;
    },

    gatherResourceKeys: ["wood", "stone", "bars", "ore"],

    emptyGatherDelivered: function() {
        const out = {};
        const keys = resortData.gatherResourceKeys;
        for (let i = 0; i < keys.length; i++) {
            out[keys[i]] = 0;
        }
        return out;
    },

    splitGatherWeaveCost: function(cost) {
        const c = cost || {};
        const gather = {};
        const keys = resortData.gatherResourceKeys;
        for (let i = 0; i < keys.length; i++) {
            gather[keys[i]] = c[keys[i]] || 0;
        }
        return {
            gather: gather,
            weave: {
                coins: c.coins || 0,
                starBeads: c.starBeads || 0,
                mana: c.mana || 0,
                credit: c.credit || 0,
                divinity: c.divinity || 0
            }
        };
    },

    hasWeaveCost: function(weaveCost) {
        const w = weaveCost || {};
        return (w.coins || 0) > 0 || (w.starBeads || 0) > 0 || (w.mana || 0) > 0
            || (w.credit || 0) > 0 || (w.divinity || 0) > 0;
    },

    hasGatherCost: function(gatherCost) {
        const g = gatherCost || {};
        const keys = resortData.gatherResourceKeys;
        for (let i = 0; i < keys.length; i++) {
            if ((g[keys[i]] || 0) > 0) {
                return true;
            }
        }
        return false;
    },

    isWeaveOnlyCost: function(cost) {
        const split = resortData.splitGatherWeaveCost(cost);
        return !resortData.hasGatherCost(split.gather) && resortData.hasWeaveCost(split.weave);
    },

    gatherLabelFromCost: function(costOrGetter) {
        const c = typeof costOrGetter === "function" ? costOrGetter() : costOrGetter;
        const parts = resortData.costToParts(c);
        if (!parts.length) {
            return "Start upgrade";
        }
        if (resortData.isWeaveOnlyCost(c)) {
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
            parts.push(resortData.formatCollectedPartHtml(stoneDel, stoneReq, "stone", "stone"));
        }
        if (woodReq > 0) {
            parts.push(resortData.formatCollectedPartHtml(woodDel, woodReq, "wood", "wood"));
        }
        const barsDel = (delivered && delivered.bars) || 0;
        const barsReq = (required && required.bars) || 0;
        if (barsReq > 0) {
            parts.push(resortData.formatCollectedPartHtml(barsDel, barsReq, "bars", "bars"));
        }
        const oreDel = (delivered && delivered.ore) || 0;
        const oreReq = (required && required.ore) || 0;
        if (oreReq > 0) {
            parts.push(resortData.formatCollectedPartHtml(oreDel, oreReq, "ore", "ore"));
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
        }
        if (typeof upgradeDef.extraInfo === "function") {
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
        const creditNeed = c.credit || 0;
        let coinsNeed = c.coins || 0;
        if (creditNeed > 0) {
            const haveCredit = (base.market && base.market.credit) || 0;
            const shortfall = Math.max(0, creditNeed - haveCredit);
            if (shortfall > 0) {
                if (!resortData.coinsCountForCredit()) return false;
                coinsNeed += shortfall;
            }
        }
        if (coinsNeed > data.progress.coins) return false;
        if ((c.starBeads || 0) > (data.progress.starBeads || 0)) return false;
        if ((c.mana || 0) > ((data.progress.mana && data.progress.mana.amount) || 0)) return false;
        if ((c.divinity || 0) > ((data.progress.divinity && data.progress.divinity.amount) || 0)) return false;
        if ((c.wood || 0) > ((base.bambooForest && base.bambooForest.wood) || 0)) return false;
        if ((c.stone || 0) > engine.getTotalStone()) return false;
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
        if ((c.credit || 0) > 0 && base.market) {
            const fromCredit = Math.min(base.market.credit || 0, c.credit);
            base.market.credit = Math.max(0, (base.market.credit || 0) - fromCredit);
            const fromCoins = c.credit - fromCredit;
            if (fromCoins > 0 && resortData.coinsCountForCredit()) {
                data.progress.coins = Math.max(0, data.progress.coins - fromCoins);
            }
        }
        data.progress.starBeads = (data.progress.starBeads || 0) - (c.starBeads || 0);
        if ((c.mana || 0) > 0 && data.progress.mana) {
            data.progress.mana.amount = Math.max(0, (data.progress.mana.amount || 0) - (c.mana || 0));
        }
        if ((c.divinity || 0) > 0 && data.progress.divinity) {
            data.progress.divinity.amount = Math.max(0, (data.progress.divinity.amount || 0) - (c.divinity || 0));
        }
        if ((c.wood || 0) > 0 && base.bambooForest) {
            base.bambooForest.wood = Math.max(0, (base.bambooForest.wood || 0) - (c.wood || 0));
        }
        if ((c.stone || 0) > 0) {
            engine.deductStone(c.stone, { allowUnduplicated: true });
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

    /** Element ids: base_<building>_<suffix>_btn (assign +/++/>>> and unassign -/--/<< for adjustWorkers). Scroll Archives uses the same suffixes. */
    workerAdjustIncrBtnSuffixes: ["assign_one", "assign_ten", "assign_all"],
    workerAdjustDecrBtnSuffixes: ["unassign_one", "unassign_ten", "unassign_all"],

    /** Sites with `assignedWorkers` in saved base state (data-driven worker totals). */
    workerAssignmentSiteKeys: ["torii", "laundry", "bambooForest", "foxDen", "scrollArchives", "bonfire", "cistern", "mage_tower", "market"],

    /** Sites where Okami can be assigned (replaces manual action buttons). */
    okamiAssignableSiteKeys: ["torii", "laundry", "bambooForest", "foxDen", "scrollArchives", "bonfire", "cistern", "mage_tower", "market"],

    defaultWeavingTime: 5,
    defaultWeavingTimeIncrease: 1,

    pathConfig: {
        segmentStep: 38,
        semiCircleSegmentCount: 2,
        okamiTravelSpeed: 70,
        storeRockAmount: 2,
        collectStoneAmount: 4,
        collectStoneDurationMs: 5000,
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
                    description: "Install a railing so the Okami moves 50% faster along this path section. The Okami moves 50% slower coming, to carry the resources.",
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
                        return resortData.canAffordCost(this.getCost());
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
                    description: "Build stairs so the Okami moves another 50% faster along this path section (stacks additively with railing). The Okami moves 50% slower coming, to carry the resources.",
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
                        return resortData.canAffordCost(this.getCost());
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
                        return resortData.canAffordCost(this.getCost());
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
            upgradesOrder: ["callForAlly", "growPlantSpirit", "addQueuePosts", "createEnticingLights", "shinyService", "drinkingBowl", "fillMana"],
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
                        return bought < 8;
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
                        return bought < max;
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
                        return !!(torii && torii.enticingLightsUnlocked) && (torii.queuePostsBought || 0) < 3;
                    },
                    canBuy: function() {
                        const torii = data.progress.base.torii;
                        const bought = torii.queuePostsBought || 0;
                        return bought < 3;
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
                createEnticingLights: {
                    key: "create_enticing_lights",
                    name: "Create Enticing Lights",
                    description: "Light the gate with mana. Uses 10 mana/s to make visitors arrive every 30 seconds instead of 60 while the gate is not full.",
                    getCost: function() {
                        return { wood: 20, mana: 2000 };
                    },
                    weavingTime: 30,
                    canBuy: function() {
                        const torii = data.progress.base.torii;
                        const rh = data.progress.base.foxDen;
                        return !!(torii && !torii.enticingLightsUnlocked && rh && rh.unlocks && rh.unlocks.mage_tower);
                    },
                    onBuy: function() {
                        data.progress.base.torii.enticingLightsUnlocked = true;
                    },
                    rowVisible: function() {
                        const torii = data.progress.base.torii;
                        const rh = data.progress.base.foxDen;
                        return !!(rh && rh.unlocks && rh.unlocks.mage_tower && torii && !torii.enticingLightsUnlocked)
                            && engine.hasManaCapacityForCost(this.getCost());
                    },
                    upgradeSoldOut: function() {
                        return !!(data.progress.base.torii && data.progress.base.torii.enticingLightsUnlocked);
                    },
                    soldOutButtonLabel: "Built"
                },
                shinyService: {
                    key: "shiny_service",
                    name: "Shiny Service",
                    description: "A polished welcome. Workers at the Torii Gate are 25% more effective per purchase.",
                    getCost: function() {
                        const n = (data.progress.base.torii && data.progress.base.torii.shinyServiceBought) || 0;
                        return { coins: Math.round(2000 * Math.pow(2, n)) };
                    },
                    weavingTime: 120,
                    weavingTimeIncreaseAdd: 60,
                    getWeavingPurchaseIndex: function() {
                        return (data.progress.base.torii && data.progress.base.torii.shinyServiceBought) || 0;
                    },
                    canBuy: function() {
                        const torii = data.progress.base.torii;
                        return !!engine.isPondBuiltFromFoxDen() && ((torii && torii.shinyServiceBought) || 0) < 4;
                    },
                    onBuy: function() {
                        const torii = data.progress.base.torii;
                        torii.shinyServiceBought = (torii.shinyServiceBought || 0) + 1;
                    },
                    extraInfo: function() {
                        const n = (data.progress.base.torii && data.progress.base.torii.shinyServiceBought) || 0;
                        return `Torii workers: +${n * 25}%`;
                    },
                    rowVisible: function() {
                        return engine.isPondBuiltFromFoxDen();
                    },
                    upgradeSoldOut: function() {
                        return ((data.progress.base.torii && data.progress.base.torii.shinyServiceBought) || 0) >= 4;
                    },
                    soldOutButtonLabel: "Max service"
                },
                drinkingBowl: {
                    key: "drinking_bowl",
                    name: "Drinking Bowl",
                    description: "Place a drinking bowl at the gate with 200L of water storage. When a visitor countdown finishes with at least 50L and two open spots, two visitors arrive and 50L is spent. Carried water must be at least 26C. Reveals Cistern workers.",
                    cost: { stone: 100, wood: 200 },
                    weavingTime: 120,
                    canBuy: function() {
                        const torii = data.progress.base.torii;
                        return engine.isCisternBuiltFromFoxDen() && !(torii && torii.drinkingBowlUnlocked);
                    },
                    onBuy: function() {
                        data.progress.base.torii.drinkingBowlUnlocked = true;
                    },
                    rowVisible: function() {
                        return engine.isCisternBuiltFromFoxDen();
                    },
                    upgradeSoldOut: function() {
                        return !!(data.progress.base.torii && data.progress.base.torii.drinkingBowlUnlocked);
                    },
                    soldOutButtonLabel: "Bowl placed"
                },
                fillMana: {
                    key: "fill_mana",
                    name: "Fill Mana",
                    description: "Okami channels global mana into the gate reservoir.",
                    directWeave: true,
                    cost: {},
                    canBuy: function() {
                        return engine.canStartFillMana("torii");
                    },
                    onBuy: function() {
                        engine.completeFillMana("torii");
                    },
                    rowVisible: function() {
                        return false;
                    }
                }
            }
        },
        bonfire: {
            label: "Bonfire",
            description: "Stare at the fire and contemplate how to protect what's yours. Unlocks the ability to create clones for mana, to slap enemies into shame and get their coins.",
            mapSlot: { left: "88%", bottom: 12 },
            constructionCost: { wood: 40, stone: 10, mana: 1500 },
            progressDefaults: {
                heat: 0,
                woodCarriers: [],
                carrierIdCounter: 1,
                assignedWorkers: 0,
                autoRetryEnabled: false,
                autoRetryUnlocked: false,
                growthBlessingUnlocked: false,
                plannedGrowthBlessingUnlocked: false,
                fireTendingEnabled: true,
                fireTendingHeatCap: 55,
                stokeFireSpiritBought: 0,
                denseClonesUnlocked: false,
                cloneDensity: 0,
                lingeringDensityUnlocked: false,
                tendTheFlameUnlocked: false,
                applyLiveSettingsToNextClone: false,
                startWithFullManaUnlocked: false,
                startWithFullManaEnabled: false
            },
            upgradesOrder: ["tendTheFlame", "autoRetry", "denseClones", "lingeringDensity", "growthBlessing", "plannedGrowthBlessing", "stokeFireSpirit", "startWithFullMana"],
            upgrades: {
                tendTheFlame: {
                    key: "tend_the_flame",
                    name: "Tend the Flame",
                    description: "Reveal the Bonfire worker area so Kitsune and the Okami can be assigned to burn wood for mana regen.",
                    cost: { mana: 5000, coins: 1000 },
                    weavingTime: 120,
                    canBuy: function() {
                        return !data.progress.base.bonfire.tendTheFlameUnlocked;
                    },
                    onBuy: function() {
                        data.progress.base.bonfire.tendTheFlameUnlocked = true;
                    },
                    extraInfo: function() {
                        return "";
                    },
                    rowVisible: function() {
                        return !data.progress.base.bonfire.tendTheFlameUnlocked
                            && engine.hasManaCapacityForCost(this.cost);
                    },
                    upgradeSoldOut: function() {
                        return !!data.progress.base.bonfire.tendTheFlameUnlocked;
                    },
                    soldOutButtonLabel: "Tended"
                },
                autoRetry: {
                    key: "retry",
                    name: "Automatic Retry",
                    description: "Automatically try again after death if you can afford the clone mana cost. Stops after it cannot start a clone again.",
                    cost: { starBeads: 600, coins: 50 },
                    weavingTime: 60,
                    canBuy: function() {
                        return !data.progress.base.bonfire.autoRetryUnlocked;
                    },
                    onBuy: function() {
                        const b = data.progress.base.bonfire;
                        b.autoRetryUnlocked = true;
                        b.autoRetryEnabled = true;
                        if (data.battle && (data.battle.state === "dead" || data.battle.state === "completed")) {
                            data.progress.autoRetryCountdownSec = data.battle.state === "completed" ? 5 : 10;
                        }
                    },
                    extraInfo: function() {
                        return "";
                    },
                    rowVisible: function() {
                        return !data.progress.base.bonfire.autoRetryUnlocked;
                    },
                    upgradeSoldOut: function() {
                        return !!data.progress.base.bonfire.autoRetryUnlocked;
                    },
                    soldOutButtonLabel: "Enabled"
                },
                denseClones: {
                    key: "dense_clones",
                    name: "Dense Clones",
                    description: "Unlock clone density. Each density level adds 500 mana to the clone's base cost and +10% base Aud and ego damage.",
                    cost: { mana: 3000, starBeads: 2500 },
                    weavingTime: 120,
                    canBuy: function() {
                        return !data.progress.base.bonfire.denseClonesUnlocked;
                    },
                    onBuy: function() {
                        data.progress.base.bonfire.denseClonesUnlocked = true;
                    },
                    extraInfo: function() {
                        return "";
                    },
                    rowVisible: function() {
                        return !data.progress.base.bonfire.denseClonesUnlocked
                            && engine.hasManaCapacityForCost(this.cost);
                    },
                    upgradeSoldOut: function() {
                        return !!data.progress.base.bonfire.denseClonesUnlocked;
                    },
                    soldOutButtonLabel: "Unlocked"
                },
                lingeringDensity: {
                    key: "lingering_density",
                    name: "Lingering Density",
                    description: "When a clone disperses, base mana gained is 10 plus its density level.",
                    cost: { mana: 3000, coins: 500 },
                    weavingTime: 120,
                    canBuy: function() {
                        const b = data.progress.base.bonfire;
                        return !!(b && b.denseClonesUnlocked && !b.lingeringDensityUnlocked);
                    },
                    onBuy: function() {
                        data.progress.base.bonfire.lingeringDensityUnlocked = true;
                    },
                    extraInfo: function() {
                        return "";
                    },
                    rowVisible: function() {
                        const b = data.progress.base.bonfire;
                        return !!(b && b.denseClonesUnlocked && !b.lingeringDensityUnlocked)
                            && engine.hasManaCapacityForCost(this.cost);
                    },
                    upgradeSoldOut: function() {
                        return !!data.progress.base.bonfire.lingeringDensityUnlocked;
                    },
                    soldOutButtonLabel: "Lingering"
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
                    cost: { coins: 1000 },
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
                        const mult = Math.pow(5, n);
                        return { wood: 1000 * mult, bars: 100 * mult };
                    },
                    weavingTime: 180,
                    weavingTimeIncrease: 2,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.bonfire.stokeFireSpiritBought || 0;
                    },
                    canBuy: function() {
                        const bf = data.progress.base.bonfire;
                        const n = bf && bf.stokeFireSpiritBought ? bf.stokeFireSpiritBought : 0;
                        return engine.isAtelierForgeBuilt() && n < 2;
                    },
                    onBuy: function() {
                        const bf = data.progress.base.bonfire;
                        bf.stokeFireSpiritBought = (bf.stokeFireSpiritBought || 0) + 1;
                        engine.createStokeFireSpirit();
                    },
                    maxPurchases: 2,
                    upgradeSoldOut: function() {
                        return (data.progress.base.bonfire.stokeFireSpiritBought || 0) >= 2;
                    },
                    soldOutButtonLabel: "Max stoked",
                    rowVisible: function() {
                        const bf = data.progress.base.bonfire;
                        return engine.isAtelierForgeBuilt() && (bf.stokeFireSpiritBought || 0) < 2;
                    }
                },
                startWithFullMana: {
                    key: "start_with_full_mana",
                    name: "Start When Full Mana",
                    description: "Adds an option to automatically retry creating a clone with the same clone settings whenever mana is full.",
                    cost: { mana: 2000, starBeads: 1000 },
                    weavingTime: 60,
                    canBuy: function() {
                        return !data.progress.base.bonfire.startWithFullManaUnlocked;
                    },
                    onBuy: function() {
                        const b = data.progress.base.bonfire;
                        b.startWithFullManaUnlocked = true;
                        b.startWithFullManaEnabled = true;
                        engine.tryStartWhenFullMana();
                    },
                    rowVisible: function() {
                        return !data.progress.base.bonfire.startWithFullManaUnlocked
                            && engine.hasManaCapacityForCost(this.cost);
                    },
                    upgradeSoldOut: function() {
                        return !!data.progress.base.bonfire.startWithFullManaUnlocked;
                    },
                    soldOutButtonLabel: "Unlocked"
                }
            }
        },

        foxDen: {
            label: "Fox Den",
            description: "Plan and build resort structures with gathered wood and stone.",
            progressDefaults: {
                assignedWorkers: 0
            }
        },

        bambooForest: {
            label: "Bamboo Forest",
            description: "Cut bamboo for construction wood.",
            progressDefaults: {
                assignedWorkers: 0,
                workerPower: 0,
                wood: 0,
                chips: 0,
                rowCount: 3,
                stalkCount: 4,
                activeHarvestStalk: null,
                autoRotateHarvest: false,
                stalks: null,
                water: 0,
                infuseSoilBought: 0
            },
            upgradesOrder: ["infuseSoil"],
            upgrades: {
                infuseSoil: {
                    key: "infuse_soil",
                    name: "Infuse Soil with mana",
                    description: "Infuse the grove with mana, increasing total chips by +20%. Each further purchase adds 5% more than the last.",
                    getCost: function() {
                        const n = data.progress.base.bambooForest.infuseSoilBought || 0;
                        return { mana: Math.round(1200 * Math.pow(1.5, n)) };
                    },
                    weavingTime: 20,
                    weavingTimeIncreaseAdd: 10,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.bambooForest.infuseSoilBought || 0;
                    },
                    canBuy: function() {
                        return engine.isManaUnlocked();
                    },
                    onBuy: function() {
                        data.progress.base.bambooForest.infuseSoilBought = (data.progress.base.bambooForest.infuseSoilBought || 0) + 1;
                    },
                    extraInfo: function() {
                        const n = data.progress.base.bambooForest.infuseSoilBought || 0;
                        const nextAdd = 20 + n * 5;
                        const pct = Math.round((engine.getBambooInfuseSoilMultiplier() - 1) * 100);
                        return `Total chips: +${pct}% (x${round2(engine.getBambooInfuseSoilMultiplier())}). Next: +${nextAdd}%`;
                    },
                    rowVisible: function() {
                        const n = data.progress.base.bambooForest.infuseSoilBought || 0;
                        return engine.isManaUnlocked()
                            && (n > 0 || engine.hasManaCapacityForCost(this.getCost()));
                    }
                }
            }
        },

        cistern: {
            label: "Cistern",
            description: "A place to collect water from droplets. Enables buying water spirits",
            mapSlot: { left: "80%", bottom: 290 },
            constructionCost: { wood: 0, stone: 100 },
            progressDefaults: {
                capacityBought: 0,
                reinforceToriiCapacityBought: 0,
                reinforceOnsenCapacityBought: 0,
                reinforceNoodleCapacityBought: 0,
                replaceWithHotterWater: false,
                refuseIncomingWater: false,
                waterSpiritsUsePathSpeed: true,
                assignedWorkers: 0,
                waterCarriers: [],
                carrierIdCounter: 1,
                wishingWellBought: 0
            },
            upgradesOrder: ["increaseCapacity", "reinforceToriiCapacity", "reinforceOnsenCapacity", "reinforceNoodleCapacity", "buildWishingWell"],
            upgrades: {
                increaseCapacity: {
                    key: "increase_capacity",
                    name: "Increase Capacity",
                    description: "Increases cistern maximum capacity (scaling per upgrade).",
                    getCost: function() {
                        const bought = (data.progress.base.cistern.capacityBought || 0);
                        const mult = Math.pow(1.5, bought);
                        return { stone: Math.round(50 * mult) };
                    },
                    weavingTime: 60,
                    weavingTimeIncreaseAdd: 60,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.cistern.capacityBought || 0;
                    },
                    canBuy: function() {
                        return engine.isInnOnsenConverted() && (data.progress.base.cistern.capacityBought || 0) < 99;
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
                        return engine.isInnOnsenConverted() && (data.progress.base.cistern.capacityBought || 0) < 99;
                    },
                    extraInfo: function() {
                        const bought = data.progress.base.cistern.capacityBought || 0;
                        const nextN = bought + 1;
                        const addL = 10 * nextN * (nextN + 1) / 2;
                        const nextMax = engine.getCisternMaxCapacity() + addL;
                        return `Next: +${intToStringRound(addL)}L → ${round2(nextMax)}L max`;
                    }
                },
                reinforceToriiCapacity: {
                    key: "reinforce_torii_capacity",
                    name: "Reinforce Torii Gate's Capacity",
                    description: "Reinforce the Torii drinking bowl. Each purchase adds +700L hot water capacity (up to 4 times).",
                    getCost: function() {
                        const n = (data.progress.base.cistern.reinforceToriiCapacityBought || 0);
                        const mult = Math.pow(1.2, n);
                        return {
                            mana: Math.round(50000 * mult),
                            wood: Math.round(500 * mult),
                            stone: Math.round(250 * mult)
                        };
                    },
                    weavingTime: 240,
                    weavingTimeIncreaseAdd: 120,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.cistern.reinforceToriiCapacityBought || 0;
                    },
                    canBuy: function() {
                        return engine.isToriiDrinkingBowlUnlocked()
                            && (data.progress.base.cistern.reinforceToriiCapacityBought || 0) < 4;
                    },
                    onBuy: function() {
                        data.progress.base.cistern.reinforceToriiCapacityBought =
                            (data.progress.base.cistern.reinforceToriiCapacityBought || 0) + 1;
                    },
                    maxPurchases: 4,
                    upgradeSoldOut: function() {
                        return (data.progress.base.cistern.reinforceToriiCapacityBought || 0) >= 4;
                    },
                    soldOutButtonLabel: "Max reinforced",
                    rowVisible: function() {
                        return engine.isToriiDrinkingBowlUnlocked()
                            && (data.progress.base.cistern.reinforceToriiCapacityBought || 0) < 4;
                    },
                    extraInfo: function() {
                        return "Next: +700L";
                    }
                },
                reinforceOnsenCapacity: {
                    key: "reinforce_onsen_capacity",
                    name: "Reinforce Tatami Onsen's Capacity",
                    description: "Reinforce the Onsen reservoir. Each purchase adds +1000L hot water capacity (up to 4 times).",
                    getCost: function() {
                        const n = (data.progress.base.cistern.reinforceOnsenCapacityBought || 0);
                        const mult = Math.pow(1.2, n);
                        return {
                            mana: Math.round(60000 * mult),
                            wood: Math.round(600 * mult),
                            stone: Math.round(300 * mult)
                        };
                    },
                    weavingTime: 300,
                    weavingTimeIncreaseAdd: 150,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.cistern.reinforceOnsenCapacityBought || 0;
                    },
                    canBuy: function() {
                        return engine.isInnOnsenConverted()
                            && (data.progress.base.cistern.reinforceOnsenCapacityBought || 0) < 4;
                    },
                    onBuy: function() {
                        data.progress.base.cistern.reinforceOnsenCapacityBought =
                            (data.progress.base.cistern.reinforceOnsenCapacityBought || 0) + 1;
                    },
                    maxPurchases: 4,
                    upgradeSoldOut: function() {
                        return (data.progress.base.cistern.reinforceOnsenCapacityBought || 0) >= 4;
                    },
                    soldOutButtonLabel: "Max reinforced",
                    rowVisible: function() {
                        return engine.isInnOnsenConverted()
                            && (data.progress.base.cistern.reinforceOnsenCapacityBought || 0) < 4;
                    },
                    extraInfo: function() {
                        return "Next: +1000L";
                    }
                },
                reinforceNoodleCapacity: {
                    key: "reinforce_noodle_capacity",
                    name: "Reinforce Noodle Bar's Capacity",
                    description: "Reinforce the Noodle Bar kettle. Each purchase adds +1500L hot water capacity (up to 4 times).",
                    getCost: function() {
                        const n = (data.progress.base.cistern.reinforceNoodleCapacityBought || 0);
                        const mult = Math.pow(1.2, n);
                        return {
                            mana: Math.round(75000 * mult),
                            wood: Math.round(800 * mult),
                            stone: Math.round(400 * mult)
                        };
                    },
                    weavingTime: 360,
                    weavingTimeIncreaseAdd: 180,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.cistern.reinforceNoodleCapacityBought || 0;
                    },
                    canBuy: function() {
                        return engine.isNoodleBarBuilt()
                            && (data.progress.base.cistern.reinforceNoodleCapacityBought || 0) < 4;
                    },
                    onBuy: function() {
                        data.progress.base.cistern.reinforceNoodleCapacityBought =
                            (data.progress.base.cistern.reinforceNoodleCapacityBought || 0) + 1;
                    },
                    maxPurchases: 4,
                    upgradeSoldOut: function() {
                        return (data.progress.base.cistern.reinforceNoodleCapacityBought || 0) >= 4;
                    },
                    soldOutButtonLabel: "Max reinforced",
                    rowVisible: function() {
                        return engine.isNoodleBarBuilt()
                            && (data.progress.base.cistern.reinforceNoodleCapacityBought || 0) < 4;
                    },
                    extraInfo: function() {
                        return "Next: +1500L";
                    }
                },
                buildWishingWell: {
                    key: "build_wishing_well",
                    name: "Build Wishing Well",
                    description: "Each purchase summons a water spirit. The first grants +0.1 coins/s; the second grants +1 coins/s.",
                    getCost: function() {
                        const bought = (data.progress.base.cistern.wishingWellBought || 0);
                        const mult = Math.pow(5, bought);
                        return { coins: 2000 * mult, stone: 300 * mult };
                    },
                    weavingTime: 200,
                    weavingTimeIncreaseAdd: 100,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.cistern.wishingWellBought || 0;
                    },
                    canBuy: function() {
                        const cistern = data.progress.base.cistern;
                        const bought = (cistern && cistern.wishingWellBought) || 0;
                        if (!engine.isCisternBuiltFromFoxDen() || bought >= 2) {
                            return false;
                        }
                        return !!engine.findWaterSpiritPlacementSlot();
                    },
                    onBuy: function() {
                        const cistern = data.progress.base.cistern;
                        cistern.wishingWellBought = (cistern.wishingWellBought || 0) + 1;
                        engine.assembleWaterSpiritFromWishingWell();
                    },
                    maxPurchases: 2,
                    upgradeSoldOut: function() {
                        return ((data.progress.base.cistern && data.progress.base.cistern.wishingWellBought) || 0) >= 2;
                    },
                    soldOutButtonLabel: "Well built",
                    rowVisible: function() {
                        const cistern = data.progress.base.cistern;
                        const bought = (cistern && cistern.wishingWellBought) || 0;
                        if (!engine.isCisternBuiltFromFoxDen() || bought >= 2) {
                            return false;
                        }
                        return !!engine.findWaterSpiritPlacementSlot();
                    },
                    extraInfo: function() {
                        const bought = (data.progress.base.cistern.wishingWellBought || 0);
                        const rate = engine.getWishingWellCoinRate();
                        const nextAdd = bought <= 0 ? 0.1 : 1;
                        return `Coins: +${rate.toFixed(1)}/s. Next: +${nextAdd}/s`;
                    }
                }
            }
        },

        pond: {
            label: "Pond",
            description: "Overflow basin for extra water; water spirits can play here, and excess water goes to the Bamboo Forest for faster tree growth.",
            mapSlot: { left: "66%", bottom: 270 },
            constructionCost: { wood: 400, stone: 300 },
            progressDefaults: {
                waterVolume: 0,
                wishingWellBought: 0
            },
            upgradesOrder: ["buildWishingWell"],
            upgrades: {
                buildWishingWell: {
                    key: "build_wishing_well",
                    name: "Build Water Pump",
                    description: "First purchase adds +1 L/s to the Pond. Second purchase raises the pump to +5 L/s.",
                    getCost: function() {
                        const bought = (data.progress.base.pond.wishingWellBought || 0);
                        if (bought <= 0) {
                            return { coins: 5000, stone: 500 };
                        }
                        return { coins:25000, stone: 2500 };
                    },
                    weavingTime: 200,
                    weavingTimeIncrease: 3,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.pond.wishingWellBought || 0;
                    },
                    canBuy: function() {
                        const pond = data.progress.base.pond;
                        const bought = pond.wishingWellBought || 0;
                        return engine.isPondBuiltFromFoxDen() && bought < 2;
                    },
                    onBuy: function() {
                        const pond = data.progress.base.pond;
                        pond.wishingWellBought = (pond.wishingWellBought || 0) + 1;
                    },
                    getMaxPurchases: function() {
                        return 2;
                    },
                    upgradeSoldOut: function() {
                        return (data.progress.base.pond.wishingWellBought || 0) >= 2;
                    },
                    soldOutButtonLabel: "Pump built",
                    rowVisible: function() {
                        const pond = data.progress.base.pond;
                        const bought = pond.wishingWellBought || 0;
                        return engine.isPondBuiltFromFoxDen() && bought < 2;
                    }
                }
            }
        },

        hiddenSpring: {
            label: "Hidden Spring",
            description: "A quiet spring above the resort where spirits gather.",
            upgradesOrder: ["assembleEarthSpirit", "expandPebbleCapacity", "learnTheBestStones", "gatherWaterSpirit", "carryingCapacity", "bringOreToAtelier", "sparkFireSpirit", "createSpiritTrainingSpot", "fillMana"],
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
                        return { starBeads: 500 * Math.pow(10, bought) };
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
                        return { starBeads: 8000 * Math.pow(10, bought) };
                    },
                    weavingTime: 120,
                    weavingTimeIncrease: 3,
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
                learnTheBestStones: {
                    key: "learn_the_best_stones",
                    name: "Learn the Best Stones",
                    description: "Okami collects 4 + total earth spirit level stone per Hidden Spring trip.",
                    cost: { starBeads: 6000 },
                    weavingTime: 90,
                    canBuy: function() {
                        const hs = data.progress.base.hiddenSpring;
                        return !!(hs && (hs.earthSpiritsBought || 0) >= 1 && !hs.learnTheBestStonesUnlocked);
                    },
                    onBuy: function() {
                        data.progress.base.hiddenSpring.learnTheBestStonesUnlocked = true;
                    },
                    extraInfo: function() {
                        return "Collect 4 + total earth spirit level";
                    },
                    rowVisible: function() {
                        const hs = data.progress.base.hiddenSpring;
                        return !!(hs && (hs.earthSpiritsBought || 0) >= 1 && !hs.learnTheBestStonesUnlocked);
                    },
                    upgradeSoldOut: function() {
                        return !!(data.progress.base.hiddenSpring && data.progress.base.hiddenSpring.learnTheBestStonesUnlocked);
                    },
                    soldOutButtonLabel: "Learned"
                },
                gatherWaterSpirit: {
                    key: "waterSpirit",
                    name: "Gather Water Spirit",
                    description: "Summon a water spirit for the Hidden Spring (or Pond if the spring is full).",
                    weavingTime: 90,
                    weavingTimeIncrease: 3,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.hiddenSpring.waterSpiritsBought || 0;
                    },
                    getCost: function() {
                        const bought = data.progress.base.hiddenSpring.waterSpiritsBought || 0;
                        return { starBeads: 3000 * Math.pow(10, bought) };
                    },
                    canBuy: function() {
                        if (!engine.isCisternBuiltFromFoxDen()) {
                            return false;
                        }
                        const hs = data.progress.base.hiddenSpring;
                        return !!(hs && (hs.waterSpiritsBought || 0) < engine.getHiddenSpringSpiritSlotMax()
                            && engine.findSpiritPlacementSlot("water"));
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
                    name: "Encourage Water Tension",
                    description: "Water spirits carry more water per droplet (×1.5 per upgrade).",
                    getCost: function() {
                        const bought = data.progress.base.hiddenSpring.carryingCapacityBought || 0;
                        return { starBeads: 50000 * Math.pow(5, bought) };
                    },
                    weavingTime: 300,
                    weavingTimeIncreaseAdd: 3,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.hiddenSpring.carryingCapacityBought || 0;
                    },
                    canBuy: function() {
                        const hs = data.progress.base.hiddenSpring;
                        return !!(hs && (hs.waterSpiritsBought || 0) >= 1
                            && (hs.carryingCapacityBought || 0) < 4);
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
                        return !!(hs && hs.oreMined && !hs.bringOreToAtelierUnlocked);
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
                    weavingTime: 90,
                    weavingTimeIncrease: 3,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.hiddenSpring.fireSpiritsBought || 0;
                    },
                    getCost: function() {
                        const bought = data.progress.base.hiddenSpring.fireSpiritsBought || 0;
                        return { starBeads: 4000 * Math.pow(10, bought) };
                    },
                    canBuy: function() {
                        const hs = data.progress.base.hiddenSpring;
                        return !!(hs && hs.bringOreToAtelierUnlocked
                            && (hs.fireSpiritsBought || 0) < 4
                            && engine.findSpiritPlacementSlot("fire"));
                    },
                    onBuy: function() {
                        engine.assembleSpiritFromPurchase("fire");
                    },
                    getMaxPurchases: function() {
                        return 4;
                    },
                    rowVisible: function() {
                        const hs = data.progress.base.hiddenSpring;
                        return !!(hs && hs.bringOreToAtelierUnlocked
                            && (hs.fireSpiritsBought || 0) < 4);
                    },
                    upgradeSoldOut: function() {
                        const hs = data.progress.base.hiddenSpring;
                        return (hs.fireSpiritsBought || 0) >= 4;
                    },
                    soldOutButtonLabel: "Max sparked"
                },
                createSpiritTrainingSpot: {
                    key: "spirit_training_spot",
                    name: "Create Spirit Training Spot",
                    description: "Reveal a spirit slot for any spirit, allowing it to train using Hidden Spring mana for a permanent spirit power bonus.",
                    cost: { mana: 12000, starBeads: 20000, coins: 8000 },
                    weavingTime: 240,
                    weavingTimeIncrease: 1,
                    canBuy: function() {
                        const hs = data.progress.base.hiddenSpring;
                        return !!(engine.isManaUnlocked() && hs && (hs.fireSpiritsBought || 0) >= 1
                            && !hs.spiritTrainingSpotBought);
                    },
                    onBuy: function() {
                        data.progress.base.hiddenSpring.spiritTrainingSpotBought = true;
                    },
                    rowVisible: function() {
                        const hs = data.progress.base.hiddenSpring;
                        return !!(engine.isManaUnlocked() && hs && (hs.fireSpiritsBought || 0) >= 1
                            && !hs.spiritTrainingSpotBought)
                            && engine.hasManaCapacityForCost(this.cost);
                    },
                    upgradeSoldOut: function() {
                        return !!(data.progress.base.hiddenSpring && data.progress.base.hiddenSpring.spiritTrainingSpotBought);
                    },
                    soldOutButtonLabel: "Created"
                },
                fillMana: {
                    key: "fill_mana",
                    name: "Send Mana Clone",
                    description: "Send a mana clone up the mountain to deposit mana at the Hidden Spring.",
                    directWeave: true,
                    cost: {},
                    canBuy: function() {
                        return engine.canStartFillMana("hiddenSpring");
                    },
                    onBuy: function() {
                        engine.completeFillMana("hiddenSpring");
                    },
                    rowVisible: function() {
                        return false;
                    }
                }
            }
        },

        mine: {
            label: "Mine",
            upgradesOrder: ["pebblePay", "formPlayPit"],
            upgrades: {
                pebblePay: {
                    key: "pebble_pay",
                    name: "Pebble Pay",
                    description: "Earth spirits pack their pebbles tighter. Each purchase raises a pebble's carry capacity by 20%, rounded up.",
                    getCost: function() {
                        const n = engine.getPebblePayBought();
                        return { coins: Math.round(4000 * Math.pow(1.5, n)) };
                    },
                    weavingTime: 240,
                    weavingTimeIncreaseAdd: 120,
                    getWeavingPurchaseIndex: function() {
                        return engine.getPebblePayBought();
                    },
                    canBuy: function() {
                        return engine.getPebblePayBought() < 5;
                    },
                    onBuy: function() {
                        data.progress.base.mine.pebblePayBought = engine.getPebblePayBought() + 1;
                    },
                    extraInfo: function() {
                        return `Pebble stone and ore: +${engine.getPebblePayBought() * 20}%`;
                    },
                    rowVisible: function() {
                        const hs = data.progress.base.hiddenSpring;
                        return !!((hs && hs.earthSpiritsBought) >= 2);
                    },
                    upgradeSoldOut: function() {
                        return engine.getPebblePayBought() >= 5;
                    },
                    soldOutButtonLabel: "Max pay"
                },
                formPlayPit: {
                    key: "form_play_pit",
                    name: "Form Play Pit",
                    description: "Shape a play pit in the mine. Earth spirits consume more dirt each play cycle. The first purchase adds +20%. Each further purchase adds 5% more than the last.",
                    getCost: function() {
                        const n = engine.getPlayPitBought();
                        const mult = Math.pow(1.5, n);
                        return {
                            mana: Math.round(10000 * mult),
                            starBeads: Math.round(4000 * mult)
                        };
                    },
                    weavingTime: 120,
                    weavingTimeIncreaseAdd: 60,
                    getWeavingPurchaseIndex: function() {
                        return engine.getPlayPitBought();
                    },
                    canBuy: function() {
                        return engine.isManaUnlocked();
                    },
                    onBuy: function() {
                        data.progress.base.mine.playPitBought = engine.getPlayPitBought() + 1;
                    },
                    extraInfo: function() {
                        const n = engine.getPlayPitBought();
                        const nextAdd = 20 + n * 5;
                        const pct = Math.round((engine.getPlayPitDirtMultiplier() - 1) * 100);
                        return `Dirt per play: +${pct}% (x${round2(engine.getPlayPitDirtMultiplier())}). Next: +${nextAdd}%`;
                    },
                    rowVisible: function() {
                        const n = engine.getPlayPitBought();
                        return engine.isManaUnlocked()
                            && (n > 0 || engine.hasManaCapacityForCost(this.getCost()));
                    }
                }
            }
        },

        inn: {
            label: "Tatami Inn",
            description: "Lodging for guests who pass through the torii gate.",
            mapSlot: { left: 140, top: 490 },
            constructionCost: { wood: 4, stone: 6 },
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
                hotWaterCapacity: 500,
                waterCarriers: [],
                carrierIdCounter: 1,
                assignedWorkers: 0,
                mana: 0,
                manaCapacity: 4000,
                gentleLightsUnlocked: false,
                shapedLampsBought: 0
            },
            upgradesOrder: ["addFurniture", "addDecoration", "addRoom", "buildPathToPond", "convertToOnsen", "reinforceJoints", "createGentleLights", "shapedLamps", "fillMana"],
            upgrades: {
                addFurniture: {
                    key: "add_furniture",
                    name: "Add Furniture",
                    description: "Comfortable furnishings let guests rest longer (+3s per upgrade).",
                    getCost: function() {
                        const bought = (data.progress.base.inn.furnitureBought || 0);
                        return { wood: 3 * Math.pow(3, bought) };
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
                    getMaxPurchases: function() {
                        return engine.getInnFurnitureAbsoluteMaxPurchases();
                    },
                    upgradeSoldOut: function() {
                        return (data.progress.base.inn.furnitureBought || 0) >= engine.getInnFurnitureAbsoluteMaxPurchases();
                    },
                    soldOutButtonLabel: "Max furniture",
                    rowVisible: function() {
                        return (data.progress.base.inn.furnitureBought || 0) < engine.getInnFurnitureAbsoluteMaxPurchases();
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
                        return { wood: 800 * Math.pow(2, bought) };
                    },
                    weavingTime: 60,
                    weavingTimeIncrease: 2,
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
                    getMaxPurchases: function() {
                        return engine.getInnAddRoomAbsoluteMaxPurchases();
                    },
                    upgradeSoldOut: function() {
                        return (data.progress.base.inn.addRoomBought || 0) >= engine.getInnAddRoomAbsoluteMaxPurchases();
                    },
                    soldOutButtonLabel: "Max rooms",
                    rowVisible: function() {
                        return engine.isInnOnsenConverted()
                            && (data.progress.base.inn.addRoomBought || 0) < engine.getInnAddRoomAbsoluteMaxPurchases();
                    }
                },
                buildPathToPond: {
                    key: "build_path_to_pond",
                    name: "Build path to pond",
                    description: "Guests can visit the pond to watch water spirits play (when enabled).",
                    cost: { stone: 50 },
                    weavingTime: 90,
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
                        return { bars: 400 * mult, coins: 6000 * mult };
                    },
                    weavingTime: 180,
                    weavingTimeIncrease: 2,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.inn.reinforceJointsBought || 0;
                    },
                    canBuy: function() {
                        return (data.progress.base.inn.reinforceJointsBought || 0) < engine.getInnReinforceJointsMaxPurchases();
                    },
                    onBuy: function() {
                        data.progress.base.inn.reinforceJointsBought = (data.progress.base.inn.reinforceJointsBought || 0) + 1;
                    },
                    getMaxPurchases: function() {
                        return engine.getInnReinforceJointsMaxPurchases();
                    },
                    upgradeSoldOut: function() {
                        return (data.progress.base.inn.reinforceJointsBought || 0) >= engine.getInnReinforceJointsMaxPurchases();
                    },
                    soldOutButtonLabel: "Max reinforced",
                    rowVisible: function() {
                        const inn = data.progress.base.inn;
                        if (!inn || !inn.onsenConverted || !engine.isAtelierForgeBuilt()) {
                            return false;
                        }
                        return (inn.reinforceJointsBought || 0) < engine.getInnReinforceJointsMaxPurchases();
                    }
                },
                convertToOnsen: {
                    key: "convert_to_onsen",
                    name: "Convert to Onsen",
                    description: "Convert the Tatami Inn into a Tatami Onsen with hot bath soaking. Needs hot water. Reveals other upgrades.",
                    cost: { bars: 200, stone: 1000 },
                    weavingTime: 450,
                    canBuy: function() {
                        const inn = data.progress.base.inn;
                        return !!(inn && engine.isAtelierForgeBuilt() && !inn.onsenConverted);
                    },
                    onBuy: function() {
                        const inn = data.progress.base.inn;
                        inn.onsenConverted = true;
                    },
                    rowVisible: function() {
                        const inn = data.progress.base.inn;
                        return !!(inn && engine.isAtelierForgeBuilt() && !inn.onsenConverted);
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
                    description: "Light the inn with soft mana lamps. Uses 5 mana/s per occupied room and grants +2 restfulness/s while mana is available.",
                    getCost: function() {
                        return { wood: 20, mana: 1500 };
                    },
                    weavingTime: 30,
                    canBuy: function() {
                        const inn = data.progress.base.inn;
                        const rh = data.progress.base.foxDen;
                        return !!(inn && !inn.gentleLightsUnlocked && rh && rh.unlocks && rh.unlocks.mage_tower);
                    },
                    onBuy: function() {
                        data.progress.base.inn.gentleLightsUnlocked = true;
                    },
                    rowVisible: function() {
                        const inn = data.progress.base.inn;
                        const rh = data.progress.base.foxDen;
                        return !!(rh && rh.unlocks && rh.unlocks.mage_tower && inn && !inn.gentleLightsUnlocked)
                            && engine.hasManaCapacityForCost(this.getCost());
                    },
                    upgradeSoldOut: function() {
                        return !!(data.progress.base.inn && data.progress.base.inn.gentleLightsUnlocked);
                    },
                    soldOutButtonLabel: "Built"
                },
                shapedLamps: {
                    key: "shaped_lamps",
                    name: "Shaped Lamps",
                    description: "Shape the gentle lights. Each purchase adds +1 restfulness/s to the Gentle Lights effect.",
                    getCost: function() {
                        const bought = (data.progress.base.inn.shapedLampsBought || 0);
                        return { stone: 50 * Math.pow(2, bought) };
                    },
                    weavingTime: 60,
                    weavingTimeIncreaseAdd: 30,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.inn.shapedLampsBought || 0;
                    },
                    canBuy: function() {
                        const inn = data.progress.base.inn;
                        return !!(inn && inn.gentleLightsUnlocked && (inn.shapedLampsBought || 0) < 3);
                    },
                    onBuy: function() {
                        const inn = data.progress.base.inn;
                        inn.shapedLampsBought = (inn.shapedLampsBought || 0) + 1;
                    },
                    maxPurchases: 3,
                    upgradeSoldOut: function() {
                        return ((data.progress.base.inn && data.progress.base.inn.shapedLampsBought) || 0) >= 3;
                    },
                    soldOutButtonLabel: "Max shaped",
                    rowVisible: function() {
                        const inn = data.progress.base.inn;
                        return !!(inn && inn.gentleLightsUnlocked && (inn.shapedLampsBought || 0) < 3);
                    },
                    extraInfo: function() {
                        return `Gentle Lights: +${engine.getInnGentleLightsRestfulnessBonus()} restfulness/s`;
                    }
                },
                fillMana: {
                    key: "fill_mana",
                    name: "Fill Mana",
                    description: "Okami channels global mana into the inn reservoir.",
                    directWeave: true,
                    cost: {},
                    canBuy: function() {
                        return engine.canStartFillMana("inn");
                    },
                    onBuy: function() {
                        engine.completeFillMana("inn");
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
            constructionCost: { wood: 60, stone: 0, coins: 100 },
            progressDefaults: {
                unlockedSkills: {},
                assignedWorkers: 0,
                researchPerWorkerPerSecond: 1,
                researchTaskRequired: 20,
                researchCoinCosts: [20],
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
                        return { coins: 400 * mult, starBeads: 2000 * mult };
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
            progressDefaults: {
                sandalBuilt: false,
                basketsBought: 0,
                bucketsBought: 0,
                improvePathsBought: 0,
                organizeOrdersBought: 0,
                manaStorageCharmsBought: 0,
                betterAxesBought: 0,
                sharperAxesBought: 0,
                magicLoomsBought: 0,
                sprinkleOreBought: 0,
                sprinkleOreOnRoadsBought: 0,
                improveDirtRoadsBought: 0,
                mineshaftBeamsBought: 0,
                largerForgeBought: 0,
                forgeBuilt: false,
                fireLaunchersBought: 0,
                formDirtRoadsUnlocked: false,
                ore: 0,
                bars: 0
            },
            upgradesOrder: ["organizeOrders", "betterAxes", "sharperAxes", "makeBaskets", "makeBuckets", "magicLooms", "createMetalFireLauncher", "formDirtRoads", "manaStorageCharms", "addForge", "largerForge", "sprinkleOre", "sprinkleOreOnRoads", "improveDirtRoads", "mineshaftBeams"],
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
                    weavingTime: 30,
                    weavingTimeIncreaseAdd: 30,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.atelier.magicLoomsBought || 0;
                    },
                    canBuy: function() {
                        return true;
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
                    description: function() {
                        const n = engine.getLargerForgeBought();
                        if (n > 0) {
                            const mult = round2(1 + 0.5 * n);
                            return `Build a forge below the Atelier where fire spirits smelt ceil(√spirit power × ${mult}) ore into bars every 60s, gaining exp equal to bars × 3. Requires Fire Spirit to work.`;
                        }
                        return "Build a forge below the Atelier where fire spirits smelt floor(√spirit power) ore into bars every 60s, gaining exp equal to bars × 3. Requires Fire Spirit to work.";
                    },
                    cost: { stone: 600 },
                    weavingTime: 240,
                    weavingTimeIncrease: 0,
                    canBuy: function() {
                        const a = data.progress.base.atelier;
                        const hs = data.progress.base.hiddenSpring;
                        return !!(a && hs && hs.oreMined && !a.forgeBuilt);
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
                largerForge: {
                    key: "larger_forge",
                    name: "Larger Forge",
                    description: "Widen the forge so fire spirits smelt more ore. Each purchase raises the batch by 50%, rounded up.",
                    getCost: function() {
                        const n = engine.getLargerForgeBought();
                        return { stone: Math.round(4000 * Math.pow(1.5, n)) };
                    },
                    weavingTime: 800,
                    weavingTimeIncreaseAdd: 800,
                    getWeavingPurchaseIndex: function() {
                        return engine.getLargerForgeBought();
                    },
                    maxPurchases: 4,
                    canBuy: function() {
                        return engine.isForgingInstructionsBought() && engine.getLargerForgeBought() < 4;
                    },
                    onBuy: function() {
                        data.progress.base.atelier.largerForgeBought = engine.getLargerForgeBought() + 1;
                    },
                    rowVisible: function() {
                        return engine.isForgingInstructionsBought();
                    },
                    upgradeSoldOut: function() {
                        return engine.getLargerForgeBought() >= 4;
                    },
                    soldOutButtonLabel: "Max forge"
                },
                createMetalFireLauncher: {
                    key: "create_metal_fire_launcher",
                    name: "Create Metal Fire Launcher",
                    description: "Install a fire launcher platform along the path. Each purchase adds one platform (up to 3).",
                    getCost: function() {
                        const n = data.progress.base.atelier.fireLaunchersBought || 0;
                        const mult = Math.pow(2, n);
                        return { bars: 200 * mult };
                    },
                    weavingTime: 150,
                    weavingTimeIncrease: 2,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.atelier.fireLaunchersBought || 0;
                    },
                    canBuy: function() {
                        const a = data.progress.base.atelier;
                        const n = a && a.fireLaunchersBought ? a.fireLaunchersBought : 0;
                        return !!(engine.isInnOnsenConverted() && n < 3);
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
                        return !!(engine.isInnOnsenConverted() && a && (a.fireLaunchersBought || 0) < 3);
                    }
                },
                formDirtRoads: {
                    key: "form_dirt_roads",
                    name: "Form Dirt Roads",
                    description: "Carriers wear dirt roads between buildings. Each progress point is 0.5% faster movespeed. Roads decay 0.5% every 30 seconds.",
                    cost: { mana: 3000, coins: 500 },
                    weavingTime: 90,
                    canBuy: function() {
                        const a = data.progress.base.atelier;
                        const rh = data.progress.base.foxDen;
                        return !!(rh && rh.unlocks && rh.unlocks.mage_tower) && !(a && a.formDirtRoadsUnlocked);
                    },
                    onBuy: function() {
                        data.progress.base.atelier.formDirtRoadsUnlocked = true;
                    },
                    extraInfo: function() {
                        const cap = engine.getDirtRoadMaxProgress();
                        return `Cap: ${cap} progress (+${round1(cap * 0.5)}% speed). Per delivery: ${engine.getDirtRoadProgressPerDelivery()}`;
                    },
                    rowVisible: function() {
                        const a = data.progress.base.atelier;
                        const rh = data.progress.base.foxDen;
                        const formed = !!(a && a.formDirtRoadsUnlocked);
                        return !!(rh && rh.unlocks && rh.unlocks.mage_tower)
                            && (formed || engine.hasManaCapacityForCost(this.cost));
                    },
                    upgradeSoldOut: function() {
                        return !!(data.progress.base.atelier && data.progress.base.atelier.formDirtRoadsUnlocked);
                    },
                    soldOutButtonLabel: "Formed"
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
                    description: "Enchant kitsune baskets to carry +50 mana per trip when delivering mana orders.",
                    getCost: function() {
                        const n = data.progress.base.atelier.manaStorageCharmsBought || 0;
                        const mult = Math.pow(1.5, n);
                        return { mana: 4000 * mult, starBeads: 500 * mult };
                    },
                    weavingTime: 90,
                    weavingTimeIncreaseAdd: 90,
                    maxPurchases: 9,
                    canBuy: function() {
                        const n = data.progress.base.atelier.manaStorageCharmsBought || 0;
                        return n < 9;
                    },
                    onBuy: function() {
                        data.progress.base.atelier.manaStorageCharmsBought = (data.progress.base.atelier.manaStorageCharmsBought || 0) + 1;
                    },
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.atelier.manaStorageCharmsBought || 0;
                    },
                    upgradeSoldOut: function() {
                        return (data.progress.base.atelier.manaStorageCharmsBought || 0) >= 9;
                    },
                    soldOutButtonLabel: "Max charms",
                    rowVisible: function() {
                        const garden = data.progress.base && data.progress.base.garden;
                        const n = data.progress.base.atelier.manaStorageCharmsBought || 0;
                        return !!(garden && garden.arrangementOfManaOrdersUnlocked && n < 9)
                            && (n > 0 || engine.hasManaCapacityForCost(this.getCost()));
                    },
                    extraInfo: function() {
                        const n = data.progress.base.atelier.manaStorageCharmsBought || 0;
                        return `Mana carry: ${resortData.getManaCarryAmount()} (${n}/9)`;
                    }
                },
                makeBaskets: {
                    key: "make_baskets",
                    name: "Attach Baskets to Kitsune Carriers",
                    description: "Create baskets so Fox Den kitsune haul more resource per trip.",
                    getCost: function() {
                        const bought = data.progress.base.atelier.basketsBought || 0;
                        const mult = Math.pow(2, bought);
                        return { mana: 1000 * mult, wood: 20 * mult };
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
                        return `Resource carry: ${cap} per trip (${bought} woven) | Next basket: +${fibonacci(bought)}`;
                    },
                    rowVisible: function() {
                        const bought = data.progress.base.atelier.basketsBought || 0;
                        return engine.isManaUnlocked()
                            && (bought > 0 || engine.hasManaCapacityForCost(this.getCost()));
                    }
                },
                makeBuckets: {
                    key: "make_buckets",
                    name: "Make Buckets",
                    description: "Create buckets so cistern-assigned carriers haul +50L more water per trip.",
                    getCost: function() {
                        const bought = data.progress.base.atelier.bucketsBought || 0;
                        const mult = Math.pow(2, bought);
                        return { bars: 300 * mult };
                    },
                    weavingTime: 120,
                    weavingTimeIncreaseAdd: 120,
                    maxPurchases: 4,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.atelier.bucketsBought || 0;
                    },
                    canBuy: function() {
                        return (data.progress.base.atelier.bucketsBought || 0) < 4;
                    },
                    onBuy: function() {
                        data.progress.base.atelier.bucketsBought = (data.progress.base.atelier.bucketsBought || 0) + 1;
                    },
                    upgradeSoldOut: function() {
                        return (data.progress.base.atelier.bucketsBought || 0) >= 4;
                    },
                    soldOutButtonLabel: "Max buckets",
                    extraInfo: function() {
                        const bought = data.progress.base.atelier.bucketsBought || 0;
                        const cap = resortData.getCisternWaterCarryAmount();
                        return `Cistern water carry: ${cap}L per trip (${bought}/4)`;
                    },
                    rowVisible: function() {
                        return engine.isInnOnsenConverted();
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
                        return (data.progress.base.atelier.betterAxesBought || 0) < 6;
                    },
                    onBuy: function() {
                        data.progress.base.atelier.betterAxesBought = (data.progress.base.atelier.betterAxesBought || 0) + 1;
                    },
                    maxPurchases: 7,
                    upgradeSoldOut: function() {
                        return (data.progress.base.atelier.betterAxesBought || 0) >= 6;
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
                sharperAxes: {
                    key: "sharper_axes",
                    name: "Sharper Axes",
                    description: "Each kitsune chopping bamboo gains +50% chop power per upgrade.",
                    getCost: function() {
                        const n = data.progress.base.atelier.sharperAxesBought || 0;
                        const mult = Math.pow(2, n);
                        return { bars: 200 * mult };
                    },
                    weavingTime: 120,
                    weavingTimeIncreaseAdd: 120,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.atelier.sharperAxesBought || 0;
                    },
                    canBuy: function() {
                        return true;
                    },
                    onBuy: function() {
                        data.progress.base.atelier.sharperAxesBought = (data.progress.base.atelier.sharperAxesBought || 0) + 1;
                    },
                    extraInfo: function() {
                        const n = data.progress.base.atelier.sharperAxesBought || 0;
                        return `+${n * 50}% chop power per kitsune`;
                    },
                    rowVisible: function() {
                        return engine.isAtelierForgeBuilt();
                    }
                },
                sprinkleOre: {
                    key: "sprinkle_ore",
                    name: "Sprinkle Ore on Bamboo",
                    description: "Scatter ore dust through the bamboo forest, multiplying total chips by x1.1 per purchase (compounding), including base chips and plant spirit bonuses.",
                    getCost: function() {
                        const n = data.progress.base.atelier.sprinkleOreBought || 0;
                        const mult = Math.pow(2, n);
                        return { ore: 50 * mult, starBeads: 1000 * mult };
                    },
                    weavingTime: 180,
                    weavingTimeIncreaseAdd: 90,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.atelier.sprinkleOreBought || 0;
                    },
                    canBuy: function() {
                        return true;
                    },
                    onBuy: function() {
                        data.progress.base.atelier.sprinkleOreBought = (data.progress.base.atelier.sprinkleOreBought || 0) + 1;
                        engine.refreshBambooForestBaseChips();
                    },
                    extraInfo: function() {
                        const n = data.progress.base.atelier.sprinkleOreBought || 0;
                        return `Total chips: x${round2(Math.pow(1.1, n))}`;
                    },
                    rowVisible: function() {
                        return engine.isBringOreToAtelierUnlocked();
                    }
                },
                sprinkleOreOnRoads: {
                    key: "sprinkle_ore_on_roads",
                    name: "Sprinkle Ore on Roads",
                    description: "Ore dust packed into the dirt roads. Each carrier delivery adds 2 progress instead of 1.",
                    cost: { ore: 400 },
                    weavingTime: 240,
                    canBuy: function() {
                        const a = data.progress.base.atelier;
                        return !!(a && a.formDirtRoadsUnlocked && engine.isBringOreToAtelierUnlocked() && !a.sprinkleOreOnRoadsBought);
                    },
                    onBuy: function() {
                        data.progress.base.atelier.sprinkleOreOnRoadsBought = 1;
                    },
                    extraInfo: function() {
                        return "Road progress per delivery: 2";
                    },
                    rowVisible: function() {
                        const a = data.progress.base.atelier;
                        return !!(a && a.formDirtRoadsUnlocked && engine.isBringOreToAtelierUnlocked());
                    },
                    upgradeSoldOut: function() {
                        return !!(data.progress.base.atelier && data.progress.base.atelier.sprinkleOreOnRoadsBought);
                    },
                    soldOutButtonLabel: "Sprinkled"
                },
                improveDirtRoads: {
                    key: "improve_dirt_roads",
                    name: "Improve Dirt Roads",
                    description: "Thicker roads hold more progress. +20 maximum road progress per purchase, and speed keeps scaling at 0.5% per progress.",
                    getCost: function() {
                        const n = data.progress.base.atelier.improveDirtRoadsBought || 0;
                        return { ore: Math.round(250 * Math.pow(2, n)) };
                    },
                    weavingTime: 180,
                    weavingTimeIncreaseAdd: 90,
                    getWeavingPurchaseIndex: function() {
                        return data.progress.base.atelier.improveDirtRoadsBought || 0;
                    },
                    canBuy: function() {
                        return (data.progress.base.atelier.improveDirtRoadsBought || 0) < 5;
                    },
                    onBuy: function() {
                        const a = data.progress.base.atelier;
                        a.improveDirtRoadsBought = (a.improveDirtRoadsBought || 0) + 1;
                    },
                    extraInfo: function() {
                        return `Road cap: ${engine.getDirtRoadMaxProgress()}`;
                    },
                    rowVisible: function() {
                        return !!(data.progress.base.atelier && data.progress.base.atelier.sprinkleOreOnRoadsBought);
                    },
                    upgradeSoldOut: function() {
                        return (data.progress.base.atelier.improveDirtRoadsBought || 0) >= 5;
                    },
                    soldOutButtonLabel: "Max roads"
                },
                mineshaftBeams: {
                    key: "mineshaft_beams",
                    name: "Mineshaft Beams",
                    description: "Timber bracing in the mine. Earth spirits assigned there gain +20% spirit power per purchase.",
                    getCost: function() {
                        const n = engine.getMineshaftBeamsBought();
                        return { wood: Math.round(400 * Math.pow(1.5, n)) };
                    },
                    weavingTime: 240,
                    weavingTimeIncreaseAdd: 120,
                    getWeavingPurchaseIndex: function() {
                        return engine.getMineshaftBeamsBought();
                    },
                    canBuy: function() {
                        return engine.getMineshaftBeamsBought() < 5;
                    },
                    onBuy: function() {
                        data.progress.base.atelier.mineshaftBeamsBought = engine.getMineshaftBeamsBought() + 1;
                    },
                    extraInfo: function() {
                        return `Mine spirit power: +${engine.getMineshaftBeamsBought() * 20}%`;
                    },
                    rowVisible: function() {
                        const hs = data.progress.base.hiddenSpring;
                        return !!((hs && hs.earthSpiritsBought) >= 2);
                    },
                    upgradeSoldOut: function() {
                        return engine.getMineshaftBeamsBought() >= 5;
                    },
                    soldOutButtonLabel: "Max beams"
                }
            }
        },

        garden: {
            label: "Rock Garden",
            description: "Automation, so you can go outside.",
            mapSlot: { left: "71%", bottom: 59 },
            constructionCost: { wood: 0, stone: 10 },
            progressDefaults: {
                arrangementOfRemembranceUnlocked: false,
                arrangementOfRotationUnlocked: false,
                arrangementOfAppraisalUnlocked: false,
                arrangementOfReviewUnlocked: false,
                arrangementOfShoppingUnlocked: false,
                arrangementOfFireTendingUnlocked: false,
                arrangementOfTraderResponsibilityUnlocked: false,
                arrangementOfPaperMoneyUnlocked: false,
                arrangementOfHotWaterUnlocked: false,
                arrangementOfThirstUnlocked: false,
                arrangementOfViscosityUnlocked: false,
                arrangementOfTargetPriorityUnlocked: false,
                arrangementOfHeatTargetingUnlocked: false,
                arrangementOfPriorityUnlocked: false,
                arrangementOfDiggingUnlocked: false,
                arrangementOfWaterOrdersUnlocked: false,
                arrangementOfManaOrdersUnlocked: false,
                arrangementOfDoubledStoneUnlocked: false,
                arrangementOfPathMakingUnlocked: false,
                arrangementOfRailingSafetyUnlocked: false,
                arrangementOfStepBuildingUnlocked: false,
                arrangementOfLanternPlacingUnlocked: false,
                autoWeaveOnGatherComplete: true,
                autoWeaveCheapestReady: true,
                autoWeaveIncludePausedWeaves: false,
                smartHarvestUnlocked: false
            },
            introMuted: "Automation for an easy life, so you can go outside.",
            upgradesOrder: ["arrangementOfRotation", "arrangementOfRemembrance", "arrangementOfPathMaking", "arrangementOfAppraisal", "arrangementOfReview",
                "arrangementOfViscosity", "arrangementOfWaterOrders", "arrangementOfDigging",  "arrangementOfShopping",  "arrangementOfHotWater",
                "arrangementOfTargetPriority", "arrangementOfManaOrders", "arrangementOfDoubledStone", "arrangementOfRailingSafety",
                "arrangementOfStepBuilding", "arrangementOfLanternPlacing",
                "arrangementOfFireTending", "arrangementOfPriority", "arrangementOfThirst", "arrangementOfTraderResponsibility",
                "arrangementOfPaperMoney", "arrangementOfHeatTargeting", "smartHarvest"],
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
                    description: "After weaving, the Okami returns to the last place she was a worker. If a path upgrade was interrupted by a weave, she finishes that path upgrade first, then returns to her last building. Interrupting a path upgrade with another path upgrade abandons the old one.",
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
                arrangementOfPathMaking: {
                    key: "arrangement_of_path_making",
                    name: "Arrangement of Path Making",
                    description: "Reveal a Fox Den checkbox. When checked, an Okami assigned to the Fox Den automatically clears the next path with rocks, with higher priority than building.",
                    cost: { stone: 5 },
                    weavingTime: 40,
                    weavingTimeIncrease: 1,
                    canBuy: function() {
                        const g = data.progress.base.garden;
                        return !(g && g.arrangementOfPathMakingUnlocked)
                            && !engine.isMapElementRevealed("hiddenSpring");
                    },
                    onBuy: function() {
                        data.progress.base.garden.arrangementOfPathMakingUnlocked = true;
                        const rh = data.progress.base.foxDen;
                        if (rh) {
                            rh.autoClearPathRocks = true;
                        }
                    },
                    rowVisible: function() {
                        const g = data.progress.base.garden;
                        return !(g && g.arrangementOfPathMakingUnlocked)
                            && !engine.isMapElementRevealed("hiddenSpring");
                    },
                    upgradeSoldOut: function() {
                        const g = data.progress.base.garden;
                        return !!(g && g.arrangementOfPathMakingUnlocked);
                    },
                    soldOutButtonLabel: "Arranged"
                },
                arrangementOfAppraisal: {
                    key: "arrangement_of_appraisal",
                    name: "Arrangement of Appraisal",
                    description: "When an upgrade has gathered all its materials, auto-assign the Okami to weave it, if she is idle or at a building. Does not work on already ready tasks (reveals an Arrangement for that).",
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
                    cost: { stone: 200 },
                    weavingTime: 240,
                    weavingTimeIncrease: 0,
                    canBuy: function() {
                        const g = data.progress.base.garden;
                        const hs = data.progress.base.hiddenSpring;
                        return !!(hs && hs.bringOreToAtelierUnlocked && !(g && g.arrangementOfPriorityUnlocked));
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
                arrangementOfWaterOrders: {
                    key: "arrangement_of_water_orders",
                    name: "Arrangement of Water Orders",
                    description: "Reveal a checkbox on buildings that store hot water. Uncheck it to stop carriers from bringing water there.",
                    cost: { stone: 300 },
                    weavingTime: 240,
                    canBuy: function() {
                        const g = data.progress.base.garden;
                        const rh = data.progress.base.foxDen;
                        const toriiBuilt = !!(rh && rh.unlocks && rh.unlocks.torii);
                        return toriiBuilt && engine.isInnOnsenConverted()
                            && !(g && g.arrangementOfWaterOrdersUnlocked);
                    },
                    onBuy: function() {
                        data.progress.base.garden.arrangementOfWaterOrdersUnlocked = true;
                        const keys = ["inn", "torii", "noodleBar"];
                        for (let i = 0; i < keys.length; i++) {
                            const b = data.progress.base[keys[i]];
                            if (b) {
                                b.allowCarriersBringWater = true;
                            }
                        }
                    },
                    rowVisible: function() {
                        const g = data.progress.base.garden;
                        const rh = data.progress.base.foxDen;
                        const toriiBuilt = !!(rh && rh.unlocks && rh.unlocks.torii);
                        return toriiBuilt && engine.isInnOnsenConverted()
                            && !(g && g.arrangementOfWaterOrdersUnlocked);
                    },
                    upgradeSoldOut: function() {
                        const g = data.progress.base.garden;
                        return !!(g && g.arrangementOfWaterOrdersUnlocked);
                    },
                    soldOutButtonLabel: "Arranged"
                },
                arrangementOfDigging: {
                    key: "arrangement_of_digging",
                    name: "Arrangement of Digging",
                    description: "Reveal a per-earth-spirit checkbox. When checked, earth spirits at Hidden Spring automatically return to the Mine when there is no more stone or ore to send as pebbles.",
                    cost: { stone: 400 },
                    weavingTime: 300,
                    canBuy: function() {
                        const g = data.progress.base.garden;
                        const hs = data.progress.base.hiddenSpring;
                        return !!(hs && (hs.pebbleCapacityBought || 0) >= 1)
                            && !(g && g.arrangementOfDiggingUnlocked);
                    },
                    onBuy: function() {
                        data.progress.base.garden.arrangementOfDiggingUnlocked = true;
                        const spirits = (data.progress.base.hiddenSpring && data.progress.base.hiddenSpring.spirits) || [];
                        for (let i = 0; i < spirits.length; i++) {
                            if (spirits[i].kind === "earth") {
                                spirits[i].autoReturnToMine = true;
                            }
                        }
                    },
                    rowVisible: function() {
                        const g = data.progress.base.garden;
                        const hs = data.progress.base.hiddenSpring;
                        return !!(hs && (hs.pebbleCapacityBought || 0) >= 1)
                            && !(g && g.arrangementOfDiggingUnlocked);
                    },
                    upgradeSoldOut: function() {
                        const g = data.progress.base.garden;
                        return !!(g && g.arrangementOfDiggingUnlocked);
                    },
                    soldOutButtonLabel: "Arranged"
                },
                arrangementOfReview: {
                    key: "arrangement_of_review",
                    name: "Arrangement of Review",
                    description: "Every few seconds, auto-weave any ready upgrade with the shortest weave time.",
                    cost: { stone: 30 },
                    weavingTime: 90,
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
                arrangementOfShopping: {
                    key: "arrangement_of_shopping",
                    name: "Arrangement of Shopping",
                    description: "Reveals a Buyable count in the top right of the resort, showing how many upgrades you can currently afford.",
                    cost: { stone: 45 },
                    weavingTime: 90,
                    weavingTimeIncrease: 1,
                    canBuy: function() {
                        const g = data.progress.base.garden;
                        return !(g && g.arrangementOfShoppingUnlocked);
                    },
                    onBuy: function() {
                        data.progress.base.garden.arrangementOfShoppingUnlocked = true;
                    },
                    rowVisible: function() {
                        const g = data.progress.base.garden;
                        return !(g && g.arrangementOfShoppingUnlocked);
                    },
                    upgradeSoldOut: function() {
                        const g = data.progress.base.garden;
                        return !!(g && g.arrangementOfShoppingUnlocked);
                    },
                    soldOutButtonLabel: "Arranged"
                },
                arrangementOfFireTending: {
                    key: "arrangement_of_fire_tending",
                    name: "Arrangement of Fire Tending",
                    description: "Adds a Bonfire heat cap control. When enabled, carriers only bring wood or coal while heat stays below the set value.",
                    cost: { stone: 200 },
                    weavingTime: 240,
                    weavingTimeIncrease: 1,
                    canBuy: function() {
                        const g = data.progress.base.garden;
                        const bf = data.progress.base.bonfire;
                        return !!(bf && bf.tendTheFlameUnlocked) && !(g && g.arrangementOfFireTendingUnlocked);
                    },
                    onBuy: function() {
                        const g = data.progress.base.garden;
                        g.arrangementOfFireTendingUnlocked = true;
                        const bf = data.progress.base.bonfire;
                        if (bf) {
                            bf.fireTendingEnabled = true;
                            bf.fireTendingHeatCap = 55;
                        }
                    },
                    rowVisible: function() {
                        const g = data.progress.base.garden;
                        const bf = data.progress.base.bonfire;
                        return engine.isBonfireBuiltFromFoxDen()
                            && !!(bf && bf.tendTheFlameUnlocked)
                            && !(g && g.arrangementOfFireTendingUnlocked);
                    },
                    upgradeSoldOut: function() {
                        const g = data.progress.base.garden;
                        return !!(g && g.arrangementOfFireTendingUnlocked);
                    },
                    soldOutButtonLabel: "Arranged"
                },
                arrangementOfTraderResponsibility: {
                    key: "arrangement_of_trader_responsibility",
                    name: "Arrangement of Trader Responsibility",
                    description: "Adds a number input to each Market Resource. Traders only buy a good while its stock is below that number. 0 means no limit.",
                    cost: { stone: 2500 },
                    weavingTime: 900,
                    maxPurchases: 1,
                    canBuy: function() {
                        const g = data.progress.base.garden;
                        return engine.isMarketBuilt() && !(g && g.arrangementOfTraderResponsibilityUnlocked);
                    },
                    onBuy: function() {
                        data.progress.base.garden.arrangementOfTraderResponsibilityUnlocked = true;
                    },
                    rowVisible: function() {
                        const g = data.progress.base.garden;
                        return engine.isMarketBuilt() && !(g && g.arrangementOfTraderResponsibilityUnlocked);
                    },
                    upgradeSoldOut: function() {
                        const g = data.progress.base.garden;
                        return !!(g && g.arrangementOfTraderResponsibilityUnlocked);
                    },
                    soldOutButtonLabel: "Arranged"
                },
                arrangementOfPaperMoney: {
                    key: "arrangement_of_paper_money",
                    name: "Arrangement of Paper Money",
                    description: "Adds a Market checkbox next to Exchange. When checked, Exchange restarts automatically when its weave finishes, until coins run out; then the Okami returns via Arrangement of Remembrance.",
                    cost: { stone: 3000 },
                    weavingTime: 1000,
                    maxPurchases: 1,
                    canBuy: function() {
                        const g = data.progress.base.garden;
                        return engine.isMarketBuilt()
                            && engine.getMarketLevel() >= 2
                            && !(g && g.arrangementOfPaperMoneyUnlocked);
                    },
                    onBuy: function() {
                        data.progress.base.garden.arrangementOfPaperMoneyUnlocked = true;
                        const market = data.progress.base.market;
                        if (market && market.repeatExchangeWhenReady === undefined) {
                            market.repeatExchangeWhenReady = false;
                        }
                    },
                    rowVisible: function() {
                        const g = data.progress.base.garden;
                        return engine.isMarketBuilt()
                            && engine.getMarketLevel() >= 2
                            && !(g && g.arrangementOfPaperMoneyUnlocked);
                    },
                    upgradeSoldOut: function() {
                        const g = data.progress.base.garden;
                        return !!(g && g.arrangementOfPaperMoneyUnlocked);
                    },
                    soldOutButtonLabel: "Arranged"
                },
                arrangementOfHotWater: {
                    key: "arrangement_of_hot_water",
                    name: "Arrangement of Hot Water",
                    description: "Unlocks a Cistern option to replace cooler stored water when hotter droplets arrive, when at max capacity.",
                    cost: { stone: 600 },
                    weavingTime: 400,
                    canBuy: function() {
                        const a = data.progress.base.atelier;
                        const g = data.progress.base.garden;
                        return (a && (a.fireLaunchersBought || 0) >= 1)
                            && !(g && g.arrangementOfHotWaterUnlocked);
                    },
                    onBuy: function() {
                        data.progress.base.garden.arrangementOfHotWaterUnlocked = true;
                    },
                    rowVisible: function() {
                        const a = data.progress.base.atelier;
                        const g = data.progress.base.garden;
                        return (a && (a.fireLaunchersBought || 0) >= 1)
                            && !(g && g.arrangementOfHotWaterUnlocked);
                    },
                    upgradeSoldOut: function() {
                        const g = data.progress.base.garden;
                        return !!(g && g.arrangementOfHotWaterUnlocked);
                    },
                    soldOutButtonLabel: "Arranged"
                },
                arrangementOfThirst: {
                    key: "arrangement_of_thirst",
                    name: "Arrangement of Thirst",
                    description: "Unlocks a Cistern checkbox. While checked, incoming water is dumped to the Pond instead of stored in the Cistern.",
                    cost: { stone: 1500 },
                    weavingTime: 750,
                    canBuy: function() {
                        const g = data.progress.base.garden;
                        return engine.isPondBuiltFromFoxDen() && !(g && g.arrangementOfThirstUnlocked);
                    },
                    onBuy: function() {
                        const g = data.progress.base.garden;
                        g.arrangementOfThirstUnlocked = true;
                        const cistern = data.progress.base.cistern;
                        if (cistern && cistern.refuseIncomingWater === undefined) {
                            cistern.refuseIncomingWater = false;
                        }
                    },
                    rowVisible: function() {
                        const g = data.progress.base.garden;
                        return engine.isPondBuiltFromFoxDen() && !(g && g.arrangementOfThirstUnlocked);
                    },
                    upgradeSoldOut: function() {
                        const g = data.progress.base.garden;
                        return !!(g && g.arrangementOfThirstUnlocked);
                    },
                    soldOutButtonLabel: "Arranged"
                },
                arrangementOfViscosity: {
                    key: "arrangement_of_viscosity",
                    name: "Arrangement of Viscosity",
                    description: "Unlocks a Cistern checkbox to let water spirits use path speed bonuses (Add Lanterns).",
                    cost: { stone: 300 },
                    weavingTime: 240,
                    canBuy: function() {
                        const a = data.progress.base.atelier;
                        const g = data.progress.base.garden;
                        return (a && (a.fireLaunchersBought || 0) >= 1)
                            && !(g && g.arrangementOfViscosityUnlocked);
                    },
                    onBuy: function() {
                        data.progress.base.garden.arrangementOfViscosityUnlocked = true;
                        const cistern = data.progress.base.cistern;
                        if (cistern && cistern.waterSpiritsUsePathSpeed === undefined) {
                            cistern.waterSpiritsUsePathSpeed = true;
                        }
                    },
                    rowVisible: function() {
                        const a = data.progress.base.atelier;
                        const g = data.progress.base.garden;
                        return (a && (a.fireLaunchersBought || 0) >= 1)
                            && !(g && g.arrangementOfViscosityUnlocked);
                    },
                    upgradeSoldOut: function() {
                        const g = data.progress.base.garden;
                        return !!(g && g.arrangementOfViscosityUnlocked);
                    },
                    soldOutButtonLabel: "Arranged"
                },
                arrangementOfTargetPriority: {
                    key: "arrangement_of_target_priority",
                    name: "Arrangement of Target Priority",
                    description: "Adds targeting options to Long-Range and Ember Launchers: Default, Closest, and Furthest Along.",
                    cost: { stone: 1000 },
                    weavingTime: 600,
                    canBuy: function() {
                        const a = data.progress.base.atelier;
                        const g = data.progress.base.garden;
                        return (a && (a.fireLaunchersBought || 0) >= 1)
                            && !(g && g.arrangementOfTargetPriorityUnlocked);
                    },
                    onBuy: function() {
                        data.progress.base.garden.arrangementOfTargetPriorityUnlocked = true;
                    },
                    rowVisible: function() {
                        const a = data.progress.base.atelier;
                        const g = data.progress.base.garden;
                        return (a && (a.fireLaunchersBought || 0) >= 1)
                            && !(g && g.arrangementOfTargetPriorityUnlocked);
                    },
                    upgradeSoldOut: function() {
                        const g = data.progress.base.garden;
                        return !!(g && g.arrangementOfTargetPriorityUnlocked);
                    },
                    soldOutButtonLabel: "Arranged"
                },
                arrangementOfHeatTargeting: {
                    key: "arrangement_of_heat_targeting",
                    name: "Arrangement of Heat Targeting",
                    description: "Adds Coldest and Hottest targeting options to Long-Range and Ember Launchers.",
                    cost: { stone: 3000 },
                    weavingTime: 1000,
                    canBuy: function() {
                        const g = data.progress.base.garden;
                        return !!(g && g.arrangementOfTargetPriorityUnlocked)
                            && !(g && g.arrangementOfHeatTargetingUnlocked);
                    },
                    onBuy: function() {
                        data.progress.base.garden.arrangementOfHeatTargetingUnlocked = true;
                    },
                    rowVisible: function() {
                        const g = data.progress.base.garden;
                        return !!(g && g.arrangementOfTargetPriorityUnlocked)
                            && !(g && g.arrangementOfHeatTargetingUnlocked);
                    },
                    upgradeSoldOut: function() {
                        const g = data.progress.base.garden;
                        return !!(g && g.arrangementOfHeatTargetingUnlocked);
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
                        return engine.isManaUnlocked() && engine.hasManaOrderPrerequisite() && !(g && g.arrangementOfManaOrdersUnlocked);
                    },
                    onBuy: function() {
                        data.progress.base.garden.arrangementOfManaOrdersUnlocked = true;
                        const rh = data.progress.base.foxDen;
                        if (rh) {
                            rh.manaOrdersEnabled = true;
                        }
                        engine.enableCarriersBringManaOnAllBuildings();
                    },
                    rowVisible: function() {
                        const g = data.progress.base.garden;
                        return engine.isManaUnlocked() && engine.hasManaOrderPrerequisite() && !(g && g.arrangementOfManaOrdersUnlocked);
                    },
                    upgradeSoldOut: function() {
                        const g = data.progress.base.garden;
                        return !!(g && g.arrangementOfManaOrdersUnlocked);
                    },
                    soldOutButtonLabel: "Arranged"
                },
                arrangementOfDoubledStone: {
                    key: "arrangement_of_doubled_stone",
                    name: "Arrangement of Stone Selection",
                    description: "Reveal a Stone Pile checkbox to allow or block carriers from taking unduplicated stone.",
                    cost: { stone: 60 },
                    weavingTime: 120,
                    canBuy: function() {
                        const g = data.progress.base.garden;
                        const pile = data.progress.base.stonePile;
                        return !!(pile && pile.stoneDuplicatorUnlocked)
                            && !(g && g.arrangementOfDoubledStoneUnlocked);
                    },
                    onBuy: function() {
                        data.progress.base.garden.arrangementOfDoubledStoneUnlocked = true;
                    },
                    rowVisible: function() {
                        const g = data.progress.base.garden;
                        const pile = data.progress.base.stonePile;
                        return !!(pile && pile.stoneDuplicatorUnlocked) && !(g && g.arrangementOfDoubledStoneUnlocked);
                    },
                    upgradeSoldOut: function() {
                        const g = data.progress.base.garden;
                        return !!(g && g.arrangementOfDoubledStoneUnlocked);
                    },
                    soldOutButtonLabel: "Arranged"
                },
                arrangementOfRailingSafety: {
                    key: "arrangement_of_railing_safety",
                    name: "Arrangement of Railing Safety",
                    description: "Reveal a Fox Den checkbox. When checked, an Okami assigned to the Fox Den automatically adds railings on the next path that needs them, with higher priority than building (after Path Making).",
                    cost: { stone: 20 },
                    weavingTime: 120,
                    weavingTimeIncrease: 1,
                    canBuy: function() {
                        const g = data.progress.base.garden;
                        return engine.isAtelierBuiltFromFoxDen()
                            && !(g && g.arrangementOfRailingSafetyUnlocked)
                            && !engine.allPathSegmentsHaveUpgrade("railing");
                    },
                    onBuy: function() {
                        data.progress.base.garden.arrangementOfRailingSafetyUnlocked = true;
                        const rh = data.progress.base.foxDen;
                        if (rh) {
                            rh.autoAddPathRailings = true;
                        }
                    },
                    rowVisible: function() {
                        const g = data.progress.base.garden;
                        return engine.isAtelierBuiltFromFoxDen()
                            && !(g && g.arrangementOfRailingSafetyUnlocked)
                            && !engine.allPathSegmentsHaveUpgrade("railing");
                    },
                    upgradeSoldOut: function() {
                        const g = data.progress.base.garden;
                        return !!(g && g.arrangementOfRailingSafetyUnlocked);
                    },
                    soldOutButtonLabel: "Arranged"
                },
                arrangementOfStepBuilding: {
                    key: "arrangement_of_step_building",
                    name: "Arrangement of Step Building",
                    description: "Reveal a Fox Den checkbox. When checked, an Okami assigned to the Fox Den automatically adds stairs on the next path that needs them, with higher priority than building (after Railing Safety).",
                    cost: { stone: 40 },
                    weavingTime: 240,
                    weavingTimeIncrease: 1,
                    canBuy: function() {
                        const g = data.progress.base.garden;
                        const railingReady = !!(g && g.arrangementOfRailingSafetyUnlocked)
                            || engine.allPathSegmentsHaveUpgrade("railing");
                        return railingReady
                            && !(g && g.arrangementOfStepBuildingUnlocked)
                            && !engine.allPathSegmentsHaveUpgrade("stairs");
                    },
                    onBuy: function() {
                        data.progress.base.garden.arrangementOfStepBuildingUnlocked = true;
                        const rh = data.progress.base.foxDen;
                        if (rh) {
                            rh.autoAddPathStairs = true;
                        }
                    },
                    rowVisible: function() {
                        const g = data.progress.base.garden;
                        const railingReady = !!(g && g.arrangementOfRailingSafetyUnlocked)
                            || engine.allPathSegmentsHaveUpgrade("railing");
                        return railingReady
                            && !(g && g.arrangementOfStepBuildingUnlocked)
                            && !engine.allPathSegmentsHaveUpgrade("stairs");
                    },
                    upgradeSoldOut: function() {
                        const g = data.progress.base.garden;
                        return !!(g && g.arrangementOfStepBuildingUnlocked);
                    },
                    soldOutButtonLabel: "Arranged"
                },
                arrangementOfLanternPlacing: {
                    key: "arrangement_of_lantern_placing",
                    name: "Arrangement of Lantern Placing",
                    description: "Reveal a Fox Den checkbox. When checked, an Okami assigned to the Fox Den automatically adds lanterns on the next path that needs them, with higher priority than building (after Step Building).",
                    cost: { stone: 80 },
                    weavingTime: 480,
                    weavingTimeIncrease: 1,
                    canBuy: function() {
                        const g = data.progress.base.garden;
                        const stairsReady = !!(g && g.arrangementOfStepBuildingUnlocked)
                            || engine.allPathSegmentsHaveUpgrade("stairs");
                        return stairsReady
                            && !(g && g.arrangementOfLanternPlacingUnlocked)
                            && !engine.allPathSegmentsHaveUpgrade("lanterns");
                    },
                    onBuy: function() {
                        data.progress.base.garden.arrangementOfLanternPlacingUnlocked = true;
                        const rh = data.progress.base.foxDen;
                        if (rh) {
                            rh.autoAddPathLanterns = true;
                        }
                    },
                    rowVisible: function() {
                        const g = data.progress.base.garden;
                        const stairsReady = !!(g && g.arrangementOfStepBuildingUnlocked)
                            || engine.allPathSegmentsHaveUpgrade("stairs");
                        return stairsReady
                            && !(g && g.arrangementOfLanternPlacingUnlocked)
                            && !engine.allPathSegmentsHaveUpgrade("lanterns");
                    },
                    upgradeSoldOut: function() {
                        const g = data.progress.base.garden;
                        return !!(g && g.arrangementOfLanternPlacingUnlocked);
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
            label: "Stone Pile",
            description: "Holds stone.",
            upgradesOrder: ["createStoneDuplicator", "fillMana"],
            upgrades: {
                createStoneDuplicator: {
                    key: "create_stone_duplicator",
                    name: "Create Stone Duplicator",
                    description: "Every 10 seconds, uses 100 mana to turn one unduplicated stone into two duplicated stone.",
                    getCost: function() {
                        return { wood: 20, mana: 1750 };
                    },
                    weavingTime: 30,
                    canBuy: function() {
                        const pile = data.progress.base.stonePile;
                        const rh = data.progress.base.foxDen;
                        return !!(pile && !pile.stoneDuplicatorUnlocked && rh && rh.unlocks && rh.unlocks.mage_tower);
                    },
                    onBuy: function() {
                        data.progress.base.stonePile.stoneDuplicatorUnlocked = true;
                    },
                    rowVisible: function() {
                        const pile = data.progress.base.stonePile;
                        const rh = data.progress.base.foxDen;
                        return !!(rh && rh.unlocks && rh.unlocks.mage_tower && pile && !pile.stoneDuplicatorUnlocked)
                            && engine.hasManaCapacityForCost(this.getCost());
                    },
                    upgradeSoldOut: function() {
                        return !!(data.progress.base.stonePile && data.progress.base.stonePile.stoneDuplicatorUnlocked);
                    },
                    soldOutButtonLabel: "Built"
                },
                fillMana: {
                    key: "fill_mana",
                    name: "Fill Mana",
                    description: "Okami channels global mana into the stone pile reservoir.",
                    directWeave: true,
                    cost: {},
                    canBuy: function() {
                        return engine.canStartFillMana("stonePile");
                    },
                    onBuy: function() {
                        engine.completeFillMana("stonePile");
                    },
                    rowVisible: function() {
                        return false;
                    }
                }
            }
        },

        noodleBar: {
            label: "Noodle Bar",
            description: "Guests eat noodles here, and their talk becomes tips for researched skills.",
            mapSlot: { left: "30%", bottom: 203 },
            constructionCost: { wood: 6000, stone: 3000 },
            progressDefaults: {
                hotWater: 0,
                hotWaterCapacity: 1000,
                tipProgress: 0,
                topicPresses: 0,
                topicCooldownRemainMs: 0,
                offeredSkillKeys: [],
                selectedTipSkillKey: "",
                lastTipText: "",
                crossTalkBought: 0,
                comfyStoolsBought: 0,
                trophyDecorationsBought: 0
            },
            upgradesOrder: ["crossTalk", "comfyStools", "trophyDecorations"],
            upgrades: {
                crossTalk: {
                    key: "cross_talk",
                    name: "Cross-Talk",
                    description: "When a tip is earned, there is a chance one of the other offered skills gains a tip too. +10% chance per purchase.",
                    getCost: function() {
                        const n = engine.getNoodleCrossTalkBought();
                        return {
                            coins: Math.round(20000 * Math.pow(2, n)),
                            starBeads: Math.round(80000 * Math.pow(2, n))
                        };
                    },
                    weavingTime: 600,
                    weavingTimeIncreaseAdd: 300,
                    maxPurchases: 5,
                    getWeavingPurchaseIndex: function() {
                        return engine.getNoodleCrossTalkBought();
                    },
                    canBuy: function() {
                        return engine.getNoodleCrossTalkBought() < 5;
                    },
                    onBuy: function() {
                        const bar = data.progress.base.noodleBar;
                        bar.crossTalkBought = engine.getNoodleCrossTalkBought() + 1;
                    },
                    extraInfo: function() {
                        return `Chance: ${engine.getNoodleCrossTalkBought() * 10}%`;
                    },
                    rowVisible: function() {
                        return true;
                    },
                    upgradeSoldOut: function() {
                        return engine.getNoodleCrossTalkBought() >= 5;
                    },
                    soldOutButtonLabel: "Max cross-talk"
                },
                comfyStools: {
                    key: "comfy_stools",
                    name: "Comfy Stools",
                    description: "Softer seats. Guests eating noodles gain +5 restfulness/s per purchase.",
                    getCost: function() {
                        const n = engine.getNoodleComfyStoolsBought();
                        return { wood: Math.round(3000 * Math.pow(2, n)) };
                    },
                    weavingTime: 360,
                    weavingTimeIncreaseAdd: 180,
                    getWeavingPurchaseIndex: function() {
                        return engine.getNoodleComfyStoolsBought();
                    },
                    canBuy: function() {
                        return true;
                    },
                    onBuy: function() {
                        const bar = data.progress.base.noodleBar;
                        bar.comfyStoolsBought = engine.getNoodleComfyStoolsBought() + 1;
                    },
                    extraInfo: function() {
                        return `Noodle restfulness: +${engine.getNoodleEatRestBonus()}/s`;
                    },
                    rowVisible: function() {
                        return true;
                    }
                },
                trophyDecorations: {
                    key: "trophy_decorations",
                    name: "Trophy Decorations",
                    description: "The walls do the talking. Each purchase halves the coin cost of changing conversation topics.",
                    getCost: function() {
                        const n = engine.getNoodleTrophyDecorationsBought();
                        return { stone: Math.round(8000 * Math.pow(2, n)) };
                    },
                    weavingTime: 360,
                    weavingTimeIncreaseAdd: 180,
                    getWeavingPurchaseIndex: function() {
                        return engine.getNoodleTrophyDecorationsBought();
                    },
                    canBuy: function() {
                        return true;
                    },
                    onBuy: function() {
                        const bar = data.progress.base.noodleBar;
                        bar.trophyDecorationsBought = engine.getNoodleTrophyDecorationsBought() + 1;
                    },
                    rowVisible: function() {
                        return true;
                    }
                }
            }
        },

        laundry: {
            label: "Laundry Basins",
            description: "Refresh rooms after guests leave.",
            mapSlot: { left: "11%", bottom: 293 },
            constructionCost: { wood: 999, stone: 999 },
            mutedPlaceholder: "Laundry upgrades are not implemented yet."
        },

        market: {
            label: "Market",
            description: "Kitsune haul goods here for Credit, which buys trade goods.",
            mapSlot: { left: "5%", bottom: 9 },
            constructionCost: { wood: 2000, coins: 20000 },
            progressDefaults: {
                level: 0,
                exp: 0,
                expToLevel: 30000,
                credit: 0,
                assignedWorkers: 0,
                assignedTraders: 0,
                creditCarriers: [],
                carrierIdCounter: 1,
                allowStone: true,
                allowWood: false,
                allowBars: false,
                nextHaulResourceIndex: 0,
                creditOnlyPurchases: false,
                fertilizer: 0,
                coal: 0,
                soap: 0,
                towels: 0,
                driedNoodles: 0,
                tradeEnabled: {},
                tradeThresholds: {},
                activeTrade: null,
                pausedTrades: {},
                nextTradeIndex: 0,
                mysticalGlovesBought: 0,
                anchoringRingBought: 0,
                cookingEquipmentBought: 0,
                tradingExperienceBought: 0,
                buyAdvertisingBought: 0,
                improveStoneDuplicatorBought: 0,
                literacyLessonsBought: 0,
                forgingInstructionsBought: 0,
                arsonistJournalsBought: 0,
                lostScrollsBought: 0,
                launcherDesignsBought: 0,
                repeatExchangeWhenReady: false
            },
            upgradesOrder: ["anchoringRing", "mysticalGloves", "cookingEquipment", "improveStoneDuplicator", "tradingExperience", "buyAdvertising", "literacyLessons", "forgingInstructions", "arsonistJournals", "lostScrolls", "launcherDesigns"],
            upgrades: {
                mysticalGloves: {
                    key: "mystical_gloves",
                    name: "Mystical Gloves",
                    description: "Silk gloves that quicken a clone's hands. Each pair reduces created clones' slap cooldown by 100ms.",
                    getCost: function() {
                        const n = engine.getMarketMysticalGlovesBought();
                        return { credit: Math.round(10000 * Math.pow(10, n)) };
                    },
                    weavingTime: 240,
                    weavingTimeIncrease: 3,
                    getWeavingPurchaseIndex: function() {
                        return engine.getMarketMysticalGlovesBought();
                    },
                    getMaxPurchases: function() {
                        return engine.getMarketMysticalGlovesMax();
                    },
                    maxPurchases: 3,
                    canBuy: function() {
                        return engine.getMarketMysticalGlovesBought() < engine.getMarketMysticalGlovesMax();
                    },
                    onBuy: function() {
                        const market = data.progress.base.market;
                        market.mysticalGlovesBought = engine.getMarketMysticalGlovesBought() + 1;
                    },
                    extraInfo: function() {
                        return `Slap cooldown: -${engine.getMarketMysticalGlovesBought() * 100}ms`;
                    },
                    rowVisible: function() {
                        return true;
                    },
                    upgradeSoldOut: function() {
                        return engine.getMarketMysticalGlovesBought() >= 3;
                    },
                    soldOutButtonLabel: "Max gloves",
                    lockedLabel: function() {
                        const bought = engine.getMarketMysticalGlovesBought();
                        if (bought < engine.getMarketMysticalGlovesMax()) {
                            return "";
                        }
                        return `Unlocks at Market level ${bought}`;
                    }
                },
                anchoringRing: {
                    key: "anchoring_ring",
                    name: "Anchoring Ring",
                    description: "A ring that anchors a clone's spirit. Each one grants created clones +1 Soul. Max buyable increases by 3 per Market Level.",
                    getCost: function() {
                        const n = engine.getMarketAnchoringRingBought();
                        return { credit: Math.round(8000 * Math.pow(2, n)) };
                    },
                    weavingTime: 240,
                    weavingTimeIncrease: 1.5,
                    getWeavingPurchaseIndex: function() {
                        return engine.getMarketAnchoringRingBought();
                    },
                    getMaxPurchases: function() {
                        return engine.getMarketAnchoringRingMax();
                    },
                    maxPurchases: 12,
                    canBuy: function() {
                        return engine.getMarketAnchoringRingBought() < engine.getMarketAnchoringRingMax();
                    },
                    onBuy: function() {
                        const market = data.progress.base.market;
                        market.anchoringRingBought = engine.getMarketAnchoringRingBought() + 1;
                    },
                    extraInfo: function() {
                        return `Clone Soul: +${engine.getMarketAnchoringRingBought()}`;
                    },
                    rowVisible: function() {
                        return true;
                    },
                    upgradeSoldOut: function() {
                        return engine.getMarketAnchoringRingBought() >= 12;
                    },
                    soldOutButtonLabel: "Max rings",
                    lockedLabel: function() {
                        const bought = engine.getMarketAnchoringRingBought();
                        if (bought < engine.getMarketAnchoringRingMax()) {
                            return "";
                        }
                        return `Unlocks at Market level ${Math.ceil((bought - 2) / 3)}`;
                    }
                },
                cookingEquipment: {
                    key: "cooking_equipment",
                    name: "Cooking Equipment",
                    description: "Pots, knives, and a proper stove. Lets the Fox Den plan the Noodle Bar, which uses hotter water for more restfulness. Satisfied guests also give tips about your skills.",
                    cost: { credit: 30000 },
                    weavingTime: 600,
                    maxPurchases: 1,
                    canBuy: function() {
                        return engine.getMarketLevel() >= 1 && !engine.isMarketCookingEquipmentBought();
                    },
                    onBuy: function() {
                        data.progress.base.market.cookingEquipmentBought = 1;
                    },
                    extraInfo: function() {
                        return "";
                    },
                    rowVisible: function(hideMaxed) {
                        return !(hideMaxed && engine.isMarketCookingEquipmentBought());
                    },
                    upgradeSoldOut: function() {
                        return engine.isMarketCookingEquipmentBought();
                    },
                    soldOutButtonLabel: "Equipped",
                    lockedLabel: function() {
                        return engine.getMarketLevel() >= 1 ? "" : "Unlocks at Market level 1";
                    }
                },
                tradingExperience: {
                    key: "trading_experience",
                    name: "Trading Experience",
                    description: "Traders keep ledgers. The Market also gains exp for every Credit they spend.",
                    cost: { credit: 15000 },
                    weavingTime: 400,
                    maxPurchases: 1,
                    canBuy: function() {
                        return engine.getMarketLevel() >= 1 && !engine.isMarketTradingExperienceBought();
                    },
                    onBuy: function() {
                        data.progress.base.market.tradingExperienceBought = 1;
                    },
                    extraInfo: function() {
                        return "";
                    },
                    rowVisible: function(hideMaxed) {
                        return !(hideMaxed && engine.isMarketTradingExperienceBought());
                    },
                    upgradeSoldOut: function() {
                        return engine.isMarketTradingExperienceBought();
                    },
                    soldOutButtonLabel: "Learned",
                    lockedLabel: function() {
                        return engine.getMarketLevel() >= 1 ? "" : "Unlocks at Market level 1";
                    }
                },
                buyAdvertising: {
                    key: "buy_advertising",
                    name: "Buy Advertising",
                    description: "Post word of the resort along the roads. Each purchase cuts the wait for the next visitor at the Torii Gate by 5%.",
                    getCost: function() {
                        const n = engine.getMarketBuyAdvertisingBought();
                        return { credit: Math.round(15000 * Math.pow(1.5, n)) };
                    },
                    weavingTime: 400,
                    weavingTimeIncreaseAdd: 400,
                    getWeavingPurchaseIndex: function() {
                        return engine.getMarketBuyAdvertisingBought();
                    },
                    maxPurchases: 20,
                    canBuy: function() {
                        return engine.getMarketLevel() >= 1 && engine.getMarketBuyAdvertisingBought() < 20;
                    },
                    onBuy: function() {
                        const market = data.progress.base.market;
                        market.buyAdvertisingBought = engine.getMarketBuyAdvertisingBought() + 1;
                    },
                    extraInfo: function() {
                        const mult = engine.getMarketAdvertisingIntervalMultiplier();
                        return `Visitor wait: x${round2(mult)}`;
                    },
                    rowVisible: function() {
                        return true;
                    },
                    upgradeSoldOut: function() {
                        return engine.getMarketBuyAdvertisingBought() >= 20;
                    },
                    soldOutButtonLabel: "Max advertising",
                    lockedLabel: function() {
                        return engine.getMarketLevel() >= 1 ? "" : "Unlocks at Market level 1";
                    }
                },
                improveStoneDuplicator: {
                    key: "improve_stone_duplicator",
                    name: "Improve Stone Duplicator",
                    description: "The duplicator works in batches. Every 10 seconds, 10 stone and 500 mana become 20 duplicated stone. It skips a tick when fewer than 10 stone are stored.",
                    cost: { credit: 30000 },
                    weavingTime: 600,
                    canBuy: function() {
                        const pile = data.progress.base.stonePile;
                        const market = data.progress.base.market;
                        return engine.getMarketLevel() >= 1
                            && !!(pile && pile.stoneDuplicatorUnlocked && market && !market.improveStoneDuplicatorBought);
                    },
                    onBuy: function() {
                        data.progress.base.market.improveStoneDuplicatorBought = 1;
                    },
                    rowVisible: function() {
                        const pile = data.progress.base.stonePile;
                        return !!(pile && pile.stoneDuplicatorUnlocked);
                    },
                    upgradeSoldOut: function() {
                        return !!(data.progress.base.market && data.progress.base.market.improveStoneDuplicatorBought);
                    },
                    soldOutButtonLabel: "Improved",
                    lockedLabel: function() {
                        return engine.getMarketLevel() >= 1 ? "" : "Unlocks at Market level 1";
                    }
                },
                exchangeCredit: {
                    key: "exchange_credit",
                    name: "Exchange Credit",
                    description: "The Okami turns 1000 coins into 1000 Credit and 1000 Market exp.",
                    directWeave: true,
                    weavingTime: 40,
                    cost: {},
                    canBuy: function() {
                        return engine.canStartExchangeCredit();
                    },
                    onBuy: function() {
                        engine.completeExchangeCredit();
                    },
                    rowVisible: function() {
                        return false;
                    }
                },
                literacyLessons: {
                    key: "literacy_lessons",
                    name: "Literacy Lessons",
                    description: "Readers keep more of what they study. Each purchase multiplies research gained by x1.2. Coins, star beads, and mana spent stay the same.",
                    getCost: function() {
                        const n = engine.getLiteracyLessonsBought();
                        return { credit: Math.round(40000 * Math.pow(1.5, n)) };
                    },
                    weavingTime: 600,
                    weavingTimeIncreaseAdd: 400,
                    getWeavingPurchaseIndex: function() {
                        return engine.getLiteracyLessonsBought();
                    },
                    canBuy: function() {
                        return engine.getMarketLevel() >= 2
                            && engine.getLiteracyLessonsBought() < engine.getLiteracyLessonsMax();
                    },
                    onBuy: function() {
                        data.progress.base.market.literacyLessonsBought = engine.getLiteracyLessonsBought() + 1;
                    },
                    extraInfo: function() {
                        const mult = round2(engine.getLiteracyResearchMultiplier());
                        return `Research gained: x${mult}. Max at this level: ${engine.getLiteracyLessonsMax()}`;
                    },
                    rowVisible: function() {
                        return engine.getMarketLevel() >= 1;
                    },
                    upgradeSoldOut: function() {
                        return engine.getLiteracyLessonsBought() >= engine.getLiteracyLessonsMax();
                    },
                    soldOutButtonLabel: "Max lessons",
                    lockedLabel: function() {
                        return engine.getMarketLevel() >= 2 ? "" : "Unlocks at Market level 2";
                    }
                },
                forgingInstructions: {
                    key: "forging_instructions",
                    name: "Forging Instructions",
                    description: "Notes on hotter fires. Reveals Larger Forge in the Atelier.",
                    cost: { credit: 50000 },
                    weavingTime: 800,
                    canBuy: function() {
                        return engine.getMarketLevel() >= 2 && !engine.isForgingInstructionsBought();
                    },
                    onBuy: function() {
                        data.progress.base.market.forgingInstructionsBought = 1;
                    },
                    rowVisible: function() {
                        return engine.getMarketLevel() >= 1;
                    },
                    upgradeSoldOut: function() {
                        return engine.isForgingInstructionsBought();
                    },
                    soldOutButtonLabel: "Studied",
                    lockedLabel: function() {
                        return engine.getMarketLevel() >= 2 ? "" : "Unlocks at Market level 2";
                    }
                },
                arsonistJournals: {
                    key: "arsonist_journals",
                    name: "Buy Arsonist Journals",
                    description: "Bonfire carriers learn to stack fuel, increasing the amount they carry per trip.",
                    getCost: function() {
                        const n = engine.getArsonistJournalsBought();
                        return { credit: Math.round(60000 * Math.pow(2, n)) };
                    },
                    weavingTime: 1000,
                    weavingTimeIncreaseAdd: 1000,
                    getWeavingPurchaseIndex: function() {
                        return engine.getArsonistJournalsBought();
                    },
                    canBuy: function() {
                        return engine.getMarketLevel() >= 2;
                    },
                    onBuy: function() {
                        data.progress.base.market.arsonistJournalsBought = engine.getArsonistJournalsBought() + 1;
                    },
                    extraInfo: function() {
                        const bought = engine.getArsonistJournalsBought();
                        const cap = resortData.getKitsuneWoodCarryAmount();
                        return `Wood/Coal carry: ${cap} | Next journal: +${fibonacci(bought)}`;
                    },
                    rowVisible: function() {
                        return engine.getMarketLevel() >= 1;
                    },
                    lockedLabel: function() {
                        return engine.getMarketLevel() >= 2 ? "" : "Unlocks at Market level 2";
                    }
                },
                lostScrolls: {
                    key: "lost_scrolls",
                    name: "Lost Scrolls",
                    description: "A scroll that was never catalogued. Each purchase adds one research choice and does not raise the price of the next paid research.",
                    getCost: function() {
                        const n = engine.getLostScrollsBought();
                        return { credit: Math.round(100000 * Math.pow(3, n)) };
                    },
                    weavingTime: 1500,
                    weavingTimeIncrease: 2,
                    getWeavingPurchaseIndex: function() {
                        return engine.getLostScrollsBought();
                    },
                    getMaxPurchases: function() {
                        return engine.getLostScrollsMax();
                    },
                    canBuy: function() {
                        return engine.getMarketLevel() >= 3
                            && engine.getLostScrollsBought() < engine.getLostScrollsMax();
                    },
                    onBuy: function() {
                        const market = data.progress.base.market;
                        market.lostScrollsBought = engine.getLostScrollsBought() + 1;
                        const lib = data.progress.base.scrollArchives;
                        if (!lib) {
                            return;
                        }
                        lib.researchesToChoose = (lib.researchesToChoose || 0) + 1;
                        if ((lib.researchesToChoose || 0) > 0 && !(lib.researchChoices && lib.researchChoices.length)) {
                            engine.rollScrollArchivesResearchChoices();
                        }
                        events.markNewBaseContent("scrollArchives");
                    },
                    rowVisible: function() {
                        return engine.getMarketLevel() >= 2;
                    },
                    upgradeSoldOut: function() {
                        return engine.getLostScrollsBought() >= engine.getLostScrollsMax();
                    },
                    soldOutButtonLabel: "Max scrolls",
                    lockedLabel: function() {
                        return engine.getMarketLevel() >= 3 ? "" : "Unlocks at Market level 3";
                    }
                },
                launcherDesigns: {
                    key: "launcher_designs",
                    name: "Launcher Designs",
                    description: "Unlocks launcher upgrades on each Metal Fire Launcher platform",
                    cost: { credit: 150000 },
                    weavingTime: 1200,
                    maxPurchases: 1,
                    canBuy: function() {
                        return engine.getMarketLevel() >= 3 && !engine.isLauncherDesignsBought();
                    },
                    onBuy: function() {
                        data.progress.base.market.launcherDesignsBought = 1;
                    },
                    rowVisible: function(hideMaxed) {
                        return engine.getMarketLevel() >= 2
                            && !(hideMaxed && engine.isLauncherDesignsBought());
                    },
                    upgradeSoldOut: function() {
                        return engine.isLauncherDesignsBought();
                    },
                    lockedLabel: function() {
                        return engine.getMarketLevel() >= 3 ? "" : "Unlocks at Market level 3";
                    }
                }
            }
        },

        fireLauncher_pathMid: {
            label: "Long-Range Launcher",
            upgradesOrder: ["ironSights", "longRangeFirePit", "longRangeWoodPit"],
            upgrades: {
                ironSights: {
                    key: "iron_sights",
                    name: "Iron Sights",
                    description: "Sharper aiming for the Long-Range Launcher. Each purchase increases range by +20% and heat damage per strike by +10%.",
                    getCost: function() {
                        const n = engine.getFireLauncherUpgradeBought("pathMid", "ironSightsBought");
                        return { bars: Math.round(500 * Math.pow(2, n)) };
                    },
                    weavingTime: 800,
                    weavingTimeIncreaseAdd: 800,
                    getWeavingPurchaseIndex: function() {
                        return engine.getFireLauncherUpgradeBought("pathMid", "ironSightsBought");
                    },
                    maxPurchases: 3,
                    canBuy: function() {
                        return engine.isLauncherDesignsBought()
                            && engine.isFireLauncherPlatformBuilt("pathMid")
                            && engine.getFireLauncherUpgradeBought("pathMid", "ironSightsBought") < 3;
                    },
                    onBuy: function() {
                        engine.incrementFireLauncherUpgrade("pathMid", "ironSightsBought");
                    },
                    rowVisible: function() {
                        return engine.isLauncherDesignsBought() && engine.isFireLauncherPlatformBuilt("pathMid");
                    },
                    upgradeSoldOut: function() {
                        return engine.getFireLauncherUpgradeBought("pathMid", "ironSightsBought") >= 3;
                    }
                },
                longRangeFirePit: {
                    key: "long_range_fire_pit",
                    name: "Long Range Fire Pit",
                    description: "A stone fire pit beside the Long-Range Launcher. Each purchase increases ember capacity by +1000.",
                    getCost: function() {
                        const n = engine.getFireLauncherUpgradeBought("pathMid", "firePitBought");
                        return { stone: Math.round(2000 * Math.pow(1.5, n)) };
                    },
                    weavingTime: 1000,
                    weavingTimeIncreaseAdd: 1000,
                    getWeavingPurchaseIndex: function() {
                        return engine.getFireLauncherUpgradeBought("pathMid", "firePitBought");
                    },
                    maxPurchases: 2,
                    canBuy: function() {
                        return engine.isLauncherDesignsBought()
                            && engine.isFireLauncherPlatformBuilt("pathMid")
                            && engine.getFireLauncherUpgradeBought("pathMid", "firePitBought") < 2;
                    },
                    onBuy: function() {
                        engine.incrementFireLauncherUpgrade("pathMid", "firePitBought");
                    },
                    rowVisible: function() {
                        return engine.isLauncherDesignsBought() && engine.isFireLauncherPlatformBuilt("pathMid");
                    },
                    upgradeSoldOut: function() {
                        return engine.getFireLauncherUpgradeBought("pathMid", "firePitBought") >= 2;
                    }
                },
                longRangeWoodPit: {
                    key: "long_range_wood_pit",
                    name: "Long Range Wood Pit",
                    description: "A wood store for the Long-Range Launcher. Each purchase increases the spirit value of the assigned fire spirit by +25%, raising ember regeneration.",
                    getCost: function() {
                        const n = engine.getFireLauncherUpgradeBought("pathMid", "woodPitBought");
                        return { wood: Math.round(2000 * Math.pow(1.5, n)) };
                    },
                    weavingTime: 1000,
                    weavingTimeIncreaseAdd: 1000,
                    getWeavingPurchaseIndex: function() {
                        return engine.getFireLauncherUpgradeBought("pathMid", "woodPitBought");
                    },
                    maxPurchases: 4,
                    canBuy: function() {
                        return engine.isLauncherDesignsBought()
                            && engine.isFireLauncherPlatformBuilt("pathMid")
                            && engine.getFireLauncherUpgradeBought("pathMid", "woodPitBought") < 4;
                    },
                    onBuy: function() {
                        engine.incrementFireLauncherUpgrade("pathMid", "woodPitBought");
                    },
                    rowVisible: function() {
                        return engine.isLauncherDesignsBought() && engine.isFireLauncherPlatformBuilt("pathMid");
                    },
                    upgradeSoldOut: function() {
                        return engine.getFireLauncherUpgradeBought("pathMid", "woodPitBought") >= 4;
                    }
                }
            }
        },

        fireLauncher_pathLower: {
            label: "Ember Launcher",
            upgradesOrder: ["fireFlingers", "emberFirePit", "emberWoodPit"],
            upgrades: {
                fireFlingers: {
                    key: "fire_flingers",
                    name: "Fire Flingers",
                    description: "Hotter throws from the Ember Launcher. Each purchase increases heat damage per strike by +25%.",
                    getCost: function() {
                        const n = engine.getFireLauncherUpgradeBought("pathLower", "fireFlingersBought");
                        return { bars: Math.round(500 * Math.pow(2, n)) };
                    },
                    weavingTime: 800,
                    weavingTimeIncreaseAdd: 800,
                    getWeavingPurchaseIndex: function() {
                        return engine.getFireLauncherUpgradeBought("pathLower", "fireFlingersBought");
                    },
                    maxPurchases: 3,
                    canBuy: function() {
                        return engine.isLauncherDesignsBought()
                            && engine.isFireLauncherPlatformBuilt("pathLower")
                            && engine.getFireLauncherUpgradeBought("pathLower", "fireFlingersBought") < 3;
                    },
                    onBuy: function() {
                        engine.incrementFireLauncherUpgrade("pathLower", "fireFlingersBought");
                    },
                    rowVisible: function() {
                        return engine.isLauncherDesignsBought() && engine.isFireLauncherPlatformBuilt("pathLower");
                    },
                    upgradeSoldOut: function() {
                        return engine.getFireLauncherUpgradeBought("pathLower", "fireFlingersBought") >= 3;
                    }
                },
                emberFirePit: {
                    key: "ember_fire_pit",
                    name: "Ember Fire Pit",
                    description: "A stone fire pit beside the Ember Launcher. Each purchase increases ember capacity by +1000.",
                    getCost: function() {
                        const n = engine.getFireLauncherUpgradeBought("pathLower", "firePitBought");
                        return { stone: Math.round(2000 * Math.pow(1.5, n)) };
                    },
                    weavingTime: 1000,
                    weavingTimeIncreaseAdd: 1000,
                    getWeavingPurchaseIndex: function() {
                        return engine.getFireLauncherUpgradeBought("pathLower", "firePitBought");
                    },
                    maxPurchases: 2,
                    canBuy: function() {
                        return engine.isLauncherDesignsBought()
                            && engine.isFireLauncherPlatformBuilt("pathLower")
                            && engine.getFireLauncherUpgradeBought("pathLower", "firePitBought") < 2;
                    },
                    onBuy: function() {
                        engine.incrementFireLauncherUpgrade("pathLower", "firePitBought");
                    },
                    rowVisible: function() {
                        return engine.isLauncherDesignsBought() && engine.isFireLauncherPlatformBuilt("pathLower");
                    },
                    upgradeSoldOut: function() {
                        return engine.getFireLauncherUpgradeBought("pathLower", "firePitBought") >= 2;
                    }
                },
                emberWoodPit: {
                    key: "ember_wood_pit",
                    name: "Ember Wood Pit",
                    description: "A wood store for the Ember Launcher. Each purchase increases the spirit value of the assigned fire spirit by +25%, raising ember regeneration.",
                    getCost: function() {
                        const n = engine.getFireLauncherUpgradeBought("pathLower", "woodPitBought");
                        return { wood: Math.round(2000 * Math.pow(1.5, n)) };
                    },
                    weavingTime: 1000,
                    weavingTimeIncreaseAdd: 1000,
                    getWeavingPurchaseIndex: function() {
                        return engine.getFireLauncherUpgradeBought("pathLower", "woodPitBought");
                    },
                    maxPurchases: 4,
                    canBuy: function() {
                        return engine.isLauncherDesignsBought()
                            && engine.isFireLauncherPlatformBuilt("pathLower")
                            && engine.getFireLauncherUpgradeBought("pathLower", "woodPitBought") < 4;
                    },
                    onBuy: function() {
                        engine.incrementFireLauncherUpgrade("pathLower", "woodPitBought");
                    },
                    rowVisible: function() {
                        return engine.isLauncherDesignsBought() && engine.isFireLauncherPlatformBuilt("pathLower");
                    },
                    upgradeSoldOut: function() {
                        return engine.getFireLauncherUpgradeBought("pathLower", "woodPitBought") >= 4;
                    }
                }
            }
        },

        fireLauncher_bendTop: {
            label: "Burst Launcher",
            upgradesOrder: ["hotIrons", "burstFirePit", "burstWoodPit"],
            upgrades: {
                hotIrons: {
                    key: "hot_irons",
                    name: "Hot Irons",
                    description: "Hotter burst irons for the Burst Launcher. Each purchase increases range by +10% and heat damage per strike by +20%.",
                    getCost: function() {
                        const n = engine.getFireLauncherUpgradeBought("bendTop", "hotIronsBought");
                        return { bars: Math.round(500 * Math.pow(2, n)) };
                    },
                    weavingTime: 800,
                    weavingTimeIncreaseAdd: 800,
                    getWeavingPurchaseIndex: function() {
                        return engine.getFireLauncherUpgradeBought("bendTop", "hotIronsBought");
                    },
                    maxPurchases: 3,
                    canBuy: function() {
                        return engine.isLauncherDesignsBought()
                            && engine.isFireLauncherPlatformBuilt("bendTop")
                            && engine.getFireLauncherUpgradeBought("bendTop", "hotIronsBought") < 3;
                    },
                    onBuy: function() {
                        engine.incrementFireLauncherUpgrade("bendTop", "hotIronsBought");
                    },
                    rowVisible: function() {
                        return engine.isLauncherDesignsBought() && engine.isFireLauncherPlatformBuilt("bendTop");
                    },
                    upgradeSoldOut: function() {
                        return engine.getFireLauncherUpgradeBought("bendTop", "hotIronsBought") >= 3;
                    }
                },
                burstFirePit: {
                    key: "burst_fire_pit",
                    name: "Burst Fire Pit",
                    description: "A stone fire pit beside the Burst Launcher. Each purchase increases ember capacity by +1000.",
                    getCost: function() {
                        const n = engine.getFireLauncherUpgradeBought("bendTop", "firePitBought");
                        return { stone: Math.round(2000 * Math.pow(1.5, n)) };
                    },
                    weavingTime: 1000,
                    weavingTimeIncreaseAdd: 1000,
                    getWeavingPurchaseIndex: function() {
                        return engine.getFireLauncherUpgradeBought("bendTop", "firePitBought");
                    },
                    maxPurchases: 2,
                    canBuy: function() {
                        return engine.isLauncherDesignsBought()
                            && engine.isFireLauncherPlatformBuilt("bendTop")
                            && engine.getFireLauncherUpgradeBought("bendTop", "firePitBought") < 2;
                    },
                    onBuy: function() {
                        engine.incrementFireLauncherUpgrade("bendTop", "firePitBought");
                    },
                    rowVisible: function() {
                        return engine.isLauncherDesignsBought() && engine.isFireLauncherPlatformBuilt("bendTop");
                    },
                    upgradeSoldOut: function() {
                        return engine.getFireLauncherUpgradeBought("bendTop", "firePitBought") >= 2;
                    }
                },
                burstWoodPit: {
                    key: "burst_wood_pit",
                    name: "Burst Wood Pit",
                    description: "A wood store for the Burst Launcher. Each purchase increases the spirit value of the assigned fire spirit by +25%, raising ember regeneration.",
                    getCost: function() {
                        const n = engine.getFireLauncherUpgradeBought("bendTop", "woodPitBought");
                        return { wood: Math.round(2000 * Math.pow(1.5, n)) };
                    },
                    weavingTime: 1000,
                    weavingTimeIncreaseAdd: 1000,
                    getWeavingPurchaseIndex: function() {
                        return engine.getFireLauncherUpgradeBought("bendTop", "woodPitBought");
                    },
                    maxPurchases: 4,
                    canBuy: function() {
                        return engine.isLauncherDesignsBought()
                            && engine.isFireLauncherPlatformBuilt("bendTop")
                            && engine.getFireLauncherUpgradeBought("bendTop", "woodPitBought") < 4;
                    },
                    onBuy: function() {
                        engine.incrementFireLauncherUpgrade("bendTop", "woodPitBought");
                    },
                    rowVisible: function() {
                        return engine.isLauncherDesignsBought() && engine.isFireLauncherPlatformBuilt("bendTop");
                    },
                    upgradeSoldOut: function() {
                        return engine.getFireLauncherUpgradeBought("bendTop", "woodPitBought") >= 4;
                    }
                }
            }
        },

        mage_tower: {
            label: "The Orb",
            description: "Gain exp from spirit total levels; generates mana equal to its level.",
            mapSlot: { left: "45%", bottom: 143 },
            constructionCost: { wood: 10, stone: 20 },
            progressDefaults: {
                level: 0,
                exp: 0,
                expToLevel: 200,
                expandOrbBought: 0,
                spinCurrentsBought: 0,
                buildWallsBought: 0,
                buildStairsBought: 0,
                buildFloorBought: 0,
                increaseInnManaCapacityBought: 0,
                increaseGateManaCapacityBought: 0,
                increaseStonePileManaCapacityBought: 0,
                assignedWorkers: 0
            },
            upgradesOrder: ["expandOrb", "spinCurrents", "buildWalls", "buildStairs", "buildFloor", "increaseInnManaCapacity", "increaseGateManaCapacity", "increaseStonePileManaCapacity"],
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
                        return true;
                    },
                    onBuy: function() {
                        const orb = data.progress.base.mage_tower;
                        orb.expandOrbBought = (orb.expandOrbBought || 0) + 1;
                    },
                    extraInfo: function() {
                        const n = (data.progress.base.mage_tower && data.progress.base.mage_tower.expandOrbBought) || 0;
                        const mult = Math.pow(1.1, n);
                        return `Capacity multiplier: x${round2(mult)} (${n} purchased)`;
                    },
                    rowVisible: function() {
                        const n = (data.progress.base.mage_tower && data.progress.base.mage_tower.expandOrbBought) || 0;
                        return n > 0 || engine.hasManaCapacityForCost(this.getCost());
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
                    weavingTime: 10,
                    weavingTimeIncreaseAdd: 5,
                    getWeavingPurchaseIndex: function() {
                        return (data.progress.base.mage_tower && data.progress.base.mage_tower.spinCurrentsBought) || 0;
                    },
                    canBuy: function() {
                        return true;
                    },
                    onBuy: function() {
                        const orb = data.progress.base.mage_tower;
                        orb.spinCurrentsBought = (orb.spinCurrentsBought || 0) + 1;
                    },
                    extraInfo: function() {
                        const n = (data.progress.base.mage_tower && data.progress.base.mage_tower.spinCurrentsBought) || 0;
                        const mult = Math.pow(1.05, n);
                        return `Mana gain multiplier: x${round2(mult)} (${n} purchased)`;
                    },
                    rowVisible: function() {
                        const n = (data.progress.base.mage_tower && data.progress.base.mage_tower.spinCurrentsBought) || 0;
                        return n > 0 || engine.hasManaCapacityForCost(this.getCost());
                    }
                },
                buildWalls: {
                    key: "build_walls",
                    name: "Build Walls",
                    description: "Raise walls around the Orb. Each wall increases Orb exp gain by 10%. Every 4 walls unlock another Stairs, and each Floor raises the wall maximum by 4.",
                    getCost: function() {
                        const n = engine.getOrbBuildWallsBought();
                        return { wood: Math.floor(40 * Math.pow(2, Math.floor(n / 4))) };
                    },
                    weavingTime: 30,
                    weavingTimeIncreaseAdd: 30,
                    getWeavingPurchaseIndex: function() {
                        return Math.floor(engine.getOrbBuildWallsBought() / 4);
                    },
                    getPurchaseCount: function() {
                        return engine.getOrbBuildWallsBought();
                    },
                    getMaxPurchases: function() {
                        return 4 + 4 * engine.getOrbMaxFloors();
                    },
                    canBuy: function() {
                        return engine.getOrbBuildWallsBought() < engine.getOrbBuildWallsMax();
                    },
                    onBuy: function() {
                        const orb = data.progress.base.mage_tower;
                        orb.buildWallsBought = engine.getOrbBuildWallsBought() + 1;
                    },
                    extraInfo: function() {
                        return `Exp bonus: +${engine.getOrbBuildWallsBought() * 10}%`;
                    },
                    rowVisible: function() {
                        return true;
                    },
                    upgradeSoldOut: function() {
                        return engine.getOrbBuildWallsBought() >= engine.getOrbBuildWallsMax();
                    },
                    soldOutButtonLabel: "Max walls"
                },
                buildStairs: {
                    key: "build_stairs",
                    name: "Build Stairs",
                    description: "Build stairs up the Orb. Each stairs increases Orb exp gain by 20%. Each stairs unlocks another Floor.",
                    getCost: function() {
                        const n = engine.getOrbBuildStairsBought();
                        return {
                            wood: Math.floor(200 * Math.pow(1.5, n)),
                            starBeads: Math.floor(1000 * Math.pow(3, n)),
                            coins: Math.floor(300 * Math.pow(3, n))
                        };
                    },
                    weavingTime: 60,
                    weavingTimeIncreaseAdd: 60,
                    getWeavingPurchaseIndex: function() {
                        return engine.getOrbBuildStairsBought();
                    },
                    getMaxPurchases: function() {
                        return engine.getOrbMaxFloors();
                    },
                    canBuy: function() {
                        return engine.getOrbBuildStairsBought() < engine.getOrbBuildStairsMax();
                    },
                    onBuy: function() {
                        const orb = data.progress.base.mage_tower;
                        orb.buildStairsBought = engine.getOrbBuildStairsBought() + 1;
                    },
                    extraInfo: function() {
                        return `Exp bonus: +${engine.getOrbBuildStairsBought() * 20}%`;
                    },
                    rowVisible: function() {
                        const max = engine.getOrbBuildStairsMax();
                        const bought = engine.getOrbBuildStairsBought();
                        if (max > 0 && bought >= max) {
                            return false;
                        }
                        return engine.getOrbBuildWallsBought() >= 4;
                    },
                    upgradeSoldOut: function() {
                        return false;
                    },
                    soldOutButtonLabel: "Max stairs"
                },
                buildFloor: {
                    key: "build_floor",
                    name: "Build Floor",
                    description: "Lay another floor. Each floor increases mana generation and capacity by 10% and raises the Walls maximum by 4.",
                    getCost: function() {
                        const n = engine.getOrbBuildFloorBought();
                        return {
                            wood: Math.floor(500 * Math.pow(2, n)),
                            bars: Math.floor(200 * Math.pow(1.5, n))
                        };
                    },
                    weavingTime: 90,
                    weavingTimeIncreaseAdd: 90,
                    getWeavingPurchaseIndex: function() {
                        return engine.getOrbBuildFloorBought();
                    },
                    getMaxPurchases: function() {
                        return engine.getOrbMaxFloors();
                    },
                    canBuy: function() {
                        return engine.getOrbBuildFloorBought() < engine.getOrbBuildFloorMax();
                    },
                    onBuy: function() {
                        const orb = data.progress.base.mage_tower;
                        orb.buildFloorBought = engine.getOrbBuildFloorBought() + 1;
                    },
                    extraInfo: function() {
                        return `Mana gen and cap: +${engine.getOrbBuildFloorBought() * 10}%`;
                    },
                    rowVisible: function() {
                        const max = engine.getOrbBuildFloorMax();
                        const bought = engine.getOrbBuildFloorBought();
                        if (max > 0 && bought >= max) {
                            return false;
                        }
                        return engine.getOrbBuildStairsBought() >= 1;
                    },
                    upgradeSoldOut: function() {
                        return false;
                    },
                    soldOutButtonLabel: "Max floors"
                },
                increaseInnManaCapacity: {
                    key: "increase_inn_mana_capacity",
                    name: "Increase Inn's Capacity",
                    description: "Expand the Tatami Inn's mana reservoir by +4000 per purchase (up to 4 times).",
                    getCost: function() {
                        const n = (data.progress.base.mage_tower && data.progress.base.mage_tower.increaseInnManaCapacityBought) || 0;
                        const mult = Math.pow(1.2, n);
                        return {
                            wood: Math.round(150 * mult),
                            stone: Math.round(50 * mult),
                            mana: Math.round(8000 * mult)
                        };
                    },
                    weavingTime: 80,
                    maxPurchases: 4,
                    canBuy: function() {
                        const n = (data.progress.base.mage_tower && data.progress.base.mage_tower.increaseInnManaCapacityBought) || 0;
                        return n < 4;
                    },
                    onBuy: function() {
                        const orb = data.progress.base.mage_tower;
                        const inn = data.progress.base.inn;
                        orb.increaseInnManaCapacityBought = (orb.increaseInnManaCapacityBought || 0) + 1;
                        inn.manaCapacity = (inn.manaCapacity || 4000) + 4000;
                    },
                    getWeavingPurchaseIndex: function() {
                        return (data.progress.base.mage_tower && data.progress.base.mage_tower.increaseInnManaCapacityBought) || 0;
                    },
                    rowVisible: function() {
                        const inn = data.progress.base && data.progress.base.inn;
                        const n = (data.progress.base.mage_tower && data.progress.base.mage_tower.increaseInnManaCapacityBought) || 0;
                        return !!(inn && inn.gentleLightsUnlocked)
                            && (n > 0 || engine.hasManaCapacityForCost(this.getCost()));
                    },
                    upgradeSoldOut: function() {
                        return ((data.progress.base.mage_tower && data.progress.base.mage_tower.increaseInnManaCapacityBought) || 0) >= 4;
                    },
                    soldOutButtonLabel: "Max capacity",
                    extraInfo: function() {
                        const n = (data.progress.base.mage_tower && data.progress.base.mage_tower.increaseInnManaCapacityBought) || 0;
                        const cap = (data.progress.base.inn && data.progress.base.inn.manaCapacity) || 4000;
                        return `Inn mana capacity: ${intToStringRound(cap)} (${n}/4)`;
                    }
                },
                increaseGateManaCapacity: {
                    key: "increase_gate_mana_capacity",
                    name: "Increase Gate's Capacity",
                    description: "Expand the Zenko Torii Gate's mana reservoir by +4000 per purchase (up to 4 times).",
                    getCost: function() {
                        const n = (data.progress.base.mage_tower && data.progress.base.mage_tower.increaseGateManaCapacityBought) || 0;
                        const mult = Math.pow(1.2, n);
                        return {
                            wood: Math.round(150 * mult),
                            stone: Math.round(50 * mult),
                            mana: Math.round(8000 * mult)
                        };
                    },
                    weavingTime: 80,
                    maxPurchases: 4,
                    canBuy: function() {
                        const n = (data.progress.base.mage_tower && data.progress.base.mage_tower.increaseGateManaCapacityBought) || 0;
                        return n < 4;
                    },
                    onBuy: function() {
                        const orb = data.progress.base.mage_tower;
                        const torii = data.progress.base.torii;
                        orb.increaseGateManaCapacityBought = (orb.increaseGateManaCapacityBought || 0) + 1;
                        torii.manaCapacity = (torii.manaCapacity || 4000) + 4000;
                    },
                    getWeavingPurchaseIndex: function() {
                        return (data.progress.base.mage_tower && data.progress.base.mage_tower.increaseGateManaCapacityBought) || 0;
                    },
                    rowVisible: function() {
                        const torii = data.progress.base && data.progress.base.torii;
                        const n = (data.progress.base.mage_tower && data.progress.base.mage_tower.increaseGateManaCapacityBought) || 0;
                        return !!(torii && torii.enticingLightsUnlocked)
                            && (n > 0 || engine.hasManaCapacityForCost(this.getCost()));
                    },
                    upgradeSoldOut: function() {
                        return ((data.progress.base.mage_tower && data.progress.base.mage_tower.increaseGateManaCapacityBought) || 0) >= 4;
                    },
                    soldOutButtonLabel: "Max capacity",
                    extraInfo: function() {
                        const n = (data.progress.base.mage_tower && data.progress.base.mage_tower.increaseGateManaCapacityBought) || 0;
                        const cap = (data.progress.base.torii && data.progress.base.torii.manaCapacity) || 4000;
                        return `Gate mana capacity: ${intToStringRound(cap)} (${n}/4)`;
                    }
                },
                increaseStonePileManaCapacity: {
                    key: "increase_stone_pile_mana_capacity",
                    name: "Increase Stone Pile's Capacity",
                    description: "Expand the Stone Pile's mana reservoir by +4000 per purchase (up to 4 times).",
                    getCost: function() {
                        const n = (data.progress.base.mage_tower && data.progress.base.mage_tower.increaseStonePileManaCapacityBought) || 0;
                        const mult = Math.pow(1.2, n);
                        return {
                            wood: Math.round(150 * mult),
                            stone: Math.round(50 * mult),
                            mana: Math.round(8000 * mult)
                        };
                    },
                    weavingTime: 80,
                    maxPurchases: 4,
                    canBuy: function() {
                        const n = (data.progress.base.mage_tower && data.progress.base.mage_tower.increaseStonePileManaCapacityBought) || 0;
                        return n < 4;
                    },
                    onBuy: function() {
                        const orb = data.progress.base.mage_tower;
                        const pile = data.progress.base.stonePile;
                        orb.increaseStonePileManaCapacityBought = (orb.increaseStonePileManaCapacityBought || 0) + 1;
                        pile.manaCapacity = (pile.manaCapacity || 4000) + 4000;
                    },
                    getWeavingPurchaseIndex: function() {
                        return (data.progress.base.mage_tower && data.progress.base.mage_tower.increaseStonePileManaCapacityBought) || 0;
                    },
                    rowVisible: function() {
                        const pile = data.progress.base && data.progress.base.stonePile;
                        const n = (data.progress.base.mage_tower && data.progress.base.mage_tower.increaseStonePileManaCapacityBought) || 0;
                        return !!(pile && pile.stoneDuplicatorUnlocked)
                            && (n > 0 || engine.hasManaCapacityForCost(this.getCost()));
                    },
                    upgradeSoldOut: function() {
                        return ((data.progress.base.mage_tower && data.progress.base.mage_tower.increaseStonePileManaCapacityBought) || 0) >= 4;
                    },
                    soldOutButtonLabel: "Max capacity",
                    extraInfo: function() {
                        const n = (data.progress.base.mage_tower && data.progress.base.mage_tower.increaseStonePileManaCapacityBought) || 0;
                        const cap = (data.progress.base.stonePile && data.progress.base.stonePile.manaCapacity) || 4000;
                        return `Stone Pile mana capacity: ${intToStringRound(cap)} (${n}/4)`;
                    }
                }
            }
        },

        shrine: {
            label: "Shrine",
            description: "Generates divinity, and prepares the Okami for the next mountain.",
            mapSlot: { left: 220, top: 662 },
            constructionCost: { wood: 8000, stone: 8000, bars: 2000, starBeads: 200000 },
            progressDefaults: {
                level: 0,
                exp: 0,
                expToLevel: 10000,
                selectedClassKey: "none",
                packs: { common: 0, rare: 0, epic: 0 },
                cards: {},
                milestones: {
                    shrineLevelClaimed: {},
                    totalStarsClaimed: {},
                    okamiLevelClaimed: {},
                    buildShrineClaimed: false,
                    marketLevelReq: 4,
                    depthReachedReq: 10,
                    orbLevelReq: 35,
                    essenceMadeReq: 10000,
                    maxManaReq: 200000,
                    divinityAmountReq: 30000,
                    totalGoldStarsReq: 1
                }
            },
            upgradesOrder: ["spareSandals"],
            upgrades: {
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
                        return false;
                        // return !(hideMaxed && data.progress.base.atelier.sandalBuilt);
                    },
                    upgradeSoldOut: function() {
                        return !!data.progress.base.atelier.sandalBuilt;
                    },
                    soldOutButtonLabel: "Built"
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
    if (scopeKey && scopeKey.indexOf("fireLauncher_") === 0) {
        const platformKey = scopeKey.slice("fireLauncher_".length);
        const def = engine.getFireLauncherPlatformDef(platformKey);
        if (def && def.name) {
            return def.name;
        }
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
    return 0;
};

resortData.getUpgradeWeavingBaseSeconds = function(upgradeDef, scopeKey) {
    if (scopeKey === "scrollArchives" && upgradeDef && upgradeDef.key === "finish_research") {
        return engine.getScrollArchivesFinishWeaveSeconds();
    }
    if (upgradeDef && upgradeDef.key === "fill_mana") {
        return engine.getFillManaWeaveSeconds(scopeKey);
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
