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
            addedWood *= king.helpers.getBonusByAura("wood");
            return addedWood;
        },
        goldToAdd: function() {
            let addedGold = 0;
            addedGold += created.beg;
            addedGold += created.merchant * 5;
            addedGold += created.tax * 25;
            addedGold *= king.helpers.getBonusByAura("gold");
            return addedGold;
        }
    }
};