// Save-file one-time migrations and content-version wipes.
//
// CODE_SAVE_VERSION - stamped onto data.saveVersion for new games and after a successful load.
// data.saveVersion / loadedSaveVersion - what the save blob had (missing/null treated as 0).
//
// When adding a one-time fix for saves still at version N:
//   if (loadedSaveVersion === N) { ...fix... }
// Then bump CODE_SAVE_VERSION to N+1 so the next save stamps past N.
// Prefer saveVersion gates over permanent progress flags for new fixups.

const CODE_SAVE_VERSION = 6;

let saveFix = {
    STAR_TYPES: ["bronze", "silver", "gold"],

    /** Sole post-init entry from onLoad.handleLoad. */
    runAfterInitialize: function(loadedSaveVersion) {
        saveFix.migrateSprinkleOreUpgrade();
        saveFix.migrateBuildWaterWheelUpgradeKey();
        saveFix.migrateMineshaftBeamsWork();
        saveFix.migrateEchoedShelvingUpgrade();
        saveFix.migrateFoxDenJobQueue();
        saveFix.migrateSpareSandalsUpgrade();
        saveFix.migrateShrineOneTimeFields();
        saveFix.migrateDivinityCapacity();
        saveFix.migrateMinePrioritizeOre();
        saveFix.migrateBonfireAutoRetry();
        saveFix.renameSkillKey("fakeTearDrops", "applyTearDrops");
        saveFix.renameSkillKey("stageSob", "stagePresence");
        if (data.battle) {
            if (data.battle.applyTearDropsAccMs === undefined || data.battle.applyTearDropsAccMs === null) {
                data.battle.applyTearDropsAccMs = data.battle.fakeTearDropsSecondAccMs || 0;
            }
            delete data.battle.fakeTearDropsSecondAccMs;
        }
        onLoad.ensureAllSkillStates();
        saveFix.applySaveVersionMigrations(loadedSaveVersion);
        if (loadedSaveVersion === 0) {
            saveFix.applyVersion0Fixes();
        }
        if (loadedSaveVersion < 2) {
            saveFix.migrateGlobalShardsRework();
        }
        if (loadedSaveVersion < 3) {
            saveFix.migrateEquippedStatSkillsOffCounters();
        }
        if (loadedSaveVersion < 4) {
            saveFix.refundRemovedPrestigeCards();
        }
        if (loadedSaveVersion < 5) {
            saveFix.migrateBalancePenalties();
        }
        if (loadedSaveVersion < 6) {
            saveFix.refundAlacrityResearch();
        }
        engine.ensureShardProgress();
        engine.processShardSkillSlotUnlocks();
        engine.ensurePrestigeRunPacks();
        engine.ensureSecondsPlayedTotal();
    },

    /** Alacrity was offered as a Scroll Archives research. Return that point once. */
    refundAlacrityResearch: function() {
        const lib = data.progress.base && data.progress.base.scrollArchives;
        if (!lib || !lib.unlockedSkills || !lib.unlockedSkills.alacrity) {
            return;
        }
        lib.researchesToChoose = (lib.researchesToChoose || 0) + 1;
        const choices = lib.researchChoices || [];
        let choicesValid = choices.length > 0;
        const seenChoice = {};
        for (let ci = 0; ci < choices.length && choicesValid; ci++) {
            const choiceKey = choices[ci];
            if (!engine.isScrollArchivesSkillViable(choiceKey) || seenChoice[choiceKey]) {
                choicesValid = false;
            }
            seenChoice[choiceKey] = true;
        }
        if (!choicesValid) {
            engine.rollScrollArchivesResearchChoices();
        }
        if (typeof events !== "undefined" && events.markNewBaseContent) {
            events.markNewBaseContent("scrollArchives");
        }
    },

    /**
     * Market level exp now scales ×4. Rewrite the next threshold from the current level
     * and clear the old noodle topic price. New penalties start at zero.
     */
    migrateBalancePenalties: function() {
        const base = data.progress && data.progress.base;
        const market = base && base.market;
        if (market) {
            const lvl = Math.max(0, Math.floor(market.level || 0));
            market.expToLevel = 30000 * Math.pow(4, lvl);
            market.demandTaxExtra = 0;
        }
        const bar = base && base.noodleBar;
        if (bar) {
            bar.topicPresses = 0;
        }
        if (data.progress) {
            data.progress.legendPenaltyExtra = 0;
        }
    },

    /**
     * Pool per-skill shards into global currency, fix default Any slot, apply slot unlocks,
     * and drop obsolete Scroll Archives research-cost fields.
     */
    migrateGlobalShardsRework: function() {
        engine.ensureShardProgress();
        skills.ensureSkillEquip();
        const eq = data.progress.skillEquip;
        if (eq && eq.slots) {
            if (!Array.isArray(eq.slots.any)) {
                eq.slots.any = [];
            }
            // Remove default empty Any slot(s) from the old 4-slot layout.
            const keptAny = [];
            for (let ai = 0; ai < eq.slots.any.length; ai++) {
                if (eq.slots.any[ai]) {
                    keptAny.push(eq.slots.any[ai]);
                }
            }
            eq.slots.any = keptAny;
            // Typed columns keep at least one slot.
            const typed = ["offense", "defense", "utility"];
            for (let ti = 0; ti < typed.length; ti++) {
                const col = typed[ti];
                if (!Array.isArray(eq.slots[col]) || eq.slots[col].length < 1) {
                    eq.slots[col] = [null];
                }
            }
            // Existing Any slots count as already unlocked (cycle starts at Any).
            data.progress.skillSlotUnlockIndex = Math.max(
                data.progress.skillSlotUnlockIndex || 0,
                eq.slots.any.length
            );
        }

        let pooled = data.progress.shards || 0;
        const sks = data.progress.skills || {};
        const skillKeys = Object.keys(sks);
        for (let i = 0; i < skillKeys.length; i++) {
            const sk = sks[skillKeys[i]];
            if (!sk) {
                continue;
            }
            pooled += sk.shards || 0;
            delete sk.shards;
        }

        const bank = data.currentGameState && data.currentGameState.offlineShardBank;
        if (bank && typeof bank === "object") {
            const bankKeys = Object.keys(bank);
            for (let bi = 0; bi < bankKeys.length; bi++) {
                pooled += bank[bankKeys[bi]] || 0;
            }
            data.currentGameState.offlineShardBank = 0;
        } else if (typeof bank === "number") {
            pooled += bank;
            data.currentGameState.offlineShardBank = 0;
        }

        data.progress.shards = pooled;
        engine.syncNextSkillSlotShardCost();
        engine.processShardSkillSlotUnlocks();

        if (data.progress.skillListSort === "shards") {
            data.progress.skillListSort = "oldest";
        }

        const lib = data.progress.base && data.progress.base.scrollArchives;
        if (lib) {
            delete lib.researchCoinCosts;
            delete lib.researchTaskRequired;
            delete lib.researchTaskProgress;
            delete lib.freeResearchCostCredit;
        }
    },

    /**
     * Adaptation and Savage Lessons now grant their tooltip bonus while equipped.
     * skillConBonus was only Adaptation's old +1 per level-up. skillStrBonus still
     * holds Adrenaline's +1 per level-up, so subtract Savage Lessons' old share.
     */
    migrateEquippedStatSkillsOffCounters: function() {
        const ls = data.battle && data.battle.levelState;
        if (!ls) {
            return;
        }
        ls.skillConBonus = 0;
        const savage = data.progress.skills && data.progress.skills.savageLessons;
        const savageLevels = savage ? (savage.level || 0) : 0;
        ls.skillStrBonus = Math.max(0, (ls.skillStrBonus || 0) - savageLevels);
    },

    /** One-time fixes for saves that still have saveVersion 0. */
    applyVersion0Fixes: function() {
        const sks = data.progress.skills || {};
        const skillKeys = Object.keys(sks);
        for (let i = 0; i < skillKeys.length; i++) {
            skills.returnSkillStarsToPool(sks[skillKeys[i]]);
        }

        saveFix.migrateInnHotWaterCapacity();
        saveFix.migrateAllGuestItinerarySteps();
        saveFix.migrateInnManaCapacityFormula();
        saveFix.migrateToriiKarmaCheckPowerRequired();
        saveFix.migrateStonePileUsedStone();
        saveFix.migrateCarrierStoneTakenUsed();
        saveFix.roundUpgradeGatherStoneOnce();
        saveFix.migrateShrineKarmaMechanic();
    },

    removeOneStarFromEconomy: function(starType) {
        const pool = data.progress.stars;
        if ((pool[starType] || 0) > 0) {
            pool[starType]--;
            return;
        }
        const sks = data.progress.skills || {};
        const keys = Object.keys(sks);
        for (let i = 0; i < keys.length; i++) {
            const sk = sks[keys[i]];
            if (sk && sk.stars && sk.stars[starType]) {
                sk.stars[starType] = false;
                return;
            }
        }
    },

    collectMapShardSkillKeys: function(mapDef) {
        const out = {};
        const zoneShards = mapDef.zoneShards || [];
        for (let i = 0; i < zoneShards.length; i++) {
            const sh = zoneShards[i];
            if (sh && sh.key) {
                out[sh.key] = true;
            }
        }
        const zones = mapDef.zones || [];
        for (let zi = 0; zi < zones.length; zi++) {
            const sh = zones[zi].skillShard;
            if (sh && sh.key) {
                out[sh.key] = true;
            }
        }
        return out;
    },

    wipeMapProgressForVersion: function(mapDef) {
        const mapKey = mapDef.key;
        const workers = (data.progress.mapWorkersFound && data.progress.mapWorkersFound[mapKey]) || 0;
        const stars = (data.progress.mapStars && data.progress.mapStars[mapKey]) || {};

        if (data.progress.mapStars) {
            delete data.progress.mapStars[mapKey];
        }
        if (data.progress.mapWorkersFound) {
            delete data.progress.mapWorkersFound[mapKey];
        }

        if (!data.progress.kitsune) {
            data.progress.kitsune = { total: 2 };
        }
        data.progress.kitsune.total = Math.max(0, (data.progress.kitsune.total || 0) - workers);

        for (let i = 0; i < saveFix.STAR_TYPES.length; i++) {
            const t = saveFix.STAR_TYPES[i];
            if (stars[t]) {
                saveFix.removeOneStarFromEconomy(t);
            }
        }

    },

    wipeSkillProgressForVersion: function(skillKey) {
        const sk = data.progress.skills[skillKey];
        skills.returnSkillStarsToPool(sk);
        data.progress.skills[skillKey] = skills.createFreshSkillState(skillKey);
    },

    renameSkillKey: function(oldKey, newKey) {
        if (!oldKey || !newKey || oldKey === newKey) {
            return;
        }
        const sks = data.progress.skills || {};
        if (sks[oldKey]) {
            if (!sks[newKey]) {
                sks[newKey] = sks[oldKey];
                sks[newKey].key = newKey;
                const def = skills._byKey[newKey];
                if (def && def.name) {
                    sks[newKey].name = def.name;
                }
            }
            delete sks[oldKey];
        }
        const lib = data.progress.base && data.progress.base.scrollArchives;
        if (lib && lib.unlockedSkills) {
            if (lib.unlockedSkills[oldKey]) {
                lib.unlockedSkills[newKey] = true;
            }
            delete lib.unlockedSkills[oldKey];
        }
        if (lib && lib.researchChoices) {
            for (let i = 0; i < lib.researchChoices.length; i++) {
                if (lib.researchChoices[i] === oldKey) {
                    lib.researchChoices[i] = newKey;
                }
            }
        }
        if (lib && lib.selectedResearchChoice === oldKey) {
            lib.selectedResearchChoice = newKey;
        }
        if (data.progress.selectedEquippedSkillKey === oldKey) {
            data.progress.selectedEquippedSkillKey = newKey;
        }
        if (data.progress.selectedLibrarySkillKey === oldKey) {
            data.progress.selectedLibrarySkillKey = newKey;
        }
        if (data.progress.selectedSkillDetailKey === oldKey) {
            data.progress.selectedSkillDetailKey = newKey;
        }
        if (data.battle && data.battle.runSkillTalentStart && data.battle.runSkillTalentStart[oldKey] !== undefined) {
            if (data.battle.runSkillTalentStart[newKey] === undefined) {
                data.battle.runSkillTalentStart[newKey] = data.battle.runSkillTalentStart[oldKey];
            }
            delete data.battle.runSkillTalentStart[oldKey];
        }
        const eq = data.progress.skillEquip;
        if (eq && eq.slots) {
            const cols = Object.keys(eq.slots);
            for (let c = 0; c < cols.length; c++) {
                const arr = eq.slots[cols[c]];
                if (!Array.isArray(arr)) {
                    continue;
                }
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i] === oldKey) {
                        arr[i] = newKey;
                    }
                }
            }
        }
        const loadouts = data.progress.skillLoadouts;
        if (Array.isArray(loadouts)) {
            for (let li = 0; li < loadouts.length; li++) {
                const entry = loadouts[li];
                if (!entry || !entry.slots) {
                    continue;
                }
                const lcols = Object.keys(entry.slots);
                for (let c = 0; c < lcols.length; c++) {
                    const arr = entry.slots[lcols[c]];
                    if (!Array.isArray(arr)) {
                        continue;
                    }
                    for (let i = 0; i < arr.length; i++) {
                        const cell = arr[i];
                        if (cell && cell.key === oldKey) {
                            cell.key = newKey;
                        } else if (cell === oldKey) {
                            arr[i] = newKey;
                        }
                    }
                }
            }
        }
        const bar = data.progress.base && data.progress.base.noodleBar;
        if (bar) {
            if (Array.isArray(bar.offeredSkillKeys)) {
                for (let i = 0; i < bar.offeredSkillKeys.length; i++) {
                    if (bar.offeredSkillKeys[i] === oldKey) {
                        bar.offeredSkillKeys[i] = newKey;
                    }
                }
            }
            if (bar.selectedTipSkillKey === oldKey) {
                bar.selectedTipSkillKey = newKey;
            }
        }
    },

    applySaveVersionMigrations: function(loadedSaveVersion) {
        data.progress.mapDefinitions = mapData.getDefaultMaps();
        const maps = data.progress.mapDefinitions;
        for (let mi = 0; mi < maps.length; mi++) {
            const map = maps[mi];
            const mapVer = map.version !== undefined ? map.version : 0;
            if (loadedSaveVersion < mapVer) {
                saveFix.wipeMapProgressForVersion(map);
            }
        }

        const lib = data.progress.base.scrollArchives;
        let wipedUnlockedCount = 0;
        for (let si = 0; si < skills.keysInOrder.length; si++) {
            const skillKey = skills.keysInOrder[si];
            const def = skills._byKey[skillKey];
            const skillVer = def && def.version !== undefined ? def.version : 0;
            if (loadedSaveVersion >= skillVer) {
                continue;
            }
            const wasUnlocked = !!(lib.unlockedSkills && lib.unlockedSkills[skillKey]);
            saveFix.wipeSkillProgressForVersion(skillKey);
            if (wasUnlocked) {
                delete lib.unlockedSkills[skillKey];
                wipedUnlockedCount++;
            }
        }

        if (wipedUnlockedCount > 0) {
            lib.researchesToChoose = (lib.researchesToChoose || 0) + wipedUnlockedCount;
            lib.researchChoices = [];
            lib.selectedResearchChoice = "";
        }

        if ((lib.researchesToChoose || 0) > 0 && (!lib.researchChoices || !lib.researchChoices.length)) {
            engine.rollScrollArchivesResearchChoices();
        }
        saveFix.syncKitsuneTotalFromRescues();
        saveFix.migrateMissingWaterSpirits();
    },

    /** Restore water spirits when purchase/wishing-well counters are ahead of the spirits array. */
    migrateMissingWaterSpirits: function() {
        const hs = data.progress.base.hiddenSpring;
        const cistern = data.progress.base.cistern;
        const expected = (hs.waterSpiritsBought || 0) + (cistern.wishingWellBought || 0);
        let actual = 0;
        for (let i = 0; i < hs.spirits.length; i++) {
            if (hs.spirits[i].kind === "water") {
                actual++;
            }
        }
        while (actual < expected) {
            if (!engine.assembleWaterSpiritFromWishingWell()) {
                break;
            }
            actual++;
        }
    },

    /**
     * spiritTrainingSpotAvailable and startingCoins no longer exist.
     * Saves that owned them get one pack of that card's rarity, once.
     */
    refundRemovedPrestigeCards: function() {
        const shrine = data.progress.base && data.progress.base.shrine;
        if (!shrine || !shrine.cards) {
            return;
        }
        const cards = shrine.cards;
        const training = cards.spiritTrainingSpotAvailable;
        if (training && (training.epic || 0) > 0 && typeof engine !== "undefined" && engine.grantShrinePack) {
            engine.grantShrinePack("epic", "carried");
        }
        delete cards.spiritTrainingSpotAvailable;

        const coins = cards.startingCoins;
        if (coins && typeof engine !== "undefined" && engine.grantShrinePack) {
            if ((coins.rare || 0) > 0) {
                engine.grantShrinePack("rare", "carried");
            }
            if ((coins.epic || 0) > 0) {
                engine.grantShrinePack("epic", "carried");
            }
        }
        delete cards.startingCoins;
    },

    /** Rescues used to update the map counter without adding workers. Raise the pool to match. */
    syncKitsuneTotalFromRescues: function() {
        if (!data.progress.kitsune) {
            data.progress.kitsune = { total: 2 };
        }
        const found = data.progress.mapWorkersFound || {};
        const foundKeys = Object.keys(found);
        let rescued = 0;
        for (let i = 0; i < foundKeys.length; i++) {
            rescued += found[foundKeys[i]] || 0;
        }
        const torii = data.progress.base && data.progress.base.torii;
        const calls = (torii && torii.callForAllyBought) || 0;
        const expected = 2 + calls + rescued;
        if ((data.progress.kitsune.total || 0) < expected) {
            data.progress.kitsune.total = expected;
        }
    },

    migrateInnHotWaterCapacity: function() {
        const inn = data.progress.base && data.progress.base.inn;
        if (inn && (inn.hotWaterCapacity || 0) === 200) {
            inn.hotWaterCapacity = 500;
        }
    },

    migrateGuestItineraryStep: function(guest) {
        if (!guest) {
            return;
        }
        if (guest.itineraryStep) {
            if (guest.state !== undefined) {
                delete guest.state;
            }
            return;
        }
        if (guest.state) {
            const legacy = guest.state;
            if (legacy === "settling in") {
                guest.itineraryStep = "settleIn";
            } else if (legacy === "watch water spirits play") {
                guest.itineraryStep = "watchWaterSpirits";
            } else if (legacy === "resting") {
                guest.itineraryStep = "rest";
            } else {
                guest.itineraryStep = "settleIn";
            }
            delete guest.state;
            return;
        }
        if (guest.room !== undefined && guest.room !== null) {
            guest.itineraryStep = "settleIn";
        }
    },

    migrateAllGuestItinerarySteps: function() {
        const inn = data.progress.base && data.progress.base.inn;
        if (!inn || !inn.guests) {
            return;
        }
        for (let gi = 0; gi < inn.guests.length; gi++) {
            saveFix.migrateGuestItineraryStep(inn.guests[gi]);
        }
    },

    migrateInnManaCapacityFormula: function() {
        const base = data.progress.base;
        const inn = base && base.inn;
        if (!inn) {
            return;
        }
        const bought = (base.mage_tower && base.mage_tower.increaseInnManaCapacityBought) || 0;
        const oldFormula = 100 + bought * 50;
        if ((inn.manaCapacity || 0) === oldFormula) {
            inn.manaCapacity = 1000 + bought * 500;
        }
    },

    migrateToriiKarmaCheckPowerRequired: function() {
        const torii = data.progress.base && data.progress.base.torii;
        if (!torii || torii.karmaCheckPowerRequired === undefined) {
            return;
        }
        // Prefer legacy field even if initialize already filled the default.
        torii.visitorDrawPowerRequired = torii.karmaCheckPowerRequired;
        delete torii.karmaCheckPowerRequired;
    },

    migrateStonePileUsedStone: function() {
        const pile = data.progress.base && data.progress.base.stonePile;
        if (!pile) {
            return;
        }
        const legacyUsed = pile.usedStone || 0;
        if (pile.dupedStone === undefined) {
            pile.dupedStone = 0;
        }
        if (legacyUsed !== 0 || pile.usedStone !== undefined) {
            pile.dupedStone = Math.floor((pile.dupedStone || 0) + legacyUsed);
            delete pile.usedStone;
        }
    },

    migrateCarrierStoneTakenUsed: function() {
        const migrateStoneTaken = function(carriers) {
            if (!carriers) {
                return;
            }
            for (let i = 0; i < carriers.length; i++) {
                const st = carriers[i].stoneTaken;
                if (!st || st.used === undefined) {
                    continue;
                }
                st.duped = (st.duped || 0) + (st.used || 0);
                delete st.used;
            }
        };
        const base = data.progress.base;
        if (!base) {
            return;
        }
        if (base.foxDen) {
            migrateStoneTaken(base.foxDen.constructionCarriers);
        }
        if (base.market) {
            migrateStoneTaken(base.market.creditCarriers);
        }
    },

    /** Round fractional stone already on upgrade gather jobs / inbound carriers. */
    roundUpgradeGatherStoneOnce: function() {
        const rh = data.progress.base && data.progress.base.foxDen;
        if (!rh) {
            return;
        }
        const jobs = rh.upgradeGatherJobs || {};
        const jobKeys = Object.keys(jobs);
        for (let i = 0; i < jobKeys.length; i++) {
            const jobKey = jobKeys[i];
            const job = jobs[jobKey];
            if (!job) {
                continue;
            }
            if (job.required && job.required.stone) {
                job.required.stone = Math.round(job.required.stone);
            }
            if (job.delivered && job.delivered.stone) {
                job.delivered.stone = Math.round(job.delivered.stone);
            }
            if (typeof engine !== "undefined" && engine.checkUpgradeGatherJobComplete) {
                engine.checkUpgradeGatherJobComplete(jobKey);
            }
        }
        const carriers = rh.constructionCarriers || [];
        for (let ci = 0; ci < carriers.length; ci++) {
            const c = carriers[ci];
            if (!c || c.resourceType !== "stone") {
                continue;
            }
            const jobKey = c.jobKey || "";
            if (jobKey.indexOf("upgrade:") !== 0) {
                continue;
            }
            if (c.stoneTaken) {
                const d = Math.round(c.stoneTaken.duped || 0);
                const u = Math.round(c.stoneTaken.used || 0);
                const r = Math.round(c.stoneTaken.raw || 0);
                c.stoneTaken.duped = d + u;
                c.stoneTaken.raw = r;
                delete c.stoneTaken.used;
                c.amount = d + u + r;
            } else {
                c.amount = Math.round(c.amount || 0);
            }
        }
    },

    migrateShrineKarmaMechanic: function() {
        const shrine = data.progress.base && data.progress.base.shrine;
        if (!shrine || shrine.karmaMechanicMigrated) {
            return;
        }
        shrine.level = 0;
        shrine.exp = 0;
        shrine.expToLevel = 10000;
        shrine.selectedClassKey = "none";
        shrine.karmaMechanicMigrated = true;
    },

    /** Sprinkle Ore moved from the Atelier to the Bamboo Forest. */
    migrateSprinkleOreUpgrade: function() {
        saveFix.migrateSprinkleOreCount();
        const base = data.progress && data.progress.base;
        const rh = base && base.foxDen;
        const oldJob = "upgrade:atelier:sprinkleOre";
        const newJob = "upgrade:bambooForest:sprinkleOre";
        if (rh && rh.upgradeGatherJobs && rh.upgradeGatherJobs[oldJob]) {
            const job = rh.upgradeGatherJobs[oldJob];
            job.scopeKey = "bambooForest";
            if (!rh.upgradeGatherJobs[newJob]) {
                rh.upgradeGatherJobs[newJob] = job;
            }
            delete rh.upgradeGatherJobs[oldJob];
        }
        if (rh && rh.jobQueue) {
            for (let qi = 0; qi < rh.jobQueue.length; qi++) {
                if (rh.jobQueue[qi] === oldJob) {
                    rh.jobQueue[qi] = newJob;
                }
            }
        }
        const carriers = rh && rh.constructionCarriers;
        if (carriers) {
            for (let ci = 0; ci < carriers.length; ci++) {
                if (carriers[ci] && carriers[ci].jobKey === oldJob) {
                    carriers[ci].jobKey = newJob;
                    if (carriers[ci].unlockKey === "atelier") {
                        carriers[ci].unlockKey = "bambooForest";
                    }
                }
            }
        }
        const weaving = data.progress && data.progress.weaving;
        if (!weaving) {
            return;
        }
        if (weaving.active && weaving.active.scopeKey === "atelier" && weaving.active.upgradeKey === "sprinkleOre") {
            weaving.active.scopeKey = "bambooForest";
            weaving.active.buildingName = "Bamboo Forest";
        }
        const paused = weaving.paused;
        if (paused && paused.scopeKey === "atelier" && paused.upgradeKey === "sprinkleOre") {
            paused.scopeKey = "bambooForest";
            paused.buildingName = "Bamboo Forest";
        } else if (paused && paused["atelier:sprinkleOre"]) {
            const entry = paused["atelier:sprinkleOre"];
            entry.scopeKey = "bambooForest";
            entry.buildingName = "Bamboo Forest";
            if (!paused["bambooForest:sprinkleOre"]) {
                paused["bambooForest:sprinkleOre"] = entry;
            }
            delete paused["atelier:sprinkleOre"];
        }
        const notify = base && base.baseContentNotify;
        if (notify && notify.upgradeSeen && notify.upgradeSeen["atelier:sprinkleOre"]) {
            notify.upgradeSeen["bambooForest:sprinkleOre"] = true;
            delete notify.upgradeSeen["atelier:sprinkleOre"];
        }
    },

    /** Build Water Wheel used to be stored as Unlock Drophammer. */
    migrateBuildWaterWheelUpgradeKey: function() {
        const progress = data.progress;
        if (!progress) {
            return;
        }
        const oldKeys = ["unlockDrophammer", "unlock_drophammer"];
        const newKey = "buildWaterWheelAndDrophammer";
        const weaving = progress.weaving;
        if (weaving) {
            if (weaving.active && weaving.active.scopeKey === "atelier" && oldKeys.indexOf(weaving.active.upgradeKey) >= 0) {
                weaving.active.upgradeKey = newKey;
            }
            const paused = weaving.paused;
            if (paused && typeof paused === "object" && !Array.isArray(paused)) {
                for (let oi = 0; oi < oldKeys.length; oi++) {
                    const oldPause = "atelier:" + oldKeys[oi];
                    if (!paused[oldPause]) {
                        continue;
                    }
                    paused[oldPause].upgradeKey = newKey;
                    const newPause = "atelier:" + newKey;
                    if (!paused[newPause]) {
                        paused[newPause] = paused[oldPause];
                    }
                    delete paused[oldPause];
                }
            }
        }
        const rh = progress.base && progress.base.foxDen;
        if (!rh) {
            return;
        }
        for (let ji = 0; ji < oldKeys.length; ji++) {
            const oldJob = "upgrade:atelier:" + oldKeys[ji];
            const newJob = "upgrade:atelier:" + newKey;
            if (rh.upgradeGatherJobs && rh.upgradeGatherJobs[oldJob]) {
                const job = rh.upgradeGatherJobs[oldJob];
                job.upgradeKey = newKey;
                if (!rh.upgradeGatherJobs[newJob]) {
                    rh.upgradeGatherJobs[newJob] = job;
                }
                delete rh.upgradeGatherJobs[oldJob];
            }
            if (rh.jobQueue) {
                for (let qi = 0; qi < rh.jobQueue.length; qi++) {
                    if (rh.jobQueue[qi] === oldJob) {
                        rh.jobQueue[qi] = newJob;
                    }
                }
            }
            const carriers = rh.constructionCarriers || [];
            for (let ci = 0; ci < carriers.length; ci++) {
                if (carriers[ci].jobKey === oldJob) {
                    carriers[ci].jobKey = newJob;
                }
            }
        }
    },

    /** Mineshaft Beams moved from the Atelier to the Mine. */
    migrateMineshaftBeamsWork: function() {
        const base = data.progress && data.progress.base;
        const mine = base && base.mine;
        const atelierBeams = base && base.atelier && base.atelier.mineshaftBeamsBought;
        if (mine && (mine.mineshaftBeamsBought || 0) === 0 && atelierBeams > 0) {
            mine.mineshaftBeamsBought = atelierBeams;
        }
        const rh = base && base.foxDen;
        const oldJobKey = "upgrade:atelier:mineshaftBeams";
        const newJobKey = "upgrade:mine:mineshaftBeams";
        if (rh && rh.upgradeGatherJobs && rh.upgradeGatherJobs[oldJobKey]) {
            const job = rh.upgradeGatherJobs[oldJobKey];
            job.scopeKey = "mine";
            if (!rh.upgradeGatherJobs[newJobKey]) {
                rh.upgradeGatherJobs[newJobKey] = job;
            }
            delete rh.upgradeGatherJobs[oldJobKey];
            if (rh.jobQueue) {
                for (let qi = 0; qi < rh.jobQueue.length; qi++) {
                    if (rh.jobQueue[qi] === oldJobKey) {
                        rh.jobQueue[qi] = newJobKey;
                    }
                }
            }
            if (rh.constructionCarriers && typeof engine.cancelCarriersForJob === "function") {
                engine.cancelCarriersForJob(oldJobKey);
            }
        }
        if (typeof engine.getWeavingState !== "function") {
            return;
        }
        const weaving = engine.getWeavingState();
        const retarget = function(entry) {
            if (!entry || entry.scopeKey !== "atelier" || entry.upgradeKey !== "mineshaftBeams") {
                return;
            }
            entry.scopeKey = "mine";
            entry.buildingName = resortData.getScopeDisplayName("mine");
        };
        retarget(weaving.active);
        if (weaving.paused && weaving.paused["atelier:mineshaftBeams"]) {
            const paused = weaving.paused["atelier:mineshaftBeams"];
            retarget(paused);
            weaving.paused["mine:mineshaftBeams"] = paused;
            delete weaving.paused["atelier:mineshaftBeams"];
        }
    },

    /** Sprinkle Ore's purchase count moved from the Atelier to the Bamboo Forest. */
    migrateSprinkleOreCount: function() {
        const base = data.progress && data.progress.base;
        const forest = base && base.bambooForest;
        const atelier = base && base.atelier;
        const moved = atelier && atelier.sprinkleOreBought;
        if (forest && (forest.sprinkleOreBought || 0) === 0 && moved > 0) {
            forest.sprinkleOreBought = moved;
        }
        if (atelier && atelier.sprinkleOreBought !== undefined) {
            delete atelier.sprinkleOreBought;
        }
    },

    /** Echoed Shelving moved from the Bamboo Forest to the Stone Pile. */
    migrateEchoedShelvingUpgrade: function() {
        const base = data.progress && data.progress.base;
        if (!base) {
            return;
        }
        const pile = base.stonePile;
        const forest = base.bambooForest;
        const moved = forest && forest.echoedShelvingBought;
        if (pile && (pile.echoedShelvingBought || 0) === 0 && moved > 0) {
            pile.echoedShelvingBought = moved;
        }
        if (forest && forest.echoedShelvingBought !== undefined) {
            delete forest.echoedShelvingBought;
        }
        const oldJob = "upgrade:bambooForest:echoedShelving";
        const newJob = "upgrade:stonePile:echoedShelving";
        const fox = base.foxDen;
        if (fox && fox.upgradeGatherJobs && fox.upgradeGatherJobs[oldJob]) {
            const job = fox.upgradeGatherJobs[oldJob];
            job.scopeKey = "stonePile";
            fox.upgradeGatherJobs[newJob] = job;
            delete fox.upgradeGatherJobs[oldJob];
        }
        if (fox && fox.jobQueue) {
            for (let qi = 0; qi < fox.jobQueue.length; qi++) {
                if (fox.jobQueue[qi] === oldJob) {
                    fox.jobQueue[qi] = newJob;
                }
            }
        }
        const carriers = fox && fox.constructionCarriers;
        if (carriers) {
            for (let ci = 0; ci < carriers.length; ci++) {
                if (carriers[ci] && carriers[ci].jobKey === oldJob) {
                    carriers[ci].jobKey = newJob;
                }
            }
        }
        const weaving = data.progress.weaving;
        if (!weaving) {
            return;
        }
        if (weaving.active && weaving.active.scopeKey === "bambooForest" && weaving.active.upgradeKey === "echoedShelving") {
            weaving.active.scopeKey = "stonePile";
            weaving.active.buildingName = "Stone Pile";
        }
        const paused = weaving.paused;
        if (paused && paused.scopeKey === "bambooForest" && paused.upgradeKey === "echoedShelving") {
            paused.scopeKey = "stonePile";
            paused.buildingName = "Stone Pile";
        } else if (paused && paused["bambooForest:echoedShelving"]) {
            const entry = paused["bambooForest:echoedShelving"];
            entry.scopeKey = "stonePile";
            entry.buildingName = "Stone Pile";
            paused["stonePile:echoedShelving"] = entry;
            delete paused["bambooForest:echoedShelving"];
        }
    },

    /** Old Fox Den queues became one jobQueue, and carriers gained a jobKey. */
    migrateFoxDenJobQueue: function() {
        const rh = data.progress.base && data.progress.base.foxDen;
        if (!rh) {
            return;
        }
        if (!rh.jobQueue) {
            rh.jobQueue = (rh.foxDenJobOrder && rh.foxDenJobOrder.slice()) || [];
        } else if (!rh.jobQueue.length && rh.foxDenJobOrder && rh.foxDenJobOrder.length) {
            rh.jobQueue = rh.foxDenJobOrder.slice();
        }
        if (!rh.jobQueue.length) {
            const oldConstruction = rh.constructionQueue || [];
            for (let cqi = 0; cqi < oldConstruction.length; cqi++) {
                const cKey = oldConstruction[cqi];
                const site = rh.constructionSites && rh.constructionSites[cKey];
                if (site && site.status === "building") {
                    rh.jobQueue.push(engine.getBuildingJobKey(cKey));
                }
            }
            const oldUpgrade = rh.upgradeGatherQueue || [];
            for (let uqi = 0; uqi < oldUpgrade.length; uqi++) {
                const uKey = oldUpgrade[uqi];
                const uJob = rh.upgradeGatherJobs && rh.upgradeGatherJobs[uKey];
                if (uJob && uJob.status === "gathering") {
                    rh.jobQueue.push(uKey);
                }
            }
        }
        delete rh.constructionQueue;
        delete rh.upgradeGatherQueue;
        delete rh.foxDenJobOrder;
        const carriers = rh.constructionCarriers || [];
        for (let ci = 0; ci < carriers.length; ci++) {
            const c = carriers[ci];
            if (c && !c.jobKey && c.unlockKey) {
                c.jobKey = engine.getBuildingJobKey(c.unlockKey);
            }
        }
    },

    /** Spare Sandals moved from the Atelier to the Shrine. */
    migrateSpareSandalsUpgrade: function() {
        const weaving = data.progress && data.progress.weaving;
        if (weaving && weaving.active && weaving.active.scopeKey === "atelier" && weaving.active.upgradeKey === "spareSandals") {
            weaving.active.scopeKey = "shrine";
        }
        const rh = data.progress.base && data.progress.base.foxDen;
        const jobs = rh && rh.upgradeGatherJobs;
        if (!jobs) {
            return;
        }
        const oldKey = "upgrade:atelier:spareSandals";
        const newKey = "upgrade:shrine:spareSandals";
        if (jobs[oldKey] && !jobs[newKey]) {
            jobs[newKey] = jobs[oldKey];
            jobs[newKey].scopeKey = "shrine";
            jobs[newKey].upgradeKey = "spareSandals";
            delete jobs[oldKey];
        } else if (jobs[oldKey]) {
            delete jobs[oldKey];
        }
    },

    /** Drop removed Shrine fields and grant Prepare to Write a Legend to saves that already wrote one. */
    migrateShrineOneTimeFields: function() {
        const shrine = data.progress.base && data.progress.base.shrine;
        if (shrine && shrine.allowClasslessWithoutDivinity !== undefined) {
            delete shrine.allowClasslessWithoutDivinity;
        }
        if (shrine && !shrine.prepareToWriteLegendBought && engine.getLegendsWritten() >= 1) {
            shrine.prepareToWriteLegendBought = true;
        }
        const lib = data.progress.base && data.progress.base.scrollArchives;
        if (!lib) {
            return;
        }
        delete lib.researchTaskRequired;
        delete lib.researchTaskProgress;
        delete lib.researchCoinCosts;
        delete lib.freeResearchCostCredit;
    },

    /** Divinity capacity was 10000, then every existing cap dropped by 50000 once. */
    migrateDivinityCapacity: function() {
        const progress = data.progress;
        if (!progress || !progress.divinity) {
            return;
        }
        if (progress.divinity.capacity === 10000) {
            progress.divinity.capacity = 100000;
        }
        if (!progress.divinityCapReduced50k) {
            progress.divinity.capacity = Math.max(0, (progress.divinity.capacity || 0) - 50000);
            progress.divinityCapReduced50k = true;
        }
        if ((progress.divinity.amount || 0) > progress.divinity.capacity) {
            progress.divinity.amount = progress.divinity.capacity;
        }
    },

    /** The mine-wide Prioritize Ore toggle became each earth spirit's resource priority. */
    migrateMinePrioritizeOre: function() {
        const base = data.progress && data.progress.base;
        const mine = base && base.mine;
        if (!mine || !mine.prioritizeOre || !base.hiddenSpring || !base.hiddenSpring.spirits) {
            return;
        }
        const spirits = base.hiddenSpring.spirits;
        for (let spi = 0; spi < spirits.length; spi++) {
            const sp = spirits[spi];
            if (sp.kind === "earth" && (sp.location || "hiddenSpring") === "hiddenSpring") {
                sp.prioritizeOre = true;
                sp.resourcePriority = "ore";
            }
        }
        mine.prioritizeOre = false;
    },

    /** Auto-retry existed before its unlock. Saves that already had it on keep it. */
    migrateBonfireAutoRetry: function() {
        const bonfire = data.progress.base && data.progress.base.bonfire;
        if (bonfire && bonfire.autoRetryEnabled && !bonfire.autoRetryUnlocked) {
            bonfire.autoRetryUnlocked = true;
        }
    }
};
