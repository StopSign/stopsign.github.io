function loadDefaults() {
	curStamina = 100;
	staminaRate=5;
	exhaustedStaminaRate=.2; //.2
	isExhausted=0; //bool
	resource1_1 = 0;
	resource1_2 = 0;
	isWalking = 0; //bool
	buycounts = [0,   0,    0,     0,     0,       0,       0, 0, 0, 0, 0, 0]; //always all 0s by default
	costbuy =   [0, 500, 1500, 15000, 15000, 1000000, 1000000, 0, 0, 0, 0, 0];
	valuebuy =  [0,   1,  100,     1,     1,       1,       1, 0, 0, 0, 0, 0];
	shown = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; //always all 0s by default
	upgradeCounts = [0,    0,     0,       0,       0,        0, 0, 0, 0, 0, 0, 0];
	costUpgrade =   [0, 2000, 25000, 2000000, 5000000, 15000000, 0, 0, 0, 0, 0, 0];
	showingGif = 0; //false
	toResume = 0;
	resource2_2 = 1;
	resource2_3 = 1;
	curDist = 0;
	maxDist = 40;
	firstVarForDist = 10;
	totalGains = 0;
	sleepRate = 1;
	sleepMax = 2;
	handleNewOptions();
	updateResources();
}

function saveIntoStorage() {
    localStorage.allVariables2 = "";
    theCookie = curStamina+","+staminaRate+","+exhaustedStaminaRate+","+isExhausted+","+resource1_1+","+resource1_2+","+isWalking;
	for(index = 0; index < buycounts.length; index++) {
        theCookie += ","+buycounts[index]+","+costbuy[index]+","+valuebuy[index];
    }
	for(index = 0; index < upgradeCounts.length; index++) {
        theCookie += ","+upgradeCounts[index]+","+costUpgrade[index];
	}
	for(index = 0; index < shown.length; index++) {
        theCookie += ","+shown[index];
	}
	theCookie += ","+showingGif;
	theCookie += ","+toResume+","+resource2_2+","+resource2_3+","+curDist+","+maxDist+","+firstVarForDist+","+totalGains+","+sleepRate
					+","+sleepMax;
    localStorage.allVariables2 = theCookie;
}

function loadFromStorage() {
	document.getElementById("mainBox").style.display="inline-block";
    if(localStorage.allVariables2) {
        expandedCookie = (','+localStorage.allVariables2).split(',');
        x = 1;
		curStamina = parseFloat(expandedCookie[x++]);
		staminaRate = parseFloat(expandedCookie[x++]);
		exhaustedStaminaRate = parseFloat(expandedCookie[x++]);
		isExhausted = parseFloat(expandedCookie[x++]);
		resource1_1 = parseFloat(expandedCookie[x++]);
		resource1_2 = parseFloat(expandedCookie[x++]);
		parseFloat(expandedCookie[x++]);
		isWalking = 0;
		for(index = 0; index < buycounts.length; index++) {
			buycounts[index]=parseFloat(expandedCookie[x++]);
			costbuy[index]=parseFloat(expandedCookie[x++]);
			valuebuy[index]=parseFloat(expandedCookie[x++]);
        }
		for(index = 0; index < upgradeCounts.length; index++) {
			upgradeCounts[index]=parseFloat(expandedCookie[x++]);
			costUpgrade[index]=parseFloat(expandedCookie[x++]);
        }
		for(index = 0; index < shown.length; index++) {
			shown[index]=parseFloat(expandedCookie[x++]);
		}
		showingGif=parseFloat(expandedCookie[x++]);
		toResume=parseFloat(expandedCookie[x++]);
		resource2_2=parseFloat(expandedCookie[x++]);
		resource2_3=parseFloat(expandedCookie[x++]);
		curDist=parseFloat(expandedCookie[x++]);
		maxDist=parseFloat(expandedCookie[x++]);
		firstVarForDist=parseFloat(expandedCookie[x++]);
		totalGains=parseFloat(expandedCookie[x++]);
		sleepRate=parseFloat(expandedCookie[x++]);
		sleepMax=parseFloat(expandedCookie[x++]);
		updateResources();
		handleNewOptions();
		updateStaminaSpenderVisuals();
		updatePassiveVisuals()
		updateSleepVisuals()
    }
	else {
		loadDefaults();
	}
    saveIntoStorage();
}

function clearStorage() {
    localStorage.allVariables2="";
    loadDefaults();
}