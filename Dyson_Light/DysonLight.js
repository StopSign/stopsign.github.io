

function secondTick() {
    data.totalTime++;

    //save pre-resources
    let resourceList = ["ore", "electronics", "panels", "sails", "pop", "vPop", "launching"];
    let deltaArray = [];
    for(let i = 0; i < data.systems.length; i++) {
        deltaArray[i] = [];
        for (let j = 0; j < data.systems[i].planets.length; j++) {
            deltaArray[i][j] = [];
            for(let k = 0; k < resourceList.length; k++) {
                deltaArray[i][j][k] = data.systems[i].planets[j][resourceList[k]];
            }
        }
    }


    let science1 = data.science;
    //change resources
    for(let i = 0; i < data.systems.length; i++) {
        for(let j = 0; j < data.systems[i].planets.length; j++) {
            let poweredCells = tickPlanetResources(i, j);
            if(poweredCells === undefined) {
                continue;
            }
            for(let k = 0; k < poweredCells.lab.length; k++) {
                data.science = round5(data.science + info.lab.gain[poweredCells.lab[k].mark] * (1 + data.systems[i].planets[j].labWorker/20));
            }
        }
    }
    data.scienceD = round5(data.science - science1);

    //apply differences to the delta variables
    for(let i = 0; i < data.systems.length; i++) {
        for (let j = 0; j < data.systems[i].planets.length; j++) {
            for(let k = 0; k < resourceList.length; k++) {
                data.systems[i].planets[j][resourceList[k]+"D"] = round5(data.systems[i].planets[j][resourceList[k]] - deltaArray[i][j][k]);
            }
        }
    }

}

function tickPlanetResources(systemNum, planetNum) {
    let thePlanet = data.systems[systemNum].planets[planetNum];

    let poweredCells = handlePower(planetNum, systemNum);
    if(poweredCells === undefined) { //error message
        return;
    }

    handleMaterials(poweredCells, thePlanet);

    setWorkers(poweredCells, thePlanet);

    giveForeignMaterial(poweredCells, thePlanet);

    return poweredCells;
}

function giveForeignMaterial(poweredCells, thePlanet) {
    let theList = ["ore", "electronics", "panels", "vPop", "sails"];
    let modifier = [1, .1, .05, .01, .005];
    for(let i = 0; i < poweredCells.quantumTransport.length; i++) {
        let theCell = poweredCells.quantumTransport[i];
        let targetPlanet = data.systems[0].planets[theCell.option2];
        let amountTransferred = info[theCell.type].gain[theCell.mark] * modifier[theCell.option] * (1 + thePlanet.quantumTransportWorker/20);
        if(thePlanet[theList[theCell.option]] < amountTransferred) {
            amountTransferred = thePlanet[theList[theCell.option]];
        }
        if(theList[theCell.option] === "vPop") {
            if(!targetPlanet.hasRadio) {
                amountTransferred = 0;
            } else {
                //only transfer if workers available
                //let workersAvailable = thePlanet.workers;
                if(amountTransferred > thePlanet.workers) {
                    amountTransferred = thePlanet.workers;
                }
                //amountTransferred = thePlanet.vPopD;
            }
        }
        thePlanet[theList[theCell.option]] = round5(thePlanet[theList[theCell.option]] - amountTransferred);
        targetPlanet[theList[theCell.option]] = round5(targetPlanet[theList[theCell.option]] + amountTransferred);
    }
}

function handleMaterials(poweredCells, thePlanet) {
    for(let i = 0; i < poweredCells.mine.length; i++) {
        thePlanet.ore = round5(thePlanet.ore + info.mine.gain[poweredCells.mine[i].mark] * (1 + thePlanet.mineWorker/20));
    }

    for(let i = 0; i < poweredCells.factory.length; i++) {
        if(poweredCells.factory[i].option === 0) { //convert ore to elec
            let oreUsed = info.factory.gain[poweredCells.factory[i].mark] * 10 * (1 + thePlanet.factoryWorker/20);
            if(oreUsed > thePlanet.ore) {
                oreUsed = thePlanet.ore;
            }
            thePlanet.ore = round5(thePlanet.ore - oreUsed);
            thePlanet.electronics = round5(thePlanet.electronics + oreUsed / 10);
        }
    }

    for(let i = 0; i < poweredCells.factory.length; i++) {
        if(poweredCells.factory[i].option === 1) { //convert elec to panel
            let elecUsed = info.factory.gain2[poweredCells.factory[i].mark] * 2 * (1 + thePlanet.factoryWorker/20);
            if(elecUsed > thePlanet.electronics) {
                elecUsed = thePlanet.electronics;
            }
            thePlanet.electronics = round5(thePlanet.electronics - elecUsed);
            thePlanet.panels = round5(thePlanet.panels + elecUsed / 2);
        }
    }

    for(let i = 0; i < poweredCells.launchPad.length; i++) {
        if(poweredCells.launchPad[i].option === 0) { //convert panels to sails
            let panelsUsed = info.launchPad.gain[poweredCells.launchPad[i].mark] * 100 * (1 + thePlanet.launchPadWorker/20);
            if(panelsUsed > thePlanet.panels) {
                panelsUsed = thePlanet.panels;
            }
            thePlanet.panels = round5(thePlanet.panels - panelsUsed);
            thePlanet.sails = round5(thePlanet.sails + panelsUsed / 100);
        }
    }

    for(let i = 0; i < poweredCells.launchPad.length; i++) {
        if(poweredCells.launchPad[i].option === 1) { //launch sails
            let sailsUsed = info.launchPad.gain2[poweredCells.launchPad[i].mark] * (1 + thePlanet.launchPadWorker/20);
            if(sailsUsed > thePlanet.sails) {
                sailsUsed = thePlanet.sails;
            }
            thePlanet.sails = round5(thePlanet.sails - sailsUsed);
            thePlanet.launching = round5(thePlanet.launching + sailsUsed);
        }
    }
}

function setWorkers(poweredCells, thePlanet) {
    thePlanet.popTotal = 0;
    for(let i = 0; i < poweredCells.house.length; i++) {
        thePlanet.popTotal += info.house.gain[poweredCells.house[i].mark];
    }
    let houseGain = thePlanet.pop / 1000;
    if(houseGain + thePlanet.pop > thePlanet.popTotal) {
        houseGain = thePlanet.popTotal - thePlanet.pop;
    }
    if(thePlanet.pop < 2 && thePlanet.popTotal) { //initial
        houseGain = 2;
    }
    let vPopGain = thePlanet.pop / 1000 - houseGain;
    thePlanet.pop = round7(thePlanet.pop + houseGain);

    thePlanet.vPopTotal = 0;
    for(let i = 0; i < poweredCells.server.length; i++) {
        thePlanet.vPopTotal += info.server.gain[poweredCells.server[i].mark];
    }

    if(vPopGain < 0) {
        vPopGain = 0;
    }
    if(vPopGain + thePlanet.vPop > thePlanet.vPopTotal) {
        vPopGain = thePlanet.vPopTotal - thePlanet.vPop;
    }
    thePlanet.vPop = round5(thePlanet.vPop + vPopGain);
    thePlanet.vPopD = vPopGain;

    let workersCurr = thePlanet.mineWorker + thePlanet.factoryWorker + thePlanet.labWorker + thePlanet.quantumTransportWorker + thePlanet.launchPadWorker;
    let workers1 = thePlanet.workers;
    thePlanet.workers = Math.floor(thePlanet.pop + thePlanet.vPop - workersCurr + .0000001);
    if(thePlanet.workers > workers1 && thePlanet.autoWorker) {
        let workerDiff = thePlanet.workers - workers1;
        thePlanet[thePlanet.autoWorker+"Worker"] += workerDiff;
        thePlanet.workers -= workerDiff;
        if(thePlanet === data.systems[data.curSystem].planets[data.curPlanet]) {
            view.changeWorkers();
        }
    }
}

function handlePower(planetNum, systemNum) {
    let thePlanet = data.systems[systemNum].planets[planetNum];
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
            if(theCell.type === "radioTelescope") {
                continue;
            }
            if(theCell.type === "solarPanel") {
                powerGain += info[theCell.type].gain[theCell.mark];
            } else if(theCell.isOn && theCell.type && theCell.type !== "ore") {
                if(theCell.type === "quantumTransport") {
                    powerReq += getPowerForQTrans(thePlanet, 0, theCell.option2);
                } else {
                    powerReq += info[theCell.type].power[theCell.mark];
                }
                poweredCells[theCell.type].push(theCell);
            }
        }
    }

    let theSystem = data.systems[systemNum];
    theSystem.powerReq = 0;
    for(let i = 0; i < theSystem.planets.length; i++) {
        let radioPlanet = theSystem.planets[i];
        for(let col = 0; col < radioPlanet.grid.length; col++) {
            for (let row = 0; row < radioPlanet.grid[col].length; row++) {
                let theCell = radioPlanet.grid[col][row];
                if(theCell.type !== "radioTelescope" || theCell.option !== 1) {
                    continue;
                }
                let availableDysonPower = theSystem.powerGain - theSystem.powerReq;
                if(availableDysonPower > info[theCell.type].gain[theCell.mark]) {
                    availableDysonPower = info[theCell.type].gain[theCell.mark];
                }
                theSystem.powerReq += availableDysonPower;
                if(planetNum === i) {
                    powerGain += availableDysonPower;
                }
            }
        }
    }


    if(powerReq > powerGain && powerReq > 0) {
        errorMessages.push("Not enough power! You need "+(powerReq - powerGain)+" more. Shutting things off.");

        for(let col = 0; col < thePlanet.grid.length; col++) {
            for (let row = 0; row < thePlanet.grid[col].length; row++) {
                let theCell = thePlanet.grid[col][row];
                if(theCell.type && theCell.type !== "ore" && info[theCell.type].pausable) {
                    theCell.isOn = false;
                    view.updatePlanetGridCell(col, row);
                }
            }
        }
        view.createErrorMessages();
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
    let theResearch = researchInfo[i];
    if(data.science < theResearch.cost) {
        addErrorMessage(theResearch.title + " costs " + theResearch.cost + " research points. You have " + round2(data.science));
    } else {
        data.science -= theResearch.cost;
        data.research[theResearch.unlocks.type][theResearch.unlocks.num] = true;
    }
    view.updateResourcesDisplays();
    view.createResearch();
    view.selectCell(data.selectedCol, data.selectedRow); //refresh options
}

function upgradeBuilding() {
    let thePlanet = data.systems[data.curSystem].planets[data.curPlanet];
    if(data.selectedRow == null || data.selectedCol == null) { //press hotkey when nothing selected
        return;
    }
    let theCell = thePlanet.grid[data.selectedCol][data.selectedRow];
    if(!data.research[theCell.type] || !data.research[theCell.type][theCell.mark]) { //not unlocked yet
        return;
    }

    let oreCostNext = info[theCell.type].oreCost[theCell.mark+1];
    let elecCostNext = info[theCell.type].electronicCost[theCell.mark+1];
    let panelCostNext = info[theCell.type].panelCost[theCell.mark+1];
    let powerCostNext = info[theCell.type].power[theCell.mark+1] - info[theCell.type].power[theCell.mark];

    if(!checkCostAllowed(thePlanet, theCell.type, oreCostNext, elecCostNext, panelCostNext, powerCostNext, true)) {
        return;
    }

    theCell.mark++;

    handlePower(data.curPlanet, data.curSystem);

    view.updatePlanetGridCell(data.selectedCol, data.selectedRow);
    view.createBuildingInfo(theCell);
    view.updateResourcesDisplays();
}

function buyBuilding(type) {
    let thePlanet = data.systems[data.curSystem].planets[data.curPlanet];
    if(data.selectedRow == null || data.selectedCol == null) { //press hotkey when nothing selected
        return;
    }
    let theCell = thePlanet.grid[data.selectedCol][data.selectedRow];

    //prevent buildings from happening via hotkeys
    if(theCell.type !== "ore" && type === "mine") {
        return;
    }
    if(theCell.type && theCell.type !== "ore") {
        return;
    }
    if(type === "house" && !data.research.unlock[0]
    || type === "server" && !data.research.unlock[1]
    || type === "quantumTransport" && !data.research.unlock[2]
    || type === "radioTelescope" && !data.research.unlock[3]
    || type === "launchPad" && !data.research.unlock[4]) {
        return;
    }
    if((data.curSystem !== 0 || data.curPlanet !== 0) && theCell.type === "ore" && (thePlanet.ore === 0 && thePlanet.electronics === 0 && thePlanet.panels === 0 && thePlanet.sails === 0)) {
        addErrorMessage("Can't start mining until the planet is connected to a Quantum Transport! Send any resource to this planet and you can start mining.");
        view.createErrorMessages();
        return;
    }
    if(type === "server") {
        for(let col = 0; col < thePlanet.grid.length; col++) {
            for (let row = 0; row < thePlanet.grid[col].length; row++) {
                let theCell2 = thePlanet.grid[col][row];
                if(theCell2.type === "server") {
                    addErrorMessage("Cannot build another server - only 1 server allowed per planet!");
                    return;
                }
            }
        }
    }

    let oreCost = info[type].oreCost[theCell.mark];
    let elecCost = info[type].electronicCost[theCell.mark];
    let panelCost = info[type].panelCost[theCell.mark];
    let powerCost = info[type].power[theCell.mark];
    if(!checkCostAllowed(thePlanet, type, oreCost, elecCost, panelCost, powerCost)) {
        return;
    }

    theCell.type = type;
    theCell.isOn = theCell.type !== "quantumTransport"; //only qTrans starts off
    if(info[theCell.type].optionText) {
        theCell.option = 0;
    }
    if(info[theCell.type].optionText2) {
        theCell.option2 = 0;
    }
    if(theCell.type === "radioTelescope" && theCell.option === 0) {
        thePlanet.hasRadio = true;
    }

    handlePower(data.curPlanet, data.curSystem);

    view.selectCell(data.selectedCol, data.selectedRow);
    view.updatePlanetGridCell(data.selectedCol, data.selectedRow);
    view.changePlanetGridCell(data.selectedCol, data.selectedRow);
    view.updateResourcesDisplays();
}

function checkCostAllowed(thePlanet, type, oreCost, elecCost, panelCost, powerCost, isUpgrade) {
    let errorMsg = info[type].title + " costs ";
    if(oreCost > 0) {
        errorMsg += oreCost + " ore";
    }
    if(elecCost > 0) {
        errorMsg += (oreCost > 0 ? " and " : "") + elecCost + " electronics";
    }
    if(panelCost > 0) {
        errorMsg += (oreCost > 0 || elecCost > 0 ? " and " : "") + panelCost + " panels";
    }
    errorMsg += ". You have ";
    if(oreCost > 0) {
        errorMsg += round2(thePlanet.ore) + " ore";
    }
    if(elecCost > 0) {
        errorMsg += (oreCost > 0 ? " and " : "") + round2(thePlanet.electronics) + " electronics";
    }
    if(panelCost > 0) {
        errorMsg += (oreCost > 0 || elecCost > 0 ? " and " : "") + round2(thePlanet.panels) + " panels";
    }
    errorMsg += ".";

    if(thePlanet.panels < panelCost || thePlanet.ore < oreCost || thePlanet.electronics < elecCost) {
        addErrorMessage(errorMsg);
        return false;
    }

    if(type !== "solarPanel" && thePlanet.powerGain - thePlanet.powerReq < powerCost) {
        if(isUpgrade) {
            addErrorMessage("Upgrading this " + info[type].title + " right now would crash the power grid!");
        } else {
            addErrorMessage("Adding a " + info[type].title + " right now would crash the power grid!");
        }
        return false;
    }

    thePlanet.panels -= panelCost;
    thePlanet.ore -= oreCost;
    thePlanet.electronics -= elecCost;

    return true;
}

function sellBuilding() {
    let thePlanet = data.systems[data.curSystem].planets[data.curPlanet];
    if(data.selectedRow == null || data.selectedCol == null) { //press hotkey when nothing selected
        return;
    }
    let theCell = thePlanet.grid[data.selectedCol][data.selectedRow];

    if(theCell.type === "house") {
        let reducedPopTotal = thePlanet.popTotal - info[theCell.type].gain[theCell.mark];
        if(thePlanet.pop > reducedPopTotal) {
            let reducedWorkers = Math.floor(thePlanet.pop - reducedPopTotal+.000001);
            if(thePlanet.workers < reducedWorkers) {
                addErrorMessage("You need " + (reducedWorkers - thePlanet.workers) + " more free workers to sell this house!");
                return;
            }
        }
    }
    if(theCell.type === "server") {
        let reducedPopTotal = thePlanet.vPopTotal - info[theCell.type].gain[theCell.mark];
        if(thePlanet.vPop > reducedPopTotal) {
            let reducedWorkers = Math.floor(thePlanet.vPop - reducedPopTotal+.000001);
            if(thePlanet.workers < reducedWorkers) {
                addErrorMessage("You need " + (reducedWorkers - thePlanet.workers) + " more free workers to sell this server!");
                return;
            }
        }
    }
    if(theCell.type === "radioTelescope") {
        //check if that's the last radio telescope
        let foundAnotherRadio = false;
        for(let col = 0; col < thePlanet.grid.length; col++) {
            for (let row = 0; row < thePlanet.grid[col].length; row++) {
                if(col === data.selectedCol && row === data.selectedRow) { //about to sell this one
                    continue;
                }
                let theCell2 = thePlanet.grid[col][row];
                if(theCell2.type === "radioTelescope" && theCell2.option === 0) {
                    foundAnotherRadio = true;
                }
            }
        }
        thePlanet.hasRadio = foundAnotherRadio;

        //reset power across planets
        // data.systems[data.curSystem].powerReq = 0;
        // for(let i = 0; i < data.systems[data.curSystem].planets.length; i++) {
        //     handlePower(data.systems[data.curSystem].planets[i], data.systems[i]);
        // }
    }

    let oreCost = 0;
    let elecCost = 0;
    let panelCost = 0;

    for(let i = 0; i < (theCell.mark+1); i++) {
        if(!info[theCell.type]) {
            break;
        }
        oreCost += info[theCell.type].oreCost[i];
        elecCost += info[theCell.type].electronicCost[i];
        panelCost += info[theCell.type].panelCost[i];
    }

    thePlanet.ore += oreCost;
    thePlanet.electronics += elecCost;
    thePlanet.panels += panelCost;

    theCell.type = theCell.isOre ? "ore" : "";
    theCell.isOn = true;
    theCell.power = 0;
    theCell.mark = 0;
    delete theCell.option; //smaller save file
    delete theCell.option2;

    handlePower(data.curPlanet, data.curSystem);
    view.selectCell(data.selectedCol, data.selectedRow);
    view.updatePlanetGridCell(data.selectedCol, data.selectedRow);
    view.changePlanetGridCell(data.selectedCol, data.selectedRow);
    view.updateResourcesDisplays();
}

function getPowerForQTrans(thePlanet, targetSystem, targetPlanet) {
    let distanceD = Math.abs(thePlanet.distance - data.systems[targetSystem].planets[targetPlanet].distance);
    if(distanceD === 0) { //target same planet it's on
        return 0;
    }
    return  distanceD * 75 + 75;
}

function pauseBuilding() {
    let thePlanet = data.systems[data.curSystem].planets[data.curPlanet];
    if(data.selectedRow == null || data.selectedCol == null) { //press hotkey when nothing selected
        return;
    }
    let theCell = thePlanet.grid[data.selectedCol][data.selectedRow];
    if(!theCell.type || theCell.type === "ore" || !info[theCell.type].pausable) { //press hotkey when nothing selected
        return;
    }

    let powerToUnpause = 0;
    if(theCell.type !== "quantumTransport") {
        powerToUnpause = info[theCell.type].power[theCell.mark];
    } else {
        if(data.curPlanet === theCell.option2) {
            addErrorMessage("The Quantum Transport is trying to transport to this planet! Change to a different one.");
            view.createErrorMessages();
            return;
        }
        powerToUnpause = getPowerForQTrans(thePlanet, 0, theCell.option2);
    }

    if(!theCell.isOn && powerToUnpause > (thePlanet.powerGain - thePlanet.powerReq)) {
        addErrorMessage("Unpausing this " +info[theCell.type].title+ " will crash the power grid! Need " + (powerToUnpause - (thePlanet.powerGain - thePlanet.powerReq)) + " to unpause.");
        view.createErrorMessages();
        return;
    }

    if( theCell.type !== "" || theCell.type !== "ore" && info[theCell.type].pausable) {
        theCell.isOn = !theCell.isOn;
    }
    view.updatePlanetGridCell(data.selectedCol, data.selectedRow);
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
    if(data.selectedRow == null || data.selectedCol == null || num === undefined || num === null || !document.getElementById("option" + num)) { //press hotkey when nothing selected
        return;
    }
    let theCell = thePlanet.grid[data.selectedCol][data.selectedRow];

    theCell.option = num;

    for(let i = 0; i < 5; i++) {
        if(document.getElementById("option"+i) && document.getElementById("option"+i).classList.contains("pressedSelectOption")) {
            document.getElementById("option"+i).classList.add("selectOption");
            document.getElementById("option"+i).classList.remove("pressedSelectOption");
        }
    }

    if(theCell.type === "radioTelescope") { //check if there's a good radio telescope
        let foundRadio = false;
        for(let col = 0; col < thePlanet.grid.length; col++) {
            for (let row = 0; row < thePlanet.grid[col].length; row++) {
                let theCell = thePlanet.grid[col][row];
                if(theCell.type === "radioTelescope" && theCell.option === 0) {
                    foundRadio = true;
                }
            }
        }
        thePlanet.hasRadio = foundRadio;
    }

    let selected = document.getElementById("option"+num);
    selected.classList.add("pressedSelectOption");
    selected.classList.remove("selectOption");
    view.updatePlanetGridCell(data.selectedCol, data.selectedRow);
}

function selectTargetOption(num) {
    let thePlanet = data.systems[data.curSystem].planets[data.curPlanet];
    if(data.selectedRow == null || data.selectedCol == null || num === undefined || num === null || !document.getElementById("targetOption" + num)) { //press hotkey when nothing selected
        return;
    }
    let theCell = thePlanet.grid[data.selectedCol][data.selectedRow];

    if(theCell.option2 !== num) { //don't disable if you clicked the same one
        theCell.isOn = false;
    }
    theCell.option2 = num;
    document.getElementById("qTransPower").innerHTML = getPowerForQTrans(thePlanet, 0, theCell.option2);
    document.getElementById("qTransDistance").innerHTML = Math.abs(thePlanet.distance - data.systems[0].planets[theCell.option2].distance)+"";

    for(let i = 0; i < 4; i++) {
        if(document.getElementById("targetOption"+i) && document.getElementById("targetOption"+i).classList.contains("pressedSelectOption")) {
            document.getElementById("targetOption"+i).classList.add("selectOption");
            document.getElementById("targetOption"+i).classList.remove("pressedSelectOption");
        }
    }

    let selected = document.getElementById("targetOption"+num);
    selected.classList.add("pressedSelectOption");
    selected.classList.remove("selectOption");
    view.updatePlanetGridCell(data.selectedCol, data.selectedRow);
}

function setAmount(num) {
    let thePlanet = data.systems[data.curSystem].planets[data.curPlanet];
    if(num === 0) {
        document.getElementById("workerNum").value = 1;
    } else if(num === 1) {
        document.getElementById("workerNum").value = Math.floor((thePlanet.pop + thePlanet.vPop)/2 + .0000001);
    } else if(num === 2) {
        document.getElementById("workerNum").value = Math.floor((thePlanet.pop + thePlanet.vPop) + .0000001);
    }
}

function changeWorker(name, isAdd) {
    let thePlanet = data.systems[data.curSystem].planets[data.curPlanet];
    let amountChanged = document.getElementById("workerNum").value;
    if(isNaN(amountChanged) || amountChanged < 1) {
        amountChanged = 1;
        document.getElementById("workerNum").value = amountChanged;
    }
    if(!Number.isInteger(amountChanged)) {
        amountChanged = Math.floor(amountChanged);
        document.getElementById("workerNum").value = amountChanged;
    }
    if(isAdd) {
        if(amountChanged > thePlanet.workers) {
            amountChanged = thePlanet.workers;
        }
        thePlanet[name] += amountChanged;
        thePlanet.workers -= amountChanged;
    } else {
        if(amountChanged > thePlanet[name]) {
            amountChanged = thePlanet[name];
        }
        thePlanet.workers += amountChanged;
        thePlanet[name] -= amountChanged;
    }

    view.changeWorkers();
}

function autoWorker(name) {
    let thePlanet = data.systems[data.curSystem].planets[data.curPlanet];
    if(thePlanet.autoWorker === name) {
        thePlanet.autoWorker = "";
    } else {
        thePlanet.autoWorker = name;
    }
    view.changeWorkers();
}

function gridKeyPress(colD, rowD) {
    if(data.selectedRow == null || data.selectedCol == null) {
        clickedCell(0, 0);
        return;
    }
    let goToCol = data.selectedCol + colD;
    if(goToCol < 0) {
        goToCol = data.systems[data.curSystem].planets[data.curPlanet].grid.length-1;
    }
    if(goToCol > data.systems[data.curSystem].planets[data.curPlanet].grid.length-1) {
        goToCol = 0;
    }

    let goToRow = data.selectedRow + rowD;
    if(goToRow < 0) {
        goToRow = data.systems[data.curSystem].planets[data.curPlanet].grid[0].length-1;
    }
    if(goToRow > data.systems[data.curSystem].planets[data.curPlanet].grid[0].length-1) {
        goToRow = 0;
    }

    clickedCell(goToCol, goToRow);
}

function changePlanet(num) {
    if(!data.research.unlock[2] || !data.systems[data.curSystem].planets[num]) {
        return;
    }
    data.curPlanet = num;
    data.selectedRow = null;
    data.selectedCol = null;

    view.createPlanets();
    view.changePlanets();
    view.updateResourcesDisplays();
    view.changeWorkers();
    view.selectCell(null, null);
}

function changeZone(zoneType) {
    document.getElementById(zoneType).style.display = "block";
    if(zoneType === "sunView") {
        document.getElementById("planetView").style.display = "none";
    } else {
        document.getElementById("sunView").style.display = "none";
    }
}

function winGame() {
    document.getElementById("winScreen").style.display = "block";
    canWin = false;
}

function closeWin() {
    document.getElementById("winScreen").style.display = "none";
}

function showMore() {
    document.getElementById("moreScreen").style.display = "block";
}

function closeMore() {
    document.getElementById("moreScreen").style.display = "none";
}