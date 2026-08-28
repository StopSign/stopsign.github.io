//used for driver.js timing:
let screenSize;
let lastAnimationTime = 0;
let timeAccumulators = { view20: 0, view10: 0, view1: 0 };
let debugDelta = Date.now();
let timeSinceLastSave = 0;
let isSkipping = false;
let lastRealSecondTime = performance.now();
let tickResidue = 0; // Stores fractional ticks
let lastTickTime = 0;

let timerId = null;
let saveName = "battleLoops1"; //Blank if you don't want to save, change name to force user reset
const CODE_SAVE_VERSION = 0;

let data = {};
let language = "english";
let globalVisible = false; //SET FOR COMMIT
// let globalVisible = true;
// let isLoadingEnabled = true; //SET FOR COMMIT
let isLoadingEnabled = false;
let loadStaticSaveFile = false; //SET FOR COMMIT
// let loadStaticSaveFile = true;
let isSteam = false; //SET FOR COMMIT
// let isSteam = true; //SET FOR STEAM BUILD

// let isDebug = false; //SET FOR COMMIT
let isDebug = true;
let showPathDebug = false;
let debugLevel = 0; //To start at different parts of the game
let debugAtelierUpgradesFree = false;
function debug() {
    if (!isDebug) {
        return;
    }
    //
    // resortData.getFoxDenUnlockOrder().forEach(function(k) {
    //     engine.completeFoxDenConstruction(k);
    // });
    //
    // debugCompleteConstruction()
    // debugAddResources()
    // debugShowPaths()
    // debugAddPlantSpirits(3, 4)
    // debugAddEarthSpirits(3,4)
    // debugAddWaterSpirits(3,1)
    // debugAddFireSpirits(3,1)
    // debugSetMineDepth(1)
    // debugBuyAtelierUpgrades()
    //
    // data.progress.battleUnlocked = true;
    // data.progress.showBattle = true;

    
    // debugResearchAllSkills()
}

function debugShowPaths() {
    engine.getResortPathSegmentSpecs().forEach(function(_, i) {
        const seg = engine.getPathSegmentData(i);
        if (seg) {
            seg.state = "Clear";
        }
    });
    engine.checkMapRevealTriggers();
}

function debugAddPlantSpirits() {
    const plantSpiritMax = resortData.bambooForestConfig.plantSpiritMax;
    while ((data.progress.base.torii.plantSpiritsBought) < plantSpiritMax) {
        engine.assemblePlantSpiritFromPurchase();
    }
}

function debugSetSpiritLevel(spirit, level) {
    if (!spirit) {
        return;
    }
    const target = Math.max(1, Math.floor(level || 1));
    spirit.level = 1;
    spirit.exp = 0;
    spirit.expToLevel = 15;
    spirit.spiritPower = engine.getSpiritPowerForLevel(1);
    while (spirit.level < target) {
        spirit.level += 1;
        spirit.expToLevel = Math.round(spirit.expToLevel * 1.8);
        spirit.spiritPower = engine.getSpiritPowerForLevel(spirit.level);
    }
}

function debugAddEarthSpirits(count, startLevel) {
    const hs = data.progress.base && data.progress.base.hiddenSpring;
    if (!hs) {
        return;
    }
    const target = count !== undefined ? count : engine.getHiddenSpringSpiritSlotMax();
    while ((hs.earthSpiritsBought || 0) < target) {
        if (!engine.assembleEarthSpiritFromPurchase()) {
            break;
        }
        if (startLevel !== undefined && startLevel > 1 && hs.spirits && hs.spirits.length) {
            debugSetSpiritLevel(hs.spirits[hs.spirits.length - 1], startLevel);
        }
    }
}

function debugAddWaterSpirits(count, startLevel) {
    const hs = data.progress.base && data.progress.base.hiddenSpring;
    if (!hs) {
        return;
    }
    const target = count !== undefined ? count : engine.getHiddenSpringSpiritSlotMax();
    while ((hs.waterSpiritsBought || 0) < target) {
        if (!engine.assembleWaterSpiritFromPurchase()) {
            break;
        }
        if (startLevel !== undefined && startLevel > 1 && hs.spirits && hs.spirits.length) {
            debugSetSpiritLevel(hs.spirits[hs.spirits.length - 1], startLevel);
        }
    }
}

function debugAddFireSpirits(count, startLevel) {
    const hs = data.progress.base && data.progress.base.hiddenSpring;
    if (!hs) {
        return;
    }
    const target = count !== undefined ? count : engine.getHiddenSpringSpiritSlotMax();
    while ((hs.fireSpiritsBought || 0) < target) {
        if (!engine.assembleFireSpiritFromPurchase()) {
            break;
        }
        if (startLevel !== undefined && startLevel > 1 && hs.spirits && hs.spirits.length) {
            debugSetSpiritLevel(hs.spirits[hs.spirits.length - 1], startLevel);
        }
    }
}

function debugSetMineDepth(depth) {
    const mine = data.progress.base.mine;
    const d = Math.max(0, Math.floor(depth || 0));
    data.progress.base.mapRevealed.mine = true;
    mine.currentDepth = d;
    if (!mine.clearsByDepth) {
        mine.clearsByDepth = {};
    }
    for (let i = 0; i <= d; i++) {
        if (mine.clearsByDepth[i] === undefined) {
            mine.clearsByDepth[i] = 0;
        }
    }
    mine.blocks = engine.createMineBlocksForDepth(d);
    mine.playTimerMs = 0;
}

function debugResearchAllSkills() {
    const lib = data.progress.base.scrollArchives;
    Object.keys(data.progress.skills).forEach(function(k) {
        lib.unlockedSkills[k] = true;
    });
}

function debugAddResources() {
    data.progress.base.bambooForest.wood = 5000;
    data.progress.base.stonePile.stone = 5000;
    data.progress.starBeads = 50000;
    data.progress.coins = 50000;
    data.progress.mana.amount = 9000;
}

function debugCompleteConstruction() {
    engine.completeFoxDenConstruction("torii");
    engine.completeFoxDenConstruction("inn");
    engine.completeFoxDenConstruction("garden");
    engine.completeFoxDenConstruction("atelier");
    engine.completeFoxDenConstruction("mage_tower");
    engine.completeFoxDenConstruction("bonfire");
    engine.completeFoxDenConstruction("scrollArchives");
    engine.completeFoxDenConstruction("cistern");
    engine.completeFoxDenConstruction("pond");


    engine.completeFoxDenConstruction("bar");
    engine.completeFoxDenConstruction("laundry");
    engine.completeFoxDenConstruction("market");
}

function debugBuyAtelierUpgrade(key, times) {
    const atelier = resortData.buildings && resortData.buildings.atelier;
    if (!atelier || !atelier.upgrades) {
        return;
    }
    const up = atelier.upgrades[key];
    if (!up || typeof up.onBuy !== "function") {
        return;
    }
    const count = times !== undefined ? times : 1;
    for (let i = 0; i < count; i++) {
        if (typeof up.canBuy === "function" && !up.canBuy()) {
            break;
        }
        up.onBuy();
    }
}

function debugBuyAtelierUpgrades() {
    debugAtelierUpgradesFree = true;
    debugBuyAtelierUpgrade("addForge", 1);
    debugBuyAtelierUpgrade("organizeOrders", 2);
    debugBuyAtelierUpgrade("makeBaskets", 2);
    debugBuyAtelierUpgrade("betterAxes", 1);
    // debugBuyAtelierUpgrade("magicLooms", 1);
    // debugBuyAtelierUpgrade("createMetalFireLauncher", 3);
    // debugBuyAtelierUpgrade("improvePaths", 1);
    // debugBuyAtelierUpgrade("collectShards", 1); // moved to Scroll Archives
    // debugBuyAtelierUpgrade("spareSandals", 1);
    // debugBuyAtelierUpgrade("sprinkleOre", 1);
    debugAtelierUpgradesFree = false;
}

let initials = {
    base: function() {
        const pb = function(buildingKey) {
            const def = resortData.buildings[buildingKey] && resortData.buildings[buildingKey].progressDefaults;
            return def ? JSON.parse(JSON.stringify(def)) : {};
        };
        return {
            foxDen: Object.assign({
                unlocks: Object.assign({}, resortData.getDefaultFoxDenUnlocksState()),
                constructionQueue: [],
                constructionSites: {},
                constructionCarriers: [],
                upgradeGatherJobs: {},
                upgradeGatherQueue: [],
                lastCarrierSpawnMs: 0,
                assignedWorkers: 0,
                gearSets: 1,
                _reviewWeaveAccumMs: 0,
                manaOrdersEnabled: false
            }),
            bambooForest: pb("bambooForest"),
            mapRevealed: Object.assign({}, resortData.defaultMapRevealedState),
            mine: {
                resources: {
                    dirt: 0,
                    stone: 0,
                    ore: 0
                },
                currentDepth: 0,
                clearsByDepth: { 0: 0 },
                blocks: null,
                playTimerMs: 0,
                prioritizeOre: false
            },
            scrollArchives: pb("scrollArchives"),
            inn: Object.assign(pb("inn"), {
                roomsAvailable: 1,
                roomsOccupied: 0,
                restfulnessPerSecond: 1,
                furnitureBought: 0,
                decorationBought: 0,
                addRoomBought: 0,
                reinforceJointsBought: 0,
                onsenConverted: false,
                hotWater: 0,
                hotWaterCapacity: 20,
                waterCarriers: [],
                carrierIdCounter: 1,
                assignedWorkers: 0,
                gearSets: 1,
                guests: [],
                guestLog: [],
                guestIdCounter: 1
            }),
            atelier: pb("atelier"),
            garden: pb("garden"),
            bonfire: pb("bonfire"),
            mage_tower: pb("mage_tower"),
            torii: {
                assignedWorkers: 0,
                gearSets: 1,
                workerPower: 0,
                visitorsWaiting: 0,
                maxVisitors: 2,
                queuePostsBought: 0,
                nextVisitorTimerMs: 60000,
                visitorIntervalMs: 60000,
                callForAllyBought: 0,
                plantSpiritsBought: 0,
                karmaCheckPowerRequired: 30
            },
            laundry: {
                assignedWorkers: 0,
                gearSets: 1,
                workerPower: 0,
                cleanPowerRequired: 30
            },
            hiddenSpring: {
                earthSpiritsBought: 0,
                pebbleCapacityBought: 0,
                carryingCapacityBought: 0,
                waterSpiritsBought: 0,
                fireSpiritsBought: 0,
                oreMined: false,
                bringOreToAtelierUnlocked: false,
                spiritCostBase: 50,
                spiritCostMult: 10,
                spiritMax: 3,
                spiritIdCounter: 1,
                spirits: [],
                pebbleGlobalCooldownMs: 0,
                dropletGlobalCooldownMs: 0
            },
            stonePile: {
                stone: 0
            },
            fireLaunchers: {
                builtCount: 0,
                platforms: {
                    pathMid: { embers: 0, attackTimerMs: 0 },
                    bendTop: { embers: 0, attackTimerMs: 0 },
                    pathLower: { embers: 0, attackTimerMs: 0 }
                },
                projectiles: [],
                aoePulses: []
            },
            cistern: {
                waterVolume: 0,
                temperature: 0,
                essence: 0,
                capacityBought: 0,
                replaceWithHotterWater: false,
                assignedWorkers: 0,
                gearSets: 1,
                waterCarriers: [],
                carrierIdCounter: 1
            },
            pond: {
                waterVolume: 0,
                pipesToForestUnlocked: false,
                sendWaterToBambooForest: false,
                wishingWellBought: 0
            },
            pebbles: [],
            pebbleIdCounter: 1,
            droplets: [],
            dropletIdCounter: 1,
            resources: Object.assign({}, resortData.defaultBaseResources)
        };
    },
    gameSettings: function() {
        return {
            gameSpeed: 1,
            debugSpeedMultiplier: 0,
            bonusSpeed: 1,
            stop: false,
            stopAll: false,
            ticksPerSecond: 20,
            ticksForSeconds: 0,
            renderAlpha: 1,
            numberType: "numberSuffix",
            redeemedBonusCodes: {}
        };
    },
    currentGameState: function() {
        return {
            bonusTime: 0,
            instantTime: 0,
            instantTimerCooldown: 0,
            secondsPassed: 0,
            secondsThisReset: 0,
            dailyTimer: 0,
            dailyCharges: 0
        };
    },
    player: function() {
        const ps = gameData.battle.playerStarting;
        return {
            attackDamage: ps.attackDamage,
            sandalAttackDamage: ps.sandalAttackDamage,
            attackCooldownMs: ps.attackCooldownMs,
            attackTimerMs: ps.attackTimerMs,
            sandalAttackCooldownMs: ps.sandalAttackCooldownMs,
            sandalAttackTimerMs: ps.sandalAttackTimerMs,
            regenPerSecond: 0
        };
    },
    levelState: function() {
        const startExp = gameData.battle.levelStartingExpToLevel;
        return {
            level: 0,
            exp: 0,
            expToLevelBase: startExp,
            expToLevel: startExp,
            unassignedPoints: 0,
            levelStr: 0,
            levelCon: 0,
            levelSpd: 0,
            levelSoul: 0,
            skillStrBonus: 0,
            skillConBonus: 0,
            bitterRivalryStrBonus: 0
        };
    },
    progress: function() {
        return {
            coins: 35,
            starBeads: 0,
            selectedBaseBuilding: "",
            selectedPathSegmentIndex: null,
            selectedResortInfoType: "",
            selectedSpiritId: null,
            selectedFireLauncherKey: null,
            battleUnlocked: false,
            showBattle: false,
            kitsune: {
                total: 2
            },
            okami: {
                level: 0,
                exp: 0,
                assignedBuildingKey: "",
                lastAssignedBuildingKey: "",
                pathJob: null,
                pausedPathJobs: {}
            },
            mana: {
                amount: 0,
                capacityBonus: 0
            },
            manaCapacityBonusPerCombatStart: 10,
            stars: {
                bronze: 0,
                silver: 0,
                gold: 0
            },
            weaving: {
                active: null,
                paused: null
            },
            selectedSkillsTab: "combat",
            selectedSkillDetailKey: "",
            selectedStatsTab: "combat",
            compactViewPane: "menus",
            autoRetryCountdownSec: 0,
            options: {
                hideMaxedUpgrades: true,
                disableCompactLayout: false
            },
            currentMapKey: mapData.defaultStartingMapKey(),
            selectedTravelMapKey: mapData.defaultStartingMapKey(),
            selectedTravelSubTab: "maps",
            mapDefinitions: mapData.getDefaultMaps(),
            mapStars: {},
            mapWorkersFound: {},
            mapClearProgress: {},
            currentClassKey: "none",
            pendingClassKey: "",
            classSwitchCooldownMs: 0,
            unlockedClasses: { none: true },
            attributePlan: [],
            runHistory: [],
            skills: skills.getDefaultSkills(),
            sandalAttackEnabled: false,
            baseContentNotify: {
                building: { foxDen: true },
                subtab: {},
                upgradeSeen: {},
                tab: {},
                tabSeen: {}
            },
            base: initials.base()
        };
    },
    battle: function() {
        return {
            elapsedMs: 0,
            mode: "combat",
            state: "idle",
            resetCount: 0,
            intruderIdCounter: 1,
            enemies: [],
            slapQueue: [],
            activeTargetId: null,
            player: initials.player(),
            levelState: initials.levelState(),
            seed: 1337,
            generatedFromSeed: null,
            currentTab: "base",
            runStartCoins: 0,
            historyLogged: false,
            enemiesKilled: 0,
            runCoinsFromKills: 0,
            completionBonusCoins: 0,
            pendingOkamiExp: 0,
            bonfireModifiers: {},
            mapTier: 0,
            zoneSpawnedInCycle: [],
            activeZones: [],
            transitionCountdownMs: 0,
            transitionMessage: "",
            nextTierAfterCountdown: 0,
            lineFxQueue: [],
            shamelessExpAccMs: 0,
            runSkillTalentStart: null,
            selfAffirmationsSecondAccMs: 0,
            mainCharacterSecondAccMs: 0,
            seetheSecondAccMs: 0,
            fakeTearDropsSecondAccMs: 0,
            numbingCrowdsSecondAccMs: 0,
            classPowerA: 0,
            classPowerB: 0,
            classRetreatMs: 0,
            scoldDashActive: false,
            scoldFlurryMs: 0,
            lastPlayerHitIntruderId: 0,
            lastPlayerHitStreak: 0,
            forageIndexSpawned: {},
            forageKindSpawnCounts: {},
            forageActiveDrainMapKey: "",
            forageMoveAccumPx: 0,
            intruderPool: initials.intruderPool(),
            buffs: battleBuffs.initState()
        };
    },
    intruderPool: function() {
        return {
            availableIds: [],
            inUseIds: {}
        };
    }
};

let initialize = {
    initializeBambooForest: function() {
        const base = data.progress.base;
        const bf = base.bambooForest;
        if (bf.chips === undefined) {
            bf.chips = 0;
        }
        if (bf.water === undefined) {
            bf.water = 0;
        }
        const cfg = resortData.bambooForestConfig;
        const stalkCount = bf.stalkCount || cfg.stalkCount || 4;
        const rowCount = bf.rowCount || cfg.rowCount || 3;
        bf.stalkCount = stalkCount;
        bf.rowCount = rowCount;
        if (!bf.stalks || bf.stalks.length !== stalkCount) {
            bf.stalks = [];
            for (let si = 0; si < stalkCount; si++) {
                bf.stalks.push(engine.createBambooStalk(rowCount));
            }
        }
        for (let sj = 0; sj < bf.stalks.length; sj++) {
            const stalk = bf.stalks[sj];
            if (!stalk.cells || stalk.cells.length !== rowCount) {
                bf.stalks[sj] = engine.createBambooStalk(rowCount, stalk.baseWood);
            } else {
                engine.refreshBambooStalkCapacities(stalk);
            }
        }
    },
    initializeScrollArchives: function() {
        const base = data.progress.base;
        const def = resortData.buildings.scrollArchives.progressDefaults;
        if (!base.scrollArchives) {
            base.scrollArchives = JSON.parse(JSON.stringify(def));
        }
        const lib = base.scrollArchives;
        const keys = Object.keys(def);
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            if (lib[k] === undefined || lib[k] === null) {
                const dv = def[k];
                if (Array.isArray(dv)) {
                    lib[k] = dv.slice();
                } else if (dv && typeof dv === "object") {
                    lib[k] = Object.assign({}, dv);
                } else {
                    lib[k] = dv;
                }
            }
        }
        if (!lib.unlockedSkills) {
            lib.unlockedSkills = {};
        }
        if (!lib.researchChoices) {
            lib.researchChoices = [];
        }
        if (!lib.finishWeaveCostQueue) {
            lib.finishWeaveCostQueue = [];
        }
        if ((lib.researchesToChoose || 0) > 0 && !lib.researchChoices.length) {
            engine.rollScrollArchivesResearchChoices();
        }
    },
    initializeInn: function() {
        const base = data.progress.base;
        const def = resortData.buildings.inn.progressDefaults;
        const extras = {
            roomsAvailable: 1,
            roomsOccupied: 0
        };
        if (!base.inn) {
            base.inn = Object.assign(JSON.parse(JSON.stringify(def)), extras);
        }
        const inn = base.inn;
        const keys = Object.keys(def);
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            if (inn[k] === undefined || inn[k] === null) {
                const dv = def[k];
                if (Array.isArray(dv)) {
                    inn[k] = dv.slice();
                } else if (dv && typeof dv === "object") {
                    inn[k] = Object.assign({}, dv);
                } else {
                    inn[k] = dv;
                }
            }
        }
        if (inn.roomsAvailable === undefined || inn.roomsAvailable === null) {
            inn.roomsAvailable = extras.roomsAvailable;
        }
        if (inn.roomsOccupied === undefined || inn.roomsOccupied === null) {
            inn.roomsOccupied = extras.roomsOccupied;
        }
        if (!inn.guests) {
            inn.guests = [];
        }
        if (!inn.guestLog) {
            inn.guestLog = [];
        }
        if (!inn.waterCarriers) {
            inn.waterCarriers = [];
        }
        for (let gi = 0; gi < inn.guests.length; gi++) {
            initialize.migrateGuestItineraryStep(inn.guests[gi]);
        }
    },
    migrateGuestItineraryStep: function(guest) {
        if (!guest) {
            return;
        }
        if (guest.itineraryStep) {
            if (guest.state !== undefined) {
                delete guest.state;
            }
            return;
        }
        if (guest.state) {
            const legacy = guest.state;
            if (legacy === "settling in") {
                guest.itineraryStep = "settleIn";
            } else if (legacy === "watch water spirits play") {
                guest.itineraryStep = "watchWaterSpirits";
            } else if (legacy === "resting") {
                guest.itineraryStep = "rest";
            } else {
                guest.itineraryStep = "settleIn";
            }
            delete guest.state;
            return;
        }
        if (guest.room !== undefined && guest.room !== null) {
            guest.itineraryStep = "settleIn";
        }
    },
    initializeHiddenSpring: function() {
        const base = data.progress.base;
        const def = {
            earthSpiritsBought: 0,
            pebbleCapacityBought: 0,
            carryingCapacityBought: 0,
            waterSpiritsBought: 0,
            fireSpiritsBought: 0,
            oreMined: false,
            bringOreToAtelierUnlocked: false,
            spiritCostBase: 50,
            spiritCostMult: 10,
            spiritMax: 3,
            spiritIdCounter: 1,
            spirits: [],
            pebbleGlobalCooldownMs: 0,
            dropletGlobalCooldownMs: 0
        };
        if (!base.hiddenSpring) {
            base.hiddenSpring = JSON.parse(JSON.stringify(def));
        }
        const hs = base.hiddenSpring;
        const keys = Object.keys(def);
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            if (hs[k] === undefined || hs[k] === null) {
                const dv = def[k];
                if (Array.isArray(dv)) {
                    hs[k] = dv.slice();
                } else if (dv && typeof dv === "object") {
                    hs[k] = Object.assign({}, dv);
                } else {
                    hs[k] = dv;
                }
            }
        }
        if (!hs.spirits) {
            hs.spirits = [];
        }
        for (let si = 0; si < hs.spirits.length; si++) {
            const sp = hs.spirits[si];
            if (!sp) {
                continue;
            }
            sp.spiritPower = engine.getSpiritPowerForLevel(sp.level || 1);
        }
    },
    initializeFireLaunchers: function() {
        const base = data.progress.base;
        const def = {
            builtCount: 0,
            platforms: {
                pathMid: { embers: 0, attackTimerMs: 0 },
                bendTop: { embers: 0, attackTimerMs: 0 },
                pathLower: { embers: 0, attackTimerMs: 0 }
            },
            projectiles: [],
            aoePulses: []
        };
        if (!base.fireLaunchers) {
            base.fireLaunchers = JSON.parse(JSON.stringify(def));
        }
        const fl = base.fireLaunchers;
        if (fl.builtCount === undefined || fl.builtCount === null) {
            const atelier = base.atelier || {};
            fl.builtCount = atelier.fireLaunchersBought || 0;
        }
        if (!fl.platforms) {
            fl.platforms = {};
        }
        const defs = resortData.fireLauncherPlatformDefs || [];
        for (let i = 0; i < defs.length; i++) {
            const pk = defs[i].key;
            if (!fl.platforms[pk]) {
                fl.platforms[pk] = { embers: 0, attackTimerMs: 0 };
            }
            if (fl.platforms[pk].embers === undefined) {
                fl.platforms[pk].embers = 0;
            }
            if (fl.platforms[pk].attackTimerMs === undefined) {
                fl.platforms[pk].attackTimerMs = 0;
            }
        }
        if (!fl.projectiles) {
            fl.projectiles = [];
        }
        if (!fl.aoePulses) {
            fl.aoePulses = [];
        }
        if (base.atelier && (base.atelier.fireLaunchersBought === undefined || base.atelier.fireLaunchersBought === null)) {
            base.atelier.fireLaunchersBought = fl.builtCount || 0;
        }
    },
    initializeOkami: function() {
        const def = {
            level: 0,
            exp: 0,
            assignedBuildingKey: "",
            lastAssignedBuildingKey: "",
            pathJob: null,
            pausedPathJobs: {}
        };
        if (!data.progress.okami) {
            data.progress.okami = JSON.parse(JSON.stringify(def));
        }
        const okami = data.progress.okami;
        const keys = Object.keys(def);
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            if (okami[k] === undefined || okami[k] === null) {
                const dv = def[k];
                if (dv && typeof dv === "object") {
                    okami[k] = Object.assign({}, dv);
                } else {
                    okami[k] = dv;
                }
            }
        }
        if (!okami.pausedPathJobs) {
            okami.pausedPathJobs = {};
        }
    },
    initializeFoxDen: function() {
        const base = data.progress.base;
        if (!base.foxDen) {
            base.foxDen = Object.assign({
                unlocks: Object.assign({}, resortData.getDefaultFoxDenUnlocksState()),
                constructionQueue: [],
                constructionSites: {},
                constructionCarriers: [],
                upgradeGatherJobs: {},
                upgradeGatherQueue: [],
                lastCarrierSpawnMs: 0,
                assignedWorkers: 0,
                gearSets: 1,
                _reviewWeaveAccumMs: 0
            });
        }
        const rh = base.foxDen;
        if (!rh.unlocks) {
            rh.unlocks = Object.assign({}, resortData.getDefaultFoxDenUnlocksState());
        }
        if (!rh.constructionQueue) {
            rh.constructionQueue = [];
        }
        if (!rh.constructionSites) {
            rh.constructionSites = {};
        }
        if (!rh.constructionCarriers) {
            rh.constructionCarriers = [];
        }
        if (!rh.upgradeGatherJobs) {
            rh.upgradeGatherJobs = {};
        }
        if (!rh.upgradeGatherQueue) {
            rh.upgradeGatherQueue = [];
        }
        if (rh._reviewWeaveAccumMs === undefined) {
            rh._reviewWeaveAccumMs = 0;
        }
        if (rh.lastCarrierSpawnMs === undefined) {
            rh.lastCarrierSpawnMs = 0;
        }
        if (rh.manaOrdersEnabled === undefined) {
            rh.manaOrdersEnabled = false;
        }
        if (rh.assignedWorkers === undefined) {
            rh.assignedWorkers = 0;
        }
        if (rh.gearSets === undefined) {
            rh.gearSets = 1;
        }
        for (let ci = 0; ci < rh.constructionCarriers.length; ci++) {
            const c = rh.constructionCarriers[ci];
            if (!c.jobKey && c.unlockKey) {
                c.jobKey = engine.getBuildingJobKey(c.unlockKey);
            }
        }
        const siteKeys = Object.keys(rh.constructionSites);
        for (let si = 0; si < siteKeys.length; si++) {
            const site = rh.constructionSites[siteKeys[si]];
            if (site && site.paused === undefined) {
                site.paused = false;
            }
        }
    },
    initializeMapRevealed: function() {
        const base = data.progress.base;
        const def = resortData.defaultMapRevealedState;
        if (!base.mapRevealed) {
            base.mapRevealed = Object.assign({}, def);
        }
        const keys = Object.keys(def);
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            if (base.mapRevealed[k] === undefined) {
                base.mapRevealed[k] = def[k];
            }
        }
    },
    initializeAtelier: function() {
        const base = data.progress.base;
        const def = resortData.buildings.atelier.progressDefaults;
        if (!base.atelier) {
            base.atelier = JSON.parse(JSON.stringify(def));
        }
        const atelier = base.atelier;
        const keys = Object.keys(def);
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            if (atelier[k] === undefined || atelier[k] === null) {
                atelier[k] = def[k];
            }
        }
    },
    initializeGarden: function() {
        const base = data.progress.base;
        const def = resortData.buildings.garden.progressDefaults;
        if (!base.garden) {
            base.garden = JSON.parse(JSON.stringify(def));
        }
        const garden = base.garden;
        const keys = Object.keys(def);
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            if (garden[k] === undefined || garden[k] === null) {
                garden[k] = def[k];
            }
        }
    },
    initializeCistern: function() {
        const base = data.progress.base;
        const def = resortData.buildings.cistern.progressDefaults;
        if (!base.cistern) {
            base.cistern = {
                waterVolume: 0,
                temperature: 0,
                essence: 0
            };
        }
        const cistern = base.cistern;
        const keys = Object.keys(def);
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            if (cistern[k] === undefined || cistern[k] === null) {
                cistern[k] = Array.isArray(def[k]) ? [] : def[k];
            }
        }
        if (!cistern.waterCarriers) {
            cistern.waterCarriers = [];
        }
        if (cistern.waterVolume === undefined) {
            cistern.waterVolume = 0;
        }
        if (cistern.temperature === undefined) {
            cistern.temperature = 0;
        }
        if (cistern.essence === undefined) {
            cistern.essence = 0;
        }
    },
    initializeMine: function() {
        const base = data.progress.base;
        const def = {
            resources: { dirt: 0, stone: 0, ore: 0 },
            currentDepth: 0,
            clearsByDepth: { 0: 0 },
            blocks: null,
            playTimerMs: 0,
            prioritizeOre: false
        };
        if (!base.mine) {
            base.mine = JSON.parse(JSON.stringify(def));
        }
        const mine = base.mine;
        if (!mine.resources) {
            mine.resources = { dirt: 0, stone: 0, ore: 0 };
        }
        if (mine.resources.ore === undefined) {
            mine.resources.ore = 0;
        }
        if (mine.prioritizeOre === undefined) {
            mine.prioritizeOre = false;
        }
        if (mine.prioritizeOre && base.hiddenSpring && base.hiddenSpring.spirits) {
            const spirits = base.hiddenSpring.spirits;
            for (let spi = 0; spi < spirits.length; spi++) {
                const sp = spirits[spi];
                if (sp.kind === "earth" && (sp.location || "hiddenSpring") === "hiddenSpring") {
                    sp.prioritizeOre = true;
                }
            }
            mine.prioritizeOre = false;
        }
        if (mine.playTimerMs === undefined) {
            mine.playTimerMs = 0;
        }
        if (!mine.clearsByDepth) {
            mine.clearsByDepth = { 0: 0 };
        }
        if (mine.currentDepth === undefined) {
            mine.currentDepth = 0;
        }
        if (!mine.blocks) {
            mine.blocks = engine.createMineBlocksForDepth(mine.currentDepth || 0);
        }
    },
    initializePathSegments: function() {
        const base = data.progress.base;
        const specs = engine.getResortPathSegmentSpecs();
        if (!base.pathSegments || base.pathSegments.length !== specs.length) {
            const prev = base.pathSegments || [];
            base.pathSegments = [];
            for (let i = 0; i < specs.length; i++) {
                if (prev[i] && prev[i].state) {
                    base.pathSegments.push({
                        state: prev[i].state,
                        hasRailing: !!prev[i].hasRailing,
                        hasStairs: !!prev[i].hasStairs,
                        hasLanterns: !!prev[i].hasLanterns
                    });
                } else {
                    base.pathSegments.push({
                        state: "Large Rocks",
                        hasRailing: false,
                        hasStairs: false,
                        hasLanterns: false
                    });
                }
            }
        }
    },
    initializeBaseContentNotify: function() {
        const def = {
            building: { foxDen: true },
            subtab: {},
            upgradeSeen: {},
            tab: {},
            tabSeen: {}
        };
        if (!data.progress.baseContentNotify) {
            data.progress.baseContentNotify = JSON.parse(JSON.stringify(def));
        }
        const notify = data.progress.baseContentNotify;
        if (!notify.building) {
            notify.building = { foxDen: true };
        }
        if (!notify.subtab) {
            notify.subtab = {};
        }
        if (!notify.upgradeSeen) {
            notify.upgradeSeen = {};
        }
        if (!notify.tab) {
            notify.tab = {};
        }
        if (!notify.tabSeen) {
            notify.tabSeen = {};
        }
    },
    initializeData: function() {
        data.lastVisit = Date.now();
        data.saveVersion = CODE_SAVE_VERSION;
        data.gameState = "default";
        data.resetCount = 1;
        data.gameSettings = initials.gameSettings();
        data.currentGameState = initials.currentGameState();
        data.progress = initials.progress();
        data.battle = initials.battle();
        initialize.initializeBaseContentNotify();
        initialize.initializeBambooForest();
        initialize.initializeScrollArchives();
        initialize.initializeInn();
        initialize.initializeHiddenSpring();
        initialize.initializeFireLaunchers();
        initialize.initializeOkami();
        initialize.initializeFoxDen();
        initialize.initializeMapRevealed();
        initialize.initializeAtelier();
        initialize.initializeGarden();
        initialize.initializeCistern();
        initialize.initializeMine();
        initialize.initializePathSegments();
        initialize.startFreshBattle(data.progress.mapDefinitions[0].seed, data.progress.currentMapKey);
        data.battle.state = data.progress.battleUnlocked ? "running" : "idle";
    },
    startFreshBattle: function(seed, mapKey) {
        const preservedTab = data.battle && data.battle.currentTab ? data.battle.currentTab : "base";
        data.battle = initials.battle();
        data.battle.seed = seed;
        data.battle.generatedFromSeed = seed;
        data.battle.currentTab = preservedTab;
        data.progress.autoRetryCountdownSec = 0;
        data.battle.runStartCoins = data.progress.coins;
        data.battle.historyLogged = false;
        const selectedMapKey = mapKey || data.progress.currentMapKey;
        data.progress.currentMapKey = selectedMapKey;
        const mapDef = initialize.getCurrentMapDefinition();
        data.battle.zoneSpawnedInCycle = [];
        data.battle.zoneRewardGrantedInCycle = [];
        for (let i = 0; i < mapDef.zones.length; i++) {
            data.battle.zoneSpawnedInCycle.push(false);
            data.battle.zoneRewardGrantedInCycle.push(false);
        }
        data.battle.mapTier = 0;
        data.battle.transitionCountdownMs = 0;
        data.battle.transitionMessage = "";
        data.battle.nextTierAfterCountdown = 0;
        data.battle.mode = "combat";
        data.battle.state = data.progress && data.progress.battleUnlocked ? "running" : "idle";
        data.battle.forageIndexSpawned = {};
        data.battle.forageKindSpawnCounts = {};
        data.battle.forageActiveDrainMapKey = "";
        data.battle.forageMoveAccumPx = 0;
        engine.initZoneShardRunCounts();
        engine.applySkillShardExpOnBattleStart();
        initialize.applyPlanForCurrentLevel();
        initialize.calcPlayerStats(true);
        initialize.snapshotRunSkillTalent();
        data.gameSettings.stopAll = false;
    },
    getClassDef: function(classKey) {
        if (typeof bonfire !== "undefined" && bonfire.getClassDef(classKey)) {
            return bonfire.getClassDef(classKey);
        }
        const defs = resortData.bonfireClassDefs;
        return (defs && defs[classKey]) || defs.none;
    },
    getCurrentClassDef: function() {
        const key = data.progress && data.progress.currentClassKey ? data.progress.currentClassKey : "none";
        return initialize.getClassDef(key);
    },
    getClassPerLevelText: function(classKey) {
        const d = initialize.getClassDef(classKey);
        return `+${d.perLevel.str} Bru, +${d.perLevel.con} Con, +${d.perLevel.spd} Spd per level`;
    },
    snapshotRunSkillTalent: function() {
        const snap = {};
        const sk = data.progress.skills || {};
        const keys = Object.keys(sk);
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            snap[k] = sk[k].talentLevel || 0;
        }
        data.battle.runSkillTalentStart = snap;
    },
    resetBattleFromSeed: function() {
        const currentSeed = data.battle.generatedFromSeed || data.battle.seed || 1337;
        const nextResetCount = (data.battle.resetCount || 0) + 1;
        initialize.resetSkillRunProgress();
        initialize.startFreshBattle(currentSeed, data.progress.currentMapKey);
        data.battle.resetCount = nextResetCount;
        data.gameSettings.stopAll = false;
    },
    getCurrentMapDefinition: function() {
        for (let i = 0; i < data.progress.mapDefinitions.length; i++) {
            if (data.progress.mapDefinitions[i].key === data.progress.currentMapKey) {
                return data.progress.mapDefinitions[i];
            }
        }
        return data.progress.mapDefinitions[0];
    },
    resetSkillRunProgress: function() {
        const keys = Object.keys(data.progress.skills);
        for (let i = 0; i < keys.length; i++) {
            skills.resetSkillForRun(data.progress.skills[keys[i]]);
        }
    },
    applyPlanForCurrentLevel: function() {
        const plan = data.progress.attributePlan || [];
        data.battle.levelState.levelStr = 0;
        data.battle.levelState.levelCon = 0;
        data.battle.levelState.levelSpd = 0;
        data.battle.levelState.levelSoul = 0;
        let assignedCount = 0;
        const maxLevelAssignable = data.battle.levelState.level;
        const cls = initialize.getCurrentClassDef();
        data.battle.levelState.levelStr += (cls.perLevel.str || 0) * maxLevelAssignable;
        data.battle.levelState.levelCon += (cls.perLevel.con || 0) * maxLevelAssignable;
        data.battle.levelState.levelSpd += (cls.perLevel.spd || 0) * maxLevelAssignable;
        assignedCount += ((cls.perLevel.str || 0) + (cls.perLevel.con || 0) + (cls.perLevel.spd || 0)) * maxLevelAssignable;
        for (let i = 0; i < plan.length; i++) {
            const entry = plan[i];
            if (entry.level > maxLevelAssignable) {
                continue;
            }
            if (entry.attribute === "str") {
                data.battle.levelState.levelStr++;
                assignedCount++;
            } else if (entry.attribute === "con") {
                data.battle.levelState.levelCon++;
                assignedCount++;
            } else if (entry.attribute === "spd") {
                data.battle.levelState.levelSpd++;
                assignedCount++;
            } else if (entry.attribute === "soul") {
                data.battle.levelState.levelSoul++;
                assignedCount++;
            }
        }
        data.battle.levelState.unassignedPoints = Math.max(0, maxLevelAssignable - assignedCount);
    },
    calcPlayerStats: function(fullHeal) {
        if (data.battle && data.battle.mode === "foraging") {
            const gc = gameData.battle.combat;
            const div = gc.conStrStatDivisor;
            const ls = data.battle.levelState || {};
            const totalCon = (ls.levelCon || 0);
            const totalStr = (ls.levelStr || 0);
            const brEff = skills.getSkillEffect("breathing");
            const breathingBonus = brEff.breathingStaminaCapacityBonus || 0;
            const maxStamina = Math.max(1, Math.ceil((gc.foragingBaseStaminaInner + breathingBonus) * (1 + (totalCon / div))));
            data.battle.player.maxAud = maxStamina;
            if (fullHeal) {
                data.battle.player.aud = maxStamina;
            } else {
                data.battle.player.aud = Math.min(maxStamina, data.battle.player.aud);
            }
            data.battle.player.attackDamage = Math.max(1, roundNearestDecimals(gc.foragingHarvestDamageBase * (1 + (totalStr / div)), 1));
            data.battle.player.sandalAttackDamage = 0;
            data.progress.sandalAttackEnabled = false;
            data.battle.player.regenPerSecond = 0;
            engine.syncPlayerCooldownFields();
            return;
        }
        const gc = gameData.battle.combat;
        const div = gc.conStrStatDivisor;
        const missingAud = data.battle.player.maxAud - data.battle.player.aud;
        let totalCon = data.battle.levelState.levelCon + data.battle.levelState.skillConBonus;
        let totalStr = data.battle.levelState.levelStr + data.battle.levelState.skillStrBonus;
        const shockEff = skills.getSkillEffect("shockValue");
        totalStr += shockEff.shockValueBonusStr || 0;
        const windfallEff = skills.getSkillEffect("windfallSwagger");
        totalCon += windfallEff.windfallBonusCon || 0;
        if (skills.isSkillUnlocked("validation")) {
            const valEff = skills.getSkillEffect("validation");
            const cap = valEff.validationConCap || 0;
            totalCon += Math.min(data.battle.enemiesKilled || 0, cap);
        }
        const fEff = skills.getSkillEffect("force");
        const forceFlat = fEff.slapFlatBeforeStr || 0;
        const fortEff = skills.getSkillEffect("shameless");
        const fortLvl = fortEff.enduranceBaseAudInnerBonus || 0;
        const tenEff = skills.getSkillEffect("corneredEgo");
        const tenInner = tenEff.tenacityAudInnerBonus || 0;
        const baseInner = gc.baseAudInner + fortLvl + tenInner;
        const conMult = 1 + totalCon / div;
        const tenacityAudExtra = Math.ceil((2 * tenInner) * conMult);
        let maxAud = Math.max(1, Math.ceil(baseInner * conMult) + tenacityAudExtra);
        data.battle.player.maxAud = maxAud;
        if (fullHeal) {
            data.battle.player.aud = data.battle.player.maxAud;
        } else {
            data.battle.player.aud = Math.max(1, data.battle.player.maxAud - missingAud);
        }
        let atk = (gc.baseSlapDamage + forceFlat) * (1 + (totalStr / div));
        atk = Math.max(1, roundNearestDecimals(atk, 1));
        data.battle.player.attackDamage = atk;
        const lsEff = skills.getSkillEffect("longshot");
        const longshotFlat = lsEff.longshotSandalFlatDamage || 0;
        const sandalRaw = data.battle.player.attackDamage * gc.sandalDamageSlapMultiplier + longshotFlat;
        data.battle.player.sandalAttackDamage = Math.max(1, roundNearestDecimals(sandalRaw, 1));
        const rEff = skills.getSkillEffect("selfAffirmations");
        data.battle.player.regenPerSecond = rEff.recoveryAudPerSec || 0;
        engine.syncPlayerCooldownFields();
    }
}
