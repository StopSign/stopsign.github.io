
var timeList = [];
var timer = 0;
var stop = 0;
var myKeyQueue = [];
var multFromFps = 1;
var msWaitTime = 1000;
var size = 3;


var theGrid = [];
function createGrid() {
    var startingCoords = {x:0,y:0};
    for (var column = 0; column < levelData.length; column++) {
        theGrid[column] = [];
        for (var row = 0; row < levelData[column].length; row++) {
            if(!levelData[row][column]) {
                continue;
            }
            var squareCoords = {x:column,y:row};
            var distanceFromCenter = Math.sqrt(Math.pow((squareCoords.x-startingCoords.x),2)+Math.pow((squareCoords.y-startingCoords.y),2));
            var initialConsumeCost = Math.pow(distanceFromCenter, 2) * Math.pow(levelData[row][column], 2);
            theGrid[column][row] =  new Square(squareCoords.x, squareCoords.y, initialConsumeCost);
        }
    }

    for (column = 0; column < theGrid.length; column++) {
        for (row = 0; row < theGrid[column].length; row++) {
            var square = theGrid[column][row];
            if(square) {
                square.chooseStartingDirection(square); //All of them have a transfer target
            }
        }
    }

    theGrid[startingCoords.x][startingCoords.y].gainNanites(1);
}



//level definitions
var selected = [];
createGrid();
var theView;

function tick() {
    if(stop) {
        return;
    }
    timer++;
    handleFPSDifference();

    for (var column = 0; column < theGrid.length; column++) {
        for (var row = 0; row < theGrid.length; row++) {
            var square = theGrid[column][row];
            if(square && square.isActive()) {
                var target = theGrid[square.targetCol][square.targetRow];
                target.naniteAmountReceived = 0;
                target.advBotAmountReceived = 0;
            }
        }
    }

    for (column = 0; column < theGrid.length; column++) {
        for (row = 0; row < theGrid.length; row++) {
            square = theGrid[column][row];
            if(square && square.isActive()) {
                target = theGrid[square.targetCol][square.targetRow];
                if(target.isActive()) {
                    target.gainAdvBots(square.sendPieceOfAdvBots()); //transfer .1% advBots
                }
                var amountTransferred = square.sendPieceOfNanites();
                target.gainNanites(amountTransferred); //transfer .1% nanites
                target.naniteAmountReceived += amountTransferred;

                amountTransferred = square.sendPieceOfAdvBots();
                target.gainAdvBots(amountTransferred); //transfer .1% adv bots
                target.advBotAmountReceived += amountTransferred;

                square.gainNanites(square.naniteRate);
                square.gainAdvBots(square.advBotRate);
            }
        }
    }
    // var tcol = theGrid[1][1].targetCol;
    // var trow = theGrid[1][1].targetRow;
    // var tcol2 = theGrid[tcol][trow].targetCol;
    // var trow2 = theGrid[tcol][trow].targetRow;
    if(!theView) {
        theView = new View();
    }
    theView.update();

    //console.log("nanites: "+theGrid[1][1].nanites+", transferRate: "+theGrid[1][1].naniteTransfRate+", tcol: "+tcol+", trow: "+trow+ ", tnanites: "+theGrid[tcol][trow].nanites+", tconsumeCost: "+theGrid[tcol][trow].consumeCost);
    //console.log("0n:"+intToString(theGrid[1][1].nanites,2)+" 1n:"+intToString(theGrid[tcol][trow].nanites,2)+" 2n:"+intToString(theGrid[tcol2][trow2].nanites,2))

}

function clickedSquare(col, row) {
    var square = theGrid[col][row];
    square.isSelected = !square.isSelected;
    var pos = selected.indexOf(square);
    if(pos === -1) {
        selected.push(square);
        theView.selectedChange();
        return;
    }
    theView.selectedChange();
    selected.splice(pos, 1);
    theView.updateInfoBox();
}
function deselectAll() {
    for(var i = 0; i < selected.length; i++) {
        selected[i].isSelected = 0;
    }
    theView.selectedChange();
    selected = [];
    theView.updateInfoBox();
}

function clickedDirectionArrow(direction) {
    for(var i = 0; i < selected.length; i++) {
        selected[i].changeTargetDirection(direction);
        if(!selected[i].getTarget()) {
            selected[i].chooseStartingDirection();
        }
    }
    theView.updateInfoBox();
}

function buyNanitesButtonPressed() {
    var lowestAmountSquares = [selected[0]];
    for(var i = 1; i < selected.length; i++) {
        if(!selected[i].isActive()) {
            continue;
        }
        if(selected[i].naniteAmount < lowestAmountSquares[0].naniteAmount) {
            lowestAmountSquares = []; //clear list
            lowestAmountSquares.push(selected[i]);
        } else if(selected[i].naniteAmount === lowestAmountSquares[0].naniteAmount) {
            lowestAmountSquares.push(selected[i]);
        }
    }
    for(i = 0; i < lowestAmountSquares.length; i++) {
        if(lowestAmountSquares[i].canBuyNanites()) {
            lowestAmountSquares[i].buyNanites();
        }
    }
    theView.updateInfoBox();
}
function buyAdvBotsButtonPressed() {
    for(var i = 0; i < selected.length; i++) {
        if(selected[i].canBuyAdvBots()) {
            selected[i].buyAdvBots();
        }
    }
    theView.updateInfoBox();
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