let levelData = {};

function createLevel(num) {
    //levelData.initial describes things initials of every level reset and the initial numbers of the permanent level data
    //levelData.data describes things that are reset every level
    //levelSave[curLevel] describes things that are not reset
    let curLevelData = levelInitials[num];
    levelData = copyArray(curLevelData);

    if(!levelSave[num]) {
        levelSave[num] = {};
        levelSave[num].nextLists = {}; //TODO whew boy
        levelSave[num].secrets = 0;
        levelSave[num].uniqueCleared = false;
        levelSave[num].knowledge = 0;
        levelSave[num].knowledgeCap = 0;
        levelSave[num].highestPerson = [0, 0, 0, 0];
    }

    levelData.data = {
        person:0,
        rapport:0,
        difficulty:(num+1)
    };
    levelData.home.units = [];
    levelData.home.varName = "home";
    levelData.home.fightCounter = 20;
    levelData.traveling = [];
    //turn unit mentions into actual units
    warMap.units.createUnit("king", true, "home", 1);
    for(let i = 0; i < curLevelData.dungeons.length; i++) {
        levelData.dungeons[i].units = [];
        levelData.dungeons[i].fightCounter = 20;
        let varName = "dungeon_"+i;
        levelData.dungeons[i].varName = "dungeon_"+i;
        let dungeon = curLevelData.dungeons[i];
        for (let property in dungeon.units) {
            if (dungeon.units.hasOwnProperty(property)) {
                warMap.units.createUnit(property, false, varName, dungeon.units[property]);
            }
        }
    }
    for(let i = 0; i < curLevelData.hideouts.length; i++) {
        levelData.hideouts[i].units = [];
        levelData.hideouts[i].fightCounter = 20;
        let varName = "hideout_"+i;
        levelData.hideouts[i].varName = "hideout_"+i;
        let hideout = curLevelData.hideouts[i];
        if(hideout.creates) {
            levelData.hideouts[i].creates.counter = hideout.creates.initialTime;
        }
        for (let property in hideout.units) {
            if (hideout.units.hasOwnProperty(property)) {
                warMap.units.createUnit(property, false, varName, hideout.units[property]);
            }
        }
    }
}

levelInitials = [{
    initial: {
        people:30, //5270
        gold: 1000,
        wood: 1000,
        mana: 1200
    },
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
            creates: { units: { thug:1 }, initialTime: 20, period: 200 },
            reward: [{
                type:"gold",
                amount:2000
            }],
            coords:{x:70, y:20},
        },
        {
            units: { thug:30, brigand:5, bandit:2 },
            creates: { units: { brigand:2 }, initialTime: 800, period: 300 },
            reward: [{
                type:"gold",
                amount:5000
            }],
            coords:{x:190, y:0},
        }
    ]
}];