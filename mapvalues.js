//base gold, territory gain (enhanced), fence health, wall health, spawn timer, tower number, tower damage, cooldown on bonus, lane type index, 
//[9]unit count [boss, soldier, spear], unit growth per spawn [boss, soldier, spear], unit growth growth per spawn [boss, soldier, spear]
//asdfasdfa
maps= [[1, 15, 150, 1800, 15, 0, 0, 60*30, 2, [0, 1, 0], [0, 0, 0], [0, 0, 0]],
		[3, 45, 600, 8000, 15, 0, 0, 60*32, 3, [0, 2.45, .31], [0, .07, .05], [0, 0, 0]],
		[5, 100, 2200, 50000, 15, 0, 0, 60*34, 5, [0, 3, .61], [0, .2, .09], [0, 0.002, 0]],
		[8, 800, 4000, 350000, 10, 0, 0, 60*36, 2, [0, 2, 1], [0, 1, .05], [0, .004, .003]],
		[12, 1700, 8000, 810000, 15, 0, 0, 60*38, 6, [0, 6, 4], [0, .2, 1], [0, .008, .004]],
		[16, 2900, 11000, 126000, 10, 0, 0, 60*40, 4, [0, 9, 12], [0, 1, 1], [0, .05, .03]],
		[13, 2900, 7000, 126000, 10, 0, 0, 60*40, 4, [0, 15, 15], [0, 2, 2], [0,  .1, .06]]]
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
	//TODO: Known issue, trying to display more than 4 maps causes an error
	//Formula!
	//Total goal: add N stage buttons in map where N = higheststageUnlocked+1
	//sub goal: only have 5 per level
	//tricky part: needs to work for all values of higheststageUnlocked
	//and there's css concerns about the 
	//NEW TODO: Clarify the problem
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
//http://imgur.com/Dc5yJOl
function clickedStartMap() {
	stage = currentMapInfoNum
	startANewstage()
	switchMainTab(0)
}