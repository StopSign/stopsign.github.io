function Space() {
    this.planets = [];
    this.ships = [];
    this.tick = function() {
        for(var i = 0; i < this.planets.length; i++) {
            this.planets[i].tick();
        }
        for(i = 0; i < this.ships.length; i++) {
            this.ships[i].tick();
        }
    };

    this.spawnShip = function(ship) {
        ship.x = -120;
        ship.y = 275;
        this.ships.push(ship);
    };

    this.newLevel = function() {
        this.planets.push(new Planet());
        this.planets[0].x = 200;
        this.planets[0].y = 200;

        // for(var i = 0; i < 11; i++) {
        //     this.planets.push(new Planet());
        // }
        // var pos = 0;
        // for(i = 0; i < this.planets.length; i++) {
        //     if(this.planets[pos].x < this.planets[i].x) {
        //         pos = i;
        //     }
        // }
        // this.planets[pos].isBoss = true; //rightmost planet
    };
}
