let view = {
    initialize: function() {

    },
    updating: {
        update:function() {
            view.updating.updateCreature("char");
            view.updating.updateCreature("enemy");


            view.updating.updateLog();

            prevState = copyArray(all);
        },
        updateCreature:function(varName) {
            if(changeR(varName, "healthCur") || changeR(varName, "healthMax")) {
                document.getElementById(varName+"HealthNum").innerHTML =  "Health: " + intToStringRound(all[varName].healthCur) + " / " + intToStringRound(all[varName].healthMax);
                document.getElementById(varName+"HealthBar").style.width = all[varName].healthCur / all[varName].healthMax * 100 + "%";
            }

            if(changeR(varName, "attackSpeedCur") || changeR(varName, "attackSpeedMax")) {
                document.getElementById(varName+"AttackSpeedBar").style.width = all[varName].attackSpeedCur / all[varName].attackSpeedMax * 100 + "%";
            }
            if(changeR(varName, "attackSpeedMax")) {
                if(all[varName].attackSpeedMax > 4000) {
                    document.getElementById(varName+"Attack").style.width = "100%";
                } else {
                    document.getElementById(varName + "Attack").style.width = all[varName].attackSpeedMax / 300 * 7.5 + "%"; //4000 ms = 300px;
                }
                document.getElementById(varName+"AttackSpeedNum").innerHTML = intToStringRound(all[varName].attackSpeedMax);
            }
        },
        updateLog:function() {

            if(changeA(all.logs)) {
                let theStr = "";
                while(all.logs.length > 20) {
                    all.logs.shift();
                }
                for(let i = 0; i < all.logs.length; i++) {
                    let time = all.logs[i].timer === undefined ? "" : ("<div style='float:right'>"+all.logs[i].timer/1000+"s</div>");
                    theStr = all.logs[i].message + time  + "<br>" + theStr; //backwards
                }
                document.getElementById("log").innerHTML = theStr;
            }

        }
    },
    create: {
        log: function(num, type, text) {
            let color = "black";
            return {
                message:"<div style='font-weight:bold;color:"+color+";'>" + num + "</div> " + text + "<div style='font-weight:bold;color:"+color+";'>"+type+"</div>",
                creature:"char"
            };
        },
        damageLog: function(num, healthCur, type, victimName) {
            let color = "black";
            let middleText = victimName === "char" ? " health lost from " : " damage dealt with ";
            return {
                message: "<div style='font-weight:bold;color:"+color+";'>" + num + "</div>"+middleText+"<div style='font-weight:bold;color:"+color+";'>"+type+"</div>! " +
                    "<div style='font-weight:bold;color:darkred;'>"+intToString(healthCur)+"</div> remaining health!",
                timer: combatTime,
                creature:"char"
            };
        }
    }
};

function changeA(firstVar, secondVar) {
    if(prevState === undefined) {
        return true;
    }
    if(secondVar === undefined && (prevState[firstVar] === undefined || JSON.stringify(prevState[firstVar]) !== JSON.stringify(all[firstVar]))) {
        // console.log(JSON.stringify(prevState[firstVar]), JSON.stringify(all[firstVar]));
        return true;
    }
    if(secondVar !== undefined && (prevState[firstVar][secondVar] === undefined || JSON.stringify(prevState[firstVar][secondVar]) !== JSON.stringify(all[firstVar][secondVar]))) {
        // console.log(prevState[firstVar][secondVar], all[firstVar][secondVar]);
        return true;
    }
    return false;
}

function changeR(firstVar, secondVar) {
    return change(firstVar, secondVar, true);
}

function change(firstVar, secondVar, isRounded) {
    if(prevState === undefined) {
        return true;
    }
    if(secondVar === undefined && (prevState[firstVar] === undefined || (isRounded ? intToStringRound(prevState[firstVar]) !== intToStringRound(all[firstVar]) : prevState[firstVar] !== all[firstVar]))) {
        return true;
    }
    if(prevState[firstVar][secondVar] === undefined || (isRounded ? intToStringRound(prevState[firstVar][secondVar]) !== intToStringRound(all[firstVar][secondVar]) : prevState[firstVar][secondVar] !== all[firstVar][secondVar])) {
        // console.log(prevState[firstVar][secondVar], all[firstVar][secondVar]);
        return true;
    }
    return false;
}