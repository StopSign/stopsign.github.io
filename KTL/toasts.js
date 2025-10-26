// Global data variable

// Possible states: 'hidden' -> 'active' -> 'inactive' -> 'closed'
// We'll track each toast's state individually.

let modalOverlayEl, modalEl, modalOkButton;
let currentModalToastId = null; // to track which toast opened the modal
let toastIdCounter = 0; // to give each toast a unique ID

function initializeToasts() {
    createToastModal();

    createToast(function() { return false },
        "CLOSED BETA", 0,
        Raw.html`This game is currently in a closed beta - this means please do not share the link with people
        as I do not want the larger audience's first impression to be this version. This is for feedback purposes, and the game may change and the saves wiped for now
        until I start caring about save integrity. Thank you.<br><br>-Stop_Sign`);

    createToast(function() { return true; },
        "Welcome to Kill the Lich! Click Here for Info!",0,
        Raw.html`This is Kill the Lich, an idle/waiting optimization game! These messages will serve as the tutorial, so
        make sure to click these popups and read them for important information when you can!<br><br>
        
        Closed messages are still accessible at Menu -> Previous Tips.`);
    createToast(function() { return toastIsClicked(1); },
        "Starting the Game", 0,
        Raw.html`You've already started!<br><br>

        The Overclock action gets progress automatically, and when it completes it generates your first resource: Momentum. 
        The gameplay is to change (using the sliders) the percentage of send rate of each action's resource to their downstream actions.`);
    createToast(function() { return data.actions.reflect.unlocked; },
        "Controls to Move Around",0,
        Raw.html`Click/right click and drag to move the game window. WASD works also. Use the mouse scroll wheel or the [+]
        and [-] to zoom in and out.`);
    createToast(function() { return data.actions.distillInsight.visible; },
        "Attention Bonus", 0,
        Raw.html`To send resources between actions faster, you can click the solid blue lines between the actions, which sets the attention bonus. For now, you can set 
        up to 2 at a time, and they give a x2 to the send rate!`);
    createToast(function() { return data.actions.overclock.level >= 1; },
        "Exp and Leveling", 0,
        Raw.html`When the progress bar is full, an action will gain 1 exp (for now) until it levels up. On level up, the stat will give:
        <ol>
            <li>Attributes, which are the way actions affect each other - details are in Info menu.</li>
            <li>Increased progress/exp requirements, described by the greyed-out text in their bars.</li>
            <li>If the Action is a generator (like Overclock), increases the action power, which is how much it generates e.g. Overclock gets x1.1 multiplicative to action power per level. Details are in Info menu.</li>
        </ol>`);
    createToast(function() { return toastIsClicked(5); },
        "Attributes", 0,
        Raw.html`Each attribute is a 10% increase to bonus, shown in the Attributes window. You can click an attribute to see which actions use it. There are 3 colors:
        <ol>
            <li>Green: Adds the attribute on level</li>
            <li>Purple: Reduces the progress required to complete if it is an action, reduces exp required to level if it is a generator</li>
            <li>Blue: Increases efficiency. For actions, efficiency is the send and consume rate. For generators, it is the generator speed, generator amount, and send rate.</li>
        </ol>`);
    createToast(function() { return data.actions.harnessOverflow.visible; },
        "Game Math on Sending", 0,
        Raw.html`Rate of sending = tier mult * efficiency * slider bar %.<br>
        <ol>
            <li>Each action has a tier. Tier 0 is a default send rate of 10%, Tier 1 is 1%, Tier 2 is .1%, etc.</li>
            <li>Actions also have an efficiency, which is improved by the blue Attributes for that action.</li>
            <li>Most actions will automatically convert their sending rate to exp, essentially a 100% slider bar you can't turn off.</li> 
            <li>The send rate affects how resources are moved around as well as the consumption rate (if it is not a generator).</li>
            <li>Generators do not consume resources automatically. Read their info for more.</li>
        </ol>`);
    createToast(function() { return data.actions.reflect.level >= 3 },
        "Finding New Actions", 0,
        Raw.html`New will become visible when you reach various hidden milestones, but more will be visible at once later. For now, 
        get reflect to levels 4 and 6 to unlock two new actions!<br>

        There will generally be an obvious goal to work towards for more unlocks.`);
    createToast(function() { return data.actions.harnessOverflow.level >= 8 },
        "Max Level", 0,
        Raw.html`Some actions have max levels, first shown with "Level 0 / 10". When the level is at the max (in this case 10), 
        momentum will no longer be consumed - this means it will send 100% of the resource onwards without taking any.`);
    createToast(function() { return toastIsClicked(9); },
        "Changing Colors", 0,
        Raw.html`When an action is max level, it will get a MAX LEVEL stamp and the background color of the action will change based on its resource.<br><br>

        When an action is max level and there is no incoming or outgoing of its resource, it will dim.`);
    createToast(function() { return data.actions.travelToOutpost.unlocked },
        "Hesitation", 0,
        Raw.html`As you come to terms with what momentum can be for, you know that you need to do what you've 
        been dreading: making connections in the local community. The closer you get, though, the more it reminds you of things you had put aside.<br><br>

        Maybe it would better to process some memories first.`);
    createToast(function() { return data.actions.remember.unlocked },
        "Raising Max Levels", 0,
        Raw.html`Remember has an additional on-level effect, check its Info.`);
    createToast(function() { return data.actions.helpScottWithChores.unlocked; },
        "Making Money", 0,
        Raw.html`Scott showed you how to make money, and so the Current Job is set to Helping Scott with Chores, with a wage of $1.<br><br>

        The Make Money action is unlocked, south of Overclock. It uses a different formula to consume momentum - found in Info - so figure out what sending ratio works for you.
        The formula needs about 250 momentum to start giving valid amounts, and then the generated value adds exp to 
        Make Money and gold to Spend Money. From there, gold is treated the same Momentum in the way it works on Spend Money.<br<br>
        
        To make a lot more money, get a better job at the outpost (check notice board level 3).`);


    createToast(function() { return data.actions.checkNoticeBoard.level >= 1},
        "NOTICE - Market Ads", 0,
        Raw.html`Many posters are advertising a market. Maybe you should check that out.`);
    createToast(function() { return data.actions.checkNoticeBoard.level >= 2},
        "NOTICE - Report for Training", 0,
            Raw.html`ATTENTION:
            <ul>
                <li>Do you need LEG MUSCLES to RUN FOREVER?</li>
                <li>Do you need HEART MUSCLES to GIVE YOU THE POWER?</li>
                <li>Do you need BRAIN MUSCLES to remember what I tell you the first time?</li>
            </ul>
            
            <br<br>Come down to JOHN'S TRAINING CENTER and I will make you STRONG.`);

    createToast(function() { return data.actions.checkNoticeBoard.level >= 3 },
        "NOTICE - A hidden notice", 0,
        Raw.html`It is tucked behind the others, so you did not spot it at first. It is short, and untitled:<br><br>

        "Laborer required for odd jobs. Starting wage $10. Ask Grelt."`)

    // createToast(function() { return data.actions.basicTrainingWithJohn.unlocked },
    //     "Training Options Hint", 0,
    //     Raw.html`Confused with too many options of John's training? Go from top to bottom!`);

    createToast(function() { return data.actions.reportForLabor.unlocked },
        "You Need A Break", 0,
        Raw.html`As soon as you step in sight of your new boss, you immediately decide that this can't be all there is. 
        You decide to get some clothes for the occasion, and go find where that scent came from. A higher wage will let you get those things easier.<br><br>2 new Actions unlocked!`);

    createToast(function() { return data.actions.meetGrumpyHermit.unlocked },
        "Rebuked by the Hermit", 0,
        Raw.html`You were told you were hard to talk to - by a hermit! He said to gain more of a spine before he'll 
        entertain you.<br><br>You've been putting it off, but it is time to do what you've been dreading - talk to people.<br><br>New action unlocked.`);

    createToast(function() { return data.actions.inquireAboutMagic.unlocked },
        "Magic", 0,
        Raw.html`You have gained some Legacy from the amulet, and therefore unlocked Magic! Click the tab or press the hotkey [2] to switch to it.<br><br>
        There will be many secrets to uncover in the realm of magic, but with only 1 legacy it is difficult to unlock any of them.<br>
        You should keep asking the Hermit about magic - he knows how to really get you started.`);

    createToast(function() { return data.actions.gossipAroundCoffee.unlocked },
        "What did they just say?", 0,
        Raw.html`You whirl around, fear clawing down your spine, hoping that you did not just hear the word 
        "lich" on someone's tongue. You need to know more about this.<br><br>
        Get Gossip Around Coffee to level 5.`);

    createToast(function() { return data.actions.hearAboutTheLich.unlocked },
        "Something Must Be Done", 0,
        Raw.html`The lich has returned, but this is what you were preparing for by targeting Overclock to itself.<br>
            Check Info under Hear About The Lich for how it increases!<br><br>
            Get at least 1 Spell Power from External Spells and at least 1 level in this action 
            to be able to sign up and join humanity's last stand!`);


    createToast(function() { return data.actions.infuseTheHide.unlocked },
        "It's time to cast some real magic!", 0,
        Raw.html`You have instructions from the hermit on how to create a book of power! Infuse the Hide, Etch the Circle, Bind the Pages, and Awaken Your Grimoire!<br><br>
                Then, once you have spell power from the new spell, you can go Fight the Lich!`);

    createToast(function() { return data.actions.silenceDeathChanters.unlocked },
        "Thanks for playing!", 0,
        Raw.html`You've encountered all the content that exists currenlty. Follow the discord for the roadmap and updates!`);


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
        <div class="fullScreenGrey" style="display:none" onclick="closeModal()">
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