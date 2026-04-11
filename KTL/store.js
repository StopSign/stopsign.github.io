//Runs in menu.js
function createShopMenu() {
    let toReturn = ""
    if(!isSteam) {
        toReturn = `
        <div class="menuTitle">Shop</div>
        Please load the game on steam to receive the daily Soul Coins, as well as have the ability to use them for various upgrades and bonuses!<br>
        <div class="menuSeparator"></div>
`
    } else {
        queueCache("soulCoinAmount")
        queueCache("dailyBonusMessage")
        queueCache("dailyBonusButton")

        queueCache("momentumGainTimer")
        queueCache("currencyGainTimer")

        toReturn = `
        <span id="shopContainer">
            You have <span id="soulCoinAmount"></span> Soul Coins.<br>
            <span id="dailyBonusMessage">Daily bonus ready in 23hr...</span>
            <span class="button" id="dailyBonusButton" onclick="dailyBonus()">Receive Daily Bonus of 25 SC</span>
            <div class="menuSeparator"></div>
            <span class="button" onClick="window.steamAPI.buyItem(100)">Buy 1000 Soul Coins for $4.99</span><br><br>
            <span class="button" onClick="window.steamAPI.buyItem(101)">Buy 2200 (+10% bonus!) Soul Coins for $9.99</span><br><br>
            <span class="button" onClick="window.steamAPI.buyItem(102)">Buy 4800 (+20% bonus!) Soul Coins for $19.99</span><br><br>
            <span id="shopOutputMessage"></span><br>
            Click Check Purchases to receive any purchased Soul Coins. The process is not automatic, but after clicking you will receive your soul coins within a few seconds.<br><br>
            <span class="button" id="refresh-purchases-btn" onClick="requestManualSweep()">Check Purchases</span><br><br>
    
            ${createShopUpgrades()}
        </span>`
    }

    return toReturn
}

//click button / use charge
function dailyBonus() {
    if(data.currentGameState.dailyCharges > 0) {
        if(data.currentGameState.dailyCharges === (data.shopUpgrades.dailyBonusCharges.upgradePower+1)) {
            data.currentGameState.dailyTimer = 1000 * 60 * 60 * 23;
        }
        data.soulCoins += 25 + data.shopUpgrades.increaseDailyBonus.upgradePower * 5;
        data.totalDailySoulCoins += 25 + data.shopUpgrades.increaseDailyBonus.upgradePower * 5;
        data.currentGameState.dailyCharges--;

        refreshShopUpgrades()
        checkDailyTimer()
    }
}

//updates UI and applies charges
function checkDailyTimer() {
    if(!isSteam) {
        return;
    }
    //convert to charges
    while(data.currentGameState.dailyTimer <= 0 && data.currentGameState.dailyCharges < (data.shopUpgrades.dailyBonusCharges.upgradePower+1)) {
        data.currentGameState.dailyCharges++;
        data.currentGameState.dailyTimer += 1000 * 60 * 60 * 23;
    }
    if(data.currentGameState.dailyTimer <= 0) { //waste extra, if charges are full
        data.currentGameState.dailyTimer = 0;
    }
    if(data.currentGameState.dailyCharges > 0) { //show button if ready
        views.updateVal('dailyBonusButton', "", "style.display")
    } else {
        views.updateVal('dailyBonusButton', "none", "style.display")
    }

    let atMaxCharges = data.currentGameState.dailyCharges === (data.shopUpgrades.dailyBonusCharges.upgradePower + 1)
    views.updateVal('dailyBonusMessage', `Daily Bonus: ${data.currentGameState.dailyCharges} / ${data.shopUpgrades.dailyBonusCharges.upgradePower+1}.  
    ${!atMaxCharges ? `Next ready in ${secondsToTime(data.currentGameState.dailyTimer/1000)}. ` : `Currently at max charges.`}`, "textContent")
    views.updateVal('dailyBonusButton', `Receive ${25 + data.shopUpgrades.increaseDailyBonus.upgradePower * 5}`, "textContent")
}

function initializeShopData() {
    for (let shopVar in shopUpgrades) {
        const shopDataObj = shopUpgrades[shopVar];

        // Initialize data.shopUpgrades defaults
        if (!data.shopUpgrades[shopVar]) {
            data.shopUpgrades[shopVar] = {
                upgradePower: 0,
                numConsumable: 0,
                visible: shopDataObj.visible !== undefined ? shopDataObj.visible : true
            };
        }
    }
}

function createShopUpgrades() {
    let html = "";

    for (let shopVar in shopUpgrades) {
        const shopDataObj = shopUpgrades[shopVar];
        const shopObj = data.shopUpgrades[shopVar];
        const title = shopDataObj.title || decamelizeWithSpace(shopVar);
        const description = shopDataObj.getDescription ? shopDataObj.getDescription() : "";

        let itemsHtml = "";

        if (shopDataObj.consumable) {
            itemsHtml = `
                <div style="display: flex; gap: 16px; align-items: center; padding-bottom: 8px;">
                    <div id="shop-owned-${shopVar}" style="font-weight: bold;">Owned: ${shopObj.numConsumable}</div>
                    <button id="shop-buy-btn-${shopVar}" class="button" onclick="buyShopUpgrade('${shopVar}')">${shopDataObj.initialCost} SC</button>
                    <button id="shop-use-btn-${shopVar}" class="button" onclick="useShopConsumable('${shopVar}')">Use</button>
                </div>
            `;
        } else {
            let loopHtml = "";
            for (let i = 0; i < shopDataObj.upgradesAvailable; i++) {
                let effectText = shopDataObj.getEffectText ? shopDataObj.getEffectText(i) : "";
                let cost = calcShopUpgradeCost(shopVar, i);

                loopHtml += `
                    <div id="shop-item-${shopVar}-${i}" style="display: flex; flex-direction: column; align-items: center; min-width: max-content; padding: 4px; border-radius: 4px;">
                        <div style="margin-bottom: 4px;">${effectText}</div>
                        <button id="shop-btn-${shopVar}-${i}" class="button" onclick="buyShopUpgrade('${shopVar}')">${cost} SC</button>
                        <div id="shop-bought-txt-${shopVar}-${i}" style="display: none; font-size: 0.8em; font-weight: bold; margin-top: 4px;">Bought</div>
                    </div>
                `;
            }
            itemsHtml = `<div style="display: flex; overflow-x: auto; gap: 16px; padding-bottom: 8px;">${loopHtml}</div>`;
        }

        html += `
            <div id="shop-row-${shopVar}" style="position: relative; margin-bottom: 24px;">
                <div id="shop-content-${shopVar}" style="background-color: var(--world-0-bg-tertiary); padding: 8px; border-radius: 4px;">
                    <div style="font-size: 1.2em; font-weight: bold;">${title}</div>
                    <div style="font-size: 0.9em; margin-bottom: 12px;">${description}</div>
                    ${itemsHtml}
                </div>
                
                <div id="shop-overlay-${shopVar}" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(30, 30, 46, 0.95); z-index: 10; align-items: center; justify-content: center; border-radius: 4px;">
                    <span style="font-weight: bold; opacity: 1; color: white;">${shopDataObj.unlockText || ""}</span>
                </div>
            </div>
        `;
    }

    return html;
}

function refreshShopUpgrades() {
    if(!isSteam) {
        return;
    }
    document.getElementById(`soulCoinAmount`).textContent = Math.floor(data.soulCoins)+"";

    for (let shopVar in data.shopUpgrades) {
        const shopObj = data.shopUpgrades[shopVar];
        const shopDataObj = shopUpgrades[shopVar];

        const overlayEl = document.getElementById(`shop-overlay-${shopVar}`);
        if (!overlayEl) continue;

        if (shopObj.visible === false) {
            overlayEl.style.display = "flex";
        } else {
            overlayEl.style.display = "none";
        }

        if (shopDataObj.consumable) {
            // Refresh Consumables
            const ownedTxt = document.getElementById(`shop-owned-${shopVar}`);
            const buyBtn = document.getElementById(`shop-buy-btn-${shopVar}`);
            const useBtn = document.getElementById(`shop-use-btn-${shopVar}`);

            if (ownedTxt) ownedTxt.innerText = `Owned: ${shopObj.numConsumable}`;

            if (buyBtn) {
                if (data.soulCoins >= shopDataObj.initialCost) {
                    buyBtn.style.borderColor = "yellow";
                    buyBtn.disabled = false;
                    useBtn.cursor = "auto";
                } else {
                    buyBtn.style.borderColor = "red";
                    useBtn.cursor = "pointer";
                }
            }

            if (useBtn) {
                if (shopObj.numConsumable > 0) {
                    useBtn.style.borderColor = "yellow";
                    useBtn.disabled = false;
                    useBtn.cursor = "pointer";
                    useBtn.style.opacity = "1";
                } else {
                    useBtn.style.borderColor = "red";
                    useBtn.disabled = true;
                    useBtn.cursor = "auto";
                    useBtn.style.opacity = "0.6";
                }
            }
        } else {
            // Refresh Standard Upgrades
            for (let i = 0; i < shopDataObj.upgradesAvailable; i++) {
                const itemCont = document.getElementById(`shop-item-${shopVar}-${i}`);
                const btn = document.getElementById(`shop-btn-${shopVar}-${i}`);
                const boughtTxt = document.getElementById(`shop-bought-txt-${shopVar}-${i}`);

                if (!itemCont || !btn) continue;

                let cost = calcShopUpgradeCost(shopVar, i);

                // Reset styles
                itemCont.style.opacity = "1";
                itemCont.style.backgroundColor = "transparent";
                btn.disabled = true;
                boughtTxt.style.display = "none";
                btn.cursor = "pointer";

                if (i < shopObj.upgradePower) {
                    itemCont.style.opacity = "0.6";
                    itemCont.style.backgroundColor = "rgba(0, 255, 0, 0.1)";
                    btn.style.borderColor = "green";
                    boughtTxt.style.display = "block";
                    btn.cursor = "auto";
                } else if (i === shopObj.upgradePower) {
                    if (data.soulCoins >= cost) {
                        btn.style.borderColor = "yellow";
                        btn.disabled = false;
                    } else {
                        btn.style.borderColor = "red";
                    }
                } else {
                    itemCont.style.backgroundColor = "rgba(0,0,0,0.1)";
                    itemCont.style.opacity = "0.6";
                    btn.style.borderColor = "red";
                    btn.cursor = "auto";
                }
            }
        }
    }
}

function buyShopUpgrade(shopVar) {
    const shopObj = data.shopUpgrades[shopVar];
    const shopDataObj = shopUpgrades[shopVar];

    if (shopDataObj.consumable) {
        let cost = shopDataObj.initialCost;
        if (data.soulCoins >= cost) {
            data.soulCoins -= cost;
            shopObj.numConsumable++;
            refreshShopUpgrades();
        }
    } else {
        let currentPower = shopObj.upgradePower;
        if (currentPower >= shopDataObj.upgradesAvailable) return;

        let cost = calcShopUpgradeCost(shopVar, currentPower);
        if (data.soulCoins >= cost) {
            data.soulCoins -= cost;
            shopObj.upgradePower++;
            if (shopDataObj.onBuy) shopDataObj.onBuy(currentPower);
            refreshShopUpgrades();
        }
    }
}

function useShopConsumable(shopVar) {
    const shopObj = data.shopUpgrades[shopVar];
    const shopDataObj = shopUpgrades[shopVar];

    if (shopObj.numConsumable > 0) {
        shopObj.numConsumable--;
        shopObj.upgradePower++;

        if (shopDataObj.onBuy) shopDataObj.onBuy(shopVar);

        refreshShopUpgrades();
    }
}

function revealShopUpgrade(shopVar) {
    if (data.shopUpgrades[shopVar]) {
        data.shopUpgrades[shopVar].visible = true;
        refreshShopUpgrades();
    }
}

function calcShopUpgradeCost(shopVar, num) {
    const shopDataObj = shopUpgrades[shopVar];

    // Consumables have a static cost
    if (shopDataObj.consumable || num === 0) return shopDataObj.initialCost;

    if (shopDataObj.additiveIncrease) {
        return shopDataObj.initialCost + (shopDataObj.costIncrease * num);
    }
    return Math.floor(shopDataObj.initialCost * Math.pow(shopDataObj.costIncrease, num));
}

function checkShopUnlocks() {
    if(!isSteam) {
        return;
    }
    if(data.doneAmulet) {
        revealShopUpgrade("extraLegacy")
        revealShopUpgrade("extraAncientCoins")
        revealShopUpgrade("extraAncientWhispers")
    }
    if(data.lichKills > 0 || data.genesisResets > 0) {
        revealShopUpgrade("extraLifeEnergy")
        revealShopUpgrade("extraEssence")
    }
    if(data.upgrades.rememberWhatIFocusedOn.upgradePower > 0) {
        revealShopUpgrade("autoSelectPermanentFocus")
    }
}

//To be run after load or after some upgrades are bought
function applyShopEffects() {
    data.maxFocusAllowed = 2 + data.shopUpgrades.moreFocusBars.upgradePower;
    document.getElementById("focusButtonContainer").style.display = data.shopUpgrades.autoSelectPermanentFocus.upgradePower > 0 ? "" : "none";
    document.getElementById("lowestFocusButton").style.display = data.shopUpgrades.autoSelectPermanentFocus.upgradePower > 1 ? "" : "none";
    if(data.shopUpgrades.convert60Minutes.upgradePower > 0) {
        document.getElementById("skipTime60").style.display = "";
    }
    if(data.shopUpgrades.extraGameSpeed.upgradePower > 0) {
        document.getElementById("clockSpeedIncreaseContainer").style.display = "";
        document.getElementById("clockSpeedIncrease").textContent = 1 + (data.shopUpgrades.extraGameSpeed.upgradePower * 0.1)+"";
    }
}

function reduceShopTimers(time) {
    data.shopUpgrades.currencyGainPotion.upgradePower -= time
    if(data.shopUpgrades.currencyGainPotion.upgradePower < 0) {
        data.shopUpgrades.currencyGainPotion.upgradePower = 0;
    }
    data.shopUpgrades.momentumGainPotion.upgradePower -= time
    if(data.shopUpgrades.momentumGainPotion.upgradePower < 0) {
        data.shopUpgrades.momentumGainPotion.upgradePower = 0;
    }
}

let shopUpgrades = {
    increaseDailyBonus: {
        initialCost: 50, costIncrease: 10, additiveIncrease: true, creationVersion: 9,
        upgradesAvailable: 5,
        visible: true,
        unlockText: "",
        getDescription: function () {
            return "Increase Daily Bonus' Soul Coin gain +5";
        },
        onBuy: function (num) {
        },
        getEffectText: function (num) {
            return `Becomes ${30+num*5} daily`;
        }
    },
    dailyBonusCharges: {
        initialCost: 200, costIncrease: 1, creationVersion: 9,
        upgradesAvailable: 3,
        visible: true,
        unlockText: "",
        getDescription: function () {
            return "Increase Daily Bonus's total charges by +1. This lets you skip checking it for longer.";
        },
        onBuy: function (num) {
        },
        getEffectText: function (num) {
            return `Charges: ${num+1}`;
        }
    },
    moreFocusBars: {
        initialCost: 250, costIncrease: 250, additiveIncrease: true, creationVersion: 9,
        upgradesAvailable: 3,
        visible: true,
        unlockText: "",
        getDescription: function () {
            return "More downstream lines can be selected at once.";
        },
        onBuy: function (num) {
            applyShopEffects()
        },
        getEffectText: function (num) {
            return `+1, ${num+3} total`;
        }
    },
    moreFocusMultiplier:{
        initialCost: 250, costIncrease: 250, additiveIncrease: true, creationVersion: 9,
        upgradesAvailable: 3,
        visible: true,
        unlockText: "",
        getDescription: function () {
            return "Focus Lines' base multiplier increased by +1. Warning: actions cannot send more than 100%/s total, and if the amount is above that, the resources will be evenly split between downstream choices, according to the ratios. This is likely only an issue for Tier 0 Actions.";
        },
        onBuy: function (num) {
            for (let actionVar in data.actions) {
                const actionObj = data.actions[actionVar];
                const dataObj = actionData[actionVar];

                for (let downstreamVar of dataObj.downstreamVars) {
                    for (let downstreamVar of dataObj.downstreamVars) {
                        actionObj[downstreamVar + "TempFocusMult"] = 2 + data.shopUpgrades.moreFocusMultiplier.upgradePower;
                    }
                }
            }
        },
        getEffectText: function (num) {
            return `+1, x${num+3} total`;
        }
    },
    focusBarsImproveEfficiency: {
        initialCost: 1000, costIncrease: 1000, additiveIncrease: true, creationVersion: 9,
        upgradesAvailable: 2,
        visible: true,
        unlockText: "",
        getDescription: function () {
            return "Focus bars reduce the consumption of both of their connected actions. This means that while progress/exp gained remains unchanged, the resources the action holds will not decrease as much. This effect stacks additively, so with one level, if you connect 4 focus lines to one action, it will not reduce resources by consumption - only by sending. Applies to relevant generators also. Cannot reduce below 0%";
        },
        onBuy: function (num) {
        },
        getEffectText: function (num) {
            return `Reduces by ${(num+1)*25}%`;
        }
    },
    autoSelectPermanentFocus: {
        initialCost: 1000, costIncrease: -750, additiveIncrease: true, creationVersion: 9,
        upgradesAvailable: 2,
        visible: false,
        unlockText: "Requires the unique upgrade Remember What I Focused On",
        getDescription: function () {
            return "Gain a button on the screen for going to the Northern Wastes that auto-selects random focus bars that do not have their permanent focus mult maxed.";
        },
        onBuy: function (num) {
            applyShopEffects()
        },
        getEffectText: function (num) {
            if(num === 0) {
                return `Selects at random`
            }
            return `Adds a second button to select the lowest`
        }
    },
    extraInstantTimeConversion: {
        initialCost: 500, costIncrease: 1, additiveIncrease: false, creationVersion: 9,
        upgradesAvailable: 4,
        visible: true,
        unlockText: "",
        getDescription: function () {
            return "Increase the amount of bonus time converted to instant bonus time.";
        },
        onBuy: function (num) {
        },
        getEffectText: function (num) {
            return `+1 hour, ${num+3} hours total`;
        }
    },
    convert60Minutes: {
        initialCost: 500, costIncrease: 1, additiveIncrease: false, creationVersion: 9, title:"60 Minutes Instant Use Button",
        upgradesAvailable: 1,
        visible: true,
        unlockText: "",
        getDescription: function () {
            return "Show a button to use 60 minutes of instant bonus time at once. Caution: will lag for about two seconds per use.";
        },
        onBuy: function (num) {
        },
        getEffectText: function (num) {
            return `60 minutes button`;
        }
    },
    extraGameSpeed: {
        initialCost: 500, costIncrease: 250, additiveIncrease: true, creationVersion: 9,
        upgradesAvailable: 5,
        visible: true,
        unlockText: "",
        getDescription: function () {
            return "Increases global game speed. This affects everything in the game, effectively making the clock run faster. Bonus speed still works as a multiplier, and bonus time gain is unchanged.";
        },
        onBuy: function (num) {
        },
        getEffectText: function (num) {
            return `+10%, 1${(num+1)*10}% total`;
        }
    },
    extraBonusTime: {
        initialCost: 1000, costIncrease: 500, additiveIncrease: true, creationVersion: 9,
        upgradesAvailable: 4,
        visible: true,
        unlockText: "",
        getDescription: function () {
            return "Collect extra bonus time per second. This bonus is received while playing, paused, and offline.";
        },
        onBuy: function (num) {
        },
        getEffectText: function (num) {
            return `+.25s/s, +${(num+1)*.25}s/s total`;
        }
    },
    extraLegacy: {
        initialCost: 500, costIncrease: 500, additiveIncrease: true, creationVersion: 9,
        upgradesAvailable: 2,
        visible: false,
        unlockText: "Requires using the amulet once",
        getDescription: function () {
            return "All Legacy gain is increased by x1.5 per bonus multiplicatively";
        },
        onBuy: function (num) {
        },
        getEffectText: function (num) {
            return `x${Math.pow(1.5, (num+1))} total`;
        }
    },
    extraAncientCoins: {
        initialCost: 500, costIncrease: 500, additiveIncrease: true, creationVersion: 9,
        upgradesAvailable: 2,
        visible: false,
        unlockText: "Requires using the amulet once",
        getDescription: function () {
            return "All Ancient Coin gain is increased by x1.5, multiplicatively";
        },
        onBuy: function (num) {
        },
        getEffectText: function (num) {
            return `x${Math.pow(1.5, (num+1))} total`;
        }
    },
    extraAncientWhispers: {
        initialCost: 500, costIncrease: 500, additiveIncrease: true, creationVersion: 9,
        upgradesAvailable: 2,
        visible: false,
        unlockText: "Requires using the amulet once",
        getDescription: function () {
            return "All Ancient Whisper gain is increased by x1.5, multiplicatively";
        },
        onBuy: function (num) {
        },
        getEffectText: function (num) {
            return `x${Math.pow(1.5, (num+1))} total`;
        }
    },
    extraLifeEnergy: {
        initialCost: 500, costIncrease: 150, additiveIncrease: true, creationVersion: 9,
        upgradesAvailable: 3,
        visible: false,
        unlockText: "Requires doing a Legacy Severance",
        getDescription: function () {
            return "In Infusion, Life Energy gained is increased x1.2, multiplicatively";
        },
        onBuy: function (num) {
        },
        getEffectText: function (num) {
            return `x${intToString(Math.pow(1.2, (num+1)), 2)} total`;
        }
    },
    extraEssence: {
        initialCost: 500, costIncrease: 150, additiveIncrease: true, creationVersion: 9,
        upgradesAvailable: 3,
        visible: false,
        unlockText: "Requires doing a Legacy Severance",
        getDescription: function () {
            return "In Infusion, Essence gained is increased x1.2, multiplicatively";
        },
        onBuy: function (num) {
        },
        getEffectText: function (num) {
            return `x${intToString(Math.pow(1.2, (num+1)), 2)} total`;
        }
    },
    momentumGainPotion: {
        initialCost:200, title:"Double Momentum Gain", consumable:true, visible:true, costIncrease:1,
        creationVersion: 9,
        unlockText:"",
        getDescription() {
            return `Gain x2 momentum for 24 hours. Time remaining: <span id="momentumGainTimer"></span>`
        },
        onBuy: function(varName) {
            data.shopUpgrades[varName].upgradePower += 1000 * 60 * 60 * 24;
        }
    },
    currencyGainPotion: {
        initialCost:200, title:"Double Currency Gain", consumable:true, visible:true, costIncrease:1,
        creationVersion: 9,
        unlockText:"",
        getDescription() {
            return `Gain x2 Legacy, Ancient Coins, and Ancient Whispers for 24 hours. Time remaining: <span id="currencyGainTimer"></span>`
        },
        onBuy: function(varName) {
            data.shopUpgrades[varName].upgradePower += 1000 * 60 * 60 * 24;
        }
    },
    buyOffline4: {
        initialCost:150, title:"Buy 4 hours of bonus time", consumable:true, visible:true, costIncrease:1,
        creationVersion: 9,
        unlockText:"",
        getDescription() {
            return "Added to bonus time on use."
        },
        onBuy: function(varName) {
            data.currentGameState.bonusTime += 1000 * 60 * 60 * 4;
        }
    },
    buyOffline24: {
        initialCost:800, title:"Buy 24 hours of bonus time", consumable:true, visible:true, costIncrease:1,
        creationVersion: 9,
        unlockText:"",
        getDescription() {
            return "Added to bonus time on use."
        },
        onBuy: function(varName) {
            data.currentGameState.bonusTime += 1000 * 60 * 60 * 24;
        }
    },
    anotherRound: {
        initialCost:100, consumable: true, visible:true, costIncrease:1,
        creationVersion: 9,
        unlockText:"",
        getDescription() {
            return "Resets Overclock Targeting the Lich's level and the momentum on it - this doubles the Fight created. Also resets Fight the Evil Forces' level - this resets the negative bonus to Hope. Warning: Only use this after you've let Northern Wastes run for a bit."
        },
        onBuy: function(varName) {
            if(data.gameState !== "KTL") {
                data.shopUpgrades.anotherRound.numConsumable++
                return;
            }

            actionSetBaseVariables(data.actions.overclockTargetingTheLich, actionData.overclockTargetingTheLich);
            revealAction('overclockTargetingTheLich');
            unlockAction(data.actions.overclockTargetingTheLich);

            let totalMometum = 0;
            for(let actionVar in data.actions) {
                let actionObj = data.actions[actionVar];
                let dataObj = actionData[actionVar];
                if(dataObj.resourceName === "momentum" && !dataObj.isKTL) {
                    totalMometum += actionObj.resource;
                }
            }
            data.actions.overclockTargetingTheLich.resource = totalMometum;
            data.actions.overclockTargetingTheLich.isRunning = true;

            data.atts.hope.num += data.actions.fightTheEvilForces.level * 10;
            statAddAmount("hope", 0)
            actionSetBaseVariables(data.actions.fightTheEvilForces, actionData.fightTheEvilForces);
            revealAction('fightTheEvilForces');
            data.actions.fightTheEvilForces.unlockCost = 0;
            unlockAction(data.actions.fightTheEvilForces);
            data.actions.fightTheEvilForces.isRunning = true;
        }
    },

    // resetLoop: {
    //     initialCost:100, consumable: true, visible:true, costIncrease:1,
    //     creationVersion: 9,
    //     unlockText:"Requires using the amulet once",
    //     getDescription() {
    //         return "Reset the run from the beginning, giving offline time equal to the time spent in the loop. Useable in the Northern Wastes. Also resets highest level, relevant unlock costs, and infusion gains back to the start of the loop."
    //     },
    //     onBuy: function(varName) {
    //         resetRun()
    //     }
    // }

}