function Research() {
  this.resource = this.resourceUI = this.gainUI = 0
  this.upgrades = []
  
  this.addUpgradeButton = function() {
    var upgrade = new Upgrade(this.upgrades.length, data.buttons[data.counter++])
    this.upgrades.push(upgrade)
    return upgrade;
  }
  
  this.add = function(gain) {
    this.resource += gain;
    this.gainUI = intToStringRound(gain)
    this.resourceUI = intToStringRound(this.resource)
  }
  
  this.tick = function() {
    for(var x = 0; x < this.upgrades.length; x++) {
      this.upgrades[x].tick(this.resource);
    }
  }
  
  this.clicked = function(id) {
    if(this.resource >= this.upgrades[id].cost) {
      this.resource -= this.upgrades[id].cost;
      this.upgrades[id].increaseAmount(this.resource);
      this.resourceUI = intToStringRound(this.resource)
      return true;
    }
    return false;
  }
  
  this.addNewCellButton = function(column) {
    var cost = sigFigs(200 * Math.pow(5, column), 2)
    var newButtonData = { baseCost : cost, costGain : 4, name : "Add Cell on column "+(column+1), onclick : "addCellToColumn("+column+")" }
    var newUpgradeButton = new Upgrade(this.upgrades.length, newButtonData)
    this.upgrades.push(newUpgradeButton)
    return newUpgradeButton;
  }
  
  this.addToAngular = function(scope, compile) {
    var newDirective = angular.element(this.div);
    $('#page').append(newDirective);
    compile(newDirective)(scope);
    
    for(var x = 0; x < this.upgrades.length; x++) {
      var newDirective = angular.element(this.upgrades[x].div); 
      $('#research').append(newDirective);
      compile(newDirective)(scope);
    }
  }
    
  this.div = "<div id='research' class='researchContainer gradient'>"+
    "<div class='researchAmount'><img src='images/science.png' class='largeIcon'>{{research.resourceUI}}</div>"+
    "<div class='researchGain'><div class='small'>+</div>{{research.gainUI}}<img src='images/science.png' class='largeIcon'></div>"+
  "</div>"
}

const data = {
  buttons : [
    { baseCost : 5000, costGain : 20, name : "Cell multiplier distance", onclick: "cellGrid.gainMultiDistance()" },
    { baseCost : 1000, costGain : 10, name : "Add column", onclick : "addCellColumn()" },
  ],
  counter : 0
}