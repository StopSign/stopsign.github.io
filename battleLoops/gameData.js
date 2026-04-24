let gameData = {
    battle: {
        laneCount: 7,
        enemySizeLaneFill: 0.84,
        enemyTravelSpeedPxPerSecond: 65,
        idlePushBonusPxPerSecond: 45,
        enemyBaseHp: 15,
        enemyAttackDamage: 2,
        enemyAttackCooldownMs: 1300,
        spawnWindowMs: 360000,
        minSpawnGapMs: 1800,
        maxSpawnGapMs: 4400,
        zoneLoopDurationMs: 90000
    },
    seededRandomFactory: function(seed) {
        let state = seed >>> 0;
        return function() {
            state = (1664525 * state + 1013904223) >>> 0;
            return state / 4294967296;
        };
    },
    createZoneDefinition: function(config) {
        return {
            name: config.name || "Wave",
            startTimeMs: config.startTimeMs || 0,
            durationMs: config.durationMs || 30000,
            hpMultiplier: config.hpMultiplier || 1,
            damageMultiplier: config.damageMultiplier || 1,
            speedMultiplier: config.speedMultiplier || 1,
            enemyCount: config.enemyCount || 20,
            gainTotal: config.gainTotal || 100,
            lanes: config.lanes || 7
        };
    },
    createMapDefinition: function(config) {
        return {
            key: config.key,
            name: config.name,
            seed: config.seed,
            loopDurationMs: config.loopDurationMs || gameData.battle.zoneLoopDurationMs,
            zones: config.zones || []
        };
    },
    getDefaultMaps: function() {
        return [
            gameData.createMapDefinition({
                key: "map_1",
                name: "Green Plains",
                seed: 1337,
                difficultyModifier: 1,
                zones: [
                    gameData.createZoneDefinition({ name: "Wave 1", startTimeMs: 0, durationMs: 30000, hpMultiplier: 1, damageMultiplier: 1, enemyCount: 10, gainTotal: 20 }),
                    gameData.createZoneDefinition({ name: "Wave 2", startTimeMs: 30000, durationMs: 30000, hpMultiplier: 0.75, damageMultiplier: 1.45, enemyCount: 25, gainTotal: 30 }),
                    gameData.createZoneDefinition({ name: "Wave 3", startTimeMs: 60000, durationMs: 30000, hpMultiplier: 1.8, damageMultiplier: 1.05, enemyCount: 5, gainTotal: 45 })
                ]
            }),
            gameData.createMapDefinition({
                key: "map_2",
                name: "Ash Barrens",
                seed: 424242,
                difficultyModifier: 2,
                zones: [
                    gameData.createZoneDefinition({ name: "Wave 1", startTimeMs: 0, durationMs: 30000, hpMultiplier: 1.35, damageMultiplier: 1.25, enemyCount: 28, gainTotal: 40 }),
                    gameData.createZoneDefinition({ name: "Wave 2", startTimeMs: 30000, durationMs: 30000, hpMultiplier: 1.1, damageMultiplier: 1.8, enemyCount: 40, gainTotal: 60 }),
                    gameData.createZoneDefinition({ name: "Wave 3", startTimeMs: 60000, durationMs: 30000, hpMultiplier: 2.4, damageMultiplier: 1.3, enemyCount: 18, gainTotal: 90 })
                ]
            })
        ];
    },
    getZoneForTime: function(mapDefinition, elapsedMs) {
        const loopDuration = mapDefinition.loopDurationMs || gameData.battle.zoneLoopDurationMs;
        const wrappedTime = elapsedMs % loopDuration;
        for (let i = 0; i < mapDefinition.zones.length; i++) {
            const zone = mapDefinition.zones[i];
            const zoneEnd = zone.startTimeMs + zone.durationMs;
            if (wrappedTime >= zone.startTimeMs && wrappedTime < zoneEnd) {
                return zone;
            }
        }
        return mapDefinition.zones[0];
    },
    getActiveZonesForTime: function(mapDefinition, elapsedMs) {
        const loopDuration = mapDefinition.loopDurationMs || gameData.battle.zoneLoopDurationMs;
        const loopIndex = Math.floor(elapsedMs / loopDuration);
        const wrappedTime = elapsedMs % loopDuration;
        const active = [];
        for (let i = 0; i < mapDefinition.zones.length; i++) {
            const zone = mapDefinition.zones[i];
            const zoneEnd = zone.startTimeMs + zone.durationMs;
            if (wrappedTime >= zone.startTimeMs && wrappedTime < zoneEnd) {
                const hpScale = zone.hpMultiplier * Math.pow(1.3, loopIndex);
                const dmgScale = zone.damageMultiplier * Math.pow(1.2, loopIndex);
                const gainScale = Math.pow(1.2, loopIndex);
                const difficulty = (hpScale + dmgScale + ((zone.enemyCount / 20) * gainScale)) / 3;
                active.push({
                    name: zone.name,
                    remainingMs: zoneEnd - wrappedTime,
                    difficulty: difficulty,
                    loopIndex: loopIndex
                });
            }
        }
        return active;
    },
    generateEnemySpawnData: function(seed, mapDefinition) {
        const random = gameData.seededRandomFactory(seed);
        const rows = [];
        const map = mapDefinition || gameData.getDefaultMaps()[0];
        const loopDuration = map.loopDurationMs || gameData.battle.zoneLoopDurationMs;
        let spawnOrder = 0;
        for (let loopStart = 0; loopStart <= gameData.battle.spawnWindowMs; loopStart += loopDuration) {
            const loopIndex = Math.floor(loopStart / loopDuration);
            for (let z = 0; z < map.zones.length; z++) {
                const zone = map.zones[z];
                const zoneStart = loopStart + zone.startTimeMs;
                const zoneEnd = zoneStart + zone.durationMs;
                if (zoneStart > gameData.battle.spawnWindowMs) {
                    continue;
                }
                const count = Math.max(1, zone.enemyCount);
                const interval = zone.durationMs / count;
                const maxHp = Math.floor(gameData.battle.enemyBaseHp * zone.hpMultiplier * Math.pow(1.3, loopIndex));
                const rawDamage = gameData.battle.enemyAttackDamage * zone.damageMultiplier * Math.pow(1.2, loopIndex);
                const damage = Math.max(2, Math.ceil(rawDamage));
                const gainPerEnemy = (zone.gainTotal * Math.pow(1.2, loopIndex)) / count;
                const laneCountForZone = Math.max(1, Math.min(gameData.battle.laneCount, zone.lanes || gameData.battle.laneCount));
                const lanePool = [];
                for (let lane = 0; lane < gameData.battle.laneCount; lane++) {
                    lanePool.push(lane);
                }
                // Fisher-Yates partial shuffle to pick zone lanes
                for (let i = lanePool.length - 1; i > 0; i--) {
                    const j = Math.floor(random() * (i + 1));
                    const tmp = lanePool[i];
                    lanePool[i] = lanePool[j];
                    lanePool[j] = tmp;
                }
                const selectedLanes = lanePool.slice(0, laneCountForZone);
                for (let i = 0; i < count; i++) {
                    const spawnTimeMs = zoneStart + (i * interval);
                    if (spawnTimeMs > gameData.battle.spawnWindowMs || spawnTimeMs >= zoneEnd) {
                        continue;
                    }
                    const lane = selectedLanes[Math.floor(random() * selectedLanes.length)];
                    rows.push({
                        spawnOrder: spawnOrder,
                        spawnTimeMs: spawnTimeMs,
                        lane: lane,
                        maxHp: maxHp,
                        hp: maxHp,
                        speedPxPerSecond: gameData.battle.enemyTravelSpeedPxPerSecond * zone.speedMultiplier,
                        attackDamage: damage,
                        attackCooldownMs: gameData.battle.enemyAttackCooldownMs,
                        attackTimerMs: gameData.battle.enemyAttackCooldownMs,
                        sizeLaneFill: gameData.battle.enemySizeLaneFill,
                        gain: gainPerEnemy,
                        zoneName: zone.name
                    });
                    spawnOrder++;
                }
            }
        }
        rows.sort(function(a, b) {
            if (a.spawnTimeMs !== b.spawnTimeMs) {
                return a.spawnTimeMs - b.spawnTimeMs;
            }
            return a.spawnOrder - b.spawnOrder;
        });
        if (map.zones[0]) {
            for (let i = 0; i < rows.length; i++) {
                if (rows[i].zoneName === map.zones[0].name) {
                    rows[i].gain = 1;
                }
            }
        }
        return rows;
    },
    gearSlotOrder: ["head", "chest", "legs", "jewelry", "melee", "ranged", "bracer"],
    gearSlotTitles: {
        head: "Head",
        chest: "Chest",
        legs: "Legs",
        jewelry: "Jewelry",
        melee: "Melee weapon",
        ranged: "Ranged weapon",
        bracer: "Bracer (magic)"
    },
    gearVariants: ["light", "medium", "heavy"],
    gearVariantLabels: {
        light: "Light",
        medium: "Medium",
        heavy: "Heavy"
    },
    _gearTableArmor: {
        light: { str: 0, con: 1, spd: 0, soul: 2, dmgPct: 0.035, hpPct: 0.025 },
        medium: { str: 0, con: 2, spd: 0, soul: 2, dmgPct: 0.022, hpPct: 0.055 },
        heavy: { str: 0, con: 4, spd: 0, soul: 3, dmgPct: 0.012, hpPct: 0.095 }
    },
    _gearTableMelee: {
        light: { str: 2, con: 0, spd: 0, soul: 3, dmgPct: 0.14, hpPct: 0 },
        medium: { str: 1, con: 2, spd: 0, soul: 3, dmgPct: 0.08, hpPct: 0.05 },
        heavy: { str: 0, con: 3, spd: 0, soul: 3, dmgPct: 0.035, hpPct: 0.1 }
    },
    _gearTableRanged: {
        light: { str: 1, con: 0, spd: 1, soul: 3, dmgPct: 0.11, hpPct: 0 },
        medium: { str: 1, con: 1, spd: 1, soul: 3, dmgPct: 0.065, hpPct: 0.045 },
        heavy: { str: 0, con: 2, spd: 0, soul: 3, dmgPct: 0.03, hpPct: 0.085 }
    },
    _gearTableBracer: {
        light: { str: 0, con: 0, spd: 0, soul: 2, dmgPct: 0, hpPct: 0, tbdMagic: true },
        medium: { str: 0, con: 0, spd: 0, soul: 2, dmgPct: 0, hpPct: 0, tbdMagic: true },
        heavy: { str: 0, con: 0, spd: 0, soul: 2, dmgPct: 0, hpPct: 0, tbdMagic: true }
    },
    getGearPieceStaticBase: function(slotKey, variant) {
        let table = null;
        if (slotKey === "head" || slotKey === "chest" || slotKey === "legs" || slotKey === "jewelry") {
            table = gameData._gearTableArmor;
        } else if (slotKey === "melee") {
            table = gameData._gearTableMelee;
        } else if (slotKey === "ranged") {
            table = gameData._gearTableRanged;
        } else {
            table = gameData._gearTableBracer;
        }
        const row = table[variant] || table.medium;
        return row;
    },
    scaleGearRequirements: function(baseReq, level) {
        const mult = Math.pow(1.5, level);
        return {
            str: Math.ceil((baseReq.str || 0) * mult),
            con: Math.ceil((baseReq.con || 0) * mult),
            spd: Math.ceil((baseReq.spd || 0) * mult),
            soul: Math.ceil((baseReq.soul || 0) * mult)
        };
    },
    scaleGearEffectPct: function(basePct, level) {
        return (basePct || 0) * Math.pow(1.4, level);
    },
    getPlayerStatsForGear: function() {
        const ls = data.battle.levelState;
        return {
            str: ls.levelStr + ls.skillStrBonus,
            con: ls.levelCon + ls.skillConBonus,
            spd: ls.levelSpd || 0,
            soul: ls.levelSoul || 0
        };
    },
    computeGearSlotFulfillment: function(req, stats) {
        const keys = ["str", "con", "spd", "soul"];
        let minRatio = 1;
        let anyReq = false;
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            const need = req[k] || 0;
            if (need <= 0) {
                continue;
            }
            anyReq = true;
            const have = stats[k] || 0;
            const r = have / need;
            if (r < minRatio) {
                minRatio = r;
            }
        }
        if (!anyReq) {
            return 1;
        }
        return Math.max(0, Math.min(1, minRatio));
    },
    computeGearSlotBonuses: function(slotKey, slotState) {
        const variant = slotState.variant || "medium";
        const level = slotState.level || 0;
        const base = gameData.getGearPieceStaticBase(slotKey, variant);
        const req = gameData.scaleGearRequirements(base, level);
        const stats = gameData.getPlayerStatsForGear();
        const effectiveness = gameData.computeGearSlotFulfillment(req, stats);
        const dmgPct = gameData.scaleGearEffectPct(base.dmgPct, level) * effectiveness;
        const hpPct = gameData.scaleGearEffectPct(base.hpPct, level) * effectiveness;
        return {
            effectiveness: effectiveness,
            dmgPct: dmgPct,
            hpPct: hpPct,
            req: req,
            rawDmgPct: gameData.scaleGearEffectPct(base.dmgPct, level),
            rawHpPct: gameData.scaleGearEffectPct(base.hpPct, level),
            tbdMagic: !!base.tbdMagic
        };
    },
    getAggregatedGearBonuses: function() {
        const gear = data.progress.gear;
        if (!gear || !gear.slots) {
            return { dmgPct: 0, hpPct: 0 };
        }
        let dmgSum = 0;
        let hpSum = 0;
        const order = gameData.gearSlotOrder;
        for (let i = 0; i < order.length; i++) {
            const key = order[i];
            const st = gear.slots[key];
            if (!st) {
                continue;
            }
            const b = gameData.computeGearSlotBonuses(key, st);
            dmgSum += b.dmgPct;
            hpSum += b.hpPct;
        }
        return { dmgPct: dmgSum, hpPct: hpSum };
    },
    getGearUpgradeCost: function(currentLevel) {
        return Math.floor(22 * Math.pow(1.62, currentLevel));
    },
    getDefaultGear: function() {
        const mk = function() {
            return { variant: "medium", level: 0 };
        };
        return {
            slots: {
                head: mk(),
                chest: mk(),
                legs: mk(),
                jewelry: mk(),
                melee: mk(),
                ranged: mk(),
                bracer: mk()
            }
        };
    }
};
