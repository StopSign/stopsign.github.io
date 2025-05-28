

function initializeDisplay() {
    //auto generate elements
    setRealCoordinates('overclock'); //associate all parent/children and give them an x/y
    setRealCoordinates('overclockTargetingTheLich');
    for(let actionVar in data.actions) {
        generateActionDisplay(actionVar);
    }
    generateLinesBetweenActions();
    createAttDisplay();
    actionUpdateAllStatMults();
    actionTitleClicked(`overclock`);
    initializeMenus();
    initializeToasts();
    generateAmuletContent();
    setAllCaches(); //happens after generation
    showAttColors("awareness");
    revealActionAtts(data.actions.reflect);
    data.actions.overclock.downstreamRatereflect = 0;

    debug(); //change game for easier debugging

    updateUIFromLoad(); //update the elements after create
}

function createAttDisplay(attVar) {
    let theStr = "";
    for(let attCategory in attTree) {
        queueCache(`${attCategory}CategoryContainer`);

        theStr += Raw.html`
            <div id="${attCategory}CategoryContainer" style="display:none;margin-bottom:10px;">
                <span style="font-style:italic;font-size:14px;font-weight:bold;"><u>${capitalizeFirst(attCategory)}</u></span>
            `;

        for(let attVar of attTree[attCategory]) {
            let attObj = data.atts[attVar];

            queueCache(`${attVar}AttContainer`);
            queueCache(`${attVar}Name`);
            queueCache(`${attVar}Num`);
            queueCache(`${attVar}Mult`);
            queueCache(`${attVar}PerMinute`);
            queueCache(`${attVar}DisplayContainer`);

            theStr += Raw.html`
                <div id="${attVar}AttContainer" style="position:relative;cursor:pointer;white-space:nowrap;border:2px solid transparent" onclick="clickedAttName('${attVar}')">
                    <img id="${attVar}DisplayContainer" src="img/${attVar}.svg" alt="${attVar}" 
                        style="margin:1px;width:30px;height:30px;vertical-align:top;background:var(--text-bright);border:1px solid black;" />
                    <span style="display:inline-block">
                        <div id="${attVar}Name" style="font-weight:bold;color:var(--text-primary)">${decamelize(attVar)}</div>
                        <span id="${attVar}Num" style="display:inline-block;font-weight:bold;color:var(--text-primary)">${attObj.num}</span>
                        <span style="display:inline-block">(+<span id="${attVar}PerMinute" style="font-weight:bold;color:var(--text-primary)">${attObj.perMinute}</span>/m)</span>
                        <span style="display:inline-block"> = x<span id="${attVar}Mult" style="font-weight:bold;color:var(--text-primary)">${attObj.mult}</span> bonus</span>
                    </span>
                </div>`;
        }
        theStr += `</div>`;
    }

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
    queueCache(`${actionVar}Momentum`);
    queueCache(`${actionVar}MomentumAdded`);
    queueCache(`${actionVar}Level`);
    queueCache(`${actionVar}MaxLevel`);
    queueCache(`${actionVar}HighestLevelContainer2`);
    queueCache(`${actionVar}HighestLevel2`);
    queueCache(`${actionVar}Efficiency`);
    queueCache(`${actionVar}Wage`);

    let title = Raw.html`
        <span onclick="actionTitleClicked('${actionVar}')" style="color:var(--text-primary);cursor:pointer;position:absolute;top:-77px;height:77px;left:0;
            white-space: nowrap;border-width: 0 0 0 6px;border-style: solid;border-color: var(--text-muted);padding-left:4px;background-color:var(--overlay-color)">
          
            <span style="font-size:18px;font-weight:bold;">${actionObj.title}<br></span>
            <span style="font-size:16px;font-weight:bold;" id='${actionVar}Momentum'>0</span> 
            <span style="color:${resourceColor};font-size:14px;font-weight:bold;">${capitalizeFirst(actionObj.momentumName)}</span>
            <span style="font-size:14px;color:var(--text-muted)">${actionObj.isGenerator?`(+<span id="${actionVar}MomentumAdded" style="color:var(--text-primary);font-weight:bold;">10</span>)`:""}</span><br>
            <span style="font-size:12px;position:relative;color:var(--text-muted)">
                Level <span id="${actionVar}Level" style="color:var(--text-primary);font-weight:bold;">0</span>
                ${actionObj.maxLevel >= 0 ? ` / <span id="${actionVar}MaxLevel" style="color:var(--text-primary);font-weight:bold;">0</span>` : ""}
                <span id="${actionVar}HighestLevelContainer2"> 
                    (<b><span id='${actionVar}HighestLevel2' style="color:var(--text-primary);font-weight:bold;"></span></b>)
                </span> | 
                <span id="${actionVar}Efficiency" style="color:var(--text-primary);font-weight:bold;"></span>% efficiency
                ${!actionObj.wage ? "" : ` | $<span id="${actionVar}Wage" style="color:var(--wage-color);font-weight:bold;"></span>`}
            </span>
        </span>
    `

    queueCache(`${actionVar}_downstreamMenuButton`);
    queueCache(`${actionVar}_infoMenuButton`);
    queueCache(`${actionVar}_attsMenuButton`);
    queueCache(`${actionVar}_storyMenuButton`);

    let menuContainer = Raw.html`
        <div style="position:absolute;top:-18px;font-size:13px;left:3px;">
        ${actionVar==="overclock"?"":`<span onclick="actionTitleClicked('${actionObj.parent}')" 
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

    queueCache(`${actionVar}MomentumIncrease`);
    queueCache(`${actionVar}MomentumDecrease`);
    queueCache(`${actionVar}MomentumDelta`);

    let momentumContainer = Raw.html`
    <div style='padding:3px 3px 0;'>
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

    queueCache(`${actionVar}BalanceNeedle`);

    let balanceNeedle =
        Raw.html`
        <div style="color:var(--text-muted)">Change Ratio:</div>
        <div style="position:relative;width:100%;height:10px;">
            <div style="position:absolute;top:-2px;width:100%;height:10px;border-top:1px solid;">
                <div style="position:absolute;top:0;left:25%;width:2px;height:100%;background-color:var(--text-primary);opacity:0.6;"></div> 
                <div style="position:absolute;top:0;left:50%;width:2px;height:100%;background-color:var(--text-primary);opacity:0.6;"></div> 
                <div style="position:absolute;top:0;left:75%;width:2px;height:100%;background-color:var(--text-primary);opacity:0.6;"></div> 
                <div id="${actionVar}BalanceNeedle" style="position:absolute;top:-3px;width:2px;height:16px;background-color:red;left:50%;"></div>
                <span style="color:var(--text-extra-muted);position:absolute;left:25%;top:0;font-size:10px;transform:translateX(-100%);">x1</span>
                <span style="color:var(--text-extra-muted);position:absolute;left:50%;top:0;font-size:10px;transform:translateX(-100%);">x2</span>
                <span style="color:var(--text-extra-muted);position:absolute;left:75%;top:0;font-size:10px;transform:translateX(-100%);">x10</span>
                <span style="color:var(--text-extra-muted);position:absolute;left:100%;top:0;font-size:10px;transform:translateX(-100%);">x100</span>
            </div>
        </div>`;


    queueCache(`${actionVar}ProgressBarInner`);
    queueCache(`${actionVar}Progress`);
    queueCache(`${actionVar}ProgressMax`);
    queueCache(`${actionVar}ProgressGain`);
    queueCache(`${actionVar}ProgressMaxIncrease`);

    let pbar = Raw.html`
        <div style="width:100%;height:16px;position:relative;text-align:left;border-top:1px solid;border-bottom:1px solid;">
            <div id="${actionVar}ProgressBarInner" style="width:30%;background-color:${resourceColor};height:100%;position:absolute;"></div>
            <div style="position:absolute;top:1px;left:4px;width:97%;color:var(--text-muted)">
                <span style="color:var(--text-primary)">
                    <b><span id="${actionVar}Progress">0</span></b> / 
                    <b><span id="${actionVar}ProgressMax">1</span></b>
                </span> progress
                (+<b><span id="${actionVar}ProgressGain" style="color:var(--text-primary)">1</span></b>/s)
                <span style="position:absolute;right:0">x<b><span id="${actionVar}ProgressMaxIncrease" style="color:var(--text-primary)">1</span></b>/lvl</span>
            </div>
        </div>`;

    queueCache(`${actionVar}ExpBarInner`);
    queueCache(`${actionVar}Exp`);
    queueCache(`${actionVar}ExpToLevel`);
    queueCache(`${actionVar}ExpToAdd2`);
    queueCache(`${actionVar}ExpToLevelIncrease`);

    let expBar = Raw.html`
        <div style="width:100%;height:16px;position:relative;text-align:left;border-bottom:1px solid;">
            <div id="${actionVar}ExpBarInner" style="width:30%;background-color:var(--exp-color);height:100%;position:absolute"></div>
            <div style="position:absolute;top:1px;left:4px;width:97%;color:var(--text-muted)">
                <span style="color:var(--text-primary)">
                    <b><span id="${actionVar}Exp">0</span></b> / 
                    <b><span id="${actionVar}ExpToLevel">1</span></b>
                </span> exp
                (+<b><span style="color:var(--text-primary)" id="${actionVar}ExpToAdd2">1</span></b>/complete)
                <span style="position:absolute;right:0">x<b><span id="${actionVar}ExpToLevelIncrease" style="color:var(--text-primary)">1</span></b>/lvl</span>
            </div>
        </div>`;

    queueCache(`${actionVar}IsMaxLevel`)

    let maxLevel = Raw.html`
        <div id="${actionVar}IsMaxLevel" class="hyperVisible" 
            style="position:absolute; display:none;left:104px;top:66px;color:var(--max-level-color);font-size:18px;">
            <b>MAX LEVEL</b>
        </div>`

    title = title + generateOnLevelContainers(actionObj);


    queueCache(`${actionVar}ExpToAdd`);

    let onComplete = dataObj.onCompleteText ? Raw.html`
        <div>On Complete:<br>
            ${dataObj.onCompleteText[language]}
        </div><br>` : "";

    queueCache(`${actionVar}ActionPowerMult`);

    let onLevelText = Raw.html`
        On Level up:<br>
        ${actionObj.isGenerator?"":`x<b>${actionObj.progressMaxIncrease}</b> to progress required to complete<br>`}
        x<b>${actionObj.expToLevelIncrease}</b> to Exp required to level<br>
        ${actionObj.actionPowerMultIncrease===1?"":(`x<b>${actionObj.actionPowerMultIncrease}</b> to Action Power per level <br>`)}
        ${!actionObj.isGenerator?"":`(x<b><span id="${actionVar}ActionPowerMult"></b> total Action Power from level)<br>`}
        ${dataObj.onLevelText ? dataObj.onLevelText[language]:""}`;

    queueCache(`${actionVar}HighestLevelContainer`);
    queueCache(`${actionVar}HighestLevel`);
    queueCache(`${actionVar}SecondHighestLevelContainer`);
    queueCache(`${actionVar}SecondHighestLevel`);
    queueCache(`${actionVar}ThirdHighestLevelContainer`);
    queueCache(`${actionVar}ThirdHighestLevel`);
    queueCache(`${actionVar}PrevUnlockTimeContainer`)
    queueCache(`${actionVar}PrevUnlockTime`);

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


    queueCache(`${actionVar}_infoContainer`);

    let levelInfoContainer = Raw.html`
            <div id="${actionVar}_infoContainer" style="display:none;padding:5px;">
        Tier <b>${actionObj.tier}</b>${actionObj.isGenerator ? " Generator" : " Action"}<br>
        Efficiency, found in the title, is Expertise Mult * Base Efficiency (x<b><span id="${actionVar}EfficiencyBase"></span></b>), capping at <b>100</b>%.<br>
        ${actionObj.isGenerator?"":(`Consume and send rate is ${actionObj.tierMult()*100}% of ${actionObj.momentumName} * efficiency.<br>`)}<br>
        ${onComplete}
        ${onLevelText}
        ${upgradeInfoText}
        ${dataObj.extraInfo ? dataObj.extraInfo[language]:""}
        </div>`;

    queueCache(`${actionVar}_storyContainer`);

    let storyContainer = Raw.html`
        <div id="${actionVar}_storyContainer" style="display:none;padding:5px;max-height:220px;overflow-y:auto;">
            ${dataObj.storyText ? dataObj.storyText[language]:""}
        </div>`;

    queueCache(`${actionVar}_attsContainer`);

    let attsContainer = Raw.html`
        <div id="${actionVar}_attsContainer" style="display:none;padding:5px;max-height:220px;overflow-y:auto;">
            ${generateActionOnLevelAtts(actionObj)}
            ${generateActionExpAtts(actionObj)}
            ${generateActionEfficiencyAtts(actionObj)}
        </div>`;

    queueCache(`${actionVar}LockContainer`);
    queueCache(`${actionVar}UnlockCost`);
    queueCache(`${actionVar}UnlockCostContainer`);

    let lockOverAll = Raw.html`
        <div id="${actionVar}LockContainer" 
            style="position:absolute;background-color: var(--bg-secondary);width:100%;height:100%;top:0;left:0;text-align:center;border:2px solid black;">
            <span id="${actionVar}LockIcon"></span><br>
            <span>
                <div id="${actionVar}UnlockCostContainer">
                    Needs <span style="font-weight:bold;" id="${actionVar}UnlockCost">0</span> ${actionObj.momentumName}<br>
                    sent from <b>${data.actions[actionObj.parent]?data.actions[actionObj.parent].title:"WAIT"}</b>.
                </div>
                ${dataObj.unlockMessage ? dataObj.unlockMessage[language]:""}
            </span>
        </div>`;

    queueCache(`${actionVar}_downstreamContainer`);
    queueCache(`${actionVar}_downstreamButtonContainer`);
    queueCache(`${actionVar}TotalSend`);

    let downstreamContainer = Raw.html`
        <div id="${actionVar}_downstreamContainer" style="padding:5px;display:none;">
            <div id="${actionVar}_downstreamButtonContainer">
                ${createDownStreamSliders(actionObj)}
                <span onclick="toggleAllZero('${actionVar}')" 
                    class="buttonSimple" style="margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;">All 0</span>
                <span onclick="toggleAllHundred('${actionVar}')" 
                    class="buttonSimple" style="margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;">All 100</span>
                <div style="color:var(--text-muted)">Total ${actionObj.momentumName} sending downstream: <b><span style="color:var(--text-primary)" id='${actionVar}TotalSend'>1</span></b>/s</div>
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
        <div id="${actionVar}Container" style="display:${shouldDisplay};position:absolute;left:${newX};top:${newY};width:300px;transform-style: preserve-3d;">
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
                ${dataObj.extraButton ?? ""}
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
    let borderColor = type === "add"
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
             style="display:${startDisplayed};border:2px solid var(${borderColor});margin-bottom:2px;cursor:pointer;background-color:var(--overlay-color);padding:1px;">
            <div class="showthat" style="position:relative;width:30px;height:30px;background-color:var(${backgroundColor});">
                <div class="showthisUp" style="font-size:18px;">${tooltipText}</div>
                <img src="img/${statName}.svg" alt="${statName}" style="width:100%;height:100%;" />
                <div class="hyperVisible" style="position:absolute;bottom:0;left:0;width:100%;height:50%;display:flex;align-items:flex-end;
                justify-content:center;font-weight:bold;font-size:10px;">${text}</div>
            </div>
        </div>`;
}

function generateActionOnLevelAtts(actionObj) {
    let actionVar = actionObj.actionVar;
    let dataObj = actionData[actionVar];
    queueCache(`${actionVar}AttOnLevelContainer`);

    let onLevelAttsText = `<div id="${actionVar}AttOnLevelContainer" style="display:none"><u>Stats gained each level:</u><br>`;
    for(let attObj of dataObj.onLevelAtts) {
        let attVar = attObj[0];

        queueCache(`${actionVar}${attVar}InsideContaineradd`);

        onLevelAttsText += `
        <div id="${actionVar}${attVar}InsideContaineradd" style="color:var(--text-muted);cursor:pointer;border:2px solid transparent;" class="backgroundWhenHover" onclick="clickedAttName('${attVar}')">
            +<span style="color:var(--text-primary)"><b>${attObj[1]}</b></span> to 
            <img src="img/${attVar}.svg" alt="${attVar}" 
            style="margin:1px;width:20px;height:20px;vertical-align:top;background:var(--attribute-add-bg-color)" />
            <span style="color:var(--text-primary)"><b>${capitalizeFirst(attObj[0])}</b></span>
        </div>`;
    }
    onLevelAttsText += `</div>`

    return onLevelAttsText;
}

function generateActionExpAtts(actionObj) {
    let actionVar = actionObj.actionVar;
    let dataObj = actionData[actionVar];

    let isFirst = dataObj.onLevelAtts.length === 0;

    queueCache(`${actionVar}AttExpContainer`);
    let expAttsStr =
        `<div id="${actionVar}AttExpContainer" style="display:none;">${isFirst?"":"<br>"}<u>Stat Modifiers to ${actionObj.isGenerator?"Exp":"Progress"}:</u><br>`;

    for(let attObj of dataObj.expAtts) {
        let attVar = attObj[0];
        let ratio = attObj[1] * 100;
        if(!data.atts[attVar]) {
            console.log(`ERROR: you need to instantiate the stat: '${attVar}'`);
        }
        queueCache(`${actionVar}_${attVar}AttExpMult`);
        queueCache(`${actionVar}${attVar}InsideContainerexp`);

        expAttsStr += Raw.html`
        <div id="${actionVar}${attVar}InsideContainerexp" style="color:var(--text-muted);cursor:pointer;display:none;border:2px solid transparent;" 
            class="backgroundWhenHover" onclick="clickedAttName('${attVar}')">
            <span style="color:var(--text-primary)"><b>${ratio}</b></span>% of <img src="img/${attVar}.svg" alt="${attVar}" 
            style="margin:1px;width:20px;height:20px;vertical-align:top;background:var(--attribute-use-exp-bg-color)" />
            <span style="color:var(--text-primary)"><b>${capitalizeFirst(attVar)}</b></span>'s bonus 
            = x<b><span style="color:var(--text-primary)" id="${actionVar}_${attVar}AttExpMult">1</span></b>
        </div>`
    }

    queueCache(`${actionVar}AttReductionEffect`);
    expAttsStr +=
            `<span style="color:var(--text-muted);">Total Reduction = 1 / </span><b><span id="${actionVar}AttReductionEffect">1</span></b>
        </div>`;
    return expAttsStr;
}

function generateActionEfficiencyAtts(actionObj) {
    let actionVar = actionObj.actionVar;
    let dataObj = actionData[actionVar];

    let isFirst = dataObj.onLevelAtts.length === 0 && dataObj.expAtts.length === 0;

    queueCache(`${actionVar}AttEfficiencyContainer`);
    let expertiseModsStr =
        `<div id="${actionVar}AttEfficiencyContainer" style="display:none;">${isFirst?"":"<br>"}<u>Stat Modifiers to Efficiency:</u><br>`;

    for(let attObj of dataObj.efficiencyAtts) {
        let attVar = attObj[0];
        let ratio = attObj[1] * 100;
        if(!data.atts[attVar]) {
            console.log(`ERROR: you need to instantiate the stat: '${attVar}'`);
        }
        queueCache(`${actionVar}_${attVar}AttEfficiencyMult`);
        queueCache(`${actionVar}${attVar}InsideContainereff`);

        expertiseModsStr += Raw.html`
        <div id="${actionVar}${attVar}InsideContainereff" style="color:var(--text-muted);cursor:pointer;display:none;border:2px solid transparent;" 
            class="backgroundWhenHover" onclick="clickedAttName('${attVar}')">
            <span style="color:var(--text-primary)"><b>${ratio}</b></span>% of <img src="img/${attVar}.svg" alt="${attVar}" 
            style="margin:1px;width:20px;height:20px;vertical-align:top;background:var(--attribute-use-eff-bg-color)" />
            <span style="color:var(--text-primary)"><b>${capitalizeFirst(attVar)}</b></span>'s bonus 
            = x<b><span style="color:var(--text-primary)" id="${actionVar}_${attVar}AttEfficiencyMult">1</span></b><br>
        </div>`
    }
    queueCache(`${actionVar}EfficiencyMult`);
    queueCache(`${actionVar}EfficiencyBase`);
    expertiseModsStr += Raw.html`
        <span style="color:var(--text-muted);">Total Expertise Mult = x</span><b><span id="${actionVar}EfficiencyMult"></span></b>
    </div>`;
    
    return expertiseModsStr;
}

function createDownStreamSliders(actionObj) {
    let theStr = "";
    if(!actionObj.downstreamVars) {
        return "";
    }
    for(let downstreamVar of actionObj.downstreamVars) {
        if(!data.actions[downstreamVar] || !data.actions[downstreamVar].hasUpstream) {
            continue;
        }
        let title = data.actions[downstreamVar] ? data.actions[downstreamVar].title : downstreamVar;
        let actionVar = actionObj.actionVar;

        queueCache(`${actionVar}SliderContainer${downstreamVar}`)
        queueCache(`${actionVar}DownstreamSendRate${downstreamVar}`)
        queueCache(`${actionVar}DownstreamAttentionBonusLoop${downstreamVar}`)
        queueCache(`${actionVar}DownstreamAttentionBonus${downstreamVar}`)
        queueCache(`${actionVar}NumInput${downstreamVar}`)
        queueCache(`${actionVar}RangeInput${downstreamVar}`)

        theStr += Raw.html`
            <div id="${actionVar}SliderContainer${downstreamVar}" style="margin-bottom:5px;margin-top:5px;font-size:12px;">
                <b><span style="margin-bottom:10px;cursor:pointer;" onclick="actionTitleClicked('${downstreamVar}')">${title}</span></b>
                    (+<b><span id="${actionVar}DownstreamSendRate${downstreamVar}">0</span></b>/s)
                <b><span id="${actionVar}DownstreamAttentionBonusLoop${downstreamVar}" 
                    class="hyperVisible" style="color:mediumpurple;display:none;">x1.00</span></b>
                <b><span id="${actionVar}DownstreamAttentionBonus${downstreamVar}" 
                    class="hyperVisible" style="color:yellow;display:none;">x2</span></b><br>
                <input type="number" id="${actionVar}NumInput${downstreamVar}" value="0" min="0" max="100" style="margin-right:3px;font-size:10px;width:37px;"
                    oninput="validateInput('${actionVar}', '${downstreamVar}')" onchange="downstreamNumberChanged('${actionVar}', '${downstreamVar}')" >
                <input type="range" id="${actionVar}RangeInput${downstreamVar}" value="0" min="0" max="100" 
                    oninput="downstreamSliderChanged('${actionVar}', '${downstreamVar}')" style="margin-left:5px;width:200px;font-size:10px;height:5px;margin-bottom:8px;">
            </div>`;
    }

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
    const existingIndex = data.focusSelected.findIndex(entry => entry.borderId === borderId);

    if (existingIndex !== -1) {
        unhighlightLine(borderId);
        data.focusSelected.splice(existingIndex, 1);
    } else {
        if (data.focusSelected.length >= data.maxFocusAllowed) {
            const removed = data.focusSelected.shift();
            unhighlightLine(removed.borderId);
        }
        data.focusSelected.push({ borderId, lineData });
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
    for(let actionVar in data.actions) {
        let actionObj = data.actions[actionVar];
        for(let downstreamVar of actionObj.downstreamVars) {
            let downstreamObj = data.actions[downstreamVar];
            if(!downstreamObj || downstreamObj.realX === undefined || actionObj.realX === undefined) {
                continue;
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
            let lineId = `${actionVar}_${downstreamObj.actionVar}_Line_Inner`;


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

            queueCache(borderId);
            queueCache(lineId);
            queueCache(`${lineId}_Container`);
            queueCache(`${lineId}_Top`);
            queueCache(`${lineId}_Bottom`);
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
        }
    }
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
    queueCache("killTheLichMenuButton2");
    queueCache("essenceDisplay");
    queueCache("jobDisplay");

    for(let actionVar in data.actions) {
        view.cached[actionVar + "ActionPower"] = document.getElementById(actionVar + "ActionPower");
        view.cached[actionVar + "AmountToSend"] = document.getElementById(actionVar + "AmountToSend");
        view.cached[actionVar + "MomentumTaken"] = document.getElementById(actionVar + "MomentumTaken");
    }

    clearCacheQueue();
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