function initialize() {
    //create planets
    addPlanet(0, 8, 8, 100, 3, 1);
    addPlanet(0, 8, 6, 90, 4, 2);
    addPlanet(0, 10, 8, 70, 1, 4);
    addPlanet(0, 4, 4, 60, 5, 8);

    data.systems[0].luminosity = 1;
    data.systems[0].distance = 0;


    data.systems[0].planets[0].panels = 1;

    view.changePlanets(0, 0);
    view.createResearch();
    view.createBuildOptions();
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
        popD:0,
        vPop:0,
        vPopD:0,
        ore:0,
        oreD:0,
        electronics:0,
        electronicsD:0,
        panels:0,
        panelsD:0,
        sails:0,
        sailsD:0,
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
                isOn:true,
                type:"",
                text:"",
                mark:0
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
            orePlaced++;
        }
    }
}

