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

changelog.addSection("Big patch; skills rework", "0.2", 
    `Skill/Shard Rework:
* Skills now have a category, and must be equipped in a limited number of slots.
* Existing players will have to equip skills for them to start working again.
* Shard drops will increase the skill slots available, and are not skill-specific. Existing players shard count across all skills has been converted to the new shard amount, though it will need to farmed again
* To start, the first 3 researches will be Offense, Defense, and Utility to ensure you have those skill types. After that, they will be random (no preference for shard skills any more)
* Skill research is made more expensive to start and climbs faster
* All skills are made stronger. Their different skill exp/talent exp base is also shown.
* Most skills effects start at level 0
* Standardized skill exp / talent gain
* Instead stars reducing the research cost by ~1.1 per star, bronze reduces research costs, silver increases research speed, and gold increases research gain. This will result in less total skills available for players
* Damage/Health order is shown in Stats' info, and is changed: Clout will be reduced before other damage reduction. Some skill's flat damage were not being multiplied by Bru either
* Clout gained is increased by +5% per Confidence and +5% per Charisma
* Outrage reworked to build a counter to trigger like Malice, now gives attack speed and coins on trigger.
* Fake Tears reworked to stack and use half of its stacks upon taking damage, allowing it to grow via high-level skills well.
* >10 new skills
* Equipped skills give flat bonuses that are multiplied by the clone density bonus based on total talent levels of the skills equipped of that column
* Speed is renamed to Charisma, and makes enemies come at you faster as well as giving a coin multiplier
* All healing is named as such, and is increased by the Confidence Mult.
* Added a "Healed", "Clout Gained", "Extra Coins Dropped", and "Flat Damage Blocked" Stat info cards for seeing the value/effect of various skills.
* Changed text info within the Stat info cards to be less confusing and show more
* Equipped Skill loadouts

Prestige Rework:
* The shrine milestone/card info has been moved to the Card tab (renamed from Card Bonuses)
* Cards can be bought for 30k Divinity in the Cards tab. Milestones give slightly less higher rarity cards.
* Cards can be opened immediately, without a prestige. Some cards that gave bonuses on prestige have been reworked.
* Added a Prestige tab for the prestige, which now does not reset buildings or upgrades.
* Prestige renamed to Fade into Legend. Each prestige will require 100k mana. If you have 8 (+2 stars per legend), you reach the next Legend Written, which will give unique bonuses. This is the mechanism of where content will come from, though that will largely be WIP until next patch - only the first exists right now. Resetting without the star requirement is possible to reset relevant milestones for more cards / gain more max divinity. 
* Base max divinity lowered to 50k. Max Divinity increases by total talent level^1.2 upon doing Prestige. I will likely improve this rate next patch.
* The cards "Spirit Training Spot Available" and "Starting Coins" no longer apply, and the card packs have been refunded if you had them.

Scroll Archive Rework:
* Instead a flat growth rate, it is now a different formula where each row feeds into the next one. Kitsune workers now increase the rate it increases, but it works to unlock research over time regardless. Made it harder but more idle, and with costs increasing over time differently. It will result in less skills, but still outpace skill slots. 
* Stars now change the effect of the kitsune workers in Scroll Archives individually per star type. Bronze reduces cost, silver increases speed, gold increases gain.

Other:
* Greatly increased performance
* Map difficulty increases faster
* Added info buttons everywhere and moved most muted text into them to reduce clutter. Click them for the info of that panel. They will flash if there is new information until clicked
* Coin gain increases faster in the travel maps. Modified the cost of some upgrades accordingly.
* Added an upgrade for a checkbox for water droplets to spawn evenly
* Leveling and Skills tabs are scrollable
* Hidden Training Spot values are updated based on card upgrades
* Made Pebbles, Droplets, and fire projectiles smoother across the path
* Changed Essence display, added text explaining it within Cistern
* Kitsune Carriers from the Fox Den now spawn once per second *per resource*
* Burst Launcher damage graphic and range now match
* Exp/s display for fire spirits, water spirits, and hidden training spot
* Fixed fire spirit training value not being used correctly
* XP gain text in battlefield includes skill bonuses
* Added search to Skills
* Fixed saving being throttled when tabbed away/minimized. 
* Fixed offline timer when sleeping/laptop closed.
`);


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

(function() {
    const label = document.getElementById("gameVersionLabel");
    const version = changelog.entries.length ? changelog.entries[0].version : "";
    if (label && version) {
        label.textContent = "v" + version;
    }
})();
