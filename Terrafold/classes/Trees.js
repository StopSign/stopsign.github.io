function Trees() {
    this.water = 0;
    this.ferns = 0;
    this.fernsDelta = 0;
    this.smallTrees = 0;
    this.smallTreesDelta = 0;
    this.trees = 0;
    this.treesDelta = 0;
    this.totalPlants = 0;


    this.oxygenGain = 0;

    this.tick = function(gained) {
        this.water += gained;
        this.plantGrowth();
        this.oxygenGain = (this.ferns / 1000) + (3 * this.smallTrees / 1000) + (this.trees / 100);
        game.oxygen += this.oxygenGain;
    };

    this.plantGrowth = function() {
        this.totalPlants = this.ferns+this.smallTrees+this.trees;
        this.treesDelta = this.smallTrees / 1000;
        this.smallTreesDelta = this.ferns / 1000 - this.treesDelta;
        this.fernsDelta = (game.land.soil - this.totalPlants) / 1000 - this.ferns / 1000;

        if(this.fernsDelta < 0) {
            var excessDying = 0;
            if (this.ferns + this.fernsDelta < 0) { //Not enough ferns to kill off
                excessDying = this.fernsDelta + this.ferns;
                this.fernsDelta = -1 * this.ferns;
            }
            this.smallTreesDelta += excessDying;
            excessDying = 0;
            if(this.smallTrees + this.smallTreesDelta < 0) { //Not enough small trees to kill off
                excessDying = this.smallTrees + this.smallTreesDelta;
                this.smallTreesDelta = -1 * this.smallTrees;
            }
            this.treesDelta += excessDying;
        }

        if(this.water < this.treesDelta) {
            this.treesDelta = this.water;
        }
        this.trees += this.treesDelta;
        this.water -= this.treesDelta > 0 ? this.treesDelta : 0;

        if(this.water < this.smallTreesDelta) {
            this.smallTreesDelta = this.water;
        }
        this.smallTrees += this.smallTreesDelta;
        this.water -= this.smallTreesDelta > 0 ? this.smallTreesDelta : 0;

        if(this.water < this.fernsDelta) {
            this.fernsDelta = this.water;
        }
        this.ferns += this.fernsDelta;
        this.water -= this.fernsDelta > 0 ? this.fernsDelta : 0;


    };

    this.transferWater = function() {
        this.transferred = this.water / 1000;
        this.water -= this.transferred;
        return this.transferred;
    };

}