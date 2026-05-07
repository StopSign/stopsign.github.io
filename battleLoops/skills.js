// All skill definitions, runtime state shape, exp/talent formulas, and UI copy in one place.

const SKILL_DEFINITION_ROWS = [
    {
        key: "finesse",
        name: "Finesse",
        category: "combat",
        unlockCostGold: 30,
        shortDescription: "Attack practice. Increases base damage when it levels.",
        guestArchetype: "Veteran Duelist",
        guestRarity: 7,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${sk.level} base damage (${sk.level} from this skill).`;
        },
        triggerText: "Trigger: each melee or ranged attack hit."
    },
    {
        key: "endurance",
        name: "Endurance",
        category: "combat",
        unlockCostGold: 30,
        shortDescription: "Endurance training. Reduces incoming melee damage.",
        guestArchetype: "Shield Bearer",
        guestRarity: 8,
        affectedStat: "none",
        rewardText: function(sk) {
            const mult = 1 / (1 + (sk.level * 0.05));
            return `Reward: incoming damage ×${mult.toFixed(3)} (1 / (1 + Endurance × 0.05)).`;
        },
        triggerText: "Trigger: each time an enemy damages you in melee."
    },
    {
        key: "wisdom",
        name: "Wisdom",
        category: "combat",
        unlockCostGold: 30,
        shortDescription: "Battle insight. Boosts character leveling exp.",
        guestArchetype: "Battle Scholar",
        guestRarity: 6,
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
        category: "combat",
        unlockCostGold: 30,
        shortDescription: "Treasure sense. Boosts gold gain on kills.",
        guestArchetype: "Treasure Broker",
        guestRarity: 9,
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
        category: "combat",
        classKey: "rogue",
        unlockCostGold: 30,
        shortDescription: "Quick hands. Reduces melee/ranged cooldowns.",
        guestArchetype: "Swift Ranger",
        guestRarity: 5,
        affectedStat: "none",
        maxLevel: 1000,
        rewardText: function(sk) {
            const cap = sk.maxLevel !== undefined ? sk.maxLevel : 1000;
            const effLv = Math.min(sk.level, cap);
            const meleeReduce = effLv * 10;
            const rangedReduce = effLv * 20;
            return `Reward: −10 ms melee (floor 400 ms) and −20 ms ranged (floor 800 ms) per level. Current reductions: melee ${meleeReduce} ms, ranged ${rangedReduce} ms (skill cap ${cap}).`;
        },
        triggerText: "Trigger: each melee or ranged attack hit."
    },
    {
        key: "fortitude",
        name: "Fortitude",
        category: "combat",
        unlockCostGold: 30,
        shortDescription: "Resolve. Raises base HP on wave transitions.",
        guestArchetype: "Frontline Captain",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function() {
            return "Reward: base HP = 20 + Fortitude level";
        },
        triggerText: "Trigger: each time you advance to the next wave (zone time boundary)."
    },
    {
        key: "discipline",
        name: "Discipline",
        category: "combat",
        unlockCostGold: 30,
        shortDescription: "Focus. Grants extra attribute points on level up.",
        guestArchetype: "Drill Instructor",
        guestRarity: 4,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: gain ${sk.level} extra unassigned attribute point(s) whenever your character levels up (in addition to normal level rewards).`;
        },
        triggerText: "Trigger: each time your character level increases."
    },
    {
        key: "recovery",
        name: "Recovery",
        category: "combat",
        classKey: "hunter",
        unlockCostGold: 30,
        shortDescription: "Regeneration. Restores HP every second in combat.",
        guestArchetype: "Field Medic",
        guestRarity: 7,
        affectedStat: "none",
        initialExpToLevel: 10,
        rewardText: function(sk) {
            const perSec = sk.level * 0.25;
            return `Reward: +${perSec.toFixed(2)} HP per second (ticks once per second in combat; ${sk.level} × 0.25).`;
        },
        triggerText: "Trigger: once each full second survived while the battle is running (skill exp always; HP only if Recovery level > 0)."
    },
    {
        key: "adrenaline",
        name: "Adrenaline",
        category: "combat",
        classKey: "warrior",
        unlockCostGold: 30,
        shortDescription: "Pressure fighting. Grants Strength with crowding.",
        guestArchetype: "Pit Fighter",
        guestRarity: 8,
        affectedStat: "str",
        rewardText: function(sk) {
            return `Reward: +1 Strength each time this skill levels (current +${sk.level} from this skill).`;
        },
        triggerText: "Trigger: each second per enemy in melee range beyond the first."
    },
    {
        key: "scavenger",
        name: "Scavenger",
        category: "combat",
        unlockCostGold: 30,
        shortDescription: "Looting knack. Adds extra base gold per kill.",
        guestArchetype: "Scrap Hunter",
        guestRarity: 5,
        affectedStat: "none",
        rewardText: function() {
            return "Reward: +1 base gold (before greed multiplier) per skill level on each kill.";
        },
        triggerText: "Trigger: each enemy kill."
    },
    {
        key: "preparation",
        name: "Preparation",
        category: "combat",
        classKey: "warrior",
        unlockCostGold: 30,
        shortDescription: "Poise. Faster melee recharge when not engaged.",
        guestArchetype: "Tactician",
        guestRarity: 7,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +2% melee attack timer recharge rate per skill level while no enemy is in melee range.`;
        },
        triggerText: "Trigger: continuously while no enemy is in melee range (per second)."
    },
    {
        key: "gossip",
        name: "Gossip",
        category: "town",
        unlockCostGold: 100,
        shortDescription: "Speeds guest chats and amplifies tips gained.",
        guestArchetype: "Town Rumormonger",
        guestRarity: 3,
        affectedStat: "none",
        rewardText: function(sk) {
            const safeLv = Math.min(99, sk.level || 0);
            const chatSpeed = 1 / (1 - (safeLv / 100));
            const tipBonus = (sk.talentLevel || 0) * 10;
            return `Reward: chat speed ×${chatSpeed.toFixed(2)}; +${tipBonus}% tip gain from talent.`;
        },
        triggerText: "Trigger: each completed Inn guest chat."
    },
    {
        key: "interfere",
        name: "Interfere",
        category: "town",
        unlockCostGold: 30,
        shortDescription: "Improves manual town action speed and rewards.",
        guestArchetype: "Busy Foreman",
        guestRarity: 4,
        affectedStat: "none",
        rewardText: function(sk) {
            const safeLv = Math.min(99, sk.level || 0);
            const cdSpeed = 1 / (1 - (safeLv / 100));
            const rewardBonus = (sk.talentLevel || 0) * 10;
            return `Reward: manual action cooldown speed ×${cdSpeed.toFixed(2)}; +${rewardBonus}% manual action reward from talent.`;
        },
        triggerText: "Trigger: each time you press a manual town action."
    },
    {
        key: "toughness_warrior",
        name: "Toughness",
        category: "class",
        classKey: "warrior",
        unlockCostGold: 200,
        shortDescription: "Warrior class skill.",
        guestArchetype: "Warrior Mentor",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${round2((sk.level || 0) * 0.25)} armor (flat damage reduction).`;
        },
        triggerText: "Trigger: each time an enemy damages you in melee."
    },
    {
        key: "sneak_attack",
        name: "Sneak Attack",
        category: "combat",
        classKey: "rogue",
        unlockCostGold: 200,
        shortDescription: "Rogue opener damage bonus on first hit per enemy.",
        guestArchetype: "Back Alley Teacher",
        guestRarity: 7,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: first hit on each enemy deals +${(sk.level || 0) * 10}% damage.`;
        },
        triggerText: "Trigger: each first hit you deal to an enemy."
    },
    {
        key: "longshot",
        name: "Longshot",
        category: "combat",
        classKey: "hunter",
        unlockCostGold: 200,
        shortDescription: "Hunter ranged finishing and damage scaling.",
        guestArchetype: "Farshot Scout",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${sk.level || 0} flat ranged damage.`;
        },
        triggerText: "Trigger: kill an enemy with a ranged attack."
    },
    {
        key: "impact",
        name: "Impact",
        category: "combat",
        classKey: "hunter",
        unlockCostGold: 200,
        shortDescription: "Hunter ranged knockback and upper-map precision training.",
        guestArchetype: "Siege Archer",
        guestRarity: 8,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: ranged hits knock enemies back by ${(sk.level || 0) * 0.1}s of their movement speed.`;
        },
        triggerText: "Trigger: ranged hit on an enemy in the upper half of the battlefield."
    },
    {
        key: "exploit",
        name: "Exploit",
        category: "combat",
        classKey: "rogue",
        unlockCostGold: 200,
        shortDescription: "Rogue sustained pressure on repeated target hits.",
        guestArchetype: "Knife Expert",
        guestRarity: 7,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: consecutive hits on the same target gain +${sk.level || 0} damage per consecutive step (2nd hit +${sk.level || 0}, 3rd +${(sk.level || 0) * 2}, ...).`;
        },
        triggerText: "Trigger: hitting an enemy you've hit before."
    },
    {
        key: "cleave",
        name: "Cleave",
        category: "combat",
        classKey: "warrior",
        unlockCostGold: 200,
        shortDescription: "Warrior power strikes splash to adjacent threats.",
        guestArchetype: "Greatblade Master",
        guestRarity: 8,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: power strikes deal ${round2((sk.level || 0) * 10)}% of dealt damage to adjacent-lane melee enemies and one immediate enemy behind target.`;
        },
        triggerText: "Trigger: each power strike."
    },
    {
        key: "thorns",
        name: "Thorns",
        category: "combat",
        classKey: "warrior",
        unlockCostGold: 200,
        shortDescription: "Warrior retaliates on melee damage taken.",
        guestArchetype: "Spiked Defender",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: deal ${sk.level || 0} retaliatory damage to melee attackers.`;
        },
        triggerText: "Trigger: each time you take non-zero melee damage."
    },
    {
        key: "execute",
        name: "Execute",
        category: "combat",
        classKey: "warrior",
        unlockCostGold: 200,
        shortDescription: "Warrior deals more damage to wounded enemies.",
        guestArchetype: "Finisher Captain",
        guestRarity: 7,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${round2((sk.level || 0) * 5)}% damage to enemies below 50% HP.`;
        },
        triggerText: "Trigger: dealing damage to enemies below 50% HP."
    },
    {
        key: "second_wind",
        name: "Second Wind",
        category: "combat",
        classKey: "warrior",
        unlockCostGold: 200,
        shortDescription: "Warrior recovers HP when blocking.",
        guestArchetype: "Battle Survivor",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${sk.level || 0} HP each time you block.`;
        },
        triggerText: "Trigger: each successful block."
    },
    {
        key: "precision_rogue",
        name: "Precision",
        category: "class",
        classKey: "rogue",
        unlockCostGold: 200,
        shortDescription: "Rogue class skill.",
        guestArchetype: "Rogue Tutor",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${sk.level}% crit chance (placeholder effect for now).`;
        },
        triggerText: "Trigger: each melee or ranged attack hit."
    },
    {
        key: "marksmanship_hunter",
        name: "Marksmanship",
        category: "class",
        classKey: "hunter",
        unlockCostGold: 200,
        shortDescription: "Hunter class skill.",
        guestArchetype: "Hunter Guide",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${sk.level}% ranged damage (placeholder effect for now).`;
        },
        triggerText: "Trigger: each ranged attack hit."
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
            expToLevel: d.initialExpToLevel !== undefined ? d.initialExpToLevel : 5,
            talentLevel: 0,
            talent: 0,
            talentToLevel: 10,
            triggerCount: 0,
            tips: 0,
            category: d.category || "combat",
            stars: {
                bronze: false,
                silver: false,
                gold: false
            }
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
        const cat = skill.category || "combat";
        if (cat === "town") {
            return;
        }
        skill.level = 0;
        skill.exp = 0;
        skill.expToLevel = skills.getInitialExpToLevel(skill.key);
        skill.triggerCount = 0;
        if (cat === "class") {
            skill.talent = 0;
            skill.talentToLevel = 10;
        }
    },

    getSkillKeysInDisplayOrder: function(progressSkills) {
        const sk = progressSkills || {};
        const out = [];
        for (let i = 0; i < skills.keysInOrder.length; i++) {
            const k = skills.keysInOrder[i];
            if (sk[k] && skills.isSkillUnlocked(k)) {
                out.push(k);
            }
        }
        return out;
    },
    getSkillKeysByCategory: function(progressSkills, category) {
        const sk = progressSkills || {};
        const out = [];
        const currentClass = data && data.progress ? (data.progress.currentClassKey || "none") : "none";
        for (let i = 0; i < skills.keysInOrder.length; i++) {
            const k = skills.keysInOrder[i];
            const s = sk[k];
            if (!s || !skills.isSkillUnlocked(k)) {
                continue;
            }
            const cat = s.category || "combat";
            if (cat !== category) {
                continue;
            }
            const d = skills._byKey[k];
            if (d && d.classKey && d.classKey !== currentClass) {
                continue;
            }
            if (category === "class") {
                const requiredClass = d && d.classKey ? d.classKey : "";
                if (!requiredClass || requiredClass !== currentClass) {
                    continue;
                }
            }
            if (cat === category) {
                out.push(k);
            }
        }
        return out;
    },
    hasAnyClassSkillForCurrentClass: function() {
        const keys = skills.getSkillKeysByCategory(data.progress.skills, "class");
        return keys.length > 0;
    },
    isSkillUnlocked: function(skillKey) {
        const lib = data && data.progress && data.progress.base && data.progress.base.library;
        if (!lib || !lib.unlockedSkills) {
            return false;
        }
        return !!lib.unlockedSkills[skillKey];
    },

    getSkillRewardText: function(skillKey, skill) {
        const d = skills._byKey[skillKey];
        return d ? d.rewardText(skill) : "";
    },
    getSkillShortDescription: function(skillKey) {
        const d = skills._byKey[skillKey];
        return d && d.shortDescription ? d.shortDescription : "";
    },
    getSkillUnlockCostGold: function(skillKey) {
        const d = skills._byKey[skillKey];
        return d && d.unlockCostGold !== undefined ? d.unlockCostGold : 30;
    },
    getSkillResearchCostMultiplier: function(skillKey) {
        const d = skills._byKey[skillKey];
        return d && d.researchCostMultiplier !== undefined ? d.researchCostMultiplier : 10;
    },
    getSkillGuestInfo: function(skillKey) {
        const d = skills._byKey[skillKey];
        if (!d) {
            return null;
        }
        return {
            archetype: d.guestArchetype || d.name,
            rarity: d.guestRarity || 1
        };
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
        const tipsMult = 1 + ((skill.tips || 0) * 0.01);
        const stars = skill.stars || {};
        let starCount = 0;
        if (stars.bronze) starCount++;
        if (stars.silver) starCount++;
        if (stars.gold) starCount++;
        const starMult = Math.pow(2, starCount);
        return {
            talentMult: talentMult,
            levelMult: levelMult,
            tipsMult: tipsMult,
            starMult: starMult,
            combinedMult: talentMult * levelMult * tipsMult * starMult
        };
    },

    expGainForSkillTrigger: function(skill, amount) {
        const parts = skills.skillExpGainParts(skill);
        return amount * parts.combinedMult;
    }
};
