// Global data variable

// Possible states: 'hidden' -> 'active' -> 'inactive' -> 'closed'
// We'll track each toast's state individually.

let modalOverlayEl, modalEl, modalOkButton;
let currentModalToastId = null; // to track which toast opened the modal
let toastIdCounter = 0; // to give each toast a unique ID

function initializeToasts() {
    createToastModal();
    createToast(function() { return true; },
        "Welcome! Click Here for Info!",
        "Welcome to the game! These messages will serve as the tutorial, so " +
        "make sure to click these popups and read them for information, and only delete them with X when you're ready. Feel free to ignore the messages " +
        "and learn by watching instead.<b>Open the next message.</b><br>TODO You can access them again in the Menu -> Messages screen.");
    createToast(function() { return toastIsClicked(0); },
        "Controls to Move Around",
        "Click/right click and drag to move the game window. WASD also. " +
        "Use the mouse scroll wheel or the [+] and [-] to zoom in and out. Click the names of Actions to center the screen " +
        "on them. Click the ^ to center the screen around the parent, all the way to Overclock. <b>Open the next message.</b>");
    createToast(function() { return toastIsClicked(1); },
        "Overclock Info",
        "The game starts with the Overclock action. Your primary gameplay control is to change " +
        "the percentage to keep or send the Action's resource (Momentum) onwards to the downstream Actions. <b>Send enough " +
        "Momentum from Overclock to Harness Overflow to unlock it (Set the slider to 100%).</b>");
    createToast(function() { return toastIsClicked(2)  && (data.actions.overclock.downstreamRateharnessOverflow-0) > 0; },
        "Game Math on Sending with Tiers",
        "Rate of sending = Tier mult * efficiency. As Tier 0, Overclock gets 10% of current Momentum/s. Tier 1 is 1%, then .1%, etc.");
    createToast(function() { return data.actions.harnessOverflow.unlocked; },
        "Exp and Leveling",
        "When the progress bar is full, an Action will gain 1 exp into the lower, purple bar, " +
        "and when that is full you level up, gaining 1) stats 2) increased Action Power and 3) increased progress/exp " +
        "requirements. The amount of exp gained will remain at 1 until much later in the game.");
    createToast(function() { return toastIsClicked(4); },
        "Consuming Progress on Harness Overflow",
        "Harness Overflow is the a common type of action. It can Receive, " +
        "Consume, and Send. It receives momentum from the upstream action. It will always be consuming, and you can optionally set the downstream sliders to send momentum onwards. " +
        "The consumption rate is the same as a single 100% slider (that you can't turn off).<br><br>Unlock a few actions to explore the world.");
    createToast(function() { return data.actions.harnessOverflow.unlocked; },
        "Leveling Stats with Harness Overflow",
        "The Stats tab contains 1) Which stats the action gains on level up " +
        "2) Which stats reduce the amount of exp to level, and by how much 3) Which stats increase expertise, and by how " +
        "much. The stat bonus is 1.01^stat. For example, Harness Overflow will gain +5 Drive when it levels up, which increases " +
        "the stat bonus by 1.01^5 = x1.051. Overclock uses 1000% of this bonus, or 10 x .051 + 1 = x1.51, which is applied " +
        "to Overclock's original 10% efficiency to become x1.051. <b>Get Harness Overflow to Level 3</b>");
    createToast(function() { return data.actions.distillInsight.unlocked; },
        "Efficiency",
        "Process Thoughts uses efficiency in two ways. 1) It slows down the rate at which the Action consumes and sends. " +
        "2) It reduces the amount of successfully consumed Momentum - only this part \"wastes\" Momentum.");
    createToast(function() { return data.actions.remember.unlocked; },
        "Max Level",
        "When the level is maxed, momentum will not be Consumed. If the max level is raised, Consumption will " +
        "begin again. This means a maxed level action can let all of the Momentum it receives be sent.");
    createToast(function() { return data.actions.remember.level >= 1 },
        "Next Steps",
        "You always want to be working towards unlocking whatever actions are visible. Shift " +
        "the Momentum around the Action web to do so!");

    createToast(function() { return data.actions.makeMoney.unlocked; },
        "Making Money",
        "Momentum here will be converted to Gold on every completion. The formula is in Info, and it has a minimum " +
        "of ~200 to start working. The generated value adds to both Exp on Make Money, as well as Gold on Spend Money.<br><br>To make a lot more money, get a better job at the outpost.");
    // createToast(function() {},
    //     "", "");


    createToast(function() { return data.actions.helpScottWithChores.level >= 1},
    "Help Scott with Chores 1", "Here's how to fill your basic needs. Go do that.");

    createToast(function() { return data.actions.helpScottWithChores.level >= 2},
        "Help Scott with Chores 2", "Here's how to socialize. Go do that.");

    createToast(function() { return data.actions.helpScottWithChores.level >= 3},
        "Help Scott with Chores 3", "Here's how to buy clothing and eat better food. Go do that. Future levels will increase remember's max level.");

    showAllValidToasts(); //ran automatically every second. Have to manually add it when you want faster
}

function toastIsClicked(toastId) {
    return data.toastStates[toastId] === 'inactive' || data.toastStates[toastId] === 'closed';
}

function createToast(visibleFunc, title, message) {
    let wrapper = document.createElement('div');
    let id = toastIdCounter++;
    wrapper.innerHTML = "<div id='toast"+id+"' class='toast' onclick='openModal(\""+id+"\")'>" +
        "<span'>"+title+"</span>" +
        "<span id='closeToastButton"+id+"' class='button' style='display:none;position:absolute;right:0;top:0;' onclick='closeToast(event, \""+id+"\")'>X</span>" +
        "</div>";
    let toastEl = wrapper.firstElementChild;

    let toastObj = {
        id: id,
        element: toastEl,
        visibleFunc: visibleFunc,
        title:title,
        message:message
    };
    data.toastStates.push('hidden');
    viewData.toasts.push(toastObj);

    document.getElementById('toastList').appendChild(toastEl);
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
    let overlayWrapper = document.createElement('div');
    overlayWrapper.innerHTML = "<div class='fullScreenGrey' style='display:none' onclick='closeModal()'>" +
        "<div class='centerMenuBox'>" +
        "<div id='toastModalTitle'>Toast Title</div>" +
        "<p id='toastModalMessage'>Here is a message</p>" +
        "<div class='button' id=\"modal-ok\" style='margin-top:20px;padding:5px 10px;' onclick='closeModal()'>Close</div>" +
        "</div>" +
        "</div>";
    modalOverlayEl = overlayWrapper.firstElementChild;
    document.body.appendChild(modalOverlayEl);
}

// 3) Function to open the modal (for a specific toast)
function openModal(toastId) {
    modalOverlayEl.style.display = 'flex';
    document.getElementById('toastModalTitle').innerHTML = viewData.toasts[toastId].title;
    document.getElementById('toastModalMessage').innerHTML = viewData.toasts[toastId].message;

    data.toastStates[toastId] = 'inactive'
    updateToastUI(toastId);
    showAllValidToasts();
}

// 4) Function to close the modal
function closeModal() {
    modalOverlayEl.style.display = 'none';
}

// Helper: Close a specific toast
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