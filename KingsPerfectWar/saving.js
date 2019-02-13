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
let saveName = !isBeta ? "KPW1" :  "KPWBeta";

let stop = false;
let prevState = {};
let actionsList = {
    nextNames: ["king", "castle", "units", "shrine"],
    next: {
        king:[],
        castle:[],
        units:[],
        shrine:[]
    },
    current: {
        king:[],
        castle:[],
        units:[],
        shrine:[]
    }
};
let created = {};
window.language = "eng";
window.addAmount = 1;

let curLevel = 0;
let mana = 1200;
let maxMana = 1200;
let totalTime = 0;
let gold = 0;
let wood = 0;
let buildAuraValue = 1.5;
let highestListsLength = 8;

let curList = 1; //castle
let currentlyHovering = 0;
let unitsSelectedForMove = { king:false, units:true, heroes:false };

let levelSave = [];
let curInfoBox = "extras";
let addButtons = document.getElementById("addButtons");
let curListNum = 1;

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
    save();
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
