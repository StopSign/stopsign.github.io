'use strict';
function startGame() {
    // load calls recalcInterval, which will start the callbacks
    load();
    setScreenSize();
}

let screenSize;
function setScreenSize() {
    screenSize = document.body.scrollHeight;
}

let lastAnimationTime = 0;
let animationFrameRequest = 0;
let animationTicksEnabled = true;

function recalcInterval(fps) {
    windowFps = fps;
    if (mainTickLoop !== undefined) {
        clearInterval(mainTickLoop);
    }
    if (window.requestAnimationFrame) {
        animationFrameRequest = requestAnimationFrame(animationTick);
        // mainTickLoop = setInterval(tick, 1000);
    } else {
        mainTickLoop = setInterval(tick, 1000 / fps);
    }
}
function animationTick(animationTime) {
    if (animationTime === lastAnimationTime || !animationTicksEnabled) {
        // double tick in the same frame, drop this one
        return;
    }
    try {
        tick();
    } finally {
        animationFrameRequest = requestAnimationFrame(animationTick);
    }
}



//time-delta-based approach
function tick() {
    if(sudoStop) {
        return;
    }
    let newTime = new Date();
    let delta = newTime - curTime;
    totalTime += delta;
    gameTicksLeft += delta;
    curTime = newTime;

    if (curTime - lastSave > data.options.autosaveRate * 1000) {
        lastSave = curTime;
        save();
    }

    let didSomething = false; //for performance

    // Main loop: only process up to a certain threshold to avoid huge catch-up
    if (gameTicksLeft > 2000) {
        // Dump the overflow into bonusTime
        let overflow = gameTicksLeft;
        gameTicksLeft = 0;
        bonusTime += overflow;
        // console.warn(`Too large backlog! Moved ${overflow} ms to bonusTime (now ${bonusTime} ms).`);
    }

    while (gameTicksLeft > (1000 / data.ticksPerSecond)) {
        if(stop || forceStop) {
            bonusTime += gameTicksLeft;
            gameTicksLeft = 0;
            if(!forceStop) {
                views.updateView();
            }
            break;
        }

        //Game logic for each tick
        ticksForSeconds++;
        if(ticksForSeconds % data.ticksPerSecond === 0) {
            secondPassed();
        }
        framePassed();
        didSomething = gameTicksLeft <= 1200;

        let timeSpent = (1000 / data.ticksPerSecond) / gameSpeed / bonusSpeed
        gameTicksLeft -= (1000 / data.ticksPerSecond) / gameSpeed / bonusSpeed;

        if(bonusSpeed !== 1) {
            bonusTime += -timeSpent * (bonusSpeed - 1);
            if(bonusTime <= 100) {
                toggleBonusSpeed()
            }
        }
    }
    if(didSomething) {
        views.updateView();
    }
}

function framePassed() {
    gameTick();
}

function secondPassed() {
    secondTick();

    updateViewOnSecond();
    secondsPassed++;
}


function gameTick() {
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
    calcDeltas();

    //check once more for any that need to be leveled from other's stat improvements
    for(let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        let dataObj = actionData[actionVar];
        checkLevelUp(actionObj, dataObj);
    }

    for (let actionVar in data.actions) {
        const actionObj = data.actions[actionVar];

        for(let downstreamVar of actionObj.downstreamVars) {
            if (isAttentionLine(actionVar, downstreamVar)) {
                const key = `${downstreamVar}FocusMult`;
                if(data.upgrades.rememberWhatIFocusedOn.upgradePower === 0) {
                    continue;
                }
                actionObj[key] += 1 / data.ticksPerSecond / 3600;
                if(actionObj[key] > data.focusLoopMax) {
                    actionObj[key] = data.focusLoopMax;
                }
            }
        }
    }

    let attsPerSecond = getStatChanges();
    for(let attVar in data.atts) {
        data.atts[attVar].perMinute = attsPerSecond[attVar] ? attsPerSecond[attVar]*60 : 0;
    }

    upgradeUpdates()
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

        // Start with the decrease from sending resources downstream.
        // This applies to ANY action that sends resources, including 'overclock'.
        let totalDecrease = actionObj.totalSend || 0;

        // Then, add the decrease from self-consumption.
        if (!actionObj.isGenerator) {
            // Non-generators consume resources to gain progress.
            totalDecrease += actionObj.progressGain;
        } else {
            // Specific generators might also consume their own resource.
            if (actionVar === "makeMoney") {
                totalDecrease += (actionObj.resource * actionObj.tierMult()) * actionObj.progressGain / actionObj.progressMax;
            }
            // Generators like 'overclock' have no self-consumption, so nothing more is added.
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
}

//spells get to reset before actions are ready to use them
function tickActionTimer(actionVar) {
    let actionObj = data.actions[actionVar];

    actionObj.cooldownTimer += 1 / data.ticksPerSecond * (actionObj.efficiency/100);
    if(actionObj.cooldownTimer > actionObj.cooldown) {
        actionObj.cooldownTimer = actionObj.cooldown;
    }
}


function tickGameObject(actionVar) {
    let actionObj = data.actions[actionVar];
    let dataObj = actionData[actionVar];

    if (!actionObj.isRunning) {
        return;
    }

    let momentumMaxRate = actionObj.isGenerator ? actionObj.generatorSpeed / data.ticksPerSecond : actionObj.resource * actionObj.tierMult() / data.ticksPerSecond;
    let atMaxLevel = actionObj.maxLevel >= 0 && actionObj.level >= actionObj.maxLevel;
    let momentumToAdd = (atMaxLevel || !actionObj.unlocked) ? 0 : momentumMaxRate;
    let resourceToAddInefficient = momentumToAdd * (actionObj.efficiency / 100);

    // Update progress and set the progressGain rate for this tick.
    actionObj.progress += resourceToAddInefficient;
    actionObj.progressGain = resourceToAddInefficient * data.ticksPerSecond;

    // For non-generators, consume the resource used to generate progress.
    if (!actionObj.isGenerator) {
        actionObj.resource -= resourceToAddInefficient;
    }

    // Level up to 10 times per tick if progress is sufficient.
    for (let i = 0; i < 10; i++) {
        if (!checkProgressCompletion(actionObj, dataObj)) {
            break;
        }
    }

    // Reset and calculate total resources sent to all downstream actions this tick.
    actionObj.totalSend = 0;
    for (let downstreamVar of actionObj.downstreamVars) {
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
        actionObj.totalSend += taken * data.ticksPerSecond;

        // Give the resource to the downstream action.
        giveResourceTo(actionObj, downstreamObj, taken);
    }
}

function calculateTaken(actionVar, downstreamVar, actionObj, mult) {
    let permFocusMult = actionObj[downstreamVar + "FocusMult"] >= 1 ? actionObj[downstreamVar + "FocusMult"] : 1;

    let totalTakenMult = actionObj.tierMult() * (actionObj.efficiency / 100) * permFocusMult * (isAttentionLine(actionVar, downstreamVar) ? data.focusMult : 1);
    if (totalTakenMult > 0.1) {
        totalTakenMult = 0.1; // Cap at 10%/s
    }
    let toReturn = actionObj.resource / data.ticksPerSecond * totalTakenMult * mult;
    return toReturn < .00001 ? 0 : toReturn;
}


function checkProgressCompletion(actionObj, dataObj) {
    if(actionObj.progress >= actionObj.progressMax) { //or max
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
        downstreamObj.resourceIncrease += amount * data.ticksPerSecond;
    }
}

function giveResourceTo2(actionObj, downstreamObj, amount) {
    if(!downstreamObj) {
        console.log(actionObj.title + " is failing to give to downstream.");
    }
    addResourceTo(downstreamObj, amount);
    actionObj.resource -= amount;
    actionObj.resourceDelta -= amount * data.ticksPerSecond;
}
function addResourceTo2(downstreamObj, amount) {
    //gives to unlockCost of downstream action, unlocking if possible, and gives leftover to resource
    let downstreamDataObj = actionData[downstreamObj.actionVar];
    if(downstreamObj.unlockCost > 0) {
        downstreamObj.unlockCost -= amount;
        amount = 0;
    }
    if(!downstreamObj.unlocked && downstreamObj.unlockCost <= 0 && (!downstreamDataObj.isUnlockCustom || downstreamDataObj.isUnlockCustom())) {
        unlockAction(downstreamObj);
        amount = -1 * downstreamObj.unlockCost; //get the leftovers back
        downstreamObj.unlockCost = 0;
    }
    downstreamObj.resource += amount;
    downstreamObj.resourceDelta += amount * data.ticksPerSecond;
    downstreamObj.resourceIncrease += amount * data.ticksPerSecond;
}