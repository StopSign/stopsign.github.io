let mapData = {
    createZone: function(totalEnemies, enemyType, startTimeMs, spawnEveryMs, difficulty, hpDamageTradeRatio, goldPerEnemy, expBasePerEnemy) {
        const safeEnemies = Math.max(1, totalEnemies || 1);
        const safeSpawnEveryMs = Math.max(0, spawnEveryMs || 0);
        return {
            name: "",
            totalEnemies: safeEnemies,
            difficulty: difficulty || 1,
            startTimeMs: Math.max(0, startTimeMs || 0),
            spawnEveryMs: safeSpawnEveryMs,
            lengthMs: Math.max(0, safeSpawnEveryMs * Math.max(0, safeEnemies - 1)),
            enemyType: enemyType || "melee",
            goldPerEnemy: goldPerEnemy !== undefined ? Math.max(0, goldPerEnemy) : 1,
            hpDamageTradeRatio: hpDamageTradeRatio !== undefined ? Math.max(0.01, hpDamageTradeRatio) : 1,
            expBasePerEnemy: expBasePerEnemy !== undefined ? Math.max(0, expBasePerEnemy) : 1
        };
    },
    createMap: function(config) {
        const zones = config.zones || [];
        let totalDurationMs = 0;
        for (let i = 0; i < zones.length; i++) {
            const z = zones[i];
            z.name = `Wave ${i + 1}`;
            totalDurationMs = Math.max(totalDurationMs, z.startTimeMs);
        }
        return {
            key: config.key,
            name: config.name,
            seed: config.seed,
            baseDifficulty: config.baseDifficulty || 1,
            requiredClassKey: config.requiredClassKey || "",
            zones: zones,
            totalDurationMs: totalDurationMs
        };
    },
    getMapTotalDurationMs: function(mapDefinition) {
        return mapDefinition && mapDefinition.totalDurationMs ? mapDefinition.totalDurationMs : 0;
    },
    getZoneLastSpawnTimeMs: function(zone) {
        return zone.startTimeMs;
    },
    getActiveZonesForTime: function(mapDefinition, elapsedMs) {
        if (!mapDefinition || !mapDefinition.zones) {
            return [];
        }
        const active = [];
        const mapEnd = mapData.getMapTotalDurationMs(mapDefinition) || 0;
        for (let i = 0; i < mapDefinition.zones.length; i++) {
            const z = mapDefinition.zones[i];
            if (elapsedMs < z.startTimeMs || elapsedMs > mapEnd) {
                continue;
            }
            active.push({
                index: i,
                name: z.name,
                remainingMs: Math.max(0, mapEnd - elapsedMs)
            });
        }
        return active;
    },
    /** Shared combat/reward scaling for a zone (difficulty tuning is via each zone's `difficulty` field only). */
    computeZoneCombatAndRewards: function(mapDefinition, zoneIndex, tierMultiplier) {
        const z = mapDefinition.zones[zoneIndex];
        const ratio = z.difficulty || 1;
        const trade = z.hpDamageTradeRatio !== undefined ? Math.max(0.01, z.hpDamageTradeRatio) : 1;
        const totalDifficulty = (mapDefinition.baseDifficulty || 1) * (tierMultiplier || 1);
        const rawHp = gameData.battle.enemyBaseHp * ratio * totalDifficulty * trade;
        const rawDamage = gameData.battle.enemyAttackDamage * ratio * totalDifficulty / trade;
        const goldPerEnemyBase = Math.max(0, z.goldPerEnemy !== undefined ? z.goldPerEnemy : 1);
        const perEnemyGain = Math.ceil(goldPerEnemyBase * Math.pow(totalDifficulty, 1.5));
        const expBasePerEnemy = Math.max(0, z.expBasePerEnemy !== undefined ? z.expBasePerEnemy : 1);
        return {
            rawHp,
            rawDamage,
            perEnemyGain,
            expBasePerEnemy,
            totalDifficulty,
            ratio,
            enemyType: z.enemyType || "melee",
            spawnEveryMs: z.spawnEveryMs || 0,
            startTimeMs: z.startTimeMs
        };
    },
    createZoneSpawnRows: function(mapDefinition, zoneIndex, tierMultiplier) {
        const z = mapDefinition.zones[zoneIndex];
        const rows = [];
        const count = Math.max(1, z.totalEnemies || 1);
        const cr = mapData.computeZoneCombatAndRewards(mapDefinition, zoneIndex, tierMultiplier);
        const intervalMs = Math.max(0, cr.spawnEveryMs || 0);
        for (let i = 0; i < count; i++) {
            rows.push({
                zoneIndex: zoneIndex,
                zoneName: z.name,
                spawnTimeMs: z.startTimeMs + (i * intervalMs),
                rawHp: cr.rawHp,
                rawDamage: cr.rawDamage,
                gain: cr.perEnemyGain,
                expBase: cr.expBasePerEnemy,
                enemyType: cr.enemyType
            });
        }
        return rows;
    },
    getTierDifficultyMultiplier: function(tier) {
        if (tier <= 0) return 1;
        if (tier === 1) return 5;
        return 25;
    }
};
