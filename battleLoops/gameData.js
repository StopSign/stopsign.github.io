let gameData = {
    battle: {
        laneCount: 7,
        enemySizeLaneFill: 0.9,
        laneHorizontalInsetPx: 14,
        enemyTravelSpeedPxPerSecond: 65,
        idlePushBonusPxPerSecond: 45,
        enemyBaseHp: 10,
        enemyAttackDamage: 2,
        enemyAttackCooldownMs: 1300,
        spawnWindowMs: 360000,
        battlefieldWidthPx: 688,
        battlefieldHeightPx: 718,
        playerMeleeLineYPx: null,
        /** Distance from battlefield bottom to melee line — matches stacked player UI at bottom (~10px + bars + token). */
        playerMeleeOffsetFromBottomPx: 142
    },
    seededRandomFactory: function(seed) {
        let state = seed >>> 0;
        return function() {
            state = (1664525 * state + 1013904223) >>> 0;
            return state / 4294967296;
        };
    }
};
