

function openKTLMenu() {
    let isShowing = document.getElementById("killTheLichMenu").style.display !== "none";
    document.getElementById("killTheLichMenu").style.display = isShowing ? "none" : "flex";
}

function initializeKTL() {
    document.getElementById("killTheLichMenu").style.display = "none";

    data.gameState = "KTL";
    data.actionNames.forEach(function(actionVar) {
        let actionObj = data.actions[actionVar];

        actionObj.isRunning = actionObj.isKTL;
        actionObj.visible = actionObj.isKTL;
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
    document.getElementById("useAmuletMenu").style.display = "none";

    //Reset all stats and bonuses
    data.statNames.forEach(function (statName) {
        let statObj = data.stats[statName];
        statsSetBaseVariables(statObj);
    });

    //For each action, reset the base stats and set max level
    data.actionNames.forEach(function(actionVar) {
        let actionObj = data.actions[actionVar];
        actionObj.highestLevel = actionObj.level;
        actionObj.prevUnlockTime = actionObj.unlockTime;

        actionResetToBase(actionVar);

        actionObj.downstreamVars.forEach(function(downstreamVar) {
            if(data.actions[downstreamVar] && data.actions[downstreamVar].unlocked) {
                setSliderUI(actionObj.actionVar, downstreamVar, 0);
            }
        });
    });

    data.secondsPerReset = 0;
    data.currentJob = "Helping Scott";
    data.currentWage = 1;
    data.gameState = "default";
    data.useAmuletButtonShowing = false;
    document.getElementById("killTheLichMenuButton").style.display = "";
}