let levelData = {};

function createLevel(num) {
    let curLevel = levelInitials[num];
    levelData = copyArray(curLevel);
    levelData.home.units = [];
    levelData.traveling = [];
    //turn unit mentions into actual units
    warMap.units.createUnit("king", true, "home", 1);
    for(let i = 0; i < curLevel.dungeons.length; i++) {
        levelData.dungeons[i].units = [];
        let dungeon = curLevel.dungeons[i];
        for (let property in dungeon.units) {
            if (dungeon.units.hasOwnProperty(property)) {
                warMap.units.createUnit(property, false, "dungeon_"+i, dungeon.units[property]);
            }
        }
    }
    for(let i = 0; i < curLevel.hideouts.length; i++) {
        levelData.hideouts[i].units = [];
        let hideout = curLevel.dungeons[i];
        for (let property in hideout.units) {
            if (hideout.units.hasOwnProperty(property)) {
                warMap.units.createUnit(property, false, "hideout_"+i, hideout.units[property]);
            }
        }
    }
    warMap.units.checkUnitsToJoinBase();
}

levelInitials = [{
    home: {
        coords: {x: 0, y: 100},
        units: { king: 1 }
    },
    dungeons:[
        {
            units: { goblin:10, hobgoblin:1 },
            reward: [{
                type:"mana",
                amount:600
            }],
            coords:{x:30, y:50},
        },
        {
            units: { goblin:20, hobgoblin:2 },
            reward: [{
                type:"mana",
                amount:600
            }],
            coords:{x:110, y:90},
        },
        {
            units: { goblin:10, hobgoblin:10 },
            reward: [{
                type:"mana",
                amount:1200
            }],
            coords:{x:165, y:60},
        }
    ],
    hideouts:[
        {
            units: { thug:10 },
            creates: { thug:1, initialTime: 5, period: 20 },
            reward: [{
                type:"gold",
                amount:2000
            }],
            coords:{x:70, y:20},
        },
        {
            units: { thug:30, brigand:5, bandit:2 },
            creates: { brigand:2, initialTime: 90, period: 30 },
            reward: [{
                type:"gold",
                amount:5000
            }],
            coords:{x:190, y:0},
        }
    ]
}];