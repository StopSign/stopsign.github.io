function Population() {
    this.people = 0;
    this.foodEaten = 0;
    this.popGrowth = 0;

    this.tick = function() {
        this.foodEaten = this.people / 100;
        game.farms.food -= this.foodEaten;
        this.popGrowth = (game.farms.food - this.people) / 1000;
        this.people += this.popGrowth;
        game.science += this.people / 100;
    };

}
