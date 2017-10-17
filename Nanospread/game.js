//This function is exclusively for avoiding loading issues when the level data has been changed
//It will load whatever you've saved, and all subsequent level changes will use createGrid() instead
//Even if that means a level reset causes a different level to appear.
function createGridFromSave(savedGrid) {
    theGrid = [];
    for(var x = 0; x < 20; x++) {
        theGrid[x] = [];
    }
    for (var column = 0; column < savedGrid.length; column++) {
        for (var row = 0; row < savedGrid[column].length; row++) {
            if(savedGrid[column][row]) {
                theGrid[column][row] = new Square(column, row, 5);
                for(var property in savedGrid[column][row]) {
                    if (savedGrid[column][row].hasOwnProperty(property)) {
                        theGrid[column][row][property] = savedGrid[column][row][property];
                    }
                }
                theGrid[column][row].isSelected = 0;
            }
        }
    }
}


function createGrid() {
    var startingCoords = {x:0,y:0};

    theGrid = [];
    for(var x = 0; x < 20; x++) {
        theGrid[x] = [];
    }
    var wrapAroundLevel = currentLevel % levelData.length;

    var currentLevelGrid = levelData[wrapAroundLevel].grid;
    var goalCost = Math.pow(1.5, currentLevel) * 1000000000;

    var totalFromLevelData = 0;
    for(var column = 0; column < currentLevelGrid[0].length; column++) {
        for (var row = 0; row < currentLevelGrid.length; row++) {
            var levelDataNum = currentLevelGrid[row][column];
            if(levelDataNum === -1) {
                startingCoords.x = column;
                startingCoords.y = column;
            }
            if(levelDataNum > 0) {
                totalFromLevelData += Math.pow(2, levelDataNum);
            }
        }
    }

    var consumeCostModifier = goalCost / totalFromLevelData;

    var initialCostGrid = [];
    for(x = 0; x < currentLevelGrid.length; x++) {
        initialCostGrid[x] = [];
        for(var y = 0; y < currentLevelGrid[x].length; y++) {
            initialCostGrid[x][y] = (Math.pow(2, currentLevelGrid[x][y]) * consumeCostModifier) * 2;
        }
    }


    for (column = 0; column < currentLevelGrid[0].length; column++) {
        for (row = 0; row < currentLevelGrid.length; row++) {
            if(currentLevelGrid[row][column] === 0) {
                continue; //this makes the empty spots undefined in theGrid. Change if you want other terrain there.
            }
            var initialConsumeCost = initialCostGrid[row][column];
            theGrid[column][row] =  new Square(column, row, initialConsumeCost);
        }
    }

    doToAllSquares(function (square) {
        square.chooseStartingDirection(); //All of them have a transfer target
    }, false);

    var startingSquare = theGrid[startingCoords.x][startingCoords.y];
    startingSquare.gainNanites(startingSquare.consumeCost);
}


function tick() {
    if(stop) {
        return;
    }
    timer++;
    handleFPSDifference();
    clearNanitesReceived();
    sendNanites();
	autobuyLevels();

    if(!theView) {
        theView = new View();
    }
    theView.update();

    if(timer % 10 === 0) {
        save();
    }
}

function autobuyLevels() {
    doToAllSquares(function (square) {
        if(square.naniteAmount < autobuy.currentMax && (square.nanites * (autobuy.amtToSpend / 100)) >= square.naniteCost ) {
            square.buyNanites();
        }
    }, true);
}

function clearNanitesReceived() {
    doToAllSquares(function (square) {
        var target = theGrid[square.targetCol][square.targetRow];
        target.naniteAmountReceived = 0;
        target.advBotAmountReceived = 0;
    }, false);
}

function sendNanites() {
    doToAllSquares(function (square) {
        var target = theGrid[square.targetCol][square.targetRow];
        if(target.isActive()) {
            target.gainAdvBots(square.sendPieceOfAdvBots()); //transfer .1% advBots
        }
        var amountTransferred = square.sendPieceOfNanites();
        target.gainNanites(amountTransferred); //transfer .1% nanites
        target.naniteAmountReceived += amountTransferred;

        amountTransferred = square.sendPieceOfAdvBots();
        target.gainAdvBots(amountTransferred); //transfer .1% adv bots
        target.advBotAmountReceived += amountTransferred;

        square.gainNanites(square.naniteRate * getNaniteGainBonus());
        square.gainAdvBots(square.advBotRate);
    }, true);
}

function getNaniteGainBonus() {
    return ((bonuses.points * 5)+100)/100;
}


function clickedSquare(col, row) {
    var square = theGrid[col][row];
    //multiple are selected, selectOne setting is on, clicked a selected
    if(!settings.selectOneOrMultiple && selected.length > 1) {
        theView.setSelectedFalse();
        square.isSelected = true;
        selected.push(square);
        menuOpen = "";
        theView.updateInfoBox();
        adjustMenus();
        return;
    }

    square.isSelected = !square.isSelected;
    var pos = selected.indexOf(square);
    if(pos === -1) { //click new square
        menuOpen = "";
        if(!settings.selectOneOrMultiple && selected.length > 0) { //single
            theView.setSelectedFalse();
            selected.push(square);
        } else { //multiple
            selected.push(square);
        }
        theView.updateInfoBox();
    } else {
        theView.changeBorderSelected(square);
        selected.splice(pos, 1);
        theView.updateInfoBox();
    }
    adjustMenus();
    showOrHideBox();
}

function changeDirectionOfSelected(direction) {
    if(selected.length === 0) {
        return;
    }
    for(var i = 0; i < selected.length; i++) {
        selected[i].changeTargetDirection(direction);
        if(!selected[i].getTarget()) {
            selected[i].chooseStartingDirection();
        }
    }
    theView.updateInfoBox();
    for(i = 0; i < selected.length; i++) {
        theView.updateDirectionDot(selected[i]);
    }
}

function buyAll() {
    for(var i = 0; i < selected.length; i++) {
        if(selected[i].canBuyNanitesAfterMultiBuy()) {
            selected[i].buyMultipleNanites(settings.buyPerClick);
        }
    }
}
function buyNanitesButtonPressed() {
    if(selected.length === 0) {
        return;
    }
    if(settings.buyLowestOrAll === 1) {
        buyAll();
    } else if(settings.buyLowestOrAll === 0) {
        buyLowest();
    } else {
        buyLowestEach();
    }
    theView.updateInfoBox();
    for(var i = 0; i < selected.length; i++) {
        theView.updateDisplayNum(selected[i], settings.selectedResourceNum === 0 ? 'nanite' : 'advBot');
    }
}
function buyLowest() {
    var lowestAmountSquares = select.getLowestSquares(select.getSelectedActive(), 'nanite');
    var allBuyable = true;
    for(var i = 0; i < lowestAmountSquares.length; i++) {
        allBuyable = allBuyable && lowestAmountSquares[i].canBuyNanitesAfterMultiBuy();
    }
    if(allBuyable) {
        for(i = 0; i < lowestAmountSquares.length; i++) {
            lowestAmountSquares[i].buyMultipleNanites(settings.buyPerClick);
        }
    }
}
function buyLowestEach() {
    var lowestAmountSquares = select.getLowestSquares(select.getSelectedActive(), 'nanite');
    for(var i = 0; i < lowestAmountSquares.length; i++) {
        if(lowestAmountSquares[i].isActive() && lowestAmountSquares[i].canBuyNanitesAfterMultiBuy()) {
            lowestAmountSquares[i].buyMultipleNanites(settings.buyPerClick);
        }
    }
}

function buyAdvBotsButtonPressed() {
    for(var i = 0; i < selected.length; i++) {
        if(selected[i].canBuyAdvBots()) {
            selected[i].buyAdvBots();
        }
    }
    theView.updateInfoBox();
}

function handleFPSDifference() {
    timeList.push(new Date().getTime());
    if(timeList.length > 10) {
        timeList.splice(0, 1);
        var fps = msWaitTime/((timeList[timeList.length-1] - timeList[0]) / (timeList.length-1))*100;
        multFromFps = 100/fps;
        //$scope.fps = round(fps)+"%";
    } else {
        multFromFps = 1;
        //$scope.fps = "...";
    }
}


function changeLevel(newLevel) {

    if(!document.getElementById('levelConfirm').checked || newLevel < 0 || newLevel > highestLevel) {
        console.log('level change blocked');
        return;
    }
    theView.setSelectedFalse();
    bonuses.points += calcEvolutionPointGain();
    currentLevel = newLevel;
    createGrid();
    theView.createGrid();
	setTransferRate(bonuses.transferRateLevel);
    theView.update();
}

function calcEvolutionPointGain() {
    var bonus = 9999999999;
    for (var column = 0; column < theGrid.length; column++) {
        for (var row = 0; row < theGrid[column].length; row++) {
            var square = theGrid[column][row];
            if (square && square.curSpecialPosNanites < bonus) { //gets lowest
                bonus = square.curSpecialPosNanites;
            }
        }
    }
    if(bonus > 0 && currentLevel === highestLevel) {
        highestLevel++;
        console.log('level up!');
    }
    bonus *= Math.pow(1.3, currentLevel);
    return bonus;
}

function recalcInterval(newSpeed) {
    bonuses.tickSpeedLevel = newSpeed;
    doWork.postMessage({start:false});
    doWork.postMessage({start:true,ms:(1000 / newSpeed)});
}

function buyTickSpeed() {
    if(bonuses.points >= getTickSpeedCost() && bonuses.tickSpeedLevel < 5) {
		bonuses.points -= getTickSpeedCost();
		recalcInterval(bonuses.tickSpeedLevel + .2);
    }
    theView.updateUpgrade();
}

function getTickSpeedCost() {
    return round2(50 * Math.pow(2, (bonuses.tickSpeedLevel - 1)*5));
}

function setTransferRate(newRate) {
    bonuses.transferRateLevel = newRate;
    doToAllSquares(function (square) {
        square.transferRate = newRate;
    }, false);
}

function buyTransferRate() {
    if(bonuses.points >= getTransferRateCost() && bonuses.transferRateLevel < 10) {
		bonuses.points -= getTransferRateCost();
		setTransferRate(bonuses.transferRateLevel + 1);
    }
    theView.update();
}

function getTransferRateCost() {
    return round2(15 * Math.pow(2, bonuses.transferRateLevel - 1));
}

function buyDiscountLevel() {
    if(bonuses.points >= getDiscountCost()) {
        bonuses.points -= getDiscountCost();
        bonuses.discountLevel++;
        doToAllSquares(function (square) {
            square.naniteCost = square.calcNaniteCost();
        }, false);
    }
    theView.update();
}

function getCostReduction(discountLevel) {
    return Math.pow(1.01, discountLevel)*5 - 4;
}

function getDiscountCost() {
    return round2(Math.pow(1.01, bonuses.discountLevel) * Math.pow(bonuses.discountLevel+1, 2)); // 1.01^n * (n+1)^2
}

function buyAbMaxLevel() {
    if(autobuy.currentMax < highestLevel*2 && bonuses.points >= getAbMaxCost()) {
		bonuses.points -= getAbMaxCost();
		autobuy.currentMax++;
    }
    theView.update();
}

function getAbMaxCost() {
    return round2(10 * autobuy.currentMax);
}

function buyAbAmtToSpendLevel() {
    if(autobuy.amtToSpend < 100 && bonuses.points >= getAbAmtToSpendCost()) {
		bonuses.points -= getAbAmtToSpendCost();
		autobuy.amtToSpend++;
    }
    theView.update();
}

function getAbAmtToSpendCost() {
    return round2(25 * autobuy.amtToSpend);
}

function doToAllSquares(functionToRun, onlyIsActive) {
    for (var column = 0; column < theGrid.length; column++) {
        for (var row = 0; row < theGrid[column].length; row++) {
            var square = theGrid[column][row];
            if(square && (!onlyIsActive || square.isActive())) {
                functionToRun(square);
            }
        }
    }
}