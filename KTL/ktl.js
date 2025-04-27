

function openKTLMenu() {
    document.getElementById('confirmKTL').checked = false;
    let isShowing = view.cached.killTheLichMenu.style.display !== "none";
    view.cached.killTheLichMenu.style.display = isShowing ? "none" : "flex";
}

function initializeKTL() {
    if(!document.getElementById('confirmKTL').checked || (!isDebug && data.totalMomentum < 1.1e6)) {1
        return;
    }
    data.attentionSelected = [];
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
    data.doneKTL = true;
    if(data.doneAmulet) {
        data.useAmuletButtonShowing = true;
    }
}

function openUseAmuletMenu(isUseable) {
    let isShowing = document.getElementById("useAmuletMenu").style.display !== "none";
    document.getElementById("useAmuletMenu").style.display = isShowing ? "none" : "flex";
    document.getElementById('amuletConfirm').checked = false;

    // document.getElementById("infoTextButton").style.display = isUseable ? "" : "none";
}

function useAmulet() {
    if(!document.getElementById('amuletConfirm').checked) {
        return;
    }
    data.attentionSelected = [];
    data.doneAmulet = true;
    document.getElementById("useAmuletMenu").style.display = "none";
    document.getElementById("openViewAmuletButton").style.display = "";

    //Reset all stats and bonuses
    data.statNames.forEach(function (statName) {
        let statObj = data.stats[statName];
        statsSetBaseVariables(statObj);
    });

    //set overclock to the upgrade-relevant %

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
                setSliderUI(actionObj.actionVar, downstreamVar, getUpgradeSliderAmount());
            }
            let currentMult = actionObj[downstreamVar + "AttentionMult"];

            actionObj[downstreamVar + "AttentionMult"] = (currentMult - 1) * [0, .2, .5, .9, 1][data.upgrades.knowWhatIFocusedOn.upgradePower] + 1;
        });
    });

    setSliderUI("overclock", "harnessOverflow", getUpgradeSliderAmount());
    data.secondsPerReset = 0;
    data.currentJob = "Helping Scott";
    data.currentWage = 1;
    data.gameState = "default";
    data.useAmuletButtonShowing = false;
    document.getElementById("killTheLichMenuButton").style.display = "";
    forceVisuals = true;
}