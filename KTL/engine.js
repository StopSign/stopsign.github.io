
function getInstabilityReduction(instability) {
    return Math.sqrt(data.atts.control.attMult) * Math.sqrt(instability/100)/100;
}

function calcInstabilityEffect(instability) {
    return Math.pow(1+instability/100, 2)
}

function tickGameObject(actionVar) {
    let actionObj = data.actions[actionVar];
    let dataObj = actionData[actionVar];

    if (!actionObj.isRunning) {
        return;
    }
    let upgradeMult = actionVar === "tidalBurden" ? 1 : Math.pow(1.1, data.upgrades.extraConsumptionRate.upgradePower)

    let momentumMaxRate = dataObj.isGenerator ? dataObj.generatorSpeed / data.gameSettings.ticksPerSecond :
        (actionObj.resource * calcTierMult(dataObj.tier) * upgradeMult / data.gameSettings.ticksPerSecond);
    if(dataObj.isGenerator && actionObj.isPaused) {
        momentumMaxRate = 0;
    }
    let isMaxLevel = actionObj.maxLevel !== undefined && actionObj.level >= actionObj.maxLevel;
    let momentumToAdd = (!actionObj.unlocked || (!dataObj.generatesPastMax && isMaxLevel)) ? 0 : momentumMaxRate;
    let resourceToAddInefficient = momentumToAdd * (actionObj.efficiency / 100);

    resourceToAddInefficient = resourceToAddInefficient < .0000001 ? 0 : resourceToAddInefficient;

    // Update progress and set the progressGain rate for this tick.
    actionObj.progress += resourceToAddInefficient;
    actionObj.progressGain = resourceToAddInefficient * data.gameSettings.ticksPerSecond;

    // For non-generators, consume the resource used to generate progress.
    if (!dataObj.isGenerator && !dataObj.ignoreConsume) {
        if(actionVar === "tidalBurden") {
            actionObj.resource -= resourceToAddInefficient
        } else {
            let consumptionReduction = Math.max(0, 1 - (data.shopUpgrades.focusBarsImproveEfficiency.upgradePower * .25 * actionObj.connectedLines));
            actionObj.resource -= resourceToAddInefficient * (1-data.upgrades.reduceResourcesConsumed.upgradePower*.05) * consumptionReduction;
        }
    }

    if(actionObj.instability > 0) {
        actionObj.instability -= getInstabilityReduction(actionObj.instability) / data.gameSettings.ticksPerSecond;
        actionObj.progressMax = actionObj.progressMaxBase * actionObj.progressMaxMult * calcInstabilityEffect(actionObj.instability);
        if(actionObj.instability < 0) {
            actionObj.instability = 0;
        }
    }

    // Level up to 10 times per tick if progress is sufficient.
    for (let i = 0; i < 10 / (data.gameSettings.ticksPerSecond / 20); i++) {
        if (!checkProgressCompletion(actionObj, dataObj)) {
            break;
        }
    }

    calculateTaken(actionVar, true);

    //Calc resource retrieval, to be sent after all the ticks are done to not interfere with resourceIncrease
    let isQuiet = actionObj.unlocked && isMaxLevel && actionObj.resourceIncrease === 0 && actionObj.totalSend === 0;
    if(!isQuiet || !dataObj.hasUpstream || data.upgrades.retrieveMyUnusedResources.upgradePower === 0 || resourceHeads[dataObj.resourceName] === actionVar || data.gameState === "KTL" || actionVar === "reinvest") {
        actionObj.resourceRetrieved = 0;
    } else {
        actionObj.resourceRetrieved = (actionObj.resource/100 * [0, 1, 2, 5][data.upgrades.retrieveMyUnusedResources.upgradePower] + 10) / data.gameSettings.ticksPerSecond;
        if(actionObj.resourceRetrieved > actionObj.resource) {
            actionObj.resourceRetrieved = actionObj.resource;
        }
    }
}


function calcProgressRateReal(actionVar) {
    let actionObj = data.actions[actionVar];
    let dataObj = actionData[actionVar];

    return actionObj.resource * calcTierMult(dataObj.tier) * (actionObj.efficiency/100) / data.gameSettings.ticksPerSecond;
}

//calcEfficiency calcExpertise
function calcAttExpertise(actionVar, updateView = false) {
    let actionObj = data.actions[actionVar];
    let capLevel = data.upgrades.higherSpeedCaps.upgradePower;

    let overcapMax = capLevel * 0.1;
    let maxIndProgress = 1 + overcapMax;

    let totalProgress = 0;
    let statCount = 0;
    let zeroIdealMult = 1;

    let hasPositive = false;
    let hasZero = false;

    for (let [name, ideal] of actionObj.efficiencyAtts) {
        let attData = data.atts[name];
        if (!attData) {
            console.log(`You need to instantiate the attribute ${name}`);
            continue;
        }

        let val = attData.num;

        if (ideal === 0) {
            zeroIdealMult *= attData.attMult;
            hasZero = true;

            if (updateView) {
                views.updateVal(`${actionVar}_${name}AttCurrentNum`, val, "textContent", 1);
                views.updateVal(`${actionVar}_${name}AttCurrentMult`, attData.attMult, "textContent", 2);
            }
        } else {
            let ratio = Math.max(val / ideal, 0);
            let indProgress = ratio > 1 ? 1 + ((ratio - 1) * 0.1) : ratio;
            indProgress = Math.min(indProgress, maxIndProgress);

            totalProgress += indProgress;
            statCount++;
            hasPositive = true;

            if (updateView) {
                views.updateVal(`${actionVar}_${name}AttCurrentNum`, val, "textContent", 1);
                views.updateVal(`${actionVar}_${name}AttProgressPerc`, indProgress * 100, "textContent", 1);
            }
        }
    }

    let avgProgress = statCount > 0 ? (totalProgress / statCount) : 1;

    let progressMult = Math.min(avgProgress, 1);
    let overcapMult = Math.max(avgProgress, 1);

    if (updateView) {
        if (hasPositive) {
            let baseDisplayStr = intToString(progressMult * 100, 1);
            let overcapDisplayStr = avgProgress <= 1 ? "" : ` (${intToString(avgProgress * 100, 1)})`;

            views.updateVal(`${actionVar}AttAverageProgress`, baseDisplayStr + overcapDisplayStr, "textContent");

            let overcapDisplayRaw = Math.max(Math.min((avgProgress - 1) * 100, overcapMax * 100), 0);
            views.updateVal(`${actionVar}AttOvercap`, overcapDisplayRaw, "textContent", 2);
        }
        if (hasZero) {
            views.updateVal(`${actionVar}AttTotalBonus`, zeroIdealMult, "textContent", 2);
        }
    }

    let rawExpertise = Math.pow(actionObj.efficiencyBase, 1 - progressMult) * zeroIdealMult * overcapMult;

    actionObj.expertise = Math.min(rawExpertise, 1 + overcapMax);
    actionObj.efficiency = actionObj.expertise * 100;
}

function calcTierMult(tier) {
    return 1/Math.pow(10, tier) / 10;
}

function isAttentionLine(actionVar, downstreamVar) {
    for(let focusObj of data.focusSelected) {
        if(focusObj.lineData.from === actionVar && focusObj.lineData.to === downstreamVar) {
            return true;
        }
    }
    return false;
}




















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
        calcAttExpertise(actionVar);
        actionObj.actionPower = actionObj.actionPowerBase * actionObj.actionPowerMult * (actionObj.efficiency/100);
    }
}


function resetRun() {
    //essentially an amulet use but without gain
    //also on amulet use needs to save the state of anything that can be perma-gained during the run:
    //legacy&highest, infusion 2 actions, infusion & magic unlock costs, KTL log, perma-focus
    //then revert to this state

    //does a
}

function saveState() {
    if(!data.savedState) { data.savedState = {}}
    data.savedState.highestLegacy = data.highestLegacy;
    data.savedState.legacy = data.legacy;
}