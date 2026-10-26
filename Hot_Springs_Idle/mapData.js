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
            shardDropAmount: 1
        }),
        mapData.createMap({
            version: 0,
            key: "map_2",
            name: "Protecting Modesty",
            description: "Word has spread that there is a beautiful woman protecting an unknown village, and the Okami must slap some sense into the groups of curious scoundrels.",
            seed: 424242,
            baseDifficulty: 1.4,
            unlocksAfterMapKey: "map_1",
            zones: [
                mapData.createZone(5, "scoundrel", 0, 120, 0.8, 1, 8),
                mapData.createZone(6, "scoundrel", 13000, 120, 1, 1.25, 9),
                mapData.createZone(7, "scoundrel", 34000, 200, 1.2, 1, 10),
                mapData.createZone(4, "scoundrel", 40000, 320, 1.5, 1.25, 13),
                mapData.createZone(4, "scoundrel", 65000, 50, 1.8, 1, 15),
            ],
            shardDropAmount: 2
        }),
        mapData.createMap({
            version: 0,
            key: "map_3",
            name: "Leering Intruders",
            description: "Rumors of a hotspring have brought both scoundrels and lechers, looking to peep in and ruin the peace. The Okami will have them run away in embarrasment.",
            seed: 6001,
            baseDifficulty: 1.8,
            unlocksAfterMapKey: "map_2",
            zones: [
                mapData.createZone(4, "scoundrel", 0, 300, 1, 1, 14),
                mapData.createZone(4, "lecher", 500, 550, 1, 1.25, 16),
                mapData.createZone(4, "scoundrel", 21000, 250, 1.5, 1.25, 20),
                mapData.createZone(5, "lecher", 38000, 400, 1.6, 0.75, 24),
                mapData.createZone(7, "scoundrel", 40000, 270, 2, 1, 22),
            ],
            shardDropAmount: 3
        }),
        mapData.createMap({
            version: 0,
            key: "map_4",
            name: "Muse-Seekers",
            description: "Artists seeking muses have heard rumors of beauties in the mist. They will have shame after the Okami has finished with them.",
            seed: 7777,
            baseDifficulty: 2.5,
            unlocksAfterMapKey: "map_3",
            zones: [
                mapData.createZone(6, "lecher", 0, 150, 1, 1, 20),
                mapData.createZone(2, "scoundrel", 2000, 600, 1.4, 1.25, 25),
                mapData.createZone(6, "lecher", 22000, 225, 1.4, 1, 30),
                mapData.createZone(3, "scoundrel", 24000, 500, 1.6, 1.25, 35),
                mapData.createZone(6, "lecher", 52000, 200, 1.8, 1.25, 40),
                mapData.createZone(2, "scoundrel", 56000, 400, 2, 1, 40),
            ],
            shardDropAmount: 5
        }),
        mapData.createMap({
            version: 0,
            key: "map_5",
            name: "Courtesan Chasers",
            description: "A few big shot adventurers have heard of the hotspring. They want to see if any beauties are for hire. Slap them away.",
            seed: 9371,
            baseDifficulty: 4,
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
            shardDropAmount: 8
        }),
        mapData.createMap({
            version: 0,
            key: "map_6",
            name: "Romance Novelists",
            description: "Masses of novelists are determined in their pursuit of finding inspiration from the truth of the rumor's surrounding the hotspring. The Okami must fill their hearts with shame for their vanity.",
            seed: 9944,
            baseDifficulty: 4.5,
            unlocksAfterMapKey: "map_5",
            zones: [
                mapData.createZone(5, "scoundrel", 0, 100, 1, 1, 30),
                mapData.createZone(6, "scoundrel", 12000, 100, 1.3, 1, 36),
                mapData.createZone(7, "scoundrel", 24000, 100, 1.6, 0.75, 42),
                mapData.createZone(4, "scoundrel", 42000, 75, 2, 1.25, 46),
                mapData.createZone(7, "scoundrel", 50000, 100, 2.2, 1, 54),
            ],
            shardDropAmount: 13
        }),
        mapData.createMap({
            version: 0,
            key: "map_7",
            name: "The Gawk Squad",
            description: "A gang known for forming small groups and catcalling everyone walking by has found a new target. The Okami will stand in their way.",
            seed: 15003,
            baseDifficulty: 6,
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
            shardDropAmount: 20
        }),
        mapData.createMap({
            version: 0,
            key: "map_8",
            name: "Sketch Artists",
            description: "They don't want to touch, only look; their gazes still make the guests uncomfortable. The Okami will show them the error of their ways.",
            seed: 21888,
            baseDifficulty: 7.5,
            unlocksAfterMapKey: "map_7",
            zones: [
                mapData.createZone(4, "lecher", 0, 200, 1, 1, 45),
                mapData.createZone(5, "lecher", 10000, 200, 1.3, 1, 60),
                mapData.createZone(6, "lecher", 20000, 200, 1.6, 1, 75),
                mapData.createZone(5, "lecher", 34000, 200, 1.9, 1, 90),
                mapData.createZone(6, "lecher", 48000, 200, 2.2, 1, 105),
            ],
            shardDropAmount: 30
        }),
        mapData.createMap({
            version: 0,
            key: "map_9",
            name: "Fedora Tippers",
            description: "They tip their hats when they wink and leer, but the illusion of chivalry does not fool the Okami.",
            seed: 21888,
            baseDifficulty: 10,
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
            shardDropAmount: 50
        }),
        mapData.createMap({
            version: 0,
            key: "map_10",
            name: "Catcallers",
            description: "Seeking to whistle at the rumored beauties in the mist, they will take a good beating before giving up.",
            seed: 21888,
            baseDifficulty: 15,
            unlocksAfterMapKey: "map_9",
            zones: [
                mapData.createZone(3, "scoundrel", 0, 100, 1, 1.5, 140),
                mapData.createZone(3, "lecher", 12000, 100, 1.3, 1.25, 160),
                mapData.createZone(3, "scoundrel", 24000, 100, 1.6, 1.5, 180),
                mapData.createZone(3, "lecher", 36000, 100, 1.8, 1.25, 200),
                mapData.createZone(3, "scoundrel", 48000, 100, 2.1, 1.5, 220),
            ],
            shardDropAmount: 80
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

/** Bronze/silver/gold cycle chance pool: 100% / 200% / 300%. */
mapData.getMapShardChancePool = function(mapTier) {
    const tier = mapTier || 0;
    if (tier >= 2) {
        return 3;
    }
    if (tier >= 1) {
        return 2;
    }
    return 1;
};

/** Sum of zone.difficulty across the map (for splitting the chance pool). */
mapData.getMapZoneDifficultySum = function(mapDef) {
    const zones = (mapDef && mapDef.zones) || [];
    let sum = 0;
    for (let i = 0; i < zones.length; i++) {
        sum += Math.max(0, zones[i].difficulty || 0);
    }
    return Math.max(0, sum);
};

/**
 * Base per-kill shard chance for a zone (before shrine additive bonus / 100% cap).
 * pool x (zoneDifficulty / sumDifficulties) / enemyCount
 */
mapData.getZoneShardDropChance = function(mapDef, zoneIndex, mapTier) {
    if (!mapDef || !mapDef.zones || zoneIndex < 0 || zoneIndex >= mapDef.zones.length) {
        return 0;
    }
    const z = mapDef.zones[zoneIndex];
    const sumDiff = mapData.getMapZoneDifficultySum(mapDef);
    if (sumDiff <= 0) {
        return 0;
    }
    const enemies = Math.max(1, z.totalEnemies || 1);
    const pool = mapData.getMapShardChancePool(mapTier);
    const waveShare = (Math.max(0, z.difficulty || 0) / sumDiff);
    return pool * waveShare / enemies;
};

/**
 * Shard drop amount for a map, including Collect Shards and map-star multipliers.
 * Callers should gate visibility/drops on Collect Shards unlock separately.
 */
mapData.getMapShardDropAmount = function(mapDef) {
    const base = mapDef && mapDef.shardDropAmount !== undefined ? mapDef.shardDropAmount : 1;
    const amountMult = (typeof engine !== "undefined" && engine.getShardLootAmountMultiplier)
        ? engine.getShardLootAmountMultiplier()
        : 0;
    const starCount = (typeof engine !== "undefined" && engine.countAchievedStars)
        ? engine.countAchievedStars()
        : 0;
    return base * amountMult * Math.pow(1.1, starCount);
};
