//this file is self-contained to create everything needed for a menu
//createMenu() - makes the button / menu / title
//addMenuTab("Help", <desc>) Adds a menu tab with the following text
//addMenuTab("Strategy", <desc>) Adds a menu tab with the following text
//addMenuOptionsTab() adjust fps, saving
//addStatisticsTab()
//addMenuTab("Previous Tips", <desc>) Adds a new tab that duplicates the toasts but can't


function initializeMenus() {
    createMenu(); // makes the button | menu | title
    addMenuTab("help");
    addMenuTab("story");
    addMenuOptionsTab(); //adjust fps, saving
    addStatisticsTab();
    addMenuTab("previousTips");
    addMenuTextContainer("help", createHelpMenu());
    addMenuTextContainer("story", createStoryMenu());
    addMenuTextContainer("options", createOptionsMenu());
    addMenuTextContainer("statistics", createStatisticsMenu());
    addMenuTextContainer("previousTips", "Close tips to fill this screen!");
    updatePreviousTipsMenu();
}

function createHelpMenu() {
    return "<div class='menuTitle'>Help</div>" +
        "<div class='menuSeparator'></div><br>" +
        "Skill issue. (TODO)"
}

function createStoryMenu() {
    return "<div class='menuTitle'>Background</div>" +
        "<div class='menuSeparator'></div><br>" +
        "You grew up with this ability, thinking it worthless. You figured out a trick with it a long time ago, to build itself. You used it to get out of the war, but you ended up doing so at the cost of your squad, and your guilt haunts you, and you found yourself as far away as you could, in an isolated area with only an outpost nearby. Here, you won't be able to hurt anyone, you hope." +
        "<br><br>But now that you're settled into a routine, barely getting by, you realize that all you are is wasted potential. Without thinking of it much, you set the ability to itself. It might pull you forward, even as your past keeps you locked in place."
}

function createStatisticsMenu() {
    return "<div class='menuTitle'>Statistics</div>" +
        "<div class='menuSeparator'></div><br>" +
        "What do you want to know?"
}

function updatePreviousTipsMenu() {
    let tipStr = "<div class='menuTitle'>Previously Closed Tips</div>" +
        "<div class='menuSeparator'></div>";
    viewData.toasts.forEach(function(toastObj) {
        if(data.toastStates[toastObj.id] !== 'closed') {
            return;
        }
        tipStr += "<span style='font-size:14px;'>Tip #"+toastObj.id+":</span><br>"+toastObj.message+"<br><br>";
    })

    document.getElementById("previousTipsTextContainer").innerHTML = tipStr;
}
function createOptionsMenu() {
    return "<div class='menuTitle'>Options</div>" +
        "<div class='menuSeparator'></div>" +
        "<div class='button' style='padding:10px;font-size:14px;width:200px;' " +
         "id='lightModeButton' onClick='changeDarkMode()'>Change to Light Mode</div>" +
        "<div class='button' style='padding:10px;font-size:14px;width:200px;' " +
        "id='numberTypeButton' onClick='changeNumberType()'>Change numbers to scientific</div>" +
        "<br><br>Auto save every 5 seconds, but if you want a button to click:<br>" +
        "<div class='button' style='padding:10px;font-size:14px;width:200px;' " +
        "onClick='save()'>Save</div><br><br>" +
        "<div class='button' style='padding:10px;font-size:14px;width:200px;' " +
        "onClick='exportSave()'>Export to clipboard</div><br><br>" +
        "<label for='exportImportSave'>Put your save here to import: </label><input type='text' id='exportImportSave'><br>" +
        "<input type='checkbox' id='confirmImportCheckbox'><label for='confirmImportCheckbox'>Confirm</label>" +
        "<div class='button' style='padding:10px;font-size:14px;width:200px;' " +
        "onClick='importSave()'>Import</div><br><br>";
}

function changeNumberType() {
    if(data.numberType === "engineering") {
        data.numberType = "scientific";
    } else if(data.numberType === "scientific") {
        data.numberType = "engineering";
    }

    document.getElementById("numberTypeButton").innerText = "Change numbers to " + (data.numberType === "engineering"?"scientific":"engineering");
}

function changeDarkMode() {
    const body = document.body;

    // Toggle the dark-mode class
    body.classList.toggle('lightMode');
    document.getElementById('lightModeButton').innerText = "Change to " + (body.classList.contains('lightMode') ? "Dark" : "Light") + " Mode";
}

function addMenuTextContainer(menuVar, menuText) {
    let menuContainer = "<div id='"+menuVar+"TextContainer' style='display:none;padding:5px;text-align:left;'>" +
        menuText +
        "</div>";

    let child = document.createElement("template");
    child.innerHTML = menuContainer;
    document.getElementById("menuTextDisplayContainer").appendChild(child.content);
}

function createMenu() {
let helpMenu =
    "<div id='helpMenu' class='fullScreenGrey' style='display:none;' onClick='clickMenuButton()'>" +
        "<div class='centerMenuBox' onclick='stopClicks(event)''>" +
            "<div class='menuTitle'>Options and Info Menu</div>" +
            "<div class='menuSeparator'></div>" +
            "<div id='menuIndexContainer' style='height:460px;width:30%;background-color:var(--menu-tab-background-color);display:inline-block;vertical-align: top;'></div>" +
            "<div id='menuTextDisplayContainer' style='height:460px;width:70%;background-color:var(--menu-background-color);display:inline-block;vertical-align: top;overflow-y:auto'></div>" +
        "</div>" +
    "</div>";
    document.getElementById("helpMenuContainer").innerHTML = helpMenu;
}

let menuInfo = [];
let selectedMenu = null;
function addMenuTab(menuVar) {
    menuInfo.push(menuVar);
    let newMenu = "<div id='"+menuVar+"MenuTab' onclick='clickMenuTab(\""+menuVar+"\")' style='border:1px solid; padding:5px 0;width:99%;height:20px;border-radius:3px;background-color:var(--menu-tab-button-color);cursor:pointer;font-size:16px;'>" +
        decamelizeWithSpace(menuVar) +
        "</div>";

    let child = document.createElement("template");
    child.innerHTML = newMenu;
    document.getElementById("menuIndexContainer").appendChild(child.content);
}

function clickMenuTab(menuVar) {
    if(selectedMenu) {
        document.getElementById(selectedMenu+"TextContainer").style.display = "none";
        document.getElementById(selectedMenu+"MenuTab").style.background = "var(--menu-tab-button-color)";
        if(selectedMenu === menuVar) {
            selectedMenu = null;
            return;
        }
    }
    selectedMenu = menuVar;
    document.getElementById(menuVar+"TextContainer").style.display = "";
    document.getElementById(selectedMenu+"MenuTab").style.background = "#8b5cf6";
}

function addMenuOptionsTab() {
    addMenuTab("options");
}

function addStatisticsTab() {
    addMenuTab("statistics");
}