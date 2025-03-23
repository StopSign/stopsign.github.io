function calcUpgradeCost(upgrade, num) {
    if(num === 0) {
        return upgrade.initialCost;
    }
    return Math.floor(upgrade.initialCost * Math.pow(upgrade.costIncrease, num));
}

let selectedUpgrade = {var:"",num:0};

//num is position from the left of the upgrade
function selectBuyUpgrade(upgradeVar, num) {
    let upgrade = data.upgrades[upgradeVar];

    if(selectedUpgrade.var) {
        document.getElementById(selectedUpgrade.var + "Button" + selectedUpgrade.num).style.border = "none";
        if(selectedUpgrade.var === upgradeVar && selectedUpgrade.num === num) { //deselect
            document.getElementById("infoText").innerHTML = "";
            selectedUpgrade = {var:"",num:0};
            document.getElementById("infoMenu").style.display = "none";
            return;
        }
    }
    selectedUpgrade = {var:upgradeVar,num:num};
    document.getElementById(upgradeVar+"Button"+num).style.border = "4px solid #ffae00";
    document.getElementById("infoText").innerHTML = createInfoText(upgradeVar, num);
    document.getElementById("infoMenu").style.display = "inline-block";

    if(data.upgrades[upgradeVar].upgradesBought.indexOf(num) !== -1) { //bought
        document.getElementById("infoMenu").style.borderColor = "#c3cd00";
        document.getElementById("infoTextButton").style.display = "none";
    } else if(num === 0 || data.upgrades[upgradeVar].upgradesBought.indexOf(num-1) !== -1) { //ready
        document.getElementById("infoMenu").style.borderColor = "#00cd41";
        document.getElementById("infoTextButton").style.display = "";
    } else { //disabled
        document.getElementById("infoMenu").style.borderColor = "#ff0000";
        document.getElementById("infoTextButton").style.display = "none";
    }
}

function buyUpgrade(upgradeVar, num) {
    //also deselect the upgrade
    let upgrade = data.upgrades[upgradeVar];

    if(upgrade.upgradesBought.indexOf(num) !== -1) { //already bought
        return;
    }
    //check cost
    let cost = calcUpgradeCost(upgrade, num);
    if (data.essence < cost) {
        return;
    }
    data.essence -= cost;

    //add to upgrades
    if (upgrade.upgradesBought.indexOf(num) === -1) {
        upgrade.upgradesBought.push(num);
    }
    upgrade.upgradePower++; //num bought per row
    if(upgrade.upgradesBought.length === upgrade.upgradesAvailable) {
        upgrade.isFullyBought = true; //cleared the row
    }
    if(selectedUpgrade.var) { // <- allow buy on load
        selectBuyUpgrade(selectedUpgrade.var, selectedUpgrade.num); //deselect
    }
}

function createInfoText(upgradeVar, num) {
    let upgrade = data.upgrades[upgradeVar];
    return actionData.upgrades[upgradeVar].customInfo(num) +
        "<br><span style='font-size:14px'>Cost: <b>" + calcUpgradeCost(upgrade, num) + "</b></span>";
}

function createUpgrades() {
    //Loop through action.upgrades
    //modify/add base variables as needed
    //add it to data.upgrades
    for(let upgradeVar in actionData.upgrades) {
        let dataObj = actionData.upgrades[upgradeVar];
        data.upgrades[upgradeVar] = {};
        let upgradeObj = data.upgrades[upgradeVar];
        upgradeObj.upgradePower = 0; //for controlling the effect of the upgrade
        upgradeObj.initialCost = dataObj.initialCost;
        upgradeObj.costIncrease = dataObj.costIncrease;
        upgradeObj.upgradesAvailable = dataObj.upgradesAvailable;
        upgradeObj.upgradesBought = []; //e.g. bought first and fifth upgrade and it would be [0,4]. Not used atm.
        upgradeObj.requireInOrder = dataObj.requireInOrder !== undefined ? dataObj.requireInOrder : true;
        upgradeObj.customInfo = dataObj.customInfo;
        upgradeObj.isFullyBought = false;
        upgradeObj.visible = !!dataObj.visible;
    }
}

actionData.upgrades = {
    rememberWhatIDid: {
        initialCost:5, costIncrease:1,
        upgradesAvailable:1,
        visible:true,
        customInfo: function(num) {
            return "On each action, get 2x exp as long as the action's level is lower than the highest level ever reached." +
                "The highest level achieved will be displayed.";
        }
    },
    stopLettingOpportunityWait: {
        initialCost:5, costIncrease:3,
        upgradesAvailable:4,
        visible:true,
        customInfo: function(num) {
            return `When unlocking a new action, auto sets the new downstream sliders to ` +
            `${["1%.", "10%.", "100%.", "not reset with an amulet reset, and for previously undiscovered sliders to be set at 100%."][num]}`;
        }
    },
    tryALittleHarder: {
        initialCost:10, costIncrease:1.1,
        upgradesAvailable:5,
        visible:true,
        customInfo: function(num) {
            return "Motivation generation on Overclock raise to " +((num+1)*20)+ "/s.";
        }
    },
    createABetterFoundation: {
        initialCost:10, costIncrease:2,
        upgradesAvailable:3,
        visible:true,
        customInfo: function(num) {
            return "Motivation generation increased by "+(num >0?"another ":"")+"x2";
        }
    },
    buyNicerStuff: { //unlock market/equipment/houses
        initialCost:11, costIncrease:1,
        upgradesAvailable:1,
        visible:true,
        customInfo: function(num) {
            return "Unlock new actions!<br>Story: My armor is broken, my sword shattered, my shield is in pieces. The army " +
                "did not expect me to fight this long, and their preparation was lacking.<br><br>I must take this into my own hands.";
        }
    },
    makeMoreMoney: {
        initialCost:12, costIncrease:2,
        upgradesAvailable:4,
        visible:true,
        customInfo: function(num) {
            return "Gold generation increased by "+(num >0?"another ":"")+"x2";
        }
    },
    rememberHowIGrew: {
        initialCost:50, costIncrease:1,
        upgradesAvailable:1,
        visible:true,
        customInfo: function(num) {
            return "On each action, get 2x exp as long as the action's level is lower than the second highest level ever reached." +
                "The second highest level achieved will be displayed.";
        }
    },
    rememberMyMastery: {
        initialCost:200, costIncrease:1,
        upgradesAvailable:1,
        visible:true,
        customInfo: function(num) {
            return "On each action, get 2x exp as long as the action's level is lower than the third highest level ever reached." +
                "The third highest level achieved will be displayed.";
        }
    },
    //... finish up to here
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



}