// All skill definitions, runtime state shape, exp/talent formulas, and UI copy in one place.

const SKILL_DEFINITION_ROWS = [
    {
        version:0,
        key: "selfAffirmations",
        name: "Self-Affirmations",
        category: "combat",
        shortDescription: "Restore Aud every second while the battle runs.",
        flavorText: "“Whether you think you can, or you think you can't - you're right.” - Henry Ford",
        guestArchetype: "Field Medic",
        guestRarity: 7,
        affectedStat: "none",
        initialExpToLevel: 10,
        rewardText: function() {
            return "Reward: +(0.1 × skill level) Aud per second from Self-Affirmations (tick once per full second; Aud only applies when Self-Affirmations level is above 0).";
        },
        triggerText: "Trigger: once each full second survived while the battle is running and Aud is below 100% (skill exp only then; Aud regen only if Self-Affirmations level > 0).",
        getEffect: function(sk) {
            return { recoveryAudPerSec: (sk.level || 0) * 0.1 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals(e.recoveryAudPerSec || 0, 2).toFixed(2)} Aud/s`;
        }
    },
    {
        version:0,
        key: "force",
        name: "Force",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "+0.25 base ego damage per level (before Brutality multiplier).",
        flavorText: "“Give me a lever long enough and a fulcrum on which to place it, and I shall move the world.” - Archimedes",
        guestArchetype: "Veteran Duelist",
        guestRarity: 7,
        affectedStat: "none",
        rewardText: function() {
            return "Reward: +(0.25 × skill level) base slap damage before the Brutality multiplier.";
        },
        triggerText: "Trigger: each slap or sandal attack hit.",
        getEffect: function(sk) {
            return { slapFlatBeforeStr: (sk.level || 0) * 0.5};
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals(e.slapFlatBeforeStr || 0, 2)} slap (before Bru)`;
        }
    },
    {
        version:0,
        key: "aboveItAll",
        name: "Above It All",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "Reduces incoming ego damage by a %.",
        flavorText: "“No one can make you feel inferior without your consent.” - Eleanor Roosevelt",
        guestArchetype: "Shield Bearer",
        guestRarity: 8,
        affectedStat: "none",
        rewardText: function() {
            return "Reward: multiply incoming slap damage by 1 / (1 + 0.02 × Above It All skill level).";
        },
        triggerText: "Trigger: each time an intruder attacks you (no damage required).",
        getEffect: function(sk) {
            const lv = sk.level || 0;
            return { fortitudeIncomingDamageMultiplier: 1 / (1 + lv * 0.02) };
        },
        effectUiSummary: function(sk, e) {
            return `Current: incoming ×${roundNearestDecimals(e.fortitudeIncomingDamageMultiplier || 1, 3)}`;
        }
    },
    {
        version:0,
        key: "hindsight",
        name: "Hindsight",
        category: "combat",
        initialExpToLevel: 3,
        initialTalentToLevel: 3,
        shortDescription: "Boosts character leveling exp.",
        flavorText: "“Life can only be understood backwards; but it must be lived forwards.” - Søren Kierkegaard",
        guestArchetype: "Battle Scholar",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function() {
            return "Reward: multiply character leveling exp by 1.1 per Hindsight skill level (compounding).";
        },
        triggerText: "Trigger: each intruder removal.",
        getEffect: function(sk) {
            return { wisdomCharacterExpMultiplier: Math.pow(1.1, sk.level || 0) };
        },
        effectUiSummary: function(sk, e) {
            return `Current: char exp ×${roundNearestDecimals(e.wisdomCharacterExpMultiplier || 1, 2)}`;
        }
    },
    {
        version:0,
        key: "extortion",
        name: "Extortion",
        category: "combat",
        initialExpToLevel: 3,
        initialTalentToLevel: 3,
        shortDescription: "Coin gain multiplier on intruder removal.",
        flavorText: "“Every man has his price.” - Sir Robert Walpole",
        guestArchetype: "Treasure Broker",
        guestRarity: 9,
        affectedStat: "none",
        rewardText: function() {
            return "Reward: multiply coins from kills by 1.1 per Extortion skill level (compounding).";
        },
        triggerText: "Trigger: each intruder removal.",
        getEffect: function(sk) {
            return { greedKillCoinsMultiplier: Math.pow(1.1, sk.level || 0) };
        },
        effectUiSummary: function(sk, e) {
            return `Current: intruder removal coins ×${roundNearestDecimals(e.greedKillCoinsMultiplier || 1, 2)}`;
        }
    },
    {
        version:0,
        key: "nickelAndDime",
        name: "Nickel and Dime",
        category: "combat",
        initialExpToLevel: 10,
        shortDescription: "Adds extra base coins per intruder removal.",
        flavorText: "“Take care of the pence, and the pounds will take care of themselves.” - William Lowndes",
        guestArchetype: "Scrap Mock",
        guestRarity: 5,
        affectedStat: "none",
        rewardText: function() {
            return "Reward: +1 base coins per skill level on each intruder removal. Applies before other multipliers.";
        },
        triggerText: "Trigger: gain sqrt(coins gained) exp on killing a unit.",
        getEffect: function(sk) {
            return { scavengerKillCoinsFlatPerKill: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.scavengerKillCoinsFlatPerKill || 0} base coins per intruder removal`;
        }
    },
    {
        version:0,
        key: "shameless",
        name: "Shameless",
        category: "combat",
        initialExpToLevel: 10,
        shortDescription: "Raises base and current Aud.",
        flavorText: "“Fortune favors the audacious.” - Virgil",
        guestArchetype: "Frontline Captain",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function() {
            return "Reward: base and current Aud increase by 4 * Shameless level";
        },
        triggerText: "Trigger: every 10 seconds while the battle is running - exp gained equals √(current Aud) (square root of your Aud at the tick, before Self-Affirmations regen on that same second).",
        getEffect: function(sk) {
            return { enduranceBaseAudInnerBonus: sk.level * 4 || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.enduranceBaseAudInnerBonus || 0} base Aud inner`;
        }
    },
    {
        version:0,
        key: "corneredEgo",
        name: "Cornered Ego",
        category: "combat",
        initialExpToLevel: 10,
        shortDescription: "Raises base and current Audacity, only while hurt.",
        flavorText: "“A cornered fox bares her fangs.” - Japanese proverb (adapted)",
        guestArchetype: "Iron Will",
        guestRarity: 5,
        affectedStat: "none",
        rewardText: function() {
            return "Reward: base Aud increase by 4 * Cornered Ego level. Current Aud increase by 8 * Cornered Ego level.";
        },
        triggerText: "Trigger: each second while Aud is below half.",
        getEffect: function(sk) {
            const lv = sk.level || 0;
            return { tenacityAudInnerBonus: lv * 4 };
        },
        effectUiSummary: function(sk, e) {
            const b = e.tenacityAudInnerBonus || 0;
            return `Current: +${b} base inner, +${2 * b} current (× Con mult)`;
        }
    },
    {
        version:0,
        key: "adaptation",
        name: "Adaptation",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "Body and mind adjust to milestones: +1 Bru and +1 Con each time this skill levels.",
        flavorText: "“We are what we repeatedly do. Excellence, then, is not an act, but a habit.” - Aristotle",
        guestArchetype: "Drill Instructor",
        guestRarity: 4,
        affectedStat: "none",
        rewardText: function() {
            return "Reward: +1 Brutality and +1 Confidence each time Adaptation gains a skill level (not each character level).";
        },
        triggerText: "Trigger: each time your character level increases.",
        getEffect: function(sk) {
            const lv = sk.level || 0;
            return { adaptationBonusStr: lv, adaptationBonusCon: lv };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.adaptationBonusStr || 0} Bru, +${e.adaptationBonusCon || 0} Con from Adaptation level-ups`;
        }
    },
    {
        version:0,
        key: "echoChamber",
        name: "Echo Chamber",
        category: "combat",
        initialExpToLevel: 8,
        shortDescription: "Increase the exp gain of other skills.",
        flavorText: "“In an echo chamber, every voice you hear is your own, returned louder.”",
        guestArchetype: "Synthesis Coach",
        guestRarity: 5,
        affectedStat: "none",
        rewardText: function() {
            return "Reward: multiply skill exp gains for every other skill by 1.1 per Echo Chamber skill level (compounding).";
        },
        triggerText: "Trigger: each time a Combat skill other than this one gains a skill level.",
        getEffect: function(sk) {
            return { integrationOtherSkillExpMult: Math.pow(1.1, sk.level || 0) };
        },
        effectUiSummary: function(sk, e) {
            return `Current: ×${roundNearestDecimals(e.integrationOtherSkillExpMult || 1, 4)} other skills' skill exp`;
        }
    },
    {
        version:0,
        key: "mainCharacter",
        name: "Main Character",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "+0.1 ego damage per level per visible enemy on the battlefield.",
        flavorText: "“I'm not the hero they deserve. I'm the one with the most screen time.”",
        guestArchetype: "Spotlight Thief",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${round2((sk.level || 0) * 0.1)} base ego damage per visible intruder on the battlefield (before Brutality multiplier).`;
        },
        triggerText: "Trigger: 1 skill exp per second while 4 or more intruders intersect the battlefield.",
        getEffect: function(sk) {
            return { mainCharacterFlatPerEnemy: (sk.level || 0) * 0.2 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals(e.mainCharacterFlatPerEnemy || 0, 2)} ego dmg per visible enemy`;
        }
    },
    {
        version:0,
        key: "grudge",
        name: "Grudge",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "+5% ego damage per level vs enemies that have attacked you.",
        flavorText: "“I don't forget. I just wait for the sequel.”",
        guestArchetype: "Vendetta Keeper",
        guestRarity: 7,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${(sk.level || 0) * 5}% ego damage against intruders that have attacked you (no damage required to mark).`;
        },
        triggerText: "Trigger: each slap or sandal hit against an intruder that has attacked you.",
        getEffect: function(sk) {
            return { grudgeDamageMultPerLevel: (sk.level || 0) * 0.05 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals((e.grudgeDamageMultPerLevel || 0) * 100, 1)}% dmg vs attackers`;
        }
    },
    {
        version:0,
        key: "insultFatigue",
        name: "Insult Fatigue",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "Enemies deal less flat damage after hitting you; stacks per hit.",
        flavorText: "“Your insults are losing steam. Try harder.”",
        guestArchetype: "Cutting Remark",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: after an enemy damages you, their next attack deals ${round2((sk.level || 0) * 0.25)} flat less damage per stack (stacks per damaging hit, per enemy).`;
        },
        triggerText: "Trigger: each time an intruder attacks you for the second time or later.",
        getEffect: function(sk) {
            return { insultFatigueFlatPerStack: (sk.level || 0) * 0.25 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: −${roundNearestDecimals(e.insultFatigueFlatPerStack || 0, 2)} flat dmg per stack on next hit`;
        }
    },
    {
        version:0,
        key: "brokenRecord",
        name: "Broken Record",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "Gain Desensitized stacks when enemies attack.",
        flavorText: "“As I was saying… as I was saying… as I was saying…”",
        guestArchetype: "Repeating Grievance",
        guestRarity: 5,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: each enemy attack adds a Desensitized stack lasting ${round2((sk.level || 0) * 0.5)}s.`;
        },
        triggerText: "Trigger: each time an intruder attacks you (no damage required).",
        getEffect: function(sk) {
            return { brokenRecordDesensitizedMsPerLevel: (sk.level || 0) * 500 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +1 Desensitized stack (${intToString(e.brokenRecordDesensitizedMsPerLevel || 0, 2)} ms) per enemy attack`;
        }
    },
    {
        version:0,
        key: "validation",
        name: "Validation",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "+1 Confidence per kill, up to skill level.",
        flavorText: "“See? I told you I was right to be here.”",
        guestArchetype: "Applause Seeker",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +1 Confidence per intruder removal, up to ${sk.level || 0} Confidence from this skill.`;
        },
        triggerText: "Trigger: each intruder removal.",
        getEffect: function(sk) {
            return { validationConCap: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            const cap = e.validationConCap || 0;
            const kills = (data.battle && data.battle.enemiesKilled) || 0;
            return `Current: +${Math.min(kills, cap)} Con from kills (cap ${cap})`;
        }
    },
    {
        version:0,
        key: "imposterSyndrome",
        name: "Imposter Syndrome",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "Gain Fury stacks when hurt below half Aud.",
        flavorText: "“They'll figure me out any second now. Better hit back harder.”",
        guestArchetype: "Frazzled Protagonist",
        guestRarity: 7,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: when you take damage while below 50% Aud (checked after damage), gain ${sk.level || 0} Fury stack(s).`;
        },
        triggerText: "Trigger: (passive) Fury stacks granted on qualifying hits.",
        getEffect: function(sk) {
            return { imposterSyndromeFuryPerLevel: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.imposterSyndromeFuryPerLevel || 0} Fury when hit below 50% Aud`;
        }
    },
    {
        version:0,
        key: "narcissism",
        name: "Narcissism",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "Gain more current Audacity when Aud rises (not max Aud recalc).",
        flavorText: "“Every compliment is deserved. Every heal is a tribute.”",
        guestArchetype: "Mirror Gazer",
        guestRarity: 8,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${(sk.level || 0) * 10}% more current Audacity when you gain Aud (not from max Aud changes).`;
        },
        triggerText: "Trigger: sqrt(Audacity gained) when current Aud increases.",
        getEffect: function(sk) {
            return { narcissismAudGainMultPerLevel: (sk.level || 0) * 0.10 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals((e.narcissismAudGainMultPerLevel || 0) * 100, 1)}% bonus on Aud gains`;
        }
    },
    {
        version:0,
        key: "windfallSwagger",
        name: "Windfall Swagger",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "+1 Confidence per skill level.",
        flavorText: "“Money talks, and apparently it speaks fluent confidence.”",
        guestArchetype: "Coin Flipper",
        guestRarity: 5,
        affectedStat: "none",
        rewardText: function() {
            return "Reward: +1 Confidence per Windfall Swagger skill level.";
        },
        triggerText: "Trigger: sqrt(coins gained) on each intruder removal.",
        getEffect: function(sk) {
            return { windfallBonusCon: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.windfallBonusCon || 0} Con from skill level`;
        }
    },
    {
        version:0,
        key: "shockValue",
        name: "Shock Value",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "+1 Brutality per skill level.",
        flavorText: "“Go big or go home. Preferably both, loudly.”",
        guestArchetype: "Grandstander",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function() {
            return "Reward: +1 Brutality per Shock Value skill level.";
        },
        triggerText: "Trigger: sqrt(ego damage dealt) on each slap or sandal hit.",
        getEffect: function(sk) {
            return { shockValueBonusStr: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.shockValueBonusStr || 0} Bru from skill level`;
        }
    },
    {
        version:0,
        key: "bitterRivalry",
        name: "Bitter Rivalry",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "+1 Brutality each time your character level increases.",
        flavorText: "“Every level they gain, I gain the urge to one-up them.”",
        guestArchetype: "Rival Clone",
        guestRarity: 4,
        affectedStat: "none",
        rewardText: function() {
            return "Reward: +1 Brutality each time your character level increases during a run.";
        },
        triggerText: "Trigger: each time your character level increases.",
        getEffect: function(sk) {
            return { bitterRivalryBonusStr: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            const ls = data.battle && data.battle.levelState;
            const bitterStr = ls ? Math.max(0, (ls.bitterRivalryStrBonus || 0)) : 0;
            return `Current: +${bitterStr} Bru from character level-ups this run`;
        }
    },
    {
        version:0,
        key: "seethe",
        name: "Seethe",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "Gain Fury stacks while no enemies are in melee range.",
        flavorText: "“The silence between insults is where the rage brews.”",
        guestArchetype: "Simmering Grudge",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +1 Fury stack per Seethe skill level each second while no intruders are in slap range.`;
        },
        triggerText: "Trigger: passive each second while no intruders are in slap range.",
        getEffect: function(sk) {
            return { seetheFuryPerLevel: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.seetheFuryPerLevel || 0} Fury/s with no enemies in melee`;
        }
    },
    {
        version:0,
        key: "retailTherapy",
        name: "Retail Therapy",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "Desensitized stacks when gaining coins.",
        flavorText: "“Nothing soothes the ego like a little retail therapy.”",
        guestArchetype: "Impulse Buyer",
        guestRarity: 5,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +1 Desensitized stack lasting ${round2((sk.level || 0) * 0.5)}s when you gain coins.`;
        },
        triggerText: "Trigger: sqrt(coins gained) on each coin gain from intruder removal.",
        getEffect: function(sk) {
            return { retailTherapyDesensitizedMsPerLevel: (sk.level || 0) * 500 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +1 Desensitized (${intToString(e.retailTherapyDesensitizedMsPerLevel || 0, 2)} ms) per coin gain`;
        }
    },
    {
        version:0,
        key: "levelHeaded",
        name: "Level Headed",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "Desensitized stacks when your character levels up.",
        flavorText: "“Growth is just another word for getting used to it.”",
        guestArchetype: "Steady Climber",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +5 Desensitized stacks lasting ${round2((sk.level || 0) * 2)}s each when your character level increases.`;
        },
        triggerText: "Trigger: sqrt(character exp threshold for that level) each time your character level increases.",
        getEffect: function(sk) {
            return { levelHeadedDesensitizedMsPerLevel: (sk.level || 0) * 2000 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +5 Desensitized (${intToString(e.levelHeadedDesensitizedMsPerLevel || 0, 2)} ms each) per character level-up`;
        }
    },
    {
        version:0,
        key: "bloodRush",
        name: "Blood Rush",
        category: "combat",
        initialExpToLevel: 3,
        shortDescription: "Gain Malice when defeating intruders while above 50% Aud.",
        flavorText: "“Victory tastes sweeter when you're still standing tall.”",
        guestArchetype: "Triumphant Duelist",
        guestRarity: 7,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: Gain +${round2((sk.level || 0) * 0.5)}s of Malice when defeating an intruder while above 50% Aud.`;
        },
        triggerText: "Trigger: each intruder removal.",
        getEffect: function(sk) {
            return { bloodRushMaliceMsPerLevel: (sk.level || 0) * 500 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${intToString(e.bloodRushMaliceMsPerLevel || 0, 2)} ms Malice per kill above half Aud`;
        }
    },
    {
        version:0,
        key: "temper",
        name: "Temper",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "Malice when taking damage above half Aud.",
        flavorText: "“You wouldn't like me when I'm comfortable.”",
        guestArchetype: "Short Fuse",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${round2((sk.level || 0) * 0.5)}s Malice when taking damage while above 50% Aud.`;
        },
        triggerText: "Trigger: each damaging intruder attack while above 50% Aud.",
        getEffect: function(sk) {
            return { temperMaliceMsPerLevel: (sk.level || 0) * 500 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${intToString(e.temperMaliceMsPerLevel || 0, 2)} ms Malice per hit above half Aud`;
        }
    },
    {
        version:0,
        key: "sadism",
        name: "Sadism",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "Malice when killing enemies; exp from overkill.",
        flavorText: "“Excess is the point.”",
        guestArchetype: "Overkill Artist",
        guestRarity: 8,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${round2(sk.level || 0)}s Malice when defeating an intruder.`;
        },
        triggerText: "Trigger: sqrt(overkill damage) on each intruder removal.",
        getEffect: function(sk) {
            return { sadismMaliceMsPerLevel: (sk.level || 0) * 1000 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${intToString(e.sadismMaliceMsPerLevel || 0, 2)} ms Malice per kill`;
        }
    },
    {
        version:0,
        key: "recognition",
        name: "Recognition",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "Clout when any skill levels up.",
        flavorText: "“Every promotion deserves applause.”",
        guestArchetype: "Talent Scout",
        guestRarity: 5,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${(sk.level || 0) * 2} Clout when any skill (including Recognition) gains a level.`;
        },
        triggerText: "Trigger: skill exp equal to the new level reached whenever any other skill gains a level.",
        getEffect: function(sk) {
            return { recognitionCloutPerLevel: (sk.level || 0) * 2 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.recognitionCloutPerLevel || 0} Clout per skill level-up`;
        }
    },
    {
        version:0,
        key: "fakeTearDrops",
        name: "Fake Tear Drops",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "Fake Tears while advancing on the battlefield.",
        flavorText: "“The tears flow freely when you're on the move.”",
        guestArchetype: "Dramatic Retreat",
        guestRarity: 5,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${round2((sk.level || 0) * 0.5)}s Fake Tears each second while moving forward.`;
        },
        triggerText: "Trigger: 1 skill exp per second while moving forward on the battlefield.",
        getEffect: function(sk) {
            return { fakeTearDropsMsPerLevel: (sk.level || 0) * 500 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${intToString(e.fakeTearDropsMsPerLevel || 0, 2)} ms Fake Tears/s while moving`;
        }
    },
    {
        version:0,
        key: "numbingCrowds",
        name: "Numbing Crowds",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "Fake Tears when surrounded in melee.",
        flavorText: "“Crowds don't hurt less — you just stop feeling it.”",
        guestArchetype: "Mob Numbness",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${round2((sk.level || 0) * 0.5)}s Fake Tears each second while 3+ intruders are in slap range.`;
        },
        triggerText: "Trigger: 1 skill exp per second while 3+ intruders are in slap range.",
        getEffect: function(sk) {
            return { numbingCrowdsFakeTearsMsPerLevel: (sk.level || 0) * 500 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${intToString(e.numbingCrowdsFakeTearsMsPerLevel || 0, 2)} ms Fake Tears/s with 3+ in melee`;
        }
    },
    //scold skills
    {
        version:0,
        key: "alacrity",
        name: "Alacrity",
        category: "class",
        classKey: "scold",
        initialExpToLevel: 5,
        shortDescription: "Quick hands. Reduces slap/sandal cooldowns.",
        flavorText: "“Festina lente.” (Make haste slowly.) - attributed to Augustus",
        guestArchetype: "Swift Ranger",
        guestRarity: 5,
        affectedStat: "none",
        maxLevel: 1000,
        rewardText: function(sk) {
            const cd = gameData.battle.cooldowns;
            const cap = sk.maxLevel !== undefined ? sk.maxLevel : 1000;
            return `Reward: −${cd.alacritySlapReductionPerLevelMs} ms effective slap cooldown and −${cd.alacritySandalReductionPerLevelMs} ms effective sandal cooldown per Alacrity skill level (floors ${cd.slapFloorMs} ms slap / ${cd.sandalFloorMs} ms sandal; Alacrity skill cap ${cap}).`;
        },
        triggerText: "Trigger: each slap or sandal attack hit.",
        getEffect: function(sk) {
            const cap = sk.maxLevel !== undefined ? sk.maxLevel : 1000;
            return { alacrityEffectiveLevel: Math.min(sk.level || 0, cap) };
        },
        effectUiSummary: function(sk, e, cd) {
            const lv = e.alacrityEffectiveLevel || 0;
            return `Current: −${lv * cd.alacritySlapReductionPerLevelMs} ms slap / −${lv * cd.alacritySandalReductionPerLevelMs} ms sandal`;
        }
    },
    {
        version:0,
        key: "sneak_attack",
        name: "Sneak Attack",
        category: "class",
        classKey: "scold",
        initialExpToLevel: 5,
        shortDescription: "Scold opener damage bonus on first hit per intruder.",
        flavorText: "“All warfare is based on deception.” - Sun Tzu",
        guestArchetype: "Back Alley Teacher",
        guestRarity: 7,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: first hit on each intruder deals +${(sk.level || 0) * 10}% damage.`;
        },
        triggerText: "Trigger: each first hit you deal to an intruder.",
        getEffect: function(sk) {
            return { sneakFirstHitDamageBonusFraction: (sk.level || 0) * 0.1 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: first hit +${roundNearestDecimals((e.sneakFirstHitDamageBonusFraction || 0) * 100, 1)}%`;
        }
    },
    {
        version:0,
        key: "exploit",
        name: "Exploit",
        category: "class",
        classKey: "scold",
        initialExpToLevel: 5,
        shortDescription: "Scold sustained pressure on repeated target hits.",
        flavorText: "“Opportunities multiply as they are seized.” - Sun Tzu",
        guestArchetype: "Knife Expert",
        guestRarity: 7,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: consecutive hits on the same target gain +${sk.level || 0} damage per consecutive step (2nd hit +${sk.level || 0}, 3rd +${(sk.level || 0) * 2}, ...).`;
        },
        triggerText: "Trigger: hitting an intruder you've hit before.",
        getEffect: function(sk) {
            return { exploitFlatDamagePerConsecutiveStep: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.exploitFlatDamagePerConsecutiveStep || 0} dmg per repeat-hit step`;
        }
    },
    {
        version:0,
        key: "precision",
        name: "Precision",
        category: "class",
        classKey: "scold",
        initialExpToLevel: 5,
        shortDescription: "Scold class skill.",
        flavorText: "“Aim small, miss small.” - traditional marksmanship advice",
        guestArchetype: "Scold Tutor",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${sk.level}% crit chance (placeholder effect for now).`;
        },
        triggerText: "Trigger: each slap or sandal attack hit.",
        getEffect: function(sk) {
            return { precisionPlaceholderCritPercent: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.precisionPlaceholderCritPercent || 0}% crit (placeholder)`;
        }
    },
    //condescend skills
    {
        version:0,
        key: "adrenaline",
        name: "Adrenaline",
        category: "class",
        classKey: "condescend",
        initialExpToLevel: 5,
        shortDescription: "Pressure fighting. Grants Brutality with crowding.",
        flavorText: "“In the midst of chaos, there is also opportunity.” - Sun Tzu",
        guestArchetype: "Pit Fighter",
        guestRarity: 8,
        affectedStat: "str",
        rewardText: function() {
            return "Reward: +1 Brutality each time Adrenaline gains a skill level.";
        },
        triggerText: "Trigger: each second per intruder in slap range beyond the first.",
        getEffect: function(sk) {
            return { adrenalineStrFromSkillLevels: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.adrenalineStrFromSkillLevels || 0} Bru from this skill`;
        }
    },
    {
        version:0,
        key: "preparation",
        name: "Preparation",
        category: "class",
        classKey: "condescend",
        initialExpToLevel: 5,
        shortDescription: "Faster slap recharge when not engaged.",
        flavorText: "“By failing to prepare, you are preparing to fail.” - Benjamin Franklin",
        guestArchetype: "Tactician",
        guestRarity: 7,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +2% slap attack timer recharge rate per skill level while no intruder is in slap range.`;
        },
        triggerText: "Trigger: continuously while no intruder is in slap range (per second).",
        getEffect: function(sk) {
            return { preparationIdleRechargeFraction: (sk.level || 0) * 0.02 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals((e.preparationIdleRechargeFraction || 0) * 100, 1)}% slap recharge when idle`;
        }
    },
    {
        version:0,
        key: "toughness_condescend",
        name: "Toughness",
        category: "class",
        classKey: "condescend",
        initialExpToLevel: 5,
        shortDescription: "Flat ego damage reduction.",
        flavorText: "“Difficulty strengthens the mind, as labor does the body.” - Seneca",
        guestArchetype: "Condescend Mentor",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${round2((sk.level || 0) * 0.25)} armor (flat damage reduction).`;
        },
        triggerText: "Trigger: each time an intruder damages you in slap.",
        getEffect: function(sk) {
            return { toughnessArmorFlat: (sk.level || 0) * 0.25 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: ${roundNearestDecimals(e.toughnessArmorFlat || 0, 2)} armor flat`;
        }
    },
    {
        version:0,
        key: "cleave",
        name: "Cleave",
        category: "class",
        classKey: "condescend",
        initialExpToLevel: 5,
        shortDescription: "Condescend power strikes splash to adjacent threats.",
        flavorText: "“As iron sharpens iron, so one person sharpens another.” - Proverbs 27:17",
        guestArchetype: "Greatblade Master",
        guestRarity: 8,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: power strikes deal ${round2((sk.level || 0) * 10)}% of dealt damage to adjacent-lane slap enemies and one immediate intruder behind target.`;
        },
        triggerText: "Trigger: each power strike.",
        getEffect: function(sk) {
            return { cleaveSplashFraction: (sk.level || 0) * 0.1 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: splash ${roundNearestDecimals((e.cleaveSplashFraction || 0) * 100, 1)}% of strike`;
        }
    },
    {
        version:0,
        key: "thorns",
        name: "Thorns",
        category: "class",
        classKey: "condescend",
        initialExpToLevel: 5,
        shortDescription: "Condescend retaliates on slap damage taken.",
        flavorText: "“Whoever digs a pit will fall into it.” - Ecclesiastes 10:8",
        guestArchetype: "Spiked Defender",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: deal ${sk.level || 0} retaliatory damage to slap attackers.`;
        },
        triggerText: "Trigger: each time an intruder damages you in slap.",
        getEffect: function(sk) {
            return { thornsRetaliationDamage: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: ${e.thornsRetaliationDamage || 0} thorns`;
        }
    },
    {
        version:0,
        key: "execute",
        name: "Execute",
        category: "class",
        classKey: "condescend",
        initialExpToLevel: 5,
        shortDescription: "Condescend deals more damage to wounded enemies.",
        flavorText: "“Never interrupt your intruder when he is making a mistake.” - Napoleon Bonaparte",
        guestArchetype: "Finisher Captain",
        guestRarity: 7,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${round2((sk.level || 0) * 5)}% damage to enemies below 50% Aud.`;
        },
        triggerText: "Trigger: dealing damage to enemies below 50% Aud.",
        getEffect: function(sk) {
            return { executeLowAudBonusFraction: (sk.level || 0) * 0.05 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals((e.executeLowAudBonusFraction || 0) * 100, 1)}% vs under 50% Aud`;
        }
    },
    {
        version:0,
        key: "second_wind",
        name: "Second Wind",
        category: "class",
        classKey: "condescend",
        initialExpToLevel: 5,
        shortDescription: "Condescend recovers Aud when blocking.",
        flavorText: "“Fall seven times, stand up eight.” - Japanese proverb",
        guestArchetype: "Battle Survivor",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${sk.level || 0} Aud each time you block.`;
        },
        triggerText: "Trigger: each successful block.",
        getEffect: function(sk) {
            return { secondWindBlockHeal: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.secondWindBlockHeal || 0} Aud on block`;
        }
    },
    {
        version:0,
        key: "overkill",
        name: "Overkill",
        category: "class",
        classKey: "condescend",
        initialExpToLevel: 5,
        shortDescription: "Condescend finisher rhythm: exp from excess damage; after kills, surge the weapon bar (capped by attack floor).",
        flavorText: "“Anything worth doing is worth overdoing.” - Mick Jagger (attributed)",
        guestArchetype: "Executioner",
        guestRarity: 7,
        affectedStat: "none",
        rewardText: function() {
            const cd = gameData.battle.cooldowns;
            return `Reward: after a killing blow, advance the matching attack timer by up to (50 × Overkill skill level) ms, but never below ${cd.slapFloorMs} ms between slap attacks or ${cd.sandalFloorMs} ms between sandal attacks (excess bar boost is trimmed).`;
        },
        triggerText: "Trigger: exp = √(damage beyond Aud needed to intruder removal) on your killing blow; attack speed surge on intruder removal.",
        getEffect: function(sk) {
            return { __OVERKILL__BarBonusPerLevelMs: 50 * (sk.level || 0) };
        },
        effectUiSummary: function(sk, e) {
            return `Current: up to ${e.__OVERKILL__BarBonusPerLevelMs || 0} ms bar surge after kills (trimmed by cooldown floor)`;
        }
    },
    //Mock skills
    {
        version:0,
        key: "longshot",
        name: "Longshot",
        category: "class",
        classKey: "mock",
        initialExpToLevel: 5,
        shortDescription: "Mock sandal finishing and damage scaling.",
        flavorText: "“The good archer is known not by his arrows, but by his aim.” - English proverb",
        guestArchetype: "Farshot Scout",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${sk.level || 0} flat sandal damage.`;
        },
        triggerText: "Trigger: remove an intruder with a sandal attack.",
        getEffect: function(sk) {
            return { longshotSandalFlatDamage: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.longshotSandalFlatDamage || 0} sandal damage`;
        }
    },
    {
        version:0,
        key: "impact",
        name: "Impact",
        category: "class",
        classKey: "mock",
        initialExpToLevel: 5,
        shortDescription: "Mock sandal knockback and upper-map precision training.",
        flavorText: "“To every action there is always opposed an equal reaction.” - Isaac Newton",
        guestArchetype: "Siege Archer",
        guestRarity: 8,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: sandal hits knock enemies back by ${(sk.level || 0) * 0.1}s of their movement speed.`;
        },
        triggerText: "Trigger: sandal hit on an intruder in the upper half of the battlefield.",
        getEffect: function(sk) {
            return { impactKnockbackTravelSeconds: (sk.level || 0) * 0.1 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: knockback ${roundNearestDecimals(e.impactKnockbackTravelSeconds || 0, 2)}× intruder speed`;
        }
    },
    {
        version:0,
        key: "marksmanship",
        name: "Marksmanship",
        category: "class",
        classKey: "mock",
        initialExpToLevel: 5,
        shortDescription: "Mock class skill.",
        flavorText: "“Practice is the best of all instructors.” - Publilius Syrus",
        guestArchetype: "Mock Guide",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${sk.level}% sandal damage (placeholder effect for now).`;
        },
        triggerText: "Trigger: each sandal attack hit.",
        getEffect: function(sk) {
            return { marksmanshipPlaceholderSandalPct: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.marksmanshipPlaceholderSandalPct || 0}% sandal (placeholder)`;
        }
    },
    //foraging skills
    {
        version:0,
        key: "technique",
        name: "Technique",
        category: "foraging",
        initialExpToLevel: 5,
        shortDescription: "Improve harvest hits.",
        flavorText: "“The gem cannot be polished without friction, nor man perfected without trials.” - Chinese proverb",
        guestArchetype: "Old Lumberjack",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${sk.level || 0} harvest damage.`;
        },
        triggerText: "Trigger: each harvest hit.",
        getEffect: function(sk) {
            return { techniqueHarvestDamageFlat: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.techniqueHarvestDamageFlat || 0} harvest damage`;
        }
    },
    {
        version:0,
        key: "quick_rest",
        name: "Quick Rest",
        category: "foraging",
        initialExpToLevel: 5,
        shortDescription: "Recover stamina from successful gathering.",
        flavorText: "“Take rest; a field that has rested gives a bountiful crop.” - Ovid",
        guestArchetype: "Trail Forager",
        guestRarity: 5,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${round2((sk.level || 0) * 0.25)} stamina per gathered resource.`;
        },
        triggerText: "Trigger: each gathered resource.",
        getEffect: function(sk) {
            return { quickRestStaminaPerGather: (sk.level || 0) * 0.25 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals(e.quickRestStaminaPerGather || 0, 2)} stamina per gather`;
        }
    },
    {
        version:0,
        key: "breathing",
        name: "Breathing",
        category: "foraging",
        initialExpToLevel: 5,
        shortDescription: "Increase stamina capacity over time.",
        flavorText: "“Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.” - Thích Nhất Hạnh",
        guestArchetype: "Mountain Hermit",
        guestRarity: 4,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${(sk.level || 0) * 2} base stamina (max and current).`;
        },
        triggerText: "Trigger: each second while foraging.",
        getEffect: function(sk) {
            return { breathingStaminaCapacityBonus: (sk.level || 0) * 2 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.breathingStaminaCapacityBonus || 0} stamina cap`;
        }
    },
    {
        version:0,
        key: "planning",
        name: "Planning",
        category: "foraging",
        initialExpToLevel: 5,
        shortDescription: "Ambush preparation for first strikes.",
        flavorText: "“Victorious condescends win first and then go to war, while defeated condescends go to war first and then seek to win.” - Sun Tzu",
        guestArchetype: "Pathfinder",
        guestRarity: 5,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: first hit on each unit gets +${(sk.level || 0) * 10}% damage.`;
        },
        triggerText: "Trigger: each 50 px moved while foraging.",
        getEffect: function(sk) {
            return { planningFirstHitDamageBonusFraction: (sk.level || 0) * 0.1 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: first hit +${roundNearestDecimals((e.planningFirstHitDamageBonusFraction || 0) * 100, 1)}%`;
        }
    },
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
        const s = {
            key: key,
            name: d.name,
            affectedStat: d.affectedStat,
            level: 0,
            exp: 0,
            expToLevel: d.initialExpToLevel !== undefined ? d.initialExpToLevel : 5,
            talent: 0,
            talentLevel:0,
            talentToLevel: d.initialTalentToLevel !== undefined ? d.initialTalentToLevel : 10,
            shards: 0,
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

    resetSkillForRun: function(skill) {
        const cat = skill.category || "combat";
        skill.level = 0;
        skill.exp = 0;
        skill.expToLevel = skills._byKey[skill.key].initialExpToLevel;
        skill.triggerCount = 0;
        if (cat === "class") {
            skill.talent = 0;
            skill.talentToLevel = skills._byKey[skill.key].initialTalentToLevel !== undefined ? skills._byKey[skill.key].initialTalentToLevel : 10;
        }
    },

    getSkillKeysByCategory: function(progressSkills, category) {
        const sk = progressSkills;
        const out = [];
        const currentClass = data.progress.currentClassKey || "none";
        if (category === "class" && ["condescend", "scold", "mock", "shun"].indexOf(currentClass) < 0) {
            return out;
        }
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
            out.push(k);
        }
        return out;
    },
    hasAnyClassSkillForCurrentClass: function() {
        const keys = skills.getSkillKeysByCategory(data.progress.skills, "class");
        return keys.length > 0;
    },
    isSkillUnlocked: function(skillKey) {
        return !!data.progress.base.scrollArchives.unlockedSkills[skillKey];
    },
    isSkillResearchComplete: function(skillKey) {
        return skills.isSkillUnlocked(skillKey);
    },

    getSkillRewardText: function(skillKey, skill) {
        return skills._byKey[skillKey].rewardText(skill);
    },
    getSkillEffect: function(skillKey, skill) {
        const sk = skill || (data.progress && data.progress.skills && data.progress.skills[skillKey]);
        const def = skills._byKey[skillKey];
        if (!def || !def.getEffect || !sk || !skills.isSkillUnlocked(skillKey)) {
            return {};
        }
        try {
            return def.getEffect(sk) || {};
        } catch (e) {
            return {};
        }
    },
    /** One-line current effect for Skills tab (uses getSkillEffect). */
    skillEffectUiSummary: function(skillKey, skill) {
        const sk = skill || (data.progress && data.progress.skills && data.progress.skills[skillKey]);
        if (!sk || !skills.isSkillUnlocked(skillKey)) {
            return "";
        }
        const def = skills._byKey[skillKey];
        if (!def || typeof def.effectUiSummary !== "function") {
            return "";
        }
        const e = skills.getSkillEffect(skillKey, sk);
        const cd = gameData.battle.cooldowns;
        return def.effectUiSummary(sk, e, cd);
    },
    getSkillShortDescription: function(skillKey) {
        return skills._byKey[skillKey].shortDescription;
    },
    getSkillFlavorText: function(skillKey) {
        const d = skills._byKey[skillKey];
        return (d && d.flavorText) ? d.flavorText : "";
    },
    getSkillGuestInfo: function(skillKey) {
        const d = skills._byKey[skillKey];
        return {
            archetype: d.guestArchetype,
            rarity: d.guestRarity
        };
    },

    getSkillTriggerDescription: function(skillKey) {
        return skills._byKey[skillKey].triggerText;
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
        // Additive star scaling per design: 0 stars x1, 1 star x2, 2 stars x4, 3 stars x6.
        const starMult = starCount > 0 ? (starCount * 2) : 1;
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
    },

    /** Multiplier applied to every skill's exp gain except Echo Chamber's own. Level 0 → ×1. */
    getEchoChamberExpMultiplierForOthers: function() {
        if (!skills.isSkillUnlocked("echoChamber")) {
            return 1;
        }
        const sk = data.progress.skills.echoChamber;
        if (!sk || (sk.level || 0) <= 0) {
            return 1;
        }
        return Math.pow(1.1, sk.level);
    }
};
