var settings = {};
var theView;
var selected = [];
var timeList = [];
var timer = 0;
var stop = 0;
var multFromFps = 1;
var msWaitTime = 1000;
var theGrid = [];

function loadDefaults() {
    settings.buyPerClick = 1;

    settings.selectOneOrMultiple = 0;
    settings.buyLowestOrAll = 0;
    settings.selectedResourceNum = 0;
    settings.showLastOrLowest = 0;
}

loadDefaults();
createGrid();

setInterval(tick, 1000);