function clearSave() {
    window.localStorage[saveName] = "";
    location.reload();
}

data.saveVersion = 0;

const patches = {
    actions:{
        overclock: {
            preventReset: true,
        },
        reflect: {
            preventReset: true,
        },
        distillInsight: {
            preventReset: true,
        },
        harnessOverflow: {
            preventReset: true,
        },
        takeNotes: {
            preventReset: true,
        },
        remember: {
            preventReset: true,
        },
        bodyAwareness: {
            preventReset: true,
        },
        travelOnRoad: {
            preventReset: true,
        },
        travelToOutpost: {
            preventReset: true,
        },
        meetVillageLeaderScott: {
            preventReset: true,
        },
        watchBirds: {
            preventReset: true,
        },
        catchAScent: {
            preventReset: true,
        },
        helpScottWithChores: {
            preventReset: true
        },
        checkNoticeBoard: {
            preventReset: true
        },
        browseLocalMarket: {
            preventReset: true
        },
        makeMoney: {
            preventReset: true
        },
        spendMoney: {
            preventReset: true
        },
        buyBasicSupplies: {
            preventReset: true
        },
        buyBasicClothes: {
            preventReset: true
        },
        reportForTraining: {
            preventReset: true
        },
        basicTrainingWithJohn: {
            preventReset: true
        },
        noticeTheStrain: {
            preventReset: true
        },
        clenchTheJaw: {
            preventReset: true
        },
        breatheThroughIt: {
            preventReset: true
        },
        ownTheWeight: {
            preventReset: true
        },
        moveWithPurpose: {
            preventReset: true
        },
        reportForLabor: {
            preventReset: true
        },
        oddJobsLaborer: {
            preventReset: true
        },
        chimneySweep: {
            preventReset: true
        },
        buyMarketItems: {
            preventReset: true
        },
        buyShopItems: {
            preventReset: true
        },
        exploreDifficultPath: {
            preventReset: true
        },
        buyTravelersClothes: {
            preventReset: true
        },
        keepGoing: {
            preventReset: true
        },
        eatGoldenFruit: {
            preventReset: true
        },
        climbTheRocks: {
            preventReset: true
        },
        spotAPath: {
            preventReset: true
        },
        pleasantForest: {
            preventReset: true
        },
        exploreTheForest: {
            preventReset: true
        },
        travelAlongTheRiver: {
            preventReset: true
        },
        gatherRiverWeeds: {
            preventReset: true
        },
        hiddenPath: {
            preventReset: true
        },
        meetGrumpyHermit: {
            preventReset: true
        },
        annoyHermitIntoAQuest: {
            preventReset: true
        },
        presentTheOffering: {
            preventReset: true
        },
        handyman: {
            preventReset: true
        },
        tavernHelper: {
            preventReset: true
        },
        buyStreetFood: {
            preventReset: true
        },
        buyMatchingClothes: {
            preventReset: true
        },
        buySocialAccess: {
            preventReset: true
        },
        browseStores: {
            preventReset: true
        },
        socialize: {
            preventReset: true
        },
        meetPeople: {
            preventReset: true
        },
        talkWithScott: {
            preventReset: true
        },
        talkWithJohn: {
            preventReset: true
        },
        learnToListen: {
            preventReset: true
        },
        chatWithHermit: {
            preventReset: true
        },
        tellAJoke: {
            preventReset: true
        },
        chatWithMerchants: {
            preventReset: true
        },
        askAboutStitching: {
            preventReset: true
        },
        complimentTheChef: {
            preventReset: true
        },
        listenToWoes: {
            preventReset: true
        },
        keyToTheBackroom: {
            preventReset: true
        },
        joinCoffeeClub: {
            preventReset: true
        },
        buyGoodFood: {
            preventReset: true
        },
        buyStylishClothes: {
            preventReset: true
        },
        slideTheCoin: {
            preventReset: true
        },
        browseBackrooms: {
            preventReset: true
        },
        talkToHermit: {
            preventReset: true
        },
        buyCoffee: {
            preventReset: true
        },
        learnToStayStill: {
            preventReset: true
        },
        inquireAboutMagic: {
            preventReset: true
        },
        feelTheResonance: {
            preventReset: true
        },
        layerTheEchoes: {
            preventReset: true
        },
        igniteTheSpark: {
            preventReset: true
        },
        gossipAroundCoffee: {
            preventReset: true
        },
        pesterHermitForSecrets: {
            preventReset: true
        },
        guildReceptionist: {
            preventReset: true
        },
        meditate: {
            preventReset: true
        },
        journal: {
            preventReset: true
        },
        travelToCrossroads: {
            preventReset: true
        },
        restAtWaterfall: {
            preventReset: true
        },
        visitShrineBehindWaterfall: {
            preventReset: true
        },


        echoKindle: {
            preventReset: true
        },
        sparkMana: {
            preventReset: true
        },
        poolMana: {
            preventReset: true
        },
        expelMana: {
            preventReset: true
        },
        prepareSpells: {
            preventReset: true
        },
        manaBasics: {
            preventReset: true
        },
        feelYourMana: {
            preventReset: true
        },
        growMagicSenses: {
            preventReset: true
        },
        manaExperiments: {
            preventReset: true
        },
        manaObservations: {
            preventReset: true
        },
        magicResearch: {
            preventReset: true
        },
        infuseTheHide: {
            preventReset: true
        },
        etchTheCircle: {
            preventReset: true
        },
        bindThePages: {
            preventReset: true
        },
        awakenYourGrimoire: {
            preventReset: true
        },
        prepareInternalSpells: {
            preventReset: true
        },
        overcharge: {
            preventReset: true
        },
        overboost: {
            preventReset: true
        },
        prepareExternalSpells: {
            preventReset: true
        },
        supportSpells: {
            preventReset: true
        },
        earthMagic: {
            preventReset: true
        },

        hearAboutTheLich: {
            preventReset: true
        },

        overclockTargetingTheLich: {
            preventReset: true
        },
        worry: {
            preventReset: true
        },
        resolve: {
            preventReset: true
        },
        fightTheEvilForces: {
            preventReset: true
        },
        bridgeOfBone: {
            preventReset: true
        },
        forgottenShrine: {
            preventReset: true,
        },
        messenger: {
            preventReset: true,
        },
        harvestGhostlyField: {
            preventReset: true,
        }

    },
    upgrades:{
        stopLettingOpportunityWait: {
            preventReset: true,
        },
        knowWhenToMoveOn: {
            preventReset: true,
        },
        feelTheEchoesOfMyPast: {
            preventReset: true,
        },
        startALittleQuicker: {
            preventReset: true,
        },
        rememberWhatIFocusedOn: {
            preventReset: true,
        },
        learnedOfLichSigns: {
            preventReset: true,
        },
        knowWhatIFocusedOn: {
            preventReset: true,
        },
        refineMyCycle: { preventReset: true, },
        refineMyAwareness: { preventReset: true, },
        refineMyConcentration: { preventReset: true, },
        refineMyEnergy: { preventReset: true, },
        refineMyFlow: { preventReset: true, },
        refineMyCoordination: { preventReset: true, },
        refineMyIntegration: { preventReset: true, },
        refineMyAmbition: { preventReset: true, },
        refineMyAdaptability: { preventReset: true, },
        refineMyCunning: { preventReset: true, },
        refineMySavvy: { preventReset: true, },
        refineMyConfidence: { preventReset: true, },
        refineMyRecognition: { preventReset: true, },
        refineMyCharm: { preventReset: true, },
        refineMyInfluence: { preventReset: true, },
        refineMyDiscernment: { preventReset: true, },
        refineMyPulse: { preventReset: true, },
        refineMyVision: { preventReset: true, },
        refineMySpark: { preventReset: true, },
        refineMyAmplification: { preventReset: true, },
        refineMyControl: { preventReset: true, },
        refineMyCuriosity: { preventReset: true, },
        refineMyObservation: { preventReset: true, },
        refineMyEndurance: { preventReset: true, },
        refineMyNavigation: { preventReset: true, },
        refineMyMight: { preventReset: true, },
        refineMyGeared: { preventReset: true, },
        refineMyCourage: { preventReset: true, },
        refineMyWizardry: { preventReset: true, },
    }};



function load() {
    initializeData();

    let toLoad = {};

    // if(onLoadData) {
    //     toLoad = onLoadData;
    // }
    if(localStorage[saveName]) {
        console.log('Save found.');
        toLoad = JSON.parse(decode(localStorage[saveName]));
    }


    if(isLoadingEnabled && localStorage[saveName] && toLoad.actions) { //has a save file
        const saveVersion = toLoad.saveVersion || 0;

        // mergeExistingOnly(data, toLoad, "actions", ["x", "y", "realX", "realY"]); //use patch instead
        //these are in the skiplist because if, between saves, an action has changed the atts it has, the links need to be reset instead of saved.
        mergeExistingOnly(data, toLoad, "atts", ["linkedActionExpAtts", "linkedActionEfficiencyAtts", "linkedActionOnLevelAtts"]);
        mergeExistingOnly(data, toLoad, "options");
        data.options.bonusRate = 3;
        mergeExistingOnly(data, toLoad, "gameSettings");


        patchActions("actions", toLoad.actions, actionData);
        patchActions("upgrades", toLoad.upgrades, upgradeData);

        data.toastStates = toLoad.toastStates;


        //load global items that aren't lists or objects
        data.gameState = toLoad.gameState ?? "default";
        data.planeTabSelected = toLoad.planeTabSelected ?? 0;
        data.totalMomentum = toLoad.totalMomentum ?? 0;
        data.ancientCoin = toLoad.ancientCoin ?? 0;
        data.useAmuletButtonShowing = !!toLoad.useAmuletButtonShowing;
        data.secondsPerReset = toLoad.secondsPerReset ?? 0;
        data.currentJob = toLoad.currentJob ?? "helpScottWithChores";
        data.currentWage = toLoad.currentWage ?? 1;
        data.doneKTL = !!toLoad.doneKTL;
        data.doneAmulet = !!toLoad.doneAmulet;
        data.displayJob = !!toLoad.displayJob;
        data.focusSelected = toLoad.focusSelected ?? [];
        data.resetLogs = toLoad.resetLogs ?? [];
        data.planeUnlocked = toLoad.planeUnlocked ?? [true, false, false, false];
        data.maxFocusAllowed = toLoad.maxFocusAllowed ?? 3;
        data.focusMult = toLoad.focusMult ?? 2;
        data.focusLoopMax = toLoad.focusLoopMax ?? 2.5;
        data.lastVisit = toLoad.lastVisit ?? Date.now();

        data.currentGameState = toLoad.currentGameState;
        // data.gameSettings = toLoad.gameSettings;


        //data correction

        //new spells need to be leveled to current grimoire's level

        //bought upgrades need to be applied
        actionData.hearAboutTheLich.maxLevel = data.upgrades.learnedOfLichSigns.upgradePower + 2;
    }

    //update all generator's multiplier data
    for(let actionVar in actionData) {
        let dataObj = actionData[actionVar];
        if(dataObj.updateMults) {
            dataObj.updateMults();
        }
    }

    initializeDisplay();
    setSlidersOnLoad(toLoad);
    // recalcInterval(data.options.updateRate);
    views.updateView();


    debug(); //change game after all else, for easier debugging
}

function patchActions(dataVar, toLoadActions, baseData) { //, dataActions, toLoadActions, patchMap) {
    let dataActions = data[dataVar];
    let patchMap = patches[dataVar];
    const currentKeys = Object.keys(dataActions);
    const loadedKeys = toLoadActions ? Object.keys(toLoadActions) : [];

    for (const key of currentKeys) {
        // If action is not in the loaded data, reset it to its base state.
        if (!(key in toLoadActions)) {
            if(dataVar === "action") {
                actionSetBaseVariables(dataActions[key], baseData[key]);
            } else if(dataVar === "upgrades") {
                upgradesSetBaseVariables(dataActions[key], baseData[key])
            }

            continue;
        }

        // Check the patch map to see if this action should be preserved.
        const preventReset = patchMap[key]?.preventReset;

        // If reset is prevented, merge the loaded data and continue.
        if (preventReset) {
            Object.assign(dataActions[key], toLoadActions[key]);
            continue;
        }

        if(dataVar === "action") {
            const isVisible = toLoadActions[key].visible;
            actionSetBaseVariables(dataActions[key], baseData[key]);
            dataActions[key].visible = isVisible;
        } else if(dataVar === "upgrades") {
            upgradesSetBaseVariables(dataActions[key], baseData[key])
        }
    }

    for (const key of loadedKeys) {
        if (!(key in dataActions)) {
            delete toLoadActions[key];
        }
    }

    if(globalVisible) {
        for(let attVar in data.atts) {
            revealAtt(attVar);
        }
    }
}

function setSlidersOnLoad(toLoad) {
    for(let actionVar in data.actions) {
        let dataObj = actionData[actionVar];
        for(let downstreamVar of dataObj.downstreamVars) {
            if (!document.getElementById(actionVar + "NumInput" + downstreamVar)
                || !toLoad.actions || !toLoad.actions[actionVar] ||
                toLoad.actions[actionVar]["downstreamRate" + downstreamVar] === undefined) {
                continue;
            }
            setSliderUI(actionVar, downstreamVar, toLoad.actions[actionVar]["downstreamRate" + downstreamVar]); //from save file
        }
    }
    attachCustomSliderListeners();
}

function mergeExistingOnly2(data, toLoad, varName, skipList = []) {
    const dataObj = data[varName];
    const toLoadObj = toLoad[varName];
    if (typeof dataObj !== "object" || typeof toLoadObj !== "object") return;

    for (let key in toLoadObj) {
        if (!(key in dataObj)) continue;
        console.log(key);
        if (skipList.includes(key)) continue;

        Object.assign(dataObj[key], toLoadObj[key]);
    }
}

function mergeExistingOnly(data, toLoad, varName, skipList = []) {
    const dataObj = data[varName];
    const toLoadObj = toLoad[varName];
    if (typeof dataObj !== "object" || dataObj === null || typeof toLoadObj !== "object" || toLoadObj === null) {
        return;
    }

    for (const key in dataObj) {
        if (Object.prototype.hasOwnProperty.call(dataObj, key)) {
            if (Object.prototype.hasOwnProperty.call(toLoadObj, key)) {
                const targetObj = dataObj[key];
                const sourceObj = toLoadObj[key];
                if (typeof targetObj === "object" && targetObj !== null && typeof sourceObj === "object" && sourceObj !== null) {
                    for (const propKey in targetObj) {
                        if (Object.prototype.hasOwnProperty.call(targetObj, propKey)) {
                            if (Object.prototype.hasOwnProperty.call(sourceObj, propKey)) {
                                if (!skipList.includes(propKey)) {
                                    targetObj[propKey] = sourceObj[propKey];
                                }
                            }
                        }
                    }
                    // Copy any props in sourceObj not already in targetObj (and not in skipList)
                    for (const propKey in sourceObj) {
                        if (Object.prototype.hasOwnProperty.call(sourceObj, propKey)) {
                            if (!Object.prototype.hasOwnProperty.call(targetObj, propKey) && !skipList.includes(propKey)) {
                                targetObj[propKey] = sourceObj[propKey];
                            }
                        }
                    }
                } else if (!skipList.includes(key)) {
                    dataObj[key] = sourceObj;
                }
            }
        }
    }

    for (const key in toLoadObj) {
        if (Object.prototype.hasOwnProperty.call(toLoadObj, key) && !Object.prototype.hasOwnProperty.call(dataObj, key)) {
            if (!skipList.includes(key)) {
                dataObj[key] = toLoadObj[key];
            }
        }
    }
}


function updateUIOnLoad() {

    document.getElementById('viewDeltasSwitch').firstElementChild.style.left = data.gameSettings.viewDeltas ? "50%" : "0";
    document.getElementById('numberTypeSwitch').firstElementChild.style.left = data.gameSettings.numberType==="scientific" ? "50%" : "0";
    document.getElementById('viewRatioSwitch').firstElementChild.style.left = data.gameSettings.viewRatio ? "50%" : "0";
    document.getElementById('viewTotalMomentumSwitch').firstElementChild.style.left = data.gameSettings.viewTotalMomentum ? "50%" : "0";
    document.getElementById('viewZeroButtonsSwitch').firstElementChild.style.left = data.gameSettings.viewAll0Buttons ? "50%" : "0";

    for (let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        if(data.gameState === "KTL") {
            actionObj.isRunning = actionObj.plane === 2;
        } else {
            actionObj.isRunning = actionObj.plane !== 2;
        }
        clickActionMenu(actionVar, actionObj.currentMenu, true);
        if (actionObj.visible) {
            revealActionAtts(actionObj);
        }
        if(data.gameSettings.viewDeltas) {
            views.updateVal(`${actionVar}DeltasDisplayContainer`, "", "style.display");
        }
        if(data.gameSettings.viewRatio) {
            views.updateVal(`${actionVar}BalanceNeedleContainer`, "", "style.display");
        }
        if(data.gameSettings.viewAll0Buttons) {
            views.updateVal(`${actionVar}ToggleDownstreamButtons`, "", "style.display");
        }
        if(data.gameSettings.viewTotalMomentum) {
            views.updateVal(`${actionVar}TotalDownstreamContainer`, "", "style.display");
        }
    }
    if (data.planeUnlocked[1] || data.planeUnlocked[2]) {
        for (let i = 0; i < data.planeUnlocked.length; i++) {
            if (data.planeUnlocked[i]) {
                unveilPlane(i);
            }
        }
    }
    switchToPlane(0);

    
    if(data.doneAmulet && data.gameState !== "KTL") {
        views.updateVal(`openViewAmuletButton`, "", "style.display");
    }
    if(data.useAmuletButtonShowing && data.gameState === "KTL") {
        views.updateVal(`openUseAmuletButton`, "", "style.display");
    }
    if(data.doneKTL) {
        views.updateVal(`ancientCoinDisplay`, "", "style.display");
        revealAtt("legacy");
    }
    if(data.displayJob) {
        document.getElementById("jobDisplay").style.display = "";
    }
    changeJob(data.currentJob);

    for(let i = 0; i < data.toastStates.length; i++) {
        updateToastUI(i);
    }

    updateSliderDisplay(data.gameSettings.ticksPerSecond);
    document.getElementById("FPSSlider").value = data.gameSettings.ticksPerSecond;

    updatePreviousTipsMenu();
    reapplyAttentionSelected();
    resizeStatMenu();

    for (const upgradeVar in data.upgrades) {
        const upgrade = data.upgrades[upgradeVar];
        views.updateVal(`card_${upgradeVar}`, upgrade.visible ? "flex" : "none", "style.display");
    }

    for(let attVar in data.atts) {
        recalcAttMult(attVar)
    }

}

function reapplyAttentionSelected() {
    if (!data.focusSelected) return;

    data.focusSelected.forEach(entry => {
        const { borderId } = entry;
        highlightLine(borderId); // Reapply visual state
    });
}

function save() {
    window.localStorage[saveName] = encode(JSON.stringify(data));
}

function exportSave() {
    save();
    // console.log(encoded);
    document.getElementById("exportImportSave").value = window.localStorage[saveName];
    document.getElementById("exportImportSave").select();
    document.execCommand('copy');
    document.getElementById("exportImportSave").value = "";
}

function importSave() {
    if(!document.getElementById('confirmImportCheckbox').checked) {
        return;
    }
    if(!document.getElementById("exportImportSave").value.trim()) {
        clearSave();
        return;
    }
    window.localStorage[saveName] = document.getElementById("exportImportSave").value;
    location.reload();
}