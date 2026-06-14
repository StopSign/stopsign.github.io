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
function debug() {
    if(!isDebug) {
        return;
    }
    //Debug Values
}

let initials = {
    base: function() {
        const pb = function(buildingKey) {
            const def = resortData.buildings[buildingKey] && resortData.buildings[buildingKey].progressDefaults;
            return def ? JSON.parse(JSON.stringify(def)) : {};
        };
        return {
            chapel: pb("chapel"),
            foxDen: Object.assign({
                unlocks: Object.assign({}, resortData.defaultFoxDenUnlocksState),
                constructionQueue: [],
                constructionSites: {},
                constructionCarriers: [],
                upgradeGatherJobs: {},
                upgradeGatherQueue: [],
                lastCarrierSpawnMs: 0,
                assignedWorkers: 0,
                gearSets: 1
            }),
            bambooForest: pb("bambooForest"),
            mapRevealed: Object.assign({}, resortData.defaultMapRevealedState),
            mine: {
                resources: {
                    dirt: 0,
                    stone: 0
                },
                currentDepth: 0,
                clearsByDepth: { 0: 0 },
                blocks: null,
                playTimerMs: 0
            },
            scrollArchives: pb("scrollArchives"),
            inn: Object.assign(pb("inn"), {
                roomsAvailable: 1,
                roomsOccupied: 0,
                restfulnessPerSecond: 1,
                furnitureBought: 0,
                decorationBought: 0,
                addRoomBought: 0,
                guests: [],
                guestLog: [],
                guestIdCounter: 1
            }),
            atelier: pb("atelier"),
            garden: pb("garden"),
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
                waterSpiritsBought: 0,
                fireSpiritsBought: 0,
                spiritCostBase: 50,
                spiritCostMult: 10,
                spiritMax: 3,
                spiritIdCounter: 1,
                spirits: []
            },
            stonePile: {
                stone: 0
            },
            cistern: {
                waterVolume: 0,
                essence: 0
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
            skillConBonus: 0
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
            battleUnlocked: false,
            kitsune: {
                total: 2
            },
            okami: {
                level: 0,
                exp: 0,
                assignedBuildingKey: "",
                pathJob: null,
                pausedPathJobs: {}
            },
            mana: {
                amount: 0
            },
            weaving: {
                active: null,
                paused: null
            },
            selectedSkillsTab: "combat",
            selectedSkillDetailKey: "",
            selectedStatsTab: "combat",
            selectedScrollArchivesTab: "combat",
            compactViewPane: "menus",
            autoRetryCountdownSec: 0,
            stars: {
                bronze: 0,
                silver: 0,
                coins: 0
            },
            options: {
                hideMaxedUpgrades: true,
                disableCompactLayout: false
            },
            currentMapKey: mapData.defaultStartingMapKey(),
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
                building: { chapel: true, foxDen: true },
                subtab: {},
                upgradeSeen: {}
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
            mapTier: 0,
            zoneSpawnedInCycle: [],
            activeZones: [],
            transitionCountdownMs: 0,
            transitionMessage: "",
            nextTierAfterCountdown: 0,
            lineFxQueue: [],
            enduranceExpAccMs: 0,
            runSkillTalentStart: null,
            recoverySecondAccMs: 0,
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
            forageMoveAccumPx: 0
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
    initializeData: function() {
        data.lastVisit = Date.now();
        data.saveVersion = 1;
        data.gameState = "default";
        data.resetCount = 1;
        data.gameSettings = initials.gameSettings();
        data.currentGameState = initials.currentGameState();
        data.progress = initials.progress();
        data.battle = initials.battle();
        data.battle.intruderPool = initials.intruderPool();
        initialize.startFreshBattle(data.progress.mapDefinitions[0].seed, data.progress.currentMapKey);
        data.battle.state = data.progress.battleUnlocked ? "running" : "idle";
    },
    startFreshBattle: function(seed, mapKey) {
        const preservedTab = data.battle && data.battle.currentTab ? data.battle.currentTab : "base";
        data.battle = initials.battle();
        data.battle.intruderPool = initials.intruderPool();
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
        data.gameSettings.stop = false;
        data.gameSettings.stopAll = false;
    },
    getClassDef: function(classKey) {
        const defs = resortData.bonfireClassDefs;
        return (defs && defs[classKey]) || defs.none;
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
            const gc = gameData.battle.combat;
            const div = gc.conStrStatDivisor;
            const ls = data.battle.levelState || {};
            const totalCon = (ls.levelCon || 0);
            const totalStr = (ls.levelStr || 0);
            const brEff = skills.getSkillEffect("breathing");
            const breathingBonus = brEff.breathingStaminaCapacityBonus || 0;
            const maxStamina = Math.max(1, Math.ceil((gc.foragingBaseStaminaInner + breathingBonus) * (1 + (totalCon / div))));
            data.battle.player.maxHp = maxStamina;
            if (fullHeal) {
                data.battle.player.hp = maxStamina;
            } else {
                data.battle.player.hp = Math.min(maxStamina, data.battle.player.hp);
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
        const missingHp = data.battle.player.maxHp - data.battle.player.hp;
        const totalCon = data.battle.levelState.levelCon + data.battle.levelState.skillConBonus;
        const totalStr = data.battle.levelState.levelStr + data.battle.levelState.skillStrBonus;
        const fEff = skills.getSkillEffect("force");
        const forceFlat = fEff.slapFlatBeforeStr || 0;
        const fortEff = skills.getSkillEffect("endurance");
        const fortLvl = fortEff.enduranceBaseHpInnerBonus || 0;
        const tenEff = skills.getSkillEffect("tenacity");
        const tenInner = tenEff.tenacityHpInnerBonus || 0;
        const baseInner = gc.baseHpInner + fortLvl + tenInner;
        const conMult = 1 + totalCon / div;
        const tenacityHpExtra = Math.ceil((2 * tenInner) * conMult);
        let maxHp = Math.max(1, Math.ceil(baseInner * conMult) + tenacityHpExtra);
        data.battle.player.maxHp = maxHp;
        if (fullHeal) {
            data.battle.player.hp = data.battle.player.maxHp;
        } else {
            data.battle.player.hp = Math.max(1, data.battle.player.maxHp - missingHp);
        }
        let atk = (gc.baseSlapDamage + forceFlat) * (1 + (totalStr / div));
        atk = Math.max(1, roundNearestDecimals(atk, 1));
        data.battle.player.attackDamage = atk;
        const lsEff = skills.getSkillEffect("longshot");
        const longshotFlat = lsEff.longshotSandalFlatDamage || 0;
        const sandalRaw = data.battle.player.attackDamage * gc.sandalDamageSlapMultiplier + longshotFlat;
        data.battle.player.sandalAttackDamage = Math.max(1, roundNearestDecimals(sandalRaw, 1));
        const rEff = skills.getSkillEffect("recovery");
        data.battle.player.regenPerSecond = rEff.recoveryHpPerSec || 0;
        engine.syncPlayerCooldownFields();
    }
}
