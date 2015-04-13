function newUnitDiv(unit) {
	commonBefore = "<div id='unit"+unit.id+"' class='unitContainer unitLine"+unit.line+"'>" +
			"<div class='healthBarOuter'><div class='healthBarInner' id='healthBar"+unit.id+"' style='z-index:"+(zIndex--)+"'></div></div>";
	if(unit.direction === "right") {
		different = "<div id='body' class='soldier unit' style=''> </div>" + 
			"<div id='unitWeapon' class='weapon'><div id='weapon1' style='background-color:gray;margin-top:8px;height:3px;width:100%'></div> </div>";
	}
	else {
		different = "<div id='unitWeapon' class='weapon'><div id='weapon1' style='background-color:gray;margin-top:8px;height:3px;width:100%'></div> </div>" +
			"<div id='body' class='soldier unitLeft' style=''> </div>";
	}
	commonAfter = "<div id='count"+unit.id+"' class='count count"+unit.type+"'>"+unit.unitCount+"</div></div>";
	document.getElementById('fightTime').innerHTML += commonBefore + different + commonAfter;
}

function updateUnitPos(y, x) {
	if(document.getElementById("unit"+units[y][x].id) == null)
	console.log("sadf" +units[y][x].id);
	document.getElementById("unit"+units[y][x].id).style.left = (units[y][x].pos +7)*11.9 + "px"; 
}

function updateSpawnTimers() {
	document.getElementById("soldierSpawnTimer").innerHTML = round2(soldierSpawnRate);
}