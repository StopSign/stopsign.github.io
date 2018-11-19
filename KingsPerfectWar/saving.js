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
let created = {};
window.language = "eng";
window.addAmount = 1;

let curLevel = 0;
let mana = 1200;
let initialMana = 1200;
let maxMana = 1200;
let totalTime = 0;
let gold = 0;
let initialGold = 600;
let wood = 0;
let initialWood = 500;

let curList = 1; //castle
let currentlyHovering = 0;
let unitsSelectedForMove = { king:false, units:true, heroes:false };

function clearSave() {
    window.localStorage[saveName] = "";
    load();
}

function loadDefaults() {
}

function load() {
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
