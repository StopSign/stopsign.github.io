function updateCustomThumbPosition(actionVar, downstreamVar, newValue) {
    const thumb = document.getElementById(actionVar + "Thumb" + downstreamVar);
    const thumbPosition = (newValue / 100) * 230;
    thumb.style.left = thumbPosition + 'px';
}

function setSliderUI(fromAction, toAction, newValue) {
    if (!fromAction || !toAction || !document.getElementById(fromAction + "NumInput" + toAction)) {
        console.log('trying to set slider from: ' + fromAction + ', ' + toAction + ' with val ' + newValue);
        return;
    }

    if (newValue === -1) {
        if (data.actions[fromAction]["downstreamRate" + toAction]) {
            return;
        }
        newValue = 100;
    }

    document.getElementById(fromAction + "NumInput" + toAction).value = newValue;
    if(toAction !== "Automation") {
        document.getElementById(fromAction + "_" + toAction + "_Line_Inner").style.height = (newValue / 100 * 20) + "px";
    }
    updateCustomThumbPosition(fromAction, toAction, newValue);

    let actionObj = data.actions[fromAction];

    if(toAction === "Automation") {
        actionObj.automationOnReveal = newValue;
        views.updateVal(`${fromAction}_checkbox`, newValue > 0, "checked");
        updateAutomationSwitch(fromAction);
    } else {
        actionObj["downstreamRate" + toAction] = Math.max(0, newValue);
    }

    const allValues = [0, 10, 50, 100];
    for (let val of allValues) {
        const optionId = `${fromAction}_${toAction}_option_${val}`;
        document.getElementById(optionId).style.backgroundColor = 'transparent';
    }

    const targetId = `${fromAction}_${toAction}_option_${newValue}`;
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        targetElement.style.backgroundColor = getResourceColor(data.actions[fromAction]);
    }
}


function validateInput(fromAction, toAction) {
    let numInput = document.getElementById(fromAction + "NumInput" + toAction);
    if(numInput.value === "") {
        return;
    }
    let value = parseInt(numInput.value);

    if (value < 0 || value > 100 || isNaN(value)) {
        numInput.value = 0;
        alert("Please enter a number between 0 and 100.");
    }
}
function downstreamNumberChanged(fromAction, toAction) {
    let newValue = document.getElementById(fromAction + "NumInput" + toAction).value;
    if(data.gameState === "KTL") {
        return;
    }
    setSliderUI(fromAction, toAction, newValue); //number input changed
}

function toggleAllZero(actionVar) {
    let dataObj = actionData[actionVar];
    dataObj.downstreamVars.forEach(function (toAction) {
        let downstreamObj = data.actions[toAction];
        let downstreamDataObj = actionData[toAction];
        if(!downstreamObj || !downstreamDataObj.hasUpstream || !downstreamObj.visible) {
            return;
        }
        setSliderUI(actionVar, toAction, 0); //0 button
    });
}
function toggleAllHundred(actionVar) {
    let dataObj = actionData[actionVar];
    dataObj.downstreamVars.forEach(function (toAction) {
        let downstreamObj = data.actions[toAction];
        let downstreamDataObj = actionData[toAction];
        if(!downstreamObj || !downstreamDataObj.hasUpstream || !downstreamObj.visible) {
            return;
        }
        setSliderUI(actionVar, toAction, 100); //100 button
    });
}
window.addEventListener('resize', () => {
    resizeStatMenu();
    resizeCanvas();
    drawChart();
});

function resizeStatMenu() {
    let bonusDisplay = view.cached[`bonusDisplay`];
    let reduction = 210;
    if(bonusDisplay.style.display !== "none") {
        reduction += 70;
    }

    if(view.cached[`attDisplay`]) {
        view.cached[`attDisplay`].style.maxHeight = window.innerHeight - reduction + "px";
    }
}


const bodyElement = document.getElementById("theBody");
const windowElement = document.getElementById('windowElement');
const actionContainer = document.getElementById('actionContainer');


let scaleByPlane = [1,1,1,1];
const scaleStep = 0.1;
const minScale = 0.1;
const maxScale = 2.5;

let isDragging = false;
let originalX, originalY;
let originalLeft, originalTop;

let originalMouseX, originalMouseY;
let transformX = [0,0,0,0], transformY = [0,0,0,0];
let originalTransformX, originalTransformY;

let initialPinchDistance = null;
let lastTouchScale = [1, 1, 1, 1];
let isTouchDragging = false;

function setZoomNoMouse(newScale) {
    const rect = windowElement.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const prevScale = scaleByPlane[data.planeTabSelected];
    scaleByPlane[data.planeTabSelected] = Math.max(minScale, Math.min(maxScale, newScale));
    const scaleFactor = scaleByPlane[data.planeTabSelected] / prevScale;

    const dx = (centerX - transformX[data.planeTabSelected]) * (1 - scaleFactor);
    const dy = (centerY - transformY[data.planeTabSelected]) * (1 - scaleFactor);

    transformX[data.planeTabSelected] += dx;
    transformY[data.planeTabSelected] += dy;

    actionContainer.style.transform = `translate(${transformX[data.planeTabSelected]}px, ${transformY[data.planeTabSelected]}px) scale(${scaleByPlane[data.planeTabSelected]})`;
}

function clickZoomIn() {
    setZoomNoMouse(scaleByPlane[data.planeTabSelected] + scaleStep*3)
}

function clickZoomOut() {
    setZoomNoMouse(scaleByPlane[data.planeTabSelected] - scaleStep*3)
}

function centerScreen() {
    if(data.planeTabSelected === 0) {
        actionTitleClicked('overclock')
    }
    if(data.planeTabSelected === 1) {
        actionTitleClicked('echoKindle')
    }
    if(data.planeTabSelected === 2) {
        actionTitleClicked('overclockTargetingTheLich')
    }
}

function hoveringIcon(actionVar) {
    replaceIconText(actionVar);
    actionData[actionVar].hoveringIcon = true;
}
function stopHoveringIcon(actionVar) {
    actionData[actionVar].hoveringIcon = false;
}
function pauseAction(event, actionVar) {
    event.stopPropagation();
    let actionObj = data.actions[actionVar];
    actionObj.isPaused = !actionObj.isPaused;
    updatePauseActionVisuals(actionVar)
}

function updatePauseActionVisuals(actionVar) {
    let actionObj = data.actions[actionVar];
    views.updateVal(`${actionVar}PauseButton`, actionObj.isPaused?">":"||", "textContent")
    views.updateVal(`${actionVar}PauseButton`, actionObj.isPaused?"green":"red", "style.borderColor")
    views.updateVal(`${actionVar}Title`, actionObj.isPaused?"red":"", "style.color")
    views.updateVal(`${actionVar}SmallVersionTitle`, actionObj.isPaused?"red":"", "style.color")
}

windowElement.addEventListener('wheel', function(e) {
    let actionObj = data.actions[mouseIsOnAction];
    if(mouseIsOnAction && actionObj.currentMenu !== "") {
        let elem = document.getElementById(`${mouseIsOnAction}_${actionObj.currentMenu}Container`);
        if(!elem) {
            console.log('error, no elem at: ' + mouseIsOnAction);
            return;
        }
        if(elem.scrollHeight > elem.clientHeight) { //only stop wheel if there's a reason to
            return;
        }
    }
    e.preventDefault();

    const rect = windowElement.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const prevScale = scaleByPlane[data.planeTabSelected];
    const delta = Math.sign(e.deltaY);

    scaleByPlane[data.planeTabSelected] += delta < 0 ? scaleStep : -scaleStep;
    scaleByPlane[data.planeTabSelected] = Math.min(Math.max(minScale, scaleByPlane[data.planeTabSelected]), maxScale);

    // Adjust translation to zoom at mouse position
    const scaleFactor = scaleByPlane[data.planeTabSelected] / prevScale;
    const dx = (mouseX - transformX[data.planeTabSelected]) * (1 - scaleFactor);
    const dy = (mouseY - transformY[data.planeTabSelected]) * (1 - scaleFactor);

    transformX[data.planeTabSelected] += dx;
    transformY[data.planeTabSelected] += dy;

    actionContainer.style.transform = `translate(${transformX[data.planeTabSelected]}px, ${transformY[data.planeTabSelected]}px) scale(${scaleByPlane[data.planeTabSelected]})`;

    // clearTimeout(redrawTimeout);
    // redrawTimeout = setTimeout(globalRedraw, 200);

}, { passive: false });

let redrawTimeout;

document.addEventListener('mousedown', function(e) {
    if (e.target === windowElement || e.target === actionContainer) {
        isDragging = true;

        originalMouseX = e.clientX;
        originalMouseY = e.clientY;

        originalTransformX = transformX[data.planeTabSelected];
        originalTransformY = transformY[data.planeTabSelected];
    }
});
document.addEventListener('mousemove', function(e) {
    if(!isDragging) {
        return;
    }
    const deltaX = e.clientX - originalMouseX;
    const deltaY = e.clientY - originalMouseY;

    transformX[data.planeTabSelected] = originalTransformX + deltaX
    transformY[data.planeTabSelected] = originalTransformY + deltaY

    // Update the position of the container
    actionContainer.style.transform = `translate(${transformX[data.planeTabSelected]}px, ${transformY[data.planeTabSelected]}px) scale(${scaleByPlane[data.planeTabSelected]})`;
});

document.addEventListener('mouseup', function() {
    isDragging = false;
});


document.body.addEventListener('touchmove', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

// Touch start
windowElement.addEventListener('touchstart', function(e) {
    if(mouseIsOnAction) {
        data.actions[mouseIsOnAction].mouseOnThis = false;
    }
    mouseIsOnAction = null;
    if (e.touches.length === 2) {
        e.preventDefault();
        initialPinchDistance = getTouchDistance(e.touches[0], e.touches[1]);
        lastTouchScale[data.planeTabSelected] = scaleByPlane[data.planeTabSelected];
        isTouchDragging = false;
    } else if (e.touches.length === 1) {
        // Single finger drag
        const touch = e.touches[0];
        originalMouseX = touch.clientX;
        originalMouseY = touch.clientY;
        originalTransformX = transformX[data.planeTabSelected];
        originalTransformY = transformY[data.planeTabSelected];
        isTouchDragging = true;
    }
}, { passive: false });

// Touch move
windowElement.addEventListener('touchmove', function(e) {
    if (e.touches.length === 2 && initialPinchDistance) {
        e.preventDefault();

        const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
        const pinchScale = currentDistance / initialPinchDistance;
        let newScale = lastTouchScale[data.planeTabSelected] * pinchScale;

        newScale = Math.min(Math.max(minScale, newScale), maxScale);
        const prevScale = scaleByPlane[data.planeTabSelected];
        scaleByPlane[data.planeTabSelected] = newScale;

        const rect = windowElement.getBoundingClientRect();
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;

        const scaleFactor = scaleByPlane[data.planeTabSelected] / prevScale;
        const dx = (midX - transformX[data.planeTabSelected]) * (1 - scaleFactor);
        const dy = (midY - transformY[data.planeTabSelected]) * (1 - scaleFactor);

        transformX[data.planeTabSelected] += dx;
        transformY[data.planeTabSelected] += dy;

        applyTransform();
    } else if (e.touches.length === 1 && isTouchDragging) {
        let actionObj = data.actions[mouseIsOnAction];
        if(mouseIsOnAction && actionObj.currentMenu !== "") {
            let elem = document.getElementById(`${mouseIsOnAction}_${actionObj.currentMenu}Container`);
            if(!elem) {
                console.log('error, no elem at: ' + mouseIsOnAction);
                return;
            }
            if(elem.scrollHeight > elem.clientHeight) { //only stop wheel if there's a reason to
                return;
            }
        }
        e.preventDefault();
        const touch = e.touches[0];

        const deltaX = touch.clientX - originalMouseX;
        const deltaY = touch.clientY - originalMouseY;

        transformX[data.planeTabSelected] = originalTransformX + deltaX;
        transformY[data.planeTabSelected] = originalTransformY + deltaY;

        applyTransform();
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

function applyTransform() {
    actionContainer.style.transform = `translate(${transformX[data.planeTabSelected]}px, ${transformY[data.planeTabSelected]}px) scale(${scaleByPlane[data.planeTabSelected]})`;

    clearTimeout(redrawTimeout);
    // redrawTimeout = setTimeout(globalRedraw, 200);
}

function getTouchDistance(touch1, touch2) {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}


//clears fuzziness but causes global lag - to be avoided if there are lot of elements. Use transform:preserve-3d
function globalRedraw() {
    forceRedraw(document.getElementById("actionContainer"));
}

function forceRedraw(elem) {
    if(elem.style.display !== "none") {
        const display = elem.style.display;
        elem.style.display = 'none';
        elem.offsetHeight; // This empty access to offsetHeight forces the browser to do a repaint
        elem.style.display = display;
    }
}

function actionTitleClicked(actionVar, setAll) {
    let dataObj = actionData[actionVar];
    data.actions[actionVar].mouseOnThis = true;
    switchToPlane(dataObj.plane)


    let newtransformX = -((dataObj.realX + 100) * scaleByPlane[data.planeTabSelected]) + windowElement.offsetWidth / 2 ;
    let newtransformY = -((dataObj.realY + 100) * scaleByPlane[data.planeTabSelected]) + windowElement.offsetHeight / 2 - 50;

    // newtransformX = Math.max(-4000, Math.min(newtransformX, 4000));
    // newtransformY = Math.max(-4000, Math.min(newtransformY, 4000));

    if(setAll) {
        for(let plane in transformX) {
            transformX[plane] = newtransformX;
            transformY[plane] = newtransformY;
        }
    } else {
        transformX[data.planeTabSelected] = newtransformX;
        transformY[data.planeTabSelected] = newtransformY;
    }

    // Update the position of the container
    actionContainer.style.transform = `translate(${newtransformX}px, ${newtransformY}px) scale(${scaleByPlane[data.planeTabSelected]})`;
}

function toggleAutomationOnReveal(actionVar) {
    let actionObj = data.actions[actionVar];
    const checkbox = document.getElementById(`${actionVar}_checkbox`);

    setSliderUI(actionVar, "Automation", checkbox.checked ? 100 : 0);
    updateAutomationSwitch(actionVar);
}

function updateAutomationSwitch(actionVar) {
    const checkbox = document.getElementById(`${actionVar}_checkbox`);
    if (checkbox.checked) {
        views.updateVal(`${actionVar}_track`, "#2196F3", "style.backgroundColor");
        views.updateVal(`${actionVar}_knob`, "translateX(26px)", "style.transform");
    } else {
        views.updateVal(`${actionVar}_track`, "#ccc", "style.backgroundColor");
        views.updateVal(`${actionVar}_knob`, "translateX(0px)", "style.transform");
    }
}

function toggleAutomationOnMaxLevel(actionVar) {
    let actionObj = data.actions[actionVar];
    const checkbox = document.getElementById(`${actionVar}_checkbox2`);

    actionObj.automationCanDisable = checkbox.checked;

    if (checkbox.checked) {
        views.updateVal(`${actionVar}_track2`, "#2196F3", "style.backgroundColor");
        views.updateVal(`${actionVar}_knob2`, "translateX(26px)", "style.transform");
    } else {
        views.updateVal(`${actionVar}_track2`, "#ccc", "style.backgroundColor");
        views.updateVal(`${actionVar}_knob2`, "translateX(0px)", "style.transform");
    }
}

function clickActionMenuButton(event, actionVar, menuVar) {
    data.actions[actionVar].mouseOnThis = true;//for mobile/touch reasons
    clickActionMenu(actionVar, menuVar);
}
function clickActionMenu(actionVar, menuVar) {
    let actionObj = data.actions[actionVar];
    let currentMenu = actionObj.currentMenu;
    if(!menuVar) {
        return;
    }

    //allow switching between automation and downstream menu when locked, but not turning them off
    if(menuVar === "downstream" || menuVar === "automation") {
        if(menuVar === currentMenu && !actionObj.unlocked) {
            return;
        }
    } else if(!actionObj.unlocked) {
        return;
    }

    //clear previous menu
    if(currentMenu) {
        views.updateVal(`${actionVar}_${currentMenu}Container`, "none", "style.display");
        views.updateVal(`${actionVar}_${currentMenu}MenuButton`, "", "style.backgroundColor");
    }

    //if you clicked the button as-is, remove it and quit
    if(currentMenu === menuVar) {
        actionObj.currentMenu = "";
        return;
    }

    //turn on the menu
    views.updateVal(`${actionVar}_${menuVar}Container`, "", "style.display");
    views.updateVal(`${actionVar}_${menuVar}MenuButton`, "var(--selection-color)", "style.backgroundColor");

    actionObj.currentMenu = menuVar;

    //if story is clicked, clear the color
    if(menuVar === "story") {
        views.updateVal(`${actionVar}_${menuVar}MenuButton`, "", "style.color");
        actionObj.readStory = data.saveVersion;
    }
}

function clickMenuButton() {
    let isShowing = document.getElementById("helpMenu").style.display !== "none";
    document.getElementById("helpMenu").style.display = isShowing ? "none" : "flex";
}


let selectedStat = null;
function clickedAttName(attVar, scrollToIt) {
    //clear all borders
    for(let actionVar in data.actions) {
        views.updateVal(`${actionVar}LargeVersionContainer`, "black", "style.borderColor");
        views.updateVal(`${actionVar}LockContainer`, "black", "style.borderColor");
        views.updateVal(`${actionVar}SmallVersionContainer`, "", "style.border");
    }

    //clear previous
    if (selectedStat) {
        showAttColors(selectedStat);
    }
    if (selectedStat === attVar) {
        //clicked the same, so clear and return
        selectedStat = null;
        updateAttActionContainers();
        return;
    }
    selectedStat = attVar;

    views.updateVal(`${selectedStat}AttContainer`, "2px solid var(--text-selected-color)", "style.border");
    views.updateVal(`${selectedStat}Name`, "var(--text-selected-color)", "style.color");
    views.updateVal(`${selectedStat}DisplayContainer`, "var(--text-selected-color)", "style.backgroundColor");


    for (let actionVar in data.actions) {
        setBorderColor(actionVar, selectedStat);
    }

    updateAttActionContainers();

    if(!scrollToIt) {
        return;
    }
    const container = view.cached[`attDisplay`];
    const target = view.cached[`${attVar}AttContainer`];

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const offset = targetRect.top - containerRect.top + container.scrollTop;

    container.scrollTo({
        top: offset - 10,  // small margin
        behavior: "smooth"
    });
}

function setBorderColor(actionVar, attVar) {
    let dataObj = actionData[actionVar];
    let attAddedTo = false;
    for(let attObj of dataObj.onLevelAtts) {
        if (attObj[0] === attVar) {
            attAddedTo = true;
        }
    }
    let expAttUsed = false;
    for(let attObj of dataObj.expAtts) {
        if (attObj[0] === attVar) {
            expAttUsed = true;
        }
    }
    let effAttUsed = false;
    for(let attObj of dataObj.efficiencyAtts) {
        if (attObj[0] === attVar) {
            effAttUsed = true;
        }
    }

    let color = "black"
    if (attAddedTo && !(expAttUsed || effAttUsed)) color = "var(--attribute-add-color)";
    else if (attAddedTo && (expAttUsed || effAttUsed)) color = "white";
    else if (expAttUsed) color = "var(--attribute-use-exp-color)";
    else if (effAttUsed) color = "var(--attribute-use-eff-color)";

    views.updateVal(`${actionVar}LargeVersionContainer`, color, "style.borderColor");
    views.updateVal(`${actionVar}LockContainer`, color, "style.borderColor");
    views.updateVal(`${actionVar}SmallVersionContainer`, color==="black"?"":("2px solid " + color), "style.border");
}

//Inside and Outside
function updateAttActionContainers() {
    for (let actionVar in data.actions) {
        let dataObj = actionData[actionVar];
        for (let attObj of dataObj.onLevelAtts) {
            let attVar = attObj[0];
            views.updateVal(`${actionVar}${attVar}OutsideContaineradd`, selectedStat && selectedStat === attVar ? "var(--text-selected-color)" : "var(--attribute-add-color)", "style.borderColor");
            views.updateVal(`${actionVar}${attVar}InsideContaineradd`, selectedStat && selectedStat === attVar ? "var(--text-selected-color)" : "transparent", "style.borderColor");
        }
        for (let attObj of dataObj.expAtts) {
            let attVar = attObj[0];
            views.updateVal(`${actionVar}${attVar}OutsideContainerexp`, selectedStat && selectedStat === attVar ? "var(--text-selected-color)" : "var(--attribute-use-exp-color)", "style.borderColor");
            views.updateVal(`${actionVar}${attVar}InsideContainerexp`, selectedStat && selectedStat === attVar ? "var(--text-selected-color)" : "transparent", "style.borderColor");
        }
        for (let attObj of dataObj.efficiencyAtts) {
            let attVar = attObj[0];
            views.updateVal(`${actionVar}${attVar}OutsideContainereff`, selectedStat && selectedStat === attVar ? "var(--text-selected-color)" : "var(--attribute-use-eff-color)", "style.borderColor");
            views.updateVal(`${actionVar}${attVar}InsideContainereff`, selectedStat && selectedStat === attVar ? "var(--text-selected-color)" : "transparent", "style.borderColor");
        }
    }
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
    document.getElementById("jobTitle").textContent = data.actions[data.currentJob] ? actionData[data.currentJob].title : data.currentJob;
    document.getElementById("jobWage").textContent = intToString(data.currentWage, 2);
}

function pauseGame() {
    data.gameSettings.stop = !data.gameSettings.stop;
    updatePauseButtonVisuals();
    save();
}

function updatePauseButtonVisuals() {
    document.title = data.gameSettings.stop ? "*PAUSED* KTL" : "KTL";
    document.getElementById('pauseButton').textContent = data.gameSettings.stop ? "> Resume" : "|| Pause";
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
    let button = document.getElementById("attDisplayShowButton");
    let attDisplay = view.cached.attDisplay;
    if(attDisplay.style.display !== "none") {
        attDisplay.style.display = "none";
        button.style.display = "inline-block";
    } else {
        attDisplay.style.display = "inline-block";
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
    resizeStatMenu();
}

function toggleBonusSpeed() {
    if(data.gameSettings.bonusSpeed > 1 || data.currentGameState.bonusTime <= 1000) {
        data.gameSettings.bonusSpeed = 1;
    } else {
        data.gameSettings.bonusSpeed = data.options.bonusRate;
    }
    updateBonusSpeedButton();
}

function updateBonusSpeedButton() {
    if(data.gameSettings.bonusSpeed === 1) {
        document.getElementById("toggleBonusSpeedButton").style.backgroundColor = "red";
        document.getElementById("toggleBonusSpeedButton").textContent = "Enable Bonus Speed";
    } else {
        document.getElementById("toggleBonusSpeedButton").style.backgroundColor = "green";
        document.getElementById("toggleBonusSpeedButton").textContent = "Disable Bonus Speed";
    }
}

function changeBonusSpeed(num) {
    if(data.gameSettings.bonusSpeed > 1) { //already running
        data.gameSettings.bonusSpeed = num;
    }
    data.options.bonusRate = num;
}


function switchToPlane(num) {
    if(!data.planeUnlocked[num]) {
        return;
    }
    document.getElementById(`planeContainer${data.planeTabSelected}`).style.display = 'none';
    data.planeTabSelected = num;
    document.getElementById(`planeContainer${data.planeTabSelected}`).style.display = '';
    document.getElementById("windowElement").style.backgroundColor = `var(--world-${data.planeTabSelected}-bg-primary)`;
    actionContainer.style.transform = `translate(${transformX[data.planeTabSelected]}px, ${transformY[data.planeTabSelected]}px) scale(${scaleByPlane[data.planeTabSelected]})`;
}

function unveilPlane(num) {
    data.planeUnlocked[num] = true;
    views.updateVal(`planeButton${num}`, "flex", "style.display");
}

let mouseIsOnAction = null;
function mouseOnAction(actionVar) {
    let actionObj = data.actions[actionVar];
    actionObj.mouseOnThis = true;
    mouseIsOnAction = actionVar;
}
function mouseOffAction(actionVar) {
    let actionObj = data.actions[actionVar];
    actionObj.mouseOnThis = false;
    mouseIsOnAction = null;
}
function mouseOnActionTouch(event, actionVar) {
    let actionObj = data.actions[actionVar];
    if(actionVar && actionObj.currentMenu !== "") {
        let elem = document.getElementById(`${actionVar}_${actionObj.currentMenu}Container`);
        if(elem.scrollHeight > elem.clientHeight) { //only stop touch if there's a reason to
            event.stopPropagation();
        }
    }
    mouseOnAction(actionVar);
}


// function takeDataSnapshot(resourceValue) {
//     const currentTime = chartData.length > 0 ? chartData[chartData.length - 1].time + 1 : 0;
//
//     chartData.push({
//         time: currentTime,
//         value: resourceValue
//     });
//
//     if (chartData.length > 500) {
//         chartData.shift(); // Removes the oldest data point
//     }
// }

function takeDataSnapshot(resourceValue, currentTime) {
    if (chartData.length === 0) {
        chartData.push({
            time: currentTime,
            value: resourceValue
        });
        return;
    }

    const lastStoredPoint = chartData[chartData.length - 1];
    if (resourceValue === lastStoredPoint.value) {
        return;
    }

    const lastValue = lastStoredPoint.value;
    const timeBeforeChange = currentTime - 1;

    if (timeBeforeChange > lastStoredPoint.time) {
        chartData.push({ time: timeBeforeChange, value: lastValue });
    }

    chartData.push({ time: currentTime, value: resourceValue });

    if (chartData.length > 200) {
        chartData.splice(0, 2);
    }
}

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
}

function drawChart() {
    if(selectedMenu !== "statistics") {
        return;
    }

    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;
    const padding = 40;

    // Clear the canvas and fill with dark background
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (chartData.length < 2) {
        ctx.fillStyle = '#a0aec0'; // Light gray text for placeholder
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Waiting for more data...', canvasWidth / 2, canvasHeight / 2);
        return;
    }

    // --- Determine Data Range ---
    const minTime = chartData[0].time;
    const maxTime = chartData[chartData.length - 1].time;
    const values = chartData.map(d => d.value);
    const maxValue = Math.max(...values);

    // --- Draw Axes ---
    ctx.strokeStyle = '#4a5568'; // Subtle gray for axes
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvasHeight - padding);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(padding, canvasHeight - padding);
    ctx.lineTo(canvasWidth - padding, canvasHeight - padding);
    ctx.stroke();

    // --- Draw Data Line ---
    ctx.strokeStyle = '#63b3ed'; // Vibrant, contrasting blue for the line
    ctx.lineWidth = 3; // Thicker line
    ctx.lineJoin = 'round'; // Smoother corners
    ctx.beginPath();

    for (let i = 0; i < chartData.length; i++) {
        const dataPoint = chartData[i];
        const x = padding + ((dataPoint.time - minTime) / (maxTime - minTime)) * (canvasWidth - 2 * padding);
        let y;
        if (chartScale === 'logarithmic') {
            const logMaxValue = Math.log1p(maxValue);
            const logValue = Math.log1p(dataPoint.value);
            y = (canvasHeight - padding) - ((logValue / logMaxValue) * (canvasHeight - 2 * padding));
        } else {
            y = (canvasHeight - padding) - ((dataPoint.value / maxValue) * (canvasHeight - 2 * padding));
        }
        if (isNaN(y)) y = canvasHeight - padding;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // --- Draw Labels and Grid ---
    ctx.fillStyle = '#a0aec0'; // Light gray for labels
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    const numYLabels = 5;
    for (let i = 0; i <= numYLabels; i++) {
        const yPos = padding + (i / numYLabels) * (canvasHeight - 2 * padding);
        let labelValue;
        if (chartScale === 'logarithmic') {
            labelValue = Math.expm1(Math.log1p(maxValue) * (1 - (i / numYLabels)));
        } else {
            labelValue = maxValue * (1 - (i / numYLabels));
        }
        ctx.fillText(intToString(labelValue, 1), padding - 20, yPos + 4);

        // Horizontal grid line
        ctx.strokeStyle = '#4a5568'; // Subtle gray for grid
        ctx.beginPath();
        ctx.moveTo(padding - 5, yPos);
        ctx.lineTo(canvasWidth - padding, yPos);
        ctx.stroke();
    }
    ctx.fillText(secondsToTime(minTime), padding, canvasHeight - padding + 20);
    ctx.fillText(secondsToTime(maxTime), canvasWidth - padding, canvasHeight - padding + 20);
}

function addLogMessage(text, type) {
    const logContainer = document.getElementById('logContainer');
    const logMessages = document.getElementById('logMessages');
    const timestamp = secondsToTime(data.secondsPerReset);
    let logData = {
        theVar: text,
        type: type,
        timestamp: timestamp
    }
    const fullMessage = expandLogMessage(logData);
    data.currentLog.push(logData);
    const messageElement = document.createElement('div');
    messageElement.innerHTML = fullMessage;
    messageElement.style.padding = '2px 8px';
    const isScrolledToBottom = logContainer.scrollTop + logContainer.clientHeight >= logContainer.scrollHeight - 10;
    logMessages.appendChild(messageElement);
    if(isScrolledToBottom) {
        logContainer.scrollTop = logContainer.scrollHeight;
    }
}

function expandLogMessage(logData) {
    let theVar = logData.theVar;
    let type = logData.type;
    let timestamp = logData.timestamp;
    if(type === "purchaseAction") {
        let dataObj = actionData[theVar];
        return `${timestamp}: Permanently unlocked action: ${dataObj.title} in ${getPlaneNameFromNum(dataObj.plane)}`;
    } else if(type === "unlockAction") {
        let dataObj = actionData[theVar];
        let planeName = getPlaneNameFromNum(dataObj.plane);
        return `${timestamp}: New Action: <span style="font-weight:bold;cursor:pointer;" onclick="actionTitleClicked('${theVar}');">${dataObj.title}</span> in ${planeName}`
    } else if(type === "purchaseUpgrade") {
        let upgradeDataObj = upgradeData[theVar];
        return `${timestamp}: New Upgrade Available: ${upgradeDataObj.title}!`;
    } else if(type === "info") {
        return logData.theVar;
    }
}

function getPlaneNameFromNum(planeNum) {
    switch(planeNum) {
        case 0:
            return "Brythal"
        case 1:
            return "Magic"
        case 2:
            return "Northern Wastes"
        case 3:
            return "Astral"
    }
}

function toggleLog() {
    const logWrapper = document.getElementById('logWrapper');
    const openLogButton = document.getElementById('openLogButton');
    if (logWrapper.style.display === 'none') {
        logWrapper.style.display = 'block';
        openLogButton.style.display = 'none';
    } else {
        logWrapper.style.display = 'none';
        openLogButton.style.display = 'block';
    }
}

function clearLog() {
    const logMessages = document.getElementById('logMessages');
    logMessages.replaceChildren();
    data.currentLog = [];
}

function rebuildLog() {
    clearLog();
    const logContainer = document.getElementById('logContainer');
    const logMessages = document.getElementById('logMessages');
    for (let message of data.currentLog) {
        const messageElement = document.createElement('div');
        messageElement.innerHTML = expandLogMessage(message);
        messageElement.style.padding = '2px 8px';
        logMessages.appendChild(messageElement);
    }
    logContainer.scrollTop = logContainer.scrollHeight;
}


function togglePinned() {
    const pinnedWrapper = document.getElementById('pinnedWrapper');
    const openPinnedButton = document.getElementById('openPinnedButton');
    if (pinnedWrapper.style.display === 'none') {
        pinnedWrapper.style.display = 'block';
        openPinnedButton.style.display = 'none';
    } else {
        pinnedWrapper.style.display = 'none';
        openPinnedButton.style.display = 'block';
    }
}

function rebuildPinned() {
    let tempArray = copyArray(data.currentPinned);
    data.currentPinned = [];
    for(let actionVar of tempArray) {
        addPinnedAction(actionVar);
    }
}

function addPinnedActionClick(event, actionVar) {
    event.stopPropagation();
    addPinnedAction(actionVar);
}

function addPinnedAction(actionVar) {
    let dataObj = actionData[actionVar];
    let actionObj = data.actions[actionVar];
    if(data.currentPinned.indexOf(actionVar) !== -1) {
        return;
    }
    data.currentPinned.push(actionVar);

    queueCache(`${actionVar}PinnedLevels`)
    queueCache(`${actionVar}Level3`)
    queueCache(`${actionVar}MaxLevel3`)

    const messageElement = document.createElement('div');
    //remove button (X) removes all listeners
    messageElement.innerHTML = `<span id="${actionVar}PinContainer">
        [${dataObj.plane+1}]
        <span id="${actionVar}PinnedLevels">
            <span style="font-weight:bold;cursor:pointer;" onclick="actionTitleClicked('${actionVar}');">${dataObj.title}</span> 
            (<span id="${actionVar}Level3"></span>${actionObj.maxLevel >= 0?`/<span id="${actionVar}MaxLevel3"></span>`:""})
        </span>
        <span style="border:2px solid #840000;cursor:pointer;" class="mouseoverRed" onclick="removePinnedAction('${actionVar}')">X</span>
    </span>`;
    messageElement.style.padding = '2px 8px';

    document.getElementById("pinnedActions").appendChild(messageElement);

    clearCacheQueue();
}

function removePinnedAction(actionVar) {
    const pinElement = document.getElementById(`${actionVar}PinContainer`);
    if (pinElement) {
        pinElement.parentElement.remove();
        delete view.cached[actionVar];
    }

    const index = data.currentPinned.indexOf(actionVar);
    if (index !== -1) {
        data.currentPinned.splice(index, 1);
    }
}