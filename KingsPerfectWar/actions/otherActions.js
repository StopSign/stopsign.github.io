
function getOtherAction(varName) {
    if(varName === "sleep") {
        return getSleepAction();
    } else if(varName === "pause") {
        return getPauseAction();
    } else if(varName === "restart") {
        return getRestartAction();
    }
}

function addSleepAction(num) {
    addActionToList("sleep", num, false);
}

function addPauseAction(num) {
    addActionToList("pause", num, false);
}

function addRestartAction(num) {
    addActionToList("restart", num, false);
}

function getSleepAction() {
    let action = {};
    action.name = "Sleep";
    action.cost = [
        {
            resource:"seconds",
            type:"static",
            starting:1
        }
    ];
    action.varName = "sleep";
    action.canBuy = function() { return true };
    action.visible = function() { return true };
    action.unlocked = function() { return true };
    return action;
}

function getPauseAction() {
    let action = {};
    action.name = "Pause";
    action.cost = [
        {
            resource:"seconds",
            type:"static",
            starting:0
        }
    ];
    action.varName = "pause";
    action.canBuy = function() { return true };
    action.visible = function() { return true };
    action.unlocked = function() { return true };
    return action;
}

function getRestartAction() {
    let action = {};
    action.name = "Restart";
    action.cost = [
        {
            resource:"seconds",
            type:"static",
            starting:5
        }
    ];
    action.varName = "restart";
    action.canBuy = function() { return true };
    action.visible = function() { return true };
    action.unlocked = function() { return true };
    action.buy = function() { mana = 0; };
    return action;
}