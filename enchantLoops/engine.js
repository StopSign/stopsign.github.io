
let engine = {
    gameTick: function() {
        data.gameSettings.ticksForSeconds++;

        const tickMs = 1000 / data.gameSettings.ticksPerSecond;

    },
}
