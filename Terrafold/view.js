function View() {

    this.update = function() {
        this.updateInfo();
        this.updateIce();
        this.updateWater();
        this.updateClouds();
        this.updateLand();
    };

    this.updateInfo = function() {
        document.getElementById('cash').innerHTML = intToString(game.cash);
        document.getElementById('wood').innerHTML = intToString(game.wood);
        document.getElementById('ore').innerHTML = intToString(game.ore);
    };

    this.updateIce = function() {
        document.getElementById('ice').innerHTML = intToString(game.ice.amount);
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
        document.getElementById('clouds').innerHTML = intToString(game.clouds.amount);
        document.getElementById('stormTimer').innerHTML = game.clouds.stormTimer+"";
        document.getElementById('stormRate').innerHTML = game.clouds.stormRate+"%";
        document.getElementById('stormDuration').innerHTML = game.clouds.stormDuration+"";
        document.getElementById('rain').innerHTML = intToString(game.clouds.transferred, 4);
    };

    this.updateLand = function() {
        document.getElementById('landWater').innerHTML = intToString(game.land.amount);
        document.getElementById('land').innerHTML = intToString(game.land.land);
        document.getElementById('soil').innerHTML = intToString(game.land.soil);
        document.getElementById('landConverted').innerHTML = intToString(game.land.convertedLand);
        document.getElementById('soilWaterTransferred').innerHTML = intToString(game.land.transferred, 4);
    };

}