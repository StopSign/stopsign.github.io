started = 0
setInterval(function() {
	if(started)
		tick();
},50);


//uncomment this before checkin
/*var doWork = new Worker('interval.js');
doWork.onmessage = function(event) {
    if ( event.data === 'interval.start' ) {
		tick();
    }
};
doWork.postMessage({start:true,ms:50});*/

globalId = 0;
zIndex = 1000000000;

//	addUnit("soldier", 1, "left", 30);
//addUnit("soldier", 0, "right", 2);
//addUnit("spear", 0, "right", 1);
//addUnit("soldier", 0, "right");
//addUnit("soldier", 0, "right");
//addUnit("soldier", 0, "right");

/*
linesEnabled = 6;
soldierSpawnRate = 4;
spearSpawnRate = .5;
placeCurTimers=   [0,  3, 35, 100, 295, 880, 2635];
placeAmounts=     [1,  1,  1,   1,   1,   1,    1];

spawnRate=          [9, 10];
spawnAmounts =  [1,  1]
enemySpawnRate = 9;
curBattles = [];
curClickedUnit = -1;*/
timeList = [];
storedLines = [];
totalTicks = 0
timer = 0;
//startTutorial()
function tick() {
	timeList.push(new Date().getTime())
	document.getElementById("fps").innerHTML = round(50/calcAverageTime()*100)+"% fps";
	if(timeList.length > 100) timeList.splice(0, 1)
	
	totalTicks++;
	if(stop)
		return
	moveUnits()
	checkForUnitAtEnds()
	checkForUnitCollisions()
	redrawStoredLines()
	if(timer % 2 == 0) {
		handleSpawnRates()
		handlePlaceChanges()
		handleDamageAtEnds()
		handleBattles()
	}
	updateManaGain()
	timer++;
	if(timer === 10) {
		halfSecond()
	}
	else if(timer >= 20) {
		halfSecond()
		updateMapTimers()
		updateSpellCooldowns()
		updateSpellVisuals()
		timer = 0;
	}
	updateHover(curClickedUnit)
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
			if(placeCurTimers[x] < 0) {
				placeAmounts[x-1]+=placeAmounts[x]
				placeCurTimers[x] = placeMaxTimers[x]
				if(x == 1) { //on village timer trigger
					extraFamilies = placeAmounts[0] - territory
					if(extraFamilies < 0) extraFamilies = 0;
					for(z = 0; z < placeAmounts[1] - extraFamilies; z++) {
						bonusFromFam *= 1+(1/(20+(placeAmounts[0]-z)*1.5)) //SPAWN RATE FORMULA
					}
					document.getElementById("bonusFromFamilies").innerHTML = round3(bonusFromFam);
				}
			}
		}
	}
	if(placeAmounts[0] > territory) {
		placeAmounts[0] = territory;
	}
	updatePlaceVisuals()
}

rateReduction = .0999999;
function handleSpawnRates() {
	//rateReduction = 0;
	soldierSpawnRate -= rateReduction;
	if(soldierSpawnRate <= 0) {
		j = Math.floor(Math.random() * linesEnabled)
		addUnit("soldier", j, "right", Math.floor(spawnAmounts[0]*bonusFromFam));
		soldierSpawnRate += spawnRate[0];
	}
	spearSpawnRate -= rateReduction;
	if(spearSpawnRate <= 0) {
		j = Math.floor(Math.random() * linesEnabled)
		addUnit("spear", j, "right",  Math.floor(spawnAmounts[1]*bonusFromFam));
		spearSpawnRate += spawnRate[1];
	}
	enemySpawnRate -= rateReduction;
	if(enemySpawnRate <= 0) {
		enemySpawnRate = maps[stage][4];
		for(j = 0; j < linesEnabled; j++) {
			addUnit("soldier", j, "left", Math.floor(enemySpawnAmounts[1]));
			addUnit("spear", j, "left", Math.floor(enemySpawnAmounts[2]))
		}
		for(j = 0; j < enemySpawnAmounts.length; j++) {
			enemySpawnAmounts[j] += enemySpawnRateIncrease[j]
			enemySpawnRateIncrease[j] += maps[stage][11][j]
		}
	}
	updateSpawnTimers()
}

function moveUnits() {
	for(y = 0; y < units.length; y++) {
		for(x = 0; x < units[y].length; x++) {
			if(units[y][x].engaged.length === 0) {
				if(units[y][x].shouldMove)
					units[y][x].pos += unitValues[units[y][x].typeNum][2] * (units[y][x].direction != "right" ? -1 : 1);
			}
			updateUnitPos(y, x)
		}
	}
}

function checkForUnitAtEnds() {
	for(y = 0; y < units.length; y++) {
		for(x = 0; x < units[y].length ; x++) { //handle killing fences and walls
			if(units[y][x].direction === "right") {
				if(enemyFenceHealth > 0 && units[y][x].pos > 85.5-units[y][x].range) { //right fence
					units[y][x].shouldMove = 0
				} else {
					units[y][x].shouldMove = 1
				}
				if(enemyFenceHealth <= 0 && units[y][x].pos > 89-units[y][x].range) { //right wall
					units[y][x].shouldMove = 0
				}
			}
			else if(units[y][x].direction != "right") {
				if(fenceHealth > 0 && units[y][x].pos < units[y][x].range-.5) { //left fence
					units[y][x].shouldMove = 0
				} else {
					units[y][x].shouldMove = 1
				}
				if(fenceHealth <= 0 && units[y][x].pos < units[y][x].range-4) { //left wall
					units[y][x].shouldMove = 0
				}
			}
		}
	}
}

function handleDamageAtEnds() {
	for(y = 0; y < units.length; y++) {
		for(x = 0; x < units[y].length ; x++) { //handle killing fences and walls
			if(units[y][x].direction === "right") {
				if(enemyFenceHealth > 0 && units[y][x].pos > 85.5-units[y][x].range) { //right fence
					units[y][x].shouldAttack = 0
					if(units[y][x].type == "spear" && units[y][x].attackCounter === 3) drawSpearLine2(units[y][x]);
					if(units[y][x].getDamageRoll()) {
						enemyFenceHealth-=units[y][x].unitCount;
						if(enemyFenceHealth <= 0) {
							document.getElementById("enemyFence").style.display = 'none';
							document.getElementById("enemyFenceHealth").style.display = 'none';
						}
					}
				} else {
					units[y][x].shouldAttack = 1
				}
				if(enemyFenceHealth <= 0 && units[y][x].pos > 89-units[y][x].range) { //right wall
					units[y][x].shouldAttack = 0
					if(units[y][x].type == "spear" && units[y][x].attackCounter === 3) drawSpearLine2(units[y][x]);
					enemyWallHealth -= units[y][x].getDamageRoll()
				}
			}
			else if(units[y][x].direction != "right") {
				if(fenceHealth > 0 && units[y][x].pos < units[y][x].range-.5) { //left fence
					units[y][x].shouldAttack = 0
					if(units[y][x].getDamageRoll()) {
						fenceHealth-=units[y][x].unitCount;
						if(fenceHealth <= 0) {
							document.getElementById("fence").style.display = 'none';
							document.getElementById("fenceHealth").style.display = 'none';
						}
					}
					
				} else {
					units[y][x].shouldAttack = 1
				}
				if(fenceHealth <= 0 && units[y][x].pos < units[y][x].range-4) { //left wall
					units[y][x].shouldAttack = 0
					wallHealth -= units[y][x].getDamageRoll()
				}
			}
		}
	}
	
	checkDoneStage()
	updateWallHealthVisuals()
}

function checkForUnitCollisions() {
	triggerForDelete=[];
	for(y = 0; y < units.length; y++) {
		for(x = 0; x < units[y].length ; x++) { //unit i'm using
			breakOuter = 0
			for(z = 0; z < units.length; z++) {
				for(w = 0; w < units[z].length; w++) { //unit i'm comparing against
					if(y == z && w == x) //same unit, continue
						continue
					test = 0
					for(i = 0; i < triggerForDelete.length; i++) { //without this, units merging kills both of them (?)
						if(triggerForDelete[i].equals(units[y][x])) {
							breakOuter = 1
							test = 1
							break
						}
					}
					if(test) {
						continue;
					}
					for(i = 0; i < units[y][x].engaged.length; i++) { //if i'm already engaged with the target, next target
						if(units[y][x].engaged[i].equals(units[z][w])) {
							test = 1
							break
						}
					}
					if(test) {
						continue;
					}
					//Ranged: (to hit multiple rows)
					if(units[y][x].type=="spear") {
						if((Math.abs(y-z)<=1)&&units[z][w].direction != units[y][x].direction) {
							difference = Math.abs(units[y][x].pos - units[z][w].pos)
							if(difference < units[y][x].range && difference > 2) {
								units[y][x].engaged.push(units[z][w])
							}
						}
					}
					//Melee:
					if(z != y) //not on the same level = continue
						continue
					if(units[z][w].direction == units[y][x].direction) { //join units of the same type
						if(Math.abs(units[y][x].pos - units[z][w].pos) <= 1.5 && units[z][w].type===units[y][x].type) {
							if(units[y][x].id > units[z][w].id) continue //if yx is the earlier one, take the merge
							//average the units together
							newUnitCount = units[y][x].unitCount+units[z][w].unitCount;
							healthToChange = (units[z][w].actualMaxHealth - units[z][w].curHealth)/newUnitCount
							units[y][x].damage = (units[y][x].damage*units[y][x].unitCount+units[z][w].unitCount*units[z][w].damage)/(units[y][x].unitCount+units[z][w].unitCount)
							units[y][x].maxHealth = (units[y][x].maxHealth*units[y][x].unitCount+units[z][w].unitCount*units[z][w].maxHealth)/(units[y][x].unitCount+units[z][w].unitCount)
							units[y][x].actualMaxHealth = (units[y][x].actualMaxHealth*units[y][x].unitCount+units[z][w].unitCount*units[z][w].actualMaxHealth)/(units[y][x].unitCount+units[z][w].unitCount)
							if(units[y][x].curHealth > units[y][x].maxHealth) units[y][x].curHealth = units[y][x].maxHealth
							units[y][x].unitCount=newUnitCount
							if(units[y][x].actualMaxHealth - units[y][x].curHealth <= 1) {
								units[y][x].curHealth = 1;
								units[y][x].actualMaxHealth -= healthToChange
								
							} else {
								units[y][x].actualMaxHealth -= healthToChange
								units[y][x].takeDamage(healthToChange)
							}
							document.getElementById("count"+units[y][x].id).innerHTML = units[y][x].unitCount
							if(units[z][w].id === curClickedUnit) {
								hoverAUnit(units[y][x].id)
							}
							triggerForDelete.push(units[z][w])
						}
					}
					else if(units[y][x].type=="soldier" && Math.abs(units[y][x].pos - units[z][w].pos) <= units[y][x].range) { //soldier
						units[y][x].engaged.push(units[z][w]);
					}
				}
				if(breakOuter)
					break;
			}
			if(breakOuter)
				break;
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
			if(units[y][x].curHealth > 0 && units[y][x].engaged.length > 0 && units[y][x].shouldAttack) {
				bestTargetPos = 0;
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
						bestTargetPos = i
					}
				}
				//disengage if the unit is too far away.
				engageTarget = units[y][x].engaged[bestTargetPos];
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
				handleDeadUnit(engageTarget)
				//console.log("x:"+x)
			}
		}
	}
}

function handleDeadUnit(target) {
	if(target.curHealth <= 0) {
		updateGoldVisual()
		updateDeadUnitBonus()
		if(target.id == curClickedUnit) {
			removeHover()
		}
		disengageAll(target)
		removeUnit(target, target.direction!="right")
	}
	else {
		tempHealth = (target.curHealth / target.maxHealth * 100)
		document.getElementById("healthBar"+target.id).style.width = tempHealth>100?100:tempHealth + "%";
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
	theParent = elem.parentNode
	theParent.parentNode.removeChild(theParent);
	
	for(g = 0; g < units.length; g++) {
		for(h = units[g].length - 1; h >= 0; h--) {
			if(unit.equals(units[g][h])) {
				//console.log('removing2: ' + units[g][h].id + " on " + totalTicks)
				units[g].splice(h, 1)
			}
		}
	}
}

function checkDoneStage() {
	//victory
	if(enemyWallHealth <= 0) {
		territory += mapTimers[stage]>0?maps[stage][1]/5:maps[stage][1]
		if(mapTimers[stage] === 0) mapTimers[stage] += maps[stage][7]
		updateTerritoryVisual()
		higheststageUnlocked = stage+1 > higheststageUnlocked ? stage+1 : higheststageUnlocked;
		createMapSpace()
		startANewstage()
	}
	//loss
	if(wallHealth <= 0) {
		startANewstage()
	}
	updateWallHealthVisuals()
}

function addUnit(type, line, direction, unitCount) {
	if(unitCount <= 0) {
		return
	}
	if(direction == "right") {
		pos = -8
		goldWorth = 0
	}
	else {
		pos = 90
		if(type == "soldier") {
			goldWorth = maps[stage][0]
		}
		if(type == "spear") {
			goldWorth = maps[stage][0]*2
		}
	}
	theNewUnit = new Unit(line, pos, type, direction, unitCount, goldWorth);
	units[line].push(theNewUnit);
	//console.log("just added"+(globalId - 1))
	newUnitDiv(theNewUnit)
	updateUnitPos(line, (units[line].length-1));
}

function updateDeadUnitBonus() {
	for(m = 0; m < totalDead.length; m++) {
		deadUnitBonus[m] = totalDead[m]/1000+1
	}
	if(curUnitScreen == "-1") return
	document.getElementById("deadUnitBonus"+curUnitScreen).innerHTML = round3(deadUnitBonus[curUnitScreen])
	document.getElementById("totalDead"+curUnitScreen).innerHTML = totalDead[curUnitScreen]
	document.getElementById("buy1").innerHTML=round2(unitValues[curUnitScreen][0]*deadUnitBonus[curUnitScreen])
	document.getElementById("buy4").innerHTML=round2(unitValues[curUnitScreen][3]*deadUnitBonus[curUnitScreen])
	
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

function getUnitById(id) {
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

function convertSecToMin(sec) {
	part1 = Math.floor(sec / 60)+":"
	part2 = sec%60<10?"0"+sec%60:sec%60+""
	return part1+part2
}