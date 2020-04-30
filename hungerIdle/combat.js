//Run every tick
function engageMonster() {
    if (!isCombat) {
        return;
    }
    combatTime += 50;
    if (isHunt) {
        all.enemy.huntCur += 50;
    }
    if (all.enemy.huntCur >= (all.enemy.stats.huntMax * getHuntMult()) && isHunt) {
        isHunt = false;
        isFight = true;
        all.logs.push({message: "Starting the fight!", timer: combatTime});
        document.getElementById("hunt").style.display = "none";
        document.getElementById("fight").style.display = "block";
        return;
    }

    if (isFight) {
        processAttack("char", "enemy");
        processAttack("enemy", "char");
    }
    if (isFight && all.char.healthCur <= 0) {//died :(
        processDying();
        return;
    }
    if (isFight && all.enemy.healthCur <= 0) { //VICTORY
        all.enemy.healthCur = all.enemy.healthCur < 0 ? 0 : all.enemy.healthCur;
        all.logs.push({message: "Enemy killed!", timer: combatTime});
        document.getElementById("fight").style.display = "none";
        document.getElementById("consume").style.display = "block";
        isConsume = true;
        isFight = false;
        return;
    }


    if (isConsume) {
        all.enemy.consumeCur += 50;
    }
    if (all.enemy.consumeCur >= (all.enemy.stats.consumeMax * getScavengeMult()) && isConsume) {
        isConsume = false;

        consumeEnemy();

        if (fightList[fightListIndex] === undefined) { //deleted the fight we were on
            outOfFights();
            view.create.fightList();
            return;
        }
        fightList[fightListIndex].fought++;
        fightList[fightListIndex].timer += combatTime;
        if (fightList[fightListIndex].fought >= fightList[fightListIndex].quantity) { //go to next fight?
            fightListIndex++;
            if (fightList[fightListIndex] === undefined) { //no more next fights
                outOfFights();
                view.create.fightList();
                return;
            }
        }
        findMonster();
        view.create.fightList();
    }
}

function processAttack(attackerName, victimName) {
    let attacker = all[attackerName];
    let victim = all[victimName];

    attacker.attackSpeedCur += 50;
    if (attacker.attackSpeedCur >= (attacker.stats.attackSpeedMax * getAgiMult(attacker))) { //attack!
        attacker.attackSpeedCur -= (attacker.stats.attackSpeedMax * getAgiMult(attacker));
    } else { //not attacking yet
        return;
    }

    let damageDone = getPhysDamage(attacker, victim);

    changeHealth(victim, -1 * damageDone);
    all.logs.push(view.create.damageLog(damageDone, victim.healthCur, "physical", victimName));


    let selfDamage = getPhysReduction(attacker) * victim.stats.reflect;

    if (selfDamage === 0) {
        return;
    }
    changeHealth(attacker, -1 * selfDamage);

    all.logs.push(view.create.damageLog(selfDamage, attacker.healthCur, "reflect", attackerName));
}

function changeHealth(creature, delta) {
    creature.healthCur += delta;
    if (creature.healthCur > creature.stats.healthMax) {
        creature.healthCur = creature.stats.healthMax;
    }
    if (creature.healthCur < 0) {
        creature.healthCur = 0;
    }
}

function changeMana(creature, delta) {
    creature.manaCur += delta;
    if (creature.manaCur > creature.stats.manaMax) {
        creature.manaCur = creature.stats.manaMax;
    }
    if (creature.manaCur < 0) {
        creature.manaCur = 0;
    }
}

function applyRegen() {
    if (all.char.healthCur <= 0) {
        return;
    }
    processRecovery(all.char);
    if (all.enemy.healthCur > 0) {
        processRecovery(all.enemy);
    }
    if (all.char.healthCur <= 0) {
        processDying();
    }

    changeMana(all.char, all.char.stats.manaRegen);
}

function processRecovery(creature) {
    let healthChange = creature.stats.healthRegen - creature.poison;
    if (creature.poison) {
        all.logs.push(view.create.damageLog(creature.poison, creature.healthCur, "poison", "char"));
    }
    changeHealth(creature, healthChange);
}

function consumeEnemy() {
    getReward(all.char, all.enemy);
    changeHealth(all.char, all.char.stats.recover);
    enemySelectionData[all.enemy.col][all.enemy.row].consumed++;
    if (enemySelectionData[all.enemy.col][all.enemy.row].consumed > all.enemy.max) {
        all.char.poison += enemySelectionData[all.enemy.col][all.enemy.row].consumed - all.enemy.max;
    }
    if (all.enemy.col === selectedFight.col && all.enemy.row === selectedFight.row) {
        selectFight(selectedFight.col, selectedFight.row);
    }
}

function getReward(char, enemy) {
    for (let property in enemy.reward) {
        if (enemy.reward.hasOwnProperty(property)) {
            all.logs.push(view.create.log(enemy.reward[property], camelToTitle(property), " gained for ", combatTime));
            if (property === "healthMax") {
                char.healthCur += enemy.reward[property];
            }
            char.stats[property] += enemy.reward[property];
            if (char.base[property] === undefined) {
                char.base[property] = 0;
            }
            char.base[property] = round5(char.base[property] + (enemy.reward[property] / 100));
        }
    }
}