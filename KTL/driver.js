'use strict';
function startGame() {
    // load calls recalcInterval, which will start the callbacks
    load();
    setScreenSize();
    setTimeout(initTimingSystem, 200);
}

let screenSize;
function setScreenSize() {
    screenSize = document.body.scrollHeight;
}

function checkOfflineProgress() {
    if (data.lastVisit) {
        const offlineMilliseconds = Date.now() - parseInt(data.lastVisit, 10);
        if (offlineMilliseconds > 5000) {
            data.currentGameState.bonusTime += offlineMilliseconds;
            console.log(`Welcome back! Gained ${(offlineMilliseconds / 1000).toFixed(1)}s of bonus time.`);
            data.currentGameState.instantTimerCooldown -= offlineMilliseconds / 1000;
        }
    }
}

// --- Visual Rendering Loop ---
let lastAnimationTime = 0;
let timeAccumulators = { view30: 0, view10: 0, view1: 0 };
let debugDelta = Date.now();
let timeSinceLastSave = 0;

function animationTick(currentTime) {
    if (data.gameSettings.stopAll) {
        lastAnimationTime = currentTime;
        return;
    }

    if (lastAnimationTime === 0) lastAnimationTime = currentTime;

    const delta = currentTime - lastAnimationTime;
    lastAnimationTime = currentTime;

    timeAccumulators.view30 += delta;
    timeAccumulators.view10 += delta;
    timeAccumulators.view1 += delta;

    const interval30 = 1000 / 20;
    if (timeAccumulators.view30 >= interval30) {
        timeAccumulators.view30 %= interval30;
        views.updateViewAtFrame();
    }

    const interval10 = 100;
    if (timeAccumulators.view10 >= interval10) {
        timeAccumulators.view10 %= interval10;
        views.updateView();
    }

    if (timeAccumulators.view1 >= 1000) {
        timeAccumulators.view1 %= 1000;
        timeSinceLastSave++
        if(timeSinceLastSave >= 20) {
            timeSinceLastSave = 0;
            save();
        }
        views.updateViewOnSecond();
    }

    requestAnimationFrame(animationTick);
}

function initTimingSystem() {
    checkOfflineProgress();

    postMessage({
        command: 'start'
    });

    // Start the main thread's rendering loop.
    requestAnimationFrame(animationTick);
}

function secondPassed() {
    secondTick();

    data.currentGameState.secondsPassed++;
    data.currentGameState.secondsThisLS++;

}

function realSecondPassed() {
    tickTimerCooldown()
}

function tickTimerCooldown() {
    if (data.currentGameState.instantTimerCooldown > 0) {
        data.currentGameState.instantTimerCooldown --;
    }
    if(data.currentGameState.instantTimerCooldown < 0) {
        data.currentGameState.instantTimerCooldown = 0;
    }
    updateConvertButtonUI();
}

function updateConvertButtonUI() {
    if (data.currentGameState.instantTimerCooldown > 0) {
        views.updateVal(`convertBtn`, "grey", "style.backgroundColor");
        views.updateVal(`convertBtn`, "Use in " + secondsToTime(data.currentGameState.instantTimerCooldown), "innerText");
    } else {
        views.updateVal(`convertBtn`, "green", "style.backgroundColor");
        views.updateVal(`convertBtn`, "Convert 2 hours", "innerText");
    }
}

function gameTick() {
    data.gameSettings.ticksForSeconds++;

    for (let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        actionObj.resourceDelta = 0;
        actionObj.resourceIncrease = 0;
        actionObj.resourceDecrease = 0;
        actionObj.progressGain = 0;
    }

    for(let actionVar in data.actions) {
        tickActionTimer(actionVar);
    }

    for (let actionVar in data.actions) {
        tickGameObject(actionVar);
    }


    //check once more for any that need to be leveled from other's stat improvements
    for(let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        let dataObj = actionData[actionVar];
        for(let i = 0; i < 1 / (data.gameSettings.ticksPerSecond / 20); i++) {
            if (!checkLevelUp(actionObj, dataObj)) {
                break;
            }
        }
        //visual in case of level
        actionObj.expToAddMult = calcUpgradeMultToExp(actionObj.actionVar);
        actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
    }


    for (let actionVar in data.actions) {
        const actionObj = data.actions[actionVar];
        const dataObj = actionData[actionVar];

        for(let downstreamVar of dataObj.downstreamVars) {
            if (isAttentionLine(actionVar, downstreamVar)) {
                const key = `${downstreamVar}TempFocusMult`;
                let power = data.upgrades.learnToFocusMore.upgradePower;
                if(power === 0) {
                    continue;
                }
                actionObj[key] += power / data.gameSettings.ticksPerSecond / 600;
                if(actionObj[key] > power + 2) {
                    actionObj[key] = power + 2;
                }
            }
        }
    }

    upgradeUpdates()
    calcDeltas();
}

function calcDeltas() {
    // Aggregate all visual increases from persistent generator rates.
    for (let actionVar in data.actions) {
        let generatorObj = data.actions[actionVar];
        let generatorDataObj = actionData[actionVar];
        if (generatorDataObj.isGenerator && generatorObj.resourceToAdd > 0) {
            let targetVar = generatorDataObj.generatorTarget || actionVar;
            let targetObj = data.actions[targetVar];
            if (targetObj) {
                targetObj.resourceIncrease += generatorObj.resourceToAdd * generatorObj.progressGain / generatorObj.progressMax;
            }
        }
    }

    // Calculate all resource decreases and the final delta.
    for (let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        let dataObj = actionData[actionVar];

        let totalDecrease = actionObj.totalSend || 0;

        if (!dataObj.isGenerator) {
            totalDecrease += actionObj.progressGain;
        } else {
            if (["makeMoney", "socialize"].includes(actionVar)) {
                totalDecrease += (actionObj.resource * calcTierMult(dataObj.tier)) * actionObj.progressGain / actionObj.progressMax;
            }
        }

        actionObj.resourceDecrease = totalDecrease;

        // Calculate the final net change per second for display.
        actionObj.resourceDelta = actionObj.resourceIncrease - actionObj.resourceDecrease;
    }
}

function secondTick() {
    if(data.gameState !== "KTL") {
        data.secondsPerReset++;
    } else {
        data.NWSeconds++;
    }
    takeDataSnapshot(data.actions.overclock.resourceToAdd, data.secondsPerReset);
}

//spells get to reset before actions are ready to use them
function tickActionTimer(actionVar) {
    let actionObj = data.actions[actionVar];
    if(!actionObj.cooldown) {
        return;
    }

    actionObj.cooldownTimer += 1 / data.gameSettings.ticksPerSecond;
    if(actionObj.cooldownTimer > actionObj.cooldown) {
        actionObj.cooldownTimer = actionObj.cooldown;
    }
}

function getInstabilityReduction(instability) {
    return Math.sqrt(data.atts.control.attMult) * Math.sqrt(instability/100)/100;
}

function calcInstabilityEffect(instability) {
    return Math.pow(1+instability/100, 2)
}


function tickGameObject(actionVar) {
    let actionObj = data.actions[actionVar];
    let dataObj = actionData[actionVar];

    if (!actionObj.isRunning) {
        return;
    }

    let momentumMaxRate = dataObj.isGenerator ? dataObj.generatorSpeed / data.gameSettings.ticksPerSecond :
        actionObj.resource * calcTierMult(dataObj.tier) / data.gameSettings.ticksPerSecond;
    if(dataObj.isGenerator && actionObj.isPaused) {
        momentumMaxRate = 0;
    }
    let isMaxLevel = actionObj.maxLevel !== undefined && actionObj.level >= actionObj.maxLevel;
    let momentumToAdd = (!actionObj.unlocked || (!dataObj.generatesPastMax && isMaxLevel)) ? 0 : momentumMaxRate;
    let resourceToAddInefficient = momentumToAdd * (actionObj.efficiency / 100);

    resourceToAddInefficient = resourceToAddInefficient < .0000001 ? 0 : resourceToAddInefficient;



    // Update progress and set the progressGain rate for this tick.
    actionObj.progress += resourceToAddInefficient;
    actionObj.progressGain = resourceToAddInefficient * data.gameSettings.ticksPerSecond;

    // For non-generators, consume the resource used to generate progress.
    if (!dataObj.isGenerator || dataObj.ignoreConsume) {
        actionObj.resource -= resourceToAddInefficient;
    }

    if(actionObj.instability > 0) {
        actionObj.instability -= getInstabilityReduction(actionObj.instability) / data.gameSettings.ticksPerSecond;
        actionObj.progressMax = actionObj.progressMaxBase * actionObj.progressMaxMult * calcInstabilityEffect(actionObj.instability);
        if(actionObj.instability < 0) {
            actionObj.instability = 0;
        }
    }

    // Level up to 10 times per tick if progress is sufficient.
    for (let i = 0; i < 10 / (data.gameSettings.ticksPerSecond / 20); i++) {
        if (!checkProgressCompletion(actionObj, dataObj)) {
            break;
        }
    }

    calculateTaken(actionVar, true);

    //Calc resource retrieval
	let resourceParentVar = actionData[actionObj.actionVar].parentVar;
    let isQuiet = actionObj.unlocked && isMaxLevel && actionObj.resourceIncrease === 0 && actionObj.totalSend === 0;
    if(!isQuiet || !dataObj.hasUpstream || data.upgrades.retrieveMyUnusedResources.upgradePower === 0 || resourceHeads[dataObj.resourceName] === actionVar || data.gameState === "KTL" || actionVar === "reinvest") {
        actionObj.resourceRetrieved = 0;
    } else {
        actionObj.resourceRetrieved = (actionObj.resource/100 * [0, 1, 2, 5][data.upgrades.retrieveMyUnusedResources.upgradePower] + 10) / data.gameSettings.ticksPerSecond;
        if(actionObj.resourceRetrieved > actionObj.resource) {
            actionObj.resourceRetrieved = actionObj.resource;
        }
        if(resourceParentVar) {
            let parentObj = data.actions[resourceParentVar];
            giveResourceTo(actionObj, parentObj, actionObj.resourceRetrieved);
            //Because generators don't get resourceIncrease from giveResourceTo
            parentObj.resourceIncrease += actionObj.resourceRetrieved * data.gameSettings.ticksPerSecond;
        }
    }
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

        const baseRate = sliderSetting * tierMult;
        const effectiveRate = baseRate * permFocusMult * tempFocusMult;

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
        actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
        actionAddExp(actionObj, actionObj.expToAdd);

        //visual in case of level
        actionObj.expToAddMult = calcUpgradeMultToExp(actionObj.actionVar);
        actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
		
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