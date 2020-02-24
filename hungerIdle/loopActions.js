function addToFightList() {
    let selected = enemySelectionData[selectedFight.col][selectedFight.row];
    let fightQueued = {
        quantity: document.getElementById("fightNum").value,
        name: selected.name,
        col: selectedFight.col,
        row: selectedFight.row,
        fought: 0,
        timer:0
    };
    fightList.push(fightQueued);
    view.create.fightList();
}

function clearLists() {
    fightList = [];
    fightListIndex = 0;
    view.create.fightList();
}

function startFight() {
    findMonster();
}

function removeFight(index) {
    fightList.splice(index, 1);
    if(fightListIndex > index) {
        fightListIndex--;
    }
    view.create.fightList();
}

function switchToFight(index) {
    fightListIndex = index;
    findMonster();
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
    if (initialIndex < 0 || initialIndex > fightList.length || resultingIndex < 0 || resultingIndex > fightList.length - 1) {
        return;
    }
    let difference = initialIndex - resultingIndex;
    if (difference === 0) {
        return;
    }

    let delta = Math.abs(difference);

    if (difference > 0) {
        for (let i = 0; i < delta; i++) {
            const temp = fightList[initialIndex-i-1];
            fightList[initialIndex-i-1] = fightList[initialIndex-i];
            fightList[initialIndex-i] = temp;
        }
    } else {
        for (let i = 0; i < delta; i++) {
            const temp = fightList[initialIndex+i+1];
            fightList[initialIndex+i+1] = fightList[initialIndex+i];
            fightList[initialIndex+i] = temp;
        }
    }

    view.create.fightList();
}

function dragOverDecorate(i) {
    if(document.getElementById("fightContainer" + i))
        document.getElementById("fightContainer" + i).classList.add("draggedOverAction");
}

function dragExitUndecorate(i) {
    if(document.getElementById("fightContainer" + i))
        document.getElementById("fightContainer" + i).classList.remove("draggedOverAction");
}

function draggedDecorate(i) {
    if(document.getElementById("fightContainer" + i))
        document.getElementById("fightContainer" + i).classList.add("draggedAction");
}

function draggedUndecorate(i) {
    if(document.getElementById("fightContainer" + i))
        document.getElementById("fightContainer" + i).classList.remove("draggedAction");
}