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
        toSave.expMult = scope.expMult;
        toSave.costSpeedBonus = scope.costSpeedBonus;
        toSave.costSecondsBoost = scope.costSecondsBoost;
        toSave.costBuyRow = scope.costBuyRow;
        toSave.costGainFirst = scope.costGainFirst;
        toSave.costGainAll = scope.costGainAll;
        toSave.costExpMult = scope.costExpMult;
        toSave.pbars = scope.pbars;
        toSave.selectedButton = selectedButton;
        window.localStorage.version1 = JSON.stringify(toSave);
    };
    this.loadTheGame = function() {
        this.loadDefaults();
        // return; //hard-clear the save
        if (!window.localStorage.version1) {
            this.loadDefaults();
            return;
        }
        var toLoad = JSON.parse(window.localStorage.version1);
        scope.boughtSpeedBonus = toLoad.boughtSpeedBonus;
        scope.secondsLevelBoost = toLoad.secondsLevelBoost;
        scope.gainFirst = toLoad.gainFirst;
        scope.gainAll = toLoad.gainAll;
        scope.expMult = toLoad.expMult;
        scope.costSpeedBonus = toLoad.costSpeedBonus;
        scope.costSecondsBoost = toLoad.costSecondsBoost;
        scope.costBuyRow = toLoad.costBuyRow;
        scope.costGainFirst = toLoad.costGainFirst;
        scope.costGainAll = toLoad.costGainAll;
        scope.costExpMult = toLoad.costExpMult;
        scope.selectedButton = toLoad.selectedButton;
        scope.pbars = [];
        for(var x = toLoad.pbars.length - 1; x >= 0; x--) {
            var progressBarFromSave = toLoad.pbars[x];
            var pbar = new ProgressBar(scope);
            for (var key in progressBarFromSave) {
                if (progressBarFromSave.hasOwnProperty(key)) {
                    pbar[key] = progressBarFromSave[key];
                }
            }
            scope.pbars.unshift(pbar);
            scope.addProgressBarUI();
            pbar.changeSelect(-1);
            pbar.calcSpeedMult();
            pbar.calcTotalResGain();
        }
        initialRowCount = scope.pbars.length;
        if(!scope.costExpMult) {
            scope.costExpMult = 10000;
            scope.expMult = 1;
        }
    };
    this.loadDefaults = function() {
        scope.pbars = [];
        var progressBarContainer = document.getElementById('progressBars');
        progressBarContainer.innerHTML = "";

        scope.boughtSpeedBonus = 0;
        scope.secondsLevelBoost = 1;
        scope.gainFirst = 20;
        scope.gainAll = 1;
        scope.expMult = 1;
        scope.costSpeedBonus = 500;
        scope.costSecondsBoost = 30;
        scope.costBuyRow = 22;
        scope.costGainFirst = 8;
        scope.costGainAll = 120;
        scope.costExpMult = 10000;
        initialRowCount = 4
    }
}