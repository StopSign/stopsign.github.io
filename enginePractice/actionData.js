


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
    overclock:{
        tier:0,
        progressMaxBase:10, progressMaxMult:1, progressMaxIncrease:1,
        expToLevelBase:2, expToLevelMult:1, expToLevelIncrease:1.002,
        actionPowerBase:100, actionPowerMult:1, actionPowerMultIncrease:1.02,
        expertiseBase:.1,
        unlockCost:0, visible:true, unlocked:true, isGenerator:true, generatorSpeed:10,
        onCompleteCustom:function() {
            data.actions.overclock.momentum += data.actions.overclock.actionPower;
        },
        expStats:[["discipline", 1], ["ambition", 1], ["energy", 1]],
        onLevelStats:[["resilience", 1], ["diligence", 1]],
        expertiseStats:[["drive", 10]]
    },
    reflect: {
        tier:1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:4, expToLevelMult:1, expToLevelIncrease:1.1,
        expertiseBase:.5, maxLevel:4,
        unlockCost:10, visible:true, unlocked:false,
        onCompleteCustom:function() {
        },
        onLevelCustom: function() {
            if(data.actions.reflect.level >= 2) {
                data.actions.makeMoney.visible = true;
                data.actions.travelOnRoad.visible = true;
            }
        },
        onUnlock: function() {
        },
        expStats:[],
        onLevelStats:[["drive", 5]],
        expertiseStats:[]
    },
    //money
    makeMoney: {
        tier:1,
        progressMaxBase:10, progressMaxMult:1, progressMaxIncrease:1,
        expToLevelBase:10000, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.02,
        expertiseBase:.1,
        unlockCost:100, visible:false, unlocked:false, isGenerator:true, generatorSpeed:10,
        onCompleteCustom: function() {
            //Give
            data.actions.makeMoney.calcActionPower();
            let amount = data.actions.makeMoney.actionPower;
            let takenFromMomentum = Math.min(data.actions.makeMoney.momentum, amount);

            addMomentumTo(data.actions.spendMoney, takenFromMomentum);
            data.actions.makeMoney.momentum -= takenFromMomentum;

            data.actions.makeMoney.expToAddBase = amount;
            data.actions.makeMoney.expToAdd = data.actions.makeMoney.expToAddBase * data.actions.makeMoney.expToAddMult;
        },
        onUnlock: function() {
            unveilAction("spendMoney");
        },
        expStats:[["diligence", 1]],
        onLevelStats:[["ambition", 2]],
        expertiseStats:[],
        onCompleteText: {
                english:"+<b><span id=\"makeMoneyActionPower\">1</span></b> Gold<br>"
            },
        actionPowerFunction: function(origMult) {
            return Math.sqrt(data.actions.makeMoney.momentum * origMult);
        }
    },
    spendMoney: {
        tier:0, momentumName:"gold",
        progressMaxBase:10, progressMaxMult:1, progressMaxIncrease:1.1,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:2,
        unlockCost:100, visible:false, unlocked:false,
        onCompleteCustom:function() {
        },
        onUnlock: function() {
            unveilAction("travelToOutpost");
        },
        expStats:[],
        onLevelStats:[["energy", 5], ["confidence", 2]]
    },
    travelOnRoad: {
        tier:1,
        progressMaxBase:10, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        expertiseBase:.4, maxLevel:20,
        unlockCost:100, visible:false, unlocked:false,
        onCompleteCustom:function() {
        },
        onUnlock: function() {
            data.actions.travelToOutpost.visible = true;
            data.actions.clearTheTrail.visible = true;
        },
        expStats:[],
        onLevelStats:[],
        expertiseStats:["pathfinding", 4]
    },
    clearTheTrail: {
        tier:2,
        progressMaxBase:100, progressMaxMult:1, progressMaxIncrease:1.1,
        expToLevelBase:20, expToLevelMult:1, expToLevelIncrease:1,
        expertiseBase:.1, maxLevel:20,
        unlockCost:100, visible:false, unlocked:false,
        onCompleteCustom:function() {
        },
        onUnlock: function() {
        },
        expStats:[],
        onLevelStats:["pathfinding", 1],
        expertiseStats:[]
    },
    paveTheTrail: {
        tier:0,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:20, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.1, maxLevel:20,
        unlockCost:10, visible:false, unlocked:false,
        onCompleteCustom:function() {
        },
        onUnlock: function() {
        },
        expStats:[],
        onLevelStats:[],
        expertiseStats:[]
    },
    travelToOutpost: {
        tier:1,
        progressMaxBase:10, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.4, maxLevel:20,
        unlockCost:100, visible:false, unlocked:false,
        onCompleteCustom:function() {
        },
        onUnlock: function() {
            data.actions.reportForDuty.visible = true;
            data.actions.fillBasicNeeds.visible = true;
        },
        expStats:[],
        onLevelStats:[],
        expertiseStats:["pathfinding", 2]
    },
    fillBasicNeeds: {
        tier:1, momentumName: "gold",
        progressMaxBase:100, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.6, maxLevel:20,
        unlockCost:500, visible:false, unlocked:false,
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[["energy", 2], ["confidence", 1]],
        expertiseStats:[["haggling", 1]]
    },
    reportForDuty: {
        tier:0,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.1, maxLevel:20,
        unlockCost:50, visible:false, unlocked:false,
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[],
        expertiseStats:[]
    },
    meetVillageLeaderScott: {
        tier:0,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.1, maxLevel:20,
        unlockCost:50, visible:false, unlocked:false,
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[],
        expertiseStats:[]
    },
    buyClothing: {
        tier:1, momentumName: "gold",
        progressMaxBase:100, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.6, maxLevel:20,
        unlockCost:500, visible:false, unlocked:false,
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[["energy", 2], ["confidence", 1]],
        expertiseStats:[["haggling", 1]]
    },
    helpScottWithChores: {
        tier:0,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.1, maxLevel:20,
        unlockCost:50, visible:false, unlocked:false,
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[],
        expertiseStats:[]
    },




    socialize: {
        tier:1,
        progressMaxBase:10, progressMaxMult:1, progressMaxIncrease:1,
        expToLevelBase:10000, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.02,
        expertiseBase:.1,
        unlockCost:100, visible:false, unlocked:false, isGenerator:true, generatorSpeed:10,
        onCompleteCustom: function() {
            //Give
            data.actions.socialize.calcActionPower();
            let amount = data.actions.socialize.actionPower;
            let takenFromMomentum = Math.min(data.actions.socialize.momentum, amount);

            addMomentumTo(data.actions.localOutreach, takenFromMomentum);
            data.actions.socialize.momentum -= takenFromMomentum;

            data.actions.socialize.expToAddBase = amount;
            data.actions.socialize.expToAdd = data.actions.socialize.expToAddBase * data.actions.socialize.expToAddMult;
        },
        onUnlock: function() {
            unveilAction("localOutreach");
        },
        expStats:[["diligence", 1]],
        onLevelStats:[["ambition", 2]],
        expertiseStats:[],
        onCompleteText: {
            english:"+<b><span id=\"makeMoneyActionPower\">1</span></b> Gold<br>"
        },
        actionPowerFunction: function(origMult) {
            return Math.sqrt(data.actions.makeMoney.momentum * origMult);
        }
    },
    localOutreach: {
        tier:0, momentumName:"gold",
        progressMaxBase:10, progressMaxMult:1, progressMaxIncrease:1.1,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:2,
        unlockCost:100, visible:false, unlocked:false,
        onCompleteCustom:function() {
        },
        onUnlock: function() {
            unveilAction("travelToOutpost");
        },
        expStats:[],
        onLevelStats:[["energy", 5], ["confidence", 2]]
    },



    reportForTraining: {
        tier:0,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.1, maxLevel:20,
        unlockCost:50, visible:false, unlocked:false,
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[],
        expertiseStats:[]
    },
    reportForLabor: {
        tier:0,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.1, maxLevel:20,
        unlockCost:50, visible:false, unlocked:false,
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[],
        expertiseStats:[]
    },
};