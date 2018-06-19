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

function getSkillLevelFromExp(exp) {
    return Math.floor(.00000001 + (Math.pow(6,(1/3)) * Math.pow((Math.sqrt(81 * Math.pow(exp, 2) - 16200*exp + 809952) + 9*exp - 900),(1/3)) + (2 * Math.pow(6,(2/3)))/Math.pow((Math.sqrt(81 * Math.pow(exp, 2) - 16200 * exp + 809952) + 9 * exp - 900),(1/3)) - 6) / 6);
}

function getExpOfSkillLevel(level) {
    return level * (level + 1) * (level + 2) * 2 + 100;
}

function getSkillLevel(skill) {
    return getSkillLevelFromExp(skills[skill].exp);
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