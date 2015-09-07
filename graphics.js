function newUnitDiv(unit) {
	commonBefore = "<div id='unit"+unit.id+"' class='unitContainer unitLine"+unit.line+"' style='z-index:"+(zIndex--)+"' onmouseover='hoverAUnit("+unit.id+")' onclick='clickAUnit("+unit.id+")'>" +
		"<div class='healthBarOuter'><div class='healthBarInner' id='healthBar"+unit.id+"' style='z-index:"+(zIndex--)+"'></div></div>";
	src = "pics/"+(unit.direction!="right"?"enemy":"")+unit.type+".png"
	different = "<img height='30' width='50' src='"+src+"'>"
	/*if(unit.direction === "right") {
		different = "<div id='body' class='"+unit.type+" unit' style=''> </div>" + 
			"<div id='unitWeapon' class='weapon'><div class='weapon"+unit.type+"'></div> </div>";
	}
	else {
		different = "<div id='unitWeapon' class='weapon'><div class='weapon"+unit.type+"'></div> </div>" +
			"<div id='body' class='"+unit.type+" unitLeft' style=''> </div>";
	}*/
	commonAfter = "<div id='count"+unit.id+"' class='count hyperVisible count"+unit.type+"'>"+unit.unitCount+"</div></div>";
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

function updateManaVisual() {
	document.getElementById("mana").innerHTML = round2(curMana);
}

function updateSpellVisuals() {
	document.getElementById("spellCost0").innerHTML = round2(spellCosts[0])
	document.getElementById("spellCost1").innerHTML = round2(spellCosts[1])
}

function updateSpawnTimers() {
	document.getElementById("soldierSpawnTimer").innerHTML = round2(soldierSpawnRate);
	document.getElementById("soldierAutoSpawnAmount").innerHTML = Math.floor(spawnAmounts[0]*bonusFromFam)
	document.getElementById("enemySpawnTimer").innerHTML = round2(enemySpawnRate);
	document.getElementById("enemySoldierSpawnAmount").innerHTML = round(enemySpawnAmounts[1])
	document.getElementById("enemySpearSpawnAmount").innerHTML = round(enemySpawnAmounts[2])
	if(Math.floor(spawnAmounts[1]*bonusFromFam) == 0) {
		document.getElementById("spearContainer").style.display="none"
	}
	else {
		document.getElementById("spearContainer").style.display="inline-block"
		document.getElementById("spearSpawnTimer").innerHTML = round2(spearSpawnRate);
		document.getElementById("spearAutoSpawnAmount").innerHTML = Math.floor(spawnAmounts[1]*bonusFromFam)
	}
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

function updateWallHealthVisuals() {
	document.getElementById("wallHealth").innerHTML = round1(wallHealth)
	document.getElementById("enemyWallHealth").innerHTML = round1(enemyWallHealth)
	document.getElementById("compete3").style.width = wallHealth / wallHealthInitial * 100 + "%";
	document.getElementById("compete4").style.width = (1-wallHealth / wallHealthInitial) * 100 + "%";
	document.getElementById("compete5").style.width = enemyWallHealth / enemyWallHealthInitial * 100 + "%";
	document.getElementById("compete6").style.width = (1-enemyWallHealth / enemyWallHealthInitial) * 100 + "%";
	document.getElementById("fenceHealth").innerHTML = fenceHealth;
	document.getElementById("enemyFenceHealth").innerHTML = enemyFenceHealth;
}

function changeBuildingScreen(buildingType) {
	start = ""
	if(buildingType == "wall") {
		start = "<img src ='pics/smallwall.png' height='50' width='50' /><br>"
		start += addBuildingButton("wall", "Wall Health", 0)
	}
	if(buildingType == "fence") {
		start = "<img src ='pics/smallfence.png' height='50' width='25' /><br>"
		start += addBuildingButton("fence", "Fence Stacks", 0)
	}
	start += ""
	document.getElementById("buildingUpgradesBox").innerHTML = start
}
function addBuildingButton(type, name, num) {
	return "<div class='buyButton' onclick='clickBuildingBuyButton("+num+" , \""+type+"\")'"+"  id='buyBuildingButton"+num+"' style='width:80%;border:2px solid;' >"+
		"<div class='buyName'>"+name+"</div>"+
		"<div class='buyVal' id='buyBuilding"+num+"'>3</div>"+
		"<div class='costBox'><div class='goldIcon'></div><div id='costBuilding"+num+"' class='number'>400</div></div>"+
	"</div>"
}

function changeUnitScreen(unit) {
	type = "error"
	if(typeof unit.id == 'undefined') {
		if(unit == "soldier") {
			type = "soldier"
		}
		if(unit == "spear") {
			type = "spear"
		}
	} else {
		type = unit.type
	}
	if(type==="error") {
		document.getElementById("unitUpgradesBox").innerHTML="";
		return
	}
	typeNum = convertTypeToNum(type, "right");
	commonStart = "<div class='unitContainer nohover' style='cursor:auto;display:block;position:initial;margin-left:auto;margin-right:auto;margin-top:5px;height:30px;'>";
	next = "<img src='pics/"+type+".png' img height='30' width='50'></div></div>";
	next2 =  "<div class='buySpawnRate' style='margin-bottom:8px;' onclick='buyUpgradePoint(\""+type+"\")'>"+
			"<div class='icon'>"+addIcon(7)+"</div>"+
			"<div class='costBox'><div class='goldIcon'></div><div id='cost' class='number'>400</div></div>"+
			"<div class='buyName' >Buy an <div style='color:teal;'>Upgrade Point</div></div>"+
			"<div class='buyVal' id='buy'>3</div>"+
		"</div>"
	next25 = "<div id='slider'></div>";
	next3 = "<div style='width:40%;height:40px;vertical-align:top;'>"
	button1 = addButton(type, "Damage", 1)
	next4 = "</div><div style='width:40%;height:40px;vertical-align:top;'>"
	button4 = addButton(type, "Max Health", 4)
	next5= "</div><div style='font-size:14px;margin-bottom:14px;margin-right:60px;'>Total dead: <div id='totalDead"+typeNum+"' style='color:black'>5f</div></div>"+
		"<div style='font-size:14px;margin-bottom:14px;'>Bonus from dead units: x<div id='deadUnitBonus"+typeNum+"' style='color:black'>5f</div></div>"+
		"<div id='spawnRateContainer' class='buySpawnRate' onclick='clickBuySpawnRate(\""+type+"\")'>"+
		"<div class='icon'>"+addIcon(0)+"</div>"+
		"<div class='costBox'><div class='goldIcon'></div><div id='costSpawn' class='number'>400</div></div>"+
		"<div class='buyName'>Spawn Rate</div>"+
		"<div class='buyIncreaseAmount' id='"+type+"Increase0'>5% faster</div>"+
		"<div class='buyVal' style='color:rgb(102, 102, 102);'>Spawn <div id='buy0' style='color:black;'></div> unit every <div id='buy02' style='color:black;'></div> seconds.</div>"+
	"</div>"
	
	next6="<div style='width:40%;height:110px;vertical-align:top;'>"
	button2 = addButton(type, "Attack Speed", 2)
	button3 = addButton(type, "Move Speed", 3)
	next7="</div><div style='width:40%;height:110px;vertical-align:top;'>"
	button5 = addButton(type, "Armor", 5)
	button6 = addButton(type, "Range", 6)
	finish ="</div>"
	
	curUnitScreen = typeNum
	document.getElementById("unitUpgradesBox").innerHTML = commonStart+next+next2+next25+next3+button1+next4+button4+next5+next6+button2+button3+next7+button5+button6+finish;
	if(upgradePointsInitial[typeNum] > 0)
		slider('slider');
	//document.getElementById("unitUpgradesBox").style.display="block"
	//document.getElementById("defaultScreen").style.display="none"
	updateSpawnRate2(type)
	updateStatusUpgrades(unit, type)
	updateDeadUnitBonus()
	if(buttonsToClick) {
		clickedOKButton()
	}
}

function slider(id) {
    $("#" + id).slider({
        value: 1,
        min: 0,
        max: upgradePointsInitial[typeNum],
        step: 1,
        slide: function(event, ui) {
			unitPointValues[typeNum][0] = upgradePointsInitial[typeNum] - ui.value;
			unitPointValues[typeNum][3] = ui.value;
			handleBuyAmounts(typeNum, 0)
			handleBuyAmounts(typeNum, 3)
			updateStatusUpgrades("", type)
        }
    });
}

function updateSpawnRate2(type) {
	if(type == "soldier") numToUpdate = 0
	if(type == "spear") numToUpdate = 1
	document.getElementById("buy0").innerHTML = round2(spawnAmounts[numToUpdate])
	document.getElementById("buy02").innerHTML = round2(spawnRate[numToUpdate])
}

function updateSpawnRate() {
	unit = getUnitById(curClickedUnit)
	if(document.getElementById("buy0")) {
		document.getElementById("buy0").innerHTML = round2(spawnAmounts[unit.typeNum/2])
		document.getElementById("buy02").innerHTML = round2(spawnRate[unit.typeNum/2])
	}
}

function updateStatusUpgrades(unit, type) {
	typeNum = convertTypeToNum(type, "right")
	document.getElementById("buy").innerHTML=upgradePointsInitial[typeNum];
	document.getElementById("cost").innerHTML=round(unitCosts[typeNum]);
	document.getElementById("costSpawn").innerHTML=round(costSpawnRate[typeNum]);
	if(upgradePointsInitial[typeNum] && document.getElementById("slider").children.length == 0)
		slider('slider');
	if(upgradePointsInitial[typeNum])
		$("#slider").slider('value', unitPointValues[typeNum][3]);
	for(e = 1; e < unitValues[typeNum].length+1; e++) {
		if(document.getElementById("points"+e)) document.getElementById("points"+e).innerHTML=unitPointValues[typeNum][e-1]
		document.getElementById("buy"+e).innerHTML=round2(unitValues[typeNum][e-1]*deadUnitBonus[typeNum])
	}
	updateSpawnRate2(type)
}

function convertTypeToNum(type, direction) {
	if(type == "soldier" && direction == "right") return 0;
	if(type == "soldier" && direction != "right") return 1;
	if(type == "spear" && direction == "right") return 2;
	if(type == "spear" && direction != "right") return 3;
	return -1;
}

function addButton(type, name, num) {
	return "<div class='buyButton "+(num == 1 || num == 4 ? "' onclick='clickBuyButton("+num+" , \""+type+"\")'" : "nohover'")+"  id='buyButton"+num+"'>"+
		"<div class='icon'>"+addIcon(num)+"</div>"+
		"<div class='buyName'>"+name+"</div>"+
		"<div class='buyVal' id='buy"+num+"'>3</div>"+
		(num == 1 || num == 4 ? "<div class='upgradePoints' id='points"+num+"'>3</div>" : "") +
	"</div>"
}

function updateHover(id) {
	unitToDisplay = getUnitById(id)
	if(!unitToDisplay) return
	
	document.getElementById("curDamageDone").innerHTML = round2(unitToDisplay.totalDamageDone);
	document.getElementById("curKills").innerHTML = unitToDisplay.kills;
	document.getElementById("curHealth").innerHTML = round1(unitToDisplay.curHealth);
	document.getElementById("curUnitCount").innerHTML = unitToDisplay.unitCount;
	document.getElementById("curTimeAlive").innerHTML = round((totalTicks - unitToDisplay.timeAlive)/20)+"s";
	document.getElementById("curActualHealth").innerHTML = round1(unitToDisplay.actualMaxHealth);
	document.getElementById("totalHealth").innerHTML = round1((unitToDisplay.unitCount-1)*unitToDisplay.actualMaxHealth+unitToDisplay.curHealth);
	document.getElementById("curDamage").innerHTML = round2(unitToDisplay.damage);
	document.getElementById("totalDamage").innerHTML = round2(unitToDisplay.damage*unitToDisplay.unitCount);
}

function addIcon(num) {
	if(num == 0) {
		return "<img src='pics/camp.png' height='100%' width='100%'>"
	}
	if(num == 1) {
		return "<img src='pics/sword.png' height='100%' width='100%'>"
	}
	if(num == 2) {
		return "<img src='pics/fast.png' height='100%' width='100%'>"
	}
	if(num == 3) {
		return "<img src='pics/foot.png' height='100%' width='100%'>"
	}
	if(num == 4) {
		return "<img src='pics/heart.png' height='100%' width='100%'>"
	}
	if(num == 5) {
		return "<img src='pics/shield.png' height='100%' width='100%'>"
	}
	if(num == 6) {
		return "<img src='pics/range.png' height='100%' width='100%'>"
	}
	if(num == 7) {
		return "<img src='pics/arrow.png' height='100%' width='100%'>"
	}
	return "";
}

function handleLineAmounts(lineCount) {
	for(m = 0; m < 6; m++) {
		document.getElementById("line"+m).style.display = lineCount>m ? "inline-block" : "none";
	}
	if(lineCount == 1) offset = 120;
	if(lineCount == 2) offset = 105;
	if(lineCount == 3) offset = 70;
	if(lineCount == 4) offset = 55;
	if(lineCount == 5) offset = 30;
	if(lineCount == 6) offset = 0;
	offset+=37;
	document.getElementById("fightTime").style.marginTop = offset+"px";
	document.getElementById("line0").style.marginTop=(70+offset)+"px";
	if(lineCount == 1) {
	}
	if(lineCount == 2) {
	}
	if(lineCount == 3) {
	}
	if(lineCount == 4) {
	}
	if(lineCount == 5) {
	}
	if(lineCount == 6) {
	}
}

function drawSpearLine(unit1, unit2) {
	storedLines.push({x1:(unit1.pos+7)*11.9+22, y1:(unit1.line)*54+60+offset, x2:(unit2.pos+7)*11.9+11, y2:(unit2.line)*54+60+offset, curCount:4, count:4});
}

function drawSpearLine2(unit1) {
	storedLines.push({x1:(unit1.pos+7)*11.9+22, y1:(unit1.line)*54+60+offset, x2:(unit1.pos+7)*11.9+151, y2:(unit1.line)*54+60+offset, curCount:4, count:4});
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


function switchMainTab(switchTo) {
	currentTab = switchTo
	hideAllInfo()
	switch(switchTo) {
		case 0:
			document.getElementById("warSpace").style.display = "inline-block";
			document.getElementById("manaSpace").style.display = "inline-block";
			document.getElementById("warTab").style.backgroundColor="rgb(142, 212, 142)";
		break;
		case 1:
			document.getElementById("mapSpace").style.display = "inline-block";
			document.getElementById("mapTab").style.backgroundColor="rgb(142, 212, 142)";
		break;
		case 2:
			document.getElementById("placesSpace").style.display = "inline-block";
			document.getElementById("territoryTab").style.backgroundColor="rgb(142, 212, 142)";
		break;
		case 3:
			document.getElementById("unitsSpace").style.display = "inline-block";
			document.getElementById("unitTab").style.backgroundColor="rgb(142, 212, 142)";
		break;
		case 4:
			document.getElementById("buildingsSpace").style.display = "inline-block";
			document.getElementById("buildingsTab").style.backgroundColor="rgb(142, 212, 142)";
		break;
		case 5:
			document.getElementById("manaTab").style.backgroundColor="rgb(142, 212, 142)";
		break;
		case 6:
			document.getElementById("optionsTab").style.backgroundColor="rgb(142, 212, 142)";
			document.getElementById("optionsPage").style.display = "inline-block";
		break;
	}
}

function hideAllInfo() {
	document.getElementById("warSpace").style.display = "none";
	document.getElementById("mapSpace").style.display = "none";
	document.getElementById("manaSpace").style.display = "none";
	document.getElementById("unitsSpace").style.display = "none";
	document.getElementById("buildingsSpace").style.display = "none";
	document.getElementById("placesSpace").style.display = "none";
	document.getElementById("optionsPage").style.display = "none";
	
	document.getElementById("warTab").style.backgroundColor="white";
	document.getElementById("mapTab").style.backgroundColor="white";
	document.getElementById("territoryTab").style.backgroundColor="white";
	document.getElementById("unitTab").style.backgroundColor="white";
	document.getElementById("buildingsTab").style.backgroundColor="white";
	document.getElementById("manaTab").style.backgroundColor="white";
	document.getElementById("optionsTab").style.backgroundColor="white";
}


var c = document.getElementById("damageLines");
var ctx = c.getContext("2d");