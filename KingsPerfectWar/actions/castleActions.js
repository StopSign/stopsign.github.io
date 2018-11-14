castle.actions = [];
castle.resources = {};

castle.tick = function() {
    let addedWood = 0;
    addedWood += castle.resources.scavenger;
    addedWood += castle.resources.logger * 5;
    addedWood += castle.resources.forester * 25;
    wood += addedWood;

    let addedGold = 0;
    addedGold += castle.resources.beg;
    addedGold += castle.resources.merchant * 5;
    addedGold += castle.resources.tax * 25;
    gold += addedGold;
};

function addCastleAction(action) {
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

    if(!castle.resources[action.varName]) {
        castle.resources[action.varName] = 0;
    }
    if(!action.buy) {
        action.buy = function() {
            castle.resources[action.varName]++;
        }
    }

    castle.actions.push(action);
}

function getCastleActionByVarName(varName) {
    let found = null;
    castle.actions.forEach(function(action) {
        if(action.varName === varName) {
            found = action;
        }
    });
    return found;
}

addCastleAction({
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
    xPos:20,
    yPos:110
});

addCastleAction({
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
    xPos:70,
    yPos:110
});

addCastleAction({
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
    xPos:120,
    yPos:110
});

addCastleAction({
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
    xPos:20,
    yPos:25
});

addCastleAction({
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
    xPos:70,
    yPos:25
});

addCastleAction({
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
    xPos:120,
    yPos:25
});