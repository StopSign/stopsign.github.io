function resetLoopVars() {
    res.civTime = 0;
    res.popTax = 1;
    res.popGrowth = res.initialGrowth;
    res.popNet = 0;
    res.pop = 10;
    res.popHarvested = 0;
    res.hunters = 0;
    res.farmers = 0;
    res.crafters = 0;
    res.highestPop = 0;
    res.vSoulDiff = 0;
    ticksForSeconds = 0;
}

function gameTick() {
    res.civTime += 1;
    res.popNet = res.popGrowth - res.popTax;
    //console.log(res.popNet);
    res.pop += res.popNet / ticksPerSecond;
    if(res.pop > res.highestPop) {
        res.highestPop = res.pop;
    }
    res.vSoulGain = (res.popTax) / 100;
    res.vSouls += res.vSoulGain / ticksPerSecond;
    res.vSoulDiff += res.vSoulGain / ticksPerSecond;

    if(res.pop <= 0) {
        console.log("Game ended at " + res.civTime/ticksPerSecond + " seconds. Highest pop was " + res.highestPop + ". vSouls is " + res.vSouls);
        view.finishLoop();
        resetLoopVars();
    }
}

function secondTick() {
    calcJobs();
    res.popTax *= 1.05;
    res.popGrowth = res.initialGrowth + res.hunters/2;
}

function calcJobs() {
    res.jobs = Math.floor(res.pop / 10);
    if(res.jobs > res.hunterMax) {
        res.hunters = res.hunterMax;
        res.jobs -= res.hunterMax;
    } else {
        res.hunters = res.jobs;
        res.jobs = 0;
    }
}