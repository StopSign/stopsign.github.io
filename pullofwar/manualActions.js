function changeManualLane(id) {
	for(j = 0; j < 6; j++) {
		document.getElementById('clickSpace' + j).innerHTML = "";
	}
	currentManualLine = parseInt(id);
	document.getElementById('clickSpace' + currentManualLine).innerHTML = "<img src='img/selected.png' height='100%' width='100'>"//"<div style='width: 97%;position:relative;height: 97%;border-radius: 50%;border-top: 0px solid transparent;border-bottom: 0px solid transparent;border-left: 56px solid rgba(168, 37, 168, 0.73);border-right: 0px solid green;'></div>"
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
	updateGoldVisual()
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
	if(x==3) unitValues[y][x] = 1.05 * unitValues[y][x] + 15
	if(x==4) unitValues[y][x]+=.200000001;
	return 1;
}

function clickBuySpawnRate(type) {
	typeNum = convertTypeToNum(type, "right") 
	if(costSpawnRate[typeNum] <= gold) {
		gold -= costSpawnRate[typeNum]
		costSpawnRate[typeNum] *= (1.6 + typeNum/10)
		spawnRate[typeNum/2] *= .9;
		initialSpawnRate[typeNum/2] *= .9;
	}
	updateStatusUpgrades("", type, "right")
	updateGoldVisual()
}

function buyUpgradePoint(type) {
	typeNum = convertTypeToNum(type, "right")
	if(unitCosts[typeNum] <= gold) {
		gold -= unitCosts[typeNum]
		updateGoldVisual()
		if(unitCosts[typeNum] < 30) unitCosts[typeNum] = 30
		unitCosts[typeNum] = Math.floor(1.2 * unitCosts[typeNum]);
		upgradePointsAvailable[typeNum]++;
		upgradePointsInitial[typeNum]++
		updateStatusUpgrades("", type, "right")
	}
	updateGoldVisual()
}

function increasestage() {
	if(higheststageUnlocked != stage) {
		stage++
		unitsThroughOnRight = 0;
		unitsThroughOnLeft = 0;
		document.getElementById("stage").innerHTML=stage;
		currentManualLine = -1;
		startANewstage();
	} else {
		increasestageError = 40
	}
}

function decreasestage() {
	stage--;
	if(stage <=0) {
		stage = 1;
	}
	else {
		unitsThroughOnRight = 0;
		unitsThroughOnLeft = 0;
		document.getElementById("stage").innerHTML=stage;
		currentManualLine = -1;
		startANewstage();
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

function buyStartingPlaceAmounts(num) {
	if(territory > placeAmountCosts[num]) {
		placeAmountsStart[num]++
		placeAmounts[num]++
		territory-=placeAmountCosts[num]
	}
	updateTerritoryVisual()
	updatePlaceVisuals()
}

function startANewstage() {
	linesEnabled = 6;
	for(y = 0; y < units.length; y++) {
		for(x = units[y].length-1; x>=0; x--) {
			removeUnit(units[y][x], false);
		}
	}
	units = [[],[],[],[],[],[]];
	unitsThroughOnRight = 0;
	unitsThroughOnLeft = 0;
	soldierSpawnRate = 4;
	spearSpawnRate = 2.5;
	spawnRateManual = 0;
	spawnRate=[];
	spawnAmounts=[]
	spawnAmounts[0] = stage < 3 ? stage : 1+.5 * stage
	for(j = 0; j < initialSpawnAmounts.length; j++) {
		spawnRate[j] = initialSpawnRate[j]
		spawnAmounts[j+1]=initialSpawnAmounts[j]
	}
	enemySpawnRate = .5;
	curBattles = [];
	storedLines = [];
	timer = 0;
	totalTicks = 0
	curClickedUnit = -1;
	document.getElementById("stage").innerHTML=stage;
	document.getElementById("territoryGain").innerHTML = stage * 10 + (stage * stage);
	unitValues[1] = [stage+Math.floor(Math.pow(1.07, stage))-1, 3, .06, 150+Math.floor(stage*stage*stage/6), Math.floor(stage*stage/10)]
	unitValues[3] = [14+stage*5+Math.floor(Math.pow(1.08, stage)), 20, .04, 15+Math.floor(stage*stage/2), 0]
	updateProgressVisual()
	if(currentManualLine == -1) {
		for(j = 0; j < 6; j++) {
			document.getElementById('clickSpace' + j).innerHTML = "<div class='clickMe'>Click Me</div>";
		}
	}
	placeCurTimers=[]
	placeAmounts=[]
	for(j = 0; j < placeMaxTimers.length; j++) {
		placeCurTimers[j]=placeMaxTimers[j]
		placeAmounts[j]=placeAmountsStart[j]
	}
	updateSpawnRate()
	//addUnit("spear", 0, "right", 1);
}