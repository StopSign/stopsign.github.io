
//vars that you would pull from the save
function upgradesSetBaseVariables(upgradeObj, dataObj) {
    upgradeObj.upgradePower = dataObj.upgradePower ?? 0; //for controlling the effect of the upgrade
    upgradeObj.initialCost = dataObj.initialCost;
    upgradeObj.costIncrease = dataObj.costIncrease;
    upgradeObj.upgradesAvailable = dataObj.upgradesAvailable;
    upgradeObj.upgradesBought = dataObj.upgradesBought ?? 0;
    upgradeObj.increaseRatio = dataObj.increaseRatio;

    upgradeObj.isFullyBought = false;
    upgradeObj.visible = !!dataObj.visible;
}


function createUpgrades(skipUnique) {
    //Loop through upgradeData
    //modify/add base variables as needed
    //add it to data.upgrades
    for(let upgradeVar in upgradeData) {
        let upgradeDataObj = upgradeData[upgradeVar];
        if((upgradeDataObj.type === "unique" || upgradeDataObj.type === "lich" || upgradeDataObj.type === "genesis") && skipUnique) {
            continue;
        }
        data.upgrades[upgradeVar] = {};
        let upgradeObj = data.upgrades[upgradeVar];

        upgradeDataObj.creationVersion = upgradeDataObj.creationVersion ?? 0;
        upgradeDataObj.title = upgradeDataObj.title || decamelizeWithSpace(upgradeVar);

        upgradesSetBaseVariables(upgradeObj, upgradeDataObj);
    }
}

function clearUpgradesForGenesis() {
    for(let upgradeVar in upgradeData) {
        let upgradeDataObj = upgradeData[upgradeVar];
        if(upgradeDataObj.type === "genesis" || upgradeDataObj.isAutomation) {
            continue;
        }
        data.upgrades[upgradeVar] = {};
        let upgradeObj = data.upgrades[upgradeVar];

        upgradeDataObj.creationVersion = upgradeDataObj.creationVersion ?? 0;
        upgradeDataObj.title = upgradeDataObj.title || decamelizeWithSpace(upgradeVar);

        upgradesSetBaseVariables(upgradeObj, upgradeDataObj);
    }
}

function calcUpgradeCost(upgradeVar, num) {
    const upgradeObj = data.upgrades[upgradeVar];
    const upgradeDataObj = upgradeData[upgradeVar];
    if (num === 0) return upgradeObj.initialCost;

    if (upgradeDataObj.additiveIncrease) {
        return upgradeObj.initialCost + (upgradeObj.costIncrease * num);
    }
    return Math.floor(upgradeObj.initialCost * Math.pow(upgradeObj.costIncrease, num));
}


function buyUpgrade(upgradeVar) {
    const upgradeObj = data.upgrades[upgradeVar];
    const upgradeDataObj = upgradeData[upgradeVar];
    const levelToBuy = upgradeObj.upgradesBought;

    if (upgradeObj.upgradesBought >= upgradeObj.upgradesAvailable || !upgradeObj.visible) return;

    const cost = calcUpgradeCost(upgradeVar, levelToBuy);

    if (!handleCurrency(upgradeDataObj.type, cost, true)) return;

    upgradeObj.upgradesBought++;
    upgradeObj.upgradePower++;

    if (upgradeDataObj.onBuy) {
        upgradeDataObj.onBuy(upgradeObj.upgradePower);
    }
    if(upgradeDataObj.attribute) {
        attributeUpgradeOnBuy(upgradeDataObj.attribute, upgradeObj.upgradesBought, upgradeDataObj.addAmount);
    }

    upgradeObj.isFullyBought = (upgradeObj.upgradesAvailable - upgradeObj.upgradesBought) === 0;

    finalizeTransaction(upgradeVar, upgradeObj);
}

function sellUpgrade(upgradeVar) {
    const upgradeObj = data.upgrades[upgradeVar];
    const obj = upgradeData[upgradeVar];

    if (upgradeObj.upgradesBought <= 0 || !upgradeObj.visible || !obj.sellable) return;

    const refundAmount = calcUpgradeCost(upgradeVar, upgradeObj.upgradesBought - 1);

    handleCurrency(obj.type, refundAmount, false);

    upgradeObj.upgradesBought--;
    upgradeObj.upgradePower--;
    upgradeObj.isFullyBought = false;

    if (obj.onSell) {
        obj.onSell(upgradeObj.upgradePower);
    }

    finalizeTransaction(upgradeVar, upgradeObj);
}

function finalizeTransaction(upgradeVar, upgradeObj) {
    const cardElement = document.getElementById(`card_${upgradeVar}`);
    if (cardElement) {
        cardElement.dataset.sortOrder = upgradeObj.isFullyBought ? Infinity : calcUpgradeCost(upgradeVar, upgradeObj.upgradesBought);
    }

    updateAmuletCardUI(upgradeVar);
    refreshUpgradeVisibility();
    toggleSortByCost();
}

function attributeUpgradeInfo(attVar, upgradeNum, addAmount) {
    const attributeName = capitalizeFirst(attVar);
    // const possessiveName = attributeName.endsWith('s')
    //     ? `${attributeName}'`
    //     : `${attributeName}'s`;
    if(addAmount < 0) {
        return `Add ${addAmount} to ${attributeName} that keeps through Amulet.<br>Current Amount: ${upgradeNum*addAmount}`
    }

    return `Add +${addAmount} to ${attributeName} that keeps through Amulet.<br>Current Amount: +${upgradeNum*addAmount}`
}

function attributeUpgradeOnBuy(attVar, upgradeNum, addAmount) {
    data.atts[attVar].attBase += addAmount;
    recalcAttMult(attVar);
}

function canAffordUpgrade(type, cost) {
    if(type === "lich") {
        return data.lichCoins >= cost;
    } else if(type === "actions") {
        return data.ancientWhisper >= cost;
    }
    return data.ancientCoin >= cost;
}

function calcTotalSpentOnUpgrade(initialCost, costIncrease, upgradesBought, additiveIncrease) {
    let total = 0;
    for (let i = 0; i < upgradesBought; i++) {
        if (additiveIncrease) {
            total += initialCost + (costIncrease * i);
        } else {
            total += Math.floor(initialCost * Math.pow(costIncrease, i));
        }
    }
    return total;
}

function revealUpgrade(upgradeVar) {
    let upgradeObj = data.upgrades[upgradeVar];
    if(upgradeObj.visible) {
        return;
    }
    upgradeObj.visible = true;
    views.updateVal(`card_${upgradeVar}`, "flex", "style.display");

    addLogMessage(upgradeVar, "purchaseUpgrade")
}