function loadDefaults() {
	units = [[],[],[],[],[],[]];


	spawnManualAmounts =[0,  2];
	initialSpawnAmounts=[1,  .3333333];
	initialSpawnRateInitial=[9, 10];
	initialSpawnRate=   [9, 10];
	placeAmountsStart=[0,  1,   1,   1,    1,    1,     1];
	placeMaxTimers=   [0,  6,  17,  50,   99,  197,   393];
	placeAmountsInitial=[0, 25, 100, 500, 2000, 6000, 12000]
	placeAmountCosts= [0, 25, 100, 500, 2000, 6000, 12000]
	stage = 0;
	unitValues =       [[1, 3, .6, 30, 0, 4.5], [0, 0, 0, 0, 0, 0], [9, 9, .4, 30, 0, 15], [0, 0, 0, 0, 0, 0]]
	unitValuesInitial = [[1, 3, .6, 30, 0, 4.5], [0, 0, 0, 0, 0, 0], [6, 9, .4, 35, 0, 15], [0, 0, 0, 0, 0, 0]]
	costSpawnRate =        [20, 0, 90, 0];
	unitCosts =            [6, 0, 40, 0];
	upgradePointsInitial=  [0, 0,  0, 0];
	unitPointValues=[[0, 0, 0, 0, 0],[],[0, 0, 0, 0, 0],[]]
	gold = 0;
	territory = 0;
	higheststageUnlocked = 0;
	stop=0
	buttonsToClick = 0; //tutorial thing
	currentTab = 0;
	bonusFromFam = 1;
	totalDead=[0, 0, 0, 0]
	enemyWallHealthInitial = 80000;
	enemyWallHealth = 80000;
	enemyFenceHealthInitial = 150;
	enemyFenceHealth = 150;
	wallHealthInitial = 1500
	wallHealth = 1500
	fenceHealthInitial = 100
	fenceHealth = 100
	curUnitScreen = -1
	deadUnitBonus = [1, 1, 1, 1]
	currentMapInfoNum = -1
	offset = 0
	curMana = 20
	maxMana = 30
	holdingSpell = -1
	spellCosts = [9, 14]
	spellExp = 0;
	spellLevel = 0;
	expNeededToLevel = 200;
	mapTimers = [];
	for(l = 0; l < maps.length; l++) {
		mapTimers[l] = 0;
	}
	manaGain = .06;
}

function saveIntoStorage() {
    localStorage.allVariables103 = "";
	theCookie=""
	for(x = 0; x < spawnManualAmounts.length; x++) {
		theCookie+=spawnManualAmounts[x]+","
		theCookie+=initialSpawnAmounts[x]+","
		theCookie+=initialSpawnRate[x]+","
	}
	for(x = 0; x < placeAmountsStart.length; x++) {
		theCookie+=placeAmountsStart[x]+","
		theCookie+=placeMaxTimers[x]+","
	}
	theCookie+=stage+","
	for(x = 0; x < unitValues.length; x++) {
		for(y = 0; y < unitValues[x].length; y++) {
			theCookie+=unitValues[x][y]+","
		}
	}
	for(x = 0; x < costSpawnRate.length; x++) {
		theCookie+=costSpawnRate[x]+","
		theCookie+=unitCosts[x]+","
		theCookie+=upgradePointsInitial[x]+","
	}
	for(x = 0; x < unitPointValues.length; x++) {
		for(y = 0; y < unitPointValues[x].length; y++) {
			theCookie+=unitPointValues[x][y]+","
		}
	}
	theCookie+=gold+","
	theCookie+=territory+","
	theCookie+=higheststageUnlocked+","
	theCookie+=currentTab+","
	for(y = 0; y < totalDead.length; y++) {
		theCookie+=totalDead[y]+","
	}
	theCookie+=curMana+","
	theCookie+=maxMana+","
	for(y = 0; y < spellCosts.length; y++) {
		theCookie+=spellCosts[y]+","
	}
	theCookie+=spellExp+","
	theCookie+=spellLevel+","
	theCookie+=expNeededToLevel+","
	theCookie+=manaGain+","
	for(l = 0; l < maps.length; l++) {
		theCookie+=mapTimers[l]+","
	}
	
    localStorage.allVariables103 = theCookie;
}

function loadFromStorage() {
	document.getElementById("mainBox").style.display="inline-block";
	loadDefaults();
    if(localStorage.allVariables103) {
        expandedCookie = (','+localStorage.allVariables103).split(',');
        x = 1;
		for(y = 0; y < spawnManualAmounts.length; y++) {
			spawnManualAmounts[y]=parseFloat(expandedCookie[x++]);
			initialSpawnAmounts[y]=parseFloat(expandedCookie[x++]);
			initialSpawnRate[y]=parseFloat(expandedCookie[x++]);
		}
		
		for(y = 0; y < placeAmountsStart.length; y++) {
			placeAmountsStart[y]=parseFloat(expandedCookie[x++]);
			placeMaxTimers[y]=parseFloat(expandedCookie[x++]);
		}
		stage=parseFloat(expandedCookie[x++]);
		for(z = 0; z < unitValues.length; z++) {
			for(y = 0; y < unitValues[z].length; y++) {
				unitValues[z][y]=parseFloat(expandedCookie[x++]);
			}
		}
		for(y = 0; y < costSpawnRate.length; y++) {
			costSpawnRate[y]=parseFloat(expandedCookie[x++]);
			unitCosts[y]=parseFloat(expandedCookie[x++]);
			upgradePointsInitial[y]=parseFloat(expandedCookie[x++]);
		}
		for(z = 0; z < unitPointValues.length; z++) {
			for(y = 0; y < unitPointValues[z].length; y++) {
				unitPointValues[z][y]=parseFloat(expandedCookie[x++]);
			}
		}
		gold=parseFloat(expandedCookie[x++]);
		territory=parseFloat(expandedCookie[x++]);
		higheststageUnlocked=parseFloat(expandedCookie[x++]);
		currentTab=parseFloat(expandedCookie[x++]);
		for(y = 0; y < totalDead.length; y++) {
			totalDead[y]=parseFloat(expandedCookie[x++]);
		}
		curMana=parseFloat(expandedCookie[x++]);
		maxMana=parseFloat(expandedCookie[x++]);
		for(y = 0; y < spellCosts.length; y++) {
			spellCosts[y]=parseFloat(expandedCookie[x++]);
		}
		spellExp=parseFloat(expandedCookie[x++]);
		spellLevel=parseFloat(expandedCookie[x++]);
		expNeededToLevel=parseFloat(expandedCookie[x++]);
		manaGain=parseFloat(expandedCookie[x++]);
		for(l = 0; l < maps.length; l++) {
			mapTimers[l]=parseFloat(expandedCookie[x++]);
		}
    }
	startANewstage()
	updateTerritoryVisual()
	updateGoldVisual()
	//updateProgressVisual()
	updateWallHealthVisuals()
	updatePlaceVisuals()
	changeUnitScreen("clear")
	createMapSpace()
	switchMainTab(currentTab)
	document.getElementById("mainColumn").style.display="inline-block";
}

function clearStorage() {
	startANewstage()
    localStorage.allVariables103="";
	loadFromStorage()
}

loadFromStorage()