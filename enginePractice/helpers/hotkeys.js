let myKeyQueue = [];
document.addEventListener("keydown", function(e) {
    let code = {key:(e.charCode !== 0 ? e.charCode : e.keyCode), shift:e.shiftKey};
    myKeyQueue.push(code);
    processKeyQueue();
});

function processKeyQueue() {
    let key = myKeyQueue[0].key;
    // var shift = myKeyQueue[0].shift;
    myKeyQueue.splice(0, 1);
    if(key === 27) { //escape
        // deselect();
    }
}

let keysPressed = {}; // Track multiple keys
let movementStep = 30; // Movement speed
let animationFrameId;

// Track keys being pressed
document.addEventListener("keydown", function(e) {
    keysPressed[e.key.toLowerCase()] = true; // Register the key
    if (!animationFrameId) moveActionContainer(); // Start movement loop
});

// Stop tracking keys when released
document.addEventListener("keyup", function(e) {
    delete keysPressed[e.key.toLowerCase()];
    if (Object.keys(keysPressed).length === 0) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
});

// Movement function using requestAnimationFrame
function moveActionContainer() {

    let keyPressed = false;
    if (keysPressed['w']) { // Move up
        transformY += movementStep
        keyPressed = true;
    }
    if (keysPressed['a']) { // Move left
        transformX += movementStep
        keyPressed = true;
    }
    if (keysPressed['s']) { // Move down
        transformY -= movementStep
        keyPressed = true;
    }
    if (keysPressed['d']) { // Move right
        transformX -= movementStep
        keyPressed = true;
    }
    if(!keyPressed) {
        return;
    }

    // Apply the new position
    actionContainer.style.transform = `translate(${transformX}px, ${transformY}px) scale(${scale})`;

    forceRedraw(windowElement);

    // Continue the animation loop if keys are still pressed
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