
let view = {
    update: function() {
        view.updateResourcesDisplays();
    },
    updateResourcesDisplays: function() {
        document.getElementById("science").innerHTML = data.science;

        let thePlanet = data.systems[data.curSystem].planets[data.curPlanet];
        document.getElementById("pop").innerHTML = thePlanet.pop;
        document.getElementById("popDelta").innerHTML = intToStringNegative(thePlanet.popD);
        document.getElementById("vPop").innerHTML = thePlanet.vPop;
        document.getElementById("vPopDelta").innerHTML = intToStringNegative(thePlanet.vPopD);
        document.getElementById("ore").innerHTML = intToString(thePlanet.ore);
        document.getElementById("oreDelta").innerHTML = intToStringNegative(thePlanet.oreD, 2);
        document.getElementById("electronics").innerHTML = intToString(thePlanet.electronics);
        document.getElementById("electronicsDelta").innerHTML = intToStringNegative(thePlanet.electronicsD, 2);
        document.getElementById("panels").innerHTML = intToString(thePlanet.panels);
        document.getElementById("panelsDelta").innerHTML = intToStringNegative(thePlanet.panelsD, 2);
        document.getElementById("sails").innerHTML = intToString(thePlanet.sails);
        document.getElementById("sailsDelta").innerHTML = intToStringNegative(thePlanet.sailsD, 2);
        document.getElementById("electricityUsed").innerHTML = thePlanet.powerReq;
        document.getElementById("electricityGain").innerHTML = thePlanet.powerGain;
    },
    changePlanets: function() { //initializes solar system, planet grid
        let planetGrid = data.systems[data.curSystem].planets[data.curPlanet].grid;
        for(let col = 0 ; col < planetGrid.length; col++) {
            for (let row = 0; row < planetGrid[col].length; row++) {

                let elem = document.createElement("div");
                let rowSize = 50;
                let rectStartX = col * rowSize;
                let rectStartY = row * rowSize;
                elem.innerHTML =
                    "<div class='gridCell' style='left:" + rectStartX + "px;top:" + rectStartY + "px;width:" + (rowSize-2) + "px;height:" + (rowSize-2) + "px;' onclick='clickedCell(" + col + "," + row + ")' id='cellcol" + col + "row" + row + "'>" +
                    "<div class='cellImg' id='imgcol" + col + "row" + row + "'></div>" +
                    "<div class='displayNum' id='textcol" + col + "row" + row + "'></div>" +
                    "</div>";

                document.getElementById('buildingZone').appendChild(elem);
                view.changePlanetGridCell(col, row);
                view.updatePlanetGridCell(col, row);
            }
            let elem = document.createElement("br");
            document.getElementById('buildingZone').appendChild(elem);
        }
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
            document.getElementById("buildhouse").style.display = data.research[0].unlocked ? "inline-block" : "none";
            document.getElementById("buildserver").style.display = data.research[1].unlocked ? "inline-block" : "none";
            document.getElementById("buildquantumTransport").style.display = data.research[2].unlocked ? "inline-block" : "none";
            document.getElementById("buildradioTelescope").style.display = data.research[3].unlocked ? "inline-block" : "none";
            document.getElementById("buildlaunchPad").style.display = data.research[4].unlocked ? "inline-block" : "none";
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

        document.getElementById("buildingInfoTitle").innerHTML = title;
        document.getElementById("buildingInfo").innerHTML = infoDiv;
        document.getElementById("buildingExtra").innerHTML = extra;
        document.getElementById("buildingPause").style.display = pausable ? "inline-block" : "none";
    },
    updatePlanetGridCell: function(col, row) { //only for updating the num & border
        let theCell = data.systems[data.curSystem].planets[data.curPlanet].grid[col][row];
        if(data.selectedCol === col && data.selectedRow === row) {
            document.getElementById("cellcol" + col + "row" + row).style.border = 'solid 1px yellow';
        } else if(theCell.outline === "") {
            document.getElementById("cellcol" + col + "row" + row).style.border = 'solid 1px #adadad';
        } else if(theCell.outline === "error" || !theCell.isOn) {
            document.getElementById("cellcol" + col + "row" + row).style.border = 'solid 1px red';
        } else {
            document.getElementById("cellcol" + col + "row" + row).style.border = 'solid 1px black';
        }
    },
    changePlanetGridCell: function(col, row) { //for changing the image
        let theCell = data.systems[data.curSystem].planets[data.curPlanet].grid[col][row];
        if(theCell.type) {
            document.getElementById("imgcol" + col + "row" + row).innerHTML = "<img src='img/" + theCell.type + ".svg' class='superLargeIcon imageDragFix'>";
        } else {
            document.getElementById("imgcol" + col + "row" + row).innerHTML = "";
        }

        document.getElementById("textcol" + col + "row" + row).innerHTML = theCell.text;
    },
    createResearch: function() {
        let researchDivs = "";
        for(let i = 0; i < data.research.length; i++) {
            if(!data.research[i].unlocked && (data.research[i].req == null || data.research[data.research[i].req].unlocked)) {
                researchDivs +=
                    "<div class='researchDiv'  id='researchDiv" + i + "'>" +
                    "<div class='smallTitle'>" + data.research[i].title + "</div>" +
                    "<div>" + data.research[i].desc + "</div><br>" +
                    "<div class='button' onclick='clickedResearch(" + i + ")'>Buy for " + data.research[i].cost + " science</div>" +
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

                buildOptionsDiv += "<div class='buildOption' id='build"+property+"'>" +
                    "<div class='smallTitle'>"+value.buildTitle+"</div>" +
                    "<div id='"+property+"Desc'>"+value.buildDesc+"</div><br>" +
                    "<div class='button' onclick='buyBuilding(\""+property+"\")'>Build</div>" +
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

};