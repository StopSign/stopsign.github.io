function create(actionVar, downstreamVars, x, y) {
    let dataObj = actionData[actionVar];
    if(!dataObj) {
        console.log("Could not find in actionData, " + actionVar);
        return;
    }
    if(!dataObj.resourceName) {
        dataObj.resourceName = "momentum";
    }
    // x *= 420;
    // y *= -420;
    dataObj.x = x * 420;
    dataObj.y = y * -420;
    if(!dataObj.addedInVersion) {
        dataObj.addedInVersion = 0;
    }
    let title = decamelizeWithSpace(actionVar); //basicLabor -> Basic Labor
    let actionObj = createAndLinkNewAction(actionVar, dataObj, title, downstreamVars);
    // attachAttLinks(actionVar);
}

function attachAttLinks(actionVar) {
    let dataObj = actionData[actionVar];
    dataObj.expAtts.forEach(function (expAtt) { //add the action to the stat, to update exp reductions
        for(let attVar in data.atts) {
            let att = data.atts[attVar];
            if(expAtt[0] === att.attVar) {
                att.linkedActionExpAtts.push(actionVar);
            }
        }
    });
    dataObj.efficiencyAtts.forEach(function (expertiseAtt) { //add the action to the stat, to update exp reductions
        for(let attVar in data.atts) {
            let att = data.atts[attVar];
            if(expertiseAtt[0] === att.attVar) {
                att.linkedActionEfficiencyAtts.push(actionVar);
            }
        }
    });
    dataObj.onLevelAtts.forEach(function (onLevelAtt) { //add the action to the stat, to update exp reductions
        for(let attVar in data.atts) {
            let att = data.atts[attVar];
            if(onLevelAtt[0] === att.attVar) {
                att.linkedActionOnLevelAtts.push(actionVar);
            }
        }
    });
}

//==== plane0 ====

//Book 1 actions
let actionData = {
    overclock: {
        tier: 0, plane: 0,
        progressMaxBase: 10, progressMaxIncrease: 1,
        expToLevelBase: 10, expToLevelIncrease: 1.1,
        actionPowerBase: 100, actionPowerMult: 1,
        actionPowerMultIncrease: 1.1, efficiencyBase: .1,
        unlockCost: 0, visible: true, unlocked: true, purchased: true, isGenerator: true,
        generatorSpeed: 10, hasUpstream: false,
        onUnlock: function () {
        },
        onCompleteCustom: function () {
            let actionObj = data.actions.overclock;
            actionData.overclock.updateMults();
            if(isSpellReady('overcharge')) {
                useCharge('overcharge');
                if(isSpellReady('overboost')) {
                    useCharge('overboost');
                    if(isSpellReady('overdrive')) {
                        useCharge('overdrive');
                    }
                }
            }

            actionObj.resource += actionObj.resourceToAdd;

            if (data.actions.hearAboutTheLich.unlocked) {
                data.actions.hearAboutTheLich.actionPower = calcFearGain();
                data.actions.hearAboutTheLich.resource += data.actions.hearAboutTheLich.actionPower;
            }

            views.scheduleUpdate('overclockResourceSent', intToString(actionObj.resourceToAdd, 2), "textContent")
        },
        updateMults: function () {
            let spellMult = 1;
            if(isSpellReady('overcharge')) {
                spellMult *= actionData.overcharge.spellpower();
                if(isSpellReady('overboost')) {
                    spellMult *= actionData.overboost.spellpower();
                    if(isSpellReady('overdrive')) {
                        spellMult *= actionData.overdrive.spellpower();
                    }
                }
            }

            data.actions.overclock.resourceToAdd = data.actions.overclock.actionPower * data.actions.overclock.upgradeMult * spellMult;
        },
        onLevelCustom: function () {
            actionData.overclock.updateMults();
        },
        updateUpgradeMult: function () {
            let upgradeMult = 1;
            upgradeMult *= Math.pow(2, data.upgrades.createABetterFoundation.upgradePower);
            data.actions.overclock.upgradeMult = upgradeMult;
        },
        onLevelAtts: [],
        expAtts: [["awareness", 1], ["concentration", 1], ["energy", 1], ["control", 1],
            ["flow", 1], ["coordination", 1], ["integration", 1], ["rhythm", 1],
            ["pulse", 1]],
        efficiencyAtts: [["cycle", 1]],
        onCompleteText: {english:Raw.html`
                +<span style="font-weight:bold;" id="overclockResourceSent">???</span> Mana was added.<br>
                `},
    },
    reflect: {
        tier: 1, plane: 0,
        progressMaxBase: .25, progressMaxIncrease: 4,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .5, maxLevel:10,
        unlockCost:2, visible: true, unlocked: false, purchased: true,
        onUnlock: function () {
        },
        onLevelCustom: function() {
            if(data.actions.reflect.level >= 1) {
                unveilAction('distillInsight')
            }
            if(data.actions.reflect.level >= 2) {
                unveilAction('harnessOverflow')
            }
            if(data.actions.reflect.level >= 4) {
                unveilAction('takeNotes')
            }
            if(data.actions.reflect.level >= 6) {
                unveilAction('bodyAwareness')
            }
        },
        onLevelAtts: [["awareness", 10]],
        expAtts: [["concentration", 1], ["curiosity", 1]],
        efficiencyAtts: [["cycle", 1]]
    },
    distillInsight: {
        tier:1, plane:0,
        progressMaxBase:1, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.4, maxLevel:10,
        unlockCost:20, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
        },
        onLevelAtts:[["concentration", 2]],
        expAtts:[],
        efficiencyAtts:[["cycle", 1]]
    },
    harnessOverflow: {
        tier:1, plane:0,
        progressMaxBase:1, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:80, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
        },
        onLevelAtts:[["cycle", 1]],
        expAtts:[["awareness", 1], ["energy", 1]],
        efficiencyAtts:[]
    },
    takeNotes: {
        tier:1, plane:0,
        progressMaxBase:100, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.3, maxLevel:10,
        unlockCost:400, visible:false, unlocked:false, purchased: true,
        onLevelCustom:function() {
        },
        onLevelAtts:[["awareness", 30], ["curiosity", 10]],
        expAtts:[["observation", 1], ["concentration", 1]],
        efficiencyAtts:[["cycle", 1]]
    },
    bodyAwareness: {
        tier:1, plane:0,
        progressMaxBase:2000, progressMaxIncrease:20,
        expToLevelBase:2, expToLevelIncrease:1,
        efficiencyBase:.6, maxLevel:1,
        unlockCost:2000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('travelOnRoad')
            unveilAction('travelToOutpost')
            unveilAction('meetVillageLeaderScott')
        },
        onLevelAtts:[["awareness", 400]],
        expAtts:[["curiosity", 1], ["concentration", 1], ["energy", 1], ["endurance", 1]],
        efficiencyAtts:[["coordination", .5]]
    },
    remember: {
        tier:1, plane:0,
        progressMaxBase:20000, progressMaxIncrease:5,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:3,
        unlockCost:4000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            data.actions.bodyAwareness.maxLevel++;
        },
        onLevelCustom: function() {
            data.actions.harnessOverflow.maxLevel+=3;
        },
        onLevelAtts:[["concentration", 10]],
        expAtts:[["awareness", 1], ["observation", 1]], //~/50 from awareness when unlocked
        efficiencyAtts:[["cycle", 1]],
        unlockMessage:{english:"On unlock, +1 max level for Body Awareness."},
        onLevelText:{english:"+3 max levels for Harness Overflow."}
    },
    travelOnRoad: {
        tier:1, plane:0,
        progressMaxBase:1000, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.5, maxLevel:10,
        unlockCost:2000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            data.actions.bodyAwareness.maxLevel+=1;
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["energy", 5]],
        expAtts:[["concentration", 1], ["endurance", 1]],
        efficiencyAtts:[["navigation", 1]],
        unlockMessage:{english:"On unlock, +1 max level for Body Awareness."}
    },
    travelToOutpost: {
        tier:1, plane:0,
        progressMaxBase:10000, progressMaxIncrease:15,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.25, maxLevel:10,
        unlockCost:3000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction('remember');
        },
        onLevelAtts:[["energy", 30]],
        expAtts:[["endurance", 1]],
        efficiencyAtts:[["navigation", 1]],
        unlockMessage:{english:"On unlock, reveal a new action."}
    },
    meetVillageLeaderScott: {
        tier:1, plane:0,
        progressMaxBase:40000, progressMaxIncrease:40,
        expToLevelBase:5, expToLevelIncrease:2,
        efficiencyBase:.5, maxLevel:3,
        unlockCost:40000, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            data.actions.remember.maxLevel+=2
            if(data.actions.meetVillageLeaderScott.level >= 1) {
                unveilAction('watchBirds')
            }
            if(data.actions.meetVillageLeaderScott.level >= 2) {
                unveilAction('helpScottWithChores')
            }
            if(data.actions.meetVillageLeaderScott.level >= 3) {
                unveilAction('checkNoticeBoard')
            }
        },
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[["curiosity", 1], ["observation", 1]],
        efficiencyAtts:[["observation", 1]],
        onLevelText:{english:"Unlocks new actions with each level.<br>+2 max levels for Remember."},
        unlockMessage:{english:"This action gives +2 max levels per Remember."}
    },
    helpScottWithChores: {
        tier:1, plane:0,
        progressMaxBase:600000, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:4,
        wage: 1,
        unlockCost:500000, visible:false, unlocked:false, purchased: true,
        onUnlock:function() {
            unveilAction('makeMoney')
            data.displayJob = true;
            document.getElementById("jobDisplay").style.display = "";
        },
        onLevelCustom: function() {
            data.actions.helpScottWithChores.wage += actionData.helpScottWithChores.wage/4;
        },
        onLevelAtts:[["recognition", 10]],
        expAtts:[["ambition", 1]],
        efficiencyAtts:[["energy", 1]],
        onLevelText:{english:"Increase wage +25%"}
    },
    browseLocalMarket: {
        tier:1, plane:0,
        progressMaxBase:7e7, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:10,
        unlockCost:1e8, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            unveilAction('buyBasicSupplies')
            unveilAction('buyBasicClothes')
            unveilAction('buyMarketItems')
            unveilAction('buyShopItems')
        },
        onLevelAtts:[["savvy", 5], ["observation", 50]],
        expAtts:[["observation", 1], ["recognition", 1], ["confidence", 1]],
        efficiencyAtts:[["ambition", 10]]
    },
    checkNoticeBoard: {
        tier:1, plane:0,
        progressMaxBase:20e6, progressMaxIncrease:40,
        expToLevelBase:2, expToLevelIncrease:3,
        efficiencyBase:.003125, maxLevel:3, //1/320
        unlockCost:5e6, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            if(data.actions.checkNoticeBoard.level >= 1) {
                unveilAction('browseLocalMarket');
            }
            if(data.actions.checkNoticeBoard.level >= 2) {
                unveilAction('reportForTraining')
            }
            if(data.actions.checkNoticeBoard.level >= 3) {
                unveilAction('reportForLabor')
                unveilAction('oddJobsLaborer')
            }
        },
        onLevelAtts:[],
        expAtts:[["observation", 1]],
        efficiencyAtts:[["observation", 1], ["savvy", 1]],
        onLevelText:{english:"Unlocks new actions with each level."}
    },
    makeMoney: {
        tier:1, plane:0,
        progressMaxBase:10, progressMaxIncrease:1,
        expToLevelBase:100, expToLevelIncrease:1.4,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.1,
        efficiencyBase:.1,
        unlockCost:2e7, visible:false, unlocked:false, purchased: true,
        isGenerator:true, generatorTarget:"spendMoney", generatorSpeed:5,
        onCompleteCustom: function() {
            let actionObj = data.actions.makeMoney;
            actionData.makeMoney.updateMults();
            let resourceTaken = actionObj.resource * actionObj.tierMult();


            if (actionObj.resourceToAdd > 0) {
                actionObj.resource -= resourceTaken;
                addResourceTo(data.actions[actionObj.generatorTarget], actionObj.resourceToAdd);
            }

            //Adds exp right after this function
            actionObj.expToAddBase = actionObj.resourceToAdd;
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult * calcUpgradeMultToExp(actionObj);

            views.scheduleUpdate('makeMoneyResourceSent', intToString(actionObj.resourceToAdd, 2), "textContent")
            views.scheduleUpdate('makeMoneyResourceTaken', intToString(resourceTaken, 2), "textContent")
        },
        onUnlock: function() {
            unveilAction('spendMoney');
        },
        updateMults: function () {
            let actionObj = data.actions.makeMoney;
            let dataObj = actionData.makeMoney;

            let resourceTaken = actionObj.resource * actionObj.tierMult();
            actionObj.resourceToAdd = dataObj.actionPowerFunction(resourceTaken) * actionObj.actionPower * actionObj.upgradeMult;
        },
        updateUpgradeMult:function() {
            let upgradeMult = 1;
            upgradeMult *= Math.pow(2, data.upgrades.makeMoreMoney.upgradePower);
            data.actions.makeMoney.upgradeMult = upgradeMult;
        },
        onLevelAtts:[["ambition", 1]],
        expAtts:[["adaptability", 1], ["cunning", 1]],
        efficiencyAtts:[["ambition", 1]],
        actionPowerFunction: function(resource) {
            if(resource < 1) {
                return 0;
            }
            return Math.pow(resource, .5) * data.currentWage; //sqrt(num * mult) * wage
        },
        onCompleteText: {english:Raw.html`
                -<span style="font-weight:bold;" id="makeMoneyResourceTaken">???</span> Momentum was taken from this action, converted to<br>
                +<span style="font-weight:bold;" id="makeMoneyResourceSent">???</span> gold, added to Spend Money.<br>
                `},
        extraInfo: {english:Raw.html`<br>Momentum Taken = Current Momentum * Tier Mult.<br>
                        Exp & Gold gain = sqrt(Momentum Taken) * Action Power * Efficiency * Wages.`}
    },
    spendMoney: {
        tier:2, plane:0, resourceName:"gold",
        progressMaxBase:.5, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.5, maxLevel:10,
        unlockCost:10, visible:false, unlocked:false, purchased: true, hasUpstream:false,
        onUnlock:function() {
        },
        onLevelCustom:function() {
        },
        onLevelAtts:[["energy", 60]],
        expAtts:[["savvy", 1]],
        efficiencyAtts:[["ambition", 1]]
    },
    buyBasicSupplies: {
        tier:2, plane:0, resourceName: "gold",
        progressMaxBase:500, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.4, maxLevel:10,
        unlockCost:2000, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["energy", 400], ["recognition", 40]],
        expAtts:[["savvy", 1]],
        efficiencyAtts:[["ambition", 1]]
    },
    buyBasicClothes: {
        tier:2, plane:0, resourceName: "gold",
        progressMaxBase:5000, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.3, maxLevel:10,
        unlockCost:10000, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["geared", 40]],
        expAtts:[["savvy", 1]],
        efficiencyAtts:[["ambition", 1]]
    },
    buyMarketItems: {
        tier:2, plane:0, resourceName: "gold",
        progressMaxBase:5e7, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:10,
        unlockCost:1e8, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["energy", 4000]],
        expAtts:[["savvy", 1]],
        efficiencyAtts:[["ambition", 1]]
    },
    buyShopItems: {
        tier:2, plane:0, resourceName: "gold",
        progressMaxBase:5e8, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:10,
        unlockCost:5e8, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["energy", 10000], ["geared", 400]],
        expAtts:[["savvy", 1]],
        efficiencyAtts:[["ambition", 1]]
    },
    invest: {
        tier:2, plane:0, resourceName: "gold",
        progressMaxBase:5e8, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:10,
        unlockCost:5e8, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    buildFortune: {
        tier:2, plane:0, resourceName: "fortune",
        progressMaxBase:5e8, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:10,
        unlockCost:5e8, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    deepInvestments: {
        tier:2, plane:0, resourceName: "fortune",
        progressMaxBase:5e8, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:10,
        unlockCost:5e8, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    investInLocals: {
        tier:2, plane:0, resourceName: "fortune",
        progressMaxBase:5e8, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:10,
        unlockCost:5e8, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    investInRoads: {
        tier:2, plane:0, resourceName: "fortune",
        progressMaxBase:5e8, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:10,
        unlockCost:5e8, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },



    buySocialAccess: {
        tier:2, plane:0, resourceName:"gold",
        progressMaxBase:1e5, progressMaxIncrease:5,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.8, maxLevel:5,
        unlockCost:1e6, visible:false, unlocked:false, purchased: true,
        onUnlock:function() {
        },
        onLevelAtts:[["recognition", 1], ["charm", 1]],
        expAtts:[["savvy", 1]],
        efficiencyAtts:[]
    },
    slideTheCoin: {
        tier:2, plane:0, resourceName:"gold",
        progressMaxBase:1e4, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:1,
        unlockCost:1e7, visible:false, unlocked:false, purchased: true,
        onUnlock:function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["influence", 10]],
        expAtts:[["recognition", 1]],
        efficiencyAtts:[["recognition", 1]]
    },
    buyCoffee: {
        tier:2, plane:0, resourceName:"gold",
        progressMaxBase:10, progressMaxIncrease:1.2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.8, maxLevel:10,
        unlockCost:1, visible:false, unlocked:false, purchased: true,
        onUnlock:function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["cunning", 1]],
        expAtts:[["savvy", 1]],
        efficiencyAtts:[["discernment", 1]]
    },
    reportForLabor: {
        tier:1, plane:0,
        progressMaxBase:1e9, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:10,
        unlockCost:1e11, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[["coordination", 200], ["leverage", 10]],
        expAtts:[["adaptability", 1]],
        efficiencyAtts:[["adaptability", 1]]
    },
    oddJobsLaborer: {
        tier:1, plane:0,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:8,
        wage: 20,
        unlockCost:1e11, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            data.actions.oddJobsLaborer.wage += actionData.oddJobsLaborer.wage/2;
            changeJob('oddJobsLaborer');
            if(data.actions.oddJobsLaborer.level >= 2) {
                unveilAction('chimneySweep');
            }
        },
        onUnlock:function() {
            changeJob('oddJobsLaborer');
        },
        onLevelAtts:[["adaptability", 1]],
        expAtts:[],
        efficiencyAtts:[["adaptability", 1]],
        unlockMessage:{english:"On unlock, set job to Odd Jobs Laborer for a base wage of $20."},
        onLevelText:{english:"Increase wage +50%"}
    },
    chimneySweep: {
        tier:1, plane:0,
        progressMaxBase:1e12, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:8,
        wage: 100,
        unlockCost:1e13, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            data.actions.chimneySweep.wage += actionData.chimneySweep.wage/2;
            changeJob('chimneySweep');
            if(data.actions.chimneySweep.level >= 2) {
                unveilAction('handyman');
            }
        },
        onUnlock:function() {
            changeJob('chimneySweep');
        },
        onLevelAtts:[["adaptability", 2]],
        expAtts:[],
        efficiencyAtts:[["adaptability", .5]],
        unlockMessage:{english:"On unlock, set job to Chimney Sweep for a base wage of $100."},
        onLevelText:{english:"Increase wage +50%"}
    },
    handyman: {
        tier:1, plane:0,
        progressMaxBase:1e14, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:8,
        wage: 500,
        unlockCost:1e15, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            data.actions.handyman.wage += actionData.handyman.wage/2;
            changeJob('handyman');
            if(data.actions.handyman.level >= 2) {
                unveilAction('tavernHelper');
            }
        },
        onUnlock:function() {
            changeJob('handyman');
        },
        onLevelAtts:[["adaptability", 4]],
        expAtts:[],
        efficiencyAtts:[["adaptability", .3]],
        unlockMessage:{english:"On unlock, set job to Handyman for a base wage of $500."},
        onLevelText:{english:"Increase wage +50%"}
    },
    socialize: {
        tier:1, plane:0,
        progressMaxBase:10, progressMaxIncrease:1,
        expToLevelBase:3000, expToLevelIncrease:1.2,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.2,
        efficiencyBase:.05,
        unlockCost:20e6, visible:false, unlocked:false, purchased: true,
        isGenerator:true, generatorTarget:"meetPeople", generatorSpeed:20,
        onCompleteCustom: function() {
            let actionObj = data.actions.socialize;
            actionData.socialize.updateMults();
            let resourceTaken = actionObj.resource * actionObj.tierMult();

            if (actionObj.resourceToAdd > 0) {
                actionObj.resource -= resourceTaken;
                addResourceTo(data.actions[actionObj.generatorTarget], actionObj.resourceToAdd);
            }

            //Adds exp right after this function
            actionObj.expToAddBase = actionObj.resourceToAdd;
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult * calcUpgradeMultToExp(actionObj);

            views.scheduleUpdate('socializeResourceSent', intToString(actionObj.resourceToAdd, 2), "textContent")
            views.scheduleUpdate('socializeResourceTaken', intToString(resourceTaken, 2), "textContent")
        },
        updateMults: function () {
            let actionObj = data.actions.socialize;
            let dataObj = actionData.socialize;

            let resourceTaken = actionObj.resource * actionObj.tierMult();
            actionObj.resourceToAdd = dataObj.actionPowerFunction(resourceTaken) * actionObj.actionPower * actionObj.upgradeMult;
        },
        onUnlock: function() {
            // unveilAction('neighborlyTies');
            unveilAction('meetPeople');
        },
        updateUpgradeMult:function() {
            let upgradeMult = 1;
            upgradeMult *= Math.pow(2, data.upgrades.haveBetterConversations.upgradePower);
            data.actions.socialize.upgradeMult = upgradeMult;
        },
        onLevelAtts:[["confidence", 1]],
        expAtts:[["confidence", 1], ["curiosity", 1], ["observation", 1], ["recognition", 1], ["charm", 1], ["influence", 1]],
        efficiencyAtts:[["confidence", .1]],
        actionPowerFunction: function(resource) {
            if(resource < 1) {
                return 0;
            }
            return Math.pow(Math.log10(resource), 3); //log10(num * mult)^3
        },
        onCompleteText: {english:Raw.html`
                -<span style="font-weight:bold;" id="socializeResourceTaken">???</span> Momentum was taken from this action, converted to <br>
                +<span style="font-weight:bold;" id="socializeResourceSent">???</span> conversations, added to Meet People.<br>`},
        extraInfo: {english:`<br>Exp & Conversations gain = log10(Momentum/100)^3 * Action Power * Efficiency.`}
    },
    meetPeople: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:10, progressMaxIncrease:1.2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1,
        unlockCost:5, visible:false, unlocked:false, purchased: true, hasUpstream:false,
        onUnlock: function() {
            unveilAction('joinCoffeeClub');
            unveilAction('buySocialAccess');
            unveilAction('slideTheCoin');
        },
        onLevelAtts:[["recognition", 1], ["confidence", 1], ["discernment", 1]],
        expAtts:[],
        efficiencyAtts:[]
    },
    joinCoffeeClub: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:30000, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.001,
        unlockCost:50, maxLevel:1,
        visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('gossip');
            unveilAction('hearAboutTheLich');
        },
        onLevelAtts:[],
        expAtts:[["influence", 100], ["recognition", 1]],
        efficiencyAtts:[["influence", 100], ["recognition", 1]],
    },
    gossip: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:50, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1,
        unlockCost:5, maxLevel:10,
        visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function () {
        },
        onLevelAtts:[],
        expAtts:[["cunning", 10]],
        efficiencyAtts:[["discernment", 1], ["recognition", 1]],
    },
    hearAboutTheLich: {
        tier:2, plane:0, resourceName:"fear",
        progressMaxBase:200, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1,
        unlockCost:0, maxLevel:1,
        visible:false, unlocked:false, purchased: true, hasUpstream:false,
        onLevelCustom: function() {
            //Auto-shows KTL button on level via view updates
        },
        isUnlockCustom: function() {
            return data.actions.overclock.level >= 1;
        },
        onLevelAtts:[["integration", 20]],
        expAtts:[],
        efficiencyAtts:[],
        extraButton: Raw.html`
            <span class="button" id='killTheLichMenuButton2' onclick="openKTLMenu()"
                style="display:none;padding:8px 13px;position:absolute;top:330px;left:100px;border-color:black;
                background-color:#880000;text-shadow:0 0 3px #ff0000;box-shadow:0 0 15px 4px rgba(255, 0, 0, 0.5);" >
            Kill the Lich!</span>
        `,
        unlockMessage:{english:"Unlocks when Overclock is level 1."},
        extraInfo: {english:Raw.html`This action gains (Total Momentum / 1 billion * .1% of Conversations on Gossip) Fear each Overclock complete, which is a gain of
        <span style="font-weight:bold;" id="hearAboutTheLichActionPower">0</span>`}
    },

//--- From upgrades ---






};

//Shortcut pt 1
actionData = {
    ...actionData,

    watchBirds: {
        tier:1, plane:0,
        progressMaxBase:800000000, progressMaxIncrease:40,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.6, maxLevel:1,
        unlockCost:400000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('catchAScent')
        },
        onLevelAtts:[["observation", 30]],
        expAtts:[["concentration", 1], ["curiosity", 1], ["awareness", 1]],
        efficiencyAtts:[["navigation", 1]]
    },
    catchAScent: {
        tier:1, plane:0,
        progressMaxBase:1e8, progressMaxIncrease:5,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.4, maxLevel:1,
        unlockCost:5e6, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
        },
        onUnlock: function() {
            data.actions.bodyAwareness.maxLevel++;
        },
        onLevelAtts:[["observation", 120]],
        expAtts:[["curiosity", 1], ["concentration", 1]],
        efficiencyAtts:[["navigation", 1]],
        unlockMessage:{english:"On unlock, +1 max level for Body Awareness."}
    },
    questionTheTrail: {
        tier:1, plane:0,
        progressMaxBase:1e9, progressMaxIncrease:4,
        expToLevelBase:2, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:2,
        unlockCost:4e8, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            unveilAction('stepOffToExplore')
            unveilAction('eatGoldenFruit');
        },
        onUnlock: function() {
        },
        onLevelAtts:[["navigation", 2.5]],
        expAtts:[["curiosity", 1]],
        efficiencyAtts:[["navigation", 1]]
    },
    stepOffToExplore: {
        tier:1, plane:0,
        progressMaxBase:1e9, progressMaxIncrease:5,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:3,
        unlockCost:1e9, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction('climbTheRocks')
            unveilAction('spotAPath')
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["navigation", 2.5], ["flow", 5]],
        expAtts:[["endurance", 1], ["geared", 1]],
        efficiencyAtts:[["navigation", 1]]
    },
    eatGoldenFruit: {
        tier:1, plane:0,
        progressMaxBase:1e11, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.03, maxLevel:1,
        unlockCost:1e8, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
        },
        onUnlock: function () {
        },
        onLevelAtts:[["awareness", 2000], ["integration", 40]],
        expAtts:[["observation", 1], ["geared", 1], ["coordination", 1]],
        efficiencyAtts:[["curiosity", 1]]
    },
    climbTheRocks: {
        tier:1, plane:0,
        progressMaxBase:1e11, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:5,
        unlockCost:1e9, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[["concentration", 300]],
        expAtts:[["might", 1], ["geared", 1]],
        efficiencyAtts:[["navigation", 1]]
    },
    spotAPath: {
        tier:1, plane:0,
        progressMaxBase:1e12, progressMaxIncrease:3,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:1,
        unlockCost:1e9, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["navigation", 5], ["flow", 20]],
        expAtts:[["might", 1], ["geared", 1]],
        efficiencyAtts:[["integration", 1]]
    },
    standStraighter: {
        tier:1, plane:0,
        progressMaxBase:250, progressMaxIncrease:1.1,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:100,
        unlockCost:2e6, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
}

//Meditate
actionData = {
    ...actionData,

    journal: {
        tier:1, plane:0,
        progressMaxBase:2e6, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:10,
        unlockCost:1e6, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
        },
        onUnlock: function() {
            data.actions.bodyAwareness.maxLevel++;
        },
        onLevelAtts:[["awareness", 200], ["curiosity", 50]],
        expAtts:[["observation", 1], ["energy", 1]],
        efficiencyAtts:[["cycle", 1]],
        unlockMessage:{english:"On unlock, +1 max level for Body Awareness."}
    },
    meditate: { //purpose: take a while to ramp up, but slowly become the primary overclock increase for a while
        tier:1, plane:0,
        progressMaxBase:5e12, progressMaxIncrease:20, //req high initial, reduces with flow
        expToLevelBase:2, expToLevelIncrease:1,
        efficiencyBase:.004, maxLevel:1,
        unlockCost:2e10, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            // unveilAction('feelTheAche')
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["awareness", 6000], ["flow", 5]],
        expAtts:[["curiosity", 1], ["concentration", 1], ["flow", 1]],
        efficiencyAtts:[["endurance", 1]]
    },
    feelTheAche: {
        tier:1, plane:0,
        progressMaxBase:5e5, progressMaxIncrease:1.05,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:1,
        unlockCost:2e6, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction('softenTension')
        },
        onLevelCustom: function() {
            data.actions.meditate.maxLevel+=1
        },
        onLevelAtts:[["flow", 1]],
        expAtts:[],
        efficiencyAtts:[["flow", .1]],
        onLevelText:{english:"+1 max level for Meditate."}
    },
    softenTension: {
        tier:1, plane:0,
        progressMaxBase:2e5, progressMaxIncrease:1.1,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.3, maxLevel:1,
        unlockCost:2e6, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction('releaseExpectations')
        },
        onLevelCustom: function() {
            data.actions.feelTheAche.maxLevel+=1
        },
        onLevelAtts:[["flow", 2]],
        expAtts:[],
        efficiencyAtts:[["flow", .1]],
        onLevelText:{english:"+1 max level for Feel The Ache."}
    },
    releaseExpectations: {
        tier:1, plane:0,
        progressMaxBase:2e5, progressMaxIncrease:1.1,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.4, maxLevel:20,
        unlockCost:2e6, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            data.actions.softenTension.maxLevel+=1
            // unveilAction('walkAware')
            // unveilAction('readTheWritten')
            // unveilAction('standStraighter')
        },
        onLevelAtts:[["flow", 3]],
        expAtts:[],
        efficiencyAtts:[["flow", .1]],
        onLevelText:{english:"+1 max level for Soften Tension."}
    },
    walkAware: {
        tier:1, plane:0,
        progressMaxBase:250, progressMaxIncrease:1.1,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:100,
        unlockCost:2e6, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
}


//Training / Notice board level 2 / shortcut pt2
actionData = {
    ...actionData,

    reportForTraining: {
        tier:1, plane:0,
        progressMaxBase:1e6, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:5,
        unlockCost:1e8, visible:false, unlocked:false, purchased: true,
        onLevelCustom:function() {
        },
        onUnlock:function() {
            unveilAction('basicTrainingWithJohn');
        },
        onLevelAtts:[["endurance", 10], ["coordination", 5]],
        expAtts:[["coordination", 1]],
        efficiencyAtts:[["coordination", 1]]
    },
    basicTrainingWithJohn: {
        tier:1, plane:0,
        progressMaxBase:1e8, progressMaxIncrease:8,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.5, maxLevel:5,
        unlockCost:1e8, visible:false, unlocked:false, purchased: true,
        onUnlock:function() {
            unveilAction('noticeTheStrain');
            unveilAction('clenchTheJaw');
            unveilAction('breatheThroughIt');
            unveilAction('ownTheWeight');
            unveilAction('moveWithPurpose');
            data.actions.bodyAwareness.maxLevel += 6;
        },
        onLevelAtts:[["coordination", 30]],
        expAtts:[["endurance", 1], ["might", 1], ["geared", 1]],
        efficiencyAtts:[["flow", 1]],
        unlockMessage:{english:"On unlock, +6 max levels for Body Awareness."}
    },
    noticeTheStrain: {
        tier:1, plane:0,
        progressMaxBase:5e8, progressMaxIncrease:40,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:3,
        unlockCost:5e7, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["observation", 500]],
        expAtts:[["endurance", 1], ["might", 10], ["geared", 1]],
        efficiencyAtts:[["coordination", 1]]
    },
    clenchTheJaw: {
        tier:1, plane:0,
        progressMaxBase:2e11, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.04, maxLevel:2,
        unlockCost:5e7, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["endurance", 100]],
        expAtts:[["endurance", 1], ["observation", 1], ["geared", 1]],
        efficiencyAtts:[["coordination", 1]]
    },
    breatheThroughIt: {
        tier:1, plane:0,
        progressMaxBase:1e13, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.03, maxLevel:2,
        unlockCost:5e7, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["flow", 5]],
        expAtts:[["observation", 1], ["endurance", 1], ["geared", 1]],
        efficiencyAtts:[["coordination", 1]]
    },
    ownTheWeight: {
        tier:1, plane:0,
        progressMaxBase:2e9, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.0005, maxLevel:2,
        unlockCost:5e7, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["might", 50]],
        expAtts:[["geared", 1]],
        efficiencyAtts:[["flow", 1000]]
    },
    moveWithPurpose: {
        tier:1, plane:0,
        progressMaxBase:2e14, progressMaxIncrease:200,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.0005, maxLevel:2,
        unlockCost:5e7, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["endurance", 1000], ["might", 200], ["coordination", 100]],
        expAtts:[["observation", 1], ["might", 1], ["endurance", 1], ["geared", 1]],
        efficiencyAtts:[["flow", 1000]]
    },
}


//Jobs 1
actionData = {
    ...actionData,

    tavernHelper: {
        tier:1, plane:0,
        progressMaxBase:1e12, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1.2,
        efficiencyBase:.025, maxLevel:8,
        wage: 80,
        unlockCost:1e12, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            data.actions.tavernHelper.wage += actionData.tavernHelper.wage/4;
            changeJob('tavernHelper');
            if(data.actions.tavernHelper.level >= 2) {
                unveilAction('guildReceptionist');
            }
        },
        onUnlock:function() {
            changeJob('tavernHelper');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        unlockMessage:{english:"On unlock, set job to tavernHelper for a base wage of $1.25m."}
    },
    guildReceptionist: {
        tier:1, plane:0,
        progressMaxBase:1e15, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1.2,
        efficiencyBase:.0125, maxLevel:8,
        wage: 160,
        unlockCost:1e15, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            data.actions.guildReceptionist.wage += actionData.guildReceptionist.wage/4;
            changeJob('guildReceptionist');
            if(data.actions.guildReceptionist.level >= 2) {
                unveilAction('messenger');
            }
        },
        onUnlock:function() {
            changeJob('guildReceptionist');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        unlockMessage:{english:"On unlock, set job to guildReceptionist for a base wage of $100m."}
    },
    messenger: {
        tier:1, plane:0,
        progressMaxBase:1e18, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1.2,
        efficiencyBase:.00625, maxLevel:8,
        wage: 350,
        unlockCost:1e18, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            data.actions.messenger.wage += actionData.messenger.wage/4;
            changeJob('messenger');
            if(data.actions.messenger.level >= 2) {
                unveilAction('townCrier');
            }
        },
        onUnlock:function() {
            changeJob('messenger');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        unlockMessage:{english:"On unlock, set job to messenger for a base wage of $5b."}
    },
    townCrier: {
        tier:1, plane:0,
        progressMaxBase:1e21, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1.2,
        efficiencyBase:.003, maxLevel:8,
        wage: 700,
        unlockCost:1e21, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            data.actions.townCrier.wage += actionData.townCrier.wage/4;
            changeJob('townCrier');
            if(data.actions.townCrier.level >= 2) {
                unveilAction('storyTeller');
            }
        },
        onUnlock:function() {
            changeJob('townCrier');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        unlockMessage:{english:"On unlock, set job to townCrier for a base wage of $250b."}
    },
    storyTeller: {
        tier:1, plane:0,
        progressMaxBase:5e23, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1.2,
        efficiencyBase:.0015, maxLevel:8,
        wage: 1500,
        unlockCost:5e24, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            data.actions.storyTeller.wage += actionData.storyTeller.wage/4;
            changeJob('storyTeller');
        },
        onUnlock:function() {
            changeJob('storyTeller');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        unlockMessage:{english:"On unlock, set job to storyTeller for a base wage of $20t."}
    },
}


//TODO..
actionData = {
    ...actionData,

    readTheWritten: {
        tier:1, plane:0,
        progressMaxBase:10000000, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.05,
        unlockCost:50000000, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
        },
        onUnlock: function() {
        },
        onLevelAtts:[["awareness", 1000], ["curiosity", 500]],
        expAtts:[["observation", 1], ["energy", 1]],
        efficiencyAtts:[["cycle", 1]]
    },
    siftExcess: { //? dunno the purpose yet
        tier:1, plane:0,
        progressMaxBase:100000, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.01,
        unlockCost:500000, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
        },
        onLevelAtts:[["cycle", 100]],
        expAtts:[["observation", 1]],
        efficiencyAtts:[]
    },

    gossipAboutPrices: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:50, progressMaxIncrease:1.5,
        expToLevelBase:2, expToLevelIncrease:1.5,
        unlockCost:50, maxLevel:10,
        visible:false, unlocked:false, purchased: true,
        onCompleteCustom:function() {
        },
        onUnlock: function() {
            unveilAction('talkAboutMarkets');
        },
        expAtts:[],
        onLevelAtts:[["haggling", 1]],
        efficiencyAtts:[],
    },
    talkAboutMarkets: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:1e6, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelIncrease:1.5,
        unlockCost:1e6, visible:false, unlocked:false, purchased: true,
        maxLevel:10,
        onCompleteCustom:function() {
        },
        onUnlock: function() {
        },
        expAtts:[],
        onLevelAtts:[["haggling", 1]],
        efficiencyAtts:[],
    },
    //Socialize - Scott
    talkToScott: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:50000, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelIncrease:1.5,
        unlockCost:50000, maxLevel:10,
        visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
            unveilAction('talkAboutVillageHistory');
            unveilAction('talkAboutCurrentIssues');
        },
        expAtts:[["scottFamiliarity", 1]],
        onLevelAtts:[["trust", 1]],
        efficiencyAtts:[],
    },
    talkAboutVillageHistory: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:50000, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:3,
        unlockCost:50000, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["villagersKnown", 1]],
        expAtts:[],
        efficiencyAtts:[],
    },
    talkAboutCurrentIssues: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:50000, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelIncrease:1.5,
        unlockCost:50000, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["villagersKnown", 1]],
        expAtts:[],
        efficiencyAtts:[],
    },
    //Socialize - John
    talkToInstructorJohn: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:50000, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelIncrease:1.5,
        unlockCost:50000, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["villagersKnown", 1]],
        expAtts:[],
        efficiencyAtts:[],
    },
    //Socialize - Local Outreach
    localOutreach: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:50000, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelIncrease:1.5,
        unlockCost:50000, maxLevel:50,
        visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["villagersKnown", 1]],
        expAtts:[],
        efficiencyAtts:[],
    },
}


//==== plane1 ====
actionData = {
    ...actionData,

    overclockTargetingTheLich: {
        tier:1, plane:1,
        progressMaxBase:60, progressMaxIncrease:1,
        expToLevelBase:60, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true,
        unlockCost:0, visible:true, unlocked:true, isGenerator:true, generatorSpeed:1,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    killHorde: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:10,
        expToLevelBase:5, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:2,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 10;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.ancientCoin += 2 * (1 +  data.actions.killHorde.level);
        },
        onLevelCustom: function() {
            unveilAction('killElites');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"Gives 2 * (1 + level) Ancient Coin per complete."},
        unlockMessage:{english:"On unlock, +10 Ancient Coin."}
    },
    killElites: {
        tier:1, plane:1,
        progressMaxBase:1e13, progressMaxIncrease:10,
        expToLevelBase:5, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:2,
        unlockCost:1e12, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 30;
        },
        onCompleteCustom:function() {
            data.ancientCoin += 6 * (1 +  data.actions.killHorde.level);
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"Gives 6 * (1 + level) Ancient Coin per complete."},
        unlockMessage:{english:"On unlock, +30 Ancient Coin."}
    },
    killDevils: {
        tier:1, plane:1,
        progressMaxBase:1e16, progressMaxIncrease:10,
        expToLevelBase:5, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:2,
        unlockCost:1e12, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 100;
        },
        onCompleteCustom:function() {
            data.ancientCoin += 20 * (1 +  data.actions.killHorde.level);
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"Gives 20 * (1 + level) Ancient Coin per complete."},
        unlockMessage:{english:"On unlock, +100 Ancient Coin."}
    },
    killGenerals: {
        tier:1, plane:1,
        progressMaxBase:10, progressMaxIncrease:1.2,
        expToLevelBase:1, expToLevelIncrease:1.2,
        efficiencyBase:1, isKTL:true, purchased: true,
        unlockCost:10, visible:true, unlocked:false,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
}

//==== plane2 ====
actionData = {
    ...actionData,

    echoKindle: {
        tier:0, plane:2, resourceName:"legacy",
        progressMaxBase:2, progressMaxIncrease:1,
        expToLevelBase:.5, expToLevelIncrease:1.3,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.1,
        efficiencyBase:.25,
        unlockCost:0, visible:true, unlocked:true, purchased: true, hasDeltas: false,
        isGenerator:true, generatorTarget:"sparkMana", generatorSpeed:1,
        onCompleteCustom: function() {
            let actionObj = data.actions.echoKindle;
            actionData.echoKindle.updateMults();

            addResourceTo(data.actions[actionObj.generatorTarget], actionObj.resourceToAdd);

            //Adds exp right after this function
            actionObj.expToAddBase = actionObj.resourceToAdd;
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult * calcUpgradeMultToExp(actionObj);


            views.scheduleUpdate('echoKindleResourceSent', intToString(actionObj.resourceToAdd, 2), "textContent")
        },
        updateMults: function () {
            let actionObj = data.actions.echoKindle;
            let dataObj = actionData.echoKindle;

            let resourceTaken = actionObj.resource * actionObj.tierMult();
            actionObj.resourceToAdd = dataObj.actionPowerFunction(resourceTaken) * actionObj.actionPower * actionObj.upgradeMult;
        },
        actionPowerFunction: function(resource) {
            if(resource < 1) {
                return 0;
            }
            return Math.pow(resource, .5);
        },
        onLevelAtts:[["spark", 2]],
        expAtts:[["vision", 1]],
        efficiencyAtts:[["pulse", 1]],
        onCompleteText: {english:Raw.html`
                +<span style="font-weight:bold;" id="echoKindleResourceSent">???</span> Mana was added to Spark Mana.<br>
                `},
        extraInfo: {english:Raw.html`Exp & Mana gain = sqrt(Legacy) * Action Power * Efficiency.`}
    },
    sparkMana: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:10, progressMaxIncrease:4,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1,
        unlockCost:5, visible:true, unlocked:false, purchased: true, hasUpstream:false,
        onUnlock: function() {
            unveilAction('poolMana');
            data.actions.poolMana.generatorSpeed = 2;
            unveilAction('expelMana')
        },
        onLevelAtts:[["spark", 10]],
        expAtts:[["amplification", 1]],
        efficiencyAtts:[["spark", -1]]
    },
    poolMana: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:120, progressMaxIncrease:1,
        expToLevelBase:10, expToLevelIncrease:3,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.03,
        efficiencyBase:.5,
        unlockCost:0, visible:false, unlocked:true, purchased: true, hasDeltas: false, hasUpstream:false,
        isGenerator:true, generatorTarget:"poolMana", generatorSpeed:0,
        onCompleteCustom: function() {
            let sparkManaObj = data.actions.sparkMana;
            let actionObj = data.actions.poolMana;
            let dataObj = actionData.poolMana;
            dataObj.updateMults();

            addResourceTo(data.actions[dataObj.generatorTarget], actionObj.resourceToAdd);

            actionObj.expToAddBase = actionObj.resourceToAdd;
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult * calcUpgradeMultToExp(actionObj);

            views.scheduleUpdate('poolManaResourceTaken', intToString(sparkManaObj.resource, 2), "textContent")
            views.scheduleUpdate('poolManaResourceSent', intToString(actionObj.resourceToAdd, 2), "textContent")

            sparkManaObj.resource = 0;
        },
        updateMults: function () {
            let actionObj = data.actions.poolMana;

            actionObj.resourceToAdd = data.actions.sparkMana.resource * actionObj.actionPower * actionObj.upgradeMult;
        },
        onUnlock: function() {
        },
        onLevelAtts:[["pulse", 1]],
        expAtts:[["amplification", 1]],
        efficiencyAtts:[["amplification", .1]],
        onCompleteText: {english:Raw.html`
                -<span style="font-weight:bold;" id="poolManaResourceTaken">???</span> Mana was taken from Spark Mana, converted to<br>
                +<span style="font-weight:bold;" id="poolManaResourceSent">???</span> Mana, added to this action.<br>
                `},
        extraInfo: {english:Raw.html`Exp & Mana gain = sqrt(Legacy) * Action Power * Efficiency.`}
    },
    expelMana: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.8,
        unlockCost:3, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction("manaImprovement")
            unveilAction("magicResearch")
            unveilAction("manaExperiments")
            unveilAction("prepareSpells")
            unveilAction("preparePhysicalSpells")
        },
        onLevelAtts:[["amplification", 3]],
        expAtts:[],
        efficiencyAtts:[["integration", .5]]
    },
    prepareSpells: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:2, progressMaxIncrease:9,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.7, maxLevel:9,
        unlockCost:5, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction("overcharge")
        },
        onLevelAtts:[["amplification", 6]],
        expAtts:[],
        efficiencyAtts:[["integration", .5]]
    },
    preparePhysicalSpells: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:6, progressMaxIncrease:9,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.6, maxLevel:9,
        unlockCost:5, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction("overboost")
        },
        onLevelAtts:[["amplification", 9]],
        expAtts:[],
        efficiencyAtts:[["integration", .5]]
    },
    overcharge: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:5, progressMaxIncrease:1,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.4, maxLevel:1, isSpell:true, cooldown:5,
        unlockCost:5, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction("overdrive");
        },
        spellpower: function() {
            return 25 * (data.actions.overcharge.efficiency/100);
        },
        onLevelAtts:[],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["vision", .1]],
        extraInfo: {english:Raw.html`If a charge is available, the next Overclock will give x25 * efficiency momentum (this does not affect exp).`}
    },
    overboost: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:1, isSpell:true, cooldown:20,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        spellpower: function() {
            return 25 * (data.actions.overboost.efficiency/100);
        },
        onLevelAtts:[],
        expAtts:[["wizardry", .1]],
        efficiencyAtts:[["vision", .1]]
    },
    overdrive: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:1, isSpell:true, cooldown:100,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        spellpower: function() {
            return 25 * (data.actions.overdrive.efficiency/100);
        },
        onLevelAtts:[],
        expAtts:[["archmagery", .1]],
        efficiencyAtts:[["vision", .1]]
    },
    manaImprovement: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:20, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:3,
        unlockCost:50, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction("feelYourMana")
            unveilAction("manaObservations")
            unveilAction("infuseTheHide")
        },
        onLevelAtts:[["spark", 10], ["amplification", 5]],
        expAtts:[],
        efficiencyAtts:[]
    },
    manaExperiments: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:100, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:9,
        unlockCost:200, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction("manaVisualizations")
            unveilAction("growMagicSenses")
        },
        onLevelAtts:[["amplification", 25], ["vision", 1]],
        expAtts:[],
        efficiencyAtts:[]
    },
    magicResearch: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:400, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:9,
        unlockCost:200, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction("etchTheCircle")
        },
        onLevelAtts:[["vision", 2], ["spark", 10], ["integration", 5]],
        expAtts:[],
        efficiencyAtts:[]
    },
    manaObservations: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:400, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:9,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction("manaShaping")
        },
        onLevelAtts:[["vision", 5]],
        expAtts:[],
        efficiencyAtts:[]
    },
    feelYourMana: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:400, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:9,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction("listenToTheMana");
        },
        onLevelAtts:[["amplification", 60]],
        expAtts:[],
        efficiencyAtts:[]
    },
    infuseTheHide: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:200, progressMaxIncrease:1,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:2,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction("bindThePages")
        },
        onLevelAtts:[["vision", 10]],
        expAtts:[["amplification", 1]],
        efficiencyAtts:[]
    },
    etchTheCircle: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:150, progressMaxIncrease:1,
        expToLevelBase:9, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:1,
        unlockCost:2000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction("awakenYourGrimoire")
        },
        onLevelAtts:[["vision", 60]],
        expAtts:[["amplification", 1]],
        efficiencyAtts:[]
    },
    bindThePages: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:100, progressMaxIncrease:1.01,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:100,
        unlockCost:3000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[["vision", 1]],
        expAtts:[["amplification", 1]],
        efficiencyAtts:[]
    },
    awakenYourGrimoire: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:1,
        unlockCost:8000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[["amplification", 1]],
        efficiencyAtts:[]
    },

    manaVisualizations: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },

    manaShaping: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },


    growMagicSenses: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[["amplification", 20]],
        expAtts:[],
        efficiencyAtts:[]
    },

    listenToTheMana: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },

    manaInstinct: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },

    auraControl: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:10000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[["control", 10]],
        expAtts:[],
        efficiencyAtts:[]
    },

    prepareDungeonSpells: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },

    supportSpells: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },

    divination: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },

    identifyItem: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },

    detectMagic: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },

    practicalMagic: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },

    manaTransfer: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },

    illuminate: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },

    unblemish: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },

    recoverSpells: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },

    earthMagic: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },

    moveEarth: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },

    shelter: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },

    reinforceArmor: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },

    sharpenWeapons: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },

    repairEquipment: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },

    restoreEquipment: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },

    healingMagic: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },

    singleTargetHealing: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },

    purifyPoison: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },

    massHeal: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },

    auraHealing: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },

    healBurst: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    combatSpells: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    swarmSpells: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    fireball: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    wardMagic: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    ward: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    duellingSpells: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    firebolt: {
        tier:1, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },


}

//==== plane3 ====
actionData = {
    ...actionData,

    absorbStarseed: {
        tier:1, plane:3,
        progressMaxBase:60, progressMaxIncrease:1,
        expToLevelBase:60, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true,
        unlockCost:0, visible:true, unlocked:true, isGenerator:true, generatorSpeed:1,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
}
