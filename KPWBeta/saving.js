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
    // window.localStorage[saveName] = decode("eyJkYXRlIjoiMjAxOS0wM8SNNVQyMjrEijo0NC4xNjFaIiwidG90YWxPZmZsaW5lTXPEhjM1OcSzxLI3OC44MMS6xLoyNcSgZW1wb3dlcmVkxIbEgHNwZWFybWFuxIZbbnVsbCwxXX3EoGxldmVsU2HFoMWTxIDErHh0TGlzdMSvOsSAa8SrZ8WTInPFnmVwfDczIl3EoGNhxa3FnsW1xbdlxbl8MsW9xKBiZWd8McSfxbbGgcWgbmfFhcaQxpLGhsaIMTDGkmLFjnJhY2tzxpnEoMWLxY3Fj8WRxqfFtsWMxY7FkG7GmcW/InVuacWuxbVkxrbGl29uXzDGkMatxpvFujLGkcSgaG9tZceCx4fFtsW4xbo0OMaSaGlkZW91dMeAx4LFvcWbxqhlY8WGxrnElcSgxrZpcXVlQ8WexY7Fh8SGdHLHqsSga27Fg8WeZMaXxIYwx7THtnfHuMaXQ2Fwx7vHiGlnaGXFrVDFhXPGvsWmIsWMcsiOxZLHpSJhbceZbnTEhjJ9xrRixZ5zc8Wzxa/EgGVuY2jFkcicOlvFp3VtyIXIl8iZxrbIrciexrRmxY3FrciQxZXIssiWyJjImsi3yJ/EoGd1x5bFkWPEhciuyLDIv8e8yLTJgsidyYTIkcWNyYrIvcixyLPJgci2yZLIoMmCecmXyY7EoMmayJvJnMeIxYVvyIrJoMmZyLXJpDrIuH3FnMWnZcWpxavFrcimIsWyxpbFtcWQcmtldMeDx5DFuznGkmPHim3GtseMxpHGtMaBxoPJi1sixo3Gj8eOx4R8Ncafxo7Hg8aUyKjGl3LGicafxqHGo8alyp/GqMavxqvGssqUyoLKl8qlxqrGscazx6bGt8ekypDKlcadx47HlceXx5nHm8eBMXzGi8ePxofFusSxx5THlseYx5pfyrzKvMq+ypXHhsuDyrjLhsuIyr3FvsWcxbbHocejxa/Jj8enx6nHq8etxYbFiDrHscezybjHvsiAyYvJj8e1x7fFh8iByIPIs8eVyIjIinTIjMiTyI/JjMmUy7LIlcmPyaPIrTHJk8ihyIrIpMaWybfIqMiqyKzJqsmAyazLusmTyLrGgsityK8iyL7Jq8mROsu7xrTJhsmIyKnKj8mNzJDJm8ySyZPGr8mWy7TMj8yGzJHMk8aMyZ7Mhcu4zIfEhsykIsiJcsmoxa/MjcyhzKjMo8ifybDGtMm5xbTFsMW2xaTFh0TEg2HFiSLEq8ityY93xazMqsaAyKvNiCJyxKl4ScqxacSlzKrJj82NbHjIgsiEzJI0xL94zZo1NMu7y5PGtmxvxqTJtcyMy6BlLM2qzazHss2rza3Nsc2vza7Hs8WVxZfNtGXGtM2kzaZrU8SicsmfyK5mxKVzzbDNs82yx7POiM6Gx6rGtMWtb86ARM2SzoDFk86Nzb95UGHHusiWYsmHbGRBdcaiVsSlx6rMqi7EvsW2x5lsQ8SGNDnEuy4wNjA5xKDEosSkbFRpx4vIncW8ODQzyY9jzqFMxZ/Foc2Ly63IicWtz4XFoGzIncWdb2FkyrnMsMWb");
    // window.localStorage[saveName] = decode("eyJkYXRlIjoiMjAxOS0wM8SNNVQyMjoxMzowOS7EjjRaIiwidG90YWxPZmZsaW5lTXPEhjM2MDU0MznEky44MMS7xLs0xKBlbXBvd2VyZWTEhsSAc3BlYXJtYW7EhltudWxsLDFdfcSgbGV2ZWxTYcWgxZPEgMSseHRMaXN0xK86xIBrxKtnxZMic8WeZXB8NzMiXcSgY2HFrcWexbXFt2XFuXwyxb3EoGJlZ3wxxJ/FtsaBxaBuZ8WFxpDGksaGxogxMMaSYsWOcmFja3PGmcSgxYvFjcWPxZHGp8W2xYzFjsWQbsaZxb8idW5pxa7FtWTGtsaXb25fMMaQxq3Gm8W6MsaRxKBob21lx4LHh8W2xbjFujQ4xpJoaWRlb3V0x4DHgsW9xZvGqGVjxYbGucSYxKDGtmlxdWVDxZ7FjsWHxIZ0cseqxKBrbsWDxZ5kxpfEhjDHtMe2d8e4xpdDYXDHu8eIaWdoZcWtUMWFc8a+xaYixYxyyI7FkselImFtx5ludMSGMn3GtGLFnnNzxbPFr8SAZW5jaMWRyJw6W8WndW3IhciXyJnGtsityJ7GtGbFjcWtyJDFlciyyJbImMiayLfIn8SgZ3XHlsWRY8SFyK7IsMi/x7zItMmCyJ3JhMiRxY3Jisi9yLHIs8mByLbJksigyYJ5yZfJjsSgyZrIm8mcx4jFhW/IismgyZnItcmkOsi4fcWcxadlxanFq8WtyKYixbLGlsWTxrTGgcaDyYtbIsagcsaixqTGpjLFvsemxrfHpFvHn8W2x6HHo8WvyY/Hp8epx6vHrcWGxYg6x7HHs8m4x77IgMmLyY/Htce3xYfIgciDyLPHlciIyIp0yIzIk8iPyYzJlMqsyJXJj8mjyYPIoMiiyKTGlsm3yKjIqsisyarJgMmsyrTEoMi6xoLIrcivIsi+yavJkcmuyZPJhsmIyKnJv8mNy4jJm8uKxrTGr8mWyq7Lh8q+y4nIuMaMyZ7Kvcqyyr/JpSLIiXLJqMWvy4XLmMufy5rIn8mwxrTJucW0xbDFtsWkxYdExINhxYkixKvIrcmPd8WsxIYxxoDIq8u+xKByxKl4ScqKacSly77Jj8yEbHjIgsiExJXEviLJs8yRxLQxybDKiWxvxqTJtcuEypplLMygzKLHssyhzKPMp8ylzKTHs8WVxZfMqmXGtMa2zJvGpFPEonLJn8iuZsSlc8ymzKnMqMezzL7MvMeqxrTFrW/MtkTMicy2ybvGqMy1eVBhx7rIlmLJh2xkQXXGolbEpceqy74uNcaox5lsQ8SGNDnEvMSbxLI5xKDEosSkbFRpx4vInTgyzbI2zZ4iY82XTMWfxaHMgsuiyIfIicWtzbrFoGzIncWdb2Fkx5nKi8Wb");

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