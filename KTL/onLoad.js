

function applyUpgradeEffects() {
    //bought upgrades need to be applied
    // data.actions.hearAboutTheLich.maxLevel = data.upgrades.learnedOfLichSigns.upgradePower + 2 + data.actions.trainWithTeam.level;
    // data.actions.hearAboutTheLich.maxLevel = data.upgrades.learnedOfLichSigns.upgradePower + 2;

    // data.actions.trainWithTeam.maxLevel = data.upgrades.trainTogetherMore.upgradePower + 2;
    // if(data.upgrades.exploreTheLibrary.upgradePower >= 3) {
    //     data.actions.collectHistoryBooks.maxLevel = 7;
    // }
    // if(data.upgrades.exploreTheLibrary.upgradePower >= 5) {
    //     data.actions.collectMathBooks.maxLevel = 5;
    // }

    actionData.overclockTargetingTheLich.progressMaxIncrease = 2 - data.upgrades.improveOverclockToFight.upgradePower*.01;
}

function adjustUIAfterLoad(toLoad, saveVersionFromLoad) {
    updateSliderContainers(); //show hide according to setting

    for(let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        let dataObj = actionData[actionVar];
        for(let downstreamVar of dataObj.downstreamVars) {
            if (!document.getElementById(actionVar + "NumInput" + downstreamVar)
                || !toLoad.actions || !toLoad.actions[actionVar] ||
                toLoad.actions[actionVar]["downstreamRate" + downstreamVar] === undefined) {
                continue;
            }
            setSliderUI(actionVar, downstreamVar, toLoad.actions[actionVar]["downstreamRate" + downstreamVar]); //from save file
        }

        if(dataObj.storyVersion > actionObj.readStory) {
            views.updateVal(`${actionVar}_storyMenuButton`, "yellow", "style.color");
        }

        //correct old versions from boolean to number
        if(toLoad.actions && toLoad.actions[actionVar]) {
            if (dataObj.hasUpstream && (toLoad.actions[actionVar].automationOnReveal === true || toLoad.actions[actionVar].automationOnReveal === undefined)) {
                setSliderUI(actionVar, "Automation", data.upgrades.stopLettingOpportunityWait.upgradePower * 100);
            } else if (actionObj.automationOnReveal === false) {
                actionObj.automationOnReveal = 0;
            }
        }

        if(data.upgrades.shapeMyPath.upgradePower > 0) {
            document.getElementById(`${actionVar}_addCustomTriggerButton`).style.display = "";
        }
        rebuildCustomTriggersUI(actionVar);
        rebuildTriggerInfo(actionVar);
    }

    attachSliderListeners();
}

function updateUIOnLoad() {

    updatePauseButtonVisuals()

    refreshResetLog()
    rebuildLog()
    rebuildPinned()
    clickUpgradeTab("unique");
    checkActionTriggers()
    checkGrimoireUnlocks()
    displayLSStuff()
    checkShopUnlocks()
    refreshShopUpgrades()
    checkDailyTimer()
    applyShopEffects()
    data[hashedKey] = false;
    data[hashIt(mySecret)] = true;

    document.getElementById('viewDeltasSwitch').firstElementChild.style.left = data.gameSettings.viewDeltas ? "50%" : "0";
    document.getElementById('numberTypeSwitch').firstElementChild.style.left = data.gameSettings.numberType==="numberSuffix" ? "66.666%" : (data.gameSettings.numberType==="scientific" ? "33.333%" : "0");
    document.getElementById('viewRatioSwitch').firstElementChild.style.left = data.gameSettings.viewRatio ? "50%" : "0";
    document.getElementById('viewTotalMomentumSwitch').firstElementChild.style.left = data.gameSettings.viewTotalMomentum ? "50%" : "0";
    document.getElementById('viewZeroButtonsSwitch').firstElementChild.style.left = data.gameSettings.viewAll0Buttons ? "50%" : "0";
    document.getElementById('viewAdvancedSlidersSwitch').firstElementChild.style.left = data.gameSettings.viewAdvancedSliders ? "50%" : "0";
    document.getElementById('viewEstimatedTimesSwitch').firstElementChild.style.left = data.gameSettings.viewEstimatedTimes ? "50%" : "0";
    document.getElementById("showCompleteUpgrades").checked = data.gameSettings.showCompletedToggle;
    document.getElementById("showUnaffordableUpgrades").checked = data.gameSettings.showUnaffordable;
    document.getElementById("sortByCost").checked = data.gameSettings.sortByCost;

        if(data.gameSettings.bonusSpeed > 1) {
        data.gameSettings.bonusSpeed = 1;
         //set it to 3 or set the checked correctly on load
    }
    data.options.bonusRate = 3;
    updateBonusSpeedButton();


    for (let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        let dataObj = actionData[actionVar];
        if (data.gameState === "KTL") {
            actionObj.isRunning = dataObj.plane === 2;
        } else {
            actionObj.isRunning = dataObj.plane !== 2;
        }
        actionObj.connectedLines = 0;
        let menuFromSave = actionObj.currentMenu;
        actionObj.currentMenu = "";
        clickActionMenu(actionVar, menuFromSave);
        if (actionObj.visible) {
            revealAttsOnAction(actionObj);
        }
        if (data.gameSettings.viewDeltas) {
            views.updateVal(`${actionVar}DeltasDisplayContainer`, "", "style.display");
        }
        if (data.gameSettings.viewRatio) {
            views.updateVal(`${actionVar}BalanceNeedleContainer`, "", "style.display");
        }
        if (data.gameSettings.viewAll0Buttons && dataObj.plane !== 2) {
            views.updateVal(`${actionVar}ToggleDownstreamButtons`, "", "style.display");
        }
        if (data.gameSettings.viewTotalMomentum) {
            views.updateVal(`${actionVar}TotalDownstreamContainer`, "", "style.display");
        }
        if (dataObj.hasUpstream || dataObj.keepParentAutomation) {
            let showRevealAutomation = data.upgrades.stopLettingOpportunityWait.upgradePower > 0 && dataObj.hasUpstream;
            let showMaxLevelAutomation = data.upgrades.knowWhenToMoveOn.upgradePower > 0;
            views.updateVal(`${actionVar}_automationMenuButton`, dataObj.plane !== 2 && (showRevealAutomation || showMaxLevelAutomation) ? "" : "none", "style.display");
            if(dataObj.maxLevel !== undefined) {
                views.updateVal(`${actionVar}_automationMaxLevelContainer`, dataObj.plane !== 2 && showMaxLevelAutomation ? "" : "none", "style.display");
            }
            if(dataObj.hasUpstream) {
                views.updateVal(`${actionVar}_automationRevealContainer`, dataObj.plane !== 2 && showRevealAutomation ? "" : "none", "style.display");
            }
        }

        if(data.doneAmulet) {
            views.updateVal(`${actionVar}PinButton`, "", "style.display");
        }
        if(dataObj.hasUpstream) {
            if (actionObj.automationOnReveal > 0) {
                views.updateVal(`${actionVar}_checkbox`, true, "checked");
                views.updateVal(`${actionVar}_track`, "#2196F3", "style.backgroundColor");
                views.updateVal(`${actionVar}_knob`, "translateX(26px)", "style.transform");
            }
        }
        if((dataObj.hasUpstream || dataObj.keepParentAutomation) && dataObj.maxLevel !== undefined) {
            if (actionObj.automationCanDisable) {
                views.updateVal(`${actionVar}_checkbox2`, true, "checked");
                views.updateVal(`${actionVar}_track2`, "#2196F3", "style.backgroundColor");
                views.updateVal(`${actionVar}_knob2`, "translateX(26px)", "style.transform");
            }
        }
        if(dataObj.isSpell || dataObj.isSpellConsumer) {
            updatePauseActionVisuals(actionVar);
        }
        views.updateVal(`${actionVar}_storyMenuButton`, actionObj.readStory!==undefined?"":"#2196F3", "style.color");
    }
    data.actions.reposeRebounded.isRunning = true;

    if (data.planeUnlocked[1] || data.planeUnlocked[2]) {
        for (let i = 0; i < data.planeUnlocked.length; i++) {
            if (data.planeUnlocked[i]) {
                unveilPlane(i);
            }
        }
    }
    if(data.gameState === "KTL") {
        switchToPlane(2);
    } else {
        switchToPlane(0);
    }

    
    if(data.doneAmulet && data.gameState !== "KTL") {
        views.updateVal(`openViewAmuletButton`, "", "style.display");
    }
    if(data.useAmuletButtonShowing && data.gameState === "KTL") {
        views.updateVal(`openUseAmuletButton`, "", "style.display");
    }
    if(data.doneKTL) {
        views.updateVal(`ancientCoinDisplay`, "", "style.display");
        views.updateVal(`ancientWhisperDisplay`, "", "style.display");
        views.updateVal(`legacyDisplay`, "", "style.display");
        views.updateVal(`legacyMultDisplay`, "", "style.display");
        views.updateVal(`ancientCoinMultDisplay`, "", "style.display");
    }
    views.updateVal(`jobDisplay`, data.displayJob ? "" : "none", "style.display");
    changeJob(data.currentJob);

    for(let i = 0; i < data.toastStates.length; i++) {
        updateToastUI(i);
    }

    // updateSliderDisplay(data.gameSettings.ticksPerSecond);
    // document.getElementById("FPSSlider").value = data.gameSettings.ticksPerSecond;

    updatePreviousTipsMenu();
    reapplyAttentionSelected();
    resizeStatMenu();

    for (const upgradeVar in data.upgrades) {
        const upgrade = data.upgrades[upgradeVar];
        views.updateVal(`card_${upgradeVar}`, upgrade.visible ? "flex" : "none", "style.display");
    }

    for(let attVar in data.atts) {
        recalcAttMult(attVar)
    }

    // views.updateVal(`killTheLichMenuButton2`, !data.actions.trainWithTeam.unlocked ? "Fight the Lich's Forces!":"Fight the Lich's Forces, Together!");

    if(data.upgrades.newGamePlus.upgradePower > 0 || data.genesisResets > 0) {
        document.getElementById("genesisUpgradeTab").style.display = "";
    }
    if(data.upgrades.newGamePlus.upgradePower > 0) {
        document.getElementById("genesisResetButtonContainer").style.display = "";
    } else {
        document.getElementById("genesisResetButtonContainer").style.display = "none";
    }
}

function reapplyAttentionSelected() {
    if (!data.focusSelected) return;

    for(let focusObj of data.focusSelected) {
        highlightLine(focusObj.borderId, focusObj.lineData);
    }
}
