let attTree = {};

function createAndLinkNewAttribute(attCategory, attVar) {
    if(!attTree[attCategory]) {
        attTree[attCategory] = [];
    }
    attTree[attCategory].push(attVar);

    if(!data.atts[attVar]) {
        data.atts[attVar] = {};
    }

    let attObj = data.atts[attVar];
    attObj.attVar = attVar;
    attObj.attCategory = attCategory;
    attObj.attUpgradeMult = 1;
    attObj.linkedActionExpAtts = [];
    attObj.linkedActionEfficiencyAtts = [];
    attObj.linkedActionOnLevelAtts = [];
    attObj.attBase = 0; //for upgrades
    attObj.attBase2 = 0; //for GP

    attsSetBaseVariables(attObj);
    attObj.unlocked = false;
}

function attsSetBaseVariables(attObj) {
    attObj.num = attObj.attBase + attObj.attBase2;
    recalcAttMult(attObj.attVar);
}

//happens when the number/mult changes
function recalcAttMult(attVar) {
    let attObj = data.atts[attVar];
    if(attVar === "legacy") {
        attObj.attMult = 1;
        return;
    }
    attObj.attMult = Math.pow(10, attObj.num/100) * attObj.attUpgradeMult;
}



function revealAttsOnAction(actionObj) {
    for(let onLevelAtt of actionObj.onLevelAtts) {
        revealAtt(onLevelAtt[0]);
    }
}

function revealAtt(attVar) {
    // console.log(attVar);
    let attObj = data.atts[attVar];
    attObj.unlocked = true; //sets the side menu

    for (let actionVar of attObj.linkedActionExpAtts) {
        views.updateVal(`${actionVar}${attVar}OutsideContainerexp`, "", "style.display");
        views.updateVal(`${actionVar}${attVar}InsideContainerexp`, "", "style.display");
        views.updateVal(`${actionVar}AttExpContainer`, "", "style.display");
    }
    for (let actionVar of attObj.linkedActionEfficiencyAtts) {
        views.updateVal(`${actionVar}${attVar}OutsideContainereff`, "", "style.display");
        let dataObj = actionData[actionVar];
        let hasPositiveSpeedMults = false;
        for(let efficiencyAtt of dataObj.efficiencyAtts) {
            if(efficiencyAtt[0] === attVar) {
                if(efficiencyAtt[1] > 0) {
                    hasPositiveSpeedMults = true;
                    views.updateVal(`${actionVar}${attVar}InsideContainerSpeed1`, "", "style.display");
                } else if(efficiencyAtt[1] === 0) {
                    views.updateVal(`${actionVar}${attVar}InsideContainerSpeed2`, "", "style.display");
                }
                break;
            }
        }
        views.updateVal(`${actionVar}AttEfficiencyContainer`, "", "style.display");
        if(hasPositiveSpeedMults) {
            views.updateVal(`${actionVar}AttOvercapContainer`, data.upgrades.higherSpeedCaps.upgradePower > 0 ? "" : "none", "style.display");
            views.updateVal(`${actionVar}AttOvercapContainer2`, data.upgrades.higherSpeedCaps.upgradePower > 0 ? "" : "none", "style.display");
        }
    }
    for(let actionVar of attObj.linkedActionOnLevelAtts) {
        views.updateVal(`${actionVar}AttOnLevelContainer`, "", "style.display");
    }

    showAttColors(attVar);

    for (let attCategory in attTree) {
        if (attTree[attCategory].includes(attVar)) {
            views.updateVal(`${attCategory}CategoryContainer`, "", "style.display");
        }
    }
}

function addLegacy(amount) {
    let roomToHighest = Math.max(0, data.highestLegacy - data.legacy);
    let amountToTriple = Math.min(amount, roomToHighest / 3);
    let remainingAmount = amount - amountToTriple;
    let gain = (amountToTriple * 3) + remainingAmount;
    data.legacy += gain;
}

function statAddAmount(attVar, amount) {
    let attObj = data.atts[attVar];
    if(attVar === "legacy") {
        if(data.gameState === "KTL") {
            amount *= data.legacyMultKTL;
        } else {
            amount *= Math.pow(1.2, data.upgrades.extraBrythalLegacy.upgradePower)
            if(data.upgrades.feelTheDefeats.upgradePower > 0) {
                amount *= data.atts.resonance.attMult;
            }
        }
        amount *= Math.pow(1.1, data.upgrades.extraLegacy.upgradePower);
        amount *= Math.pow(1.5, data.shopUpgrades.extraLegacy.upgradePower);
        amount *= (data.shopUpgrades.currencyGainPotion.upgradePower > 0 ? 2 : 1)
        amount *= (data.upgrades.makeADeeperImpact.upgradePower===1?3:1);
        addLegacy(amount) //x3 up to prev highest
        data.actions.echoKindle.resource = data.legacy;
        if(data.legacy > data.highestLegacy) {
            data.highestLegacy = data.legacy;
        }
    }
    if(!attObj) {
        console.log("Tried to add to a stat that doesn't exist: " + attVar);
    }
    attObj.num += amount;
    recalcAttMult(attVar);
    let changedActions = []
    attObj.linkedActionExpAtts.forEach(function (actionVar) {
        calcStatMult(actionVar);
        changedActions.push(actionVar);
    })
    attObj.linkedActionEfficiencyAtts.forEach(function (actionVar) {
        calcAttExpertise(actionVar);
        changedActions.push(actionVar);
    })

    //update the actions that had their stats changed
    for(let actionVar of changedActions) {
        let actionObj = actionData[actionVar];
        if(actionObj.updateMults) {
            actionObj.updateMults();
        }
    }
}

function actionUpdateAllStatMults() {
    for(let actionVar in data.actions) {
        // let actionObj = data.actions[actionVar];
        calcStatMult(actionVar);
        calcAttExpertise(actionVar);
    }
}



function calcStatMult(actionVar) {
    let actionObj = data.actions[actionVar];
    let dataObj = actionData[actionVar];

    actionObj.expToLevelMult = 1;
    actionObj.progressMaxMult = 1;
    let totalEffect = 1;
    dataObj.expAtts.forEach(function(expStat) {
        let name = expStat[0];
        let ratio = expStat[1];
        if(!data.atts[name]) {
            console.log("need to instantiate " + name);
            return;
        }

        let effect = Math.pow(10, data.atts[name].num * ratio/100) * data.atts[name].attUpgradeMult;
        actionObj[name+"AttExpMult"] = effect;
        totalEffect *= effect;
    })
    actionObj.attReductionEffect = totalEffect;
    if(dataObj.isGenerator) {
        actionObj.expToLevelMult = 1/totalEffect;
        actionObj.expToLevel = actionObj.expToLevelBase * actionObj.expToLevelMult;
    } else {
        actionObj.progressMaxMult = 1/totalEffect;
        actionObj.progressMax = actionObj.progressMaxBase * actionObj.progressMaxMult * calcInstabilityEffect(actionObj.instability);
    }
    actionObj.actionPower = actionObj.actionPowerBase * actionObj.actionPowerMult * (actionObj.efficiency/100);
}
