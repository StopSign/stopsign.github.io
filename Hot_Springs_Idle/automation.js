/**
 * Paper automation. Invested paper sets a Y ceiling per resource.
 * The +10% button raises X, the share of that resource autobuy is allowed to spend.
 */
let automation = {
    _offlineSeconds: 0,
    _baseCostsReady: false,
    _baseCosts: {},

    defaultState: function() {
        const invested = {};
        const level = {};
        const list = (typeof resortData !== "undefined" && resortData.automationResources) || [];
        for (let i = 0; i < list.length; i++) {
            invested[list[i].key] = 0;
            level[list[i].key] = 0;
        }
        return {
            enabled: true,
            invested: invested,
            level: level,
            upgrades: {},
            buildings: {}
        };
    },

    ensure: function() {
        if (!data.progress) {
            return automation.defaultState();
        }
        if (!data.progress.automation || typeof data.progress.automation !== "object") {
            data.progress.automation = automation.defaultState();
        }
        const state = data.progress.automation;
        if (state.enabled === undefined || state.enabled === null) {
            state.enabled = true;
        }
        if (!state.invested || typeof state.invested !== "object") {
            state.invested = {};
        }
        if (!state.level || typeof state.level !== "object") {
            state.level = {};
        }
        if (!state.upgrades || typeof state.upgrades !== "object") {
            state.upgrades = {};
        }
        if (!state.buildings || typeof state.buildings !== "object") {
            state.buildings = {};
        }
        const list = resortData.automationResources || [];
        const known = {};
        for (let n = 0; n < list.length; n++) {
            known[list[n].key] = true;
        }
        const order = [];
        const savedOrder = Array.isArray(state.order) ? state.order : [];
        for (let o = 0; o < savedOrder.length; o++) {
            const savedKey = savedOrder[o];
            if (known[savedKey] && order.indexOf(savedKey) < 0) {
                order.push(savedKey);
            }
        }
        for (let n = 0; n < list.length; n++) {
            if (order.indexOf(list[n].key) < 0) {
                order.push(list[n].key);
            }
        }
        state.order = order;
        for (let i = 0; i < list.length; i++) {
            const key = list[i].key;
            const invested = Math.floor(Number(state.invested[key]));
            state.invested[key] = Number.isFinite(invested) && invested > 0 ? invested : 0;
            let level = Math.floor(Number(state.level[key]));
            if (!Number.isFinite(level) || level < 0) {
                level = 0;
            }
            if (level > 10) {
                level = 10;
            }
            state.level[key] = level;
        }
        return state;
    },

    spec: function(key) {
        const list = resortData.automationResources || [];
        for (let i = 0; i < list.length; i++) {
            if (list[i].key === key) {
                return list[i];
            }
        }
        return null;
    },

    orderedSpecs: function() {
        const list = resortData.automationResources || [];
        if (!data || !data.progress) {
            return list.slice();
        }
        const state = automation.ensure();
        const byKey = {};
        for (let i = 0; i < list.length; i++) {
            byKey[list[i].key] = list[i];
        }
        const out = [];
        const order = state.order || [];
        for (let i = 0; i < order.length; i++) {
            if (byKey[order[i]]) {
                out.push(byKey[order[i]]);
            }
        }
        return out.length ? out : list.slice();
    },

    moveResource: function(key, dir) {
        const order = automation.ensure().order;
        const index = order.indexOf(key);
        const next = index + dir;
        if (index < 0 || next < 0 || next >= order.length) {
            return;
        }
        const swap = order[index];
        order[index] = order[next];
        order[next] = swap;
    },

    placeResource: function(fromKey, toKey) {
        const order = automation.ensure().order;
        const from = order.indexOf(fromKey);
        const to = order.indexOf(toKey);
        if (from < 0 || to < 0 || from === to) {
            return;
        }
        const row = order.splice(from, 1)[0];
        order.splice(to, 0, row);
    },

    resourceName: function(key) {
        const spec = automation.spec(key);
        return spec ? spec.name : key;
    },

    xOf: function(key) {
        const state = automation.ensure();
        return (state.level[key] || 0) * 10;
    },

    yOf: function(key) {
        const spec = automation.spec(key);
        if (!spec) {
            return 0;
        }
        const state = automation.ensure();
        return (state.invested[key] || 0) * spec.multiplier;
    },

    levelCost: function(key) {
        const spec = automation.spec(key);
        if (!spec) {
            return 0;
        }
        const state = automation.ensure();
        return spec.baseCost * Math.pow(2, state.level[key] || 0);
    },

    positiveCosts: function(cost) {
        const out = [];
        if (!cost) {
            return out;
        }
        const list = automation.orderedSpecs();
        const seen = {};
        for (let i = 0; i < list.length; i++) {
            const key = list[i].key;
            const amount = cost[key] || 0;
            if (amount > 0) {
                out.push({ key: key, amount: amount });
                seen[key] = true;
            }
        }
        const keys = Object.keys(cost);
        for (let k = 0; k < keys.length; k++) {
            const key = keys[k];
            const amount = cost[key] || 0;
            if (amount > 0 && !seen[key]) {
                out.push({ key: key, amount: amount, unsupported: true });
            }
        }
        return out;
    },

    costIsSupported: function(cost) {
        const parts = automation.positiveCosts(cost);
        if (!parts.length) {
            return false;
        }
        for (let i = 0; i < parts.length; i++) {
            if (parts[i].unsupported || !automation.spec(parts[i].key)) {
                return false;
            }
        }
        return true;
    },

    yCovers: function(cost) {
        const parts = automation.positiveCosts(cost);
        if (!automation.costIsSupported(cost)) {
            return false;
        }
        for (let i = 0; i < parts.length; i++) {
            if (automation.yOf(parts[i].key) + 1e-6 < parts[i].amount) {
                return false;
            }
        }
        return true;
    },

    available: function(key) {
        let owned = resortData.ownedAmountForCostKey(key) || 0;
        if (key === "mana") {
            const garden = data.progress.base && data.progress.base.garden;
            if (garden && garden.reserveCloneManaForAutobuy && typeof bonfire !== "undefined" && bonfire.getCreateClonePlan) {
                const reserved = bonfire.getCreateClonePlan().manaCost || 0;
                owned = Math.max(0, owned - reserved);
            }
        }
        return owned;
    },

    zeroPurchaseCounters: function(node) {
        if (!node || typeof node !== "object") {
            return;
        }
        const keys = Object.keys(node);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = node[key];
            if (key === "prayerDonations" && value && typeof value === "object") {
                const donationKeys = Object.keys(value);
                for (let d = 0; d < donationKeys.length; d++) {
                    if (typeof value[donationKeys[d]] === "number") {
                        value[donationKeys[d]] = 0;
                    }
                }
                continue;
            }
            if (key === "prayerStatues" && value && typeof value === "object") {
                const statueKeys = Object.keys(value);
                for (let s = 0; s < statueKeys.length; s++) {
                    const statue = value[statueKeys[s]];
                    if (statue && typeof statue.bought === "number") {
                        statue.bought = 0;
                    }
                }
                continue;
            }
            if (/Bought$/.test(key) && typeof value === "number") {
                node[key] = 0;
                continue;
            }
            if (value && typeof value === "object") {
                automation.zeroPurchaseCounters(value);
            }
        }
    },

    ensureBaseCosts: function() {
        if (automation._baseCostsReady || !data || !data.progress || !resortData.buildings) {
            return;
        }
        const saved = data.progress;
        let clone = null;
        try {
            clone = structuredClone(saved);
            automation.zeroPurchaseCounters(clone);
        } catch (e) {
            clone = null;
        }
        if (clone) {
            data.progress = clone;
        }
        try {
            const buildingKeys = Object.keys(resortData.buildings);
            for (let b = 0; b < buildingKeys.length; b++) {
                const scope = buildingKeys[b];
                const cfg = resortData.buildings[scope];
                if (!cfg || !cfg.upgrades) {
                    continue;
                }
                const upgradeKeys = Object.keys(cfg.upgrades);
                for (let u = 0; u < upgradeKeys.length; u++) {
                    const upgradeKey = upgradeKeys[u];
                    const up = cfg.upgrades[upgradeKey];
                    const id = scope + ":" + upgradeKey;
                    automation._baseCosts[id] = automation.readBaseCost(up, upgradeKey, !!clone);
                }
            }
        } finally {
            data.progress = saved;
            automation._baseCostsReady = true;
        }
    },

    readBaseCost: function(up, upgradeKey, allowGetCost) {
        if (!up) {
            return null;
        }
        const donationBase = resortData.prayerDonationBaseCost(upgradeKey);
        if (donationBase) {
            return donationBase;
        }
        if (up.automationBaseCost) {
            return Object.assign({}, up.automationBaseCost);
        }
        if (!allowGetCost || typeof up.getCost !== "function") {
            return up.cost ? Object.assign({}, up.cost) : null;
        }
        try {
            const cost = up.getCost();
            return cost ? Object.assign({}, cost) : null;
        } catch (e) {
            return null;
        }
    },

    baseCostFor: function(scope, upgradeKey) {
        automation.ensureBaseCosts();
        return automation._baseCosts[scope + ":" + upgradeKey] || null;
    },

    currentUpgradeCost: function(scope, upgradeKey) {
        const cfg = resortData.buildings[scope];
        const up = cfg && cfg.upgrades && cfg.upgrades[upgradeKey];
        if (!up) {
            return null;
        }
        try {
            if (typeof up.getCost === "function") {
                return up.getCost() || null;
            }
        } catch (e) {
            return null;
        }
        return up.cost || null;
    },

    upgradeExcluded: function(scope, upgradeKey) {
        if (scope === "path" || upgradeKey === "fillMana") {
            return true;
        }
        if (resortData.isPrayerStatueUpgradeKey(upgradeKey)) {
            return true;
        }
        const cfg = resortData.buildings[scope];
        const up = cfg && cfg.upgrades && cfg.upgrades[upgradeKey];
        return !up || !!up.directWeave;
    },

    upgradeHasControls: function(scope, upgradeKey) {
        const order = resortData.baseBuildingOrder || [];
        if (order.indexOf(scope) < 0 || automation.upgradeExcluded(scope, upgradeKey)) {
            return false;
        }
        return automation.costIsSupported(automation.baseCostFor(scope, upgradeKey));
    },

    upgradeShowsControl: function(scope, upgradeKey) {
        if (!automation.upgradeHasControls(scope, upgradeKey)) {
            return false;
        }
        return automation.yCovers(automation.baseCostFor(scope, upgradeKey));
    },

    upgradeDimmed: function(scope, upgradeKey) {
        const cost = automation.currentUpgradeCost(scope, upgradeKey) || automation.baseCostFor(scope, upgradeKey);
        return automation.costDimmed(cost);
    },

    buildingHasControls: function(unlockKey) {
        const cost = resortData.getFoxDenConstructionCost(unlockKey);
        return automation.costIsSupported(cost);
    },

    buildingShowsControl: function(unlockKey) {
        if (!automation.buildingHasControls(unlockKey)) {
            return false;
        }
        return automation.yCovers(resortData.getFoxDenConstructionCost(unlockKey));
    },

    buildingDimmed: function(unlockKey) {
        return automation.costDimmed(resortData.getFoxDenConstructionCost(unlockKey));
    },

    costDimmed: function(cost) {
        const parts = automation.positiveCosts(cost);
        for (let i = 0; i < parts.length; i++) {
            if (parts[i].unsupported) {
                continue;
            }
            if (automation.xOf(parts[i].key) <= 0) {
                return true;
            }
        }
        return false;
    },

    normalizePct: function(pct) {
        const n = Math.floor(Number(pct));
        if (n === 10 || n === 50 || n === 100) {
            return n;
        }
        return 100;
    },

    getUpgradeSetting: function(scope, upgradeKey) {
        const state = automation.ensure();
        const saved = state.upgrades[scope + ":" + upgradeKey];
        if (!saved) {
            return { on: false, pct: 100 };
        }
        return { on: !!saved.on, pct: automation.normalizePct(saved.pct) };
    },

    setUpgradeSetting: function(scope, upgradeKey, patch) {
        const state = automation.ensure();
        const current = automation.getUpgradeSetting(scope, upgradeKey);
        state.upgrades[scope + ":" + upgradeKey] = {
            on: patch.on === undefined ? current.on : !!patch.on,
            pct: patch.pct === undefined ? current.pct : automation.normalizePct(patch.pct)
        };
    },

    getBuildingSetting: function(unlockKey) {
        const state = automation.ensure();
        const saved = state.buildings[unlockKey];
        if (!saved) {
            return { on: false, pct: 100 };
        }
        return { on: !!saved.on, pct: automation.normalizePct(saved.pct) };
    },

    setBuildingSetting: function(unlockKey, patch) {
        const state = automation.ensure();
        const current = automation.getBuildingSetting(unlockKey);
        state.buildings[unlockKey] = {
            on: patch.on === undefined ? current.on : !!patch.on,
            pct: patch.pct === undefined ? current.pct : automation.normalizePct(patch.pct)
        };
    },

    upgradeControlIds: function(scope, upgradeKey) {
        const cfg = resortData.buildings[scope];
        const up = cfg && cfg.upgrades && cfg.upgrades[upgradeKey];
        const slug = up ? resortData.slug(up) : upgradeKey;
        const prefix = "base_" + scope + "_paperauto_" + slug;
        return {
            row: prefix + "_row",
            chk: prefix + "_chk",
            pct: prefix + "_pct"
        };
    },

    buildingControlIds: function(unlockKey) {
        const prefix = "foxDenPaperAuto_" + unlockKey;
        return {
            row: prefix + "_row",
            chk: prefix + "_chk",
            pct: prefix + "_pct"
        };
    },

    stepRate: function(pct, dir) {
        const order = [10, 50, 100];
        let index = order.indexOf(automation.normalizePct(pct));
        if (index < 0) {
            index = order.length - 1;
        }
        const next = index + (dir < 0 ? -1 : 1);
        if (next < 0 || next >= order.length) {
            return order[index];
        }
        return order[next];
    },

    controlsHtml: function(ids, checkHandler, stepHandler) {
        return `<span id="${ids.row}" class="paper-autobuy-controls" style="display:none"><label><input type="checkbox" id="${ids.chk}" onchange="${checkHandler}"> Autobuy</label><button type="button" class="tab-button paper-autobuy-step" onclick="${stepHandler}-1)">&lt;</button><span id="${ids.pct}">100%</span><button type="button" class="tab-button paper-autobuy-step" onclick="${stepHandler}1)">&gt;</button></span>`;
    },

    upgradeControlsHtml: function(scope, upgradeKey) {
        if (!automation.upgradeHasControls(scope, upgradeKey)) {
            return "";
        }
        const ids = automation.upgradeControlIds(scope, upgradeKey);
        return automation.controlsHtml(
            ids,
            "events.automationSetUpgradeChecked('" + scope + "','" + upgradeKey + "', this.checked)",
            "events.automationStepUpgradeRate('" + scope + "','" + upgradeKey + "', "
        );
    },

    buildingControlsHtml: function(unlockKey) {
        if (!automation.buildingHasControls(unlockKey)) {
            return "";
        }
        const ids = automation.buildingControlIds(unlockKey);
        return automation.controlsHtml(
            ids,
            "events.automationSetBuildingChecked('" + unlockKey + "', this.checked)",
            "events.automationStepBuildingRate('" + unlockKey + "', "
        );
    },

    addPaper: function(key, amount) {
        if (!automation.spec(key)) {
            return;
        }
        const whole = Math.floor(Number(amount));
        const owned = Math.floor((data.progress && data.progress.paper) || 0);
        if (!Number.isFinite(whole) || whole < 1 || whole > owned) {
            return;
        }
        data.progress.paper = (data.progress.paper || 0) - whole;
        const state = automation.ensure();
        state.invested[key] = (state.invested[key] || 0) + whole;
    },

    buyLevel: function(key) {
        const spec = automation.spec(key);
        if (!spec) {
            return;
        }
        const state = automation.ensure();
        const level = state.level[key] || 0;
        if (level >= 10) {
            return;
        }
        const cost = spec.baseCost * Math.pow(2, level);
        const paper = (data.progress && data.progress.paper) || 0;
        if (paper < cost) {
            return;
        }
        data.progress.paper = paper - cost;
        state.level[key] = level + 1;
    },

    formatAmount: function(amount) {
        if (typeof intToStringRound === "function") {
            return intToStringRound(amount);
        }
        return String(amount);
    },

    walk: function() {
        const out = [];
        const order = resortData.baseBuildingOrder || [];
        const rh = data.progress.base && data.progress.base.foxDen;
        const unlocks = (rh && rh.unlocks) || {};
        for (let i = 0; i < order.length; i++) {
            const buildingKey = order[i];
            const bdef = resortData.buildings[buildingKey];
            if (!bdef) {
                continue;
            }
            if (bdef.constructionCost && !unlocks[buildingKey]) {
                out.push({ kind: "building", key: buildingKey });
            }
            if (!bdef.upgrades || !bdef.upgradesOrder) {
                continue;
            }
            for (let u = 0; u < bdef.upgradesOrder.length; u++) {
                out.push({ kind: "upgrade", scope: buildingKey, key: bdef.upgradesOrder[u] });
            }
        }
        return out;
    },

    candidateName: function(candidate) {
        if (!candidate) {
            return "";
        }
        if (candidate.kind === "building") {
            const bdef = resortData.buildings[candidate.key];
            return "Build " + ((bdef && bdef.label) || candidate.key);
        }
        const cfg = resortData.buildings[candidate.scope];
        const up = cfg && cfg.upgrades && cfg.upgrades[candidate.key];
        return (up && up.name) || candidate.key;
    },

    settingFor: function(candidate) {
        if (candidate.kind === "building") {
            return automation.getBuildingSetting(candidate.key);
        }
        return automation.getUpgradeSetting(candidate.scope, candidate.key);
    },

    showsFor: function(candidate) {
        if (candidate.kind === "building") {
            return automation.buildingShowsControl(candidate.key);
        }
        return automation.upgradeShowsControl(candidate.scope, candidate.key);
    },

    upgradeInProgress: function(scope, upgradeKey) {
        if (typeof engine.getUpgradeGatherJob === "function" && engine.getUpgradeGatherJob(scope, upgradeKey)) {
            return true;
        }
        const active = engine.getWeavingState().active;
        if (active && active.scopeKey === scope && active.upgradeKey === upgradeKey) {
            return true;
        }
        return !!engine.getPausedWeavingEntry(scope, upgradeKey);
    },

    buildingInProgress: function(unlockKey) {
        const rh = data.progress.base && data.progress.base.foxDen;
        const site = rh && rh.constructionSites && rh.constructionSites[unlockKey];
        return !!(site && site.status === "building");
    },

    isCheckedShown: function(candidate) {
        if (!automation.showsFor(candidate)) {
            return false;
        }
        return !!automation.settingFor(candidate).on;
    },

    isStructural: function(candidate) {
        if (!automation.isCheckedShown(candidate)) {
            return false;
        }
        if (candidate.kind === "building") {
            if (typeof engine.isFoxDenUnlockRowVisible === "function" && !engine.isFoxDenUnlockRowVisible(candidate.key)) {
                return false;
            }
            if (automation.buildingInProgress(candidate.key)) {
                return false;
            }
            return true;
        }
        const cfg = resortData.buildings[candidate.scope];
        const up = cfg && cfg.upgrades && cfg.upgrades[candidate.key];
        if (!up || automation.upgradeExcluded(candidate.scope, candidate.key)) {
            return false;
        }
        const hideMaxed = !!(data.progress.options && data.progress.options.hideMaxedUpgrades);
        if (!resortData.isUpgradeRowVisible(up, hideMaxed)) {
            return false;
        }
        if (resortData.isUpgradeSoldOut(up)) {
            return false;
        }
        if (typeof up.canBuy === "function" && !up.canBuy()) {
            return false;
        }
        if (automation.upgradeInProgress(candidate.scope, candidate.key)) {
            return false;
        }
        return true;
    },

    currentCostFor: function(candidate) {
        if (candidate.kind === "building") {
            return resortData.getFoxDenConstructionCost(candidate.key);
        }
        return automation.currentUpgradeCost(candidate.scope, candidate.key);
    },

    resourceBlock: function(candidate) {
        const cost = automation.currentCostFor(candidate);
        const parts = automation.positiveCosts(cost);
        if (!parts.length || !automation.costIsSupported(cost)) {
            return "its cost includes a resource automation cannot cover.";
        }
        const setting = automation.settingFor(candidate);
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const y = automation.yOf(part.key);
            if (y + 1e-6 < part.amount) {
                return automation.resourceName(part.key) + " Y is " + automation.formatAmount(y) + ", next cost is " + automation.formatAmount(part.amount) + ".";
            }
        }
        for (let j = 0; j < parts.length; j++) {
            const part = parts[j];
            const x = automation.xOf(part.key);
            const fraction = (x / 100) * (setting.pct / 100);
            const have = automation.available(part.key);
            const haveText = automation.formatAmount(have);
            const name = automation.resourceName(part.key);
            if (!(fraction > 0)) {
                return "have " + haveText + " " + name + ", X is 0%.";
            }
            const need = part.amount / fraction;
            if (have + 1e-6 < need) {
                return "have " + haveText + " " + name + ", need " + automation.formatAmount(Math.ceil(need - 1e-6)) + ".";
            }
        }
        return "";
    },

    denBlockReason: function() {
        const rh = data.progress.base && data.progress.base.foxDen;
        if (!rh) {
            return "the Fox Den is not available";
        }
        if (rh.jobQueue && rh.jobQueue.length > 0) {
            return "the Fox Den queue is not empty";
        }
        const jobs = rh.upgradeGatherJobs || {};
        const jobKeys = Object.keys(jobs);
        for (let i = 0; i < jobKeys.length; i++) {
            const job = jobs[jobKeys[i]];
            if (!job) {
                continue;
            }
            if (job.paused || job.status === "gathering") {
                return "the Fox Den queue is not empty";
            }
            if (job.status === "ready") {
                return "a gather is ready to weave";
            }
        }
        const sites = rh.constructionSites || {};
        const siteKeys = Object.keys(sites);
        for (let s = 0; s < siteKeys.length; s++) {
            const site = sites[siteKeys[s]];
            if (site && site.status === "building") {
                return "the Fox Den queue is not empty";
            }
        }
        if (engine.getWeavingState().active) {
            return "the Okami is weaving";
        }
        return "";
    },

    statusText: function() {
        const walked = automation.walk();
        let anyChecked = false;
        let first = null;
        for (let i = 0; i < walked.length; i++) {
            if (!automation.isCheckedShown(walked[i])) {
                continue;
            }
            anyChecked = true;
            if (automation.isStructural(walked[i])) {
                first = walked[i];
                break;
            }
        }
        if (!first) {
            return anyChecked
                ? "Selected autobuys are already in progress or unavailable."
                : "No autobuy is selected.";
        }
        const name = automation.candidateName(first);
        if (!automation.ensure().enabled) {
            return name + " — autobuy is off.";
        }
        const den = automation.denBlockReason();
        if (den) {
            return name + " — " + den + ".";
        }
        for (let i = 0; i < walked.length; i++) {
            if (!automation.isStructural(walked[i])) {
                continue;
            }
            if (!automation.resourceBlock(walked[i])) {
                return automation.candidateName(walked[i]) + " — ready to buy.";
            }
        }
        const resource = automation.resourceBlock(first);
        return name + " — " + (resource || "ready to buy.");
    },

    enqueue: function(candidate) {
        if (candidate.kind === "building") {
            return engine.planFoxDenConstruction(candidate.key);
        }
        if (!engine.enqueueUpgradeGather(candidate.scope, candidate.key)) {
            return false;
        }
        const job = engine.getUpgradeGatherJob(candidate.scope, candidate.key);
        if (job && job.status === "ready" && !engine.getWeavingState().active) {
            engine.startUpgradeWeave(candidate.scope, candidate.key);
        }
        return true;
    },

    resumeReadyWeave: function() {
        if (engine.getWeavingState().active) {
            return false;
        }
        const rh = data.progress.base && data.progress.base.foxDen;
        const jobs = (rh && rh.upgradeGatherJobs) || {};
        const jobKeys = Object.keys(jobs);
        for (let i = 0; i < jobKeys.length; i++) {
            const job = jobs[jobKeys[i]];
            if (!job || job.status !== "ready" || !job.scopeKey || !job.upgradeKey) {
                continue;
            }
            if (!automation.getUpgradeSetting(job.scopeKey, job.upgradeKey).on) {
                continue;
            }
            if (!automation.upgradeShowsControl(job.scopeKey, job.upgradeKey)) {
                continue;
            }
            return engine.startUpgradeWeave(job.scopeKey, job.upgradeKey);
        }
        return false;
    },

    tryBuy: function() {
        if (!data || !data.progress || !data.progress.base || !data.progress.base.foxDen) {
            return;
        }
        if (!automation.ensure().enabled) {
            return;
        }
        if (automation.resumeReadyWeave()) {
            return;
        }
        if (automation.denBlockReason()) {
            return;
        }
        const walked = automation.walk();
        for (let i = 0; i < walked.length; i++) {
            if (!automation.isStructural(walked[i]) || automation.resourceBlock(walked[i])) {
                continue;
            }
            automation.enqueue(walked[i]);
            return;
        }
    },

    resetOfflineCounter: function() {
        automation._offlineSeconds = 0;
    },

    onSecond: function() {
        if (typeof isProcessingOffline !== "undefined" && isProcessingOffline) {
            automation._offlineSeconds += 1;
            if (automation._offlineSeconds % 10 !== 0) {
                return;
            }
        }
        automation.tryBuy();
    }
};
