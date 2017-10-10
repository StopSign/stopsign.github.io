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
var bonuses = { points:0, tickSpeedLevel:1, transferRateLevel:1 };

function loadDefaults() {
    settings.buyPerClick = 1;
    settings.selectedResourceNum = 0;

    settings.selectOneOrMultiple = 0;
    settings.buyLowestOrAll = 1;
    settings.showLastOrLowest = 0;
    settings.selectAllOrLowestBorderColor = 0;
    settings.selectShowNoneOrNanitesOrAmount = 0;
    highestLevel = 0; //SHOULD BE 0 BEFORE COMMIT
}

function load() {
    loadDefaults();
    if (TRUE || !window.localStorage.version3) { //hard clear the save
        createGrid();
        return;
    }
    var toLoad = JSON.parse(window.localStorage.version3);
    currentLevel = toLoad.currentLevel;
	bonuses = toLoad.bonuses;
    createGrid();

    settings = toLoad.settings;
    for(var x = 0; x < toLoad.theGrid.length; x++) {
        for(var y = 0; y < toLoad.theGrid[x].length; y++) {
            for(var property in toLoad.theGrid[x][y]) {
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
    bonuses = toLoad.bonuses;

    settings.buyPerClick = 1; //resets on refresh
    settings.selectedResourceNum = 0;
}

function save() {
    var toSave = {};
    toSave.settings = settings;
    toSave.currentLevel = currentLevel;
    toSave.theGrid = theGrid;
    toSave.highestLevel = highestLevel;
    toSave.bonuses = bonuses;
    // console.log('saved');
    window.localStorage.version3 = JSON.stringify(toSave);
}

load();

var doWork = new Worker('interval.js');
doWork.onmessage = function (event) {
    if (event.data === 'interval.start') {
        tick();
    }
};