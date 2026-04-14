
//Handling automationOnReveal behavior - thanks obliv for the algorithm
//Triggered when action is revealed, max level increased, or level decreased (charges used)
function enableAutomationUpwards(actionVar, isForced) {
    if(data.upgrades.stopLettingOpportunityWait.upgradePower === 0 || actionData[actionVar].plane === 2) {
        return;
    }

    //If target node’s “enable” automation slider is off, or if the node is being revealed for the very first time ever, then do nothing.
    //This is not part of the loop. We don’t check the slider for any upstream actions.
    if(!isForced && (data.actions[actionVar].automationOnReveal === 0 || !data.actions[actionVar].hasBeenUnlocked)) {
        return;
    }

    let currentTarget = actionVar;
    //Start of loop. If target node is a root node (Overclock, Pool Mana), then break the loop.
    while(actionData[currentTarget].hasUpstream || actionData[currentTarget].keepParentAutomation) {
        let actionObj = data.actions[currentTarget];
        let dataObj = actionData[currentTarget];

        let parentVar = dataObj.parentVar;
        let parentObj = data.actions[parentVar];

        //If the slider from the upstream node is exactly zero, then update it to the automation default value. Use the current target node’s Temper My Desires slider if unlocked and not zero. Otherwise, it’s a fixed 50% or 100% based on amulet perks.
        if(dataObj.hasUpstream && parentObj[`downstreamRate${currentTarget}`] === 0) {
            setSliderUI(parentVar, currentTarget, isForced?100:actionObj.automationOnReveal)
        }

        //Change target node to the upstream node (where the send slider may have changed). Loop again
        currentTarget = parentVar
    }
}

//Handling automationCanDisable behavior - thanks obliv for the algorithm
//Triggered when an action reaches max level.
function disableAutomationUpwards(actionVar, isForced) {
    if(data.upgrades.knowWhenToMoveOn.upgradePower === 0 || actionData[actionVar].plane === 2) {
        return;
    }

    if(isForced) {
        if(actionData[actionVar].hasUpstream) {
            setSliderUI(actionData[actionVar].parentVar, actionVar, 0);
        }
        if(actionData[actionVar].hasUpstream || actionData[actionVar].keepParentAutomation) {
            disableAutomationUpwards(actionData[actionVar].parentVar)
        }
    }

    let currentTarget = actionVar;
    //Start of loop. If target is a root node (Overclock, Pool Mana) then stop the loop.
    while(actionData[currentTarget].hasUpstream || actionData[currentTarget].keepParentAutomation) {
        let actionObj = data.actions[currentTarget];
        let dataObj = actionData[currentTarget];

        //If the automation slider to disable the target node at max level is disabled, then stop the loop.
        if (!actionObj.automationCanDisable) {
            return;
        }

        //If the automation slider to disable the target node at max level is disabled, then stop the loop.
        const hasMaxLevel = actionObj.maxLevel !== undefined;
        if (hasMaxLevel && !actionObj.automationCanDisable) {
            return;
        }

        //If this node has a max level but has not yet reached it, then stop the loop.
        if (hasMaxLevel && actionObj.level < actionObj.maxLevel) {
            return;
        }

        //If the upstream send rate slider is already 0%, then stop the loop.
        let parentVar = dataObj.parentVar;
        if (dataObj.hasUpstream && data.actions[parentVar][`downstreamRate${currentTarget}`] === 0) {
            return;
        }

        for (const downstreamVar of dataObj.downstreamVars) {
            const downstreamObj = data.actions[downstreamVar];
            let downstreamDataObj = actionData[downstreamVar];
            if(!downstreamObj) {
                console.log(`error on downstream ${downstreamVar} of ${currentTarget}`)
            }

            if (!downstreamObj.visible) {
                continue;
            }
            if (downstreamDataObj.keepParentAutomation) {
                const hasMaxLevel = downstreamObj.maxLevel !== undefined;
                // If downstream target has been prohibited from being disabled then stop the loop.
                if (hasMaxLevel && !downstreamObj.automationCanDisable) {
                    return;
                }
                // If downstream target is an action with a maximum level that isn't at level cap then stop the loop.
                if (!isForced && hasMaxLevel && downstreamObj.level < downstreamObj.maxLevel) {
                    return;
                }
            }
            //If target has ANY enabled downstream path (slider set to a nonzero value), then stop the loop.
            else if (actionObj[`downstreamRate${downstreamVar}`] > 0) {
                return;
            }
        }

        // All checks passed. Set the send rate slider from the upstream node to 0%.
        if(dataObj.hasUpstream) {
            setSliderUI(dataObj.parentVar, currentTarget, 0);
        }

        // Change the target node to the upstream node (the one whose downstream slider we just changed) and go to 2.
        currentTarget = dataObj.parentVar;
    }
}




function calcTimeToUnlock(actionVar) {

}

function calcTimeToLevel(actionObj) {
    let timeToFinishCurrentCycle = (actionObj.progressMax - actionObj.progress) / actionObj.progressGain;
    let expAfterCurrentCycle = actionObj.exp + actionObj.expToAdd;
    let remainingExpNeeded = Math.max(0, actionObj.expToLevel - expAfterCurrentCycle);
    let fullCyclesNeeded = Math.ceil(remainingExpNeeded / actionObj.expToAdd);
    let timePerFullCycle = actionObj.progressMax / actionObj.progressGain;
    return timeToFinishCurrentCycle + (fullCyclesNeeded * timePerFullCycle);
}
function calcTimeToMax(actionVar) {
    let actionObj = data.actions[actionVar];

    // 1. Sanitize Milestones
    // Filter invalid (-1), past, or out-of-bounds milestones
    let rawMilestones = [
        actionObj.thirdHighestLevel,
        actionObj.secondHighestLevel,
        actionObj.highestLevel
    ];

    let milestones = rawMilestones
        .filter(m => m > actionObj.level && m < actionObj.maxLevel)
        .sort((a, b) => a - b);

    // Always finish at maxLevel
    milestones.push(actionObj.maxLevel);
    milestones = [...new Set(milestones)];

    // 2. Setup Simulation Variables
    let totalTime = 0;

    let vLevel = actionObj.level;
    let vExp = actionObj.exp;
    let vProgress = actionObj.progress;
    let vProgressMax = actionObj.progressMax;
    let vExpToLevel = actionObj.expToLevel;

    // 3. Loop through stages
    for (let targetLevel of milestones) {
        let levelsToJump = targetLevel - vLevel;
        if (levelsToJump <= 0) continue;

        let expMult = calcUpgradeMultToExp(actionVar, vLevel);

        let baseExp = actionObj.expToAddBase !== undefined ? actionObj.expToAddBase : (actionObj.expToAdd / actionObj.expToAddMult);
        let effectiveExpAdd = baseExp * expMult;

        // A. Time for the VERY NEXT level (handles partial progress)
        let t1 = getTimeForSingleLevel(
            vProgress, vProgressMax,
            vExp, vExpToLevel,
            effectiveExpAdd, actionObj.progressGain,
            actionObj.isGenerator
        );
        totalTime += t1;

        if (!isFinite(totalTime)) return Infinity;

        // B. Geometric Series for the REST of the levels in this stage
        let remainingLevels = levelsToJump - 1;

        if (remainingLevels > 0) {
            let rp = actionObj.progressMaxIncrease;
            let re = actionObj.expToLevelIncrease;
            let R = rp * re;

            // Scale up for the start of the series (Level + 1)
            let nextPMax = vProgressMax * rp;
            let nextEToL = vExpToLevel * re;

            let completionsNeeded = actionObj.isGenerator
                ? nextEToL / effectiveExpAdd
                : Math.ceil(nextEToL / effectiveExpAdd);

            let timePerBar = nextPMax / actionObj.progressGain;
            let a = completionsNeeded * timePerBar;

            let timeForSeries = 0;
            if (R === 1) {
                timeForSeries = a * remainingLevels;
            } else {
                let geometricTerm = Math.pow(R, remainingLevels);
                if (!isFinite(geometricTerm)) return Infinity;
                timeForSeries = a * (geometricTerm - 1) / (R - 1);
            }
            totalTime += timeForSeries;
        }

        // C. Update Virtual State for next stage
        let scaleFactorP = Math.pow(actionObj.progressMaxIncrease, levelsToJump);
        let scaleFactorE = Math.pow(actionObj.expToLevelIncrease, levelsToJump);

        vProgressMax *= scaleFactorP;
        vExpToLevel *= scaleFactorE;
        vLevel = targetLevel;
        vProgress = 0;
        vExp = 0;
    }

    return totalTime;
}

function getTimeForSingleLevel(progress, pMax, exp, eToLevel, eAdd, pGain, isGenerator) {
    let timeToFinishBar = (pMax - progress) / pGain;

    let expAfterBar = exp + eAdd;
    let expRemaining = Math.max(0, eToLevel - expAfterBar);

    let barsNeeded = 0;
    if (isGenerator) {
        // Generators don't waste overflow exp
        barsNeeded = expRemaining / eAdd;
    } else {
        // Normal actions need full completions
        barsNeeded = Math.ceil(expRemaining / eAdd);
    }

    let timeForExtraBars = barsNeeded * (pMax / pGain);
    return timeToFinishBar + timeForExtraBars;
}



function registerListener(targetKey, sourceKey) {
    const targetObj = data.actions[targetKey];
    if (!targetObj.listeningActions) targetObj.listeningActions = [];

    if (!targetObj.listeningActions.includes(sourceKey)) {
        targetObj.listeningActions.push(sourceKey);
    }
}

function unregisterListener(targetKey, sourceKey) {
    const targetObj = data.actions[targetKey];
    if (!targetObj || !targetObj.listeningActions) return;

    const sourceObj = data.actions[sourceKey];
    const stillHasConnection = sourceObj.customTriggers.some(t => t.targetKey === targetKey);

    if (!stillHasConnection) {
        targetObj.listeningActions = targetObj.listeningActions.filter(key => key !== sourceKey);
    }
}

function checkIncomingTriggers(targetActionVar) {
    const targetObj = data.actions[targetActionVar];

    if (!targetObj.listeningActions || targetObj.listeningActions.length === 0) {
        return;
    }

    // Tell each listening action to check its own trigger queue
    targetObj.listeningActions.forEach(sourceKey => {
        processTriggerQueue(sourceKey);
    });
}

function processTriggerQueue(actionVar) {
    let actionObj = data.actions[actionVar];
    if (!actionObj.customTriggers || actionObj.customTriggers.length === 0) return;

    actionObj.customTriggers.sort((a, b) => a.order - b.order);

    let firedAny = false;

    while (actionObj.currentCustomNum < actionObj.customTriggers.length) {
        let activeTrigger = actionObj.customTriggers[actionObj.currentCustomNum];

        if (activeTrigger.hasFired) {
            actionObj.currentCustomNum++;
            firedAny = true;
            continue;
        }

        let targetObj = data.actions[activeTrigger.targetKey];
        let conditionMet = evaluateCondition(activeTrigger, targetObj);

        if (conditionMet) {
            executeTriggerReward(actionVar, activeTrigger);
            activeTrigger.hasFired = true;
            actionObj.currentCustomNum++;
            firedAny = true;
        } else {
            break;
        }
    }

    if (firedAny) {
        rebuildCustomTriggersUI(actionVar);
    }
}

function evaluateCondition(trigger, targetObj) {
    if (trigger.condition === 'unlocked') {
        return targetObj.unlocked;
    }
    else if (trigger.condition === 'max') {
        return targetObj.level >= targetObj.maxLevel;
    }
    else if (trigger.condition === 'specific') {
        return targetObj.level >= trigger.amount;
    }
    return false;
}

function executeTriggerReward(actionVar, trigger) {
    let dataObj = actionData[actionVar];
    let parentVar = dataObj.parentVar;

    if (dataObj.hasUpstream) {
        if (!trigger.recurse) {
            setSliderUI(parentVar, actionVar, trigger.rewardVal);
        } else {
            if (trigger.rewardVal > 0) {
                enableAutomationUpwards(actionVar, true);
                setSliderUI(parentVar, actionVar, trigger.rewardVal);
            } else {
                disableAutomationUpwards(actionVar, true);
            }
        }
    }
}

