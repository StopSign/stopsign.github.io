/**
 * Battlefield buff definitions, state, queue, display, and tick logic.
 */

var BATTLE_BUFF_KEYS = ["fury", "desensitized", "outrage", "malice", "fakeTears", "clout"];

var battleBuffDefs = {
    fury: {
        key: "fury",
        label: "Fury",
        img: "img/fury.svg",
        kind: "stackUntilAttack",
        description: "Your next strike deals +1% damage per stack. All stacks are consumed when you attack."
    },
    desensitized: {
        key: "desensitized",
        label: "Desensitized",
        img: "img/desensitized.svg",
        kind: "stackTimed",
        description: "Incoming damage is multiplied by 1 / (1 + 0.03 × stacks). Each stack expires on its own timer."
    },
    outrage: {
        key: "outrage",
        label: "Outrage",
        img: "img/outrage.svg",
        kind: "duration",
        effectPercent: 50,
        description: "Your attack timer recharges 50% faster while active. Its timer counts down only while your slap cooldown is not full. Additional time extends the buff. Duration is capped at 2 seconds + Okami's level / 5."
    },
    malice: {
        key: "malice",
        label: "Malice",
        img: "img/malice.svg",
        kind: "counter",
        description: "Builds a Malice counter, leading to 10% more damage on the next strike, increasing +10% per 20 stacks. Malice is capped at 10 + Okami's level × 5."
    },
    fakeTears: {
        key: "fakeTears",
        label: "Fake Tears",
        img: "img/fakeTears.svg",
        kind: "duration",
        effectPercent: 20,
        description: "You take 20% less damage while active. Additional time extends the buff. Duration is capped at 10 seconds + Okami's level."
    },
    clout: {
        key: "clout",
        label: "Clout",
        img: "img/clout.svg",
        kind: "stackUntilDamage",
        description: "Each stack blocks 1 incoming damage. Stacks consumed equal damage prevented."
    }
};

var battleBuffs = {
    initState: function() {
        return {
            queue: [],
            byKey: {}
        };
    },
    getState: function() {
        if (!data.battle.buffs) {
            data.battle.buffs = battleBuffs.initState();
        }
        return data.battle.buffs;
    },
    ensureInQueue: function(state, key) {
        if (state.queue.indexOf(key) >= 0) {
            return;
        }
        state.queue.push(key);
    },
    isBuffActive: function(key, entry) {
        if (!entry) {
            return false;
        }
        const def = battleBuffDefs[key];
        if (!def) {
            return false;
        }
        if (def.kind === "stackUntilAttack" || def.kind === "stackUntilDamage" || def.kind === "counter") {
            return (entry.stacks || entry.counter || 0) > 0;
        }
        if (def.kind === "stackTimed") {
            return entry.stacks && entry.stacks.length > 0;
        }
        if (def.kind === "duration") {
            return (entry.remainingMs || 0) > 0;
        }
        return false;
    },
    pruneQueue: function(state) {
        const next = [];
        for (let i = 0; i < state.queue.length; i++) {
            const key = state.queue[i];
            if (battleBuffs.isBuffActive(key, state.byKey[key])) {
                next.push(key);
            } else {
                delete state.byKey[key];
            }
        }
        state.queue = next;
    },
    formatBuffRemainingLabel: function(remainingMs) {
        return intToString(Math.max(0, remainingMs/1000), 1) + "s";
    },
    getDesensitizedReductionPercent: function(stackCount) {
        if (!stackCount || stackCount <= 0) {
            return 0;
        }
        return (1 - (1 / (1 + 0.03 * stackCount))) * 100;
    },
    getDesensitizedStackStats: function(stacks) {
        if (!stacks || stacks.length === 0) {
            return { longestMs: 0, averageMs: 0 };
        }
        let sum = 0;
        let longest = 0;
        for (let i = 0; i < stacks.length; i++) {
            const ms = Math.max(0, stacks[i].remainingMs || 0);
            sum += ms;
            if (ms > longest) {
                longest = ms;
            }
        }
        return {
            longestMs: longest,
            averageMs: sum / stacks.length
        };
    },
    buildDisplayEntry: function(key, entry) {
        const def = battleBuffDefs[key];
        if (!def || !entry) {
            return null;
        }
        let topRight = "";
        let bottomRight = "";
        let tooltipExtra = "";

        if (key === "fury") {
            const stacks = entry.stacks || 0;
            bottomRight = intToString(stacks, 1);
            topRight = intToString(stacks, 1);
            tooltipExtra = `Stacks: ${stacks}<br>Next hit: +${stacks}% damage`;
        } else if (key === "desensitized") {
            const stacks = entry.stacks || [];
            const count = stacks.length;
            const reduction = battleBuffs.getDesensitizedReductionPercent(count);
            const stats = battleBuffs.getDesensitizedStackStats(stacks);
            bottomRight = intToString(count, 1);
            topRight = `${round2(reduction)}%`;
            tooltipExtra = `Stacks: ${count}<br>Combined reduction: ${round2(reduction)}%<br>Longest stack: ${battleBuffs.formatBuffRemainingLabel(stats.longestMs)}<br>Average time left: ${battleBuffs.formatBuffRemainingLabel(stats.averageMs)}`;
        } else if (key === "malice") {
            const counter = entry.counter || 0;
            const bonus = battleBuffs.getMaliceAttackBonus(counter);
            const strikePct = Math.round((bonus.mult - 1) * 100);
            const cap = battleBuffs.getMaliceCap();
            bottomRight = intToString(counter, 1);
            topRight = `+${strikePct}%`;
            tooltipExtra = `Counter: ${round2(counter)}<br>Cap: ${round2(cap)} (10 + Okami level × 5)<br>Next attack: +${strikePct}% damage${bonus.consume > 0 ? `, consume ${bonus.consume}` : " (need 1 Malice)"}`;
        } else if (key === "outrage" || key === "fakeTears") {
            const pct = def.effectPercent || 0;
            const capMs = key === "fakeTears" ? battleBuffs.getFakeTearsCapMs() : battleBuffs.getOutrageCapMs();
            const capRule = key === "fakeTears" ? "10s + Okami level" : "2s + Okami level / 5";
            bottomRight = battleBuffs.formatBuffRemainingLabel(entry.remainingMs || 0);
            topRight = `${pct}%`;
            tooltipExtra = `Effect: ${pct}%<br>Time left: ${battleBuffs.formatBuffRemainingLabel(entry.remainingMs || 0)}<br>Cap: ${battleBuffs.formatDurationCapLabel(capMs)} (${capRule})`;
        } else if (key === "clout") {
            const stacks = entry.stacks || 0;
            bottomRight = intToString(stacks, 2);
            const neg = entry.lastNegation || 0;
            topRight = neg > 0 ? `-${intToString(neg, 2)}` : "";
            tooltipExtra = `Stacks: ${intToString(stacks, 2)}<br>Last negation: ${neg > 0 ? `-${intToString(neg, 2)}` : "-"}<br>1 damage blocked per stack consumed`;
        }

        const desc = (typeof skills !== "undefined" && skills.buffDescriptions && skills.buffDescriptions[def.label])
            ? skills.buffDescriptions[def.label]
            : (def.description || "");
        const tooltipHtml = `<strong>${def.label}</strong><br>${desc}<br><br>${tooltipExtra}`;
        return {
            key: key,
            label: def.label,
            img: def.img,
            topRight: topRight,
            bottomRight: bottomRight,
            tooltipHtml: tooltipHtml
        };
    },
    getDisplayList: function(state) {
        const out = [];
        for (let i = 0; i < state.queue.length; i++) {
            const key = state.queue[i];
            const entry = state.byKey[key];
            if (!battleBuffs.isBuffActive(key, entry)) {
                continue;
            }
            const display = battleBuffs.buildDisplayEntry(key, entry);
            if (display) {
                out.push(display);
            }
        }
        return out;
    },
    tick: function(tickMs) {
        const state = battleBuffs.getState();
        const keys = Object.keys(state.byKey);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const entry = state.byKey[key];
            const def = battleBuffDefs[key];
            if (!entry || !def) {
                continue;
            }
            if (def.kind === "stackTimed" && entry.stacks) {
                const nextStacks = [];
                for (let j = 0; j < entry.stacks.length; j++) {
                    const stack = entry.stacks[j];
                    const remain = Math.max(0, (stack.remainingMs || 0) - tickMs);
                    if (remain > 0) {
                        nextStacks.push({ remainingMs: remain });
                    }
                }
                entry.stacks = nextStacks;
            } else if (def.kind === "duration") {
                // Outrage only drains while the slap cooldown bar is still filling.
                const outragePaused = key === "outrage"
                    && typeof engine !== "undefined"
                    && engine.slapAttackReady
                    && engine.slapAttackReady();
                if (!outragePaused) {
                    entry.remainingMs = Math.max(0, (entry.remainingMs || 0) - tickMs);
                }
            }
        }
        battleBuffs.clampCappedBuffs(state);
        battleBuffs.pruneQueue(state);
    },
    getOkamiLevel: function() {
        const okami = data.progress && data.progress.okami;
        return (okami && okami.level) || 0;
    },
    getFakeTearsCapMs: function() {
        return (10 + battleBuffs.getOkamiLevel()) * 1000;
    },
    getOutrageCapMs: function() {
        return 2000 + (battleBuffs.getOkamiLevel() * 200);
    },
    getMaliceCap: function() {
        return 10 + (battleBuffs.getOkamiLevel() * 5);
    },
    getDurationCapMs: function(key) {
        if (key === "fakeTears") {
            return battleBuffs.getFakeTearsCapMs();
        }
        if (key === "outrage") {
            return battleBuffs.getOutrageCapMs();
        }
        return null;
    },
    formatDurationCapLabel: function(ms) {
        return roundNearestDecimals(Math.max(0, ms) / 1000, 2) + "s";
    },
    clampCappedBuffs: function(state) {
        const tears = state.byKey.fakeTears;
        const tearsCap = battleBuffs.getFakeTearsCapMs();
        if (tears && (tears.remainingMs || 0) > tearsCap) {
            tears.remainingMs = tearsCap;
        }
        const outrage = state.byKey.outrage;
        const outrageCap = battleBuffs.getOutrageCapMs();
        if (outrage && (outrage.remainingMs || 0) > outrageCap) {
            outrage.remainingMs = outrageCap;
        }
        const malice = state.byKey.malice;
        const maliceCap = battleBuffs.getMaliceCap();
        if (malice && (malice.counter || 0) > maliceCap) {
            malice.counter = maliceCap;
        }
    },
    addFuryStacks: function(amount) {
        if (!amount || amount <= 0) {
            return;
        }
        const state = battleBuffs.getState();
        if (!state.byKey.fury) {
            state.byKey.fury = { stacks: 0 };
        }
        state.byKey.fury.stacks = (state.byKey.fury.stacks || 0) + amount;
        battleBuffs.ensureInQueue(state, "fury");
    },
    addDesensitizedStack: function(durationMs) {
        if (!durationMs || durationMs <= 0) {
            return;
        }
        const state = battleBuffs.getState();
        if (!state.byKey.desensitized) {
            state.byKey.desensitized = { stacks: [] };
        }
        if (!state.byKey.desensitized.stacks) {
            state.byKey.desensitized.stacks = [];
        }
        state.byKey.desensitized.stacks.push({ remainingMs: durationMs });
        battleBuffs.ensureInQueue(state, "desensitized");
    },
    addDurationMs: function(key, ms) {
        if (!ms || ms <= 0 || !battleBuffDefs[key]) {
            return;
        }
        const state = battleBuffs.getState();
        if (!state.byKey[key]) {
            state.byKey[key] = { remainingMs: 0 };
        }
        let next = (state.byKey[key].remainingMs || 0) + ms;
        const cap = battleBuffs.getDurationCapMs(key);
        if (cap !== null && next > cap) {
            next = cap;
        }
        state.byKey[key].remainingMs = next;
        battleBuffs.ensureInQueue(state, key);
    },
    addCloutStacks: function(amount) {
        if (!amount || amount <= 0) {
            return;
        }
        const state = battleBuffs.getState();
        if (!state.byKey.clout) {
            state.byKey.clout = { stacks: 0, lastNegation: 0 };
        }
        const maxAud = (data.battle && data.battle.player && data.battle.player.maxAud) || 0;
        const cap = Math.max(0, maxAud);
        const next = (state.byKey.clout.stacks || 0) + amount;
        state.byKey.clout.stacks = cap > 0 ? Math.min(next, cap) : next;
        battleBuffs.ensureInQueue(state, "clout");
    },
    consumeFuryOnAttack: function() {
        const state = battleBuffs.getState();
        const entry = state.byKey.fury;
        const stacks = entry ? (entry.stacks || 0) : 0;
        const mult = 1 + (stacks * 0.01);
        if (entry) {
            entry.stacks = 0;
        }
        battleBuffs.pruneQueue(state);
        return mult;
    },
    getFuryDamageMultiplier: function() {
        const state = battleBuffs.getState();
        const entry = state.byKey.fury;
        const stacks = entry ? (entry.stacks || 0) : 0;
        return 1 + (stacks * 0.01);
    },
    getDesensitizedIncomingMultiplier: function() {
        const state = battleBuffs.getState();
        const entry = state.byKey.desensitized;
        const count = entry && entry.stacks ? entry.stacks.length : 0;
        if (count <= 0) {
            return 1;
        }
        return 1 / (1 + 0.03 * count);
    },
    getOutrageRechargeMultiplier: function() {
        const state = battleBuffs.getState();
        const entry = state.byKey.outrage;
        if (entry && (entry.remainingMs || 0) > 0) {
            const pct = (battleBuffDefs.outrage && battleBuffDefs.outrage.effectPercent) || 0;
            return 1 + pct / 100;
        }
        return 1;
    },
    addMalice: function(amount) {
        if (!amount || amount <= 0) {
            return;
        }
        const state = battleBuffs.getState();
        if (!state.byKey.malice) {
            state.byKey.malice = { counter: 0 };
        }
        const cap = battleBuffs.getMaliceCap();
        state.byKey.malice.counter = Math.min(cap, (state.byKey.malice.counter || 0) + amount);
        battleBuffs.ensureInQueue(state, "malice");
    },
    getMaliceAttackBonus: function(counter) {
        const n = counter || 0;
        if (n < 1) {
            return { mult: 1, consume: 0, pct: 0 };
        }
        const steps = Math.floor(n / 20);
        const pct = 10 + (steps * 10);
        const consume = 1 + steps;
        return { mult: 1 + (pct / 100), consume: consume, pct: pct };
    },
    getMaliceDamageMultiplier: function() {
        const state = battleBuffs.getState();
        const entry = state.byKey.malice;
        const counter = entry ? (entry.counter || 0) : 0;
        return battleBuffs.getMaliceAttackBonus(counter).mult;
    },
    consumeMaliceOnAttack: function() {
        const state = battleBuffs.getState();
        const entry = state.byKey.malice;
        const counter = entry ? (entry.counter || 0) : 0;
        const bonus = battleBuffs.getMaliceAttackBonus(counter);
        if (entry && bonus.consume > 0) {
            entry.counter = Math.max(0, counter - bonus.consume);
        }
        battleBuffs.pruneQueue(state);
        return bonus.mult;
    },
    getFakeTearsDamageMultiplier: function() {
        const state = battleBuffs.getState();
        const entry = state.byKey.fakeTears;
        if (entry && (entry.remainingMs || 0) > 0) {
            return 0.8;
        }
        return 1;
    },
    applyCloutToIncomingDamage: function(damageAfterOtherMitigation) {
        const dmg = Math.max(0, damageAfterOtherMitigation || 0);
        if (dmg <= 0) {
            return 0;
        }
        const state = battleBuffs.getState();
        const entry = state.byKey.clout;
        const stacks = entry ? (entry.stacks || 0) : 0;
        if (stacks <= 0) {
            if (entry) {
                entry.lastNegation = 0;
            }
            return dmg;
        }
        const negated = Math.min(stacks, dmg);
        entry.stacks = stacks - negated;
        entry.lastNegation = negated;
        battleBuffs.pruneQueue(state);
        return dmg - negated;
    }
};
