function switchActionsTab(num) {
    let ids = ["kingContainer", "castleContainer", "labContainer", "heroContainer", "upgradeContainer"];
    for(let i = 0; i < ids.length; i++) {
        if(num === i) {
            document.getElementById(ids[i]).style.display = "block";
        } else {
            document.getElementById(ids[i]).style.display = "none";
        }
    }
}

function switchListTab(num) {
    let ids = ["kingListContainer", "castleListContainer", "unitsListContainer", "labListContainer"];
    for(let i = 0; i < ids.length; i++) {
        if(num === i) {
            document.getElementById(ids[i]).style.display = "block";
        } else {
            document.getElementById(ids[i]).style.display = "none";
        }
    }
}

function capAmount(index, townNum) {
    // let varName = "good"+translateClassNames(actions.next[index].name).varName;
    // let alreadyExisting = getNumOnList(actions.next[index].name)- actions.next[index].loops;
    // let newLoops = towns[townNum][varName] - alreadyExisting;
    // actions.next[index].loops = newLoops < 0 ? 0 : newLoops;
    // view.updateNextActions();
}

function addLoop(index, listName) {
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
}

function removeLoop(index, listName) {
    let theList = actionsList.next[listName];
    let theObj = theList[index];
    theObj.loops -= window.addAmount;
    if(theObj.loops < 0) {
        theObj.loops = 0;
    }
}

function split(index, listName) {
    let theList = actionsList.next[listName];
    let theObj = theList[index];
    addAction(theObj, listName, Math.ceil(theObj.loops/2), index);
    theObj.loops = Math.floor(theObj.loops/2);
}

function moveUp(index, listName) {
    if(index <= 0) {
        return;
    }
    let theList = actionsList.next[listName];
    const temp = theList[index-1];
    theList[index-1] = theList[index];
    theList[index] = temp;
}

function moveDown(index, listName) {
    let theList = actionsList.next[listName];
    if(index >= theList.length - 1) {
        return;
    }
    const temp = theList[index+1];
    theList[index+1] = theList[index];
    theList[index] = temp;
}

function removeAction(index, listName) {
    let theList = actionsList.next[listName];
    theList.splice(index, 1);
}

function handleDragStart(event) {
    let index = event.target.getAttribute("data-index");
    draggedDecorate(index);
    event.dataTransfer.setData('text/html', index);
}

function handleDragOver(event) {
    event.preventDefault();
}

function handleDragDrop(event) {
    let indexOfDroppedOverElement = event.target.getAttribute("data-index");
    dragExitUndecorate(indexOfDroppedOverElement);
    let initialIndex = event.dataTransfer.getData("text/html");
    moveQueuedAction(initialIndex, indexOfDroppedOverElement);
}

function moveQueuedAction(initialIndex, resultingIndex) {
    initialIndex = Number(initialIndex);
    resultingIndex = Number(resultingIndex);
    if (initialIndex < 0 || initialIndex > actions.next.length || resultingIndex < 0 || resultingIndex > actions.next.length - 1) {
        return;
    }
    let difference = initialIndex - resultingIndex;
    if (difference === 0) {
        return;
    }

    let delta = Math.abs(difference);

    if (difference > 0) {
        for (let i = 0; i < delta; i++) {
            const temp = actions.next[initialIndex-i-1];
            actions.next[initialIndex-i-1] = actions.next[initialIndex-i];
            actions.next[initialIndex-i] = temp;
        }
    } else {
        for (let i = 0; i < delta; i++) {
            const temp = actions.next[initialIndex+i+1];
            actions.next[initialIndex+i+1] = actions.next[initialIndex+i];
            actions.next[initialIndex+i] = temp;
        }
    }

    view.updateNextActions();
}

function dragOverDecorate(i) {
    if(document.getElementById("nextActionContainer" + i))
        document.getElementById("nextActionContainer" + i).classList.add("draggedOverAction");
}

function dragExitUndecorate(i) {
    if(document.getElementById("nextActionContainer" + i))
        document.getElementById("nextActionContainer" + i).classList.remove("draggedOverAction");
}

function draggedDecorate(i) {
    if(document.getElementById("nextActionContainer" + i))
        document.getElementById("nextActionContainer" + i).classList.add("draggedAction");
}

function draggedUndecorate(i) {
    if(document.getElementById("nextActionContainer" + i))
        document.getElementById("nextActionContainer" + i).classList.remove("draggedAction");
}
