castle.actions = [];
castle.resources = {};

castle.tick = function() {
    wood += castle.resources.logger;
    gold += castle.resources.tax;
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
    varName:"tax",
    name:"Tax Collectors",
    desc:"The more you ask, the more they have! Isn't economics amazing?",
    cost: [
        {
            resource:"gold",
            type:"linear",
            starting:50,
            growth:50
        }
    ],
    seconds:10,
    xPos:555,
    yPos:105
});

addCastleAction({
    varName:"logger",
    name:"Logger's Hut",
    desc:"The forest is magical, and some of the trees are tougher than iron. Hire a woodcutter to start harvesting your kingdom's natural resource.",
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
    yPos:10
});