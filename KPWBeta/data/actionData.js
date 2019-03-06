actionData = {
    list: { king:[], castle:[], other:[] },
    create: {
        actionBase: function(action) {
            //convert from data into everything you need in a button and action
            if(window.language !== "eng") { //NOTE other languages should use this
                action.name = action["name"+window.language];
                action.desc = action["desc"+window.language];
            }

            //DEBUG
            // action.unlocked = function() { return true; };
            // action.visible = function() { return true; };

            if(!action.unlocked) {
                action.unlocked = function() { return highestLevel >= 99; }
            }
            if(!action.visible) {
                action.visible = function() { return highestLevel >= 99; }
            }

            if(action.seconds === undefined) {
                action.seconds = 1;
            }
            if(!action.cost) {
                action.cost = [];
            }
            action.cost.push({
                resource:"seconds",
                type:"static",
                starting:action.seconds
            });

            if(!created[action.varName]) {
                created[action.varName] = 0;
            }

            if(!action.canBuy) {
                action.canBuy = function () {
                    return gold >= this.costgold && wood >= this.costwood && mana >= this.costmana;
                };
            }
            if(!action.spend) {
                action.spend = function () {
                    gold -= this.costgold;
                    wood -= this.costwood;
                    mana -= this.costmana;
                };
            }

            if(action.listNum === 0) {
                actionData.list.king.push(action);
            }
            if(action.listNum === 1) {
                actionData.list.castle.push(action);
            }
            if(action.listNum === 2) {
                actionData.list.other.push(action);
            }
        },
        kingAction: function(action) {
            if(!action.buy) {
                action.buy = function() {
                    created[this.varName]++;
                }
            }
            action.listNum = 0;

            actionData.create.actionBase(action);
        },
        blessingAction: function(action) {
            if(!action.buy) {
                action.buy = function () {
                    let favor = shrine.helpers.calcFavor();
                    levelData.blessings[this.varName + "Tribute"] = round5(levelData.blessings[this.varName + "Tribute"] +
                        favor * shrine.helpers.calcTributeBonus(this.varName));
                    if (levelData.blessings[this.varName + "Tribute"] >= levelData.blessings[this.varName + "TributeNeeded"]) {
                        levelData.blessings[this.varName + "Tribute"] -= levelData.blessings[this.varName + "TributeNeeded"];
                        created[this.varName]++;
                        if (this.varName === "heroes") {
                            levelData.blessings[this.varName + "TributeNeeded"] *= 10;
                        } else {
                            levelData.blessings[this.varName + "TributeNeeded"] += this.tribute;
                        }
                        warMap.units.updateExistingUnitStats();
                    }
                }
            }
            if(!action.canBuy) {
                action.canBuy = function() {
                    return created[this.varName] < action.max && wood >= shrine.helpers.calcFavor() * 100;
                }
            }
            action.spend = function() {
                wood -= shrine.helpers.calcFavor() * 100;
            };
            if(!action.unlocked) {
                action.unlocked = function() { return highestLevel >= 10; };
                action.visible = function() { return highestLevel >= 10; };
            }

            action.listNum = 0;

            actionData.create.actionBase(action);
        },
        warMapAction: function(action) {
            action.listNum = 0;
            //UNUSED - placeholder in case I want to join Units list?

            actionData.create.actionBase(action);
        },
        castleAction: function(action) {
            if(!action.buy) {
                action.buy = function() {
                    if(this.createdWith) { //is army unit
                        if(created[this.createdWith]) {
                            let amountToMake = created[this.createdWith];
                            created[this.varName] += amountToMake;
                            while(amountToMake > 0) {
                                let empowerIndex = castle.helpers.getNextHighestEmpower(this.varName);

                                if(empowerIndex === 0) {
                                    warMap.units.createUnit(this.varName, true, "home", amountToMake, empowerIndex);
                                    break;
                                }

                                let empowerAmount = levelData.empowered[this.varName] ? levelData.empowered[this.varName][empowerIndex] : 0;
                                if(empowerAmount >= amountToMake) {
                                    levelData.empowered[this.varName][empowerIndex] -= amountToMake;
                                    warMap.units.createUnit(this.varName, true, "home", amountToMake, empowerIndex);
                                    break;
                                }

                                warMap.units.createUnit(this.varName, true, "home", empowerAmount, empowerIndex);
                                levelData.empowered[this.varName][empowerIndex] -= empowerAmount;
                                amountToMake -= empowerAmount;
                            }
                        }
                    } else {
                        created[this.varName]++;
                    }
                }
            }
            action.canBuy = function() {
                return gold >= this.costgold && wood >= this.costwood && mana >= this.costmana && (!this.createdWith || created[this.createdWith] > 0);
            };
            action.listNum = 1;
            if(action.createdWith) {
                action.desc += "<br><div class='button hidden medium' id='"+action.varName+"EmpowerButton' style='margin-top:3px;' onclick='openEmpowerMenu()'>Empower Menu</div>"
            }

            actionData.create.actionBase(action);
        },
        otherAction: function(action) {
            action.canBuy = function() { return true; };
            action.unlocked = function() { return true; };
            action.visible = function() { return true; };
            action.listNum = 2;

            actionData.create.actionBase(action);
        }
    },
    get: {
        blessingActions: function() {
            let blessingActions = [];
            actionData.list.king.forEach(function(action) {
                if (!action.tribute) { //not a blessing action
                    return;
                }
                blessingActions.push(action);
            });
            return blessingActions;
        }
    },
    initial: {
        all: function() {
            actionData.initial.castle.income();
            actionData.initial.castle.army();
            actionData.initial.castle.spirits();
            actionData.initial.king.auras();
            actionData.initial.king.growth();
            actionData.initial.king.blessings();
            actionData.initial.other();
        },
        castle: {
            income: function() {
                actionData.create.castleAction({
                    varName:"beg",
                    name:"Hire Beggar",
                    desc:"Strategically placed begging gets a steady pittance. What nice citizens you have. Gives 1 gold per tick.",
                    cost: [
                        {
                            resource:"gold",
                            type:"linear",
                            starting:50,
                            growth:50
                        }
                    ],
                    seconds:10,
                    xPos:15,
                    yPos:0,
                    unlocked: function() { return unlockList[2]; },
                    visible: function() { return unlockList[2]; }
                });

                actionData.create.castleAction({
                    varName:"merchant",
                    name:"Hire Merchant",
                    desc:"Invest in a Merchant. They'll make it back eventually. Gives 5 gold per tick.",
                    cost: [
                        {
                            resource:"gold",
                            type:"linear",
                            starting:500,
                            growth:500
                        }
                    ],
                    seconds:40,
                    xPos:15,
                    yPos:55
                });

                actionData.create.castleAction({
                    varName:"tax",
                    name:"Hire Tax Collector",
                    desc:"The more you ask, the more they have! Isn't economics amazing? Gives 25 gold per tick.",
                    cost: [
                        {
                            resource:"gold",
                            type:"linear",
                            starting:5000,
                            growth:5000
                        }
                    ],
                    seconds:160,
                    xPos:15,
                    yPos:110
                });

                actionData.create.castleAction({
                    varName:"scavenger",
                    name:"Scavenger's Den",
                    desc:"Scavengers are weak, but know where the dead trees are to find branches that would otherwise need special tools. Gives 1 wood per tick.",
                    cost: [
                        {
                            resource:"gold",
                            type:"linear",
                            starting:50,
                            growth:50
                        }
                    ],
                    seconds:10,
                    xPos:75,
                    yPos:0,
                    unlocked: function() { return unlockList[2]; },
                    visible: function() { return unlockList[2]; }
                });

                actionData.create.castleAction({
                    varName:"logger",
                    name:"Logger's Hut",
                    desc:"The forest is magical, and some of the trees are tougher than iron. Woodcutters can take all but the toughest trees. Gives 5 wood per tick.",
                    cost: [
                        {
                            resource:"gold",
                            type:"linear",
                            starting:500,
                            growth:500
                        }
                    ],
                    seconds:40,
                    xPos:75,
                    yPos:55
                });

                actionData.create.castleAction({
                    varName:"forester",
                    name:"Forester's Cabin",
                    desc:"The forester knows the best trees to cut down without hurting the forest, and has the tools to take them down. Gives 25 wood per tick.",
                    cost: [
                        {
                            resource:"gold",
                            type:"linear",
                            starting:5000,
                            growth:5000
                        }
                    ],
                    seconds:160,
                    xPos:75,
                    yPos:110
                });
            },
            army: function() {
                actionData.create.castleAction({
                    varName:"barracks",
                    name:"Build Barracks",
                    desc:"Recruit some spearmen here to take the hits. Each barracks increases spearman equipped by 1, and increases the cost accordingly.",
                    cost: [
                        {
                            resource:"gold",
                            type:"linear",
                            starting:500,
                            growth:500
                        }
                    ],
                    unit:true,
                    seconds:10,
                    xPos:145,
                    yPos:0,
                    unlocked: function() { return unlockList[3]; },
                    visible: function() { return unlockList[3]; }
                });

                actionData.create.castleAction({
                    varName:"range",
                    name:"Build Archery Range",
                    desc:"Train archers here to take enemies down from behind the front line. Each archery range increases archers trained by 1, and increases the cost accordingly..",
                    cost: [
                        {
                            resource:"gold",
                            type:"linear",
                            starting:1500,
                            growth:1500
                        }
                    ],
                    seconds:10,
                    xPos:145,
                    yPos:55
                });

                actionData.create.castleAction({
                    varName:"designer",
                    name:"Hire Designer",
                    desc:"Designers know the ins and outs of mass production. Each designer increases catapults built by 1, and increases the cost accordingly..",
                    cost: [
                        {
                            resource:"gold",
                            type:"linear",
                            starting:4500,
                            growth:4500
                        }
                    ],
                    seconds:10,
                    xPos:145,
                    yPos:110
                });

                actionData.create.castleAction({
                    varName:"spearman",
                    name:"Equip Spearman",
                    desc:"The meat of your army, they'll take damage before your other units. Cost shown here is multiplied by number of barracks.",
                    cost: [
                        {
                            resource:"wood",
                            type:"static",
                            starting:200
                        }
                    ],
                    createdWith:"barracks",
                    seconds:5,
                    xPos:205,
                    yPos:0,
                    unlocked: function() { return unlockList[3]; },
                    visible: function() { return unlockList[3]; }
                });

                actionData.create.castleAction({
                    varName:"archer",
                    name:"Train Archer",
                    desc:"Elite archers capable of dealing death to your enemies. Cost shown here is multiplied by number of archery ranges.",
                    cost: [
                        {
                            resource:"wood",
                            type:"static",
                            starting:1000
                        }
                    ],
                    createdWith:"range",
                    seconds:10,
                    xPos:205,
                    yPos:55
                });

                actionData.create.castleAction({
                    varName:"catapult",
                    name:"Build Catapult",
                    desc:"For when you have a lot of enemies to kill and a lot of resoures to throw at the problem. Cost shown here is multiplied by number of designers.",
                    cost: [
                        {
                            resource:"wood",
                            type:"static",
                            starting:5000
                        }
                    ],
                    createdWith:"designer",
                    seconds:20,
                    xPos:205,
                    yPos:110
                });
            },
            spirits: function() {
                actionData.create.castleAction({
                    varName:"altar",
                    name:"Build Altar",
                    desc:"Gives +1 Favor. The Blessing gains Tribute equal to Favor, plus 10% more for each time you've completed that level's Blessing.",
                    cost: [
                        {
                            resource:"wood",
                            type:"static",
                            starting:2000
                        },
                        {
                            resource:"gold",
                            type:"static",
                            starting:1000
                        }
                    ],
                    seconds:10,
                    xPos:275,
                    yPos:0,
                    unlocked: function() { return highestLevel >= 10; },
                    visible: function() { return highestLevel >= 10; }
                });

                actionData.create.castleAction({
                    varName:"shrine",
                    name:"Build Shrine",
                    desc:"Gives +5 Favor. The Blessing gains Tribute equal to Favor, plus 10% more for each time you've completed that level's Blessing.",
                    cost: [
                        {
                            resource:"wood",
                            type:"static",
                            starting:20000
                        },
                        {
                            resource:"gold",
                            type:"static",
                            starting:10000
                        }
                    ],
                    seconds:20,
                    xPos:275,
                    yPos:55,
                    unlocked: function() { return highestLevel >= 10; },
                    visible: function() { return highestLevel >= 10; }
                });

                actionData.create.castleAction({
                    varName:"ritual",
                    name:"Perform Ritual",
                    desc:"Give wood back to the forest in ever-larger effigies. Doubles favor.",
                    cost: [
                        {
                            resource:"wood",
                            type:"linear",
                            starting:10000,
                            growth:10000
                        }
                    ],
                    seconds:20,
                    xPos:275,
                    yPos:110,
                    unlocked: function() { return highestLevel >= 10; },
                    visible: function() { return highestLevel >= 10; }
                });
            }
        },
        king: {
            auras: function() {
                actionData.create.kingAction({
                    varName:"market",
                    name:"Oversee Market",
                    desc:"Go to the market and use your kingly charisma to get the gold flowing. Doubles gold gain. Lasts until the King starts another action or leaves the castle.",
                    seconds:1,
                    xPos:15,
                    yPos:0,
                    start: function() {
                        king.curData.aura = "gold";
                    },
                    unlocked: function() { return unlockList[6]; },
                    visible: function() { return unlockList[6]; }
                });

                actionData.create.kingAction({
                    varName:"commune",
                    name:"Commune with Forest",
                    desc:"Speak with the spirits of your forest, convincing them to guide your wood gathering efforts. Doubles wood gain. Lasts until the King starts another action or leaves the castle.",
                    seconds:1,
                    xPos:15,
                    yPos:55,
                    start: function() {
                        king.curData.aura = "wood";
                    },
                    unlocked: function() { return unlockList[6]; },
                    visible: function() { return unlockList[6]; }
                });

                actionData.create.kingAction({
                    varName:"direct",
                    name:"Direct Workers",
                    desc:"Take a critical role in organizing your workers using your ever-increasing knowledge. Lasts until the King starts another action or leaves the castle.",
                    seconds:1,
                    xPos:15,
                    yPos:110,
                    start: function() {
                        king.curData.aura = "build";
                    },
                    unlocked: function() { return unlockList[9]; },
                    visible: function() { return unlockList[9]; }
                });
            },
            growth: function() {
                actionData.create.kingAction({
                    varName:"train",
                    name:"Train",
                    desc:"Train to recover the reflexes you've had in past lives. Add (Reflex Cap - Current Reflex)/50 to your Current Reflex.",
                    seconds:5,
                    xPos:85,
                    yPos:0,
                    buy: function() {
                        king.curData.rflxCur += (king.savedData.rflxCap - king.curData.rflxCur)/50;
                        warMap.units.updateExistingUnitStats();
                    },
                    unlocked: function() { return unlockList[7]; },
                    visible: function() { return unlockList[7]; }
                });

                actionData.create.kingAction({
                    varName:"chat",
                    name:"Chat with Citizens",
                    desc:"Learn to talk to your citizens, and when you have enough rapport, learn about interesting family secrets to further study. Hover the (?) for the info on numbers.<br>" +
                        "<div class=\"showthat\" style=''>" +
                        "    <i class=\"fa fa-question-circle\" aria-hidden=\"true\" style='font-size:16px'></i>" +
                        "    <div class=\"showthisUp\" style=\"width:520px\">" +
                        "        Each map has a max number of people to talk to. You gain rapport equal to your CHA until you've filled the rapport bar and the person shares their secrets. Secrets increase increases your knowledge cap by 200 for the first, dropping -2 for each one from there. You can only get secrets from a person once, but you need to talk to people in the right order.<br>" +
                        "        Each person has a difficulty, and the next person has +0.1 difficulty. You need (10 * difficulty) rapport per person. Additionally, if their difficulty is higher than your CHA, you need an additional ((difficulty - CHA)^2)*5 rapport.<br>" +
                        "        If the difficulty is higher than your CHA, upon completion you gain CHA equal to (difficulty - CHA)/10, rounded up to the nearest hundredth.<br>" +
                        "        You gain 200 max knowledge for the first secret, and -2 for each subsequent secret.<br>" +
                        "        You remember the conversations, and you get better at speaking to people you've already spoken to. Everyone with less difficulty than your highest reached difficulty is 25% easier to talk to. Your highest reached is saved 4 separate times per map.<br>" +
                        "    </div>" +
                        "</div><br>" +
                        "<div id=\"peopleInfo\" style='width:250px;position:relative;height:50px;'>" +
                        "    <div class=\"abs\" style='left:0;top:0'>Person <div id=\"personNum\"></div>, Difficulty <div id=\"difficulty\" class=\"bold\"></div></div>" +
                        "    <div class=\"abs\" style=\"left:0;top:20px;height:17px;width:150px;background-color:rgb(255,247,181);\">" +
                        "        <div id=\"rapportProgress\" class=\"abs\" style=\"left:0;width:20%;height:100%;background-color:rgba(255, 184, 15, .8)\"></div>" +
                        "        <div id=\"rapport\" class=\"abs\" style=\"left:5px\">50 / 250 rapport</div>" +
                        "    </div>" +
                        "    <div class=\"abs showthat\" style='left:0;top:38px'>" +
                        "        Secrets Learned: <div id=\"secrets\" class=\"bold\"></div>" +
                        "        <div class=\"showthis\" style='width:200px'>" +
                        "            <div id=\"mapMaxPeople\" class=\"bold\"></div> people total on this map" +
                        "        </div>" +
                        "    </div>" +
                        "    <div class=\"abs showthat\" style='left:150px;top:20px'>" +
                        "        +<div id=\"rapportAdded\" class=\"bold\"></div>" +
                        "        <div class=\"showthis\" style=\"width:150px\">" +
                        "            <div id=\"personHighest\"></div>" +
                        "        </div>" +
                        "    </div>" +
                        "</div>",
                    cost: [],
                    seconds:5,
                    xPos:85,
                    yPos:55,
                    buy: function() {
                        //levelData.initial describes things initials of every level reset and the initial numbers of the permanent level data
                        //levelData.data describes things that are reset every level
                        //levelSave[curLevel] describes things that are not reset

                        let rapportNeeded = 10 * levelData.data.difficulty;
                        if(king.savedData.cha < levelData.data.difficulty) {
                            rapportNeeded += Math.pow((levelData.data.difficulty - king.savedData.cha), 2)*5
                        }

                        if(levelData.data.person < levelData.initial.people) { //only add if not done
                            levelData.data.rapport += king.savedData.cha * king.calcRapportBonus();
                        }
                        while(rapportNeeded <= levelData.data.rapport) { //advance a person
                            levelData.data.person++;
                            levelData.data.rapport -= rapportNeeded;
                            if(levelData.data.person > levelSave[curLevel].secrets) {
                                levelSave[curLevel].knowledgeCap += 200 - levelSave[curLevel].secrets * 2;
                                levelSave[curLevel].secrets++;
                            }
                            if(levelData.data.difficulty > king.savedData.cha) {
                                king.savedData.cha = round5(king.savedData.cha + Math.ceil((levelData.data.difficulty - king.savedData.cha) * 10 - .000000001) / 100);
                            }
                            levelData.data.difficulty = round2(levelData.data.difficulty + .1); //handle rounding

                            rapportNeeded = 10 * levelData.data.difficulty;
                            if(king.savedData.cha < levelData.data.difficulty) {
                                rapportNeeded += Math.pow((levelData.data.difficulty - king.savedData.cha), 2)*5
                            }
                        }
                        levelData.data.rapport = round5(levelData.data.rapport);
                    },
                    canBuy: function() {
                        return levelData.data.person < levelData.initial.people;
                    },
                    unlocked: function() { return levelInitials[curLevel].initial.people > 0; },
                    visible: function() { return levelInitials[curLevel].initial.people > 0; }
                });

                actionData.create.kingAction({
                    varName:"study",
                    name:"Study",
                    desc:"Learn how to internalize the knowledge that you've gained from others. Gain Knowledge equal to your WIS up to your Knowledge Cap. Get .001 permanent INT per Knowledge." +
                    "<div id=\"knowledgeInfo\" class=\"showthat\" style='width:100%'>" +
                    "    Knowledge: <div id=\"knowledge\" class=\"bold\"></div> / <div id=\"knowledgeCap\" class=\"bold\"></div> (+<div id=\"knowledgeRate\" class=\"bold\"></div>)<br>" +
                    "    <div class=\"showthis\">" +
                    "        Every 1000 knowledge gained gives the king 1 INT" +
                    "    </div>" +
                    "</div>",
                    cost: [],
                    seconds:5,
                    xPos:85,
                    yPos:110,
                    buy: function() {
                        let knowledgeGain = king.savedData.wis;
                        if((knowledgeGain + levelSave[curLevel].knowledge) > levelSave[curLevel].knowledgeCap) {
                            knowledgeGain = levelSave[curLevel].knowledgeCap - levelSave[curLevel].knowledge;
                        }
                        levelSave[curLevel].knowledge += knowledgeGain;
                        king.savedData.int += knowledgeGain / 1000;
                        king.helpers.recalcListLength();
                    }
                });

            },
            blessings: function() {
                actionData.create.blessingAction({
                    varName:"enchant",
                    name:"Faerie Enchantments",
                    desc:"+20% atk all units, 10 points + 10 each time. Costs 100 wood per favor.",
                    tribute:10,
                    cost: [],
                    max: 5,
                    seconds:5,
                    xPos:155,
                    yPos:0
                });

                actionData.create.blessingAction({
                    varName:"feast",
                    name:"Blessed Feasts",
                    desc:"+20% hp all units, 10 points + 10 each time. Costs 100 wood per favor.",
                    cost: [],
                    tribute:10,
                    max: 5,
                    seconds:5,
                    xPos:155,
                    yPos:55
                });

                actionData.create.blessingAction({
                    varName:"guidance",
                    name:"Faerie Guidance",
                    desc:"+20% spd all units, 30 points + 30 each time. Costs 100 wood per favor.",
                    cost: [],
                    tribute:30,
                    max: 15,
                    seconds:5,
                    xPos:155,
                    yPos:110
                });

                actionData.create.blessingAction({
                    varName:"peace",
                    name:"Peaceful Aura",
                    desc:"+10% gold all buildings. 5 points + 5 each time. Costs 100 wood per favor.",
                    cost: [],
                    tribute:5,
                    max: 15,
                    seconds:5,
                    xPos:215,
                    yPos:0
                });

                actionData.create.blessingAction({
                    varName:"bounty",
                    name:"Nature's Bounty",
                    desc:"+10% wood all buildings. 5 points + 5 each time. Costs 100 wood per favor.",
                    cost: [],
                    tribute:5,
                    max: 15,
                    seconds:5,
                    xPos:215,
                    yPos:55
                });

                actionData.create.blessingAction({
                    varName:"heroes",
                    name:"Empower Forest Champion",
                    desc:"100 * 10 each time, 3 max. Costs 100 wood per favor.",
                    cost: [],
                    tribute:100,
                    max: 3,
                    seconds:5,
                    xPos:215,
                    yPos:110,
                    unlocked: function() { return highestLevel >= 50; }, //TODO eventually
                    visible: function() { return highestLevel >= 50; }
                });
            }
        },
        other: function() {
            actionData.create.otherAction({
                varName:"sleep",
                name:"Sleep",
                desc:"Add an action to the current list that waits for one second. Auto-added if no other action is available.",
                seconds:1,
                xPos:15,
                yPos:0
            });

            actionData.create.otherAction({
                varName:"pause",
                name:"Pause",
                desc:"Add an action to the current list that pauses when it's run. Does not interfere with the game otherwise.",
                seconds:0,
                xPos:15,
                yPos:55
            });

            actionData.create.otherAction({
                varName:"restart",
                name:"Restart",
                desc:"Add an action that restarts the map when it's run. Takes 5 seconds to finish.",
                seconds:5,
                buy: function() { restartReason = "Action"; mana = 0; },
                xPos:15,
                yPos:110
            });
        }
    }
};

actionData.initial.all();

function getCastleActionByVarName(varName) {
    let found = null;
    actionData.list.castle.forEach(function(action) {
        if(action.varName === varName) {
            found = action;
        }
    });
    return found;
}

function getKingActionByVarName(varName) {
    let found = null;
    actionData.list.king.forEach(function(action) {
        if(action.varName === varName) {
            found = action;
        }
    });
    return found;
}

function getOtherActionByVarName(varName) {
    let found = null;
    actionData.list.other.forEach(function(action) {
        if(action.varName === varName) {
            found = action;
        }
    });
    return found;
}

//for auto adding
function addSleepAction(num, index) {
    addActionToList("sleep", num, false, false, false, index);
}
