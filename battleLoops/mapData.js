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
                mapData.createZone(6, "scoundrel", 0, 300, 1, 1.6, 6, 1),
                mapData.createZone(5, "scoundrel", 33000, 250, 1.5, 1.5, 9, 1.5),
                mapData.createZone(5, "scoundrel", 60000, 250, 2, 1, 12, 2),
            ],
            zoneShards: [
                { key: "nickelAndDime", gain: 1, chance: 0.04, cap: 10 },
                { key: "selfAffirmations", gain: 1, chance: 0.04, cap: 10 },
                { key: "force", gain: 1, chance: 0.04, cap: 10 }
            ],
            forageZones: [
                mapData.createForageZone(1, "tree", 200, 0, 10, 1, "logs", 1),
                mapData.createForageZone(2, "tree", 300, 1, 20, 1, "logs", 1.2)
            ]
        }),
        mapData.createMap({
            version:0,
            key: "map_2",
            name: "Protecting Modesty",
            description: "Word has spread that there is a beautiful woman protecting an unknown village, and the Okami must slap some sense into the curious scoundrels.",
            seed: 424242,
            baseDifficulty: 1.6,
            unlocksAfterMapKey: "map_1",
            zones: [
                mapData.createZone(3, "scoundrel", 0, 200, 1, 1.5, 3, 1),
                mapData.createZone(4, "scoundrel", 16000, 150, 1.2, 1, 4, 1.2),
                mapData.createZone(5, "scoundrel", 30000, 200, 1.5, 0.75, 8, 1.5),
                mapData.createZone(2, "scoundrel", 36000, 500, 1.8, 1.25, 10, 1.8),
                mapData.createZone(3, "scoundrel", 50000, 200, 2, 1, 20, 2)
            ],
            zoneShards: [
                { key: "mainCharacter", gain: 1, chance: 0.02, cap: 10 },
                { key: "shameless", gain: 1, chance: 0.02, cap: 10 },
                { key: "corneredEgo", gain: 1, chance: 0.02, cap: 10 }
            ],
            forageZones: [
                mapData.createForageZone(10, "bush", 165, 0, 5, 1, "lumber", 1),
                mapData.createForageZone(6, "ore_vein", 185, 0, 9, 1, "ironOre", 1.3),
            ]
        }),
        mapData.createMap({
            version:0,
            key: "map_3",
            name: "Leering Intruders",
            description: "Rumors of a hotspring have brought both scoundrels and lechers, looking to peep in and ruin the peace. The Okami will have them run away in embarrasment.",
            seed: 6001,
            baseDifficulty: 1.6,
            unlocksAfterMapKey: "map_2",
            zones: [
                mapData.createZone(3, "scoundrel", 0, 200, 1, 1.5, 3, 1),
                mapData.createZone(2, "lecher", 500, 780, 1.0, 1, 22, 1),
                mapData.createZone(4, "scoundrel", 16000, 150, 1.2, 1, 4, 1.2),
                mapData.createZone(5, "scoundrel", 30000, 200, 1.5, 0.75, 8, 1.5),
                mapData.createZone(2, "scoundrel", 36000, 500, 1.8, 1.25, 10, 1.8),
                mapData.createZone(3, "scoundrel", 50000, 200, 2, 1, 20, 2)
            ],
            zoneShards: [
                { key: "extortion", gain: 1, chance: 0.01, cap: 10 },
                { key: "hindsight", gain: 1, chance: 0.01, cap: 10 },
                { key: "insultFatigue", gain: 1, chance: 0.01, cap: 10 }
            ],
            forageZones: [
                mapData.createForageZone(6, "ore_vein", 185, 0, 9, 1, "ironOre", 1.3),
            ]
        }),
        mapData.createMap({
            version:0,
            key: "map_4",
            name: "Romance Novelists",
            description: "Some intruders are determined in their pursuit of seeing the secrets of the hotspring. The Okami must fill their hearts with shame.",
            seed: 7777,
            baseDifficulty: 1.6,
            unlocksAfterMapKey: "map_3",
            zones: [
                mapData.createZone(3, "scoundrel", 0, 200, 1, 1.5, 3, 1,
                    { key: "shameless", gain: 1, chance: 0.01, cap: 10 }),
                mapData.createZone(3, "scoundrel", 0, 200, 1, 1.5, 3, 1, { key: "shameless", gain: 1, chance: 0.01, cap: 10 }),
                mapData.createZone(4, "scoundrel", 16000, 150, 1.2, 1, 4, 1.2, { key: "hindsight", gain: 1, chance: 0.009, cap: 12 }),
                mapData.createZone(5, "scoundrel", 30000, 200, 1.5, 0.75, 8, 1.5),
                mapData.createZone(2, "scoundrel", 36000, 500, 1.8, 1.25, 10, 1.8),
                mapData.createZone(3, "scoundrel", 50000, 200, 2, 1, 20, 2)
            ],
            forageZones: [
                mapData.createForageZone(6, "ore_vein", 185, 0, 9, 1, "ironOre", 1.3),
            ]
        }),
        // mapData.createMap({
        //     key: "map_condescend_1",
        //     name: "Shieldwall Gauntlet",
        //     seed: 900001,
        //     baseDifficulty: 1.4,
        //     requiredClassKey: "condescend",
        //     zones: [
        //         mapData.createZone(28, "scoundrel", 0, 780, 0.9, 1, 22, 1, { key: "aboveItAll", gain: 1, chance: 0.006, cap: 24 }),
        //         mapData.createZone(34, "scoundrel", 9000, 845, 1.0, 1, 30, 1, { key: "toughness_condescend", gain: 1, chance: 0.005, cap: 28 }),
        //         mapData.createZone(40, "scoundrel", 20000, 910, 1.1, 1, 40, 1, { key: "second_wind", gain: 1, chance: 0.004, cap: 30 })
        //     ]
        // }),
        // mapData.createMap({
        //     key: "map_scold_1",
        //     name: "Silent Crossfire",
        //     seed: 900002,
        //     baseDifficulty: 1.45,
        //     requiredClassKey: "scold",
        //     zones: [
        //         mapData.createZone(16, "lecher", 0, 780, 1.0, 1, 22, 1),
        //         mapData.createZone(22, "lecher", 10000, 845, 1.1, 1, 32, 1),
        //         mapData.createZone(28, "lecher", 21000, 910, 1.2, 1, 44, 1)
        //     ]
        // }),
        // mapData.createMap({
        //     key: "map_mock_1",
        //     name: "Colossus Trail",
        //     seed: 900003,
        //     baseDifficulty: 2.1,
        //     requiredClassKey: "mock",
        //     zones: [
        //         mapData.createZone(4, "scoundrel", 0, 780, 2.2, 1, 26, 1),
        //         mapData.createZone(5, "scoundrel", 10000, 910, 2.4, 1, 36, 1),
        //         mapData.createZone(6, "scoundrel", 23000, 975, 2.7, 1, 52, 1)
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
