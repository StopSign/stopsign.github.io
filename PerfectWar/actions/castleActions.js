castle.actions = [];

function addCastleAction(action) {
    if(window.language !== "eng") {
        action.name = action["name"+window.language];
        action.desc = action["desc"+window.language];
    }

    castle.actions.push(action);
}

function getCastleByVarName(varName) {
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
            starting:10,
            growth:10
        },
        {
            resource:"seconds",
            type:"static",
            starting:10
        }
    ],
    time:100,
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
            starting:10,
            growth:10
        },
        {
            resource:"seconds",
            type:"static",
            starting:10
        }
    ],
    xPos:20,
    yPos:10

});