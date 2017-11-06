//All things related to cash should be in this class
function Game() {
    this.totalLand = 1000;
    this.cash = 10000; //Actual default: 100
    this.oxygen = 0;
    this.science = 0;
    this.metal = 0;

    this.tick = function() {
        this.ice.tick();

        this.population.tick();
        this.farms.tick(this.land.transferWater());
        this.water.outdoor += this.farms.transferWater();
        this.trees.tick(this.land.transferWater());
        this.water.outdoor += this.trees.transferWater();
        this.land.tick(this.clouds.transferWater());
        this.clouds.tick(this.water.transferWater());
        this.water.tick(this.ice.transferWater());

        this.oxygenLeak = this.oxygen / 100000;
        this.oxygen -= this.oxygenLeak;
    };

    this.initialize = function() {
        this.ice = new Ice();
        this.water = new Water();
        this.clouds = new Clouds();
        this.land = new Land(this.totalLand);
        this.trees = new Trees();
        this.farms = new Farms();
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
    };

    this.buyFarms = function() {
        var toBuy = Number(document.getElementById('buyFarmAmount').value);
        if(toBuy * 50 > this.oxygen) {
            toBuy = Math.floor(this.oxygen/50);
        }
        if(toBuy * 50 > this.land.soil) {
            toBuy = Math.floor(this.land.soil/50);
        }
        if(toBuy <= 0) {
            return;
        }
        this.oxygen -= toBuy * 50;
        this.land.soil -= toBuy * 50;
        this.farms.addFarm(toBuy);
    };
}