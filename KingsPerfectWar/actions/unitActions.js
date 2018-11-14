units = [];
unitStats = {
    //friendly
    king: { atk:10, hp:100 },
    spearman: { atk:1, hp:20 },
    archer: { atk:5, hp:60 },
    catapult: { atk:25, hp: 180 },

    //enemy
    thug: { atk:1, hp:15 },
    brigand: { atk: 3, hp: 40 },
    bandit: { atk: 6, hp: 100 },
    thief: { atk:10, hp: 120 },

    //monsters
    goblin: { atk:1, hp:5 },
    hobgoblin: { atk:2, hp:30 }
};

function getStatsOfUnit(varName) {
    return unitStats[varName]; //TODO buffs go here
}

function createUnit(varName, isFriendly, startingLoc) {
    let unit = {};
    unit.varName = varName;
    unit.isFriendly = isFriendly;
    if(startingLoc === "home") {
        unit.coords = copyArray(levelData.home.coords);
    }
    let stats = getStatsOfUnit(unit.varName);
    unit.atk = stats.atk;
    unit.hp = stats.hp;
}