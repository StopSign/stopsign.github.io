function SpaceDock() {
    this.battleships = 0;
    this.unlocked = 0;
    this.energy = 0;

    this.tick = function() {
        if(!this.unlocked) {
            return;
        }
        var excess = this.energy - this.battery;
        this.drain = 0;
        if(excess > 0) {
            this.drain = excess/500;
            game.power -= this.drain;
        }
    };

    this.gainEnergy = function(amount) {
        this.energy += amount;
    };

    this.addBattleship = function(amount) {
        this.battleships += amount;
        view.updateSpaceDock();
    };

}