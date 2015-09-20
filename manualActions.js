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
	unitValues[y][x] = unitValuesInitial[y][x]*unitPointValues[y][x]*.3+unitValuesInitial[y][x]*Math.pow(1.08, unitPointValues[y][x]);
}

function clickBuildingBuyButton(num, type) {
	if(type == "wall") {
		if(num == 0 && gold >= buildingUpgradesCost[0][0]) { 
			gold -= buildingUpgradesCost[0][0]
			buildingUpgradesCost[0][0]*= 1.2
			wallHealth+=750
			wallHealthInitial+=750
		}
		document.getElementById("buyBuilding0").innerHTML = round1(wallHealthInitial);
		document.getElementById("costBuilding0").innerHTML = round1(buildingUpgradesCost[0][0])
	}
	if(type == "fence") {
		if(num == 0 && gold >= buildingUpgradesCost[1][0]) { 
			gold -= buildingUpgradesCost[1][0]
			buildingUpgradesCost[1][0]*= 1.2
			fenceHealth+=50
			fenceHealthInitial+=50
		}
		document.getElementById("buyBuilding0").innerHTML = round1(fenceHealthInitial);
		document.getElementById("costBuilding0").innerHTML = round1(buildingUpgradesCost[1][0])
	}
	
	updateWallHealthVisuals()
	updateGoldVisual()
}

function clickBuySpawnRate(type) {
	typeNum = convertTypeToNum(type, "right") 
	if(costSpawnRate[typeNum] <= gold) {
		gold -= costSpawnRate[typeNum]
		costSpawnRate[typeNum] *= 4
		initialSpawnRate[typeNum/2] *= .95;
		spawnRate[typeNum/2] *= .95;
		if(initialSpawnRate[typeNum/2] <= 1) {
			//TODO:handle this (disable the button?)
		}
	}
	updateStatusUpgrades("", type)
	updateGoldVisual()
}

function buyUpgradePoint(type) {
	typeNum = convertTypeToNum(type, "right")
	if(unitCosts[typeNum] <= gold) {
		gold -= unitCosts[typeNum]
		updateGoldVisual()
		unitCosts[typeNum] = 1.6 * unitCosts[typeNum];
		upgradePointsInitial[typeNum]++
		unitPointValues[typeNum][3]++;
		handleBuyAmounts(typeNum, 3)
		updateStatusUpgrades("", type)
		$("#slider").slider('option', 'max', upgradePointsInitial[typeNum]);
		$("#slider").slider('value', unitPointValues[typeNum][3]);
	}
	updateGoldVisual()
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

var myKeyQueue = [];

$(document).keydown(function(e) {
    code = (e.charCode != 0 ? e.charCode : e.keyCode)
    myKeyQueue.push(code);
	processKeyQueue();
});

/*$(document).keyup(function(e) {
    processKeyQueue();
});*/

function processKeyQueue() {
	key = myKeyQueue[0]
	myKeyQueue.splice(0, 1);
	if(key == 32) {
		pause()
	}
	if(key == 49) { //1
		clickedSpell(0)
	}
	if(key == 50) { //2
		clickedSpell(1)
	}
	if(myKeyQueue.length > 0)
		processKeyQueue()
}



function startANewstage() {
	constructionRate = .5
	constructionTotal = 0
	for(y = 0; y < units.length; y++) {
		for(x = units[y].length-1; x>=0; x--) {
			removeUnit(units[y][x], false);
		}
	}
	//TODO:handle different lines amounts visually
	linesEnabled = maps[stage][8];
	handleLineAmounts(linesEnabled)
	units = [[],[],[],[],[],[]];
	soldierSpawnRate = 0;
	spearSpawnRate = 0;
	spawnRate=[];
	spawnAmounts=[]
	for(j = 0; j < initialSpawnAmounts.length; j++) {
		spawnRate[j] = initialSpawnRate[j]
		spawnAmounts[j]=initialSpawnAmounts[j]
	}
	enemySpawnRate = .5;
	enemySpawnAmounts=[maps[stage][9][0], maps[stage][9][1], maps[stage][9][2]]
	enemySpawnRateIncrease=[maps[stage][10][0], maps[stage][10][1], maps[stage][10][2]]
	
	curBattles = [];
	storedArrowVisuals = [];
	storedLightningVisuals=[]
	timer = 19;
	totalTicks = 0
	curClickedUnit = -1;
	document.getElementById("stage").innerHTML=stage;
	document.getElementById("territoryGain").innerHTML = mapTimers[stage]>0?maps[stage][1]/5:maps[stage][1]
	document.getElementById("goldGain").innerHTML = maps[stage][0]
	unitValues[1] = [Math.pow(stage+12, 2)/10-12.89999, 4, .06, Math.pow(stage+1, 2)*10+50, 0, 4.5]
	unitValues[3] = [Math.pow(stage+9, 3)/100, 15, .04, Math.pow(stage+3, 2)*5-30, 0, 16]
	//updateProgressVisual()
	enemyFenceHealthInitial = maps[stage][2]
	enemyWallHealthInitial = maps[stage][3]
	wallHealth = wallHealthInitial
	enemyWallHealth = enemyWallHealthInitial
	fenceHealth = fenceHealthInitial
	enemyFenceHealth = enemyFenceHealthInitial;
	document.getElementById("enemyFence").style.display =  enemyFenceHealth>0?'inline-block':'none';;
	document.getElementById("enemyFenceHealth").style.display = enemyFenceHealth>0?'inline-block':'none';;
	document.getElementById("fence").style.display = fenceHealth>0?'inline-block':'none';
	document.getElementById("fenceHealth").style.display = fenceHealth>0?'inline-block':'none';
	
	//addUnit("spear", 0, "right", 1);
	
	started = 1
}