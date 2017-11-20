function Energy() {
    this.energy = 0;
    this.unlocked = 0;
    this.battery = 100;

    this.unlockEnergy = function() {
        if(game.metal >= 500) {
            game.metal -= 500;
            this.unlocked = 1;
            view.checkEnergyUnlocked();
        }
        view.updateEnergy();
    };

    this.tick = function() {
        var excess = this.energy - this.battery;
        if(excess > 0) {
            this.energy -= excess / 500;
        }
    };

    this.gainEnergy = function(amount) {
        this.energy += amount;
    };

}