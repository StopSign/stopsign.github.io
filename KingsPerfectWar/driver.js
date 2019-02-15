'use strict';

let gameSpeed = 8;
let bonusSpeed = 1;

let curTime = new Date();
let gameTicksLeft = 0;
let sudoStop = false;
let saveTimer = 0;

function tick() {
    if(sudoStop) {
        return;
    }
    let newTime = new Date();
    totalTime += newTime - curTime;
    gameTicksLeft += newTime - curTime;
    curTime = newTime;
    if(stop) {
        addOffline(gameTicksLeft * .8);
        gameTicksLeft = 0;
        view.updating.update();
        return;
    }

    while (gameTicksLeft > (1000 / 10)) {
        if(stop) {
            break;
        }
        if(gameTicksLeft > 2000) {
            window.fps /= 2;
            console.warn('too fast! (${gameTicksLeft})');
            gameTicksLeft = 0;
        }
        gameTicksLeft -= (1000 / 10) / gameSpeed / bonusSpeed;

        mana--;

        castle.tick(); //resources
        shrine.tick(); //progress on buffs
        actions.tick(); //actions
        warMap.tick(); //combat
        unlockLists.tick();

        //TODO check if king is dead or only enemies at home, restart
        if(document.getElementById("pauseBeforeRestart").checked && mana === 0) {
            pauseGame();
        }
        if(!stop && mana === 0) {
            restart();
        }
    }
    saveTimer++;
    if(saveTimer > 500) {
        saveTimer = 0;
        save();
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

function addOffline(num) {
    if(num) {
        if(totalOfflineMs + num < 0 && bonusSpeed > 1) {
            toggleOffline();
        }
        totalOfflineMs += num;
        if(totalOfflineMs < 0) {
            totalOfflineMs = 0;
        }
        document.getElementById("bonusSeconds").innerHTML = intToString(totalOfflineMs / 1000, 2);
    }
}

function toggleOffline() {
    let button = document.getElementById("bonusButton");
    if(bonusSpeed === 1) { //go fast
        bonusSpeed = 4;
        addClassToDiv(button, "buttonPressed");
        removeClassFromDiv(button, "button");
    } else { //take it slow
        bonusSpeed = 1;
        removeClassFromDiv(button, "buttonPressed");
        addClassToDiv(button, "button");
    }
}

function togglePause() {
    if(stop) {
        unpauseGame();
    } else {
        pauseGame();
    }
}

function pauseGame() {
    stop = true;
    document.title = "*PAUSED* King's Perfect War";
    document.getElementById('pausePlay').innerHTML = 'Play';
}

function unpauseGame() {
    if(mana === 0) {
        restart();
    }
    stop = false;
    document.title = "King's Perfect War";
    document.getElementById('pausePlay').innerHTML = 'Pause';
}

function restart() {
    king.curData.rflxCur = king.savedData.rflxInitial;
    if(levelSave[curLevel]) {
        king.saveHighestPerson();
        shrine.helpers.saveHighestBlessings();
    }
    for (let property in created) {
        if (created.hasOwnProperty(property)) {
            created[property] = 0;
        }
    }
    actions.restart();
    king.curData.aura = "";
    view.clickable.initial.createWarMap();
    mana = levelData.initial.mana;
    maxMana = mana;
    gold = levelData.initial.gold;
    wood = levelData.initial.wood;

    unlockLists.checkUnlocks();

    prevState = {};
}
