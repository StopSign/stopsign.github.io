function Computer() {
    this.unlocked = 0;
    this.threads = 1;
    this.freeThreads = 1;
    this.speed = 1;

    this.tick = function() {

    };

    this.unlockComputer = function() {
        if(game.science >= 1000) {
            game.science -= 1000;
            this.unlocked = 1;
            view.checkComputerUnlocked();
        }
    };

    this.buyThread = function() {
        var threadCost = this.getThreadCost();
        if(game.science >= threadCost) {
            game.science -= threadCost;
            this.threads++;
            this.freeThreads++;
        }
        view.updateComputer();
    };
    this.getThreadCost = function() {
        return factorial(this.threads+1)*1000;
    };

    this.buySpeed = function() {
        var speedCost = this.getSpeedCost();
        if(game.cash >= speedCost) {
            game.cash -= speedCost;
            this.speed++;
        }
        view.updateComputer();
    };
    this.getSpeedCost = function() {
        return factorial(this.speed+1)*1000;
    };
}