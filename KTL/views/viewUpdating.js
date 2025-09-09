let view = {
    cached: {}, //contains the elements that are being iterated over and updated regularly,
    prevValues: {},
    scheduled: [],
};

/*
Types of views:
update: run once a frame
generate: functions to return an html that's made in a loop
create: functions to put the pieces on the page. Uses generate methods.

 */

let totalVisible = [];

let views = {
    updateViewAtFrame: function() { //This is the main view update function that is run once per frame
        views.updateActionsAtFrame();

        views.updateScheduled();
    },
    updateView: function() {
        views.updateActions();
        views.updateStats();

        updateGlobals();
    },
    updateViewOnSecond: function() {
        showAllValidToasts();
        drawChart();

        let toShowUseAmulet = data.useAmuletButtonShowing && data.gameState === "KTL";
        views.updateVal(`openUseAmuletButton`, toShowUseAmulet ? "" : "none", "style.display");

        let toViewAmulet = data.doneAmulet && data.gameState !== "KTL";
        views.updateVal(`ancientCoinDisplay`, data.doneKTL ? "" : "none", "style.display");

        views.updateVal(`spellPowerDisplay`, data.totalSpellPower > 0 ? "" : "none", "style.display");

        views.updateVal(`jobDisplay`, data.displayJob ? "" : "none", "style.display");

        let shouldShowKTLButton = data.actions.hearAboutTheLich.level >= 1 && data.totalSpellPower > 0 && data.gameState !== "KTL";
        views.updateVal(`killTheLichMenuButton2`, shouldShowKTLButton?"":"none", "style.display")
    },
    scheduleUpdate: function(elementId, value, type) {
        view.scheduled.push({
            id:elementId,
            value:value,
            type:type
        })
    },
    updateScheduled: function() { //Comes from async processes in data, like onComplete
        for(let scheduled of view.scheduled) {
            views.updateVal(scheduled.id, scheduled.value, scheduled.type);
        }
        view.scheduled = [];
    },
    updateStats:function() {
        for(let attVar in data.atts) {
            views.updateStat(attVar);
        }
    },
    updateStat:function(attVar) {
        let attObj = data.atts[attVar];

        //Handle visibility
        let isVisible = (attObj.unlocked || globalVisible);
        views.updateVal(`${attVar}AttContainer`, isVisible?"":"none", "style.display");
        if(!isVisible) {
            return;
        }

        views.updateVal(`${attVar}AttUpgradeMultContainer`, attObj.attUpgradeMult > 1?"":"none", "style.display");

        //Update the numbers
        let roundedNumbers = [["num", 2], ["attMult", 2], ["attUpgradeMult", 3]]; //["perMinute", 2],

        for(let numberObj of roundedNumbers) {
            let capName = capitalizeFirst(numberObj[0]);
            views.updateVal(`${attVar}${capName}`, data.atts[attVar][`${numberObj[0]}`], "textContent", numberObj[1]);
        }
    },
    updateActionsAtFrame:function() {
        for(let actionVar in data.actions) {
            let actionObj = data.actions[actionVar];
            views.updateAction(actionObj);
        }
    },
    updateActions:function() {
        views.updateAura();
    },
    updateAura:function() {
        let resourceAmounts = {};

        for (let actionVar in data.actions) {
            let actionObj = data.actions[actionVar];
            let resourceName = actionObj.resourceName;
            let resourceAmount = actionObj.resource;

            if (!resourceAmounts[resourceName]) {
                resourceAmounts[resourceName] = [];
            }

            resourceAmounts[resourceName].push({
                id: actionVar,
                amount: resourceAmount
            });
        }

        for (let resourceName in resourceAmounts) {
            let list = resourceAmounts[resourceName];
            let maxAmount = Math.max(...list.map(entry => entry.amount));

            for (let entry of list) {
                let ratio = maxAmount > 0 ? entry.amount / maxAmount : 0;
                let actionObj = data.actions[entry.id];
                let mod = actionObj.resourceName === "momentum" ? 100 : 1000;
                if(maxAmount < mod) {
                    ratio *= maxAmount/mod; //scale first 1000 smoother.
                }

                let color = getResourceColorDim(actionObj);

                views.updateVal(`${entry.id}Container`,`${color} 0px 0px ${Math.floor(ratio * 100)/2}px ${Math.floor(ratio * 50)/2}px`,"style.boxShadow");
                views.updateVal(`${entry.id}LargeVersionContainer`,`inset ${color} 0px 0px ${Math.floor(ratio * 20)/2}px ${Math.floor(ratio * 10)/2}px`,"style.boxShadow");
                // views.updateVal(`${entry.id}SmallVersionContainer`,`inset ${getResourceColor(actionObj)} 0px 0px ${Math.min(ratio * 15)}px ${Math.min(ratio * 5)}px`,"style.boxShadow");
            }
        }
    },
    updateAction:function(actionObj) {
        //Handle visibility
        if(!views.updateActionVisibility(actionObj)) {
            return; //If not visible or in small mode, don't update
        }

        views.updateActionSharedViews(actionObj);
        if(!actionObj.unlocked) {
            views.updateActionLockedViews(actionObj);
        } else {
            views.updateActionUnlockedViews(actionObj);
        }
    },
    updateActionVisibility: function(actionObj) {
        let actionVar = actionObj.actionVar;
        let dataObj = actionData[actionVar];
        let parentVar = dataObj.parentVar;

        //if game state doesn't match, return
        if(dataObj.plane !== data.planeTabSelected) {
            return false;
        }
        let toDisplay = actionObj.visible || globalVisible;
        let isInRange = isActionVisible(actionVar);
        views.updateVal(`${actionVar}Container`, toDisplay&&isInRange?"":"none", "style.display");

        if(parentVar) {
            let parentObj = data.actions[parentVar];
            let parentInRange = isActionVisible(parentVar);
            views.updateVal(`${parentVar}_${actionVar}_Line_Outer`, (globalVisible||(toDisplay&&parentObj.visible&&(parentInRange||isInRange))) && !dataObj.hideUpstreamLine ?"flex":"none", "style.display");
            views.updateVal(`${parentVar}_${actionVar}_Line_Inner`, toDisplay && parentObj.visible ?"":"none", "style.display");
        }

        if(!toDisplay || !isInRange) {
            return false; //don't update other numbers
        }

        let miniVersion = scaleByPlane[data.planeTabSelected] < .55;
        let isMaxLevel = actionObj.maxLevel !== undefined && actionObj.level >= actionObj.maxLevel;
        views.updateVal(`${actionVar}LargeVersionContainer`, !miniVersion?"":"none", "style.display");
        views.updateVal(`${actionVar}SmallVersionContainer`, miniVersion?"":"none", "style.display");
        views.updateVal(`${actionVar}Container`, miniVersion ? "100px" : "" , "style.borderRadius");
        views.updateVal(`${actionVar}SmallVersionContainer`, ((scaleByPlane[data.planeTabSelected] < .11) ? 3 : (1 / scaleByPlane[data.planeTabSelected])*.8)+"", "style.scale");

        views.updateVal(`${actionVar}SmallVersionTitle`, scaleByPlane[data.planeTabSelected] < .11 ? "0" : "1" , "style.opacity");
        views.updateVal(`${actionVar}Container`, miniVersion ? "100px" : "" , "style.borderRadius");

        views.updateVal(`${actionVar}SmallVersionLevels`, isMaxLevel?"var(--max-level-color)":"var(--text-primary)", "style.color");
        views.updateVal(`${actionVar}Level2`, actionObj.level, "innerText", 1);
        views.updateVal(`${actionVar}MaxLevel2`, actionObj.maxLevel, "innerText", 1);
        views.updateVal(`${actionVar}IsMaxLevel`, isMaxLevel && !miniVersion ? "":"none", "style.display");


        //go through each downstream
        for (let downstreamVar of dataObj.downstreamVars) {
            if(!actionData[downstreamVar]) {
                continue;
            }
            views.updateVal(`${actionVar}_${downstreamVar}_Line_Inner_Container`, !miniVersion ? "flex" : "none", "style.display");
            let boxShadow = !isAttentionLine(actionVar, downstreamVar)?"":(miniVersion?"0 0 40px 11px yellow":"0 0 18px 5px yellow");
            views.updateVal(`${actionVar}_${downstreamVar}_Line_Outer`, boxShadow, "style.boxShadow");
        }

        return !miniVersion;
    },
    updateActionSharedViews: function(actionObj) {
        let actionVar = actionObj.actionVar;
        let dataObj = actionData[actionVar];

        views.updateVal(`${actionVar}HighestLevelContainer2`, data.upgrades.rememberWhatIDid.isFullyBought ? "" : "none", "style.display");
        views.updateVal(`${actionVar}LockContainer`, !actionObj.unlocked?"":"none", "style.display");

        let effColor = `rgb(${Math.round(20+189*(1-(actionObj.efficiency/100)))},${Math.round(20+189*(actionObj.efficiency/100))}, 100)`
        views.updateVal(`${actionVar}Efficiency`, effColor, "style.color");

        //Update the numbers
        let roundedNumbers = [["efficiency", 2]];
        if(actionObj.maxLevel !== undefined) {
            roundedNumbers.push(["maxLevel", 1]);
        }
        if(actionObj.wage) {
            roundedNumbers.push(["wage", 2]);
        }
        if(actionObj.isSpell) {
            let instaColor = `rgb(${Math.round(20+189*(actionObj.instability/100/data.atts.control.attMult))}, ${Math.round(20+189*(1-(actionObj.instability/100/data.atts.control.attMult)))}, 100)`;
            views.updateVal(`${actionVar}Instability`, instaColor, "style.color");
            roundedNumbers.push(["instability", 2]);
            views.updateVal(`${actionVar}InstabilityToAdd`, actionObj.instabilityToAdd/(actionObj.efficiency/100), "textContent", 2);
        }

        for(let numberObj of roundedNumbers) {
            let capName = capitalizeFirst(numberObj[0]);
            let nameNoNums = numberObj[0].replace(/\d+/g, '');
            views.updateVal(`${actionVar}${capName}`, data.actions[actionVar][`${nameNoNums}`], "textContent", numberObj[1]);
        }

        //Update visibility even before unlock, because it affecst the shape of it
        if (actionObj.currentMenu === "downstream") {
            for (let downstreamVar of dataObj.downstreamVars) {
                let downstreamObj = data.actions[downstreamVar];

                if(downstreamObj && downstreamObj.hasUpstream) {
                    views.updateVal(`${actionVar}SliderContainer${downstreamVar}`, downstreamObj.visible ? "" : "none", "style.display");
                }
            }
        }
    },
    updateActionLockedViews: function(actionObj) {
        let actionVar = actionObj.actionVar;
        let dataObj = actionData[actionVar];

        views.updateVal(`${actionVar}UnlockCost`, actionObj.unlockCost, "textContent", 2);
        views.updateVal(`${actionVar}UnlockCostContainer`, dataObj.unlockCost <= 0 ? "none" : "", "style.display");

    },
    updateActionUnlockedViews: function(actionObj) {
        let actionVar = actionObj.actionVar;

        //Needle
        let needlePosition = views.helpers.calcBalanceNeedle(actionObj.resourceIncrease, actionObj.resourceDecrease);
        views.updateVal(`${actionVar}BalanceNeedle`, `${needlePosition}%`, "style.left");

        //PBar.
        let isTooFast = actionObj.progressGain / actionObj.progressMax > 4;
        let progress = (actionObj.progress / actionObj.progressMax * 100);
        views.updateVal(`${actionVar}ProgressBarInner`, isTooFast?`100%`:`${(progress > 100 ? 100 : progress)}%`, "style.width");

        let exp = (actionObj.exp / actionObj.expToLevel * 100);
        views.updateVal(`${actionVar}ExpBarInner`, `${(exp > 100 ? 100 : exp)}%`, "style.width");


        //When action should be dim
        let isMaxLevel = actionObj.maxLevel !== undefined && actionObj.level >= actionObj.maxLevel;
        let isQuiet = isMaxLevel && actionObj.resourceIncrease === 0 && actionObj.resourceDecrease === 0 && !actionObj.mouseOnThis;
        views.updateVal(`${actionVar}LargeVersionContainer`, isQuiet?".6":"1", "style.opacity");
        views.updateVal(`${actionVar}Container`, actionObj.mouseOnThis?"100":"0", "style.zIndex");


        views.updateVal(`${actionVar}LargeVersionContainer`, isMaxLevel?`var(--${actionObj.resourceName}-color-bg)`:"var(--bg-secondary)", "style.backgroundColor");
        //--bg-secondary-max

        //Menu-specific updates
        if(actionObj.currentMenu === "info") {
            views.updateVal(`${actionVar}CurrentUnlockTimeContainer`, actionObj.unlockTime ? "" : "none", "style.display");
            views.updateVal(`${actionVar}CurrentUnlockTime`, actionObj.unlockTime, "textContent", "time");
            views.updateVal(`${actionVar}PrevUnlockTimeContainer`, actionObj.prevUnlockTime ? "" : "none", "style.display");
            views.updateVal(`${actionVar}PrevUnlockTime`, actionObj.prevUnlockTime, "textContent", "time");
            if(actionObj.prevUnlockTime && actionObj.unlockTime) {
                views.updateVal(`${actionVar}DeltaUnlockTimeContainer`, "", "style.display");
                views.updateVal(`${actionVar}DeltaUnlockTime`, Math.abs(actionObj.unlockTime - actionObj.prevUnlockTime), "textContent", "time");
                views.updateVal(`${actionVar}DeltaUnlockTime`, actionObj.unlockTime - actionObj.prevUnlockTime < 0 ? "green" : "red", "style.color");
            }

            views.updateVal(`${actionVar}HighestLevelContainer`, data.upgrades.rememberWhatIDid.isFullyBought ? "" : "none", "style.display");
            views.updateVal(`${actionVar}SecondHighestLevelContainer`, data.upgrades.rememberHowIGrew.isFullyBought ? "" : "none", "style.display");
            views.updateVal(`${actionVar}ThirdHighestLevelContainer`, data.upgrades.rememberMyMastery.isFullyBought ? "" : "none", "style.display");
        }

        if(actionObj.currentMenu === "atts") {

            for(let expAtt of actionObj.expAtts) {
                let attVar = expAtt[0];
                views.updateVal(`${actionVar}_${attVar}AttExpMult`, actionObj[`${attVar}AttExpMult`], "textContent", 3);
            }

            for(let efficiencyAtt of actionObj.efficiencyAtts) {
                let attVar = efficiencyAtt[0];
                views.updateVal(`${actionVar}_${attVar}AttEfficiencyMult`, actionObj[`${attVar}AttEfficiencyMult`], "textContent", 3);
            }

        }

        if (actionObj.currentMenu === "downstream") {
            views.updateActionDownstreamViews(actionObj);
            //if downstream menu is showing, hide all 0 / all 100 buttons if no downstream visible
            views.updateVal(`${actionVar}_downstreamButtonContainer`, hasDownstreamVisible(actionObj) ? "" : "none", "style.display");
        }

        //Update the numbers
        let roundedNumbers = [
            ["progress", 2], ["progressMax", 2], ["progressGain", 2],
            ["resource", 2], ["resourceDelta", 2], ["level", 1],
            ["exp", 2], ["expToLevel", 2], ["expToAdd2", 2],
            ["resourceIncrease", 3], ["resourceDecrease", 3],
            ["highestLevel2", 1]
        ];
        if(actionObj.isGenerator && actionVar !== "hearAboutTheLich") {
            roundedNumbers.push(["resourceToAdd", 2]);
            roundedNumbers.push(["actionPowerMult", 3]);
        }
        if(actionVar === "hearAboutTheLich") {
            roundedNumbers.push(["actionPower", 2]);
        }
        if(actionObj.currentMenu === "info") {
            roundedNumbers.push(["highestLevel", 1]);
            roundedNumbers.push(["secondHighestLevel", 1]);
            roundedNumbers.push(["thirdHighestLevel", 1]);
        }

        if(actionObj.currentMenu === "atts") {
            roundedNumbers.push(["attReductionEffect", 3]);
            roundedNumbers.push(["efficiencyMult", 3]);
        }
        roundedNumbers.push(["totalSend", 3]);
        roundedNumbers.push(["efficiencyBase", 2]);
        roundedNumbers.push(["progressMaxIncrease", 0]);
        roundedNumbers.push(["expToLevelIncrease", 0]);



        for(let numberObj of roundedNumbers) {
            let capName = capitalizeFirst(numberObj[0]);
            let nameNoNums = numberObj[0].replace(/\d+/g, '');
            views.updateVal(`${actionVar}${capName}`, data.actions[actionVar][`${nameNoNums}`], "textContent", numberObj[1]);
        }

    },
    updateActionDownstreamViews: function(actionObj) {
        let actionVar = actionObj.actionVar;
        let dataObj = actionData[actionVar];
        if(!dataObj.downstreamVars) {
            return;
        }
        for(let downstreamVar of dataObj.downstreamVars) {
            let downstreamObj = data.actions[downstreamVar];
            if(!downstreamObj || !downstreamObj.hasUpstream) {
                return;
            }

            let rangeValue = data.actions[actionVar][`downstreamRate${downstreamVar}`] || 0;

            let mult = rangeValue/100;
            let taken = calculateTaken(actionVar, downstreamVar, actionObj, mult);
            views.updateVal(`${actionVar}DownstreamSendRate${downstreamVar}`, taken * data.gameSettings.ticksPerSecond, "textContent", 4);

            let isAttention = isAttentionLine(actionVar, downstreamVar);
            views.updateVal(`${actionVar}DownstreamAttentionBonus${downstreamVar}`, isAttention ? "" : "none", "style.display");
            if(isAttention) {
                views.updateVal(`${actionVar}DownstreamAttentionBonus${downstreamVar}`, `x${intToString(data.focusMult, 1)}`, "textContent");
                views.updateVal(`${actionVar}_${downstreamVar}_Line_Inner_Top`, `x${intToString(data.focusMult, 1)}`, "textContent");
            }

            let focusShowing = actionObj[`${downstreamVar}FocusMult`] > 1.005 && downstreamObj.resourceName === actionObj.resourceName;
            views.updateVal(`${actionVar}DownstreamAttentionBonusLoop${downstreamVar}`, focusShowing ? "" : "none", "style.display");
            views.updateVal(`${actionVar}_${downstreamVar}_Line_Inner_Bottom`, focusShowing ? "" : "none", "style.display");
            if(focusShowing) {
                views.updateVal(`${actionVar}DownstreamAttentionBonusLoop${downstreamVar}`, `x${intToString(actionObj[downstreamVar + "FocusMult"], 3)}`);
                views.updateVal(`${actionVar}_${downstreamVar}_Line_Inner_Bottom`, `x${intToString(actionObj[downstreamVar + "FocusMult"], 3)}`);
            }

        }
    },


    //helpers
    helpers: {
        calcBalanceNeedle: function(incoming, outgoing) {
            if (outgoing <= 0) return 0;
            let balance = incoming / outgoing;
            if(balance >= 100) {
                return 100;
            }

            if (balance <= 2) {
                return balance * 25;
            } else if (balance <= 10) {
                let logScale = (Math.log10(balance) - Math.log10(2)) / (Math.log10(10) - Math.log10(2));
                return 50 + logScale * 25;
            } else {
                let logScale = (Math.log10(balance) - Math.log10(10)) / (Math.log10(100) - Math.log10(10));
                return 75 + logScale * 25;
            }
        }
    },
    updateVal: function(id, newVal, type="textContent", sigFigs) {
        const el = view.cached[id];
        if(!view.prevValues[id]) {
            view.prevValues[id] = {};
        }
        let prevValue = view.prevValues[id];
        if (!el) {
            console.log("Element of id " + id + " does not exist.");
            return;
        }

        const typeKey = `lastValue_${type}`;
        // let lastVal = prevValue[typeKey] ?? null;
        let lastVal = null;

        if (lastVal !== newVal) {
            if (type.includes(".")) {
                const [firstKey, secondKey] = type.split(".");
                if (el[firstKey] && el[firstKey][secondKey] !== undefined) {
                    el[firstKey][secondKey] = newVal;
                }
            } else {
                if(sigFigs && sigFigs !== "none") {
                    if(sigFigs === "time") {
                        el[type] = secondsToTime(newVal);
                    } else {
                        el[type] = intToString(newVal, sigFigs);
                    }
                } else {
                    el[type] = newVal;
                }
            }

            prevValue[typeKey] = newVal;
        }
    },
}


function updateGlobals() {
    let totalMometum = 0;
    let totalSpellPower = 0;
    for(let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        if(actionObj.resourceName === "momentum" && gameStateMatches(actionObj)) {
            totalMometum += actionObj.resource;
        }
        if(actionObj.power) {
            totalSpellPower += actionObj.power * actionObj.level;
        }
    }
    data.totalMomentum = totalMometum;
    data.totalSpellPower = totalSpellPower;

    views.updateVal(`totalSpellPower`, totalSpellPower, "textContent", 1);
    views.updateVal(`totalMomentum`, totalMometum, "textContent", 1);

    if(KTLMenuOpen) { //only update if menu is open
        views.updateVal(`totalMomentum2`, totalMometum, "textContent", 1);
        views.updateVal(`totalSpellPower2`, totalSpellPower, "textContent", 1);
        views.updateVal(`HATLLevel`, data.actions.hearAboutTheLich.level, "textContent", 1);
    }

    views.updateVal(`secondsPerReset`, data.secondsPerReset, "textContent","time");
    views.updateVal(`bonusTime`, data.currentGameState.bonusTime/1000, "textContent", "time");

    views.updateVal(`ancientCoin`, data.ancientCoin, "textContent", 1);
    views.updateVal(`ancientCoin2`, data.ancientCoin, "textContent", 1);
}


function hasDownstreamVisible(actionObj) {
    let dataObj = actionData[actionObj.actionVar];
    for(let downstreamVar of dataObj.downstreamVars) {
        if(data.actions[downstreamVar] && data.actions[downstreamVar].visible) {
            return true;
        }
    }
    return false;
}

function isActionVisible(actionVar) {
    const element = actionData[actionVar];
    const currentTransformX = transformX[data.planeTabSelected];
    const currentTransformY = transformY[data.planeTabSelected];

    const elementScreenX = currentTransformX + (element.realX * scaleByPlane[data.planeTabSelected]);
    const elementScreenY = currentTransformY + (element.realY * scaleByPlane[data.planeTabSelected]);

    const elementScreenWidth = 350 * scaleByPlane[data.planeTabSelected];
    const elementScreenHeight = 400 * scaleByPlane[data.planeTabSelected];

    return elementScreenX < window.innerWidth &&
        elementScreenX + elementScreenWidth > 0 &&
        elementScreenY < window.innerHeight &&
        elementScreenY + elementScreenHeight > 0;
}

function updateSliderContainers() {
    for(let actionVar in data.actions) {
        let dataObj = actionData[actionVar];
        for (let downstreamVar of dataObj.downstreamVars) {
            if(!data.actions[downstreamVar].hasUpstream) {
                continue;
            }
            if (data.gameSettings.viewAdvancedSliders) {
                views.updateVal(`${actionVar}_${downstreamVar}_slider_container_advanced`, "inline-block", "style.display");
                views.updateVal(`${actionVar}_${downstreamVar}_slider_container_basic`, "none", "style.display");
            } else {
                views.updateVal(`${actionVar}_${downstreamVar}_slider_container_advanced`, "none", "style.display");
                views.updateVal(`${actionVar}_${downstreamVar}_slider_container_basic`, "flex", "style.display");
            }
        }
    }
}