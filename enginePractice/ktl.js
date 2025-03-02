

function openKTLMenu() {
    let isShowing = document.getElementById("killTheLichMenu").style.display !== "none";
    document.getElementById("killTheLichMenu").style.display = isShowing ? "none" : "flex";
}

function initializeKTL() {
    data.gameState = "KTL";
    data.actionNames.forEach(function(actionVar) {
        let actionObj = data.actions[actionVar];

        actionObj.isRunning = (data.gameState === "default" && !actionObj.isKTL) ||
            (data.gameState === "KTL" && actionObj.isKTL);
        if(!actionObj.isRunning) {
            actionObj.visible = false;
        }
    });

    data.actions.overclockTargetingTheLich.momentum = data.totalMomentum;
    document.getElementById("killTheLichMenuButton").style.display = "none";
    view.cached.openUseAmuletButton.style.display = "";
    document.getElementById("essenceDisplay").style.display = "";
}

function openUseAmuletMenu() {
    let isShowing = document.getElementById("useAmuletMenu").style.display !== "none";
    document.getElementById("useAmuletMenu").style.display = isShowing ? "none" : "flex";
}

function useAmulet() {
    //For each action, reset the base stats and set max level

    data.actionNames.forEach(function(actionVar) {
        let actionObj = data.actions[actionVar];
        actionObj.highestLevel = actionObj.maxLevel;
        actionObj.prevUnlockTime = actionObj.unlockTime;


        resetActionToBase(actionVar);
    });

    data.gameState = "default";

    /*
    1. Process all actions
    1a. Clear them back to what actionData says
    1b. Set their highest levels
    1c. Start up the generators again

     */
    view.cached.openUseAmuletButton.style.display = "none";
}