


// function createAction(methodName, type, tier, progressMax, expToLevel, unlockCost, x, y, downstreamVars) {
//     let actionVar = methodName.charAt(6).toLowerCase() + methodName.slice(7); //createBasicLabor -> basicLabor
//     let title = methodName.replace(/^create/, '').replace(/([A-Z])/g, ' $1').trim(); //createBasicLabor -> Basic Labor
//
//     //design philosophy requirement: toAddMultIncrease >= progressMaxIncrease, to prevent levels ever being a bad thing
//     //Exception: spend money lol
//     let progressMaxIncrease = 3.163; //sqrt(10)
//     let expToLevelIncrease = 1.1;
//     let toAddMultIncrease = 1;
//     if(type === 1) {
//         progressMaxIncrease = 1.02;
//         expToLevelIncrease = 1.01;
//         toAddMultIncrease = 1.04;
//     }
//     if(type === 2) {
//         progressMaxIncrease = 1.25;
//         toAddMultIncrease = 1.5;
//     }
//     if(type === 3) {
//         progressMaxIncrease = 5;
//         expToLevelIncrease = 1.01;
//     }
//     if(type === 4) {
//         progressMaxIncrease = 3;
//         toAddMultIncrease = 3.1;
//     }
//     if(type === 5) {
//         progressMaxIncrease = 3;
//         toAddMultIncrease = 3.1;
//     }
//
//     let actionObj = createAndLinkNewAction(actionVar, expToLevelIncrease, toAddMultIncrease, progressMaxIncrease, progressMax, expToLevel, unlockCost, title, x, y, downstreamVars, tier);
//     actionObj.tier = tier;
//
//     return actionObj;
// }

//design philosophy requirement: toAddMultIncrease >= progressMaxIncrease, to prevent levels ever being a bad thing

function create(actionVar, downstreamVars, x, y) {
    let actionDataObj = actionData[actionVar];
    if(!actionDataObj) {
        console.log("Could not find in actionData, " + actionVar);
        return;
    }
    x*= 300;
    y*= -300;
    let title = actionVar.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, char => char.toUpperCase()); //basicLabor -> Basic Labor
    let actionObj = createAndLinkNewAction(actionVar, actionDataObj, title, x, y, downstreamVars);
    actionObj.statMods.forEach(function (statMod) { //add the action to the stat, to update exp reductions
        data.statNames.forEach(function (statName) {
            let stat = data.stats[statName];
            if(statMod[0] === stat.statVar) {
                stat.linkedActionVars.push(actionVar);
            }
        });
    });
}

//Has a custom onComplete if it has a toAdd
//Requires that upstream actions are above downstream, so updating works consistently
let actionData = {
    motivate:{
        tier:0,
        expToLevelBase:2, expToLevelMult:1, expToLevelIncrease:1.001,
        progressMaxBase:10, progressMaxMult:1, progressMaxIncrease:1,
        toAddBase:10, toAddMult:1, toAddMultIncrease:1.02,
        unlockCost:0, visible:true, unlocked:true,
        onComplete:function() {
            data.actions.motivate.resolve += data.actions.motivate.toAdd;
        },
        statMods:[["drive", 1], ["discipline", 1], ["ambition", 1]],
        onLevelStats:[["resilience", 1], ["diligence", 1]]
    },
    reflect: {
        tier:0,
        expToLevelBase:20, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        toAddBase:1, toAddMult:1, toAddMultIncrease:3.1,
        unlockCost:10, visible:true, unlocked:false,
        onComplete:function() {
        },
        onUnlock: function() {
            data.actions.establishRituals.visible = true;
        },
        statMods:[],
        onLevelStats:[["drive", 20]]
    },
    spendMoney: {
        tier:0,
        expToLevelBase:20, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        toAddBase:1, toAddMult:1, toAddMultIncrease:3.1,
        unlockCost:10, visible:false, unlocked:false,
        onComplete:function() {
        },
        onUnlock: function() {
        },
        statMods:[],
        onLevelStats:[]
    },
    rememberTheFallen: {
        tier:0,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        toAddBase:1, toAddMult:1, toAddMultIncrease:3.1,
        unlockCost:50, visible:false, unlocked:false,
        onComplete:function() {
        },
        statMods:[],
        onLevelStats:[]
    },
    honorPastSacrifices: {
        tier:0,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        toAddBase:1, toAddMult:1, toAddMultIncrease:3.1,
        unlockCost:50, visible:false, unlocked:false,
        onComplete:function() {
        },
        statMods:[],
        onLevelStats:[]
    },
    payTribute: {
        tier:0,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        toAddBase:1, toAddMult:1, toAddMultIncrease:3.1,
        unlockCost:50, visible:false, unlocked:false,
        onComplete:function() {
        },
        statMods:[],
        onLevelStats:[]
    },
    findInnerPeace: {
        tier:0,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        toAddBase:1, toAddMult:1, toAddMultIncrease:3.1,
        unlockCost:50, visible:false, unlocked:false,
        onComplete:function() {
        },
        statMods:[],
        onLevelStats:[]
    },
    establishRituals: {
        tier:0,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:2,
        progressMaxBase:10, progressMaxMult:1, progressMaxIncrease:2,
        toAddBase:1, toAddMult:1, toAddMultIncrease:3.1,
        unlockCost:100, visible:false, unlocked:false,
        onComplete:function() {
        },
        onUnlock: function() {
            data.actions.travelToOutpost.visible = true;
        },
        statMods:[["discipline", 10]],
        onLevelStats:[]
    },
    peruseLibrary: {
        tier:0,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        toAddBase:1, toAddMult:1, toAddMultIncrease:3.1,
        unlockCost:50, visible:false, unlocked:false,
        onComplete:function() {
        },
        statMods:[],
        onLevelStats:[]
    },
    researchHistory: {
        tier:0,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        toAddBase:1, toAddMult:1, toAddMultIncrease:3.1,
        unlockCost:50, visible:false, unlocked:false,
        onComplete:function() {
        },
        statMods:[],
        onLevelStats:[]
    },
    reaffirmYourVows: {
        tier:0,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        toAddBase:1, toAddMult:1, toAddMultIncrease:3.1,
        unlockCost:50, visible:false, unlocked:false,
        onComplete:function() {
        },
        statMods:[],
        onLevelStats:[]
    },
    travelToOutpost: {
        tier:0,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        toAddBase:1, toAddMult:1, toAddMultIncrease:3.1,
        unlockCost:50, visible:false, unlocked:false,
        onComplete:function() {
        },
        onUnlock: function() {
            data.actions.reportForDuty.visible = true;
        },
        statMods:[],
        onLevelStats:[]
    },
    reportForDuty: {
        tier:0,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        toAddBase:1, toAddMult:1, toAddMultIncrease:3.1,
        unlockCost:50, visible:false, unlocked:false,
        onComplete:function() {
        },
        statMods:[],
        onLevelStats:[]
    },
    clearTheTrail: {
        tier:0,
        expToLevelBase:20, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        toAddBase:1, toAddMult:1, toAddMultIncrease:3.1,
        unlockCost:10, visible:false, unlocked:false,
        onComplete:function() {
        },
        onUnlock: function() {
        },
        statMods:[],
        onLevelStats:[]
    },
    paveTheTrail: {
        tier:0,
        expToLevelBase:20, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        toAddBase:1, toAddMult:1, toAddMultIncrease:3.1,
        unlockCost:10, visible:false, unlocked:false,
        onComplete:function() {
        },
        onUnlock: function() {
        },
        statMods:[],
        onLevelStats:[]
    },

    /*gatherMana:{
        tier:1,
        expToLevelBase:100, expToLevelMult:1, expToLevelIncrease:1.01,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:5,
        unlockCost:55, visible:true, unlocked:false,
        onComplete:function() {
            data.actions.expelMana.resolve += data.actions.gatherMana.toAdd;
        },
        statMods:[],
        onLevelStats:[]
    },
    research: {
        tier:1,
        expToLevelBase:100, expToLevelMult:1, expToLevelIncrease:1.01,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:5,
        unlockCost:55, visible:true, unlocked:false,
        onComplete:function() {
        },
        statMods:[],
        onLevelStats:[]
    },
    expelMana: {
        tier:1, resolveName:"mana",
        expToLevelBase:100, expToLevelMult:1, expToLevelIncrease:1.01,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:5,
        unlockCost:55, visible:true, unlocked:false,
        onComplete:function() {
        },
        statMods:[],
        onLevelStats:[]
    },
    trainMana: {
        tier:1, resolveName:"mana",
        expToLevelBase:100, expToLevelMult:1, expToLevelIncrease:1.01,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:5,
        unlockCost:55, visible:true, unlocked:false,
        onComplete:function() {
        },
        statMods:[],
        onLevelStats:[]
    },
    controlMana: {
        tier:1, resolveName:"mana",
        expToLevelBase:100, expToLevelMult:1, expToLevelIncrease:1.01,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:5,
        unlockCost:55, visible:true, unlocked:false,
        onComplete:function() {
        },
        statMods:[],
        onLevelStats:[]
    },
    senseMana: {
        tier:1, resolveName:"mana",
        expToLevelBase:100, expToLevelMult:1, expToLevelIncrease:1.01,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:5,
        unlockCost:55, visible:true, unlocked:false,
        onComplete:function() {
        },
        statMods:[],
        onLevelStats:[]
    },
    collectMana: {
        tier:1, resolveName:"mana",
        expToLevelBase:100, expToLevelMult:1, expToLevelIncrease:1.01,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:5,
        unlockCost:55, visible:true, unlocked:false,
        onComplete:function() {
        },
        statMods:[],
        onLevelStats:[]
    },
    prepareToCastBasicSpell: {
        tier:1, resolveName:"mana",
        expToLevelBase:100, expToLevelMult:1, expToLevelIncrease:1.01,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:5,
        unlockCost:55, visible:true, unlocked:false,
        onComplete:function() {
        },
        statMods:[],
        onLevelStats:[]
    },
    castBasicSpell: {
        tier:1, resolveName:"arcane",
        expToLevelBase:100, expToLevelMult:1, expToLevelIncrease:1.01,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:5,
        unlockCost:55, visible:true, unlocked:false,
        onComplete:function() {
        },
        statMods:[],
        onLevelStats:[]
    },
    //socialize
    socialize: {
        tier:1,
        expToLevelBase:100, expToLevelMult:1, expToLevelIncrease:1.01,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:1.02,
        toAddBase:1, toAddMult:1, toAddMultIncrease:1.04,
        unlockCost:55, visible:true, unlocked:false,
        onComplete:function() {
            // data.res.conversations.num += data.actions.socialize.toAdd;
        },
        statMods:[["grace", 1], ["wit", 1], ["charm", 1]],
        onLevelStats:[["charm", .1], ["curiosity", .1]]
    },
    //money
    makeMoney: {
        tier:1,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        toAddBase:1, toAddMult:1, toAddMultIncrease:3.1,
        unlockCost:50, visible:true, unlocked:false,
        onComplete:function() {
            data.actions.spendMoney.resolve += data.actions.makeMoney.toAdd;
        },
        statMods:[["diligence", 1]],
        onLevelStats:[]
    },
    //gold
    spendMoney: {
        tier:0, resolveName:"gold",
        expToLevelBase:5, expToLevelMult:1, expToLevelIncrease:1.2,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:5,
        unlockCost:55, visible:true, unlocked:false,
        onComplete:function() {
        },
        statMods:[],
        onLevelStats:[["ambition", 5]]
    },
    eatBetterFood: {
        tier:2, resolveName:"gold", maxLevel:10,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.3,
        progressMaxBase:1e3, progressMaxMult:1, progressMaxIncrease:8,
        unlockCost:5e3, visible:false, unlocked:false,
        onComplete:function() {
        },
        statMods:[],
        onLevelStats:[["ambition", 5]]
    },
    fillBasicNeeds: { //TODO a later make money step that provides a stat
        tier:2, resolveName:"gold", maxLevel:10,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.3,
        progressMaxBase:1e4, progressMaxMult:1, progressMaxIncrease:8,
        unlockCost:5e4, visible:false, unlocked:false,
        onComplete:function() {
        },
        statMods:[["resourcefulness", .5]],
        onLevelStats:[["ambition", 5]]
    },*/
};
function createBrowseMarket(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 4, 0, 1, 35, 55, x, y,  downstreamVars);
    actionObj.onCompleteCustom = function () {
        data.actions.spendMoney.resolve += actionObj.toAdd;
    }
    actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ToAdd\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}
function createLearnMarket(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 4, 0, 1, 35, 55, x, y,  downstreamVars);
    actionObj.onCompleteCustom = function () {
        data.actions.spendMoney.resolve += actionObj.toAdd;
    }
    actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ToAdd\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}
function createCraftForTheDemand(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 4, 0, 1, 35, 55, x, y,  downstreamVars);
    actionObj.onCompleteCustom = function () {
        data.actions.spendMoney.resolve += actionObj.toAdd;
    }
    actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ToAdd\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}
function createCraftSimpleItems(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 4, 0, 1, 35, 55, x, y,  downstreamVars);
    actionObj.onCompleteCustom = function () {
        data.actions.spendMoney.resolve += actionObj.toAdd;
    }
    actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ToAdd\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}
function createCompareMarket(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 4, 0, 1, 35, 55, x, y,  downstreamVars);
    actionObj.onCompleteCustom = function () {
        data.actions.spendMoney.resolve += actionObj.toAdd;
    }
    actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ToAdd\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}
function createSellFoundItems(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 4, 0, 1, 35, 55, x, y,  downstreamVars);
    actionObj.onCompleteCustom = function () {
        data.actions.spendMoney.resolve += actionObj.toAdd;
    }
    actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ToAdd\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}
function createExploitMarket(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 4, 0, 1, 35, 55, x, y,  downstreamVars);
    actionObj.onCompleteCustom = function () {
        data.actions.spendMoney.resolve += actionObj.toAdd;
    }
    actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ToAdd\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createPickUpStreetFood(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 3, 1, 10, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
    }
    actionObj.storyText = "";
}
function createEatLocalSpecialties(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 3, 1, 10, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
    }
    actionObj.storyText = "";
}
function createEatFastFood(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 3, 1, 10, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
    }
    actionObj.storyText = "";
}
function createEatQualityFood(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 3, 1, 10, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
    }
    actionObj.storyText = "";
}
function createEatNutritionalFood(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 3, 1, 10, 100, 55, x, y, downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
    }
    actionObj.storyText = "";
}

    function createEnjoyUpscaleFood(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 3, 1, 10, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
    }
    actionObj.storyText = "";
}

function createFillBasicNeeds(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.toAdd;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ToAdd\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createImprovePersonalSpace(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.toAdd;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ToAdd\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createImproveNeighborhood(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.toAdd;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ToAdd\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createImprovePond(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.toAdd;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ToAdd\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createBuyQualityClothing(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.toAdd;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ToAdd\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createBuyFashionableClothing(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.toAdd;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ToAdd\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createBuyTransportation(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.toAdd;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ToAdd\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createBuyPractical(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.toAdd;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ToAdd\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createBuyKnowledge(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.toAdd;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ToAdd\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createBuyBooks(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.toAdd;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ToAdd\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createBuyMaps(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.toAdd;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ToAdd\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createBuyMaterials(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.toAdd;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ToAdd\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createBuyItems(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.toAdd;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ToAdd\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createBuyGear(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.toAdd;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ToAdd\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createBuyUtilityMagicItems(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.toAdd;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ToAdd\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createBuyInvestments(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.toAdd;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ToAdd\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createBuyHousing(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.toAdd;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ToAdd\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createPutInSavings(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.toAdd;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ToAdd\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createGenerateInterest(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.toAdd;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ToAdd\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createPullInterest(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.toAdd;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ToAdd\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createBasicLabor(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 3, 1, 10, 100, 55, x, y,  downstreamVars);
    actionObj.onCompleteCustom = function () {
    }
    actionObj.storyText = "info"
}

function createMaid(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 3, 1, 10, 100, 55, x, y,  downstreamVars);
    actionObj.onCompleteCustom = function () {
    }
    actionObj.storyText = "info"
}

function createStableHand(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 3, 1, 10, 100, 55, x, y,  downstreamVars);
    actionObj.onCompleteCustom = function () {
    }
    actionObj.storyText = "info"
}

function createFieldWork(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 3, 1, 10, 100, 55, x, y,  downstreamVars);
    actionObj.onCompleteCustom = function () {
    }
    actionObj.storyText = "info"
}

function createMining(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 3, 1, 10, 100, 55, x, y,  downstreamVars);
    actionObj.onCompleteCustom = function () {
    }
    actionObj.storyText = "info"
}

function createFish(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 3, 1, 10, 100, 55, x, y,  downstreamVars);
    actionObj.onCompleteCustom = function () {
    }
    actionObj.storyText = "info"
}

function createSkilledLabor(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 3, 1, 10, 100, 55, x, y,  downstreamVars);
    actionObj.onCompleteCustom = function () {
    }
    actionObj.storyText = "info"
}

function createScribe(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 3, 1, 10, 100, 55, x, y,  downstreamVars);
    actionObj.onCompleteCustom = function () {
    }
    actionObj.storyText = "info"
}

function createBaker(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 3, 1, 10, 100, 55, x, y,  downstreamVars);
    actionObj.onCompleteCustom = function () {
    }
    actionObj.storyText = "info"
}

function createRunAStall(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 3, 1, 10, 100, 55, x, y,  downstreamVars);
    actionObj.onCompleteCustom = function () {
    }
    actionObj.storyText = "info"
}

function createTailor(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 3, 1, 10, 100, 55, x, y,  downstreamVars);
    actionObj.onCompleteCustom = function () {
    }
    actionObj.storyText = "info"
}

function createBlacksmith(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 3, 1, 10, 100, 55, x, y,  downstreamVars);
    actionObj.onCompleteCustom = function () {
    }
    actionObj.storyText = "info"
}

function createAdvancedLabor(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 3, 1, 10, 100, 55, x, y,  downstreamVars);
    actionObj.onCompleteCustom = function () {
    }
    actionObj.storyText = "info"
}

function createMusician(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 3, 1, 10, 100, 55, x, y,  downstreamVars);
    actionObj.onCompleteCustom = function () {
    }
    actionObj.storyText = "info"
}

function createGuard(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 3, 1, 10, 100, 55, x, y,  downstreamVars);
    actionObj.onCompleteCustom = function () {
    }
    actionObj.storyText = "info"
}