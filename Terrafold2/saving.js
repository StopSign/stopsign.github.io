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
        fbots:0,
        fbotsMax:0,
        ore:0,
        iron:0,
        dirt:0,
        steel:0,
        land:0,
        usedLand:0,
        baseLand:0,
        soil:0
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
        toLoad = JSON.parse(window.localStorage[saveName]);
    }

    if(toLoad.totalTime !== undefined) {totalTime = toLoad.totalTime; }
    if(toLoad.totalVolc !== undefined) {totalVolc = toLoad.totalVolc; }

    if(toLoad.res !== undefined) { res = toLoad.res; }
    if(toLoad.localAtmo !== undefined) {localAtmo = toLoad.localAtmo; }
    if(toLoad.globalAtmo !== undefined) {globalAtmo = toLoad.globalAtmo; }
    if(toLoad.rivers !== undefined) {
        for(let i = 0; i < toLoad.rivers.length; i++) {
            for(let property in toLoad.rivers[i]) {
                if(toLoad.rivers[i].hasOwnProperty(property)) {
                    rivers[i][property] = toLoad.rivers[i][property];
                }
            }
        }
    }
    if(toLoad.lakes !== undefined) {
        for(let i = 0; i < toLoad.lakes.length; i++) {
            for(let property in toLoad.lakes[i]) {
                if(toLoad.lakes[i].hasOwnProperty(property)) {
                    lakes[i][property] = toLoad.lakes[i][property];
                }
            }
        }
    }
    if(toLoad.clouds !== undefined) {
        for(let i = 0; i < toLoad.clouds.length; i++) {
            for(let property in toLoad.clouds[i]) {
                if(toLoad.clouds[i].hasOwnProperty(property)) {
                    clouds[i][property] = toLoad.clouds[i][property];
                }
            }
        }
    }
    if(toLoad.cbotRows !== undefined) {
        for(let i = 0; i < toLoad.cbotRows.length; i++) {
            for(let property in toLoad.cbotRows[i]) {
                if(toLoad.cbotRows[i].hasOwnProperty(property)) {
                    cbotRows[i][property] = toLoad.cbotRows[i][property];
                }
            }
        }
    }
    if(toLoad.unique !== undefined) { unique = toLoad.unique; }
    if(toLoad.donationList !== undefined) { donationList = toLoad.donationList; }
    if(toLoad.donationsShowing !== undefined) { donationsShowing = toLoad.donationsShowing; }

    view.initialize();
    recalcInterval(50);
}

function save() {
    let toSave = {};

    toSave.totalTime = totalTime;
    toSave.totalVolc = totalVolc;

    toSave.res = res;
    toSave.localAtmo = localAtmo;
    toSave.globalAtmo = globalAtmo;
    toSave.rivers = rivers;
    toSave.lakes = lakes;
    toSave.clouds = clouds;
    toSave.cbotRows = cbotRows;
    toSave.unique = unique;
    toSave.donationList = donationList;
    toSave.donationsShowing = donationsShowing;

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

// function importSave() {
//     window.localStorage[saveName] = decode(document.getElementById("exportImportSave").value);
//
//     load();
// }