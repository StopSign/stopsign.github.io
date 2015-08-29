function clickBuyButton(pos, type) {
	//only pos == 1 and 4
	typeNum = convertTypeToNum(type, "right")
	if(pos === 1 && unitPointValues[typeNum][3] > 0) {
		unitPointValues[typeNum][0]++
		unitPointValues[typeNum][3]--
	}
	if(pos === 4 && unitPointValues[typeNum][0] > 0) {
		unitPointValues[typeNum][3]++
		unitPointValues[typeNum][0]--
	}
	handleBuyAmounts(typeNum, 0)
	handleBuyAmounts(typeNum, 3)
	updateStatusUpgrades("", type)
	updateGoldVisual()
}

function handleBuyAmounts(y, x) {
	unitValues[y][x] = unitValuesInitial[y][x]*unitPointValues[y][x]*.1+unitValuesInitial[y][x]*Math.pow(1.04, unitPointValues[y][x]);
}

function clickBuySpawnRate(type) {
	typeNum = convertTypeToNum(type, "right") 
	if(costSpawnRate[typeNum] <= gold) {
		gold -= costSpawnRate[typeNum]
		costSpawnRate[typeNum] *= (1.6 + typeNum/10)
		initialSpawnRate[typeNum/2] *= .95;
		spawnRate[typeNum/2] *= .95;
		if(initialSpawnRate[typeNum/2] <= .5) {
			initialSpawnRate[typeNum/2]*=2;
			spawnRate[typeNum/2] *= 2;
			initialSpawnAmounts[typeNum/2]*=2;
			spawnAmounts[typeNum/2+1] *= 2;
		}
	}
	updateStatusUpgrades("", type)
	updateGoldVisual()
	updateSpawnRate()
}

function buyUpgradePoint(type) {
	typeNum = convertTypeToNum(type, "right")
	if(unitCosts[typeNum] <= gold) {
		gold -= unitCosts[typeNum]
		updateGoldVisual()
		if(unitCosts[typeNum] < 30) unitCosts[typeNum] = 30
			unitCosts[typeNum] = Math.floor(1.2 * unitCosts[typeNum]);
		upgradePointsInitial[typeNum]++
		unitPointValues[typeNum][3]++;
		handleBuyAmounts(typeNum, 3)
		updateStatusUpgrades("", type)
		$("#slider").slider('option', 'max', upgradePointsInitial[typeNum]);
		$("#slider").slider('value', unitPointValues[typeNum][3]);
	}
	updateGoldVisual()
}

//obsolete
function increasestage() {
	if(higheststageUnlocked != stage) {
		stage++
		unitsThroughOnRight = 0;
		unitsThroughOnLeft = 0;
		document.getElementById("stage").innerHTML=stage;
		startANewstage();
	}
}

//obsolete
function decreasestage() {
	stage--;
	if(stage <=0) {
		stage = 1;
	}
	else {
		unitsThroughOnRight = 0;
		unitsThroughOnLeft = 0;
		document.getElementById("stage").innerHTML=stage;
		startANewstage();
	}
}

function removeHover() {
	prevDiv = document.getElementById("unit"+curClickedUnit);
	if(prevDiv) {
		prevDiv.style.border = "0px solid black";
		prevDiv.style.marginTop = "0px";
		prevDiv.style.marginLeft = "0px";
		prevDiv.style.padding = "0px";
	}
	document.getElementById("victoryConditionBox").style.display="inline-block";
	document.getElementById("unitDisplayBox").style.display="none";
	
	curClickedUnit = "-1";
}

function hoverAUnit(id) {
	prevDiv = document.getElementById("unit"+curClickedUnit);
	if(prevDiv) {
		prevDiv.style.border = "0px solid black";
		prevDiv.style.marginTop = "0px";
		prevDiv.style.marginLeft = "0px";
		prevDiv.style.padding = "0px";
	}
	curClickedUnit = id;
	if(id=="-1") {
		document.getElementById("victoryConditionBox").style.display="inline-block";
		document.getElementById("unitDisplayBox").style.display="none";
		return;
	}
	div = document.getElementById("unit"+id);
	div.style.border = "1px solid black";
	div.style.marginTop = "-1px";
	div.style.marginLeft = "-3px";
	div.style.padding = "0px 2px";
	
	updateHover(id)
	
	document.getElementById("victoryConditionBox").style.display="none";
	document.getElementById("unitDisplayBox").style.display="inline-block";
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
	globalSpawnRate=1;
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
	document.getElementById("goldGain").innerHTML = stage * stage;
	unitValues[1] = [stage+Math.floor(Math.pow(1.07, stage))-1, 3, .06, 150+Math.floor(stage*stage*stage/6), Math.floor(stage*stage/10), 4.5]
	unitValues[3] = [14+stage*5+Math.floor(Math.pow(1.08, stage)), 20, .04, 15+Math.floor(stage*stage/2), 0, 10]
	//updateProgressVisual()
	placeCurTimers=[]
	placeAmounts=[]
	for(j = 0; j < placeMaxTimers.length; j++) {
		placeCurTimers[j]=placeMaxTimers[j]
		placeAmounts[j]=placeAmountsStart[j]
	}
	wallHealth = wallHealthInitial
	enemyWallHealth = enemyWallHealthInitial
	fenceHealth = fenceHealthInitial
	enemyFenceHealth = enemyFenceHealthInitial;
	
	updateSpawnRate()
	//addUnit("spear", 0, "right", 1);
}