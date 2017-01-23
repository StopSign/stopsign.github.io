function Robots() {
  this.costSouls = this.costSoulsUI = 250;
  this.costElec = this.costElecUI = 5000;
  this.robotCounterNeeded = 240;
  this.robotCounter = 0;
  
  this.tick = function(resources) {
    this.costReady1 = resources.souls >= this.costSouls
    this.costReady2 = resources.electronics >= this.costElec
    this.costReady = this.costReady1 && this.costReady2
    
    this.robotCounter += resources.robots;
    var amountToClick = 0;
    while(this.robotCounter >= this.robotCounterNeeded) {
      this.robotCounter -= this.robotCounterNeeded;
      amountToClick++
    }
    return amountToClick;
  }
  
  this.buyRobot = function(resources, unlockGardenFunc) {
    if(resources.souls >= this.costSouls && resources.electronics >= this.costElec) {
      resources.souls -= this.costSouls;
      resources.electronics -= this.costElec;
      resources.robots++;
      this.costSoulsUI = intToStringRound(this.costSouls);
      this.costElecUI = intToStringRound(this.costElec);
      unlockGardenFunc();
    }
  }
  
  var robot = "robots"; //scope accessor
  
  this.div = "<div style='position:absolute;left:600px;'>"+
    "<div id='buyRobots' class='button noselect text buyButton' style='top:120px;' ng-class='{ pointer : "+robot+".costReady}' ng-click='"+robot+".buyRobot(resources, unlockGarden)'>"+
      "<div class='tCost1' ng-class='{ costReady : "+robot+".costReady1}'><div class='small'>-</div>{{"+robot+".costSoulsUI}}<img src='images/ghost.png' class='smallIcon'></div>"+
      "<div class='tCost2' ng-class='{ costReady : "+robot+".costReady2}'><div class='small'>-</div>{{"+robot+".costElecUI}}<img src='images/elec.png' class='smallIcon'></div>"+
      "<div class='tName'>Buy <img src='images/robot.png' class='largeIcon'></div>"+
      "<div class='tInfo'>Clicks all cities every 4 minutes</div>"+
    "</div>"+
    "<div class='text' style='font-size:11px;top:175px;position:absolute;width:200px;left:42px;'>Next click in {{"+robot+".robotCounterNeeded - "+robot+".robotCounter}}</div>"+
  "</div>"
}