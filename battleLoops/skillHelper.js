let skillHelper = {
    LEVELS: [0, 50, 100],
    displayOrder: [],
    defIndex: {},
    copyStatusTimer: 0,

    init: function() {
        if (typeof data === "undefined") {
            window.data = {
                gameSettings: { numberType: "numberSuffix" }
            };
        } else if (!data.gameSettings) {
            data.gameSettings = { numberType: "numberSuffix" };
        }
        const keys = skills.keysInOrder || [];
        skillHelper.defIndex = {};
        skillHelper.displayOrder = [];
        for (let i = 0; i < keys.length; i++) {
            skillHelper.defIndex[keys[i]] = i;
            skillHelper.displayOrder.push(keys[i]);
        }
        document.getElementById("shSortBtn").addEventListener("click", function() {
            skillHelper.sortByPriority();
        });
        document.getElementById("shCopyBtn").addEventListener("click", function() {
            skillHelper.copyExport();
        });
        document.getElementById("shSkillList").addEventListener("input", function(ev) {
            const el = ev.target;
            if (el && el.dataset && el.dataset.priorityKey) {
                skillHelper.renderExport();
            }
        });
        skillHelper.renderAll();
    },

    getPriorityValue: function(key) {
        const input = document.querySelector(`[data-priority-key="${key}"]`);
        if (input) {
            const n = parseFloat(input.value);
            return isFinite(n) ? n : 0;
        }
        const p = typeof SKILL_PRIORITY !== "undefined" ? SKILL_PRIORITY[key] : 0;
        return isFinite(p) ? p : 0;
    },

    defaultPriority: function(key) {
        const p = typeof SKILL_PRIORITY !== "undefined" ? SKILL_PRIORITY[key] : 0;
        return isFinite(p) ? p : 0;
    },

    syntheticSkill: function(key, level) {
        const sk = skills.createFreshSkillState(key);
        sk.level = level;
        return sk;
    },

    expToNext: function(initExp, level) {
        if (level <= 0) {
            return initExp;
        }
        return initExp * Math.pow(level, 1.2);
    },

    cumulativeToLevel: function(initExp, level) {
        if (level <= 0) {
            return 0;
        }
        let total = initExp;
        for (let L = 1; L < level; L++) {
            total += initExp * Math.pow(L, 1.2);
        }
        return total;
    },

    fmtExp: function(n) {
        if (!isFinite(n)) {
            return "—";
        }
        if (Math.abs(n) >= 10000) {
            return n.toExponential(2).replace("+", "");
        }
        if (Math.abs(n) >= 1000) {
            return String(Math.round(n));
        }
        const r = Math.round(n * 100) / 100;
        return String(r);
    },

    effectLine: function(def, sk) {
        try {
            const e = def.getEffect ? (def.getEffect(sk) || {}) : {};
            if (typeof def.effectUiSummary === "function") {
                const cd = gameData && gameData.battle ? gameData.battle.cooldowns : {};
                return def.effectUiSummary(sk, e, cd) || "";
            }
            return JSON.stringify(e);
        } catch (err) {
            return "(effect error)";
        }
    },

    rewardLine: function(def, sk) {
        try {
            if (typeof def.rewardText !== "function") {
                return "";
            }
            return def.rewardText(sk) || "";
        } catch (err) {
            return "";
        }
    },

    esc: function(s) {
        return String(s === undefined || s === null ? "" : s)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    },

    renderAll: function() {
        const list = document.getElementById("shSkillList");
        let html = "";
        for (let i = 0; i < skillHelper.displayOrder.length; i++) {
            html += skillHelper.renderCard(skillHelper.displayOrder[i]);
        }
        list.innerHTML = html;
        skillHelper.renderExport();
    },

    renderCard: function(key) {
        const def = skills._byKey[key];
        if (!def) {
            return "";
        }
        const prio = skillHelper.defaultPriority(key);
        const initExp = def.initialExpToLevel !== undefined ? def.initialExpToLevel : 5;
        const sk0 = skillHelper.syntheticSkill(key, 0);
        const cat = def.category || "combat";
        const classBit = def.classKey ? ` · ${def.classKey}` : "";
        const maxBit = def.maxLevel !== undefined ? ` · max ${def.maxLevel}` : "";
        let html = `<section class="sh-card" data-skill-key="${skillHelper.esc(key)}">`;
        html += `<div class="sh-card-head">`;
        html += `<div><div class="sh-card-title">${skillHelper.esc(def.name || key)}</div>`;
        html += `<div class="sh-card-meta"><code>${skillHelper.esc(key)}</code> · ${skillHelper.esc(cat)}${skillHelper.esc(classBit)}${skillHelper.esc(maxBit)} · base exp ${skillHelper.fmtExp(initExp)}</div></div>`;
        html += `<label class="sh-priority-field">Priority <input type="number" step="1" data-priority-key="${skillHelper.esc(key)}" value="${skillHelper.esc(prio)}"></label>`;
        html += `</div>`;
        if (def.shortDescription) {
            html += `<p class="sh-blurb">${skillHelper.esc(def.shortDescription)}</p>`;
        }
        if (def.triggerText) {
            html += `<p class="sh-blurb muted-text">${skillHelper.esc(def.triggerText)}</p>`;
        }
        const reward = skillHelper.rewardLine(def, sk0);
        if (reward) {
            html += `<p class="sh-blurb muted-text">${skillHelper.esc(reward)}</p>`;
        }
        html += `<div class="sh-table-wrap"><table class="sh-table"><thead><tr>`;
        html += `<th>Level</th><th>Effect</th><th>Exp to next</th><th>Total exp to reach</th>`;
        html += `</tr></thead><tbody>`;
        for (let i = 0; i < skillHelper.LEVELS.length; i++) {
            const lv = skillHelper.LEVELS[i];
            const sk = skillHelper.syntheticSkill(key, lv);
            const effect = skillHelper.effectLine(def, sk);
            const toNext = skillHelper.expToNext(initExp, lv);
            const total = skillHelper.cumulativeToLevel(initExp, lv);
            html += `<tr><td class="sh-num">${lv}</td><td>${skillHelper.esc(effect)}</td>`;
            html += `<td class="sh-num">${skillHelper.fmtExp(toNext)}</td>`;
            html += `<td class="sh-num">${skillHelper.fmtExp(total)}</td></tr>`;
        }
        html += `</tbody></table></div></section>`;
        return html;
    },

    sortByPriority: function() {
        const prios = {};
        for (let i = 0; i < skillHelper.displayOrder.length; i++) {
            const k = skillHelper.displayOrder[i];
            prios[k] = skillHelper.getPriorityValue(k);
        }
        skillHelper.displayOrder.sort(function(a, b) {
            if (prios[a] !== prios[b]) {
                return prios[a] - prios[b];
            }
            return (skillHelper.defIndex[a] || 0) - (skillHelper.defIndex[b] || 0);
        });
        const saved = {};
        const inputs = document.querySelectorAll("[data-priority-key]");
        for (let i = 0; i < inputs.length; i++) {
            saved[inputs[i].dataset.priorityKey] = inputs[i].value;
        }
        skillHelper.renderAll();
        const after = document.querySelectorAll("[data-priority-key]");
        for (let i = 0; i < after.length; i++) {
            const k = after[i].dataset.priorityKey;
            if (saved[k] !== undefined) {
                after[i].value = saved[k];
            }
        }
        skillHelper.renderExport();
    },

    sortedPriorityKeys: function() {
        const keys = (skills.keysInOrder || []).slice();
        keys.sort(function(a, b) {
            const pa = skillHelper.getPriorityValue(a);
            const pb = skillHelper.getPriorityValue(b);
            if (pa !== pb) {
                return pa - pb;
            }
            return a.localeCompare(b);
        });
        return keys;
    },

    formatExport: function() {
        const keys = skillHelper.sortedPriorityKeys();
        const lines = ["const SKILL_PRIORITY = {"];
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            const n = skillHelper.getPriorityValue(k);
            const comma = i < keys.length - 1 ? "," : "";
            lines.push(`    ${k}: ${n}${comma}`);
        }
        lines.push("};");
        return lines.join("\n");
    },

    renderExport: function() {
        document.getElementById("shExport").value = skillHelper.formatExport();
    },

    copyExport: function() {
        const text = skillHelper.formatExport();
        document.getElementById("shExport").value = text;
        const status = document.getElementById("shCopyStatus");
        const done = function(ok) {
            status.textContent = ok ? "Copied." : "Copy failed — select the text manually.";
            if (skillHelper.copyStatusTimer) {
                clearTimeout(skillHelper.copyStatusTimer);
            }
            skillHelper.copyStatusTimer = setTimeout(function() {
                status.textContent = "";
            }, 2000);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function() {
                done(true);
            }).catch(function() {
                done(skillHelper.fallbackCopy());
            });
            return;
        }
        done(skillHelper.fallbackCopy());
    },

    fallbackCopy: function() {
        const ta = document.getElementById("shExport");
        ta.removeAttribute("readonly");
        ta.select();
        let ok = false;
        try {
            ok = document.execCommand("copy");
        } catch (e) {
            ok = false;
        }
        ta.setAttribute("readonly", "readonly");
        return ok;
    }
};
