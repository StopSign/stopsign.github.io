let click = {
    init: function() {
        document.getElementById("clearCurrentList").onclick = function() { click.event.clearCurrentList(); };
        document.getElementById("bonusButton").onclick = function() { click.event.toggleOffline() };
    },
    event: {
        clearCurrentList: function() {
            let curActionNum = actions.validActions[curList];
            let name = actionsList.nextNames[curList];
            let curAction = actionsList.current[name][curActionNum];
            if(!curAction) { //start of game
                return
            }
            if(curAction.manaUsed !== 0 || curAction.loopsLeft !== curAction.loops) {
                curActionNum++; //don't delete current stuff
            }
            actionsList.next[name].splice(curActionNum);
            actionsList.current[name].splice(curActionNum);
            actions.refresh(curList);
        },
        toggleOffline: function() {
            let button = document.getElementById("bonusButton");
            if(bonusSpeed === 1) { //go fast
                bonusSpeed = 4;
                addClassToDiv(button, "buttonPressed");
                removeClassFromDiv(button, "button");
            } else { //take it slow
                bonusSpeed = 1;
                removeClassFromDiv(button, "buttonPressed");
                addClassToDiv(button, "button");
            }
        }
    },
    menu: {

    },
    list: {

    }
};

function switchInfoBoxTab(num) {
    for(let i = 0; i < 9; i++) {
        if(num === i) {
            document.getElementById("infoBox" + i).style.display = "block";
        } else {
            document.getElementById("infoBox" + i).style.display = "none";
        }
    }
}

function switchInfoTab(num) {
    let ids = ["infoContainer", "storyInfoBox", "changelogContainer", "extrasContainer"];
    for(let i = 0; i < ids.length; i++) {
        if(num === i) {
            document.getElementById(ids[i]).style.display = "block";
        } else {
            document.getElementById(ids[i]).style.display = "none";
        }
    }
    if(num === 1) {
        adjustStoryDivs();
    }
}
function openInfoBox() {
    if(document.getElementById("extraInfoBox").style.display === "block" && document.getElementById("extraInfoBox").style.display === "block") {
        closeInfoBox();
        return;
    }
    if(document.getElementById("extraInfoBox").style.display === "none") {
        document.getElementById("extraInfoBox").style.display = "block";
    }
    switchInfoTab(0);
}
function closeInfoBox() {
    document.getElementById("extraInfoBox").style.display = "none";
}

function openStory() {
    if(document.getElementById("extraInfoBox").style.display === "block" && document.getElementById("storyInfoBox").style.display === "block") {
        closeInfoBox();
        return;
    }
    if(document.getElementById("extraInfoBox").style.display === "none") {
        document.getElementById("extraInfoBox").style.display = "block";
    }
    switchInfoTab(1);
}

function switchListTab(num) {
    let ids = ["kingListContainer", "castleListContainer", "unitsListContainer"];
    curList = num;
    for(let i = 0; i < ids.length; i++) {
        if(num === i) {
            document.getElementById(ids[i]).style.display = "block";
        } else {
            document.getElementById(ids[i]).style.display = "none";
        }
    }
}

function selectAction(varName, num) {
    //prev
    let infoBoxDiv = document.getElementById(curInfoBox+"InfoBox");
    infoBoxDiv.style.display = "none";
    let container = document.getElementById(curInfoBox+"Container");

    if(container) {
        let color = king.kingIsHome() ? "rgba(255, 255, 0, 1)" : "rgba(255, 255, 0, .4)";
        if(curInfoBox === "market" && king.curData.aura === "gold") {
            document.getElementById("marketContainer").style.border = "2px solid " + color;
        } else if(curInfoBox === "commune" && king.curData.aura === "wood") {
            document.getElementById("communeContainer").style.border = "2px solid " + color;
        } else if(curInfoBox === "direct" && king.curData.aura === "build") {
            document.getElementById("directContainer").style.border = "2px solid " + color;
        } else {
            container.style.border = "2px solid rgba(0, 0, 0, 0)";
        }
    }

    if(varName === curInfoBox) {
        varName = "default";
        addButtons.style.display = "none";
        document.getElementById("deselectButton").style.display = "none";
        document.getElementById("infoBoxList").style.display = "none";
    } else {
        addButtons.style.display = "block";
        document.getElementById("deselectButton").style.display = "block";
        document.getElementById("infoBoxList").style.display = "block";
        document.getElementById("extrasInfoBox").style.display = "none";
    }

    document.getElementById(varName+"InfoBox").style.display = "block";
    //next
    container = document.getElementById(varName+"Container");
    if(container) {
        let color = king.kingIsHome() ? "rgba(200, 200, 0, 1)" : "rgba(200, 200, 0, .4)";
        if(varName === "market" && king.curData.aura === "gold") {
            document.getElementById("marketContainer").style.border = "2px solid " + color;
        } else if(varName === "commune" && king.curData.aura === "wood") {
            document.getElementById("communeContainer").style.border = "2px solid " + color;
        } else if(varName === "direct" && king.curData.aura === "build") {
            document.getElementById("directContainer").style.border = "2px solid " + color;
        } else {
            container.style.border = "2px solid rgba(0, 0, 0, 1)";
        }
    }

    curInfoBox = varName;
    curListNum = num;
}

function deselect() {
    selectAction(curInfoBox, curListNum);
    document.getElementById("deselectButton").style.display = "none";
    document.getElementById("extrasInfoBox").style.display = "none";
}

function straightToAdd(varName, num) {
    if(varName !== curInfoBox) {
        selectAction(varName, num);
    }
    addAction();
}

function switchMapMoveUnits(name) {
    unitsSelectedForMove[name] = !unitsSelectedForMove[name];
    for (let property in unitsSelectedForMove) {
        if (unitsSelectedForMove.hasOwnProperty(property)) {
            document.getElementById(property + "ToMove").style.border = "2px solid rgba(255, 255, 0, " + (unitsSelectedForMove[property] ? "1" : "0") + ")";
        }
    }
}

function changeBuildValue() {
    let value = document.getElementById("buildValue").value;
    let maxValue = 1.5 + king.savedData.int / 100;
    if(value < 1.5) {
        buildAuraValue = 1.5;
    } else if(value > maxValue) {
        buildAuraValue = maxValue;
    } else {
        buildAuraValue = value-0; //convert to int
    }
    document.getElementById("buildValue").value = buildAuraValue;
}

function setMapArrowVisibility() {
    if(curLevel === 0) {
        addClassToDiv(document.getElementById("prevLevel"), "hidden");
    } else {
        removeClassFromDiv(document.getElementById("prevLevel"), "hidden");
    }
    if(curLevel >= highestLevel || curLevel >= levelInitials.length) {
        addClassToDiv(document.getElementById("nextLevel"), "hidden");
    } else {
        removeClassFromDiv(document.getElementById("nextLevel"), "hidden");
    }
}

function prevLevel() {
    restart(); //save level-specific values
    curLevel--;
    if(curLevel < 1) {
        curLevel = 0;
    }
    setMapArrowVisibility();
    restartReason = "New Level";
    restart()
}

function nextLevel() {
    restart(); //save level-specific values
    curLevel++;
    if(curLevel > highestLevel || curLevel >= levelInitials.length) {
        curLevel--;
    }
    setMapArrowVisibility();
    restartReason = "New Level";
    restart()
}

let curTooltip = 0;
let curTooltipStrings = [];
function createTooltip(stringArray) {
    curTooltip = 0;
    curTooltipStrings = stringArray;
    document.getElementById("popupBox").style.display = "block";
    nextTooltip();
}

function nextTooltip() {
    if(curTooltipStrings.length <= curTooltip) {
        closePopupBox();
        curTooltip = 0;
        return;
    }
    document.getElementById("popupText").innerHTML = curTooltipStrings[curTooltip];
    document.getElementById("popupButton").innerHTML = (curTooltipStrings.length === (curTooltip+1)) ? "Okay" : ("Next (" + (curTooltip+1) + "/" + curTooltipStrings.length + ")");
    curTooltip++;
}

function openExtras() {
    if(document.getElementById("extrasInfoBox").style.display === "block") {
        deselect();
        return;
    }
    selectAction(curInfoBox, curListNum);
    document.getElementById("deselectButton").style.display = "block";
    document.getElementById("extrasInfoBox").style.display = "block";
}

function prevStory() {
    document.getElementById("pageNum"+storyPage).style.display = "none";
    let tempStoryPage = storyPage-1;
    while(unlockStory[tempStoryPage] === undefined && tempStoryPage >= 0) {
        tempStoryPage--;
    }
    if(tempStoryPage < 0) { //didn't find prev unlock
        tempStoryPage = storyPage;
    }
    storyPage = tempStoryPage;
    adjustStoryDivs();
}

function nextStory() {
    document.getElementById("pageNum"+storyPage).style.display = "none";
    let tempStoryPage = storyPage+1;
    while(unlockStory[tempStoryPage] === undefined && tempStoryPage < unlockStory.length) {
        tempStoryPage++;
    }
    if(tempStoryPage >= unlockStory.length) { //didn't find next unlock
        tempStoryPage = storyPage;
    }
    storyPage = tempStoryPage;
    adjustStoryDivs();
}

function adjustStoryDivs() {
    document.getElementById("pageNum"+storyPage).style.display = "block";
    document.getElementById("storyPageNum").innerHTML = storyPage;
    document.getElementById("storyJournal").value = storyJournal[storyPage] === undefined ? "" : storyJournal[storyPage];
    unlockStory[storyPage] = false;
    let newStoryFound = false;
    for(let i = 0; i < unlockStory.length; i++) {
        if(unlockStory[i]) {
            newStoryFound = true;
            break;
        }
    }
    if(newStoryFound) {
        document.getElementById("storyMenu").style.color = "red";
    } else {
        document.getElementById("storyMenu").style.color = "black";
    }
    if(storyPage === 0) {
        addClassToDiv(document.getElementById("prevStoryArrow"), "hidden");
    } else {
        removeClassFromDiv(document.getElementById("prevStoryArrow"), "hidden");
    }
    if(storyPage >= unlockStory.length - 1) {
        addClassToDiv(document.getElementById("nextStoryArrow"), "hidden");
    } else {
        removeClassFromDiv(document.getElementById("nextStoryArrow"), "hidden");
    }
}

function diaryChanged() {
    storyJournal[storyPage] = document.getElementById("storyJournal").value;
}

function closePopupBox() {
    document.getElementById("popupBox").style.display = "none";
}

function openEmpowerMenu() {
    document.getElementById("empowerMenu").style.display = "block";
}
function closeEmpowerMenu() {
    document.getElementById("empowerMenu").style.display = "none";
}
function buyEmpowerUnit(varName) {
    let stageNum = Math.floor(document.getElementById(varName + "EmpowerStage").value);
    let cost = castle.helpers.empowerCost(varName, stageNum);
    if(soulC >= cost) {
        soulC -= cost;
        if(!empowered[varName]) {
            empowered[varName] = [];
            levelData.empowered[varName] = [];
        }
        if(!empowered[varName][stageNum]) {
            empowered[varName][stageNum] = 0;
            levelData.empowered[varName][stageNum] = 0;
        }
        empowered[varName][stageNum]++;
        levelData.empowered[varName][stageNum]++;
        document.getElementById(varName + "EmpowerBought").innerHTML = empowered[varName][stageNum];
    }
}
function changeEmpowerStage(varName) {
    let stageNum = Math.floor(document.getElementById(varName + "EmpowerStage").value);
    let bought = empowered[varName] && empowered[varName][stageNum] ? empowered[varName][stageNum] : 0;
    let cost = castle.helpers.empowerCost(varName, stageNum);
    let unitStats = warMap.units.getStatsOfUnit(varName, stageNum);

    document.getElementById(varName + "EmpowerBought").innerHTML = bought+"";
    document.getElementById(varName + "EmpowerCost").innerHTML = intToString(cost, 1);
    document.getElementById(varName + "EmpowerStats").innerHTML = "<b>"+intToString(unitStats.atk, 1)+"</b>|<b>"+intToString(unitStats.hp, 1)+"</b>";
}

function setLoop(index, num) {
    let listName = actionsList.nextNames[num];
    let theList = actionsList.next[listName];
    let theObj = theList[index];
    let action = getActionByVarName(theObj.varName, listName);
    let amount = parseInt(document.getElementById("loopInput"+index+listName).value);
    if(isNaN(amount)) {
        amount = 0;
    } else if(amount > 9999) {
        amount = 9999;
    }
    if(action.allowed) {
        let numLeft = action.allowed() - getNumOnList(action.varName, listName);
        if(numLeft < amount) {
            amount = numLeft;
        }
    }
    theObj.loops = amount;
    levelSave[curLevel].nextLists = listsToSimplified();
    actions.refresh(num);
}

function addLoop(index, num) {
    let listName = actionsList.nextNames[num];
    let theList = actionsList.next[listName];
    let theObj = theList[index];
    let action = getActionByVarName(theObj.varName, listName);
    let addAmount = window.addAmount;
    if(action.allowed) {
        let numLeft = action.allowed() - getNumOnList(action.varName, listName);
        if(numLeft < addAmount) {
            addAmount = numLeft;
        }
    }
    theObj.loops += addAmount;
    levelSave[curLevel].nextLists = listsToSimplified();
    actions.refresh(num);
}

function removeLoop(index, num) {
    let listName = actionsList.nextNames[num];
    let theList = actionsList.next[listName];
    let theObj = theList[index];
    theObj.loops -= window.addAmount;
    if(theObj.loops < 0) {
        theObj.loops = 0;
    }
    levelSave[curLevel].nextLists = listsToSimplified();
    actions.refresh(num);
}

function split(index, num) {
    let listName = actionsList.nextNames[num];
    let theList = actionsList.next[listName];
    let theObj = theList[index];
    addActionToNext(theObj, listName, Math.ceil(theObj.loops/2), index);
    theObj.loops = Math.floor(theObj.loops/2);
    levelSave[curLevel].nextLists = listsToSimplified();
    actions.refresh(num);
}

function moveUp(index, num) {
    let listName = actionsList.nextNames[num];
    if(index <= 0) {
        return;
    }
    let theList = actionsList.next[listName];
    const temp = theList[index-1];
    theList[index-1] = theList[index];
    theList[index] = temp;
    levelSave[curLevel].nextLists = listsToSimplified();
    actions.refresh(num);
}

function moveDown(index, num) {
    let listName = actionsList.nextNames[num];
    let theList = actionsList.next[listName];
    if(index >= theList.length - 1) {
        return;
    }
    const temp = theList[index+1];
    theList[index+1] = theList[index];
    theList[index] = temp;
    levelSave[curLevel].nextLists = listsToSimplified();
    actions.refresh(num);
}

function removeAction(index, num) {
    let name = actionsList.nextNames[num];
    let theList = actionsList.next[name];
    theList.splice(index, 1);
    if(actions.validActions[num] >= theList.length) { //next must be >= than currently running
        if(theList.length === 0 && actionsList.current[name][0].manaUsed === 0 && actionsList.current[name][0].loopsLeft === actionsList.current[name][0].loops) {
            actionsList.current[name].splice(0, 1);
        } else {
            addActionToNext({varName:"sleep"}, name, 1);
        }
    }
    levelSave[curLevel].nextLists = listsToSimplified();
    actions.refresh(num);
}

function handleDragStart(event, name) {
    let index = event.target.getAttribute("data-index");
    draggedDecorate(index, name);
    event.dataTransfer.setData('text/html', index);
}

function handleDragOver(event) {
    event.preventDefault();
}

function handleDragDrop(event, num) {
    let name = actionsList.nextNames[num];
    let indexOfDroppedOverElement = event.target.getAttribute("data-index");
    dragExitUndecorate(indexOfDroppedOverElement, name);
    let initialIndex = event.dataTransfer.getData("text/html");
    moveQueuedAction(initialIndex, indexOfDroppedOverElement, name);
    actions.refresh(num);
}

function moveQueuedAction(initialIndex, resultingIndex, name) {
    initialIndex = Number(initialIndex);
    resultingIndex = Number(resultingIndex);
    let theList = actionsList.next[name];
    if (initialIndex < 0 || initialIndex > theList.length || resultingIndex < 0 || resultingIndex > theList.length - 1) {
        return;
    }
    let difference = initialIndex - resultingIndex;
    if (difference === 0) {
        return;
    }

    let delta = Math.abs(difference);

    if (difference > 0) {
        for (let i = 0; i < delta; i++) {
            const temp = theList[initialIndex-i-1];
            theList[initialIndex-i-1] = theList[initialIndex-i];
            theList[initialIndex-i] = temp;
        }
    } else {
        for (let i = 0; i < delta; i++) {
            const temp = theList[initialIndex+i+1];
            theList[initialIndex+i+1] = theList[initialIndex+i];
            theList[initialIndex+i] = temp;
        }
    }
    levelSave[curLevel].nextLists = listsToSimplified();
}

function dragOverDecorate(i, name) {
    if (document.getElementById("nextActionContainer" + i + name)) {
        document.getElementById("nextActionContainer" + i + name).classList.add("draggedOverAction");
    }
}

function dragExitUndecorate(i, name) {
    if(document.getElementById("nextActionContainer" + i + name)) {
        document.getElementById("nextActionContainer" + i + name).classList.remove("draggedOverAction");
    }
}

function draggedDecorate(i, name) {
    if(document.getElementById("nextActionContainer" + i + name)) {
        document.getElementById("nextActionContainer" + i + name).classList.add("draggedAction");
    }
}

function draggedUndecorate(i, name) {
    if(document.getElementById("nextActionContainer" + i + name)) {
        document.getElementById("nextActionContainer" + i + name).classList.remove("draggedAction");
    }
}

function clickRestart() {
    restartReason = "Manual";
    restart();
}