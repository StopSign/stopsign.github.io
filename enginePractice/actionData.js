


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
        expToLevelBase:2, expToLevelMult:1, expToLevelIncrease:1.02,
        actionPowerBase:100, actionPowerMult:1, actionPowerMultIncrease:1.03,
        expertiseBase:.1,
        unlockCost:0, visible:true, unlocked:true, isGenerator:true, generatorSpeed:10,
        onCompleteCustom:function() {
            data.actions.overclock.momentum += data.actions.overclock.actionPower;
        },
        onLevelStats:[["processing", .1], ["diligence", .1]],
        expStats:[["ambition", 1], ["energy", 1], ["focus", 1]],
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
        onLevelStats:[["drive", 5]],
        expStats:[],
        expertiseStats:[]
    },
    //money
    makeMoney: {
        tier:1,
        progressMaxBase:10, progressMaxMult:1, progressMaxIncrease:1,
        expToLevelBase:100, expToLevelMult:1, expToLevelIncrease:1.3,
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
        onLevelStats:[["ambition", 2]],
        expStats:[["diligence", 1]],
        expertiseStats:[["workEthic", 1]],
        onCompleteText: {
                english:"+<b><span id=\"makeMoneyActionPower\">1</span></b> Gold<br>"
            },
        actionPowerFunction: function(origMult) {
            return Math.sqrt(data.actions.makeMoney.momentum * origMult);
        }
    },
    spendMoney: {
        tier:1, momentumName:"gold",
        progressMaxBase:2.5, progressMaxMult:1, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.1,
        expertiseBase:.8,
        unlockCost:12.5, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
            unveilAction("travelToOutpost");
            data.actions.reflect.maxLevel+=1;
        },
        onLevelStats:[["energy", 3], ["confidence", 2]],
        expStats:[],
        expertiseStats:[["haggling", 1]],
    },
    travelOnRoad: {
        tier:1,
        progressMaxBase:40, progressMaxMult:1, progressMaxIncrease:1.1,
        expToLevelBase:20, expToLevelMult:1, expToLevelIncrease:1.1,
        expertiseBase:.4, maxLevel:20,
        unlockCost:40, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
            data.actions.travelToOutpost.visible = true;
            data.actions.clearTheTrail.visible = true;
            data.actions.reflect.maxLevel+=2;
        },
        onLevelStats:[["focus", 1]],
        expStats:[["pathfinding", 1], ["endurance", 1]],
        expertiseStats:[["pathfinding", 4]]
    },
    clearTheTrail: {
        tier:2,
        progressMaxBase:1000, progressMaxMult:1, progressMaxIncrease:1.5,
        expToLevelBase:20, expToLevelMult:1, expToLevelIncrease:1.1,
        expertiseBase:.1, maxLevel:10,
        unlockCost:10000, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
        },
        onLevelStats:[["pathfinding", 2]],
        expStats:[["diligence", 1]],
        expertiseStats:[]
    },
    paveTheTrail: {
        tier:2,
        progressMaxBase:10000, progressMaxMult:1, progressMaxIncrease:2,
        expToLevelBase:20, expToLevelMult:1, expToLevelIncrease:1.1,
        expertiseBase:.1, maxLevel:10,
        unlockCost:100000, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
        },
        onLevelStats:[["pathfinding", 2]],
        expStats:[["diligence", 1]],
        expertiseStats:[]
    },
    travelToOutpost: {
        tier:1,
        progressMaxBase:100, progressMaxMult:1, progressMaxIncrease:1.1,
        expToLevelBase:20, expToLevelMult:1, expToLevelIncrease:1.1,
        expertiseBase:.4, maxLevel:20,
        unlockCost:1000, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
            data.actions.reportForDuty.visible = true;
            data.actions.reflect.maxLevel+=2;
        },
        onLevelStats:[["focus", 2]],
        expStats:[["pathfinding", 1], ["endurance", 1]],
        expertiseStats:[["pathfinding", 2]]
    },
    reportForDuty: {
        tier:2,
        progressMaxBase:200, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:20, expToLevelMult:1, expToLevelIncrease:1.1,
        expertiseBase:.2,
        unlockCost:5000, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onLevelStats:[["diligence", 2], ["recognition", 1]],
        expStats:[["charm", 1]],
        expertiseStats:[["villagersKnown", 1]]
    },
    meetVillageLeaderScott: {
        tier:2,
        progressMaxBase:500, progressMaxMult:1, progressMaxIncrease:2,
        expToLevelBase:20, expToLevelMult:1, expToLevelIncrease:1.1,
        expertiseBase:.3, maxLevel:5,
        unlockCost:100000, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onLevelCustom: function() {
            data.actions.helpScottWithChores.maxLevel++
        },
        expStats:[],
        onLevelStats:[["villagersKnown", 1]],
        expertiseStats:[]
    },
    helpScottWithChores: {
        tier:3,
        progressMaxBase:500, progressMaxMult:1, progressMaxIncrease:2,
        expToLevelBase:20, expToLevelMult:1, expToLevelIncrease:1.1,
        expertiseBase:.3, maxLevel:1,
        unlockCost:1000000, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onLevelCustom: function() {
            if(data.actions.helpScottWithChores.level >= 1) {
                data.actions.fillBasicNeeds.visible = true;
            }
            if(data.actions.helpScottWithChores.level >= 2) {
                data.actions.buyClothing.visible = true;
            }
            if(data.actions.helpScottWithChores.level >= 3) {
                data.actions.socialize.visible = true;
            }
            if(data.actions.helpScottWithChores.level >= 4) {
                data.actions.eatBetterFood.visible = true;
            }

            if(data.actions.helpScottWithChores.level >= 20) {
                data.actions.reportForTraining.visible = true;
            }
            if(data.actions.helpScottWithChores.level >= 20) {
                data.actions.talkToInstructorJohn.visible = true;
            }
        },
        expStats:[],
        onLevelStats:[["villagersKnown", 1]],
        expertiseStats:[]
    },
    fillBasicNeeds: {
        tier:2, momentumName: "gold",
        progressMaxBase:100000, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:20, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.6,
        unlockCost:500, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onLevelStats:[["energy", 2], ["confidence", 1]],
        expStats:[],
        expertiseStats:[["haggling", 1]]
    },



    socialize: {
        tier:2,
        progressMaxBase:100000, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:20, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.02,
        expertiseBase:.1,
        unlockCost:1e7, visible:false, unlocked:false, //visible:false isGenerator:true, generatorSpeed:10,
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
            return Math.log2(data.actions.socialize.momentum) * origMult;
        }
    },
    localOutreach: {
        tier:2, momentumName:"conversations",
        progressMaxBase:100000, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:20, expToLevelMult:1, expToLevelIncrease:1.1,
        unlockCost:100, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
            unveilAction("chatWithTownsfolk");
        },
        expStats:[],
        onLevelStats:[["haggling", 1]],
        expertiseStats:[],
    },
    chatWithTownsfolk: {
        tier:3, momentumName:"conversations",
        progressMaxBase:100000, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:20, expToLevelMult:1, expToLevelIncrease:1.1,
        unlockCost:100, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
        },
        expStats:[],
        onLevelStats:[["haggling", 1]],
        expertiseStats:[],
    },

    reportForTraining: {
        tier:3,
        progressMaxBase:8, progressMaxMult:1, progressMaxIncrease:50,
        expToLevelBase:12.5, expToLevelMult:1, expToLevelIncrease:2,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.1, maxLevel:6,
        unlockCost:5, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[["endurance", 10], ["weaponsExpertise", 10]],
        expertiseStats:[]
    },

    takeLessonsFromJohn: {
        tier:3,
        progressMaxBase:8, progressMaxMult:1, progressMaxIncrease:50,
        expToLevelBase:12.5, expToLevelMult:1, expToLevelIncrease:2,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.1, maxLevel:6,
        unlockCost:5, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[["endurance", 10], ["weaponsExpertise", 10]],
        expertiseStats:[]
    },
    reportForLabor: {
        tier:2,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.1, maxLevel:20,
        unlockCost:50, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onLevelStats:[["ambition", 2]],
        expStats:[],
        expertiseStats:[]
    },
    //jobs
    oddJobsLaborer: {
        tier:2,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.1, maxLevel:20,
        unlockCost:50, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[],
        expertiseStats:[]
    },
    chimneySweep: {
        tier:2,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.1, maxLevel:20,
        unlockCost:50, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[],
        expertiseStats:[]
    },
    handyman: {
        tier:2,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.1, maxLevel:20,
        unlockCost:50, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[],
        expertiseStats:[]
    },
    tavernHelper: {
        tier:2,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.1, maxLevel:20,
        unlockCost:50, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[],
        expertiseStats:[]
    },
    guildReceptionist: {
        tier:2,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.1, maxLevel:20,
        unlockCost:50, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[],
        expertiseStats:[]
    },
    messenger: {
        tier:2,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.1, maxLevel:20,
        unlockCost:50, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[],
        expertiseStats:[]
    },
    townCrier: {
        tier:2,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.1, maxLevel:20,
        unlockCost:50, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[],
        expertiseStats:[]
    },
    storyTeller: {
        tier:2,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.1, maxLevel:20,
        unlockCost:50, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[],
        expertiseStats:[]
    },



    //spend money
    buyClothing: {
        tier:1, momentumName: "gold",
        progressMaxBase:100, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.6, maxLevel:20,
        unlockCost:500, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[["energy", 2], ["confidence", 1]],
        expertiseStats:[["haggling", 1]]
    },
    eatBetterFood: {
        tier:1, momentumName: "gold",
        progressMaxBase:100, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.1,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.6, maxLevel:20,
        unlockCost:500, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[["energy", 2], ["confidence", 1]],
        expertiseStats:[["haggling", 1]]
    },
};