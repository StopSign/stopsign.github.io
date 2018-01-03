function Ship(name, amount) {
    this.name = name;
    this.amount = amount;
    this.health = 20;
    this.shield = 10;
    this.shieldRegen = 1;
    this.attack = 1;
    this.energy = 0;
    this.speed = 1;

    this.tick = function() {
        this.moveToNearestTarget();
        this.attackTarget();
        this.joinMining(); //If engaged and planet is empty
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
        if(!this.target || !this.engaged || !this.target.alive() || this.target.empty()) { //if not attacking a valid target
            return;
        }
    };

    this.joinMining = function() {
        if(!this.target || !this.engaged || this.target.alive() || !this.target.empty()) {
            return;
        }
    };
}