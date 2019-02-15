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
    nextNames: ["king", "castle", "units"],
    next: {
        king:[],
        castle:[],
        units:[]
    },
    current: {
        king:[],
        castle:[],
        units:[]
    }
};
let created = {}; //keep track of the number of times an action has happened per restart
window.language = "eng";
window.addAmount = 1;

let curLevel = 0;
let highestLevel = 0;
let mana = 1200;
let maxMana = 1200;
let totalTime = 0;
let gold = 0;
let wood = 0;
let buildAuraValue = 1.5;
let highestListsLength = 8;

let curList = 0; //king
let currentlyHovering = 0;
let unitsSelectedForMove = { king:true, units:false, heroes:false };

let levelSave = [];
let curInfoBox = "extras";
let addButtons = document.getElementById("addButtons");
let curListNum = 1;
let unlockList = [];

let totalOfflineMs = 0;

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
        toLoad = JSON.parse(window.localStorage[saveName]);
    }

    totalOfflineMs = toLoad.totalOfflineMs !== undefined ? toLoad.totalOfflineMs : 0;
    addOffline(Math.floor((new Date() - new Date(toLoad.date)) * .8));

    recalcInterval(50);
    pauseGame();

    view.initialize();
    restart();
    save();
}

function save() {
    let toSave = {};


    toSave.date = new Date();
    toSave.totalOfflineMs = totalOfflineMs;

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


function createActionListsFromSimplifiedList(simplifiedList) {
    for (let property in simplifiedList) {
        if (simplifiedList.hasOwnProperty(property)) {
            actionsList.next[property] = [];
            let num = property === "castle" ? 0 : (property === "king" ? 1 : 2);
            listToActions(simplifiedList[property], num);
        }
    }
}

function listToActions(arr, num) {
    for(let i = 0; i < arr.length; i++) {
        let split = arr[i].split("|");
        let varName = split[0];
        let loops = split[1];
        let unitsToMove = {king:false, units:false, heroes:false};
        if(split[2]) { //unitsToMove
            let typeCount = split[2] - 0; //convert to int
            if(typeCount >= 4) {
                typeCount -= 4;
                unitsToMove.heroes = true;
            }
            if(typeCount >= 2) {
                typeCount -= 2;
                unitsToMove.units = true;
            }
            if(typeCount >= 1) {
                unitsToMove.king = true;
            }
        }
        addActionToList(varName, num, false, loops, unitsToMove)
    }
}

function listsToSimplified() {
    let simplifiedList = {};
    for (let property in actionsList.next) {
        if (actionsList.next.hasOwnProperty(property)) {
            simplifiedList[property] = nextListSimplified(actionsList.next[property]);
        }
    }
    return simplifiedList;
}

function nextListSimplified(nextList) {
    let str = [];
    for(let i = 0; i < nextList.length; i++) {
        let unit = nextList[i];
        let unitsToMoveStr = !unit.unitsToMove ? "" : "|" + (unit.unitsToMove.king * 1 + unit.unitsToMove.units * 2 + unit.unitsToMove.heroes * 4);
        str.push(unit.varName + "|" + unit.loops + unitsToMoveStr);
    }
    return str;
}