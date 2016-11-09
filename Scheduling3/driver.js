
//the answer to "how to i access scope variables from console"
//angular.element($0).scope()


var app = angular.module('myApp', []);

app.controller('myCtrl', function($scope, $interval, $compile) {
  
  $scope.cellGrid = [[]]
  $scope.cellGrid[0].push(new Cell(0, 0));
  $scope.cellGrid[0].push(new Cell(0, 1));
  
  for(var x = 0; x < $scope.cellGrid.length; x++) {
    for(var y = 0; y < $scope.cellGrid[x].length; y++) {
      var newDirective = angular.element($scope.cellGrid[x][y].div); 
      $('#cellGrid').append(newDirective);
      $compile(newDirective)($scope);
    }
  };
  
  $scope.tick = function() {
    for(var x = 0; x < $scope.cellGrid.length; x++) {
      for(var y = 0; y < $scope.cellGrid[x].length; y++) {
        $scope.cellGrid[x][y].tick()
      }
    }
  }
  
  $scope.clickCell = function(row, column) {
    $scope.cellGrid[row][column].clicked() 
  }
  
  stop = 0
	msWaitTime = 1000 //doesn't wait decimal amounts
	$interval(function() { if(!stop) $scope.tick(); }, msWaitTime);
});