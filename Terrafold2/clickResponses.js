function clicked(funcName) {
    let parts = funcName.split(".");
    if(parts.length === 1) {
        window[parts[0]]();
    } else if(parts.length === 2) {
        window[parts[0]][parts[1]]();
    }
}

function changeBuyAmount() {
    let value = Number(document.getElementById("buyAmount").value);
    if(isNaN(value) || value < 0) {
        value = 0;
    }
    buyAmount = value;
    document.getElementById("buyAmount").value = value;
}

function removeDonation(i) {
    donationsShowing.splice(i, 1);
    view.create.donationMessage();
}

function clickBuildDam(i) {
    let lake = lakes[i];
    if(canBuy(lake.buildCost)) {
        takeCost(lake.buildCost);
        lake.built = true;
    }
}

function clickRepairFarmBot(costObj) {
    if(canBuy(costObj)) {
        takeCost(costObj);
        res.fbots = 1;
        res.fbotsMax = 1;
        cbotRows[5].unlocked = true;
        cbotRows[6].unlocked = true;
        cbotRows[7].unlocked = true;
        cbotRows[8].unlocked = true;
    }
}

function canBuy(costObj, lakeId) { //lakeId is only for "electricity"
    for(let property in costObj) {
        if(costObj.hasOwnProperty(property)) {
            if(property === "electricity" && lakes[lakeId].electricity < costObj.electricity) {
                return false;
            } else if(res[property] < costObj[property]) {
                return false;
            }
        }
    }
    return true;
}

function takeCost(costObj, lakeId) { //lakeId is only for "electricity"
    for(let property in costObj) {
        if(costObj.hasOwnProperty(property)) {
            if(property === "electricity") {
                lakes[lakeId].electricity -= costObj.electricity;
            } else {
                res[property] -= costObj[property];
            }
        }
    }
    return true;
}