let view = {
    initialize: function() {
        //===Outside===
        {
            createCubeSides("outsideSideSidewalk", -80, -80, -10, 80, 10, 480, {
                top: SIDEWALK_COLOR,
                front: SIDEWALK_COLOR,
                left: SIDEWALK_COLOR
            })
            createCubeSides("outsideFrontSidewalk", 0, -80, -10, 4000, 10, 80, {
                top: SIDEWALK_COLOR,
                front: SIDEWALK_COLOR,
                right: SIDEWALK_COLOR
            })


            createFlatPanel("outsideParkingLot", -580, -1080, -10, 6000, 1480, ASPHALT_COLOR);
            for(let i = 0; i < 10; i++) {
                attachPanel("outsideParkingLot-flat", "parkingLotLine"+i, 500+i*150, 480, 8, 200, PARKING_LOT_LINE_COLOR);
            }
            for(let i = 0; i < 4; i++) {
                attachPanel("outsideParkingLot-flat", "parkingLotLine"+i, 300, i*150, 200, 8, PARKING_LOT_LINE_COLOR);
            }

            createFlatPanel("outsideLawn", -1000, 400, -10, 6000, 2000, "green");
            document.getElementById("outsideLawn-flat").classList.add("lawn"); //for the gradient
            createFrontImage("outsideBackground", -1000, 2400, -10, 3000, 750, "background.png");



        }


        //===Bake Shop Display===
        {
            createFlatPanel("bakeDisplayFloor", 0, 150, 0, 220, 250, FLOOR_COLOR);
            createFrontPanel("bakeDisplayGlass", 0, 0, 0, 300, 100, GLASS_COLOR, false);
            createSidePanel("bakeDisplayGlass", 0, 0, 0, 400, 100, GLASS_COLOR, false);
            attachGlassDoor("bakeDisplayGlassDoor", 10);
            createFrontPanel("bakeDisplay1", 0, 150, 0, 170, 10, SIDE_WALL_COLOR);
            createFrontDoor("bakeDisplayDoor", 170, 150, 0, true); //width 40
            createFrontPanel("bakeDisplay2", 210, 150, 0, 10, 10, SIDE_WALL_COLOR);

            createFrontPanel("bakeDisplayBoard", 40, 148, 50, 48, 28, "", true, "2px solid " + BLACKBOARD_BORDER_COLOR);
            document.getElementById("bakeDisplayBoard-wall").style.background = "linear-gradient(to top right, #076e2f, #599a69)";
            //Counter
            createCubeSides("bakeDisplayCounter", 40, 60, 0, 140, 15, 40, {
                top: METAL_COLOR_3,
                front: METAL_COLOR_5,
                right: METAL_COLOR_7,
                left: METAL_COLOR_7
            })
            createCubeSides("bakeDisplayCounterClass", 40, 60, 15, 140, 30, 40, {
                top: INTERIOR_GLASS_COLOR,
                front: INTERIOR_GLASS_COLOR,
                right: INTERIOR_GLASS_COLOR,
                left: INTERIOR_GLASS_COLOR
            }, false)
            createFlatPanel("bakeDisplayShelf3", 42, 60, 16, 136, 40, METAL_COLOR_1);
            createFlatPanel("bakeDisplayShelf2", 42, 70, 25, 136, 30, METAL_COLOR_0_5);
            createFlatPanel("bakeDisplayShelf1", 42, 80, 35, 136, 20, METAL_COLOR_0);


            //Register
            createRegister("bakeDisplayRegister", 42, 80, 45, 30, 16, 20);

            //Extra Displays
            createCircularTable("bakeDisplayShelf4", 77, 80, 45, 20, 5, 20, TABLE_COLOR);
            createCircularTable("bakeDisplayShelf5", 152, 80, 45, 20, 5, 20, TABLE_COLOR);

            //Table & chair
            createCircularTable("bakeDisplayTable1", 140, 1, 0, 40, 30, 40, TABLE_COLOR);
            createSideChair("bakeDisplayChair", 170, 15, 0, 20, 40, 20, METAL_COLOR_10);
        }

        //===Bake Shop Cook===
        {
            createFlatPanel("bakeCookFloor", 220, 0, 0, 80, 150, FLOOR_COLOR);
            createFrontPanel("bakeCookWall", 0, 400, 0, 300, 100, OUTSIDE_WALL_COLOR);

            //===Bake Shop Cook Room Items===
            createSquareTable("bakeCookTable", 90, 190, 1, 60, 34, 120, 8, METAL_COLOR_1);

            createCubeSides("bakeCookCounter", 79, 360, 0, 130, 40, 40, {
                top: METAL_COLOR_1,
                left: METAL_COLOR_10,
                front: METAL_COLOR_10,
                right: METAL_COLOR_10
            });
            //Shelves
            createSquareTable("bakeCookShelf1", 3, 160, 60, 30, 20, 130, 2, METAL_COLOR_1);
            createSquareTable("bakeCookShelf2", 3, 160, 45, 30, 20, 130, 2, METAL_COLOR_2);
            createSquareTable("bakeCookShelf3", 3, 160, 30, 30, 20, 130, 2, METAL_COLOR_3);
            createSquareTable("bakeCookShelf4", 3, 160, 15, 30, 20, 130, 2, METAL_COLOR_4);
            createSquareTable("bakeCookShelf5", 3, 160, 0, 30, 20, 130, 2, METAL_COLOR_5);
            //Oven
            createCubeSides("bakeCookOven", 3, 340, 0, 60, 50, 60, {
                top: METAL_COLOR_1,
                left: METAL_COLOR_1,
                front: METAL_COLOR_1,
                right: METAL_COLOR_1
            });
            attachPanel("bakeCookOven-front-wall", "Door1", 5, 5, 50, 10, METAL_COLOR_7);
            attachPanel("bakeCookOven-front-wall", "Door2", 5, 20, 50, 10, METAL_COLOR_7);
            attachPanel("bakeCookOven-front-wall", "Door3", 5, 35, 50, 10, METAL_COLOR_7);
            createSidePanel("bakeCookOvenTopLeft", 3, 340, 50, 60, 20, METAL_COLOR_1);
            createSidePanel("bakeCookOvenTopRight", 63, 340, 50, 60, 20, METAL_COLOR_1);
            createFlatPanel("bakeCookOvenTopTop", 3, 340, 70, 60, 60, METAL_COLOR_1)
            createFrontPanel("bakeCookOvenTopBack", 4, 380, 50, 58, 19, FIRE_COLOR);
        }

        //===Bake Shop Freezer===
        {
            createFlatPanel("bakeFreezerFloor", 0, 0, 0, 220, 150, FLOOR_COLOR);
            createSidePanel("bakeFreezer1", 220, 150, 0, 140, 10, SIDE_WALL_COLOR);
            createSideDoor("bakeFreezerDoor", 220, 290, 0);
            createSidePanel("bakeFreezer2", 220, 330, 0, 70, 10, SIDE_WALL_COLOR);
            createSidePanel("bakeFreezerWall", 300, 150, 0, 250, 100, OUTSIDE_WALL_COLOR);

            //===Freezer Room Items===
            createSquareTable("bakeFreezerShelf1", 270, 200, 0, 28, 20, 198, 3, METAL_COLOR_7);
            createSquareTable("bakeFreezerShelf1", 223, 153, 0, 74, 20, 28, 3, METAL_COLOR_7);
        }

        //===Bake Shop Office===
        {
            createFlatPanel("bakeOfficeFloor", 220, 150, 0, 80, 250, FLOOR_COLOR);
            createSidePanel("bakeOffice1", 220, 0, 0, 10, 10, SIDE_WALL_COLOR);
            createSideDoor("bakeOfficeDoor", 220, 10, 0);
            createSidePanel("bakeOffice2", 220, 50, 0, 100, 10, SIDE_WALL_COLOR);
            createSidePanel("bakeOfficeWall", 300, 0, 0, 150, 100, OUTSIDE_WALL_COLOR);
            createFrontPanel("bakeOffice", 220, 150, 0, 80, 10, SIDE_WALL_COLOR);

            //===Office Room Items===
            createSquareTable("bakeOfficeTable", 230, 115, 0, 60, 30, 30, 20, TABLE_COLOR);
            attachPanel("bakeOfficeTable-top-flat", "monitorStand", 24, 10, 13, 5, METAL_COLOR_10);
            attachPanel("bakeOfficeTable-top-flat", "keyboard", 13, 18, 22, 8, METAL_COLOR_4);
            attachPanel("bakeOfficeTable-top-flat", "mousepad", 41, 17, 7, 9, METAL_COLOR_10);
            attachPanel("bakeOfficeTable-top-flat", "mouse", 44, 20, 2, 3, "white");
            createFrontPanel("bakeOfficeMonitorStand", 258.5, 131, 30, 3, 30, METAL_COLOR_10);
            createFrontPanel("bakeOfficeMonitor", 235, 130, 40, 50, 25, METAL_COLOR_10);
            attachPanel("bakeOfficeMonitor-wall", "bakeComputer", 2, 2, 46, 22, "white");
        }

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
