
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
    } else if(name === "Train Strength") {
        return new TrainStr();
    } else if(name === "Train Dex") {
        return new TrainDex();
    } else if(name === "Train Speed") {
        return new TrainSpd();
    } else if(name === "Short Quest") {
        return new ShortQuest();
    } else if(name === "Investigate") {
        return new Investigate();
    } else if(name === "Long Quest") {
        return new LongQuest();
    } else if(name === "Warrior Lessons") {
        return new WarriorLessons();
    } else if(name === "Mage Lessons") {
        return new MageLessons();
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
        towns[curTown].finishProgress(this.varName, 100, function() {
            towns[curTown].totalPots = towns[curTown].getLevel("Wander") * 5 * (towns[curTown].difficulty + 1);
            towns[curTown].totalLocks = towns[curTown].getLevel("Wander") * (towns[curTown].difficulty + 1);
        });
    };
}

function MeetPeople() {
    this.name = "Meet People";
    this.manaCost = 800;
    this.expMult = 1;
    this.tooltip = "They won't let you get away with a simple chat.<br>Unlocked at 22% Explored";

    this.infoName = "People Met";
    this.varName = "Met";
    this.stats = {
        Int:.1,
        Cha:.8,
        Soul:.1
    };
    this.visible = function() {
        return towns[curTown].getLevel("Wander") >= 10;
    };
    this.unlocked = function() {
        return towns[curTown].getLevel("Wander") >= 22;
    };
    this.finish = function() {
        towns[curTown].finishProgress(this.varName, 200, function() {
            towns[curTown].totalSQuests = towns[curTown].getLevel("Met") * (towns[curTown].difficulty + 1);
        });
    };
}

function Investigate() {
    this.name = "Investigate";
    this.manaCost = 1000;
    this.expMult = 1;
    this.tooltip = "You've been hearing some rumors...<br>Unlocked at 25% People Met";

    this.infoName = "Investigated";
    this.varName = "Secrets";
    this.stats = {
        Per:.3,
        Cha:.4,
        Spd:.2,
        Luck:.1
    };
    this.visible = function() {
        return towns[curTown].getLevel("Met") >= 10;
    };
    this.unlocked = function() {
        return towns[curTown].getLevel("Met") >= 25;
    };
    this.finish = function() {
        towns[curTown].finishProgress(this.varName, 500, function() {
            towns[curTown].totalLQuests = towns[curTown].getLevel("Secrets") * (towns[curTown].difficulty + 1);
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
        return towns[curTown].getLevel("Wander") >= 3;
    };
    this.unlocked = function() {
        return towns[curTown].getLevel("Wander") >= 20;
    };
    this.finish = function() {
        addMana(gold * 50);
        addGold(-gold);
    };
}

function TrainStr() {
    this.name = "Train Strength";
    this.manaCost = 500;
    this.expMult = 3;
    this.tooltip = "Today is leg day. Has triple exp/talent gain.<br>Unlocked at 5% People Met";
    this.varName = "trStr";
    this.stats = {
        Str:.8,
        Con:.2
    };
    this.visible = function() {
        return towns[curTown].getLevel("Met") >= 1;
    };
    this.unlocked = function() {
        return towns[curTown].getLevel("Met") >= 5;
    };
    this.finish = function() {
    };
}

function TrainDex() {
    this.name = "Train Dex";
    this.manaCost = 500;
    this.expMult = 3;
    this.tooltip = "The kids are a little mad you're taking their playground. They'll get over it.<br>Has triple exp/talent gain.<br>Unlocked at 15% People Met";
    this.varName = "trDex";
    this.stats = {
        Dex:.8,
        Con:.2
    };
    this.visible = function() {
        return towns[curTown].getLevel("Met") >= 5;
    };
    this.unlocked = function() {
        return towns[curTown].getLevel("Met") >= 15;
    };
    this.finish = function() {
    };
}

function TrainSpd() {
    this.name = "Train Speed";
    this.manaCost = 500;
    this.expMult = 3;
    this.tooltip = "A new friend has a magical treadmill. Has triple exp/talent gain.<br>Unlocked at 30% People Met";
    this.varName = "trSpd";
    this.stats = {
        Spd:.8,
        Con:.2
    };
    this.visible = function() {
        return towns[curTown].getLevel("Met") >= 15;
    };
    this.unlocked = function() {
        return towns[curTown].getLevel("Met") >= 30;
    };
    this.finish = function() {
    };
}

function WarriorLessons() {
    this.name = "Warrior Lessons";
    this.manaCost = 1000;
    this.expMult = 1;
    this.tooltip = "Learning to fight is probably important; you have a long journey ahead of you.<br>Requires 2 reputation.";
    this.varName = "trCombat";
    this.stats = {
        Str:.5,
        Dex:.3,
        Con:.2
    };
    this.canStart = function() {
        return reputation >= 2;
    };
    this.cost = function() {
        addReputation(-2);
    };
    this.visible = function() {
        return towns[curTown].getLevel("Secrets") >= 10;
    };
    this.unlocked = function() {
        return towns[curTown].getLevel("Secrets") >= 20;
    };
    this.finish = function() {
        addSkillExp("Combat", 50);
    };
}

function MageLessons() {
    this.name = "Mage Lessons";
    this.manaCost = 1000;
    this.expMult = 1;
    this.tooltip = "The mystic got you into this mess, maybe it can help you get out of it.<br>Requires 2 reputation.";
    this.varName = "trMagic";
    this.stats = {
        Per:.3,
        Int:.5,
        Con:.2
    };
    this.canStart = function() {
        return reputation >= 2;
    };
    this.cost = function() {
        addReputation(-2);
    };
    this.visible = function() {
        return towns[curTown].getLevel("Secrets") >= 10;
    };
    this.unlocked = function() {
        return towns[curTown].getLevel("Secrets") >= 20;
    };
    this.finish = function() {
        addSkillExp("Magic", 50);
    };
}

//Regular Actions
//Regular actions have varName, infoName, infoText

function SmashPots() {
    this.name = "Smash Pots";
    this.manaCost = 50;
    this.expMult = 1;
    this.tooltip = "They're just sitting there, unbroken, full of potential.<br>Pots with loot in them have 100 mana.<br>Every 10 pots have mana.";

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

    this.tooltip = "Don't worry; they won't remember.<br>Houses with loot in them have 10 gold.<br>Every 10 houses have gold.<br>Unlocked at 20% Explored";
    this.infoName = "Locks Picked";
    this.infoText = "Houses with loot left <i class='fa fa-arrow-left'></i> Houses with loot total <i class='fa fa-arrow-left'></i> Houses to check for loot<br><div class='bold'>Total Found</div> <div id='totalLocks'></div>";
    this.stats = {
        Dex:.5,
        Per:.3,
        Spd:.1,
        Luck:.1
    };
    this.visible = function() {
        return towns[curTown].getLevel("Wander") >= 3;
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

function ShortQuest() {
    this.name = "Short Quest";
    this.manaCost = 800;
    this.expMult = 1;
    this.varName = "SQuests";

    this.tooltip = "Be a hero! ...If the reward is good and it doesn't take too long.<br>Short Quests with loot give 20 gold as a reward.<br>Every 5 Short Quests have loot.<br>Unlocked at 5% People Met";
    this.infoName = "Short Quests Accomplished";
    this.infoText = "Quests with loot left <i class='fa fa-arrow-left'></i> Quests with loot total <i class='fa fa-arrow-left'></i> Quests to finish<br><div class='bold'>Total Found</div> <div id='totalSQuests'></div>";
    this.stats = {
        Str:.2,
        Dex:.1,
        Cha:.3,
        Spd:.2,
        Luck:.1,
        Soul:.1
    };
    this.visible = function() {
        return towns[curTown].getLevel("Met") >= 1;
    };
    this.unlocked = function() {
        return towns[curTown].getLevel("Met") >= 5;
    };
    this.finish = function() {
        towns[curTown].finishRegular(this.varName, 5, function() {
            addGold(10);
            return 10;
        })
    };
}

function LongQuest() {
    this.name = "Long Quest";
    this.manaCost = 2000;
    this.expMult = 1;
    this.varName = "LQuests";

    this.tooltip = "Be a more impressive hero! ...As long as someone is watching.<br>Long Quests with loot give 20 gold and 1 reputation as a reward.<br>Every 10 Long Quests have loot.<br>Unlocked at 10% Investigated.";
    this.infoName = "Long Quests Accomplished";
    this.infoText = "Quests with loot left <i class='fa fa-arrow-left'></i> Quests with loot total <i class='fa fa-arrow-left'></i> Quests to finish<br><div class='bold'>Total Found</div> <div id='totalLQuests'></div>";
    this.stats = {
        Str:.2,
        Int:.2,
        Con:.4,
        Spd:.2
    };
    this.visible = function() {
        return towns[curTown].getLevel("Secrets") >= 1;
    };
    this.unlocked = function() {
        let toUnlock = towns[curTown].getLevel("Secrets") >= 10;
        if(toUnlock && !isVisible(document.getElementById("skillList"))) {
            document.getElementById("skillList").style.display = "inline-block";
        }
        return toUnlock;
    };
    this.finish = function() {
        towns[curTown].finishRegular(this.varName, 10, function() {
            addReputation(1);
            addGold(20);
            return 20;
        })
    };
}