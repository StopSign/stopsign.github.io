let actions = {
    validActions: [0, 0, 0],
    tick: function() {
        //get a list of valid actions, moving to next if cost fails
        for(let i = 0; i < actionsList.nextNames.length; i++) {
            let name = actionsList.nextNames[i];
            let list = actionsList.current[name];
            let action = list[this.validActions[i]];
            if(this.validActions[i] === (list.length-1) && action && action.varName === "sleep" && action.loopsLeft === 0) { //group sleeps together
                action.loops++;
                action.loopsLeft++;
                action.manaUsed = 0;
                if(actionsList.next[name][this.validActions[i]].varName === "sleep") {
                    actionsList.next[name][this.validActions[i]].loops = action.loops;
                }
            }
            while(action && (action.loopsLeft === 0 || (action.manaUsed === 0 && !action.canBuy()))) { //action exists but is invalid, slide
                if(!document.getElementById("waitForResources").checked && !action.canBuy() && action.loopsLeft !== 0) { //failed to buy
                    action.failed++;
                    action.failedReason = "Not enough resources.";
                    action.loops -= action.loopsLeft;
                    action.loopsLeft = 0;
                    // actions.refresh(i);
                    this.validActions[i]++;
                } else {
                    if(document.getElementById("waitForResources").checked && !action.canBuy() && action.loopsLeft !== 0) {
                        // console.log("can't buy but not done");
                        if(action.loops - action.loopsLeft > 0) { //some loops completed already
                            action.loops -= action.loopsLeft;
                            let loopsLeftToAdd = action.loopsLeft;
                            action.loopsLeft = 0;
                            actionsList.next[name][this.validActions[i]].loops = action.loops;
                            addActionToNext(action, name, loopsLeftToAdd, this.validActions[i]+1, true);
                            levelSave[curLevel].nextLists = listsToSimplified();
                            actions.refresh(i);
                            this.validActions[i]++;
                            addSleepAction(i, this.validActions[i]);
                            break;
                        }
                        addSleepAction(i, this.validActions[i]);
                        if(list[this.validActions[i]-1] && list[this.validActions[i]-1].varName === "sleep") { //combined the sleep
                            // console.log('sleep already existed, go back');
                            this.validActions[i]--;
                        }
                        actions.refresh(i);
                    } else {
                        this.validActions[i]++;
                    }
                }
                action = list[this.validActions[i]];
            }
            if(!action) { //Never found a valid action, create sleep
                addSleepAction(i);
                action = list[this.validActions[i]];
            }
        }

        let listEmpty = false;
        //add tick to each action. if it finishes, get the rewards
        for(let i = 0; i < actionsList.nextNames.length; i++) {
            let name = actionsList.nextNames[i];
            let action = actionsList.current[name][this.validActions[i]];
            if(!action) {
                console.log("????");
                continue;
            }
            if(action.manaUsed === 0 && action.spend) {
                action.spend(); //spend as soon as action starts
                actions.addToConsole(name, action);
                if(action.start) {
                    action.start();
                }
            }
            if(i === 1 && ["sleep", "restart"].indexOf(action.varName) === -1) {
                action.manaUsed += king.getBonusByAura("build");
            } else {
                action.manaUsed++;
            }
            if(action.manaUsed / 10 >= action.costseconds) {
                action.loopsLeft--;
                action.manaUsed = 0;
                if(action.loopsLeft === 0) {
                    let nextAction = actionsList.current[name][this.validActions[i]+1];
                    if(nextAction && nextAction.varName === "pause" && nextAction.loopsLeft > 0) {
                        nextAction.loopsLeft = 0;
                        this.validActions[i]++;
                        pauseReason = "Action";
                        pauseGame();
                    }
                }
                if(action.buy) {
                    action.buy();
                    actions.adjustCosts(i);
                }
                if(action.varName !== "sleep" && action.loopsLeft === 0 && !actionsList.current[name][this.validActions[i]+1]) { //no next action after non-sleep
                    listEmpty = i;
                }
            }
        }

        if(document.getElementById("pauseListEmpty").checked && listEmpty !== false) {
            pauseReason = capitalizeFirst(actionsList.nextNames[listEmpty]) + " List Done";
            pauseGame();
        }
        if(document.getElementById("pauseListsEmpty").checked) {
            let listsEmpty = true;
            let allSleep = true;
            for(let i = 0; i < actionsList.nextNames.length; i++) {
                let name = actionsList.nextNames[i];
                let action = actionsList.current[name][this.validActions[i]];
                let listIsDone = action.varName !== "sleep" && action.loopsLeft === 0 && !actionsList.current[name][this.validActions[i]+1];
                let currentlySleeping = action.varName === "sleep" && !actionsList.current[name][this.validActions[i]+1];
                listsEmpty = listsEmpty && (listIsDone || currentlySleeping);
                allSleep = allSleep && currentlySleeping;
            }
            if(listsEmpty && !allSleep) {
                pauseReason = "All Lists Done";
                pauseGame();
            }
        }
    },
    restart: function() {
        this.validActions = [0, 0, 0];
        actionsList.current = {
            king:[],
            castle:[],
            units:[]
        };
        //clear all of the last action if it's sleep
        for(let i = 0; i < actionsList.nextNames.length; i++) {
            let name = actionsList.nextNames[i];
            let nextList = actionsList.next[name];
            if(nextList.length === 0) {
                continue;
            }
            let lastAction = nextList[nextList.length-1];
            if(lastAction.varName === "sleep") {
                nextList.splice(nextList.length-1, 1);
            }
        }
        for(let i = 0; i < actionsList.nextNames.length; i++) {
            actions.refresh(i);
        }
    },
    refresh: function(num) {
        //takes everything new on actionsList.next and puts it in actionsList.current
        let name = actionsList.nextNames[num];
        let nextList = actionsList.next[name];
        let currentList = actionsList.current[name];
        for(let j = 0; j < nextList.length; j++) {
            let curAction = currentList[j];
            let nextAction = nextList[j];
            if(this.validActions[num] > j) { //only modify untouched ones
                continue;
            }
            if(curAction && nextAction && curAction.varName === nextAction.varName) {
                let loopsDone = curAction.loops - curAction.loopsLeft + (curAction.manaUsed !== 0 ? 1 : 0);
                let newLoops = nextAction.loops;
                if(newLoops < loopsDone) {
                    newLoops = loopsDone;
                }
                let difference = curAction.loops - newLoops;
                curAction.loops = newLoops;
                curAction.loopsLeft = curAction.loopsLeft - difference;
                continue;
            }

            if(this.validActions[num] > j || //only modify untouched ones
                (this.validActions[num] === j && curAction && (curAction.manaUsed !== 0 || curAction.loopsLeft !== curAction.loops))) { //and ones not currently updating
                continue;
            }
            let action = copyArray(nextAction);
            actions.translateNextToCurrent(action, name);
            currentList[j] = action;
        }
        if(this.validActions[num] !== -1 && this.validActions[num] < nextList.length && currentList.length !== nextList.length) { //remove extra actions from current list
            currentList.splice(nextList.length, currentList.length - nextList.length);
        }

        actions.adjustCosts(num);
    },
    adjustCosts: function(num) {
        let name = actionsList.nextNames[num];
        let currentList = actionsList.current[name];
        let numOnList = {};
        for(let i = 0; i < currentList.length; i++) {
            let action = currentList[i];
            let numPrior = (numOnList[action.varName] ? numOnList[action.varName] : 0);
            if(actions.validActions[num] === i && action.loopsLeft > 0) {
                numPrior += action.loops - action.loopsLeft; //also count completed loops in current action
            }
            if(action.createdWith) {
                actions.setCosts(action, numPrior, numOnList[action.createdWith] ? numOnList[action.createdWith] : 0);
            } else {
                actions.setCosts(action, numPrior);
            }
            numOnList[action.varName] = numPrior + action.loops;
        }
    },
    setCosts: function(action, numPrior, numCreatedWith) {
        action.costseconds = 0;
        action.costgold = 0;
        action.costwood = 0;
        action.costmana = 0;
        if(numCreatedWith === undefined) {
            numCreatedWith = 1;
        }
        for(let i = 0; i < action.cost.length; i++) {
            let cost = action.cost[i];
            let amount = 0;
            if (cost.type === "static") {
                amount += cost.starting;
            } else if (cost.type === "linear") {
                amount += cost.starting + cost.growth * numPrior;
            }
            action["cost"+cost.resource] = cost.type === "mana" ? amount : numCreatedWith * amount;
        }
    },
    translateNextToCurrent: function(action, name) {
        action.loopsLeft = action.loops;
        action.manaUsed = 0;
        action.failed = 0;
        action.failedReason = "";

        let actionDatum = getActionByVarName(action.varName, name);
        action.name = actionDatum.name;
        if(actionDatum.moveAction) {
            action.name = warMap.actions.createNameString(action);
        }
        if(actionDatum.createdWith) {
            action.createdWith = actionDatum.createdWith;
        }
        if(actionDatum.start) {
            action.start = actionDatum.start
        }
        if(actionDatum.tribute) {
            action.tribute = actionDatum.tribute;
        }

        action.cost = actionDatum.cost;
        action.buy = actionDatum.buy;
        action.visible = actionDatum.visible;
        action.unlocked = actionDatum.unlocked;
        action.canBuy = actionDatum.canBuy;
        action.spend = actionDatum.spend;
    },
    addToConsole: function(name, action) {
        if(consoleLog.length > 12) {
            consoleLog.splice(0, 1);
        }
        consoleLog.push(levelData.totalMana + " mana: " + capitalizeFirst(name) + ": " + action.name);
    }
};

function getActionByVarName(varName, list) {
    if(["sleep", "pause", "restart"].indexOf(varName) !== -1) {
        return getOtherActionByVarName(varName);
    }

    if(list === "castle") {
        return getCastleActionByVarName(varName);
    } else if(list === "units") {
        return warMap.actions.getWarMapActionByVarName(varName);
    } else if(list === "king") {
        return getKingActionByVarName(varName);
    }
    return null;
}

function addAction() {
    if(["sleep", "pause", "restart"].indexOf(curInfoBox) !== -1) {
        curListNum = curList;
    }
    addActionToList(curInfoBox, curListNum, true);
    levelSave[curLevel].nextLists = listsToSimplified();
}

//loopCount and unitsToMove are for loading list from simple
function addActionToList(varName, num, switchLists, loopCount, unitsToMove, index) {
    if(switchLists && curList !== num) {
        switchListTab(num);
    }
    if(num === 2 && ["sleep", "pause", "restart"].indexOf(curInfoBox) === -1) {
        let validAction = false;
        for (let property in unitsSelectedForMove) {
            if (unitsSelectedForMove.hasOwnProperty(property)) {
                validAction = validAction || unitsSelectedForMove[property];
            }
        }
        if(!validAction) {
            return; //Do nothing if no units are selected for the move action
        }
    }
    let listName = actionsList.nextNames[num];
    let action = getActionByVarName(varName, listName);
    if(!action || JSON.stringify(action) === "{}") {
        console.log("Couldn't find action " + varName); //importing wrong actions
        return;
    }
    if(action.moveAction) {
        action.unitsToMove = unitsToMove ? unitsToMove : copyArray(unitsSelectedForMove); //for icons
    }
    if(action && action.visible() && action.unlocked() && (!action.allowed || getNumOnList(action.varName, listName) < action.allowed())) {
        let addAmount = loopCount ? loopCount : window.addAmount;
        if(action.allowed) {
            let numLeft = action.allowed() - getNumOnList(action.varName, listName);
            if(numLeft < addAmount) {
                addAmount = numLeft;
            }
        }

        addActionToNext(action, listName, addAmount, index);
    }
    actions.refresh(num);
}

function addActionToNext(action, listName, addAmount, index, isSplit) {
    let toAdd = {};
    toAdd.loops = addAmount;
    toAdd.varName = action.varName;
    if(action.unitsToMove) {
        toAdd.unitsToMove = action.unitsToMove;
    }

    let listToAdd = actionsList.next[listName];
    if(index !== undefined && index !== null) {
        if(!isSplit && isSameAction(listToAdd[index], toAdd)) {
            listToAdd[index].loops += toAdd.loops;
        } else if(!isSplit && isSameAction(listToAdd[index-1], toAdd)) {
            listToAdd[index-1].loops += toAdd.loops;
        } else {
            listToAdd.splice(index, 0, toAdd) //insert at index
        }
    } else {
        let actionAtIndex = listToAdd[listToAdd.length - 1];
        if(isSameAction(actionAtIndex, toAdd)) {
            actionAtIndex.loops += toAdd.loops;
        } else {
            listToAdd.push(toAdd);
            scrollToEnd = listName;
        }
    }
}

function isSameAction(action1, action2) {
    return action1 && action2 && action1.varName === action2.varName &&
        (!action2.unitsToMove || JSON.stringify(action2.unitsToMove) === JSON.stringify(action1.unitsToMove))
}

function getNumOnList(varName, listName) {
    let theList = actionsList.next[listName];
    let count = 0;
    for(let i = 0; i < theList.length; i++) {
        if(theList[i].varName === varName) {
            count += theList[i].loops;
        }
    }
    return count;
}
