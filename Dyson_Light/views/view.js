
let view = {
    update: function() {

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
            return;
        }
        document.getElementById("selectionOptionsDiv").style.display = "inline-block";

        let theCell = data.systems[data.curSystem].planets[data.curPlanet].grid[col][row];
        if(theCell.type === "ore") {
            document.getElementById("buildMine").style.display = "inline-block";
        } else {
            document.getElementById("buildMine").style.display = "none";
        }

        if(data.research[0])

        view.updatePlanetGridCell(col, row);
    },
    updatePlanetGridCell: function(col, row) { //only for updating the num & border
        let theCell = data.systems[data.curSystem].planets[data.curPlanet].grid[col][row];
        if(data.selectedCol === col && data.selectedRow === row) {
            document.getElementById("cellcol" + col + "row" + row).style.border = 'solid 1px yellow';
        } else if(theCell.outline === "") {
            document.getElementById("cellcol" + col + "row" + row).style.border = 'solid 1px #a2a2a2';
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
        if(theCell.text) {
            document.getElementById("textcol" + col + "row" + row).innerHTML = theCell.text;
        } else {
            document.getElementById("textcol" + col + "row" + row).innerHTML = "";
        }
    },
    initializeResearch: function() {
        for(let i = 0; i < data.research.length; i++) {

            let elem = document.createElement("div");

            elem.innerHTML =
                "<div class='researchDiv'  id='researchDiv"+i+"'>" +
                "<div class='smallTitle'>"+data.research[i].title+"</div>"+
                "<div class='button' onclick='clickedResearch(" +i+ ")'>Buy for "+data.research[i].cost+" science</div>" +
                "</div>";

            document.getElementById("researchDivs").appendChild(elem);
        }
    }
};