function Clouds() {
    this.water = 0;
    this.initialStormTimer = 300;
    this.stormTimer = 300;
    this.stormRate = 0; //climbs to 100, stays for stormDuration, falls to 0
    this.storming = 0;
    this.initialStormDuration = 60;
    this.stormDuration = 60;
    this.transferred = 0;
    this.lightningChance = 0;
    this.lightningStrength = 0;

    this.tick = function(gained) {
        this.water += gained;
        this.nextStormTimer();
        return this.tickLightning();
    };

    this.tickLightning = function() {
        this.lightningChance += .01 * this.stormRate / 100;
        this.lightningStrength = Math.pow(this.water, .5);
        if(this.stormRate === 100 && this.lightningChance > Math.random()*100) {
            this.lightningChance = 0;
            game.energy.gainEnergy(this.lightningStrength);
        }
    };

    this.transferWater = function() {
        this.transferred = this.water / 500 * this.stormRate / 100;
        this.water -= this.transferred;
        return this.transferred;
    };

    this.nextStormTimer = function() {
        if(this.stormTimer > 0) {
            this.stormTimer--;
        } else if(this.stormDuration > 0) {
            this.storming = 1;
        }

        if(this.stormRate >= 100) {
            this.storming = 0;
            if(this.stormDuration > 0) {
                this.storming = 0;
                this.stormDuration--;
            } else {
                this.storming = -1;
            }
        } else if(this.stormRate <= 0 && this.storming === -1) {
            this.stormDuration = this.initialStormDuration;
            this.stormTimer = this.initialStormTimer;
            this.storming = 0;
        }

        this.stormRate += this.storming;
    };

    this.gainStormDuration = function(amount) {
        this.stormDuration += amount;
        this.initialStormDuration += amount;
    }
}