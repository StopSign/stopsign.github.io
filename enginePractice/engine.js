
function createAndLinkNewStat(statVar) {
    data.statNames.push(statVar);
    if(!data.stats[statVar]) {
        data.stats[statVar] = {};
    }
    let statObj = data.stats[statVar];
    statObj.statVar = statVar;
    statObj.num = 0;
    statObj.perSecond = 0;
    statObj.mult = 1;
    statObj.linkedActionVars = [];
    statObj.add = function (amount) {
        statObj.num += amount;
        statObj.mult = Math.pow(1.01, statObj.num); //calc only when adding
        statObj.linkedActionVars.forEach(function (actionVar) {
            data.actions[actionVar].calcStatMult();
        })
    }

    view.create.generateStatDisplay(statVar);
}




//function createAndLinkNewAction(actionVar, expToLevelIncrease, actionPowerMultIncrease, progressMaxIncrease, progressMax, expToLevel, unlockCost, title, x, y, downstreamVars, tier, dataObj) {
function createAndLinkNewAction(actionVar, dataObj, title, x, y, downstreamVars) {
    data.actionNames.push(actionVar);
    if(!data.actions[actionVar]) {
        data.actions[actionVar] = {};
    }

    let actionObj = data.actions[actionVar];
    actionObj.downstreamVars = downstreamVars ? downstreamVars : [];
    actionObj.isGenerator = dataObj.isGenerator;
    actionObj.actionVar = actionVar;
    actionObj.resolve = 0;
    actionObj.progress = 0;
    actionObj.progressGain = 0; //calculated based on resolve & tier
    actionObj.progressMaxBase = dataObj.progressMaxBase ? dataObj.progressMaxBase : 1;
    actionObj.progressMaxMult = dataObj.progressMaxMult ? dataObj.progressMaxMult : 1;
    actionObj.progressMax = actionObj.progressMaxBase * actionObj.progressMaxMult;
    actionObj.completions = 0;
    actionObj.actionPowerBase = dataObj.actionPowerBase ? dataObj.actionPowerBase : 1;
    actionObj.actionPowerMult = dataObj.actionPowerMult ? dataObj.actionPowerMult : 1;
    actionObj.actionPowerFunction = dataObj.actionPowerFunction;
    actionObj.actionPower = actionObj.actionPowerFunction ? actionObj.actionPowerFunction(actionObj.actionPowerBase * actionObj.actionPowerMult) :
        actionObj.actionPowerBase * actionObj.actionPowerMult;
    actionObj.level = 0;
    actionObj.exp = 0;
    actionObj.expToLevelBase = dataObj.expToLevelBase ? dataObj.expToLevelBase : 1;
    actionObj.expToLevelMult = dataObj.expToLevelMult ? dataObj.expToLevelMult : 1;
    actionObj.expToLevel = actionObj.expToLevelBase * actionObj.expToLevelMult; //can be divided
    actionObj.expToAddBase = 1;
    actionObj.expToAddMult = 1;
    actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
    actionObj.resolve = 0;
    actionObj.resolveIncoming = 0;
    actionObj.resolveDelta = 0;
    actionObj.resolveName = dataObj.resolveName ? dataObj.resolveName : "resolve";
    actionObj.downstreamRate = 0;
    actionObj.expToLevelIncrease = dataObj.expToLevelIncrease; //Can be played with w/o issue at beginning of run
    actionObj.actionPowerMultIncrease = dataObj.actionPowerMultIncrease ? dataObj.actionPowerMultIncrease : 1; //actionPowerMultIncrease must always > progressMaxIncrease on non-flat
    actionObj.progressMaxIncrease = dataObj.progressMaxIncrease;
    actionObj.x = x;
    actionObj.y = y;
    actionObj.title = title;
    actionObj.onLevelStats = dataObj.onLevelStats ? dataObj.onLevelStats : [];
    actionObj.statMods = dataObj.statMods ? dataObj.statMods : [];
    actionObj.parent = null;
    actionObj.unlockCost = dataObj.unlockCost;
    actionObj.unlocked = dataObj.unlocked === null ? true : dataObj.unlocked;
    actionObj.visible = (globalVisible || dataObj.visible === null) ? true : dataObj.visible;
    actionObj.maxLevel = dataObj.maxLevel ? dataObj.maxLevel : -1;
    actionObj.tier = dataObj.tier;
    actionObj.onUnlock = dataObj.onUnlock ? dataObj.onUnlock : function() {};
    actionObj.onCompleteCustom = dataObj.onComplete;
    actionObj.onCompleteText = (dataObj.onCompleteText && dataObj.onCompleteText[language]) ? dataObj.onCompleteText[language] : "";
    actionObj.storyText = (dataObj.storyText && dataObj.storyText[language]) ? dataObj.storyText[language] : "";
    actionObj.extraInfo = (dataObj.extraInfo && dataObj.extraInfo[language]) ? dataObj.extraInfo[language] : "";
    actionObj.expertiseBase = dataObj.expertiseBase ? dataObj.expertiseBase : 0;
    actionObj.expertiseMult = dataObj.expertiseMult ? dataObj.expertiseMult : 1;
    actionObj.expertise = actionObj.expertiseBase * actionObj.expertiseMult;
    actionObj.efficiencyInitial = dataObj.efficiencyInitial ? dataObj.efficiencyInitial : 100;
    actionObj.expertiseCalc = Math.pow(1.001, actionObj.expertise);
    let calc = actionObj.expertiseCalc * actionObj.efficiencyInitial;
    actionObj.efficiency = calc > 100 ? 100 : calc;
    actionObj.onCompleteBasic = function() {
        actionObj.completions += 1;
        actionObj.exp += actionObj.expToAdd;
        while(actionObj.exp >= actionObj.expToLevel) { //on level TODO handle more gracefully instead of a while
            actionObj.exp -= actionObj.expToLevel;
            actionObj.level++;
            actionObj.progressMaxBase *= actionObj.progressMaxIncrease;
            actionObj.progressMax = actionObj.progressMaxBase * actionObj.progressMaxMult;
            actionObj.expToLevelBase *= actionObj.expToLevelIncrease;
            actionObj.expToLevel = actionObj.expToLevelBase * actionObj.expToLevelMult;
            actionObj.calcActionPower();
            actionObj.onLevelStats.forEach(function (statObj) {
                let name = statObj[0];
                let amount = statObj[1];
                data.stats[name].add(amount);
            });
            actionObj.onLevelCustom ? actionObj.onLevelCustom() : "";
        }
    }
    actionObj.calcActionPower = function() {
        actionObj.actionPowerMult *= actionObj.actionPowerMultIncrease;
        actionObj.actionPower = actionObj.actionPowerFunction ? actionObj.actionPowerFunction(actionObj.actionPowerBase * actionObj.actionPowerMult) :
            actionObj.actionPowerBase * actionObj.actionPowerMult;
    }

    actionObj.progressRate = function() { //Rate of drain for resolve
        if(actionObj.isGenerator) {
            return 1 / ticksPerSecond;
        }
        return actionObj.progressRateReal();
    }
    actionObj.progressRateReal = function() { //For data around the flat action too
        return actionObj.resolve * actionObj.tierMult() / 100 / ticksPerSecond;
    }
    actionObj.calcStatMult = function() {
        actionObj.expToLevelMult = 1;

        actionObj.statMods.forEach(function(statMod) {
            let name = statMod[0];
            let ratio = statMod[1];
            if(!data.stats[name]) {
                console.log("need to instantiate " + name);
                return;
            }
            let effect = ((data.stats[name].mult-1) * ratio) + 1;
            actionObj[name+"Bonus"] = effect;
            actionObj.expToLevelMult /= effect;
        })
        actionObj.expToLevel = actionObj.expToLevelBase * actionObj.expToLevelMult;
        //console.log(actionObj.expToLevelMult, actionObj.expToLevel);
    }
    actionObj.tierMult = function() {
        return 1/Math.pow(10, actionObj.tier);
    }

    return actionObj;
}

function updateAllActionStatMults() {
    data.actionNames.forEach(function (name) {
        let obj = data.actions[name];
        obj.calcStatMult();
    })
}
function unveilAction(actionVar) {
    if(data.actions[actionVar]) {
        data.actions[actionVar].visible = true;
    }
}