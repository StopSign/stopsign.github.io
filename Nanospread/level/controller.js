

let gridX;
let gridY;
let base = 1;

function createGrid(grid) {
    gridX = document.getElementById("gridX").value;
    gridY = document.getElementById("gridY").value;
    let gridElem = document.getElementById("grid");
    gridElem.innerHTML = "";
    for(let x = 0; x < gridX; x++) {
        let newRow = document.createElement("div");
        newRow.id = "row"+x;
        addClassToDiv(newRow, "gridRow");
        for(let y = 0; y < gridY; y++) {
            let newCell = document.createElement("div");
            //newCell.id = "row"+x+"col"+y;
            addClassToDiv(newCell, "gridCell");

            let inputDiv = document.createElement("input");
            inputDiv.style.width="20px";
            inputDiv.onchange = calcTotal;
            inputDiv.id = "row"+x+"col"+y;
            if(grid && grid[x][y]) {
                inputDiv.value = grid[x][y];
            }

            newCell.append(inputDiv);

            newRow.append(newCell);
        }
        gridElem.append(newRow);
    }
    calcTotal();
}

function calcTotal() {
    let total = 0;
    let totalCells = 0;
    for(let x = 0; x < gridX; x++) {
        for(let y = 0; y < gridY; y++) {
            let val = document.getElementById("row"+x+"col"+y).value;
            let toAdd = (!val || val < 0) ? 0 : parseInt(val);
            total += toAdd;
            if(toAdd > 0) {
                totalCells++;
            }
        }
    }
    document.getElementById("total").innerHTML = total;
    document.getElementById("totalCells").innerHTML = totalCells;
}

function exportGrid() {
    let theString = "[";
    for(let x = 0; x < gridX; x++) {
        theString += "[";
        for(let y = 0; y < gridY; y++) {
            let val = document.getElementById("row"+x+"col"+y).value;
            theString += !val ? 0 : val;
            if(y < gridY - 1) {
                theString += ", ";
            }
        }
        theString += "]";
        if(x < gridX - 1) {
            theString += ",\n";
        }
    }
    theString += "]";
    document.getElementById("exportString").value = theString;
}

function importGrid() {
    let theString = document.getElementById("exportString").value;
    if(!theString) {
        return;
    }
    let grid = JSON.parse(theString);
    document.getElementById("gridX").value = grid.length;
    gridY = document.getElementById("gridY").value = grid[0].length;
    createGrid(grid);
}