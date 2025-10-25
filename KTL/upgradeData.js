

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

        dataObj.creationVersion = dataObj.creationVersion ?? 0;
        dataObj.title = dataObj.title || decamelizeWithSpace(upgradeVar);

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
            return Raw.html`Overclock gains a flat +${["5", "20 (currently 5)", "50 (currently 20)", 50][num]} momentum per second.`
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


    feelTheEchoesOfTheBurntTown: {
        initialCost:20, costIncrease:2, creationVersion:2,
        upgradesAvailable:3,
        visible:true,
        customInfo: function(num) {
            switch(num) {
                case 0:
                case 1:
                case 2:
                default:
                    return "Unlocks new actions that use Momentum"
            }
        },
        onBuy: function(num) {
            if(num === 1) {
                purchaseAction('feelAGentleTug')
                purchaseAction('leaveTheOpenRoad')
                purchaseAction('findOverlook')
                purchaseAction('discoverBurntTown')
                purchaseAction('feelTheDespair')
                purchaseAction('repairShatteredShrine')
            } else if(num === 2) {
                purchaseAction('stepThroughAsh')
                purchaseAction('graspTheTragedy')
                purchaseAction('processEmotions')
                purchaseAction('readTheWritten')
                purchaseAction('siftExcess')
            } else if(num === 3) {
                purchaseAction('resonanceCompass')
                purchaseAction('clearIvyWall')
                purchaseAction('findPulsingShard')
                purchaseAction('scavengeForSupplies')
                unveilUpgrade('learnFromTheLibrary')
            }
        }
    },
    learnFromTheLibrary: {
        initialCost:200, costIncrease:2, creationVersion:2,
        upgradesAvailable:5,
        visible:false,
        customInfo: function(num) {
            return "Unlocks new actions that use Research, and new spells"
        },
        onBuy: function(num) {
            if(num === 1) {
                purchaseAction('skimAHeavyTome')
                purchaseAction('clearRubble')
                purchaseAction('readFadedMarkers')
                purchaseAction('mapOutTraps')
                purchaseAction('accessForbiddenArea')
                purchaseAction('collectSpellBooks')

                purchaseAction('readBooks')
                purchaseAction('catalogNewBooks')
                purchaseAction('study')
                purchaseAction('researchBySubject')

                purchaseAction('studyMagic')

                purchaseAction('studySupportSpells')
                purchaseAction('studyEarthMagic')
                purchaseAction('stoneCompression')
                purchaseAction('digFoundation')

                purchaseAction('shapeBricks')
                unveilUpgrade('keepMyMagicReady')
                unveilUpgrade('trainTogetherMore');
            } else if(num === 2) {
                purchaseAction('findAFamiliarLanguage')
                purchaseAction('searchForRelevantBooks')
                purchaseAction('collectInterestingBooks')
                purchaseAction('collectHistoryBooks')

                purchaseAction('studyHistory')
                purchaseAction('readOldStories')
                purchaseAction('readWarJournals')

                purchaseAction('reviewOldMemories')
                purchaseAction('rememberFriends')
                purchaseAction('rememberTheWar')

                purchaseAction('studyPracticalMagic')
                purchaseAction('tidyMagesmithShop')
                purchaseAction('clearTheBasement')
            } else if(num === 3) {
                data.actions.collectHistoryBooks.maxLevel = 7;
                purchaseAction('readOldReligiousTexts')
                purchaseAction('readOldPoetry')
                purchaseAction('readOldProphecies')
                purchaseAction('readOldPhilosophy')
                purchaseAction('honorTheLost')
                purchaseAction('letGoOfGuilt')
            } else if(num === 4) {
                purchaseAction('complainAboutDifficulty')
                purchaseAction('browseFantasyNovels')

                purchaseAction('collectMathBooks')

                purchaseAction('studyMath')
                purchaseAction('studyCryptology')

                purchaseAction('decipherOrganization')
                purchaseAction('recognizeRunicLanguages')
                purchaseAction('catalogUnknownLanguages')

                purchaseAction('studyAdvancedEarthMagic')

                purchaseAction('moldBarsFromScrap')
                purchaseAction('mendGearCracks')
                purchaseAction('assistantMagesmith')
            } else if(num === 5) {
                data.actions.collectMathBooks.maxLevel = 5; //each level increases catalognewbooks
                purchaseAction('studyArchitecture')
                purchaseAction('expandPersonalLibrary')

                purchaseAction('dismantleShelves')
                purchaseAction('markTheLayout')

                purchaseAction('comprehendDifficultTexts')
                purchaseAction('clearTheDust')

                purchaseAction('examineTheArchitecture')
                purchaseAction('pryGemLoose')
                
                purchaseAction('studyAdvancedPracticalMagic')
                purchaseAction('unblemish')
                purchaseAction('manaTransfer')

            }
        }
    },
    investMyGold: {
        initialCost:20, costIncrease:2, creationVersion:2,
        upgradesAvailable:6,
        visible:true,
        customInfo: function(num) {
            switch(num) {
                case 0:
                    return "Unlocks new actions for converting gold into fortune"
                case 1:
                    return "Unlocks an action for using fortune to build fortune, and an action for attributes"
                case 2:
                case 3:
                case 4:
                case 5:
                    return "Unlocks new actions for using fortune"
                default:
                    return "Unlocks new actions that use Fortune, generated from Gold"
            }
        },
        onBuy: function(num) {
            if(num === 1) {
                purchaseAction('invest');
                purchaseAction('buildFortune');
                purchaseAction('spendFortune');
                unveilUpgrade('increaseInitialInvestment')
            } else if(num === 2) {
                purchaseAction('reinvest')
                purchaseAction('investInLocals')
                purchaseAction('townCrier')
                purchaseAction('storyTeller')
                unveilUpgrade('buyNicerStuff')
            } else if(num === 3) {
                purchaseAction('hostAFestival')
                purchaseAction('fundTownImprovements')
                purchaseAction('browsePersonalCollection')
                purchaseAction('buyUtilityItems')
                unveilUpgrade('refineMyLeverage')
                unveilUpgrade('increaseMarketCap')
            } else if(num === 4) {
                purchaseAction('supportLocalLibrary')
                purchaseAction('expandLocalLibrary')
                purchaseAction('investInSelf')
                unveilUpgrade('retrieveMyUnusedResources')
            } else if(num === 5) {
                purchaseAction('makeAPublicDonation')
                purchaseAction('fundASmallStall')
                purchaseAction('purchaseALot')
            } else if(num === 6) {
                purchaseAction('buildPersonalLibrary')
                purchaseAction('recruitACarpenter')
                purchaseAction('procureQualityWood')
            }
        }
    },
    increaseInitialInvestment: {
        initialCost:40, costIncrease:1.5, creationVersion:2,
        upgradesAvailable:5,
        visible:false,
        customInfo: function(num) {
            return Raw.html`Invest's base Fortune gain increases to ${["2 (currently 1)", "5 (currently 2)", "10 (currently 5)", "20 (currently 10)", "50 (currently 20)", "50"][num]}.`
        },
        currentValue: function() {
            return [1, 2, 5, 10, 20, 50][data.upgrades.increaseInitialInvestment.upgradePower];
        }
    },
    increaseMarketCap: {
        initialCost:200, costIncrease:1.5, creationVersion:2,
        upgradesAvailable:5,
        visible:false,
        customInfo: function(num) {
            return Raw.html`Invest's maximum fotune gain cap increases to ${["1e7 (currently 1e5)", "1e9 (currently 1e7)", "1e11 (currently 1e9)", "1e13 (currently 1e11)", "1e15 (currently 1e13)", "1e15"][num]}.`
        },
        currentValue: function() {
            return [1e5, 1e7, 1e9, 1e11, 1e13, 1e15][data.upgrades.increaseMarketCap.upgradePower];
        }
    },
    buyNicerStuff: {
        initialCost:70, costIncrease:3, creationVersion:2,
        upgradesAvailable:4,
        visible:false,
        customInfo: function(num) {
            return "Unlocks new actions that use Gold"
        },
        onBuy: function(num) {
            if(num === 1) {
                purchaseAction('buyComfyShoes')
                purchaseAction('buyTravelersGear')
            } else if(num === 2) {
                purchaseAction('buyArtisanFood')
                purchaseAction('buyPotions')
            } else if(num === 3) {
                purchaseAction('buyTools')
                purchaseAction('buyCart')
            }
        }
    },
    improveMyHouse: {
        initialCost:400, costIncrease:3, creationVersion:2,
        upgradesAvailable:3,
        visible:false,
        customInfo: function(num) {
            return "Unlocks new actions that use Gold"
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
    askAboutBetterWork: {
        initialCost:30, costIncrease:1, creationVersion:2,
        upgradesAvailable:1,
        visible:false,
        customInfo: function(num) {
            return "Unlocks a new job, after asking for it"
        },
        onBuy: function(num) {
            if(num === 1) {
                purchaseAction('askAboutLocalWork')
                purchaseAction('worksiteSweeper')
            }
        }
    },

    fightAlongsideAllies: {
        initialCost:30, costIncrease:1, creationVersion:2,
        upgradesAvailable:1,
        visible:true,
        customInfo: function(num) {
            return "Unlocks new actions that use Conversations, and results in a better KTL reset"
        },
        onBuy: function(num) {
            purchaseAction('learnToInquire')
            purchaseAction('talkToTheRecruiters')
            purchaseAction('buyPointyHat')
            purchaseAction('askAboutArcaneCorps')
            purchaseAction('getTestedForKnowledge')
            purchaseAction('discussPlacement')
            purchaseAction('meetTheMages')
            purchaseAction('trainWithTeam')
            unveilUpgrade('askAboutBetterWork');
        }
    },
    trainTogetherMore: {
        initialCost:400, costIncrease:2, creationVersion:2,
        upgradesAvailable:3,
        visible:false,
        customInfo: function(num) {
            return "Increases max level of Train With Team by 1"
        },
        onBuy: function(num) {
            actionData.trainWithTeam.maxLevel = 2 + num;
        }
    },
    keepMyMagicReady: {
        initialCost:100, costIncrease:1, creationVersion:2,
        upgradesAvailable:1,
        visible:false,
        customInfo: function(num) {
            return Raw.html`The Spell Power used in KTL becomes the highest you've ever reached, instead of the current value.`;
        }
    },
    retrieveMyUnusedResources: {
        initialCost:500, costIncrease:1.5, creationVersion:2,
        upgradesAvailable:4,
        visible:false,
        customInfo: function(num) {
            return `Retrieve 10 + ${[.1, .2, .5][num]}% of current resource per second on all actions that are dimmed (max level, no resource increase or decrease). Skips Reinvest.`;
        },
    },
    createABetterFoundation: {
        initialCost:500, costIncrease:1.5, creationVersion:2,
        upgradesAvailable:4,
        visible:false,
        customInfo: function(num) {
            return "Momentum generation increased by "+(num >0?"another ":"")+"x1.1, multiplicative";
        },
    },
    workHarder: {
        initialCost:600, costIncrease:1.5, creationVersion:2,
        upgradesAvailable:4,
        visible:false,
        customInfo: function(num) {
            return "Info"
        },
        onBuy: function(num) {
            return "Gold generation increased by "+(num >0?"another ":"")+"x1.5, multiplicative";
        }
    },
    haveBetterConversations: {
        initialCost:800, costIncrease:1.5, creationVersion:2,
        upgradesAvailable:4,
        visible:false,
        customInfo: function(num) {
            return "Conversation generation increased by "+(num >0?"another ":"")+"x1.25, multiplicative";
        },
    },
    sparkMoreMana: {
        initialCost:800, costIncrease:2, creationVersion:2,
        upgradesAvailable:4,
        visible:false,
        customInfo: function(num) {
            return "Mana generation increased by "+(num >0?"another ":"")+"x1.25, multiplicative";
        },
    },
    studyHarder: {
        initialCost:1000, costIncrease:1.5, creationVersion:2,
        upgradesAvailable:4,
        visible:false,
        customInfo: function(num) {
            return "Research generation increased by "+(num >0?"another ":"")+"x1.25, multiplicative";
        },
    },


    rememberWhatIDid: {
        initialCost:600, costIncrease:1, creationVersion:2,
        upgradesAvailable:1,
        visible:false,
        customInfo: function(num) {
            return "When you use the amulet, the highest levels achieved on non-KTL actions and generators are recorded. Gain +25% more exp up to the highest level reached. Note: non-generators do not carry over exp into their next level.";
        },
        onBuy: function(num) {
            unveilUpgrade('rememberHowIGrew')
        }
    },
    rememberHowIGrew: {
        initialCost:2000, costIncrease:1, creationVersion:2,
        upgradesAvailable:1,
        visible:false,
        customInfo: function(num) {
            return "When you use the amulet, the second highest levels achieved on non-KTL actions and generators are recorded. Gain +25% additive more exp up to the second highest level reached. Note: non-generators do not carry over exp into their next level.";
        },
        onBuy: function(num) {
            unveilUpgrade('rememberMyMastery')
        }
    },
    rememberMyMastery: {
        initialCost:6000, costIncrease:1, creationVersion:2,
        upgradesAvailable:1,
        visible:false,
        customInfo: function(num) {
            return "When you use the amulet, the third highest levels achieved on non-KTL actions and generators are recorded. Gain +50% additive more exp up to the third highest level reached. Note: non-generators do not carry over exp into their next level.";
        }
    },


    stopBeingSoTense: {
        initialCost:500, costIncrease:1, creationVersion:2,
        upgradesAvailable:1,
        visible:false,
        customInfo: function(num) {
            return "Unlock 2 actions that use momentum"
        },
        onBuy: function(num) {
            purchaseAction('standStraighter'); //1e31
            purchaseAction('walkAware'); //1e35
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
    refineMyLeverage: { attribute:"leverage", upgradesAvailable:4, increaseRatio:.5, initialCost:100, costIncrease:3, visible:false, creationVersion:2 },
    refineMyWizardry: { attribute:"wizardry", upgradesAvailable:4, increaseRatio:.25, initialCost:200, costIncrease:4, visible:true, creationVersion:2 },

    //... finish up to here
    /*

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


}