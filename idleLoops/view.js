function View() {
    this.totalActionList = [];

    this.initalize = function() {
        statList.forEach((stat) => {
            this.updateStat(stat);
        });
        this.updateTime();
        this.updateGold();
        this.updateNextActions();
        this.updateCurrentActionsDivs();
        this.updateTotalTicks();
        this.updateAddAmount(1);
        this.createTownActions();
        this.updateProgressActions();
    };

    this.update = function() {
        statList.forEach((stat) => {
            if(!expEquals(stat) || !talentEquals(stat)) {
                this.updateStat(stat);
            }
        });
        this.updateTime();
    };

    this.updateStat = function(stat) {
        const levelPrc = getPrcToNextLevel(stat)+"%";
        document.getElementById("stat"+stat+"Level").innerHTML = getLevel(stat);
        document.getElementById("stat"+stat+"LevelBar").style.width = levelPrc;
        document.getElementById("stat"+stat+"LevelProgress").innerHTML = intToString(levelPrc, 2);
        const talentPrc = getPrcToNextTalent(stat)+"%";
        document.getElementById("stat"+stat+"Talent").innerHTML = getTalent(stat);
        document.getElementById("stat"+stat+"TalentBar").style.width = talentPrc;
        document.getElementById("stat"+stat+"TalentProgress").innerHTML = intToString(talentPrc, 2);
        this["update"+stat] = false;
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

    this.updateNextActions = function() {
        while (nextActionsDiv.firstChild) {
            nextActionsDiv.removeChild(nextActionsDiv.firstChild);
        }
        let actionsDiv = document.createElement("div");
        let totalDivText = "";

        actions.next.forEach((action, index) => {
            totalDivText +=
                "<div class='nextActionContainer small'>" +
                    "<div class='bold'>" + action.loops +"</div> x " +
                    "<img src='img/"+camelize(action.name)+".svg' class='smallIcon'>" +
                    "<div style='float:right'>"+
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
                "<div class='curActionContainer small'>" +
                    "<div class='curActionBar' id='action"+index+"Bar'></div>" +
                    "<div id='action"+index+"Loops'>"+ action.loopsLeft+"</div>(" + action.loops + ")" + " x " +
                    "<img src='img/"+camelize(action.name)+".svg' class='smallIcon'>" +
                    "</div>"+
                "</div>";
        });

        actionsDiv.innerHTML = totalDivText;
        curActionsDiv.appendChild(actionsDiv);
    };

    this.updateCurrentActionBar = function(index) {
        const action = actions.current[index];
        const div = document.getElementById("action"+index+"Bar");
        div.style.width = (100 * action.ticks / action.adjustedTicks) + "%";
        if(action.loopsLeft === 0) {
            div.style.width = "100%";
            div.style.backgroundColor = "#6d6d6d";
        }
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
            const theDiv = document.getElementById("container"+action.varName);
            if(!action.unlocked()) {
                addClassToDiv(theDiv, "locked");
            } else {
                removeClassFromDiv(theDiv, "locked");
            }
            if(!action.visible()) {
                addClassToDiv(theDiv, "hidden");
            } else {
                removeClassFromDiv(theDiv, "hidden");
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
    };

    this.createActionProgress = function(action) {
        const totalDivText =
        "<div class='townStatContainer showthat'>"+
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
        progressDiv.style.marginTop = "10px";
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
            "<div class='townStatContainer showthat'>" +
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