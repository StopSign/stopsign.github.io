function Actions() {
    this.current = [];
    this.next = [];
    this.curNext = [];
    this.addAmount = 1;

    this.totalNeeded = 0;
    this.completedTicks = 0;
    this.currentPos = 0;

    this.tick = function() {
        let curAction = this.getNextValidAction();
        if(!curAction) { //out of actions
            shouldRestart = true;
            return;
        }
        addExpFromAction(curAction);

        curAction.ticks++;
        curAction.manaUsed++;
        if(curAction.loopStats) { //only for multi-part progress bars
            let segment = 0;
            let curProgress = towns[0][curAction.varName];
            while(curProgress >= curAction.loopCost(segment)) {
                curProgress -= curAction.loopCost(segment);
                segment++;
            }
            //segment is 0,1,2
            let toAdd = curAction.tickProgress(segment) * (curAction.manaCost / curAction.adjustedTicks);
            // console.log("adding: " + toAdd + " to segment: " + segment + " of progress " + curProgress + " which costs: " + curAction.loopCost(segment));
            towns[0][curAction.varName] += toAdd;
            curProgress += toAdd;
            if(curProgress >= curAction.loopCost(segment)) {
                //segment finished
                if(curAction.segmentFinished) {
                    curAction.segmentFinished();
                }
                if (segment === curAction.segments - 1) {
                    //part finished
                    towns[0][curAction.varName] = 0;
                    towns[0][curAction.varName + "LoopCounter"] += curAction.segments;
                    towns[0]["total"+curAction.varName]++;
                    curAction.loopsFinished();
                    view.updateMultiPart(curAction);
                }
            }
            view.updateMultiPartSegments(curAction);
        }
        if(curAction.ticks >= curAction.adjustedTicks) {
            curAction.ticks = 0;
            curAction.loopsLeft--;

            this.completedTicks += curAction.adjustedTicks;
            curAction.finish();

            if(curAction.loopsLeft && curAction.cost) {
                curAction.cost();
            }

            this.adjustTicksNeeded();
            view.updateCurrentActionLoops(this.currentPos);
        }
        view.updateCurrentActionBar(this.currentPos);
        if(curAction.loopsLeft === 0) {
            if(!this.current[this.currentPos + 1] && document.getElementById("repeatLastAction").checked) { //no more last action
                curAction.loopsLeft++;
            } else {
                this.currentPos++;
            }
        }
    };

    this.getNextValidAction = function() {
        let curAction = this.current[this.currentPos];
        if(curAction && curAction.canStart && !curAction.canStart()) {
            curAction.loopsFailed = curAction.loopsLeft;
            curAction.loopsLeft = 0;
            view.updateCurrentActionBar(this.currentPos);
            this.currentPos++;
            curAction = this.current[this.currentPos];
        }
        return curAction;
    };

    this.restart = function() {
        this.currentPos = 0;
        this.completedTicks = 0;
        towns[0].Heal = 0;
        towns[0].HealLoopCounter = 0;
        towns[0].Fight = 0;
        towns[0].FightLoopCounter = 0;
        towns[0].SDungeon = 0;
        towns[0].SDungeonLoopCounter = 0;
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
        view.updateMultiPartActions();
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

    this.capAmount = function(index) {
        let varName = "good"+translateClassNames(this.next[index].name).varName;
        let alreadyExisting = 0;
        for(let i = 0; i < this.next.length; i++) {
            if(i === index || this.next[index].name !== this.next[i].name) {
                continue;
            }
            alreadyExisting += this.next[i].loops;
        }
        let newLoops = towns[0][varName] - alreadyExisting;
        this.next[index].loops = newLoops < 0 ? 0 : newLoops;
        view.updateNextActions();
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
            let soulstoneBonus = stats[statName].soulstone ? (1 + stats[statName].soulstone/10) : 1;
            let expToAdd = soulstoneBonus * action.stats[statName] * action.expMult * (action.manaCost / action.adjustedTicks) * (1+getTalent(statName)/100);
            if(!action["statExp"+statName]) {
                action["statExp"+statName] = 0;
            }
            action["statExp"+statName] += expToAdd;
            addExp(statName, expToAdd);
        }
    });
}