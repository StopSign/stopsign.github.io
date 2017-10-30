function Clouds() {
    this.amount = 0;
    this.initialStormTimer = 300;
    this.stormTimer = 300;
    this.stormRate = 0; //climbs to 100, stays for stormDuration, falls to 0
    this.storming = 0;
    this.initialStormDuration = 20;
    this.stormDuration = 20;
    this.transferred = 0;

    this.tick = function(gained) {
        this.amount += gained;
        this.nextStormTimer();
    };

    this.transferAmount = function() {
        this.transferred = this.amount / 1000 * this.stormRate / 100;
        this.amount -= this.transferred;
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
}