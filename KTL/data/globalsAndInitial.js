//Driver globals
let gameSpeed = 1;
let stop = false;
// let bonusTime = 0;

let settings = {}; // Will be populated by the 'start' command.
let timerId = null;
let lastTickTime = 0;
let ticksForSeconds = 0;
let secondsPassed = 0;

let View = {};

let curTime = new Date();
let gameTicksLeft = 0;
let sudoStop = false;
let totalTime = 0;
//Store offline time
let mainTickLoop;
let lastSave = Date.now();

//Saving globals
let isFileSystem = !!location.href.match("file");
let saveName = "KTLsave6"; //Blank if you don't want to save, change name to force user reset

let forceStop = false;



//Game globals - these initializations will be overriden in load
//Needed for when load doesn't happen
let data = {};
data.actions = {};
data.atts = {};
data.toastStates = []; // array of toast objects: {id, state, element}
data.planeUnlocked = [true, false, false, false];
data.planeTabSelected = 0;
data.gameState = "default"; //KTL
data.totalMomentum = 0;
data.legacy = 0;
data.ancientCoin = 0;
data.ancientWhisper = 0;
data.lichKills = 0;
data.lichCoins = 0;
data.highestLegacy = 0;

data.useAmuletButtonShowing = false;
data.secondsPerReset = 0;
data.currentJob = "helpScottWithChores";
data.currentWage = 1;
data.doneKTL = false;
data.doneAmulet = false;
data.doneLS = 0;
data.ancientCoinMultKTL = 1;
data.ancientWhisperMultKTL = 1;
data.legacyMultKTL = 1;
data.focusSelected = [];
data.resetLogs = [];
data.resetCount = 1;
data.currentLog = [];
data.currentPinned = [];
data.maxFocusAllowed = 2;
data.options = {};
data.options.bonusRate = 3;
data.lastVisit = Date.now();
data.queuedReveals = {}
let chartData = []; // Stores { time: number, value: number }
let chartScale = 'linear'; // 'linear' or 'logarithmic'

// --- Core Settings ---
data.gameSettings = {
    gameSpeed: 1,
    bonusSpeed: 1,
    stop: false,
    stopAll: false,
    fps: 20,
    ticksPerSecond: 20,
    ticksForSeconds:0,
    viewDeltas:false,
    viewRatio:false,
    viewAll0Buttons:false,
    viewTotalMomentum:false,
    viewAdvancedSliders:false,
    numberType:"numberSuffix",
    redeemedBonusCodes:{},
    showCompletedToggle:true,
    showUnaffordable:true,
    sortByCost:false
};

// --- Dynamic Game State ---
data.currentGameState = {
    bonusTime: 0,
    secondsPassed: 0,
    KTLBonusTimer: 0,
};


let viewData = {}; //contains only things that are generated / not saved
viewData.toasts = [];

let language = "english";
// let globalVisible = false; //SET FOR COMMIT
let globalVisible = true;
// let isLoadingEnabled = true; //SET FOR COMMIT
let isLoadingEnabled = false;
let loadStaticSaveFile = false; //SET FOR COMMIT
// let loadStaticSaveFile = true;

data.upgrades = {};

// let isDebug = false; //SET FOR COMMIT
let isDebug = true;
let debugLevel = 45; //to set the rough number of loops
function debug() {
    if(!isDebug) {
        return;
    }
    if(globalVisible) {
        unveilPlane(0);
        unveilPlane(1);
        unveilPlane(2);
    }

    data.doneLS = 1;
    displayLSStuff()

    document.getElementById("bonus50").style.display = "";
    document.getElementById("skipTime60").style.display = "";
    for(let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        actionObj.hasBeenUnlocked = true;
    }
    // data.ancientCoin = 100000;

    //to start the game easier:
    if(!isLoadingEnabled) {
        data.currentGameState.bonusTime = 1000 * 60 * 60 * 24 * 7 * 4;
        data.ancientCoin = 10;
        buyUpgrade("stopLettingOpportunityWait")
        buyUpgrade("stopLettingOpportunityWait")
        buyUpgrade("knowWhenToMoveOn")
        setSliderUI("overclock", "reflect", 100)

        toggleNumberType()
        toggleNumberType()

    }

    //after finishing loop 0:
    //8h, 3.37e33, HATL 1, thread 4, cast 11
    //buy automation
    if(debugLevel >= 1) {
        statAddAmount("legacy", 25 + 9.97);
        data.ancientWhisper += 10;
        data.useAmuletButtonShowing = true;
        data.doneKTL = true;
        data.doneAmulet = true;
        data.displayJob = true;

        buyUpgrade("respectTheShrine")
        views.updateVal(`openViewAmuletButton`, "", "style.display");

        unveilPlane(0);
        unveilPlane(1);
        revealAction("echoKindle")
        revealAction("resonanceFurnace")
        unlockAction(data.actions.echoKindle);
        unlockAction(data.actions.resonanceFurnace)
        unlockAction(data.actions.sparkDecay)
        unlockAction(data.actions.poolMana)
        unlockAction(data.actions.manaExperimentation)
        unlockAction(data.actions.expelMana);
        unlockAction(data.actions.tightenAura);
        unlockAction(data.actions.collectDischargedMotes);
        unlockAction(data.actions.stretchManaCapacity);
        unlockAction(data.actions.spellResearch);
        unlockAction(data.actions.bindThePages);
        unlockAction(data.actions.awakenYourGrimoire);
        unlockAction(data.actions.etchTheCircle);
        unlockAction(data.actions.infuseTheHide);

        unlockAction(data.actions.threadArcana);
        unlockAction(data.actions.prepareSpells);
        unlockAction(data.actions.prepareInternalSpells);
        unlockAction(data.actions.overcharge);
        unlockAction(data.actions.overwork);
    }
    //after finishing loop 1:
    //9:10h, 6.59e34m, HATL 1, thread 9, cast 34, hum 1
    //OTTL: 20

    if(debugLevel >= 2) {
        data.ancientCoin += 10;
        data.ancientWhisper += 10;
        buyUpgrade("improveMyGrimoire")
        buyUpgrade("refineMyAwareness")
        statAddAmount("legacy", 125 + 43.16);
    }

    //after finishing loop 2:
    //8:00h, 1.26e35, grimoire research 2, HATL 1, cast 36, thread 11, hum 1
    //OTTL 21

    if(debugLevel >= 3) {
        data.ancientCoin += 10;
        data.ancientWhisper += 10;
        statAddAmount("legacy", 125 + 93.89);
        unlockAction(data.actions.grimoireResearch);
        buyUpgrade("feelTheEchoesOfTheBurntTown")
        buyUpgrade("refineMyObservation")

        changeAutomationCanDisable("gossipAroundCoffee", false);
    }
    //after finishing loop 3
    //7:10h, 1.5e37, GR 3, HATL 2, cast 36, thread 13, hum 2

    if(debugLevel >= 4) {
        data.ancientCoin += 30;
        data.ancientWhisper += 20;
        statAddAmount("legacy", 225 + 267.36);

        buyUpgrade("buyNicerStuff")
        buyUpgrade("refineMyConcentration")
        buyUpgrade("refineMyInfluence")
    }

    //after finishing loop 4:
    //6:00, 2.62e37, GR 3, HATL 2, cast 32, thread 13
    //OTTL 29

    if(debugLevel >= 5) {
        data.ancientCoin += 30;
        data.ancientWhisper += 20;
        statAddAmount("legacy", 225 + 287.89);

        buyUpgrade("refineMyControl")
        buyUpgrade("shapeMyMana")
    }

    //after finishing loop 5:
    //5h: 7e37, GR 3, HATL 2, cast 35, thread 14


    if(debugLevel >= 6) {
        data.ancientCoin += 30;
        data.ancientWhisper += 20;
        statAddAmount("legacy", 225 + 339.35);

        buyUpgrade("refineMyEndurance")
        unlockAction(data.actions.condenseAura)
        unlockAction(data.actions.focusInwards)
    }

    //after finishing loop 6:
    //5h: 1.17e37, GR 3, HATL 2, cast 36, thread 15

    if(debugLevel >= 7) {
        data.ancientCoin += 30;
        data.ancientWhisper += 20;
        statAddAmount("legacy", 225 + 380);

        buyUpgrade("startALittleQuicker")
        buyUpgrade("refineMyAwareness")
        buyUpgrade("feelTheEchoesOfTheBurntTown")
    }

    //6:30h, 3.5e40, GR 3, HATL 3, cast 41, thread 19, despair 1

    if(debugLevel >= 8) {
        data.ancientCoin += 45;
        data.ancientWhisper += 20;
        statAddAmount("legacy", 1725 + 729);

        buyUpgrade("chatLongerWithAllies")
        buyUpgrade("refineMyAmbition")
        buyUpgrade("refineMyMight")
        buyUpgrade("refineMyNavigation")
        buyUpgrade("refineMySpark")
    }

    //6h, 1.16e41, GR 3, HATL 3, cast 40, thread 20, despair 1

    if(debugLevel >= 9) {
        data.ancientCoin += 45;
        data.ancientWhisper += 20;
        statAddAmount("legacy", 1725 + 741);

        buyUpgrade("refineMyPulse")
    }

    //6h, 1.32e41, GR 3, HATL 3, cast 41, thread 21, despair 1
    //OOTL 43

    if(debugLevel >= 10) {
        data.ancientCoin += 45;
        data.ancientWhisper += 20;
        statAddAmount("legacy", 1725 + 772);

        buyUpgrade("improveMyGrimoire")
        buyUpgrade("refineMyIntegration")
    } //1e4 legacy

    //8h, 3e42, GR 5, HATL 3, cast 45, thread 25, despair 2
    //OOTL 48

    if(debugLevel >= 11) {
        data.ancientCoin += 90;
        data.ancientWhisper += 40;
        statAddAmount("legacy", 3225 + 2115);

        unlockAction(data.actions.castToFail)
        unlockAction(data.actions.locateWeakness)
        buyUpgrade("useMyGrimoiresPower")
        buyUpgrade("useMyGrimoiresPower")
        buyUpgrade("refineMyCycle")
        buyUpgrade("refineMyAmplification")

    }

    //8:50, 6.24e42, HATL 4, GR 7, cast 48, thread 27, despair 2
    //OOTL 49

    if(debugLevel >= 12) {
        data.ancientCoin += 135;
        data.ancientWhisper += 40;
        statAddAmount("legacy", 3225 + 2795);

        unlockAction(data.actions.overtalk)
        unlockAction(data.actions.overboost)
        buyUpgrade("haveBetterIceBreakers")
        buyUpgrade("shapeMyMana")
        buyUpgrade("refineMyCharm")
        buyUpgrade("refineMyLeverage")
    }

    //7:20, 9.6e42, HATL 4, GR 7, cast 50, thread 30
    //OOTL 50

    if(debugLevel >= 13) {
        data.ancientCoin += 135;
        data.ancientWhisper += 40;
        statAddAmount("legacy", 3225 + 3014);

        buyUpgrade("buyNicerStuff")

        buyUpgrade("refineMyConfidence")
        buyUpgrade("refineMyEnergy")
        buyUpgrade("refineMyConcentration")
        buyUpgrade("refineMyObservation")
    }

    //6h: 3.4e43, HATL 4, GR 7, cast 49, thread 30
    //OOTL 52


    if(debugLevel >= 14) {
        data.ancientCoin += 135;
        data.ancientWhisper += 40;
        statAddAmount("legacy", 3225 + 3100);

        buyUpgrade("investMyCoins")

        buyUpgrade("increaseInitialInvestment")
        buyUpgrade("increaseInitialInvestment")
        buyUpgrade("refineMyEndurance")
    }

    //9:20: 3.5e45, HATL 4, GR 7, cast 53, thread 32, fix 1
    //OTTL 59

    if(debugLevel >= 15) {
        data.ancientCoin += 135;
        data.ancientWhisper += 40;
        statAddAmount("legacy", 3225 + 5044);

        unlockAction(data.actions.fixTheFormula)
        buyUpgrade("refineMyControl")
        buyUpgrade("refineMyWizardry")
    }

    //6:10h: 8.36e44, HATL 4, GR 7, cast 52, thread 31, fix 1
    //OTTL 57

    if(debugLevel >= 16) {
        data.ancientCoin += 135;
        data.ancientWhisper += 40;
        statAddAmount("legacy", 3225 + 4730);

        buyUpgrade("feelTheEchoesOfTheBurntTown")
        buyUpgrade("recognizeTheFamiliarity")
        buyUpgrade("startALittleQuicker")
    }

    //2h, 6.5e38, HATL 2, GR 3, cast 34, thread 32 = 628/60/40
    //3h, 2.63e42, HATL 3, GR 7, cast 45, thread 32, feel 1 = 2434/90/40
    //6:10, 8.69e47, HATL 4, GR 7, cast 52, thread 32, fix 1
    //OTTL 67

    //7:30, 4.6e48, HATL 5, GR 7, cast 54, thread 33, fix 1 = 5604/202.5/40

    //doing a few 3h runs to unlock the rest of whispers:
    //17, 18, 19, 20, 21 = 12500 / 450 / 200

    if(debugLevel >= 31) {
        data.ancientCoin += 1350;
        data.ancientWhisper += 700;
        statAddAmount("legacy", 85875);

        buyUpgrade("buyNicerStuff") //45
        buyUpgrade("shapeMyMana") //80
        buyUpgrade("chatLongerWithAllies") //90
        buyUpgrade("investMyCoins") //100
        buyUpgrade("feelTheEchoesOfTheBurntTown") //120
        buyUpgrade("useMoreComplexSpells") //100
        buyUpgrade("improveMyGrimoire")  //160


        buyUpgrade("startALittleQuicker")
        buyUpgrade("increaseInitialInvestment")
        buyUpgrade("increaseInitialInvestment")

        buyUpgrade("refineMyAmbition")
        buyUpgrade("refineMyMight")
        buyUpgrade("refineMySpark")
        buyUpgrade("refineMyNavigation")
        buyUpgrade("refineMySavvy")
        buyUpgrade("refineMyInfluence")
        buyUpgrade("refineMyValor")
        buyUpgrade("refineMyAwareness")
        buyUpgrade("refineMyConfidence")
        buyUpgrade("refineMyEnergy")
        buyUpgrade("refineMyPulse")
        buyUpgrade("refineMyVision")
        buyUpgrade("refineMyAmplification")
        buyUpgrade("refineMyLeverage")

        buyUpgrade("channelMore")
    }



    if(debugLevel >= 32) {
        unlockAction(data.actions.boldenLines)
        unlockAction(data.actions.overproduce)
        unlockAction(data.actions.overhear)
        unlockAction(data.actions.modifyAuraDensity)
        unlockAction(data.actions.createAVoid);
        unlockAction(data.actions.grindPigments);
    }

    //2h: 1e42, HATL 3, 24 MQ, cast 46, thread 27 = 2837/90/40
    //3:50h, 7.08e46, HATL 4, 60 MQ, cast 58, thread 32 = 6527/236.25/150
    //6h: 7.6e50, HATL 5, 66 MQ, cast 66, thread 35 = 9418/354.38/150
    //9h: 4e56, HATL 6, 156 MQ, cast 76, thread 40 = 20k+18500/531.56/150
    //11h: 6e58, HATL 7, 210 MQ, cast 83, thread 43 = 40k + 26k/797.34/150


    //10:10h: 5.7e56, HATL 6, 210 MQ, cast 90, thread 42, repair 1
    if(debugLevel >= 33) {
        statAddAmount("legacy", 3.3e4 + 3e4);
        data.ancientCoin += 531.56;
        data.ancientWhisper += 110;

        buyUpgrade("startALittleQuicker")
        buyUpgrade("startALittleQuicker")
        buyUpgrade("increaseInitialInvestment")
        buyUpgrade("channelMore")
    }

    //9:10h: 6.7e56, HATL 6, 210 MQ, cast 90, thread 43, repair 1

    if(debugLevel >= 34) {
        statAddAmount("legacy", 3.3e4 + 3e4);
        data.ancientCoin += 531.56;
        data.ancientWhisper += 120;

        buyUpgrade("haveBetterIceBreakers")
        buyUpgrade("refineMyCharm")
        buyUpgrade("refineMyConcentration")
    }

    //9h: 1.07e58, HATL 7, 270 MQ, cast 95, thread 44, repair 1

    if(debugLevel >= 35) {
        statAddAmount("legacy", 3.3e4 + 3.8e4);
        data.ancientCoin += 797.56;
        data.ancientWhisper += 120;

        buyUpgrade("glimpseTheWeave")
        buyUpgrade("increaseMyPace")
    }

    //11h: 6.6e59, HATL 7, 336 MQ, cast 104, thread 47, repair 2

    if(debugLevel >= 35) {
        statAddAmount("legacy", 6.3e4 + 5.59e4);
        data.ancientCoin += 797.56;
        data.ancientWhisper += 120;

        buyUpgrade("extractMyWorth")
        buyUpgrade("listenToThePast")
        buyUpgrade("refineMyObservation")
        buyUpgrade("refineMyCycle")
        buyUpgrade("refineMyArchmagery")
        buyUpgrade("refineMySpark")
    }

    //10h: 8.64e59, HATL 7, 336 MQ, cast 105, thread 49, repair 2

    if(debugLevel >= 36) {
        statAddAmount("legacy", 6.3e4 + 5.59e4);
        data.ancientCoin += 797.56;
        data.ancientWhisper += 120;

        buyUpgrade("refineMyControl")
        buyUpgrade("refineMyResonance")
        buyUpgrade("refineMySpellcraft")
    }

    //10h: 1e61, HATL 8, 408 MQ, cast 109, thread 51

    if(debugLevel >= 37) {
        statAddAmount("legacy", 6.3e4 + 6.7e4);
        data.ancientCoin += 1196;
        data.ancientWhisper += 120;

        buyUpgrade("refineMyWizardry")
        buyUpgrade("refineMyAmbition")
        buyUpgrade("refineMyEndurance")
        buyUpgrade("refineMyMight")
        buyUpgrade("refineMySavvy")
        buyUpgrade("refineMyInfluence")
        buyUpgrade("refineMyIntegration")
        buyUpgrade("refineMyLeverage")
        buyUpgrade("refineMyAwareness")
    }

    //8h: 3e61, HATL 8, 408 MQ, cast 110, thread 51


    if(debugLevel >= 38) {
        statAddAmount("legacy", 6.3e4 + 7.15e4);
        data.ancientCoin += 1196;
        data.ancientWhisper += 120;

        buyUpgrade("refineMyConfidence")
        buyUpgrade("refineMyCharm")
        buyUpgrade("refineMyObservation")
        buyUpgrade("refineMyEndurance")
        buyUpgrade("refineMyNavigation")
    }

    //7h: 5e60, HATL 8, 408 MQ, cast 109, thread 51


    if(debugLevel >= 39) {
        statAddAmount("legacy", 6.3e4 + 6.7e4);
        data.ancientCoin += 1196;
        data.ancientWhisper += 120;

        buyUpgrade("refineMyAmplification")
        buyUpgrade("refineMyValor")
        buyUpgrade("refineMyEnergy")
        buyUpgrade("refineMyVision")
    }

    //then 2h runs for the 120 AW until I have it all

    if(debugLevel >= 40) {
        statAddAmount("legacy", 12000);
        data.ancientCoin += 4000;
        data.ancientWhisper += 1200;


        buyUpgrade("shapeMyMana") //160
        buyUpgrade("useMoreComplexSpells") //200
        buyUpgrade("investMyCoins") //200
        buyUpgrade("feelTheEchoesOfTheBurntTown") //240
        buyUpgrade("chatLongerWithAllies") //270
        buyUpgrade("shapeMyMana") //320

        buyUpgrade("increaseInitialInvestment")
        buyUpgrade("increaseInitialInvestment")
        buyUpgrade("learnToFocusMore")
        buyUpgrade("learnToFocusMore")
        buyUpgrade("temperMyDesires")
        buyUpgrade("channelMore")
        buyUpgrade("listenToThePast")
        buyUpgrade("increaseMarketCap")
        buyUpgrade("increaseMarketCap")

        changeAutomationOnReveal("spendFortune", 50)
    }

    if(debugLevel >= 41) {
        unlockAction(data.actions.hearThePulse);
        unlockAction(data.actions.findTheThread);
        unlockAction(data.actions.layerAura);
        unlockAction(data.actions.condenseMana);
        unlockAction(data.actions.chargeInk);
        unlockAction(data.actions.overponder);

    }

    if(debugLevel >= 45) {
        statAddAmount("legacy", 1e6);
        data.ancientCoin += 4500;
        data.ancientWhisper += 1200;


        buyUpgrade("investMyCoins")
        buyUpgrade("feelTheEchoesOfTheBurntTown")
        buyUpgrade("shapeMyMana")
        unveilPlane(3)
    }



    //apply debug bonus stats
    for (let attVar in data.atts) {
        let attObj = data.atts[attVar];
        attsSetBaseVariables(attObj);
        statAddAmount(attVar, 0);
        if(data.atts[attVar].attBase !== 0) { //if it has a bonus applied
            revealAtt(attVar);
        }
    }

    for (let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        let dataObj = actionData[actionVar];
        if(dataObj.plane !== 1) {
            actionObj.unlockedCount = debugLevel
        }
        if(!actionObj.unlocked) {
            actionObj.unlockCost = (1 - (actionObj.unlockedCount * .04) / (1 + actionObj.unlockedCount * .04)) * dataObj.unlockCost;
        }
        views.updateVal(`${actionVar}UnlockText`, generateUnlockText(actionVar), "innerHTML");
    }



    // changeBonusSpeed(50)
    // toggleBonusSpeed()



}

function initializeData() {
    createUpgrades(false);
    createAndLinkNewAttribute("doom", "doom");
    createAndLinkNewAttribute("synthesis", "integration");
    createAndLinkNewAttribute("synthesis", "legacy");
    createAndLinkNewAttribute("synthesis", "resonance");
    createAndLinkNewAttribute("synthesis", "hope");


    createAndLinkNewAttribute("introspection", "awareness");
    createAndLinkNewAttribute("introspection", "concentration");
    createAndLinkNewAttribute("introspection", "curiosity");
    createAndLinkNewAttribute("introspection", "observation");
    createAndLinkNewAttribute("introspection", "intellect");
    createAndLinkNewAttribute("introspection", "comfort");
    createAndLinkNewAttribute("introspection", "peace");

    createAndLinkNewAttribute("adventuring", "endurance");
    createAndLinkNewAttribute("adventuring", "might");
    createAndLinkNewAttribute("adventuring", "flow");
    createAndLinkNewAttribute("adventuring", "coordination");
    createAndLinkNewAttribute("adventuring", "rhythm");
    createAndLinkNewAttribute("adventuring", "reflex");

    createAndLinkNewAttribute("adventuring", "navigation");
    createAndLinkNewAttribute("adventuring", "instinct");
    createAndLinkNewAttribute("adventuring", "initiative");
    createAndLinkNewAttribute("adventuring", "logistics");
    createAndLinkNewAttribute("adventuring", "valor");

    createAndLinkNewAttribute("money", "energy");
    createAndLinkNewAttribute("money", "ambition");
    createAndLinkNewAttribute("money", "savvy");
    createAndLinkNewAttribute("money", "geared");
    createAndLinkNewAttribute("money", "cunning");
    createAndLinkNewAttribute("money", "leverage");
    createAndLinkNewAttribute("money", "adaptability");

    createAndLinkNewAttribute("socialization", "confidence");
    createAndLinkNewAttribute("socialization", "recognition");
    createAndLinkNewAttribute("socialization", "charm");
    createAndLinkNewAttribute("socialization", "influence");
    createAndLinkNewAttribute("socialization", "discernment");
    createAndLinkNewAttribute("socialization", "deception");
    createAndLinkNewAttribute("socialization", "command");
    createAndLinkNewAttribute("socialization", "diplomacy");

    createAndLinkNewAttribute("magic", "cycle");
    createAndLinkNewAttribute("magic", "control");
    createAndLinkNewAttribute("magic", "amplification");
    createAndLinkNewAttribute("magic", "pulse");
    createAndLinkNewAttribute("magic", "spark");
    createAndLinkNewAttribute("magic", "vision");
    createAndLinkNewAttribute("magic", "wizardry");
    createAndLinkNewAttribute("magic", "spellcraft");
    createAndLinkNewAttribute("magic", "archmagery");

    //intro
    create("overclock", ["reflect", "bodyAwareness", "travelOnRoad", "makeMoney", "socialize"], 0, 0); //generateMana
    create("reflect", ["harnessOverflow", "distillInsight", "takeNotes", "remember"], -1, -1);
    create("harnessOverflow", [], -1.1, .5);
    create("distillInsight", ["siftExcess"], -2, 0);
    create("siftExcess", [], -1, .5);
    create("takeNotes", ["journal", "readBooks"], -1.1, -.5);
    create("bodyAwareness", ["meditate", "standStraighter"],-1, 0);
    create("remember", ["processEmotions"], -.2, -1.2);
    create("travelOnRoad", ["travelToOutpost", "watchBirds"], 2, 0);
    create("travelToOutpost", ["meetVillageLeaderScott", "checkNoticeBoard", "browseLocalMarket", "pleasantForest"], 2, 0);
    create("meetVillageLeaderScott", ["helpScottWithChores"], 0, -1);
    create("helpScottWithChores", [], 0, -1);
    create("browseLocalMarket", ["browseStores"], -1, -1);
    create("browseStores", ["browseBackrooms"], 0, -1);
    create("browseBackrooms", ["browsePersonalCollection"], 0, -1);
    create("browsePersonalCollection", [], 0, -1);


    create("checkNoticeBoard", ["reportForTraining", "reportForLabor"], 1.5, -1);
    create("makeMoney", ["spendMoney"], 1, -1);
    create("spendMoney", ["buyBasicSupplies", "buySocialAccess", "buyMarketItems"], 0, -1);
    create("buyBasicSupplies", ["buyBasicClothes", "buyStreetFood", "buyHouse"], -.2, -1.5);
    create("buyBasicClothes", ["buyTravelersClothes", "buyMatchingClothes"], -1, -1.3);
    create("buyTravelersClothes", ["buyTravelersGear"], -1, -.2);
    create("buyMarketItems", ["buyShopItems"], 1, -1);
    create("buyShopItems", ["invest", "buyShinyThings"], 0, -1);
    create("buyStreetFood", ["buyGoodFood"], -1.1, -.5);
    create("buyGoodFood", ["buyArtisanFood"], -1.2, -.2);
    create("buyMatchingClothes", ["buyStylishClothes"], -1, -1.2);
    create("buyStylishClothes", ["buyComfyShoes"], -1, -.2);

    create("buyComfyShoes", [], -1, .1);
    create("buyTravelersGear", [], -1, 0);
    create("buyArtisanFood", [], -1, .2);
    create("buyShinyThings", ["buyPotions", "buyTools"], -.1, -1);
    create("buyPotions", [], .9, -1);
    create("buyTools", ["buyCart"], -.1, -1);
    create("buyCart", [], 1, -1);


    create("buySocialAccess", ["slideTheCoin", "buyPointyHat"], -1, -.1);
    create("slideTheCoin", ["buyCoffee"], -.1, -1);
    create("buyCoffee", [], -1, -.1);
    create("buyPointyHat", [], 0, .9);

    create("reportForLabor", ["oddJobsLaborer", "worksiteSweeper"], 1, 0);
    create("oddJobsLaborer", ["chimneySweep"], .5, -1);


    create("invest", ["buildFortune"], 1, -1);
    create("buildFortune", ["reinvest", "spendFortune"], 1, -1);
    create("reinvest", [], 0, 1);
    create("spendFortune", ["investInLocals", "fundTownImprovements", "investInSelf"], 0, -1);

    create("investInLocals", ["hostAFestival"], -1.5, -1);
    create("hostAFestival", ["fundASmallStall"], -.5, -1);

    create("fundASmallStall", [], 0, -1);
    // create("fundATemporaryMarket", [], 0, -1);
    // create("establishPermanentShoppingArea", [], 0, -1);
    // create("bolsterMarket", [], 0, -1);

    create("fundTownImprovements", ["supportLocalLibrary", "recruitACarpenter"], 0, -1.5);
    create("supportLocalLibrary", ["expandLocalLibrary"], 0, -1);
    create("expandLocalLibrary", ["sourceRareBooks"], 0, -1);
    create("sourceRareBooks", [], 0, -1);

    create("recruitACarpenter",["procureQualityWood"], -1, -1);
    create("procureQualityWood",[], 0, -1);

    create("investInSelf", ["makeAPublicDonation", "purchaseALot"], 1.5, -1);
    create("makeAPublicDonation", [], -.5, -1);
    create("purchaseALot", [], .5, -1);


    create("buyHouse", ["buyHouseholdItems"], 0, -1.6);
    create("buyHouseholdItems", ["buyFurniture"], -.2, -1.2);
    create("buyFurniture", ["buyReadingChair", "buyBed"], -1, -.5);
    create("buyReadingChair", ["buyFireplace"], -.5, -1);
    create("buyFireplace", ["buyGoodFirewood"], -1.1, -.2);
    create("buyGoodFirewood", [], -1.1, .1);
    create("buyBed", ["buySilkSheets"], -1, -.2);
    create("buySilkSheets", [], -1, 0);

//--From Upgrades:--


//Shortcut pt 1
    create("watchBirds", ["catchAScent"], 1, .5)
    create("catchAScent", ["exploreDifficultPath"], -1, .5);
    create("exploreDifficultPath", ["keepGoing", "eatGoldenFruit"], 0, 1);
    create("keepGoing", ["climbTheRocks"], 1, .5);
    create("eatGoldenFruit", [], 1, -.5);
    create("climbTheRocks", ["spotAPath"], 1, -.5);
    create("spotAPath", [], 0, -1);
    create("pleasantForest", ["hiddenPath", "exploreTheForest", "travelToCrossroads"], 2, 0);
    create("hiddenPath", ["meetGrumpyHermit"], 0, 1);
    create("meetGrumpyHermit", ["annoyHermitIntoAQuest", "talkToHermit", "learnToStayStill"], 0, 1);
    create("annoyHermitIntoAQuest", ["presentTheOffering"], -1, -.2);
    create("presentTheOffering", [], 0, -1);
    create("talkToHermit", ["inquireAboutMagic"], 1, -.5);
    create("inquireAboutMagic", ["pesterHermitForSecrets"], 0, 1);
    create("pesterHermitForSecrets", [], 0, 1);

    //socialize start
    create("socialize", ["meetPeople"], -1, 1);
    create("meetPeople", ["joinCoffeeClub", "learnToListen", "talkWithScott"], 0, 1);

    create("talkWithScott", ["talkWithJohn"], -1.2, -.5);
    create("talkWithJohn", [], -1.2, 0);

    create("learnToListen", ["chatWithMerchants", "chatWithHermit", "learnToQuestion"], -1.2, .5);
    create("chatWithMerchants", ["listenToWoes", "askAboutStitching", "complimentTheChef"], -1.5, 0);
    create("askAboutStitching", ["tellAJoke"], -1.2, 0);
    create("tellAJoke", [], -1, 0);
    create("complimentTheChef", [], -1.1, -1);
    create("listenToWoes", ["keyToTheBackroom"], -1.1, 1);
    create("keyToTheBackroom", [], -1, 0);

    create("chatWithHermit", ["discussLifeWithHermit", "discussMagicWithHermit"], -1.1, 1);
    create("discussLifeWithHermit", [], -1.1, 1);
    create("discussMagicWithHermit", [], 0, 1);

    create("joinCoffeeClub", ["gossipAroundCoffee"], 0, 1);
    create("gossipAroundCoffee", ["hearAboutTheLich"], 1, 0);
    create("hearAboutTheLich", [], 0, -1.5);

    create("learnToStayStill", ["feelTheResonance"], 0, 1);
    create("feelTheResonance", ["layerTheEchoes"], 0, 1);
    create("layerTheEchoes", ["igniteTheSpark"], -1, 0);
    create("igniteTheSpark", [], 0, -1);
    // create("", [], 0, -1);

    create("exploreTheForest", ["travelAlongTheRiver"], 1, .5);
    create("travelAlongTheRiver", ["gatherRiverWeeds", "restAtWaterfall"], 1, .8);
    create("gatherRiverWeeds", [], 0, 1);
    create("restAtWaterfall", ["visitShrineBehindWaterfall"], 1.3, .5);
    create("visitShrineBehindWaterfall", [], .3, 1);

    create("travelToCrossroads", ["feelAGentleTug", "forgottenShrine"], 2, 0);
    create("forgottenShrine", ["clearTheLeaves"], 1.5, -1.5);
    create("clearTheLeaves", ["humOldTune"], .5, 1);
    create("humOldTune", [], .5, -1);


//Notice board level 2 / Training & Shortcut pt 2
    create("reportForTraining", ["basicTrainingWithJohn"], -.5, -1);
    create("basicTrainingWithJohn", ["noticeTheStrain", "clenchTheJaw", "breatheThroughIt", "ownTheWeight", "moveWithPurpose"], 0, -1.3);
    create("noticeTheStrain", [], -1, .3);
    create("clenchTheJaw", [], 1, .3);
    create("breatheThroughIt", [], -1, -.7);
    create("ownTheWeight", [], 1, -.7);
    create("moveWithPurpose", [], 0, -1.3);


//Notice Board level 3 / Jobs 1
    create("chimneySweep", ["handyman"], .05, -1);
    create("handyman", ["tavernHelper"], .1, -1);
    create("tavernHelper", ["guildReceptionist"], .15, -1);
    create("guildReceptionist", ["messenger"], .2, -1);
    create("messenger", ["townCrier"], .25, -1);
    create("townCrier", ["storyTeller"], .3, -1);
    create("storyTeller", [], .35, -1);

    create("worksiteSweeper", ["digFoundation"], 1.5, -.9);
    create("digFoundation", ["stoneCompression"], .07, -1);
    create("stoneCompression", ["shapeBricks"], .13, -1);
    create("shapeBricks", ["tidyMagesmithShop"], .2, -1);
    create("tidyMagesmithShop", ["clearTheBasement"], .27, -1);
    create("clearTheBasement", ["moldBarsFromScrap"], .34, -1);
    create("moldBarsFromScrap", ["mendGearCracks"], .41, -1);
    create("mendGearCracks", ["assistantMagesmith"], .48, -1);
    create("assistantMagesmith", [], .54, -1);


//Travelling onwards / hermit / dungeon
    create("meditate", [],-2, 0);
    create("journal", ["readTheWritten"], -1, -.5);
    create("readTheWritten", [], -1, -.5);
    create("standStraighter", ["walkAware"], -1, .5);
    create("walkAware", ["projectConfidence"], -2, 0);
    create("projectConfidence", ["mirrorPosture"], -1, 0);
    create("mirrorPosture", [], -1, 0);

    create("feelAGentleTug", ["leaveTheOpenRoad"], 1.5, 1);
    create("leaveTheOpenRoad", ["climbATallTree", "clearTheWreckage"], 1, 1);
    create("climbATallTree", [], .5, 1);
    create("clearTheWreckage", ["discoverBurntTown"], 1, .5);
    create("discoverBurntTown", ["stepThroughAsh", "feelTheDespair", "repairShatteredShrine"], 1, 0);
    create("feelTheDespair", [], 0, 1);
    create("repairShatteredShrine", [], 0, -1);
    create("stepThroughAsh", ["graspTheTragedy", "resonanceCompass"], 1, .5);
    create("graspTheTragedy", [], 0, 1);
    create("climbATallTree", [], 0, 1.5);
    create("resonanceCompass", ["clearIvyWall"], 0, -1);
    create("clearIvyWall", ["scavengeForSupplies", "pullPulsingShard"], .2, -1.1);
    create("pullPulsingShard", [], 0, 1);


    create("scavengeForSupplies", ["skimAHeavyTome", "pryGemLoose", "examineTheArchitecture"], -1, -.4);
    create("pryGemLoose", [], 0, 1);
    create("examineTheArchitecture", [], 0, -1);
    create("skimAHeavyTome", ["clearRubble", "comprehendDifficultTexts", "clearTheDust"], 1, 0);
    create("comprehendDifficultTexts", [], 0, -1);
    create("clearTheDust", [], 0, 1);
    create("clearRubble", ["readFadedMarkers", "dismantleShelves", "markTheLayout"], 1, 0);
    create("dismantleShelves", [], 0, 1);
    create("markTheLayout", [], 0, -1);
    create("readFadedMarkers", ["findAFamiliarLanguage", "decipherOrganization", "mapOutTraps"], 1, 0);
    create("decipherOrganization", [], 0, 1);
    create("mapOutTraps", ["accessForbiddenArea"], 0, -1);
    create("accessForbiddenArea", ["collectSpellBooks"], 0, -1);
    create("collectSpellBooks", [], 1, 0);
    create("findAFamiliarLanguage", ["searchForRelevantBooks", "recognizeRunicLanguages", "catalogUnknownLanguages"], 1, 0);
    create("recognizeRunicLanguages", [], 0, -1);
    create("catalogUnknownLanguages", [], 0, 1);
    create("searchForRelevantBooks", ["collectInterestingBooks", "complainAboutDifficulty", "browseFantasyNovels"], 1, 0);
    create("browseFantasyNovels", [], 0, -1);
    create("complainAboutDifficulty", [], 0, 1);
    create("collectInterestingBooks", ["collectHistoryBooks", "collectMathBooks"], 1, 0);
    create("collectHistoryBooks", [], 0, 1);
    create("collectMathBooks", [], 0, -1);


    create("readBooks", ["catalogNewBooks", "study"], -2, 0);
    create("catalogNewBooks", ["buildPersonalLibrary"], -1, 0);
    create("buildPersonalLibrary", ["expandPersonalLibrary"], -1, .5);
    create("expandPersonalLibrary", [], -1, .5);
    create("study", ["researchBySubject"], -1, -1);
    create("researchBySubject", ["studyHistory", "studyMath", "studyMagic"], -1, -1);

    create("studyHistory", ["readOldStories"], 1, -.5);
    create("readOldStories", ["readOldReligiousTexts", "readWarJournals"], 0, -1);
    create("readOldReligiousTexts", ["readOldProphecies", "readOldPoetry"], -1, 0);
    create("readOldProphecies", [], -1, -1);
    create("readOldPoetry", ["readOldPhilosophy"], 0, -1);
    create("readOldPhilosophy", [], -.5, -1);
    create("readWarJournals", [], 0, -1);

    create("studyMath", ["studyCryptology", "studyArchitecture"], -1, .5);
    create("studyCryptology", [], -.5, 1);
    create("studyArchitecture", [], .5, 1);

    create("studyMagic", ["studySupportSpells"], -1, -.5);
    create("studySupportSpells", ["studyEarthMagic", "studyPracticalMagic"], -1, .5);
    create("studyEarthMagic", ["studyAdvancedEarthMagic"], -1, 0);
    create("studyAdvancedEarthMagic", [], -1, 0);
    create("studyPracticalMagic", ["studyAdvancedPracticalMagic"], -1, 1);
    create("studyAdvancedPracticalMagic", [], -1, 0);

    create("processEmotions", ["reviewOldMemories"], -1, -.5);
    create("reviewOldMemories", ["rememberTheWar", "rememberFriends"], -1, -.5);
    create("rememberTheWar", ["honorTheLost"], -1, -.5);
    create("honorTheLost", ["letGoOfGuilt"], 0, -1);
    create("letGoOfGuilt", [], 0, -1);
    create("rememberFriends", [], 0, -1.5);



    create("learnToQuestion", ["trackMarketMovement", "negotiate", "learnToConnect"], 0, 1.5);
    create("trackMarketMovement", ["catalogueGoods"], 1, 0);
    create("catalogueGoods", [], 1, 0);
    create("negotiate", ["lowerCounteroffer"], 1, 1);
    create("lowerCounteroffer", [], 1, 0);
    create("learnToConnect", ["askAboutRelationships", "askAboutGoals"], 0, 2);
    create("askAboutGoals", ["talkAboutPassions", "talkAboutFears"], -1.5, 0);
    create("talkAboutPassions", [], -1.5, .5);
    create("talkAboutFears", [], -1.5, -.5);
    create("askAboutRelationships", ["talkToTheRecruiters", "learnOfSecretMeeting"], 1, 0);
    create("talkToTheRecruiters", [], 1, 0);
    create("learnOfSecretMeeting", ["getTestedForKnowledge", "joinWizardSociety"], 0, 1);
    create("getTestedForKnowledge", [], 1, 0);
    create("joinWizardSociety", ["misuseATerm", "showOffSpells", "askAboutHistory", "learnFromLegends"], 0, 1);
    create("misuseATerm", ["eavesdropOnArguments"], -1, 1.2);
    create("eavesdropOnArguments", [], 0, 1);
    create("showOffSpells", ["hearCriticisms"], 0, 1);
    create("hearCriticisms", [], 0, 1);
    create("askAboutHistory", ["learnOfFamousMages"], 1, 1.2);
    create("learnOfFamousMages", [], 0, 1);
    create("learnFromLegends", ["talkToArcanistBalthazar", "talkToKeeperSimeon", "talkToWovenElara"], 1.5, 0);
    create("talkToArcanistBalthazar", [], .8, 1);
    create("talkToKeeperSimeon", [], 1.2, 0);
    create("talkToWovenElara", [], .8, -1);



    // create("trainWithTeam", [], 0, -1.2);






    //Plane 2
    create("echoKindle", ["resonanceFurnace"], 0, 0)
    create("resonanceFurnace", ["sparkDecay"], -1, 0)
    create("sparkDecay", ["poolMana"], .5, 1);
    create("poolMana", ["manaExperimentation", "threadArcana"], 0, 1);

    create("manaExperimentation", ["expelMana", "spellResearch"], -1, 0);
    create("expelMana", ["tightenAura", "stretchManaCapacity", "focusInwards"], -1, 1);

    create("tightenAura", ["collectDischargedMotes", "condenseAura"], .5, 1);
    create("collectDischargedMotes", [], 1, 0);
    create("condenseAura", ["solidifyEdges", "modifyAuraDensity"], 0, 1);
    create("solidifyEdges", [], 1, 0);
    create("modifyAuraDensity", ["layerAura"], 0, 1);
    create("layerAura", [], 1, 0);

    create("stretchManaCapacity", ["widenChannels"], -.5, 1);
    create("widenChannels", ["condenseMana"], 0, 1);
    create("condenseMana", ["spinMana"], 0, 1);
    create("spinMana", ["accelerateManaFlow"], .5, 1);
    create("accelerateManaFlow", ["loopTheCircuit"], .5, 1);
    create("loopTheCircuit", [], .5, -1);

    create("focusInwards", ["createAVoid", "prepareForInfusion"], -1.5, .5);
    create("createAVoid", ["hearThePulse"], -1.5, .7);
    create("hearThePulse", ["findTheThread"], -.6, 1);
    create("findTheThread", ["isolateRhythms"], .9, 1);
    create("isolateRhythms", ["matchTempo"], 1.2, -.6);
    create("matchTempo", [], -.5, -1);

    create("prepareForInfusion", ["infuseEyes", "infuseMuscles",
        "infuseSpine", "infuseSenses", "infuseClothing", "infuseInfusion"], -5, 0);

    create("infuseEyes", [], 1, 1);
    create("infuseMuscles", [], .3, 2);
    create("infuseSpine", [], -.7, 2);
    create("infuseSenses", [], -1.7, 1.5);
    create("infuseClothing", [], -2, .5);
    create("infuseHeart", [], -1.5, -.5);
    create("infuseInfusion", [], 0, -1);


    create("practiceIncantations", ["practicePronunciation", "practiceGestures"], -1.3, -.5);
    create("practicePronunciation", [], -1, .8);
    create("practiceGestures", ["practiceVisualizations", "practiceTargeting"], -.8, -1);
    create("practiceVisualizations", [], -1, .8);
    create("practiceTargeting", ["practiceLayering"], -.8, -1);
    create("practiceLayering", [], -1, .8);

    create("spellResearch", ["grimoireResearch", "awakenYourGrimoire", "bindThePages"], -1, -1);

    create("grimoireResearch", ["castToFail", "boldenLines"], -1.5, 0);
    create("castToFail", ["locateWeakness", "practiceIncantations"], -1, .5);
    create("locateWeakness", ["fixTheFormula"], .5, 1);
    create("fixTheFormula", [], 1, -.5);
    create("boldenLines", ["grindPigments", "chargeInk"], -1, -.5);
    create("grindPigments", [], -.5, -1);
    create("chargeInk", [], .5, -1);

    create("awakenYourGrimoire", ["etchTheCircle"], -1, -1);
    create("etchTheCircle", [], 0, -1);
    create("bindThePages", ["infuseTheHide"], 0, -1);
    create("infuseTheHide", [], 0, -1);

    //arcana
    create("threadArcana", ["prepareSpells"], 1, 0);
    create("prepareSpells", ["castingExperience", "prepareInternalSpells", "prepareExternalSpells"], 1, 0);
    create("castingExperience", [], 1.1, 0);

    create("prepareInternalSpells", ["overcharge", "overwork", "overtalk"], 0, 1);
    create("overcharge", ["overboost"], -1, 1);
    create("overboost", ["overponder"], 0, 1);
    create("overponder", [], 0, 1);
    create("overwork", ["overproduce"], 0, 1);
    create("overproduce", ["overdrive"], 0, 1);
    create("overdrive", [], 0, 1);
    create("overtalk", ["overhear"], 1, 1);
    create("overhear", ["overhype"], 0, 1);
    create("overhype", [], 0, 1);

    create("prepareExternalSpells", ["prepareSupportSpells"], 0, -1);
    create("prepareSupportSpells", ["castDirtMagic", "castIronMagic", "castRecoverMagic", "castPracticalMagic"], 0, -1);
    create("castDirtMagic", ["createMounds"], -1.5, -1);
    create("createMounds", ["hardenDirt"], 0, -1);
    create("hardenDirt", ["shapeDefenses"], 0, -1);
    create("shapeDefenses", [], 0, -1);
    create("castIronMagic", ["mendSmallCracks"], -.5, -1);
    create("mendSmallCracks", ["restoreEquipment"], 0, -1);
    create("restoreEquipment", ["reinforceArmor"], 0, -1);
    create("reinforceArmor", [], 0, -1);
    create("castRecoverMagic", ["unblemish"], .5, -1);
    create("unblemish", ["lightHeal"], 0, -1);
    create("lightHeal", ["mendAllWounds"], 0, -1);
    create("mendAllWounds", [], 0, -1);
    create("castPracticalMagic", ["illuminate"], 1.5, -1);
    create("illuminate", ["identifyItem"], 0, -1);
    create("identifyItem", ["detectMagic"], 0, -1);
    create("detectMagic", [], 0, -1);

    // create("", [], 0, 0);

    //KTL
    create("worry", ["courage"], 0, 0);
    create("courage", ["overclockTargetingTheLich"], 1.2, -.3);
    create("overclockTargetingTheLich", ["fightTheEvilForces"], -1, -.7);
    create("fightTheEvilForces", ["bridgeOfBone"], 1.5, -.2);
    create("bridgeOfBone", ["harvestGhostlyField"], 1, 0.5);
    create("harvestGhostlyField", ["geyserFields"], 1, 0.6);
    create("geyserFields", ["destroySiegeEngine"], 1, 0.7);
    create("destroySiegeEngine", ["destroyEasternMonolith"], 1, .8);
    create("destroyEasternMonolith", ["stopDarknessRitual"], .5, 1);
    create("stopDarknessRitual", ["protectTheSunstone"], 0, 1);
    create("protectTheSunstone", ["silenceDeathChanters"], -.5, 1);
    create("silenceDeathChanters", ["breakFleshBarricade"], -1, 1);
    create("breakFleshBarricade", ["conquerTheGatekeepers"], -1, .5);
    create("conquerTheGatekeepers", ["unhookSacrificialCages"], -1, 0);
    create("unhookSacrificialCages", ["purgeUnholyRelics"], -1, -.2);
    create("purgeUnholyRelics", ["destroyWesternMonolith"], -1, -.5);
    create("destroyWesternMonolith", ["destroyFleshGrowths"], -1, -.8);
    create("destroyFleshGrowths", ["crackCorruptedEggs"], -.5, -1);
    create("crackCorruptedEggs", ["kiteTheAbomination"], 0, -1);
    create("kiteTheAbomination", ["collapseCorpseTower"], .5, -1);
    create("collapseCorpseTower", ["surviveLivingSiegeEngine"], 1, -.5);
    create("surviveLivingSiegeEngine", ["destroySouthernMonolith"], 1, -.2);
    create("destroySouthernMonolith", ["burnFleshPits"], 1, 0);
    create("burnFleshPits", ["openSoulGate"], 1, .5);
    create("openSoulGate", ["shatterTraps"], 1, 1);
    create("shatterTraps", ["killTheArchitect"], 0, 1);
    create("killTheArchitect", ["destroyNorthernMonolith"], -.5, 1);
    create("destroyNorthernMonolith", ["breakOutOfEndlessMaze"], -1, .5);
    create("breakOutOfEndlessMaze", ["killDopplegangers"], -1, -.2);
    create("killDopplegangers", ["killDeathKnights"], -.6, -1);
    create("killDeathKnights", ["silenceDoomScribe"], 0, -1);
    create("silenceDoomScribe", ["removeWards"], 1, -.5);
    create("removeWards", ["fightTheLich"], 1, .5);
    create("fightTheLich", ["killTheLich"], 0, 1);
    create("killTheLich", ["shatterPhylactery"], -1, -.2);
    create("shatterPhylactery", [], -2.1, -.5);





    //Plane 3
    create("reposeRebounded", ["turnTheWheel"], 0, 0)
    create("turnTheWheel", ["tidalBurden", "dipInTheRiver"], -1, 0)
    create("tidalBurden", [], -.5, 1)
    create("dipInTheRiver", ["prepareInfusion"], .5, 1)
    create("prepareInfusion", ["infuseBody", "infuseMind", "infuseSenses", "infuseSenses", "infuseMagic"], 0, 1)
    create("infuseBody", [], -1.5, .5)
    create("infuseMind", [], -.5, 1.5)
    create("infuseSenses", [], .5, 1.5)
    create("infuseMagic", [], 1.5, .5)






    setParents();
    processActionStoriesXML();
}

function setParents() {
    for(let actionVar in data.actions) {
        let dataObj = actionData[actionVar];
        for(let downstreamVar of dataObj.downstreamVars) {
            let downstreamDataObj = actionData[downstreamVar];
            if(downstreamDataObj) {
                downstreamDataObj.parentVar = actionVar;
            }
        }
    }
}

let check = 0;
//Add all action.downstreamVars.forEach(downstreamVar variables to a list
//Repeat until the list is empty:
//Get the next in the list, set its realX and realY based on the parents, and add its downstream vars to the list
function setRealCoordinates(startActionVar) {
    // Create a queue and start with the given action variable
    let queue = [startActionVar];

    while (queue.length > 0) {
        let currentVar = queue.shift();
        let dataObj = actionData[currentVar];
        let actionObj = data.actions[currentVar];
        if(check++ > 2000) {
            data.gameSettings.stop = 1;
            console.log("You have an infinite loop on action creation with: " + currentVar);
            return;
        }

        if (!dataObj) continue; // If action doesn't exist, skip it

        // Determine realX and realY
        let parentAction = actionData[dataObj.parentVar];
        if (dataObj.parentVar && parentAction) {
            dataObj.realX = parentAction.realX + dataObj.x;
            dataObj.realY = parentAction.realY + dataObj.y;
        } else {
            // This is the top-level action
            dataObj.realX = dataObj.x;
            dataObj.realY = dataObj.y;
        }

        // Add downstream actions to the queue
        if (dataObj.downstreamVars && dataObj.downstreamVars.length > 0) {
            dataObj.downstreamVars.forEach(downstreamVar => {
                if (actionData[downstreamVar]) {
                    queue.push(downstreamVar);
                }
            });
        }
    }
}
