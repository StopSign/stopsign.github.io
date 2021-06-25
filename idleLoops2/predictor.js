let testAction = {
    expMult:1,
    manaCost:function() {
        return 100;
    },
    stats: {
        Ref:.1,
        Will:.9
    },
    ticks:0,
    manaUsed:0,
    timeSpend:0,
    loopsLeft:10000
};




let testStats = {};
//runPredictor();

function runPredictor() {
    let before = Date.now();
    testStats = {};
    for (let i = 0; i < statList.length; i++) {
        addNewStat(testStats, statList[i]);
    }


    testStats.Will.talent = 5000500000;
    testStats.Ref.talent = 5000500000;
    testStats.Will.soulstone = 10000;
    testStats.Ref.soulstone = 10000;


    let tempAction = copyObject(testAction);
    tempAction.loopsLeft = 1;

    testSetAdjustedTicks(testAction);
    while(testTick(testAction)) {

    }
    console.log('----FINAL----');
    console.log(testAction);

    testSetAdjustedTicks(tempAction);
    while(testTick(tempAction)) {

    }
    console.log('----1 MORE----');
    console.log(tempAction);

    let after = Date.now();
    console.log('Took ' + (after - before) + 'ms');
}


function testTick(curAction) {
    testAddExpFromAction(curAction);
    curAction.ticks++;
    curAction.manaUsed++;
    curAction.timeSpent += 1 / baseManaPerSecond; //getActualGameSpeed() - bonusSpeed * gameSpeed
    if(curAction.ticks >= curAction.adjustedTicks) {
        //console.log('Completed action, ' + curAction.loopsLeft + ' left.')
        curAction.ticks = 0;
        curAction.loopsLeft--;

        curAction.manaRemaining = timeNeeded - timer;
        testSetAdjustedTicks(testAction);
    }

    return curAction.loopsLeft !== 0;
}

function testSetAdjustedTicks(action) {
    let newCost = 0;
    for (let i = 0; i < statList.length; i++) {
        const statName = statList[i];
        if (action.stats[statName]) {
            newCost += action.stats[statName] / (1 + Math.pow(getLevelFromExp(testStats[statName].exp), .8) / 100);
        }
    }
    action.adjustedTicks = Math.ceil(testAction.manaCost() * newCost - 0.000001);
}

function testAddExpFromAction(action) {
    const adjustedExp = action.expMult * (testAction.manaCost() / action.adjustedTicks);
    for (const stat of statList) {
        if (action.stats[stat]) {
            const expToAdd = action.stats[stat] * adjustedExp * testGetTotalBonusXP(stat);
            const statExp = `statExp${stat}`;
            if (!action[statExp]) {
                action[statExp] = 0;
            }
            action[statExp] += expToAdd;
            testAddExp(stat, expToAdd);
        }
    }
}

function testGetTotalBonusXP(statName) {
    const soulstoneBonus = testStats[statName].soulstone ? testCalcSoulstoneMult(testStats[statName].soulstone) : 1;
    return soulstoneBonus * testCalcTalentMult(getLevelFromTalent(testStats[statName].talent));
}

function testAddExp(name, amount) {
    testStats[name].exp += amount;
    testStats[name].talent += amount / 100;
}

function testCalcTalentMult(talent) {
    return Math.pow(talent/50+1, 0.5);
}

function testCalcSoulstoneMult(soulstones) {
    return 1 + Math.pow(soulstones, 0.6) / 10;
}
