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
        actionObj.resolveIncoming = 0; //reset
    });
    data.actionNames.forEach(function(actionName) {
        tickGameObject(actionName);
    });
    data.actionNames.forEach(function(actionName) {
        let actionObj = data.actions[actionName];
        actionObj.resolveDelta = actionObj.resolveIncoming;
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
    let isFlat = actionVar === "motivate";

    let progressRate = actionObj.progressRate();
    let atMaxLevel = actionObj.maxLevel >= 0 && actionObj.level >= actionObj.maxLevel;

    actionObj.progress += atMaxLevel ? 0 : progressRate;
    actionObj.progressGain = atMaxLevel ? 0 : progressRate * ticksPerSecond; //display purposes
    if(isFlat) {
        actionObj.resolveIncoming = progressRate * ticksPerSecond / actionObj.progressMax * actionObj.toAdd; //display purposes
    } else {
        actionObj.resolve -= atMaxLevel ? 0 : progressRate;
        //how much it's sending. resolveIncoming is affected by upstream effects also. resolveIncoming also = resolveDelta
        actionObj.resolveIncoming -= atMaxLevel ? 0 : progressRate * ticksPerSecond;
    }
    if(actionObj.progress >= actionObj.progressMax) {
        actionObj.progress -= actionObj.progressMax;
        actionObj.onCompleteCustom();
        actionObj.onCompleteBasic();
    }
    //sending a % to the self, so increase used there
    actionObj.totalSend = isFlat ? 0 : (progressRate * ticksPerSecond);

    actionObj.downstreamVars.forEach(function (downstreamVar) {
        let downstreamAction = data.actions[downstreamVar];
        if(!downstreamAction) {
            return;
        }
        if(downstreamAction.resolveName !== actionObj.resolveName) {
            return;
        }
        //Send resolve to downstream, and also update downstream's taken
        //TODO cache this access
        let mult = (document.getElementById(actionObj.actionVar+"NumInput"+downstreamVar).value-0)/100;
        let taken = actionObj.resolve * actionObj.tierMult() / actionObj.tierMult() / 100 / ticksPerSecond * mult; //equal to progressRate for non-motivate
        actionObj.totalSend += taken * ticksPerSecond;

        if(downstreamAction.unlockCost > 0) { //send to lock if locked
            downstreamAction.unlockCost -= taken;
            if(downstreamAction.unlockCost <= 0) {
                downstreamAction.unlocked = true;
                downstreamAction.onUnlock();
            }
        } else {
            downstreamAction.resolve += taken;
            downstreamAction.resolveIncoming += taken * ticksPerSecond; //visual var only
        }
        actionObj.resolve -= taken;
        actionObj.resolveIncoming -= taken * ticksPerSecond;
    });

    return actionObj;
}
