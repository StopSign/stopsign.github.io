function View() {

    this.initalize = function() {
        statList.forEach((stat) => {
            this.updateStat(stat);
        });
        this.updateTime();
        this.updateNextActions();
        this.updateCurrentActionsDivs();
        this.updateExplored();
        this.updateTotalTicks();
        this.updateAddAmount();
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
        document.getElementById("timer").innerHTML = "<div class='bold'>Mana</div> "
            + intToString((timeNeeded - timer), 1) + " | " +
            intToString((timeNeeded - timer)/50, 2) + "s";

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
        div.style.width = (100 * action.ticks / action.ticksNeeded) + "%";
        if(action.loopsLeft === 0) {
            div.style.width = "100%";
            div.style.backgroundColor = "#6d6d6d";
        }
    };

    this.updateCurrentActionLoops = function(index) {
        document.getElementById("action"+index+"Loops").innerHTML = actions.current[index].loopsLeft;
    };

    this.updateExplored = function() {
        const town = towns[curTown];
        const explored = town.explored();
        const levelPrc = town.getPrcToNext() + "%";
        document.getElementById("explored").innerHTML = explored;
        document.getElementById("exploredExpBar").style.width = levelPrc;
        document.getElementById("exploredLevelProgress").innerHTML = intToString(levelPrc, 2);
        document.getElementById("exploredBar").style.width = explored + "%";
    };

    this.updatePots = function() {
        const town = towns[curTown];
        document.getElementById("totalPots").innerHTML = town.totalPots;
        document.getElementById("checkedPots").innerHTML = town.totalPots - town.checkedPots+"";
        document.getElementById("potsWithLoot").innerHTML = town.potsWithLoot+"";
        document.getElementById("potLoot").innerHTML = town.potLoot+"";
    };

    this.updateAddAmount = function() {
        document.getElementById("addAmount").innerHTML = actions.addAmount;
    }
}

const curActionsDiv = document.getElementById("curActionsList");
const nextActionsDiv = document.getElementById("nextActionsList");


function expEquals(stat) {
    return prevState.stats[stat].exp === stats[stat].exp;
}

function talentEquals(stat) {
    return prevState.stats[stat].talent === stats[stat].talent;
}