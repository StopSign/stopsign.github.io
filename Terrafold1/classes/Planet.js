
function Planet() {
    this.isBoss = 0;
    this.view = {};
    this.view.rotation = 0;
    this.view.rotationSpeed = Math.random();
    this.view.color = Math.floor(Math.random() * 360);
    this.view.light = Math.floor(Math.random() * 15 + 40);

    this.findArea = function() {
        for(var i = 0; i < game.space.planets.length; i++) {
            var target = game.space.planets[i];
            if(target === this) {
                continue;
            }
            var counter = 0;
            while(this.withinDistance(this.x, this.y, 75)) {
                counter++;
                if(counter > 40) {
                    console.log("too many planets");
                    return;
                }
                this.x = this.xAreaAllowed();
                this.y = this.yAreaAllowed();
            }
        }
    };
    this.xAreaAllowed = function() {
        return Math.random() * 620;
    };
    this.yAreaAllowed = function() {
        return Math.random() * 330 + 5;
    };
    this.withinDistance = function(x1, y1, radius) {
        for(var i = 0; i < game.space.planets.length; i++) {
            var target = game.space.planets[i];
            if(target === this) {
                continue;
            }
            if(withinDistance(x1, y1, target.x, target.y, radius)) {
                return true;
            }
        }
        return false;
    };

    this.x = this.xAreaAllowed();
    this.y = this.yAreaAllowed();
    this.findArea();


    this.tick = function() {
        this.regenShields();
        this.tickResources();
        rotatePlanet(this);
    };
    this.empty = function() {
        return this.dirt <= 0;
    };
    this.alive = function() {
        return this.health > 0;
    };
    this.regenShields = function() {
        if(!this.alive()) {
            this.atmo = 0;
            return;
        }
        this.atmo += (this.maxAtmo - this.atmo) / 100;
        if(this.atmo > this.maxAtmo) {
            this.atmo = this.maxAtmo;
        }
    };
    this.getShieldReduction = function() {
        return this.atmo / this.maxAtmo;
    };
    this.takeDamage = function(damage) {
        var healthDamage = damage * (1 - this.getShieldReduction());
        this.atmo -= damage * this.getShieldReduction();
        var extraDamage = 0;
        if(this.atmo < 0) {
            extraDamage = this.atmo * -1;
            this.atmo = 0;
        }

        this.health -= healthDamage + extraDamage;
        if(this.health < 0) {
            this.health = 0;
        }
    };

    this.calcPower = function(id, difficulty) { //difficulty starts at 1
        this.id = id;
        this.power = Math.sqrt((this.id+1)*this.isBoss?1.5:1);
        this.atmo = this.maxAtmo = precision3(this.power*100 * difficulty);
        this.health = this.maxHealth = precision3(this.power*1000 * difficulty);
        this.dirt = precision3(this.power*2000);

        this.mineTicksMax = Math.floor(Math.sqrt(this.dirt)*40);
        this.factoryTicksMax = Math.floor(Math.sqrt(this.dirt)*200);
        this.maxMines = Math.floor((this.dirt+.1) / 1000);
        this.solarTicksMax = 1000;
        this.coilgunTicksMax = Math.floor(Math.sqrt(this.dirt)*100);
    };

    this.workConstruction = function(amount) { //Comes from ships
        if(!this.doneFactory()) {
            this.workOnFactory(amount);
            return;
        }
        if(!this.doneCoilgun()) {
            this.workOnCoilgun(amount);
            return;
        }
        this.workOnMine(amount);
    };
    this.tickResources = function() {
        if(this.empty()) {
            return;
        }
        this.tickMines();
        this.tickBots();
        this.tickFactory();
        this.tickSolar();
        this.tickCoilgun();
    };


    this.mines = 0;
    this.mineTicks = 0;
    this.ore = 0;
    this.doneBuilding = function() {
        return this.mines >= this.maxMines;
    };
    this.workOnMine = function(amount) {
        this.mineTicks += amount;
        if(this.mineTicks >= this.mineTicksMax) {
            this.mines++;
            this.mineTicks -= this.mineTicksMax;
        }
    };
    this.tickMines = function() {
        this.ore += precision2(this.mines/10);
    };

    this.bots = 0;
    this.tickBots = function() {
        var botWork = precision2(this.bots/10);
        this.ore -= botWork;
        this.workOnSolar(botWork);
    };

    this.factoryTicks = 0;
    this.doneFactory = function() {
        return this.factoryTicks >= this.factoryTicksMax;
    };
    this.workOnFactory = function(amount) {
        this.factoryTicks += amount;
    };
    this.tickFactory = function() {
        if(this.ore >= 200) {
            this.ore -= 200;
            this.bots++;
        }
    };

    this.solarTicks = 0;
    this.solar = 0;
    this.workOnSolar = function(amount) {
        this.solarTicks += amount;
        while(this.solarTicks >= this.solarTicksMax) {
            this.solarTicks -= this.solarTicksMax;
            this.solar++;
        }
    };
    this.tickSolar = function() {
        this.coilgunCharge += precision2(this.solar/10);
    };

    this.energy = 0;
    this.coilgunTicks = 0;
    this.coilgunCharge = 0;
    this.coilgunChargeMax = 1000;
    this.doneCoilgun = function() {
        return this.coilgunTicks >= this.coilgunTicksMax;
    };
    this.workOnCoilgun = function(amount) {
        this.coilgunTicks += amount;
    };
    this.tickCoilgun = function() {
        if(this.coilgunCharge >= this.coilgunChargeMax) {
            this.coilgunCharge -= this.coilgunChargeMax;
            var loadSize = 500;
            if(this.dirt <= loadSize) {
                loadSize = this.dirt;
            }
            this.dirt -= loadSize;
            //TODO create a meteorite and launch it instead
            game.spaceStation.orbiting[1].amount += loadSize
        }
    };
}