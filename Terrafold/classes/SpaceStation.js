function SpaceStation() {
    // this.battleships = 0;
    this.unlocked = 0;
    this.orbiting = [
        {
            type:"ice",
            amount:1e6
        },
        {
            type:"dirt",
            amount:0 //4000
        }
    ];

    this.unlockSpaceStation = function() {
        if(game.metal >= 10000 && game.oxygen >= 2e6) {
            game.metal -= 10000;
            game.oxygen -= 2e6;
            this.unlocked = 1;
            view.checkSpaceStationUnlocked();
            view.checkTractorBeamUnlocked();
        }
        view.updateSpaceStation();
    };

    this.tick = function() {
        if(!this.unlocked) {
            return;
        }
        for(var i = 0; i < this.orbiting.length; i++) {
            var take = this.orbiting[i].amount / 10000;
            this.orbiting[i].amount -= take;
            var type = this.orbiting[i].type;
            if(type === "ice") {
                game.ice.ice += take;
            } else if(type === "dirt") {
                game.land.addLand(take);
            }
        }
    };

    // this.addBattleship = function(amount) {
    //     this.battleships += amount;
    //     view.updateSpaceStation();
    // };

}