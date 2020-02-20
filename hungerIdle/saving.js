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
    // window.localStorage[saveName] = "";

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
            attackSpeedMax:2000
        },
        base: {
            healthMax: 5,
            strength: 5
        }
    };
    fixStartingStats(all.char);

    all.logs = [];
    createAllEnemySelection();
}

function load() {
    loadDefaults();
    let toLoad = {};
    if(window.localStorage[saveName]) { //has a save file
        toLoad = JSON.parse(window.localStorage[saveName]);

        for (let property in toLoad.all.char.stats) {
            if (toLoad.all.char.stats.hasOwnProperty(property)) {
                all.char.stats[property] = toLoad.all.char.stats[property];
            }
        }
        for (let property in toLoad.all.char.base) {
            if (toLoad.all.char.base.hasOwnProperty(property)) {
                all.char.base[property] = toLoad.all.char.base[property];
            }
        }
        all.char.healthCur = toLoad.all.char.healthCur;
        all.char.staminaCur = toLoad.all.char.staminaCur;
        if(toLoad.fightList) {
            fightList = toLoad.fightList;
            view.create.fightList();
        }
        if(toLoad.enemySelectionData) {
            for (let i = 0; i < enemySelectionData.length; i++) {
                for (let j = 0; j < enemySelectionData[i].length; j++) {
                    if (toLoad.enemySelectionData[i] && toLoad.enemySelectionData[i][j]) {
                        enemySelectionData[i][j] = toLoad.enemySelectionData[i][j];
                    }
                }
            }
        }
    }

    view.initialize();
    selectFight(0, 0);

    all.enemy = createEnemy(0, 0);
    recalcInterval(60);
    toLoad = {};
}

function save() {
    let toSave = {};
    toSave.all = all;
    toSave.fightList = fightList;
    toSave.enemySelectionData = enemySelectionData;

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