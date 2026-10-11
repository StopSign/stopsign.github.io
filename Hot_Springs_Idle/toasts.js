// Tutorial toasts. State lives on data.tutorialToasts and is not inside progress, so prestige does not clear it.

function tutorialIcon(file) {
    return `<img class="inline-res-icon" src="img/${file}" alt="" draggable="false">`;
}

function tutorialStar(kind) {
    return `<span class="star-${kind}">★</span>`;
}

let toasts = {
    viewingTips: false,
    _built: false,
    _panelKey: "",
    defs: [
        {
            title: "Welcome!",
            text: "Welcome to Hot Springs Idle! These messages will serve as a simple tutorial, though much of the game will be self-discovery. Click these for information when you see them!",
            trigger: function() { return true; }
        },
        {
            title: "Wood Gathering",
            text: `To start, get ${tutorialIcon("wood.svg")} Wood by assigning ${tutorialIcon("foxWorker.svg")} Kitsune to the Bamboo Forest, and click one of the "Cut" buttons.`,
            trigger: function() { return true; }
        },
        {
            title: "Stone Gathering",
            text: `Click the path segment above the Stone Pile, and click Remove Rocks to assign the ${tutorialIcon("foxTail.svg")} Okami to it. She clears the rocks and brings ${tutorialIcon("stone.svg")} Stone back to the Stone Pile.`,
            trigger: function() { return toasts.hasWoodChips(); }
        },
        {
            title: "Assigning the Okami",
            text: `The ${tutorialIcon("foxTail.svg")} Okami can only do one thing at a time - that's why she has kitsune helpers! She counts as a worker, but also applies her inspiration bonus to the other kitsune working at the same place. You can also right click a building to set the assignment of the Okami to that building, or right click a path to do the next available upgrade (like Remove Rocks)`,
            trigger: function() { return toasts.stoneAmount() > 0; }
        },
        {
            title: "Building the Entrance",
            text: `Time to build a gate for guests to arrive! Start the plan in the Fox Den and assign either ${tutorialIcon("foxWorker.svg")} Kitsune or the ${tutorialIcon("foxTail.svg")} Okami to carry the resources to the Zenko Torii Gate for it to be built.`,
            trigger: function() { return toasts.woodAmount() >= 2 && toasts.stoneAmount() >= 2; }
        },
        {
            title: "Visitors and Friends",
            text: `Visitors will come every minute, but we can't host them until the Tatami Inn is built, so get that up soon! In the meantime, you are able to invite some nearby additional ${tutorialIcon("foxWorker.svg")} Kitsune helpers with shiny coins! Go ahead and spend all your coins; there will be ways to get more later.<br><br>Upgrades happen in two phases: gathering resources, and weaving the threads. Coins are instantly spent, and the upgrade will become ready, so click it again to weave it. The weaving time is divided by your Okami's Spirit Strands.`,
            trigger: function() { return toasts.buildingBuilt("torii"); }
        },
        {
            title: "Change the Bamboo Cut",
            text: `Your ${tutorialIcon("foxWorker.svg")} Kitsune workers at the Bamboo Forest are stuck! Change them to a different stalk to get the wood flowing again. There is an upgrade in the Rock Garden building to have this happen automatically.`,
            trigger: function() { return toasts.bambooStalkFullyCut(); }
        },
        {
            title: "Offline Time",
            text: "The game saves automatically every 20 seconds, and time keeps running while you are offline, up to 24 hours. When you re-open the game, it will run the game quickly in order to catch up, as if you had it open the whole time.",
            trigger: function() { return toasts.buildingBuilt("garden"); }
        },
        {
            title: "Accepting Guests",
            text: "Guests will automatically go from the Torii Gate to the Tatami Inn if there are rooms available, and they will give Star Beads according to their restfulness when they leave. Check out the Guests tab for their itinerary. Get enough Star Beads to get Nurture Plant Spirit at the Zenko Torii Gate!",
            trigger: function() { return toasts.buildingBuilt("inn"); }
        },
        {
            title: "Spirits",
            text: "You've acquired your first Spirit, a lovely little Plant Spirit, placed at the Bamboo Forest. It adds its Spirit Power to the Base Chips of the chosen bamboo stalk. The Spirit gains exp as the stalk it is attached to regenerates, and with enough exp it will level up, getting more Spirit Power, so keep chopping down that column!",
            trigger: function() { return toasts.plantSpiritsBought() > 0; }
        },
        {
            title: "Mana Generation",
            text: "The Orb will soon start to generate mana! Use it to improve the Orb for more mana for now, with more upgrades becoming visible as your mana capacity increases. There's a very important use for mana available with 1500 mana capacity!",
            trigger: function() { return toasts.buildingBuilt("mage_tower"); }
        },
        {
            title: "More Stone",
            text: `You've got the full path, and now your first Earth Spirit! Earth Spirits can be placed in either the Mine or the Hidden Spring's slots - click the spirit and then a slot to move it. In the Mine, they will dig for ${tutorialIcon("stone.svg")} Stone, but they must be assigned to the Hidden Spring's slots to create Pebbles that carry the ${tutorialIcon("stone.svg")} Stone down to the Stone Pile. If you want more ${tutorialIcon("stone.svg")} Stone right away, you can always send the Okami to collect stone herself from the Hidden Spring.`,
            trigger: function() { return toasts.earthSpiritsBought() > 0; }
        },
        {
            title: "Increasing Depth",
            text: `Depth is ready to increase! More depth gives more stone, and soon it will give a new resource ${tutorialIcon("ore.svg")} Ore as well! It is always worthwhile to increase the depth when you can.`,
            trigger: function() { return toasts.isFirstDepthReady(); }
        },
        {
            title: "Defending the Resort",
            text: `There are whispers on the wind from guests who found peace at your resort, and the whispers also carry rumors of the Okami's beauty. Audacious intruders are coming to get a glimpse, and would ruin the atmosphere of the resort just as it starts to pick up! And yet, the Okami is too busy running the resort herself to handle it.<br><br>Luckily, the Okami has a trick, aided by the magic of the Bonfire; she can create an illusionary clone with mana! While not suited for combat, her clone is more than suited to slap the audacity out of the intruders, causing them to run in shame! Even better, with a proper mean look the intruders will also give coins in recompense for attempting to disturb the peace.<br><br>Start the repelling of the invaders by creating a clone in Bonfire!`,
            trigger: function() { return toasts.buildingBuilt("bonfire"); }
        },
        {
            title: "Shameful Retreat",
            text: "The Okami's clone is not immune to shame either, and when it runs out of Audacity it will pop. Each clone that ends will also increase stretch the Okami's mana a little more, increasing the maximum capacity of the Orb! Spend more mana when you can to try again, and aim for the Scroll Archives building to get more use out of your clones!",
            trigger: function() { return toasts.hasCloneDied(); }
        },
        {
            title: "Scroll Archives",
            text: `The Scroll Archives is where you use your ${tutorialIcon("foxWorker.svg")} Kitsune (or ${tutorialIcon("foxTail.svg")} Okami) to get skills for your clones. When assigned, they will drain ${tutorialIcon("coins.svg")} Coins, ${tutorialIcon("starBead.svg")} Star Beads, and ${tutorialIcon("mana.svg")} Mana to work towards the next research. Then, you will pick one of three choices of skills that change combat for your clone. Hover over certain keywords in the skills for more information!`,
            trigger: function() { return toasts.buildingBuilt("scrollArchives"); }
        },
        {
            title: "Skills",
            text: "Each skill has a few things, found by selecting the skill in the Skills tab. It gains Skill Exp on its trigger condition, and 1/10th of that exp goes towards Talent Exp. When the skill levels up, it will improve the effect of the skill, as well as gaining x1.05 more Skill and Talent Exp, but you lose the Skill exp and level when the clone ends. Talent levels increase future Skill and Talent Exp by x1.01 per level, but does not reset when the clone ends. In this way, each clone makes the next one a little stronger. Research more skills to start getting their Talent levels, to make your clones stronger!",
            trigger: function() { return toasts.hasResearchedSkill(); }
        },
        {
            title: "A Bronze Star",
            text: `Congratulations on clearing the first map! You've received a ${tutorialStar("bronze")} Bronze Star! This can be applied to any of your skills to get x1.5 Skill and Talent exp.<br><br>With each Bronze star gained, you also unlock the next map to try. It may or may not give you more coins and talent exp, but it does mean that different shards are available, which will become one of the choices with the next research you choose from.<br><br>With each star gained, the cost of the next research drops by 1. In addition, each ${tutorialStar("bronze")} Bronze Star will give 1 ${tutorialIcon("foxWorker.svg")} Kitsune, each ${tutorialStar("silver")} Silver Star will give 2 ${tutorialIcon("foxWorker.svg")} Kitsune, and each ${tutorialStar("gold")} Gold Star will give 3 ${tutorialIcon("foxWorker.svg")} Kitsune!<br><br>After a short break, the clone will attempt to do the next star's worth of difficulty. Each star is 4x harder but gives 2x the coins and exp and 3x the shard drop rate, so you will likely get a few bronze stars before your first silver. Experiment with different settings for optimal growth!`,
            trigger: function() { return toasts.hasBronzeStar(); }
        },
        {
            title: "Level Plan",
            text: "With the Blessing of Planned Growth, you've gained the ability to set additional leveling stats yourself, by creating a plan in the Leveling tab. Experiment with different settings for optimal growth!",
            trigger: function() { return toasts.plannedGrowthBought(); }
        },
        {
            title: "Burning Hot",
            text: "You've received your first fire spirit! For now, it can increase the base heat of Bonfire. With the right Atelier upgrade, you will be able to smelt Ore into Bars.",
            trigger: function() { return toasts.fireSpiritsBought() > 0; }
        }
    ],
    buildingBuilt: function(key) {
        const base = data.progress && data.progress.base;
        const rh = base && base.foxDen;
        return !!(rh && rh.unlocks && rh.unlocks[key]);
    },
    woodAmount: function() {
        const bf = data.progress && data.progress.base && data.progress.base.bambooForest;
        return (bf && bf.wood) || 0;
    },
    stoneAmount: function() {
        const pile = data.progress && data.progress.base && data.progress.base.stonePile;
        return (pile && pile.stone) || 0;
    },
    hasWoodChips: function() {
        const bf = data.progress && data.progress.base && data.progress.base.bambooForest;
        if (!bf) {
            return false;
        }
        return (bf.chips || 0) > 0 || (bf.wood || 0) > 0;
    },
    bambooStalkFullyCut: function() {
        const bf = data.progress && data.progress.base && data.progress.base.bambooForest;
        if (!bf || !bf.stalks) {
            return false;
        }
        for (let si = 0; si < bf.stalks.length; si++) {
            const cells = bf.stalks[si] && bf.stalks[si].cells;
            if (!cells || cells.length < 3) {
                continue;
            }
            let empty = true;
            for (let ri = 0; ri < cells.length; ri++) {
                if ((cells[ri].lumber || 0) > 0) {
                    empty = false;
                    break;
                }
            }
            if (empty) {
                return true;
            }
        }
        return false;
    },
    plantSpiritsBought: function() {
        const torii = data.progress && data.progress.base && data.progress.base.torii;
        return (torii && torii.plantSpiritsBought) || 0;
    },
    earthSpiritsBought: function() {
        const hs = data.progress && data.progress.base && data.progress.base.hiddenSpring;
        return (hs && hs.earthSpiritsBought) || 0;
    },
    fireSpiritsBought: function() {
        const hs = data.progress && data.progress.base && data.progress.base.hiddenSpring;
        return (hs && hs.fireSpiritsBought) || 0;
    },
    isFirstDepthReady: function() {
        const mine = data.progress && data.progress.base && data.progress.base.mine;
        if (!mine) {
            return false;
        }
        if ((mine.currentDepth || 0) >= 1) {
            return true;
        }
        const clears = mine.clearsByDepth || {};
        return (clears[0] || 0) >= 10;
    },
    hasCloneDied: function() {
        if (data.battle && data.battle.state === "dead") {
            return true;
        }
        const mana = data.progress && data.progress.mana;
        return !!mana && (mana.capacityBonus || 0) > 0;
    },
    hasResearchedSkill: function() {
        const lib = data.progress && data.progress.base && data.progress.base.scrollArchives;
        const unlocked = lib && lib.unlockedSkills;
        if (!unlocked) {
            return false;
        }
        const keys = Object.keys(unlocked);
        for (let i = 0; i < keys.length; i++) {
            if (unlocked[keys[i]]) {
                return true;
            }
        }
        return false;
    },
    hasBronzeStar: function() {
        const pool = data.progress && data.progress.stars;
        if (pool && (pool.bronze || 0) > 0) {
            return true;
        }
        const mapStars = (data.progress && data.progress.mapStars) || {};
        const mapKeys = Object.keys(mapStars);
        for (let i = 0; i < mapKeys.length; i++) {
            if (mapStars[mapKeys[i]] && mapStars[mapKeys[i]].bronze) {
                return true;
            }
        }
        const sk = (data.progress && data.progress.skills) || {};
        const skillKeys = Object.keys(sk);
        for (let i = 0; i < skillKeys.length; i++) {
            const stars = sk[skillKeys[i]] && sk[skillKeys[i]].stars;
            if (stars && stars.bronze) {
                return true;
            }
        }
        return false;
    },
    plannedGrowthBought: function() {
        const bf = data.progress && data.progress.base && data.progress.base.bonfire;
        return !!(bf && bf.plannedGrowthBlessingUnlocked);
    },
    escapeHtml: function(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    },
    blankStates: function() {
        const states = [];
        for (let i = 0; i < toasts.defs.length; i++) {
            states.push("");
        }
        return states;
    },
    ensureStates: function() {
        if (!Array.isArray(data.tutorialToasts)) {
            data.tutorialToasts = [];
        }
        while (data.tutorialToasts.length < toasts.defs.length) {
            data.tutorialToasts.push("");
        }
    },
    create: function() {
        if (toasts._built) {
            return;
        }
        toasts._built = true;
        let rows = "";
        for (let i = 0; i < toasts.defs.length; i++) {
            const title = toasts.escapeHtml(toasts.defs[i].title);
            rows += `<div id="tutorialToast_${i}" class="tutorial-toast" style="display:none" onclick="toasts.onToastClick(${i})"><div class="tutorial-toast-title">${title}</div><button type="button" class="tutorial-toast-x" onclick="toasts.onDismissClick(${i}, event)">X</button></div>`;
        }
        const html = `<div id="tutorialToastStack">${rows}</div>`
            + `<div id="tutorialToastBackdrop" style="display:none" onclick="toasts.closePanel()"></div>`
            + `<div id="tutorialToastPanel" style="display:none">`
            + `<button type="button" id="tutorialToastPanelX" class="tutorial-toast-x" onclick="toasts.closePanel()">X</button>`
            + `<div id="tutorialToastPanelTitle"></div>`
            + `<div id="tutorialToastPanelBody"></div>`
            + `</div>`;
        document.body.insertAdjacentHTML("beforeend", html);
    },
    check: function() {
        if (!toasts._built || typeof data === "undefined") {
            return;
        }
        toasts.ensureStates();
        let changed = false;
        for (let i = 0; i < toasts.defs.length; i++) {
            if (data.tutorialToasts[i] !== "") {
                continue;
            }
            if (toasts.defs[i].trigger()) {
                data.tutorialToasts[i] = "on";
                changed = true;
            }
        }
        if (changed && typeof saving !== "undefined" && saving.save) {
            saving.save();
        }
        toasts.sync();
    },
    setState: function(index, next) {
        toasts.ensureStates();
        if (index < 0 || index >= toasts.defs.length) {
            return;
        }
        if (data.tutorialToasts[index] === next) {
            toasts.sync();
            return;
        }
        data.tutorialToasts[index] = next;
        if (typeof saving !== "undefined" && saving.save) {
            saving.save();
        }
        toasts.sync();
    },
    onToastClick: function(index) {
        toasts.ensureStates();
        const state = data.tutorialToasts[index];
        if (state !== "on" && state !== "closed") {
            return;
        }
        toasts.setState(index, "open");
    },
    onDismissClick: function(index, event) {
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }
        toasts.ensureStates();
        const state = data.tutorialToasts[index];
        if (state !== "on" && state !== "closed") {
            return;
        }
        toasts.setState(index, "off");
    },
    isPanelOpen: function() {
        if (toasts.viewingTips) {
            return true;
        }
        const states = data.tutorialToasts || [];
        for (let i = 0; i < states.length; i++) {
            if (states[i] === "open") {
                return true;
            }
        }
        return false;
    },
    closePanel: function() {
        if (toasts.viewingTips) {
            toasts.viewingTips = false;
            toasts.sync();
            return;
        }
        toasts.ensureStates();
        for (let i = 0; i < toasts.defs.length; i++) {
            if (data.tutorialToasts[i] === "open") {
                toasts.setState(i, "closed");
                return;
            }
        }
    },
    openTips: function() {
        toasts.viewingTips = true;
        toasts.sync();
    },
    fillPanel: function(openIndex) {
        const titleEl = document.getElementById("tutorialToastPanelTitle");
        const bodyEl = document.getElementById("tutorialToastPanelBody");
        if (!titleEl || !bodyEl) {
            return;
        }
        if (toasts.viewingTips) {
            titleEl.textContent = "Tips";
            const states = data.tutorialToasts || [];
            let html = "";
            let count = 0;
            for (let i = 0; i < toasts.defs.length; i++) {
                if (states[i] !== "off") {
                    continue;
                }
                const def = toasts.defs[i];
                html += `<div class="tutorial-tip-entry"><div class="tutorial-tip-title">${toasts.escapeHtml(def.title)}</div><div class="tutorial-tip-text">${def.text}</div></div>`;
                count++;
            }
            bodyEl.innerHTML = count ? html : `<div class="muted-text">No dismissed tips yet.</div>`;
            bodyEl.scrollTop = 0;
            return;
        }
        if (openIndex < 0) {
            titleEl.textContent = "";
            bodyEl.innerHTML = "";
            return;
        }
        const def = toasts.defs[openIndex];
        titleEl.textContent = def.title;
        bodyEl.innerHTML = def.text;
        bodyEl.scrollTop = 0;
    },
    sync: function() {
        if (!toasts._built) {
            return;
        }
        const states = data.tutorialToasts || [];
        for (let i = 0; i < toasts.defs.length; i++) {
            const row = document.getElementById("tutorialToast_" + i);
            if (!row) {
                continue;
            }
            const state = states[i] || "";
            const visible = state === "on" || state === "open" || state === "closed";
            row.style.display = visible ? "flex" : "none";
            if (state === "on") {
                row.classList.add("tutorial-toast--on");
            } else {
                row.classList.remove("tutorial-toast--on");
            }
            if (state === "closed") {
                row.classList.add("tutorial-toast--closed");
            } else {
                row.classList.remove("tutorial-toast--closed");
            }
        }
        let openIndex = -1;
        if (!toasts.viewingTips) {
            for (let i = 0; i < toasts.defs.length; i++) {
                if (states[i] === "open") {
                    openIndex = i;
                    break;
                }
            }
        }
        const backdrop = document.getElementById("tutorialToastBackdrop");
        const panel = document.getElementById("tutorialToastPanel");
        const show = toasts.viewingTips || openIndex >= 0;
        if (backdrop) {
            backdrop.style.display = show ? "block" : "none";
        }
        if (panel) {
            panel.style.display = show ? "flex" : "none";
        }
        const key = toasts.viewingTips ? "tips" : (openIndex >= 0 ? ("open:" + openIndex) : "");
        if (key !== toasts._panelKey) {
            toasts._panelKey = key;
            toasts.fillPanel(openIndex);
        }
    }
};
