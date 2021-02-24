function startGame() {
    if (isFileSystem) {
    } else {
        window.doWork = new Worker('helpers/interval.js');
        window.doWork.onmessage = function (event) {
            if (event.data === 'interval.start') {
                tick();
            }
        };
    }

    // window.localStorage[saveName] = decode("");

    load();

    // data.systems[0].planets[0].ore = 100;
    // data.systems[0].planets[0].electronics = 30;
    // data.systems[0].planets[0].panels = 9;
    // data.science = 100;
}


let isFileSystem = !!location.href.match("file");
let saveName = "DysonLight1";

let stop = false;
let totalTime = 0;

let prevState = {};

function clearSave() { //Doesn't work atm
    window.localStorage[saveName] = "";
    load();
}

function loadDefaults() {
}

function load() {
    initialize();
    loadDefaults();
    let toLoad = {};
    if(window.localStorage[saveName]) { //has a save file
        // toLoad = JSON.parse(window.localStorage[saveName]);
    }

    if(toLoad.totalTime !== undefined) {totalTime = toLoad.totalTime; }


    // view.initialize();
    recalcInterval(50);
}

function save() {
    let toSave = {};

    toSave.totalTime = totalTime;

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
