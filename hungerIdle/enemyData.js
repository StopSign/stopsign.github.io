function createEnemy(col, row) {
    // let col = selectedFight.col >= 0 ? selectedFight.col : 0; //for initial load
    // let row = selectedFight.row >= 0 ? selectedFight.row : 0;
    let data = copyArray(enemyData[col][row]);
    data.attackSpeedCur = 0;
    data.healthCur = data.stats.healthMax;
    data.huntCur = 0;
    data.consumeCur = 0;
    data.isHunted = false;
    data.isConsumed = false;
    data.unlocked = true; //false if we want locking
    data.col = col;
    data.row = row;

    data.stats.strength = data.stats.strength === undefined ? 0 : data.stats.strength;
    data.stats.healthRegen = data.stats.healthRegen === undefined ? 0 : data.stats.healthRegen;
    data.stats.constitution = data.stats.constitution === undefined ? 0 : data.stats.constitution;
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
                healthMax: 3,
                healthRegen: .25,
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


