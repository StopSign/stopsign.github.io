let levels = [];

function createLevel() {
    let obj = levels[getCurSpecies().mapType];
    obj.createWalls();
}

function addLevelData(dataObj) {
    dataObj.pos = levels.length;

    //Access by using a for loop using moduleData.length and moduleData[num] OR moduleData.<name>
    levels.push(dataObj);
    levels[dataObj.name] = dataObj;
}

addLevelData({
        name:"river",
        createWalls: function() {
            createWall(54, 35, 55, 65);
            createWall(25, 64, 55, 65);
            createWall(5, 34, 55, 35);
        }
    });