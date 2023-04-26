let changedCells = new Set();
function gameTick() {
    if(stop) {
        return
    }

    spawnersSpawn();

    //Queue them up to be updated on the next frame
    updateGrid().forEach(function(cell) {
        changedCells.add(cell);
    });
}



function initialize() {
    for (let i = 0; i < width; i++) {
        let row = [];
        for (let j = 0; j < height; j++) {
            row.push(0);
        }
        grid.push(row);
    }
    lastColorValue = copyArray(grid);
    nextGrid = copyArray(grid);

    view.initialize();

    createLevel();

    changedCells = null;
    view.updating.changedCells();
}

function spawnersSpawn() {
    spawners.forEach(function(spawner) {
        if(spawner.curTime-- <= 0) {
            spawner.curTime = spawner.time;
            grid[spawner.i][spawner.j] += spawner.num;
            spawner.num += spawner.increase;
        }
    });
}
function updateGrid() {
    let changedCells = new Set();
    info.prevTotalAdded = info.totalAdded;
    info.prevTotalColor = info.totalColor;
    info.prevTotalAntiColor = info.totalAntiColor;

    info.totalAdded = 0;
    info.totalColor = 0;
    info.totalAntiColor = 0;
    // compute the next grid values
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            if (grid[i][j] === "wall") {
                nextGrid[i][j] = "wall";
                continue;
            }

            let left = i - 1;
            let right = i + 1;
            let up = j - 1;
            let down = j + 1;

            //Handle edges
            if (i === 0) left = 0;
            if (i === width - 1) right = width - 1;
            if (j === 0) up = 0;
            if (j === height - 1) down = height - 1;

            //Handle walls
            if (grid[left][j] === "wall") left = i;
            if (grid[right][j] === "wall") right = i;
            if (grid[i][up] === "wall") up = j;
            if (grid[i][down] === "wall") down = j;

            // calculate the diffusion
            let diffusion = 0;
            diffusion += grid[left][j];
            diffusion += grid[right][j];
            diffusion += grid[i][up];
            diffusion += grid[i][down];
            diffusion -= grid[i][j] * 4;
            diffusion /= 8;
            nextGrid[i][j] = grid[i][j] + diffusion;

            // check if the cell value has changed significantly
            if (Math.abs(nextGrid[i][j]) > 0.01) {
                changedCells.add([i, j]);
            }
            if(nextGrid[i][j] > 0) {
                info.totalColor += nextGrid[i][j];
            } else {
                info.totalAntiColor += nextGrid[i][j];
            }
            info.totalAdded += nextGrid[i][j];
        }
    }

    info.deltaAdded = info.totalAdded - info.prevTotalAdded;
    info.deltaColor = info.totalColor - info.prevTotalColor;
    info.deltaAntiColor = info.totalAntiColor - info.prevTotalAntiColor;

    let temp = grid;
    grid = nextGrid;
    nextGrid = temp;

    return changedCells;
}