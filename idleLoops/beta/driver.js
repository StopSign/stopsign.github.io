'use strict';

let gameSpeed = 1;

let curTime = new Date();
let gameTicksLeft = 0;
let radarUpdateTime = 0;

function tick() {
    let newTime = new Date();
    gameTicksLeft += newTime - curTime;
    radarUpdateTime += newTime - curTime;
    curTime = newTime;
    if(stop) {
        addOffline(gameTicksLeft * offlineRatio);
        gameTicksLeft = 0;
        return;
    }
    prevState.stats = JSON.parse(JSON.stringify(stats));

    while (gameTicksLeft > (1000 / 50)) {
        if(gameTicksLeft > 2000) {
            window.fps /= 2;
            console.warn('too fast! (${gameTicksLeft})');
            statGraph.graphObject.options.animation.duration = 0;
            gameTicksLeft = 0;
        }
        if(stop) {
            return;
        }
        timer++;

        actions.tick();
        if(soulstoneChance < 1) {
            soulstoneChance += .0000002;
            if(soulstoneChance > 1) {
                soulstoneChance = 1;
            }
        }

        if(shouldRestart || timer >= timeNeeded) {
            prepareRestart();
        }

        if(timer % (300*gameSpeed) === 0) {
            save();
        }
        gameTicksLeft -= (1000 / 50) / gameSpeed / bonusSpeed;
        if(bonusSpeed > 1) {
            addOffline(-1 * gameTicksLeft * ((bonusSpeed - 1)/bonusSpeed));
        }
    }

    if(radarUpdateTime > 1000) {
        view.updateStatGraphNeeded = true;
        radarUpdateTime -= 1000;
    }

    view.update();

}

function recalcInterval(fps) {
    window.fps = fps;
    doWork.postMessage({stop:true});
    doWork.postMessage({start:true,ms:(1000 / fps)});
}

function pauseGame() {
    stop = !stop;
    document.title = stop ? "*PAUSED* Idle Loops" : "Idle Loops";
    document.getElementById('pausePlay').innerHTML = _txt("time_controls>"+ (stop ? 'play_button' : 'pause_button'));
    if(!stop && (shouldRestart || timer >= timeNeeded)) {
        restart();
    }
}

function prepareRestart() {
    if(document.getElementById("pauseBeforeRestart").checked) {
        pauseGame();
        if (document.getElementById("audioCueToggle").checked) {
            beep(250);
            setTimeout(function () {beep(250)},500)
        }
    } else {
        restart();
    }
}

function restart() {
    shouldRestart = false;
    timer = 0;
    timeNeeded = timeNeededInitial;
    document.title = "Idle Loops";
    if(initialGold) { //debugging only
        gold = initialGold;
        addGold(0);
    } else {
        addGold(-gold);
    }
    addGlasses(-glasses);
    addReputation(-reputation);
    addSupplies(-supplies);
    addHerbs(-herbs);
    addHide(-hide);
    addPotions(-potions);
    addTeamNum(-teamNum);
    restartStats();
    for(let i = 0; i < towns.length; i++) {
        towns[i].restart();
    }
    for(let i = 0; i < skillList.length; i++) {
        view.updateSkill(skillList[i]);
    }
    actions.restart();
    view.updateCurrentActionsDivs();
    // save();
}

function addActionToList(name, townNum, isTravelAction) {
    for(let i = 0; i < towns[townNum].totalActionList.length; i++) {
        let action = towns[townNum].totalActionList[i];
        if(action.name === name) {
            if(action.visible() && action.unlocked() && (!action.allowed || getNumOnList(action.name) < action.allowed())) {
                let addAmount = actions.addAmount;
                if(action.allowed) {
                    let numMax = action.allowed();
                    let numHave = getNumOnList(action.name);
                    if((numMax - numHave) < addAmount) {
                        addAmount = numMax - numHave;
                    }
                }
                if(isTravelAction) {
                    actionTownNum = townNum+1;
                    actions.addAction(name, 1);
                } else {
                    actions.addAction(name, addAmount);
                }
            }
        }
    }
    view.updateNextActions();
    view.updateLockedHidden();
}

function addMana(amount) {
    timeNeeded += amount;
}

function addGold(amount) {
    gold += amount;
    view.updateGold();
}

function addGlasses(amount) {
    glasses += amount;
    view.updateGlasses();
}

function addReputation(amount) {
    reputation += amount;
    view.updateReputation();
}

function addSupplies(amount) {
    supplies += amount;
    view.updateSupplies();
}

function addHerbs(amount) {
    herbs += amount;
    view.updateHerbs();
}

function addHide(amount) {
    hide += amount;
    view.updateHide();
}

function addPotions(amount) {
    potions += amount;
    view.updatePotions();
}

function addTeamNum(amount) {
    teamNum += amount;
    view.updateTeamNum();
}

function changeActionAmount(amount, num) {
    actions.addAmount = amount;
    view.updateAddAmount(num);
}

function selectLoadout(num) {
    if(curLoadout === num) {
        curLoadout = 0;
    } else {
        curLoadout = num;
    }
    view.updateLoadout(curLoadout);
}

function saveList() {
    if(curLoadout === 0) {
        save();
        return;
    }
    loadouts[curLoadout] = copyArray(actions.next);
    save();
}

function loadList() {
    if(curLoadout === 0) {
        return;
    }
    if(!loadouts[curLoadout]) {
        actions.next = [];
    } else {
        actions.next = copyArray(loadouts[curLoadout]);
    }
    // view.updateCurrentActionsDivs();
    view.updateNextActions();
}

function unlockTown(townNum) {
    if(townNum > maxTown) {
        maxTown = townNum;
        view.showTown(townNum); //refresh current
    }
    curTown = townNum;
}

function adjustAll() {
    adjustPots();
    adjustLocks();
    adjustSQuests();
    adjustLQuests();
    adjustWildMana();
    adjustHerbs();
    adjustHunt();
    adjustSuckers();
    view.adjustManaCost("Continue On");
}

function capAmount(index, townNum) {
    let varName = "good"+translateClassNames(actions.next[index].name).varName;
    let alreadyExisting = 0;
    for(let i = 0; i < actions.next.length; i++) {
        if(i === index || actions.next[index].name !== actions.next[i].name) {
            continue;
        }
        alreadyExisting += actions.next[i].loops;
    }
    let newLoops = towns[townNum][varName] - alreadyExisting;
    actions.next[index].loops = newLoops < 0 ? 0 : newLoops;
    view.updateNextActions();
}

function addLoop(index) {
    let theClass = translateClassNames(actions.next[index].name);
    let addAmount = actions.addAmount;
    if(theClass.allowed) {
        let numMax = theClass.allowed();
        let numHave = getNumOnList(theClass.name);
        if((numMax - numHave) < addAmount) {
            addAmount = numMax - numHave;
        }
    }
    actions.next[index].loops += addAmount;
    view.updateNextActions();
    view.updateLockedHidden();
}
function removeLoop(index) {
    actions.next[index].loops -= actions.addAmount;
    if(actions.next[index].loops < 0) {
        actions.next[index].loops = 0;
    }
    view.updateNextActions();
    view.updateLockedHidden();
}
function split(index) {
    const toSplit = actions.next[index];
    actions.addAction(toSplit.name, Math.ceil(toSplit.loops/2), index);
    toSplit.loops = Math.floor(toSplit.loops/2);
    view.updateNextActions();
}
function handleDragStart(event) {
    let index = event.target.getAttribute("data-index")
    draggedDecorate(index);
    event.dataTransfer.setData('Text/html', index);
}

function handleDragOver(event) {
    event.preventDefault();
}

function handleDragDrop(event) {
    let indexOfDroppedOverElement = event.target.getAttribute("data-index")
    dragExitUndecorate(indexOfDroppedOverElement);
    let initialIndex = event.dataTransfer.getData("text/html")
    moveQueuedAction(initialIndex, indexOfDroppedOverElement);
}

function moveQueuedAction(initialIndex, resultingIndex) {
    initialIndex = Number(initialIndex);
    resultingIndex = Number(resultingIndex);
    if (initialIndex < 0 || initialIndex > actions.next.length || resultingIndex < 0 || resultingIndex > actions.next.length - 1) {
        return;
    }
    let difference = initialIndex - resultingIndex;
    if (difference === 0) {
        return;
    }

    let delta = Math.abs(difference);
   
    if (difference > 0) {
        for (let i = 0; i < delta; i++) {
            const temp = actions.next[initialIndex-i-1];
            actions.next[initialIndex-i-1] = actions.next[initialIndex-i];
            actions.next[initialIndex-i] = temp;
        }
    } else {
        for (let i = 0; i < delta; i++) {
            const temp = actions.next[initialIndex+i+1];
            actions.next[initialIndex+i+1] = actions.next[initialIndex+i];
            actions.next[initialIndex+i] = temp;
        }
    }
    
    view.updateNextActions();
}

function moveUp(index) {
    if(index <= 0) {
        return;
    }
    const temp = actions.next[index-1];
    actions.next[index-1] = actions.next[index];
    actions.next[index] = temp;
    view.updateNextActions();
}
function moveDown(index) {
    if(index >= actions.next.length - 1) {
        return;
    }
    const temp = actions.next[index+1];
    actions.next[index+1] = actions.next[index];
    actions.next[index] = temp;
    view.updateNextActions();
}
function removeAction(index) {
    let travelNum = getTravelNum(actions.next[index].name);
    if(travelNum) {
        actionTownNum = travelNum - 1;
    }

    actions.next.splice(index, 1);
    view.updateNextActions();
    view.updateLockedHidden();
}

function addOffline(num) {
    if(num) {
        if(totalOfflineMs + num < 0 && bonusSpeed > 1) {
            toggleOffline();
        }
        totalOfflineMs += num;
        document.getElementById("bonusSeconds").innerHTML = intToString(totalOfflineMs / 1000, 2);
    }
}

function toggleOffline() {
    if(bonusSpeed === 1) { //go fast
        bonusSpeed = 4;
        document.getElementById('isBonusOn').innerHTML = _txt("time_controls>bonus_seconds>state>on");
    } else { //take it slow
        bonusSpeed = 1;
        document.getElementById('isBonusOn').innerHTML = _txt("time_controls>bonus_seconds>state>off");
    }
}
