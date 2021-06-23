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
];
const trainingActions = [
    //"Train Speed",
];
function hasLimit(name) {
    return limitedActions.includes(name);
}
function getTravelNum(name) {
    if (name === "Dive Into Well") return 1;
    return 0;
}
function isTraining(name) {
    return trainingActions.includes(name);
}

function getXMLName(name) {
    return name.toLowerCase().replace(/ /gu, "_");
}

const townNames = ["Beginnersville", "Forest Path", "Merchanton", "Mt. Olympus", "Valhalla", "Adeptsville"];


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
const actionsWithGoldCost = Object.values(Action).filter(
    action => action.goldCost !== undefined
);

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
        towns[0].finishProgress(this.varName, 5000 * (1 + getSkillLevel("ManaSense")));
        handleSkillExp(this.skills);
    }
});
function adjustManaPots() {
    towns[0].totalDrinkPotion = towns[0].getLevel("SensePotions");
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
        Will:1
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
    // note this name is misleading: it is used for mana and gold gain.
    goldCost() {
        return 150;
    },
    finish() {
        towns[0].finishRegular(this.varName, 10, () => {
            const manaGain = this.goldCost();
            addMana(manaGain);
            return manaGain;
        });
    }
});

Action.DiveIntoWell = new Action("Dive Into Well", {
    type: "normal",
    expMult: 1,
    townNum: 0,
    storyReqs(storyNum) {
        switch (storyNum) {
            case 1:
                return townsUnlocked.includes(1);
        }
        return false;
    },
    stats: {
        Will:.9,
        Ele:.1
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
        return towns[0].getLevel("SensePotions") >= 100;
    },
    unlocked() {
        return getSkillLevel("ManaSense") >= 3;
    },
    finish() {
        unlockTown(1);
        curTown = 1;
    },
    unlock() {
        unlockTown(1);
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
        ManaSense: 30
    },
    stats: {
        Con:.3,
        Per:.6,
        Will:.1
    },
    manaCost() {
        return 600;
    },
    visible() {
        return true;
    },
    unlocked() {
        return true;
    },
    finish() {
        towns[1].finishProgress(this.varName, 3000 * (1 + getSkillLevel("ManaSense")));
        handleSkillExp(this.skills);
    }
});
function adjustManaCrystals() {
    towns[1].totalUncoverCrystal = Math.floor(towns[1].getLevel("SenseCrystals") / 10);
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
    goldCost() {
        return 600 + (getSkillLevel("ManaControl") > 20 ? 20 : getSkillLevel("ManaControl")) * 10;
    },
    finish() {
        towns[1].finishRegular(this.varName, 2, () => {
            const manaGain = this.goldCost();
            addMana(manaGain);
            return manaGain;
        });
        handleSkillExp(this.skills);
    }
});