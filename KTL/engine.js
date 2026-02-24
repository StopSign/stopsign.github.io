let attTree = {};

function createAndLinkNewAttribute(attCategory, attVar) {
    if(!attTree[attCategory]) {
        attTree[attCategory] = [];
    }
    attTree[attCategory].push(attVar);

    if(!data.atts[attVar]) {
        data.atts[attVar] = {};
    }

    let attObj = data.atts[attVar];
    attObj.attVar = attVar;
    attObj.attCategory = attCategory;
    attObj.attUpgradeMult = 1;
    attObj.linkedActionExpAtts = [];
    attObj.linkedActionEfficiencyAtts = [];
    attObj.linkedActionOnLevelAtts = [];
    attObj.attBase = 0; //for upgrades
    attObj.attBase2 = 0; //for challenges

    attsSetBaseVariables(attObj);
    attObj.unlocked = false;
}

function attsSetBaseVariables(attObj) {
    attObj.num = attObj.attBase + attObj.attBase2;
    recalcAttMult(attObj.attVar);
}

//happens when the number/mult changes
function recalcAttMult(attVar) {
    let attObj = data.atts[attVar];
    if(attVar === "legacy") {
        attObj.attMult = 1;
        return;
    }
    attObj.attMult = Math.pow(10, attObj.num/100) * attObj.attUpgradeMult;
}

//Vars that should be reset each KTL
function actionSetBaseVariables(actionObj, dataObj) {
    actionObj.resource = 0;

    actionObj.progress = 0;
    actionObj.progressGain = 0; //calculated based on resource & tier
    actionObj.instability = 0;
    actionObj.progressMaxBase = dataObj.progressMaxBase ? dataObj.progressMaxBase : 1;
    actionObj.progressMaxMult = dataObj.progressMaxMult ? dataObj.progressMaxMult : 1;
    actionObj.progressMax = actionObj.progressMaxBase * actionObj.progressMaxMult * calcInstabilityEffect(actionObj.instability);
    actionObj.actionPowerBase = dataObj.actionPowerBase ? dataObj.actionPowerBase : 1;
    actionObj.actionPowerMult = dataObj.actionPowerMult ? dataObj.actionPowerMult : 1;
    actionObj.level = 0;
    actionObj.maxLevel = dataObj.maxLevel;
    actionObj.exp = 0;
    actionObj.expGain = 0;
    actionObj.power = dataObj.power ?? undefined;
    actionObj.expToLevelBase = dataObj.expToLevelBase ? dataObj.expToLevelBase : 1;
    actionObj.expToLevelMult = dataObj.expToLevelMult ? dataObj.expToLevelMult : 1;
    actionObj.expToLevel = actionObj.expToLevelBase * actionObj.expToLevelMult; //can be divided
    actionObj.resource = 0;
    actionObj.resourceDelta = 0;
    actionObj.resourceIncrease = 0;
    actionObj.resourceDecrease = 0;
    actionObj.resourceToAdd = dataObj.generatorSpeed ? 0 : undefined;
    actionObj.resourceIncreaseFromGens = 0;
    actionObj.totalSend = 0;
    actionObj.expToLevelIncrease = dataObj.expToLevelIncrease;
    actionObj.actionPowerMultIncrease = dataObj.actionPowerMultIncrease ? dataObj.actionPowerMultIncrease : 1;
    actionObj.progressMaxIncrease = dataObj.progressMaxIncrease;
    actionObj.visible = dataObj.visible === null ? true : dataObj.visible;
    actionObj.showResourceAdded = undefined;
    actionObj.showExpAdded = undefined;
    if(dataObj.isSpell) {
        actionObj.spellCastCount = 0;
    }

    actionObj.unlockTime = -1;
    actionObj.level1Time = -1;

    if(data.upgrades.recognizeTheFamiliarity.upgradePower > 0) {
        actionObj.unlockCost = (1 - (actionObj.unlockedCount * .04) / (1 + actionObj.unlockedCount * .04)) * dataObj.unlockCost;
    } else {
        actionObj.unlockCost = dataObj.unlockCost;
    }
    actionObj.unlockCost *= data.lichKills >= 1 ? 2 * data.lichKills : 1;

    actionObj.unlocked = dataObj.unlocked === null ? true : dataObj.unlocked;

    actionObj.isRunning = dataObj.plane !== 2; //for controlling whether time affects it
    actionObj.onLevelAtts = dataObj.onLevelAtts ? dataObj.onLevelAtts : [];
    actionObj.efficiencyAtts = dataObj.efficiencyAtts ? dataObj.efficiencyAtts : [];
    actionObj.expAtts = dataObj.expAtts ? dataObj.expAtts : [];
    actionObj.efficiencyBase = dataObj.efficiencyBase ? dataObj.efficiencyBase : 1; //1 = 100%
    actionObj.efficiencyMult = dataObj.efficiencyMult ? dataObj.efficiencyMult : 1;
    actionObj.expertise = actionObj.efficiencyBase * actionObj.efficiencyMult; //the initial and the multiplier (increases on stat add)
    actionObj.attReductionEffect = 1;
    actionObj.efficiencyMax = dataObj.efficiencyMax ? dataObj.efficiencyMax : 200;
    actionObj.efficiency = actionObj.expertise > dataObj.efficiencyMax  ? dataObj.efficiencyMax : actionObj.expertise * 100;

    actionObj.actionPower = actionObj.actionPowerBase * actionObj.actionPowerMult * (actionObj.efficiency/100);
    actionObj.wage = dataObj.wage ? dataObj.wage : undefined;


    actionObj.expToAddBase = 1;
    actionObj.expToAddMult = calcUpgradeMultToExp(actionObj.actionVar);
    actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;

    actionObj.upgradeMult = 1;
    if(dataObj.updateUpgradeMult) {
        dataObj.updateUpgradeMult();
    }
}

function actionSetInitialVariables(actionObj, dataObj) {
    //initialized from data, but modified and saved after that
    actionObj.cooldown = dataObj.cooldown;
    actionObj.purchased = !!dataObj.purchased;
    actionObj.lowestUnlockTime = undefined;
    actionObj.lowestLevel1Time = undefined;

    //Initialize once ever
    actionObj.cooldownTimer = 0; //when this is higher than cooldown it is ready
    actionObj.automationOnReveal = 0;
    actionObj.automationCanDisable = true;
    actionObj.currentMenu = "downstream";

    actionObj.hasBeenUnlocked = false;
    actionObj.unlockedCount = 0;

    actionObj.highestLevel = -1;
    actionObj.secondHighestLevel = -1;
    actionObj.thirdHighestLevel = -1;
}

function createAndLinkNewAction(actionVar, dataObj, downstreamVars) {
    data.actions[actionVar] = {};

    let actionObj = data.actions[actionVar];
    actionObj.actionVar = actionVar;
    dataObj.downstreamVars = downstreamVars ? downstreamVars : [];

    actionSetInitialVariables(actionObj, dataObj);
    actionSetBaseVariables(actionObj, dataObj);

    for(let downstreamVar of dataObj.downstreamVars) {
        actionObj[downstreamVar+"TempFocusMult"] = 2;
        actionObj[downstreamVar+"PermFocusMult"] = 1;
        actionObj[`downstreamRate${downstreamVar}`] = 0;
    }

    return actionObj;
}

function calcProgressRateReal(actionVar) {
    let actionObj = data.actions[actionVar];
    let dataObj = actionData[actionVar];

    return actionObj.resource * calcTierMult(dataObj.tier) * (actionObj.efficiency/100) / data.gameSettings.ticksPerSecond;
}

function calcStatMult(actionVar) {
    let actionObj = data.actions[actionVar];
    let dataObj = actionData[actionVar];

    actionObj.expToLevelMult = 1;
    actionObj.progressMaxMult = 1;
    let totalEffect = 1;
    dataObj.expAtts.forEach(function(expStat) {
        let name = expStat[0];
        let ratio = expStat[1];
        if(!data.atts[name]) {
            console.log("need to instantiate " + name);
            return;
        }

        let effect = Math.pow(10, data.atts[name].num * ratio/100) * data.atts[name].attUpgradeMult;
        actionObj[name+"AttExpMult"] = effect;
        totalEffect *= effect;
    })
    actionObj.attReductionEffect = totalEffect;
    if(dataObj.isGenerator) {
        actionObj.expToLevelMult = 1/totalEffect;
        actionObj.expToLevel = actionObj.expToLevelBase * actionObj.expToLevelMult;
    } else {
        actionObj.progressMaxMult = 1/totalEffect;
        actionObj.progressMax = actionObj.progressMaxBase * actionObj.progressMaxMult * calcInstabilityEffect(actionObj.instability);
    }
    actionObj.actionPower = actionObj.actionPowerBase * actionObj.actionPowerMult * (actionObj.efficiency/100);
}

function calcAttExpertise(actionVar) {
    let actionObj = data.actions[actionVar];
    // let dataObj = actionData[actionVar];

    let sumIdeals = 0;
    for(let expertiseAtt of actionObj.efficiencyAtts) {
        sumIdeals += expertiseAtt[1];
    }

    let progressMult = 1;
    let zeroIdealPenalty = 0;
    for(let expertiseAtt of actionObj.efficiencyAtts) {
        let name = expertiseAtt[0];
        let ideal = expertiseAtt[1];

        if(!data.atts[name]) {
            console.log(`You need to instantiate the attribute ${name}`);
            continue;
        }

        let val = data.atts[name].num;

        if (ideal === 0) {
            if(val < 0) {
                zeroIdealPenalty += Math.abs(val) / 100;
            }
        } else {
            if(val > ideal) {
                val = ideal;
            }
            let progress = (val - (ideal - sumIdeals)) / sumIdeals;
            if (progress < 0) progress = 0;
            if (progress > 1) progress = 1;
            progressMult *= progress;
        }
    }

    let totalExponent = (1 - progressMult) + zeroIdealPenalty;
    actionObj.expertise = Math.pow(actionObj.efficiencyBase, totalExponent);
    actionObj.efficiency = actionObj.expertise * 100;
}

function calcTierMult(tier) {
    return 1/Math.pow(10, tier) / 10;
}

function isAttentionLine(actionVar, downstreamVar) {
    for(let focusObj of data.focusSelected) {
        if(focusObj.lineData.from === actionVar && focusObj.lineData.to === downstreamVar) {
            return true;
        }
    }
    return false;
}

function checkLevelUp(actionObj, dataObj) {
    let isMaxLevel = actionObj.maxLevel !== undefined && actionObj.level >= actionObj.maxLevel;
    if(isMaxLevel || actionObj.exp < actionObj.expToLevel) {
        return false;
    }

    if(dataObj.isGenerator) {
        actionObj.exp -= actionObj.expToLevel;
    } else {
        actionObj.exp = 0;
    }
    if(actionObj.level1Time < 0 && (dataObj.plane === 1 || actionObj.actionVar === "hearAboutTheLich")) {
        actionObj.level1Time = data.secondsPerReset;
        if(actionObj.lowestLevel1Time === undefined || actionObj.lowestLevel1Time > actionObj.level1Time) {
            actionObj.lowestLevel1Time = actionObj.level1Time;
        }
    }
    actionObj.level++;
    actionObj.progressMaxBase *= dataObj.progressMaxIncrease;
    actionObj.progressMax = actionObj.progressMaxBase * actionObj.progressMaxMult * calcInstabilityEffect(actionObj.instability);
    actionObj.expToLevelBase *= actionObj.expToLevelIncrease;
    actionObj.expToLevel = actionObj.expToLevelBase * actionObj.expToLevelMult;
    actionObj.actionPowerMult *= actionObj.actionPowerMultIncrease;

    //power = base * mult * efficiency
    actionObj.actionPower = actionObj.actionPowerBase * actionObj.actionPowerMult * (actionObj.efficiency/100);

    dataObj.onLevelAtts.forEach(function (attObj) {
        let name = attObj[0];
        let amount = attObj[1];
        if(!data.atts[name]) {
            console.log('The stat ' + name + ' doesnt exist');
        }
        statAddAmount(name, amount);
    });

    for(let actionTrigger of dataObj.actionTriggers) {
        let when = actionTrigger[0];
        let type = actionTrigger[1];
        let info = actionTrigger[2];
        let extra = actionTrigger[3]; //used for numbers

        if(when.indexOf("level_") >= 0) {
            let level = parseInt(when.substring("level_".length));
            if(actionObj.level >= level) {
                actionTriggerHelper(type, info, extra);
            }
        } else if(when === "level") {
            actionTriggerHelper(type, info, extra);
        }
    }
    checkIncomingTriggers(actionObj.actionVar);

    if(dataObj.wage > 0) {
        actionObj.wage += dataObj.wage / 2;
        changeJob(actionObj.actionVar);
    }
    if(dataObj.onLevelCustom) {
        dataObj.onLevelCustom();
    }

    let isNowMaxLevel = actionObj.maxLevel !== undefined && actionObj.level >= actionObj.maxLevel;
    if (isNowMaxLevel) {
        disableAutomationUpwards(actionObj.actionVar);
    }

    return true;
}

function actionTriggerHelper(type, info, extra) {
    if(type === "reveal") {
        revealAction(info);
    } else if(type === "purchase") {
        purchaseAction(info);
    } else if(type === "unlock") {
        unlockAction(data.actions[info]);
    } else if(type === "addMaxLevels") {
        addMaxLevel(info, extra)
    } else if(type === "revealUpgrade") {
        revealUpgrade(info)
    } else if(type === "addLegacy") {
        let legacyAmount = 1;
        if(info) {
            legacyAmount += data.actions[info].level/5;
        }
        legacyAmount *= extra;
        statAddAmount("legacy", legacyAmount);
    } else if(type === "addAC") {
        let ACAmount = extra * (data.upgrades.listenCloserToWhispers.upgradePower === 1?3:1);
        if (data.gameState === "KTL") {
            data.ancientCoin += ACAmount * data.ancientCoinMultKTL;
            data.ancientCoinGained += ACAmount * data.ancientCoinMultKTL;
        } else {
            data.ancientCoin += ACAmount;
        }
    } else if(type === "addAW") {
        let AWAmount = extra * (data.upgrades.listenCloserToWhispers.upgradePower === 1?3:1) * (1 + data.lichKills/2);
        if (data.gameState === "KTL") {
            data.ancientWhisper += AWAmount * data.ancientWhisperMultKTL;
            data.ancientWhisperGained += AWAmount * data.ancientWhisperMultKTL;
        } else {
            data.ancientWhisper += AWAmount;
        }
    }
}

function actionAddExp(actionObj, exp) {
    actionObj.exp += exp;
    let dataObj = actionData[actionObj.actionVar];

    for (let i = 0; i < 10 / (data.gameSettings.ticksPerSecond / 20); i++) {
        if (!checkLevelUp(actionObj, dataObj)) {
            break;
        }
    }
}

function resetRun() {
    //essentially an amulet use but without gain
    //also on amulet use needs to save the state of anything that can be perma-gained during the run:
    //legacy&highest, infusion 2 actions, infusion unlock costs, KTL log, perma-focus
    //then revert to this state

    //Gain 1 free use every 48 hours, start with 2
    //can't use on first reset

}

function calcTimeToUnlock(actionVar) {

}

function calcTimeToLevel(actionObj) {
    let timeToFinishCurrentCycle = (actionObj.progressMax - actionObj.progress) / actionObj.progressGain;
    let expAfterCurrentCycle = actionObj.exp + actionObj.expToAdd;
    let remainingExpNeeded = Math.max(0, actionObj.expToLevel - expAfterCurrentCycle);
    let fullCyclesNeeded = Math.ceil(remainingExpNeeded / actionObj.expToAdd);
    let timePerFullCycle = actionObj.progressMax / actionObj.progressGain;
    return timeToFinishCurrentCycle + (fullCyclesNeeded * timePerFullCycle);
}
function calcTimeToMax(actionVar) {
    let actionObj = data.actions[actionVar];

    // 1. Sanitize Milestones
    // Filter invalid (-1), past, or out-of-bounds milestones
    let rawMilestones = [
        actionObj.thirdHighestLevel,
        actionObj.secondHighestLevel,
        actionObj.highestLevel
    ];

    let milestones = rawMilestones
        .filter(m => m > actionObj.level && m < actionObj.maxLevel)
        .sort((a, b) => a - b);

    // Always finish at maxLevel
    milestones.push(actionObj.maxLevel);
    milestones = [...new Set(milestones)];

    // 2. Setup Simulation Variables
    let totalTime = 0;

    let vLevel = actionObj.level;
    let vExp = actionObj.exp;
    let vProgress = actionObj.progress;
    let vProgressMax = actionObj.progressMax;
    let vExpToLevel = actionObj.expToLevel;

    // 3. Loop through stages
    for (let targetLevel of milestones) {
        let levelsToJump = targetLevel - vLevel;
        if (levelsToJump <= 0) continue;

        let expMult = calcUpgradeMultToExp(actionVar, vLevel);

        let baseExp = actionObj.expToAddBase !== undefined ? actionObj.expToAddBase : (actionObj.expToAdd / actionObj.expToAddMult);
        let effectiveExpAdd = baseExp * expMult;

        // A. Time for the VERY NEXT level (handles partial progress)
        let t1 = getTimeForSingleLevel(
            vProgress, vProgressMax,
            vExp, vExpToLevel,
            effectiveExpAdd, actionObj.progressGain,
            actionObj.isGenerator
        );
        totalTime += t1;

        if (!isFinite(totalTime)) return Infinity;

        // B. Geometric Series for the REST of the levels in this stage
        let remainingLevels = levelsToJump - 1;

        if (remainingLevels > 0) {
            let rp = actionObj.progressMaxIncrease;
            let re = actionObj.expToLevelIncrease;
            let R = rp * re;

            // Scale up for the start of the series (Level + 1)
            let nextPMax = vProgressMax * rp;
            let nextEToL = vExpToLevel * re;

            let completionsNeeded = actionObj.isGenerator
                ? nextEToL / effectiveExpAdd
                : Math.ceil(nextEToL / effectiveExpAdd);

            let timePerBar = nextPMax / actionObj.progressGain;
            let a = completionsNeeded * timePerBar;

            let timeForSeries = 0;
            if (R === 1) {
                timeForSeries = a * remainingLevels;
            } else {
                let geometricTerm = Math.pow(R, remainingLevels);
                if (!isFinite(geometricTerm)) return Infinity;
                timeForSeries = a * (geometricTerm - 1) / (R - 1);
            }
            totalTime += timeForSeries;
        }

        // C. Update Virtual State for next stage
        let scaleFactorP = Math.pow(actionObj.progressMaxIncrease, levelsToJump);
        let scaleFactorE = Math.pow(actionObj.expToLevelIncrease, levelsToJump);

        vProgressMax *= scaleFactorP;
        vExpToLevel *= scaleFactorE;
        vLevel = targetLevel;
        vProgress = 0;
        vExp = 0;
    }

    return totalTime;
}

function getTimeForSingleLevel(progress, pMax, exp, eToLevel, eAdd, pGain, isGenerator) {
    let timeToFinishBar = (pMax - progress) / pGain;

    let expAfterBar = exp + eAdd;
    let expRemaining = Math.max(0, eToLevel - expAfterBar);

    let barsNeeded = 0;
    if (isGenerator) {
        // Generators don't waste overflow exp
        barsNeeded = expRemaining / eAdd;
    } else {
        // Normal actions need full completions
        barsNeeded = Math.ceil(expRemaining / eAdd);
    }

    let timeForExtraBars = barsNeeded * (pMax / pGain);
    return timeToFinishBar + timeForExtraBars;
}

function calcUpgradeMultToExp(actionVar, level) {
    let actionObj = data.actions[actionVar];
    let dataObj = actionData[actionVar];
    if(!level) {
        level = actionObj.level;
    }
    if(dataObj.plane === 2 || dataObj.isSpell) return 1;

    let mult = 1;
    // Standard checks. If highestLevel is -1, (level < -1) is false, so it works safely.
    if(data.upgrades.rememberWhatIDid.isFullyBought && level < actionObj.highestLevel) mult += .25;
    if(data.upgrades.rememberHowIGrew.isFullyBought && level < actionObj.secondHighestLevel) mult += .25;
    if(data.upgrades.rememberMyMastery.isFullyBought && level < actionObj.thirdHighestLevel) mult += .5;
    return mult;
}















function addLegacy(amount) {
    let roomToHighest = Math.max(0, data.highestLegacy - data.legacy);
    let amountToTriple = Math.min(amount, roomToHighest / 3);
    let remainingAmount = amount - amountToTriple;
    let gain = (amountToTriple * 3) + remainingAmount;
    data.legacy += gain;
}

function statAddAmount(attVar, amount) {
    let attObj = data.atts[attVar];
    if(attVar === "legacy") {
        if(data.gameState === "KTL") {
            amount *= data.legacyMultKTL;
        } else if(data.upgrades.feelTheDefeats.upgradePower > 0) {
            amount *= data.atts.resonance.attMult;
        }
        amount *= (data.upgrades.makeADeeperImpact.upgradePower===1?3:1);
        addLegacy(amount) //x3 up to prev highest
        data.actions.echoKindle.resource = data.legacy;
        if(data.legacy > data.highestLegacy) {
            data.highestLegacy = data.legacy;
        }
    }
    if(!attObj) {
        console.log("Tried to add to a stat that doesn't exist: " + attVar);
    }
    attObj.num += amount;
    recalcAttMult(attVar);
    let changedActions = []
    attObj.linkedActionExpAtts.forEach(function (actionVar) {
        calcStatMult(actionVar);
        changedActions.push(actionVar);
    })
    attObj.linkedActionEfficiencyAtts.forEach(function (actionVar) {
        calcAttExpertise(actionVar);
        changedActions.push(actionVar);
    })

    //update the actions that had their stats changed
    for(let actionVar of changedActions) {
        let actionObj = actionData[actionVar];
        if(actionObj.updateMults) {
            actionObj.updateMults();
        }
    }
}

function actionUpdateAllStatMults() {
    for(let actionVar in data.actions) {
        // let actionObj = data.actions[actionVar];
        calcStatMult(actionVar);
        calcAttExpertise(actionVar);
    }
}

//prepares the action to be unlocked during the loop next round
function purchaseAction(actionVar) {
    let actionObj = data.actions[actionVar];
    if(!actionObj) {
        console.log('tried to purchase ' + actionVar + ' in error.');
        return;
    }
    if(actionObj.purchased) {
        return;
    }
    actionObj.purchased = true;

    addLogMessage(actionVar, "purchaseAction")
}





function revealAction(actionVar) {
    let actionObj = data.actions[actionVar];
    let dataObj = actionData[actionVar];
    if(!actionObj) {
        console.log('tried to unveil ' + actionVar + ' in error.');

        return;
    }
    if (actionObj.visible || !actionObj.purchased) {
        return;
    }
    //don't let it be visible, but check once a second if it's allowed to be visible
    if(dataObj.hasUpstream && !data.actions[dataObj.parentVar].visible) {
        data.queuedReveals[actionVar] = true;
        return;
    }

    addLogMessage(actionVar, "unlockAction")

    actionObj.visible = true;
    revealAttsOnAction(actionObj);

    enableAutomationUpwards(actionVar);
}


function revealUpgrade(upgradeVar) {
    let upgradeObj = data.upgrades[upgradeVar];
    if(upgradeObj.visible) {
        return;
    }
    upgradeObj.visible = true;
    views.updateVal(`card_${upgradeVar}`, "flex", "style.display");

    addLogMessage(upgradeVar, "purchaseUpgrade")
}

function addMaxLevel(actionVar, amount) {
    data.actions[actionVar].maxLevel += amount;

    if(data.actions[actionVar].visible) {
        enableAutomationUpwards(actionVar);
    }
}

//Handling automationOnReveal behavior - thanks obliv for the algorithm
//Triggered when action is revealed, max level increased, or level decreased (charges used)
function enableAutomationUpwards(actionVar, isForced) {
    if(data.upgrades.stopLettingOpportunityWait.upgradePower === 0 || actionData[actionVar].plane === 2) {
        return;
    }

    //If target node’s “enable” automation slider is off, or if the node is being revealed for the very first time ever, then do nothing.
    //This is not part of the loop. We don’t check the slider for any upstream actions.
    if(!isForced && (data.actions[actionVar].automationOnReveal === 0 || !data.actions[actionVar].hasBeenUnlocked)) {
        return;
    }

    let currentTarget = actionVar;
    //Start of loop. If target node is a root node (Overclock, Pool Mana), then break the loop.
    while(actionData[currentTarget].hasUpstream || actionData[currentTarget].keepParentAutomation) {
        let actionObj = data.actions[currentTarget];
        let dataObj = actionData[currentTarget];

        let parentVar = dataObj.parentVar;
        let parentObj = data.actions[parentVar];

        //If the slider from the upstream node is exactly zero, then update it to the automation default value. Use the current target node’s Temper My Desires slider if unlocked and not zero. Otherwise, it’s a fixed 50% or 100% based on amulet perks.
        if(dataObj.hasUpstream && parentObj[`downstreamRate${currentTarget}`] === 0) {
            setSliderUI(parentVar, currentTarget, isForced?100:actionObj.automationOnReveal)
        }

        //Change target node to the upstream node (where the send slider may have changed). Loop again
        currentTarget = parentVar
    }
}

//Handling automationCanDisable behavior - thanks obliv for the algorithm
//Triggered when an action reaches max level.
function disableAutomationUpwards(actionVar, isForced) {
    if(data.upgrades.knowWhenToMoveOn.upgradePower === 0 || actionData[actionVar].plane === 2) {
        return;
    }

    if(isForced) {
        if(actionData[actionVar].hasUpstream) {
            setSliderUI(actionData[actionVar].parentVar, actionVar, 0);
        }
        if(actionData[actionVar].hasUpstream || actionData[actionVar].keepParentAutomation) {
            disableAutomationUpwards(actionData[actionVar].parentVar)
        }
    }

    let currentTarget = actionVar;
    //Start of loop. If target is a root node (Overclock, Pool Mana) then stop the loop.
    while(actionData[currentTarget].hasUpstream || actionData[currentTarget].keepParentAutomation) {
        let actionObj = data.actions[currentTarget];
        let dataObj = actionData[currentTarget];

        //If the automation slider to disable the target node at max level is disabled, then stop the loop.
        if (!actionObj.automationCanDisable) {
            return;
        }

        //If the automation slider to disable the target node at max level is disabled, then stop the loop.
        const hasMaxLevel = actionObj.maxLevel !== undefined;
        if (hasMaxLevel && !actionObj.automationCanDisable) {
            return;
        }

        //If this node has a max level but has not yet reached it, then stop the loop.
        if (hasMaxLevel && actionObj.level < actionObj.maxLevel) {
            return;
        }

        //If the upstream send rate slider is already 0%, then stop the loop.
        let parentVar = dataObj.parentVar;
        if (dataObj.hasUpstream && data.actions[parentVar][`downstreamRate${currentTarget}`] === 0) {
            return;
        }

        for (const downstreamVar of dataObj.downstreamVars) {
            const downstreamObj = data.actions[downstreamVar];
            let downstreamDataObj = actionData[downstreamVar];
            if(!downstreamObj) {
                console.log(`error on downstream ${downstreamVar} of ${currentTarget}`)
            }

            if (!downstreamObj.visible) {
                continue;
            }
            if (downstreamDataObj.keepParentAutomation) {
                const hasMaxLevel = downstreamObj.maxLevel !== undefined;
                // If downstream target has been prohibited from being disabled then stop the loop.
                if (hasMaxLevel && !downstreamObj.automationCanDisable) {
                    return;
                }
                // If downstream target is an action with a maximum level that isn't at level cap then stop the loop.
                if (!isForced && hasMaxLevel && downstreamObj.level < downstreamObj.maxLevel) {
                    return;
                }
            }
            //If target has ANY enabled downstream path (slider set to a nonzero value), then stop the loop.
            else if (actionObj[`downstreamRate${downstreamVar}`] > 0) {
                return;
            }
        }

        // All checks passed. Set the send rate slider from the upstream node to 0%.
        if(dataObj.hasUpstream) {
            setSliderUI(dataObj.parentVar, currentTarget, 0);
        }

        // Change the target node to the upstream node (the one whose downstream slider we just changed) and go to 2.
        currentTarget = dataObj.parentVar;
    }
}

function revealAttsOnAction(actionObj) {
    for(let onLevelAtt of actionObj.onLevelAtts) {
        revealAtt(onLevelAtt[0]);
    }
}

function revealAtt(attVar) {
    // console.log(attVar);
    let attObj = data.atts[attVar];
    attObj.unlocked = true; //sets the side menu

    for (let actionVar of attObj.linkedActionExpAtts) {
        views.updateVal(`${actionVar}${attVar}OutsideContainerexp`, "", "style.display");
        views.updateVal(`${actionVar}${attVar}InsideContainerexp`, "", "style.display");
        views.updateVal(`${actionVar}AttExpContainer`, "", "style.display");
    }
    for (let actionVar of attObj.linkedActionEfficiencyAtts) {
        views.updateVal(`${actionVar}${attVar}OutsideContainereff`, "", "style.display");
        // views.updateVal(`${actionVar}${attVar}InsideContainereff`, "", "style.display");
        // views.updateVal(`${actionVar}AttEfficiencyContainer`, "", "style.display");
    }
    for(let actionVar of attObj.linkedActionOnLevelAtts) {
        views.updateVal(`${actionVar}AttOnLevelContainer`, "", "style.display");
    }

    showAttColors(attVar);

    for (let attCategory in attTree) {
        if (attTree[attCategory].includes(attVar)) {
            views.updateVal(`${attCategory}CategoryContainer`, "", "style.display");
        }
    }
}

function unlockAction(actionObj) {
    let actionVar = actionObj.actionVar;
    let dataObj = actionData[actionVar];
    if(actionObj.unlocked === true) {
        return;
    }
    actionObj.hasBeenUnlocked = true;
    actionObj.unlocked = true;
    actionObj.unlockedCount++;
    actionObj.unlockCost = 0;
    if(dataObj.plane === 2) {
        actionObj.unlockTime = data.NWSeconds;
    } else if(dataObj.plane !== 1) {
        actionObj.unlockTime = data.secondsPerReset; //mark when it unlocked
    }
    if(actionObj.lowestUnlockTime === undefined || actionObj.lowestUnlockTime > actionObj.unlockTime) {
        actionObj.lowestUnlockTime = actionObj.unlockTime;
    }



    for(let actionTrigger of dataObj.actionTriggers) {
        let when = actionTrigger[0];
        let type = actionTrigger[1];
        let info = actionTrigger[2];
        let extra = actionTrigger[3]; //used for numbers

        if(when === "unlock") {
            actionTriggerHelper(type, info, extra);
        }
    }

    checkIncomingTriggers(actionVar);

    if(dataObj.wage > 0) {
        changeJob(actionObj.actionVar);
    }

    if(dataObj.onUnlock) {
        dataObj.onUnlock();
    }

    for(let onLevelObj of dataObj.onLevelAtts) {
        showAttColors(onLevelObj[0]);
    }
    for(let onLevelObj of dataObj.expAtts) {
        showAttColors(onLevelObj[0]);
    }
    for(let onLevelObj of dataObj.efficiencyAtts) {
        showAttColors(onLevelObj[0]);
    }
}

function upgradeUpdates() {
    //every tick, make sure the mults are updated for visuals
    for(let actionVar in actionData) {
        let actionObj = actionData[actionVar];
        if(actionObj.updateMults) {
            actionObj.updateMults();
        }
    }

    //passive gain
    if(data.upgrades.startALittleQuicker.upgradePower > 0) {
        data.actions.overclock.resource += 50 * Math.pow(4, data.upgrades.startALittleQuicker.upgradePower-1) / data.gameSettings.ticksPerSecond
    }
    if(data.upgrades.pickUpValuablePlants.upgradePower > 0) {
        addResourceTo(data.actions.spendMoney, 5 * Math.pow(4, data.upgrades.pickUpValuablePlants.upgradePower-1) / data.gameSettings.ticksPerSecond)
    }
    if(data.upgrades.startCasualChats.upgradePower > 0) {
        addResourceTo(data.actions.meetPeople, Math.pow(2, data.upgrades.startCasualChats.upgradePower-1) / data.gameSettings.ticksPerSecond)
    }

    // if(data.upgrades.keepMyMagicReady.upgradePower) {
        // saveMaxChargedSpellPowers();
        // data.maxSpellPower = getTotalMaxChargedSpellPower();
    // } else {
        // data.maxSpellPower = getActiveSpellPower(true);
    // }
}

function isSpellReady(actionVar) {
    let actionObj = data.actions[actionVar];
    return actionObj.level > 0 && !actionObj.isPaused && (!actionObj.cooldown || actionObj.cooldownTimer >= actionObj.cooldown);
}

function useCharge(actionVar) {
    let actionObj = data.actions[actionVar];
    let dataObj = actionData[actionVar]

    actionObj.level--;
    actionObj.instability += dataObj.instabilityToAdd / (actionObj.efficiency/100);
    actionObj.spellCastCount++;

    if(actionObj.cooldown) {
        actionObj.cooldownTimer = 0;
    }

    data.actions.castingExperience.resource += Math.pow(dataObj.circle + 1, 4);

    enableAutomationUpwards(actionVar);

    return dataObj.spellPower();
}


function useActiveSpellCharges(school) {
    let spellPowerUsed = 0;
    for(let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        let dataObj = actionData[actionVar];
        if(dataObj.isSpell && dataObj.school === school && actionObj.level > 0 && !actionObj.isPaused ) {
            spellPowerUsed += useCharge(actionVar);
        }
    }
    return spellPowerUsed;
}

const bonusCodes = {};
function addBonusCode(code, rewardFunction, message = "") {
    const trimmed = code.trim().replace(/^"+|"+$/g, "");
    bonusCodes[trimmed] = { reward: rewardFunction, message };
}

function applyBonusCode() {
    const input = document.getElementById("bonusCodeInput");
    const message = document.getElementById("bonusCodeMessage");

    let code = input.value.trim();
    if (code.startsWith('"') && code.endsWith('"')) {
        code = code.slice(1, -1).trim();
    }

    const bonus = bonusCodes[code];

    if (!bonus) {
        message.style.color = "red";
        message.textContent = "Invalid code.";
        return;
    }

    if (data.gameSettings.redeemedBonusCodes[code]) {
        message.style.color = "red";
        message.textContent = "Code already used.";
        return;
    }

    bonus.reward();
    data.gameSettings.redeemedBonusCodes[code] = true;

    message.style.color = "green";
    message.textContent = `Success! Bonus applied. ${bonus.message}`;
}

addBonusCode("link", function () {
    data.currentGameState.bonusTime += 1000 * 60 * 60;
}, "You received 1 hour of bonus time!");

addBonusCode("gift", function () {
    data.currentGameState.bonusTime += 1000 * 60 * 60;
}, "Enjoy this 1-hour gift of bonus time!");

addBonusCode("book", function () {
    data.currentGameState.bonusTime += 1000 * 60 * 30;
}, "Thanks for reading! Here’s 30 bonus minutes.");

addBonusCode("sorry!", function () {
    data.currentGameState.bonusTime += 1000 * 60 * 60 * 12;
}, "Sorry about that! You’ve received 12 hours of bonus time.");

addBonusCode("trythis1", function () {
    data.currentGameState.bonusTime += 1000 * 60 * 60 * 24;
}, "Does this work? You got 24 hours of bonus time.");


addBonusCode("loopers", function () {
    data.currentGameState.bonusTime += 1000 * 60 * 60 * 24;
}, "Thank you for everything!");
addBonusCode("squirrel", function () {
    data.currentGameState.bonusTime += 1000 * 60 * 60 * 10;
}, "Nuts!");
addBonusCode("nothing", function () {
    data.currentGameState.bonusTime += 1000 * 60 * 60;
}, "There was nothing there - except 1 hour bonus time.");

function checkGrimoireUnlocks() {
    //unlock relevant circle magic per level
    if(data.actions.awakenYourGrimoire.unlocked) {
        revealAction("overcharge")
        revealAction("prepareInternalSpells")
        revealAction("castingExperience")
        unlockAction(data.actions.castingExperience);
        revealAction("threadArcana")
        revealAction("prepareSpells")
    }
    if(data.actions.awakenYourGrimoire.level >= 1) {
        revealAction("overwork")
        revealAction("overtalk")
    }
    if(data.actions.awakenYourGrimoire.level >= 2) {
        revealAction("overboost")
    }
    if(data.actions.awakenYourGrimoire.level >= 3) {
        revealAction("overproduce")
        revealAction("overhear")
    }
    if(data.actions.awakenYourGrimoire.level >= 4) {
        revealAction("overponder")
    }
    if(data.actions.awakenYourGrimoire.level >= 5) {
        revealAction("overdrive")
    }
    if(data.actions.awakenYourGrimoire.level >= 6) {
        revealAction("overhype")
    }
    // if(data.actions.awakenYourGrimoire.level >= 7) {
    //     revealAction("overanalyze")
    // }
    // if(data.actions.awakenYourGrimoire.level >= 8) {
    //     revealAction("overpush")
    // }

    // revealAction("castDirtMagic")
    // revealAction("createMounds")
    // //start with the above 2, get the following some other way
    // revealAction("castIronMagic")
    // revealAction("mendSmallCracks")
    // revealAction("castRecoverMagic")
    // revealAction("unblemish")
    // revealAction("castPracticalMagic")
    // revealAction("illuminate")
}


//function to be used as a debug helper, running in console
//adjustActionData('', 'progressMaxBase', 1e6)
//adjustActionData('', 'efficiencyBase', .1)
function adjustActionData(actionVar, key, value) {
    let actionObj = data.actions[actionVar];
    actionObj[key] = value;
    if(['progressMaxBase', 'progressMaxMult'].includes(key)) {
        actionObj.progressMax = actionObj.progressMaxBase * actionObj.progressMaxMult * calcInstabilityEffect(actionObj.instability);
    }
    if(['efficiencyBase', 'efficiencyMult'].includes(key)) {
        calcAttExpertise(actionVar);
        actionObj.actionPower = actionObj.actionPowerBase * actionObj.actionPowerMult * (actionObj.efficiency/100);
    }
}



// --- 1. Initialization (Run on Game Load) ---
function rebuildDependencyCache() {
    // 1. Reset all cache arrays first
    for (let key in data.actions) {
        data.actions[key].listeningActions = [];
    }

    // 2. Build the graph
    for (let sourceKey in data.actions) {
        const triggers = data.actions[sourceKey].customTriggers;
        if (triggers && triggers.length > 0) {
            triggers.forEach(trigger => {
                // Register the source as a listener on the target
                registerListener(trigger.targetKey, sourceKey);
            });
        }
    }
}

// --- 2. Helper: Add Listener (prevent duplicates) ---
function registerListener(targetKey, sourceKey) {
    const targetObj = data.actions[targetKey];
    if (!targetObj.listeningActions) targetObj.listeningActions = [];

    // Only push if not already there
    if (!targetObj.listeningActions.includes(sourceKey)) {
        targetObj.listeningActions.push(sourceKey);
    }
}

// --- 3. Helper: Remove Listener (Cleanup) ---
function unregisterListener(targetKey, sourceKey) {
    const targetObj = data.actions[targetKey];
    if (!targetObj || !targetObj.listeningActions) return;

    // Check if the source actually has ANY remaining triggers pointing to this target
    // We don't want to remove the listener if there is still another trigger on the same action using this target
    const sourceObj = data.actions[sourceKey];
    const stillHasConnection = sourceObj.customTriggers.some(t => t.targetKey === targetKey);

    if (!stillHasConnection) {
        // Remove from array
        targetObj.listeningActions = targetObj.listeningActions.filter(key => key !== sourceKey);
    }
}

function checkIncomingTriggers(targetActionVar) {
    const targetObj = data.actions[targetActionVar];

    if (!targetObj.listeningActions || targetObj.listeningActions.length === 0) {
        return;
    }

    // Loop ONLY through the actions that are watching this one
    targetObj.listeningActions.forEach(sourceKey => {
        const sourceObj = data.actions[sourceKey];

        // Loop through the source's triggers to find the match
        if(sourceObj.customTriggers) {
            sourceObj.customTriggers.forEach(trigger => {
                if (trigger.targetKey === targetActionVar) {
                    evaluateTrigger(sourceKey, trigger, targetObj);
                }
            });
        }
    });
}

function evaluateTrigger(actionVar, trigger, targetObj) {
    let shouldRun = false;

    if (trigger.condition === 'unlocked') {
        if (!trigger.hasFired && targetObj.unlocked) {
            shouldRun = true;
            trigger.hasFired = true;
        }
    }
    else if (trigger.condition === 'max') {
        if (!trigger.hasFired && targetObj.level >= targetObj.maxLevel) {
            shouldRun = true;
            trigger.hasFired = true;
        }
    }
    else if (trigger.condition === 'specific') {
        if (!trigger.hasFired && targetObj.level >= trigger.amount) {
            shouldRun = true;
            trigger.hasFired = true;
        }
    }

    // Execute Reward
    if (shouldRun) {
        // console.log(`Trigger Fired! ${trigger.condition}${trigger.condition==="specific"?" " +trigger.amount:""} of ${trigger.targetKey} occured. ${actionVar} adjusted to ${trigger.rewardText}`);

        let actionObj = data.actions[actionVar];
        let dataObj = actionData[actionVar];
        let parentVar = dataObj.parentVar;

        if(dataObj.hasUpstream) {
            if(!trigger.recurse) {
                setSliderUI(parentVar, actionVar, trigger.rewardVal);
            } else {
                if(trigger.rewardVal > 0) {
                    enableAutomationUpwards(actionVar, true)
                    setSliderUI(parentVar, actionVar, trigger.rewardVal);
                } else {
                    disableAutomationUpwards(actionVar, true)
                }
            }
        }
    }
}