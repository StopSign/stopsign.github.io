function Space() {
    this.planets = [];
    this.ships = [];
    this.sector = 0;
    this.tick = function() {
        for(var i = 0; i < this.planets.length; i++) {
            this.planets[i].tick();
        }
        for(i = 0; i < this.ships.length; i++) {
            this.ships[i].tick();
        }
    };

    this.spawnShip = function(ship, y) {
        ship.x = -120;
        ship.y = y;
        this.ships.push(ship);
    };

    this.calcDifficulty = function() {
        return 1; //based on num completed sectors ?
    };

    this.newLevel = function() {
        for(var i = 0; i < 10; i++) {
            this.planets.push(new Planet());
        }
        sortArrayObjectsByValue(this.planets, "x");
        this.planets[this.planets.length - 1].isBoss = true; //rightmost planet

        for(i = 0; i < this.planets.length; i++) {
            this.planets[i].calcPower(i + this.sector * 10, this.calcDifficulty());
        }
    };
}

