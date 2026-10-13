
function loop() {
    if (timerId !== null) clearTimeout(timerId);

    if (typeof isProcessingOffline !== "undefined" && isProcessingOffline) {
        timerId = setTimeout(runMessage, 50);
        return;
    }

    const now = performance.now();
    if (now - lastRealSecondTime >= 1000) {
        driver.realSecondPassed();
        lastRealSecondTime += 1000;
    }

    if (lastTickTime === 0) lastTickTime = now;

    const tickInterval = 1000 / data.gameSettings.ticksPerSecond;

    const maxElapsed = 2000; // ms (2 seconds max catch-up)
    let elapsed = now - lastTickTime;
    if (elapsed > maxElapsed) {
        lastTickTime = now - maxElapsed;
        elapsed = maxElapsed;
    }

    let ticksAvailable = Math.floor(elapsed / tickInterval);
    let didSomething = false;

    const maxTicksPerLoop = 40;
    let ticksProcessed = Math.min(ticksAvailable, maxTicksPerLoop);

    if (ticksAvailable > maxTicksPerLoop) {
        const extraTicks = ticksAvailable - maxTicksPerLoop;
        data.currentGameState.bonusTime += extraTicks * tickInterval;
        const bonusCap = (typeof BONUS_TIME_CAP_MS !== "undefined") ? BONUS_TIME_CAP_MS : (6 * 60 * 60 * 1000);
        if (data.currentGameState.bonusTime > bonusCap) {
            data.currentGameState.bonusTime = bonusCap;
        }
    }

    if (ticksProcessed > 0) {
        lastTickTime += ticksProcessed * tickInterval;

        const effectiveSpeed = data.gameSettings.gameSpeed * data.gameSettings.bonusSpeed;
        const upgradeMultiplier = 1;
        const exactTicks = (ticksProcessed * effectiveSpeed * upgradeMultiplier) + (tickResidue || 0);
        const totalTicksToRun = Math.floor(exactTicks);
        tickResidue = exactTicks - totalTicksToRun;

        for (let i = 0; i < totalTicksToRun; i++) {
            didSomething = true;
            engine.gameTick();
            if (data.gameSettings.ticksForSeconds >= data.gameSettings.ticksPerSecond) {
                data.gameSettings.ticksForSeconds = 0;
                driver.secondPassed();
            }
        }
        if (data.gameSettings.bonusSpeed > 1) {
            const processedElapsed = ticksProcessed * tickInterval;
            const bonusTimeConsumed = processedElapsed * data.gameSettings.gameSpeed * (data.gameSettings.bonusSpeed - 1);
            data.currentGameState.bonusTime -= bonusTimeConsumed;
            if (data.currentGameState.bonusTime <= 0) {
                data.currentGameState.bonusTime = 0;
                data.gameSettings.bonusSpeed = 1;
            }
        }
    }
    const remainingForRender = now - lastTickTime;
    data.gameSettings.renderAlpha = Math.max(0, Math.min(1, remainingForRender / tickInterval));
    timerId = setTimeout(runMessage, 20);
}

function runMessage() {
    postMessage({ type: 'update' });
    // requestAnimationFrame(animationTick);
}



onmessage = function(e) {
    const { type } = e.data;

    // if (data.currentGameState.bonusTime <= 0 && data.gameSettings.bonusSpeed > 1) {
    //     data.gameSettings.bonusSpeed = 1;
    // }
    loop();
};