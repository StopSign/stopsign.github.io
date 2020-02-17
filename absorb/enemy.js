function createEnemy() {
    let data = copyArray(enemyData[0]);
    data.attackSpeedCur = 0;
    data.healthCur = data.healthMax;
    data.huntCur = 0;
    data.consumeCur = 0;
    data.isHunted = false;
    data.isConsumed = false;
    return data;
}

let enemyData = [
    {
        name:"Flower",
        healthMax: 5,
        healthRegen: 0,
        attack:1,
        attackSpeedMax:2000,
        huntMax: 10000,
        consumeMax: 3000,
        reward: {
            healthMax: 0.1
        }
    }
];