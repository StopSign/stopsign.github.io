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
    if(!actionObj.resourceName) {
        return "var(--momentum-color)";
    }
    return `var(--${actionObj.resourceName}-color)`;
}

function getResourceColorDim(actionObj) {
    if(!actionObj.resourceName) {
        return "var(--momentum-color-dim)";
    }
    return `var(--${actionObj.resourceName}-color-dim)`;
}
