/** Offline catch-up: process pendingOfflineMs without live UI. */
const OFFLINE_CAP_MS = 24 * 60 * 60 * 1000;
const OFFLINE_HOUR_MS = 60 * 60 * 1000;
const OFFLINE_MIN_PROCESS_MS = 60 * 1000;
const OFFLINE_TICK_BUDGET_MS = 12;
const BONUS_TIME_CAP_MS = 6 * 60 * 60 * 1000;

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
        if (!data.currentGameState.offlineShardBank || typeof data.currentGameState.offlineShardBank !== "object") {
            data.currentGameState.offlineShardBank = {};
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
        const d = skills._byKey[skillKey] || {};
        const initExp = d.initialExpToLevel !== undefined ? d.initialExpToLevel : 5;
        let total = skill.exp || 0;
        const level = skill.level || 0;
        for (let lv = 0; lv < level; lv++) {
            total += initExp * Math.pow(1.3, lv);
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
                talentLevel: s.talentLevel || 0,
                shards: s.shards || 0
            };
        }
        const base = data.progress.base || {};
        const market = base.market || {};
        const mana = data.progress.mana || {};
        return {
            coins: data.progress.coins || 0,
            characterExp: offline.characterExpLifetime(data.battle && data.battle.levelState),
            skills: skillsSnap,
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
        const keys = Object.keys(after.skills || {});
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            const a = after.skills[k] || {};
            const b = (before.skills && before.skills[k]) || {};
            g.skillExp += Math.max(0, (a.expTotal || 0) - (b.expTotal || 0));
            g.talentExp += Math.max(0, (a.talentTotal || 0) - (b.talentTotal || 0));
            g.shards += Math.max(0, (a.shards || 0) - (b.shards || 0));
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
        return {
            durationSec: T,
            coinsPerSec: Math.max(0, (after.runCoins || 0) - runCoins0) / T,
            characterExpPerSec: Math.max(0, (after.characterExp || 0) - char0) / T,
            killsPerSec: Math.max(0, (after.kills || 0) - kills0) / T,
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
        const d = skills._byKey[skillKey] || {};
        if (skill.maxLevel !== undefined && skill.level >= skill.maxLevel && (!talentDelta || talentDelta <= 0)) {
            // still allow talent
        }
        if (expDelta > 0 && !(skill.maxLevel !== undefined && skill.level >= skill.maxLevel)) {
            skill.exp += expDelta;
            offline.gains.skillExp += expDelta;
            const initExp = d.initialExpToLevel !== undefined ? d.initialExpToLevel : 5;
            while (skill.exp >= skill.expToLevel && (!skill.maxLevel || skill.level < skill.maxLevel)) {
                skill.exp -= skill.expToLevel;
                skill.level++;
                skill.expToLevel = initExp * Math.pow(1.3, skill.level);
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
            const per = engine.getManaCapacityBonusPerCloneDispersal();
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
        let shardGain = 0;
        const keys = Object.keys(after.skills || {});
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            const a = after.skills[k] || {};
            const b = (before.skills && before.skills[k]) || {};
            shardGain += Math.max(0, (a.shards || 0) - (b.shards || 0));
        }
        g.shards = shardGain;
        // characterExp stays from tracked combat gains (levelState resets between runs).
    },

    /** Expected shard chance for one def at current found count. */
    shardHitChance: function(sh) {
        if (!sh || !sh.key || !skills._byKey[sh.key]) {
            return 0;
        }
        if (!skills.isSkillResearchComplete(sh.key)) {
            return 0;
        }
        if (!engine.isShardLootUnlocked()) {
            return 0;
        }
        const target = data.progress.skills[sh.key];
        const found = target && target.shards !== undefined ? target.shards : 0;
        const bank = offline.shardBank[sh.key] || 0;
        const virtualFound = found + bank;
        const baseCap = mapData.getSkillShardCap(sh);
        const softChance = mapData.getShardSoftCapChance(sh.chance || 0, virtualFound, baseCap);
        const tier = data.battle.mapTier || 0;
        const chanceMult = tier >= 2 ? 10 : (tier >= 1 ? 3 : 1);
        const lootMult = engine.getShardLootChanceMultiplier();
        return Math.min(0.999, softChance * chanceMult * lootMult);
    },

    grantBankedShards: function(skillKey, amount) {
        if (!amount || amount < 1) {
            return;
        }
        const whole = Math.floor(amount);
        if (whole < 1) {
            return;
        }
        const target = data.progress.skills[skillKey];
        if (!target) {
            return;
        }
        target.shards = (target.shards || 0) + whole;
        offline.gains.shards += whole;
        offline.shardBank[skillKey] = (offline.shardBank[skillKey] || 0) - whole;
        if (offline.shardBank[skillKey] < 0) {
            offline.shardBank[skillKey] = 0;
        }
    },

    addShardExpectation: function(skillKey, expected) {
        if (!skillKey || expected <= 0) {
            return;
        }
        offline.shardBank[skillKey] = (offline.shardBank[skillKey] || 0) + expected;
        const banked = offline.shardBank[skillKey];
        if (banked >= 1) {
            offline.grantBankedShards(skillKey, banked);
        }
    },

    /** Sequential first-hit EV matching trySkillShardDropOnKill order for map-wide shards. */
    /** Sequential first-hit EV for one kill; `scale` multiplies added expectation (for fractional kills). */
    applyExpectedShardsForOneKill: function(map, zoneShards, scale) {
        const mult = scale === undefined ? 1 : scale;
        if (mult <= 0) {
            return;
        }
        let missP = 1;
        const zones = map.zones || [];
        if (zones[0] && zones[0].skillShard) {
            const sh = zones[0].skillShard;
            const p = offline.shardHitChance(sh);
            const hit = missP * p;
            if (hit > 0 && sh.key) {
                offline.addShardExpectation(sh.key, hit * Math.max(1, sh.gain || 1) * mult);
            }
            missP *= (1 - p);
        }
        for (let si = 0; si < zoneShards.length; si++) {
            const sh = zoneShards[si];
            const p = offline.shardHitChance(sh);
            const hit = missP * p;
            if (hit > 0 && sh.key) {
                offline.addShardExpectation(sh.key, hit * Math.max(1, sh.gain || 1) * mult);
            }
            missP *= (1 - p);
            if (missP < 1e-12) {
                break;
            }
        }
    },

    applyShardEvForKills: function(killCount) {
        if (killCount <= 0 || !engine.isShardLootUnlocked()) {
            return;
        }
        const map = initialize.getCurrentMapDefinition();
        if (!map) {
            return;
        }
        const zoneShards = map.zoneShards || [];
        const whole = Math.floor(killCount);
        const frac = killCount - whole;
        for (let i = 0; i < whole; i++) {
            offline.applyExpectedShardsForOneKill(map, zoneShards, 1);
        }
        if (frac > 0.001) {
            offline.applyExpectedShardsForOneKill(map, zoneShards, frac);
        }
    },

    applyShardRates: function(rates, combatSeconds) {
        if (!rates || combatSeconds <= 0) {
            return;
        }
        const kills = rates.killsPerSec * combatSeconds;
        offline.applyShardEvForKills(kills);
    },

    processHourChunk: async function(chunkMs) {
        let remainingInChunk = chunkMs;

        if (!offline.isContinuousCombatUnlocked() || !engine.isManaUnlocked() || !data.progress.battleUnlocked) {
            await offline.runGameSecondsChunked(remainingInChunk / 1000, { nonCombatOnly: true });
            return;
        }

        const alreadyRunning = !!(data.battle && data.battle.state === "running");
        // Snapshot skill/talent BEFORE starting a new sample so start-of-run grants
        // (shards, immediate level-up chains into paddingResume/savageLessons/etc.) are included.
        let before = null;
        if (!alreadyRunning) {
            before = offline.snapshotProgress();
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
            // Re-snapshot after mana wait so resort gains during wait aren't blamed on combat rates.
            before = offline.snapshotProgress();
            if (!offline.startSampleCloneIfNeeded()) {
                await offline.runGameSecondsChunked(remainingInChunk / 1000, { nonCombatOnly: true });
                return;
            }
        } else {
            before = offline.snapshotProgress();
        }

        const runStart = {
            runCoins: (data.battle && data.battle.runCoinsFromKills) || 0,
            kills: (data.battle && data.battle.enemiesKilled) || 0,
            characterExp: offline.characterExpLifetime(data.battle && data.battle.levelState)
        };

        const sampleUsedSec = await offline.advanceBattleSeconds(remainingInChunk / 1000);
        remainingInChunk -= sampleUsedSec * 1000;

        const after = offline.snapshotProgress();
        after.runCoins = (data.battle && data.battle.runCoinsFromKills) || 0;
        after.kills = (data.battle && data.battle.enemiesKilled) || 0;
        after.characterExp = offline.characterExpLifetime(data.battle && data.battle.levelState);
        offline.accumulateGainsFromSnapshots(before, after);
        // Character exp is per-run: undo snapshot delta (may use a prior dead run's level) and use post-start baseline.
        const charSnapDelta = Math.max(0, (after.characterExp || 0) - (before.characterExp || 0));
        const charRunDelta = Math.max(0, (after.characterExp || 0) - (runStart.characterExp || 0));
        offline.gains.characterExp += charRunDelta - charSnapDelta;

        if (remainingInChunk > 0) {
            const bulkSec = remainingInChunk / 1000;
            await offline.runGameSecondsChunked(bulkSec, { nonCombatOnly: true });
            if (sampleUsedSec > 0 && !(data.battle && data.battle.state === "running")) {
                // Only apply bulk combat rates when the sample run fully finished.
                const rates = offline.measureRunRates(before, after, sampleUsedSec, runStart);
                const uptime = offline.getManaUptime(rates);
                const combatSec = bulkSec * uptime;
                offline.applyCombatRates(rates, combatSec);
                offline.applyShardRates(rates, combatSec);
            }
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
        if (data.gameSettings && data.gameSettings.prestigePackOpen) {
            data.currentGameState.pendingOfflineMs = 0;
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
        offline.shardBank = Object.assign({}, data.currentGameState.offlineShardBank || {});
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

            // Persist fractional shard bank
            data.currentGameState.offlineShardBank = offline.shardBank || {};
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
