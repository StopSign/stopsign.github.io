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
let saveName = "wuxia";

let stop = false;

let prevState = {};

let culRes = {};
let scrollMethods = {};
let equippedScrolls = {}; //map of 5 scroll items, one per element
let currDao = {}; //scroll currently cultivating
let currWeapon = {}; //weapon equipped
let inventory = [];


function clearSave() { //Doesn't work atm
    window.localStorage[saveName] = "";
    load();
}

function loadDefaults() {
    let newScroll = new Item("Water", 0);
    newScroll.createAsScroll(1, 100, 5, 1000, 80);
    equippedScrolls.put("Water", newScroll);

    newScroll = new Item("Earth", 0);
    newScroll.createAsScroll(1, 100, 5, 1000, 80);
    equippedScrolls.put("Earth", newScroll);

    newScroll = new Item("Metal", 0);
    newScroll.createAsScroll(1, 100, 5, 1000, 80);
    equippedScrolls.put("Metal", newScroll);

    newScroll = new Item("Fire", 0);
    newScroll.createAsScroll(1, 100, 5, 1000, 80);
    equippedScrolls.put("Fire", newScroll);

    newScroll = new Item("Wood", 0);
    newScroll.createAsScroll(1, 100, 5, 1000, 80);
    equippedScrolls.put("Wood", newScroll);

    currDao = equippedScrolls.get("Water");

    let newWeapon = new Item("Body", 0);
    newWeapon.createAsWeapon("sword", 5, 90, 3);
    inventory.push(newWeapon);

    culRes = {
        "Water": {
            level:0,
            unrefined:0,
            refined:0,
            purifiedMax: 0,
            purified: 0
        },
        "Earth": {
            level:0,
            unrefined:0,
            refined:0,
            purifiedMax: 0,
            purified: 0
        },
        "Metal": {
            level:0,
            unrefined:0,
            refined:0,
            purifiedMax: 0,
            purified: 0
        },
        "Fire": {
            level:0,
            unrefined:0,
            refined:0,
            purifiedMax: 0,
            purified: 0
        },
        "Wood": {
            level:0,
            unrefined:0,
            refined:0,
            purifiedMax: 0,
            purified: 0
        }
    };
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