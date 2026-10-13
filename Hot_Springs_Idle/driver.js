//Contains the timing functions for UI and the game

let driver = {
    startGame: async function() {
        // load calls recalcInterval, which will start the callbacks
        await saving.load();
        driver.setScreenSize();
        setTimeout(driver.initTimingSystem, 200);
    },
    setScreenSize: function() {
        screenSize = document.body.scrollHeight;
    },
    checkOfflineProgress: function() {
        if (!data.currentGameState) {
            return;
        }
        if (data.gameSettings && data.gameSettings.prestigePackOpen) {
            data.currentGameState.pendingOfflineMs = 0;
            data.lastVisit = Date.now();
            return;
        }
        if (typeof offline !== "undefined" && offline.ensureState) {
            offline.ensureState();
        } else if (data.currentGameState.pendingOfflineMs === undefined) {
            data.currentGameState.pendingOfflineMs = 0;
        }
        if (data.lastVisit) {
            const offlineMilliseconds = Date.now() - parseInt(data.lastVisit, 10);
            if (offlineMilliseconds >= OFFLINE_MIN_PROCESS_MS) {
                if (typeof offline !== "undefined" && offline.isPauseBonusMode && offline.isPauseBonusMode()) {
                    data.currentGameState.pendingOfflineMs = 0;
                    const gained = offline.convertOfflineMsToBonus(offlineMilliseconds);
                    if (gained > 0) {
                        offline.pendingBonusGainMsgMs = gained;
                        console.log(`Welcome back! Banked ${offline.formatDuration(gained)} bonus time.`);
                    }
                } else {
                    offline.addPendingOfflineMs(offlineMilliseconds);
                    console.log(`Welcome back! ${((data.currentGameState.pendingOfflineMs || 0) / 1000).toFixed(1)}s pending offline to process.`);
                }
            }
        }
    },
    runMessage: function () {
        postMessage({ type: 'update' });
    },
    animationTick: function(currentTime) {
        if (isProcessingOffline || data.gameSettings.stopAll) {
            lastAnimationTime = currentTime;
            if (!isProcessingOffline) {
                return;
            }
            // Keep RAF alive so the page stays responsive; skip view work while processing.
            requestAnimationFrame(driver.animationTick);
            return;
        }

        if (lastAnimationTime === 0) lastAnimationTime = currentTime;

        const delta = currentTime - lastAnimationTime;
        lastAnimationTime = currentTime;

        const prestigePaused = !!(data.gameSettings && data.gameSettings.prestigePackOpen);
        if (!prestigePaused) {
            timeAccumulators.view10 += delta;
            view.updateViewAtFrame();
        }
        timeAccumulators.view1 += delta;

        const interval10 = 100;
        if (!prestigePaused && timeAccumulators.view10 >= interval10) {
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
            if (!prestigePaused) {
                view.updateViewOnSecond();
            }
        }

        requestAnimationFrame(driver.animationTick);
    },
    initTimingSystem: async function() {
        driver.checkOfflineProgress();

        if (typeof offline !== "undefined" && offline.isPauseBonusMode && offline.isPauseBonusMode()) {
            data.currentGameState.pendingOfflineMs = 0;
            if (offline.pendingBonusGainMsgMs > 0) {
                offline.showBonusGainMessage(offline.pendingBonusGainMsgMs);
                offline.pendingBonusGainMsgMs = 0;
            }
            if (typeof view !== "undefined" && view.updateDebugSpeedButtons) {
                view.updateDebugSpeedButtons();
            }
        } else if ((data.currentGameState.pendingOfflineMs || 0) >= OFFLINE_MIN_PROCESS_MS) {
            await offline.process();
        } else if (data.currentGameState.pendingOfflineMs) {
            data.currentGameState.pendingOfflineMs = 0;
        }

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
        if (typeof engine.updateShrineKarmaPerSecond === "function") {
            engine.updateShrineKarmaPerSecond();
        }
        if (typeof engine.updateShrineMilestones === "function") {
            engine.updateShrineMilestones();
        }
        if (typeof engine.updateDivinityPerSecond === "function") {
            engine.updateDivinityPerSecond();
        }

        if (isProcessingOffline) {
            return;
        }

        const bf = data.progress.base && data.progress.base.bonfire;
        if (!bf || (!bonfire.isAutoRetryEnabled() && !bonfire.isStartWithFullManaEnabled())) {
            return;
        }
        if (data.battle && (data.battle.state === "dead" || data.battle.state === "completed")) {
            if (data.progress.autoRetryCountdownSec > 0) {
                data.progress.autoRetryCountdownSec--;
                if (data.progress.autoRetryCountdownSec <= 0) {
                    bonfire.tryPostBattleCloneSpawn();
                }
            }
        } else {
            data.progress.autoRetryCountdownSec = 0;
        }
    },
    realSecondPassed: function() {
        if (typeof toasts !== "undefined" && toasts.check) {
            toasts.check();
        }
    },
    skipTime: function(time) {

        if (isSkipping || isProcessingOffline) return;

        let ticksToUse = time * 60 * 1000;
        if(data.currentGameState.instantTime < ticksToUse) {
            return;
        }

        isSkipping = true;
        events.toggleSkipButtons(true);

        data.currentGameState.instantTime -= ticksToUse;

        setTimeout(() => {
            data.gameSettings.ticksPerSecond = 1;

            for (let i = 0; i < time * 60; i++) {
                engine.gameTick({ ignoreBattlePause: true });
                driver.secondPassed();
            }

            data.gameSettings.ticksPerSecond = 20;
            saving.save();

            setTimeout(() => {
                isSkipping = false;
                events.toggleSkipButtons(false);
            }, 250);
        }, 0);
    },
}
