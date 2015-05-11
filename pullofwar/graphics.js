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
	console.log("updating null unit "+y+", "+x);
	if(document.getElementById("unit"+units[y][x].id) == null)
	console.log("sadf" +units[y][x].id);
	document.getElementById("unit"+units[y][x].id).style.left = (units[y][x].pos +7)*11.9 + "px"; 
}

function updateSpawnTimers() {
	document.getElementById("soldierSpawnTimer").innerHTML = round2(soldierSpawnRate);
	document.getElementById("spearSpawnTimer").innerHTML = round2(spearSpawnRate);
	document.getElementById("enemySpawnTimer").innerHTML = round2(enemySpawnRate);
	document.getElementById("manualSpawnTimer").innerHTML = round2(spawnRateManual);
	document.getElementById("enemyAutoSpawnAmount").innerHTML = round(spawnAmounts[0])
	document.getElementById("soldierManualSpawnAmount").innerHTML = spawnManualAmounts[0]
	document.getElementById("soldierAutoSpawnAmount").innerHTML = spawnAmounts[1]
	document.getElementById("spearManualSpawnAmount").innerHTML = spawnManualAmounts[1]
	document.getElementById("spearAutoSpawnAmount").innerHTML = spawnAmounts[2]
}

function updateGoldVisual() {
	document.getElementById("gold").innerHTML = round(gold);
}

function updateTerritoryVisual() {
	document.getElementById("territory").innerHTML = round(territory)
}
function updatePlaceVisuals() {
	document.getElementById("placeAmount0").innerHTML=placeAmounts[0];
	document.getElementById("placeTimer0").innerHTML=round3(placeAmounts[0] / territory*100) + "% of territory";
	document.getElementById("placeProgressInner0").style.width=round3(placeAmounts[0] / territory*100) + "%";
	for(x = 1; x < placeAmounts.length; x++) {
		document.getElementById("placeAmount"+x).innerHTML=placeAmounts[x];
		document.getElementById("placeTimer"+x).innerHTML=round1(placeCurTimers[x]);
		document.getElementById("placeProgressInner"+x).style.width= (1-placeCurTimers[x] / placeMaxTimers[x])*100+"%"
		document.getElementById("placeCost"+x).innerHTML=round(placeAmountCosts[x])
	}
}

function updateProgressVisual() {
	scoreNeededForstage = 50+stage * 50
	toModify = unitsThroughOnRight
	if ( unitsThroughOnRight > scoreNeededForstage) {
		toModify = 1
	}
	if ( unitsThroughOnRight < 0 ) {
		toModify = 0
	}
	document.getElementById("compete1").style.width = toModify / scoreNeededForstage * 100 + "%";
	document.getElementById("compete2").style.width = (1-toModify / scoreNeededForstage) * 100 + "%";
	document.getElementById("score").innerHTML = Math.ceil(unitsThroughOnRight / scoreNeededForstage * 100)+"%"
}

function showUnitsScreen() {
	if(buttonsToClick)
		return
	clickAUnit("-1")
	document.getElementById("defaultScreen").style.display="block"
	document.getElementById("unitScreen").innerHTML = ""
	
}

function changeUnitScreen(unit) {
	type = "error"
	direction ="error"
	if(typeof unit.id == 'undefined') {
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
	
	different2 = "<div class='buyName' style='left:79px;top:12px;'>Click a unit for it's status</div>"
	if(unit.id) {
		different2 = "<div class='buyName' style='left:189px;top:10px;'>Damage Done: <div id='curDamageDone' class='number'>"+unit.totalDamageDone+"</div></div>"+
			"<div class='buyName' style='left:271px;top:59px'>Kills: <div id='curKills' class='number'>"+unit.kills+"</div></div>"+
			"<div class='buyName' style='left:10px;top:10px;'>Health: <div id='curHealth' class='number'>"+round1(unit.curHealth)+"</div></div>"+
			"<div class='buyName' style='left:10px;top:35px;'>Unit Count: <div id='curUnitCount' class='number'>"+unit.unitCount+"</div></div>"+
			"<div class='buyName' style='left:10px;top:60px;'>Time Alive: <div id='curTimeAlive' class='number'>"+unit.timeAlive+"</div></div>";
	} 
	next = "</div>"
	different3 = direction === "right" ? ("<div class='buySpawnRate' onclick='buyUpgradePoint(\""+type+"\")'>"+
			"<div class='icon'>"+addIcon(6)+"</div>"+
			"<div class='costBox'><div class='goldIcon'></div><div id='cost' class='number'>400</div></div>"+
			"<div class='buyName' >Buy an <div style='color:teal;'>Upgrade Point</div></div>"+
			"<div class='buyVal' id='buy'>3</div>"+
		"</div>") : ""
	
	next2 = "<div style='width:50%;height:250px;vertical-align:top;'>"
	button1 = addButton(type, direction, "Damage", 1)
	button2 = addButton(type, direction, "Attack Speed", 2)
	button3 = addButton(type, direction, "Move Speed", 3)
	next2 = "</div><div style='width:50%;height:250px;vertical-align:top;'>"
	button4 = addButton(type, direction, "Max Health", 4)
	button5 = addButton(type, direction, "Armor", 5)
	button6 = direction == "right" ? ("<div class='buyButton' style='border:1px solid;width:99%;' onclick='resetUpgradePoints(\""+type+"\")'><div class='buyName' style='left:9px;top:22px'>Reset Upgrade Points</div></div>") : ""
	finish = "</div></div>"
	
	if(direction == "right") {
	
		finish = "</div><div id='spawnRateContainer' class='buySpawnRate' onclick='clickBuySpawnRate(\""+type+"\")'>"+
			"<div class='icon'>"+addIcon(0)+"</div>"+
			"<div class='costBox'><div class='goldIcon'></div><div id='costSpawn' class='number'>400</div></div>"+
			"<div class='buyName'>Spawn Rate</div>"+
			"<div class='buyIncreaseAmount' id='"+type+"Increase0'>10% faster</div>"+
			"<div class='buyVal' id='buy0'></div>"+
		"</div></div>"
	}
	
	document.getElementById("unitScreen").innerHTML = commonStart+different1+commonAfter+different2+next+different3+next2+button1+button2+button3+next2+button4+button5+button6+finish;
	document.getElementById("unitScreen").style.display="block"
	document.getElementById("defaultScreen").style.display="none"
	updateSpawnRate2(type, direction)
	updateStatusUpgrades(unit, type, direction)
	if(buttonsToClick) {
		clickedOKButton()
	}
}


function updateSpawnRate2(type, direction) {
	if(type == "soldier" && direction == "right") document.getElementById("buy0").innerHTML = round2(spawnRate[0]) + " x " + spawnAmounts[1]
	if(type == "spear" && direction == "right") document.getElementById("buy0").innerHTML = round2(spawnRate[1]) + " x " + spawnAmounts[2]
}

function updateSpawnRate() {
	if(document.getElementById("buy0")) document.getElementById("buy0").innerHTML = round2(spawnRate[typeNum/2]) + " x " + spawnAmounts[typeNum/2+1]
}

function updateStatusUpgrades(unit, type, direction) {
	if(unit.id) {
		//handle status specific to unit
		document.getElementById("curHealth").innerHTML = round1(unit.curHealth)
		document.getElementById("curUnitCount").innerHTML = unit.unitCount
		document.getElementById("curTimeAlive").innerHTML = round((totalTicks - unit.timeAlive)/20)+"s"
		document.getElementById("curDamageDone").innerHTML = round(unit.totalDamageDone)
		document.getElementById("curKills").innerHTML = unit.kills
	}
	typeNum = convertTypeToNum(type, direction)
	if(direction == "right")  {
		document.getElementById("buy").innerHTML=upgradePointsAvailable[typeNum];
		document.getElementById("cost").innerHTML=round(unitCosts[typeNum]);
		document.getElementById("costSpawn").innerHTML=round(costSpawnRate[typeNum]);
	}
	for(e = 1; e < unitValues[typeNum].length+1; e++) {
		if(direction == "right" && document.getElementById("points"+e)) document.getElementById("points"+e).innerHTML=unitPointValues[typeNum][e-1]
		document.getElementById("buy"+e).innerHTML=round2(unitValues[typeNum][e-1])
	}
	updateSpawnRate2(type, direction)
}

function convertTypeToNum(type, direction) {
	if(type == "soldier" && direction == "right") return 0;
	if(type == "soldier" && direction != "right") return 1;
	if(type == "spear" && direction == "right") return 2;
	if(type == "spear" && direction != "right") return 3;
	return -1;
}

function addButton(type, direction, name, num) {
	if(direction == "right") {
		return "<div class='buyButton "+(num != 2 ? "' onclick='clickBuyButton("+num+" , \""+type+"\" , \"right\")'" : "nohover'")+"  id='buyButton"+num+"'>"+
			"<div class='icon'>"+addIcon(num)+"</div>"+
			"<div class='buyName'>"+name+"</div>"+
			"<div class='buyVal' id='buy"+num+"'>3</div>"+
			(num != 2 ? "<div class='upgradePoints' id='points"+num+"'>3</div>" : "") +
		"</div>"
	}
	else {
		return "<div class='buyButton nohover'>"+
			"<div class='icon'>"+addIcon(num)+"</div>"+
			"<div class='buyName'>"+name+"</div>"+
			"<div class='buyVal' id='buy"+num+"'>3</div>"+
		"</div>"
	}

}

function addIcon(num) {
	if(num == 0) {
		return "<img src='img/camp.png' height='100%' width='100%'>"
	}
	if(num == 1) {
		return "<img src='img/sword.png' height='100%' width='100%'>"
	}
	if(num == 2) {
		return "<img src='img/fast.png' height='100%' width='100%'>"
	}
	if(num == 3) {
		return "<img src='img/foot.png' height='100%' width='100%'>"
	}
	if(num == 4) {
		return "<img src='img/heart.png' height='100%' width='100%'>"
	}
	if(num == 5) {
		return "<img src='img/shield.png' height='100%' width='100%'>"
	}
	if(num == 6) {
		return "<img src='img/arrow.png' height='100%' width='100%'>"
	}
	return "";
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
	if(increasestageError) {
		increasestageError--
		document.getElementById("increasestageError").style.display = "block";
	} else {
		document.getElementById("increasestageError").style.display = "none";
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