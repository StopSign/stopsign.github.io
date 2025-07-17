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
        document.getElementById("infoTextButton").style.display = data.gameState !== "KTL" ? "none" : "";
    } else { //disabled
        document.getElementById("infoMenu").style.borderColor = "#ff0000";
        document.getElementById("infoTextButton").style.display = "none";
    }
}

function buyUpgrade(upgradeVar, num) {
    //also deselect the upgrade
    let upgrade = data.upgrades[upgradeVar];
    let dataObj = actionData.upgrades[upgradeVar];

    if(upgrade.upgradesBought.indexOf(num) !== -1) { //already bought
        return;
    }
    //check cost
    let cost = calcUpgradeCost(upgrade, num);
    if (data.ancientCoin < cost) {
        return;
    }
    //buy
    data.ancientCoin -= cost;

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
    if(dataObj.onBuy) {
        dataObj.onBuy(upgrade.upgradePower);
    }
}

//no listeners allowed here
function createInfoText(upgradeVar, num) {
    let upgrade = data.upgrades[upgradeVar];
    return actionData.upgrades[upgradeVar].customInfo(num) +
        "<br><span style='font-size:14px'>Cost: <b>" + calcUpgradeCost(upgrade, num) + "</b></span>";
}

function createUpgrades() {
    //Loop through actionData.upgrades
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
        upgradeObj.isFullyBought = false;
        upgradeObj.visible = !!dataObj.visible;
    }
}

actionData.upgrades = {
    rememberWhatIDid: {
        initialCost:1, costIncrease:1,
        upgradesAvailable:1,
        visible:true,
        customInfo: function(num) {
            return "On each action, get 2x exp as long as the action's level is lower than the highest level ever reached." +
                " The action's highest level will be recorded on amulet use, and it will be displayed.";
        }
    }, //1|1, 2x exp to highest
    checkWhatScottMentioned: {
        initialCost:1, costIncrease:1,
        upgradesAvailable:1,
        visible:true,
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
    }, //STORY|1 - shortcut path
    stopLettingOpportunityWait: {
        initialCost:1, costIncrease:3,
        upgradesAvailable:4,
        visible:true,
        customInfo: function(num) {
            return `When unlocking a new action, auto sets the new downstream sliders to ` +
            `${["5%.", "20%.", "100%.", "not reset with an amulet reset, and for previously undiscovered sliders to be set at 100%."][num]}`;
        }
    }, //1|4|x3,  set sliders on unlock
    tryALittleHarder: {
        initialCost:5, costIncrease:2,
        upgradesAvailable:5,
        visible:true,
        customInfo: function(num) {
            return "Flat motivation generation increase on Overclock of <b>" +((num+1)*20)+ "</b> momentum/s.";
        }
    }, //5|5|x2, Flat momentum increase
    createABetterFoundation: {
        initialCost:5, costIncrease:4,
        upgradesAvailable:3,
        visible:true,
        customInfo: function(num) {
            return "Motivation generation is multipled by "+(num >0?"another ":"")+"x2";
        }
    }, //5|3|x4, Momentum multiplier
    makeMoreMoney: {
        initialCost:10, costIncrease:2,
        upgradesAvailable:4,
        visible:true,
        customInfo: function(num) {
            return "Gold generation increased by "+(num >0?"another ":"")+"x2";
        }
    }, //10|4|x2, Money x2
    stopBeingSoTense: {
        initialCost:30, costIncrease:1,
        upgradesAvailable:1,
        visible:true,
        customInfo: function(num) {
            return "What was the point? I should have handled myself first."
        },
        onBuy: function(num) {
            purchaseAction('meditate');
            purchaseAction('walkAware');
        }
    }, //STORY|30 - meditate path
    haveBetterConversations: {
        initialCost:10, costIncrease:2,
        upgradesAvailable:4,
        visible:true,
        customInfo: function(num) {
            return "Conversation generation increased by "+(num >0?"another ":"")+"x2";
        }
    }, //10|4|x2, Conversations x2
    focusHarder: {
        initialCost:25, costIncrease:4,
        upgradesAvailable:8,
        visible:true,
        customInfo: function(num) {
            return "Increases the Focus Mult by "+(num >0?"another ":"")+"+1 (for a total of " + (num+1+2) + ")";
        },
        onBuy: function(num) {
            data.focusMult = 2 + num;
        }
    }, //25|8|x4, Focus mult +1
    rememberWhatIFocusedOn: {
        initialCost:25, costIncrease:5,
        upgradesAvailable:3,
        visible:true,
        customInfo: function(num) {
            if(num === 0) {
                return "Gain +1/hr to a new Loop Bonus on the flow you have Focused. Stays when Focus is removed, but resets when the Amulet is used. The Loop Bonus has a max of 2.5. Maximum flow is still 10%/s."
            }
            return "Increases the Loop Bonus' max by "+(num >0?"another ":"")+"x2 (for a total of " + (2.5*Math.pow(2, (num+1))) + ")";
        },
        onBuy: function(num) {
            data.focusLoopMax = 2.5 * Math.pow(2, data.upgrades.rememberWhatIFocusedOn) * Math.pow(2, data.upgrades.rememberWhatIFocusedOnMore);
            if(num === data.rememberWhatIFocusedOn.upgradesAvailable) {
                data.upgrades.rememberWhatIFocusedOnMore.visible = true;
            }
        }
    }, //25|3|x5, Focus mult is sticky, but resets
    knowWhatIFocusedOn: {
        initialCost:50, costIncrease:10,
        upgradesAvailable:4,
        visible:true,
        customInfo: function(num) { //[0, .2, .5, .9, 1][data.actions.knowWhatIFocusedOn.upgradePower]
            return "Keep "+(["20", "50", "90", "100"][num])+"% of your Focus Loop Bonus when you use the Amulet";
        }
    }, //50|4|x10, Keep Focus mult on amulet
    rememberHowIGrew: {
        initialCost:50, costIncrease:1,
        upgradesAvailable:1,
        visible:true,
        customInfo: function(num) {
            return "On each action, get 2x exp as long as the action's level is lower than the second highest level ever reached." +
                " The action's second highest level will be recorded on amulet use, and it will be displayed.";
        }
    }, //50|1, 2x exp to second highest


    // return "Unlock new actions!<br>Story: My armor is broken, my sword shattered, my shield is in pieces. The army " +
    //                 "did not expect me to fight this long, and their preparation was lacking.<br><br>I must take this into my own hands.";


    rememberWhatIFocusedOnMore: {
        initialCost:10000, costIncrease:5,
        upgradesAvailable:3,
        visible:false,
        customInfo: function(num) {
            if(num === 0) {
                return "Gain +1/hr to a new Loop Bonus on the flow you have Focused. Stays when Focus is removed, but resets when the Amulet is used. The Loop Bonus has a max of 2.5. Maximum flow is still 10%/s."
            }
            return "Increases the Loop Bonus' max by "+(num >0?"another ":"")+"x2 (for a total of " + (2.5 * Math.pow(2, data.upgrades.rememberWhatIFocusedOn) * Math.pow(2, (num+1))) + ")";
        },
        onBuy: function(num) {
            data.focusLoopMax = 2.5 * Math.pow(2, data.upgrades.rememberWhatIFocusedOn) * Math.pow(2, data.upgrades.rememberWhatIFocusedOnMore);
        }
    }, //10000|5|x3, Focus Mult +1
    rememberMyMastery: {
        initialCost:200, costIncrease:1,
        upgradesAvailable:1,
        visible:true,
        customInfo: function(num) {
            return "On each action, get 2x exp as long as the action's level is lower than the third highest level ever reached." +
                " The action's third highest level will be recorded on amulet use, and it will be displayed.";
        }
    }, //200|1, 2x exp to third highest

    lookCloserAtTheBoard: {
        initialCost:11, costIncrease:3,
        upgradesAvailable:2,
        visible:true,
        customInfo: function(num) {
            return "The board was stuffed with notices. Surely something else is relevant for you."
        },
        onBuy: function(num) {
            actionData.checkNoticeBoard.maxLevel++;
            if(num === 1) {
                purchaseAction('reportForTraining');
                purchaseAction('basicTrainingWithJohn');
                purchaseAction('noticeTheStrain');
                purchaseAction('clenchTheJaw');
                purchaseAction('breatheThroughIt');
                purchaseAction('ownTheWeight');
                purchaseAction('moveWithPurpose');
                purchaseAction('standStraighter');
                purchaseAction('keepGoing');
                purchaseAction('climbTheRocks');
                purchaseAction('findAShortcut');
            } else if(num === 2) {
                purchaseAction('buyBasicSupplies');
                purchaseAction('chimneySweep');
                purchaseAction('handyman');
                purchaseAction('tavernHelper');
                purchaseAction('guildReceptionist');
                purchaseAction('messenger');
                purchaseAction('storyTeller');
            }
        }
    }, //STORY notice board level 2 (training) and level 3 (jobs)
    buyNicerStuff: {
        initialCost:11, costIncrease:1,
        upgradesAvailable:1,
        visible:false,
        customInfo: function(num) {
            return ""
        },
        onBuy: function(num) {
        }
    }, //STORY market
    askScottMoreQuestions: {
        initialCost:11, costIncrease:1,
        upgradesAvailable:1,
        visible:false,
        customInfo: function(num) {
            return ""
        },
        onBuy: function(num) {
        }
    }, //STORY socialization
    discoverMoreOfTheWorld: {
        initialCost:11, costIncrease:1,
        upgradesAvailable:1,
        visible:false,
        customInfo: function(num) {
            return ""
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