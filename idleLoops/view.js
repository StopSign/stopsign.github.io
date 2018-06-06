function View() {
    this.totalActionList = [];

    this.initalize = function() {
        statList.forEach((stat) => {
            this.updateStat(stat);
        });
        skillList.forEach((skill) => {
            this.updateSkill(skill);
        });
        this.updateTime();
        this.updateGold();
        this.updateNextActions();
        this.updateCurrentActionsDivs();
        this.updateTotalTicks();
        this.updateAddAmount(1);
        this.createTownActions();
        this.updateProgressActions();
        this.updateSoulstones();
    };

    this.update = function() {
        statList.forEach((stat) => {
            this.updateStat(stat);
        });
        this.updateTime();
        this.updateSoulstoneChance();
    };

    this.updateStat = function(stat) {
        const levelPrc = getPrcToNextLevel(stat)+"%";
        const talentPrc = getPrcToNextTalent(stat)+"%";
        if(!expEquals(stat) || !talentEquals(stat)) {
            document.getElementById("stat" + stat + "Level").innerHTML = getLevel(stat);
            document.getElementById("stat" + stat + "LevelBar").style.width = levelPrc;

            document.getElementById("stat" + stat + "Talent").innerHTML = getTalent(stat);
            document.getElementById("stat" + stat + "TalentBar").style.width = talentPrc;

            document.getElementById("stat" + stat + "SSBonus").innerHTML = (stats[stat].soulstone ? stats[stat].soulstone : 0) * 10+"%";
        }

        if(isVisible(document.getElementById("stat"+stat+"Tooltip")) || document.getElementById("stat" + stat + "LevelExp").innerHTML === "") {
            let expOfLevel = getExpOfLevel(getLevel(stat));
            document.getElementById("stat" + stat + "LevelExp").innerHTML = intToString(stats[stat].exp - expOfLevel, 1);
            document.getElementById("stat" + stat + "LevelExpNeeded").innerHTML = intToString(getExpOfLevel(getLevel(stat)+1) - expOfLevel+"", 1);
            document.getElementById("stat" + stat + "LevelProgress").innerHTML = intToString(levelPrc, 2);

            let expOfTalent = getExpOfLevel(getTalent(stat));
            document.getElementById("stat" + stat + "TalentExp").innerHTML = intToString(stats[stat].talent - expOfTalent, 1);
            document.getElementById("stat" + stat + "TalentExpNeeded").innerHTML = intToString(getExpOfLevel(getTalent(stat)+1) - expOfTalent+"", 1);
            document.getElementById("stat" + stat + "TalentProgress").innerHTML = intToString(talentPrc, 2);
        }
        this["update"+stat] = false;
    };

    this.updateSkill = function(skill) {
        const levelPrc = getPrcToNextSkillLevel(skill);
        document.getElementById("skill" + skill + "Level").innerHTML = getSkillLevel(skill);
        document.getElementById("skill" + skill + "LevelBar").style.width = levelPrc + "%";

        let expOfLevel = getExpOfLevel(getSkillLevel(skill));
        document.getElementById("skill" + skill + "LevelExp").innerHTML = intToString(skills[skill].exp - expOfLevel, 1);
        document.getElementById("skill" + skill + "LevelExpNeeded").innerHTML = intToString(getExpOfLevel(getSkillLevel(skill)+1) - expOfLevel+"", 1);
        document.getElementById("skill" + skill + "LevelProgress").innerHTML = intToString(levelPrc, 2);
    };

    this.updateTime = function() {
        document.getElementById("timeBar").style.width = (100 - timer / timeNeeded * 100) + "%";
        document.getElementById("timer").innerHTML =
            intToString((timeNeeded - timer), 1) + " | " +
            intToString((timeNeeded - timer)/50, 2) + "s";
    };
    this.updateGold = function() {
        document.getElementById("gold").innerHTML = gold;
    };
    this.updateReputation = function() {
        document.getElementById("reputation").innerHTML = reputation;
    };

    this.updateNextActions = function() {
        while (nextActionsDiv.firstChild) {
            nextActionsDiv.removeChild(nextActionsDiv.firstChild);
        }
        let actionsDiv = document.createElement("div");
        let totalDivText = "";

        actions.next.forEach((action, index) => {
            let capButton = "";
            if(hasCap(action.name)) {
                capButton = "<i onclick='actions.capAmount("+index+")' class='actionIcon fa fa-circle-thin'></i>";
            }
            totalDivText +=
                "<div class='nextActionContainer small'>" +
                    "<div class='bold'>" + action.loops +"</div> x " +
                    "<img src='img/"+camelize(action.name)+".svg' class='smallIcon'>" +
                    "<div style='float:right'>"+
                        capButton +
                        "<i onclick='actions.addLoop("+index+")' class='actionIcon fa fa-plus'></i>" +
                        "<i onclick='actions.removeLoop("+index+")' class='actionIcon fa fa-minus'></i>" +
                        "<i onclick='actions.split("+index+")' class='actionIcon fa fa-arrows-h'></i>" +
                        "<i onclick='actions.moveUp("+index+")' class='actionIcon fa fa-sort-up'></i>" +
                        "<i onclick='actions.moveDown("+index+")' class='actionIcon fa fa-sort-down'></i>" +
                        "<i onclick='actions.removeAction("+index+")' class='actionIcon fa fa-times'></i>" +
                    "</div>"+
                "</div>";
        });

        actionsDiv.innerHTML = totalDivText;
        nextActionsDiv.appendChild(actionsDiv);
    };

    this.updateTotalTicks = function() {
        document.getElementById("totalTicks").innerHTML = actions.completedTicks;
    };

    this.updateCurrentActionsDivs = function() {
        while (curActionsDiv.firstChild) {
            curActionsDiv.removeChild(curActionsDiv.firstChild);
        }
        let actionsDiv = document.createElement("div");
        let totalDivText = "";

        actions.current.forEach((action, index) => {
            totalDivText +=
                "<div class='curActionContainer small' onmouseover='view.mouseoverAction("+index+", true)' onmouseleave='view.mouseoverAction("+index+", false)'>" +
                    "<div class='curActionBar' id='action"+index+"Bar'></div>" +
                    "<div class='actionSelectedIndicator' id='action"+index+"Selected'></div>" +
                    "<div id='action"+index+"Loops' style='margin-left:3px'>"+ action.loopsLeft+"</div>(" + action.loops + ")" + " x " +
                    "<img src='img/"+camelize(action.name)+".svg' class='smallIcon'>" +
                "</div>";
        });

        actionsDiv.innerHTML = totalDivText;
        curActionsDiv.appendChild(actionsDiv);

        while (document.getElementById("actionTooltipContainer").firstChild) {
            document.getElementById("actionTooltipContainer").removeChild(document.getElementById("actionTooltipContainer").firstChild);
        }
        let tooltipDiv = document.createElement("div");
        totalDivText = "";

        actions.current.forEach((action, index) => {
            totalDivText +=
                "<div id='actionTooltip"+index+"' style='display:none;padding-left:10px;width:90%'>" +
                    "<div style='text-align:center;width:100%'>"+action.name+"</div><br><br>" +
                    "<div class='bold'>Mana Used</div> <div id='action"+index+"ManaUsed'>0</div><br>" +
                    "<div class='bold'>Remaining</div> <div id='action"+index+"Remaining'></div><br>" +
                    "<div id='action"+index+"ExpGain'></div>" +
                    "<div id='action"+index+"HasFailed' style='display:none'><div class='bold'>Failed Attempts</div> <div id='action"+index+"Failed'>0</div></div>" +
                "</div>";
        });

        tooltipDiv.style.width = "100%";
        tooltipDiv.innerHTML = totalDivText;
        document.getElementById("actionTooltipContainer").appendChild(tooltipDiv);
        this.mouseoverAction(0, false);
    };

    this.updateCurrentActionBar = function(index) {
        const action = actions.current[index];
        const div = document.getElementById("action"+index+"Bar");
        div.style.width = (100 * action.ticks / action.adjustedTicks) + "%";
        if(action.loopsFailed) {
            document.getElementById("action" + index + "Failed").innerHTML = action.loopsFailed + "";
            document.getElementById("action"+index+"HasFailed").style.display = "block";
            div.style.width = "100%";
            div.style.backgroundColor = "#ff0000";
            div.style.height = "30%";
            div.style.marginTop = "5px";
        } else if(action.loopsLeft === 0) {
            div.style.width = "100%";
            div.style.backgroundColor = "#6d6d6d";
        }

        document.getElementById("action"+index+"ManaUsed").innerHTML = action.manaUsed+"";
        document.getElementById("action"+index+"Remaining").innerHTML = (timeNeeded - timer)+"";
        let statExpGain = "";
        statList.forEach((statName) => {
            if(action["statExp"+statName]) {
                statExpGain += "<div class='bold'>"+statName+"</div> " + intToString(action["statExp"+statName], 2) + "<br>";
            }
        });
        document.getElementById("action"+index+"ExpGain").innerHTML = statExpGain;
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
        document.getElementById("action"+index+"Loops").innerHTML = actions.current[index].loopsLeft;
    };

    this.updateProgressActions = function() {
        const town = towns[curTown];
        town.progressVars.forEach((varName) => {
            let level = town.getLevel(varName);
            let levelPrc = town.getPrcToNext(varName) + "%";
            document.getElementById("prc"+varName).innerHTML = level;
            document.getElementById("expBar"+varName).style.width = levelPrc;
            document.getElementById("progress"+varName).innerHTML = intToString(levelPrc, 2);
            document.getElementById("bar"+varName).style.width = level + "%";
        });
        this.updateLockedHidden();
    };

    this.updateLockedHidden = function() {
        this.totalActionList.forEach((action) => {
            const actionDiv = document.getElementById("container"+action.varName);
            const infoDiv = document.getElementById("infoContainer"+action.varName);
            if(!action.unlocked()) {
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
            if(!action.visible()) {
                addClassToDiv(actionDiv, "hidden");
            } else {
                removeClassFromDiv(actionDiv, "hidden");
            }
        });
    };

    this.updateRegular = function(varName) {
        const town = towns[curTown];
        document.getElementById("total"+varName).innerHTML = town["total"+varName]+"";
        document.getElementById("checked"+varName).innerHTML = town["total"+varName] - town["checked"+varName]+"";
        document.getElementById("goodTemp"+varName).innerHTML = town["goodTemp"+varName]+"";
        document.getElementById("good"+varName).innerHTML = town["good"+varName]+"";
        // document.getElementById("lootFrom"+varName).innerHTML = town["lootFrom"+varName]+"";
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
        while (actionOptionsDiv.firstChild) {
            actionOptionsDiv.removeChild(actionOptionsDiv.firstChild);
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

        this.createTownAction(new SellGold());

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

        this.createTownAction(new GuidedTour());
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
    };

    this.createActionProgress = function(action) {
        const totalDivText =
        "<div class='townStatContainer showthat' id='infoContainer"+action.varName+"'>"+
            "<div class='bold townLabel'>"+action.infoName+" </div> <div id='prc"+action.varName+"'>5</div>%"+
            "<div class='thinProgressBarUpper'><div id='expBar"+action.varName+"' class='statBar townExpBar'></div></div>"+
            "<div class='thinProgressBarLower'><div id='bar"+action.varName+"' class='statBar townBar'></div></div>"+

            "<div class='showthis'>"+
                "You can find more stuff with higher %.<br>"+
                "<div class='bold'>Progress</div> <div id='progress"+action.varName+"'></div>%"+
            "</div>"+
        "</div>";
        let progressDiv = document.createElement("div");
        progressDiv.style.display = "block";
        progressDiv.innerHTML = totalDivText;
        townInfoDiv.appendChild(progressDiv);
    };

    this.createTownAction = function(action) {
        let actionStats = "";
        let keyNames = Object.keys(action.stats);
        keyNames.forEach((statName) => {
            actionStats += "<div class='bold'>" + statName + "</div> " + (action.stats[statName]*100)+"%<br>";
        });

        const totalDivText =
            "<div id='container"+action.varName+"' class='actionContainer showthat' onclick='addAction(\""+action.name+"\")'>" +
                action.name + "<br>" +
                "<img src='img/"+camelize(action.name)+".svg' class='superLargeIcon'><br>" +
                "<div class='showthis'>" +
                    action.tooltip + "<br>" +
                    actionStats +
                    "<div class='bold'>Mana Cost</div> "+action.manaCost+"<br>" +
                    "<div class='bold'>Exp Multiplier</div> "+(action.expMult*100)+"%<br>" +
                "</div>" +
            "</div>";

        let actionsDiv = document.createElement("div");
        actionsDiv.innerHTML = totalDivText;
        actionOptionsDiv.appendChild(actionsDiv);
        this.totalActionList.push(action);
    };

    this.createTownInfo = function(action) {
        let totalInfoText =
            "<div class='townInfoContainer showthat' id='infoContainer"+action.varName+"'>" +
                "<div class='bold townLabel'>"+action.infoName+"</div> " +
                "<div id='goodTemp"+action.varName+"'>0</div> <i class='fa fa-arrow-left'></i> " +
                "<div id='good"+action.varName+"'>0</div> <i class='fa fa-arrow-left'></i> " +
                "<div id='checked"+action.varName+"'>0</div>" +
                "<div class='showthis'>" +
                    action.infoText +
                "</div>" +
            "</div><br>";


        let infoDiv = document.createElement("div");
        infoDiv.style.display = "block";
        infoDiv.innerHTML = totalInfoText;
        townInfoDiv.appendChild(infoDiv);
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
                    "<div class='bold'>Completed</div> <div id='completed"+action.varName+"'></div>" +
                    "<div class='showthis'>"+completedTooltip+"</div>" +
                "</div><br>"+
                pbars +
            "</div>";

        let progressDiv = document.createElement("div");
        progressDiv.style.display = "block";
        progressDiv.innerHTML = totalDivText;
        townInfoDiv.appendChild(progressDiv);
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
    };

    this.updateMultiPartSegments = function(action) { //happens every tick
        let segment = 0;
        let curProgress = towns[0][action.varName];
        //update previous segments
        let loopCost = action.loopCost(segment);
        while(curProgress >= loopCost) {
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
        if(document.getElementById("progress"+segment+action.varName).innerHTML !== curProgress) {
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
        statList.forEach((stat) => {
            if(stats[stat].soulstone) {
                if (!isVisible(document.getElementById("ss" + stat + "Container"))) {
                    document.getElementById("ss" + stat + "Container").style.display = "inline-block";
                }
                document.getElementById("ss"+stat).innerHTML = stats[stat].soulstone;
            }
        });
    };

    this.updateMultiPart = function(action) {
        document.getElementById("multiPartName"+action.varName).innerHTML = action.getPartName();
        document.getElementById("completed"+action.varName).innerHTML = " " + towns[curTown]["total"+action.varName];
        for(let i = 0; i < action.segments; i++) {
            let expBar = document.getElementById("expBar"+i+action.varName);
            if(!expBar) {
                continue;
            }
            let mainStat = action.loopStats[(towns[0][action.varName+"LoopCounter"]+i) % action.loopStats.length];
            document.getElementById("mainStat"+i+action.varName).innerHTML = mainStat;
            addStatColors(expBar, mainStat);
            document.getElementById("segmentName"+i+action.varName).innerHTML = action.getSegmentName(towns[0][action.varName+"LoopCounter"]+i);
        }
    };
}

const curActionsDiv = document.getElementById("curActionsList");
const nextActionsDiv = document.getElementById("nextActionsList");
const actionOptionsDiv = document.getElementById("generatedActionOptions");
const townInfoDiv = document.getElementById("generatedTownInfo");


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