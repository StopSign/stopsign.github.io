function statsSetBaseVariables(statObj) {
    statObj.num = 0;
    statObj.perMinute = 0;
    statObj.mult = 1;
}

function createAndLinkNewStat(statVar) {
    data.statNames.push(statVar);
    if(!data.stats[statVar]) {
        data.stats[statVar] = {};
    }
    let statObj = data.stats[statVar];
    statObj.statVar = statVar;
    statObj.linkedActionExpStats = [];
    statObj.linkedActionExpertiseStats = [];

    statsSetBaseVariables(statObj);

    generateStatDisplay(statVar);
}

//Vars that should be reset each KTL
function actionSetBaseVariables(actionObj, dataObj) {
    actionObj.momentum = 0;

    actionObj.progress = 0;
    actionObj.progressGain = 0; //calculated based on momentum & tier
    actionObj.progressMaxBase = dataObj.progressMaxBase ? dataObj.progressMaxBase : 1;
    actionObj.progressMaxMult = dataObj.progressMaxMult ? dataObj.progressMaxMult : 1;
    actionObj.progressMax = actionObj.progressMaxBase * actionObj.progressMaxMult;
    actionObj.actionPowerBase = dataObj.actionPowerBase ? dataObj.actionPowerBase : 1;
    actionObj.actionPowerMult = dataObj.actionPowerMult ? dataObj.actionPowerMult : 1;
    actionObj.level = 0;
    actionObj.maxLevel = dataObj.maxLevel ? dataObj.maxLevel : -1;
    actionObj.exp = 0;
    actionObj.expToLevelBase = dataObj.expToLevelBase ? dataObj.expToLevelBase : 1;
    actionObj.expToLevelMult = dataObj.expToLevelMult ? dataObj.expToLevelMult : 1;
    actionObj.expToLevel = actionObj.expToLevelBase * actionObj.expToLevelMult; //can be divided
    actionObj.expToAddBase = 1;
    actionObj.expToAddMult = 1;
    actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
    actionObj.generatorSpeed = dataObj.generatorSpeed ? dataObj.generatorSpeed : 0;
    actionObj.generatorTarget = dataObj.generatorTarget;
    actionObj.momentum = 0;
    actionObj.momentumDelta = 0;
    actionObj.momentumIncrease = 0;
    actionObj.expToLevelIncrease = dataObj.expToLevelIncrease;
    actionObj.actionPowerMultIncrease = dataObj.actionPowerMultIncrease ? dataObj.actionPowerMultIncrease : 1;
    actionObj.progressMaxIncrease = dataObj.progressMaxIncrease;
    actionObj.visible = (globalVisible || dataObj.visible === null) ? true : dataObj.visible;
    actionObj.unlockCost = dataObj.unlockCost;
    actionObj.unlocked = dataObj.unlocked === null ? true : dataObj.unlocked;
    actionObj.currentMenu = "downstream";

    actionObj.isRunning = !dataObj.isKTL; //for controlling whether time affects it
    actionObj.efficiencyStats = dataObj.efficiencyStats ? dataObj.efficiencyStats : [];
    actionObj.expertiseBase = dataObj.expertiseBase ? dataObj.expertiseBase : 1; //1 = 100%
    actionObj.expertiseMult = dataObj.expertiseMult ? dataObj.expertiseMult : 1;
    actionObj.expertise = actionObj.expertiseBase * actionObj.expertiseMult; //the initial and the multiplier (increases on stat add)
    actionObj.efficiencyMax = dataObj.efficiencyMax ? dataObj.efficiencyMax : 200;
    actionObj.efficiency = actionObj.expertise > dataObj.efficiencyMax  ? dataObj.efficiencyMax : actionObj.expertise * 100;

    actionObj.actionPower = actionObj.actionPowerBase * actionObj.actionPowerMult * (actionObj.efficiency/100);

    actionObj.upgradeMult = 1;
    if(dataObj.updateUpgradeMult) {
        dataObj.updateUpgradeMult();
    }
}

//One and done
function actionSetInitialVariables(actionObj, dataObj) {
    actionObj.isGenerator = dataObj.isGenerator;
    actionObj.momentumName = dataObj.momentumName ? dataObj.momentumName : "momentum";
    actionObj.onLevelStats = dataObj.onLevelStats ? dataObj.onLevelStats : [];
    actionObj.expStats = dataObj.expStats ? dataObj.expStats : [];
    actionObj.tier = dataObj.tier;
    actionObj.wage = dataObj.wage ? dataObj.wage : null;
    actionObj.isKTL = !!dataObj.isKTL;
    actionObj.purchased = !!dataObj.purchased;

    // actionObj.onUnlock = dataObj.onUnlock ? dataObj.onUnlock : function() {};
    // actionObj.onCompleteCustom = dataObj.onCompleteCustom ? dataObj.onCompleteCustom : function() {};
    // actionObj.onLevelCustom = dataObj.onLevelCustom ? dataObj.onLevelCustom : function() {};

    actionObj.onCompleteText = (dataObj.onCompleteText && dataObj.onCompleteText[language]) ? dataObj.onCompleteText[language] : "";
    actionObj.onLevelText = (dataObj.onLevelText && dataObj.onLevelText[language]) ? dataObj.onLevelText[language] : "";
    actionObj.extraInfo = (dataObj.extraInfo && dataObj.extraInfo[language]) ? dataObj.extraInfo[language] : "";
    actionObj.unlockMessage = (dataObj.unlockMessage && dataObj.unlockMessage[language]) ? dataObj.unlockMessage[language] : "";

    //Vars that don't really need to be initalized but I like to know they're there
    actionObj.parent = null;
    actionObj.highestLevel = -1;
    actionObj.prevUnlockTime = null;
}

//function createAndLinkNewAction(actionVar, expToLevelIncrease, actionPowerMultIncrease, progressMaxIncrease, progressMax, expToLevel, unlockCost, title, x, y, downstreamVars, tier, dataObj) {
function createAndLinkNewAction(actionVar, dataObj, title, x, y, downstreamVars) {
    data.actionNames.push(actionVar);
    data.actions[actionVar] = {};

    let actionObj = data.actions[actionVar];
    actionObj.actionVar = actionVar;
    actionObj.title = title;
    actionObj.x = x;
    actionObj.y = y;
    actionObj.downstreamVars = downstreamVars ? downstreamVars : [];

    actionSetBaseVariables(actionObj, dataObj);
    actionSetInitialVariables(actionObj, dataObj);


    for(let downstreamVar of actionObj.downstreamVars) {
        actionObj[downstreamVar+"AttentionMult"] = 1;
    }

    actionObj.progressRateReal = function() { //For data around the flat action too
        return actionObj.momentum * actionObj.tierMult() * (actionObj.efficiency/100) / ticksPerSecond;
    }
    actionObj.calcStatMult = function() {
        actionObj.expToLevelMult = 1;
        actionObj.expStats.forEach(function(expStat) {
            let name = expStat[0];
            let ratio = expStat[1];
            if(!data.stats[name]) {
                console.log("need to instantiate " + name);
                return;
            }
            let effect = ((data.stats[name].mult-1) * ratio) + 1; //10% of x2.5 -> .15
            actionObj[name+"StatExpMult"] = effect; //
            actionObj.expToLevelMult /= effect;
        })
        actionObj.expToLevel = actionObj.expToLevelBase * actionObj.expToLevelMult;
    }
    actionObj.calcStatExpertise = function() {
        actionObj.expertiseMult = 1;
        actionObj.efficiencyStats.forEach(function(expertiseStat) {
            let name = expertiseStat[0];
            let ratio = expertiseStat[1];
            if(!data.stats[name]) {
                console.log("need to instantiate " + name);
                return;
            }
            let effect = ((data.stats[name].mult-1) * ratio) + 1;
            actionObj[name+"StatExpertiseMult"] = effect;
            actionObj.expertiseMult *= effect;
        })
        actionObj.expertise = actionObj.expertiseBase * actionObj.expertiseMult;
        actionObj.efficiency = actionObj.expertise > 1 ? 100 : actionObj.expertise * 100;
    }
    actionObj.tierMult = function() {
        return 1/Math.pow(10, actionObj.tier) / 10;
    }

    return actionObj;
}

function actionProgressRate(actionObj) {
    if(actionObj.isGenerator) {
        return 1 / ticksPerSecond;
    }
    return actionObj.progressRateReal();
}

function isAttentionLine(actionVar, downstreamVar) {
    return data.attentionSelected.some(
        sel => sel.lineData.from === actionVar && sel.lineData.to === downstreamVar
    );
}

function calcUpgradeMultToExp(actionObj) {
    let upgradeMult = 1;
    if(data.upgrades.rememberWhatIDid.isFullyBought && actionObj.level < actionObj.highestLevel) {
        upgradeMult *= 2;
    }
    if(data.upgrades.rememberHowIGrew.isFullyBought && actionObj.level < actionObj.secondHighestLevel) {
        upgradeMult *= 2;
    }
    if(data.upgrades.rememberMyMastery.isFullyBought && actionObj.level < actionObj.thirdHighestLevel) {
        upgradeMult *= 2;
    }
    return upgradeMult;
}

function checkLevelUp(actionObj, dataObj) {
    if(actionObj.exp >= actionObj.expToLevel && (actionObj.maxLevel < 0 || (actionObj.level < actionObj.maxLevel))) {
        actionObj.exp -= actionObj.expToLevel;
        actionObj.level++;
        actionObj.progressMaxBase *= actionObj.progressMaxIncrease;
        actionObj.progressMax = actionObj.progressMaxBase * actionObj.progressMaxMult;
        actionObj.expToLevelBase *= actionObj.expToLevelIncrease;
        actionObj.expToLevel = actionObj.expToLevelBase * actionObj.expToLevelMult;
        actionObj.actionPowerMult *= actionObj.actionPowerMultIncrease;

        //power = base * mult * efficiency
        actionObj.actionPower = actionObj.actionPowerBase * actionObj.actionPowerMult * (actionObj.efficiency/100);

        actionObj.onLevelStats.forEach(function (statObj) {
            let name = statObj[0];
            let amount = statObj[1];
            if(!data.stats[name]) {
                console.log('The stat ' + name + ' doesnt exist');
            }
            statAddAmount(name, amount);
        });
        if(dataObj.onLevelCustom) {
            dataObj.onLevelCustom();
        }
        return true;
    }
    return false;
}

function actionAddExp(actionObj) {
    actionObj.exp += actionObj.expToAdd * calcUpgradeMultToExp(actionObj);
    let dataObj = actionData[actionObj.actionVar];

    let timesRun = 0;
    for(let i = 0; i < 10; i++) {
        if(!checkLevelUp(actionObj, dataObj)) {
            break;
        }
    }
}

function statAddAmount(statVar, amount) {
    let statObj = data.stats[statVar];
    statObj.num += amount;
    statObj.mult = Math.pow(1.1, statObj.num); //calc only when adding
    statObj.linkedActionExpStats.forEach(function (actionVar) {
        data.actions[actionVar].calcStatMult();
    })
    statObj.linkedActionExpertiseStats.forEach(function (actionVar) {
        data.actions[actionVar].calcStatExpertise();
    })
}

//To be used after Amulet, NOT on initialization
function actionResetToBase(actionVar) {
    let actionObj = data.actions[actionVar];
    let dataObj = actionData[actionVar];
    actionSetBaseVariables(actionObj, dataObj);
}

function actionUpdateAllStatMults() {
    data.actionNames.forEach(function (actionVar) {
        let obj = data.actions[actionVar];
        obj.calcStatMult();
        obj.calcStatExpertise();
    })
}

//prepares the action to be unlocked during hte loop next round
function purchaseAction(actionVar) {
    let actionObj = data.actions[actionVar];
    if(!actionObj) {
        console.log('tried to purchase ' + actionVar + ' in error.');
        return;
    }
    actionObj.purchased = true;
}

//situation 1: Harness Overflow is just unlocked. It should be 1% sent to Process Thoughts. AKA On unlock, set all sliders to 1%
//situation 2: Travel to Outpost just became visible. It's parent, Overclock, should set it's newly visible slider to 1%. AKA On unveil, set parent to 1%.
function unveilAction(actionVar) {
    let actionObj = data.actions[actionVar];
    if(!actionObj || actionObj.visible || !actionObj.purchased) { //only change things if needed
        if(!actionObj) {
            console.log('tried to unveil ' + actionVar + ' in error.');
        }
        return;
    }
    actionObj.visible = true;

    //set all downstream actions to 1% when you unlock
    let parentVar = actionObj.parent;
    let parent = data.actions[parentVar];
    // let amountToSet = data.upgrades.sliderAutoSet.amount;
    if(!parent) {
        console.log('Failed to access parent var ' + parentVar + ' of action ' + actionVar + '.');
    }
    if(parent.isGenerator && parent.generatorTarget === actionVar) {
        //There won't be a downstream slider
        return;
    }
    parent.downstreamVars.forEach(function (downstreamVar) {
        if(downstreamVar === actionVar) { //set the parent's matching slider
            setSliderUI(parentVar, downstreamVar, getUpgradeSliderAmount());
        }
    });
}

function unlockAction(actionObj) {
    if(actionObj.unlocked) {
        return;
    }
    actionObj.unlocked = true;
    actionObj.unlockTime = data.secondsPerReset; //mark when it unlocked
    let dataObj = actionData[actionObj.actionVar];
    if(dataObj.onUnlock) {
        dataObj.onUnlock();
    }

    actionObj.downstreamVars.forEach(function(downstreamVar) {
        if(data.actions[downstreamVar] && data.actions[downstreamVar].unlocked) {
            setSliderUI(actionObj.actionVar, downstreamVar, getUpgradeSliderAmount());
        }
    });
}

function upgradeUpdates() {
    data.actions.overclock.momentum += data.upgrades.tryALittleHarder.upgradePower * 20 / ticksPerSecond;
}

function getUpgradeSliderAmount() {
    return [0, 5, 20, 100, -1][data.upgrades.stopLettingOpportunityWait.upgradePower];
}