let view = {
    initialize: function() {
        view.clickable.initial.createCastleIcons();
        view.clickable.initial.createWarMap();
        prevState.mana = -1; //force redraw
        prevState.gold = -1;
        prevState.wood = -1;
        this.actionInfoDiv = {"king":document.getElementById("actionInfoDivKing"),
            "castle":document.getElementById("actionInfoDivCastle"),
            "units":document.getElementById("actionInfoDivUnits"),
            "lab":document.getElementById("actionInfoDivLab")};
    },
    updating: {
        update: function () {
            //compare prevState to current
            //update the view of anything that's changed
            view.updating.updateLists();
            view.updating.updateResources();
            view.updating.updateCreated();
            view.updating.updateUnits();

            view.updating.saveCurrentState();
        },
        saveCurrentState: function () {
            prevState.mana = mana;
            prevState.maxMana = maxMana;
            prevState.gold = gold;
            prevState.wood = wood;
            prevState.next = copyArray(actionsList.next);
            prevState.current = copyArray(actionsList.current);
            prevState.created = copyArray(created);
            prevState.levelData = copyArray(levelData);
        },
        updateResources: function() {
            if(prevState.mana !== mana || prevState.maxMana !== maxMana) {
                document.getElementById("manaBar").style.width = mana / maxMana * 100 + "%";
                document.getElementById("mana").innerHTML = intToString(mana, 1);
            }
            if(prevState.gold !== gold) {
                document.getElementById("gold").innerHTML = intToString(gold, 1);
            }
            if(prevState.wood !== wood) {
                document.getElementById("wood").innerHTML = intToString(wood, 1);
            }
        },
        updateLists: function() {
            for (let i = 0; i < actionsList.nextNames.length; i++) {
                let name = actionsList.nextNames[i];
                if(prevState.next[name].length !== actionsList.next[name].length) {
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
                if(prevState.current[name].length !== actionsList.current[name].length) {
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
                        document.getElementById("action"+j+name+"Bar").style.width = 100 * curAction.manaUsed / (curAction.costseconds * 10) + "%";
                        document.getElementById("action"+j+name+"LoopsLeft").innerHTML = curAction.loopsLeft;
                        document.getElementById("action"+j+name+"Loops").innerHTML = curAction.loops;
                        if(curList === i && currentlyHovering === j) { //only update last hovered live
                            document.getElementById("action"+j+name+"TimeNeeded").innerHTML = intToString((curAction.costseconds*10 - curAction.manaUsed)/10, 2);
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
        updateCreated: function() {
            for (let property in created.castle) {
                if (created.castle.hasOwnProperty(property) &&
                    JSON.stringify(created.castle[property]) !== JSON.stringify(prevState.created.castle[property])) {
                    document.getElementById(property+"Num").innerHTML = created.castle[property];
                    document.getElementById(property+"Num").style.opacity = created.castle[property] === 0 ? "0" : "1";
                }
            }
        },
        updateUnits: function() {
            let prevLevelDatum = prevState.levelData;

            //update castle
            if(!prevLevelDatum || JSON.stringify(prevLevelDatum.home) !== JSON.stringify(levelData.home)) {
                view.helpers.createMapTooltipString("Castle", levelData.home, "homeTooltip");
            }

            //update dungeons
            for(let i = 0; i < levelData.dungeons.length; i++) {
                let dungeon = levelData.dungeons[i];
                if(!prevLevelDatum || !prevLevelDatum.dungeons || JSON.stringify(prevLevelDatum.dungeons[i]) !== JSON.stringify(dungeon)) {
                    view.helpers.createMapTooltipString("Dungeon "+(i+1), dungeon, "dungeonTooltip"+i);
                }
            }

            //update hideouts
            for(let i = 0; i < levelData.hideouts.length; i++) {
                let hideout = levelData.hideouts[i];
                if(!prevLevelDatum || !prevLevelDatum.hideouts || JSON.stringify(prevLevelDatum.hideouts[i]) !== JSON.stringify(hideout)) {
                    view.helpers.createMapTooltipString("Hideout "+(i+1), hideout, "hideoutTooltip"+i);
                }
            }

            //TODO update travelling
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
                let image = view.helpers.getWarMapImage(action.varName, num);
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
                let image = view.helpers.getWarMapImage(action.varName, num);
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
                totalDivText +=
                    "<div id='actionTooltip"+i+name+"' style='display:none;padding-left:10px;width:90%'>" +
                    "<div style='text-align:center;width:100%'>"+getActionByVarName(action.varName, name).name+"</div><br><br>" +
                    "<div class='bold'>Seconds Needed</div> <div id='action"+i+name+"TimeNeeded'></div><br>" +
                    "<div class='bold'>Next Mana Cost</div> <div id='action"+i+name+"ManaCost'></div><br>" +
                    // "<div class='bold'>Mana Remaining</div> <div id='action"+i+name+"ManaRemaining'></div><br>" +
                    "<div class='bold'>Next Gold Cost</div> <div id='action"+i+name+"GoldCost'></div><br>" +
                    // "<div class='bold'>Gold Remaining</div> <div id='action"+i+name+"GoldRemaining'></div><br>" +
                    "<div class='bold'>Next Wood Cost</div> <div id='action"+i+name+"WoodCost'></div><br>" +
                    // "<div class='bold'>Wood Remaining</div> <div id='action"+i+name+"WoodRemaining'></div><br><br>" +
                    "<div id='action"+i+name+"HasFailed' style='display:none'>" +
                    "<div class='bold'>Times Failed</div> <div id='action"+i+name+"Failed'>0</div><br>" +
                    "<div class='bold'>Error</div> <div id='action"+i+name+"Error'></div>" +
                    "</div>" +
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
                    let curAction = actionsList.current[name][i];
                    document.getElementById("action"+i+name+"GoldCost").innerHTML = curAction.costgold+"";
                    document.getElementById("action"+i+name+"WoodCost").innerHTML = curAction.costwood+"";
                    document.getElementById("action"+i+name+"ManaCost").innerHTML = curAction.costmana+"";
                    document.getElementById("action"+i+name+"TimeNeeded").innerHTML = intToString((curAction.costseconds*10 - curAction.manaUsed)/10, 2);
                }
            }
            view.actionInfoDiv[name].style.display = isHover ? "inline-block" : "none";
            if(actionsList.nextNames[curList] === name) {
                document.getElementById("optionsDiv").style.display = isHover ? "none" : "inline-block";
            }
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
        }
    },
    clickable: {
        initial: {
            createCastleIcons: function () {
                let container = document.getElementById("castleActions");
                let allDivs = "";
                castle.actions.forEach(function(action) {
                    let costDesc = "";
                    let first = true;
                    action.cost.forEach(function(cost) {
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

                    let desc = action.desc + "<br>Adds to the Castle queue.<br>" + costDesc;
                    //add a progress bar
                    allDivs +=
                        '<div id="'+action.varName+'Container" onclick="addActionToList(\''+action.varName+'\', 1, true)" class="clickable abs showthat" style="left:'+action.xPos+'px;top:'+action.yPos+'px;">' +
                        '<img src="img/' + action.varName + '.svg" class="superLargeIcon imageDragFix">' +
                        '<div class="showthis" style="width:250px">' +
                        '<div class="smallTitle">'+action.name+'</div>' +
                        '<div class="small">'+desc+'</div>' +
                        '</div>' +
                        '</div>' +
                        '<div id="'+action.varName+'Num" class="createdNum abs" style="left:'+(action.xPos+10)+'px;top:'+(action.yPos+43)+'px;"></div>';
                });
                container.innerHTML = allDivs;
            },
            createWarMap: function() {
                createLevel(0);
                warMap.actions.createWarMapActions(levelData);
                let allDivs = "";
                let homeCoords = view.helpers.translateToWarMapCoords(levelData.home.coords);

                //create castle
                allDivs +=
                    '<div class="clickable showthat" style="position:absolute;left:'+homeCoords.x+'px;top:'+homeCoords.y+'px;" onclick="addActionToList(\'home\', 2, true)">' +
                    '<img src="img/castle.svg" class="superLargeIcon imageDragFix">' +
                    '<div class="showthis" id="homeTooltip">King</div>' +
                    '</div>';

                //create dungeons
                for(let i = 0; i < levelData.dungeons.length; i++) {
                    let dungeon = levelData.dungeons[i];
                    let coords = view.helpers.translateToWarMapCoords(dungeon.coords);
                    allDivs +=
                        '<div class="clickable showthat" style="position:absolute;left:'+coords.x+'px;top:'+coords.y+'px;" onclick="addActionToList(\'dungeon_'+i+'\', 2, true)">' +
                        '<img src="img/dungeon.svg" class="superLargeIcon imageDragFix">' +
                        '<div class="showthis" id="dungeonTooltip'+i+'"></div>' +
                        '</div>';
                }

                //create hideouts
                for(let i = 0; i < levelData.hideouts.length; i++) {
                    let hideout = levelData.hideouts[i];
                    let coords = view.helpers.translateToWarMapCoords(hideout.coords);
                    allDivs +=
                        '<div class="clickable showthat" style="position:absolute;left:'+coords.x+'px;top:'+coords.y+'px;" onclick="addActionToList(\'hideout_'+i+'\', 2, true)">' +
                        '<img src="img/hideout.svg" class="superLargeIcon imageDragFix">' +
                        '<div class="showthis" id="hideoutTooltip'+i+'"></div>' +
                        '</div>';
                }

                document.getElementById("warMapActions").innerHTML = allDivs;
            }
        }
    },
    helpers: {
        createMapTooltipString: function(titleName, baseData, elementId) {
            let tooltipDiv = "<div class='mapTooltipRow'><div class='title'>"+titleName+"</div>";
            let total = { atk: 0, hp: 0 };
            baseData.units.forEach(function(unit) {
                let num = unit.amount;
                total.atk += unit.atk * num;
                total.hp += unit.hp * num;
                tooltipDiv += "<div style='width:20px'><div class='bold'>" + num + "</div></div>" +
                    "<div style='width:80px'>" + capitalizeFirst(unit.varName) + "</div>" +
                    "<div style='width:60px'>Atk: <div class='bold'>"+ unit.atk + "</div></div>" +
                    "<div style='width:60px'>HP: <div class='bold'>"+ unit.hp + "</div></div><br>"
            });
            tooltipDiv += "<div style='width:100px'>Total</div>" +
                "<div style='width:60px'>Atk: <div class='bold'>"+ total.atk + "</div></div>" +
                "<div style='width:60px'>HP: <div class='bold'>"+ total.hp + "</div></div><br>";
            if(baseData.reward) {
                for(let i = 0; i < baseData.reward.length; i++) {
                    let nextReward = baseData.reward[i];
                    tooltipDiv += "Gain " + nextReward.amount + " " + nextReward.type + " when cleared. ";
                }
            }
            tooltipDiv += "</div>"; //closing mapTooltipRow
            document.getElementById(elementId).innerHTML = tooltipDiv;
        },
        translateToWarMapCoords: function(coords) { //x,y 0-100, translated to x:10-550 and y:15-300
            return {x:10+(coords.x / 100 * 540), y:15+(coords.y / 100 * 285)};
        },
        getWarMapImage: function(varName, num) {
            if(num !== 2 || varName === "sleep") {
                return "<img src='img/" + varName + ".svg' class='smallIcon' style='margin-left:5px'>";
            } else {
                let moveType = "units"; //TODO heroes
                let images;
                if(moveType === "units") {
                    images = "<img src='img/army.svg' class='smallIcon' style='margin-left:5px'>";
                }
                if(varName === "home") {
                    images += "<img src='img/castle.svg' class='smallIcon' style='margin-left:1px'>";
                } else {
                    let imageType = varName.split("_")[0];
                    images += "<img src='img/"+imageType+".svg' class='smallIcon' style='margin-left:1px'>";
                    let typeNum = parseInt(varName.split("_")[1]);
                    images += "<div class='bold'>"+(typeNum+1)+"</div>";
                }
                return images;
            }
        }
    }
};