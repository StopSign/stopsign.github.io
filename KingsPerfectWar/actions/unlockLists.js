'use strict';

let unlockLists = {
    tick: function() {
        unlockLists.checkUnlocks();
    },
    checkUnlocks: function() {
        unlockLists.check(0, true);
        unlockLists.check(1, levelData && levelData.home.units.length === 0);
        unlockLists.check(2, highestLevel >= 1);
        unlockLists.check(3, curLevel >= 1, ["kingLabel1", "kingLabel3", "extrasInfoBox", "optionsContainer"]);
        unlockLists.check(4, gold > 0, ["goldContainer", "castleLabel1", "woodContainer", "castleLabel3", "unitsToMove"]);
        unlockLists.check(5, highestLevel >= 2);
        unlockLists.check(6, curLevel >= 2, ["castleLabel2"]);
        unlockLists.check(7, created.altar > 0, ["favorContainer"]);
        unlockLists.check(8, soulC > 0, ["soulCContainer"]);

        unlockLists.check(14, king > 0,["directWorkerBonus"]);
        unlockLists.check(15, levelInitials[curLevel].initial.people > 0,["statLabel1", "statLabel2", "statLabel3"]);

        unlockLists.check(20, highestLevel >= 20,["heroesToMove"])
    },
    check: function(num, shouldUnlock, isMadeVisibleList) {
        if(!unlockList[num] && shouldUnlock) {
            if(isMadeVisibleList) {
                for (let i = 0; i < isMadeVisibleList.length; i++) {
                    removeClassFromDiv(document.getElementById(isMadeVisibleList[i]), "hidden");
                }
            }
            if(tutorial[num]) {
                createTooltip(tutorial[num]);
            }
            unlockList[num] = true;
        }
    }
};
