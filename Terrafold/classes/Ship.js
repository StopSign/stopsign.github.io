function Ship(name, amount) {
    this.name = name;
    this.amount = amount;
    this.health = this.maxHealth = 20;
    this.shield = this.maxShield = 10;
    this.shieldRegen = 1;
    this.attack = 1;
    this.attackSpeed = 40;
    this.attackCounter = 0;
    this.energy = 0;
    this.speed = 5;

    this.tick = function() {
        this.moveToNearestTarget();
        this.checkJoinFleet();
        this.attackTarget();
        this.mineTarget(); //If engaged and planet is empty
    };

    this.checkJoinFleet = function() {
        if(!this.engaged) {
            return;
        }
        for(var i = game.space.ships.length-1; i >= 0; i--) {
            var ship = game.space.ships[i];
            if(ship === this || ship.name !== this.name) { //only join on same types
                continue;
            }
            if(withinDistance(this.x, this.y, ship.x, ship.y, 10)) { //COMBINE SHIPS
                this.amount += ship.amount;
                this.energy += ship.energy;
                if(ship.attackCounter > this.attackCounter) {
                    this.attackCounter = ship.attackCounter;
                }
                game.space.ships.splice(i, 1);
            }
        }
    };

    this.findClosestTarget = function() {
        var pos = 0;
        var targetPlanet = game.space.planets[pos];
        for(var i = 0; i < game.space.planets.length; i++) {
            var planet = game.space.planets[i];
            if(getDistance(this.x, this.y, planet.x, planet.y) < getDistance(this.x, this.y, targetPlanet.x, targetPlanet.y)) {
                pos = i;
                targetPlanet = game.space.planets[pos];
            }
        }
        return game.space.planets.length > 0 ? game.space.planets[pos] : null;
    };

    this.moveToNearestTarget = function() {
        if(this.target && !this.target.empty()) {
            // console.log("x: "+this.x+", y: " + this.y+", targetX: "+this.target.x+", targetY: "+this.target.y);
            if(getDistance(this.x, this.y, this.target.x, this.target.y) < 40) {
                this.engaged = true;
                return;
            }
            var magnitude = this.speed;
            var extraTurn = 0;
            var firstVC = this.target.y - this.y;
            var secondVC = this.target.x - this.x;
            if((firstVC >= 0 && secondVC < 0) || (firstVC < 0 && secondVC < 0)) {
                extraTurn = Math.PI;
            }
            var direction = Math.atan(firstVC/secondVC)+extraTurn; //(y2-y1)/(x2-x1)
            this.x = this.x + magnitude * Math.cos(direction); //||v||cos(theta)
            this.y = this.y + magnitude * Math.sin(direction);
            this.direction = direction;
            return;
        }
        this.target = this.findClosestTarget();
        if(!this.target) { //Go home instead
            this.target = {x:80, y:275, isHome:true, alive:function() { return true; }, empty:function() { return false; }};
        }
    };

    this.attackTarget = function() {
        if(!this.target || !this.engaged || !this.target.alive()) { //if not attacking a valid target
            return;
        }
        this.attackCounter++;
        if(this.attackCounter >= this.attackSpeed) {
            this.attackCounter = 0;
            this.target.takeDamage(this.attack * this.amount);
        }
    };

    this.mineTarget = function() {
        if(!this.target || !this.engaged || this.target.alive() || this.target.empty()) {
            return;
        }
        console.log(this.target.dirt);
    };
}