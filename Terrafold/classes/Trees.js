function Trees() {
    this.water = 0;
    this.ferns = 0;
    this.trees = 0;
    this.fernsDelta = 0;
    this.fernsDying = 0;
    this.compost = 0;
    this.co2 = 0;
    this.oxygenGain = 0;

    this.tick = function(gained) {
        this.water += gained;
        this.fernsGrowth();
        this.fernsDeath();
        this.treesGrowth();
        this.oxygenGain = this.ferns / 1000 + this.trees / 100;
        game.oxygen += this.oxygenGain;
    };

    this.transferWater = function() {
        this.transferred = this.water / 1000;
        this.water -= this.transferred;
        return this.transferred;
    };

    this.treesGrowth = function() {
        this.treesDelta = this.co2 / 1000;
        if(this.treesDelta > this.ferns) {
            this.treesDelta = this.ferns;
        }
        if(this.treesDelta > this.water) {
            this.treesDelta = this.water;
        }
        this.ferns -= this.treesDelta;
        this.co2 -= this.treesDelta;
        this.water -= this.treesDelta;
        this.trees += this.treesDelta;
    };

    this.fernsDeath = function() {
        this.fernsDying = this.ferns / 10000;
        this.compost += this.fernsDying;
        this.ferns -= this.fernsDying;

        this.co2Gain = this.compost / 100;
        this.co2 += this.co2Gain;
        this.compost -= this.co2Gain;
    };

    this.fernsGrowth = function() {
        this.fernsDelta = (game.land.soil - (this.ferns + this.trees)) / 1000;
        if(this.fernsDelta > this.water) {
            this.fernsDelta = this.water;
        }
        this.ferns += this.fernsDelta;
        if(this.ferns < 0) {
            this.treesDying = 0 - this.ferns;
            this.ferns = 0;
            this.trees -= this.treesDying;
            this.fernsDelta = 0;
        } else {
            this.treesDying = 0;
        }
        this.water -= this.fernsDelta;
    }

}