
function initializeStats() {
    statList.forEach((stat) => {
        addNewStat(stat);
    });
}

function addNewStat(name) {
    stats[name] = {};
    stats[name].exp = 0;
    stats[name].talent = 0;
}

function getLevel(stat) {
    return getLevelFromExp(stats[stat].exp);
}

function getLevelFromExp(exp) {
    return Math.floor((Math.sqrt(8*exp/100+1)-1)/2);
}

function getExpOfLevel(level) {
    return level * (level + 1) * 50;
}

function getTalent(stat) {
    return getLevelFromExp(stats[stat].talent);
}

function getPrcToNextLevel(stat) {
    let expOfCurLevel = getExpOfLevel(getLevel(stat));
    let curLevelProgress = stats[stat].exp - expOfCurLevel;
    let nextLevelNeeds = getExpOfLevel(getLevel(stat)+1) - expOfCurLevel;
    return curLevelProgress / nextLevelNeeds * 100;
}

function getPrcToNextTalent(stat) {
    let expOfCurLevel = getExpOfLevel(getTalent(stat));
    let curLevelProgress = stats[stat].talent - expOfCurLevel;
    let nextLevelNeeds = getExpOfLevel(getTalent(stat)+1) - expOfCurLevel;
    return curLevelProgress / nextLevelNeeds * 100;
}

function addExp(name, amount) {
    amount *= (1+getTalent(name)/100) * (1+getLevel(name)/100);
    stats[name].exp += amount;
    stats[name].talent += amount / 100;
}

function restartStats() {
    statList.forEach((stat) => {
        stats[stat].exp = 0;
    });
}