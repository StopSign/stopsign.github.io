window.cbotData = {
    create: function(cbotRow) {
        cbotRow.auto = false;
        cbotRow.cbotCount = 0;
        cbotRow.numLeft = 0;
        cbotRow.pCurrent = 0;
        cbotRow.id = cbotRows.length;

        if(!cbotRow.enabled) {
            cbotRow.enabled = function() { return true; }
        }

        cbotRow.canBuy = function() {
            for(let property in cbotRow.cost) {
                if(cbotRow.cost.hasOwnProperty(property)) {
                    if(property === "electricity" && lakes[cbotRow.lake].electricity < cbotRow.cost.electricity) {
                        return false;
                    } else if(res[property] < cbotRow.cost[property]) {
                        return false;
                    }
                }
            }
            return true;
        };
        cbotRow.takeCost = function() {
            for(let property in cbotRow.cost) {
                if(cbotRow.cost.hasOwnProperty(property)) {
                    if(property === "electricity") {
                        lakes[cbotRow.lake].electricity -= cbotRow.cost.electricity;
                    } else {
                        res[property] -= cbotRow.cost[property];
                    }
                }
            }
            return true;
        };


        cbotRows.push(cbotRow);
    },
    tick: function() {
        for(let i = 0; i < cbotRows.length; i++) {
            let cbotRow = cbotRows[i];
            if(!cbotRow.enabled()) {
                continue;
            }
            if(cbotRow.pCurrent > 0) { //already started
                cbotRow.pCurrent += cbotRow.cbotCount;
            }
            if(cbotRow.cbotCount > 0 && cbotRow.pCurrent === 0 && cbotRow.numLeft > 0) { //should start
                if(cbotRow.canBuy()) {
                    cbotRow.takeCost();
                    cbotRow.pCurrent += cbotRow.cbotCount;
                }
            }
            if(cbotRow.pCurrent >= cbotRow.pNeeded) {
                cbotRow.pCurrent = 0;
                cbotRow.numLeft--;
                if(cbotRow.numLeft < 0) {
                    cbotRow.numLeft = 0;
                }
                if(cbotRow.auto && cbotRow.numLeft === 0) {
                    cbotRow.numLeft = 1;
                }
                cbotRow.finish();
            }
        }
        window.cbotData.tickUnique();
    },
    tickUnique: function() {
        //volcano
        if(unique.depth > unique.depthNeeded) {

        }
    }
};

function addCbots(id) {
    let change = buyAmount;
    if(change > res.cbots) {
        change = res.cbots;
    }
    res.cbots -= change;
    cbotRows[id].cbotCount += change;
}
function subtractCbots(id) {
    let change = buyAmount;
    if(change > cbotRows[id].cbotCount) {
        change = cbotRows[id].cbotCount;
    }
    res.cbots += change;
    cbotRows[id].cbotCount -= change;
}


function changeNumLeft(id) {
    let div = document.getElementById("numLeft"+id);
    let value = Math.floor(Number(div.value));
    if(isNaN(value) || value < 0) {
        value = 0;
    }
    cbotRows[id].numLeft = value;
    document.getElementById("numLeft"+id).value = value;
}

function changeAuto(id) {
    let div = document.getElementById("auto"+id);
    if(Number(document.getElementById("numLeft"+id).value) === 0) {
        document.getElementById("numLeft"+id).value = 1;
        cbotRows[id].numLeft = 1;
    }
    cbotRows[id].auto = div.checked;
}