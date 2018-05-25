function Actions() {
    this.current = [];
    this.next = [];
    this.curNext = [];
    this.addAmount = 1;

    this.totalNeeded = 0;
    this.completedTicks = 0;
    this.currentPos = 0;

    this.tick = function() {
        let curAction = this.current[this.currentPos];
        if(!curAction) { //out of actions
            shouldRestart = true;
            return;
        }

        addExpFromAction(curAction);
        curAction.ticks++;
        curAction.manaUsed++;
        if(curAction.ticks >= curAction.adjustedTicks) {
            curAction.ticks = 0;
            curAction.loopsLeft--;

            this.completedTicks += curAction.adjustedTicks;
            curAction.finish();

            this.adjustTicksNeeded();
            view.updateCurrentActionLoops(this.currentPos);
        }
        view.updateCurrentActionBar(this.currentPos);
        if(curAction.loopsLeft === 0) {
            this.currentPos++;
        }
    };

    this.restart = function() {
        this.currentPos = 0;
        this.completedTicks = 0;
        if(document.getElementById("currentListActive").checked) {
            this.currentPos = 0;
            this.completedTicks = 0;

            this.current.forEach((action) => {
                action.loopsLeft = action.loops;
                action.ticks = 0;
                action.manaUsed = 0;
            });
        } else {
            this.current = [];
            this.next.forEach((action) => {
                if (action.loops === 0) { //don't add blank ones
                    return;
                }
                let toAdd = translateClassNames(action.name);

                toAdd.loops = action.loops;
                toAdd.loopsLeft = action.loops;
                toAdd.ticks = 0;
                toAdd.manaUsed = 0;

                this.current.push(toAdd);
            });
        }
        this.adjustTicksNeeded();
        view.updateNextActions();
    };

    this.adjustTicksNeeded = function() {
        let remainingTicks = 0;
        this.current.forEach((action, index) => {
            if(index < this.currentPos) {
                return;
            }
            setAdjustedTicks(action);
            remainingTicks += action.loopsLeft * action.adjustedTicks;
        });
        this.totalNeeded = this.completedTicks + remainingTicks;
        view.updateTotalTicks();
    };

    this.addLoop = function(index) {
        this.next[index].loops += this.addAmount;
        view.updateNextActions();
    };
    this.removeLoop = function(index) {
        this.next[index].loops -= this.addAmount;
        if(this.next[index].loops < 0) {
            this.next[index].loops = 0;
        }
        view.updateNextActions();
    };
    this.split = function(index) {
        const toSplit = this.next[index];
        this.addAction(toSplit.name, Math.ceil(toSplit.loops/2), index);
        toSplit.loops = Math.floor(toSplit.loops/2);
        view.updateNextActions();
    };
    this.moveUp = function(index) {
        if(index <= 0) {
            return;
        }
        const temp = this.next[index-1];
        this.next[index-1] = this.next[index];
        this.next[index] = temp;
        view.updateNextActions();
    };
    this.moveDown = function(index) {
        if(index >= this.next.length - 1) {
            return;
        }
        const temp = this.next[index+1];
        this.next[index+1] = this.next[index];
        this.next[index] = temp;
        view.updateNextActions();
    };
    this.removeAction = function(index) {
        this.next.splice(index, 1);
        view.updateNextActions();
    };

    this.addAction = function(action, loops, initialOrder) {
        let toAdd = {};
        toAdd.name = action;

        toAdd.loops = loops !== undefined ? loops : this.addAmount;


        if(initialOrder !== undefined) {
            this.next.splice(initialOrder, 0, toAdd) //insert at index
        } else {
            this.next.push(toAdd);
        }

    };
}

function setAdjustedTicks(action) {
    let statMult = 0;
    statList.forEach((statName) => {
        if(action.stats[statName]) {
            statMult += action.stats[statName] * (1 + getLevel(statName)/100);
        }
    });
    action.adjustedTicks = Math.ceil(action.manaCost / statMult);
}

function addExpFromAction(action) {
    statList.forEach((statName) => {
        if(action.stats[statName]) {
            addExp(statName, action.stats[statName] * action.expMult);
        }
    });
}