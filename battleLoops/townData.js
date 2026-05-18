/**
 * Static copy and layout-shaped config for Base building panels (see viewCreate.generateBasePanelsHtml).
 * DOM ids derive from building segment + upgrade `key`; purchase flow uses events.buyUpgrade + cost / onBuy.
 */

var townData = {
    /** Mine / smith / claypit / kiln: passive production uses workerPower (40 = one output tick). */
    workerPowerSiteKeys: ["mine", "smith", "claypit", "kiln"],
    guildClasses: ["warrior", "rogue", "hunter"],

    /** Base panel order and labels (UI only; `data.progress.selectedBaseBuilding` uses these keys). */
    baseBuildingOrder: ["chapel", "townhall", "mine", "smith", "claypit", "kiln", "lumbermill", "library", "garden", "inn", "workshop", "guild", "market", "mage_tower"],
    baseBuildingDisplayNames: {
        chapel: "Chapel",
        townhall: "Town Hall",
        smith: "Smith",
        inn: "Inn",
        guild: "Guild",
        market: "Market",
        garden: "Garden",
        workshop: "Workshop",
        mage_tower: "Mage Tower",
        mine: "Mine",
        library: "Library",
        claypit: "Clay Pit",
        kiln: "Kiln",
        lumbermill: "Lumbermill"
    },

    /** Class buy costs + per-level growth (saved class lives in `data.progress`). */
    guildClassDefs: {
        none: { key: "none", name: "None", buyCostGold: 0, perLevel: { str: 1, con: 1, spd: 0 } },
        warrior: { key: "warrior", name: "Warrior", buyCostGold: 500, perLevel: { str: 1, con: 2, spd: 0 } },
        rogue: { key: "rogue", name: "Rogue", buyCostGold: 500, perLevel: { str: 1, con: 1, spd: 1 } },
        hunter: { key: "hunter", name: "Hunter", buyCostGold: 500, perLevel: { str: 2, con: 1, spd: 0 } }
    },

    /** Town Hall building unlock prices (read at runtime; not stored in saves). */
    defaultTownhallUnlockCosts: {
        claypit: { gold: 5, bars: 0, bricks: 0, lumber: 0 },
        kiln: { gold: 5, bars: 0, bricks: 0, lumber: 0 },
        library: { gold: 10, bars: 0, bricks: 5, lumber: 0 },
        mine: { gold: 20, bars: 0, bricks: 10, lumber: 0 },
        smith: { gold: 20, bars: 0, bricks: 10, lumber: 0 },
        lumbermill: { gold: 200, bars: 20, bricks: 40, lumber: 0 },
        garden: { gold: 300, bars: 30, bricks: 30, lumber: 0 },
        inn: { gold: 350, bars: 35, bricks: 35, lumber: 0 },
        workshop: { gold: 400, bars: 40, bricks: 40, lumber: 40 },
        guild: { gold: 450, bars: 45, bricks: 45, lumber: 45 },
        market: { gold: 500, bars: 50, bricks: 50, lumber: 50 },
        mage_tower: { gold: 550, bars: 55, bricks: 55, lumber: 55 }
    },

    /** Copied into saved `data.progress.base.townhall.unlocks` for new games. */
    defaultTownhallUnlocksState: {
        mine: false,
        smith: false,
        claypit: false,
        kiln: false,
        lumbermill: false,
        library: false,
        garden: false,
        inn: false,
        workshop: false,
        guild: false,
        market: false,
        mage_tower: false
    },

    /** Copied into saved `data.progress.base.townhall.townUpgrades` for new games. */
    defaultTownhallTownUpgrades: {
        hireLocalBought: 0
    },

    /** Gold for the first Hire Local purchase; second hire uses townhallHireSecondGoldCost. */
    townhallHireFirstGoldCost: 5,

    /** After first hire, next hire costs this much gold until maxed. */
    townhallHireSecondGoldCost: 15,

    /** Copied into saved `data.progress.base.resources` for new games. */
    defaultBaseResources: {
        ironOre: 0,
        ironBar: 0,
        stone: 0,
        bricks: 0,
        logs: 0,
        lumber: 0
    },

    /** Building unlock rows (Town Hall > Buildings tab). Only data fields; DOM ids auto: base_townhall_<key>_* */
    townhallUnlockOrder: ["claypit", "kiln", "library", "mine", "smith", "lumbermill",  "garden", "inn", "workshop", "guild", "market", "mage_tower"],
    townhallUnlockDefs: {
        claypit: { label: "Clay Pit", description: "Dig clay for bricks and the kiln." },
        kiln: { label: "Kiln", description: "Fire bricks from clay." },
        library: { label: "Library", description: "Research skills one category at a time." },
        mine: { label: "Mine", description: "Strike veins for iron ore." },
        smith: { label: "Smith", description: "Smelt ore into iron bars." },
        lumbermill: { label: "Lumbermill", description: "Saw logs into lumber." },
        garden: { label: "Garden", description: "Automation, so you can go outside." },
        inn: { label: "Inn", description: "Host guests for rumors and chat." },
        workshop: { label: "Workshop", description: "Upgrades for the different buildings." },
        guild: { label: "Guild", description: "Train under a class and switch your path." },
        market: { label: "Market", description: "Trading hall (content not implemented yet)." },
        mage_tower: { label: "Mage Tower", description: "Arcane workshops to be added later." }
    },

    costToParts: function(cost) {
        const c = cost || {};
        const parts = [];
        if ((c.gold || 0) > 0) parts.push(`${intToStringRound(c.gold)} gold`);
        if ((c.bars || 0) > 0) parts.push(`${intToStringRound(c.bars)} bars`);
        if ((c.bricks || 0) > 0) parts.push(`${intToStringRound(c.bricks)} bricks`);
        if ((c.lumber || 0) > 0) parts.push(`${intToStringRound(c.lumber)} lumber`);
        return parts;
    },

    resolveCost: function(def, buildingSegment) {
        if (def.progressCostPurchase && buildingSegment && data.progress.base[buildingSegment]) {
            return townData.computedProgressGearPurchaseCost(buildingSegment);
        }
        if (typeof def.getCost === "function") {
            return def.getCost();
        }
        if (def.cost !== undefined) {
            return def.cost;
        }
    },

    addCostDelta: function(current, delta) {
        const keys = ["gold", "bars", "bricks", "lumber"];
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
        const keys = ["gold", "bars", "bricks", "lumber"];
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

    /** Next gear/desk purchase price from townData.limits + saved gearSets only. */
    computedProgressGearPurchaseCost: function(siteKey) {
        const bdef = townData.buildings[siteKey];
        const lim = bdef && bdef.limits;
        const slot = data.progress.base[siteKey];
        if (!lim || !lim.gearBaseCost || !slot) {
            return {};
        }
        const n = slot.gearSets || 0;
        return townData.addCostDelta(lim.gearBaseCost, townData.scaleCostDelta(lim.gearCostIncrease, n));
    },

    /** Next inn room expansion cost from workshop.limits + innRoomUpgradesBought only. */
    computedWorkshopInnRoomCost: function() {
        const w = data.progress.base.workshop;
        const L = townData.buildings.workshop.limits;
        const bought = w.innRoomUpgradesBought || 0;
        return {
            gold: L.innRoomBaseGold + bought * L.innRoomGoldStep,
            bricks: L.innRoomBaseBricks + bought * L.innRoomBricksStep
        };
    },

    /** After purchase of a worker desk / research desk tier (gearSets only is saved). */
    applyProgressCostPurchase: function(siteKey) {
        const b = data.progress.base[siteKey];
        b.gearSets = (b.gearSets || 0) + 1;
    },

    buyForFromCost: function(costOrGetter) {
        const c = typeof costOrGetter === "function" ? costOrGetter() : costOrGetter;
        const parts = townData.costToParts(c);
        return `Buy for [${parts.join(", ")}]`;
    },

    canAffordCost: function(cost) {
        if (typeof isDebug !== "undefined" && isDebug) {
            return true;
        }
        const base = data.progress.base;
        const res = base.resources;
        const c = cost || {};
        if ((c.gold || 0) > data.progress.gold) return false;
        if ((c.bars || 0) > (res.ironBar || 0)) return false;
        if ((c.bricks || 0) > (res.bricks || 0)) return false;
        if ((c.lumber || 0) > (res.lumber || 0)) return false;
        return true;
    },

    deductCost: function(cost) {
        if (typeof isDebug !== "undefined" && isDebug) {
            return;
        }
        const base = data.progress.base;
        const res = base.resources;
        const c = cost || {};
        data.progress.gold -= (c.gold || 0);
        res.ironBar -= (c.bars || 0);
        res.bricks -= (c.bricks || 0);
        res.lumber = (res.lumber || 0) - (c.lumber || 0);
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

    guildBuyBtn: function(classKey) {
        return `base_guild_${classKey}_buy_btn`;
    },

    guildSwitchBtn: function(classKey) {
        return `base_guild_${classKey}_switch_btn`;
    },

    /** Garden map manuals (keys match progress base.garden mapManual*) */
    gardenManualMapKey: function(rowKey) {
        const map = {
            inn: "mapManualInn",
            mine: "mapManualMine",
            smith: "mapManualSmith",
            claypit: "mapManualClaypit",
            kiln: "mapManualKiln"
        };
        const k = map[rowKey];
        if (!k) {
            return "";
        }
        return k;
    },

    /** Whether the travel-map shortcut button for a Garden row should show */
    mapManualShortcutVisible: function(rowKey, b) {
        const base = b || data.progress.base;
        const g = base.garden;
        if (rowKey === "inn") {
            return !!(g.mapManualInn && base.inn.openForGuests);
        }
        const mk = townData.gardenManualMapKey(rowKey);
        if (!g[mk]) {
            return false;
        }
        const site = base[rowKey];
        return (site.assignedWorkers || 0) > 0;
    },

    /** Mine / smith / claypit / kiln / lumbermill - gear + workers panel (mine–kiln also drive progress caches). */
    workerSitePanelOrder: ["mine", "smith", "claypit", "kiln", "lumbermill"],

    /** Element ids: base_<building>_<suffix>_btn (assign +/++/>>> and unassign -/--/<< for adjustWorkers). Library uses the same suffixes. */
    workerAdjustIncrBtnSuffixes: ["assign_one", "assign_ten", "assign_all"],
    workerAdjustDecrBtnSuffixes: ["unassign_one", "unassign_ten", "unassign_all"],

    buildings: {
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
                    cost: { gold: 10 },
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
                    cost: { gold: 20 },
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
                    cost: { gold: 300 },
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

        townhall: {
            description: "Use civic upgrades to reveal and enable buildings.",
            upgradesOrder: ["hireLocal"],
            upgrades: {
                hireLocal: {
                    key: "hire",
                    name: "Hire Local",
                    description: "Hire up to two workers.",
                    rowVisible: function() {
                        const tu = data.progress.base.townhall.townUpgrades;
                        return (tu.hireLocalBought || 0) < 2;
                    },
                    getCost: function() {
                        const tu = data.progress.base.townhall.townUpgrades;
                        const hireBought = tu.hireLocalBought || 0;
                        if (hireBought >= 2) return { gold: 0 };
                        if (hireBought === 0) return { gold: townData.townhallHireFirstGoldCost };
                        return { gold: townData.townhallHireSecondGoldCost };
                    },
                    canBuy: function() {
                        return data.progress.base.townhall.townUpgrades.hireLocalBought < 2;
                    },
                    onBuy: function() {
                        const tu = data.progress.base.townhall.townUpgrades;
                        tu.hireLocalBought = (tu.hireLocalBought || 0) + 1;
                    },
                    hireMaxed: function() {
                        return (data.progress.base.townhall.townUpgrades.hireLocalBought || 0) >= 2;
                    },
                    extraInfo: function() {
                        const tu = data.progress.base.townhall.townUpgrades;
                        const hireBought = tu.hireLocalBought || 0;
                        return hireBought >= 2 ? "" : `${hireBought}/2 bought`;
                    },
                    upgradeSoldOut: function() {
                        return (data.progress.base.townhall.townUpgrades.hireLocalBought || 0) >= 2;
                    },
                    soldOutButtonLabel: "Bought"
                }
            }
        },

        mine: {
            limits: {
                gearBaseCost: { gold: 20, bars: 0 },
                gearCostIncrease: { gold: 10, bars: 2 }
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

        smith: {
            limits: {
                forgeAttackMax: 5,
                forgeArmorMax: 6,
                forgeAttackBaseBars: 60,
                forgeAttackCostStepBars: 40,
                forgeArmorCost: { bars: 30 },
                gearBaseCost: { gold: 20, bars: 0 },
                gearCostIncrease: { gold: 10, bars: 2 }
            },
            progressDefaults: {
                assignedWorkers: 0,
                gearSets: 0,
                progress: 0,
                workerPower: 0,
                attackUpgradesBought: 0,
                armorUpgradesBought: 0,
                manualCooldownMs: 0
            },
            workers: {
                gearKey: "gear",
                gearName: "Smelting gear",
                gearDescription: "Assign workers for passive bars",
                panelProgressFillId: "baseSmithProgressFill",
                panelProgressWrapId: "baseSmithProgressWrap",
                panelStatusRowHtml: function(res) {
                    return `Iron Ore: ${intToStringRound(res.ironOre)} | Iron Bar: ${intToStringRound(res.ironBar)}`;
                },
                manualOnclick: "events.manualSmelt()",
                manualLabel: "Press to stoke forge (+5s × assigned workers)",
                manualBtnId: "base_smith_manual_btn",
                manualCdWrapId: "base_smith_cd_wrap",
                manualCdFillId: "base_smith_cd_fill",
                manualCdTextId: "base_smith_cd_text"
            },
            upgradesAfterWorkersOrder: ["forgeAttack", "forgeArmor"],
            upgradesOrder: ["gear"],
            upgrades: {
                gear: {
                    key: "gear",
                    progressCostPurchase: true,
                    canBuy: function() {
                        return true;
                    }
                },
                forgeAttack: {
                    key: "attack",
                    name: "Improve Forge Weapons",
                    description: "Send you off with a firmer slap each time. Attack damage +1.",
                    wrapClass: "base-gap-top",
                    getCost: function() {
                        const lim = townData.buildings.smith.limits;
                        const bought = data.progress.base.smith.attackUpgradesBought || 0;
                        return {
                            bars: lim.forgeAttackBaseBars + bought * lim.forgeAttackCostStepBars
                        };
                    },
                    canBuy: function() {
                        const lim = townData.buildings.smith.limits;
                        return (data.progress.base.smith.attackUpgradesBought || 0) < lim.forgeAttackMax;
                    },
                    onBuy: function() {
                        const smith = data.progress.base.smith;
                        smith.attackUpgradesBought = (smith.attackUpgradesBought || 0) + 1;
                        initialize.calcPlayerStats(false);
                    },
                    extraInfo: function() {
                        const smith = data.progress.base.smith;
                        const max = townData.buildings.smith.limits.forgeAttackMax;
                        const maxed = (smith.attackUpgradesBought || 0) >= max;
                        if (maxed) return "";
                        const atkB = smith.attackUpgradesBought || 0;
                        return `${atkB}/${max} bought, total effect: +${atkB} base attack`;
                    },
                    rowVisible: function(hideMaxed) {
                        const smith = data.progress.base.smith;
                        const max = townData.buildings.smith.limits.forgeAttackMax;
                        const maxed = (smith.attackUpgradesBought || 0) >= max;
                        return !(hideMaxed && maxed);
                    },
                    upgradeSoldOut: function() {
                        const max = townData.buildings.smith.limits.forgeAttackMax;
                        return (data.progress.base.smith.attackUpgradesBought || 0) >= max;
                    },
                    soldOutButtonLabel: "Bought"
                },
                forgeArmor: {
                    key: "armor",
                    name: "Improve Forge Armor",
                    description: "Send you off with better armor each time. Base HP +5.",
                    getCost: function() {
                        return townData.buildings.smith.limits.forgeArmorCost;
                    },
                    canBuy: function() {
                        const max = townData.buildings.smith.limits.forgeArmorMax;
                        return (data.progress.base.smith.armorUpgradesBought || 0) < max;
                    },
                    onBuy: function() {
                        data.progress.base.smith.armorUpgradesBought++;
                        initialize.calcPlayerStats(false);
                    },
                    extraInfo: function() {
                        const smith = data.progress.base.smith;
                        const max = townData.buildings.smith.limits.forgeArmorMax;
                        const smithArmorMaxed = (smith.armorUpgradesBought || 0) >= max;
                        if (smithArmorMaxed) return "";
                        const armB = smith.armorUpgradesBought || 0;
                        return `${armB}/${max} bought, total effect: +${armB * 5} base HP`;
                    },
                    rowVisible: function(hideMaxed) {
                        const smith = data.progress.base.smith;
                        const max = townData.buildings.smith.limits.forgeArmorMax;
                        const smithArmorMaxed = (smith.armorUpgradesBought || 0) >= max;
                        return !(hideMaxed && smithArmorMaxed);
                    },
                    upgradeSoldOut: function() {
                        const max = townData.buildings.smith.limits.forgeArmorMax;
                        return (data.progress.base.smith.armorUpgradesBought || 0) >= max;
                    },
                    soldOutButtonLabel: "Bought"
                }
            }
        },

        claypit: {
            limits: {
                gearBaseCost: { gold: 10, bars: 0 },
                gearCostIncrease: { gold: 10, bars: 2 }
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
                gearName: "Digger tools",
                gearDescription: "Assign workers for passive clay",
                panelProgressFillId: "baseClaypitProgressFill",
                panelProgressWrapId: "baseClaypitProgressWrap",
                panelStatusRowHtml: function(res) {
                    return `Clay: ${intToStringRound(res.stone)}`;
                },
                manualOnclick: "events.manualLumber()",
                manualLabel: "Press to dig clay (+5s × assigned workers)",
                manualBtnId: "base_claypit_manual_btn",
                manualCdWrapId: "base_claypit_cd_wrap",
                manualCdFillId: "base_claypit_cd_fill",
                manualCdTextId: "base_claypit_cd_text"
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

        kiln: {
            limits: {
                gearBaseCost: { gold: 10, bars: 0 },
                gearCostIncrease: { gold: 10, bars: 2 }
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
                gearName: "Burner tools",
                gearDescription: "Assign workers for passive bricks",
                panelProgressFillId: "baseKilnProgressFill",
                panelProgressWrapId: "baseKilnProgressWrap",
                panelStatusRowHtml: function(res) {
                    return `Clay: ${intToStringRound(res.stone)} | Bricks: ${intToStringRound(res.bricks)}`;
                },
                manualOnclick: "events.manualSaw()",
                manualLabel: "Press to fire bricks (+5s × assigned workers)",
                manualBtnId: "base_kiln_manual_btn",
                manualCdWrapId: "base_kiln_cd_wrap",
                manualCdFillId: "base_kiln_cd_fill",
                manualCdTextId: "base_kiln_cd_text"
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

        lumbermill: {
            limits: {
                gearBaseCost: { gold: 20, bars: 0 },
                gearCostIncrease: { gold: 10, bars: 2 }
            },
            progressDefaults: {
                assignedWorkers: 0,
                gearSets: 0,
                progress: 0,
                manualCooldownMs: 0
            },
            workers: {
                gearKey: "gear",
                gearName: "Woodworking gear",
                gearDescription: "Assign workers for passive lumber",
                panelStatusRowHtml: function(res) {
                    return `Logs: ${intToStringRound(res.logs || 0)} | Lumber: ${intToStringRound(res.lumber || 0)}`;
                },
                manualOnclick: "events.manualWood()",
                manualLabel: "Press to saw logs (+5s × assigned workers)",
                manualBtnId: "base_lumbermill_manual_btn",
                manualCdWrapId: "base_lumbermill_cd_wrap",
                manualCdFillId: "base_lumbermill_cd_fill",
                manualCdTextId: "base_lumbermill_cd_text"
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
                openForGuests: false,
                nextGuestTimerMs: 60000,
                guests: [],
                guestIdCounter: 1,
                advertiseCooldownMs: 0
            },
            upgradesOrder: ["openForGuests"],
            upgrades: {
                openForGuests: {
                    key: "openGuests",
                    name: "Open for guests",
                    description: "Travelers arrive with stories and rumors.",
                    cost: { gold: 100 },
                    canBuy: function() {
                        return !data.progress.base.inn.openForGuests;
                    },
                    onBuy: function() {
                        data.progress.base.inn.openForGuests = true;
                    },
                    extraInfo: function() {
                        return "";
                    },
                    rowVisible: function() {
                        return !data.progress.base.inn.openForGuests;
                    }
                }
            },
            advertiseAction: {
                btnId: "base_inn_adv_btn",
                label: "Press to advertise (-5s guest timer)",
                onclick: "events.advertiseInn()",
                cdWrapId: "base_inn_adv_cd_wrap",
                cdFillId: "base_inn_adv_cd_fill",
                cdTextId: "base_inn_adv_cd_text"
            },
            statusRowIds: { openActive: "base_inn_open_row", nextGuest: "base_inn_next_row" },
            emptyGuestsId: "base_inn_empty",
            emptyGuestsText: "No guests currently."
        },

        guild: {
            currentStatusRowId: "base_guild_current",
            upgradesOrder: ["warrior", "rogue", "hunter"],
            upgrades: {
                warrior: {
                    key: "warrior",
                    getCost: function() {
                        return { gold: initialize.getClassDef("warrior").buyCostGold || 500 };
                    },
                    canBuy: function() {
                        return !data.progress.unlockedClasses.warrior;
                    },
                    onBuy: function() {
                        data.progress.unlockedClasses.warrior = true;
                    }
                },
                rogue: {
                    key: "rogue",
                    getCost: function() {
                        return { gold: initialize.getClassDef("rogue").buyCostGold || 500 };
                    },
                    canBuy: function() {
                        return !data.progress.unlockedClasses.rogue;
                    },
                    onBuy: function() {
                        data.progress.unlockedClasses.rogue = true;
                    }
                },
                hunter: {
                    key: "hunter",
                    getCost: function() {
                        return { gold: initialize.getClassDef("hunter").buyCostGold || 500 };
                    },
                    canBuy: function() {
                        return !data.progress.unlockedClasses.hunter;
                    },
                    onBuy: function() {
                        data.progress.unlockedClasses.hunter = true;
                    }
                }
            }
        },

        library: {
            limits: {
                gearBaseCost: { gold: 10, bricks: 0 },
                gearCostIncrease: { gold: 10, bricks: 5 }
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
                        const c = townData.computedProgressGearPurchaseCost("library");
                        return `Next desk: ${intToStringRound(c.gold || 0)} gold, ${intToStringRound(c.bricks || 0)} bricks`;
                    }
                }
            },
            queueNote: "Skills are researched one at a time in order.",
            emptySkillsId: "base_library_empty",
            emptySkillsText: "All skills researched."
        },

        workshop: {
            limits: {
                innRoomTierMax: 7,
                innRoomBaseGold: 500,
                innRoomBaseBricks: 50,
                innRoomGoldStep: 100,
                innRoomBricksStep: 10
            },
            progressDefaults: {
                innRoomUpgradesBought: 0,
                sandalBuilt: false
            },
            upgradesOrder: ["innRoomExpansion", "spareSandals"],
            upgrades: {
                innRoomExpansion: {
                    key: "room",
                    name: "Inn room expansion",
                    description: "Adds another guest slot at the Inn.",
                    getCost: function() {
                        return townData.computedWorkshopInnRoomCost();
                    },
                    canBuy: function() {
                        const max = townData.buildings.workshop.limits.innRoomTierMax;
                        return (data.progress.base.workshop.innRoomUpgradesBought || 0) < max;
                    },
                    onBuy: function() {
                        const w = data.progress.base.workshop;
                        w.innRoomUpgradesBought = (w.innRoomUpgradesBought || 0) + 1;
                    },
                    extraInfo: function() {
                        const w = data.progress.base.workshop;
                        const max = townData.buildings.workshop.limits.innRoomTierMax;
                        const roomMaxed = (w.innRoomUpgradesBought || 0) >= max;
                        if (roomMaxed) return "";
                        return `${w.innRoomUpgradesBought || 0}/${max} purchased`;
                    },
                    rowVisible: function(hideMaxed) {
                        const max = townData.buildings.workshop.limits.innRoomTierMax;
                        const roomMaxed = (data.progress.base.workshop.innRoomUpgradesBought || 0) >= max;
                        return !(hideMaxed && roomMaxed);
                    },
                    upgradeSoldOut: function() {
                        const max = townData.buildings.workshop.limits.innRoomTierMax;
                        return (data.progress.base.workshop.innRoomUpgradesBought || 0) >= max;
                    },
                    soldOutButtonLabel: "Bought"
                },
                spareSandals: {
                    key: "sandal",
                    name: "Spare sandals",
                    description: "Unlocks sandal attacks to strike enemies at range.",
                    cost: { gold: 200, bricks: 20 },
                    canBuy: function() {
                        return !data.progress.base.workshop.sandalBuilt;
                    },
                    onBuy: function() {
                        data.progress.base.workshop.sandalBuilt = true;
                        data.progress.sandalAttackEnabled = true;
                    },
                    extraInfo: function() {
                        return "";
                    },
                    rowVisible: function(hideMaxed) {
                        return !(hideMaxed && data.progress.base.workshop.sandalBuilt);
                    },
                    upgradeSoldOut: function() {
                        return !!data.progress.base.workshop.sandalBuilt;
                    },
                    soldOutButtonLabel: "Built"
                }
            }
        },

        garden: {
            progressDefaults: {
                smartHarvestUnlocked: false,
                mapManualInn: false,
                mapManualMine: false,
                mapManualSmith: false,
                mapManualClaypit: false,
                mapManualKiln: false
            },
            introMuted: "Cultivate shortcuts to place manual buttons on the map.",
            upgradesOrder: ["smartHarvest", "inn", "mine", "smith", "claypit", "kiln"],
            upgrades: {
                smartHarvest: {
                    key: "smartHarvest",
                    name: "Smart Harvest",
                    description: "Intruders Cleared stays at 100% until you choose Start harvest on the map; that begins the respawn timer and a foraging run.",
                    cost: { gold: 50, lumber: 10 },
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
                },
                inn: {
                    key: "inn",
                    name: "Advertise (Inn)",
                    description: "Places the Advertise shortcut on the travel map near the Inn.",
                    cost: { gold: 200 },
                    canBuy: function() {
                        return !data.progress.base.garden.mapManualInn;
                    },
                    onBuy: function() {
                        data.progress.base.garden.mapManualInn = true;
                    }
                },
                mine: {
                    key: "mine",
                    name: "Mine",
                    description: "Places the Mine shortcut on the travel map.",
                    cost: { gold: 200 },
                    canBuy: function() {
                        return !data.progress.base.garden.mapManualMine;
                    },
                    onBuy: function() {
                        data.progress.base.garden.mapManualMine = true;
                    }
                },
                smith: {
                    key: "smith",
                    name: "Smelt (Smith)",
                    description: "Places the Smelt shortcut on the travel map near the Smith.",
                    cost: { gold: 200 },
                    canBuy: function() {
                        return !data.progress.base.garden.mapManualSmith;
                    },
                    onBuy: function() {
                        data.progress.base.garden.mapManualSmith = true;
                    }
                },
                claypit: {
                    key: "claypit",
                    name: "Dig (Clay Pit)",
                    description: "Places the Dig shortcut on the travel map near the Clay Pit.",
                    cost: { gold: 200 },
                    canBuy: function() {
                        return !data.progress.base.garden.mapManualClaypit;
                    },
                    onBuy: function() {
                        data.progress.base.garden.mapManualClaypit = true;
                    }
                },
                kiln: {
                    key: "kiln",
                    name: "Fire (Kiln)",
                    description: "Places the Fire shortcut on the travel map near the Kiln.",
                    cost: { gold: 200 },
                    canBuy: function() {
                        return !data.progress.base.garden.mapManualKiln;
                    },
                    onBuy: function() {
                        data.progress.base.garden.mapManualKiln = true;
                    }
                }
            },
            emptyPlaceholderId: "base_garden_empty",
            emptyPlaceholderText: "All map manual button upgrades bought."
        },

        market: {
            mutedPlaceholder: "Market upgrades are not implemented yet."
        },

        mage_tower: {
            mutedPlaceholder: "Mage Tower upgrades are not implemented yet."
        }
    },

    townhallUnlockGetDef: function(unlockKey) {
        const th = data.progress.base.townhall;
        const meta = townData.townhallUnlockDefs[unlockKey];
        return {
            unlockKey: unlockKey,
            getCost: function() {
                const costs = townData.defaultTownhallUnlockCosts || {};
                return costs[unlockKey] ? costs[unlockKey] : {};
            },
            canBuy: function() {
                return !th.unlocks[unlockKey];
            },
            onBuy: function() {
                th.unlocks[unlockKey] = true;
                events.markNewBaseContent(unlockKey);
            },
            meta: meta
        };
    },

    townhallUnlockBuyForLabel: function(unlockKey) {
        const def = townData.townhallUnlockGetDef(unlockKey);
        return townData.buyForFromCost(def.getCost);
    }
};

/** Flattened Town Hall building-tab rows for UI helpers. */
townData.townhallUnlocks = townData.townhallUnlockOrder.map(function(k) {
    const m = townData.townhallUnlockDefs[k] || {};
    return { key: k, label: m.label || k, description: m.description || "" };
});

townData.gardenMapManualUpgradeKeys = ["inn", "mine", "smith", "claypit", "kiln"];
townData.gardenManualRows = townData.gardenMapManualUpgradeKeys.map(function(k) {
    const u = townData.buildings.garden.upgrades[k];
    return { kind: k, key: k, label: u.name, description: u.description };
});
