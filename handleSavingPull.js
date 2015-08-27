function loadDefaults() {
	units = [[],[],[],[],[],[]];


	currentManualLine = -1;
	spawnManualAmounts =[0,  2];
	initialSpawnAmounts=[1,  .3333333];
	initialSpawnRateInitial=[9, 10];
	initialSpawnRate=   [9, 10];
	placeAmountsStart=[0,  1,   1,   1,    1,    1,     1];
	placeMaxTimers=   [0,  6,  17,  50,   99,  197,   393];
	placeAmountCosts= [0, 25, 100, 500, 2000, 6000, 12000]
	stage = 1;
	unitValues =       [[1, 2, .6, 50, 0, 4.5], [0, 0, 0, 0, 0, 4.5], [7, 15, .4, 4, 0, 15], [0, 0, 0, 0, 0, 10]]
	unitValuesInitial =[[1, 2, .6, 50, 0], [], [7, 15, .4, 4, 0], []]
	costSpawnRate =        [20, 0, 800, 0];
	unitCosts =            [5, 0, 80, 0];
	upgradePointsAvailable=[0, 0,  0, 0];
	upgradePointsInitial=  [0, 0,  0, 0];
	unitPointValues=[[0, 0, 0, 0, 0],[],[0, 0, 0, 0, 0],[]]
	gold = 0;
	territory = 0;
	higheststageUnlocked = 1;
	stop=1
	buttonsToClick = 0; //tutorial thing
	currentTab = 0;
	globalSpawnRate = 1;
}

function saveIntoStorage() {
    localStorage.allVariables103 = "";
	theCookie = currentManualLine+",";
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
		theCookie+=upgradePointsAvailable[x]+","
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
	theCookie+=currentTab
    localStorage.allVariables103 = theCookie;
}

function loadFromStorage() {
	document.getElementById("mainBox").style.display="inline-block";
	loadDefaults();
    if(localStorage.allVariables103) {
        expandedCookie = (','+localStorage.allVariables103).split(',');
        x = 1;
		currentManualLine = parseFloat(expandedCookie[x++]);
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
			upgradePointsAvailable[y]=parseFloat(expandedCookie[x++]);
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
    }
	if(currentManualLine != -1) changeManualLane(currentManualLine)
	startANewstage()
	updateTerritoryVisual()
	updateGoldVisual()
	updateProgressVisual()
	updatePlaceVisuals()
	switchMainTab(currentTab)
	document.getElementById("mainColumn").style.display="inline-block";
}

function clearStorage() {
	showUnitsScreen()
	startANewstage()
    localStorage.allVariables103="";
	loadFromStorage()
}

loadFromStorage()