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

    while (gameTicksLeft > (1000 / ticksPerSecond)) {
        if(stop || forceStop) {
            bonusTime += gameTicksLeft;
            gameTicksLeft = 0;
            if(!forceStop) {
                updateView();
            }
            break;
        }

        //Game logic for each tick
        ticksForSeconds++;
        if(ticksForSeconds % ticksPerSecond === 0) {
            secondPassed();
        }
        framePassed();
        didSomething = gameTicksLeft <= 1200;

        let timeSpent = (1000 / ticksPerSecond) / gameSpeed / bonusSpeed
        gameTicksLeft -= (1000 / ticksPerSecond) / gameSpeed / bonusSpeed;

        if(bonusSpeed !== 1) {
            bonusTime += -timeSpent * (bonusSpeed - 1);
            if(bonusTime <= 100) {
                toggleBonusSpeed()
            }
        }
    }
    if(didSomething) {
        updateView();
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

// function recalcInterval(fps) {
//     window.fps = fps;
//     if(window.mainTickLoop !== undefined) {
//         clearInterval(window.mainTickLoop);
//     }
//     if(isFileSystem) {
//         window.mainTickLoop = setInterval(tick, 1000/fps);
//     } else {
//         doWork.postMessage({stop: true});
//         doWork.postMessage({start: true, ms: (1000 / fps)});
//     }
// }




function gameTick() {
    data.actionNames.forEach(function(actionVar) {
        let actionObj = data.actions[actionVar];
        actionObj.momentumDelta = 0; //reset
        actionObj.momentumIncrease = 0; //reset
    });
    //prev must conclude first
    data.actionNames.forEach(function(actionVar) {
        tickGameObject(actionVar);
    });
    //check once more for any that need to be leveled from other's stat improvements
    for(let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        let dataObj = actionData[actionVar];
        checkLevelUp(actionObj, dataObj);
    }

    for (let actionVar in data.actions) {
        const actionObj = data.actions[actionVar];

        if (!actionObj.downstreamVars) continue;

        actionObj.downstreamVars.forEach(function (downstreamVar) {
            if (isAttentionLine(actionVar, downstreamVar)) {
                const key = downstreamVar + "AttentionMult";
                if(data.upgrades.rememberWhatIFocusedOn.upgradePower === 0) {
                    return;
                }
                actionObj[key] += 1 / ticksPerSecond / 3600;
                if(actionObj[key] > data.attentionLoopMax) {
                    actionObj[key] = data.attentionLoopMax;
                }
            }
        });
    }
    //To get change/s
    //loop through all actions (data.actionNames is an [] with names, data.actions has the objects. actionObj = data.actions[actionNames[0]] for example)
    //have statsPerSecond = {"charm":num, "curiosity":num, ...}
    //for each, add their (actionObj.onLevelStats amount (e.g. [["charm", .1], ["curiosity", .1]]) multiplied by levels/s) to the relevant stat in statsPerSecond
    //to get levels/s, the action gets (actionProgressRate(actionObj)/actionObj.progressMax) = completes/s, and then (complete/s * actionObj.expToAdd / actionObj.expToLevel) = level/s

    let statsPerSecond = getStatChanges();
    data.statNames.forEach(function(statName) {
        data.stats[statName].perMinute = statsPerSecond[statName] ? statsPerSecond[statName]*60 : 0;
    });


    upgradeUpdates()
}

function secondTick() {
    if(data.gameState !== "KTL") {
        data.secondsPerReset++;
    }
}

function tickGameObject(actionVar) {
    let actionObj = data.actions[actionVar];
    let dataObj = actionData[actionVar];

    //Full pause on actions not in the correct game state
    if(!actionObj.isRunning) {
        return;
    }

    //if generator, add Time to exp
    //if not generator, becomes 1% of momentum/s / 20.
    let momentumMaxRate = actionObj.isGenerator ? actionObj.generatorSpeed / ticksPerSecond : actionObj.momentum * actionObj.tierMult() / ticksPerSecond;
    //if action is max level or locked, momentum rate should be 0
    let atMaxLevel = actionObj.maxLevel >= 0 && actionObj.level >= actionObj.maxLevel;
    let momentumToAdd = (atMaxLevel||!actionObj.unlocked) ? 0 : momentumMaxRate;
    //actual momentum change will be based on efficiency - for both generator and not
    let rateInefficient = momentumToAdd * (actionObj.efficiency/100);

    let momentumToAddInefficient = (atMaxLevel||!actionObj.unlocked) ? 0 : rateInefficient;

    //Calculate momentum delta: 1. determine how much is being consumed and subtract it
    //2. later, if non-generator, an upstream action will add how much it is sending to this actions momentumDelta
    if(actionObj.isGenerator) {
        if(actionVar === "overclock") { //visual only
            let flatFromUpgrade = data.upgrades.tryALittleHarder.upgradePower * 20;
            actionObj.momentumDelta = actionObj.actionPower * actionObj.upgradeMult * rateInefficient / actionObj.progressMax * ticksPerSecond + flatFromUpgrade;
            actionObj.momentumIncrease = actionObj.momentumDelta;
        }
    } else {
        //how much it's consuming.
        actionObj.momentumDelta -= momentumToAddInefficient * ticksPerSecond;
        actionObj.momentum -= momentumToAddInefficient;
    }

    actionObj.progress += momentumToAddInefficient;
    actionObj.progressGain = momentumToAddInefficient * ticksPerSecond; //display purposes for (+1.0/s) on green bar

    //level up to 10 times
    for(let i = 0; i < 10; i++) {
        if(!checkProgressCompletion(actionObj, dataObj)) {
            break;
        }
    }

    //sending a % to the self, so increase used there if relevant
    actionObj.momentumDecrease = (actionObj.isGenerator||atMaxLevel) ? 0 : (rateInefficient * ticksPerSecond);
    actionObj.totalSend = 0;

    actionObj.downstreamVars.forEach(function (downstreamVar) {
        let downstreamAction = data.actions[downstreamVar];

        if(!downstreamAction || !downstreamAction.visible) {
            return;
        }
        if(downstreamAction.momentumName !== actionObj.momentumName) {
            downstreamAction.momentumIncrease = actionObj.amountToSend * actionObj.progressGain / actionObj.progressMax;
            return;
        }
        let mult = (view.cached[actionVar + "NumInput" + downstreamVar].value - 0) / 100;
        let taken = calculateTaken(actionVar, downstreamVar, actionObj, mult);

        actionObj.totalSend += taken * ticksPerSecond;
        actionObj.momentumDecrease += taken * ticksPerSecond;

        //sends to unlock cost first if needed
        giveMomentumTo(actionObj, downstreamAction, taken);
    });
    if(actionObj.isGenerator && actionVar !== "overclock") { //set decrease for other generators
        actionObj.momentumDecrease = (actionObj.momentum * actionObj.tierMult()) * actionObj.progressGain / actionObj.progressMax;
        actionObj.momentumDelta = actionObj.momentumIncrease - actionObj.momentumDecrease;
    }
}

function calculateTaken(actionVar, downstreamVar, actionObj, mult) {
    let permAttentionMult = actionObj[downstreamVar + "AttentionMult"] >= 1 ? actionObj[downstreamVar + "AttentionMult"] : 1;


    let totalTakenMult = actionObj.tierMult() * (actionObj.efficiency / 100) * permAttentionMult * (isAttentionLine(actionVar, downstreamVar) ? data.attentionMult : 1);
    if (totalTakenMult > 0.1) {
        totalTakenMult = 0.1; // Cap at 10%/s
    }
    let toReturn = actionObj.momentum / ticksPerSecond * totalTakenMult * mult;
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

function giveMomentumTo(actionObj, downstreamAction, amount) {
    if(!downstreamAction) {
        console.log(actionObj.title + " is failing to give to downstream.");
    }
    addMomentumTo(downstreamAction, amount);
    actionObj.momentum -= amount;
    actionObj.momentumDelta -= amount * ticksPerSecond;
}
function addMomentumTo(downstreamAction, amount) {
    //gives to unlockCost of downstream action, unlocking if possible, and gives leftover to momentum
    if(downstreamAction.unlockCost > 0) {
        downstreamAction.unlockCost -= amount;
        amount = 0;
        if(downstreamAction.unlockCost <= 0) {
            unlockAction(downstreamAction);
            amount = -1 * downstreamAction.unlockCost; //get the leftovers back
        }
    }
    downstreamAction.momentum += amount;
    downstreamAction.momentumDelta += amount * ticksPerSecond;
    downstreamAction.momentumIncrease += amount * ticksPerSecond;
}