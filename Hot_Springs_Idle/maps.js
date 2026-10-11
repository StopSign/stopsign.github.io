let mapData = {
    /**
     * Normalize a shard drop def: `{ key, gain, chance, cap }`.
     * Soft cap: each time it is reached, drop chance ÷5 and the next segment size ×2.
     */
    normalizeSkillShardDef: function(skillShard) {
        if (!skillShard || !skillShard.key) {
            return null;
        }
        return {
            key: skillShard.key,
            gain: Math.max(1, Math.floor(skillShard.gain !== undefined ? skillShard.gain : 1)),
            chance: Math.max(0, Math.min(1, skillShard.chance !== undefined ? skillShard.chance : 0)),
            cap: Math.max(1, Math.floor(skillShard.cap !== undefined ? skillShard.cap : 1))
        };
    },
    /**
     * @param {object} [skillShard] Optional single-type shard drop for this zone: `{ key, gain, chance, cap }`
     *   (skill key must match `skills` definition keys). At most one shard type per zone.
     */
    createZone: function(totalEnemies, intruderType, startTimeMs, distanceBetweenUnits, difficulty, audDamageTradeRatio, coinsPerIntruder, skillShard) {
        const safeEnemies = Math.max(1, totalEnemies || 1);
        const safeDistanceBetweenUnits = Math.max(0, distanceBetweenUnits || 0);
        const z = {
            name: "",
            totalEnemies: safeEnemies,
            difficulty: difficulty || 1,
            startTimeMs: Math.max(0, startTimeMs || 0),
            distanceBetweenUnits: safeDistanceBetweenUnits,
            lengthMs: Math.max(0, safeDistanceBetweenUnits * Math.max(0, safeEnemies - 1)),
            intruderType: intruderType || "scoundrel",
            coinsPerIntruder: coinsPerIntruder !== undefined ? Math.max(0, coinsPerIntruder) : 1,
            audDamageTradeRatio: audDamageTradeRatio !== undefined ? Math.max(0.01, audDamageTradeRatio) : 1
        };
        const normalized = mapData.normalizeSkillShardDef(skillShard);
        if (normalized) {
            z.skillShard = normalized;
        }
        return z;
    },
    createMap: function(config) {
        const zones = config.zones || [];
        const forageZones = config.forageZones || [];
        let totalDurationMs = 0;
        for (let i = 0; i < zones.length; i++) {
            const z = zones[i];
            z.name = `Wave ${i + 1}`;
            totalDurationMs = Math.max(totalDurationMs, z.startTimeMs);
        }
        for (let i = 0; i < forageZones.length; i++) {
            const fz = forageZones[i];
            fz.name = fz.name || `Forage ${i + 1}`;
        }
        const zoneShards = [];
        const rawZoneShards = config.zoneShards || [];
        for (let si = 0; si < rawZoneShards.length; si++) {
            const n = mapData.normalizeSkillShardDef(rawZoneShards[si]);
            if (n) {
                zoneShards.push(n);
            }
        }
        return {
            key: config.key,
            name: config.name,
            description: config.description || "",
            seed: config.seed,
            baseDifficulty: config.baseDifficulty || 1,
            requiredClassKey: config.requiredClassKey || "",
            unlocksAfterMapKey: config.unlocksAfterMapKey || "",
            zones: zones,
            forageZones: forageZones,
            zoneShards: zoneShards,
            totalDurationMs: totalDurationMs,
            version: config.version
        };
    },
    createForageZone: function(totalEnemies, unitType, distanceBetweenUnits, index, baseAud, rewardAmount, rewardResource, expBasePerIntruder) {
        return {
            name: "",
            totalEnemies: Math.max(1, totalEnemies || 1),
            unitType: unitType || "tree",
            distanceBetweenUnits: Math.max(0, distanceBetweenUnits || 0),
            index: Math.max(0, index || 0),
            baseAud: Math.max(1, baseAud || 10),
            rewardAmount: Math.max(0, rewardAmount || 1),
            rewardResource: rewardResource || "logs",
            expBasePerIntruder: Math.max(0, expBasePerIntruder || 1)
        };
    },
    getMapTotalEnemies: function(mapDefinition) {
        const zones = mapDefinition && mapDefinition.zones ? mapDefinition.zones : [];
        let total = 0;
        for (let i = 0; i < zones.length; i++) {
            total += Math.max(0, zones[i].totalEnemies || 0);
        }
        return Math.max(1, total);
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
        const trade = z.audDamageTradeRatio !== undefined ? Math.max(0.01, z.audDamageTradeRatio) : 1;
        const tm = typeof tierMultiplier === "number"
            ? { combat: tierMultiplier || 1, coins: 1, exp: 1 }
            : (tierMultiplier || { combat: 1, coins: 1, exp: 1 });
        const combatMult = tm.combat || 1;
        const coinsMult = tm.coins || 1;
        const expMult = tm.exp || 1;
        const totalDifficulty = (mapDefinition.baseDifficulty || 1) * combatMult;
        const N = ratio * totalDifficulty;
        const rawAud = gameData.battle.intruderBaseAud * Math.pow(N, 1.2) * trade;
        const rawDamage = gameData.battle.intruderAttackDamage * N / trade;
        const coinsPerIntruderBase = Math.max(0, z.coinsPerIntruder !== undefined ? z.coinsPerIntruder : 1);
        const perIntruderGain = Math.ceil(coinsPerIntruderBase * coinsMult);
        const expBasePerIntruder = Math.max(0, (mapDefinition.baseDifficulty || 1) * ratio * expMult);
        return {
            rawAud,
            rawDamage,
            perIntruderGain,
            expBasePerIntruder,
            totalDifficulty,
            ratio,
            intruderType: z.intruderType || "scoundrel",
            distanceBetweenUnits: z.distanceBetweenUnits || 0,
            startTimeMs: z.startTimeMs
        };
    },
    createZoneSpawnRows: function(mapDefinition, zoneIndex, tierMultiplier) {
        const z = mapDefinition.zones[zoneIndex];
        const rows = [];
        const count = Math.max(1, z.totalEnemies || 1);
        const cr = mapData.computeZoneCombatAndRewards(mapDefinition, zoneIndex, tierMultiplier);
        const travelSpd = Math.max(1, gameData.battle.intruderTravelSpeedPxPerSecond || 1);
        const spacingPx = Math.max(0, cr.distanceBetweenUnits || 0);
        const intervalMs = spacingPx > 0 ? (spacingPx / travelSpd) * 1000 : 0;
        for (let i = 0; i < count; i++) {
            rows.push({
                zoneIndex: zoneIndex,
                zoneName: z.name,
                spawnTimeMs: z.startTimeMs + (i * intervalMs),
                rawAud: cr.rawAud,
                rawDamage: cr.rawDamage,
                gain: cr.perIntruderGain,
                expBase: cr.expBasePerIntruder,
                intruderType: cr.intruderType
            });
        }
        return rows;
    },
    /** Combat Aud/damage scaling plus separate coins and exp reward multipliers per map tier. */
    getTierDifficultyMultiplier: function(tier) {
        if (tier <= 0) {
            return { combat: 1, coins: 1, exp: 1 };
        }
        if (tier === 1) {
            return { combat: 4, coins: 2, exp: 2 };
        }
        return { combat: 16, coins: 4, exp: 4 };
    }
};
