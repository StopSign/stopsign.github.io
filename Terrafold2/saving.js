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

    load();
}

let isFileSystem = !!location.href.match("file");
let saveName = "terrafold2";

let stop = false;
let totalTime;
let cash, ice, totalWater;

let rivers, lakes, clouds;

let prevState = {};

function clearSave() { //Doesn't work atm
    window.localStorage[saveName] = "";
    load();
}

function loadDefaults() {
    totalTime = 0;
    cash = 1000; //1000
    ice = 0;
    totalWater = 0;

    rivers = [];
    lakes = [];
    clouds = [];

    loadData();
}

function load() {
    loadDefaults();
    let toLoad = {};
    if(window.localStorage[saveName]) { //has a save file
        // toLoad = JSON.parse(window.localStorage[saveName]);
    }

    view.initialize();
    recalcInterval(50);
}

function save() {
    let toSave = {};

    window.localStorage[saveName] = JSON.stringify(toSave);
}