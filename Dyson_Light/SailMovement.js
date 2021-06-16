
function quickTick() {
    for(let i = 0; i < data.systems.length; i++) {
        handleSailMovement(data.systems[i], i);
    }
}

function handleSailMovement(theSystem, systemNum) {
    //     sailsFromPlanet:[],
    //     sailsInOrbit:[],
    //     sailsFromSun:[],
    //     dyson:[],

    let newSunSails = moveSails(theSystem.sailsFromPlanet, planetSailIdPool).length;
    let newDysonTargetSails = moveSails(theSystem.sailsInOrbit, sunSailIdPool);
    let newDysonSails = moveSails(theSystem.sailsFromSun, sunSailIdPool);

    for(let j = 0; j < newSunSails; j++) {
        addNewSunSails(theSystem);
    }

    for(let j = 0; j < newDysonTargetSails.length; j++) {
        addNewDysonTargetSails(theSystem, newDysonTargetSails[j]);
    }

    for(let j = 0; j < newDysonSails.length; j++) {
        addNewDysonSail(theSystem, newDysonSails[j]);
        if(systemNum === data.curSystem ) {
            view.addDysonSpherePoint(newDysonSails[j].targetDysonX, newDysonSails[j].targetDysonY);
            // theSystem.powerGain++;
            // if(theSystem.powerGain === theSystem.totalDyson) {
            //     winGame();
            // }
        }
    }

    let totalE = 0;
    for(let col = 0; col < theSystem.dysonPoints.length; col++) {
        for(let row = 0; row < theSystem.dysonPoints[0].length; row++) {
            if(theSystem.dysonPoints[col][row] === 2) {
                totalE++;
            }
        }
    }
    theSystem.powerGain = totalE;
    if(theSystem.powerGain === theSystem.totalDyson && canWin) {
        winGame();
    }

    for(let i = 0; i < theSystem.planets.length; i++) {
        handleNewSails(theSystem, i);
    }
}

function addNewDysonSail(theSystem, theSail) {
    theSystem.dysonPoints[theSail.targetDysonX][theSail.targetDysonY] = 2;
}

function moveSails(theList, theIdPool) {
    let reachedTarget = [];
    for(let i = theList.length - 1; i >= 0; i--) {
        let sailObj = theList[i];

        sailTravel(sailObj, sailObj.speed);
        if(sailObj.timer > 0) {
            sailObj.timer--;
        }
        if(withinDistance(sailObj.curX, sailObj.curY, sailObj.targetX, sailObj.targetY, 3) || sailObj.timer <= 0) {
            if(sailObj.timer > 0) { // loop the orbiting ones
                sailObj.curX = 0;
                continue;
            }
            reachedTarget.push(sailObj);
            theIdPool.push(sailObj.id);
            theList.splice(i, 1);
        }
    }
    return reachedTarget;
}

function sailTravel(sailObj, speed) {
    let magnitude = speed;
    let extraTurn = 0;
    let firstVC = sailObj.targetY - sailObj.curY;
    let secondVC = sailObj.targetX - sailObj.curX;
    if((firstVC >= 0 && secondVC < 0) || (firstVC < 0 && secondVC < 0)) {
        extraTurn = Math.PI;
    }
    let direction = Math.atan(firstVC/secondVC)+extraTurn; //(y2-y1)/(x2-x1)
    sailObj.curX = sailObj.curX + magnitude * Math.cos(direction); //||v||cos(theta)
    sailObj.curY = sailObj.curY + magnitude * Math.sin(direction);
}

function handleNewSails(theSystem, planetNum) {
    let thePlanet = theSystem.planets[planetNum];
    if (thePlanet.launching < 1) {
        return;
    }
    let totalDysonUsed = theSystem.sailsFromPlanet.length + theSystem.sailsInOrbit.length + theSystem.sailsFromSun.length + theSystem.powerGain;
    let availableLaunch = theSystem.totalDyson - totalDysonUsed;
    //console.log(totalDysonUsed, availableLaunch);
    if(availableLaunch < 1) {
        return; //no more launch
    }
    thePlanet.launching--;

    let newId = data.sailId;
    if(planetSailIdPool.length) {
        newId = planetSailIdPool[0];
        planetSailIdPool.splice(0, 1);
    } else {
        data.sailId++;
    }
    let sailObj = {
        id:newId,
        targetX:0, //bottom left corner
        targetY:640,
        speed:.5
    };
    let launchFromPlanet = planetNum !== data.curPlanet;
    if(planetNum === data.curPlanet) {
        let validLaunchPads = [];
        let xMod = (500 - Number(document.getElementById("buildingZone").style.width.substring(0, 3))) / 2;
        for(let col = 0; col < thePlanet.grid.length; col++) {
            for (let row = 0; row < thePlanet.grid[col].length; row++) {
                let theCell = thePlanet.grid[col][row];
                if(theCell.type === "launchPad" && theCell.isOn && theCell.option === 1) {
                    validLaunchPads.push({
                        cell:theCell,
                        x:col * 50 + xMod + 25,
                        y:row * 50 + 25
                    });
                }
            }
        }
        if(!validLaunchPads.length) { //launch pad deleted?
            launchFromPlanet = true;
        } else {
            let chosenLaunchPad = validLaunchPads[(Math.random() * validLaunchPads.length) | 0];
            sailObj.curX = chosenLaunchPad.x;
            sailObj.curY = chosenLaunchPad.y;
        }
    }
    if(launchFromPlanet) {
        sailObj.curX = planetNum * 120 + 70;
        sailObj.curY = 460;
        sailObj.speed = .2;
    }
    theSystem.sailsFromPlanet.push(sailObj);
}

function addNewSunSails(theSystem) {
    let newId = data.SsailId;

    if(sunSailIdPool.length) {
        newId = sunSailIdPool[0];
        sunSailIdPool.splice(0, 1);
    } else {
        data.SsailId++;
    }
    let rand = (Math.random() * 60)|0;
    let seconds = ((Math.random() * 30)|0) + 120;
    let speed = (Math.random()*.3)+.7;
    let sailObj = {
        id:newId,
        curX:0, //left side
        curY:290 + rand,
        targetX:1100,
        targetY:290 + rand,
        timer:seconds * ticksPerSecond,
        speed:speed
    };

    theSystem.sailsInOrbit.push(sailObj);
}

function addNewDysonTargetSails(theSystem, prevSailObj) {
    let newId = data.SsailId;

    if(sunSailIdPool.length) {
        newId = sunSailIdPool[0];
        sunSailIdPool.splice(0, 1);
    } else {
        data.SsailId++;
    }

    let point = getNextDysonPoint(theSystem);
    //console.log("Targeting " + point.x + ", " + point.y);

    let sailObj = {
        id:newId,
        curX:prevSailObj.curX, //left side
        curY:prevSailObj.curY,
        targetX:point.x * sailWidth + sunLeft,
        targetY:point.y * sailWidth + sunTop,
        targetDysonX:point.x,
        targetDysonY:point.y,
        speed:.3
    };

    theSystem.sailsFromSun.push(sailObj);
}

function getNextDysonPoint(theSystem) {
    let validPoints = [];
    //goal is to make a list of valid points and choose randomly among it
    //everything on dysonPoints[100] is valid to start
    //for each cell, if it's next to either a dyson point or a sailsFromSun's sail, it's valid
    for(let col = 0; col < theSystem.dysonPoints.length; col++) {
        for (let row = 0; row < theSystem.dysonPoints[col].length; row++) {
            if(isValidPoint(theSystem, col, row)) {
                validPoints.push({x:col,y:row});
            }
        }
    }

    return validPoints[Math.floor(Math.random() * validPoints.length)];
}

function isValidPoint(theSystem, col, row) {
    if(theSystem.dysonPoints[col][row] === 0 || isSpotOccupied(theSystem, col, row)) {
        return false;
    }
    if(row === 100) { //starting row
        return true;
    }
    let neighborFound = false;
    neighborFound = neighborFound || (isPossiblePoint(theSystem, col, row-1) && isSpotOccupied(theSystem, col, row-1));
    neighborFound = neighborFound || (isPossiblePoint(theSystem, col, row+1) && isSpotOccupied(theSystem, col, row+1));
    neighborFound = neighborFound || (isPossiblePoint(theSystem, col-1, row) && isSpotOccupied(theSystem, col-1, row));
    neighborFound = neighborFound || (isPossiblePoint(theSystem, col+1, row) && isSpotOccupied(theSystem, col+1, row));

    return neighborFound;
}

function isPossiblePoint(theSystem, col, row) {
    return !(col < 0 || col >= theSystem.dysonPoints.length || row < 0 || row >= theSystem.dysonPoints[0].length);
}

function isSpotOccupied(theSystem, col, row) {
    for(let i = 0; i < theSystem.sailsFromSun.length; i++) {
        let sailObj = theSystem.sailsFromSun[i];
        if (col === sailObj.targetDysonX && row === sailObj.targetDysonY) {
            return true;
        }
    }
    return theSystem.dysonPoints[col][row] === 2;
}

//create a global 2d array of valid points
let sailWidth = 3;
let sunWidth = 600;
let sunLeft = 250;
let sunTop = 20;
function initializeValidDysonPoints(theSystem) {
    theSystem.dysonPoints = [];
    theSystem.totalDyson = 0;
    theSystem.powerGain = 0;
    theSystem.powerReq = 0;
    for(let col = 0; col < sunWidth / sailWidth; col++) {
        theSystem.dysonPoints[col] = [];
        for(let row = 0; row < sunWidth / sailWidth; row++) {
            let center = {x:sunWidth/2, y:sunWidth/2};
            let tile = {x:col*sailWidth, y:row*sailWidth};
            let isInside = insideCircle(center, tile, sunWidth/2) ? 1 : 0;
            theSystem.dysonPoints[col][row] = isInside;
            if(isInside) {
                theSystem.totalDyson++;
            }
        }
    }
}

function insideCircle(center, tile, radius) {
    let dx = center.x - tile.x;
    let dy = center.y - tile.y;
    let distanceSquared = dx*dx + dy*dy;
    return distanceSquared <= radius*radius;
}