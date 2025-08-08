

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

function initializeAmuletCards() {
    const container = document.getElementById("amuletUpgrades");
    container.style.cssText = "display:flex;flex-wrap:wrap;gap:15px;padding:10px;";
    let allCardsHTML = "";

    for (const upgradeVar in data.upgrades) {
        const upgrade = data.upgrades[upgradeVar];
        const upgradeDataObj = upgradeData[upgradeVar];

        const numBought = upgrade.upgradesBought;
        const remaining = upgrade.upgradesAvailable - numBought;
        const isFullyBought = remaining === 0;
        const nextLevelToBuy = numBought;

        const cardId = `card_${upgradeVar}`;
        const descriptionId = `description_${upgradeVar}`;
        const costId = `cost_${upgradeVar}`;
        const remainingId = `remaining_${upgradeVar}`;
        const buyButtonSectionId = `buyButtonSection_${upgradeVar}`;
        const costSectionId = `costSection_${upgradeVar}`;
        const remainingSectionId = `remainingSection_${upgradeVar}`;
        const maxLevelSectionId = `maxLevelSection_${upgradeVar}`;

        queueCache(cardId);
        queueCache(descriptionId);
        queueCache(costId);
        queueCache(remainingId);
        queueCache(buyButtonSectionId);
        queueCache(costSectionId);
        queueCache(remainingSectionId);
        queueCache(maxLevelSectionId);

        const title = upgradeDataObj.title || `...${decamelize(upgradeVar)}`;
        let text = !upgradeDataObj.attribute ? upgradeDataObj.customInfo(upgrade.upgradesBought) :
            attributeUpgradeInfo(upgradeDataObj.attribute, upgrade.upgradesAvailable, upgrade.upgradesBought, upgrade.increaseRatio);
        const cost = isFullyBought ? 0 : calcUpgradeCost(upgrade, nextLevelToBuy);

        const cardStyle = `background-color:#2c2c3e;border:2px solid ${isFullyBought ? '#c3cd00':'#00cd41'};border-radius:8px;padding:12px;width:280px;display:${upgrade.visible ? "flex" : "none"};
            flex-direction:column;justify-content:space-between;box-shadow:0 4px 8px rgba(0,0,0,0.2);color:#e0e0e0;`;
        const buyButtonHTML = `<button style="background-color:#008c33;color:white;border:none;border-radius:5px;padding:8px 16px;font-weight:bold;cursor:pointer;" onClick="buyUpgrade('${upgradeVar}')">Buy</button>`;
        const maxLevelHTML = `<span style="font-size:14px;color:#c3cd00;font-weight:bold;">MAX LEVEL</span>`;
        const remainingHTML = `Remaining: <span id="${remainingId}">${remaining}</span>`;

        allCardsHTML += Raw.html`
            <div id="${cardId}" style="${cardStyle}">
                <div>
                    <div style="font-size:16px;font-weight:bold;margin-bottom:10px;color:#ffffff;">${title}</div>
                    ${!upgradeDataObj.attribute?"":`<img id="${upgradeDataObj.attribute}DisplayContainer" src="img/${upgradeDataObj.attribute}.svg" alt="${upgradeDataObj.attribute}" 
                        style="margin:1px;width:50px;height:50px;vertical-align:top;background:var(--text-bright);border:1px solid black;display:inline-block;" />`}
                    <div id="${descriptionId}" style="display:inline-block;font-size:14px;flex-grow:1;margin-bottom:15px;${!upgradeDataObj.attribute?"":"width:70%"}">${text}</div>
                </div>
                <div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div id="${costSectionId}" style="display:flex;align-items:baseline;visibility:${isFullyBought ? 'hidden':'visible'};">
                            <span style="font-size:14px;margin-right:8px;">cost:</span>
                            <span id="${costId}" style="font-size:24px;font-weight:bold;color:#ffffff;">${cost} AC</span>
                            <span style="font-size:14px;color:#a0a0a0;margin-left:8px;">(x${upgradeDataObj.costIncrease})</span>
                        </div>
                        <div id="${buyButtonSectionId}" style="display:${isFullyBought ? 'none' : 'block'};">${buyButtonHTML}</div>
                        <div id="${maxLevelSectionId}" style="display:${isFullyBought ? 'block' : 'none'};">${maxLevelHTML}</div>
                    </div>
                    <div id="${remainingSectionId}" style="justify-content:flex-end;align-items:center;margin-top:4px;font-size:14px;color:#a0a0a0;display:${isFullyBought ? 'none' : 'flex'};">
                        ${remainingHTML}
                    </div>
                </div>
            </div>`;
    }
    container.innerHTML = allCardsHTML;
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
    upgrade.upgradePower++; //may be something else later

    if (upgradeDataObj.onBuy) {
        upgradeDataObj.onBuy(upgrade.upgradePower);
    }
    if(upgradeDataObj.attribute) {
        attributeUpgradeOnBuy(upgradeDataObj.attribute, upgrade.upgradesBought, upgrade.increaseRatio);
    }

    const newRemaining = upgrade.upgradesAvailable - upgrade.upgradesBought;
    upgrade.isFullyBought = newRemaining === 0;

    const cardId = `card_${upgradeVar}`;
    const descriptionId = `description_${upgradeVar}`;
    const costId = `cost_${upgradeVar}`;
    const remainingId = `remaining_${upgradeVar}`;
    const buyButtonSectionId = `buyButtonSection_${upgradeVar}`;
    const costSectionId = `costSection_${upgradeVar}`;
    const remainingSectionId = `remainingSection_${upgradeVar}`;
    const maxLevelSectionId = `maxLevelSection_${upgradeVar}`;
    let text = !upgradeDataObj.attribute ? upgradeDataObj.customInfo(upgrade.upgradesBought) :
        attributeUpgradeInfo(upgradeDataObj.attribute, upgrade.upgradesAvailable, upgrade.upgradesBought, upgrade.increaseRatio);
    views.updateVal(descriptionId, text, 'textContent');

    if (upgrade.isFullyBought) {
        views.updateVal(costSectionId, 'hidden', 'style.visibility');
        views.updateVal(buyButtonSectionId, 'none', 'style.display');
        views.updateVal(remainingSectionId, 'none', 'style.display');
        views.updateVal(maxLevelSectionId, 'block', 'style.display');
        views.updateVal(cardId, '#c3cd00', 'style.borderColor');
    } else {
        const newCost = calcUpgradeCost(upgrade, upgrade.upgradesBought);
        views.updateVal(costId, `${newCost} AC`, 'textContent');
        views.updateVal(remainingId, newRemaining, 'textContent');
    }
    updateCardAffordabilityBorders();
}

function attributeUpgradeInfo(attVar, upgradesAvailable, upgradeNum, increaseRatio) {
    // console.log(attVar, upgradesAvailable, upgradeNum, increaseRatio);
    const attributeName = capitalizeFirst(attVar);
    const possessiveName = attributeName.endsWith('s')
        ? `${attributeName}'`
        : `${attributeName}'s`;

    if (upgradeNum >= upgradesAvailable) {
        const maxMultiplier = 1 + upgradesAvailable * increaseRatio;
        return `The bonus multiplier to ${possessiveName}is x${maxMultiplier.toFixed(2)}`;
    }

    const currentMultiplier = 1 + upgradeNum * increaseRatio;
    const nextMultiplier = 1 + (upgradeNum + 1) * increaseRatio;
    return `Increase ${possessiveName} bonus multiplier to x${nextMultiplier.toFixed(2)} (Currently: x${currentMultiplier.toFixed(2)})`;
}

function attributeUpgradeOnBuy(attVar, upgradeNum, increaseRatio) {
    data.atts[attVar].attUpgradeMult = 1 + (upgradeNum * increaseRatio);
    recalcAttMult(attVar);
}

function toggleMaxLevelCards(show) {
    const displayStyle = show ? 'flex' : 'none';
    for (const upgradeVar in data.upgrades) {
        const upgrade = data.upgrades[upgradeVar];
        if (upgrade.isFullyBought && upgrade.visible) {
            const cardId = `card_${upgradeVar}`;
            views.updateVal(cardId, !upgrade.visible?"none":displayStyle, 'style.display');
        }
    }
}
function toggleAttributeUpgrades(show) {
    const displayStyle = show ? 'flex' : 'none';
    for (const upgradeVar in data.upgrades) {
        const upgrade = data.upgrades[upgradeVar];
        const upgradeDataObj = upgradeData[upgradeVar];
        if (upgradeDataObj.attribute) {
            const cardId = `card_${upgradeVar}`;
            views.updateVal(cardId, !upgrade.visible?"none":displayStyle, 'style.display');
        }
    }
}
function toggleUnaffordableUpgrades(show) {
    const displayStyle = show ? 'flex' : 'none';
    for (const upgradeVar in data.upgrades) {
        const upgrade = data.upgrades[upgradeVar];
        if (calcUpgradeCost(upgrade, upgrade.upgradesBought) > data.ancientCoin ) {
            const cardId = `card_${upgradeVar}`;
            views.updateVal(cardId, !upgrade.visible?"none":displayStyle, 'style.display');
        }
    }
}

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
        }
    },
    knowWhenToMoveOn: {
        initialCost:2, costIncrease:2,
        upgradesAvailable:1,
        visible:true,
        customInfo: function(num) {
            return Raw.html`[Automation] When an action is at its max level and has no downstream actions with sliders, it 
                automatically set the flow rate leading to it to 0%. This will apply recursively.`
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