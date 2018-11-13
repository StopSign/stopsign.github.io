let actions = {
    tick: function() {
        //get a list of valid actions, moving to next if cost fails
        this.validActions = [-1, -1, -1, -1];
        for(let i = 0; i < actionsList.nextNames.length; i++) {
            let name = actionsList.nextNames[i];
            let list = actionsList.current[name];
            for(let j = 0; j < list.length; j++) {
                let action = list[j];
                if(action.loopsLeft !== 0 && action.canBuy()) {
                    this.validActions[i] = j;
                    break;
                }
            }
        }

        //if no actions, create sleep action. If sleep action already, add to it
        for(let i = 0; i < actionsList.nextNames.length; i++) {
            let name = actionsList.nextNames[i];
            if(this.validActions[i] === -1) {
                addSleepAction(name);
                this.validActions[i] = actionsList.current[name].length - 1;
            }
        }


        //add tick to each action. if it finishes, get the rewards
    },
    restart: function() {
        this.validActions = [-1, -1, -1, -1];
        actionsList.current = {
            king:[],
            castle:[],
            units:[],
            lab:[]
        };
        actions.refresh();
    },
    refresh: function() {
        //takes everything new on actionsList.next and puts it in actionsList.current
        for(let i = 0; i < actionsList.nextNames.length; i++) {
            let name = actionsList.nextNames[i];
            let list = actionsList.next[name];
            let numOnList = {};
            for(let j = 0; j < list.length; j++) {
                if(this.validActions[i] >= j) { //only modify untouched ones
                    continue;
                }
                let action = copyArray(list[j]);
                let numPrior = numOnList[action.varName] ? numOnList[action.varName] : 0;
                translateNextToCurrent(action, name, numPrior);
                numOnList[action.varName] = numPrior + action.loops;
                actionsList.current[name][j] = action;
            }
            if(this.validActions[i] < list.length) {
                actionsList.current[name].splice(list.length, actionsList.current[name].length - list.length);
            }
        }
    }
};

function translateNextToCurrent(action, name, numPrior) {
    action.loopsLeft = action.loops;
    action.timeTaken = 0;
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

function addActionToList(varName, listName) {
    let action = getActionByVarName(varName, listName);
    if(action && action.visible() && action.unlocked() && (!action.allowed || getNumOnList(action.varName, listName) < action.allowed())) {
        let addAmount = window.addAmount;
        if(action.allowed) {
            let numLeft = action.allowed() - getNumOnList(action.varName, listName);
            if(numLeft < addAmount) {
                addAmount = numLeft;
            }
        }

        addAction(action, listName, addAmount);
    }
    actions.refresh();
}

function addAction(action, listName, addAmount, index) {
    let toAdd = {};
    toAdd.loops = addAmount;
    toAdd.varName = action.varName;

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