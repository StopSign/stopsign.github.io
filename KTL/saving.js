function clearSave() {
    window.localStorage[saveName] = "";
    location.reload();
}

data.saveVersion = 0;

const actionPatches = {
    overclock: {
        needsReset: true, // indicates structure has changed since last version
        addedInVersion: 2,
    },
    meditate: {
        needsReset: false,
        addedInVersion: 1,
    }
};

function load() {
    initializeData();

    let toLoad = {};

    if(localStorage[saveName]) {
        toLoad = JSON.parse(localStorage[saveName]);
    }
    if(isLoadingEnabled && localStorage[saveName] && toLoad.data) { //has a save file
        const saveVersion = toLoad.saveVersion || 0;

        patchActions(data.actions, toLoad.actions, actionData, actionPatches);

        mergeExistingOnly(data, toLoad, "actions", ["x", "y"]);
        mergeExistingOnly(data, toLoad, "atts");
        mergeExistingOnly(data, toLoad, "upgrades");
        mergeExistingOnly(data, toLoad, "toastStates");
        mergeExistingOnly(data, toLoad, "options");

        //load global items that aren't lists or objects
        data.gameState = toLoad.gameState ?? "default";
        data.planeTabSelected = toLoad.planeTabSelected ?? 0;
        data.totalMomentum = toLoad.totalMomentum ?? 0;
        data.legacy = toLoad.legacy ?? 0;
        data.useAmuletButtonShowing = !!toLoad.useAmuletButtonShowing;
        data.secondsPerReset = toLoad.secondsPerReset ?? 0;
        data.currentJob = toLoad.currentJob ?? "Helping Scott";
        data.currentWage = toLoad.currentWage ?? 1;
        data.numberType = toLoad.numberType ?? "engineering";
        data.doneKTL = !!toLoad.doneKTL;
        data.doneAmulet = !!toLoad.doneAmulet;
        data.displayJob = !!toLoad.displayJob;
        data.focusSelected = toLoad.focusSelected ?? [];
        data.maxFocusAllowed = toLoad.maxFocusAllowed ?? 3;
        data.focusMult = toLoad.focusMult ?? 2;
        data.focusLoopMax = toLoad.focusLoopMax ?? 2.5;
    }

    //update all action data based on upgrades bought
    Object.values(actionData).forEach(action => {
        if (action.updateMults) action.updateMults();
    });

    initializeDisplay();
    setSlidersOnLoad(toLoad);
    recalcInterval(data.options.updateRate);
    views.updateView();
}

function patchActions(currentData, loadedData, baseData, patchMap) {
    const currentKeys = Object.keys(currentData);
    const loadedKeys = loadedData ? Object.keys(loadedData) : [];

    for (let key of currentKeys) {
        if (!(key in loadedData)) {
            //new action, load it
            actionSetBaseVariables(currentData[key], baseData[key]);
            continue;
        }

        // patch says reset, reset it
        const needsReset = patchMap[key]?.needsReset;
        if (needsReset) {
            actionSetBaseVariables(currentData[key], baseData[key]);
            continue;
        }

        //apply loaded data on top of current actionData
        Object.assign(currentData[key], loadedData[key]);
    }

    // Remove deleted actions
    for (let key of loadedKeys) {
        if (!(key in currentData)) {
            delete loadedData[key];
        }
    }
}


function setSlidersOnLoad(toLoad) {
    for(let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        for(let downstreamVar of actionObj.downstreamVars) {
            if (!document.getElementById(actionVar + "NumInput" + downstreamVar)
                || !toLoad.actions || !toLoad.actions[actionVar] ||
                toLoad.actions[actionVar]["downstreamRate" + downstreamVar] === undefined) {
                continue;
            }
            setSliderUI(actionVar, downstreamVar, toLoad.actions[actionVar]["downstreamRate" + downstreamVar]);
        }
    }
}

function mergeExistingOnly(data, toLoad, varName, skipList = []) {
    const dataObj = data[varName];
    const toLoadObj = toLoad[varName];
    if (typeof dataObj !== "object" || typeof toLoadObj !== "object") return;

    for (let key in toLoadObj) {
        if (!(key in dataObj)) continue;
        if (skipList.includes(key)) continue;

        Object.assign(dataObj[key], toLoadObj[key]);
    }
}

function updateUIFromLoad() {
    /*

Things that are not reloading properly:
* tips
     */

    for(let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        clickActionMenu(actionVar, actionObj.currentMenu, true);
    }

    if(data.doneAmulet) {
        document.getElementById("openViewAmuletButton").style.display = "";
        document.getElementById("legacyDisplay").style.display = "";
    }
    if(data.displayJob) {
        document.getElementById("jobDisplay").style.display = "";
    }
    changeJob(data.currentJob);

    for(let i = 0; i < data.toastStates.length; i++) {
        updateToastUI(i);
    }

    reapplyAttentionSelected();
    resizeStatMenu();
}

function reapplyAttentionSelected() {
    if (!data.focusSelected) return;

    data.focusSelected.forEach(entry => {
        const { borderId } = entry;
        highlightLine(borderId); // Reapply visual state
    });
}

function save() {
    let toSave = {};
    toSave.data = data;

    window.localStorage[saveName] = JSON.stringify(toSave);
}

function exportSave() {
    save();
    let encoded = encode(window.localStorage[saveName]);
    // console.log(encoded);
    document.getElementById("exportImportSave").value = encoded;
    document.getElementById("exportImportSave").select();
    document.execCommand('copy');
    document.getElementById("exportImportSave").value = "";
}

function importSave() {
    if(!document.getElementById('confirmImportCheckbox').checked) {
        return;
    }
    if(!document.getElementById("exportImportSave").value.trim()) {
        clearSave();
        return;
    }
    window.localStorage[saveName] = decode(document.getElementById("exportImportSave").value);

    load();
}