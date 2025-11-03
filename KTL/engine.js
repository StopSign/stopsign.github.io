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
    attObj.attCategory = attCategory;
    attObj.attUpgradeMult = 1;
    attObj.linkedActionExpAtts = [];
    attObj.linkedActionEfficiencyAtts = [];
    attObj.linkedActionOnLevelAtts = [];

    attsSetBaseVariables(attObj);
}

function attsSetBaseVariables(attObj) {
    attObj.num = 0;
    attObj.attMult = 1;
    attObj.unlocked = false;
}

//happens when the number/mult changes
function recalcAttMult(attVar) {
    let attObj = data.atts[attVar];

    attObj.attMult = 1 + attObj.num * .1 * attObj.attUpgradeMult;
}

//Vars that should be reset each KTL
function actionSetBaseVariables(actionObj, dataObj) {
    actionObj.resource = 0;

    actionObj.progress = 0;
    actionObj.progressGain = 0; //calculated based on resource & tier
    actionObj.instability = 0;
    actionObj.progressMaxBase = dataObj.progressMaxBase ? dataObj.progressMaxBase : 1;
    actionObj.progressMaxMult = dataObj.progressMaxMult ? dataObj.progressMaxMult : 1;
    actionObj.progressMax = actionObj.progressMaxBase * actionObj.progressMaxMult * calcInstabilityEffect(actionObj.instability);
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
    actionObj.generatorTarget = dataObj.generatorTarget;
    actionObj.resource = 0;
    actionObj.resourceDelta = 0;
    actionObj.resourceIncrease = 0;
    actionObj.resourceDecrease = 0;
    actionObj.resourceToAdd = dataObj.generatorSpeed ? 0 : undefined;
    actionObj.resourceIncreaseFromGens = 0;
    actionObj.totalSend = 0;
    actionObj.expToLevelIncrease = dataObj.expToLevelIncrease;
    actionObj.actionPowerMultIncrease = dataObj.actionPowerMultIncrease ? dataObj.actionPowerMultIncrease : 1;
    actionObj.progressMaxIncrease = dataObj.progressMaxIncrease;
    actionObj.visible = dataObj.visible === null ? true : dataObj.visible;

    actionObj.unlockTime = null;
    actionObj.level1Time = null;

    // actionObj.visible = (globalVisible || dataObj.visible === null) ? true : dataObj.visible;
    actionObj.unlockCost = dataObj.unlockCost;
    actionObj.unlocked = dataObj.unlocked === null ? true : dataObj.unlocked;

    actionObj.isRunning = dataObj.plane !== 2; //for controlling whether time affects it
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
    actionObj.wage = dataObj.wage ? dataObj.wage : undefined;


    actionObj.expToAddBase = 1;
    actionObj.expToAddMult = calcUpgradeMultToExp(actionObj);
    actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;

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
    actionObj.hasUpstream = dataObj.hasUpstream ?? true;
    actionObj.isKTL = !!dataObj.isKTL;
    actionObj.purchased = !!dataObj.purchased;
    actionObj.plane = dataObj.plane;
    actionObj.automationOnReveal = true;
    actionObj.automationOnMax = true;
    actionObj.currentMenu = "downstream";
    actionObj.hasBeenUnlocked = false;

    // actionObj.onUnlock = dataObj.onUnlock ? dataObj.onUnlock : function() {};
    // actionObj.onCompleteCustom = dataObj.onCompleteCustom ? dataObj.onCompleteCustom : function() {};
    // actionObj.onLevelCustom = dataObj.onLevelCustom ? dataObj.onLevelCustom : function() {};


    //Vars that don't really need to be initalized but I like to know they're there
    actionObj.highestLevel = -1;
    actionObj.secondHighestLevel = -1;
    actionObj.thirdHighestLevel = -1;
}

function createAndLinkNewAction(actionVar, dataObj, downstreamVars) {
    data.actions[actionVar] = {};

    let actionObj = data.actions[actionVar];
    actionObj.actionVar = actionVar;
    dataObj.downstreamVars = downstreamVars ? downstreamVars : [];

    actionSetBaseVariables(actionObj, dataObj);
    actionSetInitialVariables(actionObj, dataObj);



    for(let downstreamVar of dataObj.downstreamVars) {
        actionObj[downstreamVar+"TempFocusMult"] = 2;
        actionObj[downstreamVar+"PermFocusMult"] = 1;
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
            let effect = ((data.atts[name].attMult-1) * ratio) + 1; //10% of x2.5 -> .15
            actionObj[name+"AttExpMult"] = effect; //
            totalEffect *= effect;
        })
        actionObj.attReductionEffect = totalEffect;
        if(actionObj.isGenerator) {
            actionObj.expToLevelMult = 1/totalEffect;
            actionObj.expToLevel = actionObj.expToLevelBase * actionObj.expToLevelMult;
        } else {
            actionObj.progressMaxMult = 1/totalEffect;
            actionObj.progressMax = actionObj.progressMaxBase * actionObj.progressMaxMult * calcInstabilityEffect(actionObj.instability);
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
            let attPoints = data.atts[name].attMult - 1;
            let effect;
            if (ratio >= 0) {
                effect = (attPoints * ratio) + 1;
            } else {
                effect = Math.pow((1 - (ratio * -.1)), data.atts[name].attMult-1);
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
    for(let focusObj of data.focusSelected) {
        if(focusObj.lineData.from === actionVar && focusObj.lineData.to === downstreamVar) {
            return true;
        }
    }
    return false;
}

function checkLevelUp(actionObj, dataObj) {
    let isMaxLevel = actionObj.maxLevel !== undefined && actionObj.level >= actionObj.maxLevel;
    if(actionObj.exp >= actionObj.expToLevel && !isMaxLevel) {
        if(actionObj.isGenerator) {
            actionObj.exp -= actionObj.expToLevel;
        } else {
            actionObj.exp = 0;
        }
        if(!actionObj.level1Time) {
            actionObj.level1Time = data.secondsPerReset;
        }
        actionObj.level++;
        actionObj.progressMaxBase *= actionObj.progressMaxIncrease;
        actionObj.progressMax = actionObj.progressMaxBase * actionObj.progressMaxMult * calcInstabilityEffect(actionObj.instability);
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

        let isNowMaxLevel = actionObj.maxLevel !== undefined && actionObj.level >= actionObj.maxLevel;
        if (isNowMaxLevel && actionObj.automationOnMax) {
            updateSupplyChain(actionObj.actionVar);
        }

        return true;
    }
    return false;
}

function actionAddExp(actionObj) {
    actionObj.expToAddMult = calcUpgradeMultToExp(actionObj);
    actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
    actionObj.exp += actionObj.expToAdd;
    let dataObj = actionData[actionObj.actionVar];

    for (let i = 0; i < 10; i++) {
        if (!checkLevelUp(actionObj, dataObj)) {
            break;
        }
    }
    //update exp visuals after leveling
    actionObj.expToAddMult = calcUpgradeMultToExp(actionObj);
    actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
}

function statAddAmount(attVar, amount) {
    let attObj = data.atts[attVar];
    if(!attObj) {
        console.log("Tried to add to a stat that doesn't exist: " + attVar);
    }
    if(attVar === "legacy") {
        if(data.gameState === "KTL") {
            amount *= data.legacyMultKTL;
        }
        data.actions.echoKindle.resource += amount;
    }
    attObj.num += amount;
    recalcAttMult(attVar);
    let changedActions = []
    attObj.linkedActionExpAtts.forEach(function (actionVar) {
        data.actions[actionVar].calcStatMult();
        changedActions.push(actionVar);
    })
    attObj.linkedActionEfficiencyAtts.forEach(function (actionVar) {
        data.actions[actionVar].calcAttExpertise();
        changedActions.push(actionVar);
    })

    //update the actions that had their stats changed
    for(let actionVar of changedActions) {
        let actionObj = actionData[actionVar];
        if(actionObj.updateMults) {
            actionObj.updateMults();
        }
    }
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
    if(actionObj.purchased) {
        return;
    }
    actionObj.purchased = true;

    addLogMessage(actionVar, "purchaseAction")
}

function unveilAction(actionVar) {
    let actionObj = data.actions[actionVar];
    let dataObj = actionData[actionVar];
    if (!actionObj || actionObj.visible || !actionObj.purchased) {
        if (!actionObj) {
            console.log('tried to unveil ' + actionVar + ' in error.');
        }
        return;
    }


    addLogMessage(actionVar, "unlockAction")

    if(dataObj.plane === 1) { //Give magic actions an unlock time
        actionObj.unlockTime = data.secondsPerReset;
    }

    actionObj.visible = true;
    revealActionAtts(actionObj);

    if(data.actions[actionVar].automationOnReveal) {
        updateSupplyChain(actionVar);
    }
}


function unveilUpgrade(upgradeVar) {
    let upgradeObj = data.upgrades[upgradeVar];
    if(upgradeObj.visible) {
        return;
    }
    upgradeObj.visible = true;
    views.updateVal(`card_${upgradeVar}`, "flex", "style.display");

    addLogMessage(upgradeVar, "purchaseUpgrade")
}

function addMaxLevel(actionVar, amount) {
    data.actions[actionVar].maxLevel += amount;

    // setUpstreamSlidersToUnlockValue(actionVar); // New line

    if(data.actions[actionVar].automationOnMax) {
        updateSupplyChain(actionVar);
    }
}

//for a given actionVar:
//1. if already exists in the list, return that
//2. if it doesn't exist or is not visible, return false
//3. if it isn't max level, return true
//4. else, if it is max level, recurse down to the children - are any of them not max level and visible? If any are, it makes all their parents yes needed
//5. if none are needed, return false
//6. saves in isNeededList only to prevent recalc with multiple calls via updateSupplyChain
//7. if the action has automationOnMax, i'm pretty sure it shouldn't change anything here - it's still needed or not based on max level
function isNeeded(actionVar, isNeededList = {}) {
    if (isNeededList[actionVar] !== undefined) {
        return isNeededList[actionVar];
    }

    const actionObj = data.actions[actionVar];
    const dataObj = actionData[actionVar];

    if (!actionObj || !actionObj.visible || !actionObj.hasUpstream) {
        isNeededList[actionVar] = false;
        return false;
    }

    const isMaxLevel = actionObj.maxLevel !== undefined && actionObj.level >= actionObj.maxLevel;
    if (!isMaxLevel) {
        isNeededList[actionVar] = true;
        return true;
    }

    if (dataObj.downstreamVars) {
        for (const downstreamVar of dataObj.downstreamVars) {
            if (isNeeded(downstreamVar, isNeededList)) {
                isNeededList[actionVar] = true;
                return true;
            }
        }
    }

    isNeededList[actionVar] = false;
    return false;
}


function updateSupplyChain(startActionVar) {
    const isNeededList = {};
    let currentVar = startActionVar;

    //recurses upwards
    while (currentVar) {
        const actionObj = data.actions[currentVar];
        const dataObj = actionData[currentVar];

        if (!actionObj || actionObj.hasUpstream === false || !dataObj || !dataObj.parentVar) {
            break;
        }

        const parentVar = dataObj.parentVar;
        //recurses downwards to be true if any downstream is needed
        const childIsNeeded = isNeeded(currentVar, isNeededList);

        let currentSliderValue = data.actions[parentVar][`downstreamRate${currentVar}`];

        if (childIsNeeded) {
            //if a child is needed, and slider is off, turn it on
            if (currentSliderValue === 0 && actionObj.automationOnReveal) {
                if(!actionObj.hasBeenUnlocked && currentVar === startActionVar) { //ignore the first time
                    setSliderUI(parentVar, currentVar, 0);
                } else {
                    setSliderUI(parentVar, currentVar, getUpgradeSliderAmount());
                }
            }
        } else if (data.upgrades.knowWhenToMoveOn.upgradePower > 0 && currentSliderValue !== 0 && actionObj.automationOnMax) {
            //if not needed, turn off
            setSliderUI(parentVar, currentVar, 0);
        }

        currentVar = parentVar;
    }

}


function revealActionAtts(actionObj) {
    for(let onLevelAtt of actionObj.onLevelAtts) {
        revealAtt(onLevelAtt[0]);
    }
}

function revealAtt(attVar) {
    // console.log(attVar);
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
    if(actionObj.unlocked === true) {
        return;
    }
    actionObj.hasBeenUnlocked = true;
    actionObj.unlocked = true;
    actionObj.unlockCost = 0;
    actionObj.unlockTime = data.secondsPerReset; //mark when it unlocked
    let dataObj = actionData[actionVar];
    if(dataObj.onUnlock) {
        dataObj.onUnlock();
    }


    // setUpstreamSlidersToUnlockValue(actionVar); // New line

    // updateSupplyChain(actionVar);

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
    //every tick, make sure the mults are updated for visuals
    for(let actionVar in actionData) {
        let actionObj = actionData[actionVar];
        if(actionObj.updateMults) {
            actionObj.updateMults();
        }
    }

    //passive gain
    data.actions.overclock.resource += [0, 5, 20, 50][data.upgrades.startALittleQuicker.upgradePower] * 20 / data.gameSettings.ticksPerSecond;

    if(data.upgrades.keepMyMagicReady.upgradePower) {
        saveMaxChargedSpellPowers();
        data.maxSpellPower = getTotalMaxChargedSpellPower();
    } else {
        data.maxSpellPower = getActiveSpellPower(true);
    }
}

function getUpgradeSliderAmount() {
    return [0, 50, 100][data.upgrades.stopLettingOpportunityWait.upgradePower];
}

//get current info based on upgrade information, generally global or universal stuff. Individual action stuff upgrades get put on the action.
function calcUpgradeMultToExp(actionObj) {
    if(actionObj.plane === 2 || actionObj.isSpell) {
        return 1;
    }
    let upgradeMult = 1;
    if(data.upgrades.rememberWhatIDid.isFullyBought && actionObj.level < actionObj.highestLevel) {
        upgradeMult += .25;
    }
    if(data.upgrades.rememberHowIGrew.isFullyBought && actionObj.level < actionObj.secondHighestLevel) {
        upgradeMult += .25;
    }
    if(data.upgrades.rememberMyMastery.isFullyBought && actionObj.level < actionObj.thirdHighestLevel) {
        upgradeMult += .5;
    }
    return upgradeMult;
}

function isSpellReady(actionVar) {
    let actionObj = data.actions[actionVar];
    return actionObj.level > 0 && !actionObj.isPaused && (!actionObj.cooldown || actionObj.cooldownTimer >= actionObj.cooldown);
}

function useCharge(actionVar) {
    let actionObj = data.actions[actionVar];
    let dataObj = actionData[actionVar]

    actionObj.level--;
    actionObj.instability += dataObj.instabilityToAdd / (actionObj.efficiency/100);

    if(actionObj.cooldown) {
        actionObj.cooldownTimer = 0;
    }
    updateSupplyChain(actionVar);
}

function useActiveSpellCharges() {
    for(let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        if(actionObj.power && actionObj.level > 0 && !actionObj.isPaused) {
            useCharge(actionVar);
        }
    }
}

function getActiveSpellPower(shouldCountPaused) {
    let totalSpellPower = 0;
    for(let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        if(actionObj.power && (shouldCountPaused || !actionObj.isPaused)) {
            totalSpellPower += actionObj.power * actionObj.level;
        }
    }
    return totalSpellPower;
}

function saveMaxChargedSpellPowers() {
    for(let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        if(actionObj.power) {
            if(!data.chargedSpellPowers[actionVar]) {
                data.chargedSpellPowers[actionVar] = 0;
            }
            if(actionObj.power * actionObj.level > data.chargedSpellPowers[actionVar]) {
                data.chargedSpellPowers[actionVar] = actionObj.power * actionObj.level;
            }
        }
    }
}

function getTotalMaxChargedSpellPower() {
    let total = 0;
    for(let actionVar in data.chargedSpellPowers) {
        total += data.chargedSpellPowers[actionVar];
    }
    return total;
}


const bonusCodes = {};
function addBonusCode(code, rewardFunction, message = "") {
    const trimmed = code.trim().replace(/^"+|"+$/g, "");
    bonusCodes[trimmed] = { reward: rewardFunction, message };
}

function applyBonusCode() {
    const input = document.getElementById("bonusCodeInput");
    const message = document.getElementById("bonusCodeMessage");

    let code = input.value.trim();
    if (code.startsWith('"') && code.endsWith('"')) {
        code = code.slice(1, -1).trim();
    }

    const bonus = bonusCodes[code];

    if (!bonus) {
        message.style.color = "red";
        message.textContent = "Invalid code.";
        return;
    }

    if (data.gameSettings.redeemedBonusCodes[code]) {
        message.style.color = "red";
        message.textContent = "Code already used.";
        return;
    }

    bonus.reward();
    data.gameSettings.redeemedBonusCodes[code] = true;

    message.style.color = "green";
    message.textContent = `Success! Bonus applied. ${bonus.message}`;
}

addBonusCode("link", function () {
    data.currentGameState.bonusTime += 1000 * 60 * 60;
}, "You received 1 hour of bonus time!");

addBonusCode("gift", function () {
    data.currentGameState.bonusTime += 1000 * 60 * 60;
}, "Enjoy this 1-hour gift of bonus time!");

addBonusCode("book", function () {
    data.currentGameState.bonusTime += 1000 * 60 * 30;
}, "Thanks for reading! Here’s 30 bonus minutes.");

addBonusCode("sorry!", function () {
    data.currentGameState.bonusTime += 1000 * 60 * 60 * 12;
}, "Sorry about that! You’ve received 12 hours of bonus time.");

addBonusCode("trythis1", function () {
    data.currentGameState.bonusTime += 1000 * 60 * 60 * 24;
}, "Does this work? You got 24 hours of bonus time.");


addBonusCode("loopers", function () {
    data.currentGameState.bonusTime += 1000 * 60 * 60 * 24;
}, "Thank you for everything!");
addBonusCode("squirrel", function () {
    data.currentGameState.bonusTime += 1000 * 60 * 60 * 10;
}, "Nuts!");
addBonusCode("nothing", function () {
    data.currentGameState.bonusTime += 1000 * 60 * 60 * 24;
}, "There was nothing there - except 24 hours bonus time.");




//function to be used as a debug helper, running in console
//adjustActionData('', 'progressMaxBase', 1e6)
//adjustActionData('', 'efficiencyBase', .1)
function adjustActionData(actionVar, key, value) {
    let actionObj = data.actions[actionVar];
    actionObj[key] = value;
    if(['progressMaxBase', 'progressMaxMult'].includes(key)) {
        actionObj.progressMax = actionObj.progressMaxBase * actionObj.progressMaxMult * calcInstabilityEffect(actionObj.instability);
    }
    if(['efficiencyBase', 'efficiencyMult'].includes(key)) {
        actionObj.expertise = actionObj.efficiencyBase * actionObj.efficiencyMult;
        actionObj.efficiency = actionObj.expertise > 1 ? 100 : actionObj.expertise * 100;
        actionObj.actionPower = actionObj.actionPowerBase * actionObj.actionPowerMult * (actionObj.efficiency/100);
    }
}


