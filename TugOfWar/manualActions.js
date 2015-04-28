function changeManualLane(div) {
	if(!div)
		return
	id = div.id.substring(10);
	name = '#clickSpace' + currentManualLine
	if($(name).find('div').first()) {
		$(name).find('div').first().remove();
	}
	currentManualLine = parseInt(id);
	document.getElementById('clickSpace' + currentManualLine).innerHTML = "<div style='width: 97%;height: 97%;border-radius: 50%;border-top: 0px solid transparent;border-bottom: 0px solid transparent;border-left: 56px solid rgba(168, 37, 168, 0.73);border-right: 0px solid green;'></div>"
}

function showLeftArrow() {
	document.getElementById("leftArrow").style.display="inline-block"
}

function hideLeftArrow() {
	document.getElementById("leftArrow").style.display="none"

}
function showRightArrow() {
	document.getElementById("rightArrow").style.display="inline-block"
	
}

function hideRightArrow() {
	document.getElementById("rightArrow").style.display="none"

}

function increaseLevel() {
	if(highestLevelUnlocked != level) {
		level++
		unitsThroughOnRight = 0;
		unitsThroughOnLeft = 0;
		document.getElementById("level").innerHTML=level;
		startANewLevel();
	}
}

function decreaseLevel() {
	level--;
	if(level <=0) {
		level = 1;
	}
	else {
		document.getElementById("level").innerHTML=level;
		startANewLevel();
	}
}

function startANewLevel() {
	for(y = 0; y < units.length; y++) {
		for(x = units[y].length-1; x>=0; x--) {
			removeUnit(units[y][x], false);
		}
	}
	unitsThroughOnRight = 0;
	unitsThroughOnLeft = 0;
	units = [[],[],[],[],[],[]];
	linesEnabled = 6;
	soldierSpawnRate = 4;
	spearSpawnRate = .5;
	spawnRateManual = 0;
	name = "#clickSpace"+currentManualLine
	if($(name).find('div').first()) {
		$(name).find('div').first().remove();
	}
	currentManualLine = -1;
	spawnManualAmounts = [0, 2];
	spawnAmounts = [1, 3, 1] //first is enemy
	enemySpawnRate = 9;
	curBattles = [];
	storedLines = [];
	timer = 0;
	stop = 0;
	totalTicks = 0
	document.getElementById("level").innerHTML=level;
	document.getElementById("territoryGain").innerHTML = level * 10;
	updateProgressVisual()
	spawnAmounts[0] = level;
	for(j = 0; j < linesEnabled; j++) {
		addUnit("soldier", j, "left", spawnAmounts[0]);
	}
	for(j = 0; j < placeCurTimers.length; j++) {
		placeCurTimers[j]=placeMaxTimers[j]
		placeAmounts[j]=placeAmountsStart[j]
	}
}