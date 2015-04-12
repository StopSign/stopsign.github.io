
setInterval(function() {
	tick();
},50);
globalId = 0;
units = [[],[],[],[],[],[]];
for(j = 0; j < 1; j++) {
	addUnit("soldier", j, "left");
	addUnit("soldier", j, "left");
	addUnit("soldier", j, "right");
}

soldierSpawnRate = 2;
curBattles = [];
	
timer = 0;
stop = 0;
function tick() {
	if(stop)
		return
	moveUnits()
	checkForUnitCollisions()
	checkForUnitAtEnds()
	handleEngaged()
	if(timer % 2 == 0) {
		handleSpawnRates()
	}
	
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

function handleEngaged() {
}

function handleSpawnRates() {
	soldierSpawnRate -= .09999;
	if(soldierSpawnRate <= 0) {
		j = Math.floor(Math.random() * 1)
		addUnit("soldier", j, "right");
		soldierSpawnRate = 30;
	}
	updateSpawnTimers()
}

function moveUnits() {
	for(y = 0; y < units.length; y++) {
		for(x = 0; x < units[y].length; x++) {
			if(units[y][x].engaged.length === 0) {
				if(units[y][x].direction == "right") {
					units[y][x].pos += units[y][x].speed;
				}
				else {
					units[y][x].pos -= units[y][x].speed;
				}
			}
			updateUnitPos(y, x)
		}
	}
}

function checkForUnitCollisions() {
	for(y = 0; y < units.length; y++) {
		for(x = 0; x < units[y].length; x++) {
			if(units[y][x].engaged.length > 0) {
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
						units[z][w].engaged.push(units[y][x]);
						units[y][x].engaged.push(units[z][w]);
						console.log('new battle: '+units[y][x].id + " vs " + units[z][w].id + " at " + Math.abs(pos - units[z][w].pos));
						curBattles.push(new Battle(y, x, z, w, units[y][x].id, units[z][w].id));
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
	deadList = [];
	//for each unit
	for(y = 0; y < units.length; y++) {
		for(x = 0; x < units[y].length; x++) {
		
			//for each engagement
			//for(z = 0; z < units[y][x].engaged.length; z++) {
				//deal dmg
			if(units[y][x].engaged.length > 0) {
				engageTarget = units[y][x].engaged[0];
				engageTarget.curHealth -= units[y][x].getDamageRoll()
				if(engageTarget.curHealth <= 0) {
					disengageAll(engageTarget)
					removeUnit(engageTarget)
					toDelete.push(i)
					deadList.push(engageTarget.id)
				}
				else {
					document.getElementById("healthBar"+engageTarget.id).style.width = (engageTarget.curHealth / engageTarget.health * 100) + "%";
				}
			}
			//}
		}
	}
	
	/*
	for(i = 0; i < curBattles.length; i++) {
		unit1 = units[curBattles[i].y][curBattles[i].x]
		unit2 = units[curBattles[i].z][curBattles[i].w]
		unit1.curHealth -= unit2.getDamageRoll()
		unit2.curHealth -= unit1.getDamageRoll()
		document.getElementById("healthBar"+unit1.id).style.width = (unit1.curHealth / unit1.health * 100) + "%";
		document.getElementById("healthBar"+unit2.id).style.width = (unit2.curHealth / unit2.health * 100) + "%";
		////shouldn't re-engage if still in range of a dude - make engagement a list
		if(unit1.curHealth <= 0) {
			//units[curBattles[i].z][curBattles[i].w].engaged = 0;
			disengageAll(unit1)
			removeUnit(findUnitById(unit1.id))
			toDelete.push(i)
			deadList.push(unit1.id)
		}
		else if(unit2.curHealth <= 0) {
			//units[curBattles[i].y][curBattles[i].x].engaged = 0;
			disengageAll(unit2)
			removeUnit(findUnitById(unit2.id))
			toDelete.push(i)
			deadList.push(unit2.id)
		}
	}*/
	
	removeDuplicates(toDelete);
	for(i = toDelete.length - 1; i >= 0; i--) {
		curBattles.splice(toDelete[i], 1);
	}
	for(i = curBattles.length - 1; i >= 0; i--) {
		for(x = 0; x < deadList.length; x++) {
			//remove any battle that contains a dead id
			if(curBattles[i]) {
				if(curBattles[i].id1 === deadList[x]) {
					curBattles.splice(i, 1);
				}
				else if(curBattles[i].id2 === deadList[x]) {
					curBattles.splice(i, 1);
				}
			}
		}
	}
}

function disengageAll(unit) {
	for(i = 0; i < unit.engaged.length; i++) {
		for(j = unit.engaged[i].engaged.length-1; j >= 0; j--) {
			if(unit.engaged[i].engaged[j].equals(unit)) {
				console.log("disengaging "+unit.id +" from "+unit.engaged[i].id);
				unit.engaged[i].engaged.splice(j, 1);
				console.log("remaining battles of unit 0: " + units[0][2].engaged.length);
			}
		}
	}
}


function removeUnit(unit) {
	var elem = document.getElementById("unit"+unit.id);
	elem.parentNode.removeChild(elem);
	for(x = 0; x < units.length; x++) {
		if(unit.equals(units[unit.line][x])) {
			console.log(unit.id);
			units[unit.line].splice(x, 1);
		}
	}
	
	
	addUnit("soldier", y, unit.direction);
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
		units[line].push(new Unit(line, pos, type, direction, health, 0, 2, 1));
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

function findUnitById(id) {
	for(y = 0; y < units.length; y++) {
		for(x = 0; x < units[y].length; x++) {
			if(units[y][x].id === id)
				return units[y][x]
		}
	}
}

function initiate() {
}

function round2(num) {
    return (Math.floor(num * 100) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function round(num) {
    return Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}