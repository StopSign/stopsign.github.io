function clearSave() {
    window.localStorage[saveName] = "";
    location.reload();
}

function load() {
    // loadDefaults();
    // loadUISettings();
    initializeData();

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
        // for(let actionVar in data.actions) {
            //     let actionObj = data.actions[actionVar];
        //     Object.keys(toLoad.actions[actionVar]).forEach(function (key) {
        //         if(["x", "y"].indexOf(key) !== -1) {
        //             return;
        //         }
        //         if (typeof toLoad.actions[actionVar][key] !== 'function' && typeof actionObj[key] !== 'function') {
        //             actionObj[key] = toLoad.actions[actionVar][key];
        //         }
        //     });
        //
        // })
        // data.attNames.forEach(function (attVar) {
        //     data.atts[attVar] = toLoad.atts[attVar];
        // })


        mergeExistingOnly(data, toLoad, "actions", ["x", "y"]);
        mergeExistingOnly(data, toLoad, "atts");
        mergeExistingOnly(data, toLoad, "upgrades");
        mergeExistingOnly(data, toLoad, "toastStates");
        mergeExistingOnly(data, toLoad, "options");





        data.gameState = toLoad.gameState ? toLoad.gameState : "default";
        data.totalMomentum = toLoad.totalMomentum ? toLoad.totalMomentum : 0;
        data.essence = toLoad.essence ? toLoad.essence : 0;
        data.useAmuletButtonShowing = !!toLoad.useAmuletButtonShowing;
        data.secondsPerReset = toLoad.secondsPerReset ? toLoad.secondsPerReset : 0;
        data.currentJob = toLoad.currentJob ? toLoad.currentJob : "Helping Scott";
        data.currentWage = toLoad.currentWage ? toLoad.currentWage : 1;
        data.numberType = toLoad.numberType ? toLoad.numberType : "engineering";
        data.doneKTL = !!toLoad.doneKTL;
        data.doneAmulet = !!toLoad.doneAmulet;
        data.displayJob = !!toLoad.displayJob;
        data.attentionSelected = toLoad.attentionSelected ? toLoad.attentionSelected : [];
        data.maxAttentionAllowed = toLoad.maxAttentionAllowed ? toLoad.maxAttentionAllowed : 3;
        data.attentionMult = toLoad.attentionMult ? toLoad.attentionMult : 2;
        data.attentionLoopMax = toLoad.attentionLoopMax ? toLoad.attentionLoopMax : 2.5;
    }

    data.actions.overclock.momentumAdded = data.actions.overclock.actionPower * data.actions.overclock.upgradeMult;

    initializeDisplay();

    // view.initalize();

    //set UI elements after both data and UI have been loaded
    //set sliders
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

    recalcInterval(data.options.updateRate);
}

function mergeExistingOnly(data, toLoad, varName, skipList = []) {
    const dataObj = data[varName];
    const toLoadObj = toLoad[varName];
    if (typeof dataObj !== "object" || typeof toLoadObj !== "object") return;

    for (let key in toLoadObj) {
        if (!(key in dataObj)) continue;         // Skip if the key is not in data
        if (skipList.includes(key)) continue;    // Skip if key is in skipList

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

    if(data.doneKTL || (data.gameState !== "KTL" && data.actions.hearAboutTheLich && data.actions.hearAboutTheLich.level >= 1)) {
        views.updateVal(`killTheLichMenuButton`, "", "style.display");
    }
    if(data.doneAmulet) {
        document.getElementById("openViewAmuletButton").style.display = "";
        document.getElementById("essenceDisplay").style.display = "";
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
    if (!data.attentionSelected) return;

    data.attentionSelected.forEach(entry => {
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