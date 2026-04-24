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

let isDebug = false; //SET FOR COMMIT
// let isDebug = true;
let debugLevel = 0; //To start at different parts of the game
function debug() {
    if(!isDebug) {
        return;
    }
    //Debug Values
}

let initials = {
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
            hp: 120,
            maxHp: 120,
            attackDamage: 8,
            rangedAttackDamage: 12,
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
            expToLevel: 5,
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
            currentMapKey: "map_1",
            mapDefinitions: gameData.getDefaultMaps(),
            attributePlan: [],
            runHistory: [],
            skills: skills.getDefaultSkills(),
            rangedAttackEnabled: true,
            gear: gameData.getDefaultGear()
        };
    },
    battle: function() {
        return {
            elapsedMs: 0,
            state: "running",
            resetCount: 0,
            enemyIdCounter: 1,
            enemies: [],
            enemySpawnCursor: 0,
            spawnDataQueue: [],
            meleeQueue: [],
            activeTargetId: null,
            player: initials.player(),
            levelState: initials.levelState(),
            seed: 1337,
            generatedFromSeed: null,
            currentTab: "gear",
            runStartGold: 0,
            historyLogged: false,
            enemiesKilled: 0,
            completionBonusGold: 0,
            lineFxQueue: [],
            prevZoneNameForFortitude: null,
            runSkillTalentStart: null,
            recoverySecondAccMs: 0
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
        data.battle = initials.battle();
        data.battle.enemyPool = initials.enemyPool();
        initialize.startFreshBattle(data.progress.mapDefinitions[0].seed, data.progress.currentMapKey);
    },
    startFreshBattle: function(seed, mapKey) {
        const preservedTab = data.battle && data.battle.currentTab ? data.battle.currentTab : "gear";
        data.battle = initials.battle();
        data.battle.enemyPool = initials.enemyPool();
        data.battle.seed = seed;
        data.battle.generatedFromSeed = seed;
        data.battle.currentTab = preservedTab;
        data.battle.runStartGold = data.progress.gold;
        data.battle.historyLogged = false;
        const selectedMapKey = mapKey || data.progress.currentMapKey;
        data.progress.currentMapKey = selectedMapKey;
        const mapDef = initialize.getCurrentMapDefinition();
        data.battle.spawnDataQueue = gameData.generateEnemySpawnData(seed, mapDef);
        initialize.applyPlanForCurrentLevel();
        initialize.applyConToPlayer(true);
        initialize.snapshotRunSkillTalent();
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
    applyConToPlayer: function(fullHeal) {
        const missingHp = data.battle.player.maxHp - data.battle.player.hp;
        const totalCon = data.battle.levelState.levelCon + data.battle.levelState.skillConBonus;
        const totalStr = data.battle.levelState.levelStr + data.battle.levelState.skillStrBonus;
        const finesseLv = data.progress.skills.finesse ? data.progress.skills.finesse.level : 0;
        const fortLvl = data.progress.skills.fortitude ? data.progress.skills.fortitude.level : 0;
        const baseInner = 20 + fortLvl;
        let maxHp = Math.max(1, Math.ceil(baseInner * (1 + totalCon / 10)));
        const gearBon = gameData.getAggregatedGearBonuses();
        maxHp = Math.max(1, Math.ceil(maxHp * (1 + gearBon.hpPct)));
        data.battle.player.maxHp = maxHp;
        if (fullHeal) {
            data.battle.player.hp = data.battle.player.maxHp;
        } else {
            data.battle.player.hp = Math.max(1, data.battle.player.maxHp - missingHp);
        }
        let atk = (8 + finesseLv) * (1 + (totalStr / 10));
        atk = Math.max(1, Math.round(atk * (1 + gearBon.dmgPct)));
        data.battle.player.attackDamage = atk;
        data.battle.player.rangedAttackDamage = Math.floor(data.battle.player.attackDamage * 1.5);
        if (typeof engine !== "undefined" && engine.syncPlayerCooldownFields) {
            engine.syncPlayerCooldownFields();
        }
    }
}
