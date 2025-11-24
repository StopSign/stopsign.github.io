

//==== KTL ====
actionData = {
    ...actionData,

    worry: {
        tier:0, plane:2, resourceName: "fear",
        progressMaxBase:1, progressMaxIncrease:1,
        expToLevelBase:1000, expToLevelIncrease:10,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, generatorTarget:"worry",
        unlockCost:0, visible:false, unlocked:false, isGenerator:true, generatorSpeed:2, hasUpstream: false,
        onCompleteCustom: function() {
            let actionObj = data.actions.worry;
            actionData.worry.updateMults();

            addResourceTo(data.actions["resolve"], actionObj.resourceToAdd);
            addResourceTo(data.actions["worry"], actionObj.resourceToAdd);

            views.scheduleUpdate('worryResourceSent', intToString(actionObj.resourceToAdd, 2), "textContent")
            views.scheduleUpdate('worryResourceTaken', intToString(actionObj.resourceToAdd, 2), "textContent")
        },
        updateMults: function () {
            let actionObj = data.actions.worry;
            let dataObj = actionData.worry;

            actionObj.progressGain = dataObj.generatorSpeed * (actionObj.efficiency / 100);
            actionObj.actionPower = actionObj.actionPowerBase *
                actionObj.actionPowerMult * (actionObj.efficiency/100);
            let resourceTaken = actionObj.resource * actionObj.tierMult();
            actionObj.resourceToAdd = dataObj.actionPowerFunction(resourceTaken) *
                actionObj.actionPower * actionObj.upgradeMult;
            data.actions.resolve.resourceIncrease = actionObj.resourceToAdd * actionObj.progressGain / actionObj.progressMax;
            actionObj.expToAddBase = actionObj.resourceToAdd;
            actionObj.expToAdd = actionObj.expToAddBase * actionObj.expToAddMult;
        },
        actionPowerFunction: function(resource) {
            return resource / 10;
        },
        onCompleteText: {english:Raw.html`
                +<span style="font-weight:bold;" id="worryResourceTaken">???</span> Fear to this action, and also <br>
                +<span style="font-weight:bold;" id="worryResourceSent">???</span> Bravery, added to Resolve.<br>
                `},
        onLevelAtts:[["doom", 10]],
        expAtts:[],
        efficiencyAtts:[["doom", -1]],
        extraInfo: {english:Raw.html`<br>Adds equal Fear and Bravery to this action and Resolve.<br> 
                        Amount added = 10% of Fear * Speed per complete.<br>`},
        actionTriggers: [
            ["info", "text", "Generates Bravery, to counter the rising Doom."],
        ]
    },
    resolve: {
        tier:0, plane:2, resourceName: "bravery",
        progressMaxBase:10, progressMaxIncrease:2,
        expToLevelBase:5, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true,
        unlockCost:0, visible:false, unlocked:false, hasUpstream: false,
        onLevelAtts:[["courage", 5]],
        expAtts:[["courage", 1], ["valor", 1]],
        efficiencyAtts:[["valor", .1], ["doom", -1]]
    },
    overclockTargetingTheLich: {
        tier:0, plane:2, resourceName:"momentum",
        progressMaxBase:5, progressMaxIncrease:1,
        expToLevelBase:12, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1, generatorTarget:"fightTheEvilForces",
        unlockCost:0, visible:false, unlocked:false, isGenerator:true, generatorSpeed:1,
        hasUpstream: false, hideUpstreamLine: true,
        onCompleteCustom: function() {
            let actionObj = data.actions.overclockTargetingTheLich;
            actionData.overclockTargetingTheLich.updateMults();
            let resourceTaken = actionObj.resource/10;

            if (actionObj.resourceToAdd > 0) {
                actionObj.resource -= resourceTaken;
                addResourceTo(data.actions[actionObj.generatorTarget], actionObj.resourceToAdd);
            }

            views.scheduleUpdate('overclockTargetingTheLichResourceSent', intToString(actionObj.resourceToAdd, 2), "textContent")
            views.scheduleUpdate('overclockTargetingTheLichResourceTaken', intToString(resourceTaken, 2), "textContent")
        },
        updateMults: function () {
            let actionObj = data.actions.overclockTargetingTheLich;
            let dataObj = actionData.overclockTargetingTheLich;

            actionObj.progressGain = dataObj.generatorSpeed;
            let resourceTaken = actionObj.resource/10;
            actionObj.resourceToAdd = dataObj.actionPowerFunction(resourceTaken) * actionObj.upgradeMult;
        },
        actionPowerFunction: function(resource) {
            let fightMath = Math.sqrt(resource/1e24) * data.maxSpellPower;
            if(data.actions.trainWithTeam.unlocked) {
                let teamworkMult = Math.sqrt(data.actions.trainWithTeam.resource/1000);
                if(teamworkMult < 1) {
                    teamworkMult = 1;
                }
                fightMath *= teamworkMult;
            }
            return fightMath;
        },
        onCompleteText: {english:Raw.html`
                -<span style="font-weight:bold;" id="overclockTargetingTheLichResourceTaken">???</span> Momentum was taken from this action, converted to <br>
                +<span style="font-weight:bold;" id="overclockTargetingTheLichResourceSent">???</span> Fight, added to Fight The Evil Forces.<br>
                `},
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo: {english:Raw.html`<br>Momentum Taken = 10% of current Momentum.<br>
                        Fight gain = (Momentum Taken/1e24)^.5 * Spell Power * (Teamwork/1000)^.5.`},
        actionTriggers: [
            ["info", "text", "Generates Fight to gain Ancient Coins and Legacy as you get closer to killing the lich."],
        ]
    },
    fightTheEvilForces: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:10, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true,
        actionPowerBase:1, actionPowerMult:1, actionPowerMultIncrease:1,
        unlockCost:1, visible:false, unlocked:false, isGenerator:true, generatorSpeed:1, hasUpstream: false,
        onUnlock: function() {
            setSliderUI("fightTheEvilForces", "bridgeOfBone", 100);
        },
        onLevelAtts:[["doom", 20]],
        expAtts:[],
        efficiencyAtts:[],
        actionTriggers: [
            ["info", "text", "Doom approaches."],
            ["unlock", "reveal", "bridgeOfBone"]
        ]
    },
    bridgeOfBone: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:10, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.4, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:10, visible:false, unlocked:false,
        onUnlock: function() {
            data.useAmuletButtonShowing = true;
        },
        onLevelAtts:[["legacy", 4]],
        expAtts:[["legacy", .1]],
        efficiencyAtts:[["courage", 1], ["valor", .1], ["doom", -1]],
        extraInfo:{english:"+4 * (1 + level/10) * Legacy Gain on complete."},
        actionTriggers: [
            ["unlock", "addAC", "", 5],
            ["complete", "addLegacy", "bridgeOfBone", 4],
            ["level_3", "reveal", "harvestGhostlyField"]
        ]
    },
    harvestGhostlyField: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1000, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.3, isKTL:true, purchased: true, maxLevel:12,
        unlockCost:1000, visible:false, unlocked:false,
        onLevelAtts:[["legacy", 7]],
        expAtts:[["legacy", .1]],
        efficiencyAtts:[["courage", 1], ["valor", .1], ["doom", -1]],
        extraInfo:{english:"+7 * (1 + level/10) Legacy on complete."},
        actionTriggers: [
            ["unlock", "addAC", "", 8],
            ["complete", "addLegacy", "harvestGhostlyField", 7],
            ["level_3", "reveal", "geyserFields"]
        ]
    },
    geyserFields: {
        tier:0, plane:2, resourceName:"fight", creationVersion:2,
        progressMaxBase:1e6, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.2, isKTL:true, purchased: true, maxLevel:14,
        unlockCost:1e4, visible:false, unlocked:false,
        onLevelAtts:[["legacy", 12]],
        expAtts:[["legacy", .1]],
        efficiencyAtts:[["courage", 1], ["valor", .1], ["doom", -1]],
        extraInfo:{english:"+12 * (1 + level/10) Legacy on complete."},
        actionTriggers: [
            ["unlock", "addAC", "", 13],
            ["complete", "addLegacy", "geyserFields", 12],
            ["level_3", "reveal", "destroySiegeEngine"]
        ]
    },
    destroySiegeEngine: {
        tier:0, plane:2, resourceName:"fight", creationVersion:2,
        progressMaxBase:1e9, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, isKTL:true, purchased: true, maxLevel:16,
        unlockCost:1e6, visible:false, unlocked:false,
        onLevelAtts:[["legacy", 20]],
        expAtts:[["legacy", .1]],
        efficiencyAtts:[["courage", 1], ["valor", .1], ["doom", -1]],
        extraInfo:{english:"+20 * (1 + level/10) Legacy on complete."},
        actionTriggers: [
            ["unlock", "addAC", "", 21],
            ["complete", "addLegacy", "destroySiegeEngine", 20],
            ["level_3", "reveal", "destroyEasternMonolith"]
        ]
    },
    destroyEasternMonolith: {
        tier:0, plane:2, resourceName:"fight", creationVersion:2,
        progressMaxBase:1e11, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.05, isKTL:true, purchased: true, maxLevel:3,
        unlockCost:1e8, visible:false, unlocked:false,
        onUnlock: function() {
            revealUpgrade('rememberWhatIDid')
            revealUpgrade('stopBeingSoTense')
            revealUpgrade('createABetterFoundation')
            revealUpgrade('workHarder')
            revealUpgrade('haveBetterConversations')
            revealUpgrade('sparkMoreMana')
            revealUpgrade('studyHarder')
        },
        onLevelAtts:[["legacy", 1000]],
        expAtts:[["legacy", .1]],
        efficiencyAtts:[["courage", 1], ["valor", .1], ["doom", -1]],
        extraInfo:{english:"+1000 * (1 + level/10) Legacy on complete."},
        actionTriggers: [
            ["info", "text", "On Unlock: Show 7 more upgrades."],
            ["unlock", "addAC", "", 50],
            ["complete", "addLegacy", "destroyEasternMonolith", 1000],
            ["level_1", "reveal", "stopDarknessRitual"]
        ]
    },
    stopDarknessRitual: {
        tier:0, plane:2, resourceName:"fight", creationVersion:2,
        progressMaxBase:2e13, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.04, isKTL:true, purchased: true, maxLevel:12,
        unlockCost:2e9, visible:false, unlocked:false,
        onLevelAtts:[["legacy", 60]],
        expAtts:[["legacy", .1]],
        efficiencyAtts:[["courage", 1], ["valor", .1], ["doom", -1]],
        extraInfo:{english:"+60 * (1 + level/10) Legacy on complete."},
        actionTriggers: [
            ["unlock", "addAC", "", 33],
            ["complete", "addLegacy", "stopDarknessRitual", 60],
            ["level_3", "reveal", "protectTheSunstone"]
        ]
    },
    protectTheSunstone: {
        tier:0, plane:2, resourceName:"fight", creationVersion:2,
        progressMaxBase:2e15, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.03, isKTL:true, purchased: true, maxLevel:15,
        unlockCost:2e10, visible:false, unlocked:false,
        onLevelAtts:[["legacy", 100]],
        expAtts:[["legacy", .1]],
        efficiencyAtts:[["courage", 1], ["valor", .1], ["doom", -1]],
        extraInfo:{english:"+100 * (1 + level/10) Legacy on complete."},
        actionTriggers: [
            ["unlock", "addAC", "", 54],
            ["complete", "addLegacy", "protectTheSunstone", 100],
            ["level_3", "reveal", "silenceDeathChanters"]
        ]
    },
    silenceDeathChanters: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:2e17, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.02, isKTL:true, purchased: true, maxLevel:18,
        unlockCost:2e11, visible:false, unlocked:false,
        onLevelAtts:[["legacy", 150]],
        expAtts:[["legacy", .1]],
        efficiencyAtts:[["courage", 1], ["valor", .1], ["doom", -1]],
        extraInfo:{english:"+150 * (1 + level/10) Legacy on complete."},
        actionTriggers: [
            ["unlock", "addAC", "", 87],
            ["complete", "addLegacy", "silenceDeathChanters", 150],
            // ["level_3", "reveal", "breakFleshBarricade"]
        ]
    },
    breakFleshBarricade: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            revealAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    conquerTheGatekeepers: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            revealAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    unhookSacrificialCages: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            revealAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    purgeUnholyRelics: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            revealAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    destroyWesternMonolith: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            revealAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    destroyFleshGrowths: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            revealAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    crackCorruptedEggs: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            revealAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    kiteTheAbomination: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            revealAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    collapseCorpseTower: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            revealAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    surviveLivingSiegeEngine: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            revealAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    destroySouthernMonolith: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            revealAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    burnFleshPits: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            revealAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    openSoulGate: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            revealAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    shatterTraps: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            revealAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    killTheArchitect: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            revealAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    destroyNorthernMonolith: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            revealAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    breakOutOfEndlessMaze: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            revealAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    killDopplegangers: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            revealAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    killDeathKnights: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            revealAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    silenceDoomScribe: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            revealAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    removeWards: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            revealAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    fightTheLich: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            revealAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    killTheLich: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;

        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            revealAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
    shatterPhylactery: {
        tier:0, plane:2, resourceName:"fight",
        progressMaxBase:1e10, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, maxLevel:10,
        unlockCost:1e9, visible:false, unlocked:false,
        onUnlock: function() {
            data.ancientCoin += 1;
        },
        onCompleteCustom:function() {
            data.legacy += 1;
        },
        onLevelCustom: function() {
            revealAction('');
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[],
        extraInfo:{english:"1 Legacy per complete."},
        unlockMessage:{english:"On unlock, +1 Ancient Coins."}
    },
}
