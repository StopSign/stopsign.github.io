


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
    x*= 380;
    y*= -380;
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
        expToLevelBase:1, expToLevelMult:1, expToLevelIncrease:1.2,
        actionPowerBase:100, actionPowerMult:2, actionPowerMultIncrease:1.05,
        expertiseBase:.1,
        unlockCost:0, visible:true, unlocked:true, isGenerator:true, generatorSpeed:10,
        onUnlock: function() {
        },
        onCompleteCustom:function() {
            data.actions.overclock.momentum += data.actions.overclock.actionPower;
        },
        onLevelCustom: function() {
        },
        onLevelStats:[["processing", 1], ["diligence", .1]],
        expStats:[["abilityPower", 1], ["energy", 1], ["focus", 1]],
        efficiencyStats:[["drive", 1]]
    },
    harnessOverflow: {
        tier:1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:1.1,
        expToLevelBase:1, expToLevelMult:1, expToLevelIncrease:1.2,
        expertiseBase:.5,
        unlockCost:5, visible:true, unlocked:false,
        onUnlock: function() {
            unveilAction('distillInsight')
            unveilAction('remember')
        },
        onLevelStats:[["abilityPower", 1]],
        expStats:[["processing", 1]],
        efficiencyStats:[["processing", .01]]
    },
    distillInsight: {
        tier:1,
        progressMaxBase:1, progressMaxMult:1, progressMaxIncrease:1.1,
        expToLevelBase:1, expToLevelMult:1, expToLevelIncrease:1.2,
        expertiseBase:.2,
        unlockCost:5, visible:false, unlocked:false,
        onLevelStats:[["focus", 1]],
        expStats:[["observation", 1], ["memory", 1]],
        efficiencyStats:[["processing", .001]]
    },
    remember: {
        tier:1,
        progressMaxBase:20, progressMaxMult:1, progressMaxIncrease:1.5,
        expToLevelBase:2, expToLevelMult:1, expToLevelIncrease:2,
        expertiseBase:1, maxLevel:4,
        unlockCost:80, visible:false, unlocked:false,
        onLevelCustom: function() {
            if(data.actions.remember.level >= 1) {
                unveilAction('travelOnRoad')
            }
        },
        onLevelStats:[["drive", 1], ["memory", 2]],
        expStats:[["focus", 1]],
        efficiencyStats:[]
    },
    journal: {
        tier:2,
        progressMaxBase:10, progressMaxMult:1, progressMaxIncrease:1.2,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.1,
        expertiseBase:.01,
        unlockCost:5000, visible:false, unlocked:false,
        onLevelCustom: function() {
        },
        onLevelStats:[["memory", 2], ["observation", 1]],
        expStats:[["diligence", 1]],
        efficiencyStats:[["perspective", 1]]
    },
    takeNotes: {
        tier:2,
        progressMaxBase:1e10, progressMaxMult:1, progressMaxIncrease:100,
        expToLevelBase:3000, expToLevelMult:1, expToLevelIncrease:10,
        expertiseBase:1, maxLevel:2,
        unlockCost:1e9, visible:false, unlocked:false,
        onLevelCustom:function() {
            data.actions.journal.maxLevel+=2
        },
        onLevelStats:[["observation", 5]],
        expStats:[["diligence", 1]],
        efficiencyStats:[]
    },
    travelOnRoad: {
        tier:1,
        progressMaxBase:5, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:4, expToLevelMult:1, expToLevelIncrease:1.2,
        expertiseBase:.6, maxLevel:10,
        unlockCost:50, visible:false, unlocked:false,
        onUnlock: function() {
            unveilAction('travelToOutpost')
            unveilAction('clearTheTrail')
            unveilAction('meetVillageLeaderScott')
        },
        onLevelStats:[["abilityPower", 1], ["observation", 1]],
        expStats:[["endurance", 1]],
        efficiencyStats:[["pathfinding", 1]]
    },
    travelToOutpost: {
        tier:1,
        progressMaxBase:5, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:4, expToLevelMult:1, expToLevelIncrease:1.2,
        expertiseBase:.5, maxLevel:45,
        unlockCost:50, visible:false, unlocked:false,
        onUnlock: function() {
            data.actions.remember.maxLevel+=2;
        },
        onLevelStats:[["abilityPower", 1], ["observation", 1]],
        expStats:[["endurance", 1]],
        efficiencyStats:[["pathfinding", .5]],
        unlockMessage:{english:"On unlock, +2 max level for Remember."}
    },
    meetVillageLeaderScott: {
        tier:1,
        progressMaxBase:2, progressMaxMult:1, progressMaxIncrease:2,
        expToLevelBase:2, expToLevelMult:1, expToLevelIncrease:1.3,
        expertiseBase:.1, maxLevel:32,
        unlockCost:10, visible:false, unlocked:false,
        onLevelCustom: function() {
            data.actions.helpScottWithChores.maxLevel++
        },
        onUnlock: function() {
            unveilAction('helpScottWithChores')
        },
        onLevelStats:[["scottFamiliarity", 1]],
        expStats:[["trust", 1]],
        efficiencyStats:[["villagersKnown", 1]],
        extraInfo:{english:"On level up: Increases Help Scott With Chores max level by 1"}
    },
    helpScottWithChores: {
        tier:1,
        progressMaxBase:5, progressMaxMult:1, progressMaxIncrease:2,
        expToLevelBase:2, expToLevelMult:1, expToLevelIncrease:1.2,
        expertiseBase:.3, maxLevel:1,
        unlockCost:20, visible:false, unlocked:false,
        onUnlock:function() {
            unveilAction('makeMoney')
            unveilAction('spendMoney')
            unveilAction('checkNoticeBoard')
        },
        onLevelCustom: function() {
            data.actions.remember.maxLevel++;
        },
        expStats:[],
        onLevelStats:[["villagersKnown", 1]],
        efficiencyStats:[["scottFamiliarity", .5]],
        extraInfo:{english:"Unlocks new actions every even level until 6. Increases remember's max level by 1 per level."}
    },
    clearTheTrail: {
        tier:1,
        progressMaxBase:40, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.2,
        expertiseBase:.5, maxLevel:6,
        unlockCost:2000, visible:false, unlocked:false,
        onUnlock: function() {
            unveilAction('paveTheTrail')
        },
        onLevelStats:[["pathfinding", 1]],
        expStats:[],
        efficiencyStats:[["diligence", .1]]
    },
    paveTheTrail: {
        tier:1,
        progressMaxBase:4000, progressMaxMult:1, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.2,
        expertiseBase:.01, maxLevel:6,
        unlockCost:200000, visible:false, unlocked:false,
        onLevelStats:[["pathfinding", 1]],
        expStats:[],
        efficiencyStats:[["diligence", .1]]
    },
    checkNoticeBoard: {
        tier:1,
        progressMaxBase:50, progressMaxMult:1, progressMaxIncrease:10,
        expToLevelBase:2, expToLevelMult:1, expToLevelIncrease:2,
        expertiseBase:.6, maxLevel:3,
        unlockCost:200, visible:false, unlocked:false,
        onLevelCustom: function() {
            if(data.actions.checkNoticeBoard.level >= 1) {
                unveilAction('reportForTraining')
            }
            if(data.actions.checkNoticeBoard.level >= 2) {
                unveilAction('socialize');
                unveilAction('chat');
            }
            if(data.actions.checkNoticeBoard.level >= 3) {
                unveilAction('reportForLabor')
                unveilAction('oddJobsLaborer')
            }
        },
        onLevelStats:[["diligence", 5]],
        expStats:[],
        efficiencyStats:[["observation", .001]],
        extraInfo:{english:"Unlocks new actions with each level."}
    },

    //John
    reportForTraining: {
        tier:1,
        progressMaxBase:2, progressMaxMult:1, progressMaxIncrease:1.4,
        expToLevelBase:2, expToLevelMult:1, expToLevelIncrease:1.1,
        expertiseBase:.3, maxLevel:40,
        unlockCost:10, visible:false, unlocked:false,
        onLevelCustom:function() {
            if(data.actions.reportForTraining.level >= 30) {
                unveilAction('takeLessonsFromJohn');
            }
        },
        expStats:[],
        onLevelStats:[["endurance", 1], ["memory", 1]],
        efficiencyStats:[["drive", .5]]
    },
    takeLessonsFromJohn: {
        tier:2,
        progressMaxBase:1e6, progressMaxMult:1, progressMaxIncrease:1.5,
        expToLevelBase:4, expToLevelMult:1, expToLevelIncrease:1.5,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:3.1,
        expertiseBase:.2, maxLevel:40,
        unlockCost:1e7, visible:false, unlocked:false,
        expStats:[],
        onLevelStats:[["endurance", 2], ["memory", 2]],
        efficiencyStats:[["drive", .1]]
    },

    //jobs
    reportForLabor: {
        tier:1,
        progressMaxBase:20, progressMaxMult:1, progressMaxIncrease:4,
        expToLevelBase:4, expToLevelMult:1, expToLevelIncrease:1.1,
        expertiseBase:.1,
        unlockCost:5000, visible:false, unlocked:false,
        onUnlock: function() {
            unveilAction('fillBasicNeeds');
        },
        onLevelStats:[["workEthic", 1], ["ambition", 1]],
        expStats:[],
        efficiencyStats:[["energy", .01]]
    },
    oddJobsLaborer: {
        tier:1,
        progressMaxBase:1e3, progressMaxMult:1, progressMaxIncrease:1.2,
        expToLevelBase:4, expToLevelMult:1, expToLevelIncrease:1.1,
        expertiseBase:.2, maxLevel:20,
        wage: 10,
        unlockCost:5e3, visible:false, unlocked:false,
        onLevelCustom: function() {
            data.actions.oddJobsLaborer.wage += actionData.oddJobsLaborer.wage;
            changeJob('oddJobsLaborer');
            if(data.actions.oddJobsLaborer.level >= 15) {
                unveilAction('chimneySweep');
            }
        },
        onUnlock:function() {
            changeJob('oddJobsLaborer');
            unveilAction('buyClothing');
            unveilAction('eatBetterFood');
        },
        onLevelStats:[["streetKnowledge", 1], ["jobExperience", 1]],
        expStats:[["workEthic", .5]],
        efficiencyStats:[["villagersKnown", .1], ["streetKnowledge", .1]],
        unlockMessage:{english:"On unlock, set job to Odd Jobs Laborer for a base wage of $10."}
    },
    chimneySweep: {
        tier:1,
        progressMaxBase:5e5, progressMaxMult:1, progressMaxIncrease:1.2,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.2,
        expertiseBase:.1, maxLevel:22,
        wage: 500,
        unlockCost:5e6, visible:false, unlocked:false,
        onLevelCustom: function() {
            data.actions.chimneySweep.wage += actionData.chimneySweep.wage;
            changeJob('chimneySweep');
            if(data.actions.chimneySweep.level >= 16) {
                unveilAction('handyman');
            }
        },
        onUnlock:function() {
            changeJob('chimneySweep');
        },
        onLevelStats:[["streetKnowledge", 1], ["jobExperience", 1]],
        expStats:[["workEthic", .5]],
        efficiencyStats:[["villagersKnown", .1], ["streetKnowledge", .1]],
        unlockMessage:{english:"On unlock, set job to Chimney Sweep for a base wage of $500."}
    },
    handyman: {
        tier:1,
        progressMaxBase:5e8, progressMaxMult:1, progressMaxIncrease:1.2,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.2,
        expertiseBase:.1, maxLevel:24,
        wage: 25000,
        unlockCost:5e9, visible:false, unlocked:false,
        onLevelCustom: function() {
            data.actions.handyman.wage += actionData.handyman.wage;
            changeJob('handyman');
            if(data.actions.handyman.level >= 17) {
                unveilAction('tavernHelper');
            }
        },
        onUnlock:function() {
            changeJob('handyman');
        },
        onLevelStats:[["streetKnowledge", 1], ["jobExperience", 1]],
        expStats:[["workEthic", .5]],
        efficiencyStats:[["villagersKnown", .1], ["streetKnowledge", .1]],
        unlockMessage:{english:"On unlock, set job to Handyman for a base wage of $25k."}
    },
    tavernHelper: {
        tier:1,
        progressMaxBase:5e11, progressMaxMult:1, progressMaxIncrease:1.2,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.2,
        expertiseBase:.1, maxLevel:26,
        wage: 1.25e6,
        unlockCost:5e12, visible:false, unlocked:false,
        onLevelCustom: function() {
            data.actions.tavernHelper.wage += actionData.tavernHelper.wage;
            changeJob('tavernHelper');
            if(data.actions.tavernHelper.level >= 18) {
                unveilAction('guildReceptionist');
            }
        },
        onUnlock:function() {
            changeJob('tavernHelper');
        },
        onLevelStats:[["streetKnowledge", 1], ["jobExperience", 1]],
        expStats:[["workEthic", .5]],
        efficiencyStats:[["villagersKnown", .1], ["streetKnowledge", .1]],
        unlockMessage:{english:"On unlock, set job to tavernHelper for a base wage of $1.25m."}
    },
    guildReceptionist: {
        tier:1,
        progressMaxBase:5e14, progressMaxMult:1, progressMaxIncrease:1.2,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.2,
        expertiseBase:.1, maxLevel:28,
        wage: 100e6,
        unlockCost:5e15, visible:false, unlocked:false,
        onLevelCustom: function() {
            data.actions.guildReceptionist.wage += actionData.guildReceptionist.wage;
            changeJob('guildReceptionist');
            if(data.actions.guildReceptionist.level >= 19) {
                unveilAction('messenger');
            }
        },
        onUnlock:function() {
            changeJob('guildReceptionist');
        },
        onLevelStats:[["streetKnowledge", 1], ["jobExperience", 1]],
        expStats:[["workEthic", .5]],
        efficiencyStats:[["villagersKnown", .1], ["streetKnowledge", .1]],
        unlockMessage:{english:"On unlock, set job to guildReceptionist for a base wage of $100m."}
    },
    messenger: {
        tier:1,
        progressMaxBase:5e17, progressMaxMult:1, progressMaxIncrease:1.2,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.2,
        expertiseBase:.1, maxLevel:30,
        wage: 5e9,
        unlockCost:5e18, visible:false, unlocked:false,
        onLevelCustom: function() {
            data.actions.messenger.wage += actionData.messenger.wage;
            changeJob('messenger');
            if(data.actions.messenger.level >= 20) {
                unveilAction('townCrier');
            }
        },
        onUnlock:function() {
            changeJob('messenger');
        },
        onLevelStats:[["streetKnowledge", 1], ["jobExperience", 1]],
        expStats:[["workEthic", .5]],
        efficiencyStats:[["villagersKnown", .1], ["streetKnowledge", .1]],
        unlockMessage:{english:"On unlock, set job to messenger for a base wage of $5b."}
    },
    townCrier: {
        tier:1,
        progressMaxBase:5e20, progressMaxMult:1, progressMaxIncrease:1.2,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.2,
        expertiseBase:.1, maxLevel:32,
        wage: 250e9,
        unlockCost:5e21, visible:false, unlocked:false,
        onLevelCustom: function() {
            data.actions.townCrier.wage += actionData.townCrier.wage;
            changeJob('townCrier');
            if(data.actions.townCrier.level >= 21) {
                unveilAction('storyTeller');
            }
        },
        onUnlock:function() {
            changeJob('townCrier');
        },
        onLevelStats:[["streetKnowledge", 1], ["jobExperience", 1]],
        expStats:[["workEthic", .5]],
        efficiencyStats:[["villagersKnown", .1], ["streetKnowledge", .1]],
        unlockMessage:{english:"On unlock, set job to townCrier for a base wage of $250b."}
    },
    storyTeller: {
        tier:1,
        progressMaxBase:5e23, progressMaxMult:1, progressMaxIncrease:1.2,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.2,
        expertiseBase:.1, maxLevel:34,
        wage: 20e12,
        unlockCost:5e24, visible:false, unlocked:false,
        onLevelCustom: function() {
            data.actions.storyTeller.wage += actionData.storyTeller.wage;
            changeJob('storyTeller');
        },
        onUnlock:function() {
            changeJob('storyTeller');
        },
        onLevelStats:[["streetKnowledge", 1], ["jobExperience", 1]],
        expStats:[["workEthic", .5]],
        efficiencyStats:[["villagersKnown", .1], ["streetKnowledge", .1]],
        unlockMessage:{english:"On unlock, set job to storyTeller for a base wage of $20t."}
    },

    //money
    makeMoney: {
        tier:1,
        progressMaxBase:10, progressMaxMult:1, progressMaxIncrease:1,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.5,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.1,
        expertiseBase:.4,
        unlockCost:300, visible:false, unlocked:false,
        isGenerator:true, generatorTarget:"spendMoney", generatorSpeed:5,
        onCompleteCustom: function() {
            //Take 1% (tier) of current, consume all of it
            //give 1 part to equation, 1 part to consume for expertise
            //equation takes its part and log(part)^2, gives that to spendMoney

            let actionObj = data.actions.makeMoney;
            let actionTarget = data.actions[actionObj.generatorTarget];
            //this is the amount to remove from actionObj (1%)
            let amount = actionObj.momentum * actionObj.tierMult();
            //this is log10(1% * actionPower)^2 * efficiency
            let amountToSend = actionObj.actionPowerFunction(amount, actionObj.actionPower) * (actionObj.efficiency/100);
            //visual only
            actionObj.amountToSend = amountToSend;
            if(amountToSend > 0) { //only take if it gave
                actionObj.momentum -= amount;
            }

            addMomentumTo(actionTarget, amountToSend);

            //add exp based on amount sent
            actionObj.expToAddBase = amountToSend;
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
            document.getElementById('makeMoneyMomentumTaken').innerText = intToString(amount, 2);
        },
        onUnlock: function() {
            document.getElementById("jobDisplay").style.display = "";
        },
        onLevelStats:[["negotiation", 1]],
        expStats:[["diligence", 1], ["ambition", 1], ["jobExperience", 1]],
        efficiencyStats:[["workEthic", .2]],
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
        progressMaxBase:2, progressMaxMult:1, progressMaxIncrease:1.1,
        expToLevelBase:1, expToLevelMult:1, expToLevelIncrease:1.2,
        expertiseBase:.8,
        unlockCost:10, visible:false, unlocked:false,
        onLevelStats:[["energy", 1], ["confidence", 1]],
        expStats:[["negotiation", 1]],
        efficiencyStats:[["haggling", .1]]
    },
    fillBasicNeeds: {
        tier:1, momentumName: "gold",
        progressMaxBase:5, progressMaxMult:1, progressMaxIncrease:1.4,
        expToLevelBase:5, expToLevelMult:1, expToLevelIncrease:1.4,
        expertiseBase:.6,
        unlockCost:30, visible:false, unlocked:false,
        onLevelStats:[["energy", 2], ["presentation", .5], ["vitality", .5]],
        expStats:[["villagersKnown", 1], ["negotiation", 1]],
        efficiencyStats:[["haggling", .1]]
    },
    buyClothing: {
        tier:1, momentumName: "gold",
        progressMaxBase:20000, progressMaxMult:1, progressMaxIncrease:1.5,
        expToLevelBase:4, expToLevelMult:1, expToLevelIncrease:1.5,
        expertiseBase:.2,
        unlockCost:20000, visible:false, unlocked:false,
        onLevelCustom:function() {
            data.actions.fillBasicNeeds.maxLevel++
        }, //observation
        onLevelStats:[["presentation", 1], ["confidence", 1]],
        expStats:[["negotiation", .5], ["observation", 1]],
        efficiencyStats:[["haggling", .1]],
        extraInfo:{english:"Increases Fill Basic Need's max level by 1 per level."}
    },
    eatBetterFood: {
        tier:1, momentumName: "gold",
        progressMaxBase:20000, progressMaxMult:1, progressMaxIncrease:1.5,
        expToLevelBase:4, expToLevelMult:1, expToLevelIncrease:1.5,
        expertiseBase:.2,
        unlockCost:20000, visible:false, unlocked:false,
        onLevelCustom:function() {
            data.actions.fillBasicNeeds.maxLevel++
        },
        onLevelStats:[["energy", 2], ["vitality", 1]],
        expStats:[["negotiation", .5]],
        efficiencyStats:[["haggling", .1]],
        extraInfo:{english:"Increases Fill Basic Need's max level by 1 per level."}
    },

    //Socialize
    socialize: {
        tier:1,
        progressMaxBase:10, progressMaxMult:1, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelMult:1, expToLevelIncrease:1.3,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.1,
        expertiseBase:.05,
        unlockCost:30000, visible:false, unlocked:false,
        isGenerator:true, generatorTarget:"chat", generatorSpeed:20,
        onCompleteCustom: function() {
            let actionObj = data.actions.socialize;
            let actionTarget = data.actions[actionObj.generatorTarget];
            //this is the amount to remove from actionObj (1%)
            let amount = actionObj.momentum * actionObj.tierMult();
            //this is log10(1% * actionPower)^2 * efficiency
            let amountToSend = actionObj.actionPowerFunction(amount, actionObj.actionPower) * (actionObj.efficiency/100);
            //visual only
            actionObj.amountToSend = amountToSend;
            if(amountToSend > 0) { //only take if it gave
                actionObj.momentum -= amount;
            }

            addMomentumTo(actionTarget, amountToSend);

            //add exp based on amount sent
            actionObj.expToAddBase = amountToSend;
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
            document.getElementById('socializeMomentumTaken').innerText = intToString(amount, 2);
        },
        onUnlock: function() {
            unveilAction('neighborlyTies');
            unveilAction('journal');
        },
        expStats:[["wit", 1], ["grace", 1], ["tact", 1], ["insight", 1], ["trust", 1], ["influence", 1]],
        onLevelStats:[["charm", 1], ["recognition", 1], ["abilityPower", 1], ["presentation", 1]],
        efficiencyStats:[["confidence", .1]],
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
        progressMaxBase:2, progressMaxMult:1, progressMaxIncrease:1.2,
        expToLevelBase:2, expToLevelMult:1, expToLevelIncrease:1.2,
        expertiseBase:.4,
        unlockCost:5, visible:false, unlocked:false,
        onUnlock: function() {
            unveilAction('gossip');
            // unveilAction('talkToInstructorJohn');
            // unveilAction('talkToScott');
        },
        expStats:[["charm", 1], ],
        onLevelStats:[["processing", 1], ["villagersKnown", .5]],
        efficiencyStats:[["focus", .001]],
        unlockMessage:{english:"On unlock, +1 max level for Meet Village Leader Scott."}
    },
    //Socialize - Gossip
    gossip: {
        tier:1, momentumName:"conversations",
        progressMaxBase:50, progressMaxMult:1, progressMaxIncrease:1.5,
        expToLevelBase:2, expToLevelMult:1, expToLevelIncrease:1.5,
        unlockCost:50, maxLevel:10,
        visible:false, unlocked:false,
        onUnlock: function() {
            unveilAction('hearAboutTheLich');
        },
        expStats:[],
        onLevelStats:[["haggling", 1]],
        efficiencyStats:[],
    },
    hearAboutTheLich: {
        tier:1, momentumName:"fear",
        progressMaxBase:50, progressMaxMult:1, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.5,
        unlockCost:50000, maxLevel:1, visible:false, unlocked:false,
        onLevelCustom: function() {
            //enable the reset menu
        },
        expStats:[],
        onLevelStats:[["villagersKnown", 1]],
        efficiencyStats:[],
    },
    gossipAboutPrices: {
        tier:1, momentumName:"conversations",
        progressMaxBase:50, progressMaxMult:1, progressMaxIncrease:1.5,
        expToLevelBase:2, expToLevelMult:1, expToLevelIncrease:1.5,
        unlockCost:50, maxLevel:10,
        visible:false, unlocked:false, //visible:false
        onCompleteCustom:function() {
        },
        onUnlock: function() {
            unveilAction('talkAboutMarkets');
        },
        expStats:[],
        onLevelStats:[["haggling", 1]],
        efficiencyStats:[],
    },
    talkAboutMarkets: {
        tier:1, momentumName:"conversations",
        progressMaxBase:1e6, progressMaxMult:1, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.5,
        unlockCost:1e6, visible:false, unlocked:false, //visible:false
        maxLevel:10,
        onCompleteCustom:function() {
        },
        onUnlock: function() {
        },
        expStats:[],
        onLevelStats:[["haggling", 1]],
        efficiencyStats:[],
    },
    //Socialize - Scott
    talkToScott: {
        tier:1, momentumName:"conversations",
        progressMaxBase:50000, progressMaxMult:1, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.5,
        unlockCost:50000, maxLevel:10,
        visible:false, unlocked:false,
        onUnlock: function() {
            unveilAction('talkAboutVillageHistory');
            unveilAction('talkAboutCurrentIssues');
        },
        expStats:[["scottFamiliarity", 1]],
        onLevelStats:[["trust", 1]],
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
    //Socialize - John
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
    //Socialize - Local Outreach
    localOutreach: {
        tier:1, momentumName:"conversations",
        progressMaxBase:50000, progressMaxMult:1, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelMult:1, expToLevelIncrease:1.5,
        unlockCost:50000, maxLevel:50,
        visible:false, unlocked:false,
        onCompleteCustom:function() {
        },
        onUnlock: function() {
        },
        expStats:[],
        onLevelStats:[["villagersKnown", 1]],
        efficiencyStats:[],
    },

};