'use strict';
function translateClassNames(name) {
    if(name === "Wander") {
        return new Wander();
    } else if(name === "Smash Pots") {
        return new SmashPots();
    } else if(name === "Pick Locks") {
        return new PickLocks();
    } else if(name === "Buy Glasses") {
        return new BuyGlasses();
    } else if(name === "Buy Mana") {
        return new BuyMana();
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
    } else if(name === "Throw Party") {
        return new ThrowParty();
    } else if(name === "Heal The Sick") {
        return new HealTheSick();
    } else if(name === "Fight Monsters") {
        return new FightMonsters();
    } else if(name === "Small Dungeon") {
        return new SmallDungeon();
    } else if(name === "Buy Supplies") {
        return new BuySupplies();
    } else if(name === "Haggle") {
        return new Haggle();
    } else if(name === "Start Journey") {
        return new StartJourney();
    }
    //town 2
    if(name === "Explore Forest") {
        return new ExploreForest();
    } else if(name === "Wild Mana") {
        return new WildMana();
    } else if(name === "Gather Herbs") {
        return new GatherHerbs();
    } else if(name === "Hunt") {
        return new Hunt();
    } else if(name === "Sit By Waterfall") {
        return new SitByWaterfall();
    } else if(name === "Old Shortcut") {
        return new OldShortcut();
    } else if(name === "Talk To Hermit") {
        return new TalkToHermit();
    } else if(name === "Practical Magic") {
        return new PracticalMagic();
    } else if(name === "Learn Alchemy") {
        return new LearnAlchemy();
    } else if(name === "Brew Potions") {
        return new BrewPotions();
    } else if(name === "Continue On") {
        return new ContinueOn();
    }
    //town 3
    if(name === "Explore City") {
        return new ExploreCity();
    } else if(name === "Gamble") {
        return new Gamble();
    } else if(name === "Get Drunk") {
        return new GetDrunk();
    } else if(name === "Purchase Mana") {
        return new PurchaseMana();
    } else if(name === "Sell Potions") {
        return new SellPotions();
    } else if(name === "Read Books") {
        return new ReadBooks();
    }
    console.log('error trying to create ' + name);
}

function hasCap(name) {
    return (name === "Smash Pots" || name === "Pick Locks" || name === "Short Quest" || name === "Long Quest" || name === "Gather Herbs" || name === "Wild Mana" || name === "Hunt");
}
function getTravelNum(name) {
    return (name === "Start Journey" || name === "Continue On") ? 1 : 0;
}

let townNames = ["Beginnersville", "Forest Path", "Merchanton"];


//Progress actions
//Progress actions have a progress bar and use 100,200,300,etc. leveling system

function Wander() {
    this.name = "Wander";
    this.expMult = 1;
    this.tooltip = "Explore the town, look for hidden areas and treasures.";
    this.townNum = 0;

    this.infoName = "Explored";
    this.varName = "Wander";
    this.stats = {
        Per:.2,
        Con:.2,
        Cha:.2,
        Spd:.3,
        Luck:.1
    };
    this.manaCost = function() {
        return 250;
    };
    this.visible = function() {
        return true;
    };
    this.unlocked = function() {
        return true;
    };
    this.finish = function() {
        towns[0].finishProgress(this.varName, 200 * (glasses ? 4 : 1), function() {
            adjustPots();
            adjustLocks();
        });
    };
}
function adjustPots() {
    towns[0].totalPots = towns[0].getLevel("Wander") * 5;
}
function adjustLocks() {
    towns[0].totalLocks = towns[0].getLevel("Wander");
}

function MeetPeople() {
    this.name = "Meet People";
    this.expMult = 1;
    this.tooltip = "They won't let you get away with a simple chat.<br>Unlocked at 22% Explored";
    this.townNum = 0;

    this.infoName = "People Met";
    this.varName = "Met";
    this.stats = {
        Int:.1,
        Cha:.8,
        Soul:.1
    };
    this.manaCost = function() {
        return 800;
    };
    this.visible = function() {
        return towns[0].getLevel("Wander") >= 10;
    };
    this.unlocked = function() {
        return towns[0].getLevel("Wander") >= 22;
    };
    this.finish = function() {
        towns[0].finishProgress(this.varName, 200, function() {
            adjustSQuests();
        });
    };
}
function adjustSQuests() {
    towns[0].totalSQuests = towns[0].getLevel("Met");
}

function Investigate() {
    this.name = "Investigate";
    this.expMult = 1;
    this.tooltip = "You've been hearing some rumors...<br>Unlocked at 25% People Met";
    this.townNum = 0;

    this.infoName = "Investigated";
    this.varName = "Secrets";
    this.stats = {
        Per:.3,
        Cha:.4,
        Spd:.2,
        Luck:.1
    };
    this.manaCost = function() {
        return 1000;
    };
    this.visible = function() {
        return towns[0].getLevel("Met") >= 5;
    };
    this.unlocked = function() {
        return towns[0].getLevel("Met") >= 25;
    };
    this.finish = function() {
        towns[0].finishProgress(this.varName, 500, function() {
            adjustLQuests();
        });
    };
}
function adjustLQuests() {
    towns[0].totalLQuests = Math.floor(towns[0].getLevel("Secrets")/2);
}

function ExploreForest() {
    this.name = "Explore Forest";
    this.expMult = 1;
    this.tooltip = "What a pleasant area.<br>2x progress with glasses";
    this.townNum = 1;

    this.infoName = "Forest Explored";
    this.varName = "Forest";
    this.stats = {
        Per:.4,
        Con:.2,
        Spd:.2,
        Luck:.2
    };
    this.manaCost = function() {
        return 400;
    };
    this.visible = function() {
        return true;
    };
    this.unlocked = function() {
        return true;
    };
    this.finish = function() {
        towns[1].finishProgress(this.varName, 100 * (glasses ? 2 : 1), function() {
            adjustWildMana();
            adjustHunt();
            adjustHerbs();
        });
    };
}
function adjustWildMana() {
    towns[1].totalWildMana = towns[1].getLevel("Forest") * 5;
}
function adjustHunt() {
    towns[1].totalHunt = towns[1].getLevel("Forest") * 2;
}
function adjustHerbs() {
    towns[1].totalHerbs = towns[1].getLevel("Forest") * 5 + towns[1].getLevel("Shortcut") * 2;
}

function OldShortcut() {
    this.name = "Old Shortcut";
    this.expMult = 1;
    this.tooltip = "No one has come down this way in quite some time.<br>Gives some additional herbs.<br>Gives something to talk about with the Hermit. Get 1% reward for Talk to Hermit result per 1% Shortcut Explored.<br>Unlocked at 20% Forest Explored.";
    this.townNum = 1;

    this.infoName = "Shortcut Explored";
    this.varName = "Shortcut";
    this.stats = {
        Per:.3,
        Con:.4,
        Spd:.2,
        Luck:.1
    };
    this.manaCost = function() {
        return 1200;
    };
    this.visible = function() {
        return true;
    };
    this.unlocked = function() {
        return towns[1].getLevel("Forest") >= 20;
    };
    this.finish = function() {
        towns[1].finishProgress(this.varName, 100, function() {
            adjustHerbs();
        });
    };
}

function TalkToHermit() {
    this.name = "Talk To Hermit";
    this.expMult = 1;
    this.tooltip = "This old man is happy to have a listening ear, surely he has some useful knowledge. You hope.<br>Speed is 1% faster for Gather Herbs, Practical Magic, and Learn Alchemy per 1% of Hermit Knowledge.<br>Unlocked with both 20% Shortcut Explored and 40 Magic";
    this.townNum = 1;

    this.infoName = "Hermit Knowledge Learned";
    this.varName = "Hermit";
    this.stats = {
        Con:.5,
        Cha:.3,
        Soul:.2
    };
    this.manaCost = function() {
        return 2000;
    };
    this.visible = function() {
        return true;
    };
    this.unlocked = function() {
        return towns[1].getLevel("Shortcut") >= 20 && getSkillLevel("Magic") >= 40;
    };
    this.finish = function() {
        towns[1].finishProgress(this.varName, 50 * (1 + towns[1].getLevel("Shortcut")/100), function() {
            view.adjustManaCost("Gather Herbs");
            view.adjustManaCost("Practical Magic");
        });
    };
}

function ExploreCity() {
    this.name = "Explore City";
    this.expMult = 1;
    this.tooltip = "Everyone is so busy, and there's so much to do.<br>2x progress with glasses";
    this.townNum = 2;

    this.infoName = "City Explored";
    this.varName = "City";
    this.stats = {
        Con:.1,
        Per:.3,
        Cha:.2,
        Spd:.3,
        Luck:.1
    };
    this.manaCost = function() {
        return 750;
    };
    this.visible = function() {
        return true;
    };
    this.unlocked = function() {
        return true;
    };
    this.finish = function() {
        towns[2].finishProgress(this.varName, 100 * (glasses ? 2 : 1), function() {
            adjustSuckers();
        });
    };
}
function adjustSuckers() {
    towns[2].totalGamble = towns[2].getLevel("City") * 10;
}

function GetDrunk() {
    this.name = "Get Drunk";
    this.expMult = 1;
    this.tooltip = "Sometimes you just need a drink.<br>Costs 2 gold and requires reputation greater than -3.<br>Costs 1 reputation.<br>Unlocked at 20% City Explored.";
    this.townNum = 2;

    this.infoName = "Rumors Heard";
    this.varName = "Drunk";
    this.stats = {
        Str:.1,
        Cha:.5,
        Con:.2,
        Soul:.2
    };
    this.canStart = function() {
        return reputation >= -3 && gold >= 2
    };
    this.cost = function() {
        addReputation(-1);
        addGold(-2);
    };
    this.manaCost = function() {
        return 1000;
    };
    this.visible = function() {
        return true;
    };
    this.unlocked = function() {
        return towns[2].getLevel("City") >= 20;
    };
    this.finish = function() {
        towns[2].finishProgress(this.varName, 100, function() {
        });
    };
}

//Basic actions
//Basic actions have no additional UI

function BuyGlasses() {
    this.name = "Buy Glasses";
    this.expMult = 1;
    this.tooltip = "That's not fair. There was time now. There was all the time I needed.<br>Now you have to get new glasses again for 10 gold!<br>Causes Wander to be 4x as effective for the rest of the loop.<br>Can only have 1 Buy Glasses action.<br>Unlocked at 20% explored";
    this.townNum = 0;

    this.varName = "Glasses";
    this.stats = {
        Cha:.7,
        Spd:.3
    };
    this.allowed = function() {
        return 1;
    };
    this.canStart = function() {
        return gold >= 10;
    };
    this.cost = function() {
        addGold(-10);
    };
    this.manaCost = function() {
        return 50;
    };
    this.visible = function() {
        return towns[0].getLevel("Wander") >= 3;
    };
    this.unlocked = function() {
        return towns[0].getLevel("Wander") >= 20;
    };
    this.finish = function() {
        addGlasses(1);
    };
}

function BuyMana() {
    this.name = "Buy Mana";
    this.expMult = 1;
    this.tooltip = "1 gold = 50 mana. Buys all the mana you can.<br>Unlocked at 20% Explored";
    this.townNum = 0;

    this.varName = "Gold";
    this.stats = {
        Cha:.7,
        Int:.2,
        Luck:.1
    };
    this.manaCost = function() {
        return 100;
    };
    this.visible = function() {
        return towns[0].getLevel("Wander") >= 3;
    };
    this.unlocked = function() {
        return towns[0].getLevel("Wander") >= 20;
    };
    this.finish = function() {
        addMana(gold * 50);
        addGold(-gold);
    };
}

function TrainStr() {
    this.name = "Train Strength";
    this.expMult = 4;
    this.tooltip = "Build up those muscles. Again.<br>Has 4x exp/talent gain, and can only be done <div id='trainingLimitStr'></div> times per reset<br>Unlocked at 5% People Met";
    this.townNum = 0;

    this.varName = "trStr";
    this.stats = {
        Str:.8,
        Con:.2
    };
    this.allowed = function() {
        return trainingLimits;
    };
    this.manaCost = function() {
        return 500;
    };
    this.visible = function() {
        return towns[0].getLevel("Met") >= 1;
    };
    this.unlocked = function() {
        return towns[0].getLevel("Met") >= 5;
    };
    this.finish = function() {
    };
}

function TrainDex() {
    this.name = "Train Dex";
    this.expMult = 4;
    this.tooltip = "The kids are a little mad you're taking their playground. They'll get over it.<br>Has 4x exp/talent gain, and can only be done <div id='trainingLimitDex'></div> times per reset<br>Unlocked at 15% People Met";
    this.townNum = 0;

    this.varName = "trDex";
    this.stats = {
        Dex:.8,
        Con:.2
    };
    this.allowed = function() {
        return trainingLimits;
    };
    this.manaCost = function() {
        return 500;
    };
    this.visible = function() {
        return towns[0].getLevel("Met") >= 5;
    };
    this.unlocked = function() {
        return towns[0].getLevel("Met") >= 15;
    };
    this.finish = function() {
    };
}

function TrainSpd() {
    this.name = "Train Speed";
    this.expMult = 4;
    this.tooltip = "A new friend has a magical treadmill. Gotta go fast.<br>Has 4x exp/talent gain, and can only be done <div id='trainingLimitSpd'></div> times per reset<br>Unlocked at 30% People Met";
    this.townNum = 0;

    this.varName = "trSpd";
    this.stats = {
        Spd:.8,
        Con:.2
    };
    this.allowed = function() {
        return trainingLimits;
    };
    this.manaCost = function() {
        return 500;
    };
    this.visible = function() {
        return towns[0].getLevel("Met") >= 15;
    };
    this.unlocked = function() {
        return towns[0].getLevel("Met") >= 30;
    };
    this.finish = function() {
    };
}

function ThrowParty() {
    this.name = "Throw Party";
    this.expMult = 2;
    this.tooltip = "Take a break and socialize.<br>8x people met % over Meet People for equivalent mana cost.<br>Costs 2 reputation.<br>Unlocked at 30% Investigated";
    this.townNum = 0;

    this.varName = "Party";
    this.stats = {
        Cha:.8,
        Soul:.2
    };
    this.manaCost = function() {
        return 1600;
    };
    this.canStart = function() {
        return reputation >= 2;
    };
    this.cost = function() {
        addReputation(-2);
    };
    this.visible = function() {
        return towns[0].getLevel("Secrets") >= 20;
    };
    this.unlocked = function() {
        return towns[0].getLevel("Secrets") >= 30;
    };
    this.finish = function() {
        towns[0].finishProgress("Met", 3200, function() {
            towns[0].totalSQuests = towns[0].getLevel("Met");
        });
    };
}

function WarriorLessons() {
    this.name = "Warrior Lessons";
    this.expMult = 1;
    this.tooltip = "Learning to fight is probably important; you have a long journey ahead of you.<br>Requires 2 reputation.<br>Unlocked at 20% Investigated.";
    this.townNum = 0;

    this.varName = "trCombat";
    this.stats = {
        Str:.5,
        Dex:.3,
        Con:.2
    };
    this.manaCost = function() {
        return 1000;
    };
    this.canStart = function() {
        return reputation >= 2;
    };
    this.cost = function() {
    };
    this.visible = function() {
        return towns[0].getLevel("Secrets") >= 10;
    };
    this.unlocked = function() {
        return towns[0].getLevel("Secrets") >= 20;
    };
    this.finish = function() {
        addSkillExp("Combat", 100);
        view.updateProgressActions();
    };
}

function MageLessons() {
    this.name = "Mage Lessons";
    this.expMult = 1;
    this.tooltip = "The mystic got you into this mess, maybe it can help you get out of it.<br>Requires 2 reputation.<br>Unlocked at 20% Investigated.";
    this.townNum = 0;

    this.varName = "trMagic";
    this.stats = {
        Per:.3,
        Int:.5,
        Con:.2
    };
    this.manaCost = function() {
        return 1000;
    };
    this.canStart = function() {
        return reputation >= 2;
    };
    this.cost = function() {
    };
    this.visible = function() {
        return towns[0].getLevel("Secrets") >= 10;
    };
    this.unlocked = function() {
        return towns[0].getLevel("Secrets") >= 20;
    };
    this.finish = function() {
        addSkillExp("Magic", 100 * (1 + getSkillLevel("Alchemy")/100));
        view.updateProgressActions();
    };
}

function BuySupplies() {
    this.name = "Buy Supplies";
    this.expMult = 1;
    this.tooltip = "Prepare to move on.<br>Costs <div id='suppliesCost'></div> gold.<br>You only need one set of supplies.<br>Unlocks at a combined skill of 35.";
    this.townNum = 0;

    this.varName = "Supplies";
    this.stats = {
        Cha:.8,
        Luck:.1,
        Soul:.1
    };
    this.manaCost = function() {
        return 200;
    };
    this.canStart = function() {
        return gold >= towns[0].suppliesCost && supplies === 0;
    };
    this.cost = function() {
        addGold(-towns[0].suppliesCost);
    };
    this.visible = function() {
        return (getSkillLevel("Combat") + getSkillLevel("Magic")) >= 15;
    };
    this.unlocked = function() {
        return (getSkillLevel("Combat") + getSkillLevel("Magic")) >= 35;
    };
    this.finish = function() {
        addSupplies(1);
    };
}

function Haggle() {
    this.name = "Haggle";
    this.expMult = 1;
    this.tooltip = "They won't like you as much, but hey - you're leaving.<br>Costs 1 reputation to reduce the price of supplies by 20. <br>Unlocks at a combined skill of 35.";
    this.townNum = 0;

    this.varName = "Haggle";
    this.stats = {
        Cha:.8,
        Luck:.1,
        Soul:.1
    };
    this.manaCost = function() {
        return 100;
    };
    this.canStart = function() {
        return reputation >= 1;
    };
    this.cost = function() {
        addReputation(-1);
    };
    this.visible = function() {
        return (getSkillLevel("Combat") + getSkillLevel("Magic")) >= 15;
    };
    this.unlocked = function() {
        return (getSkillLevel("Combat") + getSkillLevel("Magic")) >= 35;
    };
    this.finish = function() {
        towns[0].suppliesCost -= 20;
        if(towns[0].suppliesCost < 0 ) {
            towns[0].suppliesCost = 0;
        }
        view.updateSupplies();
    };
}

function StartJourney() {
    this.name = "Start Journey";
    this.expMult = 2;
    this.tooltip = "Follow the trail to end up at the next town. You need to keep moving until you can learn how to shut these loops off.<br>Costs 1 supplies. Finish once to unlock Forest Path's actions, then finish this in order to use Forest Path's actions.<br>Unlocks at a combined skill of 35.";
    this.townNum = 0;

    this.varName = "Journey";
    this.stats = {
        Con:.4,
        Per:.3,
        Spd:.3
    };
    this.allowed = function() {
        return 1;
    };
    this.manaCost = function() {
        return 1000;
    };
    this.canStart = function() {
        return supplies === 1;
    };
    this.cost = function() {
        addSupplies(-1);
    };
    this.visible = function() {
        return (getSkillLevel("Combat") + getSkillLevel("Magic")) >= 15;
    };
    this.unlocked = function() {
        return (getSkillLevel("Combat") + getSkillLevel("Magic")) >= 35;
    };
    this.finish = function() {
        unlockTown(1);
    };
}

function SitByWaterfall() {
    this.name = "Sit By Waterfall";
    this.expMult = 4;
    this.tooltip = "It's peaceful here. Loud, but peaceful.<br>Has 4x exp/talent gain, and can only be done <div id='trainingLimitSoul'></div> times per reset<br>Unlocked at 70% Forest Explored.";
    this.townNum = 1;

    this.varName = "Waterfall";
    this.stats = {
        Con:.2,
        Soul:.8
    };
    this.allowed = function() {
        return trainingLimits;
    };
    this.manaCost = function() {
        return 800;
    };
    this.visible = function() {
        return towns[1].getLevel("Forest") >= 10;
    };
    this.unlocked = function() {
        return towns[1].getLevel("Forest") >= 70;
    };
    this.finish = function() {
    };
}

function PracticalMagic() {
    this.name = "Practical Magic";
    this.expMult = 1;
    this.tooltip = "Such simple uses to help out with everyday tasks. Genius, really. It's like pulling teeth getting this knowledge from the Hermit though.<br>Unlocked with both 20% Hermit Knowledge and 50 Magic.";
    this.townNum = 1;

    this.varName = "trPractical";
    this.stats = {
        Per:.3,
        Con:.2,
        Int:.5
    };
    this.manaCost = function() {
        return Math.ceil(4000 / (1 + towns[1].getLevel("Hermit")/100));
    };
    this.visible = function() {
        return towns[1].getLevel("Hermit") >= 10;
    };
    this.unlocked = function() {
        return towns[1].getLevel("Hermit") >= 20 && getSkillLevel("Magic") >= 50;
    };
    this.finish = function() {
        addSkillExp("Practical", 100);
        view.adjustManaCost("Wild Mana");
        view.adjustManaCost("Smash Pots");
        view.updateProgressActions();
    };
}

function LearnAlchemy() {
    this.name = "Learn Alchemy";
    this.expMult = 1;
    this.tooltip = "You can listen to him yammer while making light healing and remedy potions.<br>You're starting to think the potion that caused you to loop time was a complex one.<br>You provide the ingredients; costs 10 herbs.<br>Gives alchemy and magic skill.<br>Unlocked with both 40% Hermit Knowledge and 60 Magic.";
    this.townNum = 1;

    this.varName = "trAlchemy";
    this.stats = {
        Con:.3,
        Per:.1,
        Int:.6
    };
    this.canStart = function() {
        return herbs >= 10;
    };
    this.cost = function() {
        addHerbs(-10);
    };
    this.manaCost = function() {
        return Math.ceil(5000 / (1 + towns[1].getLevel("Hermit")/100));
    };
    this.visible = function() {
        return towns[1].getLevel("Hermit") >= 10;
    };
    this.unlocked = function() {
        return towns[1].getLevel("Hermit") >= 40 && getSkillLevel("Magic") >= 60;
    };
    this.finish = function() {
        addSkillExp("Alchemy", 50);
        addSkillExp("Magic", 50);
    };
}

function BrewPotions() {
    this.name = "Brew Potions";
    this.expMult = 1;
    this.tooltip = "Bubbles and Flasks. Potions and Magic.<br>Requires 5 reputation or he won't let you near his stuff.<br>Creates a potion from 10 herbs to sell at the next town.<br>Gives alchemy and magic skill.<br>Unlocked with 10 Alchemy.";
    this.townNum = 1;

    this.varName = "Potions";
    this.stats = {
        Dex:.3,
        Int:.6,
        Luck:.1,
    };
    this.canStart = function() {
        return herbs >= 10 && reputation >= 5;
    };
    this.cost = function() {
        addHerbs(-10);
    };
    this.manaCost = function() {
        return Math.ceil(4000);
    };
    this.visible = function() {
        return getSkillLevel("Alchemy") >= 1;
    };
    this.unlocked = function() {
        return getSkillLevel("Alchemy") >= 10;
    };
    this.finish = function() {
        addPotions(1);
        addSkillExp("Alchemy", 25);
        addSkillExp("Magic", 50);
    };
}

function ContinueOn() {
    this.name = "Continue On";
    this.expMult = 2;
    this.tooltip = "Keep walking to the next town, Merchanton.<br>Mana cost reduced by 60 per Old Shortcut %";
    this.townNum = 1;

    this.varName = "Continue";
    this.stats = {
        Con:.4,
        Per:.2,
        Spd:.4
    };
    this.allowed = function() {
        return 1;
    };
    this.manaCost = function() {
        return Math.ceil(8000 - (60 * towns[1].getLevel("Shortcut")));
    };
    this.visible = function() {
        return true;
    };
    this.unlocked = function() {
        return true;
    };
    this.finish = function() {
        unlockTown(2);
    };
}

function PurchaseMana() {
    this.name = "Purchase Mana";
    this.expMult = 1;
    this.tooltip = "1 gold = 50 mana. Buys all the mana you can.";
    this.townNum = 2;

    this.varName = "Gold2";
    this.stats = {
        Cha:.7,
        Int:.2,
        Luck:.1
    };
    this.manaCost = function() {
        return 100;
    };
    this.visible = function() {
        return true;
    };
    this.unlocked = function() {
        return true;
    };
    this.finish = function() {
        addMana(gold * 50);
        addGold(-gold);
    };
}

function SellPotions() {
    this.name = "Sell Potions";
    this.expMult = 1;
    this.tooltip = "Potions are worth 1 gold per alchemy skill, but it takes a bit to find a seller.";
    this.townNum = 2;

    this.varName = "SellPotions";
    this.stats = {
        Cha:.7,
        Int:.2,
        Luck:.1
    };
    this.manaCost = function() {
        return 1000;
    };
    this.visible = function() {
        return true;
    };
    this.unlocked = function() {
        return true;
    };
    this.finish = function() {
        addGold(potions * getSkillLevel("Alchemy"));
        addPotions(-potions);
    };
}

function ReadBooks() {
    this.name = "Sell Potions";
    this.expMult = 4;
    this.tooltip = "There's a library! You always loved reading.<br>Discover new worlds and perspectives, get ideas from fiction characters, and empathize with the desire to be stronger.<br>Requires glasses.<br>Has 4x exp/talent gain, and can only be done <div id='trainingLimitInt'></div> times per reset<br>Unlocks at 50% city explored";
    this.townNum = 2;

    this.varName = "SellPotions";
    this.stats = {
        Int:.8,
        Soul:.2
    };
    this.allowed = function() {
        return trainingLimits;
    };
    this.canStart = function() {
        return glasses;
    };
    this.manaCost = function() {
        return 1000;
    };
    this.visible = function() {
        return towns[2].getLevel("City") >= 5;
    };
    this.unlocked = function() {
        return towns[2].getLevel("City") >= 50;
    };
    this.finish = function() {
    };
}

//Regular Actions
//Regular actions have varName, infoName, infoText

function SmashPots() {
    this.name = "Smash Pots";
    this.expMult = 1;
    this.tooltip = "They're just sitting there, unbroken, full of potential.<br>Pots with loot in them have 100 mana.<br>Every 10 pots have mana.";
    this.townNum = 0;

    this.varName = "Pots";
    this.infoName = "Pots Smashed";
    this.infoText = "Pots with loot left <i class='fa fa-arrow-left'></i> Pots with loot total <i class='fa fa-arrow-left'></i> Pots to check for loot<br><div class='bold'>Total Found</div> <div id='totalPots'></div>";
    this.stats = {
        Str:.2,
        Per:.2,
        Spd:.6
    };
    this.manaCost = function() {
        return Math.ceil(50 / (1 + getSkillLevel("Practical")/100));
    };
    this.visible = function() {
        return true;
    };
    this.unlocked = function() {
        return true;
    };
    this.finish = function() {
        towns[0].finishRegular(this.varName, 10, function() {
            addMana(100);
            return 100;
        })
    };
}

function PickLocks() {
    this.name = "Pick Locks";
    this.expMult = 1;
    this.varName = "Locks";
    this.tooltip = "Don't worry; they won't remember.<br>Houses with loot in them have 10 gold.<br>Every 10 houses have gold.<br>Unlocked at 20% Explored";
    this.townNum = 0;

    this.infoName = "Locks Picked";
    this.infoText = "Houses with loot left <i class='fa fa-arrow-left'></i> Houses with loot total <i class='fa fa-arrow-left'></i> Houses to check for loot<br><div class='bold'>Total Found</div> <div id='totalLocks'></div>";
    this.stats = {
        Dex:.5,
        Per:.3,
        Spd:.1,
        Luck:.1
    };
    this.manaCost = function() {
        return 400;
    };
    this.visible = function() {
        return towns[0].getLevel("Wander") >= 3;
    };
    this.unlocked = function() {
        return towns[0].getLevel("Wander") >= 20;
    };
    this.finish = function() {
        towns[0].finishRegular(this.varName, 10, function() {
            let practical = getSkillLevel("Practical");
            practical = practical <= 200 ? practical : 200;
            let goldGain = Math.floor(10 * (1 + practical/100));
            addGold(goldGain);
            return goldGain;
        })
    };
}

function ShortQuest() {
    this.name = "Short Quest";
    this.expMult = 1;
    this.varName = "SQuests";
    this.tooltip = "Be a hero! ...If the reward is good and it doesn't take too long.<br>Short Quests with loot give 20 gold as a reward.<br>Every 5 Short Quests have loot.<br>Unlocked at 5% People Met";
    this.townNum = 0;

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
    this.manaCost = function() {
        return 800;
    };
    this.visible = function() {
        return towns[0].getLevel("Met") >= 1;
    };
    this.unlocked = function() {
        return towns[0].getLevel("Met") >= 5;
    };
    this.finish = function() {
        towns[0].finishRegular(this.varName, 5, function() {
            let practical = getSkillLevel("Practical") - 100;
            practical = practical <= 200 ? (practical >= 0 ? practical : 0) : 200;
            let goldGain = Math.floor(20 * (1 + practical/100));
            addGold(goldGain);
            return goldGain;
        })
    };
}

function LongQuest() {
    this.name = "Long Quest";
    this.expMult = 1;
    this.varName = "LQuests";
    this.tooltip = "Be a more impressive hero! ...As long as someone is watching.<br>Long Quests with loot give 25 gold and 1 reputation as a reward.<br>Every 5 Long Quests have loot.<br>Unlocked at 10% Investigated.";
    this.townNum = 0;

    this.infoName = "Long Quests Accomplished";
    this.infoText = "Quests with loot left <i class='fa fa-arrow-left'></i> Quests with loot total <i class='fa fa-arrow-left'></i> Quests to finish<br><div class='bold'>Total Found</div> <div id='totalLQuests'></div>";
    this.stats = {
        Str:.2,
        Int:.2,
        Con:.4,
        Spd:.2
    };
    this.manaCost = function() {
        return 2000;
    };
    this.visible = function() {
        return towns[0].getLevel("Secrets") >= 1;
    };
    this.unlocked = function() {
        let toUnlock = towns[0].getLevel("Secrets") >= 10;
        if(toUnlock && !isVisible(document.getElementById("skillList"))) {
            document.getElementById("skillList").style.display = "inline-block";
        }
        return toUnlock;
    };
    this.finish = function() {
        towns[0].finishRegular(this.varName, 5, function() {
            addReputation(1);
            let practical = getSkillLevel("Practical") - 200;
            practical = practical <= 200 ? (practical >= 0 ? practical : 0) : 200;
            let goldGain = Math.floor(25 * (1 + practical/100));
            addGold(goldGain);
            return goldGain;
        })
    };
}

function WildMana() {
    this.name = "Wild Mana";
    this.expMult = 1;
    this.tooltip = "They're out of sight of most travellers, but you have time to find and harvest them.<br>Every good mana spot has 200 mana.<br>Every 10 mana spots have good mana.";
    this.townNum = 1;

    this.varName = "WildMana";
    this.infoName = "Mana Sources Tapped";
    this.infoText = "Sources with loot left <i class='fa fa-arrow-left'></i> Sources with loot total <i class='fa fa-arrow-left'></i> Sources to check for loot<br><div class='bold'>Total Found</div> <div id='totalWildMana'></div>";
    this.stats = {
        Con:.2,
        Int:.6,
        Soul:.2
    };
    this.manaCost = function() {
        return Math.ceil(150 / (1 + getSkillLevel("Practical")/100));
    };
    this.visible = function() {
        return true;
    };
    this.unlocked = function() {
        return towns[1].getLevel("Forest") >= 2;
    };
    this.finish = function() {
        towns[1].finishRegular(this.varName, 10, function() {
            addMana(200);
            return 200;
        })
    };
}

function GatherHerbs() {
    this.name = "Gather Herbs";
    this.expMult = 1;
    this.tooltip = "Might as well dig up anything useful you find.<br>Every 10 funny plants are herbs.<br>Unlocked at 10% Forest Explored.";
    this.townNum = 1;

    this.varName = "Herbs";
    this.infoName = "Funny Plants Uprooted";
    this.infoText = "Plants with loot left <i class='fa fa-arrow-left'></i> Plants with loot total <i class='fa fa-arrow-left'></i> Plants to check for loot<br><div class='bold'>Total Found</div> <div id='totalHerbs'></div>";
    this.stats = {
        Str:.4,
        Dex:.3,
        Int:.3
    };
    this.manaCost = function() {
        return Math.ceil(200 / (1 + towns[1].getLevel("Hermit")/100));
    };
    this.visible = function() {
        return towns[1].getLevel("Forest") >= 2;
    };
    this.unlocked = function() {
        return towns[1].getLevel("Forest") >= 10;
    };
    this.finish = function() {
        towns[1].finishRegular(this.varName, 10, function() {
            addHerbs(1);
            return 1;
        })
    };
}

function Hunt() {
    this.name = "Hunt";
    this.expMult = 1;
    this.tooltip = "The forest provides.<br>Every 10 animals have good hides.<br>Unlocked at 40% Forest Explored.<br>NOTE: Using hide is not implemented yet. I'll remove this note when it is.";
    this.townNum = 1;

    this.varName = "Hunt";
    this.infoName = "Animals Skinned";
    this.infoText = "Animals with loot left <i class='fa fa-arrow-left'></i> Animals with loot total <i class='fa fa-arrow-left'></i> Animals to check for loot<br><div class='bold'>Total Found</div> <div id='totalHunt'></div>";
    this.stats = {
        Dex:.2,
        Con:.2,
        Per:.2,
        Spd:.4
    };
    this.manaCost = function() {
        return 800;
    };
    this.visible = function() {
        return towns[1].getLevel("Forest") >= 10;
    };
    this.unlocked = function() {
        return towns[1].getLevel("Forest") >= 40;
    };
    this.finish = function() {
        towns[1].finishRegular(this.varName, 10, function() {
            addHide(1);
            return 1;
        })
    };
}

function Gamble() {
    this.name = "Gamble";
    this.expMult = 2;
    this.tooltip = "The cards still somehow come out different every time.<br>Has 2x exp/talent gain<br>Costs 20 gold and 1 reputation.<br>Requires reputation greater than -5.<br>You win against every 10 suckers, and get 60 gold for winning";
    this.townNum = 2;

    this.varName = "Gamble";
    this.infoName = "Suckers Swindled";
    this.infoText = "Suckers left <i class='fa fa-arrow-left'></i> Suckers total <i class='fa fa-arrow-left'></i> People to check if they're suckers<br><div class='bold'>Total Found</div> <div id='totalGamble'></div>";
    this.stats = {
        Cha:.2,
        Luck:.8
    };
    this.canStart = function() {
        return gold >= 20 && reputation >= -5;
    };
    this.cost = function() {
        addGold(-20);
        addReputation(-1);
    };
    this.manaCost = function() {
        return 1000;
    };
    this.visible = function() {
        return true;
    };
    this.unlocked = function() {
        return towns[2].getLevel("City") >= 10;
    };
    this.finish = function() {
        towns[2].finishRegular(this.varName, 10, function() {
            addGold(60);
            return 60;
        })
    };
}

//Multipart actions
//Multipart actions have multiple distinct parts to get through before repeating
//They also get a bonus depending on how often you complete them

function HealTheSick() {
    this.name = "Heal The Sick";
    this.expMult = 1;
    this.tooltip = "You won't be able to heal them all, but they'll be thankful for doing what you can.<br>Healing is always 3 parts, each with a main stat - Diagnose (Per), Treat (Int), Inform (Cha).<br>Gives (magic skill) * (1 + main stat / 100) * sqrt(1 + times completed / 100) * (original mana cost / actual mana cost) progress points per mana.<br>Requires 12 Magic skill.<br>Gives 3 reputation upon patient completion.";
    this.townNum = 0;

    this.varName = "Heal";
    this.stats = {
        Per:.2,
        Int:.2,
        Cha:.2,
        Soul:.4
    };
    this.loopStats = ["Per", "Int", "Cha"];
    this.segments = 3;
    this.manaCost = function() {
        return 2500;
    };
    this.loopCost = function(segment) {
        return fibonacci(2+Math.floor((towns[0].HealLoopCounter+segment)/this.segments+.0000001)) * 5000;
    };
    this.tickProgress = function(offset) {
        return getSkillLevel("Magic") * (1 + getLevel(this.loopStats[(towns[0].HealLoopCounter+offset) % this.loopStats.length])/100) * Math.sqrt(1 + towns[0].totalHeal/100);
    };
    this.loopsFinished = function() {
        addReputation(3);
    };
    this.getPartName = function() {
        return "Patient " + numberToWords(Math.floor((towns[0].HealLoopCounter+.0001)/this.segments+1));
    };
    this.getSegmentName = function(segment) {
        return ["Diagnose", "Treat", "Inform"][segment % 3];
    };
    this.visible = function() {
        return towns[0].getLevel("Secrets") >= 20;
    };
    this.unlocked = function() {
        return getSkillLevel("Magic") >= 12;
    };
    this.finish = function() {
    };
}

function FightMonsters() {
    this.name = "Fight Monsters";
    this.expMult = 1;
    this.tooltip = "Slowly, you're figuring out their patterns.<br>Fighting rotates between 3 types of battles, each with a main stat - Quick (Spd), Defensive (Str), Aggressive (Con).<br>Gives (combat skill) * (1 + main stat / 100) * sqrt(1 + times completed / 100) * (original mana cost / actual mana cost) progress points per mana.<br>Requires 10 Combat skill.<br>Gives 20 gold per fight segment completion.";
    this.townNum = 0;

    this.varName = "Fight";
    this.stats = {
        Str:.3,
        Spd:.3,
        Con:.3,
        Luck:.1
    };
    this.loopStats = ["Spd", "Spd", "Spd", "Str", "Str", "Str", "Con", "Con", "Con"];
    this.segments = 3;
    this.manaCost = function() {
        return 2000;
    };
    this.loopCost = function(segment) {
        return fibonacci(Math.floor((towns[0].FightLoopCounter+segment) - towns[0].FightLoopCounter/3+.0000001)) * 10000;
    };
    this.tickProgress = function(offset) {
        return getSkillLevel("Combat") * (1 + getLevel(this.loopStats[(towns[0].FightLoopCounter+offset) % this.loopStats.length])/100) * Math.sqrt(1 + towns[0].totalFight/100);
    };
    this.loopsFinished = function() {
    };
    this.segmentFinished = function() {
        addGold(20);
    };
    this.getPartName = function() {
        let name = monsterNames()[Math.floor(towns[0].FightLoopCounter/3+.0000001)];
        if(!name) {
            name = ["Speedy Monsters", "Tough Monsters", "Scary Monsters"][Math.floor(towns[0].FightLoopCounter/3+.0000001) % 3]
        }
        return name;
    };
    this.getSegmentName = function(segment) {
        let name = monsterNames()[Math.floor(towns[0].FightLoopCounter/3+.0000001)];
        if(!name) {
            name = ["Speedy Monsters", "Tough Monsters", "Scary Monsters"][Math.floor(towns[0].FightLoopCounter/3+.0000001) % 3]
        }
        if(segment % 3 === 0) {
            return "A couple "+name;
        } else if(segment % 3 === 1) {
            return "A few "+name;
        }
        return "A bunch of "+name;
    };
    this.visible = function() {
        return towns[0].getLevel("Secrets") >= 20;
    };
    this.unlocked = function() {
        return getSkillLevel("Combat") >= 10;
    };
    this.finish = function() {
    };
}
function monsterNames() { //spd, defensive, aggressive
    return ["Deer", "Giant Turtles", "Goblins", "Demon Rabbits", "Giant Honeybadgers", "Venemous Snakes", "Angry Monkeys", "Trolls", "Ogres", "Pixies", "Treants", "Gelatanous Cubes", "Fairies", "Orcs", "Beholders", "Spectres", "Shambling Mound", "Corrupted Mushroomfolk", "Giant Owls", "Blood Trolls", "Small Wyrms", "Pikachus", "Machokes", "Alakazams"];
}

function SmallDungeon() {
    this.name = "Small Dungeon";
    this.expMult = 1;
    this.tooltip = "There are small changes each time; it's harder to get used to. The soulstones at the end last through loops, but they're not always in the dungeon... Strange.<br>The dungeon requires different skills at different points.<br>Gives (magic + combat skill) * (1 + main stat / 100) * sqrt(1 + times completed / 200) * (original mana cost / actual mana cost) progress points per mana.<br>Requires a combined skill of 35.<br>Gives 1 soulstone per completion - hover over Completed for info.";
    this.townNum = 0;

    this.varName = "SDungeon";
    this.stats = {
        Str:.1,
        Dex:.4,
        Con:.3,
        Cha:.1,
        Luck:.1
    };
    this.loopStats = ["Dex", "Con", "Dex", "Cha", "Dex", "Str", "Luck"];
    this.segments = 7;
    this.completedTooltip = "Each soulstone improves a random stat's exp gain by (1+(soulstones)^.8/10). Each soulstone reduces the chance you'll get the next one by 2%.<br>Chance to receive a soulstone recovers at .00002% per mana.<br><div class='bold'>Chance </div> <div id='soulstoneChance'></div>%<br><div class='bold'>Last Stat</div> <div id='soulstonePrevious'>NA</div>";
    this.manaCost = function() {
        return 3000;
    };
    this.loopCost = function(segment) {
        return fibonacci(1+Math.floor((towns[0].SDungeonLoopCounter+segment)/this.segments+.0000001)) * 15000;
    };
    this.tickProgress = function(offset) {
        return (getSkillLevel("Combat")+getSkillLevel("Magic")) * (1 + getLevel(this.loopStats[(towns[0].SDungeonLoopCounter+offset) % this.loopStats.length])/100) * Math.sqrt(1 + towns[0].totalSDungeon/200);
    };
    this.loopsFinished = function() {
        let rand = Math.random();
        if(rand <= soulstoneChance) {
            let statToAdd = statList[Math.floor(Math.random() * statList.length)];
            document.getElementById('soulstonePrevious').innerHTML = statToAdd;
            stats[statToAdd].soulstone = stats[statToAdd].soulstone ? stats[statToAdd].soulstone+1 : 1;
            soulstoneChance *= .98;
            view.updateSoulstones();
            if(storyMax <= 1) {
                unlockStory(1);
            }
        } else if(storyMax <= 2) {
            unlockStory(2);
        }
    };
    this.getPartName = function() {
        return "Small Dungeon " + numberToWords(Math.floor((towns[0].SDungeonLoopCounter+.0001)/this.segments+1));
    };
    this.getSegmentName = function(segment) {
        return ["Spike Traps", "Long Hallways", "Arrow Traps", "Riddle Guardian", "Swinging Axes", "Boss", "Loot"][segment % this.segments];
    };
    this.visible = function() {
        return (getSkillLevel("Combat") + getSkillLevel("Magic")) >= 15;
    };
    this.unlocked = function() {
        return (getSkillLevel("Combat") + getSkillLevel("Magic")) >= 35;
    };
    this.finish = function() {
    };
}
