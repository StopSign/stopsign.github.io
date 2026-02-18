

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
        if((upgradeDataObj.type === "unique" || upgradeDataObj.type === "lich") && skipUnique) {
            continue;
        }
        data.upgrades[upgradeVar] = {};
        let upgradeObj = data.upgrades[upgradeVar];

        upgradeDataObj.creationVersion = upgradeDataObj.creationVersion ?? 0;
        upgradeDataObj.title = upgradeDataObj.title || decamelizeWithSpace(upgradeVar);

        upgradesSetBaseVariables(upgradeObj, upgradeDataObj);
    }
}


function calcUpgradeCost(upgrade, num) {
    if(num === 0) {
        return upgrade.initialCost;
    }
    return Math.floor(upgrade.initialCost * Math.pow(upgrade.costIncrease, num));
}


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
    } else {
        resetCardOrder(document.getElementById("amuletUpgrades_unique"));
        resetCardOrder(document.getElementById("amuletUpgrades_mult"));
        resetCardOrder(document.getElementById("amuletUpgrades_attribute"));
        resetCardOrder(document.getElementById("amuletUpgrades_actions"));
        resetCardOrder(document.getElementById("amuletUpgrades_lich"));
    }
}

function initializeAmuletCards() {
    const upgradeContainerUnique = document.getElementById("amuletUpgrades_unique");
    const upgradeContainerMult = document.getElementById("amuletUpgrades_mult");
    const upgradeContainerAttribute = document.getElementById("amuletUpgrades_attribute");
    const upgradeContainerActions = document.getElementById("amuletUpgrades_actions");
    const lichContainerActions = document.getElementById("amuletUpgrades_lich");
    upgradeContainerUnique.replaceChildren();
    upgradeContainerMult.replaceChildren();
    upgradeContainerAttribute.replaceChildren();
    upgradeContainerActions.replaceChildren();
    lichContainerActions.replaceChildren();

    for (const upgradeVar in data.upgrades) {
        const upgrade = data.upgrades[upgradeVar];
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
        const title = upgradeDataObj.title;

        cardElement.innerHTML = `
            <div>
                <div style="font-size:16px;font-weight:bold;margin-bottom:10px;color:#ffffff;">${title}</div>
                ${!upgradeDataObj.attribute ? "" : `<img id="${upgradeDataObj.attribute}DisplayContainer" src="img/${upgradeDataObj.attribute}.svg" alt="${upgradeDataObj.attribute}" 
                    style="margin:1px;width:50px;height:50px;vertical-align:top;background:var(--text-bright);border:1px solid black;display:inline-block;" />`}
                <div id="${descriptionId}" style="display:inline-block;font-size:14px;flex-grow:1;margin-bottom:15px;${!upgradeDataObj.attribute?"":"width:70%"}"></div>
            </div>
            <div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div id="${costSectionId}" style="display:flex;align-items:baseline;">
                        <span style="font-size:14px;margin-right:8px;">cost:</span>
                        <span id="${costId}" style="font-size:24px;font-weight:bold;color:#ffffff;"></span>
                        <span style="font-size:14px;color:#a0a0a0;margin-left:8px;">(x${upgradeDataObj.costIncrease})</span>
                    </div>
                    <div id="${buyButtonSectionId}">
                        <button style="background-color:#008c33;color:white;border:none;border-radius:5px;padding:8px 16px;font-weight:bold;cursor:pointer;" onClick="buyUpgrade('${upgradeVar}')">Buy</button>
                    </div>
                    <div id="${maxLevelSectionId}">
                        <span style="font-size:14px;color:#c3cd00;font-weight:bold;">MAX LEVEL</span>
                    </div>
                </div>
                <div id="${remainingSectionId}" style="justify-content:flex-end;align-items:center;margin-top:4px;font-size:14px;color:#a0a0a0;">
                    Remaining: <span id="${remainingId}"></span>
                </div>
            </div>`;

        queueCache(cardId, descriptionId, costId, remainingId, buyButtonSectionId, costSectionId, remainingSectionId, maxLevelSectionId);

        const numBought = upgrade.upgradesBought;
        const remaining = upgrade.upgradesAvailable - numBought;
        const isFullyBought = remaining === 0;

        cardElement.style.backgroundColor = '#2c2c3e';
        cardElement.style.borderRadius = '8px';
        cardElement.style.padding = '12px';
        cardElement.style.width = '280px';
        cardElement.style.display = upgrade.visible ? 'flex' : 'none';
        cardElement.style.flexDirection = 'column';
        cardElement.style.justifyContent = 'space-between';
        cardElement.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        cardElement.style.color = '#e0e0e0';

        const cost = calcUpgradeCost(upgrade, numBought);
        cardElement.dataset.sortOrder = isFullyBought ? Infinity : cost;

        const borderColor = isFullyBought ? '#c3cd00' : (canAffordUpgrade(upgradeDataObj.type, cost) ? '#00cd41' : '#ff0000');
        cardElement.style.border = `2px solid ${borderColor}`;

        let text = !upgradeDataObj.attribute ? upgradeDataObj.customInfo(numBought) :
            attributeUpgradeInfo(upgradeDataObj.attribute, numBought, upgradeDataObj.addAmount);
        cardElement.querySelector(`#${descriptionId}`).innerHTML = text;

        if (isFullyBought) {
            cardElement.querySelector(`#${costSectionId}`).style.visibility = 'hidden';
            cardElement.querySelector(`#${buyButtonSectionId}`).style.display = 'none';
            cardElement.querySelector(`#${remainingSectionId}`).style.display = 'none';
            cardElement.querySelector(`#${maxLevelSectionId}`).style.display = 'block';
        } else {
            cardElement.querySelector(`#${costSectionId}`).style.visibility = 'visible';
            cardElement.querySelector(`#${buyButtonSectionId}`).style.display = 'block';
            cardElement.querySelector(`#${remainingSectionId}`).style.display = 'flex';
            cardElement.querySelector(`#${maxLevelSectionId}`).style.display = 'none';
            let costName = upgradeDataObj.type === "lich"?"LC":(upgradeDataObj.type==="actions"?"AW":"AC")
            cardElement.querySelector(`#${costId}`).textContent = `${cost} ${costName}`;
            cardElement.querySelector(`#${remainingId}`).textContent = remaining+"";
        }

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
        }
    }
}

function updateAmuletCardUI(upgradeVar) {
    const upgrade = data.upgrades[upgradeVar];
    const upgradeDataObj = upgradeData[upgradeVar];

    const numBought = upgrade.upgradesBought;
    const remaining = upgrade.upgradesAvailable - numBought;
    const isFullyBought = remaining === 0;

    const cardId = `card_${upgradeVar}`;
    const descriptionId = `description_${upgradeVar}`;
    const costId = `cost_${upgradeVar}`;
    const remainingId = `remaining_${upgradeVar}`;
    const buyButtonSectionId = `buyButtonSection_${upgradeVar}`;
    const costSectionId = `costSection_${upgradeVar}`;
    const remainingSectionId = `remainingSection_${upgradeVar}`;
    const maxLevelSectionId = `maxLevelSection_${upgradeVar}`;

    const cardElement = document.getElementById(cardId);
    if (!cardElement) return;

    let text = !upgradeDataObj.attribute ? upgradeDataObj.customInfo(numBought) :
        attributeUpgradeInfo(upgradeDataObj.attribute, numBought, upgradeDataObj.addAmount);
    views.updateVal(descriptionId, text, 'innerHTML');

    const cost = calcUpgradeCost(upgrade, numBought);
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

        let costText = calcUpgradeCost(upgrade, numBought) + (upgradeDataObj.type==="actions"?" AW":" AC");
        views.updateVal(costId, `${costText}`, 'textContent');
        views.updateVal(remainingId, remaining, 'textContent');
    }

    updateCardAffordabilityBorders();
}

function buyUpgrade(upgradeVar) {
    const upgrade = data.upgrades[upgradeVar];
    const upgradeDataObj = upgradeData[upgradeVar];
    const levelToBuy = upgrade.upgradesBought;

    if (levelToBuy >= upgrade.upgradesAvailable) return;
    if(!upgrade.visible) return;

    const cost = calcUpgradeCost(upgrade, levelToBuy);
    let type = upgradeDataObj.type;
    if(type === "actions") {
        if (data.ancientWhisper < cost) return;
        data.ancientWhisper -= cost;
    } else if(type === "lich") {
        if (data.lichCoins < cost) return;
        data.lichCoins -= cost;
    } else {
        if (data.ancientCoin < cost) return;
        data.ancientCoin -= cost;
    }
    upgrade.upgradesBought++;
    upgrade.upgradePower++;

    if (upgradeDataObj.onBuy) {
        upgradeDataObj.onBuy(upgrade.upgradePower);
    }
    if(upgradeDataObj.attribute) {
        attributeUpgradeOnBuy(upgradeDataObj.attribute, upgrade.upgradesBought, upgradeDataObj.addAmount);
    }

    upgrade.isFullyBought = (upgrade.upgradesAvailable - upgrade.upgradesBought) === 0;

    const cardElement = document.getElementById(`card_${upgradeVar}`);
    if (cardElement) {
        if (upgrade.isFullyBought) {
            cardElement.dataset.sortOrder = Infinity;
        } else {
            cardElement.dataset.sortOrder = calcUpgradeCost(upgrade, upgrade.upgradesBought);
        }
    }

    updateAmuletCardUI(upgradeVar);
    refreshUpgradeVisibility();
    toggleSortByCost()
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

function refreshUpgradeVisibility() {
    data.gameSettings.showCompletedToggle = document.getElementById("showCompleteUpgrades").checked;
    data.gameSettings.showUnaffordable = document.getElementById("showUnaffordableUpgrades").checked;

    for (let upgradeVar in data.upgrades) {
        let upgrade = data.upgrades[upgradeVar];
        let upgradeDataObj = upgradeData[upgradeVar];
        let isNotMaxLevel = data.gameSettings.showCompletedToggle || !upgrade.isFullyBought;
        let cost = calcUpgradeCost(upgrade, upgrade.upgradesBought);
        let costLower = upgradeDataObj.type === "actions" ? (cost <= data.ancientWhisper) : (cost <= data.ancientCoin);
        let isAffordable = data.gameSettings.showUnaffordable || upgrade.isFullyBought || costLower;
        let isShown = isNotMaxLevel && isAffordable;
        let displayStyle = 'none';

        if (upgrade.visible && isShown) {
            displayStyle = 'flex';
        }

        views.updateVal('card_' + upgradeVar, displayStyle, 'style.display');
    }
}

function canAffordUpgrade(type, cost) {
    if(type === "lich") {
        return data.lichCoins >= cost;
    } else if(type === "actions") {
        return data.ancientWhisper >= cost;
    }
    return data.ancientCoin >= cost;
}

function updateCardAffordabilityBorders() {
    for (const upgradeVar in data.upgrades) {
        const upgrade = data.upgrades[upgradeVar];
        const upgradeDataObj = upgradeData[upgradeVar];
        if (!upgrade.isFullyBought) {
            const cost = calcUpgradeCost(upgrade, upgrade.upgradesBought);

            const cardId = `card_${upgradeVar}`;
            const borderColor = canAffordUpgrade(upgradeDataObj.type, cost) ? '#00cd41' : '#ff0000';
            views.updateVal(cardId, borderColor, 'style.borderColor');
        }
    }
}

function calcTotalSpentOnUpgrade(initialCost, costIncrease, upgradesBought) {
    let total = 0;
    let theCost = initialCost;
    for(let i = 0; i < upgradesBought; i++) {
        total += theCost
        theCost *= costIncrease;
    }
    return total;
}

let upgradeData = {
    stopLettingOpportunityWait: {
        initialCost:5, costIncrease:1, creationVersion: 6,
        upgradesAvailable: 1, type:"unique",
        visible: true,
        customInfo: function(num) {
            return `[Automation] When unlocking a new action, automatically sets the downstream sliders to the 
            newly unlocked action to 100%. This only fully works on previously unlocked actions.`;
        },
        onBuy: function(num) {
            for (let actionVar in data.actions) {
                let dataObj = actionData[actionVar];
                if(!dataObj.hasUpstream) {
                    continue;
                }
                setSliderUI(actionVar, "Automation", 100);
                views.updateVal(`${actionVar}_automationMenuButton`, dataObj.hasUpstream && dataObj.plane !== 2?"":"none", "style.display");
                views.updateVal(`${actionVar}_automationRevealContainer`, (dataObj.keepParentAutomation || dataObj.hasUpstream) && dataObj.plane !== 2?"":"none", "style.display");
            }
            if(num === 2) {
                revealUpgrade("temperMyDesires")
            }
        }
    },
    knowWhenToMoveOn: {
        initialCost:5, costIncrease:1, creationVersion: 6,
        upgradesAvailable:1, type:"unique",
        visible:true,
        customInfo: function(num) {
            return Raw.html`[Automation] When an action is at its max level and has no downstream actions with sliders, it 
                automatically set the flow rate leading to it to 0%. This will apply recursively.`
        },
        onBuy: function(num) {
            for (let actionVar in data.actions) {
                let dataObj = actionData[actionVar];
                if(!(dataObj.hasUpstream || dataObj.keepParentAutomation) || dataObj.maxLevel === undefined) {
                    continue;
                }
                views.updateVal(`${actionVar}_automationMenuButton`, actionData[actionVar].plane !== 2?"":"none", "style.display");
                views.updateVal(`${actionVar}_automationMaxLevelContainer`,  actionData[actionVar].plane !== 2?"":"none", "style.display");
            }
        }
    },
    temperMyDesires: {
        initialCost:100, costIncrease:1, creationVersion: 6,
        upgradesAvailable: 1, type:"unique",
        visible: false,
        customInfo: function(num) {
            return `[Automation] Gain a slider for setting a custom amount the action enables at, instead of always 100%.`
        },
        onBuy: function(num) {
            for (let actionVar in data.actions) {
                let dataObj = actionData[actionVar];
                if(!dataObj.hasUpstream) {
                    continue;
                }
                views.updateVal(`${actionVar}SliderContainerAutomation`, dataObj.hasUpstream && dataObj.plane !== 2 ? "":"none", "style.display");
            }
        }
    },
    shapeMyPath: {
        initialCost:10, costIncrease:1, creationVersion: 6,
        upgradesAvailable: 1, type:"unique",
        visible: false,
        customInfo: function(num) {
            return `[Automation] Gain the option to create custom automation triggers based on each action. The target actions that trigger these will display that they do under Info. Warning: it is possible to create useless triggers.`
        },
        onBuy: function(num) {
            for (let actionVar in data.actions) {
                let dataObj = actionData[actionVar];
                document.getElementById(`${actionVar}_addCustomTriggerButton`).style.display = "";
            }
        }
    },
    startALittleQuicker: {
        initialCost:20, costIncrease:1.5, creationVersion: 6,
        upgradesAvailable:5, type:"unique",
        visible:true,
        customInfo: function(num) {
            if(num === 0) {
                return `Overclock gains a flat +50 momentum per second.`
            }
            return `Overclock gains a flat +${50*Math.pow(4, num)} (currently ${50*Math.pow(4, num-1)}) momentum per second.`
        }
    },
    pickUpValuablePlants: {
        initialCost:30, costIncrease:1.5, creationVersion: 6,
        upgradesAvailable:5, type:"unique",
        visible:false,
        customInfo: function(num) {
            if(num === 0) {
                return `Make Money is revealed at the start, and Spend Money gains a flat +5 coins per second.`
            }
            return `Make Money is revealed at the start, and Spend Money gains a flat +${5*Math.pow(4, num)} (currently ${5*Math.pow(4, num-1)}) coins per second.`
        }
    },
    startCasualChats: {
        initialCost:50, costIncrease:1.5, creationVersion: 6,
        upgradesAvailable:5, type:"unique",
        visible:false,
        customInfo: function(num) {
            if(num === 0) {
                return `Socialize is revealed at the start, and Meet People gains a flat +1 conversations per second.`
            }
            return `Socialize is revealed at the start, and Meet People gains a flat +${Math.pow(2, num)} (currently ${Math.pow(2, num-1)}) conversations per second.`
        }
    },
    learnToFocusMore: {
        initialCost:10, costIncrease:10, creationVersion: 6,
        upgradesAvailable:2, type:"unique",
        visible:true,
        customInfo: function(num) {
            if(num === 0) {
                return `Increase the base focus rate (x2) over 10 minutes, to a maximum of x3. This keeps within a loop, but resets on amulet use.`
            }
            if(num === 1) {
                return `Increase the base focus rate (x2) over 10 minutes, to a maximum of x4 (currently x3). This keeps within a loop, but resets on amulet use.`
            }
            return `Increase the base focus rate (x2) over 10 minutes, to a maximum of x4. This keeps within a loop, but resets on amulet use.`
        },
        onBuy: function(num) {
            revealUpgrade('rememberWhatIFocusedOn')
        },
    },
    rememberWhatIFocusedOn: {
        initialCost:50, costIncrease:5, creationVersion: 6,
        upgradesAvailable:3, type:"unique",
        visible:false,
        customInfo: function(num) {
            if(num === 0) {
                return `Gain a permanent +(Hear About The Lich's Level)^2 % to all Focused rates, when you enter Northern Wastes. This effect works even when the bar is not focused. This effect caps at a x2 mult.`
            }
            if(num === 1) {
                return `You currently gain a permanent +(Hear About The Lich's Level)^2 % to all Focused rates, when you enter Northern Wastes. This effect works even when the bar is not focused. This effect will cap at a x3 mult (currently x2).`
            }
            if(num === 2) {
                return `You currently gain a permanent +(Hear About The Lich's Level)^2 % to all Focused rates, when you enter Northern Wastes. This effect works even when the bar is not focused. This effect will cap at a x4 mult (currently x3).`
            }
            return `You currently gain a permanent +(Hear About The Lich's Level)^2 % to all Focused rates, when you enter Northern Wastes. This effect works even when the bar is not focused. This effect caps at a x4 mult.`
        },
        onBuy: function(num) {
        },
    },

    //straight mults
    /*
    momentum: , increaseTheSurge,
    coins: , negotiateAggressively
    conversations: , findCommonGround
    mana: , improveMyBreathing, drawAmbientPower
    arcana: , , findMorePotency
    echoes: , , catchMoreWhispers
     */
    haveBetterIceBreakers: {
        initialCost:100, costIncrease:3, creationVersion: 6,
        upgradesAvailable:6, type:"mult",
        visible:true,
        customInfo: function(num) {
            return "Conversation generation increased by "+(num >0?"another ":"")+"x1.5, multiplicative";
        },
    },
    extractMyWorth: {
        initialCost:300, costIncrease:3, creationVersion: 6,
        upgradesAvailable:5, type:"mult",
        visible:true,
        customInfo: function(num) {
            return "Coin generation increased by "+(num >0?"another ":"")+"x2, multiplicative";
        }
    },
    glimpseTheWeave: {
        initialCost:300, costIncrease:3, creationVersion: 6,
        upgradesAvailable:5, type:"mult",
        visible:true,
        customInfo: function(num) {
            return "Arcana generation increased by "+(num >0?"another ":"")+"x1.5, multiplicative";
        },
    },
    increaseMyPace: {
        initialCost:300, costIncrease:3, creationVersion: 6,
        upgradesAvailable:5, type:"mult",
        visible:true,
        customInfo: function(num) {
            return "Momentum generation increased by "+(num >0?"another ":"")+"x1.25, multiplicative";
        },
    },
    listenToThePast: {
        initialCost:300, costIncrease:3, creationVersion: 6,
        upgradesAvailable:5, type:"mult",
        visible:true,
        customInfo: function(num) {
            return "Echo generation increased by "+(num >0?"another ":"")+"x1.25, multiplicative";
        },
    },
    channelMore: {
        initialCost:300, costIncrease:3, creationVersion: 6,
        upgradesAvailable:5, type:"mult",
        visible:true,
        customInfo: function(num) {
            return "Mana generation increased by "+(num >0?"another ":"")+"x1.5, multiplicative";
        },
    },
    increaseMarketCap: {
        initialCost:200, costIncrease:2, creationVersion: 6,
        upgradesAvailable:5, type:"mult",
        visible:false,
        customInfo: function(num) {
            return Raw.html`Invest's maximum fortune gain cap increases by x100. Currently ${(intToString(Math.pow(10, 5+2*num)))}.`
        },
        currentValue: function() {
            return Math.pow(10, 5+2*data.upgrades.increaseMarketCap.upgradePower)
        }
    },

    haveBetterConversations: {
        initialCost:1200, costIncrease:3, creationVersion: 6,
        upgradesAvailable:5, type:"mult",
        visible:false,
        customInfo: function(num) {
            return "Conversation generation increased by "+(num >0?"another ":"")+"x1.5, multiplicative";
        },
    },
    workHarder: {
        initialCost:1200, costIncrease:3, creationVersion: 6,
        upgradesAvailable:5, type:"mult",
        visible:false,
        customInfo: function(num) {
            return "Coins generation increased by "+(num >0?"another ":"")+"x2, multiplicative";
        }
    },
    weaveSmallerStrands: {
        initialCost:1200, costIncrease:3, creationVersion: 6,
        upgradesAvailable:5, type:"mult",
        visible:false,
        customInfo: function(num) {
            return "Arcana generation increased by "+(num >0?"another ":"")+"x1.5, multiplicative";
        },
    },
    createABetterFoundation: {
        initialCost:1200, costIncrease:3, creationVersion: 6,
        upgradesAvailable:5, type:"mult",
        visible:false,
        customInfo: function(num) {
            return "Momentum generation increased by "+(num >0?"another ":"")+"x1.25, multiplicative";
        },
    },
    feelTheRemnants: {
        initialCost:1200, costIncrease:3, creationVersion: 6,
        upgradesAvailable:5, type:"mult",
        visible:false,
        customInfo: function(num) {
            return "Echo generation increased by "+(num >0?"another ":"")+"x1.25, multiplicative";
        },
    },
    sparkMoreMana: {
        initialCost:1200, costIncrease:3, creationVersion: 6,
        upgradesAvailable:5, type:"mult",
        visible:false,
        customInfo: function(num) {
            return "Mana generation increased by "+(num >0?"another ":"")+"x1.5, multiplicative";
        },
    },
    studyHarder: {
        initialCost:1200, costIncrease:3, creationVersion: 6,
        upgradesAvailable:5, type:"mult",
        visible:false,
        customInfo: function(num) {
            return "Research generation increased by "+(num >0?"another ":"")+"x1.25, multiplicative";
        },
    },

//upgrades for new actions
    respectTheShrine: {
        initialCost:5, costIncrease:1, creationVersion: 6,
        upgradesAvailable:1, type:"actions",
        visible:true,
        customInfo: function(num) {
            switch(num) {
                case 0:
                    return "Unlocks new actions that uses Momentum, for a legacy boost"
                default:
                    return "Unlocked a new action that uses Momentum, for a legacy boost"
            }
        },
        onBuy: function(num) {
            if(num === 1) {
                purchaseAction('clearTheLeaves')
                purchaseAction('humOldTune')
            }
        }
    },
    improveMyGrimoire: {
        initialCost:10, costIncrease:4, creationVersion: 6,
        upgradesAvailable:3, type:"actions",
        visible:true,
        customInfo: function(num) {
            switch(num) {
                case 0:
                case 1:
                    return "Unlocks new actions that use Mana, to raise Mana Quality. Also unlocks a new upgrade for new spells."
                case 2:
                    return "Unlocks new actions that use Mana, to raise Mana Quality. Also unlocks a new upgrade for new spells."
                default:
                    return "Unlocks new actions that use Mana, to raise Mana Quality"
            }
        },
        onBuy: function(num) {
            if(num === 1) {
                purchaseAction('grimoireResearch')
                revealUpgrade('shapeMyMana')
            } else if(num === 2) {
                purchaseAction('castToFail')
                purchaseAction('locateWeakness')
                purchaseAction('fixTheFormula')
                revealUpgrade('useMyGrimoiresPower')
            } else if(num === 3) {
                purchaseAction('boldenLines')
                purchaseAction('grindPigments')
                purchaseAction('chargeInk')
                revealUpgrade("useMoreComplexSpells")
            }
        }
    },
    shapeMyMana: {
        initialCost:20, costIncrease:2, creationVersion: 6,
        upgradesAvailable:7, type:"actions",
        visible:false,
        customInfo: function(num) {
            switch(num) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                default:
                    return "Unlocks new actions that use Mana, for increasing Mana generation"
            }
        },
        onBuy: function(num) {
            if(num === 1) {
                purchaseAction('condenseAura')
                purchaseAction('focusInwards')
            } else if(num === 2) {
                purchaseAction('widenChannels')
                purchaseAction('solidifyEdges')
            } else if(num === 3) {
                purchaseAction('createAVoid')
                purchaseAction('modifyAuraDensity')
            } else if(num === 4) {
                purchaseAction('hearThePulse')
                purchaseAction('layerAura')
                purchaseAction('condenseMana')
            } else if(num === 5) {
                purchaseAction('findTheThread')
                purchaseAction('spinMana')
            } else if(num === 6) {
                purchaseAction('accelerateManaFlow')
                purchaseAction('isolateRhythms')
                purchaseAction('matchTempo')
            } else if(num === 7) {
                purchaseAction('loopTheCircuit')
            }
        }
    },
    useMyGrimoiresPower: {
        initialCost:10, costIncrease:2, creationVersion: 6, title: "Use My Grimoire's Power",
        upgradesAvailable:2, type:"actions",
        visible:false,
        customInfo: function(num) {
            switch(num) {
                case 0:
                    return "Unlocks a new 1st Circle Spell, to increase Conversations"
                case 1:
                    return "Unlocks a new 2nd Circle Spell, to increase Momentum"
                default:
                    return "Unlocked new actions that use Arcana, to increase resources in Brythal"
            }
        },
        onBuy: function(num) {
            if(num === 1) {
                purchaseAction('overtalk')
            } else if(num === 2) {
                purchaseAction('overboost')
            }
        }
    },
    useMoreComplexSpells: {
        initialCost:100, costIncrease:4, creationVersion: 6,
        upgradesAvailable:2, type:"actions",
        visible:false,
        customInfo: function(num) {
            switch(num) {
                case 0:
                    return "Unlocks two new 3rd Circle Spells, to increase Coins and Conversations"
                case 1:
                    return "Unlocks one new 4th Circle Spell, to increase Momentum"
                default:
                    return "Unlocked new actions that use Arcana, to increase resources in Brythal"
            }
        },
        onBuy: function(num) {
            if(num === 1) {
                purchaseAction('overproduce')
                purchaseAction('overhear')
            } else if(num === 2) {
                purchaseAction('overponder')
            }
        }
    },
    feelTheEchoesOfTheBurntTown: {
        initialCost:15, costIncrease:2, creationVersion: 6,
        upgradesAvailable:6, type:"actions",
        visible:true,
        customInfo: function(num) {
            switch(num) {
                case 0:
                    return "Unlocks new actions that use Momentum, to increase Integration"
                case 1:
                    return "Unlocks new actions that use Momentum, to increase Legacy"
                case 2:
                    return "Unlocks new actions that use Momentum, to increase Momentum"
                case 3:
                case 4:
                    return "Unlocks new actions that use Momentum, to increase Legacy and Momentum"
                case 5:
                    return "Unlocks a new action that uses Momentum, to increase Legacy."
                default:
                    return "Unlocked new actions that use Momentum"
            }
        },
        onBuy: function(num) {
            if(num === 1) {
                purchaseAction('feelAGentleTug')
                purchaseAction('leaveTheOpenRoad')
                purchaseAction('climbATallTree')
            } else if(num === 2) {
                purchaseAction('clearTheWreckage') //+might
                purchaseAction('discoverBurntTown') //+navigation, +endurance
                purchaseAction('feelTheDespair') //+legacy
            } else if(num === 3) {
                purchaseAction('stepThroughAsh') //+valor, levels increase processEmotions
                purchaseAction('processEmotions') //+awareness
                purchaseAction('readTheWritten') //+obs, +int
                purchaseAction('siftExcess') //+conc
                revealUpgrade('refineMyValor')
            } else if(num === 4) {
                purchaseAction('graspTheTragedy') //+int, +valor
                purchaseAction('repairShatteredShrine') //+legacy
            } else if(num === 5) {
                purchaseAction('resonanceCompass')
                purchaseAction('clearIvyWall')
                purchaseAction('scavengeForSupplies')
            } else if(num === 6) {
                purchaseAction('pullPulsingShard')
            }
        }
    },
    investMyCoins: {
        initialCost:50, costIncrease:2, creationVersion: 6,
        upgradesAvailable:4, type:"actions",
        visible:true,
        customInfo: function(num) {
            switch(num) {
                case 0:
                    return "Unlocks new actions for converting coins into fortune. Reveals a new Unique Upgrade for increasing Fortune."
                case 1:
                    return "Unlocks an action for using fortune to build fortune, and an action for attributes. Reveals the upgrade Refine My Vision."
                case 2:
                    return "Unlocks more fortune actions. Reveals an upgrade to increase the market cap."
                case 3:
                case 4:
                case 5:
                    return "Unlocks new actions for using fortune"
                default:
                    return "Unlocks new actions that use Fortune, generated from Coins"
            }
        },
        onBuy: function(num) {
            if(num === 1) {
                purchaseAction('invest'); //+vision
                purchaseAction('buildFortune'); //+ambition
                purchaseAction('spendFortune'); //+energy, +savvy
                revealUpgrade('increaseInitialInvestment')
            } else if(num === 2) {
                purchaseAction('reinvest') //+vision
                purchaseAction('investInLocals') //+influence, +leverage
                purchaseAction('townCrier') //new job, x25 gold
                purchaseAction('storyTeller') //new job, x20 gold
                revealUpgrade('refineMyVision')
            } else if(num === 3) {
                purchaseAction('hostAFestival') //+influence, +charm
                purchaseAction('fundTownImprovements') //+influence, +savvy
                purchaseAction('browsePersonalCollection') //+savvy, +leverage
                revealUpgrade('increaseMarketCap')
            } else if(num === 4) {
                purchaseAction('supportLocalLibrary')
                purchaseAction('investInSelf')
                purchaseAction('makeAPublicDonation')
                if(data.lichKills >= 2) {
                    revealUpgrade('spendMyFortune');
                }
            }
        }
    },
    spendMyFortune: {
        initialCost:1000, costIncrease:2, creationVersion: 6,
        upgradesAvailable:1, type:"actions",
        visible:false,
        customInfo: function(num) {
            switch(num) {
                case 1:
                case 2:
                    return "Unlocks new actions for using Fortune"
                default:
                    return "Unlocks new actions that use Fortune"
            }
        },
        onBuy: function(num) {
            if(num === 1) {
                purchaseAction('expandLocalLibrary')
                purchaseAction('fundASmallStall')
                purchaseAction('purchaseALot')
            } else if(num === 2) {
                // purchaseAction('craftSpellShack')
                // purchaseAction('recruitACarpenter')
                // purchaseAction('procureQualityWood')
            }
        }
    },
    buyNicerStuff: {
        initialCost:20, costIncrease:1.5, creationVersion: 6,
        upgradesAvailable:3, type:"actions",
        visible:true,
        customInfo: function(num) {
            switch(num) {
                case 0:
                case 1:
                    return "Unlocks new actions that use Coins. Needs Invest My Coins 1 for all new actions"
                case 2:
                    return "Unlocks new actions that use Coins. Needs Invest 1 for any new actions"
                default:
                    return "Unlocks new actions that use Coins"
            }
        },
        onBuy: function(num) {
            if(num === 1) {
                purchaseAction('buyComfyShoes')
                purchaseAction('buyTravelersGear')
            } else if(num === 2) {
                purchaseAction('buyArtisanFood') //+20 energy
                purchaseAction('buyShinyThings') //+10 ambition, +10 confidence
                purchaseAction('buyTools') //+20 endurance
            } else if(num === 3) {
                purchaseAction('buyPotions')
                purchaseAction('buyCart')
            }
        }
    },
    chatLongerWithAllies: {
        initialCost:30, costIncrease:3, creationVersion: 6,
        upgradesAvailable:3, type:"actions",
        visible:true,
        customInfo: function(num) {
            switch(num) {
                case 0:
                    return "Unlocks new actions that use Conversations, for Making Money"
                case 1:
                case 2:
                    return "Unlocks new actions that use Conversations, for a variety of attributes"
                case 3:
                    return "Unlocks new actions that use Conversations, for Wizardry and Spellcraft"
                case 4:
                    return "Unlocks a new action that uses Conversations, for a variety of attributes."
                case 5:
                    return "Unlocks a new action that uses Conversations, for a variety of attributes."
                default:
                    return "Unlocked new actions that use Conversations"
            }
        },
        onBuy: function(num) {
            if(num === 1) {
                purchaseAction('learnToQuestion') //+conf, awareness
                purchaseAction('trackMarketMovement') //+savvy
                purchaseAction('catalogueGoods') //+leverage
                purchaseAction('negotiate') //+savvy
                purchaseAction('lowerCounteroffer') //+leverage
            } else if(num === 2) {
                purchaseAction('learnToConnect') //+int
                purchaseAction('projectConfidence')
                purchaseAction('mirrorPosture')
                purchaseAction('askAboutGoals') //ambition, charm
                purchaseAction('talkAboutPassions')
                purchaseAction('talkAboutFears')
            } else if(num === 3) {
                purchaseAction('askAboutRelationships') //confidence, leverage
                purchaseAction('talkToTheRecruiters') //ambition, influence
                purchaseAction('buyPointyHat') //confidence, charm
                purchaseAction('learnOfSecretMeeting') //ambition, archmagery.
                purchaseAction('getTestedForKnowledge') //influence, integration
                purchaseAction('joinWizardSociety') //wizardry
            }
        }
    },
    talkToMoreWizards: {
        initialCost:800, costIncrease:3, creationVersion: 6,
        upgradesAvailable:3, type:"actions",
        visible:false,
        customInfo: function(num) {
            switch(num) {
                case 0:
                    return "Requires Chat Longer With Allies maxed. Unlocks new actions that use Conversations, for Wizardry and Spellcraft"
                case 1:
                    return "Unlocks a new action that uses Conversations, for a variety of attributes."
                case 2:
                    return "Unlocks a new action that uses Conversations, for a variety of attributes."
                default:
                    return "Unlocked new actions that use Conversations"
            }
        },
        onBuy: function(num) {
            if(num === 1) {
                purchaseAction('misuseATerm')
                purchaseAction('eavesdropOnArguments')
                purchaseAction('showOffSpells')
                purchaseAction('learnFromCriticisms')
                purchaseAction('practiceGestures')
            } else if(num === 2) {
                purchaseAction('askAboutHistory')
                purchaseAction('learnOfFamousMages')
                purchaseAction('practiceTargeting')

                purchaseAction('talkToLegends')
                purchaseAction('talkToArcanistBalthazar')
            } else if(num === 3) {
                purchaseAction('talkToKeeperSimeon')
                purchaseAction('practiceVisualizations')
                purchaseAction('talkToWovenElara')
                purchaseAction('practiceLayering')
            }
        }
    },
    stopBeingSoTense: {
        initialCost:200, costIncrease:1, creationVersion: 6,
        upgradesAvailable:1, type:"actions",
        visible:false,
        customInfo: function(num) {
            return "Unlock 2 actions that use momentum"
        },
        onBuy: function(num) {
            purchaseAction('standStraighter'); //1e50
            purchaseAction('walkAware'); //1e60
        }
    },
    readTheOldBooks: {
        initialCost:1500, costIncrease:1, creationVersion: 6,
        upgradesAvailable:1, type:"actions",
        visible:false,
        customInfo: function(num) {
            return "Unlocks new actions that use Research, and new spells"
        },
        onBuy: function(num) {
            if(num === 1) {
                purchaseAction('readBooks')
                purchaseAction('catalogNewBooks')
                purchaseAction('study')
                purchaseAction('researchBySubject')
                purchaseAction('studyHistory')
                purchaseAction('reviewOldMemories')
            }
        }
    },
    exploreTheLibrary: {
        initialCost:1200, costIncrease:1.5, creationVersion: 6,
        upgradesAvailable:2, type:"actions",
        visible:false,
        customInfo: function(num) {
            return "Unlocks new actions that use Research, and new spells"
        },
        onBuy: function(num) {
            if(num === 1) {
                purchaseAction('breakWeakenedWall')
                purchaseAction('findAFamiliarLanguage')
                purchaseAction('skimAHeavyTome')
                purchaseAction('decipherOrganization')
                purchaseAction('collectHistoryBooks')
                revealUpgrade("readTheOldBooks")
            } else if(num === 2) {
                purchaseAction('readFadedMarkers')
                purchaseAction('accessBasementPassage')
                purchaseAction('inspectAllCorners')
                purchaseAction('mapOutTraps')
                purchaseAction('accessForbiddenArea')
                purchaseAction('collectSpellBooks')
                revealUpgrade("readSpellPrimers")
                //END here for now
            }
        }
    },
    readSpellPrimers: {
        initialCost:2000, costIncrease:3, creationVersion: 6,
        upgradesAvailable:1, type:"actions",
        visible:false,
        customInfo: function(num) {
            return "Unlocks new study actions that permanently unlock mana actions to increase Mana Quality."
        },
        onBuy: function(num) {
            if(num === 1) {
                purchaseAction('studyMagic')
                purchaseAction('studyMagicalExercises')
            }
        }
    },
    improveMyHouse: {
        initialCost:2000, costIncrease:2, creationVersion: 6,
        upgradesAvailable:3, type:"actions",
        visible:false,
        customInfo: function(num) {
            return "Unlocks new actions that use Coins"
        },
        onBuy: function(num) {
            if(num === 1) {
                purchaseAction('buyFurniture')
                purchaseAction('buyBed')
            } else if(num === 2) {
                purchaseAction('buyReadingChair')
                purchaseAction('buyFireplace')
            } else if(num === 3) {
                purchaseAction('buyGoodFirewood')
                purchaseAction('buySilkSheets')
            }
        }
    },

//unique upgrades
    recognizeTheFamiliarity: {
        initialCost:95, costIncrease:1, creationVersion: 6,
        upgradesAvailable:1, type:"unique",
        visible:true,
        customInfo: function(num) {
            return "Reveals the times an action has been unlocked. Permanently multiply unlock cost of all actions by (1 - (times unlocked * .04) / (1 + times unlocked * .04))";
        },
        onBuy: function(num) {
        }
    },
    rememberTheVictories:{
        initialCost:400, costIncrease:1, creationVersion: 6,
        upgradesAvailable:1, type:"unique",
        visible:false,
        customInfo: function(num) {
            return "Legacy Gain in Northern Wastes is further multiplied by level of x1.01 per Overclock Targeting the Lich.";
        },
        onBuy: function(num) {
            //add to OTTL icon?
        }
    },
    feelTheDefeats:{
        initialCost:1200, costIncrease:1, creationVersion: 6,
        upgradesAvailable:1, type:"unique",
        visible:false,
        customInfo: function(num) {
            return "Legacy gain in Brythal is multiplied by Resonance's bonus";
        },
        onBuy: function(num) {
        }
    },

    increaseInitialInvestment: {
        initialCost:40, costIncrease:1.5, creationVersion: 6,
        upgradesAvailable:7, type:"unique",
        visible:false,
        customInfo: function(num) {
            return Raw.html`Invest's base Fortune gain increases to ${["2 (currently 1)", "5 (currently 2)", "10 (currently 5)", "20 (currently 10)", "50 (currently 20)", "100 (currently 50)", "200 (currently 100)", 200][num]}.`
        },
        currentValue: function() {
            if(data.upgrades.increaseInitialInvestment.upgradePower <= 7) {
                return [1, 2, 5, 10, 20, 50, 100, 200][data.upgrades.increaseInitialInvestment.upgradePower];
            }
            return upgradeData.findAngelInvestors.currentValue();
        },
        onBuy:function(num) {
            if(num === 7 && data.lichKills >= 1) {
                revealUpgrade("findAngelInvestors")
            }
        }
    },
    findAngelInvestors: {
        initialCost:600, costIncrease:1.5, creationVersion: 6,
        upgradesAvailable:2, type:"unique",
        visible:false,
        customInfo: function(num) {
            return Raw.html`Invest's base Fortune gain increases to ${["500 (currently 200)", "1000 (currently 500)", 1000][num]}.`
        },
        currentValue: function() {
            return [200, 500, 1000][data.upgrades.increaseInitialInvestment.upgradePower];
        }
    },
    retrieveMyUnusedResources: {
        initialCost:500, costIncrease:1.5, creationVersion: 6,
        upgradesAvailable:3, type:"unique",
        visible:false,
        customInfo: function(num) {
            return `Retrieve 10 + ${[1, 2, 5][num]}% of current resource per second on all actions that are dimmed (max level, no resource increase or decrease). Skips Reinvest.`;
        },
    },
    rememberWhatIDid: {
        initialCost:10, costIncrease:1, creationVersion: 6,
        upgradesAvailable:1, type:"unique",
        visible:false,
        customInfo: function(num) {
            return "When you use the amulet, the highest levels achieved on non-Northern Wastes actions and generators are recorded. Gain +25% more exp up to the highest level reached. Note: Only generators carry over exp into their next level.";
        },
        onBuy: function(num) {
        }
    },
    rememberHowIGrew: {
        initialCost:200, costIncrease:1, creationVersion: 6,
        upgradesAvailable:1, type:"unique",
        visible:false,
        customInfo: function(num) {
            return "When you use the amulet, the second highest levels achieved on non-Northern Wastes actions and generators are recorded. Gain +25% additive more exp up to the second highest level reached. Note: Only generators carry over exp into their next level.";
        },
        onBuy: function(num) {
        }
    },
    rememberMyMastery: {
        initialCost:6000, costIncrease:1, creationVersion: 6,
        upgradesAvailable:1, type:"unique",
        visible:false,
        customInfo: function(num) {
            return "When you use the amulet, the third highest levels achieved on non-Northern Wastes actions and generators are recorded. Gain +50% additive more exp up to the third highest level reached. Note: Only generators carry over exp into their next level.";
        }
    },
    valueMyBody: {
        initialCost:15, costIncrease:10, creationVersion: 6,
        upgradesAvailable:3, type:"unique",
        visible:false,
        customInfo: function(num) {
            return "Increase the max level of Body Awareness by 1";
        },
        onBuy: function(num) {

        }
    },
    valueMyResearch: {
        initialCost:20, costIncrease:10, creationVersion: 6,
        upgradesAvailable:3, type:"unique",
        visible:false,
        customInfo: function(num) {
            return "Increase the max level of Spell Research by 1";
        },
        onBuy: function(num) {

        }
    },


    /*
    add max level to actions:
    These should all be available as a reward for the first reset, for various costs
    It requires the automation upgrade to enable/disable at specific levels
    OR the automation that enables based on total % of that resource ?

-talk with john, 2 for 300 AC, (x1, 2 times)
-remember, 1 for 150 AC, (x1, 5 times)
-buy basic/travelers clothes/gear, 1 for 200 AC (x1, 3 times)
-eat golden fruit, 1 for 500 AC (make the cost x1e8)
-early jobs, +4 for 300 AC, (x1, 2 times)
-move with purpose, +1 for 600 AC (x1, 2 times)

-expel mana, +5 for 500 AC (x1, 3 times)
-prepare spells, +3 for 300 AC, (x1, 2 times)
-prepare internal, +3 for 500 AC, (x1, 2 times)
-infuse the hide, +2

     */



    refineMyAwareness: { type:"attribute", attribute:"awareness", upgradesAvailable:10, addAmount:20, initialCost:10, costIncrease:3, visible:true, creationVersion: 6 },
    refineMyConcentration: { type:"attribute", attribute:"concentration", upgradesAvailable:10, addAmount:20, initialCost:15, costIncrease:3, visible:true, creationVersion: 6 },
    refineMyControl: { type:"attribute", attribute:"control", upgradesAvailable:10, addAmount:20, initialCost:25, costIncrease:3, visible:true, creationVersion: 6 },
    refineMyEnergy: { type:"attribute", attribute:"energy", upgradesAvailable:10, addAmount:20, initialCost:35, costIncrease:3, visible:true, creationVersion: 6 },
    refineMyIntegration: { type:"attribute", attribute:"integration", upgradesAvailable:10, addAmount:20, initialCost:50, costIncrease:3, visible:true, creationVersion: 6 },

    refineMyAmplification: { type:"attribute", attribute:"amplification", upgradesAvailable:10, addAmount:20, initialCost:20, costIncrease:3, visible:true, creationVersion: 6 },
    refineMyPulse: { type:"attribute", attribute:"pulse", upgradesAvailable:10, addAmount:20, initialCost:40, costIncrease:3, visible:true, creationVersion: 6 },
    refineMyCycle: { type:"attribute", attribute:"cycle", upgradesAvailable:10, addAmount:20, initialCost:60, costIncrease:3, visible:true, creationVersion: 6 },
    refineMyResonance: { type:"attribute", attribute:"resonance", upgradesAvailable:10, addAmount:20, initialCost:250, costIncrease:3, visible:true, creationVersion: 6 },

    refineMyAmbition: { type:"attribute", attribute:"ambition", upgradesAvailable:10, addAmount:20, initialCost:10, costIncrease:3, visible:true, creationVersion: 6 },
    refineMyLeverage: { type:"attribute", attribute:"leverage", upgradesAvailable:10, addAmount:20, initialCost:20, costIncrease:3, visible:true, creationVersion: 6 },
    refineMySavvy: { type:"attribute", attribute:"savvy", upgradesAvailable:10, addAmount:20, initialCost:40, costIncrease:3, visible:true, creationVersion: 6 },
    refineMyVision: { type:"attribute", attribute:"vision", upgradesAvailable:10, addAmount:20, initialCost:110, costIncrease:3, visible:false, creationVersion: 6 },

    refineMyInfluence: { type:"attribute", attribute:"influence", upgradesAvailable:10, addAmount:20, initialCost:15, costIncrease:3, visible:true, creationVersion: 6 },
    refineMyConfidence: { type:"attribute", attribute:"confidence", upgradesAvailable:10, addAmount:20, initialCost:30, costIncrease:3, visible:true, creationVersion: 6 },
    refineMyCharm: { type:"attribute", attribute:"charm", upgradesAvailable:10, addAmount:20, initialCost:30, costIncrease:3, visible:true, creationVersion: 6 },

    refineMyObservation: { type:"attribute", attribute:"observation", upgradesAvailable:10, addAmount:20, initialCost:10, costIncrease:3, visible:true, creationVersion: 6 },
    refineMyEndurance: { type:"attribute", attribute:"endurance", upgradesAvailable:10, addAmount:20, initialCost:10, costIncrease:3, visible:true, creationVersion: 6 },
    refineMyMight: { type:"attribute", attribute:"might", upgradesAvailable:10, addAmount:20, initialCost:10, costIncrease:3, visible:true, creationVersion: 6 },
    refineMyNavigation: { type:"attribute", attribute:"navigation", upgradesAvailable:10, addAmount:20, initialCost:10, costIncrease:3, visible:true, creationVersion: 6 },

    refineMyWizardry: { type:"attribute", attribute:"wizardry", upgradesAvailable:10, addAmount:20, initialCost:50, costIncrease:3, visible:true, creationVersion: 6 },
    refineMyArchmagery: { type:"attribute", attribute:"archmagery", upgradesAvailable:10, addAmount:20, initialCost:150, costIncrease:3, visible:true, creationVersion: 6 },
    refineMySpellcraft: { type:"attribute", attribute:"spellcraft", upgradesAvailable:10, addAmount:20, initialCost:200, costIncrease:3, visible:true, creationVersion: 6 },
    refineMyValor: { type:"attribute", attribute:"valor", upgradesAvailable:10, addAmount:20, initialCost:70, costIncrease:3, visible:false, creationVersion: 6 },

    refineMyImpedance: { type:"attribute", attribute:"impedance", upgradesAvailable:10, addAmount:-5, initialCost:10, costIncrease:3, visible:true, creationVersion: 6 },




    //... finish up to here
    /*

    discoverMoreOfTheWorld: {
    },
    learnHowToFight: {
    },
    getCombatExperience: {
    },
    thinkAboutWhatINeed: {
    },
    gainAccessToTheAcademy: {
    },
    learnMagicFromTheTowerMages: {
    },
    nurtureAGoodReputation: {
    },
    gatherBlackmailMaterial: {
    },
    stealMagicFromTheTowerMages: {
    },
    wieldMyNaturalMagic: {
    },
    wieldMyMagicNaturally: {
    },
    gatherArtifcatsOfPower: {
    },
    leadTheCharge: {
    },
*/


    listenCloserToWhispers: {
        initialCost:1, costIncrease:1, creationVersion: 6,
        upgradesAvailable:1, type:"lich",
        visible:true,
        customInfo: function(num) {
            return "Ancient Whisper and Ancient Coin gains are multiplied by 3";
        },
        onBuy: function(num) {
        }
    },
    enhanceOverclock: {
        initialCost:1, costIncrease:1, creationVersion: 6,
        upgradesAvailable:1, type:"lich",
        visible:true,
        customInfo: function(num) {
            return "Momentum gain is multiplied by 3";
        },
        onBuy: function(num) {
        }
    },
    makeADeeperImpact: {
        initialCost:1, costIncrease:1, creationVersion: 6,
        upgradesAvailable:1, type:"lich",
        visible:true,
        customInfo: function(num) {
            return "All Legacy gain is multiplied by 3";
        },
        onBuy: function(num) {
        }
    },


}