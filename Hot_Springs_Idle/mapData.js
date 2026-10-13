// Map list / zone configs - loaded after maps.js defines `mapData` helpers (`createMap`, `createZone`).
mapData.getDefaultMaps = function() {
    return [
        mapData.createMap({
            version:0,
            key: "map_1",
            name: "Gossip Spreads",
            description: "The news of travelers finding peace in the mountains is starting to be gossiped about, and the Okami must make the the early but unprepared opportunists run away in shame.",
            seed: 5557,
            baseDifficulty: 1,
            zones: [
                mapData.createZone(6, "scoundrel", 0, 325, 1, 1.6, 6),
                mapData.createZone(5, "scoundrel", 33000, 250, 1.5, 1.5, 9),
                mapData.createZone(5, "scoundrel", 60000, 250, 2, 1, 12),
            ],
            zoneShards: [
                { key: "force", gain: 1, chance: 0.04, cap: 10 },
                { key: "nickelAndDime", gain: 1, chance: 0.04, cap: 10 },
                { key: "selfAffirmations", gain: 1, chance: 0.04, cap: 10 }
            ],
            forageZones: [
                mapData.createForageZone(1, "tree", 200, 0, 10, 1, "logs", 1),
                mapData.createForageZone(2, "tree", 300, 1, 20, 1, "logs", 1.2)
            ]
        }),
        mapData.createMap({
            version: 0,
            key: "map_2",
            name: "Protecting Modesty",
            description: "Word has spread that there is a beautiful woman protecting an unknown village, and the Okami must slap some sense into the groups of curious scoundrels.",
            seed: 424242,
            baseDifficulty: 1.3,
            unlocksAfterMapKey: "map_1",
            zones: [
                mapData.createZone(5, "scoundrel", 0, 120, 0.8, 1, 8),
                mapData.createZone(6, "scoundrel", 13000, 120, 1, 1.25, 9),
                mapData.createZone(7, "scoundrel", 34000, 200, 1.2, 1, 10),
                mapData.createZone(4, "scoundrel", 40000, 320, 1.5, 1.25, 13),
                mapData.createZone(4, "scoundrel", 65000, 50, 1.8, 1, 15),
            ],
            zoneShards: [
                { key: "corneredEgo", gain: 1, chance: 0.02, cap: 10 },
                { key: "insultFatigue", gain: 1, chance: 0.02, cap: 10 },
                { key: "mainCharacter", gain: 1, chance: 0.02, cap: 10 }
            ],
            forageZones: [
                mapData.createForageZone(10, "bush", 165, 0, 5, 1, "lumber", 1),
                mapData.createForageZone(6, "ore_vein", 185, 0, 9, 1, "ironOre", 1.3)
            ]
        }),
        mapData.createMap({
            version: 0,
            key: "map_3",
            name: "Leering Intruders",
            description: "Rumors of a hotspring have brought both scoundrels and lechers, looking to peep in and ruin the peace. The Okami will have them run away in embarrasment.",
            seed: 6001,
            baseDifficulty: 1.6,
            unlocksAfterMapKey: "map_2",
            zones: [
                mapData.createZone(4, "scoundrel", 0, 300, 1, 1, 14),
                mapData.createZone(4, "lecher", 500, 550, 1, 1.25, 16),
                mapData.createZone(4, "scoundrel", 21000, 250, 1.5, 1.25, 20),
                mapData.createZone(5, "lecher", 38000, 400, 1.6, 0.75, 24),
                mapData.createZone(7, "scoundrel", 40000, 270, 2, 1, 22),
            ],
            zoneShards: [
                { key: "aboveItAll", gain: 1, chance: 0.01, cap: 10 },
                { key: "hindsight", gain: 1, chance: 0.01, cap: 10 },
                { key: "shameless", gain: 1, chance: 0.01, cap: 10 }
            ],
            forageZones: [
                mapData.createForageZone(6, "ore_vein", 185, 0, 9, 1, "ironOre", 1.3)
            ]
        }),
        mapData.createMap({
            version: 0,
            key: "map_4",
            name: "Muse-Seekers",
            description: "Artists seeking muses have heard rumors of beauties in the mist. They will have shame after the Okami has finished with them.",
            seed: 7777,
            baseDifficulty: 2.2,
            unlocksAfterMapKey: "map_3",
            zones: [
                mapData.createZone(6, "lecher", 0, 150, 1, 1, 20),
                mapData.createZone(2, "scoundrel", 2000, 600, 1.4, 1.25, 25),
                mapData.createZone(6, "lecher", 22000, 225, 1.4, 1, 30),
                mapData.createZone(3, "scoundrel", 24000, 500, 1.6, 1.25, 35),
                mapData.createZone(6, "lecher", 52000, 200, 1.8, 1.25, 40),
                mapData.createZone(2, "scoundrel", 56000, 400, 2, 1, 40),
            ],
            zoneShards: [
                { key: "grudge", gain: 1, chance: 0.005, cap: 10 },
                { key: "seethe", gain: 1, chance: 0.005, cap: 10 },
                { key: "brokenRecord", gain: 1, chance: 0.005, cap: 10 }
            ]
        }),
        mapData.createMap({
            version: 0,
            key: "map_5",
            name: "Courtesan Chasers",
            description: "A few big shot adventurers have heard of the hotspring. They want to see if any beauties are for hire. Slap them away.",
            seed: 9371,
            baseDifficulty: 3,
            unlocksAfterMapKey: "map_4",
            zones: [
                mapData.createZone(3, "scoundrel", 0, 400, 1.4, 2, 50),
                mapData.createZone(1, "lecher", 1000, 200, 1.4, 1, 50),
                mapData.createZone(2, "scoundrel", 24000, 300, 1.8, 2, 70),
                mapData.createZone(1, "lecher", 25000, 200, 1.8, 1, 70),
                mapData.createZone(2, "scoundrel", 36000, 300, 2.2, 2, 90),
                mapData.createZone(1, "lecher", 37000, 200, 2.2, 1, 90),
                mapData.createZone(2, "scoundrel", 48000, 300, 2.6, 2, 110),
                mapData.createZone(1, "lecher", 49000, 200, 2.6, 1, 110),
            ],
            zoneShards: [
                { key: "extortion", gain: 1, chance: 0.005, cap: 10 },
                { key: "bitterRivalry", gain: 1, chance: 0.005, cap: 10 },
                { key: "shockValue", gain: 1, chance: 0.005, cap: 10 }
            ]
        }),
        mapData.createMap({
            version: 0,
            key: "map_6",
            name: "Romance Novelists",
            description: "Masses of novelists are determined in their pursuit of finding inspiration from the truth of the rumor's surrounding the hotspring. The Okami must fill their hearts with shame for their vanity.",
            seed: 9944,
            baseDifficulty: 3,
            unlocksAfterMapKey: "map_5",
            zones: [
                mapData.createZone(5, "scoundrel", 0, 100, 1, 1, 30),
                mapData.createZone(6, "scoundrel", 12000, 100, 1.3, 1, 36),
                mapData.createZone(7, "scoundrel", 24000, 100, 1.6, 0.75, 42),
                mapData.createZone(4, "scoundrel", 42000, 75, 2, 1.25, 46),
                mapData.createZone(7, "scoundrel", 50000, 100, 2.2, 1, 54),
            ],
            zoneShards: [
                { key: "adaptation", gain: 1, chance: 0.00125, cap: 10 },
                { key: "savageLessons", gain: 1, chance: 0.00125, cap: 10 },
                { key: "validation", gain: 1, chance: 0.00125, cap: 10 }
            ]
        }),
        mapData.createMap({
            version: 0,
            key: "map_7",
            name: "The Gawk Squad",
            description: "A gang known for forming small groups and catcalling everyone walking by has found a new target. The Okami will stand in their way.",
            seed: 15003,
            baseDifficulty: 3.5,
            unlocksAfterMapKey: "map_6",
            zones: [
                mapData.createZone(4, "scoundrel", 0, 150, 1, 1, 40),
                mapData.createZone(2, "lecher", 2000, 300, 1, 1, 40),
                mapData.createZone(5, "scoundrel", 22000, 125, 1.3, 1, 55),
                mapData.createZone(1, "lecher", 23000, 50, 1.3, 1, 55),
                mapData.createZone(4, "scoundrel", 42000, 150, 1.6, 1, 70),
                mapData.createZone(3, "lecher", 44000, 150, 1.6, 1, 70),
                mapData.createZone(4, "scoundrel", 60000, 150, 2, 1, 85),
                mapData.createZone(2, "lecher", 62000, 300, 2, 1, 85),
            ],
            zoneShards: [
                { key: "echoChamber", gain: 1, chance: 0.000625, cap: 10 },
                { key: "narcissism", gain: 1, chance: 0.000625, cap: 10 },
                { key: "temper", gain: 1, chance: 0.000625, cap: 10 }
            ]
        }),
        mapData.createMap({
            version: 0,
            key: "map_8",
            name: "Sketch Artists",
            description: "They don't want to touch, only look; their gazes still make the guests uncomfortable. The Okami will show them the error of their ways.",
            seed: 21888,
            baseDifficulty: 4,
            unlocksAfterMapKey: "map_7",
            zones: [
                mapData.createZone(4, "lecher", 0, 200, 1, 1, 45),
                mapData.createZone(5, "lecher", 10000, 200, 1.3, 1, 60),
                mapData.createZone(6, "lecher", 20000, 200, 1.6, 1, 75),
                mapData.createZone(5, "lecher", 34000, 200, 1.9, 1, 90),
                mapData.createZone(6, "lecher", 48000, 200, 2.2, 1, 105),
            ],
            zoneShards: [
                { key: "applyTearDrops", gain: 1, chance: 0.0005, cap: 10 },
                { key: "crowdWork", gain: 1, chance: 0.0005, cap: 10 },
                { key: "walkingItOff", gain: 1, chance: 0.0005, cap: 10 }
            ]
        }),
        mapData.createMap({
            version: 0,
            key: "map_9",
            name: "Fedora Tippers",
            description: "They tip their hats when they wink and leer, but the illusion of chivalry does not fool the Okami.",
            seed: 21888,
            baseDifficulty: 6,
            unlocksAfterMapKey: "map_8",
            zones: [
                mapData.createZone(4, "scoundrel", 0, 175, 1, 1.25, 60),
                mapData.createZone(2, "lecher", 5000, 100, 1.3, 0.75, 75),
                mapData.createZone(4, "scoundrel", 16000, 250, 1.5, 1, 90),
                mapData.createZone(5, "scoundrel", 30000, 300, 1.6, 1, 105),
                mapData.createZone(2, "lecher", 34000, 200, 1.8, 0.75, 120),
                mapData.createZone(5, "scoundrel", 60000, 150, 2, 1, 135),
                mapData.createZone(1, "lecher", 62000, 200, 2, 0.75, 150),
            ],
            zoneShards: [
                { key: "publicApology", gain: 1, chance: 0.0004, cap: 10 },
                { key: "secondWind", gain: 1, chance: 0.0004, cap: 10 },
                { key: "slowBurn", gain: 1, chance: 0.0004, cap: 10 }
            ]
        }),
        mapData.createMap({
            version: 0,
            key: "map_10",
            name: "Catcallers",
            description: "Seeking to whistle at the rumored beauties in the mist, they will take a good beating before giving up.",
            seed: 21888,
            baseDifficulty: 10,
            unlocksAfterMapKey: "map_9",
            zones: [
                mapData.createZone(3, "scoundrel", 0, 100, 1, 1.5, 140),
                mapData.createZone(3, "lecher", 12000, 100, 1.3, 1.25, 160),
                mapData.createZone(3, "scoundrel", 24000, 100, 1.6, 1.5, 180),
                mapData.createZone(3, "lecher", 36000, 100, 1.8, 1.25, 200),
                mapData.createZone(3, "scoundrel", 48000, 100, 2.1, 1.5, 220),
            ],
            zoneShards: [
                { key: "experienceHog", gain: 1, chance: 0.0003, cap: 10 },
                { key: "socialArmor", gain: 1, chance: 0.0003, cap: 10 },
                { key: "closingArgument", gain: 1, chance: 0.0003, cap: 10 }
            ]
        })

        //gropers - 1 scoundrel lots of lechers 
        
        // mapData.createMap({
        //     key: "map_condescend_1",
        //     name: "Shieldwall Gauntlet",
        //     seed: 900001,
        //     baseDifficulty: 1.4,
        //     requiredClassKey: "condescend",
        //     zones: [
        //         mapData.createZone(28, "scoundrel", 0, 780, 0.9, 1, 22, { key: "aboveItAll", gain: 1, chance: 0.006, cap: 24 }),
        //         mapData.createZone(34, "scoundrel", 9000, 845, 1.0, 1, 30, { key: "toughness_condescend", gain: 1, chance: 0.005, cap: 28 }),
        //         mapData.createZone(40, "scoundrel", 20000, 910, 1.1, 1, 40, { key: "second_wind", gain: 1, chance: 0.004, cap: 30 })
        //     ]
        // }),
        // mapData.createMap({
        //     key: "map_scold_1",
        //     name: "Silent Crossfire",
        //     seed: 900002,
        //     baseDifficulty: 1.45,
        //     requiredClassKey: "scold",
        //     zones: [
        //         mapData.createZone(16, "lecher", 0, 780, 1.0, 1, 22),
        //         mapData.createZone(22, "lecher", 10000, 845, 1.1, 1, 32),
        //         mapData.createZone(28, "lecher", 21000, 910, 1.2, 1, 44)
        //     ]
        // }),
        // mapData.createMap({
        //     key: "map_mock_1",
        //     name: "Colossus Trail",
        //     seed: 900003,
        //     baseDifficulty: 2.1,
        //     requiredClassKey: "mock",
        //     zones: [
        //         mapData.createZone(4, "scoundrel", 0, 780, 2.2, 1, 26),
        //         mapData.createZone(5, "scoundrel", 10000, 910, 2.4, 1, 36),
        //         mapData.createZone(6, "scoundrel", 23000, 975, 2.7, 1, 52)
        //     ]
        // })
    ];
};

/** Must match the first map in `getDefaultMaps` (used for new save `currentMapKey`). */
mapData.defaultStartingMapKey = function() {
    const maps = mapData.getDefaultMaps();
    return maps.length && maps[0].key ? maps[0].key : "map_1";
};

/** Class-specific “challenge” maps have `requiredClassKey` set. */
mapData.isChallengeMap = function(mapDef) {
    return !!(mapDef && mapDef.requiredClassKey);
};

/**
 * Map is playable when class requirements pass and any `unlocksAfterMapKey` prerequisite has a bronze star.
 * Maps with no `unlocksAfterMapKey` are available immediately (subject to class gate for challenges).
 */
mapData.isMapUnlocked = function(mapDef, progress) {
    if (!mapDef || !progress) {
        return false;
    }
    const req = mapDef.requiredClassKey || "";
    const cls = progress.currentClassKey || "none";
    if (req && req !== cls) {
        return false;
    }
    const afterKey = mapDef.unlocksAfterMapKey || "";
    if (!afterKey) {
        return true;
    }
    const prevStars = (progress.mapStars && progress.mapStars[afterKey]) || {};
    return !!prevStars.bronze;
};

/** Base soft-cap value for a zone skillShard. */
mapData.getSkillShardCap = function(sh) {
    if (!sh) {
        return 1;
    }
    return Math.max(1, Math.floor(sh.cap !== undefined ? sh.cap : 1));
};

/**
 * Soft-cap tier for `found` shards with base cap C.
 * Thresholds at C, 3C, 7C, ... = C*(2^(k+1)-1); chance is base/5^k in tier k.
 */
mapData.getShardSoftCapTier = function(found, baseCap) {
    const C = Math.max(1, baseCap || 1);
    const f = Math.max(0, found || 0);
    let k = 0;
    while (C * (Math.pow(2, k + 1) - 1) <= f) {
        k++;
    }
    return k;
};

mapData.getShardSoftCapNextThreshold = function(found, baseCap) {
    const C = Math.max(1, baseCap || 1);
    const k = mapData.getShardSoftCapTier(found, C);
    return C * (Math.pow(2, k + 1) - 1);
};

mapData.getShardSoftCapChance = function(baseChance, found, baseCap) {
    const k = mapData.getShardSoftCapTier(found, baseCap);
    return (baseChance || 0) / Math.pow(5, k);
};

/** Shard loot tier multiplier from map star cycle (bronze/silver/gold). */
mapData.getShardLootTierMultiplier = function(mapTier) {
    const tier = mapTier || 0;
    return tier >= 2 ? 10 : (tier >= 1 ? 3 : 1);
};

/** Display line for wave info / travel map shard rows. */
mapData.formatShardInfoLine = function(sh, tierMult, lootMult) {
    if (!sh || !sh.key) {
        return "";
    }
    if (!skills.isSkillResearchComplete(sh.key)) {
        return "??? Shards";
    }
    const def = skills._byKey[sh.key];
    const nm = def && def.name ? def.name : sh.key;
    const sk = data.progress.skills[sh.key];
    const found = sk && sk.shards !== undefined ? sk.shards : 0;
    const baseCap = mapData.getSkillShardCap(sh);
    const next = mapData.getShardSoftCapNextThreshold(found, baseCap);
    const softChance = mapData.getShardSoftCapChance(sh.chance || 0, found, baseCap);
    const p = Math.min(0.999, softChance * (tierMult || 1) * (lootMult || 1));
    const chancePct = round1(p * 100);
    return `${nm} Shards ${found}/${next}, ${chancePct}%`;
};

/** Per-zone shard summary for travel cards; includes soft-cap progress and effective loot chance. */
mapData.getMapShardSummaryText = function(mapDef, progressSkills, lootChanceMult) {
    if (!mapDef || !lootChanceMult) {
        return "";
    }
    const parts = [];
    const tierMult = 1;
    const zoneShards = mapDef.zoneShards || [];
    for (let si = 0; si < zoneShards.length; si++) {
        const sh = zoneShards[si];
        if (!sh || !sh.key) {
            continue;
        }
        parts.push(mapData.formatShardInfoLine(sh, tierMult, lootChanceMult));
    }
    if (mapDef.zones) {
        for (let i = 0; i < mapDef.zones.length; i++) {
            const sh = mapDef.zones[i].skillShard;
            if (!sh || !sh.key) {
                continue;
            }
            const line = mapData.formatShardInfoLine(sh, tierMult, lootChanceMult);
            if (line) {
                parts.push(line + " wave " + (i + 1));
            }
        }
    }
    return parts.join(" · ");
};
