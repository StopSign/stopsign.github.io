function Energy() {
    this.unlocked = 0;
    this.battery = 100;

    this.unlockEnergy = function() {
        if(game.metal >= 500) {
            game.metal -= 500;
            this.unlocked = 1;
            view.checkEnergyUnlocked();
            view.checkSpaceStationUnlocked();
        }
        view.updateEnergy();
    };

    this.tick = function() {
        var excess = game.power - this.battery;
        this.drain = 0;
        if(excess > 0) {
            this.drain = excess/500;
            game.power -= this.drain;
        }
    };

    this.gainEnergy = function(amount) {
        game.power += amount;
    };

    this.buyBattery = function(amount) {
        this.battery += amount;
    }

}