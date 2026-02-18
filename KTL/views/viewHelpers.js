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
    if(attVar === "hope") {
        return "var(--hope-color)"
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


function gameStateMatches(dataObj) {
    return (data.gameState === "default" && !dataObj.isKTL) || (data.gameState==="KTL" && dataObj.isKTL);
}

function getResourceColor(actionVar) {
    let dataObj = actionData[actionVar]
    if(!dataObj.resourceName) {
        return "var(--momentum-color)";
    }
    return `var(--${dataObj.resourceName}-color)`;
}

function getResourceColorDim(actionVar) {
    let dataObj = actionData[actionVar]
    if(!dataObj.resourceName) {
        return "var(--momentum-color-dim)";
    }
    return `var(--${dataObj.resourceName}-color-dim)`;
}
