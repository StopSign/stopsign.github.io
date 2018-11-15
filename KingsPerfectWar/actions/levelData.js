let levelData = {};

function createLevel(num) {
    let data = copyArray(levelInitials[num]);
    data.traveling = [];
    return data;
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
            coords:{x:15, y:50},
        },
        {
            units: { goblin:20, hobgoblin:2 },
            reward: [{
                type:"mana",
                amount:600
            }],
            coords:{x:55, y:90},
        },
        {
            units: { goblin:10, hobgoblin:10 },
            reward: [{
                type:"mana",
                amount:1200
            }],
            coords:{x:85, y:60},
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
            coords:{x:35, y:20},
        },
        {
            units: { thug:30, brigand:5, bandit:2 },
            creates: { brigand:2, initialTime: 90, period: 30 },
            reward: [{
                type:"gold",
                amount:5000
            }],
            coords:{x:100, y:0},
        }
    ]
}];