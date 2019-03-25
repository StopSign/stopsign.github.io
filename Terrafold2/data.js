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
}