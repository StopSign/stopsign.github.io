//Driver globals
let gameSpeed = 1;
let bonusSpeed = 1;

let curTime = new Date();
let gameTicksLeft = 0;
let sudoStop = false;
let saveTimer = 2000;
let ticksPerSecond = 50;
let totalTime = 0;
let ticksForSeconds = 0;
let secondsPassed = 0;

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

let viewData = {}; //contains only things that are generated / not saved
viewData.toasts = [];

let statTitles = []; //[<title>, <stat name to be located above>]

let language = "english";
let globalVisible = false;

function initializeData() {

    statTitles.push(["Motivate Stats", "drive"]);
    createAndLinkNewStat("energy"); //
    createAndLinkNewStat("drive"); //
    createAndLinkNewStat("discipline"); //
    createAndLinkNewStat("ambition");
    createAndLinkNewStat("resilience"); //Energy
    createAndLinkNewStat("diligence"); //
    createAndLinkNewStat("confidence");

    statTitles.push(["Social Stats", "charm"]);
    createAndLinkNewStat("charm"); //exuding warmth, connecting
    createAndLinkNewStat("humor");
    createAndLinkNewStat("wit"); //quick minded
    createAndLinkNewStat("tact"); //smooth movement, smooth conversations
    createAndLinkNewStat("grace"); //smooth movement, smooth conversations
    createAndLinkNewStat("insight"); //dig deep
    createAndLinkNewStat("deception"); //hot chip & lie
    createAndLinkNewStat("negotiation"); //convincing/persuasion

    //Magic Stats
    statTitles.push(["Magic Stats", "magicControl"]);
    createAndLinkNewStat("magicControl");


    //Resource Stats
    statTitles.push(["Resource Stats", "adaptability"]);
    createAndLinkNewStat("adaptability");
    createAndLinkNewStat("resourcefulness");

    createAndLinkNewStat("salesmanship");
    createAndLinkNewStat("networking");

    //Combined Stats
    statTitles.push(["General Stats", "curiosity"]);
    createAndLinkNewStat("curiosity");
    createAndLinkNewStat("patience");
    createAndLinkNewStat("strategy");
    createAndLinkNewStat("innovation");
    createAndLinkNewStat("creativity");
    createAndLinkNewStat("judgement");
    createAndLinkNewStat("leadership");

    create("motivate", ["reflect", "makeMoney", "travelToOutpost"], 0, 0);

    //TODO gold + resolve = fortune
    create("makeMoney", ["spendMoney"], 0, -2.5);
    create("spendMoney", [], 0, -1.5);




    create("reflect", ["rememberTheFallen", "peruseLibrary"], -1.5, -1.5);
        //     create("peruseLibrary", ["researchHistory"], 0, -1.2); //research. Req other unlocks
        //         create("researchHistory", null, 0, -1);
        //     create("rememberTheFallen", ["honorPastSacrifices", "payTribute"], -1.2, -1);
        //         create("honorPastSacrifices", ["findInnerPeace"], 0, -1.2);
        //         create("payTribute", ["findInnerPeace"], -1.2, -1);
        //             create("findInnerPeace", null, 0, -1);
        // create("establishRituals", ["studyReligiousTexts", "visitSacredSites", "participateInCeremonies"], .5, -1.4)

    create("travelToOutpost", ["reportForDuty", "clearTheTrail", "travelToCrossroads"], 3, 0);
        create("clearTheTrail", ["paveTheTrail"], 0, 1); //increase travel expertise
            create("paveTheTrail", [], -1, 0); //increase travel expertise to max. Req builder skills
    create("reportForDuty", ["meetVillageLeaderScott", "reportForTraining", "reportForLabor"], 0, -1);
        create("meetVillageLeaderScott", ["helpScottWithChores"], -1, -1);
        create("reportForTraining", ["talkToInstructorJohn"], 0, -1)
        create("reportForLabor", ["shepherd", "fisherman", "horseTamer", "dockWorker"], 2, -2);





    //casting spells at all requires catalyst, which comes from within the crafting/money sections. buy it in spend money, then improve it in crafting

    /*

            story elements for magic
             [resolve] identify mana chamber  /10
             [resolve] breathing - measured and deliberate vs synchronized
             [mana] visualization
             ... observe leylines / draw from leylines

     */
            //     createCastBasicSpells()
            // createSenseMana(["castBasicSpells", "focusManaSenses", "expandManaSenses", "amplifyManaSenses"])
                // createLocalizedManaDetection(["immediateAreaFocus", "detectManaClusters"])
                // good ones from this were local -> sense closer -> identify magic,
                // or learn signatures->read aura -> read spells -> read spell history,
                // or influence of nature/manadisturbances -> natural resonance -> resonance patterns -> magical reading of plants/animals/biome/disturbances


    // createMakeMoney(-380, 350, ["basicLabor", "browseMarket", "spendMoney"])
    //     createBrowseMarket(-400, -200, ["learnMarket"])
    //         createLearnMarket(-400, -200, ["craftForTheDemand", "compareMarket"])
    //             createCraftForTheDemand(-400, -200, ["craftSimpleItems"])
    //                 createCraftSimpleItems(-400, -200)
    //             createCompareMarket(-400, 200, ["sellFoundItems", "exploitMarket"])
    //                 createSellFoundItems(-400, -200)
    //                 createExploitMarket(-400, 200)
    //
    //     createSpendMoney(480, 70, ["eatBetterFood", "fillBasicNeeds", "buyTransportation", "buyUtilityItems", "buyInvestments"]);
    //         createFillBasicNeeds(-120, 360, ["improvePersonalSpace", "buyQualityClothing", "buySafety"]); //hygiene
    //             createBuyQualityClothing(400, 400, ["buyFashionableClothing"]); //TODO poor clothing first
    //                 createBuyFashionableClothing(400, 400)
    //             createImprovePersonalSpace(-120, 320, ["improveHouse", "improveNeighborhood"]); //furniture, repairs, bug control, laundry
    //             // createImproveHouse(-100, 320) //TODO different ways to improve the house
    //                 createImproveNeighborhood(170, 320, ["improvePond"]); //street, holidays?
    //                     createImprovePond(-100, 320); //fishing
    //             // createHostCommunity
    //             //     createHostCelebrations
    //             //         createOrganizeHolidays
    //             //createOrganize<Specific Holiday>
    //         createEatFood(-120, 360, ["pickupStreetFood", "eatQualityFood", "enjoyUpscaleFood"])
    //             createPickUpStreetFood(-120, 360, ["eatFastFood", "eatLocalSpecialties"])
    //                 createEatFastFood(-120, 360) //very small little effect, but constant so the player is inclined to put just a tiny fraction here
    //                 createEatLocalSpecialties(-120, 360) //req social unlock, but essentially improves eat street food hugely
    //                 // createEatForeignSpecialties() //req social unlock, same as previous but much later in the game. Idea is it's harder to meet foreigners to know their secrets, and also they aren't here as often so the shops don't establish word of mouth much.
    //
    //             createEatQualityFood(-120, 360, ["eatNutritionalFood"])
    //                 createEatNutritionalFood(-120, 360)
    //                 // createEnjoyATreat()
    //             createEnjoyUpscaleFood(-120, 360)
    //                 //todo types of fancy food
    //             // createBuyPersonalChef()
    //         createBuyPractical(450, 190, ["buyTransportation", "buyKnowledge", "buyMaterials", "buyItems"]);
    //             createBuyTransportation(400, 0); //carriage to help clearing the roads to building new ones
    //             createBuyKnowledge(400, 400, ["buyBooks", "buyMaps"]);
    //                 createBuyBooks(400, 400);
    //                 createBuyMaps(400, 400);
    //             createBuyMaterials(400, 400);
    //             createBuyItems(400, 400, ["buyGear", "buyUtilityMagicItems"]);
    //                 createBuyGear(400, 400);
    //                 createBuyUtilityMagicItems(400, 400); //
    //         createBuyInvestments(380, 510, ["buyHousing", "putInSavings"]);
    //             createBuyHousing(400, 400);
    //             createPutInSavings(400, 400, ["generateInterest"]); //creates a new resource 'savings', which creates 'interest'
    //                 createGenerateInterest(400, 400,["pullInterest"]); //creates interest
    //                     createPullInterest(400, 400); //converts interest to money
    //
    //
    //
    //     createBasicLabor(-450, 400, ["maid", "stableHand", "fieldWork", "fish", "mining", "skilledLabor"]);
    //         createMaid(-50, -200);
    //         createStableHand(-300, -40); //-> empathize <- ask about problems? talk with beggars?
    //         createFieldWork(-370, 150);
    //         createFish(300, 190);
    //         createMining(-50, 420);
    //         createSkilledLabor(-600, 600, ["scribe", "baker", "runAStall", "tailor", "blacksmith", "advancedLabor"]);
    //             createScribe(-50, -200);
    //             createBaker(-300, -40);
    //             createRunAStall(-370, 150);
    //             createTailor(-50, 420);
    //             createBlacksmith(300, 190);
    //             createAdvancedLabor(-600, 600, ["musician", "guard", "offerServices"]);
    //                 createMusician(-50, -200);
    //                 createGuard(-300, -40);
    //                 // createOfferServices();
    //                 //     createTutorNobles();
    //
    //
    //
    //
    // createSocialize(-340, -270, ["strategicFriendship"], ["culturalImmersion"]);

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
        createStrategicFriendship(["establishDiplomaticTies", "createTradeAgreements"]); //resolve branch
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


                //createSports, createSportsBetting
    //TODO GAMEPLAY
    /*
    spend money should level faster, and start to help out motivate. The level requirements climb moderately.
    spend money has options for where to send money, either to:
        - eat food (street food and up)
        - buy basic needs (hygiene, clothing)
    early game will be about focusing money and alternating between improving food or basic needs
    eat food & buy basic needs actions will have same values, and both reduce exp needed to motivate by 5%. Both increase in level exp req by 10x, and are staggered with an initial x2. They also have level caps, and the sub nodes increase the level caps
    */

    //todo formula / gain

    //as a general goal, keep the base numbers of the actions similar. you want the player to be able to compare the effectiveness of upgrades

    //on upgrade: x.99 Motivate level exp requirement
    //on upgrade: -1 Motivate progress completion requirement

    //on level up:+.1 strength
    //+.2 control

    //Modified by:
    //<action> | 15 motivate requirement
    //*1.2 exp | wisdom bonus

    //tag system
    //stats are attached to the tags
    //tags are attached to the actions

    //TODO ENGINE STUFF
    //set max level of action, and it no longer gains progress after that level
    //unlock requires [resolve] cost of the action above it, and also unlockStats
    //show the stats it gets improved by/stats it improves as icons surrounding the action
    //unlock based on level requirement of previous action
    //each level has a different name / different effect. Requires "total effects" section


    //TODO Add mana to gather mana
    //TODO create the resources and have them start moving downstream

    //TODO fill in the more methods
    //method to draw lines
    //TODO Minimap lol

    //TODO create links that re-center the map on what you clicked, so you can go up and down the chain

    //TODO clicking the title centers the x, y
    //TODO button for parent

    //TODO lategame idea: create a "view" with the stats and their graphs over the course of a run, to be able to more easily compare. Auto-run recent, and compare to loadouts also

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


    setRealCoordinates('motivate');

    data.actionNames.forEach(function (actionVar) { //wait until they are all created to link downstreams
        view.create.generateActionDisplay(actionVar);
    })

    view.create.generateLines();
    updateAllActionStatMults();

    //Formula brainstorming
    /*
    progress -> completions
    exp -> levels
    levels increase progress req, but give X

    the rate of progress is controllable by spending resources, so you don't want a situation where it's worthwhile to save and then spend
    if you change the amount of exp or reduce level reqs, then it would be worthwhile to save the resources until you've maximized exp - to be avoided
    if you increase reduce progress amount requirements, it also is worthwhile to save resolve until you've reduced maximally - to be avoided
    in order to keep resolve being spent everywhere equally, just the time it takes to get there (and the tax along the way), the other variables cannot be altered after the game has started
    only alter those after the game has finished

    can't avoid making saving resources be worth it, so make it worthwhile to keep spending resources


    X could be:
        -reducing progress req of a different action
        -3rd party resource

    alternatively, let it be uncontrolled, and have resolve affect something besides progress gain ?


    have to flip it around from a negative to a positive w/o changing the equation
    so from reducing exp costs to multiplying gains



    how do i want it to be, thematically?
    resolve gets the action up to speed and chugs it along every-increasingly, with the chug getting higher req over time to prevent instant gain
    the result is a slow but steady and powerful upgrade that increases over time
    bonuses come from levels


    FIXes:
        feedback loop - each one will improve the other in some ways, or the downstream effects will, which means optimal strategy is to push both hard, not save
        instead of improving each other, A and B both improve C
        resource splitting
        game reacts to splitting focus with arbitrary bonuses
        desire to initiate a growth period in a resource before moving on

    */

    //socialize, conversations -> credibility

    actionTitleClicked(`motivate`);

    initializeToasts();
}

function setRealCoordinates(actionVar) {
    let action = data.actions[actionVar];
    if (action.parent && data.actions[action.parent]) {
        // Get parent action
        let parentAction = data.actions[action.parent];

        // If the parent's realX and realY are not set, calculate them first
        if (typeof parentAction.realX === 'undefined' || typeof parentAction.realY === 'undefined') {
            setRealCoordinates(action.parent);
        }

        // Set the action's realX and realY based on its parent's coordinates
        action.realX = parentAction.realX + action.x;
        action.realY = parentAction.realY + action.y;
    } else {
        // If there is no parent (i.e., this is the "motivate" action), set realX and realY to its own x and y
        action.realX = action.x;
        action.realY = action.y;
    }

    // Recursively set realX and realY for downstream actions
    if (action.downstreamVars) {
        action.downstreamVars.forEach(downstreamVar => {
            if (data.actions[downstreamVar]) {
                setRealCoordinates(downstreamVar);
            }
        });
    }
}


