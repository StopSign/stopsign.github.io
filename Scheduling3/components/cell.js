function Cell(row, column) {
  this.row = row;
  this.column = column;

  this.amount = 1;
  this.resource = this.resourceUI = 0;
  this.baseGain = this.gain = this.gainUI = 1;
  this.costBase = this.cost = this.costUI = 10;
  this.costGain = 2;
  this.multFromRes = 1;
  
  this.gainFromUp = this.gainFromRight = this.gainFromDown = this.gainFromLeft = 1
  
  this.clicked = function() {
    if(this.resource >= this.cost) {
      this.amount++;
      this.changeResource(-this.cost);
      this.baseGain++;
    }
  }
  this.tick = function() {
    this.changeResource(this.gain);
  }
  this.changeResource = function(delta) {
    this.resource += delta
    
    this.resourceUI = intToStringRound(this.resource)
    //this.multFromRes = this.resource > 1 ? Math.pow((Math.logx(this.resource, 2)/50+1), 8) : 1
    this.multFromRes = this.amount
    this.cost = (this.costBase * Math.pow(this.costGain, this.amount-1)).toPrecision(2)|0
    this.costReady = this.resource >= this.cost
    this.costUI = intToStringRound(this.cost)
  }
  this.refreshGain = function() {
    this.gain = this.baseGain * this.gainFromDown
    this.gainUI = intToStringRound(this.gain)
  }
  
  var grid = "cellGrid.grid["+this.row+"]["+this.column+"]"
  var xValue = this.row * 115
  var yValue = this.column * 90
    
  this.div = "<div class='cell button noselect' style='left:"+xValue+"px;top:"+yValue+"px;' ng-class='{ pointer : "+grid+".costReady}' ng-click='clickCell("+this.row+", "+this.column+")'>"+
  "<div class='resource'>{{"+grid+".resourceUI}}</div>"+
  "<div class='amount'>{{"+grid+".amount}}</div>"+
  "<div class='cost' ng-class='{ costReady : "+grid+".costReady}'><div class='small'>-</div>{{"+grid+".costUI}}</div>"+
  "<div class='mult'><div class='small'>x</div>{{"+grid+".multFromRes.toPrecision(3)}}</div>"+
  "<div class='gain'><div class='small'>+</div>{{"+grid+".gainUI}}</div>"+
  "</div>"
}