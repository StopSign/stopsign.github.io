function findMonster() {
    combatTime = 0;
    all.char.attackSpeedCur = 0;
    all.enemy = createEnemy(0, 0);

    document.getElementById("enemyDiv").style.opacity = "1";
    document.getElementById("hunt").style.display = "block";
    document.getElementById("fight").style.display = "none";
    document.getElementById("consume").style.display = "none";

    isCombat = true;
    isHunt = true;
    isFight = false;
    isConsume = false;
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
        isCombat = false;
        getReward(all.char, all.enemy);
    }
}

function exitCombat() {
    isCombat = false;
    document.getElementById("enemyDiv").style.opacity = "0";
    document.getElementById("hunt").style.display = "none";
    document.getElementById("fight").style.display = "none";
    document.getElementById("consume").style.display = "none";
}

function getReward(char, enemy) {
    for (let property in enemy.reward) {
        if (enemy.reward.hasOwnProperty(property)) {
            all.logs.push(view.create.log(enemy.reward[property], property, " gained for "));
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