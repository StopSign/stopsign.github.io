function startFight() {


    all.char.attackSpeedCur = 0;
    all.enemy = createEnemy();
    isCombat = true;
}

function dealDamage() {
    if(!isCombat) {
        return;
    }
    processAttack(all.char, all.enemy, all.enemyLog);
    processAttack(all.enemy, all.char, all.charLog);

    if(all.char.healthCur <= 0) { //died :(
        all.char.healthCur = all.char.healthCur < 0 ? 0 : all.char.healthCur;
        isCombat = false;
        return;
    }
    if(all.enemy.healthCur <= 0) { //VICTORY
        all.enemy.healthCur = all.enemy.healthCur < 0 ? 0 : all.enemy.healthCur;
        isCombat = false;
        getReward(all.char, all.enemy);
    }
}

function getReward(char, enemy) {
    for (let property in enemy.reward) {
        if (enemy.reward.hasOwnProperty(property)) {
            all.charLog.push(view.create.log(enemy.reward[property], property, " " + property + " gained!"));
            char[property] += enemy.reward[property];
        }
    }
}

function processAttack(attacker, victim, victimLog) {
    let timePassed = curTime - prevTime;

    attacker.attackSpeedCur += timePassed;
    if(attacker.attackSpeedCur >= attacker.attackSpeedMax) { //attack!
        attacker.attackSpeedCur -= attacker.attackSpeedMax;
    } else { //not attacking yet
        return;
    }
    victim.healthCur -= attacker.attack;
    victimLog.push(view.create.log(attacker.attack, "attack", " damage taken!"));
}



function recoverHealth() {
    processRecovery(all.char);
    if(all.enemy.healthCur > 0) {
        processRecovery(all.enemy);
    }
}

function processRecovery(creature) {
    creature.healthCur += creature.healthRegen;
    if(creature.healthCur > creature.healthMax) { creature.healthCur = creature.healthMax; }
}