var doWork = new Worker('interval.js');
doWork.onmessage = function (event) {
    if (event.data === 'interval.start') {
        tick();
    }
};

var view;
var game;
var timer = 0;
var stop = 0;

var timeList = [];

function clearSave() {
    window.localStorage.terrafold1 = "";
    load();
}

function loadDefaults() {
    view = new View();
    game = new Game();
    game.initialize();
}


function load() {
    loadDefaults();
    if (!window.localStorage.terrafold1) { //New players to the game
        recalcInterval(10);
        return;
    }
    var toLoad = JSON.parse(window.localStorage.terrafold1);
    // for(var property in toLoad.game) {
    //     if (toLoad.game.hasOwnProperty(property)) {
    //         game[property] = toLoad.game[property];
    //     }
    // }
    // for(property in toLoad.game.ice) {
    //     if (toLoad.game.ice.hasOwnProperty(property)) {
    //         game.ice[property] = toLoad.game.ice[property];
    //     }
    // }
    recalcInterval(10);
}

function save() {
    var toSave = {};
    toSave.game = game;
    window.localStorage.terrafold1 = JSON.stringify(toSave);
}

load();
