
//the answer to "how to i access scope variables from console"
//angular.element($0).scope()


var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope, $interval, $compile) {
  
  $scope.tick = function() {
    curTick++
    if(curTick >= ticksPerSecond) { //triggers once a second
    // if(curTick >= 0) { //debug
      curTick = 0;
      $scope.gardenWall.tick($scope.resources);
      $scope.cellGrid.tick($scope.resources, $scope.resources.gardenBonus)
      $scope.research.add($scope.resources.researchGain);
      $scope.research.tick();
      
      if($scope.harvestUnlocked) {
        var isHarvesting = $scope.harvest.tick();
        if(isHarvesting) {
          $scope.resources.souls += $scope.cellGrid.harvest();
        }
        
        $scope.resources.tick(); //all except science
        var amountToClick = $scope.robots.tick($scope.resources)
        for(var x = 0; x < amountToClick; x++) {
          $scope.clickAll();
        }
        
      }
    }
  }
  
  $scope.clickUpgrade = function(id, action) {
    if($scope.research.clicked(id)) {
      eval(action);
    }
  }
  
  $scope.clickCell = function(column, row) {
    $scope.cellGrid.clicked(column, row)
  }
  
  $scope.clickAll = function() {
    $scope.cellGrid.clickAll()
  }
  
  $scope.addCellColumn = function() {
    var column = $scope.cellGrid.grid.length
    $scope.addDiv($scope.research.addNewCellButton(column).div, '#research');
    $scope.addDiv($scope.cellGrid.addNewCell(column).div, '#cellGrid');
    checkUnlockHarvest($scope, column);
  }
  
  $scope.addCellToColumn = function(column) {
    $scope.addDiv($scope.cellGrid.addNewCell(column).div, '#cellGrid');
  }
  $scope.addGarden = function() {
    var garden = $scope.gardenWall.addNewGarden();
    // $scope.addDiv(garden.div, '#gardenWall');
  }
  
  $scope.addDiv = function(div, id) {
    var newDirective = angular.element(div);
    $(id).append(newDirective);
    $compile(newDirective)($scope);
  }
  $scope.unlockGarden = function() {
    $scope.unlockGardens = true;
  }
  
  $scope.unlockGardens = true;
  //State initialize
  $scope.research = new Research();
  $scope.cellGrid = new CellGrid();
  $scope.harvest = new Harvest();
  $scope.resources = new Resources();
  $scope.robots = new Robots();
  $scope.gardenWall = new GardenWall();
  
  //Component add
  $scope.addDiv($scope.research.div, '#cities');
  $scope.addDiv($scope.cellGrid.div, '#cities');
  $scope.addDiv($scope.harvest.div, '#technology');
  $scope.addDiv($scope.resources.div, '#technology');
  $scope.addDiv($scope.robots.div,  '#technology');
  $scope.addDiv($scope.research.addUpgradeButton().div, '#research')
  $scope.addDiv($scope.research.addUpgradeButton().div, '#research')
  $scope.addDiv($scope.gardenWall.div, '#garden');
  
  //GUI initialize
  $scope.harvest.initialize();
  
  //Game start
  $scope.addCellColumn();
  $scope.addGarden();
  // $scope.addGarden();
  // $scope.addGarden();
  
  //
$scope.intToStringRound = function(value) {
  if (value>=10000)
  {
    value=Math.round(value);
    var suffixes = ["", "K", "M", "B","T","C","Q","S"];
    var suffixNum = Math.floor(((""+value).length-1)/3);
    var shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000,suffixNum)) : value).toPrecision(3));
    if (shortValue % 1 != 0)  shortNum = shortValue.toFixed(1);
    return shortValue+suffixes[suffixNum];
  }
  else {
    return Math.floor(value);
  }
};
  
  stop = 0;
	var msWaitTime = 100; //one second
  var ticksPerSecond = 1000 / msWaitTime;
  var curTick = 0;
	$interval(function() { if(!stop) $scope.tick(); }, msWaitTime);
});