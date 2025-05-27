
let KTLMenuOpen = false;
function openKTLMenu() {
    document.getElementById('confirmKTL').checked = false;
    KTLMenuOpen = !KTLMenuOpen;
    views.updateVal("killTheLichMenu", KTLMenuOpen ? "flex" : "none", "style.display");
}

function initializeKTL() {
    if(!document.getElementById('confirmKTL').checked || (!isDebug && data.totalMomentum < 1.1e6)) {
        return;
    }
    data.focusSelected = [];

    views.updateVal("killTheLichMenu", "none", "style.display")

    data.gameState = "KTL";
    for(let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];

        actionObj.isRunning = actionObj.isKTL;
        actionObj.visible = actionObj.isKTL;
    }

    data.actions.overclockTargetingTheLich.momentum = data.totalMomentum;

    views.updateVal("openUseAmuletButton", "", "style.display")

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
    data.focusSelected = [];
    data.doneAmulet = true;
    document.getElementById("useAmuletMenu").style.display = "none";
    document.getElementById("openViewAmuletButton").style.display = "";

    //Reset all atts and bonuses
    for(let attVar in data.atts) {
        let attObj = data.atts[attVar];
        attsSetBaseVariables(attObj);
    }

    //set overclock to the upgrade-relevant %

    //For each action, reset the base atts and set max level
    for(let actionVar in data.actions) {
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
            let currentMult = actionObj[downstreamVar + "FocusMult"];

            actionObj[downstreamVar + "FocusMult"] = (currentMult - 1) * [0, .2, .5, .9, 1][data.upgrades.knowWhatIFocusedOn.upgradePower] + 1;
        });
    }

    setSliderUI("overclock", "reflect", getUpgradeSliderAmount());
    data.secondsPerReset = 0;
    data.currentJob = "Helping Scott";
    data.currentWage = 1;
    data.gameState = "default";
    data.useAmuletButtonShowing = false;
    forceVisuals = true;
}