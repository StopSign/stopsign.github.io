function Town(difficulty) {
    this.exploredExp = 0;
    this.difficulty = difficulty;
    this.varNames = [];

    this.explored = function() {
        return Math.floor((Math.sqrt(8*this.exploredExp/(this.difficulty+1)/100+1)-1)/2);
    };
    this.expFromLevel = function(level) {
        return level * (level + 1) * 50 / (this.difficulty + 1);
    };

    this.restart = function() {
        this.varNames.forEach((varName) => {
            this["goodTemp"+varName] = this["good"+varName];
            this["lootFrom"+varName] = 0;
            view.updateRegular(varName);
        });
    };

    this.wander = function() {
        const prevExplored = this.explored();
        const expGain = 100;
        this.exploredExp += expGain;
        let explored = this.explored();
        if(explored > 100) { //cap explored %
            this.exploredExp -= expGain;
        }

        if(explored !== prevExplored) {
            //level up explored
            this.totalPots = this.explored() * 5 * (this.difficulty + 1);
            this.totalLocks = this.explored() * (this.difficulty + 1);
            this.varNames.forEach((varName) => {
                view.updateRegular(varName);
            });
        }
        view.updateExplored();
    };
    this.getPrcToNext = function() {
        let exploredLevel = this.explored();
        let expOfCurLevel = this.expFromLevel(exploredLevel);
        let curLevelProgress = this.exploredExp - expOfCurLevel;
        let nextLevelNeeds = this.expFromLevel(exploredLevel+1) - expOfCurLevel;
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

    this.createVars("Pots");
    this.createVars("Locks");

}
