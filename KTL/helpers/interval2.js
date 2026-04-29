let lastRealSecondTime = performance.now();
let tickResidue = 0; // Stores fractional ticks
function loop() {
    if (timerId !== null) clearTimeout(timerId);

    const now = performance.now();
    while (now - lastRealSecondTime >= 1000) {
        realSecondPassed();
        lastRealSecondTime += 1000;
    }

    if (lastTickTime === 0) lastTickTime = now;

    const tickInterval = 1000 / data.gameSettings.ticksPerSecond;

    let elapsed = now - lastTickTime;

    let ticksAvailable = Math.floor(elapsed / tickInterval);
    let didSomething = false;

    const maxTicksPerLoop = 40;
    let ticksProcessed = Math.min(ticksAvailable, maxTicksPerLoop);

    if (ticksAvailable > maxTicksPerLoop) {
        const extraTicks = ticksAvailable - maxTicksPerLoop;
        data.currentGameState.bonusTime += extraTicks * tickInterval;
    }

    if (ticksProcessed > 0) {
        lastTickTime += ticksProcessed * tickInterval;

        const effectiveSpeed = data.gameSettings.gameSpeed * data.gameSettings.bonusSpeed;
        const upgradeMultiplier = 1 + (data.shopUpgrades.extraGameSpeed.upgradePower * 0.1);
        const exactTicks = (ticksProcessed * effectiveSpeed * upgradeMultiplier) + (tickResidue || 0);
        const requestedTicksToRun = Math.floor(exactTicks);
        tickResidue = exactTicks - requestedTicksToRun;
        // Browser background/efficiency throttling can stretch loop intervals to ~1s+.
        // In that case, keep a much higher cap so simulation can catch up instead of
        // appearing to run in slow motion while minimized.
        const isThrottledLoop = elapsed >= 500;
        const maxSimTicksPerLoop = isThrottledLoop ? 2000 : (data.gameSettings.bonusSpeed >= 10 ? 40 : 120);
        const totalTicksToRun = Math.min(requestedTicksToRun, maxSimTicksPerLoop);
        const processedRatio = requestedTicksToRun > 0 ? (totalTicksToRun / requestedTicksToRun) : 1;

        if (!data.gameSettings.stop) {
            for (let i = 0; i < totalTicksToRun; i++) {
                didSomething = true;
                gameTick();
                if (data.gameSettings.ticksForSeconds >= data.gameSettings.ticksPerSecond) {
                    data.gameSettings.ticksForSeconds = 0;
                    secondPassed();
                }
            }
            if (data.gameSettings.bonusSpeed > 1) {
                const processedElapsed = ticksProcessed * tickInterval;
                const bonusTimeConsumed = processedElapsed * data.gameSettings.gameSpeed * (data.gameSettings.bonusSpeed - 1) * processedRatio;
                data.currentGameState.bonusTime -= bonusTimeConsumed;
                if (data.currentGameState.bonusTime <= 0) {
                    data.currentGameState.bonusTime = 0;
                    data.gameSettings.bonusSpeed = 1;
                }
            }
        } else {
            data.currentGameState.bonusTime += tickInterval * ticksProcessed;
        }
        // postMessage({ type: 'update' });
    }
    timerId = setTimeout(runMessage, 20);
}

function runMessage() {
    postMessage({ type: 'update' });
    // requestAnimationFrame(animationTick);
}



onmessage = function(e) {
    const { type } = e.data;

    if (data.currentGameState.bonusTime <= 0 && data.gameSettings.bonusSpeed > 1) {
        data.gameSettings.bonusSpeed = 1;
    }
    loop();
};