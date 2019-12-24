//This function is exclusively for avoiding loading issues when the level data has been changed
//It will load whatever you've saved, and all subsequent level changes will use createGrid() instead
//Even if that means a level reset causes a different level to appear.
function createGridFromSave(savedGrid) {
    theGrid = [];
    for(let x = 0; x < 20; x++) {
        theGrid[x] = [];
    }
    for (let column = 0; column < savedGrid.length; column++) {
        for (let row = 0; row < savedGrid[column].length; row++) {
            if(savedGrid[column][row]) {
                theGrid[column][row] = new Square(column, row, 5);
                for(let property in savedGrid[column][row]) {
                    if (savedGrid[column][row].hasOwnProperty(property)) {
                        if(property === "specialLevels") {
                            continue;
                        }
                        theGrid[column][row][property] = savedGrid[column][row][property];
                    }
                }
                theGrid[column][row].isSelected = 0;
            }
        }
    }
    if(!theView) {
        theView = new View();
    }
}


function createGrid() {

    theGrid = [];
    for(let x = 0; x < 20; x++) {
        theGrid[x] = [];
    }
    let wrapAroundLevel = currentLevel;
    if(currentLevel >= levelData.length) {
        wrapAroundLevel = (currentLevel-numTutLevels) % (levelData.length-numTutLevels) + numTutLevels; //first 4 levels are 'tutorial', and don't repeat
    }
    document.getElementById("levelName").innerHTML = levelData[wrapAroundLevel].name;

    let currentLevelGrid = levelData[wrapAroundLevel].grid;
    let goalCost = Math.pow(2, currentLevel-2) * 100000000;
    goalCost /= 4000 / Math.pow((currentLevel+1), 2);

    let totalFromLevelData = 0;
    for(let column = 0; column < currentLevelGrid[0].length; column++) {
        for (let row = 0; row < currentLevelGrid.length; row++) {
            let levelDataNum = currentLevelGrid[row][column];
            if(levelDataNum > 0) {
                totalFromLevelData += Math.pow(2, levelDataNum);
            }
        }
    }

    let consumeCostModifier = goalCost / totalFromLevelData;

    let initialCostGrid = [];
    for(let x = 0; x < currentLevelGrid.length; x++) {
        initialCostGrid[x] = [];
        for(let y = 0; y < currentLevelGrid[x].length; y++) {
            initialCostGrid[x][y] = (Math.pow(2, currentLevelGrid[x][y]) * consumeCostModifier) * 2;
        }
    }


    for (let column = 0; column < currentLevelGrid[0].length; column++) {
        for (let row = 0; row < currentLevelGrid.length; row++) {
            if(currentLevelGrid[row][column] === 0) {
                continue; //this makes the empty spots
            }
            let initialConsumeCost = initialCostGrid[row][column];
            theGrid[column][row] =  new Square(column, row, initialConsumeCost);
        }
    }

    doToAllSquares(function (square) {
        square.chooseStartingDirection(); //All of them have a transfer target
    }, false);

    for(let column = 0; column < currentLevelGrid[0].length; column++) {
        for (let row = 0; row < currentLevelGrid.length; row++) {
            let levelDataNum = currentLevelGrid[row][column];
            if(levelDataNum === -1) {
                theGrid[column][row].gainNanites(theGrid[column][row].consumeCost);
            } else if(levelDataNum === -2) {
                theGrid[column][row].isPassive = true;
                theGrid[column][row].consumeCost = 0;
            }
        }
    }
}

function tick() {
    if(stop) {
        return;
    }
    timer++;
	tickGrowth();
    handleFPSDifference();
    clearNanitesReceived();
    sendNanites();
	tickStats();
	if(settings.autobuyToggle === 1) {
		autobuyLevels();
	}
	theView.update();

    if(timer % 30 === 0) {
        save();
    }
}

function autobuyLevels() {
    doToAllSquares(function (square) {
        if((square.naniteAmount + settings.autobuyPerTick) <= autobuy.currentMax && (square.nanites * (autobuy.amtToSpend / 100)) >= square.naniteCostAfterMultiBuy(settings.autobuyPerTick)) {
            square.autobuyMultipleNanites(settings.autobuyPerTick);
        }
    }, true);
}

function clearNanitesReceived() {
    doToAllSquares(function (square) {
        let target = theGrid[square.targetCol][square.targetRow];
        target.naniteAmountReceived = 0;
        target.advBotAmountReceived = 0;
    }, false);
}

function sendNanites() {
    doToAllSquares(function (square) {
        if(!square.isActive() && !square.isPassive) { //allow passive square to send
            return;
        }
        let target = theGrid[square.targetCol][square.targetRow];
        if(target.isActive() || target.isPassive) {
            target.gainAdvBots(square.sendPieceOfAdvBots()); //transfer .1% advBots
        }
        let amountTransferred = square.sendPieceOfNanites();
        target.gainNanites(amountTransferred); //transfer .1% nanites
        target.naniteAmountReceived += amountTransferred;
		stats.transferredThisLevel += amountTransferred;
		stats.totalTransferred += amountTransferred;

        amountTransferred = square.sendPieceOfAdvBots();
        target.gainAdvBots(amountTransferred); //transfer .1% adv bots
        target.advBotAmountReceived += amountTransferred;

        square.gainNanites(square.naniteRate * getNaniteGainBonus());
        square.gainAdvBots(square.advBotRate);
		stats.producedThisLevel += (square.naniteRate * getNaniteGainBonus());
		stats.totalProduced += (square.naniteRate * getNaniteGainBonus());
    }, false);
}

function getNaniteGainBonus() {
    return ((bonuses.points * 5)+100)/100 * bonuses.growthBonus;
}

function clickedSquare(col, row) {
    let square = theGrid[col][row];
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
    let pos = selected.indexOf(square);
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

function singleSelect(xDelta, yDelta) {
    if(selected.length === 0) {
        return;
    }
    let lastSelected = selected[selected.length - 1];
    let targetX = lastSelected.col + xDelta;
    let targetY = lastSelected.row + yDelta;
    if(targetX < 0 || targetX > theGrid.length || targetY < 0 || !theGrid[targetX][targetY]) {
        return;
    }
    clickedSquare(targetX, targetY);
}

function changeDirectionOfSelected(direction) {
    if(selected.length === 0) {
        return;
    }
    for(let i = 0; i < selected.length; i++) {
        let tempDirection = selected[i].transferDirection;
        selected[i].changeTargetDirection(direction);
        if(!selected[i].getTarget()) { //don't change if there's no good target
            selected[i].changeTargetDirection(tempDirection);
        }
    }
    theView.updateInfoBox();
    for(let i = 0; i < selected.length; i++) {
        theView.updateDirectionDot(selected[i]);
    }
}

function buyAll() {
    for(let i = 0; i < selected.length; i++) {
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
    for(let i = 0; i < selected.length; i++) {
        theView.updateDisplayNum(selected[i], settings.selectedResourceNum === 0 ? 'nanite' : 'advBot');
    }
}
function buyLowest() {
    let lowestAmountSquares = select.getLowestSquares(select.getSelectedActive(), 'nanite');
    let allBuyable = true;
    for(let i = 0; i < lowestAmountSquares.length; i++) {
        allBuyable = allBuyable && lowestAmountSquares[i].canBuyNanitesAfterMultiBuy();
    }
    if(allBuyable) {
        for(let i = 0; i < lowestAmountSquares.length; i++) {
            lowestAmountSquares[i].buyMultipleNanites(settings.buyPerClick);
        }
    }
}
function buyLowestEach() {
    let lowestAmountSquares = select.getLowestSquares(select.getSelectedActive(), 'nanite');
    for(let i = 0; i < lowestAmountSquares.length; i++) {
        if(lowestAmountSquares[i].isActive() && lowestAmountSquares[i].canBuyNanitesAfterMultiBuy()) {
            lowestAmountSquares[i].buyMultipleNanites(settings.buyPerClick);
        }
    }
}

function buyAdvBotsButtonPressed() {
    for(let i = 0; i < selected.length; i++) {
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
        let fps = msWaitTime/((timeList[timeList.length-1] - timeList[0]) / (timeList.length-1))*100;
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
    resetDerivBonuses();
    document.getElementById('levelConfirm').checked = "";
    theView.setSelectedFalse();
    let EPGain = calcEvolutionPointGain();
    bonuses.points += EPGain;
    bonuses.availableEP += EPGain;
	if(EPGain > 0) {
		stats.totalLevels++;
	}
    if(document.getElementById('resetAvailableEP').checked) {
        resetBonusPoints();
    }
    let keepDirections;
    if(newLevel === currentLevel) {
        keepDirections = theGrid;
    }
    currentLevel = newLevel;
	statsUpdate();
    createGrid();
    theView.createGrid();
    if(keepDirections) {
        applyDirectionsToGrid(keepDirections);
    }
	setTransferRate(bonuses.transferRateLevel);
    theView.update();
}

function applyDirectionsToGrid(tempGrid) {
    for (let column = 0; column < theGrid.length; column++) {
        for (let row = 0; row < theGrid[column].length; row++) {
            let oldSquare = tempGrid[column][row];
            let square = theGrid[column][row];
            if(oldSquare && square) {
                square.changeTargetDirection(oldSquare.transferDirection);
                if(!square.getTarget()) {
                    square.chooseStartingDirection();
                }
            }
        }
    }
}

function calcEvolutionPointGain() {
    let bonus = 9999999999;
    for (let column = 0; column < theGrid.length; column++) {
        for (let row = 0; row < theGrid[column].length; row++) {
            let square = theGrid[column][row];
            if (square && square.curSpecialPosNanites < bonus) { //gets lowest
                bonus = square.curSpecialPosNanites;
            }
        }
    }
    if(bonus > 0 && currentLevel === highestLevel) {
        highestLevel++;
        console.log('level up!');
    }
    return bonus === 0 ? 0 : (Math.pow((currentLevel+1), 2) * Math.pow(1.2, bonus) * (1 + (calcTotalAchieveBonus() / 100)));
}

function recalcInterval(newSpeed) {
    bonuses.tickSpeedLevel = newSpeed;
    doWork.postMessage({stop:true});
    doWork.postMessage({start:true,ms:(1000 / newSpeed)});
}

function buyTickSpeed() {
    if(bonuses.availableEP >= getTickSpeedCost() && bonuses.tickSpeedLevel < 2) {
		bonuses.availableEP -= getTickSpeedCost();
		recalcInterval(bonuses.tickSpeedLevel + .2);
    }
    theView.updateUpgrade();
}

function getTickSpeedCost(tickSpeedLevel) {
    if(tickSpeedLevel === undefined) {
        tickSpeedLevel = bonuses.tickSpeedLevel;
    }
    return precision2(50 * Math.pow(5, (tickSpeedLevel - 1)*5));
}

function setTransferRate(newRate) {
    bonuses.transferRateLevel = newRate;
    doToAllSquares(function (square) {
        square.transferRate = newRate;
    }, false);
}

function buyTransferRate() {
    if(bonuses.availableEP >= getTransferRateCost() && bonuses.transferRateLevel < 50) {
		bonuses.availableEP -= getTransferRateCost();
		setTransferRate(round5(bonuses.transferRateLevel + .1));
    }
    theView.update();
}

function getTransferRateCost(transferRateLevel) {
    if(transferRateLevel === undefined) {
        transferRateLevel = bonuses.transferRateLevel;
    }
    return precision2(15 * Math.pow(4, transferRateLevel - 1));
}

function buyDiscountLevel() {
    if(bonuses.availableEP >= getDiscountCost()) {
        bonuses.availableEP -= getDiscountCost();
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

function getDiscountCost(discountLevel) {
    if(discountLevel === undefined) {
        discountLevel = bonuses.discountLevel;
    }
    return precision2(Math.pow(1.06, discountLevel) * Math.pow(discountLevel+1, 2)); // 1.06^n * (n+1)^2
}

function buyAbMaxLevel() {
    if(autobuy.currentMax < (highestLevel+1) * 10 && bonuses.availableEP >= getAbMaxCost()) {
		bonuses.availableEP -= getAbMaxCost();
		autobuy.currentMax++;
    }
    theView.update();
}

function getAbMaxCost(currentMax) {
    if(currentMax === undefined) {
        currentMax = autobuy.currentMax;
    }
    return round2(10 / 4 * Math.pow(currentMax, 2));
}

function buyAbAmtToSpendLevel() {
    if(autobuy.amtToSpend < 50 && bonuses.availableEP >= getAbAmtToSpendCost()) {
		bonuses.availableEP -= getAbAmtToSpendCost();
		autobuy.amtToSpend++;
    }
    theView.update();
}

function getAbAmtToSpendCost(amtToSpend) {
    if(amtToSpend === undefined) {
        amtToSpend = autobuy.amtToSpend;
    }
    return Math.pow(amtToSpend, 2) * 25;
}

function resetBonusPoints() {
    resetEPUpgrades();
    bonuses.availableEP = bonuses.points;
    theView.update();
}

function doToAllSquares(functionToRun, onlyIsActive) {
    for (let column = 0; column < theGrid.length; column++) {
        for (let row = 0; row < theGrid[column].length; row++) {
            let square = theGrid[column][row];
            if(square && (!onlyIsActive || square.isActive())) {
                functionToRun(square);
            }
        }
    }
}

function statsUpdate() {
	if(stats.ticksThisLevel > stats.highestTicks) {
		stats.highestTicks = stats.ticksThisLevel;
	}
	if(stats.highestTicks >= nextAchieveLevelGoal(achieves.highestTicksAch)) {
		while(stats.highestTicks >= nextAchieveLevelGoal(achieves.highestTicksAch)) {
			achieves.highestTicksAch++;
		}
	}
	if(stats.producedThisLevel > stats.highestProduced) {
		stats.highestProduced = stats.producedThisLevel;
	}
	if(stats.highestProduced >= nextAchieveLevelGoal(achieves.highestProducedAch)) {
		while(stats.highestProduced >= nextAchieveLevelGoal(achieves.highestProducedAch)) {
			achieves.highestProducedAch++;
		}
	}
	if(stats.transferredThisLevel > stats.highestTransferred) {
		stats.highestTransferred = stats.transferredThisLevel;
	}
	if(stats.highestTransferred >= nextAchieveLevelGoal(achieves.highestTransferredAch)) {
		while(stats.highestTransferred >= nextAchieveLevelGoal(achieves.highestTransferredAch)) {
			achieves.highestTransferredAch++;
		}
	}
	if(highestLevel >= ((achieves.highestLevelAch + 1) * 10)) {
		while(highestLevel >= ((achieves.highestLevelAch + 1) * 10)) {
			achieves.highestLevelAch++;
		}
	}
	if(stats.totalLevels >= ((achieves.totalLevelsAch + 1) * 10)) {
		while(stats.totalLevels >= ((achieves.totalLevelsAch + 1) * 10)) {
			achieves.totalLevelsAch++;
		}
	}
	stats.ticksThisLevel = 0;
	stats.producedThisLevel = 0;
	stats.transferredThisLevel = 0;
}

function tickStats() {
	stats.ticksThisLevel++;
	stats.totalTicks++;
	if(stats.totalTicks >= nextAchieveLevelGoal(achieves.totalTicksAch)) {
		while(stats.totalTicks >= nextAchieveLevelGoal(achieves.totalTicksAch)) {
			achieves.totalTicksAch++;
		}
	}
	if(stats.totalProduced >= nextAchieveLevelGoal(achieves.totalProducedAch)) {
		while(stats.totalProduced >= nextAchieveLevelGoal(achieves.totalProducedAch)) {
			achieves.totalProducedAch++;
		}
	}
	if(stats.totalTransferred >= nextAchieveLevelGoal(achieves.totalTransferredAch)) {
		while(stats.totalTransferred >= nextAchieveLevelGoal(achieves.totalTransferredAch)) {
			achieves.totalTransferredAch++;
		}
	}
}
function nextAchieveLevelGoal(achievement) {
	return 10 * Math.pow(10, achievement);
}

function calcAchieveBonus(achievement) {
    return achievement * ((0.1 + (achievement * 0.1)) / 2);
}

function calcTotalAchieveBonus() {
	let totalAchieveBonus = 0;
	totalAchieveBonus += calcAchieveBonus(achieves.highestTicksAch);
	totalAchieveBonus += calcAchieveBonus(achieves.totalTicksAch);
	totalAchieveBonus += calcAchieveBonus(achieves.highestProducedAch);
	totalAchieveBonus += calcAchieveBonus(achieves.totalProducedAch);
	totalAchieveBonus += calcAchieveBonus(achieves.highestTransferredAch);
	totalAchieveBonus += calcAchieveBonus(achieves.totalTransferredAch);
	totalAchieveBonus += calcAchieveBonus(achieves.highestLevelAch);
	totalAchieveBonus += calcAchieveBonus(achieves.totalLevelsAch);
	return round2(totalAchieveBonus);
}

function tickGrowth() {
    for(let x = bonuses.derivs.length - 1; x >= 0; x--) {
        let deriv = bonuses.derivs[x];
        deriv.currentTicks++;
        if(deriv.currentTicks >= deriv.ticksNeeded) {
            deriv.currentTicks -= deriv.ticksNeeded;
            if(x === 0) {
                //deriv.amount  deriv.gainMultiplier
                bonuses.growthBonus += (deriv.amount * Math.pow(2, deriv.upgradeAmount)) / 10000;
                continue;
            }
            let prevDeriv = bonuses.derivs[x-1];
            prevDeriv.amount += deriv.amount * Math.pow(2, deriv.upgradeAmount);
        }
    }
}

function resetDerivBonuses() {
    bonuses.growthBonus = 1;
    for(let x = 0; x < bonuses.derivs.length; x++) {
        bonuses.derivs[x].ticksNeeded = x === 0 ? 4 : Math.pow(2, (x-1))*10;
        bonuses.derivs[x].currentTicks = 0;
        bonuses.derivs[x].upgradeAmount = 0;
        bonuses.derivs[x].amount = 1;
    }
}

function calcCostForNextDeriv() {
    return precision2(factorial(bonuses.derivs.length+4)*4.2); //Starts at 100
}

function buyNextDeriv() {
    let cost = calcCostForNextDeriv();
    if(bonuses.availableEP >= cost) {
        bonuses.availableEP -= cost;
        bonuses.points -= cost;
        addDeriv();
    }
}

function addDeriv() {
    let pos = bonuses.derivs.length;
    bonuses.derivs[pos] = {};
    let newDeriv = bonuses.derivs[pos];
    newDeriv.ticksNeeded = pos === 0 ? 4 : Math.pow(2, (pos-1))*10;
    newDeriv.currentTicks = 0;
    newDeriv.upgradeAmount = 0;
    newDeriv.amount = 1;
    theView.recreateDerivs();
}
