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

function loadDefaults() {
    settings.buyPerClick = 1;
    settings.selectedResourceNum = 0;

    settings.selectOneOrMultiple = 0;
    settings.buyLowestOrAll = 1;
    settings.showLastOrLowest = 0;
    settings.selectAllOrLowestBorderColor = 0;
    settings.selectShowNoneOrNanitesOrAmount = 0;

    currentLevel = 0;
    createGrid();
}

function load() {
    loadDefaults();
    // return; //hard-clear the save
    if (!window.localStorage.version1) {
        return;
    }
    var toLoad = JSON.parse(window.localStorage.version1);
    settings = toLoad.settings;
    currentLevel = toLoad.currentLevel;
    for(var x = 0; x < toLoad.theGrid.length; x++) {
        for(var y = 0; y < toLoad.theGrid[x].length; y++) {
            for(var property in toLoad.theGrid[x][y]) {
                if (toLoad.theGrid[x][y].hasOwnProperty(property)) {
                    theGrid[x][y][property] = toLoad.theGrid[x][y][property];
                }
            }
            if(theGrid[x][y]) {
                theGrid[x][y].isSelected = 0;
            }
        }
    }

    settings.buyPerClick = 1; //resets on refresh
    settings.selectedResourceNum = 0;
}

function save() {
    var toSave = {};
    toSave.settings = settings;
    toSave.currentLevel = currentLevel;
    toSave.theGrid = theGrid;
    console.log('saved');
    window.localStorage.version1 = JSON.stringify(toSave);
}

load();

setInterval(tick, 1000);