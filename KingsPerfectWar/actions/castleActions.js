let castle = {
    tick: function() {
        gold += castle.helpers.goldToAdd();

        wood += castle.helpers.woodToAdd();
    },
    helpers: {
        woodToAdd: function() {
            let addedWood = 0;
            addedWood += created.scavenger;
            addedWood += created.logger * 5;
            addedWood += created.forester * 25;
            addedWood *= king.getBonusByAura("wood");
            addedWood *= created.bounty;
            return addedWood;
        },
        goldToAdd: function() {
            let addedGold = 0;
            addedGold += created.beg;
            addedGold += created.merchant * 5;
            addedGold += created.tax * 25;
            addedGold *= king.getBonusByAura("gold");
            addedGold *= created.peace;
            return addedGold;
        },
        empowerCost: function(varName, stageNum) {
            if(varName === "spearman") {
                return Math.pow(100, stageNum) * 10;
            } else if(varName === "archer") {
                return Math.pow(100, stageNum) * 50;
            } else if(varName === "catapult") {
                return Math.pow(100, stageNum) * 150;
            }
        },
        getNextHighestEmpower: function(varName) {
            let list = levelData.empowered[varName];
            if(!list) {
                return 0;
            }
            for(let i = list.length-1; i >= 0; i--) {
                if(list[i] && list[i] > 0) {
                    list[i]--;
                    return i;
                }
            }
            return 0;
        }
    }
};