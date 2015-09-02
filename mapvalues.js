//base gold, territory gain (enhanced), fence health, wall health, spawn timer, tower number, tower damage, cooldown on bonus, lane type index, 
//[9]unit count [boss, soldier, spear], unit growth per spawn [boss, soldier, spear], unit growth growth per spawn [boss, soldier, spear]

maps= [[1, 40, 35, 1800, 15, 0, 0, 60*30, 2, [0, 1, 0], [0, 0, 0], [0, 0, 0]],
		[2, 150, 900, 26000, 15, 0, 0, 60*32, 5, [0, 1.7, .76], [0, .35, .05], [0, .03, 0]],
		[3, 370, 1500, 70000, 15, 0, 0, 60*34, 3, [0, 6, 7], [0, .8, .7], [0, .04, .03]],
		[5, 800, 4000, 170000, 10, 0, 0, 60*36, 2, [0, 17, 35], [0, 3, 1], [0, .3, .1]],
		[8, 3000, 15, 6000, 45, 0, 0, 120*38, 1, [1, 0, 0], [1, 5, 0], [0, 0, 0]],
		[13, 1700, 3000, 400000, 15, 0, 0, 60*70, 6, [0, 15, 7], [0, .2, .2], [0, 0, 0]],
		[8, 1700, 3000, 400000, 15, 0, 0, 60*70, 5, [0, 15, 7], [0, .2, .2], [0, 0, 0]],
		[8, 1700, 3000, 400000, 15, 0, 0, 60*70, 5, [0, 15, 7], [0, .2, .2], [0, 0, 0]],
		[8, 1700, 3000, 400000, 15, 0, 0, 60*70, 5, [0, 15, 7], [0, .2, .2], [0, 0, 0]]
		]
function createMapSpace() {
	theString="<div id='mapInfo' class='mapInfo'>"+
	"<div class='mapInfoField'>Base Gold: <div id='baseGoldInfo' class='infoNum'>4f</div></div>"+
	"<div class='mapInfoField'>Territory Gain: <div id='territoryGainInfo' class='infoNum'>4f</div></div>"+
	"<div class='mapInfoField'>Fence Health <div id='fenceHealthInfo' class='infoNum'>4f</div></div>"+
	"<div class='mapInfoField'>Wall Health: <div id='wallHealthInfo' class='infoNum'>4f</div></div>"+
	"<div class='mapInfoField'>Spawn Timer: <div id='spawnTimerInfo' class='infoNum'>4f</div></div>"+
	"<div class='mapInfoField'>Lane Count: <div id='laneCountInfo' class='infoNum'>4f</div></div>"+
	"<div class='mapInfoField'>Total Units Spawning: <div id='totalUnitsSpawningInfo' class='infoNum'>4f</div></div>"+
	"<div class='mapInfoField'>Total Unit <br>Growth: <div id='totalUnitGrowthInfo' class='infoNum'>4f</div></div>"+
	"<button style='margin-left:43px' onclick='clickedStartMap()'>Start!</button>"+
	"</div>"
	num = 0
	for(l = 0; l < higheststageUnlocked+1; l++) {
		theString += "<div id='map"+l+"' class='map' onmouseover='updateMapInfo("+l+")'>"+l+"</div>"
		if((l+1)%5 === 0) {
			theString += "<br>"
			for(m = 0; m < 5; m++) {
				num = (m+l-4)
				theString += "<div class='timerContainer' id='timer"+(num++)+"'></div>"
			}
			theString += "<br>"
		}
	}
	theString += "<br>"
    for(m = 0; m < (higheststageUnlocked+1)%5; m++) {
		theString += "<div class='timerContainer' id='timer"+(num++)+"'></div>"
	}
	
	document.getElementById("mapSpace").innerHTML = theString
}

function updateMapInfo(num) {
	currentMapInfoNum = num;
	document.getElementById('mapInfo').style.display="inline-block"
	document.getElementById('mapInfo').style.left=212+201*(num%5)+'px';
	document.getElementById('mapInfo').style.top=20+130*(Math.floor(num/5))+'px';
	
	document.getElementById('territoryGainInfo').style.color=mapTimers[num]===0?'yellow':'black';
	
	document.getElementById('baseGoldInfo').innerHTML = maps[num][0]
	document.getElementById('territoryGainInfo').innerHTML = mapTimers[num]===0?maps[num][1]:maps[num][1]/5
	document.getElementById('fenceHealthInfo').innerHTML = maps[num][2]
	document.getElementById('wallHealthInfo').innerHTML = maps[num][3]
	document.getElementById('spawnTimerInfo').innerHTML = maps[num][4]
	document.getElementById('laneCountInfo').innerHTML = maps[num][8]
	document.getElementById('totalUnitsSpawningInfo').innerHTML = round2(maps[num][9][0] + maps[num][9][1] + maps[num][9][2])
	document.getElementById('totalUnitGrowthInfo').innerHTML = round2(maps[num][10][0] + maps[num][10][1] + maps[num][10][2])
}

function updateMapTimers() {
	if(currentMapInfoNum != -1) {
		document.getElementById('territoryGainInfo').style.color=mapTimers[currentMapInfoNum]===0?'yellow':'black';
		document.getElementById('territoryGainInfo').innerHTML = mapTimers[currentMapInfoNum]===0?maps[currentMapInfoNum][1]:maps[currentMapInfoNum][1]/5
		
	}
	document.getElementById("territoryGain").innerHTML = mapTimers[stage]>0?maps[stage][1]/5:maps[stage][1]
	for(m = 0; m < (higheststageUnlocked+1); m++) {
		if(mapTimers[m]===0) {
			document.getElementById("timer"+m).innerHTML = "<div class='timerReady'>Bonus Ready!</div>"
		}
		else {
			mapTimers[m]--;
			document.getElementById("timer"+m).innerHTML = "<div class='timer'>"+convertSecToMin(mapTimers[m])+"</div></div>"
		}
	}
}

function clickedStartMap() {
	stage = currentMapInfoNum
	startANewstage()
	switchMainTab(0)
}