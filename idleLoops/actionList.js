

function Wander() {
    this.name = "Wander";
    this.manaCost = 250;
    this.expMult = 1;
    this.tooltip = "Explore the town, look for hidden areas and treasures.";
    this.stats = {
        Per:.2,
        Con:.2,
        Cha:.2,
        Spd:.3,
        Luck:.1
    };
    this.finish = function() {
        towns[curTown].wander();
    };
}

function SellGold() {
    this.name = "Sell Gold";
    this.manaCost = 300;
    this.expMult = 1;
    this.tooltip = "1 gold = 50 mana";
    this.stats = {
        Cha:.7,
        Int:.2,
        Luck:.1
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
    this.tooltip = "They're just sitting there, unbroken, full of potential.";

    this.varName = "Pots";
    this.infoName = "Pots Smashed";
    this.infoText = "Mana from pots / Pots with loot left / Pots with loot total / Pots to check for loot / Total pots found";
    this.stats = {
        Str:.2,
        Per:.2,
        Spd:.6
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

    this.tooltip = "Don't worry; they won't remember.";
    this.infoName = "Locks Picked";
    this.infoText = "Gold from houses / Houses with loot left / Houses with loot total / Houses to check for loot / Total houses found";
    this.stats = {
        Dex:.5,
        Per:.3,
        Spd:.1,
        Luck:.1
    };
    this.finish = function() {
        towns[curTown].finishRegular(this.varName, 5, function() {
            addGold(5);
            return 5;
        })
    };

}