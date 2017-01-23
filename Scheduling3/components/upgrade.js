function Upgrade(id, data) {
  this.id = id;
  this.baseCost = data.baseCost
  this.costUI = intToStringRound(data.baseCost);
  this.costGain = data.costGain;
  this.name = data.name;
  this.amount = 0
  this.cost = this.baseCost * Math.pow(this.costGain, this.amount)
  
  this.increaseAmount = function(resource) {
    this.amount++;
    this.cost = sigFigs(this.baseCost * Math.pow(this.costGain, this.amount), 2)
    this.costReady = resource >= this.cost
    this.costUI = intToStringRound(this.cost);
  }
  
  this.tick = function(researchPoints) {
    this.costReady = researchPoints >= this.cost
  }
  
  
  var  upgrades = "research.upgrades["+this.id+"]"
  
  this.div = "<div id='upgrade"+id+"' class='upgrade button noselect text' ng-class='{ pointer : "+upgrades+".costReady}' ng-click='clickUpgrade("+this.id+", \"$scope."+data.onclick+"\")'>"+
    "<div class='rcost' ng-class='{ costReady : "+upgrades+".costReady}'><div class='small'>-</div>{{"+upgrades+".costUI}}<img src='images/science.png' class='smallIcon'></div>"+
    "<div class='rname'>{{"+upgrades+".name}}</div>"+
  "</div>"
  
}