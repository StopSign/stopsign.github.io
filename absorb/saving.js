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
let saveName = "absorb";

let stop = false;

let prevState;

let all = {char: {}, enemy:{}};
let isCombat = false, isHunt = false, isFight = false, isConsume = false;
let combatTime;


function clearSave() { //Doesn't work atm
    window.localStorage[saveName] = "";
    load();
}

function loadDefaults() {
    all.char = {
        healthMax: 10,
        healthCur: 10,
        healthRegen: 0.01,
        attack: 1,
        attackSpeedMax:3000,
        attackSpeedCur:0
    };
    all.enemy = createEnemy();
    all.logs = [];

}

function load() {
    loadDefaults();
    let toLoad = {};
    if(window.localStorage[saveName]) { //has a save file
        // toLoad = JSON.parse(window.localStorage[saveName]);
    }

    view.initialize();
    recalcInterval(ticksPerSecond);
}

function save() {
    let toSave = {};

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