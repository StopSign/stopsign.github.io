

function initializeDisplay() {
    //auto generate elements
    for(let actionVar in data.actions) {
        attachAttLinks(actionVar);
    }
    setRealCoordinates("overclock"); //associate all parent/children and give them an x/y
    setRealCoordinates("worry");
    setRealCoordinates("echoKindle");
    setRealCoordinates("absorbStarseed");
    for(let actionVar in data.actions) {
        generateActionDisplay(actionVar);
    }
    generateLinesBetweenActions();
    createAttDisplay();
    actionUpdateAllStatMults();
    actionTitleClicked("overclock", true);
    initializeMenus();

    initializeToasts();
    initializeAmuletCards();
    setAllCaches(); //happens after generation
    showAttColors("awareness");
    revealActionAtts(data.actions.reflect);
    data.actions.overclock.downstreamRatereflect = 0;

    updateUIOnLoad(); //update the elements after create
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
            queueCache(`${attVar}AttMult`);
            queueCache(`${attVar}AttUpgradeMult`);
            queueCache(`${attVar}AttUpgradeMultContainer`);
            queueCache(`${attVar}DisplayContainer`);

            theStr += Raw.html`
                <div id="${attVar}AttContainer" style="position:relative;cursor:pointer;white-space:nowrap;border:2px solid transparent" 
                    onclick="clickedAttName('${attVar}', false)">
                    <img id="${attVar}DisplayContainer" src="img/${attVar}.svg" alt="${attVar}" 
                        style="margin:1px;width:35px;height:35px;vertical-align:top;background:var(--text-bright);border:1px solid black;" />
                    <span style="display:inline-block">
                        <div id="${attVar}Name" style="font-weight:bold;color:var(--text-primary)">${decamelize(attVar)}</div>
                        <span id="${attVar}Num" style="display:inline-block;font-weight:bold;color:var(--text-primary)">${attObj.num}</span>
                        <span style="display:inline-block"> = x<span id="${attVar}AttMult" style="font-weight:bold;color:var(--text-primary)">${attObj.attMult}</span> bonus</span>
                        <div id="${attVar}AttUpgradeMultContainer">x<span id="${attVar}AttUpgradeMult" style="font-weight:bold;color:var(--text-primary)">${attObj.attUpgradeMult}</span> bonus mult</div>
                    </span>
                </div>`;
        }
        theStr += `</div>`;
    }

    let child = document.createElement("template");
    child.innerHTML = theStr;
    document.getElementById("attDisplayUnder").appendChild(child.content);

}

function generateActionDisplay(actionVar) {
    let actionObj = data.actions[actionVar];
    let dataObj = actionData[actionVar];
    let theStr = "";
    let resourceColor = getResourceColor(actionObj);
    let resourceColorDim = getResourceColorDim(actionObj);

    queueCache(`${actionVar}Tier`);
    queueCache(`${actionVar}Resource`);
    queueCache(`${actionVar}ResourceToAdd`);
    queueCache(`${actionVar}Level`);
    queueCache(`${actionVar}MaxLevel`);
    queueCache(`${actionVar}HighestLevelContainer2`);
    queueCache(`${actionVar}HighestLevel2`);
    queueCache(`${actionVar}Efficiency`);
    queueCache(`${actionVar}Wage`);
    queueCache(`${actionVar}Instability`);
    queueCache(`${actionVar}InstabilityToAdd`);


    let iconImgName = (actionObj.isGenerator?"gear":"lightning") + actionObj.tier;

    let icon = Raw.html`
        <span style="position:absolute;top:-43px;left:-40px;width:40px;height:40px;" class="showthat">
            <img class="${actionObj.isGenerator?'generatorIconSvg':'actionIconSvg'}" src="img/${iconImgName}.svg" alt="${iconImgName}" style="width:100%;height:100%;" />
            <div class="showthisUp" style="font-size:20px;width:150px">Tier ${actionObj.tier + (actionObj.isGenerator?" Generator":" Action")} </div>
        </span>
    `

    let title = Raw.html`
        <span onclick="actionTitleClicked('${actionVar}')" style="color:var(--text-primary);cursor:pointer;position:absolute;
            top:-82px;height:82px;left:0;white-space: nowrap;border-width: 0 0 0 6px;border-style:solid;
            border-color:${resourceColorDim};padding-left:4px;text-shadow:1px 1px 2px var(--text-dark);">
            <span style="font-size:20px;font-weight:bold;">${actionObj.title}<br></span>
            <span style="font-size:18px;font-weight:bold;" id='${actionVar}Resource'>0</span> 
            <span style="color:${resourceColor};font-size:16px;font-weight:bold;">${capitalizeFirst(dataObj.resourceName)}</span>
            <span style="font-size:14px;color:var(--text-muted)">${actionObj.isGenerator?`(+<span id="${actionVar}ResourceToAdd" 
                style="color:var(--text-primary);font-weight:bold;">???</span>)`:""}</span><br>
            <span style="font-size:14px;position:relative;color:var(--text-muted)">
                ${!actionObj.isSpell?"Level ":"Charges "}<span id="${actionVar}Level" style="color:var(--text-primary);font-weight:bold;">0</span>
                ${actionObj.maxLevel !== undefined ? ` / <span id="${actionVar}MaxLevel" style="color:var(--text-primary);font-weight:bold;">0</span>` : ""}
                <span id="${actionVar}HighestLevelContainer2"> 
                    (<span id='${actionVar}HighestLevel2' style="color:var(--text-primary);font-weight:bold;"></span>)
                </span> | 
                <span id="${actionVar}Efficiency" style="color:var(--text-primary);font-weight:bold;"></span>% efficiency
                ${!actionObj.wage ? "" : ` | Wage: $<span id="${actionVar}Wage" style="color:var(--wage-color);font-weight:bold;"></span>`}
                ${!actionObj.isSpell ? "" : ` | <span id="${actionVar}Instability" style="color:var(--text-primary);font-weight:bold;">0</span>% instability
                (+<span id="${actionVar}InstabilityToAdd" style="color:var(--text-primary);font-weight:bold;"></span>)` }
            </span>
        </span>
    `

    let mediumTitle = Raw.html`
        <span onclick="actionTitleClicked('${actionVar}')" style="color:var(--text-primary);cursor:pointer;position:absolute;top:-77px;height:77px;left:0;
            white-space: nowrap;border-width: 0 0 0 3px;border-style: solid;border-color: var(--text-muted);padding-left:4px;background-color:var(--overlay-color)">
            
        </span>
    `

    queueCache(`${actionVar}_downstreamMenuButton`);
    queueCache(`${actionVar}_infoMenuButton`);
    queueCache(`${actionVar}_attsMenuButton`);
    queueCache(`${actionVar}_storyMenuButton`);
    queueCache(`${actionVar}_automationMenuButton`);
    queueCache(`${actionVar}MenuButtons`);


    let menuContainer = Raw.html`
        <div id="${actionVar}MenuButtons" style="position:absolute;top:-20px;font-size:13px;left:3px;width:315px;">
            ${!dataObj.parentVar?"":`<span onclick="actionTitleClicked('${dataObj.parentVar}')" 
            class="buttonSimple" style="margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;">^</span>`}
        <span id="${actionVar}_downstreamMenuButton" onclick="clickActionMenu('${actionVar}', 'downstream')" class="buttonSimple" 
            style="margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;">Downstream</span>
        <span id="${actionVar}_infoMenuButton" onclick="clickActionMenu('${actionVar}', 'info')" class="buttonSimple" 
            style="margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;">Info</span>
        <span id="${actionVar}_attsMenuButton" onclick="clickActionMenu('${actionVar}', 'atts')" class="buttonSimple" 
            style="margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;">Stats</span>
        <span id="${actionVar}_storyMenuButton" onclick="clickActionMenu('${actionVar}', 'story')" class="buttonSimple" 
            style="display:${dataObj.storyText?"":"none"};margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;">Story</span>
        <span id="${actionVar}_automationMenuButton" onclick="clickActionMenu('${actionVar}', 'automation')" class="buttonSimple" 
            style="display:${actionObj.hasUpstream?"":"none"};margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;">Automation</span>
        </div>`;

    queueCache(`${actionVar}ResourceIncrease`);
    queueCache(`${actionVar}ResourceDecrease`);
    queueCache(`${actionVar}ResourceDelta`);
    queueCache(`${actionVar}DeltasDisplayContainer`);

    let momentumContainer = Raw.html`
    <div id="${actionVar}DeltasDisplayContainer" style="padding:3px 3px 0;display:none;">
        <div style="font-style: italic; color: var(--text-muted);">
            <span style="display:inline-block;width:90px;text-decoration:underline">Increase</span>
            <span style="display:inline-block;width:90px;text-decoration:underline">Decrease</span>
            <span style="display:inline-block;width:90px;text-decoration:underline">Change</span>
        </div>
        <div>
            <span style="display:inline-block;width:90px;white-space: nowrap;">+<span id="${actionVar}ResourceIncrease" style="font-weight:bold"></span>/s</span>
            <span style="display:inline-block;width:90px;white-space: nowrap;">-<span id="${actionVar}ResourceDecrease" style="font-weight:bold"></span>/s</span>
            <span style="display:inline-block;width:90px;white-space: nowrap;">Δ<span id="${actionVar}ResourceDelta" style="font-weight:bold"></span>/s</span>
        </div>
    </div>`;

    queueCache(`${actionVar}BalanceNeedleContainer`);
    queueCache(`${actionVar}BalanceNeedle`);
    queueCache(`${actionVar}BalanceNeedleLabel`);

    let balanceNeedle =
        Raw.html`
        <div id="${actionVar}BalanceNeedleContainer" style="display:none;">
            <div id="${actionVar}BalanceNeedleLabel" style="color:var(--text-muted)">(Increase / Decrease) Ratio:</div>
            <div style="position:relative;width:100%;height:12px;">
                <div style="position:absolute;top:-1px;width:100%;height:11px;border-top:1px solid;">
                    <div style="position:absolute;top:0;left:25%;width:2px;height:100%;background-color:var(--text-primary);opacity:0.6;"></div> 
                    <div style="position:absolute;top:0;left:50%;width:2px;height:100%;background-color:var(--text-primary);opacity:0.6;"></div> 
                    <div style="position:absolute;top:0;left:75%;width:2px;height:100%;background-color:var(--text-primary);opacity:0.6;"></div> 
                    <div id="${actionVar}BalanceNeedle" style="position:absolute;top:-3px;width:4px;height:16px;background-color:red;left:50%;"></div>
                    <span style="color:var(--text-extra-muted);position:absolute;left:25%;top:0;font-size:10px;transform:translateX(-100%);">x1</span>
                    <span style="color:var(--text-extra-muted);position:absolute;left:50%;top:0;font-size:10px;transform:translateX(-100%);">x2</span>
                    <span style="color:var(--text-extra-muted);position:absolute;left:75%;top:0;font-size:10px;transform:translateX(-100%);">x10</span>
                    <span style="color:var(--text-extra-muted);position:absolute;left:100%;top:0;font-size:10px;transform:translateX(-100%);">x100</span>
                </div>
            </div>
        </div>`;


    queueCache(`${actionVar}ProgressBarInner`);
    queueCache(`${actionVar}Progress`);
    queueCache(`${actionVar}ProgressMax`);
    queueCache(`${actionVar}ProgressGain`);
    queueCache(`${actionVar}ProgressMaxIncrease`);
    queueCache(`${actionVar}ProgressBarLabels`);

    let pbar = Raw.html`
        <div style="width:100%;height:18px;position:relative;text-align:left;border-top:2px solid;">
            <div id="${actionVar}ProgressBarInner" style="width:30%;background-color:${resourceColor};height:100%;position:absolute;"></div>
            <div id="${actionVar}ProgressBarLabels" style="position:absolute;top:1px;left:4px;width:97%;color:var(--text-muted)">
                <span style="color:var(--text-primary)">
                    <span id="${actionVar}Progress" style="font-weight:bold;">0</span> / 
                    <span id="${actionVar}ProgressMax" style="font-weight:bold;">1</span>
                </span> progress
                (+<span id="${actionVar}ProgressGain" style="color:var(--text-primary);font-weight:bold;">1</span>/s)
                <span style="position:absolute;right:0;">x<span id="${actionVar}ProgressMaxIncrease" 
                    style="color:var(--text-primary);font-weight:bold;">1</span>/lvl</span>
            </div>
        </div>`;

    queueCache(`${actionVar}ExpBarInner`);
    queueCache(`${actionVar}Exp`);
    queueCache(`${actionVar}ExpToLevel`);
    queueCache(`${actionVar}ExpToAdd2`);
    queueCache(`${actionVar}ExpToLevelIncrease`);
    queueCache(`${actionVar}ExpBarLabels`);

    let expBar = Raw.html`
        <div style="width:100%;height:18px;position:relative;text-align:left;border-bottom:2px solid;">
            <div id="${actionVar}ExpBarInner" style="width:30%;background-color:var(--exp-color);height:100%;position:absolute"></div>
            <div id="${actionVar}ExpBarLabels" style="position:absolute;top:1px;left:4px;width:97%;color:var(--text-muted)">
                <span style="color:var(--text-primary)">
                    <b><span id="${actionVar}Exp">0</span></b> / 
                    <b><span id="${actionVar}ExpToLevel">1</span></b>
                </span> exp
                (+<b><span style="color:var(--text-primary)" id="${actionVar}ExpToAdd2">1</span></b>/complete)
                <span style="position:absolute;right:0">x<b><span id="${actionVar}ExpToLevelIncrease" style="color:var(--text-primary)">1</span></b>/lvl</span>
            </div>
        </div>`;

    queueCache(`${actionVar}IsMaxLevel`)

let maxLevelTop = (data.gameSettings.viewDeltas && data.gameSettings.viewRatio) ? "73px" :
    (data.gameSettings.viewDeltas && !data.gameSettings.viewRatio) ? "48px" :
        (!data.gameSettings.viewDeltas && data.gameSettings.viewRatio) ? "40px" : "12px";
            // (!data.gameSettings.viewDeltas && !data.gameSettings.viewRatio) ? "12px";
                // top:63px with both
    //     top:48px with no balance needle (data.gameSettings.viewDeltas === true, data.gameSettings.viewRatio === false)
    // top:40px with no deltas (data.gameSettings.viewDeltas === false, data.gameSettings.viewRatio === true)
    // top:12px without both

    let maxLevel = Raw.html`
        <div id="${actionVar}IsMaxLevel" class="hyperVisible" 
            style="position:absolute;display:none;top:${maxLevelTop};width:300px;text-align:center;color:${!actionObj.isSpell?"var(--max-level-color)":"var(--text-bright)"};font-size:22px;font-weight:bold;">
            ${!actionObj.isSpell?"MAX LEVEL":"MAX CHARGES"}
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
        ${actionObj.isGenerator || actionObj.progressMaxIncrease === 1 ? "" : `x<b>${actionObj.progressMaxIncrease}</b> progress required to complete<br>`}
        ${actionObj.expToLevelIncrease === 1 ? "" : `x<b>${actionObj.expToLevelIncrease}</b> exp required to level<br>`}
        ${actionObj.actionPowerMultIncrease === 1 ?"" : `x<b>${actionObj.actionPowerMultIncrease}</b> to Action Power per level <br>`}
        ${!actionObj.isGenerator ? "" : `(x<b><span id="${actionVar}ActionPowerMult"></b> total Action Power from level)<br>`}
        ${dataObj.onLevelText ? dataObj.onLevelText[language]:""}`;

    queueCache(`${actionVar}HighestLevelContainer`);
    queueCache(`${actionVar}HighestLevel`);
    queueCache(`${actionVar}SecondHighestLevelContainer`);
    queueCache(`${actionVar}SecondHighestLevel`);
    queueCache(`${actionVar}ThirdHighestLevelContainer`);
    queueCache(`${actionVar}ThirdHighestLevel`);
    queueCache(`${actionVar}CurrentUnlockTimeContainer`)
    queueCache(`${actionVar}CurrentUnlockTime`);
    queueCache(`${actionVar}PrevUnlockTimeContainer`)
    queueCache(`${actionVar}PrevUnlockTime`);
    queueCache(`${actionVar}DeltaUnlockTimeContainer`)
    queueCache(`${actionVar}DeltaUnlockTime`);

    let upgradeInfoText = Raw.html`<br>
        <div id="${actionVar}HighestLevelContainer" style="display:none">
            Highest level (2x up to): <span id="${actionVar}HighestLevel" style="font-weight:bold;"></span>
        </div>
        <div id="${actionVar}SecondHighestLevelContainer" style="display:none">
            Second Highest level (2x up to): <span id="${actionVar}SecondHighestLevel" style="font-weight:bold;"></span>
        </div>
        <div id="${actionVar}ThirdHighestLevelContainer" style="display:none">
            Third Highest level (2x up to): <span id="${actionVar}ThirdHighestLevel" style="font-weight:bold;"></span>
        </div>
        
        <div id="${actionVar}CurrentUnlockTimeContainer" style="display:none">
            Current Unlock Time: <span id="${actionVar}CurrentUnlockTime" style="font-weight:bold;"></span>
        </div>
        <div id="${actionVar}PrevUnlockTimeContainer" style="display:none">
            Previous Unlock Time: <span id="${actionVar}PrevUnlockTime" style="font-weight:bold;"></span>
        </div>
        <div id="${actionVar}DeltaUnlockTimeContainer" style="display:none">
            Delta Unlock Time: <span id="${actionVar}DeltaUnlockTime" style="font-weight:bold;"></span>
        </div>`;


    queueCache(`${actionVar}_infoContainer`);

    let levelInfoContainer = Raw.html`
        <div id="${actionVar}_infoContainer" style="display:none;padding:5px;max-height:220px;overflow-y:auto;will-change: transform;">
            Tier <b>${actionObj.tier}</b> ${actionObj.isSpell ? "Spell" : actionObj.isGenerator ? "Generator" : "Action"}<br>
            Efficiency, found in the title, is Expertise Mult * Base Efficiency (x<b><span id="${actionVar}EfficiencyBase"></span></b>), capping at <b>100</b>%.<br>
            ${actionObj.isGenerator?"":(`Consume and send rate is ${actionObj.tierMult()*100}% of ${dataObj.resourceName} * efficiency.<br>`)}<br>
            ${onComplete}
            ${onLevelText}
            ${upgradeInfoText}
            ${dataObj.extraInfo ? dataObj.extraInfo[language]:""}
        </div>`;

    queueCache(`${actionVar}_storyContainer`);

    let storyContainer = Raw.html`
        <div id="${actionVar}_storyContainer" style="display:none;padding:10px;max-height:220px;overflow-y:auto;will-change: transform;">
            ${dataObj.storyText ? dataObj.storyText[language]:""}
        </div>`;

    queueCache(`${actionVar}_automationContainer`);
    queueCache(`${actionVar}_checkbox`);
    queueCache(`${actionVar}_track`);
    queueCache(`${actionVar}_knob`);

    let preventParentSliderText = !actionObj.hasUpstream ? "": `
           Prevent automation from changing the upstream slider to this action: 
           
            <label onclick="toggleAutomation('${actionVar}')" style="position:relative;display:inline-block;width:50px;height:14px;cursor:pointer;">
                <input id="${actionVar}_checkbox" type="checkbox" style="opacity:0;width:0;height:0;">
                <div id="${actionVar}_track" style="position:absolute;top:0;left:0;right:0;bottom:0;background-color:#ccc;border-radius:14px;">
                    <div id="${actionVar}_knob" style="position:absolute;height:16px;width:16px;left:4px;bottom:-1px;background-color:white;border-radius:50%;"></div>
                </div>
            </label>
    `

    let automationContainer = Raw.html`
        <div id="${actionVar}_automationContainer" style="display:none;padding:10px;max-height:220px;overflow-y:auto;will-change: transform;">
            ${preventParentSliderText}
        </div>`;

    queueCache(`${actionVar}_attsContainer`);

    let attsContainer = Raw.html`
        <div id="${actionVar}_attsContainer" style="display:none;padding:5px;max-height:220px;overflow-y:auto;font-size;12px;will-change: transform;">
            ${generateActionOnLevelAtts(actionObj)}
            ${generateActionExpAtts(actionObj)}
            ${generateActionEfficiencyAtts(actionObj)}
        </div>`;

    queueCache(`${actionVar}LockContainer`);
    queueCache(`${actionVar}UnlockCost`);
    queueCache(`${actionVar}UnlockCostContainer`);

    let lockOverAll = Raw.html`
        <div id="${actionVar}LockContainer" 
            style="position:absolute;background-color: var(--bg-secondary);width:100%;height:100%;top:0;left:0;
            text-align:center;border:2px solid black;min-height:150px;">
            <span id="${actionVar}LockIcon"></span><br>
            <span>
                <div id="${actionVar}UnlockCostContainer">
                    Needs <span style="font-weight:bold;" id="${actionVar}UnlockCost">0</span> ${dataObj.resourceName}<br>
                    sent from <b>${data.actions[dataObj.parentVar]?data.actions[dataObj.parentVar].title:"WAIT"}</b>.
                </div>
                ${dataObj.unlockMessage ? dataObj.unlockMessage[language]:""}
            </span>
        </div>`;

    queueCache(`${actionVar}_downstreamContainer`);
    queueCache(`${actionVar}_downstreamButtonContainer`);
    queueCache(`${actionVar}TotalSend`);
    queueCache(`${actionVar}ToggleDownstreamButtons`);
    queueCache(`${actionVar}TotalDownstreamContainer`);

    let downstreamContainer = Raw.html`
        <div id="${actionVar}_downstreamContainer" style="padding:5px;display:none;">
            <div id="${actionVar}_downstreamButtonContainer">
                ${createDownStreamSliders(actionObj, dataObj)}
                <div id="${actionVar}ToggleDownstreamButtons" style="font-size:12px;display:none;">
                    <span onclick="toggleAllZero('${actionVar}')" 
                        class="buttonSimple" style="margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;">All 0</span>
                    <span onclick="toggleAllHundred('${actionVar}')" 
                        class="buttonSimple" style="margin-right:3px;width:30px;height:30px;text-align:center;cursor:pointer;padding:0 4px;">All 100</span>
                </div>
                <div id="${actionVar}TotalDownstreamContainer" style="color:var(--text-muted);font-size:12px;display:none;">
                    Total ${dataObj.resourceName} sending downstream: 
                    <span style="color:var(--text-primary);font-weight:bold;" id="${actionVar}TotalSend">1</span>/s
                </div>
            </div>
        </div>`;

    let newX = dataObj.realX +"px";
    let newY = dataObj.realY +"px";

    queueCache(`${actionVar}Container`)
    queueCache(`${actionVar}LargeVersionContainer`)
    queueCache(`${actionVar}SmallVersionContainer`)
    queueCache(`${actionVar}SmallVersionTitle`)
    queueCache(`${actionVar}Level2`)
    queueCache(`${actionVar}MaxLevel2`)
    queueCache(`${actionVar}SmallVersionLevels`)
//transform-style: preserve-3d;

    let maxLevelDiv = `<span style="display:${actionObj.maxLevel ? "" : "none"}">/ <span id="${actionVar}MaxLevel2" style="font-weight:bold;"></span></span>`;

    theStr += Raw.html`
        <div id="${actionVar}Container" style="display:none;position:absolute;left:${newX};top:${newY};width:300px;" 
            onmouseenter="mouseOnAction('${actionVar}')" onmouseleave="mouseOffAction('${actionVar}')">
            <div id="${actionVar}LargeVersionContainer" style="border:2px solid var(--border-color);
                background-color:var(--bg-secondary);">
                ${icon}
                ${title}
                ${menuContainer}
                ${momentumContainer}
                ${balanceNeedle}
                ${pbar}
                ${expBar}
                ${storyContainer}
                ${attsContainer}
                ${automationContainer}
                ${levelInfoContainer}
                ${downstreamContainer}
                ${lockOverAll}
            </div>
            <div id="${actionVar}SmallVersionContainer" 
                style="display:none;text-align:center;margin:50px auto;font-size:12px;width:100px;">
                <span id="${actionVar}SmallVersionTitle">
                    <span style="font-size:16px;font-weight:bold;">${actionObj.title}</span><br>
                    <span id="${actionVar}SmallVersionLevels">
                        Level <span id="${actionVar}Level2" style="font-weight:bold;"></span>${maxLevelDiv}
                    </span>
                </span>
            </div>
                ${dataObj.extraButton ?? ""}
            ${maxLevel}
        </div>`;



    let child = document.createElement("template");
    child.innerHTML = theStr;
    document.getElementById(`planeContainer${actionObj.plane}`).appendChild(child.content);


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

    let startDisplayed = (globalVisible || type === "add") ? "" : "none";
    let borderColor = type === "add"
        ? "--attribute-add-color"
        : (type === "exp"
            ? "--attribute-use-exp-color"
            : "--attribute-use-eff-color");
    // borderColor = statName === "legacy" ? "--legacy-color-bg" : borderColor;

    let backgroundColor = type === "add"
        ? "--attribute-add-bg-color"
        : (type === "exp"
            ? "--attribute-use-exp-bg-color"
            : "--attribute-use-eff-bg-color");
    backgroundColor = statName === "legacy" ? "--legacy-color" : backgroundColor;
    backgroundColor = statName === "doom" ? "--doom-color" : backgroundColor;

    let text = type === "add"
        ? "+" + intToString(statValue, 1)
        : (statValue * 100) + "%";

    let tooltipText;

    if (type === "add") {
        tooltipText = `${text} to ${capitalizeFirst(statName)} per level.`;
    } else if (type === "eff") {
        tooltipText = `${text} of ${capitalizeFirst(statName)}'s bonus is multiplied to base efficiency`;
    } else if (type === "exp") {
        let target = actionObj.isGenerator ? "exp to level" : "progress to complete";
        tooltipText = `${text} of ${capitalizeFirst(statName)} bonus reduces ${target}`;
    }
    queueCache(`${actionVar}${statName}OutsideContainer${type}`);


    return Raw.html`
        <div id="${actionVar}${statName}OutsideContainer${type}" onclick="clickedAttName('${statName}', true)" 
             style="display:${startDisplayed};border:2px solid var(${borderColor});margin-bottom:2px;cursor:pointer;background-color:var(--overlay-color);padding:1px;">
            <div class="showthat" style="position:relative;width:35px;height:35px;background-color:var(${backgroundColor});">
                <div class="showthisUp" style="font-size:20px;">${tooltipText}</div>
                <img src="img/${statName}.svg" alt="${statName}" style="width:100%;height:100%;" />
                <div class="hyperVisible" style="position:absolute;bottom:0;left:0;width:100%;height:50%;display:flex;align-items:flex-end;
                justify-content:center;font-weight:bold;font-size:16px;">${text}</div>
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
        <div id="${actionVar}${attVar}InsideContaineradd" style="color:var(--text-muted);cursor:pointer;border:2px solid transparent;" class="backgroundWhenHover" 
            onclick="clickedAttName('${attVar}', true)">
            +<span style="color:var(--text-primary)"><b>${attObj[1]}</b></span> to 
            <img src="img/${attVar}.svg" alt="${attVar}" 
            style="margin:1px;width:20px;height:20px;vertical-align:top;background:var(--attribute-add-bg-color)" />
            <span style="color:var(--text-primary);font-weight:bold;">${capitalizeFirst(attObj[0])}</span> per level
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
            class="backgroundWhenHover" onclick="clickedAttName('${attVar}', true)">
            <span style="color:var(--text-primary)"><b>${ratio}</b></span>% of <img src="img/${attVar}.svg" alt="${attVar}" 
            style="margin:1px;width:20px;height:20px;vertical-align:top;background:var(--attribute-use-exp-bg-color)" />
            's bonus 
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
            class="backgroundWhenHover" onclick="clickedAttName('${attVar}', true)">
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

function createDownStreamSliders(actionObj, dataObj) {
    let theStr = "";
    if(!dataObj.downstreamVars) {
        return "";
    }
    for(let downstreamVar of dataObj.downstreamVars) {
        if(!data.actions[downstreamVar] || !data.actions[downstreamVar].hasUpstream) {
            continue;
        }
        let title = data.actions[downstreamVar] ? data.actions[downstreamVar].title : downstreamVar;
        let actionVar = actionObj.actionVar;

        queueCache(`${actionVar}SliderContainer${downstreamVar}`)
        queueCache(`${actionVar}SliderDownstreamTitle${downstreamVar}`)
        queueCache(`${actionVar}DownstreamSendRate${downstreamVar}`)
        queueCache(`${actionVar}DownstreamAttentionBonusLoop${downstreamVar}`)
        queueCache(`${actionVar}DownstreamAttentionBonus${downstreamVar}`)
        queueCache(`${actionVar}NumInput${downstreamVar}`)
        queueCache(`${actionVar}RangeInput${downstreamVar}`)
        queueCache(`${actionVar}SliderLabels${downstreamVar}`)
        queueCache(`${actionVar}_${downstreamVar}_slider_container_advanced`)
        queueCache(`${actionVar}_${downstreamVar}_slider_container_basic`)

        let resourceColor = getResourceColor(actionObj);

        theStr += Raw.html`
            <div id="${actionVar}SliderContainer${downstreamVar}" style="margin-bottom:5px;margin-top:5px;font-size:14px;">
                <span id="${actionVar}SliderDownstreamTitle${downstreamVar}" style="margin-bottom:10px;cursor:pointer;" 
                    onclick="actionTitleClicked('${downstreamVar}')">${title}</span>
                <span id="${actionVar}SliderLabels${downstreamVar}">
                    (+<span id="${actionVar}DownstreamSendRate${downstreamVar}" style="font-weight:bold;">0</span>/s)
                    <span id="${actionVar}DownstreamAttentionBonusLoop${downstreamVar}"
                        class="hyperVisible" style="color:mediumpurple;display:none;font-weight:bold;">x1.00</span>
                    <span id="${actionVar}DownstreamAttentionBonus${downstreamVar}" 
                        class="hyperVisible" style="color:yellow;display:none;font-weight:bold;">x2</span><br>
                </span>

                <div id="${actionVar}_${downstreamVar}_slider_container_advanced">
                    <input type="number" id="${actionVar}NumInput${downstreamVar}" value="0" min="0" max="100" 
                        style="margin-right:3px;font-size:10px;width:37px;vertical-align: top;"
                        oninput="validateInput('${actionVar}', '${downstreamVar}')" onchange="downstreamNumberChanged('${actionVar}', '${downstreamVar}')" >
                            
                    <div id="${actionVar}_${downstreamVar}_track_container" style="display:inline-block;width:220px;height:20px; 
                        user-select:none;padding: 0 10px;box-sizing:border-box;cursor:pointer;">
                        <div id="${actionVar}Track${downstreamVar}" style="margin-top:6px;width:100%;height:5px; 
                            background:linear-gradient(to right, red 10%, #ddd 10%, #ddd 90%, green 90%);position:relative;">
                            <div id="${actionVar}Thumb${downstreamVar}" style="width:10px;height:20px;background-color: 
                                ${resourceColor};position:absolute;top:50%;transform:translate(-50%, -50%);pointer-events:none;"></div>
                        </div>
                    </div>
                </div>
                
                <div id="${actionVar}_${downstreamVar}_slider_container_basic" style="display:flex;">
                    ${createBasicSliderHTML(actionVar, downstreamVar)}
                </div>
                
                
            </div>`;
    }

    return theStr;
}

function createBasicSliderHTML(actionVar, downstreamVar) {
    const options = [
        { label: 'Off', value: 0, color: 'red' },
        { label: '10%', value: 10, color: 'grey' },
        { label: '50%', value: 50, color: 'grey' },
        { label: '100%', value: 100, color: 'green' }
    ];

    let optionsHTML = '';
    for (let option of options) {
        const elementId = `${actionVar}_${downstreamVar}_option_${option.value}`;
        const initialBgColor = option.value === 0 ? 'blue' : 'transparent';
        optionsHTML += `
            <div id="${elementId}" style="border:2px solid ${option.color};padding:5px 15px;margin:2px;cursor:pointer;user-select:none;background-color:${initialBgColor};border-radius:5px;"
                onmouseover="handleSliderMouseOver('${elementId}')" onmouseout="handleSliderMouseOut('${elementId}', '${option.color}')"
                onclick="handleSliderClick('${elementId}', '${actionVar}', '${downstreamVar}', ${option.value})">
                ${option.label}
            </div>
        `;
    }
    return `${optionsHTML}`;
}

function handleSliderMouseOver(elementId) {
    document.getElementById(elementId).style.borderColor = 'yellow';
}

function handleSliderMouseOut(elementId, originalColor) {
    document.getElementById(elementId).style.borderColor = originalColor;
}

function handleSliderClick(clickedId, actionVar, downstreamVar, value) {
    // const allValues = [0, 10, 50, 100];
    // for (let val of allValues) {
    //     const optionId = `${actionVar}_${downstreamVar}_option_${val}`;
    //     document.getElementById(optionId).style.backgroundColor = 'transparent';
    // }
    //
    // document.getElementById(clickedId).style.backgroundColor = getResourceColor(data.actions[actionVar]);

    setSliderUI(actionVar, downstreamVar, value);
}

function attachCustomSliderListeners() {
    for (let actionVar in data.actions) {
        let dataObj = actionData[actionVar];
        let actionObj = data.actions[actionVar];
        if (!dataObj.downstreamVars) continue;

        for (let downstreamVar of dataObj.downstreamVars) {
            const container = document.getElementById(`${actionVar}_${downstreamVar}_track_container`);
            const thumb = document.getElementById(`${actionVar}Thumb${downstreamVar}`);

            let downstreamObj = data.actions[downstreamVar];
            if (!downstreamObj.hasUpstream) {
                continue;
            }

            container.addEventListener('mouseenter', () => {
                thumb.style.border = (actionObj.isRunning && dataObj.plane !== 2) ? "2px solid yellow" : "2px solid red";
            });

            container.addEventListener('mouseleave', () => {
                thumb.style.border = "";
            });

            const handleDrag = (event) => {
                event.preventDefault();
                const track = document.getElementById(`${actionVar}Track${downstreamVar}`);
                if (!track) return;

                const trackRect = track.getBoundingClientRect();
                let newLeft = event.clientX - trackRect.left;

                if (newLeft < 0) newLeft = 0;
                if (newLeft > trackRect.width) newLeft = trackRect.width;

                const newValue = Math.round((newLeft / trackRect.width) * 100);

                if (data.actions[actionVar][`downstreamRate${downstreamVar}`] === newValue) {
                    return;
                }

                data.actions[actionVar][`downstreamRate${downstreamVar}`] = newValue;
                setSliderUI(actionVar, downstreamVar, newValue);
            };

            const stopDrag = () => {
                document.removeEventListener('mousemove', handleDrag);
                document.removeEventListener('mouseup', stopDrag);
            };

            container.addEventListener('mousedown', (event) => {
                if(!actionObj.isRunning || dataObj.plane === 2) {
                    return;
                }
                handleDrag(event);
                document.addEventListener('mousemove', handleDrag);
                document.addEventListener('mouseup', stopDrag);
            });

            const hoverTargetContainer = document.getElementById(`${actionVar}SliderContainer${downstreamVar}`);
            const line = document.getElementById(`${actionVar}_${downstreamVar}_Line_Outer`);
            const largeVersionContainer = document.getElementById(`${downstreamVar}LargeVersionContainer`);
            const lockContainer = document.getElementById(`${downstreamVar}LockContainer`);

            hoverTargetContainer.addEventListener('mouseenter', () => {
                line.style.borderColor = "yellow";
                largeVersionContainer.style.borderColor = "yellow";
                lockContainer.style.borderColor = "yellow";
            });

            hoverTargetContainer.addEventListener('mouseleave', () => {
                line.style.borderColor = "black";
                setBorderColor(downstreamVar, selectedStat);
            });
        }
    }
}



function highlightLine(borderId) {
    const line = document.getElementById(borderId);
    let miniVersion = scaleByPlane[data.planeTabSelected] < .55;
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
        let dataObj = actionData[actionVar];
        for(let downstreamVar of dataObj.downstreamVars) {
            let downstreamDataObj = actionData[downstreamVar];
            if(!downstreamDataObj || downstreamDataObj.realX === undefined || dataObj.realX === undefined) {
                console.log(`Failed to create line from ${actionVar} to ${downstreamVar}`);
                continue;
            }
            // Calculate the centers of each object
            const x1 = dataObj.realX + 155; // 220 / 2
            const y1 = dataObj.realY + 20; // 200 / 2
            const x2 = downstreamDataObj.realX + 155; // 220 / 2
            const y2 = downstreamDataObj.realY + 20; // 200 / 2

            let sourceBackgroundColor = getResourceColor(dataObj);
            let targetBackgroundColor = getResourceColor(downstreamDataObj);
            let isDifferentMomentum = downstreamDataObj.hasUpstream === false;
            let backgroundColor = isDifferentMomentum ? `linear-gradient(to right, ${sourceBackgroundColor}, ${targetBackgroundColor})` : 'var(--line-color)';

            let borderId = `${actionVar}_${downstreamVar}_Line_Outer`;
            let lineId = `${actionVar}_${downstreamVar}_Line_Inner`;


            //Rotated retangle with inner line ready to adjust width of.
            let length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            let angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

            const labelMode = getLabelOrientation(angle);

            let topY = "-12px";
            let bottomY = "12px";
            let labelWrapperTransform = "translate(-50%, -50%) ";

            if (labelMode === "vertical") {
                labelWrapperTransform += `rotate(${-angle}deg)`;
                topY = "";
                bottomY = "";
            } else if (labelMode === "flipped") {
                labelWrapperTransform += `rotate(180deg)`;
            }

            let onclickText = isDifferentMomentum?``:`handleLineClick('${borderId}', {from: '${actionVar}', to: '${downstreamVar}'})`;
            let cursorStyle = isDifferentMomentum?``:`cursor:pointer`;

            queueCache(borderId);
            queueCache(lineId);
            queueCache(`${lineId}_Container`);
            queueCache(`${lineId}_Top`);
            queueCache(`${lineId}_Bottom`);
            let lineHTML = Raw.html`
                <div id="${borderId}" class="line-connection" 
                     style="${cursorStyle}; display:none; align-items: center; position: absolute; width: ${length}px; height: 20px; 
                        background: ${backgroundColor}; opacity: 1; transform-origin: 0 50%; transform: rotate(${angle}deg); left:${x1}px; top:${y1}px;border-radius:20px;border:2px solid black"
                     onclick="${onclickText}">
                     
                    <div id="${lineId}" style="width: 100%; height: 0; background-color: ${targetBackgroundColor}; position: relative;text-align:center;">
                        <div id="${lineId}_Container" style="display: flex;position: absolute;left: 50%;top: 50%;
                            transform:${labelWrapperTransform};flex-direction: column;align-items: center;pointer-events: none;">
                            <div id="${lineId}_Top" class="line-label-top hyperVisible" style="opacity:0;position:relative;color: yellow;font-size: 14px;font-weight: bold;line-height: 1;top:${topY}">
                                x2
                            </div>
                            <div id="${lineId}_Bottom" class="line-label-bottom hyperVisible" style="position:relative;color:mediumpurple;font-size: 12px;font-weight: bold;line-height: 1;top:${bottomY};display:none;">
                                x1.00
                            </div>
                        </div>
                    </div>
                </div>`;

            document.getElementById(`lineContainer${actionObj.plane}`).insertAdjacentHTML("beforeend", lineHTML);
        }
    }
}


function renderResetLog() {
    let rows = '';
    let index = 1;
    for (let resetLog in data.resetLogs) {
        if (!data.resetLogs.hasOwnProperty(resetLog)) continue;
        const log = data.resetLogs[resetLog];
        rows += `
            <tr>
                <td style="padding:2px 4px;">${index}</td>
                <td style="padding:2px 4px;">
                    ${!log.stage1 ? "-" : `${log.stage1.legacyGained} / ${secondsToTime(log.stage1.secondsPerReset)}` }
                </td>
                <td style="padding:2px 4px;">
                    ${!log.stage2 ? "-" : `${log.stage2.legacyGained} / ${log.stage2.ancientCoin}` }
                </td>
            </tr>
        `;
        index++;
    }
    return `
        <div>
            <div style="font-size:20px; font-weight:bold; margin:0 0 6px 0;">Recent Run Statistics (Last 5)</div>
            <table style="width:100%; border-collapse:collapse; font-size:16px;">
                <thead>
                    <tr>
                        <th style="padding:2px 4px; text-align:left;">#</th>
                        <th style="padding:2px 4px; text-align:left;">Stage 1<br>(Legacy, Time)</th>
                        <th style="padding:2px 4px; text-align:left;">Stage 2<br>(Legacy Gained, Ancient Coin Gained)</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
}





function setAllCaches() {
    queueCache("totalMomentum");
    queueCache("totalMomentum2");
    queueCache("HATLLevel");
    queueCache("secondsPerReset");
    queueCache("openUseAmuletButton");
    queueCache("openViewAmuletButton");
    queueCache("ancientCoin");
    queueCache("ancientCoin2");
    queueCache("totalSpellPower");
    queueCache("totalSpellPower2");
    queueCache("bonusTime");
    queueCache("killTheLichMenu");
    queueCache("attDisplay");
    queueCache("bonusDisplay");
    queueCache("killTheLichMenuButton2");
    queueCache("ancientCoinDisplay");
    queueCache("spellPowerDisplay");
    queueCache("jobDisplay");
    queueCache("useAmuletMenu");
    queueCache("amuletEnabledContainer");

    for(let actionVar in data.actions) {
        view.cached[actionVar + "ActionPower"] = document.getElementById(actionVar + "ActionPower");
        view.cached[actionVar + "ResourceSent"] = document.getElementById(actionVar + "ResourceSent");
        view.cached[actionVar + "ResourceTaken"] = document.getElementById(actionVar + "ResourceTaken");
    }

    for(let i = 0; i < data.planeUnlocked.length; i++) {
        queueCache(`planeButton${i}`);
    }

    clearCacheQueue();
}



let idsToCache = [];
function queueCache() {
    Array.prototype.push.apply(idsToCache, arguments);
}

function clearCacheQueue() {
    for(let id of idsToCache) {
        view.cached[id] = document.getElementById(id);
    }
    idsToCache = {};
}