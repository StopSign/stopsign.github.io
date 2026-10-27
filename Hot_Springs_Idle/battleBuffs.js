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
        description: "Incoming damage is multiplied by 1 / (1 + 0.03 x stacks). Each stack expires on its own timer."
    },
    outrage: {
        key: "outrage",
        label: "Outrage",
        img: "img/outrage.svg",
        kind: "counter",
        description: "When Outrage is 10 or higher, your next slap or sandal spends 10. That attack's cooldown is halved, and when it lands you gain 50% of the coins that intruder would drop. That coin gain counts for other skills that trigger when coins are gained."
    },
    malice: {
        key: "malice",
        label: "Malice",
        img: "img/malice.svg",
        kind: "counter",
        description: "Builds a Malice counter, leading to 10% more damage on the next strike, increasing +10% per 20 stacks. Malice is capped at 10 + Okami's level x 5."
    },
    fakeTears: {
        key: "fakeTears",
        label: "Fake Tears",
        img: "img/fakeTears.svg",
        kind: "counter",
        description: "Incoming damage is divided by 1 + 0.05 x Fake Tears. Each damaging attack removes half of Fake Tears. Only integers of Fake Tears count. Fake Tears is capped at 5 + floor(Orb level / 2)."
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
            tooltipExtra = `Counter: ${round2(counter)}<br>Cap: ${round2(cap)} (10 + Okami level x 5)<br>Next attack: +${strikePct}% damage${bonus.consume > 0 ? `, consume ${bonus.consume}` : " (need 1 Malice)"}`;
        } else if (key === "outrage") {
            const counter = entry.counter || 0;
            const cap = battleBuffs.getOutrageCap();
            const ready = counter >= 10;
            bottomRight = intToString(counter, 1);
            topRight = ready ? "/2" : "";
            tooltipExtra = `Counter: ${round2(counter)}<br>Cap: ${round2(cap)} (10 + The Orb level)<br>${ready ? "Next slap or sandal spends 10: cooldown halved, and that hit pays 50% of the target's kill coins." : "At 10 or more, the next slap or sandal spends 10."}`;
        } else if (key === "fakeTears") {
            const counter = entry.counter || 0;
            const whole = battleBuffs.getFakeTearsWhole(counter);
            const cap = battleBuffs.getFakeTearsCap();
            const removed = battleBuffs.getFakeTearsRemoved(counter);
            const divisor = battleBuffs.formatFakeTearsDivisor(whole);
            bottomRight = intToString(counter, 2);
            topRight = whole > 0 ? `/${divisor}` : "";
            tooltipExtra = `Counter: ${round2(counter)}<br>Cap: ${cap} (5 + floor(Orb level / 2))<br>` +
                (removed > 0
                    ? `Incoming: / ${divisor} from ${whole} whole<br>Next Audacity loss removes ${removed}`
                    : `Incoming: / ${divisor} (need 1 whole Fake Tears)`);
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
            }
        }
        battleBuffs.clampCappedBuffs(state);
        battleBuffs.pruneQueue(state);
    },
    getOkamiLevel: function() {
        const okami = data.progress && data.progress.okami;
        return (okami && okami.level) || 0;
    },
    getFakeTearsCap: function() {
        const orb = data.progress.base && data.progress.base.mage_tower;
        return 5 + Math.floor(((orb && orb.level) || 0) / 2);
    },
    getFakeTearsWhole: function(counter) {
        const n = counter || 0;
        if (n <= 0) {
            return 0;
        }
        return Math.floor(n);
    },
    /** Amount removed on Audacity loss: half of floor(counter), rounded up. Fractions stay. */
    getFakeTearsRemoved: function(counter) {
        return Math.ceil(battleBuffs.getFakeTearsWhole(counter) / 2);
    },
    formatFakeTearsDivisor: function(whole) {
        return ((100 + (whole || 0) * 5) / 100).toFixed(2);
    },
    getMaliceCap: function() {
        return 10 + (battleBuffs.getOkamiLevel() * 5);
    },
    getOutrageCap: function() {
        const orb = data.progress.base && data.progress.base.mage_tower;
        return 10 + ((orb && orb.level) || 0);
    },
    clampCappedBuffs: function(state) {
        const tears = state.byKey.fakeTears;
        const tearsCap = battleBuffs.getFakeTearsCap();
        if (tears && (tears.counter || 0) > tearsCap) {
            tears.counter = tearsCap;
        }
        const malice = state.byKey.malice;
        const maliceCap = battleBuffs.getMaliceCap();
        if (malice && (malice.counter || 0) > maliceCap) {
            malice.counter = maliceCap;
        }
        const outrage = state.byKey.outrage;
        const outrageCap = battleBuffs.getOutrageCap();
        if (outrage && (outrage.counter || 0) > outrageCap) {
            outrage.counter = outrageCap;
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
    /** Returns the stacks that actually stuck, after the max-Audacity cap. */
    addCloutStacks: function(amount) {
        if (!amount || amount <= 0) {
            return 0;
        }
        const state = battleBuffs.getState();
        if (!state.byKey.clout) {
            state.byKey.clout = { stacks: 0, lastNegation: 0 };
        }
        const before = state.byKey.clout.stacks || 0;
        const maxAud = (data.battle && data.battle.player && data.battle.player.maxAud) || 0;
        const cap = Math.max(0, maxAud);
        const next = before + amount;
        state.byKey.clout.stacks = cap > 0 ? Math.min(next, cap) : next;
        battleBuffs.ensureInQueue(state, "clout");
        return Math.max(0, (state.byKey.clout.stacks || 0) - before);
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
    addOutrage: function(amount) {
        if (!amount || amount <= 0) {
            return;
        }
        const state = battleBuffs.getState();
        if (!state.byKey.outrage) {
            state.byKey.outrage = { counter: 0 };
        }
        state.byKey.outrage.counter = Math.min(battleBuffs.getOutrageCap(), (state.byKey.outrage.counter || 0) + amount);
        battleBuffs.ensureInQueue(state, "outrage");
    },
    /** Spend 10 Outrage when the counter is at least 10. Returns true if spent. */
    trySpendOutrage: function() {
        const state = battleBuffs.getState();
        const entry = state.byKey.outrage;
        const counter = entry ? (entry.counter || 0) : 0;
        if (counter < 10) {
            return false;
        }
        entry.counter = counter - 10;
        battleBuffs.pruneQueue(state);
        return true;
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
    addFakeTears: function(amount) {
        if (!amount || amount <= 0) {
            return;
        }
        const state = battleBuffs.getState();
        if (!state.byKey.fakeTears) {
            state.byKey.fakeTears = { counter: 0 };
        }
        const cap = battleBuffs.getFakeTearsCap();
        state.byKey.fakeTears.counter = Math.min(cap, (state.byKey.fakeTears.counter || 0) + amount);
        battleBuffs.ensureInQueue(state, "fakeTears");
    },
    getFakeTearsDamageMultiplier: function() {
        const state = battleBuffs.getState();
        const entry = state.byKey.fakeTears;
        const whole = battleBuffs.getFakeTearsWhole(entry ? entry.counter : 0);
        if (whole <= 0) {
            return 1;
        }
        return 100 / (100 + whole * 5);
    },
    consumeFakeTearsOnAudacityLoss: function() {
        const state = battleBuffs.getState();
        const entry = state.byKey.fakeTears;
        if (!entry) {
            return;
        }
        const removed = battleBuffs.getFakeTearsRemoved(entry.counter);
        if (removed <= 0) {
            return;
        }
        entry.counter = Math.max(0, (entry.counter || 0) - removed);
        battleBuffs.pruneQueue(state);
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
