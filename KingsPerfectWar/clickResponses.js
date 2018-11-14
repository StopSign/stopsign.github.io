function switchActionsTab(num) {
    let ids = ["kingContainer", "castleContainer", "unitsContainer", "labContainer", "heroContainer"];
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
    curList = num;
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
    actions.refresh(num);
}

function split(index, num) {
    let listName = actionsList.nextNames[num];
    let theList = actionsList.next[listName];
    let theObj = theList[index];
    addActionToNext(theObj.varName, listName, Math.ceil(theObj.loops/2), index);
    theObj.loops = Math.floor(theObj.loops/2);
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
    actions.refresh(num);
}

function removeAction(index, num) {
    let name = actionsList.nextNames[num];
    let theList = actionsList.next[name];
    theList.splice(index, 1);
    if(actions.validActions[num] >= theList.length) { //next must be >= than currently running
        console.log(actions.validActions[num], theList.length);
        if(theList.length === 0 && actionsList.current[name][0].manaUsed === 0 && actionsList.current[name][0].loopsLeft === actionsList.current[name][0].loops) {
            actionsList.current[name].splice(0, 1);
        } else {
            addActionToNext("sleep", name, 1);
        }
    }
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
