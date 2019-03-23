function Ice() {
    this.ice = 0;
    this.buyable = 1000;
    this.gain = 10;
    this.max = 1000;

    this.transferred = 0;

    this.tick = function() {
        this.buyable += this.gain;
        if(this.buyable > this.max) {
            this.buyable = this.max;
        }
    };

    this.transferWater = function() {
        this.transferred = this.ice / 1000;
        this.ice -= this.transferred;
        return this.transferred;
    };

    this.buyIce = function(toBuy) {
        if(this.buyable < toBuy) {
            toBuy = this.buyable;
        }
        this.buyable -= toBuy;
        this.ice += toBuy;
        return toBuy;
    };

    this.findIceSeller = function(amount) {
        this.max += amount * 200;
        this.gain += amount;
    }
}