// =================================================================
// WEB WORKER (engine.js)
// =================================================================
// This script runs in the background and handles all game logic calculations.


function loop() {
    if (timerId !== null) {
        clearTimeout(timerId);
    }

    const now = performance.now();
    if (lastTickTime === 0) lastTickTime = now;

    const tickInterval = 1000 / data.gameSettings.ticksPerSecond;
    let elapsed = now - lastTickTime;
    let ticksToProcess = Math.floor(elapsed / tickInterval);
    let didSomething = false;

    if (ticksToProcess > 0) {
        lastTickTime += ticksToProcess * tickInterval;

        const effectiveSpeed = data.gameSettings.gameSpeed * data.gameSettings.bonusSpeed;
        const totalTicksToRun = ticksToProcess * effectiveSpeed;

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
                const processedElapsed = ticksToProcess * tickInterval;
                const bonusTimeConsumed = processedElapsed * data.gameSettings.gameSpeed * (data.gameSettings.bonusSpeed - 1);

                data.currentGameState.bonusTime -= bonusTimeConsumed;
            }
        } else {
            data.currentGameState.bonusTime += tickInterval * ticksToProcess;
        }

        postMessage({
            type: 'update',
        });
    }

    timerId = setTimeout(loop, 1000 / data.gameSettings.ticksPerSecond);
}


onmessage = function(e) {
    const { command } = e.data;

    switch (command) {
        case 'start':
            loop();
            break;
    }
};
