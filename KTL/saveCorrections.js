function saveFileCorrection(saveVersionFromLoad) {
    let refundAmount = 0;
    //save version specific data correction
    if(saveVersionFromLoad <= 1) {
        delete data.atts.processing; //changed named to Intellect, have to delete old att
        delete data.atts.stillness; //changed named to Peace, have to delete old att
        data.actions.overboost.instability = 0;
        data.actions.overcharge.instability = 0;
        data.currentLog = []; //clear log since the format changed
        data.resetLogs = []; //clear log since the format changed
        delete data.focusLoopMax;
        delete data.focusMult;

        for(let actionVar in data.actions) {
            let dataObj = actionData[actionVar];
            for (let downstreamVar of dataObj.downstreamVars) {
                delete data.actions[actionVar][`${downstreamVar}FocusMult`]
            }
        }
        data.toastStates[23] = "hidden";
    }
    if(saveVersionFromLoad <= 2) {
        if(data.actions.earthMagic.purchased === false) {
            data.actions.earthMagic.purchased = true;
        }
        if(!data.actions.earthMagic.visible && data.actions.prepareExternalSpells.level > 0) {
            data.actions.earthMagic.visible = true;
        }
        adjustActionData('reinforceArmor', 'progressMaxIncrease', 1);
        adjustActionData('reinforceArmor', 'progressMaxBase', 3e16);
        adjustActionData('reinforceArmor', 'expToLevelBase', 1);

        data.upgrades.retrieveMyUnusedResources.upgradesAvailable = 3;
        if(data.upgrades.retrieveMyUnusedResources.upgradePower === 4) {
            data.upgrades.retrieveMyUnusedResources.upgradePower = 3;
            data.upgrades.retrieveMyUnusedResources.upgradesBought = 3;
            refundAmount += 1687;
        }

        data.actions.moveIron.power = 100;
        data.actions.reinforceArmor.power = 150;
        data.actions.restoreEquipment.power = 250;
        data.actions.unblemish.power = 400;
        data.actions.manaTransfer.power = 600;

        adjustActionData('moveIron', 'efficiencyBase', .0003);
        adjustActionData('reinforceArmor', 'efficiencyBase', .0002);
        adjustActionData('restoreEquipment', 'efficiencyBase', .0001);
        adjustActionData('unblemish', 'efficiencyBase', .00008);
        adjustActionData('manaTransfer', 'efficiencyBase', .00005);

        for(let actionVar in data.actions) {
            let actionObj = data.actions[actionVar];
            let dataObj = actionData[actionVar];
            if(dataObj.plane === 1 && actionObj.unlocked) {
                actionObj.prevUnlockTime = 5;
                actionObj.unlockTime = 5;
            }
        }
    }
    if(saveVersionFromLoad <= 3) {
        for(let actionVar in data.actions) {
            let actionObj = data.actions[actionVar];
            let dataObj = actionData[actionVar];
            if(actionObj.unlocked || actionObj.prevUnlockTime || actionObj.unlockTime || actionObj.highestLevel > 0) {
                actionObj.hasBeenUnlocked = true;
            }
        }
        data.upgrades.buyNicerStuff.upgradesAvailable = 3;
        if(data.upgrades.buyNicerStuff.upgradePower === 3) {
            data.upgrades.buyNicerStuff.isFullyBought = true;
        }
        if(data.upgrades.buyNicerStuff.upgradePower === 4) {
            refundAmount += 1890;
            data.upgrades.buyNicerStuff.upgradePower = 3;
            data.upgrades.buyNicerStuff.upgradesBought = 3;
            data.upgrades.buyNicerStuff.isFullyBought = true;
        }
        if(data.upgrades.retrieveMyUnusedResources.upgradePower === 3) {
            data.upgrades.retrieveMyUnusedResources.isFullyBought = true;
        }
    }
    return refundAmount;
}

function saveFileCorrectionAfterLoad(saveVersionFromLoad) {

    if(saveVersionFromLoad <= 2) {
        if(data.actions.studyAdvancedEarthMagic.level >= 2) {
            purchaseAction('reinforceArmor')
            unveilAction('reinforceArmor');
        }
        if(data.actions.studyAdvancedEarthMagic.level >= 3) {
            purchaseAction('restoreEquipment')
            unveilAction('restoreEquipment');
        }
    }
}