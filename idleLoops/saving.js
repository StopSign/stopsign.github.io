let doWork = new Worker('interval.js');
doWork.onmessage = function (event) {
    if (event.data === 'interval.start') {
        tick();
    }
};

let timeNeededInitial = 5 * 50 * 100;
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
let gold = 0;
let reputation = 0;
let curLoadout = 0;
let loadouts = [];
let skillList = ["Combat", "Magic"];
let skills = {};


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
    if (!window.localStorage.idleLoops1) { //New players to the game
        recalcInterval(50);
        towns.push(new Town(0));
        pauseGame();
        //tutorial here
        view.initalize();
        return;
    }
    closeTutorial();
    let toLoad = JSON.parse(window.localStorage.idleLoops1);
    for(let property in toLoad.stats) {
        if (toLoad.stats.hasOwnProperty(property)) {
            stats[property].talent = toLoad.stats[property].talent;
        }
    }
    for(let property in toLoad.skills) {
        if (toLoad.skills.hasOwnProperty(property)) {
            skills[property].exp = toLoad.skills[property].exp;
        }
    }
    towns.push(new Town(0));
    const town = towns[curTown];

    town.expWander = toLoad.expWander;
    town.expMet = toLoad.expMet;
    town.expSecrets = toLoad.expSecrets ? toLoad.expSecrets : 0;
    town.totalHeal = toLoad.totalHeal ? toLoad.totalHeal : 0;
    town.totalFight = toLoad.totalFight ? toLoad.totalFight : 0;

    recalcInterval(50);
    pauseGame();
    view.initalize();
    view.totalActionList.forEach((action) => {
        if(town.varNames.indexOf(action.varName) !== -1) {
            const varName = action.varName;
            if(toLoad["total" + varName])
                town["total" + varName] = toLoad["total" + varName];
            if(toLoad["checked" + varName])
                town["checked" + varName] = toLoad["checked" + varName];
            if(toLoad["good" + varName])
                town["good" + varName] = toLoad["good" + varName];
            if(toLoad["good" + varName])
                town["goodTemp" + varName] = toLoad["good" + varName];
        }
    });
    view.totalActionList.forEach((action) => {
        if(town.varNames.indexOf(action.varName) !== -1) {
            view.updateRegular(action.varName);
        }
    });
    actions.next = toLoad.nextList ? toLoad.nextList : actions.next;
    loadouts = toLoad.loadouts ? toLoad.loadouts : loadouts;

    view.updateNextActions();
    view.update();
    view.updateMultiPartActions();
}

function save() {
    let toSave = {};
    const town = towns[curTown];
    toSave.stats = stats;
    toSave.skills = skills;
    toSave.expWander = town.expWander;
    toSave.expMet = town.expMet;
    toSave.expSecrets = town.expSecrets;
    toSave.totalHeal = town.totalHeal;
    toSave.totalFight = town.totalFight;

    view.totalActionList.forEach((action) => {
        if(town.varNames.indexOf(action.varName) !== -1) {
            const varName = action.varName;
            toSave["total"+varName] = town["total"+varName];
            toSave["checked"+varName] = town["checked"+varName];
            toSave["good"+varName] = town["good"+varName];
            toSave["goodTemp"+varName] = town["good"+varName];
        }
    });
    toSave.nextList = actions.next;
    toSave.loadouts = loadouts;

    window.localStorage.idleLoops1 = JSON.stringify(toSave);
}

load();
