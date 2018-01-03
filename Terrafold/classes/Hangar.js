function Hangar(num) {
    this.num = num;
    this.sendRate = 2;
    this.timeRemaining = 0;
    this.totalTime = 300;

    this.tick = function() {
        this.timeRemaining--;
        if(this.timeRemaining < 0) {
            if (game.spaceDock.battleships >= this.sendRate) {
                game.space.spawnShip(JSON.parse(JSON.stringify(sendTypes[0])), this.sendRate);
                game.spaceDock.battleships -= this.sendRate;
                this.timeRemaining = this.totalTime;
                view.updateSpaceDock();
            } else {
                this.timeRemaining = 0;
            }
        }
    }

}

var sendTypes = [
    {
        name:"Battleship",
        amount:0,
        health:20,
        shield:10,
        shieldRegen:1,
        attack:1,
        energy:0,
        tick:function() {
            game.space.moveToNearestTarget(this);
            game.space.attackTarget(this);
            game.space.joinMining(this);
        }
    }
];