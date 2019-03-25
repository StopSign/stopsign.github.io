window.lakeData = {
    create: function(lakeData) {
        lakeData.water = 0;
        lakeData.electricity = 0;
        lakeData.intake = 0;
        lakeData.overflow = 0;
        lakeData.evaporated = 0;
        lakes.push(lakeData);
        window.cloudData.create();
    },
    tick: function() {
        for(let i = 0; i < lakes.length; i++) {
            let lake = lakes[i];
            if(lake.water > (lake.minimum + lake.intakeRate)) {
                lake.intake = lake.intakeRate; //for graphics
                if(addWaterTo(lake.target, lake.intakeRate)) {
                    lake.water -= lake.intakeRate;
                }
                lake.electricity += (lake.intakeRate * lake.efficiency);
                if(lake.water > lake.capacity) {
                    lake.overflow = (lake.water - lake.capacity) * lake.overflowRate;
                    if(addWaterTo(lake.target, lake.overflow)) {
                        lake.water -= lake.overflow;
                    }
                }
            } else {
                lake.intake = 0;
            }
            let evaporated = lake.water * .00001;
            lake.evaporated = evaporated;
            clouds[i].water += evaporated;
            lake.water -= evaporated;
        }
    }
};

function changeCbotCount(id) {
    let div = document.getElementById("cbotCount"+id);
    let value = Math.floor(Number(div.value));
    if(isNaN(value) || value < 0) {
        value = 0;
    }
    if(value > (cbots + cbotRows[id].cbotCount)) {
        value = cbots + cbotRows[id].cbotCount;
    }
    cbotRows[id].cbotCount = value;
    document.getElementById("cbotCount"+id).value = value;
    calcAvailableCbots();
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

function calcAvailableCbots() {
    cbots = cbotsMax;
    for(let i = 0; i < cbotRows.length; i++) {
        cbots -= cbotRows[i].cbotCount;
    }
}