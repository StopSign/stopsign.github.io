function create(actionVar, downstreamVars, x, y) {
    let dataObj = actionData[actionVar];
    if(!dataObj) {
        console.log("Could not find in actionData, " + actionVar);
        return;
    }
    if(!dataObj.resourceName) {
        dataObj.resourceName = "momentum";
    }
    dataObj.creationVersion = dataObj.creationVersion ?? 0;
    dataObj.x = x * 480;
    dataObj.y = y * -480;
    if(!dataObj.addedInVersion) {
        dataObj.addedInVersion = 0;
    }
    dataObj.title = dataObj.title || decamelizeWithSpace(actionVar);
    // let title = dataObj.title || decamelizeWithSpace(actionVar); //basicLabor -> Basic Labor
    createAndLinkNewAction(actionVar, dataObj, downstreamVars);
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
                    if(isSpellReady('overponder')) {
                        useCharge('overponder');
                    }
                }
            }

            actionObj.resource += actionObj.resourceToAdd;

            actionData.hearAboutTheLich.completeFromOverclock();

            views.scheduleUpdate('overclockResourceSent', intToString(actionObj.resourceToAdd, 2), "textContent")
        },
        updateMults: function () {
            let spellMult = 1;
            if(isSpellReady('overcharge')) {
                spellMult *= actionData.overcharge.spellpower();
                if(isSpellReady('overboost')) {
                    spellMult *= actionData.overboost.spellpower();
                    if(isSpellReady('overponder')) {
                        spellMult *= actionData.overponder.spellpower();
                    }
                }
            }

            let actionObj = data.actions.overclock;
            let dataObj = actionData.overclock;

            actionObj.progressGain = dataObj.generatorSpeed * (actionObj.efficiency / 100);
            actionObj.actionPower = actionObj.actionPowerBase *
                actionObj.actionPowerMult * (actionObj.efficiency/100);
            actionObj.resourceToAdd = actionObj.actionPower *
                actionObj.upgradeMult * spellMult;
        },
        onLevelCustom: function () {
            actionData.overclock.updateMults();
        },
        updateUpgradeMult: function () {
            let upgradeMult = 1;
            upgradeMult *= Math.pow(1.1, data.upgrades.createABetterFoundation.upgradePower);
            data.actions.overclock.upgradeMult = upgradeMult;
        },
        onLevelAtts: [],
        expAtts: [["awareness", 1], ["concentration", 1], ["energy", 1], ["control", 1],
            ["flow", 1], ["coordination", 1], ["integration", 1], ["rhythm", .01],
            ["pulse", .01]],
        efficiencyAtts: [["cycle", 1]],
        onCompleteText: {english:Raw.html`
                +<span style="font-weight:bold;" id="overclockResourceSent">???</span> Momentum was added.<br>
                `},
        iconText: {english:Raw.html`Generates Momentum over time.`}
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
        efficiencyAtts: [["cycle", 1]],
        iconText: {english:Raw.html`
Level 1: Reveal Distill Insight<br>
Level 2: Reveal Harness Overflow<br>
Level 4: Reveal Take Notes<br>
Level 6: Reveal Body Awareness`}
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
        efficiencyAtts:[["coordination", .5]],
        iconText: {english:Raw.html`
Level 1: Reveal Travel On Road<br>
Level 1: Reveal Travel To Outpost<br>
Level 1: Reveal Meet Village Leader Scott`}
    },
    remember: {
        tier:1, plane:0,
        progressMaxBase:20000, progressMaxIncrease:5,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:3,
        unlockCost:4000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            addMaxLevel("bodyAwareness", 1);
        },
        onLevelCustom: function() {
            addMaxLevel("harnessOverflow", 3);
        },
        onLevelAtts:[["concentration", 10]],
        expAtts:[["awareness", 1], ["observation", 1]], //~/50 from awareness when unlocked
        efficiencyAtts:[["cycle", 1]],
        unlockMessage:{english:"On unlock, +1 max level for Body Awareness."},
        iconText: {english:Raw.html`
On Unlock: +1 max level for Body Awareness<br>
On Level: +3 max levels for Harness Overflow`}
    },
    travelOnRoad: {
        tier:1, plane:0,
        progressMaxBase:1000, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.5, maxLevel:10,
        unlockCost:2000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            addMaxLevel("bodyAwareness", 1);
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["energy", 5]],
        expAtts:[["concentration", 1], ["endurance", 1], ["geared", 1]],
        efficiencyAtts:[["navigation", 1]],
        unlockMessage:{english:"On unlock, +1 max level for Body Awareness."},
        iconText: {english:Raw.html`
On Unlock: +1 max level for Body Awareness`}
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
        unlockMessage:{english:"On unlock, reveal a new action."},
        iconText: {english:Raw.html`
On Unlock: Reveal Remember`}
    },
    meetVillageLeaderScott: {
        tier:1, plane:0,
        progressMaxBase:40000, progressMaxIncrease:40,
        expToLevelBase:5, expToLevelIncrease:2,
        efficiencyBase:.5, maxLevel:3,
        unlockCost:40000, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            addMaxLevel("remember", 2);
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
            addMaxLevel("remember", 1);
        },
        onLevelAtts:[],
        expAtts:[["curiosity", 1], ["observation", 1]],
        efficiencyAtts:[["observation", 1]],
        unlockMessage:{english:"On unlock, +1 max level for Remember."},
        iconText: {english:Raw.html`
On Unlock: +1 max level for Remember<br>
On Level: +2 max levels for Remember<br>
Level 1: Reveal Watch Birds<br>
Level 2: Reveal Help Scott With Chores<br>
Level 3: Reveal Check Notice Board`}
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
            changeJob("helpScottWithChores")
        },
        onLevelAtts:[["recognition", 10]],
        expAtts:[["ambition", 1]],
        efficiencyAtts:[["energy", 1]],
        iconText: {english:Raw.html`
        On Unlock: Reveal Make Money and Job Display<br>
        On Level: Increase wage +50%
`}
    },
    browseLocalMarket: {
        tier:1, plane:0,
        progressMaxBase:7e7, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.3, maxLevel:10,
        unlockCost:1e8, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            unveilAction('buyBasicSupplies')
            unveilAction('buyBasicClothes')
            unveilAction('buyMarketItems')
            unveilAction('buyShopItems')
        },
        onLevelAtts:[["savvy", 5], ["observation", 50]],
        expAtts:[["observation", 1], ["recognition", 1]],
        efficiencyAtts:[["ambition", 1]],
        iconText: {english:Raw.html`
        Level 1: Reveal Buy Basic Supplies<br>
        Level 1: Reveal Buy Basic Clothes<br>
        Level 1: Reveal Buy Market Items<br>
        Level 1: Reveal Buy Shop Items
`}
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
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e41, progressMaxIncrease:8,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:5,
        unlockCost:5e33, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
        },
        onLevelAtts:[["savvy", 3e4], ["cunning", 400]],
        expAtts:[["recognition", 1], ["influence", 1], ["leverage", 1]],
        efficiencyAtts:[["leverage", 1]]
    },
    checkNoticeBoard: {
        tier:1, plane:0,
        progressMaxBase:60e6, progressMaxIncrease:40,
        expToLevelBase:2, expToLevelIncrease:3,
        efficiencyBase:.003125, maxLevel:3,
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
        onLevelText:{english:"Unlocks new actions with each level."},
        iconText: {english:Raw.html`
        Level 1: Reveal Browse Local Market<br>
        Level 2: Reveal Report For Training<br>
        Level 3: Reveal Report For Labor<br>
        Level 3: Reveal Odd Jobs Laborer<br>
        Level 3: Reveal Chimney Sweep
`}
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

            views.scheduleUpdate('makeMoneyResourceSent', intToString(actionObj.resourceToAdd, 2), "textContent")
            views.scheduleUpdate('makeMoneyResourceTaken', intToString(resourceTaken, 2), "textContent")
        },
        onUnlock: function() {
            unveilAction('spendMoney');
        },
        updateMults: function () {
            let actionObj = data.actions.makeMoney;
            let dataObj = actionData.makeMoney;

            actionObj.progressGain = dataObj.generatorSpeed * (actionObj.efficiency / 100);
            actionObj.actionPower = actionObj.actionPowerBase *
                actionObj.actionPowerMult * (actionObj.efficiency/100);
            let resourceTaken = actionObj.resource * actionObj.tierMult();
            actionObj.resourceToAdd = dataObj.actionPowerFunction(resourceTaken) *
                actionObj.actionPower * actionObj.upgradeMult;
            actionObj.expToAddBase = actionObj.resourceToAdd;
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
        },
        updateUpgradeMult:function() {
            let upgradeMult = 1;
            upgradeMult *= Math.pow(1.5, data.upgrades.workHarder.upgradePower);
            data.actions.makeMoney.upgradeMult = upgradeMult;
        },
        onLevelAtts:[["ambition", 1]],
        expAtts:[["adaptability", 1], ["cunning", 1], ["leverage", 1], ["logistics", 1], ["intellect", 1]],
        efficiencyAtts:[["ambition", 1]],
        actionPowerFunction: function(resource) {
            if(resource < 1) {
                return 0;
            }
            return Math.pow(resource, .5) * data.currentWage; //sqrt(num * mult) * wage
        },
        onCompleteText: {english:Raw.html`
                -<span style="font-weight:bold;" id="makeMoneyResourceTaken">???</span> Momentum was taken from this action, converted to<br>
                +<span style="font-weight:bold;" id="makeMoneyResourceSent">???</span> Gold, added to Spend Money.<br>
                `},
        extraInfo: {english:Raw.html`<br>Momentum Taken = 1% of current Momentum.<br>
                        Exp & Gold gain = (Momentum Taken)^.5 * Action Power * Efficiency * Wages.`}
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
        onUnlock:function() {
            unveilAction('invest');
        },
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
    buyPointyHat: {
        tier:2, plane:0, resourceName:"gold", automationOff: true,
        progressMaxBase:5e30, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:1,
        unlockCost:2e27, visible:false, unlocked:false, purchased: true,
        onUnlock:function() {
        },
        onLevelAtts:[["confidence", 10000]],
        expAtts:[["savvy", 1]],
        efficiencyAtts:[]
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
        onLevelCustom: function() {
            if(data.actions.buyStylishClothes.level >= 10) {
                unveilAction('buyComfyShoes');
                unveilAction('buyTravelersGear');
            }
        },
        onLevelAtts:[["recognition", 2000], ["confidence", 10], ["discernment", 10]],
        expAtts:[["savvy", 1]],
        efficiencyAtts:[["confidence", .5]]
    },
    slideTheCoin: {
        tier:2, plane:0, resourceName:"gold",
        progressMaxBase:5e16, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:1,
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
        progressMaxBase:5e19, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:10,
        unlockCost:2e17, visible:false, unlocked:false, purchased: true,
        onUnlock:function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["charm", 2000], ["recognition", 200], ["influence", 120], ["energy", 5]],
        expAtts:[["savvy", 1]],
        efficiencyAtts:[["recognition", .001]]
    },


    buyComfyShoes: {
        tier:2, plane:0, resourceName: "gold", creationVersion:2, automationOff: true,
        progressMaxBase:5e29, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.002, maxLevel:5,
        unlockCost:2e26, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["energy", 5e5], ["geared", 5000]],
        expAtts:[["savvy", 1], ["leverage", 1]],
        efficiencyAtts:[["confidence", .1]]
    },
    buyTravelersGear: {
        tier:2, plane:0, resourceName: "gold", creationVersion:2, automationOff: true,
        progressMaxBase:5e35, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:5,
        unlockCost:2e30, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            unveilAction('buyArtisanFood');
            if(data.actions.buyTravelersGear.level >= 5) {
                unveilAction('buyHouse');
            }
        },
        onLevelAtts:[["energy", 2e6], ["geared", 25000]],
        expAtts:[["savvy", 1], ["leverage", 1]],
        efficiencyAtts:[["confidence", .1]]
    },
    buyArtisanFood: {
        tier:2, plane:0, resourceName: "gold", creationVersion:2, automationOff: true,
        progressMaxBase:5e39, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:5,
        unlockCost:2e34, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["energy", 5e6]],
        expAtts:[["savvy", 1], ["leverage", 1]],
        efficiencyAtts:[["leverage", .1]]
    },
    buyUtilityItems: {
        tier:2, plane:0, resourceName: "gold", creationVersion:2, automationOff: true,
        progressMaxBase:5e37, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:5,
        unlockCost:2e32, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            unveilAction('buyPotions');
            if(data.actions.buyUtilityItems.level >= 3) {
                unveilAction('buyTools');
            }
        },
        onLevelAtts:[["energy", 3e6], ["navigation", 200]],
        expAtts:[["savvy", 1], ["leverage", 1]],
        efficiencyAtts:[["confidence", .1]]
    },
    buyPotions: {
        tier:2, plane:0, resourceName: "gold", creationVersion:2, automationOff: true,
        progressMaxBase:5e39, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:5,
        unlockCost:2e34, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["energy", 1e7]],
        expAtts:[["savvy", 1], ["leverage", 1]],
        efficiencyAtts:[["leverage", .1]]
    },
    buyTools: {
        tier:2, plane:0, resourceName: "gold", creationVersion:2, automationOff: true,
        progressMaxBase:5e41, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:5,
        unlockCost:2e36, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            if(data.actions.buyTools.level >= 3) {
                unveilAction('buyCart');
            }
        },
        onLevelAtts:[["geared", 6e5], ["logistics", 2]],
        expAtts:[["savvy", 1], ["leverage", 1]],
        efficiencyAtts:[["leverage", .1]]
    },
    buyCart: {
        tier:2, plane:0, resourceName: "gold", creationVersion:2, automationOff: true,
        progressMaxBase:5e43, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:5,
        unlockCost:2e38, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["geared", 1.5e6], ["logistics", 5]],
        expAtts:[["savvy", 1], ["leverage", 1]],
        efficiencyAtts:[["leverage", .1]]
    },
    buyHouse: {
        tier:2, plane:0, resourceName: "gold", creationVersion:2, automationOff: true,
        progressMaxBase:5e42, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:1,
        unlockCost:2e36, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            purchaseAction('buyHouseholdItems')
            unveilAction('buyHouseholdItems');
            unveilUpgrade('improveMyHouse');
        },
        onLevelAtts:[["integration", 1000], ["comfort", 15]],
        expAtts:[["savvy", 1], ["ambition", 1]],
        efficiencyAtts:[["recognition", 1]]
    },
    buyHouseholdItems: {
        tier:2, plane:0, resourceName: "gold", creationVersion:2, automationOff: true,
        progressMaxBase:5e43, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:5,
        unlockCost:2e37, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            unveilAction('buyFurniture');
        },
        onLevelAtts:[["energy", 3e7], ["discernment", 200]],
        expAtts:[["savvy", 1], ["leverage", 1]],
        efficiencyAtts:[["leverage", 1]]
    },
    buyFurniture: {
        tier:2, plane:0, resourceName: "gold", creationVersion:2, automationOff: true,
        progressMaxBase:2e44, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:5,
        unlockCost:8e37, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            unveilAction('buyReadingChair');
            unveilAction('buyBed');
        },
        onLevelAtts:[["energy", 5e7], ["comfort", 10]],
        expAtts:[["savvy", 1], ["leverage", 1]],
        efficiencyAtts:[["leverage", 1]]
    },
    buyReadingChair: {
        tier:2, plane:0, resourceName: "gold", creationVersion:2, automationOff: true,
        progressMaxBase:5e44, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:5,
        unlockCost:2e38, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            unveilAction('buyFireplace');
        },
        onLevelAtts:[["comfort", 15], ["peace", 2]],
        expAtts:[["savvy", 1], ["leverage", 1]],
        efficiencyAtts:[["leverage", 1]]
    },
    buyBed: {
        tier:2, plane:0, resourceName: "gold", creationVersion:2, automationOff: true,
        progressMaxBase:2e46, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:5,
        unlockCost:8e39, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            unveilAction('buySilkSheets');
        },
        onLevelAtts:[["energy", 1e8]],
        expAtts:[["savvy", 1], ["leverage", 1]],
        efficiencyAtts:[["leverage", 1]]
    },
    buyFireplace: {
        tier:2, plane:0, resourceName: "gold", creationVersion:2, automationOff: true,
        progressMaxBase:5e46, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:5,
        unlockCost:2e40, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            unveilAction('buyGoodFirewood');
        },
        onLevelAtts:[["comfort", 30]],
        expAtts:[["savvy", 1], ["leverage", 1]],
        efficiencyAtts:[["leverage", 1]]
    },
    buySilkSheets: {
        tier:2, plane:0, resourceName: "gold", creationVersion:2, automationOff: true,
        progressMaxBase:5e47, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.005, maxLevel:5,
        unlockCost:2e41, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["energy", 1e8]],
        expAtts:[["savvy", 1], ["leverage", 1]],
        efficiencyAtts:[["leverage", 1]]
    },
    buyGoodFirewood: {
        tier:2, plane:0, resourceName: "gold", creationVersion:2, automationOff: true,
        progressMaxBase:5e48, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.005, maxLevel:5,
        unlockCost:2e42, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["comfort", 40], ["peace", 10]],
        expAtts:[["savvy", 1], ["leverage", 1]],
        efficiencyAtts:[["leverage", 1]]
    },

    invest: {
        tier:1, plane:0, resourceName:"gold", creationVersion:2, automationOff: true,
        progressMaxBase:10, progressMaxIncrease:1,
        expToLevelBase:3e8, expToLevelIncrease:1.4,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1,
        efficiencyBase:.5,
        unlockCost:2e12, visible:false, unlocked:false, purchased: false,
        isGenerator:true, generatorTarget:"buildFortune", generatorSpeed:1,
        onCompleteCustom: function() {
            //stop consuming from reinvest - it's not amount on reinvest * 1.05, but it's 5% of what's on reinvest
            let actionObj = data.actions.invest;
            actionData.invest.updateMults();
            let resourceTaken = actionObj.resource * actionObj.tierMult();
            if(resourceTaken <= 1) {
                resourceTaken = 0;
            }

            if (actionObj.resourceToAdd > 0) {
                actionObj.resource -= resourceTaken;
                addResourceTo(data.actions[actionObj.generatorTarget], actionObj.resourceToAdd);
            }

            views.scheduleUpdate('investResourceSent', intToString(actionObj.resourceToAdd, 2), "textContent")
            views.scheduleUpdate('investResourceTaken', intToString(resourceTaken, 2), "textContent")
        },
        onUnlock: function() {
            unveilAction('buildFortune');
        },
        updateMults: function () {
            let actionObj = data.actions.invest;
            let dataObj = actionData.invest;

            actionObj.progressGain = dataObj.generatorSpeed * (actionObj.efficiency / 100);
            actionObj.actionPower = actionObj.actionPowerBase *
                actionObj.actionPowerMult;
            let resourceTaken = actionObj.resource * actionObj.tierMult(); //gold taken
            if(resourceTaken <= 1) {
                resourceTaken = 1; //just to make the math not break
            }
            let reinvested = data.actions.reinvest.resource * (actionObj.actionPower-1);
            actionObj.resourceToAdd = (reinvested + Math.log10(resourceTaken) * upgradeData.increaseInitialInvestment.currentValue()) * (actionObj.efficiency/100);
            let investCap = Math.pow(upgradeData.increaseMarketCap.currentValue(), actionObj.actionPower);
            actionObj.resourceToAdd = actionObj.resourceToAdd > investCap ? investCap : actionObj.resourceToAdd;

            actionObj.expToAddBase = Math.log10(resourceTaken);
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
        },
        onLevelCustom: function() {
            data.actions.invest.actionPowerBase = 1 + data.actions.invest.level / 1000;
            actionData.invest.updateMults();
        },
        onLevelAtts:[],
        expAtts:[["vision", 1], ["adaptability", 1], ["ambition", 1]],
        efficiencyAtts:[["ambition", .005]],
        onCompleteText: {english:Raw.html`
                -<span style="font-weight:bold;" id="investResourceTaken">???</span> Gold was taken from this action, converted to<br>
                +<span style="font-weight:bold;" id="investResourceSent">???</span> Fortune, added to Build Fortune.<br>
                `},
        onLevelText:{english:"+0.001 Action Power per level<br>"},
        extraInfo: {english:Raw.html`<br>
            Gold Taken = 1% of current Gold.<br>
            Reinvested = Fortune on Reinvest * (Action Power-1).<br> 
            Base Rate = 1 (increased with upgrades)<br><br>
            Fortune Gain = (log10(Gold Taken) * Base Rate + Reinvested) * efficiency<br><br>
            Exp Gain = log10(Gold Taken)<br><br>
            Fortune Gain is capped at 1e5^(Action Power)`}
    },
    buildFortune: {
        tier:2, plane:0, resourceName:"fortune", creationVersion:2, hasUpstream:false, automationOff: true,
        progressMaxBase:100, progressMaxIncrease:4,
        expToLevelBase:1, expToLevelIncrease:2,
        efficiencyBase:1, maxLevel:5,
        unlockCost:200, visible:false, unlocked:false, purchased: false,
        onUnlock:function() {
        },
        onLevelCustom: function() {
            unveilAction('reinvest')
            if(data.actions.buildFortune.level >= 2) {
                unveilAction('spendFortune')
            }
        },
        onLevelAtts:[["vision", 250], ["ambition", 20]],
        expAtts:[],
        efficiencyAtts:[]
    },
    reinvest: {
        tier:3, plane:0, resourceName:"fortune", creationVersion:2, automationOff: true,
        progressMaxBase:1000, progressMaxIncrease:100,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onUnlock:function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["vision", 1000], ["adaptability", 100], ["ambition", 100]],
        expAtts:[],
        efficiencyAtts:[["ambition", .1]]
    },
    spendFortune: {
        tier:2, plane:0, resourceName:"fortune", creationVersion:2, automationOff: true,
        progressMaxBase:500, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:2,
        efficiencyBase:1, maxLevel:4,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onUnlock:function() {
            unveilAction('investInLocals');
            unveilAction('fundTownImprovements');
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["energy", 1e6], ["savvy", 1e4], ["adaptability", 100]],
        expAtts:[],
        efficiencyAtts:[]
    },
    investInLocals: {
        tier:3, plane:0, resourceName:"fortune", creationVersion:2, automationOff: true,
        progressMaxBase:1500, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:2,
        efficiencyBase:1, maxLevel:4,
        unlockCost:3000, visible:false, unlocked:false, purchased: false,
        onUnlock:function() {
            unveilAction('hostAFestival');
        },
        onLevelCustom: function() {
            if(data.actions.investInLocals.level >= 1) {
                unveilAction('townCrier')
            }
            if(data.actions.investInLocals.level >= 2) {
                unveilAction('storyTeller');
            }
        },
        onLevelAtts:[["recognition", 2e4], ["adaptability", 100], ["leverage", 10]],
        expAtts:[],
        efficiencyAtts:[]
    },
    hostAFestival: {
        tier:3, plane:0, resourceName:"fortune", creationVersion:2, automationOff: true,
        progressMaxBase:1e4, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:2,
        efficiencyBase:1, maxLevel:4,
        unlockCost:2e4, visible:false, unlocked:false, purchased: false,
        onUnlock:function() {
        },
        onLevelAtts:[["charm", 1e4], ["influence", 500]],
        expAtts:[],
        efficiencyAtts:[]
    },
    fundTownImprovements: {
        tier:3, plane:0, resourceName:"fortune", creationVersion:2, automationOff: true,
        progressMaxBase:1e5, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:4,
        unlockCost:2e5, visible:false, unlocked:false, purchased: false,
        onUnlock:function() {
            unveilAction('investInSelf');
        },
        onLevelCustom: function() {
            unveilAction('supportLocalLibrary');
            if(data.actions.fundTownImprovements.level >= 2) {
                unveilAction('buyUtilityItems')
            }
            if(data.actions.fundTownImprovements.level >= 3) {
                unveilAction('browsePersonalCollection')
            }
            if(data.actions.fundTownImprovements.level >= 4) {
                unveilAction('fundASmallStall')
            }
        },
        onLevelAtts:[["cunning", 1000], ["adaptability", 100], ["leverage", 20]],
        expAtts:[],
        efficiencyAtts:[]
    },
    supportLocalLibrary: {
        tier:3, plane:0, resourceName:"fortune", creationVersion:2, automationOff: true,
        progressMaxBase:2e7, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:4,
        unlockCost:5e7, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            unveilAction('expandLocalLibrary')
        },
        onLevelAtts:[["recognition", 5e4], ["adaptability", 400], ["leverage", 30]],
        expAtts:[],
        efficiencyAtts:[]
    },
    expandLocalLibrary: {
        tier:3, plane:0, resourceName:"fortune", creationVersion:2, automationOff: true,
        progressMaxBase:2e9, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:4,
        unlockCost:5e9, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            unveilAction('recruitACarpenter')
        },
        onLevelAtts:[["leverage", 50], ["intellect", 1], ["logistics", 1]],
        expAtts:[],
        efficiencyAtts:[]
    },
    investInSelf: {
        tier:3, plane:0, resourceName:"fortune", creationVersion:2, automationOff: true,
        progressMaxBase:2e8, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:4,
        unlockCost:5e8, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            unveilAction('makeAPublicDonation')
            if(data.actions.investInSelf.level >= 2) {
                unveilAction('purchaseALot')
            }
        },
        onLevelAtts:[["savvy", 2e4], ["confidence", 5000]],
        expAtts:[],
        efficiencyAtts:[]
    },
    makeAPublicDonation: {
        tier:3, plane:0, resourceName:"fortune", creationVersion:2, automationOff: true,
        progressMaxBase:3e8, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:4,
        unlockCost:5e10, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
        },
        onLevelAtts:[["cunning", 8000], ["influence", 800]],
        expAtts:[],
        efficiencyAtts:[]
    },
    fundASmallStall: {
        tier:3, plane:0, resourceName:"fortune", creationVersion:2, automationOff: true,
        progressMaxBase:3e11, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:4,
        unlockCost:5e11, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["discernment", 300], ["savvy", 1e5]],
        expAtts:[],
        efficiencyAtts:[]
    },
    purchaseALot: {
        tier:3, plane:0, resourceName:"fortune", creationVersion:2, automationOff: true,
        progressMaxBase:3e13, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:1,
        unlockCost:5e13, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            purchaseAction('buyHouse');
            unveilAction('buyHouse');
        },
        onLevelAtts:[["recognition", 2e5], ["ambition", 1000]],
        expAtts:[],
        efficiencyAtts:[]
    },
    recruitACarpenter: {
        tier:3, plane:0, resourceName:"fortune", creationVersion:2, automationOff: true,
        progressMaxBase:5e12, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:4,
        unlockCost:5e12, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            unveilAction('procureQualityWood')
            purchaseAction('buildPersonalLibrary')
            addMaxLevel("buildPersonalLibrary", 1)
            unveilAction('buildPersonalLibrary')
        },
        onLevelAtts:[["charm", 2.5e4], ["logistics", 3]],
        expAtts:[],
        efficiencyAtts:[]
    },
    procureQualityWood: {
        tier:3, plane:0, resourceName:"fortune", creationVersion:2, automationOff: true,
        progressMaxBase:3e14, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:4,
        unlockCost:5e14, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            addMaxLevel("buildPersonalLibrary", 1)
        },
        onLevelAtts:[["adaptability", 1000], ["logistics", 4]],
        expAtts:[],
        efficiencyAtts:[]
    },
    sourceRareBooks: {
        tier:3, plane:0, resourceName:"fortune", creationVersion:2, automationOff: true,
        progressMaxBase:5e8, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:10,
        unlockCost:5e8, visible:false, unlocked:false, purchased: false,
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

            views.scheduleUpdate('socializeResourceSent', intToString(actionObj.resourceToAdd, 2), "textContent")
            views.scheduleUpdate('socializeResourceTaken', intToString(resourceTaken, 2), "textContent")
        },
        updateMults: function () {
            let actionObj = data.actions.socialize;
            let dataObj = actionData.socialize;

            actionObj.progressGain = dataObj.generatorSpeed * (actionObj.efficiency / 100);
            actionObj.actionPower = actionObj.actionPowerBase *
                actionObj.actionPowerMult * (actionObj.efficiency/100);
            let resourceTaken = actionObj.resource * actionObj.tierMult();
            actionObj.resourceToAdd = dataObj.actionPowerFunction(resourceTaken) * actionObj.actionPower * actionObj.upgradeMult;
            actionObj.expToAddBase = actionObj.resourceToAdd;
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
        },
        onUnlock: function() {
            // unveilAction('neighborlyTies');
            unveilAction('meetPeople');
        },
        updateUpgradeMult:function() {
            let upgradeMult = 1;
            upgradeMult *= Math.pow(1.25, data.upgrades.haveBetterConversations.upgradePower);
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
        extraInfo: {english:`<br>Momentum Taken = current Momentum * Tier Mult.<br>
                        Exp & Conversations gain = (Momentum Taken/1e12)^.5 * Action Power * Efficiency.<br>
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
        progressMaxBase:600000000000, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.00001,
        unlockCost:20000, maxLevel:1,
        visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction('buyCoffee');
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
        progressMaxBase:1e7, progressMaxIncrease:20,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1,
        unlockCost:1000000, maxLevel:10,
        visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction('hearAboutTheLich');
        },
        onLevelCustom: function () {
            // if(data.actions.gossipAroundCoffee.level >= 5) { //TODO doesn't this work?
            //     unlockAction(data.actions.hearAboutTheLich);
            // }
        },
        onLevelAtts:[["discernment", 10]],
        expAtts:[["cunning", 1]],
        efficiencyAtts:[["discernment", .5]],
    },
    hearAboutTheLich: {
        tier:1, plane:0, resourceName:"fear",
        progressMaxBase:4000, progressMaxIncrease:1e3,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:2,
        unlockCost:0,
        visible:false, unlocked:false, purchased: true, hasUpstream:false,
        onLevelCustom: function() {
            data.ancientCoinMultKTL = data.actions.hearAboutTheLich.level;
        },
        isUnlockCustom: function() { //TODO is this needed?
            return data.actions.gossipAroundCoffee.level >= 5;
        },
        updateMults: function() {
            let actionObj = data.actions.hearAboutTheLich;

            actionObj.resourceToAdd = actionData.hearAboutTheLich.calcFearGain();
            actionObj.resourceIncrease = actionObj.resourceToAdd *
                data.actions.overclock.progressGain / data.actions.overclock.progressMax;
        },
        completeFromOverclock: function() {
            let actionObj = data.actions.hearAboutTheLich;
            if (actionObj.unlocked) {
                actionObj.actionPower = actionData.hearAboutTheLich.calcFearGain();
                actionObj.resourceToAdd = actionObj.actionPower;
                actionObj.resource += actionObj.resourceToAdd;
            }
        },
        calcFearGain: function() {
            return Math.pow((data.totalMomentum + data.actions.overclock.resourceToAdd)/1e24, .25) *
                Math.sqrt(data.actions.gossipAroundCoffee.resource / 1e12);
        },
        onLevelAtts:[["integration", 200]],
        expAtts:[["legacy", 1], ["valor", 1], ["discernment", .01]],
        efficiencyAtts:[],
        extraButton: Raw.html`
            <span class="button" id='killTheLichMenuButton2' onclick="openKTLMenu()"
                style="display:none;padding:8px 13px;position:absolute;top:350px;left:60px;border: 2px solid #aa0000;border-radius: 5px;
                background-color:#550000;text-shadow: 3px 3px 2px rgba(0, 0, 0, 0.8);color: #ffdddd;box-shadow:0 0 10px 6px rgba(255, 0, 0, 0.7);font-size:26px;" >
            Kill the Lich!</span>
        `,
        unlockMessage:{english:"Unlocks when Gossip Around Coffee is level 5."},
        extraInfo: {english:Raw.html`This action gains (Momentum)^0.25 * (Conversations on Gossip)^0.5 / 1e12 Fear 
        for each Overclock complete, which is a gain of
        <span style="font-weight:bold;" id="hearAboutTheLichActionPower2">0</span>`}
    },

//--- From upgrades ---






};

//Shortcut pt 1
actionData = {
    ...actionData,

    watchBirds: {
        tier:1, plane:0,
        progressMaxBase:800000000, progressMaxIncrease:1,
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
        progressMaxBase:1e8, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.5, maxLevel:1,
        unlockCost:5e6, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
        },
        onUnlock: function() {
            addMaxLevel("bodyAwareness", 3);
        },
        onLevelAtts:[["observation", 120]],
        expAtts:[["curiosity", 1], ["concentration", 1]],
        efficiencyAtts:[["navigation", 1]],
        unlockMessage:{english:"On unlock, +3 max level for Body Awareness."},
        // storyText:{english:Raw.html`While off to the side of the path, you, at Scott's suggestion, focus on what you can
        // smell as well. Sometimes there's a certain scent on the breeze, like something sweet, hiding on the mountain.<br><br>
        // The foliage on the mountain becomes too thick to move in and find the source of the scent,
        // but you can at least tell Scott that you shared his experience.`}
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
        progressMaxBase:3e16, progressMaxIncrease:3,
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
        progressMaxBase:1e16, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:10,
        unlockCost:1e15, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction('hiddenPath')
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["observation", 2000]],
        expAtts:[["endurance", 1], ["flow", 1]],
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
            addMaxLevel("meetGrumpyHermit", 1);
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
        progressMaxBase:100e18, progressMaxIncrease:1,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.00003, maxLevel:1,
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
        progressMaxBase:1e18, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:4,
        unlockCost:5e18, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            statAddAmount("legacy", 1);
            unveilPlane(0);
            unveilPlane(1);
            data.actions.echoKindle.unlocked = true;
            revealAtt("legacy");
            unveilAction('echoKindle');
            unveilAction('sparkMana');
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
        onLevelAtts:[["integration", 40], ["curiosity", 500]],
        expAtts:[],
        efficiencyAtts:[],
        unlockMessage:{english:"On unlock, open Magic and +1 Legacy."},
        onLevelText:{english:"Unlocks new actions with each level."},
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
        efficiencyBase:.3, maxLevel:10,
        unlockCost:10, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction('chatWithMerchants')
        },
        onLevelCustom: function() {
            if(data.actions.learnToListen.level >= 10) {
                unveilAction('learnToInquire')
            }
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
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[["discernment", 1]]
    },
    chatWithHermit: {
        tier:1, plane:0, resourceName:"conversations",
        progressMaxBase:1000000, progressMaxIncrease:5,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:10,
        unlockCost:10000, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["confidence", 5]],
        expAtts:[["charm", 1]],
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
    learnToInquire: {
        tier:1, plane:0, resourceName:"conversations", creationVersion:2, automationOff: true,
        progressMaxBase:3e21, progressMaxIncrease:100,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:10,
        unlockCost:1e16, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {

        },
        onLevelCustom: function() {
            unveilAction('talkToTheRecruiters');
        },
        onLevelAtts:[["charm", 5000], ["discernment", 20]],
        expAtts:[["curiosity", 1], ["confidence", 1]],
        efficiencyAtts:[["discernment", .05]]
    },
    talkToTheRecruiters: {
        tier:1, plane:0, resourceName:"conversations", creationVersion:2, automationOff: true,
        progressMaxBase:1e20, progressMaxIncrease:100,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:2,
        unlockCost:1e16, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
            unveilAction('buyPointyHat');
        },
        onLevelCustom: function() {
            unveilAction('askAboutLocalWork');
            unveilAction('askAboutArcaneCorps');
        },
        onLevelAtts:[["confidence", 200]],
        expAtts:[["recognition", 1]],
        efficiencyAtts:[["discernment", .05]]
    },
    askAboutLocalWork: {
        tier:1, plane:0, resourceName:"conversations", creationVersion:2, automationOff: true,
        progressMaxBase:8e20, progressMaxIncrease:100,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:1,
        unlockCost:4e16, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('worksiteSweeper')
        },
        onLevelAtts:[["adaptability", 100]],
        expAtts:[["discernment", 1], ["adaptability", 1]],
        efficiencyAtts:[["discernment", .05]]
    },
    askAboutArcaneCorps: {
        tier:1, plane:0, resourceName:"conversations", creationVersion:2, automationOff: true,
        progressMaxBase:1e26, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.0005, maxLevel:2,
        unlockCost:2e16, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('getTestedForKnowledge');
        },
        onLevelAtts:[["recognition", 10000]],
        expAtts:[["discernment", 1], ["charm", 1], ["confidence", 1]],
        efficiencyAtts:[["discernment", .05], ["confidence", .1]]
    },
    getTestedForKnowledge: {
        tier:1, plane:0, resourceName:"conversations", creationVersion:2, automationOff: true,
        progressMaxBase:1e28, progressMaxIncrease:100,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:1,
        unlockCost:5e16, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('discussPlacement');
        },
        onLevelAtts:[["integration", 400]],
        expAtts:[["wizardry", 1], ["pulse", 1], ["vision", 1], ["control", 1]],
        efficiencyAtts:[["wizardry", .01]]
    },
    discussPlacement: {
        tier:1, plane:0, resourceName:"conversations", creationVersion:2, automationOff: true,
        progressMaxBase:1e20, progressMaxIncrease:5,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:4,
        unlockCost:1e18, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('meetTheMages');
        },
        onLevelAtts:[["discernment", 75]],
        expAtts:[["influence", 1]],
        efficiencyAtts:[["discernment", .05]]
    },
    meetTheMages: {
        tier:1, plane:0, resourceName:"conversations", creationVersion:2, automationOff: true,
        progressMaxBase:2e28, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:4,
        unlockCost:5e17, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('trainWithTeam');
            unlockAction(data.actions.trainWithTeam);
        },
        onLevelAtts:[["wizardry", 4000], ["control", 25]],
        expAtts:[["confidence", 1], ["charm", 1], ["wizardry", 1]],
        efficiencyAtts:[["discernment", .05]]
    },
    trainWithTeam: {
        tier:2, plane:0, resourceName:"teamwork", creationVersion:2, automationOff: true,
        progressMaxBase:30, progressMaxIncrease:0.8,
        expToLevelBase:300000, expToLevelIncrease:1000,
        // actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1,
        efficiencyBase:.2, maxLevel:2,
        unlockCost:0, visible:false, unlocked:false, purchased: false, hasUpstream:false, isSpellConsumer:true,
        isGenerator:true, generatorSpeed:1,
        onCompleteCustom: function() {
            let actionObj = data.actions.trainWithTeam;
            actionData.trainWithTeam.updateMults();

            if (actionObj.resourceToAdd > 0) {
                addResourceTo(actionObj, actionObj.resourceToAdd);
            }
            if(data.actions.trainWithTeam.level !== data.actions.trainWithTeam.maxLevel) {
                useActiveSpellCharges()
            }

            views.scheduleUpdate('trainWithTeamResourceTaken', intToString(actionObj.resourceToAdd, 1), "textContent")
            views.scheduleUpdate('trainWithTeamResourceSent', intToString(actionObj.expToAdd, 2), "textContent")
        },
        updateMults: function () {
            let actionObj = data.actions.trainWithTeam;
            let dataObj = actionData.trainWithTeam;

            actionObj.progressGain = dataObj.generatorSpeed * (actionObj.efficiency / 100);
            actionObj.resourceToAdd = getActiveSpellPower();
            actionObj.expToAddBase = actionObj.resourceToAdd;
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
        },
        onLevelCustom: function() {
            data.legacyMultKTL = 3 * data.actions.trainWithTeam.level;
            addMaxLevel('hearAboutTheLich', 1);
        },
        onUnlock: function() {
            data.legacyMultKTL = 3;
        },
        onLevelAtts:[],
        expAtts:[["wizardry", 1], ["peace", 1], ["intellect", .1]],
        efficiencyAtts:[["wizardry", .00005]],
        onLevelText:{english:"+1 to Hear About the Lich max level."},
        unlockMessage:{english:"Unlocks when Meet The Mages is level 1. On unlock, all legacy gained in KTL is multiplied by 3, and Fight is multiplied by 3."},
        extraInfo: {english:Raw.html`This action, when it completes, will consume one spell charge from all spells with Spell Power.<br>Legacy gain is further multiplied by the level of this action, starting at level 2.`},
        onCompleteText: {english:Raw.html`
                <span style="font-weight:bold;" id="trainWithTeamResourceTaken">???</span> Spell Power was used from active spells, giving <br>
                +<span style="font-weight:bold;" id="trainWithTeamResourceSent">???</span> Exp to this action.<br>
                `},
    },
//# spell power used, # exp gained



    learnToStayStill: {
        tier:1, plane:0,
        progressMaxBase:1e19, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:1,
        unlockCost:1e19, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction('meditate');
            unveilAction('journal');
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        // storyText: { english: Raw.html`
        // &nbsp;&nbsp;&nbsp;&nbsp;The first step in how to create your own magic: Stay Still. I had been trying not to do this, but with the
        // instructions of the hermit, I found new cause to try again. I don't hide my struggle with the task, and the old man scoffs.<br><br>
        //
        // &nbsp;&nbsp;&nbsp;&nbsp;"Do this on your own time, but later you should try meditation. Write things down if you have trouble with it."<br><br>
        //
        // &nbsp;&nbsp;&nbsp;&nbsp;He was surprisingly less grumpy as he said it, and with a look at my face his scowl returned.<br><br>
        // ` }
    },
    feelTheResonance: {
        tier:1, plane:0,
        progressMaxBase:1e17, progressMaxIncrease:1,
        expToLevelBase:100, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:1,
        unlockCost:3e19, visible:false, unlocked:false, purchased: true,
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
        unlockCost:1e20, visible:false, unlocked:false, purchased: true,
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
        unlockCost:3e20, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('pesterHermitForSecrets')
        },
        onLevelAtts:[["legacy", 9], ["pulse", 10]],
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
    pesterHermitForSecrets: {
        tier:1, plane:0,
        progressMaxBase:3e20, progressMaxIncrease:500,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:3,
        unlockCost:1e21, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
            unveilAction('restAtWaterfall')
        },
        onLevelCustom: function() {
            unveilAction('visitShrineBehindWaterfall')
            if(data.actions.pesterHermitForSecrets.level >= 2) {
                unveilAction('travelToCrossroads')
            }
            if(data.actions.pesterHermitForSecrets.level >= 3) {
                unveilAction('forgottenShrine')
            }
        },
        onLevelAtts:[["curiosity", 10000]],
        expAtts:[],
        efficiencyAtts:[],
        unlockMessage:{english:"On unlock and level, reveal a new action."}
    },
    restAtWaterfall: {
        tier:1, plane:0,
        progressMaxBase:6e20, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:2,
        unlockCost:2e21, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["flow", 110], ["concentration", 3000]],
        expAtts:[],
        efficiencyAtts:[]
    },
    forgottenShrine: {
        tier:1, plane:0,
        progressMaxBase:6e26, progressMaxIncrease:1,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:1,
        unlockCost:2e27, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["legacy", 30]],
        expAtts:[],
        efficiencyAtts:[]
    },
    visitShrineBehindWaterfall: {
        tier:1, plane:0,
        progressMaxBase:6e21, progressMaxIncrease:1,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:1,
        unlockCost:3e22, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["legacy", 20]],
        expAtts:[],
        efficiencyAtts:[],
        // storyText: {english: Raw.html`You pay respect to the shrine,
        // and feel your amulet resonate with feelings around this shrine.`}
    },
    travelToCrossroads: {
        tier:1, plane:0,
        progressMaxBase:1e27, progressMaxIncrease:6,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.02, maxLevel:10,
        unlockCost:3e23, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('feelAGentleTug')
        },
        onLevelAtts:[["observation", 30000]],
        expAtts:[["endurance", 1], ["navigation", 1]],
        efficiencyAtts:[["curiosity", .01]]
    },
}

//Meditate
actionData = {
    ...actionData,

    standStraighter: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e39, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:5,
        unlockCost:1e33, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('walkAware');
        },
        onLevelAtts:[["awareness", 2e4], ["coordination", 3000]],
        expAtts:[["endurance", 1], ["control", 1]],
        efficiencyAtts:[]
    },
    walkAware: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e43, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:5,
        unlockCost:1e37, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["awareness", 5e4], ["coordination", 5000]],
        expAtts:[["endurance", 1], ["control", 1]],
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
            addMaxLevel("bodyAwareness", 4);
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
        efficiencyBase:.15, maxLevel:2,
        unlockCost:11e7, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["endurance", 100]],
        expAtts:[["observation", 1], ["endurance", 1], ["geared", 1]],
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
        expAtts:[["observation", 1], ["endurance", 1], ["might", 1], ["geared", 1]],
        efficiencyAtts:[["flow", 1000]]
    },
}


//Jobs 1
actionData = {
    ...actionData,

    guildReceptionist: {
        tier:1, plane:0,
        progressMaxBase:1e21, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:8,
        wage: 500000,
        unlockCost:1e20, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            data.actions.guildReceptionist.wage += actionData.guildReceptionist.wage/2;
            changeJob('guildReceptionist');
        },
        onUnlock:function() {
            changeJob('guildReceptionist');
        },
        onLevelAtts:[["adaptability", 16]],
        expAtts:[],
        efficiencyAtts:[["adaptability", .05]],
        unlockMessage:{english:"On unlock, set job to Guild Receptionist for a base wage of $500k."},
        onLevelText:{english:"Increase wage +50%."}
    },
    messenger: {
        tier:1, plane:0,
        progressMaxBase:1e23, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:8,
        wage: 4e6,
        unlockCost:1e22, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            data.actions.messenger.wage += actionData.messenger.wage/2;
            changeJob('messenger');
        },
        onUnlock:function() {
            changeJob('messenger');
        },
        onLevelAtts:[["adaptability", 32]],
        expAtts:[],
        efficiencyAtts:[["adaptability", .05]],
        unlockMessage:{english:"On unlock, set job to Messenger for a base wage of $4m."},
        onLevelText:{english:"Increase wage +50%."}
    },
    townCrier: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e28, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.03, maxLevel:8,
        wage: 25e6,
        unlockCost:1e29, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            data.actions.townCrier.wage += actionData.townCrier.wage/2;
            changeJob('townCrier');
        },
        onUnlock:function() {
            changeJob('townCrier');
        },
        onLevelAtts:[["adaptability", 100]],
        expAtts:[],
        efficiencyAtts:[["adaptability", .05]],
        unlockMessage:{english:"On unlock, set job to Town Crier for a base wage of $25m."},
        onLevelText:{english:"Increase wage +50%."}
    },
    storyTeller: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e30, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:8,
        wage: 150e6,
        unlockCost:1e31, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            data.actions.storyTeller.wage += actionData.storyTeller.wage/2;
            changeJob('storyTeller');
        },
        onUnlock:function() {
            changeJob('storyTeller');
        },
        onLevelAtts:[["adaptability", 100]],
        expAtts:[],
        efficiencyAtts:[["adaptability", .05]],
        unlockMessage:{english:"On unlock, set job to Story Teller for a base wage of $150m."},
        onLevelText:{english:"Increase wage +50%."}
    },
    worksiteSweeper: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e29, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:8,
        wage: 15e6,
        unlockCost:1e29, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            data.actions.worksiteSweeper.wage += actionData.worksiteSweeper.wage/2;
            changeJob('worksiteSweeper');
        },
        onUnlock:function() {
            changeJob('worksiteSweeper');
        },
        onLevelAtts:[["adaptability", 100]],
        expAtts:[],
        efficiencyAtts:[["wizardry", .01]],
        unlockMessage:{english:"On unlock, set job to Dig Foundation for a base wage of $15m."},
        onLevelText:{english:"Increase wage +50%."}
    },
    digFoundation: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:5e30, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:8,
        wage: 100e6,
        unlockCost:5e30, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            data.actions.digFoundation.wage += actionData.digFoundation.wage/2;
            changeJob('digFoundation');
        },
        onUnlock:function() {
            changeJob('digFoundation');
        },
        onLevelAtts:[["adaptability", 100]],
        expAtts:[],
        efficiencyAtts:[["wizardry", .01]],
        unlockMessage:{english:"On unlock, set job to Dig Foundation for a base wage of $100m."},
        onLevelText:{english:"Increase wage +50%."}
    },
    stoneCompression: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e32, progressMaxIncrease:5,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.002, maxLevel:8,
        wage: 500e6,
        unlockCost:1e32, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            data.actions.stoneCompression.wage += actionData.stoneCompression.wage/2;
            changeJob('stoneCompression');
        },
        onUnlock:function() {
            changeJob('stoneCompression');
        },
        onLevelAtts:[["adaptability", 200]],
        expAtts:[],
        efficiencyAtts:[["wizardry", .01]],
        unlockMessage:{english:"On unlock, set job to Stone Compression for a base wage of $500m."},
        onLevelText:{english:"Increase wage +50%."}
    },
    shapeBricks: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e35, progressMaxIncrease:5,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:8,
        wage: 2e9,
        unlockCost:1e35, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            data.actions.shapeBricks.wage += actionData.shapeBricks.wage/2;
            changeJob('shapeBricks');
        },
        onUnlock:function() {
            changeJob('shapeBricks');
        },
        onLevelAtts:[["adaptability", 200]],
        expAtts:[],
        efficiencyAtts:[["wizardry", .01]],
        unlockMessage:{english:"On unlock, set job to Shape Bricks for a base wage of $2b."},
        onLevelText:{english:"Increase wage +50%."}
    },
    tidyMagesmithShop: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e38, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.0005, maxLevel:8,
        wage: 5e9,
        unlockCost:1e38, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            data.actions.tidyMagesmithShop.wage += actionData.tidyMagesmithShop.wage/2;
            changeJob('tidyMagesmithShop');
        },
        onUnlock:function() {
            changeJob('tidyMagesmithShop');
        },
        onLevelAtts:[["adaptability", 300]],
        expAtts:[],
        efficiencyAtts:[["wizardry", .01]],
        unlockMessage:{english:"On unlock, set job to Tidy Magesmith Shop for a base wage of $5b."},
        onLevelText:{english:"Increase wage +50%."}
    },
    clearTheBasement: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e41, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.0004, maxLevel:8,
        wage: 15e9,
        unlockCost:1e41, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            data.actions.clearTheBasement.wage += actionData.clearTheBasement.wage/2;
            changeJob('clearTheBasement');
        },
        onUnlock:function() {
            changeJob('clearTheBasement');
        },
        onLevelAtts:[["adaptability", 300]],
        expAtts:[],
        efficiencyAtts:[["wizardry", .01]],
        unlockMessage:{english:"On unlock, set job to Clear The Basement for a base wage of $15b."},
        onLevelText:{english:"Increase wage +50%."}
    },
    moldBarsFromScrap: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e44, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.0002, maxLevel:8,
        wage: 50e9,
        unlockCost:1e44, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            data.actions.moldBarsFromScrap.wage += actionData.moldBarsFromScrap.wage/2;
            changeJob('moldBarsFromScrap');
        },
        onUnlock:function() {
            changeJob('moldBarsFromScrap');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[["wizardry", .01]],
        unlockMessage:{english:"On unlock, set job to Mold Bars From Scrap for a base wage of $50b."},
        onLevelText:{english:"Increase wage +50%."}
    },
    mendGearCracks: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e47, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:8,
        wage: 150e9,
        unlockCost:1e47, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            data.actions.mendGearCracks.wage += actionData.mendGearCracks.wage/2;
            changeJob('mendGearCracks');
        },
        onUnlock:function() {
            changeJob('mendGearCracks');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[["wizardry", .01]],
        unlockMessage:{english:"On unlock, set job to Mend Gear Cracks for a base wage of $150b."},
        onLevelText:{english:"Increase wage +50%."}
    },
    assistantMagesmith: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e50, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.00005, maxLevel:8,
        wage: 250e9,
        unlockCost:1e50, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            data.actions.assistantMagesmith.wage += actionData.assistantMagesmith.wage/2;
            changeJob('assistantMagesmith');
        },
        onUnlock:function() {
            changeJob('assistantMagesmith');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[["wizardry", .01]],
        unlockMessage:{english:"On unlock, set job to Apprentice Magesmith for a base wage of $250b."},
        onLevelText:{english:"Increase wage +50%."}
    },


}


//After Hermit
actionData = {
    ...actionData,

    meditate: {
        tier:1, plane:0,
        progressMaxBase:1e30, progressMaxIncrease:40,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:1,
        unlockCost:1e22, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            if(data.actions.meditate.level >= 10) {
                unveilAction('standStraighter');
            }
        },
        onLevelAtts:[["awareness", 3000], ["cycle", 10]],
        expAtts:[["curiosity", 1], ["flow", 1], ["concentration", 1], ["discernment", 1]],
        efficiencyAtts:[["integration", 10]]
    },
    journal: {
        tier:1, plane:0,
        progressMaxBase:1e30, progressMaxIncrease:40,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:4,
        unlockCost:1e22, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            addMaxLevel("meditate", 1);
        },
        onUnlock: function() {
        },
        onLevelAtts:[["curiosity", 5000], ["awareness", 3000]],
        expAtts:[["energy", 1], ["observation", 1]],
        efficiencyAtts:[["cycle", 2]],
        unlockMessage:{english:"On level, +1 max level for Meditate."},
        onLevelText:{english:"+1 max level for Meditate."}
    },
    processEmotions: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e30, progressMaxIncrease:3,
        expToLevelBase:1, expToLevelIncrease:2,
        efficiencyBase:.01, maxLevel:0,
        unlockCost:1e29, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('readTheWritten')
            unveilAction('siftExcess')
            addMaxLevel("readTheWritten", 1)
            addMaxLevel("siftExcess", 1)
        },
        onLevelAtts:[["concentration", 10000]],
        expAtts:[["valor", 1]],
        efficiencyAtts:[["cycle", .5]],
        onLevelText:{english:"+1 max level for Read The Written.<br>+1 max level for Sift Excess.<br>"}
    },
    readTheWritten: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:2e40, progressMaxIncrease:6,
        expToLevelBase:1, expToLevelIncrease:2,
        efficiencyBase:.01, maxLevel:0,
        unlockCost:2e29, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["awareness", 10000]],
        expAtts:[["energy", 1], ["curiosity", 1], ["valor", 1]],
        efficiencyAtts:[["cycle", .5]]
    },
    siftExcess: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e46, progressMaxIncrease:6,
        expToLevelBase:1, expToLevelIncrease:2,
        efficiencyBase:.01, maxLevel:0,
        unlockCost:4e29, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
        },
        onLevelAtts:[["flow", 200], ["cycle", 100], ["control", 20]],
        expAtts:[["energy", 1], ["awareness", 1], ["observation", 1]],
        efficiencyAtts:[["cycle", .5]]
    },
    feelAGentleTug: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:5e35, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:3,
        unlockCost:5e26, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
            unveilAction('leaveTheOpenRoad')
            addMaxLevel("journal", 1);
        },
        onLevelCustom: function() {

        },
        onLevelAtts:[["curiosity", 30000]],
        expAtts:[["observation", 1], ["concentration", 1]],
        efficiencyAtts:[["navigation", 1]],
        unlockMessage:{english:"On unlock, +1 max level for Journal."},
    },
    leaveTheOpenRoad: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e34, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:3,
        unlockCost:1e27, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
            unveilAction('findOverlook')
            addMaxLevel("journal", 1);
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["observation", 200000], ["endurance", 20000]],
        expAtts:[["might", 1], ["endurance", 1]],
        efficiencyAtts:[["navigation", 1]],
        unlockMessage:{english:"On unlock, +1 max level for Journal."},
    },
    findOverlook: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e31, progressMaxIncrease:1000,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.02, maxLevel:1,
        unlockCost:5e27, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
            addMaxLevel("journal", 1);
        },
        onLevelCustom: function() {
            unveilAction('discoverBurntTown')
        },
        onLevelAtts:[["concentration", 5000], ["vision", 300], ["navigation", 300]],
        expAtts:[["might", 1]],
        efficiencyAtts:[["geared", .001]],
        unlockMessage:{english:"On unlock, +1 max level for Journal."},
    },
    discoverBurntTown: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:5e32, progressMaxIncrease:4,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.03, maxLevel:10,
        unlockCost:2e29, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
            addMaxLevel("journal", 1);
        },
        onLevelCustom: function() {
            unveilAction('stepThroughAsh');
            if(data.actions.discoverBurntTown.level >= 2) {
                unveilAction('resonanceCompass')
            }
            if(data.actions.discoverBurntTown.level >= 3) {
                unveilAction('feelTheDespair')
            }
            if(data.actions.discoverBurntTown.level >= 4) {
                unveilAction('repairShatteredShrine')
            }
        },
        onLevelAtts:[["valor", 1]],
        expAtts:[["endurance", 1]],
        efficiencyAtts:[["geared", .001]],
        unlockMessage:{english:"On unlock, +1 max level for Journal."},
    },
    feelTheDespair: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:2e29, progressMaxIncrease:3,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:2,
        unlockCost:2e29, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["legacy", 150]],
        expAtts:[],
        efficiencyAtts:[]
    },
    repairShatteredShrine: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e30, progressMaxIncrease:3,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:2,
        unlockCost:1e30, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["legacy", 300]],
        expAtts:[],
        efficiencyAtts:[]
    },
    stepThroughAsh: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e28, progressMaxIncrease:6,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:5,
        unlockCost:2e29, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('processEmotions')
            unveilAction('graspTheTragedy')
            addMaxLevel("processEmotions", 1)
        },
        onLevelAtts:[["valor", 3]],
        expAtts:[["valor", 10]],
        efficiencyAtts:[["awareness", .001], ["flow", .1]],
        onLevelText:{english:"+1 max level for Process Emotions."}
    },
    graspTheTragedy: {
        tier:2, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:3e31, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:2,
        unlockCost:3e30, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["integration", 400], ["valor", 5]],
        expAtts:[["valor", 10]],
        efficiencyAtts:[["valor", 10]]
    },
    resonanceCompass: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:3e28, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:5,
        unlockCost:5e29, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('clearIvyWall')
        },
        onLevelAtts:[["curiosity", 7e4]],
        expAtts:[["legacy", .001]],
        efficiencyAtts:[["curiosity", .01]]
    },
    clearIvyWall: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:3e35, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:5,
        unlockCost:5e29, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('findPulsingShard')
            unveilAction('scavengeForSupplies')
        },
        onLevelAtts:[["coordination", 2000]],
        expAtts:[["might", 1], ["endurance", 1]],
        efficiencyAtts:[["curiosity", .0005]]
    },
    findPulsingShard: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e36, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:1,
        unlockCost:5e30, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["legacy", 1000], ["pulse", 200]],
        expAtts:[["observation", 1]],
        efficiencyAtts:[["curiosity", .0005]]
    },
    scavengeForSupplies: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e39, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:5,
        unlockCost:3e30, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
            addMaxLevel("stepThroughAsh", 1)
        },
        onLevelCustom: function() {
            unveilAction('skimAHeavyTome')
        },
        onLevelAtts:[["observation", 3e5], ["might", 5000]],
        expAtts:[["coordination", 1], ["endurance", 1]],
        efficiencyAtts:[["curiosity", .001]],
        unlockMessage:{english:"On unlock, +1 max level for Step Through Ash."}
    },
    skimAHeavyTome: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:8e41, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:5,
        unlockCost:2e31, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
            addMaxLevel("stepThroughAsh", 1)
            addMaxLevel("meditate", 1)
        },
        onLevelCustom: function() {
            unveilAction('clearRubble')
        },
        onLevelAtts:[["discernment", 100]],
        expAtts:[["concentration", 1], ["flow", 1], ["endurance", 1]],
        efficiencyAtts:[["curiosity", .01]],
        unlockMessage:{english:"On unlock, +1 max level for Step Through Ash and Meditate."}
    },
    clearRubble: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:2e38, progressMaxIncrease:5,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.002, maxLevel:10,
        unlockCost:3e31, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
            addMaxLevel("stepThroughAsh", 1)
        },
        onLevelCustom: function() {
            unveilAction('readFadedMarkers')
        },
        onLevelAtts:[["endurance", 3e4], ["coordination", 4000]],
        expAtts:[["might", 1], ["discernment", 1]],
        efficiencyAtts:[["navigation", 1]],
        unlockMessage:{english:"On unlock, +1 max level for Step Through Ash."}
    },
    readFadedMarkers: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e37, progressMaxIncrease:6,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.002, maxLevel:5,
        unlockCost:6e31, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
            addMaxLevel("stepThroughAsh", 1)
        },
        onLevelCustom: function() {
            unveilAction('mapOutTraps')
        },
        onLevelAtts:[["concentration", 3e4], ["navigation", 200]],
        expAtts:[["observation", 1]],
        efficiencyAtts:[["navigation", 1]],
        unlockMessage:{english:"On unlock, +1 max level for Step Through Ash."}
    },
    mapOutTraps: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:2e33, progressMaxIncrease:1.2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.002, maxLevel:10,
        unlockCost:1e32, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
            addMaxLevel("stepThroughAsh", 1)
        },
        onLevelCustom: function() {
            unveilAction('accessForbiddenArea')
        },
        onLevelAtts:[["observation", 2e5], ["flow", 100]],
        expAtts:[["discernment", 1]],
        efficiencyAtts:[["navigation", 1]],
        unlockMessage:{english:"On unlock, +1 max level for Step Through Ash."}
    },
    accessForbiddenArea: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:2e36, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.002, maxLevel:1,
        unlockCost:2e32, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('collectSpellBooks')
        },
        onLevelAtts:[["awareness", 5e4]],
        expAtts:[["coordination", 1]],
        efficiencyAtts:[["navigation", 1]]
    },
    collectSpellBooks: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e32, progressMaxIncrease:5,
        expToLevelBase:1, expToLevelIncrease:2,
        efficiencyBase:.002, maxLevel:4,
        unlockCost:3e32, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('readBooks');
            addMaxLevel('catalogNewBooks', 1);
            unveilAction('catalogNewBooks');
            unveilAction('findAFamiliarLanguage');
        },
        onLevelAtts:[["wizardry", 5000], ["spellcraft", 1]],
        expAtts:[],
        efficiencyAtts:[["navigation", 1]]
    },
    findAFamiliarLanguage: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e46, progressMaxIncrease:100,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.02, maxLevel:5,
        unlockCost:1e35, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('searchForRelevantBooks');
        },
        onLevelAtts:[["observation", 1e6]],
        expAtts:[["awareness", 1], ["adaptability", 1], ["curiosity", 1]],
        efficiencyAtts:[["navigation", .01]]
    },
    searchForRelevantBooks: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e44, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.02, maxLevel:5,
        unlockCost:3e35, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('collectInterestingBooks');
        },
        onLevelAtts:[["curiosity", 3e5]],
        expAtts:[["observation", 1], ["discernment", 1], ["logistics", 1]],
        efficiencyAtts:[["navigation", .01]]
    },
    collectInterestingBooks: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e42, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.02, maxLevel:3,
        unlockCost:1e36, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('collectHistoryBooks');
        },
        onLevelAtts:[["intellect", 1]],
        expAtts:[["discernment", 1], ["curiosity", 1], ["logistics", 1]],
        efficiencyAtts:[["navigation", .01]]
    },
    collectHistoryBooks: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e42, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:3,
        unlockCost:1e37, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
            addMaxLevel('catalogNewBooks', 3);
        },
        onLevelCustom: function() {
            unveilAction('studyHistory');
            if(data.actions.collectHistoryBooks.level >= 2) {
                unveilAction('readOldStories');
            }
            if(data.actions.collectHistoryBooks.level >= 3) {
                unveilAction('readWarJournals');
            }
            if(data.actions.collectHistoryBooks.level >= 4) {
                unveilAction('readOldReligiousTexts');
            }
            if(data.actions.collectHistoryBooks.level >= 5) {
                unveilAction('collectMathBooks');
                unveilAction('readOldPoetry');
            }
            if(data.actions.collectHistoryBooks.level >= 6) {
                unveilAction('readOldProphecies');
                unveilAction('browseFantasyNovels');
            }
            if(data.actions.collectHistoryBooks.level >= 7) {
                unveilAction('readOldPhilosophy');
                unveilAction('complainAboutDifficulty');
            }
        },
        onLevelAtts:[["intellect", 2]],
        expAtts:[["curiosity", 1], ["logistics", 1]],
        efficiencyAtts:[["logistics", 1]]
    },
    browseFantasyNovels: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:2e46, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:5,
        unlockCost:2e41, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["curiosity", 1e6], ["charm", 5e4], ["valor", 40]],
        expAtts:[["observation", 1]],
        efficiencyAtts:[["navigation", .01]]
    },
    recognizeRunicLanguages: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:4e41, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:5,
        unlockCost:4e41, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["observation", 5e6], ["pulse", 750]],
        expAtts:[["spellcraft", 1]],
        efficiencyAtts:[["navigation", .01]]
    },
    catalogUnknownLanguages: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e49, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:4,
        unlockCost:1e44, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["concentration", 3e5], ["discernment", 300]],
        expAtts:[["curiosity", 1]],
        efficiencyAtts:[["navigation", .01]]
    },
    complainAboutDifficulty: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e48, progressMaxIncrease:100,
        expToLevelBase:100, expToLevelIncrease:1,
        efficiencyBase:.005, maxLevel:3,
        unlockCost:1e44, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["amplification", 5e5], ["legacy", 1e5]],
        expAtts:[["curiosity", 1]],
        efficiencyAtts:[["navigation", .01]]
    },
    decipherOrganization: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:3e50, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:4,
        unlockCost:3e44, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["navigation", 3000], ["logistics", 20]],
        expAtts:[["observation", 1]],
        efficiencyAtts:[["navigation", .01]]
    },
    collectMathBooks: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e47, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:3,
        unlockCost:1e40, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            addMaxLevel('catalogNewBooks', 2);
            addMaxLevel('studyCryptology', 1);

            if(data.actions.collectMathBooks.level >= 4) {
                unveilAction('clearTheDust');
            }
        },
        onLevelAtts:[["cycle", 5000], ["intellect", 5]],
        expAtts:[["curiosity", 1], ["logistics", 1]],
        efficiencyAtts:[["logistics", 1]]
    },

    clearTheDust: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e50, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.005, maxLevel:10,
        unlockCost:1e46, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["coordination", 1e4], ["vision", 2000]],
        expAtts:[["endurance", 1]],
        efficiencyAtts:[["navigation", 1]]
    },
    markTheLayout: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:3e52, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.005, maxLevel:5,
        unlockCost:3e46, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["awareness", 4e6], ["endurance", 1e5], ["navigation", 6000]],
        expAtts:[["coordination", 1], ["observation", 1]],
        efficiencyAtts:[["navigation", 1]]
    },
    dismantleShelves: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e52, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.005, maxLevel:5,
        unlockCost:1e47, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["coordination", 1.5e4], ["might", 1e4]],
        expAtts:[["endurance", 1]],
        efficiencyAtts:[["navigation", 1]]
    },
    comprehendDifficultTexts: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e53, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.005, maxLevel:5,
        unlockCost:1e48, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["concentration", 1e6], ["wizardry", 1e5]],
        expAtts:[["endurance", 1]],
        efficiencyAtts:[["navigation", 1]]
    },
    examineTheArchitecture: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:3e53, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.005, maxLevel:5,
        unlockCost:3e48, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["observation", 1e7], ["logistics", 40]],
        expAtts:[["concentration", 1]],
        efficiencyAtts:[["navigation", 1]]
    },

    pryGemLoose: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e50, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:1,
        unlockCost:1e50, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["legacy", 5e5]],
        expAtts:[],
        efficiencyAtts:[["might", .001]]
    },



    readBooks: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e37, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:1,
        unlockCost:5e32, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["intellect", 5]],
        expAtts:[["comfort", 1]],
        efficiencyAtts:[["curiosity", .1]]
    },
    catalogNewBooks: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:5e44, progressMaxIncrease:12,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:0,
        unlockCost:6e32, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('study')
            unveilAction('researchBySubject')
            if(data.actions.catalogNewBooks.level >= 2) {
                unveilAction('studyMagic')
            }
            if(data.actions.catalogNewBooks.level >= 3) {
                unveilAction('studySupportSpells')
            }
            if(data.actions.catalogNewBooks.level >= 4) {
                unveilAction('studyEarthMagic')
            }
            if(data.actions.catalogNewBooks.level >= 7) {
                unveilAction('studyPracticalMagic');
            }
            if(data.actions.catalogNewBooks.level >= 9) {
                unveilAction('studyMath');
            }
            if(data.actions.catalogNewBooks.level >= 11) {
                unveilAction('studyCryptology');
            }
            if(data.actions.catalogNewBooks.level >= 13) {
                unveilAction('studyAdvancedEarthMagic');
            }
            if(data.actions.catalogNewBooks.level >= 15) {
                unveilAction('studyArchitecture');
            }
            if(data.actions.catalogNewBooks.level >= 17) {
                unveilAction('studyAdvancedPracticalMagic');
            }
        },
        onLevelAtts:[["concentration", 4e4]],
        expAtts:[["curiosity", 1], ["observation", 1], ["comfort", 1], ["intellect", 1], ["logistics", 1]],
        efficiencyAtts:[["curiosity", .1]]
    },
    buildPersonalLibrary: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:3e37, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:0,
        unlockCost:3e38, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["integration", 300], ["spellcraft", 10], ["intellect", 3]],
        expAtts:[["logistics", 1]],
        efficiencyAtts:[["logistics", 1]]
    },
    expandPersonalLibrary: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:3e40, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:0,
        unlockCost:3e38, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["integration", 400], ["comfort", 20], ["intellect", 10]],
        expAtts:[["logistics", 1]],
        efficiencyAtts:[["logistics", 1]]
    },
    study: {
        tier:2, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:3e35, progressMaxIncrease:1.1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1,
        unlockCost:1e33, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            let actionObj = data.actions.study;
            actionObj.resourceToAdd = Math.pow((1+actionObj.level/10), 3) * data.actions.study.upgradeMult;

            addResourceTo(data.actions.researchBySubject, actionObj.resourceToAdd);
        },
        updateUpgradeMult: function () {
            let upgradeMult = 1;
            upgradeMult *= Math.pow(1.25, data.upgrades.studyHarder.upgradePower);
            data.actions.study.upgradeMult = upgradeMult;
        },
        onLevelAtts:[],
        expAtts:[["integration", 1], ["intellect", 1], ["comfort", 1], ["logistics", 1], ["peace", 1]],
        efficiencyAtts:[]
    },
    researchBySubject: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, automationOff: true,
        progressMaxBase:10, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:1,
        unlockCost:5, visible:false, unlocked:false, purchased: false, hasUpstream:false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["comfort", 5]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]]
    },
    studyMagic: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, automationOff: true,
        progressMaxBase:20, progressMaxIncrease:3,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:2,
        unlockCost:10, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["spark", 20], ["spellcraft", 3], ["intellect", 1]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]]
    },
    studySupportSpells: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, automationOff: true,
        progressMaxBase:200, progressMaxIncrease:3,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:3,
        unlockCost:200, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            purchaseAction('listenToTheMana');
            unveilAction('listenToTheMana');
            if(data.actions.studySupportSpells.level >= 2) {
                purchaseAction('manaVisualizations')
                unveilAction('manaVisualizations');
            }
            if(data.actions.studySupportSpells.level >= 3) {
                purchaseAction('auraControl')
                unveilAction('auraControl');
            }
        },
        onLevelAtts:[["spellcraft", 4]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]]
    },
    studyEarthMagic: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, automationOff: true,
        progressMaxBase:2000, progressMaxIncrease:4,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:3,
        unlockCost:2000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            purchaseAction('moveEarth')
            unveilAction('moveEarth');
            if(data.actions.studyEarthMagic.level >= 2) {
                purchaseAction('hardenEarth')
                unveilAction('hardenEarth');
            }
            if(data.actions.studyEarthMagic.level >= 3) {
                purchaseAction('shapeEarth')
                unveilAction('shapeEarth');
            }
        },
        onLevelAtts:[["spellcraft", 6]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]]
    },
    studyPracticalMagic: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, automationOff: true,
        progressMaxBase:11000, progressMaxIncrease:4,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:2,
        unlockCost:11000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            purchaseAction('practicalMagic')
            unveilAction('practicalMagic');
            if(data.actions.studyPracticalMagic.level >= 2) {
                purchaseAction('illuminate')
                unveilAction('illuminate');
            }
        },
        onLevelAtts:[["spellcraft", 15]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]]
    },
    studyMath: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, automationOff: true,
        progressMaxBase:2.5e4, progressMaxIncrease:2,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.025, maxLevel:2,
        unlockCost:2.5e4, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            if(data.actions.studyMath.level >= 2) {
                unveilAction('recognizeRunicLanguages');
            }
        },
        onLevelAtts:[["logistics", 10]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]]
    },
    studyCryptology: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, automationOff: true,
        progressMaxBase:4e4, progressMaxIncrease:1.5,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.025, maxLevel:0,
        unlockCost:4e4, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            if(data.actions.studyCryptology.level >= 1) {
                unveilAction('catalogUnknownLanguages');
            }
            if(data.actions.studyCryptology.level >= 3) {
                unveilAction('decipherOrganization');
            }
            if(data.actions.studyCryptology.level >= 5) {
                unveilAction('comprehendDifficultText');
            }
        },
        onLevelAtts:[["intellect", 10]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]]
    },
    studyArchitecture: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, automationOff: true,
        progressMaxBase:6e4, progressMaxIncrease:1.5,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.025, maxLevel:5,
        unlockCost:6e4, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            addMaxLevel("expandPersonalLibrary", 1);
            if(data.actions.studyArchitecture.level >= 1) {
                unveilAction('expandPersonalLibrary');
            }
            if(data.actions.studyArchitecture.level >= 2) {
                unveilAction('markTheLayout');
            }
            if(data.actions.studyArchitecture.level >= 3) {
                unveilAction('dismantleShelves');
            }
            if(data.actions.studyArchitecture.level >= 4) {
                unveilAction('examineTheArchitecture');
            }
            if(data.actions.studyArchitecture.level >= 5) {
                unveilAction('pryGemLoose');
            }
        },
        onLevelAtts:[["logistics", 20]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]]
    },
    studyAdvancedEarthMagic: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, automationOff: true,
        progressMaxBase:6e4, progressMaxIncrease:3,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.025, maxLevel:3,
        unlockCost:6e4, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
            purchaseAction('moveIron');
            unveilAction('moveIron');
            if(data.actions.studyAdvancedEarthMagic.level >= 2) {
                purchaseAction('reinforceArmor')
                unveilAction('reinforceArmor');
            }
            if(data.actions.studyAdvancedEarthMagic.level >= 3) {
                purchaseAction('restoreEquipment')
                unveilAction('restoreEquipment');
            }
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["spellcraft", 20]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]]
    },
    studyAdvancedPracticalMagic: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, automationOff: true,
        progressMaxBase:10e4, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:3,
        unlockCost:10e4, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]]
    },
    studyHistory: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, automationOff: true,
        progressMaxBase:1e4, progressMaxIncrease:1.5,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:2,
        unlockCost:1e4, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            if(data.actions.studyHistory.level >= 2) {
                unveilAction("reviewOldMemories")
            }
        },
        onLevelAtts:[["navigation", 4000], ["integration", 300]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]]
    },
    readOldStories: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, automationOff: true,
        progressMaxBase:1.2e4, progressMaxIncrease:1.5,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:2,
        unlockCost:1.2e4, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            if(data.actions.readOldStories.level >= 2) {
                unveilAction("rememberFriends")
            }
        },
        onLevelAtts:[["vision", 4000]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]]
    },
    readWarJournals: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, automationOff: true,
        progressMaxBase:1.5e4, progressMaxIncrease:1.5,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:2,
        unlockCost:1.5e4, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            if(data.actions.readWarJournals.level >= 2) {
                unveilAction("rememberTheWar")
            }
        },
        onLevelAtts:[["valor", 25]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]]
    },
    readOldReligiousTexts: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, automationOff: true,
        progressMaxBase:2e4, progressMaxIncrease:1.5,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.03, maxLevel:2,
        unlockCost:2e4, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            if(data.actions.readOldReligiousTexts.level >= 2) {
                unveilAction("honorTheLost")
            }
        },
        onLevelAtts:[["curiosity", 1e6]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]]
    },
    readOldProphecies: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, automationOff: true,
        progressMaxBase:3e4, progressMaxIncrease:2,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.03, maxLevel:2,
        unlockCost:3e4, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["legacy", 20000]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]]
    },
    readOldPoetry: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, automationOff: true,
        progressMaxBase:2.5e4, progressMaxIncrease:1.5,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.03, maxLevel:3,
        unlockCost:2.5e4, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["pulse", 500], ["intellect", 10]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]]
    },
    readOldPhilosophy: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, automationOff: true,
        progressMaxBase:5e4, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.03, maxLevel:1,
        unlockCost:5e4, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            purchaseAction('overponder')
            unveilAction('overponder')
            unveilAction('letGoOfGuilt')
        },
        onLevelAtts:[["intellect", 30], ["peace", 10]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]]
    },
    reviewOldMemories: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e38, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:2,
        efficiencyBase:.0001, maxLevel:5,
        unlockCost:2e37, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["awareness", 1e5], ["flow", 500], ["cycle", 3000]],
        expAtts:[["valor", 1]],
        efficiencyAtts:[["cycle", 1]]
    },
    rememberFriends: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e41, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:5,
        unlockCost:5e37, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["awareness", 2e5], ["integration", 300], ["peace", 1]],
        expAtts:[["cycle", 1], ["valor", 1]],
        efficiencyAtts:[["cycle", 1]]
    },
    rememberTheWar: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e42, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:5,
        unlockCost:3e38, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["awareness", 4e5], ["flow", 800], ["valor", 20]],
        expAtts:[["cycle", 1], ["peace", 10]],
        efficiencyAtts:[["cycle", 1]]
    },
    honorTheLost: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e42, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.00005, maxLevel:5,
        unlockCost:1e41, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["awareness", 1e6], ["flow", 3000], ["peace", 2]],
        expAtts:[["peace", 10]],
        efficiencyAtts:[["cycle", 1]]
    },
    letGoOfGuilt: {
        tier:1, plane:0, creationVersion:2, automationOff: true,
        progressMaxBase:1e49, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.00005, maxLevel:5,
        unlockCost:1e43, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["awareness", 5e6], ["valor", 50], ["peace", 5]],
        expAtts:[["flow", 1]],
        efficiencyAtts:[["cycle", 1]]
    },

    /*
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
     */
}


//==== plane1 ====
actionData = {
    ...actionData,

    worry: {
        tier:0, plane:2, resourceName: "fear",
        progressMaxBase:1, progressMaxIncrease:1,
        expToLevelBase:1000, expToLevelIncrease:10,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, generatorTarget:"worry",
        unlockCost:0, visible:false, unlocked:false, isGenerator:true, generatorSpeed:2, hasUpstream: false,
        onCompleteCustom: function() {
            let actionObj = data.actions.worry;
            actionData.worry.updateMults();

            addResourceTo(data.actions["resolve"], actionObj.resourceToAdd);
            addResourceTo(data.actions["worry"], actionObj.resourceToAdd);


            views.scheduleUpdate('worryResourceSent', intToString(actionObj.resourceToAdd, 2), "textContent")
            views.scheduleUpdate('worryResourceTaken', intToString(actionObj.resourceToAdd, 2), "textContent")
        },
        updateMults: function () {
            let actionObj = data.actions.worry;
            let dataObj = actionData.worry;

            actionObj.progressGain = dataObj.generatorSpeed * (actionObj.efficiency / 100);
            actionObj.actionPower = actionObj.actionPowerBase *
                actionObj.actionPowerMult * (actionObj.efficiency/100);
            let resourceTaken = actionObj.resource * actionObj.tierMult();
            actionObj.resourceToAdd = dataObj.actionPowerFunction(resourceTaken) *
                actionObj.actionPower * actionObj.upgradeMult;
            data.actions.resolve.resourceIncrease = actionObj.resourceToAdd * actionObj.progressGain / actionObj.progressMax;
            actionObj.expToAddBase = actionObj.resourceToAdd;
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
        },
        actionPowerFunction: function(resource) {
            return resource / 10;
        },
        onCompleteText: {english:Raw.html`
                +<span style="font-weight:bold;" id="worryResourceTaken">???</span> Fear to this action, and also <br>
                +<span style="font-weight:bold;" id="worryResourceSent">???</span> Bravery, added to Resolve.<br>
                `},
        onLevelAtts:[["doom", 10]],
        expAtts:[],
        efficiencyAtts:[["doom", -1]],
        extraInfo: {english:Raw.html`<br>Adds equal Fear and Bravery to this action and Resolve.<br> 
                        Amount added = 10% of Fear * Efficiency per complete.<br>`},
    },
    resolve: {
        tier:0, plane:2, resourceName: "bravery",
        progressMaxBase:10, progressMaxIncrease:2,
        expToLevelBase:5, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true,
        unlockCost:0, visible:false, unlocked:false, hasUpstream: false,
        onLevelAtts:[["courage", 5]],
        expAtts:[["courage", 1], ["valor", 1]],
        efficiencyAtts:[["valor", .1], ["doom", -1]]
    },
    overclockTargetingTheLich: {
        tier:0, plane:2, resourceName:"momentum",
        progressMaxBase:5, progressMaxIncrease:1,
        expToLevelBase:12, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1, generatorTarget:"fightTheEvilForces",
        unlockCost:0, visible:false, unlocked:false, isGenerator:true, generatorSpeed:1,
        hasUpstream: false, hideUpstreamLine: true,
        onCompleteCustom: function() {
            let actionObj = data.actions.overclockTargetingTheLich;
            actionData.overclockTargetingTheLich.updateMults();
            let resourceTaken = actionObj.resource/10;

            if (actionObj.resourceToAdd > 0) {
                actionObj.resource -= resourceTaken;
                addResourceTo(data.actions[actionObj.generatorTarget], actionObj.resourceToAdd);
            }

            views.scheduleUpdate('overclockTargetingTheLichResourceSent', intToString(actionObj.resourceToAdd, 2), "textContent")
            views.scheduleUpdate('overclockTargetingTheLichResourceTaken', intToString(resourceTaken, 2), "textContent")
        },
        updateMults: function () {
            let actionObj = data.actions.overclockTargetingTheLich;
            let dataObj = actionData.overclockTargetingTheLich;

            actionObj.progressGain = dataObj.generatorSpeed;
            let resourceTaken = actionObj.resource/10;
            actionObj.resourceToAdd = dataObj.actionPowerFunction(resourceTaken) * actionObj.upgradeMult;
        },
        actionPowerFunction: function(resource) {
            let fightMath = Math.sqrt(resource/1e24) * data.maxSpellPower;
            if(data.actions.trainWithTeam.unlocked) {
                fightMath *= 3;
            }
            return fightMath;
        },
        onCompleteText: {english:Raw.html`
                -<span style="font-weight:bold;" id="overclockTargetingTheLichResourceTaken">???</span> Momentum was taken from this action, converted to <br>
                +<span style="font-weight:bold;" id="overclockTargetingTheLichResourceSent">???</span> Fight, added to Fight The Evil Forces.<br>
                `},
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo: {english:Raw.html`<br>Momentum Taken = 10% of current Momentum.<br>
                        Fight gain = (Momentum Taken/1e24)^.5 * Spell Power.`}
    },
    fightTheEvilForces: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:10, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1,
        unlockCost:1, visible:false, unlocked:false, isGenerator:true, generatorSpeed:1, hasUpstream: false,
        onUnlock: function() {
            unveilAction('bridgeOfBone');
            setSliderUI("fightTheEvilForces", "bridgeOfBone", 100);
        },
        onLevelAtts:[["doom", 20]],
        expAtts:[],
        efficiencyAtts:[]
    },
    bridgeOfBone: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:10, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.4, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:10, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 5 * data.ancientCoinMultKTL;
            data.ancientCoinGained += 5 * data.ancientCoinMultKTL;
            data.useAmuletButtonShowing = true;
            setSliderUI("bridgeOfBone", "harvestGhostlyField", 100);
        },
        onCompleteCustom:function() {
            statAddAmount("legacy", 4 * (data.actions.bridgeOfBone.level/10 + 1));
        },
        onLevelCustom: function() {
            if(data.actions.bridgeOfBone.level >= 3) {
                unveilAction('harvestGhostlyField');
                setSliderUI("bridgeOfBone", "harvestGhostlyField", 100);
            }
        },
        onLevelAtts:[["legacy", 5]],
        expAtts:[["legacy", .1]],
        efficiencyAtts:[["courage", 1], ["valor", .1], ["doom", -1]],
        extraInfo:{english:"+4 * (1 + level/10) Legacy on complete."},
        unlockMessage:{english:"On unlock, +5 Ancient Coins. This amount is multiplied by Hear About The Lich's level."}
    },
    harvestGhostlyField: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1000, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.3, isKTL:true, purchased: true, maxLevel:12,
        unlockCost:1000, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 8 * data.ancientCoinMultKTL;
            data.ancientCoinGained += 8 * data.ancientCoinMultKTL;
            setSliderUI("harvestGhostlyField", "geyserFields", 100);
        },
        onCompleteCustom:function() {
            statAddAmount("legacy", 7 * (data.actions.harvestGhostlyField.level/10 + 1));
        },
        onLevelCustom: function() {
            if(data.actions.harvestGhostlyField.level >= 3) {
                unveilAction('geyserFields');
                setSliderUI("harvestGhostlyField", "geyserFields", 100);
            }
        },
        onLevelAtts:[["legacy", 8]],
        expAtts:[["legacy", .1]],
        efficiencyAtts:[["courage", 1], ["valor", .1], ["doom", -1]],
        extraInfo:{english:"+7 * (1 + level/10) Legacy on complete."},
        unlockMessage:{english:"On unlock, +8 Ancient Coins. This amount is multiplied by Hear About The Lich's level."}
    },
    geyserFields: {
        tier:0, plane:2, resourceName:"fight", creationVersion:2,
        progressMaxBase:1e6, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.2, isKTL:true, purchased: true, maxLevel:14,
        unlockCost:1e4, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 13 * data.ancientCoinMultKTL;
            data.ancientCoinGained += 13 * data.ancientCoinMultKTL;
            setSliderUI("geyserFields", "destroySiegeEngine", 100);
        },
        onCompleteCustom:function() {
            statAddAmount("legacy", 12 * (data.actions.geyserFields.level/10 + 1));
        },
        onLevelCustom: function() {
            if(data.actions.geyserFields.level >= 3) {
                unveilAction('destroySiegeEngine');
                setSliderUI("geyserFields", "destroySiegeEngine", 100);
            }
        },
        onLevelAtts:[["legacy", 7]],
        expAtts:[["legacy", .1]],
        efficiencyAtts:[["courage", 1], ["valor", .1], ["doom", -1]],
        extraInfo:{english:"+12 * (1 + level/10) Legacy on complete."},
        unlockMessage:{english:"On unlock, +13 Ancient Coins. This amount is multiplied by Hear About The Lich's level."}
    },
    destroySiegeEngine: {
        tier:0, plane:2, resourceName:"fight", creationVersion:2,
        progressMaxBase:1e9, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, isKTL:true, purchased: true, maxLevel:16,
        unlockCost:1e6, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoinGained += 21 * data.ancientCoinMultKTL;
            data.ancientCoin += 21 * data.ancientCoinMultKTL;
        },
        onCompleteCustom:function() {
            statAddAmount("legacy", 20 * (data.actions.destroySiegeEngine.level/10 + 1));
        },
        onLevelCustom: function() {
            if(data.actions.destroySiegeEngine.level >= 3) {
                unveilAction('destroyEasternMonolith');
            }
        },
        onLevelAtts:[["legacy", 20]],
        expAtts:[["legacy", .1]],
        efficiencyAtts:[["courage", 1], ["valor", .1], ["doom", -1]],
        extraInfo:{english:"+20 * (1 + level/10) Legacy on complete."},
        unlockMessage:{english:"On unlock, +21 Ancient Coins. This amount is multiplied by Hear About The Lich's level."}
    },
    destroyEasternMonolith: {
        tier:0, plane:2, resourceName:"fight", creationVersion:2,
        progressMaxBase:1e11, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.05, isKTL:true, purchased: true, maxLevel:3,
        unlockCost:1e8, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoinGained += 50 * data.ancientCoinMultKTL;
            data.ancientCoin += 50 * data.ancientCoinMultKTL;
            unveilUpgrade('rememberWhatIDid')
            unveilUpgrade('stopBeingSoTense')
            unveilUpgrade('createABetterFoundation')
            unveilUpgrade('workHarder')
            unveilUpgrade('haveBetterConversations')
            unveilUpgrade('studyHarder')
        },
        onCompleteCustom:function() {
        },
        onLevelCustom: function() {
            if(data.actions.destroyEasternMonolith.level >= 1) {
                unveilAction('stopDarknessRitual');
            }
        },
        onLevelAtts:[["legacy", 2000]],
        expAtts:[["legacy", .1]],
        efficiencyAtts:[["courage", 1], ["valor", .1], ["doom", -1]],
        unlockMessage:{english:"On unlock, +50 Ancient Coins. Also, unlocks new upgrades."}
    },
    stopDarknessRitual: {
        tier:0, plane:2, resourceName:"fight", creationVersion:2,
        progressMaxBase:2e13, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.04, isKTL:true, purchased: true, maxLevel:12,
        unlockCost:2e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoinGained += 33 * data.ancientCoinMultKTL;
            data.ancientCoin += 33 * data.ancientCoinMultKTL;
        },
        onCompleteCustom:function() {
            statAddAmount("legacy", 60 * (data.actions.stopDarknessRitual.level/10 + 1));
        },
        onLevelCustom: function() {
            if(data.actions.stopDarknessRitual.level >= 3) {
                unveilAction('protectTheSunstone');
            }
        },
        onLevelAtts:[["legacy", 60]],
        expAtts:[["legacy", .1]],
        efficiencyAtts:[["courage", 1], ["valor", .1], ["doom", -1]],
        extraInfo:{english:"+60 * (1 + level/10) Legacy on complete."},
        unlockMessage:{english:"On unlock, +33 Ancient Coins. This amount is multiplied by Hear About The Lich's level."}
    },
    protectTheSunstone: {
        tier:0, plane:2, resourceName:"fight", creationVersion:2,
        progressMaxBase:2e15, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.03, isKTL:true, purchased: true, maxLevel:15,
        unlockCost:2e10, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoinGained += 54 * data.ancientCoinMultKTL;
            data.ancientCoin += 54 * data.ancientCoinMultKTL;
        },
        onCompleteCustom:function() {
            statAddAmount("legacy", 150 * (data.actions.protectTheSunstone.level/10 + 1));
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["legacy", 150]],
        expAtts:[["legacy", .1]],
        efficiencyAtts:[["courage", 1], ["valor", .1], ["doom", -1]],
        extraInfo:{english:"+150 * (1 + level/10) Legacy on complete."},
        unlockMessage:{english:"On unlock, +54 Ancient Coins. This amount is multiplied by Hear About The Lich's level."}
    },
    silenceDeathChanters: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

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
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    breakFleshBarricade: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

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
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    conquerTheGatekeepers: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

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
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    unhookSacrificialCages: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

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
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    purgeUnholyRelics: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

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
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    destroyWesternMonolith: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

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
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    destroyFleshGrowths: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

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
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    crackCorruptedEggs: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

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
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    kiteTheAbomination: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

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
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    collapseCorpseTower: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

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
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    surviveLivingSiegeEngine: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

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
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    destroySouthernMonolith: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

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
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    burnFleshPits: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

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
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    openSoulGate: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

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
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    shatterTraps: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

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
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    killTheArchitect: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

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
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    destroyNorthernMonolith: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

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
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    breakOutOfEndlessMaze: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

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
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    killDopplegangers: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

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
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    killDeathKnights: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

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
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    silenceDoomScribe: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

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
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    removeWards: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

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
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    fightTheLich: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

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
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    killTheLich: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

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
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    shatterPhylactery: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
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
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
}

//==== plane2 ====
actionData = {
    ...actionData,

    echoKindle: {
        tier:0, plane:1, resourceName:"legacy",
        progressMaxBase:10, progressMaxIncrease:1,
        expToLevelBase:10000000, expToLevelIncrease:1.2,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.05,
        efficiencyBase:.008,
        unlockCost:0, visible:false, unlocked:false, purchased: true, hasDeltas: false,
        isGenerator:true, generatorTarget:"sparkMana", generatorSpeed:100,
        onCompleteCustom: function() {
            let actionObj = data.actions.echoKindle;
            actionData.echoKindle.updateMults();

            addResourceTo(data.actions[actionObj.generatorTarget], actionObj.resourceToAdd);

            views.scheduleUpdate('echoKindleResourceSent', intToString(actionObj.resourceToAdd, 2), "textContent")
        },
        updateMults: function () {
            let actionObj = data.actions.echoKindle;
            let dataObj = actionData.echoKindle;

            actionObj.progressGain = dataObj.generatorSpeed * (actionObj.efficiency / 100);
            actionObj.actionPower = actionObj.actionPowerBase *
                actionObj.actionPowerMult * (actionObj.efficiency/100);
            actionObj.resourceToAdd = dataObj.actionPowerFunction(actionObj.resource) * actionObj.tierMult() *
                actionObj.actionPower * actionObj.upgradeMult;
            actionObj.expToAddBase = actionObj.resourceToAdd;
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
        },
        actionPowerFunction: function(resource) {
            if(resource < 1) {
                return 0;
            }
            return Math.pow(resource, .5) * 1000;
        },
        onLevelAtts:[["pulse", 5]],
        expAtts:[["vision", 1], ["integration", 1], ["pulse", 1], ["intellect", 1], ["rhythm", 1]],
        efficiencyAtts:[["pulse", 1]],
        onCompleteText: {english:Raw.html`
                +<span style="font-weight:bold;" id="echoKindleResourceSent">???</span> Spark was added to Spark Mana.<br>
                `},
        extraInfo: {english:Raw.html`Exp & Mana gain = (Legacy)^.5 * Action Power * Efficiency * 10000.`}
    },
    sparkMana: {
        tier:0, plane:1, resourceName:"spark", title: "Spark Decay", backwardsEfficiency: true,
        progressMaxBase:1000, progressMaxIncrease:4,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1,
        unlockCost:25, visible:false, unlocked:false, purchased: true, hasUpstream:false,
        onUnlock: function() {
            data.actions.poolMana.unlocked = true;
            unveilAction('poolMana');
            actionData.poolMana.generatorSpeed = 6;
            unveilAction('expelMana')
        },
        onLevelAtts:[["spark", 5]],
        expAtts:[["amplification", 1]],
        efficiencyAtts:[["spark", -1]]
    },
    poolMana: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:60, progressMaxIncrease:1,
        expToLevelBase:2, expToLevelIncrease:3,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1.03,
        efficiencyBase:.08,
        unlockCost:0, visible:false, unlocked:false, purchased: true, hasDeltas: false, hasUpstream:false,
        isGenerator:true, generatorTarget:"poolMana", generatorSpeed:0,
        onCompleteCustom: function() {
            let sparkManaObj = data.actions.sparkMana;
            let actionObj = data.actions.poolMana;
            let dataObj = actionData.poolMana;
            dataObj.updateMults();

            addResourceTo(data.actions[dataObj.generatorTarget], actionObj.resourceToAdd);

            views.scheduleUpdate('poolManaResourceTaken', intToString(sparkManaObj.resource, 2), "textContent")
            views.scheduleUpdate('poolManaResourceSent', intToString(actionObj.resourceToAdd, 2), "textContent")

            sparkManaObj.resource = 0;
        },
        updateMults: function () {
            let actionObj = data.actions.poolMana;
            let dataObj = actionData.poolMana;

            actionObj.progressGain = dataObj.generatorSpeed * (actionObj.efficiency / 100);
            actionObj.actionPower = actionObj.actionPowerBase *
                actionObj.actionPowerMult * (actionObj.efficiency/100);
            actionObj.resourceToAdd = data.actions.sparkMana.resource * actionObj.actionPower * actionObj.upgradeMult;
            actionObj.expToAddBase = actionObj.resourceToAdd;
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
        },
        updateUpgradeMult:function() {
            let upgradeMult = 1;
            upgradeMult *= Math.pow(1.25, data.upgrades.sparkMoreMana.upgradePower);
            data.actions.poolMana.upgradeMult = upgradeMult;
        },
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('manaBasics')
            unveilAction('prepareSpells')
        },
        onLevelAtts:[["pulse", 3]],
        expAtts:[["amplification", 1], ["wizardry", 1], ["control", 1], ["spellcraft", 1], ["intellect", 1]],
        efficiencyAtts:[["amplification", .01], ["pulse", .25]],
        onCompleteText: {english:Raw.html`
                -<span style="font-weight:bold;" id="poolManaResourceTaken">???</span> Spark was taken from Spark Mana, converted to<br>
                +<span style="font-weight:bold;" id="poolManaResourceSent">???</span> Mana, added to this action.<br>
                `},
        extraInfo: {english:Raw.html`Exp & Mana gain = Action Power * Efficiency.`}
    },
    expelMana: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:.3, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.5, maxLevel:6,
        unlockCost:.3, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function () {
            unveilAction('magicResearch')
            unveilAction('manaExperiments')
            unveilAction('prepareInternalSpells')
        },
        onLevelAtts:[["amplification", 20], ["pulse", 1]],
        expAtts:[],
        efficiencyAtts:[["integration", .05]]
    },
    manaBasics: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:1, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.015, maxLevel:3,
        unlockCost:1, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function () {
            unveilAction('feelYourMana')
            unveilAction('manaObservations')
            unveilAction('infuseTheHide')
        },
        onLevelAtts:[["amplification", 60], ["pulse", 2]],
        expAtts:[],
        efficiencyAtts:[["integration", 3]]
    },
    manaExperiments: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:10, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.02, maxLevel:9,
        unlockCost:30, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            unveilAction('growMagicSenses')
            unveilAction('manaVisualizations')
        },
        onLevelAtts:[["amplification", 200]],
        expAtts:[],
        efficiencyAtts:[["integration", 2]]
    },
    magicResearch: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:100, progressMaxIncrease:9,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:9,
        unlockCost:200, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            unveilAction('etchTheCircle')
        },
        onLevelAtts:[["spark", 10], ["pulse", 5]],
        expAtts:[],
        efficiencyAtts:[]
    },
    prepareSpells: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:100, progressMaxIncrease:9,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.35, maxLevel:9,
        unlockCost:500, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            unveilAction('overcharge')
            unveilAction('combatSpells')
            unveilAction('recoverSpells')
        },
        onLevelAtts:[["spark", 3]],
        expAtts:[],
        efficiencyAtts:[["integration", .05]]
    },
    prepareInternalSpells: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:300, progressMaxIncrease:9,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.3, maxLevel:9,
        unlockCost:500, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            unveilAction('overboost')
        },
        onLevelAtts:[["spark", 3]],
        expAtts:[],
        efficiencyAtts:[["integration", .05]]
    },
    overcharge: {
        tier:0, plane:1, resourceName:"mana", automationOff:true,
        progressMaxBase:100, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.4, maxLevel:1, isSpell:true, instabilityToAdd:5,
        unlockCost:500, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            unveilAction('overponder')
        },
        spellpower: function() {
            return 10;
        },
        onLevelAtts:[["wizardry", 1]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .01]],
        extraInfo: {english:Raw.html`If a charge is available, Overclock has x10 action power. Uses a charge when Overclock completes.`}
    },
    overboost: {
        tier:0, plane:1, resourceName:"mana", automationOff:true,
        progressMaxBase:1e6, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:1, isSpell:true, instabilityToAdd:10,
        unlockCost:1e6, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
        },
        spellpower: function() {
            return 10;
        },
        onLevelAtts:[["wizardry", 10]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]],
        extraInfo: {english:Raw.html`If a charge of this action and Overcharge is available, Overclock has x10 action power, stacking with Overcharge. Uses a charge when Overclock completes.`}
    },
    overponder: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff:true,
        progressMaxBase:1e12, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:1, isSpell:true, instabilityToAdd:300,
        unlockCost:1e12, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
        },
        spellpower: function() {
            return 10;
        },
        onLevelAtts:[["wizardry", 20]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .0001]],
        extraInfo: {english:Raw.html`If a charge of this action, Overcharge, and Overboost is available, Overclock has x10 action power, stacking with Overboost and Overcharge. Uses a charge when Overclock completes.`}
    },
    manaObservations: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:30000, progressMaxIncrease:9,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:3,
        unlockCost:90000, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
        },
        onLevelAtts:[["vision", 150]],
        expAtts:[],
        efficiencyAtts:[["integration", 1]]
    },
    feelYourMana: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:100, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:9,
        unlockCost:300, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            unveilAction('listenToTheMana');
        },
        onLevelAtts:[["amplification", 600]],
        expAtts:[],
        efficiencyAtts:[["integration", 2]]
    },
    growMagicSenses: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.015, maxLevel:9,
        unlockCost:3000, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
        },
        onLevelAtts:[["amplification", 2000]],
        expAtts:[],
        efficiencyAtts:[["integration", 1]]
    },
    infuseTheHide: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:2000, progressMaxIncrease:1,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:2,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            unveilAction('bindThePages')
        },
        onLevelAtts:[["vision", 5]],
        expAtts:[["amplification", .01]],
        efficiencyAtts:[]
    },
    etchTheCircle: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:2000, progressMaxIncrease:1,
        expToLevelBase:9, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:1,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            unveilAction('awakenYourGrimoire')
        },
        onLevelAtts:[["vision", 30]],
        expAtts:[["amplification", .01]],
        efficiencyAtts:[]
    },
    bindThePages: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:300, progressMaxIncrease:1.01,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:100,
        unlockCost:1000, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
        },
        onLevelAtts:[["vision", 1]],
        expAtts:[["amplification", .01]],
        efficiencyAtts:[]
    },
    awakenYourGrimoire: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:30000, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:1,
        unlockCost:6000, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            unveilAction('prepareExternalSpells')
            unveilAction('supportSpells')
            addMaxLevel("overcharge", 1);
            addMaxLevel("overboost", 1);
            addMaxLevel("overponder", 1);
            addMaxLevel("earthMagic", 1);
        },
        onLevelAtts:[["integration", 200]],
        expAtts:[["amplification", .01]],
        efficiencyAtts:[]
    },
    prepareExternalSpells: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:100000, progressMaxIncrease:33,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.15, maxLevel:6,
        unlockCost:20000, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            unveilAction('earthMagic')
            unveilAction('practicalMagic')
        },
        onLevelAtts:[["vision", 100]],
        expAtts:[["spellcraft", 10], ["intellect", 1]],
        efficiencyAtts:[["integration", .05]]
    },
    supportSpells: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:300000, progressMaxIncrease:33,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:9,
        unlockCost:30000, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            unveilAction('moveEarth')
            unveilAction('illuminate')
        },
        onLevelAtts:[["vision", 100]],
        expAtts:[["spellcraft", 1], ["intellect", 1]],
        efficiencyAtts:[["integration", .05]]
    },
    earthMagic: {
        tier:0, plane:1, resourceName:"mana",
        progressMaxBase:10000, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.2, maxLevel:0, isSpell:true, instabilityToAdd:100, power:1,
        unlockCost:20000, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            unveilAction('hardenEarth')
        },
        onLevelAtts:[["wizardry", 200]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]]
    },
    moveEarth: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
        progressMaxBase:3e9, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:1, isSpell:true, instabilityToAdd:125, power:3,
        unlockCost:1e12, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            unveilAction('shapeEarth')
            unveilAction('digFoundation')
        },
        onLevelAtts:[["wizardry", 300]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]]
    },
    hardenEarth: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
        progressMaxBase:3e11, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.003, maxLevel:1, isSpell:true, instabilityToAdd:150, power:6,
        unlockCost:1e13, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            unveilAction('moveIron')
            unveilAction('stoneCompression')
        },
        onLevelAtts:[["wizardry", 600]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]]
    },
    shapeEarth: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
        progressMaxBase:9e12, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:1, isSpell:true, instabilityToAdd:175, power:10,
        unlockCost:1e14, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            unveilAction('reinforceArmor')
            unveilAction('shapeBricks')
        },
        onLevelAtts:[["wizardry", 1000]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]]
    },
    practicalMagic: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
        progressMaxBase:3e14, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:1, isSpell:true, instabilityToAdd:200, power:30,
        unlockCost:3e14, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            unveilAction('illuminate')
            unveilAction('tidyMagesmithShop')
        },
        onUnlock: function() {
        },
        onLevelAtts:[["wizardry", 1500]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]]
    },
    illuminate: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
        progressMaxBase:3e15, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.0005, maxLevel:1, isSpell:true, instabilityToAdd:225, power:50,
        unlockCost:3e15, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            unveilAction('unblemish')
            unveilAction('clearTheBasement')
        },
        onLevelAtts:[["wizardry", 2500]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]]
    },
    moveIron: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
        progressMaxBase:1e16, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:1, isSpell:true, instabilityToAdd:100, power:100,
        unlockCost:1e16, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            unveilAction('restoreEquipment')
            unveilAction('moldBarsFromScrap')
        },
        onLevelAtts:[["wizardry", 5000]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]]
    },
    reinforceArmor: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
        progressMaxBase:3e16, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:1, isSpell:true, instabilityToAdd:100, power:200,
        unlockCost:3e16, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            unveilAction('mendGearCracks')
        },
        onLevelAtts:[["wizardry", 10000]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]]
    },
    restoreEquipment: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
        progressMaxBase:1e17, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:1, isSpell:true, instabilityToAdd:100, power:500,
        unlockCost:1e17, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            unveilAction('assistantMagesmith')
        },
        onLevelAtts:[["wizardry", 20000]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]]
    },
    unblemish: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
        progressMaxBase:3e17, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:1, isSpell:true, instabilityToAdd:100, power:1000,
        unlockCost:3e17, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
            unveilAction('manaTransfer')
        },
        onUnlock: function() {
        },
        onLevelAtts:[["wizardry", 25000]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]]
    },
    manaTransfer: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
        progressMaxBase:1e18, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:1, isSpell:true, instabilityToAdd:100, power:1500,
        unlockCost:1e18, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
        },
        onUnlock: function() {
        },
        onLevelAtts:[["wizardry", 40000]],
        expAtts:[["spellcraft", .1]],
        efficiencyAtts:[["wizardry", .001]]
    },
    manaVisualizations: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
        progressMaxBase:5e12, progressMaxIncrease:9,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.02, maxLevel:3,
        unlockCost:5e13, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
        },
        onLevelAtts:[["vision", 2000]],
        expAtts:[["cycle", .01]],
        efficiencyAtts:[["integration", .05]]
    },
    manaShaping: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    listenToTheMana: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
        progressMaxBase:5e11, progressMaxIncrease:9,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.02, maxLevel:3,
        unlockCost:5e12, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
        },
        onLevelAtts:[["amplification", 2e5]],
        expAtts:[["cycle", .01]],
        efficiencyAtts:[["integration", .05]]
    },
    manaInstinct: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
        progressMaxBase:1000, progressMaxIncrease:3,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:10,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[["integration", .05]]
    },
    auraControl: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
        progressMaxBase:5e12, progressMaxIncrease:9,
        expToLevelBase:3, expToLevelIncrease:1,
        efficiencyBase:.02, maxLevel:6,
        unlockCost:5e13, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelAtts:[["control", 100]],
        expAtts:[["cycle", .01]],
        efficiencyAtts:[["integration", .05]]
    },
    divination: {
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
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
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
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
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
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
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
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
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
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
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
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
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
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
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
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
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
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
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
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
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
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
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
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
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
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
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
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
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
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
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
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
        tier:0, plane:1, resourceName:"mana", creationVersion:2, automationOff: true,
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
        tier:1, plane:3, creationVersion:2, automationOff: true,
        progressMaxBase:60, progressMaxIncrease:1,
        expToLevelBase:60, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true,
        unlockCost:0, visible:true, unlocked:true, isGenerator:true, generatorSpeed:1,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
}
