// Global data variable

// Possible states: 'hidden' -> 'active' -> 'inactive' -> 'closed'
// We'll track each toast's state individually.

let modalOverlayEl, modalEl, modalOkButton;
let currentModalToastId = null; // to track which toast opened the modal
let toastIdCounter = 0; // to give each toast a unique ID

function initializeToasts() {
    createToastModal();

    createToast(function() { return true; },
        "Click here for info!",0,
        `
Welcome to Kill the Lich, an idle/waiting optimization game! You play by choosing the directions to send resources, all starting from the action Overclock.<br><br>

Overclock is a Generator, which means it generates progress over time. It gains 10 momentum and 1 exp every time it completes (the blue bar), and gets x1.1 momentum generation per level (the purple bar). All of this information can be found on the action as well, in its Info tab.<br><br>

For now you have one direction to send the resources: to the action Reflect. Go ahead and set the downstream send rate from Overclock to Reflect 100%.<br><br>

All tips that you close can be found again in Menu -> Previously Closed Tips.`);



    createToast(function() { return data.actions.reflect.unlocked; },
        "Identify what you're looking at",0,
        `
<img src="img/tut5.png" alt="Tutorial 1" style="width:800px;height:300px;" /><br>

<ol>
    <li>The resource amount on the action.</li>
    <li>The attributes gained when the action levels up. You can click an attribute to highlight actions that create or use it.</li>
    <li>Info Icon. Hover over it to get more info about the action behavior. Lightning bolts are regular actions, and gears are generator actions.</li>
    <li>Menu icons. Click them for more info.</li>
    <li>Speed. A Tier 1 Regular Action takes 1% of the current resource to consume, and multiplies it by speed. Speed can go up to 100%.</li>
</ol><br>

Math of the Example: Reflect has 10 momentum, so 1% would be +.1/s, but speed is 50%, so amount going to progress is +.050/s. Regular Actions constantly consume their resources into progress; Generators do not.`);

    createToast(function() { return data.actions.harnessOverflow.visible; },
        "Details of Sending Resources",0,
        `
<img src="img/tut6.png" alt="Tutorial 2" style="width:580px;height:420px;" /><br>

        You can enable extra numbers to see how resources work in more detail in Menu -> Options.<br><br>

Here, the resources on Momentum is 100 and it is a Tier 1 Action, so the maximum rate is 1/s, but it is reduced by 50% speed to a maximum rate of 0.5/s. We can see the Total Decrease is -1.25/s, which is made of the 1) 0.5/s that Reflect is consuming for Progress, 2) 100% (of the 0.5/s rate) being sent to Distill Insight, and 3) 50% (of the 0.5/s rate) being sent to Harness Overflow.<br><br>
        `);

    createToast(function() { return data.actions.harnessOverflow.unlocked; },
        "Gaining Stats",0,
        `
<img src="img/tutorial2.png" alt="Tutorial 3" style="width:570px;height:685px;" /><br>

        Within the Stats Menu, it will show the details of stat gains: The requirements to level are reduced by the multiplicative bonus of all the purple stats. This image is highlighting the change in Speed.<br><br>

Speed on regular actions (lightning bolt icon) will increase 1) The rate resources are used by the action and 2) The rate the action can send resources downstream to the next action.<br><br>

Speed on generator actions (gear icon) will increase 1) The rate the action can send resources downstream to the next action. 2) The rate of progress gain over time 3) The amount of resource created by completing a progress bar.<br><br>

For this image, it means a x1.1 bonus from Cycle results in a x1.21 total momentum/s - it improves it twice over.
        `);
    createToast(function() { return data.actions.takeNotes.visible; },
        "Attention Bonus",0,
        `
        <img src="img/tut7.png" alt="Tutorial 4" style="width:690px;height:270px;" /><br>

        Click the lines in-between actions to Focus them. Focus gives a x2 bonus, and you can have up to 2 Focus lines. This means that you can send more resources than you consume on an action.
        `);
    createToast(function() { return data.actions.helpScottWithChores.unlocked; },
        "Making Money",0,
        `
        Your first job has come: Helping Scott with Chores. You have gained a wage, visible in the top left of your screen. Wage will multiply the amount of Gold that Make Money creates (shown in Info in Make Money).<br><br>

You can only have one job at a time, and it will automatically be the one with the highest wage.
        `);
    createToast(function() { return data.actions.inquireAboutMagic.unlocked; },
        "Magic",0,
        `
        The Hermit has given you an amulet, and with it you have received your first legacy, and unlocked the Magic Tab. Click the tab or press the hotkey [2] to switch to it.<br><br>

Legacy is the resource on the originator of all magic: Echo Kindle. Every time you gain legacy as an attribute, you will also gain it on Echo Kindle.<br><br>

Echo Kindle generates spark onto Spark Decay, which wastes the Spark by consuming it. Pool Mana takes what Spark remains when it completes and turns it into Mana - the lower speed that Spark Decay has, the more Mana will be available for spells.
        `);

    createToast(function() { return data.actions.overcharge.unlocked; },
        "Spells and Instability",0,
        `
        Overcharge and Overboost are the first spells you'll be able to repeatedly cast. They are cast automatically when Overclock completes and gains momentum, giving a x10 bonus each, and Overboost is only cast when Overcharge is also ready to cast, ensuring it is only used to gain x100 momentum total.<br><br>

When you cast a spell, it also gains instability. The Mana cost of the spell increases by the instability %. Instability is decreased by the attribute Control. It reduces by (Control's Bonus^.5)/s
        `);

    createToast(function() { return data.actions.hearAboutTheLich.unlocked; },
        "Preparing for Battle",0,
        `
        While fighting the lich itself is far away, you can join the Fight for Life to invade the hordes in the north. This requires at least 1 spell power, which comes from unlocks within Magic.<br><br>

In addition, when you finally Fight the Lich's Forces, you are given 10 minutes of bonus time (this has a minimum of 1 hour)
        `);

    createToast(function() { return data.gameState === "KTL"; },
        "Fighting in the Northern Wastes",0,
        `
        Having switched Overclock's target to a specific goal instead of itself, you have lost the abilty to modify how momentum is spent - this realm will entirely happen automatically. The goal is to go as far as you can in defeating the Lich's forces, closer and closer to the Lich itself.<br><br>

You will get Legacy and Ancient Coins depending on how far you are able to progress. Ancient Coins are used for amulet upgrades, and Legacy is added to Echo Kindle, to generate more mana in the next life.<br><br>

When you have lost your ability to fight, or Doom has overcome your desire to fight, your Amulet becomes your only way out. It has a special ability to rewind time and let you try again, but with a caveat: only some things can be remembered. Using the gathered Ancient Coins, you are able to send a message back, letting your past self go through the same motions... but with an adjustment.
        `);

    createToast(function() { return data.actions.pryGemLoose.unlocked },
        "Thanks for playing!", 0,
        Raw.html`You've encountered all the content that exists currently. Follow the discord for the roadmap and updates! -Stop_Sign`);


    showAllValidToasts(); //ran automatically every second. Have to manually add it when you want faster
}

function toastIsClicked(toastId) {
    return data.toastStates[toastId] === 'inactive' || data.toastStates[toastId] === 'closed';
}

function createToast(visibleFunc, title, bonusTime, message) {
    let id = toastIdCounter++;

    document.getElementById("toastList").insertAdjacentHTML("beforeend",
        Raw.html`<div id='toast${id}' class='toast' onclick='openModal("${id}")'>
        <span>${title}</span>
        <span id='closeToastButton${id}' class='button' style='display:none;position:absolute;right:0;top:0;' onclick='closeToast(event, "${id}")'>X</span>
        </div>`);
    let toastEl = document.getElementById(`toast${id}`);

    let toastObj = {
        id: id,
        element: toastEl,
        visibleFunc: visibleFunc,
        title:title,
        bonusTime:bonusTime,
        message:message
    };
    if(!data.toastStates[id]) {
        data.toastStates[id] = 'hidden';
    }
    viewData.toasts.push(toastObj);


    updateToastUI(id);
}

//create the modal independently, always
//appear and show it with the name and text of the appropriate modal click
// Update the UI of a specific toast based on its state
function updateToastUI(toastId) {
    if(!viewData.toasts[toastId]) {
        return;
    }
    let el = viewData.toasts[toastId].element;
    let state = data.toastStates[toastId];
    switch (state) {
        case 'hidden':
            el.style.display = 'none';
            break;
        case 'active':
            el.style.display = 'flex';
            break;
        case 'inactive':
            el.style.display = 'flex';
            el.classList.add('toastInactive')
            document.getElementById("closeToastButton"+toastId).style.display="flex";
            break;
        case 'closed':
            el.classList.remove('toastInactive')
            el.style.display = 'none';
            break;
    }
}

function createToastModal() {
    let overlayWrapper = document.createElement("div");
    overlayWrapper.innerHTML = Raw.html`
        <div class="fullScreenGrey" style="display:none;" onclick="closeModal()">
            <div class="centerMenuBox">
                <div id="toastModalTitle" style="font-size:20px;font-weight:bold;text-decoration:underline">Toast Title</div>
                <p id="toastModalMessage" style='text-align:left;font-size:16px;'>Here is a message</p>
                <span class="button" style="display:flex;position:absolute;right:0;top:0;" onclick="closeModal()">X</span>
            </div>
        </div>
        `;
    modalOverlayEl = overlayWrapper.firstElementChild;
    document.body.appendChild(modalOverlayEl);
}

function openModal(toastId) {
    modalOverlayEl.style.display = 'flex';
    document.getElementById('toastModalTitle').innerHTML = viewData.toasts[toastId].title;
    document.getElementById('toastModalMessage').replaceChildren();
    document.getElementById('toastModalMessage').innerHTML = viewData.toasts[toastId].message;

    if(data.toastStates[toastId] === 'active') {
        data.currentGameState.bonusTime += 1000 * viewData.toasts[toastId].bonusTime;
    }
    data.toastStates[toastId] = 'inactive'
    updateToastUI(toastId);
    showAllValidToasts();
}

function closeModal() {
    modalOverlayEl.style.display = 'none';
}

function closeToast(event, toastId) {
    event.stopPropagation(); // Prevents the outer click event
    data.toastStates[toastId] = 'closed'
    updateToastUI(toastId);
    updatePreviousTipsMenu();
}

function showAllValidToasts() {
    //for each toast, check its function. if the func evaluates to true, set the state from hidden to active
    viewData.toasts.forEach(function(toastObj) {
        if(data.toastStates[toastObj.id] === 'hidden' && toastObj.visibleFunc()) {
            data.toastStates[toastObj.id] = 'active';
            updateToastUI(toastObj.id);
        }
    })
}