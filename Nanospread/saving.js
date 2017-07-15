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
var totalMouseMoves = 0;
var isDragging = false;

function loadDefaults() {
    settings.buyPerClick = 1;
    settings.selectedResourceNum = 0;

    settings.selectOneOrMultiple = 0;
    settings.buyLowestOrAll = 0;
    settings.showLastOrLowest = 0;
    settings.selectAllOrLowestBorderColor = 0;
    settings.selectShowNoneOrNanitesOrAmount = 0;

}

loadDefaults();
createGrid();

setInterval(tick, 1000);