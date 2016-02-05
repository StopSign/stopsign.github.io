
//angular.element($0).scope().progress
//general vars
started = 0
timeList = [];
totalTicks = 0
timer = 0;
lagHandler=1


//game important vars
rowTimeRateStarting = .2

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
	$scope.carryOverRate =0
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
		if(justSpliced) {
			fps = 50/calcAverageTime()*10
			lagHandler = 100/fps
			document.getElementById("fps").innerHTML = formatNumber(fps)+"% fps";
			//TODO Reduce the lag, don't just compensate for it.
		}
		
		$scope.updateProgressForAllRows()
		
		//manual addition to give starting rows
		if(maxRows > 0 && timer - tickTemp1 >= 5) {
			$scope.addProgressBar()
			maxRows--;
			tickTemp1 = timer
		}
	}
	//--------------------------------------------------
	//--------------application functions------------
	//--------------------------------------------------
	
	$scope.updateProgressForAllRows = function() {
		for(lx = 0; lx < $scope.progress.length ; lx++) {
			$scope.updateRowProgress(lx)
		}
	}
	
	//main game progress
	$scope.updateRowProgress = function(row) {
		rowTimeRate = rowTimeRateStarting * lagHandler;
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
		$scope.addProgressBarData()
		$scope.addProgressBarUI()
	}
	$scope.addProgressBarData = function() {
		$scope.progress.push(100)
		//TODO make more data initially, data-driven it
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
			$scope.addProgressBar()
			//cost & cost increase
			$scope.count=$scope.count-$scope.cost
			$scope.cost=round2(1.1*$scope.cost)
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
	
	
	
	$scope.addProgressBarUI = function() {
		extraClass = extraClass2 = ""
		curRowCount = $scope.progress.length
		if(curRowCount==1) {
			extraClass = "firstProgressOuter"
			extraClass2 = "firstProgressInner"
		}
		
		var newDirective = angular.element(
		"<div class='progressOuter "+extraClass+"'>"+
			"<div id='progressInner"+(curRowCount-1)+"' class='progressInner "+extraClass2+"'"+
				"style='width:{{progress["+(curRowCount-1)+"]}}%'>"+
			"</div>"+
		"</div>"
		);
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
//-------------------General Utilities---------------
//--------------------------------------------------
//Are found at /generalHelpers.js
