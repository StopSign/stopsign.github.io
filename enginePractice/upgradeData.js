function calcUpgradeCost(upgrade, num) {
    if(num === 0) {
        return upgrade.initialCost;
    }
    return upgrade.initialCost * Math.pow(upgrade.costIncrease, num);
}

let selectedUpgrade = {var:"",num:0};

//num is position from the left of the upgrade
function selectBuyUpgrade(upgradeVar, num) {
    let upgrade = data.upgrades[upgradeVar];

    if(selectedUpgrade.var) {
        document.getElementById(selectedUpgrade.var + "Button" + selectedUpgrade.num).style.border = "none";
        if(selectedUpgrade.var === upgradeVar && selectedUpgrade.num === num) {
            document.getElementById("infoText").innerHTML = "";
            selectedUpgrade = {var:"",num:0};
            return;
        }
    }
    selectedUpgrade = {var:upgradeVar,num:num};
    document.getElementById(upgradeVar+"Button"+num).style.border = "4px solid #ffae00";
    document.getElementById("infoText").innerHTML = createInfoText(upgradeVar, num);
}

function buyUpgrade(upgradeVar, num) {
    let upgrade = data.upgrades[upgradeVar];

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
    document.getElementById(upgradeVar+"Button"+num).style.background = "#00ff39";
}

function createInfoText(upgradeVar, num) {
    let upgrade = data.upgrades[upgradeVar];
    return upgrade.customInfo(num) +
        "<br>Cost: " + calcUpgradeCost(upgrade, num) + "<br>" +
        "<div class='continueButton' onclick='buyUpgrade(\""+upgradeVar+"\", "+num+")'>Buy</div>";
}

data.upgrades.automaticallySetDownstreamSliders = {
    amount:0,
    initialCost:10, costIncrease:2,
    upgradesAvailable:4,
    upgradesBought:[], //e.g. bought first and third upgrade and it would be [0,2]
    reqInOrder:true,
    customInfo: function(num) {
        let infoText = "When unlocking a new action, auto sets the slider to ";
        switch (num) {
            case 0:
                infoText += "1%."
                break;
            case 1:
                infoText += "10%."
                break;
            case 2:
                infoText += "100%."
                break;
            case 3:
                infoText += "not reset with an amulet reset, and previously undiscovered to be set at 100%."
                break;
        }
        return infoText
    }
};