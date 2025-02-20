


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
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:1.3,
        expToLevelBase:2, expToLevelMult:1, expToLevelIncrease:1.3,
        expertiseBase:1,
        unlockCost:10, visible:true, unlocked:false,
        onCompleteCustom:function() {
        },
        onLevelCustom: function() {
        },
        onUnlock: function() {
            unveilAction('processThoughts')
            unveilAction('reflect')
        },
        onLevelStats:[["abilityPower", 1]],
        expStats:[["diligence", 1]],
        efficiencyStats:[]
    },
    processThoughts: {
        tier:1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:1.3,
        expToLevelBase:2, expToLevelMult:1, expToLevelIncrease:1.3,
        expertiseBase:.5,
        unlockCost:10, visible:false, unlocked:false,
        onCompleteCustom:function() {
        },
        onLevelCustom: function() {
        },
        onUnlock: function() {
        },
        onLevelStats:[["focus", 1]],
        expStats:[["processing", 1], ["memory", 1]],
        efficiencyStats:[["processing", 1]]
    },
    reflect: {
        tier:1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:4,
        expToLevelBase:4, expToLevelMult:1, expToLevelIncrease:2,
        expertiseBase:1, maxLevel:2,
        unlockCost:10, visible:false, unlocked:false,
        onCompleteCustom:function() {
        },
        onLevelCustom: function() {
            if(data.actions.reflect.level >= 1) {
                unveilAction('travelOnRoad')
            }
        },
        onUnlock: function() {
        },
        onLevelStats:[["drive", 2]],
        expStats:[["focus", 1]],
        efficiencyStats:[]
    },
    journal: {
        tier:2,
        progressMaxBase:1e5, progressMaxMult:1, progressMaxIncrease:10,
        expToLevelBase:300, expToLevelMult:1, expToLevelIncrease:3,
        expertiseBase:1, maxLevel:4,
        unlockCost:1e6, visible:false, unlocked:false,
        onCompleteCustom:function() {
            data.actions.reflect.maxLevel+=2
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
        progressMaxBase:1e9, progressMaxMult:1, progressMaxIncrease:100,
        expToLevelBase:3000, expToLevelMult:1, expToLevelIncrease:10,
        expertiseBase:1, maxLevel:2,
        unlockCost:1e5, visible:false, unlocked:false,
        onCompleteCustom:function() {
            data.actions.journal.maxLevel+=2
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
        progressMaxBase:20, progressMaxMult:1, progressMaxIncrease:1,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:2,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.02,
        expertiseBase:.2,
        unlockCost:4000, visible:false, unlocked:false, isGenerator:true, generatorSpeed:10,
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
            actionObj.momentum -= amount;

            addMomentumTo(actionTarget, amountToSend);

            //add exp based on amount sent
            actionObj.expToAddBase = amountToSend;
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
            document.getElementById('makeMoneyMomentumTaken').innerHTML = intToString(amount, 2);
        },
        onUnlock: function() {
            document.getElementById("jobDisplay").style.display = "";
        },
        onLevelStats:[["negotiation", 1]],
        expStats:[["diligence", 1], ["ambition", 1]],
        efficiencyStats:[["workEthic", 1]],
        onCompleteText: {
                english:"+<b><span id=\"makeMoneyActionPower\">1</span></b> Gold<br>"
            },
        actionPowerFunction: function(momentum, origMult) {
            if(momentum * origMult < 1) {
                return 0;
            }
            return Math.pow(Math.log10(momentum * origMult), 2) * data.currentWage; //log10(num * mult)^2 * wage
        }
    },
    spendMoney: {
        tier:1, momentumName:"gold",
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:1.1,
        expToLevelBase:2, expToLevelMult:1, expToLevelIncrease:1.1,
        expertiseBase:.8,
        unlockCost:10, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
            data.actions.reflect.maxLevel++;
        },
        onLevelStats:[["energy", 1], ["confidence", 1], ["ambition", 2]],
        expStats:[["presentation", 1]],
        efficiencyStats:[["haggling", .1]],
        unlockMessage:{english:"On unlock, +1 max level for Reflect."}
    },
    travelOnRoad: {
        tier:1,
        progressMaxBase:5, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:4, expToLevelMult:1, expToLevelIncrease:3,
        expertiseBase:.5, maxLevel:10,
        unlockCost:50, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
            unveilAction('travelToOutpost')
            unveilAction('checkNoticeBoard')
            unveilAction('clearTheTrail')
            data.actions.reflect.maxLevel++;
        },
        onLevelStats:[["focus", 2]],
        expStats:[["pathfinding", 1], ["endurance", 1]],
        efficiencyStats:[["pathfinding", .2]],
        unlockMessage:{english:"On unlock, +1 max level for Reflect."}
    },
    travelToOutpost: {
        tier:1,
        progressMaxBase:5, progressMaxMult:1, progressMaxIncrease:1.5,
        expToLevelBase:4, expToLevelMult:1, expToLevelIncrease:1.5,
        expertiseBase:.5, maxLevel:15,
        unlockCost:50, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
            data.actions.reflect.maxLevel++;
        },
        onLevelStats:[["focus", 1]],
        expStats:[["pathfinding", 1], ["endurance", 1]],
        efficiencyStats:[["pathfinding", .1]],
        unlockMessage:{english:"On unlock, +1 max level for Reflect."}
    },
    clearTheTrail: {
        tier:1,
        progressMaxBase:100, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:500, expToLevelMult:1, expToLevelIncrease:3,
        expertiseBase:1, maxLevel:5,
        unlockCost:2000, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
            unveilAction('paveTheTrail')
        },
        onLevelCustom: function() {
            data.actions.travelOnRoad.maxLevel += 1;
            data.actions.travelToOutpost.maxLevel += 6;
        },
        onLevelStats:[["pathfinding", 4]],
        expStats:[["diligence", 1], ["observation", 1]],
        efficiencyStats:[]
    },
    paveTheTrail: {
        tier:2,
        progressMaxBase:500000000, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:50, expToLevelMult:1, expToLevelIncrease:3,
        expertiseBase:1, maxLevel:5,
        unlockCost:500000000, visible:false, unlocked:false, //visible:false
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
    checkNoticeBoard: {
        tier:1,
        progressMaxBase:10, progressMaxMult:1, progressMaxIncrease:10,
        expToLevelBase:2, expToLevelMult:1, expToLevelIncrease:2,
        expertiseBase:.8, maxLevel:3,
        unlockCost:25, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
        },
        onLevelCustom: function() {
            if(data.actions.checkNoticeBoard.level >= 1) {
                unveilAction('meetVillageLeaderScott')
                unveilAction('helpScottWithChores')
            }
            if(data.actions.checkNoticeBoard.level >= 2) {
                unveilAction('reportForTraining')
            }
            if(data.actions.checkNoticeBoard.level >= 3) {
                unveilAction('reportForLabor')
                unveilAction('oddJobsLaborer')
            }
        },
        onLevelStats:[["diligence", 5]],
        expStats:[],
        efficiencyStats:[["observation", .1]],
        extraInfo:{english:"Unlocks new actions with each level."}
    },
    meetVillageLeaderScott: {
        tier:1,
        progressMaxBase:50, progressMaxMult:1, progressMaxIncrease:5, //Greater than reflect
        expToLevelBase:4, expToLevelMult:1, expToLevelIncrease:5,
        expertiseBase:.6, maxLevel:3,
        unlockCost:50, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onLevelCustom: function() {
            if(data.actions.meetVillageLeaderScott.level >= 1) {
                unveilAction('makeMoney')
                unveilAction('spendMoney')
            }
            data.actions.helpScottWithChores.maxLevel++
        },
        onUnlock: function() {
            data.actions.reflect.maxLevel++;
        },
        expStats:[],
        onLevelStats:[["villagersKnown", 1]],
        efficiencyStats:[["scottFamiliarity", 1]],
        unlockMessage:{english:"On unlock, +1 max level for Reflect."},
        extraInfo:{english:"On level up: Increases Help Scott With Chores max level by 1"}
    },
    helpScottWithChores: {
        tier:1,
        progressMaxBase:5, progressMaxMult:1, progressMaxIncrease:4,
        expToLevelBase:4, expToLevelMult:1, expToLevelIncrease:4,
        expertiseBase:.3, maxLevel:1,
        unlockCost:50, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onLevelCustom: function() {
            if(data.actions.helpScottWithChores.level >= 2) {
                unveilAction('fillBasicNeeds')
            }
            if(data.actions.helpScottWithChores.level >= 4) {
                unveilAction('buyClothing')
            }
            if(data.actions.helpScottWithChores.level >= 6) {
                unveilAction('eatBetterFood')
            }
            data.actions.reflect.maxLevel++;
        },
        expStats:[],
        onLevelStats:[["villagersKnown", 1]],
        efficiencyStats:[["scottFamiliarity", .5], ["villagersKnown", .5]],
        extraInfo:{english:"Unlocks new actions every even level until 6. Increases reflect's max level by 1 per level."}
    },

    reportForLabor: {
        tier:1,
        progressMaxBase:20, progressMaxMult:1, progressMaxIncrease:2,
        expToLevelBase:4, expToLevelMult:1, expToLevelIncrease:2,
        expertiseBase:.1,
        unlockCost:200, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
            data.actions.reflect.maxLevel++;
        },
        onLevelStats:[["workEthic", 1], ["ambition", 1]],
        expStats:[["jobExperience", 1]],
        efficiencyStats:[["ambition", .01]],
        unlockMessage:{english:"On unlock, +1 max level for Reflect."}
    },

    reportForTraining: {
        tier:1,
        progressMaxBase:10, progressMaxMult:1, progressMaxIncrease:1.5,
        expToLevelBase:4, expToLevelMult:1, expToLevelIncrease:1.5,
        expertiseBase:.6, maxLevel:20,
        unlockCost:100, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onLevelCustom:function() {
            if(data.actions.reportForTraining.level >= 15) {
                unveilAction('takeLessonsFromJohn');
            }
        },
        expStats:[],
        onLevelStats:[["endurance", 1], ["memory", 1]],
        efficiencyStats:[["drive", 1]]
    },
    takeLessonsFromJohn: {
        tier:1,
        progressMaxBase:1e6, progressMaxMult:1, progressMaxIncrease:1.5,
        expToLevelBase:4, expToLevelMult:1, expToLevelIncrease:1.5,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.2, maxLevel:6,
        unlockCost:1e7, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        expStats:[],
        onLevelStats:[["endurance", 2], ["weaponsExpertise", 2], ["memory", 2]],
        efficiencyStats:[]
    },

    //jobs
    oddJobsLaborer: {
        tier:1,
        progressMaxBase:1000, progressMaxMult:1, progressMaxIncrease:1.2,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.2,
        expertiseBase:.1, maxLevel:20,
        wage: 10,
        unlockCost:100, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onLevelCustom: function() {
            data.actions.oddJobsLaborer.wage += actionData.oddJobsLaborer.wage;
            changeJob('oddJobsLaborer');
            if(data.actions.oddJobsLaborer.level >= 15) {
                unveilAction('chimneySweep');
            }
        },
        onUnlock:function() {
            unveilAction('socialize');
            changeJob('oddJobsLaborer');
        },
        expStats:[["workEthic", .5]],
        onLevelStats:[["streetKnowledge", 1], ["jobExperience", 1]],
        efficiencyStats:[["streetKnowledge", 1]]
    },
    chimneySweep: {
        tier:1,
        progressMaxBase:500000, progressMaxMult:1, progressMaxIncrease:1.2,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.2,
        expertiseBase:.1, maxLevel:22,
        wage: 100,
        unlockCost:500000, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onLevelCustom: function() {
            data.actions.oddJobsLaborer.wage += actionData.oddJobsLaborer.wage;
            changeJob('chimneySweep');
            if(data.actions.oddJobsLaborer.level >= 15) {
                unveilAction('handyman');
            }
        },
        onUnlock:function() {
            changeJob('chimneySweep');
        },
        expStats:[["workEthic", .5]],
        onLevelStats:[["streetKnowledge", 1], ["jobExperience", 1]],
        efficiencyStats:[["streetKnowledge", .5]]
    },
    handyman: {
        tier:1,
        progressMaxBase:250e6, progressMaxMult:1, progressMaxIncrease:1.2,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.2,
        expertiseBase:.1, maxLevel:24,
        wage: 1000,
        unlockCost:250e6, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onLevelCustom: function() {
            data.actions.oddJobsLaborer.wage += actionData.oddJobsLaborer.wage;
            changeJob('handyman');
            if(data.actions.oddJobsLaborer.level >= 15) {
                unveilAction('tavernHelper');
            }
        },
        onUnlock:function() {
            changeJob('handyman');
        },
        expStats:[["workEthic", .5]],
        onLevelStats:[["streetKnowledge", 1], ["jobExperience", 1]],
        efficiencyStats:[["streetKnowledge", .2]]
    },
    tavernHelper: {
        tier:1,
        progressMaxBase:125e9, progressMaxMult:1, progressMaxIncrease:1.2,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.2,
        expertiseBase:.1, maxLevel:26,
        wage: 10000,
        unlockCost:125e9, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onLevelCustom: function() {
            data.actions.oddJobsLaborer.wage += actionData.oddJobsLaborer.wage;
            changeJob('tavernHelper');
            if(data.actions.oddJobsLaborer.level >= 15) {
                unveilAction('guildReceptionist');
            }
        },
        onUnlock:function() {
            changeJob('tavernHelper');
        },
        expStats:[["workEthic", .5]],
        onLevelStats:[["streetKnowledge", 1], ["jobExperience", 1]],
        efficiencyStats:[["streetKnowledge", .1]]
    },
    guildReceptionist: {
        tier:1,
        progressMaxBase:60e12, progressMaxMult:1, progressMaxIncrease:1.2,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.2,
        expertiseBase:.1, maxLevel:28,
        wage: 100000,
        unlockCost:60e12, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onLevelCustom: function() {
            data.actions.oddJobsLaborer.wage += actionData.oddJobsLaborer.wage;
            changeJob('guildReceptionist');
            if(data.actions.oddJobsLaborer.level >= 15) {
                unveilAction('messenger');
            }
        },
        onUnlock:function() {
            changeJob('guildReceptionist');
        },
        expStats:[["workEthic", .5]],
        onLevelStats:[["streetKnowledge", 1], ["jobExperience", 1]],
        efficiencyStats:[["streetKnowledge", .05]]
    },
    messenger: {
        tier:1,
        progressMaxBase:30e15, progressMaxMult:1, progressMaxIncrease:1.2,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.2,
        expertiseBase:.1, maxLevel:30,
        wage: 1000000,
        unlockCost:30e15, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onLevelCustom: function() {
            data.actions.oddJobsLaborer.wage += actionData.oddJobsLaborer.wage;
            changeJob('messenger');
            if(data.actions.oddJobsLaborer.level >= 15) {
                unveilAction('townCrier');
            }
        },
        onUnlock:function() {
            changeJob('messenger');
        },
        expStats:[["workEthic", .5]],
        onLevelStats:[["streetKnowledge", 1], ["jobExperience", 1]],
        efficiencyStats:[["streetKnowledge", .02]]
    },
    townCrier: {
        tier:1,
        progressMaxBase:15e18, progressMaxMult:1, progressMaxIncrease:1.2,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.2,
        expertiseBase:.1, maxLevel:32,
        wage: 10000000,
        unlockCost:15e18, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onLevelCustom: function() {
            data.actions.oddJobsLaborer.wage += actionData.oddJobsLaborer.wage;
            changeJob('townCrier');
            if(data.actions.oddJobsLaborer.level >= 15) {
                unveilAction('storyTeller');
            }
        },
        onUnlock:function() {
            changeJob('townCrier');
        },
        expStats:[["workEthic", .5]],
        onLevelStats:[["streetKnowledge", 1], ["jobExperience", 1]],
        efficiencyStats:[["streetKnowledge", .01]]
    },
    storyTeller: {
        tier:1,
        progressMaxBase:10e21, progressMaxMult:1, progressMaxIncrease:1.2,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.2,
        expertiseBase:.1, maxLevel:34,
        wage: 100000000,
        unlockCost:10e21, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onLevelCustom: function() {
            data.actions.oddJobsLaborer.wage += actionData.oddJobsLaborer.wage;
            changeJob('storyTeller');
            if(data.actions.oddJobsLaborer.level >= 15) {
                unveilAction('handyman');
            }
        },
        onUnlock:function() {
            changeJob('storyTeller');
        },
        expStats:[["workEthic", .5]],
        onLevelStats:[["streetKnowledge", 1], ["jobExperience", 1]],
        efficiencyStats:[["streetKnowledge", .001]]
    },

    //spend money
    fillBasicNeeds: {
        tier:1, momentumName: "gold",
        progressMaxBase:10, progressMaxMult:1, progressMaxIncrease:1.3,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.3,
        expertiseBase:.8,
        unlockCost:100, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onLevelCustom:function() {
            unveilAction('journal');
        },
        onLevelStats:[["energy", 1]],
        expStats:[["villagersKnown", 1], ["negotiation", 1]],
        efficiencyStats:[["haggling", .1]]
    },
    buyClothing: {
        tier:1, momentumName: "gold",
        progressMaxBase:20000, progressMaxMult:1, progressMaxIncrease:1.5,
        expToLevelBase:4, expToLevelMult:1, expToLevelIncrease:1.5,
        expertiseBase:.6,
        unlockCost:200000, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onLevelCustom:function() {
            data.actions.fillBasicNeeds.maxLevel++
        }, //observation
        onLevelStats:[["presentation", 1]],
        expStats:[["negotiation", .5], ["observation", 1]],
        efficiencyStats:[["haggling", .1]]
    },
    eatBetterFood: {
        tier:1, momentumName: "gold",
        progressMaxBase:20000, progressMaxMult:1, progressMaxIncrease:1.5,
        expToLevelBase:4, expToLevelMult:1, expToLevelIncrease:1.5,
        expertiseBase:.6,
        unlockCost:200000, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onLevelCustom:function() {
            data.actions.fillBasicNeeds.maxLevel++
        },
        expStats:[["negotiation", .5]],
        onLevelStats:[["energy", 2]],
        efficiencyStats:[["haggling", .1]]
    },

    //socialize
    socialize: {
        tier:1,
        progressMaxBase:100, progressMaxMult:1, progressMaxIncrease:1.3,
        expToLevelBase:20, expToLevelMult:1, expToLevelIncrease:1.3,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.02, generatorSpeed:100,
        expertiseBase:.01,
        unlockCost:1e7, visible:false, unlocked:false, //visible:false isGenerator:true, generatorSpeed:10,
        onCompleteCustom: function() {
            let actionObj = data.actions.socialize;
            let actionTarget = data.actions.makeRelationships;
            //this is the amount to remove from actionObj (1%)
            let amount = actionObj.momentum * actionObj.tierMult();
            //this is log10(1% * actionPower)^2 * efficiency
            let amountToSend = actionObj.actionPowerFunction(amount, actionObj.actionPower) * (actionObj.efficiency/100);
            //visual only
            actionObj.amountToSend = amountToSend;
            actionObj.momentum -= amount;

            addMomentumTo(actionTarget, amountToSend);

            //add exp based on amount sent
            actionObj.expToAddBase = amountToSend;
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
            document.getElementById('socializeMomentumTaken').innerHTML = intToString(amount, 2);
        },
        onUnlock: function() {
            unveilAction('makeRelationships');
            unveilAction('chatWithTownsfolk');
        },
        expStats:[["wit", 1], ["grace", 1], ["tact", 1], ["insight", 1], ["trust", 1], ["influence", 1]],
        onLevelStats:[["charm", 1], ["recognition", 1]],
        efficiencyStats:[["confidence", 1], ["presentation", 1]],
        onCompleteText: {
            english:"+<b><span id=\"socializeActionPower\">1</span></b> Conversation<br>"
        },
        actionPowerFunction: function(momentum, origMult) {
            if(momentum * origMult < 1) {
                return 0;
            }
            return Math.pow(Math.log10(momentum * origMult), 3); //log10(num * mult)^3
        }
    },
    chat: {
        tier:1, momentumName:"conversations",
        progressMaxBase:50000, progressMaxMult:1, progressMaxIncrease:1.1,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.1,
        unlockCost:50000, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
            data.actions.reflect.maxLevel++;
        },
        expStats:[["charm", 1]],
        onLevelStats:[["processing", 1]],
        efficiencyStats:[],
        unlockMessage:{english:"On unlock, +1 max level for Reflect."}
    },
    neighborlyTies: {
        tier:1, momentumName:"conversations",
        progressMaxBase:50000, progressMaxMult:1, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.5,
        unlockCost:50000, maxLevel:50,
        visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
        },
        expStats:[],
        onLevelStats:[["villagersKnown", 1]],
        efficiencyStats:[],
    },
    gossipAboutPrices: {
        tier:1, momentumName:"conversations",
        progressMaxBase:50000, progressMaxMult:1, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.5,
        unlockCost:50000,  maxLevel:10,
        visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
        },
        expStats:[],
        onLevelStats:[["haggling", 1]],
        efficiencyStats:[],
    },
    talkAboutMarkets: {
        tier:1, momentumName:"conversations",
        progressMaxBase:100e6, progressMaxMult:1, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.5,
        unlockCost:100e6, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
        },
        expStats:[],
        onLevelStats:[["haggling", 1]],
        efficiencyStats:[],
    },
    talkToScott: {
        tier:1, momentumName:"conversations",
        progressMaxBase:50000, progressMaxMult:1, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.5,
        unlockCost:50000, maxLevel:10,
        visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
        },
        expStats:[],
        onLevelStats:[["scottFamiliarity", 1]],
        efficiencyStats:[],
    },
    talkAboutVillageHistory: {
        tier:1, momentumName:"conversations",
        progressMaxBase:50000, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:3,
        unlockCost:50000, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
        },
        expStats:[],
        onLevelStats:[["villagersKnown", 1]],
        efficiencyStats:[],
    },
    talkAboutCurrentIssues: {
        tier:1, momentumName:"conversations",
        progressMaxBase:50000, progressMaxMult:1, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.5,
        unlockCost:50000, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
        },
        expStats:[],
        onLevelStats:[["villagersKnown", 1]],
        efficiencyStats:[],
    },
    talkToInstructorJohn: {
        tier:1, momentumName:"conversations",
        progressMaxBase:50000, progressMaxMult:1, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.5,
        unlockCost:50000, visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
        },
        expStats:[],
        onLevelStats:[["villagersKnown", 1]],
        efficiencyStats:[],
    },


};