function Wander() {
    this.name = "Wander";
    this.ticksNeeded = 250;
    this.expMult = 1;
    this.stats = {
        Per:.2,
        Con:.2,
        Cha:.2,
        Spd:.3,
        Luck:.1
    };
    this.finish = function() {

    }
}

function SmashPots() {
    this.name = "Smash Pots";
    this.ticksNeeded = 50;
    this.expMult = 1;
    this.stats = {
        Str:.2,
        Per:.2,
        Spd:.6
    };
    this.finish = function() {

    }

}