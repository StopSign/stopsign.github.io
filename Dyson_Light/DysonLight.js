

function secondTick() {
    let science1 = data.science;

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
}

function tickPlanetResources(systemNum, planetNum) {
    let thePlanet = data.systems[systemNum].planets[planetNum];

    let poweredCells = handlePower(thePlanet);
    if(poweredCells === undefined) { //error message
        return;
    }

    let ore1 = thePlanet.ore;
    let electronics1 = thePlanet.electronics;
    let panels1 = thePlanet.panels;
    let sails1 = thePlanet.sails;
    let pop1 = thePlanet.pop;

    handleMaterials(poweredCells, thePlanet);

    setWorkers(poweredCells, thePlanet);


    thePlanet.oreD = round5(thePlanet.ore - ore1);
    thePlanet.electronicsD = round5(thePlanet.electronics - electronics1);
    thePlanet.panelsD = round5(thePlanet.panels - panels1);
    thePlanet.sailsD = round5(thePlanet.sails - sails1);
    thePlanet.popD = round5(thePlanet.pop - pop1);

    return poweredCells;
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
    thePlanet.popD = houseGain;
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
                powerGain += info[theCell.type].gain[theCell.mark];
            } else if(theCell.isOn && theCell.type && theCell.type !== "ore") {
                powerReq += info[theCell.type].power[theCell.mark];
                poweredCells[theCell.type].push(theCell);
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

    handlePower(thePlanet);

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

    let oreCost = info[type].oreCost[theCell.mark];
    let elecCost = info[type].electronicCost[theCell.mark];
    let panelCost = info[type].panelCost[theCell.mark];
    let powerCost = info[type].power[theCell.mark];
    if(!checkCostAllowed(thePlanet, type, oreCost, elecCost, panelCost, powerCost)) {
        return;
    }

    theCell.type = type;
    theCell.isOn = true;
    if(info[theCell.type].optionText) {
        theCell.option = 0;
    }

    handlePower(thePlanet);

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
        errorMsg += (oreCost > 0 ? " and " : "") + panelCost + " panels";
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

    theCell.type = theCell.type === "mine" ? "ore" : "";
    theCell.isOn = true;
    theCell.power = 0;
    theCell.mark = 0;

    handlePower(thePlanet);
    view.selectCell(data.selectedCol, data.selectedRow);
    view.updatePlanetGridCell(data.selectedCol, data.selectedRow);
    view.changePlanetGridCell(data.selectedCol, data.selectedRow);
    view.updateResourcesDisplays();
}

function pauseBuilding() {
    let thePlanet = data.systems[data.curSystem].planets[data.curPlanet];
    let theCell = thePlanet.grid[data.selectedCol][data.selectedRow];
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
    if(data.selectedRow == null || data.selectedCol == null || !document.getElementById("option0")) { //press hotkey when nothing selected
        return;
    }
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
    data.curPlanet = num;
    data.selectedRow = null;
    data.selectedCol = null;

    view.createPlanets();
    view.changePlanets();
    view.updateResourcesDisplays();
    view.changeWorkers();
    view.selectCell(null, null);
}