function Cell(column, row) {
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
    this.cost = Math.floor(sigFigs((this.costBase * Math.pow(this.costGain, this.amount-1)), 2))
    this.costReady = this.resource >= this.cost
    this.costUI = intToStringRound(this.cost)
  }
  this.refreshGain = function() {
    this.gain = this.baseGain * this.gainFromDown
    this.gainUI = intToStringRound(this.gain)
  }
  
  var grid = "cellGrid.grid["+this.column+"]["+this.row+"]"
  var xValue = this.column * 118
  var yValue = this.row * 85
  var arrowType = row === 0 ? 'arrow_left' : 'arrow_up'
  if(row == 0) {
    
  }
    
  this.div = "<div class='cell button noselect "+arrowType+"' style='left:"+xValue+"px;top:"+yValue+"px;' ng-class='{ pointer : "+grid+".costReady}' ng-click='clickCell("+this.column+", "+this.row+")'>"+
    "<div class='resource'>{{"+grid+".resourceUI}}</div>"+
    "<div class='amount'>{{"+grid+".amount}}</div>"+
    "<div class='cellCost' ng-class='{ costReady : "+grid+".costReady}'><div class='small'>-</div>{{"+grid+".costUI}}</div>"+
    "<div class='mult'><div class='small'>x</div>{{"+grid+".multFromRes.toPrecision(3)}}</div>"+
    "<div class='gain'><div class='small'>+</div>{{"+grid+".gainUI}}</div>"+
  "</div>"
}