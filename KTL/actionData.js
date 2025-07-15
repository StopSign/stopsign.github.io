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
    dataObj.x = x * 430;
    dataObj.y = y * -430;
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
                data.actions.hearAboutTheLich.resourceToAdd = data.actions.hearAboutTheLich.actionPower
                data.actions.hearAboutTheLich.resource += data.actions.hearAboutTheLich.resourceToAdd;
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
            ["flow", 1], ["coordination", 1], ["integration", 1], ["rhythm", .01],
            ["pulse", .01]],
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
        onLevelAtts:[["awareness", 100]],
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
        expAtts:[["concentration", 1], ["endurance", 1], ["geared", 1]],
        efficiencyAtts:[["navigation", 1]],
        unlockMessage:{english:"On unlock, +1 max level for Body Awareness."}
    },
    travelToOutpost: {
        tier:1, plane:0,
        progressMaxBase:10000, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.25, maxLevel:10,
        unlockCost:3000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction('remember');
        },
        onLevelAtts:[["energy", 30]],
        expAtts:[["endurance", 1], ["geared", 1]],
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
            data.actions.remember.maxLevel++
        },
        onLevelAtts:[],
        expAtts:[["curiosity", 1], ["observation", 1]],
        efficiencyAtts:[["observation", 1]],
        onLevelText:{english:"Unlocks new actions with each level.<br>+2 max levels for Remember."},
        unlockMessage:{english:"On unlock, +1 max level for Remember.<br> In addition, +2 max levels for Remember when this action levels."}
    },
    helpScottWithChores: {
        tier:1, plane:0,
        progressMaxBase:6000000, progressMaxIncrease:2,
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
            data.actions.helpScottWithChores.wage += actionData.helpScottWithChores.wage/2;
        },
        onLevelAtts:[["recognition", 10]],
        expAtts:[["ambition", 1]],
        efficiencyAtts:[["energy", 1]],
        onLevelText:{english:"Increase wage +50%"}
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
        expAtts:[["observation", 1], ["recognition", 1]],
        efficiencyAtts:[["ambition", 10]]
    },
    browseStores: {
        tier:1, plane:0,
        progressMaxBase:1e19, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:10,
        unlockCost:100e15, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
        },
        onUnlock: function() {
        },
        onLevelAtts:[["savvy", 250], ["observation", 3000]],
        expAtts:[["recognition", 1], ["confidence", 1]],
        efficiencyAtts:[["ambition", 1]]
    },
    browseBackrooms: {
        tier:1, plane:0,
        progressMaxBase:1e21, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:10,
        unlockCost:2e18, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
        },
        onLevelAtts:[["savvy", 500], ["cunning", 20]],
        expAtts:[["recognition", 1], ["confidence", 1]],
        efficiencyAtts:[["ambition", .5]]
    },
    browsePersonalCollection: {
        tier:1, plane:0,
        progressMaxBase:7e7, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:10,
        unlockCost:1e8, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
        },
        onLevelAtts:[["savvy", 1000], ["observation", 5000]],
        expAtts:[["recognition", 1], ["confidence", 1]],
        efficiencyAtts:[["ambition", .1]]
    },
    checkNoticeBoard: {
        tier:1, plane:0,
        progressMaxBase:60e6, progressMaxIncrease:40,
        expToLevelBase:2, expToLevelIncrease:3,
        efficiencyBase:.003125, maxLevel:3, //1/320
        unlockCost:10e6, visible:false, unlocked:false, purchased: true,
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
                unveilAction('chimneySweep');
            }
        },
        onLevelAtts:[],
        expAtts:[["observation", 1]],
        efficiencyAtts:[["observation", 1], ["savvy", 1], ["vision", .1]],
        onLevelText:{english:"Unlocks new actions with each level."}
    },
    makeMoney: {
        tier:1, plane:0,
        progressMaxBase:10, progressMaxIncrease:1,
        expToLevelBase:100, expToLevelIncrease:2,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.1,
        efficiencyBase:.1,
        unlockCost:1e7, visible:false, unlocked:false, purchased: true,
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
        unlockCost:50, visible:false, unlocked:false, purchased: true, hasUpstream:false,
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
    buyTravelersClothes: {
        tier:2, plane:0, resourceName: "gold",
        progressMaxBase:5e6, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:3,
        unlockCost:2e7, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["geared", 400]],
        expAtts:[["savvy", 1]],
        efficiencyAtts:[["ambition", 1]]
    },
    buyMarketItems: {
        tier:2, plane:0, resourceName: "gold",
        progressMaxBase:5e6, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:10,
        unlockCost:5e7, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["energy", 4000], ["recognition", 60]],
        expAtts:[["savvy", 1]],
        efficiencyAtts:[["ambition", 1]]
    },
    buyShopItems: {
        tier:2, plane:0, resourceName: "gold",
        progressMaxBase:5e9, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:10,
        unlockCost:5e10, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["energy", 10000], ["geared", 1000], ["recognition", 80]],
        expAtts:[["savvy", 1]],
        efficiencyAtts:[["ambition", 1]]
    },
    buySocialAccess: {
        tier:2, plane:0, resourceName:"gold",
        progressMaxBase:5e11, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:10,
        unlockCost:2e12, visible:false, unlocked:false, purchased: true,
        onUnlock:function() {
        },
        onLevelAtts:[["recognition", 100], ["charm", 10]],
        expAtts:[["savvy", 1]],
        efficiencyAtts:[["confidence", 1]]
    },
    buyStreetFood: {
        tier:2, plane:0, resourceName: "gold",
        progressMaxBase:5e15, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:10,
        unlockCost:2e15, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["energy", 60000], ["recognition", 400]],
        expAtts:[["savvy", 1]],
        efficiencyAtts:[["confidence", 1]]
    },
    buyGoodFood: {
        tier:2, plane:0, resourceName: "gold",
        progressMaxBase:5e18, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:10,
        unlockCost:2e18, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["energy", 150000]],
        expAtts:[["savvy", 1]],
        efficiencyAtts:[["confidence", .5]]
    },
    buyMatchingClothes: {
        tier:2, plane:0, resourceName: "gold",
        progressMaxBase:5e15, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:10,
        unlockCost:2e15, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["recognition", 600], ["confidence", 5]],
        expAtts:[["savvy", 1]],
        efficiencyAtts:[["confidence", 1]]
    },
    buyStylishClothes: {
        tier:2, plane:0, resourceName: "gold",
        progressMaxBase:5e18, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:10,
        unlockCost:2e18, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["recognition", 2000], ["confidence", 5], ["discernment", 10]],
        expAtts:[["savvy", 1]],
        efficiencyAtts:[["confidence", .5]]
    },
    slideTheCoin: {
        tier:2, plane:0, resourceName:"gold",
        progressMaxBase:5e16, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:1,
        unlockCost:4e15, visible:false, unlocked:false, purchased: true,
        onUnlock:function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["influence", 40]],
        expAtts:[["savvy", 1]],
        efficiencyAtts:[["recognition", .001]]
    },
    buyCoffee: {
        tier:2, plane:0, resourceName:"gold",
        progressMaxBase:5e17, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:10,
        unlockCost:2e16, visible:false, unlocked:false, purchased: true,
        onUnlock:function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["charm", 2000], ["recognition", 200], ["influence", 120]],
        expAtts:[["savvy", 1]],
        efficiencyAtts:[["recognition", .001]]
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



    reportForLabor: {
        tier:1, plane:0,
        progressMaxBase:1e9, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:10,
        unlockCost:1e11, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction('exploreDifficultPath')
            unveilAction('buyTravelersClothes')
        },
        onLevelAtts:[["coordination", 200]],
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
        },
        onUnlock:function() {
            changeJob('oddJobsLaborer');
        },
        onLevelAtts:[["adaptability", 1]],
        expAtts:[],
        efficiencyAtts:[["adaptability", 1]],
        unlockMessage:{english:"On unlock, set job to Odd Jobs Laborer for a base wage of $20."},
        onLevelText:{english:"Increase wage +50%."}
    },
    chimneySweep: {
        tier:1, plane:0,
        progressMaxBase:1e13, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:8,
        wage: 100,
        unlockCost:1e13, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            data.actions.chimneySweep.wage += actionData.chimneySweep.wage/2;
            changeJob('chimneySweep');
        },
        onUnlock:function() {
            changeJob('chimneySweep');
        },
        onLevelAtts:[["adaptability", 2]],
        expAtts:[],
        efficiencyAtts:[["adaptability", .5]],
        unlockMessage:{english:"On unlock, set job to Chimney Sweep for a base wage of $100."},
        onLevelText:{english:"Increase wage +50%."}
    },
    handyman: {
        tier:1, plane:0,
        progressMaxBase:1e15, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:8,
        wage: 2000,
        unlockCost:1e15, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            data.actions.handyman.wage += actionData.handyman.wage/2;
            changeJob('handyman');
        },
        onUnlock:function() {
            changeJob('handyman');
        },
        onLevelAtts:[["adaptability", 4]],
        expAtts:[],
        efficiencyAtts:[["adaptability", .3]],
        unlockMessage:{english:"On unlock, set job to Handyman for a base wage of $2000."},
        onLevelText:{english:"Increase wage +50%"}
    },
    tavernHelper: {
        tier:1, plane:0,
        progressMaxBase:1e17, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:8,
        wage: 20000,
        unlockCost:2e17, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            data.actions.tavernHelper.wage += actionData.tavernHelper.wage/2;
            changeJob('tavernHelper');
        },
        onUnlock:function() {
            changeJob('tavernHelper');
        },
        onLevelAtts:[["adaptability", 8], ["discernment", 10], ["confidence", 3]],
        expAtts:[],
        efficiencyAtts:[["adaptability", .1]],
        unlockMessage:{english:"On unlock, set job to Tavern Helper for a base wage of $20000."},
        onLevelText:{english:"Increase wage +50%"}
    },
    socialize: {
        tier:1, plane:0,
        progressMaxBase:15, progressMaxIncrease:1,
        expToLevelBase:100, expToLevelIncrease:1.4,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.1,
        efficiencyBase:.05,
        unlockCost:1e15, visible:false, unlocked:false, purchased: true,
        isGenerator:true, generatorTarget:"meetPeople", generatorSpeed:5,
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
        expAtts:[["confidence", 1], ["recognition", 1], ["charm", 1], ["influence", 1]],
        efficiencyAtts:[["confidence", .1]],
        actionPowerFunction: function(resource) {
            if(resource < 1e12) {
                return 0;
            }
            return Math.pow(resource/1e12, .5); //sqrt(num * mult) * wage
        },
        onCompleteText: {english:Raw.html`
                -<span style="font-weight:bold;" id="socializeResourceTaken">???</span> Momentum was taken from this action, converted to <br>
                +<span style="font-weight:bold;" id="socializeResourceSent">???</span> conversations, added to Meet People.<br>`},
        extraInfo: {english:`<br>Momentum Taken = Current Momentum * Tier Mult.<br>
                        Exp & Conversations gain = sqrt(Momentum Taken/1e12) * Action Power * Efficiency.<br>
                        Requires 1e12 Momentum Taken to function.`}
    },
    meetPeople: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:1, progressMaxIncrease:1.5,
        expToLevelBase:50, expToLevelIncrease:1,
        efficiencyBase:.5, maxLevel:50,
        unlockCost:.5, visible:false, unlocked:false, purchased: true, hasUpstream:false,
        onUnlock: function() {
            // unveilAction('joinCoffeeClub');
            unveilAction('buySocialAccess');
            // unveilAction('slideTheCoin');
            unveilAction('talkWithScott');
        },
        onLevelAtts:[["recognition", 30]],
        expAtts:[["charm", 1]],
        efficiencyAtts:[["confidence", .1]]
    },
    joinCoffeeClub: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:3000000000, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.00001,
        unlockCost:20000, maxLevel:1,
        visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('gossipAroundCoffee');
        },
        onLevelAtts:[],
        expAtts:[["influence", 100], ["recognition", 1]],
        efficiencyAtts:[["influence", 100], ["recognition", .01]],
    },
    gossipAroundCoffee: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:1e6, progressMaxIncrease:20,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1,
        unlockCost:400000, maxLevel:10,
        visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction('hearAboutTheLich');
        },
        onLevelCustom: function () {
            unveilAction('hearAboutTheLich');
        },
        onLevelAtts:[["discernment", 10]],
        expAtts:[["cunning", 10]],
        efficiencyAtts:[["discernment", .5]],
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
            unveilPlane(0);
            unveilPlane(1);
        },
        isUnlockCustom: function() {
            return data.actions.gossipAroundCoffee.level >= 1;
        },
        updateMults: function() {
            data.actions.hearAboutTheLich.resourceToAdd = calcFearGain();
        },
        onLevelAtts:[["integration", 200]],
        expAtts:[],
        efficiencyAtts:[],
        extraButton: Raw.html`
            <span class="button" id='killTheLichMenuButton2' onclick="openKTLMenu()"
                style="display:none;padding:8px 13px;position:absolute;top:330px;left:100px;border-color:black;
                background-color:#880000;text-shadow:0 0 3px #ff0000;box-shadow:0 0 15px 4px rgba(255, 0, 0, 0.5);" >
            Kill the Lich!</span>
        `,
        unlockMessage:{english:"Unlocks when Gossip is level 1."},
        extraInfo: {english:Raw.html`This action gains (Total Momentum / 1e20 * .1% of Conversations on Gossip) Fear for each Overclock complete, which is a gain of
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
        efficiencyBase:.5, maxLevel:1,
        unlockCost:5e6, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
        },
        onUnlock: function() {
            data.actions.bodyAwareness.maxLevel+=3;
        },
        onLevelAtts:[["observation", 120]],
        expAtts:[["curiosity", 1], ["concentration", 1]],
        efficiencyAtts:[["navigation", 1]],
        unlockMessage:{english:"On unlock, +3 max level for Body Awareness."}
    },
    exploreDifficultPath: {
        tier:1, plane:0,
        progressMaxBase:2e13, progressMaxIncrease:20,
        expToLevelBase:2, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:2,
        unlockCost:1e12, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            unveilAction('keepGoing')
            unveilAction('eatGoldenFruit');
        },
        onUnlock: function() {
        },
        onLevelAtts:[["navigation", 2]],
        expAtts:[["geared", 1]],
        efficiencyAtts:[["navigation", 1], ["geared", .01]]
    },
    eatGoldenFruit: {
        tier:2, plane:0,
        progressMaxBase:1e11, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:1,
        unlockCost:5e11, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
        },
        onUnlock: function () {
        },
        onLevelAtts:[["awareness", 1000], ["integration", 40]],
        expAtts:[],
        efficiencyAtts:[]
    },
    keepGoing: {
        tier:1, plane:0,
        progressMaxBase:2e14, progressMaxIncrease:5,
        expToLevelBase:2, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:2,
        unlockCost:5e12, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction('climbTheRocks')
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["navigation", 3], ["flow", 5]],
        expAtts:[["geared", 1]],
        efficiencyAtts:[["geared", .01]]
    },
    climbTheRocks: {
        tier:1, plane:0,
        progressMaxBase:4e14, progressMaxIncrease:1,
        expToLevelBase:2, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:5,
        unlockCost:1e13, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            if(data.actions.climbTheRocks.level >= 5) {
                unveilAction('spotAPath')
            }
        },
        onLevelAtts:[["concentration", 100]],
        expAtts:[["geared", 1]],
        efficiencyAtts:[["geared", .01]]
    },
    spotAPath: {
        tier:1, plane:0,
        progressMaxBase:1e16, progressMaxIncrease:3,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:1,
        unlockCost:3e13, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('pleasantForest')
        },
        onLevelAtts:[["navigation", 20], ["flow", 20]],
        expAtts:[["geared", 1], ["vision", .1]],
        efficiencyAtts:[["integration", 1], ["vision", .1], ["geared", .01]]
    },
    pleasantForest: {
        tier:1, plane:0,
        progressMaxBase:2e16, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:10,
        unlockCost:1e15, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction('hiddenPath')
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["observation", 2000]],
        expAtts:[["endurance", 1]],
        efficiencyAtts:[["curiosity", .01]]
    },
    hiddenPath: {
        tier:1, plane:0,
        progressMaxBase:2e19, progressMaxIncrease:5,
        expToLevelBase:7, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:5,
        unlockCost:5e14, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction('exploreTheForest')
            unveilAction('meetGrumpyHermit')
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["concentration", 500]],
        expAtts:[["observation", 1], ["geared", 1]],
        efficiencyAtts:[]
    },
    meetGrumpyHermit: {
        tier:1, plane:0,
        progressMaxBase:4e18, progressMaxIncrease:40,
        expToLevelBase:4, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:1,
        unlockCost:2e14, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction('socialize');
        },
        onLevelCustom: function() {
            unveilAction('annoyHermitIntoAQuest')
            if(data.actions.meetGrumpyHermit.level >= 2) {
                unveilAction('talkToHermit');
            }
        },
        onLevelAtts:[["flow", 80]],
        expAtts:[["curiosity", 1], ["observation", 1]],
        efficiencyAtts:[["confidence", 1000]],
        unlockMessage:{english:"On unlock and level, reveal a new action."}
    },
    exploreTheForest: {
        tier:1, plane:0,
        progressMaxBase:2e16, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:3e15, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction('travelAlongTheRiver')
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["curiosity", 200]],
        expAtts:[["endurance", 1]],
        efficiencyAtts:[]
    },
    annoyHermitIntoAQuest: {
        tier:1, plane:0,
        progressMaxBase:3e15, progressMaxIncrease:1,
        expToLevelBase:100, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:1,
        unlockCost:2e15, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('travelAlongTheRiver')
            unveilAction('gatherRiverWeeds')
        },
        onLevelAtts:[["concentration", 2000]],
        expAtts:[["curiosity", 1]],
        efficiencyAtts:[]
    },
    presentTheOffering: {
        tier:1, plane:0,
        progressMaxBase:10e15, progressMaxIncrease:1.05,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:100,
        unlockCost:40e15, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            data.actions.meetGrumpyHermit.maxLevel++;
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["control", 1]],
        expAtts:[["control", 1]],
        efficiencyAtts:[],
        unlockMessage:{english:"On unlock, +1 max level for Meet Grumpy Hermit."}
    },
    talkToHermit: {
        tier:1, plane:0,
        progressMaxBase:100e17, progressMaxIncrease:1,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.00001, maxLevel:1,
        unlockCost:100e15, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction('chatWithHermit')
            unveilAction('tellAJoke')
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["flow", 80]],
        expAtts:[["charm", 10]],
        efficiencyAtts:[["charm", 10]]
    },
    inquireAboutMagic: {
        tier:1, plane:0,
        progressMaxBase:1e17, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:4,
        unlockCost:1e18, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('learnToStayStill')
            if(data.actions.inquireAboutMagic.level >= 2) {
                unveilAction('feelTheResonance')
            }
            if(data.actions.inquireAboutMagic.level >= 3) {
                unveilAction('layerTheEchoes')
            }
            if(data.actions.inquireAboutMagic.level >= 4) {
                unveilAction('igniteTheSpark')
            }
        },
        onLevelAtts:[["integration", 40]],
        expAtts:[],
        efficiencyAtts:[]
    },
    talkWithScott: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:50, progressMaxIncrease:100,
        expToLevelBase:50, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:2,
        unlockCost:1, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction('handyman');

        },
        onLevelCustom: function() {
            unveilAction('learnToListen');
            if(data.actions.talkWithScott.level >= 2) {
                unveilAction('tavernHelper');
                unveilAction('talkWithJohn');
            }
        },
        onLevelAtts:[["savvy", 100]],
        expAtts:[["confidence", 1], ["recognition", 1]],
        efficiencyAtts:[["discernment", 1]],
    },
    talkWithJohn: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:2e5, progressMaxIncrease:100,
        expToLevelBase:50, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:2,
        unlockCost:4e6, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('guildReceptionist');
            if(data.actions.talkWithJohn.level >= 2) {
                unveilAction('messenger');
            }
        },
        onLevelAtts:[["savvy", 2500]],
        expAtts:[["confidence", 1]],
        efficiencyAtts:[["discernment", .5]]
    },
    learnToListen: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:1000000, progressMaxIncrease:100,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.5, maxLevel:20,
        unlockCost:10, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction('chatWithMerchants')
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["discernment", 10], ["confidence", 5]],
        expAtts:[["observation", 1], ["curiosity", 1]],
        efficiencyAtts:[["discernment", .1]]
    },
    chatWithMerchants: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:5000, progressMaxIncrease:2,
        expToLevelBase:20, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:3,
        unlockCost:50, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction('browseStores')
        },
        onLevelCustom: function() {
            unveilAction('complimentTheChef')
            if(data.actions.chatWithMerchants.level >= 2) {
                unveilAction('askAboutStitching')
            }
            if(data.actions.chatWithMerchants.level >= 3) {
                unveilAction('listenToWoes')
            }

        },
        onLevelAtts:[["recognition", 200], ["cunning", 10]],
        expAtts:[["observation", 1]],
        efficiencyAtts:[["discernment", 1]]
    },
    complimentTheChef: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:5, progressMaxIncrease:40,
        expToLevelBase:20, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:2,
        unlockCost:50, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('buyStreetFood')
            if(data.actions.complimentTheChef.level >= 2) {
                unveilAction('buyGoodFood')
            }
        },
        onLevelAtts:[["charm", 40], ["awareness", 1000]],
        expAtts:[],
        efficiencyAtts:[["discernment", 1]]
    },
    askAboutStitching: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:10, progressMaxIncrease:40,
        expToLevelBase:20, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:2,
        unlockCost:100, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('buyMatchingClothes')
            if(data.actions.askAboutStitching.level >= 2) {
                unveilAction('buyStylishClothes')
            }
        },
        onLevelAtts:[["charm", 40], ["control", 10]],
        expAtts:[],
        efficiencyAtts:[["discernment", 1]]
    },
    listenToWoes: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:40, progressMaxIncrease:40,
        expToLevelBase:40, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:2,
        unlockCost:400, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction('keyToTheBackroom')
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["concentration", 2000], ["charm", 80], ["confidence", 5]],
        expAtts:[],
        efficiencyAtts:[["discernment", 1]]
    },
    keyToTheBackroom: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:200, progressMaxIncrease:1,
        expToLevelBase:20, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:1,
        unlockCost:200, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('browseBackrooms')
            unveilAction('joinCoffeeClub');
            unveilAction('slideTheCoin');
            unveilAction('buyCoffee');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[["discernment", 1]]
    },
    chatWithHermit: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:10000, progressMaxIncrease:5,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:10,
        unlockCost:10000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["confidence", 5]],
        expAtts:[],
        efficiencyAtts:[["discernment", 1]]
    },
    tellAJoke: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:1000, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:10,
        unlockCost:5000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('inquireAboutMagic')
        },
        onLevelAtts:[["charm", 1000]],
        expAtts:[],
        efficiencyAtts:[["discernment", .5]]
    },
    hearOfSecretShrine: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:1e15, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:3e13, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    learnToStayStill: {
        tier:1, plane:0,
        progressMaxBase:3e18, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:1,
        unlockCost:1e18, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    feelTheResonance: {
        tier:1, plane:0,
        progressMaxBase:1e17, progressMaxIncrease:1,
        expToLevelBase:100, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:1,
        unlockCost:3e18, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    layerTheEchoes: {
        tier:1, plane:0,
        progressMaxBase:5e18, progressMaxIncrease:1,
        expToLevelBase:9, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:1,
        unlockCost:1e19, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    igniteTheSpark: {
        tier:1, plane:0,
        progressMaxBase:1e20, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:1,
        unlockCost:3e19, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilPlane(0);
            unveilPlane(2);
            data.actions.echoKindle.resource += 10;
        },
        onLevelAtts:[["legacy", 10], ["pulse", 10]],
        expAtts:[],
        efficiencyAtts:[]
    },
    travelAlongTheRiver: {
        tier:1, plane:0,
        progressMaxBase:1e16, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:3e15, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["endurance", 2000], ["coordination", 800]],
        expAtts:[["might", 1]],
        efficiencyAtts:[]
    },
    gatherRiverWeeds: {
        tier:1, plane:0,
        progressMaxBase:8e22, progressMaxIncrease:1.1,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:3e15, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            if(data.actions.gatherRiverWeeds.level >= 10) {
                unveilAction('presentTheOffering')
            }
        },
        onLevelAtts:[["might", 1000]],
        expAtts:[["coordination", 1], ["observation", 1], ["endurance", 1]],
        efficiencyAtts:[]
    },
    gatherRarePlants: {
        tier:1, plane:0,
        progressMaxBase:1e15, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:3e13, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    restAtWaterfall: {
        tier:1, plane:0,
        progressMaxBase:1e15, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:3e13, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    visitShrineBehindWaterfall: {
        tier:1, plane:0,
        progressMaxBase:1e15, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:3e13, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            data.actions.echoKindle.resource += 20;
        },
        onLevelAtts:[["legacy", 20]],
        expAtts:[],
        efficiencyAtts:[]
    },
    travelToCrossroads: {
        tier:1, plane:0,
        progressMaxBase:1e15, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:10,
        unlockCost:3e13, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[],
        expAtts:[["endurance", 1]],
        efficiencyAtts:[["curiosity", .1]]
    },
    forgottenShrine: {
        tier:1, plane:0,
        progressMaxBase:1e15, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:3e13, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            data.actions.echoKindle.resource += 20;
        },
        onLevelAtts:[["legacy", 20]],
        expAtts:[],
        efficiencyAtts:[]
    },
    resonatingAmulet: {
        tier:1, plane:0,
        progressMaxBase:1e15, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:3e13, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            data.actions.echoKindle.resource += 30;
        },
        onLevelAtts:[["legacy", 30]],
        expAtts:[],
        efficiencyAtts:[]
    },



    standStraighter: {
        tier:1, plane:0,
        progressMaxBase:1e15, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:3e13, visible:false, unlocked:false, purchased: true,
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
        progressMaxBase:3e6, progressMaxIncrease:1.5,
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
        progressMaxBase:1e10, progressMaxIncrease:8,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.5, maxLevel:5,
        unlockCost:3e8, visible:false, unlocked:false, purchased: true,
        onUnlock:function() {
            unveilAction('noticeTheStrain');
            unveilAction('clenchTheJaw');
            unveilAction('breatheThroughIt');
            unveilAction('ownTheWeight');
            unveilAction('moveWithPurpose');
            data.actions.bodyAwareness.maxLevel += 4;
        },
        onLevelAtts:[["coordination", 30]],
        expAtts:[["endurance", 1], ["might", 1], ["geared", 1]],
        efficiencyAtts:[["flow", 1]],
        unlockMessage:{english:"On unlock, +4 max levels for Body Awareness."}
    },
    noticeTheStrain: {
        tier:1, plane:0,
        progressMaxBase:5e8, progressMaxIncrease:60,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.08, maxLevel:3,
        unlockCost:10e7, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["observation", 500]],
        expAtts:[["endurance", 1], ["might", 10], ["geared", 1]],
        efficiencyAtts:[["coordination", 1]]
    },
    clenchTheJaw: {
        tier:1, plane:0,
        progressMaxBase:2e11, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.04, maxLevel:2,
        unlockCost:11e7, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["endurance", 100]],
        expAtts:[["endurance", 1], ["observation", 1], ["geared", 1]],
        efficiencyAtts:[["coordination", 1]]
    },
    breatheThroughIt: {
        tier:1, plane:0,
        progressMaxBase:5e12, progressMaxIncrease:2,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:2,
        unlockCost:12e7, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["flow", 5]],
        expAtts:[["observation", 1], ["endurance", 1], ["geared", 1]],
        efficiencyAtts:[["coordination", 1]]
    },
    ownTheWeight: {
        tier:1, plane:0,
        progressMaxBase:2e9, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:2,
        unlockCost:13e7, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["might", 50]],
        expAtts:[["geared", 1]],
        efficiencyAtts:[["flow", 1000]]
    },
    moveWithPurpose: {
        tier:1, plane:0,
        progressMaxBase:2e14, progressMaxIncrease:600,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:2,
        unlockCost:14e7, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {

        },
        onLevelAtts:[["endurance", 1000], ["might", 200], ["coordination", 100]],
        expAtts:[["observation", 1], ["might", 1], ["endurance", 1], ["geared", 1]],
        efficiencyAtts:[["flow", 1000]]
    },
}


//Jobs 1
actionData = {
    ...actionData,

    guildReceptionist: {
        tier:1, plane:0,
        progressMaxBase:1e15, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:8,
        wage: 100000,
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
        onLevelAtts:[["adaptability", 16]],
        expAtts:[],
        efficiencyAtts:[["adaptability", .08]],
        unlockMessage:{english:"On unlock, set job to guildReceptionist for a base wage of $100k."}
    },
    messenger: {
        tier:1, plane:0,
        progressMaxBase:1e18, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:8,
        wage: 1e6,
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
        onLevelAtts:[["adaptability", 32]],
        expAtts:[],
        efficiencyAtts:[["adaptability", .05]],
        unlockMessage:{english:"On unlock, set job to messenger for a base wage of $1m."}
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
    fightTheEvilForces: {
        tier:1, plane:1,
        progressMaxBase:60, progressMaxIncrease:1,
        expToLevelBase:60, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true,
        unlockCost:0, visible:true, unlocked:true, isGenerator:true, generatorSpeed:1,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    bridgeOfBone: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
    harvestGhostlyField: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
    geyserFields: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
    destroySiegeEngine: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
    destroyEasternMonolith: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
    stopDarknessRitual: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
    protectTheSunstone: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
    silenceDeathChanters: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
    breakFleshBarricade: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
    conquerTheGatekeepers: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
    unhookSacrificialCages: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
    purgeUnholyRelics: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
    destroyWesternMonolith: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
    destroyFleshGrowths: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
    crackCorruptedEggs: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
    kiteTheAbomination: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
    collapseCorpseTower: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
    surviveLivingSiegeEngine: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
    destroySouthernMonolith: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
    burnFleshPits: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
    openSoulGate: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
    shatterTraps: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
    killTheArchitect: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
    destroyNorthernMonolith: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
    breakOutOfEndlessMaze: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
    killDopplegangers: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
    killDeathKnights: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
    silenceDoomScribe: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
    removeWards: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
    fightTheLich: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
    killTheLich: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
    shatterPhylactery: {
        tier:1, plane:1,
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:true, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
            data.useAmuletButtonShowing = true;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            unveilAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coin."}
    },
}

//==== plane2 ====
actionData = {
    ...actionData,

    echoKindle: {
        tier:0, plane:2, resourceName:"legacy",
        progressMaxBase:10, progressMaxIncrease:1,
        expToLevelBase:10000000, expToLevelIncrease:1.2,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.05,
        efficiencyBase:.005,
        unlockCost:0, visible:true, unlocked:true, purchased: true, hasDeltas: false,
        isGenerator:true, generatorTarget:"sparkMana", generatorSpeed:100,
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
            return Math.pow(resource, .5) * 1000;
        },
        onLevelAtts:[["pulse", 5]],
        expAtts:[["vision", 1], ["integration", 1], ["pulse", 1], ["rhythm", 1]],
        efficiencyAtts:[["pulse", 1]],
        onCompleteText: {english:Raw.html`
                +<span style="font-weight:bold;" id="echoKindleResourceSent">???</span> Spark was added to Spark Mana.<br>
                `},
        extraInfo: {english:Raw.html`Exp & Mana gain = sqrt(Legacy) * Action Power * Efficiency * 1000.`}
    },
    sparkMana: {
        tier:0, plane:2, resourceName:"spark",
        progressMaxBase:1000, progressMaxIncrease:4,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1,
        unlockCost:25, visible:true, unlocked:false, purchased: true, hasUpstream:false,
        onUnlock: function() {
            unveilAction('poolMana');
            data.actions.poolMana.generatorSpeed = 6;
            unveilAction('expelMana')
            unveilAction("manaBasics")
            unveilAction("prepareSpells")
        },
        onLevelAtts:[["spark", 5]],
        expAtts:[["amplification", 1]],
        efficiencyAtts:[["spark", -1]]
    },
    poolMana: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:60, progressMaxIncrease:1,
        expToLevelBase:2, expToLevelIncrease:3,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.03,
        efficiencyBase:.08,
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
        onLevelAtts:[["pulse", 3]],
        expAtts:[["amplification", 1]],
        efficiencyAtts:[["amplification", .01], ["pulse", .25]],
        onCompleteText: {english:Raw.html`
                -<span style="font-weight:bold;" id="poolManaResourceTaken">???</span> Mana was taken from Spark Mana, converted to<br>
                +<span style="font-weight:bold;" id="poolManaResourceSent">???</span> Mana, added to this action.<br>
                `},
        extraInfo: {english:Raw.html`Exp & Mana gain = Action Power * Efficiency.`}
    },
    expelMana: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:.3, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.5, maxLevel:6,
        unlockCost:.3, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction("magicResearch")
            unveilAction("manaExperiments")
            unveilAction("prepareInternalSpells")
        },
        onLevelAtts:[["amplification", 10], ["pulse", 1]],
        expAtts:[],
        efficiencyAtts:[["integration", .05]]
    },
    manaBasics: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.03, maxLevel:3,
        unlockCost:1, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction("feelYourMana")
            unveilAction("manaObservations")
            unveilAction("infuseTheHide")
        },
        onLevelAtts:[["amplification", 60], ["pulse", 2]],
        expAtts:[],
        efficiencyAtts:[["integration", 2]]
    },
    manaExperiments: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:10, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.03, maxLevel:9,
        unlockCost:30, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction("manaVisualizations")
            unveilAction("growMagicSenses")
        },
        onLevelAtts:[["amplification", 200]],
        expAtts:[],
        efficiencyAtts:[["integration", 2]]
    },
    magicResearch: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:100, progressMaxIncrease:9,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:9,
        unlockCost:200, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction("etchTheCircle")
        },
        onLevelAtts:[["spark", 10], ["pulse", 5]],
        expAtts:[],
        efficiencyAtts:[]
    },
    prepareSpells: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:100, progressMaxIncrease:9,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.35, maxLevel:9,
        unlockCost:500, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction("overcharge")
            unveilAction("combatSpells")
            unveilAction("recoverSpells")
            unveilAction("supportSpells")
        },
        onLevelAtts:[["spark", 3]],
        expAtts:[],
        efficiencyAtts:[["integration", .05]]
    },
    prepareInternalSpells: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:300, progressMaxIncrease:9,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.3, maxLevel:9,
        unlockCost:500, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction("overboost")
        },
        onLevelAtts:[["spark", 3]],
        expAtts:[],
        efficiencyAtts:[["integration", .05]]
    },
    overcharge: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:100, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.4, maxLevel:1, isSpell:true, instabilityToAdd:10,
        unlockCost:500, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction("overdrive")
        },
        spellpower: function() {
            return 10;
        },
        onLevelAtts:[["wizardry", 1]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .01]],
        extraInfo: {english:Raw.html`If a charge is available, the next Overclock will give x10 momentum.`}
    },
    overboost: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:100000, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:1, isSpell:true, instabilityToAdd:100,
        unlockCost:100000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        spellpower: function() {
            return 10;
        },
        onLevelAtts:[["wizardry", 10]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]]
    },
    overdrive: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:1, isSpell:true, instabilityToAdd:100,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        spellpower: function() {
            return 10;
        },
        onLevelAtts:[["wizardry", 100]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .0001]]
    },
    manaObservations: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:30000, progressMaxIncrease:9,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:3,
        unlockCost:90000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction("manaShaping")
        },
        onLevelAtts:[["vision", 150]],
        expAtts:[],
        efficiencyAtts:[["integration", 2]]
    },
    feelYourMana: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:100, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.02, maxLevel:9,
        unlockCost:300, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction("listenToTheMana");
        },
        onLevelAtts:[["amplification", 600]],
        expAtts:[],
        efficiencyAtts:[["integration", 2]]
    },
    growMagicSenses: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.015, maxLevel:9,
        unlockCost:3000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[["amplification", 2000]],
        expAtts:[],
        efficiencyAtts:[["integration", 2]]
    },
    infuseTheHide: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:2000, progressMaxIncrease:1,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:2,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction("bindThePages")
        },
        onLevelAtts:[["vision", 5]],
        expAtts:[["amplification", .01]],
        efficiencyAtts:[]
    },
    etchTheCircle: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:2000, progressMaxIncrease:1,
        expToLevelBase:9, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:1,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction("awakenYourGrimoire")
        },
        onLevelAtts:[["vision", 30]],
        expAtts:[["amplification", .01]],
        efficiencyAtts:[]
    },
    bindThePages: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:300, progressMaxIncrease:1.01,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:100,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelAtts:[["vision", 1]],
        expAtts:[["amplification", .01]],
        efficiencyAtts:[]
    },
    awakenYourGrimoire: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:30000, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:1,
        unlockCost:6000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction('prepareExternalSpells')
        },
        onLevelCustom: function () {
            levelAllCharges()
        },
        onLevelAtts:[["integration", 200]],
        expAtts:[["amplification", .01]],
        efficiencyAtts:[]
    },
    prepareExternalSpells: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:100000, progressMaxIncrease:33,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:9,
        unlockCost:20000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction('earthMagic')
        },
        onLevelAtts:[["vision", 100]],
        expAtts:[],
        efficiencyAtts:[["integration", .05]]
    },
    supportSpells: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:300000, progressMaxIncrease:33,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.15, maxLevel:9,
        unlockCost:30000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction('moveEarth')
        },
        onLevelAtts:[["vision", 100]],
        expAtts:[],
        efficiencyAtts:[["integration", .05]]
    },
    earthMagic: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:10000, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1, power:1,
        efficiencyBase:.2, maxLevel:0, isSpell:true, instabilityToAdd:5,
        unlockCost:20000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction('shelter')
        },
        onLevelAtts:[["wizardry", 20]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]]
    },
    moveEarth: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    shelter: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    reinforceArmor: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    sharpenWeapons: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    repairEquipment: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    restoreEquipment: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    manaVisualizations: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    manaShaping: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    listenToTheMana: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    manaInstinct: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    auraControl: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:10000, progressMaxIncrease:9,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:600000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[["control", 10]],
        expAtts:[],
        efficiencyAtts:[]
    },
    divination: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    identifyItem: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    detectMagic: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    practicalMagic: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    manaTransfer: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    illuminate: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    unblemish: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    recoverSpells: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:20e7, progressMaxIncrease:9,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:9,
        unlockCost:20e7, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[["vision", 1000]],
        expAtts:[],
        efficiencyAtts:[["integration", .05]]
    },
    healingMagic: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },

    singleTargetHealing: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    purifyPoison: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    massHeal: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    auraHealing: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    healBurst: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    combatSpells: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:20e10, progressMaxIncrease:9,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:9,
        unlockCost:20e10, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[["vision", 10000]],
        expAtts:[],
        efficiencyAtts:[["integration", .05]]
    },
    swarmSpells: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    fireball: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    wardMagic: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    ward: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    duellingSpells: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    firebolt: {
        tier:0, plane:2, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
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
