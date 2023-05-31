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
    for (let i = 0; i < getCurLevel().width; i++) {
        let row = [];
        for (let j = 0; j < getCurLevel().height; j++) {
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
        // console.log(spawner.i, spawner.j, spawner.num, spawner.curTime, spawner.time)
    });
}
function updateGrid() {
    let changedCells = new Set();
    info.prevTotalAdded = info.totalAdded;
    info.prevTotalColor = info.totalSpecies;
    info.prevTotalAntiColor = info.totalEnemy;

    info.totalAdded = 0;
    info.totalSpecies = 0;
    info.totalEnemy = 0;
    // compute the next grid values
    for (let i = 0; i < getCurLevel().width; i++) {
        for (let j = 0; j < getCurLevel().height; j++) {
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
            if (i === getCurLevel().width - 1) right = getCurLevel().width - 1;
            if (j === 0) up = 0;
            if (j === getCurLevel().height - 1) down = getCurLevel().height - 1;

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
                info.totalSpecies += nextGrid[i][j];
            } else {
                info.totalEnemy += nextGrid[i][j];
            }
            info.totalAdded += nextGrid[i][j];
        }
    }

    info.deltaAdded = info.totalAdded - info.prevTotalAdded;
    info.deltaSpecies = info.totalSpecies - info.prevTotalColor;
    info.deltaEnemy = info.totalEnemy - info.prevTotalAntiColor;

    let temp = grid;
    grid = nextGrid;
    nextGrid = temp;

    return changedCells;
}