// Map list / zone configs — loaded after maps.js defines `mapData` helpers (`createMap`, `createZone`).
mapData.getDefaultMaps = function() {
    return [
        mapData.createMap({
            key: "map_1",
            name: "Green Plains",
            seed: 5556,
            baseDifficulty: 1,
            zones: [
                mapData.createZone(3, "melee", 0, 3000, 1, 1.5, 3, 1),
                mapData.createZone(4, "melee", 12000, 3000, 1.2, 1, 4, 1),
                mapData.createZone(1, "ranged", 22000, 0, 1.4, 1, 10, 2),
                mapData.createZone(5, "melee", 26000, 8000, 1.6, 0.75, 4, 1.2),
                mapData.createZone(6, "melee", 30000, 3000, 1.8, 1.25, 4, 1.2)
            ]
        }),
        mapData.createMap({
            key: "map_2",
            name: "Ash Barrens",
            seed: 424242,
            baseDifficulty: 1.6,
            zones: [
                mapData.createZone(16, "melee", 0, 10000, 1.2, 1, 24, 1),
                mapData.createZone(22, "melee", 9000, 12000, 1.35, 1, 36, 1),
                mapData.createZone(30, "melee", 21000, 15000, 1.55, 1, 52, 1)
            ]
        }),
        mapData.createMap({
            key: "map_warrior_1",
            name: "Shieldwall Gauntlet",
            seed: 900001,
            baseDifficulty: 1.4,
            requiredClassKey: "warrior",
            zones: [
                mapData.createZone(28, "melee", 0, 12000, 0.9, 1, 22, 1),
                mapData.createZone(34, "melee", 9000, 13000, 1.0, 1, 30, 1),
                mapData.createZone(40, "melee", 20000, 14000, 1.1, 1, 40, 1)
            ]
        }),
        mapData.createMap({
            key: "map_rogue_1",
            name: "Silent Crossfire",
            seed: 900002,
            baseDifficulty: 1.45,
            requiredClassKey: "rogue",
            zones: [
                mapData.createZone(16, "ranged", 0, 12000, 1.0, 1, 22, 1),
                mapData.createZone(22, "ranged", 10000, 13000, 1.1, 1, 32, 1),
                mapData.createZone(28, "ranged", 21000, 14000, 1.2, 1, 44, 1)
            ]
        }),
        mapData.createMap({
            key: "map_hunter_1",
            name: "Colossus Trail",
            seed: 900003,
            baseDifficulty: 2.1,
            requiredClassKey: "hunter",
            zones: [
                mapData.createZone(4, "melee", 0, 12000, 2.2, 1, 26, 1),
                mapData.createZone(5, "melee", 10000, 14000, 2.4, 1, 36, 1),
                mapData.createZone(6, "melee", 23000, 15000, 2.7, 1, 52, 1)
            ]
        })
    ];
};
