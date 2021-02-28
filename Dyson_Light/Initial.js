function addPlanet(solarSystemNum, gridWidth, gridHeight, oreNum, distance) {
    if(data.systems.length <= solarSystemNum) {
        let system = {
            planets:[],
            sailsFromPlanet:[],
            sailsInOrbit:[],
            sailsFromSun:[],
            powerReq:0,
            powerGain:0,
            progress:0
        };
        initializeValidDysonPoints(system);
        data.systems.push(system);
    }
    let newPlanet = {
        pop:0,
        popD:0,
        popTotal:0,
        vPop:0,
        vPopD:0,
        vPopTotal:0,
        workers:0,
        ore:0,
        oreD:0,
        electronics:0,
        electronicsD:0,
        panels:0,
        panelsD:0,
        sails:0,
        sailsD:0,
        launching:0,
        launchingD:0,
        powerReq:0,
        powerGain:0,
        mineWorker:0,
        factoryWorker:0,
        labWorker:0,
        quantumTransportWorker:0,
        launchPadWorker:0,
        hasRadio:false,
        autoWorker:"",
        grid:[],
        distance:distance
    };
    data.systems[solarSystemNum].planets.push(newPlanet);
    for(let width = 0; width < gridWidth; width++) {
        newPlanet.grid.push([]);
        for(let height = 0; height < gridHeight; height++) {
            let cellContents = {
                isOn:true,
                type:"",
                text:"",
                mark:0,
                isOre:false
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
            newPlanet.grid[randX][randY].isOre = true;
            orePlaced++;
        }
    }
}

