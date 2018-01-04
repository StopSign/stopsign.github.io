
function Planet() {
    this.isBoss = 0;

    this.findArea = function() {
        for(var i = 0; i < game.space.planets.length; i++) {
            var target = game.space.planets[i];
            if(target === this) {
                continue;
            }
            var counter = 0;
            while(this.withinDistance(this.x, this.y, 75)) {
                counter++;
                if(counter > 40) {
                    console.log("too many planets");
                    return;
                }
                this.x = this.xAreaAllowed();
                this.y = this.yAreaAllowed();
            }
        }
    };
    this.xAreaAllowed = function() {
        return Math.random() * 620;
    };
    this.yAreaAllowed = function() {
        return Math.random() * 300 + 25;
    };
    this.withinDistance = function(x1, y1, radius) {
        for(var i = 0; i < game.space.planets.length; i++) {
            var target = game.space.planets[i];
            if(target === this) {
                continue;
            }
            if(withinDistance(x1, y1, target.x, target.y, radius)) {
                return true;
            }
        }
        return false;
    };

    this.x = this.xAreaAllowed();
    this.y = this.yAreaAllowed();
    this.findArea();


    this.tick = function() {
        this.regenShields()
    };
    this.empty = function() {
        return this.dirt <= 0;
    };
    this.alive = function() {
        return this.health > 0;
    };
    this.calcPower = function(id) {
        this.id = id;
        this.power = Math.sqrt(this.id+1);
        this.shields = this.maxShields = precision3(this.power*100);
        this.health = this.maxHealth = precision3(this.power*1000);
        this.dirt = precision3(this.power*2000);
    };

    this.regenShields = function() {
        if(!this.alive()) {
            this.shields = 0;
            return;
        }
        this.shields += (this.maxShields - this.shields) / 100;
        if(this.shields > this.maxShields) {
            this.shields = this.maxShields;
        }
    };
    this.getShieldReduction = function() {
        return this.shields / this.maxShields;
    };
    this.takeDamage = function(damage) {
        var healthDamage = damage * (1 - this.getShieldReduction());
        this.shields -= damage * this.getShieldReduction();
        var extraDamage = 0;
        if(this.shields < 0) {
            extraDamage = this.shields * -1;
            this.shields = 0;
        }

        this.health -= healthDamage + extraDamage;
        if(this.health < 0) {
            this.health = 0;
        }
    }
}