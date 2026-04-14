

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
    actionObj.resourceRetrieved = 0;
    actionObj.resourceToAdd = dataObj.generatorSpeed ? 0 : undefined;
    actionObj.totalSend = 0;
    actionObj.expToLevelIncrease = dataObj.expToLevelIncrease;
    actionObj.actionPowerMultIncrease = dataObj.actionPowerMultIncrease ? dataObj.actionPowerMultIncrease : 1;
    actionObj.progressMaxIncrease = dataObj.progressMaxIncrease;
    actionObj.visible = dataObj.visible === null ? true : dataObj.visible;
    actionObj.showResourceAdded = undefined;
    actionObj.showExpAdded = undefined;
    actionObj.currentCustomNum = 0;
    if(dataObj.isSpell) {
        actionObj.spellCastCount = 0;
    }

    actionObj.unlockTime = -1;
    actionObj.level1Time = -1;

    actionObj.unlockCost = dataObj.unlockCost
        * Math.pow(.9, data.upgrades.reducedUnlockCosts.upgradePower)
        * (data.upgrades.recognizeTheFamiliarity.upgradePower > 0 ? (1 - (actionObj.unlockedCount * .04) / (1 + actionObj.unlockedCount * .04)) : 1)
        * (data.lichKills >= 1 ? 2 * data.lichKills : 1);

    actionObj.unlocked = dataObj.unlocked === null ? true : dataObj.unlocked;

    actionObj.isRunning = dataObj.plane !== 2; //for controlling whether time affects it
    actionObj.onLevelAtts = dataObj.onLevelAtts ? dataObj.onLevelAtts : [];
    actionObj.efficiencyAtts = dataObj.efficiencyAtts ? dataObj.efficiencyAtts : [];
    actionObj.expAtts = dataObj.expAtts ? dataObj.expAtts : [];
    actionObj.efficiencyBase = dataObj.efficiencyBase ? dataObj.efficiencyBase : 1; //1 = 100%
    actionObj.efficiencyMult = dataObj.efficiencyMult ? dataObj.efficiencyMult : 1;
    actionObj.expertise = actionObj.efficiencyBase * actionObj.efficiencyMult; //the initial and the multiplier (increases on stat add)
    actionObj.attReductionEffect = 1;
    actionObj.efficiency = actionObj.expertise * 100;

    actionObj.actionPower = actionObj.actionPowerBase * actionObj.actionPowerMult;
    actionObj.wage = dataObj.wage ? dataObj.wage : undefined;


    actionObj.expToAddBase = 1;
    actionObj.expToAddMult = calcUpgradeMultToExp(actionObj.actionVar);
    actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult
        * (dataObj.isGenerator&&!dataObj.ignoreExpUpgrade?Math.pow(1.05, data.upgrades.extraGeneratorExp.upgradePower):1);

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

    actionObj.connectedLines = 0;
}

function createAndLinkNewAction(actionVar, dataObj, downstreamVars) {
    data.actions[actionVar] = {};

    let actionObj = data.actions[actionVar];
    actionObj.actionVar = actionVar;
    dataObj.downstreamVars = downstreamVars ? downstreamVars : [];

    actionSetInitialVariables(actionObj, dataObj);
    actionSetBaseVariables(actionObj, dataObj);

    for(let downstreamVar of dataObj.downstreamVars) {
        actionObj[downstreamVar+"TempFocusMult"] = 2 + data.shopUpgrades.moreFocusMultiplier.upgradePower;
        actionObj[downstreamVar+"PermFocusMult"] = 1;
        actionObj[`downstreamRate${downstreamVar}`] = 0;
    }

    return actionObj;
}


function addMaxLevel(actionVar, amount) {
    data.actions[actionVar].maxLevel += amount;

    if(data.actions[actionVar].visible) {
        enableAutomationUpwards(actionVar);
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
    actionObj.progressMaxBase *= actionObj.progressMaxIncrease;
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
            data.ancientCoin += ACAmount * data.ancientCoinMultKTL
            data.ancientCoinGained += ACAmount * data.ancientCoinMultKTL
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


let resourceHeads = {
    "momentum":"overclock",
    "coins":"spendMoney",
    "conversations":"meetPeople",
    "research":"researchBySubject",
    "fortune":"buildFortune",
    "mana":"poolMana"
}

//returns downstream ratios, including slider, tierMult, & focus mults
function calculateDownstreamResources(actionVar) {
    const actionObj = data.actions[actionVar];
    const dataObj = actionData[actionVar];
    let tierMult = calcTierMult(dataObj.tier) * (actionObj.efficiency / 100);
    const calculatedRatios = {};
    let totalRatio = 0;

    for (let downstreamVar of dataObj.downstreamVars) {
        const sliderSetting = data.actions[actionVar][`downstreamRate${downstreamVar}`] / 100;
        const permFocusMult = actionObj[downstreamVar + "PermFocusMult"];
        const tempFocusMult = (isAttentionLine(actionVar, downstreamVar) ? actionObj[downstreamVar + "TempFocusMult"] : 1);
        const upgradeMult = Math.pow(1.1, data.upgrades.extraSendRate.upgradePower)

        const baseRate = sliderSetting * tierMult;
        const effectiveRate = baseRate * permFocusMult * tempFocusMult * upgradeMult;

        calculatedRatios[downstreamVar] = effectiveRate;
        totalRatio += effectiveRate;
    }

    const finalRatios = {};
    const normalizationFactor = Math.max(1, totalRatio);

    for (let downstreamVar of dataObj.downstreamVars) {
        finalRatios[downstreamVar] = calculatedRatios[downstreamVar] / normalizationFactor;
    }

    return finalRatios;
}

function calculateTaken(actionVar, shouldGive) {
    let ratios = calculateDownstreamResources(actionVar);

    let toReturn = {};
    let actionObj = data.actions[actionVar];
    actionObj.totalSend = 0;
    let dataObj = actionData[actionVar];
    let resourceToSplit = actionObj.resource;
    if(resourceToSplit === 0) {
        return {};
    }
    for (let downstreamVar of dataObj.downstreamVars) {
        let downstreamObj = data.actions[downstreamVar];
        let downstreamDataObj = actionData[downstreamVar];

        if (!downstreamObj || !downstreamObj.visible) continue;

        if(!downstreamDataObj.hasUpstream) {
            continue;
        }

        let taken = ratios[downstreamVar] * resourceToSplit / data.gameSettings.ticksPerSecond;
        if(taken < .0000001) {
            taken = 0;
        }

        // Keep track of the total sent out per second for the final calculation.
        actionObj.totalSend += taken * data.gameSettings.ticksPerSecond;
        toReturn[downstreamVar] = taken;

        if(shouldGive) {
            giveResourceTo(actionObj, downstreamObj, taken);
        }
    }
    return toReturn;
}

function checkProgressCompletion(actionObj, dataObj) {
	function isDoneLeveling() {
		return actionObj.maxLevel !== undefined && actionObj.level >= actionObj.maxLevel && !dataObj.generatesPastMax;
	}
	
    if(actionObj.progress >= actionObj.progressMax && (!isDoneLeveling())) {
        actionObj.progress -= actionObj.progressMax;

        for(let actionTrigger of dataObj.actionTriggers) {
            let when = actionTrigger[0];
            let type = actionTrigger[1];
            let info = actionTrigger[2];
            let extra = actionTrigger[3];
            if(when === "complete") {
                actionTriggerHelper(type, info, extra);
            }
        }

        if(dataObj.onCompleteCustom) {
            dataObj.onCompleteCustom();
        }
        actionObj.expToAddMult = calcUpgradeMultToExp(actionObj.actionVar);
        actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult
            * (dataObj.isGenerator&&!dataObj.ignoreExpUpgrade?Math.pow(1.05, data.upgrades.extraGeneratorExp.upgradePower):1);
        actionAddExp(actionObj, actionObj.expToAdd);

        //visual in case of level
        actionObj.expToAddMult = calcUpgradeMultToExp(actionObj.actionVar);
        actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult
            * (dataObj.isGenerator&&!dataObj.ignoreExpUpgrade?Math.pow(1.05, data.upgrades.extraGeneratorExp.upgradePower):1);
		
		//If we're at max level "refund" the remaining "paid" amount.  Realistically, this mostly matters for spells like Overclock
		//This won't retroactivly refund nodes that overleveled in a previoius version, but that'll be fixed when the amulet
		//resets everything
		if(isDoneLeveling()) {
			actionObj.resource += actionObj.progress;
			actionObj.progress = 0;
		}
        return true;
    }
	
    return false;
}


function giveResourceTo(actionObj, downstreamObj, amount) {
    if (!downstreamObj) {
        console.log(actionObj.actionVar + " is failing to give to downstream.");
        return;
    }
    if(amount < 0) { //NaN protection
        amount = 0;
    }
    // This function now correctly handles the state change for both actions.
    addResourceTo(downstreamObj, amount);
    actionObj.resource -= amount;
    if(actionObj.resource < 0) { //NaN protection
        actionObj.resource = 0;
    }
}

function addResourceTo(downstreamObj, amount) {

    let downstreamDataObj = actionData[downstreamObj.actionVar];
    if (downstreamObj.unlockCost > 0) {
        downstreamObj.unlockCost -= amount;
        amount = 0;
    }
    if (!downstreamObj.unlocked && downstreamObj.unlockCost <= 0) {
        amount = -1 * downstreamObj.unlockCost; // Get the leftovers back.
        unlockAction(downstreamObj);
        downstreamObj.unlockCost = 0;
    }

    // Only modify the actual resource value.
    downstreamObj.resource += amount;

    // The visual increase rate is calculated here for actions with smooth upstream flow.
    if (downstreamDataObj.hasUpstream) {
        downstreamObj.resourceIncrease += amount * data.gameSettings.ticksPerSecond;
    }
}


function setParents() {
    for(let actionVar in data.actions) {
        let dataObj = actionData[actionVar];
        for(let downstreamVar of dataObj.downstreamVars) {
            let downstreamDataObj = actionData[downstreamVar];
            if(downstreamDataObj) {
                downstreamDataObj.parentVar = actionVar;
            }
        }
    }
}

let check = 0;
//Add all action.downstreamVars.forEach(downstreamVar variables to a list
//Repeat until the list is empty:
//Get the next in the list, set its realX and realY based on the parents, and add its downstream vars to the list
function setRealCoordinates(startActionVar) {
    // Create a queue and start with the given action variable
    let queue = [startActionVar];

    while (queue.length > 0) {
        let currentVar = queue.shift();
        let dataObj = actionData[currentVar];
        let actionObj = data.actions[currentVar];
        if(check++ > 2000) {
            data.gameSettings.stop = 1;
            console.log("You have an infinite loop on action creation with: " + currentVar);
            return;
        }

        if (!dataObj) continue; // If action doesn't exist, skip it

        // Determine realX and realY
        let parentAction = actionData[dataObj.parentVar];
        if (dataObj.parentVar && parentAction) {
            dataObj.realX = parentAction.realX + dataObj.x;
            dataObj.realY = parentAction.realY + dataObj.y;
        } else {
            // This is the top-level action
            dataObj.realX = dataObj.x;
            dataObj.realY = dataObj.y;
        }

        // Add downstream actions to the queue
        if (dataObj.downstreamVars && dataObj.downstreamVars.length > 0) {
            dataObj.downstreamVars.forEach(downstreamVar => {
                if (actionData[downstreamVar]) {
                    queue.push(downstreamVar);
                }
            });
        }
    }
}
