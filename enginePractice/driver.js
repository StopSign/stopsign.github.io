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
                view.updating.update();
            }
            break;
        }

        ticksForSeconds++;
        if(ticksForSeconds % ticksPerSecond === 0) {
            secondPassed();
        }
        framePassed();


        didSomething = true;
        if(gameTicksLeft > 2000) {
            // ticksPerSecond /= 2;
            console.warn('too fast! (${gameTicksLeft})');
            gameTicksLeft = 0;
            stop = true;
        }
        gameTicksLeft -= (1000 / ticksPerSecond) / gameSpeed / bonusSpeed;

    }
    if(didSomething) {
        view.updating.update();
    }
}

function framePassed() {
    gameTick();
}

function secondPassed() {
    secondTick();
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
        actionObj.resolveDelta = 0; //reset
    });
    data.actionNames.forEach(function(actionName) {
        tickGameObject(actionName);
    });


    //To get change/s
    //loop through all actions (data.actionNames is an [] with names, data.actions has the objects. actionObj = data.actions[actionNames[0]] for example)
    //have statsPerSecond = {"charm":num, "curiosity":num, ...}
    //for each, add their (actionObj.onLevelStats amount (e.g. [["charm", .1], ["curiosity", .1]]) multiplied by levels/s) to the relevant stat in statsPerSecond
    //to get levels/s, the action gets (actionObj.progressRate()/actionObj.progressMax) = completes/s, and then (complete/s * actionObj.expToAdd / actionObj.expToLevel) = level/s

    let statsPerSecond = view.helpers.getStatChanges();
    data.statNames.forEach(function(statName) {
        data.stats[statName].perSecond = statsPerSecond[statName] ? statsPerSecond[statName] : 0;
    });


}

function secondTick() {

}

function tickGameObject(actionVar) {
    let actionObj = data.actions[actionVar];

    //if generator, add Time to exp
    //if not generator, add current resolve/10^tier to exp
    let resolveMaxRate = actionObj.isGenerator ? actionObj.generatorSpeed / ticksPerSecond : actionObj.resolve * actionObj.tierMult() / ticksPerSecond;
    //actual resolve change will be based on efficiency - for both generator and not
    let rateInefficient = resolveMaxRate * (actionObj.efficiency/100);
    //when max level, do not consume resolve - only let it pass
    let atMaxLevel = actionObj.maxLevel >= 0 && actionObj.level >= actionObj.maxLevel;

    //if action is max level or locked, resolve rate should be 0
    let resolveToAdd = (atMaxLevel||!actionObj.unlocked) ? 0 : resolveMaxRate;
    let resolveToAddInefficient = (atMaxLevel||!actionObj.unlocked) ? 0 : rateInefficient;

    //Calculate resolve delta: 1. determine how much is being consumed and subtract it
    //2. later, if non-generator, an upstream action will add how much it is sending to this actions resolveDelta
    if(actionObj.isGenerator) {
        actionObj.resolveDelta = actionObj.actionPower / actionObj.progressMax * rateInefficient * ticksPerSecond;
        actionObj.actionPowerDelta = actionObj.resolveDelta;
    } else {
        //how much it's consuming.
        actionObj.resolveDelta -= resolveToAdd * ticksPerSecond;
        //take full resolve for consuming
        actionObj.resolve -= resolveToAdd;
    }


    actionObj.progress += resolveToAddInefficient;
    actionObj.progressGain = resolveToAddInefficient * ticksPerSecond; //display purposes for (+1.0/s) on green bar

    while(actionObj.progress >= actionObj.progressMax) {
        actionObj.progress -= actionObj.progressMax;
        actionObj.onCompleteCustom();
        actionObj.onCompleteBasic();
    }
    //sending a % to the self, so increase used there if relevant
    actionObj.totalSend = actionObj.isGenerator||atMaxLevel ? 0 : (rateInefficient * ticksPerSecond);

    actionObj.downstreamVars.forEach(function (downstreamVar) {
        let downstreamAction = data.actions[downstreamVar];
        if(!downstreamAction || downstreamAction.resolveName !== actionObj.resolveName) {
            return;
        }
        //Send resolve to downstream, and also update downstream's taken
        let mult = (view.cached[actionVar+"NumInput"+downstreamVar].value-0)/100;
        let taken = actionObj.progressRateReal() * mult;
        actionObj.totalSend += taken * ticksPerSecond;

        //sends to unlock cost first if needed
        giveResolveTo(actionObj, downstreamAction, taken);
    });

    return actionObj;
}

function giveResolveTo(actionObj, downstreamAction, amount) {
    addResolveTo(downstreamAction, amount);
    actionObj.resolve -= amount;
    actionObj.resolveDelta -= amount * ticksPerSecond;
}
function addResolveTo(downstreamAction, amount) {
    //gives to unlockCost of downstream action, unlocking if possible, and gives leftover to resolve
    if(downstreamAction.unlockCost > 0) {
        downstreamAction.unlockCost -= amount;
        amount = 0;
        if(downstreamAction.unlockCost <= 0) {
            amount = -1 * downstreamAction.unlockCost;
            downstreamAction.unlocked = true;
            downstreamAction.onUnlock();
        }
    }
    downstreamAction.resolve += amount;
    downstreamAction.resolveDelta += amount * ticksPerSecond;
}