

function onEachCell(func) {
    const cells = document.querySelectorAll(".cell");
    for (let i = 0; i < cells.length; i++) {
        func(cells[i]);
    }
}



//Methods to affect a level
function createWall(x1, y1, x2, y2) {
    for(let i = x1; i < x2; i++) {
        for (let j = y1; j < y2; j++) {
            grid[i][j] = "wall";
        }
    }
}
function addSpawner(i, j, num, increase, time) {
    spawners.push({i:i, j:j, num:num, increase:increase, time:time, curTime:0});
}

function getCurSpecies() {
    return data.species[curSpecies];
}