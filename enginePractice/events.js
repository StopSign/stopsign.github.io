let downStreamRatios = {};
downStreamRatios.momentum = {};


// let previousValue = document.getElementById('momentumDownstream1').value;
function changeDownstream(inputField, varName, targetVar, index) {
    let value = inputField.value;

    let ratios = downStreamRatios[varName];
    let targetRatio = 5;

    if(!isNaN(value) && value >= 0 && value <= 100) {
        previousValue = value;
    } else {
        inputField.value = previousValue;
    }
}

function validateInput(fromAction, toAction) {
    let numInput = document.getElementById(fromAction + "NumInput" + toAction);
    let value = parseInt(numInput.value);

    if (value < 0 || value > 100 || isNaN(value)) {
        numInput.value = "0";
        alert("Please enter a number between 0 and 100.");
    }
}

function setSliderUI(fromAction, toAction, newValue) {
    if(!fromAction || !toAction || !document.getElementById(fromAction + "NumInput" + toAction)) {
        console.log('trying to set it from: ' + fromAction + ', ' + toAction + ' with val ' + newValue);
        return;
    }
    if(newValue === -1) {
        if(data.actions[fromAction]["downstreamRate"+toAction]) { //no automatic change if already set
            return;
        }
        newValue = 100;
    }

    document.getElementById(fromAction + "NumInput" + toAction).value = newValue;
    document.getElementById(fromAction + "RangeInput" + toAction).value = newValue;
    document.getElementById(fromAction+"_"+toAction+"_Line_Inner").style.height = (newValue/100*20)+"px";
    data.actions[fromAction]["downstreamRate"+toAction] = Math.max(0, newValue);
}
function downstreamNumberChanged(fromAction, toAction) {
    let newValue = document.getElementById(fromAction + "NumInput" + toAction).value;
    setSliderUI(fromAction, toAction, newValue)
}

function downstreamSliderChanged(fromAction, toAction) {
    let newValue = document.getElementById(fromAction + "RangeInput" + toAction).value;
    setSliderUI(fromAction, toAction, newValue);
}
function toggleAllZero(actionVar) {
    let actionObj = data.actions[actionVar];
    actionObj.downstreamVars.forEach(function (toAction) {
        let downstreamAction = data.actions[toAction];
        if(!downstreamAction || downstreamAction.momentumName !== actionObj.momentumName || !downstreamAction.visible) {
            return;
        }
        setSliderUI(actionVar, toAction, 0);
    });
}
function toggleAllHundred(actionVar) {
    let actionObj = data.actions[actionVar];
    actionObj.downstreamVars.forEach(function (toAction) {
        let downstreamAction = data.actions[toAction];
        if(!downstreamAction || downstreamAction.momentumName !== actionObj.momentumName || !downstreamAction.visible) {
            return;
        }
        setSliderUI(actionVar, toAction, 100);
    });
}


const windowElement = document.getElementById('windowElement');
const actionContainer = document.getElementById('actionContainer');


let scale = 1;
const scaleStep = 0.1;
const minScale = 0.2;
const maxScale = 3;

let isDragging = false;
let originalX, originalY;
let originalLeft, originalTop;

let originalMouseX, originalMouseY;
let transformX=0, transformY=0;
let originalTransformX, originalTransformY;

let initialPinchDistance = null;
let lastTouchScale = 1;
let isTouchDragging = false;
windowElement.addEventListener('wheel', function(e) {
    e.preventDefault();

    const rect = windowElement.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const prevScale = scale;
    const delta = Math.sign(e.deltaY);

    scale += delta < 0 ? scaleStep : -scaleStep;
    scale = Math.min(Math.max(minScale, scale), maxScale);

    // Adjust translation to zoom at mouse position
    const scaleFactor = scale / prevScale;
    const dx = (mouseX - transformX) * (1 - scaleFactor);
    const dy = (mouseY - transformY) * (1 - scaleFactor);

    transformX += dx;
    transformY += dy;

    actionContainer.style.transform = `translate(${transformX}px, ${transformY}px) scale(${scale})`;

    for (let actionVar in data.actions) {
        clearFuzziness(view.cached[actionVar + "Container"]);
    }
}, { passive: false });

function clearFuzziness(elem) {
    if(elem.style.display !== "none") {
        elem.style.display = "none";
        void elem.offsetWidth;
        elem.style.display = "";
    }
}

document.addEventListener('mousedown', function(e) {
    if (e.target === windowElement || e.target === actionContainer) {
        isDragging = true;

        originalMouseX = e.clientX;
        originalMouseY = e.clientY;

        originalTransformX = transformX;
        originalTransformY = transformY;
    }
});
document.addEventListener('mousemove', function(e) {
    if(!isDragging) {
        return;
    }
    const deltaX = e.clientX - originalMouseX;
    const deltaY = e.clientY - originalMouseY;

    // Clamp range to [-4000, 4000]
    transformX = Math.max(-4000, Math.min(originalTransformX + deltaX, 4000));
    transformY = Math.max(-4000, Math.min(originalTransformY + deltaY, 4000));

    // Update the position of the container
    actionContainer.style.transform = `translate(${transformX}px, ${transformY}px) scale(${scale})`;
});

document.addEventListener('mouseup', function() {
    isDragging = false;
});


// Touch start
windowElement.addEventListener('touchstart', function(e) {
    if (e.touches.length === 2) {
        e.preventDefault();
        initialPinchDistance = getTouchDistance(e.touches[0], e.touches[1]);
        lastTouchScale = scale;
        isTouchDragging = false;
    } else if (e.touches.length === 1) {
        // Single finger drag
        const touch = e.touches[0];
        originalMouseX = touch.clientX;
        originalMouseY = touch.clientY;
        originalTransformX = transformX;
        originalTransformY = transformY;
        isTouchDragging = true;
    }
}, { passive: false });

// Touch move
windowElement.addEventListener('touchmove', function(e) {
    if (e.touches.length === 2 && initialPinchDistance) {
        e.preventDefault();

        const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
        const pinchScale = currentDistance / initialPinchDistance;
        let newScale = lastTouchScale * pinchScale;

        newScale = Math.min(Math.max(minScale, newScale), maxScale);
        const prevScale = scale;
        scale = newScale;

        const rect = windowElement.getBoundingClientRect();
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;

        const scaleFactor = scale / prevScale;
        const dx = (midX - transformX) * (1 - scaleFactor);
        const dy = (midY - transformY) * (1 - scaleFactor);

        transformX += dx;
        transformY += dy;

        applyTransform();
    } else if (e.touches.length === 1 && isTouchDragging) {
        e.preventDefault();

        const touch = e.touches[0];
        const deltaX = touch.clientX - originalMouseX;
        const deltaY = touch.clientY - originalMouseY;

        applyPan(originalTransformX + deltaX, originalTransformY + deltaY);
    }
}, { passive: false });

// Touch end
windowElement.addEventListener('touchend', function(e) {
    if (e.touches.length < 2) {
        initialPinchDistance = null;
    }
    if (e.touches.length === 0) {
        isTouchDragging = false;
    }
});

// Reusable helpers
function getDistance(t1, t2) {
    const dx = t2.clientX - t1.clientX;
    const dy = t2.clientY - t1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function applyPan(x, y) {
    transformX = Math.max(-4000, Math.min(x, 4000));
    transformY = Math.max(-4000, Math.min(y, 4000));
    applyTransform();
}

function applyTransform() {
    actionContainer.style.transform = `translate(${transformX}px, ${transformY}px) scale(${scale})`;
    for (let actionVar in data.actions) {
        clearFuzziness(view.cached[actionVar + "Container"]);
    }
}

function getTouchDistance(touch1, touch2) {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function isInScreenRange(action) {
    return true;
    //Major performance issue with .offsetWidth - it invalidates the cache
    // const distanceX = Math.abs((transformX * -1) - (action.realX + 150) * scale + windowElement.offsetWidth / 2);
    // const distanceY = Math.abs((transformY * -1) - (action.realY + 50) * scale + windowElement.offsetHeight / 2);
    // const thresholdX = windowElement.offsetWidth / scale / 2 + 300;
    // const thresholdY = windowElement.offsetHeight / scale / 2 + 300;
    // return distanceX < thresholdX && distanceY < thresholdY;
}
function forceRedraw(element) {
    // Save the current display style
    const display = element.style.display;

    // Change the display property to 'none', then back to its original value
    element.style.display = 'none';

    // This empty access to offsetHeight forces the browser to do a repaint
    element.offsetHeight;

    // Restore the original display style
    element.style.display = display;
}

function actionTitleClicked(actionVar) {
    let actionObj = data.actions[actionVar];

    let newTransformX = -((actionObj.realX + 150) * scale) + windowElement.offsetWidth / 2 ;
    let newTransformY = -((actionObj.realY) * scale) + windowElement.offsetHeight / 2 - 50;

    newTransformX = Math.max(-4000, Math.min(newTransformX, 4000));
    newTransformY = Math.max(-4000, Math.min(newTransformY, 4000));

    // Update our state
    transformX = newTransformX;
    transformY = newTransformY;

    // Update the position of the container
    actionContainer.style.transform = `translate(${newTransformX}px, ${newTransformY}px) scale(${scale})`;
}


function clickActionMenu(actionVar, menuVar, isLoad) {
    let actionObj = data.actions[actionVar];
    if(!menuVar) {
        return;
    }

    if(actionObj.currentMenu && !isLoad) {
        view.cached[actionVar + "_" + actionObj.currentMenu + "Container"].style.display = "none";
        view.cached[actionVar + "_" + actionObj.currentMenu + "MenuButton"].style.removeProperty("background-color");
    }

    if(actionObj.currentMenu === menuVar && !isLoad) {
        data.actions[actionVar].currentMenu = "";
        return;
    }

    view.cached[actionVar + "_" + menuVar + "Container"].style.display = "";
    view.cached[actionVar + "_" + menuVar + "MenuButton"].style.backgroundColor = "var(--selection-color)";

    data.actions[actionVar].currentMenu = menuVar;
}

const zoomInButton = document.getElementById('zoomInButton');
const zoomOutButton = document.getElementById('zoomOutButton');
const centerScreenButton = document.getElementById('centerScreenButton');

zoomInButton.addEventListener('click', function() {
    scale = Math.min(scale + scaleStep, maxScale); // Zoom in
    actionContainer.style.transform = `translate(${transformX}px, ${transformY}px) scale(${scale})`;

    for (let actionVar in data.actions) {
        clearFuzziness(view.cached[actionVar + "Container"]);
    }
});

zoomOutButton.addEventListener('click', function() {
    scale = Math.max(scale - scaleStep, minScale); // Zoom out
    actionContainer.style.transform = `translate(${transformX}px, ${transformY}px) scale(${scale})`;

    for (let actionVar in data.actions) {
        clearFuzziness(view.cached[actionVar + "Container"]);
    }
});

centerScreenButton.addEventListener('click', function() {
    actionTitleClicked('overclock');
});


function clickMenuButton() {
    let isShowing = document.getElementById("helpMenu").style.display !== "none";
    document.getElementById("helpMenu").style.display = isShowing ? "none" : "flex";
}


let selectedStat = null;
function clickedStatName(statName) {
    //clear all borders
    data.actionNames.forEach(function(actionVar) {
        if(view.cached[actionVar+"LargeVersionContainer"].style.borderColor !== "black") {
            view.cached[actionVar + "LargeVersionContainer"].style.borderColor = "black";
            view.cached[actionVar + "SmallVersionContainer"].style.border = "";
        }
    })

    //clear previous
    if(selectedStat) {
        view.cached[selectedStat + "StatContainer"].style.border = "";
    }
    if(selectedStat === statName) {
        //clicked the same, so clear and return
        selectedStat = null;
        return;
    }

    let theDiv = view.cached[statName+"StatContainer"];
    selectedStat = statName;
    theDiv.style.border = "2px solid var(--text-primary)";
    //Change the border colors of all actions that are relevant
    //for each action, for each statList, if this stat is found, set the boolean
    //var + "Container" .style.borderColor = getStatColor(statName);

    data.actionNames.forEach(function(actionVar) {
        let actionObj = data.actions[actionVar];
        let statFoundInGain = false;
        actionObj.onLevelStats.forEach(function(statObj) {
            if(statObj[0] === statName) {
                statFoundInGain = true;
            }
        });
        let statFoundInUse = false;
        actionObj.expStats.forEach(function(statObj) {
            if(statObj[0] === statName) {
                statFoundInUse = true;
            }
        });
        actionObj.efficiencyStats.forEach(function(statObj) {
            if(statObj[0] === statName) {
                statFoundInUse = true;
            }
        });

        let color = "black;"
        if(statFoundInUse && statFoundInGain) {
            color = "yellow";
        }
        if(statFoundInUse && !statFoundInGain) {
            color = "blue";
        }
        if(!statFoundInUse && statFoundInGain) {
            color = "green";
        }
        view.cached[actionVar+"LargeVersionContainer"].style.borderColor = color;
        view.cached[actionVar + "SmallVersionContainer"].style.border = "2px solid "+color;
    });

}


//to be run when the jobs level up
function changeJob(actionVar) {
    //if the given job is better than the existing job, then switch
    let contender = data.actions[actionVar];
    if(!contender) {
        return;
    }
    let contenderWage = contender.wage;
    if(contenderWage > data.currentWage) {
        data.currentWage = contenderWage;
        data.currentJob = actionVar;
    }

    //set displayed
    document.getElementById("jobTitle").innerText = data.actions[data.currentJob] ? data.actions[data.currentJob].title : data.currentJob;
    document.getElementById("jobWage").innerText = intToString(data.currentWage, 2);
}

function pauseGame() {
    stop = !stop;
    if(stop) {
        document.title = "*PAUSED* KTL";
    } else {
        document.title = "KTL";
    }
    document.getElementById('pauseButton').innerText = stop ? "Resume" : "Pause";
    save();
}

function stopClicks(event) {
    event.stopPropagation();
}

function increaseGamespeed() {
    gameSpeed *= 2;
    console.log('gamespeed increased to ' + gameSpeed);
}

function resetGamespeed() {
    gameSpeed = 1;
    console.log('gamespeed set to ' + gameSpeed);
}

function statMenuHideButton() {
    let button = document.getElementById("statDisplayShowButton");
    let statDisplay = view.cached.statDisplay;
    if(statDisplay.style.display !== "none") {
        statDisplay.style.display = "none";
        button.style.display = "";
    } else {
        statDisplay.style.display = "block";
        button.style.display = "none";
    }
}

function bonusMenuHideButton() {
    let button = document.getElementById("bonusDisplayShowButton");
    let bonusDisplay = view.cached.bonusDisplay;
    if(bonusDisplay.style.display !== "none") {
        bonusDisplay.style.display = "none";
        button.style.display = "";
    } else {
        bonusDisplay.style.display = "block";
        button.style.display = "none";
    }
}

function toggleBonusSpeed() {
    if(bonusSpeed > 1 || bonusTime <= 1000) {
        bonusSpeed = 1;
        document.getElementById("toggleBonusSpeedButton").style.backgroundColor = "red";
        document.getElementById("toggleBonusSpeedButton").innerText = "Enable Bonus Speed";
    } else {
        bonusSpeed = data.options.bonusRate;
        document.getElementById("toggleBonusSpeedButton").style.backgroundColor = "green";
        document.getElementById("toggleBonusSpeedButton").innerText = "Disable Bonus Speed";
    }
}

function changeBonusSpeed(num) {
    data.options.bonusRate = num;
}