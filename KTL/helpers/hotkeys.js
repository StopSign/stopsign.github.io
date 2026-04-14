let keysPressed = {};
let movementStep = 10;
let animationFrameId;

document.addEventListener("keydown", function(e) {
    const active = document.activeElement;
    if (active?.id?.includes('NumInput')) return;

    const code = e.code;

    keysPressed[code] = true;
    keysPressed['shift'] = e.shiftKey;

    if (code === 'Escape') {
        document.getElementById("helpMenu").style.display = "none";
        closeModal();
    }

    if (code === 'Space') {
        pauseGame();
    }

    if (code === 'Digit1') switchToPlane(0);
    else if (code === 'Digit2') switchToPlane(1);
    else if (code === 'Digit3') switchToPlane(2);
    else if (code === 'Digit4') switchToPlane(3);
    else if (code === 'Digit5') switchToPlane(4);

    let isShowing = document.getElementById("helpMenu").style.display !== "none";

    if (code === 'KeyQ' && !isShowing) {
        setZoomNoMouse(scaleByPlane[data.planeTabSelected] - scaleStep * 2);
    }
    if (code === 'KeyE' && !isShowing) {
        setZoomNoMouse(scaleByPlane[data.planeTabSelected] + scaleStep * 2);
    }

    if (!animationFrameId) {
        const movementCodes = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyR', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowRight'];

        if (movementCodes.includes(code)) {
            if (isShowing && ['KeyW', 'KeyS', 'ArrowUp', 'ArrowDown'].includes(code)) {
                moveMenuScroll();
            } else if (!isShowing) {
                moveActionContainer();
            }
        }
    }
});

document.addEventListener("keyup", function(e) {
    delete keysPressed[e.code];
    keysPressed['shift'] = e.shiftKey; // Update shift state on release

    if (Object.keys(keysPressed).filter(k => k !== 'shift').length === 0) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
});

function moveMenuScroll() {
    const container = document.getElementById(`${selectedMenu}TextContainer`);
    if (!container) return;

    const movementStep = 20;

    // Use physical codes
    if (keysPressed['KeyW'] || keysPressed['ArrowUp']) {
        container.scrollTop -= movementStep;
    }
    if (keysPressed['KeyS'] || keysPressed['ArrowDown']) {
        container.scrollTop += movementStep;
    }

    animationFrameId = requestAnimationFrame(moveMenuScroll);
}

function moveActionContainer() {
    let shiftMod = keysPressed['shift'] ? 3 : 1;

    // Physical WASD positions
    if (keysPressed['KeyW'] || keysPressed['ArrowUp']) {
        transformY[data.planeTabSelected] += movementStep * shiftMod;
    }
    if (keysPressed['KeyA'] || keysPressed['ArrowLeft']) {
        transformX[data.planeTabSelected] += movementStep * shiftMod;
    }
    if (keysPressed['KeyS'] || keysPressed['ArrowDown']) {
        transformY[data.planeTabSelected] -= movementStep * shiftMod;
    }
    if (keysPressed['KeyD'] || keysPressed['ArrowRight']) {
        transformX[data.planeTabSelected] -= movementStep * shiftMod;
    }

    const isMoving = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowRight'].some(k => keysPressed[k]);

    if (isMoving) {
        actionContainer.style.transform = `translate(${transformX[data.planeTabSelected]}px, ${transformY[data.planeTabSelected]}px) scale(${scaleByPlane[data.planeTabSelected]})`;
        animationFrameId = requestAnimationFrame(moveActionContainer);
    } else {
        cancelAnimationFrame(animationFrameId);2
        animationFrameId = null;
    }
}