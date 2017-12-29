function Farms() {
    this.water = 0;
    this.farms = 0;
    this.food = 0;
    this.foodCreated = 0;
    this.efficiency = 1;

    this.tick = function(gained) {
        this.water += gained;
        this.gainFood();
    };

    this.transferWater = function() {
        this.transferred = this.water / 1000;
        this.water -= this.transferred;
        return this.transferred;
    };

    this.gainFood = function() {
        this.foodCreated = this.farms / 100 * this.efficiency;
        if(this.foodCreated > this.water) {
            this.foodCreated = this.water;
        }
        this.water -= this.foodCreated;
        this.food += this.foodCreated;
    };

    this.addFarm = function(amount) {
        this.farms += amount;
    };

    this.improve = function() {
        this.efficiency += .02;
    };
}