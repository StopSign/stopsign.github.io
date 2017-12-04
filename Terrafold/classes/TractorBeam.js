function TractorBeam() {
    this.unlocked = 0;
    this.cometSpotChance = 0.03;
    this.energy = 0;
    this.energyNeeded = 100;

    this.comets = [
    ];

    this.tick = function() {
        if(!this.unlocked) {
            return;
        }
        this.removeAsteroidIfDone();
        this.checkForNewAsteroids();

        var transferred = game.energy.energy / 1000;
        game.energy.energy -= transferred;
        this.energy += transferred + 1;
        this.pullIntoOrbit();
    };

    this.unlockTractorBeam = function() {
        if(game.science >= 5e5 && game.oxygen >= 5e6) {
            game.science -= 5e5;
            game.oxygen -= 2e6;
            this.unlocked = 1;
            view.checkTractorBeamUnlocked();
        }
        view.updateTractorBeam();
    };

    this.pullIntoOrbit = function() {
        if(this.energy >= this.energyNeeded) {
            this.energy -= this.energyNeeded;

            for(var i = 0; i < this.comets.length; i++) {
                var comet = this.comets[i];
                for(var j = 0; j < game.spaceStation.orbiting.length; j++) {
                    var orbiting = game.spaceStation.orbiting[j];
                    if(comet.amountType === orbiting.type) {
                        var taken = comet.amount / 1000;
                        comet.amount -= taken;
                        orbiting.amount += taken;
                    }
                }
            }
        }
    };

    this.checkForNewAsteroids = function() {
        var discoverChance = Math.random();
        if(discoverChance < this.cometSpotChance) {
            this.addComet();
        }
    };

    this.removeAsteroidIfDone = function() {
        for(var i = this.comets.length - 1; i >= 0; i--) {
            var asteroid = this.comets[i];
            asteroid.duration--;
            if(asteroid.duration <= 0) {
                this.comets.splice(i, i+1);
            }
        }
        view.updateSpaceStation();
    };

    this.addComet = function() {
        var typeRoll = Math.random();
        var comet = {};

        if(typeRoll < .5) {
            comet = {
                name: "Comet",
                amountType: "ice",
                amount:4000,
                duration:1000,
                speed:5,
                size:20
            };
        } else {
            comet = {
                name: "Asteroid",
                amountType: "dirt",
                amount:400,
                duration:1000,
                speed:5,
                size:20
            };
        }
        this.comets.push(comet);

    };
}