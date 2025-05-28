let view = {
    cached: {}, //contains the elements that are being iterated over and updated regularly,
    prevValues: {}
};

/*
Types of views:
update: run once a frame
generate: functions to return an html that's made in a loop
create: functions to put the pieces on the page. Uses generate methods.

 */

let views = {
    updateView: function() { //This is the main view update function that is run once per frame
        views.updateStats();
        views.updateActions();

        for(let upgradeVar in data.upgrades) {
            updateUpgradeView(upgradeVar);
        }
        updateGlobals();
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

        //Update the numbers
        let roundedNumbers = [["num", 2], ["perMinute", 2], ["mult", 3]];

        for(let numberObj of roundedNumbers) {
            let capName = capitalizeFirst(numberObj[0]);
            views.updateVal(`${attVar}${capName}`, data.atts[attVar][`${numberObj[0]}`], "textContent", numberObj[1]);
        }
    },
    updateActions:function() {
        views.updateAura();

        for(let actionVar in data.actions) {
            let actionObj = data.actions[actionVar];
            views.updateAction(actionObj);
        }
    },
    updateAura:function() {
        let resourceAmounts = {};

        for (let actionVar in data.actions) {
            let actionObj = data.actions[actionVar];
            let resourceName = actionObj.momentumName;
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
                if(maxAmount < 100) {
                    ratio *= maxAmount/100; //scale first 100 smoother.
                }
                let actionObj = data.actions[entry.id];

                let color = getDimResourceColor(actionObj);
                views.updateVal(`${entry.id}Container`,`${color} 0px 0px ${Math.floor(ratio * 75)}px ${Math.floor(ratio * 25)}px`,"style.boxShadow");
                views.updateVal(`${entry.id}LargeVersionContainer`,`inset ${color} 0px 0px ${Math.floor(ratio * 15)}px ${Math.floor(ratio * 5)}px`,"style.boxShadow");
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

        //if game state doesn't match, return after updating it
        let toDisplay = gameStateMatches(actionObj) && (globalVisible || actionObj.visible);
        views.updateVal(`${actionVar}Container`, toDisplay?"":"none", "style.display");
        if(actionObj.parent) {
            views.updateVal(`${actionObj.parent}_${actionVar}_Line_Outer`, toDisplay?"":"none", "style.display");
            views.updateVal(`${actionObj.parent}_${actionVar}_Line_Inner`, toDisplay?"":"none", "style.display");
        }

        if(!toDisplay) { // || not in screen range
            return false;
        }


        let miniVersion = scale < .35;
        views.updateVal(`${actionVar}LargeVersionContainer`, !miniVersion?"":"none", "style.display");
        views.updateVal(`${actionVar}SmallVersionContainer`, miniVersion?"":"none", "style.display");
        views.updateVal(`${actionVar}SmallVersionContainer`, (1 / scale)*.8+"", "style.scale");


        //go through each downstream
        for (let downstreamVar of actionObj.downstreamVars) {
            views.updateVal(`${actionVar}_${downstreamVar}_Line_Inner_Container`, !miniVersion ? "" : "none", "style.display");
            let boxShadow = !isAttentionLine(actionVar, downstreamVar)?"":(miniVersion?"0 0 40px 11px yellow":"0 0 18px 5px yellow");
            views.updateVal(`${actionVar}_${downstreamVar}_Line_Outer`, boxShadow, "style.boxShadow");
        }

        return !miniVersion;
    },
    updateActionSharedViews: function(actionObj) {
        let actionVar = actionObj.actionVar;

        views.updateVal(`${actionVar}HighestLevelContainer2`, data.upgrades.rememberWhatIDid.isFullyBought ? "" : "none", "style.display");
        views.updateVal(`${actionVar}LockContainer`, !actionObj.unlocked?"":"none", "style.display");

        let color = `rgb(${Math.round(20+189*(1-(actionObj.efficiency/100)))},${Math.round(20+189*(actionObj.efficiency/100))},100)`
        views.updateVal(`${actionVar}Efficiency`, color, "style.color");
        views.updateVal(`${actionVar}Efficiency`, data.actions[actionVar].efficiency, "textContent", 2);

        //Update visibility even before unlock, because it affecst the shape of it
        if (actionObj.currentMenu === "downstream") {
            for (let downstreamVar of actionObj.downstreamVars) {
                let downstreamObj = data.actions[downstreamVar];

                views.updateVal(`${actionVar}_${downstreamVar}_Line_Inner_Bottom`, downstreamObj.momentumName === actionObj.momentumName ? "" : "none", "style.display");
                views.updateVal(`${actionVar}_${downstreamVar}_Line_Outer`, downstreamObj.visible ? "" : "none", "style.display");
                if(downstreamObj.hasUpstream) {
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
        let needlePosition = views.helpers.calcBalanceNeedle(actionObj.momentumIncrease, actionObj.momentumDecrease);
        views.updateVal(`${actionVar}BalanceNeedle`, `${needlePosition}%`, "style.left");

        //PBar.
        let isTooFast = actionObj.progressGain / actionObj.progressMax > 4;
        let progress = (actionObj.progress / actionObj.progressMax * 100);
        views.updateVal(`${actionVar}ProgressBarInner`, isTooFast?`100%`:`${(progress > 100 ? 100 : progress)}%`, "style.width");

        let exp = (actionObj.exp / actionObj.expToLevel * 100);
        views.updateVal(`${actionVar}ExpBarInner`, `${(exp > 100 ? 100 : exp)}%`, "style.width");

        //When Action is max level
        let isMaxLevel = (actionObj.maxLevel !== -1 && actionObj.level >= actionObj.maxLevel);
        views.updateVal(`${actionVar}IsMaxLevel`, isMaxLevel?"":"none", "style.display");
        views.updateVal(`${actionVar}Level2`, isMaxLevel?"var(--max-level-color)":"var(--text-primary)", "style.color");


        //Menu-specific updates
        if(actionObj.currentMenu === "atts") {
            views.updateVal(`${actionVar}HighestLevelContainer`, data.upgrades.rememberWhatIDid.isFullyBought ? "" : "none", "style.display");
            views.updateVal(`${actionVar}SecondHighestLevelContainer`, data.upgrades.rememberHowIGrew.isFullyBought ? "" : "none", "style.display");
            views.updateVal(`${actionVar}ThirdHighestLevelContainer`, data.upgrades.rememberMyMastery.isFullyBought ? "" : "none", "style.display");
            views.updateVal(`${actionVar}PrevUnlockTimeContainer`, actionObj.prevUnlockTime ? "" : "none", "style.display");
            views.updateVal(`${actionVar}PrevUnlockTime`, secondsToTime(actionObj.prevUnlockTime), "textContent", "time");


            for(let expAtt of actionObj.expAtts) {
                let attVar = expAtt[0];
                views.updateVal(`${actionVar}_${attVar}AttExpMult`, actionObj[`${attVar}AttExpMult`], "textContent", 3);
            }

            for(let efficiencyStat of actionObj.efficiencyAtts) {
                let attVar = efficiencyStat[0];
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
            ["resource", 2], ["momentumDelta", 2], ["level", 1],
            ["exp", 2], ["expToLevel", 2], ["expToAdd2", 2],
            ["momentumIncrease", 3], ["momentumDecrease", 3],
            ["highestLevel2", 1]
        ];
        // if(actionObj.isGenerator) { //TODO
        if(actionVar === "overclock") {
            roundedNumbers.push(["momentumAdded", 2]);
        }
        if(actionObj.isGenerator && actionVar !== "overclock") {
            roundedNumbers.push(["amountToSend", 2]);
        }
        if(actionObj.isGenerator) {
            roundedNumbers.push(["actionPowerMult", 3]);
            // roundedNumbers.push(["actionPower", 2]);
        }

        if(actionObj.currentMenu === "atts") {
            roundedNumbers.push(["attReductionEffect", 3]);
            roundedNumbers.push(["efficiencyMult", 3]);
            roundedNumbers.push(["highestLevel", 1]);
            roundedNumbers.push(["secondHighestLevel", 1]);
            roundedNumbers.push(["thirdHighestLevel", 1]);
        }
        if(actionObj.wage) {
            roundedNumbers.push(["wage", 2]);
        }
        if(actionObj.maxLevel >= 0) {
            roundedNumbers.push(["maxLevel", 1]);
        }
        roundedNumbers.push(["totalSend", 3]);
        roundedNumbers.push(["prevUnlockTime", 1]);
        roundedNumbers.push(["efficiencyBase", 2]);
        roundedNumbers.push(["level2", 1]);
        roundedNumbers.push(["progressMaxIncrease", "none"]);
        roundedNumbers.push(["expToLevelIncrease", "none"]);



        for(let numberObj of roundedNumbers) {
            let capName = capitalizeFirst(numberObj[0]);
            let nameNoNums = numberObj[0].replace(/\d+/g, '');
            views.updateVal(`${actionVar}${capName}`, data.actions[actionVar][`${nameNoNums}`], "textContent", numberObj[1]);
        }

    },
    updateActionDownstreamViews: function(actionObj) {
        let actionVar = actionObj.actionVar;
        if(!actionObj.downstreamVars) {
            return;
        }
        for(let downstreamVar of actionObj.downstreamVars) {
            let downstreamObj = data.actions[downstreamVar];
            if(!downstreamObj || !downstreamObj.hasUpstream) {
                return;
            }

            let rangeValue = data.actions[actionVar][`downstreamRate${downstreamVar}`];

            let mult = rangeValue/100;
            let taken = calculateTaken(actionVar, downstreamVar, actionObj, mult);
            views.updateVal(`${actionVar}DownstreamSendRate${downstreamVar}`, taken * ticksPerSecond, "textContent", 4);

            let isAttention = isAttentionLine(actionVar, downstreamVar);
            views.updateVal(`${actionVar}DownstreamAttentionBonus${downstreamVar}`, isAttention ? "" : "none", "style.display");
            if(isAttention) {
                views.updateVal(`${actionVar}DownstreamAttentionBonus${downstreamVar}`, `x${intToString(data.focusMult, 1)}`, "textContent");
                views.updateVal(`${actionVar}_${downstreamVar}_Line_Inner_Top`, `x${intToString(data.focusMult, 1)}`, "textContent");
            }

            let focusShowing = actionObj[`${downstreamVar}FocusMult`] > 1.005;
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

function updateUpgradeView(upgradeVar) {
    let isShowing = document.getElementById("useAmuletMenu").style.display !== "none";
    if(!isShowing) {
        return;
    }
    let upgrade = data.upgrades[upgradeVar];
    document.getElementById(upgradeVar+"Container").style.display = upgrade.visible ? "" : "none";

    for(let i = 0; i < upgrade.upgradesAvailable; i++) {
        if(upgrade.upgradesBought.indexOf(i) !== -1) {
            document.getElementById(upgradeVar + "Button" + i).style.background = "var(--upgrade-bought-color)";
            document.getElementById(upgradeVar + "Button" + i).style.color = "black";
        } else if(i === 0 || upgrade.upgradesBought.indexOf(i-1) !== -1) { //ready to buy
            document.getElementById(upgradeVar + "Button" + i).style.background = "var(--upgrade-color)";
            document.getElementById(upgradeVar + "Button" + i).style.color = "black";
        } else {
            document.getElementById(upgradeVar + "Button" + i).style.background = "var(--upgrade-disabled-color)";
            document.getElementById(upgradeVar + "Button" + i).style.color = "white";
        }
    }

}

function updateGlobals() {
    let totalMometum = 0;
    for(let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        if(actionObj.momentumName === "momentum" && gameStateMatches(actionObj)) {
            totalMometum += actionObj.resource;
        }
    }
    data.totalMomentum = totalMometum;

    views.updateVal(`totalMomentum`, totalMometum, "textContent", 1);

    if(KTLMenuOpen) { //only update if menu is open
        views.updateVal(`totalMomentum2`, totalMometum, "textContent", 1);
    }

    let toShowKTLButton = data.gameState !== "KTL" && (data.doneKTL || data.actions.hearAboutTheLich.level >= 1);
    views.updateVal(`killTheLichMenuButton2`, toShowKTLButton ? "" : "none", "style.display");

    let toShowUseAmulet = data.useAmuletButtonShowing && data.gameState === "KTL" ? "" : "none";
    views.updateVal(`openUseAmuletButton`, toShowUseAmulet ? "" : "none", "style.display");

    let toViewAmulet = data.doneAmulet && data.gameState !== "KTL" ? "" : "none";
    views.updateVal(`openViewAmuletButton`, toViewAmulet ? "" : "none", "style.display");
    views.updateVal(`essenceDisplay`, toViewAmulet ? "" : "none", "style.display");

    views.updateVal(`jobDisplay`, data.displayJob ? "" : "none", "style.display");

    views.updateVal(`secondsPerReset`, data.secondsPerReset, "textContent","time");
    views.updateVal(`bonusTime`, bonusTime/1000, "textContent", "time");

    views.updateVal(`essence`, data.essence, "textContent", 1);
    views.updateVal(`essence2`, data.essence, "textContent", 1);
}

function updateViewOnSecond() {
    showAllValidToasts();
}

function hasDownstreamVisible(actionObj) {
    for(let downstreamVar of actionObj.downstreamVars) {
        if(data.actions[downstreamVar] && data.actions[downstreamVar].visible) {
            return true;
        }
    }
    return false;
}