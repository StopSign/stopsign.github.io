
function translateClassNames(name) {
    if(name === "Wander") {
        return new Wander();
    } else if(name === "Smash Pots") {
        return new SmashPots();
    } else if(name === "Pick Locks") {
        return new PickLocks();
    } else if(name === "Sell Gold") {
        return new SellGold();
    } else if(name === "Meet People") {
        return new MeetPeople();
    }
    console.log('error trying to create ' + name);
}


//Progress actions
//Progress actions have a progress bar and use 100,200,300,etc. leveling system

function Wander() {
    this.name = "Wander";
    this.manaCost = 250;
    this.expMult = 1;
    this.tooltip = "Explore the town, look for hidden areas and treasures.";

    this.infoName = "Explored";
    this.varName = "Wander";
    this.stats = {
        Per:.2,
        Con:.2,
        Cha:.2,
        Spd:.3,
        Luck:.1
    };
    this.visible = function() {
        return true;
    };
    this.unlocked = function() {
        return true;
    };
    this.finish = function() {
        towns[curTown].finishProgress(this.varName, function() {
            towns[curTown].totalPots = towns[curTown].getLevel("Wander") * 5 * (towns[curTown].difficulty + 1);
            towns[curTown].totalLocks = towns[curTown].getLevel("Wander") * (towns[curTown].difficulty + 1);
        });
    };
}

function MeetPeople() {
    this.name = "Meet People";
    this.manaCost = 800;
    this.expMult = 1;
    this.tooltip = "They won't let you get away with a simple chat.<br>Unlocked at 20% Explored";

    this.infoName = "People Met";
    this.varName = "Met";
    this.stats = {
        Int:.1,
        Cha:.8,
        Soul:.1
    };
    this.visible = function() {
        return true;
    };
    this.unlocked = function() {
        return towns[curTown].getLevel("Wander") >= 20;
    };
    this.finish = function() {
        towns[curTown].finishProgress(this.varName, function() {
        });
    };
}

//Basic actions
//Basic actions have no additional UI

function SellGold() {
    this.name = "Sell Gold";
    this.manaCost = 200;
    this.expMult = 1;
    this.tooltip = "1 gold = 50 mana. Sells all gold<br>Unlocked at 20% Explored";
    this.varName = "Gold";
    this.stats = {
        Cha:.7,
        Int:.2,
        Luck:.1
    };
    this.visible = function() {
        return true;
    };
    this.unlocked = function() {
        return towns[curTown].getLevel("Wander") >= 20;
    };
    this.finish = function() {
        addMana(gold * 50);
        addGold(-gold);
    };
}

//Regular Actions
//Regular actions have varName, infoName, infoText

function SmashPots() {
    this.name = "Smash Pots";
    this.manaCost = 50;
    this.expMult = 1;
    this.tooltip = "They're just sitting there, unbroken, full of potential.<br>Pots with loot in them have 100 mana.";

    this.varName = "Pots";
    this.infoName = "Pots Smashed";
    this.infoText = "Pots with loot left <i class='fa fa-arrow-left'></i> Pots with loot total <i class='fa fa-arrow-left'></i> Pots to check for loot<br><div class='bold'>Total Found</div> <div id='totalPots'></div>";
    this.stats = {
        Str:.2,
        Per:.2,
        Spd:.6
    };
    this.visible = function() {
        return true;
    };
    this.unlocked = function() {
        return true;
    };
    this.finish = function() {
        towns[curTown].finishRegular(this.varName, 10, function() {
            addMana(100);
            return 100;
        })
    };
}

function PickLocks() {
    this.name = "Pick Locks";
    this.manaCost = 400;
    this.expMult = 1;
    this.varName = "Locks";

    this.tooltip = "Don't worry; they won't remember.<br>Houses with loot in them have 10 gold.<br>Unlocked at 20% Explored";
    this.infoName = "Locks Picked";
    this.infoText = "Houses with loot left <i class='fa fa-arrow-left'></i> Houses with loot total <i class='fa fa-arrow-left'></i> Houses to check for loot<br><div class='bold'>Total Found</div> <div id='totalLocks'></div>";
    this.stats = {
        Dex:.5,
        Per:.3,
        Spd:.1,
        Luck:.1
    };
    this.visible = function() {
        return true;
    };
    this.unlocked = function() {
        return towns[curTown].getLevel("Wander") >= 20;
    };
    this.finish = function() {
        towns[curTown].finishRegular(this.varName, 10, function() {
            addGold(10);
            return 10;
        })
    };

}