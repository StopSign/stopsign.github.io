let view = {
    initialize: function() {
        //create pictures of enemy types
        view.create.selectionBoxes();

    },
    updating: {
        update:function() {
            if(!prevState || Math.floor(prevState.saveTimer / 1000) !== Math.floor(saveTimer / 1000)) {
                document.getElementById("saveTimer").innerHTML = Math.floor(saveTimer / 1000) + "s";
            }
            view.updating.updateCreature("char");
            view.updating.updateEnemy();

            if(isChanged("char.stats")) {
                document.getElementById("charStats").innerHTML = printStats(all.char, true);
            }

            view.updating.updateLog();

            prevState = copyArray(all);
            prevState.saveTimer = saveTimer;
        },
        updateCreature:function(varName) {
            if(isChanged(varName+".healthCur") || isChanged(varName+".stats.healthMax")) {
                document.getElementById(varName+"HealthNum").innerHTML =  "Health: " + intToStringRound(all[varName].healthCur) + " / " + intToStringRound(all[varName].stats.healthMax);
                document.getElementById(varName+"HealthBar").style.width = all[varName].healthCur / all[varName].stats.healthMax * 100 + "%";
            }
            let realAttackSpeedMax = (all[varName].stats.attackSpeedMax * getAgiMult(all[varName]));
            if(isChanged(varName+".attackSpeedCur") || isChanged(varName+".stats.attackSpeedMax")) {
                document.getElementById(varName+"AttackSpeedBar").style.width = all[varName].attackSpeedCur / realAttackSpeedMax * 100 + "%";
            }
            if(isChanged(varName+".stats.attackSpeedMax") || isChanged(varName+".stats.agility")) {
                if(realAttackSpeedMax > 4000) {
                    document.getElementById(varName+"Attack").style.width = "100%";
                } else {
                    document.getElementById(varName + "Attack").style.width = realAttackSpeedMax / 300 * 7.5 + "%"; //4000 ms = 300px;
                }
                document.getElementById(varName+"AttackSpeedNum").innerHTML = intToStringRound(realAttackSpeedMax);
            }
        },
        updateEnemy:function() {
            view.updating.updateCreature("enemy");

            let realHuntMax = all.enemy.stats.huntMax * getHuntMult();
            if(isChanged("enemy.huntCur")) {
                document.getElementById("huntBar").style.width = all.enemy.huntCur / realHuntMax * 100 + "%";
            }
            if(isChanged("enemy.stats.huntMax") || isChanged("char.stats.hunt")) {
                document.getElementById("huntNum").innerHTML =  intToStringRound(realHuntMax);
            }

            let realConsumeMax = all.enemy.stats.consumeMax * getScavengeMult();
            if(isChanged("enemy.consumeCur")) {
                document.getElementById("consumeBar").style.width = all.enemy.consumeCur / realConsumeMax * 100 + "%";
            }
            if(isChanged("enemy.stats.consumeMax") || isChanged("char.stats.scavenge")) {
                document.getElementById("consumeNum").innerHTML =  intToStringRound(realConsumeMax);
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
                message: "<div style='font-weight:bold;color:"+color+";'>" + intToStringRound(num) + "</div>"+middleText+"<div style='font-weight:bold;color:"+color+";'>"+type+"</div>! " +
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
                str += "<div onclick='switchToFight("+i+")' style='cursor:pointer;'><div style='width:20px'>"+(fightListIndex === i ? ">" : "")+"</div>";
                str += fightList[i].quantity + " x " + fightList[i].name + " (" + fightList[i].fought + ")</div>";
                let timer = fightList[i].timer > 0 ? (fightList[i].timer/1000)+"s" : "";
                str += "<div style='float:right'>"+timer+" <div style='cursor:pointer' onclick='removeFight("+i+")'>X</div></div><br>"
            }

            document.getElementById("fightList").innerHTML = str;
        }
    }
};

function switchToFight(index) {
    fightListIndex = index;
    findMonster();
}

function selectFight(col, row) {
    if(selectedFight.col >= 0) {
        document.getElementById("selection" + selectedFight.col + "_" + selectedFight.row).style.border = "";
        document.getElementById("selection" + selectedFight.col + "_" + selectedFight.row).style.padding = "2px";
    }
    selectedFight.col = col;
    selectedFight.row = row;
    let enemyData = createEnemy(col, row);
    document.getElementById("enemyStats").innerHTML = printStats(enemyData, false);
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

function printStats(creature, isChar) {

    let str = "<div style='padding:5px;width:100%;'>";


    str += "<div class='title showthat'>"+creature.name+ (isChar ? "<div class='showthisD'>1% of stat gain goes to your base stats. When you die, you start with base stats.</div>" : "")+"</div>";
    str += statStr(creature, "huntMax", "#7dad1f", "Hunt Time", "Time it takes to find an enemy of this type. Reduced by the Hunt stat. After reduction: " + intToStringRound(creature.stats.huntMax * getHuntMult()));
    str += statStr(creature, "consumeMax", "#a86fc4", "Consume Time", "Time it takes to consume an enemy for stats. Reduced by the Scavenge stat. After reduction: " + intToStringRound(creature.stats.consumeMax * getScavengeMult()));
    str += "<br>";
    str += statStr(creature, "healthMax", "#ca2615", "Health", "The maximum health. Dead at 0.");
    str += statStr(creature, "healthRegen", "#ca2615", "Health Regen", "Regen this amount every second.");
    str += statStr(creature, "staminaMax", "black", "Stamina", "Used for certain abilities.");
    str += statStr(creature, "attackSpeedMax", "#a86fc4", "Attack Speed Max", "Time it takes to deal damage. Reduced by the Agility stat. After reduction: " + intToStringRound(creature.stats.attackSpeedMax * getAgiMult(creature)));
    str += statStr(creature, "strength", "black", "Strength", "One strength is one damage.");
    str += statStr(creature, "constitution", "black", "Constitution", "Adds to defense, which reduces physical damage taken. Reduction from constitution: " + intToStringRound(getConMult(creature)*100) + "%");
    str += statStr(creature, "agility", "black", "Agility", "Reduces time to attack. Current reduction: " + intToStringRound(getAgiMult(creature)*100) + "%");
    str += statStr(creature, "dexterity", "black", "Dexterity", "Deals extra damage when health is above 75%.");
    str += statStr(creature, "perception", "black", "Perception", "Increases defense when health is below or equal to 50%. Additional reduction: " + intToStringRound(getPerceptionMult(creature)*100) + "%");
    str += statStr(creature, "reflex", "black", "Reflex", "Increases defense when health is above 50%. Additional Reduction: " + intToStringRound(getReflexMult(creature)*100) + "%");
    str += statStr(creature, "reflect", "black", "Reflect", "When an opponent attacks, deals damage. Ignores flat reduction from Harden.");
    str += statStr(creature, "harden", "black", "Harden", "Reduces physical damage by a flat amount, after defense reduction.");
    str += statStr(creature, "scavenge", "black", "Scavenge", "Reduces time to consume an enemy. Current reduction: " + intToStringRound(getScavengeMult()*100) + "%");
    str += statStr(creature, "hunt", "black", "Hunt", "Reduces time to find a new enemy. Current reduction: " + intToStringRound(getHuntMult()*100) + "%");
    str += statStr(creature, "poison", "black", "Poison", "Deals damage the next 5 times the opponent attacks. Stacks, so 1 poison does 1x first attack, 2x second attack, etc.");
    str += statStr(creature, "recover", "black", "Recover", "Amount of health gained after a consume.");
    if(creature.poison) {
        str += "<br><div class='showthat'><div style='color:darkgreen'>Poison</div>: <b>" + creature.poison + "</b>" +
            "<div class='showthisD'>Taking damage per second untl you die</div></div><br>";
    }




    // attackSpeedMax:3000,
    //     huntMax: 3000,
    //     consumeMax: 4000,

    if(!isChar) {
        str += "<br><div class='smallTitle'>Rewards</div>";
        for (let property in creature.reward) {
            if (creature.reward.hasOwnProperty(property)) {
                str += "<b>"+creature.reward[property]+"</b> " + camelToTitle(property) + "<br>";
            }
        }

        str += "<br>You have consumed <b>" + enemySelectionData[selectedFight.col][selectedFight.row].consumed + " / 10</b><br>Each extra you consume causes you to take 1 poison dmg/s until you die.";
    }


    str += "</div>";
    return str;
}

function statStr(creature, valueName, color, label, tooltip) {
    let value = creature.stats[valueName];
    if(value === undefined || value === 0) {
        return "";
    }
    let baseVal = "";
    if(creature.base && creature.base[valueName]) {
        baseVal = "<br>You have a base value of " + creature.base[valueName];
    }
    return "<div class='showthat'><div style='color:"+color+"'>"+label+"</div>: <b>" + value + "</b>" +
    "<div class='showthisD'>"+tooltip+baseVal+"</div></div><br>";
}

