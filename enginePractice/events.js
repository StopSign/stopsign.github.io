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


let scale = 1; // Initial scale value
const scaleStep = 0.1; // Value by which the scale changes per scroll
const minScale = 0.2; // Minimum scale value to prevent the content from becoming too small
const maxScale = 3; // Maximum scale value to prevent the content from becoming too large

windowElement.addEventListener('wheel', function(e) {
    e.preventDefault();

    const rect = windowElement.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const prevScale = scale;
    const delta = Math.sign(e.deltaY);

    // Zoom logic
    if (delta < 0) {
        scale += scaleStep;
    } else {
        scale -= scaleStep;
    }
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
});

function clearFuzziness(elem) {
    if(elem.style.display !== "none") {
        elem.style.display = "none";
        void elem.offsetWidth;
        elem.style.display = "";
    }
}


let isDragging = false;
let originalX, originalY;
let originalLeft, originalTop;

let originalMouseX, originalMouseY;
let transformX=0, transformY=0;
let originalTransformX, originalTransformY;
document.addEventListener('mousedown', function(e) {
    // console.log(e.clientX, e.target);
    if (e.target === windowElement || e.target === actionContainer) {
        isDragging = true;

        // Capture the initial position of the mouse and the container
        originalMouseX = e.clientX;
        originalMouseY = e.clientY;

        originalTransformX = transformX;
        originalTransformY = transformY;

        // const style = window.getComputedStyle(actionContainer);
        // originalLeft = parseInt(style.left, 10);
        // originalTop = parseInt(style.top, 10);
    }
});
document.addEventListener('mousemove', function(e) {
    if(!isDragging) {
        return;
    }
    // Calculate the new position
    const deltaX = e.clientX - originalMouseX;
    const deltaY = e.clientY - originalMouseY;

    // Proposed new position
    let newTransformX = originalTransformX + deltaX;
    let newTransformY = originalTransformY + deltaY;
    // console.log(newLeft);

    // Clamp range to [-4000, 4000]
    newTransformX = Math.max(-4000, Math.min(newTransformX, 4000));
    newTransformY = Math.max(-4000, Math.min(newTransformY, 4000));

    // Update our state
    transformX = newTransformX;
    transformY = newTransformY;

    // Update the position of the container
    actionContainer.style.transform = `translate(${transformX}px, ${transformY}px) scale(${scale})`;
});

document.addEventListener('mouseup', function() {
    isDragging = false;
});
function isInScreenRange(action) {
    const distanceX = Math.abs((transformX * -1) - (action.realX + 150) * scale + windowElement.offsetWidth / 2);
    const distanceY = Math.abs((transformY * -1) - (action.realY + 50) * scale + windowElement.offsetHeight / 2);
    const thresholdX = windowElement.offsetWidth / scale / 2 + 300;
    const thresholdY = windowElement.offsetHeight / scale / 2 + 300;
    return distanceX < thresholdX && distanceY < thresholdY;
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

function toggleDownstream(actionVar) {
    clickActionMenu(actionVar, "DownstreamContainer", "ToggleDownstreamButton", "downstream");
}

function toggleLevelInfo(actionVar) {
    clickActionMenu(actionVar, "LevelInfoContainer", "ToggleLevelInfoButton", "info");
}

function toggleStatsInfo(actionVar) {
    clickActionMenu(actionVar, "StatsContainer", "ToggleStatsInfoButton", "stats");
}

function toggleStory(actionVar) {
    clickActionMenu(actionVar, "StoryContainer", "ToggleStoryButton", "story");
}

//Each action needs which menu they've selected, to intelligently deselect colors, as well as to use in minimizing UI updates

function clickActionMenu(actionVar, containerId, buttonId, menuVar) {
    let container = document.getElementById(actionVar+containerId);
    let button = document.getElementById(actionVar+buttonId);

    let toggleOn = container.style.display === "none";
    deselectActionMenus(actionVar);
    if (toggleOn) {
        container.style.display = "block";
        button.style.backgroundColor = "var(--selection-color)";
    }
    //for setting which is updating
    data.actions[actionVar].currentMenu = menuVar;
}

function deselectActionMenus(actionVar) {
    document.getElementById(actionVar+"LevelInfoContainer").style.display = "none";
    document.getElementById(actionVar+"ToggleLevelInfoButton").style.removeProperty("background-color");
    view.cached[actionVar + "DownstreamContainer"].style.display = "none";
    document.getElementById(actionVar+"ToggleDownstreamButton").style.removeProperty("background-color");
    document.getElementById(actionVar+"StatsContainer").style.display = "none";
    document.getElementById(actionVar+"ToggleStatsInfoButton").style.removeProperty("background-color");
    document.getElementById(actionVar+"StoryContainer").style.display = "none";
    document.getElementById(actionVar+"ToggleStoryButton").style.removeProperty("background-color");
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
    document.getElementById('pauseButton').innerText = stop ? "Resume" : "Pause";
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
    let button = document.getElementById("statDisplayHideButton");
    let statDisplay = view.cached.statDisplay;
    if(statDisplay.style.display !== "none") {
        statDisplay.style.display = "none";
        button.style.left = "18px";
        button.style.top = "120px";
        button.innerText = "Stats >>";
    } else {
        statDisplay.style.display = "block";
        button.style.left = "388px";
        button.style.top = "110px";
        button.innerText = "<<";
    }
}