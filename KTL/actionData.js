function create(actionVar, downstreamVars, x, y) {
    let dataObj = actionData[actionVar];
    if (!dataObj) {
        console.log("Could not find in actionData, " + actionVar);
        return;
    }
    if (!dataObj.resourceName) {
        dataObj.resourceName = "momentum";
    }
    dataObj.creationVersion = dataObj.creationVersion ?? 0;
    dataObj.x = x * 480;
    dataObj.y = y * -480;
    dataObj.actionTriggers = dataObj.actionTriggers ?? [];
    dataObj.hasUpstream = dataObj.hasUpstream ?? true;
    if(dataObj.wage > 0) {
        dataObj.actionTriggers.unshift(["info", "text", "On Level: Increase Wage +50%"]);
        dataObj.actionTriggers.unshift(["info", "wage", actionVar]);
    }
    if (!dataObj.addedInVersion) {
        dataObj.addedInVersion = 0;
    }
    dataObj.title = dataObj.title || decamelizeWithSpace(actionVar);
    dataObj.blinkDelay = 0;
    // let title = dataObj.title || decamelizeWithSpace(actionVar); //basicLabor -> Basic Labor
    createAndLinkNewAction(actionVar, dataObj, downstreamVars);
}

function attachAttLinks(actionVar) {
    let dataObj = actionData[actionVar];
    dataObj.expAtts.forEach(function (expAtt) { //add the action to the stat, to update exp reductions
        for (let attVar in data.atts) {
            let att = data.atts[attVar];
            if (expAtt[0] === att.attVar) {
                att.linkedActionExpAtts.push(actionVar);
            }
        }
    });
    dataObj.efficiencyAtts.forEach(function (expertiseAtt) { //add the action to the stat, to update exp reductions
        for (let attVar in data.atts) {
            let att = data.atts[attVar];
            if (expertiseAtt[0] === att.attVar) {
                att.linkedActionEfficiencyAtts.push(actionVar);
            }
        }
    });
    dataObj.onLevelAtts.forEach(function (onLevelAtt) { //add the action to the stat, to update exp reductions
        for (let attVar in data.atts) {
            let att = data.atts[attVar];
            if (onLevelAtt[0] === att.attVar) {
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
            if (isSpellReady('overcharge')) {
                useCharge('overcharge');
                if (isSpellReady('overboost')) {
                    useCharge('overboost');
                    if (isSpellReady('overponder')) {
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
            if (isSpellReady('overcharge')) {
                spellMult *= actionData.overcharge.spellpower();
                if (isSpellReady('overboost')) {
                    spellMult *= actionData.overboost.spellpower();
                    if (isSpellReady('overponder')) {
                        spellMult *= actionData.overponder.spellpower();
                    }
                }
            }

            let actionObj = data.actions.overclock;
            let dataObj = actionData.overclock;

            actionObj.progressGain = dataObj.generatorSpeed * (actionObj.efficiency / 100);
            actionObj.actionPower = actionObj.actionPowerBase *
                actionObj.actionPowerMult * (actionObj.efficiency / 100);
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
        onCompleteText: {
            english: Raw.html`
                +<span style="font-weight:bold;" id="overclockResourceSent">???</span> Momentum was added.<br>
                `
        },
        iconText: {english: Raw.html`Generates Momentum over time.`}
    },
    reflect: {
        tier: 1, plane: 0,
        progressMaxBase: .25, progressMaxIncrease: 4,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .5, maxLevel: 10,
        unlockCost: 2, visible: true, unlocked: false, purchased: true,
        onLevelAtts: [["awareness", 10]],
        expAtts: [["concentration", 1], ["curiosity", 1]],
        efficiencyAtts: [["cycle", 1]],
        actionTriggers: [
            ["level_1", "reveal", "distillInsight"],
            ["level_2", "reveal", "harnessOverflow"],
            ["level_4", "reveal", "takeNotes"],
            ["level_6", "reveal", "bodyAwareness"]
        ]
    },
    distillInsight: {
        tier: 1, plane: 0,
        progressMaxBase: 1, progressMaxIncrease: 2,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .4, maxLevel: 10,
        unlockCost: 20, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["concentration", 2]],
        expAtts: [],
        efficiencyAtts: [["cycle", 1]]
    },
    harnessOverflow: {
        tier: 1, plane: 0,
        progressMaxBase: 1, progressMaxIncrease: 2,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 10,
        unlockCost: 80, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["cycle", 1]],
        expAtts: [["awareness", 1], ["energy", 1]],
        efficiencyAtts: []
    },
    takeNotes: {
        tier: 1, plane: 0,
        progressMaxBase: 100, progressMaxIncrease: 2,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .3, maxLevel: 10,
        unlockCost: 400, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["awareness", 30], ["curiosity", 10]],
        expAtts: [["observation", 1], ["concentration", 1]],
        efficiencyAtts: [["cycle", 1]]
    },
    bodyAwareness: {
        tier: 1, plane: 0,
        progressMaxBase: 2000, progressMaxIncrease: 20,
        expToLevelBase: 2, expToLevelIncrease: 1,
        efficiencyBase: .6, maxLevel: 1,
        unlockCost: 2000, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["awareness", 100]],
        expAtts: [["curiosity", 1], ["concentration", 1], ["energy", 1], ["endurance", 1]],
        efficiencyAtts: [["coordination", .5]],
        actionTriggers: [
            ["level_1", "reveal", "travelOnRoad"],
            ["level_1", "reveal", "travelToOutpost"],
            ["level_1", "reveal", "meetVillageLeaderScott"]
        ]
    },
    remember: {
        tier: 1, plane: 0,
        progressMaxBase: 20000, progressMaxIncrease: 5,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .2, maxLevel: 3,
        unlockCost: 4000, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["concentration", 10]],
        expAtts: [["awareness", 1], ["observation", 1]],
        efficiencyAtts: [["cycle", 1]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "bodyAwareness", 1],
            ["level", "addMaxLevels", "harnessOverflow", 3]
        ]
    },
    travelOnRoad: {
        tier: 1, plane: 0,
        progressMaxBase: 1000, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .5, maxLevel: 10,
        unlockCost: 2000, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["energy", 5]],
        expAtts: [["concentration", 1], ["endurance", 1], ["geared", 1]],
        efficiencyAtts: [["navigation", 1]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "bodyAwareness", 1]
        ]
    },
    travelToOutpost: {
        tier: 1, plane: 0,
        progressMaxBase: 10000, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .25, maxLevel: 10,
        unlockCost: 3000, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["energy", 30]],
        expAtts: [["endurance", 1], ["geared", 1]],
        efficiencyAtts: [["navigation", 1]],
        actionTriggers: [
            ["unlock", "reveal", "remember"]
        ]
    },
    meetVillageLeaderScott: {
        tier: 1, plane: 0,
        progressMaxBase: 40000, progressMaxIncrease: 40,
        expToLevelBase: 5, expToLevelIncrease: 2,
        efficiencyBase: .5, maxLevel: 3,
        unlockCost: 40000, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [],
        expAtts: [["curiosity", 1], ["observation", 1]],
        efficiencyAtts: [["observation", 1]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "remember", 1],
            ["level", "addMaxLevels", "remember", 2],
            ["level_1", "reveal", "watchBirds"],
            ["level_2", "reveal", "helpScottWithChores"],
            ["level_3", "reveal", "checkNoticeBoard"]
        ]
    },
    helpScottWithChores: {
        tier: 1, plane: 0,
        progressMaxBase: 6000000, progressMaxIncrease: 2,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .2, maxLevel: 4,
        wage: 1,
        unlockCost: 500000, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
            data.displayJob = true;
            views.updateVal(`jobDisplay`, data.displayJob ? "" : "none", "style.display");
        },
        onLevelAtts: [["recognition", 10]],
        expAtts: [["ambition", 1]],
        efficiencyAtts: [["energy", 1]],
        actionTriggers: [ //auto-adds wage triggers
            ["unlock", "reveal", "makeMoney"]
        ]
    },
    browseLocalMarket: {
        tier: 1, plane: 0,
        progressMaxBase: 7e7, progressMaxIncrease: 2,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .3, maxLevel: 10,
        unlockCost: 1e8, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["savvy", 5], ["observation", 50]],
        expAtts: [["observation", 1], ["recognition", 1]],
        efficiencyAtts: [["ambition", 1]],
        actionTriggers: [
            ["level_1", "reveal", "buyBasicSupplies"],
            ["level_1", "reveal", "buyBasicClothes"],
            ["level_1", "reveal", "buyMarketItems"],
            ["level_1", "reveal", "buyShopItems"],
        ]
    },
    browseStores: {
        tier: 1, plane: 0,
        progressMaxBase: 1e19, progressMaxIncrease: 3,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 10,
        unlockCost: 100e15, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["savvy", 250], ["observation", 3000]],
        expAtts: [["recognition", 1], ["confidence", 1]],
        efficiencyAtts: [["ambition", 1]]
    },
    browseBackrooms: {
        tier: 1, plane: 0,
        progressMaxBase: 1e21, progressMaxIncrease: 2,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 10,
        unlockCost: 2e18, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["savvy", 500], ["cunning", 20]],
        expAtts: [["recognition", 1], ["confidence", 1]],
        efficiencyAtts: [["ambition", .5]]
    },
    browsePersonalCollection: {
        tier: 1, plane: 0, creationVersion: 2,
        progressMaxBase: 1e41, progressMaxIncrease: 8,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 5,
        unlockCost: 5e33, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["savvy", 3e4], ["cunning", 400]],
        expAtts: [["recognition", 1], ["influence", 1], ["leverage", 1]],
        efficiencyAtts: [["leverage", 1]]
    },
    checkNoticeBoard: {
        tier: 1, plane: 0,
        progressMaxBase: 60e6, progressMaxIncrease: 40,
        expToLevelBase: 2, expToLevelIncrease: 3,
        efficiencyBase: .003125, maxLevel: 3,
        unlockCost: 10e6, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [],
        expAtts: [["observation", 1]],
        efficiencyAtts: [["observation", 1], ["savvy", 1], ["vision", .1]],
        actionTriggers: [
            ["level_1", "reveal", "browseLocalMarket"],
            ["level_2", "reveal", "reportForTraining"],
            ["level_3", "reveal", "reportForLabor"],
            ["level_3", "reveal", "oddJobsLaborer"],
            ["level_3", "reveal", "chimneySweep"]
        ]
    },
    makeMoney: {
        tier: 1, plane: 0,
        progressMaxBase: 10, progressMaxIncrease: 1,
        expToLevelBase: 100, expToLevelIncrease: 2,
        actionPowerBase: 1, actionPowerMult: 1, actionPowerMultIncrease: 1.1,
        efficiencyBase: .1,
        unlockCost: 1e7, visible: false, unlocked: false, purchased: true,
        isGenerator: true, generatorTarget: "spendMoney", generatorSpeed: 5,
        onCompleteCustom: function () {
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
        updateMults: function () {
            let actionObj = data.actions.makeMoney;
            let dataObj = actionData.makeMoney;

            actionObj.progressGain = dataObj.generatorSpeed * (actionObj.efficiency / 100);
            actionObj.actionPower = actionObj.actionPowerBase *
                actionObj.actionPowerMult * (actionObj.efficiency / 100);
            let resourceTaken = actionObj.resource * actionObj.tierMult();
            actionObj.resourceToAdd = dataObj.actionPowerFunction(resourceTaken) *
                actionObj.actionPower * actionObj.upgradeMult;
            actionObj.expToAddBase = actionObj.resourceToAdd;
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
        },
        updateUpgradeMult: function () {
            let upgradeMult = 1;
            upgradeMult *= Math.pow(1.5, data.upgrades.workHarder.upgradePower);
            data.actions.makeMoney.upgradeMult = upgradeMult;
        },
        onLevelAtts: [["ambition", 1]],
        expAtts: [["adaptability", 1], ["cunning", 1], ["leverage", 1], ["logistics", 1], ["intellect", 1]],
        efficiencyAtts: [["ambition", 1]],
        actionPowerFunction: function (resource) {
            if (resource < 1) {
                return 0;
            }
            return Math.pow(resource, .5) * data.currentWage; //sqrt(num * mult) * wage
        },
        onCompleteText: {
            english: Raw.html`
                -<span style="font-weight:bold;" id="makeMoneyResourceTaken">???</span> Momentum was taken from this action, converted to<br>
                +<span style="font-weight:bold;" id="makeMoneyResourceSent">???</span> Gold, added to Spend Money.<br>
                `
        },
        extraInfo: {
            english: Raw.html`<br>Momentum Taken = 1% of current Momentum.<br>
                        Exp & Gold gain = (Momentum Taken)^.5 * Action Power * Speed * Wages.`
        },
        actionTriggers: [
            ["info", "text", "Generates Gold using Momentum"],
            ["unlock", "reveal", "spendMoney"]
        ]
    },
    spendMoney: {
        tier: 2, plane: 0, resourceName: "gold",
        progressMaxBase: .5, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .5, maxLevel: 10,
        unlockCost: 50, visible: false, unlocked: false, purchased: true, hasUpstream: false, keepParentAutomation:true,
        onLevelAtts: [["energy", 60]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 1]]
    },
    buyBasicSupplies: {
        tier: 2, plane: 0, resourceName: "gold",
        progressMaxBase: 500, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .4, maxLevel: 10,
        unlockCost: 2000, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["energy", 400], ["recognition", 40]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 1]]
    },
    buyBasicClothes: {
        tier: 2, plane: 0, resourceName: "gold",
        progressMaxBase: 5000, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .3, maxLevel: 10,
        unlockCost: 10000, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["geared", 40]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 1]]
    },
    buyTravelersClothes: {
        tier: 2, plane: 0, resourceName: "gold", title:"Buy Traveler's Clothes",
        progressMaxBase: 5e6, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 3,
        unlockCost: 2e7, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["geared", 400]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 1]]
    },
    buyMarketItems: {
        tier: 2, plane: 0, resourceName: "gold",
        progressMaxBase: 5e6, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 10,
        unlockCost: 5e7, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["energy", 4000], ["recognition", 60]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 1]]
    },
    buyShopItems: {
        tier: 2, plane: 0, resourceName: "gold",
        progressMaxBase: 5e9, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .05, maxLevel: 10,
        unlockCost: 5e10, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["energy", 10000], ["geared", 1000], ["recognition", 80]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 1]],
        actionTriggers: [
            ["unlock", "reveal", "invest"]
        ]
    },
    buySocialAccess: {
        tier: 2, plane: 0, resourceName: "gold",
        progressMaxBase: 5e11, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .2, maxLevel: 10,
        unlockCost: 2e12, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["recognition", 100], ["charm", 10]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["confidence", 1]]
    },
    buyPointyHat: {
        tier: 2, plane: 0, resourceName: "gold",
        progressMaxBase: 5e30, progressMaxIncrease: 10,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 1,
        unlockCost: 2e27, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["confidence", 10000]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: []
    },
    buyStreetFood: {
        tier: 2, plane: 0, resourceName: "gold",
        progressMaxBase: 5e15, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 10,
        unlockCost: 2e15, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["energy", 60000], ["recognition", 400]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["confidence", 1]]
    },
    buyGoodFood: {
        tier: 2, plane: 0, resourceName: "gold",
        progressMaxBase: 5e18, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 10,
        unlockCost: 2e18, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["energy", 150000]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["confidence", .5]]
    },
    buyMatchingClothes: {
        tier: 2, plane: 0, resourceName: "gold",
        progressMaxBase: 5e15, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 10,
        unlockCost: 2e15, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["recognition", 600], ["confidence", 5]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["confidence", 1]]
    },
    buyStylishClothes: {
        tier: 2, plane: 0, resourceName: "gold",
        progressMaxBase: 5e18, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 10,
        unlockCost: 2e18, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["recognition", 2000], ["confidence", 10], ["discernment", 10]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["confidence", .5]],
        actionTriggers: [
            ["level_10", "reveal", "buyComfyShoes"],
            ["level_10", "reveal", "buyTravelersGear"],
        ]
    },
    slideTheCoin: {
        tier: 2, plane: 0, resourceName: "gold",
        progressMaxBase: 5e16, progressMaxIncrease: 1,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .2, maxLevel: 1,
        unlockCost: 4e15, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["influence", 40]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["recognition", .001]]
    },
    buyCoffee: {
        tier: 2, plane: 0, resourceName: "gold",
        progressMaxBase: 5e19, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .05, maxLevel: 10,
        unlockCost: 2e17, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["charm", 2000], ["recognition", 200], ["influence", 120], ["energy", 5]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["recognition", .001]]
    },
    buyComfyShoes: {
        tier: 2, plane: 0, resourceName: "gold", creationVersion: 2,
        progressMaxBase: 5e29, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .002, maxLevel: 5,
        unlockCost: 2e26, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["energy", 5e5], ["geared", 5000]],
        expAtts: [["savvy", 1], ["leverage", 1]],
        efficiencyAtts: [["confidence", .1]]
    },
    buyTravelersGear: {
        tier: 2, plane: 0, resourceName: "gold", creationVersion: 2, title:"Buy Traveler's Gear",
        progressMaxBase: 5e35, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .001, maxLevel: 5,
        unlockCost: 2e30, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["energy", 2e6], ["geared", 25000]],
        expAtts: [["savvy", 1], ["leverage", 1]],
        efficiencyAtts: [["confidence", .1]],
        actionTriggers: [
            ["level_1", "reveal", "buyArtisanFood"],
            ["level_5", "reveal", "buyHouse"],
        ]
    },
    buyArtisanFood: {
        tier: 2, plane: 0, resourceName: "gold", creationVersion: 2,
        progressMaxBase: 5e39, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 5,
        unlockCost: 2e34, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["energy", 5e6]],
        expAtts: [["savvy", 1], ["leverage", 1]],
        efficiencyAtts: [["leverage", .1]]
    },
    buyUtilityItems: {
        tier: 2, plane: 0, resourceName: "gold", creationVersion: 2,
        progressMaxBase: 5e37, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .001, maxLevel: 5,
        unlockCost: 2e32, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["energy", 3e6], ["navigation", 200]],
        expAtts: [["savvy", 1], ["leverage", 1]],
        efficiencyAtts: [["confidence", .1]],
        actionTriggers: [
            ["level_1", "reveal", "buyPotions"],
            ["level_3", "reveal", "buyTools"],
        ]
    },
    buyPotions: {
        tier: 2, plane: 0, resourceName: "gold", creationVersion: 2,
        progressMaxBase: 5e39, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 5,
        unlockCost: 2e34, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["energy", 1e7]],
        expAtts: [["savvy", 1], ["leverage", 1]],
        efficiencyAtts: [["leverage", .1]]
    },
    buyTools: {
        tier: 2, plane: 0, resourceName: "gold", creationVersion: 2,
        progressMaxBase: 5e41, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 5,
        unlockCost: 2e36, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["geared", 6e5], ["logistics", 2]],
        expAtts: [["savvy", 1], ["leverage", 1]],
        efficiencyAtts: [["leverage", .1]],
        actionTriggers: [
            ["level_3", "reveal", "buyCart"],
        ]
    },
    buyCart: {
        tier: 2, plane: 0, resourceName: "gold", creationVersion: 2,
        progressMaxBase: 5e43, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 5,
        unlockCost: 2e38, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["geared", 1.5e6], ["logistics", 5]],
        expAtts: [["savvy", 1], ["leverage", 1]],
        efficiencyAtts: [["leverage", .1]]
    },
    buyHouse: {
        tier: 2, plane: 0, resourceName: "gold", creationVersion: 2,
        progressMaxBase: 5e42, progressMaxIncrease: 10,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 1,
        unlockCost: 2e36, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["integration", 1000], ["comfort", 15]],
        expAtts: [["savvy", 1], ["ambition", 1]],
        efficiencyAtts: [["recognition", 1]],
        actionTriggers: [
            ["level_1", "reveal", "buyHouseholdItems"],
            ["level_1", "revealUpgrade", "improveMyHouse"],
        ]
    },
    buyHouseholdItems: {
        tier: 2, plane: 0, resourceName: "gold", creationVersion: 2,
        progressMaxBase: 5e43, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 5,
        unlockCost: 2e37, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["energy", 3e7], ["discernment", 200]],
        expAtts: [["savvy", 1], ["leverage", 1]],
        efficiencyAtts: [["leverage", 1]],
        actionTriggers: [
            ["level_1", "reveal", "buyFurniture"]
        ]
    },
    buyFurniture: {
        tier: 2, plane: 0, resourceName: "gold", creationVersion: 2,
        progressMaxBase: 2e44, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 5,
        unlockCost: 8e37, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["energy", 5e7], ["comfort", 10]],
        expAtts: [["savvy", 1], ["leverage", 1]],
        efficiencyAtts: [["leverage", 1]],
        actionTriggers: [
            ["level_1", "reveal", "buyReadingChair"],
            ["level_1", "reveal", "buyBed"],
        ]
    },
    buyReadingChair: {
        tier: 2, plane: 0, resourceName: "gold", creationVersion: 2,
        progressMaxBase: 5e44, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 5,
        unlockCost: 2e38, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["comfort", 15], ["peace", 2]],
        expAtts: [["savvy", 1], ["leverage", 1]],
        efficiencyAtts: [["leverage", 1]],
        actionTriggers: [
            ["level_1", "reveal", "buyFireplace"]
        ]
    },
    buyBed: {
        tier: 2, plane: 0, resourceName: "gold", creationVersion: 2,
        progressMaxBase: 2e46, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 5,
        unlockCost: 8e39, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["energy", 1e8]],
        expAtts: [["savvy", 1], ["leverage", 1]],
        efficiencyAtts: [["leverage", 1]],
        actionTriggers: [
            ["level_1", "reveal", "buySilkSheets"]
        ]
    },
    buyFireplace: {
        tier: 2, plane: 0, resourceName: "gold", creationVersion: 2,
        progressMaxBase: 5e46, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 5,
        unlockCost: 2e40, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["comfort", 30]],
        expAtts: [["savvy", 1], ["leverage", 1]],
        efficiencyAtts: [["leverage", 1]],
        actionTriggers: [
            ["level_1", "reveal", "buyGoodFirewood"]
        ]
    },
    buySilkSheets: {
        tier: 2, plane: 0, resourceName: "gold", creationVersion: 2,
        progressMaxBase: 5e47, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .005, maxLevel: 5,
        unlockCost: 2e41, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["energy", 1e8]],
        expAtts: [["savvy", 1], ["leverage", 1]],
        efficiencyAtts: [["leverage", 1]]
    },
    buyGoodFirewood: {
        tier: 2, plane: 0, resourceName: "gold", creationVersion: 2,
        progressMaxBase: 5e48, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .005, maxLevel: 5,
        unlockCost: 2e42, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["comfort", 40], ["peace", 10]],
        expAtts: [["savvy", 1], ["leverage", 1]],
        efficiencyAtts: [["leverage", 1]]
    },

    invest: {
        tier: 1, plane: 0, resourceName: "gold", creationVersion: 2, investCap: 1e5,
        progressMaxBase: 10, progressMaxIncrease: 1,
        expToLevelBase: 3e8, expToLevelIncrease: 1.4,
        actionPowerBase: 1, actionPowerMult: 1, actionPowerMultIncrease: 1,
        efficiencyBase: .5,
        unlockCost: 2e12, visible: false, unlocked: false, purchased: false,
        isGenerator: true, generatorTarget: "buildFortune", generatorSpeed: 1,
        onCompleteCustom: function () {
            //stop consuming from reinvest - it's not amount on reinvest * 1.05, but it's 5% of what's on reinvest
            let actionObj = data.actions.invest;
            actionData.invest.updateMults();
            let resourceTaken = actionObj.resource * actionObj.tierMult();
            if (resourceTaken <= 1) {
                resourceTaken = 0;
            }

            if (actionObj.resourceToAdd > 0) {
                actionObj.resource -= resourceTaken;
                addResourceTo(data.actions[actionObj.generatorTarget], actionObj.resourceToAdd);
            }

            views.scheduleUpdate('investResourceSent', intToString(actionObj.resourceToAdd, 2), "textContent")
            views.scheduleUpdate('investResourceTaken', intToString(resourceTaken, 2), "textContent")
        },
        updateMults: function () {
            let actionObj = data.actions.invest;
            let dataObj = actionData.invest;

            actionObj.progressGain = dataObj.generatorSpeed * (actionObj.efficiency / 100);
            actionObj.actionPower = actionObj.actionPowerBase *
                actionObj.actionPowerMult;
            let resourceTaken = actionObj.resource * actionObj.tierMult(); //gold taken
            if (resourceTaken <= 1) {
                resourceTaken = 1; //just to make the math not break
            }
            let reinvested = data.actions.reinvest.resource * (actionObj.actionPower - 1);
            actionObj.resourceToAdd = (reinvested + Math.log10(resourceTaken) * upgradeData.increaseInitialInvestment.currentValue()) * (actionObj.efficiency / 100);
            dataObj.investCap = Math.pow(upgradeData.increaseMarketCap.currentValue(), actionObj.actionPower);
            actionObj.resourceToAdd = actionObj.resourceToAdd > dataObj.investCap ? dataObj.investCap : actionObj.resourceToAdd;

            actionObj.expToAddBase = Math.log10(resourceTaken);
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
        },
        onLevelCustom: function () {
            data.actions.invest.actionPowerBase = 1 + data.actions.invest.level / 1000;
            actionData.invest.updateMults();
        },
        onLevelAtts: [],
        expAtts: [["vision", 1], ["adaptability", 1], ["ambition", 1]],
        efficiencyAtts: [["ambition", .005]],
        onCompleteText: {
            english: Raw.html`
                -<span style="font-weight:bold;" id="investResourceTaken">???</span> Gold was taken from this action, converted to<br>
                +<span style="font-weight:bold;" id="investResourceSent">???</span> Fortune, added to Build Fortune.<br>
                `
        },
        onLevelText: {english: "+0.001 Action Power per level<br>"},
        extraInfo: {
            english: Raw.html`<br>
            Gold Taken = 1% of current Gold.<br>
            Reinvested = Fortune on Reinvest * (Action Power-1).<br> 
            Base Rate = 1 (increased with upgrades)<br><br>
            Fortune Gain = (log10(Gold Taken) * Base Rate + Reinvested) * efficiency<br><br>
            Exp Gain = log10(Gold Taken)<br><br>
            Fortune Gain is capped at (Market Cap)^(Action Power)`
        },
        actionTriggers: [
            ["info", "text", "Uses Gold and Fortune on Reinvest to produce Fortune"],
            ["unlock", "reveal", "buildFortune"],
            ["info", "cap", "invest", "investCap"]
        ]
    },
    buildFortune: {
        tier: 2, plane: 0, resourceName: "fortune", creationVersion: 2, hasUpstream: false,
        progressMaxBase: 100, progressMaxIncrease: 4,
        expToLevelBase: 1, expToLevelIncrease: 2,
        efficiencyBase: 1, maxLevel: 5,
        unlockCost: 200, visible: false, unlocked: false, purchased: false, keepParentAutomation:true,
        onLevelAtts: [["vision", 250], ["ambition", 20]],
        expAtts: [],
        efficiencyAtts: [],
        actionTriggers: [
            ["level_1", "reveal", "reinvest"],
            ["level_2", "reveal", "spendFortune"],
        ]
    },
    reinvest: {
        tier: 3, plane: 0, resourceName: "fortune", creationVersion: 2,
        progressMaxBase: 1000, progressMaxIncrease: 100,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 10,
        unlockCost: 1000, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["vision", 1000], ["adaptability", 100], ["ambition", 100]],
        expAtts: [],
        efficiencyAtts: [["ambition", .1]]
    },
    spendFortune: {
        tier: 2, plane: 0, resourceName: "fortune", creationVersion: 2,
        progressMaxBase: 500, progressMaxIncrease: 10,
        expToLevelBase: 1, expToLevelIncrease: 2,
        efficiencyBase: 1, maxLevel: 4,
        unlockCost: 1000, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["energy", 1e6], ["savvy", 1e4], ["adaptability", 100]],
        expAtts: [],
        efficiencyAtts: [],
        actionTriggers: [
            ["unlock", "reveal", "investInLocals"],
            ["unlock", "reveal", "fundTownImprovements"]
        ]
    },
    investInLocals: {
        tier: 3, plane: 0, resourceName: "fortune", creationVersion: 2,
        progressMaxBase: 1500, progressMaxIncrease: 10,
        expToLevelBase: 1, expToLevelIncrease: 2,
        efficiencyBase: 1, maxLevel: 4,
        unlockCost: 3000, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["recognition", 2e4], ["adaptability", 100], ["leverage", 10]],
        expAtts: [],
        efficiencyAtts: [],
        actionTriggers: [
            ["unlock", "reveal", "hostAFestival"],
            ["level_1", "reveal", "townCrier"],
            ["level_2", "reveal", "storyTeller"]
        ]
    },
    hostAFestival: {
        tier: 3, plane: 0, resourceName: "fortune", creationVersion: 2,
        progressMaxBase: 1e4, progressMaxIncrease: 10,
        expToLevelBase: 1, expToLevelIncrease: 2,
        efficiencyBase: 1, maxLevel: 4,
        unlockCost: 2e4, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["charm", 1e4], ["influence", 500]],
        expAtts: [],
        efficiencyAtts: []
    },
    fundTownImprovements: {
        tier: 3, plane: 0, resourceName: "fortune", creationVersion: 2,
        progressMaxBase: 1e5, progressMaxIncrease: 10,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 4,
        unlockCost: 2e5, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["cunning", 1000], ["adaptability", 100], ["leverage", 20]],
        expAtts: [],
        efficiencyAtts: [],
        actionTriggers: [
            ["unlock", "reveal", "investInSelf"],
            ["level_1", "reveal", "supportLocalLibrary"],
            ["level_2", "reveal", "buyUtilityItems"],
            ["level_3", "reveal", "browsePersonalCollection"],
            ["level_4", "reveal", "fundASmallStall"]
        ]
    },
    supportLocalLibrary: {
        tier: 3, plane: 0, resourceName: "fortune", creationVersion: 2,
        progressMaxBase: 2e7, progressMaxIncrease: 10,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 4,
        unlockCost: 5e7, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["recognition", 5e4], ["adaptability", 400], ["leverage", 30]],
        expAtts: [],
        efficiencyAtts: [],
        actionTriggers: [
            ["level_1", "reveal", "expandLocalLibrary"]
        ]
    },
    expandLocalLibrary: {
        tier: 3, plane: 0, resourceName: "fortune", creationVersion: 2,
        progressMaxBase: 2e9, progressMaxIncrease: 10,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 4,
        unlockCost: 5e9, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["leverage", 50], ["intellect", 1], ["logistics", 1]],
        expAtts: [],
        efficiencyAtts: [],
        actionTriggers: [
            ["level_1", "reveal", "recruitACarpenter"]
        ]
    },
    investInSelf: {
        tier: 3, plane: 0, resourceName: "fortune", creationVersion: 2,
        progressMaxBase: 2e8, progressMaxIncrease: 10,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 4,
        unlockCost: 5e8, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["savvy", 2e4], ["confidence", 5000]],
        expAtts: [],
        efficiencyAtts: [],
        actionTriggers: [
            ["level_1", "reveal", "makeAPublicDonation"],
            ["level_2", "reveal", "purchaseALot"],
        ]
    },
    makeAPublicDonation: {
        tier: 3, plane: 0, resourceName: "fortune", creationVersion: 2,
        progressMaxBase: 3e8, progressMaxIncrease: 10,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 4,
        unlockCost: 5e10, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["cunning", 8000], ["influence", 800]],
        expAtts: [],
        efficiencyAtts: []
    },
    fundASmallStall: {
        tier: 3, plane: 0, resourceName: "fortune", creationVersion: 2,
        progressMaxBase: 3e11, progressMaxIncrease: 10,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 4,
        unlockCost: 5e11, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["discernment", 300], ["savvy", 1e5]],
        expAtts: [],
        efficiencyAtts: []
    },
    purchaseALot: {
        tier: 3, plane: 0, resourceName: "fortune", creationVersion: 2,
        progressMaxBase: 3e13, progressMaxIncrease: 10,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 1,
        unlockCost: 5e13, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["recognition", 2e5], ["ambition", 1000]],
        expAtts: [],
        efficiencyAtts: [],
        actionTriggers: [
            ["level_1", "purchase", "buyHouse"],
            ["level_1", "purchase", "buyHouseholdItems"],
            ["level_1", "reveal", "buyHouse"]
        ]
    },
    recruitACarpenter: {
        tier: 3, plane: 0, resourceName: "fortune", creationVersion: 2,
        progressMaxBase: 5e12, progressMaxIncrease: 10,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 4,
        unlockCost: 5e12, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["charm", 2.5e4], ["logistics", 3]],
        expAtts: [],
        efficiencyAtts: [],
        actionTriggers: [
            ["level", "addMaxLevels", "buildPersonalLibrary", 1],
            ["level_1", "reveal", "buildPersonalLibrary"],
            ["level_1", "reveal", "procureQualityWood"]
        ]
    },
    procureQualityWood: {
        tier: 3, plane: 0, resourceName: "fortune", creationVersion: 2,
        progressMaxBase: 3e14, progressMaxIncrease: 10,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 4,
        unlockCost: 5e14, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["adaptability", 1000], ["logistics", 4]],
        expAtts: [],
        efficiencyAtts: [],
        actionTriggers: [
            ["level", "addMaxLevels", "buildPersonalLibrary", 1]
        ]
    },
    sourceRareBooks: {
        tier: 3, plane: 0, resourceName: "fortune", creationVersion: 2,
        progressMaxBase: 5e8, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 10,
        unlockCost: 5e8, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [],
        expAtts: [],
        efficiencyAtts: []
    },
    reportForLabor: {
        tier: 1, plane: 0,
        progressMaxBase: 1e9, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .05, maxLevel: 10,
        unlockCost: 1e11, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["coordination", 200]],
        expAtts: [["adaptability", 1]],
        efficiencyAtts: [["adaptability", 1]],
        actionTriggers: [
            ["unlock", "reveal", "exploreDifficultPath"],
            ["unlock", "reveal", "buyTravelersClothes"]
        ]
    },
    oddJobsLaborer: {
        tier: 1, plane: 0,
        progressMaxBase: 1e10, progressMaxIncrease: 2,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .2, maxLevel: 8,
        wage: 20,
        unlockCost: 1e11, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["adaptability", 1]],
        expAtts: [],
        efficiencyAtts: [["adaptability", 1]],
    },
    chimneySweep: {
        tier: 1, plane: 0,
        progressMaxBase: 1e13, progressMaxIncrease: 2,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .2, maxLevel: 8,
        wage: 100,
        unlockCost: 1e13, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["adaptability", 2]],
        expAtts: [],
        efficiencyAtts: [["adaptability", .5]],
    },
    handyman: {
        tier: 1, plane: 0,
        progressMaxBase: 1e15, progressMaxIncrease: 2,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .2, maxLevel: 8,
        wage: 2000,
        unlockCost: 1e15, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["adaptability", 4]],
        expAtts: [],
        efficiencyAtts: [["adaptability", .3]],
    },
    tavernHelper: {
        tier: 1, plane: 0,
        progressMaxBase: 1e17, progressMaxIncrease: 3,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .2, maxLevel: 8,
        wage: 20000,
        unlockCost: 2e17, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["adaptability", 8], ["discernment", 10], ["confidence", 3]],
        expAtts: [],
        efficiencyAtts: [["adaptability", .1]],
    },

    socialize: {
        tier: 1, plane: 0,
        progressMaxBase: 15, progressMaxIncrease: 1,
        expToLevelBase: 100, expToLevelIncrease: 1.4,
        actionPowerBase: 1, actionPowerMult: 1, actionPowerMultIncrease: 1.1,
        efficiencyBase: .05,
        unlockCost: 1e15, visible: false, unlocked: false, purchased: true,
        isGenerator: true, generatorTarget: "meetPeople", generatorSpeed: 5,
        onCompleteCustom: function () {
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
                actionObj.actionPowerMult * (actionObj.efficiency / 100);
            let resourceTaken = actionObj.resource * actionObj.tierMult();
            actionObj.resourceToAdd = dataObj.actionPowerFunction(resourceTaken) * actionObj.actionPower * actionObj.upgradeMult;
            actionObj.expToAddBase = actionObj.resourceToAdd;
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
        },
        updateUpgradeMult: function () {
            let upgradeMult = 1;
            upgradeMult *= Math.pow(1.25, data.upgrades.haveBetterConversations.upgradePower);
            data.actions.socialize.upgradeMult = upgradeMult;
        },
        onLevelAtts: [["confidence", 1]],
        expAtts: [["confidence", 1], ["recognition", 1], ["charm", 1], ["influence", 1]],
        efficiencyAtts: [["confidence", .1]],
        actionPowerFunction: function (resource) {
            if (resource < 1e12) {
                return 0;
            }
            return Math.pow(resource / 1e12, .5); //sqrt(num * mult) * wage
        },
        onCompleteText: {
            english: Raw.html`
                -<span style="font-weight:bold;" id="socializeResourceTaken">???</span> Momentum was taken from this action, converted to <br>
                +<span style="font-weight:bold;" id="socializeResourceSent">???</span> conversations, added to Meet People.<br>`
        },
        extraInfo: {
            english: `<br>Momentum Taken = current Momentum * Tier Mult.<br>
                        Exp & Conversations gain = (Momentum Taken/1e12)^.5 * Action Power * Speed.<br>
                        Requires 1e12 Momentum Taken to function.`
        },
        actionTriggers: [
            ["info", "text", "Generates Conversations using Momentum"],
            ["unlock", "reveal", "meetPeople"]
        ]
    },
    meetPeople: {
        tier: 1, plane: 0, resourceName: "conversations",
        progressMaxBase: 1, progressMaxIncrease: 1.5,
        expToLevelBase: 50, expToLevelIncrease: 1,
        efficiencyBase: .5, maxLevel: 50,
        unlockCost: .5, visible: false, unlocked: false, purchased: true, hasUpstream: false, keepParentAutomation:true,
        onLevelAtts: [["recognition", 30]],
        expAtts: [["charm", 1]],
        efficiencyAtts: [["confidence", .1]],
        actionTriggers: [
            ["unlock", "reveal", "buySocialAccess"],
            ["unlock", "reveal", "talkWithScott"]
        ]
    },
    joinCoffeeClub: {
        tier: 1, plane: 0, resourceName: "conversations",
        progressMaxBase: 600000000000, progressMaxIncrease: 1,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .00001,
        unlockCost: 20000, maxLevel: 1,
        visible: false, unlocked: false, purchased: true,
        onLevelAtts: [],
        expAtts: [["influence", 100], ["recognition", 1]],
        efficiencyAtts: [["influence", 100], ["recognition", .01]],
        actionTriggers: [
            ["unlock", "reveal", "buyCoffee"],
            ["level_1", "reveal", "gossipAroundCoffee"]
        ]
    },
    gossipAroundCoffee: {
        tier: 1, plane: 0, resourceName: "conversations",
        progressMaxBase: 1e7, progressMaxIncrease: 20,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .1,
        unlockCost: 1000000, maxLevel: 10,
        visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["discernment", 10]],
        expAtts: [["cunning", 1]],
        efficiencyAtts: [["discernment", .5]],
        actionTriggers: [
            ["unlock", "reveal", "hearAboutTheLich"],
            ["level_5", "unlock", "hearAboutTheLich"]
        ]
    },
    hearAboutTheLich: {
        tier: 1, plane: 0, resourceName: "fear",
        progressMaxBase: 4000, progressMaxIncrease: 1e3,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 2,
        unlockCost: 0,
        visible: false, unlocked: false, purchased: true, hasUpstream: false, keepParentAutomation:true,
        onLevelCustom: function () {
            data.ancientCoinMultKTL = data.actions.hearAboutTheLich.level;
        },
        updateMults: function () {
            let actionObj = data.actions.hearAboutTheLich;

            actionObj.resourceToAdd = actionData.hearAboutTheLich.calcFearGain();
            actionObj.resourceIncrease = actionObj.resourceToAdd *
                data.actions.overclock.progressGain / data.actions.overclock.progressMax;
        },
        completeFromOverclock: function () {
            let actionObj = data.actions.hearAboutTheLich;
            if (actionObj.unlocked) {
                actionObj.actionPower = actionData.hearAboutTheLich.calcFearGain();
                actionObj.resourceToAdd = actionObj.actionPower;
                actionObj.resource += actionObj.resourceToAdd;
            }
        },
        calcFearGain: function () {
            return Math.pow((data.totalMomentum + data.actions.overclock.resourceToAdd) / 1e24, .25) *
                Math.sqrt(data.actions.gossipAroundCoffee.resource / 1e12);
        },
        onLevelAtts: [["integration", 200]],
        expAtts: [["legacy", 1], ["valor", 1], ["discernment", .01]],
        efficiencyAtts: [],
        extraButton: Raw.html`
            <span class="button" id='killTheLichMenuButton2' onclick="openKTLMenu()"
                style="display:none;padding:8px 13px;position:absolute;top:350px;left:60px;border: 2px solid #aa0000;border-radius: 5px;
                background-color:#550000;text-shadow: 3px 3px 2px rgba(0, 0, 0, 0.8);color: #ffdddd;box-shadow:0 0 10px 6px rgba(255, 0, 0, 0.7);font-size:26px;" >
            Fight the Lich's Forces!</span>
        `,
        unlockMessage: {english: "Unlocks when Gossip Around Coffee is level 5."},
        extraInfo: {
            english: Raw.html`This action gains (Momentum)^0.25 * (Conversations on Gossip)^0.5 / 1e12 Fear 
        for each Overclock complete, which is a gain of
        <span style="font-weight:bold;" id="hearAboutTheLichActionPower2">0</span>`
        },
        actionTriggers: [
            ["info", "text", "Overclock additionally generates Fear on this action."],
            ["info", "text", "Multiply Ancient Coin gain in Northern Wastes by this action's level."]
        ]
    },
    watchBirds: {
        tier: 1, plane: 0,
        progressMaxBase: 800000000, progressMaxIncrease: 1,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .6, maxLevel: 1,
        unlockCost: 400000, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["observation", 30]],
        expAtts: [["concentration", 1], ["curiosity", 1], ["awareness", 1]],
        efficiencyAtts: [["navigation", 1]],
        actionTriggers: [
            ["level_1", "reveal", "catchAScent"]
        ]
    },
    catchAScent: {
        tier: 1, plane: 0,
        progressMaxBase: 1e8, progressMaxIncrease: 1,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .5, maxLevel: 1,
        unlockCost: 5e6, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["observation", 120]],
        expAtts: [["curiosity", 1], ["concentration", 1]],
        efficiencyAtts: [["navigation", 1]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "bodyAwareness", 3]
        ]
    },
    exploreDifficultPath: {
        tier: 1, plane: 0,
        progressMaxBase: 2e13, progressMaxIncrease: 20,
        expToLevelBase: 2, expToLevelIncrease: 1,
        efficiencyBase: .2, maxLevel: 2,
        unlockCost: 1e12, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["navigation", 2]],
        expAtts: [["geared", 1]],
        efficiencyAtts: [["navigation", 1], ["geared", .01]],
        actionTriggers: [
            ["level_1", "reveal", "keepGoing"],
            ["level_1", "reveal", "eatGoldenFruit"],
        ]
    },
    eatGoldenFruit: {
        tier: 2, plane: 0,
        progressMaxBase: 1e11, progressMaxIncrease: 10,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 1,
        unlockCost: 5e11, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["awareness", 1000], ["integration", 40]],
        expAtts: [],
        efficiencyAtts: []
    },
    keepGoing: {
        tier: 1, plane: 0,
        progressMaxBase: 2e14, progressMaxIncrease: 5,
        expToLevelBase: 2, expToLevelIncrease: 1,
        efficiencyBase: .2, maxLevel: 2,
        unlockCost: 5e12, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["navigation", 3], ["flow", 5]],
        expAtts: [["geared", 1]],
        efficiencyAtts: [["geared", .01]],
        actionTriggers: [
            ["unlock", "reveal", "climbTheRocks"]
        ]
    },
    climbTheRocks: {
        tier: 1, plane: 0,
        progressMaxBase: 4e14, progressMaxIncrease: 1,
        expToLevelBase: 2, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 5,
        unlockCost: 1e13, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["concentration", 100]],
        expAtts: [["geared", 1]],
        efficiencyAtts: [["geared", .01]],
        actionTriggers: [
            ["level_5", "reveal", "spotAPath"]
        ]
    },
    spotAPath: {
        tier: 1, plane: 0,
        progressMaxBase: 3e16, progressMaxIncrease: 3,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 1,
        unlockCost: 3e13, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["navigation", 20], ["flow", 20]],
        expAtts: [["geared", 1], ["vision", .1]],
        efficiencyAtts: [["integration", 1], ["vision", .1], ["geared", .01]],
        actionTriggers: [
            ["level_1", "reveal", "pleasantForest"]
        ]
    },
    pleasantForest: {
        tier: 1, plane: 0,
        progressMaxBase: 1e16, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .2, maxLevel: 10,
        unlockCost: 1e15, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["observation", 2000]],
        expAtts: [["endurance", 1], ["flow", 1]],
        efficiencyAtts: [["curiosity", .01]],
        actionTriggers: [
            ["unlock", "reveal", "hiddenPath"]
        ]
    },
    hiddenPath: {
        tier: 1, plane: 0,
        progressMaxBase: 2e19, progressMaxIncrease: 5,
        expToLevelBase: 7, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 5,
        unlockCost: 5e14, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["concentration", 500]],
        expAtts: [["observation", 1], ["geared", 1]],
        efficiencyAtts: [],
        actionTriggers: [
            ["unlock", "reveal", "exploreTheForest"],
            ["unlock", "reveal", "meetGrumpyHermit"]
        ]
    },
    meetGrumpyHermit: {
        tier: 1, plane: 0,
        progressMaxBase: 4e18, progressMaxIncrease: 40,
        expToLevelBase: 4, expToLevelIncrease: 1,
        efficiencyBase: .0001, maxLevel: 1,
        unlockCost: 2e14, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["flow", 80]],
        expAtts: [["curiosity", 1], ["observation", 1]],
        efficiencyAtts: [["confidence", 1000]],
        actionTriggers: [
            ["unlock", "reveal", "socialize"],
            ["level_1", "reveal", "annoyHermitIntoAQuest"],
            ["level_2", "reveal", "talkToHermit"],
        ]
    },
    exploreTheForest: {
        tier: 1, plane: 0,
        progressMaxBase: 2e16, progressMaxIncrease: 3,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 10,
        unlockCost: 3e15, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["curiosity", 200]],
        expAtts: [["endurance", 1]],
        efficiencyAtts: [],
        actionTriggers: [
            ["unlock", "reveal", "travelAlongTheRiver"]
        ]
    },
    annoyHermitIntoAQuest: {
        tier: 1, plane: 0,
        progressMaxBase: 3e15, progressMaxIncrease: 1,
        expToLevelBase: 100, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 1,
        unlockCost: 2e15, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["concentration", 2000]],
        expAtts: [["curiosity", 1]],
        efficiencyAtts: [],
        actionTriggers: [
            ["level_1", "reveal", "gatherRiverWeeds"]
        ]
    },
    presentTheOffering: {
        tier: 1, plane: 0,
        progressMaxBase: 10e15, progressMaxIncrease: 1.05,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 100,
        unlockCost: 40e15, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["control", 1]],
        expAtts: [["control", 1]],
        efficiencyAtts: [],
        actionTriggers: [
            ["unlock", "addMaxLevels", "meetGrumpyHermit", 1]
        ]
    },
    talkToHermit: {
        tier: 1, plane: 0,
        progressMaxBase: 100e18, progressMaxIncrease: 1,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .00003, maxLevel: 1,
        unlockCost: 100e15, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["flow", 80]],
        expAtts: [["charm", 10]],
        efficiencyAtts: [["charm", 10]],
        actionTriggers: [
            ["unlock", "reveal", "chatWithHermit"],
            ["unlock", "reveal", "tellAJoke"]
        ]
    },
    inquireAboutMagic: {
        tier: 1, plane: 0,
        progressMaxBase: 1e18, progressMaxIncrease: 3,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 4,
        unlockCost: 5e18, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
            statAddAmount("legacy", 1);
            unveilPlane(0);
            unveilPlane(1);
            data.actions.echoKindle.unlocked = true;
            revealAtt("legacy");
        },
        onLevelAtts: [["integration", 40], ["curiosity", 500]],
        expAtts: [],
        efficiencyAtts: [],
        actionTriggers: [
            ["info", "text", "On Unlock: Open Magic Tab"],
            ["info", "text", "On Unlock: Gain 1 Legacy"],
            ["unlock", "reveal", "echoKindle"],
            ["unlock", "reveal", "sparkMana"],
            ["level_1", "reveal", "learnToStayStill"],
            ["level_2", "reveal", "feelTheResonance"],
            ["level_3", "reveal", "layerTheEchoes"],
            ["level_4", "reveal", "igniteTheSpark"],
        ]
    },
    talkWithScott: {
        tier: 1, plane: 0, resourceName: "conversations",
        progressMaxBase: 50, progressMaxIncrease: 100,
        expToLevelBase: 50, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 2,
        unlockCost: 1, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["savvy", 100]],
        expAtts: [["confidence", 1], ["recognition", 1]],
        efficiencyAtts: [["discernment", 1]],
        actionTriggers: [
            ["unlock", "reveal", "handyman"],
            ["level_1", "reveal", "learnToListen"],
            ["level_2", "reveal", "tavernHelper"],
            ["level_2", "reveal", "talkWithJohn"],
        ]
    },
    talkWithJohn: {
        tier: 1, plane: 0, resourceName: "conversations",
        progressMaxBase: 2e5, progressMaxIncrease: 100,
        expToLevelBase: 50, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 2,
        unlockCost: 4e6, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["savvy", 2500]],
        expAtts: [["confidence", 1]],
        efficiencyAtts: [["discernment", .5]],
        actionTriggers: [
            ["level_1", "reveal", "guildReceptionist"],
            ["level_2", "reveal", "messenger"],
        ]
    },
    learnToListen: {
        tier: 1, plane: 0, resourceName: "conversations",
        progressMaxBase: 1000000, progressMaxIncrease: 100,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .3, maxLevel: 10,
        unlockCost: 10, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["discernment", 10], ["confidence", 5]],
        expAtts: [["observation", 1], ["curiosity", 1]],
        efficiencyAtts: [["discernment", .1]],
        actionTriggers: [
            ["unlock", "reveal", "chatWithMerchants"],
            ["level_10", "reveal", "learnToInquire"],
        ]
    },
    chatWithMerchants: {
        tier: 1, plane: 0, resourceName: "conversations",
        progressMaxBase: 5000, progressMaxIncrease: 2,
        expToLevelBase: 20, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 3,
        unlockCost: 50, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["recognition", 200], ["cunning", 10]],
        expAtts: [["observation", 1]],
        efficiencyAtts: [["discernment", 1]],
        actionTriggers: [
            ["unlock", "reveal", "browseStores"],
            ["level_1", "reveal", "complimentTheChef"],
            ["level_2", "reveal", "askAboutStitching"],
            ["level_3", "reveal", "listenToWoes"]
        ]
    },
    complimentTheChef: {
        tier: 1, plane: 0, resourceName: "conversations",
        progressMaxBase: 5, progressMaxIncrease: 40,
        expToLevelBase: 20, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 2,
        unlockCost: 50, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["charm", 40], ["awareness", 1000]],
        expAtts: [],
        efficiencyAtts: [["discernment", 1]],
        actionTriggers: [
            ["level_1", "reveal", "buyStreetFood"],
            ["level_2", "reveal", "buyGoodFood"],
        ]
    },
    askAboutStitching: {
        tier: 1, plane: 0, resourceName: "conversations",
        progressMaxBase: 10, progressMaxIncrease: 40,
        expToLevelBase: 20, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 2,
        unlockCost: 100, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["charm", 40], ["control", 10]],
        expAtts: [],
        efficiencyAtts: [["discernment", 1]],
        actionTriggers: [
            ["level_1", "reveal", "buyMatchingClothes"],
            ["level_1", "reveal", "buyStylishClothes"],
        ]
    },
    listenToWoes: {
        tier: 1, plane: 0, resourceName: "conversations",
        progressMaxBase: 40, progressMaxIncrease: 40,
        expToLevelBase: 40, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 2,
        unlockCost: 400, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["concentration", 2000], ["charm", 80], ["confidence", 5]],
        expAtts: [],
        efficiencyAtts: [["discernment", 1]],
        actionTriggers: [
            ["unlock", "reveal", "keyToTheBackroom"]
        ]
    },
    keyToTheBackroom: {
        tier: 1, plane: 0, resourceName: "conversations",
        progressMaxBase: 200, progressMaxIncrease: 1,
        expToLevelBase: 20, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 1,
        unlockCost: 200, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [],
        expAtts: [],
        efficiencyAtts: [["discernment", 1]],
        actionTriggers: [
            ["level_1", "reveal", "browseBackrooms"],
            ["level_1", "reveal", "joinCoffeeClub"],
            ["level_1", "reveal", "slideTheCoin"]
        ]
    },
    chatWithHermit: {
        tier: 1, plane: 0, resourceName: "conversations",
        progressMaxBase: 1000000, progressMaxIncrease: 5,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 10,
        unlockCost: 10000, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["confidence", 5]],
        expAtts: [["charm", 1]],
        efficiencyAtts: [["discernment", 1]]
    },
    tellAJoke: {
        tier: 1, plane: 0, resourceName: "conversations",
        progressMaxBase: 1000, progressMaxIncrease: 2,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 10,
        unlockCost: 5000, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["charm", 1000]],
        expAtts: [],
        efficiencyAtts: [["discernment", .5]],
        actionTriggers: [
            ["level_1", "reveal", "inquireAboutMagic"]
        ]
    },
    learnToInquire: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 2,
        progressMaxBase: 3e21, progressMaxIncrease: 100,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .05, maxLevel: 10,
        unlockCost: 1e16, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["charm", 5000], ["discernment", 20]],
        expAtts: [["curiosity", 1], ["confidence", 1]],
        efficiencyAtts: [["discernment", .05]],
        actionTriggers: [
            ["level_1", "reveal", "talkToTheRecruiters"]
        ]
    },
    talkToTheRecruiters: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 2,
        progressMaxBase: 1e20, progressMaxIncrease: 100,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .05, maxLevel: 2,
        unlockCost: 1e16, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["confidence", 200]],
        expAtts: [["recognition", 1]],
        efficiencyAtts: [["discernment", .05]],
        actionTriggers: [
            ["unlock", "reveal", "buyPointyHat"],
            ["level_1", "reveal", "askAboutLocalWork"],
            ["level_1", "reveal", "askAboutArcaneCorps"]
        ]
    },
    askAboutLocalWork: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 2,
        progressMaxBase: 8e20, progressMaxIncrease: 100,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .05, maxLevel: 1,
        unlockCost: 4e16, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["adaptability", 100]],
        expAtts: [["discernment", 1], ["adaptability", 1]],
        efficiencyAtts: [["discernment", .05]],
        actionTriggers: [
            ["level_1", "reveal", "worksiteSweeper"]
        ]
    },
    askAboutArcaneCorps: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 2,
        progressMaxBase: 1e26, progressMaxIncrease: 10,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .0005, maxLevel: 2,
        unlockCost: 2e16, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["recognition", 10000]],
        expAtts: [["discernment", 1], ["charm", 1], ["confidence", 1]],
        efficiencyAtts: [["discernment", .05], ["confidence", .1]],
        actionTriggers: [
            ["level_1", "reveal", "getTestedForKnowledge"]
        ]
    },
    getTestedForKnowledge: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 2,
        progressMaxBase: 1e28, progressMaxIncrease: 100,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 1,
        unlockCost: 5e16, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["integration", 400]],
        expAtts: [["wizardry", 1], ["pulse", 1], ["vision", 1], ["control", 1]],
        efficiencyAtts: [["wizardry", .01]],
        actionTriggers: [
            ["level_1", "reveal", "discussPlacement"]
        ]
    },
    discussPlacement: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 2,
        progressMaxBase: 1e20, progressMaxIncrease: 5,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 4,
        unlockCost: 1e18, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["discernment", 75]],
        expAtts: [["influence", 1]],
        efficiencyAtts: [["discernment", .05]],
        actionTriggers: [
            ["level_1", "reveal", "meetTheMages"]
        ]
    },
    meetTheMages: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 2,
        progressMaxBase: 2e28, progressMaxIncrease: 10,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 4,
        unlockCost: 5e17, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["wizardry", 4000], ["control", 25]],
        expAtts: [["confidence", 1], ["charm", 1], ["wizardry", 1]],
        efficiencyAtts: [["discernment", .05]],
        actionTriggers: [
            ["level_1", "reveal", "trainWithTeam"],
            ["level_1", "unlock", "trainWithTeam"]
        ]
    },
    trainWithTeam: {
        tier: 2, plane: 0, resourceName: "teamwork", creationVersion: 2,
        progressMaxBase: 30, progressMaxIncrease: 0.8,
        expToLevelBase: 300000, expToLevelIncrease: 1000, generatesPastMax: true,
        // actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1,
        efficiencyBase: .2, maxLevel: 2,
        unlockCost: 0, visible: false, unlocked: false, purchased: false, hasUpstream: false, isSpellConsumer: true,
        isGenerator: true, generatorSpeed: 1,
        onCompleteCustom: function () {
            let actionObj = data.actions.trainWithTeam;
            actionData.trainWithTeam.updateMults();

            if (actionObj.resourceToAdd > 0) {
                addResourceTo(actionObj, actionObj.resourceToAdd);
            }
            useActiveSpellCharges()

            views.scheduleUpdate('trainWithTeamResourceTaken', intToString(actionObj.resourceToAdd, 1), "textContent")
            views.scheduleUpdate('trainWithTeamResourceSent', intToString(actionObj.expToAdd, 2), "textContent")
        },
        updateMults: function () {
            let actionObj = data.actions.trainWithTeam;
            let dataObj = actionData.trainWithTeam;

            actionObj.progressGain = dataObj.generatorSpeed * (actionObj.efficiency / 100);
            actionObj.resourceToAdd = getActiveSpellPower(false);
            if (data.actions.trainWithTeam.level !== data.actions.trainWithTeam.maxLevel) {
                actionObj.expToAddBase = actionObj.resourceToAdd;
            } else {
                actionObj.expToAddBase = 0;
            }
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
        },
        onLevelCustom: function () {
            data.legacyMultKTL = 3 * data.actions.trainWithTeam.level;
        },
        onUnlock: function () {
            data.legacyMultKTL = 3;
            views.updateVal(`killTheLichMenuButton2`, "Fight the Lich's Forces, Together!");
        },
        onLevelAtts: [],
        expAtts: [["wizardry", 1], ["peace", 1], ["intellect", .1]],
        efficiencyAtts: [["wizardry", .00005]],
        onLevelText: {english: "+1 to Hear About the Lich max level."},
        unlockMessage: {english: "Unlocks when Meet The Mages is level 1. On unlock, all legacy gained in Northern Wastes is multiplied by 3."},
        extraInfo: {english: Raw.html`This action, when it completes, will consume one spell charge from all spells with Spell Power.<br>Legacy gain is x3 for unlocking, and further multiplied by the level of this action, starting at level 2.<br>Teamwork increases Fight, at a rate of (teamwork/1000)^.5`},
        onCompleteText: {
            english: Raw.html`
                <span style="font-weight:bold;" id="trainWithTeamResourceTaken">???</span> Spell Power was used from active spells, giving <br>
                +<span style="font-weight:bold;" id="trainWithTeamResourceSent">???</span> Exp to this action.<br>
                `
        },
        actionTriggers: [
            ["info", "text", "Generates Teamwork using charged spells."],
            ["info", "text", "Multiply Legacy gain in Northern Wastes by this action's level."],
            ["info", "text", "High teamwork increases Fight (see info)."],
            ["info", "text", "On Unlock: x3 legacy gain in Northern Wastes"],
            ["level", "addMaxLevels", "hearAboutTheLich", 1]
        ]
    },

    learnToStayStill: {
        tier: 1, plane: 0,
        progressMaxBase: 1e19, progressMaxIncrease: 1,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 1,
        unlockCost: 1e19, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [],
        expAtts: [],
        efficiencyAtts: [],
        actionTriggers: [
            ["unlock", "reveal", "meditate"],
            ["unlock", "reveal", "journal"]
        ]
    },
    feelTheResonance: {
        tier: 1, plane: 0,
        progressMaxBase: 1e17, progressMaxIncrease: 1,
        expToLevelBase: 100, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 1,
        unlockCost: 3e19, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [],
        expAtts: [],
        efficiencyAtts: []
    },
    layerTheEchoes: {
        tier: 1, plane: 0,
        progressMaxBase: 5e18, progressMaxIncrease: 1,
        expToLevelBase: 9, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 1,
        unlockCost: 1e20, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
        },
        onLevelCustom: function () {
        },
        onLevelAtts: [],
        expAtts: [],
        efficiencyAtts: []
    },
    igniteTheSpark: {
        tier: 1, plane: 0,
        progressMaxBase: 1e20, progressMaxIncrease: 1,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 1,
        unlockCost: 3e20, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["legacy", 9], ["pulse", 10]],
        expAtts: [],
        efficiencyAtts: [],
        actionTriggers: [
            ["level_1", "reveal", "pesterHermitForSecrets"]
        ]
    },
    travelAlongTheRiver: {
        tier: 1, plane: 0,
        progressMaxBase: 1e16, progressMaxIncrease: 3,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 10,
        unlockCost: 3e15, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["endurance", 2000], ["coordination", 800]],
        expAtts: [["might", 1]],
        efficiencyAtts: []
    },
    gatherRiverWeeds: {
        tier: 1, plane: 0,
        progressMaxBase: 8e22, progressMaxIncrease: 1.1,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 10,
        unlockCost: 3e15, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["might", 1000]],
        expAtts: [["coordination", 1], ["observation", 1], ["endurance", 1]],
        efficiencyAtts: [],
        actionTriggers: [
            ["level_10", "reveal", "presentTheOffering"]
        ]
    },
    pesterHermitForSecrets: {
        tier: 1, plane: 0,
        progressMaxBase: 3e20, progressMaxIncrease: 500,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 3,
        unlockCost: 1e21, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["curiosity", 10000]],
        expAtts: [],
        efficiencyAtts: [],
        actionTriggers: [
            ["unlock", "reveal", "restAtWaterfall"],
            ["level_1", "reveal", "visitShrineBehindWaterfall"],
            ["level_2", "reveal", "travelToCrossroads"],
            ["level_3", "reveal", "forgottenShrine"]
        ]
    },
    restAtWaterfall: {
        tier: 1, plane: 0,
        progressMaxBase: 6e20, progressMaxIncrease: 3,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 2,
        unlockCost: 2e21, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["flow", 110], ["concentration", 3000]],
        expAtts: [],
        efficiencyAtts: []
    },
    forgottenShrine: {
        tier: 1, plane: 0,
        progressMaxBase: 6e26, progressMaxIncrease: 1,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 1,
        unlockCost: 2e27, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["legacy", 30]],
        expAtts: [],
        efficiencyAtts: []
    },
    visitShrineBehindWaterfall: {
        tier: 1, plane: 0,
        progressMaxBase: 6e21, progressMaxIncrease: 1,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 1,
        unlockCost: 3e22, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["legacy", 20]],
        expAtts: [],
        efficiencyAtts: [],
    },
    travelToCrossroads: {
        tier: 1, plane: 0,
        progressMaxBase: 1e27, progressMaxIncrease: 6,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .02, maxLevel: 10,
        unlockCost: 3e23, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["observation", 30000]],
        expAtts: [["endurance", 1], ["navigation", 1]],
        efficiencyAtts: [["curiosity", .01]],
        actionTriggers: [
            ["level_1", "reveal", "feelAGentleTug"]
        ]
    },
}

//Meditate
actionData = {
    ...actionData,

    standStraighter: {
        tier: 1, plane: 0, creationVersion: 2,
        progressMaxBase: 1e39, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 5,
        unlockCost: 1e33, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["awareness", 2e4], ["coordination", 3000]],
        expAtts: [["endurance", 1], ["control", 1]],
        efficiencyAtts: [],
        actionTriggers: [
            ["level_1", "reveal", "walkAware"]
        ]
    },
    walkAware: {
        tier: 1, plane: 0, creationVersion: 2,
        progressMaxBase: 1e43, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 5,
        unlockCost: 1e37, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["awareness", 5e4], ["coordination", 5000]],
        expAtts: [["endurance", 1], ["control", 1]],
        efficiencyAtts: []
    },
}


//Training / Notice board level 2 / shortcut pt2
actionData = {
    ...actionData,

    reportForTraining: {
        tier: 1, plane: 0,
        progressMaxBase: 3e6, progressMaxIncrease: 1.5,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .05, maxLevel: 5,
        unlockCost: 1e8, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["endurance", 10], ["coordination", 5]],
        expAtts: [["coordination", 1]],
        efficiencyAtts: [["coordination", 1]],
        actionTriggers: [
            ["unlock", "reveal", "basicTrainingWithJohn"]
        ]
    },
    basicTrainingWithJohn: {
        tier: 1, plane: 0,
        progressMaxBase: 1e10, progressMaxIncrease: 8,
        expToLevelBase: 3, expToLevelIncrease: 1,
        efficiencyBase: .5, maxLevel: 5,
        unlockCost: 3e8, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["coordination", 30]],
        expAtts: [["endurance", 1], ["might", 1], ["geared", 1]],
        efficiencyAtts: [["flow", 1]],
        actionTriggers: [
            ["unlock", "reveal", "noticeTheStrain"],
            ["unlock", "reveal", "clenchTheJaw"],
            ["unlock", "reveal", "breatheThroughIt"],
            ["unlock", "reveal", "ownTheWeight"],
            ["unlock", "reveal", "moveWithPurpose"],
            ["unlock", "addMaxLevels", "bodyAwareness", 4]
        ]
    },
    noticeTheStrain: {
        tier: 1, plane: 0,
        progressMaxBase: 5e8, progressMaxIncrease: 60,
        expToLevelBase: 3, expToLevelIncrease: 1,
        efficiencyBase: .08, maxLevel: 3,
        unlockCost: 10e7, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["observation", 500]],
        expAtts: [["endurance", 1], ["might", 10], ["geared", 1]],
        efficiencyAtts: [["coordination", 1]]
    },
    clenchTheJaw: {
        tier: 1, plane: 0,
        progressMaxBase: 2e11, progressMaxIncrease: 3,
        expToLevelBase: 3, expToLevelIncrease: 1,
        efficiencyBase: .15, maxLevel: 2,
        unlockCost: 11e7, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["endurance", 100]],
        expAtts: [["observation", 1], ["endurance", 1], ["geared", 1]],
        efficiencyAtts: [["coordination", 1]]
    },
    breatheThroughIt: {
        tier: 1, plane: 0,
        progressMaxBase: 5e12, progressMaxIncrease: 2,
        expToLevelBase: 3, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 2,
        unlockCost: 12e7, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["flow", 5]],
        expAtts: [["observation", 1], ["endurance", 1], ["geared", 1]],
        efficiencyAtts: [["coordination", 1]]
    },
    ownTheWeight: {
        tier: 1, plane: 0,
        progressMaxBase: 2e9, progressMaxIncrease: 3,
        expToLevelBase: 3, expToLevelIncrease: 1,
        efficiencyBase: .001, maxLevel: 2,
        unlockCost: 13e7, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["might", 50]],
        expAtts: [["geared", 1]],
        efficiencyAtts: [["flow", 1000]]
    },
    moveWithPurpose: {
        tier: 1, plane: 0,
        progressMaxBase: 2e14, progressMaxIncrease: 600,
        expToLevelBase: 3, expToLevelIncrease: 1,
        efficiencyBase: .001, maxLevel: 2,
        unlockCost: 14e7, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["endurance", 1000], ["might", 200], ["coordination", 100]],
        expAtts: [["observation", 1], ["endurance", 1], ["might", 1], ["geared", 1]],
        efficiencyAtts: [["flow", 1000]]
    },
}


//Jobs 1
actionData = {
    ...actionData,

    guildReceptionist: {
        tier: 1, plane: 0,
        progressMaxBase: 1e21, progressMaxIncrease: 3,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .2, maxLevel: 8,
        wage: 500000,
        unlockCost: 1e20, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["adaptability", 16]],
        expAtts: [],
        efficiencyAtts: [["adaptability", .05]],
    },
    messenger: {
        tier: 1, plane: 0,
        progressMaxBase: 1e23, progressMaxIncrease: 4,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 8,
        wage: 4e6,
        unlockCost: 1e22, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["adaptability", 32]],
        expAtts: [],
        efficiencyAtts: [["adaptability", .05]],
    },
    townCrier: {
        tier: 1, plane: 0, creationVersion: 2,
        progressMaxBase: 1e28, progressMaxIncrease: 4,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .03, maxLevel: 8,
        wage: 25e6,
        unlockCost: 1e29, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["adaptability", 100]],
        expAtts: [],
        efficiencyAtts: [["adaptability", .05]],
    },
    storyTeller: {
        tier: 1, plane: 0, creationVersion: 2,
        progressMaxBase: 1e30, progressMaxIncrease: 4,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .001, maxLevel: 8,
        wage: 150e6,
        unlockCost: 1e31, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["adaptability", 100]],
        expAtts: [],
        efficiencyAtts: [["adaptability", .05]],
    },
    worksiteSweeper: {
        tier: 1, plane: 0, creationVersion: 2,
        progressMaxBase: 1e29, progressMaxIncrease: 4,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 8,
        wage: 15e6,
        unlockCost: 1e29, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["adaptability", 100]],
        expAtts: [],
        efficiencyAtts: [["wizardry", .01]],
    },
    digFoundation: {
        tier: 1, plane: 0, creationVersion: 2,
        progressMaxBase: 5e30, progressMaxIncrease: 4,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 8,
        wage: 100e6,
        unlockCost: 5e30, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["adaptability", 100]],
        expAtts: [],
        efficiencyAtts: [["wizardry", .01]],
    },
    stoneCompression: {
        tier: 1, plane: 0, creationVersion: 2,
        progressMaxBase: 1e32, progressMaxIncrease: 5,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .002, maxLevel: 8,
        wage: 500e6,
        unlockCost: 1e32, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["adaptability", 200]],
        expAtts: [],
        efficiencyAtts: [["wizardry", .01]],
    },
    shapeBricks: {
        tier: 1, plane: 0, creationVersion: 2,
        progressMaxBase: 1e35, progressMaxIncrease: 5,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .001, maxLevel: 8,
        wage: 2e9,
        unlockCost: 1e35, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["adaptability", 200]],
        expAtts: [],
        efficiencyAtts: [["wizardry", .01]],
    },
    tidyMagesmithShop: {
        tier: 1, plane: 0, creationVersion: 2, title:"Tidy Magesmith's Shop",
        progressMaxBase: 1e38, progressMaxIncrease: 4,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .0005, maxLevel: 8,
        wage: 5e9,
        unlockCost: 1e38, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["adaptability", 300]],
        expAtts: [],
        efficiencyAtts: [["wizardry", .01]],
    },
    clearTheBasement: {
        tier: 1, plane: 0, creationVersion: 2,
        progressMaxBase: 1e41, progressMaxIncrease: 4,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .0004, maxLevel: 8,
        wage: 15e9,
        unlockCost: 1e41, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["adaptability", 300]],
        expAtts: [],
        efficiencyAtts: [["wizardry", .01]],
    },
    moldBarsFromScrap: {
        tier: 1, plane: 0, creationVersion: 2,
        progressMaxBase: 1e44, progressMaxIncrease: 4,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .0002, maxLevel: 8,
        wage: 50e9,
        unlockCost: 1e44, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [],
        expAtts: [],
        efficiencyAtts: [["wizardry", .01]],
    },
    mendGearCracks: {
        tier: 1, plane: 0, creationVersion: 2,
        progressMaxBase: 1e47, progressMaxIncrease: 4,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .0001, maxLevel: 8,
        wage: 150e9,
        unlockCost: 1e47, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [],
        expAtts: [],
        efficiencyAtts: [["wizardry", .01]],
    },
    assistantMagesmith: {
        tier: 1, plane: 0, creationVersion: 2,
        progressMaxBase: 1e50, progressMaxIncrease: 4,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .00005, maxLevel: 8,
        wage: 250e9,
        unlockCost: 1e50, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [],
        expAtts: [],
        efficiencyAtts: [["wizardry", .01]],
    },


}
