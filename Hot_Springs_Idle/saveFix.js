// Save-file one-time migrations and content-version wipes.
//
// CODE_SAVE_VERSION - stamped onto data.saveVersion for new games and after a successful load.
// data.saveVersion / loadedSaveVersion - what the save blob had (missing/null treated as 0).
//
// When adding a one-time fix for saves still at version N:
//   if (loadedSaveVersion === N) { ...fix... }
// Then bump CODE_SAVE_VERSION to N+1 so the next save stamps past N.
// Prefer saveVersion gates over permanent progress flags for new fixups.

const CODE_SAVE_VERSION = 3;

let saveFix = {
    STAR_TYPES: ["bronze", "silver", "gold"],

    /** Sole post-init entry from onLoad.handleLoad. */
    runAfterInitialize: function(loadedSaveVersion) {
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
        engine.ensureShardProgress();
        engine.processShardSkillSlotUnlocks();
    },

    /**
     * Pool per-skill shards into global currency, fix default Any slot, apply slot unlocks,
     * and recompute Scroll Archives research cost under the new formula.
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
            engine.syncScrollArchivesResearchCost(lib);
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

    applyResearchTaskRequired: function(lib) {
        if (!lib) {
            return;
        }
        const curveLen = Array.isArray(lib.researchCoinCosts) ? lib.researchCoinCosts.length : 0;
        const prev = lib.researchTaskRequired || 0;
        const progress = lib.researchTaskProgress || 0;
        engine.syncScrollArchivesResearchCost(lib);
        const next = lib.researchTaskRequired || 0;
        if (curveLen <= 1 && prev > 0 && next > 0 && progress > 0 && prev !== next) {
            lib.researchTaskProgress = progress * (next / prev);
        }
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
        saveFix.applyResearchTaskRequired(lib);

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
    }
};
