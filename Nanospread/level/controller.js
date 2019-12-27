
let gridX;
let gridY;
let theGrid = [];
newGrid();
createExistingLevels();

function newGrid() {
    gridX = document.getElementById("gridX").value;
    gridY = document.getElementById("gridY").value;
    theGrid = [];
    for(let x = 0; x < gridX; x++) {
        theGrid[x] = [];
        for(let y = 0; y < gridY; y++) {
            theGrid[x][y] = 0;
        }
    }
    createGrid(theGrid);
}

//newGrid is optional
function createGrid(existingGrid) {
    if(existingGrid) {
        document.getElementById("gridX").value = existingGrid.length;
        document.getElementById("gridY").value = existingGrid[0].length;
        gridX = existingGrid.length;
        gridY = existingGrid[0].length;
    } else {
        gridX = document.getElementById("gridX").value;
        gridY = document.getElementById("gridY").value;
    }

    if(!(gridX > 0 && gridY > 0)) {
        return;
    }

    document.getElementById("gridContainer").style.display = "inline-block";
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
            inputDiv.style.width="27px";
            inputDiv.style.marginTop="5px";
            inputDiv.onchange = calcTotal;
            inputDiv.id = "row"+x+"col"+y;
            if(existingGrid && existingGrid[x][y]) {
                inputDiv.value = existingGrid[x][y];
            }

            newCell.append(inputDiv);

            newRow.append(newCell);
        }
        gridElem.append(newRow);
        gridElem.append(document.createElement("br"));
    }
    calcTotal();
}

function calcTotal() {
    let total = 0;
    let totalCells = 0;
    readGrid();
    for(let x = 0; x < gridX; x++) {
        for(let y = 0; y < gridY; y++) {
            let val = theGrid[x][y];
            let toAdd = (!val || val < 0) ? 0 : parseInt(val);
            total += toAdd > 0 ? Math.pow(2, toAdd) : 0;
            if(toAdd > 0) {
                totalCells++;
            }
        }
    }
    document.getElementById("total").innerHTML = total/2;
    document.getElementById("totalCells").innerHTML = totalCells+"";
}

function exportGrid() {
    readGrid();
    let name = document.getElementById("name").value;
    let grid = JSON.stringify(theGrid).replace(/],/g, '],\n');
    let exportString = "{\n";
    exportString += '"name":"'+name+'",\n';
    exportString += '"grid":'+grid+'\n';
    exportString+="}";
    document.getElementById("exportString").value = exportString;
}

function readGrid() {
    for(let x = 0; x < gridX; x++) {
        theGrid[x] = [];
        for(let y = 0; y < gridY; y++) {
            let val = document.getElementById("row"+x+"col"+y).value;
            theGrid[x][y] = !val ? 0 : parseFloat(val);
        }
    }
}

function importGrid() {
    let theString = document.getElementById("exportString").value;
    if(!theString) {
        return;
    }
    let levelObj = JSON.parse(theString);
    createGrid(levelObj.grid);
    document.getElementById("name").value = levelObj.name;
}

function showNanites() {
    let gridElem = document.getElementById("naniteGrid");
    let currentLevel = parseInt(document.getElementById("levelSim").value);
    gridElem.innerHTML = "";

    let goalCost = Math.pow(2, currentLevel-2) * 100000000;
    goalCost /= 4000 / Math.pow((currentLevel+1), 2);
    document.getElementById("totalNanites").innerHTML = intToString(goalCost);

    let totalFromLevelData = 0;
    for(let column = 0; column < theGrid[0].length; column++) {
        for (let row = 0; row < theGrid.length; row++) {
            let levelDataNum = theGrid[row][column];
            if(levelDataNum > 0) {
                totalFromLevelData += Math.pow(2, levelDataNum);
            }
        }
    }

    let consumeCostModifier = goalCost / totalFromLevelData;

    for(let x = 0; x < gridX; x++) {
        let newRow = document.createElement("div");
        addClassToDiv(newRow, "naniteRow");
        for(let y = 0; y < gridY; y++) {
            let val = theGrid[x][y];
            let newCell = document.createElement("div");

            if(val === 0) {
                addClassToDiv(newCell, "naniteCellEmpty");
            } else {
                addClassToDiv(newCell, "naniteCell");
                if(val === -1) {
                    newCell.innerHTML = "S";
                } else if(val === -2) {
                    newCell.innerHTML = "0";
                } else {
                    val = (Math.pow(2, val) * consumeCostModifier);
                    newCell.innerHTML = intToString(val);
                }
            }

            newRow.append(newCell);
        }
        gridElem.append(newRow);
        gridElem.append(document.createElement("br"));
    }
}



function createExistingLevels() {
    let existingLevelsDiv = document.getElementById("existingLevels");
    let labels = document.createElement("div");
    labels.innerHTML = "" +
        "<div style='width:50px;'>#</div>" +
        "<div style='width:150px;'>Name</div>" +
        "<div style='width:100px'>Total</div>" +
        "<div style='width:50px'># Cells</div>";
    existingLevelsDiv.appendChild(labels);
    existingLevelsDiv.appendChild(document.createElement("br"));
    for(let i = 0; i < levelData.length; i++) {
        let grid = levelData[i].grid;

        let total = 0, totalCells = 0;
        for(let x = 0; x < grid.length; x++) {
            for(let y = 0; y < grid[0].length; y++) {
                let val = grid[x][y];
                let toAdd = (!val || val < 0) ? 0 : parseInt(val);
                total += toAdd > 0 ? Math.pow(2, toAdd) : 0;
                if(toAdd > 0) {
                    totalCells++;
                }
            }
        }

        let elem = document.createElement("div");
        elem.innerHTML = "<div style='width:50px;'>"+i+"</div>" +
            "<div class='clickable' style='width:150px;'>"+levelData[i].name+"</div>" +
            "<div style='width:100px'>"+total+"</div>" +
            "<div style='width:50px'>"+totalCells+"</div>";
        elem.onclick = function() {
            theGrid = copyArray(levelData[i].grid);
            createGrid(theGrid);
            document.getElementById("levelSim").value = i;
            document.getElementById("name").value = levelData[i].name;
        };
        existingLevelsDiv.appendChild(elem);
        existingLevelsDiv.appendChild(document.createElement("br"));
    }
}














function addTopRow() {
    let newRow = [];
    for(let col = 0; col < theGrid[0].length; col++) {
        newRow.push(0);
    }
    theGrid.splice(0, 0, newRow);
    createGrid(theGrid);
}

function removeTopRow() {
    theGrid.splice(0, 1);
    createGrid(theGrid);
}

function addBottomRow() {
    let newRow = [];
    for(let col = 0; col < theGrid[0].length; col++) {
        newRow.push(0);
    }
    theGrid.splice(theGrid.length, 0, newRow);
    createGrid(theGrid);
}

function removeBottomRow() {
    theGrid.splice(theGrid.length-1, 1);
    createGrid(theGrid);
}

function addLeftRow() {
    for(let row = 0; row < theGrid.length; row++) {
        theGrid[row].splice(0, 0, 0);
    }
    createGrid(theGrid);
}

function removeLeftRow() {
    for(let row = 0; row < theGrid.length; row++) {
        theGrid[row].splice(0, 1);
    }
    createGrid(theGrid);
}

function addRightRow() {
    for(let row = 0; row < theGrid.length; row++) {
        theGrid[row].push(0);
    }
    createGrid(theGrid);
}

function removeRightRow() {
    for(let row = 0; row < theGrid.length; row++) {
        theGrid[row].splice(theGrid[row].length-1, 1);
    }
    createGrid(theGrid);
}