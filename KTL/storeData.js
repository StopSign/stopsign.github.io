

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
            applyShopEffects()
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
            applyShopEffects()
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
    fightAgain: {
        initialCost:100, consumable: true, visible:true, costIncrease:1,
        creationVersion: 9,
        unlockText:"",
        getDescription() {
            return "Resets Overclock Targeting the Lich's level and the momentum on it - this doubles the Fight created. Also resets Fight the Evil Forces' level - this resets the negative bonus to Hope. Warning: Only use this after you've let Northern Wastes run for a bit."
        },
        onBuy: function(varName) {
            if(data.gameState !== "KTL") {
                data.shopUpgrades.fightAgain.numConsumable++
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