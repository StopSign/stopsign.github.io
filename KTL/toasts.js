// Global data variable

// Possible states: 'hidden' -> 'active' -> 'inactive' -> 'closed'
// We'll track each toast's state individually.

let modalOverlayEl, modalEl, modalOkButton;
let currentModalToastId = null; // to track which toast opened the modal
let toastIdCounter = 0; // to give each toast a unique ID

function initializeToasts() {
    createToastModal();
return;
    createToast(function() { return true },
        "CLOSED BETA", Raw.html`This game is currently in a closed beta - this means please do not share the link with people
        as I do not want the larger audience's first impression to be this version. This is for feedback purposes, and the game may change and the saves wiped for now
        until I start caring about save integrity. Thank you.<br><br>-Stop_Sign`);

    createToast(function() { return true; },
        "Welcome to Kill the Lich! Click Here for Info!",
        Raw.html`This is Kill the Lich, an idle/waiting optimization game! These messages will serve as the tutorial, so
        make sure to click these popups and read them for information, but you can play a bit and discover things first as well!<br><br>
        
        When you close a message, you can access it again in the Menu -> Previous Tips.`);
    createToast(function() { return toastIsClicked(1); },
        "Controls to Move Around",
        Raw.html`Click/right click and drag to move the game window. WASD also. Use the mouse scroll wheel or the [+] 
        and [-] to zoom in and out.`);
    createToast(function() { return toastIsClicked(1); },
        "Starting the Game",
        Raw.html`You've already started!<br><br>

        The Overclock action gets progress automatically, and when it completes it generates the game's primary resource: momentum. 
        The way you play is by changing the percentage (using the sliders) of send rate of momentum to downstream actions.<br><br>
        
        To continue, increase the slider of overclock to 100%.`);
    createToast(function() { return toastIsClicked(3)  && (data.actions.overclock.downstreamRateharnessOverflow-0) > 95; },
        "Game Math on Sending",
        Raw.html`Rate of sending = tier mult * efficiency * slider bar %.<br>
        <ul>
            <li>Each action has a tier, and as a tier 0, Overclock gets 10% of current Momentum/s</li>
            <li>However, Overclock also starts at 10% efficiency (the number at the top next to level), so it is further 
            reduced from 10% to 1% momentum/s, for now. The send rate effects the rate that resources flow, but it doesn't change the total momentum.</li>
            <li>Each action has a tier, and all other actions to start are Tier 1, which is default 1% rate (at 100% eff)</li>
            <li>Overclock does not consume momentum automatically, but most actions will automatically convert their sending rate to exp, essentially a 100% slider bar you can't turn off.</li>
        </ul>`);
    createToast(function() { return data.actions.harnessOverflow.level >= 2; },
        "Exp and Leveling",
        Raw.html`When the progress bar is full, an action will gain 1 exp until it levels up. On level up, the stat will give:
        <ol>
            <li>On-level atts, with details found in the Stats menu of each action</li>
            <li>Increased progress/exp requirements described by the greyed-out text in their bars</li>
            <li>If the Action is a generator (like overclock), increases the action power, with details found in the Info menu of each action</li>
        </ol>`);
    createToast(function() { return data.actions.harnessOverflow.level >= 4; },
        "Attention Bonus",
        Raw.html`You can click the solid blue lines between the actions to set the attention bonus! For now, you can set 
        up to 2, and they give a x2 to the slider they represent, moving the resources around faster!`);
    createToast(function() { return data.actions.remember.unlocked; },
        "Max Level",
        Raw.html`The action "Remember" has a max level, first shown with "Level 0 / 4". When the level reaches the max (in this case 4), momentum will no longer be consumed.<br><br>

        If the max level is raised, Consumption will begin again. `);
    createToast(function() { return data.actions.remember.level >= 1 },
        "Next Steps - Traveling!",
        Raw.html`You generally want to be working towards unlocking whatever actions are visible. Shift 
        the Momentum around the Action web to do so! Choose the ratio of momentum to send between the internal southwest actions, or the external eastern actions.`);

    createToast(function() { return data.actions.makeMoney.unlocked; },
        "Making Money",
        Raw.html`Scott showed you how to make money, and so the Current Job is set to Helping Scott with Chores, with a wage of $1.<br><br>

        The Make Money action is unlocked, south of Overclock. It uses a different formula to consume momentum - found in Info - so figure out what sending ratio works for you.
        The formula needs about 250 momentum to start giving valid amounts, and then the generated value adds exp to 
        Make Money and gold to Spend Money. From there, gold is treated the same Momentum in the way it works on Spend Money.<br<br>
        
        To make a lot more money, get a better job at the outpost (check notice board level 3).`);

    createToast(function() { return data.actions.checkNoticeBoard.level >= 1},
        "NOTICE - Report for Training",
            Raw.html`ATTENTION:
            <ul>
                <li>Do you need LEG MUSCLES to RUN FOREVER?</li>
                <li>Do you need HEART MUSCLES to GIVE YOU THE POWER?</li>
                <li>Do you need BRAIN MUSCLES to remember what I tell you the first time?</li>
            </ul>
            
            <br<br>Come down to JOHN'S TRAINING CENTER and I will make you STRONG.`);

    createToast(function() { return data.actions.checkNoticeBoard.level >= 2},
        "Notice! Open for all! ",
        Raw.html`It reads "Notice:<br>
        Steam & Stormy - Community Coffeehouse now open<br>A new space for peaceful gathering and conversation. Steam & Story offers fresh-brewed drinks from across the 
        realms and a welcoming place to meet others, share stories, or simply rest.<br><br>

        Open to all, no guild or title required."<br><br>

        You can start to talk to people through the Socialize action that opened up next to Overclock.`);

    createToast(function() { return data.actions.checkNoticeBoard.level >= 3 },
        "A hidden notice",
        Raw.html`It is tucked behind the others, so you did not spot it at first. It is short, and untitled:<br><br>

        "Laborer required for odd jobs. Starting wage $10. Ask Grelt."`)
    // createToast(function() { return data.actions.oddJobsLaborer.level >= 3 },
    //     "",
    //     Raw.html``);

    // createToast(function() {},
    //     "",
    //     Raw.html``);







    showAllValidToasts(); //ran automatically every second. Have to manually add it when you want faster
}

function toastIsClicked(toastId) {
    return data.toastStates[toastId] === 'inactive' || data.toastStates[toastId] === 'closed';
}

function createToast(visibleFunc, title, message) {
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
            updatePreviousTipsMenu();
            break;
    }
}

function createToastModal() {
    let overlayWrapper = document.createElement('div');
    overlayWrapper.innerHTML = "<div class='fullScreenGrey' style='display:none' onclick='closeModal()'>" +
        "<div class='centerMenuBox'>" +
        "<b><div id='toastModalTitle' style='font-size:16px;'>Toast Title</div></b>" +
        "<p id='toastModalMessage' style='text-align:left;font-size:14px;'>Here is a message</p>" +
        "<div class='button' id=\"modal-ok\" style='margin-top:20px;padding:5px 10px;' onclick='closeModal()'>Close</div>" +
        "</div>" +
        "</div>";
    modalOverlayEl = overlayWrapper.firstElementChild;
    document.body.appendChild(modalOverlayEl);
}

function openModal(toastId) {
    modalOverlayEl.style.display = 'flex';
    document.getElementById('toastModalTitle').innerHTML = viewData.toasts[toastId].title;
    document.getElementById('toastModalMessage').innerHTML = viewData.toasts[toastId].message;

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