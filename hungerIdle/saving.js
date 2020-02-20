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
let saveName = "hunger";

let stop = false;

let prevState;

let all = {char: {}, enemy:{}};
let isCombat = false, isHunt = false, isFight = false, isConsume = false;
let combatTime;
let enemySelectionData = [];
let fightList = [];
let selectedFight = {col:-1, row:-1};


function clearSave() { //Doesn't work atm
    window.localStorage[saveName] = "";
    load();
}

function loadDefaults() {
    all.char = {
        name: "Voidling",
        stats: {
            healthMax: 5,
            healthRegen: 0,
            strength: 5,
            attackSpeedMax:3000
        },
        healthCur: 5,
        attackSpeedCur:0
    };
    all.logs = [];
    createAllEnemySelection();
    enemySelectionData[0][0].unlocked = true;
    enemySelectionData[0][1].unlocked = true;
}

function load() {
    loadDefaults();
    let toLoad = {};
    if(window.localStorage[saveName]) { //has a save file
        // toLoad = JSON.parse(window.localStorage[saveName]);
    }

    view.initialize();
    selectFight(0, 0);

    all.enemy = createEnemy(0, 0);
    recalcInterval(60);
}

function save() {
    let toSave = {};
    toSave.all = all;

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