let warMapActions = [];
let warMap = {
    tick: function() {
        warMap.units.checkUnitsToChangeBase();

        warMap.bases.fight();

        levelData.traveling.forEach(function(unit) {
            let target = warMap.bases.baseNameToObj(unit.target);
            let newCoords = moveToTarget(unit.coords.x, unit.coords.y, target.coords.x, target.coords.y, (unit.speed/10));
            unit.coords.x = newCoords.x;
            unit.coords.y = newCoords.y;
        });
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
                    warMap.units.setUnitTargets(this);
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
            if(varName === "king") {
                unit.type = "king";
            } else if(varName === "archerHero") {
                unit.type = "heroes";
            } else {
                unit.type = "units";
            }
            unit.isFriendly = isFriendly;
            unit.amount = amount;
            unit.coords = copyArray(warMap.bases.baseNameToObj(startingLoc).coords);
            unit.target = startingLoc;
            let stats = warMap.units.getStatsOfUnit(unit.varName);
            unit.atk = stats.atk;
            unit.hp = stats.hp;
            unit.maxHp = stats.hp;
            unit.speed = 12; //DEBUG 2
            levelData.traveling.push(unit);
        },
        getAllUnits: function() {
            let allUnits = levelData.traveling;
            warMap.bases.getAllBases().forEach(function(base) {
                allUnits = allUnits.concat(base.units);
            });
            return allUnits;
        },
        setUnitTargets: function(action) {
            let target = action.varName;
            warMap.units.getAllUnits().forEach(function(unit) {
                if(unit.isFriendly && action.unitsToMove[unit.type]) {
                    console.log("changing " + unit.varName + " at " + unit.coords.x + ","+unit.coords.y+" to " + target);
                    unit.target = target;
                }
            })
        },
        checkUnitsToChangeBase: function() {
            //join base
            for(let i = levelData.traveling.length - 1; i >= 0; i--) {
                let unit = levelData.traveling[i];
                let target = warMap.bases.baseNameToObj(unit.target);
                if (withinDistance(target.coords.x, target.coords.y, unit.coords.x, unit.coords.y, 4)) {
                    levelData.traveling.splice(i, 1);
                    unit.coords.x = target.coords.x;
                    unit.coords.y = target.coords.y;
                    target.units.push(unit);
                    warMap.units.checkUnitsForCombineInBase(target);
                }
            }

            //leave base
            warMap.bases.getAllBases().forEach(function(base) {
                for(let i = base.units.length - 1; i >= 0; i--) {
                    let unit = base.units[i];
                    if(JSON.stringify(warMap.bases.baseNameToObj(unit.target)) !== JSON.stringify(base)) { //target is not where it sits
                        levelData.traveling.push(unit);
                        base.units.splice(i, 1);
                    }
                }
            });
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