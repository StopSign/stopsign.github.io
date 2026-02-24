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
        expToLevelBase: 2, expToLevelIncrease: 1.1,
        actionPowerBase: 100, actionPowerMult: 1,
        actionPowerMultIncrease: 1.1, efficiencyBase: .1, efficiencyIdeal:40,
        unlockCost: 0, visible: true, unlocked: true, purchased: true, isGenerator: true,
        generatorSpeed: 10, hasUpstream: false, showResourceAdded:true,
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
            this.updateUpgradeMult();
            let spellMult = 1;
            if (isSpellReady('overcharge')) {
                spellMult *= actionData.overcharge.spellPower();
                if (isSpellReady('overboost')) {
                    spellMult *= actionData.overboost.spellPower();
                    if (isSpellReady('overponder')) {
                        spellMult *= actionData.overponder.spellPower();
                    }
                }
            }

            let actionObj = data.actions.overclock;
            actionObj.progressGain = this.generatorSpeed * (actionObj.efficiency / 100);
            actionObj.actionPower = actionObj.actionPowerBase *
                actionObj.actionPowerMult;
            actionObj.resourceToAdd = actionObj.actionPower *
                actionObj.upgradeMult * spellMult * (actionObj.efficiency / 100);
            actionObj.showResourceAdded = actionObj.resourceToAdd;
        },
        onLevelCustom: function () {
            actionData.overclock.updateMults();
        },
        updateUpgradeMult: function () {
            let upgradeMult = 1;
            upgradeMult *= Math.pow(1.25, data.upgrades.increaseMyPace.upgradePower);
            upgradeMult *= Math.pow(1.25, data.upgrades.createABetterFoundation.upgradePower);
            upgradeMult *= (data.upgrades.enhanceOverclock.upgradePower===1?3:1);
            data.actions.overclock.upgradeMult = upgradeMult;
        },
        onLevelAtts: [],
        expAtts: [["awareness", 1], ["concentration", 1], ["energy", 1], ["control", 1],
            ["integration", 1]],
        efficiencyAtts: [["observation", 500]],
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
        expAtts: [["concentration", 1], ["observation", 1]],
        efficiencyAtts: [["concentration", 50]],
        actionTriggers: [
            ["level_1", "reveal", "harnessOverflow"],
            ["level_2", "reveal", "distillInsight"],
            ["level_4", "reveal", "takeNotes"],
            ["level_9", "reveal", "bodyAwareness"]
        ]
    },
    harnessOverflow: {
        tier: 1, plane: 0,
        progressMaxBase: 1, progressMaxIncrease: 1.5,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .5, maxLevel: 10,
        unlockCost: 10, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["concentration", 10]],
        expAtts: [["observation", 1]],
        efficiencyAtts: [["concentration", 100]]
    },
    distillInsight: {
        tier: 1, plane: 0,
        progressMaxBase: 1, progressMaxIncrease: 2,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .2, maxLevel: 10,
        unlockCost: 40, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["observation", 10]],
        expAtts: [["awareness", 1], ["energy", 1]],
        efficiencyAtts: [["concentration", 100]],
    },
    takeNotes: {
        tier: 1, plane: 0,
        progressMaxBase: 25, progressMaxIncrease: 2,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 10,
        unlockCost: 150, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["awareness", 5]],
        expAtts: [["observation", 1]],
        efficiencyAtts: [["observation", 100]]
    },
    bodyAwareness: {
        tier: 1, plane: 0,
        progressMaxBase: 50000, progressMaxIncrease: 20,
        expToLevelBase: 2, expToLevelIncrease: 1,
        efficiencyBase: .25, maxLevel: 1,
        unlockCost: 5000, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["awareness", 10]],
        expAtts: [["energy", 1], ["concentration", .5], ["awareness", .5]],
        efficiencyAtts: [["endurance", 100]],
        actionTriggers: [
            ["level_1", "reveal", "travelOnRoad"],
            ["level_1", "reveal", "travelToOutpost"],
            ["level_1", "reveal", "meetVillageLeaderScott"]
        ]
    },
    remember: {
        tier: 1, plane: 0,
        progressMaxBase: 1000000, progressMaxIncrease: 5,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .2, maxLevel: 3,
        unlockCost: 80000, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["concentration", 20]],
        expAtts: [["awareness", 1], ["observation", 1], ["energy", 1]],
        efficiencyAtts: [["observation", 300]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "bodyAwareness", 1],
            ["level", "addMaxLevels", "distillInsight", 3]
        ]
    },
    travelOnRoad: {
        tier: 1, plane: 0,
        progressMaxBase: 10000, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .25, maxLevel: 10,
        unlockCost: 10000, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["energy", 5]],
        expAtts: [["concentration", .5], ["endurance", .5]],
        efficiencyAtts: [["navigation", 50]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "bodyAwareness", 1]
        ]
    },
    travelToOutpost: {
        tier: 1, plane: 0,
        progressMaxBase: 10000, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .25, maxLevel: 10,
        unlockCost: 30000, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["energy", 5]],
        expAtts: [["endurance", 1]],
        efficiencyAtts: [["navigation", 100]],
        actionTriggers: [
            ["unlock", "reveal", "remember"]
        ]
    },
    meetVillageLeaderScott: {
        tier: 1, plane: 0,
        progressMaxBase: 500000, progressMaxIncrease: 60,
        expToLevelBase: 5, expToLevelIncrease: 2,
        efficiencyBase: .005, maxLevel: 3,
        unlockCost: 100000, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [],
        expAtts: [["curiosity", 1], ["observation", 1]],
        efficiencyAtts: [["observation", 400]],
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
        progressMaxBase: 6000000, progressMaxIncrease: 4,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .03, maxLevel: 4,
        wage: 1,
        unlockCost: 500000, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
            data.displayJob = true;
            views.updateVal(`jobDisplay`, data.displayJob ? "" : "none", "style.display");
        },
        onLevelAtts: [["influence", 25]],
        expAtts: [["ambition", 1]],
        efficiencyAtts: [["energy", 150]],
        actionTriggers: [ //auto-adds wage triggers
            ["unlock", "reveal", "makeMoney"]
        ]
    },
    checkNoticeBoard: {
        tier: 1, plane: 0,
        progressMaxBase: 60e8, progressMaxIncrease: 80,
        expToLevelBase: 2, expToLevelIncrease: 4,
        efficiencyBase: .0001, maxLevel: 3,
        unlockCost: 10e6, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [],
        expAtts: [["observation", 1]],
        efficiencyAtts: [["observation", 500], ["savvy", 50]],
        actionTriggers: [
            ["level_1", "reveal", "browseLocalMarket"],
            ["level_2", "reveal", "reportForTraining"],
            ["level_3", "reveal", "reportForLabor"],
            ["level_3", "reveal", "oddJobsLaborer"]
        ]
    },
    browseLocalMarket: {
        tier: 1, plane: 0,
        progressMaxBase: 4e10, progressMaxIncrease: 6,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .05, maxLevel: 10,
        unlockCost: 5e7, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["savvy", 5], ["observation", 5]],
        expAtts: [["observation", 1], ["influence", 1]],
        efficiencyAtts: [["influence", 150], ["ambition", 10]],
        actionTriggers: [
            ["level_1", "reveal", "buyBasicSupplies"],
            ["level_5", "reveal", "buyBasicClothes"],
        ]
    },
    browseStores: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 1e22, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 10,
        unlockCost: 2e19, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["savvy", 10], ["observation", 5]],
        expAtts: [["influence", 1], ["confidence", 1], ["charm", 1]],
        efficiencyAtts: [["influence", 500], ["ambition", 200]]
    },
    browseBackrooms: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 1e34, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .0001, maxLevel: 10,
        unlockCost: 2e22, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["savvy", 10], ["leverage", 4]],
        expAtts: [["influence", 1], ["confidence", 1], ["charm", 1]],
        efficiencyAtts: [["influence", 800], ["ambition", 200]]
    },
    browsePersonalCollection: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 1e61, progressMaxIncrease: 100,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .000001, maxLevel: 5,
        unlockCost: 5e56, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["savvy", 20], ["ambition", 20]],
        expAtts: [["influence", 1], ["vision", 1]],
        efficiencyAtts: [["observation", 2000]]
    },
    makeMoney: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 10, progressMaxIncrease: 1,
        expToLevelBase: 100, expToLevelIncrease: 1.5,
        actionPowerBase: 1, actionPowerMult: 1, actionPowerMultIncrease: 1.1,
        efficiencyBase: .1,
        unlockCost: 1e7, visible: false, unlocked: false, purchased: true,
        isGenerator: true, generatorTarget: "spendMoney", generatorSpeed: 5,
        onCompleteCustom: function () {
            let actionObj = data.actions.makeMoney;
            actionData.makeMoney.updateMults();
            if (isSpellReady('overwork')) {
                useCharge('overwork');
                if (isSpellReady('overproduce')) {
                    useCharge('overproduce');
                    if (isSpellReady('overdrive')) {
                        useCharge('overdrive');
                    }
                }
            }

            let resourceTaken = actionObj.resource * calcTierMult(this.tier)

            if (actionObj.resourceToAdd > 0) {
                actionObj.resource -= resourceTaken;
                addResourceTo(data.actions[this.generatorTarget], actionObj.resourceToAdd);
            }

            views.scheduleUpdate('makeMoneyResourceSent', intToString(actionObj.resourceToAdd, 2), "textContent")
            views.scheduleUpdate('makeMoneyResourceTaken', intToString(resourceTaken, 2), "textContent")
        },
        updateMults: function () {
            this.updateUpgradeMult();
            let spellMult = 1;
            if (isSpellReady('overwork')) {
                spellMult *= actionData.overwork.spellPower();
                if (isSpellReady('overproduce')) {
                    spellMult *= actionData.overproduce.spellPower();
                    if (isSpellReady('overdrive')) {
                        spellMult *= actionData.overdrive.spellPower();
                    }
                }
            }

            let actionObj = data.actions.makeMoney;

            actionObj.progressGain = this.generatorSpeed * (actionObj.efficiency / 100);
            actionObj.actionPower = actionObj.actionPowerBase *
                actionObj.actionPowerMult;
            let resourceTaken = actionObj.resource * calcTierMult(this.tier);
            actionObj.resourceToAdd = this.actionPowerFunction(resourceTaken) *
                actionObj.actionPower * actionObj.upgradeMult * spellMult * (actionObj.efficiency / 100);
            actionObj.expToAddBase = actionObj.resourceToAdd;
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
            data.actions[this.generatorTarget].showResourceAdded = actionObj.resourceToAdd;
        },
        updateUpgradeMult: function () {
            let upgradeMult = 1;
            upgradeMult *= Math.pow(2, data.upgrades.extractMyWorth.upgradePower);
            upgradeMult *= Math.pow(2, data.upgrades.workHarder.upgradePower);
            data.actions.makeMoney.upgradeMult = upgradeMult;
        },
        onLevelAtts: [["ambition", 1]],
        expAtts: [["savvy", 1], ["leverage", 1], ["integration", 1]],
        efficiencyAtts: [["ambition", 150]],
        actionPowerFunction: function (resource) {
            if (resource < 1) {
                return 0;
            }
            return Math.pow(resource, .5) * data.currentWage; //sqrt(num * mult) * wage
        },
        onCompleteText: {
            english: Raw.html`
                -<span style="font-weight:bold;" id="makeMoneyResourceTaken">???</span> Momentum was taken from this action, converted to<br>
                +<span style="font-weight:bold;" id="makeMoneyResourceSent">???</span> Coins, added to Spend Money.<br>
                `
        },
        extraInfo: {
            english: Raw.html`<br>Momentum Taken = 1% of current Momentum.<br>
                        Exp & Coins gain = (Momentum Taken)^.5 * Action Power * Speed * Wages.`
        },
        actionTriggers: [
            ["info", "text", "Generates Coins using Momentum"],
            ["unlock", "reveal", "spendMoney"]
        ]
    },
    spendMoney: {
        tier: 2, plane: 0, resourceName: "coins", creationVersion: 6,
        progressMaxBase: .5, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .5, maxLevel: 10, showResourceAdded:true,
        unlockCost: 50, visible: false, unlocked: false, purchased: true, hasUpstream: false, keepParentAutomation:true,
        onLevelAtts: [["energy", 15]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 20]]
    },
    buyBasicSupplies: {
        tier: 2, plane: 0, resourceName: "coins", creationVersion: 6,
        progressMaxBase: 500, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .4, maxLevel: 10,
        unlockCost: 2000, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["energy", 10], ["influence", 5]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 50]]
    },
    buyBasicClothes: {
        tier: 2, plane: 0, resourceName: "coins", creationVersion: 6,
        progressMaxBase: 5000, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .3, maxLevel: 10,
        unlockCost: 10000, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["endurance", 10]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 75]]
    },
    buyTravelersClothes: {
        tier: 2, plane: 0, resourceName: "coins", title:"Buy Traveler's Clothes", creationVersion: 6,
        progressMaxBase: 5e5, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 10,
        unlockCost: 2e6, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["endurance", 10]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 125]]
    },
    buyMarketItems: {
        tier: 2, plane: 0, resourceName: "coins", creationVersion: 6,
        progressMaxBase: 5e7, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 10,
        unlockCost: 5e7, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["energy", 10], ["influence", 10]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 150]]
    },
    buyShopItems: {
        tier: 2, plane: 0, resourceName: "coins", creationVersion: 6,
        progressMaxBase: 5e9, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .05, maxLevel: 10,
        unlockCost: 5e10, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["energy", 10], ["endurance", 10]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 200]],
        actionTriggers: [
            ["level_3", "reveal", "invest"]
        ]
    },
    buySocialAccess: {
        tier: 2, plane: 0, resourceName: "coins", creationVersion: 6,
        progressMaxBase: 5e16, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .05, maxLevel: 10,
        unlockCost: 1e16, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["influence", 10], ["confidence", 3]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 200]]
    },
    buyPointyHat: {
        tier: 2, plane: 0, resourceName: "coins", creationVersion: 6,
        progressMaxBase: 5e72, progressMaxIncrease: 10,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .00001, maxLevel: 1,
        unlockCost: 2e62, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["confidence", 50], ["charm", 50]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 1300]]
    },
    buyStreetFood: {
        tier: 2, plane: 0, resourceName: "coins", creationVersion: 6,
        progressMaxBase: 5e18, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .05, maxLevel: 10,
        unlockCost: 2e17, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["energy", 10], ["influence", 5]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 225]]
    },
    buyGoodFood: {
        tier: 2, plane: 0, resourceName: "coins", creationVersion: 6,
        progressMaxBase: 5e22, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .05, maxLevel: 10,
        unlockCost: 2e20, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["energy", 15]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 300]]
    },
    buyMatchingClothes: {
        tier: 2, plane: 0, resourceName: "coins", creationVersion: 6,
        progressMaxBase: 5e17, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .05, maxLevel: 10,
        unlockCost: 2e17, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["charm", 2], ["confidence", 2]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 225]]
    },
    buyStylishClothes: {
        tier: 2, plane: 0, resourceName: "coins", creationVersion: 6,
        progressMaxBase: 5e20, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .05, maxLevel: 10,
        unlockCost: 2e19, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["influence", 10], ["confidence", 2], ["charm", 2]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 250]],
        actionTriggers: [
            ["level_10", "reveal", "buyComfyShoes"],
            ["level_10", "reveal", "buyTravelersGear"],
        ]
    },
    slideTheCoin: {
        tier: 2, plane: 0, resourceName: "coins", creationVersion: 6,
        progressMaxBase: 5e26, progressMaxIncrease: 1,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .001, maxLevel: 1,
        unlockCost: 4e20, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["influence", 40]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["charm", 250]]
    },
    buyCoffee: {
        tier: 2, plane: 0, resourceName: "coins", creationVersion: 6,
        progressMaxBase: 5e28, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .001, maxLevel: 10,
        unlockCost: 2e23, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["influence", 10], ["energy", 10]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["influence", 900]]
    },
    buyComfyShoes: {
        tier: 2, plane: 0, resourceName: "coins", creationVersion: 6,
        progressMaxBase: 5e38, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .001, maxLevel: 10,
        unlockCost: 2e32, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["energy", 20]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 400]]
    },
    buyTravelersGear: {
        tier: 2, plane: 0, resourceName: "coins", creationVersion: 6, title:"Buy Traveler's Gear",
        progressMaxBase: 5e40, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .001, maxLevel: 10,
        unlockCost: 2e34, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["endurance", 20]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 425]],
        actionTriggers: [
            ["level_1", "reveal", "buyArtisanFood"]
        ]
    },
    buyArtisanFood: {
        tier: 2, plane: 0, resourceName: "coins", creationVersion: 6,
        progressMaxBase: 5e46, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .0005, maxLevel: 10,
        unlockCost: 2e39, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["energy", 20]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 475]]
    },
    buyShinyThings: {
        tier: 2, plane: 0, resourceName: "coins", creationVersion: 6,
        progressMaxBase: 5e47, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .0005, maxLevel: 10,
        unlockCost: 2e40, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["ambition", 10], ["charm", 5]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 500]],
        actionTriggers: [
            ["level_1", "reveal", "buyTools"],
            ["level_5", "reveal", "buyPotions"],
        ]
    },
    buyTools: {
        tier: 2, plane: 0, resourceName: "coins", creationVersion: 6,
        progressMaxBase: 5e53, progressMaxIncrease: 20,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .0005, maxLevel: 10,
        unlockCost: 2e46, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["might", 10], ["wizardry", 5]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 750]],
        actionTriggers: [
            ["level_5", "reveal", "buyCart"],
        ]
    },
    buyPotions: {
        tier: 2, plane: 0, resourceName: "coins", creationVersion: 6,
        progressMaxBase: 5e58, progressMaxIncrease: 20,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .0002, maxLevel: 10,
        unlockCost: 2e49, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["energy", 10], ["charm", 5]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 1100]]
    },
    buyCart: {
        tier: 2, plane: 0, resourceName: "coins", creationVersion: 6,
        progressMaxBase: 5e56, progressMaxIncrease: 20,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .0002, maxLevel: 10,
        unlockCost: 2e48, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["endurance", 15]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 900]]
    },
    buyHouse: {
        tier: 2, plane: 0, resourceName: "coins", creationVersion: 6,
        progressMaxBase: 5e86, progressMaxIncrease: 1,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .00001, maxLevel: 1,
        unlockCost: 2e75, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["integration", 30], ["comfort", 10]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 1600]],
        actionTriggers: [
            ["level_1", "reveal", "buyHouseholdItems"],
        ]
    },
    buyHouseholdItems: {
        tier: 2, plane: 0, resourceName: "coins", creationVersion: 6,
        progressMaxBase: 5e88, progressMaxIncrease: 30,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .0001, maxLevel: 10,
        unlockCost: 2e76, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["energy", 10], ["charm", 10]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 1600]],
        actionTriggers: [
            ["level_3", "reveal", "buyFurniture"]
        ]
    },
    buyFurniture: {
        tier: 2, plane: 0, resourceName: "coins", creationVersion: 6,
        progressMaxBase: 2e90, progressMaxIncrease: 30,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .0001, maxLevel: 10,
        unlockCost: 2e77, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["energy", 10], ["comfort", 2]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 1700]],
        actionTriggers: [
            ["level_1", "reveal", "buyReadingChair"],
            ["level_1", "reveal", "buyBed"],
        ]
    },
    buyReadingChair: {
        tier: 2, plane: 0, resourceName: "coins", creationVersion: 6,
        progressMaxBase: 5e81, progressMaxIncrease: 30,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .0001, maxLevel: 10,
        unlockCost: 2e78, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["comfort", 15], ["calm", 2]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 1700]],
        actionTriggers: [
            ["level_1", "reveal", "buyFireplace"]
        ]
    },
    buyBed: {
        tier: 2, plane: 0, resourceName: "coins", creationVersion: 6,
        progressMaxBase: 2e82, progressMaxIncrease: 30,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .0001, maxLevel: 10,
        unlockCost: 8e78, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["energy", 10]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 1800]],
        actionTriggers: [
            ["level_1", "reveal", "buySilkSheets"]
        ]
    },
    buyFireplace: {
        tier: 2, plane: 0, resourceName: "coins", creationVersion: 6,
        progressMaxBase: 5e83, progressMaxIncrease: 30,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .0001, maxLevel: 10,
        unlockCost: 2e79, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["calm", 10], ["comfort", 3]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 1800]],
        actionTriggers: [
            ["level_1", "reveal", "buyGoodFirewood"]
        ]
    },
    buySilkSheets: {
        tier: 2, plane: 0, resourceName: "coins", creationVersion: 6,
        progressMaxBase: 5e84, progressMaxIncrease: 30,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .0001, maxLevel: 10,
        unlockCost: 2e80, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["energy", 10]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 1850]]
    },
    buyGoodFirewood: {
        tier: 2, plane: 0, resourceName: "coins", creationVersion: 6,
        progressMaxBase: 5e85, progressMaxIncrease: 30,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .0001, maxLevel: 10,
        unlockCost: 2e81, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["calm", 10], ["comfort", 2]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 1850]]
    },

    invest: {
        tier: 1, plane: 0, resourceName: "coins", creationVersion: 6, investCap: 1e5,
        progressMaxBase: 10, progressMaxIncrease: 1,
        expToLevelBase: 3e6, expToLevelIncrease: 2.5,
        actionPowerBase: 1, actionPowerMult: 1, actionPowerMultIncrease: 1,
        efficiencyBase: .5,
        unlockCost: 2e12, visible: false, unlocked: false, purchased: false,
        isGenerator: true, generatorTarget: "buildFortune", generatorSpeed: 1,
        onCompleteCustom: function () {
            //stop consuming from reinvest - it's not amount on reinvest * 1.05, but it's 5% of what's on reinvest
            let actionObj = data.actions.invest;
            actionData.invest.updateMults();
            let resourceTaken = actionObj.resource * calcTierMult(this.tier);
            if (resourceTaken <= 1) {
                resourceTaken = 0;
            }

            if (actionObj.resourceToAdd > 0) {
                actionObj.resource -= resourceTaken;
                addResourceTo(data.actions[this.generatorTarget], actionObj.resourceToAdd);
            }

            views.scheduleUpdate('investResourceSent', intToString(actionObj.resourceToAdd, 2), "textContent")
            views.scheduleUpdate('investResourceTaken', intToString(resourceTaken, 2), "textContent")
        },
        updateMults: function () {
            let actionObj = data.actions.invest;

            actionObj.progressGain = this.generatorSpeed * (actionObj.efficiency / 100);
            actionObj.actionPower = actionObj.actionPowerBase *
                actionObj.actionPowerMult;
            let resourceTaken = actionObj.resource * calcTierMult(this.tier); //coins taken
            if (resourceTaken <= 1) {
                resourceTaken = 1; //just to make the math not break
            }
            let reinvested = data.actions.reinvest.resource * (actionObj.actionPower - 1);
            actionObj.resourceToAdd = (reinvested + Math.log10(resourceTaken) * upgradeData.increaseInitialInvestment.currentValue()) * (actionObj.efficiency / 100);
            this.investCap = Math.pow(upgradeData.increaseMarketCap.currentValue(), Math.pow(actionObj.actionPower, 2));
            actionObj.resourceToAdd = actionObj.resourceToAdd > this.investCap ? this.investCap : actionObj.resourceToAdd;

            actionObj.expToAddBase = Math.log10(resourceTaken);
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
            data.actions[this.generatorTarget].showResourceAdded = actionObj.resourceToAdd;
        },
        onLevelCustom: function () {
            data.actions.invest.actionPowerBase = 1 + data.actions.invest.level / 1000;
            actionData.invest.updateMults();
        },
        onLevelAtts: [["vision", 10], ["leverage", 10]],
        expAtts: [["ambition", 1], ["resonance", 1], ["intellect", 1]],
        efficiencyAtts: [["vision", 500]],
        onCompleteText: {
            english: Raw.html`
                -<span style="font-weight:bold;" id="investResourceTaken">???</span> Coins was taken from this action, converted to<br>
                +<span style="font-weight:bold;" id="investResourceSent">???</span> Fortune, added to Build Fortune.<br>
                `
        },
        onLevelText: {english: "+0.001 Action Power per level<br>"},
        extraInfo: {
            english: Raw.html`<br>
            Coins Taken = 1% of current Coins.<br>
            Reinvested = Fortune on Reinvest * (Action Power-1).<br> 
            Base Rate = 1 (increased with upgrades)<br><br>
            Fortune Gain = (log10(Coins Taken) * Base Rate + Reinvested) * efficiency<br><br>
            Exp Gain = log10(Coins Taken)<br><br>
            Fortune Gain is capped at (Market Cap)^((Action Power^2))`
        },
        actionTriggers: [
            ["info", "text", "Uses Coins and Fortune on Reinvest to produce Fortune"],
            ["unlock", "reveal", "buildFortune"],
            ["info", "cap", "invest", "investCap"]
        ]
    },
    buildFortune: {
        tier: 2, plane: 0, resourceName: "fortune", creationVersion: 6, hasUpstream: false,
        progressMaxBase: 10, progressMaxIncrease: 4,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 5, showResourceAdded:true,
        unlockCost: 200, visible: false, unlocked: false, purchased: false, keepParentAutomation:true,
        onLevelAtts: [["ambition", 10]],
        expAtts: [["vision", 1]],
        efficiencyAtts: [["leverage", 500]],
        actionTriggers: [
            ["level_1", "reveal", "spendFortune"],
            ["level_2", "reveal", "reinvest"],
        ]
    },
    reinvest: {
        tier: 3, plane: 0, resourceName: "fortune", creationVersion: 6,
        progressMaxBase: 10000, progressMaxIncrease: 200,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 10,
        unlockCost: 1000, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["vision", 20]],
        expAtts: [["vision", 1]],
        efficiencyAtts: [["leverage", 1000]]
    },
    spendFortune: {
        tier: 2, plane: 0, resourceName: "fortune", creationVersion: 6,
        progressMaxBase: 1, progressMaxIncrease: 20,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 10,
        unlockCost: 100, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["energy", 10], ["confidence", 5]],
        expAtts: [["vision", 1]],
        efficiencyAtts: [["leverage", 600]],
        actionTriggers: [
            ["level_2", "reveal", "buyShinyThings"],
            ["level_3", "reveal", "investInLocals"],
            ["level_5", "reveal", "fundTownImprovements"]
        ]
    },
    investInLocals: {
        tier: 2, plane: 0, resourceName: "fortune", creationVersion: 6,
        progressMaxBase: 150, progressMaxIncrease: 20,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 10,
        unlockCost: 3000, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["influence", 5], ["leverage", 5]],
        expAtts: [["vision", 1]],
        efficiencyAtts: [["leverage", 650]],
        actionTriggers: [
            ["unlock", "reveal", "townCrier"],
            ["level_3", "reveal", "hostAFestival"],
            ["level_8", "reveal", "storyTeller"]
        ]
    },
    hostAFestival: {
        tier: 2, plane: 0, resourceName: "fortune", creationVersion: 6,
        progressMaxBase: 1e4, progressMaxIncrease: 20,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .001, maxLevel: 10,
        unlockCost: 2e4, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["charm", 10]],
        expAtts: [["vision", 1]],
        efficiencyAtts: [["leverage", 700]]
    },
    fundTownImprovements: {
        tier: 2, plane: 0, resourceName: "fortune", creationVersion: 6,
        progressMaxBase: 1e5, progressMaxIncrease: 20,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .0001, maxLevel: 10,
        unlockCost: 2e5, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["influence", 10], ["savvy", 5]],
        expAtts: [["vision", 1]],
        efficiencyAtts: [["leverage", 750]],
        actionTriggers: [
            ["level_3", "reveal", "browsePersonalCollection"],
            ["level_4", "reveal", "supportLocalLibrary"],
            ["level_5", "reveal", "investInSelf"],
            ["level_8", "reveal", "fundASmallStall"],
            ["level", "addMaxLevels", "buyTools", 1],
            ["level", "addMaxLevels", "buyCart", 1],
            ["level", "addMaxLevels", "buyPotions", 1],
        ]
    },
    supportLocalLibrary: {
        tier: 2, plane: 0, resourceName: "fortune", creationVersion: 6,
        progressMaxBase: 2e9, progressMaxIncrease: 20,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .0001, maxLevel: 10,
        unlockCost: 5e7, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["influence", 10], ["savvy", 5], ["leverage", 5]],
        expAtts: [["vision", 1]],
        efficiencyAtts: [["leverage", 800]],
        actionTriggers: [
            ["level_4", "reveal", "expandLocalLibrary"]
        ]
    },
    expandLocalLibrary: {
        tier: 2, plane: 0, resourceName: "fortune", creationVersion: 6,
        progressMaxBase: 2e16, progressMaxIncrease: 20,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .0001, maxLevel: 10,
        unlockCost: 5e10, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["influence", 5], ["leverage", 5], ["intellect", 2]],
        expAtts: [["vision", 1]],
        efficiencyAtts: [["leverage", 1000]],
        actionTriggers: [
            ["level_1", "reveal", "recruitACarpenter"]
        ]
    },
    investInSelf: {
        tier: 2, plane: 0, resourceName: "fortune", creationVersion: 6,
        progressMaxBase: 2e11, progressMaxIncrease: 20,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .0001, maxLevel: 10,
        unlockCost: 5e8, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["savvy", 10], ["confidence", 10]],
        expAtts: [["vision", 1]],
        efficiencyAtts: [["leverage", 850]],
        actionTriggers: [
            ["level_2", "reveal", "makeAPublicDonation"],
            ["level_6", "reveal", "purchaseALot"],
        ]
    },
    makeAPublicDonation: {
        tier: 2, plane: 0, resourceName: "fortune", creationVersion: 6,
        progressMaxBase: 3e12, progressMaxIncrease: 20,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .0001, maxLevel: 10,
        unlockCost: 5e9, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["influence", 10], ["charm", 5]],
        expAtts: [["vision", 1]],
        efficiencyAtts: [["leverage", 900]]
    },
    fundASmallStall: {
        tier: 2, plane: 0, resourceName: "fortune", creationVersion: 6,
        progressMaxBase: 3e16, progressMaxIncrease: 20,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .05, maxLevel: 10,
        unlockCost: 5e11, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["influence", 5], ["savvy", 5]],
        expAtts: [["vision", 1]],
        efficiencyAtts: [["leverage", 1000]]
    },
    purchaseALot: {
        tier: 2, plane: 0, resourceName: "fortune", creationVersion: 6,
        progressMaxBase: 1e19, progressMaxIncrease: 20,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .05, maxLevel: 1,
        unlockCost: 5e13, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["ambition", 50], ["influence", 20]],
        expAtts: [["vision", 1]],
        efficiencyAtts: [["leverage", 1000]],
        actionTriggers: [
            ["level_1", "purchase", "buyHouse"],
            ["level_1", "purchase", "buyHouseholdItems"],
            ["level_1", "reveal", "buyHouse"]
        ]
    },
    recruitACarpenter: {
        tier: 2, plane: 0, resourceName: "fortune", creationVersion: 6,
        progressMaxBase: 5e11, progressMaxIncrease: 20,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .05, maxLevel: 5,
        unlockCost: 5e12, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["charm", 10], ["logistics", 10]],
        expAtts: [["vision", 1]],
        efficiencyAtts: [["leverage", 1000]],
        actionTriggers: [
            ["level", "addMaxLevels", "craftSpellShack", 1],
            ["level_1", "reveal", "craftSpellShack"],
            ["level_1", "reveal", "procureQualityWood"]
        ]
    },
    procureQualityWood: {
        tier: 2, plane: 0, resourceName: "fortune", creationVersion: 6,
        progressMaxBase: 3e13, progressMaxIncrease: 20,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .05, maxLevel: 4,
        unlockCost: 5e14, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["savvy", 10], ["logistics", 10]],
        expAtts: [["vision", 1]],
        efficiencyAtts: [["leverage", 1000]],
        actionTriggers: [
            ["level", "addMaxLevels", "craftSpellShack", 1]
        ]
    },
    sourceRareBooks: {
        tier: 2, plane: 0, resourceName: "fortune", creationVersion: 6,
        progressMaxBase: 5e8, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .05, maxLevel: 10,
        unlockCost: 5e8, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [],
        expAtts: [["vision", 1]],
        efficiencyAtts: [["leverage", 1000]]
    },
    reportForLabor: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 3e9, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .05, maxLevel: 10,
        unlockCost: 5e10, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["endurance", 10]],
        expAtts: [["influence", 1], ["savvy", 1]],
        efficiencyAtts: [["savvy", 100], ["ambition", 75]],
        actionTriggers: [
            ["unlock", "reveal", "exploreDifficultPath"],
            ["level_1", "reveal", "buyTravelersClothes"],
            ["level_5", "reveal", "buyMarketItems"],
            ["level_8", "reveal", "buyShopItems"]
        ]
    },
    oddJobsLaborer: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 1e10, progressMaxIncrease: 2,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .2, maxLevel: 8,
        wage: 20,
        unlockCost: 5e10, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["savvy", 5]],
        expAtts: [],
        efficiencyAtts: [["savvy", 150]],
        actionTriggers: [
            ["level_4", "reveal", "chimneySweep"]
        ]
    },
    chimneySweep: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 1e13, progressMaxIncrease: 2,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 8,
        wage: 100,
        unlockCost: 1e13, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["savvy", 5]],
        expAtts: [],
        efficiencyAtts: [["savvy", 200]],
    },
    handyman: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 5e16, progressMaxIncrease: 5,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .001, maxLevel: 8,
        wage: 2000,
        unlockCost: 5e17, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["savvy", 5]],
        expAtts: [],
        efficiencyAtts: [["savvy", 300]],
    },
    tavernHelper: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 1e19, progressMaxIncrease: 5,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .001, maxLevel: 8,
        wage: 10000,
        unlockCost: 2e19, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["savvy", 5]],
        expAtts: [],
        efficiencyAtts: [["savvy", 400]],
    },

    socialize: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 15, progressMaxIncrease: 1,
        expToLevelBase: 10000, expToLevelIncrease: 1.5,
        actionPowerBase: 1, actionPowerMult: 1, actionPowerMultIncrease: 1.1,
        efficiencyBase: .1,
        unlockCost: 1e15, visible: false, unlocked: false, purchased: true,
        isGenerator: true, generatorTarget: "meetPeople", generatorSpeed: 5,
        onCompleteCustom: function () {
            let actionObj = data.actions.socialize;
            actionData.socialize.updateMults();
            if (isSpellReady('overtalk')) {
                useCharge('overtalk');
                if (isSpellReady('overhear')) {
                    useCharge('overhear');
                    if (isSpellReady('overhype')) {
                        useCharge('overhype');
                    }
                }
            }

            let resourceTaken = actionObj.resource * calcTierMult(this.tier);

            if (actionObj.resourceToAdd > 0) {
                actionObj.resource -= resourceTaken;
                addResourceTo(data.actions[this.generatorTarget], actionObj.resourceToAdd);
            }

            views.scheduleUpdate('socializeResourceSent', intToString(actionObj.resourceToAdd, 2), "textContent")
            views.scheduleUpdate('socializeResourceTaken', intToString(resourceTaken, 2), "textContent")
        },
        updateMults: function () {
            this.updateUpgradeMult();
            let spellMult = 1;
            if (isSpellReady('overtalk')) {
                spellMult *= actionData.overtalk.spellPower();
                if (isSpellReady('overhear')) {
                    spellMult *= actionData.overhear.spellPower();
                    if (isSpellReady('overhype')) {
                        spellMult *= actionData.overhype.spellPower();
                    }
                }
            }

            let actionObj = data.actions.socialize;

            actionObj.progressGain = this.generatorSpeed * (actionObj.efficiency / 100);
            actionObj.actionPower = actionObj.actionPowerBase *
                actionObj.actionPowerMult;
            let resourceTaken = actionObj.resource * calcTierMult(this.tier);
            actionObj.resourceToAdd = this.actionPowerFunction(resourceTaken) * actionObj.actionPower * actionObj.upgradeMult * spellMult * (actionObj.efficiency / 100);
            actionObj.expToAddBase = actionObj.resourceToAdd;
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
            data.actions[this.generatorTarget].showResourceAdded = actionObj.resourceToAdd;
        },
        updateUpgradeMult: function () {
            let upgradeMult = 1;
            upgradeMult *= Math.pow(1.5, data.upgrades.haveBetterIceBreakers.upgradePower);
            upgradeMult *= Math.pow(1.5, data.upgrades.haveBetterConversations.upgradePower);
            data.actions.socialize.upgradeMult = upgradeMult;
        },
        onLevelAtts: [["confidence", 2]],
        expAtts: [["confidence", 1], ["influence", 1], ["comfort", 1]],
        efficiencyAtts: [["charm", 500], ["confidence", 500]],
        actionPowerFunction: function (resource) {
            if (resource < 1e12) {
                return 0;
            }
            return Math.pow(resource / 1e12, .5);
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
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 1, progressMaxIncrease: 1.5,
        expToLevelBase: 20, expToLevelIncrease: 1,
        efficiencyBase: .5, maxLevel: 50, showResourceAdded:true,
        unlockCost: .5, visible: false, unlocked: false, purchased: true, hasUpstream: false, keepParentAutomation:true,
        onLevelAtts: [["influence", 2]],
        expAtts: [["charm", 1]],
        efficiencyAtts: [["confidence", 20]],
        actionTriggers: [
            ["level_1", "reveal", "talkWithScott"],
            ["level_5", "reveal", "buySocialAccess"]
        ]
    },
    joinCoffeeClub: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 1e10, progressMaxIncrease: 1,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .0000001,
        unlockCost: 2e10, maxLevel: 1,
        visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["influence", 20]],
        expAtts: [],
        efficiencyAtts: [["influence", 1000]],
        actionTriggers: [
            ["unlock", "reveal", "buyCoffee"],
            ["level_1", "reveal", "gossipAroundCoffee"]
        ]
    },
    gossipAroundCoffee: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 1e22, progressMaxIncrease: 40,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .001,
        unlockCost: 4e10, maxLevel: 10,
        visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["charm", 10]],
        expAtts: [["influence", 1], ["confidence", 1]],
        efficiencyAtts: [["charm", 400], ["confidence", 400]],
        actionTriggers: [
            ["unlock", "reveal", "hearAboutTheLich"],
            ["level_3", "unlock", "hearAboutTheLich"]
        ]
    },
    hearAboutTheLich: {
        tier: 2, plane: 0, resourceName: "fear", creationVersion: 6,
        progressMaxBase: 300000, progressMaxIncrease: 2e4,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .01,
        unlockCost: 0, showResourceAdded:true,
        visible: false, unlocked: false, purchased: true, hasUpstream: false, keepParentAutomation:true,
        ignoreConsume:true,
        onLevelCustom: function () {
            if(data.actions.hearAboutTheLich.level <= 1) {
                data.ancientCoinMultKTL = 1;
            } else {
                data.ancientCoinMultKTL = Math.pow(1.5, (data.actions.hearAboutTheLich.level - 1));
            }
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
                actionObj.resourceToAdd = actionData.hearAboutTheLich.calcFearGain();
                actionObj.showResourceAdded = actionObj.resourceToAdd;
                actionObj.resource += actionObj.resourceToAdd;
            }
        },
        calcFearGain: function () {
            return Math.pow((data.totalMomentum + data.actions.overclock.resourceToAdd), .25) *
                Math.sqrt(data.actions.gossipAroundCoffee.resource) / 1e15;
        },
        onLevelAtts: [["integration", 20]],
        expAtts: [["resonance", 1], ["integration", 1], ["calm", 1]],
        efficiencyAtts: [["resonance", 500]],
        extraButton: Raw.html`
            <span class="button" id='killTheLichMenuButton2' onclick="openKTLMenu()"
                style="display:none;padding:8px 13px;position:absolute;top:350px;left:60px;border: 2px solid #aa0000;border-radius: 5px;
                background-color:#550000;text-shadow: 3px 3px 2px rgba(0, 0, 0, 0.8);color: #ffdddd;box-shadow:0 0 10px 6px rgba(255, 0, 0, 0.7);font-size:26px;" >
            Fight the Lich's Forces!</span>
        `,
        unlockMessage: {english: "Unlocks when Gossip Around Coffee is level 3."},
        extraInfo: {
            english: Raw.html`This action gains (Total Momentum)^0.25 * (Conversations on Gossip)^0.5 / 1e15 Fear 
        for each Overclock complete, which is a gain of
        <span style="font-weight:bold;" id="hearAboutTheLichActionPower2">0</span>. Fear is not consumed.`
        },
        actionTriggers: [
            ["info", "text", "Overclock additionally generates Fear on this action."],
            ["info", "text", "Every level past 1, Ancient Coins gained in Northern Wastes are increased x1.5."]
        ]
    },
    watchBirds: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 1e6, progressMaxIncrease: 1,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .5, maxLevel: 1,
        unlockCost: 800000, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["observation", 25]],
        expAtts: [["energy", 1]],
        efficiencyAtts: [["navigation", 200]],
        actionTriggers: [
            ["level_1", "reveal", "catchAScent"]
        ]
    },
    catchAScent: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 7e6, progressMaxIncrease: 1,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .5, maxLevel: 1,
        unlockCost: 3e6, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["observation", 25]],
        expAtts: [["energy", 1]],
        efficiencyAtts: [["navigation", 200]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "bodyAwareness", 3]
        ]
    },
    exploreDifficultPath: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 2e18, progressMaxIncrease: 50,
        expToLevelBase: 2, expToLevelIncrease: 4,
        efficiencyBase: .0001, maxLevel: 2,
        unlockCost: 3e13, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["navigation", 50]],
        expAtts: [["endurance", 1], ["might", 1]],
        efficiencyAtts: [["endurance", 450]],
        actionTriggers: [
            ["level_1", "reveal", "keepGoing"],
            ["level_1", "reveal", "eatGoldenFruit"],
        ]
    },
    eatGoldenFruit: {
        tier: 2, plane: 0, creationVersion: 6,
        progressMaxBase: 3e13, progressMaxIncrease: 1e8,
        expToLevelBase: 1, expToLevelIncrease: 10,
        efficiencyBase: 1, maxLevel: 1,
        unlockCost: 2e13, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["integration", 50]],
        expAtts: [],
        efficiencyAtts: []
    },
    keepGoing: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 1e18, progressMaxIncrease: 50,
        expToLevelBase: 2, expToLevelIncrease: 3,
        efficiencyBase: .0001, maxLevel: 2,
        unlockCost: 3e13, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["navigation", 50], ["endurance", 20]],
        expAtts: [["endurance", 1]],
        efficiencyAtts: [["endurance", 500]],
        actionTriggers: [
            ["unlock", "reveal", "climbTheRocks"]
        ]
    },
    climbTheRocks: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 4e14, progressMaxIncrease: 1.3,
        expToLevelBase: 2, expToLevelIncrease: 1,
        efficiencyBase: .0001, maxLevel: 25,
        unlockCost: 1e13, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["might", 10], ["concentration", 2]],
        expAtts: [["might", 1]],
        efficiencyAtts: [["endurance", 550]],
        actionTriggers: [
            ["level_15", "reveal", "spotAPath"]
        ]
    },
    spotAPath: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 3e20, progressMaxIncrease: 3,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .0001, maxLevel: 1,
        unlockCost: 3e13, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["navigation", 100], ["awareness", 25]],
        expAtts: [["might", 1], ["navigation", 1]],
        efficiencyAtts: [["energy", 500]],
        actionTriggers: [
            ["level_1", "reveal", "pleasantForest"]
        ]
    },
    pleasantForest: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 1e21, progressMaxIncrease: 5,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 10,
        unlockCost: 2e16, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["observation", 10]],
        expAtts: [["endurance", 1]],
        efficiencyAtts: [["navigation", 400]],
        actionTriggers: [
            ["unlock", "reveal", "hiddenPath"]
        ]
    },
    hiddenPath: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 2e21, progressMaxIncrease: 3,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 5,
        unlockCost: 2e16, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["concentration", 10]],
        expAtts: [["observation", 1], ["geared", 1]],
        efficiencyAtts: [["navigation", 500]],
        actionTriggers: [
            ["unlock", "reveal", "exploreTheForest"],
            ["level_2", "reveal", "meetGrumpyHermit"]
        ]
    },
    exploreTheForest: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 1e20, progressMaxIncrease: 3,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 10,
        unlockCost: 1e17, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["observation", 20]],
        expAtts: [["endurance", 1]],
        efficiencyAtts: [["navigation", 400]],
        actionTriggers: [
            ["level_4", "reveal", "travelAlongTheRiver"]
        ]
    },
    travelAlongTheRiver: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 1e21, progressMaxIncrease: 5,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 10,
        unlockCost: 2e17, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["endurance", 10], ["concentration", 5]],
        expAtts: [["might", 1], ["control", 1]],
        efficiencyAtts: [["navigation", 450]]
    },
    meetGrumpyHermit: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 4e23, progressMaxIncrease: 400,
        expToLevelBase: 1, expToLevelIncrease: 2,
        efficiencyBase: .0001, maxLevel: 1,
        unlockCost: 1e17, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["awareness", 25]],
        expAtts: [["observation", 1]],
        efficiencyAtts: [["confidence", 10]],
        actionTriggers: [
            ["unlock", "reveal", "socialize"],
            ["level_1", "reveal", "annoyHermitIntoAQuest"],
            ["level_2", "reveal", "talkToHermit"],
        ]
    },
    annoyHermitIntoAQuest: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 1e23, progressMaxIncrease: 1,
        expToLevelBase: 100, expToLevelIncrease: 1,
        efficiencyBase: .001, maxLevel: 1,
        unlockCost: 2e17, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["awareness", 25]],
        expAtts: [["observation", 1]],
        efficiencyAtts: [["energy", 600]],
        actionTriggers: [
            ["level_1", "reveal", "gatherRiverWeeds"]
        ]
    },
    gatherRiverWeeds: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 1e28, progressMaxIncrease: 1.5,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 10,
        unlockCost: 4e17, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["might", 10], ["concentration", 5]],
        expAtts: [["endurance", 1], ["concentration", 1]],
        efficiencyAtts: [["navigation", 450]],
        actionTriggers: [
            ["level_10", "reveal", "presentTheOffering"]
        ]
    },
    presentTheOffering: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 2e18, progressMaxIncrease: 1.1,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 100,
        unlockCost: 4e18, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["control", 1]],
        expAtts: [["control", 1]],
        efficiencyAtts: [["confidence", 200]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "meetGrumpyHermit", 1]
        ]
    },
    talkToHermit: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 3e24, progressMaxIncrease: 1,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .0001, maxLevel: 1,
        unlockCost: 1e20, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["awareness", 25], ["navigation", 100]],
        expAtts: [["charm", 1], ["control", 1]],
        efficiencyAtts: [["charm", 200]],
        actionTriggers: [
            ["unlock", "reveal", "chatWithHermit"],
            ["level_1", "reveal", "inquireAboutMagic"]
        ]
    },
    inquireAboutMagic: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 5e25, progressMaxIncrease: 40,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 4,
        unlockCost: 5e23, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
            statAddAmount("legacy", 1);
            unveilPlane(0);
            unveilPlane(1);
            data.actions.echoKindle.unlocked = true;
            views.updateVal("legacyDisplay", "", "style.display");
        },
        onLevelAtts: [["integration", 25]],
        expAtts: [["pulse", 1], ["charm", 1]],
        efficiencyAtts: [],
        actionTriggers: [
            ["info", "text", "On Unlock: Open Magic Tab"],
            ["info", "text", "On Unlock: Gain 1 Legacy"],
            ["unlock", "reveal", "echoKindle"],
            ["unlock", "reveal", "resonanceFurnace"],
            ["level_1", "reveal", "learnToStayStill"],
            ["level_2", "reveal", "feelTheResonance"],
            ["level_3", "reveal", "layerTheEchoes"],
            ["level_4", "reveal", "igniteTheSpark"],
        ]
    },
    talkWithScott: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 5, progressMaxIncrease: 100,
        expToLevelBase: 20, expToLevelIncrease: 1,
        efficiencyBase: .2, maxLevel: 2,
        unlockCost: 1, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["savvy", 20], ["charm", 1]],
        expAtts: [["confidence", 1]],
        efficiencyAtts: [["confidence", 30]],
        actionTriggers: [
            ["unlock", "reveal", "handyman"],
            ["level_1", "reveal", "learnToListen"],
            ["level_2", "reveal", "tavernHelper"],
        ]
    },
    talkWithJohn: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 2e5, progressMaxIncrease: 40,
        expToLevelBase: 50, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 3,
        unlockCost: 4e6, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["savvy", 20], ["confidence", 5]],
        expAtts: [["confidence", 1]],
        efficiencyAtts: [["confidence", 275]],
        actionTriggers: [
            ["level_1", "reveal", "guildReceptionist"],
            ["level_3", "reveal", "messenger"],
        ]
    },
    learnToListen: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 1000000, progressMaxIncrease: 100,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .3, maxLevel: 10,
        unlockCost: 200, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["charm", 5]],
        expAtts: [["influence", 1], ["confidence", 1]],
        efficiencyAtts: [["confidence", 300]],
        actionTriggers: [
            ["unlock", "reveal", "chatWithMerchants"],
            ["level_10", "reveal", "learnToQuestion"],
        ]
    },
    chatWithMerchants: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 1e10, progressMaxIncrease: 30,
        expToLevelBase: 20, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 3,
        unlockCost: 500, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["leverage", 20], ["influence", 10]],
        expAtts: [["observation", 1]],
        efficiencyAtts: [["confidence", 100]],
        actionTriggers: [
            ["unlock", "reveal", "browseStores"],
            ["level_1", "reveal", "complimentTheChef"],
            ["level_2", "reveal", "askAboutStitching"],
            ["level_3", "reveal", "listenToWoes"]
        ]
    },
    complimentTheChef: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 200, progressMaxIncrease: 40,
        expToLevelBase: 20, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 2,
        unlockCost: 2000, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["charm", 10], ["savvy", 20]],
        expAtts: [],
        efficiencyAtts: [["confidence", 110]],
        actionTriggers: [
            ["level_1", "reveal", "buyStreetFood"],
            ["level_2", "reveal", "buyGoodFood"],
        ]
    },
    askAboutStitching: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 1000, progressMaxIncrease: 40,
        expToLevelBase: 20, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 2,
        unlockCost: 10000, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["charm", 10], ["control", 15]],
        expAtts: [],
        efficiencyAtts: [["confidence", 120]],
        actionTriggers: [
            ["level_1", "reveal", "buyMatchingClothes"],
            ["level_1", "reveal", "buyStylishClothes"],
        ]
    },
    listenToWoes: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 4e4, progressMaxIncrease: 5,
        expToLevelBase: 20, expToLevelIncrease: 1,
        efficiencyBase: .05, maxLevel: 3,
        unlockCost: 400000, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["charm", 11], ["confidence", 10]],
        expAtts: [],
        efficiencyAtts: [["confidence", 175]],
        actionTriggers: [
            ["unlock", "reveal", "keyToTheBackroom"],
            ["level_2", "reveal", "talkWithJohn"]
        ]
    },
    keyToTheBackroom: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 200000, progressMaxIncrease: 1,
        expToLevelBase: 20, expToLevelIncrease: 1,
        efficiencyBase: .05, maxLevel: 1,
        unlockCost: 1000000, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [],
        expAtts: [],
        efficiencyAtts: [["confidence", 200]],
        actionTriggers: [
            ["level_1", "reveal", "browseBackrooms"],
            ["level_1", "reveal", "joinCoffeeClub"],
            ["level_1", "reveal", "slideTheCoin"]
        ]
    },
    chatWithHermit: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 1e6, progressMaxIncrease: 5,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .05, maxLevel: 10,
        unlockCost: 5e5, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["charm", 5], ["control", 5]],
        expAtts: [["charm", 1]],
        efficiencyAtts: [["confidence", 225]],
        actionTriggers: [
            ["level_1", "reveal", "tellAJoke"]
        ]
    },
    tellAJoke: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 5e6, progressMaxIncrease: 2,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .05, maxLevel: 10,
        unlockCost: 5e5, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["charm", 5]],
        expAtts: [["confidence", 1]],
        efficiencyAtts: [["confidence", 250]]
    },
    discussLifeWithHermit: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 2e15, progressMaxIncrease: 8,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .03, maxLevel: 1,
        unlockCost: 5e12, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["influence", 10], ["charm", 5]],
        expAtts: [["confidence", 1]],
        efficiencyAtts: [["confidence", 400]],
        actionTriggers: [
            ["level_1", "reveal", "discussMagicWithHermit"],
        ]
    },
    discussMagicWithHermit: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 2e16, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .03, maxLevel: 5,
        unlockCost: 5e13, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["navigation", 20], ["integration", 10]],
        expAtts: [["confidence", 1]],
        efficiencyAtts: [["confidence", 400]]
    },
    learnToQuestion: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 3e20, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .001, maxLevel: 20,
        unlockCost: 1e15, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["confidence", 4], ["charm", 4], ["awareness", 2]],
        expAtts: [["charm", 1], ["resonance", 1]],
        efficiencyAtts: [["charm", 600]],
        actionTriggers: [
            ["level_1", "reveal", "trackMarketMovement"],
            ["level_7", "reveal", "negotiate"],
            ["level_9", "reveal", "learnToConnect"]
        ]
    },
    trackMarketMovement: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 3e20, progressMaxIncrease: 4,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .00001, maxLevel: 20,
        unlockCost: 5e17, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["savvy", 2], ["observation", 2]],
        expAtts: [["charm", 1]],
        efficiencyAtts: [["influence", 1100]],
        actionTriggers: [
            ["level_5", "reveal", "catalogueGoods"]
        ]
    },
    catalogueGoods: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 3e22, progressMaxIncrease: 4,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .00001, maxLevel: 20,
        unlockCost: 5e18, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["leverage", 3], ["concentration", 1]],
        expAtts: [["charm", 1]],
        efficiencyAtts: [["influence", 1200]],
        actionTriggers: [
        ]
    },
    negotiate: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 3e28, progressMaxIncrease: 4,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .00001, maxLevel: 20,
        unlockCost: 5e24, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["savvy", 3], ["observation", 3]],
        expAtts: [["charm", 1]],
        efficiencyAtts: [["influence", 1300]],
        actionTriggers: [
            ["level_5", "reveal", "lowerCounteroffer"]
        ]
    },
    lowerCounteroffer: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 3e30, progressMaxIncrease: 4,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .00001, maxLevel: 20,
        unlockCost: 5e26, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["leverage", 4], ["concentration", 2]],
        expAtts: [["charm", 1]],
        efficiencyAtts: [["influence", 1400]],
        actionTriggers: [
        ]
    },
    learnToConnect: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 3e37, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .00001, maxLevel: 20,
        unlockCost: 1e32, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["integration", 3]],
        expAtts: [["charm", 1], ["resonance", 1]],
        efficiencyAtts: [["influence", 1500]],
        actionTriggers: [
            ["level_2", "reveal", "askAboutGoals"],
            ["level_4", "reveal", "askAboutRelationships"]
        ]
    },
    askAboutGoals: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 3e37, progressMaxIncrease: 5,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .00001, maxLevel: 20,
        unlockCost: 1e31, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["vision", 5]],
        expAtts: [["charm", 1]],
        efficiencyAtts: [["influence", 1550]],
        actionTriggers: [
            ["level_4", "reveal", "talkAboutPassions"],
            ["level_6", "reveal", "talkAboutFears"],
        ]
    },
    talkAboutPassions: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 3e39, progressMaxIncrease: 6,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .00001, maxLevel: 20,
        unlockCost: 1e33, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["wizardry", 5], ["ambition", 5]],
        expAtts: [["charm", 1]],
        efficiencyAtts: [["influence", 1600]],
        actionTriggers: [
        ]
    },
    talkAboutFears: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 3e40, progressMaxIncrease: 6,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .00001, maxLevel: 20,
        unlockCost: 1e34, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["valor", 5]],
        expAtts: [["charm", 1]],
        efficiencyAtts: [["influence", 1650]],
        actionTriggers: [
        ]
    },
    askAboutRelationships: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 3e40, progressMaxIncrease: 5,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .00001, maxLevel: 20,
        unlockCost: 2e34, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["confidence", 5], ["leverage", 5]],
        expAtts: [["charm", 1]],
        efficiencyAtts: [["influence", 1600]],
        actionTriggers: [
            ["level_3", "reveal", "talkToTheRecruiters"],
            ["level_4", "reveal", "learnOfSecretMeeting"]
        ]
    },
    talkToTheRecruiters: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 3e43, progressMaxIncrease: 4,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .00001, maxLevel: 20,
        unlockCost: 2e37, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["ambition", 5], ["influence", 5]],
        expAtts: [["charm", 1]],
        efficiencyAtts: [["influence", 1700]],
        actionTriggers: [
            ["level_1", "reveal", "worksiteSweeper"],
            ["level_4", "reveal", "buyPointyHat"],
        ]
    },
    learnOfSecretMeeting: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 3e45, progressMaxIncrease: 100,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .00001, maxLevel: 5,
        unlockCost: 2e39, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["ambition", 20], ["archmagery", 10]],
        expAtts: [["charm", 1]],
        efficiencyAtts: [["influence", 1800], ["archmagery", 600]],
        actionTriggers: [
            ["level_1", "reveal", "getTestedForKnowledge"]
        ]
    },
    getTestedForKnowledge: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 3e75, progressMaxIncrease: 1e5,
        expToLevelBase: 6, expToLevelIncrease: 1,
        efficiencyBase: .00001, maxLevel: 4,
        unlockCost: 2e41, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["influence", 25], ["integration", 10]],
        expAtts: [["control", 1], ["amplification", 1], ["wizardry", 1], ["archmagery", 1], ["spellcraft", 1]],
        efficiencyAtts: [["influence", 1000]],
        actionTriggers: [
            ["level_4", "reveal", "joinWizardSociety"]
        ]
    },
    joinWizardSociety: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 3e60, progressMaxIncrease: 4,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .00001, maxLevel: 20,
        unlockCost: 2e50, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["confidence", 5], ["wizardry", 5]],
        expAtts: [["charm", 1]],
        efficiencyAtts: [["confidence", 1000]],
        actionTriggers: [
            ["level_1", "reveal", "misuseATerm"],
            ["level_4", "reveal", "showOffSpells"],
            ["level_7", "reveal", "askAboutHistory"],
        ]
    },
    misuseATerm: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 3e21, progressMaxIncrease: 100,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .001, maxLevel: 10,
        unlockCost: 1e99, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["wizardry", 10]],
        expAtts: [],
        efficiencyAtts: [["confidence", 1000]],
        actionTriggers: [
            ["level_1", "reveal", "eavesdropOnArguments"]
        ]
    },
    eavesdropOnArguments: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 3e21, progressMaxIncrease: 100,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .001, maxLevel: 10,
        unlockCost: 1e16, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["wizardry", 10]],
        expAtts: [],
        efficiencyAtts: [["confidence", 1000]],
        actionTriggers: [
        ]
    },
    showOffSpells: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 3e21, progressMaxIncrease: 100,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .001, maxLevel: 10,
        unlockCost: 1e99, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["spellcraft", 10]],
        expAtts: [],
        efficiencyAtts: [["confidence", 1000]],
        actionTriggers: [
            ["level_1", "reveal", "hearCriticisms"]
        ]
    },
    hearCriticisms: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 3e21, progressMaxIncrease: 100,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .001, maxLevel: 10,
        unlockCost: 1e16, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["spellcraft", 10]],
        expAtts: [],
        efficiencyAtts: [["confidence", 1000]],
        actionTriggers: [
            ["level_1", "reveal", "practiceGestures"]
        ]
    },
    askAboutHistory: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 3e21, progressMaxIncrease: 100,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .05, maxLevel: 10,
        unlockCost: 1e99, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["savvy", 10], ["archmagery", 2]],
        expAtts: [],
        efficiencyAtts: [["confidence", 1000]],
        actionTriggers: [
            ["level_1", "reveal", "learnOfFamousMages"]
        ]
    },
    learnOfFamousMages: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 3e21, progressMaxIncrease: 100,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .001, maxLevel: 10,
        unlockCost: 1e16, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["savvy", 10], ["archmagery", 2]],
        expAtts: [],
        efficiencyAtts: [["confidence", 1000]],
        actionTriggers: [
            ["level_1", "reveal", "practiceTargeting"],
            ["level_8", "reveal", "learnFromLegends"]
        ]
    },
    learnFromLegends: { //increase max levels of legends
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 3e21, progressMaxIncrease: 100,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .001,
        unlockCost: 1e16, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["integration", 10]],
        expAtts: [],
        efficiencyAtts: [["confidence", 1000]],
        actionTriggers: [
            ["level_5", "reveal", "talkToArcanistBalthazar"],
            ["level_10", "reveal", "talkToKeeperSimeon"],
            ["level_15", "reveal", "talkToWovenElara"],
        ]
    },
    talkToArcanistBalthazar: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 3e21, progressMaxIncrease: 100,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .001,
        unlockCost: 1e16, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["wizardry", 10]],
        expAtts: [["charm", 1]],
        efficiencyAtts: [["confidence", 1000]],
        actionTriggers: [
        ]
    },
    talkToKeeperSimeon: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 3e21, progressMaxIncrease: 100,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .001,
        unlockCost: 1e16, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["spellcraft", 10]],
        expAtts: [["charm", 1]],
        efficiencyAtts: [["confidence", 1000]],
        actionTriggers: [
            ["level_10", "reveal", "practiceVisualizations"]
        ]
    },
    talkToWovenElara: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 6,
        progressMaxBase: 3e21, progressMaxIncrease: 100,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .001,
        unlockCost: 1e16, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["archmagery", 10]],
        expAtts: [["charm", 1]],
        efficiencyAtts: [["confidence", 1000]],
        actionTriggers: [
            ["level_10", "reveal", "practiceLayering"]
        ]
    },


    learnToStayStill: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 1e24, progressMaxIncrease: 1,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 1,
        unlockCost: 1e24, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["legacy", 1], ["control", 5]],
        expAtts: [["pulse", 1]],
        efficiencyAtts: [],
        actionTriggers: [
            ["unlock", "reveal", "meditate"],
            ["unlock", "reveal", "journal"]
        ]
    },
    feelTheResonance: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 6e25, progressMaxIncrease: 1,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 1,
        unlockCost: 3e25, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["legacy", 1], ["control", 5]],
        expAtts: [["pulse", 1]],
        efficiencyAtts: []
    },
    layerTheEchoes: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 8e27, progressMaxIncrease: 1,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 1,
        unlockCost: 2e27, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["legacy", 2], ["control", 5]],
        expAtts: [["pulse", 1]],
        efficiencyAtts: []
    },
    igniteTheSpark: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 1e29, progressMaxIncrease: 1,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 1,
        unlockCost: 1e28, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["legacy", 2], ["control", 5]],
        expAtts: [["pulse", 1]],
        efficiencyAtts: [],
        actionTriggers: [
            ["level_1", "reveal", "pesterHermitForSecrets"]
        ]
    },
    pesterHermitForSecrets: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 3e31, progressMaxIncrease: 100,
        expToLevelBase: 1, expToLevelIncrease: 2,
        efficiencyBase: .001, maxLevel: 3,
        unlockCost: 1e28, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["observation", 20]],
        expAtts: [["charm", 1]],
        efficiencyAtts: [["charm", 400]],
        actionTriggers: [
            ["unlock", "reveal", "restAtWaterfall"],
            ["unlock", "reveal", "discussLifeWithHermit"],
            ["level_1", "reveal", "visitShrineBehindWaterfall"],
            ["level_2", "reveal", "travelToCrossroads"],
            ["level_3", "reveal", "forgottenShrine"],
            ["level", "addMaxLevels", "discussLifeWithHermit", 2],
        ]
    },
    restAtWaterfall: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 2e27, progressMaxIncrease: 3,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .001, maxLevel: 2,
        unlockCost: 1e28, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["awareness", 25]],
        expAtts: [],
        efficiencyAtts: [["navigation", 500]]
    },
    visitShrineBehindWaterfall: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 2e28, progressMaxIncrease: 1,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .001, maxLevel: 1,
        unlockCost: 1e29, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["legacy", 5]],
        expAtts: [],
        efficiencyAtts: [["navigation", 500]],
    },
    forgottenShrine: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 2e32, progressMaxIncrease: 1,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 1,
        unlockCost: 2e32, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["legacy", 13]],
        expAtts: [["resonance", 1]],
        efficiencyAtts: [["navigation", 600]],
        actionTriggers: [
            ["level_1", "reveal", "clearTheLeaves"]
        ]
    },
    clearTheLeaves: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 2e46, progressMaxIncrease: 1,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 25,
        unlockCost: 4e33, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["integration", 1]],
        expAtts: [["might", 1], ["endurance", 1]],
        efficiencyAtts: [["navigation", 600]],
        actionTriggers: [
            ["level_5", "reveal", "humOldTune"]
        ]
    },
    humOldTune: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 1e35, progressMaxIncrease: 10,
        expToLevelBase: 1, expToLevelIncrease: 10,
        efficiencyBase: .01, maxLevel: 2,
        unlockCost: 2e34, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["legacy", 100], ["pulse", 20]],
        expAtts: [["resonance", 1]],
        efficiencyAtts: [["navigation", 600]]
    },
    travelToCrossroads: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 1e38, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .005, maxLevel: 10,
        unlockCost: 3e30, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["observation", 20]],
        expAtts: [["endurance", 1]],
        efficiencyAtts: [["navigation", 600]],
        actionTriggers: [
            ["level_1", "reveal", "feelAGentleTug"]
        ]
    },
}

//Meditate
actionData = {
    ...actionData,

    standStraighter: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 1e80, progressMaxIncrease: 200,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .0001, maxLevel: 1,
        unlockCost: 1e51, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["awareness", 5], ["control", 5], ["impedance", -1]],
        expAtts: [["concentration", 1], ["endurance", 1], ["confidence", 1]],
        efficiencyAtts:[["energy", 1700]],
        actionTriggers: [
            ["level_8", "reveal", "walkAware"]
        ]
    },
    walkAware: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 1e95, progressMaxIncrease: 20,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .0001, maxLevel: 10,
        unlockCost: 1e61, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["awareness", 10], ["observation", 10]],
        expAtts: [["concentration", 1], ["endurance", 1], ["control", 1]],
        efficiencyAtts: [["energy", 1800]],
        actionTriggers: [
        ]
    },
    projectConfidence: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 1e56, progressMaxIncrease: 20,
        expToLevelBase: 10, expToLevelIncrease: 2,
        efficiencyBase: .001, maxLevel: 5,
        unlockCost: 1e42, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["awareness", 10], ["influence", 10], ["charm", 10]],
        expAtts: [["control", 1], ["concentration", 1]],
        efficiencyAtts: [["energy", 2000]],
        actionTriggers: [
            ["level_4", "reveal", "walkAware"]
        ]
    },
    mirrorPosture: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 1e60, progressMaxIncrease: 20,
        expToLevelBase: 10, expToLevelIncrease: 2,
        efficiencyBase: .001, maxLevel: 5,
        unlockCost: 1e46, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["awareness", 20], ["influence", 10]],
        expAtts: [["control", 1], ["concentration", 1]],
        efficiencyAtts: [["energy", 2000]]
    },
}


//Training / Notice board level 2 / shortcut pt2
actionData = {
    ...actionData,

    reportForTraining: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 1e11, progressMaxIncrease: 1.5,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .00001, maxLevel: 10,
        unlockCost: 2e8, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["endurance", 5], ["concentration", 5]],
        expAtts: [["concentration", 1], ["energy", 1]],
        efficiencyAtts: [["concentration", 350]],
        actionTriggers: [
            ["level_5", "reveal", "basicTrainingWithJohn"]
        ]
    },
    basicTrainingWithJohn: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 1e12, progressMaxIncrease: 8,
        expToLevelBase: 3, expToLevelIncrease: 1,
        efficiencyBase: .001, maxLevel: 5,
        unlockCost: 3e8, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["might", 20]],
        expAtts: [["endurance", 1], ["concentration", 1]],
        efficiencyAtts: [["awareness", 350]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "bodyAwareness", 4],
            ["unlock", "reveal", "noticeTheStrain"],
            ["level_1", "reveal", "clenchTheJaw"],
            ["level_2", "reveal", "breatheThroughIt"],
            ["level_3", "reveal", "ownTheWeight"],
            ["level_4", "reveal", "moveWithPurpose"]
        ]
    },
    noticeTheStrain: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 1e7, progressMaxIncrease: 40,
        expToLevelBase: 3, expToLevelIncrease: 1,
        efficiencyBase: .001, maxLevel: 3,
        unlockCost: 2e7, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["awareness", 20]],
        expAtts: [["endurance", 1], ["might", 1]],
        efficiencyAtts: [["endurance", 100]]
    },
    clenchTheJaw: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 2e10, progressMaxIncrease: 2,
        expToLevelBase: 3, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 2,
        unlockCost: 4e7, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["endurance", 25]],
        expAtts: [["energy", 1]],
        efficiencyAtts: [["might", 40]]
    },
    breatheThroughIt: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 5e10, progressMaxIncrease: 5,
        expToLevelBase: 3, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 2,
        unlockCost: 6e7, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["awareness", 20], ["observation", 10]],
        expAtts: [["endurance", 1], ["might", 1]],
        efficiencyAtts: [["might", 150], ["endurance", 100]]
    },
    ownTheWeight: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 2e9, progressMaxIncrease: 8,
        expToLevelBase: 3, expToLevelIncrease: 1,
        efficiencyBase: .0001, maxLevel: 2,
        unlockCost: 8e7, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["might", 50], ["endurance", 25]],
        expAtts: [["endurance", 1]],
        efficiencyAtts: [["awareness", 400]]
    },
    moveWithPurpose: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 2e17, progressMaxIncrease: 500,
        expToLevelBase: 3, expToLevelIncrease: 3,
        efficiencyBase: .001, maxLevel: 2,
        unlockCost: 10e7, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["endurance", 50], ["awareness", 25]],
        expAtts: [["endurance", 1], ["might", 1], ["energy", 1]],
        efficiencyAtts: [["awareness", 400]]
    },
}


//Jobs 1
actionData = {
    ...actionData,

    guildReceptionist: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 1e21, progressMaxIncrease: 3,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .001, maxLevel: 8,
        wage: 1e5,
        unlockCost: 1e20, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["savvy", 5]],
        expAtts: [],
        efficiencyAtts: [["savvy", 600]],
    },
    messenger: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 1e23, progressMaxIncrease: 4,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .001, maxLevel: 8,
        wage: 1e6,
        unlockCost: 1e22, visible: false, unlocked: false, purchased: true,
        onLevelAtts: [["savvy", 5]],
        expAtts: [],
        efficiencyAtts: [["savvy", 700]],
    },
    townCrier: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 1e43, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .001, maxLevel: 8,
        wage: 25e6,
        unlockCost: 1e41, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["savvy", 5]],
        expAtts: [],
        efficiencyAtts: [["savvy", 900]],
    },
    storyTeller: {
        tier: 1, plane: 0, creationVersion: 6,
        progressMaxBase: 1e55, progressMaxIncrease: 12,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .001, maxLevel: 8,
        wage: 500e6,
        unlockCost: 1e52, visible: false, unlocked: false, purchased: false,
        onLevelAtts: [["savvy", 5]],
        expAtts: [],
        efficiencyAtts: [["savvy", 1100]],
    },
    worksiteSweeper: {
        tier: 1, plane: 0, creationVersion: 6,
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
        tier: 1, plane: 0, creationVersion: 6,
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
        tier: 1, plane: 0, creationVersion: 6,
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
        tier: 1, plane: 0, creationVersion: 6,
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
        tier: 1, plane: 0, creationVersion: 6, title:"Tidy Magesmith's Shop",
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
        tier: 1, plane: 0, creationVersion: 6,
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
        tier: 1, plane: 0, creationVersion: 6,
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
        tier: 1, plane: 0, creationVersion: 6,
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
        tier: 1, plane: 0, creationVersion: 6,
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
