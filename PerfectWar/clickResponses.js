function switchActionsTab(num) {
    let ids = ["kingContainer", "castleContainer", "labContainer", "heroContainer", "upgradeContainer"];
    for(let i = 0; i < ids.length; i++) {
        if(num === i) {
            document.getElementById(ids[i]).style.display = "block";
        } else {
            document.getElementById(ids[i]).style.display = "none";
        }
    }
}

function addActionToList(action, type) {
    let theList = actionsList.next[type];
    if(action.visible() && action.unlocked() && (!action.allowed || getNumOnList(action.name) < action.allowed())) {
        let addAmount = window.addAmount;
        if(action.allowed) {
            let numLeft = action.allowed() - getNumOnList();
            if(numLeft < addAmount) {
                addAmount = numLeft;
            }
        }

        let toAdd = {};
        toAdd.loops = addAmount;
        toAdd.varName = action.varName;
        theList.push(toAdd);
    }
}
