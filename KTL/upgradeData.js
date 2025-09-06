

//vars that you would pull from the save
function upgradesSetBaseVariables(upgradeObj, dataObj) {
    upgradeObj.upgradePower = dataObj.upgradePower ?? 0; //for controlling the effect of the upgrade
    upgradeObj.initialCost = dataObj.initialCost;
    upgradeObj.costIncrease = dataObj.costIncrease;
    upgradeObj.upgradesAvailable = dataObj.upgradesAvailable;
    upgradeObj.upgradesBought = dataObj.upgradesBought ?? 0;
    upgradeObj.increaseRatio = dataObj.increaseRatio;

    upgradeObj.isFullyBought = !!dataObj.isFullyBought;
    upgradeObj.visible = !!dataObj.visible;
}


function createUpgrades() {
    //Loop through upgradeData
    //modify/add base variables as needed
    //add it to data.upgrades
    for(let upgradeVar in upgradeData) {
        let dataObj = upgradeData[upgradeVar];
        data.upgrades[upgradeVar] = {};
        let upgradeObj = data.upgrades[upgradeVar];

        upgradesSetBaseVariables(upgradeObj, dataObj);
    }
}


function calcUpgradeCost(upgrade, num) {
    if(num === 0) {
        return upgrade.initialCost;
    }
    return Math.floor(upgrade.initialCost * Math.pow(upgrade.costIncrease, num));
}


function sortAmuletCards() {
    const container = document.getElementById("amuletUpgrades");
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
function resetCardOrder() {
    const container = document.getElementById("amuletUpgrades");
    const cards = Array.from(container.children);
    cards.forEach(card => {
        card.style.order = ""; // Resetting the order lets flexbox use the default
    });
}
function toggleSortByCost(checkbox) {
    if (checkbox.checked) {
        sortAmuletCards(); // Sorts the cards by cost
    } else {
        resetCardOrder(); // Reverts to the default order
    }
}

function initializeAmuletCards() {
    const container = document.getElementById("amuletUpgrades");
    container.style.cssText = "display:flex;flex-wrap:wrap;gap:15px;padding:10px;";
    container.innerHTML = "";

    for (const upgradeVar in data.upgrades) {
        const upgrade = data.upgrades[upgradeVar];
        const upgradeDataObj = upgradeData[upgradeVar];
        const cardId = `card_${upgradeVar}`;

        // 1. Create the main card element and its skeleton HTML
        const cardElement = document.createElement('div');
        cardElement.id = cardId;

        const descriptionId = `description_${upgradeVar}`;
        const costId = `cost_${upgradeVar}`;
        const remainingId = `remaining_${upgradeVar}`;
        const buyButtonSectionId = `buyButtonSection_${upgradeVar}`;
        const costSectionId = `costSection_${upgradeVar}`;
        const remainingSectionId = `remainingSection_${upgradeVar}`;
        const maxLevelSectionId = `maxLevelSection_${upgradeVar}`;
        const title = upgradeDataObj.title || `...${decamelize(upgradeVar)}`;

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

        // 2. Queue the IDs for the cache to be processed later
        queueCache(cardId, descriptionId, costId, remainingId, buyButtonSectionId, costSectionId, remainingSectionId, maxLevelSectionId);

        // 3. Set the card's initial state using DIRECT DOM manipulation
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

        const canAfford = data.ancientCoin >= cost;
        const borderColor = isFullyBought ? '#c3cd00' : (canAfford ? '#00cd41' : '#ff0000');
        cardElement.style.border = `2px solid ${borderColor}`;

        let text = !upgradeDataObj.attribute ? upgradeDataObj.customInfo(numBought) :
            attributeUpgradeInfo(upgradeDataObj.attribute, upgrade.upgradesAvailable, numBought, upgrade.increaseRatio);
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
            cardElement.querySelector(`#${costId}`).textContent = `${cost} AC`;
            cardElement.querySelector(`#${remainingId}`).textContent = remaining;
        }

        // 4. Append the fully prepared element to the container
        container.appendChild(cardElement);
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

    //redundant but costless
    cardElement.style.backgroundColor = '#2c2c3e';
    cardElement.style.borderRadius = '8px';
    cardElement.style.padding = '12px';
    cardElement.style.width = '280px';
    cardElement.style.display = upgrade.visible ? 'flex' : 'none';
    cardElement.style.flexDirection = 'column';
    cardElement.style.justifyContent = 'space-between';
    cardElement.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    cardElement.style.color = '#e0e0e0';

    let text = !upgradeDataObj.attribute ? upgradeDataObj.customInfo(numBought) :
        attributeUpgradeInfo(upgradeDataObj.attribute, upgrade.upgradesAvailable, numBought, upgrade.increaseRatio);
    views.updateVal(descriptionId, text, 'innerHTML');

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

        const newCost = calcUpgradeCost(upgrade, numBought);
        views.updateVal(costId, `${newCost} AC`, 'textContent');
        views.updateVal(remainingId, remaining, 'textContent');
    }

    updateCardAffordabilityBorders();
}

function buyUpgrade(upgradeVar) {
    const upgrade = data.upgrades[upgradeVar];
    const upgradeDataObj = upgradeData[upgradeVar];
    const levelToBuy = upgrade.upgradesBought;

    if (levelToBuy >= upgrade.upgradesAvailable) return;

    const cost = calcUpgradeCost(upgrade, levelToBuy);
    if (data.ancientCoin < cost) return;

    data.ancientCoin -= cost;
    upgrade.upgradesBought++;
    upgrade.upgradePower++;

    if (upgradeDataObj.onBuy) {
        upgradeDataObj.onBuy(upgrade.upgradePower);
    }
    if(upgradeDataObj.attribute) {
        attributeUpgradeOnBuy(upgradeDataObj.attribute, upgrade.upgradesBought, upgrade.increaseRatio);
    }

    upgrade.isFullyBought = (upgrade.upgradesAvailable - upgrade.upgradesBought) === 0;

    const cardElement = document.getElementById(`card_${upgradeVar}`);
    if (cardElement) {
        if (upgrade.isFullyBought) {
            cardElement.dataset.sortOrder = Infinity;
        } else {
            const newCost = calcUpgradeCost(upgrade, upgrade.upgradesBought);
            cardElement.dataset.sortOrder = newCost;
        }
    }

    updateAmuletCardUI(upgradeVar);
    refreshUpgradeVisibility();

    // --- THIS IS THE KEY CHANGE ---
    // Only re-sort the cards if the checkbox is checked.
    const sortCheckbox = document.getElementById('sortByCostCheckbox');
    if (sortCheckbox && sortCheckbox.checked) {
        sortAmuletCards();
    }
}








function attributeUpgradeInfo(attVar, upgradesAvailable, upgradeNum, increaseRatio) {
    // console.log(attVar, upgradesAvailable, upgradeNum, increaseRatio);
    const attributeName = capitalizeFirst(attVar);
    const possessiveName = attributeName.endsWith('s')
        ? `${attributeName}'`
        : `${attributeName}'s`;

    if (upgradeNum >= upgradesAvailable) {
        const maxMultiplier = 1 + upgradesAvailable * increaseRatio;
        return `The bonus multiplier to ${possessiveName} mult is x${maxMultiplier.toFixed(2)}`;
    }

    const currentMultiplier = 1 + upgradeNum * increaseRatio;
    const nextMultiplier = 1 + (upgradeNum + 1) * increaseRatio;
    return `Increase ${possessiveName} bonus multiplier to x${nextMultiplier.toFixed(2)} (Currently: x${currentMultiplier.toFixed(2)})`;
}

function attributeUpgradeOnBuy(attVar, upgradeNum, increaseRatio) {
    data.atts[attVar].attUpgradeMult = 1 + (upgradeNum * increaseRatio);
    recalcAttMult(attVar);
}

function toggleMaxLevelCards(callingCheckbox) {
	function filter(checkbox, upgrade, upgradeDataObj) {
		const show = checkbox.checked;
		
		return show || !upgrade.isFullyBought;
	}
	
	refreshUpgradeVisibility(callingCheckbox, filter);
}
function toggleAttributeUpgrades(callingCheckbox) {
	function filter(checkbox, upgrade, upgradeDataObj) {
		const show = checkbox.checked;
		
		return show || !upgradeDataObj.attribute;
	}
	
	refreshUpgradeVisibility(callingCheckbox, filter);
}
function toggleUnaffordableUpgrades(callingCheckbox) {
	function filter(checkbox, upgrade, upgradeDataObj) {
		const show = checkbox.checked;
		
		//All fully bought things are "affordable"
		return show || upgrade.isFullyBought || !(calcUpgradeCost(upgrade, upgrade.upgradesBought) > data.ancientCoin);
	}
	
	refreshUpgradeVisibility(callingCheckbox, filter);
}
var refreshUpgradeVisibility = function() {
	//This holds all registered filters.  They're registered when the checkbox is changed the first time.
	const visibilityFilters = new Map();
	
	return function(callingCheckbox, callingFilter) {
		//Allow calling this with no arguments to rerun filters.  Eg: When buying something in the shop
		if (callingCheckbox) {
			//It's redundent to call this each time, but it won't harm anything
			visibilityFilters.set(callingCheckbox, callingFilter);
		}
		
		for (const upgradeVar in data.upgrades) {
			const upgrade = data.upgrades[upgradeVar];
			const upgradeDataObj = upgradeData[upgradeVar];
			
			let isShown = true;
			
			//Loop through all filters and only show something that all filters allow to be shown.
			for (const [checkbox,filter] of visibilityFilters) {
				isShown &= filter(checkbox, upgrade, upgradeDataObj);
			}
			
			const displayStyle = isShown ? 'flex' : 'none';
			
            const cardId = `card_${upgradeVar}`;
			views.updateVal(cardId, !upgrade.visible?"none":displayStyle, 'style.display');
		}
	}
}();



function updateCardAffordabilityBorders() {
    for (const upgradeVar in data.upgrades) {
        const upgrade = data.upgrades[upgradeVar];
        if (!upgrade.isFullyBought) {
            const cost = calcUpgradeCost(upgrade, upgrade.upgradesBought);
            const canAfford = data.ancientCoin >= cost;
            const cardId = `card_${upgradeVar}`;
            const borderColor = canAfford ? '#00cd41' : '#ff0000';
            views.updateVal(cardId, borderColor, 'style.borderColor');
        }
    }
}

let upgradeData = {
    stopLettingOpportunityWait: {
        initialCost:2, costIncrease:3,
        upgradesAvailable: 2,
        visible: true,
        customInfo: function(num) {
            return `[Automation] When unlocking a new action, automatically sets the downstream sliders of the 
            unlocked action to ${["50%", "100% (Currently 50%)", "100%"][num]}.`;
        },
        onBuy: function(num) {
            for (let actionVar in data.actions) {
                views.updateVal(`${actionVar}_automationMenuButton`, data.actions[actionVar].hasUpstream?"":"none", "style.display");
            }
        }
    },
    knowWhenToMoveOn: {
        initialCost:2, costIncrease:2,
        upgradesAvailable:1,
        visible:true,
        customInfo: function(num) {
            return Raw.html`[Automation] When an action is at its max level and has no downstream actions with sliders, it 
                automatically set the flow rate leading to it to 0%. This will apply recursively.`
        },
        onBuy: function(num) {
            for (let actionVar in data.actions) {
                views.updateVal(`${actionVar}_automationMenuButton`, data.actions[actionVar].hasUpstream?"":"none", "style.display");
            }
        }
    },
    feelTheEchoesOfMyPast: {
        initialCost:3, costIncrease:10,
        upgradesAvailable:2,
        visible:true,
        customInfo: function(num) {
            return `Keep ${["50% (Currently 10%)", "100% (Currently 50%)", "100%"][num]} of your Legacy when you use the Amulet`;
        }
    },
    startALittleQuicker: {
        initialCost:1, costIncrease:3,
        upgradesAvailable:3,
        visible:true,
        customInfo: function(num) {
            return Raw.html`Overclock gains a flat +${["5", "20 (currently 5)", "100 (currently 20)", 100][num]} momentum per second.`
        }
    },
    rememberWhatIFocusedOn: {
        initialCost:5, costIncrease:2,
        upgradesAvailable:3,
        visible:true,
        customInfo: function(num) {
            if(num === 0) {
                return Raw.html`Gain a rate of +1/hr to a Practice Mult on the flow you have Focused. The mult lasts until the amulet 
                is used, and stacks with the Focus Mult. The Practice Mult will have a max of 2. `
            }
            if(num === 1) {
                return Raw.html`You have a rate of +1/hr to a Practice Mult on the flow you have Focused. This mult lasts until the amulet 
                is used, and stacks with the Focus Mult. The Practice Mult currently has a max of 2. Gain +1.`
            }
            if(num === 2) {
                return Raw.html`You have a rate of +1/hr to a Practice Mult on the flow you have Focused. This mult lasts until the amulet 
                is used, and stacks with the Focus Mult. The Practice Mult currently has a max of 3. Gain +1.`
            }
            return Raw.html`You have a rate of +1/hr to a Practice Mult on the flow you have Focused. This mult lasts until the amulet 
                is used, and stacks with the Focus Mult. The Practice Mult currently has a max of 4.`
        },
        onBuy: function(num) {
            data.focusLoopMax = 2 + num;
            unveilUpgrade('knowWhatIFocusedOn')
        },
    },
    learnedOfLichSigns: {
        initialCost:8, costIncrease:3,
        upgradesAvailable:3,
        visible:true,
        customInfo: function(num) {
            return "Increase the max level of Hear About The Lich by +1. This will allow you to get more Ancient Coins, but only if you can reach that level.";
        },
        onBuy: function(num) {
            actionData.hearAboutTheLich.maxLevel = 2 + num;
        }
    },
    knowWhatIFocusedOn: {
        initialCost:5, costIncrease:2,
        upgradesAvailable:2,
        visible:false,
        customInfo: function(num) {
            return "Keep "+(["20", "50 (currently 20%)", "50"][num])+"% of your Focus Loop Bonus when you use the Amulet";
        }
    },

    refineMyCycle: { attribute:"cycle", upgradesAvailable:4, increaseRatio:.25, initialCost:5, costIncrease:4, visible:true },
    refineMyAwareness: { attribute:"awareness", upgradesAvailable:4, increaseRatio:.5, initialCost:5, costIncrease:4, visible:true },
    refineMyConcentration: { attribute:"concentration", upgradesAvailable:4, increaseRatio:.5, initialCost:10, costIncrease:4, visible:true },
    refineMyEnergy: { attribute:"energy", upgradesAvailable:4, increaseRatio:.5, initialCost:10, costIncrease:4, visible:true },
    refineMyFlow: { attribute:"flow", upgradesAvailable:4, increaseRatio:.5, initialCost:15, costIncrease:4, visible:true },
    refineMyCoordination: { attribute:"coordination", upgradesAvailable:4, increaseRatio:.5, initialCost:15, costIncrease:4, visible:true },
    refineMyIntegration: { attribute:"integration", upgradesAvailable:4, increaseRatio:.25, initialCost:20, costIncrease:4, visible:true },
    refineMyAmbition: { attribute:"ambition", upgradesAvailable:4, increaseRatio:.5, initialCost:5, costIncrease:4, visible:true },
    refineMyAdaptability: { attribute:"adaptability", upgradesAvailable:4, increaseRatio:.5, initialCost:5, costIncrease:3, visible:true },
    refineMyCunning: { attribute:"cunning", upgradesAvailable:4, increaseRatio:.5, initialCost:10, costIncrease:3, visible:true },
    refineMySavvy: { attribute:"savvy", upgradesAvailable:4, increaseRatio:.5, initialCost:10, costIncrease:3, visible:true },
    refineMyConfidence: { attribute:"confidence", upgradesAvailable:4, increaseRatio:.5, initialCost:5, costIncrease:4, visible:true },
    refineMyRecognition: { attribute:"recognition", upgradesAvailable:4, increaseRatio:.5, initialCost:5, costIncrease:4, visible:true },
    refineMyCharm: { attribute:"charm", upgradesAvailable:4, increaseRatio:.5, initialCost:10, costIncrease:4, visible:true },
    refineMyInfluence: { attribute:"influence", upgradesAvailable:4, increaseRatio:.5, initialCost:10, costIncrease:4, visible:true },
    refineMyDiscernment: { attribute:"discernment", upgradesAvailable:4, increaseRatio:.5, initialCost:15, costIncrease:3, visible:true },
    refineMyPulse: { attribute:"pulse", upgradesAvailable:8, increaseRatio:.25, initialCost:10, costIncrease:3, visible:true },
    refineMyVision: { attribute:"vision", upgradesAvailable:8, increaseRatio:.25, initialCost:10, costIncrease:3, visible:true },
    refineMySpark: { attribute:"spark", upgradesAvailable:8, increaseRatio:.25, initialCost:10, costIncrease:3, visible:true },
    refineMyAmplification: { attribute:"amplification", upgradesAvailable:8, increaseRatio:.25, initialCost:15, costIncrease:3, visible:true },
    refineMyControl: { attribute:"control", upgradesAvailable:8, increaseRatio:.25, initialCost:15, costIncrease:3, visible:true },
    refineMyCuriosity: { attribute:"curiosity", upgradesAvailable:4, increaseRatio:.5, initialCost:5, costIncrease:3, visible:true },
    refineMyObservation: { attribute:"observation", upgradesAvailable:4, increaseRatio:.5, initialCost:5, costIncrease:3, visible:true },
    refineMyEndurance: { attribute:"endurance", upgradesAvailable:4, increaseRatio:.5, initialCost:5, costIncrease:3, visible:true },
    refineMyNavigation: { attribute:"navigation", upgradesAvailable:2, increaseRatio:1, initialCost:5, costIncrease:10, visible:true },
    refineMyMight: { attribute:"might", upgradesAvailable:4, increaseRatio:.5, initialCost:10, costIncrease:3, visible:true },
    refineMyGeared: { attribute:"geared", upgradesAvailable:4, increaseRatio:.5, initialCost:10, costIncrease:3, visible:true },
    refineMyCourage: { attribute:"courage", upgradesAvailable:4, increaseRatio:1, initialCost:10, costIncrease:2, visible:true },
    refineMyWizardry: { attribute:"wizardry", upgradesAvailable:4, increaseRatio:.25, initialCost:15, costIncrease:4, visible:false },



    makeMoreMoney: {
        initialCost:6, costIncrease:2,
        upgradesAvailable:4,
        visible:false,
        customInfo: function(num) {
            return "Gold generation increased by "+(num >0?"another ":"")+"50%";
        }
    },
    haveBetterConversations: {
        initialCost:6, costIncrease:2,
        upgradesAvailable:4,
        visible:false,
        customInfo: function(num) {
            return "Conversation generation increased by "+(num >0?"another ":"")+"50%";
        }
    },
    createABetterFoundation: {
        initialCost:8, costIncrease:4,
        upgradesAvailable:4,
        visible:false,
        customInfo: function(num) {
            return "Motivation generation is increased by "+(num >0?"another ":"")+"25%";
        }
    },

    rememberWhatIDid: {
        initialCost:1, costIncrease:1,
        upgradesAvailable:1,
        visible:false,
        customInfo: function(num) {
            return "On each action, get 2x exp as long as the action's level is lower than the highest level ever reached." +
                " The action's highest level will be recorded on amulet use, and it will be displayed.";
        }
    },
    checkWhatScottMentioned: {
        initialCost:1, costIncrease:1,
        upgradesAvailable:1,
        visible:false,
        customInfo: function(num) {
            return Raw.html`He said something about seeing a spot of gold among the trees. 
            The birds, maybe? It might have been worth checking out.<br><br>
            Unlocks 5 new actions.<br>
            Recommended to start. 
            `
        },
        onBuy: function(num) {
            purchaseAction('watchBirds');
            purchaseAction('catchAScent');
            purchaseAction('exploreDifficultPath');
            purchaseAction('eatGoldenFruit');
            purchaseAction('journal');
        }
    },
    stopBeingSoTense: {
        initialCost:30, costIncrease:1,
        upgradesAvailable:1,
        visible:false,
        customInfo: function(num) {
            return "What was the point? I should have handled myself first."
        },
        onBuy: function(num) {
            purchaseAction('meditate');
            purchaseAction('walkAware');
        }
    },
    focusHarder: {
        initialCost:25, costIncrease:4,
        upgradesAvailable:8,
        visible:false,
        customInfo: function(num) {
            return "Increases the Focus Mult by "+(num >0?"another ":"")+"+1 (for a total of " + (num+1+2) + ")";
        },
        onBuy: function(num) {
            data.focusMult = 2 + num;
        }
    },
    rememberHowIGrew: {
        initialCost:50, costIncrease:1,
        upgradesAvailable:1,
        visible:false,
        customInfo: function(num) {
            return "On each action, get 2x exp as long as the action's level is lower than the second highest level ever reached." +
                " The action's second highest level will be recorded on amulet use, and it will be displayed.";
        }
    },
    rememberMyMastery: {
        initialCost:200, costIncrease:1,
        upgradesAvailable:1,
        visible:false,
        customInfo: function(num) {
            return "On each action, get 2x exp as long as the action's level is lower than the third highest level ever reached." +
                " The action's third highest level will be recorded on amulet use, and it will be displayed.";
        }
    }, //200|1, 2x exp to third highest

    lookCloserAtTheBoard: {
        initialCost:10, costIncrease:2,
        upgradesAvailable:2,
        visible:false,
        customInfo: function(num) {
            return "The board was stuffed with notices. Surely something else is relevant for you."
        },
        onBuy: function(num) {
            // actionData.checkNoticeBoard.maxLevel++;
            // if(num === 1) {
            //     purchaseAction('reportForTraining');
            //     purchaseAction('basicTrainingWithJohn');
            //     purchaseAction('noticeTheStrain');
            //     purchaseAction('clenchTheJaw');
            //     purchaseAction('breatheThroughIt');
            //     purchaseAction('ownTheWeight');
            //     purchaseAction('moveWithPurpose');
            //     purchaseAction('standStraighter');
            //     purchaseAction('keepGoing');
            //     purchaseAction('climbTheRocks');
            //     purchaseAction('findAShortcut');
            // } else if(num === 2) {
            //     purchaseAction('buyBasicSupplies');
            //     purchaseAction('chimneySweep');
            //     purchaseAction('handyman');
            //     purchaseAction('tavernHelper');
            //     purchaseAction('guildReceptionist');
            //     purchaseAction('messenger');
            //     purchaseAction('storyTeller');
            // }
        }
    }, //STORY notice board level 2 (training) and level 3 (jobs)
    buyNicerStuff: {
        initialCost:11, costIncrease:1,
        upgradesAvailable:1,
        visible:false,
        customInfo: function(num) {
            return "asdf"
        },
        onBuy: function(num) {
        }
    }, //STORY market
    askScottMoreQuestions: {
        initialCost:11, costIncrease:1,
        upgradesAvailable:1,
        visible:false,
        customInfo: function(num) {
            return "asdf"
        },
        onBuy: function(num) {
        }
    }, //STORY socialization
    discoverMoreOfTheWorld: {
        initialCost:11, costIncrease:1,
        upgradesAvailable:1,
        visible:false,
        customInfo: function(num) {
            return "asdf"
        },
        onBuy: function(num) {
        }
    }, //STORY travel


    //... finish up to here
    /*
    learnHowToFight: { //unlock john socialize / instruction
        initialCost:40, costIncrease:1,
        upgradesAvailable:1,
        customInfo: function(num) {
            return "TODO / doesn't work<br>Unlock new actions!<br>Story: My armor barely saved me when I was out of position. My shield disappeared " +
                "when I lost my footing. My sword frequently gets stuck and leaves my grip. The problem is not only my equipment, but how I use it.";
        }
    },
    getCombatExperience: {
        initialCost:110, costIncrease:1,
        upgradesAvailable:1,
        customInfo: function(num) {
            return "";
        }
    },
    thinkAboutWhatINeed: {
        initialCost:110, costIncrease:1,
        upgradesAvailable:1,
        customInfo: function(num) {
            return "";
        }
    },
    gainAccessToTheAcademy: {
        initialCost:110, costIncrease:1,
        upgradesAvailable:1,
        customInfo: function(num) {
            return "";
        }
    },
    learnMoreFromTheLibrary: {
        initialCost:110, costIncrease:1,
        upgradesAvailable:1,
        customInfo: function(num) {
            return "";
        }
    },
    learnMagicFromTheTowerMages: {
        initialCost:110, costIncrease:1,
        upgradesAvailable:1,
        customInfo: function(num) {
            return "";
        }
    },
    nurtureAGoodReputation: {
        initialCost:110, costIncrease:1,
        upgradesAvailable:1,
        customInfo: function(num) {
            return "";
        }
    },
    gatherBlackmailMaterial: {
        initialCost:110, costIncrease:1,
        upgradesAvailable:1,
        customInfo: function(num) {
            return "";
        }
    },
    stealMagicFromTheTowerMages: {
        initialCost:110, costIncrease:1,
        upgradesAvailable:1,
        customInfo: function(num) {
            return "";
        }
    },
    wieldMyNaturalMagic: {
        initialCost:110, costIncrease:1,
        upgradesAvailable:1,
        customInfo: function(num) {
            return "";
        }
    },
    wieldMyMagicNaturally: {
        initialCost:110, costIncrease:1,
        upgradesAvailable:1,
        customInfo: function(num) {
            return "";
        }
    },
    gatherArtifcatsOfPower: {
        initialCost:110, costIncrease:1,
        upgradesAvailable:1,
        customInfo: function(num) {
            return "";
        }
    },
    leadTheCharge: { //win
        initialCost:110, costIncrease:1,
        upgradesAvailable:1,
        customInfo: function(num) {
            return "";
        }
    },
*/


}