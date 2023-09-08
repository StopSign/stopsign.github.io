

let floorColor = "rgb(203, 144, 64)";
let sideWallColor = "rgba(211, 209, 209, .8)";
let metalColor1 = "rgb(147, 149, 153)";
let metalColor2 = "rgb(142, 144, 147)";
let metalColor3 = "rgb(137, 139, 143)";
let metalColor4 = "rgb(132, 134, 137)";
let metalColor5 = "rgb(127, 129, 133)";
let metalColor7 = "rgb(117, 119, 123)";
let metalColor10 = "rgb(102, 104, 107)";
let fire = "rgb(255, 99, 71)";
let interiorDoorColor = "rgba(211, 209, 209, .2)";
let tableColor = "rgb(139, 119, 101)";



// Flat table:
//     bottom:-<half of height (+offset)>
// left:50px = transform:translateX(50px)
// transform:translateY(50px) = send back
//

//Creates a div of widthxheight at fromLeft, fromFront, fromBottom, counting from the bottom left ground corner of the shops
function createFlatPanel(id, fromLeft, fromFront, fromBottom, width, depth, color)
{
    let div = document.createElement('div');
    div.style.position = "absolute";
    div.style.bottom = -1 * (depth / 2) + fromBottom + "px";
    div.style.left = fromLeft + "px";
    div.style.transform = "rotateX(90deg) translateY(" + -1 * (depth/2 + fromFront) + "px)";
    div.style.height = depth+"px";
    div.style.width = width+"px";
    div.style.backgroundColor = color;
    div.id = id + "-flat";

    document.getElementById("shop").appendChild(div);
}


function createSidePanel(id, fromLeft, fromFront, fromBottom, depth, height, color) {
    const div = document.createElement('div');

    div.style.position = 'absolute';
    div.style.width = `${depth}px`;
    div.style.height = `${height}px`;
    div.style.left = fromLeft - depth/2 + "px";
    div.style.bottom = `${fromBottom}px`;
    div.style.backgroundColor = color;
    div.style.transform = "rotateY(90deg) translateX("+(fromFront+depth/2)+"px)";

    div.id = `${id}-sideWall`;

    document.getElementById('shop').appendChild(div);
}

function createFrontPanel(id, fromLeft, fromFront, fromBottom, width, height, color) {
    const div = document.createElement('div');

    div.style.position = 'absolute';
    div.style.width = `${width}px`;
    div.style.height = `${height+1}px`;
    div.style.left = `${fromLeft}px`;
    div.style.bottom = `${fromBottom-1}px`;
    div.style.backgroundColor = color;
    div.style.transform = "translateZ("+(-1*fromFront)+"px)";

    div.id = `${id}-wall`;

    document.getElementById('shop').appendChild(div);
}
//
// function createCubeSides(id, fromLeft, fromFront, fromBottom, width, height, depth, color) {
//     // Check if color is an object or a string
//     const frontColor = typeof color === 'object' ? color.front : color;
//     const topColor = typeof color === 'object' ? color.top : color;
//     const leftColor = typeof color === 'object' ? color.left : color;
//     const rightColor = typeof color === 'object' ? color.right : color;
//
//     createFrontPanel(id + '-front', fromLeft, fromFront, fromBottom, width, height, frontColor);
//     createFlatPanel(id + '-top', fromLeft, fromFront, fromBottom+height, width, depth, topColor);
//     createSidePanel(id + '-left', fromLeft, fromFront, fromBottom, depth, height, leftColor);
//     createSidePanel(id + '-right', fromLeft + width, fromFront, fromBottom, depth, height, rightColor);
// }

function createCubeSides(id, fromLeft, fromFront, fromBottom, width, height, depth, colors) {
    if (colors.front) {
        createFrontPanel(id + '-front', fromLeft, fromFront, fromBottom, width, height, colors.front);
    }
    if (colors.top) {
        createFlatPanel(id + '-top', fromLeft, fromFront, fromBottom + height, width, depth, colors.top);
    }
    if (colors.left) {
        createSidePanel(id + '-left', fromLeft, fromFront, fromBottom, depth, height, colors.left);
    }
    if (colors.right) {
        createSidePanel(id + '-right', fromLeft + width, fromFront, fromBottom, depth, height, colors.right);
    }
    if (colors.bottom) {
        createFlatPanel(id + '-bottom', fromLeft, fromFront, fromBottom, width, depth, colors.bottom);
    }
    if (colors.back) {
        createFrontPanel(id + '-back', fromLeft, fromFront + depth, fromBottom, width, height, colors.back);
    }
}

function createSquareTable(id, fromLeft, fromFront, fromBottom, width, height, depth, legWidth, color) {
    // Check if color is an object or a string
    const topColor = typeof color === 'object' ? color.top : color;
    const legColor = typeof color === 'object' ? color.leg : color;

    // Create the table top
    createFlatPanel(id + '-top', fromLeft, fromFront, fromBottom+height, width, depth, topColor);

    // Create the four legs
    createFrontPanel(id + '-leg1', fromLeft, fromFront, fromBottom, legWidth, height+1, legColor);
    createFrontPanel(id + '-leg2', fromLeft + width - legWidth, fromFront, fromBottom, legWidth, height+1, legColor);
    createFrontPanel(id + '-leg3', fromLeft, fromFront + depth, fromBottom, legWidth, height, legColor);
    createFrontPanel(id + '-leg4', fromLeft + width - legWidth, fromFront + depth - legWidth, fromBottom, legWidth, height, legColor);
}

function attachPanel(targetId, id, fromLeft, fromTop, width, height, color) {
    const div = document.createElement('div');

    div.style.position = "absolute";
    div.style.left = fromLeft + "px";
    div.style.top = fromTop + "px";
    div.style.width = width + "px";
    div.style.height = height + "px";
    div.style.backgroundColor = color;
    div.id = targetId + "-" + id;

    document.getElementById(targetId).appendChild(div);
}

function createFrontDoor(id, fromLeft, fromFront, fromBottom, isInteriorDoor) {
    const div = document.createElement('div');

    createFrontPanel(id, fromLeft, fromFront, fromBottom, 40, 80, interiorDoorColor);
    let door = document.getElementById(id+"-wall");
    attachPanel(id+"-wall", "handle", 33, 40, 4, 4, metalColor1);
    door.style.pointerEvents = "none";
    door.style.opacity = ".5";
}

function createSideDoor(id, fromLeft, fromFront, fromBottom) {
    const div = document.createElement('div');

    createSidePanel(id, fromLeft, fromFront, fromBottom, 40, 80, interiorDoorColor);
    let door = document.getElementById(id+"-sideWall");
    attachPanel(id+"-sideWall", "handle", 33, 40, 4, 4, metalColor1);
    door.style.pointerEvents = "none";
    door.style.opacity = ".6";
}