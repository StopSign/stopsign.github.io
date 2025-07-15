function clearSave() {
    window.localStorage[saveName] = "";
    location.reload();
}

data.saveVersion = 0;

const actionPatches = {
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


};

function load() {
    initializeData();

    let toLoad = {};

    // if(onLoadData) {
    //     toLoad = onLoadData;
    // } else if(localStorage[saveName]) {
    //     toLoad = JSON.parse(decode(localStorage[saveName]));
    // }

    // just after pleasant forest


    if(isLoadingEnabled && localStorage[saveName] && toLoad.actions) { //has a save file
        const saveVersion = toLoad.saveVersion || 0;

        // mergeExistingOnly(data, toLoad, "actions", ["x", "y", "realX", "realY"]); //use patch instead
        //these are in the skiplist because if, between saves, an action has changed the atts it has, the links need to be reset instead of saved.
        mergeExistingOnly(data, toLoad, "atts", ["linkedActionExpAtts", "linkedActionEfficiencyAtts", "linkedActionOnLevelAtts"]);
        mergeExistingOnly(data, toLoad, "upgrades");
        mergeExistingOnly(data, toLoad, "options");

        patchActions(data.actions, toLoad.actions, actionPatches);

        data.toastStates = toLoad.toastStates;

        data.gameState = toLoad.gameState ?? "default";

        //load global items that aren't lists or objects
        data.gameState = toLoad.gameState ?? "default";
        data.planeTabSelected = toLoad.planeTabSelected ?? 0;
        data.totalMomentum = toLoad.totalMomentum ?? 0;
        data.ancientCoin = toLoad.ancientCoin ?? 0;
        data.useAmuletButtonShowing = !!toLoad.useAmuletButtonShowing;
        data.secondsPerReset = toLoad.secondsPerReset ?? 0;
        data.currentJob = toLoad.currentJob ?? "Helping Scott";
        data.currentWage = toLoad.currentWage ?? 1;
        data.numberType = toLoad.numberType ?? "engineering";
        data.doneKTL = !!toLoad.doneKTL;
        data.doneAmulet = !!toLoad.doneAmulet;
        data.displayJob = !!toLoad.displayJob;
        data.focusSelected = toLoad.focusSelected ?? [];
        data.planeUnlocked = toLoad.planeUnlocked ?? [true, false, false, false];
        data.maxFocusAllowed = toLoad.maxFocusAllowed ?? 3;
        data.focusMult = toLoad.focusMult ?? 2;
        data.focusLoopMax = toLoad.focusLoopMax ?? 2.5;
        data.gameSettings.ticksPerSecond = toLoad.ticksPerSecond ?? 20;

        data.currentGameState = toLoad.currentGameState;
        data.gameSettings = toLoad.gameSettings;


        //data correction

        //new spells need to be leveled to current grimoire's level

    }

    //update all generator's multiplier data
    Object.values(actionData).forEach(action => {
        if (action.updateMults) action.updateMults();
    });

    initializeDisplay();
    setSlidersOnLoad(toLoad);
    // recalcInterval(data.options.updateRate);
    views.updateView();

    for(let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        if (actionObj.visible) {
            revealActionAtts(actionObj); //reveals the patch map reset actions
        }
    }

    debug(); //change game after all else, for easier debugging
}

function patchActions(dataActions, toLoadActions, patchMap) {
    const currentKeys = Object.keys(dataActions);
    const loadedKeys = toLoadActions ? Object.keys(toLoadActions) : [];

    for (const key of currentKeys) {
        // If action is not in the loaded data, reset it to its base state.
        if (!(key in toLoadActions)) {
            actionSetBaseVariables(dataActions[key], actionData[key]);
            continue;
        }

        // Check the patch map to see if this action should be preserved.
        const preventReset = patchMap[key]?.preventReset;

        // If reset is prevented, merge the loaded data and continue.
        if (preventReset) {
            Object.assign(dataActions[key], toLoadActions[key]);
            continue;
        }

        const isVisible = toLoadActions[key].visible;
        actionSetBaseVariables(dataActions[key], actionData[key]);
        dataActions[key].visible = isVisible;
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

    for (const key in toLoadObj) {
        if (Object.prototype.hasOwnProperty.call(toLoadObj, key) && Object.prototype.hasOwnProperty.call(dataObj, key)) {
            const targetObj = dataObj[key];
            const sourceObj = toLoadObj[key];

            if (typeof targetObj !== "object" || targetObj === null || typeof sourceObj !== "object" || sourceObj === null) {
                continue;
            }

            for (const propKey in sourceObj) {
                if (Object.prototype.hasOwnProperty.call(sourceObj, propKey)) {
                    if (!skipList.includes(propKey)) {
                        targetObj[propKey] = sourceObj[propKey];
                    }
                }
            }
        }
    }
}

function updateUIFromLoad() {
    for (let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        clickActionMenu(actionVar, actionObj.currentMenu, true);
        if (actionObj.unlocked) {
            revealActionAtts(actionObj);
        }
    }

    if (data.planeUnlocked[1] || data.planeUnlocked[2]) {
        for (let i = 0; i < data.planeUnlocked.length; i++) {
            if (data.planeUnlocked[i]) {
                unveilPlane(i);
            }
        }
    }

    if(data.doneAmulet) {
        document.getElementById("openViewAmuletButton").style.display = "";
        document.getElementById("ancientCoinDisplay").style.display = "";
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
    let encoded = encode(window.localStorage[saveName]);
    // console.log(encoded);
    document.getElementById("exportImportSave").value = encoded;
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

    load();
}