function getPhysDamage(attacker, victim) {
    let victimHealthPerc = victim.healthCur / victim.stats.healthMax * 100;
    let attackerHealthPerc = attacker.healthCur / attacker.stats.healthMax * 100;

    let incPhysDamage = attacker.stats.strength;
    incPhysDamage += victimHealthPerc > 75 ? attacker.stats.dexterity : 0;

    incPhysDamage *= getPhysReduction(victim);

    incPhysDamage -= victim.stats.harden;
    incPhysDamage = incPhysDamage < 0 ? 0 : incPhysDamage;
    return incPhysDamage;
}

function getPhysReduction(creature) {
    let healthPerc = creature.healthCur / creature.stats.healthMax * 100;

    let reduction = 1;
    reduction *= getConMult(creature);
    reduction *= healthPerc > 50 ? getReflexMult(creature) : 1;
    reduction *= healthPerc <= 50 ? getPerceptionMult(creature) : 1;
    return reduction;
}

function getConMult(creature) {
    let theVar = creature.stats.constitution;
    return 1 - (theVar * 0.01)/(1 + 0.01 * theVar);
}

function getPerceptionMult(creature) {
    let theVar = creature.stats.perception;
    return 1 - (theVar * 0.01)/(1 + 0.01 * theVar);
}

function getReflexMult(creature) {
    let theVar = creature.stats.reflex;
    return 1 - (theVar * 0.01)/(1 + 0.01 * theVar);
}

function getAgiMult(creature) {
    let theVar = creature.stats.agility;
    return 1 - (theVar * 0.01)/(1 + 0.01 * theVar);
}

function getHuntMult() {
    let theVar = all.char.stats.hunt;
    return 1 - (theVar * 0.01)/(1 + 0.01 * theVar);
}

function getScavengeMult() {
    let theVar = all.char.stats.scavenge;
    return 1 - (theVar * 0.01)/(1 + 0.01 * theVar);
}