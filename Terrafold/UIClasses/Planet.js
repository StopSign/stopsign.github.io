var planetIds = 1;
function Planet() {
    this.id = planetIds++;
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
        return Math.random() * 650;
    };
    this.yAreaAllowed = function() {
        return Math.random() * 300 + 50;
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

    this.power = Math.sqrt(this.id);
    this.shields = this.maxShields = Math.sqrt(this.id)*100;
    this.health = this.maxHealth = Math.sqrt(this.id)*1000;
    this.tick = function() {
        this.shields += this.shields / 100;
        if(this.shields > this.maxShields) {
            this.shields = this.maxShields;
        }
    }
}