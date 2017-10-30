//All things related to cash should be in this class
function Game() {
    this.totalLand = 1e10;
    this.cash = 100;
    this.wood = 0;
    this.ore = 0;

    this.tick = function() {
        this.ice.tick();


        this.land.tick(this.clouds.transferAmount());
        this.clouds.tick(this.water.transferAmount());
        this.water.tick(this.ice.transferAmount());
    };

    this.initialize = function() {
        this.ice = new Ice();
        this.water = new Water();
        this.clouds = new Clouds();
        this.land = new Land(this.totalLand);
        this.population = new Population();
        this.robots = new Robots();
        this.spaceport = new Spaceport();
    };

    this.buyIce = function() {
        var toBuy = Number(document.getElementById('buyIceAmount').value);
        if(toBuy <= 0) {
            return;
        }

        if(toBuy >= this.cash) {
            toBuy = this.cash;
        }
        this.cash -= this.ice.buyIce(toBuy);
        view.update();
    };

    this.sellWater = function() {
        var toSell = Number(document.getElementById('sellIndoorWaterAmount').value);
        if(toSell <= 0) {
            return;
        }
        var waterSold = this.water.sellWater(toSell);
        this.cash += this.water.getPrice(waterSold);
        view.update();
    }
}