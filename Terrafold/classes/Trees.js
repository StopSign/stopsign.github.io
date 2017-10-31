function Trees() {
    this.water = 0;
    this.trees = 0;


    this.tick = function(gained) {
        this.water += gained;
        this.treeGrowth();
        return this.trees / 100;
    };

    this.transferWater = function() {
        this.transferred = this.water / 1000;
        this.water -= this.transferred;
        return this.transferred;
    };

    this.treeGrowth = function() {
        var treeGrowth = (game.land.soil - this.trees) / 1000;
        if(treeGrowth > this.water) {
            treeGrowth = this.water;
        }
        this.trees += treeGrowth;
        this.water -= treeGrowth;
    }

}