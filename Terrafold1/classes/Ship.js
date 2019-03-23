var foodPerShip = 20;
function Ship(name, amount, foodAmount) {
    this.name = name;
    this.amount = amount;
    this.health = this.maxHealth = 20;
    this.shield = this.maxShield = 10;
    this.foodAmount = foodAmount/foodPerShip;
    this.shieldRegen = 1;
    this.actionRate = 1;
    this.actionSpeed = 40;
    this.actionCounter = 0;
    this.energy = 0;
    this.speed = .5;

    this.tick = function() {
        this.checkEmpty();
        this.moveToNearestTarget();
        this.checkJoinFleet();
        this.attackTarget();
        this.construction();
    };

    this.checkJoinFleet = function() {
        if(!this.engaged) {
            return;
        }
        for(var i = game.space.ships.length-1; i >= 0; i--) {
            var ship = game.space.ships[i];
            if(ship === this || ship.name !== this.name || ship.isEmpty()) { //only join on same types
                continue;
            }
            if(withinDistance(this.x, this.y, ship.x, ship.y, 10)) {
                combineShips(this, ship);
                game.space.ships.splice(i, 1);
            }
        }
    };

    this.findClosestTarget = function() {
        var pos = 0;
        var targetPlanet = null;
        for(var i = 0; i < game.space.planets.length; i++) {
            var planet = game.space.planets[i];
            if(planet.doneBuilding()) {
                continue;
            }
            if(!targetPlanet) {
                targetPlanet = planet;
                continue;
            }
            if(getDistance(this.x, this.y, planet.x, planet.y) < getDistance(this.x, this.y, targetPlanet.x, targetPlanet.y)) {
                pos = i;
                targetPlanet = game.space.planets[pos];
            }
        }
        return targetPlanet ? targetPlanet : this.targetHome();
    };

    this.checkEmpty = function() {
        this.foodAmount -= this.amount;
        if(!this.isEmpty()) {
            return;
        }
        this.foodAmount = 0;
        this.speed = .05;
        this.target = this.targetHome();
        this.engaged = false;
    };

    this.targetHome = function() {
        return game.hangars[0].getTarget();
    };
    this.returnHome = function() {
        game.spaceDock.battleships += this.amount;
        game.farms.food += this.foodAmount * foodPerShip;
        for(var i = game.space.ships.length-1; i >= 0; i--) {
            var ship = game.space.ships[i];
            if(ship === this) {
                game.space.ships.splice(i, 1);
                break;
            }
        }
        view.updateSpaceDock();
    };

    this.isEmpty = function() {
        return this.foodAmount <= 0;
    };

    this.moveToNearestTarget = function() {
        if(!this.target || (!this.target.isHome && this.target.doneBuilding())) {
            this.target = this.findClosestTarget();
        }
        if(getDistance(this.x, this.y, this.target.x, this.target.y) < (this.target.isHome ? 5 : 40)) {
            if(!this.target.isHome) {
                this.engaged = true;
                return;
            }
            this.returnHome();
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
    };

    this.attackTarget = function() {
        if(!this.target || this.target.isHome || !this.engaged || !this.target.alive()) { //if not attacking a valid target
            return;
        }
        this.actionCounter++;
        if(this.actionCounter >= this.actionSpeed) {
            this.actionCounter = 0;
            this.target.takeDamage(this.actionRate * this.amount);
        }
    };

    this.construction = function() {
        if(!this.target || this.target.isHome || !this.engaged || this.target.alive()) {
            return;
        }
        this.actionCounter++;
        if(this.actionCounter >= this.actionSpeed/2) {
            this.actionCounter = 0;
            this.target.workConstruction(this.amount);
            if(this.target.doneBuilding()) {
                this.engaged = false;
                this.target = this.findClosestTarget();
            }
        }
    };
}

//Ship1 is the one not moving, ship2 is the one disappearing
function combineShips(ship1, ship2) {
    ship1.amount += ship2.amount;
    ship1.energy += ship2.energy;
    ship1.foodAmount += ship2.foodAmount;
    if(ship2.actionCounter > ship1.actionCounter) {
        ship1.actionCounter = ship2.actionCounter;
    }
}