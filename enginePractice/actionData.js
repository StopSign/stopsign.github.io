


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
    actionObj.expStats.forEach(function (expStat) { //add the action to the stat, to update exp reductions
        data.statNames.forEach(function (statName) {
            let stat = data.stats[statName];
            if(expStat[0] === stat.statVar) {
                stat.linkedActionExpStats.push(actionVar);
            }
        });
    });
    actionObj.expertiseStats.forEach(function (expertiseStat) { //add the action to the stat, to update exp reductions
        data.statNames.forEach(function (statName) {
            let stat = data.stats[statName];
            if(expertiseStat[0] === stat.statVar) {
                stat.linkedActionExpertiseStats.push(actionVar);
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
        actionPowerBase:100, actionPowerMult:1, actionPowerMultIncrease:1.02,
        expertiseBase:.1,
        unlockCost:0, visible:true, unlocked:true, isGenerator:true, generatorSpeed:10,
        onCompleteCustom:function() {
            data.actions.motivate.resolve += data.actions.motivate.actionPower;
        },
        expStats:[["discipline", 1], ["ambition", 1], ["energy", 1]],
        onLevelStats:[["resilience", 1], ["diligence", 1]],
        expertiseStats:[["drive", 10]]
    },
    //money
    makeMoney: {
        tier:1,
        expToLevelBase:25, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:10, progressMaxMult:1, progressMaxIncrease:1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.02,
        unlockCost:10, visible:false, unlocked:false, isGenerator:true, generatorSpeed:10,
        onCompleteCustom: function() {
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
        expStats:[["diligence", 1]],
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
        onCompleteCustom:function() {
        },
        onUnlock: function() {
            unveilAction("travelToOutpost");
        },
        expStats:[],
        onLevelStats:[["energy", 5], ["confidence", 2]]
    },
    //Reflect Chain
    reflect: {
        tier:1,
        expToLevelBase:2, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        //actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.5,
        unlockCost:5, visible:true, unlocked:false, maxLevel:4,
        onCompleteCustom:function() {
        },
        onLevelCustom: function() {
            if(data.actions.reflect.level >= 2) {
                data.actions.makeMoney.visible = true;
            }
        },
        onUnlock: function() {
            //data.actions.establishRituals.visible = true;
        },
        expStats:[],
        onLevelStats:[["drive", 5]]
    },/*
    rememberTheFallen: {
        tier:0,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        unlockCost:50, visible:false, unlocked:false,
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[]
    },
    honorPastSacrifices: {
        tier:0,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        unlockCost:50, visible:false, unlocked:false,
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[]
    },
    payTribute: {
        tier:0,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        unlockCost:50, visible:false, unlocked:false,
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[]
    },
    findInnerPeace: {
        tier:0,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        unlockCost:50, visible:false, unlocked:false,
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[]
    },
    establishRituals: {
        tier:0,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:2,
        progressMaxBase:10, progressMaxMult:1, progressMaxIncrease:2,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        unlockCost:100, visible:false, unlocked:false,
        onCompleteCustom:function() {
        },
        onUnlock: function() {
            data.actions.travelToOutpost.visible = true;
        },
        expStats:[["discipline", 10]],
        onLevelStats:[]
    },
    peruseLibrary: {
        tier:0,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        unlockCost:50, visible:false, unlocked:false,
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[]
    },
    researchHistory: {
        tier:0,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        unlockCost:50, visible:false, unlocked:false,
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[]
    },
    reaffirmYourVows: {
        tier:0,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        unlockCost:50, visible:false, unlocked:false,
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[]
    },
*/

    //Village
    travelToOutpost: {
        tier:0,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        unlockCost:50, visible:false, unlocked:false,
        onCompleteCustom:function() {
        },
        onUnlock: function() {
            data.actions.reportForDuty.visible = true;
        },
        expStats:[],
        onLevelStats:[]
    },
    clearTheTrail: {
        tier:0,
        expToLevelBase:20, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        unlockCost:10, visible:true, unlocked:true,
        onCompleteCustom:function() {
        },
        onUnlock: function() {
        },
        expStats:[],
        onLevelStats:[]
    },
    paveTheTrail: {
        tier:0,
        expToLevelBase:20, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        unlockCost:10, visible:true, unlocked:false,
        onCompleteCustom:function() {
        },
        onUnlock: function() {
        },
        expStats:[],
        onLevelStats:[]
    },
    reportForDuty: {
        tier:0,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        unlockCost:50, visible:true, unlocked:false,
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[]
    },
    reportForTraining: {
        tier:0,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        unlockCost:50, visible:true, unlocked:false,
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[]
    },
    reportForLabor: {
        tier:0,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        unlockCost:50, visible:true, unlocked:false,
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[]
    },
    meetVillageLeaderScott: {
        tier:0,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        unlockCost:50, visible:true, unlocked:false,
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[]
    },
};