function Hangar(num) {
    this.num = num;
    this.sendRate = 2;
    this.timeRemaining = 0;
    this.totalTime = 300;

    this.tick = function() {
        this.timeRemaining--;
        if(this.timeRemaining < 0) {
            if (game.spaceDock.battleships >= this.sendRate) {
                // game.space.spawnShip(new Ship("Battleship", this.sendRate));
                // game.spaceDock.battleships -= this.sendRate;
                this.timeRemaining = this.totalTime;
                view.updateSpaceDock();
            } else {
                this.timeRemaining = 0;
            }
        }
    }

}