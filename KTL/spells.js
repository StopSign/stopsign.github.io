

function checkGrimoireUnlocks() {
    //unlock relevant circle magic per level
    if(data.actions.awakenYourGrimoire.unlocked) {
        revealAction("overcharge")
        revealAction("prepareInternalSpells")
        revealAction("castingExperience")
        unlockAction(data.actions.castingExperience);
        revealAction("threadArcana")
        revealAction("prepareSpells")
    }
    if(data.actions.awakenYourGrimoire.level >= 1) {
        revealAction("overwork")
        revealAction("overtalk")
    }
    if(data.actions.awakenYourGrimoire.level >= 2) {
        revealAction("overboost")
    }
    if(data.actions.awakenYourGrimoire.level >= 3) {
        revealAction("overproduce")
        revealAction("overhear")
    }
    if(data.actions.awakenYourGrimoire.level >= 4) {
        revealAction("overponder")
    }
    if(data.actions.awakenYourGrimoire.level >= 5) {
        revealAction("overdrive")
    }
    if(data.actions.awakenYourGrimoire.level >= 6) {
        revealAction("overhype")
    }
    // if(data.actions.awakenYourGrimoire.level >= 7) {
    //     revealAction("overanalyze")
    // }
    // if(data.actions.awakenYourGrimoire.level >= 8) {
    //     revealAction("overpush")
    // }

    // revealAction("castDirtMagic")
    // revealAction("createMounds")
    // //start with the above 2, get the following some other way
    // revealAction("castIronMagic")
    // revealAction("mendSmallCracks")
    // revealAction("castRecoverMagic")
    // revealAction("unblemish")
    // revealAction("castPracticalMagic")
    // revealAction("illuminate")
}


function isSpellReady(actionVar) {
    let actionObj = data.actions[actionVar];
    return !gameIsResetting && actionObj.level > 0 && !actionObj.isPaused && (!actionObj.cooldown || actionObj.cooldownTimer >= actionObj.cooldown);
}

function useCharge(actionVar) {
    let actionObj = data.actions[actionVar];
    let dataObj = actionData[actionVar]

    actionObj.level--;
    actionObj.instability += dataObj.instabilityToAdd / (actionObj.efficiency/100);
    actionObj.spellCastCount++;

    if(actionObj.cooldown) {
        actionObj.cooldownTimer = 0;
    }

    data.actions.castingExperience.resource += Math.pow(dataObj.circle + 1, 4);

    enableAutomationUpwards(actionVar);

    return dataObj.spellPower();
}


function useActiveSpellCharges(school) {
    let spellPowerUsed = 0;
    for(let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        let dataObj = actionData[actionVar];
        if(dataObj.isSpell && dataObj.school === school && actionObj.level > 0 && !actionObj.isPaused ) {
            spellPowerUsed += useCharge(actionVar);
        }
    }
    return spellPowerUsed;
}


//because the magic actions load unlocked, they don't re-trigger adding maxing levels
function adjustMagicMaxLevels() {
    data.actions.spellResearch.maxLevel = actionData.spellResearch.maxLevel +
        data.upgrades.valueMyResearch.upgradePower;
    data.actions.etchTheCircle.maxLevel = 1 +
        data.actions.chargeInk.level +
        (data.actions.locateWeakness.unlocked?1:0) +
        (data.actions.boldenLines.unlocked?1:0) +
        (data.actions.chargeInk.unlocked?1:0);
    data.actions.condenseMana.maxLevel = 5 +
        (data.actions.spinMana.unlocked?5:0)+
        (data.actions.accelerateManaFlow.unlocked?5:0)+
        (data.actions.loopTheCircuit.unlocked?5:0);
    data.actions.infuseTheHide.maxLevel = 1 +
        (data.actions.boldenLines.unlocked?2:0) +
        (data.actions.grindPigments.unlocked?2:0);
    data.actions.castToFail.maxLevel = 0 +
        (data.actions.overcharge.unlocked?1:0) +
        (data.actions.overboost.unlocked?1:0) +
        (data.actions.overponder.unlocked?1:0) +
        (data.actions.overwork.unlocked?1:0) +
        (data.actions.overproduce.unlocked?1:0) +
        (data.actions.overdrive.unlocked?1:0) +
        (data.actions.overtalk.unlocked?1:0) +
        (data.actions.overhear.unlocked?1:0) +
        (data.actions.overhype.unlocked?1:0) +
        (data.actions.createMounds.unlocked?1:0) +
        (data.actions.hardenDirt.unlocked?1:0) +
        (data.actions.shapeDefenses.unlocked?1:0) +
        (data.actions.mendSmallCracks.unlocked?1:0) +
        (data.actions.restoreEquipment.unlocked?1:0) +
        (data.actions.reinforceArmor.unlocked?1:0) +
        (data.actions.unblemish.unlocked?1:0) +
        (data.actions.lightHeal.unlocked?1:0) +
        (data.actions.mendAllWounds.unlocked?1:0) +
        (data.actions.illuminate.unlocked?1:0) +
        (data.actions.identifyItem.unlocked?1:0) +
        (data.actions.detectMagic.unlocked?1:0);
}