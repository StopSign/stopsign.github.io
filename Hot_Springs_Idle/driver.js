//Contains the timing functions for UI and the game

let driver = {
    _rafScheduled: false,

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
    /** Apply cold-start offline rules to a large in-memory gap (e.g. OS sleep). */
    handleLiveOfflineGap: function(gapMs) {
        if (!gapMs || gapMs < LIVE_OFFLINE_GAP_MS) {
            return;
        }
        if (!data.currentGameState) {
            return;
        }
        if (typeof isProcessingOffline !== "undefined" && isProcessingOffline) {
            return;
        }
        if (typeof offline === "undefined") {
            return;
        }
        offline.ensureState();
        if (offline.isPauseBonusMode()) {
            data.currentGameState.pendingOfflineMs = 0;
            const gained = offline.convertOfflineMsToBonus(gapMs);
            if (gained > 0) {
                offline.showBonusGainMessage(gained);
                console.log(`Live gap: banked ${offline.formatDuration(gained)} bonus time.`);
            }
            if (typeof view !== "undefined" && view.updateDebugSpeedButtons) {
                view.updateDebugSpeedButtons();
            }
            return;
        }
        offline.addPendingOfflineMs(gapMs);
        console.log(`Live gap: ${((data.currentGameState.pendingOfflineMs || 0) / 1000).toFixed(1)}s pending offline to process.`);
        offline.process().then(function() {
            if (typeof view !== "undefined" && view.updateDebugSpeedButtons) {
                view.updateDebugSpeedButtons();
            }
        });
    },
    runMessage: function () {
        postMessage({ type: 'update' });
    },
    scheduleAnimationTick: function() {
        if (driver._rafScheduled) {
            return;
        }
        driver._rafScheduled = true;
        requestAnimationFrame(driver.animationTick);
    },
    animationTick: function(currentTime) {
        driver._rafScheduled = false;

        if (isProcessingOffline || data.gameSettings.stopAll) {
            lastAnimationTime = currentTime;
            if (!isProcessingOffline) {
                return;
            }
            // Keep RAF alive so the page stays responsive; skip view work while processing.
            driver.scheduleAnimationTick();
            return;
        }

        if (document.hidden) {
            return;
        }

        if (lastAnimationTime === 0) lastAnimationTime = currentTime;

        const delta = currentTime - lastAnimationTime;
        lastAnimationTime = currentTime;

        timeAccumulators.view10 += delta;
        view.updateViewAtFrame();
        timeAccumulators.view1 += delta;

        const interval10 = 100;
        if (timeAccumulators.view10 >= interval10) {
            timeAccumulators.view10 %= interval10;
            view.updateView();
        }

        if (timeAccumulators.view1 >= 1000) {
            timeAccumulators.view1 %= 1000;
            view.updateViewOnSecond();
        }

        driver.scheduleAnimationTick();
    },
    registerLifecycleHooks: function() {
        document.addEventListener("visibilitychange", function() {
            if (document.hidden) {
                if (typeof saving !== "undefined" && saving.save) {
                    saving.save();
                }
                return;
            }
            lastAnimationTime = 0;
            if (!(data.gameSettings && data.gameSettings.stopAll)) {
                driver.scheduleAnimationTick();
            }
        });
        const saveBestEffort = function() {
            if (typeof saving !== "undefined" && saving.save) {
                saving.save();
            }
        };
        window.addEventListener("pagehide", saveBestEffort);
        window.addEventListener("beforeunload", saveBestEffort);
    },
    initTimingSystem: async function() {
        driver.registerLifecycleHooks();
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

        // Start the main thread's rendering loop (paused while hidden).
        if (!document.hidden) {
            driver.scheduleAnimationTick();
        }
    },
    secondPassed: function() {
        data.currentGameState.secondsPassed++;
        if (data.progress) {
            if (typeof data.progress.secondsThisResort !== "number") {
                data.progress.secondsThisResort = data.currentGameState.secondsPassed;
            } else {
                data.progress.secondsThisResort++;
            }
            const hadPlayTotal = typeof data.progress.secondsPlayedTotal === "number";
            if (typeof engine !== "undefined" && engine.ensureSecondsPlayedTotal) {
                engine.ensureSecondsPlayedTotal();
            }
            if (hadPlayTotal) {
                data.progress.secondsPlayedTotal++;
            }
        }
        if (typeof engine.tryAutobuyUpgrades === "function") {
            engine.tryAutobuyUpgrades();
        }

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
