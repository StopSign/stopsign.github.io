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

    createCBotRow({
        name:"Mine Ore",
        pNeeded: 400,
        electricity: 1,
        finish: function() {
            ore++;
        },
        lake: 0
    });
    createCBotRow({
        name:"Process Ore",
        pNeeded: 100,
        electricity: 2,
        finish: function() {
            iron++;
            dirt++;
        },
        lake: 0
    });
    createCBotRow({
        name:"Build C.Bot",
        pNeeded: 200,
        electricity: 3,
        finish: function() {
            cbots++;
        },
        lake: 0
    });
}

function createCBotRow(cbotRow) {
    cbotRow.auto = false;
    cbotRow.cbotCount = 0;
    cbotRow.numLeft = 0;
    cbotRow.pCurrent = 0;
    cbotRow.id = cbotRows.length;

    cbotRows.push(cbotRow);
}