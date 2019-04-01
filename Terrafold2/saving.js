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
let totalWater, buyAmount, totalVolc;

let res, unique, localAtmo, globalAtmo;
let rivers, lakes, clouds, cbotRows, donationList, donationsShowing;

let prevState = {};

function clearSave() { //Doesn't work atm
    window.localStorage[saveName] = "";
    load();
}

function loadDefaults() {
    totalTime = 0;
    res = {
        cash:0,
        ice:0,
        cbots:1,
        cbotsMax:1,
        ore:0,
        iron:0,
        dirt:0,
        steel:0
    };
    unique = {
        depth:0,
        depthNeeded:500,
        pressure:1,
        volcDur: 0,
        volcMult: 1
    };
    localAtmo = {
        co2:0,
        o2:0
    };
    globalAtmo = copyArray(localAtmo);
    totalWater = 0;
    totalVolc = 0;
    buyAmount = 1;

    rivers = [];
    lakes = [];
    clouds = [];
    cbotRows = [];
    donationList = []; //boolean vars for unlocking donations
    donationsShowing = [];

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