

function tick() {
    if(stop) {
        return;
    }
    timer++;

    prevState.stats = JSON.parse(JSON.stringify(stats));
    actions.tick();

    if(shouldRestart || timer >= timeNeeded) {
        prepareRestart();
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
    if(!stop && (shouldRestart || timer >= timeNeeded)) {
        restart();
    }
}

function prepareRestart() {
    if(document.getElementById("pauseBeforeRestart").checked) {
        pauseGame();
    } else {
        restart();
    }
}

function restart() {
    shouldRestart = false;
    timer = 0;
    timeNeeded = timeNeededInitial;
    addGold(-gold);
    restartStats();
    actions.restart();
    towns.forEach((town) => {
        town.restart();
    });
    statList.forEach((stat) => {
        view.updateStat(stat);
    });

    view.updateCurrentActionsDivs();
    view.update();
}

function addAction(action) {
    actions.addAction(action);
    view.updateNextActions();
}

function addMana(amount) {
    timeNeeded += amount;
}

function addGold(amount) {
    gold += amount;
    view.updateGold();
}

function changeActionAmount(amount) {
    actions.addAmount = amount;
    view.updateAddAmount();
}