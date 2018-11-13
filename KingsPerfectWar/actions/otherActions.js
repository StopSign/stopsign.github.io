
function addSleepAction(name) {
    addActionToList("sleep", name);
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
    action.visible = function() { return true };
    action.unlocked = function() { return true };
    return action;
}