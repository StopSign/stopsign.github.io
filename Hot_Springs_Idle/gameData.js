let gameData = {
    battle: {
        laneCount: 7,
        intruderSizeLaneFill: 0.9,
        laneHorizontalInsetPx: 14,
        intruderTravelSpeedPxPerSecond: 50,
        idlePushBonusPxPerSecond: 25,
        intruderStackGapPx: 10,
        intruderBaseAud: 10,
        intruderAttackDamage: 2,
        intruderAttackCooldownMs: 1300,
        spawnWindowMs: 360000,
        battlefieldWidthPx: 688,
        battlefieldHeightPx: 718,
        playerSlapLineYPx: null,
        playerSlapOffsetFromBottomPx: 142,

        /**
         * Copied into `data.battle.player` for new runs (mutable during play).
         * Damage and cooldown seeds are derived from `combat` and `cooldowns` in
         * `initialize.player()`, then recomputed by `initialize.calcPlayerStats()`.
         */
        playerStarting: {
            attackTimerMs: 0,
            sandalAttackTimerMs: 0
        },

        /** Starting value for both `levelState.expToLevelBase` and rounded `levelState.expToLevel`. */
        levelStartingExpToLevel: 2,

        /** Harvest / clear-map respawn window after 100% clear (ms). */
        mapHarvestRespawnDurationMs: 120000,

        /** Combat formulas - tuning only; saved stats live on `data.battle`. */
        combat: {
            baseSlapDamage: 5,
            sandalDamageSlapMultiplier: 1.5,
            baseAudInner: 20,
            conStrStatDivisor: 10,
            foragingBaseStaminaInner: 20,
            foragingBreathingStaminaPerLevel: 2,
            foragingHarvestDamageBase: 5
        },

        /** Slap/sandal cooldown before Alacrity; floors after reduction. */
        cooldowns: {
            slapBaseMs: 2000,
            sandalBaseMs: 4000,
            slapFloorMs: 200,
            sandalFloorMs: 200,
            alacritySlapReductionPerLevelMs: 10,
            alacritySandalReductionPerLevelMs: 20
        }
    },
    seededRandomFactory: function(seed) {
        let state = seed >>> 0;
        return function() {
            state = (1664525 * state + 1013904223) >>> 0;
            return state / 4294967296;
        };
    }
};
