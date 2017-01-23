function CellGrid(row, column) {
  this.grid = []
  this.multiDistance = 1
  
  this.addNewCell = function(column) {
    if(!this.grid[column]) {
      this.grid[column] = []
    }
    var row = this.grid[column].length;
    var newCell = new Cell(column, row)
    this.grid[column].push(newCell)
    return newCell;
  }
  
  this.tick = function(resources, bonusFromGarden) {
    var researchGain = 0;
    var electronicsGain = 0;
    for(var x = 0; x < this.grid.length; x++) {
      for(var y = 0; y < this.grid[x].length; y++) { //For each cell in the crid
        this.grid[x][y].gainFromDown = 1
        for(y2 = y+1; y2 < this.grid[x].length && y2 < y+this.multiDistance+1; y2++) { //Get the multi of all cells below it
          this.grid[x][y].gainFromDown *= this.grid[x][y2].multFromRes
        }
        this.grid[x][y].refreshGain();
      }
      if(this.grid[x][0].isResourceElec) {
        electronicsGain += this.grid[x][0].multFromRes
      } else {
        researchGain += this.grid[x][0].multFromRes
      }
    }
    for(var x = 0; x < this.grid.length; x++) {
      for(var y = 0; y < this.grid[x].length; y++) {
        this.grid[x][y].tick(bonusFromGarden)
      }
    }
    resources.researchGain = researchGain
    resources.electronicsGain = electronicsGain
  }
  
  this.clicked = function(row, column) {
    this.grid[row][column].clicked();
  }
  
  this.clickAll = function() {
    for(var x = 0; x < this.grid.length; x++) {
      for(var y = 0; y < this.grid[x].length; y++) {
        this.grid[x][y].clicked()
      }
    }
  }
  
  this.gainMultiDistance = function() {
    this.multiDistance++;
  }
  
  this.harvest = function() {
    var harvestAmount = 0;
    for(var x = 0; x < this.grid.length; x++) {
      for(var y = 0; y < this.grid[x].length; y++) { //For each cell in the crid
        harvestAmount += this.grid[x][y].amount
        this.grid[x][y].clear()
      }
    }
    return harvestAmount;
  }
  
  this.div = "<div id='cellGrid' class='cellGrid text'>"+
    "<div class='button clickAll' ng-click='clickAll()'>Click All</div>"+
  "</div>"
  
  
  this.addToAngular = function(scope, compile) {
    var newDirective = angular.element(this.div);
    $('#cities').append(newDirective);
    compile(newDirective)(scope);
    for(var x = 0; x < this.grid.length; x++) {
      for(var y = 0; y < this.grid[x].length; y++) {
        var newDirective = angular.element(this.grid[x][y].div); 
        $('#cellGrid').append(newDirective);
        compile(newDirective)(scope);
      }
    }
  }
  
}