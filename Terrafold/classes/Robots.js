function Robots() {
    this.robots = 0;
    this.robotMax = 10;

    this.gainRobots = function(amount) {
        this.robots += amount;
    };

    this.gainStorage = function(amount) {
        this.robotMax += amount;
    };
}