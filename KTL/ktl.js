
let KTLMenuOpen = false;
function openKTLMenu() {
    document.getElementById('confirmKTL').checked = false;
    KTLMenuOpen = !KTLMenuOpen;
    views.updateVal("killTheLichMenu", KTLMenuOpen ? "flex" : "none", "style.display");

    if(data.upgrades.rememberWhatIFocusedOn.upgradePower > 0) {
        let permFocusMessage = document.getElementById("permFocusMessage");
        let amountToAdd = Math.pow(data.actions.hearAboutTheLich.level, 2) / 100;
        let text = `<br><br>You will be adding +${intToString(amountToAdd, 3)} permanent focus mult to the following lines:<br>`;
        let maxPermFocus = data.upgrades.rememberWhatIFocusedOn.upgradePower + 1;
        for (let focusObj of data.focusSelected) {
            let fromActionObj = data.actions[focusObj.lineData.from];
            let fromDataObj = actionData[focusObj.lineData.from];
            let toDataObj = actionData[focusObj.lineData.to];
            let currentPerm = fromActionObj[`${focusObj.lineData.to}PermFocusMult`];
            let color = "";
            if (currentPerm === maxPermFocus) { //colors are backwards
                color = "var(--warning-color)"
            } else if (currentPerm + amountToAdd > maxPermFocus) {
                color = "var(--error-color)";
            }
            text += `<span style="color:${color}">- From ${fromDataObj.title} to ${toDataObj.title}, permanent focus bonus is ${intToString(currentPerm, 3)} / ${intToString(maxPermFocus, 3)}`
            if (currentPerm === maxPermFocus) {
                text += ` | Warning: This will gain no bonus`
            } else if (currentPerm + amountToAdd > maxPermFocus) {
                text += ` | Warning: This will max it`
            }
            if(currentPerm)
            text += `</span><br>`;
        }
        permFocusMessage.innerHTML = text;
    }
}

function resetKTLSpiral() {
    for (let actionVar in data.actions) {
        let dataObj = actionData[actionVar];
        if (dataObj.plane !== 2) {
            continue;
        }
        let actionObj = data.actions[actionVar];
        actionSetBaseVariables(actionObj, dataObj);
    }

    for (let actionVar in data.actions) {
        let dataObj = actionData[actionVar];
        if (dataObj.plane !== 2) {
            continue;
        }
        // let actionObj = data.actions[actionVar];
        for (let downstreamVar of dataObj.downstreamVars) {
            let downstreamDataObj = actionData[downstreamVar];
            if (downstreamDataObj.hasUpstream === false) {
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
            hatl1Time: data.actions.hearAboutTheLich.level1Time,
            currentLegacy: data.atts.legacy.num,
            resetCount: data.resetCount,
            currentMomentum: data.totalMomentum,
            currentFear: data.actions.hearAboutTheLich.resource,
            currentTeamwork: data.actions.trainWithTeam.resource
        },
        stage2: null
    });
    if (data.resetLogs.length > 10) data.resetLogs.shift();
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
    if (!document.getElementById('confirmKTL').checked ||
        !(isDebug || (data.actions.hearAboutTheLich.level >= 1 && data.maxSpellPower >= 1))) {
        return;
    }
    trackFirst();
    logKTL();

    resetKTLSpiral();

    for (let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        actionObj.isRunning = actionObj.plane === 2;
    }

    unveilPlane(2);
    switchToPlane(2);

    if (data.currentGameState.KTLBonusTimer > 60 * 60) {
        data.currentGameState.bonusTime += 1000 * 60 * 10; //10 mins bonus time FO FREE / should be a 1 point AC upgrade.
        // Can't be received faster than every hour.
        data.currentGameState.KTLBonusTimer = 0;
    }

    views.updateVal("openViewAmuletButton", "none", "style.display")
    if (data.doneAmulet) {
        views.updateVal("openUseAmuletButton", "", "style.display")
    }

    for (let focusObj of data.focusSelected) {
        unhighlightLine(focusObj.borderId);
        let power = data.upgrades.rememberWhatIFocusedOn.upgradePower + 1;
        if (data.upgrades.rememberWhatIFocusedOn.upgradePower > 0) {
            let actionObj = data.actions[focusObj.lineData.from];
            actionObj[focusObj.lineData.to + "PermFocusMult"] += Math.pow(data.actions.hearAboutTheLich.level, 2) / 100;
            if (actionObj[focusObj.lineData.to + "PermFocusMult"] > power) {
                actionObj[focusObj.lineData.to + "PermFocusMult"] = power;
            }
        }
    }
    data.focusSelected = [];

    data.actions.overclockTargetingTheLich.resource = data.totalMomentum;
    data.actions.worry.resource = data.actions.hearAboutTheLich.resource;
    //Don't penalize players who over-leveled Learned of Lich signs.  Convert any partial leveling of extra levels to "worry"
    if (data.actions.hearAboutTheLich.level >= 2) {
        data.actions.worry.resource += data.actions.hearAboutTheLich.progress
    }
    actionData.overclockTargetingTheLich.updateMults();

    views.updateVal("killTheLichMenu", "none", "style.display")

    data.gameState = "KTL";


    revealAtt("doom");
    revealAtt("courage");
    data.actions.fightTheEvilForces.unlockCost = 0;
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
    views.updateVal(`useAmuletMenu`, isShowing ? "none" : "", "style.display");
    document.getElementById('amuletConfirm').checked = false;

    //if not useable, hide all the buy buttons, and the bottom section w/ start again buttons
    for (const upgradeVar in data.upgrades) {
        const upgrade = data.upgrades[upgradeVar];
        const upgradeDataObj = upgradeData[upgradeVar];

        views.updateVal(`buyButtonSection_${upgradeVar}`, isUseable && !upgrade.isFullyBought ? "" : 'none', 'style.display');
    }

    views.updateVal(`amuletMenuTitle`, isUseable ? "Use the Amulet!" : "View Amulet Upgrades");

    views.updateVal(`amuletEnabledContainer`, isUseable ? "" : 'none', 'style.display');

    refreshUpgradeVisibility();
    updateCardAffordabilityBorders();
}

function logAmulet() {
    const currentLog = data.resetLogs[data.resetLogs.length - 1];
    if (currentLog) {
        currentLog.stage2 = {
            legacyGained: data.atts.legacy.num - currentLog.stage1.currentLegacy,
            ancientCoin: data.ancientCoinGained
        };
    }
    refreshResetLog()
}

function useAmulet() {
    if (!document.getElementById('amuletConfirm').checked) {
        return;
    }
    logAmulet();
    clearLog();

    data.resetCount++;

    chartData = [];
    for (let focusObj of data.focusSelected) {
        unhighlightLine(focusObj.borderId);
    }
    data.focusSelected = [];
    data.doneAmulet = true;
    data.secondsPerReset = 0;
    data.currentJob = "helpScottWithChores";
    data.currentWage = 1;
    data.gameState = "default";
    views.updateVal(`useAmuletMenu`, "none", "style.display");
    views.updateVal(`openUseAmuletButton`, "none", "style.display");
    views.updateVal(`openViewAmuletButton`, "", "style.display");
    data.legacyMultKTL = 1;
    data.ancientCoinMultKTL = 1;
    data.chargedSpellPowers = {};

    //Reset all atts and bonuses
    for (let attVar in data.atts) {
        let attObj = data.atts[attVar];
        if (attObj.attCategory !== "echoes") {
            attsSetBaseVariables(attObj);
        }
    }
    data.atts.legacy.num *= [.1, .5, 1][data.upgrades.feelTheEchoesOfMyPast.upgradePower];
    recalcAttMult("legacy");

    //clear the Containers of Atts around the Actions before it reveals one at a time based on stats and visible
    for (let actionVar in data.actions) {
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
    for (let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        let dataObj = actionData[actionVar];
        let newLevel = actionObj.level;
        actionObj.prevUnlockTime = actionObj.unlockTime;
        actionObj.prevLevel1Time = actionObj.level1Time;

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

        let originalState = {};
        originalState.unlocked = actionObj.unlocked;
        originalState.unlockCost = actionObj.unlockCost;
        originalState.currentMenu = actionObj.currentMenu;

        actionResetToBase(actionVar);
        if (dataObj.plane === 1) {
            actionObj.unlocked = originalState.unlocked;
            actionObj.unlockCost = originalState.unlockCost;
        }
        actionObj.currentMenu = originalState.currentMenu;

        //happens after reset
        dataObj.downstreamVars.forEach(function (downstreamVar) {
            if (data.actions[downstreamVar] && data.actions[downstreamVar].hasUpstream) {
                setSliderUI(actionObj.actionVar, downstreamVar, 0); //reset with amulet
            }

            actionObj[downstreamVar + "TempFocusMult"] = 2;
        });

        if (dataObj.updateMults) {
            dataObj.updateMults();
        }

        //also display pins
        views.updateVal(`${actionVar}PinButton`, "", "style.display");
    }


    //After the reset
    for (let attCategory in attTree) {
        if (attCategory === "echoes") {
            continue;
        }
        views.updateVal(`${attCategory}CategoryContainer`, "none", "style.display");
    }
    data.actions.echoKindle.resource += data.atts.legacy.num;
    actionData.poolMana.generatorSpeed = 6;

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
    actionTitleClicked("overclock", true);

    //force the UI reset:
    for (let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        // let dataObj = actionData[actionVar];
        views.updateActionUnlockedViews(actionObj)
    }

    applyUpgradeEffects()

    data.currentWage = 1;
    data.currentJob = "helpScottWithChores";
    document.getElementById("jobTitle").textContent = data.actions[data.currentJob] ? actionData[data.currentJob].title : data.currentJob;
    document.getElementById("jobWage").textContent = intToString(data.currentWage, 2);

    setSliderUI("overclock", "reflect", getUpgradeSliderAmount());
    setSliderUI("poolMana", "expelMana", getUpgradeSliderAmount());

    views.updateVal(`killTheLichMenuButton2`, "Fight the Lich's Forces!");
}