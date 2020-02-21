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

    fixStartingStats(data);

    return data;
}

function fixStartingStats(creature) {
    creature.attackSpeedCur = 0;
    creature.poison = 0;

    fixStat(creature, "healthMax");
    fixStat(creature, "healthRegen");
    fixStat(creature, "manaMax");
    fixStat(creature, "manaRegen");
    fixStat(creature, "strength");
    fixStat(creature, "constitution");
    fixStat(creature, "agility");
    fixStat(creature, "dexterity");
    fixStat(creature, "perception");
    fixStat(creature, "reflex");
    fixStat(creature, "reflect");
    fixStat(creature, "harden");
    fixStat(creature, "scavenge");
    fixStat(creature, "hunt");
    fixStat(creature, "staminaMax");
    fixStat(creature, "poison");
    fixStat(creature, "recover");

    creature.max = creature.max === undefined ? 10 : creature.max;
    creature.manaCur = creature.stats.manaMax;
    creature.healthCur = creature.stats.healthMax;
    creature.staminaCur = creature.stats.staminaMax;
}

function fixStat(creature, stat) {
    if(creature.base && creature.base[stat]) {
        creature.stats[stat] = creature.base[stat];
    }
    creature.stats[stat] = creature.stats[stat] === undefined ? 0 : creature.stats[stat];
}

function createAllEnemySelection() {
    enemySelectionData = [];
    for(let i = 0; i < enemyData.length; i++) {
        enemySelectionData.push([]);
        for(let j = 0; j < enemyData[i].length; j++) {
            enemySelectionData[i].push({name:enemyData[i][j].name, rank:0, unlocked:true, consumed:0});
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
                consumeMax: 1000,
                healthMax: 12,
                attackSpeedMax: 60000
            },
            reward: {
                healthMax: 5
            }
        },
        {
            name:"Fruit",
            stats: {
                huntMax: 2000,
                consumeMax: 5000,
                healthMax: 60,
                healthRegen: .5,
                attackSpeedMax: 60000,
                reflect:2
            },
            reward: {
                strength: 1
            }
        },
        {
            name:"Mushroom",
            stats: {
                huntMax: 4000,
                consumeMax: 2000,
                healthMax: 20,
                healthRegen: 3,
                attackSpeedMax: 60000,
                reflect:.5
            },
            reward: {
                recover:1
            }
        },
        {
            name:"Mandrake",
            max:0,
            stats: {
                huntMax: 15000,
                consumeMax: 15000,
                healthMax: 140,
                attackSpeedMax: 20000,
                strength: 70
            },
            reward: {
                manaMax: 100
            }
        },
        // {
        //     name:"Flower",
        //     stats: {
        //         huntMax: 1000,
        //         consumeMax: 2000,
        //         healthMax: 30,
        //         healthRegen: 0.5,
        //         attackSpeedMax: 60000,
        //         constitution: 10,
        //         reflect: .5
        //     },
        //     reward: {
        //         constitution: 1
        //     }
        // },
        // {
        //     name:"Shrub",
        //     stats: {
        //         huntMax: 6000,
        //         consumeMax: 20000,
        //         healthMax: 500,
        //         healthRegen: 5,
        //         attackSpeedMax: 10000,
        //         strength: 10,
        //         constitution: 100,
        //         reflect: 40
        //     },
        //     reward: {
        //         healthMax: 50,
        //         constitution: 5,
        //         reflect:1
        //     }
        // },
        // {
        //     name:"Tree",
        //     stats: {
        //         huntMax: 6000,
        //         consumeMax: 30000,
        //         healthMax: 1500,
        //         healthRegen: 5,
        //         attackSpeedMax: 60000,
        //         constitution: 200,
        //         harden:10
        //     },
        //     reward: {
        //         healthMax: 300,
        //         constitution:10,
        //         harden:3
        //     }
        // },
    ],
    [ //Critters
        {
            name:"Toad",
            stats: {
                huntMax: 12000,
                consumeMax: 3000,
                healthMax: 100,
                healthRegen: .5,
                attackSpeedMax: 4000,
                constitution: 10,
                strength: 8
            },
            reward: {
                scavenge:1,
                recover:1
            }
        },
        // {
        //     name:"Beetle",
        //     stats: {
        //         huntMax: 6000,
        //         consumeMax: 14000,
        //         healthMax: 150,
        //         healthRegen: 1,
        //         attackSpeedMax: 6000,
        //         strength: 50,
        //         constitution: 100,
        //         harden:10
        //     },
        //     reward: {
        //         strength:2,
        //         harden:1
        //     }
        // },
        // {
        //     name:"Squirrel",
        //     stats: {
        //         huntMax: 18000,
        //         consumeMax: 4000,
        //         healthMax: 700,
        //         healthRegen: 2,
        //         attackSpeedMax: 1000,
        //         strength: 10,
        //         dexterity: 20,
        //         perception: 40
        //     },
        //     reward: {
        //         hunt: 2,
        //         perception: 2
        //     }
        // },
        // {
        //     name:"Snake",
        //     stats: {
        //         huntMax: 11000,
        //         consumeMax: 12000,
        //         healthMax: 400,
        //         healthRegen: 2,
        //         attackSpeedMax: 4000,
        //         strength: 40,
        //         dexterity: 300,
        //         constitution: 30,
        //         reflex: 100
        //     },
        //     reward: {
        //         dexterity:5,
        //         reflex:2
        //     }
        // },
    ]
];


