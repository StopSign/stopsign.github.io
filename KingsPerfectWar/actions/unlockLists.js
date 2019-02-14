'use strict';

let unlockLists = {
    tick: function() {
        unlockLists.checkUnlocks();
    },
    checkUnlocks: function() {
        unlockLists.check(0, gold > 0, ["goldContainer", "castleLabel1"]);
        unlockLists.check(1, highestLevel >= 2, ["castleLabel2"]);
        unlockLists.check(2, wood > 0, ["woodContainer", "castleLabel3", "unitsToMove"]);
        unlockLists.check(3, created.altar > 0, ["favorContainer"]);
        unlockLists.check(4, soulC > 0, ["soulCContainer"]);

        unlockLists.check(5, highestLevel >= 1, ["kingLabel1", "kingLabel3", "extrasInfoBox", "optionsContainer"]);

        unlockLists.check(15, king.savedData.int > 0,["directWorkerBonus"]);

        unlockLists.check(20, highestLevel >= 20,["heroesToMove"])
    },
    check: function(num, shouldUnlock, isMadeVisibleList) {
        if(!unlockList[num] && shouldUnlock) {
            for(let i = 0; i < isMadeVisibleList.length; i++) {
                removeClassFromDiv(document.getElementById(isMadeVisibleList[i]), "hidden");
            }
            unlockList[num] = true;
        }
    }
};