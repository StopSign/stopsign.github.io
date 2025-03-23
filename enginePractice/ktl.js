

function openKTLMenu() {
    document.getElementById('confirmKTL').checked = false;
    let isShowing = view.cached.killTheLichMenu.style.display !== "none";
    view.cached.killTheLichMenu.style.display = isShowing ? "none" : "flex";
}

function initializeKTL() {
    if(!document.getElementById('confirmKTL').checked || data.totalMomentum < 1.1e6) {
        return;
    }
    view.cached.killTheLichMenu.style.display = "none";

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
    forceVisuals = true;
}

function openUseAmuletMenu(isUseable) {
    let isShowing = document.getElementById("useAmuletMenu").style.display !== "none";
    document.getElementById("useAmuletMenu").style.display = isShowing ? "none" : "flex";
    document.getElementById('amuletConfirm').checked = false;

    document.getElementById("amuletEnabledContainer").style.display = isUseable ? "" : "none";
}

function useAmulet() {
    if(!document.getElementById('amuletConfirm').checked) {
        return;
    }
    document.getElementById("useAmuletMenu").style.display = "none";
    document.getElementById("openViewAmuletButton").style.display = "";

    //Reset all stats and bonuses
    data.statNames.forEach(function (statName) {
        let statObj = data.stats[statName];
        statsSetBaseVariables(statObj);
    });

    //For each action, reset the base stats and set max level
    data.actionNames.forEach(function(actionVar) {
        let actionObj = data.actions[actionVar];
        let newLevel = actionObj.level;
        actionObj.prevUnlockTime = actionObj.unlockTime;

        if (data.upgrades.rememberWhatIDid.isFullyBought) {
            // Sort and insert the new level into the top 3 if applicable;
            if (newLevel > actionObj.highestLevel) {
                actionObj.thirdHighestLevel = actionObj.secondHighestLevel;
                actionObj.secondHighestLevel = actionObj.highestLevel;
                actionObj.highestLevel = newLevel;
            } else if (newLevel > actionObj.secondHighestLevel) {
                actionObj.thirdHighestLevel = actionObj.secondHighestLevel;
                actionObj.secondHighestLevel = newLevel;
            } else if (newLevel > actionObj.thirdHighestLevel) {
                actionObj.thirdHighestLevel = newLevel;
            }
        }


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
    forceVisuals = true;
}