function Ice() {
    this.amount = 0;
    this.buyable = 100;
    this.gain = 1;
    this.max = 100;

    this.transferred = 0;

    this.tick = function() {
        this.buyable += this.gain;
        if(this.buyable > this.max) {
            this.buyable = this.max;
        }
    };

    this.transferAmount = function() {
        this.transferred = this.amount / 1000;
        this.amount -= this.transferred;
        return this.transferred;
    };

    this.buyIce = function(toBuy) {
        if(this.buyable < toBuy) {
            toBuy = this.buyable;
        }
        this.buyable -= toBuy;
        this.amount += toBuy;
        return toBuy;
    };
}