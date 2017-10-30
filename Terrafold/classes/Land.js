function Land(totalLand) {
    this.land = totalLand;
    this.amount = 0;
    this.soil = 0;
    this.transferred = 0;

    this.tick = function(amount) {
        this.amount += amount;
        this.turnLandToSoil();
    };

    this.turnLandToSoil = function() {
        this.convertedLand = this.amount / 1000;
        if(this.land < this.convertedLand) {
            this.convertedLand = this.land;
        }
        this.land -= this.convertedLand;
        this.soil += this.convertedLand;
        this.amount -= this.convertedLand;
    };

    this.transferAmount = function() {
        this.transferred = this.amount / 1000;
        this.amount -= this.transferred;
        return this.transferred;
    };
}