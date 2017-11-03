function View() {

    this.update = function() {
        this.updateInfo();
        this.updateIce();
        this.updateWater();
        this.updateClouds();
        this.updateLand();
        this.updateTrees();
        this.updateFarms();
        this.updatePopulation();
    };

    this.updateInfo = function() {
        document.getElementById('cash').innerHTML = intToString(game.cash);
        document.getElementById('wood').innerHTML = intToString(game.wood);
        document.getElementById('science').innerHTML = intToString(game.science);
        document.getElementById('metal').innerHTML = intToString(game.metal);
    };

    this.updateIce = function() {
        document.getElementById('ice').innerHTML = intToString(game.ice.ice);
        document.getElementById('buyableIce').innerHTML = intToString(game.ice.buyable);
        document.getElementById('iceTransferred').innerHTML = intToString(game.ice.transferred, 4);
    };

    this.updateWater = function() {
        document.getElementById('indoorWater').innerHTML = intToString(game.water.indoor);
        document.getElementById('indoorWaterMax').innerHTML = intToString(game.water.maxIndoor);

        document.getElementById('outdoorWater').innerHTML = intToString(game.water.outdoor);
        document.getElementById('waterTransferred').innerHTML = intToString(game.water.transferred, 4);
    };

    this.updateClouds = function() {
        document.getElementById('clouds').innerHTML = intToString(game.clouds.water);
        document.getElementById('stormTimer').innerHTML = game.clouds.stormTimer+"";
        document.getElementById('stormRate').innerHTML = game.clouds.stormRate+"%";
        document.getElementById('stormDuration').innerHTML = game.clouds.stormDuration+"";
        document.getElementById('rain').innerHTML = intToString(game.clouds.transferred, 4);
    };

    this.updateLand = function() {
        document.getElementById('landWater').innerHTML = intToString(game.land.water);
        document.getElementById('land').innerHTML = intToString(game.land.land);
        document.getElementById('soil').innerHTML = intToString(game.land.soil);
        document.getElementById('landConverted').innerHTML = intToString(game.land.convertedLand, 4);
        document.getElementById('soilWaterTransferred').innerHTML = intToString(game.land.transferred, 4);
    };

    this.updateTrees = function() {
        document.getElementById('treesWater').innerHTML = intToString(game.trees.water);
        document.getElementById('trees').innerHTML = intToString(game.trees.trees);
    };

    this.updateFarms = function() {
        document.getElementById('farmsWater').innerHTML = intToString(game.farms.water);
        document.getElementById('farms').innerHTML = intToString(game.farms.farms);
        document.getElementById('food').innerHTML = intToString(game.farms.food);
        document.getElementById('foodCreated').innerHTML = intToString(game.farms.foodCreated);
    };

    this.updatePopulation = function() {
        document.getElementById('population').innerHTML = intToString(game.population.people);
        document.getElementById('foodEaten').innerHTML = intToString(game.population.foodEaten, 4);
        document.getElementById('populationGrowth').innerHTML = intToString(game.population.popGrowth, 4);
        document.getElementById('starving').innerHTML = intToString(game.population.starving, 4);

    }

}