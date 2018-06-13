let doWork = new Worker('interval.js');
doWork.onmessage = function (event) {
    if (event.data === 'interval.start') {
        tick();
    }
};

let timeNeededInitial = 5 * 50;
let timer = timeNeededInitial;
let timeNeeded = timeNeededInitial;
let stop = false;
const view = new View();
const actions = new Actions();
const towns = [];
let curTown = 0;

let statList = ["Str", "Dex", "Con", "Per", "Int", "Cha", "Spd", "Luck", "Soul"];
const stats = {};
let prevState = {};
let shouldRestart = true;

let gold = 0, initialGold = 0;
let reputation = 0;
let supplies = 0;
let herbs = 0;
let hide = 0;

let curLoadout = 0;
let loadouts = [];
let skillList = ["Combat", "Magic", "Practical", "Alchemy"];
let skills = {};
let soulstoneChance = 1;
let townShowing = 0;
let maxTown;
let statShowing;
let actionTownNum;


function closeTutorial() {
    document.getElementById("tutorial").style.display="none";
}

function clearSave() {
    window.localStorage.idleLoops1 = "";
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
    if(window.localStorage.idleLoops1) { //has a save file
        closeTutorial();
        toLoad = JSON.parse(window.localStorage.idleLoops1);
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

    soulstoneChance = toLoad.soulstoneChance ? toLoad.soulstoneChance : 1;
    maxTown = toLoad.maxTown ? toLoad.maxTown : 0;
    actionTownNum = toLoad.actionTownNum ? toLoad.actionTownNum : 0;

    towns.push(new Town(0));
    let town = towns[0];
    town.expWander = toLoad.expWander ? toLoad.expWander : 0;
    town.expMet = toLoad.expMet ? toLoad.expMet : 0;
    town.expSecrets = toLoad.expSecrets ? toLoad.expSecrets : 0;
    town.totalHeal = toLoad.totalHeal ? toLoad.totalHeal : 0;
    town.totalFight = toLoad.totalFight ? toLoad.totalFight : 0;
    town.totalSDungeon = toLoad.totalSDungeon ? toLoad.totalSDungeon : 0;

    towns.push(new Town(1));
    town = towns[1];
    town.expForest = toLoad.expForest ? toLoad.expForest : 0;
    town.expShortcut = toLoad.expShortcut ? toLoad.expShortcut : 0;
    town.expHermit = toLoad.expHermit ? toLoad.expHermit : 0;

    recalcInterval(50);
    pauseGame();
    adjustAll();
    view.initalize();

    for(let i = 0; i < towns.length; i++) {
        town = towns[i];
        for(let j = 0; j < town.totalActionList.length; j++) {
            let action = town.totalActionList[j];
            if (town.varNames.indexOf(action.varName) !== -1) {
                const varName = action.varName;
                if (toLoad["total" + varName])
                    town["total" + varName] = toLoad["total" + varName];
                if (toLoad["checked" + varName])
                    town["checked" + varName] = toLoad["checked" + varName];
                if (toLoad["good" + varName])
                    town["good" + varName] = toLoad["good" + varName];
                if (toLoad["good" + varName])
                    town["goodTemp" + varName] = toLoad["good" + varName];
                view.updateRegular(action.varName, i);
            }
        }
    }


    actions.next = toLoad.nextList ? toLoad.nextList : actions.next;
    loadouts = toLoad.loadouts ? toLoad.loadouts : loadouts;

    view.updateNextActions();
    view.update();
    view.updateMultiPartActions();
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
            }
        }
    }
    toSave.nextList = actions.next;
    toSave.loadouts = loadouts;

    window.localStorage.idleLoops1 = JSON.stringify(toSave);
}

function exportSave() {
    save();
    document.getElementById("exportImport").value = encode(window.localStorage.idleLoops1);
    document.getElementById("exportImport").select();
    document.execCommand('copy');
    document.getElementById("exportImport").value = "";
}

function importSave() {
    window.localStorage.idleLoops1 = decode(document.getElementById("exportImport").value);
    load();
    stop = true;
}

load();