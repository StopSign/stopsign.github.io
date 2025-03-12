//Driver globals
let gameSpeed = 1;
let bonusSpeed = 1;

let curTime = new Date();
let gameTicksLeft = 0;
let sudoStop = false;
let saveTimer = 2000;
let ticksPerSecond = 20;
let totalTime = 0;
let ticksForSeconds = 0;
let secondsPassed = 0;
//Store offline time
let bonusTime = 0;

//Saving globals
let isFileSystem = !!location.href.match("file");
let saveName = "save"; //Blank if you don't want to save

let stop = false;
let forceStop = false;

let prevState = {};
prevState.res = {};
prevState.actions = {};
prevState.stats = {};

//Game globals
let data = {};
data.actions = {};
data.actionNames = [];
data.stats = {};
data.statNames = [];
data.toastStates = []; // array of toast objects: {id, state, element}
data.gameState = "default"; //KTL
data.totalMomentum = 0;
data.essence = 0;
data.useAmuletButtonShowing = false;
data.secondsPerReset = 0;
data.currentJob = "Helping Scott";
data.currentWage = 1;
data.numberType = "engineering"; //or scientific

let viewData = {}; //contains only things that are generated / not saved
viewData.toasts = [];

let statTitles = []; //[<title>, <stat name to be located above>]

let language = "english";
let globalVisible = false;
let forceVisuals = false;


data.upgrades = {};

let isDebug = true;
function debug() {
    if(!isDebug) {
        return;
    }
    document.getElementById("killTheLichMenuButton").style.display = "";
    data.useAmuletButtonShowing = true;
    data.essence = 100;
}

function initializeData() {
    if(globalVisible) {
        document.getElementById("jobDisplay").style.display = "";
    }
    createUpgrades();

    statTitles.push(["Overclock Stats", "abilityPower"]);
    createAndLinkNewStat("abilityPower"); //improves efficiency of overclock & others. Comes from Harness Overflow
    createAndLinkNewStat("processing"); //
    createAndLinkNewStat("focus"); //
    createAndLinkNewStat("energy"); //
    createAndLinkNewStat("drive"); //
    createAndLinkNewStat("memory"); //
    // createAndLinkNewStat("discipline"); //
    createAndLinkNewStat("ambition");
    // createAndLinkNewStat("resilience"); //Energy
    createAndLinkNewStat("diligence"); //

    statTitles.push(["Social Stats", "charm"]);
    createAndLinkNewStat("charm"); //exuding warmth, connecting
    // createAndLinkNewStat("humor");
    createAndLinkNewStat("wit"); //quick minded
    createAndLinkNewStat("tact"); //smooth movement, smooth conversations
    createAndLinkNewStat("grace"); //smooth movement, smooth conversations
    createAndLinkNewStat("insight"); //dig deep
    createAndLinkNewStat("trust");
    createAndLinkNewStat("influence");
    createAndLinkNewStat("recognition");
    createAndLinkNewStat("confidence");
    createAndLinkNewStat("presentation");
    // createAndLinkNewStat("credibility");
    // createAndLinkNewStat("deception"); //hot chip & lie
    // createAndLinkNewStat("negotiation"); //convincing/persuasion

    //Magic Stats
    // statTitles.push(["Magic Stats", "magicControl"]);
    // createAndLinkNewStat("magicControl");

    //Physical Stats
    statTitles.push(["Physical Stats", "endurance"]);
    createAndLinkNewStat("endurance");
    // createAndLinkNewStat("weaponsExpertise");
    createAndLinkNewStat("vitality"); //

    //Resource Stats
    statTitles.push(["Resource Stats", "adaptability"]);
    // createAndLinkNewStat("adaptability");
    createAndLinkNewStat("workEthic");
    // createAndLinkNewStat("resourcefulness");

    // createAndLinkNewStat("salesmanship");
    // createAndLinkNewStat("networking");

    //Combined Stats
    statTitles.push(["General Stats", "pathfinding"]);
    createAndLinkNewStat("pathfinding");
    createAndLinkNewStat("observation");
    createAndLinkNewStat("haggling");
    createAndLinkNewStat("negotiation");
    createAndLinkNewStat("perspective");
    // createAndLinkNewStat("curiosity");
    // createAndLinkNewStat("patience");
    // createAndLinkNewStat("strategy");
    // createAndLinkNewStat("innovation");
    // createAndLinkNewStat("creativity");
    // createAndLinkNewStat("judgement");
    // createAndLinkNewStat("leadership");


    statTitles.push(["Village Stats", "villagersKnown"]);
    createAndLinkNewStat("villagersKnown");
    createAndLinkNewStat("scottFamiliarity");

    statTitles.push(["Job Stats", "streetKnowledge"]);
    createAndLinkNewStat("streetKnowledge");
    createAndLinkNewStat("jobExperience");
    
    //KTL

    create("overclockTargetingTheLich", ["killHorde"], 0, 0);
    create("killHorde", ["killElites"], 1, 0);
    create("killElites", ["killTheLich"], 1, 0);
    create("killTheLich", [], 1, 0);

    //intro
    create("overclock", ["harnessOverflow", "travelOnRoad", "makeMoney", "socialize"], 0, 0);
    create("harnessOverflow", ["distillInsight", "remember"], -1, -1);
    create("distillInsight", ["journal"], -1, 0);
    create("journal", ["takeNotes"], -1, 0);
    create("takeNotes", [], 0, -1);
    create("remember", [], -1, -1);
    create("makeMoney", ["spendMoney"], 0, -1.5);
    create("spendMoney", ["fillBasicNeeds"], 0, -1);
    create("travelOnRoad", ["travelToOutpost", "clearTheTrail"], 1, 0);
    create("clearTheTrail", ["paveTheTrail"], 0, 1); //increase travel expertise
    create("paveTheTrail", [], 0, 1); //increase travel expertise to max. Req builder skills
    create("travelToOutpost", ["meetVillageLeaderScott", "checkNoticeBoard", "travelToCrossroads"], 1, 0);
    create("meetVillageLeaderScott", ["helpScottWithChores"], 0, -1);

    create("checkNoticeBoard", ["reportForTraining", "reportForLabor"], 1, -1);
    create("helpScottWithChores", [], 0, -1);
    create("fillBasicNeeds", ["buyClothing", "eatBetterFood"], -.5, -1);

    //Village
    create("reportForTraining", ["takeLessonsFromJohn"], 0, -1)
    create("takeLessonsFromJohn", [], 0, -1)



    //jobs
    create("reportForLabor", ["oddJobsLaborer"], 1, -1);
    create("oddJobsLaborer", ["chimneySweep"], 0, -1);
    create("chimneySweep", ["handyman"], 0, -1);
    create("handyman", ["tavernHelper"], 0, -1);
    create("tavernHelper", ["guildReceptionist"], 0, -1);
    create("guildReceptionist", ["messenger"], 0, -1);
    create("messenger", ["townCrier"], 0, -1);
    create("townCrier", ["storyTeller"], 0, -1);
    create("storyTeller", [], 0, -1);

    //spend money
    create("buyClothing", [], -1, -1.5);
    create("eatBetterFood", [], -1, -.5);

    //Socialize
    create("socialize", ["chat"], -1.5, 0);
    create("chat", ["gossip", "talkToScott", "talkToInstructorJohn", "localOutreach"], -1, 1);

    //Socialize - Gossip
    create("gossip", ["gossipAboutPrices", "hearAboutTheLich"], 1, .5);
    create("hearAboutTheLich", [], 1, -.5);
    create("gossipAboutPrices", ["talkAboutMarkets"], 0, 1);
    create("talkAboutMarkets", [], 0, 1);

    //Socialize - Scott
    create("talkToScott", ["talkAboutVillageHistory", "talkAboutCurrentIssues"], 0, 1.5); //Pragmatism, kindness, mystery
    create("talkAboutVillageHistory", [], -.5, 1.5);
    create("talkAboutCurrentIssues", [], .5, 1.5);

    //Socialize - John
    create("talkToInstructorJohn", [], -1.5, 0);
    create("localOutreach", [], -2, -1.5);


    //     create("peruseLibrary", ["researchHistory"], 0, -1.2); //research. Req other unlocks
    //         create("researchHistory", null, 0, -1);
    //     create("rememberTheFallen", ["honorPastSacrifices", "payTribute"], -1.2, -1);
    //         create("honorPastSacrifices", ["findInnerPeace"], 0, -1.2);
    //         create("payTribute", ["findInnerPeace"], -1.2, -1);
    //             create("findInnerPeace", null, 0, -1);
    // create("establishRituals", ["studyReligiousTexts", "visitSacredSites", "participateInCeremonies"], .5, -1.4)



    /*
    Section works through people

    Start with Sandra the Guide, who has Introduce 0/20 and every level unlocks a new person somewhere
        -Introduce can be for both places and people
        -Sandra has other actions for getting to know her otherwise
        -late game: Collect powerful items to "jog Sandra's memory" and raise the level cap of introduce, to unlock mid/later game places. Could unlock 4 levels at once with a "meet guilds/nobles/artisans etc." pack or something
    Start goals: quickly access something that unlocks the eat street food

    Introduce 0: Market
    Introduce 1: Steve the Stall Owner
    Introduce 2: Bar & Inn
    Introduce 3: The Guilds
    Introduce 4: Bank Teller
    Introduce 5: Worker's District
    ...




     */



    // createMaid(["learnTraditionRecipes", "gossip", "learnFavorites"]);
    // createGossip(["learnFavorites"]);
        //notes: socialize has to have nobles somewhere, for basictutoring
    //sellingFoundItems combos with hunting results in a lot of ways
    /*
        createStrategicFriendship(["establishDiplomaticTies", "createTradeAgreements"]); //momentum branch
            createMakeFriendsWithGuilds(["collaboratingOnProjects", "accessingExclusiveResources"]);
                createEstablishArtisanPartnerships(["collaborativeDesigns", "exclusiveCraftsmanship"])
                    createJoinGuilds()
                    createCulturalExchanges(["artisanFestivals", "craftsmanshipShowcases"])

            createMakeFriendsWithMerchants(["tradeAgreements", "economicInsights"]);
                createTradeAgreements(["preferentialPricing", "exclusiveDeals"]);
                    createPreferentialPricing(["bulkPurchaseDiscounts", "loyaltyRewards"]);
                        createBulkPurchaseDiscounts(["discountedResourceBundles", "specialOffersOnGoods"]);
                        createLoyaltyRewards(["earlyAccessToNewProducts", "customOrderPriorities"]);
                    createExclusiveDeals(["limitedEditionItems", "firstBuyerRights"]);
                        createLimitedEditionItems(["collector'sArtifacts", "uniqueEquipables"]);
                        createFirstBuyerRights(["advanceProductReleases", "exclusivePurchaseOptions"]);
                createEconomicInsights(["marketTrends", "investmentOpportunities"]);
                    createMarketTrends(["priceFluctuationAnalysis", "demandForecasting"]);
                        createPriceFluctuationAnalysis(["commodityValueTracking", "economicCyclesUnderstanding"]);
                        createDemandForecasting(["upcomingNeedsPrediction", "stockpilingStrategies"]);
                    createInvestmentOpportunities(["ventureCapital", "strategicPartnerships"]);
                        createVentureCapital(["startupInvestments", "innovationFunding"]);
                        createStrategicPartnerships(["jointBusinessVentures", "crossPromotionalAgreements"]);
                createFriendsWithNobles(["politicalInfluence", "socialGatherings"]);
                    createPoliticalInfluence(["advocacyForCauses", "legislativeSupport"]);
                        createAdvocacyForCauses(["championingReforms", "publicEndorsements"]);
                            createChampioningReforms(["lawAmendments", "policyIntroductions"]);
                            createPublicEndorsements(["supportingNobleAgendas", "gainingPublicFavor"]);
                        createLegislativeSupport(["billsSponsorship", "politicalAlliances"]);
                            createBillsSponsorship(["fundingCampaigns", "policyDrafting"]);
                            createPoliticalAlliances(["coalitionFormations", "strategySessions"]);
                    createSocialGatherings(["eliteEventsAttendance", "privateAudiences"]);
                        createEliteEventsAttendance(["ballsAndGalas", "charityEvents"]);
                            createBallsAndGalas(["networkingOpportunities", "reputationBuilding"]);
                            createCharityEvents(["philanthropicContributions", "influentialAcquaintances"]);
                        createPrivateAudiences(["oneOnOneMeetings", "personalFavors"]);
                            createOneOnOneMeetings(["negotiationSkills", "confidentialDiscussions"]);
                            createPersonalFavors(["specialRequests", "insiderInformation"]);
        createCulturalImmersion(["learnLocalCustoms", "participateInCulturalEvents"]); //conversation branch
            createLearnLocalCustoms(["studyLanguage", "respectTraditions"]);
                createStudyLanguage(["improveCommunication", "accessLocalLiterature"]);
                createRespectTraditions(["gainTrust", "deepenUnderstanding"]);

        I like beast hunters (looting large wild monsters), dungeon explorers (delvers), wardens (overland defensive rangers, prioritizing travel and mass-damage), and ocean-based combat. Rewrite with 3 options with these guilds in mind
*/




    data.actionNames.forEach(function(actionVar) {
        if(!data.actions[actionVar].downstreamVars) {
            return;
        }
        data.actions[actionVar].downstreamVars.forEach(function(downVar) {
            if(!data.actions[downVar]) {
                return;
            }
            data.actions[downVar].parent = actionVar;
        })
    });


    initializeDisplay();
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
