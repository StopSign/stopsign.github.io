

function gameTick() {
    tickPlanetResources()

}

function tickPlanetResources() {
    let thePlanet = data.systems[data.curSystem].planets[data.curPlanet];


    let poweredCells = handlePower(thePlanet);
    if(poweredCells === undefined) { //error
        return;
    }


    thePlanet.oreD = calcOreD(poweredCells);
    thePlanet.ore = round5(thePlanet.ore + thePlanet.oreD / ticksPerSecond);
    thePlanet.electronicsD = calcElectronicsD(poweredCells);
    thePlanet.electronics = round5(thePlanet.electronics + thePlanet.electronicsD / ticksPerSecond);
    thePlanet.popD = calcPopD(poweredCells);
    thePlanet.pop = round5(thePlanet.pop + thePlanet.popD / ticksPerSecond);
    thePlanet.vPopD = calcVPopD(poweredCells);
    thePlanet.vPop = round5(thePlanet.vPop + thePlanet.vPopD / ticksPerSecond);
    thePlanet.panelsD = calcPanelsD(poweredCells);
    thePlanet.panels = round5(thePlanet.panels + thePlanet.panelsD / ticksPerSecond);
    thePlanet.sailsD = calcSailsD(poweredCells);
    thePlanet.sails = round5(thePlanet.sails + thePlanet.sailsD / ticksPerSecond);


}

function calcOreD(poweredCells) {
    let oreD = 0;
    for(let i = 0; i < poweredCells.mine.length; i++) {
        oreD += 1;
    }
    return oreD;
}

function calcElectronicsD(poweredCells) {
    return 0;
}

function calcVPopD(poweredCells) {
    return 0;
}

function calcPanelsD(poweredCells) {
    return 0;
}

function calcPopD(poweredCells) {
    return 0;
}

function calcSailsD(poweredCells) {
    return 0;
}


function handlePower(thePlanet) {
    let poweredCells = {
        ore:[],
        mine:[],
        //solarPanel:[],
        factory:[],
        lab:[],
        house:[],
        server:[],
        quantumTransport:[],
        radioTelescope:[],
        launchPad:[]
    };

    let powerGain = 0;
    let powerReq = 0;
    for(let col = 0; col < thePlanet.grid.length; col++) {
        for(let row = 0; row < thePlanet.grid[col].length; row++) {
            let theCell = thePlanet.grid[col][row];
            if(theCell.type === "solarPanel") {
                powerGain += info[theCell.type].power[theCell.mark];
            } else if(theCell.isOn && theCell.type && theCell.type !== "ore") {
                powerReq += info[theCell.type].power[theCell.mark];
                poweredCells[theCell.type].push(theCell);
            }
        }
    }

    if(powerReq > powerGain && powerReq > 0) {
        errorMessages.push("Not enough power! Shutting things off.");

        for(let col = 0; col < thePlanet.grid.length; col++) {
            for (let row = 0; row < thePlanet.grid[col].length; row++) {
                let theCell = thePlanet.grid[col][row];
                if(theCell.type && theCell.type !== "solarPanel" && theCell.type !== "ore" && theCell.type !== "mine") {
                    theCell.isOn = false;
                }
            }
        }
        return undefined;
    }

    thePlanet.powerReq = powerReq;
    thePlanet.powerGain = powerGain;
    return poweredCells;
}

function clickedCell(col, row) {
    let prevCol = data.selectedCol;
    let prevRow = data.selectedRow;
    if(data.selectedCol === col && data.selectedRow === row) {
        data.selectedCol = null;
        data.selectedRow = null;
    } else {
        data.selectedCol = col;
        data.selectedRow = row;
    }
    view.selectCell(data.selectedCol, data.selectedRow);
    if(prevCol !== null && prevRow !== null) {
        view.updatePlanetGridCell(prevCol, prevRow);
    }
}

function clickedResearch(i) {
    let theResearch = data.research[i];
    if(data.science < theResearch.cost) {
        addErrorMessage(theResearch.title + " costs " + theResearch.cost + " research points. You have " + data.science);
    } else {
        data.science -= theResearch.cost;
        theResearch.unlocked = true;
    }
    view.updateResourcesDisplays();
}

function sellBuilding() {
    let thePlanet = data.systems[data.curSystem].planets[data.curPlanet];
    let theCell = thePlanet.grid[data.selectedCol][data.selectedRow];

    let oreCost = info[theCell.type].oreCost[theCell.mark];
    let elecCost = info[theCell.type].electronicCost[theCell.mark];
    let panelCost = info[theCell.type].panelCost[theCell.mark];

    thePlanet.ore += oreCost;
    thePlanet.elecCost += elecCost;
    thePlanet.panels += panelCost;

    theCell.type = theCell.type === "mine" ? "ore" : "";
    theCell.outline = "";
    theCell.power = 0;

    view.selectCell(data.selectedCol, data.selectedRow);
    view.updatePlanetGridCell(data.selectedCol, data.selectedRow);
    view.changePlanetGridCell(data.selectedCol, data.selectedRow);
    view.updateResourcesDisplays();
}

function buyBuilding(type) {
    let thePlanet = data.systems[data.curSystem].planets[data.curPlanet];
    let theCell = thePlanet.grid[data.selectedCol][data.selectedRow];

    let oreCost = info[type].oreCost[theCell.mark];
    let elecCost = info[type].electronicCost[theCell.mark];
    let panelCost = info[type].panelCost[theCell.mark];
    let powerCost = info[type].power[theCell.mark];



    let errorMsg = info[type].title + " costs ";
    if(oreCost > 0) {
        errorMsg += oreCost + " ore";
    }
    if(elecCost > 0) {
        errorMsg += (oreCost > 0 ? " and " : "") + elecCost + " electronics";
    }
    if(panelCost > 0) {
        errorMsg += panelCost + " panels";
    }
    errorMsg += ". You have ";
    if(oreCost > 0) {
        errorMsg += thePlanet.ore + " ore";
    }
    if(elecCost > 0) {
        errorMsg += (oreCost > 0 ? " and " : "") + thePlanet.electronics + " electronics";
    }
    if(panelCost > 0) {
        errorMsg += thePlanet.panels + " panels";
    }
    errorMsg += ".";

    if(thePlanet.panels < panelCost || thePlanet.ore < oreCost || thePlanet.electronics < elecCost) {
        addErrorMessage(errorMsg);
        return;
    }

    if(type !== "solarPanel" && thePlanet.powerGain - thePlanet.powerReq < powerCost) {
        addErrorMessage("Adding a " + info[type].title + " right now would crash the power grid!");
        return;
    }

    thePlanet.panels -= panelCost;
    thePlanet.ore -= oreCost;
    thePlanet.electronics -= elecCost;

    theCell.type = type;
    theCell.outline = "off";
    theCell.isOn = true;

    view.selectCell(data.selectedCol, data.selectedRow);
    view.updatePlanetGridCell(data.selectedCol, data.selectedRow);
    view.changePlanetGridCell(data.selectedCol, data.selectedRow);
    view.updateResourcesDisplays();
}

function pauseBuilding() {
    let thePlanet = data.systems[data.curSystem].planets[data.curPlanet];
    let theCell = thePlanet.grid[data.selectedCol][data.selectedRow];
    theCell.isOn = !theCell.isOn;
}

function addErrorMessage(text) {
    errorMessages.push(text);
    view.createErrorMessages();
}

function closeError(i) {
    errorMessages.splice(i, 1);
    view.createErrorMessages();
}