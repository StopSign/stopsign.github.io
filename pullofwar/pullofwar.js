
/*setInterval(function() {
	tick();
},50);*/


//uncomment this before checkin
var doWork = new Worker('interval.js');
doWork.onmessage = function(event) {
    if ( event.data === 'interval.start' ) {
		tick();
    }
};
doWork.postMessage({start:true,ms:50});

globalId = 0;
zIndex = 1000000000;
exitLineRightTimer = 0;
exitLineLeftTimer = 0;
increasestageError = 0;

//	addUnit("soldier", 1, "left", 30);
//addUnit("soldier", 0, "right", 2);
//addUnit("spear", 0, "right", 1);
//addUnit("soldier", 0, "right");
//addUnit("soldier", 0, "right");
//addUnit("soldier", 0, "right");

/*unitsThroughOnRight = 0;
unitsThroughOnLeft = 0;
linesEnabled = 6;
soldierSpawnRate = 4;
spearSpawnRate = .5;
spawnRateManual = 0;
currentManualLine = -1;
for(j = 0; j < 6; j++) {
	document.getElementById('clickSpace' + j).innerHTML = "<div class='clickMe'>Click Me</div>";
}
placeCurTimers=   [0,  3, 35, 100, 295, 880, 2635];
placeAmounts=     [1,  1,  1,   1,   1,   1,    1];

spawnRate=          [9, 10];
spawnAmounts =  [-1, 1,  1] //first is enemy
enemySpawnRate = 9;
curBattles = [];
storedLines = [];
timer = 0;
stop = 0;
curClickedUnit = -1;*/
timeList = [];
totalTicks = 0
startTutorial()
function tick() {
	timeList.push(new Date().getTime())
	document.getElementById("fps").innerHTML = round(50/calcAverageTime()*100)+"%";
	if(timeList.length > 100) timeList.splice(0, 1)
	
	totalTicks++;
	if(stop)
		return
	moveUnits()
	checkForUnitAtEnds()
	handleLineTimer()
	checkForUnitCollisions()
	redrawStoredLines()
	if(timer % 2 == 0) {
		handleSpawnRates()
		handlePlaceChanges()
		handleBattles()
	}
	
	timer++;
	if(timer === 10) {
		halfSecond()
	}
	if(timer >= 20) {
		halfSecond()
		timer = 0;
	}
	unit = findUnitById(curClickedUnit)
	if(unit)
		updateStatusUpgrades(unit, unit.type, unit.direction)
}

function calcAverageTime() {
	total = 0;
	for(x = 1; x < timeList.length; x++) {
		total += timeList[x] - timeList[x-1]
	}
	return total / timeList.length
}

function halfSecond() {
	saveIntoStorage()
}

function pause() {
	if(stop) {
		document.getElementById("pauseButton").innerHTML = 'Pause';
		stop = 0;
	}
	else {
		document.getElementById("pauseButton").innerHTML = 'Play';
		stop = 1;
	}
}

clockTimer = .099999999999
function handlePlaceChanges() {
	if(placeAmounts[0] < territory) {
		for(x = 1; x < placeCurTimers.length; x++) {
			placeCurTimers[x]-=clockTimer
	//console.log(placeCurTimers[x]+', '+x);
			if(placeCurTimers[x] < 0) {
				temp = placeAmounts[0]
				placeAmounts[x-1]+=placeAmounts[x]
				placeCurTimers[x] = placeMaxTimers[x]
				if(x == 1) {
					//temp = 
					//num = 9 * Math.pow(1-1/(20+temp*3))^temp
					//temp1 = placeAmounts[0] + placeAmounts[1] > territory ? (territory - placeAmounts[0]) < 0 ? 0 : (territory - placeAmounts[0]) : placeAmounts[1]
					//for(h = 0; h < spawnRate.length; h++) {
					//	spawnRate[h] = x - 1/3*log(-3x - 20)
					//}
					//villages shouldn't be higher than 50 mil
					//families shouldn't be higher than 100 mil
					//turn into families+ at 1 mil
					
					for(z = 0; z < placeAmounts[1]; z++) {
						for(h = 0; h < spawnRate.length; h++) {
							//	console.log(placeAmounts[1]+","+territory+","+placeAmounts[0]+","+temp1)
							if(z + (placeAmounts[0]-placeAmounts[1]) > territory) continue
							spawnRate[h] *= (1-(1/(20+placeAmounts[0]*2)))  //SPAWN RATE FORMULA
							if(spawnRate[h]*2 < initialSpawnRateInitial[h]) {
								spawnAmounts[h+1]*=2;
								spawnRate[h]*=2;
							}
						}
					}
					updateSpawnRate()
				}
			}
		}
	}
	if(placeAmounts[0] > territory) {
		placeAmounts[0] = territory;
	}
	updatePlaceVisuals()
}

function handleSpawnRates() {
	rateReduction = .09999;
	//rateReduction = 0;
	soldierSpawnRate -= rateReduction;
	if(soldierSpawnRate <= 0) {
		j = Math.floor(Math.random() * linesEnabled)
		addUnit("soldier", j, "right", spawnAmounts[1]);
		soldierSpawnRate = spawnRate[0];
	}
	spearSpawnRate -= rateReduction;
	if(spearSpawnRate <= 0) {
		j = Math.floor(Math.random() * linesEnabled)
		addUnit("spear", j, "right", spawnAmounts[2]);
		spearSpawnRate = spawnRate[1];
	}
	enemySpawnRate -= rateReduction;
	if(enemySpawnRate <= 0) {
		for(j = 0; j < linesEnabled; j++) {
			addUnit("soldier", j, "left", Math.floor(spawnAmounts[0]));
			addUnit("spear", j, "left", Math.floor(spawnAmounts[0]/3))
		}
		if(stage >= 3) spawnAmounts[0]+=.3335*Math.pow(1.06, stage)
		enemySpawnRate = 15;
	}
	if(currentManualLine >= 0) {
		spawnRateManual -= rateReduction;
		if(spawnRateManual <= 0) {
			addUnit("soldier", currentManualLine, "right", spawnManualAmounts[0]);
			addUnit("spear", currentManualLine, "right", spawnManualAmounts[1]);
			spawnRateManual = 10;
		}
	}
	updateSpawnTimers()
}

function moveUnits() {
	for(y = 0; y < units.length; y++) {
		for(x = 0; x < units[y].length; x++) {
			if(units[y][x].engaged.length === 0) {
				units[y][x].pos += unitValues[units[y][x].typeNum][2] * (units[y][x].direction != "right" ? -1 : 1);
			}
			updateUnitPos(y, x)
		}
	}
}

function checkForUnitAtEnds() {
	triggerForDelete=[];
	done = 0
	for(y = 0; y < units.length; y++) {
		for(x = 0; x < units[y].length ; x++) {
			if(units[y][x].direction === "right" && units[y][x].pos > 93) { //unit made it to the right
				unitsThroughOnRight+=units[y][x].unitCount;
				exitLineRightTimer = 8
				triggerForDelete.push(units[y][x])
				checkDonestage()
				done = 1
				break;
			}
			else if(units[y][x].direction != "right" && units[y][x].pos < 5) { //enemy got through
				unitsThroughOnLeft+=units[y][x].unitCount;
				unitsThroughOnRight-=units[y][x].unitCount*10;
				done = 1
				if(unitsThroughOnRight < -200) {
					done = 2
				}
				exitLineLeftTimer = 8
				triggerForDelete.push(units[y][x])
				checkDonestage()
				break;
			}
		}
		if(done) break;
	}
	if(done == 2) {
		startANewstage()
		updateProgressVisual()
	}
	else {
	deleteUnitsInList(triggerForDelete)
	}
}

function checkForUnitCollisions() {
triggerForDelete=[];
	for(y = 0; y < units.length; y++) {
		for(x = 0; x < units[y].length ; x++) {
			
			for(z = 0; z < units.length; z++) {
				for(w = 0; w < units[z].length; w++) {
					if(y == z && w == x)
						continue
					test = 0
					for(i = 0; i < triggerForDelete.length; i++) {
						if(triggerForDelete[i].equals(units[y][x])) {
							test = 1
							break
						}
					}
					if(test) {
						continue;
					}
					for(i = 0; i < units[y][x].engaged.length; i++) {
						if(units[y][x].engaged[i].equals(units[z][w])) {
							test = 1
							break
						}
					}
					if(test) {
						continue;
					}
					//Ranged:
					if(units[y][x].type=="spear") {
						if((Math.abs(y-z)<=1)&&units[z][w].direction != units[y][x].direction) {
							difference = units[y][x].pos - units[z][w].pos
							if(units[y][x].direction === "right") {
								if(difference > -15 && difference < 0) {
									//console.log("pushing " + units[z][w].id + ", "+'variables1: '+y+", "+x+", "+z+", "+w+", id:"+units[y][x].id+", "+units[y][x].engaged.length)
									//console.log(units[y][x].engaged);
									units[y][x].engaged.push(units[z][w])
								}
							}
							if(units[y][x].direction === "left") {
								if(difference < 15 && difference > 0) {
									//console.log("pushing " + units[z][w].id + ", "+'variables1: '+y+", "+x+", "+z+", "+w+", id:"+units[y][x].id+", "+units[y][x].engaged.length)
									//console.log(units[y][x].engaged);
									units[y][x].engaged.push(units[z][w])
								}
							}
						}
					}
					//Melee:
					if(z != y)
						continue
					if(units[z][w].direction == units[y][x].direction) {
						if(Math.abs(units[y][x].pos - units[z][w].pos) <= 2 && units[z][w].type===units[y][x].type) {
							units[y][x].unitCount+=units[z][w].unitCount;
							//console.log('variables1: '+y+", "+x+", "+z+", "+w+", id:"+units[y][x].id+", "+units[y][x].unitCount)
							document.getElementById("count"+units[y][x].id).innerHTML = units[y][x].unitCount
							healthBarNum = (units[y][x].curHealth / unitValues[units[y][x].typeNum][3] * 100);
							document.getElementById("healthBar"+units[y][x].id).style.width = healthBarNum>100?100:healthBarNum; + "%";
							if(units[z][w].id === curClickedUnit) {
								clickAUnit(units[y][x].id)
							}
							triggerForDelete.push(units[z][w])
							//combine units into one
						}
					}
					else if(Math.abs(units[y][x].pos - units[z][w].pos) <= 4.5) { //soldier
						if(units[y][x].direction === "right") {
							units[y][x].pos = units[z][w].pos - 4.5;
						}
						else {
							units[z][w].pos = units[y][x].pos - 4.5;
						}
						//console.log('variables: '+y+", "+x+", "+z+", "+w)
						units[z][w].engaged.push(units[y][x]);
						units[y][x].engaged.push(units[z][w]);
						//console.log('new battle: '+units[y][x].id + " vs " + units[z][w].id + " at " + Math.abs(pos - units[z][w].pos));
					}
					else {
					}
				}
			}
		}
	}
	deleteUnitsInList(triggerForDelete)
}

function deleteUnitsInList(triggerForDelete) {
	for(i = 0; i < triggerForDelete.length; i++) {
		for(y = 0; y < units.length; y++) {
			for(x = units[y].length - 1; x >= 0 ; x--) {
				if(units[y][x].equals(triggerForDelete[i])) {
					disengageAll(units[y][x])
					removeUnit(units[y][x], units[y][x].direction!="right")
				}
			}
		}
	}
}

function handleBattles() {
	//for each unit
	for(y = 0; y < units.length; y++) {
		for(x = units[y].length - 1; x >= 0; x--) {
			if(units[y][x].curHealth > 0 && units[y][x].engaged.length > 0) {
				bestTargetPos = 0;
				print = 0;
				for(i = 1; i < units[y][x].engaged.length; i++) {
					if(units[y][x].engaged[i].line == y) {
						if(Math.abs(units[y][x].engaged[i].pos - units[y][x].pos) < Math.abs(units[y][x].engaged[bestTargetPos].pos - units[y][x].pos)) {
							bestTargetPos = i
						}
						else if(units[y][x].engaged[bestTargetPos].line != y) {
							bestTargetPos = i
						}
					}
					else if(units[y][x].engaged[bestTargetPos].line != y && Math.abs(units[y][x].engaged[i].pos - units[y][x].pos) < Math.abs(units[y][x].engaged[bestTargetPos].pos - units[y][x].pos)) {
						//console.log(units[y][x].engaged[i].line == y)
						//console.log(Math.abs(units[y][x].engaged[i].pos - units[y][x].pos))
						//console.log(Math.abs(units[y][x].engaged[bestTargetPos].pos - units[y][x].pos))
						//console.log(units[y][x].engaged[i].pos+", "+units[y][x].pos)
						bestTargetPos = i
					}
				}
				//disengage if the unit is too far away.
				engageTarget = units[y][x].engaged[bestTargetPos];
				if(print) {
					console.log(engageTarget.id)
				}
				if(units[y][x].type ==="spear") {
					if((units[y][x].direction ==="right" && units[y][x].pos - engageTarget.pos > 0) || (units[y][x].direction !="right" && units[y][x].pos - engageTarget.pos < 0)) {
						units[y][x].engaged.splice(0, 1);
						continue;
					}
				}
				//get the target & dmg
				if(units[y][x].type == "spear" && units[y][x].attackCounter === 3) {
					drawSpearLine(units[y][x], engageTarget);
				}
				count = engageTarget.unitCount
				engageTarget.takeDamage(units[y][x].getDamageRoll(engageTarget.typeNum))
				units[y][x].kills += count - engageTarget.unitCount;
				//console.log(engageTarget.id)
				document.getElementById("count"+engageTarget.id).innerHTML = engageTarget.unitCount
				//console.log(units[y][x].id + " attacking "+engageTarget.id + " on " + totalTicks)
				//if it died
				if(engageTarget.curHealth <= 0) {
					//console.log("removing: " + engageTarget.id + " on " + totalTicks + ", "+x)
					//console.log(units[y][x].engaged)
					updateGoldVisual()
					disengageAll(engageTarget)
					removeUnit(engageTarget, engageTarget.direction!="right")
				}
				else {
					document.getElementById("healthBar"+engageTarget.id).style.width = (engageTarget.curHealth / unitValues[engageTarget.typeNum][3] * 100) + "%";
				}
				//console.log("x:"+x)
			}
		}
	}
}

function disengageAll(unit) {
	for(f = 0; f < units.length; f++) {
		for(e = 0; e < units[f].length ; e++) {
			for(i = units[f][e].engaged.length-1; i >= 0; i--) {
				if(units[f][e].engaged[i].equals(unit)) {
					//console.log("disengaging "+unit.id +" from "+unit.engaged[i].id);
					units[f][e].engaged.splice(i, 1)
					if(i==0 && units[f][e].attackCounter <= 3) units[f][e].attackCounter = 4//unitValues[units[y][x].typeNum][1]
				}
			}
		}
	}
}

function removeUnit(unit, shouldAdd) {
	var elem = document.getElementById("unit"+unit.id);
	parent = elem.parentNode
	parent.parentNode.removeChild(parent);
	
	for(g = 0; g < units.length; g++) {
		for(h = units[g].length - 1; h >= 0; h--) {
			if(unit.equals(units[g][h])) {
				//console.log('removing2: ' + units[g][h].id + " on " + totalTicks)
				units[g].splice(h, 1)
			}
		}
	}
}

function checkDonestage() {
	if(unitsThroughOnRight > scoreNeededForstage) {
		territory += stage * 10 + (stage * stage)
		updateTerritoryVisual()
		unitsThroughOnRight = 0;
		higheststageUnlocked = stage+1 > higheststageUnlocked ? stage+1 : higheststageUnlocked;
		startANewstage()
	}
	updateProgressVisual()
}

function addUnit(type, line, direction, unitCount) {
	if(unitCount <= 0) {
		return
	}
	if(direction == "right") {
		pos = 0
		goldWorth = 0
	}
	else {
		pos = 100
		if(type == "soldier") {
			goldWorth = stage * stage;
		}
		if(type == "spear") {
			goldWorth = stage * stage * 2
		}
	}
	theNewUnit = new Unit(line, pos, type, direction, unitCount, goldWorth);
	units[line].push(theNewUnit);
	//console.log("just added"+(globalId - 1))
	newUnitDiv(theNewUnit)
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
			if(units[y][x].id == id)
				return units[y][x]
		}
	}
}

function round3(num) {
    return (Math.floor(num * 1000) / 1000).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function round2(num) {
    return (Math.floor(num * 100) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function round1(num) {
    return (Math.floor(num * 10) / 10).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function round(num) {
    return Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}