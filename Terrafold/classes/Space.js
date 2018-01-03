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

    this.spawnShip = function(ship, rate) {
        ship.x = 80;
        ship.y = 275;
        ship.amount = rate;
        this.ships.push(ship);
    };

    this.newLevel = function() {
        for(var i = 0; i < 11; i++) {
            this.planets.push(new Planet());
        }
        var pos = 0;
        for(i = 0; i < this.planets.length; i++) {
            if(this.planets[pos].x < this.planets[i].x) {
                pos = i;
            }
        }
        this.planets[pos].isBoss = true; //rightmost planet
    };

    this.findClosestTarget = function(ship) {
        var pos = 0;
        for(var i = 0; i < this.planets.length; i++) {
            if(getDistance(ship.x, ship.y, this.planets[i].x, this.planets[i].y) < getDistance(ship.x, ship.y, this.planets[pos].x, this.planets[pos].y)) {
                pos = i;
            }
        }
        return this.planets.length > 0 ? this.planets[i] : null;
    };
    this.moveToNearestTarget = function(ship) {
        if(ship.target) {
            //TODO math to go to target
            return;
        }
        ship.target = this.findClosestTarget();
        if(!ship.target) {
            ship.target = {x:80, y:275, isHome:true};
        }
    };
    this.attackTarget = function(ship) {
        if(!ship.target && ship.engaged) {
            return;
        }
    };
    this.joinMining = function(ship) {
        if(!ship.target) {
            return;
        }
    };
}
