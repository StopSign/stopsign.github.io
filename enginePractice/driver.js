'use strict';

function startGame() {
    if (isFileSystem) {
    } else {
        window.doWork = new Worker('helpers/interval.js');
        window.doWork.onmessage = function (event) {
            if (event.data === 'interval.start') {
                tick();
            }
        };
    }

    load();
}

function tick() {
    if(sudoStop) {
        return;
    }
    let newTime = new Date();
    totalTime += newTime - curTime;
    gameTicksLeft += newTime - curTime;
    saveTimer -= newTime - curTime;
    curTime = newTime;

    if(saveTimer < 0) {
        saveTimer += 2000;
        save();
    }
    // document.getElementById("saveTimer").innerHTML = round(saveTimer/1000);

    let didSomething = false; //for performance

    while (gameTicksLeft > (1000 / ticksPerSecond)) {
        if(stop || forceStop) {
            gameTicksLeft = 0;
            if(!forceStop) {
                updateView();
            }
            break;
        }

        ticksForSeconds++;
        if(ticksForSeconds % ticksPerSecond === 0) {
            secondPassed();
        }
        framePassed();


        didSomething = true;
        if(gameTicksLeft > 1200) {
            ticksPerSecond /= 2;
            console.warn(`too fast! (${gameTicksLeft}). Shifting ticksPerSecond to ${ticksPerSecond}`);
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
    data.actionNames.forEach(function(actionName) {
        let actionObj = data.actions[actionName];
        actionObj.momentumDelta = 0; //reset
        actionObj.momentumIncrease = 0; //reset
    });
    data.actionNames.forEach(function(actionName) {
        tickGameObject(actionName);
    });


    //To get change/s
    //loop through all actions (data.actionNames is an [] with names, data.actions has the objects. actionObj = data.actions[actionNames[0]] for example)
    //have statsPerSecond = {"charm":num, "curiosity":num, ...}
    //for each, add their (actionObj.onLevelStats amount (e.g. [["charm", .1], ["curiosity", .1]]) multiplied by levels/s) to the relevant stat in statsPerSecond
    //to get levels/s, the action gets (actionObj.progressRate()/actionObj.progressMax) = completes/s, and then (complete/s * actionObj.expToAdd / actionObj.expToLevel) = level/s

    let statsPerSecond = getStatChanges();
    data.statNames.forEach(function(statName) {
        data.stats[statName].perSecond = statsPerSecond[statName] ? statsPerSecond[statName] : 0;
    });


}

function secondTick() {

}

function tickGameObject(actionVar) {
    let actionObj = data.actions[actionVar];

    //if generator, add Time to exp
    //if not generator, add current momentum/10^tier to exp
    let momentumMaxRate = actionObj.isGenerator ? actionObj.generatorSpeed / ticksPerSecond : actionObj.momentum * actionObj.tierMult() / ticksPerSecond;
    //actual momentum change will be based on efficiency - for both generator and not
    let rateInefficient = momentumMaxRate * (actionObj.efficiency/100);
    //when max level, do not consume momentum - only let it pass
    let atMaxLevel = actionObj.maxLevel >= 0 && actionObj.level >= actionObj.maxLevel;

    //if action is max level or locked, momentum rate should be 0
    let momentumToAdd = (atMaxLevel||!actionObj.unlocked) ? 0 : momentumMaxRate;
    let momentumToAddInefficient = (atMaxLevel||!actionObj.unlocked) ? 0 : rateInefficient;

    //Calculate momentum delta: 1. determine how much is being consumed and subtract it
    //2. later, if non-generator, an upstream action will add how much it is sending to this actions momentumDelta
    if(actionObj.isGenerator) {
        actionObj.momentumDelta = actionObj.actionPower / actionObj.progressMax * rateInefficient * ticksPerSecond;
        if(actionVar === "overclock") {
            actionObj.momentumIncrease = actionObj.momentumDelta;
        }
    } else {
        //how much it's consuming.
        actionObj.momentumDelta -= momentumToAdd * ticksPerSecond;
        //take full momentum for consuming
        actionObj.momentum -= momentumToAdd;
    }


    actionObj.progress += momentumToAddInefficient;
    actionObj.progressGain = momentumToAddInefficient * ticksPerSecond; //display purposes for (+1.0/s) on green bar

    while(actionObj.progress >= actionObj.progressMax) {
        actionObj.progress -= actionObj.progressMax;
        actionObj.onCompleteCustom();
        actionObj.onCompleteBasic();
    }
    //sending a % to the self, so increase used there if relevant
    actionObj.momentumDecrease = actionObj.isGenerator||atMaxLevel ? 0 : (rateInefficient * ticksPerSecond);
    actionObj.totalSend = 0;

    actionObj.downstreamVars.forEach(function (downstreamVar) {
        let downstreamAction = data.actions[downstreamVar];
        if(!downstreamAction || downstreamAction.momentumName !== actionObj.momentumName) {
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

    return actionObj;
}

function giveMomentumTo(actionObj, downstreamAction, amount) {
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
            amount = -1 * downstreamAction.unlockCost;
            downstreamAction.unlocked = true;
            downstreamAction.onUnlock();
        }
    }
    downstreamAction.momentum += amount;
    downstreamAction.momentumDelta += amount * ticksPerSecond;
    downstreamAction.momentumIncrease += amount * ticksPerSecond;
}