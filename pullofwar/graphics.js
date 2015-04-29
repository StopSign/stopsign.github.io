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

function showUnitsScreen() {
	clickAUnit("-1")
	document.getElementById("defaultScreen").style.display="block"
	document.getElementById("unitScreen").innerHTML = ""
	
}

function changeUnitScreen(unit) {
	type = "error"
	direction ="error"
	if(!unit.id) {
		if(unit == "soldier") {
			type = "soldier"
			direction = "right"
		}
		if(unit == "enemySoldier") {
			type = "soldier"
			direction = "left"
		}
		if(unit == "spear") {
			type = "spear"
			direction = "right"
		}
		if(unit == "enemySpear") {
			type = "spear"
			direction = "left"
		}
	} else {
		type = unit.type
		direction = unit.direction;
	}
	
	commonStart = "<div class='backButton' onclick='showUnitsScreen()'><div class='backArrow'></div></div>"+
		"<div class='unitContainer nohover' style='cursor:auto;display:block;position:initial;margin-left:auto;margin-right:auto;'>";
	if(direction === "right") {
		different1 = "<div id='body' class='"+type+" unit' style=''> </div>" + 
			"<div id='unitWeapon' class='weapon'><div class='weapon"+type+"'></div> </div>";
	}
	else {
		different1 = "<div id='unitWeapon' class='weapon'><div class='weapon"+type+"'></div> </div>" +
			"<div id='body' class='"+type+" unitLeft' style=''> </div>";
	}
	commonAfter = "</div><div class='curUnitStatus'>"
	
	different2 = ""
	if(unit.id) {
		different2 = "<div class='buyName' style='left:189px;top:10px;'>Damage Done: <div id='curDamageDone' class='number'>"+unit.totalDamageDone+"</div></div>"+
			"<div class='buyName' style='left:271px;top:35px'>Kills: <div id='curKills' class='number'>"+unit.kills+"</div></div>"+
			"<div class='buyName' style='left:10px;top:10px;'>Health: <div id='curHealth' class='number'>"+unit.curHealth+"</div></div>"+
			"<div class='buyName' style='left:10px;top:35px;'>Unit Count: <div id='curUnitCount' class='number'>"+unit.unitCount+"</div></div>"+
			"<div class='buyName' style='left:10px;top:60px;'>Time Alive: <div id='curTimeAlive' class='number'>"+unit.timeAlive+"</div></div>";
	} 
	next = "</div><div style='width:50%;height:250px;vertical-align:top;'>"
	button1 = addButton(type, direction, "Damage", 1)
	button2 = addButton(type, direction, "Attack Speed", 2)
	button3 = addButton(type, direction, "Move Speed", 3)
	next2 = "</div><div style='width:50%;height:250px;vertical-align:top;'>"
	button4 = addButton(type, direction, "Max Health", 4)
	button5 = addButton(type, direction, "Armor", 5)
	finish = "</div></div>"
	
	if(direction == "right") {
	
		finish = "</div><div class='buySpawnRate'>"+
			"<div class='icon'></div>"+
			"<div class='costBox'><div class='goldIcon'></div><div id='costSoldierUp0' class='number'>400</div></div>"+
			"<div class='buyName'>Spawn Rate</div>"+
			"<div class='buyIncreaseAmount' id='soldierIncrease0'>10% faster</div>"+
			"<div class='buyVal' id='soldierBuy0'>3</div>"+
		"</div></div>"
	}
	
		
	
	
	document.getElementById("unitScreen").innerHTML = commonStart+different1+commonAfter+different2+next+button1+button2+button3+next2+button4+button5+finish;
	document.getElementById("unitScreen").style.display="block"
	document.getElementById("defaultScreen").style.display="none"
}

function addButton(type, direction, name, num) {
	if(direction == "right") {
		return "<div class='buyButton'>"+
			"<div class='icon'></div>"+
			"<div class='costBox'><div class='goldIcon'></div><div id='"+type+"CostUp"+num+"' class='number'>400</div></div>"+
			"<div class='buyName'>"+name+"</div>"+
			"<div class='buyIncreaseAmount' id='"+type+"Increase"+num+"'>300</div>"+
			"<div class='buyVal' id='"+type+"Buy"+num+"'>3</div>"+
		"</div>"
	}
	else {
		return "<div class='buyButton'>"+
			"<div class='icon'></div>"+
			"<div class='buyName'>"+name+"</div>"+
			"<div class='buyVal' id='"+type+"Buy"+num+"'>3</div>"+
		"</div>"
	}

}

function showSoldierScreen() {
	
	
	
	
	
	
	
	document.getElementById("defaultScreen").style.display="none"
	document.getElementById("soldierScreen").style.display="block"
	document.getElementById("soldierEnemyScreen").style.display="none"
	document.getElementById("spearScreen").style.display="none"
	document.getElementById("spearEnemyScreen").style.display="none"
}

function showEnemySoldierScreen() {
	document.getElementById("defaultScreen").style.display="none"
	document.getElementById("soldierScreen").style.display="none"
	document.getElementById("soldierEnemyScreen").style.display="block"
	document.getElementById("spearScreen").style.display="none"
	document.getElementById("spearEnemyScreen").style.display="none"
	
}

function showSpearScreen() {
	document.getElementById("defaultScreen").style.display="none"
	document.getElementById("soldierScreen").style.display="none"
	document.getElementById("soldierEnemyScreen").style.display="none"
	document.getElementById("spearScreen").style.display="block"
	document.getElementById("spearEnemyScreen").style.display="none"

}

function showEnemySpearScreen() {
	document.getElementById("defaultScreen").style.display="none"
	document.getElementById("soldierScreen").style.display="none"
	document.getElementById("soldierEnemyScreen").style.display="none"
	document.getElementById("spearScreen").style.display="none"
	document.getElementById("spearEnemyScreen").style.display="block"
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