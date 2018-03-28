function Town(difficulty) {
    this.exploredExp = 0;
    this.difficulty = difficulty;

    this.explored = function() {
        return Math.floor((Math.sqrt(8*this.exploredExp/(this.difficulty+1)/100+1)-1)/2);
    };
    this.expFromLevel = function(level) {
        return level * (level + 1) * 50 / (this.difficulty + 1);
    };

    this.restart = function() {
        this.potsWithLoot = this.totalLootPots;
        this.potLoot = 0;
        view.updatePots();
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
            //level up
            this.updatePots();
        }
        view.updateExplored();
    };

    this.totalPots = 0;
    this.checkedPots = 0;
    this.potsWithLoot = 0;
    this.totalLootPots = 0;
    this.potLoot = 0;
    this.smashPots = function() {
        if(this.totalPots - this.checkedPots > 0) {
            this.checkedPots++;
            if(this.checkedPots % 10 === 0) {
                this.potsWithLoot++;
                this.totalLootPots++;
            }
        } else if(this.potsWithLoot > 0) {
            this.potsWithLoot--;
            this.getManaFromPots();
        }
        view.updatePots();
    };
    this.getManaFromPots = function() {
        addMana(100);
        this.potLoot += 100;
    };
    this.updatePots = function() {
        this.totalPots = this.explored() * 10 * (this.difficulty + 1);
        view.updatePots();
    };

    this.getPrcToNext = function() {
        let exploredLevel = this.explored();
        let expOfCurLevel = this.expFromLevel(exploredLevel);
        let curLevelProgress = this.exploredExp - expOfCurLevel;
        let nextLevelNeeds = this.expFromLevel(exploredLevel+1) - expOfCurLevel;
        return curLevelProgress / nextLevelNeeds * 100;
    }
}
