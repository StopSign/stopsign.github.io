Views.registerView("buffsContainer", {
    selector: "#buffsContainer",
    html() {
        const fullNames = {
            Ritual: "Dark Ritual",
            Imbuement: "Imbue Mind",
            Feast: "Great Feast",
            Aspirant: "The Spire"
        };
        let html = "";
        for (const buff of buffList) {
            const fullName = fullNames[buff];
            const XMLName = getXMLName(fullName);
            const desc2 = _txtsObj(`buffs>${XMLName}`)[0].innerHTML.includes("desc2");
            html +=
                `<div class="buffContainer showthat" id="buff${buff}Container">
                    <div class="buffNameContainer">
                        <img class="buffIcon" src="img/${camelize(fullName)}.svg">
                        <div class="skillLabel medium bold">${_txt(`buffs>${XMLName}>label`)}</div>
                        <div class="showthis">
                            <span>${_txt(`buffs>${XMLName}>desc`)}</span>
                            <br>
                            ${desc2 ? `<span class="localized" data-lockey="buffs>${XMLName}>desc2"></span>` : ""}
                        </div>
                    </div>
                    <div class="buffNumContainer">
                        <div id="buff${buff}Level">0/</div>
                        <input type="number" id="buff${buff}Cap" class="buffmaxinput" value="${buffHardCaps[buff]}" onchange="updateBuffCaps()">
                    </div>
                </div>`;
        }
        return html;
    },
});
