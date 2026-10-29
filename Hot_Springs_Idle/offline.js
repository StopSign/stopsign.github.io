/** Offline catch-up: process pendingOfflineMs without live UI. */
const OFFLINE_CAP_MS = 24 * 60 * 60 * 1000;
const OFFLINE_HOUR_MS = 60 * 60 * 1000;
const OFFLINE_MIN_PROCESS_MS = 60 * 1000;
const OFFLINE_TICK_BUDGET_MS = 12;
const BONUS_TIME_CAP_MS = 6 * 60 * 60 * 1000;
/** In-memory wall gap at/above this uses offline rules instead of live tick catch-up. */
const LIVE_OFFLINE_GAP_MS = 3 * 60 * 1000;

let offline = {
    totalToProcessMs: 0,
    processedMs: 0,
    wallStartMs: 0,
    gains: null,
    shardBank: null,
    pendingBonusGainMsgMs: 0,
    _bonusGainToastTimer: null,

    ensureState: function() {
        if (!data.currentGameState) {
            return;
        }
        if (data.currentGameState.pendingOfflineMs === undefined || data.currentGameState.pendingOfflineMs === null) {
            data.currentGameState.pendingOfflineMs = 0;
        }
        if (data.currentGameState.offlineShardBank === undefined || data.currentGameState.offlineShardBank === null
            || typeof data.currentGameState.offlineShardBank === "object") {
            // Migrate legacy per-skill bank object → numeric global bank (summed in saveFix).
            data.currentGameState.offlineShardBank = typeof data.currentGameState.offlineShardBank === "number"
                ? data.currentGameState.offlineShardBank
                : 0;
        }
        if (data.currentGameState.bonusTime === undefined || data.currentGameState.bonusTime === null) {
            data.currentGameState.bonusTime = 0;
        }
    },

    addPendingOfflineMs: function(ms) {
        offline.ensureState();
        if (!ms || ms <= 0) {
            return;
        }
        const cur = data.currentGameState.pendingOfflineMs || 0;
        data.currentGameState.pendingOfflineMs = Math.min(OFFLINE_CAP_MS, cur + ms);
    },

    /** Add bonus time ms; clamps total bank to BONUS_TIME_CAP_MS. Returns actual ms added. */
    addBonusTimeMs: function(ms) {
        offline.ensureState();
        if (!ms || ms <= 0) {
            return 0;
        }
        const before = data.currentGameState.bonusTime || 0;
        const next = Math.min(BONUS_TIME_CAP_MS, before + ms);
        data.currentGameState.bonusTime = next;
        return Math.max(0, next - before);
    },

    clampBonusTime: function() {
        offline.ensureState();
        const cur = data.currentGameState.bonusTime || 0;
        if (cur > BONUS_TIME_CAP_MS) {
            data.currentGameState.bonusTime = BONUS_TIME_CAP_MS;
        } else if (cur < 0) {
            data.currentGameState.bonusTime = 0;
        }
    },

    isPauseBonusMode: function() {
        return (data.gameSettings && data.gameSettings.offlineProgressMode) === "pauseBonus";
    },

    /** Convert wall-clock offline ms into bonus time at 1/5 ratio. Returns ms actually banked. */
    convertOfflineMsToBonus: function(offlineMs) {
        if (!offlineMs || offlineMs < OFFLINE_MIN_PROCESS_MS) {
            return 0;
        }
        const cappedOffline = Math.min(OFFLINE_CAP_MS, offlineMs);
        return offline.addBonusTimeMs(cappedOffline / 5);
    },

    showBonusGainMessage: function(gainedMs) {
        if (!gainedMs || gainedMs <= 0) {
            return;
        }
        let el = document.getElementById("bonusGainToast");
        if (!el) {
            el = document.createElement("div");
            el.id = "bonusGainToast";
            el.className = "bonus-gain-toast";
            document.body.appendChild(el);
        }
        el.textContent = `Gained ${offline.formatDuration(gainedMs)} of bonus time`;
        el.style.display = "block";
        if (offline._bonusGainToastTimer) {
            clearTimeout(offline._bonusGainToastTimer);
        }
        offline._bonusGainToastTimer = setTimeout(function() {
            el.style.display = "none";
        }, 5000);
    },

    formatDuration: function(ms) {
        return secondsToTime(Math.max(0, Math.floor((ms || 0) / 1000)));
    },

    /** Signed amount for report lines that may go negative (wood/stone). */
    formatSignedAmount: function(value) {
        const n = Number(value) || 0;
        if (n < 0) {
            return intToStringRound(n);
        }
        return `+${intToStringRound(n)}`;
    },

    yieldToBrowser: function() {
        return new Promise(function(resolve) {
            setTimeout(resolve, 0);
        });
    },

    el: function(id) {
        return (viewData.cached && viewData.cached[id]) || document.getElementById(id);
    },

    updateProgressUi: function() {
        const total = Math.max(1, offline.totalToProcessMs);
        const done = Math.min(total, offline.processedMs);
        const pct = Math.max(0, Math.min(100, (done / total) * 100));
        const fill = offline.el("offlineProcessingFill");
        const label = offline.el("offlineProcessingLabel");
        const etaEl = offline.el("offlineProcessingEta");
        if (label) {
            label.textContent = `Processing ${offline.formatDuration(total)}...`;
        }
        if (fill) {
            fill.style.width = `${pct}%`;
        }
        if (etaEl) {
            const wallElapsed = Math.max(1, performance.now() - offline.wallStartMs);
            const rate = done / wallElapsed;
            const remainMs = Math.max(0, total - done);
            if (rate > 0 && done > 0) {
                const etaSec = remainMs / rate / 1000;
                etaEl.textContent = `~${secondsToTime(Math.max(0, Math.ceil(etaSec)))} remaining`;
            } else {
                etaEl.textContent = "Estimating...";
            }
        }
        const overlay = offline.el("offlineProcessingOverlay");
        if (overlay) {
            overlay.style.display = "flex";
        }
    },

    showProcessing: function() {
        const overlay = offline.el("offlineProcessingOverlay");
        const summary = offline.el("offlineProcessingSummary");
        const dismiss = offline.el("offlineProcessingDismiss");
        if (summary) {
            summary.style.display = "none";
            summary.innerHTML = "";
        }
        if (dismiss) {
            dismiss.style.display = "none";
        }
        offline.updateProgressUi();
        if (overlay) {
            overlay.style.display = "flex";
        }
    },

    showSummary: function() {
        offline.processedMs = offline.totalToProcessMs;
        offline.updateProgressUi();
        const summary = offline.el("offlineProcessingSummary");
        const dismiss = offline.el("offlineProcessingDismiss");
        const label = offline.el("offlineProcessingLabel");
        const etaEl = offline.el("offlineProcessingEta");
        const g = offline.gains || {};
        const processedLabel = offline.formatDuration(offline.totalToProcessMs);
        if (label) {
            label.textContent = `Processed ${processedLabel} of offline time`;
        }
        if (etaEl) {
            etaEl.textContent = "";
        }

        const resortLines = [];
        resortLines.push(`Wood: ${offline.formatSignedAmount(g.wood)}`);
        resortLines.push(`Stone: ${offline.formatSignedAmount(g.stone)}`);
        if (engine.isInnBuiltFromFoxDen && engine.isInnBuiltFromFoxDen()) {
            resortLines.push(`Star Beads: +${intToStringRound(g.starBeads || 0)}`);
        }
        if (engine.isMarketBuilt && engine.isMarketBuilt()) {
            resortLines.push(`Credit: +${intToStringRound(g.credit || 0)}`);
        }
        if (offline.hasAnySpirit()) {
            resortLines.push(`Spirit Levels: +${intToStringRound(g.spiritLevels || 0)}`);
        }

        const combatLines = [];
        combatLines.push(`Coins: +${intToStringRound(g.coins || 0)}`);
        combatLines.push(`Character exp: +${intToStringRound(g.characterExp || 0)}`);
        combatLines.push(`Talents leveled: +${intToStringRound(g.talentLevels || 0)}`);
        combatLines.push(`Shards: +${intToStringRound(g.shards || 0)}`);
        if ((g.manaCapacity || 0) > 0 || (engine.isManaUnlocked && engine.isManaUnlocked())) {
            combatLines.push(`Base mana: +${intToStringRound(g.manaCapacity || 0)}`);
        }

        let html = `<div class="offline-processing-columns">`;
        html += `<div class="offline-processing-col"><div class="offline-processing-col-title">Gains from Resort</div>`;
        html += resortLines.map(function(l) { return `<div>${l}</div>`; }).join("");
        html += `</div>`;
        html += `<div class="offline-processing-col"><div class="offline-processing-col-title">Gains from Combat</div>`;
        html += combatLines.map(function(l) { return `<div>${l}</div>`; }).join("");
        html += `</div></div>`;

        if (summary) {
            summary.innerHTML = html;
            summary.style.display = "block";
        }
        if (dismiss) {
            dismiss.style.display = "";
        }
    },

    hasAnySpirit: function() {
        const spirits = data.progress.base && data.progress.base.hiddenSpring && data.progress.base.hiddenSpring.spirits;
        return !!(spirits && spirits.length > 0);
    },

    totalSpiritLevels: function() {
        const spirits = data.progress.base && data.progress.base.hiddenSpring && data.progress.base.hiddenSpring.spirits;
        if (!spirits || !spirits.length) {
            return 0;
        }
        let total = 0;
        for (let i = 0; i < spirits.length; i++) {
            total += spirits[i].level || 1;
        }
        return total;
    },

    totalTalentLevels: function() {
        const sk = data.progress.skills || {};
        const keys = Object.keys(sk);
        let total = 0;
        for (let i = 0; i < keys.length; i++) {
            total += sk[keys[i]].talentLevel || 0;
        }
        return total;
    },

    hidePanel: function() {
        const overlay = offline.el("offlineProcessingOverlay");
        if (overlay) {
            overlay.style.display = "none";
        }
    },

    dismissSummary: function() {
        offline.hidePanel();
    },

    markProcessed: function(ms) {
        if (ms <= 0) {
            return;
        }
        offline.processedMs += ms;
        offline.updateProgressUi();
    },

    emptyGains: function() {
        return {
            coins: 0,
            characterExp: 0,
            skillExp: 0,
            talentExp: 0,
            talentLevels: 0,
            shards: 0,
            manaCapacity: 0,
            wood: 0,
            stone: 0,
            starBeads: 0,
            credit: 0,
            spiritLevels: 0
        };
    },

    skillExpLifetime: function(skillKey, skill) {
        let total = skill.exp || 0;
        const level = skill.level || 0;
        for (let lv = 0; lv < level; lv++) {
            total += skills.getExpToLevel(skillKey, lv);
        }
        return total;
    },

    skillTalentLifetime: function(skillKey, skill) {
        const d = skills._byKey[skillKey] || {};
        const initTal = d.initialTalentToLevel !== undefined ? d.initialTalentToLevel : 10;
        let total = skill.talent || 0;
        let toLevel = initTal;
        const talentLevel = skill.talentLevel || 0;
        for (let lv = 0; lv < talentLevel; lv++) {
            total += toLevel;
            toLevel *= 1.05;
        }
        return total;
    },

    characterExpLifetime: function(ls) {
        if (!ls) {
            return 0;
        }
        let total = ls.exp || 0;
        let base = gameData.battle.levelStartingExpToLevel;
        const level = ls.level || 0;
        for (let lv = 0; lv < level; lv++) {
            const need = Math.max(1, Math.round(base));
            total += need;
            base *= 1.35;
        }
        return total;
    },

    snapshotProgress: function() {
        const skillsSnap = {};
        const sk = data.progress.skills || {};
        const keys = Object.keys(sk);
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            const s = sk[k];
            skillsSnap[k] = {
                expTotal: offline.skillExpLifetime(k, s),
                talentTotal: offline.skillTalentLifetime(k, s),
                talentLevel: s.talentLevel || 0
            };
        }
        const base = data.progress.base || {};
        const market = base.market || {};
        const mana = data.progress.mana || {};
        return {
            coins: data.progress.coins || 0,
            characterExp: offline.characterExpLifetime(data.battle && data.battle.levelState),
            skills: skillsSnap,
            shards: data.progress.shards || 0,
            talentLevels: offline.totalTalentLevels(),
            okamiExp: (data.progress.okami && data.progress.okami.exp) || 0,
            kills: (data.battle && data.battle.enemiesKilled) || 0,
            runCoins: (data.battle && data.battle.runCoinsFromKills) || 0,
            manaCapacity: mana.capacityBonus || 0,
            wood: (base.bambooForest && base.bambooForest.wood) || 0,
            stone: (typeof engine.getTotalStone === "function")
                ? engine.getTotalStone()
                : ((base.stonePile && ((base.stonePile.stone || 0) + (base.stonePile.dupedStone || 0))) || 0),
            starBeads: data.progress.starBeads || 0,
            credit: market.credit || 0,
            spiritLevels: offline.totalSpiritLevels()
        };
    },

    accumulateGainsFromSnapshots: function(before, after) {
        const g = offline.gains;
        g.coins += Math.max(0, (after.coins || 0) - (before.coins || 0));
        g.characterExp += Math.max(0, (after.characterExp || 0) - (before.characterExp || 0));
        g.talentLevels += Math.max(0, (after.talentLevels || 0) - (before.talentLevels || 0));
        g.manaCapacity += Math.max(0, (after.manaCapacity || 0) - (before.manaCapacity || 0));
        g.wood += (after.wood || 0) - (before.wood || 0);
        g.stone += (after.stone || 0) - (before.stone || 0);
        g.starBeads += Math.max(0, (after.starBeads || 0) - (before.starBeads || 0));
        g.credit += Math.max(0, (after.credit || 0) - (before.credit || 0));
        g.spiritLevels += Math.max(0, (after.spiritLevels || 0) - (before.spiritLevels || 0));
        // Shard gains are tracked via engine.grantShards while offline (slot unlocks consume progress.shards).
        const keys = Object.keys(after.skills || {});
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            const a = after.skills[k] || {};
            const b = (before.skills && before.skills[k]) || {};
            g.skillExp += Math.max(0, (a.expTotal || 0) - (b.expTotal || 0));
            g.talentExp += Math.max(0, (a.talentTotal || 0) - (b.talentTotal || 0));
        }
    },

    /** One game-second: ticksPerSecond gameTicks + one secondPassed. Always unpaused. */
    runOneGameSecond: function(opts) {
        opts = opts || {};
        const tps = data.gameSettings.ticksPerSecond || 20;
        data.gameSettings.stop = false;
        for (let i = 0; i < tps; i++) {
            if (opts.nonCombatOnly) {
                const tickMs = 1000 / tps;
                data.gameSettings.ticksForSeconds++;
                engine.runResortTick(tickMs);
            } else {
                engine.gameTick();
            }
        }
        data.gameSettings.ticksForSeconds = 0;
        driver.secondPassed();
    },

    runGameSecondsChunked: async function(seconds, opts) {
        opts = opts || {};
        let left = Math.max(0, Math.floor(seconds));
        while (left > 0) {
            const sliceStart = performance.now();
            while (left > 0 && (performance.now() - sliceStart) < OFFLINE_TICK_BUDGET_MS) {
                offline.runOneGameSecond(opts);
                left--;
                offline.markProcessed(1000);
            }
            if (left > 0) {
                await offline.yieldToBrowser();
            }
        }
    },

    isContinuousCombatUnlocked: function() {
        const bf = data.progress.base && data.progress.base.bonfire;
        if (!bf) {
            return false;
        }
        return !!(bf.autoRetryUnlocked || bf.startWithFullManaUnlocked);
    },

    canStartSampleClone: function() {
        if (!engine.isManaUnlocked() || !data.progress.battleUnlocked) {
            return false;
        }
        if (!offline.isContinuousCombatUnlocked()) {
            return false;
        }
        if (data.battle && data.battle.state === "running") {
            return true;
        }
        return bonfire.canAffordCreateClone();
    },

    startSampleCloneIfNeeded: function() {
        if (data.battle && data.battle.state === "running") {
            return true;
        }
        if (!bonfire.canAffordCreateClone()) {
            return false;
        }
        return !!bonfire.startNextClone();
    },

    /** Advance current/sample battle until terminal or seconds budget exhausted. Returns seconds used. */
    advanceBattleSeconds: async function(maxSeconds) {
        let used = 0;
        const budget = Math.max(0, Math.floor(maxSeconds));
        while (used < budget) {
            if (!data.battle || data.battle.state !== "running") {
                break;
            }
            const sliceStart = performance.now();
            while (used < budget && data.battle.state === "running" && (performance.now() - sliceStart) < OFFLINE_TICK_BUDGET_MS) {
                offline.runOneGameSecond({ nonCombatOnly: false });
                used++;
                offline.markProcessed(1000);
            }
            if (used < budget && data.battle.state === "running") {
                await offline.yieldToBrowser();
            }
        }
        return used;
    },

    measureRunRates: function(before, after, durationSec, runStart) {
        const T = Math.max(1 / 20, durationSec);
        const skillRates = {};
        const keys = Object.keys(after.skills || {});
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            const a = after.skills[k] || {};
            const b = (before.skills && before.skills[k]) || {};
            skillRates[k] = {
                expPerSec: Math.max(0, (a.expTotal || 0) - (b.expTotal || 0)) / T,
                talentPerSec: Math.max(0, (a.talentTotal || 0) - (b.talentTotal || 0)) / T
            };
        }
        const settings = data.battle && data.battle.cloneRunSettings;
        const manaCost = settings
            ? (settings.manaCost || bonfire.getCloneManaCostFromSnapshot(settings.cloneDensity))
            : bonfire.getCloneManaCost();
        const runCoins0 = runStart && runStart.runCoins !== undefined ? runStart.runCoins : (before.runCoins || 0);
        const kills0 = runStart && runStart.kills !== undefined ? runStart.kills : (before.kills || 0);
        const char0 = runStart && runStart.characterExp !== undefined ? runStart.characterExp : (before.characterExp || 0);
        const battle = data.battle || {};
        const award0 = runStart && runStart.coinAwardEquiv !== undefined ? runStart.coinAwardEquiv : 0;
        const preFlat0 = runStart && runStart.coinPreFlatGainSum !== undefined ? runStart.coinPreFlatGainSum : 0;
        return {
            durationSec: T,
            coinsPerSec: Math.max(0, (after.runCoins || 0) - runCoins0) / T,
            characterExpPerSec: Math.max(0, (after.characterExp || 0) - char0) / T,
            killsPerSec: Math.max(0, (after.kills || 0) - kills0) / T,
            awardCallsPerSec: Math.max(0, (battle.coinAwardEquiv || 0) - award0) / T,
            preFlatGainPerSec: Math.max(0, (battle.coinPreFlatGainSum || 0) - preFlat0) / T,
            skillRates: skillRates,
            manaCost: manaCost
        };
    },

    getManaUptime: function(rates) {
        if (!offline.isContinuousCombatUnlocked() || !rates) {
            return 0;
        }
        const demand = (rates.manaCost || 0) / Math.max(rates.durationSec, 1 / 20);
        if (demand <= 0) {
            return 1;
        }
        const regen = engine.getEffectiveManaRatePerSecond();
        return Math.min(1, regen / demand);
    },

    applySkillProgress: function(skillKey, expDelta, talentDelta) {
        if ((!expDelta || expDelta <= 0) && (!talentDelta || talentDelta <= 0)) {
            return;
        }
        const skill = data.progress.skills[skillKey];
        if (!skill) {
            return;
        }
        if (skill.maxLevel !== undefined && skill.level >= skill.maxLevel && (!talentDelta || talentDelta <= 0)) {
            // still allow talent
        }
        if (expDelta > 0 && !(skill.maxLevel !== undefined && skill.level >= skill.maxLevel)) {
            skill.exp += expDelta;
            offline.gains.skillExp += expDelta;
            while (skill.exp >= skill.expToLevel && (!skill.maxLevel || skill.level < skill.maxLevel)) {
                skill.exp -= skill.expToLevel;
                skill.level++;
                skill.expToLevel = skills.getExpToLevel(skillKey, skill.level);
                engine.onSkillLevelUp(skill);
            }
        }
        if (talentDelta > 0) {
            skill.talent += talentDelta;
            offline.gains.talentExp += talentDelta;
            while (skill.talent >= skill.talentToLevel) {
                skill.talent -= skill.talentToLevel;
                skill.talentLevel++;
                offline.gains.talentLevels++;
                skill.talentToLevel = skill.talentToLevel * 1.05;
            }
        }
    },

    applyCombatRates: function(rates, combatSeconds) {
        if (!rates || combatSeconds <= 0) {
            return;
        }
        const coinsGain = rates.coinsPerSec * combatSeconds;
        data.progress.coins = (data.progress.coins || 0) + coinsGain;
        offline.gains.coins += coinsGain;

        const charExp = rates.characterExpPerSec * combatSeconds;
        if (charExp > 0) {
            offline.gains.characterExp += charExp;
            const cardAdd = (typeof shrineCards !== "undefined" && shrineCards.getAggregatedEffects)
                ? (shrineCards.getAggregatedEffects().okamiExpAdd || 0) : 0;
            const okami = engine.getOkami();
            okami.exp = (okami.exp || 0) + charExp * 0.01 * (1 + cardAdd);
            engine.applyOkamiLevelUps();
        }

        const keys = Object.keys(rates.skillRates || {});
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            const r = rates.skillRates[k];
            offline.applySkillProgress(k, r.expPerSec * combatSeconds, r.talentPerSec * combatSeconds);
        }

        const launches = rates.durationSec > 0 ? (combatSeconds / rates.durationSec) : 0;
        const manaSpend = launches * (rates.manaCost || 0);
        if (manaSpend > 0 && data.progress.mana) {
            data.progress.mana.amount = Math.max(0, (data.progress.mana.amount || 0) - manaSpend);
        }
        if (launches > 0 && data.progress.mana && typeof engine.getManaCapacityBonusPerCloneDispersal === "function") {
            const per = engine.getManaCapacityBonusPerCloneDispersal((rates.durationSec || 0) * 1000);
            const capGain = launches * per;
            data.progress.mana.capacityBonus = (data.progress.mana.capacityBonus || 0) + capGain;
            offline.gains.manaCapacity += capGain;
        }
    },

    /** Fill resort / mana / talent-level summary fields from a full start→end snapshot. */
    finalizeGainsFromStartSnap: function() {
        if (!offline.startSnap || !offline.gains) {
            return;
        }
        const before = offline.startSnap;
        const after = offline.snapshotProgress();
        const g = offline.gains;
        g.wood = (after.wood || 0) - (before.wood || 0);
        g.stone = (after.stone || 0) - (before.stone || 0);
        g.starBeads = Math.max(0, (after.starBeads || 0) - (before.starBeads || 0));
        g.credit = Math.max(0, (after.credit || 0) - (before.credit || 0));
        g.spiritLevels = Math.max(0, (after.spiritLevels || 0) - (before.spiritLevels || 0));
        // Prefer end-start for these so sample + bulk + resort are covered once.
        g.coins = Math.max(0, (after.coins || 0) - (before.coins || 0));
        g.talentLevels = Math.max(0, (after.talentLevels || 0) - (before.talentLevels || 0));
        g.manaCapacity = Math.max(0, (after.manaCapacity || 0) - (before.manaCapacity || 0));
        // characterExp stays from tracked combat gains (levelState resets between runs).
        // g.shards already accumulated via engine.grantShards during offline.
    },

    /** Average per-kill hit chance across all map enemies (for EV). */
    averageKillShardChance: function(map) {
        if (!map || !engine.isShardLootUnlocked()) {
            return 0;
        }
        const zones = map.zones || [];
        let totalEnemies = 0;
        let weighted = 0;
        const tier = data.battle.mapTier || 0;
        for (let i = 0; i < zones.length; i++) {
            const n = Math.max(0, zones[i].totalEnemies || 0);
            if (n <= 0) {
                continue;
            }
            const p = Math.min(1, mapData.getZoneShardDropChance(map, i, tier));
            weighted += p * n;
            totalEnemies += n;
        }
        if (totalEnemies <= 0) {
            return 0;
        }
        return weighted / totalEnemies;
    },

    addShardExpectation: function(expected) {
        if (!(expected > 0)) {
            return;
        }
        if (typeof offline.shardBank !== "number") {
            offline.shardBank = 0;
        }
        offline.shardBank += expected;
    },

    /** EV shards for one kill x scale (fractional kills supported). */
    applyExpectedShardsForOneKill: function(map, scale) {
        const mult = scale === undefined ? 1 : scale;
        if (mult <= 0 || !map) {
            return;
        }
        const p = offline.averageKillShardChance(map);
        if (p <= 0) {
            return;
        }
        const amount = mapData.getMapShardDropAmount(map);
        if (!(amount > 0)) {
            return;
        }
        offline.addShardExpectation(p * amount * mult);
    },

    applyShardEvForKills: function(killCount) {
        if (killCount <= 0 || !engine.isShardLootUnlocked()) {
            return;
        }
        const map = initialize.getCurrentMapDefinition();
        if (!map) {
            return;
        }
        const whole = Math.floor(killCount);
        const frac = killCount - whole;
        for (let i = 0; i < whole; i++) {
            offline.applyExpectedShardsForOneKill(map, 1);
        }
        if (frac > 0.001) {
            offline.applyExpectedShardsForOneKill(map, frac);
        }
    },

    applyShardRates: function(rates, combatSeconds) {
        if (!rates || combatSeconds <= 0) {
            return;
        }
        const kills = rates.killsPerSec * combatSeconds;
        offline.applyShardEvForKills(kills);
    },

    captureColumnRewards: function() {
        const out = {};
        const cols = skills.SLOT_COLUMNS;
        for (let i = 0; i < cols.length; i++) {
            const col = cols[i];
            out[col] = skills.columnReward(col).value || 0;
        }
        return out;
    },

    /**
     * In-combat seconds until an equipped talent level changes a column reward.
     * Talent rates are the sample's in-combat rates.
     */
    secondsUntilColumnRewardChange: function(rates) {
        const eq = skills.ensureSkillEquip();
        if (!eq || !rates || !rates.skillRates) {
            return Infinity;
        }
        const sims = [];
        const totals = {};
        const rewardValues = {};
        const cols = skills.SLOT_COLUMNS;
        for (let c = 0; c < cols.length; c++) {
            const col = cols[c];
            totals[col] = 0;
            const arr = eq.slots[col] || [];
            for (let i = 0; i < arr.length; i++) {
                const key = arr[i];
                if (!key) {
                    continue;
                }
                const skill = data.progress.skills[key];
                if (!skill) {
                    continue;
                }
                totals[col] += Math.floor(skill.talentLevel || 0);
                const rate = (rates.skillRates[key] && rates.skillRates[key].talentPerSec) || 0;
                if (rate > 0) {
                    sims.push({
                        column: col,
                        talent: skill.talent || 0,
                        toLevel: skill.talentToLevel > 0 ? skill.talentToLevel : 10,
                        rate: rate
                    });
                }
            }
            rewardValues[col] = skills.columnRewardValueForTotal(col, totals[col]);
        }
        if (!sims.length) {
            return Infinity;
        }
        let elapsed = 0;
        for (let step = 0; step < 20000; step++) {
            let best = -1;
            let bestDt = Infinity;
            for (let i = 0; i < sims.length; i++) {
                if (!(sims[i].rate > 0)) {
                    continue;
                }
                const need = sims[i].toLevel - sims[i].talent;
                const dt = need > 0 ? need / sims[i].rate : 0;
                if (dt < bestDt) {
                    bestDt = dt;
                    best = i;
                }
            }
            if (best < 0 || !isFinite(bestDt)) {
                return Infinity;
            }
            elapsed += bestDt;
            for (let i = 0; i < sims.length; i++) {
                sims[i].talent += sims[i].rate * bestDt;
            }
            const sim = sims[best];
            sim.talent = 0;
            sim.toLevel *= 1.05;
            totals[sim.column] += 1;
            const nextVal = skills.columnRewardValueForTotal(sim.column, totals[sim.column]);
            if (nextVal !== rewardValues[sim.column]) {
                return elapsed;
            }
            rewardValues[sim.column] = nextVal;
        }
        return Infinity;
    },

    columnStepKind: function(before) {
        const now = offline.captureColumnRewards();
        let combat = false;
        let economy = false;
        const cols = skills.SLOT_COLUMNS;
        for (let i = 0; i < cols.length; i++) {
            const col = cols[i];
            if ((now[col] || 0) === (before[col] || 0)) {
                continue;
            }
            if (col === "offense" || col === "defense") {
                combat = true;
            } else {
                economy = true;
            }
        }
        return { changed: combat || economy, combat: combat, economy: economy };
    },

    /** Any scales skill and talent rates once. Utility percent scales every measured battle coin rate. */
    scaleRatesAfterColumnStep: function(rates, before) {
        if (!rates) {
            return;
        }
        const anyNow = skills.columnReward("any").value || 0;
        const anyOld = before.any || 0;
        const newMult = 1 + anyNow / 100;
        const oldMult = 1 + anyOld / 100;
        if (oldMult > 0 && newMult !== oldMult) {
            const factor = newMult / oldMult;
            const keys = Object.keys(rates.skillRates || {});
            for (let i = 0; i < keys.length; i++) {
                const r = rates.skillRates[keys[i]];
                if (!r) {
                    continue;
                }
                r.expPerSec *= factor;
                r.talentPerSec *= factor;
            }
        }
        const utilNow = skills.columnReward("utility").value || 0;
        const utilOld = before.utility || 0;
        const oldFactor = 1 + utilOld / 100;
        const newFactor = 1 + utilNow / 100;
        if (oldFactor > 0 && newFactor !== oldFactor) {
            rates.coinsPerSec *= newFactor / oldFactor;
        }
    },

    /** Wall-clock slice of resort time, then combat rates for the uptime portion. */
    applyRateSlice: async function(rates, wallSec) {
        if (!rates || !(wallSec > 0)) {
            return;
        }
        const whole = Math.floor(wallSec);
        if (whole > 0) {
            await offline.runGameSecondsChunked(whole, { nonCombatOnly: true });
        }
        const fracMs = Math.round((wallSec - whole) * 1000);
        if (fracMs > 0) {
            offline.markProcessed(fracMs);
        }
        const uptime = offline.getManaUptime(rates);
        const combatSec = wallSec * uptime;
        offline.applyCombatRates(rates, combatSec);
        offline.applyShardRates(rates, combatSec);
    },

    processHourChunk: async function(chunkMs) {
        let remainingInChunk = chunkMs;

        if (!offline.isContinuousCombatUnlocked() || !engine.isManaUnlocked() || !data.progress.battleUnlocked) {
            await offline.runGameSecondsChunked(remainingInChunk / 1000, { nonCombatOnly: true });
            return;
        }

        let alreadyRunning = !!(data.battle && data.battle.state === "running");
        if (!alreadyRunning) {
            let waited = 0;
            while (remainingInChunk >= 1000 && !bonfire.canAffordCreateClone()) {
                offline.runOneGameSecond({ nonCombatOnly: true });
                remainingInChunk -= 1000;
                waited++;
                offline.markProcessed(1000);
                if (waited % 20 === 0) {
                    await offline.yieldToBrowser();
                }
            }
            if (remainingInChunk <= 0) {
                return;
            }
        }

        while (remainingInChunk >= 1000) {
            const wasRunning = !!(data.battle && data.battle.state === "running");
            const before = offline.snapshotProgress();
            if (!wasRunning) {
                if (!offline.startSampleCloneIfNeeded()) {
                    await offline.runGameSecondsChunked(remainingInChunk / 1000, { nonCombatOnly: true });
                    return;
                }
            }

            const runStart = {
                runCoins: (data.battle && data.battle.runCoinsFromKills) || 0,
                kills: (data.battle && data.battle.enemiesKilled) || 0,
                characterExp: offline.characterExpLifetime(data.battle && data.battle.levelState),
                coinAwardEquiv: (data.battle && data.battle.coinAwardEquiv) || 0,
                coinPreFlatGainSum: (data.battle && data.battle.coinPreFlatGainSum) || 0
            };

            const sampleUsedSec = await offline.advanceBattleSeconds(remainingInChunk / 1000);
            remainingInChunk -= sampleUsedSec * 1000;

            const after = offline.snapshotProgress();
            after.runCoins = (data.battle && data.battle.runCoinsFromKills) || 0;
            after.kills = (data.battle && data.battle.enemiesKilled) || 0;
            after.characterExp = offline.characterExpLifetime(data.battle && data.battle.levelState);
            offline.accumulateGainsFromSnapshots(before, after);
            const charSnapDelta = Math.max(0, (after.characterExp || 0) - (before.characterExp || 0));
            const charRunDelta = Math.max(0, (after.characterExp || 0) - (runStart.characterExp || 0));
            offline.gains.characterExp += charRunDelta - charSnapDelta;

            const sampleFinished = sampleUsedSec > 0 && !(data.battle && data.battle.state === "running");
            if (!sampleFinished || remainingInChunk <= 0) {
                break;
            }

            let rates = offline.measureRunRates(before, after, sampleUsedSec, runStart);
            let resample = false;
            while (remainingInChunk > 0 && !resample) {
                const remainingBefore = remainingInChunk;
                const beforeRewards = offline.captureColumnRewards();
                const uptime = offline.getManaUptime(rates);
                const combatDt = offline.secondsUntilColumnRewardChange(rates);
                let wallSec;
                if (!(uptime > 0) || !isFinite(combatDt)) {
                    wallSec = remainingInChunk / 1000;
                } else if (combatDt <= 0) {
                    wallSec = Math.min(remainingInChunk / 1000, 0.05);
                } else {
                    wallSec = Math.min(remainingInChunk / 1000, combatDt / uptime);
                }
                if (wallSec > 0) {
                    await offline.applyRateSlice(rates, wallSec);
                    remainingInChunk -= wallSec * 1000;
                }
                const step = offline.columnStepKind(beforeRewards);
                const consumedAll = wallSec * 1000 >= remainingBefore - 1;
                if (!(uptime > 0) || !isFinite(combatDt) || consumedAll && !step.changed) {
                    break;
                }
                if (!step.changed) {
                    if (wallSec <= 0) {
                        break;
                    }
                    continue;
                }
                if (step.combat) {
                    initialize.calcPlayerStats(false);
                    resample = true;
                    break;
                }
                offline.scaleRatesAfterColumnStep(rates, beforeRewards);
                if (wallSec <= 0) {
                    break;
                }
            }
            if (!resample) {
                break;
            }
            await offline.yieldToBrowser();
        }
    },

    process: async function(opts) {
        opts = opts || {};
        offline.ensureState();
        const pending = data.currentGameState.pendingOfflineMs || 0;
        if (pending <= 0) {
            return false;
        }
        if (!opts.force && pending < OFFLINE_MIN_PROCESS_MS) {
            data.currentGameState.pendingOfflineMs = 0;
            return false;
        }
        if (isProcessingOffline) {
            return false;
        }

        isProcessingOffline = true;
        data.gameSettings.stopAll = true;
        // Process as if unpaused regardless of save pause state.
        const prevStop = !!data.gameSettings.stop;
        data.gameSettings.stop = false;
        if (typeof events !== "undefined" && events.toggleSkipButtons) {
            events.toggleSkipButtons(true);
        }

        offline.gains = offline.emptyGains();
        offline.startSnap = offline.snapshotProgress();
        offline.shardBank = typeof data.currentGameState.offlineShardBank === "number"
            ? data.currentGameState.offlineShardBank
            : 0;
        offline.totalToProcessMs = Math.min(OFFLINE_CAP_MS, pending);
        offline.processedMs = 0;
        offline.wallStartMs = performance.now();
        data.currentGameState.pendingOfflineMs = offline.totalToProcessMs;

        offline.showProcessing();

        let remaining = offline.totalToProcessMs;

        try {
            // Phase A: spend offline on current run first
            if (data.battle && data.battle.state === "running") {
                const before = offline.snapshotProgress();
                before.runCoins = data.battle.runCoinsFromKills || 0;
                before.kills = data.battle.enemiesKilled || 0;
                const usedSec = await offline.advanceBattleSeconds(remaining / 1000);
                remaining -= usedSec * 1000;
                const after = offline.snapshotProgress();
                after.runCoins = (data.battle.runCoinsFromKills || 0);
                after.kills = data.battle.enemiesKilled || 0;
                offline.accumulateGainsFromSnapshots(before, after);
            }

            // Phase B: hour chunks with sample + rates
            while (remaining >= 1000) {
                const chunk = Math.min(OFFLINE_HOUR_MS, remaining);
                const beforeChunk = remaining;
                await offline.processHourChunk(chunk);
                remaining -= chunk;
                // processHourChunk marks processed internally; clamp if overshot
                if (offline.processedMs > offline.totalToProcessMs) {
                    offline.processedMs = offline.totalToProcessMs;
                }
                if (remaining === beforeChunk) {
                    // safety: avoid infinite loop
                    break;
                }
                await offline.yieldToBrowser();
            }

            // Grant accumulated expected shards
            const banked = typeof offline.shardBank === "number" ? offline.shardBank : 0;
            if (banked > 0) {
                engine.grantShards(banked);
                offline.shardBank = 0;
            }
            data.currentGameState.offlineShardBank = 0;
            data.currentGameState.pendingOfflineMs = 0;

            offline.finalizeGainsFromStartSnap();
            offline.updateProgressUi();
            offline.showSummary();
            saving.save();

            if (typeof view !== "undefined") {
                if (view.invalidateFormattedNumberCache) {
                    view.invalidateFormattedNumberCache();
                }
                view.updateView();
                if (view.refreshBattleUiNow) {
                    view.refreshBattleUiNow();
                }
            }
        } finally {
            data.gameSettings.stop = prevStop;
            data.gameSettings.stopAll = false;
            isProcessingOffline = false;
            if (typeof events !== "undefined" && events.toggleSkipButtons) {
                events.toggleSkipButtons(false);
            }
        }
        return true;
    }
};

function debugOfflineProgress(hours, opts) {
    if (typeof isDebug !== "undefined" && !isDebug) {
        console.log("debugOfflineProgress requires isDebug");
        return;
    }
    if (isProcessingOffline) {
        console.log("Already processing offline progress");
        return;
    }
    opts = opts || {};
    let ms = 0;
    if (hours !== undefined && hours !== null) {
        ms += Number(hours) * OFFLINE_HOUR_MS;
    }
    if (opts.minutes) {
        ms += Number(opts.minutes) * 60 * 1000;
    }
    if (opts.seconds) {
        ms += Number(opts.seconds) * 1000;
    }
    if (!ms || ms <= 0) {
        console.log("Usage: debugOfflineProgress(hours) or debugOfflineProgress(0, { minutes: 5 })");
        return;
    }
    offline.ensureState();
    data.currentGameState.pendingOfflineMs = 0;
    offline.addPendingOfflineMs(ms);
    console.log(`Debug offline: processing ${offline.formatDuration(data.currentGameState.pendingOfflineMs)}`);
    offline.process({ force: true }).then(function() {
        console.log("Debug offline complete", offline.gains);
    });
}
