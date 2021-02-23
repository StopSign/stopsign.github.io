
let view = {
    update: function() {
        view.updateResourcesDisplays();
    },
    updateResourcesDisplays: function() {
        document.getElementById("science").innerHTML = data.science;

        let thePlanet = data.systems[data.curSystem].planets[data.curPlanet];
        document.getElementById("pop").innerHTML = thePlanet.pop;
        document.getElementById("vPop").innerHTML = thePlanet.vPop;
        document.getElementById("ore").innerHTML = thePlanet.ore;
        document.getElementById("power").innerHTML = thePlanet.power;
        document.getElementById("panels").innerHTML = thePlanet.panels;
        document.getElementById("sails").innerHTML = thePlanet.sails;
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
            document.getElementById("buildMine").style.display = theCell.type === "ore" ? "inline-block" : "none";
            document.getElementById("buildHouse").style.display = data.research[0].unlocked ? "inline-block" : "none";
            document.getElementById("buildServer").style.display = data.research[1].unlocked ? "inline-block" : "none";
            document.getElementById("buildQuantumTransport").style.display = data.research[2].unlocked ? "inline-block" : "none";
            document.getElementById("buildRadioTelescope").style.display = data.research[3].unlocked ? "inline-block" : "none";
            document.getElementById("buildLaunchPad").style.display = data.research[4].unlocked ? "inline-block" : "none";
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
        let infoDiv = "";
        let title = "";
        if(theCell.type === "solarPanel") {
            infoDiv = "Harness the light of the sun! Gain 1 electricity. Buildings will not work without electricity.";
            title = "Solar Panel";
        }
        document.getElementById("buildingInfoTitle").innerHTML = title;
        document.getElementById("buildingInfo").innerHTML = infoDiv;
    },
    updatePlanetGridCell: function(col, row) { //only for updating the num & border
        let theCell = data.systems[data.curSystem].planets[data.curPlanet].grid[col][row];
        if(data.selectedCol === col && data.selectedRow === row) {
            document.getElementById("cellcol" + col + "row" + row).style.border = 'solid 1px yellow';
        } else if(theCell.outline === "") {
            document.getElementById("cellcol" + col + "row" + row).style.border = 'solid 1px #adadad';
        } else if(theCell.outline === "error") {
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