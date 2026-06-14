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

        if (typeof engine.updateManaPerSecond === "function") {
            engine.updateManaPerSecond();
        }

        const chapel = data.progress.base && data.progress.base.chapel;
        if (!chapel || !chapel.autoRetryEnabled) {
            return;
        }
        if (data.battle && data.battle.state === "dead") {
            if (data.progress.autoRetryCountdownSec > 0) {
                data.progress.autoRetryCountdownSec--;
                if (data.progress.autoRetryCountdownSec <= 0) {
                    events.tryAgain();
                }
            }
        } else {
            data.progress.autoRetryCountdownSec = 0;
        }
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
            saving.save();

            setTimeout(() => {
                isSkipping = false;
                events.toggleSkipButtons(false);
            }, 250);
        }, 0);
    },
}