

function gameTick() {


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
    if(theCell.type === "solarPanel") {
        thePlanet.panels++;
    }

    theCell.type = "";
    theCell.outline = "";

    view.selectCell(data.selectedCol, data.selectedRow);
    view.updatePlanetGridCell(data.selectedCol, data.selectedRow);
    view.changePlanetGridCell(data.selectedCol, data.selectedRow);
    view.updateResourcesDisplays();
}

function buyBuilding(type) {
    let thePlanet = data.systems[data.curSystem].planets[data.curPlanet];
    let theCell = thePlanet.grid[data.selectedCol][data.selectedRow];

    if(type === "solarPanel") {
        if (thePlanet.panels < 1) {
            addErrorMessage("Need at least 1 solar panel to build a Solar Panel.");
            return;
        } else {
            thePlanet.panels--;
        }
    }
    if(type === "factory") {
        if (thePlanet.ore < 10) {
            addErrorMessage("Factory costs 10 ore. You have " + thePlanet.ore + " ore.");
            return;
        } else {
            thePlanet.ore -= 10;
        }
    }
    if(type === "lab") {
        if (thePlanet.electronics < 50) {
            addErrorMessage("Lab costs 50 electronics. You have " + thePlanet.electronics + " electronics.");
            return;
        } else {
            thePlanet.electronics -= 50;
        }
    }
    if(type === "house") {
        if (thePlanet.ore < 100 || thePlanet.electronics < 30) {
            addErrorMessage("House costs 100 ore and 30 electronics. You have " + thePlanet.ore + " ore and " + thePlanet.electronics + " electronics.");
            return;
        } else {
            thePlanet.ore -= 100;
            thePlanet.electronics -= 30;
        }
    }
    if(type === "server") {
        if (thePlanet.electronics < 1000) {
            addErrorMessage("Server costs 1000 electronics. You have " + thePlanet.electronics + " electronics.");
            return;
        } else {
            thePlanet.electronics -= 1000;
        }
    }
    if(type === "quantumTransport") {
        if (thePlanet.electronics < 10000) {
            addErrorMessage("Server costs 10k electronics. You have " + thePlanet.electronics + " electronics.");
            return;
        } else {
            thePlanet.electronics -= 10000;
        }
    }
    if(type === "radioTelescope") {
        if (thePlanet.ore < 20000 || thePlanet.electronics < 20000) {
            addErrorMessage("Radio Telescope costs 20k ore and 20k electronics. You have " + thePlanet.ore + " ore and " + thePlanet.electronics + " electronics.");
            return;
        } else {
            thePlanet.ore -= 20000;
            thePlanet.electronics -= 20000;
        }
    }
    if(type === "launchPad") {
        if (thePlanet.electronics < 100000) {
            addErrorMessage("Launch Pad costs 100k electronics. You have " + thePlanet.electronics + " electronics.");
            return;
        } else {
            thePlanet.electronics -= 100000;
        }
    }

    theCell.type = type;
    theCell.outline = "off";

    view.selectCell(data.selectedCol, data.selectedRow);
    view.updatePlanetGridCell(data.selectedCol, data.selectedRow);
    view.changePlanetGridCell(data.selectedCol, data.selectedRow);
    view.updateResourcesDisplays();
}

function addErrorMessage(text) {
    errorMessages.push(text);
    view.createErrorMessages();
}

function closeError(i) {
    errorMessages.splice(i, 1);
    view.createErrorMessages();
}