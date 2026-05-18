// Map list / zone configs - loaded after maps.js defines `mapData` helpers (`createMap`, `createZone`).
mapData.getDefaultMaps = function() {
    return [
        mapData.createMap({
            key: "map_1",
            name: "Northern Forest",
            description: "Relatively peaceful forest trails. Very easy.",
            seed: 5557,
            baseDifficulty: 1,
            zones: [
                mapData.createZone(6, "scoundrel", 0, 300, 1, 1.6, 3, 1, { key: "endurance", gain: 1, chance: 0.012, max: 14 }),
                mapData.createZone(5, "scoundrel", 33000, 250, 1.5, 1.5, 6, 1.5, { key: "recovery", gain: 1, chance: 0.01, max: 12 }),
                mapData.createZone(5, "scoundrel", 60000, 250, 2, 1, 12, 2, { key: "force", gain: 1, chance: 0.008, max: 14 }),
            ],
            forageZones: [
                mapData.createForageZone(1, "tree", 200, 0, 10, 1, "logs", 1),
                mapData.createForageZone(2, "tree", 300, 1, 20, 1, "logs", 1.2)
            ]
        }),
        mapData.createMap({
            key: "map_2",
            name: "Eastern Forest",
            description: "More dangerous than the north, but still manageable. Easy.",
            seed: 424242,
            baseDifficulty: 1.6,
            zones: [
                mapData.createZone(3, "scoundrel", 0, 200, 1, 1.5, 3, 1, { key: "endurance", gain: 1, chance: 0.01, max: 10 }),
                mapData.createZone(4, "scoundrel", 16000, 150, 1.2, 1, 4, 1.2, { key: "wisdom", gain: 1, chance: 0.009, max: 12 }),
                mapData.createZone(5, "scoundrel", 30000, 200, 1.5, 0.75, 8, 1.5),
                mapData.createZone(2, "scoundrel", 36000, 500, 1.8, 1.25, 10, 1.8),
                mapData.createZone(3, "scoundrel", 50000, 200, 2, 1, 20, 2)
            ],
            forageZones: [
                mapData.createForageZone(10, "bush", 165, 0, 5, 1, "lumber", 1),
                mapData.createForageZone(6, "ore_vein", 185, 0, 9, 1, "ironOre", 1.3),
                mapData.createForageZone(8, "bush", 170, 1, 6, 1, "lumber", 1.1),
                mapData.createForageZone(5, "ore_vein", 190, 1, 11, 1, "ironOre", 1.4)
            ]
        }),
        mapData.createMap({
            key: "map_warrior_1",
            name: "Shieldwall Gauntlet",
            seed: 900001,
            baseDifficulty: 1.4,
            requiredClassKey: "warrior",
            zones: [
                mapData.createZone(28, "scoundrel", 0, 780, 0.9, 1, 22, 1, { key: "fortitude", gain: 1, chance: 0.006, max: 24 }),
                mapData.createZone(34, "scoundrel", 9000, 845, 1.0, 1, 30, 1, { key: "toughness_warrior", gain: 1, chance: 0.005, max: 28 }),
                mapData.createZone(40, "scoundrel", 20000, 910, 1.1, 1, 40, 1, { key: "second_wind", gain: 1, chance: 0.004, max: 30 })
            ]
        }),
        mapData.createMap({
            key: "map_rogue_1",
            name: "Silent Crossfire",
            seed: 900002,
            baseDifficulty: 1.45,
            requiredClassKey: "rogue",
            zones: [
                mapData.createZone(16, "lecher", 0, 780, 1.0, 1, 22, 1),
                mapData.createZone(22, "lecher", 10000, 845, 1.1, 1, 32, 1),
                mapData.createZone(28, "lecher", 21000, 910, 1.2, 1, 44, 1)
            ]
        }),
        mapData.createMap({
            key: "map_hunter_1",
            name: "Colossus Trail",
            seed: 900003,
            baseDifficulty: 2.1,
            requiredClassKey: "hunter",
            zones: [
                mapData.createZone(4, "scoundrel", 0, 780, 2.2, 1, 26, 1),
                mapData.createZone(5, "scoundrel", 10000, 910, 2.4, 1, 36, 1),
                mapData.createZone(6, "scoundrel", 23000, 975, 2.7, 1, 52, 1)
            ]
        })
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
 * Standard maps: first is always unlocked; each later map requires the previous map’s bronze star.
 * Challenge maps (same `requiredClassKey`): first is unlocked when you are that class; later maps need the previous challenge’s bronze star.
 */
mapData.isMapUnlocked = function(mapDef, progress) {
    if (!mapDef || !progress) {
        return false;
    }
    const maps = progress.mapDefinitions || [];
    const req = mapDef.requiredClassKey || "";
    const cls = progress.currentClassKey || "none";
    if (req) {
        if (req !== cls) {
            return false;
        }
        const challenges = [];
        for (let i = 0; i < maps.length; i++) {
            if (maps[i].requiredClassKey === req) {
                challenges.push(maps[i]);
            }
        }
        const idx = challenges.findIndex(function(m) {
            return m.key === mapDef.key;
        });
        if (idx < 0) {
            return false;
        }
        if (idx === 0) {
            return true;
        }
        const prev = challenges[idx - 1];
        const prevStars = (progress.mapStars && progress.mapStars[prev.key]) || {};
        return !!prevStars.bronze;
    }
    const standard = [];
    for (let j = 0; j < maps.length; j++) {
        if (!maps[j].requiredClassKey) {
            standard.push(maps[j]);
        }
    }
    const sidx = standard.findIndex(function(m) {
        return m.key === mapDef.key;
    });
    if (sidx < 0) {
        return false;
    }
    if (sidx === 0) {
        return true;
    }
    const prevS = standard[sidx - 1];
    const prevStarsS = (progress.mapStars && progress.mapStars[prevS.key]) || {};
    return !!prevStarsS.bronze;
};

/** Sum `max` per skill key across zones that define `skillShard`. */
mapData.getMapShardMaxBySkillKey = function(mapDef) {
    const out = {};
    if (!mapDef || !mapDef.zones) {
        return out;
    }
    for (let i = 0; i < mapDef.zones.length; i++) {
        const sh = mapDef.zones[i].skillShard;
        if (sh && sh.key) {
            out[sh.key] = (out[sh.key] || 0) + (sh.max || 0);
        }
    }
    return out;
};

/** "SkillName: current/max" for travel card; `current` is stored `skill.shards`. */
mapData.getMapShardSummaryText = function(mapDef, progressSkills) {
    const maxBy = mapData.getMapShardMaxBySkillKey(mapDef);
    const keys = Object.keys(maxBy);
    if (!keys.length) {
        return "";
    }
    const parts = [];
    for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        const def = skills._byKey[k];
        const nm = def && def.name ? def.name : k;
        const sk = progressSkills && progressSkills[k];
        const cur = sk && sk.shards !== undefined ? sk.shards : 0;
        parts.push(`${nm}: ${cur}/${maxBy[k]}`);
    }
    return parts.join(" · ");
};
