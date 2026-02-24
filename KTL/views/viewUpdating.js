let view = {
    cached: {}, //contains the elements that are being iterated over and updated regularly,
    prevValues: {},
    scheduled: [],
};

/*
Types of views:
update: run once a frame
generate: functions to return an html that's made in a loop
create: functions to put the pieces on the page. Uses generate methods.

 */

let totalVisible = [];

let views = {
    updateViewAtFrame: function() { //This is the main view update function that is run once per frame
        views.updateActionsAtFrame();

        views.updateScheduled();
    },
    updateView: function() {
        views.updateActions();
        views.updateStats();

        updateGlobals();
    },
    updateViewOnSecond: function() {
        showAllValidToasts();
        drawChart();
        checkActionsToReveal();

        let toShowUseAmulet = data.useAmuletButtonShowing && data.gameState === "KTL";
        views.updateVal(`openUseAmuletButton`, toShowUseAmulet ? "" : "none", "style.display");

        views.updateVal(`ancientCoinDisplay`, data.doneKTL ? "" : "none", "style.display");
        views.updateVal(`ancientWhisperDisplay`, data.doneKTL ? "" : "none", "style.display");
        views.updateVal(`legacyDisplay`, data.legacy > 0 ? "" : "none", "style.display");
        views.updateVal(`highestLegacyContainer`, data.highestLegacy > 0 ? "" : "none", "style.display");
        views.updateVal(`highestLegacy`, data.highestLegacy, "textContent", 2);
        views.updateVal(`secondsPassed`, data.currentGameState.secondsPassed, "textContent", "time");
        views.updateVal(`secondsThisLSContainer`, data.lichKills > 0 ? "" : "none", "style.display");
        views.updateVal(`secondsThisLS`, data.currentGameState.secondsThisLS, "textContent", "time");
        views.updateVal(`legacyMult`, data.legacyMultKTL, "innerText", 2);
        views.updateVal(`ancientCoinMult`, data.ancientCoinMultKTL, "innerText", 2);

        views.updateVal(`manaQualityDisplay`, actionData.awakenYourGrimoire.manaQuality() > 0 ? "" : "none", "style.display");

        views.updateVal(`jobDisplay`, data.displayJob ? "" : "none", "style.display");

        let shouldShowKTLButton = data.actions.hearAboutTheLich.level >= 1 && data.gameState !== "KTL";
        views.updateVal(`killTheLichMenuButton2`, shouldShowKTLButton?"":"none", "style.display")

    },
    scheduleUpdate: function(elementId, value, type) {
        view.scheduled.push({
            id:elementId,
            value:value,
            type:type
        })
    },
    updateScheduled: function() { //Comes from async processes in data, like onComplete
        for(let scheduled of view.scheduled) {
            views.updateVal(scheduled.id, scheduled.value, scheduled.type);
        }
        view.scheduled = [];
    },
    updateStats:function() {
        for(let attVar in data.atts) {
            views.updateStat(attVar);
        }
    },
    updateStat:function(attVar) {
        let attObj = data.atts[attVar];

        //Handle visibility
        let isVisible = attVar !== "legacy" && (attObj.unlocked || globalVisible);
        views.updateVal(`${attVar}AttContainer`, isVisible?"":"none", "style.display");
        if(!isVisible) {
            return;
        }

        views.updateVal(`${attVar}AttBaseContainer`, attObj.attBase !== 0 ?"":"none", "style.display");
        views.updateVal(`${attVar}AttBase`, (attObj.attBase > 0 ? "+":"")+attObj.attBase, "textContent");

        //Update the numbers
        let roundedNumbers = [["num", 2], ["attMult", 2]]; //["perMinute", 2],

        for(let numberObj of roundedNumbers) {
            let capName = capitalizeFirst(numberObj[0]);
            views.updateVal(`${attVar}${capName}`, data.atts[attVar][`${numberObj[0]}`], "textContent", numberObj[1]);
        }
    },
    updateActionsAtFrame:function() {
        for(let actionVar in data.actions) {
            let actionObj = data.actions[actionVar];
            views.updateAction(actionObj);
        }
        for(let actionVar of data.currentPinned) {
            views.updatePinned(actionVar);
        }
    },
    updateActions:function() {
        views.updateAura();
    },
    updateAura:function() {
        let resourceAmounts = {};

        for (let actionVar in data.actions) {
            let actionObj = data.actions[actionVar];
            let dataObj = actionData[actionVar];
            let resourceName = dataObj.resourceName;
            let resourceAmount = actionObj.resource;

            if (!resourceAmounts[resourceName]) {
                resourceAmounts[resourceName] = [];
            }

            resourceAmounts[resourceName].push({
                id: actionVar,
                amount: resourceAmount
            });
        }

        for (let resourceName in resourceAmounts) {
            let list = resourceAmounts[resourceName];
            let maxAmount = Math.max(...list.map(entry => entry.amount));

            for (let entry of list) {
                let ratio = maxAmount > 0 ? entry.amount / maxAmount : 0;
                // let actionObj = data.actions[entry.id];
                let dataObj = actionData[entry.id]
                let mod = dataObj.resourceName === "momentum" ? 100 : 1000;
                if(maxAmount < mod) {
                    ratio *= maxAmount/mod; //scale first 1000 smoother.
                }

                let color = getResourceColorDim(entry.id);

                views.updateVal(`${entry.id}Container`,`${color} 0px 0px ${Math.floor(ratio * 100)/2}px ${Math.floor(ratio * 50)/2}px`,"style.boxShadow");
                views.updateVal(`${entry.id}LargeVersionContainer`,`inset ${color} 0px 0px ${Math.floor(ratio * 20)/2}px ${Math.floor(ratio * 10)/2}px`,"style.boxShadow");
                // views.updateVal(`${entry.id}SmallVersionContainer`,`inset ${getResourceColor(actionObj)} 0px 0px ${Math.min(ratio * 15)}px ${Math.min(ratio * 5)}px`,"style.boxShadow");
            }
        }
    },
    updatePinned:function(actionVar) {
        let actionObj = data.actions[actionVar];
        let isMaxLevel = actionObj.maxLevel !== undefined && actionObj.level >= actionObj.maxLevel;

        views.updateVal(`${actionVar}Level3`, actionObj.level, "innerText", 1);
        if(actionObj.maxLevel >= 0) {
            views.updateVal(`${actionVar}MaxLevel3`, actionObj.maxLevel, "innerText", 1);
        }
        views.updateVal(`${actionVar}PinnedLevels`, isMaxLevel?"var(--max-level-color)":"var(--text-primary)", "style.color");
        views.updateVal(`${actionVar}PinnedLevels`, actionObj.visible?"1":".6", "style.opacity");
    },
    updateAction:function(actionObj) {
        //Handle visibility
        if(!views.updateActionVisibility(actionObj)) {
            return; //If not visible or in small mode, don't update
        }

        views.updateActionSharedViews(actionObj);
        if(!actionObj.unlocked) {
            views.updateActionLockedViews(actionObj);
        } else {
            views.updateActionUnlockedViews(actionObj);
        }
    },
    updateActionVisibility: function(actionObj) {
        let actionVar = actionObj.actionVar;
        let dataObj = actionData[actionVar];
        let parentVar = dataObj.parentVar;

        //if game state doesn't match, return
        if(dataObj.plane !== data.planeTabSelected) {
            return false;
        }
        let toDisplay = actionObj.visible || globalVisible;
        let isInRange = isActionVisible(actionVar);
        views.updateVal(`${actionVar}Container`, toDisplay&&isInRange?"":"none", "style.display");

        if(parentVar) {
            let parentObj = data.actions[parentVar];
            let parentInRange = isActionVisible(parentVar);
            views.updateVal(`${parentVar}_${actionVar}_Line_Outer`, (globalVisible||(toDisplay&&parentObj.visible&&(parentInRange||isInRange))) && !dataObj.hideUpstreamLine ?"flex":"none", "style.display");
            views.updateVal(`${parentVar}_${actionVar}_Line_Inner`, toDisplay && parentObj.visible ?"":"none", "style.display");
        }

        if(!toDisplay || !isInRange) {
            return false; //don't update other numbers
        }

        let miniVersion = scaleByPlane[data.planeTabSelected] < .55;
        let isMaxLevel = actionObj.maxLevel !== undefined && actionObj.level >= actionObj.maxLevel;
        views.updateVal(`${actionVar}LargeVersionContainer`, !miniVersion?"":"none", "style.display");
        views.updateVal(`${actionVar}SmallVersionContainer`, miniVersion?"":"none", "style.display");
        views.updateVal(`${actionVar}Container`, miniVersion ? "100px" : "" , "style.borderRadius");
        views.updateVal(`${actionVar}SmallVersionContainer`, ((scaleByPlane[data.planeTabSelected] < .11) ? 3 : (1 / scaleByPlane[data.planeTabSelected])*.8)+"", "style.scale");

        views.updateVal(`${actionVar}SmallVersionTitle`, scaleByPlane[data.planeTabSelected] < .11 ? "0" : "1" , "style.opacity");
        views.updateVal(`${actionVar}Container`, miniVersion ? "100px" : "" , "style.borderRadius");

        views.updateVal(`${actionVar}SmallVersionLevels`, isMaxLevel?"var(--max-level-color)":"var(--text-primary)", "style.color");
        views.updateVal(`${actionVar}Level2`, actionObj.level, "innerText", 1);
        views.updateVal(`${actionVar}MaxLevel2`, actionObj.maxLevel, "innerText", 1);
        views.updateVal(`${actionVar}IsMaxLevel`, isMaxLevel && !miniVersion && actionObj.unlocked ? "":"none", "style.display");


        //go through each downstream
        for (let downstreamVar of dataObj.downstreamVars) {
            if(!actionData[downstreamVar]) {
                continue;
            }
            views.updateVal(`${actionVar}_${downstreamVar}_Line_Inner_Container`, !miniVersion ? "flex" : "none", "style.display");
            let boxShadow = !isAttentionLine(actionVar, downstreamVar)?"":(miniVersion?"0 0 40px 11px yellow":"0 0 18px 5px yellow");
            views.updateVal(`${actionVar}_${downstreamVar}_Line_Outer`, boxShadow, "style.boxShadow");
        }

        return !miniVersion;
    },
    updateActionSharedViews: function(actionObj) {
        let actionVar = actionObj.actionVar;
        let dataObj = actionData[actionVar];

        views.updateVal(`${actionVar}LockContainer`, (!actionObj.unlocked && actionObj.currentMenu!=="automation")?"":"none", "style.display");
        views.updateVal(`${actionVar}ResourceInfoContainer`, (!actionObj.unlocked && actionObj.currentMenu==="automation")?"none":"", "style.display");

        let efficiencyToUse = actionObj.efficiency;
        if(dataObj.backwardsEfficiency) {
            efficiencyToUse = 100 - actionObj.efficiency;
        }
        let effColor = `rgb(${Math.round(20+189*(1-(efficiencyToUse/100)))},${Math.round(20+189*(efficiencyToUse/100))}, 100)`
        views.updateVal(`${actionVar}Efficiency`, effColor, "style.color");

        //Update the numbers
        let roundedNumbers = [["efficiency", 2]];
        if(actionObj.maxLevel !== undefined) {
            roundedNumbers.push(["maxLevel", 1]);
        }
        if(actionObj.wage) {
            roundedNumbers.push(["wage", 2]);
        }
        if(dataObj.isSpell) {
            let instaColor = `rgb(${Math.min(255, Math.round(actionObj.instability * 0.1275))}, ${Math.max(0, Math.round(255 - actionObj.instability * 0.1275))}, 100)`;
            views.updateVal(`${actionVar}Instability`, instaColor, "style.color");
            roundedNumbers.push(["instability", 2]);
            views.updateVal(`${actionVar}InstabilityToAdd`, dataObj.instabilityToAdd/(actionObj.efficiency/100), "textContent", 2);
            views.updateVal(`${actionVar}InstabilityToRemove`, getInstabilityReduction(actionObj.instability), "textContent", 2);
            views.updateVal(`${actionVar}SpellPower`, dataObj.spellPower(), "textContent", 1);
        }
        if(dataObj.manaQuality) {
            views.updateVal(`${actionVar}ManaQuality`, dataObj.manaQuality(), "textContent", 1);
        }

        for(let numberObj of roundedNumbers) {
            let capName = capitalizeFirst(numberObj[0]);
            let nameNoNums = numberObj[0].replace(/\d+/g, '');
            views.updateVal(`${actionVar}${capName}`, data.actions[actionVar][`${nameNoNums}`], "textContent", numberObj[1]);
        }

        //Update visibility even before unlock, because it affects the shape of it
        if (actionObj.currentMenu === "downstream") {
            for (let downstreamVar of dataObj.downstreamVars) {
                let downstreamObj = data.actions[downstreamVar];

                if(downstreamObj && actionData[downstreamVar].hasUpstream) {
                    views.updateVal(`${actionVar}SliderContainer${downstreamVar}`, downstreamObj.visible ? "" : "none", "style.display");
                }
            }
        }

        //if icon menu is open
        if(dataObj.hoveringIcon) {
            let shouldShowLevels = dataObj.plane !== 2 && !data.isSpell;
            views.updateVal(`${actionVar}HighestLevelContainer`, shouldShowLevels && data.upgrades.rememberWhatIDid.isFullyBought && actionObj.highestLevel >= 0 ? "" : "none", "style.display");
            views.updateVal(`${actionVar}SecondHighestLevelContainer`, shouldShowLevels && data.upgrades.rememberHowIGrew.isFullyBought && actionObj.secondHighestLevel >= 0 ? "" : "none", "style.display");
            views.updateVal(`${actionVar}ThirdHighestLevelContainer`, shouldShowLevels && data.upgrades.rememberMyMastery.isFullyBought && actionObj.thirdHighestLevel >= 0 ? "" : "none", "style.display");

            views.updateVal(`${actionVar}HighestLevel`, actionObj.highestLevel, "innerText", 1);
            views.updateVal(`${actionVar}SecondHighestLevel`, actionObj.secondHighestLevel, "innerText", 1);
            views.updateVal(`${actionVar}ThirdHighestLevel`, actionObj.thirdHighestLevel, "innerText", 1);

            if (dataObj.plane !== 1) {
                views.updateVal(`${actionVar}CurrentUnlockTimeContainer`, actionObj.unlockTime >= 0 ? "" : "none", "style.display");
                views.updateVal(`${actionVar}CurrentUnlockTime`, actionObj.unlockTime, "textContent", "time");
                views.updateVal(`${actionVar}PrevUnlockTimeContainer`, actionObj.prevUnlockTime >= 0 ? "" : "none", "style.display");
                views.updateVal(`${actionVar}PrevUnlockTime`, actionObj.prevUnlockTime, "textContent", "time");
                if (actionObj.prevUnlockTime >= 0 && actionObj.unlockTime >= 0) {
                    views.updateVal(`${actionVar}DeltaUnlockTimeContainer`, "", "style.display");
                    views.updateVal(`${actionVar}DeltaUnlockTime`, Math.abs(actionObj.unlockTime - actionObj.prevUnlockTime), "textContent", "time");
                    views.updateVal(`${actionVar}DeltaUnlockTime`, actionObj.unlockTime - actionObj.prevUnlockTime < 0 ? "green" : "red", "style.color");
                } else {
                    views.updateVal(`${actionVar}DeltaUnlockTimeContainer`, "none", "style.display");
                }
            }

            if (dataObj.plane === 1) {
                views.updateVal(`${actionVar}CurrentLevel1TimeContainer`, actionObj.level1Time >= 0 ? "" : "none", "style.display");
                views.updateVal(`${actionVar}CurrentLevel1Time`, actionObj.level1Time, "textContent", "time");
                views.updateVal(`${actionVar}PrevLevel1TimeContainer`, actionObj.prevLevel1Time >= 0 ? "" : "none", "style.display");
                views.updateVal(`${actionVar}PrevLevel1Time`, actionObj.prevLevel1Time, "textContent", "time");
                if (actionObj.prevLevel1Time >= 0 && actionObj.level1Time >= 0) {
                    views.updateVal(`${actionVar}DeltaLevel1TimeContainer`, "", "style.display");
                    views.updateVal(`${actionVar}DeltaLevel1Time`, Math.abs(actionObj.level1Time - actionObj.prevLevel1Time), "textContent", "time");
                    views.updateVal(`${actionVar}DeltaLevel1Time`, actionObj.level1Time - actionObj.prevLevel1Time < 0 ? "green" : "red", "style.color");
                } else {
                    views.updateVal(`${actionVar}DeltaLevel1TimeContainer`, "none", "style.display");
                }
            }

            views.updateVal(`${actionVar}UnlockedCountContainer`, actionObj.unlockedCount > 0 ? "" : "none", "style.display");
            views.updateVal(`${actionVar}UnlockedCount`, actionObj.unlockedCount, "innerText", 1);

            if(dataObj.isSpell) {
                views.updateVal(`${actionVar}SpellCastCount`, actionObj.spellCastCount, "innerText", 1);
            }
        }

        //When action should be dim
        let isMaxLevel = actionObj.maxLevel !== undefined && actionObj.level >= actionObj.maxLevel;
		//If resources are flowing "upstream" that counts as no resources flowing since it's not "active".
		let isResourcesQuiet = (actionObj.resourceIncrease === 0 && actionObj.resourceDecrease === 0) || actionObj.resourceRetrieved !== 0;
        let isQuiet = isMaxLevel && isResourcesQuiet && actionObj.unlocked && !actionObj.mouseOnThis;
        if(!isQuiet) {
            dataObj.blinkDelay = 1;
        } else {
            dataObj.blinkDelay -= 1/(data.gameSettings.ticksPerSecond*3);
            if(dataObj.blinkDelay < 0) {
                dataObj.blinkDelay = 0;
            }
        }
        let opacityRatio = 0.6 + (dataObj.blinkDelay * 0.4);
        views.updateVal(`${actionVar}LargeVersionContainer`, opacityRatio, "style.opacity");
        views.updateVal(`${actionVar}Container`, actionObj.mouseOnThis?"100":"0", "style.zIndex");

        views.updateVal(`${actionVar}ResourceRetrieved`, actionObj.resourceRetrieved > 0 ? "" : "none", "style.display");
        views.updateVal(`${actionVar}ResourceRetrieved`, actionObj.resourceRetrieved > 0 ?`(-${intToString(actionObj.resourceRetrieved * data.gameSettings.ticksPerSecond, 2)}/s)`:"", "textContent");
    },
    updateActionLockedViews: function(actionObj) {
        let actionVar = actionObj.actionVar;
        let dataObj = actionData[actionVar];

        views.updateVal(`${actionVar}UnlockCost`, actionObj.unlockCost, "textContent", 2);
        views.updateVal(`${actionVar}UnlockCostContainer`, dataObj.unlockCost <= 0 ? "none" : "", "style.display");

    },
    updateActionUnlockedViews: function(actionObj) {
        let actionVar = actionObj.actionVar;
        let dataObj = actionData[actionVar];

        //Needle
        let needlePosition = views.helpers.calcBalanceNeedle(actionObj.resourceIncrease, actionObj.resourceDecrease);
        views.updateVal(`${actionVar}BalanceNeedle`, `${needlePosition}%`, "style.left");

        //PBar.
        let isTooFast = actionObj.progressGain / actionObj.progressMax > 4;
        let progress = (actionObj.progress / actionObj.progressMax * 100);
        views.updateVal(`${actionVar}ProgressBarInner`, isTooFast?`100%`:`${(progress > 100 ? 100 : progress)}%`, "style.width");

        let exp = (actionObj.exp / actionObj.expToLevel * 100);
        views.updateVal(`${actionVar}ExpBarInner`, `${(exp > 100 ? 100 : exp)}%`, "style.width");


        let isMaxLevel = actionObj.maxLevel !== undefined && actionObj.level >= actionObj.maxLevel;
        views.updateVal(`${actionVar}LargeVersionContainer`, isMaxLevel?`var(--${dataObj.resourceName}-color-bg)`:"var(--bg-secondary)", "style.backgroundColor");
        //--bg-secondary-max

        if(actionObj.currentMenu === "info") {

        }

        if(actionObj.currentMenu === "atts") { //stats menu
            for(let expAtt of actionObj.expAtts) {
                let attVar = expAtt[0];
                views.updateVal(`${actionVar}_${attVar}AttExpMult`, actionObj[`${attVar}AttExpMult`], "textContent", 3);
            }

            if(dataObj.plane !== 1) {
                views.updateVal(`${actionVar}LowestUnlockTimeContainer`, actionObj.lowestUnlockTime ? "" : "none", "style.display");
                views.updateVal(`${actionVar}LowestUnlockTime`, actionObj.lowestUnlockTime, "textContent", "time");
            } else if(dataObj.plane === 1) {
                views.updateVal(`${actionVar}LowestLevel1Container`, actionObj.lowestLevel1Time ? "" : "none", "style.display");
                views.updateVal(`${actionVar}LowestLevel1Time`, actionObj.lowestLevel1Time, "textContent", "time");
            }
            // for(let efficiencyAtt of actionObj.efficiencyAtts) {
            //     let attVar = efficiencyAtt[0];
            //     views.updateVal(`${actionVar}_${attVar}AttEfficiencyMult`, actionObj[`${attVar}AttEfficiencyMult`], "textContent", 3);
            // }
        }

        if(dataObj.showResourceAdded) {
            views.updateVal(`${actionVar}ShowResourceAdded`, actionObj.showResourceAdded === undefined?"???":"+"+intToString(actionObj.showResourceAdded, 2), "textContent");
        }
        if(dataObj.showExpAdded) {
            views.updateVal(`${actionVar}ShowExpAdded`, actionObj.showExpAdded === undefined?"???":"+"+intToString(actionObj.showExpAdded, 2), "textContent");
        }

        // views.updateVal(`${actionVar}TimeToLevelContainer`, actionObj.maxLevel !== actionObj.level ? "flex" : "none", "style.display")
        views.updateVal(`${actionVar}TimeToMaxContainer`, actionObj.maxLevel ? "flex" : "none", "style.display")

        if(!actionObj.maxLevel || actionObj.maxLevel !== actionObj.level) {
            let timeToLevel = calcTimeToLevel(actionObj);
            views.updateVal(`${actionVar}TimeToLevel`, actionObj.maxLevel !== actionObj.level ? secondsToTime(timeToLevel, true) : "-", "textContent")
        }
        if(actionObj.maxLevel) {
            let timeToMax = calcTimeToMax(actionVar);
            views.updateVal(`${actionVar}TimeToMax`, actionObj.maxLevel !== actionObj.level ? secondsToTime(timeToMax, true) : "-", "textContent")
        }

        views.updateActionDownstreamViews(actionObj, actionObj.currentMenu === "downstream");

        //Update the numbers
        let roundedNumbers = [
            ["progress", 2], ["progressMax", 2], ["progressGain", 2],
            ["resource", 2], ["resourceDelta", 2], ["level", 1],
            ["exp", 2], ["expToLevel", 2], ["expToAdd2", 3],
            ["resourceIncrease", 3], ["resourceDecrease", 3]
        ];
        if(dataObj.actionPowerBase) { //can be a generator w/o action power
            roundedNumbers.push(["actionPower", 4]);
        }
        if(actionVar === "hearAboutTheLich") {
            roundedNumbers.push(["actionPower2", 2]);
        }

        if(actionObj.currentMenu === "atts") {
            roundedNumbers.push(["attReductionEffect", 3]);
            // roundedNumbers.push(["efficiencyMult", 3]);
        }
        roundedNumbers.push(["totalSend", 3]);
        roundedNumbers.push(["progressMaxIncrease", 2]);
        roundedNumbers.push(["expToLevelIncrease", 2]);



        for(let numberObj of roundedNumbers) {
            let capName = capitalizeFirst(numberObj[0]);
            let nameNoNums = numberObj[0].replace(/\d+/g, '');
            views.updateVal(`${actionVar}${capName}`, data.actions[actionVar][`${nameNoNums}`], "textContent", numberObj[1]);
        }

    },
    updateActionDownstreamViews: function(actionObj, isDownstreamMenuSelected) {
        let actionVar = actionObj.actionVar;
        let dataObj = actionData[actionVar];
        if(!dataObj.downstreamVars) {
            return;
        }
        if(isDownstreamMenuSelected) {
            views.updateVal(`${actionVar}_downstreamButtonContainer`, hasDownstreamVisible(actionObj) ? "" : "none", "style.display");
        }

        let amounts = calculateTaken(actionVar, false);

        for(let downstreamVar of dataObj.downstreamVars) {
            let downstreamDataObj = actionData[downstreamVar];
            if (!downstreamDataObj || !downstreamDataObj.hasUpstream) {
                continue;
            }

            let isAttention = isAttentionLine(actionVar, downstreamVar);
            let focusShowing = actionObj[`${downstreamVar}PermFocusMult`] > 1 && downstreamDataObj.hasUpstream;

            if (isDownstreamMenuSelected) {
                let taken = amounts[downstreamVar] ?? 0;

                views.updateVal(`${actionVar}DownstreamSendRate${downstreamVar}`, taken * data.gameSettings.ticksPerSecond, "textContent", 4);

                views.updateVal(`${actionVar}DownstreamAttentionBonusTemp${downstreamVar}`, isAttention ? "" : "none", "style.display");
                views.updateVal(`${actionVar}DownstreamAttentionBonusPerm${downstreamVar}`, focusShowing ? "" : "none", "style.display");
            }

            if(isAttention) {
                views.updateVal(`${actionVar}DownstreamAttentionBonusTemp${downstreamVar}`, `x${intToString(actionObj[downstreamVar + "TempFocusMult"], data.upgrades.learnToFocusMore.upgradePower?3:1)}`, "textContent");
                views.updateVal(`${actionVar}_${downstreamVar}_Line_Inner_Top`, `x${intToString(actionObj[downstreamVar + "TempFocusMult"], data.upgrades.learnToFocusMore.upgradePower?3:1)}`, "textContent");
            }

            views.updateVal(`${actionVar}_${downstreamVar}_Line_Inner_Bottom`, focusShowing ? "" : "none", "style.display");
            if(focusShowing) {
                views.updateVal(`${actionVar}DownstreamAttentionBonusPerm${downstreamVar}`, `x${intToString(actionObj[downstreamVar + "PermFocusMult"], 3)}`);
                views.updateVal(`${actionVar}_${downstreamVar}_Line_Inner_Bottom`, `x${intToString(actionObj[downstreamVar + "PermFocusMult"], 3)}`);
            }

        }
    },


    //helpers
    helpers: {
        calcBalanceNeedle: function(incoming, outgoing) {
            if (outgoing <= 0) return 0;
            let balance = incoming / outgoing;
            if(balance >= 100) {
                return 100;
            }

            if (balance <= 2) {
                return balance * 25;
            } else if (balance <= 10) {
                let logScale = (Math.log10(balance) - Math.log10(2)) / (Math.log10(10) - Math.log10(2));
                return 50 + logScale * 25;
            } else {
                let logScale = (Math.log10(balance) - Math.log10(10)) / (Math.log10(100) - Math.log10(10));
                return 75 + logScale * 25;
            }
        }
    },
    updateVal: function(id, newVal, type="textContent", sigFigs) {
        const el = view.cached[id];
        if(!view.prevValues[id]) {
            view.prevValues[id] = {};
        }
        let prevValue = view.prevValues[id];
        if (!el) {
            console.log("Element of id " + id + " does not exist.");
            console.log(new Error().stack);
            return;
        }

        const typeKey = `lastValue_${type}`;
        let lastVal = prevValue[typeKey] ?? null;
        // let lastVal = null;

        if (lastVal !== newVal) {
            if (type.includes(".")) {
                const [firstKey, secondKey] = type.split(".");
                if (el[firstKey] && el[firstKey][secondKey] !== undefined) {
                    el[firstKey][secondKey] = newVal;
                }
            } else {
                if(sigFigs && sigFigs !== "none") {
                    if(sigFigs === "time") {
                        el[type] = secondsToTime(newVal);
                    } else {
                        el[type] = intToString(newVal, sigFigs);
                    }
                } else {
                    el[type] = newVal;
                }
            }

            prevValue[typeKey] = newVal;
        }
    },
}

function checkActionsToReveal() {
    let itemsToProcess = copyArray(data.queuedReveals);
    data.queuedReveals = {};

    for (let actionVar in itemsToProcess) {
        revealAction(actionVar);
    }
}

function updateGlobals() {
    let totalMometum = 0;
    for(let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        let dataObj = actionData[actionVar];
        if(dataObj.resourceName === "momentum" && gameStateMatches(dataObj)) {
            totalMometum += actionObj.resource;
        }
    }
    data.totalMomentum = totalMometum;

    let manaQuality = actionData.awakenYourGrimoire.manaQuality()
    views.updateVal(`manaQuality`, manaQuality, "textContent", 1);
    views.updateVal(`totalMomentum`, totalMometum, "textContent", 1);

    if(KTLMenuOpen) { //only update if menu is open
        views.updateVal(`manaQuality2`, manaQuality, "textContent", 1);
        views.updateVal(`manaQuality2`, manaQuality>0?"#0ec3cf":"red", "style.color");
        views.updateVal(`manaQualityErrorMessage`, manaQuality === 0?"":"none", "style.display");
    }

    views.updateVal(`secondsPerReset`, data.secondsPerReset, "textContent","time");
    views.updateVal(`NWSecondsContainer`, data.gameState === "ktl"?"":"none", "style.display");
    views.updateVal(`NWSeconds`, data.NWSeconds, "textContent","time");
    views.updateVal(`bonusTime`, data.currentGameState.bonusTime/1000, "textContent", "time");
    views.updateVal(`instantBonusTime`, data.currentGameState.instantTime/1000, "textContent", "time");

    views.updateVal(`legacyAmount`, data.legacy, "textContent", 1);
    views.updateVal(`ancientCoin`, data.ancientCoin, "textContent", 1);
    views.updateVal(`ancientCoin2`, data.ancientCoin, "textContent", 1);
    views.updateVal(`ancientWhisper`, data.ancientWhisper, "textContent", 1);
    views.updateVal(`ancientWhisper2`, data.ancientWhisper, "textContent", 1);
    views.updateVal(`lichCoins2`, data.lichCoins, "textContent", 1);
}


function hasDownstreamVisible(actionObj) {
    let dataObj = actionData[actionObj.actionVar];
    for(let downstreamVar of dataObj.downstreamVars) {
        if(data.actions[downstreamVar] && data.actions[downstreamVar].visible) {
            return true;
        }
    }
    return false;
}

function isActionVisible(actionVar) {
    const element = actionData[actionVar];
    const currentTransformX = transformX[data.planeTabSelected];
    const currentTransformY = transformY[data.planeTabSelected];

    const elementScreenX = currentTransformX + (element.realX * scaleByPlane[data.planeTabSelected]);
    const elementScreenY = currentTransformY + (element.realY * scaleByPlane[data.planeTabSelected]);

    const elementScreenWidth = 350 * scaleByPlane[data.planeTabSelected];
    const elementScreenHeight = 400 * scaleByPlane[data.planeTabSelected];

    return elementScreenX < window.innerWidth &&
        elementScreenX + elementScreenWidth > 0 &&
        elementScreenY < (window.innerHeight+50) &&
        elementScreenY + elementScreenHeight > 0;
}

function actionHasDownstream(actionVar) {
    let dataObj = actionData[actionVar];
    for (let downstreamVar of dataObj.downstreamVars) {
        if (actionData[downstreamVar].hasUpstream) {
            return true;
        }
    }
    return false;
}

function updateSliderContainers() {
    for(let actionVar in data.actions) {
        let dataObj = actionData[actionVar];
        for (let downstreamVar of dataObj.downstreamVars) {
            if(!actionData[downstreamVar].hasUpstream) {
                continue;
            }
            if (data.gameSettings.viewAdvancedSliders) {
                views.updateVal(`${actionVar}_${downstreamVar}_slider_container_advanced`, "inline-block", "style.display");
                views.updateVal(`${actionVar}_${downstreamVar}_slider_container_basic`, "none", "style.display");
            } else {
                views.updateVal(`${actionVar}_${downstreamVar}_slider_container_advanced`, "none", "style.display");
                views.updateVal(`${actionVar}_${downstreamVar}_slider_container_basic`, "flex", "style.display");
            }
        }
        if(!dataObj.hasUpstream) {
            continue;
        }
        if (data.gameSettings.viewAdvancedSliders) {
            views.updateVal(`${actionVar}_automation_slider_advanced`, "inline-block", "style.display");
            views.updateVal(`${actionVar}_automation_slider_basic`, "none", "style.display");
        } else {
            views.updateVal(`${actionVar}_automation_slider_advanced`, "none", "style.display");
            views.updateVal(`${actionVar}_automation_slider_basic`, "flex", "style.display");
        }
        views.updateVal(`${actionVar}SliderContainerAutomation`, data.upgrades.temperMyDesires.upgradePower && dataObj.hasUpstream && dataObj.plane !== 2 ? "":"none", "style.display");
    }
}

function displayLSStuff() {

    modifyMonolithTitles()

    if(!data.lichKills) {
        return;
    }


    if(data.lichKills >= 1) {
        revealUpgrade('rememberWhatIDid') //10
        revealUpgrade('valueMyBody') //15, 150, 1500
        revealUpgrade('pickUpValuablePlants')
        revealUpgrade('shapeMyPath') //20


        unveilPlane(0)
        unveilPlane(3)
        revealAction("reposeRebounded")
        revealAction("turnTheWheel")
        revealAction("dipInTheRiver")
        revealAction("tidalBurden")
        unlockAction(data.actions.reposeRebounded);
        unlockAction(data.actions.turnTheWheel);
        unlockAction(data.actions.tidalBurden);

        if(data.upgrades.increaseInitialInvestment.upgradePower >= 7) {
            revealUpgrade("findAngelInvestors")
        }
    }
    if(data.lichKills >= 2) {
        revealUpgrade('stopBeingSoTense') //200 AW
        revealUpgrade('exploreTheLibrary') //200 AW
        revealUpgrade('valueMyResearch')
        //also reveals spendMyFortune at max investMyCoins

        revealUpgrade("rememberHowIGrew")
        revealUpgrade('retrieveMyUnusedResources') //500
        revealUpgrade("startCasualChats")


        revealUpgrade('haveBetterConversations') //1200 AC
        revealUpgrade('workHarder')
        revealUpgrade('weaveSmallerStrands')
        revealUpgrade('createABetterFoundation')
        revealUpgrade('feelTheRemnants')
        revealUpgrade('sparkMoreMana')
        revealUpgrade('studyHarder')
    }
    if(data.lichKills >= 3) {
        // revealUpgrade("talkToMoreWizards") //800 AW
        revealUpgrade("improveMyHouse")

        purchaseAction("stopDarknessRitual") //goes to western monolith

        //lots more max level increases
        //OTTL doesn't consume all of its momentum
        //reduce progress increase on resonant echoes
    }

    // document.getElementById("lichUpgradeTab").style.display = "";
    // document.getElementById("challengesUpgradeTab").style.display = "";
    // document.getElementById("lichCoinsDisplay").style.display = "";
}


function addCustomTrigger(actionVar) {
    // 1. Hide the "Add" button
    const btn = document.getElementById(`${actionVar}_addCustomTriggerButton`);
    if (btn) btn.style.display = "none";

    // 2. Locate the form container
    const formContainer = document.getElementById(`${actionVar}_customTriggerForm`);

    // 3. Clear any existing junk safely and append the new form
    formContainer.replaceChildren(buildTriggerForm(actionVar));
}


function buildTriggerForm(actionVar) {
    const wrapper = document.createElement('div');
    wrapper.className = "trigger-form-box";

    const row1 = document.createElement('div');
    row1.style.marginBottom = "8px";

    row1.append("Set upstream to ");

    // Reward Select
    const sliderOptionsSelect = document.createElement('select');
    const rewards = [
        { val: 0, text: "Off" },
        { val: 10, text: "10%" },
        { val: 50, text: "50%" },
        { val: 100, text: "100%" }
    ];
    rewards.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.val;
        opt.textContent = r.text;
        sliderOptionsSelect.appendChild(opt);
    });
    row1.append(sliderOptionsSelect);

    row1.append(" when ");

    const targetSelect = document.createElement('select');
    const sortedKeys = Object.keys(data.actions)
        .filter(key => {
            const action = data.actions[key];
            return action.hasBeenUnlocked && actionData[key].plane !== 2 && action.purchased;
        })
        .sort((a, b) => {
            const titleA = actionData[a].title.toLowerCase();
            const titleB = actionData[b].title.toLowerCase();
            return titleA.localeCompare(titleB);
        });

    sortedKeys.forEach(key => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = `${actionData[key].title} [${actionData[key].plane+1}]`;
        targetSelect.appendChild(opt);
    });

    row1.append(targetSelect);

    // --- Row 2: "...is [Condition] [Amount]" ---
    const row2 = document.createElement('div');
    row2.style.marginBottom = "8px";

    row2.append(" is ");

    // Condition Select
    const conditionSelect = document.createElement('select');
    const conditions = [
        { val: "unlocked", text: "Unlocked" },
        { val: "max", text: "Level Max" },
        { val: "specific", text: "Level..." }
    ];
    conditions.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.val;
        opt.textContent = c.text;
        conditionSelect.appendChild(opt);
    });
    row2.append(conditionSelect);

    // Amount Input (Hidden by default)
    const amountInput = document.createElement('input');
    amountInput.type = "number";
    amountInput.className = "trigger-num-input"; // See CSS below
    amountInput.placeholder = "#";
    amountInput.min = "1";
    amountInput.style.display = "none";
    amountInput.style.marginLeft = "5px";
    amountInput.addEventListener('keydown', (event) => {
        event.stopPropagation();
    });
    row2.append(amountInput);

    // Toggle Amount Input Visibility
    conditionSelect.addEventListener('change', () => {
        if (conditionSelect.value === 'specific') {
            amountInput.style.display = 'inline-block';
            amountInput.focus();
        } else {
            amountInput.style.display = 'none';
            amountInput.value = ''; // Reset
        }
    });

    // --- Row 3: Recurse & Buttons ---
    const row3 = document.createElement('div');
    row3.className = "trigger-form-actions";

    // Recurse Checkbox
    const recurseLabel = document.createElement('label');
    recurseLabel.textContent = "Recurse Upstream: ";
    const recurseCheck = document.createElement('input');
    recurseCheck.type = "checkbox";
    recurseCheck.checked = true; // Default On
    recurseLabel.append(recurseCheck);
    row3.append(recurseLabel);

    // Spacing
    const spacer = document.createElement('span');
    spacer.style.margin = "0 10px";
    row3.append(spacer);

    // Save Button
    const saveBtn = document.createElement('button');
    saveBtn.textContent = "Save";
    saveBtn.onclick = () => {
        // Validation
        if (conditionSelect.value === 'specific' && (amountInput.value === '' || parseInt(amountInput.value) < 1)) {
            alert("Please enter a valid positive integer level.");
            return;
        }

        const newTrigger = {
            rewardVal: sliderOptionsSelect.value,
            rewardText: sliderOptionsSelect.options[sliderOptionsSelect.selectedIndex].text,
            targetKey: targetSelect.value,
            condition: conditionSelect.value,
            amount: conditionSelect.value === 'specific' ? parseInt(amountInput.value) : null,
            recurse: recurseCheck.checked
        };

        saveToData(actionVar, newTrigger);

        // Close form
        closeForm(actionVar);
    };
    row3.append(saveBtn);

    // Cancel Button
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.marginLeft = "5px";
    cancelBtn.onclick = () => closeForm(actionVar);
    row3.append(cancelBtn);

    wrapper.append(row1, row2, row3);
    return wrapper;
}

// --- 3. Helper Functions ---

function closeForm(actionVar) {
    const formContainer = document.getElementById(`${actionVar}_customTriggerForm`);
    formContainer.replaceChildren(); // Safely clears the form

    const btn = document.getElementById(`${actionVar}_addCustomTriggerButton`);
    if (btn) btn.style.display = ""; // Show the Add button again
}

function saveToData(actionVar, triggerData) {
    let actionObj = data.actions[actionVar];
    if (!actionObj.customTriggers) actionObj.customTriggers = [];

    actionObj.customTriggers.push(triggerData);
    registerListener(triggerData.targetKey, actionVar);

    //for each action mentioned, update
    rebuildTriggerInfo(triggerData.targetKey);

    // Rebuild the UI list immediately
    rebuildCustomTriggersUI(actionVar);
}

// --- 4. Rendering the Saved List ---

function rebuildCustomTriggersUI(actionVar) {
    const container = document.getElementById(`${actionVar}_customTriggerContainer`);

    // 1. Clear existing list safely
    container.replaceChildren();

    // 2. Get data
    let actionObj = data.actions[actionVar];
    if (!actionObj || !actionObj.customTriggers) return;

    // 3. Build UI for each
    actionObj.customTriggers.forEach((trigger, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = "custom-trigger-item"; // See CSS

        // Text Content
        const textDiv = document.createElement('div');
        const targetTitle = actionData[trigger.targetKey].title; // Lookup title

        let condText = trigger.condition === 'specific'
            ? `level ${trigger.amount}`
            : (trigger.condition === 'max' ? "level max" : "unlocked");

        textDiv.innerHTML = `Set upstream <b>${trigger.rewardText}</b> when <span style="font-weight:bold;cursor:pointer;" onclick="actionTitleClicked('${trigger.targetKey}')">${targetTitle}</span> is <b>${condText}</b> (Recurse: ${trigger.recurse ? "On" : "Off"})`;

        // Delete Button
        const delBtn = document.createElement('div');
        delBtn.textContent = "✖";
        delBtn.className = "trigger-delete";
        delBtn.onclick = () => {
            let toRebuildVar = actionObj.customTriggers[index].targetKey

            actionObj.customTriggers.splice(index, 1);

            unregisterListener(toRebuildVar, actionVar);
            rebuildTriggerInfo(toRebuildVar)
            rebuildCustomTriggersUI(actionVar);
        };

        itemDiv.append(textDiv, delBtn);
        container.append(itemDiv);
    });
}


function rebuildTriggerInfo(actionVar) {
    const triggerInfoContainer = document.getElementById(`${actionVar}_triggerInfoContainer`);
    if (!triggerInfoContainer) return;

    // 1. Clear container safely
    triggerInfoContainer.replaceChildren();

    // 2. Containers for the results
    const revealSources = [];
    const maxLevelSources = [];
    const customTriggerSources = [];

    // 3. Scan ALL actions to see if they target THIS actionVar
    for (const sourceKey in actionData) {

        // --- Check Static Triggers (actionData) ---
        const dataObj = actionData[sourceKey];
        if (dataObj.actionTriggers) {
            dataObj.actionTriggers.forEach(trigger => {
                // Format: [condition, type, target, amount]
                // We check if trigger[2] (the target) matches our current actionVar
                if (trigger[2] === actionVar) {
                    const type = trigger[1];
                    if (type === 'reveal' || type === 'unlock') {
                        revealSources.push(sourceKey);
                    } else if (type === 'addMaxLevels') {
                        maxLevelSources.push(sourceKey);
                    }
                }
            });
        }

        // --- Check Dynamic Triggers (data.actions) ---
        // These are the custom triggers added by the user
        const actionObj = data.actions[sourceKey];
        if (actionObj && actionObj.customTriggers) {
            actionObj.customTriggers.forEach(customTrigger => {
                if (customTrigger.targetKey === actionVar) {
                    // Prevent duplicates if multiple triggers exist on same action
                    if (!customTriggerSources.includes(sourceKey)) {
                        customTriggerSources.push(sourceKey);
                    }
                }
            });
        }
    }

    // 4. Build the UI
    // If no triggers exist at all, we might want to hide the container or leave empty
    if (revealSources.length === 0 && maxLevelSources.length === 0 && customTriggerSources.length === 0) {
        return;
    }

    const infoWrapper = document.createElement('div');
    infoWrapper.className = "trigger-info-box";

    const divider = document.createElement('div');
    divider.className = "menuSeparator"
    infoWrapper.appendChild(divider);

    const header = document.createElement('div');
    header.textContent = "Action Trigger Info:";
    header.style.fontWeight = "bold";
    header.style.marginBottom = "5px";
    infoWrapper.appendChild(header);

    // Helper to create the list of links
    const createLinkList = (sourceKeys, prefixText) => {
        const lineDiv = document.createElement('div');
        lineDiv.className = "trigger-info-line";

        const prefix = document.createElement('span');
        prefix.textContent = prefixText + " ";
        lineDiv.appendChild(prefix);

        sourceKeys.forEach((key, index) => {
            const link = document.createElement('span');
            link.className = "action-link";
            link.textContent = actionData[key].title;
            link.onclick = () => actionTitleClicked(key);

            lineDiv.appendChild(link);

            if (index < sourceKeys.length - 1) {
                lineDiv.append(document.createTextNode(", "));
            }
        });

        return lineDiv;
    };

    // Append sections if data exists
    if (revealSources.length > 0) {
        infoWrapper.appendChild(createLinkList(revealSources, "This action is revealed by"));
    }

    if (maxLevelSources.length > 0) {
        infoWrapper.appendChild(createLinkList(maxLevelSources, "This action's max level is increased by"));
    }

    if (customTriggerSources.length > 0) {
        // For custom triggers, the prompt requested a specific format with a list below
        const div = document.createElement('div');
        div.className = "trigger-info-line";
        div.style.marginTop = "5px";
        div.textContent = "This action is used in custom automation triggers on the following actions:";
        infoWrapper.appendChild(div);

        const list = document.createElement('ul');
        list.style.margin = "5px 0 5px 20px";
        list.style.padding = "0";

        customTriggerSources.forEach(key => {
            const li = document.createElement('li');

            const link = document.createElement('span');
            link.className = "action-link";
            link.textContent = actionData[key].title;
            link.onclick = () => actionTitleClicked(key);

            li.appendChild(link);
            list.appendChild(li);
        });
        infoWrapper.appendChild(list);
    }

    triggerInfoContainer.appendChild(infoWrapper);
}
