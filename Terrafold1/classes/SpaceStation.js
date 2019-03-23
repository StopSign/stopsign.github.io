function SpaceStation() {
    this.unlocked = 0;
    this.orbiting = [
        {
            type:"ice",
            amount:1e6
        },
        {
            type:"dirt",
            amount:500
        }
    ];

    this.unlockSpaceStation = function() {
        if(game.metal >= 2000 && game.wood >= 20000) {
            game.metal -= 2000;
            game.wood -= 20000;
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
        for(let i = 0; i < this.orbiting.length; i++) {
            let take = this.orbiting[i].amount / 100000;
            this.orbiting[i].amount -= take;
            let type = this.orbiting[i].type;
            if(type === "ice") {
                game.ice.ice += take;
            } else if(type === "dirt") {
                game.land.addLand(take);
            }
        }
    };

}