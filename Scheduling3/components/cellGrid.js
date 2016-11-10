function CellGrid(row, column) {
  this.grid = []
  
  this.addNewCell = function(row, column) {
    if(!this.grid[column]) {
      this.grid[column] = []
    }
    this.grid[column].push(new Cell(column, row))
  }
  this.tick = function() {
    for(var x = 0; x < this.grid.length; x++) {
      for(var y = 0; y < this.grid[x].length; y++) { //For each cell in the crid
        this.grid[x][y].gainFromDown = 1
        for(z = y+1; z < this.grid[x].length; z++) { //Get the multi of all cells below it
          this.grid[x][y].gainFromDown *= this.grid[x][z].multFromRes
        }
        this.grid[x][y].refreshGain();
      }
    }
    for(var x = 0; x < this.grid.length; x++) {
      for(var y = 0; y < this.grid[x].length; y++) {
        this.grid[x][y].tick()
      }
    }
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
  
  this.div = "<div id='cellGrid' class='cellGrid'>"+
  "<div class='button clickAll' ng-click='clickAll()'>Click All</div>"+
  "</div>"
  
  
  this.addToAngular = function(scope, compile) {
    var newDirective = angular.element(this.div);
    $('#page').append(newDirective);
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