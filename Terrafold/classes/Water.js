function Water() {
    this.indoor = 0;
    this.outdoor = 0;
    this.maxIndoor = 50;
    this.selling = 0;
    this.excess = 0;
    this.gain = 0;

    this.tick = function(gained) {
        this.indoor += gained;

        this.excess = this.indoor - this.maxIndoor;
        if(this.excess > 0) {
            this.indoor = this.maxIndoor;
            this.outdoor += this.excess;
        } else {
            this.excess = 0;
        }

        this.selling = this.indoor / 100;
        this.indoor -= this.selling;
        this.gain = this.selling * 2;
        game.cash += this.gain;

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
        game.cash += this.getPrice(toSell);
    };

    this.getPrice = function(toSell) {
        return toSell * 2;
    }

}