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
let gold = 0;



function clearSave() {
    window.localStorage.idleLoops1 = "";
    load();
}

function loadDefaults() {
    initializeStats();
    prevState.stats = JSON.parse(JSON.stringify(stats));
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
    let toLoad = JSON.parse(window.localStorage.idleLoops1);
    for(let property in toLoad.stats) {
        if (toLoad.stats.hasOwnProperty(property)) {
            stats[property].talent = toLoad.stats[property].talent;
        }
    }
    towns.push(new Town(0));
    const town = towns[curTown];

    town.expWander = toLoad.expWander;
    town.expMet = toLoad.expMet;

    recalcInterval(50);
    pauseGame();
    view.initalize();
    view.totalActionList.forEach((action) => {
        if(town.varNames.indexOf(action.varName) !== -1) {
            const varName = action.varName;
            town["total" + varName] = toLoad["total" + varName];
            town["checked" + varName] = toLoad["checked" + varName];
            town["good" + varName] = toLoad["good" + varName];
            town["goodTemp" + varName] = toLoad["good" + varName];
        }
    });
    view.totalActionList.forEach((action) => {
        if(town.varNames.indexOf(action.varName) !== -1) {
            view.updateRegular(action.varName);
        }
    });
    view.update();
}

function save() {
    let toSave = {};
    const town = towns[curTown];
    toSave.stats = stats;
    toSave.expWander = town.expWander;
    toSave.expMet = town.expMet;

    view.totalActionList.forEach((action) => {
        if(town.varNames.indexOf(action.varName) !== -1) {
            const varName = action.varName;
            toSave["total"+varName] = town["total"+varName];
            toSave["checked"+varName] = town["checked"+varName];
            toSave["good"+varName] = town["good"+varName];
            toSave["good"+varName] = town["goodTemp"+varName];
        }
    });

    window.localStorage.idleLoops1 = JSON.stringify(toSave);
}

load();
