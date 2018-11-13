let actions = {
    tick: function() {
        //get a list of valid actions, moving to next if cost fails
        for(let i = 0; i < actionsList.nextNames.length; i++) {
            let name = actionsList.nextNames[i];
            let list = actionsList.current[name];
            let action = list[this.validActions[i]];
            while(action && (action.loopsLeft === 0 || !action.canBuy())) { //action exists but is invalid, slide
                this.validActions[i]++;
                action = list[this.validActions[i]];
            }
            if(!action) { //Never found a valid action, create sleep TODO If sleep action already, add to it
                addSleepAction(i);
                action = list[this.validActions[i]];
            }
        }

        //add tick to each action. if it finishes, get the rewards
        for(let i = 0; i < actionsList.nextNames.length; i++) {
            let name = actionsList.nextNames[i];
            let action = actionsList.current[name][this.validActions[i]];
            action.manaUsed++;
            if(action.manaUsed / 10 >= action.costseconds) {
                action.loopsLeft--;
                if(action.loopsLeft > 0) {
                    action.manaUsed = 0;
                }
                if(action.buy) {
                    action.buy();
                    action.spend();
                }
            }
        }
    },
    restart: function() {
        this.validActions = [0, 0, 0, 0];
        actionsList.current = {
            king:[],
            castle:[],
            units:[],
            lab:[]
        };
        for(let i = 0; i < actionsList.nextNames.length; i++) {
            // let name = actionsList.nextNames[i];
            // if(actionsList.next[name][0]) {
            //     addSleepAction(i);
            // } else {
                actions.refresh(i);
            // }
        }
    },
    refresh: function(num) {
        //takes everything new on actionsList.next and puts it in actionsList.current
        let name = actionsList.nextNames[num];
        let list = actionsList.next[name];
        let numOnList = {};
        for(let j = 0; j < list.length; j++) {
            let curAction = actionsList.current[name][j];
            if(this.validActions[num] > j || //only modify untouched ones
                (this.validActions[num] === j && curAction && (curAction.manaUsed !== 0 || curAction.loopsLeft !== curAction.loops))) { //and ones not being messed with
                continue;
            }
            let action = copyArray(list[j]);
            let numPrior = numOnList[action.varName] ? numOnList[action.varName] : 0;
            translateNextToCurrent(action, name, numPrior);
            numOnList[action.varName] = numPrior + action.loops;
            actionsList.current[name][j] = action;
        }
        if(this.validActions[num] !== -1 && this.validActions[num] < list.length && actionsList.current[name].length !== list.length) { //remove extra actions from current list
            actionsList.current[name].splice(list.length, actionsList.current[name].length - list.length);
        }
    }
};

function translateNextToCurrent(action, name, numPrior) {
    action.loopsLeft = action.loops;
    action.manaUsed = 0;
    action.costseconds = 0;
    action.costgold = 0;
    action.costwood = 0;
    action.costmana = 0;

    let actionData = getActionByVarName(action.varName, name);
    for(let i = 0; i < actionData.cost.length; i++) {
        let cost = actionData.cost[i];
        let amount = 0;
        if(cost.type === "static") {
            amount += cost.starting;
        } else if(cost.type === "linear") {
            amount += cost.starting + cost.growth * numPrior;
        }
        action["cost"+cost.resource] = amount;
    }
    action.canBuy = function() {
        return gold >= action.costgold && wood >= action.costwood && mana >= action.costmana;
    };
    action.spend = function() {
        gold -= action.costgold;
        wood -= action.costwood;
        mana -= action.costmana;
    };
}

function getActionByVarName(varName, list) {
    if(varName === "sleep") {
        return getSleepAction();
    }
    if(list === "castle") {
        return getCastleActionByVarName(varName);
    }
    return null;
}

function addActionToList(varName, num) {
    let listName = actionsList.nextNames[num];
    let action = getActionByVarName(varName, listName);
    if(action && action.visible() && action.unlocked() && (!action.allowed || getNumOnList(action.varName, listName) < action.allowed())) {
        let addAmount = window.addAmount;
        if(action.allowed) {
            let numLeft = action.allowed() - getNumOnList(action.varName, listName);
            if(numLeft < addAmount) {
                addAmount = numLeft;
            }
        }

        addActionToNext(action.varName, listName, addAmount);
    }
    actions.refresh(num);
}

function addActionToNext(varName, listName, addAmount, index) {
    let toAdd = {};
    toAdd.loops = addAmount;
    toAdd.varName = varName;

    if(index !== undefined) {
        actionsList.next[listName].splice(index, 0, toAdd) //insert at index
    } else {
        actionsList.next[listName].push(toAdd);
    }
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