function toggleSettingsBox() {
    if(menuOpen === "settings") {
        closeSettingsBox();
    } else  {
        openSettingsBox();
    }
    adjustMenus();
}
function openSettingsBox() {
    menuOpen = "settings";
    adjustMenus();
}
function closeSettingsBox() {
    menuOpen = "";
    adjustMenus();
}
function toggleHelp() {
    if(menuOpen === "help") {
        closeHelpBox()
    } else  {
        openHelpBox()
    }
}
function openHelpBox() {
    menuOpen = "help";
    adjustMenus();
}
function closeHelpBox() {
    menuOpen = "";
    adjustMenus();
}
function toggleBuild() {
    if(menuOpen === "build") {
        closeBuildBox()
    } else  {
        openBuildBox()
    }
}
function openBuildBox() {
    menuOpen = "build";
    adjustMenus();
}
function closeBuildBox() {
    menuOpen = "";
    adjustMenus();
}
function toggleLevelMenu() {
    if(menuOpen === "level") {
        closeLevelBox()
    } else  {
        openLevelBox()
    }
}
function openLevelBox() {
    menuOpen = "level";
    adjustMenus();
}
function closeLevelBox() {
    menuOpen = "";
    adjustMenus();
}

function toggleUpgradeMenu() {
    if(menuOpen === "upgrade") {
        closeUpgradeBox()
    } else  {
        openUpgradeBox()
    }
}
function openUpgradeBox() {
    menuOpen = "upgrade";
    adjustMenus();
}
function closeUpgradeBox() {
    menuOpen = "";
    adjustMenus();
}

function toggleStatsMenu() {
    if(menuOpen === "stats") {
        closeStatsBox()
    } else  {
        openStatsBox()
    }
}
function openStatsBox() {
    menuOpen = "stats";
    adjustMenus();
}
function closeStatsBox() {
    menuOpen = "";
    adjustMenus();
}

function adjustMenus() {
    closeMenus();
    if(menuOpen === "help") {
        document.getElementById('helpBox').style.display = "block";
        document.getElementById('infoPanel').style.display = "block";
    } else if(menuOpen === "settings") {
        document.getElementById('settingsBox').style.display = "block";
        document.getElementById('infoPanel').style.display = "block";
    } else if(menuOpen === "build") {
        document.getElementById('buildBox').style.display = "block";
        document.getElementById('infoPanel').style.display = "block";
    } else if(menuOpen === "level") {
        document.getElementById('levelBox').style.display = "block";
        document.getElementById('infoPanel').style.display = "block";
    } else if(menuOpen === "upgrade") {
        document.getElementById('upgradeBox').style.display = "block";
        document.getElementById('infoPanel').style.display = "block";
    } else if(menuOpen === "stats") {
        document.getElementById('statsBox').style.display = "block";
        document.getElementById('infoPanel').style.display = "block";
    } else if(selected.length > 0) {
        document.getElementById('infoBox').style.display = "block";
        document.getElementById('infoPanel').style.display = "block";
    }
    if(document.getElementById('infoPanel').style.display === "block") {
        document.getElementById('scrollSouth').style.bottom = "240px";
    }
}

function closeMenus() {
    document.getElementById('infoBox').style.display = "none";
    document.getElementById('buildBox').style.display = "none";
    document.getElementById('levelBox').style.display = "none";
  	document.getElementById('upgradeBox').style.display = "none";
  	document.getElementById('statsBox').style.display = "none";
    document.getElementById('settingsBox').style.display = "none";
    document.getElementById('helpBox').style.display = "none";
    document.getElementById('infoPanel').style.display = "none";
    document.getElementById('scrollSouth').style.bottom = "30px";
}

function selectOneOrMultipleSetting(num) {
    settings.selectOneOrMultiple = num;
}
function selectBuyLowestOrAll(num) {
    settings.buyLowestOrAll = num;
}
function selectLastOrLowest(num) {
    settings.showLastOrLowest = num;
}
function selectAllOrLowestBorderColor(num) {
    settings.selectAllOrLowestBorderColor = num;
}
function selectShowNoneOrNanitesOrAmount(num) {
    settings.selectShowNoneOrNanitesOrAmount = num;
    theView.update();
}
function selectGridFont(num) {
    settings.selectGridFont = num;
    theView.update();
}


function buyAmountOption(num) {
    let highlighted = document.getElementById('buy'+settings.buyPerClick);
    if(highlighted) {
        highlighted.style.backgroundColor = "grey";
    }
    settings.buyPerClick = num;
    document.getElementById('buy'+num).style.backgroundColor = "#ff4400";


    theView.updateInfoBox();

}

function toggleAutobuy(setting) {
    settings.autobuyToggle = setting;
    if(settings.autobuyToggle === 1) {
        document.getElementById('autobuyOn').style.backgroundColor = "green";
        document.getElementById('autobuyOff').style.backgroundColor = "grey";
    } else {
        document.getElementById('autobuyOff').style.backgroundColor = "red";
        document.getElementById('autobuyOn').style.backgroundColor = "grey";
    }
}

function autobuyAmountOption(num) {
    let highlighted = document.getElementById('autobuy'+settings.autobuyPerTick);
    if(highlighted) {
        highlighted.style.backgroundColor = "grey";
    }
    settings.autobuyPerTick = num;
    document.getElementById('autobuy'+num).style.backgroundColor = "#ff4400";


    theView.updateInfoBox();

}



function openUpgradeTab() {
    upgradeTab = "upgrade";
    adjustUpgradeTabs();
}
function openGrowthTab() {
    upgradeTab = "growth";
    adjustUpgradeTabs();
}

function adjustUpgradeTabs() {
    let selectedScreen = document.getElementById("selectedScreen");
    closeUpgradeScreens();
    if (upgradeTab === "upgrade") {
        selectedScreen.style.backgroundColor = "#6d6dc5";
        document.getElementById("upgradeScreen").style.display = "inline-block";
    } else if(upgradeTab === "growth") {
        selectedScreen.style.backgroundColor = "#6bb347";
        document.getElementById("growthScreen").style.display = "inline-block";
    }
}

function closeUpgradeScreens() {
    document.getElementById("upgradeScreen").style.display = "none";
    document.getElementById("growthScreen").style.display = "none";
}