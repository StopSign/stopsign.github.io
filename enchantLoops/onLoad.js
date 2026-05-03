// Applies a save blob to `data`. Assumes the save matches the current default shape (no legacy migration).

let onLoad = {
    handleLoad: function(data, toLoad) {
        data.gameState = toLoad.gameState ?? "default";
        data.lastVisit = toLoad.lastVisit ?? Date.now();
        data.resetCount = toLoad.resetCount ?? 1;

        data.currentGameState = toLoad.currentGameState ?? initials.currentGameState();
        data.gameSettings = toLoad.gameSettings ?? initials.gameSettings();

    },
    afterLoad: function() {
        createView.initializeDisplay();
        view.updateView();
        debug();
    }
};
