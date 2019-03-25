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
