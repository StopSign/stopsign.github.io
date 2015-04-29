function newUnitDiv(unit) {
	commonBefore = "<div id='unit"+unit.id+"' class='unitContainer unitLine"+unit.line+"' style='z-index:"+(zIndex--)+"' onclick='clickAUnit("+unit.id+")'>" +
			"<div class='healthBarOuter'><div class='healthBarInner' id='healthBar"+unit.id+"' style='z-index:"+(zIndex--)+"'></div></div>";
	if(unit.direction === "right") {
		different = "<div id='body' class='"+unit.type+" unit' style=''> </div>" + 
			"<div id='unitWeapon' class='weapon'><div class='weapon"+unit.type+"'></div> </div>";
	}
	else {
		different = "<div id='unitWeapon' class='weapon'><div class='weapon"+unit.type+"'></div> </div>" +
			"<div id='body' class='"+unit.type+" unitLeft' style=''> </div>";
	}
	commonAfter = "<div id='count"+unit.id+"' class='count count"+unit.type+"'>"+unit.unitCount+"</div></div>";
	elem = document.createElement("div");
	elem.innerHTML = commonBefore + different + commonAfter;
	document.getElementById('fightTime').appendChild(elem)
}

function updateUnitPos(y, x) {
	if(units[y][x] == null)
	console.log(y+", "+x);
	if(document.getElementById("unit"+units[y][x].id) == null)
	console.log("sadf" +units[y][x].id);
	document.getElementById("unit"+units[y][x].id).style.left = (units[y][x].pos +7)*11.9 + "px"; 
}

function updateSpawnTimers() {
	document.getElementById("soldierSpawnTimer").innerHTML = round2(soldierSpawnRate);
	document.getElementById("spearSpawnTimer").innerHTML = round2(spearSpawnRate);
	document.getElementById("enemySpawnTimer").innerHTML = round2(enemySpawnRate);
	document.getElementById("manualSpawnTimer").innerHTML = round2(spawnRateManual);
	document.getElementById("enemyAutoSpawnAmount").innerHTML = spawnAmounts[0]
	document.getElementById("soldierManualSpawnAmount").innerHTML = spawnManualAmounts[0]
	document.getElementById("soldierAutoSpawnAmount").innerHTML = spawnAmounts[1]
	document.getElementById("spearManualSpawnAmount").innerHTML = spawnManualAmounts[1]
	document.getElementById("spearAutoSpawnAmount").innerHTML = spawnAmounts[2]
}

function updateGoldVisual() {
	document.getElementById("gold").innerHTML = gold;
}

function updateTerritoryVisual() {
	document.getElementById("territory").innerHTML = territory;
}
function updatePlaceVisuals() {
	document.getElementById("placeAmount0").innerHTML=placeAmounts[0];
	document.getElementById("placeTimer0").innerHTML=round3(placeAmounts[0] / territory*100) + "% of territory";
	document.getElementById("placeProgressInner0").style.width=round3(placeAmounts[0] / territory*100) + "%";
	for(x = 1; x < placeAmounts.length; x++) {
		document.getElementById("placeAmount"+x).innerHTML=placeAmounts[x];
		document.getElementById("placeTimer"+x).innerHTML=round1(placeCurTimers[x]);
		document.getElementById("placeProgressInner"+x).style.width= (1-placeCurTimers[x] / placeMaxTimers[x])*100+"%"
	}
}

function updateProgressVisual() {
	scoreNeededForLevel = level * 100
	toModify = unitsThroughOnRight
	if ( unitsThroughOnRight > scoreNeededForLevel) {
		toModify = 1
	}
	if ( unitsThroughOnRight < 0 ) {
		toModify = 0
	}
	document.getElementById("compete1").style.width = toModify / scoreNeededForLevel * 100 + "%";
	document.getElementById("compete2").style.width = (1-toModify / scoreNeededForLevel) * 100 + "%";
	document.getElementById("score").innerHTML = Math.ceil(unitsThroughOnRight / scoreNeededForLevel * 100)
}

function handleLineTimer() {
	document.getElementById("exitLineRight").style.backgroundColor = "red";
	document.getElementById("exitLineLeft").style.backgroundColor = "red";
	if(exitLineRightTimer) {
		exitLineRightTimer--
		document.getElementById("exitLineRight").style.backgroundColor = "yellow";
	}
	if(exitLineLeftTimer) {
		exitLineLeftTimer--
		document.getElementById("exitLineLeft").style.backgroundColor = "yellow";
	}
	if(increaseLevelError) {
		increaseLevelError--
		document.getElementById("increaseLevelError").style.display = "block";
	} else {
		document.getElementById("increaseLevelError").style.display = "none";
		}
}

function updateClickedUnitStatus(unit) {
	if(unit.type == "soldier") {
		
	}
	if(unit.type == "spear") {
		
	}
}

function drawSpearLine(unit1, unit2) {
	storedLines.push({x1:(unit1.pos+7)*11.9+22, y1:(unit1.line)*54+60, x2:(unit2.pos+7)*11.9+11, y2:(unit2.line)*54+60, curCount:4, count:4});
}

function redrawStoredLines(){

	ctx.clearRect(0,0,c.width,c.height);

	if(storedLines.length==0){ return; }

	// redraw each stored line
	for(var i=storedLines.length - 1;i>=0;i--){
		if(storedLines[i].curCount <= 0) {
			storedLines.splice(i, 1);
			continue;
		}
		storedLines[i].curCount--;
		ctx.beginPath();
		x3 = storedLines[i].x1+((storedLines[i].x2-storedLines[i].x1)/storedLines[i].count*(storedLines[i].count - storedLines[i].curCount)) - 4
		y3 = storedLines[i].y1+((storedLines[i].y2-storedLines[i].y1)/storedLines[i].count*(storedLines[i].count - storedLines[i].curCount)) 
		//console.log(storedLines[i].x1+", "+storedLines[i].y1+", "+storedLines[i].x2+", "+storedLines[i].y2+", " + storedLines[i].curCount+", "+x3+", "+y3)
		ctx.moveTo(x3,y3);
		ctx.lineTo(x3+8,y3);
		ctx.lineWidth = 3;
		ctx.stroke();
	}
}

var c = document.getElementById("damageLines");
var ctx = c.getContext("2d");