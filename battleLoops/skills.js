const SKILL_PRIORITY = {
    force: 1,
    nickelAndDime: 1,
    selfAffirmations: 1,
    corneredEgo: 2,
    insultFatigue: 2,
    mainCharacter: 2,
    aboveItAll: 3,
    hindsight: 3,
    shameless: 3,
    grudge: 4,
    seethe: 4,
    brokenRecord: 4,
    bitterRivalry: 5,
    extortion: 5,
    shockValue: 5,
    adaptation: 6,
    savageLessons: 6,
    validation: 6,
    echoChamber: 7,
    narcissism: 7,
    temper: 7,
    applyTearDrops: 20,
    bloodRush: 20,
    imposterSyndrome: 20,
    levelHeaded: 20,
    recognition: 20,
    brandRecognition: 900,
    retailTherapy: 20,
    sadism: 20,
    numbingCrowds: 7,
    windfallSwagger: 20,
    borrowedGlory: 900,
    closingArgument: 900,
    crowdWork: 900,
    experienceHog: 900,
    heckled: 900,
    highHorse: 900,
    hotTake: 900,
    marathonEgo: 900,
    paddingResume: 900,
    peerPressure: 900,
    publicApology: 900,
    repeatOffender: 900,
    righteousRant: 900,
    secondWind: 900,
    simmer: 900,
    slowBurn: 900,
    sobStory: 900,
    socialArmor: 900,
    stageSob: 900,
    stiffUpperLip: 900,
    stoic: 900,
    studyGroup: 900,
    thickSkin: 900,
    thinIce: 900,
    underdog: 900,
    walkingItOff: 900,
    adrenaline: 999,
    alacrity: 999,
    breathing: 999,
    cleave: 999,
    execute: 999,
    exploit: 999,
    impact: 999,
    longshot: 999,
    marksmanship: 999,
    overkill: 999,
    planning: 999,
    precision: 999,
    preparation: 999,
    quick_rest: 999,
    second_wind: 999,
    sneak_attack: 999,
    technique: 999,
    thorns: 999,
    toughness_condescend: 999
};

// All skill definitions, runtime state shape, exp/talent formulas, and UI copy in one place.
const SKILL_DEFINITION_ROWS = [
    {
        version:0,
        key: "selfAffirmations",
        name: "Self-Affirmations",
        category: "combat",
        shortDescription: "Restore Aud every second while the battle runs.",
        flavorText: "“Whether you think you can, or you think you can't - you're right.” - Henry Ford",
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
        rewardText: function() {
            return "Reward: +(0.25 × skill level) base slap damage before the Brutality multiplier.";
        },
        triggerText: "Trigger: each attack.",
        getEffect: function(sk) {
            return { slapFlatBeforeStr: (sk.level || 0) * 0.25};
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals(e.slapFlatBeforeStr || 0, 2)} slap (base)`;
        }
    },
    {
        version:0,
        key: "aboveItAll",
        name: "Above It All",
        category: "combat",
        initialExpToLevel: 10,
        shortDescription: "Reduces incoming ego damage by a %.",
        flavorText: "“No one can make you feel inferior without your consent.” - Eleanor Roosevelt",
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
        rewardText: function() {
            return "Reward: +5% character leveling exp per Hindsight skill level (additive).";
        },
        triggerText: "Trigger: each intruder removal.",
        getEffect: function(sk) {
            return { wisdomCharacterExpMultiplier: 1 + 0.05 * (sk.level || 0) };
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
        rewardText: function() {
            return "Reward: +10% coins from kills per Extortion skill level (additive).";
        },
        triggerText: "Trigger: each intruder removal.",
        getEffect: function(sk) {
            return { greedKillCoinsMultiplier: 1 + 0.10 * (sk.level || 0) };
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
        rewardText: function() {
            return "Reward: base and current Aud increase by 3 * Shameless level";
        },
        triggerText: "Trigger: every 5 seconds while the battle is running - exp gained equals max(log10(current Aud), 1).",
        getEffect: function(sk) {
            return { enduranceBaseAudInnerBonus: (sk.level || 0) * 3 };
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
            return `Current: +${b} base Aud, +${2 * b} current Aud`;
        }
    },
    {
        version:0,
        key: "adaptation",
        name: "Adaptation",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "Body and mind adjust to milestones: +1 Con each time this skill levels.",
        flavorText: "“We are what we repeatedly do. Excellence, then, is not an act, but a habit.” - Aristotle",
        rewardText: function() {
            return "Reward: +1 Confidence each time Adaptation gains a skill level (not each character level).";
        },
        triggerText: "Trigger: each time your character level increases.",
        getEffect: function(sk) {
            return { adaptationBonusCon: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.adaptationBonusCon || 0} Con from Adaptation level-ups`;
        }
    },
    {
        version:0,
        key: "savageLessons",
        name: "Savage Lessons",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "Learn through the fight: +1 Bru each time this skill levels.",
        flavorText: "“Every bruise is a footnote. Every victory is the lecture.”",
        rewardText: function() {
            return "Reward: +1 Brutality each time Savage Lessons gains a skill level (not each character level).";
        },
        triggerText: "Trigger: each time your character level increases.",
        getEffect: function(sk) {
            return { savageLessonsBonusStr: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.savageLessonsBonusStr || 0} Bru from Savage Lessons level-ups`;
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
        rewardText: function() {
            return "Reward: +3% additive skill exp for every other skill per Echo Chamber skill level.";
        },
        triggerText: "Trigger: each time a Combat skill other than this one gains a skill level.",
        getEffect: function(sk) {
            return { integrationOtherSkillExpMult: 1 + 0.03 * (sk.level || 0) };
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
        initialExpToLevel: 10,
        shortDescription: "+0.1 ego damage per level per visible enemy on the battlefield.",
        flavorText: "“I'm not the hero they deserve. I'm the one with the most screen time.”",
        rewardText: function(sk) {
            return `Reward: +${round2((sk.level || 0) * 0.1)} base ego damage per visible intruder on the battlefield (before Brutality multiplier).`;
        },
        triggerText: "Trigger: 1 skill exp per second while 4 or more intruders are visible.",
        getEffect: function(sk) {
            return { mainCharacterFlatPerEnemy: (sk.level || 0) * 0.1 };
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
        rewardText: function(sk) {
            return `Reward: +${(sk.level || 0) * 5}% ego damage against intruders that have attacked you (no damage required to mark).`;
        },
        triggerText: "Trigger: each attack against an intruder that has attacked you.",
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
        initialExpToLevel: 10,
        shortDescription: "Enemies deal less flat damage after hitting you; stacks per hit.",
        flavorText: "“Your insults are losing steam. Try harder.”",
        rewardText: function(sk) {
            return `Reward: after an enemy damages you, later attacks deal ${round2((sk.level || 0) * 0.1)} flat less damage per stack (stacks per damaging hit, per enemy). The reduction is capped at half of that attack's damage.`;
        },
        triggerText: "Trigger: each time an intruder attacks you for the second time or later.",
        getEffect: function(sk) {
            return { insultFatigueFlatPerStack: (sk.level || 0) * 0.1 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: −${roundNearestDecimals(e.insultFatigueFlatPerStack || 0, 2)} flat dmg per stack, capped at 50% of the attack`;
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
        rewardText: function(sk) {
            return `Reward: each enemy attack adds a Desensitized stack lasting ${round2(1 + (sk.level || 0) * 0.25)}s.`;
        },
        triggerText: "Trigger: each time an intruder attacks you (no damage required).",
        getEffect: function(sk) {
            return { brokenRecordDesensitizedMsPerLevel: 1000 + (sk.level || 0) * 250 };
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
        shortDescription: "+1 current and max Audacity per kill, up to skill level × 4.",
        flavorText: "“See? I told you I was right to be here.”",
        rewardText: function(sk) {
            return `Reward: +1 current and max Audacity per intruder removal, up to ${(sk.level || 0) * 4} from this skill.`;
        },
        triggerText: "Trigger: each intruder removal.",
        getEffect: function(sk) {
            return { validationAudCap: (sk.level || 0) * 4 };
        },
        effectUiSummary: function(sk, e) {
            const cap = e.validationAudCap || 0;
            const kills = (data.battle && data.battle.enemiesKilled) || 0;
            const n = Math.min(kills, cap);
            return `Current: +${n} current and max Aud from kills (cap ${cap})`;
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
        shortDescription: "Extra current Audacity when max Audacity increases, including from Confidence.",
        flavorText: "“The bigger I am, the more of me there is to love.”",
        rewardText: function(sk) {
            return `Reward: +${(sk.level || 0) * 10}% extra current Audacity when max Audacity increases, including from Confidence. Does not apply to regeneration or other healing.`;
        },
        triggerText: "Trigger: log2(max Audacity gained) when max Audacity increases, including from Confidence.",
        getEffect: function(sk) {
            return { narcissismAudGainMultPerLevel: (sk.level || 0) * 0.10 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals((e.narcissismAudGainMultPerLevel || 0) * 100, 1)}% extra current Aud when max Aud increases (including from Con)`;
        }
    },
    {
        version:0,
        key: "windfallSwagger",
        name: "Windfall Swagger",
        category: "combat",
        initialExpToLevel: 15,
        shortDescription: "+1 Confidence per skill level.",
        flavorText: "“Money talks, and apparently it speaks fluent confidence.”",
        rewardText: function() {
            return "Reward: +1 Confidence per Windfall Swagger skill level.";
        },
        triggerText: "Trigger: log10(coins gained) on each intruder removal.",
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
        initialExpToLevel: 25,
        shortDescription: "+1 Brutality per skill level.",
        flavorText: "“Go big or go home. Preferably both, loudly.”",
        rewardText: function() {
            return "Reward: +1 Brutality per Shock Value skill level.";
        },
        triggerText: "Trigger: max(log10(ego damage dealt), 1) on each attack.",
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
        shortDescription: "Deal more damage to enemies the longer they stay in slap range.",
        flavorText: "“Every level they gain, I gain the urge to one-up them.”",
        rewardText: function(sk) {
            return `Reward: +${round2((sk.level || 0) * 0.5)}% damage to an enemy for each second they have been in slap range.`;
        },
        triggerText: "Trigger: 1 skill exp per second an enemy spends in slap range.",
        getEffect: function(sk) {
            return { bitterRivalryDamagePercentPerSecond: (sk.level || 0) * 0.5 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${round2(e.bitterRivalryDamagePercentPerSecond || 0)}% damage per second an enemy is in slap range`;
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
        rewardText: function(sk) {
            return `Reward: +1 Fury stack per Seethe skill level every 0.5s while no intruders are in slap range.`;
        },
        triggerText: "Trigger: passive every 0.5s while no intruders are in slap range.",
        getEffect: function(sk) {
            return { seetheFuryPerLevel: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.seetheFuryPerLevel || 0} Fury every 0.5s with no enemies in melee`;
        }
    },
    {
        version:0,
        key: "retailTherapy",
        name: "Retail Therapy",
        category: "combat",
        initialExpToLevel: 15,
        shortDescription: "Desensitized stacks when gaining coins.",
        flavorText: "“Nothing soothes the ego like a little retail therapy.”",
        rewardText: function(sk) {
            return `Reward: +1 Desensitized stack lasting ${round2(2 + (sk.level || 0) * 0.5)}s when you gain coins.`;
        },
        triggerText: "Trigger: log10(coins gained) on each coin gain from intruder removal.",
        getEffect: function(sk) {
            return { retailTherapyDesensitizedMsPerLevel: 2000 + (sk.level || 0) * 500 };
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
        initialExpToLevel: 10,
        shortDescription: "Desensitized stacks when your character levels up.",
        flavorText: "“Growth is just another word for getting used to it.”",
        rewardText: function(sk) {
            return `Reward: 5 Desensitized stacks lasting ${round2(2 + (sk.level || 0) * 0.5)}s each when your character level increases.`;
        },
        triggerText: "Trigger: sqrt(character exp threshold for that level) each time your character level increases.",
        getEffect: function(sk) {
            return { levelHeadedDesensitizedMsPerLevel: 2000 + (sk.level || 0) * 500 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: 5 Desensitized stacks lasting ${round2((e.levelHeadedDesensitizedMsPerLevel || 0) / 1000)}s each per character level-up`;
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
        rewardText: function(sk) {
            return `Reward: Gain +${round2((sk.level || 0) * 0.5)} Malice when defeating an intruder while above 50% Aud.`;
        },
        triggerText: "Trigger: each intruder removal.",
        getEffect: function(sk) {
            return { bloodRushMalicePerLevel: (sk.level || 0) * 0.5 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${round2(e.bloodRushMalicePerLevel || 0)} Malice per kill above half Aud`;
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
        rewardText: function(sk) {
            return `Reward: +${round2((sk.level || 0) * 0.5)} Malice when taking damage while above 50% Aud.`;
        },
        triggerText: "Trigger: each damaging intruder attack while above 50% Aud.",
        getEffect: function(sk) {
            return { temperMalicePerLevel: (sk.level || 0) * 0.5 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${round2(e.temperMalicePerLevel || 0)} Malice per hit above half Aud`;
        }
    },
    {
        version:0,
        key: "sadism",
        name: "Sadism",
        category: "combat",
        initialExpToLevel: 15,
        shortDescription: "Malice when killing enemies; exp from overkill.",
        flavorText: "“Excess is the point.”",
        rewardText: function(sk) {
            return `Reward: +${round2(sk.level || 0)} Malice when defeating an intruder.`;
        },
        triggerText: "Trigger: log2(overkill damage) on each intruder removal.",
        getEffect: function(sk) {
            return { sadismMalicePerLevel: (sk.level || 0) * 1 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${round2(e.sadismMalicePerLevel || 0)} Malice per kill`;
        }
    },
    {
        version:0,
        key: "recognition",
        name: "Recognition",
        category: "combat",
        initialExpToLevel: 20,
        shortDescription: "Clout when any skill levels up.",
        flavorText: "“Every promotion deserves applause.”",
        rewardText: function(sk) {
            return `Reward: +0.25 Clout when any skill (including Recognition) gains a level.`;
        },
        triggerText: "Trigger: When any other skill gains a level.",
        getEffect: function(sk) {
            return { recognitionCloutPerLevel: (sk.level || 0) * 0.25 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${round2(e.recognitionCloutPerLevel || 0)} Clout per skill level-up`;
        }
    },
    {
        version:0,
        key: "brandRecognition",
        name: "Brand Recognition",
        category: "combat",
        initialExpToLevel: 10,
        shortDescription: "Clout while at max Audacity.",
        flavorText: "“At full confidence, everyone already knows the logo.”",
        rewardText: function(sk) {
            return `Reward: +${round2((sk.level || 0) * 0.5)} Clout every 1s while at max Aud.`;
        },
        triggerText: "Trigger: 1 skill exp per second while at max Aud.",
        getEffect: function(sk) {
            return { brandRecognitionCloutPerSec: (sk.level || 0) * 0.5 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${round2(e.brandRecognitionCloutPerSec || 0)} Clout/s at max Aud`;
        }
    },
    {
        version:0,
        key: "applyTearDrops",
        name: "Apply Tear Drops",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "Fake Tears while advancing on the battlefield.",
        flavorText: "“The tears flow freely when you're on the move.”",
        rewardText: function(sk) {
            return `Reward: +${round2(1 + (sk.level || 0) * 0.1)}s Fake Tears every 0.5s while moving forward.`;
        },
        triggerText: "Trigger: 1 skill exp per 0.5s while moving forward on the battlefield.",
        getEffect: function(sk) {
            return { applyTearDropsMs: 1000 + (sk.level || 0) * 100 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${intToString(e.applyTearDropsMs || 0, 2)} ms Fake Tears per 0.5s while moving`;
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
    {
        version:0,
        key: "peerPressure",
        name: "Peer Pressure",
        category: "combat",
        initialExpToLevel: 8,
        shortDescription: "Extra base ego damage per intruder in slap range.",
        flavorText: "“Everybody's doing it. That's the whole point.”",
        rewardText: function(sk) {
            return `Reward: +${round2((sk.level || 0) * 0.2)} base ego damage per intruder in slap range (before Brutality multiplier).`;
        },
        triggerText: "Trigger: 1 skill exp per second while any intruder is in slap range.",
        getEffect: function(sk) {
            return { peerPressureFlatPerInRange: (sk.level || 0) * 0.2 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals(e.peerPressureFlatPerInRange || 0, 2)} ego dmg per slap-range enemy`;
        }
    },
    {
        version:0,
        key: "highHorse",
        name: "High Horse",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "More ego damage while above half Aud.",
        flavorText: "“It's not arrogance if you're still winning.”",
        rewardText: function(sk) {
            return `Reward: +${round2((sk.level || 0) * 4)}% ego damage while above 50% Aud.`;
        },
        triggerText: "Trigger: each attack while above 50% Aud.",
        getEffect: function(sk) {
            return { highHorseDamageBonusFraction: (sk.level || 0) * 0.04 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals((e.highHorseDamageBonusFraction || 0) * 100, 1)}% dmg above half Aud`;
        }
    },
    {
        version:0,
        key: "underdog",
        name: "Underdog",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "More ego damage while at or below half Aud.",
        flavorText: "“They love a comeback almost as much as I need one.”",
        rewardText: function(sk) {
            return `Reward: +${round2((sk.level || 0) * 6)}% ego damage while at or below 50% Aud.`;
        },
        triggerText: "Trigger: each attack while at or below 50% Aud.",
        getEffect: function(sk) {
            return { underdogDamageBonusFraction: (sk.level || 0) * 0.06 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals((e.underdogDamageBonusFraction || 0) * 100, 1)}% dmg at or below half Aud`;
        }
    },
    {
        version:0,
        key: "repeatOffender",
        name: "Repeat Offender",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "Extra flat ego damage per previous hit on the same intruder.",
        flavorText: "“I don't make new points. I make the same point louder.”",
        rewardText: function(sk) {
            return `Reward: +${round2((sk.level || 0) * 0.4)} flat ego damage per previous hit on that same intruder.`;
        },
        triggerText: "Trigger: hitting an intruder you've hit before.",
        getEffect: function(sk) {
            return { repeatOffenderFlatPerPriorHit: (sk.level || 0) * 0.4 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals(e.repeatOffenderFlatPerPriorHit || 0, 2)} dmg per prior hit on target`;
        }
    },
    {
        version:0,
        key: "crowdWork",
        name: "Crowd Work",
        category: "combat",
        initialExpToLevel: 8,
        shortDescription: "More ego damage % while many intruders are visible.",
        flavorText: "“A packed house is just a bigger mirror.”",
        rewardText: function(sk) {
            return `Reward: +${round2((sk.level || 0) * 3)}% ego damage while 4 or more intruders are visible.`;
        },
        triggerText: "Trigger: 1 skill exp per second while 4 or more intruders are visible.",
        getEffect: function(sk) {
            return { crowdWorkDamageBonusFraction: (sk.level || 0) * 0.03 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals((e.crowdWorkDamageBonusFraction || 0) * 100, 1)}% dmg with 4+ visible`;
        }
    },
    {
        version:0,
        key: "walkingItOff",
        name: "Walking It Off",
        category: "combat",
        initialExpToLevel: 10,
        shortDescription: "Restore Aud while advancing on the battlefield.",
        flavorText: "“Keep moving and the sting can't catch up.”",
        rewardText: function(sk) {
            return `Reward: restore +${round2((sk.level || 0) * 0.08)} Aud per second while moving forward.`;
        },
        triggerText: "Trigger: 1 skill exp per second while moving forward on the battlefield.",
        getEffect: function(sk) {
            return { walkingItOffAudPerSec: (sk.level || 0) * 0.08 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals(e.walkingItOffAudPerSec || 0, 2).toFixed(2)} Aud/s while moving`;
        }
    },
    {
        version:0,
        key: "publicApology",
        name: "Public Apology",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "Restore Aud on each intruder removal.",
        flavorText: "“I'm sorry you made me do that.”",
        rewardText: function(sk) {
            return `Reward: restore +${round2((sk.level || 0) * 0.5)} Aud on each intruder removal.`;
        },
        triggerText: "Trigger: each intruder removal.",
        getEffect: function(sk) {
            return { publicApologyAudPerKill: (sk.level || 0) * 0.5 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals(e.publicApologyAudPerKill || 0, 2)} Aud per kill`;
        }
    },
    {
        version:0,
        key: "thickSkin",
        name: "Thick Skin",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "Flat incoming ego damage reduction.",
        flavorText: "“If you can't handle me at my worst, you can't handle me.”",
        rewardText: function(sk) {
            return `Reward: +${round2((sk.level || 0) * 0.2)} armor (flat damage reduction).`;
        },
        triggerText: "Trigger: each time an intruder damages you.",
        getEffect: function(sk) {
            return { thickSkinArmorFlat: (sk.level || 0) * 0.2 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: ${roundNearestDecimals(e.thickSkinArmorFlat || 0, 2)} armor flat`;
        }
    },
    {
        version:0,
        key: "secondWind",
        name: "Second Wind",
        category: "combat",
        initialExpToLevel: 10,
        shortDescription: "Restore Aud once per clone when dropping very low.",
        flavorText: "“I'm not done. I'm just catching my breath in public.”",
        rewardText: function(sk) {
            return `Reward: restore +${round2((sk.level || 0) * 2)} Aud when Aud is below 20% (once per clone run).`;
        },
        triggerText: "Trigger: 1 skill exp per second while Aud is below 50%.",
        getEffect: function(sk) {
            return { secondWindRestoreAud: (sk.level || 0) * 2 };
        },
        effectUiSummary: function(sk, e) {
            const used = !!(data.battle && data.battle.secondWindRestoreUsed);
            return `Current: +${roundNearestDecimals(e.secondWindRestoreAud || 0, 2)} Aud below 20% (${used ? "used this clone" : "ready"})`;
        }
    },
    {
        version:0,
        key: "stiffUpperLip",
        name: "Stiff Upper Lip",
        category: "combat",
        initialExpToLevel: 8,
        shortDescription: "Reduces incoming ego damage while hurt.",
        flavorText: "“Keep smiling. They hate that more than the slap.”",
        rewardText: function() {
            return "Reward: while at or below 50% Aud, multiply incoming slap damage by 1 / (1 + 0.03 × Stiff Upper Lip skill level).";
        },
        triggerText: "Trigger: each time an intruder attacks you while you are at or below 50% Aud.",
        getEffect: function(sk) {
            const lv = sk.level || 0;
            return { stiffUpperLipIncomingDamageMultiplier: 1 / (1 + lv * 0.03) };
        },
        effectUiSummary: function(sk, e) {
            return `Current: incoming ×${roundNearestDecimals(e.stiffUpperLipIncomingDamageMultiplier || 1, 3)} at or below half Aud`;
        }
    },
    {
        version:0,
        key: "paddingResume",
        name: "Padding the Resume",
        category: "combat",
        initialExpToLevel: 10,
        shortDescription: "Bonus Aud from character level.",
        flavorText: "“Every level is another bullet point. Every bullet point is another reason I'm fine.”",
        rewardText: function(sk) {
            return `Reward: +${(sk.level || 0) * 2} current and max Aud per character level.`;
        },
        triggerText: "Trigger: each time your character level increases.",
        getEffect: function(sk) {
            const charLv = (data.battle && data.battle.levelState && data.battle.levelState.level) || 0;
            const perChar = (sk.level || 0) * 2;
            return { paddingResumeAudPerCharLevel: perChar, paddingResumeAudBonus: perChar * charLv };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.paddingResumeAudBonus || 0} Aud (${e.paddingResumeAudPerCharLevel || 0} per character level)`;
        }
    },
    {
        version:0,
        key: "experienceHog",
        name: "Experience Hog",
        category: "combat",
        initialExpToLevel: 3,
        shortDescription: "Boosts character leveling exp.",
        flavorText: "“If there's a lesson here, I'm taking the whole plate.”",
        rewardText: function() {
            return "Reward: +2% character leveling exp per Experience Hog skill level (additive, stacks with Hindsight).";
        },
        triggerText: "Trigger: each intruder removal.",
        getEffect: function(sk) {
            return { experienceHogCharacterExpAdd: 0.02 * (sk.level || 0) };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals((e.experienceHogCharacterExpAdd || 0) * 100, 1)}% char exp`;
        }
    },
    {
        version:0,
        key: "studyGroup",
        name: "Study Group",
        category: "combat",
        initialExpToLevel: 10,
        shortDescription: "Character exp when other combat skills level.",
        flavorText: "“Your breakthrough is my group project.”",
        rewardText: function(sk) {
            return `Reward: +${round2((sk.level || 0) * 0.25)} character exp when any other combat skill gains a level. Character exp multipliers apply.`;
        },
        triggerText: "Trigger: each time a Combat skill other than this one gains a skill level.",
        getEffect: function(sk) {
            return { studyGroupCharacterExpPerLevel: (sk.level || 0) * 0.25 };
        },
        effectUiSummary: function(sk, e) {
            const base = e.studyGroupCharacterExpPerLevel || 0;
            const mult = typeof engine !== "undefined" && engine.getCharacterExpMultiplier ? engine.getCharacterExpMultiplier() : 1;
            return `Current: +${round2(base)} char exp per other combat skill level-up (×${round2(mult)})`;
        }
    },
    {
        version:0,
        key: "slowBurn",
        name: "Slow Burn",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "Gain Fury stacks while enemies are in melee.",
        flavorText: "“Don't rush the resentment. Let it marinate.”",
        rewardText: function(sk) {
            return `Reward: +${sk.level || 0} Fury stack(s) every 1s while any intruder is in slap range.`;
        },
        triggerText: "Trigger: 1 skill exp per second while any intruder is in slap range.",
        getEffect: function(sk) {
            return { slowBurnFuryPerLevel: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.slowBurnFuryPerLevel || 0} Fury/s with enemies in melee`;
        }
    },
    {
        version:0,
        key: "thinIce",
        name: "Thin Ice",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "Gain Fury stacks while below half Aud.",
        flavorText: "“One more comment and we all go through.”",
        rewardText: function(sk) {
            return `Reward: +${sk.level || 0} Fury stack(s) every 0.5s while below 50% Aud.`;
        },
        triggerText: "Trigger: 1 skill exp per 0.5s while Aud is below 50%.",
        getEffect: function(sk) {
            return { thinIceFuryPerLevel: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.thinIceFuryPerLevel || 0} Fury every 0.5s below half Aud`;
        }
    },
    {
        version:0,
        key: "stoic",
        name: "Stoic",
        category: "combat",
        initialExpToLevel: 8,
        shortDescription: "Desensitized stacks while at max Aud.",
        flavorText: "“Nothing happened, and I have decided that is the correct amount of feeling.”",
        rewardText: function(sk) {
            return `Reward: +1 Desensitized stack lasting ${round2(2 + (sk.level || 0) * 0.5)}s every 1s while at max Aud.`;
        },
        triggerText: "Trigger: 1 skill exp per second while at max Aud.",
        getEffect: function(sk) {
            return { stoicDesensitizedMsPerLevel: 2000 + (sk.level || 0) * 500 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +1 Desensitized (${intToString(e.stoicDesensitizedMsPerLevel || 0, 2)} ms) per second at max Aud`;
        }
    },
    {
        version:0,
        key: "hotTake",
        name: "Hot Take",
        category: "combat",
        initialExpToLevel: 10,
        shortDescription: "Outrage when taking damage.",
        flavorText: "“That was uncalled for, and I will be discussing it at length.”",
        rewardText: function(sk) {
            return `Reward: +${round2((sk.level || 0) * 0.05)}s Outrage each time you take damage.`;
        },
        triggerText: "Trigger: each damaging intruder attack.",
        getEffect: function(sk) {
            return { hotTakeOutrageMsPerLevel: (sk.level || 0) * 50 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${intToString(e.hotTakeOutrageMsPerLevel || 0, 2)} ms Outrage per hit taken`;
        }
    },
    {
        version:0,
        key: "righteousRant",
        name: "Righteous Rant",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "Outrage while advancing on the battlefield.",
        flavorText: "“The speech writes itself if you just keep walking toward them.”",
        rewardText: function(sk) {
            return `Reward: +${round2((sk.level || 0) * 0.1)}s Outrage every 0.5s while moving forward.`;
        },
        triggerText: "Trigger: 1 skill exp per 0.5s while moving forward on the battlefield.",
        getEffect: function(sk) {
            return { righteousRantOutrageMs: (sk.level || 0) * 100 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${intToString(e.righteousRantOutrageMs || 0, 2)} ms Outrage per 0.5s while moving`;
        }
    },
    {
        version:0,
        key: "heckled",
        name: "Heckled",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "Outrage when surrounded in melee.",
        flavorText: "“Say that again. Closer. I dare you.”",
        rewardText: function(sk) {
            return `Reward: +${round2((sk.level || 0) * 0.1)}s Outrage every 1s while 3+ intruders are in slap range.`;
        },
        triggerText: "Trigger: 1 skill exp per second while 3+ intruders are in slap range.",
        getEffect: function(sk) {
            return { heckledOutrageMsPerLevel: (sk.level || 0) * 100 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${intToString(e.heckledOutrageMsPerLevel || 0, 2)} ms Outrage/s with 3+ in melee`;
        }
    },
    {
        version:0,
        key: "simmer",
        name: "Simmer",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "Malice while at max Aud.",
        flavorText: "“I'm fine. That's what makes it worse.”",
        rewardText: function(sk) {
            return `Reward: +${round2((sk.level || 0) * 0.25)} Malice every 0.5s while at max Aud.`;
        },
        triggerText: "Trigger: 1 skill exp per 0.5s while at max Aud.",
        getEffect: function(sk) {
            return { simmerMalicePerLevel: (sk.level || 0) * 0.25 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${round2(e.simmerMalicePerLevel || 0)} Malice every 0.5s at max Aud`;
        }
    },
    {
        version:0,
        key: "sobStory",
        name: "Sob Story",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "Fake Tears when taking damage.",
        flavorText: "“You wouldn't hit me if you knew what I've been through. Anyway.”",
        rewardText: function(sk) {
            return `Reward: +${round2((sk.level || 0) * 0.4)}s Fake Tears each time you take damage.`;
        },
        triggerText: "Trigger: each damaging intruder attack.",
        getEffect: function(sk) {
            return { sobStoryFakeTearsMsPerLevel: (sk.level || 0) * 400 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${intToString(e.sobStoryFakeTearsMsPerLevel || 0, 2)} ms Fake Tears per hit taken`;
        }
    },
    {
        version:0,
        key: "stageSob",
        name: "Stage Sob",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "Fake Tears while many intruders are watching.",
        flavorText: "“If there's an audience, the tears have somewhere to land.”",
        rewardText: function(sk) {
            return `Reward: +${round2((sk.level || 0) * 0.4)}s Fake Tears every 1s while 4+ intruders are visible.`;
        },
        triggerText: "Trigger: 1 skill exp per second while 4 or more intruders are visible.",
        getEffect: function(sk) {
            return { stageSobFakeTearsMsPerLevel: (sk.level || 0) * 400 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${intToString(e.stageSobFakeTearsMsPerLevel || 0, 2)} ms Fake Tears/s with 4+ visible`;
        }
    },
    {
        version:0,
        key: "socialArmor",
        name: "Social Armor",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "Clout when surrounded in melee.",
        flavorText: "“A crowd is just a very clingy shield.”",
        rewardText: function(sk) {
            return `Reward: +${sk.level || 0} Clout every 1s while 3+ intruders are in slap range.`;
        },
        triggerText: "Trigger: 1 skill exp per second while 3+ intruders are in slap range.",
        getEffect: function(sk) {
            return { socialArmorCloutPerLevel: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.socialArmorCloutPerLevel || 0} Clout/s with 3+ in melee`;
        }
    },
    {
        version:0,
        key: "borrowedGlory",
        name: "Borrowed Glory",
        category: "combat",
        initialExpToLevel: 10,
        shortDescription: "Clout when max Audacity increases.",
        flavorText: "“Your growth is my glow-up.”",
        rewardText: function(sk) {
            return `Reward: +${(sk.level || 0) * 3} Clout whenever max Audacity increases, including from Confidence.`;
        },
        triggerText: "Trigger: When max Audacity increases, including from Confidence.",
        getEffect: function(sk) {
            return { borrowedGloryCloutPerLevel: (sk.level || 0) * 3 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.borrowedGloryCloutPerLevel || 0} Clout per max Aud increase`;
        }
    },
    {
        version:0,
        key: "marathonEgo",
        name: "Marathon Ego",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "More ego damage the longer the clone fight lasts.",
        flavorText: "“I don't peak early. I peak constantly, then more.”",
        rewardText: function(sk) {
            return `Reward: +${round2((sk.level || 0) * 0.5)}% ego damage per 10 seconds the clone has been fighting.`;
        },
        triggerText: "Trigger: 1 skill exp per 5 seconds the clone is alive in combat.",
        getEffect: function(sk) {
            return { marathonEgoDamagePercentPerTenSec: (sk.level || 0) * 0.5 };
        },
        effectUiSummary: function(sk, e) {
            const tens = Math.floor(((data.battle && data.battle.cloneAliveMs) || 0) / 10000);
            const pct = (e.marathonEgoDamagePercentPerTenSec || 0) * tens;
            return `Current: +${round2(e.marathonEgoDamagePercentPerTenSec || 0)}% dmg per 10s (${round2(pct)}% now)`;
        }
    },
    {
        version:0,
        key: "closingArgument",
        name: "Closing Argument",
        category: "combat",
        initialExpToLevel: 5,
        shortDescription: "More ego damage to an intruder you have already attacked.",
        flavorText: "“Let the record show they were already losing.”",
        rewardText: function(sk) {
            return `Reward: +${round2((sk.level || 0) * 6)}% ego damage vs an intruder you have already attacked.`;
        },
        triggerText: "Trigger: each attack against an intruder below 50% Aud.",
        getEffect: function(sk) {
            return { closingArgumentDamageBonusFraction: (sk.level || 0) * 0.06 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals((e.closingArgumentDamageBonusFraction || 0) * 100, 1)}% dmg vs already attacked`;
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
        shortDescription: "Quick hands. Reduces slap cooldown.",
        flavorText: "“Festina lente.” (Make haste slowly.) - attributed to Augustus",
        maxLevel: 1000,
        rewardText: function(sk) {
            const cd = gameData.battle.cooldowns;
            const cap = sk.maxLevel !== undefined ? sk.maxLevel : 1000;
            return `Reward: −${cd.alacritySlapReductionPerLevelMs} ms effective slap cooldown per Alacrity skill level (floor ${cd.slapFloorMs} ms; Alacrity skill cap ${cap}).`;
        },
        triggerText: "Trigger: each attack.",
        getEffect: function(sk) {
            const cap = sk.maxLevel !== undefined ? sk.maxLevel : 1000;
            return { alacrityEffectiveLevel: Math.min(sk.level || 0, cap) };
        },
        effectUiSummary: function(sk, e, cd) {
            const lv = e.alacrityEffectiveLevel || 0;
            return `Current: −${lv * cd.alacritySlapReductionPerLevelMs} ms slap`;
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
        rewardText: function(sk) {
            const step = round2((sk.level || 0) * 0.5);
            return `Reward: consecutive hits on the same target gain +${step} base damage per consecutive step (2nd hit +${step}, 3rd +${round2(step * 2)}, ...).`;
        },
        triggerText: "Trigger: hitting an intruder you've hit before.",
        getEffect: function(sk) {
            return { exploitFlatDamagePerConsecutiveStep: (sk.level || 0) * 0.5 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${round2(e.exploitFlatDamagePerConsecutiveStep || 0)} base dmg per repeat-hit step`;
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
        rewardText: function(sk) {
            return `Reward: +${sk.level}% crit chance (placeholder effect for now).`;
        },
        triggerText: "Trigger: each attack.",
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
    buffDescriptions: {
        "Fury": "Your next strike deals +1% damage per stack. All stacks are consumed when you attack.",
        "Desensitized": "Incoming damage is multiplied by 1 / (1 + 0.03 × stacks). Each stack expires on its own timer.",
        "Outrage": "Your attack timer recharges 50% faster while active. Additional time extends the buff.",
        "Malice": "Builds a Malice counter, leading to 10% more damage on the next strike, increasing +10% per 20 stacks.",
        "Fake Tears": "You take 20% less damage while active. Additional time extends the buff.",
        "Clout": "Each stack blocks 1 incoming damage. Stacks consumed equal damage prevented."
    },
    wrapBuffNamesInHtml: function(text) {
        const raw = text || "";
        const names = Object.keys(skills.buffDescriptions).sort(function(a, b) {
            return b.length - a.length;
        });
        const pattern = new RegExp("(" + names.join("|") + ")", "g");
        return raw.replace(pattern, function(name) {
            const desc = skills.buffDescriptions[name] || "";
            return `<span class="showthat skill-buff-tip"><strong>${name}</strong><div class="showthis">${desc}</div></span>`;
        });
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
        const currentClass = data.progress.currentClassKey || "none";
        const classMult = (currentClass && currentClass !== "none") ? 1.5 : 1;
        return {
            talentMult: talentMult,
            levelMult: levelMult,
            tipsMult: tipsMult,
            starMult: starMult,
            classMult: classMult,
            combinedMult: talentMult * levelMult * tipsMult * starMult * classMult
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
        return 1 + 0.03 * (sk.level || 0);
    }
};
