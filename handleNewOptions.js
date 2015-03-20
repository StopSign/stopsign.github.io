
function handleNewOptions() {
	if(resource1_2 >= 2) {
		document.getElementById("walkDiv").style.display="inline-block";
	}
	else {
		document.getElementById("walkDiv").style.display="none";
	}
	if(resource1_1 >= 300 || shown[0]) {
		shown[0] = 1; //true
		document.getElementById("buyOptions1").style.display="inline-block";
		updateButtons()
	}
	else {
		$("#buyOptions1").hide();
	}
	if((resource1_1 >= 300&&buycounts[1]>0) || shown[1]) {
		shown[1] = 1; //true
		if(!upgradeCounts[1])
			document.getElementById("buyupgrade1").style.display="inline-block";
		document.getElementById("buyOptions2").style.display="inline-block";
		updateButtons()
	}
	else {
		$("#buyupgrade1").hide();
		$("#buyOptions2").hide();
	}
	if(upgradeCounts[1]) { //unlocked power lifting
		$("#buyOptions3").show();
		$("#buyOptions4").show();
		if(!upgradeCounts[2])
			$("#buyupgrade2").show();
	}
	else {
		$("#buyOptions3").hide();
		$("#buyOptions4").hide();
		$("#buyupgrade2").hide();
	}
	if(upgradeCounts[2]) { //unlock journey & stroll
		if(!upgradeCounts[3])
			$("#buyupgrade3").show();
		$("#DistanceArea").show();
		$("#distanceRes").show();
	}
	else {
		$("#buyupgrade3").hide();
		$("#DistanceArea").hide();
		$("#distanceRes").hide();
	}
	if(upgradeCounts[3]) { //unlock walk with purpose and run
		$("#buyOptions5").show();
		$("#buyOptions6").show();
		if(!upgradeCounts[4])
			$("#buyupgrade4").show();
	}
	else {
		$("#buyOptions5").hide();
		$("#buyOptions6").hide();
		$("#buyupgrade4").hide();
	}
	if(upgradeCounts[4]) {
		$("#sleepBar").show()
		$("#waterBottleDiv").show()
		if(!upgradeCounts[5])
			$("#buyupgrade5").show();
	}
	else {
		$("#sleepBar").hide()
		$("#waterBottleDiv").hide()
		$("#buyupgrade5").hide()
	}
	if(upgradeCounts[5]) {
		$("#levelContainer").show()
		for(x = 6; x < 14; x++) {
			if(!upgradeCounts[x]) {
				//document.getElementById("buyupgrade"+x).style.display="inline-block";
			}
		}
	}
	else {
		$("#levelContainer").hide()
		for(x = 6; x < 14; x++) {
			if(upgradeCounts[x])
				document.getElementById("buyupgrade"+x).style.display="none";
		}
	}
	if(upgradeCounts[13]) {
		if(!upgradeCounts[14])
			$("#buyupgrade14").show();
	}
	else {
			$("#buyupgrade14").hide();
	}
	if(upgradeCounts[14]) {
		if(!upgradeCounts[15])
			$("#buyupgrade15").show();
	}
	else {
			$("#buyupgrade15").hide();
	}
	if(upgradeCounts[15]) {
		if(!upgradeCounts[16])
			$("#buyupgrade16").show();
	}
	else {
			$("#buyupgrade16").hide();
	}
	
	
	if(buycounts[2] > 5 && (showingGif === 1 || showingGif === 3)) {
		document.getElementById("staminaMultOptions").style.display="inline-block"
	}
	else {
		document.getElementById("staminaMultOptions").style.display="none";
	}
}