let myKeyQueue = [];
document.addEventListener("keydown", function(e) {
    let code = {key:(e.charCode !== 0 ? e.charCode : e.keyCode), shift:e.shiftKey};
    myKeyQueue.push(code);
    processKeyQueue();
});

function processKeyQueue() {
    let key = myKeyQueue[0].key;
    let shift = myKeyQueue[0].shift;
    myKeyQueue.splice(0, 1);
    //console.log(key, shift);
    if(key === 80) { //p
        buyBuilding('solarPanel');
    }
    if(key === 77) { //m
        buyBuilding('mine');
    }
    if(key === 70) { //f
        buyBuilding('factory');
    }
    if(key === 76) { //l
        buyBuilding('lab');
    }
    if(key === 72) { //h
        buyBuilding('house');
    }
    if(key === 69) { //e
        buyBuilding('server');
    }
    if(key === 81) { //q
        buyBuilding('quantumTransport');
    }
    if(key === 82) { //r
        buyBuilding('radioTelescope');
    }
    if(key === 65) { //a
        buyBuilding('launchPad');
    }
    if(key === 83) { //s
        sellBuilding();
    }
    if(key === 85) { //u
        upgradeBuilding();
    }
    if(key === 49) { //1
        if(shift) {
            changePlanet(0);
        } else {
            selectOption(0);
        }
    }
    if(key === 50) { //2
        if(shift) {
            changePlanet(1);
        } else {
            selectOption(1);
        }
    }
    if(key === 51) { //3
        if(shift) {
            changePlanet(2);
        } else {
            selectOption(2);
        }
    }
    if(key === 52) { //4
        if(shift) {
            changePlanet(3);
        } else {
            selectOption(3);
        }
    }
    if(key === 53) { //5
        if(shift) {
            changePlanet(4);
        } else {
            selectOption(4);
        }
    }
    if(key === 32) { //space
        pauseBuilding();
    }

    if(key === 37) { //left
        gridKeyPress(-1, 0);
    }
    if(key === 38) { //up
        gridKeyPress(0, -1);
    }
    if(key === 39) { //right
        gridKeyPress(1, 0);
    }
    if(key === 40) { //down
        gridKeyPress(0, 1);
    }

    if(key === 27) { //esc
        errorMessages = [];
        view.createErrorMessages();
    }
}

let keys = {32: 1, 37: 1, 38: 1, 39: 1, 40: 1};

function preventDefault(e) {
    e = e || window.event;
    if (e.preventDefault)
        e.preventDefault();
    e.returnValue = false;
}

function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
}

function disableScroll() {
    document.onkeydown = preventDefaultForScrollKeys;
}
disableScroll();