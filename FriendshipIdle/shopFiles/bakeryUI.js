
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