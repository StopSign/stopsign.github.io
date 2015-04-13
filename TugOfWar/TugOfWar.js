
setInterval(function() {
	tick();
},50);
globalId = 0;
zIndex = 10000000000;
units = [[],[],[],[],[],[]];
for(j = 0; j < 6; j++) {
	addUnit("soldier", j, "left");
}
addUnit("soldier", 0, "right");
addUnit("soldier", 0, "right");
addUnit("soldier", 0, "right");
addUnit("soldier", 0, "right");

soldierSpawnRate = 1;
curBattles = [];
timer = 0;
stop = 0;
totalTicks = 0
function tick() {
	totalTicks++;
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
		soldierSpawnRate = 100;
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
			
			for(z = 0; z < units.length; z++) {
				for(w = 0; w < units[z].length; w++) {
					test = 0
					for(i = 0; i < units[y][x].engaged.length; i++) {
						if(units[y][x].engaged[i].equals(units[z][w])) {
							test = 1
							break
						}
					}
					if(test || z != y ) {
						continue;
					}
					if(units[z][w].direction == units[y][x].direction) {
						
					
					}
					else if(Math.abs(units[y][x].pos - units[z][w].pos) <= 4.5) {
						//console.log('variables: '+y+", "+x+", "+z+", "+w)
						units[z][w].engaged.push(units[y][x]);
						units[y][x].engaged.push(units[z][w]);
						//console.log('new battle: '+units[y][x].id + " vs " + units[z][w].id + " at " + Math.abs(pos - units[z][w].pos));
					}
				}
			}
		}
	}
}

function checkForUnitAtEnds() {

}

function handleBattles() {
	//for each unit
	for(y = 0; y < units.length; y++) {
		for(x = units[y].length - 1; x >= 0; x--) {
			if(units[y][x].curHealth > 0 && units[y][x].engaged.length > 0) {
				//get the first target & dmg
				engageTarget = units[y][x].engaged[0];
				engageTarget.curHealth -= units[y][x].getDamageRoll()
				//console.log(units[y][x].id + " attacking "+engageTarget.id + " on " + totalTicks)
				//if it died
				if(engageTarget.curHealth <= 0) {
					console.log("removing: " + engageTarget.id + " on " + totalTicks + ", "+x)
					disengageAll(engageTarget)
					removeUnit(engageTarget)
				}
				else {
					document.getElementById("healthBar"+engageTarget.id).style.width = (engageTarget.curHealth / engageTarget.health * 100) + "%";
				}
				//console.log("x:"+x)
			}
		}
	}
}

//problem:31 is targetting 3 times, and after its dead

function disengageAll(unit) {
	for(i = 0; i < unit.engaged.length; i++) {
		for(j = unit.engaged[i].engaged.length-1; j >= 0; j--) {
			if(unit.engaged[i].engaged[j].equals(unit)) {
				console.log("disengaging "+unit.id +" from "+unit.engaged[i].id);
				unit.engaged[i].engaged.splice(j, 1);
				//console.log("remaining battles of unit 0: " + units[0][2].engaged.length);
			}
		}
	}
}

function removeUnit(unit) {
	if(document.getElementById("unit"+unit.id) == null)
		console.log("1:"+unit.id)
	var elem = document.getElementById("unit"+unit.id);
	elem.parentNode.removeChild(elem);
	
	for(g = 0; g < units.length; g++) {
		for(h = units[g].length - 1; h >= 0; h--) {
			if(units[g][h].curHealth <= 0) {
				console.log('removing2: ' + units[g][h].id + " on " + totalTicks)
				units[g].splice(h, 1)
			}
		}
	}
	if(unit.direction!="right")
		addUnit("soldier", unit.line, unit.direction);
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
		//console.log("just added"+(globalId - 1))
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