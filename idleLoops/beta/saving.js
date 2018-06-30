function startGame () {
  window.doWork = new Worker('interval.js');
  window.doWork.onmessage = function (event) {
      if (event.data === 'interval.start') {
          tick();
      }
  };
  displayBetaSaveNote();
  load();
}

let isBeta = !!location.href.match(/beta/i);
let saveName = !isBeta ? "idleLoops1" :  "idleLoopsBeta";

let timeNeededInitial = 5 * 50;
let timer = timeNeededInitial;
let timeNeeded = timeNeededInitial;
let stop = false;
const view = new View();
const actions = new Actions();
const towns = [];
let curTown = 0;

let statList = ["Dex", "Str", "Con", "Spd", "Per", "Cha", "Int", "Luck", "Soul"];
const stats = {};
let prevState = {};
let shouldRestart = true;

let gold = 0, initialGold = 0;
let glasses = 0;
let reputation = 0;
let supplies = 0;
let herbs = 0;
let hide = 0;
let potions = 0;
let teamNum = 0;
let guild = "";

let curLoadout = 0;
let loadouts = [];
let skillList = ["Combat", "Magic", "Practical", "Alchemy", "Crafting"];
let skills = {};
let soulstoneChance = 1;
let townShowing = 0;
let maxTown;
let statShowing;
let actionTownNum;
let trainingLimits = 50;
let storyShowing = 0;
let storyMax = 0;

let curDate = new Date();
let totalOfflineMs = 0;
let bonusSpeed = 1;
let offlineRatio = .8;

window.curAdvGuildSegment = 0;
window.curCraftGuildSegment = 0;



function closeTutorial() {
    document.getElementById("tutorial").style.display="none";
}

function clearSave() {
    window.localStorage[saveName] = "";
    load();
}

function loadDefaults() {
    initializeStats();
    prevState.stats = JSON.parse(JSON.stringify(stats));
    initializeSkills();
}

function load() {
    loadDefaults();

    let toLoad = {};
    if(window.localStorage[saveName]) { //has a save file
        closeTutorial();
        toLoad = JSON.parse(window.localStorage[saveName]);
    }

    for(let property in toLoad.stats) {
        if (toLoad.stats.hasOwnProperty(property)) {
            stats[property].talent = toLoad.stats[property].talent;
            stats[property].soulstone = toLoad.stats[property].soulstone;
        }
    }
    for(let property in toLoad.skills) {
        if (toLoad.skills.hasOwnProperty(property)) {
            skills[property].exp = toLoad.skills[property].exp;
        }
    }

    soulstoneChance = toLoad.soulstoneChance !== undefined ? toLoad.soulstoneChance : 1;
    maxTown = toLoad.maxTown !== undefined ? toLoad.maxTown : 0;
    actionTownNum = toLoad.actionTownNum !== undefined ? toLoad.actionTownNum : 0;

    let expLimit = 505000;
    towns[0] = new Town(0);
    let town = towns[0];
    town.expWander = toLoad.expWander !== undefined ? (toLoad.expWander > expLimit ? expLimit : toLoad.expWander) : 0;
    town.expMet = toLoad.expMet !== undefined ? (toLoad.expMet > expLimit ? expLimit : toLoad.expMet) : 0;
    town.expSecrets = toLoad.expSecrets !== undefined ? (toLoad.expSecrets > expLimit ? expLimit : toLoad.expSecrets): 0;
    town.totalHeal = toLoad.totalHeal !== undefined ? toLoad.totalHeal : 0;
    town.totalFight = toLoad.totalFight !== undefined ? toLoad.totalFight : 0;
    town.totalSDungeon = toLoad.totalSDungeon !== undefined ? toLoad.totalSDungeon : 0;

    towns[1] = new Town(1);
    town = towns[1];
    town.expForest = toLoad.expForest !== undefined ? toLoad.expForest : 0;
    town.expShortcut = toLoad.expShortcut !== undefined ? toLoad.expShortcut : 0;
    town.expHermit = toLoad.expHermit !== undefined ? toLoad.expHermit : 0;

    towns[2] = new Town(2);
    town = towns[2];
    town.expCity = toLoad.expCity !== undefined ? toLoad.expCity : 0;
    town.expDrunk = toLoad.expDrunk !== undefined ? toLoad.expDrunk : 0;
    town.totalAdvGuild = toLoad.totalAdvGuild !== undefined ? toLoad.totalAdvGuild : 0;
    town.totalCraftGuild = toLoad.totalCraftGuild !== undefined ? toLoad.totalCraftGuild : 0;

    actions.next = [];
    if(toLoad.nextList) {
        for (let i = 0; i < toLoad.nextList.length; i++) {
            let action = toLoad.nextList[i];
            if (action.name === "Guided Tour") {// && action.name !== "Throw Party") {
                continue;
            }
            if(action.name === "Sell Gold") {
                action.name = "Buy Mana";
            }
            actions.next.push(action);
        }
    }
    loadouts = [[],[],[],[],[]];
    if(toLoad.loadouts) {
        for (let i = 0; i < toLoad.loadouts.length; i++) {
            if(!toLoad.loadouts[i]) {
                continue;
            }
            for (let j = 0; j < toLoad.loadouts[i].length; j++) {
                let action = toLoad.loadouts[i][j];
                if (action.name === "Guided Tour") { // && action.name !== "Throw Party") {
                    continue;
                }
                if(action.name === "Sell Gold") {
                    action.name = "Buy Mana";
                }
                loadouts[i].push(action);
            }
        }
    }

    recalcInterval(50);
    pauseGame();
    view.initalize();

    for(let i = 0; i < towns.length; i++) {
        town = towns[i];
        for(let j = 0; j < town.totalActionList.length; j++) {
            let action = town.totalActionList[j];
            if (town.varNames.indexOf(action.varName) !== -1) {
                const varName = action.varName;
                if (toLoad["total" + varName] !== undefined)
                    town["total" + varName] = toLoad["total" + varName];
                if (toLoad["checked" + varName] !== undefined)
                    town["checked" + varName] = toLoad["checked" + varName];
                if (toLoad["good" + varName] !== undefined)
                    town["good" + varName] = toLoad["good" + varName];
                if (toLoad["good" + varName] !== undefined)
                    town["goodTemp" + varName] = toLoad["good" + varName];
                if(toLoad["searchToggler" + varName] !== undefined) {
                    document.getElementById("searchToggler" + varName).checked = toLoad["searchToggler" + varName];
                }
                view.updateRegular(action.varName, i);
            }
        }
    }

    document.getElementById("repeatLastAction").checked = toLoad.repeatLast;
    document.getElementById("audioCueToggle").checked = toLoad.pingOnPause !== undefined ? toLoad.pingOnPause : false;
    storyShowing = toLoad.storyShowing !== undefined ? toLoad.storyShowing : 0;
    storyMax = toLoad.storyMax !== undefined ? toLoad.storyMax : 0;

    totalOfflineMs = toLoad.totalOfflineMs !== undefined ? toLoad.totalOfflineMs : 0;
    addOffline(Math.floor((new Date() - new Date(toLoad.date)) * offlineRatio));

    adjustAll();

    view.changeStatView();
    view.updateNextActions();
    view.updateMultiPartActions();
    view.update();

}

function save() {
    let toSave = {};
    toSave.soulstoneChance = soulstoneChance;
    toSave.maxTown = maxTown;
    toSave.actionTownNum = actionTownNum;

    let town = towns[0];
    toSave.stats = stats;
    toSave.skills = skills;
    toSave.expWander = town.expWander;
    toSave.expMet = town.expMet;
    toSave.expSecrets = town.expSecrets;
    toSave.totalHeal = town.totalHeal;
    toSave.totalFight = town.totalFight;
    toSave.totalSDungeon = town.totalSDungeon;

    town = towns[1];
    toSave.expForest = town.expForest;
    toSave.expShortcut = town.expShortcut;
    toSave.expHermit = town.expHermit;

    town = towns[2];
    toSave.expCity = town.expCity;
    toSave.expDrunk = town.expDrunk;
    toSave.totalAdvGuild = town.totalAdvGuild;
    toSave.totalCraftGuild = town.totalCraftGuild;

    for(let i = 0; i < towns.length; i++) {
        town = towns[i];
        for(let j = 0; j < town.totalActionList.length; j++) {
            let action = town.totalActionList[j];
            if (town.varNames.indexOf(action.varName) !== -1) {
                const varName = action.varName;
                toSave["total" + varName] = town["total" + varName];
                toSave["checked" + varName] = town["checked" + varName];
                toSave["good" + varName] = town["good" + varName];
                toSave["goodTemp" + varName] = town["good" + varName];
                if(document.getElementById("searchToggler" + varName)) {
                    toSave["searchToggler"+varName] = document.getElementById("searchToggler" + varName).checked;
                }
            }
        }
    }
    toSave.nextList = actions.next;
    toSave.loadouts = loadouts;
    toSave.repeatLast = document.getElementById("repeatLastAction").checked;
    toSave.pingOnPause = document.getElementById("audioCueToggle").checked;
    toSave.storyShowing = storyShowing;
    toSave.storyMax = storyMax;
    toSave.date = new Date();
    toSave.totalOfflineMs = totalOfflineMs;

    window.localStorage[saveName] = JSON.stringify(toSave);
}

function exportSave() {
    save();
    document.getElementById("exportImport").value = encode(window.localStorage[saveName]);
    document.getElementById("exportImport").select();
    document.execCommand('copy');
    document.getElementById("exportImport").value = "";
}

function importSave() {
    window.localStorage[saveName] = decode(document.getElementById("exportImport").value);
    // console.log(window.localStorage[saveName]);
    actions.next = [];
    actions.current = [];
    load();
    pauseGame();
}

function displayBetaSaveNote() {
    if(!isBeta) return;
    document.addEventListener("DOMContentLoaded", function() {
        document.getElementById("betaSave").style.display = "block";
    });
}

function moveSaveToBeta() {
    window.localStorage[saveName] = window.localStorage.idleLoops1;
    location.reload();
}

function moveSaveFromBeta() {
    save();
    window.localStorage.idleLoops1 = window.localStorage[saveName];
}

// setInterval(tick, 20);