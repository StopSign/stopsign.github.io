function clearSave() { //Doesn't work atm
    window.localStorage[saveName] = "";
    load();
}

function load() {
    initializeData();
    let toLoad = {};
    let isLoadingEnabled = false; //TODO HERE FOR CLEARING SAVE
    if(isLoadingEnabled && window.localStorage[saveName] && JSON.parse(window.localStorage[saveName]).data) { //has a save file
        toLoad = JSON.parse(window.localStorage[saveName]).data;
        console.log(toLoad)
        //TODO apply toLoad.data.actions to data.actions selectively
        data.actionNames.forEach(function (actionVar) {
            Object.keys(toLoad.actions[actionVar]).forEach(function (key) {
                if(["x", "y"].indexOf(key) !== -1) {
                    return;
                }
                if (typeof toLoad.actions[actionVar][key] !== 'function' && typeof data.actions[actionVar][key] !== 'function') {
                    data.actions[actionVar][key] = toLoad.actions[actionVar][key];
                }
            });
            // let curAction = data.actions[actionVar]; //only needed if for some reason i don't want to overload something
            // let prevAction = toLoad.actions[actionVar];
            // curAction.progress = prevAction.progress;

        })
        data.statNames.forEach(function (statVar) {
            data.stats[statVar] = toLoad.stats[statVar];
            // let curStat = data.stats[statVar]; //only needed if for some reason i don't want to overload something
            // let prevStat = toLoad.stats[statVar];
            // curStat.num = prevStat.num;
            // curStat.mult = prevStat.mult;
        })
    }

    // initializeDisplay();
    // recalcInterval(50);
}

function save() {
    let toSave = {};
    toSave.data = data;

    window.localStorage[saveName] = JSON.stringify(toSave);
}

function exportSave() {
    save();
    let encoded = encode(window.localStorage[saveName]);
    console.log(encoded);
    // document.getElementById("exportImportSave").value = encoded;
    // document.getElementById("exportImportSave").select();
    // document.execCommand('copy');
    // document.getElementById("exportImportSave").value = "";
}

function importSave() {
//     window.localStorage[saveName] = decode(document.getElementById("exportImportSave").value);
//
//     load();
}