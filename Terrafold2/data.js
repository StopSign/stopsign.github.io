function loadData() {

    window.riverData.create(3, "lake_0");
    window.lakeData.create({
        minimum:10,
        capacity: 1000,
        intakeInitial:.1,
        efficiencyInitial:.01,
        target: "river_1",
        built: true
    });
    window.riverData.create(4, "lake_1");
    window.lakeData.create({
        minimum: 800,
        capacity: 10000,
        intakeInitial:.2,
        efficiencyInitial:.01,
        target: "river_2",
        built: true
    });
    window.riverData.create(5, "lake_2");
    window.lakeData.create({
        minimum: 4000,
        capacity: 50000,
        intakeInitial:.4,
        efficiencyInitial:.01,
        target: "river_3",
        buildCost: { iron: 50, dirt: 200 }
    });
    window.riverData.create(6, "lake_3");
    window.lakeData.create({
        minimum: 2e12,
        capacity: 3e12,
        intakeInitial:.8,
        efficiencyInitial:.01,
        target: "",
        buildCost: { steel: 500, dirt: 50000 }
    });

    window.cbotData.create({
        name:"Mine Ore",
        pNeeded: 40 * 20,
        cost: { electricity: 1 },
        finish: function() {
            res.ore++;
        },
        lake: 0,
        uniqueDiv: ", Total Ore: <div id='ore' class='bold'></div>"
    });
    window.cbotData.create({
        name:"Process Ore",
        pNeeded: 10 * 20,
        cost: { electricity: 2, ore: 1},
        finish: function() {
            res.iron++;
            res.dirt++;
        },
        lake: 0
    });
    window.cbotData.create({
        name:"Build C.Bot",
        pNeeded: 40 * 20,
        cost: { electricity: 3, iron: 1 },
        enabled: function() {
           return res.cbotsMax < res.stations * 50;
        },
        finish: function() {
            res.cbots++;
            res.cbotsMax++;
        },
        lake: 0
    });
    window.cbotData.create({
        name:"Charging Station",
        pNeeded: 100 * 60 * 20,
        cost: { electricity: 500, dirt: 500},
        finish: function() {
            res.stations++;
        },
        lake: 0,
        uniqueDiv: ", Current C.Bot max: <b><div id='stations'></div></b>",
        hidden:true
    });

    //1
    window.cbotData.create({
        name:"Drill Hole",
        pNeeded: 20 * 60 * 20,
        auto:true,
        cost: { electricity: 2 },
        enabled: function() {
            return unique.volcDur === 0;
        },
        finish: function() {
            res.dirt++;
            unique.depth += 100;
        },
        lake: 1,
        uniqueDiv:"<br>" +
        "Depth: <div id='depth' class='preciseNum'></div>" +
        "Volcano at: <div id='depthNeeded' class='preciseNum'></div>" +
        "Pressure: <div id='pressure' class='preciseNum'></div>" +
        "Volcano Left: <div id='volcDur' class='preciseNum'></div>" +
        "<div id='volcOutput'></div>"
    });

    //2
    window.cbotData.create({
        name:"Place Dirt",
        pNeeded: 5 * 60 * 20,
        cost: { electricity: 1, dirt:10 },
        finish: function() {
            res.baseLand++;
            res.land++;
        },
        lake: 2,
        unlocked:false,
        unlockButton:"<div id='unlockButton5' class='button gone' onclick='clickRepairFarmBot({ iron: 5 })'>Repair Farm Bot for 5 iron</div>",
        uniqueDiv:"asdf"
    });
    window.cbotData.create({
        name:"Spread Dirt",
        type:"f",
        pNeeded: 5 * 60 * 20,
        cost: { electricity: 1, dirt:10 },
        finish: function() {
            res.land += (res.baseLand*100 - res.land) * .001
        },
        lake: 2,
        unlocked:false,
        uniqueDiv:"asdf"
    });
    window.cbotData.create({
        name:"Plant Seeds",
        type:"f",
        pNeeded: 5 * 60 * 20,
        cost: { electricity: 1, dirt:10 },
        finish: function() {
            res.baseLand++;
            res.land++;
        },
        lake: 2,
        unlocked:false,
        uniqueDiv:"asdf"
    });
    window.cbotData.create({
        name:"Water Plants",
        type:"f",
        pNeeded: 5 * 60 * 20,
        cost: { electricity: 1, dirt:10 },
        finish: function() {
            res.baseLand++;
            res.land++;
        },
        lake: 2,
        unlocked:false,
        uniqueDiv:"asdf"
    });
    window.cbotData.create({
        name:"Smelt Steel",
        type:"c",
        pNeeded: 5 * 60 * 20,
        cost: { electricity: 1, dirt:10 },
        finish: function() {
            res.baseLand++;
            res.land++;
        },
        lake: 2,
        unlocked:false,
        uniqueDiv:"asdf"
    });
    window.cbotData.create({
        name:"Weld Farm Bot",
        type:"c",
        pNeeded: 5 * 60 * 20,
        cost: { electricity: 1, dirt:10 },
        finish: function() {
            res.baseLand++;
            res.land++;
        },
        lake: 2,
        unlocked:false,
        uniqueDiv:"asdf"
    });
}
