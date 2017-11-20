function Spaceport() {
    this.cometSpotChance = 0.1;
    this.energy = 0;
    this.energyNeeded = 100;
    this.battleships = 0;
    this.comets = [
        {
            name: "Comet",
            amountType: "ice",
            amount:4000,
            duration:100,
            speed:5,
            size:20
        }
    ];

    this.tick = function() {
        this.removeAsteroidIfDone();
        this.checkForNewAsteroids();
    };

    this.checkForNewAsteroids = function() {
        var transferred = game.energy.energy / 1000;
        game.energy.energy -= transferred;
        this.energy += transferred + 1;
        if(this.energy >= this.energyNeeded) {
            this.energy -= this.energyNeeded;
            this.addComet();
        }
    };

    this.removeAsteroidIfDone = function() {
        for(var i = this.comets.length -1; i >= 0; i--) {
            var asteroid = this.comets[i];
            asteroid.duration--;
            if(asteroid.duration <= 0) {
                this.comets.splice(i, i+1);
            }
        }
        view.updateSpaceport();
    };

    this.addBattleship = function(amount) {
        this.battleships += amount;
        view.updateSpaceport();
    };

    this.addComet = function() {
        var typeRoll = Math.random();
        var comet = {
            name: "Comet",
            amountType: "ice",
            amount:4000,
            duration:100,
            speed:5,
            size:20
        };
        if(typeRoll < .5) {
            comet = {
                name: "Comet",
                amountType: "ice",
                amount:4000,
                duration:100,
                speed:5,
                size:20
            };
        } else {
            comet = {
                name: "Asteroid",
                amountType: "land",
                amount:400,
                duration:100,
                speed:5,
                size:20
            };
        }

    };
}