let view = {
    actionList: {

    },
    clickable: {
        initial: {
            initialize: function() {
                view.clickable.initial.createCastleIcons();
            },
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
                    allDivs += '<div id="'+action.varName+'Container" onclick="addActionToList('+action+', \'castle\')" class="clickable abs showthat" style="left:'+action.xPos+'px;top:'+action.yPos+'px;">' +
                            // '<div class="actionName">'+action.name+'</div>' +
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