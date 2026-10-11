let mapHelper = {
    WAVE_COLORS: ["#89b4fa", "#a6e3a1", "#f9e2af", "#f38ba8", "#cba6f7", "#94e2d5", "#fab387", "#74c7ec", "#eba0ac", "#b4befe"],
    workingMap: null,
    tier: 0,
    scrubMs: 0,
    analysis: null,
    copyStatusTimer: 0,

    init: function() {
        mapHelper.bind();
        mapHelper.populateMapSelect();
        const maps = mapData.getDefaultMaps();
        let startKey = "";
        try {
            startKey = sessionStorage.getItem("mapHelperSelectedMapKey") || "";
        } catch (e) {
            startKey = "";
        }
        let found = false;
        for (let i = 0; i < maps.length; i++) {
            if (maps[i].key === startKey) {
                found = true;
                break;
            }
        }
        if (found) {
            mapHelper.loadMapByKey(startKey);
        } else if (maps.length) {
            mapHelper.loadMapByKey(maps[0].key);
        } else {
            mapHelper.newBlankMap();
        }
        requestAnimationFrame(function() {
            if (mapHelper.analysis) {
                mapHelper.renderCharts(mapHelper.analysis);
            }
        });
    },

    bind: function() {
        document.getElementById("mhMapSelect").addEventListener("change", function() {
            const key = this.value;
            if (key) {
                mapHelper.loadMapByKey(key);
            }
        });
        document.getElementById("mhReloadMapsBtn").addEventListener("click", function() {
            mapHelper.reloadFromFiles();
        });
        document.getElementById("mhCloneMapBtn").addEventListener("click", function() {
            mapHelper.cloneCurrentMap();
        });
        document.getElementById("mhNewMapBtn").addEventListener("click", function() {
            mapHelper.newBlankMap();
        });
        document.getElementById("mhTierSelect").addEventListener("change", function() {
            mapHelper.tier = parseInt(this.value, 10) || 0;
            mapHelper.refresh({ rebuildTable: false });
        });
        document.getElementById("mhMapName").addEventListener("input", function() {
            mapHelper.workingMap.name = this.value;
            mapHelper.refreshExportOnly();
        });
        document.getElementById("mhMapKey").addEventListener("input", function() {
            mapHelper.workingMap.key = this.value;
            mapHelper.refreshExportOnly();
        });
        document.getElementById("mhDescription").addEventListener("input", function() {
            mapHelper.workingMap.description = this.value;
            mapHelper.refreshExportOnly();
        });
        document.getElementById("mhBaseDifficulty").addEventListener("input", function() {
            const n = parseFloat(this.value);
            mapHelper.workingMap.baseDifficulty = isFinite(n) && n > 0 ? n : 1;
            mapHelper.refresh({ rebuildTable: false });
        });
        document.getElementById("mhSeed").addEventListener("input", function() {
            const n = parseInt(this.value, 10);
            mapHelper.workingMap.seed = isFinite(n) ? n : 0;
            mapHelper.refreshExportOnly();
        });
        document.getElementById("mhAddWaveBtn").addEventListener("click", function() {
            mapHelper.addWave();
        });
        document.getElementById("mhWaveTableBody").addEventListener("input", mapHelper.onWaveTableInput);
        document.getElementById("mhWaveTableBody").addEventListener("change", mapHelper.onWaveTableInput);
        document.getElementById("mhWaveTableBody").addEventListener("click", mapHelper.onWaveTableClick);
        document.getElementById("mhScrubRange").addEventListener("input", function() {
            mapHelper.setScrubSec(parseFloat(this.value) || 0, false);
        });
        document.getElementById("mhScrubNum").addEventListener("input", function() {
            mapHelper.setScrubSec(parseFloat(this.value) || 0, false);
        });
        document.getElementById("mhCopyBtn").addEventListener("click", function() {
            mapHelper.copyExport();
        });
        document.getElementById("mhGantt").addEventListener("click", mapHelper.onChartClick);
        document.getElementById("mhCoinsChart").addEventListener("click", mapHelper.onChartClick);
        document.getElementById("mhGantt").addEventListener("mousemove", mapHelper.onChartMove);
        document.getElementById("mhCoinsChart").addEventListener("mousemove", mapHelper.onChartMove);
        document.getElementById("mhGantt").addEventListener("mouseleave", mapHelper.hideTooltip);
        document.getElementById("mhCoinsChart").addEventListener("mouseleave", mapHelper.hideTooltip);
        window.addEventListener("resize", function() {
            if (mapHelper.analysis) {
                mapHelper.renderCharts(mapHelper.analysis);
            }
        });
    },

    populateMapSelect: function() {
        const sel = document.getElementById("mhMapSelect");
        const maps = mapData.getDefaultMaps();
        let html = "";
        for (let i = 0; i < maps.length; i++) {
            const m = maps[i];
            html += `<option value="${mapHelper.esc(m.key)}">${mapHelper.esc(m.name)} (${mapHelper.esc(m.key)})</option>`;
        }
        html += `<option value="">Custom / unsaved</option>`;
        sel.innerHTML = html;
    },

    loadMapByKey: function(key) {
        const maps = mapData.getDefaultMaps();
        let found = null;
        for (let i = 0; i < maps.length; i++) {
            if (maps[i].key === key) {
                found = maps[i];
                break;
            }
        }
        if (!found) {
            return;
        }
        mapHelper.workingMap = mapHelper.cloneMap(found);
        document.getElementById("mhMapSelect").value = key;
        try {
            sessionStorage.setItem("mapHelperSelectedMapKey", key);
        } catch (e) {}
        mapHelper.scrubMs = 0;
        mapHelper.syncMetaFields();
        mapHelper.refresh();
    },

    reloadFromFiles: function() {
        const current = mapHelper.workingMap && mapHelper.workingMap.key ? mapHelper.workingMap.key : "";
        const dataScript = document.createElement("script");
        dataScript.src = "mapData.js?t=" + Date.now();
        dataScript.onload = function() {
            mapHelper.populateMapSelect();
            const maps = mapData.getDefaultMaps();
            let found = false;
            for (let i = 0; i < maps.length; i++) {
                if (maps[i].key === current) {
                    found = true;
                    break;
                }
            }
            if (found) {
                mapHelper.loadMapByKey(current);
            } else if (maps.length) {
                mapHelper.loadMapByKey(maps[0].key);
            }
        };
        document.body.appendChild(dataScript);
    },

    cloneMap: function(m) {
        return JSON.parse(JSON.stringify(m));
    },

    cloneCurrentMap: function() {
        if (!mapHelper.workingMap) {
            return;
        }
        const copy = mapHelper.cloneMap(mapHelper.workingMap);
        copy.key = (copy.key || "map") + "_copy";
        copy.name = (copy.name || "Map") + " (copy)";
        copy.unlocksAfterMapKey = copy.unlocksAfterMapKey || "";
        mapHelper.workingMap = copy;
        document.getElementById("mhMapSelect").value = "";
        mapHelper.syncMetaFields();
        mapHelper.refresh();
    },

    newBlankMap: function() {
        const zone = mapData.createZone(5, "scoundrel", 0, 200, 1, 1, 5);
        mapHelper.workingMap = mapData.createMap({
            version: 0,
            key: "map_new",
            name: "New Map",
            description: "",
            seed: 1,
            baseDifficulty: 1,
            zones: [zone],
            forageZones: [],
            zoneShards: []
        });
        document.getElementById("mhMapSelect").value = "";
        mapHelper.scrubMs = 0;
        mapHelper.syncMetaFields();
        mapHelper.refresh();
    },

    syncMetaFields: function() {
        const m = mapHelper.workingMap;
        document.getElementById("mhMapName").value = m.name || "";
        document.getElementById("mhMapKey").value = m.key || "";
        document.getElementById("mhDescription").value = m.description || "";
        document.getElementById("mhBaseDifficulty").value = m.baseDifficulty !== undefined ? m.baseDifficulty : 1;
        document.getElementById("mhSeed").value = m.seed !== undefined ? m.seed : 0;
    },

    onWaveTableInput: function(ev) {
        const el = ev.target;
        const row = el.closest("tr");
        if (!row || row.dataset.zoneIndex === undefined) {
            return;
        }
        const zi = parseInt(row.dataset.zoneIndex, 10);
        const z = mapHelper.workingMap.zones[zi];
        if (!z) {
            return;
        }
        const field = el.dataset.field;
        if (!field) {
            return;
        }
        if (field === "intruderType") {
            z.intruderType = el.value || "scoundrel";
        } else if (field === "startSec") {
            const sec = parseFloat(el.value);
            z.startTimeMs = isFinite(sec) && sec >= 0 ? Math.round(sec * 1000) : 0;
        } else if (field === "totalEnemies") {
            const n = parseInt(el.value, 10);
            z.totalEnemies = isFinite(n) && n >= 1 ? n : 1;
        } else if (field === "distanceBetweenUnits") {
            const n = parseFloat(el.value);
            z.distanceBetweenUnits = isFinite(n) && n >= 0 ? n : 0;
        } else if (field === "difficulty") {
            const n = parseFloat(el.value);
            z.difficulty = isFinite(n) && n > 0 ? n : 1;
        } else if (field === "audDamageTradeRatio") {
            const n = parseFloat(el.value);
            z.audDamageTradeRatio = isFinite(n) && n >= 0.01 ? n : 1;
        } else if (field === "coinsPerIntruder") {
            const n = parseFloat(el.value);
            z.coinsPerIntruder = isFinite(n) && n >= 0 ? n : 0;
        }
        mapHelper.refresh({ rebuildTable: false });
    },

    onWaveTableClick: function(ev) {
        const btn = ev.target.closest("[data-action]");
        if (!btn) {
            return;
        }
        const row = btn.closest("tr");
        if (!row) {
            return;
        }
        const zi = parseInt(row.dataset.zoneIndex, 10);
        const action = btn.dataset.action;
        if (action === "up") {
            mapHelper.moveWave(zi, -1);
        } else if (action === "down") {
            mapHelper.moveWave(zi, 1);
        } else if (action === "dup") {
            mapHelper.duplicateWave(zi);
        } else if (action === "del") {
            mapHelper.deleteWave(zi);
        }
    },

    renameWaves: function() {
        const zones = mapHelper.workingMap.zones || [];
        for (let i = 0; i < zones.length; i++) {
            zones[i].name = `Wave ${i + 1}`;
        }
    },

    addWave: function() {
        const zones = mapHelper.workingMap.zones;
        let startMs = 0;
        if (zones.length) {
            const last = mapHelper.analyze().waves[zones.length - 1];
            startMs = Math.round((last.lastMs || last.startMs) + 5000);
        }
        zones.push(mapData.createZone(5, "scoundrel", startMs, 200, 1, 1, 5));
        mapHelper.renameWaves();
        mapHelper.refresh();
    },

    duplicateWave: function(zi) {
        const z = mapHelper.workingMap.zones[zi];
        if (!z) {
            return;
        }
        const copy = JSON.parse(JSON.stringify(z));
        mapHelper.workingMap.zones.splice(zi + 1, 0, copy);
        mapHelper.renameWaves();
        mapHelper.refresh();
    },

    deleteWave: function(zi) {
        mapHelper.workingMap.zones.splice(zi, 1);
        mapHelper.renameWaves();
        mapHelper.refresh();
    },

    moveWave: function(zi, dir) {
        const zones = mapHelper.workingMap.zones;
        const to = zi + dir;
        if (to < 0 || to >= zones.length) {
            return;
        }
        const tmp = zones[zi];
        zones[zi] = zones[to];
        zones[to] = tmp;
        mapHelper.renameWaves();
        mapHelper.refresh();
    },

    setScrubSec: function(sec, renderAll) {
        const s = Math.max(0, sec);
        mapHelper.scrubMs = Math.round(s * 1000);
        document.getElementById("mhScrubRange").value = mapHelper.fmtNum(s, 1);
        document.getElementById("mhScrubNum").value = mapHelper.fmtNum(s, 1);
        if (renderAll) {
            mapHelper.refresh();
            return;
        }
        if (mapHelper.analysis) {
            mapHelper.renderScrubInfo(mapHelper.analysis);
            mapHelper.renderCharts(mapHelper.analysis);
            mapHelper.updateActiveRows(mapHelper.analysis);
        }
    },

    analyze: function() {
        const m = mapHelper.workingMap;
        const tierMult = mapData.getTierDifficultyMultiplier(mapHelper.tier);
        const travelSpd = Math.max(1, gameData.battle.intruderTravelSpeedPxPerSecond || 1);
        const waves = [];
        const units = [];
        const zones = m.zones || [];
        for (let i = 0; i < zones.length; i++) {
            const z = zones[i];
            const cr = mapData.computeZoneCombatAndRewards(m, i, tierMult);
            const rows = mapData.createZoneSpawnRows(m, i, tierMult);
            const count = rows.length;
            const firstMs = count ? rows[0].spawnTimeMs : (z.startTimeMs || 0);
            const lastMs = count ? rows[count - 1].spawnTimeMs : firstMs;
            const spacingPx = Math.max(0, z.distanceBetweenUnits || 0);
            const intervalMs = spacingPx > 0 ? (spacingPx / travelSpd) * 1000 : 0;
            const aud = Math.max(1, Math.round(cr.rawAud));
            const dmg = Math.max(1, Math.round(cr.rawDamage));
            const waveCoins = cr.perIntruderGain * count;
            waves.push({
                index: i,
                name: z.name || `Wave ${i + 1}`,
                count: count,
                type: cr.intruderType || "scoundrel",
                startMs: firstMs,
                lastMs: lastMs,
                intervalMs: intervalMs,
                durationMs: Math.max(0, lastMs - firstMs),
                aud: aud,
                dmg: dmg,
                coinsPer: cr.perIntruderGain,
                waveCoins: waveCoins,
                distancePx: spacingPx,
                skillShard: z.skillShard || null,
                totalEnemies: z.totalEnemies,
                difficulty: z.difficulty,
                trade: z.audDamageTradeRatio,
                coins: z.coinsPerIntruder,
                exp: cr.expBasePerIntruder
            });
            for (let ri = 0; ri < rows.length; ri++) {
                units.push({
                    zoneIndex: i,
                    unitIndex: ri,
                    spawnMs: rows[ri].spawnTimeMs,
                    aud: aud,
                    dmg: dmg,
                    coins: cr.perIntruderGain,
                    type: cr.intruderType || "scoundrel"
                });
            }
        }
        units.sort(function(a, b) {
            if (a.spawnMs !== b.spawnMs) {
                return a.spawnMs - b.spawnMs;
            }
            if (a.zoneIndex !== b.zoneIndex) {
                return a.zoneIndex - b.zoneIndex;
            }
            return a.unitIndex - b.unitIndex;
        });
        const events = [{ t: 0, coinsDelta: 0, cumulative: 0, spawned: 0 }];
        let running = 0;
        for (let i = 0; i < units.length; i++) {
            running += units[i].coins;
            const t = units[i].spawnMs;
            const last = events[events.length - 1];
            if (last.t === t) {
                last.coinsDelta += units[i].coins;
                last.cumulative = running;
                last.spawned = i + 1;
            } else {
                events.push({
                    t: t,
                    coinsDelta: units[i].coins,
                    cumulative: running,
                    spawned: i + 1
                });
            }
        }
        let maxMs = 0;
        for (let i = 0; i < waves.length; i++) {
            maxMs = Math.max(maxMs, waves[i].lastMs);
        }
        return {
            waves: waves,
            units: units,
            events: events,
            totalCoins: running,
            totalEnemies: units.length,
            maxMs: maxMs
        };
    },

    coinsAtMs: function(analysis, ms) {
        let coins = 0;
        let spawned = 0;
        for (let i = 0; i < analysis.events.length; i++) {
            if (analysis.events[i].t <= ms) {
                coins = analysis.events[i].cumulative;
                spawned = analysis.events[i].spawned;
            }
        }
        return { coins: coins, spawned: spawned };
    },

    coinsByTime: function(analysis, ms) {
        let coins = 0;
        for (let i = 0; i < analysis.units.length; i++) {
            if (analysis.units[i].spawnMs <= ms) {
                coins += analysis.units[i].coins;
            }
        }
        return coins;
    },

    refresh: function(opts) {
        mapHelper.renameWaves();
        const analysis = mapHelper.analyze();
        mapHelper.analysis = analysis;
        const maxSec = Math.max(10, analysis.maxMs / 1000);
        const range = document.getElementById("mhScrubRange");
        range.max = mapHelper.fmtNum(maxSec, 1);
        if (mapHelper.scrubMs > analysis.maxMs && analysis.maxMs > 0) {
            mapHelper.scrubMs = analysis.maxMs;
        }
        range.value = mapHelper.fmtNum(mapHelper.scrubMs / 1000, 1);
        document.getElementById("mhScrubNum").value = mapHelper.fmtNum(mapHelper.scrubMs / 1000, 1);
        document.getElementById("mhScrubNum").max = range.max;
        mapHelper.renderSummary(analysis);
        if (opts && opts.rebuildTable === false) {
            mapHelper.updateWaveComputedCells(analysis);
            mapHelper.updateActiveRows(analysis);
        } else {
            mapHelper.renderWaveTable(analysis);
        }
        mapHelper.renderScrubInfo(analysis);
        mapHelper.renderCharts(analysis);
        mapHelper.renderCoinsTable(analysis);
        mapHelper.renderExport();
    },

    refreshExportOnly: function() {
        mapHelper.renderExport();
    },

    renderSummary: function(analysis) {
        const el = document.getElementById("mhSummary");
        const last = mapHelper.fmtNum(analysis.maxMs / 1000, 1);
        el.textContent = `${analysis.totalEnemies} intruders · last stagger ${last}s · ${analysis.totalCoins} coins total (base, this star cycle)`;
    },

    renderWaveTable: function(analysis) {
        const body = document.getElementById("mhWaveTableBody");
        const t = mapHelper.scrubMs;
        let html = "";
        for (let i = 0; i < analysis.waves.length; i++) {
            const w = analysis.waves[i];
            const z = mapHelper.workingMap.zones[i];
            const color = mapHelper.WAVE_COLORS[i % mapHelper.WAVE_COLORS.length];
            const active = t >= w.startMs && t <= w.lastMs;
            const shard = z.skillShard && z.skillShard.key
                ? `<span class="mh-shard-tag" title="${mapHelper.esc(z.skillShard.key)}">shard</span>`
                : "";
            html += `<tr data-zone-index="${i}" class="${active ? "mh-row-active" : ""}">`;
            html += `<td><span class="mh-wave-swatch" style="background:${color}"></span>${mapHelper.esc(w.name)}${shard}</td>`;
            html += `<td><input type="number" min="1" step="1" data-field="totalEnemies" value="${mapHelper.esc(z.totalEnemies)}"></td>`;
            html += `<td><select data-field="intruderType">`;
            html += `<option value="scoundrel"${z.intruderType === "lecher" ? "" : " selected"}>scoundrel</option>`;
            html += `<option value="lecher"${z.intruderType === "lecher" ? " selected" : ""}>lecher</option>`;
            html += `</select></td>`;
            html += `<td><input class="mh-start-input" type="number" min="0" step="0.1" data-field="startSec" value="${mapHelper.msToSecInput(z.startTimeMs)}"></td>`;
            html += `<td><input type="number" min="0" step="1" data-field="distanceBetweenUnits" value="${mapHelper.esc(z.distanceBetweenUnits)}"></td>`;
            html += `<td><input type="number" min="0.01" step="0.1" data-field="difficulty" value="${mapHelper.esc(z.difficulty)}"></td>`;
            html += `<td><input type="number" min="0.01" step="0.05" data-field="audDamageTradeRatio" value="${mapHelper.esc(z.audDamageTradeRatio)}"></td>`;
            html += `<td><input type="number" min="0" step="1" data-field="coinsPerIntruder" value="${mapHelper.esc(z.coinsPerIntruder)}"></td>`;
            html += `<td class="mh-computed" data-col="aud">${w.aud}</td>`;
            html += `<td class="mh-computed" data-col="dmg">${w.dmg}</td>`;
            html += `<td class="mh-computed" data-col="gap">${mapHelper.fmtNum(w.intervalMs / 1000, 2)}</td>`;
            html += `<td class="mh-computed" data-col="duration">${mapHelper.fmtNum(w.durationMs / 1000, 2)}</td>`;
            html += `<td class="mh-computed" data-col="last">${mapHelper.fmtNum(w.lastMs / 1000, 2)}</td>`;
            html += `<td class="mh-computed" data-col="coinsPer">${w.coinsPer}</td>`;
            html += `<td class="mh-computed" data-col="exp">${mapHelper.fmtNum(w.exp, 2)}</td>`;
            html += `<td class="mh-computed" data-col="waveCoins">${w.waveCoins}</td>`;
            html += `<td class="mh-row-actions">`;
            html += `<button type="button" class="tab-button" data-action="up" title="Move up">↑</button>`;
            html += `<button type="button" class="tab-button" data-action="down" title="Move down">↓</button>`;
            html += `<button type="button" class="tab-button" data-action="dup" title="Duplicate">⧉</button>`;
            html += `<button type="button" class="tab-button" data-action="del" title="Delete">×</button>`;
            html += `</td></tr>`;
        }
        if (!analysis.waves.length) {
            html = `<tr><td colspan="17" class="muted-text">No waves. Add one to start.</td></tr>`;
        }
        body.innerHTML = html;
    },

    updateWaveComputedCells: function(analysis) {
        const rows = document.querySelectorAll("#mhWaveTableBody tr[data-zone-index]");
        for (let i = 0; i < rows.length; i++) {
            const zi = parseInt(rows[i].dataset.zoneIndex, 10);
            const w = analysis.waves[zi];
            if (!w) {
                continue;
            }
            mapHelper.setComputedCell(rows[i], "aud", String(w.aud));
            mapHelper.setComputedCell(rows[i], "dmg", String(w.dmg));
            mapHelper.setComputedCell(rows[i], "gap", mapHelper.fmtNum(w.intervalMs / 1000, 2));
            mapHelper.setComputedCell(rows[i], "duration", mapHelper.fmtNum(w.durationMs / 1000, 2));
            mapHelper.setComputedCell(rows[i], "last", mapHelper.fmtNum(w.lastMs / 1000, 2));
            mapHelper.setComputedCell(rows[i], "coinsPer", String(w.coinsPer));
            mapHelper.setComputedCell(rows[i], "exp", mapHelper.fmtNum(w.exp, 2));
            mapHelper.setComputedCell(rows[i], "waveCoins", String(w.waveCoins));
        }
    },

    setComputedCell: function(row, col, text) {
        const td = row.querySelector(`[data-col="${col}"]`);
        if (td) {
            td.textContent = text;
        }
    },

    updateActiveRows: function(analysis) {
        const t = mapHelper.scrubMs;
        const rows = document.querySelectorAll("#mhWaveTableBody tr[data-zone-index]");
        for (let i = 0; i < rows.length; i++) {
            const zi = parseInt(rows[i].dataset.zoneIndex, 10);
            const w = analysis.waves[zi];
            const active = !!(w && t >= w.startMs && t <= w.lastMs);
            rows[i].classList.toggle("mh-row-active", active);
        }
    },

    renderScrubInfo: function(analysis) {
        const t = mapHelper.scrubMs;
        const at = mapHelper.coinsAtMs(analysis, t);
        const active = [];
        for (let i = 0; i < analysis.waves.length; i++) {
            const w = analysis.waves[i];
            if (t >= w.startMs && t <= w.lastMs) {
                active.push(w.name);
            }
        }
        const waveTxt = active.length ? active.join(", ") : "none spawning";
        document.getElementById("mhScrubInfo").textContent =
            `At ${mapHelper.fmtNum(t / 1000, 1)}s: ${at.spawned} units spawned · ${waveTxt} · ${at.coins} coins if those units were killed`;
    },

    chartLayout: function(analysis, plotHeight) {
        const wrap = document.getElementById("mhGantt");
        const width = Math.max(480, wrap.clientWidth || 900);
        const left = 72;
        const right = 16;
        const top = 10;
        const bottom = 28;
        const plotW = Math.max(100, width - left - right);
        const maxMs = Math.max(10000, analysis.maxMs);
        return {
            width: width,
            left: left,
            right: right,
            top: top,
            bottom: bottom,
            plotW: plotW,
            plotH: plotHeight,
            maxMs: maxMs,
            x: function(ms) {
                return left + (ms / maxMs) * plotW;
            }
        };
    },

    timeTicks: function(maxMs) {
        const maxSec = maxMs / 1000;
        const steps = [1, 2, 5, 10, 15, 20, 30, 60, 120];
        let step = 5;
        for (let i = 0; i < steps.length; i++) {
            if (maxSec / steps[i] <= 12) {
                step = steps[i];
                break;
            }
            step = steps[i];
        }
        const ticks = [];
        for (let s = 0; s <= maxSec + 0.001; s += step) {
            ticks.push(s);
        }
        return ticks;
    },

    renderCharts: function(analysis) {
        mapHelper.renderGantt(analysis);
        mapHelper.renderCoinsChart(analysis);
    },

    renderGantt: function(analysis) {
        const rowH = 28;
        const n = Math.max(1, analysis.waves.length);
        const plotH = n * rowH;
        const L = mapHelper.chartLayout(analysis, plotH);
        const height = L.top + plotH + L.bottom;
        const ticks = mapHelper.timeTicks(L.maxMs);
        const t = mapHelper.scrubMs;
        let svg = `<svg viewBox="0 0 ${L.width} ${height}" role="img">`;
        svg += `<rect x="0" y="0" width="${L.width}" height="${height}" fill="#11151f"/>`;
        for (let i = 0; i < ticks.length; i++) {
            const x = L.x(ticks[i] * 1000);
            svg += `<line x1="${x}" y1="${L.top}" x2="${x}" y2="${L.top + plotH}" stroke="#2a3142" stroke-width="1"/>`;
            svg += `<text x="${x}" y="${height - 8}" fill="#a6adc8" font-size="11" text-anchor="middle">${ticks[i]}s</text>`;
        }
        for (let i = 0; i < analysis.waves.length; i++) {
            const w = analysis.waves[i];
            const color = mapHelper.WAVE_COLORS[i % mapHelper.WAVE_COLORS.length];
            const y = L.top + i * rowH;
            const x1 = L.x(w.startMs);
            const x2 = Math.max(x1 + 4, L.x(w.lastMs));
            svg += `<text x="8" y="${y + 18}" fill="${color}" font-size="11">${mapHelper.esc(w.name)}</text>`;
            svg += `<rect x="${x1}" y="${y + 8}" width="${x2 - x1}" height="12" rx="2" fill="${color}" fill-opacity="0.28" stroke="${color}" stroke-width="1"/>`;
        }
        for (let i = 0; i < analysis.units.length; i++) {
            const u = analysis.units[i];
            const color = mapHelper.WAVE_COLORS[u.zoneIndex % mapHelper.WAVE_COLORS.length];
            const y = L.top + u.zoneIndex * rowH + 14;
            const x = L.x(u.spawnMs);
            const title = `Wave ${u.zoneIndex + 1} unit ${u.unitIndex + 1} @ ${mapHelper.fmtNum(u.spawnMs / 1000, 2)}s · Aud ${u.aud} · Dmg ${u.dmg} · ${u.coins} coins`;
            svg += `<circle class="mh-unit-dot" data-tip="${mapHelper.esc(title)}" cx="${x}" cy="${y}" r="3.5" fill="${color}" stroke="#070a0f" stroke-width="1"/>`;
        }
        const sx = L.x(Math.min(t, L.maxMs));
        svg += `<line x1="${sx}" y1="${L.top}" x2="${sx}" y2="${L.top + plotH}" stroke="#f9e2af" stroke-width="1.5"/>`;
        svg += `</svg>`;
        document.getElementById("mhGantt").innerHTML = svg;
        document.getElementById("mhGantt").dataset.chartLeft = String(L.left);
        document.getElementById("mhGantt").dataset.chartPlotW = String(L.plotW);
        document.getElementById("mhGantt").dataset.chartMaxMs = String(L.maxMs);
        document.getElementById("mhGantt").dataset.chartWidth = String(L.width);
    },

    renderCoinsChart: function(analysis) {
        const plotH = 140;
        const L = mapHelper.chartLayout(analysis, plotH);
        const height = L.top + plotH + L.bottom;
        const ticks = mapHelper.timeTicks(L.maxMs);
        const maxCoins = Math.max(1, analysis.totalCoins);
        const yAt = function(c) {
            return L.top + plotH - (c / maxCoins) * plotH;
        };
        let d = `M ${L.x(0)} ${yAt(0)}`;
        let lastC = 0;
        for (let i = 1; i < analysis.events.length; i++) {
            const ev = analysis.events[i];
            d += ` L ${L.x(ev.t)} ${yAt(lastC)} L ${L.x(ev.t)} ${yAt(ev.cumulative)}`;
            lastC = ev.cumulative;
        }
        d += ` L ${L.x(L.maxMs)} ${yAt(lastC)}`;
        const t = mapHelper.scrubMs;
        const at = mapHelper.coinsAtMs(analysis, t);
        let svg = `<svg viewBox="0 0 ${L.width} ${height}" role="img">`;
        svg += `<rect x="0" y="0" width="${L.width}" height="${height}" fill="#11151f"/>`;
        for (let i = 0; i < ticks.length; i++) {
            const x = L.x(ticks[i] * 1000);
            svg += `<line x1="${x}" y1="${L.top}" x2="${x}" y2="${L.top + plotH}" stroke="#2a3142" stroke-width="1"/>`;
            svg += `<text x="${x}" y="${height - 8}" fill="#a6adc8" font-size="11" text-anchor="middle">${ticks[i]}s</text>`;
        }
        const yTicks = [0, Math.round(maxCoins / 2), maxCoins];
        for (let i = 0; i < yTicks.length; i++) {
            const y = yAt(yTicks[i]);
            svg += `<line x1="${L.left}" y1="${y}" x2="${L.left + L.plotW}" y2="${y}" stroke="#2a3142" stroke-width="1"/>`;
            svg += `<text x="8" y="${y + 4}" fill="#a6adc8" font-size="11">${yTicks[i]}</text>`;
        }
        svg += `<path d="${d}" fill="none" stroke="#a6e3a1" stroke-width="2"/>`;
        const sx = L.x(Math.min(t, L.maxMs));
        svg += `<line x1="${sx}" y1="${L.top}" x2="${sx}" y2="${L.top + plotH}" stroke="#f9e2af" stroke-width="1.5"/>`;
        svg += `<circle cx="${sx}" cy="${yAt(at.coins)}" r="4" fill="#a6e3a1" stroke="#070a0f" stroke-width="1"/>`;
        svg += `</svg>`;
        document.getElementById("mhCoinsChart").innerHTML = svg;
        document.getElementById("mhCoinsChart").dataset.chartLeft = String(L.left);
        document.getElementById("mhCoinsChart").dataset.chartPlotW = String(L.plotW);
        document.getElementById("mhCoinsChart").dataset.chartMaxMs = String(L.maxMs);
        document.getElementById("mhCoinsChart").dataset.chartWidth = String(L.width);
    },

    onChartClick: function(ev) {
        const host = ev.currentTarget;
        const sec = mapHelper.timeFromChartEvent(host, ev);
        if (sec === null) {
            return;
        }
        mapHelper.setScrubSec(sec, false);
    },

    onChartMove: function(ev) {
        const tipEl = ev.target.closest("[data-tip]");
        if (tipEl && tipEl.getAttribute("data-tip")) {
            mapHelper.showTooltip(ev, tipEl.getAttribute("data-tip"));
            return;
        }
        const host = ev.currentTarget;
        const sec = mapHelper.timeFromChartEvent(host, ev);
        if (sec === null || !mapHelper.analysis) {
            mapHelper.hideTooltip();
            return;
        }
        const at = mapHelper.coinsAtMs(mapHelper.analysis, sec * 1000);
        mapHelper.showTooltip(ev, `${mapHelper.fmtNum(sec, 1)}s · ${at.spawned} spawned · ${at.coins} coins`);
    },

    timeFromChartEvent: function(host, ev) {
        const left = parseFloat(host.dataset.chartLeft);
        const plotW = parseFloat(host.dataset.chartPlotW);
        const maxMs = parseFloat(host.dataset.chartMaxMs);
        const svg = host.querySelector("svg");
        if (!svg || !isFinite(left) || !isFinite(plotW) || plotW <= 0) {
            return null;
        }
        const rect = svg.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        const scale = rect.width / (parseFloat(host.dataset.chartWidth) || rect.width);
        const t = ((x / scale) - left) / plotW;
        return Math.max(0, Math.min(maxMs / 1000, t * (maxMs / 1000)));
    },

    showTooltip: function(ev, text) {
        const el = document.getElementById("mhTooltip");
        el.textContent = text;
        el.style.display = "block";
        el.style.left = (ev.clientX + 12) + "px";
        el.style.top = (ev.clientY + 12) + "px";
    },

    hideTooltip: function() {
        document.getElementById("mhTooltip").style.display = "none";
    },

    renderCoinsTable: function(analysis) {
        const body = document.getElementById("mhCoinsTableBody");
        let html = "";
        for (let i = 0; i < analysis.waves.length; i++) {
            const w = analysis.waves[i];
            const byLast = mapHelper.coinsByTime(analysis, w.lastMs);
            html += `<tr>`;
            html += `<td>${mapHelper.esc(w.name)}</td>`;
            html += `<td>${mapHelper.fmtNum(w.startMs / 1000, 2)}</td>`;
            html += `<td>${mapHelper.fmtNum(w.lastMs / 1000, 2)}</td>`;
            html += `<td>${w.count}</td>`;
            html += `<td>${w.waveCoins}</td>`;
            html += `<td>${byLast}</td>`;
            html += `</tr>`;
        }
        if (!analysis.waves.length) {
            html = `<tr><td colspan="6" class="muted-text">No waves.</td></tr>`;
        }
        body.innerHTML = html;
    },

    renderExport: function() {
        document.getElementById("mhExport").value = mapHelper.formatCreateMap(mapHelper.workingMap);
    },

    formatCreateMap: function(m) {
        const lines = [];
        lines.push("mapData.createMap({");
        if (m.version !== undefined) {
            lines.push(`    version: ${mapHelper.fmtExportNum(m.version)},`);
        }
        lines.push(`    key: ${JSON.stringify(m.key || "")},`);
        lines.push(`    name: ${JSON.stringify(m.name || "")},`);
        if (m.description) {
            lines.push(`    description: ${JSON.stringify(m.description)},`);
        }
        lines.push(`    seed: ${mapHelper.fmtExportNum(m.seed || 0)},`);
        lines.push(`    baseDifficulty: ${mapHelper.fmtExportNum(m.baseDifficulty || 1)},`);
        if (m.requiredClassKey) {
            lines.push(`    requiredClassKey: ${JSON.stringify(m.requiredClassKey)},`);
        }
        if (m.unlocksAfterMapKey) {
            lines.push(`    unlocksAfterMapKey: ${JSON.stringify(m.unlocksAfterMapKey)},`);
        }
        lines.push("    zones: [");
        const zones = m.zones || [];
        for (let i = 0; i < zones.length; i++) {
            const comma = ",";
            const ztxt = mapHelper.formatCreateZone(zones[i]);
            const zlines = ztxt.split("\n");
            for (let li = 0; li < zlines.length; li++) {
                const extra = (li === zlines.length - 1) ? comma : "";
                lines.push("        " + zlines[li] + extra);
            }
        }
        lines.push("    ],");
        const shards = m.zoneShards || [];
        if (shards.length) {
            lines.push("    zoneShards: [");
            for (let i = 0; i < shards.length; i++) {
                const comma = i < shards.length - 1 ? "," : "";
                lines.push("        " + mapHelper.formatSkillShard(shards[i]) + comma);
            }
            lines.push("    ],");
        }
        const forage = m.forageZones || [];
        if (forage.length) {
            lines.push("    forageZones: [");
            for (let i = 0; i < forage.length; i++) {
                const comma = i < forage.length - 1 ? "," : "";
                lines.push("        " + mapHelper.formatCreateForageZone(forage[i]) + comma);
            }
            lines.push("    ]");
        } else if (lines[lines.length - 1].endsWith(",")) {
            lines[lines.length - 1] = lines[lines.length - 1].replace(/,$/, "");
        }
        lines.push("})");
        return lines.join("\n");
    },

    formatCreateZone: function(z) {
        const args = [
            mapHelper.fmtExportNum(z.totalEnemies),
            JSON.stringify(z.intruderType || "scoundrel"),
            mapHelper.fmtExportNum(Math.round(z.startTimeMs || 0)),
            mapHelper.fmtExportNum(z.distanceBetweenUnits || 0),
            mapHelper.fmtExportNum(z.difficulty !== undefined ? z.difficulty : 1),
            mapHelper.fmtExportNum(z.audDamageTradeRatio !== undefined ? z.audDamageTradeRatio : 1),
            mapHelper.fmtExportNum(z.coinsPerIntruder !== undefined ? z.coinsPerIntruder : 1)
        ];
        const shard = z.skillShard ? mapHelper.formatSkillShard(z.skillShard) : "";
        if (shard) {
            return `mapData.createZone(${args.join(", ")},\n    ${shard})`;
        }
        return `mapData.createZone(${args.join(", ")})`;
    },

    formatSkillShard: function(sh) {
        if (!sh || !sh.key) {
            return "";
        }
        return `{ key: ${JSON.stringify(sh.key)}, gain: ${mapHelper.fmtExportNum(sh.gain)}, chance: ${mapHelper.fmtExportNum(sh.chance)}, cap: ${mapHelper.fmtExportNum(sh.cap)} }`;
    },

    formatCreateForageZone: function(fz) {
        return `mapData.createForageZone(${mapHelper.fmtExportNum(fz.totalEnemies)}, ${JSON.stringify(fz.unitType || "tree")}, ${mapHelper.fmtExportNum(fz.distanceBetweenUnits || 0)}, ${mapHelper.fmtExportNum(fz.index || 0)}, ${mapHelper.fmtExportNum(fz.baseAud || 10)}, ${mapHelper.fmtExportNum(fz.rewardAmount || 1)}, ${JSON.stringify(fz.rewardResource || "logs")}, ${mapHelper.fmtExportNum(fz.expBasePerIntruder !== undefined ? fz.expBasePerIntruder : 1)})`;
    },

    copyExport: function() {
        const text = document.getElementById("mhExport").value;
        const status = document.getElementById("mhCopyStatus");
        const done = function(ok) {
            status.textContent = ok ? "Copied." : "Copy failed — select the text manually.";
            if (mapHelper.copyStatusTimer) {
                clearTimeout(mapHelper.copyStatusTimer);
            }
            mapHelper.copyStatusTimer = setTimeout(function() {
                status.textContent = "";
            }, 2000);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function() {
                done(true);
            }).catch(function() {
                done(mapHelper.fallbackCopy(text));
            });
            return;
        }
        done(mapHelper.fallbackCopy(text));
    },

    fallbackCopy: function(text) {
        const ta = document.getElementById("mhExport");
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
    },

    msToSecInput: function(ms) {
        const s = (ms || 0) / 1000;
        if (Math.abs(s - Math.round(s)) < 1e-9) {
            return String(Math.round(s));
        }
        return String(Math.round(s * 1000) / 1000);
    },

    fmtNum: function(n, digits) {
        const d = digits === undefined ? 1 : digits;
        const f = Math.pow(10, d);
        const v = Math.round(n * f) / f;
        return String(v);
    },

    fmtExportNum: function(n) {
        if (typeof n !== "number" || !isFinite(n)) {
            return "0";
        }
        if (Math.abs(n - Math.round(n)) < 1e-9) {
            return String(Math.round(n));
        }
        return String(Math.round(n * 1e6) / 1e6);
    },

    esc: function(s) {
        return String(s === undefined || s === null ? "" : s)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }
};
