//angular.element($0).scope().progress

var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope, $interval, $compile) {
	{//----------------Declarations------------------ AKA vars that need a start but no default, ang or not.
		$scope.progress = []
		timeList = [];
		timer = tickTemp1 = totalTicks = 0;
		multFromFps=1
		stop=0 //type stop=1 in console to pause the game. If you do it often, put a button on the action or make it hotkeyed to the 'space' key. (example in manualactions.js)
	}
	{//------------Initial Variable Settings-----------

		//not public-facing game vars
		rowTimeRateStarting = .01
		maxRows=7;
		
		//ang both game & graphics vars
		$scope.theResource=8
		$scope.costBuyRow=5
		$scope.secondsBoost=1
		$scope.costSecondsBoost=200
		$scope.carryOverRate =0
		$scope.costCarryOver=400
		$scope.gainAll=5
		$scope.costGainAll=200
		$scope.gainFirst=40
		$scope.costGainFirst=10
		
		//debug vars. Comment these out to play how I intend
		rowTimeRateStarting = .2
		maxRows=28;
	}

	{//----------------Starting Point-----------------
	
	$scope.tick = function() {
		timer++
		timeList.push(new Date().getTime())
		if(timeList.length > 100) {
			timeList.splice(0, 1)
			
			$scope.fps = 50/calcAverageTime()*10
			multFromFps = 100/$scope.fps
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
	
	
	}


	{//--------------ng-OnClick Methods-------------
		$scope.buyPrcCarryover = function() {
			if($scope.theResource >= $scope.costCarryOver) {
				$scope.costCarryOver= Math.ceil(1.1* $scope.costCarryOver) //cost increase
				$scope.theResource-= $scope.costCarryOver //cost
				
				//increase a var when you click the button
				$scope.carryOverRate++
			}
		}
		$scope.buySecondsBoost = function() {
			if($scope.theResource >= $scope.costSecondsBoost) {
				$scope.costSecondsBoost= Math.ceil(1.1* $scope.costSecondsBoost) //cost increase
				$scope.theResource-= $scope.costSecondsBoost //cost
				
				//increase a var when you click the button
				$scope.secondsBoost++
			}
		}
		$scope.buyProgressBar = function() {
			if($scope.theResource >= $scope.costBuyRow) {
				$scope.costBuyRow= Math.ceil(1.1* $scope.costBuyRow) //cost increase
				$scope.theResource-= $scope.costBuyRow //cost
				
				//increase a var when you click the button
				$scope.addProgressBar()
			}
		}
		$scope.buyGainFirst = function() {
			if($scope.theResource >= $scope.costGainFirst) {
				$scope.costGainFirst= Math.ceil(1.1* $scope.costGainFirst) //cost increase
				$scope.theResource-= $scope.costGainFirst //cost
				
				//increase a var when you click the button
				$scope.gainFirst+=3
			}
		}
		$scope.buyGainAll = function() {
			if($scope.theResource >= $scope.costGainAll) {
				$scope.costGainAll= Math.ceil(1.1* $scope.costGainAll) //cost increase
				$scope.theResource-= $scope.costGainAll //cost
				
				//increase a var when you click the button
				$scope.gainAll++
			}
		}
	}
	{//----------------Object Classes-----------------
		{//---------------Progress Bar Row---------------
			//all unique info about a single progress bar (row) is represented here
		}
		
	}
	{//-------------Application Functions--------------
		$scope.updateProgressForAllRows = function() {
			for(lx = 0; lx < $scope.progress.length ; lx++) {
				$scope.updateRowProgress(lx)
			}
		}
		
		$scope.updateRowProgress = function(row) { //main game progress
			rowTimeRate = rowTimeRateStarting * multFromFps;
			$scope.progress[row]-=rowTimeRate
			if($scope.progress[row] <= 0) {
				$scope.theResource+=$scope.gainAll
				$scope.progress[row] += 100
				if(row==0) {
					$scope.theResource+=$scope.gainFirst
				} else if(row != 0) {
					$scope.progress[row-1]-=$scope.carryOverRate
				}
			}
		}
		
		$scope.addProgressBar = function() { //add progress bar (both data and UI)
			$scope.addProgressBarData()
			$scope.addProgressBarUI()
		}
		$scope.addProgressBarData = function() { //add progress bar data (UI is in UI section)
			$scope.progress.push(100)
			//TODO make more data initially, data-driven it
		}
	
	}
		
	{//--------------Graphics Functions---------------
		
		
		
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
		
		/*Parameters:
		@buttonText - the text to appear on the button
		@topNumVarName - the number displayed at the top of the button container
		@topNumColor - the color of displayed topNumVar
		@onClickFunctionName - the name of the function to put in the ng-click. "hello" becomes ng-click="hello()"
		@costVarName - the name of the cost amount variable
		@botNumColor - the color of displayed costVar
		*/
		$scope.addBuyButtonTemplate = function(buttonText, topNumVarName, 
			topNumColor, onClickFunctionName, costVarName, botNumColor) {
			
			//make an element
			var newDirective = angular.element(
			"<div class='buttonContainer'>"+
				"<div class='resource hyperVisible' style='color:"+topNumColor+"'>{{"+topNumVarName+"}}</div>"+
				"<button class='buyButton' ng-click='"+onClickFunctionName+"()'>"+buttonText+"</button>"+
				"<div class='middleLabel'>It costs <div class='countCost hyperVisible' style='color:"+botNumColor+"'>{{"+costVarName+"}}</div></div>"+
			"</div>"
			);
			$("#buttons").append(newDirective); //add the element
			$compile(newDirective)($scope); //re-compile (so it picks up the angular vars)
		}
	}
	{//--------------Initial Graphics Load--------------
		//This stuff really belongs in a database
		//function calls are required to be after variable declarations
		$scope.addBuyButtonTemplate("Buy % Carryover", 	"carryOverRate", 	"blue", 	"buyPrcCarryover", 		"costCarryOver", 			"red")
		$scope.addBuyButtonTemplate("Seconds of Boost", 	"secondsBoost", 	"blue", 	"buySecondsBoost", 	"costSecondsBoost", 	"red")
		$scope.addBuyButtonTemplate("Buy Progress Bar", 	"theResource", 		"red", 	"buyProgressBar", 		"costBuyRow", 				"red")
		$scope.addBuyButtonTemplate("Gain for First", 		"gainFirst", 			"blue", 	"buyGainFirst", 				"costGainFirst", 			"red")
		$scope.addBuyButtonTemplate("Gain for All", 			"gainAll", 				"blue", 	"buyGainAll", 				"costGainAll", 				"red")
	}




	{//---------------Helper Functions----------------- AKA Not specific to this game
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

		function formatNumber(num) {
			return Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		}
	}
	
	
	{//----The Timer----
	//this way doesn't work when javascript is open in a different tab
	//javascript will default change the 5 to minimum 500 in that case
	//use interval.js somehow to get around it. google that along with angular?
	$interval(function() { if(!stop) $scope.tick(); }, 5);
	}
});