let view = {
    cached: {}, //contains the elements that are being iterated over and updated regularly,
    prevValues: {}
};

let views = {
    updateView: function() {
        //This is the main function that is run once per frame

        //go through all possible numbers
        //if the data has that the element should be visible
        //run updateVal, which accesses the cache, only if the prevVal is different
        //Which updates the element optimally

        views.updateStats();
        views.updateActions();

        for(let upgradeVar in data.upgrades) {
            updateUpgradeView(upgradeVar);
        }
        updateGlobals();

        saveCurrentViewState();

        //in case this was set
        forceVisuals = false;
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
        views.updateVal(`${attVar}StatContainer`, isVisible?"":"none", "style.display");
        if(!isVisible) {
            return;
        }

        //Update the numbers
        let roundedNumbers = [["num", 2], ["perMinute", 2], ["mult", 3]];

        for(let numberObj of roundedNumbers) {
            let capName = capitalizeFirst(numberObj[0]);
            views.updateVal(`${attVar}${capName}`, data.atts[attVar][`${numberObj[0]}`], "innerText", numberObj[1]);
        }

        //TODO remove from constantly updating and into only the unlock/unveil
        let color = getAttColor(attVar);
        views.updateVal(`${attVar}Name`, color, "style.color")
    },
    updateActions:function() {
        for(let actionVar in data.actions) {
            views.updateAction(actionVar);
        }
    },
    updateAction:function(actionVar) {
        let actionObj = data.actions[actionVar];

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
        views.updateVal(`${actionVar}Container`, !miniVersion?"":"none", "style.display");
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
        views.updateVal(`${actionVar}Efficiency`, data.actions[actionVar].efficiency, "innerText", 2);

        //Update visibility even before unlock, because it affecst the shape of it
        if (actionObj.currentMenu === "downstream") {
            for (let downstreamVar of actionObj.downstreamVars) {
                let downstreamObj = data.actions[downstreamVar];

                views.updateVal(`${actionVar}_${downstreamVar}_Line_Inner_Bottom`, downstreamObj.momentumName === actionObj.momentumName ? "" : "none", "style.display");
                views.updateVal(`${actionVar}_${downstreamVar}_Line_Outer`, downstreamObj.visible ? "" : "none", "style.display");
                if(actionObj.momentumName === downstreamObj.momentumName) {
                    views.updateVal(`${actionVar}SliderContainer${downstreamVar}`, downstreamObj.visible ? "" : "none", "style.display");
                }
            }
        }

        //TODO update attributes here
    },
    updateActionLockedViews: function(actionObj) {
        let actionVar = actionObj.actionVar;

        views.updateVal(`${actionVar}UnlockCost`, actionObj.unlockCost, "innerText", 2);

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
            views.updateActionStatsViews(actionObj);

            views.updateVal(`${actionVar}HighestLevelContainer`, data.upgrades.rememberWhatIDid.isFullyBought ? "" : "none", "style.display");
            views.updateVal(`${actionVar}SecondHighestLevelContainer`, data.upgrades.rememberHowIGrew.isFullyBought ? "" : "none", "style.display");
            views.updateVal(`${actionVar}ThirdHighestLevelContainer`, data.upgrades.rememberMyMastery.isFullyBought ? "" : "none", "style.display");
            views.updateVal(`${actionVar}PrevUnlockTimeContainer`, actionObj.prevUnlockTime ? "" : "none", "style.display");
            views.updateVal(`${actionVar}PrevUnlockTime`, secondsToTime(actionObj.prevUnlockTime), "innerText", "time");


            views.updateVal(`${actionVar}StatExpContainer`, actionObj.expAtts.length > 0 ? "" : "none", "style.display");
            views.updateVal(`${actionVar}StatExpertiseContainer`, actionObj.efficiencyAtts.length > 0 ? "" : "none", "style.display");

            actionObj.expAtts.forEach(function(expStat) {
                let attVar = expStat[0];
                views.updateVal(actionVar + "_" + attVar + "StatExpMult", actionObj[attVar + "StatExpMult"], "innerText", 3);
            });

            actionObj.efficiencyAtts.forEach(function(efficiencyStat) {
                let attVar = efficiencyStat[0];
                views.updateVal(actionVar + "_" + attVar + "StatExpertiseMult", actionObj[attVar + "StatExpertiseMult"], "innerText", 3);
            });


        }

        if (actionObj.currentMenu === "downstream") {
            views.updateActionDownstreamViews(actionObj);
            //if downstream menu is showing, hide all 0 / all 100 buttons if no downstream visible
            views.updateVal(`${actionVar}_downstreamButtonContainer`, hasDownstreamVisible(actionObj) ? "" : "none", "style.display");
        }

        //Update the numbers


        let roundedNumbers = [
            ["progress", 2], ["progressMax", 2], ["progressGain", 2],
            ["momentum", 2], ["momentumDelta", 2], ["level", 1], ["tier", 1],
            ["exp", 2], ["expToLevel", 2], ["expToAdd", 2], ["momentumIncrease", 3], ["momentumDecrease", 3],
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
        }

        if(actionObj.currentMenu === "atts") {
            roundedNumbers.push(["statReductionEffect", 3]);
            roundedNumbers.push(["expertiseMult", 3]);
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
        roundedNumbers.push(["expertiseBase", 2]);
        roundedNumbers.push(["level2", 1]);
        roundedNumbers.push(["progressMaxIncrease", "none"]);
        roundedNumbers.push(["expToLevelIncrease", "none"]);



        for(let numberObj of roundedNumbers) {
            let capName = capitalizeFirst(numberObj[0]);
            let nameNoNums = numberObj[0].replace(/\d+/g, '');
            views.updateVal(`${actionVar}${capName}`, data.actions[actionVar][`${nameNoNums}`], "innerText", numberObj[1]);
        }

    },
    updateActionDownstreamViews: function(actionObj) {
        let actionVar = actionObj.actionVar;
        if(!actionObj.downstreamVars) {
            return;
        }
        for(let downstreamVar of actionObj.downstreamVars) {
            let downstreamObj = data.actions[downstreamVar];
            if(!downstreamObj || actionObj.momentumName !== downstreamObj.momentumName) {
                return;
            }


            let rangeValue = data.actions[actionVar][`downstreamRate${downstreamVar}`];

            let mult = rangeValue/100;
            let taken = calculateTaken(actionVar, downstreamVar, actionObj, mult);
            views.updateVal(`${actionVar}DownstreamSendRate${downstreamVar}`, taken * ticksPerSecond, "innerText", 4);

            let isAttention = isAttentionLine(actionVar, downstreamVar);
            views.updateVal(`${actionVar}DownstreamAttentionBonus${downstreamVar}`, isAttention ? "" : "none", "style.display");
            if(isAttention) {
                views.updateVal(`${actionVar}DownstreamAttentionBonus${downstreamVar}`, "x" + intToString(data.attentionMult, 1));
                views.updateVal(`${actionVar}_${downstreamVar}_Line_Inner_Top`, "x"+intToString(data.attentionMult, 1));
            }

            let attentionShowing = actionObj[`${downstreamVar}AttentionMult`] > 1.005;
            views.updateVal(`${actionVar}DownstreamAttentionBonusLoop${downstreamVar}`, attentionShowing ? "" : "none", "style.display");
            views.updateVal(`${actionVar}_${downstreamVar}_Line_Inner_Bottom`, attentionShowing ? "" : "none", "style.display");
            if(attentionShowing) {
                views.updateVal(`${actionVar}DownstreamAttentionBonusLoop${downstreamVar}`, "x" + intToString(actionObj[downstreamVar + "AttentionMult"], 3));
                views.updateVal(`${actionVar}_${downstreamVar}_Line_Inner_Bottom`, "x" + intToString(actionObj[downstreamVar + "AttentionMult"], 3));
            }



        }
    },
    updateActionStatsViews: function(actionObj) {
        let actionVar = actionObj.actionVar;
        //TODO update statistics 

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
    updateVal: function(id, newVal, type="innerText", sigFigs) {
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
        let lastVal = prevValue[typeKey] ?? null;

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
    data.actionNames.forEach(function(actionVar) {
        let actionObj = data.actions[actionVar];
        if(actionObj.momentumName === "momentum" && gameStateMatches(actionObj)) {
            totalMometum += actionObj.momentum;
        }
    });
    data.totalMomentum = totalMometum;
    view.cached.totalMomentum.innerText = intToString(totalMometum, 1);
    if(view.cached.killTheLichMenu.style.display !== "none") { //only update if menu is open
        view.cached.totalMomentum2.innerText = intToString(totalMometum, 1);
    }

    let toShowAmulet = data.useAmuletButtonShowing && data.gameState === "KTL" ? "" : "none";

    if(view.cached.openUseAmuletButton.style.display !== toShowAmulet) {
        view.cached.openUseAmuletButton.style.display = toShowAmulet;
    }
    let toViewAmulet = data.doneKTL && data.gameState !== "KTL" ? "" : "none";
    if(view.cached.openViewAmuletButton.style.display !== toViewAmulet) {
        view.cached.openViewAmuletButton.style.display = toViewAmulet;
    }
    if(view.cached.secondsPerReset.innerText !== secondsToTime(data.secondsPerReset)) {
        view.cached.secondsPerReset.innerText = secondsToTime(data.secondsPerReset);
    }
    if(view.cached.essence.innerText !== intToString(data.essence, 1)) {
        view.cached.essence.innerText = intToString(data.essence, 1);
        view.cached.essence2.innerText = intToString(data.essence, 1);
    }

    if(view.cached.bonusTime.innerText !== secondsToTime(bonusTime/1000, 1)) {
        view.cached.bonusTime.innerText = secondsToTime(bonusTime/1000, 1);
    }
}

//Save a second copy of all the data after a view update, so it can request updates only for the ones that are different
function saveCurrentViewState() {
    prevState.atts = copyArray(data.atts);
    prevState.actions = copyArray(data.actions);
    prevState.scale = scale;
}

function updateViewOnSecond() {
    showAllValidToasts();
}

function hasDownstreamVisible(actionObj) {
    let visibleFound = false;
    actionObj.downstreamVars.forEach(function(downVar) {
        if(!data.actions[downVar] || !data.actions[downVar].visible) {
            return;
        }
        visibleFound = true;
    });
    return visibleFound;
}

// function updateActionStatsViews(actionObj, prevAction, forceUpdate) {
//     let actionVar = actionObj.actionVar;
//
//     if(actionObj.expAtts.length > 0) {
//         if(view.cached[actionVar+"StatExpContainer"].style.display === "none") {
//             view.cached[actionVar+"StatExpContainer"].style.display = "";
//         }
//         actionObj.expAtts.forEach(function(expStat) {
//             let attVar = expStat[0];
//             if(forceUpdate || intToString(prevAction[attVar+"StatExpMult"], 3) !== intToString(actionObj[attVar+"StatExpMult"], 3)) {
//                 view.cached[actionVar + "_" + attVar + "StatExpMult"].innerText = intToString(actionObj[attVar + "StatExpMult"], 3);
//             }
//         });
//     }
//
//     if(actionObj.efficiencyAtts.length > 0) {
//         if(view.cached[actionVar+"StatExpertiseContainer"].style.display === "none") {
//             view.cached[actionVar+"StatExpertiseContainer"].style.display = "";
//         }
//         actionObj.efficiencyAtts.forEach(function(efficiencyStat) {
//             let attVar = efficiencyStat[0];
//             if(forceUpdate || intToString(prevAction[attVar+"StatExpertiseMult"], 3) !== intToString(actionObj[attVar+"StatExpertiseMult"], 3)) {
//                 view.cached[actionVar + "_" + attVar + "StatExpertiseMult"].innerText = intToString(actionObj[attVar + "StatExpertiseMult"], 3);
//             }
//         });
//     }
// }
