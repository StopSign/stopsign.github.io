// =================================================================
// WEB WORKER (engine.js)
// =================================================================
// This script runs in the background and handles all game logic calculations.
function loop() {
    if (timerId !== null) clearTimeout(timerId);

    const now = performance.now();
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
    }

    if (ticksProcessed > 0) {
        lastTickTime += ticksProcessed * tickInterval;

        const effectiveSpeed = data.gameSettings.gameSpeed * data.gameSettings.bonusSpeed;
        const totalTicksToRun = ticksProcessed * effectiveSpeed;

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
                const bonusTimeConsumed = processedElapsed * data.gameSettings.gameSpeed * (data.gameSettings.bonusSpeed - 1);
                data.currentGameState.bonusTime -= bonusTimeConsumed;
            }
        } else {
            data.currentGameState.bonusTime += tickInterval * ticksProcessed;
        }

        postMessage({ type: 'update' });
    }

    timerId = setTimeout(loop, 1000 / data.gameSettings.ticksPerSecond);
}




// Listen for updates from the worker
onmessage = function(e) {
    const { type } = e.data;

    if (data.currentGameState.bonusTime <= 0 && data.gameSettings.bonusSpeed > 1) {
        data.gameSettings.bonusSpeed = 1;
    }
    loop();
};