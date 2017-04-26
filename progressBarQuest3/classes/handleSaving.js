/**
 * Created by Jim on 4/23/2017.
 */
function SaveGame(scope) {
    this.saveTheGame = function() {
        var toSave = {};
        toSave.boughtSpeedBonus = scope.boughtSpeedBonus;
        toSave.secondsLevelBoost = scope.secondsLevelBoost;
        toSave.gainFirst = scope.gainFirst;
        toSave.gainAll = scope.gainAll;
        toSave.costSpeedBonus = scope.costSpeedBonus;
        toSave.costSecondsBoost = scope.costSecondsBoost;
        toSave.costBuyRow = scope.costBuyRow;
        toSave.costGainFirst = scope.costGainFirst;
        toSave.costGainAll = scope.costGainAll;
        toSave.pbars = scope.pbars;
        window.localStorage.version1 = JSON.stringify(toSave);
    };
    this.loadTheGame = function() {
        if (!window.localStorage.version1) {
            this.loadDefaults();
            return;
        }
        var toLoad = JSON.parse(window.localStorage.version1);
        scope.boughtSpeedBonus = toLoad.boughtSpeedBonus;
        scope.secondsLevelBoost = toLoad.secondsLevelBoost;
        scope.gainFirst = toLoad.gainFirst;
        scope.gainAll = toLoad.gainAll;
        scope.costSpeedBonus = toLoad.costSpeedBonus;
        scope.costSecondsBoost = toLoad.costSecondsBoost;
        scope.costBuyRow = toLoad.costBuyRow;
        scope.costGainFirst = toLoad.costGainFirst;
        scope.costGainAll = toLoad.costGainAll;
        scope.pbars = [];
        for(var x = toLoad.pbars.length - 1; x >= 0; x--) {
            var progressBarFromSave = toLoad.pbars[x];
            var pbar = new ProgressBar();
            for (var key in progressBarFromSave) {
                if (progressBarFromSave.hasOwnProperty(key)) {
                    pbar[key] = progressBarFromSave[key];
                }
            }
            scope.pbars.unshift(pbar);
            scope.addProgressBarUI();
            pbar.calcSpeedMult();
        }
        initialRowCount = scope.pbars.length;
    };
    this.loadDefaults = function() {
        scope.pbars = [];
        var progressBarContainer = document.getElementById('progressBars');
        progressBarContainer.innerHTML = "";

        scope.boughtSpeedBonus = 0;
        scope.secondsLevelBoost = 1;
        scope.gainFirst = 20;
        scope.gainAll = 1;
        scope.costSpeedBonus = 500;
        scope.costSecondsBoost = 30;
        scope.costBuyRow = 25;
        scope.costGainFirst = 8;
        scope.costGainAll = 150;
        initialRowCount = 4
    }
}