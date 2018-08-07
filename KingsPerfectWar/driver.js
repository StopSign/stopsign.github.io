'use strict';

let gameSpeed = 1;
let bonusSpeed = 1;

let curTime = new Date();
let gameTicksLeft = 0;

function tick() {
    let newTime = new Date();
    totalTime += newTime - curTime;
    gameTicksLeft += newTime - curTime;
    curTime = newTime;
    if(stop) {
        // addOffline(gameTicksLeft * offlineRatio);
        gameTicksLeft = 0;
        view.updating.update();
        return;
    }

    while (gameTicksLeft > (1000 / 10)) {
        if(gameTicksLeft > 2000) {
            window.fps /= 2;
            console.warn('too fast! (${gameTicksLeft})');
            gameTicksLeft = 0;
        }
        gameTicksLeft -= (1000 / 10) / gameSpeed / bonusSpeed;

        if(document.getElementById("pauseBeforeRestart").checked && mana === 0 && !stop) {
            pauseGame();
            break;
        }

        mana--;

        //units.tick(); //combat
        //castle.tick(); //resources
        //lab.tick(); //buffs
        actions.tick(); //actions tick last
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
    document.title = stop ? "*PAUSED* King's Perfect War" : "King's Perfect War";
    document.getElementById('pausePlay').innerHTML = stop ? 'Play' : 'Pause';
}

function restart() {

}