function View() {

    this.initalize = function() {
        statList.forEach((stat) => {
            this.updateStat(stat);
        });
        this.updateTime();
        this.updateActions();
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
        document.getElementById("stat"+stat+"LevelProgress").innerHTML = intToString(levelPrc, 1);
        const talentPrc = getPrcToNextTalent(stat)+"%";
        document.getElementById("stat"+stat+"Talent").innerHTML = getTalent(stat);
        document.getElementById("stat"+stat+"TalentBar").style.width = talentPrc;
        document.getElementById("stat"+stat+"TalentProgress").innerHTML = intToString(talentPrc, 1);
        this["update"+stat] = false;
    };

    this.updateTime = function() {
        document.getElementById("timeBar").style.width = (100 - timer / timeNeeded * 100) + "%";
        document.getElementById("timer").innerHTML = intToString((timeNeeded - timer)/50, 2);

    };

    this.updateActions = function() {
        while (nextActionsDiv.firstChild) {
            nextActionsDiv.removeChild(nextActionsDiv.firstChild);
        }
        let actionsDiv = document.createElement("div");
        let totalDivText = "";

        actions.next.forEach((action, index) => {
            totalDivText +=
                "<div class='listedActionContainer small'>" +
                    action.loops + " x " +
                    action.name + "" +
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
}

const nextActionsDiv = document.getElementById("nextActionsList");


function expEquals(stat) {
    return prevState.stats[stat].exp === stats[stat].exp;
}

function talentEquals(stat) {
    return prevState.stats[stat].talent === stats[stat].talent;
}