// All skill definitions, runtime state shape, exp/talent formulas, and UI copy in one place.

const SKILL_DEFINITION_ROWS = [
    {
        key: "finesse",
        name: "Finesse",
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${sk.level} base damage (${sk.level} from this skill).`;
        },
        triggerText: "Trigger: each melee or ranged attack hit."
    },
    {
        key: "toughness",
        name: "Toughness",
        affectedStat: "none",
        rewardText: function(sk) {
            const mult = 1 / (1 + (sk.level * 0.05));
            return `Reward: incoming damage ×${mult.toFixed(3)} (1 / (1 + Toughness × 0.05)).`;
        },
        triggerText: "Trigger: each time an enemy damages you in melee."
    },
    {
        key: "wisdom",
        name: "Wisdom",
        affectedStat: "none",
        rewardText: function(sk) {
            const mult = Math.pow(1.1, sk.level);
            return `Reward: +10% character leveling exp per skill level (×${mult.toFixed(2)} total).`;
        },
        triggerText: "Trigger: each enemy kill."
    },
    {
        key: "greed",
        name: "Greed",
        affectedStat: "none",
        rewardText: function(sk) {
            const mult = Math.pow(1.05, sk.level);
            return `Reward: +5% gold from kills per skill level (×${mult.toFixed(2)} total).`;
        },
        triggerText: "Trigger: each enemy kill."
    },
    {
        key: "alacrity",
        name: "Alacrity",
        affectedStat: "none",
        maxLevel: 1000,
        rewardText: function(sk) {
            const cap = sk.maxLevel !== undefined ? sk.maxLevel : 1000;
            const effLv = Math.min(sk.level, cap);
            return `Reward: −1 ms melee and ranged base cooldown per skill level (each floor 200 ms). Current reduction: ${effLv} ms (skill cap ${cap}).`;
        },
        triggerText: "Trigger: each melee or ranged attack hit."
    },
    {
        key: "fortitude",
        name: "Fortitude",
        affectedStat: "none",
        rewardText: function() {
            return "Reward: base HP = 20 + Fortitude level";
        },
        triggerText: "Trigger: each time you advance to the next wave (zone time boundary)."
    },
    {
        key: "discipline",
        name: "Discipline",
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: gain ${sk.level} extra unassigned attribute point(s) whenever your character levels up (in addition to normal level rewards).`;
        },
        triggerText: "Trigger: each time your character level increases."
    },
    {
        key: "recovery",
        name: "Recovery",
        affectedStat: "none",
        initialExpToLevel: 25,
        rewardText: function(sk) {
            const perSec = sk.level * 0.25;
            return `Reward: +${perSec.toFixed(2)} HP per second (ticks once per second in combat; ${sk.level} × 0.25).`;
        },
        triggerText: "Trigger: once each full second survived while the battle is running (skill exp always; HP only if Recovery level > 0)."
    },
    {
        key: "adrenaline",
        name: "Adrenaline",
        affectedStat: "str",
        rewardText: function(sk) {
            return `Reward: +1 Strength each time this skill levels (current +${sk.level} from this skill).`;
        },
        triggerText: "Trigger: each second per enemy in melee range beyond the first."
    },
    {
        key: "scavenger",
        name: "Scavenger",
        affectedStat: "none",
        rewardText: function() {
            return "Reward: +1 base gold (before greed multiplier) per skill level on each kill.";
        },
        triggerText: "Trigger: each enemy kill."
    },
    {
        key: "preparation",
        name: "Preparation",
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +2% melee attack timer recharge rate per skill level while no enemy is in melee range.`;
        },
        triggerText: "Trigger: continuously while no enemy is in melee range (per second)."
    }
];

let skills = {
    keysInOrder: SKILL_DEFINITION_ROWS.map(function(r) {
        return r.key;
    }),
    _byKey: (function() {
        const m = {};
        for (let i = 0; i < SKILL_DEFINITION_ROWS.length; i++) {
            const r = SKILL_DEFINITION_ROWS[i];
            m[r.key] = r;
        }
        return m;
    })(),

    createFreshSkillState: function(key) {
        const d = skills._byKey[key];
        if (!d) {
            return null;
        }
        const s = {
            key: key,
            name: d.name,
            affectedStat: d.affectedStat,
            level: 0,
            exp: 0,
            expToLevel: d.initialExpToLevel !== undefined ? d.initialExpToLevel : 10,
            talentLevel: 0,
            talent: 0,
            talentToLevel: 10,
            triggerCount: 0
        };
        if (d.maxLevel !== undefined) {
            s.maxLevel = d.maxLevel;
        }
        return s;
    },

    getDefaultSkills: function() {
        const o = {};
        for (let i = 0; i < skills.keysInOrder.length; i++) {
            const k = skills.keysInOrder[i];
            o[k] = skills.createFreshSkillState(k);
        }
        return o;
    },

    getInitialExpToLevel: function(key) {
        const d = skills._byKey[key];
        return d && d.initialExpToLevel !== undefined ? d.initialExpToLevel : 10;
    },

    resetSkillForRun: function(skill) {
        skill.level = 0;
        skill.exp = 0;
        skill.expToLevel = skills.getInitialExpToLevel(skill.key);
        skill.triggerCount = 0;
    },

    getSkillKeysInDisplayOrder: function(progressSkills) {
        const sk = progressSkills || {};
        const out = [];
        for (let i = 0; i < skills.keysInOrder.length; i++) {
            const k = skills.keysInOrder[i];
            if (sk[k]) {
                out.push(k);
            }
        }
        return out;
    },

    getSkillRewardText: function(skillKey, skill) {
        const d = skills._byKey[skillKey];
        return d ? d.rewardText(skill) : "";
    },

    getSkillTriggerDescription: function(skillKey) {
        const d = skills._byKey[skillKey];
        return d ? d.triggerText : "";
    },

    talentExpMultiplier: function(talentLevel) {
        return Math.pow(1.01, talentLevel);
    },

    skillLevelExpMultiplier: function(skillLevel) {
        return Math.pow(1.05, skillLevel);
    },

    skillExpGainParts: function(skill) {
        const talentMult = skills.talentExpMultiplier(skill.talentLevel);
        const levelMult = skills.skillLevelExpMultiplier(skill.level);
        return {
            talentMult: talentMult,
            levelMult: levelMult,
            combinedMult: talentMult * levelMult
        };
    },

    expGainForSkillTrigger: function(skill, amount) {
        const parts = skills.skillExpGainParts(skill);
        return amount * parts.combinedMult;
    }
};
