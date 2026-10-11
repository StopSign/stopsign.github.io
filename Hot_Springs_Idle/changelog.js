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

changelog.addSection("Small Changes", "0.1.1",
    "* Added changelog\n" +
    "* Added a \"Select next path\" button to reduce confusion\n"
    + "* Changed Arrangement of Remembrance to handle paths better\n"
    + "* Moved progress bars to the top of the page\n"
    + "* Fixed Arrangement of Appraisal for paths"
);
changelog.addSection("Release!", "0.1", "Game is released!");
