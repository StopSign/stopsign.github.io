

function tick() {
    if(stop) {
        return;
    }
    timer++;

    prevState.stats = JSON.parse(JSON.stringify(stats));
    actions.tick();
    if(soulstoneChance < 1) {
        soulstoneChance += .000001;
        if(soulstoneChance > 1) {
            soulstoneChance = 1;
        }
    }


    if(shouldRestart || timer >= timeNeeded) {
        prepareRestart();
    }

    view.update();

    if(timer % 300 === 0) {
        save();
    }
}

function recalcInterval(newSpeed) {
    // doWork.postMessage({stop:true});
    // doWork.postMessage({start:true,ms:(1000 / newSpeed)});
}

function pauseGame() {
    stop = !stop;
    document.getElementById("pausePlay").innerHTML = stop ? "Play" : "Pause";
    if(!stop && (shouldRestart || timer >= timeNeeded)) {
        restart();
    }
}

function prepareRestart() {
    if(document.getElementById("pauseBeforeRestart").checked) {
        pauseGame();
    } else {
        restart();
    }
}

function restart() {
    shouldRestart = false;
    timer = 0;
    timeNeeded = timeNeededInitial;
    if(initialGold) { //debugging only
        gold = initialGold;
        addGold(0);
    } else {
        addGold(-gold);
    }
    addReputation(-reputation);
    addSupplies(-supplies);
    addHerbs(-herbs);
    addHide(-hide);
    restartStats();
    for(let i = 0; i < towns.length; i++) {
        towns[i].restart();
    }
    for(let i = 0; i < skillList.length; i++) {
        view.updateSkill(skillList[i]);
    }
    actions.restart();
    view.updateCurrentActionsDivs();
    save();
}

function addActionToList(name, townNum, isTravelAction) {
    for(let i = 0; i < towns[townNum].totalActionList.length; i++) {
        let action = towns[townNum].totalActionList[i];
        if(action.name === name) {
            if(action.visible() && action.unlocked()) {
                if(isTravelAction) {
                    actionTownNum = townNum+1;
                    actions.addAction(name, 1);
                } else {
                    actions.addAction(name);
                }
            }
        }
    }
    view.updateNextActions();
}

function addMana(amount) {
    timeNeeded += amount;
}

function addGold(amount) {
    gold += amount;
    view.updateGold();
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
}

capAmount = function(index, townNum) {
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
};
addLoop = function(index) {
    actions.next[index].loops += actions.addAmount;
    view.updateNextActions();
};
removeLoop = function(index) {
    actions.next[index].loops -= actions.addAmount;
    if(actions.next[index].loops < 0) {
        actions.next[index].loops = 0;
    }
    view.updateNextActions();
};
split = function(index) {
    const toSplit = actions.next[index];
    actions.addAction(toSplit.name, Math.ceil(toSplit.loops/2), index);
    toSplit.loops = Math.floor(toSplit.loops/2);
    view.updateNextActions();
};
moveUp = function(index) {
    if(index <= 0) {
        return;
    }
    const temp = actions.next[index-1];
    actions.next[index-1] = actions.next[index];
    actions.next[index] = temp;
    view.updateNextActions();
};
moveDown = function(index) {
    if(index >= actions.next.length - 1) {
        return;
    }
    const temp = actions.next[index+1];
    actions.next[index+1] = actions.next[index];
    actions.next[index] = temp;
    view.updateNextActions();
};
removeAction = function(index) {
    let travelNum = getTravelNum(actions.next[index].name);
    if(travelNum) {
        actionTownNum = travelNum - 1;
    }

    actions.next.splice(index, 1);
    view.updateNextActions();
};