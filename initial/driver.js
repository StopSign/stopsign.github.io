'use strict';

function startGame() {
    if (isFileSystem) {
    } else {
        window.doWork = new Worker('helpers/interval.js');
        window.doWork.onmessage = function (event) {
            if (event.data === 'interval.start') {
                tick();
            }
        };
    }

    load();
}

function tick() {
    if(sudoStop) {
        return;
    }
    let newTime = new Date();
    totalTime += newTime - curTime;
    gameTicksLeft += newTime - curTime;
    saveTimer -= newTime - curTime;
    curTime = newTime;

    if(saveTimer < 0) {
        save();
    }
    // document.getElementById("saveTimer").innerHTML = round(saveTimer/1000);

    let didSomething = false; //for performance

    while (gameTicksLeft > (1000 / ticksPerSecond)) {
        if(stop) {
            gameTicksLeft = 0;
            view.updating.update();
            break;
        }

        ticksForSeconds++;
        if(ticksForSeconds % ticksPerSecond === 0) {
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

    }
    if(didSomething) {
        view.updating.update();
    }
}

function tickPassed() {
    //gameTick();
}

function secondPassed() {
    //secondTick();
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