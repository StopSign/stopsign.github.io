

function secondTick() {
   tickPlanetResources()

}

function tickPlanetResources() {
    let thePlanet = data.systems[data.curSystem].planets[data.curPlanet];


    let poweredCells = handlePower(thePlanet);
    if(poweredCells === undefined) { //error
        return;
    }

    let ore1 = thePlanet.ore;
    let electronics1 = thePlanet.electronics;
    let panels1 = thePlanet.panels;
    let sails1 = thePlanet.sails;
    let pop1 = thePlanet.pop;
    let vPop1 = thePlanet.vPop;
    let science1 = data.science;

    for(let i = 0; i < poweredCells.mine.length; i++) {
        thePlanet.ore += info.mine.gain[poweredCells.mine[i].mark];
    }

    for(let i = 0; i < poweredCells.factory.length; i++) {
        if(poweredCells.factory[i].option === 0) { //convert ore to elec
            let oreUsed = info.factory.gain[poweredCells.factory[i].mark] * 10;
            if(oreUsed > thePlanet.ore) {
                oreUsed = thePlanet.ore;
            }
            thePlanet.ore -= oreUsed;
            thePlanet.electronics += oreUsed / 10;
        }
    }

    for(let i = 0; i < poweredCells.factory.length; i++) {
        if(poweredCells.factory[i].option === 1) { //convert elec to panel
            let elecUsed = info.factory.gain2[poweredCells.factory[i].mark] / 2;
            if(elecUsed > thePlanet.electronics) {
                elecUsed = thePlanet.electronics;
            }
            thePlanet.electronics -= elecUsed;
            thePlanet.panels += elecUsed * 2;
        }
    }






    thePlanet.oreD = round5(thePlanet.ore - ore1);
    thePlanet.electronicsD = round5(thePlanet.electronics - electronics1);
    thePlanet.panelsD = round5(thePlanet.panels - panels1);
    thePlanet.sailsD = round5(thePlanet.sails - sails1);
    thePlanet.popD = round5(thePlanet.pop - pop1);
    thePlanet.vPopD = round5(thePlanet.vPop - vPop1);
    data.scienceD = round5(data.science - science1);



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

    handlePower(thePlanet);
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

    handlePower(thePlanet);
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

function selectOption(num) {
    let thePlanet = data.systems[data.curSystem].planets[data.curPlanet];
    let theCell = thePlanet.grid[data.selectedCol][data.selectedRow];

    theCell.option = num;

    if(document.getElementById("option0").classList.contains("pressedSelectOption")) {
        document.getElementById("option0").classList.add("selectOption");
        document.getElementById("option0").classList.remove("pressedSelectOption");
    }
    if(document.getElementById("option1").classList.contains("pressedSelectOption")) {
        document.getElementById("option1").classList.add("selectOption");
        document.getElementById("option1").classList.remove("pressedSelectOption");
    }

    let selected = document.getElementById("option"+num);
    selected.classList.add("pressedSelectOption");
    selected.classList.remove("selectOption");
}