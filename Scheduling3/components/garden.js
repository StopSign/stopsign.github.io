function Garden(name, timeNeededGrowth, robotCapStart, robotCapGrowth, id) {
  this.gain = 1;
  this.amount = 1;
  if(!id) {
    this.amount = 0;
  }
  this.robotWorkers = 0;
  this.robotWorkerCap = robotCapStart * Math.pow(robotCapGrowth, id);
  this.currentTime = 0;
  this.id = id;
  this.name = name;
  
  this.tick = function() {
    this.currentTime += this.robotWorkers;
    if(this.currentTime >= this.timeNeeded) {
      this.currentTime -= this.timeNeeded;
      this.amount += this.gain;
    }
    this.progress = this.currentTime / this.timeNeeded*100;
  }
  
  this.updateTimeNeeded = function(timeNeededGrowth, id) {
    this.timeNeeded = Math.pow(timeNeededGrowth, id)*40;
  }
  this.updateTimeNeeded(timeNeededGrowth, id);
  
  //sets workesr and returns how many it used
  this.setWorkers = function(workers) {
    if(workers < this.robotWorkerCap) {
      this.robotWorkers = workers;
    } else {
      this.robotWorkers = this.robotWorkerCap;
    }
    return this.robotWorkers;
  }
  
  this.changeWorkers = function(delta) {
    //TODO link to actual robots
    var startingBots = this.robotWorkers
    this.robotWorkers += delta;
    if(this.robotWorkers > this.robotWorkerCap) {
      this.robotWorkers = this.robotWorkerCap;
    } else if(this.robotWorkers < 0)  {
      this.robotWorkers = 0;
    }
    return this.robotWorkers - startingBots;
  }
  
  var grid = "gardenWall.gardens["+this.id+"]";
  var subFromTop = this.id*-30;
  
  this.div = "<div id='garden"+id+"' class='gardenContainer' style='top:"+subFromTop+"px'>"+
    "<div class='text' style='font-size:14px;' >{{"+grid+".robotWorkers}}</div>"+
    "<div class='plusButton noselect' ng-click='"+grid+".changeWorkers(1)'>+</div>"+
    "<div class='plusButton noselect' ng-click='"+grid+".changeWorkers(-1)'>-</div>"+
    "<div class='gardenProgressBar'>"+
      "<div class='text gardenName'>{{"+grid+".name}}</div>"+
      "<div class='gardenInnerProgressBar' style='width:{{"+grid+".progress}}%'></div>"+
    "</div>"+
    "<div class='text gardenAmount'>{{intToStringRound("+grid+".amount)}}</div>"+
  "</div>"
}