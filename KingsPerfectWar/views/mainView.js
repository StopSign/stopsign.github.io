let view = {
    initialize: function() {
        view.clickable.initial.createIcons();
        view.clickable.initial.createEmpower();
        // view.clickable.initial.createWarMap();
        this.actionInfoDiv = {"king":document.getElementById("actionInfoDivKing"),
            "castle":document.getElementById("actionInfoDivCastle"),
            "units":document.getElementById("actionInfoDivUnits")};
        setMapArrowVisibility();
    },
    updating: {
        update: function () {
            //compare prevState to current
            //update the view of anything that's changed
            //order of these is important
            view.updating.updateLists();
            view.updating.updateResources();
            view.updating.updateCreated();
            view.updating.updateUnits();
            view.updating.updateTraveling();
            view.updating.updateKingTab();
            view.updating.updateShrineTab();
            view.updating.updateActionVisibility();

            view.updating.saveCurrentState();
        },
        saveCurrentState: function () {
            prevState.mana = mana;
            prevState.maxMana = maxMana;
            prevState.gold = gold;
            prevState.wood = wood;
            prevState.soulC = soulC;
            prevState.next = copyArray(actionsList.next);
            prevState.current = copyArray(actionsList.current);
            prevState.created = copyArray(created);
            prevState.levelData = copyArray(levelData);
            prevState.king = {};
            prevState.king.savedData = copyArray(king.savedData);
            prevState.king.curData = copyArray(king.curData);
            prevState.king.isHome = king.kingIsHome();
            prevState.levelSave = copyArray(levelSave[curLevel]);
            prevState.restartReason = restartReason;
        },
        updateResources: function() {
            if(prevState.mana !== mana || prevState.maxMana !== maxMana) {
                document.getElementById("manaBar").style.width = mana / maxMana * 100 + "%";
                document.getElementById("mana").innerHTML = intToString(mana, 1);
                document.getElementById("manaTooltip").innerHTML = "Mana.<br>Start with " + intToString(levelData.initial.mana, 1) + "<br>Current max is " + intToString(maxMana, 1);
            }
            if(prevState.gold !== gold) {
                let goldToAdd = castle.helpers.goldToAdd();
                document.getElementById("gold").innerHTML = intToString(gold, 1);
                document.getElementById("goldPerTick").innerHTML = intToString(goldToAdd, 1);
                document.getElementById("actualGold").innerHTML = round5(gold);
                document.getElementById("goldPerSecond").innerHTML = round5(goldToAdd/10);
            }
            if(prevState.wood !== wood) {
                let woodToAdd = castle.helpers.woodToAdd();
                document.getElementById("wood").innerHTML = intToString(wood, 1);
                document.getElementById("woodPerTick").innerHTML = intToString(woodToAdd, 1);
                document.getElementById("actualWood").innerHTML = round5(wood);
                document.getElementById("woodPerSecond").innerHTML = round5(woodToAdd/10);
            }
            if(prevState.soulC !== soulC) {
                document.getElementById("soulC").innerHTML = intToString(soulC, 1);
                document.getElementById("actualSoulC").innerHTML = round5(soulC);
            }
        },
        updateLists: function() {
            for (let i = 0; i < actionsList.nextNames.length; i++) {
                let name = actionsList.nextNames[i];
                if(!prevState.next || prevState.next[name].length !== actionsList.next[name].length) {
                    view.actionList.createNextList(i);
                    continue;
                }
                for (let j = 0; j < actionsList.next[name].length; j++) {
                    let prevAction = prevState.next[name][j];
                    let nextAction = actionsList.next[name][j];
                    if(!prevAction ||
                        prevAction.varName !== nextAction.varName) {
                        view.actionList.createNextList(i);
                        break;
                    } else if(prevAction.loops !== nextAction.loops) { //keeps tab order as you change loop numbers
                        document.getElementById("loopInput"+j+name).value = nextAction.loops;
                    }
                }
            }
            for (let i = 0; i < actionsList.nextNames.length; i++) {
                let name = actionsList.nextNames[i];
                if(!prevState.current || prevState.current[name].length !== actionsList.current[name].length) {
                    view.actionList.createCurrentList(i);
                    continue;
                }
                for (let j = 0; j < actionsList.current[name].length; j++) {
                    let prevAction = prevState.current[name][j];
                    let curAction = actionsList.current[name][j];
                    if(!prevAction ||
                        prevAction.varName !== curAction.varName ) {
                        view.actionList.createCurrentList(i);
                        break;
                    } else if(prevAction.manaUsed !== curAction.manaUsed
                        || prevAction.loopsLeft !== curAction.loopsLeft
                        || prevAction.loops !== curAction.loops) {
                        if(curAction.costseconds === 0 && curAction.loopsLeft === 0 && curAction.loops > 0) { //completed pause action
                            document.getElementById("action"+j+name+"Bar").style.width = "100%";
                        } else {
                            document.getElementById("action" + j + name + "Bar").style.width = (100 * curAction.manaUsed / (curAction.costseconds * 10)) + "%";
                        }
                        document.getElementById("action"+j+name+"LoopsLeft").innerHTML = curAction.loopsLeft;
                        document.getElementById("action"+j+name+"Loops").innerHTML = curAction.loops;
                        if(curList === i && currentlyHovering === j) { //only update last hovered live
                            view.updating.updateInfoDiv(name, j);
                        }
                    }
                }
                let currentAction = actionsList.current[name][actions.validActions[i]];
                let nextAction = actionsList.current[name][actions.validActions[i]+1];
                document.getElementById(name+"TabSleep").style.opacity = (!currentAction || currentAction.varName === "sleep" ||
                    (currentAction.loopsLeft === 0 && currentAction.manaUsed === currentAction.costseconds*10 && (!nextAction || nextAction.varName === "sleep"))) //pause when next list is empty condition
                    ? ".5" : "0";
            }
        },
        updateInfoDiv: function(name, i) {
            let curAction = actionsList.current[name][i];
            let costsDiv = "";
            costsDiv += "Mana Needed <div class='bold'>"+round1(curAction.costseconds*10 - curAction.manaUsed)+"</div><br>"+
                "In Seconds <div class='bold'>"+round1(curAction.costseconds - curAction.manaUsed/10)+"</div>s<br>";
            if(curAction.costgold) {
                costsDiv += "Next Gold Cost <div class='bold'>"+curAction.costgold+"</div><br>";
            }
            if(curAction.costwood) {
                costsDiv += "Next Wood Cost <div class='bold'>"+curAction.costwood+"</div><br>";
            }
            if(curAction.costmana) {
                costsDiv += "Additional Mana Cost <div class='bold'>"+curAction.costmana+"</div><br>";
            }
            if(curAction.failed) {
                costsDiv += "<br>Times Failed <div class='bold'>"+curAction.failed+"</div><br>" +
                    "Failure Reasons "+curAction.failedReason;
            }
            document.getElementById("action"+i+name+"Costs").innerHTML = costsDiv;
        },
        updateCreated: function() {
            for (let property in created) {
                if (!prevState.created || created.hasOwnProperty(property) &&
                    JSON.stringify(created[property]) !== JSON.stringify(prevState.created[property])) {
                    document.getElementById(property+"Num").innerHTML = created[property];
                    document.getElementById(property+"Num").style.opacity = created[property] === 0 ? "0" : "1";
                }
            }
            if(!prevState.created || prevState.created.shrine !== created.shrine
                ||  prevState.created.altar !== created.altar
                || prevState.created.ritual !== created.ritual) {
                document.getElementById("favor").innerHTML = shrine.helpers.calcFavor();
            }
        },
        updateUnits: function() {
            let prevLevelDatum = prevState.levelData;


            //initial
            if(!prevLevelDatum) {
                view.helpers.createMapTooltipString("Castle", levelData.home);
                for(let i = 0; i < levelData.dungeons.length; i++) {
                    view.helpers.createMapTooltipString("Dungeon "+(i+1), levelData.dungeons[i]);
                }
                for(let i = 0; i < levelData.hideouts.length; i++) {
                    view.helpers.createMapTooltipString("Hideout "+(i+1), levelData.hideouts[i]);
                }
                document.getElementById("mapName").innerHTML = "<b>"+levelData.name + "</b> (" + curLevel + ")";
                return;
            }

            //update castle
            if(prevLevelDatum.home.fightCounter !== levelData.home.fightCounter && document.getElementById("homeFightProgress")) {
                document.getElementById("homeFightProgress").style.width = levelData.home.fightCounter * 5 + "%";
            }
            if(JSON.stringify(prevLevelDatum.home.units) !== JSON.stringify(levelData.home.units)) {
                view.helpers.createMapTooltipString("Castle", levelData.home);
            }

            //update dungeons
            for(let i = 0; i < levelData.dungeons.length; i++) {
                let dungeon = levelData.dungeons[i];
                if(prevLevelDatum.dungeons[i].fightCounter !== dungeon.fightCounter && document.getElementById(dungeon.varName+"FightProgress")) {
                    document.getElementById(dungeon.varName+"FightProgress").style.width = dungeon.fightCounter * 5 + "%";
                }
                if(JSON.stringify(prevLevelDatum.dungeons[i].units) !== JSON.stringify(dungeon.units)) {
                    view.helpers.createMapTooltipString("Dungeon "+(i+1), dungeon);
                }
            }

            //update hideouts
            for(let i = 0; i < levelData.hideouts.length; i++) {
                let hideout = levelData.hideouts[i];
                if(hideout.creates && prevLevelDatum.hideouts[i].creates.counter !== hideout.creates.counter) {
                    document.getElementById(hideout.varName+"CreateCounter").innerHTML = hideout.creates.counter;
                }
                if(prevLevelDatum.hideouts[i].fightCounter !== hideout.fightCounter && document.getElementById(hideout.varName+"FightProgress")) {
                    document.getElementById(hideout.varName+"FightProgress").style.width = hideout.fightCounter * 5 + "%";
                }
                if(JSON.stringify(prevLevelDatum.hideouts[i].units) !== JSON.stringify(hideout.units)) {
                    view.helpers.createMapTooltipString("Hideout "+(i+1), hideout);
                }
            }

            //update map
            if(prevLevelDatum && prevLevelDatum.name !== levelData.name) {
                document.getElementById("mapName").innerHTML = "<b>"+levelData.name + "</b> (" + curLevel + ")";
            }
            if(prevLevelDatum && prevLevelDatum.restartReason !== restartReason) {
                document.getElementById("restartReason").innerHTML = restartReason;
            }
        },
        updateTraveling: function() {
            let prevLevelDatum = prevState.levelData;

            //update traveling objects
            for(let i = 0; i < levelData.traveling.length; i++) {
                let travelObj = levelData.traveling[i];
                let viewTravelObj;
                //get existing div if it exists
                for(let i = 0; i < viewTravelObjs.length; i++) {
                    if(travelObj.id === viewTravelObjs[i].id) {
                        viewTravelObj = viewTravelObjs[i];
                        break;
                    }
                }

                //create a new one otherwise
                if(!viewTravelObj) {
                    viewTravelObj = view.performance.getNewTravelObj();
                    viewTravelObj.inUse = true;
                    viewTravelObj.div.classList.add('showthat');
                    viewTravelObj.div.style.display = 'block';
                    viewTravelObj.id = travelObj.id;
                    viewTravelObj.div.id = "travelId" + viewTravelObj.id;
                }

                if(!prevLevelDatum.traveling[i] || JSON.stringify(prevLevelDatum.traveling[i].units) !== JSON.stringify(travelObj.units) || prevLevelDatum.traveling[i].target !== travelObj.target) {
                    let image = view.helpers.getTravelingImage(travelObj);
                    let unitString = view.helpers.getUnitString(travelObj.units);
                    viewTravelObj.div.innerHTML = image +
                        "<div class='showthis'><div class='mapTooltipRow'>"+unitString+"</div></div>";
                }

                let coords = view.helpers.translateToWarMapCoords(travelObj.coords);
                viewTravelObj.div.style.left = (coords.x+10) + "px";
                viewTravelObj.div.style.top = (coords.y+10) + "px";
            }

            //hide divs that don't have a matching ID but are inUse:true
            viewTravelObjs.forEach(function(viewTravelObj) {
                if(!viewTravelObj.inUse) {
                    return;
                }
                let found = false;
                levelData.traveling.forEach(function(travelObj) {
                    if(travelObj.id === viewTravelObj.id) {
                        found = true;
                    }
                });
                if(!found) {
                    viewTravelObj.inUse = false;
                    viewTravelObj.div.style.display = 'none';
                }
            });
        },
        updateKingTab: function() {
            let updateRapportGain = false;
            let noPrevKing = !(prevState.king && prevState.king.savedData && prevState.king.curData);
            if(noPrevKing || prevState.king.savedData.int !== king.savedData.int) {
                document.getElementById("int").innerHTML = round5(king.savedData.int);
            }
            if(noPrevKing || prevState.king.savedData.wis !== king.savedData.wis) {
                document.getElementById("wis").innerHTML = king.savedData.wis + "";
                document.getElementById("knowledgeRate").innerHTML = king.savedData.wis + "";
            }
            if(noPrevKing || prevState.king.savedData.cha !== king.savedData.cha) {
                document.getElementById("cha").innerHTML = king.savedData.cha + "";
                updateRapportGain = true;
            }
            if(noPrevKing || prevState.king.curData.rflxCur !== king.curData.rflxCur) {
                document.getElementById("rflxCur").innerHTML = intToString(king.curData.rflxCur,3);
            }
            if(noPrevKing || prevState.king.savedData.exp !== king.savedData.exp) {
                document.getElementById("kingLevel").innerHTML = king.getLevel();
                let expNeeded = king.getExpOfLevel(king.getLevel());
                document.getElementById("exp").innerHTML = "<b>"+king.savedData.exp+"</b> / <b>"+expNeeded+"</b> exp";
                let expOfPrev = king.getExpOfLevel(king.getLevel()-1);
                document.getElementById("expProgress").style.width = 100 * (king.savedData.exp - expOfPrev) / (expNeeded - expOfPrev) + "%";

                document.getElementById("rflxCap").innerHTML = king.savedData.rflxCap + "";
                document.getElementById("rflxGain").innerHTML = intToString((king.savedData.rflxCap - king.curData.rflxCur)/50, 3);
            }
            let kingIsHome = king.kingIsHome();
            if(noPrevKing || prevState.king.curData.aura !== king.curData.aura || prevState.king.isHome !== kingIsHome) {
                document.getElementById("directContainer").style.padding = "3px";
                document.getElementById("communeContainer").style.padding = "3px";
                document.getElementById("marketContainer").style.padding = "3px";

                let color = kingIsHome ? "rgba(255, 255, 0, 1)" : "rgba(255, 255, 0, .4)";
                let mutedColor = kingIsHome ? "rgba(200, 200, 0, 1)" : "rgba(200, 200, 0, .4)";
                let hidden = "rgba(255, 255, 0, 0)";
                document.getElementById("directContainer").style.border = "2px solid " + hidden;
                document.getElementById("communeContainer").style.border = "2px solid " + hidden;
                document.getElementById("marketContainer").style.border = "2px solid " + hidden;
                if(king.curData.aura === "gold") {
                    document.getElementById("marketContainer").style.border = "2px solid " + (curInfoBox === "market" ? mutedColor : color);
                } else if(king.curData.aura === "wood") {
                    document.getElementById("communeContainer").style.border = "2px solid " + (curInfoBox === "commune" ? mutedColor : color);
                } else if(king.curData.aura === "build") {
                    document.getElementById("directContainer").style.border = "2px solid " + (curInfoBox === "direct" ? mutedColor : color);
                }
            }

            let noPrevLevelSave = !(prevState.levelSave);
            if(noPrevLevelSave || prevState.levelSave.knowledgeCap !== levelSave[curLevel].knowledgeCap) {
                document.getElementById("knowledgeCap").innerHTML = levelSave[curLevel].knowledgeCap;
            }
            if(noPrevLevelSave || prevState.levelSave.secrets !== levelSave[curLevel].secrets) {
                document.getElementById("secrets").innerHTML = levelSave[curLevel].knowledgeCap;
            }
            if(noPrevLevelSave || prevState.levelSave.knowledge !== levelSave[curLevel].knowledge) {
                document.getElementById("knowledge").innerHTML = levelSave[curLevel].knowledge;
            }

            let noPrevLevelData = !(prevState.levelData && prevState.levelData.data);
            if(noPrevLevelData || prevState.levelData.data.person !== levelData.data.person) {
                document.getElementById("personNum").innerHTML = "<b>" + levelData.data.person + "</b> / <b>"+levelData.initial.people+"</b>";
            }
            if(noPrevLevelData || prevState.levelData.data.difficulty !== levelData.data.difficulty) {
                document.getElementById("difficulty").innerHTML = levelData.data.difficulty + "";
            }
            if(noPrevLevelData || prevState.levelData.data.rapport !== levelData.data.rapport) {
                let rapportNeeded = 10 * levelData.data.difficulty;
                if(king.savedData.cha < levelData.data.difficulty) {
                    rapportNeeded += Math.pow((levelData.data.difficulty - king.savedData.cha), 2)*5
                }
                document.getElementById("rapport").innerHTML = intToStringRound(levelData.data.rapport) + " / " + intToStringRound(rapportNeeded) + " rapport";
                document.getElementById("rapportProgress").style.width = (100 * levelData.data.rapport / rapportNeeded) + "%";
            }
            if(noPrevLevelData || prevState.levelData.initial.people !== levelData.initial.people) {
                document.getElementById("mapMaxPeople").innerHTML = levelData.initial.people + "";
                updateRapportGain = true;
            }
            if(updateRapportGain) {
                let rapportBonus = king.calcRapportBonus();
                let allDivs = "<div class='smallTitle'>Most People Met</div>";

                let allZero = true;
                for(let i = 0; i < levelSave[curLevel].highestPerson.length; i++) {
                    let highestPerson = levelSave[curLevel].highestPerson[i];
                    if(highestPerson.person === 0) {
                        continue;
                    }
                    allZero = false;
                    allDivs += "Met <b>" + highestPerson.person + "</b> people <b>" + highestPerson.amount + "</b> times<br>";
                }
                if(allZero) {
                    allDivs += "Nobody met before.<br>"
                }

                allDivs += "Current Bonus: <b>" + round((rapportBonus-1)*100) + "</b>%";
                document.getElementById("personHighest").innerHTML = allDivs;
                document.getElementById("rapportAdded").innerHTML = intToString(king.savedData.cha * rapportBonus);
            }

        },
        updateShrineTab: function() {
            let noPrevShrine = !prevState.levelData || !prevState.levelData.shrine;
            let baseFavorChanged = !prevState.created || prevState.created.shrine !== created.shrine
                ||  prevState.created.altar !== created.altar
                || prevState.created.ritual !== created.ritual;

            actionData.get.blessingActions().forEach(function (action) {
                let varName = action.varName;
                if(noPrevShrine || baseFavorChanged || prevState.levelData.shrine[varName+"Tribute"] !== levelData.shrine[varName+"Tribute"]) {
                    document.getElementById(varName + "TributeString").innerHTML = "<b>"+round1(levelData.shrine[varName+"Tribute"])+"</b> / <b>" + levelData.shrine[varName+"TributeNeeded"] + "</b> tribute";
                    document.getElementById(varName + "TributeBar").style.width = (100 * levelData.shrine[varName+"Tribute"] / levelData.shrine[varName+"TributeNeeded"])+"%";
                    document.getElementById(varName + "TributeGain").innerHTML = "+" + round1(shrine.helpers.calcFavor() * shrine.helpers.calcTributeBonus(varName));
                    document.getElementById(varName + "Num").innerHTML = created[varName];
                }
                if(noPrevShrine || JSON.stringify(prevState.levelSave.shrine[varName]) !== JSON.stringify(levelSave[curLevel].shrine[varName])) {
                    let allDivs = "<div class='smallTitle'>Most Blessings Received</div>";

                    let allZero = true;
                    for(let i = 0; i < levelSave[curLevel].shrine[varName].length; i++) {
                        let highestNum = levelSave[curLevel].shrine[varName][i];
                        if(highestNum.num === 0) {
                            continue;
                        }
                        allZero = false;
                        allDivs += "Received <b>" + highestNum.num + "</b> blessings <b>" + highestNum.amount + "</b> times<br>";
                    }
                    if(allZero) {
                        allDivs += "Blessing not yet received.<br>"
                    }
                    document.getElementById(varName+"BonusTooltip").innerHTML = allDivs;
                }
            });
        },
        updateActionVisibility: function() {
            for (let property in actionData.list) {
                if (actionData.list.hasOwnProperty(property)) {
                    let actionDatum = actionData.list[property];

                    actionDatum.forEach(function(action) {
                        if(action.unlocked && action.unlocked()) {
                            removeClassFromDiv(document.getElementById(action.varName + "Container"), "disabled");
                        }
                        if(action.visible && action.visible()) {
                            removeClassFromDiv(document.getElementById(action.varName + "Container"), "hidden");
                        }
                    })
                }
            }
        }
    },
    actionList: {
        createNextList: function(num) {
            view.performance.clearNextListeners(num);
            let name = actionsList.nextNames[num];
            let theDiv = document.getElementById(name + "NextActions");

            let totalDivText = "";

            let theList = actionsList.next[name];
            for (let i = 0; i < theList.length; i++) {
                let action = theList[i];
                let capButton = "";
                let image = view.helpers.getImage(action, num);
                totalDivText +=
                    "<div id='nextActionContainer" + i + name + "' class='nextActionContainer small' ondragover='handleDragOver(event)' ondrop='handleDragDrop(event, "+num+")' ondragstart='handleDragStart(event, \""+name+"\")' ondragend='draggedUndecorate(" + i + ", \""+name+"\")' ondragenter='dragOverDecorate(" + i +", \""+name+"\")' ondragleave='dragExitUndecorate("+i+", \""+name+"\")' draggable='true' data-index='"+i+"'>" +
                    image + " x " +
                    "<input id='loopInput" + i + name + "' type='text' class='listTextInput' value='"+action.loops+"' onchange='setLoop(" + i + ","+num+")' onclick='this.select();'>" +
                    "<div style='float:right;margin-top:4px;'>" +
                    capButton +
                    "<i id='plusButton" + i + name + "' onclick='addLoop(" + i + ","+num+")' class='actionIcon fa fa-plus'></i>" +
                    "<i id='minusButton" + i + name + "' onclick='removeLoop(" + i + ","+num+")' class='actionIcon fa fa-minus'></i>" +
                    "<i id='splitButton" + i + name + "' onclick='split(" + i + ","+num+")' class='actionIcon fa fa-arrows-h'></i>" +
                    "<i id='upButton" + i + name + "' onclick='moveUp(" + i + ","+num+")' class='actionIcon fa fa-sort-up'></i>" +
                    "<i id='downButton" + i + name + "' onclick='moveDown(" + i + ","+num+")' class='actionIcon fa fa-sort-down'></i>" +
                    "<i id='removeButton" + i + name + "' onclick='removeAction(" + i + ","+num+")' class='actionIcon fa fa-times'></i>" +
                    "</div>" +
                    "</div>";
            }

            theDiv.innerHTML = totalDivText;
        },
        createCurrentList: function(num) {
            let name = actionsList.nextNames[num];
            view.performance.clearCurrentListeners(name);
            let theDiv = document.getElementById(name + "CurActions");

            let totalDivText = "";

            let theList = actionsList.current[name];
            for(let i = 0; i < theList.length; i++) {
                let action = theList[i];
                let width = 100 * action.manaUsed / (action.costseconds * 10) + "%";
                let image = view.helpers.getImage(action, num);

                totalDivText +=
                    "<div class='curActionContainer small' id='curAction"+i+name+"' onmouseover='view.actionList.showInfoDiv("+i+", \""+name+"\", true)' onmouseleave='view.actionList.showInfoDiv("+i+", \""+name+"\",false)'>" +
                    "<div class='curActionBar' style='width:"+width+"' id='action"+i+name+"Bar'></div>" +
                    "<div class='actionSelectedIndicator' id='action"+i+name+"Selected'></div>" +
                    image + " x " +
                    "<div id='action"+i+name+"LoopsLeft' style='margin-left:3px'>"+ action.loopsLeft+"</div>(" + "<div id='action"+i+name+"Loops'>" + action.loops + "</div>" + ")" +
                    "</div>";
            }

            theDiv.innerHTML = totalDivText;

            totalDivText = "";

            for(let i = 0; i < theList.length; i++) {
                let action = theList[i];
                let backgroundColor = num === 0 ? "kingColorH" : (num === 1 ? "castleColorH" : "unitsColor");
                totalDivText +=
                    "<div class=\""+backgroundColor+"\" id='actionTooltip"+i+name+"' style='display:none;padding-left:10px;width:90%'>" +
                    "<div style='text-align:center;width:100%'>"+action.name+"</div><br><br>" +
                    "<div id='action"+i+name+"Costs'></div>" +
                    "</div>";
            }

            view.actionInfoDiv[name].innerHTML = totalDivText;
            view.actionList.showInfoDiv(0, name, false);
        },
        showInfoDiv: function(i, name, isHover) {
            const div = document.getElementById("action"+i+name+"Selected");
            currentlyHovering = i;
            if(div) {
                div.style.opacity = isHover ? "1" : "0";
                document.getElementById("actionTooltip"+i+name).style.display = isHover ? "inline-block" : "none";
                if(isHover) {
                    view.updating.updateInfoDiv(name, i);
                }
            }
            view.actionInfoDiv[name].style.display = isHover ? "inline-block" : "none";
        }
    },
    performance: {
        clearNextListeners: function(num) {
            let name = actionsList.nextNames[num];
            let theDiv = document.getElementById(name + "NextActions");

            let count = 0;
            while (theDiv.firstChild) {
                if (document.getElementById("capButton" + count + name)) {
                    document.getElementById("capButton" + count + name).removeAttribute("onclick");
                }
                document.getElementById("loopInput" + count + name).removeAttribute("onclick");
                document.getElementById("loopInput" + count + name).removeAttribute("onchange");
                document.getElementById("plusButton" + count + name).removeAttribute("onclick");
                document.getElementById("minusButton" + count + name).removeAttribute("onclick");
                document.getElementById("splitButton" + count + name).removeAttribute("onclick");
                document.getElementById("upButton" + count + name).removeAttribute("onclick");
                document.getElementById("downButton" + count + name).removeAttribute("onclick");
                document.getElementById("removeButton" + count + name).removeAttribute("onclick");

                let dragAndDropDiv = document.getElementById("nextActionContainer" + count + name);
                dragAndDropDiv.removeAttribute("ondragover");
                dragAndDropDiv.removeAttribute("ondrop");
                dragAndDropDiv.removeAttribute("ondragstart");
                dragAndDropDiv.removeAttribute("ondragend");
                dragAndDropDiv.removeAttribute("ondragenter");
                dragAndDropDiv.removeAttribute("ondragleave");

                while (theDiv.firstChild.firstChild) {
                    if (theDiv.firstChild.firstChild instanceof HTMLImageElement) {
                        theDiv.firstChild.firstChild.src = '';
                    }
                    theDiv.firstChild.removeChild(theDiv.firstChild.firstChild);
                }
                theDiv.removeChild(theDiv.firstChild);
                count++;
            }
        },
        clearCurrentListeners: function(name) {
            let theDiv = document.getElementById(name + "CurActions");

            let count = 0;
            while (theDiv.firstChild) {
                document.getElementById("curAction" + count + name).removeAttribute("onmouseover");
                document.getElementById("curAction" + count + name).removeAttribute("onmouseleave");

                theDiv.removeChild(theDiv.firstChild);
                count++;
            }
        },
        getNewTravelObj: function() {
            //get one that isn't being used from the pool
            for(let i = 0; i < viewTravelObjs.length; i++) {
                if(!viewTravelObjs[i].inUse) {
                    return viewTravelObjs[i];
                }
            }

            //create a new one
            let travelDiv = document.createElement("div");
            travelDiv.style.position = "absolute";
            let newTravelObj = {div:travelDiv};
            viewTravelObjs.push(newTravelObj);
            document.getElementById("warMapActions").appendChild(travelDiv);
            return newTravelObj;
        }
    },
    clickable: {
        initial: {
            createIcons: function() {
                let divText = { king:"", castle:"", other:"" };
                let infoText = "";

                for (let property in actionData.list) {
                    if (actionData.list.hasOwnProperty(property)) {
                        let actionDatum = actionData.list[property];

                        actionDatum.forEach(function(action) {
                            let costDesc = view.helpers.getCostsString(action.cost);
                            let desc = action.desc + "<br>" + costDesc;
                            if(action.max) {
                                desc += " Can receive bonus up to " + action.max + " times.";
                            }

                            let tributeOuter = !action.tribute ? "" :  '<div class="abs showthat" style="right:-10px;top:5px">' +
                                '<div class="bold hyperVisible small" id="'+action.varName+'TributeGain">1.00</div>' +
                                '<div class="showthisUp small" id="'+action.varName+'BonusTooltip" style="width:200px"></div>' +
                                '</div>';

                            divText[property] +=
                                '<div class="abs" style="left:'+action.xPos+'px;top:'+action.yPos+'px;">' +
                                    '<div id="'+action.varName+'Container" onclick="selectAction(\''+action.varName+'\', '+action.listNum+')" oncontextmenu="straightToAdd(\''+action.varName+'\', '+action.listNum+')" class="clickable abs showthat disabled hidden" style="left:0;top:0">' +
                                        '<img src="img/' + action.varName + '.svg" class="superLargeIcon imageDragFix">' +
                                        '<div id="'+action.varName+'Num" class="hyperVisible bold abs small" style="right:-3px;top:32px;"></div>' +
                                        tributeOuter +
                                    '</div>' +
                                '</div>';

                            let tributeInfo = !action.tribute ? "" :
                                '<div style="width:100%;height:17px;background-color:rgb(243,229,255);">' +
                                    '<div id="'+action.varName+'TributeBar" style="position:relative;left:0;top:0;width:20%;height:100%;background-color:rgb(216,185,232);"></div>' +
                                    '<div id="'+action.varName+'TributeString" class="abs" style="left:5px"></div>' +
                                '</div>';
                            let backgroundColor = action.listNum === 0 ? "kingColorH" : (action.listNum === 1 ? "castleColorH" : "extrasColorH");
                            infoText += '<div id="'+action.varName+'InfoBox" class="infoBox '+backgroundColor+'">' +
                                '<div class="smallTitle">'+action.name+'</div>' +
                                tributeInfo +
                                '<div class="small">'+desc+'</div>' +
                                '</div>';
                        });
                    }
                }

                for (let property in divText) {
                    if (divText.hasOwnProperty(property)) {
                        let container = document.getElementById(property + "ActionList");
                        container.innerHTML = divText[property];
                    }
                }

                let curInfoBox = document.getElementById("infoBoxList");
                curInfoBox.innerHTML = infoText;
            },
            createWarMap: function() {
                warMap.actions.createWarMapActions(levelData);
                let allDivs = "";
                let curInfoBox = document.getElementById("infoBoxList");

                warMap.bases.getAllBases().forEach(function(base) {
                    let coords = view.helpers.translateToWarMapCoords(base.coords);
                    let imageName = base.varName.split("_")[0];
                    let placeNum = base.varName.split("_")[1] ? '<div class="hyperVisible bold abs" style="top:27px;left:31px">' + ((base.varName.split("_")[1]-0)+1) + '</div>' : "";
                    allDivs +=
                        '<div style="position:absolute;left:'+coords.x+'px;top:'+(coords.y)+'px;">' +
                            '<div class="mapFriendlyHPBar abs" id="'+base.varName+'FriendlyHPBar" style="top:-10px"><div id="'+base.varName+'FriendlyHP"></div></div>' +
                            '<div class="mapEnemyHPBar abs" id="'+base.varName+'EnemyHPBar" style="top:-4px"><div id="'+base.varName+'EnemyHP"></div></div>' +
                            '<div id="'+base.varName+'Container" class="clickable" style="position:absolute;top:0;left:0" onclick="selectAction(\''+base.varName+'\', 2)" oncontextmenu="straightToAdd(\''+base.varName+'\', 2)">' +
                                '<img src="img/'+imageName+'.svg" class="superLargeIcon imageDragFix">' +
                            '</div>' +
                            (base.creates ? ('<div class="createCounter" style="position:absolute;left:-20px;top:43px;width:80px">' +
                                '<img src="img/enemy.svg" class="smallIcon imageDragFix">: <div id="'+base.varName+'CreateCounter">'+base.creates.counter+'</div>'+
                            '</div>') : "") +
                            placeNum +
                        '</div>';

                    curInfoBox.innerHTML += '<div id="'+base.varName+'InfoBox" class="infoBox unitsColorH" style="padding:5px 0">' +
                        '</div>';
                });

                document.getElementById("warMapActions").innerHTML = allDivs;
                //re-add divs created from traveling units
                viewTravelObjs.forEach(function(viewTravelObj) {
                    document.getElementById("warMapActions").appendChild(viewTravelObj.div);
                });
            },
            createEmpower: function() {
                let divText = "";

                actionData.list.castle.forEach(function(action) {
                    if(!action.createdWith) { //only unit actions
                        return;
                    }
                    let cost = castle.helpers.empowerCost(action.varName, 1);
                    let unitStats = warMap.units.getStatsOfUnit(action.varName, 1);

                    divText += "<div class='empowerOption'>" +
                            "<div class='clickable'>" +
                                '<img src="img/' + action.varName + '.svg" class="superLargeIcon imageDragFix">' +
                            "</div>" +
                            "<div class='medium bold' style='width:70px;text-align:center;vertical-align:top;margin-top:13px'>"+capitalizeFirst(action.varName)+"</div>" +
                            "<input id='"+action.varName+"EmpowerStage' onchange='changeEmpowerStage(\""+action.varName+"\")' type='number' min='1' value='1' class='small' step='1' style='margin-left:4px;text-align:center;vertical-align:top;margin-top:10px;width:30px;'>" +
                            "<div id='"+action.varName+"EmpowerBought' class='medium bold' style='width:55px;text-align:center;vertical-align:top;margin-top:13px'>0</div>" +
                            "<div id='"+action.varName+"EmpowerCost' class='medium bold' style='width:55px;text-align:center;vertical-align:top;margin-top:13px'>"+intToString(cost, 1)+"</div>" +
                            "<div id='"+action.varName+"EmpowerStats' class='medium bold' style='width:105px;text-align:center;vertical-align:top;margin-top:13px'><b>"+intToString(unitStats.atk, 1)+"</b>|<b>"+intToString(unitStats.hp, 1)+"</b></div>" +
                            "<div class='button' style='vertical-align:top;margin-top:13px;' onclick='buyEmpowerUnit(\""+action.varName+"\")'>Buy</div>" +
                        "</div>";

                });


                document.getElementById("empowerContainer").innerHTML = divText;
            }
        }
    },
    helpers: {
        createMapTooltipString: function(titleName, base) {
            let tooltipDiv = "<div class='mapTooltipRow'><div class='title'>"+titleName+"</div>"
                + "<div style='opacity:.7;position:absolute;top:0;right:2px'>(" + base.coords.x +", "+base.coords.y + ")</div>";
            let unitsByAllegience = warMap.bases.getUnitsByAllegiance(base);
            let totalHp = warMap.bases.getTotalHP(base);
            if(unitsByAllegience.friendly.length > 0) {
                tooltipDiv += "<div>Your Units</div><br>";
                tooltipDiv += view.helpers.getUnitString(unitsByAllegience.friendly);
            }
            if(unitsByAllegience.friendly.length > 0 && unitsByAllegience.enemy.length > 0) {
                tooltipDiv += "<div style='display:block;text-align:center;position:relative;'>" +
                    "Fight!"+
                    "<div style='position:absolute;background-color:rgba(255,0,0,0.3);height:100%;left:0;' id='"+base.varName+"FightProgress'></div>" +
                    "</div>"
            }
            if(unitsByAllegience.enemy.length > 0) {
                tooltipDiv += "<div>Enemy Units</div><br>";
                tooltipDiv += view.helpers.getUnitString(unitsByAllegience.enemy);
            }
            if(base.reward && base.reward.length > 0) {
                let repeatableRewards = [];
                let uniqueRewards = [];
                for(let i = 0; i < base.reward.length; i++) {
                    let nextReward = base.reward[i];
                    if(nextReward.unique !== undefined) {
                        uniqueRewards.push(nextReward);
                    } else {
                        repeatableRewards.push(nextReward);
                    }
                }

                let repeatableRewardsStr = "";
                if(repeatableRewards.length > 0) {
                    repeatableRewardsStr += "[";
                    for (let i = 0; i < repeatableRewards.length; i++) {
                        let nextReward = repeatableRewards[i];
                        repeatableRewardsStr += "<b>" + nextReward.amount + "</b> " + nextReward.type + ", ";
                    }
                    repeatableRewardsStr = repeatableRewardsStr.substr(0, repeatableRewardsStr.length - 2);
                }

                let uniqueRewardsStr = "";
                if(uniqueRewards.length > 0) {
                    uniqueRewardsStr += " a one-time reward of [";
                    for (let i = 0; i < uniqueRewards.length; i++) {
                        let nextReward = uniqueRewards[i];
                        uniqueRewardsStr += "<b>" + nextReward.amount + "</b> " + nextReward.type + ", ";
                    }
                    uniqueRewardsStr = uniqueRewardsStr.substr(0, uniqueRewardsStr.length - 2);
                }

                let uniqueCompleted = levelSave[curLevel].uniqueCleared;
                tooltipDiv += "Gain ";
                if(repeatableRewards.length > 0) {
                    tooltipDiv += repeatableRewardsStr;
                    tooltipDiv += "] when cleared. ";
                }
                if(repeatableRewards.length === 0 ) {
                    tooltipDiv += uniqueRewardsStr;
                    tooltipDiv += "] when cleared. " + (uniqueCompleted ? "<b>(Completed)</b>" : "");
                }

                if(repeatableRewards.length > 0 && uniqueRewards.length > 0) {
                    tooltipDiv += "In addition, gain ";
                    tooltipDiv += uniqueRewardsStr;
                    tooltipDiv += "] when cleared. " + (uniqueCompleted ? "<b>(Completed)</b>" : "");
                }
            }
            if(base.initialFriendlyHP && totalHp.friendly > 0) {
                document.getElementById(base.varName + "FriendlyHPBar").style.display = "block";
                document.getElementById(base.varName + "FriendlyHP").style.width = (100 * totalHp.friendly / base.initialFriendlyHP) + "%";
            } else {
                document.getElementById(base.varName + "FriendlyHPBar").style.display = "none";
            }
            if(base.initialEnemyHP && totalHp.enemy > 0) {
                document.getElementById(base.varName + "EnemyHPBar").style.display = "block";
                document.getElementById(base.varName + "EnemyHP").style.width = (100 * totalHp.enemy / base.initialEnemyHP) + "%";
            } else {
                document.getElementById(base.varName + "EnemyHPBar").style.display = "none";
            }
            tooltipDiv += "</div>"; //closing mapTooltipRow
            document.getElementById(base.varName + "InfoBox").innerHTML = tooltipDiv;
        },
        translateToWarMapCoords: function(coords) { //x,y 0-190,0-100, translated to x:10-550 and y:15-300
            return {x:10+(coords.x / 190 * 641), y:15+(coords.y / 100 * 335)};
        },
        getUnitString: function(unitList) {
            let total = { atk:0, hp:0, exp:0 };
            let tooltipDiv = "";
            unitList.forEach(function(unit) {
                let num = unit.amount;
                total.atk += unit.atk * num;
                total.hp += unit.hp * num;
                let exp = (unit.exp ? unit.exp * num : 0);
                total.exp += exp;
                tooltipDiv += "<div style='width:20px'><div class='bold'>" + num + "</div></div>" +
                    "<div style='width:80px'>" + capitalizeFirst(unit.varName) + "</div>" +
                    "<div style='width:70px'>Atk: <div class='bold'>"+ intToString(unit.atk, 2) + "</div></div>" +
                    "<div style='width:70px'>HP: <div class='bold'>"+ intToString(unit.hp, 2) + "</div></div>" +
                    (total.exp === 0 ? "" : "<div style='width:60px'>Exp: <div class='bold'>"+ exp + "</div></div>") +
                    "<br>";
            });
            tooltipDiv += "<div style='width:100px'>Total</div>" +
                "<div style='width:70px'>Atk: <div class='bold'>"+ intToString(total.atk, 2) + "</div></div>" +
                "<div style='width:70px'>HP: <div class='bold'>"+ intToString(total.hp, 2) + "</div></div>" +
                (total.exp === 0 ? "" : "<div style='width:70px'>Exp: <div class='bold'>"+ intToString(total.exp, 1) + "</div></div>") +
                "<br>";
            return tooltipDiv;
        },
        getImage: function(action, num) {
            if(num !== 2 || ["sleep", "pause", "restart"].indexOf(action.varName) !== -1) {
                return "<img src='img/" + action.varName + ".svg' class='smallIcon imageDragFix' style='margin-left:5px'>";
            } else {
                if(action.unitsToMove) {
                    let images = "";
                    for (let property in action.unitsToMove) {
                        if (action.unitsToMove.hasOwnProperty(property) && action.unitsToMove[property]) {
                            images += "<img src='img/"+property+".svg' class='smallIcon imageDragFix' style='margin-left:1px'>";
                        }
                    }
                    images += "<div class='fa fa-arrow-right'></div>";
                    if (action.varName === "home") {
                        images += "<img src='img/home.svg' class='smallIcon imageDragFix' style='margin-left:1px'>";
                    } else {
                        let imageType = action.varName.split("_")[0];
                        images += "<img src='img/" + imageType + ".svg' class='smallIcon imageDragFix' style='margin-left:1px'>";
                        let typeNum = parseInt(action.varName.split("_")[1]);
                        images += "<div class='bold'>" + (typeNum + 1) + "</div>";
                    }
                    return images;
                } else {
                    //hero actions?
                }
            }
        },
        getTravelingImage: function(travelObj) {
            // king > heroes > army
            let imageType = "units";
            for(let i = 0; i < travelObj.units.length; i++) {
                if(travelObj.units[i].type === "heroes") {
                    imageType = "heroes";
                }
                if(travelObj.units[i].type === "king") {
                    imageType = "king";
                    break;
                }
                if(!travelObj.units[i].isFriendly) {
                    imageType = "enemy";
                    break;
                }
            }
            return "<img src='img/" + imageType + ".svg' class='largeIcon imageDragFix' style=''>";
        },
        getCostsString: function(costs) {
            let costDesc = "";
            let first = true;
            costs.forEach(function(cost) {
                if(first) {
                    costDesc += "Costs ";
                    first = false;
                } else {
                    costDesc += " Also takes ";
                }
                if(cost.type === "linear") {
                    costDesc += cost.starting + " " + cost.resource + " to start, and " + cost.growth + " more each time after that.";
                } else if(cost.type === "static") {
                    costDesc += cost.starting + " " + cost.resource+"."
                }
            });
            return costDesc;
        }
    }
};

let viewTravelObjs = []; //for re-using divs
