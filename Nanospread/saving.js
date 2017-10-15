var doWork = new Worker('interval.js');
doWork.onmessage = function (event) {
    if (event.data === 'interval.start') {
        tick();
    }
};

var settings = {};
var theView;
var selected = [];
var timeList = [];
var timer = 0;
var stop = 0;
var multFromFps = 1;
var msWaitTime = 1000;
var theGrid = [];
var menuOpen = "";
var startingDragPoint = {};
var endingDragPoint = {};
var select = new Select();
var isDragging = false;
var currentLevel = 0; //SWITCH LEVELS
var highestLevel;
var bonuses, autobuy;

function clearSave() {
    window.localStorage.version3 = "";
    load();
}

function loadDefaults() {
    settings.buyPerClick = 1;
    settings.selectedResourceNum = 0;

    settings.selectOneOrMultiple = 0;
    settings.buyLowestOrAll = 1;
    settings.showLastOrLowest = 0;
    settings.selectAllOrLowestBorderColor = 0;
    settings.selectShowNoneOrNanitesOrAmount = 0;
    highestLevel = 0; //SHOULD BE 0 BEFORE COMMIT

    bonuses = { points:0, tickSpeedLevel:1, transferRateLevel:1, discountLevel:0, test2:10};
    autobuy = { currentMax:1, amtToSpend:1 };
}

function load() {
    loadDefaults();
    if (!window.localStorage.version3) { //hard clear the save
        createGrid();
        recalcInterval(bonuses.tickSpeedLevel);
        return;
    }
    var toLoad = JSON.parse(window.localStorage.version3);
    currentLevel = toLoad.currentLevel;

    //Handles a change in properties
    for(var property in toLoad.bonuses) {
        if (toLoad.bonuses.hasOwnProperty(property)) {
            bonuses[property] = toLoad.bonuses[property];
        }
    }
    for(property in toLoad.autobuy) {
        if (toLoad.autobuy.hasOwnProperty(property)) {
            autobuy[property] = toLoad.autobuy[property];
        }
    }
    createGrid();

    settings = toLoad.settings;
    for(var x = 0; x < toLoad.theGrid.length; x++) {
        for(var y = 0; y < toLoad.theGrid[x].length; y++) {
            for(property in toLoad.theGrid[x][y]) {
                if (toLoad.theGrid[x][y].hasOwnProperty(property)) {
                    if(theGrid[x][y])
                    theGrid[x][y][property] = toLoad.theGrid[x][y][property];
                }
            }
            if(theGrid[x][y]) {
                theGrid[x][y].isSelected = 0;
            }
        }
    }
    highestLevel = toLoad.highestLevel;

    settings.buyPerClick = 1; //resets on refresh
    settings.selectedResourceNum = 0;
    setTransferRate(bonuses.transferRateLevel);
    recalcInterval(bonuses.tickSpeedLevel);
}

function save() {
    var toSave = {};
    toSave.settings = settings;
    toSave.currentLevel = currentLevel;
    toSave.theGrid = theGrid;
    toSave.highestLevel = highestLevel;
    toSave.bonuses = bonuses;
	toSave.autobuy = autobuy;
    // console.log('saved');
    window.localStorage.version3 = JSON.stringify(toSave);
}

load();
