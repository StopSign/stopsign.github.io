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
var bonuses = { points:0, tickSpeedLevel:1, transferRateLevel:1, discountLevel:0 };
var autobuy = { currentMax:1, amtToSpend:1 };
// var tickInterval = 0;

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
    if (!window.localStorage.version3) { //hard clear the save
        createGrid();
        recalcInterval(bonuses.tickSpeedLevel);
        return;
    }
    var toLoad = JSON.parse(window.localStorage.version3);
    currentLevel = toLoad.currentLevel;
	bonuses = toLoad.bonuses;
	autobuy = toLoad.autobuy;
	//Handling previous versions
	if(bonuses.tickSpeedLevel === undefined) {
		bonuses.tickSpeedLevel = 1;
	}
	if(bonuses.transferRateLevel === undefined) {
		bonuses.transferRateLevel = 1;
	}
	if(bonuses.discountLevel === undefined) {
		bonuses.discountLevel = 0;
	}
	if(autobuy === undefined) {
		var autobuy = { currentMax:1, amtToSpend:1 };
	}
	if(autobuy.currentMax === undefined) {
		autobuy.currentMax = 1;
	}
	if(autobuy.amtToSpend === undefined) {
		autobuy.amtToSpend = 1;
	}
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
