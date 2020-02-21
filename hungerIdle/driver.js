'use strict';

let gameSpeed = 1;
let bonusSpeed = 1;

let curTime = new Date();
let gameTicksLeft = 0;
let sudoStop = false;
let saveTimer = 10000;
let ticksPerSecond = 20;
let totalTime = 0;

let prevTime = curTime;

function tick() {
    if(sudoStop) {
        return;
    }
    let newTime = new Date();
    gameTicksLeft += newTime - curTime;
    saveTimer -= newTime - curTime;
    curTime = newTime;

    if(saveTimer < 0) {
        save();
    }
    // document.getElementById("saveTimer").innerHTML = round(saveTimer/1000);

    let didSomething = false; //for performance
    let secondTime = false;
    while (gameTicksLeft > (1000 / ticksPerSecond)) {
        if(stop) {
            gameTicksLeft = 0;
            break;
        }

        totalTime++;
        if(totalTime % ticksPerSecond === 0) {
            secondPassed();
        }
        tickPassed();


        didSomething = true;
        if(gameTicksLeft > 2000) {
            window.fps /= 2;
            console.warn('too fast! (${gameTicksLeft})');
            gameTicksLeft = 0;
            stop = true;
        }
        gameTicksLeft -= (1000 / ticksPerSecond) / gameSpeed / bonusSpeed;

        if(secondTime) {
            // console.log("lag");
        }
        secondTime = true;
    }
    if(didSomething) {
        view.updating.update();
    }
    prevTime = curTime;
}

function tickPassed() {
    engageMonster();
}

function secondPassed() {
    recoverHealth();
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