

function tick() {
    if(stop) {
        return;
    }
    timer++;

    prevState.stats = JSON.parse(JSON.stringify(stats));
    actions.tick();

    if(timer >= timeNeeded) {
        if(document.getElementById("pauseBeforeRestart").checked) {
            pauseGame();
        } else {
            restart();
        }
    }

    view.update();

    if(timer % 100 === 0) {
        // save();
    }
}

function recalcInterval(newSpeed) {
    doWork.postMessage({stop:true});
    doWork.postMessage({start:true,ms:(1000 / newSpeed)});
}

function pauseGame() {
    stop = !stop;
    document.getElementById("pausePlay").innerHTML = stop ? "Play" : "Pause";
    if(!stop && timer >= timeNeeded) {
        restart();
    }
}

function restart() {
    timer = 0;
    restartStats();
    actions.restart();
    towns.forEach((town) => {
        town.restart();
    });
    view.updateCurrentActionsDivs();
}

function addAction(action) {
    actions.addAction(action);
    view.updateNextActions();
}