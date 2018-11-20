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
                yPos:25,
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
                yPos:25,
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
                yPos:25,
                start: function() {
                    king.curData.aura = "build";
                }
            });

            king.initial.addKingAction({
                varName:"chat",
                name:"Chat with Citizens",
                desc:"Learn to talk to your citizens, and when you have enough rapport, learn about interesting family secrets and books to further study. Hover the (?) for info on numbers.",
                //Each map has a max number of people to talk to. You gain rapport equal to your CHA until a person has shared their secrets, increasing your knowledge cap.
                //Each person has a difficulty, and the next person has +.1 difficulty. You need (100 * difficulty) rapport per person. Additionally, if their difficulty is higher than your CHA, you need another (difficulty - CHA)*50)^2 rapport.
                //Rapport on the current person resets when the map resets. If their difficulty is higher than your CHA, you gain CHA equal to (difficulty - CHA)/10 . CHA used for these calculations is rounded to the nearest tenth - matching what you see.
                //You gain 200 max knowledge for the first person, and -2 for each subsequent person.
                cost: [],
                seconds:2,
                xPos:250,
                yPos:25,
                buy: function() {
                    let personNum = levelData.initial.people - levelData.data.people;
                    let difficulty = levelData.initial.peopleDifficulty + personNum/10;
                    let rapportNeeded = 100 * difficulty;
                    if(king.savedData.cha < difficulty) {
                        rapportNeeded += Math.pow((difficulty - round1(king.savedData.cha))*50, 2)
                    }
                    levelData.data.rapport += round1(king.savedData.cha);
                    if(rapportNeeded <= levelData.data.rapport) {
                        levelData.data.knowledgeCap += 200 - personNum * 2;
                        levelData.data.rapport = 0;
                        levelData.data.people--;
                        king.savedData.cha += (difficulty - round1(king.savedData.cha)) / 10;
                    }
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
                    if((knowledgeGain+levelData.savedData.knowledge) > levelData.savedData.knowledgeCap) {
                        knowledgeGain = levelData.savedData.knowledgeCap - levelData.savedData.knowledge;
                    }
                    levelData.savedData.knowledge += knowledgeGain;
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
            let level = Math.floor((Math.sqrt(2*king.exp + 225)-25)/10+.0000001);
            return level < 0 ? 0 : level;
        },
        getExpOfLevel: function(level) {
            return 50 * (level+2) * (level + 3)-100; //50 *(y+2)* (y + 3)-100
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