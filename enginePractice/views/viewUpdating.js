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


    saveCurrentViewState();
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
            view.cached[`${statName}${capName}`].innerHTML = intToString(stat[obj[0]], obj[1]);
        }
    })

    let color = getStatColor(statName);
    if(forceUpdate || view.cached[`${statName}Name`].style.color !== color) {
        view.cached[`${statName}Name`].style.color = color;
    }
}


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
            elem.innerHTML = intToString(action[nameNoNums], obj[1]);
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
            elem.innerHTML = intToString(action[nameNoNums], obj[1]);
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
            elem.innerHTML = action[nameNoNums];
        }
    })



    //TODO refactor to be generic ? / not update constantly
    if(action.expStats) {
        action.expStats.forEach(function(expStat) {
            document.getElementById(`${actionName}_${expStat[0]}StatExpMult`).innerHTML = intToString(action[expStat[0]+"StatExpMult"], 3);
        });
    }
    if(action.efficiencyStats) {
        action.efficiencyStats.forEach(function(expertiseStat) {
            document.getElementById(`${actionName}_${expertiseStat[0]}StatExpertiseMult`).innerHTML = intToString(action[expertiseStat[0]+"StatExpertiseMult"], 3);
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
                if(!document.getElementById(actionName + "_" + downstreamVar + "_Line_Border")) {
                    console.log('missing div for ' + actionName + ', downstream: ' + downstreamVar);
                }
                if(downstreamObj.visible) {
                    view.cached[downstreamVar+"Container"].style.display = "block";
                    document.getElementById(actionName + "_" + downstreamVar + "_Line_Border").style.display = "block";
                    document.getElementById(actionName + "_" + downstreamVar + "_Line").style.display = "block";
                    document.getElementById(actionName + "SliderContainer" + downstreamVar).style.display = "block";
                } else {
                    view.cached[actionName+"Container"].style.display = "none";
                    document.getElementById(actionName + "_" + downstreamVar + "_Line_Border").style.display = "none";
                    document.getElementById(actionName + "_" + downstreamVar + "_Line").style.display = "none";
                    document.getElementById(actionName + "SliderContainer" + downstreamVar).style.display = "none";
                }
            }
        });
    }

    if(forceUpdate || prevAction.unlocked !== action.unlocked) {
        if(action.unlocked) {
            document.getElementById(actionName + "LockContainer").style.display = "none";
        } else {
            document.getElementById(actionName + "LockContainer").style.display = "block";
        }
    }

    if(forceUpdate || prevAction.visible !== action.visible) {
        if(action.visible) {
            document.getElementById(actionName + "Container").style.display = "block";
            if(action.parent) {
                document.getElementById(action.parent + "_" + actionName + "_Line_Border").style.display = "block";
                document.getElementById(action.parent + "_" + actionName + "_Line").style.display = "block";
            }
        } else {
            document.getElementById(actionName + "Container").style.display = "none";
            if(action.parent) {
                document.getElementById(action.parent + "_" + actionName + "_Line_Border").style.display = "none";
                document.getElementById(action.parent + "_" + actionName + "_Line").style.display = "none";
            }
        }
        //the unlocked action's parent_action_Line needs to be made visible too
        //the option in the send list needs to be made visible too
    }
}