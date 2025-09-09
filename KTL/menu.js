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
    addMenuTab("backstory");
    addMenuOptionsTab(); //adjust fps, saving
    addDataTab();
    addMenuTab("previousTips");
    addMenuTextContainer("help", createHelpMenu());
    addMenuTextContainer("backstory", createStoryMenu());
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
        My discord to discuss everything is here: <a href="https://discord.gg/dnKA6Xd" target="_blank">Stop_Sign Gaming</a>. I would really appreciate hearing about your experience, 
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
&nbsp;&nbsp;&nbsp;&nbsp;A lich is a creature of bones, dark magic, and myth, causing catastrophes in history each time one appears. 13 years ago, the Emperor Brithan of Sovvgor had used one of his Talents to remove such a creature, the vanquishing had not come without great cost: there was a curse laid upon the land. For hundreds of miles around the Dread Fortress far to the north, those who had Talents could not use them. These lands were mostly made of frozen wasteland, or dead cities turned into fuel for the liches ambition, but it did also encompass the majority of the Empire of Sovvgor - my home. The nobility informed us of our shared glory for bearing this burden with them, it was a bitter pill to swallow when Talents were our magic, our identity, and our proof that the Gods loved us. Talents are our connection to the idea that though the world is big, we have our place in it. With them gone... who would we be?<br><br>

&nbsp;&nbsp;&nbsp;&nbsp;My Talent is Overclock, and the simple description of it is "Choose a valid target; get a little more out of it". In my youth, I used to change Overclock's target a dozen times a day, enjoying the extra "skips" in my "steps" as it hurried me along, so-to-speak. I used it to ease the daily life - doing chores and travelling, mostly. As a boy of 10 years, I had been playing a game of hide and seek with my friends when, without warning, the curse fell over us and all our Talents were locked, inert, and useless. My Overclock was locked with a Target of [Get Somewhere Safe], unable to be changed, and unable to help. For a few peaceful years our new reality was something to grieve and adjust to. We pined for what could have been, as we moved on to discover who we would become instead. However, we never got the chance; our neighbors only saw the curse as a weakness to exploit. <br><br> 

&nbsp;&nbsp;&nbsp;&nbsp;Sovvgor's small, long-term ally on our western border, Gryndall, started giving us unfavorable deals. They had been formerly pacified by our might, but realized they had advantages that tipped the scales; they had materials that could be further refined with Talents, and products that were made quicker and with less expertise required, and we had to buy such items at a premium. They had enchanted items and magics that were only made viable through Talents that specialized in them, and we lacked anything to balance the scales. When we ran out of gold to give, their greed only increased and their sights turned to our resources. After a forced diplomatic incident turned into a cry for war, the Emperor had no choice but to prepare an army.<br><br>

&nbsp;&nbsp;&nbsp;&nbsp;I was conscripted, armed, and trained - clumsily - as a soldier. At first, they hardly knew what to do with us; before the curse, soldiers without a Talent for combat would be passed over, and those with relevant Talents would get training and placement accordingly. The locked target of Overclock became my mantra and my curse, forever locked on the one thing I desired - safety - and this was a rather painful irony during my training and subsequent marching. Sovvgor's mages still had their magic - albeit greatly diminished - and our army was greater in numbers than Gryndall could field... but while the town criers proclaimed an inevitable victory, the pale faces of our leaders and obvious fear in our heroes were the true heralds of our fate.<br><br>

&nbsp;&nbsp;&nbsp;&nbsp;The plan, as far as they told us conscripts, was simple: push far enough into Gryndallan territory that our Talents became active again. We were assured that Gryndall had pulled their borders back to the curse's edge, and that we would only have a single wall to get past. We were assured we had mages capable of doing the breach, that we had Talented engineers and blacksmiths and enchanters ready to create a fortress. We were told we simply had to remind the world of our Empire's strength, but that most of us would get to go home - if we followed our training. We started marching west, instilled with the delusional optimism needed to get us moving at all.<br><br>

&nbsp;&nbsp;&nbsp;&nbsp;Eventually, I learned the truth of the situation: our mages and enchanters loved magic more than they loved our country, and had moved or been bought out long ago. Worse, some Talents around magic allowed for much greater distance on their magics, or allowed for summons to have a longer leash or greater intelligence, or allowed for the sharing of mana to funnel lesser Talented mages towards the ones who were useful to the situation. Even while still far away from the edge of the curse, we started dying from explosions, clouds of death, and summoned devils that our remaining mages could not adequately defend against.<br><br> 

&nbsp;&nbsp;&nbsp;&nbsp;It was eventually named the Ashmarch, for what was left of the land. Gryndall had killed all but a handful of men during the journey itself. Tens of thousands of screams and bodies I marched past, with my vision narrowing on the goal and false hope of crossing the line. We were defenseless, but we marched onward, having come too far for any other choice. Three days it lasted, and the horrors were too great for my mind to hold. The fellow soldiers I saw die, the cries I heard, the traps prepared for us, the unholy desecration of- ... No. Too many horrors. Far too many.<br><br>

&nbsp;&nbsp;&nbsp;&nbsp;I try not to think about it.<br><br>
        
&nbsp;&nbsp;&nbsp;&nbsp;The Gryndallan betrayers never let us reach the edge of the curse. Our Talents were never unlocked by our own will. I wondered why they didn't simply wipe us out entirely before we even saw the border, but when we finally did, the answer was written on their faces: disappointment and boredom. They hoped to be entertained with our remnants; they thought we would rage with fury and revenge, providing stories and glory for their Talented heroes as they made a show of killing us. Instead, they rapidly lost interest when they only found injured men waiting for their turn to die. We were quickly captured, putting up no resistance. <br><br>

&nbsp;&nbsp;&nbsp;&nbsp;We were bound with rope, and kept within the cursed side. The Gryndallans debated on what to do with us: whether to bring us one a time across the border for staged duels to appease the egos of their gathered warriors, or whether it would be too large of a risk for, and they should kill us all without such theatrics. It was during this moment that the situation suddenly changed: after 13 years of our Talents being frozen and inert, they suddenly sprang alive and became active, all at once. Some of my fellows became unbound through their various Talents of escape, cutting, or fire, and freed most of us before it was noticed and the chaos of battle truly started.<br><br>

&nbsp;&nbsp;&nbsp;&nbsp;Later we would learn the curse broke because our Emperor had died from assassination, but at the moment we only had thoughts of survival. When I understood our Talents were active again, and I checked Overclock, something new happened to me: Overclock slammed into me with a metaphysical weight I had never experienced. Over the 13 years it had not been truly inactive, but instead building a reservoir behind a locked gate. It had become far, far more than a "a little more". My legs moved on their own, my eyes only tracked my next step, and I ducked and weaved according to whims and currents I had never felt before. Fate herself bent to see my target enacted, and my escape was a circus of coincidences, unforseen Talent ineractions, timing windows, and beginner mistakes from trained veterans that opened a gap large enough for me - and only me - to slip through.<br><br> 

&nbsp;&nbsp;&nbsp;&nbsp;Going with the flow of Overclock - for I had neither the will nor the inclination to change its course - it carried me out of combat, out of war, and eventually out of danger entirely. In the few weeks that it guided my path, I continued the repeated miraculous luck even as the effect diminished steadily over time. From finding abandoned horses and supplies, to hearing just the right thing in a conversation, to staying in just the right spot to not be discovered while I slept. Ultimately, [Get Somewhere Safe] had gotten me... Somewhere Safe.<br><br>
        
&nbsp;&nbsp;&nbsp;&nbsp;It was only when my legs stopped carrying me to the next task, and my hands stayed idle at my sides, and my eyes felt no supernatural twitches to look to the next goal, that I finally realized the only reason I was moving at all was Overclock was finished churning through it's 13 year buildup of momentum. But then - all at once - it was empty, and I was still. At first, I stood there for hours, frozen with it all, thinking of everything and nothing, before finally simply using my senses to discover what my body had done while I wasn't paying attention. I had to find my own reasons for moving forward.<br><br>
        
&nbsp;&nbsp;&nbsp;&nbsp;I was in a recently abandoned hunter's cabin, having caught his widow traveling the other way, who looked kindly upon me when I presented her with a flower that reminded her of her deceased love, and said I could have the cabin and none would bother me. In the cabin I had the tools and supplies to let me survive the surrounding wilderness as long as I needed. I was not in my home in Sovvgor, nor in the betrayer Gryndal's lands, but instead a country south of Gryndal, that I knew little of: Osric. Osric did not have a border wth Sovvgor, and so had not helped with the lich or interfered with Gryndal's claims.<br<br>
        
&nbsp;&nbsp;&nbsp;&nbsp;I could exist here, and it would be safe - my Talent had guaranteed so. And for a few weeks, I did just that while I settled in. But the nightmares got stronger, and my paranoia was bleeding over into affecting my waking moments, and I started considering how to use the fate-bending exerted by Overclock. In a move to give myself a fallback option, I decided to attempt to replicate the buildup of 13 years. At first I was unsure how to have a "neutral" target that could be re-pointed later without needing to find a way to lock it again, but with sudden clarity I tested changing the target... to itself. The target of Overclock became: [Overclock].<br><br>
        
&nbsp;&nbsp;&nbsp;&nbsp;Satisfied, I put this choice out of my mind, only to open it for comfort when I awoke in the night and little more. This had been a choice to have a fate-bending escape option prepared, should I need it, for whatever else fate had for me. Under the Emperor's curse, I had gotten used to daily life without it, and so it was fine - comforting, even - to keep the ability in reserve.<br><br>
        
&nbsp;&nbsp;&nbsp;&nbsp;After a few weeks of solitude and focusing on nothing but survival and preparation for winter - blessed stagnancy and repetition - it became obvious that a type of unfamiliar pressure was building: my ability was doing something I had not expected, and it was not simply building passively. I eventually came to realize the pressure became noticeablyy less as I performed tasks that would have been valid targets for Overclock. I was completing my daily chores quicker, but also I was having increasing trouble sitting still after the day's work, and when I had more time I would start to reflect on what got me here - which caused panic and terror and guilt I was desperately trying not to consider. Overclock, when targeting itself, was somehow still making me move, making me think... the momentum was spilling over, somehow. It seemed the choice was still mine for how to relieve the pressure, and so I threw myself into more work.<br><br>
  
&nbsp;&nbsp;&nbsp;&nbsp;I started doing chores I didn't need to - piling up more firewood, cleaning my clothes more often, carving wood into furniture and decorations. For a while it lasted, but I was finishing my fourth pile of firewood when I realized I had more than I reasonably could use for the entire winter, and reconsidered how what I was doing. I let myself think about why I was pushing things out. I let myself think about who I wanted to be, and I realized I would need to think about who I was. I considered changing Overclock's target to continue to avoiding the subject, but I felt instant terror at the idea that I would be without safety - the same as any other soldier in the Ashmarch.<br><br>

&nbsp;&nbsp;&nbsp;&nbsp;As I finally made that connection, I realized that the only way forward was through. And so, after putting it off as long as possible, I stopped. I sat on the floor. I breathed. I let it in, and reflected.<br><br>
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
    
<div style="max-width:680px;width:100%;box-sizing:border-box;padding:20px;display:flex;flex-direction:column;gap:10px;">

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
        
        <div style="display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:14px;">Use Advanced Downstream Sliders<br>(Warning: will adjust to the nearest option when turning off)</span>
            <div id="viewAdvancedSlidersSwitch" onclick="toggleAdvancedSliders()" style="position:relative;cursor:pointer;border:1px solid #aaa;border-radius:4px;padding:2px;width:200px;height:30px;">
                <div style="position:absolute;left:2px;top:2px;width:calc(50% - 2px);height:calc(100% - 4px);background:#ccc;border-radius:2px;z-index:1;"></div>
                <div style="position:relative;display:flex;z-index:2;height:100%;">
                    <span style="flex:1;text-align:center;font-size:13px;font-weight:bold;line-height:26px;color:#000;">Off</span>
                    <span style="flex:1;text-align:center;font-size:13px;font-weight:bold;line-height:26px;color:#000;">On</span>
                </div>
            </div>
        </div>
    </div>

    <div class="menuSeparator"></div>
    
    <div style="display:flex;align-items:center;gap:10px;">
        <label for="FPSSlider" style="font-size:14px;">FPS: <span id="sliderValue" style="font-weight:bold;">20</span></label>
        <input type="range" id="FPSSlider" min="1" max="60" value="20" oninput="updateSliderDisplay(this.value)" style="flex:1;cursor:pointer;">
    </div>
    <p style="margin:0;font-size:13px;">Auto save every 20 seconds and on pause, but if you want a button to click:</p>
    <button onclick="save()" style="padding:10px 16px;background:#007BFF;color:#fff;border:none;border-radius:4px;font-size:14px;cursor:pointer;width:160px;">Save</button>
    <div style="display:flex;flex-direction:column;gap:10px;">
        <label for="bonusCodeInput" style="font-size:13px;">Enter Bonus Code:</label>
        <input type="text" id="bonusCodeInput" style="border:1px solid #aaa;padding:8px;border-radius:4px;font-size:13px;width:100%;">
        <div id="bonusCodeMessage" style="font-size:13px;color:red;"></div>
        <button onclick="applyBonusCode()" style="padding:10px 16px;background:#28a745;color:#fff;border:none;border-radius:4px;font-size:14px;cursor:pointer;width:160px;">Use Bonus Code</button>
    </div>
    
    <div class="menuSeparator"></div>
    
    <button onclick="exportSaveFile()" style="padding:10px 16px;background:#007BFF;color:#ffffff;border:none;border-radius:4px;font-size:14px;cursor:pointer;width:160px;">Export to file</button>
    <input type="file" id="importSaveFileInput">
    <button onclick="importSaveFile()" style="padding:10px 16px;background:#007BFF;color:#fff;border:none;border-radius:4px;font-size:14px;cursor:pointer;width:160px;">Import File</button>
    
    <div class="menuSeparator"></div>
    
    <button onclick="exportSave()" style="padding:10px 16px;background:#007BFF;color:#fff;border:none;border-radius:4px;font-size:14px;cursor:pointer;width:160px;">Export to clipboard</button>
    <label for="exportImportSave" style="font-size:13px;">Put your save here to import (import a clear save to hard reset):</label>
    <input type="text" id="exportImportSave" style="border:1px solid #aaa;padding:8px;border-radius:4px;font-size:13px;width:100%;" oncontextmenu="event.stopPropagation(); return true;">
    <div>
        <input type="checkbox" id="confirmImportCheckbox" style="width:14px;height:14px;cursor:pointer;">
        <label for="confirmImportCheckbox" style="font-size:14px;cursor:pointer;">Confirm</label>
        <button onclick="importSave()" style="padding:10px 16px;background:#007BFF;color:#fff;border:none;border-radius:4px;font-size:14px;cursor:pointer;width:160px;">Import</button>
    </div>
    
</div>
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

function toggleAdvancedSliders() {
    const el = document.getElementById('viewAdvancedSlidersSwitch');
    const slider = el.firstElementChild;
    data.gameSettings.viewAdvancedSliders = !data.gameSettings.viewAdvancedSliders;
    if (data.gameSettings.viewAdvancedSliders) {
        slider.style.left = '50%';
    } else {
        slider.style.left = '0';
    }

    if(!data.gameSettings.viewAdvancedSliders) { //Switch from off to on
        for(let actionVar in data.actions) {
            let dataObj = actionData[actionVar];
            for (let downstreamVar of dataObj.downstreamVars) {
                if(data.actions[downstreamVar].hasUpstream) {
                    setSliderUI(actionVar, downstreamVar, convertToNearest(data.actions[actionVar][`downstreamRate${downstreamVar}`]));
                }
            }
        }
    }

    updateSliderContainers()
}

function convertToNearest(num) {
    const targets = [0, 10, 50, 100];

    return targets.reduce((closest, current) => {
        return (Math.abs(current - num) < Math.abs(closest - num)) ? current : closest;
    });
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
        <div class="button" onclick="clickMenuButton()" style="position:absolute;top:5px;right:5px;">X</div>
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

//Also update id="currentVersion"
function createChangelogMenu() {
    return Raw.html`
        <div class="menuTitle">Changelog</div>
        <div class="menuSeparator"></div><br>
        v1.4.2 9/9 (current):<br>
        <ul>
            <li>Fixed mobile drag, changed default size on mobile, prevented zoom on menus making the screen stuck, and added a close button to the main menu</li>
            <li>Fixed screen jumping issue on distant actions</li>
            <li>Kill the Lich! button under Hear About the Lich now is hidden when in the Kill the Lich game mode. It also remains visible when zoomed out.</li>
            <li>Save file has date attached</li>
            <li>Fixed a few things on load (pause/resume button, statistics showing, number notation)</li>
        </ul><br>
        v1.4.1, 9/6:<br>
        <ul>
            <li>Discord link opens in a new tab when clicked</li>
            <li>Performance improvement: The connection lines also hide, like the actions, when out of screen sight</li>
            <li>Amulet upgrades can be sorted by cost</li>
            <li>Fixed a bug with bonus speed save/load settings</li>
            <li>Log for new actions, with clickable names to jump to them. Log clears on amulet use</li>
            <li>Overboost/Overdrive will default to prevent automation when first unlocked</li>
            <li>Rearranged ancient coin info to not be hidden by the button</li>
        </ul><br>
        v1.4, 9/5:<br>
        <ul>
            <li>Added the ability to import/export the save as a file</li>
            <li>Rewrote/edited backstory</li>
            <li>Rewrote/added story content to 11 actions, placeholders for the WIP</li>
            <li>Added an icon/tooltip for easily seeing the tier and action type</li>
            <li>Added automation tab with ability to remove individual downstream rates from changing via automation</li>
            <li>Changed default downstream options (the slider):
                <ul>
                    <li>Default sliders removd, and instead show [Off, 10%, 50%, 100%] downstream options</li>
                    <li>Added an option to switch between the button options and the full [0-100] slider</li>
                    <li>Existing saves automatically have Advanced Sliders enabled, to preserve existing game state</li>
                    <li>Removing advanced sliders will round numbers to the nearest option (AKA an 80% downstream slider moves to the 100% downstream option)</li>
                </ul>
            </li>
            <li>Bonus Speed button loads on the correct state</li>
            <li>Zoom in/out saves per tab</li>
        </ul><br>
        v1.3, 8/8:<br>
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