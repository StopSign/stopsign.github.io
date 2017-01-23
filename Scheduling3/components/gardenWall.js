function GardenWall() {
  this.gardens = [];
  this.bonus = 1;
  this.dataCounter = 0;
  
  this.addNewGarden = function() {
    var name = gardenData.names[this.dataCounter++];
    var newGarden = new Garden(name, gardenData.timeNeededGrowth, gardenData.robotCapStart, gardenData.robotCapGrowth, this.gardens.length);
    this.gardens.push(newGarden);
    //Subtract from gardenWall's top?
    return newGarden;
  }
  
  this.tick = function(resources) {
    for(var x = 0; x < this.gardens.length; x++) {
      this.gardens[x].tick();
      if(x == 0) {
        resources.gardenBonus = 1+this.gardens[0].amount/100;
      } else {
        this.gardens[x-1].gain = this.gardens[x].amount;
      }
    }
  }
  
  this.div = "<div id='gardenWall' style='position:absolute;left:782px;top:181px;width:400px;'>"+
  "</div>"
  
  
  this.addToAngular = function(scope, compile) {
    var newDirective = angular.element(this.div);
    $('#garden').append(newDirective);
    compile(newDirective)(scope);
    for(var x = 0; x < this.gardens.length; x++) {
      var newDirective = angular.element(this.gardens[x].div); 
      $('#gardenWall').append(newDirective);
      compile(newDirective)(scope);
    }
  }
}

const gardenData = {
  names : ["Apples", "Trees", "Orchards", "Farms", "Construction Tools", "Terramorphers", "Land Mass", "Underground Research", "Underground Cities"],
  timeNeededGrowth: 20,
  robotCapGrowth: 5,
  robotCapStart:10
}