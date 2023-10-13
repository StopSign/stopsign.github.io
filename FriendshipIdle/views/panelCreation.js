let glassIds = [];
let doorIds = [];

let FLOOR_COLOR = "rgb(203, 144, 64)";
let OUTSIDE_WALL_COLOR = "rgba(211, 209, 209)";
let SIDE_WALL_COLOR = "rgba(211, 209, 209, .8)";
let METAL_COLOR_0 = "rgb(199, 199, 199)";
let METAL_COLOR_0_5 = "rgb(194, 194, 194)";
let METAL_COLOR_1 = "rgb(189, 189, 189)";
let METAL_COLOR_2 = "rgb(179, 179, 179)";
let METAL_COLOR_3 = "rgb(169, 169, 169)";
let METAL_COLOR_4 = "rgb(159, 159, 159)";
let METAL_COLOR_5 = "rgb(149, 149, 149)";
let METAL_COLOR_6 = "rgb(139, 139, 139)";
let METAL_COLOR_7 = "rgb(129, 129, 129)";
let METAL_COLOR_8 = "rgb(119, 119, 119)";
let METAL_COLOR_9 = "rgb(109, 109, 109)";
let METAL_COLOR_10 = "rgb(99, 99, 99)";
let METAL_COLOR_11 = "rgb(89, 89, 89)";
let METAL_COLOR_12 = "rgb(79, 79, 79)";
let TRAY_COLOR = "rgb(38, 38, 38)";
let FIRE_COLOR = "rgb(255, 99, 71)";
let INTERIOR_DOOR_COLOR = "rgba(211, 209, 209, .2)";
let TABLE_COLOR = "rgb(139, 119, 101)";
let GLASS_COLOR = "rgba(0, 128, 255, 0.05)";
let INTERIOR_GLASS_COLOR = "rgba(0, 128, 255, 0.1)";
let GLASS_DOOR_COLOR = "rgba(0, 128, 255, .12)";
let SIDEWALK_COLOR = "rgb(255, 248, 220)";
let ASPHALT_COLOR = "rgb(70, 70, 70)";
let PARKING_LOT_LINE_COLOR = "white";
let BLACKBOARD_BORDER_COLOR = "rgb(145, 90, 2)";
let BREAD_COLOR = "rgb(139, 69, 19)";



// Flat table:
//     bottom:-<half of height (+offset)>
// left:50px = transform:translateX(50px)
// transform:translateY(50px) = send back
//

//Creates a div of widthxheight at fromLeft, fromFront, fromBottom, counting from the bottom left ground corner of the shops
function createFlatPanel(id, fromLeft, fromFront, fromBottom, width, depth, color, isClickable=true)
{
    let div = document.createElement('div');
    div.style.position = "absolute";
    div.style.bottom = -1 * (depth / 2) + fromBottom + "px";
    div.style.left = fromLeft + "px";
    div.style.transform = "rotateX(90deg) translateY(" + -1 * (depth/2 + fromFront) + "px)";
    div.style.height = depth+"px";
    div.style.width = width+"px";
    div.style.backgroundColor = color;
    div.style.backfaceVisibility = "hidden";
    div.id = id + "-flat";
    if(!isClickable) {
        div.style.pointerEvents = "none";
    }

    document.getElementById("shop").appendChild(div);
}


function createFlatCircle(id, fromLeft, fromFront, fromBottom, width, depth, color, isClickable=true) {
    createFlatPanel(id, fromLeft, fromFront, fromBottom, width, depth, color, isClickable);
    document.getElementById(id+"-flat").style.borderRadius = width/2+"px";
}


function createSidePanel(id, fromLeft, fromFront, fromBottom, depth, height, color, isClickable=true) {
    const div = document.createElement('div');

    div.style.position = 'absolute';
    div.style.width = `${depth}px`;
    div.style.height = `${height}px`;
    div.style.left = fromLeft - depth/2 + "px";
    div.style.bottom = `${fromBottom}px`;
    div.style.backgroundColor = color;
    div.style.transform = "rotateY(90deg) translateX("+(fromFront+depth/2)+"px)";
    if(!isClickable) {
        div.style.pointerEvents = "none";
    }

    div.id = `${id}-sideWall`;

    document.getElementById('shop').appendChild(div);
}

function createFrontPanel(id, fromLeft, fromFront, fromBottom, width, height, color, isClickable=true, border="none") {
    const div = document.createElement('div');

    div.style.position = 'absolute';
    div.style.width = `${width}px`;
    div.style.height = `${height}px`;
    div.style.left = `${fromLeft}px`;
    div.style.bottom = `${fromBottom-1}px`;
    div.style.backgroundColor = color;
    div.style.backfaceVisibility = "hidden";
    div.style.border = border;
    div.style.transform = "translateZ("+(-1*fromFront)+"px)";
    if(!isClickable) {
        div.style.pointerEvents = "none";
    }

    div.id = `${id}-wall`;

    document.getElementById('shop').appendChild(div);
}

function createFrontCircle(id, fromLeft, fromFront, fromBottom, width, height, color, isClickable=true) {
    createFrontPanel(id, fromLeft, fromFront, fromBottom, width, height, color, isClickable);
    document.getElementById(id+"-wall").style.borderRadius = width/2+"px";
}

function createCubeSides(id, fromLeft, fromFront, fromBottom, width, height, depth, colors, isClickable=true) {
    if (colors.front) {
        createFrontPanel(id + '-front', fromLeft, fromFront, fromBottom, width, height, colors.front, isClickable);
    }
    if (colors.top) {
        createFlatPanel(id + '-top', fromLeft, fromFront, fromBottom + height, width, depth, colors.top, isClickable);
    }
    if (colors.left) {
        createSidePanel(id + '-left', fromLeft, fromFront, fromBottom, depth, height, colors.left, isClickable);
    }
    if (colors.right) {
        createSidePanel(id + '-right', fromLeft + width, fromFront, fromBottom, depth, height, colors.right, isClickable);
    }
    if (colors.bottom) {
        createFlatPanel(id + '-bottom', fromLeft, fromFront, fromBottom, width, depth, colors.bottom, isClickable);
    }
    if (colors.back) {
        createFrontPanel(id + '-back', fromLeft, fromFront + depth, fromBottom, width, height, colors.back, isClickable);
    }
}

//Flat square top, 4 legs
function createSquareTable(id, fromLeft, fromFront, fromBottom, width, height, depth, legWidth, color) {
    // Check if color is an object or a string
    const topColor = typeof color === 'object' ? color.top : color;
    const legColor = typeof color === 'object' ? color.leg : color;

    // Create the table top
    createFlatPanel(id + '-top', fromLeft, fromFront, fromBottom+height, width, depth, topColor);

    // Create the four legs
    createFrontPanel(id + '-leg1', fromLeft, fromFront, fromBottom, legWidth, height, legColor);
    createFrontPanel(id + '-leg2', fromLeft + width - legWidth, fromFront, fromBottom, legWidth, height, legColor);
    createFrontPanel(id + '-leg3', fromLeft, fromFront + depth, fromBottom, legWidth, height, legColor);
    createFrontPanel(id + '-leg4', fromLeft + width - legWidth, fromFront + depth - legWidth, fromBottom, legWidth, height, legColor);
}

function createCircularTable(id, fromLeft, fromFront, fromBottom, width, height, depth, color) {
    const radius = width / 2;
    const legWidth = width / 10;

    createFlatCircle(id, fromLeft, fromFront, fromBottom + height, width, depth, color);

    // Create the leg
    createFrontPanel(id + '-leg', fromLeft + radius - legWidth / 2, fromFront + depth/2, fromBottom+1, legWidth, height-1, color);

    // Create triangular base
    const triangleBaseWidth = legWidth * 4;
    let divBase = document.createElement('div');
    divBase.style.position = "absolute";
    divBase.style.bottom = fromBottom + "px";
    divBase.style.left = fromLeft + radius - triangleBaseWidth / 2+.5 + "px";
    divBase.style.width = "0";
    divBase.style.height = "0";
    divBase.style.borderLeft = `${triangleBaseWidth / 2}px solid transparent`;
    divBase.style.borderRight = `${triangleBaseWidth / 2}px solid transparent`;
    divBase.style.borderBottom = `${legWidth * 2}px solid ${color}`;
    divBase.style.transform = `translateZ(${ -1 * fromFront - depth / 2}px)`;
    divBase.id = id + "-base";
    document.getElementById("shop").appendChild(divBase);
}

function createSideChair(id, fromLeft, fromFront, fromBottom, width, height, depth, color) {
    let legWidth = Math.max(width/10);
    // Create the square base for the chair seat
    createSquareTable(id + '-seat', fromLeft, fromFront, fromBottom, width, height/2, depth, legWidth, color);

    // Create back panels
    createFrontPanel(id + '-back1', fromLeft + width - legWidth, fromFront, fromBottom + height/2, legWidth, height/2, color);
    createFrontPanel(id + '-back2', fromLeft + width - legWidth, fromFront+depth, fromBottom + height/2, legWidth, height/2, color);


    // Create right side panel for the back
    createSidePanel(id + '-side-back', fromLeft + width - legWidth, fromFront, fromBottom + height/2, depth, height/2, color); // Assuming depth of back is half the depth of the seat
}

function createFrontDoor(id, fromLeft, fromFront, fromBottom) {

    createFrontPanel(id, fromLeft, fromFront, fromBottom, 40, 80, INTERIOR_DOOR_COLOR);
    let door = document.getElementById(id+"-wall");
    attachPanel(id+"-wall", "handle", 33, 40, 4, 4, METAL_COLOR_1);
    door.style.pointerEvents = "none";
    door.style.opacity = ".5";

    doorIds.push(id+"-wall");
}

function createSideDoor(id, fromLeft, fromFront, fromBottom) {
    createSidePanel(id, fromLeft, fromFront, fromBottom, 40, 80, INTERIOR_DOOR_COLOR);
    let door = document.getElementById(id+"-sideWall");
    attachPanel(id+"-sideWall", "handle", 33, 40, 4, 4, METAL_COLOR_1);
    door.style.pointerEvents = "none";
    door.style.opacity = ".6";
    doorIds.push(id+"-sideWall");
}

function attachGlassDoor(targetId, fromLeft) {
    createFrontPanel(targetId, fromLeft, 0, 0, 40, 80, GLASS_DOOR_COLOR);

    let door = document.getElementById(targetId+"-wall");
    attachPanel(targetId+"-wall", "handle", 4, 39, 2, 10, METAL_COLOR_1);
    door.style.pointerEvents = "none";
    door.style.opacity = "1";
    doorIds.push(targetId+"-wall");
}

function createRegister(id, fromLeft, fromFront, fromBottom, width, height, depth) {

    createCubeSides(id+"1", fromLeft, fromFront, fromBottom, width, height/2, depth, {
        front:METAL_COLOR_9,
        left:METAL_COLOR_9,
        right:METAL_COLOR_9,
        top:METAL_COLOR_9
    }, false);

    createCubeSides(id+"2", fromLeft, fromFront, fromBottom+height/2, width, height/2, depth/3, {
        front:METAL_COLOR_5,
        left:METAL_COLOR_5,
        right:METAL_COLOR_5,
        top:METAL_COLOR_5
    }, true);


    attachPanel(id+"2-front-wall", "display", 1, 1, width-4, 5, "black");
    let display = document.getElementById(id+"2-front-wall-display");
    display.innerHTML = "<div style='font-size:3px;display:inline'>Total:</div> <div style='display:inline' id='"+id+"Amount'>99.00</div>";
    display.style.fontSize = "4px";
    display.style.padding = "1px";
    display.style.color = "rgb(84, 231, 84)";
}

function createFrontImage(id, fromLeft, fromFront, fromBottom, width, height, fileName) {
    createFrontPanel(id, fromLeft, fromFront, fromBottom, width, height, "rgba(0, 0, 0, 0)");
    let backgroundDiv = document.getElementById(id + "-wall");
    backgroundDiv.style.pointerEvents = "none";
    const img = new Image();
    img.id = id + "-img";
    img.src = "img/"+fileName;
    img.style.width = "100%";
    backgroundDiv.appendChild(img);
}