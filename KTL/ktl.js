
let KTLMenuOpen = false;
function openKTLMenu() {
    document.getElementById('confirmKTL').checked = false;
    KTLMenuOpen = !KTLMenuOpen;
    views.updateVal("killTheLichMenu", KTLMenuOpen ? "flex" : "none", "style.display");
}

function resetKTLSpiral() {
    for(let actionVar in data.actions) {
        let dataObj = actionData[actionVar];
        if (dataObj.plane !== 2) {
            continue;
        }
        let actionObj = data.actions[actionVar];
        actionSetBaseVariables(actionObj, dataObj);
    }

    for(let actionVar in data.actions) {
        let dataObj = actionData[actionVar];
        if (dataObj.plane !== 2) {
            continue;
        }
        // let actionObj = data.actions[actionVar];
        for (let downstreamVar of dataObj.downstreamVars) {
            let downstreamDataObj = actionData[downstreamVar];
            if(downstreamDataObj.hasUpstream === false) {
                continue;
            }
            setSliderUI(actionVar, downstreamVar, 0);
        }
    }
}

function initializeKTL() {
    if(!document.getElementById('confirmKTL').checked ||
        !(isDebug || (data.actions.hearAboutTheLich.level >= 1 && data.totalSpellPower >= 1))) {
        return;
    }

    resetKTLSpiral();

    for(let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        actionObj.isRunning = actionObj.plane === 2;
    }

    unveilPlane(2);

    if(data.currentGameState.KTLBonusTimer > 60 * 60) {
        data.currentGameState.bonusTime += 1000 * 60 * 10; //10 mins bonus time FO FREE / should be a 1 point AC upgrade.
        // Can't be received faster than every hour.
        data.currentGameState.KTLBonusTimer = 0;
    }

    views.updateVal("openViewAmuletButton", "none", "style.display")
    if(data.doneAmulet) {
        data.useAmuletButtonShowing = true;
        views.updateVal("openUseAmuletButton", "", "style.display")
    }

    data.focusSelected = [];

    data.actions.overclockTargetingTheLich.resource = data.totalMomentum;
    data.actions.worry.resource = data.actions.hearAboutTheLich.resource;

    views.updateVal("killTheLichMenu", "none", "style.display")

    data.gameState = "KTL";



    //first time stuff
    document.getElementById("ancientCoinDisplay").style.display = "";
    data.doneKTL = true;
}

function openUseAmuletMenu(isUseable) {
    let isShowing = document.getElementById("useAmuletMenu").style.display !== "none";
    document.getElementById("useAmuletMenu").style.display = isShowing ? "none" : "flex";
    document.getElementById('amuletConfirm').checked = false;

    updateCardAffordabilityBorders();
}

function useAmulet() {
    if(!document.getElementById('amuletConfirm').checked) {
        return;
    }
    chartData = [];
    data.focusSelected = [];
    data.doneAmulet = true;
    views.updateVal(`useAmuletMenu`, "none", "style.display");
    views.updateVal(`openUseAmuletButton`, "none", "style.display");
    views.updateVal(`openViewAmuletButton`, "", "style.display");

    //Reset all atts and bonuses
    for(let attVar in data.atts) {
        let attObj = data.atts[attVar];
        if(attObj.attCategory !== "echoes") {
            attsSetBaseVariables(attObj);
        }
    }
    data.atts.legacy.num *= .1 * (data.upgrades.feelTheEchoesOfMyPast.upgradePower + 1);
    recalcAttMult("legacy");


    //For each action, reset the base atts and set max level
    for(let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        let dataObj = actionData[actionVar];
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

        dataObj.downstreamVars.forEach(function(downstreamVar) {
            if(data.actions[downstreamVar] && data.actions[downstreamVar].unlocked && data.actions[downstreamVar].hasUpstream) {
                setSliderUI(actionObj.actionVar, downstreamVar, getUpgradeSliderAmount()); //reset with amulet
            }
            let currentMult = actionObj[downstreamVar + "FocusMult"];

            actionObj[downstreamVar + "FocusMult"] = (currentMult - 1) * [0, .2, .5][data.upgrades.knowWhatIFocusedOn.upgradePower] + 1;
        });
    }

    setSliderUI("overclock", "reflect", getUpgradeSliderAmount()); //manual reset for actions with no parents
    data.secondsPerReset = 0;
    data.currentJob = "Helping Scott";
    data.currentWage = 1;
    data.gameState = "default";
    data.useAmuletButtonShowing = false;
}