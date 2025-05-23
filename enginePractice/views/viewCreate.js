

function initializeDisplay() {
    //auto generate elements
    setRealCoordinates('overclock'); //associate all parent/children and give them an x/y
    setRealCoordinates('overclockTargetingTheLich');
    data.actionNames.forEach(function (actionVar) { //wait until they are all created to link downstreams
        generateActionDisplay(actionVar);
    })
    generateLinesBetweenActions();
    actionUpdateAllStatMults();
    actionTitleClicked(`overclock`);
    initializeMenus();
    initializeToasts();
    generateAmuletContent();
    setAllCaches(); //happens after generation

    debug(); //change game for easier debugging

    updateUIFromLoad(); //update the elements after create
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
        "<div id='"+statVar+"StatContainer' style='position:relative;cursor:pointer' onclick='clickedStatName(\""+statVar+"\")'>"+
        "<b><span id='"+statVar+"Name' style='width:140px;display:inline-block;'>" + decamelize(statVar) + "</span></b>" +
        "<b><span id='"+statVar+"Num' style='width:70px;display:inline-block'>"+statObj.num+"</span></b>" +
        "<span style='width:70px;display:inline-block'>x<b><span id='"+statVar+"Mult'>"+statObj.mult+"</span></b></span>" +
        "<span style='width:70px;display:inline-block'>+<b><span id='"+statVar+"PerMinute'>"+statObj.perMinute+"</span></b>/m</span>" +
        "</div>";

    let child = document.createElement("template");
    child.innerHTML = theStr;
    document.getElementById("statDisplay").appendChild(child.content);

}

function generateActionDisplay(actionVar) {
    let actionObj = data.actions[actionVar];
    let dataObj = actionData[actionVar];
    let theStr = "";
    let progressColor = getResourceColor(actionObj);

    let title =
        "<span id='"+actionVar+"Title' onclick='actionTitleClicked(`"+actionVar+"`)' style='font-size:16px;color:var(--text-primary);width:100%;cursor:pointer;position:absolute;top:-40px;" +
        "left:-1px;white-space: nowrap;border-width: 0 0 2px 2px;border-style: solid;border-color: var(--border-color);padding-left:2px;padding-right:2px;background-color:var(--overlay-color)'>" +
        "<b>" + actionObj.title + "</b>" +
        " | <span style='font-size:12px;position:relative;'>" +
        "Level <b></v><span id='"+actionVar+"Level'>0</span></b>" +
        (actionObj.maxLevel >= 0 ? " / <b><span id='"+actionVar+"MaxLevel'>0</span></b>" : "") +
            "<span id='"+actionVar+"HighestLevelContainer2'> (<b><span id='"+actionVar+"HighestLevel2'></span></b>)" +
        "</span>" +
        " | <span style='font-size:12px;'><b><span id='"+actionVar+"Efficiency'></span></b>% eff</span>" +
        (!actionObj.wage ? "" : " | <b>$<span id='"+actionVar+"Wage' style='color:var(--wage-color)'></span></b>") +
        "</span>" +
        "</span>";

    let menuContainer =
        "<div id='' style='position:absolute;top:-18px;font-size:13px;left:-1px;'>" +
        (actionVar==="overclock"?"":"<span id='"+actionVar+"GoToParentButton' onclick='actionTitleClicked(\""+actionObj.parent+"\")' " +
            "class='buttonSimple' style='margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;'>^</span>") +
        "<span id='"+actionVar+"_downstreamMenuButton' onclick='clickActionMenu(\""+actionVar+"\", \"downstream\")' class='buttonSimple' style='margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;'>Downstream</span>" +
        "<span id='"+actionVar+"_infoMenuButton' onclick='clickActionMenu(\""+actionVar+"\", \"info\")' class='buttonSimple' style='margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;'>Info</span>" +
        "<span id='"+actionVar+"_statsMenuButton' onclick='clickActionMenu(\""+actionVar+"\", \"stats\")' class='buttonSimple' style='margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;'>Stats</span>" +
        "<span id='"+actionVar+"_storyMenuButton' onclick='clickActionMenu(\""+actionVar+"\", \"story\")' class='buttonSimple' style='margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;'>Story</span>" +
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
        (actionObj.isGenerator?"(x<b><span id='"+actionVar+"ActionPowerMult'></b> total Action Power from level)<br>":"") +
        actionObj.onLevelText;

    let upgradeInfoText = "<br><span id='"+actionVar+"HighestLevelContainer' style='display:none'>Highest level (2x up to): <b><span id='"+actionVar+"HighestLevel'></span></b></span>" +
        "<span id='"+actionVar+"SecondHighestLevelContainer' style='display:none'>Second Highest level (2x up to): <b><span id='"+actionVar+"SecondHighestLevel'></span></b></span>" +
        "<span id='"+actionVar+"ThirdHighestLevelContainer' style='display:none'>Third Highest level (2x up to): <b><span id='"+actionVar+"ThirdHighestLevel'></span></b></span>" +
        "<span id='"+actionVar+"PrevUnlockTimeContainer' style='display:none'>Previous Unlock Time: <b><span id='"+actionVar+"PrevUnlockTime'></span></span></b>";
    //highest level and unlock timer
    //actionObj.prevUnlockTime

    let levelInfoContainer =
        "<div id='"+actionVar+"_infoContainer' style='display:none;padding:3px;'>" +
        onComplete +
        onLevelText +
        upgradeInfoText +
        actionObj.extraInfo+""+
        "</div>";

    let storyContainer =
        "<div id='"+actionVar+"_storyContainer' style='display:none;padding:5px;height:220px;overflow-y:auto;'>" +
        (dataObj.storyText ? dataObj.storyText[language]:"") +
        "</div>";

    let onLevelStatsText = "<br>On Level Up:<br>";
    if(actionObj.onLevelStats) {
        actionObj.onLevelStats.forEach(function(onLevelStat) {
            onLevelStatsText += "+<b>"+onLevelStat[1]+" " + capitalizeFirst(onLevelStat[0])+"</b><br>";
        });
    }

    let statsContainer =
        "<div id='"+actionVar+"_statsContainer' style='display:none;padding:3px;'>" +
        generateActionExpStats(actionObj) +
        generateActionEfficiencyStats(actionObj) +
        onLevelStatsText +
        "</div>";

    let lockOverAll = "<div id='"+actionVar+"LockContainer' " +
        "style='position:absolute;background-color: var(--bg-secondary);width:100%;height:100%;top:0;left:0;text-align:center;'>" +
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
        (actionObj.isGenerator?"":("<div style='margin:3px;font-size:10px;'>Progress/s = "+actionObj.tierMult()*100+"% of "+actionObj.momentumName+" * efficiency:</div>")) +
        "+<b><span id='"+actionVar+"MomentumIncrease'></span></b>/s, " +
        "-<b><span id='"+actionVar+"MomentumDecrease'></span></b>/s, "  +
        "Δ<b><span id='"+actionVar+"MomentumDelta'>1.0</span></b>/s, Balance:" +
        "</div>";

    let balanceNeedle =
        "<div style='position:relative;width:100%;height:10px;border-top:1px solid;'>" +
            "<div style='position:absolute;top:0;left:50%;width:2px;height:100%;background-color:var(--text-primary);opacity:0.5;'></div>" +
            "<div id='"+actionVar+"BalanceNeedle' style='position:absolute;top:-3px;width:2px;height:16px;background-color:red;left:50%;'></div>" +
        "</div>";



    let pbar =
        "<div id='"+actionVar+"ProgressBarOuter' style='width:100%;height:16px;position:relative;text-align:left;border-top:1px solid;border-bottom:1px solid;'>" +
        "<div id='"+actionVar+"ProgressBarInner' style='width:30%;background-color:"+progressColor+";height:100%;position:absolute;'></div>" +
        "<div id='"+actionVar+"ProgressNumContainer' style='position:absolute;top:1px;left:4px;width:97%'><b></v>" +
        "<span id='"+actionVar+"Progress'>0</span></b> / " +
        "<b><span id='"+actionVar+"ProgressMax'>1</span></b> progress " +
        "(+<b><span id='"+actionVar+"ProgressGain'>1</span></b>/s)" +
        "<span style='color:grey;position:absolute;right:0'>x<b><span id='"+actionVar+"ProgressMaxIncrease'>1</span></b> / lvl</span>" +
        "</div>" +
        "</div>";
    let expBar =
        "<div id='"+actionVar+"ExpBarOuter' style='width:100%;height:16px;position:relative;text-align:left;border-bottom:1px solid;'>" +
        "<div id='"+actionVar+"ExpBarInner' style='width:30%;background-color:var(--exp-color);height:100%;position:absolute'></div>" +
        "<div id='"+actionVar+"ExpNumContainer' style='position:absolute;top:1px;left:4px;width:97%'><b></v>" +
        "<span id='"+actionVar+"Exp'>0</span></b> / " +
        "<b><span id='"+actionVar+"ExpToLevel'>1</span></b> exp" +
        "<span style='color:grey;position:absolute;right:0'>x<b><span id='"+actionVar+"ExpToLevelIncrease'>1</span></b> / lvl</span>" +
        "</div>" +
        "</div>";
    let maxLevel =
        "<div id='"+actionVar+"IsMaxLevel' style='position:absolute;display:none;left:104px;top:71px;color:var(--max-level-color);font-size:18px;'><b>MAX LEVEL</b></div>";


    let downstreamContainer =
        "<div id='"+actionVar+"_downstreamContainer' style='padding:10px;display:none;'>" +
        "<div id='"+actionVar+"_downstreamButtonContainer'>" +
            (actionVar==="overclock"?("Send up to (10% * efficiency of momentum)/s downstream: <br>"):"") +
            createDownStreamSliders(actionObj) +
            "<span id='"+actionVar+"AllZeroButton' onclick='toggleAllZero(\""+actionVar+"\")' class='buttonSimple' style='margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;'>All 0</span>" +
            "<span id='"+actionVar+"AllEqualButton' onclick='toggleAllHundred(\""+actionVar+"\")' class='buttonSimple' style='margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;'>All 100</span>" +
            "<div>Total "+actionObj.momentumName+" sending downstream: <b><span id='"+actionVar+"TotalSend'>1</span></b>/s</div>"
        + "</div></div>";

    let newX = actionObj.realX;
    let newY = actionObj.realY;

    let shouldDisplay = "none"; //gameStateMatches(actionObj) ? "" : "none";

    theStr +=
        "<div id='"+actionVar+"Container' style='display:"+shouldDisplay+";position:absolute;left:"+newX+"px;top:"+newY+"px;width:300px;'>" +
            "<div id='"+actionVar+"LargeVersionContainer' style='border:2px solid var(--border-color);background-color:var(--bg-secondary);'>" +
                title +
                menuContainer +
                momentumContainer +
                balanceNeedle +
                pbar +
                expBar +
                maxLevel +
                storyContainer +
                statsContainer +
                levelInfoContainer +
                downstreamContainer +
                lockOverAll +
            "</div>" +
            "<div id='"+actionVar+"SmallVersionContainer' style='display:none;text-align:center;margin:50px auto;font-size:12px;width:100px;'>" +
                "<b><span style='font-size:16px'>" + actionObj.title + "</span></b><br>" +
                "Level <b><span id='"+actionVar+"Level2'></b>" +
            "</div>" +
        "</div>";



    let child = document.createElement("template");
    child.innerHTML = theStr;
    document.getElementById("actionContainer").appendChild(child.content);


    let lockIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    lockIcon.setAttribute('class', 'lock-icon');
    lockIcon.setAttribute('viewBox', '0 0 24 24');
    lockIcon.setAttribute('fill', 'var(--text-primary)');

    let lockPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    lockPath.setAttribute('d', 'M12 2C9.24 2 7 4.24 7 7v5H6c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7c0-1.1-.9-2-2-2h-1V7c0-2.76-2.24-5-5-5zm1 12.5c0 .83-.67 1.5-1.5 1.5S10 15.33 10 14.5V13h3v1.5zM12 4c1.66 0 3 1.34 3 3v5H9V7c0-1.66 1.34-3 3-3z');

    lockIcon.appendChild(lockPath);
    document.getElementById(actionVar+"LockIcon").appendChild(lockIcon);
}

function generateActionExpStats(actionObj) {
    let actionVar = actionObj.actionVar;
    let expStatsStr = "<span id='"+actionVar+"StatExpContainer'>Stat Modifiers to Exp Required:<br>";

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
    return expStatsStr;
}

function generateActionEfficiencyStats(actionObj) {
    let actionVar = actionObj.actionVar;

    let expertiseModsStr = "<span id='"+actionVar+"StatExpertiseContainer'><br>Stat Modifiers to Efficiency:<br>";

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
    expertiseModsStr += "</span>";
    return expertiseModsStr;
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
                " (+<b><span id='"+actionObj.actionVar+"DownstreamSendRate"+downstreamVar+"'>0</span></b>/s)" +
                " <b><span id='"+actionObj.actionVar+"DownstreamAttentionBonusLoop"+downstreamVar+"' class='hyperVisible' style='color:mediumpurple;display:none;'>x1.00</span></b>" +
                " <b><span id='"+actionObj.actionVar+"DownstreamAttentionBonus"+downstreamVar+"' class='hyperVisible' style='color:yellow;display:none;'>x2</span></b><br>" +
                "<input type='number' id='"+actionObj.actionVar+"NumInput"+downstreamVar+"' value='0' min='0' max='100' " +
                    "oninput='validateInput(\""+actionObj.actionVar+"\", \""+downstreamVar+"\")' onchange='downstreamNumberChanged(\""+actionObj.actionVar+"\", \""+downstreamVar+"\")' style='margin-right: 3px;font-size:10px;width:37px;'>" +
                "<input type='range' id='"+actionObj.actionVar+"RangeInput"+downstreamVar+"' value='0' min='0' max='100' " +
                    "oninput='downstreamSliderChanged(\""+actionObj.actionVar+"\", \""+downstreamVar+"\")' style='margin-left:5px;width:200px;font-size:10px;height:5px;margin-bottom:8px;'>" +
            "</div>"

    });

    return theStr;
}


function highlightLine(borderId) {
    const line = document.getElementById(borderId);
    let miniVersion = scale < .35;
    if (line) {
        if(miniVersion) {
            line.style.boxShadow = '0 0 40px 11px yellow';
        } else {
            line.style.boxShadow = '0 0 18px 5px yellow';
        }
        line.querySelector(".line-label-top").style.opacity = "1";
    }
}
function unhighlightLine(borderId) {
    const line = document.getElementById(borderId);
    if (line) {
        line.style.boxShadow = '';
        line.querySelector(".line-label-top").style.opacity = "0";
    }
}


function handleLineClick(borderId, lineData) {
    const existingIndex = data.attentionSelected.findIndex(entry => entry.borderId === borderId);

    if (existingIndex !== -1) {
        unhighlightLine(borderId);
        data.attentionSelected.splice(existingIndex, 1);
    } else {
        if (data.attentionSelected.length >= data.maxAttentionAllowed) {
            const removed = data.attentionSelected.shift();
            unhighlightLine(removed.borderId);
        }
        data.attentionSelected.push({ borderId, lineData });
        highlightLine(borderId);
    }
}

function getLabelOrientation(angle) {
    const norm = ((angle % 360) + 360) % 360;

    if ((norm >= 60 && norm <= 120) || (norm >= 240 && norm <= 300)) {
        return "vertical"; // counter-rotate
    } else if (norm > 120 && norm < 240) {
        return "flipped"; // upside-down, but visually consistent
    } else {
        return "horizontal";
    }
}


function generateLinesBetweenActions() {
    data.actionNames.forEach(function (actionVar) {
        let actionObj = data.actions[actionVar];
        if(!actionObj.downstreamVars) {
            return;
        }
        actionObj.downstreamVars.forEach(function(downstreamVar, index) {
            let downstreamObj = data.actions[downstreamVar];
            if(!downstreamObj || downstreamObj.realX === undefined || actionObj.realX === undefined) {
                return;
            }
            // Calculate the centers of each object
            const x1 = actionObj.realX + 155; // 220 / 2
            const y1 = actionObj.realY + 80; // 200 / 2
            const x2 = downstreamObj.realX + 155; // 220 / 2
            const y2 = downstreamObj.realY + 80; // 200 / 2

            let sourceBackgroundColor = getResourceColor(actionObj);
            let targetBackgroundColor = getResourceColor(downstreamObj);
            let isDifferentResource = actionObj.momentumName !== downstreamObj.momentumName;
            let backgroundColor = isDifferentResource ? `linear-gradient(to right, ${sourceBackgroundColor}, ${targetBackgroundColor})` : 'var(--line-color)';

            let borderId = `${actionVar}_${downstreamObj.actionVar}_Line_Outer`;
            let lineId = actionVar+`_`+downstreamObj.actionVar+`_Line_Inner`;

            //Rotated retangle with inner line ready to adjust width of.
            let length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            let angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

            const labelMode = getLabelOrientation(angle);

            let topTransform = "translateX(-50%)";
            let bottomTransform = "translateX(-50%)";
            let topY = "-12px";
            let bottomY = "12px";
            let lineTransform = "translateY(-50%) translateY(10px)";
            let labelWrapperTransform = "";

            if (labelMode === "vertical") {
                labelWrapperTransform = `rotate(${-angle}deg)`;
                topY = "";
                bottomY = "";
            } else if (labelMode === "flipped") {
                labelWrapperTransform = `rotate(180deg)`;
            } else {
                labelWrapperTransform = "";
            }

            let isDifferentMomentum = actionObj.momentumName !== downstreamObj.momentumName;
            let onclickText = isDifferentMomentum?``:`handleLineClick('${borderId}', {from: '${actionVar}', to: '${downstreamObj.actionVar}'})`;
            let cursorStyle = isDifferentMomentum?``:`cursor:pointer`;

            let lineHTML = Raw.html`
                <div id="${borderId}" class="line-connection" 
                     style="${cursorStyle}; display:flex; align-items: center; position: absolute; width: ${length}px; height: 20px; background: ${backgroundColor}; opacity: 1; transform-origin: 0 50%; transform: rotate(${angle}deg); left: ${x1}px; top: ${y1}px;"
                     onclick="${onclickText}">
                     
                    <div id="${lineId}" style="transform:${lineTransform}; width: 100%; height: 0px; background-color: ${targetBackgroundColor}; position: relative;text-align:center;">
                        <div id="${lineId}_Container" style="display: flex;position: absolute;left: 50%;top: 50%;
                            transform: translate(-50%, -50%) ${labelWrapperTransform};flex-direction: column;align-items: center;pointer-events: none;">
                            <div id="${lineId}_Top" class="line-label-top hyperVisible" style="opacity:0;position:relative;color: yellow;font-size: 14px;font-weight: bold;line-height: 1;top:${topY}">
                                x10
                            </div>
                            <div id="${lineId}_Bottom" class="line-label-bottom hyperVisible" style="position:relative;color:mediumpurple;font-size: 12px;font-weight: bold;line-height: 1;top:${bottomY}">
                                x1.00
                            </div>
                        </div>
                    </div>
                </div>`;

            document.getElementById("lineContainer").insertAdjacentHTML("beforeend", lineHTML);
        });
    });
}

function generateAmuletContent() {
    let amuletContent = "";

    for (let upgradeVar in data.upgrades) {
        let upgrade = data.upgrades[upgradeVar];

        // Start a new row for each upgrade
        amuletContent += "<div id='"+upgradeVar+"Container' style='margin-bottom:10px;'>";
        amuletContent += "<div style='width:100%;font-size:16px;margin-bottom:5px;'>..." + decamelize(upgradeVar) + "</div>";

        // Generate buttons for available upgrades
        for (let i = 0; i < upgrade.upgradesAvailable; i++) {
            let id = upgradeVar+"Button"+i;
            let cost = intToString(calcUpgradeCost(upgrade, i),1);
            amuletContent += "<button class='upgradeButton' id='"+id+"'" +
                " style='background:var(--upgrade-color); color:black;'" +
                " onClick='selectBuyUpgrade(\"" + upgradeVar + "\", " + i + ")'><b>" +
                cost +
                "</b></button>";
        }
        amuletContent += "</div>";
    }

    document.getElementById("amuletUpgrades").innerHTML = amuletContent;
}




function setAllCaches() {
    setSingleCaches();
    data.statNames.forEach(function (statVar) {
        cacheStatNames(statVar);
    });
    data.actionNames.forEach(function(actionVar) {
       cacheActionViews(actionVar);
       cacheDownstreamViews(actionVar);
    });
}

function setSingleCaches() {
    view.cached.totalMomentum = document.getElementById("totalMomentum");
    view.cached.totalMomentum2 = document.getElementById("totalMomentum2");
    view.cached.secondsPerReset = document.getElementById("secondsPerReset");
    view.cached.openUseAmuletButton = document.getElementById("openUseAmuletButton");
    view.cached.openViewAmuletButton = document.getElementById("openViewAmuletButton");
    view.cached.essence = document.getElementById("essence");
    view.cached.essence2 = document.getElementById("essence2");
    view.cached.bonusTime = document.getElementById("bonusTime");
    view.cached.killTheLichMenu = document.getElementById("killTheLichMenu");
    view.cached.statDisplay = document.getElementById("statDisplay");
    view.cached.bonusDisplay = document.getElementById("bonusDisplay");
}

function cacheStatNames(statVar) {
    view.cached[statVar+"StatContainer"] = document.getElementById(statVar+"StatContainer");
    view.cached[statVar+"Num"] = document.getElementById(statVar+"Num");
    view.cached[statVar+"PerMinute"] = document.getElementById(statVar+"PerMinute");
    view.cached[statVar+"Mult"] = document.getElementById(statVar+"Mult");
    view.cached[statVar+"Name"] = document.getElementById(statVar+"Name");

    data.actionNames.forEach(function(actionVar) {
        let actionObj = data.actions[actionVar];
        actionObj.efficiencyStats.forEach(function (expertiseStat) {
            let newStatVar = expertiseStat[0];
            view.cached[actionVar + "_" + newStatVar + "StatExpertiseMult"] = document.getElementById(actionVar + "_" + newStatVar + "StatExpertiseMult");
        });
        actionObj.expStats.forEach(function (expStat) {
            let newStatVar = expStat[0];
            view.cached[actionVar + "_" + newStatVar + "StatExpMult"] = document.getElementById(actionVar + "_" + newStatVar + "StatExpMult");
        });
    });
}

function cacheActionViews(actionVar) {
    //cache the created objects
    view.cached[actionVar + "Container"] = document.getElementById(actionVar + "Container");
    view.cached[actionVar + "LargeVersionContainer"] = document.getElementById(actionVar + "LargeVersionContainer");
    view.cached[actionVar + "SmallVersionContainer"] = document.getElementById(actionVar + "SmallVersionContainer");
    view.cached[actionVar + "_downstreamButtonContainer"] = document.getElementById(actionVar + "_downstreamButtonContainer");
    view.cached[actionVar + "_downstreamContainer"] = document.getElementById(actionVar + "_downstreamContainer");
    view.cached[actionVar + "_downstreamMenuButton"] = document.getElementById(actionVar + "_downstreamMenuButton");
    view.cached[actionVar + "_infoContainer"] = document.getElementById(actionVar + "_infoContainer");
    view.cached[actionVar + "_infoMenuButton"] = document.getElementById(actionVar + "_infoMenuButton");
    view.cached[actionVar + "_statsContainer"] = document.getElementById(actionVar + "_statsContainer");
    view.cached[actionVar + "_statsMenuButton"] = document.getElementById(actionVar + "_statsMenuButton");
    view.cached[actionVar + "_storyContainer"] = document.getElementById(actionVar + "_storyContainer");
    view.cached[actionVar + "_storyMenuButton"] = document.getElementById(actionVar + "_storyMenuButton");
    view.cached[actionVar + "ProgressMax"] = document.getElementById(actionVar + "ProgressMax");
    view.cached[actionVar + "Title"] = document.getElementById(actionVar + "Title");
    view.cached[actionVar + "Container"] = document.getElementById(actionVar + "Container");
    view.cached[actionVar + "LockContainer"] = document.getElementById(actionVar + "LockContainer");
    view.cached[actionVar + "Momentum"] = document.getElementById(actionVar + "Momentum");
    view.cached[actionVar + "MomentumDelta"] = document.getElementById(actionVar + "MomentumDelta");
    view.cached[actionVar + "ProgressBarInner"] = document.getElementById(actionVar + "ProgressBarInner");
    view.cached[actionVar + "Progress"] = document.getElementById(actionVar + "Progress");
    view.cached[actionVar + "ProgressMax"] = document.getElementById(actionVar + "ProgressMax");
    view.cached[actionVar + "ProgressGain"] = document.getElementById(actionVar + "ProgressGain");
    view.cached[actionVar + "ProgressMaxIncrease"] = document.getElementById(actionVar + "ProgressMaxIncrease");
    view.cached[actionVar + "IsMaxLevel"] = document.getElementById(actionVar + "IsMaxLevel");
    view.cached[actionVar + "BalanceNeedle"] = document.getElementById(actionVar + "BalanceNeedle");
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
    view.cached[actionVar + "Level2"] = document.getElementById(actionVar + "Level2");
    view.cached[actionVar + "HighestLevelContainer"] = document.getElementById(actionVar + "HighestLevelContainer");
    view.cached[actionVar + "HighestLevelContainer2"] = document.getElementById(actionVar + "HighestLevelContainer2");
    view.cached[actionVar + "SecondHighestLevelContainer"] = document.getElementById(actionVar + "SecondHighestLevelContainer");
    view.cached[actionVar + "ThirdHighestLevelContainer"] = document.getElementById(actionVar + "ThirdHighestLevelContainer");
    view.cached[actionVar + "HighestLevel"] = document.getElementById(actionVar + "HighestLevel");
    view.cached[actionVar + "SecondHighestLevel"] = document.getElementById(actionVar + "SecondHighestLevel");
    view.cached[actionVar + "ThirdHighestLevel"] = document.getElementById(actionVar + "ThirdHighestLevel");
    view.cached[actionVar + "HighestLevel2"] = document.getElementById(actionVar + "HighestLevel2");
    view.cached[actionVar + "PrevUnlockTime"] = document.getElementById(actionVar + "PrevUnlockTime");
    view.cached[actionVar + "PrevUnlockTimeContainer"] = document.getElementById(actionVar + "PrevUnlockTimeContainer");
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
    view.cached[actionVar + "Wage"] = document.getElementById(actionVar + "Wage");


    view.cached[actionVar + "RealX"] = document.getElementById(actionVar + "RealX");
    view.cached[actionVar + "RealY"] = document.getElementById(actionVar + "RealY");

    view.cached[actionVar+"StatExpertiseContainer"] = document.getElementById(actionVar+"StatExpertiseContainer");
    view.cached[actionVar+"StatExpContainer"] = document.getElementById(actionVar+"StatExpContainer");
}

function cacheDownstreamViews(actionVar) {
    let actionObj = data.actions[actionVar];
    actionObj.downstreamVars.forEach(function(downstreamVar) {
        view.cached[actionVar+"NumInput"+downstreamVar] = document.getElementById(actionVar+"NumInput"+downstreamVar);

        view.cached[`${actionVar}DownstreamSendRate${downstreamVar}`] = document.getElementById(`${actionVar}DownstreamSendRate${downstreamVar}`);
        view.cached[`${actionVar}DownstreamAttentionBonus${downstreamVar}`] = document.getElementById(`${actionVar}DownstreamAttentionBonus${downstreamVar}`);
        view.cached[`${actionVar}DownstreamAttentionBonusLoop${downstreamVar}`] = document.getElementById(`${actionVar}DownstreamAttentionBonusLoop${downstreamVar}`);

        view.cached[actionVar + "_" + downstreamVar + "_Line_Outer"] = document.getElementById(actionVar + "_" + downstreamVar + "_Line_Outer");
        view.cached[actionVar + "_" + downstreamVar + "_Line_Inner_Top"] = document.getElementById(actionVar + "_" + downstreamVar + "_Line_Inner_Top");
        view.cached[actionVar + "_" + downstreamVar + "_Line_Inner_Bottom"] = document.getElementById(actionVar + "_" + downstreamVar + "_Line_Inner_Bottom");
        view.cached[actionVar + "_" + downstreamVar + "_Line_Inner"] = document.getElementById(actionVar + "_" + downstreamVar + "_Line_Inner");
        view.cached[actionVar + "_" + downstreamVar + "_Line_Inner_Container"] = document.getElementById(actionVar + "_" + downstreamVar + "_Line_Inner_Container");
        view.cached[actionVar + "SliderContainer" + downstreamVar] = document.getElementById(actionVar + "SliderContainer" + downstreamVar);
    });
}