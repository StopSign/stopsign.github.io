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
    // window.localStorage[saveName] = decode("eyJkYXRlIjoiMjAxOS0wM8SNN1QxNjoxMDo1OC40MzlaIiwidG90YWxPZmZsaW5lTXPEhjbEncSyMDc1Ljg0OTk0NDcxxKFlbXBvd2VyZWTEhnt9xKFsZXZlbFNhxZHEhlvEgMSteHRMaXN0xLA6xIBrxKxnxZcic8WPZXB8NzMiXcShY2HFn8WPxafFqWXFq3wyxa/EoWJlZ3wxxKDFqMWzxZFuZ8WHxoLGhMW4xbrElsaEYmFycmFja3PGi8Shc3BlxpJtYW7Fu8WwxKF1bmnFoMWnZMalxolvbl8wxoLGmcWoxarFrDXGg8ShaG9tZcaxxrfGs8W5xawxOMaEaGlkZW91dMavxrHFr13FjcWoZWPFiMaoOjDGpMamcXVlQ8WPxpLFicSGdHLHm8Sha27FhcWPZMaJxIbHlyLHpseoxYnGiUNhcMesxrhpZ2hlxZ9QxYdzxq3Fl8SAxpxyx79ux7YiYW3HiW50xIYyfcWxImLFj3NzxaXFocSAZW5jaMagyI06xZgibnVtyIfIiciLyJ/Ij8iRZsadxZ/IgciiyKTIpsiKxqXIqciQxKFndceGxqBjxIXIoMWZyLHHlsShyKfItMiOyLYixpzGlci9yKHIo8ilyYHIiMizyIzJhciRYsioecivyYzIssioyZLGuMWHb8e7yZfJgMetyYPJkTrIqn3FjcWZZcWbxZ3Fn8iYx67FpcWnxp9ya2V0xrLGjcWsxL/GhGPGum3Gpca8xr7JuMWtNcajIsWzxbXJisiSxoDJt8a0fMqExb7Ki8qBxobImsaJcsaixb7GksaUxpbGmMqByo03xpDKmcaVxpfJt8mIcsafxqE0xozKjTbGjMqlyqfKjMeAxoIwyq3GncqmxqDGi8iRxqXGp8WhW8a/xbo5MseEx4bHiMeKx4wxfMW9yr7FrDPKqce3x4fHiceLxrDLh8uJyoIxy4HLjsuEx4vLh8uTyqrKscuNIseFy4/Lhcuby4jFsMeQc8eSx5TFocetyrrHmsecx57FiMWKOseix6THrsend8epx6vJjsevy7jHscecx7TIh8eFx7nHu3THvciEyIDIvsmHx77MiMmiyZDInzHJhsiTx7vIlsaIya7ImsicyJ7JoMmNzI3JmsSVyYbIrMW0yJ/Ji8mhyYLMjsSGzJDIkci4yLrIm8mKyL/Mm8ylzJ3MqMShyYjIvMyayZnJhMyeyZPJlcy2yY7Jo8yPyYbHunLJnsq8zK7Mt8mkzKjJpyzJqcmrxZ7HlcWjybDIoMSixpTErMulxprKq8uByJHKh3TFts2RyoI2y5fIksqhypvKpMq1yq/Gg8q5xqbHlcq9y5XKj8ugy4PLkMuGyrDFujTNrca5xrvGvcudxo7Licuhy5lfy6THjsuny6nJtcurx5hpy67Hncq1x6DLs8ejZcely7fLuci9x63LvM6Qx7PHtcmOzILHuse8zIvIhsyJyIPIhc2GyLXJk8iUzJRnzJbIm8idyaTMo8yvyY/MnciqxKHMoMiuzInJmMy9zKbJpcmGzKrEgsyszLzMnMy4zq7MismJzrvMsM69zJHMu86yzKTOrM+DyJHNgc2Dz4HPiMmkyabJqMiiyarFnM2Nya7FpMaIxqlpxYhjybbGvseiYc2Uza3Jssm0z53GhM+fz6HJu8m9yb/Gss+nxqEyza3KgjXKqc2ZzKHNnMq9xpHGk8qiypzKtMaeyrfLicW/xoHKncqxyp/KkNCBxozKk8aIxorNoMuVz7zKtsahz7/Nosqj0ILFutCLyq7Kt9CTx4HKs8aa0JbGodCYxbvQmsWo0Jx8y5/KgtCk0KLKhM2oyrvFt8qezaDGqtCJxq3NscuUyo3LjMeExrrKgM2Vy4rKjjnLgsuiy5HHjc25xaw2xr7NvM2wzb/LpsaazoLHlcusx5nHm86Ix5/Lssu0zo3Ltsewx6rOkc6O0ZTHssyAzpfHuM6ZzIXOm8ivzp7MjM+Cz4/Mkc6jyJfFiyLMl86ozKLNhc60zJ00zJ/IrdGsyLDOq8y+xIbRsMypyLnOucy1z4bRtc610bjMs8ad0bzOqs6g0bfPhMi0yZbRvdKFOtKAy6DJncmf0orRrsy40bjJp8iRz5fFpsWixajFlcWJRMSDYdGoxKzIn8etd8WezKfFssid0qYicsSqeEnNqWnEpsynx63Sq2x4zpXMpzjFgXjOlseCOTjNiSLGpWxvxpbJrMyi0ZEs04jTis6M04nTjNOLx6TTj86N0ZHNqNODxpZTxKNy0olbZsSmy6jTjdOQ047TodOg06NlyJHFn2/TmUrHiXJu0rHIoNOm05h5UGHLusetYsi5bGRBdcaUVsSmx5vMpy41xprHiWxDyI4uMjY2xKHEo8SlbFRpxrvEsTM1NjjUitSDyobTvEzFkMWSxIYzx7fMg8Wf1J3FkWzRt8WOb2Fky5DKvMiRz5vImnRUx4rTqNKw1Kc6OcyzYXXLqEJlZtOoZVLMhMaSyJ/TiMmH1LvLqNOGRcWDdNKJ05xs057ViNS8ZdOGc9WMcNWOxIbVkNWScNWJZVBsyYnRjsux1ZvTndGSd8+gdEbTqNWDx7/TvMi8xaHVh8m0xatC07jLstWcZX0=");

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

let levelSave, unlockList, unlockStory, storyJournal, restartReason, pauseReason, storyPage, empowered, initialUnlock, consoleLog, totalOfflineMs;
let loadouts, recentTutorial;

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
    pauseReason = "";
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
    if(toLoad.levelSave !== undefined) {levelSave = toLoad.levelSave;}
    if(toLoad.king && toLoad.king.savedData) {king.savedData = toLoad.king.savedData;}
    king.recalcListLength(); //set highestListLength

    if(toLoad.unlockList !== undefined) {unlockList = toLoad.unlockList; }
    if(toLoad.unlockStory !== undefined) {unlockStory = toLoad.unlockStory;}
    if(toLoad.storyJournal !== undefined) {storyJournal = toLoad.storyJournal;}
    if(toLoad.storyPage !== undefined) {storyPage = toLoad.storyPage;}
    if(toLoad.buildAuraValue !== undefined) {buildAuraValue = toLoad.buildAuraValue;}
    if(toLoad.soulC !== undefined) {soulC = toLoad.soulC;}
    if(toLoad.totalTime !== undefined) {totalTime = toLoad.totalTime;}
    if(toLoad.curLevel !== undefined) {curLevel = toLoad.curLevel;}
    if(toLoad.highestLevel !== undefined) {highestLevel = toLoad.highestLevel;}
    if(toLoad.loadouts !== undefined) {loadouts = toLoad.loadouts;}
    if(toLoad.recentTutorial !== undefined) {recentTutorial = toLoad.recentTutorial;}

    if(toLoad.pauseBeforeRestart !== undefined) { document.getElementById("pauseBeforeRestart").checked = toLoad.pauseBeforeRestart }
    if(toLoad.pauseListEmpty !== undefined) { document.getElementById("pauseListEmpty").checked = toLoad.pauseListEmpty }
    if(toLoad.pauseListsEmpty !== undefined) { document.getElementById("pauseListsEmpty").checked = toLoad.pauseListsEmpty }
    if(toLoad.pausePlaceCleared !== undefined) { document.getElementById("pausePlaceCleared").checked = toLoad.pausePlaceCleared }
    if(toLoad.waitForResources !== undefined) { document.getElementById("waitForResources").checked = toLoad.waitForResources }
    if(toLoad.keepBuild !== undefined) { document.getElementById("keepBuild").checked = toLoad.keepBuild }

    versionFix(toLoad);

    recalcInterval(50);
    pauseReason = "Load";
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

    toSave.pauseBeforeRestart = document.getElementById("pauseBeforeRestart").checked;
    toSave.pauseListEmpty = document.getElementById("pauseListEmpty").checked;
    toSave.pauseListsEmpty = document.getElementById("pauseListsEmpty").checked;
    toSave.pausePlaceCleared = document.getElementById("pausePlaceCleared").checked;
    toSave.waitForResources = document.getElementById("waitForResources").checked;
    toSave.keepBuild = document.getElementById("keepBuild").checked;

    toSave.version = "1";


    window.localStorage[saveName] = JSON.stringify(toSave);
}

function versionFix(toLoad) {
    if(toLoad.version === undefined) {
        levelSave[5].uniqueCleared = false;
    }

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
    pauseReason = "Import";
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