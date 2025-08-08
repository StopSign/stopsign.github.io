//this file is self-contained to create everything needed for a menu
//createMenu() - makes the button / menu / title
//addMenuTab("Help", <desc>) Adds a menu tab with the following text
//addMenuTab("Strategy", <desc>) Adds a menu tab with the following text
//addMenuOptionsTab() adjust fps, saving
//addDataTab()
//addMenuTab("Previous Tips", <desc>) Adds a new tab that duplicates the toasts but can't
let canvas, ctx, linearBtn, logBtn;

function initializeMenus() {
    createMenu(); // makes the button | menu | title
    addMenuTab("help");
    addMenuTab("helpForReal");
    addMenuTab("story");
    addMenuOptionsTab(); //adjust fps, saving
    addDataTab();
    addMenuTab("previousTips");
    addMenuTextContainer("help", createHelpMenu());
    addMenuTextContainer("story", createStoryMenu());
    addMenuTextContainer("options", createOptionsMenu());

    addMenuTextContainer("statistics", createDataMenu());
    statChartInitial();

    addMenuTextContainer("previousTips", "Close tips to fill this screen!");

    addMenuTab("changelog");
    addMenuTextContainer("changelog", createChangelogMenu());
    addMenuTab("shop");
    addMenuTextContainer("shop", createShopMenu());

    addMenuTextContainer("helpForReal", createHelpForRealMenu());

    document.getElementById("helpForRealMenuTab").style.display = "none";
    document.getElementById("helpMenuTab").addEventListener('click', () => {
        document.getElementById("helpForRealMenuTab").style.display = "flex";
    });

        // addMenuTab("cheat");
    // addMenuTextContainer("cheat", createCheatMenu());
}

function statChartInitial() {
    canvas = document.getElementById('resourceChart');
    ctx = canvas.getContext('2d');
    linearBtn = document.getElementById('linearBtn');
    logBtn = document.getElementById('logBtn');

    linearBtn.addEventListener('click', () => {
        chartScale = 'linear';
        linearBtn.style.backgroundColor = '#4a5568';
        linearBtn.style.color = 'white';
        logBtn.style.backgroundColor = '#f7fafc';
        logBtn.style.color = '#4a5568';
        drawChart();
    });

    logBtn.addEventListener('click', () => {
        chartScale = 'logarithmic';
        logBtn.style.backgroundColor = '#4a5568';
        logBtn.style.color = 'white';
        linearBtn.style.backgroundColor = '#f7fafc';
        linearBtn.style.color = '#4a5568';
        drawChart();
    });
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
        <div class="menuSeparator"></div><br>Work in Progress. The shop will be completed for full release with the following plans. 
        I will keep the game ad-free and AI-art free, and the demo will be open-source on my github.<br> 
        I'm looking for feedback on the pricing for when the game lives on steam, outlined below.<br>
        Disclaimer: Game will be balanced without these upgrades.<br><br>
        <ul>
            <li>$5 for 1k Soul Coins (SC)</li>
            <li>$20 for 5k Soul Coins</li>
        </ul>
        There will be a "daily bonus" button for +100 soul coins (and 30m of bonus speed) every 23hr, 
        and it upgrades to +200 in ~30 days.<br>
        
        <br>Unique Upgrades:<br>
        <ul>
            <li>Maximum Focus bars +1 (up to 4): 1k SC each</li>
            <li>Focus Bars mult (up to x4): 1k SC each</li>
            <li>Learn exact legacy/AC gained in KTL before switching Overclock targets: 500 SC</li>
            <li>Unlock option for Bonus Speed to go x10: 100 SC</li>
        </ul>
        
        <br>Special Resource Bonuses:<br>
        <ul>
            <li>+50% permanent momentum (up to 2): 500 SC, 1k SC</li>
            <li>+50% permanent gold (up to 2): 500 SC, 1k SC</li>
            <li>+50% permanent conversations (up to 2): 500 SC, 1k SC</li>
            <li>+50% permanent mana (up to 2): 500 SC, 1k SC</li>
        </ul>
        
        <br>Timed Resource Bonuses (repeated use adds to timer):<br>
        <ul>
            <li>x2 momentum for 24hr: 200 SC</li>
            <li>x2 gold for 24hr: 200 SC</li>
            <li>x2 conversations for 24hr: 200 SC</li>
            <li>x2 mana for 24hr: 200 SC</li>
            <li>x2 legacy for 24hr: 600 SC</li>
            <li>x2 game speed for 24hr: 2000 SC</li>
        </ul>

        <br>Buy Bonus Time:<br>
        <ul>
            <li>1 hr for 200 SC</li>
            <li>24hr for 2000 SC</li>
        </ul>
`;
}

function createHelpForRealMenu() {
    return Raw.html`
        <div class="menuTitle">How to Provide Feedback</div>
        <div class="menuSeparator"></div><br>
        You'll help me, for real? Wow, I didn't know you were cool like that.<br>
        My discord to discuss everything is here: <a href="https://discord.gg/dnKA6Xd">Stop_Sign Gaming</a>. I would really appreciate hearing about your experience, 
        and how you felt while playing! 
        You can also talk about the game in the discord with others, and share strategies.<br><br>
        No AI was used in the writing of the story, and no AI-art will be added to the game.<br><br>
        Thanks for playing! -Stop_Sign
`;
}

function createHelpMenu() {
    return Raw.html`
        <div class="menuTitle">Help</div>
        <div class="menuSeparator"></div><br>
        You'll help? Oh, you <i>want</i> help. Well, use the sliders to move resources to actions that haven't been unlocked yet. 
        Other than that, it's just reading the numbers that are visible and figuring out which is the optimal path. I'm sure you can do it.
`;
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
        What do you want to know?<br><br>
        <div id="resetLogContainer"></div><br>
    <div id="chartContainer" style="width: 80%; max-width: 800px; background-color: #2d3748; border-radius: 8px; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.4); padding: 20px;">
        <h2 style="text-align: center; margin-top: 0; color: #e2e8f0;">Recent 100 Overclock Amounts</h2>
        <canvas id="resourceChart" style="width: 100%; height: 400px; border-radius: 4px;"></canvas>
        <div style="text-align: center; margin-top: 15px;">
            <button id="linearBtn" style="padding: 10px 20px; border: 1px solid #63b3ed; background-color: #63b3ed; 
                color: #1a202c; border-radius: 5px; cursor: pointer; font-weight: bold; transition: background-color 0.2s;">
                Linear
            </button>
            <button id="logBtn" style="padding: 10px 20px; border: 1px solid #4a5568; background-color: #4a5568; 
                color: #e2e8f0; border-radius: 5px; cursor: pointer; font-weight: bold; transition: background-color 0.2s;">
                Logarithmic
            </button>
        </div>
    </div>
`
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
    return Raw.html`
    
<div style="max-width:680px;width:100%;box-sizing:border-box;padding:20px;display:flex;flex-direction:column;gap:20px;">

  <div class="menuTitle" style="margin:0;font-size:20px;font-weight:bold;border-bottom:1px solid #aaa;padding-bottom:10px;">Options</div>

  <div style="display:flex;flex-direction:column;gap:12px;">

    <div style="display:flex;align-items:center;justify-content:space-between;">
      <span style="font-size:14px;">Number Notation</span>
      
        <div id="numberTypeSwitch" onclick="toggleNumberType()" style="position:relative;cursor:pointer;border:1px solid #aaa;border-radius:4px;padding:2px;width:300px;height:30px;">
          <div id="ntsSlider" style="position:absolute;left:0;top:2px;width:calc(33.333% - 2px);height:calc(100% - 4px);background:#ccc;border-radius:2px;z-index:1;"></div>
          <div style="position:relative;display:flex;z-index:2;height:100%;">
            <span style="flex:1;text-align:center;font-size:13px;font-weight:bold;line-height:26px;color:#000;">Engineering</span>
            <span style="flex:1;text-align:center;font-size:13px;font-weight:bold;line-height:26px;color:#000;">Scientific</span>
            <span style="flex:1;text-align:center;font-size:13px;font-weight:bold;line-height:26px;color:#000;">Suffix</span>
          </div>
        </div>
      
    </div>

    <div style="display:flex;align-items:center;justify-content:space-between;">
      <span style="font-size:14px;">Show +/-/Δ Values</span>
      <div id="viewDeltasSwitch" onclick="toggleViewDeltas()" style="position:relative;cursor:pointer;border:1px solid #aaa;border-radius:4px;padding:2px;width:200px;height:30px;">
        <div style="position:absolute;left:2px;top:2px;width:calc(50% - 2px);height:calc(100% - 4px);background:#ccc;border-radius:2px;z-index:1;"></div>
        <div style="position:relative;display:flex;z-index:2;height:100%;">
          <span style="flex:1;text-align:center;font-size:13px;font-weight:bold;line-height:26px;color:#000;">Off</span>
          <span style="flex:1;text-align:center;font-size:13px;font-weight:bold;line-height:26px;color:#000;">On</span>
        </div>
      </div>
    </div>

    <div style="display:flex;align-items:center;justify-content:space-between;">
      <span style="font-size:14px;">Show Increase/Decrease Ratio</span>
      <div id="viewRatioSwitch" onclick="toggleViewRatio()" style="position:relative;cursor:pointer;border:1px solid #aaa;border-radius:4px;padding:2px;width:200px;height:30px;">
        <div style="position:absolute;left:2px;top:2px;width:calc(50% - 2px);height:calc(100% - 4px);background:#ccc;border-radius:2px;z-index:1;"></div>
        <div style="position:relative;display:flex;z-index:2;height:100%;">
          <span style="flex:1;text-align:center;font-size:13px;font-weight:bold;line-height:26px;color:#000;">Off</span>
          <span style="flex:1;text-align:center;font-size:13px;font-weight:bold;line-height:26px;color:#000;">On</span>
        </div>
      </div>
    </div>

    <div style="display:flex;align-items:center;justify-content:space-between;">
      <span style="font-size:14px;">Show Total Downstream</span>
      <div id="viewTotalMomentumSwitch" onclick="toggleViewTotalMomentum()" style="position:relative;cursor:pointer;border:1px solid #aaa;border-radius:4px;padding:2px;width:200px;height:30px;">
        <div style="position:absolute;left:2px;top:2px;width:calc(50% - 2px);height:calc(100% - 4px);background:#ccc;border-radius:2px;z-index:1;"></div>
        <div style="position:relative;display:flex;z-index:2;height:100%;">
          <span style="flex:1;text-align:center;font-size:13px;font-weight:bold;line-height:26px;color:#000;">Off</span>
          <span style="flex:1;text-align:center;font-size:13px;font-weight:bold;line-height:26px;color:#000;">On</span>
        </div>
      </div>
    </div>

    <div style="display:flex;align-items:center;justify-content:space-between;">
      <span style="font-size:14px;">Show All 0 and All 100 Buttons</span>
      <div id="viewZeroButtonsSwitch" onclick="toggleViewAll0Buttons()" style="position:relative;cursor:pointer;border:1px solid #aaa;border-radius:4px;padding:2px;width:200px;height:30px;">
        <div style="position:absolute;left:2px;top:2px;width:calc(50% - 2px);height:calc(100% - 4px);background:#ccc;border-radius:2px;z-index:1;"></div>
        <div style="position:relative;display:flex;z-index:2;height:100%;">
          <span style="flex:1;text-align:center;font-size:13px;font-weight:bold;line-height:26px;color:#000;">Off</span>
          <span style="flex:1;text-align:center;font-size:13px;font-weight:bold;line-height:26px;color:#000;">On</span>
        </div>
      </div>
    </div>
  </div>

  <div style="display:flex;align-items:center;gap:10px;">
    <label for="FPSSlider" style="font-size:14px;">FPS: <span id="sliderValue" style="font-weight:bold;">20</span></label>
    <input type="range" id="FPSSlider" min="1" max="60" value="20" oninput="updateSliderDisplay(this.value)" style="flex:1;cursor:pointer;">
  </div>

  <div style="display:flex;flex-direction:column;gap:10px;">
    <p style="margin:0;font-size:13px;">Auto save every 20 seconds and on pause, but if you want a button to click:</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;">
      <button onclick="save()" style="padding:10px 16px;background:#007BFF;color:#fff;border:none;border-radius:4px;font-size:14px;cursor:pointer;">Save</button>
      <button onclick="exportSave()" style="padding:10px 16px;background:#007BFF;color:#fff;border:none;border-radius:4px;font-size:14px;cursor:pointer;">Export to clipboard</button>
    </div>
  </div>

  <div style="display:flex;flex-direction:column;gap:10px;border-top:1px solid #aaa;padding-top:20px;">
    <label for="exportImportSave" style="font-size:13px;">Put your save here to import (import a clear save to hard reset):</label>
    <input type="text" id="exportImportSave" style="border:1px solid #aaa;padding:8px;border-radius:4px;font-size:13px;width:100%;" oncontextmenu="event.stopPropagation(); return true;">
    <div style="display:flex;align-items:center;gap:8px;">
      <input type="checkbox" id="confirmImportCheckbox" style="width:14px;height:14px;cursor:pointer;">
      <label for="confirmImportCheckbox" style="font-size:14px;cursor:pointer;">Confirm</label>
    </div>
    <button onclick="importSave()" style="padding:10px 16px;background:#007BFF;color:#fff;border:none;border-radius:4px;font-size:14px;cursor:pointer;width:160px;">Import</button>
  </div>
    <div style="display:flex;flex-direction:column;gap:10px;">
      <label for="bonusCodeInput" style="font-size:13px;">Enter Bonus Code:</label>
      <input type="text" id="bonusCodeInput" style="border:1px solid #aaa;padding:8px;border-radius:4px;font-size:13px;width:100%;">
      <div id="bonusCodeMessage" style="font-size:13px;color:red;"></div>
      <button onclick="applyBonusCode()" style="padding:10px 16px;background:#28a745;color:#fff;border:none;border-radius:4px;font-size:14px;cursor:pointer;width:160px;">Use Bonus Code</button>
    </div>

</div>


<!--        <div style="display: flex; align-items: center; gap: 10px;">-->
<!--          FPS: <span id="sliderValue" style="font-weight: bold; min-width: 20px; text-align: left;">20</span>-->
<!--          <input type="range" id="FPSSlider" min="1" max="60" value="20" style="width: 200px;" oninput="updateSliderDisplay(this.value)">-->
<!--        </div>-->
<!--        <br><br>Auto save every 20 seconds and on pause, but if you want a button to click:<br>-->
<!--        <div class='button' style='padding:10px;font-size:14px;width:200px;' -->
<!--        onClick='save()'>Save</div><br><br>-->
<!--        <div class='button' style='padding:10px;font-size:14px;width:200px;' -->
<!--        onClick='exportSave()'>Export to clipboard</div><br><br>-->
<!--        <label for='exportImportSave'>Put your save here to import (import a clear save to hard reset):<br></label><input type='text' id='exportImportSave'><br>-->
<!--        <input type='checkbox' id='confirmImportCheckbox'><label for='confirmImportCheckbox'>Confirm</label>-->
<!--        <div class='button' style='padding:10px;font-size:14px;width:200px;' onClick='importSave()'>Import</div><br><br>-->
`
}

function updateSliderDisplay(currentValue) {
    // recalcInterval(currentValue);
    data.gameSettings.ticksPerSecond = parseInt(currentValue);
    document.getElementById('sliderValue').textContent = currentValue;
}

function changeNumberType() {
    if(data.gameSettings.numberType === "numberSuffix") {
        data.gameSettings.numberType = "scientific";
    } else if(data.gameSettings.numberType === "scientific") {
        data.gameSettings.numberType = "numberSuffix";
    }

    document.getElementById("numberTypeButton").textContent = "Change numbers to " + (data.gameSettings.numberType === "numberSuffix"?"scientific":"numberSuffix");
}

function toggleNumberType() {
    const el = document.getElementById('numberTypeSwitch');
    const slider = document.getElementById('ntsSlider');

    if (!window.data) { window.data = { gameSettings: { numberType: 'engineering' } }; }
    if (!data.gameSettings) { data.gameSettings = { numberType: 'engineering' }; }
    if (!data.gameSettings.numberType) { data.gameSettings.numberType = 'engineering'; }

    if (data.gameSettings.numberType === 'engineering') {
        data.gameSettings.numberType = 'scientific';
        slider.style.left = '33.333%';
    } else if (data.gameSettings.numberType === 'scientific') {
        data.gameSettings.numberType = 'numberSuffix';
        slider.style.left = '66.666%';
    } else {
        data.gameSettings.numberType = 'engineering';
        slider.style.left = '0';
    }
}

function toggleViewDeltas() {
    const el = document.getElementById('viewDeltasSwitch');
    const slider = el.firstElementChild;
    data.gameSettings.viewDeltas = !data.gameSettings.viewDeltas;
    if (data.gameSettings.viewDeltas) {
        slider.style.left = '50%';
    } else {
        slider.style.left = '0';
    }

    let maxLevelTop = (data.gameSettings.viewDeltas && data.gameSettings.viewRatio) ? "73px" :
        (data.gameSettings.viewDeltas && !data.gameSettings.viewRatio) ? "48px" :
            (!data.gameSettings.viewDeltas && data.gameSettings.viewRatio) ? "40px" : "12px";

    for(let actionVar in data.actions) {
        views.updateVal(`${actionVar}DeltasDisplayContainer`, data.gameSettings.viewDeltas ? "" : "none", "style.display");
        views.updateVal(`${actionVar}IsMaxLevel`, maxLevelTop, "style.top")
    }
}

function toggleViewRatio() {
    const el = document.getElementById('viewRatioSwitch');
    const slider = el.firstElementChild;
    data.gameSettings.viewRatio = !data.gameSettings.viewRatio;
    if (data.gameSettings.viewRatio) {
        slider.style.left = '50%';
    } else {
        slider.style.left = '0';
    }

    let maxLevelTop = (data.gameSettings.viewDeltas && data.gameSettings.viewRatio) ? "73px" :
        (data.gameSettings.viewDeltas && !data.gameSettings.viewRatio) ? "48px" :
            (!data.gameSettings.viewDeltas && data.gameSettings.viewRatio) ? "40px" : "12px";

    for(let actionVar in data.actions) {
        views.updateVal(`${actionVar}BalanceNeedleContainer`, data.gameSettings.viewRatio ? "" : "none", "style.display");
        views.updateVal(`${actionVar}IsMaxLevel`, maxLevelTop, "style.top")
    }
}

function toggleViewTotalMomentum() {
    const el = document.getElementById('viewTotalMomentumSwitch');
    const slider = el.firstElementChild;
    data.gameSettings.viewTotalMomentum = !data.gameSettings.viewTotalMomentum;
    if (data.gameSettings.viewTotalMomentum) {
        slider.style.left = '50%';
    } else {
        slider.style.left = '0';
    }
    for(let actionVar in data.actions) {
        if (data.gameSettings.viewTotalMomentum) {
            views.updateVal(`${actionVar}TotalDownstreamContainer`, "", "style.display");
        } else {
            views.updateVal(`${actionVar}TotalDownstreamContainer`, "none", "style.display");
        }
    }
}

function toggleViewAll0Buttons() {
    const el = document.getElementById('viewZeroButtonsSwitch');
    const slider = el.firstElementChild;
    data.gameSettings.viewAll0Buttons = !data.gameSettings.viewAll0Buttons;
    if (data.gameSettings.viewAll0Buttons) {
        slider.style.left = '50%';
    } else {
        slider.style.left = '0';
    }
    for(let actionVar in data.actions) {
        if (data.gameSettings.viewAll0Buttons) {
            views.updateVal(`${actionVar}ToggleDownstreamButtons`, "", "style.display");
        } else {
            views.updateVal(`${actionVar}ToggleDownstreamButtons`, "none", "style.display");
        }
    }
}

function changeDarkMode() {
    const body = document.body;

    // Toggle the dark-mode class
    body.classList.toggle('lightMode');
    document.getElementById('lightModeButton').textContent = "Change to " + (body.classList.contains('lightMode') ? "Dark" : "Light") + " Mode";
}

function addMenuTextContainer(menuVar, menuText) {
    let menuContainer = "<div id='" + menuVar + "TextContainer' style='display:none;padding:10px;text-align:left;font-size:16px;height:100%;max-height:100%;overflow-y:auto;box-sizing:border-box;'>" +
        menuText +
        "</div>";

    let child = document.createElement("template");
    child.innerHTML = menuContainer;
    document.getElementById("menuTextDisplayContainer").appendChild(child.content);
}

function createMenu() {
    let helpMenu = `
   <div id="helpMenu" class="fullScreenGrey" style="display:none;" onclick="clickMenuButton()">
    <div class="centerMenuBox"
        onclick="stopClicks(event)"
        style="background:var(--bg-secondary);padding:20px;border-radius:6px;max-width:1200px;min-width:600px;width:90%;text-align:center;position:relative;color:var(--text-primary);border:1px solid var(--border-color);height:90vh;max-height:90vh;display:block;overflow:hidden;">
        
        <div class="menuTitle" style="box-sizing:border-box;">Options and Info Menu</div>
        <div class="menuSeparator" style="box-sizing:border-box;"></div>
        
        <div style="width:100%;height:calc(100% - 60px);min-height:0;position:relative;display:block;overflow:hidden;font-size:0;">
            <div id="menuIndexContainer"
                style="display:inline-block;width:30%;background-color:var(--menu-tab-background-color);vertical-align:top;height:100%;overflow-y:auto;min-height:0;box-sizing:border-box;font-size:16px;">
            </div>
            <div id="menuTextDisplayContainer"
                style="display:inline-block;width:70%;background-color:var(--menu-background-color);vertical-align:top;height:100%;min-height:0;box-sizing:border-box;overflow-y:auto;position:relative;font-size:16px;">
            </div>
        </div>
    </div>
</div>
    `;
    document.getElementById("helpMenuContainer").innerHTML = helpMenu;
}


let menuInfo = [];
let selectedMenu = null;
function addMenuTab(menuVar) {
    menuInfo.push(menuVar);
    let newMenu = Raw.html`
        <div id="${menuVar}MenuTab" onclick="clickMenuTab('${menuVar}')" 
            style="border:1px solid;width:99%;height:60px;border-radius:3px;background-color:var(--menu-tab-button-color);
            cursor:pointer;font-size:20px;display:flex;align-items:center;justify-content:center;">
            ${decamelizeWithSpace(menuVar)}
        </div>`;

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
    if(selectedMenu === "statistics") {
        resizeCanvas();
    }
}

function addMenuOptionsTab() {
    addMenuTab("options");
}

function addDataTab() {
    addMenuTab("statistics");
}

function createChangelogMenu() {
    return Raw.html`
        <div class="menuTitle">Changelog</div>
        <div class="menuSeparator"></div><br>
        v1.3, 8/8 (current):<br>
        <ul>
            <li>When using amulet, the action menus will work immediately after</li>
            <li>Learn to Listen max level is 10 (will apply next amulet use)</li>
            <li>Offline time constantly saves instead of only when the page unloads</li>
            <li>Harvest Ghostly Field now saves properly</li>
            <li>Overclock Targeting the Lich now runs on first tick after KTL</li>
            <li>Sending resources caps at 100% now, not 10%. Removed info about it. This hopefully reduces confusion with the focus bars. TBD if this is too much</li>
            <li>FPS setting will save correclty</li>
            <li>Added version in top right</li>
            <li>Added a mesage at unlocking Ghostly Fields saying "that's all for now"</li>
        </ul><br>
        v1.2, 8/6:<br>
        <ul>
            <li>Removed the + in e for scientific notation</li>
            <li>Fixed filtering upgrades</li>
            <li>Options keep on refresh</li>
            <li>Altered some text descriptions</li>
            <li>Levels update while in zoomed-out mode now</li>
            <li>You can fully delete the numbers in sliders now</li>
            <li>Fixing number validation</li>
        </ul><br>
        v1.1, 8/5:<br>
        <ul>
            <li>Modified text of on-level attributes</li>
            <li>Fixed a timing bug for mobile (mobile still very clunky)</li>
            <li>Added a button to hide Attributes</li>
            <li>Prevented hotkeys while the menu is open</li>
            <li>Some Generator's Exp to gain now updates fluidly.</li>
        </ul><br> 
        v1.0, 8/5: first release to web<br>
        v.1,  : very rough
        `;
}