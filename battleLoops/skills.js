// All skill definitions, runtime state shape, exp/talent formulas, and UI copy in one place.

const SKILL_DEFINITION_ROWS = [
    {
        key: "recovery",
        name: "Recovery",
        category: "combat",
        unlockCostCoins: 10,
        researchRequired: 30,
        shortDescription: "Regeneration. Restores HP every second while the battle runs.",
        flavorText: "“The art of medicine consists in amusing the patient while nature cures the disease.” — Voltaire",
        guestArchetype: "Field Medic",
        guestRarity: 7,
        affectedStat: "none",
        initialExpToLevel: 10,
        rewardText: function() {
            return "Reward: +(0.1 × skill level) HP per second from Recovery (tick once per full second; HP only applies when Recovery level is above 0).";
        },
        triggerText: "Trigger: once each full second survived while the battle is running (skill exp always; HP only if Recovery level > 0).",
        getEffect: function(sk) {
            return { recoveryHpPerSec: (sk.level || 0) * 0.1 };
        }
    },
    {
        key: "force",
        name: "Force",
        category: "combat",
        unlockCostCoins: 10,
        researchRequired: 30,
        initialExpToLevel: 5,
        shortDescription: "Attack practice. +0.25 base damage per level (before Strength multiplier).",
        flavorText: "“Give me a lever long enough and a fulcrum on which to place it, and I shall move the world.” — Archimedes",
        guestArchetype: "Veteran Duelist",
        guestRarity: 7,
        affectedStat: "none",
        rewardText: function() {
            return "Reward: +(0.25 × skill level) base slap damage before the Strength multiplier.";
        },
        triggerText: "Trigger: each slap or sandal attack hit.",
        getEffect: function(sk) {
            return { slapFlatBeforeStr: (sk.level || 0) * 0.25, forcePerLevel: 0.25 };
        }
    },
    {
        key: "fortitude",
        name: "Fortitude",
        category: "combat",
        unlockCostCoins: 10,
        researchRequired: 30,
        initialExpToLevel: 5,
        shortDescription: "Fortitude training. Reduces incoming slap damage.",
        flavorText: "“You have power over your mind—not outside events. Realize this, and you will find strength.” — Marcus Aurelius",
        guestArchetype: "Shield Bearer",
        guestRarity: 8,
        affectedStat: "none",
        rewardText: function() {
            return "Reward: multiply incoming slap damage by 1 / (1 + 0.02 × Fortitude skill level).";
        },
        triggerText: "Trigger: each time an intruder damages you in slap.",
        getEffect: function(sk) {
            const lv = sk.level || 0;
            return { fortitudeIncomingDamageMultiplier: 1 / (1 + lv * 0.02) };
        }
    },
    {
        key: "wisdom",
        name: "Wisdom",
        category: "combat",
        unlockCostCoins: 20,
        researchRequired: 90,
        initialExpToLevel: 3,
        initialTalentToLevel: 3,
        shortDescription: "Battle insight. Boosts character leveling exp.",
        flavorText: "“The unexamined life is not worth living.” — Socrates",
        guestArchetype: "Battle Scholar",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function() {
            return "Reward: multiply character leveling exp by 1.1 per Wisdom skill level (compounding).";
        },
        triggerText: "Trigger: each intruder removal.",
        getEffect: function(sk) {
            return { wisdomCharacterExpMultiplier: Math.pow(1.1, sk.level || 0) };
        }
    },
    {
        key: "greed",
        name: "Greed",
        category: "combat",
        unlockCostCoins: 30,
        researchRequired: 150,
        initialExpToLevel: 3,
        initialTalentToLevel: 3,
        shortDescription: "Treasure sense. Boosts coins gain on kills.",
        flavorText: "“He who knows that enough is enough will always have enough.” — Lao Tzu",
        guestArchetype: "Treasure Broker",
        guestRarity: 9,
        affectedStat: "none",
        rewardText: function() {
            return "Reward: multiply coins from kills by 1.1 per Greed skill level (compounding).";
        },
        triggerText: "Trigger: each intruder removal.",
        getEffect: function(sk) {
            return { greedKillCoinsMultiplier: Math.pow(1.1, sk.level || 0) };
        }
    },
    {
        key: "scavenger",
        name: "Scavenger",
        category: "combat",
        unlockCostCoins: 20,
        researchRequired: 90,
        initialExpToLevel: 10,
        shortDescription: "Looting knack. Adds extra base coins per intruder removal.",
        flavorText: "“Waste not, want not.” — English proverb",
        guestArchetype: "Scrap Mockery",
        guestRarity: 5,
        affectedStat: "none",
        rewardText: function() {
            return "Reward: +1 base coins per skill level on each intruder removal. Applies before other multipliers.";
        },
        triggerText: "Trigger: gain sqrt(coins gained) exp on killing a unit.",
        getEffect: function(sk) {
            return { scavengerKillCoinsFlatPerKill: sk.level || 0 };
        }
    },
    {
        key: "endurance",
        name: "Endurance",
        category: "combat",
        unlockCostCoins: 30,
        researchRequired: 150,
        initialExpToLevel: 10,
        shortDescription: "Resolve. Raises base HP as the skill levels; gains exp every 10s from current HP.",
        flavorText: "“If you're going through hell, keep going.” — Winston Churchill",
        guestArchetype: "Frontline Captain",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function() {
            return "Reward: base and current HP increase by 4 * Endurance level";
        },
        triggerText: "Trigger: every 10 seconds while the battle is running — exp gained equals √(current HP) (square root of your HP at the tick, before Recovery regen on that same second).",
        getEffect: function(sk) {
            return { enduranceBaseHpInnerBonus: sk.level * 4 || 0 };
        }
    },
    {
        key: "tenacity",
        name: "Tenacity",
        category: "combat",
        unlockCostCoins: 30,
        researchRequired: 150,
        initialExpToLevel: 10,
        shortDescription: "Grit under pressure. Bonus HP while hurt; gains exp each second below half HP.",
        flavorText: "“Courage is not having the strength to go on; it is going on when you don't have the strength.” — Theodore Roosevelt",
        guestArchetype: "Iron Will",
        guestRarity: 5,
        affectedStat: "none",
        rewardText: function() {
            return "Reward: base HP increase by 4 * Tenacity level. Current HP increase by 8 * Tenacity level.";
        },
        triggerText: "Trigger: each second while HP is below half.",
        getEffect: function(sk) {
            const lv = sk.level || 0;
            return { tenacityHpInnerBonus: lv * 4 };
        }
    },
    {
        key: "adaptation",
        name: "Adaptation",
        category: "combat",
        unlockCostCoins: 30,
        researchRequired: 150,
        initialExpToLevel: 5,
        shortDescription: "Body and mind adjust to milestones: +1 Str and +1 Con each time this skill levels.",
        flavorText: "“We are what we repeatedly do. Excellence, then, is not an act, but a habit.” — Aristotle",
        guestArchetype: "Drill Instructor",
        guestRarity: 4,
        affectedStat: "none",
        rewardText: function() {
            return "Reward: +1 Strength and +1 Constitution each time Adaptation gains a skill level (not each character level).";
        },
        triggerText: "Trigger: each time your character level increases.",
        getEffect: function(sk) {
            const lv = sk.level || 0;
            return { adaptationBonusStr: lv, adaptationBonusCon: lv };
        }
    },
    {
        key: "integration",
        name: "Integration",
        category: "combat",
        unlockCostCoins: 40,
        researchRequired: 200,
        initialExpToLevel: 8,
        shortDescription: "Cross-training. Other skills' exp gains multiply; grows when other combat or class skills level.",
        flavorText: "“The whole is other than the sum of the parts.” — Kurt Koffka (paraphrased)",
        guestArchetype: "Synthesis Coach",
        guestRarity: 5,
        affectedStat: "none",
        rewardText: function() {
            return "Reward: multiply skill exp gains for every other skill by 1.1 per Integration skill level (compounding).";
        },
        triggerText: "Trigger: each time a different Combat or Class skill (not Integration) gains a skill level.",
        getEffect: function(sk) {
            return { integrationOtherSkillExpMult: Math.pow(1.1, sk.level || 0) };
        }
    },
    //scold skills
    {
        key: "alacrity",
        name: "Alacrity",
        category: "class",
        classKey: "scold",
        unlockCostCoins: 30,
        researchRequired: 300,
        initialExpToLevel: 5,
        shortDescription: "Quick hands. Reduces slap/sandal cooldowns.",
        flavorText: "“Festina lente.” (Make haste slowly.) — attributed to Augustus",
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
        }
    },
    {
        key: "sneak_attack",
        name: "Sneak Attack",
        category: "class",
        classKey: "scold",
        unlockCostCoins: 200,
        researchRequired: 2000,
        initialExpToLevel: 5,
        shortDescription: "Scold opener damage bonus on first hit per intruder.",
        flavorText: "“All warfare is based on deception.” — Sun Tzu",
        guestArchetype: "Back Alley Teacher",
        guestRarity: 7,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: first hit on each intruder deals +${(sk.level || 0) * 10}% damage.`;
        },
        triggerText: "Trigger: each first hit you deal to an intruder.",
        getEffect: function(sk) {
            return { sneakFirstHitDamageBonusFraction: (sk.level || 0) * 0.1 };
        }
    },
    {
        key: "exploit",
        name: "Exploit",
        category: "class",
        classKey: "scold",
        unlockCostCoins: 200,
        researchRequired: 2000,
        initialExpToLevel: 5,
        shortDescription: "Scold sustained pressure on repeated target hits.",
        flavorText: "“Opportunities multiply as they are seized.” — Sun Tzu",
        guestArchetype: "Knife Expert",
        guestRarity: 7,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: consecutive hits on the same target gain +${sk.level || 0} damage per consecutive step (2nd hit +${sk.level || 0}, 3rd +${(sk.level || 0) * 2}, ...).`;
        },
        triggerText: "Trigger: hitting an intruder you've hit before.",
        getEffect: function(sk) {
            return { exploitFlatDamagePerConsecutiveStep: sk.level || 0 };
        }
    },
    {
        key: "precision_scold",
        name: "Precision",
        category: "class",
        classKey: "scold",
        unlockCostCoins: 200,
        researchRequired: 2000,
        initialExpToLevel: 5,
        shortDescription: "Scold class skill.",
        flavorText: "“Aim small, miss small.” — traditional marksmanship advice",
        guestArchetype: "Scold Tutor",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${sk.level}% crit chance (placeholder effect for now).`;
        },
        triggerText: "Trigger: each slap or sandal attack hit.",
        getEffect: function(sk) {
            return { precisionPlaceholderCritPercent: sk.level || 0 };
        }
    },
    //condescension skills
    {
        key: "adrenaline",
        name: "Adrenaline",
        category: "class",
        classKey: "condescension",
        unlockCostCoins: 30,
        researchRequired: 300,
        initialExpToLevel: 5,
        shortDescription: "Pressure fighting. Grants Strength with crowding.",
        flavorText: "“In the midst of chaos, there is also opportunity.” — Sun Tzu",
        guestArchetype: "Pit Fighter",
        guestRarity: 8,
        affectedStat: "str",
        rewardText: function() {
            return "Reward: +1 Strength each time Adrenaline gains a skill level.";
        },
        triggerText: "Trigger: each second per intruder in slap range beyond the first.",
        getEffect: function(sk) {
            return { adrenalineStrFromSkillLevels: sk.level || 0 };
        }
    },
    {
        key: "preparation",
        name: "Preparation",
        category: "class",
        classKey: "condescension",
        unlockCostCoins: 30,
        researchRequired: 300,
        initialExpToLevel: 5,
        shortDescription: "Poise. Faster slap recharge when not engaged.",
        flavorText: "“By failing to prepare, you are preparing to fail.” — Benjamin Franklin",
        guestArchetype: "Tactician",
        guestRarity: 7,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +2% slap attack timer recharge rate per skill level while no intruder is in slap range.`;
        },
        triggerText: "Trigger: continuously while no intruder is in slap range (per second).",
        getEffect: function(sk) {
            return { preparationIdleRechargeFraction: (sk.level || 0) * 0.02 };
        }
    },
    {
        key: "toughness_condescension",
        name: "Toughness",
        category: "class",
        classKey: "condescension",
        unlockCostCoins: 200,
        researchRequired: 2000,
        initialExpToLevel: 5,
        shortDescription: "Condescension class skill.",
        flavorText: "“Difficulty strengthens the mind, as labor does the body.” — Seneca",
        guestArchetype: "Condescension Mentor",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${round2((sk.level || 0) * 0.25)} armor (flat damage reduction).`;
        },
        triggerText: "Trigger: each time an intruder damages you in slap.",
        getEffect: function(sk) {
            return { toughnessArmorFlat: (sk.level || 0) * 0.25 };
        }
    },
    {
        key: "cleave",
        name: "Cleave",
        category: "class",
        classKey: "condescension",
        unlockCostCoins: 200,
        researchRequired: 2000,
        initialExpToLevel: 5,
        shortDescription: "Condescension power strikes splash to adjacent threats.",
        flavorText: "“As iron sharpens iron, so one person sharpens another.” — Proverbs 27:17",
        guestArchetype: "Greatblade Master",
        guestRarity: 8,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: power strikes deal ${round2((sk.level || 0) * 10)}% of dealt damage to adjacent-lane slap enemies and one immediate intruder behind target.`;
        },
        triggerText: "Trigger: each power strike.",
        getEffect: function(sk) {
            return { cleaveSplashFraction: (sk.level || 0) * 0.1 };
        }
    },
    {
        key: "thorns",
        name: "Thorns",
        category: "class",
        classKey: "condescension",
        unlockCostCoins: 200,
        researchRequired: 2000,
        initialExpToLevel: 5,
        shortDescription: "Condescension retaliates on slap damage taken.",
        flavorText: "“Whoever digs a pit will fall into it.” — Ecclesiastes 10:8",
        guestArchetype: "Spiked Defender",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: deal ${sk.level || 0} retaliatory damage to slap attackers.`;
        },
        triggerText: "Trigger: each time you take non-zero slap damage.",
        getEffect: function(sk) {
            return { thornsRetaliationDamage: sk.level || 0 };
        }
    },
    {
        key: "execute",
        name: "Execute",
        category: "class",
        classKey: "condescension",
        unlockCostCoins: 200,
        researchRequired: 2000,
        initialExpToLevel: 5,
        shortDescription: "Condescension deals more damage to wounded enemies.",
        flavorText: "“Never interrupt your intruder when he is making a mistake.” — Napoleon Bonaparte",
        guestArchetype: "Finisher Captain",
        guestRarity: 7,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${round2((sk.level || 0) * 5)}% damage to enemies below 50% HP.`;
        },
        triggerText: "Trigger: dealing damage to enemies below 50% HP.",
        getEffect: function(sk) {
            return { executeLowHpBonusFraction: (sk.level || 0) * 0.05 };
        }
    },
    {
        key: "second_wind",
        name: "Second Wind",
        category: "class",
        classKey: "condescension",
        unlockCostCoins: 200,
        researchRequired: 2000,
        initialExpToLevel: 5,
        shortDescription: "Condescension recovers HP when blocking.",
        flavorText: "“Fall seven times, stand up eight.” — Japanese proverb",
        guestArchetype: "Battle Survivor",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${sk.level || 0} HP each time you block.`;
        },
        triggerText: "Trigger: each successful block.",
        getEffect: function(sk) {
            return { secondWindBlockHeal: sk.level || 0 };
        }
    },
    {
        key: "overkill",
        name: "Overkill",
        category: "class",
        classKey: "condescension",
        unlockCostCoins: 200,
        researchRequired: 2000,
        initialExpToLevel: 5,
        shortDescription: "Condescension finisher rhythm: exp from excess damage; after kills, surge the weapon bar (capped by attack floor).",
        flavorText: "“Anything worth doing is worth overdoing.” — Mick Jagger (attributed)",
        guestArchetype: "Executioner",
        guestRarity: 7,
        affectedStat: "none",
        rewardText: function() {
            const cd = gameData.battle.cooldowns;
            return `Reward: after a killing blow, advance the matching attack timer by up to (50 × Overkill skill level) ms, but never below ${cd.slapFloorMs} ms between slap attacks or ${cd.sandalFloorMs} ms between sandal attacks (excess bar boost is trimmed).`;
        },
        triggerText: "Trigger: exp = √(damage beyond HP needed to intruder removal) on your killing blow; attack speed surge on intruder removal.",
        getEffect: function(sk) {
            return { __OVERKILL__BarBonusPerLevelMs: 50 * (sk.level || 0) };
        }
    },
    {
        key: "longshot",
        name: "Longshot",
        category: "class",
        classKey: "mockery",
        unlockCostCoins: 200,
        researchRequired: 2000,
        initialExpToLevel: 5,
        shortDescription: "Mockery sandal finishing and damage scaling.",
        flavorText: "“The good archer is known not by his arrows, but by his aim.” — English proverb",
        guestArchetype: "Farshot Scout",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${sk.level || 0} flat sandal damage.`;
        },
        triggerText: "Trigger: remove an intruder with a sandal attack.",
        getEffect: function(sk) {
            return { longshotSandalFlatDamage: sk.level || 0 };
        }
    },
    {
        key: "impact",
        name: "Impact",
        category: "class",
        classKey: "mockery",
        unlockCostCoins: 200,
        researchRequired: 2000,
        initialExpToLevel: 5,
        shortDescription: "Mockery sandal knockback and upper-map precision training.",
        flavorText: "“To every action there is always opposed an equal reaction.” — Isaac Newton",
        guestArchetype: "Siege Archer",
        guestRarity: 8,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: sandal hits knock enemies back by ${(sk.level || 0) * 0.1}s of their movement speed.`;
        },
        triggerText: "Trigger: sandal hit on an intruder in the upper half of the battlefield.",
        getEffect: function(sk) {
            return { impactKnockbackTravelSeconds: (sk.level || 0) * 0.1 };
        }
    },
    {
        key: "marksmanship_mockery",
        name: "Marksmanship",
        category: "class",
        classKey: "mockery",
        unlockCostCoins: 200,
        researchRequired: 2000,
        initialExpToLevel: 5,
        shortDescription: "Mockery class skill.",
        flavorText: "“Practice is the best of all instructors.” — Publilius Syrus",
        guestArchetype: "Mockery Guide",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${sk.level}% sandal damage (placeholder effect for now).`;
        },
        triggerText: "Trigger: each sandal attack hit.",
        getEffect: function(sk) {
            return { marksmanshipPlaceholderSandalPct: sk.level || 0 };
        }
    },
    //resort skills
    {
        key: "interfere",
        name: "Interfere",
        category: "resort",
        unlockCostCoins: 30,
        researchRequired: 300,
        initialExpToLevel: 5,
        shortDescription: "Improves manual resort action speed and rewards.",
        flavorText: "“Plans are nothing; planning is everything.” — Dwight D. Eisenhower",
        guestArchetype: "Busy Foreman",
        guestRarity: 4,
        affectedStat: "none",
        rewardText: function(sk) {
            const safeLv = Math.min(99, sk.level || 0);
            const cdSpeed = 1 / (1 - (safeLv / 100));
            const rewardBonus = (sk.talentLevel || 0) * 10;
            return `Reward: manual action cooldown speed ×${cdSpeed.toFixed(2)}; +${rewardBonus}% manual action reward from talent.`;
        },
        triggerText: "Trigger: each time you press a manual resort action.",
        getEffect: function(sk) {
            const lv = Math.min(99, sk.level || 0);
            return {
                interfereManualCdSpeedMult: 1 / (1 - lv / 100),
                interfereManualRewardMult: 1 + ((sk.talentLevel || 0) * 0.1)
            };
        }
    },
    {
        key: "gossip",
        name: "Gossip",
        category: "resort",
        unlockCostCoins: 100,
        researchRequired: 1000,
        initialExpToLevel: 5,
        shortDescription: "Speeds guest chats and amplifies tips gained.",
        flavorText: "“Speech is silver, silence is coinsen.” — English proverb",
        guestArchetype: "Resort Rumormonger",
        guestRarity: 3,
        affectedStat: "none",
        rewardText: function(sk) {
            const safeLv = Math.min(99, sk.level || 0);
            const chatSpeed = 1 / (1 - (safeLv / 100));
            const tipBonus = (sk.talentLevel || 0) * 10;
            return `Reward: chat speed ×${chatSpeed.toFixed(2)}; +${tipBonus}% tip gain from talent.`;
        },
        triggerText: "Trigger: each completed Inn guest chat.",
        getEffect: function(sk) {
            const lv = Math.min(99, sk.level || 0);
            return {
                gossipChatSpeedMult: 1 / (1 - lv / 100),
                gossipTipBonusFromTalent: (sk.talentLevel || 0) * 0.1
            };
        }
    },
    //foraging skills
    {
        key: "technique",
        name: "Technique",
        category: "foraging",
        unlockCostCoins: 60,
        researchRequired: 600,
        initialExpToLevel: 5,
        shortDescription: "Improve harvest hits.",
        flavorText: "“The gem cannot be polished without friction, nor man perfected without trials.” — Chinese proverb",
        guestArchetype: "Old Lumberjack",
        guestRarity: 6,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${sk.level || 0} harvest damage.`;
        },
        triggerText: "Trigger: each harvest hit.",
        getEffect: function(sk) {
            return { techniqueHarvestDamageFlat: sk.level || 0 };
        }
    },
    {
        key: "quick_rest",
        name: "Quick Rest",
        category: "foraging",
        unlockCostCoins: 60,
        researchRequired: 600,
        initialExpToLevel: 5,
        shortDescription: "Recover stamina from successful gathering.",
        flavorText: "“Take rest; a field that has rested gives a bountiful crop.” — Ovid",
        guestArchetype: "Trail Forager",
        guestRarity: 5,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${round2((sk.level || 0) * 0.25)} stamina per gathered resource.`;
        },
        triggerText: "Trigger: each gathered resource.",
        getEffect: function(sk) {
            return { quickRestStaminaPerGather: (sk.level || 0) * 0.25 };
        }
    },
    {
        key: "breathing",
        name: "Breathing",
        category: "foraging",
        unlockCostCoins: 60,
        researchRequired: 600,
        initialExpToLevel: 5,
        shortDescription: "Increase stamina capacity over time.",
        flavorText: "“Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.” — Thích Nhất Hạnh",
        guestArchetype: "Mountain Hermit",
        guestRarity: 4,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: +${(sk.level || 0) * 2} base stamina (max and current).`;
        },
        triggerText: "Trigger: each second while foraging.",
        getEffect: function(sk) {
            return { breathingStaminaCapacityBonus: (sk.level || 0) * 2 };
        }
    },
    {
        key: "planning",
        name: "Planning",
        category: "foraging",
        unlockCostCoins: 60,
        researchRequired: 600,
        initialExpToLevel: 5,
        shortDescription: "Ambush preparation for first strikes.",
        flavorText: "“Victorious condescensions win first and then go to war, while defeated condescensions go to war first and then seek to win.” — Sun Tzu",
        guestArchetype: "Pathfinder",
        guestRarity: 5,
        affectedStat: "none",
        rewardText: function(sk) {
            return `Reward: first hit on each unit gets +${(sk.level || 0) * 10}% damage.`;
        },
        triggerText: "Trigger: each 50 px moved while foraging.",
        getEffect: function(sk) {
            return { planningFirstHitDamageBonusFraction: (sk.level || 0) * 0.1 };
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
                coins: false
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
        if (cat === "resort") {
            return;
        }
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
        if (category === "class" && ["condescension", "scold", "mockery"].indexOf(currentClass) < 0) {
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
        const e = skills.getSkillEffect(skillKey, sk);
        const cd = gameData.battle.cooldowns;
        switch (skillKey) {
            case "recovery":
                return `Current: +${roundNearestDecimals(e.recoveryHpPerSec || 0, 2).toFixed(2)} HP/s`;
            case "force":
                return `Current: +${roundNearestDecimals(e.slapFlatBeforeStr || 0, 2)} slap (before Str)`;
            case "fortitude":
                return `Current: incoming ×${roundNearestDecimals(e.fortitudeIncomingDamageMultiplier || 1, 3)}`;
            case "wisdom":
                return `Current: char exp ×${roundNearestDecimals(e.wisdomCharacterExpMultiplier || 1, 2)}`;
            case "greed":
                return `Current: intruder removal coins ×${roundNearestDecimals(e.greedKillCoinsMultiplier || 1, 2)}`;
            case "endurance":
                return `Current: +${e.enduranceBaseHpInnerBonus || 0} base HP inner`;
            case "tenacity": {
                const b = e.tenacityHpInnerBonus || 0;
                return `Current: +${b} base inner, +${2 * b} current (× Con mult)`;
            }
            case "adaptation":
                return `Current: +${e.adaptationBonusStr || 0} Str, +${e.adaptationBonusCon || 0} Con from Adaptation level-ups`;
            case "integration":
                return `Current: ×${roundNearestDecimals(e.integrationOtherSkillExpMult || 1, 4)} other skills' skill exp`;
            case "scavenger":
                return `Current: +${e.scavengerKillCoinsFlatPerKill || 0} base coins per intruder removal`;
            case "alacrity": {
                const lv = e.alacrityEffectiveLevel || 0;
                return `Current: −${lv * cd.alacritySlapReductionPerLevelMs} ms slap / −${lv * cd.alacritySandalReductionPerLevelMs} ms sandal`;
            }
            case "sneak_attack":
                return `Current: first hit +${roundNearestDecimals((e.sneakFirstHitDamageBonusFraction || 0) * 100, 1)}%`;
            case "exploit":
                return `Current: +${e.exploitFlatDamagePerConsecutiveStep || 0} dmg per repeat-hit step`;
            case "precision_scold":
                return `Current: +${e.precisionPlaceholderCritPercent || 0}% crit (placeholder)`;
            case "adrenaline":
                return `Current: +${e.adrenalineStrFromSkillLevels || 0} Str from this skill`;
            case "preparation":
                return `Current: +${roundNearestDecimals((e.preparationIdleRechargeFraction || 0) * 100, 1)}% slap recharge when idle`;
            case "toughness_condescension":
                return `Current: ${roundNearestDecimals(e.toughnessArmorFlat || 0, 2)} armor flat`;
            case "cleave":
                return `Current: splash ${roundNearestDecimals((e.cleaveSplashFraction || 0) * 100, 1)}% of strike`;
            case "thorns":
                return `Current: ${e.thornsRetaliationDamage || 0} thorns`;
            case "execute":
                return `Current: +${roundNearestDecimals((e.executeLowHpBonusFraction || 0) * 100, 1)}% vs under 50% HP`;
            case "second_wind":
                return `Current: +${e.secondWindBlockHeal || 0} HP on block`;
            case "overkill":
                return `Current: up to ${e.__OVERKILL__BarBonusPerLevelMs || 0} ms bar surge after kills (trimmed by cooldown floor)`;
            case "longshot":
                return `Current: +${e.longshotSandalFlatDamage || 0} sandal damage`;
            case "impact":
                return `Current: knockback ${roundNearestDecimals(e.impactKnockbackTravelSeconds || 0, 2)}× intruder speed`;
            case "marksmanship_mockery":
                return `Current: +${e.marksmanshipPlaceholderSandalPct || 0}% sandal (placeholder)`;
            case "interfere":
                return `Current: manual CD ×${roundNearestDecimals(e.interfereManualCdSpeedMult || 1, 2)}; reward ×${roundNearestDecimals(e.interfereManualRewardMult || 1, 2)}`;
            case "gossip":
                return `Current: chat ×${roundNearestDecimals(e.gossipChatSpeedMult || 1, 2)}; tips +${roundNearestDecimals((e.gossipTipBonusFromTalent || 0) * 100, 0)}% from talent`;
            case "technique":
                return `Current: +${e.techniqueHarvestDamageFlat || 0} harvest damage`;
            case "quick_rest":
                return `Current: +${roundNearestDecimals(e.quickRestStaminaPerGather || 0, 2)} stamina per gather`;
            case "breathing":
                return `Current: +${e.breathingStaminaCapacityBonus || 0} stamina cap`;
            case "planning":
                return `Current: first hit +${roundNearestDecimals((e.planningFirstHitDamageBonusFraction || 0) * 100, 1)}%`;
            default:
                return "";
        }
    },
    getSkillShortDescription: function(skillKey) {
        return skills._byKey[skillKey].shortDescription;
    },
    getSkillFlavorText: function(skillKey) {
        const d = skills._byKey[skillKey];
        return (d && d.flavorText) ? d.flavorText : "";
    },
    getSkillUnlockCostCoins: function(skillKey) {
        return skills._byKey[skillKey].unlockCostCoins;
    },
    getSkillresearchRequired: function(skillKey) {
        return skills._byKey[skillKey].researchRequired;
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
        if (stars.coins) starCount++;
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

    /** Multiplier applied to every skill's exp gain except Integration's own. Level 0 → ×1. */
    getIntegrationExpMultiplierForOthers: function() {
        if (!skills.isSkillUnlocked("integration")) {
            return 1;
        }
        const sk = data.progress.skills.integration;
        if (!sk || (sk.level || 0) <= 0) {
            return 1;
        }
        return Math.pow(1.1, sk.level);
    }
};
