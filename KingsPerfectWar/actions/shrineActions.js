let shrine = {
    actions:[],
    tick: function() {

    },
    initial: {
        addShrineAction(action) {
            if(window.language !== "eng") {
                action.name = action["name"+window.language];
                action.desc = action["desc"+window.language];
            }

            if(!action.unlocked) {
                action.unlocked = function() { return true; }
            }
            if(!action.visible) {
                action.visible = function() { return true; }
            }

            if(!action.seconds) {
                action.seconds = 1;
            }
            action.cost.push({
                resource:"seconds",
                type:"static",
                starting:action.seconds
            });

            if(!created.shrine[action.varName]) {
                created.shrine[action.varName] = 0;
            }
            if(!action.buy) {
                action.buy = function() {
                    let favor = shrine.helpers.calcFavor();
                    if(wood < favor * 10) {
                        return;
                    }
                    wood -= favor * 10;
                    levelData.shrine[this.varName+"Tribute"] = round5(levelData.shrine[this.varName+"Tribute"] +
                        favor * shrine.helpers.calcTributeBonus(this.varName));
                    if(levelData.shrine[this.varName+"Tribute"] >= levelData.shrine[this.varName+"TributeNeeded"]) {
                        levelData.shrine[this.varName+"Tribute"] -= levelData.shrine[this.varName+"TributeNeeded"];
                        created.shrine[this.varName]++;
                        if(this.varName === "heroes") {
                            levelData.shrine[this.varName + "TributeNeeded"] *= 10;
                        } else {
                            levelData.shrine[this.varName + "TributeNeeded"] += this.tribute;
                        }
                    }
                }
            }
            action.canBuy = function() {
                return gold >= this.costgold && wood >= this.costwood && mana >= this.costmana;
            };

            shrine.actions.push(action);
        },
        createActions: function() {
            shrine.initial.addShrineAction({
                varName:"enchant",
                name:"Faerie Enchantments",
                desc:"+20% atk all units, 100 points + 100 each time",
                tribute:100,
                cost: [],
                max: 5,
                seconds:5,
                xPos:155,
                yPos:0
            });

            shrine.initial.addShrineAction({
                varName:"feast",
                name:"Blessed Feasts",
                desc:"+20% hp all units, 100 points + 100 each time",
                cost: [],
                tribute:100,
                max: 5,
                seconds:5,
                xPos:155,
                yPos:50
            });

            shrine.initial.addShrineAction({
                varName:"guidance",
                name:"Faerie Guidance",
                desc:"+20% spd all units, 300 points + 300 each time",
                cost: [],
                tribute:300,
                max: 15,
                seconds:5,
                xPos:155,
                yPos:100
            });

            shrine.initial.addShrineAction({
                varName:"peace",
                name:"Peaceful Aura",
                desc:"+10% gold all buildings, levels 5/10/15 unlock buildings. 50+ points",
                cost: [],
                tribute:50,
                max: 15,
                seconds:5,
                xPos:215,
                yPos:0
            });

            shrine.initial.addShrineAction({
                varName:"bounty",
                name:"Nature's Bounty",
                desc:"+10% wood all buildings, levels 5/10/15 unlock buildings. 50+ points",
                cost: [],
                tribute:50,
                max: 15,
                seconds:5,
                xPos:215,
                yPos:50
            });

            shrine.initial.addShrineAction({
                varName:"heroes",
                name:"Empower Forest Champion",
                desc:"100 * 10 each time, 3 max",
                cost: [],
                tribute:100,
                max: 3,
                seconds:5,
                xPos:215,
                yPos:100
            });
        }
    },
    helpers: {
        calcFavor: function() {
            let toReturn = 0;
            toReturn += created.castle.altar;
            toReturn += created.castle.shrine * 5;
            return toReturn * Math.pow(2, created.castle.ritual);
        },
        saveHighestBlessings: function() {
            shrine.actions.forEach(function(action) {
                shrine.helpers.saveHighest(action.varName);
            });
        },
        saveHighest: function(varName) {
            //{ num, amount }
            let found = false;
            let createdAmount = created.shrine[varName];
            for(let i = 0; i < levelSave[curLevel].shrine[varName].length; i++) {
                let highestNum = levelSave[curLevel].shrine[varName][i];
                if(highestNum.num === createdAmount) {
                    highestNum.amount++;
                    found = true;
                    break;
                }
            }
            if(!found) {
                levelSave[curLevel].shrine[varName].push({num:createdAmount, amount:1});
            }
            levelSave[curLevel].shrine[varName].sort(function(a, b){ return a.num-b.num });

            let foundAmount = 0;
            //keep only the top ${highestListsLength}
            for(let i = levelSave[curLevel].shrine[varName].length - 1; i >= 0; i--) {
                let highestNum = levelSave[curLevel].shrine[varName][i];
                if(foundAmount >= highestListsLength) {
                    levelSave[curLevel].shrine[varName].splice(i, 1);
                }
                foundAmount += highestNum.amount;
                if(foundAmount >= highestListsLength) {
                    highestNum.amount = highestListsLength - (foundAmount - highestNum.amount);
                }
            }
        },
        calcTributeBonus: function(varName) {
            let bonus = 0;
            let createdAmount = created.shrine[varName];
            for(let i = 0; i < levelSave[curLevel].shrine[varName].length; i++) {
                if(createdAmount < levelSave[curLevel].shrine[varName][i].num) {
                    bonus += levelSave[curLevel].shrine[varName][i].amount;
                }
            }
            return 1 + (bonus / 10);
        }
    }

};
created.shrine = {};

function getShrineActionByVarName(varName) {
    let found = null;
    shrine.actions.forEach(function(action) {
        if(action.varName === varName) {
            found = action;
        }
    });
    return found;
}

shrine.initial.createActions();