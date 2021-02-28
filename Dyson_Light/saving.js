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
    //create planets
    addPlanet(0, 7, 7, 3, 1);
    addPlanet(0, 8, 5, 5, 2);
    addPlanet(0, 10, 6, 2, 4);
    addPlanet(0, 6, 6, 6, 7);

    data.systems[0].luminosity = 1;
    data.systems[0].distance = 0;

    data.systems[0].planets[0].panels = 1;
}

function load() {
    loadDefaults();
    let toLoad = {};
    if(window.localStorage[saveName]) { //has a save file
        toLoad = JSON.parse(decode(window.localStorage[saveName]));

        if(toLoad.data !== undefined) {data = toLoad.data; }
    }


    data.selectedCol = null;
    data.selectedRow = null;

    view.initialize();
    recalcInterval(50);
}

function save() {
    saveTimer = 20000;
    let toSave = {};

    toSave.data = data;

    window.localStorage[saveName] = encode(JSON.stringify(toSave));
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
