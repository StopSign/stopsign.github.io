//this file is self-contained to create everything needed for a menu
//createMenu() - makes the button / menu / title
//addMenuTextTab("Help", <desc>) Adds a menu tab with the following text
//addMenuTextTab("Strategy", <desc>) Adds a menu tab with the following text
//addMenuOptionsTab() adjust fps, saving
//addStatisticsTab()
//addMenuTextTab("Previous Tips", <desc>) Adds a new tab that duplicates the toasts but can't

function initializeMenus() {
    createMenu(); // makes the button | menu | title
    addMenuTextTab("Help", '<desc>'); //Adds a menu tab with the following text
    addMenuTextTab("Strategy", '<desc>'); //Adds a menu tab with the following text
    addMenuOptionsTab(); //adjust fps, saving
    addStatisticsTab();
    addMenuTextTab("Previous Tips", '<desc>'); //Adds a new tab that duplicates the toasts but can't

    //Create amulet upgrades
    addAmuletContent();
}

function addAmuletContent() {
    let amuletContent = "";

    for (let upgradeVar in data.upgrades) {
        let upgrade = data.upgrades[upgradeVar];

        // Start a new row for each upgrade
        amuletContent += "<div style='margin-bottom:10px;'>";
        amuletContent += "<div style='text-align:center; width:100%;font-size:16px;margin-bottom:5px;'>" + decamelize(upgradeVar) + "</div>";

        // Generate buttons for available upgrades
        for (let i = 0; i < upgrade.upgradesAvailable; i++) {
            let isBought = upgrade.upgradesBought.includes(i);
            let backgroundColor = isBought ? "#808080" : "#d3d3d3"; // Darker grey if purchased
            let textColor = isBought ? "#ffffff" : "#000000";
            let id = upgradeVar+"Button"+i;
            amuletContent += "<button class='upgradeButton' id='"+id+"'" +
                " style='background:" + backgroundColor + "; color:" + textColor + ";'" +
                " onClick='selectBuyUpgrade(\"" + upgradeVar + "\", " + i + ")'>" +
                "</button>";
        }
        amuletContent += "</div>";
    }

    document.getElementById("amuletUpgrades").innerHTML = amuletContent;
}



function createMenu() {
let helpMenu =
    "<div id='helpMenu' class='fullScreenGrey' style='display:none;' onClick='clickMenuButton()'>" +
        "<div class='centerMenuBox'>" +
            "<div class='menuTitle'>Title</div>"
        "</div>" +
    "</div>";
    document.getElementById("helpMenuContainer").innerHTML = helpMenu;
}

function addMenuTextTab() {

}

function addMenuOptionsTab() {

}

function addStatisticsTab() {

}