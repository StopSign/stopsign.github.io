
function loadDefaults() {
	curStamina = 100;
	staminaRate=1;
	exhaustedStaminaRate=.2; //.2
	isExhausted=0; //bool
	resource1_1 = 0;
	resource1_2 = 0;
	isWalking = 0; //bool
	buycounts = [0,   0,    0,     0,     0,      0,      0, 0, 0, 0, 0, 0]; //always all 0s by default
	costbuy =   [0, 500, 1500, 15000, 15000, 100000, 100000, 0, 0, 0, 0, 0];
	valuebuy =  [0,   1,  100,     1,     1,      1,      1, 0, 0, 0, 0, 0];
	upgradeCounts = [0,    0,     0,      0,      0, 0, 0, 0, 0, 0, 0, 0];
	costUpgrade =   [0, 2000, 25000, 100000, 300000, 0, 0, 0, 0, 0, 0, 0];
	shown = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; //always all 0s by default
	handleNewOptions();
	updateResources();
	showingGif = 0; //false
}

function saveIntoStorage() {
    localStorage.allVariables1 = "";
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
    localStorage.allVariables1 = theCookie;
}

function loadFromStorage() {
	document.getElementById("mainBox").style.display="inline-block";
    if(localStorage.allVariables1) {
		showingGif = 0; //false
        expandedCookie = (','+localStorage.allVariables1).split(',');
        x = 1;
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
		for(index = 0; index < upgradeCounts.length; index++) {
			upgradeCounts[index]=parseFloat(expandedCookie[x++]);
			costUpgrade[index]=parseFloat(expandedCookie[x++]);
        }
		for(index = 0; index < shown.length; index++) {
			shown[index]=parseFloat(expandedCookie[x++]);
		}
		updateResources();
		handleNewOptions();
		updateStaminaSpenderVisuals();
    }
	else {
		loadDefaults();
	}
    saveIntoStorage();
}
loadDefaults();
loadFromStorage();

function clearStorage() {
    localStorage.allVariables1="";
    loadDefaults();
}

function startWalking() {
	isWalking = 1; //true
	showingGif = 0; //false
	document.getElementById("clickMeWalk").style.display="none";
	document.getElementById("walkGif").style.display="inline-block";
	updateStaminaSpenderVisuals()
}

clicks = 0;
function startTheClickSpree(divId) {
    id = parseInt(divId.substring(7));
    clicks++;
	if(!showingGif && !isExhausted) {
		document.getElementById("walkGif").style.display="none";
		document.getElementById("clickMeWalk").style.display="inline-block";
		isWalking = 0; //false
		showingGif = id; //1 - exert, 2 - powerlift
		updateStaminaSpenderVisuals()
	}
	curTicks = ticksTotal;
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
if(showingGif === 1)
	handleExertYourself()
if(showingGif === 2)
	handlePowerLift()
}

totalSeconds = 0;
function second() {
	totalSeconds++;
	//handleClicksPerSecond();
	if(isWalking && totalSeconds % 2 === 0) {
		resource1_1+=resource1_2;
	}
	updateResources()
	handleNewOptions()
	saveIntoStorage()
}

function handleExertYourself() {
	curStamina-=5;
	resource1_1+=resource1_2*(valuebuy[4]);
	if(curStamina < 0) {
		resource1_2++;
	}
	commonStaminaUse();
}

function handlePowerLift() {
	curStamina-=valuebuy[2]/20;
	resource1_1+=resource1_2;
	if(curStamina < 0) {
		resource1_2+=valuebuy[3];
	}
	commonStaminaUse();
}

function commonStaminaUse() {
	if(curStamina < 0) {
		isExhausted = 1; //true
		document.getElementById("clickGif"+showingGif).style.display="none";
		showingGif = 0; //false
		handleNewOptions()
		updateStaminaSpenderVisuals()
	}
	updateResources()
}

function handleStaminaBar() {
	innerStamina = document.getElementById('innerStamina');
	if(isExhausted) {
		innerStamina.style.background="linear-gradient(#FD4848, #FAE4E4)";
		if(resource1_2 <= 1) {
			curStamina+=5; //staminaMult
		}
		else
			curStamina+=(valuebuy[2]/100)*exhaustedStaminaRate*valuebuy[1]; //staminaMult
	}
	else {
		innerStamina.style.background="linear-gradient(#FFCC33, #F2E2B2)";
		if(!showingGif)
			curStamina += staminaRate;
	}
	if(curStamina > valuebuy[2]) {
		isExhausted = 0; //false
		curStamina = valuebuy[2];
	}
	
	if(curStamina <= 0) {
		curStamina = 0;
		innerStamina.style.height=0;
		document.getElementById("staminaCur").innerHTML = round(curStamina);
	}
	else {
		innerStamina.style.height= (curStamina / valuebuy[2] * 97) + "%";
		document.getElementById("staminaCur").innerHTML = round(curStamina);
		document.getElementById("staminaMax").innerHTML = round(valuebuy[2]);
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

function round(num) {
    return Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function updateResources() {
	document.getElementById("resource1_1").innerHTML=round(resource1_1);
	document.getElementById("resource1_2").innerHTML=round(resource1_2);
}

function updateButtons() {
	for(index = 1; index < buycounts.length; index++) {
		if(document.getElementById("buycounts"+index) != null) {
			document.getElementById("buycounts"+index).innerHTML = buycounts[index]
			document.getElementById("costbuy"+index).innerHTML = round3(costbuy[index])
			document.getElementById("valuebuy"+index).innerHTML = round3(valuebuy[index])
		}
	}
	for(index = 1; index < upgradeCounts.length; index++) {
		if(document.getElementById("buyupgrade"+index) != null) {
			if(upgradeCounts[index])
				document.getElementById("buyupgrade"+index).style.display="none";
			else {
				document.getElementById("costupgrade"+index).innerHTML = round3(costUpgrade[index])
			}
		}
	}
}

$(document).ready(function(){
    $("#staminaClick1").hover(function(){
		$("#clickMe1").show();
		hideAllStaminaClicks();
    });
    $("#staminaClick2").hover(function(){
		$("#clickMe2").show();
		hideAllStaminaClicks();
    });
    $("#clickMe1").mouseout(function(){
		updateStaminaSpenderVisuals()
    });
    $("#clickMe2").mouseout(function(){
		updateStaminaSpenderVisuals()
    });
});

function hideAllStaminaClicks() {
	for(index = 1; index < 5; index++) {
		toHide = document.getElementById("staminaClick"+index);
		if(toHide != null)
			toHide.style.display = "none";
	}
}

function updateStaminaSpenderVisuals() {
	if(showingGif) {
		temp = "#clickGif"+showingGif;
		$(temp).show();
		temp = "#staminaClick"+showingGif;
		$(temp).hide()
		temp = "#clickMe"+showingGif;
		$(temp).hide()
	}
	else if(upgradeCounts[1]) { //unlocked power lifting
		$("#staminaClick1").show()
		$("#staminaClick2").show()
		$("#clickMe1").hide()
		$("#clickMe2").hide();
		$("#clickGif1").hide();
		$("#clickGif2").hide();
	}
	else {
		$("#clickMe1").show();
		$("#clickGif1").hide();
		$("#clickGif2").hide();
	}
}

function updateJourneyVisuals() {

}

function upgrade(divId) {
    id = parseInt(divId.substring(7));
	if(resource1_1 >= costUpgrade[id]) {
		upgradeCounts[id]++;
		resource1_1 -= costUpgrade[id]
		updateStaminaSpenderVisuals() //handles 1,3 upgrades
		updateJourneyVisuals() //handles 2
	}
	updateButtons()
	updateResources()
}

function buy(divId) {
    id = parseInt(divId.substring(3));
	if(resource1_1 >= costbuy[id]) {
		buycounts[id]++;
		resource1_1 -= costbuy[id]
		incrementButtonCount(id)
	}
	updateButtons()
	updateResources()
}

function incrementButtonCount(id) {
	if(id == 1) { //stamina rate
		costbuy[id] *= 4;
		valuebuy[id] *= 1.1;
	}
	if(id == 2) { //stamina max
		costbuy[id] *= 4;
		valuebuy[id] *= 1.2;
	}
	if(id == 3) { //power lifting
		costbuy[id] *= 5;
		valuebuy[id] += 1;
	}
	if(id == 4) { //exert yourself
		costbuy[id] *= 5;
		valuebuy[id] += 100;
	}
	if(id == 5) { //Run
		costbuy[id] *= 10;
		valuebuy[id] += 1;
	}
	if(id == 6) { //stroll somewhere
		costbuy[id] *= 10;
		valuebuy[id] += 100;
	}
}