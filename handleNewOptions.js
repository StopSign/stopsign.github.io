
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
	if(upgradeCounts[2]) { //unlock journey upgrades
		if(!upgradeCounts[3])
			$("#buyupgrade3").show();
	}
	else {
		$("#buyupgrade3").hide();

	}
	if(upgradeCounts[3]) { //unlock walk with purpose and run
		$("#buyOptions5").show();
		$("#buyOptions6").show();
	}
	else {
		$("#buyOptions5").hide();
		$("#buyOptions6").hide();
	
	}
}