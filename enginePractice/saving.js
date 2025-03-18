function clearSave() { //Doesn't work atm
    window.localStorage[saveName] = "";
    load();
}

function load() {
    initializeData();

    let isLoadingEnabled = true; //TODO SET FALSE FOR CLEARING SAVE
    /* Loading:
        * The round that the player is running should stay the same when the player loads, even if the underlying actionData has been updated
        * This is not true for upgradeData - take fresh actionData.upgrade copies and add toLoad data on top
        * For actions, before UI creation is load. Load actionData into data, then change all the numbers with toLoad (keep the update's other effects?)
        * bring all of the other data variables in too
        *
     */

    let toLoad = {};

    if(isLoadingEnabled && window.localStorage[saveName] && JSON.parse(window.localStorage[saveName]).data) { //has a save file
        toLoad = JSON.parse(window.localStorage[saveName]).data;
        data.actionNames.forEach(function (actionVar) {
            let actionObj = data.actions[actionVar];
            Object.keys(toLoad.actions[actionVar]).forEach(function (key) {
                if(["x", "y"].indexOf(key) !== -1) {
                    return;
                }
                if (typeof toLoad.actions[actionVar][key] !== 'function' && typeof actionObj[key] !== 'function') {
                    actionObj[key] = toLoad.actions[actionVar][key];
                }
            });

        })
        data.statNames.forEach(function (statVar) {
            data.stats[statVar] = toLoad.stats[statVar];
        })
        data.toastStates = toLoad.toastStates ? toLoad.toastStates : [];
        data.gameState = toLoad.gameState ? toLoad.gameState : "default";
        data.totalMomentum = toLoad.totalMomentum ? toLoad.totalMomentum : 0;
        data.essence = toLoad.essence ? toLoad.essence : 0;
        data.useAmuletButtonShowing = !!toLoad.useAmuletButtonShowing;
        data.secondsPerReset = toLoad.secondsPerReset ? toLoad.secondsPerReset : 0;
        data.currentJob = toLoad.currentJob ? toLoad.currentJob : "Helping Scott";
        data.currentWage = toLoad.currentWage ? toLoad.currentWage : 1;
        data.numberType = toLoad.numberType ? toLoad.numberType : "engineering";
        data.upgrades = toLoad.upgrades;
    }

    initializeDisplay();

    //set UI elements after both data and UI have been loaded
    //set sliders
    data.actionNames.forEach(function (actionVar) {
        let actionObj = data.actions[actionVar];
        actionObj.downstreamVars.forEach(function (downVar) {
            if (!document.getElementById(actionVar + "NumInput" + downVar) || toLoad.actions[actionVar]["downstreamRate" + downVar] === undefined) {
                return;
            }
            setSliderUI(actionVar, downVar, toLoad.actions[actionVar]["downstreamRate" + downVar]);
        });
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
    window.localStorage[saveName] = decode(document.getElementById("exportImportSave").value);

    load();
}