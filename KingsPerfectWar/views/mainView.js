let view = {
    initialize: function() {
        view.clickable.initial.createCastleIcons();
        prevState.mana = -1; //force redraw
        prevState.gold = -1;
        prevState.wood = -1;
    },
    updating: {
        update: function () {
            //compare prevState to current
            //update the view of anything that's changed
            view.updating.updateLists();
            view.updating.updateResources();

            view.updating.saveCurrentState();
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
        saveCurrentState: function () {
            prevState.mana = mana;
            prevState.next = JSON.parse(JSON.stringify(actionsList.next));
            prevState.view = JSON.parse(JSON.stringify(view));
        },
        updateLists: function() {
            for (let i = 0; i < actionsList.nextNames.length; i++) {
                let name = actionsList.nextNames[i];
                if(prevState.next[name].length !== actionsList.next[name].length) {
                    view.actionList.createNextList(i);
                    continue;
                }
                let shouldUpdate = false;
                for (let j = 0; j < actionsList.next[name].length; j++) {
                    if(!prevState.next[name][j] || JSON.stringify(prevState.next[name][j]) !== JSON.stringify(actionsList.next[name][j])) {
                        shouldUpdate = true;
                    }
                }
                if(shouldUpdate) {
                    view.actionList.createNextList(i);
                }
            }
        }
    },
    actionList: {
        createNextList: function(num) {
            let name = actionsList.nextNames[num];
            let theList = actionsList.next[name];
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
                count++;
                theDiv.removeChild(theDiv.firstChild);
            }

            let totalDivText = "";

            for (let i = 0; i < theList.length; i++) {
                // let action = getActionByVarName(theList[i].varName, name);
                let action = theList[i];
                let capButton = "";
                // if (action.cap) {
                //     capButton = "<i id='capButton" + i + "' onclick='capAmount(" + i + ", " + townNum + ")' class='actionIcon fa fa-circle-thin'></i>";
                // }

                totalDivText +=
                    "<div id='nextActionContainer" + i + name + "' class='nextActionContainer small' ondragover='handleDragOver(event)' ondrop='handleDragDrop(event, \""+name+"\")' ondragstart='handleDragStart(event, \""+name+"\")' ondragend='draggedUndecorate(" + i + ", \""+name+"\")' ondragenter='dragOverDecorate(" + i +", \""+name+"\")' ondragleave='dragExitUndecorate("+i+", \""+name+"\")' draggable='true' data-index='"+i+"'>" +
                        "<img src='img/" + action.varName + ".svg' class='smallIcon imageDragFix'> x " +
                        "<div class='bold'>" + action.loops + "</div>" +
                        "<div style='float:right'>" +
                            capButton +
                            "<i id='plusButton" + i + name + "' onclick='addLoop(" + i + ",\""+name+"\")' class='actionIcon fa fa-plus'></i>" +
                            "<i id='minusButton" + i + name + "' onclick='removeLoop(" + i + ",\""+name+"\")' class='actionIcon fa fa-minus'></i>" +
                            "<i id='splitButton" + i + name + "' onclick='split(" + i + ",\""+name+"\")' class='actionIcon fa fa-arrows-h'></i>" +
                            "<i id='upButton" + i + name + "' onclick='moveUp(" + i + ",\""+name+"\")' class='actionIcon fa fa-sort-up'></i>" +
                            "<i id='downButton" + i + name + "' onclick='moveDown(" + i + ",\""+name+"\")' class='actionIcon fa fa-sort-down'></i>" +
                            "<i id='removeButton" + i + name + "' onclick='removeAction(" + i + ",\""+name+"\")' class='actionIcon fa fa-times'></i>" +
                        "</div>" +
                    "</div>";
            }

            theDiv.innerHTML = totalDivText;
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

                    let desc = action.desc + "<br>Adds to the building queue.<br>" + costDesc;
                    //add a progress bar
                    allDivs += '<div id="'+action.varName+'Container" onclick="addActionToList(\''+action.varName+'\', \'castle\')" class="clickable abs showthat" style="left:'+action.xPos+'px;top:'+action.yPos+'px;">' +
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