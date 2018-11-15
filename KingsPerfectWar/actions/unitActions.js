warMapActions = [];
warMap = {
    tick: function() {
        warMap.units.checkUnitsToJoinBase();
    },
    actions: {
        createWarMapActions: function() {
            //create 1 action per base in levelData
            warMap.actions.addWarMapAction("home");
            for(let i = 0; i < levelData.dungeons.length; i++) {
                warMap.actions.addWarMapAction("dungeon", i);
            }
            for(let i = 0; i < levelData.hideouts.length; i++) {
                warMap.actions.addWarMapAction("hideout", i);
            }
        },
        addWarMapAction: function(varName, num) {
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
                    warMap.units.setUnitTargets(action.varName);
                    console.log(action.varName);
                }
            }

            warMapActions.push(action);
        },
        getWarMapActionByVarName: function(varName) {
            let found = null;
            warMapActions.forEach(function(action) {
                if(action.varName === varName) {
                    found = action;
                }
            });
            return found;
        }
    },
    units: {
        unitStats: {
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
        },
        getStatsOfUnit: function(varName) {
            return warMap.units.unitStats[varName]; //TODO buffs go here
        },
        createUnit: function(varName, isFriendly, startingLoc, amount) {
            let unit = {};
            unit.varName = varName;
            unit.isFriendly = isFriendly;
            unit.amount = amount;
            unit.coords = baseNameToObj(startingLoc).coords;
            unit.target = startingLoc;
            let stats = warMap.units.getStatsOfUnit(unit.varName);
            unit.atk = stats.atk;
            unit.hp = stats.hp;
            levelData.traveling.push(unit);
        },
        getAllUnits: function() {
            let allUnits = levelData.home.units;
            for(let i = 0; i < levelData.dungeons.length; i++) {
                allUnits.concat(levelData.dungeons[i].units);
            }
            for(let i = 0; i < levelData.hideouts.length; i++) {
                allUnits.concat(levelData.hideouts[i].units);
            }
            allUnits.concat(levelData.traveling);
            return allUnits;
        },
        setUnitTargets(target) {
            warMap.units.getAllUnits().forEach(function(unit) {
                if(unit.isFriendly) {
                    console.log("changing " + unit.varName + " at " + unit.coords + " to " + target);
                    unit.target = target;
                }
            })
        },
        checkUnitsToJoinBase() {
            for(let i = levelData.traveling.length - 1; i >= 0; i--) {
                let unit = levelData.traveling[i];
                let target = baseNameToObj(unit.target);
                if (withinDistance(target.coords.x, target.coords.y, unit.coords.x, unit.coords.y, 2)) {
                    levelData.traveling.splice(i, 1);
                    target.units.push(unit);
                }
            }
        }
    }
};

function baseNameToObj(name) {
    if(name === "home") {
        return levelData.home;
    }
    let dataType = name.split("_")[0];
    let num = name.split("_")[1];
    return levelData[dataType+"s"][num];
}