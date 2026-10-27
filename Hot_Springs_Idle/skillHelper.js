let skillHelper = {
    LEVELS: [0, 50, 100],
    SLOT_ORDER: { offense: 0, defense: 1, utility: 2 },
    combatKeys: [],
    sortMode: "alpha",
    slotFilter: "all",
    query: "",

    init: function() {
        if (typeof data === "undefined") {
            window.data = {
                gameSettings: { numberType: "numberSuffix" }
            };
        } else if (!data.gameSettings) {
            data.gameSettings = { numberType: "numberSuffix" };
        }
        const keys = skills.keysInOrder || [];
        skillHelper.combatKeys = [];
        for (let i = 0; i < keys.length; i++) {
            const def = skills._byKey[keys[i]];
            if (def && def.category === "combat") {
                skillHelper.combatKeys.push(keys[i]);
            }
        }
        document.getElementById("shTotal").textContent = "Total skills: " + skillHelper.combatKeys.length;
        const search = document.getElementById("shSearch");
        search.addEventListener("input", function() {
            skillHelper.query = String(search.value || "").trim().toLowerCase();
            skillHelper.renderAll();
        });
        search.addEventListener("keydown", function(ev) {
            if (ev.key !== "Escape") {
                return;
            }
            if (!search.value) {
                return;
            }
            search.value = "";
            skillHelper.query = "";
            skillHelper.renderAll();
        });
        const slotRadios = document.querySelectorAll('input[name="shSlot"]');
        for (let s = 0; s < slotRadios.length; s++) {
            slotRadios[s].addEventListener("change", function() {
                if (!slotRadios[s].checked) {
                    return;
                }
                skillHelper.slotFilter = slotRadios[s].value;
                skillHelper.renderAll();
            });
        }
        const sortRadios = document.querySelectorAll('input[name="shSort"]');
        for (let r = 0; r < sortRadios.length; r++) {
            sortRadios[r].addEventListener("change", function() {
                if (!sortRadios[r].checked) {
                    return;
                }
                skillHelper.sortMode = sortRadios[r].value === "slot" ? "slot" : "alpha";
                skillHelper.renderAll();
            });
        }
        skillHelper.renderAll();
        search.focus();
    },

    syntheticSkill: function(key, level) {
        const sk = skills.createFreshSkillState(key);
        sk.level = level;
        return sk;
    },

    totalExpToReach: function(key, level) {
        if (level <= 0) {
            return 0;
        }
        let total = 0;
        for (let i = 0; i < level; i++) {
            total += skills.getExpToLevel(key, i);
        }
        return total;
    },

    fmtExp: function(n) {
        if (!isFinite(n)) {
            return "-";
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

    rewardText: function(def, sk) {
        try {
            if (typeof def.rewardText !== "function") {
                return "";
            }
            return def.rewardText(sk) || "";
        } catch (err) {
            return "";
        }
    },

    stripHtml: function(html) {
        return String(html == null ? "" : html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    },

    matchesSearch: function(key, queryLower) {
        if (!queryLower) {
            return true;
        }
        const def = skills._byKey[key];
        if (!def) {
            return false;
        }
        const name = String(def.name || "").toLowerCase();
        if (name.indexOf(queryLower) >= 0) {
            return true;
        }
        const slotCat = skills.getSlotCategory(key);
        if (slotCat && (slotCat.indexOf(queryLower) >= 0 || queryLower === slotCat)) {
            return true;
        }
        const reward = skillHelper.stripHtml(skillHelper.rewardText(def, skillHelper.syntheticSkill(key, 0))).toLowerCase();
        if (reward.indexOf(queryLower) >= 0) {
            return true;
        }
        const trigger = skillHelper.stripHtml(def.triggerText || "").toLowerCase();
        return trigger.indexOf(queryLower) >= 0;
    },

    compareAlpha: function(a, b) {
        const da = skills._byKey[a];
        const db = skills._byKey[b];
        const na = (da && da.name) || a;
        const nb = (db && db.name) || b;
        const cmp = na.localeCompare(nb);
        if (cmp !== 0) {
            return cmp;
        }
        return a.localeCompare(b);
    },

    compareSlot: function(a, b) {
        const ca = skills.getSlotCategory(a) || "";
        const cb = skills.getSlotCategory(b) || "";
        const oa = skillHelper.SLOT_ORDER[ca] !== undefined ? skillHelper.SLOT_ORDER[ca] : 100;
        const ob = skillHelper.SLOT_ORDER[cb] !== undefined ? skillHelper.SLOT_ORDER[cb] : 100;
        if (oa !== ob) {
            return oa - ob;
        }
        if (oa === 100 && ca !== cb) {
            return ca.localeCompare(cb);
        }
        return skillHelper.compareAlpha(a, b);
    },

    visibleKeys: function() {
        const out = [];
        const slot = skillHelper.slotFilter;
        const query = skillHelper.query;
        for (let i = 0; i < skillHelper.combatKeys.length; i++) {
            const key = skillHelper.combatKeys[i];
            if (slot !== "all" && skills.getSlotCategory(key) !== slot) {
                continue;
            }
            if (!skillHelper.matchesSearch(key, query)) {
                continue;
            }
            out.push(key);
        }
        out.sort(skillHelper.sortMode === "slot" ? skillHelper.compareSlot : skillHelper.compareAlpha);
        return out;
    },

    slotLabel: function(slotCat) {
        if (slotCat === "offense" || slotCat === "defense" || slotCat === "utility") {
            return slotCat.charAt(0).toUpperCase() + slotCat.slice(1);
        }
        return slotCat || "";
    },

    esc: function(s) {
        return String(s === undefined || s === null ? "" : s)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    },

    renderAll: function() {
        const keys = skillHelper.visibleKeys();
        const showing = document.getElementById("shShowing");
        const narrowed = keys.length !== skillHelper.combatKeys.length;
        showing.hidden = !narrowed;
        if (narrowed) {
            showing.textContent = "Showing " + keys.length;
        }
        const empty = document.getElementById("shEmpty");
        empty.hidden = keys.length !== 0;
        const list = document.getElementById("shSkillList");
        let html = "";
        let lastSlot = null;
        const grouped = skillHelper.sortMode === "slot";
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (grouped) {
                const slot = skills.getSlotCategory(key) || "";
                if (slot !== lastSlot) {
                    const label = skillHelper.slotLabel(slot) || slot || "Other";
                    html += `<h2 class="sh-group-head">${skillHelper.esc(label)}</h2>`;
                    lastSlot = slot;
                }
            }
            html += skillHelper.renderCard(key);
        }
        list.innerHTML = html;
    },

    renderCard: function(key) {
        const def = skills._byKey[key];
        if (!def) {
            return "";
        }
        const initExp = def.initialExpToLevel !== undefined ? def.initialExpToLevel : 5;
        const initTalent = def.initialTalentToLevel !== undefined ? def.initialTalentToLevel : 10;
        const sk0 = skillHelper.syntheticSkill(key, 0);
        const slotCat = skills.getSlotCategory(key);
        const slotClass = slotCat ? ` skill-row--slot-${slotCat}` : "";
        const maxBit = def.maxLevel !== undefined ? ` · max ${def.maxLevel}` : "";
        let html = `<section class="sh-card${slotClass}" data-skill-key="${skillHelper.esc(key)}">`;
        html += `<div class="sh-card-head">`;
        html += `<div class="sh-card-title-row"><div class="sh-card-title">${skillHelper.esc(def.name || key)}</div>`;
        if (slotCat) {
            const stampClass = `scroll-archives-choice-slot-cat scroll-archives-choice-slot-cat--${slotCat}`;
            html += `<span class="${stampClass}">${skillHelper.esc(skillHelper.slotLabel(slotCat))}</span>`;
        }
        html += `</div>`;
        html += `<div class="sh-card-meta"><code>${skillHelper.esc(key)}</code>${skillHelper.esc(maxBit)} · ${skillHelper.esc(def.triggerType || "")} · Base Skill Exp: ${skillHelper.esc(initExp)}, Base Talent Exp: ${skillHelper.esc(initTalent)}</div>`;
        html += `</div>`;
        if (def.shortDescription) {
            html += `<p class="sh-blurb">${skillHelper.esc(def.shortDescription)}</p>`;
        }
        if (def.triggerText) {
            html += `<p class="sh-blurb muted-text">${skillHelper.esc(def.triggerText)}</p>`;
        }
        const reward = skillHelper.rewardText(def, sk0);
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
            const toNext = skills.getExpToLevel(key, lv);
            const total = skillHelper.totalExpToReach(key, lv);
            html += `<tr><td class="sh-num">${lv}</td><td>${skillHelper.esc(effect)}</td>`;
            html += `<td class="sh-num">${skillHelper.fmtExp(toNext)}</td>`;
            html += `<td class="sh-num">${skillHelper.fmtExp(total)}</td></tr>`;
        }
        html += `</tbody></table></div></section>`;
        return html;
    }
};
