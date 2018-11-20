let warMapActions = [];
let warMap = {
    tick: function() {
        warMap.units.checkUnitsToJoinBase();

        warMap.bases.fight();

        warMap.units.travel();
    },
    actions: {
        createWarMapActions: function() {
            warMapActions = [];
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
            action.canBuy = function() { return true; }; //no costs yet.
            if(!action.buy) {
                action.buy = function() {
                    //set target of all units to action
                    warMap.units.createTravelingUnits(this);
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
            return Object.assign({}, found); //need a copy but with methods;
        },
        createNameString: function(action) {
            let sendingString = "Sending ";
            let firstName = true;
            for (let property in action.unitsToMove) {
                if (action.unitsToMove.hasOwnProperty(property)) {
                    if(action.unitsToMove[property]) {
                        let name = property === "king" ? "the King" : capitalizeFirst(property);
                        if(firstName) {
                            firstName = false;
                            sendingString += name;
                        } else {
                            sendingString += ", "+name;
                        }
                    }
                }
            }
            let baseName = action.varName.split("_")[0];
            let num = action.varName.split("_")[1];
            return sendingString + " to " + capitalizeFirst(baseName) + (num !== undefined ? " "+(parseInt(num)+1) : "");
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
            thug: { atk:1, hp:15, exp:2 },
            brigand: { atk: 3, hp: 40, exp:4 },
            bandit: { atk: 6, hp: 100, exp:8 },
            thief: { atk:10, hp: 120, exp:10 },

            //monsters
            goblin: { atk:1, hp:5, exp:1 },
            hobgoblin: { atk:2, hp:30, exp:3 }
        },
        getStatsOfUnit: function(varName) {
            if(varName === "king") {
                return { atk: (king.curData.rflxCur+.00000001), hp: Math.floor(king.curData.rflxCur*10+.0000001) };
            }
            return warMap.units.unitStats[varName]; //TODO buffs go here
        },
        createUnit: function(varName, isFriendly, startingLoc, amount) {
            let unit = {};
            unit.varName = varName;
            if(varName === "king") {
                unit.type = "king";
            } else if(varName === "archerHero") {
                unit.type = "heroes";
            } else {
                unit.type = "units";
            }
            unit.isFriendly = isFriendly;
            unit.amount = amount;
            let stats = warMap.units.getStatsOfUnit(unit.varName);
            unit.atk = stats.atk;
            unit.hp = stats.hp;
            unit.maxHp = stats.hp;
            unit.speed = 12; //DEBUG 2
            warMap.bases.baseNameToObj(startingLoc).units.push(unit);
        },
        getAllUnits: function() {
            let allUnits = [];
            levelData.traveling.forEach(function(travelObj) {
                allUnits = allUnits.concat(travelObj.units);
            });
            warMap.bases.getAllBases().forEach(function(base) {
                allUnits = allUnits.concat(base.units);
            });
            return allUnits;
        },
        createTravelingUnits: function(action) {
            let target = action.varName;

            //leave from base
            warMap.bases.getAllBases().forEach(function(base) {
                for (let i = base.units.length - 1; i >= 0; i--) {
                    let unit = base.units[i];
                    if(unit.isFriendly && action.unitsToMove[unit.type]) {
                        warMap.units.addTravelingObj(unit, target, base.coords);
                        base.units.splice(i, 1);
                    }
                }
            });

            //change existing travelObj
            for(let i = levelData.traveling.length - 1; i >= 0; i--) {
                let travelObj = levelData.traveling[i];
                for(let j = travelObj.units.length - 1; j >= 0; j--) {
                    let unit = travelObj.units[j];
                    if(action.unitsToMove[unit.type]) {
                        warMap.units.addTravelingObj(unit, target, travelObj.coords);
                        travelObj.units.splice(j, 1);
                    }
                }
                if(travelObj.units.length === 0) {
                    levelData.traveling.splice(i, 1);
                }
            }
        },
        addTravelingObj: function(unit, target, coords) {
            //find existing traveling obj and add
            let found = false;
            levelData.traveling.forEach(function(travelingObj) {
                if(travelingObj.target === target && JSON.stringify(travelingObj.coords) === JSON.stringify(coords)) {
                    found = true;
                    travelingObj.units.push(unit);
                }
            });
            if(found) {
                return;
            }
            //if none found create new
            let travelingObj = {units:[unit], target:target, coords:copyArray(coords) , id: travelIds++};
            levelData.traveling.push(travelingObj);
        },
        checkUnitsToJoinBase: function() {
            for(let i = levelData.traveling.length - 1; i >= 0; i--) {
                let travelingObj = levelData.traveling[i];
                for(let j = travelingObj.units.length -1; j >= 0; j--) {
                    let unit = travelingObj.units[j];
                    let target = warMap.bases.baseNameToObj(travelingObj.target);
                    if (withinDistance(target.coords.x, target.coords.y, travelingObj.coords.x, travelingObj.coords.y, 4)) {
                        travelingObj.units.splice(j, 1);
                        target.units.push(unit);
                        warMap.units.checkUnitsForCombineInBase(target);
                    }
                }
                if(travelingObj.units.length === 0) {
                    levelData.traveling.splice(i, 1);
                }
            }
        },
        travel: function() {
            levelData.traveling.forEach(function(travelObj) {
                let target = warMap.bases.baseNameToObj(travelObj.target);
                let newCoords = moveToTarget(travelObj.coords.x, travelObj.coords.y, target.coords.x, target.coords.y, (warMap.units.getTravelObjSpeed(travelObj)/10));
                travelObj.coords.x = newCoords.x;
                travelObj.coords.y = newCoords.y;
            });
        },
        getTravelObjSpeed: function(travelObj) {
            let speed = travelObj.units[0].speed;
            for(let i = 1; i < travelObj.units.length; i++) {
                if(travelObj.units[i].speed < speed) {
                    speed = travelObj.units[i].speed;
                }
            }
            return speed;
        },
        checkUnitsForCombineInBase: function(base) {
            for(let i = base.units.length -1; i >= 0; i--) {
                let unit1 = base.units[i];
                for(let j = 0; j < i; j++) {
                    let unit2 = base.units[j];
                    if(unit1.varName === unit2.varName && unit1.hp === unit2.hp) {
                        unit2.amount += unit1.amount;
                        base.units.splice(i, 1);
                    }
                }
            }
        },
        sortHpLowestToHighest: function(unitList) {
            unitList.sort((unit1,unit2) => unit1.maxHp !== unit2.maxHp ? unit1.maxHp - unit2.maxHp : unit1.hp - unit2.hp );
        }
    },
    bases: {
        baseNameToObj: function(name) {
            if(name === "home") {
                return levelData.home;
            }
            let dataType = name.split("_")[0];
            let num = name.split("_")[1];
            return levelData[dataType+"s"][num];
        },
        getAllBases: function() {
            let allBases = [];
            allBases.push(levelData.home);
            for(let i = 0; i < levelData.dungeons.length; i++) {
                allBases.push(levelData.dungeons[i]);
            }
            for(let i = 0; i < levelData.hideouts.length; i++) {
                allBases.push(levelData.hideouts[i]);
            }
            return allBases;
        },
        getUnitsByAllegiance: function(base) {
            let friendlyUnits = [];
            let enemyUnits = [];
            base.units.forEach(function(unit) {
                if(unit.isFriendly) {
                    friendlyUnits.push(unit);
                } else {
                    enemyUnits.push(unit);
                }
            });
            return { friendly:friendlyUnits, enemy:enemyUnits };
        },
        fight: function() {
            warMap.bases.getAllBases().forEach(function(base) {
                let unitsByAllegience = warMap.bases.getUnitsByAllegiance(base);
                if(unitsByAllegience.friendly.length === 0 || unitsByAllegience.enemy.length === 0) {
                    return;
                }
                //fight once a second
                if(base.fightCounter > 0) {
                    base.fightCounter--;
                    return;
                }
                base.fightCounter = 20;

                //get damage totals
                base.friendlyDamage = 0;
                unitsByAllegience.friendly.forEach(function(unit) {
                    base.friendlyDamage += unit.amount * unit.atk;
                });
                base.enemyDamage = 0;
                unitsByAllegience.enemy.forEach(function(unit) {
                    base.enemyDamage += unit.amount * unit.atk;
                });

                //apply damage
                let extraUnit = warMap.bases.dealDamage(unitsByAllegience.friendly, base.enemyDamage);
                if(extraUnit) {
                    base.units.push(extraUnit);
                }
                let extraUnit2 = warMap.bases.dealDamage(unitsByAllegience.enemy, base.friendlyDamage);
                if(extraUnit2) {
                    base.units.push(extraUnit2);
                }

                //clear dead units
                for(let i = base.units.length - 1; i >= 0; i--) {
                    if(base.units[i].hp <= 0 || base.units[i].amount <= 0) {
                        base.units.splice(i, 1);
                    }
                }

                let remainingUnits = warMap.bases.getUnitsByAllegiance(base);
                if(remainingUnits.friendly.length && remainingUnits.enemy.length === 0) {
                    warMap.bases.getReward(base);
                    if(document.getElementById("pausePlaceCleared").checked && !stop) {
                        pauseGame();
                    }
                }
            });
        },
        dealDamage: function(unitList, damage) {
            warMap.units.sortHpLowestToHighest(unitList);
            let extraUnit = null;
            unitList.forEach(function(unit) {
                if(damage <= 0) {
                    return;
                }
                // console.log("Dealing " + damage + " damage to " + unit.varName);
                let amountKilled = Math.floor(damage / unit.hp + .000001);
                if(amountKilled > unit.amount) {
                    amountKilled = unit.amount;
                }
                unit.amount -= amountKilled;
                damage -= unit.hp * amountKilled;
                // console.log("Killed " + amountKilled + " units to take away " + unit.hp * amountKilled + " damage. Remaining units: " + unit.amount + " and remaining damage: " + damage);
                if(unit.amount === 0) {
                    unit.hp = 0;
                    return;
                }
                if(damage <= 0) {
                    return;
                }
                //split unit
                unit.amount--;
                let remainingHp = unit.hp - damage;
                // console.log("Did " + damage + " damage to unit. Unit has " + remainingHp + " hp left.");
                damage = 0;
                extraUnit = copyArray(unit);
                extraUnit.amount = 1;
                extraUnit.hp = remainingHp;
            });
            return extraUnit;
        },
        getReward: function(base) {
            if(!base.reward) { //castle
                return;
            }
            base.reward.forEach(function(reward) {
                let manaReward = reward.type === "mana" ? reward.amount : 0;
                mana += manaReward;
                maxMana += manaReward;
                gold += reward.type === "gold" ? reward.amount : 0;
            });
        }
    }
};

let travelIds = 0; //used for linking levelData.traveling to divs