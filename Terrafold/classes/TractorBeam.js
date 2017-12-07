function TractorBeam() {
    this.unlocked = 0;
    this.cometSpotChance = 0.01;
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
        // this.energy += transferred + 1;
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
        var length = this.comets.length - 1;
        for(var i = length; i >= 0; i--) {
            var comet = this.comets[i];
            comet.duration--;
            if(comet.duration < 0) {
                view.removeComet(comet);
                this.comets.splice(i, 1);
            }
        }
        view.updateSpaceStation();
    };

    this.addComet = function() {
        if(this.comets.length > 20) {
            return;
        }
        var typeRoll = Math.random();
        var amountRoll = Math.random() * 400 + 200;
        var durationRoll = Math.floor(Math.random() * 750 + 250);
        var speedRoll = Math.random() * 2 + 1;
        var comet = {};

        if(typeRoll < .6666) {
            comet = {
                name: "Comet",
                amountType: "ice",
                amount:amountRoll * 100,
                duration:durationRoll,
                initialDuration:durationRoll,
                speed:speedRoll,
                size:20
            };
        } else {
            comet = {
                name: "Asteroid",
                amountType: "dirt",
                amount:amountRoll,
                duration:durationRoll * 2,
                initialDuration:durationRoll * 2,
                speed:speedRoll / 2,
                size:5
            };
        }
        comet.id = cometId++;


        this.comets.push(comet);

    };
}