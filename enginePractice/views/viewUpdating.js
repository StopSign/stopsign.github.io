let view = {
    cached: {}, //contains the elements that are being iterated over and updated regularly,
};

//This is the main function that is run once per 50ms
function updateView() {
    data.statNames.forEach(function(resName) {
        updateStatView(resName);
    });
    data.actionNames.forEach(function(actionName) {
        updateActionView(actionName);
    });
    updateGlobals();

    saveCurrentViewState();
}

function updateGlobals() {
    let totalMometum = 0;
    data.actionNames.forEach(function(actionName) {
        let actionObj = data.actions[actionName];
        if(actionObj.momentumName === "momentum" &&
            ((data.gameState === "default" && !actionObj.isKTL) || (data.gameState==="KTL"&&actionObj.isKTL))) {
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

//big performance improvements:
//TODO set numbers into 2 categories: zoomed in or zoomed out. At a certain zoom scale, it should switch, and the other numbers should not be updated
//TODO when zoomed in, only update the numbers within a certain x/y of current x/y. This means that the actions should be aware if they're visible or not
function updateActionView(actionName) {
    let action = data.actions[actionName];
    let prevAction = prevState.actions[actionName];
    let forceUpdate = !prevAction;

    let roundedNumbers = [["progress", 2], ["progressMax", 2], ["progressGain", 2],
        // ["realX", 1], ["realY", 1],
        ["actionPower", 3], ["momentum", 2], ["momentumDelta", 2], ["amountToSend", 3],
        ["level", 1], ["maxLevel", 1], ["tier", 1],
        ["exp", 2], ["expToLevel", 2], ["expToAdd", 2], ["momentumIncrease", 2], ["momentumDecrease", 2], ["actionPowerMult", 3],
        ["totalSend", 3], ["expToLevelMult", 5], ["expertiseMult", 3], ["expertiseBase", 2],
        ["unlockCost", 2], ["expertise", 1]];
    let roundWithoutSig = ["progressMaxIncrease", "expToLevelIncrease"];

    roundedNumbers.forEach(obj => {
        let capName = capitalizeFirst(obj[0]);
        let elem = view.cached[`${actionName}${capName}`];
        let nameNoNums = obj[0].replace(/\d+/g, '');
        if(!elem) {
            return;
        }
        if(forceUpdate || intToString(prevAction[nameNoNums], obj[1]) !== intToString(action[nameNoNums], obj[1])) {
            elem.innerText = intToString(action[nameNoNums], obj[1]);
        }
    })

    let roundedColoredNumbers = [["efficiency", 2]];
    roundedColoredNumbers.forEach(obj => {
        let capName = capitalizeFirst(obj[0]);
        let elem = view.cached[`${actionName}${capName}`];
        let nameNoNums = obj[0].replace(/\d+/g, '');
        if(!elem) {
            return;
        }
        if(forceUpdate || intToString(prevAction[nameNoNums], obj[1]) !== intToString(action[nameNoNums], obj[1])) {
            elem.innerText = intToString(action[nameNoNums], obj[1]);
            elem.style.color = `rgb(${Math.round(20+189*(1-(action[nameNoNums]/100)))},${Math.round(20+189*(action[nameNoNums]/100))},100)`;
        }
    })

    roundWithoutSig.forEach(obj => {
        let capName = capitalizeFirst(obj);
        let elem = view.cached[`${actionName}${capName}`];
        let nameNoNums = obj.replace(/\d+/g, '');
        if(!elem) {
            return;
        }
        if(forceUpdate || prevAction[nameNoNums] !== action[nameNoNums]) {
            elem.innerText = action[nameNoNums];
        }
    })


    //TODO only update if needed
    if(action.expStats) {
        action.expStats.forEach(function(expStat) {
            document.getElementById(`${actionName}_${expStat[0]}StatExpMult`).innerText = intToString(action[expStat[0]+"StatExpMult"], 3);
        });
    }
    if(action.efficiencyStats) {
        action.efficiencyStats.forEach(function(expertiseStat) {
            document.getElementById(`${actionName}_${expertiseStat[0]}StatExpertiseMult`).innerText = intToString(action[expertiseStat[0]+"StatExpertiseMult"], 3);
        });
    }

    if (forceUpdate || prevAction.progress !== action.progress) {
        let progress = (action.progress / action.progressMax * 100);
        view.cached[`${actionName}ProgressBarInner`].style.width = `${(progress > 100 ? 100 : progress)}%`;
    }

    if (forceUpdate || prevAction.exp !== action.exp) {
        let exp = (action.exp / action.expToLevel * 100);
        view.cached[`${actionName}ExpBarInner`].style.width = `${(exp > 100 ? 100 : exp)}%`;
    }

    if(action.downstreamVars) {
        action.downstreamVars.forEach(function (downstreamVar) {
            let downstreamObj = data.actions[downstreamVar];
            if(!downstreamObj || downstreamObj.momentumName !== action.momentumName) {
                return;
            }

            if (forceUpdate || prevAction.momentum !== action.momentum) {
                let rangeValue = document.getElementById(actionName + "RangeInput" + downstreamVar).value;
                if(downstreamObj.unlocked) {
                    view.cached[`${actionName}DownstreamSendRate${downstreamVar}`].textContent = intToString((rangeValue / 100) * action.progressRateReal() * ticksPerSecond, 4);
                    //downstream send rate = rangeValue / 100 * current momentum * tier
                } else {
                    view.cached[`${actionName}DownstreamSendRate${downstreamVar}`].textContent = intToString((rangeValue / 100) * action.progressRateReal() * ticksPerSecond, 4);
                    //it's not the downstreamObj's progressRateReal, it's the current object's send rate times the efficiency times the slider setting

                }
            }

            //if downstream is invisible, hide it and the connecting line border
            //if downstream is invisible, hide relevant action's slider area
            let prevDownstreamObj = prevState.actions[downstreamVar];
            if(forceUpdate || prevDownstreamObj.visible !== downstreamObj.visible) {
                if(!view.cached[actionName + "_" + downstreamVar + "_Line_Outer"]) {
                    console.log('missing div for ' + actionName + ', downstream: ' + downstreamVar);
                }
                if(downstreamObj.visible) {
                    view.cached[actionName + "_" + downstreamVar + "_Line_Outer"].style.display = "";
                    view.cached[actionName + "_" + downstreamVar + "_Line_Inner"].style.display = "";
                    view.cached[actionName + "SliderContainer" + downstreamVar].style.display = "";
                } else {
                    view.cached[actionName + "_" + downstreamVar + "_Line_Outer"].style.display = "none";
                    view.cached[actionName + "_" + downstreamVar + "_Line_Inner"].style.display = "none";
                    view.cached[actionName + "SliderContainer" + downstreamVar].style.display = "none";
                }
            }
        });
    }

    if(forceUpdate || prevAction.unlocked !== action.unlocked) {
        if(action.unlocked) {
            view.cached[actionName + "LockContainer"].style.display = "none";
        } else {
            view.cached[actionName + "LockContainer"].style.display = "";
        }
    }

    if(forceUpdate || (prevAction.visible !== action.visible) || (prevAction.isRunning !== action.isRunning)) {
        if(action.visible && action.isRunning) {
            view.cached[actionName + "Container"].style.display = "";
            if(action.parent) {
                view.cached[action.parent + "_" + actionName + "_Line_Outer"].style.display = "";
                view.cached[action.parent + "_" + actionName + "_Line_Inner"].style.display = "";
            }
        } else {
            view.cached[actionName + "Container"].style.display = "none";
            if(action.parent) {
                view.cached[action.parent + "_" + actionName + "_Line_Outer"].style.display = "none";
                view.cached[action.parent + "_" + actionName + "_Line_Inner"].style.display = "none";
            }
        }
        //the unlocked action's parent_action_Line needs to be made visible too
        //the option in the send list needs to be made visible too
    }
}