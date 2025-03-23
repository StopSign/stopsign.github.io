'use strict';

function startGame() {
    if (isFileSystem) {
        console.log('running locally');
        setInterval(tick, 1000/50);
    } else {
        // setInterval(tick, 1000/50);

        window.doWork = new Worker('helpers/interval.js');
        window.doWork.onmessage = function (event) {
            if (event.data === 'interval.start') {
                tick();
            }
        };
    }

    load();
}

//time-delta-based approach
function tick() {
    console.log('here');
    if(sudoStop) {
        return;
    }
    let newTime = new Date();
    let delta = newTime - curTime;
    totalTime += delta;
    gameTicksLeft += delta;
    saveTimer -= delta;
    curTime = newTime;

    if(saveTimer < 0) {
        saveTimer += 5000;
        save();
    }

    let didSomething = false; //for performance

    // Main loop: only process up to a certain threshold to avoid huge catch-up
    if (gameTicksLeft > 2000) {
        // Dump the overflow into bonusTime
        let overflow = gameTicksLeft;
        gameTicksLeft = 0;
        bonusTime += overflow;
        console.warn(`Too large backlog! Moved ${overflow} ms to bonusTime (now ${bonusTime} ms).`);
    }

    while (gameTicksLeft > (1000 / ticksPerSecond)) {
        if(stop || forceStop) {
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
        didSomething = true;

        if(gameTicksLeft > 1200) {
            ticksPerSecond /= 2;
            if (ticksPerSecond < 1) {
                ticksPerSecond = 1;
            }
            console.warn(`Too fast! (${gameTicksLeft}). Shifting ticksPerSecond to ${ticksPerSecond}`);
            bonusTime += gameTicksLeft;
            gameTicksLeft = 0;
        }
        gameTicksLeft -= (1000 / ticksPerSecond) / gameSpeed / bonusSpeed;

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

function recalcInterval(fps) {
    window.fps = fps;
    if(window.mainTickLoop !== undefined) {
        clearInterval(window.mainTickLoop);
    }
    if(isFileSystem) {
        window.mainTickLoop = setInterval(tick, 1000/fps);
    } else {
        doWork.postMessage({stop: true});
        doWork.postMessage({start: true, ms: (1000 / fps)});
    }
}

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
            actionObj.momentumDelta = actionObj.actionPower * actionObj.upgradeMult / actionObj.progressMax * rateInefficient * ticksPerSecond;
            actionObj.momentumIncrease = actionObj.momentumDelta;
        }
    } else {
        //how much it's consuming.
        actionObj.momentumDelta -= rateInefficient * ticksPerSecond;
        actionObj.momentum -= rateInefficient;
    }


    actionObj.progress += momentumToAddInefficient;
    actionObj.progressGain = momentumToAddInefficient * ticksPerSecond; //display purposes for (+1.0/s) on green bar

    let timesRun = 0;
    while(actionObj.progress >= actionObj.progressMax) { //or max
        if(timesRun++ > 10) {
            console.log('progress too fast on ' + actionObj.actionVar);
            break;
        }
        actionObj.progress -= actionObj.progressMax;
        if(dataObj.onCompleteCustom) {
            dataObj.onCompleteCustom();
        }
        actionAddExp(actionObj);
    }
    //sending a % to the self, so increase used there if relevant
    actionObj.momentumDecrease = actionObj.isGenerator||atMaxLevel ? 0 : (rateInefficient * ticksPerSecond);
    actionObj.totalSend = 0;

    actionObj.downstreamVars.forEach(function (downstreamVar) {
        let downstreamAction = data.actions[downstreamVar];
        if(!downstreamAction || downstreamAction.momentumName !== actionObj.momentumName || !downstreamAction.visible) {
            return;
        }
        //Send momentum to downstream, and also update downstream's taken
        let mult = (view.cached[actionVar+"NumInput"+downstreamVar].value-0)/100;
        let taken = actionObj.progressRateReal() * mult;
        actionObj.totalSend += taken * ticksPerSecond;
        actionObj.momentumDecrease += taken * ticksPerSecond;

        //sends to unlock cost first if needed
        giveMomentumTo(actionObj, downstreamAction, taken);
    });
    if(actionObj.generatorSpeed && actionVar !== "overclock") { //set decrease for other generators
        actionObj.momentumDecrease = (actionObj.momentum * actionObj.tierMult()) * actionObj.progressGain / actionObj.progressMax;
        actionObj.momentumDelta = actionObj.momentumIncrease - actionObj.momentumDecrease;
    }
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