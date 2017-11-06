function Population() {
    this.people = 0;
    this.foodEaten = 0;
    this.popGrowth = 0;
    this.starving = 0;
    this.scienceRatio = 0;
    this.scienceDelta = 0;
    this.cashDelta = 0;

    this.tick = function() {
        this.foodEaten = this.people / 100;
        if(this.foodEaten > game.farms.food) {
            this.starving = this.foodEaten - game.farms.food;
            this.foodEaten = game.farms.food;
        }
        game.farms.food -= this.foodEaten;
        this.popGrowth = (game.farms.food - this.people) / 1000 - this.starving / 100;
        this.people += this.popGrowth;
        this.tickRatio();
    };

    this.tickRatio = function() {
        this.scienceDelta = this.people / 100 * this.scienceRatio / 100;
        this.cashDelta = this.people / 100 * (100 - this.scienceRatio) / 100;
        game.science += this.scienceDelta;
        game.cash += this.cashDelta;
    };


}

document.getElementById('scienceSlider').oninput = function() {
    game.population.scienceRatio = this.value ; //0-100
};