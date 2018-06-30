'use strict';

function Actions() {
    this.current = [];
    this.next = [];
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
            let curProgress = towns[curAction.townNum][curAction.varName];
            while(curProgress >= curAction.loopCost(segment)) {
                curProgress -= curAction.loopCost(segment);
                segment++;
            }
            //segment is 0,1,2
            let toAdd = curAction.tickProgress(segment) * (curAction.manaCost() / curAction.adjustedTicks);
            // console.log("using: "+curAction.loopStats[(towns[curAction.townNum][curAction.varName + "LoopCounter"]+segment) % curAction.loopStats.length]+" to add: " + toAdd + " to segment: " + segment + " and part " +towns[curAction.townNum][curAction.varName + "LoopCounter"]+" of progress " + curProgress + " which costs: " + curAction.loopCost(segment));
            towns[curAction.townNum][curAction.varName] += toAdd;
            curProgress += toAdd;
            while(curProgress >= curAction.loopCost(segment)) {
                curProgress -= curAction.loopCost(segment);
                //segment finished
                if (segment === curAction.segments - 1) {
                    //part finished
                    towns[curAction.townNum][curAction.varName] = 0;
                    towns[curAction.townNum][curAction.varName + "LoopCounter"] += curAction.segments;
                    towns[curAction.townNum]["total"+curAction.varName]++;
                    segment -= curAction.segments;
                    curAction.loopsFinished();
                    if(!curAction.segmentFinished) {
                        view.updateMultiPart(curAction);
                    }
                }
                if(curAction.segmentFinished) {
                    curAction.segmentFinished();
                    view.updateMultiPart(curAction);
                }
                segment++;

            }
            view.updateMultiPartSegments(curAction);
        }
        if(curAction.ticks >= curAction.adjustedTicks) {
            curAction.ticks = 0;
            curAction.loopsLeft--;

            this.completedTicks += curAction.adjustedTicks;
            curAction.finish();

            if(curAction.cost) {
                curAction.cost();
            }

            this.adjustTicksNeeded();
            view.updateCurrentActionLoops(this.currentPos);
        }
        view.updateCurrentActionBarRequest(this.currentPos);
        if(curAction.loopsLeft === 0) {
            if(!this.current[this.currentPos + 1] && document.getElementById("repeatLastAction").checked &&
                (!curAction.canStart || curAction.canStart()) && curAction.townNum === curTown) {
                curAction.loopsLeft++;
                curAction.loops++;
            } else {
                this.currentPos++;
            }
        }
    };

    this.getNextValidAction = function() {
        let curAction = this.current[this.currentPos];
        if(!curAction) {
            return curAction;
        }
        if(getTravelNum(curAction.name) && (!curAction.canStart || curAction.canStart())) {
            return curAction;
        }
        if(curAction.allowed && getNumOnCurList(curAction.name) > curAction.allowed()) {
            curAction.ticks = 0;
            view.updateCurrentActionBar(this.currentPos);
            return undefined;
        }
        if((curAction.canStart && !curAction.canStart()) || curAction.townNum !== curTown) {
            curAction.errorMessage = this.getErrorMessage(curAction);
            curAction.loopsFailed = curAction.loopsLeft;
            curAction.loopsLeft = 0;
            view.updateCurrentActionBar(this.currentPos);
            this.currentPos++;
            curAction = this.current[this.currentPos];
        }
        return curAction;
    };

    this.getErrorMessage = function(action) {
        if(action.townNum !== curTown) {
            return "You were in area " + (curTown+1) + " when you tried this action, and needed to be in " + (action.townNum+1);
        }
        if(action.canStart && !action.canStart()) {
            return "You could not make the cost for the action."
        }
        return "??";
    };

    this.restart = function() {
        this.currentPos = 0;
        this.completedTicks = 0;
        curTown = 0;
        towns[0].Heal = 0;
        towns[0].HealLoopCounter = 0;
        towns[0].Fight = 0;
        towns[0].FightLoopCounter = 0;
        towns[0].SDungeon = 0;
        towns[0].SDungeonLoopCounter = 0;
        towns[0].suppliesCost = 300;
        view.updateSupplies();
        towns[2].AdvGuild = 0;
        towns[2].AdvGuildLoopCounter = 0;
        window.curAdvGuildSegment = 0;
        towns[2].CraftGuild = 0;
        towns[2].CraftGuildLoopCounter = 0;
        window.curCraftGuildSegment = 0;
        guild = "";
        if(document.getElementById("currentListActive").checked) {
            this.currentPos = 0;
            this.completedTicks = 0;

            for(let i = 0; i < this.current.length; i++) {
                let action = this.current[i];
                action.loopsLeft = action.loops;
                action.ticks = 0;
                action.manaUsed = 0;
            }

        } else {
            this.current = [];
            for(let i = 0; i < this.next.length; i++) {
                let action = this.next[i];
                if (action.loops === 0) { //don't add blank ones
                    continue;
                }
                let toAdd = translateClassNames(action.name);

                toAdd.loops = action.loops;
                toAdd.loopsLeft = action.loops;
                toAdd.ticks = 0;
                toAdd.manaUsed = 0;

                this.current.push(toAdd);
            }
        }
        if(this.current.length === 0) {
            pauseGame();
        }
        this.adjustTicksNeeded();
        view.updateMultiPartActions();
        view.updateNextActions();
    };

    this.adjustTicksNeeded = function() {
        let remainingTicks = 0;
        for(let i = 0; i < this.current.length; i++) {
            let action = this.current[i];
            if(i < this.currentPos) {
                continue;
            }
            setAdjustedTicks(action);
            remainingTicks += action.loopsLeft * action.adjustedTicks;
        }
        this.totalNeeded = this.completedTicks + remainingTicks;
        view.updateTotalTicks();
    };


    this.addAction = function(action, loops, initialOrder) {
        let toAdd = {};
        toAdd.name = action;

        toAdd.loops = loops !== undefined ? loops : this.addAmount;

        if(initialOrder !== undefined) {
            this.next.splice(initialOrder, 0, toAdd) //insert at index
        } else {
            if(document.getElementById("addActionTop").checked) {
                this.next.splice(0, 0, toAdd);
            } else {
                this.next.push(toAdd);
            }
        }
    };
}

function setAdjustedTicks(action) {
    let newCost = 0;
    for(let i = 0; i < statList.length; i++) {
        let statName = statList[i];
        if(action.stats[statName]) {
            newCost += action.stats[statName] / (1 + getLevel(statName)/100);
        }
    }
    action.adjustedTicks = Math.ceil(action.manaCost() * newCost - .000001);
}

function calcSoulstoneMult(soulstones) {
    return 1+Math.pow(soulstones, .8)/10;
}

function addExpFromAction(action) {
    for(let i = 0; i < statList.length; i++) {
        let statName = statList[i];
        if(action.stats[statName]) {
            let expToAdd = action.stats[statName] * action.expMult * (action.manaCost() / action.adjustedTicks) * getTotalBonusXP(statName);
            if(!action["statExp"+statName]) {
                action["statExp"+statName] = 0;
            }
            action["statExp"+statName] += expToAdd;
            addExp(statName, expToAdd);
        }
    }
}

function getNumOnList(actionName) {
    let count = 0;
    for(let i = 0; i < actions.next.length; i++) {
        if(actions.next[i].name === actionName) {
            count += actions.next[i].loops;
        }
    }
    return count;
}

function getNumOnCurList(actionName) {
    let count = 0;
    for(let i = 0; i < actions.current.length; i++) {
        if(actions.current[i].name === actionName) {
            count += actions.current[i].loops;
        }
    }
    return count;
}