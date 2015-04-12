
setInterval(function() {
	tick();
},50);
globalId = 0;
units = [[],[],[],[],[],[]];
for(j = 0; j < 6; j++) {
	addUnit("soldier", j, "right");
	addUnit("soldier", j, "left");
}
	
curBattles = [];
	
timer = 0;
stop = 0;
function tick() {
	if(stop)
		return
	moveUnits()
	checkForUnitCollisions()
	checkForUnitAtEnds()
	timer++;
	if(timer === 10) {
		halfSecond()
	}
	if(timer >= 20) {
		halfSecond()
		timer = 0;
	}
}

function halfSecond() {
	handleBattles()
}

function moveUnits() {
	for(y = 0; y < units.length; y++) {
		for(x = 0; x < units[y].length; x++) {
			if(units[y][x].shouldMove) {
				if(units[y][x].direction == "right") {
					units[y][x].pos += 1;
				}
				else {
					units[y][x].pos -= 1;
				}
			}
			updateUnitPos(y, x)
		}
	}
}

function checkForUnitCollisions() {
	for(y = 0; y < units.length; y++) {
		for(x = 0; x < units[y].length; x++) {
			if(units[y][x].shouldMove === 0) {
				continue;
			}
			pos = units[y][x].pos;
			direction = units[y][x].direction;
			
			for(z = 0; z < units.length; z++) {
				for(w = 0; w < units[z].length; w++) {
					if(z != y || units[z][w].direction == direction) {
						continue;
					}
					if(Math.abs(pos - units[z][w].pos) <= 4.5) {
						units[z][w].shouldMove = 0;
						units[y][x].shouldMove = 0;
						curBattles.push(new Battle(y, x, z, w));
					}
				}
			}
		}
	}
}

function checkForUnitAtEnds() {

}

function handleBattles() {
	toDelete = [];
	for(i = 0; i < curBattles.length; i++) {
		unit1 = units[curBattles[i].y][curBattles[i].x]
		unit2 = units[curBattles[i].z][curBattles[i].w]
		unit1.curHealth -= unit2.getDamageRoll()
		unit2.curHealth -= unit1.getDamageRoll()
		document.getElementById("healthBar"+unit1.id).style.width = (unit1.curHealth / unit1.health * 100) + "%";
		document.getElementById("healthBar"+unit2.id).style.width = (unit2.curHealth / unit2.health * 100) + "%";
		if(unit1.curHealth <= 0) {
			units[curBattles[i].z][curBattles[i].w].shouldMove = 1;
			removeUnit(curBattles[i].y, curBattles[i].x)
			toDelete.push(i)
		}
		else if(unit2.curHealth <= 0) {
			units[curBattles[i].y][curBattles[i].x].shouldMove = 1;
			removeUnit(curBattles[i].z, curBattles[i].w)
			toDelete.push(i)
		}
	}
	/*if(toDelete.length > 0) {
		for(i = toDelete.length - 1; i >= 0; i--)
			console.log("Deleting: " + toDelete[i])
	}*/
	removeDuplicates(toDelete);
	for(i = toDelete.length - 1; i >= 0; i--) {
		curBattles.splice(toDelete[i], 1);
	}
	//if(curBattles.length > 0)
	//	console.log("1st battle: (" + curBattles[0].y+", "+curBattles[0].x+") vs ("+curBattles[0].z+", "+curBattles[0].w+")");
}

function removeUnit(y, x) {
	var elem = document.getElementById("unit"+units[y][x].id);
	elem.parentNode.removeChild(elem);
	direction = units[y][x].direction;
	units[y].splice(x, 1);
	
	
	addUnit("soldier", y, direction);
}

function addUnit(type, line, direction) {
	if(direction == "right") {
		pos = 0
		health = 20
	}
	else {
		pos = 100
		health = 100
	}
	
	if(type == "soldier") {
		units[line].push(new Unit(pos, type, direction, health, 0, 2, 1));
	}
	if(direction == "right") {
		newUnitDiv(globalId - 1, "right", line)
	}
	else {
		newUnitDiv(globalId - 1, "left", line)
	}
	updateUnitPos(line, (units[line].length-1));
}

function removeDuplicates(a) {
    var seen = {};
    var out = [];
    var len = a.length;
    var j = 0;
    for(var i = 0; i < len; i++) {
         var item = a[i];
         if(seen[item] !== 1) {
               seen[item] = 1;
               out[j++] = item;
         }
    }
    return out;
}

function initiate() {
}