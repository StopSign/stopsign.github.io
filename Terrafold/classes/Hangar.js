function Hangar(num) {
    this.num = num;
    this.sendRate = 2;
    this.timeRemaining = 30;

    this.tick = function() {

    }

}

var sendTypes = [
    {
        name:"Battleship",
        amount:0,
        health:20,
        shield:10,
        shieldRegen:1,
        attack:1,
        energy:0
    }
];