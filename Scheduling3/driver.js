
//the answer to "how to i access scope variables from console"
//angular.element($0).scope()


var app = angular.module('myApp', []);

app.controller('myCtrl', function($scope, $interval, $compile) {
  
  $scope.tick = function() {
    var researchGain = $scope.cellGrid.tick()
    $scope.research.add(researchGain);
    $scope.research.tick();
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
  }
  
  $scope.addCellToColumn = function(column) {
    $scope.addDiv($scope.cellGrid.addNewCell(column).div, '#cellGrid');
  }
  
  $scope.addDiv = function(div, id) {
    var newDirective = angular.element(div);
    $(id).append(newDirective);
    $compile(newDirective)($scope);
  }
  
  $scope.research = new Research();
  $scope.cellGrid = new CellGrid();
  $scope.addDiv($scope.research.div, '#page');
  $scope.addDiv($scope.cellGrid.div, '#page');
  $scope.addDiv($scope.research.addUpgradeButton().div, '#research')
  $scope.addDiv($scope.research.addUpgradeButton().div, '#research')
  $scope.addCellColumn();
  
  
  stop = 0
	msWaitTime = 1000 //doesn't wait decimal amounts
	$interval(function() { if(!stop) $scope.tick(); }, msWaitTime);
});