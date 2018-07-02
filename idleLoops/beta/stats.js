'use strict';
function initializeStats() {
    for(let i = 0; i < statList.length; i++) {
        addNewStat(statList[i]);
    }
}

function addNewStat(name) {
    stats[name] = {};
    stats[name].exp = 0;
    stats[name].talent = 0;
}

function initializeSkills() {
    for(let i = 0; i < skillList.length; i++) {
        addNewSkill(skillList[i]);
    }
}

function addNewSkill(name) {
    skills[name] = {};
    skills[name].exp = 0;
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
    return getLevelFromTalent(stats[stat].talent);
}

function getLevelFromTalent(exp) {
    return Math.floor((Math.sqrt(8*exp/100+1)-1)/2);
}

function getExpOfTalent(level) {
    return level * (level + 1) * 50;
}

function getPrcToNextLevel(stat) {
    let expOfCurLevel = getExpOfLevel(getLevel(stat));
    let curLevelProgress = stats[stat].exp - expOfCurLevel;
    let nextLevelNeeds = getExpOfLevel(getLevel(stat)+1) - expOfCurLevel;
    return curLevelProgress / nextLevelNeeds * 100;
}

function getPrcToNextTalent(stat) {
    let expOfCurLevel = getExpOfTalent(getTalent(stat));
    let curLevelProgress = stats[stat].talent - expOfCurLevel;
    let nextLevelNeeds = getExpOfTalent(getTalent(stat)+1) - expOfCurLevel;
    return curLevelProgress / nextLevelNeeds * 100;
}

function getSkillLevelFromExp(exp) {
    return Math.floor((Math.sqrt(8*exp/100+1)-1)/2);
}

function getExpOfSkillLevel(level) {
    return level * (level + 1) * 50;
}

function getSkillLevel(skill) {
    return getSkillLevelFromExp(skills[skill].exp);
}

function getSelfCombat() {
    return getSkillLevel("Combat") * (1 + (armor * getCraftGuildRank().bonus)/5);
}

function getTeamCombat() {
    return getSelfCombat("Combat") + getSkillLevel("Combat")*teamNum/2 * getAdvGuildRank().bonus;
}

function getPrcToNextSkillLevel(skill) {
    let expOfCurLevel = getExpOfSkillLevel(getSkillLevel(skill));
    let curLevelProgress = skills[skill].exp - expOfCurLevel;
    let nextLevelNeeds = getExpOfSkillLevel(getSkillLevel(skill)+1) - expOfCurLevel;
    return curLevelProgress / nextLevelNeeds * 100;
}

function addSkillExp(name, amount) {
    skills[name].exp += amount;
    view.updateSkill(name);
}

function addExp(name, amount) {
    stats[name].exp += amount;
    stats[name].talent += amount / 100;
}

function restartStats() {
    for(let i = 0; i < statList.length; i++) {
        stats[statList[i]].exp = 0;
        view.updateStat(statList[i]);
    }
}

function getTotalBonusXP(statName) {
    let soulstoneBonus = stats[statName].soulstone ? calcSoulstoneMult(stats[statName].soulstone) : 1;
    return soulstoneBonus * calcTalentMult(getTalent(statName));
}
