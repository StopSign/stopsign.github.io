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
                huntMax: 2000,
                consumeMax: 3000,
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
                attackSpeedMax: 60000,
                constitution: 10,
                reflect: 8
            },
            reward: {
                healthMax: 5,
                strength: 1
            }
        },
        {
            name:"Flower",
            stats: {
                huntMax: 11000,
                consumeMax: 4000,
                healthMax: 300,
                healthRegen: 3,
                attackSpeedMax: 60000,
                constitution: 30,
                reflect: 20
            },
            reward: {
                healthMax: 30,
                constitution: 1
            }
        },
        {
            name:"Shrub",
            stats: {
                huntMax: 6000,
                consumeMax: 20000,
                healthMax: 500,
                healthRegen: 5,
                attackSpeedMax: 10000,
                strength: 10,
                constitution: 100,
                reflect: 40
            },
            reward: {
                healthMax: 50,
                constitution: 5,
                reflect:1
            }
        },
        {
            name:"Tree",
            stats: {
                huntMax: 6000,
                consumeMax: 30000,
                healthMax: 1500,
                healthRegen: 5,
                attackSpeedMax: 60000,
                constitution: 200,
                harden:10
            },
            reward: {
                healthMax: 300,
                constitution:10,
                harden:3
            }
        },
    ],
    [ //Critters
        {
            name:"Toad",
            stats: {
                huntMax: 12000,
                consumeMax: 3000,
                healthMax: 350,
                healthRegen: 6,
                attackSpeedMax: 2000,
                strength: 15,
                constitution: 5
            },
            reward: {
                healthMax:10,
                healthRegen:1,
                scavenge:2
            }
        },
        {
            name:"Beetle",
            stats: {
                huntMax: 6000,
                consumeMax: 14000,
                healthMax: 150,
                healthRegen: 1,
                attackSpeedMax: 6000,
                strength: 50,
                constitution: 100,
                harden:10
            },
            reward: {
                strength:2,
                harden:.25
            }
        },
        {
            name:"Squirrel",
            stats: {
                huntMax: 18000,
                consumeMax: 4000,
                healthMax: 700,
                healthRegen: 2,
                attackSpeedMax: 1000,
                strength: 10,
                dexterity: 20,
                perception: 40
            },
            reward: {
                agility: 1,
                hunt: 2
            }
        },
        {
            name:"Snake",
            stats: {
                huntMax: 11000,
                consumeMax: 12000,
                healthMax: 300,
                healthRegen: 2,
                attackSpeedMax: 4000,
                strength: 40,
                dexterity: 300,
                constitution: 100,
                reflex: 100
            },
            reward: {
                dexterity:5,
                constitution:4
            }
        },
    ]
];


