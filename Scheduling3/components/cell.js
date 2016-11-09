function Cell(row, column) {
  this.row = row;
  this.column = column;

  this.amount = 1;
  this.resource = 0;
  this.gain = 1;
  this.multFromRes = 1;
  this.costBase = this.cost = 10;
  this.costGain = 1.2;
  

  this.clicked = function() {
    if(this.resource >= this.cost) {
      this.resource -= this.cost;
      this.amount++;
      this.gain++;
      this.cost = (this.costBase * Math.pow(this.costGain, this.amount)).toPrecision(2)|0
    }
  }
  this.tick = function() {
    this.resource += this.gain;
  }
  
  var grid = "cellGrid["+this.row+"]["+this.column+"]"
    
  this.div = "<div class='cell' ng-click='clickCell("+this.row+", "+this.column+")'>"+
  "{{"+grid+".resource}}"+
  "<br>{{"+grid+".amount}}"+
  "<br>{{"+grid+".cost}}"+
  "</div>"
}
