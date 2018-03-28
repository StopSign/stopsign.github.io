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



function clearSave() {
    window.localStorage.idleLoops1 = "";
    load();
}

function loadDefaults() {
    initializeStats();
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
    // for(let property in toLoad.stats) {
    //     if (toLoad.stats.hasOwnProperty(property) && typeof toLoad.stats[property] !== 'object') {
    //         stats[property] = toLoad.stats[property];
    //     }
    // }


    recalcInterval(50);
    view.initalize();
}

function save() {
    let toSave = {};
    toSave.stats = stats;
    window.localStorage.idleLoops1 = JSON.stringify(toSave);
}

load();
