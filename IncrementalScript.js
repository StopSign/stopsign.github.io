

setInterval(function() {
	tick();
},50);

//uncomment this before checkin
/*var doWork = new Worker('interval.js');
doWork.onmessage = function(event) {
    if ( event.data === 'interval.start' ) {
		tick();
    }
};
doWork.postMessage({start:true,ms:50});*/

loadDefaults();
loadFromStorage();

function startWalking(divId) {
    id = parseInt(divId.substring(11));
	if(!toResume)
		toResume = showingGif;
	isWalking = id; //true
	showingGif = 0; //false
	updateStaminaSpenderVisuals()
	updatePassiveVisuals()
}

clicks = 0;
function startTheClickSpree(divId) {
    id = parseInt(divId.substring(7));
    clicks++;
	if(!showingGif && !isExhausted) {
		isWalking = 0; //false
		showingGif = id; //1 - exert, 2 - powerlift
		updatePassiveVisuals()
		updateStaminaSpenderVisuals()
	}
	curTicks = ticksTotal;
}



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
	handleDistGain()
}

function halfSecond() {
if(showingGif === 1)
	handleExertYourself()
if(showingGif === 2)
	handlePowerLift()
if(showingGif === 3)
	handleWalkWithPurpose()
if(showingGif === 4)
	handleRun()
}

totalSeconds = 0;
function second() {
	totalSeconds++;
	//handleClicksPerSecond();
	if(isWalking === 1 && totalSeconds % 2 === 0) {
		resource1_1+=resource1_2;
	}
	if(isWalking === 2 && totalSeconds % 2 === 0) {
		resource2_2+=resource2_3;
	}
	updateResources()
	handleNewOptions()
	saveIntoStorage()
}

function handleExertYourself() {
	curStamina-=staminaRate;
	resource1_1+=resource1_2*(valuebuy[4])*sleepRate*(staminaBuff/100);
	if(curStamina < 0) {
		resource1_2++;
	}
	updateSecondsToGo()
	commonStaminaUse();
}

function handlePowerLift() {
	curStamina-=valuebuy[2]/10;
	resource1_1+=resource1_2;
	if(curStamina < 0) {
		resource1_2+=valuebuy[3];
	}
	commonStaminaUse();
}

function handleWalkWithPurpose() {
	curStamina-=staminaRate;
	resource2_2+=resource2_3*valuebuy[6]*(staminaBuff/100);
	console.log(staminaBuff+"asdf");
	if(curStamina < 0) {
		resource2_3++;
	}
	updateSecondsToGo()
	commonStaminaUse();
}

function handleRun() {
	curStamina-=valuebuy[2]/10;
	resource2_2+=resource2_3;
	if(curStamina < 0) {
		resource2_3+=valuebuy[5];
	}
	commonStaminaUse();
}

function commonStaminaUse() {
	if(curStamina < 0) {
		isExhausted = 1; //true
		document.getElementById("clickGif"+showingGif).style.display="none";
		showingGif = 0; //false
		toResume = 0;
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

function handleDistGain() {
	
	innerDist = document.getElementById('innerDistance');
	if(upgradeCounts[2])
		curDist+=resource2_2*sleepRate;
	if(curDist >= maxDist) {
		totalGains++;
		curDist = 0;
		innerDist.style.width=0;
		document.getElementById("distanceCur").innerHTML = round(curDist);
		reducePrices()
		updateButtons()
		/**********************************************************************************/
		/*						dist formula											  */
		/**********************************************************************************/
		maxDist += 20;
		if(maxDist > 500)
		{
			maxDist += firstVarForDist;
			firstVarForDist *= 1.07;
		}
	}
	else {
		innerDist.style.width= (curDist / maxDist * 98) + "%";
		document.getElementById("distanceCur").innerHTML = round(curDist);
		document.getElementById("distanceMax").innerHTML = round(maxDist);
	}
}

function updateSecondsToGo() {
	temp = round3(curStamina / staminaRate / 2)
	document.getElementById("secondsToGo").innerHTML = temp <= 0 ? 0 : temp;
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
	document.getElementById("resource2_3").innerHTML=round(resource2_3);
	document.getElementById("resource2_2").innerHTML=round(resource2_2);
}

function updateButtons() {
	for(index = 1; index < buycounts.length; index++) {
		if(document.getElementById("buycounts"+index) != null) {
			document.getElementById("buycounts"+index).innerHTML = buycounts[index]
			document.getElementById("costbuy"+index).innerHTML = round(Math.ceil(costbuy[index]))
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
    $("#staminaClick3").hover(function(){
		$("#clickMe3").show();
		hideAllStaminaClicks();
    });
    $("#staminaClick4").hover(function(){
		$("#clickMe4").show();
		hideAllStaminaClicks();
    });
    $("#clickMe1").mouseout(function(){
		updateStaminaSpenderVisuals()
    });
    $("#clickMe2").mouseout(function(){
		updateStaminaSpenderVisuals()
    });
    $("#clickMe3").mouseout(function(){
		updateStaminaSpenderVisuals()
    });
    $("#clickMe4").mouseout(function(){
		updateStaminaSpenderVisuals()
    });
	
    $("#walkClick1").hover(function(){
		$("#clickMeWalk1").show();
		$("#walkClick1").hide();
		$("#walkClick2").hide();
    });
    $("#walkClick2").hover(function(){
		$("#clickMeWalk2").show();
		$("#walkClick1").hide();
		$("#walkClick2").hide();
    });
    $("#clickMeWalk1").mouseout(function(){
		updatePassiveVisuals()
    });
    $("#clickMeWalk2").mouseout(function(){
		updatePassiveVisuals()
    });
	
});

function hideAllStaminaClicks() {
	for(index = 1; index < 5; index++) {
		toHide = document.getElementById("staminaClick"+index);
		if(toHide != null)
			toHide.style.display = "none";
	}
}

function staRateChange(change) {
	staminaRate += change
	if(staminaRate <= 5)
		staminaRate = 5;
	updateStaminaMult()

}

function updateStaminaMult() {
	document.getElementById("staminaRate").innerHTML = staminaRate;
	staminaBuff = 100;
	for(x = 0; x < (staminaRate/5-1); x++) {
		staminaBuff += 20*Math.pow(.99, x)+5
	}
	console.log(staminaBuff);
	document.getElementById("staminaBuff").innerHTML = round(staminaBuff)
}

function updateStaminaSpenderVisuals() {
	if(showingGif) {
		document.getElementById("clickGif"+showingGif).style.display = "inline-block";
		document.getElementById("staminaClick"+showingGif).style.display = "none";
		document.getElementById("clickMe"+showingGif).style.display = "none";
	}
	else if(upgradeCounts[3]) { //unlocked all 4
		for(x = 1; x < 5; x++) {
			document.getElementById("clickMe"+x).style.display="none";
			document.getElementById("clickGif"+x).style.display="none";
			if(toResume) {
				document.getElementById("staminaClick"+x).style.display="none";
			}
			else {
				document.getElementById("staminaClick"+x).style.display="inline-block";
			}
		}
		if(toResume) {
			theId = "#clickMe"+toResume;
			$(theId).show();
		}
		document.getElementById("staminaClick1").style.height="62px";
		document.getElementById("staminaClick2").style.height="62px";
	}
	else if(upgradeCounts[1]) { //unlocked power lifting
		for(x = 1; x < 3; x++) {
			document.getElementById("clickMe"+x).style.display="none";
			document.getElementById("clickGif"+x).style.display="none";
			if(toResume) {
				document.getElementById("staminaClick"+x).style.display="none";
			}
			else {
				document.getElementById("staminaClick"+x).style.display="inline-block";
			}
		}
		if(toResume) {
			theId = "#clickMe"+toResume;
			$(theId).show();
		}
		document.getElementById("staminaClick1").style.height="135px";
		document.getElementById("staminaClick2").style.height="135px";
	}
	else {
		$("#clickMe1").show();
		$("#clickGif1").hide();
		$("#clickGif2").hide();
	}
}

function updatePassiveVisuals() {
	if(isWalking) {
		document.getElementById("walkGif"+isWalking).style.display = "inline-block";
		document.getElementById("walkClick"+isWalking).style.display = "none";
		document.getElementById("clickMeWalk"+isWalking).style.display = "none";
	}
	else if(upgradeCounts[2]) { //unlocked stroll
		for(x = 1; x < 3; x++) {
			document.getElementById("walkGif"+x).style.display="none";
			document.getElementById("clickMeWalk"+x).style.display="none";
			document.getElementById("walkClick"+x).style.display="inline-block";
		}
	}
	else {
		$("#clickMeWalk1").show();
		$("#walkGif1").hide();
		$("#walkGif2").hide();
	}
}

function reducePrices() {
	for(index = 1; index < costbuy.length; index++) {
		if(document.getElementById("costbuy"+index) != null) {
			costbuy[index] *= .97;
		}
	}
}

function upgrade(divId) {
    id = parseInt(divId.substring(7));
	if(resource1_1 >= costUpgrade[id]) {
		upgradeCounts[id]++;
		resource1_1 -= costUpgrade[id]
		updateStaminaSpenderVisuals() //handles 1,3
		updatePassiveVisuals() //handles 2
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
		costbuy[id] *= 3;
		if(valuebuy[id] > 2)
			valuebuy[id]*=1.05;
		else
			valuebuy[id] *= 1.1;
	}
	if(id == 2) { //stamina max
		costbuy[id] *= 3;
		valuebuy[id] *= 1.2;
	}
	if(id == 3) { //power lifting
		costbuy[id] *= 3;
		valuebuy[id] += 1;
	}
	if(id == 4) { //exert yourself
		costbuy[id] *= 3;
		valuebuy[id] += 1;
	}
	if(id == 5) { //Run
		costbuy[id] *= 4;
		valuebuy[id] += 1;
	}
	if(id == 6) { //stroll 
		costbuy[id] *= 4;
		valuebuy[id] += 1;
	}
}