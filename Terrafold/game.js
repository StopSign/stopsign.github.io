//All things related to cash should be in this class
function Game() {
    this.totalLand = 1000;
    this.cash = 100; //Actual default: 100
    this.oxygen = 0;
    this.science = 0; //Actual default: 0
    this.wood = 0;
    this.metal = 0;
    this.power = 0;

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
    };

    this.buyIce = function(toBuy) {
        if(toBuy === undefined) {
            toBuy = Number(document.getElementById('buyIceAmount').value);
        }
        if(toBuy > this.cash) {
            toBuy = this.cash;
        }
        if(toBuy <= 0) {
            return;
        }
        this.cash -= this.ice.buyIce(toBuy);
        view.update();
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
        if(toBuy * 5e5 > this.oxygen) {
            toBuy = Math.floor(this.oxygen/5e5);
        }
        if(toBuy * 50000 > this.science) {
            toBuy = Math.floor(this.science/50000);
        }
        if(toBuy <= 0) {
            return;
        }
        this.oxygen -= toBuy * 5e5;
        this.science -= toBuy * 50000;
        this.energy.buyBattery(toBuy);
        view.update();
    };

    this.buyBattleship = function() {
        var toBuy = Number(document.getElementById('buyBattleshipAmount').value);
        if(toBuy * 1e7 > this.oxygen) {
            toBuy = Math.floor(this.oxygen / 1e7);
        }
        if(toBuy * 5e6 > this.science) {
            toBuy = Math.floor(this.science / 5e6);
        }
        if(toBuy <= 0) {
            return;
        }
        this.oxygen -= 1e7;
        this.science -= 5e6;
        this.spaceDock.addBattleship(toBuy);
        view.update();
    };

}