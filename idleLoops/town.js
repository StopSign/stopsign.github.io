function Town(difficulty) {
    this.exploredXp = 0;
    this.difficulty = difficulty;

    this.level = function() {
        return Math.floor(Math.sqrt(8*(this.exploredXp/(this.difficulty+1)/100+1)-1)/2);
    };
    this.expForLevel = function() {

    };

    this.restart = function() {

    };

    this.wander = function() {

    };

    this.totalPots = 0;
    this.smashPots = function() {

    };

}

function getLevelFromExp(exp) {
    return Math.floor((Math.sqrt(8*exp/100+1)-1)/2);
}

function getExpOfLevel(level) {
    return level * (level + 1) * 50;
}