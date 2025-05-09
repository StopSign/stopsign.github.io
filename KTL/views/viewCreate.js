

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
    revealActionAtts(data.actions.reflect);

    debug(); //change game for easier debugging

    updateUIFromLoad(); //update the elements after create
}

function generateAttDisplay(attVar) {
    let attObj = data.atts[attVar];
    let theStr = "";
    attTitles.forEach(function (attTitle) {
        if(attTitle[1] === attVar) {
            theStr += ((attVar === "discipline") ? "" : "<br>") +"<div style='font-style: italic;'><u>"+attTitle[0]+"</u></div>";
        }
    });
    queueCache(`${attVar}AttContainer`);
    queueCache(`${attVar}Name`);
    queueCache(`${attVar}Num`);
    queueCache(`${attVar}Mult`);
    queueCache(`${attVar}PerMinute`);

    theStr +=
        `<div id="${attVar}AttContainer" style="position:relative;cursor:pointer" onclick="clickedAttName('${attVar}')">
            <b><span id="${attVar}Name" style="width:140px;display:inline-block;">${decamelize(attVar)}</span></b>
            <b><span id="${attVar}Num" style='width:70px;display:inline-block'>${attObj.num}</span></b>
            <span style="width:70px;display:inline-block">x<b><span id="${attVar}Mult">${attObj.mult}</span></b></span>
            <span style="width:70px;display:inline-block">+<b><span id="${attVar}PerMinute">${attObj.perMinute}</span></b>/m</span>
        </div>`;

    let child = document.createElement("template");
    child.innerHTML = theStr;
    document.getElementById("attDisplay").appendChild(child.content);

}

function generateActionDisplay(actionVar) {
    let actionObj = data.actions[actionVar];
    let dataObj = actionData[actionVar];
    let theStr = "";
    let resourceColor = getResourceColor(actionObj);

    queueCache(`${actionVar}Tier`);

    let title = Raw.html`
        <span onclick="actionTitleClicked('${actionVar}')" style="color:var(--text-primary);cursor:pointer;position:absolute;top:-77px;height:77px;left:0;
            white-space: nowrap;border-width: 0 0 0 6px;border-style: solid;border-color: var(--text-muted);padding-left:4px;background-color:var(--overlay-color)">
          
            <span style="font-size:18px;"><b>${actionObj.title}</b><br></span>
            <b><span style="font-size:16px;" id='${actionVar}Momentum'>0</span> 
            <span style="color:${resourceColor};font-size:14px;">${capitalizeFirst(actionObj.momentumName)}</span></b>
            <span style="font-size:14px;color:var(--text-muted)">${actionObj.isGenerator?`(+<b><span id="${actionVar}MomentumAdded">10</span></b>)`:""}</span><br>
            <span style="font-size:12px;position:relative;">
                Level <b><span id="${actionVar}Level">0</span></b>
                ${actionObj.maxLevel >= 0 ? ` / <b><span id='${actionVar}MaxLevel'>0</span></b>` : ""}
                <span id='${actionVar}HighestLevelContainer2'> 
                    (<b><span id='${actionVar}HighestLevel2'></span></b>)
                </span> | 
                <b><span id='${actionVar}Efficiency'></span></b>% efficiency
                ${!actionObj.wage ? "" : ` | <b>$<span id='${actionVar}Wage' style='color:var(--wage-color)'></span></b>`}
            </span>
        </span>
    `

    queueCache(`${actionVar}_downstreamMenuButton`);
    queueCache(`${actionVar}_infoMenuButton`);
    queueCache(`${actionVar}_attsMenuButton`);
    queueCache(`${actionVar}_storyMenuButton`);

    let menuContainer = Raw.html`
        <div style="position:absolute;top:-18px;font-size:13px;left:3px;">
        ${actionVar==="overclock"?"":`<span id="${actionVar}GoToParentButton" onclick="actionTitleClicked('${actionObj.parent}')" 
            class="buttonSimple" style="margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;">^</span>`}
        <span id="${actionVar}_downstreamMenuButton" onclick="clickActionMenu('${actionVar}', 'downstream')" class="buttonSimple" 
            style="margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;">Downstream</span>
        <span id="${actionVar}_infoMenuButton" onclick="clickActionMenu('${actionVar}', 'info')" class="buttonSimple" 
            style="margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;">Info</span>
        <span id="${actionVar}_attsMenuButton" onclick="clickActionMenu('${actionVar}', 'atts')" class="buttonSimple" 
            style="margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;">Stats</span>
        <span id="${actionVar}_storyMenuButton" onclick="clickActionMenu('${actionVar}', 'story')" class="buttonSimple" 
            style="margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;">Story</span>
        </div>`;

    let momentumContainer = Raw.html`
    <div id="${actionVar}MomentumContainer" style='padding:3px 3px 0;'>
        <div style="font-style: italic; color: var(--text-muted);">
            <span style="display:inline-block;width:60px;"><u>Increase</u></span>
            <span style="display:inline-block;width:60px;"><u>Decrease</u></span>
            <span style="display:inline-block;width:60px;"><u>Change</u></span>
        </div>
        <div>
            <span style="display:inline-block;width:60px;white-space: nowrap;">+<b><span id="${actionVar}MomentumIncrease"></span></b>/s</span>
            <span style="display:inline-block;width:60px;white-space: nowrap;">-<b><span id="${actionVar}MomentumDecrease"></span></b>/s</span>
            <span style="display:inline-block;width:60px;white-space: nowrap;">Δ<b><span id="${actionVar}MomentumDelta"></span></b>/s</span>
        </div>
    </div>`;

    let balanceNeedle =
        Raw.html`
        <div style="color:var(--text-muted)">Change Ratio:</div>
        <div style="position:relative;width:100%;height:10px;">
            <div style="position:absolute;top:-2px;width:100%;height:10px;border-top:1px solid;">
                <div style="position:absolute;top:0;left:25%;width:2px;height:100%;background-color:var(--text-primary);opacity:0.6;"></div> 
                <div style="position:absolute;top:0;left:50%;width:2px;height:100%;background-color:var(--text-primary);opacity:0.6;"></div> 
                <div style="position:absolute;top:0;left:75%;width:2px;height:100%;background-color:var(--text-primary);opacity:0.6;"></div> 
                <div id="${actionVar}BalanceNeedle" style="position:absolute;top:-3px;width:2px;height:16px;background-color:red;left:50%;"></div>
                <span style="color:var(--text-muted);position:absolute;left:25%;top:0;font-size:10px;transform:translateX(-100%);">x1</span>
                <span style="color:var(--text-muted);position:absolute;left:50%;top:0;font-size:10px;transform:translateX(-100%);">x2</span>
                <span style="color:var(--text-muted);position:absolute;left:75%;top:0;font-size:10px;transform:translateX(-100%);">x10</span>
                <span style="color:var(--text-muted);position:absolute;left:100%;top:0;font-size:10px;transform:translateX(-100%);">x100</span>
            </div>
        </div>`;

    let pbar = Raw.html`
        <div id="${actionVar}ProgressBarOuter" style="width:100%;height:16px;position:relative;text-align:left;border-top:1px solid;border-bottom:1px solid;">
            <div id="${actionVar}ProgressBarInner" style="width:30%;background-color:${resourceColor};height:100%;position:absolute;"></div>
            <div id="${actionVar}ProgressNumContainer" style="position:absolute;top:1px;left:4px;width:97%"><b></v>
                <span id="${actionVar}Progress">0</span></b> / 
                <b><span id="${actionVar}ProgressMax">1</span></b> progress 
                (+<b><span id="${actionVar}ProgressGain">1</span></b>/s)
                <span style="color:grey;position:absolute;right:0">x<b><span id="${actionVar}ProgressMaxIncrease">1</span></b> / lvl</span>
            </div>
        </div>`;

    let expBar = Raw.html`
        <div id="${actionVar}ExpBarOuter" style="width:100%;height:16px;position:relative;text-align:left;border-bottom:1px solid;">
            <div id="${actionVar}ExpBarInner" style="width:30%;background-color:var(--exp-color);height:100%;position:absolute"></div>
            <div id="${actionVar}ExpNumContainer" style="position:absolute;top:1px;left:4px;width:97%"><b></v>
                <span id="${actionVar}Exp">0</span></b> / 
                <b><span id="${actionVar}ExpToLevel">1</span></b> exp
                <span style="color:grey;position:absolute;right:0">x<b><span id="${actionVar}ExpToLevelIncrease">1</span></b> / lvl</span>
            </div>
        </div>`;

    let maxLevel = Raw.html`
        <div id="${actionVar}IsMaxLevel" class="hyperVisible" 
            style="position:absolute; display:none;left:104px;top:66px;color:var(--max-level-color);font-size:18px;">
            <b>MAX LEVEL</b>
        </div>`

    title = title + generateOnLevelContainers(actionObj);



    let onComplete = Raw.html`
        <div id="${actionVar}OnCompleteContainer">On Complete:<br>
            +<b><span id="${actionVar}ExpToAdd">1</span></b> Exp<br>
            ${actionObj.onCompleteText}
        </div><br>`;

    let onLevelText = Raw.html`
        On Level up:<br>
        ${actionObj.isGenerator?"":`x<b>${actionObj.progressMaxIncrease}</b> to progress required to complete<br>`}
        x<b>${actionObj.expToLevelIncrease}</b> to Exp required to level<br>
        ${actionObj.actionPowerMultIncrease===1?"":(`x<b>${actionObj.actionPowerMultIncrease}</b> to Action Power per level <br>`)}
        ${!actionObj.isGenerator?"":`(x<b><span id="${actionVar}ActionPowerMult"></b> total Action Power from level)<br>`}
        ${actionObj.onLevelText}`;

    let upgradeInfoText = Raw.html`<br>
        <span id="${actionVar}HighestLevelContainer" style="display:none">
            Highest level (2x up to): <b><span id="${actionVar}HighestLevel"></span></b>
        </span>
        <span id="${actionVar}SecondHighestLevelContainer" style="display:none">
            Second Highest level (2x up to): <b><span id="${actionVar}SecondHighestLevel"></span></b>
        </span>
        <span id="${actionVar}ThirdHighestLevelContainer" style="display:none">
            Third Highest level (2x up to): <b><span id="${actionVar}ThirdHighestLevel"></span></b>
        </span>
        <span id="${actionVar}PrevUnlockTimeContainer" style="display:none">
            Previous Unlock Time: <b><span id="${actionVar}PrevUnlockTime"></span></b>
        </span>`;


    let levelInfoContainer = Raw.html`
            <div id="${actionVar}_infoContainer" style="display:none;padding:3px;">
        Tier <b><span id="${actionVar}Tier"></span></b>${actionObj.isGenerator ? " Generator" : " Action"}<br>
        ${actionObj.isGenerator?"":(`Consume and send rate is ${actionObj.tierMult()*100}% of ${actionObj.momentumName} * efficiency.<br>`)}<br>
        ${onComplete}
        ${onLevelText}
        ${upgradeInfoText}
        ${actionObj.extraInfo}
        </div>`;

    let storyContainer = Raw.html`
        <div id="${actionVar}_storyContainer" style="display:none;padding:5px;height:220px;overflow-y:auto;">
            ${dataObj.storyText ? dataObj.storyText[language]:""}
        </div>`;

    let onLevelAttsText = `<br>On Level Up:<br>`;
    if(actionObj.onLevelAtts) {
        actionObj.onLevelAtts.forEach(function(onLevelStat) {
            onLevelAttsText += `+<b>${onLevelStat[1]} to ${capitalizeFirst(onLevelStat[0])}</b><br>`;
        });
    }

    let attsContainer = Raw.html`
        <div id="${actionVar}_attsContainer" style="display:none;padding:3px;">
            ${generateActionExpAtts(actionObj)}
            ${generateActionEfficiencyAtts(actionObj)}
            ${onLevelAttsText}
        </div>`;

    let lockOverAll = Raw.html`
        <div id="${actionVar}LockContainer" 
            style="position:absolute;background-color: var(--bg-secondary);width:100%;height:100%;top:0;left:0;text-align:center;border:2px solid black;">
            <span id="${actionVar}LockIcon"></span><br>
            <span>Needs <b><span id="${actionVar}UnlockCost">0</span></b> ${actionObj.momentumName}<br>
                sent from <b>${data.actions[actionObj.parent]?data.actions[actionObj.parent].title:"WAIT"}</b>.<br>
                ${actionObj.unlockMessage}
            </span>
        </div>`;

    queueCache(`${actionVar}_downstreamContainer`);
    queueCache(`${actionVar}_downstreamButtonContainer`);
    queueCache(`${actionVar}TotalSend`);

    let downstreamContainer = Raw.html`
        <div id="${actionVar}_downstreamContainer" style="padding:10px;display:none;">
            <div id="${actionVar}_downstreamButtonContainer">
                ${createDownStreamSliders(actionObj)}
                <span onclick="toggleAllZero('actionVar')" 
                    class="buttonSimple" style="margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;">All 0</span>
                <span onclick="toggleAllHundred('actionVar')" 
                    class="buttonSimple" style="margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;">All 100</span>
                <div>Total ${actionObj.momentumName} sending downstream: <b><span id='${actionVar}TotalSend'>1</span></b>/s</div>
            </div>
        </div>`;

    let newX = actionObj.realX +"px";
    let newY = actionObj.realY +"px";

    let shouldDisplay = "none"; //gameStateMatches(actionObj) ? "" : "none";

    queueCache(`${actionVar}Container`)
    queueCache(`${actionVar}LargeVersionContainer`)
    queueCache(`${actionVar}SmallVersionContainer`)
    queueCache(`${actionVar}Level2`)

    theStr += Raw.html`
        <div id="${actionVar}Container" style="display:${shouldDisplay};position:absolute;left:${newX};top:${newY};width:300px;">
            <div id="${actionVar}LargeVersionContainer" style="border:2px solid var(--border-color);background-color:var(--bg-secondary);">
                ${title}
                ${menuContainer}
                ${momentumContainer}
                ${balanceNeedle}
                ${pbar}
                ${expBar}
                ${maxLevel}
                ${storyContainer}
                ${attsContainer}
                ${levelInfoContainer}
                ${downstreamContainer}
                ${lockOverAll}
            </div>
            <div id="${actionVar}SmallVersionContainer" style="display:none;text-align:center;margin:50px auto;font-size:12px;width:100px;">
                <b><span style="font-size:16px">${actionObj.title}</span></b><br>
                Level <b><span id="${actionVar}Level2"></b>
            </div>
        </div>`;



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

function generateOnLevelContainers(actionObj) {
    let actionVar = actionObj.actionVar;
    let dataObj = actionData[actionVar];
    let theStr = "";

    if(dataObj.onLevelAtts.length > 0) {
        theStr += Raw.html`
            <span style="font-size:10px;color:var(--text-primary);position:absolute;
                top:0;left:299px;white-space: nowrap;padding-left:8px;">`
        //padding-left to make it overlap by 1 pix on the main container, so it redraws on zoom correctly.

        for(let onLevelAtt of dataObj.onLevelAtts) {
            theStr += generateOutsideAttDisplay(actionObj, onLevelAtt, "add");
        }


        theStr += `</span>`
    }
    if(dataObj.expAtts.length > 0 || dataObj.efficiencyAtts.length > 0) {
        theStr += Raw.html`
            <span style="font-size:10px;color:var(--text-primary);position:absolute;
                top:0;right:299px;white-space: nowrap;padding-right:8px;">`

        for(let onLevelAtt of dataObj.expAtts) {
            theStr += generateOutsideAttDisplay(actionObj, onLevelAtt, "exp");
        }
        for(let onLevelAtt of dataObj.efficiencyAtts) {
            theStr += generateOutsideAttDisplay(actionObj, onLevelAtt, "eff");
        }
        theStr += `</span>`;
    }

    return theStr;
}

function generateOutsideAttDisplay(actionObj, attObj, type) {
    let actionVar = actionObj.actionVar;
    let statName = attObj[0];
    let statValue = attObj[1];

    let startDisplayed = type === "add"?"":"none";
    let color = type === "add"
        ? "--attribute-add-color"
        : (type === "exp"
            ? "--attribute-use-exp-color"
            : "--attribute-use-eff-color");

    let backgroundColor = type === "add"
        ? "--attribute-add-bg-color"
        : (type === "exp"
            ? "--attribute-use-exp-bg-color"
            : "--attribute-use-eff-bg-color");

    let text = type === "add"
        ? "+" + intToString(statValue, 1)
        : (statValue * 100) + "%";

    let tooltipText;

    if (type === "add") {
        tooltipText = `${text} to ${capitalizeFirst(statName)}`;
    } else if (type === "eff") {
        tooltipText = `${text} of ${capitalizeFirst(statName)}'s bonus is multiplied to base efficiency`;
    } else if (type === "exp") {
        let target = actionObj.isGenerator ? "exp to level" : "progress to complete";
        tooltipText = `${text} of ${capitalizeFirst(statName)} bonus reduces ${target}`;
    }
    queueCache(`${actionVar}${statName}OutsideContainer${type}`);


    return Raw.html`
        <div id="${actionVar}${statName}OutsideContainer${type}" onclick="clickedAttName('${statName}')" 
             style="display:${startDisplayed};border:1px solid var(${color});margin-bottom:2px;cursor:pointer;background-color:var(--overlay-color);padding:1px;">
            <div class="showthat" style="position:relative;width:30px;height:30px;background-color:var(${backgroundColor});">
                <div class="showthisUp" style="font-size:18px;">${tooltipText}</div>
                <img src="img/${statName}.svg" alt="${statName}" style="width:100%;height:100%;" />
                <div class="hyperVisible" style="position:absolute;bottom:0;left:0;width:100%;height:50%;display:flex;align-items:flex-end;
                justify-content:center;font-weight:bold;font-size:10px;">${text}</div>
            </div>
        </div>`;
}

function generateActionExpAtts(actionObj) {
    let actionVar = actionObj.actionVar;
    let dataObj = actionData[actionVar];
    queueCache(`${actionVar}AttExpContainer`);
    let expAttsStr =
        `<span id="${actionVar}AttExpContainer">Stat Modifiers to ${actionObj.isGenerator?"Exp":"Progress"}:<br>`;

    for(let attObj of dataObj.expAtts) {
        let name = attObj[0];
        if(!data.atts[name]) {
            console.log("Error - missing stat in initialization: " + name);
        }
        queueCache(`${actionVar}AttExpContainer`);
        expAttsStr +=
            `<b>100%</b> of <b>${capitalizeFirst(name)}</b>'s bonus = x<b><span id="${actionVar}_${name}AttExpMult">1</span></b><br>`
    }

    queueCache(`${actionVar}AttReductionEffect`);
    expAttsStr +=
            `Total Reduction = 1 / <b><span id="${actionVar}AttReductionEffect">1</span></b><br>
        </span>`;
    return expAttsStr;
}

function generateActionEfficiencyAtts(actionObj) {
    let actionVar = actionObj.actionVar;

    let expertiseModsStr =
        `<span id='${actionVar}AttEfficiencyContainer'><br>Stat Modifiers to Efficiency:<br>`;

    actionObj.efficiencyAtts.forEach(function (expertiseStat) {
        let name = expertiseStat[0];
        if(!data.atts[name]) {
            console.log("ERROR: you need to instantiate the stat '"+name+"'")
        }
        expertiseModsStr += Raw.html`
            <b>100%</b> of <b>${capitalizeFirst(name)}</b>'s bonus = x<b><span id="${actionVar}_${name}AttEfficiencyMult">1</span></b><br>`
    });
    expertiseModsStr += Raw.html`
        Total Expertise Mult = x<b><span id="${actionVar}EfficiencyMult"></span></b><br>
        <br>Efficiency is the Expertise Mult * Base EFficiency (x<b><span id="${actionVar}EfficiencyBase"></span></b>) in the title, capping at <b>100</b>%.<br>
    </span>`;
    
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
            let labelWrapperTransform = "translate(-50%, -50%) ";

            if (labelMode === "vertical") {
                labelWrapperTransform += `rotate(${-angle}deg)`;
                topY = "";
                bottomY = "";
            } else if (labelMode === "flipped") {
                labelWrapperTransform += `rotate(180deg)`;
            }

            let isDifferentMomentum = actionObj.momentumName !== downstreamObj.momentumName;
            let onclickText = isDifferentMomentum?``:`handleLineClick('${borderId}', {from: '${actionVar}', to: '${downstreamObj.actionVar}'})`;
            let cursorStyle = isDifferentMomentum?``:`cursor:pointer`;

            let lineHTML = Raw.html`
                <div id="${borderId}" class="line-connection" 
                     style="${cursorStyle}; display:flex; align-items: center; position: absolute; width: ${length}px; height: 20px; 
                        background: ${backgroundColor}; opacity: 1; transform-origin: 0 50%; transform: rotate(${angle}deg); left: ${x1}px; top: ${y1}px;"
                     onclick="${onclickText}">
                     
                    <div id="${lineId}" style="transform:${lineTransform}; width: 100%; height: 0; background-color: ${targetBackgroundColor}; position: relative;text-align:center;">
                        <div id="${lineId}_Container" style="display: flex;position: absolute;left: 50%;top: 50%;
                            transform:${labelWrapperTransform};flex-direction: column;align-items: center;pointer-events: none;">
                            <div id="${lineId}_Top" class="line-label-top hyperVisible" style="opacity:0;position:relative;color: yellow;font-size: 14px;font-weight: bold;line-height: 1;top:${topY}">
                                x2
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
    data.attNames.forEach(function (attVar) {
        cacheStatNames();
    });
    data.actionNames.forEach(function(actionVar) {
       cacheActionViews(actionVar);
       cacheDownstreamViews(actionVar);
    });
    clearCacheQueue();
}

function setSingleCaches() {
    queueCache("totalMomentum");
    queueCache("totalMomentum2");
    queueCache("secondsPerReset");
    queueCache("openUseAmuletButton");
    queueCache("openViewAmuletButton");
    queueCache("essence");
    queueCache("essence2");
    queueCache("bonusTime");
    queueCache("killTheLichMenu");
    queueCache("attDisplay");
    queueCache("bonusDisplay");
    queueCache("killTheLichMenuButton");
    queueCache("essenceDisplay");
    queueCache("jobDisplay");
}

function cacheStatNames() {

    data.actionNames.forEach(function(actionVar) {
        let dataObj = actionData[actionVar];
        dataObj.efficiencyAtts.forEach(function (expertiseStat) {
            let newAttVar = expertiseStat[0];
            view.cached[actionVar + "_" + newAttVar + "AttEfficiencyMult"] = document.getElementById(actionVar + "_" + newAttVar + "AttEfficiencyMult");
        });
        dataObj.expAtts.forEach(function (expStat) {
            let newAttVar = expStat[0];
            view.cached[actionVar + "_" + newAttVar + "AttExpMult"] = document.getElementById(actionVar + "_" + newAttVar + "AttExpMult");
        });
    });
}

function cacheActionViews(actionVar) {
    //cache the created objects


    view.cached[actionVar + "_infoContainer"] = document.getElementById(actionVar + "_infoContainer");
    view.cached[actionVar + "_attsContainer"] = document.getElementById(actionVar + "_attsContainer");
    view.cached[actionVar + "_storyContainer"] = document.getElementById(actionVar + "_storyContainer");

    view.cached[actionVar + "ProgressMax"] = document.getElementById(actionVar + "ProgressMax");
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
    view.cached[actionVar + "UnlockCost"] = document.getElementById(actionVar + "UnlockCost");
    view.cached[actionVar + "Expertise"] = document.getElementById(actionVar + "Expertise");
    view.cached[actionVar + "EfficiencyBase"] = document.getElementById(actionVar + "EfficiencyBase");
    view.cached[actionVar + "EfficiencyMult"] = document.getElementById(actionVar + "EfficiencyMult");
    view.cached[actionVar + "Efficiency"] = document.getElementById(actionVar + "Efficiency");
    view.cached[actionVar + "Wage"] = document.getElementById(actionVar + "Wage");
    view.cached[actionVar + "MomentumAdded"] = document.getElementById(actionVar + "MomentumAdded");



    view.cached[actionVar + "RealX"] = document.getElementById(actionVar + "RealX");
    view.cached[actionVar + "RealY"] = document.getElementById(actionVar + "RealY");

    view.cached[actionVar+"AttEfficiencyContainer"] = document.getElementById(actionVar+"AttEfficiencyContainer");
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
        view.cached[actionVar + "RangeInput" + downstreamVar] = document.getElementById(actionVar + "RangeInput" + downstreamVar);
    });
}

let idsToCache = [];
function queueCache(id) {
    idsToCache.push(id);
}

function clearCacheQueue() {
    for(let id of idsToCache) {
        view.cached[id] = document.getElementById(id);
    }
    idsToCache = {};
}