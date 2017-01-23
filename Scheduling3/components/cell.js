function Cell(column, row) {
  this.row = row;
  this.column = column;

  this.clear = function() {
    this.amount = 1;
    this.resource = 0;
    this.baseGain = this.gain = 1;
    this.costBase = this.cost =10;
    this.costGain = 2;
    this.multFromRes = 1;
    this.gainFromDown = 1;
    this.cityImage = 1;
    this.bonusFromGarden = 1;
    if(this.row === 0) {
      this.cityImage = 'capitol'
    }
  }
  this.clear();
  this.isResourceElec = false
  this.resourcePic = 'science'
  
  this.clicked = function() {
    if(this.resource >= this.cost) {
      this.amount++;
      this.changeResource(-this.cost);
      this.baseGain++;
      if(this.row > 0) {
        this.cityImage = whichCityImage(this.amount);
      }
    }
  }
  this.tick = function(bonusFromGarden) {
    this.bonusFromGarden = bonusFromGarden;
    this.changeResource(this.gain*bonusFromGarden);
  }
  this.changeResource = function(delta) {
    this.resource += delta
    
    //this.multFromRes = this.resource > 1 ? Math.pow((Math.logx(this.resource, 2)/50+1), 8) : 1
    this.multFromRes = this.amount
    this.cost = Math.floor(sigFigs((this.costBase * Math.pow(this.costGain, this.amount-1)), 2))
    this.costReady = this.resource >= this.cost
  }
  this.refreshGain = function() {
    this.gain = this.baseGain * this.gainFromDown
  }
  this.changeResourceType = function() {
    if(this.isResourceElec) {
      this.resourcePic = 'elec'
      this.arrowLeft = false;
    } else {
      this.resourcePic = 'science'
      this.arrowLeft = true;
    }
  }
  
  var grid = "cellGrid.grid["+this.column+"]["+this.row+"]"
  var xValue = this.column * 118
  var yValue = this.row * 85
  this.arrowLeft = false;
  var mult = "<div class='mult'><div class='small'>x</div>{{intToStringRound("+grid+".multFromRes)}}</div>"
  var resourceSwitch = ""
  if(row === 0) {
    this.arrowLeft = true;
    resourceSwitch = "<label class='switch'><input type='checkbox' ng-model='"+grid+".isResourceElec' ng-change='"+grid+".changeResourceType()'><div class='slider'></div></label>"
    mult = "<div class='mult'><div class='small'>+</div>{{intToStringRound("+grid+".multFromRes)}}<img src='images/{{"+grid+".resourcePic}}.png' class='smallIcon'></div>"
  }
  
  
  this.div = "<div class='cellParts' style='left:"+xValue+"px;top:"+yValue+"px;'>"+
    "<div class='cell button noselect'  ng-class='{ pointer : "+grid+".costReady, arrow_up:!"+grid+".arrowLeft, arrow_left:"+grid+".arrowLeft}' ng-click='clickCell("+this.column+", "+this.row+")'>"+
      "<div class='resource'>{{intToStringRound("+grid+".resource)}}</div>"+
      "<div class='cityImage'><img src='images/cities/{{"+grid+".cityImage}}.png' class='superLargeIcon'></div>"+
      "<div class='amount'>{{"+grid+".amount}}<img src='images/ghost.png' class='smallIcon'></div>"+
      "<div class='cellCost' ng-class='{ costReady : "+grid+".costReady}'><div class='small'>-</div>{{intToStringRound("+grid+".cost)}}</div>"+
      mult+
      "<div class='gain'><div class='small'>+</div>{{intToStringRound("+grid+".gain*"+grid+".bonusFromGarden)}}</div>"+
    "</div>"+
      resourceSwitch+
  "</div>"
  
  function whichCityImage(amount) {
    if(amount < 5) {
      return Math.floor(amount);
    } else if(amount < 49) {
      return Math.floor((amount-5)/2)+5;
    } else {
      return 27;
    }
  }
}