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

//Run every tick
function engageMonster() {
    if(!isCombat) {
        return;
    }
    combatTime += 50;
    if(isHunt) {
        all.enemy.huntCur += 50;
    }
    if(all.enemy.huntCur >= all.enemy.stats.huntMax && isHunt) {
        isHunt = false;
        isFight = true;
        all.logs.push({message:"Starting the fight!", timer:combatTime});
        document.getElementById("hunt").style.display = "none";
        document.getElementById("fight").style.display = "block";
        console.log(all.enemy.healthCur);
        return;
    }

    if(isFight) {
        processAttack("char", "enemy");
        processAttack("enemy", "char");
    }
    if(isFight && all.char.healthCur <= 0) {//died :(
        all.char.healthCur = all.char.healthCur < 0 ? 0 : all.char.healthCur;
        all.logs.push({message: "You have died!", timer: combatTime});
        isCombat = false;
        isFight = false;
        return;
    }
    if(isFight && all.enemy.healthCur <= 0) { //VICTORY
        all.enemy.healthCur = all.enemy.healthCur < 0 ? 0 : all.enemy.healthCur;
        all.logs.push({message:"Enemy killed!", timer:combatTime});
        document.getElementById("fight").style.display = "none";
        document.getElementById("consume").style.display = "block";
        isConsume = true;
        isFight = false;
        return;
    }


    if(isConsume) {
        all.enemy.consumeCur += 50;
    }
    if(all.enemy.consumeCur >= all.enemy.stats.consumeMax && isConsume) {
        isConsume = false;
        getReward(all.char, all.enemy);
        if(fightList[fightListIndex] === undefined) { //deleted the fight we were on
            outOfFights();
            view.create.fightList();
            return;
        }
        fightList[fightListIndex].fought++;
        fightList[fightListIndex].timer += combatTime;
        if(fightList[fightListIndex].fought >= fightList[fightListIndex].quantity) { //go to next fight?
            fightListIndex++;
            if(fightList[fightListIndex] === undefined) { //no more next fights
                outOfFights();
                view.create.fightList();
                return;
            }
        }
        findMonster();
        view.create.fightList();
    }
}

function outOfFights() {
    for(let i = 0; i < fightList.length; i++) { //clear out fought
        fightList[i].fought = 0;
    }
    if(document.getElementById("loopCheck").checked && fightList.length > 0) { //loop if necessary
        fightListIndex = 0;
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

function getReward(char, enemy) {
    for (let property in enemy.reward) {
        if (enemy.reward.hasOwnProperty(property)) {
            all.logs.push(view.create.log(enemy.reward[property], camelToTitle(property), " gained for ", combatTime));
            if(property === "healthMax") {
                char.healthCur += enemy.reward[property];
            }
            char.stats[property] += enemy.reward[property];
        }
    }
}

function processAttack(attackerName, victimName) {
    let attacker = all[attackerName];
    let victim = all[victimName];

    attacker.attackSpeedCur += 50;
    if(attacker.attackSpeedCur >= attacker.stats.attackSpeedMax) { //attack!
        attacker.attackSpeedCur -= attacker.stats.attackSpeedMax;
    } else { //not attacking yet
        return;
    }

    let damageDone = attacker.stats.strength;


    victim.healthCur -= damageDone;
    if(victim.healthCur < 0) {
        victim.healthCur = 0;
    }

    all.logs.push(view.create.damageLog(damageDone, victim.healthCur, "attack", victimName));
}



function recoverHealth() {
    processRecovery(all.char);
    if(all.enemy.healthCur > 0) {
        processRecovery(all.enemy);
    }
}

function processRecovery(creature) {
    creature.healthCur += creature.stats.healthRegen;
    if(creature.healthCur > creature.stats.healthMax) { creature.healthCur = creature.stats.healthMax; }
}

function createFightOption(enemyData) {
    let str = "<div class='infoBox'>";

    str += "<div class='smallTitle'>"+enemyData.name+"</div>";


    str += "</div>";
    return str;
}