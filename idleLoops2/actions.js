"use strict";

function Actions() {
    this.current = [];
    this.next = [];
    this.addAmount = 1;

    this.totalNeeded = 0;
    this.completedTicks = 0;
    this.currentPos = 0;
    this.timeSinceLastUpdate = 0;

    this.tick = function() {
        const curAction = this.getNextValidAction();
        // out of actions
        if (!curAction) {
            shouldRestart = true;
            return;
        }
        addExpFromAction(curAction);
        curAction.ticks++;
        curAction.manaUsed++;
        curAction.timeSpent += 1 / baseManaPerSecond / getActualGameSpeed();
        // only for multi-part progress bars
        if (curAction.loopStats) {
            let segment = 0;
            let curProgress = towns[curAction.townNum][curAction.varName];
            while (curProgress >= curAction.loopCost(segment)) {
                curProgress -= curAction.loopCost(segment);
                segment++;
            }
            // segment is 0,1,2
            const toAdd = curAction.tickProgress(segment) * (curAction.manaCost() / curAction.adjustedTicks);
            // console.log("using: "+curAction.loopStats[(towns[curAction.townNum][curAction.varName + "LoopCounter"]+segment) % curAction.loopStats.length]+" to add: " + toAdd + " to segment: " + segment + " and part " +towns[curAction.townNum][curAction.varName + "LoopCounter"]+" of progress " + curProgress + " which costs: " + curAction.loopCost(segment));
            towns[curAction.townNum][curAction.varName] += toAdd;
            curProgress += toAdd;
            let partUpdateRequired = false;
            while (curProgress >= curAction.loopCost(segment)) {
                curProgress -= curAction.loopCost(segment);
                // segment finished
                if (segment === curAction.segments - 1) {
                    // part finished
                    if (curAction.name === "Dark Ritual" && towns[curAction.townNum][curAction.varName] >= 4000000) unlockStory("darkRitualThirdSegmentReached");
                    if (curAction.name === "Imbue Mind" && towns[curAction.townNum][curAction.varName] >= 700000000) unlockStory("imbueMindThirdSegmentReached");
                    towns[curAction.townNum][curAction.varName] = 0;
                    towns[curAction.townNum][`${curAction.varName}LoopCounter`] += curAction.segments;
                    towns[curAction.townNum][`total${curAction.varName}`]++;
                    segment -= curAction.segments;
                    curAction.loopsFinished();
                    partUpdateRequired = true;
                    if (curAction.canStart && !curAction.canStart()) {
                        this.completedTicks += curAction.ticks;
                        view.updateTotalTicks();
                        curAction.loopsLeft = 0;
                        curAction.ticks = 0;
                        curAction.manaRemaining = timeNeeded - timer;
                        curAction.goldRemaining = resources.gold;
                        curAction.finish();
                        break;
                    }
                    towns[curAction.townNum][curAction.varName] = curProgress;
                }
                if (curAction.segmentFinished) {
                    curAction.segmentFinished();
                    partUpdateRequired = true;
                }
                segment++;
            }
            view.requestUpdate("updateMultiPartSegments", curAction);
            if (partUpdateRequired) {
                view.requestUpdate("updateMultiPart", curAction);
            }
        }
        if (curAction.ticks >= curAction.adjustedTicks) {
            curAction.ticks = 0;
            curAction.loopsLeft--;

            this.completedTicks += curAction.adjustedTicks;
            curAction.finish();
            curAction.manaRemaining = timeNeeded - timer;
            
            if (curAction.cost) {
                curAction.cost();
            }
            curAction.goldRemaining = resources.gold;

            this.adjustTicksNeeded();
            view.updateCurrentActionLoops(this.currentPos);
        }
        view.requestUpdate("updateCurrentActionBar", this.currentPos);
        if (curAction.loopsLeft === 0) {
            if (!this.current[this.currentPos + 1] && options.repeatLastAction &&
                (!curAction.canStart || curAction.canStart()) && curAction.townNum === curTown) {
                curAction.loopsLeft++;
                curAction.loops++;
                curAction.extraLoops++;
            } else {
                this.currentPos++;
            }
        }
    };

    this.getNextValidAction = function() {
        let curAction = this.current[this.currentPos];
        if (!curAction) {
            return curAction;
        }
        if (curAction.allowed && getNumOnCurList(curAction.name) > curAction.allowed()) {
            curAction.ticks = 0;
            curAction.timeSpent = 0;
            view.updateCurrentActionBar(this.currentPos);
            return undefined;
        }
        while ((curAction.canStart && !curAction.canStart() && curAction.townNum === curTown) || curAction.townNum !== curTown) {
            curAction.errorMessage = this.getErrorMessage(curAction);
            view.updateCurrentActionBar(this.currentPos);
            this.currentPos++;
            if (this.currentPos >= this.current.length) {
                curAction = undefined;
                break;
            }
            curAction = this.current[this.currentPos];
        }
        return curAction;
    };

    this.getErrorMessage = function(action) {
        if (action.townNum !== curTown) {
            return `You were in zone ${curTown + 1} when you tried this action, and needed to be in zone ${action.townNum + 1}`;
        }
        if (action.canStart && !action.canStart()) {
            return "You could not make the cost for this action.";
        }
        return "??";
    };

    this.restart = function() {
        this.currentPos = 0;
        this.completedTicks = 0;
        curTown = 0;
        towns[0].suppliesCost = 300;
        view.updateResource("supplies");
        curAdvGuildSegment = 0;
        curCraftGuildSegment = 0;
        for (const town of towns) {
            for (const action of town.totalActionList) {
                if (action.type === "multipart") {
                    town[action.varName] = 0;
                    town[`${action.varName}LoopCounter`] = 0;
                }
            }
        }
        guild = "";
        if (options.keepCurrentList) {
            this.currentPos = 0;
            this.completedTicks = 0;

            for (const action of this.current) {
                action.loops -= action.extraLoops;
                action.loopsLeft = action.loops;
                action.extraLoops = 0;
                action.ticks = 0;
                action.manaUsed = 0;
                action.manaRemaining = 0;
                action.goldRemaining = 0;
                action.timeSpent = 0;
            }

        } else {
            this.current = [];
            for (const action of this.next) {
                // don't add empty/disabled ones
                if (action.loops === 0 || action.disabled) {
                    continue;
                }
                const toAdd = translateClassNames(action.name);

                toAdd.loops = action.loops;
                toAdd.loopsLeft = action.loops;
                toAdd.extraLoops = 0;
                toAdd.ticks = 0;
                toAdd.manaUsed = 0;
                toAdd.manaRemaining = 0;
                toAdd.goldRemaining = 0;
                toAdd.timeSpent = 0;

                this.current.push(toAdd);
            }
        }
        if (this.current.length === 0) {
            pauseGame();
        }
        this.adjustTicksNeeded();
        view.requestUpdate("updateMultiPartActions");
        view.requestUpdate("updateNextActions");
        view.requestUpdate("updateTime");
    };

    this.adjustTicksNeeded = function() {
        let remainingTicks = 0;
        for (let i = 0; i < this.current.length; i++) {
            const action = this.current[i];
            if (i < this.currentPos) {
                continue;
            }
            setAdjustedTicks(action);
            remainingTicks += action.loopsLeft * action.adjustedTicks;
        }
        this.totalNeeded = this.completedTicks + remainingTicks;
        view.updateTotalTicks();
    };


    this.addAction = function(action, loops, initialOrder, disabled) {
        const toAdd = {};
        toAdd.name = action;
        if (disabled) toAdd.disabled = true;
        else toAdd.disabled = false;

        toAdd.loops = loops === undefined ? this.addAmount : loops;

        if (initialOrder === undefined) {
            if (options.addActionsToTop) {
                this.next.splice(0, 0, toAdd);
            } else {
                this.next.push(toAdd);
            }
        } else {
            // insert at index
            this.next.splice(initialOrder, 0, toAdd);
        }
    };
}

function setAdjustedTicks(action) {
    let newCost = 0;
    for (let i = 0; i < statList.length; i++) {
        const statName = statList[i];
        if (action.stats[statName]) {
            newCost += action.stats[statName] / (1 + getLevel(statName) / 100);
        }
    }
    action.adjustedTicks = Math.ceil(action.manaCost() * newCost - 0.000001);
}

function calcSoulstoneMult(soulstones) {
    return 1 + Math.pow(soulstones, 0.8) / 30;
}

function calcTalentMult(talent) {
    return 1 + Math.pow(talent, 0.4) / 3;
}

function addExpFromAction(action) {
    const adjustedExp = action.expMult * (action.manaCost() / action.adjustedTicks);
    for (const stat of statList) {
        if (action.stats[stat]) {
            const expToAdd = action.stats[stat] * adjustedExp * getTotalBonusXP(stat);
            const statExp = `statExp${stat}`;
            if (!action[statExp]) {
                action[statExp] = 0;
            }
            action[statExp] += expToAdd;
            addExp(stat, expToAdd);
        }
    }
}

function getNumOnList(actionName) {
    let count = 0;
    for (const action of actions.next) {
        if (!action.disabled && action.name === actionName) {
            count += action.loops;
        }
    }
    return count;
}

function getNumOnCurList(actionName) {
    let count = 0;
    for (const action of actions.current) {
        if (action.name === actionName) {
            count += action.loops;
        }
    }
    return count;
}
