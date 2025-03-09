let view = {
    cached: {}, //contains the elements that are being iterated over and updated regularly,
};

//This is the main function that is run once per 50ms
function updateView() {
    data.statNames.forEach(function(resName) {
        updateStatView(resName);
    });
    data.actionNames.forEach(function(actionVar) {
        updateActionView(actionVar);
    });
    updateGlobals();

    saveCurrentViewState();

    //in case this was set
    forceVisuals = false;
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
    if(view.cached.secondsPerReset.innerText !== secondsToTime(data.secondsPerReset)) {
        view.cached.secondsPerReset.innerText = secondsToTime(data.secondsPerReset);
    }
    if(view.cached.essence.innerText !== intToString(data.essence, 1)) {
        view.cached.essence.innerText = intToString(data.essence, 1);
        view.cached.essence2.innerText = intToString(data.essence, 1);
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
    let stat = data.stats[statName];
    let prevStat = prevState.stats[statName];
    let forceUpdate = !prevStat;
    let roundedNumbers = [["num", 2], ["perSecond", 2], ["mult", 3]];

    roundedNumbers.forEach(obj => {
        let capName = capitalizeFirst(obj[0]);
        if(forceUpdate || intToString(prevStat[obj[0]], obj[1]) !== intToString(stat[obj[0]], obj[1])) {
            view.cached[`${statName}${capName}`].innerText = intToString(stat[obj[0]], obj[1]);
        }
    })

    let color = getStatColor(statName);
    if(forceUpdate || view.cached[`${statName}Name`].style.color !== color) {
        view.cached[`${statName}Name`].style.color = color;
    }
}

function updateActionForVisibility(actionObj, prevAction, forceUpdate) {
    let actionVar = actionObj.actionVar;

    let miniVersion = scale < .45;
    if(prevState.scale !== scale && miniVersion && view.cached[`${actionVar}LargeVersionContainer`].style.display !== "none") {
        //switch to mini versions
        view.cached[`${actionVar}LargeVersionContainer`].style.display = "none"
        view.cached[`${actionVar}Container`].style.pointerEvents = "none";
        view.cached[`${actionVar}SmallVersionContainer`].style.display = "";
        forceUpdate = true;
    } else if(prevState.scale !== scale && !miniVersion && view.cached[`${actionVar}LargeVersionContainer`].style.display === "none") {
        //switch to large versions
        view.cached[`${actionVar}LargeVersionContainer`].style.display = ""
        view.cached[`${actionVar}Container`].style.pointerEvents = "";
        view.cached[`${actionVar}SmallVersionContainer`].style.display = "none";
        forceUpdate = true;
    }

    if(prevState.scale !== scale) {
        view.cached[`${actionVar}SmallVersionContainer`].style.scale = (1 / scale)*.8+"";
    }

    if(forceUpdate || (prevAction.visible !== actionObj.visible) || (prevAction.isRunning !== actionObj.isRunning)) {
        if(actionObj.visible && actionObj.isRunning && gameStateMatches(actionObj)) {
            view.cached[actionVar + "Container"].style.display = "";
            if(actionObj.parent) {
                view.cached[actionObj.parent + "_" + actionVar + "_Line_Outer"].style.display = "";
                view.cached[actionObj.parent + "_" + actionVar + "_Line_Inner"].style.display = "";
            }
        } else {
            view.cached[actionVar + "Container"].style.display = "none";
            if(actionObj.parent) {
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
    return forceUpdate;
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

    //split into different sections: update based on menu
    let roundedNumbers = [
        ["progress", 2], ["progressMax", 2], ["progressGain", 2],
        ["momentum", 2], ["momentumDelta", 2], ["level", 1], ["maxLevel", 1], ["tier", 1],
        ["exp", 2], ["expToLevel", 2], ["expToAdd", 2], ["momentumIncrease", 2], ["momentumDecrease", 2],
        ["expertise", 1], ["highestLevel2", 1],
    ];

    if(forceUpdate || !actionObj.unlocked) {
        roundedNumbers.push(["unlockCost", 2]);
    }
    if(forceUpdate || actionObj.unlocked) {
        if (forceUpdate || actionObj.currentMenu === "downstream") {
            roundedNumbers.push(["totalSend", 3]);
        }
        if (forceUpdate || actionObj.currentMenu === "info") {
            roundedNumbers.push(["amountToSend", 3]);
            roundedNumbers.push(["actionPower", 3]);
            roundedNumbers.push(["actionPowerMult", 3]);
            roundedNumbers.push(["highestLevel", 1]);
            roundedNumbers.push(["secondHighestLevel", 1]);
            roundedNumbers.push(["thirdHighestLevel", 1]);
            roundedNumbers.push(["prevUnlockTime", 1]);

        }
        if (forceUpdate || actionObj.currentMenu === "stats") {
            roundedNumbers.push(["expToLevelMult", 5]);
            roundedNumbers.push(["expertiseMult", 3]);
            roundedNumbers.push(["expertiseBase", 2]);
        }
        if(forceUpdate || scale < .45) { //miniversion
            roundedNumbers.push(["level2", 1]);
        }
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

    if(forceUpdate || actionObj.currentMenu === "downstream") {
        updateActionDownstreamViews(actionObj, prevAction, forceUpdate);
    }
    if(forceUpdate || actionObj.currentMenu === "info") {
        updateActionStatViews(actionObj, prevAction, forceUpdate);
    }
    updateActionProgressBarViews(actionObj, prevAction, forceUpdate);

    //Fixes a memory leak with prev actionObj references hanging around due to having live references
    prevAction = {};
}

function updateActionDownstreamViews(actionObj, prevAction, forceUpdate) {
    let actionVar = actionObj.actionVar;

    if(actionObj.downstreamVars) {
        actionObj.downstreamVars.forEach(function (downstreamVar) {
            let downstreamObj = data.actions[downstreamVar];
            if(!downstreamObj || downstreamObj.momentumName !== actionObj.momentumName) {
                return;
            }

            if (forceUpdate || prevAction.momentum !== actionObj.momentum) {
                let rangeValue = document.getElementById(actionVar + "RangeInput" + downstreamVar).value;
                if(downstreamObj.unlocked) {
                    view.cached[`${actionVar}DownstreamSendRate${downstreamVar}`].textContent = intToString((rangeValue / 100) * actionObj.progressRateReal() * ticksPerSecond, 4);
                    //downstream send rate = rangeValue / 100 * current momentum * tier
                } else {
                    view.cached[`${actionVar}DownstreamSendRate${downstreamVar}`].textContent = intToString((rangeValue / 100) * actionObj.progressRateReal() * ticksPerSecond, 4);
                    //it's not the downstreamObj's progressRateReal, it's the current object's send rate times the efficiency times the slider setting
                }
            }

            //if downstream is invisible, hide it and the connecting line border
            //if downstream is invisible, hide relevant actionObj's slider area
            let prevDownstreamObj = prevState.actions[downstreamVar];
            if(forceUpdate || prevDownstreamObj.visible !== downstreamObj.visible) {
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

    //If exp/s is 3x greater than exp required, set progress to 100 width
    let isTooFast = actionObj.progressGain / actionObj.progressMax > 4;
    let prevTooFast = prevAction && prevAction.progressGain / prevAction.progressMax > 4;
    if(isTooFast && !prevTooFast) {
        view.cached[`${actionVar}ProgressBarInner`].style.width = `100%`;
    }

    if (!isTooFast && (forceUpdate || prevAction.progress !== actionObj.progress)) {
        let progress = (actionObj.progress / actionObj.progressMax * 100);
        view.cached[`${actionVar}ProgressBarInner`].style.width = `${(progress > 100 ? 100 : progress)}%`;
    }

    if (forceUpdate || prevAction.exp !== actionObj.exp) {
        let exp = (actionObj.exp / actionObj.expToLevel * 100);
        view.cached[`${actionVar}ExpBarInner`].style.width = `${(exp > 100 ? 100 : exp)}%`;
    }

    if (forceUpdate || prevAction.momentumIncrease / prevAction.momentumDecrease !== actionObj.momentumIncrease / actionObj.momentumDecrease) {
        let balance = actionObj.momentumIncrease / actionObj.momentumDecrease;
        let needlePosition = Math.max(0, Math.min(100, balance * 50));

        view.cached[`${actionVar}BalanceNeedle`].style.left = `${needlePosition}%`;
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

    view.cached[actionVar+"HighestLevelContainer"].style.display = data.upgrades.rememberWhatIDid.isBought ? "" : "none";
    view.cached[actionVar+"HighestLevelContainer2"].style.display = data.upgrades.rememberWhatIDid.isBought ? "" : "none";
    view.cached[actionVar+"SecondHighestLevelContainer"].style.display = data.upgrades.rememberHowIGrew.isBought ? "" : "none";
    view.cached[actionVar+"ThirdHighestLevelContainer"].style.display = data.upgrades.rememberMyMastery.isBought ? "" : "none";
    if(forceUpdate || prevAction.prevUnlockTime !== actionObj.prevUnlockTime) {
        view.cached[actionVar + "PrevUnlockTimeContainer"].style.display = actionObj.prevUnlockTime ? "" : "none";
        view.cached[actionVar + "PrevUnlockTime"].innerText = secondsToTime(actionObj.prevUnlockTime);
    }
}