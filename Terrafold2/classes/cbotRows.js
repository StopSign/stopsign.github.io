window.cbotData = {
    create: function(cbotRow) {
        cbotRow.auto = false;
        cbotRow.cbotCount = 0;
        cbotRow.numLeft = 0;
        cbotRow.pCurrent = 0;
        cbotRow.id = cbotRows.length;

        if(!cbotRow.uniqueDiv) {
            cbotRow.uniqueDiv = "";
        }
        if(!cbotRow.enabled) {
            cbotRow.enabled = function() { return true; }
        }

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
            if(cbotRow.cbotCount > 0 && cbotRow.pCurrent === 0 && (cbotRow.numLeft > 0 || cbotRow.auto)) { //should start
                if(canBuy(cbotRow.cost, cbotRow.lake)) {
                    takeCost(cbotRow.cost, cbotRow.lake);
                    cbotRow.pCurrent += cbotRow.cbotCount;
                }
            }
            if(cbotRow.pCurrent >= cbotRow.pNeeded) {
                cbotRow.pCurrent = 0;
                cbotRow.numLeft--;
                if(cbotRow.numLeft < 0) {
                    cbotRow.numLeft = 0;
                }
                cbotRow.finish();
            }
        }
        window.cbotData.tickUnique();
    },
    tickUnique: function() {
        //volcano
        if(unique.volcDur === 0) {
            unique.pressure += .000001;
        }
        if(unique.pressure > 1) {
            unique.pressure = 1;
        }
        let actualDepth = unique.depthNeeded / unique.pressure;
        if(unique.depth >= actualDepth) {
            unique.volcDur += 60 * 20;
            unique.pressure *= .9;
            unique.depth = 0;
        }
        if(unique.volcDur > 0) {
            let output = cbotData.helpers.getVolcanoOutput();
            clouds[1].water += output.water;
            localAtmo.co2 += output.co2;
            unique.volcDur--;
        }
    },
    helpers: {
        getVolcanoOutput() {
            return { water:.07 * unique.volcMult, co2:.03 * unique.volcMult}
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

function addNumLeft(id) {
    cbotRows[id].numLeft += buyAmount;
}
function subtractNumLeft(id) {
    cbotRows[id].numLeft -= buyAmount;
    if(cbotRows[id].numLeft < 0) {
        cbotRows[id].numLeft = 0;
    }
}

function changeAuto(id) {
    cbotRows[id].auto = document.getElementById("auto"+id).checked;
}