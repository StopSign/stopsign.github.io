function startGame() {
    window.doWork = new Worker("interval.js");
    window.doWork.onmessage = function(event) {
        if (event.data === "interval.start") {
            tick();
        }
    };
    load();
}

function cheat() {
    if (gameSpeed === 1) gameSpeed = 20;
    else gameSpeed = 1;
}

let mainTickLoop;
const saveName = "idleLoops1";

// this is to hide the cheat button if you aren't supposed to cheat
if (window.location.href.includes("http://10.0.0.3:8080/loops/")) document.getElementById("cheat").style.display = "inline-block";

const timeNeededInitial = 5 * 50;
// eslint-disable-next-line prefer-const
let timer = timeNeededInitial;
// eslint-disable-next-line prefer-const
let timeNeeded = timeNeededInitial;
// eslint-disable-next-line prefer-const
let stop = false;
const view = new View();
const actions = new Actions();
const towns = [];
// eslint-disable-next-line prefer-const
let curTown = 0;

const statList = ["Dex", "Str", "Con", "Spd", "Per", "Cha", "Int", "Luck", "Soul"];
const stats = {};
let totalTalent = 0;
// eslint-disable-next-line prefer-const
let shouldRestart = true;

// eslint-disable-next-line prefer-const
let resources = {
    gold: 0,
    reputation: 0,
    herbs: 0,
    hide: 0,
    potions: 0,
    teamMembers: 0,
    armor: 0,
    blood: 0,
    artifacts: 0,
    glasses: false,
    supplies: false,
    pickaxe: false,
    loopingPotion: false
};
const resourcesTemplate = copyObject(resources);
// eslint-disable-next-line prefer-const
let guild = "";

let curLoadout = 0;
let loadouts = [];
let loadoutnames = ["1", "2", "3", "4", "5"];
const skillList = ["Combat", "Magic", "Practical", "Alchemy", "Crafting", "Dark", "Chronomancy", "Pyromancy", "Restoration", "Spatiomancy"];
const skills = {};
const buffList = ["Ritual", "Imbuement", "Feast", "Aspirant"];
const buffHardCaps = {
    Ritual: 666,
    Imbuement: 490,
    Feast: 100,
    Aspirant: 20
};
const buffCaps = {
    Ritual: 666,
    Imbuement: 490,
    Feast: 100,
    Aspirant: 20
};
const buffs = {};
// eslint-disable-next-line prefer-const
let townShowing = 0;
// eslint-disable-next-line prefer-const
let actionStoriesShowing = false;
let townsUnlocked = [];
let statShowing;
let skillShowing;
let curActionShowing;
let dungeonShowing;
let actionTownNum;
let trainingLimits;
let storyShowing = 0;
let storyMax = 0;
const storyReqs = {
    maxSQuestsInALoop: false,
    maxLQuestsInALoop: false,
    heal10PatientsInALoop: false,
    failedHeal: false,
    clearSDungeon: false,
    haggle: false,
    haggle15TimesInALoop: false,
    haggle16TimesInALoop: false,
    glassesBought: false,
    partyThrown: false,
    strengthTrained: false,
    suppliesBought: false,
    suppliesBoughtWithoutHaggling: false,
    smallDungeonAttempted: false,
    satByWaterfall: false,
    dexterityTrained: false,
    speedTrained: false,
    birdsWatched: false,
    darkRitualThirdSegmentReached: false,
    failedBrewPotions: false,
    failedBrewPotionsNegativeRep: false,
    potionBrewed: false,
    failedGamble: false,
    failedGambleLowMoney: false,
    potionSold: false,
    sell20PotionsInALoop: false,
    sellPotionFor100Gold: false,
    advGuildTestsTaken: false,
    advGuildRankEReached: false,
    advGuildRankDReached: false,
    advGuildRankCReached: false,
    advGuildRankBReached: false,
    advGuildRankAReached: false,
    advGuildRankSReached: false,
    advGuildRankUReached: false,
    advGuildRankGodlikeReached: false,
    teammateGathered: false,
    fullParty: false,
    failedGatherTeam: false,
    largeDungeonAttempted: false,
    clearLDungeon: false,
    craftGuildTestsTaken: false,
    craftGuildRankEReached: false,
    craftGuildRankDReached: false,
    craftGuildRankCReached: false,
    craftGuildRankBReached: false,
    craftGuildRankAReached: false,
    craftGuildRankSReached: false,
    craftGuildRankUReached: false,
    craftGuildRankGodlikeReached: false,
    armorCrafted: false,
    craft10Armor: false,
    failedCraftArmor: false,
    booksRead: false,
    pickaxeBought: false,
    loopingPotionMade: false,
    slay10TrollsInALoop: false,
    imbueMindThirdSegmentReached: false,
    judgementFaced: false,
    acceptedIntoValhalla: false,
    castIntoShadowRealm: false
};

const curDate = new Date();
let totalOfflineMs = 0;
// eslint-disable-next-line prefer-const
let bonusSpeed = 1;
const offlineRatio = 1;

// eslint-disable-next-line prefer-const
let curAdvGuildSegment = 0;
// eslint-disable-next-line prefer-const
let curCraftGuildSegment = 0;

const options = {
    theme: "normal",
    keepCurrentList: false,
    repeatLastAction: false,
    addActionsToTop: false,
    pauseBeforeRestart: false,
    pauseOnFailedLoop: false,
    pingOnPause: false,
    hotkeys: true,
    updateRate: 50
};

function setOption(option, value) {
    options[option] = value;
    if (option === "updateRate") recalcInterval(options.updateRate);
}

function loadOption(option, value) {
    if (option === "updateRate") document.getElementById(`${option}Input`).value = value;
    else document.getElementById(`${option}Input`).checked = value;
}

function closeTutorial() {
    document.getElementById("tutorial").style.display = "none";
}

function clearSave() {
    window.localStorage[saveName] = "";
}

function loadDefaults() {
    initializeStats();
    initializeSkills();
    initializeBuffs();
}

function loadUISettings() {
    document.getElementById("expandableList").style.height = localStorage.getItem("actionListHeight");
    curActionsDiv.style.maxHeight = `${parseInt(localStorage.getItem("actionListHeight")) - 43}px`;
    nextActionsDiv.style.maxHeight = `${parseInt(localStorage.getItem("actionListHeight")) - 43}px`;
}

function saveUISettings() {
    if ((document.getElementById("expandableList").style.height === "")) localStorage.setItem("actionListHeight", document.getElementById("expandableList").style.height = "500px");
    else localStorage.setItem("actionListHeight", document.getElementById("expandableList").style.height);
}

function load() {
    loadDefaults();
    loadUISettings();

    let toLoad = {};
    // has a save file
    if (window.localStorage[saveName] && window.localStorage[saveName] !== "null") {
        closeTutorial();
        toLoad = JSON.parse(window.localStorage[saveName]);
    }

    for (const property in toLoad.stats) {
        if (toLoad.stats.hasOwnProperty(property)) {
            stats[property].talent = toLoad.stats[property].talent;
            stats[property].soulstone = toLoad.stats[property].soulstone;
        }
    }
    for (const property in toLoad.skills) {
        if (toLoad.skills.hasOwnProperty(property)) {
            skills[property].exp = toLoad.skills[property].exp;
        }
    }

    for (const property in toLoad.buffs) {
        if (toLoad.buffs.hasOwnProperty(property)) {
            // need the min for people with broken buff amts from pre 0.93
            buffs[property].amt = Math.min(toLoad.buffs[property].amt, buffHardCaps[property]);
        }
    }

    if (toLoad.buffCaps !== undefined) {
        for (const property in buffCaps) {
            if (toLoad.buffCaps.hasOwnProperty(property)) {
                buffCaps[property] = toLoad.buffCaps[property];
                document.getElementById(`buff${property}Cap`).value = buffCaps[property];
            }
        }
    }

    if (toLoad.storyReqs !== undefined) {
        for (const property in storyReqs) {
            if (toLoad.storyReqs.hasOwnProperty(property)) {
                storyReqs[property] = toLoad.storyReqs[property];
            }
        }
    }

    if (toLoad.totalTalent === undefined) {
        let temptotalTalent = 0;
        for (const property in toLoad.stats) {
            if (toLoad.stats.hasOwnProperty(property)) {
                temptotalTalent += toLoad.stats[property].talent * 100;
            }
        }
        totalTalent = temptotalTalent;
    } else {
        totalTalent = toLoad.totalTalent;
    }

    if (toLoad.maxTown) {
        townsUnlocked = [0];
        for (let i = 1; i <= toLoad.maxTown; i++) {
            townsUnlocked.push(i);
        }
    } else {
        townsUnlocked = toLoad.townsUnlocked === undefined ? [0] : toLoad.townsUnlocked;
    }
    for (let i = 0; i < 6; i++) {
        towns[i] = new Town(i);
    }
    actionTownNum = toLoad.actionTownNum === undefined ? 0 : toLoad.actionTownNum;
    trainingLimits = toLoad.trainingLimits === undefined ? 10 : toLoad.trainingLimits;

    actions.next = [];
    if (toLoad.nextList) {
        for (const action of toLoad.nextList) {
            if (action.name === "Guided Tour") {
                continue;
            }
            if (action.name === "Sell Gold") {
                action.name = "Buy Mana";
            }
            if (action.name === "Tournament") {
                action.name = "Buy Pickaxe";
            }
            if (action.name === "Train Dex") {
                action.name = "Train Dexterity";
            }
            actions.next.push(action);
        }
    }
    actions.nextLast = copyObject(actions.next);
    loadouts = [[], [], [], [], [], []];
    if (toLoad.loadouts) {
        for (let i = 0; i < toLoad.loadouts.length; i++) {
            if (!toLoad.loadouts[i]) {
                continue;
            }
            for (const action of toLoad.loadouts[i]) {
                if (action.name === "Guided Tour") {
                    continue;
                }
                if (action.name === "Sell Gold") {
                    action.name = "Buy Mana";
                }
                if (action.name === "Tournament") {
                    action.name = "Buy Pickaxe";
                }
                if (action.name === "Train Dex") {
                    action.name = "Train Dexterity";
                }
                loadouts[i].push(action);
            }
        }
    }
    if (toLoad.loadoutnames) {
        for (let i = 0; i < 5; i++) {
            loadoutnames[i] = toLoad.loadoutnames[i];
        }
    } else {
        loadoutnames = ["1", "2", "3", "4", "5"];
    }
    curLoadout = toLoad.curLoadout;
    const elem = document.getElementById(`load${curLoadout}`);
    if (elem) {
        removeClassFromDiv(document.getElementById(`load${curLoadout}`), "unused");
    }

    if (toLoad.dungeons) {
        if (toLoad.dungeons.length === 2) {
            toLoad.dungeons.push([]);
        }
    }
    const level = { ssChance: 1, completed: 0 };
    let floors = 0;
    for (let i = 0; i < dungeons.length; i++) {
        if (i === 0) floors = 6;
        else if (i === 1) floors = 9;
        else if (i === 2) floors = 20;
        for (let j = 0; j < floors; j++) {
            if (toLoad.dungeons && toLoad.dungeons[i][j]) {
                dungeons[i][j] = toLoad.dungeons[i][j];
            } else {
                dungeons[i][j] = copyArray(level);
            }
            dungeons[i][j].lastStat = "NA";
        }
    }

    if (toLoad.options === undefined) {
        options.theme = toLoad.currentTheme === undefined ? "normal" : toLoad.currentTheme;
        options.repeatLastAction = toLoad.repeatLast;
        options.pingOnPause = toLoad.pingOnPause === undefined ? false : toLoad.pingOnPause;
        options.hotkeys = toLoad.hotkeys === undefined ? true : toLoad.hotkeys;
        options.updateRate = toLoad.updateRate === undefined ? 50 : toLoad.updateRate;
    } else {
        for (const option in toLoad.options) {
            options[option] = toLoad.options[option];
        }
    }

    for (const town of towns) {
        for (const action of town.totalActionList) {
            if (action.type === "progress")
                town[`exp${action.varName}`] = toLoad[`exp${action.varName}`] === undefined ? 0 : toLoad[`exp${action.varName}`];
            else if (action.type === "multipart")
                town[`total${action.varName}`] = toLoad[`total${action.varName}`] === undefined ? 0 : toLoad[`total${action.varName}`];
            else if (action.type === "limited") {
                const varName = action.varName;
                if (toLoad[`total${varName}`] !== undefined)
                    town[`total${varName}`] = toLoad[`total${varName}`];
                if (toLoad[`checked${varName}`] !== undefined)
                    town[`checked${varName}`] = toLoad[`checked${varName}`];
                if (toLoad[`good${varName}`] !== undefined)
                    town[`good${varName}`] = toLoad[`good${varName}`];
                if (toLoad[`good${varName}`] !== undefined)
                    town[`goodTemp${varName}`] = toLoad[`good${varName}`];
            }
        }
    }
    
    view.initalize();

    for (const town of towns) {
        for (const action of town.totalActionList) {
            if (action.type === "limited") {
                const varName = action.varName;
                if (toLoad[`searchToggler${varName}`] !== undefined) {
                    document.getElementById(`searchToggler${varName}`).checked = toLoad[`searchToggler${varName}`];
                }
                view.updateRegular(action.varName, town.index);
            }
        }
    }

    for (const option in options) {
        loadOption(option, options[option]);
    }
    storyShowing = toLoad.storyShowing === undefined ? 0 : toLoad.storyShowing;
    storyMax = toLoad.storyMax === undefined ? 0 : toLoad.storyMax;

    totalOfflineMs = toLoad.totalOfflineMs === undefined ? 0 : toLoad.totalOfflineMs;
    // capped at 1 month of gain
    addOffline(Math.min(Math.floor((new Date() - new Date(toLoad.date)) * offlineRatio), 2678400000));

    if (toLoad.version75 === undefined) {
        const total = towns[0].totalSDungeon;
        dungeons[0][0].completed = Math.floor(total / 2);
        dungeons[0][1].completed = Math.floor(total / 4);
        dungeons[0][2].completed = Math.floor(total / 8);
        dungeons[0][3].completed = Math.floor(total / 16);
        dungeons[0][4].completed = Math.floor(total / 32);
        dungeons[0][5].completed = Math.floor(total / 64);
        towns[0].totalSDungeon = dungeons[0][0].completed + dungeons[0][1].completed + dungeons[0][2].completed + dungeons[0][3].completed + dungeons[0][4].completed + dungeons[0][5].completed;
    }

    adjustAll();

    view.updateLoadoutNames();
    view.changeStatView();
    view.updateNextActions();
    view.updateMultiPartActions();
    view.updateStories(true);
    view.update();
    recalcInterval(options.updateRate);
    pauseGame();

}

function save() {
    const toSave = {};
    toSave.curLoadout = curLoadout;
    toSave.dungeons = dungeons;
    toSave.townsUnlocked = townsUnlocked;
    toSave.actionTownNum = actionTownNum;
    toSave.trainingLimits = trainingLimits;

    toSave.stats = stats;
    toSave.totalTalent = totalTalent;
    toSave.skills = skills;
    toSave.buffs = buffs;
    toSave.version75 = true;

    for (const town of towns) {
        for (const action of town.totalActionList) {
            if (action.type === "progress") {
                toSave[`exp${action.varName}`] = town[`exp${action.varName}`];
            } else if (action.type === "multipart") {
                toSave[`total${action.varName}`] = town[`total${action.varName}`];
            } else if (action.type === "limited") {
                const varName = action.varName;
                toSave[`total${varName}`] = town[`total${varName}`];
                toSave[`checked${varName}`] = town[`checked${varName}`];
                toSave[`good${varName}`] = town[`good${varName}`];
                toSave[`goodTemp${varName}`] = town[`good${varName}`];
                if (document.getElementById(`searchToggler${varName}`)) {
                    toSave[`searchToggler${varName}`] = document.getElementById(`searchToggler${varName}`).checked;
                }
            }
        }
    }
    toSave.nextList = actions.next;
    toSave.loadouts = loadouts;
    toSave.loadoutnames = loadoutnames;
    toSave.options = options;
    toSave.storyShowing = storyShowing;
    toSave.storyMax = storyMax;
    toSave.storyReqs = storyReqs;
    toSave.buffCaps = buffCaps;

    toSave.date = new Date();
    toSave.totalOfflineMs = totalOfflineMs;

    window.localStorage[saveName] = JSON.stringify(toSave);
}

function isOldAction(name) {
    if (name === "Wander") {
        return true;
    }
    if (name === "Smash Pots") {
        return true;
    }
    if (name === "Pick Locks") {
        return true;
    }
    if (name === "Buy Glasses") {
        return true;
    }
    if (name === "Buy Mana") {
        return true;
    }
    if (name === "Meet People") {
        return true;
    }
    if (name === "Train Strength") {
        return true;
    }
    if (name === "Short Quest") {
        return true;
    }
    if (name === "Investigate") {
        return true;
    }
    if (name === "Long Quest") {
        return true;
    }
    if (name === "Warrior Lessons") {
        return true;
    }
    if (name === "Mage Lessons") {
        return true;
    }
    if (name === "Throw Party") {
        return true;
    }
    if (name === "Heal The Sick") {
        return true;
    }
    if (name === "Fight Monsters") {
        return true;
    }
    if (name === "Small Dungeon") {
        return true;
    }
    if (name === "Buy Supplies") {
        return true;
    }
    if (name === "Haggle") {
        return true;
    }
    if (name === "Start Journey") {
        return true;
    }
    // town 2
    if (name === "Explore Forest") {
        return true;
    }
    if (name === "Wild Mana") {
        return true;
    }
    if (name === "Gather Herbs") {
        return true;
    }
    if (name === "Hunt") {
        return true;
    }
    if (name === "Sit By Waterfall") {
        return true;
    }
    if (name === "Old Shortcut") {
        return true;
    }
    if (name === "Talk To Hermit") {
        return true;
    }
    if (name === "Practical Magic") {
        return true;
    }
    if (name === "Learn Alchemy") {
        return true;
    }
    if (name === "Brew Potions") {
        return true;
    }
    if (name === "Train Dex") {
        return true;
    }
    if (name === "Train Speed") {
        return true;
    }
    if (name === "Continue On") {
        return true;
    }
    // town 3
    if (name === "Explore City") {
        return true;
    }
    if (name === "Gamble") {
        return true;
    }
    if (name === "Get Drunk") {
        return true;
    }
    if (name === "Purchase Mana") {
        return true;
    }
    if (name === "Sell Potions") {
        return true;
    }
    if (name === "Read Books") {
        return true;
    }
    if (name === "Adventure Guild") {
        return true;
    }
    if (name === "Gather Team") {
        return true;
    }
    if (name === "Large Dungeon") {
        return true;
    }
    if (name === "Crafting Guild") {
        return true;
    }
    if (name === "Craft Armor") {
        return true;
    }
    if (name === "Apprentice") {
        return true;
    }
    if (name === "Mason") {
        return true;
    }
    if (name === "Architect") {
        return true;
    }

    return false;
}

// start old save

function exportOldSave() {
    // eslint-disable-next-line max-len
    if (!confirm("This will give you your save file with all save data for any content added in this fork removed.This will allow you to import your save back to stopsign.github.io, but you will lose any progress you made on features exclusive to this fork.")) return;
    const toSave = {};
    toSave.curLoadout = Math.min(curLoadout, 4);
    toSave.dungeons = [dungeons[0], dungeons[1]];
    if (towns[2].unlocked()) toSave.maxTown = 2;
    else if (towns[1].unlocked()) toSave.maxTown = 1;
    else if (towns[0].unlocked()) toSave.maxTown = 0;
    toSave.actionTownNum = 0;
    toSave.trainingLimits = 10;

    let currentTown = towns[0];
    toSave.stats = stats;
    toSave.skills = {};
    for (let i = 0; i < 4; i++) {
        toSave.skills[skillList[i]] = skills[skillList[i]];
    }
    toSave.expWander = currentTown.expWander;
    toSave.expMet = currentTown.expMet;
    toSave.expSecrets = currentTown.expSecrets;
    toSave.totalHeal = currentTown.totalHeal;
    toSave.totalFight = currentTown.totalFight;
    toSave.totalSDungeon = currentTown.totalSDungeon;

    currentTown = towns[1];
    toSave.expForest = currentTown.expForest;
    toSave.expShortcut = currentTown.expShortcut;
    toSave.expHermit = currentTown.expHermit;

    currentTown = towns[2];
    toSave.expCity = currentTown.expCity;
    toSave.expDrunk = currentTown.expDrunk;
    toSave.totalAdvGuild = currentTown.totalAdvGuild;
    toSave.totalCraftGuild = currentTown.totalCraftGuild;
    toSave.totalLDungeon = currentTown.totalLDungeon;
    toSave.version75 = true;
    toSave.expApprentice = currentTown.expApprentice;
    toSave.expMason = currentTown.expMason;
    toSave.expArchitect = currentTown.expArchitect;

    for (const town of towns) {
        for (const action of town.totalActionList) {
            if (town.varNames.indexOf(action.varName) !== -1) {
                const varName = action.varName;
                toSave[`total${varName}`] = town[`total${varName}`];
                toSave[`checked${varName}`] = town[`checked${varName}`];
                toSave[`good${varName}`] = town[`good${varName}`];
                toSave[`goodTemp${varName}`] = town[`good${varName}`];
                if (document.getElementById(`searchToggler${varName}`)) {
                    toSave[`searchToggler${varName}`] = document.getElementById(`searchToggler${varName}`).checked;
                }
            }
        }
    }
    const tempNextList = [];
    for (let i = 0; i < actions.next.length; i++) {
        if (isOldAction(actions.next[i].name)) tempNextList[tempNextList.length] = actions.next[i];
    }
    for (const action of tempNextList) {
        action.disabled = undefined;
    }
    toSave.nextList = tempNextList;
    const tempLoadouts = [[], [], [], [], []];
    for (let i = 0; i < 5; i++) {
        for (let l = 0; l < loadouts[i].length; l++) {
            if (isOldAction(loadouts[i][l].name)) tempLoadouts[i][tempLoadouts[i].length] = loadouts[i][l];
        }
    }
    toSave.loadouts = tempLoadouts;
    toSave.repeatLast = options.repeatLastAction;
    toSave.pingOnPause = options.pingOnPause;
    toSave.storyShowing = storyShowing;
    toSave.storyMax = storyMax;
    toSave.date = new Date();
    toSave.totalOfflineMs = totalOfflineMs;

    document.getElementById("exportImport").value = encode(JSON.stringify(toSave));
    document.getElementById("exportImport").select();
    document.execCommand("copy");
}

// end old save

function exportSave() {
    save();
    // idle loops save version 01. patch v0.94, moved from old save system to lzstring base 64
    document.getElementById("exportImport").value = `ILSV01${LZString.compressToBase64(window.localStorage[saveName])}`;
    document.getElementById("exportImport").select();
    document.execCommand("copy");
}

function importSave() {
    const saveData = document.getElementById("exportImport").value;
    if (saveData === "") {
        if (confirm("Importing nothing will delete your save. Are you sure you want to delete your save?")) {
            clearSave();
        } else {
            return;
        }
    }
    // idle loops save version 01. patch v0.94, moved from old save system to lzstring base 64
    if (saveData.substr(0, 6) === "ILSV01") {
        window.localStorage[saveName] = LZString.decompressFromBase64(saveData.substr(6));
    } else {
        // handling for old saves from stopsign or patches prior to v0.94
        window.localStorage[saveName] = decode(saveData);
    }
    actions.next = [];
    actions.current = [];
    load();
    pauseGame();
    restart();
}

function exportCurrentList() {
    let toReturn = "";
    for (const action of actions.next) {
        toReturn += `${action.loops}x ${action.name}`;
        toReturn += "\n";
    }
    document.getElementById("exportImportList").value = toReturn.slice(0, -1);
    document.getElementById("exportImportList").select();
    document.execCommand("copy");
}

function importCurrentList() {
    const toImport = document.getElementById("exportImportList").value.split("\n");
    actions.next = [];
    for (let i = 0; i < toImport.length; i++) {
        if (!toImport[i]) {
            continue;
        }
        const name = toImport[i].substr(toImport[i].indexOf("x") + 1).trim();
        const loops = toImport[i].substr(0, toImport[i].indexOf("x"));
        const action = translateClassNames(name);
        if (action && action.unlocked()) {
            actions.next.push({ name, loops: Number(loops), disabled: false });
        }
    }
    view.updateNextActions();
}