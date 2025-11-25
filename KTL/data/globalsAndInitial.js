//Driver globals
let gameSpeed = 1;
let stop = false;
// let bonusTime = 0;

let settings = {}; // Will be populated by the 'start' command.
let timerId = null;
let lastTickTime = 0;
let ticksForSeconds = 0;
let secondsPassed = 0;
let totalTicks = 0;

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



//Game globals - these initializations will be overriden in load TODO do i need these
let data = {};
data.actions = {};
data.atts = {};
data.toastStates = []; // array of toast objects: {id, state, element}
data.planeUnlocked = [true, false, false, false];
data.planeTabSelected = 0;
data.gameState = "default"; //KTL
data.totalMomentum = 0;
data.ancientCoin = 0;
data.useAmuletButtonShowing = false;
data.secondsPerReset = 0;
data.currentJob = "helpScottWithChores";
data.currentWage = 1;
data.doneKTL = false;
data.doneAmulet = false;
data.ancientCoinMultKTL = 1;
data.legacyMultKTL = 1;
data.maxSpellPower = 0;
data.totalSpellPower = 0;
data.chargedSpellPowers = {};
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
    totalTicks: 0,
    secondsPassed: 0,
    KTLBonusTimer: 0,
};


let viewData = {}; //contains only things that are generated / not saved
viewData.toasts = [];

let language = "english";
let globalVisible = false; //SET FOR COMMIT
// let globalVisible = true;
let isLoadingEnabled = true; //SET FOR COMMIT
// let isLoadingEnabled = false;
let loadStaticSaveFile = false; //SET FOR COMMIT
// let loadStaticSaveFile = true;

data.upgrades = {};

let isDebug = false; //SET FOR COMMIT
// let isDebug = true;
function debug() {
    if(!isDebug) {
        return;
    }

    document.getElementById("bonus50").style.display = "";
    data.ancientCoin = 100000;

    // gameSpeed = 1;
    data.currentGameState.bonusTime = 1000 * 60 * 60 * 24 * 7;
    // buyUpgrade("temperMyDesires")
    
    //temp data corrections:
    // revealAction('visitShrineBehindWaterfall')
    // document.getElementById('confirmKTL').checked = true;
    // initializeKTL()


    // data.useAmuletButtonShowing = true;
    // data.doneKTL = true;
    // data.doneAmulet = true;
    // data.displayJob = true;

    //only if the save has skipped the unlock point
    // revealAction('invest');
    // revealAction('feelAGentleTug');
    // revealAction('learnToInquire');

    //foreach action, automation on
    // for(let actionVar in data.actions) {
    //     if(["overcharge", "overboost", "prepareInternalSpells", "earthMagic", "moveEarth", "hardenEarth", "shapeEarth", "moveIron", "reinforceArmor", "restoreEquipment", "practicalMagic", "illuminate", "unblemish", "manaTransfer"].includes(actionVar)) {
    //         continue;
    //     }
    //     let actionObj = data.actions[actionVar];
    //     let dataObj = actionData[actionVar];
    //     actionObj.automationOff = false;
    // }

    // buyUpgrade("askAboutBetterWork"); //1, 30 --
    // buyUpgrade("investMyGold"); //1, 20
    // buyUpgrade("investMyGold"); //2, 40
    // buyUpgrade("feelTheEchoesOfTheBurntTown"); //1, 20
    // buyUpgrade("feelTheEchoesOfTheBurntTown"); //2, 40
    // buyUpgrade("fightAlongsideAllies"); //1, 30 --
    // buyUpgrade("increaseInitialInvestment"); //1, 40
    //
    //
    //
    // buyUpgrade("buyNicerStuff"); //1, 70
    // buyUpgrade("investMyGold"); //3, 80
    // buyUpgrade("increaseInitialInvestment"); //2, 60
    // buyUpgrade("increaseInitialInvestment"); //3, 90
    // buyUpgrade("feelTheEchoesOfTheBurntTown"); //3, 80 --
    // buyUpgrade("learnFromTheLibrary"); //1, 200
    //
    //
    //
    // buyUpgrade("keepMyMagicReady"); //1, 100 --
    // buyUpgrade("buyNicerStuff"); //2, 210
    // buyUpgrade("buyNicerStuff"); //3, 630 --
    // buyUpgrade("investMyGold"); //4, 160
    // buyUpgrade("investMyGold"); //5, 320
    // buyUpgrade("investMyGold"); //6, 640 --
    // buyUpgrade("increaseInitialInvestment"); //4, 135
    // buyUpgrade("increaseInitialInvestment"); //5, 202 --
    // buyUpgrade("learnFromTheLibrary"); //2, 400
    // buyUpgrade("learnFromTheLibrary"); //3, 800
    // buyUpgrade("increaseMarketCap"); //1, 200
    // buyUpgrade("increaseMarketCap"); //2, 300
    // buyUpgrade("increaseMarketCap"); //3, 450
    // buyUpgrade("increaseMarketCap"); //4, 675
    // buyUpgrade("trainTogetherMore"); //1, 400
    // buyUpgrade("stopBeingSoTense"); //1, 500 --
    // buyUpgrade("refineMyLeverage"); //1, 100
    // buyUpgrade("refineMyLeverage"); //2, 300
    // buyUpgrade("refineMyWizardry"); //1, 200
    //
    // statAddAmount("legacy", 28e6)
    // purchaseAction("overponder");
    // buyUpgrade("createABetterFoundation"); //1, 500
    // buyUpgrade("createABetterFoundation"); //2, 750
    // buyUpgrade("createABetterFoundation"); //3, 1125
    // buyUpgrade("workHarder"); //1, 600
    // buyUpgrade("workHarder"); //2, 900
    // buyUpgrade("haveBetterConversations"); //1, 800
    // buyUpgrade("sparkMoreMana"); //1, 800
    // buyUpgrade("studyHarder"); //1, 1000
    // buyUpgrade("rememberWhatIDid"); //1, 600 --
    // buyUpgrade("retrieveMyUnusedResources"); //1, 500
    // buyUpgrade("retrieveMyUnusedResources"); //2, 750
    // buyUpgrade("retrieveMyUnusedResources"); //3, 1125 --
    //
    // buyUpgrade("learnFromTheLibrary"); //4, 1600
    // buyUpgrade("learnFromTheLibrary"); //5, 3200 --
    // buyUpgrade("improveMyHouse"); //1, 400
    // buyUpgrade("improveMyHouse"); //2, 1200
    // buyUpgrade("improveMyHouse"); //3, 3600 --
    //
    // buyUpgrade("rememberHowIGrew"); //1, 2000 --
    // buyUpgrade("rememberMyMastery"); //1, 6000 --
    // buyUpgrade("increaseMarketCap"); //5, 1013 --
    // buyUpgrade("trainTogetherMore"); //2, 800
    // buyUpgrade("trainTogetherMore"); //3, 1600 --
    // buyUpgrade("createABetterFoundation"); //4, 1688 --
    // buyUpgrade("workHarder"); //3, 1200
    // buyUpgrade("workHarder"); //4, 1800 --
    // buyUpgrade("haveBetterConversations"); //2, 1200
    // buyUpgrade("haveBetterConversations"); //3, 1800
    // buyUpgrade("haveBetterConversations"); //4, 2700 --
    // buyUpgrade("sparkMoreMana"); //2, 1600
    // buyUpgrade("sparkMoreMana"); //3, 3200
    // buyUpgrade("sparkMoreMana"); //4, 6400
    // buyUpgrade("studyHarder"); //2, 1500
    // buyUpgrade("studyHarder"); //3, 2250
    // buyUpgrade("studyHarder"); //4, 3375 --







    // setSliderUI("overclock", "reflect", 100);

    //setup system to right before HATL:
    // revealAtt("integration")
    // revealAtt("legacy")
    unveilPlane(0);
    unveilPlane(1);
    unveilPlane(2);
    // statAddAmount("pulse", 10)
    // statAddAmount("integration", 120)
    // unlockAction(data.actions['echoKindle']);
    // statAddAmount("legacy", 385423)

    // revealAction('earthMagic');
    // revealAction('gossipAroundCoffee');
    // revealAction('hearAboutTheLich');

    // data.actions.earthMagic.unlockCost = 0;
    // levelAllCharges();
    // data.actions.earthMagic.resource = 1e10;
    // data.actions.gossipAroundCoffee.unlockCost = 0;
    // data.actions.gossipAroundCoffee.resource += 1e8
    // data.actions.overclock.resource = 1e20;
    // statAddAmount("cycle", 40)
    // statAddAmount("discernment", 200)







}

function initializeData() {
    createUpgrades();
    createAndLinkNewAttribute("doom", "doom");
    createAndLinkNewAttribute("echoes", "legacy");

    createAndLinkNewAttribute("introspection", "courage");
    createAndLinkNewAttribute("introspection", "awareness");
    createAndLinkNewAttribute("introspection", "curiosity");
    createAndLinkNewAttribute("introspection", "observation");
    createAndLinkNewAttribute("introspection", "integration");
    createAndLinkNewAttribute("introspection", "intellect");
    createAndLinkNewAttribute("introspection", "comfort");
    createAndLinkNewAttribute("introspection", "peace");

    createAndLinkNewAttribute("magic", "concentration");
    createAndLinkNewAttribute("magic", "cycle");
    createAndLinkNewAttribute("magic", "control");
    createAndLinkNewAttribute("magic", "amplification");
    createAndLinkNewAttribute("magic", "pulse");
    createAndLinkNewAttribute("magic", "spark");
    createAndLinkNewAttribute("magic", "vision");
    createAndLinkNewAttribute("magic", "wizardry");
    createAndLinkNewAttribute("magic", "spellcraft");
    createAndLinkNewAttribute("magic", "archmagery");

//mettle = fight, grit, resolve, spirit
    createAndLinkNewAttribute("physique", "endurance");
    createAndLinkNewAttribute("physique", "might");
    createAndLinkNewAttribute("physique", "flow");
    createAndLinkNewAttribute("physique", "coordination");
    createAndLinkNewAttribute("physique", "rhythm");
    createAndLinkNewAttribute("physique", "reflex");

    createAndLinkNewAttribute("adventuring", "energy");
    createAndLinkNewAttribute("adventuring", "navigation");
    createAndLinkNewAttribute("adventuring", "instinct");
    createAndLinkNewAttribute("adventuring", "initiative");
    createAndLinkNewAttribute("adventuring", "logistics");
    createAndLinkNewAttribute("adventuring", "valor");

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


    //intro
    create("overclock", ["reflect", "bodyAwareness", "travelOnRoad", "makeMoney", "socialize"], 0, 0); //generateMana
    create("reflect", ["distillInsight", "harnessOverflow", "takeNotes", "remember"], -1, -1);
    create("distillInsight", [], -1.1, .5);
    create("harnessOverflow", ["siftExcess"], -2, 0);
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
    create("buyShopItems", ["invest", "buyUtilityItems"], 0, -1);
    create("buyStreetFood", ["buyGoodFood"], -1.1, -.5);
    create("buyGoodFood", ["buyArtisanFood"], -1.2, -.2);
    create("buyMatchingClothes", ["buyStylishClothes"], -1, -1.2);
    create("buyStylishClothes", ["buyComfyShoes"], -1, -.2);

    create("buyComfyShoes", [], -1, .1);
    create("buyTravelersGear", [], -1, 0);
    create("buyArtisanFood", [], -1, .2);
    create("buyUtilityItems", ["buyPotions", "buyTools"], -.1, -1);
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

    create("learnToListen", ["chatWithMerchants", "chatWithHermit", "learnToInquire"], -1.2, .5);
    create("chatWithMerchants", ["listenToWoes", "askAboutStitching", "complimentTheChef"], -1.5, 0);
    create("askAboutStitching", [], -1.2, 0);
    create("complimentTheChef", [], -1.1, -1);
    create("listenToWoes", ["keyToTheBackroom"], -1.1, 1);
    create("keyToTheBackroom", [], -1, 0);

    create("chatWithHermit", ["tellAJoke"], -1.1, 1);
    create("tellAJoke", [], -1, 1);

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
    create("forgottenShrine", [], 2, -1);


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
    create("walkAware", [], -2, 0);

    create("feelAGentleTug", ["leaveTheOpenRoad"], 1.5, 1);
    create("leaveTheOpenRoad", ["findOverlook", "discoverBurntTown"], 1, 1);
    create("findOverlook", [], .5, 1);
    create("discoverBurntTown", ["stepThroughAsh", "resonanceCompass", "feelTheDespair", "repairShatteredShrine"], 1, 0);
    create("feelTheDespair", [], 0, 1);
    create("repairShatteredShrine", [], 0, -1);
    create("stepThroughAsh", ["graspTheTragedy"], 1, .5);
    create("graspTheTragedy", [], 1, 1);
    create("findOverlook", [], 0, 1.5);
    create("resonanceCompass", ["clearIvyWall"], 1, -.5);
    create("clearIvyWall", ["scavengeForSupplies", "findPulsingShard"], 1, 0);
    create("findPulsingShard", [], 0, 1);


    create("scavengeForSupplies", ["skimAHeavyTome", "pryGemLoose", "examineTheArchitecture"], 1, 0);
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



    create("learnToInquire", ["talkToTheRecruiters"], -.1, 1);
    create("talkToTheRecruiters", ["askAboutLocalWork", "askAboutArcaneCorps"], 1, .5);
    create("askAboutLocalWork", [], 0, 1);
    create("askAboutArcaneCorps", ["getTestedForKnowledge", "discussPlacement"], 1, .2);
    create("getTestedForKnowledge", [], 0, 1);
    create("discussPlacement", ["meetTheMages"], 1, -.1);
    create("meetTheMages", ["trainWithTeam"], .3, -1);
    create("trainWithTeam", [], 0, -1.2);






    //Plane 2
    create("echoKindle", ["sparkMana"], 0, 0)
    create("sparkMana", ["poolMana"], 0, 1);
    create("poolMana", ["expelMana"], 0, 1);
    create("expelMana", ["manaBasics", "prepareSpells", "auraControl",], 0, 1);

    create("auraControl", [], 0, 1);

    create("manaBasics", ["manaExperiments", "magicResearch"], -1, 0);
    create("manaExperiments", ["feelYourMana", "manaObservations"], -.5, 1);
    create("manaObservations", ["manaVisualizations"], 0, 1);
    create("manaVisualizations", ["manaShaping"], -1, 0);
    create("manaShaping", [], -1, 0);
    create("feelYourMana", ["growMagicSenses"], -1, 0);
    create("growMagicSenses", ["listenToTheMana"], -1, 0);
    create("listenToTheMana", ["manaInstinct"], -1, 0);
    create("manaInstinct", [], -1, 0);
    create("magicResearch", ["infuseTheHide"], -.5, -1);
    create("infuseTheHide", ["etchTheCircle"], -1, 0);
    create("etchTheCircle", ["bindThePages"], -.5, 1);
    create("bindThePages", ["awakenYourGrimoire"], -1, 0);
    create("awakenYourGrimoire", [], .5, -1);

    create("prepareSpells", ["prepareInternalSpells", "prepareExternalSpells"], 1, 0);
    create("prepareExternalSpells", ["supportSpells", "recoverSpells", "combatSpells"], .5, -1);
    create("supportSpells", ["earthMagic", "divination", "practicalMagic"], 0, -1);

    create("divination", ["identifyItem"], 1.5, -.5);
    create("identifyItem", ["detectMagic"], 0, -1);
    create("detectMagic", [], 0, -1);
    create("practicalMagic", ["illuminate"], .5, -1);
    create("illuminate", ["unblemish"], 0, -1);
    create("unblemish", ["manaTransfer"], 0, -1);
    create("manaTransfer", [], 0, -1);

    create("recoverSpells", ["healingMagic"], 1, -.5);
    create("earthMagic", ["moveEarth"], -.5, -1);
    create("moveEarth", ["hardenEarth"], 0, -1);
    create("hardenEarth", ["shapeEarth"], 0, -1);
    create("shapeEarth", ["moveIron"], 0, -1);
    create("moveIron", ["reinforceArmor"], 0, -1);
    create("reinforceArmor", ["restoreEquipment"], 0, -1);
    create("restoreEquipment", [], 0, -1);

    create("healingMagic", ["singleTargetHealing", "massHeal"], 1.5, -.5);
    create("singleTargetHealing", ["purifyPoison"], 0, -1);
    create("purifyPoison", [], 0, -1);
    create("massHeal", ["auraHealing", "healBurst"], 1, -1);
    create("auraHealing", [], 0, -1);
    create("healBurst", [], 1, -1);

    create("combatSpells", ["swarmSpells", "wardMagic", "duellingSpells"], 1, .5);
    create("swarmSpells", ["fireball"], 1, 1.5);
    create("fireball", [], 1, 0);
    create("wardMagic", ["ward"], 1, .5);
    create("ward", [], 1, 0);
    create("duellingSpells", ["firebolt"], 1, -.5);
    create("firebolt", [], 1, 0);


    create("prepareInternalSpells", ["overcharge"], 0, 1);
    create("overcharge", ["overboost"], 1, 0);
    create("overboost", ["overponder"], 0, 1);
    create("overponder", [], 0, 1);
    // create("", [], 0, 0);

    //KTL
    create("worry", ["resolve"], 0, 0);
    create("resolve", ["overclockTargetingTheLich"], 1.2, -.3);
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
    create("absorbStarseed", [], 0, 0)





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
