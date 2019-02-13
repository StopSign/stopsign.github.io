let king = {
    actions:[],
    savedData: {
        int:0,
        wis:1,
        cha:1,
        rflxInitial:10,
        rflxCap:10,
        exp:0
    },
    curData: {
        aura:"",
        rflxCur:10
    },
    tick: function() {

    },
    initial: {
        addKingAction(action) {
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

            if(!created.king[action.varName]) {
                created.king[action.varName] = 0;
            }
            if(!action.buy) {
                action.buy = function() {
                    created.king[this.varName]++;
                }
            }
            if(!action.start) {
                action.start = function() {
                    king.curData.aura = "";
                }
            }
            action.canBuy = function() {
                return gold >= this.costgold && wood >= this.costwood && mana >= this.costmana;
            };

            king.actions.push(action);
        },
        createKingActions() {
            king.initial.addKingAction({
                varName:"market",
                name:"Oversee Market",
                desc:"Go to the market and use your kingly charisma to get the gold flowing. Gold gain from income buildings is multiplied by (2 + CHA / 20). Lasts until the King starts another action or leaves the castle.",
                cost: [],
                seconds:1,
                xPos:15,
                yPos:0,
                start: function() {
                    king.curData.aura = "gold";
                }
            });

            king.initial.addKingAction({
                varName:"commune",
                name:"Commune with Forest",
                desc:"Speak with the spirits of your forest, convincing them to guide your wood gathering efforts. Wood gain from income buildings is multiplied by (2 + CHA / 20). Lasts until the King starts another action or leaves the castle.",
                cost: [],
                seconds:1,
                xPos:15,
                yPos:50,
                start: function() {
                    king.curData.aura = "wood";
                }
            });

            king.initial.addKingAction({
                varName:"direct",
                name:"Direct Workers",
                desc:"Take a critical role in organizing your workers using your ever-increasing knowledge. Building speed of Castle multiplied by (1.5 + INT / 100). Lasts until the King starts another action or leaves the castle.",
                cost: [],
                seconds:1,
                xPos:15,
                yPos:100,
                start: function() {
                    king.curData.aura = "build";
                }
            });

            king.initial.addKingAction({
                varName:"chat",
                name:"Chat with Citizens",
                desc:"Learn to talk to your citizens, and when you have enough rapport, learn about interesting family secrets and books to further study. Hover the (?) for the info on numbers.<br>" +
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
                    "    <div class=\"abs\" style='left:0;top:0'>Person <div id=\"personNum\" class=\"bold\"></div>, Difficulty <div id=\"difficulty\" class=\"bold\"></div></div>" +
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
                yPos:0,
                buy: function() {
                    //levelData.initial describes things initials of every level reset and the initial numbers of the permanent level data
                    //levelData.data describes things that are reset every level
                    //levelSave[curLevel] describes things that are not reset

                    let rapportNeeded = 10 * levelData.data.difficulty;
                    if(king.savedData.cha < levelData.data.difficulty) {
                        rapportNeeded += Math.pow((levelData.data.difficulty - king.savedData.cha), 2)*5
                    }

                    if(levelData.data.person < levelData.initial.people) { //only add if not done
                        levelData.data.rapport += king.savedData.cha * king.helpers.calcRapportBonus();
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
                    return levelData.data.people >= 0;
                }
            });

            king.initial.addKingAction({
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
                yPos:50,
                buy: function() {
                    let knowledgeGain = king.savedData.wis;
                    if((knowledgeGain + levelSave[curLevel].knowledge) > levelSave[curLevel].knowledgeCap) {
                        knowledgeGain = levelSave[curLevel].knowledgeCap - levelSave[curLevel].knowledge;
                    }
                    levelSave[curLevel].knowledge += knowledgeGain;
                    king.savedData.int += knowledgeGain / 1000;
                }
            });

            king.initial.addKingAction({
                varName:"train",
                name:"Train",
                desc:"Train to recover the reflexes you've had in past lives. Add (Reflex Cap - Current Reflex)/100 to your Current Reflex.",
                cost: [],
                seconds:5,
                xPos:85,
                yPos:100,
                buy: function() {
                    king.curData.rflxCur += (king.savedData.rflxCap - king.curData.rflxCur)/100;
                }
            });

        }
    },
    helpers: {
        getLevel: function() { //200, 500, 900, 1400, etc.
            let level = Math.floor((Math.sqrt(2*king.savedData.exp + 225)-25)/10+.0000001);
            return level < 0 ? 0 : level+1;
        },
        getExpOfLevel: function(level) {
            return 50 * (level+2) * (level + 3)-100; //50 *(y+2)* (y + 3)-100
        },
        calcRapportBonus: function() {
            let bonus = 0;
            for(let i = 0; i < levelSave[curLevel].highestPerson.length; i++) {
                if(levelData.data.person < levelSave[curLevel].highestPerson[i].person) {
                    bonus += levelSave[curLevel].highestPerson[i].amount;
                }
            }
            return 1 + (bonus / 4);
        },
        saveHighestPerson: function() {
            //{ person, amount }
            let found = false;
            for(let i = 0; i < levelSave[curLevel].highestPerson.length; i++) {
                let highestPerson = levelSave[curLevel].highestPerson[i];
                if(highestPerson.person === levelData.data.person) {
                    highestPerson.amount++;
                    found = true;
                    break;
                }
            }
            if(!found) {
                levelSave[curLevel].highestPerson.push({person:levelData.data.person, amount:1});
            }
            levelSave[curLevel].highestPerson.sort(function(a, b){ return a.person-b.person });

            let foundAmount = 0;
            //keep only the top ${highestListsLength}
            for(let i = levelSave[curLevel].highestPerson.length - 1; i >= 0; i--) {
                let highestPerson = levelSave[curLevel].highestPerson[i];
                if(foundAmount >= Math.floor(highestListsLength/2)) {
                    levelSave[curLevel].highestPerson.splice(i, 1);
                }
                foundAmount += highestPerson.amount;
                if(foundAmount >= Math.floor(highestListsLength/2)) {
                    highestPerson.amount = Math.floor(highestListsLength/2) - (foundAmount - highestPerson.amount);
                }
            }
        },
        getBonusByAura: function(auraName) {
            if(!king.helpers.kingIsHome() || king.curData.aura !== auraName) {
                return 1;
            }
            if(["gold", "wood"].indexOf(auraName) !== -1) {
                return 2 + king.savedData.cha / 20;
            }
            if("build" === auraName) {
                return document.getElementById("keepBuild").checked ? buildAuraValue : 1.5 + king.savedData.int / 100;
            }
            return 1;
        },
        kingIsHome: function() {
            let kingIsHome = false;
            levelData.home.units.forEach(function(unit) {
                if(unit.varName === "king") {
                    kingIsHome = true;
                }
            });
            return kingIsHome;
        }
    }
};
created.king = {};

function getKingActionByVarName(varName) {
    let found = null;
    king.actions.forEach(function(action) {
        if(action.varName === varName) {
            found = action;
        }
    });
    return found;
}

king.initial.createKingActions();