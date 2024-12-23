//this file is self-contained to create everything needed for a menu
//createMenu() - makes the button / menu / title
//addMenuTextTab("Help", <desc>) Adds a menu tab with the following text
//addMenuTextTab("Strategy", <desc>) Adds a menu tab with the following text
//addMenuOptionsTab() adjust fps, saving
//addStatisticsTab()
//addMenuTextTab("Previous Tips", <desc>) Adds a new tab that duplicates the toasts but can't

function initializeMenu() {
    createMenu(); // makes the button | menu | title
    addMenuTextTab("Help", '<desc>'); //Adds a menu tab with the following text
    addMenuTextTab("Strategy", '<desc>'); //Adds a menu tab with the following text
    addMenuOptionsTab(); //adjust fps, saving
    addStatisticsTab();
    addMenuTextTab("Previous Tips", '<desc>'); //Adds a new tab that duplicates the toasts but can't
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