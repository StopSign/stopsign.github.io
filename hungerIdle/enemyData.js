function createEnemy(col, row) {
    // let col = selectedFight.col >= 0 ? selectedFight.col : 0; //for initial load
    // let row = selectedFight.row >= 0 ? selectedFight.row : 0;
    let data = copyArray(enemyData[col][row]);
    data.huntCur = 0;
    data.consumeCur = 0;
    data.isHunted = false;
    data.isConsumed = false;
    data.col = col;
    data.row = row;

    zeroStats(data);

    return data;
}

function zeroStats(creature) {
    creature.attackSpeedCur = 0;
    creature.healthCur = creature.stats.healthMax;

    creature.stats.healthRegen = creature.stats.healthRegen === undefined ? 0 : creature.stats.healthRegen;
    creature.stats.strength = creature.stats.strength === undefined ? 0 : creature.stats.strength;
    creature.stats.constitution = creature.stats.constitution === undefined ? 0 : creature.stats.constitution;
    creature.stats.agility = creature.stats.agility === undefined ? 0 : creature.stats.agility;
    creature.stats.dexterity = creature.stats.dexterity === undefined ? 0 : creature.stats.dexterity;
    creature.stats.perception = creature.stats.perception === undefined ? 0 : creature.stats.perception;
    creature.stats.reflex = creature.stats.reflex === undefined ? 0 : creature.stats.reflex;
    creature.stats.reflect = creature.stats.reflect === undefined ? 0 : creature.stats.reflect;
    creature.stats.harden = creature.stats.harden === undefined ? 0 : creature.stats.harden;
    creature.stats.scavenge = creature.stats.scavenge === undefined ? 0 : creature.stats.scavenge;
    creature.stats.hunt = creature.stats.hunt === undefined ? 0 : creature.stats.hunt;
    creature.stats.staminaMax = creature.stats.staminaMax === undefined ? 0 : creature.stats.staminaMax;
    creature.staminaCur = creature.stats.staminaMax;
    creature.stats.poison = creature.stats.poison === undefined ? 0 : creature.stats.poison;
    creature.stats.recover = creature.stats.recover === undefined ? 0 : creature.stats.recover;
}

function createAllEnemySelection() {
    for(let i = 0; i < enemyData.length; i++) {
        enemySelectionData.push([]);
        for(let j = 0; j < enemyData[i].length; j++) {
            enemySelectionData[i].push({name:enemyData[i][j].name, rank:0, unlocked:true});
        }
    }
}

let enemyDataColNames = ["Plants", "Critters", "Small Monsters", "Beasts"];

let enemyData = [
    [ //Plants
        {
            name:"Moss",
            stats: {
                huntMax: 1000,
                consumeMax: 2000,
                healthMax: 25,
                attackSpeedMax: 60000
            },
            reward: {
                healthMax: 5
            }
        },
        {
            name:"Mushroom",
            stats: {
                huntMax: 9000,
                consumeMax: 4000,
                healthMax: 80,
                healthRegen: .25,
                attackSpeedMax: 3000,
                strength:2
            },
            reward: {
                strength:.25,
                healthRegen: .25
            }
        },
        {
            name:"Fruit",
            stats: {
                huntMax: 2000,
                consumeMax: 10000,
                healthMax: 150,
                healthRegen: .5,
                attackSpeedMax: 10000,
                constitution: 10,
                reflect: 6
            },
            reward: {
                healthMax: 5,
                strength: 1
            }
        },
        {
            name:"Flower",
            stats: {
                huntMax: 9000,
                consumeMax: 2000,
                healthMax: 500,
                healthRegen: 3,
                attackSpeedMax: 10000,
                strength: 1,
                constitution: 30,
                reflect: 10
            },
            reward: {
                healthMax: 30,
                constitution: 1
            }
        },
        {
            name:"Shrub",
            stats: {
                huntMax: 12000,
                consumeMax: 20000,
                healthMax: 800,
                healthRegen: 5,
                attackSpeedMax: 10000,
                strength: 3,
                constitution: 100,
                reflect: 20
            },
            reward: {
                healthMax: 50,
                constitution: 5
            }
        },
        {
            name:"Tree",
            stats: {
                huntMax: 6000,
                consumeMax: 30000,
                healthMax: 5000,
                healthRegen: 10,
                attackSpeedMax: 60000,
                constitution: 200,
                harden:20
            },
            reward: {
                healthMax: 400,
                harden:5
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


