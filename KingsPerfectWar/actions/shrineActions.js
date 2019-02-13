let shrine = {
    tick: function() {

    },
    helpers: {
        calcFavor: function() {
            let toReturn = 0;
            toReturn += created.altar;
            toReturn += created.shrine * 5;
            return toReturn * Math.pow(2, created.ritual);
        },
        saveHighestBlessings: function() {
            actionData.get.blessingActions().forEach(function(action) {
                shrine.helpers.saveHighest(action.varName);
            });
        },
        saveHighest: function(varName) {
            //{ num, amount }
            let found = false;
            let createdAmount = created[varName];
            for(let i = 0; i < levelSave[curLevel].shrine[varName].length; i++) {
                let highestNum = levelSave[curLevel].shrine[varName][i];
                if(highestNum.num === createdAmount) {
                    highestNum.amount++;
                    found = true;
                    break;
                }
            }
            if(!found) {
                levelSave[curLevel].shrine[varName].push({num:createdAmount, amount:1});
            }
            levelSave[curLevel].shrine[varName].sort(function(a, b){ return a.num-b.num });

            let foundAmount = 0;
            //keep only the top ${highestListsLength}
            for(let i = levelSave[curLevel].shrine[varName].length - 1; i >= 0; i--) {
                let highestNum = levelSave[curLevel].shrine[varName][i];
                if(foundAmount >= highestListsLength) {
                    levelSave[curLevel].shrine[varName].splice(i, 1);
                }
                foundAmount += highestNum.amount;
                if(foundAmount >= highestListsLength) {
                    highestNum.amount = highestListsLength - (foundAmount - highestNum.amount);
                }
            }
        },
        calcTributeBonus: function(varName) {
            let bonus = 0;
            let createdAmount = created[varName];
            for(let i = 0; i < levelSave[curLevel].shrine[varName].length; i++) {
                if(createdAmount < levelSave[curLevel].shrine[varName][i].num) {
                    bonus += levelSave[curLevel].shrine[varName][i].amount;
                }
            }
            return 1 + (bonus / 10);
        }
    }
};