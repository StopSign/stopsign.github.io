view.initialize = function() {
    initializeOutside()
    initializeBakery()
};

function initializeOutside() {
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


    attachCheckbox("outsideFrontSidewalk-top-flat", "showGlass", 10, 5, "Show Glass", "6px", function() {
        view.triggered.changeGlassVisibility();
    });
    attachCheckbox("outsideFrontSidewalk-top-flat", "showDoors", 10, 20, "Show Doors", "6px", function() {
        view.triggered.changeDoorsVisibility();
    });
    attachButton("outsideFrontSidewalk-top-flat", "addDisplay", 10, 40, "+1 to Baked Goods", "5px", function() {
        displayItemCount++;
        data.bakeDisplayRegisterAmount = displayItemCount*10;
        //in bakeryUI.js
        setDisplayItems();
    })
    attachButton("outsideFrontSidewalk-top-flat", "addDisplay", 10, 50, "-1 to Baked Goods", "5px", function() {
        if(displayItemCount <= 0) {
            return;
        }
        displayItemCount--;
        data.bakeDisplayRegisterAmount = displayItemCount*10;
        //in bakeryUI.js
        setDisplayItems();
    })

}