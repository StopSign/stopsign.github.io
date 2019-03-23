function TractorBeam() {
    this.unlocked = 0;
    this.cometSpotChance = 0.004;
    this.energy = 0;
    this.energyNeeded = 100;
    this.takeAmount = "";

    this.comets = [];

    this.tick = function() {
        if(!this.unlocked) {
            return;
        }
        this.removeAsteroidIfDone();
        this.checkForNewAsteroids();

        var transferred = game.power / 1000;
        game.power -= transferred;
        this.energy += transferred;
        this.pullIntoOrbit();
    };

    this.unlockTractorBeam = function() {
        if(game.science >= 5e5 && game.oxygen >= 5e6) {
            game.science -= 5e5;
            game.oxygen -= 2e6;
            this.unlocked = 1;
            view.checkTractorBeamUnlocked();
            game.spaceDock.unlocked = 1;
            view.checkSpaceDockUnlocked();
        }
        view.updateTractorBeam();
    };

    this.pullIntoOrbit = function() {
        while(this.energy >= this.energyNeeded) {
            this.energy -= this.energyNeeded;
            this.takeAmount = "";
            for(var j = 0; j < game.spaceStation.orbiting.length; j++) {
                var orbiting = game.spaceStation.orbiting[j];
                var totalAmount = 0;
                for(var i = 0; i < this.comets.length; i++) {
                    var comet = this.comets[i];
                    if(comet.amountType === orbiting.type) {
                        var taken = comet.amount / 100 + 10;
                        comet.amount -= taken;
                        totalAmount += taken;
                    }
                }
                orbiting.amount += totalAmount;
                this.takeAmount += intToString(totalAmount, 3) + " " + orbiting.type;
                if(j < game.spaceStation.orbiting.length -1 ) {
                    this.takeAmount += ", "
                }
            }
        }
    };

    this.checkForNewAsteroids = function() {
        var discoverChance = Math.random();
        if(discoverChance < this.cometSpotChance || this.comets.length === 0) {
            this.addComet();
        }
    };

    this.removeAsteroidIfDone = function() {
        var length = this.comets.length - 1;
        for(var i = length; i >= 0; i--) {
            var comet = this.comets[i];
            comet.duration--;
            if(comet.duration < 0 || comet.amount < 1) {
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

        if(typeRoll < .9) {
            comet = {
                name: "Comet",
                amountType: "ice",
                amount:amountRoll * 1000,
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