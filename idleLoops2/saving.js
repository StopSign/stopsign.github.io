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
const saveName = "idleLoops2";

// this is to hide the cheat button if you aren't supposed to cheat
if (window.location.href.includes("localhost")) document.getElementById("cheat").style.display = "inline-block";

const timeNeededInitial = 500;
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

const statList = ["Con", "Per", "Will", "Ele", "Lead", "Soul"];
const stats = {};
let totalTalent = 0;
// eslint-disable-next-line prefer-const
let shouldRestart = true;

// eslint-disable-next-line prefer-const
let resources = {
    gold: 0,
    reputation: 0,
    //glasses: false,
};
const resourcesTemplate = copyObject(resources);

let curLoadout = 0;
let loadouts = [];
let loadoutnames = ["1", "2", "3", "4", "5"];
const skillList = ["ManaSense", "ManaControl"]; //["Mana Sense", "Mana Control", "Weapons", "Crafting", "AoE Magic"];
const skills = {};
const buffList = [];
const buffHardCaps = {
    //Ritual: 666,
};
const buffCaps = {
    //Ritual: 666,
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
let trainingLimits;
let storyShowing = 0;
let storyMax = 0;
const storyReqs = {
    //strengthTrained: false,
};

let totalOfflineMs = 0;
// eslint-disable-next-line prefer-const
let bonusSpeed = 1;
const offlineRatio = 1;

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

    townsUnlocked = toLoad.townsUnlocked === undefined ? [0] : toLoad.townsUnlocked;

    for (let i = 0; i < 6; i++) {
        towns[i] = new Town(i);
    }
    trainingLimits = toLoad.trainingLimits === undefined ? 10 : toLoad.trainingLimits;

    actions.next = [];
    if (toLoad.nextList) {
        for (const action of toLoad.nextList) {
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