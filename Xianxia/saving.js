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
let currCulMethod = "";
let scrollMethods = {};

function clearSave() { //Doesn't work atm
    window.localStorage[saveName] = "";
    load();
}

function loadDefaults() {
    scrollMethods = {
        "Water":{
            element:"Water",
                level:0,
            unrefinedGain: 1,
            refineRate: 5,
            maxUnrefined:100,
            maxRefined:1000,
            purity:.8
        },
        "Earth":{
            element:"Earth",
            level:0,
            unrefinedGain: 1,
            refineRate: 5,
            maxUnrefined:100,
            maxRefined:1000,
            purity:.8
        },
        "Metal":{
            element:"Metal",
            level:0,
            unrefinedGain: 1,
            refineRate: 5,
            maxUnrefined:100,
            maxRefined:1000,
            purity:.8
        },
        "Fire":{
            element:"Fire",
            level:0,
            unrefinedGain: 1,
            refineRate: 5,
            maxUnrefined:100,
            maxRefined:1000,
            purity:.8
        },
        "Wood":{
            element:"Wood",
            level:0,
            unrefinedGain: 1,
            refineRate: 5,
            maxUnrefined:100,
            maxRefined:1000,
            purity:.8
        }
    };

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