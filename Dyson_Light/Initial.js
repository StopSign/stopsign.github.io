function initialize() {
    //create planets
    addPlanet(0, 8, 8, 100, 3, 1);
    addPlanet(0, 8, 6, 90, 4, 2);
    addPlanet(0, 10, 8, 70, 1, 4);
    addPlanet(0, 4, 4, 60, 5, 8);

    data.systems[0].luminosity = 1;
    data.systems[0].distance = 0;

    view.changePlanets(0, 0);
    view.initializeResearch();
}

function addPlanet(solarSystemNum, gridWidth, gridHeight, solarEfficiency, oreNum, distance) {
    if(data.systems.length <= solarSystemNum) {
        let system = {
            planets:[],
            dyson:[]
        };
        data.systems.push(system);
    }
    let newPlanet = {
        pop:0,
        virtualPop:0,
        ore:0,
        electronics:0,
        panels:0,
        sails:0,
        power:0,
        grid:[],
        distance:distance
    };
    data.systems[solarSystemNum].planets.push(newPlanet);
    for(let width = 0; width < gridWidth; width++) {
        newPlanet.grid.push([]);
        for(let height = 0; height < gridHeight; height++) {
            let cellContents = {
                outline:"", //empty, off, error, warning
                isOn:false,
                type:"",
                text:""
            };
            newPlanet.grid[width][height] = cellContents;
        }
    }
    let orePlaced = 0;
    while(orePlaced < oreNum) {
        let randX = (Math.random()*gridWidth)|0;
        let randY = (Math.random()*gridHeight)|0;
        if(newPlanet.grid[randX][randY].type !== "ore") {
            newPlanet.grid[randX][randY].type = "ore";
            newPlanet.grid[randX][randY].text = "Ore";
            orePlaced++;
        }
    }
}

