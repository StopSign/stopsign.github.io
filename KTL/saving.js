const actionsSchema = ['actionVar','purchased','lowestUnlockTime','lowestLevel1Time','prevUnlockTime','prevLevel1Time',
    'automationOnReveal','automationCanDisable','currentMenu','hasBeenUnlocked','unlockedCount','highestLevel',
    'secondHighestLevel','thirdHighestLevel','resource','progress','progressGain','progressMaxBase',
    'progressMaxMult','progressMax','actionPowerBase','actionPowerMult','level','maxLevel','exp','expGain','power',
    'expToLevelBase','expToLevelMult','expToLevel','resourceDelta','resourceIncrease','resourceDecrease',
    'resourceRetrieved','resourceToAdd','resourceIncreaseFromGens','expToLevelIncrease',
    'actionPowerMultIncrease','progressMaxIncrease','visible','showResourceAdded','showExpAdded','currentCustomNum',
    'unlockTime','level1Time','unlockCost','unlocked','isRunning','onLevelAtts','efficiencyAtts','expAtts',
    'efficiencyBase','efficiencyMult','expertise','attReductionEffect','efficiency','actionPower','expToAddBase',
    'expToAddMult','expToAdd','upgradeMult','readStory'];

function clearSave() {
    console.log("Clearing save")
    window.localStorage[saveName] = "";
    location.reload();
}



//TODO when using Decimal - hydrate the necessary numbers
//TODO also, only choose the vars you want to keep, rather than keeping bad data across saves
function loadActionFromSave(actionObj, loadObj) {
    Object.assign(actionObj, loadObj);
}


function loadUpgradeFromSave(actionObj, loadObj) {
    Object.assign(actionObj, loadObj);
}

data.saveVersion = 10;

function logSteamCloudToErrorLog(prefix, detailsObj = {}) {
    if (typeof addSteamErrorLog !== "function") {
        return;
    }
    const details = Object.entries(detailsObj)
        .filter(([, value]) => value !== undefined && value !== null && value !== "")
        .map(([key, value]) => `${key}=${String(value)}`)
        .join(", ");
    addSteamErrorLog(details ? `${prefix} | ${details}` : prefix);
}

function hasSteamCloudSaveAPI() {
    return !!(window.steamAPI &&
        typeof window.steamAPI.saveCloud === "function" &&
        typeof window.steamAPI.loadCloud === "function");
}

function saveToSteamCloud(saveString) {
    if (!hasSteamCloudSaveAPI()) {
        logSteamCloudToErrorLog("Steam Cloud save skipped: API unavailable");
        return;
    }
    window.steamAPI.saveCloud(saveString)
        .then((result) => {
            if (!result?.success && result?.error && result.error !== "Cloud saves are disabled") {
                console.warn("Steam Cloud save failed:", result.error);
            }
            if (!result?.success) {
                logSteamCloudToErrorLog("Steam Cloud save failed", {
                    error: result?.error || "Unknown error",
                    appEnabled: result?.details?.appEnabled,
                    accountEnabled: result?.details?.accountEnabled,
                    saveLength: typeof saveString === "string" ? saveString.length : -1
                });
            }
        })
        .catch((error) => {
            logSteamCloudToErrorLog("Steam Cloud save threw", {
                error: error?.message || String(error)
            });
            console.warn("Steam Cloud save failed:", error?.message || error);
        });
}

async function loadFromSteamCloudToLocal() {
    if (!hasSteamCloudSaveAPI()) {
        logSteamCloudToErrorLog("Steam Cloud load skipped: API unavailable");
        return false;
    }
    try {
        const result = await window.steamAPI.loadCloud();
        if (result?.success && typeof result.data === "string" && result.data.length > 0) {
            window.localStorage[saveName] = result.data;
            console.log("Loaded save from Steam Cloud.");
            return true;
        }
        logSteamCloudToErrorLog("Steam Cloud load did not apply data", {
            success: !!result?.success,
            error: result?.error || null,
            dataLength: typeof result?.data === "string" ? result.data.length : 0,
            appEnabled: result?.details?.appEnabled,
            accountEnabled: result?.details?.accountEnabled
        });
        if (result?.error && result.error !== "Cloud saves are disabled" && result.error !== "File does not exist") {
            console.warn("Steam Cloud load failed:", result.error);
        }
    } catch (error) {
        logSteamCloudToErrorLog("Steam Cloud load threw", {
            error: error?.message || String(error)
        });
        console.warn("Steam Cloud load failed:", error?.message || error);
    }
    return false;
}

async function load() {
    initializeData();

    let toLoad = {};

    if(loadStaticSaveFile) {
        if(onLoadData) {
            try {
                console.log('Loading locally.');
                toLoad = JSON.parse(decode64(onLoadData));
            } catch (e) {
                try { //old save
                    toLoad = JSON.parse(decode(onLoadData));
                } catch (e) {
                    exportFile(onLoadData, "KTL_Error_File")
                }
            }
        }
    } else {
        await loadFromSteamCloudToLocal();
        if (localStorage[saveName]) {
            if (localStorage[saveName].startsWith("{\"actions\":")) {
                console.log('Save version 8+ found.');
                try {
                    toLoad = JSON.parse(localStorage[saveName]);
                } catch (e) {
                    exportFile(localStorage[saveName], "KTL_Error_File")
                }
            } else {
                console.log('Save found.');
                try {
                    toLoad = JSON.parse(decode64(localStorage[saveName]));
                } catch (e) {
                    try { //old save
                        toLoad = JSON.parse(decode(localStorage[saveName]));
                    } catch (e) {
                        exportFile(localStorage[saveName], "KTL_Error_File")
                    }
                }
            }
        }
    }
    if(!isLoadingEnabled) {
        console.log('Save ignored.');
        toLoad = {};
    }

    const saveVersionFromLoad = toLoad && toLoad.saveVersion !== undefined ? toLoad.saveVersion : data.saveVersion;

    let queuedLogMessages = []; //Any info that needs to be told to the user

    if((loadStaticSaveFile || localStorage[saveName]) && saveVersionFromLoad < 6) {
        if(!loadStaticSaveFile) {
            exportFile(localStorage[saveName], "KTL_v2_Backup") //just in case
        }
        handleV2Saves(toLoad) //set aside the data you need, show welcome back message
        document.getElementById("welcomeBackMessage").style.display = "";
    } else if(localStorage[saveName] && toLoad.actions) {
        toLoad.actions = saveVersionFromLoad <= 7 ? toLoad.actions : reverseExtractNestedSchema(toLoad.actions, actionsSchema);
        //only go through the ones in toLoad and graft them on to existing data
        for(let actionVar in toLoad.actions) {
            let actionObj = data.actions[actionVar];
            let dataObj = actionData[actionVar];
            let loadObj = toLoad.actions[actionVar];
            if(!dataObj) {
                continue;
            }
            if(dataObj.creationVersion > saveVersionFromLoad) {
                actionObj.automationOnReveal = loadObj.automationOnReveal;
                // console.log("Skipped loading action " + actionVar + " from save.");
                continue;
            }
            loadActionFromSave(actionObj, loadObj);

        }

        let refundAmount = 0;
        for(let upgradeVar in toLoad.upgrades) {
            let upgradeObj = data.upgrades[upgradeVar];
            let upgradeDataObj = upgradeData[upgradeVar];
            let loadObj = toLoad.upgrades[upgradeVar];
            if(!upgradeDataObj || upgradeDataObj.creationVersion > saveVersionFromLoad) { //If removed or needs to refresh
                let toRefund = calcTotalSpentOnUpgrade(loadObj.initialCost, loadObj.costIncrease, loadObj.upgradesBought, loadObj.additiveIncrease);
                if(toRefund > 0) {
                    refundAmount += toRefund;
                    queuedLogMessages.push(["Info: Refunded <b>"+toRefund+"</b> AC for the upgrade: " + (loadObj.title || decamelizeWithSpace(upgradeVar)), "info"])
                }
                // console.log("Skipped loading upgrade " + upgradeVar + " from save.");
                continue;
            }
            loadUpgradeFromSave(upgradeObj, loadObj);
        }

        for(let shopVar in toLoad.shopUpgrades) {
            let shopObj = data.shopUpgrades[shopVar] ?? {};
            let shopDataObj = shopUpgrades[shopVar];
            let loadObj = toLoad.shopUpgrades[shopVar];
            if(!shopDataObj || shopDataObj.creationVersion > saveVersionFromLoad) { //If removed or needs to refresh
                let toRefund = calcTotalSpentOnUpgrade(loadObj.initialCost, loadObj.costIncrease, loadObj.upgradesBought, loadObj.additiveIncrease);
                if(toRefund > 0) {
                    refundAmount += toRefund;
                    queuedLogMessages.push(["Info: Refunded <b>"+toRefund+"</b> SC for the upgrade: " + (loadObj.title || decamelizeWithSpace(shopVar)), "info"])
                }
                continue;
            }
            loadUpgradeFromSave(shopObj, loadObj);
        }

        // mergeExistingOnly(data, toLoad, "actions", ["x", "y", "realX", "realY"]); //use patch instead
        //these are in the skiplist because if, between saves, an action has changed the atts it has, the links need to be reset instead of saved.
        mergeExistingOnly(data, toLoad, "atts", ["linkedActionExpAtts", "linkedActionEfficiencyAtts", "linkedActionOnLevelAtts"]);
        mergeExistingOnly(data, toLoad, "options");
        mergeExistingOnly(data, toLoad, "gameSettings");

        data.toastStates = toLoad.toastStates;

        //load global items that aren't lists or objects
        data.gameState = toLoad.gameState ?? "default";
        data.planeTabSelected = toLoad.planeTabSelected ?? 0;
        data.totalMomentum = toLoad.totalMomentum ?? 0;
        data.ancientCoin = toLoad.ancientCoin ?? 0;
        data.ancientWhisper = toLoad.ancientWhisper ?? 0;
        data.useAmuletButtonShowing = !!toLoad.useAmuletButtonShowing;
        data.secondsPerReset = toLoad.secondsPerReset ?? 0;
        data.currentJob = toLoad.currentJob ?? "helpScottWithChores";
        data.currentWage = toLoad.currentWage ?? 1;
        data.doneKTL = !!toLoad.doneKTL;
        data.doneAmulet = !!toLoad.doneAmulet;
        data.displayJob = !!toLoad.displayJob;
        data.focusSelected = toLoad.focusSelected ?? [];
        data.resetLogs = toLoad.resetLogs ?? [];
        data.planeUnlocked = toLoad.planeUnlocked ?? [true, false, false, false, false];
        if (Array.isArray(data.planeUnlocked) && data.planeUnlocked.length === 4) {
            data.planeUnlocked = [...data.planeUnlocked, false];
        }
        data.maxFocusAllowed = toLoad.maxFocusAllowed ?? 2;
        data.lastVisit = toLoad.lastVisit ?? Date.now();
        data.currentLog = toLoad.currentLog ?? [];
        data.currentPinned = toLoad.currentPinned ?? [];
        data.ancientCoinMultKTL = toLoad.ancientCoinMultKTL ?? 1;
        data.ancientWhisperMultKTL = toLoad.ancientWhisperMultKTL ?? 1;
        data.legacyMultKTL = toLoad.legacyMultKTL ?? 1;
        data.resetCount = toLoad.resetCount ?? 1;
        data.ancientCoinGained = toLoad.ancientCoinGained ?? 0;
        data.ancientWhisperGained = toLoad.ancientWhisperGained ?? 0;
        data.queuedReveals = toLoad.queuedReveals ?? {};
        data.legacy = toLoad.legacy ?? 0;
        data.lichKills = toLoad.lichKills ?? 0;
        data.lichCoins = toLoad.lichCoins ?? 0;
        data.highestLegacy = toLoad.highestLegacy ?? 0;
        data.genesisPoints = toLoad.genesisPoints ?? 0;
        data.genesisResets = toLoad.genesisResets ?? 0;
        data.fightGenerated = toLoad.fightGenerated ?? 0;
        data.soulCoins = toLoad.soulCoins ?? 0;
        data.totalDailySoulCoins = toLoad.totalDailySoulCoins ?? 0;
        data.totalBoughtSoulCoins = toLoad.totalBoughtSoulCoins ?? 0;

        data.currentGameState = toLoad.currentGameState;
        data.currentGameState.dailyTimer = toLoad.currentGameState.dailyTimer ?? 0;
        data.currentGameState.dailyCharges = toLoad.currentGameState.dailyCharges ?? 0;

        data.chartData = reverseExtractNestedSchema(toLoad.chartData, true) ?? [];

        //data correction
        if(toLoad.gameSettings.viewAdvancedSliders === undefined) { //defaults off on new saves
            data.gameSettings.viewAdvancedSliders = true;
        }



        refundAmount += saveFileCorrection(saveVersionFromLoad)

        data.ancientCoin += refundAmount;
        applyUpgradeEffects()
        adjustMagicMaxLevels()
    }

    //update all generator's multiplier data
    for(let actionVar in actionData) {
        let dataObj = actionData[actionVar];
        if(dataObj.updateMults) {
            dataObj.updateMults();
        }
    }

    initializeDisplay();
    adjustUIAfterLoad(toLoad, saveVersionFromLoad);
    views.updateView();


    for(let queuedLogMessage of queuedLogMessages) {
        addLogMessage(queuedLogMessage[0], queuedLogMessage[1]);
    }
    saveFileCorrectionAfterLoad(saveVersionFromLoad);
    debug(); //change game after all else, for easier debugging
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

function save() {
    data.lastVisit = Date.now();
    let sdata = structuredClone(data);
    sdata.chartData = extractNestedSchema(sdata.chartData);
    sdata.actions = extractNestedSchema(sdata.actions, actionsSchema);
    const saveString = JSON.stringify(sdata);
    window.localStorage[saveName] = saveString;
    saveToSteamCloud(saveString);
}

function exportSave() {
    save();
    document.getElementById("exportImportSave").value = window.localStorage[saveName];
    document.getElementById("exportImportSave").select();
    document.execCommand('copy');
    document.getElementById("exportImportSave").value = "";
}

function exportFile(data, name, ext = "txt") {
    const blob = new Blob([data], { type: 'application/gzip' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;

    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    a.download = `${name}_${year}-${month}-${day}_${hours}-${minutes}-${seconds}.${ext}`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}

function exportSaveFile(name="KTL_Save") {
    save();
    const data = fflate.gzipSync(fflate.strToU8(window.localStorage[saveName]));
    exportFile(data, name, "save")
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

function importSaveFile() {
    const input = document.getElementById("importSaveFileInput");
    const file = input.files[0];
    if (!file) return;

    if (file.name.toLowerCase().endsWith(".save")) {
        read_gzip(file);
    } else {
        read_base64(file);
    }
}

function read_base64(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result.trim();
        if (!content) {
            clearSave();
        } else {
            window.localStorage[saveName] = content;
        }
        location.reload();
    };
    reader.readAsText(file);
}

function read_gzip(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const compressedData = new Uint8Array(content);
        validateGzipData(compressedData);
        // Decompress
        const decompressed = fflate.gunzipSync(compressedData);

        // Convert to text
        const text = fflate.strFromU8(decompressed);
        if (!content) {
            clearSave();
        } else {
            window.localStorage[saveName] = text;
        }
        location.reload();
    };
    reader.readAsArrayBuffer(file);
}

function validateGzipData(data) {
    // Check magic number
    if (data.length < 2 || data[0] !== 0x1F || data[1] !== 0x8B) {
        throw new Error('Invalid gzip header: missing magic bytes');
    }

    // Check compression method (should be 8 for DEFLATE)
    if (data.length >= 3 && data[2] !== 8) {
        console.warn('Unknown compression method:', data[2]);
    }

    return true;
}

function extractNestedSchema(data, schema) {
    // Input validation
    if (data === null || data === undefined) {
        console.warn('Input cannot be null or undefined');
        return;
    }

    if (Array.isArray(data)) {
        return extractNestedSchemaFromArray(data, schema);
    } else if (typeof data === 'object') {
        return extractNestedSchemaFromObject(data, schema);
    } else {
        console.warn('Input must be an object or array');
    }
}

function extractNestedSchemaFromArray(arr, schema) {
    // Validate input
    if (!Array.isArray(arr)) {
        console.warn('Expected array');
        return;
    }

    // Auto-detect schema if not provided
    if (!Array.isArray(schema)) {
        const schemaSet = new Set();

        arr.forEach((item, index) => {
            if (item && typeof item === 'object') {
                Object.keys(item).forEach(key => schemaSet.add(key));
            } else if (item !== undefined && item !== null) {
                console.warn(`Warning: Item at index ${index} is not an object:`, item);
            }
        });

        schema = Array.from(schemaSet);
    }

    // Extract values
    const extractedArray = arr.map((item, index) => {
        if (!item || typeof item !== 'object') {
            console.warn(`Warning: Item at index ${index} is not an object, using undefined values`);
            return schema.map(() => undefined);
        }
        return schema.map(field => item[field]);
    });

    // Return with schema attached
    return {schema, array: extractedArray};
}

function extractNestedSchemaFromObject(obj, schema) {
    // Validate input
    if (typeof obj !== 'object' || obj === null) {
        console.warn('Expected object');
        return;
    }

    const keys = Object.keys(obj);

    // Handle empty object
    if (keys.length === 0) {
        return { schema: schema || [], object: {}, exclusive: {} };
    }

    // Initialize results
    const sharedFields = {};
    const exclusiveFields = {};

    // Process each top-level key
    for (const key of keys) {
        const value = obj[key];

        // Skip if not an object
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            console.warn(`Warning: Value for key "${key}" is not a plain object`);
            sharedFields[key] = schema.map(() => undefined);
            continue;
        }

        // Extract shared fields in schema order
        const sharedArray = [];
        const exclusiveObj = {};

        for (let i = 0; i < schema.length; i++) {
            const field = schema[i];
            if (field in value) {
                sharedArray[i] = value[field];
            } else {
                sharedArray[i] = undefined;
            }
        }
        sharedFields[key] = sharedArray;

        // Collect exclusive fields (not in schema)
        for (const field of Object.keys(value)) {
            if (!schema.includes(field)) {
                exclusiveObj[field] = value[field];
            }
        }

        // Only add exclusive object if it has properties
        if (Object.keys(exclusiveObj).length > 0) {
            exclusiveFields[key] = exclusiveObj;
        }
    }

    return { schema, object: sharedFields, exclusive: exclusiveFields };
}

function reverseExtractNestedSchema(extractedData, ignoreMissing) {
    if (extractedData === null || extractedData === undefined) {
        if (!ignoreMissing) {
            console.warn('Extracted data cannot be null or undefined');
        }
        return;
    }

    // Check if it's array format (from extractNestedSchemaFromArray)
    if (extractedData.array && Array.isArray(extractedData.array) && extractedData.schema) {
        return reverseExtractNestedSchemaFromArray(extractedData);
    }
    // Check if it's object format (from extractNestedSchemaFromObject)
    else if (extractedData.object && typeof extractedData.object === 'object' && extractedData.schema) {
        return reverseExtractNestedSchemaFromObject(extractedData);
    }
    else {
        console.warn('Invalid extracted data format. Expected {schema, array} or {schema, object}');
    }
}

function reverseExtractNestedSchemaFromArray(extractedData) {
    // Validate input
    if (!extractedData || !Array.isArray(extractedData.schema) || !Array.isArray(extractedData.array)) {
        console.warn('Invalid extracted data format. Expected {schema: array, array: array}');
        return;
    }

    const { schema, array } = extractedData;

    // Handle empty array
    if (array.length === 0) {
        return [];
    }

    // Reconstruct array of objects
    return array.map((row, rowIndex) => {
        if (!Array.isArray(row)) {
            console.warn(`Warning: Row at index ${rowIndex} is not an array, skipping`);
            return {};
        }

        const obj = {};

        // Map each field from schema to its value
        schema.forEach((field, fieldIndex) => {
            if (fieldIndex < row.length) {
                if (row[fieldIndex] !== null) { //JSON.stringify() replaces undefined with null
                    obj[field] = row[fieldIndex];
                }
                // If value is undefined, skip adding the property
            }
        });

        return obj;
    });
}

function reverseExtractNestedSchemaFromObject(extractedData) {
    // Validate input
    if (!extractedData || typeof extractedData !== 'object') {
        console.warn('Invalid extracted data');
        return;
    }

    const { schema, object, exclusive } = extractedData;

    // Validate required properties
    if (!Array.isArray(schema)) {
        console.warn('Schema must be an array');
        return;
    }

    if (!object || typeof object !== 'object') {
        console.warn('Object property must be an object');
        return;
    }

    // Get all keys from both shared and exclusive
    const allKeys = new Set([...Object.keys(object), ...(exclusive ? Object.keys(exclusive) : [])]);

    // Handle empty case
    if (allKeys.size === 0) {
        return {};
    }

    // Reconstruct the original object
    const reconstructed = {};

    for (const key of allKeys) {
        // Start with an empty object
        const nestedObj = {};

        // Add shared fields (from schema order array)
        if (object[key] && Array.isArray(object[key])) {
            const sharedArray = object[key];
            for (let i = 0; i < schema.length && i < sharedArray.length; i++) {
                const value = sharedArray[i];
                if (value !== null) { //JSON.stringify() replaces undefined with null
                    nestedObj[schema[i]] = value;
                }
            }
        }

        // Add exclusive fields
        if (exclusive && exclusive[key] && typeof exclusive[key] === 'object') {
            Object.assign(nestedObj, exclusive[key]);
        }

        // Only add if object has properties
        if (Object.keys(nestedObj).length > 0) {
            reconstructed[key] = nestedObj;
        }
    }

    return reconstructed;
}