function Hangar(num) {
    this.num = num;
    this.sendRate = 1;
    this.timeRemaining = this.totalTime = 100;
    this.y = 350;

    this.tick = function() {
        this.timeRemaining--;
        if(this.timeRemaining < 0) {
            if (game.spaceDock.battleships >= this.sendRate) {
                game.space.spawnShip(new Ship("Battleship", this.sendRate), this.y);
                // game.spaceDock.battleships -= this.sendRate;
                this.timeRemaining = this.totalTime;
                view.updateSpaceDock();
            } else {
                this.timeRemaining = 0;
            }
        }
    }


}