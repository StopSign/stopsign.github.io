// Map list / zone configs — loaded after maps.js defines `mapData` helpers (`createMap`, `createZone`).
mapData.getDefaultMaps = function() {
    return [
        mapData.createMap({
            key: "map_1",
            name: "Northern Forest",
            description: "Relatively peaceful forest trails. Very easy.",
            seed: 5556,
            baseDifficulty: 1,
            zones: [
                mapData.createZone(2, "melee", 0, 250, 1, 1.8, 3, 1),
                mapData.createZone(2, "melee", 16000, 250, 1.5, 1.5, 4, 1.2),
                mapData.createZone(2, "melee", 32000, 250, 2, 1, 8, 1.5),
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
                mapData.createZone(3, "melee", 0, 200, 1, 1.5, 3, 1),
                mapData.createZone(4, "melee", 16000, 150, 1.2, 1, 4, 1.2),
                mapData.createZone(5, "melee", 30000, 200, 1.5, 0.75, 8, 1.5),
                mapData.createZone(2, "melee", 36000, 500, 1.8, 1.25, 10, 1.8),
                mapData.createZone(3, "melee", 50000, 200, 2, 1, 20, 2)
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
                mapData.createZone(28, "melee", 0, 780, 0.9, 1, 22, 1),
                mapData.createZone(34, "melee", 9000, 845, 1.0, 1, 30, 1),
                mapData.createZone(40, "melee", 20000, 910, 1.1, 1, 40, 1)
            ]
        }),
        mapData.createMap({
            key: "map_rogue_1",
            name: "Silent Crossfire",
            seed: 900002,
            baseDifficulty: 1.45,
            requiredClassKey: "rogue",
            zones: [
                mapData.createZone(16, "ranged", 0, 780, 1.0, 1, 22, 1),
                mapData.createZone(22, "ranged", 10000, 845, 1.1, 1, 32, 1),
                mapData.createZone(28, "ranged", 21000, 910, 1.2, 1, 44, 1)
            ]
        }),
        mapData.createMap({
            key: "map_hunter_1",
            name: "Colossus Trail",
            seed: 900003,
            baseDifficulty: 2.1,
            requiredClassKey: "hunter",
            zones: [
                mapData.createZone(4, "melee", 0, 780, 2.2, 1, 26, 1),
                mapData.createZone(5, "melee", 10000, 910, 2.4, 1, 36, 1),
                mapData.createZone(6, "melee", 23000, 975, 2.7, 1, 52, 1)
            ]
        })
    ];
};
