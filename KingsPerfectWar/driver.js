'use strict';

let gameSpeed = 1;
let bonusSpeed = 1;

let curTime = new Date();
let gameTicksLeft = 0;
let sudoStop = false;

function tick() {
    if(sudoStop) {
        return;
    }
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

        castle.tick(); //resources
        //lab.tick(); //buffs
        actions.tick(); //actions
        warMap.tick(); //combat

        //TODO check if king is dead or only enemies at home, restart

        if(mana === 0) {
            restart();
        }
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
    for (let property in created.castle) {
        if (created.castle.hasOwnProperty(property)) {
            created.castle[property] = 0;
        }
    }
    for (let property in created.king) {
        if (created.king.hasOwnProperty(property)) {
            created.king[property] = 0;
        }
    }
    actions.restart();
    view.clickable.initial.createWarMap();
    mana = levelData.initial.mana;
    maxMana = mana;
    gold = levelData.initial.gold;
    wood = levelData.initial.wood;

    king.curData.rflxCur = king.savedData.rflxInitial;

    prevState = {};
}