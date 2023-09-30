const scene = document.getElementById("scene");
let currentX = 0;
let currentY = 0;
let isRightClick = false;
let isLeftClick = false;

let rotationX = -27;
let rotationY = 0;
let translation = 775;
let zoom = 1;

// Right Click and Drag to Rotate
//document.addEventListener("contextmenu", (e) => e.preventDefault());

document.addEventListener("mousedown", (e) => {
    if (e.button === 2) isRightClick = true;
    if (e.button === 0) isLeftClick = true;
    currentX = e.clientX;
    currentY = e.clientY;
});

document.addEventListener("mousemove", (e) => {
    if (isLeftClick) {
        const deltaX = e.clientX - currentX;
        const deltaY = e.clientY - currentY;

        translation += deltaX * 1;
        if(translation > 1175) {
            translation = 1175;
        }
        if(translation < -240) { //increase with more shops
            translation = -240;
        }
        rotationX += deltaY * 0.2;
        if(rotationX > -3) {
            rotationX = -3;
        }
        if(rotationX < -160) {
            rotationX = -160;
        }
    } else {
        return;
    }

    const elements = document.getElementById('shop');
    elements.style.transform = `rotateX(${rotationX}deg) translateX(${translation}px)`;

    scene.style.transform = `perspective(1000px) scale(${zoom})`;

    currentX = e.clientX;
    currentY = e.clientY;
});

document.addEventListener("mouseup", () => {
    isRightClick = false;
    isLeftClick = false;
});

// Scroll to Zoom
document.addEventListener("wheel", (e) => {
    zoom += e.deltaY * -0.002;
    zoom = Math.min(Math.max(0.70, zoom), 10);  // Constrain zoom
    scene.style.transform = `perspective(1000px) scale(${zoom})`;
});