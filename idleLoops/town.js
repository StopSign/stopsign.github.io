function Town(index) {
    this.index = index;
    this.varNames = [];
    this.progressVars = [];
    this.totalActionList = [];

    this.expFromLevel = function(level) {
        return level * (level + 1) * 50;
    };

    this.getLevel = function(varName) {
        return Math.floor((Math.sqrt(8*this["exp"+varName]/100+1)-1)/2);
    };

    this.restart = function() {
        for(let i = 0; i < this.varNames.length; i++) {
            let varName = this.varNames[i];
            this["goodTemp"+varName] = this["good"+varName];
            this["lootFrom"+varName] = 0;
            view.updateRegular(varName);
        }
    };

    this.finishProgress = function(varName, expGain, levelUpReward) {
        const prevLevel = this.getLevel(varName);
        this["exp"+varName] += this.getLevel(varName) >= 100 ? 0 : expGain;
        let level = this.getLevel(varName);

        if(level !== prevLevel) {
            //level up
            levelUpReward();

            for(let i = 0; i < view.totalActionList.length; i++) {
                let action = view.totalActionList[i];
                if(towns[curTown].varNames.indexOf(action.varName) !== -1) {
                    view.updateRegular(action.varName);
                }
            }
        }
        view.updateProgressActions();
    };

    this.getPrcToNext = function(varName) {
        let level = this.getLevel(varName);
        let expOfCurLevel = this.expFromLevel(level);
        let curLevelProgress = this["exp"+varName] - expOfCurLevel;
        let nextLevelNeeds = this.expFromLevel(level+1) - expOfCurLevel;
        return curLevelProgress / nextLevelNeeds * 100;
    };

    this.finishRegular = function(varName, rewardRatio, rewardFunc) {
        if(this["total"+varName] - this["checked"+varName] > 0) {
            this["checked"+varName]++;
            if(this["checked"+varName] % rewardRatio === 0) {
                this["lootFrom"+varName] += rewardFunc();
                this["good"+varName]++;
            }
        } else if(this["goodTemp"+varName] > 0) {
            this["goodTemp"+varName]--;
            this["lootFrom"+varName] += rewardFunc();
        }
        view.updateRegular(varName);
    };

    this.createVars = function(varName) {
        if(this["checked"+varName] === undefined) {
            this["checked"+varName] = 0;
        }
        if(this["goodTemp"+varName] === undefined) {
            this["goodTemp"+varName] = 0;
        }
        if(this["good"+varName] === undefined) {
            this["good"+varName] = 0;
        }
        if(this["lootFrom"+varName] === undefined) {
            this["lootFrom"+varName] = 0;
        }
        if(this["total"+varName] === undefined) {
            this["total"+varName] = 0;
        }
        if(this.varNames.indexOf(varName) === -1) {
            this.varNames.push(varName);
        }
    };

    this.createProgressVars = function(varName) {
        if(this["exp"+varName] === undefined) {
            this["exp"+varName] = 0;
        }
        if(this.progressVars.indexOf(varName) === -1) {
            this.progressVars.push(varName);
        }
    };
    if(this.index === 0) {
        this.createVars("Pots");
        this.createVars("Locks");
        this.createVars("SQuests");
        this.createVars("LQuests");
        this.createProgressVars("Wander");
        this.createProgressVars("Met");
        this.createProgressVars("Secrets");
        this.Heal = 0;
        this.HealLoopCounter = 0;
        this.Fight = 0;
        this.FightLoopCounter = 0;
        this.SDungeon = 0;
        this.SDungeonLoopCounter = 0;
        this.suppliesCost = 400;
    } else if(this.index === 1) {
        this.createProgressVars("Forest");
    }

}
