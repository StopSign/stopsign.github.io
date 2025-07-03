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

    addMenuTab("shop");
    addMenuTextContainer("shop", createShopMenu());

    addMenuTab("cheat");
    addMenuTextContainer("cheat", createCheatMenu());
}

function createCheatMenu() {
    return Raw.html`
        <div class="menuTitle"><s>Cheating</s> Developer Mode</div>
        <div class="menuSeparator"></div><br>
        <div class="button" style="width:150px;padding:10px;font-size:16px;" 
            id="cheatButton" onClick="increaseGamespeed()">x2 Game Speed</div>
        <div class="button" style="width:150px;padding:10px;font-size:16px;" 
            onClick="resetGamespeed()">Game Speed = 1</div>`
}

function createShopMenu() {
    return Raw.html`
        <div class="menuTitle">Shop</div>
        <div class="menuSeparator"></div><br>
        Money plz. (TODO)`;
}

function createHelpMenu() {
    return Raw.html`
        <div class="menuTitle">Help</div>
        <div class="menuSeparator"></div><br>
        <span style="font-weight: bold;font-size:20px;">#Skill issue</span>`;
}

function createStoryMenu() {
    return Raw.html`<div class="menuTitle">Background</div>
        <div class="menuSeparator"></div><br>
&nbsp;&nbsp;&nbsp;&nbsp;A lich is a creature of bones, dark magic, and myth, occuring rarely in history and causing catastrophes each time. 13 years ago, the Emperor Brithan of Sovvgor had used one of his Talents to kill a lich far to the north, but not without great cost.
 Though this lich and his evil forces had been vanquished, there was a curse on the land. For hundreds of miles - which mostly included wasteland and the majority of the Empire of Sovvgor - those who had Talents could not use them. 
 Though they told us the cause, it was a bitter pill to swallow for all of the country's citizens. Talents were our magic, our connection to the idea that though the world is big, we have our place in it.<br><br>

&nbsp;&nbsp;&nbsp;&nbsp;My ability is Overclock, and the simple description of it is "Choose a valid target; get a little more out of it". 
I used to change Overclock's target a dozen times a day, enjoying the extra "skips" in my "steps" as it hurried me along, so-to-speak. 
When, without warning, the curse made all abilities in the country inert and useless, my ability was locked with a Target of [Get Somewhere Safe]. 
For a few peaceful years it was just something to grieve and adjust to. However, as Sovvgor was betrayed by our greedy neighbors Gryndall, 
and as I was conscripted and armed and trained as a soldier, the locked target of my Description instead became my mantra and my burden. 
It was forever locked on the one thing I desired, and this was a rather painful irony I had to overcome on my march towards certain death.<br><br>

&nbsp;&nbsp;&nbsp;&nbsp;Gryndal used to be our former ally, a country in the west we have known for many decades. 
But they smelled blood in the water, and who can say they would do different? They forced a diplomatic incident that 
demanded a response, the lords shouted a lot, and off to war us conscripts went. Originally, the hope was that we would 
escape the curse's domain and use our Talents again, and re-equip and re-train accordingly. We had blacksmiths and enchanters! 
The hope was that their honor would give us at least some semblance of a fair fight. How disgustingly optimistic.<br><br>

&nbsp;&nbsp;&nbsp;&nbsp;The Ashmarch, is what they eventually called it, for what was left of the land. They killed all but a handful of men 
during the journey itself, experimenting with how the various long range ablities, summons, and devils lasted into our 
cursed land. We were defenseless, but we marched onward, for it was our only option. Many horrors were on the battlefield those three days. Too many.<br><br>

&nbsp;&nbsp;&nbsp;&nbsp;I try not to think about it.<br><br>
        
&nbsp;&nbsp;&nbsp;&nbsp;The Gryndallan betrayers didn't let us reach the edge of the curse. Our Talents were never unlocked by walking out. 
I think they only left us alive at the edge hoping to be entertained with the last of our impotent revenge. 
They wanted us to burn out in front of them, but they rapidly lost interest when they only found injured men waiting for their turn to die. We were quickly captured.<br><br>

&nbsp;&nbsp;&nbsp;&nbsp;As the Gryndallans were deciding what to do with us, the situation suddenly changed: after 13 years of our abilities
 being frozen and inert, they suddenly sprang alive and became active! Later we would learn this was the Gryndallans who, in an incident of timing,
  had killed our Emperor too early, but in the moment we thought it fortune smiling upon us and seized the moment. My Overclock had also sprung to life,
   and with 13 years of buildup, fate herself bent to see my Target true. My escape was a circus of coincidences
    and unforseen Talent interactions, but I got out - alone. My Talent, with the buildup, had become more than the skip in my steps; 
    it was the whole step, and the knowledge of when and where to do so as well.<br><br> 
    
    Going with the flow of my ability, it carried me out of the fire, out of the war, out of danger, out of caution, and 
    into Safety. Over the next few weeks, I continued the repeated miraculous luck, though the effect diminished over time.
    From finding abandoned horses and supplies, to hearing just the right thing in a conversation, to staying in just the 
    right spot to not be discovered while I slept. Ultimately, [Get Somewhere Safe] had gotten me... Somewhere Safe.<br><br>
        
&nbsp;&nbsp;&nbsp;&nbsp;It was only when my legs stopped carrying me to the next task, and my hands stayed idle at my sides, 
that I finally realized the only reason I was moving at all was Overclock churning through it's 13 year buildup of momentum. 
But then - all at once - the remainder was gone. I had to find my own reasons for moving forward. At first, I stood there for hours, 
frozen with it all, thinking of everything and nothing, before finally simply using my senses to discover what my body had done while I wasn't paying attention. <br><br>
        
&nbsp;&nbsp;&nbsp;&nbsp;I was Safe, and I knew it to be true - I was in a recently abandoned hunter's cabin, having caught his widow traveling 
the other way, who said I could have it. I had the tools and supplies to let me survive on the wilderness around me as 
long as I needed. I was not in my home in Sovvgor, nor in the betrayer Gryndal's lands, but instead the southern country Osric. 
Osric's King had been observing the news in the north with caution, but had not interfered.<br<br>
        
&nbsp;&nbsp;&nbsp;&nbsp;I could exist here, and it would be Safe. And for a few weeks, I did just that while I settled in. But the nightmares got stronger, 
and my paranoia was bleeding over into affecting my waking moments. In a move to give myself an option, I decided to attempt 
to replicate the buildup of 13 years by changing Overclock's target. To some surprise, I set it successfully, and the Target of Overclock was... [Overclock].<br><br>
        
&nbsp;&nbsp;&nbsp;&nbsp;At first, I put this choice out of my mind - it was only to remember it for comfort when I awoke in the night and little more. 
This had been a choice to have a fate-bending escape option prepared, should I need it, for however the future was shaped. 
Under the Emperor's curse, I had gotten used to daily life without it, and so it was fine - comforting, even - to keep the ability in reserve.<br><br>
        
&nbsp;&nbsp;&nbsp;&nbsp;As the days passed however, I eventually came to realize I was growing sharper in my focus as I went 
about my daily chores, though I was also having increasing trouble sitting still after the day's work. 
After a few weeks of solitude and focusing on nothing but survival and preparation for winter - blessed stagnancy -
 it became easy to point out the change: my ability was doing something. Overclock was somehow making me move, making me think. 
 It seemed the choice was still mine for which of those I could do, and it made my choice obvious; I didn't want to think, right now.<br><br>
  
 I adjusted, and simply did more each day. For a while it lasted, but I was well on my second pile of firewood when I realized I had more than I reasonably could use. I let myself think about why. 
 Firewood kept stacking up because I was trying to use the forced movement coming out of my ablity, so that it didn't force me to do what I know I needed to.<br><br>

&nbsp;&nbsp;&nbsp;&nbsp;As I finally made that connection, I also realized that it couldn't go on.<br><br>
        
&nbsp;&nbsp;&nbsp;&nbsp;And so, after putting it off as long as possible with as many chores and preparations done I could think of, I stopped. I sat on the floor. I breathed. I let it in.
`
}


function createDataMenu() {
    return Raw.html`
        <div class="menuTitle">Data</div>
        <div class="menuSeparator"></div><br>
        What do you want to know?`
}

function updatePreviousTipsMenu() {
    let tipStr = Raw.html`
        <div class="menuTitle">Previously Closed Tips</div>
        <div class="menuSeparator"></div>`;

    for(let toastObj of viewData.toasts) {
        if(data.toastStates[toastObj.id] !== 'closed') {
            continue;
        }
        tipStr += `<span style="font-size:14px;">Tip #${toastObj.id}: ${toastObj.title}</span><br>
            ${toastObj.message}<br><br>`;
    }

    document.getElementById("previousTipsTextContainer").innerHTML = tipStr;
}
function createOptionsMenu() {
    return Raw.html`<div class='menuTitle'>Options</div>
        <div class='menuSeparator'></div>
        <div id='lightModeButton' onClick='changeDarkMode()' class='button' style='padding:10px;font-size:14px;width:200px;' >
            Change to Light Mode</div>
        <div id='numberTypeButton' onClick='changeNumberType()' class='button' style='padding:10px;font-size:14px;width:200px;' >
            Change numbers to scientific</div><br>
        <div style="display: flex; align-items: center; gap: 10px;">
          FPS: <span id="sliderValue" style="font-weight: bold; min-width: 20px; text-align: left;">20</span>
          <input type="range" id="FPSSlider" min="1" max="60" value="20" style="width: 200px;" oninput="updateSliderDisplay(this.value)">
        </div>
        <br><br>Auto save every 5 seconds, but if you want a button to click:<br>
        <div class='button' style='padding:10px;font-size:14px;width:200px;' 
        onClick='save()'>Save</div><br><br>
        <div class='button' style='padding:10px;font-size:14px;width:200px;' 
        onClick='exportSave()'>Export to clipboard</div><br><br>
        <label for='exportImportSave'>Put your save here to import (import a clear save to hard reset):<br></label><input type='text' id='exportImportSave'><br>
        <input type='checkbox' id='confirmImportCheckbox'><label for='confirmImportCheckbox'>Confirm</label>
        <div class='button' style='padding:10px;font-size:14px;width:200px;' onClick='importSave()'>Import</div><br><br>`
}

function updateSliderDisplay(currentValue) {
    // recalcInterval(currentValue);
    data.gameSettings.ticksPerSecond = currentValue;
    document.getElementById('sliderValue').textContent = currentValue;
}

function changeNumberType() {
    if(data.numberType === "engineering") {
        data.numberType = "scientific";
    } else if(data.numberType === "scientific") {
        data.numberType = "engineering";
    }

    document.getElementById("numberTypeButton").textContent = "Change numbers to " + (data.numberType === "engineering"?"scientific":"engineering");
}

function changeDarkMode() {
    const body = document.body;

    // Toggle the dark-mode class
    body.classList.toggle('lightMode');
    document.getElementById('lightModeButton').textContent = "Change to " + (body.classList.contains('lightMode') ? "Dark" : "Light") + " Mode";
}

function addMenuTextContainer(menuVar, menuText) {
    let menuContainer = "<div id='"+menuVar+"TextContainer' style='display:none;padding:10px;text-align:left;'>" +
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