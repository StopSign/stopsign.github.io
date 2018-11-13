function startGame() {
    if (isFileSystem) {
    } else {
        window.doWork = new Worker('interval.js');
        window.doWork.onmessage = function (event) {
            if (event.data === 'interval.start') {
                tick();
            }
        };
    }
    displayBetaSaveNote();
    load();
}

let isFileSystem = !!location.href.match("file");
let isBeta = !!location.href.match(/beta/i);
let saveName = !isBeta ? "perfectWar1" :  "perfectWarBeta";

let stop = false;
let castle = {};
let prevState = {};
let actionsList = {
    nextNames: ["king", "castle", "units", "lab"],
    next: {
        king:[],
        castle:[],
        units:[],
        lab:[]
    },
    current: {
        king:[],
        castle:[],
        units:[],
        lab:[]
    }
};
window.language = "eng";
window.addAmount = 1;

let mana = 120;
let initialMana = 120;
let maxMana = 120;
let totalTime = 0;
let gold = 10;
let wood = 0;

let curList = 1; //castle

function clearSave() {
    window.localStorage[saveName] = "";
    load();
}

function loadDefaults() {
}

function load() {
    view.updating.saveCurrentState();
    loadDefaults();
    let toLoad = {};
    if(window.localStorage[saveName]) { //has a save file
        // closeTutorial();
        // toLoad = JSON.parse(window.localStorage[saveName]);
    }

    recalcInterval(50);
    pauseGame();

    view.initialize();
    restart();
}

function save() {
    let toSave = {};

    window.localStorage[saveName] = JSON.stringify(toSave);
}

// function exportSave() {
//     save();
//     document.getElementById("exportImport").value = encode(window.localStorage[saveName]);
//     document.getElementById("exportImport").select();
//     document.execCommand('copy');
//     document.getElementById("exportImport").value = "";
// }

// function importSave() {
//     window.localStorage[saveName] = decode(document.getElementById("exportImport").value);
//
//     load();
//     pauseGame();
// }

function displayBetaSaveNote() {
    // console.log(isBeta);
    if(!isBeta) return;
    document.addEventListener("DOMContentLoaded", function() {
        document.getElementById("betaSave").style.display = "block";
    });
}

// function moveSaveToBeta() {
//     window.localStorage[saveName] = window.localStorage.idleLoops1;
//     location.reload();
// }

// function moveSaveFromBeta() {
//     save();
//     window.localStorage.idleLoops1 = window.localStorage[saveName];
// }
