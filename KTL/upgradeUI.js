
function sortAmuletCards(container) {
    const cards = Array.from(container.children);

    cards.sort((a, b) => {
        const orderA = parseFloat(a.dataset.sortOrder);
        const orderB = parseFloat(b.dataset.sortOrder);
        return orderA - orderB;
    });

    cards.forEach((card, index) => {
        card.style.order = index;
    });
}
function resetCardOrder(container) {
    const cards = Array.from(container.children);
    cards.forEach(card => {
        card.style.order = "";
    });
}
function toggleSortByCost() {
    data.gameSettings.sortByCost = document.getElementById("sortByCost").checked;
    if (data.gameSettings.sortByCost) {
        sortAmuletCards(document.getElementById("amuletUpgrades_unique"));
        sortAmuletCards(document.getElementById("amuletUpgrades_mult"));
        sortAmuletCards(document.getElementById("amuletUpgrades_attribute"));
        sortAmuletCards(document.getElementById("amuletUpgrades_actions"));
        sortAmuletCards(document.getElementById("amuletUpgrades_lich"));
        sortAmuletCards(document.getElementById("amuletUpgrades_genesis"));
    } else {
        resetCardOrder(document.getElementById("amuletUpgrades_unique"));
        resetCardOrder(document.getElementById("amuletUpgrades_mult"));
        resetCardOrder(document.getElementById("amuletUpgrades_attribute"));
        resetCardOrder(document.getElementById("amuletUpgrades_actions"));
        resetCardOrder(document.getElementById("amuletUpgrades_lich"));
        resetCardOrder(document.getElementById("amuletUpgrades_genesis"));
    }
}

function initializeAmuletCards() {
    const upgradeContainerUnique = document.getElementById("amuletUpgrades_unique");
    const upgradeContainerMult = document.getElementById("amuletUpgrades_mult");
    const upgradeContainerAttribute = document.getElementById("amuletUpgrades_attribute");
    const upgradeContainerActions = document.getElementById("amuletUpgrades_actions");
    const lichContainerActions = document.getElementById("amuletUpgrades_lich");
    const genesisContainerActions = document.getElementById("amuletUpgrades_genesis")
    upgradeContainerUnique.replaceChildren();
    upgradeContainerMult.replaceChildren();
    upgradeContainerAttribute.replaceChildren();
    upgradeContainerActions.replaceChildren();
    lichContainerActions.replaceChildren();
    genesisContainerActions.replaceChildren();

    for (const upgradeVar in data.upgrades) {
        const upgradeObj = data.upgrades[upgradeVar];
        const upgradeDataObj = upgradeData[upgradeVar];
        const cardId = `card_${upgradeVar}`;

        const cardElement = document.createElement('div');
        cardElement.id = cardId;

        const descriptionId = `description_${upgradeVar}`;
        const costId = `cost_${upgradeVar}`;
        const remainingId = `remaining_${upgradeVar}`;
        const buyButtonSectionId = `buyButtonSection_${upgradeVar}`;
        const costSectionId = `costSection_${upgradeVar}`;
        const remainingSectionId = `remainingSection_${upgradeVar}`;
        const maxLevelSectionId = `maxLevelSection_${upgradeVar}`;
        const boughtId = `bought_${upgradeVar}`
        const title = upgradeDataObj.title;

        queueCache(cardId, descriptionId, costId, remainingId, buyButtonSectionId, costSectionId, remainingSectionId, maxLevelSectionId, boughtId);

        const numBought = upgradeObj.upgradesBought;
        const remaining = upgradeObj.upgradesAvailable - numBought;
        const isFullyBought = remaining === 0;

        const increaseText = upgradeDataObj.additiveIncrease ? `(+${upgradeDataObj.costIncrease})` : `(x${upgradeDataObj.costIncrease})`;
        const costName = upgradeDataObj.type === "genesis" ? "GP" : (upgradeDataObj.type === "lich" ? "LC" : (upgradeDataObj.type === "actions" ? "AW" : "AC"));

        cardElement.innerHTML = `
            <div style="display:flex; flex-direction:column; height:100%;">
                <div style="font-size:16px; font-weight:bold; margin-bottom:10px; color:#ffffff;">${title}</div>
                <div style="display:flex; gap:10px; margin-bottom:15px; flex-grow:1;">
                    ${!upgradeDataObj.attribute ? "" : `<img id="${upgradeDataObj.attribute}DisplayContainer" src="img/${upgradeDataObj.attribute}.svg" alt="${upgradeDataObj.attribute}" style="width:50px; height:50px; background:var(--text-bright); border:1px solid black; flex-shrink:0;" />`}
                    <div id="${descriptionId}" style="font-size:14px; flex-grow:1;"></div>
                </div>
            </div>
            
            <div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div id="${costSectionId}" style="display:flex; align-items:baseline; ${isFullyBought ? 'visibility:hidden' : ''}">
                        <span style="font-size:14px; margin-right:8px;">cost:</span>
                        <span id="${costId}" style="font-size:24px; font-weight:bold; color:#ffffff;"></span>
                        <span style="font-size:14px; color:#a0a0a0; margin-left:8px;">${increaseText}</span>
                    </div>
                    
                    <div id="${buyButtonSectionId}" style="display:${isFullyBought ? 'none' : 'flex'}; flex-direction:column; gap:6px;">
                        <button style="background-color:#008c33; color:white; border:none; border-radius:5px; padding:6px 16px; font-weight:bold; cursor:pointer;" onClick="buyUpgrade('${upgradeVar}')">Buy</button>
                        ${upgradeDataObj.sellable ? `<button style="background-color:#cc0000; color:white; border:none; border-radius:5px; padding:6px 16px; font-weight:bold; cursor:pointer;" onClick="sellUpgrade('${upgradeVar}')">Sell</button>` : ''}
                    </div>
                    
                    <div id="${maxLevelSectionId}" style="display:${isFullyBought ? 'block' : 'none'};">
                        <span style="font-size:14px; color:#c3cd00; font-weight:bold;">MAX LEVEL</span>
                    </div>
                </div>
                
                <div id="${remainingSectionId}" style="display:${isFullyBought ? 'none' : 'flex'}; justify-content:space-between; align-items:center; margin-top:8px; font-size:14px; color:#a0a0a0;">
                    <span>Bought: <span id="${boughtId}">${numBought}</span></span>
                    <span>Remaining: <span id="${remainingId}"></span></span>
                </div>
            </div>`;

        const cost = calcUpgradeCost(upgradeVar, numBought);
        Object.assign(cardElement.style, {
            backgroundColor: '#2c2c3e', borderRadius: '8px', padding: '12px', width: '280px',
            display: upgradeObj.visible ? 'flex' : 'none', flexDirection: 'column',
            justifyContent: 'space-between', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', color: '#e0e0e0',
            border: `2px solid ${isFullyBought ? '#c3cd00' : (canAffordUpgrade(upgradeDataObj.type, cost) ? '#00cd41' : '#ff0000')}`
        });

        cardElement.querySelector(`#${descriptionId}`).innerHTML = !upgradeDataObj.attribute ? upgradeDataObj.customInfo(numBought) : attributeUpgradeInfo(upgradeDataObj.attribute, numBought, upgradeDataObj.addAmount);
        if (!isFullyBought) {
            cardElement.querySelector(`#${costId}`).textContent = `${cost} ${costName}`;
            cardElement.querySelector(`#${remainingId}`).textContent = remaining+"";
        }

        cardElement.dataset.sortOrder = isFullyBought ? Infinity : cost;

        const borderColor = isFullyBought ? '#c3cd00' : (canAffordUpgrade(upgradeDataObj.type, cost) ? '#00cd41' : '#ff0000');
        cardElement.style.border = `2px solid ${borderColor}`;

        if(upgradeDataObj.type === "unique") {
            upgradeContainerUnique.appendChild(cardElement);
        } else if(upgradeDataObj.type === "mult") {
            upgradeContainerMult.appendChild(cardElement);
        } else if(upgradeDataObj.type === "attribute") {
            upgradeContainerAttribute.appendChild(cardElement);
        } else if(upgradeDataObj.type === "actions") {
            upgradeContainerActions.appendChild(cardElement);
        } else if(upgradeDataObj.type === "lich") {
            lichContainerActions.appendChild(cardElement);
        } else if(upgradeDataObj.type === "genesis") {
            genesisContainerActions.appendChild(cardElement);
        }
    }
}

function updateAmuletCardUI(upgradeVar) {
    const upgradeObj = data.upgrades[upgradeVar];
    const upgradeDataObj = upgradeData[upgradeVar];

    const numBought = upgradeObj.upgradesBought;
    const remaining = upgradeObj.upgradesAvailable - numBought;
    const isFullyBought = remaining === 0;

    const cardId = `card_${upgradeVar}`;
    const descriptionId = `description_${upgradeVar}`;
    const costId = `cost_${upgradeVar}`;
    const remainingId = `remaining_${upgradeVar}`;
    const buyButtonSectionId = `buyButtonSection_${upgradeVar}`;
    const costSectionId = `costSection_${upgradeVar}`;
    const remainingSectionId = `remainingSection_${upgradeVar}`;
    const maxLevelSectionId = `maxLevelSection_${upgradeVar}`;
    const boughtId = `bought_${upgradeVar}`

    const cardElement = document.getElementById(cardId);
    if (!cardElement) return;

    let text = !upgradeDataObj.attribute ? upgradeDataObj.customInfo(numBought) :
        attributeUpgradeInfo(upgradeDataObj.attribute, numBought, upgradeDataObj.addAmount);
    views.updateVal(descriptionId, text, 'innerHTML');

    const cost = calcUpgradeCost(upgradeVar, numBought);
    cardElement.dataset.sortOrder = isFullyBought ? Infinity : cost;

    if (isFullyBought) {
        views.updateVal(costSectionId, 'hidden', 'style.visibility');
        views.updateVal(buyButtonSectionId, 'none', 'style.display');
        views.updateVal(remainingSectionId, 'none', 'style.display');
        views.updateVal(maxLevelSectionId, 'block', 'style.display');
        views.updateVal(cardId, '#c3cd00', 'style.borderColor');
    } else {
        views.updateVal(costSectionId, 'visible', 'style.visibility');
        views.updateVal(buyButtonSectionId, 'block', 'style.display');
        views.updateVal(remainingSectionId, 'flex', 'style.display');
        views.updateVal(maxLevelSectionId, 'none', 'style.display');

        const costName = upgradeDataObj.type === "genesis" ? "GP" : (upgradeDataObj.type === "lich" ? "LC" : (upgradeDataObj.type === "actions" ? "AW" : "AC"));
        let costText = calcUpgradeCost(upgradeVar, numBought) + " " + costName;
        views.updateVal(costId, `${costText}`, 'textContent');
        views.updateVal(remainingId, remaining, 'textContent');
        views.updateVal(boughtId, numBought, 'textContent');
    }

    updateCardAffordabilityBorders();
}

function handleCurrency(type, amount, isDeducting) {
    const currencyMap = { actions: 'ancientWhisper', lich: 'lichCoins', default: 'ancientCoin', genesis: 'genesisPoints' };
    const currencyKey = currencyMap[type] || currencyMap.default;

    if (isDeducting) {
        if (data[currencyKey] < amount) return false;
        data[currencyKey] -= amount;
    } else {
        data[currencyKey] += amount;
    }
    return true;
}


function refreshUpgradeVisibility() {
    data.gameSettings.showCompletedToggle = document.getElementById("showCompleteUpgrades").checked;
    data.gameSettings.showUnaffordable = document.getElementById("showUnaffordableUpgrades").checked;

    for (let upgradeVar in data.upgrades) {
        let upgradeObj = data.upgrades[upgradeVar];
        let upgradeDataObj = upgradeData[upgradeVar];
        let isNotMaxLevel = data.gameSettings.showCompletedToggle || !upgradeObj.isFullyBought;
        let cost = calcUpgradeCost(upgradeVar, upgradeObj.upgradesBought);
        let costLower = upgradeDataObj.type === "actions" ? (cost <= data.ancientWhisper) : (cost <= data.ancientCoin);
        let isAffordable = data.gameSettings.showUnaffordable || upgradeObj.isFullyBought || costLower;
        let isShown = isNotMaxLevel && isAffordable;
        let displayStyle = 'none';

        if (upgradeObj.visible && isShown) {
            displayStyle = 'flex';
        }

        views.updateVal('card_' + upgradeVar, displayStyle, 'style.display');
    }
}


function updateCardAffordabilityBorders() {
    for (const upgradeVar in data.upgrades) {
        const upgradeObj = data.upgrades[upgradeVar];
        const upgradeDataObj = upgradeData[upgradeVar];
        if (!upgradeObj.isFullyBought) {
            const cost = calcUpgradeCost(upgradeVar, upgradeObj.upgradesBought);

            const cardId = `card_${upgradeVar}`;
            const borderColor = canAffordUpgrade(upgradeDataObj.type, cost) ? '#00cd41' : '#ff0000';
            views.updateVal(cardId, borderColor, 'style.borderColor');
        }
    }
}
