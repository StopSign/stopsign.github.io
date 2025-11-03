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
        onUnlock: function () {
        },
        onLevelCustom: function () {
            if (data.actions.reflect.level >= 1) {
                unveilAction('distillInsight')
            }
            if (data.actions.reflect.level >= 2) {
                unveilAction('harnessOverflow')
            }
            if (data.actions.reflect.level >= 4) {
                unveilAction('takeNotes')
            }
            if (data.actions.reflect.level >= 6) {
                unveilAction('bodyAwareness')
            }
        },
        onLevelAtts: [["awareness", 10]],
        expAtts: [["concentration", 1], ["curiosity", 1]],
        efficiencyAtts: [["cycle", 1]],
        iconText: {
            english: Raw.html`
Level 1: Reveal Distill Insight<br>
Level 2: Reveal Harness Overflow<br>
Level 4: Reveal Take Notes<br>
Level 6: Reveal Body Awareness`
        }
    },
    distillInsight: {
        tier: 1, plane: 0,
        progressMaxBase: 1, progressMaxIncrease: 2,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .4, maxLevel: 10,
        unlockCost: 20, visible: false, unlocked: false, purchased: true,
        onLevelCustom: function () {
        },
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
        onLevelCustom: function () {
        },
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
        onLevelCustom: function () {
        },
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
        onUnlock: function () {
        },
        onLevelCustom: function () {
            unveilAction('travelOnRoad')
            unveilAction('travelToOutpost')
            unveilAction('meetVillageLeaderScott')
        },
        onLevelAtts: [["awareness", 100]],
        expAtts: [["curiosity", 1], ["concentration", 1], ["energy", 1], ["endurance", 1]],
        efficiencyAtts: [["coordination", .5]],
        iconText: {
            english: Raw.html`
Level 1: Reveal Travel On Road<br>
Level 1: Reveal Travel To Outpost<br>
Level 1: Reveal Meet Village Leader Scott`
        }
    },
    remember: {
        tier: 1, plane: 0,
        progressMaxBase: 20000, progressMaxIncrease: 5,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .2, maxLevel: 3,
        unlockCost: 4000, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
            addMaxLevel("bodyAwareness", 1);
        },
        onLevelCustom: function () {
            addMaxLevel("harnessOverflow", 3);
        },
        onLevelAtts: [["concentration", 10]],
        expAtts: [["awareness", 1], ["observation", 1]], //~/50 from awareness when unlocked
        efficiencyAtts: [["cycle", 1]],
        unlockMessage: {english: "On unlock, +1 max level for Body Awareness."},
        iconText: {
            english: Raw.html`
On Unlock: +1 max level for Body Awareness<br>
On Level: +3 max levels for Harness Overflow`
        }
    },
    travelOnRoad: {
        tier: 1, plane: 0,
        progressMaxBase: 1000, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .5, maxLevel: 10,
        unlockCost: 2000, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
            addMaxLevel("bodyAwareness", 1);
        },
        onLevelCustom: function () {
        },
        onLevelAtts: [["energy", 5]],
        expAtts: [["concentration", 1], ["endurance", 1], ["geared", 1]],
        efficiencyAtts: [["navigation", 1]],
        unlockMessage: {english: "On unlock, +1 max level for Body Awareness."},
        iconText: {
            english: Raw.html`
On Unlock: +1 max level for Body Awareness`
        }
    },
    travelToOutpost: {
        tier: 1, plane: 0,
        progressMaxBase: 10000, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .25, maxLevel: 10,
        unlockCost: 3000, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
            unveilAction('remember');
        },
        onLevelAtts: [["energy", 30]],
        expAtts: [["endurance", 1], ["geared", 1]],
        efficiencyAtts: [["navigation", 1]],
        unlockMessage: {english: "On unlock, reveal a new action."},
        iconText: {
            english: Raw.html`
On Unlock: Reveal Remember`
        }
    },
    meetVillageLeaderScott: {
        tier: 1, plane: 0,
        progressMaxBase: 40000, progressMaxIncrease: 40,
        expToLevelBase: 5, expToLevelIncrease: 2,
        efficiencyBase: .5, maxLevel: 3,
        unlockCost: 40000, visible: false, unlocked: false, purchased: true,
        onLevelCustom: function () {
            addMaxLevel("remember", 2);
            if (data.actions.meetVillageLeaderScott.level >= 1) {
                unveilAction('watchBirds')
            }
            if (data.actions.meetVillageLeaderScott.level >= 2) {
                unveilAction('helpScottWithChores')
            }
            if (data.actions.meetVillageLeaderScott.level >= 3) {
                unveilAction('checkNoticeBoard')
            }
        },
        onUnlock: function () {
            addMaxLevel("remember", 1);
        },
        onLevelAtts: [],
        expAtts: [["curiosity", 1], ["observation", 1]],
        efficiencyAtts: [["observation", 1]],
        unlockMessage: {english: "On unlock, +1 max level for Remember."},
        iconText: {
            english: Raw.html`
On Unlock: +1 max level for Remember<br>
On Level: +2 max levels for Remember<br>
Level 1: Reveal Watch Birds<br>
Level 2: Reveal Help Scott With Chores<br>
Level 3: Reveal Check Notice Board`
        }
    },
    helpScottWithChores: {
        tier: 1, plane: 0,
        progressMaxBase: 6000000, progressMaxIncrease: 2,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .2, maxLevel: 4,
        wage: 1,
        unlockCost: 500000, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
            unveilAction('makeMoney')
            data.displayJob = true;
            document.getElementById("jobDisplay").style.display = "";
        },
        onLevelCustom: function () {
            data.actions.helpScottWithChores.wage += actionData.helpScottWithChores.wage / 2;
            changeJob("helpScottWithChores")
        },
        onLevelAtts: [["recognition", 10]],
        expAtts: [["ambition", 1]],
        efficiencyAtts: [["energy", 1]],
        iconText: {
            english: Raw.html`
        Base Wage: $1<br>
        On Unlock: Reveal Make Money and Job Display<br>
        On Level: Increase wage +50%
`
        }
    },
    browseLocalMarket: {
        tier: 1, plane: 0,
        progressMaxBase: 7e7, progressMaxIncrease: 2,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .3, maxLevel: 10,
        unlockCost: 1e8, visible: false, unlocked: false, purchased: true,
        onLevelCustom: function () {
            unveilAction('buyBasicSupplies')
            unveilAction('buyBasicClothes')
            unveilAction('buyMarketItems')
            unveilAction('buyShopItems')
        },
        onLevelAtts: [["savvy", 5], ["observation", 50]],
        expAtts: [["observation", 1], ["recognition", 1]],
        efficiencyAtts: [["ambition", 1]],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Buy Basic Supplies<br>
        Level 1: Reveal Buy Basic Clothes<br>
        Level 1: Reveal Buy Market Items<br>
        Level 1: Reveal Buy Shop Items
`
        }
    },
    browseStores: {
        tier: 1, plane: 0,
        progressMaxBase: 1e19, progressMaxIncrease: 3,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 10,
        unlockCost: 100e15, visible: false, unlocked: false, purchased: true,
        onLevelCustom: function () {
        },
        onUnlock: function () {
        },
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
        onLevelCustom: function () {
        },
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
        onLevelCustom: function () {
        },
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
        onLevelCustom: function () {
            if (data.actions.checkNoticeBoard.level >= 1) {
                unveilAction('browseLocalMarket');
            }
            if (data.actions.checkNoticeBoard.level >= 2) {
                unveilAction('reportForTraining')
            }
            if (data.actions.checkNoticeBoard.level >= 3) {
                unveilAction('reportForLabor')
                unveilAction('oddJobsLaborer')
                unveilAction('chimneySweep');
            }
        },
        onLevelAtts: [],
        expAtts: [["observation", 1]],
        efficiencyAtts: [["observation", 1], ["savvy", 1], ["vision", .1]],
        onLevelText: {english: "Unlocks new actions with each level."},
        iconText: {
            english: Raw.html`
        Level 1: Reveal Browse Local Market<br>
        Level 2: Reveal Report For Training<br>
        Level 3: Reveal Report For Labor<br>
        Level 3: Reveal Odd Jobs Laborer<br>
        Level 3: Reveal Chimney Sweep
`
        }
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
        onUnlock: function () {
            unveilAction('spendMoney');
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
                        Exp & Gold gain = (Momentum Taken)^.5 * Action Power * Efficiency * Wages.`
        },
        iconText: {
            english: Raw.html`
        Generates Gold using Momentum<br>
        On Unlock: Reveal Spend Money
`
        }
    },
    spendMoney: {
        tier: 2, plane: 0, resourceName: "gold",
        progressMaxBase: .5, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .5, maxLevel: 10,
        unlockCost: 50, visible: false, unlocked: false, purchased: true, hasUpstream: false,
        onUnlock: function () {
        },
        onLevelCustom: function () {
        },
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
        tier: 2, plane: 0, resourceName: "gold",
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
        onUnlock: function () {
            unveilAction('invest');
        },
        onLevelAtts: [["energy", 10000], ["geared", 1000], ["recognition", 80]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["ambition", 1]],
        iconText: {
            english: Raw.html`
        On Unlock: Reveal Invest
`
        }
    },
    buySocialAccess: {
        tier: 2, plane: 0, resourceName: "gold",
        progressMaxBase: 5e11, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .2, maxLevel: 10,
        unlockCost: 2e12, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
        },
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
        onUnlock: function () {
        },
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
        onLevelCustom: function () {
            if (data.actions.buyStylishClothes.level >= 10) {
                unveilAction('buyComfyShoes');
                unveilAction('buyTravelersGear');
            }
        },
        onLevelAtts: [["recognition", 2000], ["confidence", 10], ["discernment", 10]],
        expAtts: [["savvy", 1]],
        efficiencyAtts: [["confidence", .5]],
        iconText: {
            english: Raw.html`
        Level 10: Reveal Buy Comfy Shoes<br>
        Level 10: Reveal Buy Travelers Gear
`
        }
    },
    slideTheCoin: {
        tier: 2, plane: 0, resourceName: "gold",
        progressMaxBase: 5e16, progressMaxIncrease: 1,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .2, maxLevel: 1,
        unlockCost: 4e15, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
        },
        onLevelCustom: function () {
        },
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
        onUnlock: function () {
        },
        onLevelCustom: function () {
        },
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
        tier: 2, plane: 0, resourceName: "gold", creationVersion: 2,
        progressMaxBase: 5e35, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .001, maxLevel: 5,
        unlockCost: 2e30, visible: false, unlocked: false, purchased: false,
        onLevelCustom: function () {
            unveilAction('buyArtisanFood');
            if (data.actions.buyTravelersGear.level >= 5) {
                unveilAction('buyHouse');
            }
        },
        onLevelAtts: [["energy", 2e6], ["geared", 25000]],
        expAtts: [["savvy", 1], ["leverage", 1]],
        efficiencyAtts: [["confidence", .1]],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Buy Artisan Food<br>
        Level 5: Reveal Buy House
`
        }
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
        onLevelCustom: function () {
            unveilAction('buyPotions');
            if (data.actions.buyUtilityItems.level >= 3) {
                unveilAction('buyTools');
            }
        },
        onLevelAtts: [["energy", 3e6], ["navigation", 200]],
        expAtts: [["savvy", 1], ["leverage", 1]],
        efficiencyAtts: [["confidence", .1]],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Buy Potions<br>
        Level 3: Reveal Buy Tools
`
        }
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
        onLevelCustom: function () {
            if (data.actions.buyTools.level >= 3) {
                unveilAction('buyCart');
            }
        },
        onLevelAtts: [["geared", 6e5], ["logistics", 2]],
        expAtts: [["savvy", 1], ["leverage", 1]],
        efficiencyAtts: [["leverage", .1]],
        iconText: {
            english: Raw.html`
        Level 3: Reveal Buy Cart
`
        }
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
        onLevelCustom: function () {
            unveilAction('buyHouseholdItems');
            unveilUpgrade('improveMyHouse');
        },
        onLevelAtts: [["integration", 1000], ["comfort", 15]],
        expAtts: [["savvy", 1], ["ambition", 1]],
        efficiencyAtts: [["recognition", 1]],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Buy Household Items<br>
        Level 1: Show upgrade Improve My House
`
        }
    },
    buyHouseholdItems: {
        tier: 2, plane: 0, resourceName: "gold", creationVersion: 2,
        progressMaxBase: 5e43, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 5,
        unlockCost: 2e37, visible: false, unlocked: false, purchased: false,
        onLevelCustom: function () {
            unveilAction('buyFurniture');
        },
        onLevelAtts: [["energy", 3e7], ["discernment", 200]],
        expAtts: [["savvy", 1], ["leverage", 1]],
        efficiencyAtts: [["leverage", 1]],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Buy Furniture
`
        }
    },
    buyFurniture: {
        tier: 2, plane: 0, resourceName: "gold", creationVersion: 2,
        progressMaxBase: 2e44, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 5,
        unlockCost: 8e37, visible: false, unlocked: false, purchased: false,
        onLevelCustom: function () {
            unveilAction('buyReadingChair');
            unveilAction('buyBed');
        },
        onLevelAtts: [["energy", 5e7], ["comfort", 10]],
        expAtts: [["savvy", 1], ["leverage", 1]],
        efficiencyAtts: [["leverage", 1]],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Buy Reading Chair<br>
        Level 1: Reveal Buy Bed
`
        }
    },
    buyReadingChair: {
        tier: 2, plane: 0, resourceName: "gold", creationVersion: 2,
        progressMaxBase: 5e44, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 5,
        unlockCost: 2e38, visible: false, unlocked: false, purchased: false,
        onLevelCustom: function () {
            unveilAction('buyFireplace');
        },
        onLevelAtts: [["comfort", 15], ["peace", 2]],
        expAtts: [["savvy", 1], ["leverage", 1]],
        efficiencyAtts: [["leverage", 1]],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Buy Fireplace
`
        }
    },
    buyBed: {
        tier: 2, plane: 0, resourceName: "gold", creationVersion: 2,
        progressMaxBase: 2e46, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 5,
        unlockCost: 8e39, visible: false, unlocked: false, purchased: false,
        onLevelCustom: function () {
            unveilAction('buySilkSheets');
        },
        onLevelAtts: [["energy", 1e8]],
        expAtts: [["savvy", 1], ["leverage", 1]],
        efficiencyAtts: [["leverage", 1]],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Buy Silk Sheets
`
        }
    },
    buyFireplace: {
        tier: 2, plane: 0, resourceName: "gold", creationVersion: 2,
        progressMaxBase: 5e46, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 5,
        unlockCost: 2e40, visible: false, unlocked: false, purchased: false,
        onLevelCustom: function () {
            unveilAction('buyGoodFirewood');
        },
        onLevelAtts: [["comfort", 30]],
        expAtts: [["savvy", 1], ["leverage", 1]],
        efficiencyAtts: [["leverage", 1]],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Buy Good Firewood
`
        }
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
        tier: 1, plane: 0, resourceName: "gold", creationVersion: 2,
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
        onUnlock: function () {
            unveilAction('buildFortune');
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
            let investCap = Math.pow(upgradeData.increaseMarketCap.currentValue(), actionObj.actionPower);
            actionObj.resourceToAdd = actionObj.resourceToAdd > investCap ? investCap : actionObj.resourceToAdd;

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
        iconText: {
            english: Raw.html`
        Uses Gold and Fortune on Reinvest to produce Fortune<br>
        On Unlock: Reveal Build Fortune
`
        }
    },
    buildFortune: {
        tier: 2, plane: 0, resourceName: "fortune", creationVersion: 2, hasUpstream: false,
        progressMaxBase: 100, progressMaxIncrease: 4,
        expToLevelBase: 1, expToLevelIncrease: 2,
        efficiencyBase: 1, maxLevel: 5,
        unlockCost: 200, visible: false, unlocked: false, purchased: false,
        onUnlock: function () {
        },
        onLevelCustom: function () {
            unveilAction('reinvest')
            if (data.actions.buildFortune.level >= 2) {
                unveilAction('spendFortune')
            }
        },
        onLevelAtts: [["vision", 250], ["ambition", 20]],
        expAtts: [],
        efficiencyAtts: [],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Reinvest<br>
        Level 2: Reveal Spend Fortune
`
        }
    },
    reinvest: {
        tier: 3, plane: 0, resourceName: "fortune", creationVersion: 2,
        progressMaxBase: 1000, progressMaxIncrease: 100,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 10,
        unlockCost: 1000, visible: false, unlocked: false, purchased: false,
        onUnlock: function () {
        },
        onLevelCustom: function () {
        },
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
        onUnlock: function () {
            unveilAction('investInLocals');
            unveilAction('fundTownImprovements');
        },
        onLevelCustom: function () {
        },
        onLevelAtts: [["energy", 1e6], ["savvy", 1e4], ["adaptability", 100]],
        expAtts: [],
        efficiencyAtts: [],
        iconText: {
            english: Raw.html`
        On Unlock: Reveal Invest In Locals<br>
        On Unlock: Reveal Fund Town Improvements
`
        }
    },
    investInLocals: {
        tier: 3, plane: 0, resourceName: "fortune", creationVersion: 2,
        progressMaxBase: 1500, progressMaxIncrease: 10,
        expToLevelBase: 1, expToLevelIncrease: 2,
        efficiencyBase: 1, maxLevel: 4,
        unlockCost: 3000, visible: false, unlocked: false, purchased: false,
        onUnlock: function () {
            unveilAction('hostAFestival');
        },
        onLevelCustom: function () {
            if (data.actions.investInLocals.level >= 1) {
                unveilAction('townCrier')
            }
            if (data.actions.investInLocals.level >= 2) {
                unveilAction('storyTeller');
            }
        },
        onLevelAtts: [["recognition", 2e4], ["adaptability", 100], ["leverage", 10]],
        expAtts: [],
        efficiencyAtts: [],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Town Crier<br>
        Level 2: Reveal Story Teller<br>
`
        }
    },
    hostAFestival: {
        tier: 3, plane: 0, resourceName: "fortune", creationVersion: 2,
        progressMaxBase: 1e4, progressMaxIncrease: 10,
        expToLevelBase: 1, expToLevelIncrease: 2,
        efficiencyBase: 1, maxLevel: 4,
        unlockCost: 2e4, visible: false, unlocked: false, purchased: false,
        onUnlock: function () {
        },
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
        onUnlock: function () {
            unveilAction('investInSelf');
        },
        onLevelCustom: function () {
            unveilAction('supportLocalLibrary');
            if (data.actions.fundTownImprovements.level >= 2) {
                unveilAction('buyUtilityItems')
            }
            if (data.actions.fundTownImprovements.level >= 3) {
                unveilAction('browsePersonalCollection')
            }
            if (data.actions.fundTownImprovements.level >= 4) {
                unveilAction('fundASmallStall')
            }
        },
        onLevelAtts: [["cunning", 1000], ["adaptability", 100], ["leverage", 20]],
        expAtts: [],
        efficiencyAtts: [],
        iconText: {
            english: Raw.html`
        On Unlock: Reveal Invest In Self<br>
        Level 1: Reveal Support Local Library<br>
        Level 2: Reveal Buy Utility Items<br>
        Level 3: Reveal Browse Personal Collection<br>
        Level 4: Reveal Fund A Small Stall
`
        }
    },
    supportLocalLibrary: {
        tier: 3, plane: 0, resourceName: "fortune", creationVersion: 2,
        progressMaxBase: 2e7, progressMaxIncrease: 10,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 4,
        unlockCost: 5e7, visible: false, unlocked: false, purchased: false,
        onLevelCustom: function () {
            unveilAction('expandLocalLibrary')
        },
        onLevelAtts: [["recognition", 5e4], ["adaptability", 400], ["leverage", 30]],
        expAtts: [],
        efficiencyAtts: [],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Expand Local Library
`
        }
    },
    expandLocalLibrary: {
        tier: 3, plane: 0, resourceName: "fortune", creationVersion: 2,
        progressMaxBase: 2e9, progressMaxIncrease: 10,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 4,
        unlockCost: 5e9, visible: false, unlocked: false, purchased: false,
        onLevelCustom: function () {
            unveilAction('recruitACarpenter')
        },
        onLevelAtts: [["leverage", 50], ["intellect", 1], ["logistics", 1]],
        expAtts: [],
        efficiencyAtts: [],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Recruit A Carpenter
`
        }
    },
    investInSelf: {
        tier: 3, plane: 0, resourceName: "fortune", creationVersion: 2,
        progressMaxBase: 2e8, progressMaxIncrease: 10,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 4,
        unlockCost: 5e8, visible: false, unlocked: false, purchased: false,
        onLevelCustom: function () {
            unveilAction('makeAPublicDonation')
            if (data.actions.investInSelf.level >= 2) {
                unveilAction('purchaseALot')
            }
        },
        onLevelAtts: [["savvy", 2e4], ["confidence", 5000]],
        expAtts: [],
        efficiencyAtts: [],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Make A Public Donation<br>
        Level 2: Reveal Purchase A Lot
`
        }
    },
    makeAPublicDonation: {
        tier: 3, plane: 0, resourceName: "fortune", creationVersion: 2,
        progressMaxBase: 3e8, progressMaxIncrease: 10,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 4,
        unlockCost: 5e10, visible: false, unlocked: false, purchased: false,
        onLevelCustom: function () {
        },
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
        onLevelCustom: function () {
            purchaseAction('buyHouse');
            purchaseAction('buyHouseholdItems')
            unveilAction('buyHouse');
        },
        onLevelAtts: [["recognition", 2e5], ["ambition", 1000]],
        expAtts: [],
        efficiencyAtts: [],
        iconText: {
            english: Raw.html`
        Level 1: Purchase Buy House Action<br>
        Level 1: Purchase Buy Household Items Action<br>
        Level 1: Reveal Buy House
`
        }
    },
    recruitACarpenter: {
        tier: 3, plane: 0, resourceName: "fortune", creationVersion: 2,
        progressMaxBase: 5e12, progressMaxIncrease: 10,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 4,
        unlockCost: 5e12, visible: false, unlocked: false, purchased: false,
        onLevelCustom: function () {
            unveilAction('procureQualityWood')
            addMaxLevel("buildPersonalLibrary", 1)
            unveilAction('buildPersonalLibrary')
        },
        onLevelAtts: [["charm", 2.5e4], ["logistics", 3]],
        expAtts: [],
        efficiencyAtts: [],
        iconText: {
            english: Raw.html`
        On Level: +1 max level to Craft Spell Shack<br>
        Level 1: Reveal Craft Spell Shack<br>
        Level 1: Reveal Procure Quality Wood
`
        }
    },
    procureQualityWood: {
        tier: 3, plane: 0, resourceName: "fortune", creationVersion: 2,
        progressMaxBase: 3e14, progressMaxIncrease: 10,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 4,
        unlockCost: 5e14, visible: false, unlocked: false, purchased: false,
        onLevelCustom: function () {
            addMaxLevel("buildPersonalLibrary", 1)
        },
        onLevelAtts: [["adaptability", 1000], ["logistics", 4]],
        expAtts: [],
        efficiencyAtts: [],
        iconText: {
            english: Raw.html`
        On Level: +1 max level to Craft Spell Shack
`
        }
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
        onUnlock: function () {
            unveilAction('exploreDifficultPath')
            unveilAction('buyTravelersClothes')
        },
        onLevelAtts: [["coordination", 200]],
        expAtts: [["adaptability", 1]],
        efficiencyAtts: [["adaptability", 1]],
        iconText: {
            english: Raw.html`
        On Unlock: Reveal Explore Difficult Path<br>
        On Unlock: Reveal Buy Travelers Clothes
`
        }
    },
    oddJobsLaborer: {
        tier: 1, plane: 0,
        progressMaxBase: 1e10, progressMaxIncrease: 2,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .2, maxLevel: 8,
        wage: 20,
        unlockCost: 1e11, visible: false, unlocked: false, purchased: true,
        onLevelCustom: function () {
            data.actions.oddJobsLaborer.wage += actionData.oddJobsLaborer.wage / 2;
            changeJob('oddJobsLaborer');
        },
        onUnlock: function () {
            changeJob('oddJobsLaborer');
        },
        onLevelAtts: [["adaptability", 1]],
        expAtts: [],
        efficiencyAtts: [["adaptability", 1]],
        unlockMessage: {english: "On unlock, set job to Odd Jobs Laborer for a base wage of $20."},
        iconText: {
            english: Raw.html`
        Base wage: $20<br>
        On Level: Increase wage +50%
`
        }
    },
    chimneySweep: {
        tier: 1, plane: 0,
        progressMaxBase: 1e13, progressMaxIncrease: 2,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .2, maxLevel: 8,
        wage: 100,
        unlockCost: 1e13, visible: false, unlocked: false, purchased: true,
        onLevelCustom: function () {
            data.actions.chimneySweep.wage += actionData.chimneySweep.wage / 2;
            changeJob('chimneySweep');
        },
        onUnlock: function () {
            changeJob('chimneySweep');
        },
        onLevelAtts: [["adaptability", 2]],
        expAtts: [],
        efficiencyAtts: [["adaptability", .5]],
        unlockMessage: {english: "On unlock, set job to Chimney Sweep for a base wage of $100."},
        iconText: {
            english: Raw.html`
        Base wage: $100<br>
        On Level: Increase wage +50%
`
        }
    },
    handyman: {
        tier: 1, plane: 0,
        progressMaxBase: 1e15, progressMaxIncrease: 2,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .2, maxLevel: 8,
        wage: 2000,
        unlockCost: 1e15, visible: false, unlocked: false, purchased: true,
        onLevelCustom: function () {
            data.actions.handyman.wage += actionData.handyman.wage / 2;
            changeJob('handyman');
        },
        onUnlock: function () {
            changeJob('handyman');
        },
        onLevelAtts: [["adaptability", 4]],
        expAtts: [],
        efficiencyAtts: [["adaptability", .3]],
        unlockMessage: {english: "On unlock, set job to Handyman for a base wage of $2000."},
        iconText: {
            english: Raw.html`
        Base wage: $2000<br>
        On Level: Increase wage +50%
`
        }
    },
    tavernHelper: {
        tier: 1, plane: 0,
        progressMaxBase: 1e17, progressMaxIncrease: 3,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .2, maxLevel: 8,
        wage: 20000,
        unlockCost: 2e17, visible: false, unlocked: false, purchased: true,
        onLevelCustom: function () {
            data.actions.tavernHelper.wage += actionData.tavernHelper.wage / 2;
            changeJob('tavernHelper');
        },
        onUnlock: function () {
            changeJob('tavernHelper');
        },
        onLevelAtts: [["adaptability", 8], ["discernment", 10], ["confidence", 3]],
        expAtts: [],
        efficiencyAtts: [["adaptability", .1]],
        unlockMessage: {english: "On unlock, set job to Tavern Helper for a base wage of $20000."},
        iconText: {
            english: Raw.html`
        Base wage: $20000<br>
        On Level: Increase wage +50%
`
        }
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
        onUnlock: function () {
            unveilAction('meetPeople');
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
                        Exp & Conversations gain = (Momentum Taken/1e12)^.5 * Action Power * Efficiency.<br>
                        Requires 1e12 Momentum Taken to function.`
        },
        iconText: {
            english: Raw.html`
        Generates Conversations using Momentum<br> 
        On Unlock: Reveal Meet People
`
        }

    },
    meetPeople: {
        tier: 1, plane: 0, resourceName: "conversations",
        progressMaxBase: 1, progressMaxIncrease: 1.5,
        expToLevelBase: 50, expToLevelIncrease: 1,
        efficiencyBase: .5, maxLevel: 50,
        unlockCost: .5, visible: false, unlocked: false, purchased: true, hasUpstream: false,
        onUnlock: function () {
            unveilAction('buySocialAccess');
            unveilAction('talkWithScott');
        },
        onLevelAtts: [["recognition", 30]],
        expAtts: [["charm", 1]],
        efficiencyAtts: [["confidence", .1]],
        iconText: {
            english: Raw.html`
        On Unlock: Reveal Buy Social Access<br>
        On Unlock: Reveal Talk With Scott
`
        }
    },
    joinCoffeeClub: {
        tier: 1, plane: 0, resourceName: "conversations",
        progressMaxBase: 600000000000, progressMaxIncrease: 1,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .00001,
        unlockCost: 20000, maxLevel: 1,
        visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
            unveilAction('buyCoffee');
        },
        onLevelCustom: function () {
            unveilAction('gossipAroundCoffee');
        },
        onLevelAtts: [],
        expAtts: [["influence", 100], ["recognition", 1]],
        efficiencyAtts: [["influence", 100], ["recognition", .01]],
        iconText: {
            english: Raw.html`
        On Unlock: Reveal Buy Coffee<br>
        Level 1: Reveal Gossip Around Coffee
`
        }
    },
    gossipAroundCoffee: {
        tier: 1, plane: 0, resourceName: "conversations",
        progressMaxBase: 1e7, progressMaxIncrease: 20,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .1,
        unlockCost: 1000000, maxLevel: 10,
        visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
            unveilAction('hearAboutTheLich');
        },
        onLevelCustom: function () {
            if (data.actions.gossipAroundCoffee.level >= 5) {
                unlockAction(data.actions.hearAboutTheLich);
            }
        },
        onLevelAtts: [["discernment", 10]],
        expAtts: [["cunning", 1]],
        efficiencyAtts: [["discernment", .5]],
        iconText: {
            english: Raw.html`
        On Unlock: Reveal Hear About The Lich<br>
        Level 5: Unlock Hear About The Lich
`
        }
    },
    hearAboutTheLich: {
        tier: 1, plane: 0, resourceName: "fear",
        progressMaxBase: 4000, progressMaxIncrease: 1e3,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 2,
        unlockCost: 0,
        visible: false, unlocked: false, purchased: true, hasUpstream: false,
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
        iconText: {
            english: Raw.html`
        Overclock additionally generates Fear on this action.<br>
        Multiply Ancient Coin gain in Northern Wastes by this action's level.
`
        }
    },
    watchBirds: {
        tier: 1, plane: 0,
        progressMaxBase: 800000000, progressMaxIncrease: 1,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .6, maxLevel: 1,
        unlockCost: 400000, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
        },
        onLevelCustom: function () {
            unveilAction('catchAScent')
        },
        onLevelAtts: [["observation", 30]],
        expAtts: [["concentration", 1], ["curiosity", 1], ["awareness", 1]],
        efficiencyAtts: [["navigation", 1]],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Catch A Scent
`
        }
    },
    catchAScent: {
        tier: 1, plane: 0,
        progressMaxBase: 1e8, progressMaxIncrease: 1,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .5, maxLevel: 1,
        unlockCost: 5e6, visible: false, unlocked: false, purchased: true,
        onLevelCustom: function () {
        },
        onUnlock: function () {
            addMaxLevel("bodyAwareness", 3);
        },
        onLevelAtts: [["observation", 120]],
        expAtts: [["curiosity", 1], ["concentration", 1]],
        efficiencyAtts: [["navigation", 1]],
        unlockMessage: {english: "On unlock, +3 max levels for Body Awareness."},
        iconText: {
            english: Raw.html`
        On Unlock: +3 max levels for Body Awareness
`
        }

    },
    exploreDifficultPath: {
        tier: 1, plane: 0,
        progressMaxBase: 2e13, progressMaxIncrease: 20,
        expToLevelBase: 2, expToLevelIncrease: 1,
        efficiencyBase: .2, maxLevel: 2,
        unlockCost: 1e12, visible: false, unlocked: false, purchased: true,
        onLevelCustom: function () {
            unveilAction('keepGoing')
            unveilAction('eatGoldenFruit');
        },
        onUnlock: function () {
        },
        onLevelAtts: [["navigation", 2]],
        expAtts: [["geared", 1]],
        efficiencyAtts: [["navigation", 1], ["geared", .01]],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Keep Going<br>
        Level 1: Reveal Eat Golden Fruit
`
        }
    },
    eatGoldenFruit: {
        tier: 2, plane: 0,
        progressMaxBase: 1e11, progressMaxIncrease: 10,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 1,
        unlockCost: 5e11, visible: false, unlocked: false, purchased: true,
        onLevelCustom: function () {
        },
        onUnlock: function () {
        },
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
        onUnlock: function () {
            unveilAction('climbTheRocks')
        },
        onLevelCustom: function () {
        },
        onLevelAtts: [["navigation", 3], ["flow", 5]],
        expAtts: [["geared", 1]],
        efficiencyAtts: [["geared", .01]],
        iconText: {
            english: Raw.html`
        On Unlock: Reveal Climb The Rocks
`
        }
    },
    climbTheRocks: {
        tier: 1, plane: 0,
        progressMaxBase: 4e14, progressMaxIncrease: 1,
        expToLevelBase: 2, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 5,
        unlockCost: 1e13, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
        },
        onLevelCustom: function () {
            if (data.actions.climbTheRocks.level >= 5) {
                unveilAction('spotAPath')
            }
        },
        onLevelAtts: [["concentration", 100]],
        expAtts: [["geared", 1]],
        efficiencyAtts: [["geared", .01]],
        iconText: {
            english: Raw.html`
        Level 5: Reveal Spot A Path
`
        }
    },
    spotAPath: {
        tier: 1, plane: 0,
        progressMaxBase: 3e16, progressMaxIncrease: 3,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 1,
        unlockCost: 3e13, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
        },
        onLevelCustom: function () {
            unveilAction('pleasantForest')
        },
        onLevelAtts: [["navigation", 20], ["flow", 20]],
        expAtts: [["geared", 1], ["vision", .1]],
        efficiencyAtts: [["integration", 1], ["vision", .1], ["geared", .01]],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Pleasant Forest
`
        }
    },
    pleasantForest: {
        tier: 1, plane: 0,
        progressMaxBase: 1e16, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .2, maxLevel: 10,
        unlockCost: 1e15, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
            unveilAction('hiddenPath')
        },
        onLevelCustom: function () {
        },
        onLevelAtts: [["observation", 2000]],
        expAtts: [["endurance", 1], ["flow", 1]],
        efficiencyAtts: [["curiosity", .01]],
        iconText: {
            english: Raw.html`
        On Unlock: Reveal Hidden Path
`
        }
    },
    hiddenPath: {
        tier: 1, plane: 0,
        progressMaxBase: 2e19, progressMaxIncrease: 5,
        expToLevelBase: 7, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 5,
        unlockCost: 5e14, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
            unveilAction('exploreTheForest')
            unveilAction('meetGrumpyHermit')
        },
        onLevelCustom: function () {
        },
        onLevelAtts: [["concentration", 500]],
        expAtts: [["observation", 1], ["geared", 1]],
        efficiencyAtts: [],
        iconText: {
            english: Raw.html`
        On Unlock: Explore the Forest<br>
        On Unlock: Meet Grumpy Hermit
`
        }
    },
    meetGrumpyHermit: {
        tier: 1, plane: 0,
        progressMaxBase: 4e18, progressMaxIncrease: 40,
        expToLevelBase: 4, expToLevelIncrease: 1,
        efficiencyBase: .0001, maxLevel: 1,
        unlockCost: 2e14, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
            unveilAction('socialize');
        },
        onLevelCustom: function () {
            unveilAction('annoyHermitIntoAQuest')
            if (data.actions.meetGrumpyHermit.level >= 2) {
                unveilAction('talkToHermit');
            }
        },
        onLevelAtts: [["flow", 80]],
        expAtts: [["curiosity", 1], ["observation", 1]],
        efficiencyAtts: [["confidence", 1000]],
        unlockMessage: {english: "On unlock and level, reveal a new action."},
        iconText: {
            english: Raw.html`
        On Unlock: Reveal Socialize<br>
        Level 1: Reveal Annoy Hermit Into A Quest<br>
        Level 2: Reveal Talk To Hermit
`
        }
    },
    exploreTheForest: {
        tier: 1, plane: 0,
        progressMaxBase: 2e16, progressMaxIncrease: 3,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 10,
        unlockCost: 3e15, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
            unveilAction('travelAlongTheRiver')
        },
        onLevelCustom: function () {
        },
        onLevelAtts: [["curiosity", 200]],
        expAtts: [["endurance", 1]],
        efficiencyAtts: [],
        iconText: {
            english: Raw.html`
        On Unlock: Reveal Travel Along The River
`
        }
    },
    annoyHermitIntoAQuest: {
        tier: 1, plane: 0,
        progressMaxBase: 3e15, progressMaxIncrease: 1,
        expToLevelBase: 100, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 1,
        unlockCost: 2e15, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
        },
        onLevelCustom: function () {
            unveilAction('gatherRiverWeeds')
        },
        onLevelAtts: [["concentration", 2000]],
        expAtts: [["curiosity", 1]],
        efficiencyAtts: [],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Gather River Weeds
`
        }
    },
    presentTheOffering: {
        tier: 1, plane: 0,
        progressMaxBase: 10e15, progressMaxIncrease: 1.05,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 100,
        unlockCost: 40e15, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
            addMaxLevel("meetGrumpyHermit", 1);
        },
        onLevelCustom: function () {
        },
        onLevelAtts: [["control", 1]],
        expAtts: [["control", 1]],
        efficiencyAtts: [],
        unlockMessage: {english: "On unlock, +1 max level for Meet Grumpy Hermit."},
        iconText: {
            english: Raw.html`
        On Unlock: +1 max level for Meet Grumpy Hermit
`
        }
    },
    talkToHermit: {
        tier: 1, plane: 0,
        progressMaxBase: 100e18, progressMaxIncrease: 1,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .00003, maxLevel: 1,
        unlockCost: 100e15, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
            unveilAction('chatWithHermit')
            unveilAction('tellAJoke')
        },
        onLevelCustom: function () {
        },
        onLevelAtts: [["flow", 80]],
        expAtts: [["charm", 10]],
        efficiencyAtts: [["charm", 10]],
        iconText: {
            english: Raw.html`
        On Unlock: Reveal Chat With Hermit<br>
        On Unlock: Reveal Tell A Joke
`
        }
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
            unveilAction('echoKindle');
            unveilAction('sparkMana');
        },
        onLevelCustom: function () {
            unveilAction('learnToStayStill')
            if (data.actions.inquireAboutMagic.level >= 2) {
                unveilAction('feelTheResonance')
            }
            if (data.actions.inquireAboutMagic.level >= 3) {
                unveilAction('layerTheEchoes')
            }
            if (data.actions.inquireAboutMagic.level >= 4) {
                unveilAction('igniteTheSpark')
            }
        },
        onLevelAtts: [["integration", 40], ["curiosity", 500]],
        expAtts: [],
        efficiencyAtts: [],
        unlockMessage: {english: "On unlock, open Magic and +1 Legacy."},
        onLevelText: {english: "Unlocks new actions with each level."},
        iconText: {
            english: Raw.html`
        On Unlock: Open Magic Tab<br>
        On Unlock: Reveal Echo Kindle<br>
        On Unlock: Reveal Spark Mana<br>
        On Unlock: Gain 1 Legacy<br>
        Level 1: Reveal Learn To Stay Still<br>
        Level 2: Reveal Feel The Resonance<br>
        Level 3: Reveal Layer The Echoes<br>
        Level 4: Reveal Ignite The Spark
`
        }
    },
    talkWithScott: {
        tier: 1, plane: 0, resourceName: "conversations",
        progressMaxBase: 50, progressMaxIncrease: 100,
        expToLevelBase: 50, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 2,
        unlockCost: 1, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
            unveilAction('handyman');

        },
        onLevelCustom: function () {
            unveilAction('learnToListen');
            if (data.actions.talkWithScott.level >= 2) {
                unveilAction('tavernHelper');
                unveilAction('talkWithJohn');
            }
        },
        onLevelAtts: [["savvy", 100]],
        expAtts: [["confidence", 1], ["recognition", 1]],
        efficiencyAtts: [["discernment", 1]],
        iconText: {
            english: Raw.html`
        On Unlock: Reveal Handyman<br>
        Level 1: Reveal Learn To Listen<br>
        Level 2: Reveal Tavern Helper<br>
        Level 2: Reveal Talk With John
`
        }
    },
    talkWithJohn: {
        tier: 1, plane: 0, resourceName: "conversations",
        progressMaxBase: 2e5, progressMaxIncrease: 100,
        expToLevelBase: 50, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 2,
        unlockCost: 4e6, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
        },
        onLevelCustom: function () {
            unveilAction('guildReceptionist');
            if (data.actions.talkWithJohn.level >= 2) {
                unveilAction('messenger');
            }
        },
        onLevelAtts: [["savvy", 2500]],
        expAtts: [["confidence", 1]],
        efficiencyAtts: [["discernment", .5]],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Guild Receptionist<br>
        Level 2: Reveal Messenger
`
        }
    },
    learnToListen: {
        tier: 1, plane: 0, resourceName: "conversations",
        progressMaxBase: 1000000, progressMaxIncrease: 100,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .3, maxLevel: 10,
        unlockCost: 10, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
            unveilAction('chatWithMerchants')
        },
        onLevelCustom: function () {
            if (data.actions.learnToListen.level >= 10) {
                unveilAction('learnToInquire')
            }
        },
        onLevelAtts: [["discernment", 10], ["confidence", 5]],
        expAtts: [["observation", 1], ["curiosity", 1]],
        efficiencyAtts: [["discernment", .1]],
        iconText: {
            english: Raw.html`
        On Unlock: Reveal Chat With Merchants<br>
        Level 10: Unlock Learn to Inquire
`
        }
    },
    chatWithMerchants: {
        tier: 1, plane: 0, resourceName: "conversations",
        progressMaxBase: 5000, progressMaxIncrease: 2,
        expToLevelBase: 20, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 3,
        unlockCost: 50, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
            unveilAction('browseStores')
        },
        onLevelCustom: function () {
            unveilAction('complimentTheChef')
            if (data.actions.chatWithMerchants.level >= 2) {
                unveilAction('askAboutStitching')
            }
            if (data.actions.chatWithMerchants.level >= 3) {
                unveilAction('listenToWoes')
            }

        },
        onLevelAtts: [["recognition", 200], ["cunning", 10]],
        expAtts: [["observation", 1]],
        efficiencyAtts: [["discernment", 1]],
        iconText: {
            english: Raw.html`
        On Unlock: Reveal Browse Stores<br>
        Level 1: Reveal Compliment The Chef<br>
        Level 2: Reveal Ask About Stitching<br>
        Level 3: Reveal Listen To Woes
`
        }
    },
    complimentTheChef: {
        tier: 1, plane: 0, resourceName: "conversations",
        progressMaxBase: 5, progressMaxIncrease: 40,
        expToLevelBase: 20, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 2,
        unlockCost: 50, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
        },
        onLevelCustom: function () {
            unveilAction('buyStreetFood')
            if (data.actions.complimentTheChef.level >= 2) {
                unveilAction('buyGoodFood')
            }
        },
        onLevelAtts: [["charm", 40], ["awareness", 1000]],
        expAtts: [],
        efficiencyAtts: [["discernment", 1]],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Buy Street Food<br>
        Level 2: Reveal Buy Good Food
`
        }
    },
    askAboutStitching: {
        tier: 1, plane: 0, resourceName: "conversations",
        progressMaxBase: 10, progressMaxIncrease: 40,
        expToLevelBase: 20, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 2,
        unlockCost: 100, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
        },
        onLevelCustom: function () {
            unveilAction('buyMatchingClothes')
            if (data.actions.askAboutStitching.level >= 2) {
                unveilAction('buyStylishClothes')
            }
        },
        onLevelAtts: [["charm", 40], ["control", 10]],
        expAtts: [],
        efficiencyAtts: [["discernment", 1]],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Buy Matching Clothes<br>
        Level 2: Reveal Buy Stylish Clothes
`
        }
    },
    listenToWoes: {
        tier: 1, plane: 0, resourceName: "conversations",
        progressMaxBase: 40, progressMaxIncrease: 40,
        expToLevelBase: 40, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 2,
        unlockCost: 400, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
            unveilAction('keyToTheBackroom')
        },
        onLevelCustom: function () {
        },
        onLevelAtts: [["concentration", 2000], ["charm", 80], ["confidence", 5]],
        expAtts: [],
        efficiencyAtts: [["discernment", 1]],
        iconText: {
            english: Raw.html`
        On Unlock: Reveal Key To The Backroom
`
        }
    },
    keyToTheBackroom: {
        tier: 1, plane: 0, resourceName: "conversations",
        progressMaxBase: 200, progressMaxIncrease: 1,
        expToLevelBase: 20, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 1,
        unlockCost: 200, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
        },
        onLevelCustom: function () {
            unveilAction('browseBackrooms')
            unveilAction('joinCoffeeClub');
            unveilAction('slideTheCoin');
        },
        onLevelAtts: [],
        expAtts: [],
        efficiencyAtts: [["discernment", 1]],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Browse Backrooms<br>
        Level 1: Reveal Join Coffee Club<br>
        Level 1: Reveal Slide The Coin
`
        }
    },
    chatWithHermit: {
        tier: 1, plane: 0, resourceName: "conversations",
        progressMaxBase: 1000000, progressMaxIncrease: 5,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 10,
        unlockCost: 10000, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
        },
        onLevelCustom: function () {
        },
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
        onUnlock: function () {
        },
        onLevelCustom: function () {
            unveilAction('inquireAboutMagic')
        },
        onLevelAtts: [["charm", 1000]],
        expAtts: [],
        efficiencyAtts: [["discernment", .5]],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Inquire About Magic
`
        }
    },
    learnToInquire: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 2,
        progressMaxBase: 3e21, progressMaxIncrease: 100,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .05, maxLevel: 10,
        unlockCost: 1e16, visible: false, unlocked: false, purchased: false,
        onUnlock: function () {

        },
        onLevelCustom: function () {
            unveilAction('talkToTheRecruiters');
        },
        onLevelAtts: [["charm", 5000], ["discernment", 20]],
        expAtts: [["curiosity", 1], ["confidence", 1]],
        efficiencyAtts: [["discernment", .05]],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Talk To The Recruiters
`
        }
    },
    talkToTheRecruiters: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 2,
        progressMaxBase: 1e20, progressMaxIncrease: 100,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .05, maxLevel: 2,
        unlockCost: 1e16, visible: false, unlocked: false, purchased: false,
        onUnlock: function () {
            unveilAction('buyPointyHat');
        },
        onLevelCustom: function () {
            unveilAction('askAboutLocalWork');
            unveilAction('askAboutArcaneCorps');
        },
        onLevelAtts: [["confidence", 200]],
        expAtts: [["recognition", 1]],
        efficiencyAtts: [["discernment", .05]],
        iconText: {
            english: Raw.html`
        On Unlock: Reveal Buy Pointy Hat<br>
        Level 1: Reveal Ask About Local Work<br>
        Level 1: Reveal Ask About Arcane Corps
`
        }
    },
    askAboutLocalWork: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 2,
        progressMaxBase: 8e20, progressMaxIncrease: 100,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .05, maxLevel: 1,
        unlockCost: 4e16, visible: false, unlocked: false, purchased: false,
        onUnlock: function () {
        },
        onLevelCustom: function () {
            unveilAction('worksiteSweeper')
        },
        onLevelAtts: [["adaptability", 100]],
        expAtts: [["discernment", 1], ["adaptability", 1]],
        efficiencyAtts: [["discernment", .05]],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Worksite Sweeper
`
        }
    },
    askAboutArcaneCorps: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 2,
        progressMaxBase: 1e26, progressMaxIncrease: 10,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .0005, maxLevel: 2,
        unlockCost: 2e16, visible: false, unlocked: false, purchased: false,
        onUnlock: function () {
        },
        onLevelCustom: function () {
            unveilAction('getTestedForKnowledge');
        },
        onLevelAtts: [["recognition", 10000]],
        expAtts: [["discernment", 1], ["charm", 1], ["confidence", 1]],
        efficiencyAtts: [["discernment", .05], ["confidence", .1]],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Get Tested For Knowledge
`
        }
    },
    getTestedForKnowledge: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 2,
        progressMaxBase: 1e28, progressMaxIncrease: 100,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 1,
        unlockCost: 5e16, visible: false, unlocked: false, purchased: false,
        onUnlock: function () {
        },
        onLevelCustom: function () {
            unveilAction('discussPlacement');
        },
        onLevelAtts: [["integration", 400]],
        expAtts: [["wizardry", 1], ["pulse", 1], ["vision", 1], ["control", 1]],
        efficiencyAtts: [["wizardry", .01]],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Discuss Placement
`
        }
    },
    discussPlacement: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 2,
        progressMaxBase: 1e20, progressMaxIncrease: 5,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 4,
        unlockCost: 1e18, visible: false, unlocked: false, purchased: false,
        onUnlock: function () {
        },
        onLevelCustom: function () {
            unveilAction('meetTheMages');
        },
        onLevelAtts: [["discernment", 75]],
        expAtts: [["influence", 1]],
        efficiencyAtts: [["discernment", .05]],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Meet The Mages
`
        }
    },
    meetTheMages: {
        tier: 1, plane: 0, resourceName: "conversations", creationVersion: 2,
        progressMaxBase: 2e28, progressMaxIncrease: 10,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 4,
        unlockCost: 5e17, visible: false, unlocked: false, purchased: false,
        onUnlock: function () {
        },
        onLevelCustom: function () {
            unveilAction('trainWithTeam');
            unlockAction(data.actions.trainWithTeam);
        },
        onLevelAtts: [["wizardry", 4000], ["control", 25]],
        expAtts: [["confidence", 1], ["charm", 1], ["wizardry", 1]],
        efficiencyAtts: [["discernment", .05]],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Train With Team<br>
        Level 1: Unlock Train With Team
`
        }
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
            addMaxLevel('hearAboutTheLich', 1);
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
        iconText: {
            english: Raw.html`
        Generates Teamwork using charged spells<br>
        On Unlock: x3 legacy gain in Northern Wastes<br>
        On Level: +1 max level for Hear About The Lich<br>
        Multiply Legacy gain in Northern Wastes by this action's level.<br>
        High Teamwork increases Fight
`
        }
    },
//# spell power used, # exp gained


    learnToStayStill: {
        tier: 1, plane: 0,
        progressMaxBase: 1e19, progressMaxIncrease: 1,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 1,
        unlockCost: 1e19, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
            unveilAction('meditate');
            unveilAction('journal');
        },
        onLevelCustom: function () {
        },
        onLevelAtts: [],
        expAtts: [],
        efficiencyAtts: [],
        iconText: {
            english: Raw.html`
        On Unlock: Reveal Meditate<br>
        On Unlock: Reveal Journal
`
        }
    },
    feelTheResonance: {
        tier: 1, plane: 0,
        progressMaxBase: 1e17, progressMaxIncrease: 1,
        expToLevelBase: 100, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 1,
        unlockCost: 3e19, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
        },
        onLevelCustom: function () {
        },
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
        onUnlock: function () {
        },
        onLevelCustom: function () {
            unveilAction('pesterHermitForSecrets')
        },
        onLevelAtts: [["legacy", 9], ["pulse", 10]],
        expAtts: [],
        efficiencyAtts: [],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Pester Hermit For Secrets
`
        }
    },
    travelAlongTheRiver: {
        tier: 1, plane: 0,
        progressMaxBase: 1e16, progressMaxIncrease: 3,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 10,
        unlockCost: 3e15, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
        },
        onLevelCustom: function () {
        },
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
        onUnlock: function () {
        },
        onLevelCustom: function () {
            if (data.actions.gatherRiverWeeds.level >= 10) {
                unveilAction('presentTheOffering')
            }
        },
        onLevelAtts: [["might", 1000]],
        expAtts: [["coordination", 1], ["observation", 1], ["endurance", 1]],
        efficiencyAtts: [],
        iconText: {
            english: Raw.html`
        Level 10: Reveal Present The Offering
`
        }
    },
    pesterHermitForSecrets: {
        tier: 1, plane: 0,
        progressMaxBase: 3e20, progressMaxIncrease: 500,
        expToLevelBase: 1, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 3,
        unlockCost: 1e21, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
            unveilAction('restAtWaterfall')
        },
        onLevelCustom: function () {
            unveilAction('visitShrineBehindWaterfall')
            if (data.actions.pesterHermitForSecrets.level >= 2) {
                unveilAction('travelToCrossroads')
            }
            if (data.actions.pesterHermitForSecrets.level >= 3) {
                unveilAction('forgottenShrine')
            }
        },
        onLevelAtts: [["curiosity", 10000]],
        expAtts: [],
        efficiencyAtts: [],
        unlockMessage: {english: "On unlock, reveal a new action."},
        iconText: {
            english: Raw.html`
        On Unlock: Reveal Rest At Waterfall<br>
        Level 1: Reveal Visit Shrine Behind Waterfall<br>
        Level 2: Reveal Travel To Crossroads<br>
        Level 3: Reveal Forgotten Shrine
`
        }
    },
    restAtWaterfall: {
        tier: 1, plane: 0,
        progressMaxBase: 6e20, progressMaxIncrease: 3,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 2,
        unlockCost: 2e21, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
        },
        onLevelCustom: function () {
        },
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
        onUnlock: function () {
        },
        onLevelCustom: function () {
        },
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
        onUnlock: function () {
        },
        onLevelCustom: function () {
        },
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
        onUnlock: function () {
        },
        onLevelCustom: function () {
            unveilAction('feelAGentleTug')
        },
        onLevelAtts: [["observation", 30000]],
        expAtts: [["endurance", 1], ["navigation", 1]],
        efficiencyAtts: [["curiosity", .01]],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Feel A Gentle Tug
`
        }
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
        onUnlock: function () {
        },
        onLevelCustom: function () {
            unveilAction('walkAware');
        },
        onLevelAtts: [["awareness", 2e4], ["coordination", 3000]],
        expAtts: [["endurance", 1], ["control", 1]],
        efficiencyAtts: [],
        iconText: {
            english: Raw.html`
        Level 1: Reveal Walk Aware
`
        }
    },
    walkAware: {
        tier: 1, plane: 0, creationVersion: 2,
        progressMaxBase: 1e43, progressMaxIncrease: 10,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: 1, maxLevel: 5,
        unlockCost: 1e37, visible: false, unlocked: false, purchased: false,
        onUnlock: function () {
        },
        onLevelCustom: function () {
        },
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
        onLevelCustom: function () {
        },
        onUnlock: function () {
            unveilAction('basicTrainingWithJohn');
        },
        onLevelAtts: [["endurance", 10], ["coordination", 5]],
        expAtts: [["coordination", 1]],
        efficiencyAtts: [["coordination", 1]],
        iconText: {
            english: Raw.html`
        On Unlock: Reveal Basic Training With John
`
        }
    },
    basicTrainingWithJohn: {
        tier: 1, plane: 0,
        progressMaxBase: 1e10, progressMaxIncrease: 8,
        expToLevelBase: 3, expToLevelIncrease: 1,
        efficiencyBase: .5, maxLevel: 5,
        unlockCost: 3e8, visible: false, unlocked: false, purchased: true,
        onUnlock: function () {
            unveilAction('noticeTheStrain');
            unveilAction('clenchTheJaw');
            unveilAction('breatheThroughIt');
            unveilAction('ownTheWeight');
            unveilAction('moveWithPurpose');
            addMaxLevel("bodyAwareness", 4);
        },
        onLevelAtts: [["coordination", 30]],
        expAtts: [["endurance", 1], ["might", 1], ["geared", 1]],
        efficiencyAtts: [["flow", 1]],
        unlockMessage: {english: "On unlock, +4 max levels for Body Awareness."},
        iconText: {
            english: Raw.html`
        On Unlock: +4 max levels for Body Awareness<br>
        On Unlock: Reveal Notice The Strain<br>
        On Unlock: Reveal Clench The Jaw<br>
        On Unlock: Reveal Breathe Through It<br>
        On Unlock: Reveal Own The Weight<br>
        On Unlock: Reveal Move With Purpose
`
        }
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
        onLevelCustom: function () {

        },
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
        onLevelCustom: function () {
            data.actions.guildReceptionist.wage += actionData.guildReceptionist.wage / 2;
            changeJob('guildReceptionist');
        },
        onUnlock: function () {
            changeJob('guildReceptionist');
        },
        onLevelAtts: [["adaptability", 16]],
        expAtts: [],
        efficiencyAtts: [["adaptability", .05]],
        unlockMessage: {english: "On unlock, set job to Guild Receptionist for a base wage of $500k."},
        iconText: {
            english: Raw.html`
        Base Wage: $500k<br>
        On Level: Increase wage +50%
`
        }
    },
    messenger: {
        tier: 1, plane: 0,
        progressMaxBase: 1e23, progressMaxIncrease: 4,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .1, maxLevel: 8,
        wage: 4e6,
        unlockCost: 1e22, visible: false, unlocked: false, purchased: true,
        onLevelCustom: function () {
            data.actions.messenger.wage += actionData.messenger.wage / 2;
            changeJob('messenger');
        },
        onUnlock: function () {
            changeJob('messenger');
        },
        onLevelAtts: [["adaptability", 32]],
        expAtts: [],
        efficiencyAtts: [["adaptability", .05]],
        unlockMessage: {english: "On unlock, set job to Messenger for a base wage of $4m."},
        iconText: {
            english: Raw.html`
        Base Wage: $4m<br>
        On Level: Increase wage +50%
`
        }
    },
    townCrier: {
        tier: 1, plane: 0, creationVersion: 2,
        progressMaxBase: 1e28, progressMaxIncrease: 4,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .03, maxLevel: 8,
        wage: 25e6,
        unlockCost: 1e29, visible: false, unlocked: false, purchased: false,
        onLevelCustom: function () {
            data.actions.townCrier.wage += actionData.townCrier.wage / 2;
            changeJob('townCrier');
        },
        onUnlock: function () {
            changeJob('townCrier');
        },
        onLevelAtts: [["adaptability", 100]],
        expAtts: [],
        efficiencyAtts: [["adaptability", .05]],
        unlockMessage: {english: "On unlock, set job to Town Crier for a base wage of $25m."},
        iconText: {
            english: Raw.html`
        Base Wage: $25m<br>
        On Level: Increase wage +50%
`
        }
    },
    storyTeller: {
        tier: 1, plane: 0, creationVersion: 2,
        progressMaxBase: 1e30, progressMaxIncrease: 4,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .001, maxLevel: 8,
        wage: 150e6,
        unlockCost: 1e31, visible: false, unlocked: false, purchased: false,
        onLevelCustom: function () {
            data.actions.storyTeller.wage += actionData.storyTeller.wage / 2;
            changeJob('storyTeller');
        },
        onUnlock: function () {
            changeJob('storyTeller');
        },
        onLevelAtts: [["adaptability", 100]],
        expAtts: [],
        efficiencyAtts: [["adaptability", .05]],
        unlockMessage: {english: "On unlock, set job to Story Teller for a base wage of $150m."},
        iconText: {
            english: Raw.html`
        Base Wage: $150m<br>
        On Level: Increase wage +50%
`
        }
    },
    worksiteSweeper: {
        tier: 1, plane: 0, creationVersion: 2,
        progressMaxBase: 1e29, progressMaxIncrease: 4,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 8,
        wage: 15e6,
        unlockCost: 1e29, visible: false, unlocked: false, purchased: false,
        onLevelCustom: function () {
            data.actions.worksiteSweeper.wage += actionData.worksiteSweeper.wage / 2;
            changeJob('worksiteSweeper');
        },
        onUnlock: function () {
            changeJob('worksiteSweeper');
        },
        onLevelAtts: [["adaptability", 100]],
        expAtts: [],
        efficiencyAtts: [["wizardry", .01]],
        unlockMessage: {english: "On unlock, set job to Dig Foundation for a base wage of $15m."},
        iconText: {
            english: Raw.html`
        Base Wage: $15m<br>
        On Level: Increase wage +50%
`
        }
    },
    digFoundation: {
        tier: 1, plane: 0, creationVersion: 2,
        progressMaxBase: 5e30, progressMaxIncrease: 4,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .01, maxLevel: 8,
        wage: 100e6,
        unlockCost: 5e30, visible: false, unlocked: false, purchased: false,
        onLevelCustom: function () {
            data.actions.digFoundation.wage += actionData.digFoundation.wage / 2;
            changeJob('digFoundation');
        },
        onUnlock: function () {
            changeJob('digFoundation');
        },
        onLevelAtts: [["adaptability", 100]],
        expAtts: [],
        efficiencyAtts: [["wizardry", .01]],
        unlockMessage: {english: "On unlock, set job to Dig Foundation for a base wage of $100m."},
        iconText: {
            english: Raw.html`
        Base Wage: $100m<br>
        On Level: Increase wage +50%
`
        }
    },
    stoneCompression: {
        tier: 1, plane: 0, creationVersion: 2,
        progressMaxBase: 1e32, progressMaxIncrease: 5,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .002, maxLevel: 8,
        wage: 500e6,
        unlockCost: 1e32, visible: false, unlocked: false, purchased: false,
        onLevelCustom: function () {
            data.actions.stoneCompression.wage += actionData.stoneCompression.wage / 2;
            changeJob('stoneCompression');
        },
        onUnlock: function () {
            changeJob('stoneCompression');
        },
        onLevelAtts: [["adaptability", 200]],
        expAtts: [],
        efficiencyAtts: [["wizardry", .01]],
        unlockMessage: {english: "On unlock, set job to Stone Compression for a base wage of $500m."},
        iconText: {
            english: Raw.html`
        Base Wage: $500m<br>
        On Level: Increase wage +50%
`
        }
    },
    shapeBricks: {
        tier: 1, plane: 0, creationVersion: 2,
        progressMaxBase: 1e35, progressMaxIncrease: 5,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .001, maxLevel: 8,
        wage: 2e9,
        unlockCost: 1e35, visible: false, unlocked: false, purchased: false,
        onLevelCustom: function () {
            data.actions.shapeBricks.wage += actionData.shapeBricks.wage / 2;
            changeJob('shapeBricks');
        },
        onUnlock: function () {
            changeJob('shapeBricks');
        },
        onLevelAtts: [["adaptability", 200]],
        expAtts: [],
        efficiencyAtts: [["wizardry", .01]],
        unlockMessage: {english: "On unlock, set job to Shape Bricks for a base wage of $2b."},
        iconText: {
            english: Raw.html`
        Base Wage: $2b<br>
        On Level: Increase wage +50%
`
        }
    },
    tidyMagesmithShop: {
        tier: 1, plane: 0, creationVersion: 2,
        progressMaxBase: 1e38, progressMaxIncrease: 4,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .0005, maxLevel: 8,
        wage: 5e9,
        unlockCost: 1e38, visible: false, unlocked: false, purchased: false,
        onLevelCustom: function () {
            data.actions.tidyMagesmithShop.wage += actionData.tidyMagesmithShop.wage / 2;
            changeJob('tidyMagesmithShop');
        },
        onUnlock: function () {
            changeJob('tidyMagesmithShop');
        },
        onLevelAtts: [["adaptability", 300]],
        expAtts: [],
        efficiencyAtts: [["wizardry", .01]],
        unlockMessage: {english: "On unlock, set job to Tidy Magesmith Shop for a base wage of $5b."},
        iconText: {
            english: Raw.html`
        Base Wage: $5b<br>
        On Level: Increase wage +50%
`
        }
    },
    clearTheBasement: {
        tier: 1, plane: 0, creationVersion: 2,
        progressMaxBase: 1e41, progressMaxIncrease: 4,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .0004, maxLevel: 8,
        wage: 15e9,
        unlockCost: 1e41, visible: false, unlocked: false, purchased: false,
        onLevelCustom: function () {
            data.actions.clearTheBasement.wage += actionData.clearTheBasement.wage / 2;
            changeJob('clearTheBasement');
        },
        onUnlock: function () {
            changeJob('clearTheBasement');
        },
        onLevelAtts: [["adaptability", 300]],
        expAtts: [],
        efficiencyAtts: [["wizardry", .01]],
        unlockMessage: {english: "On unlock, set job to Clear The Basement for a base wage of $15b."},
        iconText: {
            english: Raw.html`
        Base Wage: $15b<br>
        On Level: Increase wage +50%
`
        }
    },
    moldBarsFromScrap: {
        tier: 1, plane: 0, creationVersion: 2,
        progressMaxBase: 1e44, progressMaxIncrease: 4,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .0002, maxLevel: 8,
        wage: 50e9,
        unlockCost: 1e44, visible: false, unlocked: false, purchased: false,
        onLevelCustom: function () {
            data.actions.moldBarsFromScrap.wage += actionData.moldBarsFromScrap.wage / 2;
            changeJob('moldBarsFromScrap');
        },
        onUnlock: function () {
            changeJob('moldBarsFromScrap');
        },
        onLevelAtts: [],
        expAtts: [],
        efficiencyAtts: [["wizardry", .01]],
        unlockMessage: {english: "On unlock, set job to Mold Bars From Scrap for a base wage of $50b."},
        iconText: {
            english: Raw.html`
        Base Wage: $50b<br>
        On Level: Increase wage +50%
`
        }
    },
    mendGearCracks: {
        tier: 1, plane: 0, creationVersion: 2,
        progressMaxBase: 1e47, progressMaxIncrease: 4,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .0001, maxLevel: 8,
        wage: 150e9,
        unlockCost: 1e47, visible: false, unlocked: false, purchased: false,
        onLevelCustom: function () {
            data.actions.mendGearCracks.wage += actionData.mendGearCracks.wage / 2;
            changeJob('mendGearCracks');
        },
        onUnlock: function () {
            changeJob('mendGearCracks');
        },
        onLevelAtts: [],
        expAtts: [],
        efficiencyAtts: [["wizardry", .01]],
        unlockMessage: {english: "On unlock, set job to Mend Gear Cracks for a base wage of $150b."},
        iconText: {
            english: Raw.html`
        Base Wage: $150b<br>
        On Level: Increase wage +50%
`
        }
    },
    assistantMagesmith: {
        tier: 1, plane: 0, creationVersion: 2,
        progressMaxBase: 1e50, progressMaxIncrease: 4,
        expToLevelBase: 10, expToLevelIncrease: 1,
        efficiencyBase: .00005, maxLevel: 8,
        wage: 250e9,
        unlockCost: 1e50, visible: false, unlocked: false, purchased: false,
        onLevelCustom: function () {
            data.actions.assistantMagesmith.wage += actionData.assistantMagesmith.wage / 2;
            changeJob('assistantMagesmith');
        },
        onUnlock: function () {
            changeJob('assistantMagesmith');
        },
        onLevelAtts: [],
        expAtts: [],
        efficiencyAtts: [["wizardry", .01]],
        unlockMessage: {english: "On unlock, set job to Apprentice Magesmith for a base wage of $250b."},
        iconText: {
            english: Raw.html`
        Base Wage: $250b<br>
        On Level: Increase wage +50%
`
        }
    },


}
