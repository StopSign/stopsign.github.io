let attTree = {};

function createAndLinkNewAttribute(attCategory, attVar) {
    if(!attTree[attCategory]) {
        attTree[attCategory] = [];
    }
    attTree[attCategory].push(attVar);

    if(!data.atts[attVar]) {
        data.atts[attVar] = {};
    }

    let attObj = data.atts[attVar];
    attObj.attVar = attVar;
    attObj.linkedActionExpAtts = [];
    attObj.linkedActionEfficiencyAtts = [];
    attObj.linkedActionOnLevelAtts = [];

    attsSetBaseVariables(attObj);
}

function attsSetBaseVariables(attObj) {
    attObj.num = 0;
    // attObj.perMinute = 0;
    attObj.mult = 1;
    attObj.unlocked = false;
}

//Vars that should be reset each KTL
function actionSetBaseVariables(actionObj, dataObj) {
    actionObj.resource = 0;

    actionObj.progress = 0;
    actionObj.progressGain = 0; //calculated based on resource & tier
    actionObj.instability = 0;
    actionObj.progressMaxBase = dataObj.progressMaxBase ? dataObj.progressMaxBase : 1;
    actionObj.progressMaxMult = dataObj.progressMaxMult ? dataObj.progressMaxMult : 1;
    actionObj.progressMax = actionObj.progressMaxBase * actionObj.progressMaxMult * (1+actionObj.instability/100);
    actionObj.actionPowerBase = dataObj.actionPowerBase ? dataObj.actionPowerBase : 1;
    actionObj.actionPowerMult = dataObj.actionPowerMult ? dataObj.actionPowerMult : 1;
    actionObj.level = 0;
    actionObj.maxLevel = dataObj.maxLevel;
    actionObj.exp = 0;
    actionObj.expGain = 0;
    actionObj.power = dataObj.power ?? undefined;
    actionObj.expToLevelBase = dataObj.expToLevelBase ? dataObj.expToLevelBase : 1;
    actionObj.expToLevelMult = dataObj.expToLevelMult ? dataObj.expToLevelMult : 1;
    actionObj.expToLevel = actionObj.expToLevelBase * actionObj.expToLevelMult; //can be divided
    actionObj.expToAddBase = 1;
    actionObj.expToAddMult = 1;
    actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
    actionObj.generatorSpeed = dataObj.generatorSpeed ? dataObj.generatorSpeed : 0;
    actionObj.generatorTarget = dataObj.generatorTarget;
    actionObj.resource = 0;
    actionObj.resourceDelta = 0;
    actionObj.resourceIncrease = 0;
    actionObj.resourceDecrease = 0;
    actionObj.resourceIncreaseFromGens = 0;
    actionObj.totalSend = 0;
    actionObj.expToLevelIncrease = dataObj.expToLevelIncrease;
    actionObj.actionPowerMultIncrease = dataObj.actionPowerMultIncrease ? dataObj.actionPowerMultIncrease : 1;
    actionObj.progressMaxIncrease = dataObj.progressMaxIncrease;
    actionObj.visible = (globalVisible || dataObj.visible === null) ? true : dataObj.visible;
    actionObj.unlockCost = dataObj.unlockCost;
    actionObj.unlocked = dataObj.unlocked === null ? true : dataObj.unlocked;
    actionObj.currentMenu = "downstream";

    actionObj.isRunning = dataObj.plane !== 1; //for controlling whether time affects it
    actionObj.onLevelAtts = dataObj.onLevelAtts ? dataObj.onLevelAtts : [];
    actionObj.efficiencyAtts = dataObj.efficiencyAtts ? dataObj.efficiencyAtts : [];
    actionObj.expAtts = dataObj.expAtts ? dataObj.expAtts : [];
    actionObj.efficiencyBase = dataObj.efficiencyBase ? dataObj.efficiencyBase : 1; //1 = 100%
    actionObj.efficiencyMult = dataObj.efficiencyMult ? dataObj.efficiencyMult : 1;
    actionObj.expertise = actionObj.efficiencyBase * actionObj.efficiencyMult; //the initial and the multiplier (increases on stat add)
    actionObj.attReductionEffect = 1;
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
    actionObj.isSpell = dataObj.isSpell;
    actionObj.cooldown = dataObj.cooldown;
    actionObj.cooldownTimer = 0; //when this is higher than cooldown it is ready
    actionObj.resourceName = dataObj.resourceName ? dataObj.resourceName : "momentum";
    actionObj.tier = dataObj.tier;
    actionObj.wage = dataObj.wage ? dataObj.wage : undefined;
    actionObj.instabilityToAdd = dataObj.instabilityToAdd ? dataObj.instabilityToAdd : undefined;
    actionObj.hasUpstream = dataObj.hasUpstream ?? true;
    actionObj.isKTL = !!dataObj.isKTL;
    actionObj.purchased = !!dataObj.purchased;
    actionObj.plane = dataObj.plane;

    // actionObj.onUnlock = dataObj.onUnlock ? dataObj.onUnlock : function() {};
    // actionObj.onCompleteCustom = dataObj.onCompleteCustom ? dataObj.onCompleteCustom : function() {};
    // actionObj.onLevelCustom = dataObj.onLevelCustom ? dataObj.onLevelCustom : function() {};


    //Vars that don't really need to be initalized but I like to know they're there
    actionObj.parentVar = null;
    actionObj.highestLevel = -1;
    actionObj.prevUnlockTime = null;
}

//function createAndLinkNewAction(actionVar, expToLevelIncrease, actionPowerMultIncrease, progressMaxIncrease, progressMax, expToLevel, unlockCost, title, x, y, downstreamVars, tier, dataObj) {
function createAndLinkNewAction(actionVar, dataObj, title, downstreamVars) {
    data.actions[actionVar] = {};

    let actionObj = data.actions[actionVar];
    actionObj.actionVar = actionVar;
    actionObj.title = title;
    dataObj.downstreamVars = downstreamVars ? downstreamVars : [];

    actionSetBaseVariables(actionObj, dataObj);
    actionSetInitialVariables(actionObj, dataObj);



    for(let downstreamVar of dataObj.downstreamVars) {
        actionObj[downstreamVar+"FocusMult"] = 1;
        actionObj[downstreamVar+"downstreamSendRate"] = 0;
        actionObj[`downstreamRate${downstreamVar}`] = 0;
    }

    actionObj.progressRateReal = function() { //For data around the flat action too
        return actionObj.resource * actionObj.tierMult() * (actionObj.efficiency/100) / data.gameSettings.ticksPerSecond;
    }
    actionObj.calcStatMult = function() {
        actionObj.expToLevelMult = 1;
        actionObj.progressMaxMult = 1;
        let totalEffect = 1;
        dataObj.expAtts.forEach(function(expStat) {
            let name = expStat[0];
            let ratio = expStat[1];
            if(!data.atts[name]) {
                console.log("need to instantiate " + name);
                return;
            }
            let effect = ((data.atts[name].mult-1) * ratio) + 1; //10% of x2.5 -> .15
            actionObj[name+"AttExpMult"] = effect; //
            totalEffect *= effect;
        })
        actionObj.attReductionEffect = totalEffect;
        if(actionObj.isGenerator) {
            actionObj.expToLevelMult = 1/totalEffect;
            actionObj.expToLevel = actionObj.expToLevelBase * actionObj.expToLevelMult;
        } else {
            actionObj.progressMaxMult = 1/totalEffect;
            actionObj.progressMax = actionObj.progressMaxBase * actionObj.progressMaxMult * (1+actionObj.instability/100);
        }
        actionObj.actionPower = actionObj.actionPowerBase * actionObj.actionPowerMult * (actionObj.efficiency/100);
    }
    actionObj.calcAttExpertise = function() {
        actionObj.efficiencyMult = 1;
        for(let expertiseAtt of actionObj.efficiencyAtts) {
            let name = expertiseAtt[0];
            let ratio = expertiseAtt[1];
            if(!data.atts[name]) {
                console.log(`You need to instantiate the attribute ${name}`);
                continue;
            }
            let attPoints = data.atts[name].mult - 1;
            let effect;
            if (ratio >= 0) {
                effect = (attPoints * ratio) + 1;
            } else {
                effect = Math.pow((1 - (ratio * -.1)), data.atts[name].mult-1);
            }
            actionObj[`${name}AttEfficiencyMult`] = effect;
            actionObj.efficiencyMult *= effect;
        }
        actionObj.expertise = actionObj.efficiencyBase * actionObj.efficiencyMult;
        actionObj.efficiency = actionObj.expertise > 1 ? 100 : actionObj.expertise * 100;
    }
    actionObj.tierMult = function() {
        return 1/Math.pow(10, actionObj.tier) / 10;
    }

    return actionObj;
}

function actionProgressRate(actionObj) {
    if(actionObj.isGenerator) {
        return 1 / data.gameSettings.ticksPerSecond;
    }
    return actionObj.progressRateReal();
}

function isAttentionLine(actionVar, downstreamVar) {
    return data.focusSelected.some(
        sel => sel.lineData.from === actionVar && sel.lineData.to === downstreamVar
    );
}

function checkLevelUp(actionObj, dataObj) {
    let isMaxLevel = actionObj.maxLevel !== undefined && actionObj.level >= actionObj.maxLevel;
    if(actionObj.exp >= actionObj.expToLevel && !isMaxLevel) {
        actionObj.exp -= actionObj.expToLevel;
        actionObj.level++;
        actionObj.progressMaxBase *= actionObj.progressMaxIncrease;
        actionObj.progressMax = actionObj.progressMaxBase * actionObj.progressMaxMult * (1+actionObj.instability/100);
        actionObj.expToLevelBase *= actionObj.expToLevelIncrease;
        actionObj.expToLevel = actionObj.expToLevelBase * actionObj.expToLevelMult;
        actionObj.actionPowerMult *= actionObj.actionPowerMultIncrease;

        //power = base * mult * efficiency
        actionObj.actionPower = actionObj.actionPowerBase * actionObj.actionPowerMult * (actionObj.efficiency/100);

        actionObj.onLevelAtts.forEach(function (attObj) {
            let name = attObj[0];
            let amount = attObj[1];
            if(!data.atts[name]) {
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

function statAddAmount(attVar, amount) {
    let attObj = data.atts[attVar];
    if(!attObj) {
        console.log("Tried to add to a stat that doesn't exist: " + attVar);
    }
    attObj.num += amount;
    attObj.mult = 1 + attObj.num * .1; //Math.pow(1.1, attObj.num); //calc only when adding
    attObj.linkedActionExpAtts.forEach(function (actionVar) {
        data.actions[actionVar].calcStatMult();
    })
    attObj.linkedActionEfficiencyAtts.forEach(function (actionVar) {
        data.actions[actionVar].calcAttExpertise();
    })
}

//To be used after Amulet, NOT on initialization
function actionResetToBase(actionVar) {
    let actionObj = data.actions[actionVar];
    let dataObj = actionData[actionVar];
    actionSetBaseVariables(actionObj, dataObj);
}

function actionUpdateAllStatMults() {
    for(let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        actionObj.calcStatMult();
        actionObj.calcAttExpertise();
    }
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
    if(!actionObj || actionObj.visible || !actionObj.purchased) { //only change things if appropriate
        if(!actionObj) {
            console.log('tried to unveil ' + actionVar + ' in error.');
        }
        return;
    }

    //If parent is not visible, add actionVar to a list instead
    //Every time an action is unlocked, look through the downstream of the unlocked - does it match any in the list
    //if so, unveil that one next


    actionObj.visible = true;

    revealActionAtts(actionObj);

    //set all downstream actions to 1% when you unlock
    let parentVar = actionObj.parentVar;
    let parent = data.actions[parentVar];
    // let amountToSet = data.upgrades.sliderAutoSet.amount;
    if(!parent) {
        console.log('Failed to access parent var ' + parentVar + ' of action ' + actionVar + '.');
    }
    if(parent.isGenerator && parent.generatorTarget === actionVar) {
        //There won't be a downstream slider
        return;
    }
    actionData[parentVar].downstreamVars.forEach(function (downstreamVar) {
        if(downstreamVar === actionVar && data.actions[downstreamVar].hasUpstream) {
            setSliderUI(parentVar, downstreamVar, getUpgradeSliderAmount()); //set parent on unveil
        }
    });
}

function revealActionAtts(actionObj) {
    for(let onLevelAtt of actionObj.onLevelAtts) {
        revealAtt(onLevelAtt[0]);
    }
}

function revealAtt(attVar) {
    let attObj = data.atts[attVar];
    attObj.unlocked = true; //sets the side menu

    for (let actionVar of attObj.linkedActionExpAtts) {
        views.updateVal(`${actionVar}${attVar}OutsideContainerexp`, "", "style.display");
        views.updateVal(`${actionVar}${attVar}InsideContainerexp`, "", "style.display");
        views.updateVal(`${actionVar}AttExpContainer`, "", "style.display");
    }
    for (let actionVar of attObj.linkedActionEfficiencyAtts) {
        views.updateVal(`${actionVar}${attVar}OutsideContainereff`, "", "style.display");
        views.updateVal(`${actionVar}${attVar}InsideContainereff`, "", "style.display");
        views.updateVal(`${actionVar}AttEfficiencyContainer`, "", "style.display");
    }
    for(let actionVar of attObj.linkedActionOnLevelAtts) {
        views.updateVal(`${actionVar}AttOnLevelContainer`, "", "style.display");
    }

    showAttColors(attVar);

    for (let attCategory in attTree) {
        if (attTree[attCategory].includes(attVar)) {
            views.updateVal(`${attCategory}CategoryContainer`, "", "style.display");
        }
    }
}

function unlockAction(actionObj) {
    let actionVar = actionObj.actionVar;
    if(actionObj.unlocked) {
        return;
    }
    actionObj.unlocked = true;
    actionObj.unlockTime = data.secondsPerReset; //mark when it unlocked
    let dataObj = actionData[actionVar];
    if(dataObj.onUnlock) {
        dataObj.onUnlock();
    }

    dataObj.downstreamVars.forEach(function(downstreamVar) {
        if(data.actions[downstreamVar] && data.actions[downstreamVar].unlocked && document.getElementById(actionVar + "NumInput" + downstreamVar)) {
            setSliderUI(actionVar, downstreamVar, getUpgradeSliderAmount()); //set when unlock
        }
    });

    for(let onLevelObj of dataObj.onLevelAtts) {
        showAttColors(onLevelObj[0]);
    }
    for(let onLevelObj of dataObj.expAtts) {
        showAttColors(onLevelObj[0]);
    }
    for(let onLevelObj of dataObj.efficiencyAtts) {
        showAttColors(onLevelObj[0]);
    }
}

function upgradeUpdates() {
    //update all generator's multiplier data
    Object.values(actionData).forEach(action => {
        if (action.updateMults) action.updateMults();
    });
    data.actions.overclock.resource += data.upgrades.tryALittleHarder.upgradePower * 20 / data.gameSettings.ticksPerSecond;
}

function getUpgradeSliderAmount() {
    return [0, 5, 20, 100, -1][data.upgrades.stopLettingOpportunityWait.upgradePower];
}

//get current info based on upgrade information, generally global or universal stuff. Individual action stuff upgrades get put on the action.
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

function calcFearGain() {
    return (data.totalMomentum + data.actions.overclock.resourceToAdd) / 1e20 * (data.actions.gossipAroundCoffee.resource / 1000);
}

function isSpellReady(actionVar) {
    let actionObj = data.actions[actionVar];
    return actionObj.level > 0 && (!actionObj.cooldown || actionObj.cooldownTimer >= actionObj.cooldown);
}

function useCharge(actionVar) {
    let actionObj = data.actions[actionVar];

    actionObj.level--;
    actionObj.instability += actionObj.instabilityToAdd / (actionObj.efficiency/100);

    if(actionObj.cooldown) {
        actionObj.cooldownTimer = 0;
    }
}

//adjustActionData('', 'progressMaxBase', 1e6)
//function to be used as a debug helper, running in console
function adjustActionData(actionVar, key, value) {
    let actionObj = data.actions[actionVar];
    actionObj[key] = value;
    if(['progressMaxBase', 'progressMaxMult'].includes(key)) {
        actionObj.progressMax = actionObj.progressMaxBase * actionObj.progressMaxMult * (1+actionObj.instability/100);
    }

}
