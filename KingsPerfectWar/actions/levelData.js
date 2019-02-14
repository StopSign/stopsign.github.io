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
        levelSave[num].highestPerson = [];
        levelSave[num].shrine = {};
        actionData.get.blessingActions().forEach(function(action) {
            levelSave[num].shrine[action.varName] = [];
        });
    }

    levelData.data = {
        person:0,
        rapport:0,
        difficulty:(num+1)
    };
    levelData.shrine = {};

    actionData.get.blessingActions().forEach(function(action) {
        levelData.shrine[action.varName+"Tribute"] = 0;
        levelData.shrine[action.varName+"TributeNeeded"] = action.tribute;
        created[action.varName] = 0;
    });

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

let nameCounter = 0;
function chooseNextName() {
    let list = ["Hellforth", "Barongar", "Umtriul", "Sepheern", "Yidden", "Ternum", "Sphelpheim"];
    if(nameCounter >= list.length) {
        return "Ancient Ruins";
    }
    return list[nameCounter++]
}

levelInitials = [
    { //1
        name: "Hrongar",
        initial: {
            people:0,
            gold: 0,
            wood: 0,
            mana: 615
        },
        home: {
            coords: { x: 60, y: 40},
            units: { king: 1 }
        },
        dungeons:[
        ],
        hideouts:[
            {
                units: { thug:10 },
                reward: [{
                    type:"exp",
                    amount:200,
                    unique:true
                }],
                coords:{x:120, y:40}
            }
        ]
    },
    { //2
        name: chooseNextName(),
        initial: {
            people:0,
            gold: 0,
            wood: 0,
            mana: 1200
        },
        home: {
            coords: { x: 90, y: 30},
            units: { king: 1 }
        },
        dungeons:[
        ],
        hideouts:[
            {
                units: { thug:11 },
                reward: [
                        {
                            type:"mana",
                            amount:1200
                        },
                        {
                            type:"gold",
                            amount:500
                        },
                        {
                            type:"wood",
                            amount:400
                        }
                    ],
                coords:{x:130, y:60}
            },
            {
                units: { thug:2 },
                reward: [{
                    type:"exp",
                    amount:300,
                    unique:true
                }],
                coords:{x:0, y:100}
            }
        ]
    },
    { //3
        name: chooseNextName(),
        initial: {
            people:0,
            gold: 50,
            wood: 0,
            mana: 5000
        },
        home: {
            coords: { x: 0, y: 100},
            units: { king: 1 }
        },
        dungeons:[
            {
                units: { goblin:15, hobgoblin:3 },
                reward: [
                    {
                        type:"mana",
                        amount:600
                    },
                    {
                        type:"wood",
                        amount:1000
                    }
                    ],
                coords:{x:30, y:50},
            }
        ],
        hideouts:[
            {
                units: { thug:7, brigand:2 },
                reward: [{
                    type:"mana",
                    amount:600
                }],
                coords:{x:130, y:60}
            },
            {
                units: { thug:2, brigand:7 },
                creates: { units: { thug:2 }, initialTime: 1000, period: 1000 },
                reward: [{
                    type:"exp",
                    amount:400,
                    unique:true
                }],
                coords:{x:0, y:0}
            }
        ]
    },
    { //4
        name: chooseNextName(),
        initial: {
            people:30, //5270
            gold: 100,
            wood: 0,
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
                coords:{x:30, y:50}
            },
            {
                units: { goblin:20, hobgoblin:2 },
                reward: [{
                    type:"mana",
                    amount:600
                }],
                coords:{x:110, y:90}
            },
            {
                units: { goblin:10, hobgoblin:10 },
                reward: [{
                    type:"mana",
                    amount:1200
                }],
                coords:{x:165, y:60}
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
                coords:{x:70, y:20}
            },
            {
                units: { thug:30, brigand:5, bandit:2 },
                creates: { units: { brigand:2 }, initialTime: 800, period: 300 },
                reward: [{
                    type:"gold",
                    amount:5000
                }],
                coords:{x:190, y:0}
            }
        ]
    }
];