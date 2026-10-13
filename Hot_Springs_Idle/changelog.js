const changelog = {
    entries: [],

    addSection: function(title, version, text) {
        changelog.entries.push({
            title: title,
            version: version,
            text: text
        });
    },

    isOpen: function() {
        const panel = document.getElementById("changelogPanel");
        return !!(panel && panel.style.display === "flex");
    },

    open: function() {
        const panel = document.getElementById("changelogPanel");
        const backdrop = document.getElementById("changelogBackdrop");
        const body = document.getElementById("changelogPanelBody");
        if (!panel || !body) {
            return;
        }
        let html = "";
        for (let i = 0; i < changelog.entries.length; i++) {
            const e = changelog.entries[i];
            html += `<div class="changelog-entry">`
                + `<div class="changelog-entry-title">${changelog.escapeHtml(String(e.title))}`
                + ` <span class="changelog-entry-version">v${changelog.escapeHtml(String(e.version))}</span></div>`
                + `<div class="changelog-entry-text">${changelog.escapeHtml(String(e.text)).replace(/\n/g, "<br>")}</div>`
                + `</div>`;
        }
        body.innerHTML = html || `<div class="muted-text">No changelog entries yet.</div>`;
        body.scrollTop = 0;
        if (backdrop) {
            backdrop.style.display = "block";
        }
        panel.style.display = "flex";
    },

    close: function() {
        const panel = document.getElementById("changelogPanel");
        const backdrop = document.getElementById("changelogBackdrop");
        if (panel) {
            panel.style.display = "none";
        }
        if (backdrop) {
            backdrop.style.display = "none";
        }
    },

    escapeHtml: function(s) {
        return String(s)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }
};

changelog.addSection("Rounded Stone patch", "0.1.4",
    `* Fixed a bug where stone would be fractional`);
changelog.addSection("Addressing Bugs and Suggestions", "0.1.3",
    `Big:
    * Able to gain bonus time instead of forcing offline calculation in Options. It's a bad ratio, but available for those who want to be there for all of the progress.
    * Removed forge banking (it was a bug)
    * Added shift-click to add 1 kitsune worker, shift-right click to unassign 1 kitsune worker to a building 
    * Resuming a paused upgrade will move it to the top of the queue in Fox Den. It will prioritize the queue as listed (previously prioritized building over upgrades regardless of order)
    * Added Arrangements for automatic path building. The road one will only be available after the first prestige, the other ones are available with Atelier being built. 
    
    Medium:
    * Hover-over a building during construction for its per-resource progress
    * Pebble/droplet ETA
    * Show max of Build Walls/Build Stairs/Build Floor
    * Water carriers will partial fill to top off buildings with water
    * Having 0 Bamboo workers does not remove selected Cut. It will keep growing with 0 workers as well.
    * Upgrades that only use instant-tranfer resources like Coins or Mana no longer become dimmed/unuseable when fox den queue is maxed out
    * Added drag-and-drop for moving spirits
    * Added an average guest timer on Torii Gate
    * Combined used stone and duplicated stone. 1 stone -> 2 duplicated stone
    * Upgrades at the Atelier that use ore/bars will transfer those resources instantly while building
    * Water Spirits that were bought and missing are re-applied. Further ones will appear properly.
    
    Small:
    * Able to switch maps without clone density upgrade
    * Changed text of skill info for clarity
    * Added text to Launchers to show fire spirit requirement
    * Hiding water carry text until the appropriate upgrade is bought 
    * Clone mana cost will change color if you can afford it
    * Map 10 unlocks with Map 9, not Map 8
    * Named the savefile correctly `)
    
changelog.addSection("Bug Fixes", "0.1.2", 
    `* Fixed a gamebreaking bug if you happened to load the game before I told anyone it existed
* Added hide info for spirits to allow for switching them in compact mode`)
changelog.addSection("Small Changes", "0.1.1",
    "* Added changelog\n" +
    "* Added a \"Select next path\" button to reduce confusion\n"
    + "* Changed Arrangement of Remembrance to handle paths better\n"
    + "* Moved progress bars to the top of the page\n"
    + "* Fixed Arrangement of Appraisal for paths"
);
changelog.addSection("Release!", "0.1", "Game is released!");
