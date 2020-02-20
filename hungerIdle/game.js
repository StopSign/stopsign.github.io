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

let fightListIndex = 0;

function findMonster() {
    combatTime = 0;
    all.char.attackSpeedCur = 0;

    let currentFight = fightList[fightListIndex];
    if(currentFight === undefined) {
        return;
    }
    all.enemy = createEnemy(currentFight.col, currentFight.row);

    document.getElementById("enemyDiv").style.opacity = "1";
    document.getElementById("hunt").style.display = "block";
    document.getElementById("fight").style.display = "none";
    document.getElementById("consume").style.display = "none";

    isCombat = true;
    isHunt = true;
    isFight = false;
    isConsume = false;
    view.updating.update();
    view.create.fightList();
}


function processDying() {
    outOfFights();
    all.char.healthCur = all.char.healthCur < 0 ? 0 : all.char.healthCur;
    all.logs.push({message: "You have died!", timer: combatTime});
    exitCombat();
    for(let i = 0; i < enemySelectionData.length; i++) {
        for(let j = 0; j < enemySelectionData[i].length; j++) {
            enemySelectionData[i][j].consumed = 0;
        }
    }
    fixStartingStats(all.char);
    if(document.getElementById("continueFightCheck").checked) {
        for(let i = 0; i < fightList.length; i++) { //clear out fought
            fightList[i].timer = 0;
        }
        findMonster();
    }
    selectFight(selectedFight.col, selectedFight.row);
}

function outOfFights() {
    fightListIndex = 0;
    for(let i = 0; i < fightList.length; i++) { //clear out fought
        fightList[i].fought = 0;
    }
    if(document.getElementById("loopCheck").checked && fightList.length > 0) { //loop if necessary
        findMonster();
        for(let i = 0; i < fightList.length; i++) { //clear out fought
            fightList[i].timer = 0;
        }
    } else { //otherwise stop combat
        isCombat = false;
    }
}

function removeFight(index) {
    fightList.splice(index, 1);
    if(fightListIndex > index) {
        fightListIndex--;
    }
    view.create.fightList();
}

function exitCombat() {
    isCombat = false;
    document.getElementById("enemyDiv").style.opacity = "0";
    document.getElementById("hunt").style.display = "none";
    document.getElementById("fight").style.display = "none";
    document.getElementById("consume").style.display = "none";

    fightListIndex = 0;
    view.create.fightList();
}