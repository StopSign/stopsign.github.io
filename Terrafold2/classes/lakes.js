window.lakeData = {
    create: function(lakeData) {
        lakeData.id = lakes.length;
        lakeData.water = 0;
        lakeData.electricity = 0;
        lakeData.intake = 0;
        lakeData.overflow = 0;
        lakeData.evaporated = 0;
        lakeData.overflowRate = .001;
        lakeData.upgrade = {
            generator: 0,
            intake: 0
        };
        lakeData.intakeList = [];

        lakeData.built = !lakeData.buildCost;

        lakeData.efficiency = function() {
            return lakeData.efficiencyInitial * (1 + lakeData.upgrade.generator);
        };
        lakeData.generatorCost = function() {
            return 2 * (10 ** lakeData.id) * (3 ** lakeData.upgrade.generator);
        };

        lakeData.intakeRate = function() {
            return lakeData.intakeInitial * (1 + lakeData.upgrade.intake);
        };
        lakeData.intakeCost = function() {
            return 2 * (10 ** lakeData.id) * (3 ** lakeData.upgrade.intake);
        };

        lakes.push(lakeData);
        window.cloudData.create();
    },
    tick: function() {
        for(let i = 0; i < lakes.length; i++) {
            let lake = lakes[i];
            if(lake.built && lake.water > (lake.minimum + lake.intakeRate())) {
                lake.intake = lake.intakeRate(); //for graphics
                if(addWaterTo(lake.target, lake.intakeRate())) {
                    lake.water -= lake.intakeRate();
                }
                lake.electricity += (lake.intakeRate() * lake.efficiency());
                if(lake.water > lake.capacity) {
                    lake.overflow = (lake.water - lake.capacity) * lake.overflowRate;
                    if(addWaterTo(lake.target, lake.overflow)) {
                        lake.water -= lake.overflow;
                    }
                } else {
                    lake.overflow = 0;
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

function buyGenerator(id) {
    let lake = lakes[id];
    let cost = lake.generatorCost();
    if(res.iron >= cost) {
        res.iron -= cost;
        lake.upgrade.generator++;
    }
}

function buyIntake(id) {
    let lake = lakes[id];
    let cost = lake.intakeCost();
    if(res.steel >= cost) {
        res.steel -= cost;
        lake.upgrade.intake++;
    }
}