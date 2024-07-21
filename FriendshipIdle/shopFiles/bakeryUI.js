function initializeBakery() {
    initializeBakeShopDisplay()
    initializeBakeShopCook()
    initializeBakeShopFreezer()
    initializeBakeShopOffice()
    initializeEmilyPictures()
}
function initializeBakeShopDisplay() {
    createFlatPanel("bakeDisplayFloor", 0, 0, 0, 220, 150, FLOOR_COLOR);
    createFrontPanel("bakeDisplayGlass", 0, 0, 0, 300, 100, GLASS_COLOR, false);
    glassIds.push("bakeDisplayGlass-wall");
    createSidePanel("bakeDisplayGlass", 0, 0, 0, 400, 100, GLASS_COLOR, false);
    glassIds.push("bakeDisplayGlass-sideWall");
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

    //Trays & Bread
    createCircularTable("bakeDisplayShelf4", 77, 80, 45, 20, 5, 20, TABLE_COLOR);
    createCircularTable("bakeDisplayShelf5", 152, 80, 45, 20, 5, 20, TABLE_COLOR);
    createTraySpots()
    createBreadSpots()

    //Register
    createRegister("bakeDisplayRegister", 42, 80, 45, 30, 16, 20);
    registerNumberLabel("bakeDisplayRegisterAmount", { type:"money" });

    //Table & chair
    createCircularTable("bakeDisplayTable1", 140, 1, 0, 40, 30, 40, TABLE_COLOR);
    createSideChair("bakeDisplayChair", 170, 15, 0, 20, 40, 20, METAL_COLOR_10);

}
function initializeBakeShopCook() {
    createFlatPanel("bakeCookFloor", 0, 150, 0, 220, 250, FLOOR_COLOR);
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

    initializeEggTimer();
    setEggTimer(5);
}
function initializeBakeShopFreezer() {
    createFlatPanel("bakeFreezerFloor", 220, 150, 0, 80, 250, FLOOR_COLOR);
    createSidePanel("bakeFreezer1", 220, 150, 0, 140, 10, SIDE_WALL_COLOR);
    createSideDoor("bakeFreezerDoor", 220, 290, 0);
    createSidePanel("bakeFreezer2", 220, 330, 0, 70, 10, SIDE_WALL_COLOR);
    createSidePanel("bakeFreezerWall", 300, 150, 0, 250, 100, OUTSIDE_WALL_COLOR);

    //===Freezer Room Items===
    createSquareTable("bakeFreezerShelf1", 270, 200, 0, 28, 20, 198, 3, METAL_COLOR_7);
    createSquareTable("bakeFreezerShelf1", 223, 153, 0, 74, 20, 28, 3, METAL_COLOR_7);
}
function initializeBakeShopOffice() {
    createFlatPanel("bakeOfficeFloor", 220, 0, 0, 80, 150, FLOOR_COLOR);
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

function initializeEmilyPictures() {
    // createFrontImage("emilyDeciding", 156, 210, 14, 45, 67, "emily/deciding.png");
    // createFrontImage("emilyCooking", 100, 200, 0, 45, 67, "emily/cooking.png");
    // createFrontImage("emilyDecorating", 100, 200, 0, 45, 67, "emily/decorating.png");
    // createFrontImage("emilyMixing", 100, 200, 0, 45, 67, "emily/mixing.png");
    // createFrontImage("emilyCustomer", 100, 200, 0, 45, 67, "emily/customer.png");
    // createFrontImage("emilyOrdering", 100, 200, 0, 45, 67, "emily/ordering.png");
    // createFrontImage("emilyOffice", 220, 112, 0, 27, 66, "emily/office.png");

}

//Puts the picture in the 2 counters, uses light->dark brown upright ovals in the display cases, in 3x2 per top tray, 3x3 per mid tray, 3x4 per bottom tray. 4 trays per row.
//Can run whenever - doesn't update if no change
//First pass, creates the divs and stores them. After that, turns them on and off.
function setDisplayItems() {
    if(prevDisplayItemCount === displayItemCount) {
        return;
    }
    let diff = displayItemCount - prevDisplayItemCount; //diff positive = add to the start. diff negative = remove a random one
    prevDisplayItemCount = displayItemCount;

    while(diff > 0) {
        let placeIndex = -1;
        for(let i = 0; i < breadDivs.length; i++) {
            if(breadDivs[i].style.display === "none") {
                breadDivs[i].style.display = "block";
                visibleBreadDivs.push(breadDivs[i]);
                placeIndex = i;
                break;
            }
        }
        if(placeIndex === -1) {
            break; //no spot found
        }
        let tray = getTrayFromIndex(placeIndex);
        if(tray.style.display === "none") {
            tray.style.display = "block";
        }
        diff--;
    }
    while(diff < 0 && visibleBreadDivs.length > 0) {
        let removeIndex = Math.floor(Math.random() * visibleBreadDivs.length);

        visibleBreadDivs[removeIndex].style.display = "none";
        let id = visibleBreadDivs[removeIndex].id;
        visibleBreadDivs.splice(removeIndex, 1);
        let breadIndex = id.substring(id.indexOf("_") + 1, id.indexOf("-")) - 0;

        //Hide tray, if possible
        let breadOnTray = getAllBreadOfTray(breadIndex);
        let clearToHideTray = true;
        for(let i = 0; i < breadOnTray.length; i++) {
            if(breadOnTray[i].style.display !== "none") {
                clearToHideTray = false;
                break;
            }
        }
        if(clearToHideTray) {
            getTrayFromIndex(breadIndex).style.display = "none";
        }

        diff++;
    }
}

function getAllBreadOfTray(breadPos) {
    let tray = getTrayFromIndex(breadPos);
    let breadsOnTray = [];

    for(let i = 0; i < breadDivs.length; i++) {
        if(getTrayFromIndex(i) === tray) {
            breadsOnTray.push(breadDivs[i]);
        }
    }

    return breadsOnTray;
}

function getTrayFromIndex(placeIndex) {
    switch (true) {
        case(placeIndex < 1):
            return trayDivs[9];
        case(placeIndex < 2):
            return trayDivs[10];
        case(placeIndex < 8):
            return trayDivs[0];
        case(placeIndex < 14):
            return trayDivs[1];
        case(placeIndex < 20):
            return trayDivs[2];
        case(placeIndex < 32):
            return trayDivs[3];
        case(placeIndex < 44):
            return trayDivs[4];
        case(placeIndex < 56):
            return trayDivs[5];
        case(placeIndex < 74):
            return trayDivs[6];
        case(placeIndex < 92):
            return trayDivs[7];
        case(placeIndex < 110):
            return trayDivs[8];
        default:
            break;
    }
}

function createTraySpots() {
    createTray("1-flat", "tray1", 4, 2, 40, 16, "2px", METAL_COLOR_7)
    createTray("1-flat", "tray2", 48, 2, 40, 16, "2px", METAL_COLOR_7)
    createTray("1-flat", "tray3", 92, 2, 40, 16, "2px", METAL_COLOR_7)
    createTray("2-flat", "tray1", 4, 2, 40, 26, "2px", METAL_COLOR_8)
    createTray("2-flat", "tray2", 48, 2, 40, 26, "2px", METAL_COLOR_8)
    createTray("2-flat", "tray3", 92, 2, 40, 26, "2px", METAL_COLOR_8)
    createTray("3-flat", "tray1", 4, 2, 40, 36, "2px", METAL_COLOR_9)
    createTray("3-flat", "tray2", 48, 2, 40, 36, "2px", METAL_COLOR_9)
    createTray("3-flat", "tray3", 91, 2, 40, 36, "2px", METAL_COLOR_9)
    createTray("4-flat", "tray1", 3, 3, 14, 14, "8px", METAL_COLOR_7)
    createTray("5-flat", "tray1", 3, 3, 14, 14, "8px", METAL_COLOR_7)

}
function createTray(shelfId, id, fromLeft, fromTop, width, height, borderRadius, color) {
    attachPanel("bakeDisplayShelf"+shelfId, id, fromLeft, fromTop, width, height, color);
    let newId = "bakeDisplayShelf"+shelfId+"-"+id;
    let div = document.getElementById(newId);
    div.style.display = "none";
    div.style.borderRadius = borderRadius;
    trayDivs.push(div);
}

//TODO create bread images in a way that they're swappable, but also still breadDivs[0]
function createBreadSpots() {
    createBread(77, 89, 50, true);
    createBread(152, 89, 50, true);
    for(let i = 0; i < 9; i++) {
        let offset = i * 13 + Math.floor(i / 3) * 5;
        createBread(47 + offset, 85, 36, false);
        createBread(48 + offset, 90, 36, false);
    }
    for(let i = 0; i < 9; i++) {
        let offset = i * 13 + Math.floor(i / 3) * 5;
        createBread(47 + offset, 75, 26, false);
        createBread(48 + offset, 80, 26, false);
        createBread(49 + offset, 85, 26, false);
        createBread(50 + offset, 90, 26, false);
    }
    for(let i = 0; i < 9; i++) {
        let offset = i * 13 + Math.floor(i / 3) * 5;
        createBread(47 + offset, 65, 16, false);
        createBread(48 + offset, 70, 16, false);
        createBread(49 + offset, 75, 16, false);
        createBread(50 + offset, 80, 16, false);
        createBread(51 + offset, 85, 16, false);
        createBread(52 + offset, 90, 16, false);
    }
}

function createBread(fromLeft, fromFront, fromBottom, isImage) {
    let breadSlice;
    if(isImage) {
        createFrontImage("bread_" + breadDivs.length, fromLeft, fromFront, fromBottom, 20, 10, "bread.png");
        breadSlice = document.getElementById("bread_" + breadDivs.length + "-img");
    } else {
        createFrontPanel("bread_" + breadDivs.length, fromLeft, fromFront, fromBottom, 10, 5, BREAD_COLOR);
        breadSlice = document.getElementById("bread_" + breadDivs.length + "-wall");
        breadSlice.classList.add("bread");
    }
    breadSlice.style.display = "none";
    breadDivs.push(breadSlice);
}

function initializeEggTimer() {
    createFrontCircle("bakeCookTimer", 41, 365, 71, 18, 18, METAL_COLOR_7);
    let div = document.getElementById("bakeCookTimer-wall");
    div.style.fontSize = "2px";

    attachCirclePanel("bakeCookTimer-wall", "egg", 1, 1, 16, METAL_COLOR_1);


    // Create the numbers
    const numbers = document.createElement('div');
    numbers.className = 'eggTimerNumbers';
    div.appendChild(numbers);

    const numberValues = ['0', '5', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
    numberValues.forEach((val, idx) => {
        const span = document.createElement('span');
        span.innerText = val;
        span.style.transform = `rotate(${idx * 30}deg) translateY(-6px)`;
        numbers.appendChild(span);
    });


    // Create the rotating hand
    const hand = document.createElement('div');
    hand.className = 'hand';
    hand.id="eggHand";
    div.appendChild(hand);
}

function updateEggTimer() {
    if(data.eggTimerSeconds <= 0) {
        return;
    }
    data.eggTimerSeconds--;
    if(data.eggTimerSeconds === 0) {        // Add vibration effect
        const eggTimerWall = document.getElementById("bakeCookTimer-wall");
        eggTimerWall.classList.add('vibrating');

        // Optionally, remove the vibrating class after 2 seconds if needed
        setTimeout(() => {
            eggTimerWall.classList.remove('vibrating');
        }, 2000);
    }
    let angle = data.eggTimerSeconds*6; //360/60
    document.getElementById("eggHand").style.transform = `rotate(${angle}deg)`;
}

function setEggTimer(seconds) {
    data.eggTimerSeconds = seconds;
}

function placeEmilyImage(task) {
    if(currentTask === "deciding") {
        document.getElementById("emilyDeciding").style.display = "none";
    }
    if(task === "deciding") {
        document.getElementById("emilyDeciding").style.display = "block";
    }
}
