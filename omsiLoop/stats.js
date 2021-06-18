"use strict";
function initializeStats() {
    for (let i = 0; i < statList.length; i++) {
        addNewStat(statList[i]);
    }
}

function addNewStat(name) {
    stats[name] = {};
    stats[name].exp = 0;
    stats[name].talent = 0;
    stats[name].soulstone = 0;
}

function initializeSkills() {
    for (let i = 0; i < skillList.length; i++) {
        addNewSkill(skillList[i]);
    }
}

function addNewSkill(name) {
    skills[name] = {};
    skills[name].exp = 0;
}

function initializeBuffs() {
    for (let i = 0; i < buffList.length; i++) {
        addNewBuff(buffList[i]);
    }
}

function addNewBuff(name) {
    buffs[name] = {};
    buffs[name].amt = 0;
}

function getLevel(stat) {
    return getLevelFromExp(stats[stat].exp);
}

function getTotalTalentLevel() {
    return Math.floor(Math.pow(totalTalent, 0.2));
}

function getTotalTalentPrc() {
    return (Math.pow(totalTalent, 0.2) - Math.floor(Math.pow(totalTalent, 0.2))) * 100;
}

function getLevelFromExp(exp) {
    return Math.floor((Math.sqrt(8 * exp / 100 + 1) - 1) / 2);
}

function getExpOfLevel(level) {
    return level * (level + 1) * 50;
}

function getTalent(stat) {
    return getLevelFromTalent(stats[stat].talent);
}

function getLevelFromTalent(exp) {
    return Math.floor((Math.sqrt(8 * exp / 100 + 1) - 1) / 2);
}

function getExpOfTalent(level) {
    return level * (level + 1) * 50;
}

function getPrcToNextLevel(stat) {
    const expOfCurLevel = getExpOfLevel(getLevel(stat));
    const curLevelProgress = stats[stat].exp - expOfCurLevel;
    const nextLevelNeeds = getExpOfLevel(getLevel(stat) + 1) - expOfCurLevel;
    return Math.floor(curLevelProgress / nextLevelNeeds * 100 * 10) / 10;
}

function getPrcToNextTalent(stat) {
    const expOfCurLevel = getExpOfTalent(getTalent(stat));
    const curLevelProgress = stats[stat].talent - expOfCurLevel;
    const nextLevelNeeds = getExpOfTalent(getTalent(stat) + 1) - expOfCurLevel;
    return Math.floor(curLevelProgress / nextLevelNeeds * 100 * 10) / 10;
}

function getSkillLevelFromExp(exp) {
    return Math.floor((Math.sqrt(8 * exp / 100 + 1) - 1) / 2);
}

function getExpOfSkillLevel(level) {
    return level * (level + 1) * 50;
}

function getSkillLevel(skill) {
    return getSkillLevelFromExp(skills[skill].exp);
}

function getBuffLevel(buff) {
    return buffs[buff].amt;
}

function getSelfCombat() {
    return (getSkillLevel("Combat") + getSkillLevel("Pyromancy") * 5) * (1 + (resources.armor * getCraftGuildRank().bonus) / 5);
}

function getTeamCombat() {
    return getSelfCombat("Combat") + getSkillLevel("Combat") * (resources.teamMembers / 2) * getAdvGuildRank().bonus;
}

function getPrcToNextSkillLevel(skill) {
    const expOfCurLevel = getExpOfSkillLevel(getSkillLevel(skill));
    const curLevelProgress = skills[skill].exp - expOfCurLevel;
    const nextLevelNeeds = getExpOfSkillLevel(getSkillLevel(skill) + 1) - expOfCurLevel;
    return Math.floor(curLevelProgress / nextLevelNeeds * 100 * 10) / 10;
}

function addSkillExp(name, amount) {
    skills[name].exp += amount;
    view.requestUpdate("updateSkill", name);
}

function handleSkillExp(list) {
    for (const skill in list) {
        if (Number.isInteger(list[skill])) addSkillExp(skill, list[skill]);
        else addSkillExp(skill, list[skill]());
    }
}

function addBuffAmt(name, amount) {
    if (getBuffLevel(name) === buffHardCaps[name]) return;
    buffs[name].amt += amount;
    view.updateBuff(name);
}

function addExp(name, amount) {
    stats[name].exp += amount;
    stats[name].talent += amount / 100;
    totalTalent += amount / 100;
    view.requestUpdate("updateStat", name);
}

function restartStats() {
    for (let i = 0; i < statList.length; i++) {
        stats[statList[i]].exp = 0;
        view.updateStat(statList[i]);
    }
}

function getTotalBonusXP(statName) {
    const soulstoneBonus = stats[statName].soulstone ? calcSoulstoneMult(stats[statName].soulstone) : 1;
    return soulstoneBonus * calcTalentMult(getTalent(statName));
}
