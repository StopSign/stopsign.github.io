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

// --- Offline Time Calculation ---
function checkOfflineProgress() {
    if (data.lastVisit) {
        const offlineMilliseconds = Date.now() - parseInt(data.lastVisit, 10);
        if (offlineMilliseconds > 5000) {
            data.currentGameState.bonusTime += offlineMilliseconds;
            console.log(`Welcome back! Gained ${(offlineMilliseconds / 1000).toFixed(1)}s of bonus time.`);
        }
    }
}

// --- Visual Rendering Loop ---
let lastAnimationTime = 0;
let timeAccumulators = { view30: 0, view10: 0, view1: 0 };

function animationTick(currentTime) {
    requestAnimationFrame(animationTick);

    if (data.gameSettings.stopAll) return;

    if (lastAnimationTime === 0) lastAnimationTime = currentTime;
    const delta = currentTime - lastAnimationTime;

    timeAccumulators.view30 += delta;
    timeAccumulators.view10 += delta;
    timeAccumulators.view1 += delta;

    const interval30 = 1000 / data.gameSettings.fps;
    if (timeAccumulators.view30 >= interval30) {
        timeAccumulators.view30 %= interval30;
        views.updateViewAtFrame();
        lastAnimationTime = currentTime;
    }

    const interval10 = data.gameSettings.fps < 10 ? interval30 : 100;
    if (timeAccumulators.view10 >= interval10) {
        timeAccumulators.view10 %= interval10;
        views.updateView();
        lastAnimationTime = currentTime;
    }

    if (timeAccumulators.view1 >= 1000) {
        timeAccumulators.view1 %= 1000;
        timeSinceLastSave++
        if(timeSinceLastSave >= 20) {
            timeSinceLastSave = 0;
            save();
        }
        views.updateViewOnSecond();
        lastAnimationTime = currentTime;
    }
}
let timeSinceLastSave = 0;

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

    secondsPassed++;
}


function gameTick() {
    data.lastVisit = Date.now();
    data.currentGameState.totalTicks++;
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
        checkLevelUp(actionObj, dataObj);
    }


    for (let actionVar in data.actions) {
        const actionObj = data.actions[actionVar];
        const dataObj = actionData[actionVar];

        for(let downstreamVar of dataObj.downstreamVars) {
            if (isAttentionLine(actionVar, downstreamVar)) {
                const key = `${downstreamVar}FocusMult`;
                if(data.upgrades.rememberWhatIFocusedOn.upgradePower === 0) {
                    continue;
                }
                actionObj[key] += 1 / data.gameSettings.ticksPerSecond / 3600;
                if(actionObj[key] > data.focusLoopMax) {
                    actionObj[key] = data.focusLoopMax;
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
        if (generatorObj.isGenerator && generatorObj.resourceToAdd > 0) {
            let targetVar = generatorObj.generatorTarget || actionVar;
            let targetObj = data.actions[targetVar];
            if (targetObj) {
                targetObj.resourceIncrease += generatorObj.resourceToAdd * generatorObj.progressGain / generatorObj.progressMax;
            }
        }
    }

    // Calculate all resource decreases and the final delta.
    for (let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];

        let totalDecrease = actionObj.totalSend || 0;

        if (!actionObj.isGenerator) {
            totalDecrease += actionObj.progressGain;
        } else {
            if (["makeMoney", "socialize"].includes(actionVar)) {
                totalDecrease += (actionObj.resource * actionObj.tierMult()) * actionObj.progressGain / actionObj.progressMax;
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
    }
    data.currentGameState.KTLBonusTimer++;
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

function getInstabilityReduction() {
    return data.atts.control.attMult / 10;
}


function tickGameObject(actionVar) {
    let actionObj = data.actions[actionVar];
    let dataObj = actionData[actionVar];

    if (!actionObj.isRunning) {
        return;
    }

    let momentumMaxRate = actionObj.isGenerator ? actionObj.generatorSpeed / data.gameSettings.ticksPerSecond :
        actionObj.resource * actionObj.tierMult() / data.gameSettings.ticksPerSecond;
    let isMaxLevel = actionObj.maxLevel !== undefined && actionObj.level >= actionObj.maxLevel;
    let momentumToAdd = (isMaxLevel || !actionObj.unlocked) ? 0 : momentumMaxRate;
    let resourceToAddInefficient = momentumToAdd * (actionObj.efficiency / 100);

    resourceToAddInefficient = resourceToAddInefficient < .0000001 ? 0 : resourceToAddInefficient;



    // Update progress and set the progressGain rate for this tick.
    actionObj.progress += resourceToAddInefficient;
    actionObj.progressGain = resourceToAddInefficient * data.gameSettings.ticksPerSecond;

    // For non-generators, consume the resource used to generate progress.
    if (!actionObj.isGenerator) {
        actionObj.resource -= resourceToAddInefficient;
    }

    if(actionObj.instability > 0) {
        actionObj.instability -= getInstabilityReduction() / data.gameSettings.ticksPerSecond;
        actionObj.progressMax = actionObj.progressMaxBase * actionObj.progressMaxMult * (1+actionObj.instability/100);
        if(actionObj.instability < 0) {
            actionObj.instability = 0;
        }
    }

    // Level up to 10 times per tick if progress is sufficient.
    for (let i = 0; i < 10; i++) {
        if (!checkProgressCompletion(actionObj, dataObj)) {
            break;
        }
    }

    // Reset and calculate total resources sent to all downstream actions this tick.
    actionObj.totalSend = 0;
    for (let downstreamVar of dataObj.downstreamVars) {
        let downstreamObj = data.actions[downstreamVar];
        let downstreamDataObj = actionData[downstreamVar];

        if (!downstreamObj || !downstreamObj.visible) continue;

        if(!downstreamObj.hasUpstream) {
            if (!downstreamObj.unlocked && downstreamObj.unlockCost <= 0 && (!downstreamDataObj.isUnlockCustom || downstreamDataObj.isUnlockCustom())) {
                unlockAction(downstreamObj);
            }
            continue;
        }

        let mult = data.actions[actionVar][`downstreamRate${downstreamVar}`] / 100;
        let taken = calculateTaken(actionVar, downstreamVar, actionObj, mult);

        // Keep track of the total sent out per second for the final calculation.
        actionObj.totalSend += taken * data.gameSettings.ticksPerSecond;

        // Give the resource to the downstream action.
        giveResourceTo(actionObj, downstreamObj, taken);
    }


}

function calculateTaken(actionVar, downstreamVar, actionObj, mult) {
    let permFocusMult = actionObj[downstreamVar + "FocusMult"] >= 1 ? actionObj[downstreamVar + "FocusMult"] : 1;

    let totalTakenMult = actionObj.tierMult() * (actionObj.efficiency / 100) * permFocusMult *
        (isAttentionLine(actionVar, downstreamVar) ? data.focusMult : 1);
    if (totalTakenMult > 1) {
        totalTakenMult = 1; // Cap at 100%/s
    }
    let toReturn = actionObj.resource / data.gameSettings.ticksPerSecond * totalTakenMult * mult;
    return toReturn < .0000001 ? 0 : toReturn;
}


function checkProgressCompletion(actionObj, dataObj) {
    let isMaxLevel = actionObj.maxLevel !== undefined && actionObj.level >= actionObj.maxLevel;
    if(actionObj.progress >= actionObj.progressMax && !isMaxLevel) {
        actionObj.progress -= actionObj.progressMax;
        if(dataObj.onCompleteCustom) {
            dataObj.onCompleteCustom();
        }
        actionAddExp(actionObj);
        return true;
    }
    return false;
}


function giveResourceTo(actionObj, downstreamObj, amount) {
    if (!downstreamObj) {
        console.log(actionObj.title + " is failing to give to downstream.");
        return;
    }
    // This function now correctly handles the state change for both actions.
    addResourceTo(downstreamObj, amount);
    actionObj.resource -= amount;
}

function addResourceTo(downstreamObj, amount) {
    let downstreamDataObj = actionData[downstreamObj.actionVar];
    if (downstreamObj.unlockCost > 0) {
        downstreamObj.unlockCost -= amount;
        amount = 0;
    }
    if (!downstreamObj.unlocked && downstreamObj.unlockCost <= 0 && (!downstreamDataObj.isUnlockCustom || downstreamDataObj.isUnlockCustom())) {
        unlockAction(downstreamObj);
        amount = -1 * downstreamObj.unlockCost; // Get the leftovers back.
        downstreamObj.unlockCost = 0;
    }

    // Only modify the actual resource value.
    downstreamObj.resource += amount;

    // The visual increase rate is calculated here for actions with smooth upstream flow.
    if (downstreamObj.hasUpstream) {
        downstreamObj.resourceIncrease += amount * data.gameSettings.ticksPerSecond;
    }
}