function City() {
    this.people = 0;
    this.foodEaten = 0;
    this.popGrowth = 0;
    this.starving = 0;
    this.scienceRatio = 0;
    this.scienceDelta = 0;
    this.cashDelta = 0;
    this.happiness = 1;
    this.houseBonus = 1;

    this.tick = function() {
        this.foodEaten = this.people / 100;
        if(this.foodEaten > game.farms.food) {
            this.starving = this.foodEaten - game.farms.food;
            this.foodEaten = game.farms.food;
        } else {
            this.starving = 0;
        }
        game.farms.food -= this.foodEaten;
        this.popGrowth = (game.farms.food - this.people) / 1000 - this.starving / 100;
        this.people += this.popGrowth;
        this.updateHappiness();
        this.tickRatio();
    };

    this.updateHappiness = function() {
        this.happinessFromTrees = Math.log10((game.trees.trees+1))/10;
        this.happinessFromOxygen = Math.log10((game.oxygen+1))/20;
        this.happiness = this.houseBonus * (1 + this.happinessFromTrees + this.happinessFromOxygen);
    };

    this.tickRatio = function() {
        this.scienceDelta = this.people / 100 * (100 - this.scienceRatio) / 100 * this.happiness;
        this.cashDelta = this.people / 100 * this.scienceRatio / 100 * this.happiness;
        game.science += this.scienceDelta;
        game.cash += this.cashDelta;
    };

    this.improveHouse = function() {
        this.houseBonus += .1;
    }


}

document.getElementById('scienceSlider').oninput = function() {
    game.population.scienceRatio = this.value ; //0-100
};