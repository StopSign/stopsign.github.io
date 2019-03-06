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
    // window.localStorage[saveName] = decode("eyJkYXRlIjoiMjAxOS0wM8SNNlQxNzozxJQwOC44NjJaIiwidG90YWxPZmZsaW5lTXPEhjY4MzM0Ny4wxLjEucS5NcSgZW1wb3dlcmVkxIZ7fcSgbGV2ZWxTYcWNxIZbxIDErHh0TGlzdMSvOsSAa8SrZ8WTInPFi2VwfDczIl3EoGNhxZvFi8WjxaVlxad8MsWrxKBiZWd8McSfxaTFr8WNbmfFg8W+xoDFtMW2MTDGgGJhcnJhY2tzxofEoHNwZcaPbWFuxbfFrMSgdW5pxZzFo2TGosaFb25fMMW+xpbFpMWmxag1xb/EoGhvbWXGrsa0xrDFtcWoMTjGgGhpZGVvdXTGrMauxatdxYnFpGVjxYTGpTowxqHGo3F1ZUPFi8aPxYXEhnRyx5jEoGtuxYHFi2TGhcSGx5Qix6PHpcWFxoVDYXDHqca1aWdoZcWbUMWDc8aqxZPEgMaZcse8bsezImFtx4ZudMSGMn3FrSJixYtzc8WhxZ3EgGVuY2jGnciKOsWUIm51bciEyIbIiMicyIzIjmbGmsWbx77In8ihyKPIh8aiyKbIjcSgZ3XHg8adY8SFyJ3Flciux5PEoMikyLHIi8izIsaZxpLIusieyKDIosi+yIXIsMiJyYLIjmLIpXnIrMmJyK/IpcmPxrXFg2/HuMmUyL3HqsmAyY46yKd9xYnFlWXFl8WZxZvIlcerxaHFo8accmtldMavxonFqDfGu2PGt23Gosa5xrvJtcWpNcagIsWvxbHJh8iPxbzJtMaxfMqBxbrKiMm+xoLIl8aFcsafxbrGj8aRxpPGlcm+yoo3xo3KlsaSxpTJtMmFcsacxp40xojKijbGiMqiyqTKica9xb7GjMaXyqvGncaHyI7GosakxZ1bxrzFtjkyx4HHg8eFx4fHiTF8xbnKusWoxLTKvseEx4bHiMaty4PLhcm/Mcq9x7TLisuBy4PLjsqnyq7KpsuTy4DHiMuWy4TFrMeNc8ePx5HFnceqyrbHl8eZx5vFhMWGOsefx6HHq8ekd8emx6jJi8esy7LHrseZx7HIhMeCx7bHuHTHusiBx73Iu8mEx7vMgsmfyY3InDHJg8iQx7jIk8aEyavIl8iZyJvJncmKzIfJlzrMisioyKrInMmIyZ7Iv8yIxIbMmci0yLbEgsiYyYfIvMyVzJ/Ml8yizITJhsyUyZbJgcyYzIvJksyvyYvJoMyJyYPHt3LJm8q4zKjMsMmhzJnJpCzJpsmoxZrHksWfya3IncShxpHEq8ufxpfKqMq9yI7KhHTFss2Kyb/EnMqdxpDKn8qZyqrGmsqjyrPFv8q1xqPHksq5y5DKjCLHgsuUy4zGusuYxbY0zafGtsa4zazNj8quMcuFzanLnF/LnseLy6HLo8myy6XHlWnLqMeazZ7Hncutx6Blx6LLscuzyLrHqsu2zozHsMeyyYvLvMe3x7nMhciDzIPIgMiCzL/MuMmQyJHMjmfMkMiYyJrJocydzKnJjMyryYPIqcWwzJzMvsy2zKDMssiOyLXIt8ymzLXMlsyxzKzJhci5zrbMqs64zLPIscmTzIPJlc6vzqnIjsy6zLzOvM6ozr7HjMmDxaDGhMWHxaTFkcWFRMSDYc+QxKvInMeqd8WazKHFrsiaz50icsSpeEnNo2nEpcyhx6rPomx4zpHMoTbEvXjOkjk2Ns2CIsaibG/Gk8mpzJzLrs6Jz78s0IHQg86I0ILQhdCEx6HPv82iz7rGk1PEonLPgVtmxKXLotCG0InQh9CY0JfQmmXIjsWbb9CQSseGcm7PqMid0J3Qj3lQYcu0x6piyLZsZEF1xpFWxKXHmMyhLsS8xaTHhmxDx6nEtzYwOcSgxKLEpGxUaca4xIY3ODk4xLLFrtCzTMWMxY7Ii8e0y73Fm9GTxY1sxIYzxYpvYWTLi8q4yI7FhMi5yIlUx4fQn8+n0Zw6OH0=");


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
let selectedLoadout = 0;
let scrollToEnd = "";

let levelSave, unlockList, unlockStory, storyJournal, restartReason, storyPage, empowered, initialUnlock, consoleLog, totalOfflineMs, loadouts;
let recentTutorial;

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
    loadouts = [];

    recentTutorial = 0;

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
    if(toLoad.loadouts) {loadouts = toLoad.loadouts;}
    if(toLoad.recentTutorial) {recentTutorial = toLoad.recentTutorial;}

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
    toSave.storyJournal = storyJournal;
    toSave.storyPage = storyPage;
    toSave.buildAuraValue = buildAuraValue;
    toSave.soulC = soulC;
    toSave.totalTime = totalTime;
    toSave.curLevel = curLevel;
    toSave.highestLevel = highestLevel;
    toSave.loadouts = loadouts;
    toSave.recentTutorial = recentTutorial;

    window.localStorage[saveName] = JSON.stringify(toSave);
}

function exportMapList() {
    document.getElementById("exportImportList").value = curListsAsString();
    document.getElementById("exportImportList").select();
    document.execCommand('copy');
}

function curListsAsString() {
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
    return str;
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
    loadListFromString(str);
}

function loadListFromString(str) {
    restartReason = "Imported";
    restart();

    if(!str) {
        createActionListsFromSimplifiedList({king:[],castle:[],units:[]});
        return;
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
    levelSave[curLevel].nextLists = listsToSimplified();
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