let keysPressed = {};
let movementStep = 10;
let animationFrameId;

document.addEventListener("keydown", function(e) {
    const active = document.activeElement;
    if (active && 'id' in active) {
        if (active.id && active.id.indexOf('NumInput') !== -1) {
            return;
        }
    }

    let key = e.key.toLowerCase();
    keysPressed[key] = {
        code: e.keyCode || e.charCode,
        shift: e.shiftKey
    };

    if (keysPressed['escape']) {
        document.getElementById("helpMenu").style.display = "none";
        closeModal()
    }
    if(keysPressed[' ']) {
        pauseGame();
    }
    if(keysPressed['1']) {
        switchToPlane(0)
    } else if(keysPressed['2']) {
        switchToPlane(1)
    } else if(keysPressed['3']) {
        switchToPlane(2)
    } else if(keysPressed['4']) {
        switchToPlane(3)
    }
    let isShowing = document.getElementById("helpMenu").style.display !== "none";

    if (keysPressed['q'] && !isShowing) {
        setZoomNoMouse(scaleByPlane[data.planeTabSelected] - scaleStep*2)
    }
    if (keysPressed['e'] && !isShowing) {
        setZoomNoMouse(scaleByPlane[data.planeTabSelected] + scaleStep*2)
    }

    if(isShowing && !animationFrameId && ['w', 's', 'arrowup', 'arrowdown'].includes(key)) {
        moveMenuScroll();
    }

    if (!isShowing && !animationFrameId && ['w', 'a', 's', 'd', 'r', 'arrowleft', 'arrowup', 'arrowdown', 'arrowright'].includes(key)) {
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

function moveMenuScroll() {
    const container = document.getElementById(`${selectedMenu}TextContainer`);
    if (!container) return;

    const movementStep = 20;

    if (keysPressed['w'] || keysPressed['arrowup']) {
        container.scrollTop -= movementStep;
    }
    if (keysPressed['s'] || keysPressed['arrowdown']) {
        container.scrollTop += movementStep;
    }

    animationFrameId = requestAnimationFrame(moveMenuScroll);
}


function moveActionContainer() {
    let shiftMod = keysPressed['shift'] ? 3 : 1;
    if (keysPressed['w'] || keysPressed['arrowup']) {
        transformY[data.planeTabSelected] += movementStep * shiftMod;
    }
    if (keysPressed['a'] || keysPressed['arrowleft']) {
        transformX[data.planeTabSelected] += movementStep * shiftMod;
    }
    if (keysPressed['s'] || keysPressed['arrowdown']) {
        transformY[data.planeTabSelected] -= movementStep * shiftMod;
    }
    if (keysPressed['d'] || keysPressed['arrowright']) {
        transformX[data.planeTabSelected] -= movementStep * shiftMod;
    }
    if(['w', 'a', 's', 'd', 'arrowleft', 'arrowup', 'arrowdown', 'arrowright'].some(key => keysPressed[key])) { //isMoving
        actionContainer.style.transform = `translate(${transformX[data.planeTabSelected]}px, ${transformY[data.planeTabSelected]}px) scale(${scaleByPlane[data.planeTabSelected]})`;
    }


    // forceRedraw(windowElement);

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