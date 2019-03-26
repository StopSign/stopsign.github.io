function loadData() {

    window.riverData.create(5, "lake_0");
    window.lakeData.create({
        minimum:10,
        capacity: 1000,
        intakeRate:.1,
        overflowRate:.01,
        efficiency:.01,
        target: "river_1"
    });
    window.riverData.create(6, "lake_1");
    window.lakeData.create({
        minimum: 600,
        capacity: 10000,
        intakeRate:.05,
        overflowRate:.01,
        efficiency:.01,
        target: "river_2"
    });
    window.riverData.create(7, "lake_2");
    window.lakeData.create({
        minimum: 2e12,
        capacity: 3e12,
        intakeRate:.025,
        overflowRate:.01,
        efficiency:.01,
        target: ""
    });

    window.cbotData.create({
        name:"Mine Ore",
        pNeeded: 400,
        cost: { electricity: 1 },
        finish: function() {
            res.ore++;
        },
        lake: 0
    });
    window.cbotData.create({
        name:"Process Ore",
        pNeeded: 100,
        cost: { electricity: 2, ore: 1},
        finish: function() {
            res.iron++;
            res.dirt++;
        },
        lake: 0
    });
    window.cbotData.create({
        name:"Build C.Bot",
        pNeeded: 200,
        cost: { electricity: 3, iron: 1 },
        finish: function() {
            res.cbots++;
            res.cbotsMax++;
        },
        lake: 0
    });
    window.cbotData.create({
        name:"Drill Hole",
        pNeeded: 200,
        cost: { electricity: 1 },
        enabled: function() {
            return unique.volcDur === 0;
        },
        finish: function() {
            res.dirt++;
        },
        lake: 1
    });
}
