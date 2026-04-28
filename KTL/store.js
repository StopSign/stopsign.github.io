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
            data.currentGameState.dailyTimer = getMillisecondsUntilNextLocalMidnight();
        }
        data.soulCoins += 25 + data.shopUpgrades.increaseDailyBonus.upgradePower * 5;
        data.totalDailySoulCoins += 25 + data.shopUpgrades.increaseDailyBonus.upgradePower * 5;
        data.currentGameState.dailyCharges--;

        refreshShopUpgrades()
        checkDailyTimer()
    }
}

function getMillisecondsUntilNextLocalMidnight() {
    const now = new Date();
    const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0,
        0
    );
    return nextMidnight.getTime() - now.getTime();
}

//updates UI and applies charges
function checkDailyTimer() {
    if(!isSteam) {
        return;
    }
    const maxCharges = data.shopUpgrades.dailyBonusCharges.upgradePower + 1;
    const oneDayMilliseconds = 1000 * 60 * 60 * 24;

    if(data.currentGameState.dailyTimer === 0 && data.currentGameState.dailyCharges < maxCharges) {
        data.currentGameState.dailyTimer = getMillisecondsUntilNextLocalMidnight();
    }

    //convert to charges
    while(data.currentGameState.dailyTimer <= 0 && data.currentGameState.dailyCharges < maxCharges) {
        data.currentGameState.dailyCharges++;
        data.currentGameState.dailyTimer += oneDayMilliseconds;
    }
    if(data.currentGameState.dailyTimer <= 0) { //waste extra, if charges are full
        data.currentGameState.dailyTimer = 0;
    }
    if(data.currentGameState.dailyCharges > 0) { //show button if ready
        views.updateVal('dailyBonusButton', "", "style.display")
    } else {
        views.updateVal('dailyBonusButton', "none", "style.display")
    }

    let atMaxCharges = data.currentGameState.dailyCharges === maxCharges
    views.updateVal('dailyBonusMessage', `Daily Bonus: ${data.currentGameState.dailyCharges} / ${maxCharges}.  
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
            recalculateKTLCurrencyMultipliers();
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
            recalculateKTLCurrencyMultipliers();
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

        recalculateKTLCurrencyMultipliers();
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
    const hadCurrencyPotion = data.shopUpgrades.currencyGainPotion.upgradePower > 0;
    data.shopUpgrades.currencyGainPotion.upgradePower -= time
    if(data.shopUpgrades.currencyGainPotion.upgradePower < 0) {
        data.shopUpgrades.currencyGainPotion.upgradePower = 0;
    }
    if (hadCurrencyPotion !== (data.shopUpgrades.currencyGainPotion.upgradePower > 0)) {
        recalculateKTLCurrencyMultipliers();
    }
    data.shopUpgrades.momentumGainPotion.upgradePower -= time
    if(data.shopUpgrades.momentumGainPotion.upgradePower < 0) {
        data.shopUpgrades.momentumGainPotion.upgradePower = 0;
    }
}