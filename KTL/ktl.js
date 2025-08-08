
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

function logKTL() {
    data.resetLogs.push({
        stage1: {
            secondsPerReset: data.secondsPerReset,
            legacyGained: data.atts.legacy.num
        },
        stage2: null
    });
    if (data.resetLogs.length > 5) data.resetLogs.shift();
    data.ancientCoinGained = 0;
    refreshResetLog();
}

function trackFirst() {
    if (!localStorage.getItem('firstResetSent')) {
        gtag('event', 'first_reset', {
            seconds_per_reset: data.secondsPerReset
        });
        localStorage.setItem('firstResetSent', 'true');
    }
}

function refreshResetLog() {
    document.getElementById("resetLogContainer").innerHTML = renderResetLog();
}

function initializeKTL() {
    if(!document.getElementById('confirmKTL').checked ||
        !(isDebug || (data.actions.hearAboutTheLich.level >= 1 && data.totalSpellPower >= 1))) {
        return;
    }
    trackFirst();
    logKTL();

    resetKTLSpiral();

    for(let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        actionObj.isRunning = actionObj.plane === 2;
    }

    unveilPlane(2);
    switchToPlane(2);

    if(data.currentGameState.KTLBonusTimer > 60 * 60) {
        data.currentGameState.bonusTime += 1000 * 60 * 10; //10 mins bonus time FO FREE / should be a 1 point AC upgrade.
        // Can't be received faster than every hour.
        data.currentGameState.KTLBonusTimer = 0;
    }

    views.updateVal("openViewAmuletButton", "none", "style.display")
    if(data.doneAmulet) {
        views.updateVal("openUseAmuletButton", "", "style.display")
    }

    data.focusSelected = [];

    data.actions.overclockTargetingTheLich.resource = data.totalMomentum;
    data.actions.worry.resource = data.actions.hearAboutTheLich.resource;
    actionData.overclockTargetingTheLich.updateMults();

    views.updateVal("killTheLichMenu", "none", "style.display")

    data.gameState = "KTL";



    revealAtt("doom");
    revealAtt("courage");
    unveilAction('worry');
    unveilAction('resolve');
    unveilAction('fightTheEvilForces');
    unveilAction('overclockTargetingTheLich');
    unlockAction(data.actions.worry);
    unlockAction(data.actions.resolve);
    unlockAction(data.actions.fightTheEvilForces);
    unlockAction(data.actions.overclockTargetingTheLich);



    //first time stuff
    document.getElementById("ancientCoinDisplay").style.display = "";
    data.doneKTL = true;
}

function openUseAmuletMenu(isUseable) {
    let isShowing = document.getElementById("useAmuletMenu").style.display !== "none";
    document.getElementById("useAmuletMenu").style.display = isShowing ? "none" : "flex";
    document.getElementById('amuletConfirm').checked = false;

    //if not useable, hide all the buy buttons, and the bottom section w/ start again buttons
    for (const upgradeVar in data.upgrades) {
        const upgrade = data.upgrades[upgradeVar];
        const upgradeDataObj = upgradeData[upgradeVar];

        views.updateVal(`buyButtonSection_${upgradeVar}`, isUseable&&!upgrade.isFullyBought?"":'none', 'style.display');
    }

    views.updateVal(`amuletEnabledContainer`, isUseable?"":'none', 'style.display');

    updateCardAffordabilityBorders();
}

function logAmulet() {
    const currentLog = data.resetLogs[data.resetLogs.length - 1];
    if (currentLog) {
        currentLog.stage2 = {
            legacyGained: data.atts.legacy.num - currentLog.stage1.legacyGained,
            ancientCoin: data.ancientCoinGained
        };
    }
    refreshResetLog()
}

function useAmulet() {
    if(!document.getElementById('amuletConfirm').checked) {
        return;
    }
    logAmulet();

    chartData = [];
    data.focusSelected = [];
    data.doneAmulet = true;
    data.secondsPerReset = 0;
    data.currentJob = "helpScottWithChores";
    data.currentWage = 1;
    data.gameState = "default";
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
    data.atts.legacy.num *= [.1, .5, 1][data.upgrades.feelTheEchoesOfMyPast.upgradePower];
    recalcAttMult("legacy");

    //clear the Containers of Atts around the Actions before it reveals one at a time based on stats and visible
    for(let actionVar in data.actions) {
        let dataObj = actionData[actionVar];
        for (let attVarObj of dataObj.expAtts) {
            views.updateVal(`${actionVar}${attVarObj[0]}OutsideContainerexp`, "none", "style.display");
            views.updateVal(`${actionVar}${attVarObj[0]}InsideContainerexp`, "none", "style.display");
            views.updateVal(`${actionVar}AttExpContainer`, "none", "style.display");
        }
        for (let attVarObj of dataObj.efficiencyAtts) {
            views.updateVal(`${actionVar}${attVarObj[0]}OutsideContainereff`, "none", "style.display");
            views.updateVal(`${actionVar}${attVarObj[0]}InsideContainereff`, "none", "style.display");
            views.updateVal(`${actionVar}AttEfficiencyContainer`, "none", "style.display");
        }
    }
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

        let propsToPreserve = ['unlocked', 'unlockCost', 'currentMenu'];
        let originalState = {};

        for (let prop of propsToPreserve) {
            originalState[prop] = actionObj[prop];
        }

        actionResetToBase(actionVar);

        if (dataObj.plane === 1) {
            for (let prop of propsToPreserve) {
                actionObj[prop] = originalState[prop];
            }
        }

        //happens after reset
        dataObj.downstreamVars.forEach(function(downstreamVar) {
            if(data.actions[downstreamVar] && data.actions[downstreamVar].unlocked && data.actions[downstreamVar].hasUpstream) {
                setSliderUI(actionObj.actionVar, downstreamVar, getUpgradeSliderAmount()); //reset with amulet
            }
            let currentMult = actionObj[downstreamVar + "FocusMult"];

            //focusMult does not reset other than this
            actionObj[downstreamVar + "FocusMult"] = (currentMult - 1) * [0, .2, .5][data.upgrades.knowWhatIFocusedOn.upgradePower] + 1;
        });

        if(dataObj.updateMults) {
            dataObj.updateMults();
        }

    }



    //After the reset
    for (let attCategory in attTree) {
        if(attCategory === "echoes") {
            continue;
        }
        views.updateVal(`${attCategory}CategoryContainer`, "none", "style.display");
    }
    data.actions.echoKindle.resource += data.atts.legacy.num;
    data.actions.poolMana.generatorSpeed = 6;

    switchToPlane(0)
    data.planeUnlocked[2] = false;
    views.updateVal(`planeButton2`, "none", "style.display");

    showAttColors("awareness");
    revealActionAtts(data.actions.reflect);
    //Unveil will also show the relevant atts/att
    unveilAction('echoKindle')
    unveilAction('sparkMana')
    unveilAction('poolMana')
    unveilAction('expelMana')

    //force the UI reset:
    for(let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        // let dataObj = actionData[actionVar];
        views.updateActionUnlockedViews(actionObj)
    }

    data.currentWage = 1;
    data.currentJob = "helpScottWithChores";
    document.getElementById("jobTitle").textContent = data.actions[data.currentJob] ? data.actions[data.currentJob].title : data.currentJob;
    document.getElementById("jobWage").textContent = intToString(data.currentWage, 2);

    setSliderUI("overclock", "reflect", getUpgradeSliderAmount());
    setSliderUI("poolMana", "expelMana", getUpgradeSliderAmount());
}