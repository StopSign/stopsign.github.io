//All things related to cash should be in this class
function Game() {
    this.totalLand = 1000;
    this.cash = 100; //Actual default: 100
    this.oxygen = 0;
    this.science = 0; //Actual default: 0
    this.wood = 0;
    this.metal = 0;
    this.power = 0;
    this.hangars = [];

    this.tick = function() {
        this.ice.tick();

        this.robots.tick();
        this.computer.tick();
        this.farms.tick(this.land.transferWater());
        this.population.tick();
        this.water.outdoor += this.farms.transferWater();
        this.trees.tick(this.land.transferWater());
        this.water.outdoor += this.trees.transferWater();
        this.land.tick(this.clouds.transferWater());
        this.clouds.tick(this.water.transferWater());
        this.energy.tick();
        this.water.tick(this.ice.transferWater());

        this.tractorBeam.tick();
        this.spaceStation.tick();
        this.space.tick();


        this.oxygenLeak = this.oxygen / 100000;
        this.oxygen -= this.oxygenLeak;
        for(var i = 0; i < this.hangars.length; i++) {
            this.hangars[i].tick();
        }
    };

    this.initialize = function() {
        this.space = new Space();
        this.ice = new Ice();
        this.water = new Water();
        this.clouds = new Clouds();
        this.land = new Land(this.totalLand);
        this.trees = new Trees();
        this.farms = new Farms();
        this.population = new City();
        this.computer = new Computer();
        this.robots = new Robots();
        this.energy = new Energy();
        this.spaceStation = new SpaceStation();
        this.tractorBeam = new TractorBeam();
        this.spaceDock = new SpaceDock();


        for(var i = 0; i < this.computer.processes.length; i++) {
            view.addComputerRow(i);
            this.computer.processes[i].isMoving = 0;
            this.computer.processes[i].completions = 0;
        }
        for(i = 0; i < this.robots.jobs.length; i++) {
            view.addRobotRow(i);
            this.robots.jobs[i].completions = 0;
        }
        for(i = 0; i < 1; i++) {
            this.hangars[i] = new Hangar(i);
        }


        this.space.newLevel();
        // game.space.spawnShip(new Ship("Battleship", 200, 1e9), 350);
    };

    this.buyIce = function(toBuy) {
        if(toBuy === undefined) {
            toBuy = Number(document.getElementById('buyIceAmount').value);
            var shouldUpdate = true;
        }
        if(toBuy > this.cash) {
            toBuy = this.cash;
        }
        if(toBuy <= 0) {
            return;
        }
        this.cash -= this.ice.buyIce(toBuy);
        if(shouldUpdate) {
            view.update();
        }
    };

    this.buyFarms = function() {
        var toBuy = Number(document.getElementById('buyFarmAmount').value);
        if(toBuy * 50 > this.land.soil) {
            toBuy = Math.floor(this.land.soil/50);
        }
        if(toBuy <= 0) {
            return;
        }
        this.land.soil -= toBuy * 50;
        this.farms.addFarm(toBuy);
        view.update();
    };

    this.buyBattery = function() {
        var toBuy = Number(document.getElementById('buyBattery').value);
        if(toBuy * 3e4 > this.oxygen) {
            toBuy = Math.floor(this.oxygen/3e4);
        }
        if(toBuy * 2e4 > this.science) {
            toBuy = Math.floor(this.science/2e4);
        }
        if(toBuy <= 0) {
            return;
        }
        this.oxygen -= toBuy * 3e4;
        this.science -= toBuy * 2e4;
        this.energy.buyBattery(toBuy);
        view.update();
    };

    this.buyBattleship = function() {
        var toBuy = Number(document.getElementById('buyBattleshipAmount').value);
        if(toBuy * 3e7 > this.oxygen) {
            toBuy = Math.floor(this.oxygen / 3e7);
        }
        if(toBuy * 1.5e7 > this.science) {
            toBuy = Math.floor(this.science / 1.5e7);
        }
        if(toBuy <= 0) {
            return;
        }
        this.oxygen -= 3e7;
        this.science -= 1.5e7;
        this.spaceDock.addBattleship(toBuy);
        view.update();
    };

}