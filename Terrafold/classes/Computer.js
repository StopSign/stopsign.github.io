function Computer() {
    this.unlocked = 0;
    this.threads = 1;
    this.freeThreads = 1;
    this.speed = 1;

    this.tick = function() {
        for(var i = 0; i < this.processes.length; i++) {
            this.tickRow(this.processes[i], this.speed * this.processes[i].threads);
        }
    };

    this.tickRow = function(row, ticksGained) {
        if(ticksGained === 0 || (row.done && row.done())) {
            row.isMoving = 0;
            return;
        }
        var cost = ticksGained * row.cost;
        if(row.costType) {
            if(game[row.costType] < cost) {
                row.isMoving = 0;
                return;
            }
            game[row.costType] -= cost;
        }
        row.currentTicks += ticksGained;
        row.isMoving = 1;
        if(row.currentTicks > row.ticksNeeded) {
            var overflow = row.currentTicks - row.ticksNeeded;
            row.currentTicks = 0;
            row.finish();
            this.tickRow(row, overflow); //recursive, but on the new cost
        }
    };

    this.unlockComputer = function() {
        if(game.science >= 1000) {
            game.science -= 1000;
            this.unlocked = 1;
            view.checkComputerUnlocked();
        }
        view.updateComputer();
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
        return precision2(Math.pow(2, this.threads)*500);
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
        return precision2(Math.pow(2, this.speed)*500);
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
    };

    this.processes = [
        { //Optimize Land
            currentTicks: 0,
            ticksNeeded: 100,
            threads: 0,
            cost:0,
            costType:"",
            finish:function() { game.land.improveLand(1); }
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
            ticksNeeded: 300,
            threads: 0,
            cost:0,
            costType:"",
            finish:function() { game.population.improveHouse(); this.ticksNeeded = 300; }
        },
        { //More Robot Storage
            currentTicks: 0,
            ticksNeeded: 6000,
            threads: 0,
            cost:2,
            costType:"science",
            finish:function() { game.robots.gainStorage(10); this.cost += 1; }
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
            cost: 2,
            costType:"science",
            finish:function() { game.clouds.gainStormDuration(5); this.cost += 1; this.ticksNeeded += 100; },
            done:function() { return game.clouds.stormDuration >= 300; }
        }
    ];

    for(var i = 0; i < this.processes.length; i++) {
        view.addComputerRow(i);
    }
}

//Not saved, keep parity with processes
var processesView = [
    {
        text:"Optimize Land",
        tooltip:"Turn one land into ten.<br>Cannot convert land twice<br>Percent Optimzed: <div id='landOptimized'></div>"
    },
    {
        text:"Build Robots",
        tooltip:"Builds a robot"
    },
    {
        text:"Buy Ice",
        tooltip:"Buys up to 10 ice"
    },
    {
        text:"Sell Water",
        tooltip:"Sells up to 10 water"
    },
    {
        text:"Improve House Design",
        tooltip:"Improves base happiness modifier by .1"
    },
    {
        text:"More Robot Storage",
        tooltip:"Can hold 10 more robots"
    },
    {
        text:"Find more Ice Sellers",
        tooltip:"Gain 100 buyable ice and 1 more per tick"
    },
    {
        text:"Bigger Storms",
        tooltip:"Storms last 5 more ticks. Max 300 duration."
    }
];