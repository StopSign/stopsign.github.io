function Hangar(num) {
    this.num = num;
    this.sendRate = 1;
    this.timeRemaining = this.totalTime = 40;
    this.y = 350;

    this.tick = function() {
        this.timeRemaining--;
        if(this.timeRemaining < 0) {
            if (game.spaceDock.battleships >= this.sendRate) {
                var foodTaken = game.farms.food * .05; // Take 5% food per launch
                game.farms.food -= foodTaken;
                game.space.spawnShip(new Ship("Battleship", this.sendRate, foodTaken), this.y);
                game.spaceDock.battleships -= this.sendRate;
                this.timeRemaining = this.totalTime;
                view.updateSpaceDock();
            } else {
                this.timeRemaining = 0;
            }
        }
    };

    this.getTarget = function() {
        return {
            isHome:true,
            x:-125,
            y:this.y,
            num:this.num
        }
    };

}