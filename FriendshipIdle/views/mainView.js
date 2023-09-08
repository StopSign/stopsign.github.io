let view = {
    initialize: function() {

        //===Bake Shop Walls===
        createFlatPanel("bakeFreezerFloor", 0, 0, 0, 220, 150, floorColor);
        createFlatPanel("bakeCookFloor", 220, 0, 0, 80, 150, floorColor);
        createFlatPanel("bakeDisplayFloor", 0, 150, 0, 220, 250, floorColor);
        createFlatPanel("bakeOfficeFloor", 220, 150, 0, 80, 250, floorColor);

        createSidePanel("bakeOffice1", 220, 0, 0, 10, 10, sideWallColor);
        createSideDoor("bakeOfficeDoor", 220, 10, 0);
        createSidePanel("bakeOffice2", 220, 50, 0, 100, 10, sideWallColor);
        createSidePanel("bakeFreezer1", 220, 150, 0, 140, 10, sideWallColor);
        createSideDoor("bakeFreezerDoor", 220, 290, 0);
        createSidePanel("bakeFreezer2", 220, 330, 0, 70, 10, sideWallColor);

        createFrontPanel("bakeDisplay1", 0, 150, 0, 170, 10, sideWallColor);
        createFrontDoor("bakeDisplayDoor", 170, 150, 0, true); //width 40
        createFrontPanel("bakeDisplay2", 210, 150, 0, 10, 10, sideWallColor);
        createFrontPanel("bakeOffice", 220, 150, 0, 80, 10, sideWallColor);


        //===Bake Shop Cook Room Items===
        createSquareTable("bakeCook", 90, 190, 1, 60, 34, 120, 8, metalColor1);

        createCubeSides("bakeCounter", 79, 360, 0, 130, 40, 40, {top:metalColor1,left:metalColor10,front:metalColor10,right:metalColor10});
        //Shelves
        createSquareTable("bakeShelf", 3, 160, 60, 30, 20, 130, 2, metalColor1);
        createSquareTable("bakeShelf", 3, 160, 45, 30, 20, 130, 2, metalColor2);
        createSquareTable("bakeShelf", 3, 160, 30, 30, 20, 130, 2, metalColor3);
        createSquareTable("bakeShelf", 3, 160, 15, 30, 20, 130, 2, metalColor4);
        createSquareTable("bakeShelf", 3, 160, 0, 30, 20, 130, 2, metalColor5);
        //Oven
        createCubeSides("bakeOven", 3, 340, 0, 60, 50, 60, {top:metalColor1,left:metalColor1,front:metalColor1,right:metalColor1});
        attachPanel("bakeOven-front-wall", "Door1", 5, 5, 50, 10, metalColor7);
        attachPanel("bakeOven-front-wall", "Door2", 5, 20, 50, 10, metalColor7);
        attachPanel("bakeOven-front-wall", "Door3", 5, 35, 50, 10, metalColor7);
        createSidePanel("bakeOvenTopLeft", 3, 340, 50, 60, 20, metalColor1);
        createSidePanel("bakeOvenTopRight", 63, 340, 50, 60, 20, metalColor1);
        createFlatPanel("bakeOvenTopTop", 3, 340, 70, 60, 60, metalColor1)
        createFrontPanel("bakeOvenTopBack", 4, 380, 50, 58, 19, fire);

        //===Freezer Room Items===
        createSquareTable("bakeFreezerShelf1", 270, 200, 0, 28, 20, 198, 3, metalColor7);
        createSquareTable("bakeFreezerShelf1", 223, 153, 0, 74, 20, 28, 3, metalColor7);

        //===Office Room Items===
        createSquareTable("bakeOfficeTable", 230, 115, 0, 60, 30, 30, 20, tableColor);
        attachPanel("bakeOfficeTable-top-flat", "monitorStand", 24, 10, 13, 5, metalColor10);
        attachPanel("bakeOfficeTable-top-flat", "keyboard", 13, 18, 22, 8, metalColor4);
        attachPanel("bakeOfficeTable-top-flat", "mousepad", 41, 17, 7, 9, metalColor10);
        attachPanel("bakeOfficeTable-top-flat", "mouse", 44, 20, 2, 3, "white");
        //Keyboard/mouse as panel on table
        //monitor stand
        createFrontPanel("bakeOfficeMonitorStand", 258.5, 131, 30, 3, 30, metalColor10);
        createFrontPanel("bakeOfficeMonitor", 235, 130, 40, 50, 25, metalColor10);
        attachPanel("bakeOfficeMonitor-wall", "bakeComputer", 2, 2, 46, 22, "white");

    },
    updating: {
        update: function () {

            view.updating.saveCurrentState();
        },
        saveCurrentState: function () {
            prevState.res = copyArray(res);
            // prevState.localAtmo = copyArray(localAtmo);
        },
        resources: function() {
            // if(intToString(prevState.totalWater, 1) !== intToString(totalWater, 1)) {
            //     document.getElementById("totalWater").innerHTML = intToString(totalWater, 1);
            // }
        }
    },
    create: {
        createButton(buttonDatum, pos) {
            let buttonHTML = "<div class='button abs showthat' onclick='buttonData[" + pos + "].onclick()' " +
                "style='top:" + buttonDatum.y + "px;left:" + buttonDatum.x + "px'>" +
                buttonDatum.text +
                "<div class='showthis'>" + buttonDatum.tooltip + "</div>" +
                "</div>";

            let elem = document.createElement("div");
            elem.innerHTML = buttonHTML;
            document.getElementById("modulesDiv").append(elem);
        }
    }
};
