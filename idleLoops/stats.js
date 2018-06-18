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

function getSkillLevel(skill) {
    return getLevelFromExp(skills[skill].exp);
}

function getPrcToNextSkillLevel(skill) {
    let expOfCurLevel = getExpOfLevel(getSkillLevel(skill));
    let curLevelProgress = skills[skill].exp - expOfCurLevel;
    let nextLevelNeeds = getExpOfLevel(getSkillLevel(skill)+1) - expOfCurLevel;
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