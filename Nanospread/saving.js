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

    selectOneOrMultipleSetting(0); //multiple
    selectBuyLowestOrAll(0); //Lowest
    settings.buyPerClick = 1;
    settings.selectedResourceNum = 0;
}

loadDefaults();
createGrid();

setInterval(tick, 1000);