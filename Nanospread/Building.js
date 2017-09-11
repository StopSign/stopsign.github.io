function Building(startCol, startRow, width, height) {
    this.x = startCol;
    this.y = startRow;
    this.width = width; //a 2x1 building has 2 width
    this.height = height;

    this.squares = [];
    for(var col = 0; col < theGrid.length; col++) {
        for (var row = 0; row < theGrid[col].length; row++) {
            var square = theGrid[col][row];
            if (!square) {

            }
        }
    }

    this.canBuyMult = function() {
        if(true) {
            buyEffect();
        }
    };
    this.buyEffect = function() {
        this.mult = 0;
    };

}