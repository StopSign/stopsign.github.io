// Global data variable

// Possible states: 'hidden' -> 'active' -> 'inactive' -> 'closed'
// We'll track each toast's state individually.

let modalOverlayEl, modalEl, modalOkButton;
let currentModalToastId = null; // to track which toast opened the modal
let toastIdCounter = 0; // to give each toast a unique ID

function initializeToasts() {
    createToastModal();
    createToast(function() { return true; },
        "Welcome! Click Here for Info!", "Welcome to the game! These messages will serve as the tutorial, so make sure to click these popups and read them for information, and only delete them with X when you're ready. The game will be straightforward in the beginning, while introducing the concepts. TODO You can access them again in the Help -> Messages screen.");
    createToast(function() { return toastIsClicked(0) },
        "Motivate Info", "The game starts with the Motivate action. Your primary gameplay control is to change the setting to keep or send the game's primary resource - Resolve - onwards to the downstream Actions. <b>Send enough Resolve from Motivate to Reflect to unlock it (Set the slider to 100%).</b>");
    createToast(function() { return toastIsClicked(1) },
        "Game Math on Sending with Tiers", "Motivate is a Tier 0 Action. Tier sets the base rate of sending, with each tier increase being a 10x lower (tier 0 is 10%/s, tier 1 is 1%/s, etc.). NOTE: higher tiers make resolve move slower, they do NOT waste resolve. If Motivate had 100% efficiency and 100% send rate set (the slider), it would be sending up to 10% of it's current Resolve to each of the downstream actions. However, Motivate is not at 100% efficiency, it is at 10% efficiency, so it sends 1% resolve/s for now.");
    createToast(function() { return toastIsClicked(2) },
        "Game Math on Sending with Efficiency", "Effiency makes sending slower - like tier, this does not waste resolve. Efficiency can be increased up to 100% via stats, found in the Stats tab of each action.");
    createToast(function() { return data.actions.reflect.unlocked },
        "Consuming Progress on Reflect", "Reflect is the more common type of action - it can Receive, Consume, and Send. Currently, you have no more downstream actions for Reflect, so this Action will only use the Resolve to Consume. Consume will happen automatically and cannot be turned off - it will convert Resolve to Progress to fill the top, light green bar. This conversion rate is affected by efficiency, and this WILL waste the resolve in the conversion.");
    createToast(function() { return toastIsClicked(4) },
        "Exp and Leveling", "When the progress bar is full, it will gain 1 exp into the lower, purple bar, and when that is full you level up. The amount of exp can change later in the game.");
    createToast(function() { return toastIsClicked(5) },
        "Leveling Stats with Reflect", "The Stats tab contains the Reflect will gain +5 Drive when it levels upIn the Stats tab ");

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
    overlayWrapper.innerHTML = "<div style='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);" +
        "display:none;align-items:center;justify-content:center;z-index:10000;' onclick='closeModal()'>" +
        "<div style='background:#fff;padding:20px;border-radius:6px;max-width:400px;width:90%;text-align:center;position:relative;'>" +
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