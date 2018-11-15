let units = [];
let unitStats = {
    //friendly
    king: { atk:10, hp:100 },
    spearman: { atk:1, hp:20 },
    archer: { atk:5, hp:60 },
    catapult: { atk:25, hp: 180 },

    //enemy
    thug: { atk:1, hp:15 },
    brigand: { atk: 3, hp: 40 },
    bandit: { atk: 6, hp: 100 },
    thief: { atk:10, hp: 120 },

    //monsters
    goblin: { atk:1, hp:5 },
    hobgoblin: { atk:2, hp:30 }
};

function getStatsOfUnit(varName) {
    return unitStats[varName]; //TODO buffs go here
}

function createUnit(varName, isFriendly, startingLoc) {
    let unit = {};
    unit.varName = varName;
    unit.isFriendly = isFriendly;
    if(startingLoc === "home") {
        unit.coords = copyArray(levelData.home.coords);
    }
    let stats = getStatsOfUnit(unit.varName);
    unit.atk = stats.atk;
    unit.hp = stats.hp;
    unit.target = "home";
    units.push(unit);
}

unitActions = [];
function createUnitActions(levelData) {
    //create 1 action per base in levelData
    addUnitAction("home");
    for(let i = 0; i < levelData.dungeons.length; i++) {
        addUnitAction("dungeon", i);
    }
    for(let i = 0; i < levelData.hideouts.length; i++) {
        addUnitAction("hideout", i);
    }
}

function addUnitAction(varName, num) {
    let action = {};
    action.name = "Sending units to " + capitalizeFirst(varName) + (num !== undefined ? " "+(num+1) : "" );
    if(num !== undefined) {
        varName = varName+"_"+num;
    }
    action.varName = varName;
    action.unlocked = function() { return true; };
    action.visible = function() { return true; };
    action.moveAction = true;

    if(!action.seconds) {
        action.seconds = 2;
    }
    action.cost = [];
    action.cost.push({
        resource:"seconds",
        type:"static",
        starting:action.seconds
    });

    if(!action.buy) {
        action.buy = function() {
            //set target of all units to action
            setUnitTarget(action.varName);
            console.log(action.varName);
        }
    }

    unitActions.push(action);
}

function setUnitTarget(varName) {
    units.forEach(function(unit) {
        if(unit.isFriendly) {
            unit.target = varName;
        }
    });
}

function getUnitActionByVarName(varName) {
    let found = null;
    unitActions.forEach(function(action) {
        if(action.varName === varName) {
            found = action;
        }
    });
    return found;
}