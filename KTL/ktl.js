
let gameIsResetting = false;
let KTLMenuOpen = false; //for the necessary UI updates to work while the menu is open
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
            setSliderUI(actionVar, downstreamVar, 100);
        }
    }

    adjustNWLevels()
}

function trackFirst() {
    if (!localStorage.getItem('firstResetSent')) {
        gtag('event', 'first_reset', {
            seconds_per_reset: data.secondsPerReset
        });
        localStorage.setItem('firstResetSent', 'true');
    }
}


//stuff that happens both on LS an amulet
function resetGameToBase() {
    logAmulet();
    clearLog();
    data.fightGenerated = 0;

    data.resetCount++;
    chartData = [];
    for (let focusObj of data.focusSelected) {
        unhighlightLine(focusObj.borderId, focusObj.lineData);
    }
    data.focusSelected = [];
    data.secondsPerReset = 0;
    data.NWSeconds = 0;
    data.currentJob = "helpScottWithChores";
    data.currentWage = 1;
    data.gameState = "default";

    LSMenuOpen = false;
    views.updateVal("legacySeveranceMenu", "none", "style.display");
    data.legacyMultKTL = 1;
    data.ancientCoinMultKTL = Math.pow(1.05, data.upgrades.extraAncientCoins.upgradePower);
    data.ancientWhisperMultKTL = Math.pow(1.1, data.upgrades.extraAncientWhispers.upgradePower);


    //Reset all atts and bonuses
    for (let attVar in data.atts) {
        let attObj = data.atts[attVar];
        attsSetBaseVariables(attObj);
        attObj.unlocked = false;
    }

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
            if(attVarObj[1] > 0) {
                views.updateVal(`${actionVar}${attVarObj[0]}InsideContainerSpeed1`, "none", "style.display");
            } else if(attVarObj[1] === 0) {
                views.updateVal(`${actionVar}${attVarObj[0]}InsideContainerSpeed2`, "none", "style.display");
            }
        }
        views.updateVal(`${actionVar}UnlockText`, generateUnlockText(actionVar), "innerHTML");
    }

}

function genesisReset(forceReset) {
    if (!forceReset && !document.getElementById('confirmNG').checked) {
        return;
    }
    gameIsResetting = true;

    data.currentGameState.bonusTime += 1000 * 60 * 60 * 48;
    data.lichKills = 0;
    data.genesisResets++;

    for (let attVar in data.atts) {
        let attObj = data.atts[attVar];
        attObj.attBase = 0;
    }

    resetGameToBase();

    data.resetCount = 1;
    data.legacy = 0;
    data.ancientCoin = 0;
    data.ancientWhisper = 0;
    data.currentGameState.secondsThisLS = 0;
    data.currentGameState.secondsThisGR = 0;
    data.highestLegacy = 0;

    clearUpgradesForGenesis()

    for (let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        let dataObj = actionData[actionVar];
        actionObj.prevUnlockTime = -1;
        actionObj.prevLevel1Time = -1;
        actionObj.highestLevel = -1;
        actionObj.secondHighestLevel = -1;
        actionObj.thirdHighestLevel = -1;
        actionObj.purchased = !!dataObj.purchased;

        if(actionVar === "reposeRebounded") {
            actionObj.resource = 0;
            continue;
        }

        let unlockedCount = actionObj.unlockedCount;
        actionSetBaseVariables(actionObj, dataObj);

        actionObj.purchased = !!dataObj.purchased;
        actionObj.lowestUnlockTime = undefined;
        actionObj.lowestLevel1Time = undefined;
        actionObj.unlockedCount = Math.ceil(unlockedCount * data.upgrades.keepUnlockedCount.upgradePower/5);

        dataObj.downstreamVars.forEach(function (downstreamVar) {
            if (data.actions[downstreamVar] && actionData[downstreamVar].hasUpstream) {
                setSliderUI(actionObj.actionVar, downstreamVar, 0);
            }
            actionObj[downstreamVar + "TempFocusMult"] = 2;
        });

        if (dataObj.updateMults) {
            dataObj.updateMults();
        }
        calcStatMult(actionVar)

        if(actionObj.customTriggers) {
            for (let obj of actionObj.customTriggers) {
                obj.hasFired = false;
            }
        }
        views.updateActionUnlockedViews(actionObj); //reset visuals before unlock
        if(view.cached[`${actionVar}ResourceSent`]) {
            views.updateVal(`${actionVar}ResourceSent`, "???", "textContent");
        }
        if(view.cached[`${actionVar}ExpGained`]) {
            views.updateVal(`${actionVar}ExpGained`, "???", "textContent");
        }
        if(view.cached[`${actionVar}ResourceTaken`]) {
            views.updateVal(`${actionVar}ResourceTaken`, "???", "textContent");
        }
    }

    data.actions.reposeRebounded.resource += data.upgrades.extraDeathEnergy.upgradePower;

    data.planeUnlocked[1] = false;
    views.updateVal(`planeButton1`, "none", "style.display");
    data.planeUnlocked[2] = false;
    views.updateVal(`planeButton2`, "none", "style.display");

    if(data.actions.reposeRebounded.resource === 0) {
        data.planeUnlocked[3] = false;
        views.updateVal(`planeButton3`, "none", "style.display");
    } else {
        revealAction("reposeRebounded")
        revealAction("turnTheWheel")
        revealAction("dipInTheRiver")
        revealAction("tidalBurden")
        unlockAction(data.actions.turnTheWheel);
        unlockAction(data.actions.tidalBurden);
        revealAtt("flow");
        revealAtt("continuity");
        revealAtt("calm");
    }

    for(let upgradeVar in upgradeData) {
        updateAmuletCardUI(upgradeVar);
    }

    for (let attCategory in attTree) {
        views.updateVal(`${attCategory}CategoryContainer`, "none", "style.display");
    }

    switchToPlane(0)
    revealAtt("awareness");
    data.currentWage = 1;
    data.currentJob = "helpScottWithChores";
    document.getElementById("jobTitle").textContent = data.actions[data.currentJob] ? actionData[data.currentJob].title : data.currentJob;
    document.getElementById("jobWage").textContent = intToString(data.currentWage, 2);

    setSliderUI("overclock", "reflect", data.actions["reflect"].automationOnReveal);

    views.updateVal(`useAmuletMenu`, "none", "style.display");
    views.updateVal("openViewAmuletButton", "", "style.display");

    displayLSStuff()
    actionTitleClicked('overclock')
    gameIsResetting = false;

    document.getElementById("genesisResetButtonContainer").style.display = "none";
    clickUpgradeTab('unique')
}

function legacySeveranceReset(forceReset) {
    if (!forceReset && !document.getElementById('confirmLS').checked) {
        return;
    }
    gameIsResetting = true;

    if(data.actions.destroyEasternMonolith.level > data.lichKills) {
        increaseLichKills();
    }

    //Reset all atts and bonuses
    for (let attVar in data.atts) {
        let attObj = data.atts[attVar];
        attObj.attBase = 0;
    }

    resetGameToBase();

    data.legacy = 0;
    data.ancientCoin = 0;
    data.ancientWhisper = 0;
    data.currentGameState.secondsThisLS = 0;

    //clears upgrades except unique
    createUpgrades(true)


    //For each action, clear amulet vars
    for (let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        let dataObj = actionData[actionVar];
        actionObj.prevUnlockTime = -1;
        actionObj.prevLevel1Time = -1;
        actionObj.purchased = !!dataObj.purchased;

        if(actionVar === "reposeRebounded") {
            continue;
        }

        let originalState = {};
        originalState.unlocked = actionObj.unlocked;
        originalState.unlockCost = actionObj.unlockCost;
        // originalState.currentMenu = actionObj.currentMenu;

        actionSetBaseVariables(actionObj, dataObj);
        if (dataObj.plane === 3) {
            actionObj.unlocked = originalState.unlocked;
            actionObj.unlockCost = originalState.unlockCost;
        }
        // actionObj.currentMenu = originalState.currentMenu;

        dataObj.downstreamVars.forEach(function (downstreamVar) {
            if (data.actions[downstreamVar] && actionData[downstreamVar].hasUpstream) {
                setSliderUI(actionObj.actionVar, downstreamVar, 0);
            }
            actionObj[downstreamVar + "TempFocusMult"] = 2;
        });

        if (dataObj.updateMults) {
            dataObj.updateMults();
        }

        if(actionObj.customTriggers) {
            for (let obj of actionObj.customTriggers) {
                obj.hasFired = false;
            }
        }
        views.updateActionUnlockedViews(actionObj); //reset visuals before unlock

        if(view.cached[`${actionVar}ResourceSent`]) {
            views.updateVal(`${actionVar}ResourceSent`, "???", "textContent");
        }
        if(view.cached[`${actionVar}ExpGained`]) {
            views.updateVal(`${actionVar}ExpGained`, "???", "textContent");
        }
        if(view.cached[`${actionVar}ResourceTaken`]) {
            views.updateVal(`${actionVar}ResourceTaken`, "???", "textContent");
        }
    }

    //hide magic until re-unlocked
    data.planeUnlocked[1] = false;
    views.updateVal(`planeButton1`, "none", "style.display");
    data.planeUnlocked[2] = false;
    views.updateVal(`planeButton2`, "none", "style.display");


    for(let upgradeVar in upgradeData) {
        updateAmuletCardUI(upgradeVar);
    }

    adjustMagicMaxLevels() //probably not needed since everything resets
    adjustBrythalMaxLevels()

    for (let attCategory in attTree) {
        views.updateVal(`${attCategory}CategoryContainer`, "none", "style.display");
    }

    switchToPlane(0)
    revealAtt("awareness");
    revealAtt("flow");
    revealAtt("continuity");
    revealAtt("calm");

    data.currentWage = 1;
    data.currentJob = "helpScottWithChores";
    document.getElementById("jobTitle").textContent = data.actions[data.currentJob] ? actionData[data.currentJob].title : data.currentJob;
    document.getElementById("jobWage").textContent = intToString(data.currentWage, 2);

    setSliderUI("overclock", "reflect", data.actions["reflect"].automationOnReveal);

    views.updateVal(`useAmuletMenu`, "none", "style.display");
    views.updateVal("openViewAmuletButton", "", "style.display")

    displayLSStuff()
    actionTitleClicked('overclock')
    gameIsResetting = false;
}

function initializeKTL(forceReset) {
    if (!forceReset && (!document.getElementById('confirmKTL').checked ||
        !(isDebug || (data.actions.hearAboutTheLich.level >= 1 && actionData.awakenYourGrimoire.manaQuality() >= 1)))) {
        return;
    }
    data.gameState = "KTL";
    trackFirst();
    logKTL();

    resetKTLSpiral();

    for (let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        let dataObj = actionData[actionVar];
        actionObj.isRunning = dataObj.plane === 2;

        if(dataObj.plane === 2) {
            views.updateVal(`${actionVar}UnlockText`, generateUnlockText(actionVar), "innerHTML");
        }
    }
    data.actions.reposeRebounded.isRunning = true;

    unveilPlane(2);
    switchToPlane(2);

    views.updateVal("openViewAmuletButton", "none", "style.display")
    if (data.doneAmulet) {
        views.updateVal("openUseAmuletButton", "", "style.display")
    }

    for (let focusObj of data.focusSelected) {
        unhighlightLine(focusObj.borderId, focusObj.lineData);
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

    views.updateVal("killTheLichMenu", "none", "style.display")



    revealAtt("hope");
    data.actions.fightTheEvilForces.unlockCost = 0;
    revealAction('worry');
    revealAction('courage');
    revealAction('fightTheEvilForces');
    revealAction('overclockTargetingTheLich');
    unlockAction(data.actions.worry);
    unlockAction(data.actions.courage);
    unlockAction(data.actions.fightTheEvilForces);
    unlockAction(data.actions.overclockTargetingTheLich);

    actionUpdateAllStatMults();


    views.updateVal(`ancientCoinDisplay`, "", "style.display");
    views.updateVal(`ancientWhisperDisplay`, "", "style.display");
    views.updateVal(`legacyMultDisplay`, "", "style.display");
    views.updateVal(`ancientCoinMultDisplay`, "", "style.display");
    data.doneKTL = true;
}

function openUseAmuletMenu(isUseable) {
    let isShowing = document.getElementById("useAmuletMenu").style.display !== "none";
    views.updateVal(`useAmuletMenu`, isShowing ? "none" : "", "style.display");
    if(isShowing) {
        return;
    }
    document.getElementById('amuletConfirm').checked = false;
    document.getElementById('confirmNG').checked = false;

    //if not useable, hide all the buy buttons, and the bottom section w/ start again buttons
    for (const upgradeVar in data.upgrades) {
        const upgrade = data.upgrades[upgradeVar];
        const upgradeDataObj = upgradeData[upgradeVar];

        views.updateVal(`buyButtonSection_${upgradeVar}`,
            (upgradeDataObj.type !== "genesis" || data.upgrades.newGamePlus.upgradePower > 0) && (upgradeDataObj.type === "lich" || isUseable) && !upgrade.isFullyBought ? "" : 'none',
            'style.display');
    }

    views.updateVal(`amuletMenuTitle`, isUseable ? "Use the Amulet!" : "View Amulet Upgrades");

    views.updateVal(`amuletEnabledContainer`, isUseable ? "" : 'none', 'style.display');

    refreshUpgradeVisibility();
    toggleSortByCost();
    updateCardAffordabilityBorders();
}


function logKTL() {
    data.resetLogs.push({
        stage1: {
            secondsPerReset: data.secondsPerReset,
            // hatl1Time: data.actions.hearAboutTheLich.level1Time, //not in use
            hatlLevel: data.actions.hearAboutTheLich.level,
            mq:actionData.awakenYourGrimoire.manaQuality(),
            valor:data.atts.valor.num,
            resonance:data.atts.resonance.num,
            currentLegacy: data.legacy,
            resetCount: data.resetCount,
            currentMomentum: data.totalMomentum,
            // currentFear: data.actions.hearAboutTheLich.resource, //not in use
        },
        stage2: null
    });
    if (data.resetLogs.length > 100) data.resetLogs.shift();
    data.ancientCoinGained = 0;
    data.ancientWhisperGained = 0;
    refreshResetLog();
}

function logAmulet() {
    const resetLogs = data.resetLogs[data.resetLogs.length - 1];
    if (resetLogs) {
        resetLogs.stage2 = {
            legacyGained: data.legacy - resetLogs.stage1.currentLegacy,
            ancientCoin: data.ancientCoinGained,
            ancientWhisper: data.ancientWhisperGained,
            fightGenerated: data.fightGenerated
        };
    }
    refreshResetLog()
}

function refreshResetLog() {
    document.getElementById("resetLogContainer").innerHTML = renderResetLog();
}

function renderResetLog() {
    let rows = '';
    for (let resetLog in data.resetLogs) {
        if (!data.resetLogs.hasOwnProperty(resetLog)) continue; //only print when both stages are added
        const log = data.resetLogs[resetLog];
        if(!log.stage1) {
            continue;
        }
        rows += `
            <tr>
                <td style="padding-right:15px;">
                    ${log.stage1.resetCount} 
                </td>
                <td style="padding-right:15px;">
                    ${log.stage1.secondsPerReset ? secondsToTime(log.stage1.secondsPerReset) : "-"} |
                    ${log.stage1.currentLegacy ? intToString(log.stage1.currentLegacy, 1) : "-"}
                </td>
                <td style="padding-right:15px;">
                    ${log.stage1.currentMomentum ? intToString(log.stage1.currentMomentum) : "-"} | 
                    ${log.stage1.hatlLevel ?? "-"} | 
                    ${log.stage1.mq ? intToString(log.stage1.mq, 1) : "-"} | 
                    ${log.stage1.resonance ?? "-"} | 
                    ${log.stage1.valor ?? "-"}
                </td>
                <td style="">
                ${log.stage2 ? `
                    ${log.stage2.fightGenerated ? intToString(log.stage2.fightGenerated, 1) : "-"} |
                    ${log.stage2.legacyGained ? intToString(log.stage2.legacyGained, 1) : "-"} | 
                    ${log.stage2.ancientCoin ? intToString(log.stage2.ancientCoin, 1) : "-"} | 
                    ${log.stage2.ancientWhisper ? intToString(log.stage2.ancientWhisper, 1) : "-"}`
                : ""}
                </td>
            </tr>
        `;
    }
    return `
        <div style="overflow-x:auto">
            <div style="font-size:20px; font-weight:bold; margin:0 0 6px 0;">Recent Run Statistics (Last 100)</div>
            <table style="width:100%;border-collapse:collapse;font-size:16px;white-space:nowrap">
                <thead>
                    <tr>
                        <th style="padding-right:15px; text-align:left;">#</th>
                        <th style="padding-right:15px; text-align:left;">Stats<br>(Reset | Legacy)</th>
                        <th style="padding-right:15px; text-align:left;">Stage 1<br>(Momentum | HATL | MQ | Resonance | Valor)</th>
                        <th style="padding-right:15px; text-align:left;">Stage 2<br>(Fight Generated | Legacy Gained |<br> AC Gained | AW Gained)</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
}

function useAmulet() {
    if (!document.getElementById('amuletConfirm').checked) {
        return;
    }
    gameIsResetting = true;
    resetGameToBase()

    //For each action, reset the base atts and set max level
    for (let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        let dataObj = actionData[actionVar];

        views.updateVal(`${actionVar}PinButton`, "", "style.display");

        let newLevel = actionObj.level;
        if(actionVar !== "reposeRebounded" && actionVar !== "turnTheWheel" && actionVar !== "tidalBurden") {
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
        }

        if(actionVar === "turnTheWheel") {
            actionObj.resource = 0;
            actionObj.progress = 0;
            actionObj.isRunning = true;
            continue;
        } else if(actionVar === "reposeRebounded") {
            continue;
        }

        let originalState = {};
        originalState.unlocked = actionObj.unlocked;
        originalState.unlockCost = actionObj.unlockCost;
        originalState.currentMenu = actionObj.currentMenu;
        originalState.visible = actionObj.visible

        actionSetBaseVariables(actionObj, dataObj);
        if (dataObj.plane === 1 || dataObj.plane === 3) {
            actionObj.unlocked = originalState.unlocked;
            actionObj.unlockCost = originalState.unlockCost;
        }
        if(dataObj.plane === 3) {
            actionObj.visible = originalState.visible;
        }
        actionObj.currentMenu = originalState.currentMenu;

        //happens after reset
        dataObj.downstreamVars.forEach(function (downstreamVar) {
            if (dataObj.plane !== 3 && data.actions[downstreamVar] && actionData[downstreamVar].hasUpstream) {
                setSliderUI(actionObj.actionVar, downstreamVar, 0); //reset with amulet
            }

            actionObj[downstreamVar + "TempFocusMult"] = 2;
        });

        if(actionObj.customTriggers) {
            for (let obj of actionObj.customTriggers) {
                obj.hasFired = false;
            }
        }

        if(view.cached[`${actionVar}ResourceSent`]) {
            views.updateVal(`${actionVar}ResourceSent`, "???", "textContent");
        }
        if(view.cached[`${actionVar}ExpGained`]) {
            views.updateVal(`${actionVar}ExpGained`, "???", "textContent");
        }
        if(view.cached[`${actionVar}ResourceTaken`]) {
            views.updateVal(`${actionVar}ResourceTaken`, "???", "textContent");
        }
    }

    //Next, re-add the stats for the actions that didn't reset (infusion)
    for (let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        let dataObj = actionData[actionVar];

        dataObj.onLevelAtts.forEach(function (attAddObj) {
            let name = attAddObj[0];
            let amount = attAddObj[1];
            if(amount * actionObj.level > 0) {
                statAddAmount(name, amount * actionObj.level);
                revealAtt(name);
            }
        });
    }

    //Then, recalc the updateMults
    for (let actionVar in data.actions) {
        let dataObj = actionData[actionVar];

        if (dataObj.updateMults) {
            dataObj.updateMults();
        }
    }

    //After the reset
    for (let attVar in data.atts) {
        statAddAmount(attVar, 0); //forces recalc for initial action's bonus stats
        if(data.atts[attVar].attBase !== 0) { //if it has a bonus applied
            revealAtt(attVar);
        }
    }
    for (let attCategory in attTree) {
        if (attCategory === "legends") {
            continue;
        }
        views.updateVal(`${attCategory}CategoryContainer`, "none", "style.display");
    }
    data.actions.echoKindle.resource = data.legacy;

    switchToPlane(0)
    data.planeUnlocked[2] = false;
    views.updateVal(`planeButton2`, "none", "style.display");

    revealAtt("awareness");
    //Unveil will also show the relevant atts/att
    revealAction('echoKindle')
    revealAction('dissipation')
    revealAction('resonanceFurnace')
    revealAction('poolMana')
    checkGrimoireUnlocks()
    actionTitleClicked("overclock", true);

    if(data.actions.reposeRebounded.resource > 0) {
        revealAtt("flow")
        revealAtt("continuity");
        revealAtt("calm");
    }

    //force the UI reset:
    for (let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        // let dataObj = actionData[actionVar];
        views.updateActionUnlockedViews(actionObj)
    }

    adjustMagicMaxLevels()
    adjustBrythalMaxLevels()

    data.doneAmulet = true;
    data.currentWage = 1;
    data.currentJob = "helpScottWithChores";
    document.getElementById("jobTitle").textContent = data.actions[data.currentJob] ? actionData[data.currentJob].title : data.currentJob;
    document.getElementById("jobWage").textContent = intToString(data.currentWage, 2);
    document.getElementById("legacySeveranceButton1").style.display = "none";

    setSliderUI("overclock", "reflect", data.actions["reflect"].automationOnReveal);

    views.updateVal(`killTheLichMenuButton2`, "Fight the Lich's Forces!");
    views.updateVal(`useAmuletMenu`, "none", "style.display");
    views.updateVal(`openViewAmuletButton`, "", "style.display");

    gameIsResetting = false;
}

function modifyMonolithTitles() {
    if(data.actions.destroyEasternMonolith.level === data.actions.destroyEasternMonolith.maxLevel
        && data.lichKills <= 2) {
        document.getElementById("legacySeveranceButton1").style.display = "";
    } else {
        document.getElementById("legacySeveranceButton1").style.display = "none";
    }
    if(data.actions.destroyWesternMonolith.level === data.actions.destroyWesternMonolith.maxLevel
        && data.lichKills >= 3 && data.lichKills <= 5) {
        document.getElementById("legacySeveranceButton2").style.display = "";
    }

    if(data.lichKills === 0) {
        actionData.destroyEasternMonolith.title = "Kill the Lich"
    }
    if(data.lichKills === 1) {
        actionData.destroyEasternMonolith.title = "Kill the Lich... Again?"
    }
    if(data.lichKills === 2) {
        actionData.destroyEasternMonolith.title = "Kill the Lich... Again??"
    }
    if(data.lichKills >= 3) {
        actionData.destroyEasternMonolith.title = "Destroy Eastern Monolith"
    }
    if(data.lichKills <= 3) {
        actionData.destroyWesternMonolith.title = "Kill the Lich"
    }
    if(data.lichKills === 4) {
        actionData.destroyWesternMonolith.title = "Kill the Lich... Again?"
    }
    if(data.lichKills >= 5) {
        actionData.destroyWesternMonolith.title = "Kill the Lich... Again??"
    }
    views.updateVal(`destroyEasternMonolithTitle`, actionData.destroyEasternMonolith.title)
    views.updateVal(`destroyEasternMonolithSmallVersionTitle`, actionData.destroyEasternMonolith.title)
    views.updateVal(`destroyWesternMonolithTitle`, actionData.destroyWesternMonolith.title)
    views.updateVal(`destroyWesternMonolithSmallVersionTitle`, actionData.destroyWesternMonolith.title)
}

function increaseLichKills() {
    data.lichKills++;
    data.actions.reposeRebounded.resource += data.lichKills; //add death energy
}

let LSMenuOpen = false;
function openLSMenu() {
    document.getElementById('confirmKTL').checked = false;
    LSMenuOpen = !LSMenuOpen;
    views.updateVal("legacySeveranceMenu", LSMenuOpen ? "flex" : "none", "style.display");
    let lichText = "";
    if(data.lichKills === 0) {
        lichText = lich0Text()
    } else if(data.lichKills === 1) {
        lichText = lich1Text()
    } else if(data.lichKills === 2) {
        lichText = lich2Text();
    }
    //update temp vars in the menu
    document.getElementById("lsDynamicContent").innerHTML = lichText
}

function lich0Text() {
    return `
        (Story) The army you've been helping finally has enough to strike at the lich itself, located high in a monolith. Tearing down both the physical and magical defenses the lich has thrown in the army's way, the Legion of Hope prepares to give a final strike.<br><br>

            "Enough", the Lich roars, throwing up shields with one skeletal hand and preparing a spell with the other. "I am not fated to fall here! Someone is interfering, and I will silence their echoes!" Right as its final shield cracks, the Lich waves the hand with the gathered magic forward, and consecutive blasts of powerful silvery magic sweep out, enveloping everyone in the Legion. Your amulet glows bright, and cracks spread immediately across its surface, quickly enveloping the entire piece until the whole thing breaks apart, revealing a single shining coin underneath which you quickly grasp onto. You barely have time to send a message into it before the next blast of the Lich's magic reaches you, ending your existence.<br><br>

            <div class="menuSeparator"></div>
            Your legacy has been severed. When you reset with this you will lose:
            <ul>
                <li>Legacy, Ancient Coins, and Ancient Whispers</li>
                <li>All Attribute, Multiplier, and New Action Upgrades</li>
                <li>Unlocked actions in Magic</li>
            </ul>

            You will keep:
            <ul>
                <li>All Unique Amulet upgrades</li>
                <li>The number of times an action has been unlocked</li>
                <li>Permanent Focus Multiplier</li>
                <li>All automation settings</li>
            </ul>

            You will gain:
            <ul>
                <li>x3 Legacy gain up to your highest Legacy ever (${intToString(data.highestLegacy)})</li>
                <li>+50% Ancient Whispers</li>
                <li>More Unique Upgrades</li>
                <li>The 4th tab - Infusions - and 1 Death Energy</li>
                <li>+1 max level to the action Kill the Lich</li>
            </ul>

            Penalties:
            <ul>
                <li>All non-infusion unlock costs are x2</li>
            </ul><br>

            It is recommended to export the save file before resetting.
            <button onclick="exportSaveFile('KTL_LS_${data.lichKills}')" style="padding:10px 16px;background:#007BFF;color:#ffffff;border:none;border-radius:4px;font-size:14px;cursor:pointer;width:160px;">Export to file</button>
`
}

function lich1Text() {
    return `
            (Story) The army you've been helping finally has enough to strike at the lich itself, located high in a monolith. Tearing down both the physical and magical defenses the lich has thrown in the army's way, and then tearing through a second wave of even stronger elites, the Legion of Hope prepares to give a final strike.<br><br>

            "Again? Enough!", the Lich roars, throwing up shields with one skeletal hand and preparing a spell with the other. "I am not fated to fall here, either! Someone is interfering again, and I will silence their echoes!" Right as its final shield cracks, the Lich waves the hand with the gathered magic forward, and consecutive blasts of powerful silvery magic sweep out, enveloping everyone in the Legion. Your amulet glows bright, and cracks spread immediately across its surface, quickly enveloping the entire piece until the whole thing breaks apart, revealing a single shining coin underneath which you quickly grasp onto. You barely have time to send a message into it before the next blast of the Lich's magic reaches you, ending your existence.<br><br>

            <div class="menuSeparator"></div>
            Your legacy has been severed. When you reset with this you will lose:
            <ul>
                <li>Legacy, Ancient Coins, and Ancient Whispers</li>
                <li>All Attribute, Multiplier, and New Action Upgrades</li>
                <li>Unlocked actions in Magic and Infusion</li>
                <li>(New!) The level of Turn The Wheel</li>
            </ul>

            You will keep:
            <ul>
                <li>All Unique Amulet upgrades</li>
                <li>The number of times an action has been unlocked</li>
                <li>Permanent Focus Multiplier</li>
                <li>(New!) All automation settings and custom triggers</li>
                <li>(New!) The exp and level of Repose Rebounded</li>
                <li>(New!) Death Energy on Repose Rebounded</li>
                <li>(New!) The recorded highest levels on actions</li>
            </ul>

            (New!) You will gain:
            <ul>
                <li>x3 Legacy gain up to your highest Legacy ever (${intToString(data.highestLegacy)})</li>
                <li>Ancient Whispers +50% (bringing the total to +100%)</li>
                <li>More Unique Upgrades</li>
                <li>More Multiplier Upgrades</li>
                <li>More New Action Upgrades</li>
                <li>+2 Death Energy</li>
                <li>+1 max level to the action Kill the Lich</li>
            </ul>

            (New!) Penalties:
            <ul>
                <li>All non-infusion unlock costs are increased by x2 (bringing the total to x4)</li>
            </ul><br>

            It is recommended to export the save file before resetting.
            <button onclick="exportSaveFile('KTL_LS_${data.lichKills}')" style="padding:10px 16px;background:#007BFF;color:#ffffff;border:none;border-radius:4px;font-size:14px;cursor:pointer;width:160px;">Export to file</button>
    `
}
function lich2Text() {
    return `
            (Story) The army you've been helping finally has enough to strike at the lich itself, located high in a monolith. Tearing down both the physical and magical defenses the lich has thrown in the army's way, and then tearing through a second wave of even stronger elites, the Legion of Hope prepares to give a final strike.<br><br>

            "Again? Enough!", the Lich roars, throwing up shields with one skeletal hand and preparing a spell with the other. "I am not fated to fall here, either! Someone is interfering again, and I will silence their echoes!" Right as its final shield cracks, the Lich waves the hand with the gathered magic forward, and consecutive blasts of powerful silvery magic sweep out, enveloping everyone in the Legion. Your amulet glows bright, and cracks spread immediately across its surface, quickly enveloping the entire piece until the whole thing breaks apart, revealing a single shining coin underneath which you quickly grasp onto. You barely have time to send a message into it before the next blast of the Lich's magic reaches you, ending your existence.<br><br>

            <div class="menuSeparator"></div>
            Your legacy has been severed. When you reset with this you will lose:
            <ul>
                <li>Legacy, Ancient Coins, and Ancient Whispers</li>
                <li>All Attribute, Multiplier, and New Action Upgrades</li>
                <li>Unlocked actions in Magic and Infusion</li>
                <li>The level of Turn The Wheel</li>
            </ul>

            You will keep:
            <ul>
                <li>All Unique Amulet upgrades</li>
                <li>The number of times an action has been unlocked</li>
                <li>Permanent Focus Multiplier</li>
                <li>All automation settings and custom triggers</li>
                <li>The exp and level of Repose Rebounded</li>
                <li>Death Energy on Repose Rebounded</li>
                <li>The recorded highest levels on actions</li>
            </ul>

            (New!) You will gain:
            <ul>
                <li>x3 Legacy gain up to your highest Legacy ever (${intToString(data.highestLegacy)})</li>
                <li>Ancient Whispers +50% (bringing the total to +150%)</li>
                <li>More Unique Upgrades</li>
                <li>More New Action Upgrades</li>
                <li>+3 Death Energy</li>
                <li>More Northern Waste actions</li>
            </ul>

            Penalties:
            <ul>
                <li>All non-infusion unlock costs are increased by x2 (bringing the total to x6)</li>
            </ul><br>

            It is recommended to export the save file before resetting.
            <button onclick="exportSaveFile('KTL_LS_${data.lichKills}')" style="padding:10px 16px;background:#007BFF;color:#ffffff;border:none;border-radius:4px;font-size:14px;cursor:pointer;width:160px;">Export to file</button>
    `
}