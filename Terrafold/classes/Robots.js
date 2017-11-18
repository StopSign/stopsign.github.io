function Robots() {
    this.robots = 0;
    this.robotsFree = 0;
    this.robotMax = 10;
    this.unlocked = 0;
    this.ore = 0;
    this.mines = 0;

    this.tick = function() {
        for(var i = 0; i < this.jobs.length; i++) {
            this.tickRow(this.jobs[i], this.jobs[i].workers);
        }
    };

    this.tickRow = function(row, ticksGained) {
        if(ticksGained === 0 || (row.done && row.done())) {
            row.isMoving = 0;
            return;
        }
        if(!row.ticksNeeded) { //No progress bar
            row.finish();
            return;
        }
        var cost = ticksGained * row.cost;
        if (row.costType) {
            if (game[row.costType] < cost) {
                row.isMoving = 0;
                return;
            }
            game[row.costType] -= cost;
        }
        row.currentTicks += ticksGained;
        row.isMoving = 1;
        if (row.currentTicks >= row.ticksNeeded) {
            var overflow = row.currentTicks - row.ticksNeeded;
            row.currentTicks = 0;
            row.completions++;
            row.finish();
            this.tickRow(row, overflow); //recursive, but on the new cost
        }
    };

    this.gainRobots = function(amount) {
        this.robots += amount;
        this.robotsFree += amount;
        view.updateRobots();
    };

    this.gainStorage = function(amount) {
        this.robotMax += amount;
        view.updateRobots();
    };

    this.unlockRobots = function() {
        if(game.cash >= 3000) {
            game.cash -= 3000;
            this.unlocked = 1;
            view.checkRobotsUnlocked();
            this.gainRobots(1);
        }
        view.updateComputer();
        view.updateRobots();
    };

    this.addWorker = function(dataPos, numAdding) {
        if (this.robotsFree >= numAdding) {
            this.jobs[dataPos].workers += numAdding;
            this.robotsFree -= numAdding;
        }
        view.updateRobots();
    };
    this.removeWorker = function(dataPos, numRemoving) {
        if(this.jobs[dataPos].workers >= numRemoving) {
            this.jobs[dataPos].workers -= numRemoving;
            this.robotsFree += numRemoving;
        }
        view.updateRobots();
    };

    this.cutTrees = function(mult) {
        if(game.trees.trees >= 1 * mult) {
            game.trees.trees -= 1 * mult;
            game.wood += mult;
        }
    };

    this.mineOre = function(mult) {
        game.robots.ore += game.robots.mines / 100 * mult;
    };

    this.smeltOre = function(mult) {
        if(game.wood >= 5 * mult && this.ore >= mult && game.oxygen >= mult*1000) {
            game.wood -= 5 * mult;
            this.ore -= mult;
            game.oxygen -= 1000*mult;
            game.metal += mult;
        }
    };

    this.jobs = [
        { //Cut Trees
            workers:0,
            finish: function() { game.robots.cutTrees(this.workers); },
            showing: function() { return true; }
        },
        { //Expand indoor water storage
            currentTicks: 0,
            ticksNeeded: 3000,
            workers:0,
            cost:.1,
            costType:"metal",
            finish: function() { this.ticksNeeded += 1000; game.water.maxIndoor+= 50; },
            showing: function() { return true; }
        },
        { //Build Mines
            currentTicks: 0,
            ticksNeeded: 1000,
            workers:0,
            cost:1,
            costType:"wood",
            finish: function() { game.robots.mines++; },
            done: function() { return game.robots.mines*1000 >= game.land.optimizedLand; },
            showing: function() { return true; }
        },
        { //Mine Ore
            workers:0,
            finish: function() { game.robots.mineOre(this.workers); },
            showing: function() { return true; }
        },
        { //Smelt Ore
            workers:0,
            finish: function() { game.robots.smeltOre(this.workers); },
            showing: function() { return true; }
        }
    ];
}

var jobsView = [
    {
        text:"Cut Trees",
        tooltip:"Cut down 1 tree for 1 wood"
    },
    {
        text:"Expand indoor water storage",
        tooltip:"Gives 50 more max indoor water.<br>Cost increases by 1"
    },
    {
        text:"Build Mines",
        tooltip:"Build up to (total land / 1000) mines"
    },
    {
        text:"Mine Ore",
        tooltip:"Get (mines / 100) ore per tick"
    },
    {
        text:"Smelt Ore",
        tooltip:"Each tick costs 5 wood, 1 ore, and 1000 oxygen<br>Gain 1 metal"
    }
];