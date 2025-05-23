let view = {
    cached: {}, //contains the elements that are being iterated over and updated regularly,
};

//This is the main function that is run once per 50ms
function updateView() {
    data.statNames.forEach(function (resName) {
        updateStatView(resName);
    });
    data.actionNames.forEach(function(actionVar) {
        updateActionView(actionVar);
    });
    for(let upgradeVar in data.upgrades) {
        updateUpgradeView(upgradeVar);
    }
    updateGlobals();

    saveCurrentViewState();

    //in case this was set
    forceVisuals = false;
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
    prevState.stats = copyArray(data.stats);
    prevState.actions = copyArray(data.actions);
    prevState.scale = scale;
}

function updateViewOnSecond() {
    showAllValidToasts();
}

function updateStatView(statName) {
    let statObj = data.stats[statName];
    let prevStat = prevState.stats[statName];
    let forceUpdate = !prevStat;

    updateStatForVisibility(statObj, prevStat, forceUpdate);

    let roundedNumbers = [["num", 2], ["perMinute", 2], ["mult", 3]];

    roundedNumbers.forEach(obj => {
        let capName = capitalizeFirst(obj[0]);
        if(forceUpdate || intToString(prevStat[obj[0]], obj[1], true) !== intToString(statObj[obj[0]], obj[1], true)) {
            view.cached[`${statName}${capName}`].innerText = intToString(statObj[obj[0]], obj[1], true);
        }
    })

    let color = getStatColor(statName);
    if(forceUpdate || view.cached[`${statName}Name`].style.color !== color) {
        view.cached[`${statName}Name`].style.color = color;
    }
}

function updateStatForVisibility(statObj, prevStat, forceUpdate) {
    let statVar = statObj.statVar;
    //only show if being the stat's amount is > 0
    if(forceUpdate ||
        (view.cached[statVar+"StatContainer"].style.display === "none" && statObj.num > 0) ||
        (view.cached[statVar+"StatContainer"].style.display !== "none" && statObj.num === 0)) {
        if (statObj.num > 0) {
            view.cached[statVar + "StatContainer"].style.display = "";
        } else {
            view.cached[statVar + "StatContainer"].style.display = "none";
        }
    }
}

function updateActionForVisibility(actionObj, prevAction, forceUpdate) {
    let actionVar = actionObj.actionVar;

    let miniVersion = scale < .35;
    if(prevState.scale !== scale && miniVersion && view.cached[`${actionVar}LargeVersionContainer`].style.display !== "none") {
        //switch to mini versions
        view.cached[`${actionVar}LargeVersionContainer`].style.display = "none"
        view.cached[`${actionVar}Container`].style.pointerEvents = "none";
        view.cached[`${actionVar}SmallVersionContainer`].style.display = "";
        forceUpdate = true;
        //go through each downstream action, and each bar should have its text container hidden, and the selected border color widened
    } else if(prevState.scale !== scale && !miniVersion && view.cached[`${actionVar}LargeVersionContainer`].style.display === "none") {
        //switch to large versions
        view.cached[`${actionVar}LargeVersionContainer`].style.display = ""
        view.cached[`${actionVar}Container`].style.pointerEvents = "";
        view.cached[`${actionVar}SmallVersionContainer`].style.display = "none";
        forceUpdate = true;
    }

    if(prevState.scale !== scale) {
        for (let downstreamVar of actionObj.downstreamVars) {
            if (!view.cached[actionVar + "_" + downstreamVar + "_Line_Inner_Container"]) { //for when downstream are declared but not created
                continue;
            }
            if (miniVersion) {
                view.cached[actionVar + "_" + downstreamVar + "_Line_Inner_Container"].style.display = "none"
                if(isAttentionLine(actionVar, downstreamVar)) {
                    view.cached[actionVar + "_" + downstreamVar + "_Line_Outer"].style.boxShadow = '0 0 40px 11px yellow';
                } else {
                    view.cached[actionVar + "_" + downstreamVar + "_Line_Outer"].style.boxShadow = '';
                }
            } else {
                view.cached[actionVar + "_" + downstreamVar + "_Line_Inner_Container"].style.display = ""
                if(isAttentionLine(actionVar, downstreamVar)) {
                    view.cached[actionVar + "_" + downstreamVar + "_Line_Outer"].style.boxShadow = '0 0 18px 5px yellow';
                } else {
                    view.cached[actionVar + "_" + downstreamVar + "_Line_Outer"].style.boxShadow = '';
                }
            }
        }
    }

    if(prevState.scale !== scale) {
        view.cached[`${actionVar}SmallVersionContainer`].style.scale = (1 / scale)*.8+"";
    }

    // if(actionObj.parent && !view.cached[actionObj.parent + "_" + actionVar + "_Line_Outer"]) {
    //     console.log("not found: " + actionObj.parent + "_" + actionVar + "_Line_Outer")
    // }
    if (forceUpdate || (prevAction.visible !== actionObj.visible) || (prevAction.isRunning !== actionObj.isRunning)) {
        if (actionObj.visible && actionObj.isRunning && gameStateMatches(actionObj)) {
            view.cached[actionVar + "Container"].style.display = "";
            if (actionObj.parent) {
                view.cached[actionObj.parent + "_" + actionVar + "_Line_Outer"].style.display = "";
                view.cached[actionObj.parent + "_" + actionVar + "_Line_Inner"].style.display = "";
            }
        } else {
            view.cached[actionVar + "Container"].style.display = "none";
            if (actionObj.parent) {
                view.cached[actionObj.parent + "_" + actionVar + "_Line_Outer"].style.display = "none";
                view.cached[actionObj.parent + "_" + actionVar + "_Line_Inner"].style.display = "none";
            }
        }
    }

    if(forceUpdate || prevAction.unlocked !== actionObj.unlocked) {
        if(actionObj.unlocked) {
            view.cached[actionVar + "LockContainer"].style.display = "none";
        } else {
            view.cached[actionVar + "LockContainer"].style.display = "";
        }
    }

    if (actionObj.currentMenu === "downstream") { //if downstream menu is showing, hide all 0 / all 100 buttons if no downstream visible
        let display = view.cached[actionVar + "_downstreamButtonContainer"].style.display;
        let hasVisible = hasDownstreamVisible(actionObj);
        if(display !== "none" && !hasVisible) {
            view.cached[actionVar + "_downstreamButtonContainer"].style.display = "none";
        } else if(display === "none" && hasVisible) {
            view.cached[actionVar + "_downstreamButtonContainer"].style.display = "";
        }
    }
    return forceUpdate;
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

function updateActionView(actionVar) {
    let actionObj = data.actions[actionVar];

    let prevAction = prevState.actions[actionVar];
    let forceUpdate = !prevAction || forceVisuals;

    forceUpdate = updateActionForVisibility(actionObj, prevAction, forceUpdate);

    if(!forceUpdate &&
        (!gameStateMatches(actionObj) ||
            !isInScreenRange(actionObj))) {
        return;
    }

    updateActionViewsForUpgrades(actionVar);

    //always-visible nums per action
    let roundedNumbers = [
        ["progress", 2], ["progressMax", 2], ["progressGain", 2],
        ["momentum", 2], ["momentumDelta", 2], ["level", 1], ["maxLevel", 1], ["tier", 1],
        ["exp", 2], ["expToLevel", 2], ["expToAdd", 2], ["momentumIncrease", 3], ["momentumDecrease", 3],
        ["expertise", 1], ["highestLevel2", 1], ["wage", 2]
    ];

    if(forceUpdate || !actionObj.unlocked) {
        roundedNumbers.push(["unlockCost", 2]);
    }
    if(forceUpdate || actionObj.unlocked) {
        roundedNumbers.push(["totalSend", 3]);
        roundedNumbers.push(["amountToSend", 2]);
        roundedNumbers.push(["actionPower", 3]);
        roundedNumbers.push(["actionPowerMult", 3]);
        roundedNumbers.push(["highestLevel", 1]);
        roundedNumbers.push(["secondHighestLevel", 1]);
        roundedNumbers.push(["thirdHighestLevel", 1]);
        roundedNumbers.push(["prevUnlockTime", 1]);
        roundedNumbers.push(["expToLevelMult", 5]);
        roundedNumbers.push(["expertiseMult", 3]);
        roundedNumbers.push(["expertiseBase", 2]);
        roundedNumbers.push(["level2", 1]);
    }

    let roundWithoutSig = ["progressMaxIncrease", "expToLevelIncrease"];

    roundedNumbers.forEach(obj => {
        let capName = capitalizeFirst(obj[0]);
        let elem = view.cached[`${actionVar}${capName}`];
        let nameNoNums = obj[0].replace(/\d+/g, '');
        if(!elem) {
            return;
        }
        if(forceUpdate || intToString(prevAction[nameNoNums], obj[1]) !== intToString(actionObj[nameNoNums], obj[1])) {
            elem.innerText = intToString(actionObj[nameNoNums], obj[1]);
        }
    })

    let roundedColoredNumbers = [["efficiency", 2]];
    roundedColoredNumbers.forEach(obj => {
        let capName = capitalizeFirst(obj[0]);
        let elem = view.cached[`${actionVar}${capName}`];
        let nameNoNums = obj[0].replace(/\d+/g, '');
        if(!elem) {
            return;
        }
        if(forceUpdate || intToString(prevAction[nameNoNums], obj[1]) !== intToString(actionObj[nameNoNums], obj[1])) {
            elem.innerText = intToString(actionObj[nameNoNums], obj[1]);
            elem.style.color = `rgb(${Math.round(20+189*(1-(actionObj[nameNoNums]/100)))},${Math.round(20+189*(actionObj[nameNoNums]/100))},100)`;
        }
    })

    roundWithoutSig.forEach(obj => {
        let capName = capitalizeFirst(obj);
        let elem = view.cached[`${actionVar}${capName}`];
        let nameNoNums = obj.replace(/\d+/g, '');
        if(!elem) {
            return;
        }
        if(forceUpdate || prevAction[nameNoNums] !== actionObj[nameNoNums]) {
            elem.innerText = actionObj[nameNoNums];
        }
    })

    if(forceUpdate || actionObj.unlocked) {
        updateActionDownstreamViews(actionObj, prevAction, forceUpdate);
        updateActionStatViews(actionObj, prevAction, forceUpdate);
        updateActionProgressBarViews(actionObj, prevAction, forceUpdate);
    }

    //Fixes a memory leak with prev actionObj references hanging around due to having live references
    prevAction = {};
}

function updateActionDownstreamViews(actionObj, prevAction, forceUpdate) {
    let actionVar = actionObj.actionVar;

    if(actionObj.downstreamVars) {
        actionObj.downstreamVars.forEach(function (downstreamVar) {
            let downstreamObj = data.actions[downstreamVar];
            if(!downstreamObj) {
                return;
            }
            if(!downstreamObj || downstreamObj.momentumName !== actionObj.momentumName) {
                view.cached[`${actionVar}_${downstreamVar}_Line_Inner_Bottom`].style.display = "none"
                return;
            }

            if (forceUpdate
                || prevAction.momentum !== actionObj.momentum
                || (actionObj["downstreamRate"+downstreamVar] !== prevAction["downstreamRate"+downstreamVar])) {
                let rangeValue = document.getElementById(actionVar + "RangeInput" + downstreamVar).value;
                let mult = rangeValue/100;
                let taken = calculateTaken(actionVar, downstreamVar, actionObj, mult);



                view.cached[`${actionVar}DownstreamSendRate${downstreamVar}`].textContent = intToString(taken * ticksPerSecond, 4);
            }


            if(isAttentionLine(actionVar, downstreamVar)) {
                view.cached[`${actionVar}DownstreamAttentionBonus${downstreamVar}`].textContent = "x"+intToString(data.attentionMult, 1);
                view.cached[`${actionVar}_${downstreamVar}_Line_Inner_Top`].textContent = "x"+intToString(data.attentionMult, 1);
                view.cached[`${actionVar}DownstreamAttentionBonus${downstreamVar}`].style.display = ""
            } else {
                view.cached[`${actionVar}DownstreamAttentionBonus${downstreamVar}`].style.display = "none"
            }
            if(actionObj[downstreamVar + "AttentionMult"] > 1.005) {
                view.cached[`${actionVar}DownstreamAttentionBonusLoop${downstreamVar}`].textContent = "x"+intToString(actionObj[downstreamVar + "AttentionMult"], 3);
                view.cached[`${actionVar}_${downstreamVar}_Line_Inner_Bottom`].textContent = "x"+intToString(actionObj[downstreamVar + "AttentionMult"], 3);
                view.cached[`${actionVar}DownstreamAttentionBonusLoop${downstreamVar}`].style.display = ""
                view.cached[`${actionVar}_${downstreamVar}_Line_Inner_Bottom`].style.display = ""
            } else {
                view.cached[`${actionVar}DownstreamAttentionBonusLoop${downstreamVar}`].style.display = "none"
                view.cached[`${actionVar}_${downstreamVar}_Line_Inner_Bottom`].style.display = "none"
            }



            //if downstream is invisible, hide it and the connecting line border
            //if downstream is invisible, hide relevant actionObj's slider area
            if(forceUpdate || downstreamObj.visible && view.cached[actionVar + "SliderContainer" + downstreamVar].style.display === "none") {
                if(!view.cached[actionVar + "_" + downstreamVar + "_Line_Outer"]) {
                    console.log('missing div for ' + actionVar + ', downstream: ' + downstreamVar);
                }
                if(downstreamObj.visible) {
                    view.cached[actionVar + "_" + downstreamVar + "_Line_Outer"].style.display = "";
                    view.cached[actionVar + "_" + downstreamVar + "_Line_Inner"].style.display = "";
                    view.cached[actionVar + "SliderContainer" + downstreamVar].style.display = "";
                } else {
                    view.cached[actionVar + "_" + downstreamVar + "_Line_Outer"].style.display = "none";
                    view.cached[actionVar + "_" + downstreamVar + "_Line_Inner"].style.display = "none";
                    view.cached[actionVar + "SliderContainer" + downstreamVar].style.display = "none";
                }
            }
        });
    }
}

function updateActionProgressBarViews(actionObj, prevAction, forceUpdate) {
    let actionVar = actionObj.actionVar;

    //Balance Needle
    if (forceUpdate || prevAction.momentumIncrease / prevAction.momentumDecrease !== actionObj.momentumIncrease / actionObj.momentumDecrease) {
        let balance = actionObj.momentumIncrease / actionObj.momentumDecrease;
        let needlePosition = Math.max(0, Math.min(100, balance * 50));

        view.cached[`${actionVar}BalanceNeedle`].style.left = `${needlePosition}%`;
    }

    //If exp/s is 3x greater than exp required, set progress to 100 width
    let isTooFast = actionObj.progressGain / actionObj.progressMax > 4;
    let prevTooFast = prevAction && prevAction.progressGain / prevAction.progressMax > 4;
    if(isTooFast && !prevTooFast && view.cached[`${actionVar}ProgressBarInner`].style.width !== "100%") {
        view.cached[`${actionVar}ProgressBarInner`].style.width = "100%";
    }

    view.cached[`${actionVar}IsMaxLevel`].style.display = (actionObj.maxLevel !== -1 && actionObj.level >= actionObj.maxLevel) ? "" : "none";
    if(actionObj.maxLevel !== -1 && actionObj.level >= actionObj.maxLevel) {
        view.cached[`${actionVar}Level2`].style.color = "var(--max-level-color)"
    } else {
        view.cached[`${actionVar}Level2`].style.color = "var(--text-primary)"
    }



    if (!isTooFast && (forceUpdate || prevAction.progress !== actionObj.progress)) {
        let progress = (actionObj.progress / actionObj.progressMax * 100);
        view.cached[`${actionVar}ProgressBarInner`].style.width = `${(progress > 100 ? 100 : progress)}%`;
    }

    if (forceUpdate || prevAction.exp !== actionObj.exp) {
        let exp = (actionObj.exp / actionObj.expToLevel * 100);
        view.cached[`${actionVar}ExpBarInner`].style.width = `${(exp > 100 ? 100 : exp)}%`;
    }

}

function updateActionStatViews(actionObj, prevAction, forceUpdate) {
    let actionVar = actionObj.actionVar;

    if(actionObj.expStats.length > 0) {
        if(view.cached[actionVar+"StatExpContainer"].style.display === "none") {
            view.cached[actionVar+"StatExpContainer"].style.display = "";
        }
        actionObj.expStats.forEach(function(expStat) {
            let statVar = expStat[0];
            if(forceUpdate || intToString(prevAction[statVar+"StatExpMult"], 3) !== intToString(actionObj[statVar+"StatExpMult"], 3)) {
                view.cached[actionVar + "_" + statVar + "StatExpMult"].innerText = intToString(actionObj[statVar + "StatExpMult"], 3);
            }
        });
    }

    if(actionObj.efficiencyStats.length > 0) {
        if(view.cached[actionVar+"StatExpertiseContainer"].style.display === "none") {
            view.cached[actionVar+"StatExpertiseContainer"].style.display = "";
        }
        actionObj.efficiencyStats.forEach(function(efficiencyStat) {
            let statVar = efficiencyStat[0];
            if(forceUpdate || intToString(prevAction[statVar+"StatExpertiseMult"], 3) !== intToString(actionObj[statVar+"StatExpertiseMult"], 3)) {
                view.cached[actionVar + "_" + statVar + "StatExpertiseMult"].innerText = intToString(actionObj[statVar + "StatExpertiseMult"], 3);
            }
        });
    }
}

function updateActionViewsForUpgrades(actionVar) {
    let actionObj = data.actions[actionVar];
    let prevAction = prevState.actions[actionVar];
    let forceUpdate = !prevAction || forceVisuals;

    view.cached[actionVar+"HighestLevelContainer"].style.display = data.upgrades.rememberWhatIDid.isFullyBought ? "" : "none";
    view.cached[actionVar+"HighestLevelContainer2"].style.display = data.upgrades.rememberWhatIDid.isFullyBought ? "" : "none";
    view.cached[actionVar+"SecondHighestLevelContainer"].style.display = data.upgrades.rememberHowIGrew.isFullyBought ? "" : "none";
    view.cached[actionVar+"ThirdHighestLevelContainer"].style.display = data.upgrades.rememberMyMastery.isFullyBought ? "" : "none";
    if(forceUpdate || prevAction.prevUnlockTime !== actionObj.prevUnlockTime) {
        view.cached[actionVar + "PrevUnlockTimeContainer"].style.display = actionObj.prevUnlockTime ? "" : "none";
        view.cached[actionVar + "PrevUnlockTime"].innerText = secondsToTime(actionObj.prevUnlockTime);
    }
}