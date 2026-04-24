let viewData = {
    cached: {}, //contains the elements that are being iterated over and updated regularly,
    prevValues: {},
    scheduled: [],
    layout: {
        battlefieldHeightPx: 500,
        playerTopPx: 440
    },
    enemyElementPool: [],
    activeEnemyElements: {},
    menuCacheByTab: {},
};


let view = {
    updateViewAtFrame: function() { //This is the main view update function that is run once per frame
        view.renderBattlefield();

        view.updateScheduled(); //Updates UI things that were scheduled from data code
    },
    updateView: function() { //Updates half as much as above, for passive updates to save a little
        if (!viewData.cached.mainLayout) {
            createView.initializeDisplay();
        }
        createView.showCurrentTab();
        view.updateMenuNumbers();
        view.updateGlobals();
    },
    updateViewOnSecond: function() { //Updates once a second

    },
    updateGlobals: function() { //updates user-facing UI
        if (!data.battle || !viewData.cached.playerHpText) {
            return;
        }
        const rd = data.battle.player.rangedAttackDamage !== undefined ? data.battle.player.rangedAttackDamage : Math.floor(data.battle.player.attackDamage * 1.5);
        const recLv = data.progress.skills.recovery ? data.progress.skills.recovery.level : 0;
        const regenStr = recLv > 0 ? ` | Regen ${(recLv * 0.25).toFixed(2)}/s` : "";
        view.updateVal("playerHpText", `${intToString(data.battle.player.hp, 3)} / ${intToString(data.battle.player.maxHp, 3)} | Melee ${intToString(data.battle.player.attackDamage, 3)} | Ranged ${intToString(rd, 3)}${regenStr}`);
        const hpPct = Math.max(0, Math.min(100, (data.battle.player.hp / data.battle.player.maxHp) * 100));
        view.updateVal("playerToken", `linear-gradient(to top, #2ad15f ${hpPct}%, #0f3a1d ${hpPct}%)`, "style.background");
        const runClock = (data.battle.elapsedMs || 0) / 1000;
        let waveHtml = `<div>Time ${round1(runClock)}s</div>`;
        const zones = data.battle.activeZones || [];
        for (let i = 0; i < zones.length; i++) {
            waveHtml += `<div>${zones[i].name} | Difficulty x${round2(zones[i].difficulty)} | ${round1(zones[i].remainingMs / 1000)}s left</div>`;
        }
        if (viewData.prevValues.waveInfoHtml !== waveHtml) {
            viewData.cached.waveInfo.innerHTML = waveHtml;
            viewData.prevValues.waveInfoHtml = waveHtml;
        }
        const showOverlay = (data.battle.state === "dead" || data.battle.state === "completed") ? "flex" : "none";
        view.updateVal("deathOverlay", showOverlay, "style.display");
        const runGold = Math.max(0, data.progress.gold - data.battle.runStartGold - (data.battle.completionBonusGold || 0));
        const talentEl = viewData.cached.deathTalentDetails;
        if (data.battle.state === "completed") {
            view.updateVal("deathTitle", "Map completed!");
            view.updateVal("deathSummary", `Bonus gold: ${intToStringRound(data.battle.completionBonusGold || 0)} | Time ${round1(runClock)}s | Level ${data.battle.levelState.level} | Kills ${data.battle.enemiesKilled} | Gold ${intToStringRound(runGold)}`);
            if (talentEl) {
                talentEl.innerHTML = "";
            }
        } else if (data.battle.state === "dead") {
            view.updateVal("deathTitle", "You Died");
            view.updateVal("deathSummary", `Time ${round1(runClock)}s | Level ${data.battle.levelState.level} | Kills ${data.battle.enemiesKilled} | Gold ${intToStringRound(runGold)}`);
            if (talentEl) {
                talentEl.innerHTML = view.buildDeathTalentSummaryHtml();
            }
        } else {
            view.updateVal("deathSummary", "");
            if (talentEl) {
                talentEl.innerHTML = "";
            }
        }
        createView.updateLayoutMeasurements();
    },
    buildDeathTalentSummaryHtml: function() {
        const start = data.battle.runSkillTalentStart;
        const skills = data.progress.skills;
        if (!start || !skills) {
            return "";
        }
        const keys = Object.keys(skills);
        const rows = [];
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            const sk = skills[k];
            const t0 = start[k] !== undefined ? start[k] : 0;
            const t1 = sk.talentLevel || 0;
            if (t1 > t0) {
                rows.push(`<div class="death-talent-row">${sk.name} talent ${t0}→${t1}</div>`);
            }
        }
        if (!rows.length) {
            return "";
        }
        return `<div class="death-talent-title">Talent this run</div>${rows.join("")}`;
    },
    updateMenuNumbers: function() {
        const activeTab = data.battle.currentTab || "gear";
        view.updateTabButtons(activeTab);

        view.updateVal("goldText", intToStringRound(data.progress.gold));

        const ls = data.battle.levelState;
        view.updateVal("levelText", ls.level, "textContent", 3);
        view.updateVal("levelExpText", `${intToString(ls.exp, 3)} / ${intToString(ls.expToLevel, 3)}`);
        const levelPct = ls.expToLevel > 0 ? Math.max(0, Math.min(100, (ls.exp / ls.expToLevel) * 100)) : 0;
        view.updateVal("levelTabExpFill", `${levelPct}%`, "style.width");
        view.updateVal("attributePointsText", ls.unassignedPoints, "textContent", 3);
        view.updateVal("strText", ls.levelStr + ls.skillStrBonus, "textContent", 3);
        view.updateVal("conText", ls.levelCon + ls.skillConBonus, "textContent", 3);
        view.updateVal("spdText", ls.levelSpd || 0, "textContent", 3);
        view.updateVal("soulText", ls.levelSoul || 0, "textContent", 3);
        view.renderAttributePlanList();

        const skillKeys = skills.getSkillKeysInDisplayOrder(data.progress.skills);
        for (let i = 0; i < skillKeys.length; i++) {
            view.updateSkillCard(skillKeys[i]);
        }

        const rangedToggle = viewData.cached.rangedAttackToggle;
        if (rangedToggle) {
            const want = !!data.progress.rangedAttackEnabled;
            if (rangedToggle.checked !== want) {
                rangedToggle.checked = want;
            }
        }

        const current = data.progress.currentMapKey;
        view.updateVal("mapButton_map_1", current === "map_1" ? "Current" : "Travel", "textContent");
        view.updateVal("mapButton_map_2", current === "map_2" ? "Current" : "Travel", "textContent");
        view.updateVal("mapButton_map_1", current === "map_1", "disabled");
        view.updateVal("mapButton_map_2", current === "map_2", "disabled");

        const mapDefs = data.progress.mapDefinitions || [];
        for (let i = 0; i < mapDefs.length; i++) {
            view.updateVal(`mapDifficulty_${mapDefs[i].key}`, `x${round2(mapDefs[i].difficultyModifier || 1)}`);
        }

        view.updateHistoryList();
        view.updateGearPanel();
    },
    updateGearPanel: function() {
        const summ = viewData.cached.gearSummaryLine;
        if (!summ || !data.progress.gear || !data.progress.gear.slots) {
            return;
        }
        const agg = gameData.getAggregatedGearBonuses();
        summ.textContent = `Total gear (after effectiveness): +${round1(agg.dmgPct * 100)}% damage, +${round1(agg.hpPct * 100)}% max HP`;
        const order = gameData.gearSlotOrder;
        const stats = gameData.getPlayerStatsForGear();
        for (let i = 0; i < order.length; i++) {
            const slot = order[i];
            const st = data.progress.gear.slots[slot];
            if (!st) {
                continue;
            }
            const info = gameData.computeGearSlotBonuses(slot, st);
            const reqParts = [];
            if (info.req.str > 0) {
                reqParts.push(`Str ${stats.str}/${info.req.str}`);
            }
            if (info.req.con > 0) {
                reqParts.push(`Con ${stats.con}/${info.req.con}`);
            }
            if (info.req.spd > 0) {
                reqParts.push(`Spd ${stats.spd}/${info.req.spd}`);
            }
            if (info.req.soul > 0) {
                reqParts.push(`Soul ${stats.soul}/${info.req.soul}`);
            }
            const reqLine = reqParts.length ? reqParts.join(" · ") : "—";
            let fxRaw = "";
            if (info.tbdMagic) {
                fxRaw = "Magic (TBD) — no combat bonus yet";
            } else {
                fxRaw = `+${round1(info.rawDmgPct * 100)}% dmg, +${round1(info.rawHpPct * 100)}% max HP`;
            }
            view.updateVal(`gear_slot_${slot}_lvl`, st.level);
            view.updateVal(`gear_slot_${slot}_fxraw`, fxRaw);
            view.updateVal(`gear_slot_${slot}_req`, reqLine);
            view.updateVal(`gear_slot_${slot}_eff`, `${round1(info.effectiveness * 100)}%`);
            const cost = gameData.getGearUpgradeCost(st.level || 0);
            view.updateVal(`gear_slot_${slot}_cost`, `(next ${intToStringRound(cost)} gold)`);
            const upBtn = viewData.cached[`gear_up_${slot}`];
            if (upBtn) {
                upBtn.textContent = `Upgrade to Lv ${(st.level || 0) + 1}`;
                upBtn.disabled = data.progress.gold < cost;
            }
            const vars = gameData.gearVariants;
            for (let v = 0; v < vars.length; v++) {
                const btn = viewData.cached[`gear_btn_${slot}_${vars[v]}`];
                if (btn) {
                    if (st.variant === vars[v]) {
                        btn.classList.add("gear-var-on");
                    } else {
                        btn.classList.remove("gear-var-on");
                    }
                }
            }
        }
    },
    renderAttributePlanList: function() {
        const el = viewData.cached.attributePlanList;
        if (!el) {
            return;
        }
        const plan = data.progress.attributePlan.slice().sort(function(a, b) { return a.level - b.level; });
        let html = "";
        let currentGroup = null;
        for (let i = 0; i < plan.length; i++) {
            const entry = plan[i];
            if (!currentGroup) {
                currentGroup = { start: entry.level, end: entry.level, attribute: entry.attribute };
            } else if (currentGroup.attribute === entry.attribute && entry.level === currentGroup.end + 1) {
                currentGroup.end = entry.level;
            } else {
                const levelText = currentGroup.start === currentGroup.end ? `Lvl ${currentGroup.start}` : `Lvl ${currentGroup.start}-${currentGroup.end}`;
                html += `<span class="plan-item">${levelText}, + ${currentGroup.attribute.toUpperCase()}</span>`;
                currentGroup = { start: entry.level, end: entry.level, attribute: entry.attribute };
            }
        }
        if (currentGroup) {
            const levelText = currentGroup.start === currentGroup.end ? `Lvl ${currentGroup.start}` : `Lvl ${currentGroup.start}-${currentGroup.end}`;
            html += `<span class="plan-item">${levelText}, + ${currentGroup.attribute.toUpperCase()}</span>`;
        }
        if (!html) {
            html = "<span class=\"muted-text\">No plan yet</span>";
        }
        if (viewData.prevValues.attributePlanHtml !== html) {
            el.innerHTML = html;
            viewData.prevValues.attributePlanHtml = html;
        }
    },
    updateHistoryList: function() {
        const el = viewData.cached.historyList;
        if (!el) {
            return;
        }
        const runs = data.progress.runHistory || [];
        let html = "";
        for (let i = 0; i < runs.length; i++) {
            const run = runs[i];
            html += `<div class="history-row">#${i + 1}: ${round1(run.survivedSeconds)}s | Gold ${intToStringRound(run.goldGained)} | ${round2(run.goldPerSecond)}/s</div>`;
        }
        if (!html) {
            html = "<div class=\"muted-text\">No runs yet.</div>";
        }
        if (viewData.prevValues.historyHtml !== html) {
            el.innerHTML = html;
            viewData.prevValues.historyHtml = html;
        }
    },
    updateSkillCard: function(skillKey) {
        const skill = data.progress.skills[skillKey];
        if (!skill) {
            return;
        }
        const parts = skills.skillExpGainParts(skill);
        const expPerTrigger = skills.expGainForSkillTrigger(skill, 1);
        const expPct = Math.min(100, Math.max(0, (skill.exp / skill.expToLevel) * 100));
        const talPct = Math.min(100, Math.max(0, (skill.talent / skill.talentToLevel) * 100));
        view.updateVal(`skill_${skillKey}_headline`, `${skill.name} - Lvl ${skill.level} - Talent ${skill.talentLevel}`);
        view.updateVal(`skill_${skillKey}_reward`, skills.getSkillRewardText(skillKey, skill));
        view.updateVal(`skill_${skillKey}_trigger`, skills.getSkillTriggerDescription(skillKey));
        view.updateVal(`skill_${skillKey}_exp_on_trigger`, `Exp on trigger (base 1): ${round2(expPerTrigger)}`);
        view.updateVal(`skill_${skillKey}_exp_mults`, `· Skill level ×${parts.levelMult.toFixed(4)} · Combined ×${parts.combinedMult.toFixed(4)}`);
        view.updateVal(`skill_${skillKey}_exp_text`, `${round1(skill.exp)} / ${round1(skill.expToLevel)}`);
        view.updateVal(`skill_${skillKey}_exp_fill`, `${expPct}%`, "style.width");
        view.updateVal(`skill_${skillKey}_talent_text`, `${round1(skill.talent)} / ${round1(skill.talentToLevel)} (Talent Lv ${skill.talentLevel}) · exp mult ×${parts.talentMult.toFixed(4)}`);
        view.updateVal(`skill_${skillKey}_talent_fill`, `${talPct}%`, "style.width");
    },
    updatePlayerBattleBars: function() {
        const p = data.battle.player;
        const ls = data.battle.levelState;
        const atkFill = viewData.cached.playerAttackBarFill;
        const atkLabel = viewData.cached.playerAttackBarLabel;
        const rngFill = viewData.cached.playerRangedBarFill;
        const rngLabel = viewData.cached.playerRangedBarLabel;
        const lvlFill = viewData.cached.playerLevelBarFill;
        const lvlLabel = viewData.cached.playerLevelBarLabel;
        if (atkFill && atkLabel) {
            const cd = typeof engine.getEffectiveMeleeCooldownMs === "function" ? engine.getEffectiveMeleeCooldownMs() : p.attackCooldownMs;
            const atkRemain = Math.max(0, p.attackTimerMs);
            const atkPct = 100 - Math.max(0, Math.min(100, (atkRemain / cd) * 100));
            atkFill.style.width = `${atkPct}%`;
            const atkElapsed = cd - atkRemain;
            view.updateVal("playerAttackBarLabel", `Melee attack ${intToString(atkElapsed, 3)} / ${intToString(cd, 3)} ms`);
        }
        if (rngFill && rngLabel) {
            if (data.battle.state !== "running") {
                rngFill.style.width = "0%";
                rngLabel.textContent = "\u2014";
            } else {
            const pushPx = typeof engine.getEnemyPushBonusPxPerSecond === "function"
                ? engine.getEnemyPushBonusPxPerSecond()
                : gameData.battle.idlePushBonusPxPerSecond;
            const rangedOn = !!data.progress.rangedAttackEnabled;
            const idlePush = engine.idleAutoPhase() && engine.countAliveEnemies() > 0;
            if (rangedOn) {
                const rcd = typeof engine.getEffectiveRangedCooldownMs === "function" ? engine.getEffectiveRangedCooldownMs() : (p.rangedAttackCooldownMs || 4000);
                const rRemain = Math.max(0, p.rangedAttackTimerMs || 0);
                const rPct = 100 - Math.max(0, Math.min(100, (rRemain / rcd) * 100));
                rngFill.style.width = `${rPct}%`;
                const rElapsed = rcd - rRemain;
                view.updateVal("playerRangedBarLabel", `Ranged attack ${intToString(rElapsed, 3)} / ${intToString(rcd, 3)} ms`);
            } else if (idlePush) {
                rngFill.style.width = "100%";
                view.updateVal("playerRangedBarLabel", `Move speed +${intToString(pushPx, 3)}/s`);
            } else {
                rngFill.style.width = "0%";
                view.updateVal("playerRangedBarLabel", "Move speed melee ready, none in melee range");
            }
            }
        }
        if (lvlFill && lvlLabel) {
            const lvlPct = ls.expToLevel > 0 ? Math.max(0, Math.min(100, (ls.exp / ls.expToLevel) * 100)) : 0;
            lvlFill.style.width = `${lvlPct}%`;
            view.updateVal("playerLevelBarLabel", `Level ${intToString(ls.level, 3)} — ${intToString(ls.exp, 3)} / ${intToString(ls.expToLevel, 3)} exp`);
        }
    },
    updateTabButtons: function(activeTab) {
        const tabs = ["gear", "leveling", "skills", "travel", "history"];
        for (let i = 0; i < tabs.length; i++) {
            const id = `tabButton_${tabs[i]}`;
            const isActive = tabs[i] === activeTab;
            view.updateVal(id, isActive ? "#2d4e7a" : "#1f2b3e", "style.backgroundColor");
        }
    },
    renderBattlefield: function() {
        if (!viewData.cached.battlefield) {
            return;
        }
        const activeIds = {};
        const battlefield = viewData.cached.battlefield;
        const laneWidth = battlefield.clientWidth / gameData.battle.laneCount;
        const alpha = data.gameSettings.renderAlpha ?? 1;

        for (let i = 0; i < data.battle.enemies.length; i++) {
            const enemy = data.battle.enemies[i];
            const enemyId = enemy.id;
            activeIds[enemyId] = true;
            let enemyEl = viewData.activeEnemyElements[enemyId];
            if (!enemyEl) {
                enemyEl = view.acquireEnemyElement();
                enemyEl.id = `enemy_${enemyId}`;
                viewData.activeEnemyElements[enemyId] = enemyEl;
                battlefield.appendChild(enemyEl);
            }
            const laneCenter = (enemy.lane + 0.5) * laneWidth;
            const leftPx = laneCenter - (enemy.sizePx / 2);
            let renderY = enemy.yPx;
            if (data.battle.state === "running") {
                renderY = (enemy.prevYPx !== undefined) ? (enemy.prevYPx + ((enemy.yPx - enemy.prevYPx) * alpha)) : enemy.yPx;
            } else {
                enemy.prevYPx = enemy.yPx;
            }
            enemyEl.style.width = `${enemy.sizePx}px`;
            enemyEl.style.height = `${enemy.sizePx}px`;
            enemyEl.style.left = `${leftPx}px`;
            enemyEl.style.top = `${renderY}px`;
            const hpPct = Math.max(0, enemy.hp / enemy.maxHp) * 100;
            const hpLayer = enemyEl.querySelector(".enemy-hp-layer");
            if (hpLayer) {
                hpLayer.style.background = `linear-gradient(to top, #ff2d2d ${hpPct}%, #2a0e0e ${hpPct}%)`;
            }
            const hpLine = enemyEl.querySelector(".enemy-stat-hp");
            const dmgLine = enemyEl.querySelector(".enemy-stat-dmg");
            const atkFill = enemyEl.querySelector(".enemy-stat-atk-fill");
            if (hpLine) {
                hpLine.textContent = `${Math.ceil(enemy.hp)}/${enemy.maxHp}`;
            }
            if (dmgLine) {
                dmgLine.textContent = `Dmg ${enemy.attackDamage}`;
            }
            if (atkFill) {
                const cd = enemy.attackCooldownMs;
                const atkBarPct = enemy.inRange
                    ? Math.max(0, Math.min(100, (enemy.attackTimerMs / cd) * 100))
                    : 100;
                atkFill.style.width = `${atkBarPct}%`;
            }
        }
        view.consumeLineFxQueue();
        view.updatePlayerBattleBars();

        const activeKeys = Object.keys(viewData.activeEnemyElements);
        for (let i = 0; i < activeKeys.length; i++) {
            const enemyId = parseInt(activeKeys[i], 10);
            if (!activeIds[enemyId]) {
                view.releaseEnemyElement(enemyId);
            }
        }
    },
    consumeLineFxQueue: function() {
        const q = data.battle.lineFxQueue;
        const linesRoot = viewData.cached.attackLines;
        if (!q || !q.length || !linesRoot) {
            return;
        }
        while (q.length > 0) {
            const seg = q.shift();
            view.spawnAttackLineFx(seg, linesRoot);
        }
    },
    spawnAttackLineFx: function(seg, parent) {
        const dx = seg.x2 - seg.x1;
        const dy = seg.y2 - seg.y1;
        const length = Math.sqrt((dx * dx) + (dy * dy));
        if (length < 1) {
            return;
        }
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const el = document.createElement("div");
        el.className = seg.kind === "ranged" ? "attack-line-fx-anim attack-line-ranged" : "attack-line-fx-anim";
        el.style.left = `${seg.x1}px`;
        el.style.top = `${seg.y1}px`;
        el.style.width = `${length}px`;
        el.style.transform = `translateY(-50%) rotate(${angle}deg)`;
        parent.appendChild(el);
        el.addEventListener("animationend", function() {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        }, { once: true });
    },
    acquireEnemyElement: function() {
        let enemyEl = null;
        if (viewData.enemyElementPool.length > 0) {
            enemyEl = viewData.enemyElementPool.pop();
        } else {
            enemyEl = document.createElement("div");
            enemyEl.className = "enemy-token";
            const hpLayer = document.createElement("div");
            hpLayer.className = "enemy-hp-layer";
            const overlay = document.createElement("div");
            overlay.className = "enemy-overlay";
            const hpLine = document.createElement("div");
            hpLine.className = "enemy-stat-hp";
            const dmgLine = document.createElement("div");
            dmgLine.className = "enemy-stat-dmg";
            const atkWrap = document.createElement("div");
            atkWrap.className = "enemy-stat-atk-wrap";
            const atkFill = document.createElement("div");
            atkFill.className = "enemy-stat-atk-fill";
            atkWrap.appendChild(atkFill);
            overlay.appendChild(hpLine);
            overlay.appendChild(dmgLine);
            overlay.appendChild(atkWrap);
            enemyEl.appendChild(hpLayer);
            enemyEl.appendChild(overlay);
        }
        enemyEl.style.display = "block";
        return enemyEl;
    },
    releaseEnemyElement: function(enemyId) {
        const enemyEl = viewData.activeEnemyElements[enemyId];
        if (!enemyEl) {
            return;
        }
        enemyEl.style.display = "none";
        enemyEl.removeAttribute("id");
        if (enemyEl.parentElement) {
            enemyEl.parentElement.removeChild(enemyEl);
        }
        viewData.enemyElementPool.push(enemyEl);
        delete viewData.activeEnemyElements[enemyId];
    },

    //helpers
    scheduleUpdate: function(elementId, value, type) {
        viewData.scheduled.push({
            id:elementId,
            value:value,
            type:type
        })
    },
    updateScheduled: function() { //Comes from async processes in data, like onComplete
        for(let scheduled of viewData.scheduled) {
            viewData.updateVal(scheduled.id, scheduled.value, scheduled.type);
        }
        viewData.scheduled = [];
    },
    updateVal: function(id, newVal, type="textContent", sigFigs) {
        const el = viewData.cached[id];
        if(!viewData.prevValues[id]) {
            viewData.prevValues[id] = {};
        }
        let prevValue = viewData.prevValues[id];
        if (!el) {
            console.log("Element of id " + id + " does not exist.");
            console.log(new Error().stack);
            return;
        }

        const typeKey = `lastValue_${type}`;
        let lastVal = prevValue[typeKey] ?? null;
        // let lastVal = null;

        if (lastVal !== newVal) {
            if (type.includes(".")) {
                const [firstKey, secondKey] = type.split(".");
                if (el[firstKey] && el[firstKey][secondKey] !== undefined) {
                    el[firstKey][secondKey] = newVal;
                }
            } else {
                if(sigFigs && sigFigs !== "none") {
                    if(sigFigs === "time") {
                        el[type] = secondsToTime(newVal);
                    } else if(sigFigs === "floor") {
                        el[type] = intToStringRound(newVal);
                    } else {
                        el[type] = intToString(newVal, sigFigs);
                    }
                } else {
                    el[type] = newVal;
                }
            }

            prevValue[typeKey] = newVal;
        }
    },
}
