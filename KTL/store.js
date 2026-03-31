//Run in menu.js
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

        toReturn = `
        You have <span id="soulCoinAmount"></span> Soul Coins.<br>
        <span id="dailyBonusMessage">Daily bonus ready in 23hr...</span>
        <span class="button" id="dailyBonusButton">Receive Daily Bonus of 25 SC</span>
        <div class="menuSeparator"></div>
        <span class="button" onClick="window.steamAPI.buyItem(100)">Buy 1,000 Soul Coins for $4.99</span>
        <span class="button" onClick="window.steamAPI.buyItem(101)">Buy 2,200 (+10% bonus!) Soul Coins for $9.99</span>
        <span class="button" onClick="window.steamAPI.buyItem(102)">Buy 4,800 (+20% bonus!) Soul Coins for $19.99</span><br>
        <span id="shopOutputMessage"></span><br>
        Click Check Purchases to receive any purchased Soul Coins. The process is not automatic, but after clicking you will receive your soul coins within a few seconds.
        <span class="button" id="refresh-purchases-btn" onClick="requestManualSweep()">Check Purchases</span>

        ${createShopUpgrades()}

        <span class="button" onclick="resetRun()">Reset run</span>
        Reset the run and gain offline time equal to the run time. `
    }

    return toReturn
}

function createShopUpgrades() {

}

let shopUpgrades = {
    dailyCheckinBonus: {
        initialCost: 50, costIncrease: 10, additiveIncrease:true, creationVersion: 9,
        upgradesAvailable: 5,
        visible: false,
        customInfo: function (num) {
            return "Increase Daily Checkin's Soul Coin bonus +5";
        },
        onBuy: function (num) {
        }
    },
    dailyCheckinCharges: {
        initialCost: 50, costIncrease: 1, creationVersion: 9,
        upgradesAvailable: 5,
        visible: false,
        customInfo: function (num) {
            return "Increase Daily Checkin's total charges by +1";
        },
        onBuy: function (num) {
        }
    },
}