Views.registerView("talentTree", {
    selector: "#talentTree",
    talentTree() {
        let html = "";
        for (const talent in talentData) {
            html += talent;
        }
        return html;
    },
    html() {
    // todo: add talent tree
        const html =
            `<div>
                    
            </div>`;
        return html;
    },
});

