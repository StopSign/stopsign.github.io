let view = {
    initialize: function() {
        //auto generated elements
        view.create.createLevel();
    },
    updating: {
        update: function () {

            view.updating.changedCells();
            view.updating.infoPanel();


            view.updating.selectedCell();
            view.updating.saveCurrentState();
        },
        saveCurrentState: function () {
            prevState.res = copyArray(res);
            // prevState.localAtmo = copyArray(localAtmo);
        },
        changedCells: function() {
            const gridElem = document.getElementById("grid");

            // if changedCells is null, render all cells
            if (changedCells === null) {
                changedCells = new Set();
                for (let i = 0; i < getCurLevel().width; i++) {
                    for (let j = 0; j < getCurLevel().height; j++) {
                        changedCells.add([i, j]);
                    }
                }
            }

            // update the DOM for the changed cells only
            changedCells.forEach(function(coords) {
                let i = coords[0];
                let j = coords[1];
                const cellElem = gridElem.children[i * getCurLevel().width + j];
                if (grid[i][j] === "wall") {
                    cellElem.style.backgroundColor = "rgb(150, 150, 150)";
                    cellElem.style.cursor = "default";
                } else {
                    // calculate the color difference between the current and new cell values
                    const currentColor = getColor(lastColorValue[i][j]);
                    const newColor = getColor(grid[i][j]);
                    const colorDiff = Math.abs(currentColor.h - newColor.h) +
                        Math.abs(currentColor.s - newColor.s) +
                        Math.abs(currentColor.l - newColor.l);

                    // update the cell color if the color difference is greater than a threshold
                    if (colorDiff > .1) {
                        cellElem.style.backgroundColor = newColor.css;
                        lastColorValue[i][j] = grid[i][j];
                    }
                }
            });

            changedCells = new Set();
        },
        infoPanel: function() {
            // update the total water count
            // document.getElementById("totalAdded").innerHTML = intToStringNegative(info.totalAdded, 4);
            document.getElementById("infoSpeciesTotal").innerHTML = intToString(info.totalSpecies, 4);
            document.getElementById("infoEnemeyTotal").innerHTML = intToString(Math.abs(info.totalEnemy), 4);
            // document.getElementById("deltaAdded").innerHTML = intToStringNegative(info.deltaAdded * ticksPerSecond);
            document.getElementById("infoSpeciesDelta").innerHTML = intToStringNegative(info.deltaSpecies * ticksPerSecond);
            document.getElementById("infoEnemyDelta").innerHTML = intToStringNegative(info.deltaEnemy * ticksPerSecond);
        },
        selectedCell: function() {
            if (selectedCell !== undefined && selectedCell !== null) {
                let i = selectedCell[0];
                let j = selectedCell[1];
                let cellSpeciesCount = grid[i][j];
                let cellContentName = getCurSpecies().enemy.name;
                if (cellSpeciesCount === "wall") {
                    cellContentName = "Wall";
                } else if (cellSpeciesCount > 0) {
                    cellContentName = getCurSpecies().name;
                }
                document.getElementById("selectedCellInfo").innerHTML = cellContentName + (isNaN(cellSpeciesCount)?"":("<br>" + nFormatter(Math.abs(cellSpeciesCount), 4))) + "<br>Coords: (" + i + ", " + j + ")";
            } else {
                document.getElementById("selectedCellInfo").innerHTML = "";
            }
        },
        resources: function() {
            // if(intToString(prevState.totalWater, 1) !== intToString(totalWater, 1)) {
            //     document.getElementById("totalWater").innerHTML = intToString(totalWater, 1);
            // }
        }
    },
    create: {
        createLevel: function() {
            view.create.initializeGrid();
            document.getElementById("infoSpeciesName").innerHTML = getCurSpecies().name;
            document.getElementById("infoEnemyName").innerHTML = getCurSpecies().enemy.name;
        },
        initializeGrid: function() {
            //initialize grid
            const gridElem = document.getElementById("grid");


            gridElem.style.gridTemplateColumns = "repeat("+getCurLevel().width+", 1fr)";
            gridElem.style.gridTemplateRows = "repeat("+getCurLevel().height+", 1fr)";

            for (let i = 0; i < getCurLevel().width; i++) {
                for (let j = 0; j < getCurLevel().height; j++) {
                    const cellElem = document.createElement("div");
                    cellElem.className = "cell";
                    cellElem.style.gridColumn = i + 1;
                    cellElem.style.gridRow = j + 1;

                    const highlightElem = document.createElement("div");
                    highlightElem.className = "highlight";
                    cellElem.appendChild(highlightElem);
                    gridElem.appendChild(cellElem);

                    cellElem.onclick = function() {
                        onEachCell(function(cell) {
                            if(cell.firstElementChild.style.display !== "none") {
                                cell.firstElementChild.style.display = "none";
                            }
                        });
                        if(this)
                            highlightElem.style.display = "block";
                        selectedCell = [i, j];
                        view.updating.selectedCell();
                    }
                }
            }
        },
        createButton: function(buttonDatum, pos) {
            let buttonHTML = "<div class='button abs showthat' onclick='buttonData[" + pos + "].onclick()' " +
                "style='top:" + buttonDatum.y + "px;left:" + buttonDatum.x + "px'>" +
                buttonDatum.text +
                "<div class='showthis'>" + buttonDatum.tooltip + "</div>" +
                "</div>";

            let elem = document.createElement("div");
            elem.innerHTML = buttonHTML;
            document.getElementById("modulesDiv").append(elem);
        }
    }
};

function getColor(number) {
    const maxHue = 360; // maximum value for hue in HSL color model
    const minHue = 120; // minimum value for hue in HSL color model
    const minNumber = 1; // minimum value for the input number

    if (number >= minNumber) {
        // calculate the hue value based on the number of digits in the input number
        const digitCount = Math.log10(number) + 1;
        const hue = (maxHue - minHue) / 16 * digitCount + minHue;

        // map the magnitude of the input number to a darkness value between 0 and 100
        const magnitude = Math.log10(number);
        let dark = 100 - Math.min(70, magnitude*10 + 1);

        // create an object with the HSL values of the color
        return {
            h: hue,
            s: 100,
            l: dark,
            css: `hsl(${hue}, 100%, ${dark}%)`
        };
    } else {
        // map the negative value to a darkness value between 0 and 100
        if(number/2 < minNegativeValue) {
            minNegativeValue = number/2;
        }
        let dark = Math.min(95, -1 * (number - (minNegativeValue*.1)) / (minNegativeValue*.1) * 100);
        // create an object with the HSL values of the color
        return {
            h: 0,
            s: 0,
            l: dark,
            css: `hsl(0, 0%, ${dark}%)`
        };
    }
}