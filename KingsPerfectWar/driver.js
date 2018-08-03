'use strict';

let gameSpeed = 1;
let bonusSpeed = 1;

let curTime = new Date();
let gameTicksLeft = 0;

function tick() {
    let newTime = new Date();
    gameTicksLeft += newTime - curTime;
    curTime = newTime;
    if(stop) {
        // addOffline(gameTicksLeft * offlineRatio);
        gameTicksLeft = 0;
        return;
    }

    while (gameTicksLeft > (1000 / 50)) {
        if(gameTicksLeft > 2000) {
            window.fps /= 2;
            console.warn('too fast! (${gameTicksLeft})');
            gameTicksLeft = 0;
        }
        if(stop) {
            return;
        }
        gameTicksLeft -= (1000 / 50) / gameSpeed / bonusSpeed;

    }

    view.updating.update();
}

function recalcInterval(fps) {
    window.fps = fps;
    if(window.mainTickLoop !== undefined) {
        clearInterval(window.mainTickLoop);
    }
    if(isFileSystem) {
        window.mainTickLoop = setInterval(tick, 1000/fps);
    } else {
        doWork.postMessage({stop: true});
        doWork.postMessage({start: true, ms: (1000 / fps)});
    }
}

function pauseGame() {
    stop = !stop;
}