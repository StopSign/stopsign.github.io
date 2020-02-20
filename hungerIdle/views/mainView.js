let view = {
    initialize: function() {
        //create pictures of enemy types
        view.create.selectionBoxes();

    },
    updating: {
        update:function() {
            view.updating.updateCreature("char");
            view.updating.updateEnemy();

            if(isChanged("char.stats")) {
                document.getElementById("charStats").innerHTML = printStats(all.char);
            }

            view.updating.updateLog();
            if(isChanged())

            prevState = copyArray(all);
        },
        updateCreature:function(varName) {

            if(isChanged(varName+".healthCur") || isChanged(varName+".stats.healthMax")) {
                document.getElementById(varName+"HealthNum").innerHTML =  "Health: " + intToStringRound(all[varName].healthCur) + " / " + intToStringRound(all[varName].stats.healthMax);
                document.getElementById(varName+"HealthBar").style.width = all[varName].healthCur / all[varName].stats.healthMax * 100 + "%";
            }

            if(isChanged(varName+".attackSpeedCur") || isChanged(varName+".stats.attackSpeedMax")) {
                document.getElementById(varName+"AttackSpeedBar").style.width = all[varName].attackSpeedCur / all[varName].stats.attackSpeedMax * 100 + "%";
            }
            if(isChanged(varName+".stats.attackSpeedMax")) {
                if(all[varName].stats.attackSpeedMax > 4000) {
                    document.getElementById(varName+"Attack").style.width = "100%";
                } else {
                    document.getElementById(varName + "Attack").style.width = all[varName].stats.attackSpeedMax / 300 * 7.5 + "%"; //4000 ms = 300px;
                }
                document.getElementById(varName+"AttackSpeedNum").innerHTML = intToStringRound(all[varName].stats.attackSpeedMax);
            }
        },
        updateEnemy:function() {
            view.updating.updateCreature("enemy");

            if(isChanged("enemy.huntCur")) {
                document.getElementById("huntBar").style.width = all.enemy.huntCur / all.enemy.stats.huntMax * 100 + "%";
            }
            if(isChanged("enemy.stats.huntMax")) {
                document.getElementById("huntNum").innerHTML =  all.enemy.stats.huntMax;
            }

            if(isChanged("enemy.consumeCur")) {
                document.getElementById("consumeBar").style.width = all.enemy.consumeCur / all.enemy.stats.consumeMax * 100 + "%";
            }
            if(isChanged("enemy.stats.consumeMax")) {
                document.getElementById("consumeNum").innerHTML =  all.enemy.stats.consumeMax;
            }

        },
        updateLog:function() {
            if(isChanged("logs")) {
                let theStr = "";
                while(all.logs.length > 50) {
                    all.logs.shift();
                }
                for(let i = 0; i < all.logs.length; i++) {
                    let time = all.logs[i].timer === undefined ? "" : ("<div style='float:right'>"+all.logs[i].timer/1000+"s</div>");
                    theStr = all.logs[i].message + time  + "<br>" + theStr; //backwards
                }
                document.getElementById("log").innerHTML = theStr;
            }
        },
        updateSelectionBox:function(col, row) {
            if(!enemySelectionData[col] || !enemySelectionData[col][row]) {
                return;
            }
            let selectionBox = document.getElementById("selection"+col+"_"+row);
            selectionBox.innerHTML = view.create.selectionBox(enemySelectionData[col][row]);
            if(enemySelectionData[col][row].unlocked) {
                removeClassFromDiv(selectionBox, "disabled");
            } else {
                addClassToDiv(selectionBox, "disabled");
            }

        }
    },
    create: {
        log: function(num, type, text, timer) {
            let color = "black";
            return {
                message:"<div style='font-weight:bold;color:"+color+";'>" + num + "</div> " + text + "<div style='font-weight:bold;color:"+color+";'>"+type+"</div>",
                creature:"char",
                timer:timer
            };
        },
        damageLog: function(num, healthCur, type, victimName) {
            let color = "black";
            let middleText = victimName === "char" ? " health lost from " : " damage dealt with ";
            return {
                message: "<div style='font-weight:bold;color:"+color+";'>" + num + "</div>"+middleText+"<div style='font-weight:bold;color:"+color+";'>"+type+"</div>! " +
                    "<div style='font-weight:bold;color:#ca2615;'>"+intToStringRound(healthCur)+"</div> remaining health!",
                timer: combatTime,
                creature:"char"
            };
        },
        selectionBox: function(selectionData) {
            let str = "";

            str += "<div class='smallTitle'>" + selectionData.name + "</div>";

            return str;
        },
        selectionBoxes: function() {
            let str = "";
            for(let i = 0; i < enemySelectionData.length; i++) {
                str += "<div style='vertical-align: top'><div class='title' style='border-bottom:2px solid;'>" + enemyDataColNames[i] + "</div>";
                for(let j = 0; j < enemySelectionData[i].length; j++) {
                    str += "<div class='selectionDiv' id='selection"+i+"_"+j+"' onclick='selectFight("+i+", "+j+")'></div><br>";
                }
                str += "</div>";
            }
            document.getElementById("selectionBoxes").innerHTML = str;
            for(let i = 0; i < enemySelectionData.length; i++) {
                for(let j = 0; j < enemySelectionData[i].length; j++) {
                    view.updating.updateSelectionBox(i, j);
                }
            }
        },
        fightList: function() {
            let str = "";
            for(let i = 0; i < fightList.length; i++) {
                str += "<div style='width:20px'>"+(fightListIndex === i ? ">" : "")+"</div>";
                str += fightList[i].quantity + " x " + fightList[i].name + " (" + fightList[i].fought + ")";
                let timer = fightList[i].timer > 0 ? (fightList[i].timer/1000)+"s" : "";
                str += "<div style='float:right'>"+timer+" <div style='cursor:pointer' onclick='removeFight("+i+")'>X</div></div><br>"
            }

            document.getElementById("fightList").innerHTML = str;
        }
    }
};

function selectFight(col, row) {
    if(selectedFight.col >= 0) {
        document.getElementById("selection" + selectedFight.col + "_" + selectedFight.row).style.border = "";
        document.getElementById("selection" + selectedFight.col + "_" + selectedFight.row).style.padding = "2px";
    }
    selectedFight.col = col;
    selectedFight.row = row;
    let enemyData = createEnemy(col, row);
    document.getElementById("enemyStats").innerHTML = printStats(enemyData);
    document.getElementById("selection"+col+"_"+row).style.border = "1px solid yellow";
    document.getElementById("selection"+col+"_"+row).style.padding = "1px";
}

function isChanged(varName) {
    if(prevState === undefined) {
        return true;
    }
    varName = "." + varName;
    let nextVarPrev = prevState;
    let nextVarAll = all;
    while(varName.indexOf(".") >= 0) {
        varName = varName.substring(1);
        let nextVarName = varName;
        if(varName.indexOf(".") > 0) {
            nextVarName = varName.substring(0, varName.indexOf("."));
        }
        varName = varName.substring(varName.indexOf("."));
        if(nextVarPrev[nextVarName] === undefined) {
            return true;
        }
        nextVarPrev = nextVarPrev[nextVarName];
        nextVarAll = nextVarAll[nextVarName];
    }
    return JSON.stringify(nextVarPrev) !== JSON.stringify(nextVarAll);
}

function printStats(creature) {
    let str = "<div style='padding:5px;width:100%;'>";

    str += "<div class='title'>"+creature.name+"</div>";
    str += statStr(creature.stats.huntMax, "#7dad1f", "Hunt Time", "Time it takes to find an enemy of this type.");
    str += statStr(creature.stats.consumeMax, "#a86fc4", "Consume Time", "Time it takes to consume an enemy for stats.");
    str += "<br>";
    str += statStr(creature.stats.healthMax, "#ca2615", "Health", "The maximum health. Dead at 0.");
    str += statStr(creature.stats.healthRegen, "#ca2615", "Health Regen", "Regen this amount every second.");
    str += statStr(creature.stats.strength, "black", "Strength", "One strength is one damage.");
    str += statStr(creature.stats.attackSpeedMax, "#a86fc4", "Attack Speed Max", "Time it takes to deal damage. This is improved with Agility.");

    // attackSpeedMax:3000,
    //     huntMax: 3000,
    //     consumeMax: 4000,

    if(creature.reward) {
        str += "<br><div class='smallTitle'>Rewards</div>";
        for (let property in creature.reward) {
            if (creature.reward.hasOwnProperty(property)) {
                str += "<b>"+creature.reward[property]+"</b> " + camelToTitle(property) + "<br>";
            }
        }
    }

    str += "</div>";
    return str;
}

function statStr(value, color, label, tooltip) {
    if(value === undefined || value === 0) {
        return "";
    }
    return "<div class='showthat'><div style='color:"+color+"'>"+label+"</div>: <b>" + value + "</b>" +
    "<div class='showthisD'>"+tooltip+"</div></div><br>";
}

