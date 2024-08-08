let view = {
    cached: {}, //contains the elements that are being iterated over and updated regularly,
    initializeDisplay: function() {
        //auto generated elements
    },
    updating: {
        update: function () {
            data.statNames.forEach(function(resName) {
                view.updating.updateStat(resName);
            });
            data.actionNames.forEach(function(actionName) {
                view.updating.updateAction(actionName);
            });


            view.updating.saveCurrentState();
        },
        saveCurrentState: function () {
            prevState.stats = copyArray(data.stats);
            prevState.actions = copyArray(data.actions);
        },
        updateStat: function(statName) {
            let stat = data.stats[statName];
            let prevStat = prevState.stats[statName];
            let forceUpdate = !prevStat;
            let roundedNumbers = [["num", 1], ["perSecond", 2], ["mult", 3]];

            roundedNumbers.forEach(obj => {
                let capName = capitalizeFirst(obj[0]);
                if(forceUpdate || intToString(prevStat[obj[0]], obj[1]) !== intToString(stat[obj[0]], obj[1])) {
                    view.cached[`${statName}${capName}`].innerHTML = intToString(stat[obj[0]], obj[1]);
                }
            })

        },
        updateAction: function(actionName) {
            let action = data.actions[actionName];
            let prevAction = prevState.actions[actionName];
            let forceUpdate = !prevAction;

            let roundedNumbers = [["progress", 2], ["progressMax", 2], ["progressGain", 2],
                // ["realX", 1], ["realY", 1],
                ["toAdd", 3], ["resolve", 2], ["resolveDelta", 2],
                ["level", 1], ["maxLevel", 1], ["exp", 2], ["expToLevel", 2], ["expToAdd", 2],
                ["totalSend", 3], ["expToLevelMult", 3],
                ["unlockCost", 1]];
            let roundWithoutSig = ["progressMaxIncrease", "expToLevelIncrease"];

            roundedNumbers.forEach(obj => {
                let capName = capitalizeFirst(obj[0]);
                if(!view.cached[`${actionName}${capName}`]) {
                    return;
                }
                if(forceUpdate || intToString(prevAction[obj[0]], obj[1]) !== intToString(action[obj[0]], obj[1])) {
                    view.cached[`${actionName}${capName}`].innerHTML = intToString(action[obj[0]], obj[1]);
                }
            })

            roundWithoutSig.forEach(obj => {
                let capName = capitalizeFirst(obj);
                if(!view.cached[`${actionName}${capName}`]) {
                    return;
                }
                if(forceUpdate || prevAction[obj] !== action[obj]) {
                    view.cached[`${actionName}${capName}`].innerHTML = action[obj];
                }
            })

            //TODO refactor to be generic ? / not update constantly
            if(action.statMods) {
                action.statMods.forEach(function(statMod) {
                    document.getElementById(`${actionName}_${statMod[0]}Bonus`).innerHTML = intToString(action[statMod[0]+"Bonus"], 3);
                });
            }

            if (forceUpdate || prevAction.progress !== action.progress) {
                let progress = (action.progress / action.progressMax * 100);
                view.cached[`${actionName}ProgressBarInner`].style.width = `${(progress > 100 ? 100 : progress)}%`;
            }

            if (forceUpdate || prevAction.exp !== action.exp) {
                let exp = (action.exp / action.expToLevel * 100);
                view.cached[`${actionName}ExpBarInner`].style.width = `${(exp > 100 ? 100 : exp)}%`;
            }

            if(action.downstreamVars) {
                action.downstreamVars.forEach(function (toAction) { //also in function updateNumber in events.js
                    if(!data.actions[toAction] || data.actions[toAction].resolveName !== action.resolveName) {
                        return;
                    }
                    if (forceUpdate || prevAction.resolve !== action.resolve) {
                        let rangeValue = document.getElementById(actionName + "RangeInput" + toAction).value;
                        document.getElementById(`${actionName}DownstreamSendRate${toAction}`).textContent = intToString((rangeValue / 100) * data.actions[actionName].progressRateReal() * ticksPerSecond, 4);
                    }
                });
            }

            if(forceUpdate || prevAction.unlocked !== action.unlocked) {
                if(action.unlocked) {
                    document.getElementById(actionName + "LockContainer").style.display = "none";
                } else {
                    document.getElementById(actionName + "LockContainer").style.display = "block";
                }
            }



        },
    },
    create: {
        generateStatDisplay(statVar) {
            let statObj = data.stats[statVar];
            let theStr = "";
            statTitles.forEach(function (statTitle) {
                if(statTitle[1] === statVar) {
                    theStr += ((statVar === "discipline") ? "" : "<br>") +"<div><u><b>"+statTitle[0]+"</b></u></div>";
                }
            });
            theStr +=
                "<div id='"+statVar+"NumContainer' style='position:relative;'>"+
                    "<b><span style='width:110px;display:inline-block'>" + decamelize(statVar) + "</span></b>" +
                    "<b><span id='"+statVar+"Num' style='width:50px;display:inline-block'>"+statObj.num+"</span></b>" +
                    "<span style='width:50px;display:inline-block'>x<b><span id='"+statVar+"Mult'>"+statObj.mult+"</span></b></span>" +
                    "<span style='width:50px;display:inline-block'>+<b><span id='"+statVar+"PerSecond'>"+statObj.perSecond+"</span></b>/s</span>" +
                "</div>";

            let child = document.createElement("div");
            child.innerHTML = theStr;
            document.getElementById("statDisplay").appendChild(child);

            view.cached[statVar+"NumContainer"] = document.getElementById(statVar+"NumContainer");
            view.cached[statVar+"Num"] = document.getElementById(statVar+"Num");
            view.cached[statVar+"PerSecond"] = document.getElementById(statVar+"PerSecond");
            view.cached[statVar+"Mult"] = document.getElementById(statVar+"Mult");
        },
        generateActionDisplay(actionVar) {
            let actionObj = data.actions[actionVar];
            let isFlat = actionVar === "motivate";
            let theStr = "";
            let progressColor = view.helpers.getBackgroundColor(actionObj);

            let title =
                "<span id='"+actionVar+"Title' onclick='actionTitleClicked(`"+actionVar+"`)' style='font-size:16px;width:100%;cursor:pointer;position:absolute;top:-40px;left:-1px;border:1px solid;padding-left:2px;padding-right:2px;border-top:0;border-right:0;'>" +
                    "<b>" + actionObj.title + "</b>, " +
                    "<span id='"+actionVar+"LevelContainer' style='font-size:14px;position:relative;'>" +
                        "Level <b></v><span id='"+actionVar+"Level'>0</span></b>" +
                        (actionObj.maxLevel >= 0 ? " / <b><span id='"+actionVar+"MaxLevel'>0</span></b>" : "") +
                    "</span>" +
                "</span>";
            let menuContainer =
                "<div id='' style='position:absolute;top:-18px;font-size:13px;left:-1px;'>" +
                    (isFlat?"":"<span id='"+actionVar+"GoToParentButton' onclick='actionTitleClicked(\""+actionObj.parent+"\")' class='buttonSimple' style='margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;'>^</span>") +
                    "<span id='"+actionVar+"ToggleDownstreamButton' onclick='toggleDownstream(\""+actionVar+"\")' class='buttonSimple' style='margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;background-color:#7cdde5'>Downstream</span>" +
                    "<span id='"+actionVar+"ToggleLevelInfoButton' onclick='toggleLevelInfo(\""+actionVar+"\")' class='buttonSimple' style='margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;'>Info</span>" +
                    "<span id='"+actionVar+"ToggleStatsInfoButton' onclick='toggleStatsInfo(\""+actionVar+"\")' class='buttonSimple' style='margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;'>Stats</span>" +
                    "<span id='"+actionVar+"ToggleStoryButton' onclick='toggleStory(\""+actionVar+"\")' class='buttonSimple' style='margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;'>Story</span>" +
                "</div>";


            let onComplete =
                "<div id='"+actionVar+"OnCompleteContainer'>On Complete:<br>" +
                    "+<b><span id='"+actionVar+"ExpToAdd'>1</span></b> Exp<br>" +
                    actionObj.onCompleteText +
                "</div><br>";
            let onLevelText =
                "On Level up:<br>" +
                (isFlat?"":"x<b>"+ actionObj.progressMaxIncrease + "</b> to progress required to complete<br>") +
                "x<b>" + actionObj.expToLevelIncrease + "</b> to exp required to level<br>" +
                (actionObj.toAddMultIncrease===1?"":("x<b>" + actionObj.toAddMultIncrease + "</b> to complete result per level <br>"));
            let onLevelStatsText = "";
            if(actionObj.onLevelStats) {
                actionObj.onLevelStats.forEach(function(onLevelStat) {
                    onLevelStatsText += "+<b>"+onLevelStat[1]+"</b> " + onLevelStat[0]+"<br>";
                });
            }
            let levelInfoContainer =
                "<div id='"+actionVar+"LevelInfoContainer' style='display:none;padding:3px;'>" +
                    onComplete +
                    onLevelText +
                    onLevelStatsText +
                    (isFlat?(""):"<br>Send up ["+actionObj.resolveName+" consumption rate] downstream to each of the actions that also use " + actionObj.resolveName) +
                "</div>";

            let storyContainer =
                "<div id='"+actionVar+"StoryContainer' style='display:none;padding:3px;'>" +
                    actionObj.storyText +
                "</div>";
            /*
            Stat Modifiers:
             -100% of grace bonus for x1.4
             -10% of curiosity bonus for x1.1
            total of x15, applied in:
              [exp needed to level] /= total
             */
            let statModsStr = "";
            if(actionObj.statMods) {
                actionObj.statMods.forEach(function (statObj) {
                    let name = statObj[0];
                    let ratio = statObj[1] * 100 + "%";
                    let amount = ((data.stats[name].mult-1) * ratio) + 1;
                    statModsStr +=
                        "<b>" + ratio + "</b> of <b>" + capitalizeFirst(name) + "</b>'s bonus = x<b><span id='"+actionVar+"_"+name+"Bonus'>" + amount + "</span></b><br>"
                });
            }
            let statsContainer =
                "<div id='"+actionVar+"StatsContainer' style='display:none;padding:3px;'>" +
                    "Stat modifiers:<br>" +
                    statModsStr +
                    "<br>Total effect to exp required = " +
                    "x<b><span id='"+actionVar+"ExpToLevelMult'></span></b>" +
                "</div>";

            let lockOverAll = "<div id='"+actionVar+"LockContainer' " +
                "style='position:absolute;background-color: grey;width:100%;height:100%;top:0;text-align:center;'>" +
                "<span id='"+actionVar+"LockIcon'></span><br>" +
                "<span>Needs <b><span id='"+actionVar+"UnlockCost'>0</span></b> "+(data.actions[actionObj.parent]?data.actions[actionObj.parent].resolveName:"ERROR") +
                "<br>sent from <b>" + (data.actions[actionObj.parent]?data.actions[actionObj.parent].title:"ERROR") + "</b></span>" +
                "</div>";
            let resolveContainer =
                "<div id='"+actionVar+"ResolveContainer' style='margin:3px;'>" +
                    capitalizeFirst(actionObj.resolveName)+": <b><span id='"+actionVar+"Resolve'>0</span></b> " +
                    "("+(isFlat?"+":"Δ ")+"<b><span id='"+actionVar+"ResolveDelta'>1.00</span></b>/s)" +
                    // ": <span id='"+actionVar+"RealX'></span>, <span id='"+actionVar+"RealY'></span>" + //TODO debug only
                "</div>" +
                (isFlat?"":("<div style='margin:3px;font-size:10px;'>Consuming "+actionObj.tierMult()+"% of "+actionObj.resolveName+"/s for progress:</div>"));
            let pbar =
                "<div id='"+actionVar+"ProgressBarOuter' style='width:100%;height:16px;position:relative;text-align:left;border-top:1px solid;border-bottom:1px solid;'>" +
                    "<div id='"+actionVar+"ProgressBarInner' style='width:30%;background-color:"+progressColor+";height:100%;position:absolute;'></div>" +
                    "<div id='"+actionVar+"ProgressNumContainer' style='position:absolute;top:1px;left:4px;width:97%'><b></v>" +
                        "<span id='"+actionVar+"Progress'>0</span></b> / " +
                        "<b><span id='"+actionVar+"ProgressMax'>1</span></b> " +
                        "(+<b><span id='"+actionVar+"ProgressGain'>1</span></b>/s)" +
                        "<span style='color:grey;position:absolute;right:0'>x<b><span id='"+actionVar+"ProgressMaxIncrease'>1</span></b> / lvl</span>" +
                    "</div>" +
                "</div>";
            let expBar =
                "<div id='"+actionVar+"ExpBarOuter' style='width:100%;height:16px;position:relative;text-align:left;border-bottom:1px solid;'>" +
                    "<div id='"+actionVar+"ExpBarInner' style='width:30%;background-color:#b79df8;height:100%;position:absolute'></div>" +
                    "<div id='"+actionVar+"ExpNumContainer' style='position:absolute;top:1px;left:4px;;width:97%'><b></v>" +
                        "<span id='"+actionVar+"Exp'>0</span></b> / " +
                        "<b><span id='"+actionVar+"ExpToLevel'>1</span></b>" +
                        "<span style='color:grey;position:absolute;right:0'>x<b><span id='"+actionVar+"ExpToLevelIncrease'>1</span></b> / lvl</span>" +
                    "</div>" +
                "</div>";


            let downstreamContainer =
                "<div id='"+actionVar+"DownstreamContainer' style='padding:3px;'>" +
                    (isFlat?("Send up to 1% resolve/s downstream: <br>"):"") +
                    view.create.createDownStreamSliders(actionObj) +
                    "<span id='"+actionVar+"AllZeroButton' onclick='toggleAllZero(\""+actionVar+"\")' class='buttonSimple' style='margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;'>All 0</span>" +
                    "<span id='"+actionVar+"AllEqualButton' onclick='toggleAllHundred(\""+actionVar+"\")' class='buttonSimple' style='margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;'>All 100</span>" +
                    "<div>Total "+actionObj.resolveName+" used: <b><span id='"+actionVar+"TotalSend'>1</span></b>/s</div>" +
                "</div>";

            let newX = actionObj.realX + 4000;
            let newY = actionObj.realY + 4000;

            theStr +=
                "<div id='"+actionVar+"Container' style='border:1px solid;background-color:#cfd3e6;position:absolute;left:"+newX+"px;top:"+newY+"px;width:260px;min-height:50px;'>" +
                    title +
                    menuContainer +
                    resolveContainer +
                    pbar +
                    expBar +
                    storyContainer +
                    statsContainer +
                    levelInfoContainer +
                    downstreamContainer +
                    lockOverAll +
                "</div>";



            let child = document.createElement("div");
            child.innerHTML = theStr;
            document.getElementById("actionContainer").appendChild(child);


            let lockIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            lockIcon.setAttribute('class', 'lock-icon');
            lockIcon.setAttribute('viewBox', '0 0 24 24');
            lockIcon.setAttribute('fill', 'black');

            let lockPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            lockPath.setAttribute('d', 'M12 2C9.24 2 7 4.24 7 7v5H6c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7c0-1.1-.9-2-2-2h-1V7c0-2.76-2.24-5-5-5zm1 12.5c0 .83-.67 1.5-1.5 1.5S10 15.33 10 14.5V13h3v1.5zM12 4c1.66 0 3 1.34 3 3v5H9V7c0-1.66 1.34-3 3-3z');

            lockIcon.appendChild(lockPath);
            document.getElementById(actionVar+"LockIcon").appendChild(lockIcon);

            //cache the created objects
            view.cached[actionVar + "ProgressMax"] = document.getElementById(actionVar + "ProgressMax");
            view.cached[actionVar + "Title"] = document.getElementById(actionVar + "Title");
            view.cached[actionVar + "Container"] = document.getElementById(actionVar + "Container");
            view.cached[actionVar + "Resolve"] = document.getElementById(actionVar + "Resolve");
            view.cached[actionVar + "ResolveDelta"] = document.getElementById(actionVar + "ResolveDelta");
            view.cached[actionVar + "ProgressBarInner"] = document.getElementById(actionVar + "ProgressBarInner");
            view.cached[actionVar + "Progress"] = document.getElementById(actionVar + "Progress");
            view.cached[actionVar + "ProgressMax"] = document.getElementById(actionVar + "ProgressMax");
            view.cached[actionVar + "ProgressGain"] = document.getElementById(actionVar + "ProgressGain");
            view.cached[actionVar + "ProgressMaxIncrease"] = document.getElementById(actionVar + "ProgressMaxIncrease");
            view.cached[actionVar + "OnCompleteContainer"] = document.getElementById(actionVar + "OnCompleteContainer");
            view.cached[actionVar + "ToAdd"] = document.getElementById(actionVar + "ToAdd");
            view.cached[actionVar + "ExpToAdd"] = document.getElementById(actionVar + "ExpToAdd");
            view.cached[actionVar + "ExpToLevelIncrease"] = document.getElementById(actionVar + "ExpToLevelIncrease");
            view.cached[actionVar + "Level"] = document.getElementById(actionVar + "Level");
            view.cached[actionVar + "MaxLevel"] = document.getElementById(actionVar + "MaxLevel");
            view.cached[actionVar + "ExpBarInner"] = document.getElementById(actionVar + "ExpBarInner");
            view.cached[actionVar + "Exp"] = document.getElementById(actionVar + "Exp");
            view.cached[actionVar + "ExpToLevel"] = document.getElementById(actionVar + "ExpToLevel");
            view.cached[actionVar + "ExpToLevelMult"] = document.getElementById(actionVar + "ExpToLevelMult");
            view.cached[actionVar + "TotalSend"] = document.getElementById(actionVar + "TotalSend");
            view.cached[actionVar + "UnlockCost"] = document.getElementById(actionVar + "UnlockCost");

            view.cached[actionVar + "RealX"] = document.getElementById(actionVar + "RealX");
            view.cached[actionVar + "RealY"] = document.getElementById(actionVar + "RealY");
        },
        createDownStreamSliders(actionObj) {
            let theStr = "";
            if(!actionObj.downstreamVars) {
                return "";
            }
            actionObj.downstreamVars.forEach(function(actionVar) {
                if(data.actions[actionVar] && data.actions[actionVar].resolveName !== actionObj.resolveName) {
                    return;
                }
                let title = data.actions[actionVar] ? data.actions[actionVar].title : actionVar; //can be placeHolder if next action isn't created yet
                theStr +=
                    "<div style='margin-bottom: 5px;margin-top:5px;font-size:12px;'>" +
                        "<b><span style='margin-bottom: 10px;cursor:pointer;' onclick='actionTitleClicked(`"+actionVar+"`)'>"+title+"</span></b>" +
                        " (+<b><span id='"+actionObj.actionVar+"DownstreamSendRate"+actionVar+"'>0</span></b>/s)<br>" +
                        "<input type='number' id='"+actionObj.actionVar+"NumInput"+actionVar+"' value='0' min='0' max='100' oninput='validateInput(\""+actionObj.actionVar+"\", \""+actionVar+"\")' onchange='updateSlider(\""+actionObj.actionVar+"\", \""+actionVar+"\")' style='margin-right: 3px;font-size:10px;width:32px;'>" +
                        "<input type='range' id='"+actionObj.actionVar+"RangeInput"+actionVar+"' value='0' min='0' max='100' oninput='updateNumber(\""+actionObj.actionVar+"\", \""+actionVar+"\")' style='margin-left:5px;width:200px;font-size:10px;height:5px;margin-bottom:8px;'>" +
                   "</div>"

            });


            return theStr
        },
        generateLines() {
            data.actionNames.forEach(function (actionVar) {
                let actionObj = data.actions[actionVar];
                if(!actionObj.downstreamVars) {
                    return;
                }
                actionObj.downstreamVars.forEach(function(actionName, index) {
                    let targetObj = data.actions[actionName];
                    if(!targetObj || targetObj.realX === undefined || actionObj.realX === undefined) {
                        return;
                    }
                    // Calculate the centers of each object
                    const x1 = actionObj.realX + 110 + 4000; // 220 / 2
                    const y1 = actionObj.realY + 50 + 4000; // 200 / 2
                    const x2 = targetObj.realX + 110 + 4000; // 220 / 2
                    const y2 = targetObj.realY + 50 + 4000; // 200 / 2

                    let backgroundColor = view.helpers.getBackgroundColor(targetObj);
                    let isDifferentResource = actionObj.resolveName !== targetObj.resolveName;
                    let opacity = isDifferentResource ? ".8" : "0";


                    const svgBorderLine = `<svg id="${actionVar}_${targetObj.actionVar}_Line_Border" style="position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;opacity:.4;"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="lightgrey" stroke-width="32" /></svg>`;


                    // Create the SVG line as a string
                    const svgLine = `<svg id="`+actionVar+`_`+targetObj.actionVar+`_Line" style="position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;opacity:`+opacity+`;"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="`+backgroundColor+`" stroke-width="30" /></svg>`;

                    // Create a div and set its innerHTML to the SVG line
                    const lineBorderDiv = document.createElement('div');
                    lineBorderDiv.innerHTML = svgBorderLine;
                    const lineDiv = document.createElement('div');
                    lineDiv.innerHTML = svgLine;

                    // Append the lineDiv to the lineContainer
                    const lineContainer = document.getElementById('lineContainer');
                    lineContainer.appendChild(lineBorderDiv);
                    lineContainer.appendChild(lineDiv);
                });
            });
        }
    },
    helpers: {
        getBackgroundColor(actionObj) {
            switch (actionObj.resolveName) {
                case "mana":
                    return "#2da3ef";
                case "gold":
                    return "#ffe52c";
                case "arcana":
                    return "#ff1cf4";
                default:
                    return "#BDF89DFF";
            }
        },
        getStatChanges() {
            let statsPerSecond = {};

            data.actionNames.forEach(actionName => {
                let actionObj = data.actions[actionName];

                // Calculate levels per second
                let completesPerSecond = actionObj.progressRate() * ticksPerSecond / actionObj.progressMax;
                let levelsPerSecond = completesPerSecond * actionObj.expToAdd / actionObj.expToLevel;

                // Update statsPerSecond based on the action's onLevelStats
                actionObj.onLevelStats.forEach(([stat, amount]) => {
                    if (!statsPerSecond.hasOwnProperty(stat)) { // Auto-initialize
                        statsPerSecond[stat] = 0;
                    }
                    statsPerSecond[stat] += amount * levelsPerSecond;
                });
            });
            return statsPerSecond;
        },
        addLockBox(elem) {
            //adds a child element to the given element that goes first, takes 100% of the width and height, is opaque:.5, and blocks all pointer events
            //it also is black with a white border, and with a white lock symbol in the middle, scaling based on the elem's dimensions

        }
    }
};
let views = [];

