let levels = [];

function createLevel() {
    let obj = getCurLevel();


    obj.createWalls();
    obj.createSpawners();
}

function getCurLevel() {
    return levels[getCurSpecies().levelType];
}

function addLevelData(dataObj) {
    dataObj.pos = levels.length;

    //Access by using a for loop using moduleData.length and moduleData[num] OR moduleData.<name>
    levels.push(dataObj);
    levels[dataObj.name] = dataObj;
}

addLevelData({
        name:"river",
        width:100,
        height:100,
        createWalls: function() {
            let newGrid = copyArray(grid);
            createRectangle(newGrid, 0, 0, 100, 100);
            createUnCircle(newGrid, grid, 50, 45, 49);
            createRectangle(newGrid, 42, 0, 57, 43);
            createCircle(newGrid, 50, 55, 33);

            createRectangle(newGrid, 0, 0, 100, 1); //top wall
            createRectangle(newGrid, 99, 0, 100, 100); //right wall

            grid = newGrid;
        },
        createSpawners: function() {
            addSpawner(28, 16, 5, 5, 20);
            addSpawner(71, 10, -4000, 0, 120);
        }
    });