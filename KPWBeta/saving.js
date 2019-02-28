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
    displayBetaSaveNote();

    //debug
    // window.localStorage[saveName] = decode("eyJkYXRlIjoiMjAxOS0wMi0yOFQxNzo0NTo1NS7ElzFaIiwidG90YWxPZmZsaW5lTXPEhjIxxJQwOTQuMMS5xLrEijjEoWVtcG93ZXJlZMSGe33EoWxldmVsU2HFjsSGW8SAxK14dExpc3TEsDrEgGvErGfFlCJzxYxlcHw3MyJdxKFjYcWcxYzFpMWmZcWofDLFrMShYmVnfDHEoMWlxbDFjm5nxYTFv8aBxbXFtzEwxoFiYXJyYWNrc8aIxKFzcGXGkG1hbsaXxaXGmsacxp7GiMWuInVuacWdxaRkxqjGhm9uXzDFv8agxorFqcSyxoFob21lxrTGgMaYxafFqTQ4xrlpZGVvdXTGssa0xaxdxYrFpWVjxYXGqzowxKHGqGlxdWVDxYzGkMWGxIZ0csecxKFrbsWCxYxkxobEhseXIsenx6nFhsaGQ2Fwx63EoWhpZ2hlxZxQxYRzxrDFlMSAxppyyIFux7ciYW3HiW50xLF9xqZixYxzc8WixZ7EgGVuY2jGnsiPOsWVIm51bciJyIvIjcifMsiRxKFmxpvFnMiDyKLIpMimyIzGqMipyKsiZ3XHhsaeY8SFyKDFlsiyx5bEocinyLXIkMamxqLIvciwyKPIpcmCyIrItMiOyYbFu8ioecmKyYHHrsmEyZA6yKrGpse8cm/HvcmVyYzJl8mPyLbHj8WKxZZlxZjFmsWcyJjHr8WixaTGnXJrZXTGtceBxao5xoFjxrttxqjGvca/xaXJtzjGjcamxbDFssi+WyLFvMW+yoDGtnw1xo7Fvca1xoPImsaGcsqTxZLKlcaHyoDGj8aRxpPGlcagyp3GksaUxpbKjcaicsadxp/KpsabyqjGpMqNybfKkMaYyqfKqcm2xbbFqcqrxqPKqsaJybczxo3KssqsyrTKuMqtyrrKv8q5xqXHmMapx5XKicqOxozKgMe5x4fHiceLxrMxfMW6yoHKtsuVyrEiy4/HiMeKX8uUy5TLlsqOxrjHuMeGy53Hi8ugy5XFrceQc8eSx5TFnseux5nHm8edx5/FhcWHOsejx6XHr8eod8eqx6zJjcewy73Hssedx7XIice5x7vHvXTHv8iGyILIoMiSyJTIlsaFya3ImsicyJ7FlMamyK3FscifW8amyLnIu8ibyojJh8abyYnMjsmSyLXJlMyly5vFhMmfxZ7MnH3It8WhxoXFiMWlyplkRMSDYcyzxKzIn8eud8WbxIYxxa/Inc2AxKFyxKp4ScuJacSmzYDHrs2GbHjHtMe2OjE0xL54zZM1NDHMr8uIbG/GlMmrzJvLuWUszaTNpsekzaXNp82rzanNqMecxqbGqM2fxpRTxKNyzKhbZsSmy63Nrs2qza3NrMelzb9lxqbFnG/NtkTNi822zJfGmM21eVBhy7/HrmLIumxkQXXGklbEpseczYAuNcaYx4lsQ8etxLg2xLXEocSjxKVsVGnGvMSxNsS2xJHHrmPOl0zFjcWPzYTLm8e6x7zFnM61xY5syJA=");

    let divText = "";
    for(let i = 0; i < story.length; i++) {
        divText += "<div id='pageNum"+i+"' style='display:none'>"+story[i]+"</div>"
    }
    document.getElementById("storyContainer").innerHTML = divText;

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

let curLevel, highestLevel, mana, maxMana, totalTime, gold, wood, soulC, buildAuraValue, highestListsLength;

let curList = 0; //king
let currentlyHovering = 0;
let unitsSelectedForMove = { king:true, units:false, heroes:false };
let curInfoBox = "default";
let addButtons = document.getElementById("addButtons");
let curListNum = 1;

let levelSave, unlockList, unlockStory, storyJournal, restartReason, storyPage, empowered, initialUnlock, consoleLog, totalOfflineMs;

function clearSave() { //Doesn't work atm
    window.localStorage[saveName] = "";
    load();
}

function loadDefaults() {
    curLevel = 0;
    highestLevel = 0;
    mana = 1200;
    maxMana = 1200;
    totalTime = 0;
    gold = 0;
    wood = 0;
    soulC = 0;
    buildAuraValue = 1.5;

    levelSave = [];
    unlockList = [];
    unlockStory = []; //undefined is locked, true is new, false is seen
    storyJournal = [];
    restartReason = "";
    storyPage = 0;
    empowered = {};
    initialUnlock = true;
    consoleLog = [];

    totalOfflineMs = 0;
}

function load() {
    loadDefaults();
    let toLoad = {};
    if(window.localStorage[saveName]) { //has a save file
        toLoad = JSON.parse(window.localStorage[saveName]);
    }

    totalOfflineMs = toLoad.totalOfflineMs !== undefined ? toLoad.totalOfflineMs : 0;
    addOffline(Math.floor((new Date() - new Date(toLoad.date)) * .8));
    empowered = toLoad.empowered !== undefined ? toLoad.empowered : {};

    //defines defaults later
    if(toLoad.levelSave) {levelSave = toLoad.levelSave;}
    if(toLoad.king && toLoad.king.savedData) {king.savedData = toLoad.king.savedData;}
    king.recalcListLength(); //set highestListLength

    if(toLoad.unlockList) {unlockList = toLoad.unlockList; }
    if(toLoad.unlockStory) {unlockStory = toLoad.unlockStory;}
    if(toLoad.storyJournal) {storyJournal = toLoad.storyJournal;}
    if(toLoad.storyPage) {storyPage = toLoad.storyPage;}
    if(toLoad.buildAuraValue) {buildAuraValue = toLoad.buildAuraValue;}
    if(toLoad.soulC) {soulC = toLoad.soulC;}
    if(toLoad.totalTime) {totalTime = toLoad.totalTime;}
    if(toLoad.curLevel) {curLevel = toLoad.curLevel;}
    if(toLoad.highestLevel) {highestLevel = toLoad.highestLevel;}

    recalcInterval(50);
    pauseGame();

    click.init(); //attach onclick listeners
    view.initialize();
    adjustStoryDivs();
    restart();
    save();
}

function save() {
    let toSave = {};
    saveTimer = 60000;

    toSave.date = new Date();
    toSave.totalOfflineMs = totalOfflineMs;
    toSave.empowered = empowered;
    toSave.levelSave = levelSave;
    toSave.king = {savedData:king.savedData};
    toSave.unlockList = unlockList;
    toSave.unlockStory = unlockStory;
    toSave.storyDiary = storyJournal;
    toSave.storyPage = storyPage;
    toSave.buildAuraValue = buildAuraValue;
    toSave.soulC = soulC;
    toSave.totalTime = totalTime;
    toSave.curLevel = curLevel;
    toSave.highestLevel = highestLevel;

    window.localStorage[saveName] = JSON.stringify(toSave);
}

function exportMapList() {
    let str = "";
    for(let i = 0; i < actionsList.nextNames.length; i++) {
        let name = actionsList.nextNames[i];
        let arr = nextListSimplified(actionsList.next[name]);
        str += capitalizeFirst(name) + "=\n";
        if(arr.length > 0) {
            for(let i = 0; i < arr.length; i++) {
                str += '"'+arr[i]+'",\n';
            }
            str = str.substring(0, str.length - 2) + "\n";
        }
        str += "="
    }
    str = str.substring(0, str.length - 2);

    document.getElementById("exportImportList").value = str;
    document.getElementById("exportImportList").select();
    document.execCommand('copy');
}

function exportCurrentList() {
    let name = actionsList.nextNames[curList];
    let arr = nextListSimplified(actionsList.next[name]);
    let str = capitalizeFirst(name) + "=\n";
    if(arr.length > 0) {
        for (let i = 0; i < arr.length; i++) {
            str += '"' + arr[i] + '",\n';
        }
        str = str.substring(0, str.length - 2);
    }

    document.getElementById("exportImportList").value = str;
    document.getElementById("exportImportList").select();
    document.execCommand('copy');
}

function importList() {
    let str = document.getElementById("exportImportList").value;
    restartReason = "Imported";
    restart();

    if(!str) {
        createActionListsFromSimplifiedList({king:[],castle:[],units:[]});
    }

    let parts = str.split("=");
    if(parts.length % 2 === 1) {
        return; //invalid
    }
    let simplifiedList = {};
    for(let i = 0; i < parts.length; i+=2) {
        let name = parts[i];
        let list = "["+parts[i+1]+"]";
        simplifiedList[name.toLowerCase()] = JSON.parse(list);
    }

    createActionListsFromSimplifiedList(simplifiedList);
}

function exportSave() {
    save();
    document.getElementById("exportImportSave").value = encode(window.localStorage[saveName]);
    document.getElementById("exportImportSave").select();
    document.execCommand('copy');
    document.getElementById("exportImportSave").value = "";
}

function importSave() {
    window.localStorage[saveName] = decode(document.getElementById("exportImportSave").value);
    restartReason = "Imported";

    load();
    pauseGame();
}

function displayBetaSaveNote() {
    // console.log(isBeta);
    if(!isBeta) return;
    // document.addEventListener("DOMContentLoaded", function() {
    //     document.getElementById("betaSave").style.display = "block";
    // });
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
    for (let property in actionsList.next) {
        if (actionsList.next.hasOwnProperty(property) && simplifiedList[property]) {
            actionsList.next[property] = [];
            actionsList.current[property] = [];
            actions.validActions = [0, 0, 0];
            let num = property === "king" ? 0 : (property === "castle" ? 1 : 2);
            actions.refresh(num);
            listToActions(simplifiedList[property], num);
        }
    }
}

function listToActions(arr, num) {
    for(let i = 0; i < arr.length; i++) {
        let split = arr[i].split("|");
        let varName = split[0];
        let loops = split[1] - 0;
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
    let arr = [];
    for(let i = 0; i < nextList.length; i++) {
        let unit = nextList[i];
        let unitsToMoveStr = !unit.unitsToMove ? "" : "|" + (unit.unitsToMove.king * 1 + unit.unitsToMove.units * 2 + unit.unitsToMove.heroes * 4);
        arr.push(unit.varName + "|" + unit.loops + unitsToMoveStr);
    }
    return arr;
}