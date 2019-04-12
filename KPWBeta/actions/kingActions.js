let king = {
    savedData: {
        int:0,
        wis:0,
        cha:1,
        rflxInitial:10,
        rflxCap:10,
        exp:0
    },
    curData: {
        aura:"",
        rflxCur:10
    },
    tick: function() {

    },
    getLevel: function() { //200, 500, 900, 1400, etc.
            let level = Math.floor((Math.sqrt(2*king.savedData.exp + 225)-25)/10+.0000001);
            return level < 0 ? 0 : level+1;
    },
    getExpOfLevel: function(level) {
        return 50 * (level+2) * (level + 3)-100; //50 *(y+2)* (y + 3)-100
    },
    calcRapportBonus: function() {
        let bonus = 0;
        for(let i = 0; i < levelSave[curLevel].highestPerson.length; i++) {
            if(levelData.data.person < levelSave[curLevel].highestPerson[i].person) {
                bonus += levelSave[curLevel].highestPerson[i].amount;
            }
        }
        return 1 + (bonus / 4);
    },
    saveHighestPerson: function() {
        //{ person, amount }
        let found = false;
        for(let i = 0; i < levelSave[curLevel].highestPerson.length; i++) {
            let highestPerson = levelSave[curLevel].highestPerson[i];
            if(highestPerson.person === levelData.data.person) {
                highestPerson.amount++;
                found = true;
                break;
            }
        }
        if(!found) {
            levelSave[curLevel].highestPerson.push({person:levelData.data.person, amount:1});
        }
        levelSave[curLevel].highestPerson.sort(function(a, b){ return a.person-b.person });

        let foundAmount = 0;
        //keep only the top ${highestListsLength}
        for(let i = levelSave[curLevel].highestPerson.length - 1; i >= 0; i--) {
            let highestPerson = levelSave[curLevel].highestPerson[i];
            if(foundAmount >= Math.floor(highestListsLength/2)) {
                levelSave[curLevel].highestPerson.splice(i, 1);
            }
            foundAmount += highestPerson.amount;
            if(foundAmount >= Math.floor(highestListsLength/2)) {
                highestPerson.amount = Math.floor(highestListsLength/2) - (foundAmount - highestPerson.amount);
            }
        }
    },
    getBonusByAura: function(auraName) {
        if(!king.kingIsHome() || king.curData.aura !== auraName) {
            return 1;
        }
        if(["gold", "wood"].indexOf(auraName) !== -1) {
            return 2 + (king.savedData.cha-1) / 20;
        }
        if("build" === auraName) {
            return document.getElementById("keepBuild").checked ? buildAuraValue : 1.5 + king.savedData.int / 100;
        }
        return 1;
    },
    kingIsHome: function() {
        let kingIsHome = false;
        levelData.home.units.forEach(function(unit) {
            if(unit.varName === "king") {
                kingIsHome = true;
            }
        });
        return kingIsHome;
    },
    gainExp: function(amount) {
        if(amount <= 0) {
            return;
        }
        let levelBefore = king.getLevel();
        king.savedData.exp += amount;
        if(king.getLevel() !== levelBefore) { //leveled up
            console.log('leveled up!');
            king.savedData.rflxCap += 2;
        }
    },
    recalcListLength: function() {
        highestListsLength = Math.floor(king.savedData.int) + 6;
    }
};