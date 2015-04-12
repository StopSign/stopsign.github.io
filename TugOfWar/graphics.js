function newUnitDiv(id, direction, line) {
	commonBefore = "<div id='unit"+id+"' class='unitContainer unitLine"+line+"'>" +
			"<div class='healthBarOuter'><div class='healthBarInner' id='healthBar"+id+"'></div></div>";
	if(direction == "right") {
		different = "<div id='body' class='soldier unit' style=''> </div>" + 
			"<div id='unitWeapon' class='weapon'><div id='weapon1' style='background-color:gray;margin-top:8px;height:3px;width:100%'></div> </div>";
	}
	else {
		different = "<div id='unitWeapon' class='weapon'><div id='weapon1' style='background-color:gray;margin-top:8px;height:3px;width:100%'></div> </div>" +
			"<div id='body' class='soldier unit' style=''> </div>";
	}
	commonAfter = "</div>";
	document.getElementById('fightTime').innerHTML += commonBefore + different + commonAfter;
}

function updateUnitPos(y, x) {
	document.getElementById("unit"+units[y][x].id).style.left = (units[y][x].pos +7)*11.9 + "px"; 
}

function updateSpawnTimers() {
	document.getElementById("soldierSpawnTimer").innerHTML = round2(soldierSpawnRate);
}