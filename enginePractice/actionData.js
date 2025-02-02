


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
    actionObj.efficiencyStats.forEach(function (expertiseStat) { //add the action to the stat, to update exp reductions
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
        expToLevelBase:2, expToLevelMult:1, expToLevelIncrease:1.05,
        actionPowerBase:100, actionPowerMult:1, actionPowerMultIncrease:1.03,
        expertiseBase:.1,
        unlockCost:0, visible:true, unlocked:true, isGenerator:true, generatorSpeed:10,
        onCompleteCustom:function() {
            data.actions.overclock.momentum += data.actions.overclock.actionPower;
        },
        onLevelStats:[["processing", .1], ["diligence", .1]],
        expStats:[["abilityPower", 1], ["energy", 1], ["focus", 1]],
        efficiencyStats:[["drive", 1]]
    },
    overwhelm: {
        tier:1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:2,
        expToLevelBase:2, expToLevelMult:1, expToLevelIncrease:1.07,
        expertiseBase:1,
        unlockCost:10, visible:true, unlocked:false,
        onCompleteCustom:function() {
        },
        onLevelCustom: function() {
        },
        onUnlock: function() {
        },
        onLevelStats:[["abilityPower", 1]],
        expStats:[["diligence", 1]],
        efficiencyStats:[]
    },
    processThoughts: {
        tier:1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:2,
        expToLevelBase:6, expToLevelMult:1, expToLevelIncrease:1.07,
        expertiseBase:1,
        unlockCost:10, visible:true, unlocked:false,
        onCompleteCustom:function() {
        },
        onLevelCustom: function() {
        },
        onUnlock: function() {
        },
        onLevelStats:[["focus", 1]],
        expStats:[["processing", 1]],
        efficiencyStats:[]
    },
    reflect: {
        tier:1,
        progressMaxBase:5, progressMaxMult:1, progressMaxIncrease:5,
        expToLevelBase:1.25, expToLevelMult:1, expToLevelIncrease:2,
        expertiseBase:1, maxLevel:2,
        unlockCost:10, visible:true, unlocked:false,
        onCompleteCustom:function() {
        },
        onLevelCustom: function() {
            if(data.actions.reflect.level >= 2) {
                unveilAction('travelOnRoad')
            }
            // data.actions.overwhelm.maxLevel+=2;
            // data.actions.processThoughts.maxLevel+=2;
        },
        onUnlock: function() {
        },
        onLevelStats:[["drive", 2]],
        expStats:[["focus", 1]],
        efficiencyStats:[]
    },
    journal: {
        tier:2,
        progressMaxBase:1e4, progressMaxMult:1, progressMaxIncrease:5,
        expToLevelBase:1.25, expToLevelMult:1, expToLevelIncrease:2,
        expertiseBase:1, maxLevel:2,
        unlockCost:1e4, visible:false, unlocked:false,
        onCompleteCustom:function() {
        },
        onLevelCustom: function() {
        },
        onUnlock: function() {
        },
        onLevelStats:[["observation", 5]],
        expStats:[["diligence", 1]],
        efficiencyStats:[]
    },
    takeNotes: {
        tier:2,
        progressMaxBase:1e5, progressMaxMult:1, progressMaxIncrease:5,
        expToLevelBase:1.25, expToLevelMult:1, expToLevelIncrease:2,
        expertiseBase:1, maxLevel:2,
        unlockCost:1e5, visible:false, unlocked:false,
        onCompleteCustom:function() {
        },
        onLevelCustom: function() {
        },
        onUnlock: function() {
        },
        onLevelStats:[["observation", 5]],
        expStats:[["diligence", 1]],
        efficiencyStats:[]
    },
    //money
    makeMoney: {
        tier:1,
        progressMaxBase:10, progressMaxMult:1, progressMaxIncrease:1,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:3,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.02,
        expertiseBase:.5,
        unlockCost:1, visible:false, unlocked:false, isGenerator:true, generatorSpeed:2.5,
        onCompleteCustom: function() {
            //Take 1% (tier) of current, consume all of it
            //give 1 part to equation, 1 part to consume for expertise
            //equation takes its part and log(part)^2, gives that to spendMoney


            let actionObj = data.actions.makeMoney;
            let actionTarget = data.actions.spendMoney;
            //this is the amount to remove from actionObj (1%)
            let amount = actionObj.momentum * actionObj.tierMult();
            //this is log10(1% * actionPower)^2 * efficiency
            let amountToSend = actionObj.actionPowerFunction(amount, actionObj.actionPower) * (actionObj.efficiency/100);
            //visual only
            actionObj.amountToSend = amountToSend;

            let takenFromMomentum = amount>actionObj.momentum?amount:actionObj.momentum;
            // actionObj.momentum -= takenFromMomentum;

            addMomentumTo(actionTarget, amountToSend);

            //add exp based on amount sent
            actionObj.expToAddBase = amountToSend;
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
        },
        onUnlock: function() {
            unveilAction("spendMoney");
        },
        onLevelStats:[["energy", 1]],
        expStats:[["diligence", 1], ["ambition", 1]],
        efficiencyStats:[["workEthic", 1]],
        onCompleteText: {
                english:"+<b><span id=\"makeMoneyActionPower\">1</span></b> Gold<br>"
            },
        actionPowerFunction: function(momentum, origMult) {
            if(momentum * origMult < 1) {
                return 0;
            }
            return Math.pow(Math.log10(momentum * origMult), 2); //log10(num * mult)^2
        }
    },
    spendMoney: {
        tier:1, momentumName:"gold",
        progressMaxBase:10, progressMaxMult:1, progressMaxIncrease:1.1,
        expToLevelBase:2, expToLevelMult:1, expToLevelIncrease:1.05,
        expertiseBase:1,
        unlockCost:10, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
            unveilAction("travelToOutpost");
            data.actions.reflect.maxLevel+=1;
        },
        onLevelStats:[["energy", 1], ["confidence", 1], ["ambition", 2]],
        expStats:[["presentation", 1]],
        efficiencyStats:[["haggling", 1]],
    },
    travelOnRoad: {
        tier:1,
        progressMaxBase:4000, progressMaxMult:1, progressMaxIncrease:5,
        expToLevelBase:1.25, expToLevelMult:1, expToLevelIncrease:2,
        expertiseBase:1, maxLevel:5,
        unlockCost:4000, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
            unveilAction('travelToOutpost')
            unveilAction('checkNoticeBoard')
            unveilAction('clearTheTrail')
            unveilAction('paveTheTrail')
            data.actions.reflect.maxLevel++;
        },
        onLevelStats:[["focus", .5]],
        expStats:[["pathfinding", 1], ["endurance", 1]],
        efficiencyStats:[["pathfinding", 4]]
    },
    clearTheTrail: {
        tier:2,
        progressMaxBase:2000000, progressMaxMult:1, progressMaxIncrease:5,
        expToLevelBase:1.25, expToLevelMult:1, expToLevelIncrease:2,
        expertiseBase:1, maxLevel:5,
        unlockCost:2000000, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
        },
        onLevelCustom: function() {
            data.actions.travelOnRoad.maxLevel += 1;
            data.actions.travelToOutpost.maxLevel += 6;
        },
        onLevelStats:[["pathfinding", 2]],
        expStats:[["diligence", 1], ["observation", 1]],
        efficiencyStats:[]
    },
    paveTheTrail: {
        tier:2,
        progressMaxBase:20000000000, progressMaxMult:1, progressMaxIncrease:5,
        expToLevelBase:1.25, expToLevelMult:1, expToLevelIncrease:2,
        expertiseBase:1, maxLevel:5,
        unlockCost:20000000000, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
        },
        onLevelCustom: function() {
            data.actions.clearTheTrail.maxLevel += 1;
        },
        onLevelStats:[["pathfinding", 2]],
        expStats:[["diligence", 1]],
        efficiencyStats:[]
    },
    travelToOutpost: {
        tier:1,
        progressMaxBase:6000, progressMaxMult:1, progressMaxIncrease:2,
        expToLevelBase:2, expToLevelMult:1, expToLevelIncrease:1.07,
        expertiseBase:1, maxLevel:15,
        unlockCost:6000, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
        },
        onLevelStats:[["focus", 3]],
        expStats:[["pathfinding", 1], ["endurance", 1]],
        efficiencyStats:[["pathfinding", 2]]
    },
    checkNoticeBoard: {
        tier:1,
        progressMaxBase:10000, progressMaxMult:1, progressMaxIncrease:5,
        expToLevelBase:1.25, expToLevelMult:1, expToLevelIncrease:2,
        expertiseBase:1, maxLevel:3,
        unlockCost:10000, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
            if(data.actions.checkNoticeBoard.level >= 1) {
                unveilAction('meetVillageLeaderScott')
                unveilAction('helpScottWithChores')
            }
            if(data.actions.checkNoticeBoard.level >= 2) {
                unveilAction('reportForLabor')
                unveilAction('oddJobsLaborer')
            }
            if(data.actions.checkNoticeBoard.level >= 3) {
                unveilAction('reportForTraining')
                unveilAction('takeLessonsFromJohn')
            }
        },
        onLevelStats:[["diligence", 5]],
        expStats:[],
        efficiencyStats:[["observation", 1]]
    },
    meetVillageLeaderScott: {
        tier:2,
        progressMaxBase:20000, progressMaxMult:1, progressMaxIncrease:5,
        expToLevelBase:1.25, expToLevelMult:1, expToLevelIncrease:2,
        expertiseBase:.8, maxLevel:3,
        unlockCost:20000, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onLevelCustom: function() {
            data.actions.helpScottWithChores.maxLevel++
        },
        expStats:[],
        onLevelStats:[["villagersKnown", 1]],
        efficiencyStats:[["scottFamiliarity", 1]]
    },
    helpScottWithChores: {
        tier:2,
        progressMaxBase:20000, progressMaxMult:1, progressMaxIncrease:5,
        expToLevelBase:1.25, expToLevelMult:1, expToLevelIncrease:2,
        expertiseBase:.3, maxLevel:0,
        unlockCost:20000, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onLevelCustom: function() {
            if(data.actions.helpScottWithChores.level >= 1) {
                unveilAction('fillBasicNeeds')
            }
            if(data.actions.helpScottWithChores.level >= 2) {
                unveilAction('socialize')
            }
            if(data.actions.helpScottWithChores.level >= 3) {
                unveilAction('buyClothing')
                unveilAction('eatBetterFood')
            }
            if(data.actions.helpScottWithChores.level >= 4) {
                data.actions.reflect.maxLevel++;
            }
        },
        expStats:[],
        onLevelStats:[["villagersKnown", 1]],
        efficiencyStats:[["scottFamiliarity", 1]]
    },



    socialize: {
        tier:2,
        progressMaxBase:100000, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:20, expToLevelMult:1, expToLevelIncrease:1.05,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.02,
        expertiseBase:.1,
        unlockCost:1e7, visible:false, unlocked:false, //visible:false isGenerator:true, generatorSpeed:10,
        onCompleteCustom: function() {
            //TODO fix like makeMoney
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
        efficiencyStats:[],
        onCompleteText: {
            english:"+<b><span id=\"makeMoneyActionPower\">1</span></b> Gold<br>"
        },
        actionPowerFunction: function(origMult) {
            return Math.log2(data.actions.socialize.momentum) * origMult;
        }
    },
    localOutreach: {
        tier:1, momentumName:"conversations",
        progressMaxBase:100000, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:20, expToLevelMult:1, expToLevelIncrease:1.05,
        unlockCost:100, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
            unveilAction("chatWithTownsfolk");
        },
        expStats:[],
        onLevelStats:[["haggling", 1]],
        efficiencyStats:[],
    },
    chatWithTownsfolk: {
        tier:1, momentumName:"conversations",
        progressMaxBase:100000, progressMaxMult:1, progressMaxIncrease:1.1,
        expToLevelBase:20, expToLevelMult:1, expToLevelIncrease:1.05,
        unlockCost:100, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
        },
        expStats:[],
        onLevelStats:[["villagersKnown", 1]],
        efficiencyStats:[],
    },

    reportForTraining: {
        tier:3,
        progressMaxBase:1e7, progressMaxMult:1, progressMaxIncrease:5,
        expToLevelBase:1.25, expToLevelMult:1, expToLevelIncrease:2,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.1, maxLevel:6,
        unlockCost:1e7, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[["endurance", 10], ["weaponsExpertise", 10]],
        efficiencyStats:[]
    },

    takeLessonsFromJohn: {
        tier:3,
        progressMaxBase:1e7, progressMaxMult:1, progressMaxIncrease:5,
        expToLevelBase:1.25, expToLevelMult:1, expToLevelIncrease:2,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.1, maxLevel:6,
        unlockCost:1e7, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[["endurance", 10], ["weaponsExpertise", 10]],
        efficiencyStats:[]
    },
    reportForLabor: {
        tier:2,
        progressMaxBase:5000, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.05,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.1,
        unlockCost:50, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onLevelStats:[["ambition", 2]],
        expStats:[],
        efficiencyStats:[]
    },
    //jobs
    oddJobsLaborer: {
        tier:2,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.05,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.1, maxLevel:20,
        unlockCost:50, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[],
        efficiencyStats:[]
    },
    chimneySweep: {
        tier:2,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.05,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.1, maxLevel:20,
        unlockCost:50, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[],
        efficiencyStats:[]
    },
    handyman: {
        tier:2,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.05,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.1, maxLevel:20,
        unlockCost:50, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[],
        efficiencyStats:[]
    },
    tavernHelper: {
        tier:2,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.05,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.1, maxLevel:20,
        unlockCost:50, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[],
        efficiencyStats:[]
    },
    guildReceptionist: {
        tier:2,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.05,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.1, maxLevel:20,
        unlockCost:50, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[],
        efficiencyStats:[]
    },
    messenger: {
        tier:2,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.05,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.1, maxLevel:20,
        unlockCost:50, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[],
        efficiencyStats:[]
    },
    townCrier: {
        tier:2,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.05,
        expertiseBase:.1, maxLevel:20,
        unlockCost:50, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[],
        efficiencyStats:[]
    },
    storyTeller: {
        tier:2,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:35, expToLevelMult:1, expToLevelIncrease:1.05,
        expertiseBase:.1, maxLevel:20,
        unlockCost:50, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[],
        efficiencyStats:[]
    },



    //spend money
    fillBasicNeeds: {
        tier:1, momentumName: "gold",
        progressMaxBase:100000, progressMaxMult:1, progressMaxIncrease:2,
        expToLevelBase:5, expToLevelMult:1, expToLevelIncrease:1.07,
        expertiseBase:.5,
        unlockCost:100000, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onLevelCustom:function() {
            unveilAction('journal');
        },
        onLevelStats:[["energy", 2]],
        expStats:[["presentation", 5]],
        efficiencyStats:[["haggling", 1]]
    },
    buyClothing: {
        tier:1, momentumName: "gold",
        progressMaxBase:200000, progressMaxMult:1, progressMaxIncrease:2,
        expToLevelBase:1.5, expToLevelMult:1, expToLevelIncrease:1.07,
        expertiseBase:.4,
        unlockCost:200000, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onLevelCustom:function() {
            data.actions.fillBasicNeeds.maxLevel++
        }, //observation
        expStats:[],
        onLevelStats:[["presentation", 2], ["haggling", 1]],
        efficiencyStats:[["observation", 1]]
    },
    eatBetterFood: {
        tier:1, momentumName: "gold",
        progressMaxBase:200000, progressMaxMult:1, progressMaxIncrease:2,
        expToLevelBase:1.5, expToLevelMult:1, expToLevelIncrease:1.07,
        expertiseBase:.4,
        unlockCost:200000, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onLevelCustom:function() {
            data.actions.fillBasicNeeds.maxLevel++
        },
        expStats:[],
        onLevelStats:[["energy", 2]],
        efficiencyStats:[["haggling", 1]]
    },
};