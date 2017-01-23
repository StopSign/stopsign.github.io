function checkUnlockHarvest(scope, gridColumns) {
	if(gridColumns == 1) {
    scope.harvestUnlocked = true;
	}
}

function checkRobotUnlocks(scope, robotCount) {
  if(robotCount >= 1) {
    scope.robotGardening = true;
  }
}