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
let saveName = "KTLsave"; //Blank if you don't want to save, change name to force user reset

let forceStop = false;



//Game globals - these initializations will be overriden in load TODO do i need these
let data = {};
data.actions = {};
data.atts = {};
data.toastStates = []; // array of toast objects: {id, state, element}
data.planeTabSelected = 0;
data.gameState = "default"; //KTL
data.totalMomentum = 0;
data.ancientCoin = 0;
data.useAmuletButtonShowing = false;
data.secondsPerReset = 0;
data.currentJob = "Helping Scott";
data.currentWage = 1;
data.numberType = "engineering"; //or scientific
data.doneKTL = false;
data.doneAmulet = false;
data.focusSelected = [];
data.maxFocusAllowed = 2;
data.focusMult = 2;
data.focusLoopMax = 2.5;
data.options = {};
data.options.updateRate = 20;
data.options.autosaveRate = 10;
data.options.bonusRate = 2;

// --- Core Settings ---
data.gameSettings = {
    gameSpeed: 1,
    bonusSpeed: 1,
    stop: false,
    stopAll: false,
    fps: 20,
    ticksPerSecond: 20
};

// --- Dynamic Game State ---
data.currentGameState = {
    bonusTime: 0,
    totalTicks: 0,
    secondsPassed: 0,
};


let viewData = {}; //contains only things that are generated / not saved
viewData.toasts = [];

let language = "english";
let globalVisible = false;
let isLoadingEnabled = true; //SET FALSE FOR CLEARING SAVE


data.upgrades = {};

let isDebug = true;
function debug() {
    if(!isDebug) {
        return;
    }
    // data.useAmuletButtonShowing = true;
    // data.doneKTL = true;
    // data.doneAmulet = true;
    // data.displayJob = true;
    // data.ancientCoin = 300;
    // buyUpgrade("buyNicerStuff", 0);
    // buyUpgrade("stopLettingOpportunityWait", 0);
    // buyUpgrade("stopLettingOpportunityWait", 1);
    // buyUpgrade("stopLettingOpportunityWait", 2);
    // setSliderUI("overclock", "reflect", 100);
    // unveilAction('makeMoney');
    // unveilAction('spendMoney');
    // unveilAction('checkNoticeBoard');
    data.actions.echoKindle.resource += 10;

    // globalVisible = true;
    // stop = 1;

    gameSpeed = 1;
    data.currentGameState.bonusTime = 1000 * 60 * 60 * 24;
}

function initializeData() {
    if(globalVisible) {
        document.getElementById("jobDisplay").style.display = "";
    }
    createUpgrades();

    createAndLinkNewAttribute("introspection", "awareness");
    createAndLinkNewAttribute("introspection", "curiosity");
    createAndLinkNewAttribute("introspection", "observation");
    createAndLinkNewAttribute("introspection", "processing");
    createAndLinkNewAttribute("introspection", "stillness");
    createAndLinkNewAttribute("introspection", "integration");

    createAndLinkNewAttribute("magic", "concentration");
    createAndLinkNewAttribute("magic", "cycle");
    createAndLinkNewAttribute("magic", "control");
    createAndLinkNewAttribute("magic", "amplification");
    createAndLinkNewAttribute("magic", "pulse");
    createAndLinkNewAttribute("magic", "spark");
    createAndLinkNewAttribute("magic", "vision");
    createAndLinkNewAttribute("magic", "spellcraft");
    createAndLinkNewAttribute("magic", "wizardry");
    createAndLinkNewAttribute("magic", "archmagery");

//mettle = fight, grit, resolve, spirit
    createAndLinkNewAttribute("physique", "endurance");
    createAndLinkNewAttribute("physique", "might");
    createAndLinkNewAttribute("physique", "flow");
    createAndLinkNewAttribute("physique", "coordination");
    createAndLinkNewAttribute("physique", "reflex");
    createAndLinkNewAttribute("physique", "rhythm");

    createAndLinkNewAttribute("adventuring", "energy");
    createAndLinkNewAttribute("adventuring", "navigation");
    createAndLinkNewAttribute("adventuring", "comfort");
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
    
    //KTL
    create("overclockTargetingTheLich", ["killHorde"], 0, 0);
    create("killHorde", ["killElites"], 1, .1);
    create("killElites", ["killDevils"], 1, .2);
    create("killDevils", ["killGenerals"], 1, .3);
    create("killGenerals", [], 1, .5);

    //intro
    create("overclock", ["reflect", "bodyAwareness", "travelOnRoad", "makeMoney", "socialize"], 0, 0); //generateMana
    create("reflect", ["distillInsight", "harnessOverflow", "takeNotes", "remember"], -1, -1);
    create("distillInsight", [], -1.1, .5);
    create("harnessOverflow", [], -2, 0); //siftExcess
    create("takeNotes", ["journal"], -1.1, -.5);
    create("bodyAwareness", ["meditate", "walkAware", "standStraighter"],-1, 0);
    create("remember", [], -.2, -1.2);
    create("travelOnRoad", ["travelToOutpost", "watchBirds"], 2, 0);
    create("travelToOutpost", ["meetVillageLeaderScott", "checkNoticeBoard", "browseLocalMarket"], 2, 0); //travelToCrossroads
    create("meetVillageLeaderScott", ["helpScottWithChores"], 0, -1);
    create("helpScottWithChores", [], 0, -1);
    create("browseLocalMarket", [], -1, -1);
    create("checkNoticeBoard", ["reportForTraining", "reportForLabor"], 1.5, -1);
    create("makeMoney", ["spendMoney"], 1, -1);
    create("spendMoney", ["buyBasicSupplies", "buySocialAccess", "buyMarketItems"], 0, -1);
    create("buyBasicSupplies", ["buyBasicClothes"], -1, -1);
    create("buyBasicClothes", [], -1, -1);
    create("buyMarketItems", ["buyShopItems", "invest"], 1, -1);
    create("buyShopItems", [], 0, -1);
    create("invest", ["buildFortune"], 1, -1);
    create("buildFortune", ["deepInvestments", "investInLocals"], 0, -1);
    create("deepInvestments", [], 1, -.5);
    create("investInLocals", ["investInRoads"], 0, -1);
    create("investInRoads", [], 0, -1);
    create("buySocialAccess", ["slideTheCoin"], 0, -1);
    create("slideTheCoin", ["buyCoffee"], -1, -1);
    create("buyCoffee", [], .5, -1);
    create("reportForLabor", ["oddJobsLaborer"], 1, 0);
    create("oddJobsLaborer", ["chimneySweep"], .5, -1);
    create("socialize", ["meetPeople"], -1, 1);
    create("meetPeople", ["joinCoffeeClub"], 0, 1); //talkToScott, casualConversations
    create("joinCoffeeClub", ["gossip"], 0, 1);
    create("gossip", ["hearAboutTheLich"], 1, 0);
    create("hearAboutTheLich", [], 0, -1.5);

//--From Upgrades:--


//Shortcut pt 1
    create("watchBirds", ["catchAScent"], 1, .5)
    create("catchAScent", ["questionTheTrail"], -1, .5);
    create("questionTheTrail", ["stepOffToExplore", "eatGoldenFruit"], 0, 1);
    create("stepOffToExplore", ["climbTheRocks"], 1, .5);
    create("eatGoldenFruit", [], 1, -.5);
    create("climbTheRocks", ["spotAPath"], 1, -.5);
    create("spotAPath", [], 0, -1);

//Meditate
    create("journal", [], -1.9, 0); //readTheWritten
    create("meditate", ["feelTheAche"],-2, 0);
    create("feelTheAche", ["softenTension"], -1, .5);
    create("softenTension", ["releaseExpectations"], -1, .5);
    create("releaseExpectations", [], -1, .5);
    create("walkAware", [], -1, .5);
    create("standStraighter", [], -1, 1.5);

//Notice board level 2 / Training & Shortcut pt 2
    create("reportForTraining", ["basicTrainingWithJohn"], -.5, -1);
    create("basicTrainingWithJohn", ["noticeTheStrain", "clenchTheJaw", "breatheThroughIt", "ownTheWeight", "moveWithPurpose"], 0, -1.3);
    create("noticeTheStrain", [], -1, .3);
    create("clenchTheJaw", [], 1, .3);
    create("breatheThroughIt", [], -1, -.7);
    create("ownTheWeight", [], 1, -.7);
    create("moveWithPurpose", [], 0, -1.3);


//Notice Board level 3 / Jobs 1
    create("chimneySweep", ["handyman"], 0, -1);
    create("handyman", ["tavernHelper"], 0, -1);
    create("tavernHelper", ["guildReceptionist"], 0, -1);
    create("guildReceptionist", ["messenger"], 0, -1);
    create("messenger", ["townCrier"], 0, -1);
    create("townCrier", ["storyTeller"], 0, -1);
    create("storyTeller", [], 0, -1);

//Travelling onwards / hermit / dungeon


    //Plane 2
    create("echoKindle", ["sparkMana"], 0, 0)
    create("sparkMana", ["poolMana"], 0, 1);
    create("poolMana", ["expelMana"], 0, 1);
    create("expelMana", ["prepareSpells", "manaImprovement", "auraControl",], 0, 1);

    create("auraControl", [], 0, 1);

    create("manaImprovement", ["manaExperiments", "magicResearch"], -1, 0);
    create("manaExperiments", ["manaObservations", "feelYourMana"], -.5, 1);
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

    create("prepareSpells", ["prepareDungeonSpells", "preparePhysicalSpells"], 1, 0);
    create("prepareDungeonSpells", ["supportSpells", "recoverSpells", "combatSpells"], .5, -1);
    create("supportSpells", ["divination", "practicalMagic"], 0, -1);

    create("divination", ["identifyItem"], -.5, -1);
    create("identifyItem", ["detectMagic"], 0, -1);
    create("detectMagic", [], 0, -1);
    create("practicalMagic", ["manaTransfer"], .5, -1);
    create("manaTransfer", ["illuminate"], 0, -1);
    create("illuminate", ["unblemish"], 0, -1);
    create("unblemish", [], 0, -1);

    create("recoverSpells", ["earthMagic", "healingMagic"], 1, -.5);
    create("earthMagic", ["moveEarth"], .5, -1);
    create("moveEarth", ["shelter"], 0, -1);
    create("shelter", ["reinforceArmor"], 0, -1);
    create("reinforceArmor", ["sharpenWeapons"], 0, -1);
    create("sharpenWeapons", ["repairEquipment"], 0, -1);
    create("repairEquipment", ["restoreEquipment"], 0, -1);
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


    create("preparePhysicalSpells", ["overcharge"], 0, 1);
    create("overcharge", ["overboost"], 1, 0);
    create("overboost", ["overdrive"], 0, 1);
    create("overdrive", [], 0, 1);
    // create("", [], 0, 0);


    //Plane 3
    create("absorbStarseed", [], 0, 0)

/*

Market:
* Opens a bunch of energy gains from food
* Lots of social improvements with clothes
* random improvement with stall chats

Socialization:
* Talk to Scott
* Big buffs to everything existing

Travel and Emotions:
* Process emotions for the buffs
* travel through hermit for the stuff


 */


//TODO...

    // create("readTheWritten", [], -1, 0);
    // create("siftExcess", [], -1.9, 0);







    setParents();
}

function setParents() {
    for(let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        for(let downstreamVar of actionObj.downstreamVars) {
            if(data.actions[downstreamVar]) {
                data.actions[downstreamVar].parentVar = actionVar;
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
        if (actionObj.parentVar && actionData[actionObj.parentVar]) {
            let parentAction = actionData[actionObj.parentVar];
            dataObj.realX = parentAction.realX + dataObj.x;
            dataObj.realY = parentAction.realY + dataObj.y;
        } else {
            // This is the top-level action
            dataObj.realX = dataObj.x;
            dataObj.realY = dataObj.y;
        }

        // Add downstream actions to the queue
        if (actionObj.downstreamVars && actionObj.downstreamVars.length > 0) {
            actionObj.downstreamVars.forEach(downstreamVar => {
                if (actionData[downstreamVar]) {
                    queue.push(downstreamVar);
                }
            });
        }
    }
}
