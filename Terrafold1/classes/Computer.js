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
        if(row.currentTicks >= row.ticksNeeded) {
            var overflow = row.currentTicks - row.ticksNeeded;
            row.currentTicks = 0;
            row.completions++;
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
            ticksNeeded: 600,
            threads: 0,
            cost:0,
            costType:"",
            finish:function() { game.land.improveLand(); this.ticksNeeded = Math.floor(game.land.baseLand); },
            showing: function() { return true; }
        },
        { //Buy Ice
            currentTicks: 0,
            ticksNeeded: 50,
            threads: 0,
            cost:0,
            costType:"",
            finish:function() { game.buyIce(10) },
            showing: function() { return true; }
        },
        { //Sell Water
            currentTicks: 0,
            ticksNeeded: 50,
            threads: 0,
            cost:0,
            costType:"",
            finish:function() { game.water.sellWater(5) },
            showing: function() { return true; }
        },
        { //Improve Farms
            currentTicks: 0,
            ticksNeeded: 40,
            threads: 0,
            cost:0,
            costType:"",
            finish:function() { game.farms.improve(); this.ticksNeeded = precision3(20*(this.completions+2 )+ Math.pow(this.completions, 2)/10); },
            showing: function() { return true; }
        },
        { //Find more Ice Sellers
            currentTicks: 0,
            ticksNeeded: 2000,
            threads: 0,
            cost: .5,
            costType:"cash",
            finish:function() { game.ice.findIceSeller(1) },
            showing: function() { return true; }
        },
        { //Bigger Storms
            currentTicks: 0,
            ticksNeeded: 600,
            threads: 0,
            cost: 2,
            costType:"science",
            finish:function() { game.clouds.gainStormDuration(5); this.cost += .5; this.ticksNeeded += 50; },
            done:function() { return game.clouds.initialStormDuration >= 300; },
            showing: function() { return true; }
        },
        { //Build Robots
            currentTicks: 0,
            ticksNeeded: 10000,
            threads: 0,
            cost:.01,
            costType:"metal",
            finish:function() { game.robots.gainRobots(1) },
            showing: function() { return game.robots.unlocked; },
            done:function() { return game.robots.robots >= game.robots.robotMax; }
        },
        { //More Robot Storage
            currentTicks: 0,
            ticksNeeded: 20000,
            threads: 0,
            cost:10,
            costType:"science",
            finish:function() { game.robots.gainStorage(5); this.cost = precision3(20*(this.completions+2 )+ Math.pow(this.completions, 2)); this.ticksNeeded+=2000; },
            showing: function() { return game.robots.unlocked; }
        },
        { //Improve House Design
            currentTicks: 0,
            ticksNeeded: 3000,
            threads: 0,
            cost:.5,
            costType:"wood",
            finish:function() { game.population.improveHouse(); this.ticksNeeded += 500; },
            showing: function() { return game.robots.unlocked; },
            done:function() { return this.completions >= 100; }
        }
    ];
}

//Not saved, keep parity with processes
var processesView = [
    {
        text:"Optimize Land",
        tooltip:"Improve 1% of unimproved land.<br>Max to improve to is ( 10 x base land )<br>Percent Optimized: <div id='landOptimized'></div>"
    },
    {
        text:"Buy Ice",
        tooltip:"Buys up to 10 ice"
    },
    {
        text:"Sell Water",
        tooltip:"Sells up to 5 water"
    },
    {
        text:"Improve Farms",
        tooltip:"Farm efficiency increases by 2%"
    },
    {
        text:"Find more Ice Sellers",
        tooltip:"Gain 200 buyable ice and 1 more per tick"
    },
    {
        text:"Bigger Storms",
        tooltip:"Storms last 5 more ticks. Max 300 duration."
    },
    {
        text:"Build Robots",
        tooltip:"Builds a robot"
    },
    {
        text:"More Robot Storage",
        tooltip:"Can hold 5 more robots"
    },
    {
        text:"Improve House Design",
        tooltip:"Improves base happiness modifier by .1"
    }
];