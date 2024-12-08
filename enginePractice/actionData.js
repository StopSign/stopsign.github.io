


// function createAction(methodName, type, tier, progressMax, expToLevel, unlockCost, x, y, downstreamVars) {
//     let actionVar = methodName.charAt(6).toLowerCase() + methodName.slice(7); //createBasicLabor -> basicLabor
//     let title = methodName.replace(/^create/, '').replace(/([A-Z])/g, ' $1').trim(); //createBasicLabor -> Basic Labor
//
//     //design philosophy requirement: actionPowerMultIncrease >= progressMaxIncrease, to prevent levels ever being a bad thing
//     //Exception: spend money lol
//     let progressMaxIncrease = 3.163; //sqrt(10)
//     let expToLevelIncrease = 1.1;
//     let actionPowerMultIncrease = 1;
//     if(type === 1) {
//         progressMaxIncrease = 1.02;
//         expToLevelIncrease = 1.01;
//         actionPowerMultIncrease = 1.04;
//     }
//     if(type === 2) {
//         progressMaxIncrease = 1.25;
//         actionPowerMultIncrease = 1.5;
//     }
//     if(type === 3) {
//         progressMaxIncrease = 5;
//         expToLevelIncrease = 1.01;
//     }
//     if(type === 4) {
//         progressMaxIncrease = 3;
//         actionPowerMultIncrease = 3.1;
//     }
//     if(type === 5) {
//         progressMaxIncrease = 3;
//         actionPowerMultIncrease = 3.1;
//     }
//
//     let actionObj = createAndLinkNewAction(actionVar, expToLevelIncrease, actionPowerMultIncrease, progressMaxIncrease, progressMax, expToLevel, unlockCost, title, x, y, downstreamVars, tier);
//     actionObj.tier = tier;
//
//     return actionObj;
// }

//design philosophy requirement: actionPowerMultIncrease >= progressMaxIncrease, to prevent levels ever being a bad thing

function create(actionVar, downstreamVars, x, y) {
    let actionDataObj = actionData[actionVar];
    if(!actionDataObj) {
        console.log("Could not find in actionData, " + actionVar);
        return;
    }
    x*= 350;
    y*= -350;
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

//Has a custom onComplete if it has a actionPower
//Requires that upstream actions are above downstream, so updating works consistently
let actionData = {
    motivate:{
        tier:0,
        expToLevelBase:2, expToLevelMult:1, expToLevelIncrease:1.002,
        progressMaxBase:10, progressMaxMult:1, progressMaxIncrease:1,
        actionPowerBase:10, actionPowerMult:1, actionPowerMultIncrease:1.02,
        unlockCost:0, visible:true, unlocked:true, isGenerator:true,
        onComplete:function() {
            data.actions.motivate.resolve += data.actions.motivate.actionPower;
        },
        statMods:[["drive", 1], ["discipline", 1], ["ambition", 1], ["energy", 1]],
        onLevelStats:[["resilience", 1], ["diligence", 1]],
        expertiseStats:[["drive", .1]]
    },
    //money
    makeMoney: {
        tier:1,
        expToLevelBase:25, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:10, progressMaxMult:1, progressMaxIncrease:1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.02,
        unlockCost:10, visible:true, unlocked:false, isGenerator:true,
        onComplete: function() {
            //Give
            data.actions.makeMoney.calcActionPower();
            let amount = data.actions.makeMoney.actionPower;
            let takenFromResolve = Math.min(data.actions.makeMoney.resolve, amount);

            addResolveTo(data.actions.spendMoney, takenFromResolve);
            data.actions.makeMoney.resolve -= takenFromResolve;

            data.actions.makeMoney.expToAddBase = amount;
            data.actions.makeMoney.expToAdd = data.actions.makeMoney.expToAddBase * data.actions.makeMoney.expToAddMult;
        },
        onUnlock: function() {
            unveilAction("spendMoney");
        },
        statMods:[["diligence", 1]],
        onLevelStats:[["ambition", 2]],
        onCompleteText: {
                english:"+<b><span id=\"makeMoneyActionPower\">1</span></b> Gold<br>"
            },
        actionPowerFunction: function(origMult) {
            return Math.sqrt(data.actions.makeMoney.resolve* origMult);
        }
    },
    spendMoney: {
        tier:0, resolveName:"gold",
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:2,
        progressMaxBase:10, progressMaxMult:1, progressMaxIncrease:1.1,
        //actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        unlockCost:20, visible:false, unlocked:false,
        onComplete:function() {
        },
        onUnlock: function() {
            unveilAction("travelToOutpost");
        },
        statMods:[],
        onLevelStats:[["energy", 5], ["confidence", 2]]
    },
    //Reflect Chain
    reflect: {
        tier:1,
        expToLevelBase:2, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        //actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        efficiencyInitial:50,
        unlockCost:100, visible:false, unlocked:false,
        onComplete:function() {
        },
        onUnlock: function() {
            if(data.actions.establishRituals) {
                data.actions.establishRituals.visible = true;
            }
        },
        statMods:[],
        onLevelStats:[["drive", 5]]
    },
    rememberTheFallen: {
        tier:0,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
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
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
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
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
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
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
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
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
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
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
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
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
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
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        unlockCost:50, visible:false, unlocked:false,
        onComplete:function() {
        },
        statMods:[],
        onLevelStats:[]
    },


    //Village
    travelToOutpost: {
        tier:0,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        unlockCost:50, visible:false, unlocked:false,
        onComplete:function() {
        },
        onUnlock: function() {
            data.actions.reportForDuty.visible = true;
        },
        statMods:[],
        onLevelStats:[]
    },
    clearTheTrail: {
        tier:0,
        expToLevelBase:20, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        unlockCost:10, visible:true, unlocked:true,
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
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        unlockCost:10, visible:true, unlocked:false,
        onComplete:function() {
        },
        onUnlock: function() {
        },
        statMods:[],
        onLevelStats:[]
    },
    reportForDuty: {
        tier:0,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        unlockCost:50, visible:true, unlocked:false,
        onComplete:function() {
        },
        statMods:[],
        onLevelStats:[]
    },
    reportForTraining: {
        tier:0,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        unlockCost:50, visible:true, unlocked:false,
        onComplete:function() {
        },
        statMods:[],
        onLevelStats:[]
    },
    reportForLabor: {
        tier:0,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        unlockCost:50, visible:true, unlocked:false,
        onComplete:function() {
        },
        statMods:[],
        onLevelStats:[]
    },
    meetVillageLeaderScott: {
        tier:0,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        unlockCost:50, visible:true, unlocked:false,
        onComplete:function() {
        },
        statMods:[],
        onLevelStats:[]
    },
};
function createBrowseMarket(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 4, 0, 1, 35, 55, x, y,  downstreamVars);
    actionObj.onCompleteCustom = function () {
        data.actions.spendMoney.resolve += actionObj.actionPower;
    }
    actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ActionPower\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}
function createLearnMarket(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 4, 0, 1, 35, 55, x, y,  downstreamVars);
    actionObj.onCompleteCustom = function () {
        data.actions.spendMoney.resolve += actionObj.actionPower;
    }
    actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ActionPower\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}
function createCraftForTheDemand(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 4, 0, 1, 35, 55, x, y,  downstreamVars);
    actionObj.onCompleteCustom = function () {
        data.actions.spendMoney.resolve += actionObj.actionPower;
    }
    actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ActionPower\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}
function createCraftSimpleItems(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 4, 0, 1, 35, 55, x, y,  downstreamVars);
    actionObj.onCompleteCustom = function () {
        data.actions.spendMoney.resolve += actionObj.actionPower;
    }
    actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ActionPower\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}
function createCompareMarket(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 4, 0, 1, 35, 55, x, y,  downstreamVars);
    actionObj.onCompleteCustom = function () {
        data.actions.spendMoney.resolve += actionObj.actionPower;
    }
    actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ActionPower\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}
function createSellFoundItems(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 4, 0, 1, 35, 55, x, y,  downstreamVars);
    actionObj.onCompleteCustom = function () {
        data.actions.spendMoney.resolve += actionObj.actionPower;
    }
    actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ActionPower\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}
function createExploitMarket(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 4, 0, 1, 35, 55, x, y,  downstreamVars);
    actionObj.onCompleteCustom = function () {
        data.actions.spendMoney.resolve += actionObj.actionPower;
    }
    actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ActionPower\">1</span></b> Gold<br>";
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
        // data.res.gold.num += actionObj.actionPower;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ActionPower\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createImprovePersonalSpace(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.actionPower;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ActionPower\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createImproveNeighborhood(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.actionPower;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ActionPower\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createImprovePond(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.actionPower;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ActionPower\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createBuyQualityClothing(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.actionPower;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ActionPower\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createBuyFashionableClothing(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.actionPower;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ActionPower\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createBuyTransportation(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.actionPower;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ActionPower\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createBuyPractical(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.actionPower;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ActionPower\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createBuyKnowledge(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.actionPower;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ActionPower\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createBuyBooks(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.actionPower;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ActionPower\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createBuyMaps(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.actionPower;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ActionPower\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createBuyMaterials(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.actionPower;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ActionPower\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createBuyItems(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.actionPower;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ActionPower\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createBuyGear(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.actionPower;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ActionPower\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createBuyUtilityMagicItems(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.actionPower;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ActionPower\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createBuyInvestments(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.actionPower;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ActionPower\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createBuyHousing(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.actionPower;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ActionPower\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createPutInSavings(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.actionPower;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ActionPower\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createGenerateInterest(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.actionPower;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ActionPower\">1</span></b> Gold<br>";
    actionObj.storyText = "mm info"
}

function createPullInterest(x, y, downstreamVars) {
    let result = arguments.callee.name;
    let actionVar = result.charAt(6).toLowerCase() + result.slice(7);
    let actionObj = createAction(result, 2, 1, 1, 100, 55, x, y,  downstreamVars);
    actionObj.resolveName = "gold";
    actionObj.onCompleteCustom = function () {
        // data.res.gold.num += actionObj.actionPower;
    }
    // actionObj.onCompleteText = "+<b><span id=\""+actionVar+"ActionPower\">1</span></b> Gold<br>";
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