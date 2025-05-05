//this file is self-contained to create everything needed for a menu
//createMenu() - makes the button / menu / title
//addMenuTab("Help", <desc>) Adds a menu tab with the following text
//addMenuTab("Strategy", <desc>) Adds a menu tab with the following text
//addMenuOptionsTab() adjust fps, saving
//addDataTab()
//addMenuTab("Previous Tips", <desc>) Adds a new tab that duplicates the toasts but can't


function initializeMenus() {
    createMenu(); // makes the button | menu | title
    addMenuTab("help");
    addMenuTab("story");
    addMenuOptionsTab(); //adjust fps, saving
    addDataTab();
    addMenuTab("previousTips");
    addMenuTextContainer("help", createHelpMenu());
    addMenuTextContainer("story", createStoryMenu());
    addMenuTextContainer("options", createOptionsMenu());
    addMenuTextContainer("statistics", createDataMenu());
    addMenuTextContainer("previousTips", "Close tips to fill this screen!");
    updatePreviousTipsMenu();


    addMenuTab("cheat");
    addMenuTextContainer("cheat", createCheatMenu());
}

function createCheatMenu() {
    return "<div class='menuTitle'><s>Cheating</s> Developer Mode</div>" +
        "<div class='menuSeparator'></div><br>" +
        "<div class='button' style='width:150px;padding:10px;font-size:16px;' " +
            "id='cheatButton' onClick='increaseGamespeed()'>x2 Game Speed</div>" +
        "<div class='button' style='width:150px;padding:10px;font-size:16px;' " +
            "onClick='resetGamespeed()'>Game Speed = 1</div>"
}

function createHelpMenu() {
    return "<div class='menuTitle'>Help</div>" +
        "<div class='menuSeparator'></div><br>" +
        "Skill issue. (TODO)"
}

function createStoryMenu() {
    return Raw.html`<div class='menuTitle'>Background</div>
        <div class='menuSeparator'></div><br>
        Backstory:<br><br>
        There was a curse on the land, locking powers from being used. Our Emperor Brithan had used one of his abilities to kill an evil lich to the north, and for hundreds of miles those who had abilities could not use them. My ability was Overclock, and the simple description of it was "choose a target; get a little more out of it". I used to change Overclock's target a dozen times a day, enjoying the extra "skips" in my "steps" as it hurried me along, so-to-speak. When, without warning, the curse made all abilities in the country inert and useless, my ability was locked with [Target:Get Somewhere Safe]. It was forever locked on the one thing I desired, and this was a rather painful irony I had to overcome on my march towards certain death.<br><br>

        The Crucible, is what they eventually called it. Gryndal used to be our former ally, a country in the west we have known for many years. They are now known as betrayers could not hold back their greed. They forced a diplomatic incident that demanded a response, and the hope was that they would have honor. Anyone with abilities were collected and added to the pool of army regulars and prisoners to form a formidable fighting force... had any of us been able to use our abilities. Normally these things were a sort of formality, with armies drawing blood and retreating with their honor satisified. This time, our enemy had decided to forsake their honor entirely. They killed all but a handful of men during the journey, experimeting with various long range ablities, summons, and accursed devils. We were defenseless, but we marched onward, for it was our only option. We were all dead men walking.<br><br>
        
        The Gryndallan betrayers let a handful of us cross the border, hoping to see us rage impotently at them. They were disappointed when they only found men waiting for their turn to die. As they were deciding what to do with the small fraction of us remaining, the situation suddenly changed: after 15 years of our abilities being frozen and inert, they suddenly sprange alive and became active. Later we would learn this was the death of the Emperor, but in the moment... well, it had arrived too late. We were captured, and wearing suppression cuffs as according to procedure, and so any last-minute heroism was already stifled. Our hope died before it even lived.<br><br>
        
        Little did I realize the difference, but the suppression cuffs only prevented active use. Overclock had sprung to life, and with 15 years of buildup. Over the next few weeks, I had repeated miraculous luck, from escaping and breaking the cuffs, to getting supplies, to hitching ride after ride. Ultimately, the [Target:Get Somewhere Safe] had gotten me Somewhere Safe.<br><br>
        
        It was only when my legs stopped carrying me to the next task and my hands stayed idle at my sides that I finally realized the only reason I was moving at all was Overclock churning through it's 15 year buildup of momentum. But then, it was out, and I had to find my own reasons for moving forward.<br><br>
        
        At first, I stood there for hours frozen with it all, thinking of everything and nothing, before finally using my senses to discover what my body had done while I wasn't paying attention. I was safe, and knew it to be true - I was in a recently abandoned hunter's cabin, having caught his widow traveling the other way who said it was available for occupation. I had the tools and supplies to let me survive on the wilderness around me as long as I needed. I was not in my home nation of Brythal's Empire, nor in the betrayer Gryndal's lands, but instead the southern country Osric. Osric had been looking at everything happening in the north with caution, but had not interfered.<br<br>
        
        I could exist here, and it would be Safe. And for a few weeks, I did just that while I settled in. But the nightmares got stronger, and the paranoia had bled over into reality. In a move to give myself an option, I ultimately made a decision to attempt to replicate the buildup of 15 years by changing Overclock's target. To some surprise, I set it successfully, and now it read [Target: Overclock].<br><br>
        
        At first, I put this choice out of my mind, only to remember it for comfort when I awoke in the night and little more. This had been a choice to have an apparently fate-bending escape option prepared, should I need it, for however the future was shaped. For 15 years under the Emperor's curse, I had gotten used to daily life without it, and so it was fine to keep the ability in reserve.<br><br>
        
        As the days turned into weeks, I realized I was having increasing trouble sitting still after a day's work, and I was growing sharper in my focus as I went about my daily chores. After a few weeks of quiet and solitude and blessed stagnancy it became easy to point out the problem: my ability was not content to sit on the shelf, doing nothing. Overclock was somehow making me move, making me think.<br><br>
        
        So far I had been lucky, as I had simply done more activity each day, but as the pile of firewood grew not out of further preparation but because I was becoming uncomfortable close to being forced to think about what had happened to me I started to realize that this couldn't go on.<br><br>
        
        And so, after putting it off as long as possible with as many chores and preparations done I could think of, I stopped. I sat on the floor. I breathed. I let it in.
        `
}


function createDataMenu() {
    return "<div class='menuTitle'>Data</div>" +
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
        "<br>TODO set FPS<br>" +
        "<br><br>Auto save every 5 seconds, but if you want a button to click:<br>" +
        "<div class='button' style='padding:10px;font-size:14px;width:200px;' " +
        "onClick='save()'>Save</div><br><br>" +
        "<div class='button' style='padding:10px;font-size:14px;width:200px;' " +
        "onClick='exportSave()'>Export to clipboard</div><br><br>" +
        "<label for='exportImportSave'>Put your save here to import (import a clear save to hard reset):<br></label><input type='text' id='exportImportSave'><br>" +
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

function addDataTab() {
    addMenuTab("statistics");
}