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
let totalWater, buyAmount;

let res, unique;
let rivers, lakes, clouds, cbotRows;

let prevState = {};

function clearSave() { //Doesn't work atm
    window.localStorage[saveName] = "";
    load();
}

function loadDefaults() {
    totalTime = 0;
    res = {
        cash:1000,
        ice:0,
        cbots:1,
        cbotsMax:1,
        ore:0,
        iron:0,
        dirt:0
    };
    unique = {
        volcDur: 0,
        volcMult: 1,
        depth:0,
        pressure:1,
        depthNeeded:500
    };
    totalWater = 0;
    buyAmount = 1;

    rivers = [];
    lakes = [];
    clouds = [];
    cbotRows = [];

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