function getStatColor(statName) {
    let stat = data.stats[statName];
    // if(stat.linkedActionExpStats.length === 0 && stat.linkedActionExpertiseStats.length === 0) {
    //     return "blue"
    // }
    //if the stat is gained with unlocked actions
    let statAddedTo = stat.perSecond !== 0;
    let statUsed = false;
    stat.linkedActionExpertiseStats.forEach(function(actionVar) {
        let actionObj = data.actions[actionVar];
        if(actionObj.visible || globalVisible) {
            statUsed = true;
        }
    });
    stat.linkedActionExpStats.forEach(function(actionVar) {
        let actionObj = data.actions[actionVar];
        if(actionObj.visible || globalVisible) {
            statUsed = true;
        }
    });

    if(statAddedTo && statUsed) {
        return "black";
    }
    if(statAddedTo && !statUsed) {
        return "green";
    }
    if(!statAddedTo && statUsed) {
        return "blue";
    }
    return "red";
}

function getBackgroundColor(actionObj) {
    switch (actionObj.momentumName) {
        case "mana":
            return "#2da3ef";
        case "gold":
            return "#ffe52c";
        case "conversations":
            return "#c4ffff";
        case "arcana":
            return "#ff1cf4";
        default:
            return "#BDF89DFF";
    }
}

function getStatChanges() {
    let statsPerSecond = {};

    data.actionNames.forEach(actionName => {
        let actionObj = data.actions[actionName];

        // Calculate levels per second
        let completesPerSecond = actionObj.progressRate() * ticksPerSecond / actionObj.progressMax;
        let levelsPerSecond = completesPerSecond * actionObj.expToAdd / actionObj.expToLevel;

        // Update statsPerSecond based on the action's onLevelStats
        actionObj.onLevelStats.forEach(([stat, amount]) => {
            if (!statsPerSecond.hasOwnProperty(stat)) { // Auto-initialize
                statsPerSecond[stat] = 0;
            }
            statsPerSecond[stat] += amount * levelsPerSecond;
        });
    });
    return statsPerSecond;
}
