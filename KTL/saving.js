function clearSave() {
    window.localStorage[saveName] = "";
    location.reload();
}



//TODO when using Decimal - hydrate the necessary numbers
//TODO also, only choose the vars you want to keep, rather than keeping bad data across saves
function loadActionFromSave(actionObj, loadObj) {
    Object.assign(actionObj, loadObj);
}

function resetActionToBase(actionVar) {
    actionSetBaseVariables(data.actions[actionVar], actionData[actionVar]);
}

data.saveVersion = 1;
function load() {
    initializeData();

    let toLoad = {};

    if(onLoadData) {
        try {
            toLoad = JSON.parse(decode64(onLoadData));
        } catch(e) {
            try { //old save
                toLoad = JSON.parse(decode(onLoadData));
            } catch(e) {
                exportErrorFile(onLoadData);
            }
        }
    }
    // if(localStorage[saveName]) {
    //     console.log('Save found.');
    //     try {
    //         toLoad = JSON.parse(decode(localStorage[saveName]));
    //     } catch(e) {
    //         exportErrorFile(localStorage[saveName]);
    //     }
    // }

    // const saveVersion = toLoad && toLoad.saveVersion ?? 0;
    const saveVersion = 1; //for debug only

    if(isLoadingEnabled && localStorage[saveName] && toLoad.actions) { //has a save file
        //only go through the ones in toLoad and graft them on to existing data
        for(let actionVar in toLoad.actions) {
            let actionObj = data.actions[actionVar];
            let dataObj = actionData[actionVar];
            let loadObj = toLoad.actions[actionVar];
            if(!dataObj || dataObj.creationVersion > saveVersion) {
                // console.log("Skipped loading action " + actionVar + " from save.");
                continue;
            }
            loadActionFromSave(actionObj, loadObj);
        }

        for(let upgradeVar in toLoad.upgrades) {
            let actionObj = data.upgrades[upgradeVar];
            let dataObj = upgradeData[upgradeVar];
            let loadObj = toLoad.upgrades[upgradeVar];
            if(!dataObj || dataObj.creationVersion > saveVersion) { //If removed or needs to refresh
                // console.log("Skipped loading upgrade " + upgradeVar + " from save.");
                continue;
            }
            loadActionFromSave(actionObj, loadObj);
        }


        // mergeExistingOnly(data, toLoad, "actions", ["x", "y", "realX", "realY"]); //use patch instead
        //these are in the skiplist because if, between saves, an action has changed the atts it has, the links need to be reset instead of saved.
        mergeExistingOnly(data, toLoad, "atts", ["linkedActionExpAtts", "linkedActionEfficiencyAtts", "linkedActionOnLevelAtts"]);
        mergeExistingOnly(data, toLoad, "options");
        mergeExistingOnly(data, toLoad, "gameSettings");


        data.toastStates = toLoad.toastStates;

        //load global items that aren't lists or objects
        data.gameState = toLoad.gameState ?? "default";
        data.planeTabSelected = toLoad.planeTabSelected ?? 0;
        data.totalMomentum = toLoad.totalMomentum ?? 0;
        data.ancientCoin = toLoad.ancientCoin ?? 0;
        data.useAmuletButtonShowing = !!toLoad.useAmuletButtonShowing;
        data.secondsPerReset = toLoad.secondsPerReset ?? 0;
        data.currentJob = toLoad.currentJob ?? "helpScottWithChores";
        data.currentWage = toLoad.currentWage ?? 1;
        data.doneKTL = !!toLoad.doneKTL;
        data.doneAmulet = !!toLoad.doneAmulet;
        data.displayJob = !!toLoad.displayJob;
        data.focusSelected = toLoad.focusSelected ?? [];
        data.resetLogs = toLoad.resetLogs ?? [];
        data.planeUnlocked = toLoad.planeUnlocked ?? [true, false, false, false];
        data.maxFocusAllowed = toLoad.maxFocusAllowed ?? 3;
        data.focusMult = toLoad.focusMult ?? 2;
        data.focusLoopMax = toLoad.focusLoopMax ?? 2.5;
        data.lastVisit = toLoad.lastVisit ?? Date.now();
        data.currentLog = toLoad.currentLog ?? [];
        data.currentPinned = toLoad.currentPinned ?? [];
        data.ancientCoinMultKTL = toLoad.ancientCoinMultKTL ?? 1;
        data.legacyMultKTL = toLoad.legacyMultKTL ?? 1;
        data.totalSpellPower = toLoad.totalSpellPower ?? 0;
        data.maxSpellPower = toLoad.maxSpellPower ?? 0;

        data.currentGameState = toLoad.currentGameState;
        // data.gameSettings = toLoad.gameSettings;

        //data correction
        if(toLoad.gameSettings.viewAdvancedSliders === undefined) { //defaults off on new saves
            data.gameSettings.viewAdvancedSliders = true;
        }
        delete data.atts.processing; //changed named to Intellect, have to delete old att
        delete data.atts.stillness; //changed named to Peace, have to delete old att
        if(toLoad.actions.poolMana.visible) {
            actionData.poolMana.generatorSpeed = 6;
        }
        if(data.saveVersion <= 1) {
            data.actions.overboost.instability = 0;
            data.actions.overcharge.instability = 0;
        }


        applyUpgradeEffects()
    }

    //update all generator's multiplier data
    for(let actionVar in actionData) {
        let dataObj = actionData[actionVar];
        if(dataObj.updateMults) {
            dataObj.updateMults();
        }
    }

    initializeDisplay();
    setSlidersOnLoad(toLoad, saveVersion);
    // recalcInterval(data.options.updateRate);
    views.updateView();


    debug(); //change game after all else, for easier debugging
}

function applyUpgradeEffects() {
    //bought upgrades need to be applied
    actionData.hearAboutTheLich.maxLevel = data.upgrades.learnedOfLichSigns.upgradePower + 2 + data.actions.trainWithTeam.level;
    actionData.trainWithTeam.maxLevel = data.upgrades.trainTogetherMore.upgradePower + 2;
    if(data.upgrades.learnFromTheLibrary.upgradePower >= 3) {
        data.actions.collectHistoryBooks.maxLevel = 7;
    }
    if(data.upgrades.learnFromTheLibrary.upgradePower >= 5) {
        data.actions.collectMathBooks.maxLevel = 5;
    }
}

function setSlidersOnLoad(toLoad, saveVersion) {
    updateSliderContainers(); //show hide according to setting

    for(let actionVar in data.actions) {
        let dataObj = actionData[actionVar];
        for(let downstreamVar of dataObj.downstreamVars) {
            if (!document.getElementById(actionVar + "NumInput" + downstreamVar)
                || !toLoad.actions || !toLoad.actions[actionVar] ||
                toLoad.actions[actionVar]["downstreamRate" + downstreamVar] === undefined ||
                dataObj.creationVersion > saveVersion) {
                continue;
            }
            setSliderUI(actionVar, downstreamVar, toLoad.actions[actionVar]["downstreamRate" + downstreamVar]); //from save file
        }
    }
    attachCustomSliderListeners();
}

function mergeExistingOnly(data, toLoad, varName, skipList = []) {
    const dataObj = data[varName];
    const toLoadObj = toLoad[varName];
    if (typeof dataObj !== "object" || dataObj === null || typeof toLoadObj !== "object" || toLoadObj === null) {
        return;
    }

    for (const key in dataObj) {
        if (Object.prototype.hasOwnProperty.call(dataObj, key)) {
            if (Object.prototype.hasOwnProperty.call(toLoadObj, key)) {
                const targetObj = dataObj[key];
                const sourceObj = toLoadObj[key];
                if (typeof targetObj === "object" && targetObj !== null && typeof sourceObj === "object" && sourceObj !== null) {
                    for (const propKey in targetObj) {
                        if (Object.prototype.hasOwnProperty.call(targetObj, propKey)) {
                            if (Object.prototype.hasOwnProperty.call(sourceObj, propKey)) {
                                if (!skipList.includes(propKey)) {
                                    targetObj[propKey] = sourceObj[propKey];
                                }
                            }
                        }
                    }
                    // Copy any props in sourceObj not already in targetObj (and not in skipList)
                    for (const propKey in sourceObj) {
                        if (Object.prototype.hasOwnProperty.call(sourceObj, propKey)) {
                            if (!Object.prototype.hasOwnProperty.call(targetObj, propKey) && !skipList.includes(propKey)) {
                                targetObj[propKey] = sourceObj[propKey];
                            }
                        }
                    }
                } else if (!skipList.includes(key)) {
                    dataObj[key] = sourceObj;
                }
            }
        }
    }

    for (const key in toLoadObj) {
        if (Object.prototype.hasOwnProperty.call(toLoadObj, key) && !Object.prototype.hasOwnProperty.call(dataObj, key)) {
            if (!skipList.includes(key)) {
                dataObj[key] = toLoadObj[key];
            }
        }
    }
}


function updateUIOnLoad() {

    updatePauseButtonVisuals()

    refreshResetLog()
    rebuildLog()
    rebuildPinned()

    document.getElementById('viewDeltasSwitch').firstElementChild.style.left = data.gameSettings.viewDeltas ? "50%" : "0";
    document.getElementById('numberTypeSwitch').firstElementChild.style.left = data.gameSettings.numberType==="numberSuffix" ? "66.666%" : (data.gameSettings.numberType==="scientific" ? "33.333%" : "0");
    document.getElementById('viewRatioSwitch').firstElementChild.style.left = data.gameSettings.viewRatio ? "50%" : "0";
    document.getElementById('viewTotalMomentumSwitch').firstElementChild.style.left = data.gameSettings.viewTotalMomentum ? "50%" : "0";
    document.getElementById('viewZeroButtonsSwitch').firstElementChild.style.left = data.gameSettings.viewAll0Buttons ? "50%" : "0";
    document.getElementById('viewAdvancedSlidersSwitch').firstElementChild.style.left = data.gameSettings.viewAdvancedSliders ? "50%" : "0";

    if(data.gameSettings.bonusSpeed > 1) {
        data.gameSettings.bonusSpeed = 1;
        data.options.bonusRate = 3; //set it to 3 or set the checked correctly on load
    }
    updateBonusSpeedButton();

    for (let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        if(data.gameState === "KTL") {
            actionObj.isRunning = actionObj.plane === 2;
        } else {
            actionObj.isRunning = actionObj.plane !== 2;
        }
        clickActionMenu(actionVar, actionObj.currentMenu, true);
        if (actionObj.visible) {
            revealActionAtts(actionObj);
        }
        if(data.gameSettings.viewDeltas) {
            views.updateVal(`${actionVar}DeltasDisplayContainer`, "", "style.display");
        }
        if(data.gameSettings.viewRatio) {
            views.updateVal(`${actionVar}BalanceNeedleContainer`, "", "style.display");
        }
        if(data.gameSettings.viewAll0Buttons) {
            views.updateVal(`${actionVar}ToggleDownstreamButtons`, "", "style.display");
        }
        if(data.gameSettings.viewTotalMomentum) {
            views.updateVal(`${actionVar}TotalDownstreamContainer`, "", "style.display");
        }
        let automationUnlocked = data.upgrades.stopLettingOpportunityWait.upgradePower > 0
            || data.upgrades.knowWhenToMoveOn.upgradePower > 0;
        if(automationUnlocked) {
            views.updateVal(`${actionVar}_automationMenuButton`, actionObj.hasUpstream?"":"none", "style.display");
        }
        if(actionObj.hasUpstream) {
            if (actionObj.automationOff) {
                views.updateVal(`${actionVar}_checkbox`, true, "checked");
                views.updateVal(`${actionVar}_track`, "#2196F3", "style.backgroundColor");
                views.updateVal(`${actionVar}_knob`, "translateX(26px)", "style.transform");
            } else {
                views.updateVal(`${actionVar}_checkbox`, false, "checked");
                views.updateVal(`${actionVar}_track`, "#ccc", "style.backgroundColor");
                views.updateVal(`${actionVar}_knob`, "translateX(0px)", "style.transform");
            }
        }
    }
    if (data.planeUnlocked[1] || data.planeUnlocked[2]) {
        for (let i = 0; i < data.planeUnlocked.length; i++) {
            if (data.planeUnlocked[i]) {
                unveilPlane(i);
            }
        }
    }
    switchToPlane(0);

    
    if(data.doneAmulet && data.gameState !== "KTL") {
        views.updateVal(`openViewAmuletButton`, "", "style.display");
    }
    if(data.useAmuletButtonShowing && data.gameState === "KTL") {
        views.updateVal(`openUseAmuletButton`, "", "style.display");
    }
    if(data.doneKTL) {
        views.updateVal(`ancientCoinDisplay`, "", "style.display");
        revealAtt("legacy");
    }
    if(data.displayJob) {
        document.getElementById("jobDisplay").style.display = "";
    }
    changeJob(data.currentJob);

    for(let i = 0; i < data.toastStates.length; i++) {
        updateToastUI(i);
    }

    updateSliderDisplay(data.gameSettings.ticksPerSecond);
    document.getElementById("FPSSlider").value = data.gameSettings.ticksPerSecond;

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

}

function reapplyAttentionSelected() {
    if (!data.focusSelected) return;

    data.focusSelected.forEach(entry => {
        const { borderId } = entry;
        highlightLine(borderId); // Reapply visual state
    });
}

function save() {
    window.localStorage[saveName] = encode64(JSON.stringify(data));
}

function exportSave() {
    save();
    document.getElementById("exportImportSave").value = window.localStorage[saveName];
    document.getElementById("exportImportSave").select();
    document.execCommand('copy');
    document.getElementById("exportImportSave").value = "";
}

function exportErrorFile(data) {
    const blob = new Blob([data], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;

    const baseName = "KTL_Error_File";
    const extension = 'txt';

    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    a.download = `${baseName}_${year}-${month}-${day}_${hours}-${minutes}-${seconds}.${extension}`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}

function exportSaveFile() {
    save();
    const data = window.localStorage[saveName];
    const blob = new Blob([data], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;

    const baseName = "KTL_Save";
    const extension = 'txt';

    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    a.download = `${baseName}_${year}-${month}-${day}_${hours}-${minutes}-${seconds}.${extension}`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}

function importSave() {
    if(!document.getElementById('confirmImportCheckbox').checked) {
        return;
    }
    if(!document.getElementById("exportImportSave").value.trim()) {
        clearSave();
        return;
    }
    window.localStorage[saveName] = document.getElementById("exportImportSave").value;
    location.reload();
}

function importSaveFile() {
    const input = document.getElementById("importSaveFileInput");
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result.trim();
        if (!content) {
            clearSave();
        } else {
            window.localStorage[saveName] = content;
        }
        location.reload();
    };
    reader.readAsText(file);
}