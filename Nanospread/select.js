function Select() {

    this.deselectAll = function() {
        if(selected.length === 0) {
            return;
        }
        theView.setSelectedFalse();
        theView.updateInfoBox();
        closeSettingsBox();
        showOrHideBox();
    };
    this.selectAllActive = function() {
        this.deselectAll();
        let temp = settings.selectOneOrMultiple;
        settings.selectOneOrMultiple = 1;
        for (let column = 0; column < theGrid.length; column++) {
            for (let row = 0; row < theGrid[column].length; row++) {
                let square = theGrid[column][row];
                if (square && square.isActive()) {
                    clickedSquare(column, row);
                }
            }
        }
        settings.selectOneOrMultiple = temp;
    };

    this.getLowestSquares = function(list, resourceType) {  //gets all the Squares with the lowest upgrade amount
        let lowestAmountSquares;
        for(let i = 0; i < list.length; i++) {
            if(!lowestAmountSquares) {
                lowestAmountSquares = [list[i]];
                continue;
            }
            if(list[i][resourceType + 'Amount'] < lowestAmountSquares[0][resourceType + 'Amount']) {
                lowestAmountSquares = [];
                lowestAmountSquares.push(list[i]);
            } else if(list[i][resourceType + 'Amount'] === lowestAmountSquares[0][resourceType + 'Amount']) {
                lowestAmountSquares.push(list[i]);
            }
        }
        return lowestAmountSquares ? lowestAmountSquares : [];
    };

    this.getLowestSquare = function(list, resourceType) {
        let lowestSquare;
        for(let i = 0; i < list.length; i++) {
            if(!lowestSquare) {
                lowestSquare = list[i];
                continue;
            }
            if(list[i][resourceType + 'Amount'] < lowestSquare[resourceType + 'Amount'] ||
                (list[i][resourceType + 'Amount'] === lowestSquare[resourceType + 'Amount'] && list[i][resourceType + 's'] < lowestSquare[resourceType + 's'])) {
                lowestSquare = list[i];
            }
        }
        return lowestSquare;
    };

    this.getSelectedActive = function() {
        let selectedActive = [];
        for(let i = 0; i < selected.length; i++) {
            if(selected[i].isActive()) {
                selectedActive.push(selected[i]);
            }
        }
        return selectedActive;
    };

    this.getSelectedInactive = function() {
        let selectedInactive = [];
        for(let i = 0; i < selected.length; i++) {
            if(!selected[i].isActive()) {
                selectedInactive.push(selected[i]);
            }
        }
        return selectedInactive;
    };

    this.getLowestInactiveSquare = function(list) {
        let lowestInactive;
        for(let i = 0; i < list.length; i++) {
            if(!lowestInactive) {
                lowestInactive = list[i];
                continue;
            }
            if(list[i].consumeCost < lowestInactive.consumeCost) {
                lowestInactive = list[i];
            }
        }
        return lowestInactive;
    };

    this.selectAllInCoordinates = function(startingDragPoint, endingDragPoint) {
        this.deselectAll();
        let temp = settings.selectOneOrMultiple;
        settings.selectOneOrMultiple = 1;
        let containerOffset = document.getElementById('theBody').offsetWidth > 800 ? (document.getElementById('theBody').offsetWidth - 800)/2 : 0;
        for (let column = 0; column < theGrid.length; column++) {
            for (let row = 0; row < theGrid[column].length; row++) {
                let square = theGrid[column][row];
                let squareDiv = theView.grid[column][row];
                if (square && squareDiv) {

                    let squareStartingPoint = {x:pxToInt(squareDiv.style.left)+containerOffset, y:pxToInt(squareDiv.style.top)};
                    let squareEndingPoint = {x:(pxToInt(squareDiv.style.left)+pxToInt(squareDiv.style.width)+containerOffset), y:(pxToInt(squareDiv.style.top)+pxToInt(squareDiv.style.height))};

                    if(doOverlap(squareStartingPoint, squareEndingPoint, startingDragPoint, endingDragPoint) &&
                        !insideSquare(squareStartingPoint, squareEndingPoint, startingDragPoint, endingDragPoint)) {
                        clickedSquare(column, row);
                    }
                }
            }
        }
        settings.selectOneOrMultiple = temp;
    };
}

function doOverlap(l1, r1, l2, r2) {
    return l1.x < r2.x && r1.x > l2.x && l1.y < r2.y && r1.y > l2.y;
}

function insideSquare(l1, r1, l2, r2) {
    return l2.x > l1.x && l2.y > l1.y && r1.x > r2.x && r1.y > r2.y;
}