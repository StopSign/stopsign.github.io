function changeManualLane(div) {
	if(!div)
		return
	id = div.id.substring(10);
	for(j = 0; j < 6; j++) {
		document.getElementById('clickSpace' + j).innerHTML = "";
	}
	/*name = '#clickSpace' + currentManualLine
	if($(name).find('div').first()) {
		$(name).find('div').first().remove();
	}*/
	currentManualLine = parseInt(id);
	document.getElementById('clickSpace' + currentManualLine).innerHTML = "<div style='width: 97%;position:relative;height: 97%;border-radius: 50%;border-top: 0px solid transparent;border-bottom: 0px solid transparent;border-left: 56px solid rgba(168, 37, 168, 0.73);border-right: 0px solid green;'></div>"
}

function showLeftArrow() {
	document.getElementById("leftArrow").style.display="inline-block"
}

function hideLeftArrow() {
	document.getElementById("leftArrow").style.display="none"

}
function showRightArrow() {
	document.getElementById("rightArrow").style.display="inline-block"
	
}

function hideRightArrow() {
	document.getElementById("rightArrow").style.display="none"
}

function clickBuyButton(pos, type, direction) {
	typeNum = convertTypeToNum(type, direction)
	if(typeNum == 1 && pos == 2) return
	if(upgradePointsAvailable[typeNum] > 0) {
		if(handleBuyAmounts(typeNum, pos-1)) {
			upgradePointsAvailable[typeNum]--;
			unitPointValues[typeNum][pos-1]++
		}
	}
	updateStatusUpgrades("", type, direction)
}

function resetUpgradePoints(type) {
	typeNum = convertTypeToNum(type, "right")
	upgradePointsAvailable[typeNum] = upgradePointsInitial[typeNum]
	for(t = 0; t < unitPointValues[typeNum].length; t++) {
		unitPointValues[typeNum][t]=0
	}
	for(t = 0; t < unitValues[typeNum].length; t++) {
		unitValues[typeNum][t]=unitValuesInitial[typeNum][t]
	}
	updateStatusUpgrades("", type, direction)
}

function handleBuyAmounts(y, x) {
	if(x==0) unitValues[y][x] = 1.05 * unitValues[y][x] + 1
	if(x==2) { 
		if(unitValues[y][x] > 2) return 0;
		unitValues[y][x] *= 1.1 
	}
	if(x==3) unitValues[y][x] = 1.05 * unitValues[y][x] + 10
	if(x==4) unitValues[y][x]+=.300000001;
	return 1;
}

function clickBuySpawnRate(type) {
	typeNum = convertTypeToNum(type, "right") 
	if(costSpawnRate[typeNum] <= gold) {
		gold -= costSpawnRate[typeNum]
		costSpawnRate[typeNum] *= 2.5
		spawnRate[typeNum/2] *= .9;
		initialSpawnRate[typeNum/2] *= .9;
	}
	updateStatusUpgrades("", type, "right")
}

function increaseLevel() {
	if(highestLevelUnlocked != level) {
		level++
		unitsThroughOnRight = 0;
		unitsThroughOnLeft = 0;
		document.getElementById("level").innerHTML=level;
		currentManualLine = -1;
		startANewLevel();
	} else {
		increaseLevelError = 40
	}
}

function decreaseLevel() {
	level--;
	if(level <=0) {
		level = 1;
	}
	else {
		unitsThroughOnRight = 0;
		unitsThroughOnLeft = 0;
		document.getElementById("level").innerHTML=level;
		currentManualLine = -1;
		startANewLevel();
	}
}

function clickAUnit(id) {
	prevDiv = document.getElementById("unit"+curClickedUnit);
	if(prevDiv) {
		prevDiv.style.border = "0px solid black";
		prevDiv.style.marginTop = "0px";
		prevDiv.style.marginLeft = "0px";
		prevDiv.style.padding = "0px";
	}

	curClickedUnit = id;
	if(id=="-1") return;
	unit = findUnitById(id)
	div = document.getElementById("unit"+id);
	div.style.border = "1px solid black";
	div.style.marginTop = "-1px";
	div.style.marginLeft = "-3px";
	div.style.padding = "0px 2px";
	changeUnitScreen(unit)
	//handleStatusScreen(unit)
}

function handleStatusScreen(unit) {
	if(unit.type === "soldier" && unit.direction === "right") showSoldierScreen(unit);
	if(unit.type === "soldier" && unit.direction != "right") showEnemySoldierScreen();
	if(unit.type === "spear" && unit.direction === "right") showSpearScreen();
	if(unit.type === "spear" && unit.direction != "right") showEnemySpearScreen();
	
	//put in updating the unit's values
}

function startANewLevel() {
	for(y = 0; y < units.length; y++) {
		for(x = units[y].length-1; x>=0; x--) {
			removeUnit(units[y][x], false);
		}
	}
	unitsThroughOnRight = 0;
	unitsThroughOnLeft = 0;
	units = [[],[],[],[],[],[]];
	linesEnabled = 6;
	soldierSpawnRate = 4;
	spearSpawnRate = .5;
	spawnRateManual = 0;
	for(j = 0; j < spawnRate.length; j++) {
		spawnRate[j] = initialSpawnRate[j]
		spawnAmounts[j+1]=initialSpawnAmounts[j]
	}
	enemySpawnRate = 9;
	curBattles = [];
	storedLines = [];
	timer = 0;
	stop = 0;
	totalTicks = 0
	curClickedUnit = -1;
	document.getElementById("level").innerHTML=level;
	document.getElementById("territoryGain").innerHTML = level * 10 + (level * level);
	unitValues[1] = [level, 3, .06, 150+level*level, 0]
	unitValues[3] = [50, 20, .04, 30, 0]
	updateProgressVisual()
	spawnAmounts[0] = level;
	if(currentManualLine == -1) {
		for(j = 0; j < 6; j++) {
			document.getElementById('clickSpace' + j).innerHTML = "<div class='clickMe'>Click Me</div>";
		}
	}
	for(j = 0; j < linesEnabled; j++) {
		addUnit("soldier", j, "left", spawnAmounts[0]);
	}
	for(j = 0; j < placeCurTimers.length; j++) {
		placeCurTimers[j]=placeMaxTimers[j]
		placeAmounts[j]=placeAmountsStart[j]
	}
}