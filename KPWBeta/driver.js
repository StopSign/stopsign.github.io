'use strict';

let gameSpeed = 1;
let bonusSpeed = 1;

let curTime = new Date();
let gameTicksLeft = 0;
let sudoStop = false;
let saveTimer = 2000;

let reachedOneMana = false;

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
    document.getElementById("saveTimer").innerHTML = round(saveTimer/1000);

    let didSomething = false; //for performance

    while (gameTicksLeft > (1000 / 10)) {
        if(stop) {
            addOffline(gameTicksLeft * .8);
            gameTicksLeft = 0;
            view.updating.update();
            break;
        }

        didSomething = true;
        if(gameTicksLeft > 2000) {
            window.fps /= 2;
            console.warn('too fast! (${gameTicksLeft})');
            gameTicksLeft = 0;
            stop = true;
        }
        gameTicksLeft -= (1000 / 10) / gameSpeed / bonusSpeed;

        mana--;

        castle.tick(); //resources
        shrine.tick(); //progress on buffs
        actions.tick(); //actions
        warMap.tick(); //combat
        unlockLists.tick();
        levelData.totalMana++;

        if(mana === 1) {
            reachedOneMana = true;
        }

        if(document.getElementById("pauseBeforeRestart").checked && mana === 0) {
            pauseReason = "Restart Next";
            pauseGame();
        }
        if(bonusSpeed > 1) {
            addOffline(-1 * gameTicksLeft * ((bonusSpeed - 1)/bonusSpeed));
        }
        if(!stop && mana === 0) {
            if(reachedOneMana) {
                restartReason = "0 Mana";
            }
            restart();
            reachedOneMana = false;
        }
    }
    if(didSomething) {
        view.updating.update();
    }
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
            click.event.toggleOffline();
        }
        totalOfflineMs += num;
        if(totalOfflineMs < 0) {
            totalOfflineMs = 0;
        }
        document.getElementById("bonusSeconds").innerHTML = intToString(totalOfflineMs / 1000, 2);
    }
}

function togglePause() {
    if(stop) {
        unpauseGame();
    } else {
        pauseReason = "Manual";
        pauseGame();
    }
}

function pauseGame() {
    stop = true;
    document.title = "*PAUSED* King's Perfect War";
    document.getElementById('pausePlay').innerHTML = 'Play';
}

function unpauseGame() {
    pauseReason = "";
    if(mana === 0) {
        restartReason = "0 mana";
        restart();
    }
    stop = false;
    document.title = "King's Perfect War";
    document.getElementById('pausePlay').innerHTML = 'Pause';
}

function restart() {
    king.curData.rflxCur = king.savedData.rflxInitial;
    if(levelData.victory) {
        soulC += gold / 10000;
    }
    if(levelSave[curLevel] && levelData.data) {
        king.saveHighestPerson();
        shrine.helpers.saveHighestBlessings();
    }
    for (let property in created) {
        if (created.hasOwnProperty(property)) {
            created[property] = 0;
        }
    }

    createLevel(curLevel);
    view.clickable.initial.createWarMap();
    if(levelSave[curLevel]) {
        createActionListsFromSimplifiedList(levelSave[curLevel].nextLists);
    }

    actions.restart();
    king.curData.aura = "";
    mana = levelData.initial.mana;
    maxMana = mana;
    gold = levelData.initial.gold;
    wood = levelData.initial.wood;
    consoleLog = [];

    unlockLists.checkUnlocks();

    prevState = {};
    save();
}
