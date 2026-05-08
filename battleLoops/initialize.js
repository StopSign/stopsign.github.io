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

let data = {};
let language = "english";
let baseBuildingKeys = ["chapel", "townhall", "mine", "smith", "claypit", "kiln", "lumbermill", "library", "garden", "inn", "workshop", "guild", "market", "mage_tower"];
let baseBuildingNames = {
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
    lumbermill: "Claypit"
};
let globalVisible = false; //SET FOR COMMIT
// let globalVisible = true;
let isLoadingEnabled = true; //SET FOR COMMIT
// let isLoadingEnabled = false;
let loadStaticSaveFile = false; //SET FOR COMMIT
// let loadStaticSaveFile = true;
let isSteam = false; //SET FOR COMMIT
// let isSteam = true; //SET FOR STEAM BUILD

let isDebug = false; //SET FOR COMMIT
// let isDebug = true;
let debugLevel = 0; //To start at different parts of the game
const CLASS_DEFS = {
    none: { key: "none", name: "None", buyCostGold: 0, perLevel: { str: 1, con: 1, spd: 0 } },
    warrior: { key: "warrior", name: "Warrior", buyCostGold: 500, perLevel: { str: 1, con: 2, spd: 0 } },
    rogue: { key: "rogue", name: "Rogue", buyCostGold: 500, perLevel: { str: 1, con: 1, spd: 1 } },
    hunter: { key: "hunter", name: "Hunter", buyCostGold: 500, perLevel: { str: 2, con: 1, spd: 0 } }
};
function debug() {
    if(!isDebug) {
        return;
    }
    //Debug Values
}

let initials = {
    base: function() {
        return {
            chapel: {
                autoRetryEnabled: false,
                growthBlessingUnlocked: false,
                plannedGrowthBlessingUnlocked: false
            },
            townhall: {
                unlocks: {
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
                upgradeCosts: {
                    claypit: { gold: 5, bars: 0, bricks: 0, lumber: 0 },
                    kiln: { gold: 5, bars: 0, bricks: 0, lumber: 0 },
                    library: { gold: 20, bars: 0, bricks: 5, lumber: 0 },
                    mine: { gold: 20, bars: 0, bricks: 5, lumber: 0 },
                    smith: { gold: 20, bars: 0, bricks: 5, lumber: 0 },
                    lumbermill: { gold: 200, bars: 20, bricks: 40, lumber: 0 },
                    garden: { gold: 300, bars: 30, bricks: 30, lumber: 0 },
                    inn: { gold: 350, bars: 35, bricks: 35, lumber: 0 },
                    workshop: { gold: 400, bars: 40, bricks: 40, lumber: 40 },
                    guild: { gold: 450, bars: 45, bricks: 45, lumber: 45 },
                    market: { gold: 500, bars: 50, bricks: 50, lumber: 50 },
                    mage_tower: { gold: 550, bars: 55, bricks: 55, lumber: 55 }
                },
                townUpgrades: {
                    hireLocalBought: 0,
                    hireLocalNextGoldCost: 5
                }
            },
            inn: {
                openForGuests: false,
                nextGuestTimerMs: 60000,
                guests: [],
                guestIdCounter: 1,
                advertiseCooldownMs: 0
            },
            mine: {
                assignedWorkers: 0,
                gearSets: 0,
                nextGearGoldCost: 20,
                nextGearBarsCost: 0,
                progress: 0,
                manualCooldownMs: 0
            },
            smith: {
                assignedWorkers: 0,
                gearSets: 0,
                nextGearGoldCost: 20,
                nextGearBarsCost: 0,
                progress: 0,
                attackUpgradesBought: 0,
                nextAttackUpgradeCostBars: 20,
                armorUpgradesBought: 0,
                manualCooldownMs: 0
            },
            library: {
                skillUnlockCost: 30,
                unlockedSkills: {},
                skillResearch: {},
                assignedWorkers: 0,
                gearSets: 0,
                nextGearGoldCost: 10,
                nextGearStoneCost: 0,
                researchPerWorkerPerSecond: 1
            },
            claypit: {
                assignedWorkers: 0,
                gearSets: 0,
                nextGearGoldCost: 20,
                nextGearBarsCost: 0,
                progress: 0,
                manualCooldownMs: 0
            },
            kiln: {
                assignedWorkers: 0,
                gearSets: 0,
                nextGearGoldCost: 20,
                nextGearBarsCost: 0,
                progress: 0,
                manualCooldownMs: 0
            },
            lumbermill: {
                assignedWorkers: 0,
                gearSets: 0,
                nextGearGoldCost: 20,
                nextGearBarsCost: 0,
                progress: 0,
                manualCooldownMs: 0
            },
            workshop: {
                innRoomUpgradesBought: 0,
                innRoomNextGoldCost: 500,
                innRoomNextLumberCost: 50,
                bowBuilt: false
            },
            garden: {
                mapManualInn: false,
                mapManualMine: false,
                mapManualSmith: false,
                mapManualClaypit: false,
                mapManualKiln: false
            },
            resources: {
                ironOre: 0,
                ironBar: 0,
                stone: 0,
                bricks: 0,
                logs: 0,
                lumber: 0
            }
        };
    },
    gameSettings: function() {
        return {
            gameSpeed: 1,
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
        return {
            attackDamage: 5,
            rangedAttackDamage: 7.5,
            attackCooldownMs: 2000,
            attackTimerMs: 0,
            rangedAttackCooldownMs: 4000,
            rangedAttackTimerMs: 0
        };
    },
    levelState: function() {
        return {
            level: 0,
            exp: 0,
            expToLevel: 3,
            unassignedPoints: 0,
            levelStr: 0,
            levelCon: 0,
            levelSpd: 0,
            levelSoul: 0,
            skillStrBonus: 0,
            skillConBonus: 0
        };
    },
    progress: function() {
        return {
            gold: 0,
            selectedBaseBuilding: "chapel",
            selectedSkillsTab: "combat",
            selectedStatsTab: "combat",
            selectedLibraryTab: "combat",
            selectedTownHallTab: "buildings",
            compactViewPane: "menus",
            autoRetryCountdownSec: 0,
            stars: {
                bronze: 0,
                silver: 0,
                gold: 0
            },
            options: {
                hideMaxedUpgrades: true,
                disableCompactLayout: false
            },
            currentMapKey: "map_1",
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
            rangedAttackEnabled: false,
            base: initials.base()
        };
    },
    battle: function() {
        return {
            elapsedMs: 0,
            mode: "combat",
            state: "running",
            resetCount: 0,
            enemyIdCounter: 1,
            enemies: [],
            meleeQueue: [],
            activeTargetId: null,
            player: initials.player(),
            levelState: initials.levelState(),
            seed: 1337,
            generatedFromSeed: null,
            currentTab: "base",
            runStartGold: 0,
            historyLogged: false,
            enemiesKilled: 0,
            completionBonusGold: 0,
            mapTier: 0,
            zoneSpawnedInCycle: [],
            activeZones: [],
            transitionCountdownMs: 0,
            transitionMessage: "",
            nextTierAfterCountdown: 0,
            lineFxQueue: [],
            prevZoneNameForFortitude: null,
            runSkillTalentStart: null,
            recoverySecondAccMs: 0,
            classPowerA: 0,
            classPowerB: 0,
            classRetreatMs: 0,
            rogueDashActive: false,
            rogueFlurryMs: 0,
            lastPlayerHitEnemyId: 0,
            lastPlayerHitStreak: 0,
            forageIndexSpawned: {},
            forageKindSpawnCounts: {},
            forageActiveDrainMapKey: "",
            forageMoveAccumPx: 0
        };
    },
    enemyPool: function() {
        return {
            availableIds: [],
            inUseIds: {}
        };
    }
};

let initialize = {
    initializeData: function() {
        data.lastVisit = Date.now();
        data.saveVersion = 1;
        data.gameState = "default";
        data.resetCount = 1;
        data.gameSettings = initials.gameSettings();
        data.currentGameState = initials.currentGameState();
        data.progress = initials.progress();
        initialize.ensureProgressShape();
        data.battle = initials.battle();
        data.battle.enemyPool = initials.enemyPool();
        initialize.startFreshBattle(data.progress.mapDefinitions[0].seed, data.progress.currentMapKey);
    },
    startFreshBattle: function(seed, mapKey) {
        const preservedTab = data.battle && data.battle.currentTab ? data.battle.currentTab : "base";
        data.battle = initials.battle();
        data.battle.enemyPool = initials.enemyPool();
        data.battle.seed = seed;
        data.battle.generatedFromSeed = seed;
        data.battle.currentTab = preservedTab;
        data.progress.autoRetryCountdownSec = 0;
        data.battle.runStartGold = data.progress.gold;
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
        data.battle.forageIndexSpawned = {};
        data.battle.forageKindSpawnCounts = {};
        data.battle.forageActiveDrainMapKey = "";
        data.battle.forageMoveAccumPx = 0;
        initialize.applyPlanForCurrentLevel();
        initialize.calcPlayerStats(true);
        initialize.snapshotRunSkillTalent();
        data.gameSettings.stop = false;
        data.gameSettings.stopAll = false;
    },
    getClassDef: function(classKey) {
        return CLASS_DEFS[classKey] || CLASS_DEFS.none;
    },
    getCurrentClassDef: function() {
        const key = data.progress && data.progress.currentClassKey ? data.progress.currentClassKey : "none";
        return initialize.getClassDef(key);
    },
    getClassPerLevelText: function(classKey) {
        const d = initialize.getClassDef(classKey);
        return `+${d.perLevel.str} Str, +${d.perLevel.con} Con, +${d.perLevel.spd} Spd per level`;
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
        data.gameSettings.stop = false;
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
            const ls = data.battle.levelState || {};
            const totalCon = (ls.levelCon || 0);
            const totalStr = (ls.levelStr || 0);
            const breathingLv = (skills.isSkillUnlocked("breathing") && data.progress.skills.breathing) ? (data.progress.skills.breathing.level || 0) : 0;
            const maxStamina = Math.max(1, Math.ceil((20 + (breathingLv * 2)) * (1 + (totalCon / 10))));
            data.battle.player.maxHp = maxStamina;
            if (fullHeal) {
                data.battle.player.hp = maxStamina;
            } else {
                data.battle.player.hp = Math.min(maxStamina, data.battle.player.hp);
            }
            data.battle.player.attackDamage = Math.max(1, Math.round(5 * (1 + (totalStr / 10))));
            data.battle.player.rangedAttackDamage = 0;
            data.progress.rangedAttackEnabled = false;
            engine.syncPlayerCooldownFields();
            return;
        }
        const missingHp = data.battle.player.maxHp - data.battle.player.hp;
        const totalCon = data.battle.levelState.levelCon + data.battle.levelState.skillConBonus;
        const totalStr = data.battle.levelState.levelStr + data.battle.levelState.skillStrBonus;
        const finesseLv = data.progress.skills.finesse ? data.progress.skills.finesse.level : 0;
        const smithAtkBonus = data.progress.base && data.progress.base.smith ? (data.progress.base.smith.attackUpgradesBought || 0) : 0;
        const fortLvl = data.progress.skills.fortitude ? data.progress.skills.fortitude.level : 0;
        const armorHp = data.progress.base && data.progress.base.smith ? ((data.progress.base.smith.armorUpgradesBought || 0) * 5) : 0;
        const baseInner = 20 + fortLvl + armorHp;
        let maxHp = Math.max(1, Math.ceil(baseInner * (1 + totalCon / 10)));
        data.battle.player.maxHp = maxHp;
        if (fullHeal) {
            data.battle.player.hp = data.battle.player.maxHp;
        } else {
            data.battle.player.hp = Math.max(1, data.battle.player.maxHp - missingHp);
        }
        let atk = (5 + finesseLv + smithAtkBonus) * (1 + (totalStr / 10));
        atk = Math.max(1, Math.round(atk));
        data.battle.player.attackDamage = atk;
        const longshotLv = (skills.isSkillUnlocked("longshot") && data.progress.skills.longshot) ? (data.progress.skills.longshot.level || 0) : 0;
        data.battle.player.rangedAttackDamage = Math.floor(data.battle.player.attackDamage * 1.5) + longshotLv;
        engine.syncPlayerCooldownFields();
    },
    ensureProgressShape: function() {
        if (!data.progress.mapClearProgress) {
            data.progress.mapClearProgress = {};
        }
        if (!data.progress.selectedSkillsTab) {
            data.progress.selectedSkillsTab = "combat";
        }
        if (!data.progress.selectedLibraryTab) {
            data.progress.selectedLibraryTab = "combat";
        }
        if (!data.progress.selectedTownHallTab) {
            data.progress.selectedTownHallTab = "buildings";
        }
        if (data.progress.classSwitchCooldownMs === undefined) {
            data.progress.classSwitchCooldownMs = 0;
        }
        const th = data.progress.base && data.progress.base.townhall;
        const chapel = data.progress.base && data.progress.base.chapel;
        if (chapel) {
            if (chapel.growthBlessingUnlocked === undefined) {
                chapel.growthBlessingUnlocked = false;
            }
            if (chapel.plannedGrowthBlessingUnlocked === undefined) {
                chapel.plannedGrowthBlessingUnlocked = false;
            }
        }
        if (th) {
            if (!th.unlocks) th.unlocks = {};
            const unlockKeys = ["mine", "smith", "claypit", "kiln", "lumbermill", "library", "garden", "inn", "workshop", "guild", "market", "mage_tower"];
            for (let i = 0; i < unlockKeys.length; i++) {
                if (th.unlocks[unlockKeys[i]] === undefined) th.unlocks[unlockKeys[i]] = false;
            }
            if (!th.upgradeCosts) th.upgradeCosts = {};
            const defaults = initials.base().townhall.upgradeCosts;
            const costKeys = Object.keys(defaults);
            for (let i = 0; i < costKeys.length; i++) {
                const k = costKeys[i];
                if (!th.upgradeCosts[k]) {
                    th.upgradeCosts[k] = defaults[k];
                } else {
                    if (th.upgradeCosts[k].gold === undefined) th.upgradeCosts[k].gold = defaults[k].gold || 0;
                    if (th.upgradeCosts[k].bars === undefined) th.upgradeCosts[k].bars = defaults[k].bars || 0;
                    if (th.upgradeCosts[k].bricks === undefined) th.upgradeCosts[k].bricks = defaults[k].bricks || 0;
                    if (th.upgradeCosts[k].lumber === undefined) th.upgradeCosts[k].lumber = defaults[k].lumber || 0;
                }
            }
            if (!th.townUpgrades) {
                th.townUpgrades = { hireLocalBought: 0, hireLocalNextGoldCost: 5 };
            }
        }
    }
}
