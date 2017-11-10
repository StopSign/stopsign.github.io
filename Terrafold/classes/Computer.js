function Computer() {
    this.unlocked = 0;
    this.threads = 1;
    this.freeThreads = 1;
    this.speed = 1;
    this.processes = [
        { //Optimize Land
            currentTicks: 0,
            ticksNeeded: 100,
            threads: 0,
            cost:0,
            costType:"",
            finish:function() { game.land.improveLand(1) }
        },
        { //Build Robots
            currentTicks: 0,
            ticksNeeded: 400,
            threads: 0,
            cost:.5,
            costType:"metal",
            finish:function() { game.robots.gainRobots(1) }
        },
        { //Buy Ice
            currentTicks: 0,
            ticksNeeded: 50,
            threads: 0,
            cost:0,
            costType:"",
            finish:function() { game.buyIce(10) }
        },
        { //Sell Water
            currentTicks: 0,
            ticksNeeded: 50,
            threads: 0,
            cost:0,
            costType:"",
            finish:function() { game.sellWater(10) }
        },
        { //Improve House Design
            currentTicks: 0,
            ticksNeeded: 100,
            threads: 0,
            cost:0,
            costType:"",
            finish:function() { game.population.improveHouse() }
        },
        { //More Robot Storage
            currentTicks: 0,
            ticksNeeded: 6000,
            threads: 0,
            cost:2,
            costType:"science",
            finish:function() { game.robots.gainStorage(10); this.cost += 10; }
        },
        { //Find more Ice Sellers
            currentTicks: 0,
            ticksNeeded: 2000,
            threads: 0,
            cost: .1,
            costType:"cash",
            finish:function() { game.ice.findIceSeller(1) }
        },
        { //Bigger Storms
            currentTicks: 0,
            ticksNeeded: 600,
            threads: 0,
            cost: 1,
            costType:"science",
            finish:function() { game.clouds.gainStormDuration(1); this.cost += 1; },
            done:function() { return game.clouds.stormDuration >= 300; }
        }
    ];

    this.tick = function() {
        for(var i = 0; i < this.processes.length; i++) {
            var row = this.processes[i];
            if(row.threads === 0 || (row.done && row.done())) {
                row.isMoving = 0;
                continue;
            }
            var ticksGained = this.speed * row.threads;
            var cost = ticksGained * row.cost;
            if(row.costType) {
                if(game[row.costType] < cost) {
                    continue;
                }
                game[row.costType] -= cost;
            }
            row.isMoving = 1;
            row.currentTicks += this.speed * row.threads;
            while(row.currentTicks > row.ticksNeeded) {
                row.currentTicks -= row.ticksNeeded;
                row.finish();
            }
        }
    };

    this.unlockComputer = function() {
        if(game.science >= 1000) {
            game.science -= 1000;
            this.unlocked = 1;
            view.checkComputerUnlocked();
        }
    };

    this.buyThread = function() {
        var threadCost = this.getThreadCost();
        if(game.science >= threadCost) {
            game.science -= threadCost;
            this.threads++;
            this.freeThreads++;
        }
        view.updateComputer();
    };
    this.getThreadCost = function() {
        return factorial(this.threads+1)*1000;
    };

    this.buySpeed = function() {
        var speedCost = this.getSpeedCost();
        if(game.cash >= speedCost) {
            game.cash -= speedCost;
            this.speed++;
        }
        view.updateComputer();
    };
    this.getSpeedCost = function() {
        return factorial(this.speed+1)*1000;
    };

    this.addThread = function(dataPos, numAdding) {
        if (this.freeThreads >= numAdding) {
            this.processes[dataPos].threads += numAdding;
            this.freeThreads -= numAdding;
        }
        view.updateComputer();
    };
    this.removeThread = function(dataPos, numRemoving) {
        if(this.processes[dataPos].threads >= numRemoving) {
            this.processes[dataPos].threads -= numRemoving;
            this.freeThreads += numRemoving;
        }
        view.updateComputer();
    }
}