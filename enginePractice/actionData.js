


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
        expToLevelBase:2, expToLevelMult:1, expToLevelIncrease:1.01,
        actionPowerBase:100, actionPowerMult:1, actionPowerMultIncrease:1.03,
        expertiseBase:.1,
        unlockCost:0, visible:true, unlocked:true, isGenerator:true, generatorSpeed:10,
        onCompleteCustom:function() {
            data.actions.overclock.momentum += data.actions.overclock.actionPower;
        },
        expStats:[["ambition", 1], ["energy", 1], ["focus", 1], ["neuralAgility", 1]],
        onLevelStats:[["processing", .1], ["diligence", .1]],
        expertiseStats:[["drive", 10]]
    },
    reflect: {
        tier:1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:5,
        expToLevelBase:1.25, expToLevelMult:1, expToLevelIncrease:2,
        expertiseBase:.5, maxLevel:2,
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
        expToLevelBase:10000, expToLevelMult:1, expToLevelIncrease:1.2,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.02,
        expertiseBase:.1,
        unlockCost:100, visible:true, unlocked:false, isGenerator:true, generatorSpeed:10,
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
        tier:2, momentumName:"gold",
        progressMaxBase:10, progressMaxMult:1, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.1,
        expertiseBase:.8,
        unlockCost:100, visible:true, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
            unveilAction("travelToOutpost");
        },
        expStats:[],
        onLevelStats:[["energy", 3], ["confidence", 2]],
        expertiseStats:[["haggling", 1]],
    },
    travelOnRoad: {
        tier:1,
        progressMaxBase:100, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        expertiseBase:.4, maxLevel:20,
        unlockCost:1000, visible:true, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
            data.actions.travelToOutpost.visible = true;
            data.actions.clearTheTrail.visible = true;
            data.actions.reflect.maxLevel+=2;
        },
        expStats:[["pathfinding", 1], ["endurance", 1]],
        onLevelStats:[["focus", 1]],
        expertiseStats:[["pathfinding", 4]]
    },
    clearTheTrail: {
        tier:2,
        progressMaxBase:1000, progressMaxMult:1, progressMaxIncrease:2,
        expToLevelBase:20, expToLevelMult:1, expToLevelIncrease:1.1,
        expertiseBase:.1, maxLevel:10,
        unlockCost:10000, visible:true, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
        },
        expStats:[["diligence", 1]],
        onLevelStats:[["pathfinding", 2]],
        expertiseStats:[]
    },
    paveTheTrail: {
        tier:2,
        progressMaxBase:100000, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:20, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.1, maxLevel:10,
        unlockCost:1000000, visible:true, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
        },
        expStats:[["diligence", 1]],
        onLevelStats:[["pathfinding", 2]],
        expertiseStats:[]
    },
    travelToOutpost: {
        tier:1,
        progressMaxBase:100, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:20, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.4, maxLevel:20,
        unlockCost:1000, visible:true, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
            data.actions.reportForDuty.visible = true;
            data.actions.fillBasicNeeds.visible = true;
            data.actions.reflect.maxLevel+=2;
        },
        expStats:[["pathfinding", 1], ["endurance", 1]],
        onLevelStats:[["focus", 2]],
        expertiseStats:[["pathfinding", 2]]
    },
    fillBasicNeeds: {
        tier:2, momentumName: "gold",
        progressMaxBase:100000, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:20, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.6,
        unlockCost:500, visible:true, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[["energy", 2], ["confidence", 1]],
        expertiseStats:[["haggling", 1]]
    },
    reportForDuty: {
        tier:1,
        progressMaxBase:200, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:20, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.2,
        unlockCost:2000, visible:true, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        expStats:[["diligence", 1]],
        onLevelStats:[["charm", 1], ["recognition", 1]],
        expertiseStats:[["villagersKnown", 1]]
    },
    meetVillageLeaderScott: {
        tier:1,
        progressMaxBase:400, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.1, maxLevel:20,
        unlockCost:4000, visible:true, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[["villagersKnown", 1]],
        expertiseStats:[]
    },
    helpScottWithChores: {
        tier:2,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.1, maxLevel:20,
        unlockCost:50, visible:true, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[["villagersKnown", 1]],
        expertiseStats:[]
    },
    buyClothing: {
        tier:1, momentumName: "gold",
        progressMaxBase:100, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.6, maxLevel:20,
        unlockCost:500, visible:true, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[["energy", 2], ["confidence", 1]],
        expertiseStats:[["haggling", 1]]
    },
    reportForTraining: {
        tier:3,
        progressMaxBase:8, progressMaxMult:1, progressMaxIncrease:50,
        expToLevelBase:12.5, expToLevelMult:1, expToLevelIncrease:2,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.1, maxLevel:6,
        unlockCost:5, visible:true, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[["endurance", 10], ["weaponsExpertise", 10]],
        expertiseStats:[]
    },



    socialize: {
        tier:1,
        progressMaxBase:10, progressMaxMult:1, progressMaxIncrease:1,
        expToLevelBase:10000, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.02,
        expertiseBase:.1,
        unlockCost:1e7, visible:true, unlocked:false, //visible:false isGenerator:true, generatorSpeed:10,
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
        tier:2, momentumName:"conversations",
        progressMaxBase:10, progressMaxMult:1, progressMaxIncrease:1.1,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:2,
        unlockCost:100, visible:true, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
            unveilAction("travelToOutpost");
        },
        expStats:[],
        onLevelStats:[["haggling", 1]],
        expertiseStats:[],
    },


    reportForLabor: {
        tier:2,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.1, maxLevel:20,
        unlockCost:50, visible:true, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[],
        expertiseStats:[]
    },
};