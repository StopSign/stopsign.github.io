let planetSailIdPool = [];
let sunSailIdPool = [];
let view = {
    initialize: function() {
        view.createPlanets();
        view.changePlanets();
        view.createResearch();
        view.createBuildOptions();
        view.updateResourcesDisplays();
        view.changeWorkers();
        view.updateDysonSphere();
    },
    update: function() {
        view.updateResourcesDisplays();
        view.updateSailMovement();
    },
    updateResourcesDisplays: function() {
        document.getElementById("science").innerHTML = data.science;
        document.getElementById("totalTime").innerHTML = data.totalTime;

        let theSystem = data.systems[data.curSystem];
        let thePlanet = theSystem.planets[data.curPlanet];
        document.getElementById("workers").innerHTML = thePlanet.workers;
        document.getElementById("workersTotal").innerHTML = Math.floor(thePlanet.pop + thePlanet.vPop + .0000001);
        document.getElementById("pop").innerHTML = intToString(thePlanet.pop);
        document.getElementById("popDelta").innerHTML = intToStringNegative(thePlanet.popD, 5);
        document.getElementById("popTotal").innerHTML = intToString(thePlanet.popTotal, 1);
        document.getElementById("vPop").innerHTML = intToString(thePlanet.vPop);
        document.getElementById("vPopDelta").innerHTML = intToStringNegative(thePlanet.vPopD);
        document.getElementById("vPopTotal").innerHTML = intToString(thePlanet.vPopTotal, 1);
        document.getElementById("ore").innerHTML = intToString(thePlanet.ore);
        document.getElementById("oreDelta").innerHTML = intToStringNegative(thePlanet.oreD);
        document.getElementById("electronics").innerHTML = intToString(thePlanet.electronics);
        document.getElementById("electronicsDelta").innerHTML = intToStringNegative(thePlanet.electronicsD);
        document.getElementById("panels").innerHTML = intToString(thePlanet.panels);
        document.getElementById("panelsDelta").innerHTML = intToStringNegative(thePlanet.panelsD);
        document.getElementById("sails").innerHTML = intToString(thePlanet.sails);
        document.getElementById("sailsDelta").innerHTML = intToStringNegative(thePlanet.sailsD, 4);
        document.getElementById("launching").innerHTML = intToString(thePlanet.launching);
        document.getElementById("launchingDelta").innerHTML = intToStringNegative(thePlanet.launchingD, 4);
        document.getElementById("science").innerHTML = intToString(data.science);
        document.getElementById("scienceDelta").innerHTML = intToStringNegative(data.scienceD);
        document.getElementById("electricityUsed").innerHTML = thePlanet.powerReq;
        document.getElementById("electricityGain").innerHTML = thePlanet.powerGain;

        //sun zone
        document.getElementById("sunZonePercent").innerHTML = intToString(theSystem.powerGain / theSystem.totalDyson * 100, 4);
        document.getElementById("sunZonePowerReq").innerHTML = theSystem.powerReq;
        document.getElementById("sunZonePowerGain").innerHTML = theSystem.powerGain;
        view.updateSailMovement();
    },
    updateSailMovement: function() {
        let theSystem = data.systems[data.curSystem];

        if(document.getElementById("planetView").style.display === "block") { //only update when in planetView
            for(let i = 0; i < planetSailIdPool.length; i++) {
                let sailDiv = document.getElementById("sail"+planetSailIdPool[i]);
                if(sailDiv && sailDiv.style.display === "") {
                    sailDiv.style.display = "none";
                }
            }

            //loop through all sails that exist
            //match their IDs to the data
            //set their new left/top to data's x/y
            for(let i = 0; i < theSystem.sailsFromPlanet.length; i++) {
                let theSail = theSystem.sailsFromPlanet[i];
                let sailDiv = document.getElementById("sail"+theSail.id);
                if(!sailDiv) {
                    let elem = document.createElement("div");
                    elem.style.position = "absolute";
                    elem.style.left = theSail.curX+"px";
                    elem.style.top = theSail.curY+"px";
                    elem.classList.add("solarSail");
                    elem.id = "sail" + theSail.id;
                    document.getElementById("sailsFromPlanetDiv").appendChild(elem);
                } else {
                    sailDiv.style.left = theSail.curX + "px";
                    sailDiv.style.top = theSail.curY + "px";
                    if(sailDiv && sailDiv.style.display === "none") { //reveal it if it came from the pool
                        sailDiv.style.display = "";
                    }
                }
            }
            return;
        }

        for(let i = 0; i < sunSailIdPool.length; i++) {
            let sailDiv = document.getElementById("Ssail" + sunSailIdPool[i]);
            if (sailDiv && sailDiv.style.display === "") {
                //console.log("deleting sail id: " + sunSailIdPool[i]);
                sailDiv.style.display = "none";
            }
        }

        for(let i = 0; i < theSystem.sailsInOrbit.length; i++) {
            let theSail = theSystem.sailsInOrbit[i];
            let sailDiv = document.getElementById("Ssail"+theSail.id);
            if(!sailDiv) {
                let elem = document.createElement("div");
                elem.style.position = "absolute";
                elem.style.left = theSail.curX+"px";
                elem.style.top = theSail.curY+"px";
                elem.classList.add("solarSail");
                elem.id = "Ssail" + theSail.id;
                document.getElementById("sailsInOrbitDiv").appendChild(elem);
                //console.log("adding new orbit sail: " + theSail.id);
            } else {
                sailDiv.style.left = theSail.curX + "px";
                sailDiv.style.top = theSail.curY + "px";
                if(theSail.curX > 250 && theSail.curX < 850 && sailDiv.style.backgroundColor !== "blue") {
                    sailDiv.style.backgroundColor = "blue";
                } else if((theSail.curX <= 250 || theSail.curX >= 850) && sailDiv.style.backgroundColor === "blue") {
                    sailDiv.style.backgroundColor = "yellow";
                }
                if(sailDiv && sailDiv.style.display === "none") { //reveal it if it came from the pool
                    sailDiv.style.display = "";
                }
            }
        }

        for(let i = 0; i < theSystem.sailsFromSun.length; i++) {
            let theSail = theSystem.sailsFromSun[i];
            let sailDiv = document.getElementById("Ssail"+theSail.id);
            if(!sailDiv) {
                //console.log("adding a new sun sail: " + theSail.id);
                let elem = document.createElement("div");
                elem.style.position = "absolute";
                elem.style.left = theSail.curX+"px";
                elem.style.top = theSail.curY+"px";
                elem.classList.add("solarSail");
                elem.id = "Ssail" + theSail.id;
                document.getElementById("sailsFromSunDiv").appendChild(elem);
            } else {
                sailDiv.style.left = theSail.curX + "px";
                sailDiv.style.top = theSail.curY + "px";
                if(theSail.curX > 250 && theSail.curX < 850 && sailDiv.style.backgroundColor !== "blue") {
                    sailDiv.style.backgroundColor = "blue";
                } else if((theSail.curX <= 250 || theSail.curX >= 850) && sailDiv.style.backgroundColor === "blue") {
                    sailDiv.style.backgroundColor = "yellow";
                }
                if(sailDiv && sailDiv.style.display === "none") { //reveal it if it came from the pool
                    sailDiv.style.display = "";
                }
            }
        }


        //     sailsInOrbit:[],
        //     sailsFromSun:[],
        //dyson:[]
    },
    updateDysonSphere:function() { //for onload or switching systems
        let c = document.getElementById("dysonDraw");
        let ctx = c.getContext("2d");
        ctx.fillStyle = "#8c8c84";
        let dyson = data.systems[data.curSystem].dysonPoints;
        for(let col = 0; col < dyson.length; col++) {
            for(let row = 0; row < dyson[0].length; row++) {
                if(dyson[col][row] === 2) {
                    ctx.fillRect(col * 3, row * 3, 3, 3); //x, y, x2, y2
                }
            }
        }
    },
    addDysonSpherePoint: function(col, row) {
        let c = document.getElementById("dysonDraw");
        let ctx = c.getContext("2d");
        ctx.fillStyle = "#8c8c84";
        ctx.fillRect(col * 3, row * 3, 3, 3); //x, y, x2, y2
    },
    changePlanets: function() { //initializes solar system, planet grid
        let planetGrid = data.systems[data.curSystem].planets[data.curPlanet].grid;
        let elems = "";
        let rowSize = 50;
        let totalWidth = rowSize * planetGrid.length;
        for(let col = 0 ; col < planetGrid.length; col++) {
            for (let row = 0; row < planetGrid[col].length; row++) {

                let rectStartX = col * rowSize;
                let rectStartY = row * rowSize;
                elems +=
                    "<div class='gridCell' style='left:" + rectStartX + "px;top:" + rectStartY + "px;width:" + (rowSize-2) + "px;height:" + (rowSize-2) + "px;' onclick='clickedCell(" + col + "," + row + ")' id='cellcol" + col + "row" + row + "'>" +
                    "<div class='cellImg' id='imgcol" + col + "row" + row + "'></div>" +
                    "<div class='displayOption' id='optioncol" + col + "row" + row + "'></div>" +
                    "<div class='displayNum' id='textcol" + col + "row" + row + "'></div>" +
                    "</div>";

            }
        }
        document.getElementById('buildingZone').innerHTML = elems;
        document.getElementById('buildingZone').style.width = totalWidth + "px";

        for(let col = 0 ; col < planetGrid.length; col++) {
            for (let row = 0; row < planetGrid[col].length; row++) {
                view.changePlanetGridCell(col, row);
                view.updatePlanetGridCell(col, row);
            }
        }

        document.getElementById("distance").innerHTML = data.systems[data.curSystem].planets[data.curPlanet].distance;
    },
    selectCell(col, row) { //displaying options
        if(col == null || row == null) {
            document.getElementById("selectionOptionsDiv").style.display = "none";
            document.getElementById("buildingInfoDiv").style.display = "none";
            return;
        }

        let theCell = data.systems[data.curSystem].planets[data.curPlanet].grid[col][row];
        if(theCell.type === "" || theCell.type === "ore") {
            document.getElementById("selectionOptionsDiv").style.display = "inline-block";
            document.getElementById("buildmine").style.display = theCell.type === "ore" ? "inline-block" : "none";
            document.getElementById("buildhouse").style.display = data.research.unlock[0] ? "inline-block" : "none";
            document.getElementById("buildserver").style.display = data.research.unlock[1] ? "inline-block" : "none";
            document.getElementById("buildquantumTransport").style.display = data.research.unlock[2] ? "inline-block" : "none";
            document.getElementById("buildradioTelescope").style.display = data.research.unlock[3] ? "inline-block" : "none";
            document.getElementById("buildlaunchPad").style.display = data.research.unlock[4] ? "inline-block" : "none";
        } else {
            document.getElementById("selectionOptionsDiv").style.display = "none";
        }
        if(theCell.type !== "" && theCell.type !== "ore") {
            document.getElementById("buildingInfoDiv").style.display = "inline-block";
            view.createBuildingInfo(theCell);

        } else {
            document.getElementById("buildingInfoDiv").style.display = "none";
        }

        view.updatePlanetGridCell(col, row);
    },
    createBuildingInfo(theCell) {
        let infoDiv = info[theCell.type].infoDiv;
        let title = info[theCell.type].title;
        let extra = info[theCell.type].extra;
        let pausable = info[theCell.type].pausable;

        let costString = "";

        let powerCost = info[theCell.type].power[theCell.mark];
        if(powerCost > 0 && theCell.type !== "solarPanel") {
            costString += "Electricity use: " + powerCost;
        }

        document.getElementById("buildingInfoTitle").innerHTML = title;
        document.getElementById("buildingInfo").innerHTML = costString + "<br>" + infoDiv;
        document.getElementById("buildingExtra").innerHTML = extra;
        document.getElementById("buildingPause").style.display = pausable ? "inline-block" : "none";
        if(document.getElementById("infoGain")) {
            document.getElementById("infoGain").innerHTML = info[theCell.type].gain[theCell.mark];
        }
        if(document.getElementById("infoGain2")) {
            document.getElementById("infoGain2").innerHTML = info[theCell.type].gain2[theCell.mark];
        }

        if(!data.research[theCell.type][theCell.mark]) {
            document.getElementById("buildingUpgrade").style.display = "none";
        } else {
            document.getElementById("buildingUpgrade").style.display = "inline-block";

            let oreCostNext = info[theCell.type].oreCost[theCell.mark+1];
            let elecCostNext = info[theCell.type].electronicCost[theCell.mark+1];
            let panelCostNext = info[theCell.type].panelCost[theCell.mark+1];
            let powerCostNext = info[theCell.type].power[theCell.mark+1];
            let markString = "Upgrade to Mk. " + (theCell.mark+2) + " for:" +
                (oreCostNext ? "<br>Ore: <div class='bold'>" + intToString(oreCostNext, 1) + "</div>" : "") +
                (elecCostNext ? "<br>Electronics: <div class='bold'>" + intToString(elecCostNext, 1) + "</div>" : "") +
                (panelCostNext ? "<br>Solar Panels: <div class='bold'>" + intToString(panelCostNext, 1) + "</div>" : "") +
                (powerCostNext ? "<br>Electricity: <div class='bold'>" + powerCostNext + "</div>" : "");

            markString += "<br><br>Effect will increase from " + info[theCell.type].gain[theCell.mark] + " to " + info[theCell.type].gain[theCell.mark+1] + "<br>";

            document.getElementById("buildingUpgradeInfo").innerHTML = markString;
        }

        if(document.getElementById("option0")) {
            selectOption(theCell.option);
        }
        if(document.getElementById("targetOption0")) {
            selectTargetOption(theCell.option2);
        }
    },
    updatePlanetGridCell: function(col, row) { //only for updating the num & border
        let theCell = data.systems[data.curSystem].planets[data.curPlanet].grid[col][row];
        if(data.selectedCol === col && data.selectedRow === row && !theCell.isOn) {
            document.getElementById("cellcol" + col + "row" + row).style.border = 'solid 1px #ffb12e';
        } else if(data.selectedCol === col && data.selectedRow === row) {
            document.getElementById("cellcol" + col + "row" + row).style.border = 'solid 1px yellow';
        } else if(!theCell.type || theCell.type === "ore") {
            document.getElementById("cellcol" + col + "row" + row).style.border = 'solid 1px #adadad';
        } else if(!theCell.isOn) {
            document.getElementById("cellcol" + col + "row" + row).style.border = 'solid 1px red';
        } else if(info[theCell.type].pausable) {
            document.getElementById("cellcol" + col + "row" + row).style.border = 'solid 1px #11d611';
        } else {
            document.getElementById("cellcol" + col + "row" + row).style.border = 'solid 1px black';
        }

        document.getElementById("optioncol" + col + "row" + row).innerHTML = ((theCell.type && info[theCell.type] && info[theCell.type].optionText) ? info[theCell.type].optionText[theCell.option] : "")
            + ((theCell.type && info[theCell.type] && info[theCell.type].optionText2) ? ">"+info[theCell.type].optionText2[theCell.option2] : "");
        document.getElementById("textcol" + col + "row" + row).innerHTML = theCell.mark > 0 ? (theCell.mark+1) : "";
    },
    changePlanetGridCell: function(col, row) { //for changing the image
        let theCell = data.systems[data.curSystem].planets[data.curPlanet].grid[col][row];
        if(theCell.type) {
            document.getElementById("imgcol" + col + "row" + row).innerHTML = "<img src='img/" + theCell.type + ".svg' class='superLargeIcon imageDragFix'>";
        } else {
            document.getElementById("imgcol" + col + "row" + row).innerHTML = "";
        }
    },
    changeWorkers: function() {
        let thePlanet = data.systems[data.curSystem].planets[data.curPlanet];

        document.getElementById("workers").innerHTML = thePlanet.workers;
        document.getElementById("mineWorker").innerHTML = thePlanet.mineWorker;
        document.getElementById("factoryWorker").innerHTML = thePlanet.factoryWorker;
        document.getElementById("labWorker").innerHTML = thePlanet.labWorker;
        document.getElementById("quantumTransportWorker").innerHTML = thePlanet.quantumTransportWorker;
        document.getElementById("launchPadWorker").innerHTML = thePlanet.launchPadWorker;

        let theList = ["mine", "factory", "lab", "quantumTransport", "launchPad"];
        for(let i = 0; i < theList.length; i++) {
            let autoName = theList[i];
            if (document.getElementById(autoName + "Auto").classList.contains("buttonPressed")) {
                document.getElementById(autoName + "Auto").classList.remove("buttonPressed");
                document.getElementById(autoName + "Auto").classList.add("button");
            }
        }
        if (thePlanet.autoWorker && document.getElementById(thePlanet.autoWorker + "Auto").classList.contains("button")) {
            document.getElementById(thePlanet.autoWorker + "Auto").classList.remove("button");
            document.getElementById(thePlanet.autoWorker + "Auto").classList.add("buttonPressed");
        }
    },
    createResearch: function() {
        document.getElementById("working").style.opacity = (data.research.unlock[0] ? 1 : 0)+"";
        document.getElementById("popDiv").style.display = data.research.unlock[0] ? "inline-block" : "none";
        document.getElementById("vPopDiv").style.display = data.research.unlock[1] ? "inline-block" : "none";
        document.getElementById("planetZone").style.display = data.research.unlock[2] ? "inline-block" : "none";
        document.getElementById("workingquantumTransport").style.display = data.research.unlock[2] ? "inline-block" : "none";
        document.getElementById("distanceDiv").style.display = data.research.unlock[2] ? "inline-block" : "none";
        document.getElementById("workinglaunchPad").style.display = data.research.unlock[4] ? "inline-block" : "none";
        document.getElementById("sailsDiv").style.display = data.research.unlock[4] ? "inline-block" : "none";
        document.getElementById("sunZone").style.display = data.research.unlock[4] ? "inline-block" : "none";
        document.getElementById("launchingDiv").style.display = data.research.unlock[4] ? "inline-block" : "none";

        let researchDivs = "";
        for(let i = 0; i < researchInfo.length; i++) {
            let theInfo = researchInfo[i];
            //if requirements are true, but it's not bought yet, create
            let isBought = data.research[theInfo.unlocks.type][theInfo.unlocks.num];
            let reqsPass = !theInfo.req || data.research[theInfo.req.type][theInfo.req.num];

            if(reqsPass && !isBought) {
                researchDivs +=
                    "<div class='buttonDiv researchDiv'  id='researchDiv" + i + "' onclick='clickedResearch(" + i + ")'>" +
                    "<div class='smallTitle'>" + theInfo.title + "</div>" +
                    "<div>" + theInfo.desc + "</div><br>" +
                    "<div>Buy for " + intToString(theInfo.cost, 1) + " science</div>" +
                    "</div>";
            }
        }
        document.getElementById("researchDivs").innerHTML = researchDivs;
    },
    createBuildOptions: function() {
        let buildOptionsDiv = "";
        for(let property in info) {
            if (info.hasOwnProperty(property)) {
                let value = info[property];

                buildOptionsDiv += "<div class='buttonDiv buildOption' id='build"+property+"' onclick='buyBuilding(\""+property+"\")'>" +
                    "<div class='smallTitle'>"+value.buildTitle+"</div>" +
                    "<div id='"+property+"Desc'>"+value.buildDesc+"</div><br>" +
                    "</div>";
            }
        }

        document.getElementById("buildOptions").innerHTML = buildOptionsDiv;
    },
    createErrorMessages: function() {
        let errorDivs = "";

        for(let i = 0; i < errorMessages.length; i++) {
            errorDivs +=
                "<div class='errorMessage' id='error"+i+"'>" +
                "<div class='errorButton' onclick='closeError("+i+")'>ERROR: "+errorMessages[i]+"</div>" +
                "</div>";
        }

        document.getElementById("errorMessages").innerHTML = errorDivs;
    },
    createPlanets: function() {
        let system = data.systems[data.curSystem];
        let elems = "";
        for(let i = 0; i < system.planets.length; i++) {
            elems += "<div class='planetDiv' onclick='changePlanet("+i+")'>" +
                "<img src='img/"+(i===data.curPlanet?"greenPlanet":"planet")+".svg' class='planetIcon imageDragFix'>" +
                "</div>";
        }
        document.getElementById("planetZone").innerHTML = elems;
    }

};