//Driver globals
let gameSpeed = 1;
let bonusSpeed = 1;

let curTime = new Date();
let gameTicksLeft = 0;
let sudoStop = false;
let ticksPerSecond = 20;
let totalTime = 0;
let ticksForSeconds = 0;
let secondsPassed = 0;
//Store offline time
let bonusTime = 0;
let mainTickLoop;
let windowFps = 50;
let lastSave = Date.now();

//Saving globals
let isFileSystem = !!location.href.match("file");
let saveName = "KTLsave"; //Blank if you don't want to save, change name to force user reset

let stop = false;
let forceStop = false;

let prevState = {};
prevState.res = {};
prevState.actions = {};
prevState.atts = {};

//Game globals - these initializations will be overriden in load
let data = {};
data.actions = {};
data.atts = {};
data.toastStates = []; // array of toast objects: {id, state, element}
data.gameState = "default"; //KTL
data.totalMomentum = 0;
data.essence = 0;
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
data.options.updateRate = 50;
data.options.autosaveRate = 10;
data.options.bonusRate = 2;

let viewData = {}; //contains only things that are generated / not saved
viewData.toasts = [];

let language = "english";
let globalVisible = false;
let forceVisuals = false;
let isLoadingEnabled = false; //SET FALSE FOR CLEARING SAVE


data.upgrades = {};

let isDebug = true;
function debug() {
    if(!isDebug) {
        return;
    }
    data.useAmuletButtonShowing = true;
    data.doneKTL = true;
    data.doneAmulet = true;
    data.displayJob = true;
    data.essence = 300;
    // buyUpgrade("buyNicerStuff", 0);
    buyUpgrade("stopLettingOpportunityWait", 0);
    buyUpgrade("stopLettingOpportunityWait", 1);
    buyUpgrade("stopLettingOpportunityWait", 2);
    setSliderUI("overclock", "reflect", 100);
    gameSpeed = 1;
    bonusTime = 1000 * 60 * 60 * 24;
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
    createAndLinkNewAttribute("magic", "willpower");
    createAndLinkNewAttribute("magic", "amplification");
    createAndLinkNewAttribute("magic", "pulse");
    createAndLinkNewAttribute("magic", "spark");
    createAndLinkNewAttribute("magic", "vision");

    createAndLinkNewAttribute("physique", "endurance");
    createAndLinkNewAttribute("physique", "flow");
    createAndLinkNewAttribute("physique", "control");
    createAndLinkNewAttribute("physique", "might");
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
    create("reflect", ["harnessOverflow", "distillInsight", "takeNotes", "remember"], -1, -1);
    create("harnessOverflow", [], -1.1, .5); //siftExcess
    create("distillInsight", [], -1.9, 0);
    create("takeNotes", ["journal"], -1.1, -.5);
    create("bodyAwareness", ["meditate", "walkAware", "standStraighter"],-1, 0);
    create("remember", [], -.2, -1.2);
    create("travelOnRoad", ["travelToOutpost", "watchBirds", "catchAScent"], 2, 0);
    create("travelToOutpost", ["meetVillageLeaderScott", "checkNoticeBoard", "browseLocalMarket"], 2, 0); //travelToCrossroads
    create("meetVillageLeaderScott", ["helpScottWithChores"], 0, -1);
    create("helpScottWithChores", [], 0, -1);
    create("browseLocalMarket", [], -1, -1);
    create("checkNoticeBoard", ["reportForTraining", "reportForLabor"], 1.5, -1);
    create("makeMoney", ["spendMoney"], 1, -1);
    create("spendMoney", ["buySocialAccess"], 0, -1);
    create("buySocialAccess", ["slideTheCoin"], 0, -1);
    create("slideTheCoin", ["buyCoffee"], .5, -1);
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
    create("watchBirds", [], 1, .5)
    create("catchAScent", ["stepOffToExplore"], 0, 1);
    create("stepOffToExplore", ["eatGoldenFruit", "questionTheTrail"], 0, 1);
    create("eatGoldenFruit", [], 1, -.5);
    create("journal", [], -1.9, 0); //readTheWritten


//Meditate
    create("meditate", ["feelTheAche"],-2, 0);
    create("feelTheAche", ["softenTension"], -1, .5);
    create("softenTension", ["releaseExpectations"], -1, .5);
    create("releaseExpectations", [], -1, .5);
    create("walkAware", [], -1, .5);

//Notice board level 2 / Training & Shortcut pt 2
    create("reportForTraining", ["basicTrainingWithJohn"], -.5, -1);
    create("basicTrainingWithJohn", ["noticeTheStrain", "clenchTheJaw", "breatheThroughIt", "ownTheWeight", "moveWithPurpose"], 0, -1.3);
    create("noticeTheStrain", [], -1, .3);
    create("clenchTheJaw", [], 1, .3);
    create("breatheThroughIt", [], -1, -.7);
    create("ownTheWeight", [], 1, -.7);
    create("moveWithPurpose", [], 0, -1.3);
    create("questionTheTrail", ["climbTheRocks"], 1, .5);
    create("climbTheRocks", ["spotAShortcut"], 1, -.5);
    create("spotAShortcut", [], 0, -1);
    create("standStraighter", [], -1, 1.5);

//Notice Board level 3 / Jobs 1
//     create("fillBasicNeeds", [], -.5, -1);
    create("chimneySweep", ["handyman"], 0, -1);
    create("handyman", ["tavernHelper"], 0, -1);
    create("tavernHelper", ["guildReceptionist"], 0, -1);
    create("guildReceptionist", ["messenger"], 0, -1);
    create("messenger", ["townCrier"], 0, -1);
    create("townCrier", ["storyTeller"], 0, -1);
    create("storyTeller", [], 0, -1);

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
                data.actions[downstreamVar].parent = actionVar;
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
        let action = data.actions[currentVar];
        if(check++ > 2000) {
            stop = 1;
            console.log("You have an infinite loop on action creation with: " + currentVar);
            return;
        }

        if (!action) continue; // If action doesn't exist, skip it

        // Determine realX and realY
        if (action.parent && data.actions[action.parent]) {
            let parentAction = data.actions[action.parent];
            action.realX = parentAction.realX + action.x;
            action.realY = parentAction.realY + action.y;
        } else {
            // This might be the top-level action
            action.realX = action.x;
            action.realY = action.y;
        }

        // Add downstream actions to the queue
        if (action.downstreamVars && action.downstreamVars.length > 0) {
            action.downstreamVars.forEach(downstreamVar => {
                if (data.actions[downstreamVar]) {
                    queue.push(downstreamVar);
                }
            });
        }
    }
}
