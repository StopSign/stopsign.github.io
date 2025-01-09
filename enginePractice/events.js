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

function updateSlider(fromAction, toAction) {
    let numValue = document.getElementById(fromAction + "NumInput" + toAction).value;
    let rangeInput = document.getElementById(fromAction + "RangeInput" + toAction);
    rangeInput.value = numValue;
    document.getElementById(fromAction+"_"+toAction+"_Line").style.opacity = (numValue/100*.8)+"";
    data.actions[fromAction]["downstreamRate"+toAction] = numValue;
}

function updateNumber(fromAction, toAction) {
    let rangeValue = document.getElementById(fromAction + "RangeInput" + toAction).value;
    document.getElementById(fromAction + "NumInput" + toAction).value = rangeValue;
    document.getElementById(fromAction+"_"+toAction+"_Line").style.opacity = (rangeValue/100*.8)+"";
    data.actions[fromAction]["downstreamRate"+toAction] = rangeValue;
}
function toggleAllZero(actionVar) {
    let action = data.actions[actionVar];
    action.downstreamVars.forEach(function (toAction) {
        if(!data.actions[toAction] || data.actions[toAction].momentumName !== action.momentumName) {
            return;
        }
        let fromAction = actionVar;
        document.getElementById(fromAction + "RangeInput" + toAction).value = 0;
        document.getElementById(fromAction+"_"+toAction+"_Line").style.opacity = 0+"";
        document.getElementById(fromAction + "DownstreamSendRate" + toAction).textContent = 0+"";
    });
}

function toggleAllHundred(actionVar) {
    let action = data.actions[actionVar];
    action.downstreamVars.forEach(function (toAction) {
        if(!data.actions[toAction] || data.actions[toAction].momentumName !== action.momentumName) {
            return;
        }
        let fromAction = actionVar;
        let numValue = 100;
        document.getElementById(fromAction + "RangeInput" + toAction).value = numValue;
        document.getElementById(fromAction + "NumInput" + toAction).value = numValue;
        document.getElementById(fromAction+"_"+toAction+"_Line").style.opacity = (numValue/100*.8)+"";
        // document.getElementById(fromAction + "DownstreamSendRate" + toAction).textContent = numValue;
    });
}

let isDragging = false;
let originalX, originalY;
let originalLeft, originalTop;

const windowElement = document.getElementById('windowElement');
const actionContainer = document.getElementById('actionContainer');

document.addEventListener('mousedown', function(e) {
    // console.log(e.clientX, e.target);
    if (e.target === windowElement || e.target === actionContainer) {
        isDragging = true;

        // Capture the initial position of the mouse and the container
        originalX = e.clientX;
        originalY = e.clientY;

        const style = window.getComputedStyle(actionContainer);
        originalLeft = parseInt(style.left, 10);
        originalTop = parseInt(style.top, 10);
    }
});

let scale = 1; // Initial scale value
const scaleStep = 0.1; // Value by which the scale changes per scroll
const minScale = 0.1; // Minimum scale value to prevent the content from becoming too small
const maxScale = 3; // Maximum scale value to prevent the content from becoming too large

windowElement.addEventListener('wheel', function(e) {
    // Prevent the default scrolling behavior
    e.preventDefault();

    // Determine the direction of the scroll
    const delta = Math.sign(e.deltaY);

    // Update the scale based on the direction
    if (delta < 0) {
        // Scrolling up, zoom in
        scale += scaleStep;
    } else {
        // Scrolling down, zoom out
        scale -= scaleStep;
    }

    // Clamp the scale value to the min and max scale limits
    scale = Math.min(Math.max(minScale, scale), maxScale);

    // Apply the scale transformation to the container
    actionContainer.style.transform = `scale(${scale})`;
});

document.addEventListener('mousemove', function(e) {
    if (isDragging) {
        // Calculate the new position
        const deltaX = e.clientX - originalX;
        const deltaY = e.clientY - originalY;

        // Proposed new position
        let newLeft = originalLeft + deltaX;
        let newTop = originalTop + deltaY;
        // console.log(newLeft);

        // Prevent the container from moving beyond the window's boundaries
        // The container should not move in a way that its right or bottom edges go inside the window's area
        newLeft = Math.min(newLeft, 0); // Prevent the left edge from going right
        newLeft = Math.max(newLeft, windowElement.offsetWidth - actionContainer.offsetWidth); // Prevent the right edge from going left

        newTop = Math.min(newTop, 0); // Prevent the top edge from going down
        newTop = Math.max(newTop, windowElement.offsetHeight - actionContainer.offsetHeight); // Prevent the bottom edge from going up

        // Update the position of the container
        actionContainer.style.left = `${newLeft}px`;
        actionContainer.style.top = `${newTop}px`;
        forceRedraw(windowElement);
    }
});

document.addEventListener('mouseup', function() {
    isDragging = false;
});
function forceRedraw(element) {
    return;
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

    let newLeft = -((actionObj.realX + 110) * scale) + windowElement.offsetWidth / 2 - 4000 ;
    let newTop = -((actionObj.realY + 50) * scale) + windowElement.offsetHeight / 2 - 4000 - 50;

    newLeft = Math.max(newLeft, windowElement.offsetWidth - actionContainer.offsetWidth);
    newTop = Math.max(newTop, windowElement.offsetHeight - actionContainer.offsetHeight);

    actionContainer.style.left = `${newLeft}px`;
    actionContainer.style.top = `${newTop}px`;
}

function toggleLevelInfo(actionVar) {
    clickActionMenu(actionVar, "LevelInfoContainer", "ToggleLevelInfoButton");
}

function toggleDownstream(actionVar) {
    clickActionMenu(actionVar, "DownstreamContainer", "ToggleDownstreamButton");
}

function toggleStatsInfo(actionVar) {
    clickActionMenu(actionVar, "StatsContainer", "ToggleStatsInfoButton");
}

function toggleStory(actionVar) {
    clickActionMenu(actionVar, "StoryContainer", "ToggleStoryButton");
}

function clickActionMenu(actionVar, containerId, buttonId) {
    let container = document.getElementById(actionVar+containerId);
    let button = document.getElementById(actionVar+buttonId);

    let toggleOn = container.style.display === "none";
    deselectActionMenus(actionVar);
    if (toggleOn) {
        container.style.display = "block";
        button.style.backgroundColor = "var(--warning-color)";
    }
}

function deselectActionMenus(actionVar) {
    document.getElementById(actionVar+"LevelInfoContainer").style.display = "none";
    document.getElementById(actionVar+"ToggleLevelInfoButton").style.removeProperty("background-color");
    document.getElementById(actionVar+"DownstreamContainer").style.display = "none";
    document.getElementById(actionVar+"ToggleDownstreamButton").style.removeProperty("background-color");
    document.getElementById(actionVar+"StatsContainer").style.display = "none";
    document.getElementById(actionVar+"ToggleStatsInfoButton").style.removeProperty("background-color");
    document.getElementById(actionVar+"StoryContainer").style.display = "none";
    document.getElementById(actionVar+"ToggleStoryButton").style.removeProperty("background-color");
}

const zoomInButton = document.getElementById('zoomInButton');
const zoomOutButton = document.getElementById('zoomOutButton');

zoomInButton.addEventListener('click', function() {
    scale = Math.min(scale + scaleStep, maxScale); // Zoom in
    actionContainer.style.transform = `scale(${scale})`;
});

zoomOutButton.addEventListener('click', function() {
    scale = Math.max(scale - scaleStep, minScale); // Zoom out
    actionContainer.style.transform = `scale(${scale})`;
});

function clickMenuButton() {
    let isShowing = document.getElementById("helpMenu").style.display !== "none";
    document.getElementById("helpMenu").style.display = isShowing ? "none" : "flex";
}

function changeDarkMode() {
    const body = document.body;

    // Toggle the dark-mode class
    body.classList.toggle('lightMode');
}

let selectedStat = null;
function clickedStatName(statName) {
    let theDiv = view.cached[statName+"Name"];

    //set all borders to black
    data.actionNames.forEach(function(actionVar) {
        if(view.cached[actionVar+"Container"].style.borderColor !== "black") {
            view.cached[actionVar + "Container"].style.borderColor = "black";
        }
    })
    //clear previous
    if(selectedStat) {
        view.cached[selectedStat + "Name"].style.border = "";
    }
    if(selectedStat === statName) {
        //clicked the same, so clear and return
        selectedStat = null;
        return;
    }

    //set new
    selectedStat = statName;
    theDiv.style.border = "2px solid black";
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
        actionObj.expertiseStats.forEach(function(statObj) {
            if(statObj[0] === statName) {
                statFoundInUse = true;
            }
        });

        let color = "black;"
        if(statFoundInUse && statFoundInGain) {
            color = "orange";
        }
        if(statFoundInUse && !statFoundInGain) {
            color = "blue";
        }
        if(!statFoundInUse && statFoundInGain) {
            color = "green";
        }
        view.cached[actionVar+"Container"].style.borderColor = color;
    });

}