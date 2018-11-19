let king = {
    actions:[],
    savedData: {
        int:0,
        wis:1,
        cha:1,
        rflxInitial:10,
        rflxCap:10,
        knowledge:0,
        knowledgeCap:0,
        exp:0
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
            action.canBuy = function() {
                return gold >= this.costgold && wood >= this.costwood && mana >= this.costmana;
            };

            king.actions.push(action);
        },
        createKingActions() {
            king.initial.addKingAction({
                varName:"market",
                name:"Oversee Market",
                desc:"Go to the market and use your kingly charisma to get the gold flowing. Gold gain from income buildings is multiplied by (2 + CHA / 10). Lasts until the King starts another action or leaves the castle.",
                cost: [],
                seconds:1,
                xPos:20,
                yPos:25
            });

            king.initial.addKingAction({
                varName:"commune",
                name:"Commune with Forest",
                desc:"Speak with the spirits of your forest, convincing them to guide your wood gathering efforts. Wood gain from income buildings is multiplied by (2 + CHA / 10). Lasts until the King starts another action or leaves the castle.",
                cost: [],
                seconds:1,
                xPos:70,
                yPos:25
            });

            king.initial.addKingAction({
                varName:"direct",
                name:"Direct Masons",
                desc:"Aid your masons in planning your construction efforts with your ever-increasing knowledge. Building speed of Castle Income and Lab buildings multiplied by (1.5 + INT / 100). Lasts until the King starts another action or leaves the castle.",
                cost: [],
                seconds:1,
                xPos:120,
                yPos:25
            });

            king.initial.addKingAction({
                varName:"chat",
                name:"Chat with Citizens",
                desc:"Learn to talk to your citizens, and when you have enough rapport, learn about interesting family secrets and books to further study.",
                cost: [],
                seconds:2,
                xPos:250,
                yPos:25
            });

            king.initial.addKingAction({
                varName:"study",
                name:"Study",
                desc:"Learn how to internalize the knowledge that you've gained from others.",
                cost: [],
                seconds:5,
                xPos:250,
                yPos:85
            });

            king.initial.addKingAction({
                varName:"train",
                name:"Train",
                desc:"Train to recover the reflexes you've had in past lives. Add (Reflex Cap - Current Reflex)/100 to your Current Reflex.",
                cost: [],
                seconds:5,
                xPos:250,
                yPos:145
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