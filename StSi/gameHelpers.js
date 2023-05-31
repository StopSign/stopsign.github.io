

function onEachCell(func) {
    const cells = document.querySelectorAll(".cell");
    for (let i = 0; i < cells.length; i++) {
        func(cells[i]);
    }
}



//Methods to affect a level
function createRectangle(newGrid, x1, y1, x2, y2) {
    for(let i = x1; i < x2; i++) {
        for (let j = y1; j < y2; j++) {
            newGrid[i][j] = "wall";
        }
    }
}
function createUnRectangle(newGrid, originalGrid, x1, y1, x2, y2) {
    for (let i = x1; i < x2; i++) {
        for (let j = y1; j < y2; j++) {
            if (newGrid[i][j] === "wall") {
                newGrid[i][j] = originalGrid[i][j];
            }
        }
    }
}
function createCircle(newGrid, centerX, centerY, radius) {
    for (let i = 0; i < newGrid.length; i++) {
        for (let j = 0; j < newGrid[i].length; j++) {
            let distance = Math.sqrt(Math.pow(i - centerX, 2) + Math.pow(j - centerY, 2));

            if (distance <= radius) {
                newGrid[i][j] = "wall";
            }
        }
    }
}
function createUnCircle(newGrid, originalGrid, centerX, centerY, radius) {
    for (let i = 0; i < newGrid.length; i++) {
        for (let j = 0; j < newGrid[i].length; j++) {
            let distance = Math.sqrt(Math.pow(i - centerX, 2) + Math.pow(j - centerY, 2));

            if (distance <= radius && newGrid[i][j] === "wall") {
                newGrid[i][j] = originalGrid[i][j];
            }
        }
    }
}
function createTriangle(newGrid, x1, y1, x2, y2, x3, y3) {
    function isInsideTriangle(x, y) {
        let area = 0.5 * Math.abs(x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2));
        let area1 = 0.5 * Math.abs(x * (y2 - y3) + x2 * (y3 - y) + x3 * (y - y2));
        let area2 = 0.5 * Math.abs(x1 * (y - y3) + x * (y3 - y1) + x3 * (y1 - y));
        let area3 = 0.5 * Math.abs(x1 * (y2 - y) + x2 * (y - y1) + x * (y1 - y2));

        return area === (area1 + area2 + area3);
    }

    for (let i = 0; i < newGrid.length; i++) {
        for (let j = 0; j < newGrid[i].length; j++) {
            if (isInsideTriangle(i, j)) {
                newGrid[i][j] = "wall";
            }
        }
    }
}

function addSpawner(i, j, num, increase, time) {
    spawners.push({i:i, j:j, num:num, increase:increase, time:time, curTime:0});
}

function getCurSpecies() {
    return data.species[curSpecies];
}