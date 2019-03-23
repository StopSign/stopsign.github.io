let doWork = new Worker('helpers/interval.js');
doWork.onmessage = function (event) {
    if (event.data === 'interval.start') {
        tick();
    }
};

let view;
let game;
let timer = 0;
let stop = 0;
let cometId = 0;

let timeList = [];

function clearSave() {
    window.localStorage.terrafold2 = "";
    load();
}

function loadDefaults() {
    view = new View();
    game = new Game();
    game.initialize();
}

function setInitialView() {
    view.checkSpaceDockUnlocked();
    view.updateSpaceDock();
    view.checkTractorBeamUnlocked();
    view.checkSpaceStationUnlocked();
    view.checkEnergyUnlocked();
    view.updateComputer();
    view.checkComputerUnlocked();
    view.updateRobots();
    view.checkRobotsUnlocked();
}


function load() {
    loadDefaults();
    if (!window.localStorage.terrafold2) { //New players to the game
        setInitialView();
        recalcInterval(10);
        return;
    }
    let toLoad = JSON.parse(window.localStorage.terrafold2);
    for(let property in toLoad.game) {
        if (toLoad.game.hasOwnProperty(property) && typeof toLoad.game[property] !== 'object') {
            game[property] = toLoad.game[property];
        }
    }
    loadGameVar(toLoad, "ice");
    loadGameVar(toLoad, "water");
    loadGameVar(toLoad, "clouds");
    loadGameVar(toLoad, "land");
    loadGameVar(toLoad, "trees");
    loadGameVar(toLoad, "farms");
    loadGameVar(toLoad, "population");
    loadGameVar(toLoad, "energy");
    loadGameVar(toLoad, "spaceStation");
    loadGameVar(toLoad, "tractorBeam");
    loadGameVar(toLoad, "spaceDock");

    game.computer.unlocked = toLoad.game.computer.unlocked;
    game.computer.threads = toLoad.game.computer.threads;
    game.computer.freeThreads = toLoad.game.computer.freeThreads;
    game.computer.speed = toLoad.game.computer.speed;
    for(let i = 0; i < toLoad.game.computer.processes.length; i++) {
        let rowData = toLoad.game.computer.processes[i];
        let row = game.computer.processes[i];
        row.currentTicks = rowData.currentTicks;
        row.ticksNeeded = rowData.ticksNeeded;
        row.threads = rowData.threads;
        row.cost = rowData.cost;
        row.isMoving = rowData.isMoving;
        row.completions = rowData.completions;
    }

    game.robots.unlocked = toLoad.game.robots.unlocked;
    game.robots.robots = toLoad.game.robots.robots;
    game.robots.robotsFree = toLoad.game.robots.robotsFree;
    game.robots.robotMax = toLoad.game.robots.robotMax;
    game.robots.ore = toLoad.game.robots.ore;
    game.robots.mines = toLoad.game.robots.mines;
    for(i = 0; i < toLoad.game.robots.jobs.length; i++) {
        rowData = toLoad.game.robots.jobs[i];
        row = game.robots.jobs[i];
        row.currentTicks = rowData.currentTicks;
        row.ticksNeeded = rowData.ticksNeeded;
        row.workers = rowData.workers;
        row.cost = rowData.cost;
        row.isMoving = rowData.isMoving;
        row.completions = rowData.completions;
    }

    document.getElementById('scienceSlider').value = game.population.scienceRatio;

    setInitialView();
    recalcInterval(10);
}

function loadGameVar(toLoad, theVar) {
    for(let property in toLoad.game[theVar]) {
        if (toLoad.game[theVar].hasOwnProperty(property)) {
            game[theVar][property] = toLoad.game[theVar][property];
        }
    }
}

function save() {
    let toSave = {};
    toSave.game = game;
    window.localStorage.terrafold2 = JSON.stringify(toSave);
}

load();
