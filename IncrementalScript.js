
function loadDefaults() {
	maxStamina = 100;
	curStamina = 100;
	staminaRate=1;
	exhaustedStaminaRate=10; //.5
	isExhausted=false;
	resource1_1 = 0;
	resource1_2 = 0;
	isWalking = false;
	buycounts = [0, 0];
	costbuy = [0, 500];
	valuebuy = [0, 1];
	shown = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	handleNewOptions();
	updateResources();
}

function saveIntoStorage() {
    localStorage.allVariables = "";
    theCookie = maxStamina+","+curStamina+","+staminaRate+","+exhaustedStaminaRate+","+isExhausted+","+resource1_1+","+resource1_2+","+isWalking;
	for(index = 0; index < buycounts.length; index++) {
        theCookie += ","+buycounts[index]+","+costbuy[index]+","+valuebuy[index];
    }
	for(index = 0; index < shown.length; index++) {
        theCookie += ","+shown[index];
	}
    localStorage.allVariables = theCookie;
}

function loadFromStorage() {
	document.getElementById("mainBox").style.display="inline-block";
    if(localStorage.allVariables) {
        expandedCookie = (','+localStorage.allVariables).split(',');
        x = 1;
		maxStamina = parseFloat(expandedCookie[x++]);
		curStamina = parseFloat(expandedCookie[x++]);
		staminaRate = parseFloat(expandedCookie[x++]);
		exhaustedStaminaRate = parseFloat(expandedCookie[x++]);
		isExhausted = parseFloat(expandedCookie[x++]);
		resource1_1 = parseFloat(expandedCookie[x++]);
		resource1_2 = parseFloat(expandedCookie[x++]);
		isWalking = parseFloat(expandedCookie[x++]);
		for(index = 0; index < buycounts.length; index++) {
			buycounts[index]=parseFloat(expandedCookie[x++]);
			costbuy[index]=parseFloat(expandedCookie[x++]);
			valuebuy[index]=parseFloat(expandedCookie[x++]);
        }
		for(index = 0; index < shown.length; index++) {
			shown[index]=parseFloat(expandedCookie[x++]);
		}
		updateResources();
		handleNewOptions();
    }
	else {
		loadDefaults();
	}
    saveIntoStorage();
}
loadDefaults();
loadFromStorage();

function clearStorage() {
    localStorage.allVariables="";
    loadDefaults();
}

function startWalking() {
	isWalking = true;
	showingGif = false;
	document.getElementById("clickMeWalk").style.display="none";
	document.getElementById("walkGif").style.display="inline-block";
	document.getElementById("clickGif").style.display="none";
	document.getElementById("clickMe").style.display="inline-block";
}

clicks = 0;
showingGif = false;
function startTheClickSpree() {
    clicks++;
	if(!showingGif && !isExhausted) {
		document.getElementById("clickMe").style.display="none";
		document.getElementById("clickGif").style.display="inline-block";
		document.getElementById("walkGif").style.display="none";
		document.getElementById("clickMeWalk").style.display="inline-block";
		isWalking = false;
		showingGif = true;
	}
	curTicks = ticksTotal;
}

function clickTheClickable() {
	curStamina-=10;
	resource1_1+=resource1_2;
	if(curStamina < 0) {
		isExhausted = true;
		document.getElementById("clickGif").style.display="none";
		document.getElementById("clickMe").style.display="inline-block";
		showingGif = false;
		resource1_2++;
		handleNewOptions()
	}
	updateResources()
}

//setInterval(function() {
//	tick();
//},50);

 //uncomment this before checkin
var doWork = new Worker('interval.js');
doWork.onmessage = function(event) {
    if ( event.data === 'interval.start' ) {
		tick();
    }
};
doWork.postMessage({start:true,ms:50});


ticksTotal = 0;
timer = 0;
function tick() {
	timer++;
	ticksTotal++;
	if(timer === 10) {
		halfSecond()
	}
	if(timer >= 20) {
		halfSecond()
		second()
		timer = 0;
	}
	handleStaminaBar()
	
}

function halfSecond() {

}

totalSeconds = 0;
function second() {
	totalSeconds++;
	handleClicksPerSecond();
	if(isWalking && totalSeconds % 2 === 0) {
		resource1_1+=resource1_2;
	}
	updateResources()
	handleNewOptions()
	saveIntoStorage()
}

function handleStaminaBar() {
	innerStamina = document.getElementById('innerStamina');
	if(isExhausted) {
		innerStamina.style.background="linear-gradient(#FD4848, #FAE4E4)";
		curStamina+=exhaustedStaminaRate*valuebuy[1]; //staminaMult
	}
	else {
		innerStamina.style.background="linear-gradient(#FFCC33, #F2E2B2)";
		curStamina+=staminaRate;
	}
	
	if(curStamina > maxStamina) {
		isExhausted = false;
		curStamina = maxStamina;
	}
	
	if(curStamina <= 0) {
		curStamina = 0;
		innerStamina.style.height=0;
	}
	else {
		innerStamina.style.height= (curStamina / maxStamina * 97) + "%";
	}
}


function handleClicksPerSecond() {
	cpsDiv = document.getElementById("CPS");
	cpsDiv.innerHTML = clicks;
	if(clicks > 20) {
		cpsDiv.style.color="red";
		cpsDiv.innerHTML = cpsDiv.innerHTML + " autoclicking jerk";
	}
	else {
		cpsDiv.style.color="initial";
	}
	clicks = 0;
}

function switchTopMiddleTabs(tabId) {
    id = tabId.substring(12);
    if(id == 0) {
        document.getElementById("topMiddleTab0").style.color="#ff0003";
        document.getElementById("topMiddleTab1").style.color="#009CB9";
        document.getElementById("displayDiv").style.display="inline-block";
        document.getElementById("optionsDiv").style.display="none";
    }
    else if(id == 1) {
        document.getElementById("topMiddleTab0").style.color="#009CB9";
        document.getElementById("topMiddleTab1").style.color="#ff0003";
        document.getElementById("optionsDiv").style.display="inline-block";
        document.getElementById("displayDiv").style.display="none";
    }
}

function round3(num) {
    return (Math.floor(num * 1000) / 1000).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function handleNewOptions() {
	if(resource1_2 >= 2) {
		document.getElementById("walkDiv").style.display="inline-block";
	}
	else {
		document.getElementById("walkDiv").style.display="none";
	}
	if(resource1_1 >= 500 || shown[0]) {
		shown[0] = true;
		document.getElementById("buyOptions1").style.display="inline-block";
		updateButtons()
	}
	else {
		document.getElementById("buyOptions1").style.display="none";
	}
	if(resource1_1 >= 1500 || shown[1]) {
		shown[1] = true;
		document.getElementById("buyOptions1").style.display="inline-block";
		updateButtons()
	}
	else {
		document.getElementById("buyOptions1").style.display="none";
	}
}

function updateResources() {
	document.getElementById("resource1_1").innerHTML=Math.floor(resource1_1);
	document.getElementById("resource1_2").innerHTML=Math.floor(resource1_2);
}

function updateButtons() {
	for(index = 1; index < buycounts.length; index++) {
		document.getElementById("buycounts1").innerHTML = buycounts[index]
		document.getElementById("costbuy1").innerHTML = round3(costbuy[index])
		document.getElementById("valuebuy1").innerHTML = round3(valuebuy[index])
	}
}

function buy(divId) {
    id = parseInt(divId.substring(3));
	if(resource1_1 >= costbuy[id]) {
		buycounts[id]++;
		resource1_1 -= costbuy[id]
		incrementButtonCount(id)
	}
	updateButtons()
}

function incrementButtonCount(id) {
	if(id == 1) {
		costbuy[id] *= 10;
		valuebuy[id] *= 1.1;
	}
}