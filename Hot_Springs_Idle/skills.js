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
    brokenRecord: 4,
    grudge: 4,
    seethe: 4,
    bitterRivalry: 5,
    extortion: 5,
    shockValue: 5,
    adaptation: 6,
    savageLessons: 6,
    validation: 6,
    echoChamber: 7,
    narcissism: 7,
    numbingCrowds: 7,
    temper: 7,
    applyTearDrops: 8,
    crowdWork: 8,
    walkingItOff: 8,
    publicApology: 9,
    secondWind: 9,
    slowBurn: 9,
    closingArgument: 10,
    experienceHog: 10,
    socialArmor: 10,
    bloodRush: 20,
    imposterSyndrome: 20,
    levelHeaded: 20,
    recognition: 20,
    retailTherapy: 20,
    sadism: 20,
    windfallSwagger: 20,
    brandRecognition: 900,
    heckled: 900,
    highHorse: 900,
    hotTake: 900,
    peerPressure: 900,
    repeatOffender: 900,
    righteousRant: 900,
    simmer: 900,
    sobStory: 900,
    stageSob: 900,
    stoic: 900,
    thickSkin: 900,
    thinIce: 900,
    underdog: 900,
    borrowedGlory: 990,
    marathonEgo: 990,
    paddingResume: 990,
    stiffUpperLip: 990,
    studyGroup: 990,
    adrenaline: 999,
    alacrity: 999,
    cleave: 999,
    execute: 999,
    exploit: 999,
    impact: 999,
    longshot: 999,
    marksmanship: 999,
    overkill: 999,
    precision: 999,
    preparation: 999,
    second_wind: 999,
    sneak_attack: 999,
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
        slotCategory: "defense",
        initialExpToLevel: 10,
        flavorText: '"To love oneself is the beginning of a lifelong romance." — Oscar Wilde',
        shortDescription: "Restore Aud every second while the battle runs.",
        rewardText: function() {
            return "Reward: +0.5 Aud/s, plus +0.25 Aud/s per skill level.";
        },
        triggerText: "Trigger: 1 skill exp per second while Aud is below 100%.",
        getEffect: function(sk) {
            return { audPerSec: 0.5 + (sk.level || 0) * 0.25 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals(e.audPerSec || 0, 2).toFixed(2)} Aud/s`;
        }
    },
    {
        version:0,
        key: "force",
        name: "Force",
        category: "combat",
        slotCategory: "offense",
        initialExpToLevel: 5,
        flavorText: "\"My opinions land harder than yours.\"",
        shortDescription: "+0.25 base ego damage per skill level (before Brutality multiplier).",
        rewardText: function() {
            return "Reward: +0.25 base slap damage per skill level before the Brutality multiplier.";
        },
        triggerText: "Trigger: each attack.",
        getEffect: function(sk) {
            return { baseDamage: (sk.level || 0) * 0.25};
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals(e.baseDamage || 0, 2)} slap (base)`;
        }
    },
    {
        version:0,
        key: "aboveItAll",
        name: "Above It All",
        category: "combat",
        slotCategory: "defense",
        initialExpToLevel: 20,
        initialTalentToLevel: 20,
        flavorText: '"The eagle does not catch flies." — Latin Proverb',
        shortDescription: "Reduces incoming ego damage by a %.",
        rewardText: function() {
            return "Reward: multiply incoming slap damage by 1 / (1 + 0.02 x skill level).";
        },
        triggerText: "Trigger: each time an intruder attacks you (no damage required).",
        getEffect: function(sk) {
            const lv = sk.level || 0;
            return { incomingDamageMultiplier: 1 / (1 + lv * 0.02) };
        },
        effectUiSummary: function(sk, e) {
            return `Current: incoming ×${roundNearestDecimals(e.incomingDamageMultiplier || 1, 3)}`;
        }
    },
    {
        version:0,
        key: "hindsight",
        name: "Hindsight",
        category: "combat",
        slotCategory: "utility",
        initialExpToLevel: 5,
        initialTalentToLevel: 3,
        flavorText: '"Life can only be understood backwards; but it must be lived forwards." - Søren Kierkegaard',
        shortDescription: "Boosts character leveling exp.",
        rewardText: function() {
            return "Reward: +5% character leveling exp per Hindsight skill level (additive).";
        },
        triggerText: "Trigger: each character level up.",
        getEffect: function(sk) {
            return { characterExpMultiplier: 1 + 0.05 * (sk.level || 0) };
        },
        effectUiSummary: function(sk, e) {
            return `Current: char exp ×${roundNearestDecimals(e.characterExpMultiplier || 1, 2)}`;
        }
    },
    {
        version:0,
        key: "extortion",
        name: "Extortion",
        category: "combat",
        slotCategory: "utility",
        initialExpToLevel: 10,
        initialTalentToLevel: 10,
        flavorText: "\"I don't loot. I invoice.\"",
        shortDescription: "Coin gain multiplier on intruder removal.",
        rewardText: function() {
            return "Reward: +5% coins from kills per Extortion skill level (additive).";
        },
        triggerText: "Trigger: each intruder removal.",
        getEffect: function(sk) {
            return { killCoinsMultiplier: 1 + 0.05 * (sk.level || 0) };
        },
        effectUiSummary: function(sk, e) {
            return `Current: intruder removal coins ×${roundNearestDecimals(e.killCoinsMultiplier || 1, 2)}`;
        }
    },
    {
        version:0,
        key: "nickelAndDime",
        name: "Nickel and Dime",
        category: "combat",
        slotCategory: "utility",
        initialExpToLevel: 10,
        initialTalentToLevel: 15,
        flavorText: '"Take care of the pennies, and the pounds will take care of themselves." - William Lowndes',
        shortDescription: "Adds extra base coins per intruder removal.",
        rewardText: function() {
            return "Reward: +1 base coins per skill level on each intruder removal. Applies before other multipliers.";
        },
        triggerText: "Trigger: gain log10(coins gained) exp on killing a unit.",
        getEffect: function(sk) {
            return { killCoinsFlat: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.killCoinsFlat || 0} base coins per intruder removal`;
        }
    },
    {
        version:0,
        key: "shameless",
        name: "Shameless",
        category: "combat",
        slotCategory: "defense",
        initialExpToLevel: 10,
        flavorText: "\"I kept the scandal. I threw out the apology.\"",
        shortDescription: "Raises base and current Aud.",
        rewardText: function() {
            return "Reward: base and current Aud increase by 10 per skill level";
        },
        triggerText: "Trigger: every 5 seconds while the battle is running - exp gained equals max(log10(current Aud), 1).",
        getEffect: function(sk) {
            return { baseAudBonus: (sk.level || 0) * 10 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.baseAudBonus || 0} base and current Aud`;
        }
    },
    {
        version:0,
        key: "corneredEgo",
        name: "Cornered Ego",
        category: "combat",
        slotCategory: "defense",
        initialExpToLevel: 5,
        initialTalentToLevel: 5,
        flavorText: "\"Half empty is when I start taking myself seriously.\"",
        shortDescription: "Raises base and current Audacity, only when below half Aud.",
        rewardText: function() {
            return "Reward: base Aud increase by 4 per skill level. Current Aud increase by 8 per skill level.";
        },
        triggerText: "Trigger: each second while Aud is below half.",
        getEffect: function(sk) {
            const lv = sk.level || 0;
            return { audInnerBonus: lv * 4 };
        },
        effectUiSummary: function(sk, e) {
            const b = e.audInnerBonus || 0;
            return `Current: +${b} base Aud, +${2 * b} current Aud`;
        }
    },
    {
        version:0,
        key: "adaptation",
        name: "Adaptation",
        category: "combat",
        slotCategory: "defense",
        initialExpToLevel: 3,
        initialTalentToLevel: 2,
        flavorText: '"We are what we repeatedly do. Excellence, then, is not an act, but a habit." - Aristotle',
        shortDescription: "Body and mind adjust to milestones: +1 Con each time this skill levels.",
        rewardText: function() {
            return "Reward: +1 Confidence per skill level.";
        },
        triggerText: "Trigger: each time your character level increases.",
        getEffect: function(sk) {
            return { bonusCon: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.bonusCon || 0} Con from Adaptation level-ups`;
        }
    },
    {
        version:0,
        key: "savageLessons",
        name: "Savage Lessons",
        category: "combat",
        slotCategory: "offense",
        initialExpToLevel: 3,
        initialTalentToLevel: 2,
        flavorText: '"Experience is a hard teacher because she gives the test first, the lesson afterward." — Vernon Law',
        shortDescription: "Learn through the fight: +1 Bru each time this skill levels.",
        rewardText: function() {
            return "Reward: +1 Brutality per skill level.";
        },
        triggerText: "Trigger: each time your character level increases.",
        getEffect: function(sk) {
            return { bonusStr: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.bonusStr || 0} Bru from Savage Lessons level-ups`;
        }
    },
    {
        version:0,
        key: "echoChamber",
        name: "Echo Chamber",
        category: "combat",
        slotCategory: "utility",
        initialExpToLevel: 20,
        initialTalentToLevel: 20,
        shortDescription: "Increase the exp gain of other skills.",
        flavorText: "\"The more we agree, the louder I get.\"",
        rewardText: function() {
            return "Reward: +2% additive skill exp for every other skill per Echo Chamber skill level.";
        },
        triggerText: "Trigger: each time a Combat skill other than this one gains a skill level.",
        getEffect: function(sk) {
            return { otherSkillExpMultiplier: 1 + 0.02 * (sk.level || 0) };
        },
        effectUiSummary: function(sk, e) {
            return `Current: ×${roundNearestDecimals(e.otherSkillExpMultiplier || 1, 4)} other skills' skill exp`;
        }
    },
    {
        version:0,
        key: "mainCharacter",
        name: "Main Character",
        category: "combat",
        slotCategory: "offense",
        initialExpToLevel: 20,
        initialTalentToLevel: 20,
        shortDescription: "+0.1 ego damage per level per visible enemy on the battlefield.",
        flavorText: "\"If they're watching, they're supporting cast.\"",
        rewardText: function(sk) {
            return `Reward: +0.1 per level base ego damage (before Brutality multiplier) per visible intruder on the battlefield.`;
        },
        triggerText: "Trigger: 1 skill exp per second while 4 or more intruders are visible.",
        getEffect: function(sk) {
            return { flatDamagePerEnemy: (sk.level || 0) * 0.1 };
        },
        effectUiSummary: function(sk, e) {
            const vis = (typeof engine !== "undefined" && engine.countVisibleIntruders && data.battle && data.battle.enemies)
                ? engine.countVisibleIntruders()
                : 0;
            const total = (e.flatDamagePerEnemy || 0) * vis;
            const noun = vis === 1 ? "enemy" : "enemies";
            return `Current: +${roundNearestDecimals(total, 2)} damage from ${vis} visible ${noun}`;
        }
    },
    {
        version:0,
        key: "grudge",
        name: "Grudge",
        category: "combat",
        slotCategory: "offense",
        initialExpToLevel: 5,
        initialTalentToLevel: 5,
        flavorText: '"A wrong unavenged is a wound unhealed." — Italian Proverb',
        shortDescription: "+3% ego damage per skill level vs enemies that have attacked you.",
        rewardText: function(sk) {
            return `Reward: +3% ego damage per skill level against intruders that have attacked you.`;
        },
        triggerText: "Trigger: each attack against an intruder that has attacked you.",
        getEffect: function(sk) {
            return { damageMultPerLevel: (sk.level || 0) * 0.03 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals((e.damageMultPerLevel || 0) * 100, 1)}% dmg vs attackers`;
        }
    },
    {
        version:0,
        key: "insultFatigue",
        name: "Insult Fatigue",
        category: "combat",
        slotCategory: "defense",
        initialExpToLevel: 15,
        initialTalentToLevel: 15,
        flavorText: '"He who throws dirt always loses ground." — Mexican Proverb',
        shortDescription: "Enemies deal less flat damage after hitting you; stacks per hit, per enemy.",
        rewardText: function(sk) {
            return `Reward: each time an enemy damages you, later attacks deal 0.1 flat less damage per skill level per stack (stacks per damaging hit, per enemy). The reduction is capped at half of that attack's damage.`;
        },
        triggerText: "Trigger: each time an intruder attacks you for the second time or later.",
        getEffect: function(sk) {
            return { flatReductionPerStack: (sk.level || 0) * 0.1 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: −${roundNearestDecimals(e.flatReductionPerStack || 0, 2)} flat dmg per stack, capped at 50% of the attack`;
        }
    },
    {
        version:0,
        key: "brokenRecord",
        name: "Broken Record",
        category: "combat",
        slotCategory: "defense",
        initialExpToLevel: 10,
        initialTalentToLevel: 15,
        flavorText: "\"Repetition is just free desensitization therapy.\"",
        shortDescription: "Gain Desensitized stacks when enemies attack.",
        rewardText: function(sk) {
            return `Reward: each enemy attack adds a Desensitized stack lasting 0.25s per skill level.`;
        },
        triggerText: "Trigger: each time an intruder attacks you (no damage required).",
        getEffect: function(sk) {
            return { desensitizedMsPerLevel: 1000 + (sk.level || 0) * 250 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +1 Desensitized stack (${intToString(e.desensitizedMsPerLevel || 0, 2)} ms) per enemy attack`;
        }
    },
    {
        version:0,
        key: "validation",
        name: "Validation",
        category: "combat",
        slotCategory: "defense",
        initialExpToLevel: 10,
        initialTalentToLevel: 15,
        flavorText: '"The deepest principle in human nature is the craving to be appreciated." — William James',
        shortDescription: "+1 max Audacity per kill (up to 4 per skill level). When max increases from this, gain +Validation level current Audacity.",
        rewardText: function(sk) {
            const lv = (sk && sk.level) || 0;
            const curText = lv > 0 ? String(lv) : "Validation level";
            return `Reward: +1 max Audacity per intruder removal, up to 4 per skill level. When that max increases, also gain +${curText} current Audacity.`;
        },
        triggerText: "Trigger: each intruder removal.",
        getEffect: function(sk) {
            const lv = sk.level || 0;
            return { audCap: lv * 4, currentAudOnMaxIncrease: lv };
        },
        effectUiSummary: function(sk, e) {
            const cap = e.audCap || 0;
            const kills = (data.battle && data.battle.enemiesKilled) || 0;
            const n = Math.min(kills, cap);
            const curGain = e.currentAudOnMaxIncrease || 0;
            return `Current: +${n} max Aud from kills (cap ${cap}). +${curGain} current Aud when max increases from a kill`;
        }
    },
    {
        version:0,
        key: "imposterSyndrome",
        name: "Imposter Syndrome",
        category: "combat",
        slotCategory: "offense",
        initialExpToLevel: 5,
        flavorText: "\"I don't belong here. That's what makes me dangerous.\"",
        shortDescription: "Gain Fury stacks when you take damage.",
        rewardText: function(sk) {
            return `Reward: each time you take damage, gain 1 Fury stack per skill level.`;
        },
        triggerText: "Trigger: each time you take damage.",
        getEffect: function(sk) {
            return { furyPerLevel: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.furyPerLevel || 0} Fury each time you take damage`;
        }
    },
    {
        version:0,
        key: "narcissism",
        name: "Narcissism",
        category: "combat",
        slotCategory: "defense",
        initialExpToLevel: 25,
        initialTalentToLevel: 15,
        flavorText: '"I celebrate myself, and sing myself." — Walt Whitman',
        shortDescription: "Extra current Audacity when max Audacity increases, including from Confidence.",
        rewardText: function(sk) {
            return `Reward: +3% extra current Audacity when max Audacity increases, including from Confidence. Does not apply to regeneration or other healing.`;
        },
        triggerText: "Trigger: When max Audacity increases, including from Confidence.",
        getEffect: function(sk) {
            return { audGainMultPerLevel: (sk.level || 0) * 0.03 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals((e.audGainMultPerLevel || 0) * 100, 1)}% extra current Aud when max Aud increases (including from Con)`;
        }
    },
    {
        version:0,
        key: "windfallSwagger",
        name: "Windfall Swagger",
        category: "combat",
        slotCategory: "defense",
        initialExpToLevel: 15,
        flavorText: '"Audacity, more audacity, and always audacity!" — Georges Danton',
        shortDescription: "+1 Confidence per skill level.",
        rewardText: function() {
            return "Reward: +1 Confidence per skill level.";
        },
        triggerText: "Trigger: log10(coins gained) on each intruder removal.",
        getEffect: function(sk) {
            return { bonusCon: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.bonusCon || 0} Con from skill level`;
        }
    },
    {
        version:0,
        key: "shockValue",
        name: "Shock Value",
        category: "combat",
        slotCategory: "offense",
        initialExpToLevel: 25,
        initialTalentToLevel: 20,
        flavorText: "\"If nobody flinched, I underperformed.\"",
        shortDescription: "+1 Brutality per skill level.",
        rewardText: function() {
            return "Reward: +1 Brutality per skill level.";
        },
        triggerText: "Trigger: max(log10(ego damage dealt), 1) on each attack.",
        getEffect: function(sk) {
            return { bonusStr: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.bonusStr || 0} Bru from skill level`;
        }
    },
    {
        version:0,
        key: "bitterRivalry",
        name: "Bitter Rivalry",
        category: "combat",
        slotCategory: "offense",
        initialExpToLevel: 10,
        initialTalentToLevel: 10,
        flavorText: "\"The longer you stay in my face, the more personal this becomes.\"",
        shortDescription: "Deal more damage to enemies the longer they stay in slap range.",
        rewardText: function(sk) {
            return `Reward: +0.5% ego damage per level to an enemy for each second they have been in slap range.`;
        },
        triggerText: "Trigger: 1 skill exp per second an enemy spends in slap range.",
        getEffect: function(sk) {
            return { damagePercentPerSecond: (sk.level || 0) * 0.5 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${round2(e.damagePercentPerSecond || 0)}% ego damage per second an enemy is in slap range`;
        }
    },
    {
        version:0,
        key: "seethe",
        name: "Seethe",
        category: "combat",
        slotCategory: "offense",
        initialExpToLevel: 10,
        initialTalentToLevel: 5,
        flavorText: '"The silence between insults is where the rage brews." — Modern Proverb',
        shortDescription: "Gain Fury stacks while no enemies are in melee range.",
        rewardText: function(sk) {
            return `Reward: +1 Fury stack per skill level every 1s while no intruders are in slap range.`;
        },
        triggerText: "Trigger: passive every 1s while no intruders are in slap range.",
        getEffect: function(sk) {
            return { furyPerLevel: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.furyPerLevel || 0} Fury every 1s with no enemies in melee`;
        }
    },
    {
        version:0,
        key: "retailTherapy",
        name: "Retail Therapy",
        category: "combat",
        slotCategory: "defense",
        initialExpToLevel: 15,
        flavorText: '"Anyone who lives within their means suffers from a lack of imagination." — Oscar Wilde',
        shortDescription: "Desensitized stacks when gaining coins.",
        rewardText: function(sk) {
            return `Reward: +1 Desensitized stack lasting 2 + 0.5s per skill level when you gain coins.`;
        },
        triggerText: "Trigger: log10(coins gained) on each coin gain from intruder removal.",
        getEffect: function(sk) {
            return { desensitizedMsPerLevel: 2000 + (sk.level || 0) * 500 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +1 Desensitized (${intToString(e.desensitizedMsPerLevel || 0, 2)} ms) per coin gain`;
        }
    },
    {
        version:0,
        key: "levelHeaded",
        name: "Level Headed",
        category: "combat",
        slotCategory: "defense",
        initialExpToLevel: 10,
        flavorText: '"Growth is just another word for getting used to it." — English Proverb',
        shortDescription: "Desensitized stacks when your character levels up.",
        rewardText: function(sk) {
            return `Reward: 5 Desensitized stacks lasting 2 + 0.5s per skill level each when your character level increases.`;
        },
        triggerText: "Trigger: sqrt(character exp threshold for that level) each time your character level increases.",
        getEffect: function(sk) {
            return { desensitizedMsPerLevel: 2000 + (sk.level || 0) * 500 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: 5 Desensitized stacks lasting ${round2((e.desensitizedMsPerLevel || 0) / 1000)}s each per character level-up`;
        }
    },
    {
        version:0,
        key: "bloodRush",
        name: "Blood Rush",
        category: "combat",
        slotCategory: "offense",
        initialExpToLevel: 5,
        flavorText: '"There is a kind of sweet madness in the pursuit of victory." — Pindar',
        shortDescription: "Gain Malice when defeating intruders while above 50% Aud.",
        rewardText: function(sk) {
            return `Reward: +0.5 Malice + 0.25 per skill level when defeating an intruder while above 50% Aud.`;
        },
        triggerText: "Trigger: each intruder removal.",
        getEffect: function(sk) {
            return { malicePerLevel: 0.5 + (sk.level || 0) * 0.25 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${round2(e.malicePerLevel || 0)} Malice per kill above half Aud`;
        }
    },
    {
        version:0,
        key: "temper",
        name: "Temper",
        category: "combat",
        slotCategory: "offense",
        initialExpToLevel: 5,
        initialTalentToLevel: 5,
        flavorText: '"You wouldn\'t like me when I\'m comfortable."',
        shortDescription: "Malice when taking damage above half Aud.",
        rewardText: function(sk) {
            return `Reward: +0.5 Malice + 0.25 per skill level when taking damage while above 50% Aud.`;
        },
        triggerText: "Trigger: each damaging intruder attack while above 50% Aud.",
        getEffect: function(sk) {
            return { malicePerLevel: 0.5 + (sk.level || 0) * 0.25 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${round2(e.malicePerLevel || 0)} Malice per hit above half Aud`;
        }
    },
    {
        version:0,
        key: "sadism",
        name: "Sadism",
        category: "combat",
        slotCategory: "offense",
        initialExpToLevel: 15,
        flavorText: '"Excess on occasion is exhilarating." — W. Somerset Maugham',
        shortDescription: "Malice when killing enemies; exp from overkill.",
        rewardText: function(sk) {
            return `Reward: +0.4 Malice + 0.2 per skill level when defeating an intruder.`;
        },
        triggerText: "Trigger: log2(overkill damage) on each intruder removal.",
        getEffect: function(sk) {
            return { malicePerLevel: 0.4 + (sk.level || 0) * 0.2 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${round2(e.malicePerLevel || 0)} Malice per kill`;
        }
    },
    {
        version:0,
        key: "recognition",
        name: "Recognition",
        category: "combat",
        slotCategory: "defense",
        initialExpToLevel: 10,
        initialTalentToLevel: 20,
        flavorText: "\"Progress only counts if someone could have seen it.\"",
        shortDescription: "Clout when Recognition levels up.",
        rewardText: function(sk) {
            return `Reward: +3 Clout per Recognition level when Recognition levels up.`;
        },
        triggerText: "Trigger: When any other skill gains a level.",
        getEffect: function(sk) {
            return { cloutPerLevel: (sk.level || 0) * 3 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${round2(e.cloutPerLevel || 0)} Clout when Recognition levels up`;
        }
    },
    {
        version:0,
        key: "brandRecognition",
        name: "Brand Recognition",
        category: "combat",
        slotCategory: "defense",
        initialExpToLevel: 10,
        flavorText: "\"Peak confidence is when I stop introducing myself.\"",
        shortDescription: "Clout while at max Audacity.",
        rewardText: function(sk) {
            return `Reward: +0.5 Clout per skill level every 1s while at max Aud.`;
        },
        triggerText: "Trigger: 1 skill exp per second while at max Aud.",
        getEffect: function(sk) {
            return { cloutPerSec: (sk.level || 0) * 0.5 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${round2(e.cloutPerSec || 0)} Clout/s at max Aud`;
        }
    },
    {
        version:0,
        key: "applyTearDrops",
        name: "Apply Tear Drops",
        category: "combat",
        slotCategory: "defense",
        initialExpToLevel: 20,
        initialTalentToLevel: 20,
        flavorText: '"Tears are the silent language of manipulation." — French Maxim',
        shortDescription: "Fake Tears while advancing on the battlefield.",
        rewardText: function(sk) {
            return `Reward: +1.5s + 0.2s per skill level Fake Tears every 1 second while moving.`;
        },
        triggerText: "Trigger: 1 skill exp every 1 second while moving forward on the battlefield.",
        getEffect: function(sk) {
            return { fakeTearsMs: 1500 + (sk.level || 0) * 200 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${intToString(e.fakeTearsMs || 0, 2)} ms Fake Tears per 1s while moving`;
        }
    },
    {
        version:0,
        key: "numbingCrowds",
        name: "Numbing Crowds",
        category: "combat",
        slotCategory: "defense",
        initialExpToLevel: 5,
        initialTalentToLevel: 5,
        flavorText: "\"A crowd is the perfect excuse to fall apart strategically.\"",
        shortDescription: "Fake Tears when surrounded in melee.",
        rewardText: function(sk) {
            return `Reward: +0.5s per skill level Fake Tears each second while 3+ intruders are in slap range.`;
        },
        triggerText: "Trigger: 1 skill exp per second while 3+ intruders are in slap range.",
        getEffect: function(sk) {
            return { fakeTearsMsPerLevel: (sk.level || 0) * 500 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${intToString(e.fakeTearsMsPerLevel || 0, 2)} ms Fake Tears/s with 3+ in melee`;
        }
    },
    {
        version:0,
        key: "peerPressure",
        name: "Peer Pressure",
        category: "combat",
        slotCategory: "offense",
        initialExpToLevel: 5,
        initialTalentToLevel: 5,
        flavorText: "\"Everybody's doing it. That's the whole point.\"",
        shortDescription: "Extra base ego damage per intruder in slap range.",
        rewardText: function(sk) {
            return `Reward: +0.2 base ego damage per skill level per intruder in slap range (before Brutality multiplier).`;
        },
        triggerText: "Trigger: 1 skill exp per second while any intruder is in slap range.",
        getEffect: function(sk) {
            return { flatDamagePerInRange: (sk.level || 0) * 0.2 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals(e.flatDamagePerInRange || 0, 2)} ego dmg per slap-range enemy`;
        }
    },
    {
        version:0,
        key: "highHorse",
        name: "High Horse",
        category: "combat",
        slotCategory: "offense",
        initialExpToLevel: 10,
        flavorText: "\"It's not arrogance if you're still winning.\"",
        shortDescription: "More ego damage while above half Aud.",
        rewardText: function(sk) {
            return `Reward: +4% ego damage per skill level while above 50% Aud.`;
        },
        triggerText: "Trigger: each attack while above 50% Aud.",
        getEffect: function(sk) {
            return { damageBonusFraction: (sk.level || 0) * 0.04};
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals((e.damageBonusFraction || 0) * 100, 1)}% dmg above half Aud`;
        }
    },
    {
        version:0,
        key: "underdog",
        name: "Underdog",
        category: "combat",
        slotCategory: "offense",
        initialExpToLevel: 5,
        flavorText: "\"They love a comeback almost as much as I need one.\"",
        shortDescription: "More ego damage while at or below half Aud.",
        rewardText: function(sk) {
            return `Reward: +6% ego damage per skill level while at or below 50% Aud.`;
        },
        triggerText: "Trigger: each attack while at or below 50% Aud.",
        getEffect: function(sk) {
            return { damageBonusFraction: (sk.level || 0) * 0.06 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals((e.damageBonusFraction || 0) * 100, 1)}% dmg at or below half Aud`;
        }
    },
    {
        version:0,
        key: "repeatOffender",
        name: "Repeat Offender",
        category: "combat",
        slotCategory: "offense",
        initialExpToLevel: 5,
        initialTalentToLevel: 5,
        flavorText: "\"I don't make new points. I make the same point louder.\"",
        shortDescription: "Extra flat ego damage per previous hit on the same intruder.",
        rewardText: function(sk) {
            return `Reward: +0.4 flat ego damage per skill level per previous hit on that same intruder.`;
        },
        triggerText: "Trigger: hitting an intruder you've hit before.",
        getEffect: function(sk) {
            return { flatDamagePerPriorHit: (sk.level || 0) * 0.4 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals(e.flatDamagePerPriorHit || 0, 2)} dmg per prior hit on target`;
        }
    },
    {
        version:0,
        key: "crowdWork",
        name: "Crowd Work",
        category: "combat",
        slotCategory: "offense",
        initialExpToLevel: 10,
        initialTalentToLevel: 5,
        flavorText: "\"A packed house is just a bigger mirror.\"",
        shortDescription: "More ego damage % while many intruders are visible.",
        rewardText: function(sk) {
            return `Reward: +4% ego damage per skill level while 4 or more intruders are visible.`;
        },
        triggerText: "Trigger: 1 skill exp per second while 4 or more intruders are visible.",
        getEffect: function(sk) {
            return { damageBonusFraction: (sk.level || 0) * 0.04 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals((e.damageBonusFraction || 0) * 100, 1)}% dmg with 4+ visible`;
        }
    },
    {
        version:0,
        key: "walkingItOff",
        name: "Walking It Off",
        category: "combat",
        slotCategory: "defense",
        initialExpToLevel: 15,
        initialTalentToLevel: 10,
        flavorText: "\"Keep moving and the sting can't catch up.\"",
        shortDescription: "Restore Aud while advancing on the battlefield.",
        rewardText: function(sk) {
            return `Reward: restore +0.16 Aud per skill level per second while moving forward.`;
        },
        triggerText: "Trigger: 1 skill exp per second while moving forward on the battlefield.",
        getEffect: function(sk) {
            return { audPerSec: (sk.level || 0) * 0.16 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals(e.audPerSec || 0, 2).toFixed(2)} Aud/s while moving`;
        }
    },
    {
        version:0,
        key: "publicApology",
        name: "Public Apology",
        category: "combat",
        slotCategory: "defense",
        initialExpToLevel: 5,
        initialTalentToLevel: 15,
        flavorText: "\"I'm sorry you made me do that.\"",
        shortDescription: "Restore Aud on each intruder removal.",
        rewardText: function(sk) {
            return `Reward: restore +0.5 Aud per skill level on each intruder removal.`;
        },
        triggerText: "Trigger: each intruder removal.",
        getEffect: function(sk) {
            return { audPerKill: (sk.level || 0) * 0.5 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals(e.audPerKill || 0, 2)} Aud per kill`;
        }
    },
    {
        version:0,
        key: "thickSkin",
        name: "Thick Skin",
        category: "combat",
        slotCategory: "defense",
        initialExpToLevel: 5,
        flavorText: "\"Your insult arrives pre-discounted.\"",
        shortDescription: "Flat incoming ego damage reduction.",
        rewardText: function(sk) {
            return `Reward: +0.2 armor (flat damage reduction) per skill level.`;
        },
        triggerText: "Trigger: each time an intruder damages you.",
        getEffect: function(sk) {
            return { armorFlat: (sk.level || 0) * 0.2 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: ${roundNearestDecimals(e.armorFlat || 0, 2)} armor flat`;
        }
    },
    {
        version:0,
        key: "secondWind",
        name: "Second Wind",
        category: "combat",
        slotCategory: "defense",
        initialExpToLevel: 10,
        flavorText: "\"I'm not done. I'm just catching my breath in public.\"",
        shortDescription: "Restore Aud once per clone when dropping very low.",
        rewardText: function(sk) {
            return `Reward: restore +10 Aud per skill level when Aud is below 20% (once per clone run).`;
        },
        triggerText: "Trigger: each time you take damage.",
        getEffect: function(sk) {
            return { restoreAud: (sk.level || 0) * 10 };
        },
        effectUiSummary: function(sk, e) {
            const used = !!(data.battle && data.battle.secondWindRestoreUsed);
            return `Current: +${roundNearestDecimals(e.restoreAud || 0, 2)} Aud below 20% (${used ? "used this clone" : "ready"})`;
        }
    },
    {
        version:0,
        key: "stiffUpperLip",
        name: "Stiff Upper Lip",
        category: "combat",
        slotCategory: "defense",
        initialExpToLevel: 10,
        initialTalentToLevel: 5,
        flavorText: "\"Keep smiling. They hate that more than the slap.\"",
        shortDescription: "Reduces incoming ego damage while hurt.",
        rewardText: function() {
            return "Reward: while at or below 50% Aud, multiply incoming slap damage by 1 / (1 + 0.04 × Stiff Upper Lip skill level).";
        },
        triggerText: "Trigger: each time you take damage.",
        getEffect: function(sk) {
            const lv = sk.level || 0;
            return { incomingDamageMultiplier: 1 / (1 + lv * 0.04) };
        },
        effectUiSummary: function(sk, e) {
            return `Current: incoming ×${roundNearestDecimals(e.incomingDamageMultiplier || 1, 3)} at or below half Aud`;
        }
    },
    {
        version:0,
        key: "paddingResume",
        name: "Padding the Resume",
        category: "combat",
        slotCategory: "defense",
        initialExpToLevel: 3,
        initialTalentToLevel: 2,
        flavorText: "\"Every level is another bullet point. Every bullet point is another reason I'm fine.\"",
        shortDescription: "Bonus max Aud from character level.",
        rewardText: function(sk) {
            return `Reward: +2 max Aud per character level per skill level.`;
        },
        triggerText: "Trigger: each time your character level increases.",
        getEffect: function(sk) {
            const charLv = (data.battle && data.battle.levelState && data.battle.levelState.level) || 0;
            const perChar = (sk.level || 0) * 2;
            return { audPerCharLevel: perChar, audBonus: perChar * charLv };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.audBonus || 0} max Aud (${e.audPerCharLevel || 0} per character level)`;
        }
    },
    {
        version:0,
        key: "experienceHog",
        name: "Experience Hog",
        category: "combat",
        slotCategory: "utility",
        initialExpToLevel: 8,
        initialTalentToLevel: 5,
        flavorText: "\"If there's a lesson here, I'm taking the whole plate.\"",
        shortDescription: "Boosts character leveling exp.",
        rewardText: function() {
            return "Reward: +3% character leveling exp per skill level (additive).";
        },
        triggerText: "Trigger: each intruder removal.",
        getEffect: function(sk) {
            return { characterExpAdd: 0.03 * (sk.level || 0) };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals((e.characterExpAdd || 0) * 100, 1)}% char exp`;
        }
    },
    {
        version:0,
        key: "studyGroup",
        name: "Study Group",
        category: "combat",
        slotCategory: "utility",
        initialExpToLevel: 3,
        initialTalentToLevel: 2,
        flavorText: "\"Your breakthrough is my group project.\"",
        shortDescription: "Increase the exp gain of other skills.",
        rewardText: function(sk) {
            return `Reward: +3% additive skill exp for every other skill per Study Group skill level.`;
        },
        triggerText: "Trigger: each time your character level increases.",
        getEffect: function(sk) {
            return { otherSkillExpMultiplier: 1 + 0.03 * (sk.level || 0) };
        },
        effectUiSummary: function(sk, e) {
            return `Current: ×${roundNearestDecimals(e.otherSkillExpMultiplier || 1, 4)} other skills' skill exp`;
        }
    },
    {
        version:0,
        key: "slowBurn",
        name: "Slow Burn",
        category: "combat",
        slotCategory: "offense",
        initialExpToLevel: 5,
        flavorText: "\"Don't rush the resentment. Let it marinate.\"",
        shortDescription: "Gain Fury stacks for each enemy in slap range.",
        rewardText: function(sk) {
            return `Reward: +1 Fury stack per skill level per intruder in slap range every 1s.`;
        },
        triggerText: "Trigger: 1 skill exp per second while any intruder is in slap range.",
        getEffect: function(sk) {
            return { furyPerLevel: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.furyPerLevel || 0} Fury/s per enemy in slap range`;
        }
    },
    {
        version:0,
        key: "thinIce",
        name: "Thin Ice",
        category: "combat",
        slotCategory: "offense",
        initialExpToLevel: 10,
        flavorText: "\"One more comment and we all go through.\"",
        shortDescription: "Gain Fury stacks when you take damage.",
        rewardText: function(sk) {
            return `Reward: +1 Fury stack per skill level each time you take damage.`;
        },
        triggerText: "Trigger: each time you take damage.",
        getEffect: function(sk) {
            return { furyPerLevel: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.furyPerLevel || 0} Fury each time you take damage`;
        }
    },
    {
        version:0,
        key: "stoic",
        name: "Stoic",
        category: "combat",
        slotCategory: "defense",
        initialExpToLevel: 8,
        flavorText: "\"Nothing happened, and I have decided that is the correct amount of feeling.\"",
        shortDescription: "Desensitized stacks while at max Aud.",
        rewardText: function(sk) {
            return `Reward: +1 Desensitized stack lasting 2 + 0.5s per skill level every 1s while at max Aud.`;
        },
        triggerText: "Trigger: 1 skill exp per second while at max Aud.",
        getEffect: function(sk) {
            return { desensitizedMsPerLevel: 2000 + (sk.level || 0) * 500 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +1 Desensitized (${intToString(e.desensitizedMsPerLevel || 0, 2)} ms) per second at max Aud`;
        }
    },
    {
        version:0,
        key: "hotTake",
        name: "Hot Take",
        category: "combat",
        slotCategory: "offense",
        initialExpToLevel: 10,
        flavorText: "\"That was uncalled for, and I will be discussing it at length.\"",
        shortDescription: "Outrage when taking damage.",
        rewardText: function(sk) {
            return `Reward: +0.05s per skill level Outrage each time you take damage.`;
        },
        triggerText: "Trigger: each damaging intruder attack.",
        getEffect: function(sk) {
            return { outrageMsPerLevel: (sk.level || 0) * 50 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${intToString(e.outrageMsPerLevel || 0, 2)} ms Outrage per hit taken`;
        }
    },
    {
        version:0,
        key: "righteousRant",
        name: "Righteous Rant",
        category: "combat",
        slotCategory: "offense",
        initialExpToLevel: 15,
        initialTalentToLevel: 10,
        flavorText: "\"The speech writes itself if you just keep walking toward them.\"",
        shortDescription: "Outrage while advancing on the battlefield.",
        rewardText: function(sk) {
            return `Reward: +0.2s + 0.05s per skill level Outrage every 1s while moving forward.`;
        },
        triggerText: "Trigger: 1 skill exp per 1s while moving forward on the battlefield.",
        getEffect: function(sk) {
            return { outrageMs: 200 + (sk.level || 0) * 50 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${intToString(e.outrageMs || 0, 2)} ms Outrage per 1s while moving`;
        }
    },
    {
        version:0,
        key: "heckled",
        name: "Heckled",
        category: "combat",
        slotCategory: "offense",
        initialExpToLevel: 5,
        initialTalentToLevel: 5,
        flavorText: "\"Say that again. Closer. I dare you.\"",
        shortDescription: "Outrage when surrounded in melee.",
        rewardText: function(sk) {
            return `Reward: +0.1s per skill level Outrage every 1s while 3+ intruders are in slap range.`;
        },
        triggerText: "Trigger: 1 skill exp per second while 3+ intruders are in slap range.",
        getEffect: function(sk) {
            return { outrageMsPerLevel: (sk.level || 0) * 100 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${intToString(e.outrageMsPerLevel || 0, 2)} ms Outrage/s with 3+ in melee`;
        }
    },
    {
        version:0,
        key: "simmer",
        name: "Simmer",
        category: "combat",
        slotCategory: "offense",
        initialExpToLevel: 10,
        initialTalentToLevel: 5,
        flavorText: "\"I'm fine. That's what makes it worse.\"",
        shortDescription: "Malice while at max Aud.",
        rewardText: function(sk) {
            return `Reward: +0.5 Malice + 0.25 per skill level every 2s while at max Aud.`;
        },
        triggerText: "Trigger: 1 skill exp per 2s while at max Aud.",
        getEffect: function(sk) {
            return { malicePerLevel: 0.5 + (sk.level || 0) * 0.25 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${round2(e.malicePerLevel || 0)} Malice every 2s at max Aud`;
        }
    },
    {
        version:0,
        key: "sobStory",
        name: "Sob Story",
        category: "combat",
        slotCategory: "defense",
        initialExpToLevel: 5,
        flavorText: "\"You wouldn't hit me if you knew what I've been through. Anyway.\"",
        shortDescription: "Fake Tears when taking damage.",
        rewardText: function(sk) {
            return `Reward: +0.4s per skill level Fake Tears each time you take damage.`;
        },
        triggerText: "Trigger: each damaging intruder attack.",
        getEffect: function(sk) {
            return { fakeTearsMsPerLevel: (sk.level || 0) * 400 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${intToString(e.fakeTearsMsPerLevel || 0, 2)} ms Fake Tears per hit taken`;
        }
    },
    {
        version:0,
        key: "stageSob",
        name: "Stage Sob",
        category: "combat",
        slotCategory: "defense",
        initialExpToLevel: 5,
        flavorText: "\"If there's an audience, the tears have somewhere to land.\"",
        shortDescription: "Fake Tears while many intruders are watching.",
        rewardText: function(sk) {
            return `Reward: +0.4s per skill level Fake Tears every 1s while 4+ intruders are visible.`;
        },
        triggerText: "Trigger: 1 skill exp per second while 4 or more intruders are visible.",
        getEffect: function(sk) {
            return { fakeTearsMsPerLevel: (sk.level || 0) * 400 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${intToString(e.fakeTearsMsPerLevel || 0, 2)} ms Fake Tears/s with 4+ visible`;
        }
    },
    {
        version:0,
        key: "socialArmor",
        name: "Social Armor",
        category: "combat",
        slotCategory: "defense",
        initialExpToLevel: 5,
        flavorText: "\"A crowd is just a very clingy shield.\"",
        shortDescription: "Clout when surrounded in melee.",
        rewardText: function(sk) {
            return `Reward: +1 Clout per skill level every 1s while 3+ intruders are in slap range.`;
        },
        triggerText: "Trigger: 1 skill exp per second while 3+ intruders are in slap range.",
        getEffect: function(sk) {
            return { cloutPerLevel: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.cloutPerLevel || 0} Clout/s with 3+ in melee`;
        }
    },
    {
        version:0,
        key: "borrowedGlory",
        name: "Borrowed Glory",
        category: "combat",
        slotCategory: "defense",
        initialExpToLevel: 10,
        flavorText: "\"Your growth is my glow-up.\"",
        shortDescription: "Clout when Confidence increases.",
        rewardText: function(sk) {
            return `Reward: +5 Clout per skill level whenever Confidence increases.`;
        },
        triggerText: "Trigger: When max Audacity increases, including from Confidence.",
        getEffect: function(sk) {
            return { cloutPerLevel: (sk.level || 0) * 5 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.cloutPerLevel || 0} Clout when Confidence increases`;
        }
    },
    {
        version:0,
        key: "marathonEgo",
        name: "Marathon Ego",
        category: "combat",
        slotCategory: "defense",
        initialExpToLevel: 10,
        initialTalentToLevel: 5,
        flavorText: "\"I don't peak early. I peak constantly, then more.\"",
        shortDescription: "More ego damage the longer the clone fight lasts.",
        rewardText: function(sk) {
            return `Reward: +0.6% ego damage, plus +0.2% per skill level, per 10 seconds the clone has been fighting.`;
        },
        triggerText: "Trigger: 1 skill exp per 5 seconds the clone is alive in combat.",
        getEffect: function(sk) {
            return { damagePercentPerTenSec: 0.6 + (sk.level || 0) * 0.2 };
        },
        effectUiSummary: function(sk, e) {
            const tens = Math.floor(((data.battle && data.battle.cloneAliveMs) || 0) / 10000);
            const pct = (e.damagePercentPerTenSec || 0) * tens;
            return `Current: +${round2(e.damagePercentPerTenSec || 0)}% dmg per 10s (${round2(pct)}% now)`;
        }
    },
    {
        version:0,
        key: "closingArgument",
        name: "Closing Argument",
        category: "combat",
        slotCategory: "offense",
        initialExpToLevel: 5,
        initialTalentToLevel: 3,
        flavorText: "\"Let the record show they were already losing.\"",
        shortDescription: "More ego damage to an intruder you have already attacked.",
        rewardText: function(sk) {
            return `Reward: +6% ego damage per skill level vs an intruder you have already attacked.`;
        },
        triggerText: "Trigger: each attack against an intruder you have already attacked.",
        getEffect: function(sk) {
            return { damageBonusFraction: (sk.level || 0) * 0.06 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals((e.damageBonusFraction || 0) * 100, 1)}% dmg vs already attacked`;
        }
    },
    //scold skills
    {
        version:0,
        key: "alacrity",
        name: "Alacrity",
        category: "class",
        classKey: "scold",
        slotCategory: "offense",
        initialExpToLevel: 5,
        flavorText: "\"Festina lente.\" (Make haste slowly.) - attributed to Augustus",
        shortDescription: "Quick hands. Reduces slap cooldown.",
        maxLevel: 1000,
        rewardText: function(sk) {
            const cd = gameData.battle.cooldowns;
            const cap = sk.maxLevel !== undefined ? sk.maxLevel : 1000;
            return `Reward: −0.1 ms effective slap cooldown per skill level (floor ${cd.slapFloorMs} ms; Alacrity skill cap ${cap}).`;
        },
        triggerText: "Trigger: each attack.",
        getEffect: function(sk) {
            const cap = sk.maxLevel !== undefined ? sk.maxLevel : 1000;
            return { effectiveLevel: Math.min(sk.level || 0, cap) };
        },
        effectUiSummary: function(sk, e, cd) {
            const lv = e.effectiveLevel || 0;
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
        flavorText: "\"All warfare is based on deception.\" - Sun Tzu",
        shortDescription: "Scold opener damage bonus on first hit per intruder.",
        rewardText: function(sk) {
            return `Reward: first hit on each intruder deals +10% damage per skill level.`;
        },
        triggerText: "Trigger: each first hit you deal to an intruder.",
        getEffect: function(sk) {
            return { firstHitDamageBonusFraction: (sk.level || 0) * 0.1 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: first hit +${roundNearestDecimals((e.firstHitDamageBonusFraction || 0) * 100, 1)}%`;
        }
    },
    {
        version:0,
        key: "exploit",
        name: "Exploit",
        category: "class",
        classKey: "scold",
        initialExpToLevel: 5,
        flavorText: "\"Opportunities multiply as they are seized.\" - Sun Tzu",
        shortDescription: "Scold sustained pressure on repeated target hits.",
        rewardText: function(sk) {
            return `Reward: consecutive hits on the same target gain +0.5 base damage per skill level per consecutive step (2nd hit +0.5, 3rd +1, ...).`;
        },
        triggerText: "Trigger: hitting an intruder you've hit before.",
        getEffect: function(sk) {
            return { flatDamagePerConsecutiveStep: (sk.level || 0) * 0.5 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${round2(e.flatDamagePerConsecutiveStep || 0)} base dmg per repeat-hit step`;
        }
    },
    {
        version:0,
        key: "precision",
        name: "Precision",
        category: "class",
        classKey: "scold",
        initialExpToLevel: 5,
        flavorText: "\"Aim small, miss small.\" - traditional marksmanship advice",
        shortDescription: "Scold class skill.",
        rewardText: function(sk) {
            return `Reward: +1% crit chance per skill level (placeholder effect for now).`;
        },
        triggerText: "Trigger: each attack.",
        getEffect: function(sk) {
            return { placeholderCritPercent: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.placeholderCritPercent || 0}% crit (placeholder)`;
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
        flavorText: "\"Crowded rooms make my hands honest.\"",
        shortDescription: "Pressure fighting. Grants Brutality with multiple enemies in slap range.",
        rewardText: function() {
            return "Reward: +1 Brutality per skill level.";
        },
        triggerText: "Trigger: each second per intruder in slap range beyond the first.",
        getEffect: function(sk) {
            return { bonusStr: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.bonusStr || 0} Bru from this skill`;
        }
    },
    {
        version:0,
        key: "preparation",
        name: "Preparation",
        category: "class",
        classKey: "condescend",
        initialExpToLevel: 5,
        flavorText: "\"By failing to prepare, you are preparing to fail.\" - Benjamin Franklin",
        shortDescription: "Faster slap recharge when not engaged.",
        rewardText: function(sk) {
            return `Reward: +2% slap attack timer recharge rate per skill level while no intruder is in slap range.`;
        },
        triggerText: "Trigger: continuously while no intruder is in slap range (per second).",
        getEffect: function(sk) {
            return { idleRechargeFraction: (sk.level || 0) * 0.02 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals((e.idleRechargeFraction || 0) * 100, 1)}% slap recharge when idle`;
        }
    },
    {
        version:0,
        key: "toughness_condescend",
        name: "Toughness",
        category: "class",
        classKey: "condescend",
        initialExpToLevel: 5,
        flavorText: "\"Difficulty strengthens the mind, as labor does the body.\" - Seneca",
        shortDescription: "Flat ego damage reduction.",
        rewardText: function(sk) {
            return `Reward: +0.25 armor (flat damage reduction) per skill level.`;
        },
        triggerText: "Trigger: each time an intruder damages you in slap.",
        getEffect: function(sk) {
            return { armorFlat: (sk.level || 0) * 0.25 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: ${roundNearestDecimals(e.armorFlat || 0, 2)} armor flat`;
        }
    },
    {
        version:0,
        key: "cleave",
        name: "Cleave",
        category: "class",
        classKey: "condescend",
        initialExpToLevel: 5,
        flavorText: "\"If you're standing next to the problem, you are the problem.\"",
        shortDescription: "Condescend power strikes splash to adjacent threats.",
        rewardText: function(sk) {
            return `Reward: power strikes deal 10% of dealt damage to adjacent-lane slap enemies and one immediate intruder behind target per skill level.`;
        },
        triggerText: "Trigger: each power strike.",
        getEffect: function(sk) {
            return { splashFraction: (sk.level || 0) * 0.1 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: splash ${roundNearestDecimals((e.splashFraction || 0) * 100, 1)}% of strike`;
        }
    },
    {
        version:0,
        key: "thorns",
        name: "Thorns",
        category: "class",
        classKey: "condescend",
        initialExpToLevel: 5,
        flavorText: "\"Whoever digs a pit will fall into it.\" - Ecclesiastes 10:8",
        shortDescription: "Condescend retaliates on slap damage taken.",
        rewardText: function(sk) {
            return `Reward: deal 1 retaliatory damage per skill level to slap attackers.`;
        },
        triggerText: "Trigger: each time an intruder damages you in slap.",
        getEffect: function(sk) {
            return { retaliationDamage: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: ${e.retaliationDamage || 0} thorns`;
        }
    },
    {
        version:0,
        key: "execute",
        name: "Execute",
        category: "class",
        classKey: "condescend",
        initialExpToLevel: 5,
        flavorText: "\"Never interrupt your intruder when he is making a mistake.\" - Napoleon Bonaparte",
        shortDescription: "Condescend deals more damage to wounded enemies.",
        rewardText: function(sk) {
            return `Reward: +5% damage per skill level to enemies below 50% Aud.`;
        },
        triggerText: "Trigger: dealing damage to enemies below 50% Aud.",
        getEffect: function(sk) {
            return { lowAudBonusFraction: (sk.level || 0) * 0.05 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals((e.lowAudBonusFraction || 0) * 100, 1)}% vs under 50% Aud`;
        }
    },
    {
        version:0,
        key: "second_wind",
        name: "Second Wind",
        category: "class",
        classKey: "condescend",
        initialExpToLevel: 5,
        flavorText: "\"Fall seven times, stand up eight.\" - Japanese proverb",
        shortDescription: "Condescend recovers Aud when blocking.",
        rewardText: function(sk) {
            return `Reward: +1 Aud per skill level each time you block.`;
        },
        triggerText: "Trigger: each successful block.",
        getEffect: function(sk) {
            return { blockHeal: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.blockHeal || 0} Aud on block`;
        }
    },
    {
        version:0,
        key: "overkill",
        name: "Overkill",
        category: "class",
        classKey: "condescend",
        initialExpToLevel: 5,
        flavorText: "\"Anything worth doing is worth overdoing.\" - Mick Jagger (attributed)",
        shortDescription: "Condescend finisher rhythm: exp from excess damage; after kills, surge the weapon bar (capped by attack floor).",
        rewardText: function() {
            const cd = gameData.battle.cooldowns;
            return `Reward: after a killing blow, advance the matching attack timer by up to (50 × skill level) ms, but never below ${cd.slapFloorMs} ms between slap attacks or ${cd.sandalFloorMs} ms between sandal attacks (excess bar boost is trimmed).`;
        },
        triggerText: "Trigger: exp = √(damage beyond Aud needed to intruder removal) on your killing blow; attack speed surge on intruder removal.",
        getEffect: function(sk) {
            return { barBonusPerLevelMs: 50 * (sk.level || 0) };
        },
        effectUiSummary: function(sk, e) {
            return `Current: up to ${e.barBonusPerLevelMs || 0} ms bar surge after kills (trimmed by cooldown floor)`;
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
        flavorText: "\"The good archer is known not by his arrows, but by his aim.\" - English proverb",
        shortDescription: "Mock sandal finishing and damage scaling.",
        rewardText: function(sk) {
            return `Reward: +1 flat sandal damage per skill level.`;
        },
        triggerText: "Trigger: remove an intruder with a sandal attack.",
        getEffect: function(sk) {
            return { sandalFlatDamage: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.sandalFlatDamage || 0} sandal damage`;
        }
    },
    {
        version:0,
        key: "impact",
        name: "Impact",
        category: "class",
        classKey: "mock",
        initialExpToLevel: 5,
        flavorText: "\"To every action there is always opposed an equal reaction.\" - Isaac Newton",
        shortDescription: "Mock sandal knockback and upper-map precision training.",
        rewardText: function(sk) {
            return `Reward: sandal hits knock enemies back by 0.1s per skill level of their movement speed.`;
        },
        triggerText: "Trigger: sandal hit on an intruder in the upper half of the battlefield.",
        getEffect: function(sk) {
            return { knockbackTravelSeconds: (sk.level || 0) * 0.1 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: knockback ${roundNearestDecimals(e.knockbackTravelSeconds || 0, 2)}× intruder speed`;
        }
    },
    {
        version:0,
        key: "marksmanship",
        name: "Marksmanship",
        category: "class",
        classKey: "mock",
        initialExpToLevel: 5,
        flavorText: "\"Practice is the best of all instructors.\" - Publilius Syrus",
        shortDescription: "Mock class skill.",
        rewardText: function(sk) {
            return `Reward: +1% sandal damage per skill level (placeholder effect for now).`;
        },
        triggerText: "Trigger: each sandal attack hit.",
        getEffect: function(sk) {
            return { placeholderSandalPct: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.placeholderSandalPct || 0}% sandal (placeholder)`;
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

    /** Multiplier applied per skill level for exp-to-next-level. */
    expToLevelScale: 1.2,
    defaultInitialExpToLevel: 5,

    getInitialExpToLevel: function(skillKey) {
        const d = skills._byKey[skillKey] || {};
        return d.initialExpToLevel !== undefined ? d.initialExpToLevel : skills.defaultInitialExpToLevel;
    },

    /** Exp required to advance from `level` to the next level. */
    getExpToLevel: function(skillKey, level) {
        return skills.getInitialExpToLevel(skillKey) * Math.pow(skills.expToLevelScale, level || 0);
    },

    createFreshSkillState: function(key) {
        const d = skills._byKey[key];
        const s = {
            key: key,
            name: d.name,
            affectedStat: d.affectedStat,
            level: 0,
            exp: 0,
            expToLevel: skills.getExpToLevel(key, 0),
            talent: 0,
            talentLevel:0,
            talentToLevel: d.initialTalentToLevel !== undefined ? d.initialTalentToLevel : 10,
            triggerCount: 0,
            tips: 0,
            grouping: 0,
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
        skill.expToLevel = skills.getExpToLevel(skill.key, 0);
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
    unlockedTalentLevelTotal: function() {
        const archives = data.progress && data.progress.base && data.progress.base.scrollArchives;
        const unlocked = archives && archives.unlockedSkills;
        if (!unlocked) {
            return 0;
        }
        const sks = (data.progress && data.progress.skills) || {};
        const keys = Object.keys(sks);
        let sum = 0;
        for (let i = 0; i < keys.length; i++) {
            if (!unlocked[keys[i]]) {
                continue;
            }
            sum += Math.floor((sks[keys[i]] && sks[keys[i]].talentLevel) || 0);
        }
        return sum;
    },
    isSkillResearchComplete: function(skillKey) {
        return skills.isSkillUnlocked(skillKey);
    },

    SLOT_COLUMNS: ["offense", "defense", "utility", "any"],
    UNEQUIP_CHARGE_MS: 60 * 60 * 1000,
    UNEQUIP_CHARGE_MS_DEBUG: 5 * 1000,

    getUnequipChargeMs: function() {
        if (typeof isDebug !== "undefined" && isDebug) {
            return skills.UNEQUIP_CHARGE_MS_DEBUG;
        }
        return skills.UNEQUIP_CHARGE_MS;
    },

    DEFAULT_UNEQUIP_CHARGES_MAX: 5,

    getDefaultSkillEquip: function() {
        const max = skills.DEFAULT_UNEQUIP_CHARGES_MAX;
        return {
            slots: {
                offense: [null],
                defense: [null],
                utility: [null],
                any: []
            },
            unequipCharges: max,
            unequipChargesMax: max,
            unequipChargeReadyAt: 0
        };
    },

    ensureSkillEquip: function() {
        if (!data.progress) {
            return null;
        }
        if (!data.progress.skillEquip) {
            data.progress.skillEquip = skills.getDefaultSkillEquip();
        }
        const eq = data.progress.skillEquip;
        if (!eq.slots) {
            eq.slots = { offense: [null], defense: [null], utility: [null], any: [] };
        }
        // Typed columns always have at least one slot; Any starts empty until shard unlocks.
        const typed = ["offense", "defense", "utility"];
        for (let i = 0; i < typed.length; i++) {
            const col = typed[i];
            if (!Array.isArray(eq.slots[col]) || eq.slots[col].length < 1) {
                eq.slots[col] = [null];
            }
        }
        if (!Array.isArray(eq.slots.any)) {
            eq.slots.any = [];
        }
        const defaultMax = skills.DEFAULT_UNEQUIP_CHARGES_MAX;
        if (eq.unequipChargesMax === undefined || eq.unequipChargesMax === null || eq.unequipChargesMax < defaultMax) {
            const prevMax = eq.unequipChargesMax || 0;
            const wasFull = eq.unequipCharges !== undefined && eq.unequipCharges !== null && eq.unequipCharges >= prevMax;
            eq.unequipChargesMax = defaultMax;
            if (wasFull || eq.unequipCharges === undefined || eq.unequipCharges === null) {
                eq.unequipCharges = defaultMax;
                eq.unequipChargeReadyAt = 0;
            }
        }
        if (eq.unequipCharges === undefined || eq.unequipCharges === null) {
            eq.unequipCharges = eq.unequipChargesMax;
        }
        if (eq.unequipCharges > eq.unequipChargesMax) {
            eq.unequipCharges = eq.unequipChargesMax;
        }
        if (eq.unequipChargeReadyAt === undefined || eq.unequipChargeReadyAt === null) {
            eq.unequipChargeReadyAt = 0;
        }
        return eq;
    },

    getSlotCategory: function(skillKey) {
        const def = skills._byKey[skillKey];
        return (def && def.slotCategory) ? def.slotCategory : "";
    },

    findSkillEquipSlot: function(skillKey) {
        const eq = skills.ensureSkillEquip();
        if (!eq || !skillKey) {
            return null;
        }
        for (let i = 0; i < skills.SLOT_COLUMNS.length; i++) {
            const col = skills.SLOT_COLUMNS[i];
            const arr = eq.slots[col];
            for (let j = 0; j < arr.length; j++) {
                if (arr[j] === skillKey) {
                    return { column: col, index: j };
                }
            }
        }
        return null;
    },

    isSkillEquipped: function(skillKey) {
        return !!skills.findSkillEquipSlot(skillKey);
    },

    getEquippedSkillKeys: function() {
        const eq = skills.ensureSkillEquip();
        const out = [];
        if (!eq) {
            return out;
        }
        for (let i = 0; i < skills.SLOT_COLUMNS.length; i++) {
            const arr = eq.slots[skills.SLOT_COLUMNS[i]];
            for (let j = 0; j < arr.length; j++) {
                if (arr[j]) {
                    out.push(arr[j]);
                }
            }
        }
        return out;
    },

    /** Unlocked combat/class skills that have slotCategory (Library list). */
    getLibrarySkillKeys: function() {
        const out = [];
        const sk = data.progress && data.progress.skills;
        if (!sk) {
            return out;
        }
        for (let i = 0; i < skills.keysInOrder.length; i++) {
            const k = skills.keysInOrder[i];
            if (!skills.isSkillUnlocked(k)) {
                continue;
            }
            const def = skills._byKey[k];
            if (!def || !def.slotCategory) {
                continue;
            }
            out.push(k);
        }
        return out;
    },

    canPlaceSkillInColumn: function(skillKey, column) {
        const slotCat = skills.getSlotCategory(skillKey);
        if (!slotCat) {
            return false;
        }
        if (column === "any") {
            return true;
        }
        return column === slotCat;
    },

    canPlaceSkillInSlot: function(skillKey, column, index) {
        const eq = skills.ensureSkillEquip();
        if (!eq || !skills.canPlaceSkillInColumn(skillKey, column)) {
            return false;
        }
        const arr = eq.slots[column];
        if (!arr || index < 0 || index >= arr.length) {
            return false;
        }
        return true;
    },

    returnSkillStarsToPool: function(skill) {
        if (!skill || !skill.stars) {
            return;
        }
        const pool = data.progress.stars;
        if (!pool) {
            return;
        }
        if (skill.stars.bronze) {
            pool.bronze = (pool.bronze || 0) + 1;
            skill.stars.bronze = false;
        }
        if (skill.stars.silver) {
            pool.silver = (pool.silver || 0) + 1;
            skill.stars.silver = false;
        }
        if (skill.stars.gold) {
            pool.gold = (pool.gold || 0) + 1;
            skill.stars.gold = false;
        }
    },

    resetSkillLevelOnUnequip: function(skill) {
        if (!skill) {
            return;
        }
        const def = skills._byKey[skill.key];
        skill.level = 0;
        skill.exp = 0;
        skill.expToLevel = def && def.initialExpToLevel !== undefined ? def.initialExpToLevel : 5;
        skill.triggerCount = 0;
    },

    /** Place skill into an empty slot. Fails if occupied, already equipped, or incompatible. */
    equipSkillToSlot: function(skillKey, column, index) {
        const eq = skills.ensureSkillEquip();
        if (!eq || !skillKey) {
            return { ok: false, reason: "invalid" };
        }
        if (skills.isSkillEquipped(skillKey)) {
            return { ok: false, reason: "already" };
        }
        if (!skills.canPlaceSkillInSlot(skillKey, column, index)) {
            return { ok: false, reason: "incompatible" };
        }
        if (eq.slots[column][index]) {
            return { ok: false, reason: "occupied" };
        }
        eq.slots[column][index] = skillKey;
        return { ok: true };
    },

    /** Category column first, then Any. */
    tryAutoEquip: function(skillKey) {
        if (skills.isSkillEquipped(skillKey)) {
            return { ok: false, reason: "already" };
        }
        const slotCat = skills.getSlotCategory(skillKey);
        if (!slotCat) {
            return { ok: false, reason: "unclassified" };
        }
        const eq = skills.ensureSkillEquip();
        if (!eq) {
            return { ok: false, reason: "invalid" };
        }
        const tryCol = function(col) {
            const arr = eq.slots[col];
            for (let i = 0; i < arr.length; i++) {
                if (!arr[i]) {
                    eq.slots[col][i] = skillKey;
                    return { ok: true, column: col, index: i };
                }
            }
            return null;
        };
        const matched = tryCol(slotCat);
        if (matched) {
            return matched;
        }
        const any = tryCol("any");
        if (any) {
            return any;
        }
        return { ok: false, reason: "full", category: slotCat };
    },

    unequipSkillFromSlot: function(column, index, spendCharge) {
        const eq = skills.ensureSkillEquip();
        if (!eq) {
            return { ok: false, reason: "invalid" };
        }
        const arr = eq.slots[column];
        if (!arr || index < 0 || index >= arr.length || !arr[index]) {
            return { ok: false, reason: "empty" };
        }
        if (spendCharge) {
            if ((eq.unequipCharges || 0) < 1) {
                return { ok: false, reason: "nocharge" };
            }
        }
        const skillKey = arr[index];
        const skill = data.progress.skills[skillKey];
        arr[index] = null;
        if (skill) {
            skills.returnSkillStarsToPool(skill);
            skills.resetSkillLevelOnUnequip(skill);
        }
        if (spendCharge) {
            eq.unequipCharges = Math.max(0, (eq.unequipCharges || 0) - 1);
            if (eq.unequipCharges < eq.unequipChargesMax && !eq.unequipChargeReadyAt) {
                eq.unequipChargeReadyAt = Date.now() + skills.getUnequipChargeMs();
            }
        }
        return { ok: true, skillKey: skillKey };
    },

    unequipSkillByKey: function(skillKey, spendCharge) {
        const loc = skills.findSkillEquipSlot(skillKey);
        if (!loc) {
            return { ok: false, reason: "notequipped" };
        }
        return skills.unequipSkillFromSlot(loc.column, loc.index, spendCharge);
    },

    canSwapSlots: function(colA, indexA, colB, indexB) {
        const eq = skills.ensureSkillEquip();
        if (!eq) {
            return false;
        }
        const arrA = eq.slots[colA];
        const arrB = eq.slots[colB];
        if (!arrA || !arrB || indexA < 0 || indexB < 0 || indexA >= arrA.length || indexB >= arrB.length) {
            return false;
        }
        const keyA = arrA[indexA];
        const keyB = arrB[indexB];
        if (!keyA && !keyB) {
            return false;
        }
        if (keyA && !skills.canPlaceSkillInColumn(keyA, colB)) {
            return false;
        }
        if (keyB && !skills.canPlaceSkillInColumn(keyB, colA)) {
            return false;
        }
        return true;
    },

    swapSkillSlots: function(colA, indexA, colB, indexB) {
        if (!skills.canSwapSlots(colA, indexA, colB, indexB)) {
            return { ok: false, reason: "invalid" };
        }
        const eq = skills.ensureSkillEquip();
        const tmp = eq.slots[colA][indexA];
        eq.slots[colA][indexA] = eq.slots[colB][indexB];
        eq.slots[colB][indexB] = tmp;
        return { ok: true };
    },

    /** Move equipped skill onto an empty target slot (same as swap with empty). */
    moveSkillToEmptySlot: function(fromCol, fromIndex, toCol, toIndex) {
        const eq = skills.ensureSkillEquip();
        if (!eq) {
            return { ok: false, reason: "invalid" };
        }
        const key = eq.slots[fromCol] && eq.slots[fromCol][fromIndex];
        if (!key) {
            return { ok: false, reason: "empty" };
        }
        if (eq.slots[toCol][toIndex]) {
            return { ok: false, reason: "occupied" };
        }
        if (!skills.canPlaceSkillInColumn(key, toCol)) {
            return { ok: false, reason: "incompatible" };
        }
        eq.slots[toCol][toIndex] = key;
        eq.slots[fromCol][fromIndex] = null;
        return { ok: true };
    },

    tickUnequipCharges: function(now) {
        const eq = skills.ensureSkillEquip();
        if (!eq) {
            return;
        }
        now = now || Date.now();
        if (eq.unequipCharges >= eq.unequipChargesMax) {
            eq.unequipCharges = eq.unequipChargesMax;
            eq.unequipChargeReadyAt = 0;
            return;
        }
        const chargeMs = skills.getUnequipChargeMs();
        if (!eq.unequipChargeReadyAt) {
            eq.unequipChargeReadyAt = now + chargeMs;
            return;
        }
        while (eq.unequipCharges < eq.unequipChargesMax && now >= eq.unequipChargeReadyAt) {
            eq.unequipCharges++;
            if (eq.unequipCharges >= eq.unequipChargesMax) {
                eq.unequipChargeReadyAt = 0;
                break;
            }
            eq.unequipChargeReadyAt += chargeMs;
        }
    },

    getTotalTalentLevel: function() {
        return skills.unlockedTalentLevelTotal();
    },

    categoryArticle: function(slotCategory) {
        if (slotCategory === "offense" || slotCategory === "utility") {
            return "an";
        }
        return "a";
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
        if (!skills.isSkillEquipped(skillKey)) {
            return {};
        }
        try {
            return def.getEffect(sk) || {};
        } catch (e) {
            return {};
        }
    },
    /** One-line current effect for Skills tab. Uses definition effect even if unequipped (for display). */
    skillEffectUiSummary: function(skillKey, skill, opts) {
        const sk = skill || (data.progress && data.progress.skills && data.progress.skills[skillKey]);
        if (!sk || !skills.isSkillUnlocked(skillKey)) {
            return "";
        }
        const def = skills._byKey[skillKey];
        if (!def || typeof def.effectUiSummary !== "function") {
            return "";
        }
        let e = {};
        if (opts && opts.ignoreEquip) {
            try {
                e = def.getEffect(sk) || {};
            } catch (err) {
                e = {};
            }
        } else {
            e = skills.getSkillEffect(skillKey, sk);
        }
        const cd = gameData.battle.cooldowns;
        return def.effectUiSummary(sk, e, cd);
    },
    buffDescriptions: {
        "Fury": "Your next strike deals +1% damage per stack. All stacks are consumed when you attack.",
        "Desensitized": "Incoming damage is multiplied by 1 / (1 + 0.03 × stacks). Each stack expires on its own timer.",
        "Outrage": "Your attack timer recharges 50% faster while active. Its timer counts down only while your slap cooldown is not full. Additional time extends the buff. Duration is capped at 2 seconds + Okami's level / 5.",
        "Malice": "Builds a Malice counter, leading to 10% more damage on the next strike, increasing +10% per 20 stacks. Malice is capped at 10 + Okami's level × 5.",
        "Fake Tears": "You take 20% less damage while active. Additional time extends the buff. Duration is capped at 10 seconds + Okami's level.",
        "Clout": "Each stack blocks 1 raw incoming damage before flat and multiplier reductions. Stacks consumed equal damage prevented. Clout cannot exceed your max Audacity."
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
        // Multiplicative star scaling: each star ×1.5 (0→1, 1→1.5, 2→2.25, 3→3.375).
        const starMult = Math.pow(1.5, starCount);
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
        const e = skills.getSkillEffect("echoChamber");
        return e.otherSkillExpMultiplier !== undefined ? e.otherSkillExpMultiplier : 1;
    },

    /** Multiplier from Study Group for every skill except Study Group itself. Level 0 → ×1. */
    getStudyGroupExpMultiplierForOthers: function() {
        const e = skills.getSkillEffect("studyGroup");
        return e.otherSkillExpMultiplier !== undefined ? e.otherSkillExpMultiplier : 1;
    },

    /** Combined "other skill" exp multipliers that do not apply to the named skill. */
    getOtherSkillExpMultiplier: function(skillKey) {
        let mult = 1;
        if (skillKey !== "echoChamber") {
            mult *= skills.getEchoChamberExpMultiplierForOthers();
        }
        if (skillKey !== "studyGroup") {
            mult *= skills.getStudyGroupExpMultiplierForOthers();
        }
        return mult;
    }
};
