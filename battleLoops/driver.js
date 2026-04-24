//Contains the timing functions for UI and the game

let driver = {
    startGame: function() {
        // load calls recalcInterval, which will start the callbacks
        saving.load();
        driver.setScreenSize();
        setTimeout(driver.initTimingSystem, 200);
    },
    setScreenSize: function() {
        screenSize = document.body.scrollHeight;
    },
    checkOfflineProgress: function() {
        if (data.lastVisit) {
            const offlineMilliseconds = Date.now() - parseInt(data.lastVisit, 10);
            if (offlineMilliseconds > 5000) {
                data.currentGameState.bonusTime += offlineMilliseconds;
                console.log(`Welcome back! Gained ${(offlineMilliseconds / 1000).toFixed(1)}s of bonus time.`);
            }
        }
    },
    loop: function() {
        if (timerId !== null) clearTimeout(timerId);

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

        const maxTicksPerLoop = 40;
        let ticksProcessed = Math.min(ticksAvailable, maxTicksPerLoop);

        if (ticksAvailable > maxTicksPerLoop) {
            const extraTicks = ticksAvailable - maxTicksPerLoop;
            data.currentGameState.bonusTime += extraTicks * tickInterval;
        }

        if (ticksProcessed > 0) {
            lastTickTime += ticksProcessed * tickInterval;

            const effectiveSpeed = data.gameSettings.gameSpeed * data.gameSettings.bonusSpeed;
            const exactTicks = (ticksProcessed * effectiveSpeed) + (tickResidue || 0);
            const totalTicksToRun = Math.floor(exactTicks);
            tickResidue = exactTicks - totalTicksToRun;

            if (!data.gameSettings.stop) {
                for (let i = 0; i < totalTicksToRun; i++) {
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
            } else {
                if (!(data.battle && data.battle.state === "dead")) {
                    data.currentGameState.bonusTime += tickInterval * ticksProcessed;
                }
            }
        }
        const remainingForRender = now - lastTickTime;
        data.gameSettings.renderAlpha = Math.max(0, Math.min(1, remainingForRender / tickInterval));
        timerId = setTimeout(driver.runMessage, 20);
    },
    runMessage: function () {
        postMessage({ type: 'update' });
    },
    animationTick: function(currentTime) {
        if (data.gameSettings.stopAll) {
            lastAnimationTime = currentTime;
            return;
        }

        if (lastAnimationTime === 0) lastAnimationTime = currentTime;

        const delta = currentTime - lastAnimationTime;
        lastAnimationTime = currentTime;

        timeAccumulators.view10 += delta;
        timeAccumulators.view1 += delta;
        view.updateViewAtFrame();

        const interval10 = 100;
        if (timeAccumulators.view10 >= interval10) {
            timeAccumulators.view10 %= interval10;
            view.updateView();
        }

        if (timeAccumulators.view1 >= 1000) {
            timeAccumulators.view1 %= 1000;
            timeSinceLastSave++
            if(timeSinceLastSave >= 20) {
                timeSinceLastSave = 0;
                saving.save();
            }
            view.updateViewOnSecond();
        }

        requestAnimationFrame(driver.animationTick);
    },
    initTimingSystem: function() {
        driver.checkOfflineProgress();

        postMessage({
            command: 'start'
        });

        // Start the main thread's rendering loop.
        requestAnimationFrame(driver.animationTick);
    },
    secondPassed: function() {
        data.currentGameState.secondsPassed++;

    },
    realSecondPassed: function() {

    },
    skipTime: function(time) {

        if (isSkipping) return;

        let ticksToUse = time * 60 * 1000;
        if(data.currentGameState.instantTime < ticksToUse) {
            return;
        }

        isSkipping = true;
        events.toggleSkipButtons(true);

        data.currentGameState.instantTime -= ticksToUse;

        setTimeout(() => {
            let origPause = data.gameSettings.stop;
            data.gameSettings.stop = false;
            data.gameSettings.ticksPerSecond = 1;

            for (let i = 0; i < time * 60; i++) {
                engine.gameTick();
                driver.secondPassed();
            }

            data.gameSettings.ticksPerSecond = 20;
            data.gameSettings.stop = origPause;
            save();

            setTimeout(() => {
                isSkipping = false;
                events.toggleSkipButtons(false);
            }, 250);
        }, 0);
    },
}

onmessage = function(e) {
    if (data.currentGameState.bonusTime <= 0 && data.gameSettings.bonusSpeed > 1) {
        data.gameSettings.bonusSpeed = 1;
    }
    driver.loop();
};