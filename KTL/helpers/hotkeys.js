let keysPressed = {};
let movementStep = 10;
let animationFrameId;

document.addEventListener("keydown", function(e) {
    let key = e.key.toLowerCase();
    keysPressed[key] = {
        code: e.keyCode || e.charCode,
        shift: e.shiftKey
    };

    if (keysPressed['escape']) {
        // deselect();
    }
    if(keysPressed[' ']) {
        pauseGame();
    }

    if (!animationFrameId && ['w', 'a', 's', 'd'].includes(key)) {
        moveActionContainer();
    }
});

document.addEventListener("keyup", function(e) {
    delete keysPressed[e.key.toLowerCase()];

    if (Object.keys(keysPressed).length === 0) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
});

function moveActionContainer() {
    if (keysPressed['w']) {
        transformY += movementStep;
    }
    if (keysPressed['a']) {
        transformX += movementStep;
    }
    if (keysPressed['s']) {
        transformY -= movementStep;
    }
    if (keysPressed['d']) {
        transformX -= movementStep;
    }

    actionContainer.style.transform = `translate(${transformX}px, ${transformY}px) scale(${scale})`;

    forceRedraw(windowElement);

    animationFrameId = requestAnimationFrame(moveActionContainer);
}






// let keys = {32: 1, 37: 1, 38: 1, 39: 1, 40: 1};
//
// function preventDefault(e) {
//     e = e || window.event;
//     if (e.preventDefault)
//         e.preventDefault();
//     e.returnValue = false;
// }

// function preventDefaultForScrollKeys(e) {
//     if (keys[e.keyCode]) {
//         preventDefault(e);
//         return false;
//     }
// }
//
// function disableScroll() {
//     document.onkeydown = preventDefaultForScrollKeys;
// }
// disableScroll();