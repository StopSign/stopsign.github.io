function getStatColor(statName) {
    let stat = data.stats[statName];
    // if(stat.linkedActionExpStats.length === 0 && stat.linkedActionExpertiseStats.length === 0) {
    //     return "blue"
    // }
    //if the stat is gained with unlocked actions
    let statAddedTo = stat.perMinute !== 0;
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
        return "var(--text-primary)";
    }
    if(statAddedTo && !statUsed) {
        return "var(--success-color)";
    }
    if(!statAddedTo && statUsed) {
        return "var(--accent-primary)";
    }
    return "var(--error-color)";
}

function gameStateMatches(actionObj) {
    return (data.gameState === "default" && !actionObj.isKTL) || (data.gameState==="KTL" && actionObj.isKTL);
}

function getResourceColor(actionObj) {
    switch (actionObj.momentumName) {
        case "mana":
            return "var(--mana-color)";
        case "gold":
            return "var(--gold-color)";
        case "conversations":
            return "var(--conversations-color)";
        case "arcana":
            return "var(--arcana-color)";
        default: //momentum
            return "var(--momentum-color)";
    }
}

function getStatChanges() {
    let statsPerSecond = {};

    data.actionNames.forEach(actionVar => {
        let actionObj = data.actions[actionVar];

        // Calculate levels per second
        let completesPerSecond = 0;
        if(actionObj.unlocked && (actionObj.maxLevel < 0 || (actionObj.level < actionObj.maxLevel))) {
            completesPerSecond = actionProgressRate(actionObj) * ticksPerSecond / actionObj.progressMax;
        }
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
