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
                xPos:20,
                yPos:150,
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
                xPos:70,
                yPos:150,
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
                xPos:120,
                yPos:150,
                start: function() {
                    king.curData.aura = "build";
                }
            });

            king.initial.addKingAction({
                varName:"chat",
                name:"Chat with Citizens",
                desc:"Learn to talk to your citizens, and when you have enough rapport, learn about interesting family secrets and books to further study. Hover the (?) for info on numbers.",
                cost: [],
                seconds:5,
                xPos:250,
                yPos:25,
                buy: function() {
                    //levelData.initial describes things initials of every level reset and the initial numbers of the permanent level data
                    //levelData.data describes things that are reset every level
                    //levelSave[curLevel] describes things that are not reset

                    let rapportNeeded = 10 * levelData.data.difficulty;
                    if(king.savedData.cha < levelData.data.difficulty) {
                        rapportNeeded += Math.pow((levelData.data.difficulty - king.savedData.cha), 2)*5
                    }

                    if(levelData.data.person < levelData.initial.people) { //only add if done otherwise
                        levelData.data.rapport += king.savedData.cha;
                    }
                    while(rapportNeeded <= levelData.data.rapport) { //advance a person
                        levelData.data.person++;
                        levelData.data.rapport -= rapportNeeded;
                        if(levelData.data.person > levelSave[curLevel].secrets) {
                            levelSave[curLevel].knowledgeCap += 200 - levelSave[curLevel].secrets * 2;
                            levelSave[curLevel].secrets++;
                        }
                        if(levelData.data.difficulty > king.savedData.cha) {
                            king.savedData.cha += Math.ceil((levelData.data.difficulty - king.savedData.cha) * 10 - .000000001) / 100;
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
                desc:"Learn how to internalize the knowledge that you've gained from others. Gain Knowledge equal to your WIS up to your Knowledge Cap. Get .001 permanent INT per Knowledge.",
                cost: [],
                seconds:5,
                xPos:250,
                yPos:85,
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
                xPos:250,
                yPos:145,
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
            for(let i = 0; i < levelSave[curLevel].highestPerson; i++) {
                if(levelData.data.person < levelSave[curLevel].highestPerson[i]) {
                    bonus++;
                }
            }
            return 1 + (bonus / 4);
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