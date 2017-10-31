function Water() {
    this.indoor = 0;
    this.outdoor = 0;
    this.maxIndoor = 50;

    this.tick = function(gained) {
        this.indoor += gained;
        var excess = this.indoor - this.maxIndoor;
        if(excess > 0) {
            this.indoor = this.maxIndoor;
            this.outdoor += excess;
        }

    };

    this.transferWater = function() {
        this.transferred = this.outdoor / 1000;
        this.outdoor -= this.transferred;
        return this.transferred;
    };

    this.sellWater = function(toSell) {
        if(this.indoor < toSell) {
            toSell = this.indoor;
        }
        this.indoor -= toSell;
        return toSell;
    };

    this.getPrice = function(toSell) {
        return toSell * 1.2;
    }

}