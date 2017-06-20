
var timeList = [];
var timer = 0;
var stop = 0;
var myKeyQueue = [];
var multFromFps = 1;
var msWaitTime = 1000;
var size = 3;


var theGrid = [];
function createGrid() {
    var startingCoords = {x:1,y:1};
    for (var column = 0; column < size; column++) {
        theGrid[column] = [];
        for (var row = 0; row < size; row++) {
            var squareCoords = {x:column,y:row};
            var distanceFromCenter = Math.sqrt(Math.pow((squareCoords.x-startingCoords.x),2)+Math.pow((squareCoords.y-startingCoords.y),2));
            var square = new Square(squareCoords.x, squareCoords.y, distanceFromCenter);
            theGrid[column][row] = square;
        }
    }

    for (row = 0; row < size; row++) {
        for (column = 0; column < size; column++) {
            square = theGrid[column][row];
            square.chooseStartingDirection(square); //All of them have a transfer target
        }
    }


    startingList.push(theGrid[startingCoords.x][startingCoords.y]);
}



//level definitions
var startingList = [];
createGrid();

function tick() {
    if(stop) {
        return;
    }
    timer++;
    handleFPSDifference();

    for (var row = 0; row < theGrid.length; row++) {
        for (var column = 0; column < theGrid.length; column++) {
            var square = theGrid[row][column];
            if(square && square.isActive) {
                var target = theGrid[square.targetCol][square.targetRow];
                if(target.isActive()) {
                    target.gainAdvBots(square.sendPieceOfAdvBots()); //transfer .1% advBots
                }
                target.gainNanites(square.sendPieceOfNanites()); //transfer .1% nanites

                square.gainNanites(square.naniteRate);
                square.gainAdvBots(square.advBotRate);
            }
        }
    }
    var tcol = theGrid[1][1].targetCol;
    var trow = theGrid[1][1].targetRow;
    var tcol2 = theGrid[tcol][trow].targetCol;
    var trow2 = theGrid[tcol][trow].targetRow;
    if(!theView) {
        var theView = new View();
    }
    theView.update();

    //console.log("nanites: "+theGrid[1][1].nanites+", transferRate: "+theGrid[1][1].naniteTransfRate+", tcol: "+tcol+", trow: "+trow+ ", tnanites: "+theGrid[tcol][trow].nanites+", tconsumeCost: "+theGrid[tcol][trow].consumeCost);
    //console.log("0n:"+intToString(theGrid[1][1].nanites,2)+" 1n:"+intToString(theGrid[tcol][trow].nanites,2)+" 2n:"+intToString(theGrid[tcol2][trow2].nanites,2))

}


setInterval(tick, 1000);


function handleFPSDifference() {
    timeList.push(new Date().getTime());
    if(timeList.length > 10) {
        timeList.splice(0, 1);
        var fps = msWaitTime/((timeList[timeList.length-1] - timeList[0]) / (timeList.length-1))*100;
        multFromFps = 100/fps;
        //$scope.fps = round(fps)+"%";
    } else {
        multFromFps = 1;
        //$scope.fps = "...";
    }
}