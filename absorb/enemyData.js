function createEnemy() {
    let col = selectedFight.col >= 0 ? selectedFight.col : 0; //for initial load
    let row = selectedFight.row >= 0 ? selectedFight.row : 0;
    let data = copyArray(enemyData[col][row]);
    data.attackSpeedCur = 0;
    data.healthCur = data.stats.healthMax;
    data.huntCur = 0;
    data.consumeCur = 0;
    data.isHunted = false;
    data.isConsumed = false;
    data.unlocked = false;
    data.col = col;
    data.row = row;
    return data;
}

function createAllEnemySelection() {
    for(let i = 0; i < enemyData.length; i++) {
        enemySelectionData.push([]);
        for(let j = 0; j < enemyData[i].length; j++) {
            enemySelectionData[i].push({name:enemyData[i][j].name, rank:0, unlocked:false});
        }
    }
}

let enemyDataColNames = ["Plants", "Critters", "Small Monsters", "Beasts"];

let enemyData = [
    [ //Plants
        {
            name:"Flower",
            stats: {
                healthMax: 60,
                healthRegen: 0,
                strength:0,
                attackSpeedMax:60000,
                huntMax: 2000,
                consumeMax: 3000
            },
            reward: {
                healthMax: 5
            }
        },
        {
            name:"Mushroom",
            stats: {
                healthMax: 150,
                healthRegen: .25,
                strength:1,
                attackSpeedMax:3000,
                huntMax: 3000,
                consumeMax: 4000,
            },
            reward: {
                healthRegen: .25,
                healthMax: 3,
                strength:.25
            }
        },
        {
            name:"Shrub",
            stats: {
                healthMax: 450,
                healthRegen: 0,
                strength: 3,
                constitution: 5,
                attackSpeedMax: 1000,
                huntMax: 2000,
                consumeMax: 1000,
            },
            reward: {
                strength:1
            }
        },
    ],
    [ //Critters
        {
            name:"Toad",
            stats: {
                healthMax: 450,
                healthRegen: 0,
                strength: 3,
                constitution: 5,
                attackSpeedMax: 1000,
                huntMax: 2000,
                consumeMax: 1000,
            },
            reward: {
                strength:1
            }
        },
    ]
];


