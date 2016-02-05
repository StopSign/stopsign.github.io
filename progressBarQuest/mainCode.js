
//angular.element($0).scope().progress
//general vars
started = 0
timeList = [];
totalTicks = 0
timer = 0;
lagHandler=1
lagTimer = 0



//game important vars
rowTimeRate = .2*lagHandler

//custom vars to debug
maxRows=28;

var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope, $interval, $compile) {
	//ang vars
	$scope.progress = []
	//ang game vars
	$scope.count=8
	$scope.cost=5
	$scope.secondsBoost=1
	$scope.costSecondsBoost=200
	$scope.carryOverRate =20
	$scope.costCarryOver=400
	$scope.gainAll=5
	$scope.costGainAll=200
	$scope.gainFirst=40
	$scope.costGainFirst =10
	tickTemp1 = timer;
	
	$scope.tick = function() {
		justSpliced = 0
		timer++
		timeList.push(new Date().getTime())
		if(timeList.length > 100) {
			timeList.splice(0, 1)
			justSpliced = 1
		}
		if(lagTimer-timer >= 0) {
			return;
		}
		if(justSpliced) {
			fps = 50/calcAverageTime()*10
			lagHandler = 100/fps
			document.getElementById("fps").innerHTML = round(fps)+"% fps";
			console.log(fps+" and "+lagHandler)
			if(fps < 80)
				lagTimer=timer+2
		}
		
		$scope.checkAllRows()
		
		//manual addition to give starting rows
		if(maxRows > 0 && timer - tickTemp1 >= 5) {
			$scope.addAndRefreshProgressBar()
			maxRows--;
			tickTemp1 = timer
		}
	}
	//--------------------------------------------------
	//--------------application functions------------
	//--------------------------------------------------
	
	$scope.checkAllRows = function() {
		for(lx = 0; lx < $scope.progress.length ; lx++) {
			$scope.checkRowProgress(lx)
		}
	}
	
	//main game progress
	$scope.checkRowProgress = function(row) {
		$scope.progress[row]-=rowTimeRate
		if($scope.progress[row] <= 0) {
			$scope.count+=$scope.gainAll
			$scope.progress[row] += 100
			if(row==0) {
				$scope.count+=$scope.gainFirst
			} else if(row != 0) {
				$scope.progress[row-1]-=$scope.carryOverRate
			}
		}
	}
	$scope.addProgressBar = function() {
		$scope.progress.push(100)
	}
	
	//--------------------------------------------------
	//--------------buyButtonClicks-----------------
	//--------------------------------------------------
	
	$scope.buyPrcCarryover = function() {
		if($scope.count >= $scope.costCarryOver) {
			//increase a var when you click the button
			console.log('buying Prc Carryover');
			$scope.carryOverRate++
			//cost & cost increase
			$scope.count=$scope.count-$scope.costCarryOver
			$scope.costCarryOver=Math.ceil(1.1*$scope.costCarryOver)
		}
	}
	$scope.buySecondsBoost = function() {
		if($scope.count >= $scope.costSecondsBoost) {
			//increase a var when you click the button
			console.log('buying Seconds Boost');
			$scope.secondsBoost++
			//cost & cost increase
			$scope.count=$scope.count-$scope.costSecondsBoost
			$scope.costSecondsBoost=Math.ceil(1.1*$scope.costSecondsBoost)
		}
	}
	$scope.buyProgressBar = function() {
		if($scope.count >= $scope.cost) {
			//increase a var when you click the button
			console.log('buying progress bar');
			$scope.addAndRefreshProgressBar()
			//cost & cost increase
			$scope.count=$scope.count-$scope.cost
			$scope.cost=Math.ceil(1.1*$scope.cost)
		}
	}
	$scope.buyGainFirst = function() {
		if($scope.count >= $scope.costGainFirst) {
			//increase a var when you click the button
			console.log('buying Gain First');
			$scope.gainFirst+=3
			//cost & cost increase
			$scope.count=$scope.count-$scope.costGainFirst
			$scope.costGainFirst=Math.ceil(1.1*$scope.costGainFirst)
		}
	}
	$scope.buyGainAll = function() {
		if($scope.count >= $scope.costGainAll) {
			//increase a var when you click the button
			console.log('buying Gain All');
			$scope.gainAll++
			//cost & cost increase
			$scope.count=$scope.count-$scope.costGainAll
			$scope.costGainAll=Math.ceil(1.1*$scope.costGainAll)
		}
	}
	
	//--------------------------------------------------
	//--------------graphics functions---------------
	//--------------------------------------------------
	
	
	$scope.addAndRefreshProgressBar = function() {
		$scope.addProgressBar()
		$scope.refreshProgressBar()
	}
	$scope.refreshProgressBar = function() {
		extraClass = ""
		extraClass2=""
		if($scope.progress.length==1) {
			extraClass = "firstProgressOuter"
			extraClass2 = "firstProgressInner"
		}
		var newDirective = angular.element("<div class='progressOuter "+extraClass+"'>"+
		"<div id='progressInner"+($scope.progress.length-1)+"' class='progressInner "+extraClass2+"'"+
		"style='width:{{progress["+($scope.progress.length-1)+"]}}%'></div></div>");
		$("#progressBars").append(newDirective);
		$compile(newDirective)($scope);
	}
	
	//this is the main thing that keeps the timer running
	//this way doesn't work when javascript is open in a different tab
	//javascript will default change the 5 to minimum 500 in that case
	//google the way to get around this, it's easy
	$interval(function() { if(!stop) $scope.tick(); }, 5);
});
stop=0

//--------------------------------------------------
//--------------General Utilities---------------
//--------------------------------------------------
	

function calcAverageTime() {
	total = 0;
	for(x = 1; x < timeList.length; x++) {
		total += timeList[x] - timeList[x-1]
	}
	return total / timeList.length
}

function round3(num) {
	return Math.floor(num*1000)/1000
}
function round2(num) {
	return Math.floor(num*100)/100
}
function round1(num) {
	return Math.floor(num*10)/10
}


