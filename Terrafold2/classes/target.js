
function addWaterTo(target, water) {
    let split = target.split("_");
    let type = split[0];
    if(split.length !== 2 || water === 0) {
        return false;
    }
    if(type === "lake") {
        lakes[split[1]].water += water;
    } else if(type === "river") {
        rivers[split[1]].chunks[0].water += water;
    }
    return true;
}



function calcTotalWater() {
    let totalWater = 0;
    totalWater += res.ice;
    for(let i = 0; i < rivers.length; i++) {
        for(let j = 0; j < rivers[i].chunks.length; j++) {
            totalWater += rivers[i].chunks[j].water;
        }
    }
    for(let i = 0; i < lakes.length; i++) {
        totalWater += lakes[i].water;
    }
    for(let i = 0; i < clouds.length; i++) {
        totalWater += clouds[i].water;
    }
    return totalWater;
}