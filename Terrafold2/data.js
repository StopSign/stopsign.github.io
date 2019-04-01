function loadData() {

    window.riverData.create(4, "lake_0");
    window.lakeData.create({
        minimum:10,
        capacity: 1000,
        intakeInitial:.1,
        efficiencyInitial:.01,
        target: "river_1",
        built: true
    });
    window.riverData.create(5, "lake_1");
    window.lakeData.create({
        minimum: 200,
        capacity: 10000,
        intakeInitial:.05,
        efficiencyInitial:.01,
        target: "river_2",
        built: true
    });
    window.riverData.create(6, "lake_2");
    window.lakeData.create({
        minimum: 2000,
        capacity: 50000,
        intakeInitial:.025,
        efficiencyInitial:.01,
        target: "river_3",
        buildCost: { iron: 50, dirt: 1000 }
    });
    window.riverData.create(7, "lake_3");
    window.lakeData.create({
        minimum: 2e12,
        capacity: 3e12,
        intakeInitial:.02,
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
        uniqueDiv: " Ore: <div id='ore'></div>"
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
        finish: function() {
            res.cbots++;
            res.cbotsMax++;
        },
        lake: 0
    });
    window.cbotData.create({
        name:"Drill Hole",
        pNeeded: 20 * 60 * 20,
        cost: { electricity: 1 },
        enabled: function() {
            return unique.volcDur === 0;
        },
        finish: function() {
            totalVolc++;
            res.dirt++;
            unique.depth += 100;
        },
        lake: 1,
        uniqueDiv:"<br>" +
        "Depth: <div id='depth' class='preciseNum'></div>" +
        "Volcano at: <div id='depthNeeded' class='preciseNum'></div>" +
        "Pressure: <div id='pressure' class='preciseNum'></div>" +
        "Volcano Duration: <div id='volcDur' class='preciseNum'></div>" +
        "<div id='volcOutput'></div>"
    });
    window.cbotData.create({
        name:"Place Dirt",
        pNeeded: 5 * 60 * 20,
        cost: { electricity: 1, dirt:10 },
        enabled: function() {
            return unique.volcDur === 0;
        },
        finish: function() {
            res.baseLand++;
            res.land++;
        },
        lake: 2,
        unlocked:false,
        unlockButton:"<div id='unlockButton4' class='button gone' onclick='clickRepairFarmBot({ iron: 50 })'>Repair Farm Bot for 50 iron</div>",
        uniqueDiv:"asdf"
    });
}
