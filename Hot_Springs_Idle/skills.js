// All skill definitions, runtime state shape, exp/talent formulas, and UI copy in one place.
const SKILL_TRIGGER_TYPES = {
    onAttack: {
        initialExpToLevel: 5,
        initialTalentToLevel: 10,
        triggerText: "Trigger: 1 skill exp each time you attack.",
        exp: function() { return 1; }
    },
    onSlap: {
        initialExpToLevel: 5,
        initialTalentToLevel: 10,
        triggerText: "Trigger: 1 skill exp each time you slap.",
        exp: function() { return 1; }
    },
    onAttackLogDamage: {
        initialExpToLevel: 25,
        initialTalentToLevel: 35,
        triggerText: "Trigger: log10(ego damage dealt) skill exp (minimum 1) on each attack.",
        exp: function(ctx) {
            const dmg = Math.max(0, (ctx && ctx.damage) || 0);
            return Math.max(Math.log10(dmg), 1);
        }
    },
    onRepeatHit: {
        initialExpToLevel: 5,
        initialTalentToLevel: 5,
        triggerText: "Trigger: 1 skill exp for hitting an intruder you've hit before.",
        exp: function() { return 1; }
    },
    onFirstHit: {
        initialExpToLevel: 5,
        initialTalentToLevel: 10,
        triggerText: "Trigger: 1 skill exp on each first hit you deal to an intruder.",
        exp: function() { return 1; }
    },
    onKill: {
        initialExpToLevel: 5,
        initialTalentToLevel: 10,
        triggerText: "Trigger: 1 skill exp on each intruder removal.",
        exp: function() { return 1; }
    },
    onKillAboveHalf: {
        initialExpToLevel: 5,
        initialTalentToLevel: 10,
        triggerText: "Trigger: 1 skill exp on each intruder removal while Audacity is above half.",
        exp: function() { return 1; }
    },
    onKillLogOverkill: {
        initialExpToLevel: 10,
        initialTalentToLevel: 15,
        triggerText: "Trigger: log10(overkill damage) skill exp (minimum 1), on each intruder removal.",
        exp: function(ctx) {
            const over = (ctx && ctx.overkillDamage) || 0;
            const logged = over > 0 ? Math.log10(over) : 0;
            return Math.max(logged, 1);
        }
    },
    notFullAudPerSecond: {
        initialExpToLevel: 15,
        initialTalentToLevel: 20,
        triggerText: "Trigger: 1 skill exp per second while Audacity is not full.",
        periodMs: 1000,
        ready: function() { return !engine.isPlayerAtMaxAud(); },
        exp: function() { return 1; }
    },
    onMaxAudIncrease: {
        initialExpToLevel: 15,
        initialTalentToLevel: 15,
        triggerText: "Trigger: 1 skill exp when max Audacity increases, including from Confidence.",
        exp: function() { return 1; }
    },
    fullAudPerSecond: {
        initialExpToLevel: 10,
        initialTalentToLevel: 10,
        triggerText: "Trigger: 1 skill exp per second while at full Audacity.",
        periodMs: 1000,
        ready: function() { return engine.isPlayerAtMaxAud(); },
        exp: function() { return 1; }
    },
    onIntruderAttack: {
        initialExpToLevel: 10,
        initialTalentToLevel: 15,
        triggerText: "Trigger: 1 skill exp each time an intruder attacks you.",
        exp: function() { return 1; }
    },
    onTakeDamage: {
        initialExpToLevel: 10,
        initialTalentToLevel: 15,
        triggerText: "Trigger: 1 skill exp each time you take damage.",
        exp: function() { return 1; }
    },
    onIntruderAttackAgain: {
        initialExpToLevel: 10,
        initialTalentToLevel: 10,
        triggerText: "Trigger: 1 skill exp each time an intruder attacks you for the second time or later.",
        exp: function() { return 1; }
    },
    movingForwardPerSecond: {
        initialExpToLevel: 10,
        initialTalentToLevel: 5,
        triggerText: "Trigger: 1 skill exp every 1 cumulative second while moving forward on the battlefield.",
        periodMs: 1000,
        advanceWhen: function() { return engine.isPlayerMovingForward(); },
        exp: function() { return 1; }
    },
    combatFiveSeconds: {
        initialExpToLevel: 5,
        initialTalentToLevel: 10,
        triggerText: "Trigger: 1 skill exp per 5 seconds of battle time.",
        periodMs: 5000,
        useBattleTime: true,
        exp: function() { return 1; }
    },
    onCloneLevel: {
        initialExpToLevel: 4,
        initialTalentToLevel: 4,
        triggerText: "Trigger: 1 skill exp each time your clone level increases.",
        exp: function() { return 1; }
    },
    onOtherSkillLevel: {
        initialExpToLevel: 10,
        initialTalentToLevel: 20,
        triggerText: "Trigger: 0.25 skill exp each time a skill other than this one gains a skill level.",
        exp: function() { return 0.25; }
    },
    perVisiblePerSecond: {
        initialExpToLevel: 20,
        initialTalentToLevel: 30,
        triggerText: "Trigger: +0.25 skill exp per visible enemy per second.",
        tick: function(tickMs) {
            return { visible: engine.countVisibleIntruders(), seconds: tickMs / 1000 };
        },
        exp: function(ctx) {
            return 0.25 * ((ctx && ctx.visible) || 0) * ((ctx && ctx.seconds) || 0);
        }
    },
    perClosePerSecond: {
        initialExpToLevel: 10,
        initialTalentToLevel: 15,
        triggerText: "Trigger: 0.25 skill exp per second per intruder closer than 200 ft.",
        tick: function(tickMs) {
            return { close: engine.countVisibleIntrudersCloserThan(200), seconds: tickMs / 1000 };
        },
        exp: function(ctx) {
            return 0.25 * ((ctx && ctx.close) || 0) * ((ctx && ctx.seconds) || 0);
        }
    },
    perFarPerSecond: {
        initialExpToLevel: 10,
        initialTalentToLevel: 10,
        triggerText: "Trigger: 0.5 skill exp per second per visible enemy further than 200 range.",
        tick: function(tickMs) {
            return { far: engine.countVisibleIntrudersFurtherThan(200), seconds: tickMs / 1000 };
        },
        exp: function(ctx) {
            return 0.5 * ((ctx && ctx.far) || 0) * ((ctx && ctx.seconds) || 0);
        }
    },
    perSlapRangePerSecond: {
        initialExpToLevel: 10,
        initialTalentToLevel: 10,
        triggerText: "Trigger: 0.5 skill exp per 0.5 seconds per enemy in slap range.",
        periodMs: 500,
        context: function() {
            return { inRange: engine.countIntrudersInSlapRange() };
        },
        exp: function(ctx) {
            return 0.5 * ((ctx && ctx.inRange) || 0);
        }
    },
    onCoins: {
        initialExpToLevel: 10,
        initialTalentToLevel: 20,
        triggerText: "Trigger: 0.5 skill exp whenever coins are gained.",
        exp: function() { return 0.5; }
    },
    onPowerStrike: {
        initialExpToLevel: 5,
        initialTalentToLevel: 10,
        triggerText: "Trigger: 1 skill exp each power strike.",
        exp: function() { return 1; }
    },
    onBlock: {
        initialExpToLevel: 5,
        initialTalentToLevel: 10,
        triggerText: "Trigger: 1 skill exp each successful block.",
        exp: function() { return 1; }
    },
    onSandalKill: {
        initialExpToLevel: 5,
        initialTalentToLevel: 10,
        triggerText: "Trigger: 1 skill exp when you remove an intruder with a sandal attack.",
        exp: function() { return 1; }
    },
    onSandalUpperHalf: {
        initialExpToLevel: 5,
        initialTalentToLevel: 10,
        triggerText: "Trigger: 1 skill exp on a sandal hit on an intruder in the upper half of the battlefield.",
        exp: function() { return 1; }
    },
    onSandalHitNoExp: {
        initialExpToLevel: 5,
        initialTalentToLevel: 10,
        triggerText: "Trigger: each sandal attack hit.",
        exp: function() { return 0; }
    }
};

const SKILL_DEFINITION_ROWS = [
    {
        version:0,
        key: "selfAffirmations",
        triggerType: "notFullAudPerSecond",
        name: "Self-Affirmations",
        category: "combat",
        slotCategory: "defense",
        flavorText: '"To love oneself is the beginning of a lifelong romance." - Oscar Wilde',
        shortDescription: "Restore Audacity every second while the battle runs.",
        rewardText: function() {
            return "Reward: +1.5 (+0.75 per skill level) Audacity per second is healed.";
        },
        getEffect: function(sk) {
            return { audPerSec: 1.5 + (sk.level || 0) * 0.75 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals(e.audPerSec || 0, 2).toFixed(2)} Audacity per second`;
        }
    },
    {
        version:0,
        key: "force",
        triggerType: "onAttack",
        name: "Force",
        category: "combat",
        slotCategory: "offense",
        flavorText: "\"My opinions land harder than yours.\"",
        shortDescription: "Additional ego damage per skill level.",
        rewardText: function() {
            return "Reward: +2 (+1 per skill level) flat ego damage.";
        },
        getEffect: function(sk) {
            return { baseDamage: 2 + (sk.level || 0)};
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals(e.baseDamage || 0, 2)} slap (base)`;
        }
    },
    {
        version:0,
        key: "aboveItAll",
        triggerType: "onIntruderAttack",
        name: "Above It All",
        category: "combat",
        slotCategory: "defense",
        flavorText: '"The eagle does not catch flies." - Latin Proverb',
        shortDescription: "Reduces incoming ego damage by a %.",
        rewardText: function() {
            return "Reward: Incoming damage multiplied by 1 / (1.1 (+ 0.02 per skill level)).";
        },
        getEffect: function(sk) {
            const lv = sk.level || 0;
            return { incomingDamageMultiplier: 1 / (1.1 + lv * 0.02) };
        },
        effectUiSummary: function(sk, e) {
            return `Current: incoming x${roundNearestDecimals(e.incomingDamageMultiplier || 1, 3)}`;
        }
    },
    {
        version:0,
        key: "hindsight",
        triggerType: "onCloneLevel",
        name: "Hindsight",
        category: "combat",
        slotCategory: "utility",
        flavorText: '"Life can only be understood backwards; but it must be lived forwards." - Søren Kierkegaard',
        shortDescription: "Boosts clone leveling exp.",
        rewardText: function() {
            return "Reward: +20% (+5% per skill level) clone leveling exp.";
        },
        getEffect: function(sk) {
            return { characterExpMultiplier: 1.2 + 0.05 * (sk.level || 0) };
        },
        effectUiSummary: function(sk, e) {
            return `Current: char exp x${roundNearestDecimals(e.characterExpMultiplier || 1, 2)}`;
        }
    },
    {
        version:0,
        key: "extortion",
        triggerType: "onCoins",
        name: "Extortion",
        category: "combat",
        slotCategory: "utility",
        flavorText: "\"I don't loot. I invoice.\"",
        shortDescription: "Coin gain multiplier.",
        rewardText: function() {
            return "Reward: +10% (+3% per skill level) coins.";
        },
        getEffect: function(sk) {
            return { killCoinsMultiplier: 1.1 + 0.03 * (sk.level || 0) };
        },
        effectUiSummary: function(sk, e) {
            return `Current: intruder removal coins x${roundNearestDecimals(e.killCoinsMultiplier || 1, 2)}`;
        }
    },
    {
        version:0,
        key: "nickelAndDime",
        triggerType: "onKill",
        name: "Nickel and Dime",
        category: "combat",
        slotCategory: "utility",
        flavorText: '"Take care of the pennies, and the pounds will take care of themselves." - William Lowndes',
        shortDescription: "Adds extra base coins per intruder removal.",
        rewardText: function() {
            return "Reward: +3 (+2 per skill level) base coins on each intruder removal.";
        },
        getEffect: function(sk) {
            return { killCoinsFlat: 3 + (sk.level || 0) * 2 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.killCoinsFlat || 0} base coins per intruder removal`;
        }
    },
    {
        version:0,
        key: "pickpocket",
        triggerType: "onSlap",
        name: "Pickpocket",
        category: "combat",
        slotCategory: "utility",
        flavorText: "\"Your wallet called. It wants to defect.\"",
        shortDescription: "Coins each time you slap.",
        rewardText: function() {
            return "Reward: +2 (+1 per skill level) coins per slap, multiplied by coin bonuses. Flat coin bonuses are not added. This is a separate coin gain from intruder removal.";
        },
        getEffect: function(sk) {
            return { attackCoins: 2 + (sk.level || 0) };
        },
        effectUiSummary: function(sk, e) {
            const base = e.attackCoins || 0;
            const mult = (typeof engine !== "undefined" && engine.intruderCoinMultiplier)
                ? engine.intruderCoinMultiplier() : 1;
            return `Current: +${roundNearestDecimals(base * mult, 2)} coins per slap`;
        }
    },
    {
        version:0,
        key: "shameless",
        triggerType: "combatFiveSeconds",
        name: "Shameless",
        category: "combat",
        slotCategory: "defense",
        flavorText: "\"I kept the scandal. I threw out the apology.\"",
        shortDescription: "Raises max Audacity as it levels, with a heal.",
        rewardText: function() {
            return "Reward: +(3 x skill level) max Audacity each skill level. On skill level-up, also heal for 3 x the new skill level.";
        },
        getEffect: function(sk) {
            const lv = sk.level || 0;
            return { baseAudBonus: 3 * lv * (lv + 1) / 2, audRecoverBonus: 3 * lv };
        },
        effectUiSummary: function(sk, e) {
            const b = e.baseAudBonus || 0;
            const r = e.audRecoverBonus || 0;
            return `Current: +${b} max Aud; additionally heal ${r} Audacity when leveling`;
        }
    },
    {
        version:0,
        key: "corneredEgo",
        triggerType: "notFullAudPerSecond",
        name: "Cornered Ego",
        category: "combat",
        slotCategory: "defense",
        flavorText: "\"Half empty is when I start taking myself seriously.\"",
        shortDescription: "Raises max Audacity when hurt, with a heal. Also gives a flat 20 Max Audacity.",
        rewardText: function() {
            return "Reward: +20 base max Audacity, plus +3 x skill level max Audacity each skill level. On skill level-up, also heal for 3 x the new skill level.";
        },
        getEffect: function(sk) {
            const lv = sk.level || 0;
            return { audInnerBonus: 20 + (3 * lv * (lv + 1) / 2), audRecoverBonus: 3 * lv };
        },
        effectUiSummary: function(sk, e) {
            const b = e.audInnerBonus || 0;
            const r = e.audRecoverBonus || 0;
            return `Current: +${b} max Aud (includes +20 base); additionally heal ${r} Audacity when leveling`;
        }
    },
    {
        version:0,
        key: "mountingEgo",
        triggerType: "onOtherSkillLevel",
        name: "Mounting Ego",
        category: "combat",
        slotCategory: "defense",
        flavorText: "\"Every new trick is proof the old me was too humble.\"",
        shortDescription: "Max Audacity that grows faster each skill level.",
        rewardText: function() {
            return "Reward: +(10 x skill level) max Audacity each skill level.";
        },
        getEffect: function(sk) {
            const lv = sk.level || 0;
            return { baseAudBonus: 10 * lv * (lv + 1) / 2 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.baseAudBonus || 0} max Aud`;
        }
    },
    {
        version:0,
        key: "adaptation",
        triggerType: "onCloneLevel",
        name: "Adaptation",
        category: "combat",
        slotCategory: "defense",
        flavorText: '"We are what we repeatedly do. Excellence, then, is not an act, but a habit." - Aristotle',
        shortDescription: "More Confidence, gaining exp on clone levels.",
        rewardText: function() {
            return "Reward: +2 (+1 per skill level) Confidence.";
        },
        getEffect: function(sk) {
            return { bonusCon: 2 + (sk.level || 0) };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.bonusCon || 0} Con from Adaptation`;
        }
    },
    {
        version:0,
        key: "bravado",
        triggerType: "onCloneLevel",
        name: "Bravado",
        category: "combat",
        slotCategory: "defense",
        flavorText: "\"If I say I'm fine loud enough, the math agrees.\"",
        shortDescription: "Multiplies max Audacity, gaining exp on clone levels.",
        rewardText: function() {
            return "Reward: +10% (+3% per skill level) total max Audacity, after Confidence.";
        },
        getEffect: function(sk) {
            return { maxAudMultiplier: 1.1 + 0.03 * (sk.level || 0) };
        },
        effectUiSummary: function(sk, e) {
            return `Current: max Aud x${roundNearestDecimals(e.maxAudMultiplier || 1, 2)}`;
        }
    },
    {
        version:0,
        key: "savageLessons",
        triggerType: "onCloneLevel",
        name: "Savage Lessons",
        category: "combat",
        slotCategory: "offense",
        flavorText: '"Experience is a hard teacher because she gives the test first, the lesson afterward." - Vernon Law',
        shortDescription: "More Brutality, gaining exp on clone levels.",
        rewardText: function() {
            return "Reward: +2 (+1 per skill level) Brutality.";
        },
        getEffect: function(sk) {
            return { bonusStr: 2 + (sk.level || 0) };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.bonusStr || 0} Bru from Savage Lessons`;
        }
    },
    {
        version:0,
        key: "soulSearching",
        triggerType: "onCloneLevel",
        name: "Soul Searching",
        category: "combat",
        slotCategory: "utility",
        flavorText: "\"The level-up is nice. The existential crisis is the point.\"",
        shortDescription: "More Soul, gaining exp on clone levels.",
        rewardText: function() {
            return "Reward: +2 (+1 per skill level) Soul.";
        },
        getEffect: function(sk) {
            return { bonusSoul: 2 + (sk.level || 0) };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.bonusSoul || 0} Soul from Soul Searching`;
        }
    },
    {
        version:0,
        key: "echoChamber",
        triggerType: "onOtherSkillLevel",
        name: "Echo Chamber",
        category: "combat",
        slotCategory: "utility",
        flavorText: "\"The more we agree, the louder I get.\"",
        shortDescription: "Increase the exp gain of other skills.",
        rewardText: function() {
            return "Reward: +10% (+2% per level) skill exp for every other skill per Echo Chamber skill level.";
        },
        getEffect: function(sk) {
            return { otherSkillExpMultiplier: 1.1 + 0.02 * (sk.level || 0) };
        },
        effectUiSummary: function(sk, e) {
            return `Current: x${roundNearestDecimals(e.otherSkillExpMultiplier || 1, 4)} other skills' skill exp`;
        }
    },
    {
        version:0,
        key: "reflection",
        triggerType: "onOtherSkillLevel",
        name: "Reflection",
        category: "combat",
        slotCategory: "utility",
        flavorText: "\"I don't copy them. I absorb the lesson and improve it.\"",
        shortDescription: "Clone exp over time.",
        rewardText: function() {
            return "Reward: +0.2 (+0.1 per skill level) base clone exp per second. Clone exp multipliers apply.";
        },
        getEffect: function(sk) {
            return { expPerSec: 0.2 + 0.1 * (sk.level || 0) };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals(e.expPerSec || 0, 2)} base clone exp per second`;
        }
    },
    {
        version:0,
        key: "vicarious",
        triggerType: "onOtherSkillLevel",
        name: "Vicarious",
        category: "combat",
        slotCategory: "utility",
        flavorText: "\"Your progress looks great on me.\"",
        shortDescription: "More Soul as this skill levels.",
        rewardText: function() {
            return "Reward: +1 Soul per skill level.";
        },
        getEffect: function(sk) {
            return { bonusSoul: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.bonusSoul || 0} Soul from Vicarious`;
        }
    },
    {
        version:0,
        key: "mainCharacter",
        triggerType: "perVisiblePerSecond",
        name: "Main Character",
        category: "combat",
        slotCategory: "offense",
        flavorText: "\"If they're watching, they're supporting cast.\"",
        shortDescription: "More flat ego damage per level per visible intruder.",
        rewardText: function(sk) {
            return `Reward: +1 (+0.25 per level) flat ego damage per visible intruder.`;
        },
        getEffect: function(sk) {
            return { flatDamagePerEnemy: 1 + (sk.level || 0) * 0.25 };
        },
        effectUiSummary: function(sk, e) {
            const vis = (typeof engine !== "undefined" && engine.countVisibleIntruders && data.battle && data.battle.enemies)
                ? engine.countVisibleIntruders()
                : 0;
            const total = (e.flatDamagePerEnemy || 0) * vis;
            const noun = vis === 1 ? "intruder" : "intruders";
            return `Current: +${roundNearestDecimals(total, 2)} damage from ${vis} visible ${noun}`;
        }
    },
    {
        version:0,
        key: "grudge",
        triggerType: "onTakeDamage",
        name: "Grudge",
        category: "combat",
        slotCategory: "offense",
        flavorText: '"A wrong unavenged is a wound unhealed." - Italian Proverb',
        shortDescription: "More damage against intruders that have attacked you.",
        rewardText: function(sk) {
            return `Reward: +15% (+3% per skill level) ego damage against intruders that have attacked you.`;
        },
        getEffect: function(sk) {
            return { damageMultPerLevel: 0.15 + (sk.level || 0) * 0.03 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals((e.damageMultPerLevel || 0) * 100, 1)}% dmg vs attackers`;
        }
    },
    {
        version:0,
        key: "insultFatigue",
        triggerType: "onIntruderAttackAgain",
        name: "Insult Fatigue",
        category: "combat",
        slotCategory: "defense",
        flavorText: '"He who throws dirt always loses ground." - Mexican Proverb',
        shortDescription: "Intruders deal less flat damage after hitting you; stacks per hit, per enemy.",
        rewardText: function(sk) {
            return `Reward: each time an enemy damages you, later attacks deal 2 (+1 per skill level) flat less damage per stack (stacks per damaging hit, per enemy). Insult Fatigue's reduction is capped at half of that attack's raw damage, before other flat reductions are applied.`;
        },
        getEffect: function(sk) {
            return { flatReductionPerStack: 2 + (sk.level || 0) * 1 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: −${roundNearestDecimals(e.flatReductionPerStack || 0, 2)} flat dmg per stack, capped at 50% of raw attack`;
        }
    },
    {
        version:0,
        key: "brokenRecord",
        triggerType: "onIntruderAttack",
        name: "Broken Record",
        category: "combat",
        slotCategory: "defense",
        flavorText: "\"Repetition is just free desensitization therapy.\"",
        shortDescription: "Gain Desensitized stacks when intruders attack.",
        rewardText: function(sk) {
            return `Reward: each enemy attack adds a Desensitized stack lasting 2 (+0.5 per skill level) seconds.`;
        },
        getEffect: function(sk) {
            return { desensitizedMsPerLevel: 2000 + (sk.level || 0) * 500 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +1 Desensitized stack (${round2((e.desensitizedMsPerLevel || 0)/1000)}s) per enemy attack`;
        }
    },
    {
        version:0,
        key: "validation",
        triggerType: "onKill",
        name: "Validation",
        category: "combat",
        slotCategory: "defense",
        flavorText: '"The deepest principle in human nature is the craving to be appreciated." - William James',
        shortDescription: "Gain max Audacity per kill. Additionally heal equal to the skill level.",
        rewardText: function(sk) {
            return `Reward: +5 max Audacity per intruder removal, up to 15 per skill level. Removals while already at that cap do nothing. When a removal raises this max Audacity, also heal equal to the 2 x skill level.`;
        },
        getEffect: function(sk) {
            const lv = sk.level || 0;
            return { audPerKill: 5, audCap: lv * 15, currentAudOnMaxIncrease: lv * 2 };
        },
        effectUiSummary: function(sk, e) {
            const cap = e.audCap || 0;
            const earned = Math.min((data.battle && data.battle.validationAudEarned) || 0, cap);
            const curGain = e.currentAudOnMaxIncrease || 0;
            return `Current: +${earned} max Aud from kills (cap ${cap}). Additionally heal +${curGain} Audacity when a kill raises that max`;
        }
    },
    {
        version:0,
        key: "imposterSyndrome",
        triggerType: "notFullAudPerSecond",
        name: "Imposter Syndrome",
        category: "combat",
        slotCategory: "offense",
        flavorText: "\"I don't belong here. That's what makes me dangerous.\"",
        shortDescription: "Gain Malice over time while not at full Audacity.",
        rewardText: function(sk) {
            return `Reward: +1 Malice + 0.25 per skill level every 1s while not at full Audacity.`;
        },
        getEffect: function(sk) {
            return { malicePerLevel: 1 + (sk.level || 0) * 0.25 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${round2(e.malicePerLevel || 0)} Malice/s while not at full Audacity`;
        }
    },
    {
        version:0,
        key: "narcissism",
        triggerType: "onMaxAudIncrease",
        name: "Narcissism",
        category: "combat",
        slotCategory: "defense",
        flavorText: '"I celebrate myself, and sing myself." - Walt Whitman',
        shortDescription: "Improves the equal current Audacity recover when max Audacity increases, including from Confidence.",
        rewardText: function(sk) {
            return `Reward: 20% (+5% per skill level) of the equal current Audacity recover when max Audacity increases becomes an additional heal, including from Confidence. Does not apply to other heals.`;
        },
        getEffect: function(sk) {
            return { audGainMultPerLevel: 0.2 + (sk.level || 0) * 0.05 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals((e.audGainMultPerLevel || 0) * 100, 1)}% on equal recover when max Aud increases (including from Con)`;
        }
    },
    {
        version:0,
        key: "windfallSwagger",
        triggerType: "onCoins",
        name: "Windfall Swagger",
        category: "combat",
        slotCategory: "defense",
        flavorText: '"Audacity, more audacity, and always audacity!" - Georges Danton',
        shortDescription: "Gain Confidence per level; levels when coins are gained.",
        rewardText: function() {
            return "Reward: +2 (+1 per skill level) Confidence.";
        },
        getEffect: function(sk) {
            return { bonusCon: 2 + sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.bonusCon || 0} Con from skill level`;
        }
    },
    {
        version:0,
        key: "secondhandEmbarrassment",
        triggerType: "perVisiblePerSecond",
        name: "Secondhand Embarrassment",
        category: "combat",
        slotCategory: "utility",
        flavorText: '"The coins are collected while the shame is watched."',
        shortDescription: "When an intruder is removed, other slap-range intruders pay a share of the coins they would drop.",
        rewardText: function() {
            return "Reward: when an intruder is removed, gain coins from each other intruder in slap range equal to 10% (+2% per skill level) of the coins they would drop. Each drop counts as a coin gain, for other skills that use that trigger.";
        },
        getEffect: function(sk) {
            return { splashCoinFraction: 0.10 + 0.02 * (sk.level || 0) };
        },
        effectUiSummary: function(sk, e) {
            const pct = roundNearestDecimals((e.splashCoinFraction || 0) * 100, 1);
            return `Current: ${pct}% of the coins each other slap-range intruder would drop`;
        }
    },
    {
        version:0,
        key: "rubbernecking",
        triggerType: "perClosePerSecond",
        name: "Rubbernecking",
        category: "combat",
        slotCategory: "utility",
        flavorText: "\"I learn more from the wreck than from the lesson plan.\"",
        shortDescription: "Siphon clone exp from intruders in slap range.",
        rewardText: function() {
            return "Reward: each second, gain 5% (+1% per skill level) of the clone exp each intruder in slap range would award. That exp also grants the usual Okami exp.";
        },
        getEffect: function(sk) {
            return { cloneExpFractionPerSec: 0.05 + 0.01 * (sk.level || 0) };
        },
        effectUiSummary: function(sk, e) {
            const pct = roundNearestDecimals((e.cloneExpFractionPerSec || 0) * 100, 1);
            return `Current: ${pct}% of each slap-range intruder's clone exp per second`;
        }
    },
    {
        version:0,
        key: "runningTab",
        triggerType: "perClosePerSecond",
        name: "Running Tab",
        category: "combat",
        slotCategory: "utility",
        flavorText: "\"Stay in range. The invoice writes itself.\"",
        shortDescription: "Bank coins from intruders in slap range, paid when they fall.",
        rewardText: function() {
            return "Reward: each second an intruder is in slap range, bank 10% (+2% per skill level) of that intruder's kill coins. The bank is paid when that intruder is removed, and does not count as a coin gain for other skills.";
        },
        getEffect: function(sk) {
            return { coinFractionPerSec: 0.10 + 0.02 * (sk.level || 0) };
        },
        effectUiSummary: function(sk, e) {
            const pct = roundNearestDecimals((e.coinFractionPerSec || 0) * 100, 1);
            return `Current: bank ${pct}% of each slap-range intruder's kill coins per second, paid on removal`;
        }
    },
    {
        version:0,
        key: "shockValue",
        triggerType: "onAttackLogDamage",
        name: "Shock Value",
        category: "combat",
        slotCategory: "offense",
        flavorText: "\"If nobody flinched, I underperformed.\"",
        shortDescription: "More Brutality, gaining more exp with higher damage.",
        rewardText: function() {
            return "Reward: +2 (+1 per skill level) Brutality.";
        },
        getEffect: function(sk) {
            return { bonusStr: 2 + sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.bonusStr || 0} Bru from skill level`;
        }
    },
    {
        version:0,
        key: "bitterRivalry",
        triggerType: "perSlapRangePerSecond",
        name: "Bitter Rivalry",
        category: "combat",
        slotCategory: "offense",
        flavorText: "\"The longer you stay in my face, the more personal this becomes.\"",
        shortDescription: "Deal more damage to intruders the longer they stay close.",
        rewardText: function(sk) {
            return `Reward: +5% (+1% per skill level) more damage to an enemy for each second they have been in slap range.`;
        },
        getEffect: function(sk) {
            return { damagePercentPerSecond: 5 + (sk.level || 0) * 1 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${round2(e.damagePercentPerSecond || 0)}% ego damage per second an enemy is in slap range`;
        }
    },
    {
        version:0,
        key: "slowBurn",
        triggerType: "perClosePerSecond",
        name: "Slow Burn",
        category: "combat",
        slotCategory: "offense",
        flavorText: "\"Don't rush the resentment. Let it marinate.\"",
        shortDescription: "Flat ego damage that builds while intruders stay in slap range.",
        rewardText: function(sk) {
            return `Reward: +2 (+1 per skill level) flat ego damage per second while any intruder is in slap range (0 for the first second). Resets when no intruders are in slap range.`;
        },
        getEffect: function(sk) {
            return { flatDamagePerSecond: 2 + (sk.level || 0) * 1 };
        },
        effectUiSummary: function(sk, e) {
            const secs = (data.battle && data.battle.slowBurnSeconds) || 0;
            const per = e.flatDamagePerSecond || 0;
            const total = per * secs;
            return `Current: +${roundNearestDecimals(per, 2)} flat damage/s after the first second (${secs}s → +${roundNearestDecimals(total, 2)})`;
        }
    },
    {
        version:0,
        key: "seethe",
        triggerType: "perFarPerSecond",
        name: "Seethe",
        category: "combat",
        slotCategory: "offense",
        flavorText: '"The silence between insults is where the rage brews." - Modern Proverb',
        shortDescription: "Gain Fury stacks from visible that are not close",
        rewardText: function(sk) {
            return `Reward: 2 (+0.5 per skill level) Fury stacks every 1s per enemy further than 200 range.`;
        },
        getEffect: function(sk) {
            return { furyPerLevel: 2 + (sk.level || 0) * 0.5};
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.furyPerLevel || 0} Fury every 1s per enemy further than 200 range`;
        }
    },
    {
        version:0,
        key: "retailTherapy",
        triggerType: "onCoins",
        name: "Retail Therapy",
        category: "combat",
        slotCategory: "defense",
        flavorText: '"Anyone who lives within their means suffers from a lack of imagination." - Oscar Wilde',
        shortDescription: "Desensitized stacks when gaining coins.",
        rewardText: function(sk) {
            return `Reward: +1 Desensitized stack lasting 6s (+0.5s per skill level) when you gain coins.`;
        },
        getEffect: function(sk) {
            return { desensitizedMsPerLevel: 4000 + (sk.level || 0) * 1000 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +1 Desensitized (${round2((e.desensitizedMsPerLevel || 0) / 1000)}s) per coin gain`;
        }
    },
    {
        version:0,
        key: "levelHeaded",
        triggerType: "onCloneLevel",
        name: "Level Headed",
        category: "combat",
        slotCategory: "defense",
        flavorText: '"Growth is just another word for getting used to it." - English Proverb',
        shortDescription: "Desensitized stacks when your clone levels up.",
        rewardText: function(sk) {
            return `Reward: +5 Desensitized stacks lasting 10s (+5s per skill level) each when your clone level increases.`;
        },
        getEffect: function(sk) {
            return { desensitizedMsPerLevel: 10000 + (sk.level || 0) * 5000 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: 5 Desensitized stacks lasting ${round2((e.desensitizedMsPerLevel || 0) / 1000)}s each per clone level-up`;
        }
    },
    {
        version:0,
        key: "bloodRush",
        triggerType: "onKillAboveHalf",
        name: "Blood Rush",
        category: "combat",
        slotCategory: "offense",
        flavorText: '"There is a kind of sweet madness in the pursuit of victory." - Pindar',
        shortDescription: "Gain Malice when defeating intruders while above 50% Aud.",
        rewardText: function(sk) {
            return `Reward: +1 Malice + 0.5 per skill level when defeating an intruder while above 50% Aud.`;
        },
        getEffect: function(sk) {
            return { malicePerLevel: 1 + (sk.level || 0) * 0.5 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${round2(e.malicePerLevel || 0)} Malice per kill above half Aud`;
        }
    },
    {
        version:0,
        key: "temper",
        triggerType: "onTakeDamage",
        name: "Temper",
        category: "combat",
        slotCategory: "offense",
        flavorText: '"You wouldn\'t like me when I\'m comfortable."',
        shortDescription: "Malice when taking damage.",
        rewardText: function(sk) {
            return `Reward: +0.5 Malice + 0.25 per skill level when taking damage.`;
        },
        getEffect: function(sk) {
            return { malicePerLevel: 0.5 + (sk.level || 0) * 0.25 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${round2(e.malicePerLevel || 0)} Malice per damaging hit`;
        }
    },
    {
        version:0,
        key: "sadism",
        triggerType: "onKillLogOverkill",
        name: "Sadism",
        category: "combat",
        slotCategory: "offense",
        flavorText: '"Excess on occasion is exhilarating." - W. Somerset Maugham',
        shortDescription: "Flat ego damage per skill level; exp from overkill.",
        rewardText: function(sk) {
            return `Reward: +3 (+0.75 per skill level) flat ego damage.`;
        }, 
        getEffect: function(sk) {
            return { flatDamage: 3 + (sk.level || 0) * 0.75 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals(e.flatDamage || 0, 2)} flat ego damage`;
        }
    },
    {
        version:0,
        key: "recognition",
        triggerType: "onOtherSkillLevel",
        name: "Recognition",
        category: "combat",
        slotCategory: "defense",
        flavorText: "\"Progress only counts if someone could have seen it.\"",
        shortDescription: "Clout when this skill levels up.",
        rewardText: function(sk) {
            return `Reward: +20 (+5 per skill level) Clout when this skill levels up.`;
        },
        getEffect: function(sk) {
            return { cloutPerLevel: 20 + (sk.level || 0) * 5 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${round2(e.cloutPerLevel || 0)} Clout when this skill levels up`;
        }
    },
    {
        version:0,
        key: "brandRecognition",
        triggerType: "fullAudPerSecond",
        name: "Brand Recognition",
        category: "combat",
        slotCategory: "defense",
        flavorText: "\"Peak confidence is when I stop introducing myself.\"",
        shortDescription: "Clout while at max Audacity.",
        rewardText: function(sk) {
            return `Reward: 3 (+1.5 per skill level) Clout every 1s while at max Aud.`;
        },
        getEffect: function(sk) {
            return { cloutPerSec: 3 + (sk.level || 0) * 1.5 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${round2(e.cloutPerSec || 0)} Clout/s at max Aud`;
        }
    },
    {
        version:0,
        key: "applyTearDrops",
        triggerType: "movingForwardPerSecond",
        name: "Apply Tear Drops",
        category: "combat",
        slotCategory: "defense",
        flavorText: '"Tears are the silent language of manipulation." - French Maxim',
        shortDescription: "Fake Tears while advancing on the battlefield.",
        rewardText: function(sk) {
            return `Reward: +1.5 (+ 0.75 per skill level) Fake Tears every 1 cumulative second while moving.`;
        },
        getEffect: function(sk) {
            return { fakeTears: 1.5 + (sk.level || 0) * 0.75 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${round2(e.fakeTears || 0)} Fake Tears per 1s while moving`;
        }
    },
    {
        version:0,
        key: "numbingCrowds",
        triggerType: "perClosePerSecond",
        name: "Numbing Crowds",
        category: "combat",
        slotCategory: "defense",
        flavorText: "\"A crowd is the perfect excuse to fall apart strategically.\"",
        shortDescription: "Fake Tears when intruders are close.",
        rewardText: function(sk) {
            return `Reward: +0.3 (+0.1 per skill level) Fake Tears per second per enemy closer than 200 ft.`;
        },
        getEffect: function(sk) {
            return { fakeTearsPerEnemy: 0.3 + (sk.level || 0) * 0.1 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${round2(e.fakeTearsPerEnemy || 0)} Fake Tears/s per enemy closer than 200 ft`;
        }
    },
    {
        version:0,
        key: "peerPressure",
        triggerType: "perClosePerSecond",
        name: "Peer Pressure",
        category: "combat",
        slotCategory: "offense",
        flavorText: "\"Everybody's doing it. That's the whole point.\"",
        shortDescription: "More ego damage % per intruder closer than 200 ft.",
        rewardText: function(sk) {
            return `Reward: +2% (+1% per skill level) ego damage per intruder closer than 200 ft.`;
        },
        getEffect: function(sk) {
            return { damageBonusFractionPerEnemy: 0.02 + (sk.level || 0) * 0.01 };
        },
        effectUiSummary: function(sk, e) {
            const close = (typeof engine !== "undefined" && engine.countVisibleIntrudersCloserThan)
                ? engine.countVisibleIntrudersCloserThan(200) : 0;
            const per = e.damageBonusFractionPerEnemy || 0;
            const totalPct = roundNearestDecimals(per * close * 100, 1);
            return `Current: +${roundNearestDecimals(per * 100, 1)}% ego dmg per close enemy (${totalPct}% from ${close})`;
        }
    },
    {
        version:0,
        key: "highHorse",
        triggerType: "fullAudPerSecond",
        name: "High Horse",
        category: "combat",
        slotCategory: "offense",
        flavorText: "\"It's not arrogance if you're still winning.\"",
        shortDescription: "More ego damage while at full Audacity.",
        rewardText: function(sk) {
            return `Reward: +12% (+3% per skill level) ego damage while at full Audacity.`;
        },
        getEffect: function(sk) {
            return { damageBonusFraction: 0.12 + (sk.level || 0) * 0.03 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals((e.damageBonusFraction || 0) * 100, 1)}% dmg at full Audacity`;
        }
    },
    {
        version:0,
        key: "underdog",
        triggerType: "notFullAudPerSecond",
        name: "Underdog",
        category: "combat",
        slotCategory: "offense",
        flavorText: "\"They love a comeback almost as much as I need one.\"",
        shortDescription: "More ego damage while not at full Audacity.",
        rewardText: function(sk) {
            return `Reward: +12% (+3% per skill level) ego damage while not at full Audacity.`;
        },
        getEffect: function(sk) {
            return { damageBonusFraction: 0.12 + (sk.level || 0) * 0.03 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals((e.damageBonusFraction || 0) * 100, 1)}% dmg while not at full Audacity`;
        }
    },
    {
        version:0,
        key: "repeatOffender",
        triggerType: "onRepeatHit",
        name: "Repeat Offender",
        category: "combat",
        slotCategory: "offense",
        flavorText: "\"I don't make new points. I make the same point louder.\"",
        shortDescription: "Extra flat ego damage per previous hit on the same intruder.",
        rewardText: function(sk) {
            return `Reward: +5 (+2 per skill level) flat ego damage per previous hit on that same intruder.`;
        },
        getEffect: function(sk) {
            return { flatDamagePerPriorHit: 5 + (sk.level || 0) * 2 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals(e.flatDamagePerPriorHit || 0, 2)} dmg per prior hit on target`;
        }
    },
    {
        version:0,
        key: "crowdWork",
        triggerType: "perVisiblePerSecond",
        name: "Crowd Work",
        category: "combat",
        slotCategory: "offense",
        flavorText: "\"A packed house is just a bigger mirror.\"",
        shortDescription: "More ego damage % per visible intruder.",
        rewardText: function(sk) {
            return `Reward: +2% (+1% per skill level) ego damage per visible intruder.`;
        },
        getEffect: function(sk) {
            return { damageBonusFractionPerEnemy: 0.02 + (sk.level || 0) * 0.01 };
        },
        effectUiSummary: function(sk, e) {
            const vis = (typeof engine !== "undefined" && engine.countVisibleIntruders)
                ? engine.countVisibleIntruders() : 0;
            const per = e.damageBonusFractionPerEnemy || 0;
            const totalPct = roundNearestDecimals(per * vis * 100, 1);
            return `Current: +${roundNearestDecimals(per * 100, 1)}% ego dmg per visible (${totalPct}% from ${vis})`;
        }
    },
    {
        version:0,
        key: "walkingItOff",
        triggerType: "movingForwardPerSecond",
        name: "Walking It Off",
        category: "combat",
        slotCategory: "defense",
        flavorText: "\"Keep moving and the sting can't catch up.\"",
        shortDescription: "Heal while advancing on the battlefield.",
        rewardText: function(sk) {
            return `Reward: 4 (+2 per skill level) healed per second while moving forward.`;
        },
        getEffect: function(sk) {
            return { audPerSec: 4 + (sk.level || 0) * 2 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals(e.audPerSec || 0, 2).toFixed(2)} Aud/s while moving`;
        }
    },
    {
        version:0,
        key: "publicApology",
        triggerType: "onKill",
        name: "Public Apology",
        category: "combat",
        slotCategory: "defense",
        flavorText: "\"I'm sorry you made me do that.\"",
        shortDescription: "Heal on each intruder removal.",
        rewardText: function(sk) {
            return `Reward: 5 (+1 per skill level) healed on each intruder removal.`;
        },
        getEffect: function(sk) {
            return { audPerKill: 5 + (sk.level || 0) * 1 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals(e.audPerKill || 0, 2)} Aud per kill`;
        }
    },
    {
        version:0,
        key: "thickSkin",
        triggerType: "onTakeDamage",
        name: "Thick Skin",
        category: "combat",
        slotCategory: "defense",
        flavorText: "\"Your insult arrives pre-discounted.\"",
        shortDescription: "Flat incoming ego damage reduction.",
        rewardText: function(sk) {
            return `Reward: +4 (+1 per skill level) armor (flat damage reduction) per skill level.`;
        },
        getEffect: function(sk) {
            return { armorFlat: 4 + (sk.level || 0) * 1 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: ${roundNearestDecimals(e.armorFlat || 0, 2)} armor flat`;
        }
    },
    {
        version:0,
        key: "secondWind",
        triggerType: "onTakeDamage",
        name: "Second Wind",
        category: "combat",
        slotCategory: "defense",
        flavorText: "\"I'm not done. I'm just catching my breath in public.\"",
        shortDescription: "Restore Aud once per clone when dropping very low.",
        rewardText: function(sk) {
            return `Reward: restore 30 (+15 per skill level) + 20% (+3% per skill level) of max Audacity when Aud is below 20% (once per clone run).`;
        },
        getEffect: function(sk) {
            const lv = sk.level || 0;
            return {
                restoreAudFlat: 30 + lv * 15,
                restoreAudMaxFraction: 0.20 + lv * 0.03
            };
        },
        effectUiSummary: function(sk, e) {
            const used = !!(data.battle && data.battle.secondWindRestoreUsed);
            const maxAud = (data.battle && data.battle.player && data.battle.player.maxAud) || 0;
            const heal = (e.restoreAudFlat || 0) + (e.restoreAudMaxFraction || 0) * maxAud;
            const pct = roundNearestDecimals((e.restoreAudMaxFraction || 0) * 100, 1);
            return `Current: +${roundNearestDecimals(e.restoreAudFlat || 0, 1)} + ${pct}% max Aud (= ${roundNearestDecimals(heal, 1)}) below 20% (${used ? "used this clone" : "ready"})`;
        }
    },
    {
        version:0,
        key: "stiffUpperLip",
        triggerType: "onTakeDamage",
        name: "Stiff Upper Lip",
        category: "combat",
        slotCategory: "defense",
        flavorText: "\"Keep smiling. They hate that more than the slap.\"",
        shortDescription: "Reduces incoming ego damage while hurt.",
        rewardText: function() {
            return "Reward: While below 50% Audacity, incoming damage multiplied by 1 / (1.2 (+ 0.04 per skill level))";
        },
        getEffect: function(sk) {
            const lv = sk.level || 0;
            return { incomingDamageMultiplier: 1 / (1.2 + lv * 0.04) };
        },
        effectUiSummary: function(sk, e) {
            return `Current: incoming x${roundNearestDecimals(e.incomingDamageMultiplier || 1, 3)} below half Aud`;
        }
    },
    {
        version:0,
        key: "paddingResume",
        triggerType: "onCloneLevel",
        name: "Padding the Resume",
        category: "combat",
        slotCategory: "defense",
        flavorText: "\"Every level is another bullet point. Every bullet point is another reason I'm fine.\"",
        shortDescription: "Bonus max Aud from clone level.",
        rewardText: function(sk) {
            return `Reward: +2 max Aud per clone level per skill level.`;
        },
        getEffect: function(sk) {
            const charLv = (data.battle && data.battle.levelState && data.battle.levelState.level) || 0;
            const perChar = (sk.level || 0) * 2;
            return { audPerCharLevel: perChar, audBonus: perChar * charLv };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.audBonus || 0} max Aud (${e.audPerCharLevel || 0} per clone level)`;
        }
    },
    {
        version:0,
        key: "experienceHog",
        triggerType: "onKill",
        name: "Experience Hog",
        category: "combat",
        slotCategory: "utility",
        flavorText: "\"If there's a lesson here, I'm taking the whole plate.\"",
        shortDescription: "Boosts clone leveling exp.",
        rewardText: function() {
            return "Reward: +20% (+5% per skill level) clone leveling exp.";
        },
        getEffect: function(sk) {
            return { characterExpMultiplier: 1.2 + 0.05 * (sk.level || 0) };
        },
        effectUiSummary: function(sk, e) {
            return `Current: char exp x${roundNearestDecimals(e.characterExpMultiplier || 1, 2)}`;
        }
    },
    {
        version:0,
        key: "studyGroup",
        triggerType: "onCloneLevel",
        name: "Study Group",
        category: "combat",
        slotCategory: "utility",
        flavorText: "\"Your breakthrough is my group project.\"",
        shortDescription: "Increase the exp gain of other skills, gaining exp on clone levels.",
        rewardText: function(sk) {
            return `Reward: +10% (+5% per skill level) exp for every other skill.`;
        },
        getEffect: function(sk) {
            return { otherSkillExpMultiplier: 1.1 + 0.05 * (sk.level || 0) };
        },
        effectUiSummary: function(sk, e) {
            return `Current: x${roundNearestDecimals(e.otherSkillExpMultiplier || 1, 4)} other skills' skill exp`;
        }
    },
    {
        version:0,
        key: "thinIce",
        triggerType: "onTakeDamage",
        name: "Thin Ice",
        category: "combat",
        slotCategory: "offense",
        flavorText: "\"One more comment and we all go through.\"",
        shortDescription: "Gain Fury stacks when you take damage.",
        rewardText: function(sk) {
            return `Reward: each time you take damage, gain 10 (+2 per skill level) Fury stacks.`;
        },
        getEffect: function(sk) {
            return { furyPerLevel: 10 + (sk.level || 0) * 2 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.furyPerLevel || 0} Fury each time you take damage`;
        }
    },
    {
        version:0,
        key: "stoic",
        triggerType: "fullAudPerSecond",
        name: "Stoic",
        category: "combat",
        slotCategory: "defense",
        flavorText: "\"Nothing happened, and I have decided that is the correct amount of feeling.\"",
        shortDescription: "Desensitized stacks while at max Aud.",
        rewardText: function(sk) {
            return `Reward: +1 Desensitized stack lasting 10 + 1s per skill level every 1s while at max Aud.`;
        },
        getEffect: function(sk) {
            return { desensitizedMsPerLevel: 10000 + (sk.level || 0) * 1000 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +1 Desensitized (${round2((e.desensitizedMsPerLevel || 0)/1000)}s) per second at max Aud`;
        }
    },
    {
        version:0,
        key: "hotTake",
        triggerType: "onTakeDamage",
        name: "Hot Take",
        category: "combat",
        slotCategory: "utility",
        flavorText: "\"That was uncalled for, and I will be discussing it at length.\"",
        shortDescription: "Outrage when taking damage.",
        rewardText: function(sk) {
            return `Reward: +1 (+0.25 per skill level) Outrage each time you take damage.`;
        },
        getEffect: function(sk) {
            return { outragePerHit: 1 + (sk.level || 0) * 0.25 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${round2(e.outragePerHit || 0)} Outrage per hit taken`;
        }
    },
    {
        version:0,
        key: "righteousRant",
        triggerType: "movingForwardPerSecond",
        name: "Righteous Rant",
        category: "combat",
        slotCategory: "utility",
        flavorText: "\"The speech writes itself if you just keep walking toward them.\"",
        shortDescription: "Outrage while advancing on the battlefield.",
        rewardText: function(sk) {
            return `Reward: +2 (+0.25 per skill level) Outrage every 1 cumulative second while moving forward.`;
        },
        getEffect: function(sk) {
            return { outragePerSecond: 2 + (sk.level || 0) * 0.25};
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${round2(e.outragePerSecond || 0)} Outrage per 1s spent moving forward`;
        }
    },
    {
        version:0,
        key: "heckled",
        triggerType: "perClosePerSecond",
        name: "Heckled",
        category: "combat",
        slotCategory: "utility",
        flavorText: "\"Say that again. Closer. I dare you.\"",
        shortDescription: "Outrage from intruders closing in.",
        rewardText: function(sk) {
            return `Reward: +0.5 (+0.1 per skill level) Outrage per second per intruder closer than 200 ft.`;
        },
        getEffect: function(sk) {
            return { outragePerEnemy: 0.5 + (sk.level || 0) * 0.1 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${round2(e.outragePerEnemy || 0)} Outrage/s per intruder closer than 200 ft`;
        }
    },
    {
        version:0,
        key: "simmer",
        triggerType: "fullAudPerSecond",
        name: "Simmer",
        category: "combat",
        slotCategory: "utility",
        flavorText: "\"I'm fine. That's what makes it worse.\"",
        shortDescription: "Gain Outrage while at full Audacity.",
        rewardText: function(sk) {
            return `Reward: +2 (+0.25 per skill level) Outrage every 1s while at full Audacity.`;
        },
        getEffect: function(sk) {
            return { outragePerSecond: 2 + (sk.level || 0) * 0.25 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${round2(e.outragePerSecond || 0)} Outrage/s while at full Audacity`;
        }
    },
    {
        version:0,
        key: "sobStory",
        triggerType: "notFullAudPerSecond",
        name: "Sob Story",
        category: "combat",
        slotCategory: "defense",
        flavorText: "\"You wouldn't hit me if you knew what I've been through. Anyway.\"",
        shortDescription: "Gain Fake Tears while Audacity is not full.",
        rewardText: function(sk) {
            return `Reward: +1 (+0.5 per skill level) Fake Tears every 1s while Audacity is not full.`;
        },
        getEffect: function(sk) {
            return { fakeTearsPerSecond: 1 + (sk.level || 0) * 0.5 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${round2(e.fakeTearsPerSecond || 0)} Fake Tears/s while Audacity is not full`;
        }
    },
    {
        version:0,
        key: "stagePresence",
        triggerType: "perVisiblePerSecond",
        name: "Stage Presence",
        category: "combat",
        slotCategory: "defense",
        flavorText: "\"If there's an audience, the tears have somewhere to land.\"",
        shortDescription: "Gain Clout from visible intruders.",
        rewardText: function(sk) {
            return `Reward: +0.5 (+0.25 per skill level) Clout per second per visible intruder.`;
        },
        getEffect: function(sk) {
            return { cloutPerVisible: 0.5 + (sk.level || 0) * 0.25 };
        },
        effectUiSummary: function(sk, e) {
            const vis = (typeof engine !== "undefined" && engine.countVisibleIntruders)
                ? engine.countVisibleIntruders() : 0;
            const per = e.cloutPerVisible || 0;
            return `Current: +${roundNearestDecimals(per, 2)} Clout/s per visible (${roundNearestDecimals(per * vis, 2)}/s from ${vis})`;
        }
    },
    {
        version:0,
        key: "socialArmor",
        triggerType: "perClosePerSecond",
        name: "Social Armor",
        category: "combat",
        slotCategory: "defense",
        flavorText: "\"A crowd is just a very clingy shield.\"",
        shortDescription: "Gain Clout from nearby intruders when taking damage.",
        rewardText: function(sk) {
            return `Reward: +1.5 (+0.25 per skill level) Clout when you are damaged, per intruder closer than 200 ft.`;
        },
        getEffect: function(sk) {
            return { cloutPerCloseEnemy: 1.5 + (sk.level || 0) * 0.25 };
        },
        effectUiSummary: function(sk, e) {
            const close = (typeof engine !== "undefined" && engine.countVisibleIntrudersCloserThan)
                ? engine.countVisibleIntrudersCloserThan(200) : 0;
            const per = e.cloutPerCloseEnemy || 0;
            return `Current: +${roundNearestDecimals(per, 2)} Clout per close enemy (${roundNearestDecimals(per * close, 2)} from ${close})`;
        }
    },
    {
        version:0,
        key: "borrowedGlory",
        triggerType: "onMaxAudIncrease",
        name: "Borrowed Glory",
        category: "combat",
        slotCategory: "defense",
        flavorText: "\"Your growth is my glow-up.\"",
        shortDescription: "Clout when Confidence increases.",
        rewardText: function(sk) {
            return `Reward: +20 (+5 per skill level) Clout whenever Confidence increases.`;
        },
        getEffect: function(sk) {
            return { cloutPerLevel: 20 + (sk.level || 0) * 5 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.cloutPerLevel || 0} Clout when Confidence increases`;
        }
    },
    {
        version:0,
        key: "marathonEgo",
        triggerType: "combatFiveSeconds",
        name: "Marathon Ego",
        category: "combat",
        slotCategory: "offense",
        flavorText: "\"I don't peak early. I peak constantly, then more.\"",
        shortDescription: "More ego damage the longer the clone fight lasts.",
        rewardText: function(sk) {
            return `Reward: +0.6% (+0.2% per skill level) ego damage, per 10 seconds the clone has been fighting.`;
        },
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
        triggerType: "onRepeatHit",
        name: "Closing Argument",
        category: "combat",
        slotCategory: "offense",
        flavorText: "\"Let the record show they were already losing.\"",
        shortDescription: "More ego damage to an intruder you have already attacked.",
        rewardText: function(sk) {
            return `Reward: +20% (+4% per skill level) ego damage against an intruder you have already attacked.`;
        },
        getEffect: function(sk) {
            return { damageBonusFraction: .20 + (sk.level || 0) * 0.04 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${roundNearestDecimals((e.damageBonusFraction || 0) * 100, 1)}% dmg vs already attacked`;
        }
    },
    //scold skills
    {
        version:0,
        key: "alacrity",
        triggerType: "onAttack",
        name: "Alacrity",
        category: "class",
        flavorText: "\"Festina lente.\" (Make haste slowly.) - attributed to Augustus",
        shortDescription: "Quick hands. Reduces slap cooldown.",
        maxLevel: 1000,
        rewardText: function(sk) {
            const cd = gameData.battle.cooldowns;
            const cap = sk.maxLevel !== undefined ? sk.maxLevel : 1000;
            return `Reward: −0.1 ms effective slap cooldown per skill level (floor ${cd.slapFloorMs} ms; Alacrity skill cap ${cap}).`;
        },
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
        triggerType: "onFirstHit",
        name: "Sneak Attack",
        category: "class",
        classKey: "scold",
        flavorText: "\"All warfare is based on deception.\" - Sun Tzu",
        shortDescription: "Scold opener damage bonus on first hit per intruder.",
        rewardText: function(sk) {
            return `Reward: first hit on each intruder deals +10% damage per skill level.`;
        },
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
        triggerType: "onRepeatHit",
        name: "Exploit",
        category: "class",
        classKey: "scold",
        flavorText: "\"Opportunities multiply as they are seized.\" - Sun Tzu",
        shortDescription: "Scold sustained pressure on repeated target hits.",
        rewardText: function(sk) {
            return `Reward: consecutive hits on the same target gain +0.5 base damage per skill level per consecutive step (2nd hit +0.5, 3rd +1, ...).`;
        },
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
        triggerType: "onAttack",
        name: "Precision",
        category: "class",
        classKey: "scold",
        flavorText: "\"Aim small, miss small.\" - traditional marksmanship advice",
        shortDescription: "Scold class skill.",
        rewardText: function(sk) {
            return `Reward: +1% crit chance per skill level (placeholder effect for now).`;
        },
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
        triggerType: "perClosePerSecond",
        name: "Adrenaline",
        category: "class",
        classKey: "condescend",
        flavorText: "\"Crowded rooms make my hands honest.\"",
        shortDescription: "Pressure fighting. Grants Brutality with multiple intruders in slap range.",
        rewardText: function() {
            return "Reward: +1 Brutality per skill level.";
        },
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
        triggerType: "perFarPerSecond",
        name: "Preparation",
        category: "class",
        classKey: "condescend",
        flavorText: "\"By failing to prepare, you are preparing to fail.\" - Benjamin Franklin",
        shortDescription: "Faster slap recharge when not engaged.",
        rewardText: function(sk) {
            return `Reward: +2% slap attack timer recharge rate per skill level while no intruder is in slap range.`;
        },
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
        triggerType: "onTakeDamage",
        name: "Toughness",
        category: "class",
        classKey: "condescend",
        flavorText: "\"Difficulty strengthens the mind, as labor does the body.\" - Seneca",
        shortDescription: "Flat ego damage reduction.",
        rewardText: function(sk) {
            return `Reward: +0.25 armor (flat damage reduction) per skill level.`;
        },
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
        triggerType: "onPowerStrike",
        name: "Cleave",
        category: "class",
        classKey: "condescend",
        flavorText: "\"If you're standing next to the problem, you are the problem.\"",
        shortDescription: "Condescend power strikes splash to adjacent threats.",
        rewardText: function(sk) {
            return `Reward: power strikes deal 10% of dealt damage to adjacent-lane slap intruders and one immediate intruder behind target per skill level.`;
        },
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
        triggerType: "onTakeDamage",
        name: "Thorns",
        category: "class",
        classKey: "condescend",
        flavorText: "\"Whoever digs a pit will fall into it.\" - Ecclesiastes 10:8",
        shortDescription: "Condescend retaliates on slap damage taken.",
        rewardText: function(sk) {
            return `Reward: deal 1 retaliatory damage per skill level to slap attackers.`;
        },
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
        triggerType: "onKill",
        name: "Execute",
        category: "class",
        classKey: "condescend",
        flavorText: "\"Never interrupt your intruder when he is making a mistake.\" - Napoleon Bonaparte",
        shortDescription: "Condescend deals more damage to wounded intruders.",
        rewardText: function(sk) {
            return `Reward: +5% damage per skill level to intruders below 50% Aud.`;
        },
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
        triggerType: "onBlock",
        name: "Second Wind",
        category: "class",
        classKey: "condescend",
        flavorText: "\"Fall seven times, stand up eight.\" - Japanese proverb",
        shortDescription: "Condescend recovers Aud when blocking.",
        rewardText: function(sk) {
            return `Reward: +1 Aud per skill level each time you block.`;
        },
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
        triggerType: "onKillLogOverkill",
        name: "Overkill",
        category: "class",
        classKey: "condescend",
        flavorText: "\"Anything worth doing is worth overdoing.\" - Mick Jagger (attributed)",
        shortDescription: "Condescend finisher rhythm: exp from excess damage; after kills, surge the weapon bar (capped by attack floor).",
        rewardText: function() {
            const cd = gameData.battle.cooldowns;
            return `Reward: after a killing blow, advance the matching attack timer by up to (50 x skill level) ms, but never below ${cd.slapFloorMs} ms between slap attacks or ${cd.sandalFloorMs} ms between sandal attacks (excess bar boost is trimmed).`;
        },
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
        triggerType: "onSandalKill",
        name: "Longshot",
        category: "class",
        classKey: "mock",
        flavorText: "\"The good archer is known not by his arrows, but by his aim.\" - English proverb",
        shortDescription: "Mock sandal finishing and damage scaling.",
        rewardText: function(sk) {
            return `Reward: +1 flat sandal damage per skill level.`;
        },
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
        triggerType: "onSandalUpperHalf",
        name: "Impact",
        category: "class",
        classKey: "mock",
        flavorText: "\"To every action there is always opposed an equal reaction.\" - Isaac Newton",
        shortDescription: "Mock sandal knockback and upper-map precision training.",
        rewardText: function(sk) {
            return `Reward: sandal hits knock intruders back by 0.1s per skill level of their movement speed.`;
        },
        getEffect: function(sk) {
            return { knockbackTravelSeconds: (sk.level || 0) * 0.1 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: knockback ${roundNearestDecimals(e.knockbackTravelSeconds || 0, 2)}x intruder speed`;
        }
    },
    {
        version:0,
        key: "marksmanship",
        triggerType: "onSandalHitNoExp",
        name: "Marksmanship",
        category: "class",
        classKey: "mock",
        flavorText: "\"Practice is the best of all instructors.\" - Publilius Syrus",
        shortDescription: "Mock class skill.",
        rewardText: function(sk) {
            return `Reward: +1% sandal damage per skill level (placeholder effect for now).`;
        },
        getEffect: function(sk) {
            return { placeholderSandalPct: sk.level || 0 };
        },
        effectUiSummary: function(sk, e) {
            return `Current: +${e.placeholderSandalPct || 0}% sandal (placeholder)`;
        }
    },
];

let skillKeysByTrigger = {};
let skills = {
    keysInOrder: SKILL_DEFINITION_ROWS.map(function(r) {
        return r.key;
    }),
    _byKey: (function() {
        const m = {};
        const byTrigger = {};
        const typeNames = Object.keys(SKILL_TRIGGER_TYPES);
        for (let t = 0; t < typeNames.length; t++) {
            byTrigger[typeNames[t]] = [];
        }
        for (let i = 0; i < SKILL_DEFINITION_ROWS.length; i++) {
            const r = SKILL_DEFINITION_ROWS[i];
            const typeName = r.triggerType;
            const typeDef = typeName && SKILL_TRIGGER_TYPES[typeName];
            if (!typeDef) {
                console.error("Skill missing trigger type", r.key, typeName);
                throw new Error("Skill " + r.key + " has unknown triggerType: " + typeName);
            }
            r.initialExpToLevel = typeDef.initialExpToLevel;
            r.initialTalentToLevel = typeDef.initialTalentToLevel;
            r.triggerText = typeDef.triggerText;
            m[r.key] = r;
            byTrigger[typeName].push(r.key);
        }
        for (let u = 0; u < typeNames.length; u++) {
            if (!byTrigger[typeNames[u]].length) {
                console.error("Trigger type has no skills", typeNames[u]);
                throw new Error("Trigger type has no skills: " + typeNames[u]);
            }
        }
        skillKeysByTrigger = byTrigger;
        return m;
    })(),
    keysByTrigger: skillKeysByTrigger,

    /** Multiplier applied per skill level for exp-to-next-level. */
    expToLevelScale: 1.3,
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
    LOADOUT_COUNT: 5,
    STAR_TYPES: ["bronze", "silver", "gold"],

    getDefaultSkillEquip: function() {
        return {
            slots: {
                offense: [null],
                defense: [null],
                utility: [null],
                any: []
            }
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
        delete eq.unequipCharges;
        delete eq.unequipChargesMax;
        delete eq.unequipChargeReadyAt;
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

    countEmptyEquipSlots: function() {
        const eq = skills.ensureSkillEquip();
        if (!eq) {
            return 0;
        }
        let empty = 0;
        for (let c = 0; c < skills.SLOT_COLUMNS.length; c++) {
            const arr = eq.slots[skills.SLOT_COLUMNS[c]] || [];
            for (let i = 0; i < arr.length; i++) {
                if (!arr[i]) {
                    empty++;
                }
            }
        }
        return empty;
    },

    anyEquipped: function(type) {
        const keys = skills.keysByTrigger[type];
        if (!keys) {
            return false;
        }
        for (let i = 0; i < keys.length; i++) {
            if (skills.isSkillEquipped(keys[i])) {
                return true;
            }
        }
        return false;
    },

    /** Compute one trigger amount, then grant it to each equipped skill of that type. */
    fireTrigger: function(type, ctx) {
        const def = SKILL_TRIGGER_TYPES[type];
        const keys = skills.keysByTrigger[type];
        if (!def || !keys) {
            console.error("fireTrigger unknown type", type);
            throw new Error("Unknown trigger type: " + type);
        }
        if (!skills.anyEquipped(type)) {
            return;
        }
        const amount = def.exp(ctx || {});
        if (!(amount > 0)) {
            return;
        }
        const exclude = ctx && ctx.excludeKey;
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (key === exclude) {
                continue;
            }
            if (!skills.isSkillEquipped(key)) {
                continue;
            }
            engine.addSkillExp(key, amount);
        }
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
        if (skill.key === "validation" && data.battle) {
            data.battle.validationAudEarned = 0;
        }
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

    /**
     * Equip a library skill into a slot, or move it there if it is already equipped.
     * An occupant is unequipped (level reset, stars returned). A moved skill keeps level and stars.
     */
    placeLibrarySkillOnSlot: function(skillKey, column, index) {
        const eq = skills.ensureSkillEquip();
        if (!eq || !skillKey) {
            return { ok: false, reason: "invalid" };
        }
        if (!skills.canPlaceSkillInSlot(skillKey, column, index)) {
            return { ok: false, reason: "incompatible" };
        }
        const current = skills.findSkillEquipSlot(skillKey);
        if (current && current.column === column && current.index === index) {
            return { ok: true, reason: "same" };
        }
        const occupant = eq.slots[column][index];
        if (occupant) {
            const removed = skills.unequipSkillFromSlot(column, index);
            if (!removed.ok) {
                return removed;
            }
        }
        if (current) {
            eq.slots[current.column][current.index] = null;
        }
        eq.slots[column][index] = skillKey;
        return { ok: true, moved: !!current };
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

    unequipSkillFromSlot: function(column, index) {
        const eq = skills.ensureSkillEquip();
        if (!eq) {
            return { ok: false, reason: "invalid" };
        }
        const arr = eq.slots[column];
        if (!arr || index < 0 || index >= arr.length || !arr[index]) {
            return { ok: false, reason: "empty" };
        }
        const skillKey = arr[index];
        const skill = data.progress.skills[skillKey];
        arr[index] = null;
        if (skill) {
            skills.returnSkillStarsToPool(skill);
            skills.resetSkillLevelOnUnequip(skill);
        }
        return { ok: true, skillKey: skillKey };
    },

    unequipSkillByKey: function(skillKey) {
        const loc = skills.findSkillEquipSlot(skillKey);
        if (!loc) {
            return { ok: false, reason: "notequipped" };
        }
        return skills.unequipSkillFromSlot(loc.column, loc.index);
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

    getSkillDisplayName: function(skillKey) {
        const skill = data.progress && data.progress.skills && data.progress.skills[skillKey];
        if (skill && skill.name) {
            return skill.name;
        }
        const def = skills._byKey[skillKey];
        return (def && def.name) || skillKey;
    },

    ensureSkillLoadouts: function() {
        if (!data.progress) {
            return null;
        }
        if (!Array.isArray(data.progress.skillLoadouts)) {
            data.progress.skillLoadouts = [];
        }
        const list = data.progress.skillLoadouts;
        while (list.length < skills.LOADOUT_COUNT) {
            list.push(null);
        }
        if (list.length > skills.LOADOUT_COUNT) {
            list.length = skills.LOADOUT_COUNT;
        }
        for (let i = 0; i < list.length; i++) {
            const entry = list[i];
            if (entry == null) {
                list[i] = null;
                continue;
            }
            if (typeof entry !== "object" || !entry.slots || typeof entry.slots !== "object") {
                list[i] = null;
            }
        }
        let idx = data.progress.selectedSkillLoadout;
        if (typeof idx !== "number" || !isFinite(idx)) {
            data.progress.selectedSkillLoadout = null;
        } else {
            idx = Math.floor(idx);
            data.progress.selectedSkillLoadout = (idx >= 0 && idx < skills.LOADOUT_COUNT) ? idx : null;
        }
        return list;
    },

    getSelectedSkillLoadoutIndex: function() {
        skills.ensureSkillLoadouts();
        const idx = data.progress && data.progress.selectedSkillLoadout;
        if (typeof idx !== "number" || idx < 0 || idx >= skills.LOADOUT_COUNT) {
            return null;
        }
        return idx;
    },

    copyStarFlags: function(stars) {
        return {
            bronze: !!(stars && stars.bronze),
            silver: !!(stars && stars.silver),
            gold: !!(stars && stars.gold)
        };
    },

    captureSkillLoadout: function() {
        const eq = skills.ensureSkillEquip();
        const slots = {};
        if (!eq) {
            return { slots: slots };
        }
        for (let c = 0; c < skills.SLOT_COLUMNS.length; c++) {
            const col = skills.SLOT_COLUMNS[c];
            const arr = eq.slots[col] || [];
            const saved = [];
            for (let i = 0; i < arr.length; i++) {
                const key = arr[i];
                if (!key) {
                    saved.push(null);
                    continue;
                }
                const sk = data.progress.skills && data.progress.skills[key];
                saved.push({
                    key: key,
                    stars: skills.copyStarFlags(sk && sk.stars)
                });
            }
            slots[col] = saved;
        }
        return { slots: slots };
    },

    saveSelectedSkillLoadout: function() {
        const list = skills.ensureSkillLoadouts();
        const idx = skills.getSelectedSkillLoadoutIndex();
        if (!list || idx === null) {
            return;
        }
        list[idx] = skills.captureSkillLoadout();
    },

    clearSelectedSkillLoadout: function() {
        const list = skills.ensureSkillLoadouts();
        const idx = skills.getSelectedSkillLoadoutIndex();
        if (!list || idx === null) {
            return;
        }
        list[idx] = null;
    },

    canUseLoadoutSkill: function(skillKey, column) {
        if (!skillKey || !skills._byKey[skillKey]) {
            return false;
        }
        if (!data.progress || !data.progress.skills || !data.progress.skills[skillKey]) {
            return false;
        }
        const archives = data.progress.base && data.progress.base.scrollArchives;
        const unlocked = archives && archives.unlockedSkills;
        if (!unlocked || !unlocked[skillKey]) {
            return false;
        }
        return skills.canPlaceSkillInColumn(skillKey, column);
    },

    /** Compact a saved loadout into the slots that exist now. */
    buildLoadoutPlacement: function(loadout) {
        const eq = skills.ensureSkillEquip();
        const inLoad = {};
        const starByKey = {};
        const columns = {};
        const savedSlots = (loadout && loadout.slots) || {};
        for (let c = 0; c < skills.SLOT_COLUMNS.length; c++) {
            const col = skills.SLOT_COLUMNS[c];
            const saved = Array.isArray(savedSlots[col]) ? savedSlots[col] : [];
            for (let i = 0; i < saved.length; i++) {
                const entry = saved[i];
                if (!entry || !entry.key || inLoad[entry.key]) {
                    continue;
                }
                inLoad[entry.key] = true;
                starByKey[entry.key] = skills.copyStarFlags(entry.stars);
            }
        }
        const seen = {};
        for (let c = 0; c < skills.SLOT_COLUMNS.length; c++) {
            const col = skills.SLOT_COLUMNS[c];
            const saved = Array.isArray(savedSlots[col]) ? savedSlots[col] : [];
            const built = [];
            for (let i = 0; i < saved.length; i++) {
                const entry = saved[i];
                if (!entry || !entry.key) {
                    built.push(null);
                    continue;
                }
                const key = entry.key;
                if (seen[key] || !skills.canUseLoadoutSkill(key, col)) {
                    continue;
                }
                seen[key] = true;
                built.push(key);
            }
            const limit = (eq && eq.slots[col]) ? eq.slots[col].length : 0;
            const placed = built.slice(0, limit);
            while (placed.length < limit) {
                placed.push(null);
            }
            columns[col] = placed;
        }
        return { columns: columns, inLoad: inLoad, starByKey: starByKey };
    },

    loadoutHasSkills: function(loadout) {
        const savedSlots = (loadout && loadout.slots) || {};
        for (let c = 0; c < skills.SLOT_COLUMNS.length; c++) {
            const saved = savedSlots[skills.SLOT_COLUMNS[c]];
            if (!Array.isArray(saved)) {
                continue;
            }
            for (let i = 0; i < saved.length; i++) {
                if (saved[i] && saved[i].key) {
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * Skills and stars Load would remove for this slot.
     * Returns null when nothing should be marked (no selection, or an empty slot).
     */
    predictLoadoutRemovals: function(index) {
        const list = skills.ensureSkillLoadouts();
        if (!list || typeof index !== "number" || index < 0 || index >= skills.LOADOUT_COUNT) {
            return null;
        }
        const loadout = list[index];
        if (!skills.loadoutHasSkills(loadout)) {
            return null;
        }
        const placement = skills.buildLoadoutPlacement(loadout);
        const placed = {};
        for (let c = 0; c < skills.SLOT_COLUMNS.length; c++) {
            const col = skills.SLOT_COLUMNS[c];
            const arr = placement.columns[col] || [];
            for (let i = 0; i < arr.length; i++) {
                if (arr[i]) {
                    placed[arr[i]] = true;
                }
            }
        }
        const pool = {
            bronze: (data.progress.stars && data.progress.stars.bronze) || 0,
            silver: (data.progress.stars && data.progress.stars.silver) || 0,
            gold: (data.progress.stars && data.progress.stars.gold) || 0
        };
        const sks = data.progress.skills || {};
        const skillKeys = Object.keys(sks);
        for (let i = 0; i < skillKeys.length; i++) {
            const stars = sks[skillKeys[i]] && sks[skillKeys[i]].stars;
            if (!stars) {
                continue;
            }
            if (stars.bronze) pool.bronze++;
            if (stars.silver) pool.silver++;
            if (stars.gold) pool.gold++;
        }
        const keptStars = {};
        let maxRows = 0;
        for (let c = 0; c < skills.SLOT_COLUMNS.length; c++) {
            const len = (placement.columns[skills.SLOT_COLUMNS[c]] || []).length;
            if (len > maxRows) {
                maxRows = len;
            }
        }
        for (let row = 0; row < maxRows; row++) {
            for (let c = 0; c < skills.SLOT_COLUMNS.length; c++) {
                const col = skills.SLOT_COLUMNS[c];
                const key = placement.columns[col] && placement.columns[col][row];
                if (!key) {
                    continue;
                }
                const wanted = placement.starByKey[key] || {};
                if (!keptStars[key]) {
                    keptStars[key] = { bronze: false, silver: false, gold: false };
                }
                for (let s = 0; s < skills.STAR_TYPES.length; s++) {
                    const starType = skills.STAR_TYPES[s];
                    if (!wanted[starType] || pool[starType] <= 0) {
                        continue;
                    }
                    pool[starType]--;
                    keptStars[key][starType] = true;
                }
            }
        }
        const removeSkills = {};
        const removeStars = {};
        const eq = skills.ensureSkillEquip();
        if (eq) {
            for (let c = 0; c < skills.SLOT_COLUMNS.length; c++) {
                const arr = eq.slots[skills.SLOT_COLUMNS[c]] || [];
                for (let i = 0; i < arr.length; i++) {
                    const key = arr[i];
                    if (!key) {
                        continue;
                    }
                    const stars = (sks[key] && sks[key].stars) || {};
                    if (!placed[key]) {
                        removeSkills[key] = true;
                    }
                    for (let s = 0; s < skills.STAR_TYPES.length; s++) {
                        const starType = skills.STAR_TYPES[s];
                        if (!stars[starType]) {
                            continue;
                        }
                        if (!placed[key] || !keptStars[key] || !keptStars[key][starType]) {
                            if (!removeStars[key]) {
                                removeStars[key] = {};
                            }
                            removeStars[key][starType] = true;
                        }
                    }
                }
            }
        }
        return { skills: removeSkills, stars: removeStars };
    },

    returnAllAssignedStarsToPool: function() {
        const sks = data.progress && data.progress.skills;
        if (!sks) {
            return;
        }
        const keys = Object.keys(sks);
        for (let i = 0; i < keys.length; i++) {
            skills.returnSkillStarsToPool(sks[keys[i]]);
        }
    },

    applySkillLoadout: function(index) {
        const list = skills.ensureSkillLoadouts();
        const eq = skills.ensureSkillEquip();
        if (!list || !eq) {
            return;
        }
        if (index < 0 || index >= skills.LOADOUT_COUNT) {
            return;
        }
        const placement = skills.buildLoadoutPlacement(list[index]);
        const equipped = skills.getEquippedSkillKeys();
        for (let i = 0; i < equipped.length; i++) {
            const key = equipped[i];
            if (!placement.inLoad[key]) {
                skills.unequipSkillByKey(key);
            }
        }
        for (let c = 0; c < skills.SLOT_COLUMNS.length; c++) {
            const col = skills.SLOT_COLUMNS[c];
            const arr = eq.slots[col];
            for (let i = 0; i < arr.length; i++) {
                arr[i] = null;
            }
        }
        for (let c = 0; c < skills.SLOT_COLUMNS.length; c++) {
            const col = skills.SLOT_COLUMNS[c];
            const arr = eq.slots[col];
            const placed = placement.columns[col] || [];
            for (let i = 0; i < arr.length; i++) {
                arr[i] = placed[i] || null;
            }
        }
        skills.returnAllAssignedStarsToPool();
        let maxRows = 0;
        for (let c = 0; c < skills.SLOT_COLUMNS.length; c++) {
            const len = (eq.slots[skills.SLOT_COLUMNS[c]] || []).length;
            if (len > maxRows) {
                maxRows = len;
            }
        }
        for (let row = 0; row < maxRows; row++) {
            for (let c = 0; c < skills.SLOT_COLUMNS.length; c++) {
                const col = skills.SLOT_COLUMNS[c];
                const key = eq.slots[col] && eq.slots[col][row];
                if (!key) {
                    continue;
                }
                const wanted = placement.starByKey[key] || {};
                const sk = data.progress.skills && data.progress.skills[key];
                if (!sk) {
                    continue;
                }
                if (!sk.stars) {
                    sk.stars = { bronze: false, silver: false, gold: false };
                }
                for (let s = 0; s < skills.STAR_TYPES.length; s++) {
                    const starType = skills.STAR_TYPES[s];
                    if (!wanted[starType]) {
                        continue;
                    }
                    if ((data.progress.stars[starType] || 0) <= 0) {
                        continue;
                    }
                    data.progress.stars[starType]--;
                    sk.stars[starType] = true;
                }
            }
        }
        const selected = data.progress.selectedEquippedSkillKey;
        if (selected && !skills.isSkillEquipped(selected)) {
            data.progress.selectedEquippedSkillKey = "";
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
        "Desensitized": "Incoming damage is multiplied by 1 / (1 + 0.03 x stacks). Each stack expires on its own timer.",
        "Outrage": "When Outrage is 10 or higher, your next slap or sandal spends 10. That attack's cooldown is 75% of normal, and when it lands you gain 25% of the coins that intruder would drop. That coin gain counts for other skills that trigger when coins are gained.",
        "Malice": "Builds a Malice counter, leading to 10% more damage on the next strike, increasing +10% per 20 stacks. Malice is capped at 10 + Okami's level x 5.",
        "Fake Tears": "Incoming damage is divided by 1 + 0.05 x floor(Fake Tears). Each attack that costs Audacity removes half of floor(Fake Tears), rounded up. Fractions are not spent. Fake Tears is capped at 5 + floor(Orb level / 2).",
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
        // Multiplicative star scaling: each star x1.5 (0→1, 1→1.5, 2→2.25, 3→3.375).
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

    /** Multiplier applied to every skill's exp gain except Echo Chamber's own. Level 0 → x1. */
    getEchoChamberExpMultiplierForOthers: function() {
        const e = skills.getSkillEffect("echoChamber");
        return e.otherSkillExpMultiplier !== undefined ? e.otherSkillExpMultiplier : 1;
    },

    /** Multiplier from Study Group for every skill except Study Group itself. Level 0 → x1. */
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
    },

    /** Sum of talent levels on skills sitting in this equip column. */
    columnTalentTotal: function(column) {
        const eq = skills.ensureSkillEquip();
        if (!eq || !eq.slots || !Array.isArray(eq.slots[column])) {
            return 0;
        }
        const arr = eq.slots[column];
        const sks = (data.progress && data.progress.skills) || {};
        let sum = 0;
        for (let i = 0; i < arr.length; i++) {
            const key = arr[i];
            if (!key) {
                continue;
            }
            sum += Math.floor((sks[key] && sks[key].talentLevel) || 0);
        }
        return sum;
    },

    /** F(1)=1, F(2)=1, F(3)=2, F(4)=3, F(5)=5, ... */
    fibonacci: function(n) {
        const k = Math.floor(n);
        if (k <= 0) {
            return 0;
        }
        if (k <= 2) {
            return 1;
        }
        let a = 1;
        let b = 1;
        for (let i = 3; i <= k; i++) {
            const c = a + b;
            a = b;
            b = c;
        }
        return b;
    },

    /** Talent total required to reach 1-based milestone n. Milestone 1 is 50. */
    columnMilestoneThreshold: function(n) {
        const k = Math.floor(n);
        if (k < 1) {
            return 0;
        }
        return skills.fibonacci(k + 1) * 50;
    },

    /** Highest milestone whose threshold is <= total. 0 below 50. */
    columnMilestoneIndexForTotal: function(totalTalent) {
        const total = Math.max(0, Math.floor(totalTalent || 0));
        let index = 0;
        for (let n = 1; n < 80; n++) {
            if (total < skills.columnMilestoneThreshold(n)) {
                break;
            }
            index = n;
        }
        return index;
    },

    /** nth triangular number. Index 0 is 0. 1, 3, 6, 10, 15, ... */
    columnMilestoneValue: function(index) {
        const n = Math.floor(index || 0);
        if (n <= 0) {
            return 0;
        }
        return n * (n + 1) / 2;
    },

    /** Column-facing reward for a raw triangular milestone value. */
    columnScaledReward: function(column, raw) {
        const v = raw || 0;
        if (column === "defense") {
            return v * 3;
        }
        if (column === "any") {
            return v * 2;
        }
        if (column === "utility") {
            return v * 3;
        }
        return v;
    },

    columnRewardValueForTotal: function(column, totalTalent) {
        const index = skills.columnMilestoneIndexForTotal(totalTalent);
        return skills.columnScaledReward(column, skills.columnMilestoneValue(index));
    },

    /**
     * Current column reward from equipped talent.
     * Offense: base slap. Defense: base Audacity. Utility: percent coins. Any: skill-exp percent.
     */
    columnReward: function(column) {
        const total = skills.columnTalentTotal(column);
        const index = skills.columnMilestoneIndexForTotal(total);
        const nextIndex = index + 1;
        return {
            total: total,
            index: index,
            value: skills.columnScaledReward(column, skills.columnMilestoneValue(index)),
            nextAt: skills.columnMilestoneThreshold(nextIndex),
            nextValue: skills.columnScaledReward(column, skills.columnMilestoneValue(nextIndex))
        };
    },

    /** Echo Chamber x Study Group x Any-column skill exp. Any applies to every skill. */
    equippedSkillExpMultiplier: function(skillKey) {
        const anyPct = skills.columnReward("any").value || 0;
        return skills.getOtherSkillExpMultiplier(skillKey) * (1 + anyPct / 100);
    }
};
