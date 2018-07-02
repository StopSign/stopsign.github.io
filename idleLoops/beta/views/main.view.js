'use strict';

function View() {
    this.totalActionList = [];

    this.initalize = function() {
        this.createStats();
        for(let i = 0; i < skillList.length; i++) {
            this.updateSkill(skillList[i]);
        }
        this.updateTime();
        this.updateGold();
        this.updateNextActions();
        this.updateCurrentActionsDivs();
        this.updateTotalTicks();
        this.updateAddAmount(1);
        this.createTownActions();
        this.updateProgressActions();
        this.updateSoulstones();
        this.updateSupplies();
        this.showTown(0);
        this.updateTrainingLimits();
        this.changeStatView();
        this.adjustGoldCosts();
        this.updateTeamNum();
    };

    this.statLocs = [{x:165, y:43}, {x:270, y:79}, {x:325, y:170}, {x:306, y:284}, {x:225, y:352}, {x:102, y:352}, {x:26, y:284}, {x:2, y:170}, {x:56, y:79}];
    this.createStats = function() {
        statGraph.init();
        let statContainer = document.getElementById("statContainer");
        while (statContainer.firstChild) {
            statContainer.removeChild(statContainer.firstChild);
        }
        let totalStatDiv = "";
        for(let i = 0; i < statList.length; i++) {
            let stat = statList[i];
            let loc = this.statLocs[i];
            totalStatDiv +=
                "<div class='statRadarContainer showthat' style='left:"+loc.x+"px;top:"+loc.y+"px;' onmouseover='view.showStat(\""+stat+"\")'>" +
                    "<div class='statLabelContainer'>" +
                        "<div class='medium bold' style='margin-left:18px'>"+_txt("stats>"+stat+">long_form")+"</div>" +
                        "<div style='color:#737373;' class='statNum'><div class='medium' id='stat"+stat+"ss'></div></div>" +
                        "<div class='statNum'><div class='medium' id='stat"+stat+"Talent'>0</div></div> " +
                        "<div class='medium statNum bold' id='stat"+stat+"Level'>0</div> " +
                    "</div>" +
                    "<div class='thinProgressBarUpper'><div class='statBar statLevelBar' id='stat"+stat+"LevelBar'></div></div>" +
                    "<div class='thinProgressBarLower'><div class='statBar statTalentBar' id='stat"+stat+"TalentBar'></div></div>" +
                    "<div class='showthis' id='stat"+stat+"Tooltip' style='width:225px;'>" +
                        "<div class='medium bold'>"+_txt("stats>"+stat+">long_form")+"</div><br>" +
                        _txt("stats>"+stat+">blurb") + "<br>" +
                        "<div class='medium bold'>"+_txt("stats>tooltip>level")+"</div> <div id='stat"+stat+"Level2'></div><br>" +
                        "<div class='medium bold'>"+_txt("stats>tooltip>level_exp")+"</div> <div id='stat"+stat+"LevelExp'></div>/<div id='stat"+stat+"LevelExpNeeded'></div> <div class='statTooltipPerc'>(<div id='stat"+stat+"LevelProgress'></div>%)</div><br>" +
                        "<div class='medium bold'>"+_txt("stats>tooltip>talent")+"</div> <div id='stat"+stat+"Talent2'></div><br>" +
                        "<div class='medium bold'>"+_txt("stats>tooltip>talent_exp")+"</div> <div id='stat"+stat+"TalentExp'></div>/<div id='stat"+stat+"TalentExpNeeded'></div> <div class='statTooltipPerc'>(<div id='stat"+stat+"TalentProgress'></div>%)</div><br>" +
                        "<div id='ss"+stat+"Container' class='ssContainer'>" +
                            "<div class='bold'>"+_txt("stats>tooltip>soulstone")+"</div> <div id='ss"+stat+"'></div><br>" +
                            "<div class='medium bold'>"+_txt("stats>tooltip>soulstone_multiplier")+"</div> x<div id='stat"+stat+"SSBonus'></div>" +
                        "</div>" +
                    "</div>" +
                "</div>"
        }

        statContainer.innerHTML = totalStatDiv;
    };

    this.update = function() {
        for(let i = 0; i < statList.length; i++) {
            let statName = statList[i];
            this.updateStat(statName);
        }
        this.updateTime();
        this.updateSoulstoneChance();
        for (let i=0; i < this.updateCurrentActionBarRequests.length; i++) {
            if (this.updateCurrentActionBarRequests[i]) {
                this.updateCurrentActionBarRequests[i] = false;
                this.updateCurrentActionBar(i);
            }
        }
        if (this.updateStatGraphNeeded) {
            statGraph.update();
        }
    };

    this.showStat = function(stat) {
        statShowing = stat;
        this.updateStat(stat);
    };

    this.updateStatGraphNeeded = false;

    this.updateStat = function(stat) {
        const levelPrc = getPrcToNextLevel(stat)+"%";
        const talentPrc = getPrcToNextTalent(stat)+"%";
        if(!expEquals(stat) || !talentEquals(stat) || statShowing === stat) {
            document.getElementById("stat" + stat + "LevelBar").style.width = levelPrc;
            document.getElementById("stat" + stat + "TalentBar").style.width = talentPrc;
            document.getElementById("stat" + stat + "Level").innerHTML = intToString(getLevel(stat), 1);
            document.getElementById("stat" + stat + "Talent").innerHTML = intToString(getTalent(stat), 1);
        }

        if(statShowing === stat || document.getElementById("stat" + stat + "LevelExp").innerHTML === "") {
            document.getElementById("stat" + stat + "Level2").innerHTML = getLevel(stat);
            let expOfLevel = getExpOfLevel(getLevel(stat));
            document.getElementById("stat" + stat + "LevelExp").innerHTML = intToString(stats[stat].exp - expOfLevel, 1);
            document.getElementById("stat" + stat + "LevelExpNeeded").innerHTML = intToString(getExpOfLevel(getLevel(stat)+1) - expOfLevel+"", 1);
            document.getElementById("stat" + stat + "LevelProgress").innerHTML = intToString(levelPrc, 2);

            document.getElementById("stat" + stat + "Talent2").innerHTML = getTalent(stat);
            let expOfTalent = getExpOfLevel(getTalent(stat));
            document.getElementById("stat" + stat + "TalentExp").innerHTML = intToString(stats[stat].talent - expOfTalent, 1);
            document.getElementById("stat" + stat + "TalentExpNeeded").innerHTML = intToString(getExpOfLevel(getTalent(stat)+1) - expOfTalent+"", 1);
            document.getElementById("stat" + stat + "TalentProgress").innerHTML = intToString(talentPrc, 2);
        }
        this["update"+stat] = false;
    };

    this.updateSkill = function(skill) {
        if(skills[skill].exp === 0) {
            document.getElementById("skill" + skill + "Container").style.display = "none";
            return;
        } else {
            document.getElementById("skill" + skill + "Container").style.display = "inline-block";
        }
        const levelPrc = getPrcToNextSkillLevel(skill);
        document.getElementById("skill" + skill + "Level").innerHTML = getSkillLevel(skill);
        document.getElementById("skill" + skill + "LevelBar").style.width = levelPrc + "%";

        let expOfLevel = getExpOfSkillLevel(getSkillLevel(skill));
        document.getElementById("skill" + skill + "LevelExp").innerHTML = intToString(skills[skill].exp - expOfLevel, 1);
        document.getElementById("skill" + skill + "LevelExpNeeded").innerHTML = intToString(getExpOfSkillLevel(getSkillLevel(skill)+1) - expOfLevel+"", 1);
        document.getElementById("skill" + skill + "LevelProgress").innerHTML = intToString(levelPrc, 2);
    };

    this.updateTime = function() {
        document.getElementById("timeBar").style.width = (100 - timer / timeNeeded * 100) + "%";
        document.getElementById("timer").innerHTML =
            intToString((timeNeeded - timer), 1) + " | " +
            intToString((timeNeeded - timer)/50, 2) + "s";
    };
    this.updateTotalTicks = function() {
        document.getElementById("totalTicks").innerHTML = actions.completedTicks;
    };
    this.updateGold = function() {
        document.getElementById("gold").innerHTML = gold;
    };
    this.updateGlasses = function() {
        document.getElementById("glassesDiv").style.display = glasses ? "inline-block" : "none";
    };
    this.updateReputation = function() {
        document.getElementById("reputation").innerHTML = reputation;
    };
    this.updateSupplies = function() {
        document.getElementById("suppliesDiv").style.display = supplies ? "inline-block" : "none";
        document.getElementById("suppliesCost").innerHTML = towns[0].suppliesCost+"";
        document.getElementById("supplies").innerHTML = supplies;
    };
    this.updateHerbs = function() {
        document.getElementById("herbsDiv").style.display = herbs ? "inline-block" : "none";
        document.getElementById("herbs").innerHTML = herbs;
    };
    this.updateHide = function() {
        document.getElementById("hideDiv").style.display = hide ? "inline-block" : "none";
        document.getElementById("hide").innerHTML = hide;
    };
    this.updatePotions = function() {
        document.getElementById("potionsDiv").style.display = potions ? "inline-block" : "none";
        document.getElementById("potions").innerHTML = potions;
    };
    this.updateTeamNum = function() {
        document.getElementById("teamNumDiv").style.display = teamNum ? "inline-block" : "none";
        document.getElementById("teamNum").innerHTML = teamNum;
        document.getElementById("teamCost").innerHTML = (teamNum+1)*200+"";
    };

    this.updateNextActions = function () {
        let count = 0;
        while (nextActionsDiv.firstChild) {
            if (document.getElementById("capButton" + count)) {
                document.getElementById("capButton" + count).removeAttribute("onclick");
            }
            if (document.getElementById("plusButton" + count)) { //not for journey
                document.getElementById("plusButton" + count).removeAttribute("onclick");
                document.getElementById("minusButton" + count).removeAttribute("onclick");
                document.getElementById("splitButton" + count).removeAttribute("onclick");
            }
            document.getElementById("upButton" + count).removeAttribute("onclick");
            document.getElementById("downButton" + count).removeAttribute("onclick");
            document.getElementById("removeButton" + count).removeAttribute("onclick");

            let dragAndDropDiv = document.getElementById("nextActionContainer"+count);
            dragAndDropDiv.removeAttribute("ondragover");
            dragAndDropDiv.removeAttribute("ondrop");
            dragAndDropDiv.removeAttribute("ondragstart");
            dragAndDropDiv.removeAttribute("ondragend");
            dragAndDropDiv.removeAttribute("ondragenter");
            dragAndDropDiv.removeAttribute("ondragleave");

            while (nextActionsDiv.firstChild.firstChild) {
                if (nextActionsDiv.firstChild.firstChild instanceof HTMLImageElement) {
                    nextActionsDiv.firstChild.firstChild.src = '';
                }
                nextActionsDiv.firstChild.removeChild(nextActionsDiv.firstChild.firstChild);
            }
            count++;
            nextActionsDiv.removeChild(nextActionsDiv.firstChild);
        }
        // let actionsDiv = document.createElement("div");
        let totalDivText = "";

        for (let i = 0; i < actions.next.length; i++) {
            let action = actions.next[i];
            let capButton = "";
            if (hasCap(action.name)) {
                let townNum = translateClassNames(action.name).townNum;
                capButton = "<i id='capButton" + i + "' onclick='capAmount(" + i + ", " + townNum + ")' class='actionIcon fa fa-circle-thin'></i>";
            }
            let isTravel = getTravelNum(action.name);
            totalDivText +=
                "<div id='nextActionContainer" + i + "' class='nextActionContainer small' ondragover='handleDragOver(event)' ondrop='handleDragDrop(event)' ondragstart='handleDragStart(event)' ondragend='draggedUndecorate(" + i + ")' ondragenter='dragOverDecorate(" + i +")' ondragleave='dragExitUndecorate("+i+")' draggable='true' data-index='"+i+"'>" +
                "<img src='img/" + camelize(action.name) + ".svg' class='smallIcon imageDragFix'> x " +
                "<div class='bold'>" + action.loops + "</div>" +
                "<div style='float:right'>" +
                capButton +
                (isTravel ? "" : "<i id='plusButton" + i + "' onclick='addLoop(" + i + ")' class='actionIcon fa fa-plus'></i>") +
                (isTravel ? "" : "<i id='minusButton" + i + "' onclick='removeLoop(" + i + ")' class='actionIcon fa fa-minus'></i>") +
                (isTravel ? "" : "<i id='splitButton" + i + "' onclick='split(" + i + ")' class='actionIcon fa fa-arrows-h'></i>") +
                "<i id='upButton" + i + "' onclick='moveUp(" + i + ")' class='actionIcon fa fa-sort-up'></i>" +
                "<i id='downButton" + i + "' onclick='moveDown(" + i + ")' class='actionIcon fa fa-sort-down'></i>" +
                "<i id='removeButton" + i + "' onclick='removeAction(" + i + ")' class='actionIcon fa fa-times'></i>" +
                "</div>" +
                "</div>";
        }

        nextActionsDiv.innerHTML = totalDivText;
    };

    this.updateCurrentActionsDivs = function() {
        let totalDivText = "";

        for(let i = 0; i < actions.current.length; i++) { //definite leak - need to remove listeners and image
            let action = actions.current[i];
            totalDivText +=
                "<div class='curActionContainer small' onmouseover='view.mouseoverAction("+i+", true)' onmouseleave='view.mouseoverAction("+i+", false)'>" +
                    "<div class='curActionBar' id='action"+i+"Bar'></div>" +
                    "<div class='actionSelectedIndicator' id='action"+i+"Selected'></div>" +
                    "<img src='img/"+camelize(action.name)+".svg' class='smallIcon'> x " +
                    "<div id='action"+i+"LoopsLeft' style='margin-left:3px'>"+ action.loopsLeft+"</div>(" + "<div id='action"+i+"Loops'>" + action.loops + "</div>" + ")" +
                "</div>";
        }

        curActionsDiv.innerHTML = totalDivText;

        totalDivText = "";

        for(let i = 0; i < actions.current.length; i++) {
            let action = actions.current[i];
            totalDivText +=
                "<div id='actionTooltip"+i+"' style='display:none;padding-left:10px;width:90%'>" +
                    "<div style='text-align:center;width:100%'>"+action.label+"</div><br><br>" +
                    "<div class='bold'>"+_txt("actions>current_action>mana_original")+"</div> <div id='action"+i+"ManaOrig'>0</div><br>" +
                    "<div class='bold'>"+_txt("actions>current_action>mana_used")+"</div> <div id='action"+i+"ManaUsed'>0</div><br>" +
                    "<div class='bold'>"+_txt("actions>current_action>mana_remaining")+"</div> <div id='action"+i+"Remaining'></div><br>" +
                    "<div class='bold'>"+_txt("actions>current_action>gold_remaining")+"</div> <div id='action"+i+"GoldRemaining'></div><br><br>" +
                    "<div id='action"+i+"ExpGain'></div>" +
                    "<div id='action"+i+"HasFailed' style='display:none'>" +
                        "<div class='bold'>"+_txt("actions>current_action>failed_attempts")+"</div> <div id='action"+i+"Failed'>0</div><br>" +
                        "<div class='bold'>"+_txt("actions>current_action>error")+"</div> <div id='action"+i+"Error'></div>" +
                    "</div>" +
                "</div>";
        }

        document.getElementById("actionTooltipContainer").innerHTML = totalDivText;
        this.mouseoverAction(0, false);
    };

    this.updateCurrentActionBarRequests = [];
    this.updateCurrentActionBarRequest = function f(index) {
        this.updateCurrentActionBarRequests[index] = true;
    };

    this.updateCurrentActionBar = function(index) {
        const action = actions.current[index];
        const div = document.getElementById("action"+index+"Bar");
        if(!div) {
            return;
        }
        div.style.width = (100 * action.ticks / action.adjustedTicks) + "%";
        if(action.loopsFailed) {
            document.getElementById("action" + index + "Failed").innerHTML = action.loopsFailed + "";
            document.getElementById("action" + index + "Error").innerHTML = action.errorMessage + "";
            document.getElementById("action"+index+"HasFailed").style.display = "block";
            div.style.width = "100%";
            div.style.backgroundColor = "#ff0000";
            div.style.height = "30%";
            div.style.marginTop = "5px";
        } else if(action.loopsLeft === 0) {
            div.style.width = "100%";
            div.style.backgroundColor = "#6d6d6d";
        }
        document.getElementById("action" + index + "ManaOrig").innerHTML = action.manaCost() * action.loops + "";
        document.getElementById("action" + index + "ManaUsed").innerHTML = action.manaUsed + "";
        document.getElementById("action"+index+"Remaining").innerHTML = (timeNeeded - timer)+"";
        document.getElementById("action"+index+"GoldRemaining").innerHTML = (gold)+"";
        let statExpGain = "";
        let expGainDiv = document.getElementById("action"+index+"ExpGain");
        while (expGainDiv.firstChild) {
            expGainDiv.removeChild(expGainDiv.firstChild);
        }
        for(let i = 0; i < statList.length; i++) {
            let statName = statList[i];
            if(action["statExp"+statName]) {
                statExpGain += "<div class='bold'>"+_txt("stats>"+statName+">short_form")+"</div> " + intToString(action["statExp"+statName], 2) + "<br>";
            }
        }
        expGainDiv.innerHTML = statExpGain;
    };

    this.mouseoverAction = function(index, isShowing) {
        const div = document.getElementById("action"+index+"Selected");
        if(div) {
            div.style.opacity = isShowing ? "1" : "0";
            document.getElementById("actionTooltip"+index).style.display = isShowing ? "inline-block" : "none";
        }
        nextActionsDiv.style.display = isShowing ? "none" : "inline-block";
        document.getElementById("actionTooltipContainer").style.display = isShowing ? "inline-block" : "none";
    };

    this.updateCurrentActionLoops = function(index) {
        document.getElementById("action" + index + "Loops").innerHTML = actions.current[index].loopsLeft;
        if(index === (actions.current.length - 1)) {
            document.getElementById("action" + index + "LoopsLeft").innerHTML = actions.current[index].loops;
        }
    };

    this.updateProgressActions = function() {
        for(let i = 0; i < towns.length; i++) {
            let town = towns[i];
            for(let j = 0; j < town.progressVars.length; j++) {
                let varName = towns[i].progressVars[j];
                let level = town.getLevel(varName);
                let levelPrc = town.getPrcToNext(varName) + "%";
                document.getElementById("prc"+varName).innerHTML = level;
                document.getElementById("expBar"+varName).style.width = levelPrc;
                document.getElementById("progress"+varName).innerHTML = intToString(levelPrc, 2);
                document.getElementById("bar"+varName).style.width = level + "%";
            }
        }
        this.updateLockedHidden();
    };

    this.updateLockedHidden = function() {
        for(let i = 0; i < this.totalActionList.length; i++) {
            let action = this.totalActionList[i];
            const actionDiv = document.getElementById("container"+action.varName);
            const infoDiv = document.getElementById("infoContainer"+action.varName);
            if(!action.unlocked() || (action.allowed && getNumOnList(action.name) >= action.allowed())) {
                addClassToDiv(actionDiv, "locked");
                if(infoDiv) {
                    addClassToDiv(infoDiv, "hidden");
                }
            } else {
                if(infoDiv) {
                    removeClassFromDiv(infoDiv, "hidden");
                }
                removeClassFromDiv(actionDiv, "locked");
            }
            if(action.unlocked() && infoDiv) {
                removeClassFromDiv(infoDiv, "hidden");
            }
            if(!action.visible()) {
                addClassToDiv(actionDiv, "hidden");
            } else {
                removeClassFromDiv(actionDiv, "hidden");
            }
        }
    };

    this.showTown = function(townNum) {
        if(townNum <= 0) {
            townNum = 0;
            document.getElementById("townViewLeft").style.visibility = "hidden";
        } else {
            document.getElementById("townViewLeft").style.visibility = "visible";
        }

        if(townNum >= maxTown) {
            townNum = maxTown;
            document.getElementById("townViewRight").style.visibility = "hidden";
        } else {
            document.getElementById("townViewRight").style.visibility = "visible";
        }
        for(let i = 0; i < actionOptionsTown.length; i++) {
            actionOptionsTown[i].style.display = "none";
            townInfos[i].style.display = "none";
        }
        actionOptionsTown[townNum].style.display = "block";
        townInfos[townNum].style.display = "block";
        document.getElementById("townName").innerHTML = _txt("towns>town"+townNum+">name");
        document.getElementById("townDesc").innerHTML = _txt("towns>town"+townNum+">desc");
        townShowing = townNum;
    };

    this.updateRegular = function(varName, index) {
        const town = towns[index];
        document.getElementById("total"+varName).innerHTML = town["total"+varName]+"";
        document.getElementById("checked"+varName).innerHTML = town["total"+varName] - town["checked"+varName]+"";
        document.getElementById("goodTemp"+varName).innerHTML = town["goodTemp"+varName]+"";
        document.getElementById("good"+varName).innerHTML = town["good"+varName]+"";
    };

    this.updateAddAmount = function(num) {
        for(let i = 0; i < 5; i++) {
            let elem = document.getElementById("amount" + i);
            if(elem) {
                addClassToDiv(elem, "unused");
            }
        }
        removeClassFromDiv(document.getElementById("amount"+num), "unused");
    };

    this.updateLoadout = function(num) {
        for(let i = 0; i < 5; i++) {
            let elem = document.getElementById("load" + i);
            if(elem) {
                addClassToDiv(elem, "unused");
            }
        }
        let elem = document.getElementById("load"+num);
        if(elem) {
            removeClassFromDiv(document.getElementById("load" + num), "unused");
        }
    };

    this.createTownActions = function() {
        while (actionOptionsTown[0].firstChild) {
            actionOptionsTown[0].removeChild(actionOptionsTown[0].firstChild);
        }
        while(townInfos[0].firstChild) {
            townInfos[0].removeChild(townInfos[0].firstChild);
        }
        let tempObj = new Wander();
        this.createTownAction(tempObj);
        this.createActionProgress(tempObj);
        tempObj = new SmashPots();
        this.createTownAction(tempObj);
        this.createTownInfo(tempObj);
        tempObj = new PickLocks();
        this.createTownAction(tempObj);
        this.createTownInfo(tempObj);

        this.createTownAction(new BuyGlasses());
        this.createTownAction(new BuyMana());

        tempObj = new MeetPeople();
        this.createTownAction(tempObj);
        this.createActionProgress(tempObj);

        this.createTownAction(new TrainStr());
        this.createTownAction(new TrainDex());
        this.createTownAction(new TrainSpd());

        tempObj = new ShortQuest();
        this.createTownAction(tempObj);
        this.createTownInfo(tempObj);

        tempObj = new Investigate();
        this.createTownAction(tempObj);
        this.createActionProgress(tempObj);

        tempObj = new LongQuest();
        this.createTownAction(tempObj);
        this.createTownInfo(tempObj);

        this.createTownAction(new ThrowParty());
        this.createTownAction(new WarriorLessons());
        this.createTownAction(new MageLessons());

        tempObj = new HealTheSick();
        this.createTownAction(tempObj);
        this.createMultiPartPBar(tempObj);

        tempObj = new FightMonsters();
        this.createTownAction(tempObj);
        this.createMultiPartPBar(tempObj);

        tempObj = new SmallDungeon();
        this.createTownAction(tempObj);
        this.createMultiPartPBar(tempObj);

        this.createTownAction(new BuySupplies());
        this.createTownAction(new Haggle());
        this.createTravelAction(new StartJourney());

        while (actionOptionsTown[1].firstChild) {
            actionOptionsTown[1].removeChild(actionOptionsTown[1].firstChild);
        }
        while(townInfos[1].firstChild) {
            townInfos[1].removeChild(townInfos[1].firstChild);
        }
        tempObj = new ExploreForest();
        this.createTownAction(tempObj);
        this.createActionProgress(tempObj);

        tempObj = new WildMana();
        this.createTownAction(tempObj);
        this.createTownInfo(tempObj);

        tempObj = new GatherHerbs();
        this.createTownAction(tempObj);
        this.createTownInfo(tempObj);

        tempObj = new Hunt();
        this.createTownAction(tempObj);
        this.createTownInfo(tempObj);

        this.createTownAction(new SitByWaterfall());

        tempObj = new OldShortcut();
        this.createTownAction(tempObj);
        this.createActionProgress(tempObj);

        tempObj = new TalkToHermit();
        this.createTownAction(tempObj);
        this.createActionProgress(tempObj);

        this.createTownAction(new PracticalMagic());
        this.createTownAction(new LearnAlchemy());
        this.createTownAction(new BrewPotions());

        this.createTravelAction(new ContinueOn());

        while (actionOptionsTown[2].firstChild) {
            actionOptionsTown[2].removeChild(actionOptionsTown[2].firstChild);
        }
        while(townInfos[2].firstChild) {
            townInfos[2].removeChild(townInfos[2].firstChild);
        }
        tempObj = new ExploreCity();
        this.createTownAction(tempObj);
        this.createActionProgress(tempObj);

        tempObj = new Gamble();
        this.createTownAction(tempObj);
        this.createTownInfo(tempObj);

        tempObj = new GetDrunk();
        this.createTownAction(tempObj);
        this.createActionProgress(tempObj);

        this.createTownAction(new PurchaseMana());
        this.createTownAction(new SellPotions());

        tempObj = new JoinAdvGuild();
        this.createTownAction(tempObj);
        this.createMultiPartPBar(tempObj);

        this.createTownAction(new GatherTeam());

        tempObj = new CraftingGuild();
        this.createTownAction(tempObj);
        this.createMultiPartPBar(tempObj);

        this.createTownAction(new ReadBooks());
    };

    this.createActionProgress = function(action) {
        const totalDivText =
        "<div class='townStatContainer showthat' id='infoContainer"+action.varName+"'>"+
            "<div class='bold townLabel'>"+action.labelDone+" </div> <div id='prc"+action.varName+"'>5</div>%"+
            "<div class='thinProgressBarUpper'><div id='expBar"+action.varName+"' class='statBar townExpBar'></div></div>"+
            "<div class='thinProgressBarLower'><div id='bar"+action.varName+"' class='statBar townBar'></div></div>"+

            "<div class='showthis'>"+
                _txt("actions>tooltip>higher_done_percent_benefic")+"<br>"+
                "<div class='bold'>"+_txt("actions>tooltip>progress_label")+"</div> <div id='progress"+action.varName+"'></div>%"+
            "</div>"+
        "</div>";
        let progressDiv = document.createElement("div");
        progressDiv.style.display = "block";
        progressDiv.innerHTML = totalDivText;
        townInfos[action.townNum].appendChild(progressDiv);
    };

    this.createTownAction = function(action) {
        let actionStats = "";
        let keyNames = Object.keys(action.stats);
        for(let i = 0; i < keyNames.length; i++) {
            let statName = keyNames[i];
            let statLabel = _txt("stats>"+statName+">short_form");
            actionStats += "<div class='bold'>" + statLabel + "</div> " + (action.stats[statName]*100)+"%<br>";
        }
        let extraImage = "";
        if(action.affectedBy) {
            for(let i = 0; i < action.affectedBy.length; i++) {
                extraImage += "<img src='img/"+camelize(action.affectedBy[i])+".svg' class='smallIcon' style='position:absolute;margin-top:17px;margin-left:2px;'>";
            }
        }
        const totalDivText =
            "<div id='container"+action.varName+"' class='actionContainer showthat' onclick='addActionToList(\""+action.name+"\", "+action.townNum+")'>" +
                action.label + "<br>" +
                "<div style='position:relative'>" +
                    "<img src='img/"+camelize(action.name)+".svg' class='superLargeIcon'>" +
                    extraImage +
                "</div>" +
                "<div class='showthis'>" +
                    action.tooltip + "<span id='goldCost"+action.varName+"'></span>" +
                    ((typeof(action.tooltip2) === "string") ? action.tooltip2 : "")+"<br>"+
                    actionStats +
                    "<div class='bold'>"+_txt("actions>tooltip>mana_cost")+"</div> <div id='manaCost"+action.varName+"'>"+action.manaCost()+"</div><br>" +
                    "<div class='bold'>"+_txt("actions>tooltip>exp_multiplier")+"</div> "+(action.expMult*100)+"%<br>" +
                "</div>" +
            "</div>";

        let actionsDiv = document.createElement("div");
        actionsDiv.innerHTML = totalDivText;
        actionOptionsTown[action.townNum].appendChild(actionsDiv);
        towns[action.townNum].totalActionList.push(action);
        this.totalActionList.push(action);
    };

    this.createTravelAction = function(action) {
        let actionStats = "";
        let keyNames = Object.keys(action.stats);
        for(let i = 0; i < keyNames.length; i++) {
            let statName = keyNames[i];
            actionStats += "<div class='bold'>" + statName + "</div> " + (action.stats[statName]*100)+"%<br>";
        }

        const totalDivText =
            "<div id='container"+action.varName+"' class='travelContainer showthat' onclick='addActionToList(\""+action.name+"\", "+action.townNum+", true)'>" +
            action.label + "<br>" +
            "<img src='img/"+camelize(action.name)+".svg' class='superLargeIcon'><br>" +
            "<div class='showthis'>" +
            action.tooltip + "<br>" +
            actionStats +
            "<div class='bold'>"+_txt("actions>tooltip>mana_cost")+"</div> <div id='manaCost"+action.varName+"'>"+action.manaCost()+"</div><br>" +
            "<div class='bold'>"+_txt("actions>tooltip>exp_multiplier")+"</div> "+(action.expMult*100)+"%<br>" +
            "</div>" +
            "</div>";

        let actionsDiv = document.createElement("div");
        actionsDiv.innerHTML = totalDivText;
        actionsDiv.style.width = "100%";
        actionOptionsTown[action.townNum].appendChild(actionsDiv);
        towns[action.townNum].totalActionList.push(action);
        this.totalActionList.push(action);
    };

    this.adjustManaCost = function(actionName) {
        let action = translateClassNames(actionName);
        document.getElementById("manaCost"+action.varName).innerHTML = action.manaCost();
    };

    this.adjustGoldCost = function(varName, amount) {
        document.getElementById("goldCost"+varName).innerHTML = amount;
    };
    this.adjustGoldCosts = function() {
        this.adjustGoldCost("Locks", goldCostLocks());
        this.adjustGoldCost("SQuests", goldCostSQuests());
        this.adjustGoldCost("LQuests", goldCostLQuests());
    };

    this.createTownInfo = function(action) {
        let totalInfoText =
            "<div class='townInfoContainer showthat' id='infoContainer"+action.varName+"'>" +
                "<div class='bold townLabel'>"+action.labelDone+"</div> " +
                "<div id='goodTemp"+action.varName+"'>0</div> <i class='fa fa-arrow-left'></i> " +
                "<div id='good"+action.varName+"'>0</div> <i class='fa fa-arrow-left'></i> " +
                "<div id='checked"+action.varName+"'>0</div>" +
                "<input type='checkbox' id='searchToggler"+action.varName+"' style='margin-left:10px;'>" +
                "<label for='searchToggler"+action.varName+"'> Lootable first</label>"+
                "<div class='showthis'>" +
                    action.infoText +
                "</div>" +
            "</div><br>";


        let infoDiv = document.createElement("div");
        infoDiv.style.display = "block";
        infoDiv.innerHTML = totalInfoText;
        townInfos[action.townNum].appendChild(infoDiv);
    };

    this.createMultiPartPBar = function(action) {
        let pbars = "";
        let width = "style='width:"+(90/action.segments)+"%'";
        for(let i = 0; i < action.segments; i++) {
            pbars += "<div class='thickProgressBar showthat' "+width+">" +
                        "<div id='expBar"+i+action.varName+"' class='segmentBar'></div>" +
                        "<div class='showthis' id='tooltip"+i+action.varName+"'>" +
                            "<div id='segmentName"+i+action.varName+"'></div><br>" +
                            "<div class='bold'>Main Stat</div> <div id='mainStat"+i+action.varName+"'></div><br>" +
                            "<div class='bold'>Progress</div> <div id='progress"+i+action.varName+"'></div> / <div id='progressNeeded"+i+action.varName+"'></div>" +
                        "</div>" +
                    "</div>";
        }
        let completedTooltip = action.completedTooltip ? action.completedTooltip : "";
        const totalDivText =
            "<div class='townStatContainer' style='text-align:center' id='infoContainer"+action.varName+"'>"+
                "<div class='bold townLabel' style='float:left' id='multiPartName"+action.varName+"'></div>"+
                "<div class='completedInfo showthat' id='completedContainer"+action.varName+"' onmouseover='view.updateSoulstoneChance()'>" +
                    "<div class='bold'>"+action.labelDone+"</div> <div id='completed"+action.varName+"'></div>" +
                    (completedTooltip === "" ? "" :"<div class='showthis'>"+completedTooltip+"</div>") + // to prevent an empty tooltip, was reported as bug on discord
                "</div><br>"+
                pbars +
            "</div>";

        let progressDiv = document.createElement("div");
        progressDiv.style.display = "block";
        progressDiv.innerHTML = totalDivText;
        townInfos[action.townNum].appendChild(progressDiv);
    };

    this.updateMultiPartActions = function() {
        let tempObj = new HealTheSick();
        this.updateMultiPart(tempObj);
        this.updateMultiPartSegments(tempObj);

        tempObj = new FightMonsters();
        this.updateMultiPart(tempObj);
        this.updateMultiPartSegments(tempObj);

        tempObj = new SmallDungeon();
        this.updateMultiPart(tempObj);
        this.updateMultiPartSegments(tempObj);

        tempObj = new JoinAdvGuild();
        this.updateMultiPart(tempObj);
        this.updateMultiPartSegments(tempObj);

        tempObj = new CraftingGuild();
        this.updateMultiPart(tempObj);
        this.updateMultiPartSegments(tempObj);
    };

    this.updateMultiPartSegments = function(action) { //happens every tick
        let segment = 0;
        let curProgress = towns[action.townNum][action.varName];
        //update previous segments
        let loopCost = action.loopCost(segment);
        while(curProgress >= loopCost && segment < action.segments) {
            document.getElementById("expBar"+segment+action.varName).style.width = "0";
            if(document.getElementById("progress"+segment+action.varName).innerHTML !== loopCost) {
                document.getElementById("progress"+segment+action.varName).innerHTML = intToStringRound(loopCost);
                document.getElementById("progressNeeded"+segment+action.varName).innerHTML = intToStringRound(loopCost);
            }

            curProgress -= loopCost;
            segment++;
            loopCost = action.loopCost(segment);
        }

        //update current segments
        if(document.getElementById("progress"+segment+action.varName) && document.getElementById("progress"+segment+action.varName).innerHTML !== curProgress) {
            document.getElementById("expBar"+segment+action.varName).style.width = (100-100*curProgress/loopCost)+"%";
            document.getElementById("progress"+segment+action.varName).innerHTML = intToStringRound(curProgress);
            document.getElementById("progressNeeded"+segment+action.varName).innerHTML = intToStringRound(loopCost);
        }

        //update later segments
        for(let i = segment+1; i < action.segments; i++) {
            document.getElementById("expBar"+i+action.varName).style.width = "100%";
            if(document.getElementById("progress"+i+action.varName).innerHTML !== "0") {
                document.getElementById("progress"+i+action.varName).innerHTML = "0";
            }
            document.getElementById("progressNeeded"+i+action.varName).innerHTML = intToStringRound(action.loopCost(i));
        }
    };

    this.updateSoulstoneChance = function() {
        if(isVisible(document.getElementById("completedContainerSDungeon"))) {
            document.getElementById('soulstoneChance').innerHTML = intToString(soulstoneChance * 100, 4);
        }
    };

    this.updateSoulstones = function() {
        for(let i = 0; i < statList.length; i++) {
            let statName = statList[i];
            if(stats[statName].soulstone) {
                document.getElementById("ss" + statName + "Container").style.display = "inline-block";
                document.getElementById("ss"+statName).innerHTML = stats[statName].soulstone;
                document.getElementById("stat" + statName + "SSBonus").innerHTML = intToString(stats[statName].soulstone ? calcSoulstoneMult(stats[statName].soulstone) : 0);
                document.getElementById("stat" + statName + "ss").innerHTML = intToString(stats[statName].soulstone, 1);
            } else {
                document.getElementById("ss" + statName + "Container").style.display = "none";
            }
        }
    };

    this.updateMultiPart = function(action) {
        document.getElementById("multiPartName"+action.varName).innerHTML = action.getPartName();
        document.getElementById("completed"+action.varName).innerHTML = " " + towns[action.townNum]["total"+action.varName];
        for(let i = 0; i < action.segments; i++) {
            let expBar = document.getElementById("expBar"+i+action.varName);
            if(!expBar) {
                continue;
            }
            let mainStat = action.loopStats[(towns[action.townNum][action.varName+"LoopCounter"]+i) % action.loopStats.length];
            document.getElementById("mainStat"+i+action.varName).innerHTML = _txt("stats>"+mainStat+">short_form");
            addStatColors(expBar, mainStat);
            document.getElementById("segmentName"+i+action.varName).innerHTML = action.getSegmentName(towns[action.townNum][action.varName+"LoopCounter"]+i);
        }
    };

    this.updateTrainingLimits = function() {
        for(let i = 0; i < statList.length; i++) {
            let trainingDiv = document.getElementById("trainingLimit"+statList[i]);
            if(trainingDiv) {
                trainingDiv.innerHTML = trainingLimits;
            }
        }
    };

    this.updateStory = function(num) { //when you mouseover Story
        document.getElementById("newStory").style.display = "none";
        if(num <= 0) {
            num = 0;
            document.getElementById("storyLeft").style.visibility = "hidden";
        } else {
            document.getElementById("storyLeft").style.visibility = "visible";
        }

        if(num >= storyMax) {
            num = storyMax;
            document.getElementById("storyRight").style.visibility = "hidden";
        } else {
            document.getElementById("storyRight").style.visibility = "visible";
        }
        for(let i = 0; i < 10; i++) {
            let storyDiv = document.getElementById("story"+i);
            if(storyDiv) {
                storyDiv.style.display = "none";
            }
        }
        storyShowing = num;
        document.getElementById("storyPage").innerHTML = storyShowing+1;
        document.getElementById("story"+num).style.display = "inline-block";
    };

    this.changeStatView = function() {
        let statContainer = document.getElementById("statContainer");
        if(document.getElementById("regularStats").checked) {
            document.getElementById("radarChart").style.display = "none";
            statContainer.style.position = "relative";
            for(let i = 0; i < statContainer.childNodes.length; i++) {
                let node = statContainer.childNodes[i];
                removeClassFromDiv(node, "statRadarContainer");
                addClassToDiv(node, "statRegularContainer");
                node.firstChild.style.display = "inline-block";
            }
            document.getElementById("statsColumn").style.width = "316px";
        } else {
            document.getElementById("radarChart").style.display = "inline-block";
            statContainer.style.position = "absolute";
            for(let i = 0; i < statContainer.childNodes.length; i++) {
                let node = statContainer.childNodes[i];
                addClassToDiv(node, "statRadarContainer");
                removeClassFromDiv(node, "statRegularContainer");
                node.firstChild.style.display = "none";
            }
            document.getElementById("statsColumn").style.width = "410px";
        }
    };
}

function unlockStory(num) {
    if(num > storyMax) {
        document.getElementById("newStory").style.display = "inline-block";
        storyMax = num;
    }
}

const curActionsDiv = document.getElementById("curActionsList");
const nextActionsDiv = document.getElementById("nextActionsList");
const actionOptionsTown = [];
const townInfos = [];
for(let i = 0; i < 3; i++) {
    actionOptionsTown[i] = document.getElementById("actionOptionsTown"+i);
    townInfos[i] = document.getElementById("townInfo"+i);
}

function expEquals(stat) {
    return prevState.stats[stat].exp === stats[stat].exp;
}

function talentEquals(stat) {
    return prevState.stats[stat].talent === stats[stat].talent;
}

function addStatColors(theDiv, stat) {
    if(stat === "Str") {
        theDiv.style.backgroundColor = "#d70037";
    } else if(stat === "Dex") {
        theDiv.style.backgroundColor = "#9fd430";
    } else if(stat === "Con") {
        theDiv.style.backgroundColor = "#b06f37";
    } else if(stat === "Per") {
        theDiv.style.backgroundColor = "#4ce2e9";
    } else if(stat === "Int") {
        theDiv.style.backgroundColor = "#2640b2";
    } else if(stat === "Cha") {
        theDiv.style.backgroundColor = "#ea9ce0";
    } else if(stat === "Spd") {
        theDiv.style.backgroundColor = "#f6e300";
    } else if(stat === "Luck") {
        theDiv.style.backgroundColor = "#3feb53";
    } else if(stat === "Soul") {
        theDiv.style.backgroundColor = "#737388";
    }
}

function dragOverDecorate(i) {
    if(document.getElementById("nextActionContainer" + i))
    document.getElementById("nextActionContainer" + i).classList.add("draggedOverAction");
}

function dragExitUndecorate(i) {
    if(document.getElementById("nextActionContainer" + i))
    document.getElementById("nextActionContainer" + i).classList.remove("draggedOverAction");
}

function draggedDecorate(i) {
    if(document.getElementById("nextActionContainer" + i))
    document.getElementById("nextActionContainer" + i).classList.add("draggedAction");
}

function draggedUndecorate(i) {
    if(document.getElementById("nextActionContainer" + i))
    document.getElementById("nextActionContainer" + i).classList.remove("draggedAction");
}
