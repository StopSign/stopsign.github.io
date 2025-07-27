//Through unlock/unveil/click
function showAttColors(attVar) {
    let color = getAttColor(attVar);
    views.updateVal(`${attVar}AttContainer`, "2px solid transparent", "style.border");
    views.updateVal(`${attVar}Name`, color, "style.color");
    views.updateVal(`${attVar}DisplayContainer`, color, "style.backgroundColor");
}

function getAttColor(attVar) {
    if(attVar === "legacy") {
        return "var(--legacy-color)"
    }
    if(attVar === "doom") {
        return "var(--doom-color)"
    }
    const stat = data.atts[attVar];

    const attAddedTo = stat.linkedActionOnLevelAtts.some(actionVar =>
        data.actions[actionVar].unlocked || globalVisible
    );

    const effAttUsed = stat.linkedActionEfficiencyAtts.some(actionVar =>
        data.actions[actionVar].unlocked || globalVisible
    );

    const expAttUsed = stat.linkedActionExpAtts.some(actionVar =>
        data.actions[actionVar].unlocked || globalVisible
    );

    if (attAddedTo && !(expAttUsed || effAttUsed)) return "var(--attribute-add-color)";
    if (attAddedTo && (expAttUsed || effAttUsed)) return "var(--text-primary)";
    if (expAttUsed) return "var(--attribute-use-exp-color)";
    if (effAttUsed) return "var(--attribute-use-eff-color)";
    return "var(--error-color)";
}


function gameStateMatches(actionObj) {
    return (data.gameState === "default" && !actionObj.isKTL) || (data.gameState==="KTL" && actionObj.isKTL);
}

function getResourceColor(actionObj) {
    // switch (actionObj.resourceName) {
    //     case "mana":
    //         return "var(--mana-color)";
    //     case "gold":
    //         return "var(--gold-color)";
    //     case "conversations":
    //         return "var(--conversations-color)";
    //     case "legacy":
    //         return "var(--legacy-color)";
    //     case "fear":
    //         return "var(--fear-color)";
    //     case "arcana":
    //         return "var(--arcana-color)";
    //     default: //momentum
    //         return "var(--momentum-color)";
    // }
    if(!actionObj.resourceName) {
        return "var(--momentum-color)";
    }
    return `var(--${actionObj.resourceName}-color)`;
}

function getResourceColorDim(actionObj) {
    // switch (actionObj.resourceName) {
    //     case "mana":
    //         return "var(--mana-color-dim)";
    //     case "gold":
    //         return "var(--gold-color-dim)";
    //     case "conversations":
    //         return "var(--conversations-color-dim)";
    //     case "legacy":
    //         return "var(--legacy-color-dim)";
    //     case "fear":
    //         return "var(--fear-color-dim)";
    //     case "arcana":
    //         return "var(--arcana-color-dim)";
    //     default: //momentum
    //         return "var(--momentum-color-dim)";
    // }
    if(!actionObj.resourceName) {
        return "var(--momentum-color-dim)";
    }
    return `var(--${actionObj.resourceName}-color-dim)`;
}

//Broken, and not very useful in the first place.
function getStatChanges() {
    let attsPerSecond = {};

    for(let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];

        // Calculate levels per second
        let completesPerSecond = 0;
        if(actionObj.unlocked && (actionObj.maxLevel !== undefined || (actionObj.level < actionObj.maxLevel))) {
            completesPerSecond = actionProgressRate(actionObj) * data.gameSettings.ticksPerSecond / actionObj.progressMax;
        }
        let levelsPerSecond = completesPerSecond * actionObj.expToAdd / actionObj.expToLevel;

        // Update attsPerSecond based on the action's efficiencyAtts
        actionObj.efficiencyAtts.forEach(([stat, amount]) => {
            if (!attsPerSecond.hasOwnProperty(stat)) { // Auto-initialize
                attsPerSecond[stat] = 0;
            }
            attsPerSecond[stat] += amount * levelsPerSecond;
        });
    }
    return attsPerSecond;
}
