'use strict';
function startGame() {
    // load calls recalcInterval, which will start the callbacks
    load();
    setScreenSize();
    setTimeout(initTimingSystem, 200);
}

let screenSize;
function setScreenSize() {
    screenSize = document.body.scrollHeight;
}

function checkOfflineProgress() {
    if (data.lastVisit) {
        const offlineMilliseconds = Date.now() - parseInt(data.lastVisit, 10);
        if (offlineMilliseconds > 5000) {
            data.currentGameState.bonusTime += offlineMilliseconds * (1 + data.shopUpgrades.extraBonusTime.upgradePower * .25);
            console.log(`Welcome back! Gained ${(offlineMilliseconds / 1000).toFixed(1)}s of bonus time.`);
            data.currentGameState.instantTimerCooldown -= offlineMilliseconds / 1000;
            data.currentGameState.dailyTimer -= offlineMilliseconds;
        }
    }
}

// --- Visual Rendering Loop ---
let lastAnimationTime = 0;
let timeAccumulators = { view30: 0, view10: 0, view1: 0 };
let debugDelta = Date.now();
let timeSinceLastSave = 0;

function animationTick(currentTime) {
    if (data.gameSettings.stopAll) {
        lastAnimationTime = currentTime;
        return;
    }

    if (lastAnimationTime === 0) lastAnimationTime = currentTime;

    const delta = currentTime - lastAnimationTime;
    lastAnimationTime = currentTime;

    timeAccumulators.view30 += delta;
    timeAccumulators.view10 += delta;
    timeAccumulators.view1 += delta;

    const interval30 = 1000 / 20;
    if (timeAccumulators.view30 >= interval30) {
        timeAccumulators.view30 %= interval30;
        views.updateViewAtFrame();
    }

    const interval10 = 100;
    if (timeAccumulators.view10 >= interval10) {
        timeAccumulators.view10 %= interval10;
        views.updateView();
    }

    if (timeAccumulators.view1 >= 1000) {
        timeAccumulators.view1 %= 1000;
        timeSinceLastSave++
        if(timeSinceLastSave >= 20) {
            timeSinceLastSave = 0;
            save();
        }
        views.updateViewOnSecond();
    }

    requestAnimationFrame(animationTick);
}

function initTimingSystem() {
    checkOfflineProgress();

    postMessage({
        command: 'start'
    });

    // Start the main thread's rendering loop.
    requestAnimationFrame(animationTick);
}

function secondPassed() {
    secondTick();

    data.currentGameState.secondsPassed++;
    data.currentGameState.secondsThisLS++;
    if (data.currentGameState.secondsThisGR !== undefined) data.currentGameState.secondsThisGR++;
}

function realSecondPassed() {
    tickTimerCooldown()
}

function tickTimerCooldown() {
    data.currentGameState.dailyTimer -= 1000;
    data.currentGameState.bonusTime += 1000 * data.shopUpgrades.extraBonusTime.upgradePower * .25;

    checkDailyTimer()

    if (data.currentGameState.instantTimerCooldown > 0) {
        data.currentGameState.instantTimerCooldown --;
    }
    if(data.currentGameState.instantTimerCooldown < 0) {
        data.currentGameState.instantTimerCooldown = 0;
    }
    updateConvertButtonUI();
}

function updateConvertButtonUI() {
    if (data.currentGameState.instantTimerCooldown > 0) {
        views.updateVal(`convertBtn`, "grey", "style.backgroundColor");
        views.updateVal(`convertBtn`, "Use in " + secondsToTime(data.currentGameState.instantTimerCooldown), "innerText");
    } else {
        views.updateVal(`convertBtn`, "green", "style.backgroundColor");
        views.updateVal(`convertBtn`, `Convert ${2 + data.shopUpgrades.extraInstantTimeConversion.upgradePower} hours`, "innerText");
    }
}

function gameTick() {
    data.gameSettings.ticksForSeconds++;

    for (let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        actionObj.resourceDelta = 0;
        actionObj.resourceIncrease = 0;
        actionObj.resourceDecrease = 0;
        actionObj.progressGain = 0;
    }

    for(let actionVar in data.actions) {
        tickActionTimer(actionVar);
    }

    for (let actionVar in data.actions) {
        tickGameObject(actionVar);
    }

    //process resource retrieval
    for(let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        let resourceParentVar = actionData[actionObj.actionVar].parentVar;
        if(!resourceParentVar) {
            continue;
        }
        let parentObj = data.actions[resourceParentVar];

        giveResourceTo(actionObj, parentObj, actionObj.resourceRetrieved);
        //Because generators don't get resourceIncrease from giveResourceTo
        if(!parentObj.hasUpstream) {
            parentObj.resourceIncrease += actionObj.resourceRetrieved * data.gameSettings.ticksPerSecond;
        }
    }


    //check once more for any that need to be leveled from other's stat improvements
    for(let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        let dataObj = actionData[actionVar];
        for(let i = 0; i < 1 / (data.gameSettings.ticksPerSecond / 20); i++) {
            if (!checkLevelUp(actionObj, dataObj)) {
                break;
            }
        }
        //visual in case of level
        actionObj.expToAddMult = calcUpgradeMultToExp(actionObj.actionVar);
        actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult
            * (dataObj.isGenerator&&!dataObj.ignoreExpUpgrade?Math.pow(1.05, data.upgrades.extraGeneratorExp.upgradePower):1);
    }


    for (let actionVar in data.actions) {
        const actionObj = data.actions[actionVar];
        const dataObj = actionData[actionVar];

        for(let downstreamVar of dataObj.downstreamVars) {
            if (isAttentionLine(actionVar, downstreamVar)) {
                const key = `${downstreamVar}TempFocusMult`;
                let power = data.upgrades.learnToFocusMore.upgradePower;
                if(power === 0) {
                    continue;
                }
                actionObj[key] += power / data.gameSettings.ticksPerSecond / 600;
                if(actionObj[key] > power + 2 + data.shopUpgrades.moreFocusMultiplier.upgradePower) {
                    actionObj[key] = power + 2 + data.shopUpgrades.moreFocusMultiplier.upgradePower;
                }
            }
        }
    }

    upgradeUpdates()
    calcDeltas();
    reduceShopTimers(1000 / data.gameSettings.ticksPerSecond)
}

function calcDeltas() {
    // Aggregate all visual increases from persistent generator rates.
    for (let actionVar in data.actions) {
        let generatorObj = data.actions[actionVar];
        let generatorDataObj = actionData[actionVar];
        if (generatorDataObj.isGenerator && generatorObj.resourceToAdd > 0) {
            let targetVar = generatorDataObj.generatorTarget || actionVar;
            let targetObj = data.actions[targetVar];
            if (targetObj) {
                targetObj.resourceIncrease += generatorObj.resourceToAdd * generatorObj.progressGain / generatorObj.progressMax;
            }
        }
    }

    // Calculate all resource decreases and the final delta.
    for (let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        let dataObj = actionData[actionVar];

        let totalDecrease = actionObj.totalSend || 0;

        if (!dataObj.isGenerator) {
            totalDecrease += actionObj.progressGain;
        } else {
            if (["makeMoney", "socialize"].includes(actionVar)) {
                totalDecrease += (actionObj.resource * calcTierMult(dataObj.tier)) * actionObj.progressGain / actionObj.progressMax;
            }
        }
        if(dataObj.ignoreConsume) {
            totalDecrease = 0;
        }
        if(actionVar === "tidalBurden") {
            actionObj.resourceDecrease = totalDecrease
        } else {
            let consumptionReduction = Math.max(0, 1 - (data.shopUpgrades.focusBarsImproveEfficiency.upgradePower * .25 * actionObj.connectedLines));
            actionObj.resourceDecrease = totalDecrease * (1-data.upgrades.reduceResourcesConsumed.upgradePower*.05) * consumptionReduction;
        }

        // Calculate the final net change per second for display.
        actionObj.resourceDelta = actionObj.resourceIncrease - actionObj.resourceDecrease;
    }
}

function secondTick() {
    if(data.gameState !== "KTL") {
        data.secondsPerReset++;
    } else {
        data.NWSeconds++;
    }
    takeDataSnapshot(data.actions.overclock.resourceToAdd, data.secondsPerReset);
}

//spells get to reset before actions are ready to use them
function tickActionTimer(actionVar) {
    let actionObj = data.actions[actionVar];
    if(!actionObj.cooldown) {
        return;
    }

    actionObj.cooldownTimer += 1 / data.gameSettings.ticksPerSecond;
    if(actionObj.cooldownTimer > actionObj.cooldown) {
        actionObj.cooldownTimer = actionObj.cooldown;
    }
}


function upgradeUpdates() {
    //every tick, make sure the mults are updated for visuals
    for(let actionVar in actionData) {
        let actionObj = actionData[actionVar];
        if(actionObj.updateMults) {
            actionObj.updateMults();
        }
    }

    //passive gain
    if(data.upgrades.startALittleQuicker.upgradePower > 0) {
        data.actions.overclock.resource += 50 * Math.pow(4, data.upgrades.startALittleQuicker.upgradePower-1) / data.gameSettings.ticksPerSecond
    }
    if(data.upgrades.pickUpValuablePlants.upgradePower > 0) {
        addResourceTo(data.actions.spendMoney, 5 * Math.pow(4, data.upgrades.pickUpValuablePlants.upgradePower-1) / data.gameSettings.ticksPerSecond)
    }
    if(data.upgrades.startCasualChats.upgradePower > 0) {
        addResourceTo(data.actions.meetPeople, Math.pow(2, data.upgrades.startCasualChats.upgradePower-1) / data.gameSettings.ticksPerSecond)
    }

    // if(data.upgrades.keepMyMagicReady.upgradePower) {
        // saveMaxChargedSpellPowers();
        // data.maxSpellPower = getTotalMaxChargedSpellPower();
    // } else {
        // data.maxSpellPower = getActiveSpellPower(true);
    // }
}


let isSkipping = false;

//skip [time] minutes
function skipTime(time) {
    if (isSkipping) return;

    let ticksToUse = time * 60 * 1000;
    if(data.currentGameState.instantTime < ticksToUse) {
        return;
    }

    isSkipping = true;
    toggleSkipButtons(true);

    data.currentGameState.instantTime -= ticksToUse;

    setTimeout(() => {
        let origPause = data.gameSettings.stop;
        data.gameSettings.stop = false;
        data.gameSettings.ticksPerSecond = 1;

        for (let i = 0; i < time * 60 * (1 + data.shopUpgrades.extraGameSpeed.upgradePower*.1); i++) {
            gameTick();
            secondPassed();
        }

        data.gameSettings.ticksPerSecond = 20;
        data.gameSettings.stop = origPause;
        save();

        setTimeout(() => {
            isSkipping = false;
            toggleSkipButtons(false);
        }, 250);
    }, 0);
}