
function loop() {
    if (timerId !== null) clearTimeout(timerId);

    if (typeof isProcessingOffline !== "undefined" && isProcessingOffline) {
        timerId = setTimeout(runMessage, 50);
        return;
    }

    const now = performance.now();
    if (lastTickTime === 0) lastTickTime = now;

    const tickInterval = 1000 / data.gameSettings.ticksPerSecond;
    let elapsed = now - lastTickTime;

    // Huge in-memory gap (e.g. OS sleep): use offline rules, do not live-sim or wall-advance.
    const liveGapMs = (typeof LIVE_OFFLINE_GAP_MS !== "undefined") ? LIVE_OFFLINE_GAP_MS : (3 * 60 * 1000);
    if (elapsed >= liveGapMs) {
        lastTickTime = now;
        lastRealSecondTime = now;
        driver.handleLiveOfflineGap(elapsed);
        timerId = setTimeout(runMessage, 20);
        return;
    }

    // Wall-clock seconds: toast once per wake; advance autosave by whole seconds elapsed.
    if (now - lastRealSecondTime >= 1000) {
        const wholeSeconds = Math.floor((now - lastRealSecondTime) / 1000);
        lastRealSecondTime += wholeSeconds * 1000;
        driver.realSecondPassed();
        timeSinceLastSave += wholeSeconds;
        while (timeSinceLastSave >= 20) {
            timeSinceLastSave -= 20;
            saving.save();
        }
    }

    let ticksAvailable = Math.floor(elapsed / tickInterval);

    if (ticksAvailable > 0) {
        lastTickTime += ticksAvailable * tickInterval;

        const effectiveSpeed = data.gameSettings.gameSpeed * data.gameSettings.bonusSpeed;
        const upgradeMultiplier = 1;
        const exactTicks = (ticksAvailable * effectiveSpeed * upgradeMultiplier) + (tickResidue || 0);
        const totalTicksToRun = Math.floor(exactTicks);
        tickResidue = exactTicks - totalTicksToRun;

        for (let i = 0; i < totalTicksToRun; i++) {
            engine.gameTick();
            if (data.gameSettings.ticksForSeconds >= data.gameSettings.ticksPerSecond) {
                data.gameSettings.ticksForSeconds = 0;
                driver.secondPassed();
            }
        }
        if (data.gameSettings.bonusSpeed > 1) {
            const processedElapsed = ticksAvailable * tickInterval;
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
