function saveFileCorrection(saveVersionFromLoad) {
    let refundAmount = 0;
    //removed with saveVersion 6, but could still use in the future

    return refundAmount;
}

function saveFileCorrectionAfterLoad(saveVersionFromLoad) {
    //removed with saveVersion 6, but could still use in the future

}

let v2toLoad;
function handleV2Saves(toLoad) {
    //game cannot be played until an option is chosen
    data.gameSettings.stop = true

    data.gameSettings.viewDeltas = toLoad.gameSettings.viewDeltas ?? false;
    data.gameSettings.viewRatio = toLoad.gameSettings.viewRatio ?? false;
    data.gameSettings.viewAll0Buttons = toLoad.gameSettings.viewAll0Buttons ?? false;
    data.gameSettings.viewTotalMomentum = toLoad.gameSettings.viewTotalMomentum ?? false;
    data.gameSettings.viewAdvancedSliders = toLoad.gameSettings.viewAdvancedSliders ?? false;
    data.gameSettings.numberType = toLoad.gameSettings.numberType ?? "numberSuffix";


    if (toLoad.lastVisit) {
        const offlineMilliseconds = Date.now() - parseInt(toLoad.lastVisit, 10);
        if (offlineMilliseconds > 5000) {
            toLoad.currentGameState.bonusTime += offlineMilliseconds;
            console.log(`Welcome back! Gained ${(offlineMilliseconds / 1000).toFixed(1)}s of bonus time.`);
        }
    }
    if(toLoad.secondsPerReset) {
        toLoad.currentGameState.bonusTime += toLoad.secondsPerReset * 1000;
    }

    for(let actionVar in data.actions) {
        const actionObj = data.actions[actionVar];
        const dataObj = actionData[actionVar];
        for(let downstreamVar of dataObj.downstreamVars) {
            if(toLoad.actions[actionVar] && toLoad.actions[actionVar][`${downstreamVar}PermFocusMult`]) {
                actionObj[`${downstreamVar}PermFocusMult`] = toLoad.actions[actionVar][`${downstreamVar}PermFocusMult`];
            }
        }
    }

    let refundAmount = 0;
    for(let upgradeVar in toLoad.upgrades) {
        let loadObj = toLoad.upgrades[upgradeVar];
        refundAmount += calcTotalSpentOnUpgrade(loadObj.initialCost, loadObj.costIncrease, loadObj.upgradesBought);
    }

    document.getElementById('v2Offline').innerText = secondsToTime(toLoad.currentGameState.bonusTime/1000)
    document.getElementById('v2Legacy').innerText = intToString(toLoad.actions.echoKindle.resource)
    document.getElementById('v2AC').innerText = intToString(refundAmount);

    //to use after the choice
    v2toLoad = {
        offlineTime:toLoad.currentGameState.bonusTime,
        highestLegacy:toLoad.actions.echoKindle.resource,
        AC:refundAmount
    };
}

function v2SaveRestart() {
    data.gameSettings.stop = false
    data.highestLegacy = v2toLoad.highestLegacy
    revealUpgrade('shapeMyPath')
    data.currentGameState.bonusTime += Math.max(v2toLoad.offlineTime, 7 * 24 * 60 * 60 * 1000)

    data.ancientCoin = 10 + Math.min(v2toLoad.AC/100, 500);
    buyUpgrade("stopLettingOpportunityWait")
    buyUpgrade("knowWhenToMoveOn")
    setSliderUI("overclock", "reflect", 100)
    data.doneAmulet = true;
    views.updateVal(`openViewAmuletButton`, "", "style.display");

    document.getElementById("welcomeBackMessage").style.display = "none";
    setActionsToHATLUnlocked()
}

function setActionsToHATLUnlocked() {
    let list = ["overclock", "reflect", "harnessOverflow", "distillInsight", "takeNotes", "journal",
        "remember", "makeMoney", "bodyAwareness", "meditate", "spendMoney", "buySocialAccess", "slideTheCoin",
        "buyCoffee", "buyBasicSupplies", "buyStreetFood", "buyGoodFood", "buyMarketItems", "buyShopItems",
        "buyBasicClothes", "buyTravelersClothes", "buyMatchingClothes", "buyStylishClothes", "travelOnRoad",
        "travelToOutpost", "browseLocalMarket", "browseStores", "browseBackrooms", "meetVillageLeaderScott",
        "helpScottWithChores", "checkNoticeBoard", "reportForTraining", "basicTrainingWithJohn", "noticeTheStrain",
        "clenchTheJaw", "breatheThroughIt", "ownTheWeight", "moveWithPurpose", "reportForLabor", "oddJobsLaborer",
        "chimneySweep", "handyman", "tavernHelper", "guildReceptionist", "messenger", "pleasantForest", "travelToCrossroads",
        "forgottenShrine", "watchBirds", "catchAScent", "exploreDifficultPath", "eatGoldenFruit", "keepGoing",
        "climbTheRocks", "spotAPath", "hiddenPath", "meetGrumpyHermit", "annoyHermitIntoAQuest", "presentTheOffering",
        "learnToStayStill", "feelTheResonance", "layerTheEchoes", "igniteTheSpark", "talkToHermit", "inquireAboutMagic",
        "pesterHermitForSecrets", "exploreTheForest", "travelAlongTheRiver", "gatherRiverWeeds", "restAtWaterfall",
        "visitShrineBehindWaterfall", "socialize", "meetPeople", "joinCoffeeClub", "gossipAroundCoffee",
        "hearAboutTheLich", "talkWithScott", "talkWithJohn", "learnToListen", "chatWithMerchants",
        "complimentTheChef", "askAboutStitching", "tellAJoke", "listenToWoes", "keyToTheBackroom",
        "chatWithHermit", "discussMagicWithHermit", "discussLifeWithHermit", "echoKindle", "resonanceFurnace",
        "dissipation", "poolMana", "manaExperimentation", "expelMana", "stretchManaCapacity", "tightenAura",
        "collectDischargedMotes", "spellResearch", "bindThePages", "infuseTheHide", "awakenYourGrimoire",
        "etchTheCircle", "threadArcana", "prepareSpells", "prepareInternalSpells", "overcharge", "overwork"];
    for(let actionVar of list) {
        if(!data.actions[actionVar]) {
            console.log("error with " + actionVar)
            continue;
        }
        data.actions[actionVar].hasBeenUnlocked = true;
    }
}