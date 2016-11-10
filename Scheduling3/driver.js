
//the answer to "how to i access scope variables from console"
//angular.element($0).scope()


var app = angular.module('myApp', []);

app.controller('myCtrl', function($scope, $interval, $compile) {
  
  $scope.cellGrid = new CellGrid();
  $scope.cellGrid.addNewCell(0, 0)
  $scope.cellGrid.addNewCell(1, 0)
  $scope.cellGrid.addNewCell(2, 0)
  $scope.cellGrid.addNewCell(3, 0)
  $scope.cellGrid.addNewCell(4, 0)
  
  $scope.cellGrid.addNewCell(0, 1)
  $scope.cellGrid.addNewCell(1, 1)
  $scope.cellGrid.addNewCell(2, 1)
  $scope.cellGrid.addNewCell(3, 1)
  
  $scope.cellGrid.addNewCell(0, 2)
  $scope.cellGrid.addNewCell(1, 2)
  $scope.cellGrid.addNewCell(2, 2)
  
  $scope.cellGrid.addNewCell(0, 3)
  $scope.cellGrid.addNewCell(1, 3)
  
  $scope.cellGrid.addNewCell(0, 4)
  
  $scope.tick = function() {
    $scope.cellGrid.tick()
  }
  
  $scope.clickCell = function(row, column) {
    $scope.cellGrid.clicked(row, column)
  }
  $scope.clickAll = function() {
    $scope.cellGrid.clickAll()
  }
  $scope.cellGrid.addToAngular($scope, $compile)
  
  
  stop = 0
	msWaitTime = 1000 //doesn't wait decimal amounts
	$interval(function() { if(!stop) $scope.tick(); }, msWaitTime);
});