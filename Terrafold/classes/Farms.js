function Farms() {
    this.water = 0;
    this.farms = 0;
    this.food = 0;
    this.foodCreated = 0;
    this.efficiency = 1;

    this.tick = function(gained) {
        this.water += gained;
        this.food += this.gainFood();
    };

    this.transferWater = function() {
        this.transferred = this.water / 1000;
        this.water -= this.transferred;
        return this.transferred;
    };

    this.gainFood = function() {
        var foodGain = this.farms / 100 * this.efficiency;
        if(foodGain > this.water) {
            foodGain = this.water;
        }
        this.foodCreated = foodGain;
        this.water -= foodGain;
        return foodGain;
    };

    this.addFarm = function(amount) {
        this.farms += amount;
    };

    this.improve = function(amount) {
        this.efficiency += .5;
    };
}