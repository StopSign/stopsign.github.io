

function initializeDisplay() {
    //auto generated elements
}

function generateStatDisplay(statVar) {
    let statObj = data.stats[statVar];
    let theStr = "";
    statTitles.forEach(function (statTitle) {
        if(statTitle[1] === statVar) {
            theStr += ((statVar === "discipline") ? "" : "<br>") +"<div><u><b>"+statTitle[0]+"</b></u></div>";
        }
    });
    theStr +=
        "<div id='"+statVar+"NumContainer' style='position:relative;'>"+
        "<b><span id='"+statVar+"Name' style='width:110px;display:inline-block;cursor:pointer' onclick='clickedStatName(\""+statVar+"\")'>" + decamelize(statVar) + "</span></b>" +
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
    view.cached[statVar+"Name"] = document.getElementById(statVar+"Name");
}

function generateActionDisplay(actionVar) {
    let actionObj = data.actions[actionVar];
    let theStr = "";
    let progressColor = getResourceColor(actionObj);

    let title =
        "<span id='"+actionVar+"Title' onclick='actionTitleClicked(`"+actionVar+"`)' style='font-size:16px;color:var(--text-primary);width:100%;cursor:pointer;position:absolute;top:-40px;left:-1px;white-space: nowrap;border:2px solid var(--border-color);padding-left:2px;padding-right:2px;border-top:0;border-right:0;background-color:var(--overlay-color)'>" +
        "<b>" + actionObj.title + "</b>" +
        " | <span style='font-size:12px;position:relative;'>" +
        "Level <b></v><span id='"+actionVar+"Level'>0</span></b>" +
        (actionObj.maxLevel >= 0 ? " / <b><span id='"+actionVar+"MaxLevel'>0</span></b>" : "") +
        "</span>" +
        " | <span style='font-size:12px;'><b><span id='"+actionVar+"Efficiency'></span></b>%</span>" +
        "</span>" +
        "</span>";

    let hideDownstreambutton = actionObj.isGenerator && actionVar !== "overclock";
    let displayDownstreamButton = hideDownstreambutton?"none":"";

    let menuContainer =
        "<div id='' style='position:absolute;top:-18px;font-size:13px;left:-1px;'>" +
        (actionVar==="overclock"?"":"<span id='"+actionVar+"GoToParentButton' onclick='actionTitleClicked(\""+actionObj.parent+"\")' " +
            "class='buttonSimple' style='margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;'>^</span>") +
        "<span id='"+actionVar+"ToggleDownstreamButton' onclick='toggleDownstream(\""+actionVar+"\")' class='buttonSimple' style='display:"+displayDownstreamButton+";margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;background-color:var(--selection-color)'>Downstream</span>" +
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
        (actionObj.isGenerator?"":"x<b>"+ actionObj.progressMaxIncrease + "</b> to progress required to complete<br>") +
        "x<b>" + actionObj.expToLevelIncrease + "</b> to Exp required to level<br>" +
        (actionObj.actionPowerMultIncrease===1?"":("x<b>" + actionObj.actionPowerMultIncrease + "</b> to Action Power per level <br>")) +
        "(x<b><span id='"+actionVar+"ActionPowerMult'></b> total Action Power from level)<br>" +
        actionObj.onLevelText;

    let levelInfoContainer =
        "<div id='"+actionVar+"LevelInfoContainer' style='display:none;padding:3px;'>" +
        onComplete +
        onLevelText +
        (actionObj.isGenerator?(""):"<br>Send up to ["+actionObj.momentumName+" consumption rate] downstream to each of the actions that also use " + actionObj.momentumName) +
        actionObj.extraInfo+""+
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
    let expStatsStr = "Stat Modifiers to Exp Required:<br>";
    if(actionObj.expStats) {
        let totalAmount = 1;
        actionObj.expStats.forEach(function (statObj) {
            let name = statObj[0];
            let ratio = statObj[1] * 100 + "%";
            if(!data.stats[name]) {
                console.log("Error - missing stat in initialization: " + name);
            }
            let amount = ((data.stats[name].mult-1) * statObj[1]) + 1;
            totalAmount *= amount;
            expStatsStr +=
                "<b>" + ratio + "</b> of <b>" + capitalizeFirst(name) + "</b>'s bonus = x<b><span id='"+actionVar+"_"+name+"StatExpMult'>" + amount + "</span></b><br>"
        });
        expStatsStr += "Total Reduction: /<b>" + intToString(totalAmount, 3) + "</b>, = x<b><span id='"+actionVar+"ExpToLevelMult'></span></b><br>";
    }

    let expertiseModsStr = "<br>Stat Modifiers to Expertise:<br>";
    if(actionObj.efficiencyStats) {
        let totalAmount = 1;
        actionObj.efficiencyStats.forEach(function (expertiseStat) {
            let name = expertiseStat[0];
            let ratio = expertiseStat[1] * 100 + "%";
            if(data.stats[name] === undefined) {
                console.log("ERROR: you need to instantiate the stat '"+name+"'")
                stop = 1;
            }
            let amount = ((data.stats[name].mult-1) * expertiseStat[1]) + 1;
            totalAmount *= amount;
            expertiseModsStr +=
                "<b>" + ratio + "</b> of <b>" + capitalizeFirst(name) + "</b>'s bonus = x<b><span id='"+actionVar+"_"+name+"StatExpertiseMult'>" + amount + "</span></b><br>"
        });
        expertiseModsStr += "Total Expertise Mult: x<b>" + intToString(totalAmount, 3) + "</b>, = x<b><span id='"+actionVar+"ExpertiseMult'></span></b><br>" +
            "Expertise * base efficiency (x<b><span id='"+actionVar+"ExpertiseBase'></span></b>) = efficiency, in the title, capping at <b>100</b>%.<br>";
    }

    let onLevelStatsText = "<br>On Level Up:<br>";
    if(actionObj.onLevelStats) {
        actionObj.onLevelStats.forEach(function(onLevelStat) {
            onLevelStatsText += "+<b>"+onLevelStat[1]+" " + capitalizeFirst(onLevelStat[0])+"</b><br>";
        });
    }

    let statsContainer =
        "<div id='"+actionVar+"StatsContainer' style='display:none;padding:3px;'>" +
        expStatsStr +
        expertiseModsStr +
        onLevelStatsText +
        "</div>";

    let lockOverAll = "<div id='"+actionVar+"LockContainer' " +
        "style='position:absolute;background-color: var(--bg-secondary);width:100%;height:100%;top:0;text-align:center;'>" +
        "<span id='"+actionVar+"LockIcon'></span><br>" +
        "<span>Needs <b><span id='"+actionVar+"UnlockCost'>0</span></b> " + actionObj.momentumName +
        "<br>sent from <b>" + (data.actions[actionObj.parent]?data.actions[actionObj.parent].title:"WAIT") + "</b>.<br>" + //generally just not loaded yet
        actionObj.unlockMessage +
        "</span>" +
        "</div>";
    let momentumContainer =
        "<div id='"+actionVar+"MomentumContainer' style='margin:3px;'>" +
        "<span style='font-size:12px;'>Tier <b><span id='"+actionVar+"Tier'></span></span></b> | " +
        capitalizeFirst(actionObj.momentumName)+": <b><span id='"+actionVar+"Momentum'>0</span></b><br>" +
        "+<b><span id='"+actionVar+"MomentumIncrease'></span></b>/s, " +
        "-<b><span id='"+actionVar+"MomentumDecrease'></span></b>/s, "  +
        "Δ<b><span id='"+actionVar+"MomentumDelta'>1.0</span></b>/s" +
        // ": <span id='"+actionVar+"RealX'></span>, <span id='"+actionVar+"RealY'></span>" + //TODO debug only
        "</div>" +
        (actionObj.isGenerator?"":("<div style='margin:3px;font-size:10px;'>Progress/s = "+actionObj.tierMult()*100+"% of "+actionObj.momentumName+" * efficiency:</div>"));
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
        "<div id='"+actionVar+"ExpBarInner' style='width:30%;background-color:var(--exp-color);height:100%;position:absolute'></div>" +
        "<div id='"+actionVar+"ExpNumContainer' style='position:absolute;top:1px;left:4px;;width:97%'><b></v>" +
        "<span id='"+actionVar+"Exp'>0</span></b> / " +
        "<b><span id='"+actionVar+"ExpToLevel'>1</span></b>" +
        "<span style='color:grey;position:absolute;right:0'>x<b><span id='"+actionVar+"ExpToLevelIncrease'>1</span></b> / lvl</span>" +
        "</div>" +
        "</div>";


    let downstreamContainer =
        "<div id='"+actionVar+"DownstreamContainer' style='padding:10px;'>" +
        (actionVar==="overclock"?("Send up to (10% * efficiency of momentum)/s downstream: <br>"):"") +
        createDownStreamSliders(actionObj) +
        "<span id='"+actionVar+"AllZeroButton' onclick='toggleAllZero(\""+actionVar+"\")' class='buttonSimple' style='margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;'>All 0</span>" +
        "<span id='"+actionVar+"AllEqualButton' onclick='toggleAllHundred(\""+actionVar+"\")' class='buttonSimple' style='margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;'>All 100</span>" +
        "<div>Total "+actionObj.momentumName+" sending downstream: <b><span id='"+actionVar+"TotalSend'>1</span></b>/s</div>"
        + "</div>";

    let newX = actionObj.realX + 4000;
    let newY = actionObj.realY + 4000;

    theStr +=
        "<div id='"+actionVar+"Container' style='border:2px solid var(--border-color);background-color:var(--bg-secondary);position:absolute;left:"+newX+"px;top:"+newY+"px;width:300px;min-height:150px;'>" +
        title +
        menuContainer +
        momentumContainer +
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
    lockIcon.setAttribute('fill', 'var(--text-primary)');

    let lockPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    lockPath.setAttribute('d', 'M12 2C9.24 2 7 4.24 7 7v5H6c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7c0-1.1-.9-2-2-2h-1V7c0-2.76-2.24-5-5-5zm1 12.5c0 .83-.67 1.5-1.5 1.5S10 15.33 10 14.5V13h3v1.5zM12 4c1.66 0 3 1.34 3 3v5H9V7c0-1.66 1.34-3 3-3z');

    lockIcon.appendChild(lockPath);
    document.getElementById(actionVar+"LockIcon").appendChild(lockIcon);

    //cache the created objects
    view.cached[actionVar + "Container"] = document.getElementById(actionVar + "Container");
    view.cached[actionVar + "ProgressMax"] = document.getElementById(actionVar + "ProgressMax");
    view.cached[actionVar + "Title"] = document.getElementById(actionVar + "Title");
    view.cached[actionVar + "Container"] = document.getElementById(actionVar + "Container");
    view.cached[actionVar + "Momentum"] = document.getElementById(actionVar + "Momentum");
    view.cached[actionVar + "MomentumDelta"] = document.getElementById(actionVar + "MomentumDelta");
    view.cached[actionVar + "ProgressBarInner"] = document.getElementById(actionVar + "ProgressBarInner");
    view.cached[actionVar + "Progress"] = document.getElementById(actionVar + "Progress");
    view.cached[actionVar + "ProgressMax"] = document.getElementById(actionVar + "ProgressMax");
    view.cached[actionVar + "ProgressGain"] = document.getElementById(actionVar + "ProgressGain");
    view.cached[actionVar + "ProgressMaxIncrease"] = document.getElementById(actionVar + "ProgressMaxIncrease");
    view.cached[actionVar + "OnCompleteContainer"] = document.getElementById(actionVar + "OnCompleteContainer");
    view.cached[actionVar + "ActionPower"] = document.getElementById(actionVar + "ActionPower");
    view.cached[actionVar + "ActionPowerMult"] = document.getElementById(actionVar + "ActionPowerMult");
    view.cached[actionVar + "ExpToAdd"] = document.getElementById(actionVar + "ExpToAdd");
    view.cached[actionVar + "MomentumIncrease"] = document.getElementById(actionVar + "MomentumIncrease");
    view.cached[actionVar + "MomentumDecrease"] = document.getElementById(actionVar + "MomentumDecrease");
    view.cached[actionVar + "AmountToSend"] = document.getElementById(actionVar + "AmountToSend");
    view.cached[actionVar + "ExpToLevelIncrease"] = document.getElementById(actionVar + "ExpToLevelIncrease");
    view.cached[actionVar + "Level"] = document.getElementById(actionVar + "Level");
    view.cached[actionVar + "MaxLevel"] = document.getElementById(actionVar + "MaxLevel");
    view.cached[actionVar + "ExpBarInner"] = document.getElementById(actionVar + "ExpBarInner");
    view.cached[actionVar + "Exp"] = document.getElementById(actionVar + "Exp");
    view.cached[actionVar + "ExpToLevel"] = document.getElementById(actionVar + "ExpToLevel");
    view.cached[actionVar + "ExpToLevelMult"] = document.getElementById(actionVar + "ExpToLevelMult");
    view.cached[actionVar + "TotalSend"] = document.getElementById(actionVar + "TotalSend");
    view.cached[actionVar + "UnlockCost"] = document.getElementById(actionVar + "UnlockCost");
    view.cached[actionVar + "Expertise"] = document.getElementById(actionVar + "Expertise");
    view.cached[actionVar + "ExpertiseBase"] = document.getElementById(actionVar + "ExpertiseBase");
    view.cached[actionVar + "ExpertiseMult"] = document.getElementById(actionVar + "ExpertiseMult");
    view.cached[actionVar + "Efficiency"] = document.getElementById(actionVar + "Efficiency");
    view.cached[actionVar + "Tier"] = document.getElementById(actionVar + "Tier");

    view.cached[actionVar + "RealX"] = document.getElementById(actionVar + "RealX");
    view.cached[actionVar + "RealY"] = document.getElementById(actionVar + "RealY");

    actionObj.downstreamVars.forEach(function(downstreamVar) {
        view.cached[actionVar+"NumInput"+downstreamVar] = document.getElementById(actionVar+"NumInput"+downstreamVar);

        view.cached[`${actionVar}DownstreamSendRate${downstreamVar}`] = document.getElementById(`${actionVar}DownstreamSendRate${downstreamVar}`);
    });
}


function createDownStreamSliders(actionObj) {
    let theStr = "";
    if(!actionObj.downstreamVars) {
        return "";
    }
    actionObj.downstreamVars.forEach(function(downstreamVar) {
        if(!data.actions[downstreamVar] || data.actions[downstreamVar].momentumName !== actionObj.momentumName) {
            return;
        }
        let title = data.actions[downstreamVar] ? data.actions[downstreamVar].title : downstreamVar;
        theStr +=
            "<div id='"+actionObj.actionVar+"SliderContainer"+downstreamVar+"' style='margin-bottom: 5px;margin-top:5px;font-size:12px;'>" +
            "<b><span style='margin-bottom: 10px;cursor:pointer;' onclick='actionTitleClicked(`"+downstreamVar+"`)'>"+title+"</span></b>" +
            " (+<b><span id='"+actionObj.actionVar+"DownstreamSendRate"+downstreamVar+"'>0</span></b>/s)<br>" +
            "<input type='number' id='"+actionObj.actionVar+"NumInput"+downstreamVar+"' value='0' min='0' max='100' oninput='validateInput(\""+actionObj.actionVar+"\", \""+downstreamVar+"\")' onchange='updateSlider(\""+actionObj.actionVar+"\", \""+downstreamVar+"\")' style='margin-right: 3px;font-size:10px;width:37px;'>" +
            "<input type='range' id='"+actionObj.actionVar+"RangeInput"+downstreamVar+"' value='0' min='0' max='100' oninput='updateNumber(\""+actionObj.actionVar+"\", \""+downstreamVar+"\")' style='margin-left:5px;width:200px;font-size:10px;height:5px;margin-bottom:8px;'>" +
            "</div>"

    });


    return theStr
}


function generateLinesBetweenActions() {
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
            const x1 = actionObj.realX + 160 + 4000; // 220 / 2
            const y1 = actionObj.realY + 80 + 4000; // 200 / 2
            const x2 = targetObj.realX + 160 + 4000; // 220 / 2
            const y2 = targetObj.realY + 80 + 4000; // 200 / 2

            let backgroundColor = getResourceColor(targetObj);
            let isDifferentResource = actionObj.momentumName !== targetObj.momentumName;
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