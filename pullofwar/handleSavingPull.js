function loadDefaults() {
	units = [[],[],[],[],[],[]];


	currentManualLine = -1;
	spawnManualAmounts =[0,  2];
	initialSpawnAmounts=[1,  1];
	initialSpawnRateInitial=[9, 10];
	initialSpawnRate=   [9, 10];
	placeAmountsStart=[1,  1,  1,   1,   1,   1,    1];
	placeMaxTimers=   [0, 12, 35, 100, 295, 880, 2635];
	level = 1;
	unitValues =       [[1, 1, .6, 50, 0], [1, 3, .06, 150, 0], [7, 15, .4, 4, 0], [50, 20, .04, 30, 0]]
	unitValuesInitial =[[1, 1, .6, 50, 0], [], [7, 15, .4, 4, 0], []]
	costSpawnRate =        [20, 0, 800, 0];
	unitCosts =            [5, 0, 80, 0];
	upgradePointsAvailable=[0, 0,  0, 0];
	upgradePointsInitial=  [0, 0,  0, 0];
	unitPointValues=[[0, 0, 0, 0, 0],[],[0, 0, 0, 0, 0],[]]
	gold = 0;
	territory = 10;
	highestLevelUnlocked = 1;
}

function saveIntoStorage() {
    localStorage.allVariables101 = "";
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
	theCookie+=level+","
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
	theCookie+=highestLevelUnlocked
    localStorage.allVariables101 = theCookie;
}

function loadFromStorage() {
	document.getElementById("mainBox").style.display="inline-block";
	loadDefaults();
    if(localStorage.allVariables101) {
        expandedCookie = (','+localStorage.allVariables101).split(',');
        x = 1;
		/*currentManualLine = parseFloat(expandedCookie[x++]);
		for(x = 0; x < spawnManualAmounts.length; x++) {
			spawnManualAmounts[x]=parseFloat(expandedCookie[x++]);
			initialSpawnAmounts[x]=parseFloat(expandedCookie[x++]);
			initialSpawnRate[x]=parseFloat(expandedCookie[x++]);
		}
		
		for(x = 0; x < placeAmountsStart.length; x++) {
			placeAmountsStart[x]=parseFloat(expandedCookie[x++]);
			placeMaxTimers[x]=parseFloat(expandedCookie[x++]);
		}
		level=parseFloat(expandedCookie[x++]);
		for(x = 0; x < unitValues.length; x++) {
			for(y = 0; y < unitValues[x].length; y++) {
				unitValues[x][y]=parseFloat(expandedCookie[x++]);
			}
		}
		for(x = 0; x < costSpawnRate.length; x++) {
			costSpawnRate[x]=parseFloat(expandedCookie[x++]);
			unitCosts[x]=parseFloat(expandedCookie[x++]);
			upgradePointsAvailable[x]=parseFloat(expandedCookie[x++]);
			upgradePointsInitial[x]=parseFloat(expandedCookie[x++]);
		}
		for(x = 0; x < unitPointValues.length; x++) {
			for(y = 0; y < unitPointValues[x].length; y++) {
				unitPointValues[x][y]=parseFloat(expandedCookie[x++]);
			}
		}
		gold=parseFloat(expandedCookie[x++]);
		territory=parseFloat(expandedCookie[x++]);
		highestLevelUnlocked=parseFloat(expandedCookie[x++]);*/
    }
	startANewLevel()
	updateTerritoryVisual()
	updateGoldVisual()
	updateProgressVisual()
	updatePlaceVisuals()
	document.getElementById("mainColumn").style.display="inline-block";
}

function clearStorage() {
    localStorage.allVariables101="";
    loadDefaults();
}

loadFromStorage()