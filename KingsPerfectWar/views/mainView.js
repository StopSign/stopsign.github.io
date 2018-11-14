let view = {
    initialize: function() {
        view.clickable.initial.createCastleIcons();
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

            view.updating.saveCurrentState();
        },
        saveCurrentState: function () {
            prevState.mana = mana;
            prevState.maxMana = maxMana;
            prevState.gold = gold;
            prevState.wood = wood;
            prevState.next = JSON.parse(JSON.stringify(actionsList.next));
            prevState.current = JSON.parse(JSON.stringify(actionsList.current));
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
                    if(!prevState.next[name][j] || JSON.stringify(prevState.next[name][j]) !== JSON.stringify(actionsList.next[name][j])) {
                        view.actionList.createNextList(i);
                        break;
                    }
                }
            }
            for (let i = 0; i < actionsList.nextNames.length; i++) {
                let name = actionsList.nextNames[i];
                if(prevState.current[name].length !== actionsList.current[name].length) {
                    view.actionList.createCurrentList(i);
                    continue;
                }
                for (let j = 0; j < actionsList.current[name].length; j++) { //TODO only update when varName or loops is different
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
                    }
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
                // let action = getActionByVarName(theList[i].varName, name);
                let action = theList[i];
                let capButton = "";
                // if (action.cap) {
                //     capButton = "<i id='capButton" + i + "' onclick='capAmount(" + i + ", " + townNum + ")' class='actionIcon fa fa-circle-thin'></i>";
                // }

                totalDivText +=
                    "<div id='nextActionContainer" + i + name + "' class='nextActionContainer small' ondragover='handleDragOver(event)' ondrop='handleDragDrop(event, "+num+")' ondragstart='handleDragStart(event, \""+name+"\")' ondragend='draggedUndecorate(" + i + ", \""+name+"\")' ondragenter='dragOverDecorate(" + i +", \""+name+"\")' ondragleave='dragExitUndecorate("+i+", \""+name+"\")' draggable='true' data-index='"+i+"'>" +
                        "<img src='img/" + action.varName + ".svg' class='smallIcon imageDragFix' style='margin-left:5px'> x " +
                        "<div class='bold'>" + action.loops + "</div>" +
                        "<div style='float:right'>" +
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
                totalDivText +=
                    "<div class='curActionContainer small' id='curAction"+i+name+"' onmouseover='view.actionList.showInfoDiv("+i+", \""+name+"\", true)' onmouseleave='view.actionList.showInfoDiv("+i+", \""+name+"\",false)'>" +
                        "<div class='curActionBar' style='width:"+width+"' id='action"+i+name+"Bar'></div>" +
                        "<div class='actionSelectedIndicator' id='action"+i+name+"Selected'></div>" +
                        "<img src='img/"+action.varName+".svg' class='smallIcon' style='margin-left:5px'> x " +
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
                        "<div class='bold'>Next Seconds Needed</div> <div id='action"+i+name+"TimeNeeded'></div><br>" +
                        "<div class='bold'>Next Mana Cost</div> <div id='action"+i+name+"ManaCost'></div><br>" +
                        "<div class='bold'>Mana Remaining</div> <div id='action"+i+name+"ManaRemaining'></div><br>" +
                        "<div class='bold'>Next Gold Cost</div> <div id='action"+i+name+"GoldCost'></div><br>" +
                        "<div class='bold'>Gold Remaining</div> <div id='action"+i+name+"GoldRemaining'></div><br>" +
                        "<div class='bold'>Next Wood Cost</div> <div id='action"+i+name+"WoodCost'></div><br>" +
                        "<div class='bold'>Wood Remaining</div> <div id='action"+i+name+"WoodRemaining'></div><br><br>" +
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
            console.log(i, name, isHover);
            const div = document.getElementById("action"+i+name+"Selected");
            if(div) {
                div.style.opacity = isHover ? "1" : "0";
                document.getElementById("actionTooltip"+i+name).style.display = isHover ? "inline-block" : "none";
                if(isHover) {
                    document.getElementById("action"+i+name+"GoldCost").innerHTML = actionsList.current[name][i].costgold+"";
                    document.getElementById("action"+i+name+"WoodCost").innerHTML = actionsList.current[name][i].costwood+"";
                    document.getElementById("action"+i+name+"ManaCost").innerHTML = actionsList.current[name][i].costmana+"";
                    document.getElementById("action"+i+name+"TimeNeeded").innerHTML = actionsList.current[name][i].costseconds+"";
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
                    allDivs += '<div id="'+action.varName+'Container" onclick="addActionToList(\''+action.varName+'\', 1)" class="clickable abs showthat" style="left:'+action.xPos+'px;top:'+action.yPos+'px;">' +
                            '<img src="img/' + action.varName + '.svg" class="superLargeIcon imageDragFix">' +
                            '<div class="showthis" style="width:250px">' +
                                '<div class="smallTitle">'+action.name+'</div>' +
                                '<div class="small">'+desc+'</div>' +
                            '</div>' +
                        '</div>';
                });
                container.innerHTML = allDivs;
            }
        }
    }

};