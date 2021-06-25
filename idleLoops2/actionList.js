"use strict";

function withoutSpaces(name) {
    return name.replace(/ /gu, "");
}

function translateClassNames(name) {
    // construct a new action object with appropriate prototype
    const nameWithoutSpaces = withoutSpaces(name);
    if (nameWithoutSpaces in Action) {
        return Object.create(Action[nameWithoutSpaces]);
    }
    console.log(`error trying to create ${name}`);
    return false;
}

const limitedActions = [
    "Drink Potion",
    "Uncover Crystal",
    "Absorb Vein"
];
const trainingActions = [
    //"Train Speed",
];
function hasLimit(name) {
    return limitedActions.includes(name);
}
function isTraining(name) {
    return trainingActions.includes(name);
}

function getXMLName(name) {
    return name.toLowerCase().replace(/ /gu, "_");
}


// there are 4 types of actions
// 1: normal actions. normal actions have no additional UI (haggle, train strength)
// 2: progress actions. progress actions have a progress bar and use 100, 200, 300, etc. leveling system (wander, meet people)
// 3: limited actions. limited actions have town info for their limit, and a set of town vars for their "data"
// 4: multipart actions. multipart actions have multiple distinct parts to get through before repeating. they also get a bonus depending on how often you complete them

// type names are "normal", "progress", "limited", and "multipart".
// define one of these in the action, and they will create any additional UI elements that are needed

// exp mults are default 100%, 150% for skill training actions, 200% for actions that cost a resource, 300% for actions that cost 2 resources, and 500% for actions that cost soulstones
// todo: ^^ currently some actions are too high, but I am saving these balance changes for the z5/z6 update

// actions are all sorted below by town in order

function Action(name, extras) {
    this.name = name;
    // many actions have to override this (in extras) for save compatibility, because the
    // varName is often used in parts of the game state
    this.varName = withoutSpaces(name);
    Object.assign(this, extras);
}

/* eslint-disable no-invalid-this */
// not all actions have tooltip2 or labelDone, but among actions that do, the XML format is
// always the same; these are loaded lazily once (and then they become own properties of the
// specific Action object)
defineLazyGetter(Action.prototype, "tooltip", function() {
    return _txt(`actions>${getXMLName(this.name)}>tooltip`);
});
defineLazyGetter(Action.prototype, "tooltip2", function() {
    return _txt(`actions>${getXMLName(this.name)}>tooltip2`);
});
defineLazyGetter(Action.prototype, "label", function() {
    return _txt(`actions>${getXMLName(this.name)}>label`);
});
defineLazyGetter(Action.prototype, "labelDone", function() {
    return _txt(`actions>${getXMLName(this.name)}>label_done`);
});

// all actions to date with info text have the same info text, so presently this is
// centralized here (function will not be called by the game code if info text is not
// applicable)
Action.prototype.infoText = function() {
    return `${_txt(`actions>${getXMLName(this.name)}>info_text1`)}
            <i class='fa fa-arrow-left'></i>
            ${_txt(`actions>${getXMLName(this.name)}>info_text2`)}
            <i class='fa fa-arrow-left'></i>
            ${_txt(`actions>${getXMLName(this.name)}>info_text3`)}
            <br><span class='bold'>${`${_txt("actions>tooltip>total_found")}: `}</span><div id='total${this.varName}'></div>
            <br><span class='bold'>${`${_txt("actions>tooltip>total_checked")}: `}</span><div id='checked${this.varName}'></div>`;
};

// same as Action, but contains shared code to load segment names for multipart actions.
// (constructor takes number of segments as a second argument)
function MultipartAction(name, extras) {
    Action.call(this, name, extras);
    this.segments = (extras.varName === "Fight") ? 3 : extras.loopStats.length;
}
MultipartAction.prototype = Object.create(Action.prototype);
MultipartAction.prototype.constructor = MultipartAction;
// lazily calculate segment names when explicitly requested (to give chance for localization
// code to be loaded first)
defineLazyGetter(MultipartAction.prototype, "segmentNames", function() {
    return Array.from(
        _txtsObj(`actions>${getXMLName(this.name)}>segment_names>name`)
    ).map(elt => elt.textContent);
});
MultipartAction.prototype.getSegmentName = function(segment) {
    return this.segmentNames[segment % this.segmentNames.length];
};


function DungeonAction(name, dungeonNum, extras) {
    MultipartAction.call(this, name, extras);
    this.dungeonNum = dungeonNum;
}
DungeonAction.prototype = Object.create(MultipartAction.prototype);
DungeonAction.prototype.constructor = DungeonAction;
DungeonAction.prototype.completedTooltip = function() {
    let ssDivContainer = "";
    for (let i = 0; i < dungeons[this.dungeonNum].length; i++) {
        ssDivContainer += `Floor ${i + 1} |
                            <div class='bold'>${_txt(`actions>${getXMLName(this.name)}>chance_label`)} </div> <div id='soulstoneChance${this.dungeonNum}_${i}'></div>% - 
                            <div class='bold'>${_txt(`actions>${getXMLName(this.name)}>last_stat_label`)} </div> <div id='soulstonePrevious${this.dungeonNum}_${i}'>NA</div> - 
                            <div class='bold'>${_txt(`actions>${getXMLName(this.name)}>label_done`)}</div> <div id='soulstoneCompleted${this.dungeonNum}_${i}'></div><br>`;
    }
    return _txt(`actions>${getXMLName(this.name)}>completed_tooltip`) + ssDivContainer;
};
DungeonAction.prototype.getPartName = function() {
    const floor = Math.floor((towns[this.townNum][`${this.varName}LoopCounter`] + 0.0001) / this.segments + 1);
    return `${_txt(`actions>${getXMLName(this.name)}>label_part`)} ${floor <= dungeons[this.dungeonNum].length ? numberToWords(floor) : _txt(`actions>${getXMLName(this.name)}>label_complete`)}`;
};

function finishDungeon(dungeonNum, floorNum) {
    const floor = dungeons[dungeonNum][floorNum];
    if (!floor) {
        return false;
    }
    floor.completed++;
    const rand = Math.random();
    if (rand <= floor.ssChance) {
        const statToAdd = statList[Math.floor(Math.random() * statList.length)];
        floor.lastStat = statToAdd;
        stats[statToAdd].soulstone = stats[statToAdd].soulstone ? (stats[statToAdd].soulstone + Math.pow(10, dungeonNum)) : 1;
        floor.ssChance *= 0.98;
        view.updateSoulstones();
        return true;
    }
    return false;
}


Action.SensePotions = new Action("Sense Potions", {
    type: "progress",
    expMult: 1,
    townNum: 0,
    storyReqs(storyNum) {
        switch (storyNum) {
            case 1:
                return towns[0].getLevel(this.varName) >= 50;
            case 2:
                return towns[0].getLevel(this.varName) >= 100;
        }
        return false;
    },
    skills: {
        ManaSense: 10
    },
    stats: {
        Con:.2,
        Per:.7,
        Will:.1
    },
    //affectedBy: ["Buy Glasses"],
    manaCost() {
        return 200;
    },
    visible() {
        return true;
    },
    unlocked() {
        return true;
    },
    finish() {
        towns[0].finishProgress(this.varName, 10000 * (1 + getSkillLevel("ManaSense")));
        handleSkillExp(this.skills);
    }
});
function adjustManaPots() {
    towns[0].totalDrinkPotion = Math.floor(towns[0].getLevel("SensePotions") / 10 + 0.0000001);
}

Action.DrinkPotion = new Action("Drink Potion", {
    type: "limited",
    expMult: 1,
    townNum: 0,
    storyReqs(storyNum) {
        switch (storyNum) {
            case 1:
                return towns[0][`good${this.varName}`] >= 10;
        }
        return false;
    },
    stats: {
        Will:.9,
        Ref:.1
    },
    manaCost() {
        return 100;
    },
    visible() {
        return true;
    },
    unlocked() {
        return true;
    },
    manaGain() {
        return 200;
    },
    finish() {
        towns[0].finishRegular(this.varName, 2, () => {
            const manaGain = this.manaGain();
            addMana(manaGain);
            return manaGain;
        });
    }
});

Action.DiveIntoWell = new Action("Dive Into Well", {
    type: "normal",
    expMult: 1,
    townNum: 0,
    travelTarget:1,
    storyReqs(storyNum) {
        switch (storyNum) {
            case 1:
                return townsUnlocked.includes(1);
        }
        return false;
    },
    stats: {
        Will:.8,
        Ref:.2
    },
    allowed() {
        return 1;
    },
    manaCost() {
        return 400;
    },
    canStart() {
        return true;
    },
    visible() {
        return towns[0].getLevel("SensePotions") >= 60;
    },
    unlocked() {
        return getSkillLevel("ManaSense") >= 2;
    },
    finish() {
    }
});

Action.SenseCrystals = new Action("Sense Crystals", {
    type: "progress",
    expMult: 1,
    townNum: 1,
    storyReqs(storyNum) {
        switch (storyNum) {
            case 1:
                return towns[1].getLevel(this.varName) >= 50;
            case 2:
                return towns[1].getLevel(this.varName) >= 100;
        }
        return false;
    },
    skills: {
        ManaSense: 25
    },
    stats: {
        Con:.3,
        Per:.6,
        Will:.1
    },
    manaCost() {
        return 500;
    },
    visible() {
        return true;
    },
    unlocked() {
        return true;
    },
    finish() {
        towns[1].finishProgress(this.varName, 7500 * (1 + getSkillLevel("ManaSense")));
        handleSkillExp(this.skills);
    }
});
function adjustManaCrystals() {
    towns[1].totalUncoverCrystal = Math.floor(towns[1].getLevel("SenseCrystals") / 10 + .000001) + Math.floor(towns[1].getLevel("ExploreTunnels") / 10 + .000001);
}

Action.UncoverCrystal = new Action("Uncover Crystal", {
    type: "limited",
    expMult: 1,
    townNum: 1,
    storyReqs(storyNum) {
        switch (storyNum) {
            case 1:
                return towns[1][`good${this.varName}`] >= 5;
            case 2:
                return getSkillLevel("ManaControl") >= 20;
        }
        return false;
    },
    stats: {
        Con:.8,
        Will:.2
    },
    skills: {
        ManaControl: 10
    },
    manaCost() {
        return 400;
    },
    visible() {
        return true;
    },
    unlocked() {
        return true;
    },
    manaGain() {
        return 600 + (getSkillLevel("ManaControl") > 20 ? 20 : getSkillLevel("ManaControl")) * 10;
    },
    finish() {
        towns[1].finishRegular(this.varName, 2, () => {
            const manaGain = this.manaGain();
            addMana(manaGain);
            return manaGain;
        });
        handleSkillExp(this.skills);
        view.adjustManaCost("Absorb Source");
        view.adjustManaCost("Get Well Mana");
    }
});

Action.ExploreTunnels = new Action("Explore Tunnels", {
    type: "progress",
    expMult: 1,
    townNum: 1,
    storyReqs(storyNum) {
        switch (storyNum) {
            case 1:
                return towns[this.townNum].getLevel(this.varName) >= 50;
            case 2:
                return towns[this.townNum].getLevel(this.varName) >= 80;
            case 3:
                return towns[this.townNum].getLevel(this.varName) >= 100;
        }
        return false;
    },
    stats: {
        Per:.5,
        Ref:.3,
        Soul:.2
    },
    skills: {
        ManaSense: 30
    },
    manaCost() {
        return 600;
    },
    visible() {
        return towns[1].getLevel("SenseCrystals") >= 80;
    },
    unlocked() {
        return towns[1].getLevel("SenseCrystals") >= 100;
    },
    finish() {
        addResource("exploreTunnels", true);
        towns[this.townNum].finishProgress(this.varName, 5000 * (1 + getSkillLevel("ManaSense")));
        handleSkillExp(this.skills);
    }
});

Action.DiscoverTraps = new Action("Discover Traps", {
    type: "progress",
    expMult: 1,
    townNum: 1,
    storyReqs(storyNum) {
        switch (storyNum) {
            case 1:
                return towns[1].getLevel(this.varName) >= 100;
        }
        return false;
    },
    stats: {
        Per:.5,
        Ref:.5
    },
    affectedBy: ["Explore Tunnels"],
    manaCost() {
        return 600;
    },
    canStart() {
        return resources.exploreTunnels;
    },
    skills: {
        ManaSense: 30
    },
    visible() {
        return towns[1].getLevel("ExploreTunnels") >= 80;
    },
    unlocked() {
        return towns[1].getLevel("ExploreTunnels") >= 100;
    },
    finish() {
        towns[1].finishProgress(this.varName, 3000 * (1 + getSkillLevel("ManaSense")));
        handleSkillExp(this.skills);
    }
});

Action.Switch1 = new Action("Switch1", {
    type: "normal",
    expMult: 1,
    townNum: 1,
    storyReqs(storyNum) {
        switch (storyNum) {
            case 1:
                return resources.switch1;
        }
        return false;
    },
    stats: {
        Con:.5,
        Ref:.5
    },
    affectedBy: ["Explore Tunnels"],
    allowed() {
        return 1;
    },
    manaCost() {
        return 200;
    },
    canStart() {
        return resources.exploreTunnels;
    },
    visible() {
        return towns[1].getLevel("DiscoverTraps") >= 40;
    },
    unlocked() {
        return towns[1].getLevel("DiscoverTraps") >= 100;
    },
    finish() {
        addResource("switch1", true);
    },
});

Action.Switch2 = new Action("Switch2", {
    type: "normal",
    expMult: 1,
    townNum: 1,
    storyReqs(storyNum) {
        switch (storyNum) {
            case 1:
                return resources.switch2;
        }
        return false;
    },
    stats: {
        Con:.5,
        Ref:.5
    },
    affectedBy: ["Explore Tunnels"],
    allowed() {
        return 1;
    },
    manaCost() {
        return 200;
    },
    canStart() {
        return resources.exploreTunnels;
    },
    visible() {
        return towns[1].getLevel("DiscoverTraps") >= 70;
    },
    unlocked() {
        return towns[1].getLevel("DiscoverTraps") >= 100;
    },
    finish() {
        addResource("switch2", true);
    },
});

Action.Switch3 = new Action("Switch3", {
    type: "normal",
    expMult: 1,
    townNum: 1,
    storyReqs(storyNum) {
        switch (storyNum) {
            case 1:
                return resources.switch3;
        }
        return false;
    },
    stats: {
        Con:.5,
        Ref:.5
    },
    affectedBy: ["Explore Tunnels"],
    allowed() {
        return 1;
    },
    manaCost() {
        return 200;
    },
    canStart() {
        return resources.exploreTunnels;
    },
    visible() {
        return towns[1].getLevel("DiscoverTraps") >= 100;
    },
    unlocked() {
        return towns[1].getLevel("DiscoverTraps") >= 100;
    },
    finish() {
        addResource("switch3", true);
    },
});

Action.DisarmTraps = new Action("Disarm Traps", {
    type: "normal",
    expMult: 1,
    townNum: 1,
    storyReqs(storyNum) {
        switch (storyNum) {
            case 1:
                return resources.disarmTraps;
        }
        return false;
    },
    stats: {
        Ele:1
    },
    affectedBy: ["Switch1", "Switch2", "Switch3"],
    allowed() {
        return 1;
    },
    manaCost() {
        return 400;
    },
    canStart() {
        return resources.switch1 && resources.switch2 && resources.switch3;
    },
    visible() {
        return towns[1].getLevel("DiscoverTraps") >= 100;
    },
    unlocked() {
        return towns[1].getLevel("DiscoverTraps") >= 100;
    },
    finish() {
        addResource("disarmTraps", true);
    },
});

Action.ExploreDeep = new Action("Explore Deep", {
    type: "progress",
    expMult: 1,
    townNum: 1,
    storyReqs(storyNum) {
        switch (storyNum) {
            case 1:
                return towns[this.townNum].getLevel(this.varName) >= 50;
            case 2:
                return towns[this.townNum].getLevel(this.varName) >= 100;
        }
        return false;
    },
    stats: {
        Per:.4,
        Ref:.3,
        Soul:.3
    },
    skills: {
        ManaSense: 50
    },
    affectedBy: ["Disarm Traps"],
    canStart() {
        return resources.disarmTraps;
    },
    manaCost() {
        return 1000;
    },
    visible() {
        return towns[1].getLevel("DiscoverTraps") >= 100;
    },
    unlocked() {
        return towns[1].getLevel("DiscoverTraps") >= 100;
    },
    finish() {
        addResource("exploreTunnels", true);
        towns[this.townNum].finishProgress(this.varName, 2000 * (1 + getSkillLevel("ManaSense")));
        handleSkillExp(this.skills);
    }
});
function adjustManaVein() {
    towns[1].totalAbsorbVein = Math.floor(towns[1].getLevel("ExploreDeep") / 20 + .000001);
}

Action.AbsorbVein = new Action("Absorb Vein", {
    type: "limited",
    expMult: 1,
    townNum: 1,
    storyReqs(storyNum) {
        switch (storyNum) {
            case 1:
                return towns[1][`good${this.varName}`] >= 5;
        }
        return false;
    },
    stats: {
        Con:.6,
        Will:.4
    },
    skills: {
        ManaControl: 50
    },
    affectedBy: ["Disarm Traps"],
    canStart() {
        return resources.disarmTraps;
    },
    manaCost() {
        return 1000;
    },
    visible() {
        return towns[1].getLevel("ExploreDeep") >= 20;
    },
    unlocked() {
        return towns[1].getLevel("ExploreDeep") >= 20;
    },
    manaGain() {
        let controlSkill = getSkillLevel("ManaControl") - 10;
        if(controlSkill < 0) {
            controlSkill = 0;
        }
        return 1500 + (controlSkill > 20 ? 20 : controlSkill) * 25;
    },
    finish() {
        towns[1].finishRegular(this.varName, 1, () => {
            const manaGain = this.manaGain();
            addMana(manaGain);
            return manaGain;
        });
        handleSkillExp(this.skills);
        view.adjustManaCost("Absorb Source");
        view.adjustManaCost("Get Well Mana");
    }
});

Action.GetToSource = new Action("Get To Source", {
    type: "normal",
    expMult: 1,
    townNum: 1,
    storyReqs(storyNum) {
        switch (storyNum) {
            case 1:
                return resources.getToSource;
        }
        return false;
    },
    stats: {
        Con:.4,
        Ref:.4,
        Will:.2
    },
    affectedBy: ["Disarm Traps"],
    canStart() {
        return resources.disarmTraps;
    },
    allowed() {
        return 1;
    },
    manaCost() {
        return 3000;
    },
    visible() {
        return towns[1].getLevel("ExploreDeep") >= 100;
    },
    unlocked() {
        return towns[1].getLevel("ExploreDeep") >= 100;
    },
    finish() {
        addResource("getToSource", true);
    }
});

Action.AbsorbSource = new Action("Absorb Source", {
    type: "normal",
    expMult: 1,
    townNum: 1,
    storyReqs(storyNum) {
        switch (storyNum) {
            case 1:
                return resources.absorbSource;
        }
        return false;
    },
    stats: {
        Con:.5,
        Will:.5
    },
    skills: {
        ManaControl: 300
    },
    affectedBy: ["Get To Source"],
    canStart() {
        return resources.getToSource;
    },
    allowed() {
        return 1;
    },
    manaCost() {
        let controlSkill = getSkillLevel("ManaControl") - 10;
        if(controlSkill < 0) {
            controlSkill = 0;
        }
        return 2000 - (controlSkill > 24 ? 24 : controlSkill) * 50;
    },
    visible() {
        return towns[1].getLevel("ExploreDeep") >= 100;
    },
    unlocked() {
        return towns[1].getLevel("ExploreDeep") >= 100;
    },
    finish() {
        handleSkillExp(this.skills);
        addResource("absorbSource", true);
        addMana(4000);
        view.adjustManaCost("Absorb Source");
        view.adjustManaCost("Get Well Mana");
    },
});

Action.EscapeRoutes = new Action("Escape Routes", {
    type: "progress",
    expMult: 1,
    townNum: 1,
    storyReqs(storyNum) {
        switch (storyNum) {
            case 1:
                return towns[this.townNum].getLevel(this.varName) >= 100;
        }
        return false;
    },
    stats: {
        Per:.6,
        Ele:.4
    },
    affectedBy: ["Absorb Source"],
    canStart() {
        return resources.absorbSource;
    },
    manaCost() {
        return 1000;
    },
    visible() {
        return towns[1].getLevel("ExploreDeep") >= 100;
    },
    unlocked() {
        return towns[1].getLevel("ExploreDeep") >= 100;
    },
    finish() {
        addResource("exploreTunnels", true);
        towns[this.townNum].finishProgress(this.varName, 20000);
        handleSkillExp(this.skills);
    }
});

Action.EscapeWell = new Action("Escape Well", {
    type: "normal",
    expMult: 1,
    townNum: 1,
    travelTarget: 0,
    storyReqs(storyNum) {
        switch (storyNum) {
            case 1:
                return storyReqs.wellEscaped;
        }
        return false;
    },
    stats: {
        Con:.4,
        Ref:.4,
        Will:.2
    },
    allowed() {
        return 1;
    },
    manaCost() {
        return 2000;
    },
    visible() {
        return towns[1].getLevel("EscapeRoutes") >= 80;
    },
    unlocked() {
        return towns[1].getLevel("EscapeRoutes") >= 100;
    },
    finish() {
        unlockStory("wellEscaped");
    }
});

Action.GetWellMana = new Action("Get Well Mana", {
    type: "normal",
    expMult: 1,
    townNum: 0,
    storyReqs(storyNum) {
        switch (storyNum) {
            case 1:
                return resources.getWellMana;
        }
        return false;
    },
    stats: {
        Con:.5,
        Will:.5
    },
    skills: {
        ManaControl: 300
    },
    affectedBy: ["Buy Ladder"],
    canStart() {
        return !resources.absorbSource && resources.ladder;
    },
    allowed() {
        return 1;
    },
    manaCost() {
        let controlSkill = getSkillLevel("ManaControl") - 10;
        if(controlSkill < 0) {
            controlSkill = 0;
        }
        return 2200 - (controlSkill > 24 ? 24 : controlSkill) * 50;
    },
    visible() {
        return storyReqs.wellEscaped;
    },
    unlocked() {
        return storyReqs.wellEscaped;
    },
    finish() {
        handleSkillExp(this.skills);
        unlockStory("getWellMana");
        addMana(4000);
        view.adjustManaCost("Absorb Source");
        view.adjustManaCost("Get Well Mana");
    },
});

Action.BuyLadder = new Action("Buy Ladder", {
    type: "normal",
    expMult: 1,
    townNum: 0,
    storyReqs(storyNum) {
        switch (storyNum) {
            case 1:
                return resources.ladder;
        }
        return false;
    },
    stats: {
        Lead: 1
    },
    allowed() {
        return 1;
    },
    canStart() {
        return true; //resources.gold >= 10;
    },
    cost() {
        //addResource("gold", -10);
    },
    manaCost() {
        return 200;
    },
    visible() {
        return storyReqs.wellEscaped;
    },
    unlocked() {
        return storyReqs.wellEscaped;
    },
    finish() {
        addResource("ladder", true);
    }
});

Action.LearnHealing = new Action("Learn Healing", {
    type: "progress",
    expMult: 1,
    townNum: 0,
    storyReqs(storyNum) {
        switch (storyNum) {
            case 1:
                return towns[this.townNum].getLevel(this.varName) >= 100;
        }
        return false;
    },
    stats: {
        Will:1
    },
    manaCost() {
        return 500;
    },
    visible() {
        return storyReqs.wellEscaped;
    },
    unlocked() {
        return storyReqs.wellEscaped;
    },
    finish() {
        addResource("exploreTunnels", true);
        towns[this.townNum].finishProgress(this.varName, 600 * (1 + getSkillLevel("ManaSense")));
        handleSkillExp(this.skills);
    }
});




//needs to be at the end
const actionsWithManaGain = Object.values(Action).filter(
    action => action.manaGain !== undefined
);